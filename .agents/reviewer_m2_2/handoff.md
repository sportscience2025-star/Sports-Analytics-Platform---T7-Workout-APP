# Review Handoff Report — Milestone M2_2

## Verdict
**REQUEST_CHANGES**

---

## Findings Summary

### [Major] Finding 1: Falsy Zero Evaluation Bug in 1RM 95% Confidence Interval Display
- **What**: The lower bound of the 95% Confidence Interval displays the estimated 1RM instead of `0.0 kg` when the calculated lower confidence limit (`ci95Min`) is zero.
- **Where**: `js/data-analysis.js`, line 768:
  ```javascript
  <small style="color:var(--text-muted); font-size:0.72rem; display:block; margin-top:4px;">95% CI: [${oneRM.ci95Min ? oneRM.ci95Min.toFixed(1) : rounded1RM.toFixed(1)} - ${oneRM.ci95Max ? oneRM.ci95Max.toFixed(1) : rounded1RM.toFixed(1)} kg] · ${oneRM.toFixed(2)} kg puntuale</small>
  ```
- **Why**: In JavaScript, `0` evaluates to falsy in ternary operations (`oneRM.ci95Min ? ...`). If `ci95Min` evaluates to `0` (e.g., when variance/margin of error equals or exceeds the estimated load), `0 ?` evaluates to `false` and falls back to `rounded1RM.toFixed(1)`. This outputs a misleading confidence interval such as `[120.0 - 145.2 kg]` instead of `[0.0 - 145.2 kg]`. Furthermore, `oneRM.margin` has a similar ternary check at line 767.
- **Suggestion**: Explicitly check for type or nullish values rather than truthiness: `typeof oneRM.ci95Min === 'number' ? oneRM.ci95Min.toFixed(1) : '0.0'`.

### [Major] Finding 2: Chart Lifecycle Defect & Memory Leak on Invalid Dataset Re-Parse
- **What**: Canvas elements and Chart.js instances are destroyed and cleaned up *after* dataset validity checks, bypassing cleanup when insufficient points (< 2) are provided.
- **Where**: `js/data-analysis.js`, lines 729–735:
  ```javascript
  const vbtData = data.filter(d => d.load > 0 && d.velocity > 0);
  if (vbtData.length < 2) {
      dashboard.innerHTML = `<div style="padding: 2rem; border: 1px solid red; color: red;">Dati VBT insufficienti (servono almeno 2 punti Carico-Velocità).</div>`;
      return;
  }

  this.cleanup();
  ```
- **Why**: When a user re-parses or manually inputs an invalid dataset (with < 2 valid VBT points) after having previously rendered active charts, `dashboard.innerHTML` replaces the container elements, removing `<canvas>` elements from the DOM without calling `this.cleanup()`. The active Chart instances (`this.chartInstance` and `this.powerCurveChart`) remain attached to global window listeners and detached canvas DOM elements, causing memory leaks and potential runtime errors when new canvas elements are constructed with duplicate IDs.
- **Suggestion**: Move `this.cleanup()` to line 727, directly at the entry of `renderVBTDashboard`, matching the implementation in `renderJumpDashboard` (line 1126) and `renderRunningDashboard` (line 1089).

### [Minor] Finding 3: Missing Cross-Browser `-webkit-backdrop-filter` Prefixes in Core Layout CSS
- **What**: Structural container elements rely solely on un-prefixed `backdrop-filter`, breaking glassmorphism effects on WebKit browsers (Apple Safari / iOS Safari).
- **Where**: `css/style.css`, line 77 (`.app-header`) and line 445 (`.modal-backdrop`):
  ```css
  /* Line 77 */
  backdrop-filter: blur(10px);
  /* Line 445 */
  backdrop-filter: blur(4px);
  ```
- **Why**: While Milestone 2 additions (`.analysis-chart-card` at line 2503 and `.glass-tooltip` at line 2537) correctly include `-webkit-backdrop-filter`, legacy core elements (`.app-header` and `.modal-backdrop`) omit `-webkit-backdrop-filter`. On Safari (macOS/iOS), backdrop blurring is silently ignored, resulting in un-blurred, opaque or translucent solid backgrounds.
- **Suggestion**: Add `-webkit-backdrop-filter: blur(10px);` to `.app-header` and `-webkit-backdrop-filter: blur(4px);` to `.modal-backdrop` in `css/style.css`.

---

## Handoff Protocol (5-Component Report)

### 1. Observation
- Inspected `js/data-analysis.js` lines 725–785 for 1RM CI integration and chart lifecycle management.
- Observed `oneRM.ci95Min ? oneRM.ci95Min.toFixed(1) : rounded1RM.toFixed(1)` in `js/data-analysis.js:768`.
- Observed `vbtData.length < 2` guard return preceding `this.cleanup()` in `js/data-analysis.js:730–735`.
- Inspected `css/style.css` lines 77, 445, 2502–2537 for `backdrop-filter` declarations.
- Verified that `physics-engine.js` returned `Number` wrapper objects with `ci95Min: 0` when bounds hit zero.

### 2. Logic Chain
1. In JavaScript, numeric `0` is falsy (`Boolean(0) === false`).
2. At `js/data-analysis.js:768`, when `oneRM.ci95Min` is `0`, the ternary expression evaluates to the false branch (`rounded1RM.toFixed(1)`), causing 0 to be rendered as `rounded1RM`.
3. In `renderVBTDashboard`, if data is invalid (< 2 points), `dashboard.innerHTML` is overwritten prior to `this.cleanup()`. Detached DOM nodes hold references to active Chart.js instances, creating orphan chart objects and memory leaks.
4. Safari requires vendor-prefixed `-webkit-backdrop-filter` for CSS glassmorphism. Omission in `.app-header` (line 77) and `.modal-backdrop` (line 445) breaks rendering in WebKit browsers.

### 3. Caveats
- No caveats. Codebase and execution paths were directly inspected and verified.

### 4. Conclusion
Work requires changes prior to approval due to logic flaws in 1RM confidence interval formatting, memory leakage in chart lifecycle handling during invalid data re-parses, and incomplete cross-browser CSS prefix coverage.

### 5. Verification Method
- **1RM CI Bug**: Pass a dataset where regression SEE yields `ci95Min <= 0`. Inspect rendered element `#dashboard-container small` to confirm lower bound displays `0.0 kg` rather than `rounded1RM`.
- **Chart Lifecycle**: Render valid VBT data, then trigger manual calculation with 0 or 1 point. Check `window.Chart.instances` or memory allocation to verify all chart instances are cleanly destroyed.
- **CSS Compatibility**: Inspect CSS rules for `.app-header` and `.modal-backdrop` using Safari Developer Tools or verify presence of `-webkit-backdrop-filter` in stylesheet.

---

## Adversarial Critique & Stress-Test Results
- **Integrity Violation Check**: PASS — No hardcoded test values, facade methods, or self-certifying shortcuts detected in source code.
- **Stress Scenario 1 (Zero/Negative 1RM Bounds)**: Triggered when user inputs identical velocity values across loads or extreme variance. Lower bound fails gracefully in math but fails in UI display due to truthiness check.
- **Stress Scenario 2 (Rapid Tab Switching / Re-parsing)**: Re-parsing multiple files rapidly properly invokes `cleanup()` *only* if valid VBT datasets are processed; fails cleanup on invalid datasets.
