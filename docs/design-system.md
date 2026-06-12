---
id: design-system
title: Design System
sidebar_position: 6
---

# Design System — iOS Liquid Glass

EventFlow uses an iOS Liquid Glass design language optimized for mobile phone viewports (375–430px). The aesthetic draws from iOS 18+ with frosted glass panels, translucent layers, and subtle depth.

## Design Principles

1. **Translucency over opacity** — Panels use `backdrop-filter: blur()` to create depth while maintaining context awareness
2. **Minimal chrome** — Reduce visual noise; let content breathe with generous whitespace
3. **Touch-first** — All interactive elements are 44px+ touch targets with active state feedback
4. **Brand gradient** — Purple-to-teal gradient used sparingly for emphasis (titles, CTAs, progress indicators)

## Color Palette

| Token | Value (OKLCH) | Usage |
|---|---|---|
| `--color-primary` | `oklch(0.55 0.22 290)` | Primary actions, brand purple |
| `--color-accent` | `oklch(0.62 0.18 200)` | Secondary actions, brand teal |
| `--color-background` | `oklch(0.97 0.005 260)` | Page background |
| `--color-foreground` | `oklch(0.15 0.01 260)` | Primary text |
| `--color-muted` | `oklch(0.95 0.005 260)` | Subtle backgrounds |
| `--color-muted-foreground` | `oklch(0.50 0.01 260)` | Secondary text |
| `--color-border` | `oklch(0.90 0.005 260 / 0.5)` | Borders and dividers |

## Glass Surfaces

Four glass variants are available:

```css
/* Standard glass panel */
.glass {
  background: oklch(0.99 0 0 / 0.72);
  backdrop-filter: blur(20px);
  border: 1px solid oklch(0.92 0 0 / 0.6);
  box-shadow: 0 2px 20px oklch(0.3 0 0 / 0.06);
}

/* Heavy glass (navigation, modals) */
.glass-heavy {
  background: oklch(0.98 0 0 / 0.85);
  backdrop-filter: blur(40px);
}

/* Light glass (floating elements) */
.glass-light {
  background: oklch(1 0 0 / 0.55);
  backdrop-filter: blur(12px);
}

/* Card glass (content cards) */
.glass-card {
  background: oklch(0.98 0 0 / 0.85);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
}
```

## Typography

| Element | Font | Weight | Size |
|---|---|---|---|
| Brand title | Syne | 800 | 1.5–2rem |
| Headings | Inter | 600–700 | 1–1.25rem |
| Body | Inter | 400 | 0.875rem |
| Captions | Inter | 500 | 0.75rem |
| Micro text | Inter | 400 | 0.6875rem |

The brand title uses a gradient fill:

```css
.brand-title {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  background: linear-gradient(135deg, oklch(0.50 0.24 290), oklch(0.58 0.20 200));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Navigation

### Mobile Bottom Nav
Fixed bottom navigation with 5 items, frosted glass background, and safe area padding for notched devices.

### Tab Bar
Horizontal scrollable tabs for module switching within the main view. Active tab uses gradient underline.

## Animations

| Element | Duration | Easing |
|---|---|---|
| Button press | 160ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Panel slide-up | 400ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Fade-in | 300ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Nav item tap | 180ms | `cubic-bezier(0.23, 1, 0.32, 1)` |

All animations respect `prefers-reduced-motion`.

## Spacing

The app uses a 4px base grid with these common spacings:

| Token | Value | Usage |
|---|---|---|
| `gap-1` | 4px | Inline icon gaps |
| `gap-2` | 8px | Card internal spacing |
| `gap-3` | 12px | Section spacing |
| `gap-4` | 16px | Panel padding |
| `gap-6` | 24px | Section margins |

## Responsive Strategy

The app is designed for a single breakpoint: mobile (max-width: 430px). On larger screens, the layout is centered within a 430px container to maintain the phone-app feel. This is intentional — the app is meant to be used on phones at events.
