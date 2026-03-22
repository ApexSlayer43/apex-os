---
type: design-spec
agent: prism
project:
status: draft
date:
sprint:
tags: [design]
summary:
---

# PRISM Design Spec — {project}

## Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| primary | | Buttons, links, key actions |
| secondary | | Supporting elements |
| background | | Page background |
| surface | | Cards, panels |
| text-primary | | Body text |
| text-secondary | | Muted text |
| error | | Error states |
| success | | Success states |
| warning | | Warning states |

### Typography
| Level | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| H1 | | | | |
| H2 | | | | |
| Body | | | | |
| Small | | | | |

### Spacing Scale
{4, 8, 12, 16, 24, 32, 48, 64, 96}

### Border Radius
{sm: 4px, md: 8px, lg: 12px, full: 9999px}

## User Flow
{Step-by-step flow from entry to core value delivery}

## Key Screens
{Wireframe descriptions for critical screens with all states}

## Component Specifications
{For each key component: states, responsive behavior, exact values}

## Accessibility Checklist
- [ ] Color contrast ≥ 4.5:1 for all text
- [ ] Touch targets ≥ 44x44px
- [ ] Focus states visible on all interactive elements
- [ ] Keyboard navigation matches visual order
- [ ] ARIA labels on icon-only buttons
- [ ] Form inputs have associated labels

## Responsive Strategy
{Mobile-first or desktop-first, breakpoints, key layout changes}

## Handoff to ANVIL
- Design system tokens: {location}
- Key decisions ANVIL should not change: {list}
- Flexibility zones: {where ANVIL has implementation freedom}
