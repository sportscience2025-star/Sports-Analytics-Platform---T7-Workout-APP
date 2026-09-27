# Requirement R2: Force-Velocity Imbalance (Sfv) Deep Dive & Fix Analysis

## 1. Executive Summary
Investigation into Requirement R2 (Force-Velocity Imbalance / Sfv Fix) for the T7 Workout PWA revealed the exact root cause of the `"undefined"` text rendering on the Sfv UI components. When the VBT physics engine auto-selects a quadratic regression model, the `fvBias` property is omitted from the result object. When `data-analysis.js` binds `${reg.fvBias}` directly into the DOM without fallback validation, JavaScript casts `undefined` to `"undefined"`. Furthermore, existing UI bindings rendered verbose descriptive text rather than pure numerical values as required by R2.

This report documents the precise file locations, code structures, root causes, and provides an exact math and UI binding fix strategy.

---

## 2. Codebase Audit & Component Locations

### A. Physics Engine (`js/physics-engine.js`)
* **Linear Regression Model (`linearRegressionVBT`, lines 91–163)**:
  * Calculates `sfvp` (Sfv percentage) at line 120:
    ```javascript
    const sfvp = f0 > 0 ? ((loadAtMaxPower - pmaxLoad) / pmaxLoad) * 100 : 0;
    ```
  * Constructs descriptive string `fvBias` at lines 131–134:
    ```javascript
    let fvBias;
    if      (sfvp >  15) fvBias = 'Orientato alla Forza (+' + sfvp.toFixed(0) + '%) → Lavorare sulla velocità/potenza';
    else if (sfvp < -15) fvBias = 'Orientato alla Velocità (' + sfvp.toFixed(0) + '%) → Lavorare sulla forza massimale';
    else                 fvBias = 'Profilo Bilanciato (' + sfvp.toFixed(0) + '%) → Ottimale per la potenza';
    ```
  * Returns both `sfvp` (line 152) and `fvBias` (line 159) in the result object.

* **Quadratic Regression Model (`quadraticRegressionVBT`, lines 265–393)**:
  * Calculates `sfvp` at line 351:
    ```javascript
    const sfvp = f0 > 0 ? ((loadAtMaxPower - pmaxLoad) / pmaxLoad) * 100 : 0;
    ```
  * **Critical Defect**: Fails to calculate `fvBias` and omits `fvBias` completely from the returned object (lines 360–392).

* **Model Auto-Selection (`autoSelectRegressionVBT`, lines 439–465)**:
  * Evaluates dataset size and $R^2$ gain to dynamically select between linear and quadratic models. When quadratic model is selected, `reg.fvBias` becomes `undefined`.

### B. UI Rendering & DOM Binding (`js/data-analysis.js`)
* **VBT Dashboard Renderer (`renderVBTDashboard`, lines 749–960)**:
  * Invokes regression model at line 761: `const reg = window.PhysicsEngine.autoSelectRegressionVBT(vbtData)...`
  * **Sfv Slider & Badge Component (lines 830–852)**:
    * Slider indicator width uses `reg.sfvp` (lines 841–844).
    * Sfv text badge next to slider binds `${reg.fvBias}` directly into HTML at line 850:
      ```html
      <div style="background:rgba(255,255,255,0.06); border-radius:8px; padding:0.6rem 1rem; font-size:0.88rem; color:white; white-space:nowrap;">
          ${reg.fvBias}
      </div>
      ```
  * **Qualitative Analysis Grid (lines 934–957)**:
    * Binds `${reg.fvBias}` into HTML at line 946:
      ```html
      <p style="color:var(--text-muted); font-size:0.78rem; margin:0 0 4px 0; text-transform:uppercase; letter-spacing:0.05em;">Squilibrio F-V (Sfvp)</p>
      <p style="color:white; font-size:0.92rem; margin:0;">${reg.fvBias}</p>
      ```

---

## 3. Root Cause Analysis

1. **Missing Data Property in Quadratic Regression**: `quadraticRegressionVBT` in `js/physics-engine.js` returns an object containing `sfvp` but missing `fvBias`. When the auto-selection algorithm chooses quadratic regression (e.g. for datasets with $\ge 4$ non-linear points and improved $R^2_{\text{adj}}$), `reg.fvBias` is `undefined`.
2. **Unvalidated UI Binding**: `js/data-analysis.js` binds `${reg.fvBias}` directly into string literals without checking for `null`/`undefined` or fallback values. In JS template literals, `${undefined}` evaluates to `"undefined"`.
3. **Requirement R2 Non-Compliance**: The current UI bindings display long descriptive strings (e.g., `'Orientato alla Forza (+18%) → Lavorare sulla velocità/potenza'`). Requirement R2 mandates displaying **ONLY pure numerical values** (e.g. `+18.0%` or `-12.5%`) without descriptive text, preventing UI clutter and string representation errors.

---

## 4. Proposed Math & UI Fix Strategy

### A. Physics Engine Math Enhancements (`js/physics-engine.js`)

1. **Add Robust Math Guard for `sfvp`**: Ensure calculation prevents `NaN`, `Infinity`, or division by zero in both linear and quadratic models:
   ```javascript
   const sfvp = (f0 > 0 && pmaxLoad > 0 && Number.isFinite(pmaxLoad)) 
       ? ((loadAtMaxPower - pmaxLoad) / pmaxLoad) * 100 
       : 0;
   const validSfvp = Number.isFinite(sfvp) ? sfvp : 0;
   ```

2. **Add Missing `fvBias` Property to Quadratic Model**:
   Include `fvBias` generation in `quadraticRegressionVBT` for API consistency across regression models:
   ```javascript
   let fvBias;
   if      (validSfvp >  15) fvBias = 'Orientato alla Forza (+' + validSfvp.toFixed(0) + '%) → Lavorare sulla velocità/potenza';
   else if (validSfvp < -15) fvBias = 'Orientato alla Velocità (' + validSfvp.toFixed(0) + '%) → Lavorare sulla forza massimale';
   else                      fvBias = 'Profilo Bilanciato (' + validSfvp.toFixed(0) + '%) → Ottimale per la potenza';
   ```
   And return `fvBias` in the quadratic return object.

### B. UI Binding & Pure Numerical Formatting (`js/data-analysis.js`)

1. **Calculate Pure Numerical Formatting Variable**:
   In `renderVBTDashboard`, before generating HTML, create a safe, pure numerical display string:
   ```javascript
   const rawSfvp = Number.isFinite(reg.sfvp) ? reg.sfvp : 0;
   const pureSfvFormatted = (rawSfvp > 0 ? '+' : '') + rawSfvp.toFixed(1) + '%';
   ```

2. **Update Sfv Slider Badge (Line 848–851)**:
   Replace descriptive text binding `${reg.fvBias}` with the pure numerical value `${pureSfvFormatted}`:
   ```html
   <!-- Before: ${reg.fvBias} -->
   <!-- Proposed After: -->
   <div style="background:rgba(255,255,255,0.06); border-radius:8px; padding:0.6rem 1rem; font-size:1.1rem; font-weight:700; color:white; white-space:nowrap;">
       ${pureSfvFormatted}
   </div>
   ```

3. **Update Qualitative Analysis Grid (Line 944–947)**:
   Replace `${reg.fvBias}` with `${pureSfvFormatted}`:
   ```html
   <!-- Before: ${reg.fvBias} -->
   <!-- Proposed After: -->
   <div>
       <p style="color:var(--text-muted); font-size:0.78rem; margin:0 0 4px 0; text-transform:uppercase; letter-spacing:0.05em;">Squilibrio F-V (Sfvp)</p>
       <p style="color:white; font-size:0.92rem; font-weight:600; margin:0;">${pureSfvFormatted}</p>
   </div>
   ```

4. **Service Worker Cache Invalidation Reminder**:
   Upon implementation, `sw.js` cache version must be bumped (e.g. `t7-workout-v14` -> `t7-workout-v15`) as per project safety rules.

---

## 5. Verification Plan

1. **Unit & Mathematical Testing**:
   Run `py run_all_js_tests.py` or Node test scripts (`node test_load_velocity.js`) to verify linear and quadratic regression outputs for datasets trigger valid numerical `sfvp` values without returning `undefined` or `NaN`.
2. **DOM Rendering Inspection**:
   Verify that both linear and quadratic model VBT dashboards render pure numerical percentages (e.g., `+12.4%`, `-18.0%`, `0.0%`) on the Sfv badge and summary card, with zero occurrences of `"undefined"`.
