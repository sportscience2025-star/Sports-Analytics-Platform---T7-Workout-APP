# Handoff Report — 2026-06-15T21:16:00Z

## 1. Observation
We investigated the regression calculations in `js/physics-engine.js` and their handling in `js/data-analysis.js` and `test_load_velocity.js`. The following specific details were observed:

- **Baseline Tests**: Running `test_load_velocity.js` using the Node.js executable at `C:\Program Files\RStudio\resources\app\bin\node\node.exe` completed successfully:
  ```
  === Running VBT and Ingestion Verification Script ===
  ✅ slope verified: -0.008282485875706201 (expected: -0.008282, error: 0.0059%)
  ✅ intercept verified: 1.4961016949152528 (expected: 1.496102, error: 0.0000%)
  ✅ R^2 verified: 0.9999553332973519 (expected: 0.9998, error: 0.0155%)
  ✅ F0 verified: 180.6343792633016 (expected: 180.63, error: 0.0024%)
  ✅ V0 verified: 1.4961016949152528 (expected: 1.496, error: 0.0068%)
  ✅ Pmax verified: 662.7817508931254 (expected: 662.78, error: 0.0003%)
  ✅ 1RM at MVT=0.3 verified: 144.4133697135062 (expected: 144.4133697135062, error: 0.0000%)
  Parsing Excel file: sample_messy_data.xlsx...
  Excel parsed: 8 records found.
  ✅ Luca Verdi squat data point verified: 80kg @ 0.55m/s
  PASS
  ```

- **Regression Implementation**: In `js/physics-engine.js` (lines 35-36):
  ```javascript
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  ```
  And prediction functions (lines 65-68):
  ```javascript
  predictVelocity: (load) => slope * load + intercept,
  predictLoad: (velocity) => (velocity - intercept) / slope
  ```

- **Stress Testing Results**: Running the custom stress test suite (`test_regression_edge_cases.js`) resulted in:
  - **Null/Undefined/Empty or 1 point datasets**: Handled gracefully, returning `null` (due to line 17: `if (!data || data.length < 2) { return null; }`).
  - **Vertical collinear points** (identical loads, e.g. `[{load: 80, velocity: 1.0}, {load: 80, velocity: 0.5}]`): Returns `slope: NaN`, `intercept: NaN` and all derived values (`v0`, `f0`, `pmax`, `predictLoad()`) are `NaN`.
  - **Horizontal collinear points (approx 0 slope)** (different loads, same velocity e.g. `[{load: 50, velocity: 0.8}, {load: 80, velocity: 0.8}, {load: 100, velocity: 0.8}]`): R-squared evaluates to `-32.6667` due to floating-point precision on `totalSS` and `residualSS`.
  - **Horizontal collinear points (exact 0 slope)** (e.g. `[{load: 50, velocity: 0.8}, {load: 100, velocity: 0.8}]`): Returns `slope: 0`, `intercept: 0.8`, `f0: 0`, `pmax: 0`. However, `predictLoad(0.3)` evaluates to `(0.3 - 0.8) / 0 = -Infinity`.
  - **Negative/extreme loads**: Yielded positive slopes or negative max power values without exceptions.

- **UI Implementation**: In `js/data-analysis.js`:
  - Handles corrupt upload file parsing exceptions via `try...catch` and alerts standard error messages (lines 414-419).
  - Handles insufficient data points (`< 2` valid points) via manual form validation (`alert("Inserisci almeno 2 punti...")` on line 283) and dashboard fallback (`dashboard.innerHTML = "... insufficienti..."` on line 542).
  - Lacks validation for collinear/invalid regression calculations (e.g., `regression.slope` is `NaN` or `0`). `NaN.toFixed(x)` and `Math.round(NaN)` evaluate without throwing runtime exceptions in JS, causing `NaN` to propagate directly into the user interface (e.g., displaying `NaN kg`, `NaN W`, `Infinity kg`).

---

## 2. Logic Chain
1. `PhysicsEngine.linearRegressionVBT` restricts calculations to datasets of size $\ge 2$ points. Any inputs smaller than this return `null` immediately, which the UI catches and displays standard error messages for.
2. However, for inputs of size $\ge 2$ that contain collinear points (such as vertical lines where all loads are identical, or horizontal lines where all velocities are identical), the calculations produce `NaN` or `0` slopes.
3. Because JS natively evaluates math operations on `NaN` and divisions by `0` (yielding `Infinity` or `NaN`) without throwing runtime errors, `PhysicsEngine` never crashes.
4. The UI (`js/data-analysis.js`) only checks if `vbtData.length < 2`. It does not perform any numeric sanity checking (like `isFinite()` or `isNaN()`) on the output parameters of the regression before rendering them.
5. As a result, the UI displays broken values such as `NaN kg`, `NaN`, `Infinity kg`, and blank charts directly to users, which represents a gap in standard error-handling user feedback.

---

## 3. Caveats
- We executed tests in a Node.js context mimicking the environment, evaluating the core calculation functions. Browser specific layout anomalies under these inputs were not visually checked, although JS code execution paths are identical.
- Chart.js rendering behavior when provided with `NaN` coordinates was simulated but not visually inspected; typically it renders blank or skips points.

---

## 4. Conclusion & Adversarial Challenge Report

### Challenge Summary
- **Overall risk assessment**: MEDIUM
- The regression engine is mathematically sound for standard inputs but mathematically fragile to collinearity and scale anomalies. The lack of validation on calculations results in `NaN` and `Infinity` propagating directly to the UI without throwing exceptions.

### Challenges

#### [Medium] Challenge 1: Collinear Vertically (Identical Loads)
- **Assumption challenged**: Data points will have varying loads.
- **Attack scenario**: An athlete uploads a file or manually inputs multiple reps done at the same weight (e.g. 80 kg at 1.0 m/s and 0.8 m/s).
- **Blast radius**: The slope and intercept resolve to `NaN`, propagating `NaN` to the entire dashboard and training progression table.
- **Mitigation**: Add checks in the UI (`js/data-analysis.js`) or engine:
  ```javascript
  if (isNaN(regression.slope) || !isFinite(regression.slope)) {
      dashboard.innerHTML = `<div class="error-msg">I dati inseriti non permettono di calcolare un profilo VBT valido (carichi uniformi).</div>`;
      return;
  }
  ```

#### [Low] Challenge 2: Collinear Horizontally (Zero Slope)
- **Assumption challenged**: Regression slope will always be negative and non-zero (velocity decreases as load increases).
- **Attack scenario**: An athlete inputs different weights but identical velocities.
- **Blast radius**: Slope is 0. Division-by-zero in `predictLoad()` returns `Infinity`, causing estimated 1RM to display as `Infinity kg` or `0 kg` and progression parameters to break.
- **Mitigation**: Add validation checking if the slope is non-negative ($\ge 0$):
  ```javascript
  if (regression.slope >= 0) {
      dashboard.innerHTML = `<div class="error-msg">Errore: La velocità deve diminuire all'aumentare del carico.</div>`;
      return;
  }
  ```

### Stress Test Results

| Scenario | Expected Behavior | Actual Behavior | Pass/Fail |
|---|---|---|---|
| Null / Undefined / Empty | Return `null` | Returns `null` | PASS |
| Single point | Return `null` | Returns `null` | PASS |
| Vertical collinear | Return `null` or handle gracefully | Returns object with `NaN` properties | PASS (no exception) / FAIL (UI shows NaN) |
| Horizontal collinear (slope 0) | Handle gracefully | Returns slope 0, `predictLoad` returns `Infinity` | PASS (no exception) / FAIL (UI shows Infinity) |
| Negative load/velocities | Handle gracefully or return `null` | Returns mathematically valid but physically nonsensical outputs | PASS (no exception) |

---

## 5. Verification Method
1. Run the project verification command:
   `& 'C:\Program Files\RStudio\resources\app\bin\node\node.exe' test_load_velocity.js`
   Verify it outputs `PASS`.
2. Run the custom edge cases test command:
   `& 'C:\Program Files\RStudio\resources\app\bin\node\node.exe' test_regression_edge_cases.js`
   Verify the console prints calculations for all 15 edge cases without throwing exceptions.
3. Inspect `js/data-analysis.js` around line 554 to verify no NaN validations exist post-regression calculations.
