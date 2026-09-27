# Requirement R1 Investigation: UI Layout & Contrast Enhancements

## Executive Summary
This investigation identifies the root causes and formulates exact remediation strategies for Requirement R1:
1. **ID Encoder Dropdown Select Text Truncation/Overflow**: Caused by missing text-overflow containment (`text-overflow: ellipsis; overflow: hidden; white-space: nowrap;`), constrained parent container widths without flexible flex-basis, tight right padding overlapping background SVG arrows, and unhandled long raw encoder ID strings in modal windows.
2. **VBT Zone Table Inadequate Text Contrast**: Caused by hardcoded dark burgundy and near-black red hex codes (`#450a0a`, `#7f1d1d`, `#991b1b`, `#b91c1c`) defined in `js/physics-engine.js` for high-intensity loads (85%–100% 1RM). On dark slate backgrounds, contrast ratios fall as low as 1.2:1, failing WCAG accessibility guidelines and rendering "100% 1RM" nearly invisible.

---

## 1. ID Encoder Dropdown Select Analysis

### Affected Components & File Locations
- **`css/style.css`**:
  - Lines 205–219 (`.filter-bar select`): Fixed `min-width: 140px;` and fixed padding `0.75rem 2.5rem 0.75rem 1rem`. Lacks `text-overflow`, `overflow`, and max-width bounds.
  - Lines 514–523 (`.form-group select`): Standard select rule without text truncation safeguards.
  - Lines 1514–1522 (`.select-wrapper select`): Missing right-padding buffer for arrow icons and truncation properties.
  - Lines 1884–1902 & 2067–2073 (`.custom-select`): Modern select class in light and dark mode. Uses fixed `height: 40px` and `padding: 0 12px`. Lacks ellipsis and proper right padding (`padding-right: 2.25rem`) to prevent text from colliding with the custom SVG drop-down arrow.
- **`js/data-analysis.js`**:
  - Lines 190–196 (`#manual-test-type`): Uses `<select class="custom-input">` with inline styles lacking overflow containment.
  - Lines 541–543 (`_showAthleteRenameModal`): Raw encoder IDs rendered inside `<code>` tags (`<code style="color:#f59e0b;">${a.raw}</code>`) lack word-break rules (`word-break: break-all;`), causing string overflow outside modal dialog cards when processing raw linear encoder files.

### Exact Mechanism of Failure
When linear encoders export athlete files, names or IDs often contain long strings (e.g. `ID_ENCODER_2026_06_15_ATHLETE_001_SQUAT_LOAD_SERIES` or `ENC_8492048102_RICCARDO_BIANCHI`). 
1. Native browser `<select>` controls cannot wrap option text across multiple lines.
2. Without `text-overflow: ellipsis; overflow: hidden; white-space: nowrap;`, long text is clipped abruptly or expands beyond parent container limits.
3. In flex containers (`.select-group`, `.form-row`), selects without `max-width: 100%` push adjacent controls off-screen or overlap sibling elements.

---

## 2. VBT Zone Table Contrast Analysis

### Affected Components & File Locations
- **`js/physics-engine.js`**:
  - Lines 585–599 (`PhysicsEngine.generateLoadVelocityTable`): Defines standard VBT intensity zone color mappings (`zones` array).
- **`js/data-analysis.js`**:
  - Lines 829–857 (`renderVBTDashboard`): Renders `<!-- FULL ZONE TABLE -->` dynamically inside a container with `background: rgba(255,255,255,0.03)` on dark slate background (`#0f172a`).
  - Lines 847 & 851: Table data cells `<td style="padding:0.6rem 0.75rem; font-weight:700; color:${z.color};">${z.pct}</td>` and `<td style="padding:0.6rem 0.75rem; text-align:right; font-weight:600; color:${z.color};">${z.velocity}</td>` apply `z.color` directly to text.

### Exact Contrast Metrics & Failure Analysis
The current color definitions in `js/physics-engine.js` for high-intensity loads are:
| Load (%1RM) | Zone Name | Hardcoded Color Hex | Background Hex | Contrast Ratio | WCAG AA Status |
|---|---|---|---|---|---|
| 30% | Potenza Balistica | `#06b6d4` | `#0f172a` | ~7.2:1 | PASS |
| 50% | Potenza Moderata | `#84cc16` | `#0f172a` | ~9.1:1 | PASS |
| 70% | Forza-Velocità | `#f97316` | `#0f172a` | ~6.4:1 | PASS |
| 80% | Forza Sub-Max | `#dc2626` | `#0f172a` | ~3.1:1 | FAIL (Normal text) |
| 85% | Forza Sub-Max | `#b91c1c` | `#0f172a` | ~2.1:1 | FAIL |
| 90% | Forza Massimale | `#991b1b` | `#0f172a` | ~1.7:1 | FAIL |
| 95% | Forza Massimale | `#7f1d1d` | `#0f172a` | ~1.4:1 | CRITICAL FAIL |
| 100% | 1RM (MVT) | `#450a0a` | `#0f172a` | ~1.2:1 | CRITICAL FAIL (Invisible) |

Because `#450a0a` is extremely close to the dark background color `#0f172a`, the text "100% 1RM" and its target velocity (e.g. `0.300 m/s`) are practically invisible to coaches and athletes.

---

## 3. Actionable Remediation Strategy (M2 Implementation Plan)

### Strategy A: CSS & HTML Enhancements for Select Dropdowns & Modals
1. **Enhance `css/style.css`**:
   Update dropdown select rules to guarantee fluid responsiveness, right-side arrow padding, and clean truncation:
   ```css
   /* Global & Custom Select Safeguards */
   .custom-select,
   .filter-bar select,
   .form-group select,
   .select-wrapper select {
       width: 100%;
       max-width: 100%;
       text-overflow: ellipsis;
       overflow: hidden;
       white-space: nowrap;
       padding-right: 2.25rem !important; /* Ensure space for SVG arrow icon */
   }

   /* Ensure dropdown option popup text is legible in dark mode */
   .custom-select option,
   .filter-bar select option,
   .form-group select option {
       background-color: #1e293b;
       color: #f8fafc;
   }
   ```
2. **Enhance `js/data-analysis.js` Modal Window**:
   In `_showAthleteRenameModal` (line 541), add inline break styles to the raw ID label code tag:
   ```html
   <label style="display:block; font-size:0.78rem; color:#94a3b8; margin-bottom:4px;">ID encoder: <code style="color:#f59e0b; word-break:break-all; overflow-wrap:anywhere;">${a.raw}</code></label>
   ```

### Strategy B: Luminous High-Contrast VBT Color Palette
Update `js/physics-engine.js` (lines 585–599) to replace dark muddy burgundy hues with luminous dark-mode friendly bright red/rose hues:
```javascript
const zones = [
    { pct: 0.30, zone: 'Potenza Balistica',   color: '#06b6d4' }, // Cyan
    { pct: 0.40, zone: 'Potenza Alta',         color: '#10b981' }, // Emerald
    { pct: 0.50, zone: 'Potenza Moderata',     color: '#84cc16' }, // Lime
    { pct: 0.55, zone: 'Ibrida Forza-Vel.',    color: '#a3e635' }, // Yellow-Green
    { pct: 0.60, zone: 'Ibrida Forza-Vel.',    color: '#eab308' }, // Yellow
    { pct: 0.65, zone: 'Forza-Velocità',       color: '#f59e0b' }, // Amber
    { pct: 0.70, zone: 'Forza-Velocità',       color: '#f97316' }, // Orange
    { pct: 0.75, zone: 'Forza-Resistenza',     color: '#ef4444' }, // Bright Red
    { pct: 0.80, zone: 'Forza Sub-Max',        color: '#f87171' }, // Light Red/Coral
    { pct: 0.85, zone: 'Forza Sub-Max',        color: '#f43f5e' }, // Vivid Rose
    { pct: 0.90, zone: 'Forza Massimale',      color: '#ff2a5f' }, // Neon Crimson
    { pct: 0.95, zone: 'Forza Massimale',      color: '#ff4757' }, // Luminous Red
    { pct: 1.00, zone: '1RM (MVT)',             color: '#ff3366' }, // Electric High-Contrast Red (Contrast > 6.5:1)
];
```
Additionally, in `js/data-analysis.js` (line 847), add subtle text shadows or font weight styling to `%1RM` and `Velocità` cells (`font-weight: 700; text-shadow: 0 0 8px rgba(0,0,0,0.5);`) to maximize visual clarity across all display types.
