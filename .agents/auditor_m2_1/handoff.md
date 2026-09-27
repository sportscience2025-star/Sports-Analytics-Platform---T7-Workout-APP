# Forensic Integrity Audit Handoff Report

## Forensic Audit Report

**Work Product**: `js/data-analysis.js`, `css/style.css`, `index.html`  
**Profile**: General Project (Milestone 2 Analytics & UI)  
**Verdict**: VIOLATION  

---

### Phase Results
- **Hardcoded Chart Values Check**: PASS — Chart datasets in `js/data-analysis.js` are dynamically computed using `PhysicsEngine` regressions and formulas.
- **Mock Tooltips & Shadow Styles Check**: PASS — Glassmorphism tooltips and neon glow shadow styles are genuinely implemented via custom CSS and Chart.js plugin hooks.
- **neonGlowPlugin Verification**: PASS — Genuine custom plugin in `js/data-analysis.js` manipulating HTML5 Canvas context `shadowColor` and `shadowBlur`.
- **Glassmorphism Tooltips Verification**: PASS — Genuine HTML custom tooltip handler (`glassTooltipHandler`) bound with CSS backdrop-filter blur styles in `css/style.css`.
- **1RM CI UI Binding Verification**: FAIL — Critical data type mismatch and broken UI binding in `renderVBTDashboard` causing `NaN` propagation and runtime `TypeError`.

---

## 1. Observation

Direct code inspections revealed the following evidence across the milestone files:

1. **`js/data-analysis.js` (Lines 737–770)**:
   ```javascript
   737: const mvt      = parseFloat(document.getElementById('vbt-mvt-input').value) || 0.30;
   738: const reg      = (window.PhysicsEngine.autoSelectRegressionVBT ? window.PhysicsEngine.autoSelectRegressionVBT(vbtData) : null) || window.PhysicsEngine.linearRegressionVBT(vbtData);
   ...
   740: const oneRM        = window.PhysicsEngine.estimate1RM(reg, mvt, { detailed: true });
   ...
   744: const rounded1RM   = Math.round(oneRM / 2.5) * 2.5;
   745: const zoneTable    = window.PhysicsEngine.generateLoadVelocityTable(oneRM, reg);
   746: const progression  = window.PhysicsEngine.generateVBTProgression(oneRM, reg, 6);
   ```
   And in the HTML template string (Lines 767–768):
   ```javascript
   767: <div style="font-size:1.8rem; font-weight:800; color:white;">${rounded1RM} <span style="font-size:0.9rem; font-weight:400;">kg</span> <span style="font-size:0.85rem; font-weight:600; color:#10b981;">(± ${oneRM.margin ? oneRM.margin.toFixed(1) : '0.0'} kg)</span></div>
   768: <small style="color:var(--text-muted); font-size:0.72rem; display:block; margin-top:4px;">95% CI: [${oneRM.ci95Min ? oneRM.ci95Min.toFixed(1) : rounded1RM.toFixed(1)} - ${oneRM.ci95Max ? oneRM.ci95Max.toFixed(1) : rounded1RM.toFixed(1)} kg] · ${oneRM.toFixed(2)} kg puntuale</small>
   ```

2. **`js/physics-engine.js` (Lines 552–560)**:
   ```javascript
   if (options && options.detailed) {
       return {
           value: est,
           estimated: est,
           ci95Min,
           ci95Max,
           margin,
           ci95: [ci95Min, ci95Max]
       };
   }
   ```

3. **`js/data-analysis.js` (Lines 9–34)**:
   `neonGlowPlugin` is defined with `beforeDatasetDraw` setting `ctx.shadowColor` and `ctx.shadowBlur` from dataset properties, and `afterDatasetDraw` calling `ctx.restore()`.

4. **`css/style.css` (Lines 2531–2576)**:
   Classes `.glass-tooltip`, `.glass-tooltip-title`, `.glass-tooltip-body`, and `.glass-tooltip-indicator` provide genuine glassmorphism styling (`backdrop-filter: blur(16px)`).

---

## 2. Logic Chain

1. **Step 1 (Observation 2)**: When `PhysicsEngine.estimate1RM(reg, mvt, { detailed: true })` is executed with `{ detailed: true }`, it returns a plain JavaScript `Object` containing `{ value, estimated, ci95Min, ci95Max, margin, ci95 }`.
2. **Step 2 (Observation 1, Line 740)**: `renderVBTDashboard` calls `estimate1RM` with `{ detailed: true }` and stores the resulting object directly into the variable `oneRM`.
3. **Step 3 (Observation 1, Line 744)**: `renderVBTDashboard` performs mathematical operation `oneRM / 2.5`. In JavaScript, dividing a plain Object by a number coerces the Object via `Number({})`, which evaluates to `NaN`. Consequently, `rounded1RM` becomes `NaN`.
4. **Step 4 (Observation 1, Lines 745–746)**: `oneRM` (the plain Object) is passed directly to `generateLoadVelocityTable` and `generateVBTProgression`. Both functions execute arithmetic multiplications (`oneRM * z.pct`), causing all table outputs and load values across the VBT dashboard to render as `NaN`.
5. **Step 5 (Observation 1, Line 768)**: The template string invokes `${oneRM.toFixed(2)}`. Because `oneRM` is a plain JS Object and not a `Number`, `oneRM.toFixed` is `undefined`. Invoking it causes an uncaught runtime exception (`TypeError: oneRM.toFixed is not a function`), which completely breaks execution and crashes the rendering of the VBT dashboard.

---

## 3. Caveats

- **Scope**: Audit focused specifically on `js/data-analysis.js`, `css/style.css`, and `index.html` as requested.
- **Assumptions**: `PhysicsEngine.estimate1RM` return signature is fixed per `physics-engine.js`.
- No other caveats.

---

## 4. Conclusion

**Verdict: VIOLATION**

While `neonGlowPlugin` and external HTML glassmorphism tooltips are genuinely implemented and functional, the **1RM Confidence Interval UI binding in `js/data-analysis.js` is defective and broken**. The data type mismatch between `PhysicsEngine.estimate1RM` (which returns a detailed result object) and `renderVBTDashboard` (which expects a numeric primitive) results in `NaN` displays and an uncaught runtime `TypeError` when rendering the VBT analytics dashboard.

---

## 5. Verification Method

1. **Inspect `js/data-analysis.js`**:
   - Check line 740 to verify `oneRM` receives an Object from `PhysicsEngine.estimate1RM(reg, mvt, { detailed: true })`.
   - Check line 768 to observe `${oneRM.toFixed(2)}`.
2. **Execute in Browser Console**:
   ```javascript
   const reg = window.PhysicsEngine.linearRegressionVBT([{load:60, velocity:1.0}, {load:100, velocity:0.5}]);
   const oneRM = window.PhysicsEngine.estimate1RM(reg, 0.30, { detailed: true });
   console.log(oneRM / 2.5); // Returns NaN
   console.log(oneRM.toFixed(2)); // Throws TypeError: oneRM.toFixed is not a function
   ```
3. **Invalidation Condition**: The violation is resolved when `renderVBTDashboard` properly extracts numeric values (e.g. `const oneRMVal = oneRM.estimated;`) for calculations and formatting, ensuring zero runtime errors and valid numerical rendering.
