# PRISM OVERRIDE — UI Pro Max Integration

> This file overrides PRISM's default inline design data with the full
> UI Pro Max search engine. When PRISM activates, read THIS file first,
> then follow these instructions INSTEAD of PRISM's built-in Steps 0-4.

---

## PRISM's New Step 0: Query UI Pro Max (mandatory — replaces inline data)

PRISM's inline design data (20 palettes, 20 fonts, 12 styles) is now
DEPRECATED. The full UI Pro Max engine lives at:

```
Aethertrace/ui-ux-pro-max/
├── data/           # 16 CSV databases (6,500+ lines)
│   ├── styles.csv          # 67+ UI styles
│   ├── colors.csv          # 161 color palettes
│   ├── typography.csv      # 57 font pairings
│   ├── ui-reasoning.csv    # 161 reasoning rules
│   ├── ux-guidelines.csv   # 99 UX guidelines
│   ├── charts.csv          # 25 chart types
│   ├── products.csv        # Product type patterns
│   ├── landing.csv         # Landing page structures
│   ├── design.csv          # Design patterns
│   ├── icons.csv           # Icon recommendations
│   ├── google-fonts.csv    # 1900+ Google Font entries
│   ├── app-interface.csv   # App interface guidelines
│   ├── react-performance.csv
│   └── stacks/react-native.csv
└── scripts/
    ├── search.py           # CLI entry point
    ├── core.py             # BM25 + regex hybrid search
    └── design_system.py    # Design system generation
```

**PRISM must run these commands BEFORE making any design decision.**
All commands run from the `Aethertrace/ui-ux-pro-max/` directory.

---

## New Step 1: Generate Full Design System (REQUIRED)

```bash
cd /path/to/Aethertrace/ui-ux-pro-max
python3 scripts/search.py "<product_type> <industry> <keywords>" --design-system -p "ProjectName"
```

This searches 5 domains in parallel (product, style, color, landing,
typography), applies 161 reasoning rules from ui-reasoning.csv, and
returns a COMPLETE design system including:
- Recommended pattern + style
- Color palette with hex values and semantic meanings
- Typography pairing with Google Fonts import URLs
- Key effects and animations
- Anti-patterns to avoid
- Pre-delivery checklist

**For AetherTrace specifically:**
```bash
python3 scripts/search.py "security evidence custody SaaS trust verification legal" --design-system -p "AetherTrace"
```

## New Step 2: Deep-Dive Domain Searches (as needed)

After the design system, use targeted searches for specific decisions:

```bash
python3 scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

| Decision Needed | Command |
|----------------|---------|
| Which visual style? | `--domain style "trust authority legal security"` |
| What colors? | `--domain color "evidence custody compliance"` |
| What fonts? | `--domain typography "professional legal authoritative"` |
| Landing page structure? | `--domain landing "hero trust social-proof"` |
| Chart types? | `--domain chart "timeline audit evidence"` |
| UX best practices? | `--domain ux "accessibility loading animation"` |
| Product patterns? | `--domain product "SaaS B2B enterprise"` |
| AI/CSS keywords? | `--domain prompt "trust authority"` |

## New Step 3: Stack-Specific Guidelines

```bash
python3 scripts/search.py "<keyword>" --stack nextjs
```

Available stacks: html-tailwind, react, nextjs, astro, vue, nuxtjs,
nuxt-ui, svelte, swiftui, react-native, flutter, shadcn, jetpack-compose

## New Step 4: Persist Design System (optional)

```bash
python3 scripts/search.py "<query>" --design-system --persist -p "ProjectName"
```

Creates `design-system/MASTER.md` for cross-session retrieval.
Add `--page "pagename"` for page-specific overrides.

---

## PRISM Output Format (Updated for ANVIL)

PRISM's design brief must now include IMPLEMENTATION-READY specs,
not abstract direction. ANVIL should be able to build without guessing.

```
╔══════════════════════════════════════════════════════╗
║  PRISM DESIGN BRIEF — [Product Name]                 ║
╠══════════════════════════════════════════════════════╣

SEARCH QUERIES RUN:
  • --design-system: "[query used]"
  • --domain style: "[query used]"
  • --domain [other]: "[query used]"

VISUAL IDENTITY
  Style: [selected style from search results]
  Rationale: [why this style serves this product]

COLOR SYSTEM (exact values from search)
  --primary:    [hex]  — [what it communicates]
  --secondary:  [hex]  — [what it communicates]
  --accent:     [hex]  — [when to use]
  --background: [hex]
  --surface:    [hex]
  --text:       [hex]
  --muted:      [hex]
  --border:     [hex]
  --error:      [hex]
  --success:    [hex]

TYPOGRAPHY (exact values from search)
  Heading: [font name] ([weight])
  Body: [font name] ([weight])
  Mono: [font name] (for data/code)
  Google Fonts Import: [exact URL from search results]
  Mood: [from search results]

COMPONENT SPECS (per key component)
  [Component Name]:
    Layout: [specific CSS/Tailwind]
    Spacing: [specific values]
    Border radius: [specific value]
    Shadow: [specific value]
    Hover state: [specific behavior]
    Active state: [specific behavior]
    Disabled state: [specific behavior]

EFFECTS & ANIMATION
  [from search results — exact timing, easing, properties]

ACCESSIBILITY NON-NEGOTIABLES
  [from search results — contrast ratios, touch targets, ARIA]

ANTI-PATTERNS (from search results)
  [what to avoid + why]

IMPLEMENTATION CHECKLIST (from search results)
  [exact checklist items ANVIL must verify]

DESIGN SYSTEM VARIABLES (from search results)
  [CSS custom properties ready to paste into code]
╚══════════════════════════════════════════════════════╝
```

---

## What Changed from Original PRISM

| Before | After |
|--------|-------|
| 20 inline color palettes | 161 searchable palettes via BM25 |
| 20 inline font pairings | 57 searchable pairings + 1900 Google Fonts |
| 12 inline style definitions | 67+ styles with full implementation specs |
| No reasoning rules | 161 reasoning rules auto-applied |
| No UX guidelines in search | 99 searchable UX guidelines |
| Abstract design direction | Implementation-ready CSS variables |
| "Trust & Authority" = 3 sentences | Full AI prompts, CSS keywords, checklists |
| ANVIL guesses implementation | ANVIL copies exact specs |

---

## Standing Order

PRISM never makes a design decision from memory or general knowledge
when the search engine is available. Every visual choice is grounded
in the database. If the database doesn't have a match, PRISM says so
and explains the reasoning behind the custom decision.

The inline data in PRISM's original SKILL.md is a fallback ONLY —
used when the search engine is genuinely unavailable.
