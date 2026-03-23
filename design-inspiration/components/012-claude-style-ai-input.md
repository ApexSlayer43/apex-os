# 012 — Claude-Style AI Chat Input (File Upload + Paste Detection + Model Selector)

**Source:** 21st.dev
**Type:** Feature component — production-grade AI chat input with full file/paste handling
**Stack:** React, Tailwind CSS, TypeScript, shadcn/ui, lucide-react
**Dependencies:** `lucide-react`, `@radix-ui/react-slot`, `class-variance-authority`
**Install:** `npm install lucide-react @radix-ui/react-slot class-variance-authority`

## What Makes This Hit

This isn't a styled textarea — it's a complete evidence intake UI in miniature. Every design decision maps to a production problem: large paste detection, file type discrimination, upload state management, send gating, and model selection. The visual execution (warm dark palette, amber send button, 125px file cards) is Claude's actual design language, reverse-engineered and componentized.

---

## The Auto-Height Textarea Pattern

```tsx
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";   // reset first
    const maxHeight = parseInt(getComputedStyle(textareaRef.current).maxHeight, 10) || 120;
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
  }
}, [message]);
```

The two-step pattern is critical:
1. **Reset to "auto"** — collapses the textarea to its minimum height before measurement. Without this, the height only ever grows (deleting lines doesn't shrink it).
2. **Set to scrollHeight** — the natural content height. Capped at `maxHeight` via `Math.min`.

`maxHeight` comes from computed styles, not a hardcoded value — so CSS controls the cap. The `rows={1}` attribute sets the minimum to one line. The CSS class `max-h-[120px]` defines the cap. The JS respects both.

**Why not a textarea library?** Because libraries add resize handles, scroll indicators, and extra DOM nodes. This 8-line approach gives full control with zero overhead.

---

## Large Paste Detection — Intercepting the Clipboard

```tsx
const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  // Path 1: Pasted file (screenshot, copied image)
  const fileItems = Array.from(e.clipboardData.items).filter(item => item.kind === "file");
  if (fileItems.length > 0) {
    e.preventDefault();
    // convert to FileList via DataTransfer and route to handleFileSelect
    return;
  }

  // Path 2: Long text paste
  const textData = e.clipboardData.getData("text");
  if (textData && textData.length > PASTE_THRESHOLD) {
    e.preventDefault();
    setMessage(message + textData.slice(0, PASTE_THRESHOLD) + "...");
    setPastedContent(prev => [...prev, { content: textData, ... }]);
  }
  // Path 3: Short text — default browser paste, no e.preventDefault()
};
```

Three distinct paths:
1. **File paste** (Cmd+C on an image, screenshot): `clipboardData.items` contains file-kind items. Use `DataTransfer` to reconstruct a `FileList` and route through the normal file handler.
2. **Long text paste**: `length > PASTE_THRESHOLD` (200 chars). Creates a `PastedContent` card. Shows first 200 chars in the textarea as a truncated preview. Full content stored in state.
3. **Short text paste**: No interception. Default browser behavior handles it.

**The `DataTransfer` reconstruction trick for file pastes:**
```tsx
const dataTransfer = new DataTransfer();
pastedFiles.forEach(file => dataTransfer.items.add(file));
handleFileSelect(dataTransfer.files);
```
`ClipboardItem.getAsFile()` returns a `File` but not a `FileList`. `handleFileSelect` needs a `FileList`. `new DataTransfer()` with `.items.add()` gives you a synthetic `FileList` from arbitrary `File` objects. This is the bridge.

---

## Textual File Detection — Dual Strategy

```tsx
const isTextualFile = (file: File): boolean => {
  const textualTypes = ["text/", "application/json", ...];
  const textualExtensions = ["md", "py", "tsx", "dockerfile", "readme", ...];

  const isTextualMimeType = textualTypes.some(type => file.type.toLowerCase().startsWith(type));
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isTextualExtension = textualExtensions.includes(extension) || ...;

  return isTextualMimeType || isTextualExtension;
};
```

Why both checks? Because MIME types are unreliable for text files:
- `Dockerfile` has no extension — MIME type is empty string or `application/octet-stream`
- `.tsx` files often get `application/x-typescript` or nothing depending on OS
- `.yml` files might come through as `text/plain` or `application/octet-stream`

Extension check catches what MIME misses. MIME check catches what extension misses (files without extensions, unusual MIME-to-extension mappings). Together they cover the real-world file handling surface.

For textual files, the component asynchronously reads the content via `FileReader` and stores it in `textContent`. The card shows a spinner until content is available, then renders the first 150 chars at 8px — a code preview in a 125px card.

---

## The 125×125px File Card System

All three card types (image, generic binary, textual/pasted) share the same 125×125px container with the same overlay pattern:

```tsx
// The overlay pattern — used in all three card types
<div className="absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
  <p className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">
    {badge}  {/* PASTED, MD, TSX, ZIP, etc. */}
  </p>
  {/* Hover actions — top-right, opacity-0 → group-hover:opacity-100 */}
  <div className="group-hover:opacity-100 opacity-0 ... absolute top-2 right-2">
    <CopyButton /> <RemoveButton />
  </div>
</div>
```

**The gradient overlay:** `bg-gradient-to-b to-[#30302E] from-transparent` creates a dark fade from bottom to transparent top. This:
- Ensures the badge (bottom-left) always has legible contrast regardless of content
- Lets the top portion of the card show through (code text, image) without blocking
- Matches Claude's exact card style — `#30302E` is the warm dark background color

**Why `opacity-0 group-hover:opacity-100` instead of conditional render?** The overlay is always in the DOM — no layout shift on hover. `opacity` transitions are GPU-composited (no reflow). The `group` class on the parent propagates hover state to children without JavaScript.

**Why 8px font for content previews?** At 8px (`text-[8px]`), approximately 150 characters of text fit inside 125px with `whitespace-pre-wrap`. This turns a tiny card into a readable code preview. The content is still scannable — enough to recognize file contents — without needing expansion.

---

## Send Button State — The Amber Transition

```tsx
<Button
  className={cn(
    "h-9 w-9 p-0 flex-shrink-0 rounded-md transition-colors",
    canSend
      ? "bg-amber-600 hover:bg-amber-700 text-white"
      : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
  )}
  disabled={!canSend}
>
  <ArrowUp className="h-5 w-5" />
</Button>
```

`canSend = hasContent && !disabled && !files.some(f => f.uploadStatus === "uploading")`

The button transitions from `bg-zinc-700 text-zinc-500` (dead gray) to `bg-amber-600 text-white` (warm amber) the moment content appears. This is the primary affordance that tells users "the interface is ready." The color change is the send button's "go signal."

**Why amber?** Claude uses amber as its action color — it's warm (not cold blue), slightly aggressive (not passive gray), and immediately distinguishable. It communicates "this will do something" without being alarming (red).

**`cursor-not-allowed` on disabled:** The default `disabled` attribute shows the browser's disabled cursor. `cursor-not-allowed` is more explicit — users know they can't click vs. the element being broken.

---

## Upload State Simulation Pattern

```tsx
setFiles(prev => prev.map(f => f.id === fileToUpload.id ? { ...f, uploadStatus: "uploading" } : f));

let progress = 0;
const interval = setInterval(() => {
  progress += Math.random() * 20 + 5;
  if (progress >= 100) {
    clearInterval(interval);
    setFiles(prev => prev.map(f => f.id === fileToUpload.id
      ? { ...f, uploadStatus: "complete", uploadProgress: 100 }
      : f
    ));
  } else {
    setFiles(prev => prev.map(f => f.id === fileToUpload.id
      ? { ...f, uploadProgress: progress }
      : f
    ));
  }
}, 150);
```

The ID-based functional state update pattern (`prev.map(f => f.id === id ? {...f, update} : f)`) is the correct way to update a specific item in a state array. Never mutate directly. Each `setFiles` call produces a new array with the targeted item updated.

**Replace with real upload:**
```tsx
const abortController = new AbortController();
const xhr = new XMLHttpRequest();
xhr.upload.onprogress = (e) => {
  const progress = (e.loaded / e.total) * 100;
  setFiles(prev => prev.map(f => f.id === id ? { ...f, uploadProgress: progress } : f));
};
```
The `abortController` is already on the `FileWithPreview` type — wiring it to cancel is a TODO in the source.

---

## Model Selector — Click-Outside Without a Library

```tsx
const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
```

Standard click-outside pattern:
- Attach `mousedown` to `document` (not `click` — fires before the click completes)
- Check `!ref.current.contains(event.target)` — if target is outside the ref, close
- Cleanup in the return function — removes the listener when component unmounts

**`bottom-full` positioning:** The dropdown opens above the trigger button (`bottom-full` + `mb-2`). This prevents it from being clipped by a card's `overflow: hidden`. Always anchor dropdowns away from the overflow edge.

**No Radix Popover here:** This is intentional — the dropdown is simple enough that Radix would be overhead. For a production component with portal, keyboard navigation, and accessibility, replace with Radix `Popover` or `Select`.

---

## IME Composition Guard

```tsx
if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
  e.preventDefault();
  handleSend();
}
```

`e.nativeEvent.isComposing` is true during Chinese/Japanese/Korean IME composition — when the user is in the middle of composing a character from keystrokes (e.g. typing "ni" to get "你"). Without this guard, pressing Enter to confirm an IME character would also trigger send. This is a common bug in AI chat inputs.

---

## Drag and Drop — `pointer-events-none` on the Overlay

```tsx
{isDragging && (
  <div className="absolute inset-0 z-50 ... pointer-events-none">
    Drop files here
  </div>
)}
```

`pointer-events-none` on the drag overlay is critical. Without it, as soon as the blue overlay renders (on `dragover`), the drag enters the overlay instead of the outer wrapper — firing `dragleave` on the wrapper, setting `isDragging = false`, which unmounts the overlay, which re-fires `dragover` on the wrapper... a render loop/flicker. `pointer-events-none` prevents the overlay from interfering with drag events.

---

## File Input Value Reset

```tsx
onChange={(e) => {
  handleFileSelect(e.target.files);
  if (e.target) e.target.value = "";  // CRITICAL
}}
```

Without `e.target.value = ""`, if a user selects a file, removes it from the preview, then tries to select the same file again, the browser sees no change in the input value and doesn't fire `onChange`. Resetting to empty string after each selection ensures every selection triggers the event.

---

## Object URL Lifecycle

```tsx
// On creation (for image files)
preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,

// On remove
if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);

// On send (all previews)
files.forEach(file => { if (file.preview) URL.revokeObjectURL(file.preview); });
```

`URL.createObjectURL` creates a blob URL held in browser memory until explicitly released. Without `revokeObjectURL`, every image preview creates a permanent memory leak that persists for the session. Revoke must happen in three places: removal, send, and unmount.

---

## Design Principles to Extract

1. **Two-step auto-height textarea** — reset to "auto" then set scrollHeight. One step only grows. Both steps shrink and grow correctly.
2. **Three-path paste handler** — files / long text / short text. Each path handled explicitly. `e.preventDefault()` only on paths 1 and 2 — path 3 falls through to native.
3. **DataTransfer synthetic FileList** — use `new DataTransfer()` + `.items.add()` to convert `File[]` into `FileList` when an API requires it.
4. **Dual file detection (MIME + extension)** — MIME types are unreliable for developer files. Always check both. Extension check catches Dockerfiles, Makefiles, `.tsx` files that MIME would miss.
5. **ID-based functional state updates** — `prev.map(f => f.id === id ? {...f, update} : f)` is the canonical pattern for targeted updates in React state arrays.
6. **`canSend` boolean gate** — derive a single boolean from all blocking conditions (empty, uploading, disabled). Use it for button appearance AND disabled prop AND cursor. Single source of truth.
7. **Amber for "action ready"** — color shift from gray to amber on state change is the primary send affordance. No animation, no bounce — just color. It's enough.
8. **Gradient overlay on file cards** — `bg-gradient-to-b to-[#30302E] from-transparent` creates a dark lower band without obscuring card content above. Always legible badge placement.
9. **8px font for content previews** — `text-[8px]` fits ~150 chars in a 125px card. Scannable without expansion. Shows enough to confirm content type.
10. **`opacity-0 group-hover:opacity-100` for action buttons** — GPU-composited opacity transition, no layout shift, no conditional render overhead. Actions reveal on hover.
11. **`pointer-events-none` on drag overlays** — prevents drag enter/leave loops as the overlay renders over the drag target.
12. **File input value reset** — `e.target.value = ""` after every file selection ensures same-file reselect works. Without it, the second selection of the same file silently fails.
13. **Object URL lifecycle management** — revoke on remove, revoke on send, revoke on unmount. Three surfaces. Missing any one leaks memory.
14. **IME composition guard** — `!e.nativeEvent.isComposing` prevents Enter from triggering send during CJK input composition. Essential for any app with international users.
15. **`bottom-full` dropdown positioning** — opens above the trigger, not below. Prevents dropdown from being clipped by card overflow. Prefer upward-opening for bottom-anchored UI.
16. **Click-outside via `mousedown` not `click`** — `mousedown` fires before `click`, so the dropdown closes before any click handler on the now-closed dropdown fires. Prevents ghost click issues.
17. **`cursor-not-allowed` on disabled** — explicit visual feedback beyond the default disabled state. Users understand "can't click" vs "element is broken."
18. **Font-serif font-light greeting** — Claude's personalized greeting uses serif typeface at light weight. Creates warmth and distinction vs. the UI's sans-serif body. Extract for any AI product "hello" moment.

---

## AetherTrace Adaptation

This component maps directly to AetherTrace's **evidence capture** interface — the moment a subcontractor submits evidence into the chain.

**Textarea placeholder:** "Describe the event. What happened, when, who was present."

**Model selector → Chain type selector:**
```
Standard Chain    — SHA-256 + timestamp, court-ready
Certified Chain   — CMMC-aligned, federal projects
Federal Package   — DoD audit standards (SDVOSB)
```

**File type filtering:** Only allow evidence-relevant types:
```tsx
acceptedFileTypes={["image/", "application/pdf", ".pdf", ".png", ".jpg", ".jpeg", ".heic"]}
```

**Paste handler → Contract/document capture:** The large paste detection is perfect for when a sub pastes a GC's written change order into the chat. The text becomes a PastedContent card — immutable, timestamped, saved to chain.

**Send button copy:** Change "Send message" title to "Submit to Chain" — the amber button color maps perfectly to AetherTrace's action orange.

**Card tray:** Evidence attachments (photos, PDFs, inspection forms) displayed in the 125px card row before submission. The gradient overlay + badge approach works for "PHOTO", "PDF", "REPORT" badges.

**Background:** Change `bg-[#30302E]` to `bg-[#0a1628]` (AetherTrace deep navy) for brand alignment. The warm zinc palette becomes cool steel.

---

## Raw Code Reference
See: `012-claude-style-ai-input-code.tsx`
