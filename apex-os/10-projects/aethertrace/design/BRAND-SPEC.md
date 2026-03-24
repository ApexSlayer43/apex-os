---
type: brand-spec
status: APPROVED
approved-by: Casey
approved-date: 2026-03-24
version: 1.0
---

# AetherTrace — Brand Specification v1.0
**Status: LOCKED. Do not modify without explicit Casey approval.**

---

## Core Mark — The Orbital Lock

The wordmark IS the planet. The ring orbits it. This is not decoration — it communicates the protocol: a chain of custody that encircles and locks the evidence it contains.

**Concept name:** The Orbital Lock  
**Source file:** `apex-os/10-projects/aethertrace/design/previews/brand-board-v3.html`  
**Approved:** 2026-03-24

### Ring Geometry (SVG production values)
```
Ring center:     cx=360, cy=108
Ring semi-axes:  rx=275, ry=54
Back arc:        M 85,108 A 275,54 0 0 0 635,108  (sweep=0 / CCW / top half / behind text)
Front arc:       M 85,108 A 275,54 0 0 1 635,108  (sweep=1 / CW  / bottom half / in front)
Lock nodes:      tick marks + small circles at (85,108) and (635,108)
Orbital node:    animated, travels full ring, dims on back arc, brightens on front arc
Node speed:      0.0035 rad/frame (~30fps = slow, deliberate)
```

### Ring Visual Layers (front arc — bright)
| Layer | stroke-width | opacity | color |
|-------|-------------|---------|-------|
| Wide diffuse | 24 | 0.05 | #b8ccee |
| Medium glow | 12 | 0.09 | #C8D4E8 |
| Inner glow | 5 | 0.30 | #D8E4F4 |
| Core | 2 | 0.95 | #E8EEFF |

### Ring Visual Layers (back arc — dim)
| Layer | stroke-width | opacity | color |
|-------|-------------|---------|-------|
| Wide diffuse | 22 | 0.04 | #7090b8 |
| Medium glow | 10 | 0.08 | #8aaad0 |
| Inner glow | 4.5 | 0.22 | #9ab8d8 |
| Core | 2 | 0.50 | #6a8db5 |

---

## Color System

| Token | Hex | Use |
|-------|-----|-----|
| `--void` | `#040D21` | Page background |
| `--deep` | `#0a1628` | Elevated surface |
| `--card` | `#0d1b35` | Card / panel background |
| `--navy` | `#0f1f3d` | Borders, subtle dividers |
| `--silver` | `#C8D4E8` | Primary text, ring core, wordmark fill |
| `--bright` | `#E8EEFF` | Front arc, active states, highlights |
| `--dim` | `#46607a` | Labels, captions, metadata |
| `--breach` | `#EF4444` | Tamper-detected / error state ONLY |

**Glow formula (CSS drop-shadow for wordmark and marks):**
```css
filter: drop-shadow(0 0 10px rgba(200,212,232,0.65))
        drop-shadow(0 0 24px rgba(200,212,232,0.30))
        drop-shadow(0 0 48px rgba(140,170,230,0.15));
```

---

## Typography

| Role | Font | Weight | Letter-spacing | Case |
|------|------|--------|---------------|------|
| Wordmark "AETHER" | IBM Plex Mono | 300 | 0.14em | UPPER |
| Wordmark "TRACE" | IBM Plex Mono | 600 | 0.06em | UPPER |
| UI headings | IBM Plex Mono | 300–600 | 0.08–0.20em | UPPER |
| Body / labels | Inter | 300–500 | 0.02–0.04em | mixed |
| Tagline | Inter or IBM Plex Mono | 300 | 0.30–0.35em | UPPER |

**Tagline (approved):** INTEGRITY INFRASTRUCTURE

---

## Mark System

### A — The Orbital Lock (primary)
Full wordmark + orbital ring. Used: hero sections, landing page, pitch decks, documents.

### B — The Planet Mark (icon)
Circle with "AT" monogram, ring at −18° tilt. Ring rx=74, ry=18. Used: favicon, app badge, embossed seal.

### C — The Stacked Lockup
Planet Mark icon above wordmark above tagline. Used: document headers, email signatures, onboarding screens.

---

## Background Treatment

Stars via CSS radial-gradients (no canvas, no JS):
```css
body::before {
  background:
    radial-gradient(1px 1px at 7% 9%,  rgba(200,212,232,0.75) 0%, transparent 0),
    radial-gradient(1px 1px at 14% 55%, rgba(200,212,232,0.40) 0%, transparent 0),
    /* ... 17+ star points at varied positions and opacities ... */
}
```
Nebula glow (optional depth layer):
```css
body::after {
  background:
    radial-gradient(ellipse 60% 40% at 20% 30%, rgba(10,40,90,0.35) 0%, transparent 70%),
    radial-gradient(ellipse 50% 30% at 80% 70%, rgba(5,20,60,0.25) 0%, transparent 70%);
}
```

---

## What This Brand Communicates

- **The word is the planet.** The ring doesn't surround a logo — it orbits an identity.
- **The front arc seals. The back arc persists.** Depth is real, not decorative.
- **The traveling node is the live custody event.** The chain is always moving, always verifiable.
- **Navy + silver = infrastructure, not software.** No teal. No gradients. No gimmicks.

---

## What Is Explicitly NOT This Brand

- No emerald / teal (emerald = sealed status indicator only, in UI)
- No light mode mark
- No rounded sans-serif wordmarks
- No shield, lock, padlock, or chain-link iconography
- No color gradients in the wordmark
- No animated wordmark (ring animates, wordmark is static)

---

## Approved Files

| File | Description |
|------|-------------|
| `design/previews/brand-board-v3.html` | Full brand board — Orbital Series (APPROVED) |
| `design/previews/brand-board-v2.html` | Previous iteration — colorscheme approved, mark superseded |
| `design/previews/brand-board-v1.html` | Rejected — zinc+emerald, too corporate |
