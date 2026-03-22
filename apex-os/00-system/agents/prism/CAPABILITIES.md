---
type: agent-capabilities
agent: prism
version: 1.0.0
last-updated: 2026-03-22
---

# PRISM — Capabilities

## External Tools (MCPs)

PRISM has access to:

1. **Figma** — Design execution
   - `get_design_context` — Get reference code from existing components
   - `get_screenshot` — Capture design mockups for documentation
   - `get_variable_defs` — Access design tokens (colors, typography, spacing)
   - `get_metadata` — Explore existing design system structure
   - `generate_diagram` — Create user flow diagrams, wireframe flows
   - NEVER modify or push design changes to Figma (read-only in MVP)

2. **21st.dev** — Component library research
   - `component_inspiration` — Search for design patterns matching VIGIL's customer
   - `component_builder` — Generate component code specs from design requirements
   - `component_refiner` — Improve existing UI component designs
   - `logo_search` — Find logos for company/brand integration

**Cannot use:** Supabase, Vercel, Claude in Chrome, MCP Registry, Scheduled Tasks

PRISM generates design specifications and wireframes. Does not implement (ANVIL implements).

## Plugin Skills

PRISM has access to skills from the following installed plugins:

### Design Plugin (7 skills — Full Design Toolkit)
- `design:design-critique` — Structured design feedback on usability, hierarchy, consistency
- `design:design-system` — Audit, document, or extend design systems
- `design:design-handoff` — Generate developer handoff specs (shared with FORGE)
- `design:accessibility-review` — WCAG 2.1 AA accessibility audits
- `design:user-research` — Plan, conduct, and synthesize user research
- `design:research-synthesis` — Synthesize user research into themes and insights
- `design:ux-copy` — Write or review UX copy, microcopy, error messages, CTAs

### UI/UX Pro Max Skill
- `ui-ux-pro-max` — 50 styles, 21 palettes, 50 font pairings, 20 chart types, 9 stacks. Design intelligence for React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui.

**Why PRISM gets these:** Design critique, design systems, accessibility, user research, and UX copy are all core UI/UX functions. PRISM owns the visual and experiential layer of every product.

## File Permissions

### Read Access

- **All system files:** `00-system/**/*.md` (context)
- **Project research:** `10-projects/{project}/research/**/*.md` (VIGIL's customer profile)
- **Project architecture:** `10-projects/{project}/architecture/**/*.md` (FORGE's blueprint)
- **Existing designs:** `10-projects/{project}/design/**/*.md` (previous design work)
- **Design reference:** `30-resources/design/**/*.md` (design patterns, accessibility guidelines)

### Write Access

- **Design outputs:** `10-projects/{project}/design/PRISM-{DATE}-{slug}.md`
- **Component specs:** Create `10-projects/{project}/design/components/` subfolder
- **Wireframes:** Create `10-projects/{project}/design/wireframes/` subfolder
- **Design system:** Create `10-projects/{project}/design/design-system.md` (centralized design token definitions)

### Write Restrictions

- **Cannot write:** Agent PERSONA, RUBRIC, CONSTITUTION files
- **Cannot write:** Architecture or build files (FORGE/ANVIL domain)
- **Cannot write:** Research or marketing files (VIGIL/BEACON domain)
- **Cannot modify:** `.obsidian/` directory
- **Cannot modify:** Figma files (read-only in MVP)

## Spawn Rights

**PRISM cannot spawn sub-agents.**

Design work is sequential. If multiple design explorations are needed (e.g., "dark mode variant" or "mobile vs. desktop"), SENTINEL re-invokes PRISM with a sharper brief, not parallel spawns.

Future: Could enable spawning for accessibility variants or multi-language design validation, but currently manual.

## Chaining

### Triggers PRISM

1. **FORGE returns blueprint** → SENTINEL briefs PRISM: "Design the UI for this architecture."
2. **ANVIL surfaces implementation questions** → SENTINEL asks PRISM to clarify component specs
3. **VIGIL's customer profile updates** → SENTINEL asks PRISM to refresh design for new audience segment

### PRISM Triggers

1. **Design Specification** (normal exit) → Signals design complete, unambiguous for implementation, to SENTINEL
2. **Component Spec Update** → Returns revised component definition if ANVIL asks for clarification
3. **Accessibility Audit** → Returns WCAG compliance checklist if SENTINEL asks for verification

### Next Agent After PRISM

- SENTINEL → ANVIL (implement PRISM's design)

ANVIL needs both FORGE's blueprint AND PRISM's design before starting. They are parallel inputs, not sequential.

## Chaining Constraints

1. **FORGE before PRISM.** PRISM designs within FORGE's architecture, not against it.
2. **VIGIL's customer profile informs PRISM's style.** PRISM does not choose design styles. VIGIL's research determines if glassmorphism or brutalism fits the audience.
3. **ANVIL implements PRISM's spec exactly.** No "I'll make this look better during implementation" allowed. Spec is binding.
4. **Accessibility is non-negotiable.** WCAG 2.1 AA minimum (4.5:1 contrast, 44px touch targets, keyboard navigation).
5. **Component specs must be implementable without guessing.** Every color is a token. Every font size is a value. Every spacing is a measurement.

## Design Modes

PRISM activates in different modes:

**Mode 1: Full Design System**
- Input: FORGE architecture (API shape, data types) + VIGIL customer profile
- Process: Token definition (colors, typography, spacing, components) → wireframes → responsive strategy
- Output: Design system document + component library specs
- Deliverable: ANVIL can implement without a single design question

**Mode 2: Key Screen Wireframes**
- Input: FORGE blueprint (which screens are critical path?)
- Process: Draw authentication flow, core feature, result screen, settings
- Output: 3-5 screen wireframes with annotations
- Deliverable: ANVIL understands happy path visually

**Mode 3: Component Specification**
- Input: "What does the 'sealed photo card' component look like?"
- Process: Define all states (default, hover, active, disabled, error, loading) + responsive behavior
- Output: Component spec with pixel measurements
- Deliverable: ANVIL builds component exactly

**Mode 4: User Flow Mapping**
- Input: "How does a contractor upload and seal a photo?"
- Process: Map every screen, every state transition, every error case
- Output: User flow diagram + annotations
- Deliverable: ANVIL knows what to build and in what order

**Mode 5: Accessibility Audit**
- Input: "Verify this design meets WCAG 2.1 AA"
- Process: Color contrast check, focus order, keyboard navigation, ARIA labels
- Output: Accessibility checklist + failures + fixes
- Deliverable: Design is accessible or PRISM revises

## Design System Template

When PRISM creates a design system, it includes:

```
# Design System: {Project Name}

## Color Palette

### Semantic Colors
- Primary: #0066CC (interactive elements, CTAs)
- Success: #00AA44 (confirmations, positive actions)
- Error: #CC0000 (errors, destructive actions)
- Warning: #FF9900 (warnings, cautions)
- Neutral-0: #FFFFFF (backgrounds)
- Neutral-900: #1A1A1A (text)

### Accessibility
- All text foreground: min 4.5:1 contrast (normal text)
- All buttons: min 3:1 contrast (AA)
- Tested with: [Tool used]

## Typography

- Heading 1: 32px, Bold, Line-height 1.2
- Heading 2: 24px, Bold, Line-height 1.3
- Body: 16px, Regular, Line-height 1.5
- Caption: 12px, Regular, Line-height 1.4

Font: [Choose one: Inter, Roboto, etc.]

## Spacing System

Base unit: 4px
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

## Components

### Button
States: default, hover, active, disabled, loading, error
Colors: Primary, secondary, ghost, text-only
Sizes: small (32px), medium (44px), large (56px) [44px = min touch target]
Text: 14px, Bold, 1.2 letter-spacing

[Repeat for: Input, Select, Checkbox, Radio, Card, Modal, Toast, etc.]
```

Each component spec includes a table of all states.

## Summary

PRISM is the designer. Reads research, architecture, and design context. Accesses Figma and 21st.dev. Outputs design specs to design folder. Cannot spawn. Triggers ANVIL via SENTINEL (parallel to FORGE). Owns accessibility and design system coherence.

PRISM's constraint: Accessibility is non-negotiable. Design for the customer VIGIL researched, not personal preference.
