// SOURCE: 21st.dev — Claude-Style AI Chat Input
// DEPS: lucide-react, @radix-ui/react-slot, class-variance-authority
// STACK: React + Tailwind CSS + TypeScript + shadcn/ui
// INSTALL: npm install lucide-react @radix-ui/react-slot class-variance-authority
// FILES:  /components/ui/claude-style-ai-input.tsx  (this file)
//         /components/ui/button.tsx                 (originui/button)
//         /components/ui/textarea.tsx               (originui/textarea)
//         /lib/utils.ts                             (shadcn cn utility)

// ─── SETUP NOTES ──────────────────────────────────────────────────────────────
// Requires shadcn project structure:
//   npx shadcn@latest init
//
// All components MUST live in /components/ui/ — this is the shadcn contract.
// Diverging breaks the @/components/ui import path used throughout the ecosystem.
// The /lib/utils.ts file ships with shadcn init and provides the cn() utility.
//
// NOTE: This component uses Math.random() for IDs. In production, replace with:
//   import { nanoid } from "nanoid"
//   npm install nanoid

"use client";  // Required for Next.js App Router — uses browser APIs (clipboard, FileReader, etc.)

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  SlidersHorizontal,
  ArrowUp,
  X,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Copy,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────
// Exported so consuming components can type their callbacks correctly.

// FileWithPreview: extends a File object with UI state
// uploadStatus drives the card's loading/error/complete visual states
// abortController enables in-flight cancellation (wired up but not fully implemented)
// textContent stores the parsed text of textual files (markdown, code, etc.)
export interface FileWithPreview {
  id: string;
  file: File;
  preview?: string;            // object URL for images (must be revoked on cleanup)
  type: string;
  uploadStatus: "pending" | "uploading" | "complete" | "error";
  uploadProgress?: number;
  abortController?: AbortController;
  textContent?: string;        // parsed text for code/text file previews
}

// PastedContent: captures large pastes that exceed the PASTE_THRESHOLD
// These become standalone cards instead of being injected into the textarea
export interface PastedContent {
  id: string;
  content: string;
  timestamp: Date;
  wordCount: number;
}

// ModelOption: data shape for the model selector dropdown
export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;   // optional badge (e.g. "Latest", "Beta")
}

// ChatInputProps: clean public API for the main component
interface ChatInputProps {
  onSendMessage?: (
    message: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[]
  ) => void;
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;
  maxFileSize?: number;         // in bytes
  acceptedFileTypes?: string[];
  models?: ModelOption[];
  defaultModel?: string;
  onModelChange?: (modelId: string) => void;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024;   // 50MB
const PASTE_THRESHOLD = 200;               // chars — pastes longer than this become cards

// Default model list — mirrors real Claude models for plug-and-play use
const DEFAULT_MODELS_INTERNAL: ModelOption[] = [
  { id: "claude-sonnet-4",  name: "Claude Sonnet 4",  description: "Balanced model",       badge: "Latest" },
  { id: "claude-opus-3.5",  name: "Claude Opus 3.5",  description: "Highest intelligence" },
  { id: "claude-haiku-3",   name: "Claude Haiku 3",   description: "Fastest responses" },
];

// ─── FILE TYPE HELPERS ────────────────────────────────────────────────────────

// Icon selection by MIME type — maps to lucide-react icons
const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-zinc-400" />;
  if (type.startsWith("video/")) return <Video className="h-5 w-5 text-zinc-400" />;
  if (type.startsWith("audio/")) return <Music className="h-5 w-5 text-zinc-400" />;
  if (type.includes("zip") || type.includes("rar") || type.includes("tar"))
    return <Archive className="h-5 w-5 text-zinc-400" />;
  return <FileText className="h-5 w-5 text-zinc-400" />;
};

// Human-readable file size (1024-based)
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Truncated MIME type label for the badge overlay on file cards
// Handles long MIME types like "vnd.openxmlformats-officedocument..."
const getFileTypeLabel = (type: string): string => {
  const parts = type.split("/");
  let label = parts[parts.length - 1].toUpperCase();
  if (label.length > 7 && label.includes("-")) {
    label = label.substring(0, label.indexOf("-"));
  }
  if (label.length > 10) {
    label = label.substring(0, 10) + "...";
  }
  return label;
};

// ─── TEXTUAL FILE DETECTION ───────────────────────────────────────────────────
// Determines if a file should be read as text and shown with a code preview.
// Uses BOTH MIME type AND file extension — because many textual files
// (Dockerfile, Makefile, .tsx) have generic or missing MIME types.
const isTextualFile = (file: File): boolean => {
  const textualTypes = [
    "text/",
    "application/json",
    "application/xml",
    "application/javascript",
    "application/typescript",
  ];
  const textualExtensions = [
    "txt", "md", "py", "js", "ts", "jsx", "tsx", "html", "htm",
    "css", "scss", "sass", "json", "xml", "yaml", "yml", "csv",
    "sql", "sh", "bash", "php", "rb", "go", "java", "c", "cpp",
    "h", "hpp", "cs", "rs", "swift", "kt", "scala", "r", "vue",
    "svelte", "astro", "config", "conf", "ini", "toml", "log",
    "gitignore", "dockerfile", "makefile", "readme",
  ];

  const isTextualMimeType = textualTypes.some((type) =>
    file.type.toLowerCase().startsWith(type)
  );
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isTextualExtension =
    textualExtensions.includes(extension) ||
    file.name.toLowerCase().includes("readme") ||
    file.name.toLowerCase().includes("dockerfile") ||
    file.name.toLowerCase().includes("makefile");

  return isTextualMimeType || isTextualExtension;
};

// FileReader wrapper — returns file content as a string Promise
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// Get file extension as uppercase label for badge display
const getFileExtension = (filename: string): string => {
  const extension = filename.split(".").pop()?.toUpperCase() || "FILE";
  return extension.length > 8 ? extension.substring(0, 8) + "..." : extension;
};

// ─── FILE PREVIEW CARD ────────────────────────────────────────────────────────
// Dispatcher: routes to TextualFilePreviewCard for code/text files,
// or renders image preview / generic file card for binary/media files.
//
// Design pattern: 125×125px fixed-size card with absolute overlay at the bottom.
// The overlay is `bg-gradient-to-b to-[#30302E] from-transparent` — a dark
// gradient from the bottom that fades to transparent at the top.
// This lets the file content (image, code preview) show through the top,
// while the badge sits cleanly on the dark bottom band.
const FilePreviewCard: React.FC<{
  file: FileWithPreview;
  onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith("image/");
  const isTextual = isTextualFile(file.file);

  if (isTextual) {
    return <TextualFilePreviewCard file={file} onRemove={onRemove} />;
  }

  return (
    <div
      className={cn(
        "relative group bg-zinc-700 border w-fit border-zinc-600 rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden",
        isImage ? "p-0" : "p-3"
      )}
    >
      <div className="flex items-start gap-3 size-[125px] overflow-hidden">
        {/* Image preview: object-cover fills the card, no letterboxing */}
        {isImage && file.preview ? (
          <div className="relative size-full rounded-md overflow-hidden bg-zinc-600">
            <img
              src={file.preview || "/placeholder.svg"}
              alt={file.file.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <></>
        )}
        {/* Non-image, non-textual files: gradient overlay + type badge */}
        {!isImage && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
                <p className="absolute bottom-2 left-2 capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">
                  {getFileTypeLabel(file.type)}
                </p>
              </div>
              {file.uploadStatus === "uploading" && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
              )}
              {file.uploadStatus === "error" && (
                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
              )}
            </div>
            <p className="max-w-[90%] text-xs font-medium text-zinc-100 truncate" title={file.file.name}>
              {file.file.name}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">{formatFileSize(file.file.size)}</p>
          </div>
        )}
      </div>
      {/* Remove button — visible only on hover via opacity-0 → group-hover:opacity-100 */}
      <Button
        size="icon"
        variant="outline"
        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

// ─── PASTED CONTENT CARD ──────────────────────────────────────────────────────
// Shows the first 150 chars of pasted text at 8px font size.
// The tiny font lets a surprising amount of text show in 125×125px.
// The gradient overlay + "PASTED" badge follows the same pattern as FilePreviewCard.
// Copy button on hover — writes the full content to clipboard.
const PastedContentCard: React.FC<{
  content: PastedContent;
  onRemove: (id: string) => void;
}> = ({ content, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewText = content.content.slice(0, 150);
  const needsTruncation = content.content.length > 150;

  return (
    <div className="bg-zinc-700 border border-zinc-600 relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
      {/* Text content at 8px — fits ~150 chars in the card */}
      <div className="text-[8px] text-zinc-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
        {isExpanded || !needsTruncation ? content.content : previewText}
        {!isExpanded && needsTruncation && "..."}
      </div>
      {/* Gradient overlay — badges at bottom, action buttons top-right on hover */}
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
        <p className="capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">
          PASTED
        </p>
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-2 right-2">
          <Button
            size="icon"
            variant="outline"
            className="size-6"
            onClick={() => navigator.clipboard.writeText(content.content)}
            title="Copy content"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-6"
            onClick={() => onRemove(content.id)}
            title="Remove content"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── MODEL SELECTOR DROPDOWN ──────────────────────────────────────────────────
// Controlled dropdown that opens above the input (bottom-full).
// Click-outside handler uses a ref + mousedown listener — standard pattern
// for dropdowns without a portal/Radix dependency.
// ChevronDown rotates 180° when open via conditional class.
// Selected model gets a Check icon + bg-zinc-700 highlight.
const ModelSelectorDropdown: React.FC<{
  models: ModelOption[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}> = ({ models, selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModelData = models.find((m) => m.id === selectedModel) || models[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click-outside: close dropdown when user clicks anywhere outside the ref
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate max-w-[150px] sm:max-w-[200px]">
          {selectedModelData.name}
        </span>
        {/* ChevronDown rotates when open — single class toggle, no animation library */}
        <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {/* Dropdown: absolute bottom-full = opens above the trigger */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 p-2">
          {models.map((model) => (
            <button
              key={model.id}
              className={cn(
                "w-full text-left p-2.5 rounded-md hover:bg-zinc-700 transition-colors flex items-center justify-between",
                model.id === selectedModel && "bg-zinc-700"
              )}
              onClick={() => { onModelChange(model.id); setIsOpen(false); }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-100">{model.name}</span>
                  {/* Badge: soft blue pill — "Latest", "Beta", etc. */}
                  {model.badge && (
                    <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
                      {model.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{model.description}</p>
              </div>
              {/* Check icon on selected model */}
              {model.id === selectedModel && (
                <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── TEXTUAL FILE PREVIEW CARD ────────────────────────────────────────────────
// Shows the file's actual text content (read via FileReader) at 8px font.
// While the content is loading, shows a Loader2 spinner.
// When ready, shows the first 150 chars of the file with "..." truncation.
// The badge shows the file extension (MD, PY, TSX, etc.) not the MIME type.
const TextualFilePreviewCard: React.FC<{
  file: FileWithPreview;
  onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewText = file.textContent?.slice(0, 150) || "";
  const needsTruncation = (file.textContent?.length || 0) > 150;
  const fileExtension = getFileExtension(file.file.name);

  return (
    <div className="bg-zinc-700 border border-zinc-600 relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
      <div className="text-[8px] text-zinc-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
        {file.textContent ? (
          <>
            {isExpanded || !needsTruncation ? file.textContent : previewText}
            {!isExpanded && needsTruncation && "..."}
          </>
        ) : (
          // Loading state: textContent hasn't been read yet (async FileReader)
          <div className="flex items-center justify-center h-full text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
        {/* File extension badge — shows TSX, MD, PY, etc. */}
        <p className="capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">
          {fileExtension}
        </p>
        {/* Upload status — spinner or error icon in top-left */}
        {file.uploadStatus === "uploading" && (
          <div className="absolute top-2 left-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
          </div>
        )}
        {file.uploadStatus === "error" && (
          <div className="absolute top-2 left-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
          </div>
        )}
        {/* Action buttons on hover */}
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-2 right-2">
          {file.textContent && (
            <Button
              size="icon"
              variant="outline"
              className="size-6"
              onClick={() => navigator.clipboard.writeText(file.textContent || "")}
              title="Copy content"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="icon"
            variant="outline"
            className="size-6"
            onClick={() => onRemove(file.id)}
            title="Remove file"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN CHAT INPUT COMPONENT ────────────────────────────────────────────────
// The orchestrating component. Manages:
// - Textarea with auto-height and controlled value
// - File attachment (via button click → hidden input, and drag/drop)
// - Paste detection (large pastes become PastedContent cards)
// - Upload simulation (setInterval progress, would be replaced by real fetch)
// - Model selector
// - Send gate (canSend prevents send during uploads or when empty)
const ClaudeChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "How can I help you today?",
  maxFiles = MAX_FILES,
  maxFileSize = MAX_FILE_SIZE,
  acceptedFileTypes,
  models = DEFAULT_MODELS_INTERNAL,
  defaultModel,
  onModelChange,
}) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState(defaultModel || models[0]?.id || "");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── AUTO-HEIGHT TEXTAREA ─────────────────────────────────────────────────
  // Reset to "auto" first, then set to scrollHeight — this correctly shrinks
  // when lines are deleted. Without the "auto" reset, height only grows.
  // Capped at maxHeight (from computed styles, fallback 120px).
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight =
        Number.parseInt(getComputedStyle(textareaRef.current).maxHeight, 10) || 120;
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight
      )}px`;
    }
  }, [message]);

  // ── FILE HANDLER ──────────────────────────────────────────────────────────
  // Accepts FileList from: file input onChange, paste event, drag/drop.
  // Enforces maxFiles, maxFileSize, acceptedFileTypes guards.
  // For textual files: kicks off async FileReader to populate textContent.
  // For all files: simulates upload progress with setInterval.
  //
  // NOTE: id uses Math.random() — replace with nanoid() in production.
  // Math.random() is not collision-safe for large file lists.
  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const currentFileCount = files.length;
      if (currentFileCount >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      const availableSlots = maxFiles - currentFileCount;
      const filesToAdd = Array.from(selectedFiles).slice(0, availableSlots);

      if (selectedFiles.length > availableSlots) {
        alert(`You can only add ${availableSlots} more file(s).`);
      }

      // Validate and map files to FileWithPreview
      const newFiles = filesToAdd
        .filter((file) => {
          if (file.size > maxFileSize) {
            alert(`${file.name} exceeds size limit of ${formatFileSize(maxFileSize)}.`);
            return false;
          }
          if (
            acceptedFileTypes &&
            !acceptedFileTypes.some(
              (type) => file.type.includes(type) || type === file.name.split(".").pop()
            )
          ) {
            alert(`File type for ${file.name} not supported.`);
            return false;
          }
          return true;
        })
        .map((file) => ({
          id: Math.random(),  // TODO: replace with nanoid()
          file,
          // createObjectURL for images — must be revoked when file is removed or sent
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          type: file.type || "application/octet-stream",
          uploadStatus: "pending" as const,
          uploadProgress: 0,
        }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Post-add: async operations per file
      newFiles.forEach((fileToUpload) => {
        // Read text content for textual files (async, updates state when done)
        if (isTextualFile(fileToUpload.file)) {
          readFileAsText(fileToUpload.file)
            .then((textContent) => {
              setFiles((prev) =>
                prev.map((f) => f.id === fileToUpload.id ? { ...f, textContent } : f)
              );
            })
            .catch(() => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === fileToUpload.id ? { ...f, textContent: "Error reading file content" } : f
                )
              );
            });
        }

        // Start upload status immediately
        setFiles((prev) =>
          prev.map((f) => f.id === fileToUpload.id ? { ...f, uploadStatus: "uploading" } : f)
        );

        // Simulate upload progress — replace with real fetch + progress events
        // Real implementation: use XMLHttpRequest with onprogress, or fetch + ReadableStream
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20 + 5;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileToUpload.id
                  ? { ...f, uploadStatus: "complete", uploadProgress: 100 }
                  : f
              )
            );
          } else {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileToUpload.id ? { ...f, uploadProgress: progress } : f
              )
            );
          }
        }, 150);
      });
    },
    [files.length, maxFiles, maxFileSize, acceptedFileTypes]
  );

  // ── FILE REMOVAL ──────────────────────────────────────────────────────────
  // Revoke object URLs on removal to prevent memory leaks.
  // In production: also call abortController.abort() to cancel in-flight uploads.
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);  // memory leak prevention
      }
      // TODO: fileToRemove.abortController?.abort()
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  // ── PASTE HANDLER ──────────────────────────────────────────────────────────
  // Two behaviors:
  // 1. If paste contains FILES: intercept + add to file list via handleFileSelect
  // 2. If paste contains LONG TEXT (>PASTE_THRESHOLD chars): intercept + create
  //    a PastedContent card. Short pastes fall through to default textarea behavior.
  //
  // The text interception also adds the first PASTE_THRESHOLD chars to the textarea
  // so the user can see a preview of what was pasted.
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const clipboardData = e.clipboardData;
      const items = clipboardData.items;
      const fileItems = Array.from(items).filter((item) => item.kind === "file");

      // Path 1: Pasted files (e.g. screenshot from clipboard)
      if (fileItems.length > 0 && files.length < maxFiles) {
        e.preventDefault();
        const pastedFiles = fileItems
          .map((item) => item.getAsFile())
          .filter(Boolean) as File[];
        const dataTransfer = new DataTransfer();
        pastedFiles.forEach((file) => dataTransfer.items.add(file));
        handleFileSelect(dataTransfer.files);
        return;
      }

      // Path 2: Long text paste → PastedContent card
      const textData = clipboardData.getData("text");
      if (textData && textData.length > PASTE_THRESHOLD && pastedContent.length < 5) {
        e.preventDefault();
        // Show first PASTE_THRESHOLD chars in textarea as preview
        setMessage(message + textData.slice(0, PASTE_THRESHOLD) + "...");
        const pastedItem: PastedContent = {
          id: Math.random(),  // TODO: nanoid()
          content: textData,
          timestamp: new Date(),
          wordCount: textData.split(/\s+/).filter(Boolean).length,
        };
        setPastedContent((prev) => [...prev, pastedItem]);
      }
      // Path 3: Short text — default browser paste behavior, no interception
    },
    [handleFileSelect, files.length, maxFiles, pastedContent.length, message]
  );

  // ── DRAG AND DROP ──────────────────────────────────────────────────────────
  // isDragging drives the drop zone overlay (blue dashed border fills the container).
  // handleDragLeave must call preventDefault() to prevent the browser from
  // treating the drag as a navigation/open event.
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  // ── SEND HANDLER ───────────────────────────────────────────────────────────
  // Guards: must have content, must not be disabled, must not have uploading files.
  // On send: revoke all object URLs, clear all state, reset textarea height.
  const handleSend = useCallback(() => {
    if (disabled || (!message.trim() && files.length === 0 && pastedContent.length === 0)) return;
    if (files.some((f) => f.uploadStatus === "uploading")) {
      alert("Please wait for all files to finish uploading.");
      return;
    }
    onSendMessage?.(message, files, pastedContent);
    setMessage("");
    files.forEach((file) => { if (file.preview) URL.revokeObjectURL(file.preview); });
    setFiles([]);
    setPastedContent([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [message, files, pastedContent, disabled, onSendMessage]);

  const handleModelChangeInternal = useCallback(
    (modelId: string) => {
      setSelectedModel(modelId);
      onModelChange?.(modelId);
    },
    [onModelChange]
  );

  // ── KEYBOARD SHORTCUT ─────────────────────────────────────────────────────
  // Enter = send. Shift+Enter = new line (default behavior, no intercept).
  // isComposing check: prevents send during IME composition (Chinese, Japanese, etc.)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ── SEND GATE ─────────────────────────────────────────────────────────────
  // canSend: must have content AND not uploading. Controls button appearance and disabled state.
  const hasContent = message.trim() || files.length > 0 || pastedContent.length > 0;
  const canSend = hasContent && !disabled && !files.some((f) => f.uploadStatus === "uploading");

  return (
    // Drag/drop handlers on the outer wrapper — covers the full component area
    <div
      className="relative w-full max-w-2xl mx-auto"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── DRAG OVERLAY ────────────────────────────────────────────────── */}
      {/* pointer-events-none prevents the overlay itself from receiving drag events,
          which would cause flickering as the drag moves over the overlay. */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#1C3F62] border-2 border-dashed border-blue-500 rounded-xl flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm text-blue-500 flex items-center gap-2">
            <ImageIcon className="size-4 opacity-50" />
            Drop files here to add to chat
          </p>
        </div>
      )}

      {/* ── MAIN INPUT CONTAINER ────────────────────────────────────────── */}
      {/* bg-[#30302E]: Claude's exact warm dark background color.
          flex-col + items-end: toolbar pins to the bottom-right. */}
      <div className="bg-[#30302E] border border-zinc-700 rounded-xl shadow-lg items-end gap-2 min-h-[150px] flex flex-col">

        {/* Auto-resizing textarea — raw <textarea>, not shadcn Textarea component.
            The Textarea import is available but not used here (raw gives more control).
            focus-visible:ring-0 removes the default browser/Tailwind focus ring.
            bg-transparent: the background is on the parent div. */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-h-[100px] w-full p-4 focus-within:border-none focus:outline-none focus:border-none border-none outline-none focus-within:ring-0 focus-within:ring-offset-0 focus-within:outline-none max-h-[120px] resize-none border-0 bg-transparent text-zinc-100 shadow-none focus-visible:ring-0 placeholder:text-zinc-500 text-sm sm:text-base custom-scrollbar"
          rows={1}
        />

        {/* ── BOTTOM TOOLBAR ────────────────────────────────────────────── */}
        {/* justify-between: left group (Plus, Sliders) vs right group (Model, Send) */}
        <div className="flex items-center gap-2 justify-between w-full px-3 pb-1.5">
          <div className="flex items-center gap-2">
            {/* Plus button: triggers hidden file input click */}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || files.length >= maxFiles}
              title={files.length >= maxFiles ? `Max ${maxFiles} files reached` : "Attach files"}
            >
              <Plus className="h-5 w-5" />
            </Button>
            {/* Sliders: placeholder for options panel — not implemented */}
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 flex-shrink-0"
              disabled={disabled}
              title="Options"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Model selector — only renders if models array is non-empty */}
            {models && models.length > 0 && (
              <ModelSelectorDropdown
                models={models}
                selectedModel={selectedModel}
                onModelChange={handleModelChangeInternal}
              />
            )}
            {/* Send button: amber when canSend, gray/disabled otherwise.
                Color shift (zinc-700 → amber-600) communicates readiness clearly.
                The state transition is the micro-interaction that makes this feel alive. */}
            <Button
              size="icon"
              className={cn(
                "h-9 w-9 p-0 flex-shrink-0 rounded-md transition-colors",
                canSend
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              )}
              onClick={handleSend}
              disabled={!canSend}
              title="Send message"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* ── ATTACHMENT TRAY ───────────────────────────────────────────── */}
        {/* Only renders when there are attachments. Animating mount/unmount
            would require AnimatePresence — left as a plain conditional here.
            overflow-x-auto + flex-row: horizontal scroll for many files.
            hide-scroll-bar: custom CSS class to hide scrollbar while keeping scroll. */}
        {(files.length > 0 || pastedContent.length > 0) && (
          <div className="overflow-x-auto border-t-[1px] p-3 border-zinc-700 w-full bg-[#262624] hide-scroll-bar">
            <div className="flex gap-3">
              {pastedContent.map((content) => (
                <PastedContentCard
                  key={content.id}
                  content={content}
                  onRemove={(id) =>
                    setPastedContent((prev) => prev.filter((c) => c.id !== id))
                  }
                />
              ))}
              {files.map((file) => (
                <FilePreviewCard key={file.id} file={file} onRemove={removeFile} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── HIDDEN FILE INPUT ─────────────────────────────────────────────── */}
      {/* value reset on onChange: without this, selecting the same file twice
          doesn't trigger onChange because the browser sees no change in the input value. */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept={acceptedFileTypes?.join(",")}
        onChange={(e) => {
          handleFileSelect(e.target.files);
          if (e.target) e.target.value = "";  // reset so same file can be re-selected
        }}
      />
    </div>
  );
};

// ─── DEMO PAGE WRAPPER ────────────────────────────────────────────────────────
// Shows the input centered on the Claude app background color (#262624).
// The greeting "What's new, Suraj?" uses font-serif font-light — the exact
// typographic treatment Claude uses for personalized greetings.
export const Component = () => {
  const handleSendMessage = (
    message: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[]
  ) => {
    console.log("Message:", message);
    console.log("Files:", files);
    console.log("Pasted Content:", pastedContent);
    alert(`Message sent!\nText: ${message}\nFiles: ${files.length}\nPasted Content: ${pastedContent.length}`);
  };

  return (
    <div className="min-h-screen w-screen bg-[#262624] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Serif font-light greeting — Claude's signature UX pattern */}
        <div className="mb-8 text-center py-16">
          <h1 className="text-3xl font-serif font-light text-[#C2C0B6] mb-2">
            What's new, Suraj?
          </h1>
        </div>

        <ClaudeChatInput
          onSendMessage={handleSendMessage}
          placeholder="Try pasting large text or uploading textual files..."
          maxFiles={10}
          maxFileSize={10 * 1024 * 1024}  // 10MB
        />
      </div>
    </div>
  );
};

// ─── USAGE EXAMPLES ───────────────────────────────────────────────────────────
/*
// Minimal — just the input
<ClaudeChatInput onSendMessage={(msg, files, pastes) => { ... }} />

// With custom models (AetherTrace evidence submission context)
<ClaudeChatInput
  placeholder="Describe the evidence being submitted..."
  models={[
    { id: "standard",  name: "Standard Chain",  description: "SHA-256 + timestamp", badge: "Default" },
    { id: "certified", name: "Certified Chain",  description: "CMMC compliant"                       },
    { id: "federal",   name: "Federal Package",  description: "DoD audit standards", badge: "SDVOSB" },
  ]}
  defaultModel="standard"
  onModelChange={(id) => console.log("Chain type:", id)}
  acceptedFileTypes={["image/", "application/pdf", "text/", ".pdf", ".png", ".jpg"]}
  maxFiles={20}
  maxFileSize={100 * 1024 * 1024}  // 100MB for evidence packages
  onSendMessage={(msg, files, pastes) => submitEvidence({ msg, files, pastes })}
/>

// Disabled state (e.g. during AI response)
<ClaudeChatInput disabled={isLoading} placeholder="Claude is thinking..." />
*/
