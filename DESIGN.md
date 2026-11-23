# DESIGN.md — API Gateway Admin Console

Visual reference for this project's frontend. Style: **Linear** — dark-first,
data-dense, keyboard-driven B2B tooling. Build every page to this system so
output reads as one product, not generic AI UI.

Stack assumption: React + Vite. Tokens below are CSS custom properties; wire
them once in a global stylesheet and reference the vars everywhere.

---

## Principles

1. **Dense but calm.** Tight spacing, small type, thin borders. Information per
   screen is high; visual noise is low. No drop shadows for separation — use
   `1px` borders and subtle background steps.
2. **Dark-first.** Design dark, then derive light. Both ship.
3. **One accent.** Indigo/violet is the only brand color. Everything else is
   neutral gray. Color = meaning (accent, success, warn, danger), never
   decoration.
4. **Keyboard-first.** Every action reachable without a mouse. Visible focus
   rings. `⌘K` command palette is the primary navigation affordance.
5. **Motion is functional.** 120–160ms ease-out on hover/press/enter. Nothing
   bounces. Nothing slow.

---

## Color tokens

```css
:root[data-theme="dark"] {
  /* surfaces — stepped, not shadowed */
  --bg:            #08090a;  /* app background */
  --surface-1:     #0f1011;  /* panels, cards */
  --surface-2:     #191a1c;  /* raised: menus, modals, hover rows */
  --surface-3:     #232427;  /* active/pressed */

  /* borders */
  --border:        #23252a;  /* default hairline */
  --border-strong: #35373c;  /* focused inputs, dividers that must read */

  /* text */
  --text:          #f7f8f8;  /* primary */
  --text-muted:    #8a8f98;  /* secondary, labels */
  --text-faint:    #62666d;  /* placeholders, disabled */

  /* accent (brand) */
  --accent:        #5e6ad2;  /* Linear indigo */
  --accent-hover:  #6872e5;
  --accent-fg:     #ffffff;  /* text on accent */
  --accent-soft:   #5e6ad21f; /* tinted bg for selected/active */

  /* status */
  --success:       #4cb782;
  --warn:          #f2c94c;
  --danger:        #eb5757;
  --success-soft:  #4cb7821f;
  --warn-soft:     #f2c94c1f;
  --danger-soft:   #eb57571f;

  --radius:        6px;
  --radius-sm:     4px;
  --radius-lg:     10px;
}

:root[data-theme="light"] {
  --bg:            #ffffff;
  --surface-1:     #fbfbfb;
  --surface-2:     #f4f5f8;
  --surface-3:     #eceef1;
  --border:        #e6e8eb;
  --border-strong: #d0d3d8;
  --text:          #17181a;
  --text-muted:    #6b7280;
  --text-faint:    #9ca3af;
  --accent:        #5e6ad2;
  --accent-hover:  #4f5ac0;
  --accent-fg:     #ffffff;
  --accent-soft:   #5e6ad214;
  --success:       #2f9e6f;
  --warn:          #c99a1e;
  --danger:        #d93a3a;
  --success-soft:  #2f9e6f14;
  --warn-soft:     #c99a1e14;
  --danger-soft:   #d93a3a14;
}
```

Default to dark (`<html data-theme="dark">`). Honor `prefers-color-scheme` on
first load; let the user override and persist the choice.

---

## Typography

```css
--font-sans: "Inter", -apple-system, system-ui, sans-serif;
--font-mono: "Berkeley Mono", "JetBrains Mono", ui-monospace, monospace;
```

Use mono for anything machine-literal: route paths, IDs, tokens, timestamps,
JSON, header names.

| Role             | Size | Weight | Notes                          |
|------------------|------|--------|--------------------------------|
| Page title       | 20px | 600    | one per page                   |
| Section heading  | 15px | 590    | card/panel headers             |
| Body / table     | 13px | 400    | the workhorse size             |
| Label / caption  | 12px | 510    | `--text-muted`, form labels    |
| Micro / badge    | 11px | 510    | uppercase optional, +0.02em    |

Line-height: `1.4` body, `1.2` headings. Letter-spacing: `-0.01em` on titles,
`0` elsewhere.

---

## Spacing & layout

4px base grid: `4 · 8 · 12 · 16 · 24 · 32 · 48`.

- **App shell:** fixed left sidebar (240px) + top bar (48px) + scrollable
  content. Sidebar is `--surface-1`, content is `--bg`.
- **Content max-width:** 1200px for forms/detail; full-bleed for tables.
- **Page padding:** 24px.
- **Card padding:** 16px; gap between stacked cards: 12px.
- **Dividers:** `1px solid var(--border)`, never a shadow.

---

## Components

### Buttons
- **Primary:** `bg var(--accent)`, `color var(--accent-fg)`, radius `--radius`,
  padding `6px 12px`, 13px/510. Hover → `--accent-hover`. Active → translateY(0)
  with `--surface-3` inset feel; no bounce.
- **Secondary:** `bg var(--surface-2)`, `1px solid var(--border)`, `color
  var(--text)`. Hover → `--surface-3`.
- **Ghost:** transparent, text `--text-muted`, hover bg `--surface-2`.
- **Danger:** text/border `--danger`; solid `--danger` only for destructive
  confirm.
- Height: 32px standard, 28px compact (toolbars), 24px inline.

### Tables (the core of this app)
- 13px rows, row height 40px, header 36px.
- Header: `--text-muted`, 12px/510, `1px solid var(--border)` bottom only.
- Rows separated by `1px solid var(--border)`; **no** zebra striping.
- Row hover: `bg var(--surface-2)`; selected: `bg var(--accent-soft)` with a
  2px `--accent` left border.
- Cell padding: `8px 12px`. Numeric/ID columns use mono, right-aligned for
  numbers.
- Sticky header on scroll. Empty state: centered muted text + one primary CTA.

### Inputs / Fields
- `bg var(--surface-1)`, `1px solid var(--border)`, radius `--radius`, padding
  `6px 10px`, 13px.
- Focus: `border-color var(--border-strong)` + `0 0 0 3px var(--accent-soft)`
  ring. Never remove the ring.
- Label above, 12px `--text-muted`. Error text `--danger` 12px below, and
  border → `--danger`.
- Validate at the boundary; show the message, don't swallow it.

### Badges / Status pills
- Radius `--radius-sm`, padding `2px 8px`, 11px/510.
- Map status → token: active=`--success-soft`/`--success`, pending=
  `--warn-soft`/`--warn`, error/disabled=`--danger-soft`/`--danger`, neutral=
  `--surface-2`/`--text-muted`. Text color = the strong token, bg = soft.

### Modals / Dialogs
- Overlay: `rgba(0,0,0,.6)` + 2px backdrop blur.
- Panel: `--surface-2`, `1px solid var(--border-strong)`, radius `--radius-lg`,
  max-width 480px (confirm) / 640px (form). Enter: fade + 4px rise, 140ms.
- Header 15px/590, body 13px, footer right-aligned buttons (ghost cancel +
  primary/danger confirm). `Esc` closes; focus trapped inside.

### Sidebar nav
- Items 13px, 32px tall, radius `--radius-sm`, icon + label.
- Active: `bg var(--accent-soft)`, text `--text`, 2px `--accent` left marker.
- Inactive: text `--text-muted`, hover `bg var(--surface-2)`.
- Group labels 11px uppercase `--text-faint`.

### Command palette (⌘K)
- Centered `--surface-2` panel, mono-ish search, grouped results, arrow-key
  nav, highlighted match. The fast path to every route/org/action.

---

## Motion

- Hover/press: 120ms ease-out.
- Enter (menus, modals, toasts): 140–160ms ease-out, fade + small translate.
- No spring, no scale-bounce, no durations over 200ms.
- Respect `prefers-reduced-motion`: drop transforms, keep instant opacity.

---

## Accessibility (non-negotiable)

- Contrast ≥ 4.5:1 for text (the muted tokens above clear it on their
  surfaces). Verify any new pairing.
- Visible focus ring on every interactive element — the accent-soft ring.
- Hit targets ≥ 32px; inline actions get padding to reach it.
- Full keyboard reach; modals trap focus and restore it on close.
- Status never by color alone — pair the pill color with a text label.

---

## Do / Don't

- ✅ Borders and background steps for separation. ❌ Drop shadows for layout.
- ✅ One indigo accent. ❌ Multiple brand hues or gradients.
- ✅ 13px dense rows. ❌ Roomy 16px marketing spacing in data views.
- ✅ Mono for paths/IDs/tokens. ❌ Sans for machine-literal values.
- ✅ Fast, short motion. ❌ Bounce, slow fades, parallax.
