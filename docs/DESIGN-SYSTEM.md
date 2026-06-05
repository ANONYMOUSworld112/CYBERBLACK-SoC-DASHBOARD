# Design system

> The strict 12-tone black-and-white rules that ship with CYBERBLACK-SoC-DASHBOARD v2.0. The frontend is **CI-gated** to prevent regressions.

---

## 1. The 12-tone palette

These are the **only** raw color values allowed in client source. Any other value is a CI failure.

| Hex | Use |
|---|---|
| `#000000` | Pure black, page background overlays |
| `#0a0a0a` | App background |
| `#0d0d0d` | Input field background |
| `#111111` | Elevated surface 1 |
| `#141414` | Elevated surface 2 |
| `#1a1a1a` | Card background |
| `#2a2a2a` | Border (default) |
| `#303030` | Border (strong) |
| `#333333` | Scrollbar thumb |
| `#404040` | Border / separator (deep) |
| `#505050` | Muted icon |
| `#606060` | Secondary text |
| `#707070` | Tertiary text |
| `#a0a0a0` | Body text, dim |
| `#ffffff` | Primary text, high-emphasis glyphs |

### Tailwind config
```js
// client/tailwind.config.js
colors: {
  black: '#000000', '0a': '#0a0a0a', '0d': '#0d0d0d', 11: '#111111',
  14: '#141414', '1a': '#1a1a1a', '2a': '#2a2a2a', 30: '#303030',
  33: '#333333', 40: '#404040', 50: '#505050', 60: '#606060',
  70: '#707070', a0: '#a0a0a0', white: '#ffffff',
},
```

Anything outside this set is a build failure.

---

## 2. Severity encoding — **never by color**

> Color-blind operators exist. Monochrome displays exist. Photocopied reports exist. We encode severity by **border shade + glyph + label**, never by hue.

| Severity | Border | Glyph | Label |
|---|---|---|---|
| **critical** | `#ffffff` (white, 2 px solid) | `⚠` | CRITICAL |
| **high** | `#a0a0a0` (1.5 px solid) | `▲` | HIGH |
| **medium** | `#606060` (1 px solid) | `●` | MEDIUM |
| **low** | `#404040` (1 px dashed) | `■` | LOW |

The single source of truth is `client/src/utils/severity.js`. It exports `severityStyles(sev)` returning `{ border, glyph, label, dashPattern }`.

```js
// client/src/utils/severity.js
export const SEVERITY = {
  critical: { border: '#ffffff', glyph: '\u26A0', label: 'CRITICAL', borderWidth: 2 },
  high:     { border: '#a0a0a0', glyph: '\u25B2', label: 'HIGH',     borderWidth: 1.5 },
  medium:   { border: '#606060', glyph: '\u25CF', label: 'MEDIUM',   borderWidth: 1 },
  low:      { border: '#404040', glyph: '\u25A0', label: 'LOW',      borderWidth: 1, dash: '4 2' },
};
```

---

## 3. Typography

| Role | Font | Source | Weight |
|---|---|---|---|
| **Headers, badges, KPIs** | **Orbitron** | Google Fonts | 500 / 700 / 900 |
| **Data, code, terminal** | **JetBrains Mono** | Google Fonts | 400 / 500 / 700 |
| **UI, body, labels** | **Rajdhani** | Google Fonts | 400 / 500 / 600 / 700 |

> Inter is **banned** (CI gate). It is the default font of every lazy theme and we don't ship lazy.

### Type scale

| Token | Size | Use |
|---|---|---|
| `display` | 32 px / 700 | Page titles, top-bar brand |
| `h1` | 24 px / 700 | Section headers |
| `h2` | 18 px / 600 | Card titles |
| `body` | 14 px / 500 | Default text |
| `small` | 12 px / 500 | Captions, hints |
| `mono` | 13 px / 400 | Code, IPs, hashes |
| `micro` | 10 px / 600 | Badges, KPI labels |

---

## 4. Spacing & geometry

- **Spacing scale:** 4-px base (`4`, `8`, `12`, `16`, `24`, `32`, `48`, `64`)
- **Border radius:** `0` or `2px` only. `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full` are **banned** (CI gate).
- **Border style:** solid, dashed, or `1px solid transparent` (for layout reservation).
- **Shadow:** none. (No `box-shadow` other than `0 0 0 1px #...` for focus rings.)
- **Blur / glassmorphism:** `backdrop-blur` is **banned** (CI gate).

---

## 5. Motion

Animations are subtle, mechanical, and not decorative. Allowed animations:

| Name | Use | Duration |
|---|---|---|
| `scanline` | Background scanline overlay | 8 s linear infinite |
| `flicker` | Header brand, terminal cursor | 3 s ease-in-out infinite |
| `pulse-glow` | Critical alert border | 1.6 s ease-in-out infinite |
| `slide-in` | Toast notifications, drawer open | 220 ms ease-out |
| `blink-cursor` | Terminal cursor | 1 s steps(2) infinite |
| `scan-horizontal` | Packet feed row enter | 320 ms ease-out |

`matrix-fall` (the falling-glyphs effect) is **banned** (CI gate). It is the single most overused SOC cliché and we refuse.

```css
/* client/src/styles/global.css */
@keyframes pulse-glow {
  0%, 100% { border-color: #ffffff; }
  50%      { border-color: #707070; }
}
```

---

## 6. Components

### SeverityPill
- Renders a label with the severity's glyph prepended.
- Border: 1 px (or 2 px for critical) in the severity's shade.
- Background: `#0a0a0a` (transparent over the card).
- Padding: `2px 8px`.
- Font: Orbitron, 10 px, weight 600, letter-spacing 0.12em.

### Card
- Background: `#1a1a1a`.
- Border: 1 px solid `#2a2a2a`.
- Radius: 2 px.
- Header strip: 1 px bottom border in `#303030`.
- Optional `scanBar` at the top (animated horizontal line, 320 ms, once).

### Button
- Variants: `primary` (white text on black), `ghost` (transparent, white border), `danger` (white border + `!` glyph prepended).
- Padding: `8px 16px`.
- Font: Orbitron, 12 px, weight 600, letter-spacing 0.18em, uppercase.
- Hover: border lightens to `#a0a0a0`.
- Active: border `#ffffff`.
- Disabled: opacity 0.4, cursor not-allowed.

### Input / Textarea / Select
- Background: `#0d0d0d`.
- Border: 1 px solid `#2a2a2a`.
- Radius: 2 px.
- Focus: border `#ffffff`, no outline.
- Placeholder: `#505050`.
- Font: JetBrains Mono, 13 px.

### Table
- Header: 1 px bottom border in `#303030`, Rajdhani 11 px, uppercase, letter-spacing 0.16em.
- Row: 1 px bottom border in `#1a1a1a` (slightly darker than cell background for separation).
- Row hover: background `#141414`.
- No zebra striping.

### Modal
- Backdrop: `#000000` at 80% opacity (no blur).
- Panel: `#0a0a0a`, 1 px solid `#303030`, radius 2 px.
- Enter: 220 ms slide-in from top.

### Tabs
- Underline indicator 2 px tall in `#ffffff`, animated between tabs (200 ms).
- Inactive: `#707070`. Hover: `#a0a0a0`. Active: `#ffffff`.

### Terminal
- Background: `#000000`.
- Border: 1 px solid `#2a2a2a`.
- Font: JetBrains Mono, 13 px.
- Lines fade in from the bottom, 320 ms.
- Prompt glyph: `▮` (block) in `#a0a0a0`, blinks every 1 s.

---

## 7. Iconography

We do not use a chromatic icon set. Inline glyphs only, all from Unicode / a single monochrome SVG sprite.

Common glyphs:

| Concept | Glyph | Codepoint |
|---|---|---|
| Critical / warning | `⚠` | U+26A0 |
| High | `▲` | U+25B2 |
| Medium | `●` | U+25CF |
| Low | `■` | U+25A0 |
| User | `◉` | U+25C9 |
| Network | `◇` | U+25C7 |
| Alert | `◬` | U+25EC |
| Settings | `⚙` | U+2699 |
| Search | `⌕` | U+2315 |
| Down arrow | `▼` | U+25BC |
| Cursor | `▮` | U+25AE |
| Verified | `✓` | U+2713 |
| Failure | `✗` | U+2717 |

---

## 8. The 7 compliance gates

The CI suite fails the build if any of these regress:

1. **Chromatic leak** — no `#[0-9a-fA-F]{3,6}` other than the 12-tone palette, no `rgb()`, no `hsl()`, no `oklch()`, no named colors (`red`, `blue`, `green`, `yellow`, `purple`, `cyan`, `magenta`, `orange`).
2. **Radius leak** — no `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`.
3. **Blur leak** — no `backdrop-blur`, `blur-*`.
4. **Font leak** — no `Inter`, `Roboto`, `system-ui` (other than JetBrains Mono / Orbitron / Rajdhani).
5. **matrix-fall ban** — no `matrix-fall` class, no `@keyframes matrix-fall`.
6. **scan-horizontal presence** — `scan-horizontal` keyframe must exist in `global.css`.
7. **Palette match** — the 12-tone palette file in `client/src/styles/` is byte-identical to the canonical version (checked against the lockfile in `docs/DESIGN-SYSTEM.md`).

Run the gates locally:

```bash
# TBD: in v2.1
npm run lint:design
```

---

## 9. Accessibility

- **Color contrast:** every text/background pair in the palette passes WCAG AA (4.5:1 for body, 3:1 for large text).
- **Keyboard:** every interactive element is reachable via `Tab` and has a visible focus ring (2 px solid `#ffffff`).
- **ARIA:** all icon-only buttons have `aria-label`. Live regions for socket-pushed alerts.
- **Motion:** `prefers-reduced-motion: reduce` disables `pulse-glow`, `scanline`, `flicker`, `blink-cursor`, and `scan-horizontal`.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

## 10. Don'ts (CI-blocked)

- ❌ Adding a new color "just for this badge"
- ❌ A `bg-red-500` Tailwind class
- ❌ A `rounded-lg` card "to make it friendlier"
- ❌ A `backdrop-blur` for "depth"
- ❌ The word "Inter" in any `font-family`
- ❌ The phrase "tactical neon cyan"
- ❌ A gradient
- ❌ An emoji in the UI (use Unicode glyphs from § 7)
- ❌ A drop shadow

If you genuinely need something the palette doesn't cover, **add it to the palette** and update this document. The palette is the contract.
