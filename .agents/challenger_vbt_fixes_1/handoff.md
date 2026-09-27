# Handoff Report — challenger_vbt_fixes_1

## 1. Observation
We examined the physics engine logic in `js/physics-engine.js` and Excel parsing logic in `js/parser.js`. We executed standard, regression, and parsing stress tests using node.exe. The following specific observations were recorded:

### A. Linear Regression Extreme Collinearity / Nearly Horizontal Slope
- In `js/physics-engine.js`, the regression slope and intercept are calculated as:
  ```javascript
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  ```
- In Test 7 of `test_regression_edge_cases.js`, with input dataset `[{"load":50,"velocity":0.8},{"load":80,"velocity":0.8},{"load":100,"velocity":0.8}]`, floating-point precision error leads to a tiny, non-zero slope of `-2.991758887410948e-17` and intercept of `0.8000000000000024`.
- Because this tiny slope is used as a divisor to calculate the theoretical absolute force $F_0$ (`f0 = slope !== 0 ? -intercept / slope : 0`), $F_0$ blows up to `26740122787512400` kg.
- The corresponding force in Newtons ($F_0\_N = F_0 \times 9.81$) becomes `262320604545496670` N, and peak power ($P_{max} = 0.25 \times F_0\_N \times V_0$) becomes `52464120909099490` W.
- Calling `predictLoad(0.3)` or estimating 1RM under these conditions yields `16712576742195282` kg.

### B. Division by Zero in `predictLoad`
- In `js/physics-engine.js` line 84, the function `predictLoad` is defined as:
  ```javascript
  predictLoad: (velocity) => (velocity - intercept) / slope
  ```
- In Test 7b of `test_regression_edge_cases.js`, with input dataset `[{"load":50,"velocity":0.8},{"load":100,"velocity":0.8}]`, the slope is exactly `0`.
- Calling `regression.predictLoad(0.3)` evaluates to `(0.3 - 0.8) / 0 = -Infinity`. Calling it with `0.8` returns `NaN`. There is no check against `slope === 0` inside `predictLoad` itself.

### C. Unit Conversion Discontinuity in `calculateRSI`
- In `js/physics-engine.js` lines 167-179, the function `calculateRSI` is defined as:
  ```javascript
  static calculateRSI(jumpHeight, contactTime) {
      if (typeof jumpHeight !== 'number' || typeof contactTime !== 'number' || isNaN(jumpHeight) || isNaN(contactTime)) {
          return 0;
      }
      if (jumpHeight <= 0 || contactTime <= 0) {
          return 0;
      }
      let heightM = jumpHeight;
      if (jumpHeight > 2.0) {
          heightM = jumpHeight / 100;
      }
      return heightM / contactTime;
  }
  ```
- The threshold `2.0` divides heights in meters from heights in centimeters. For inputs:
  - `calculateRSI(2.0, 0.2)` returns `10.0` (interpreting `2.0` as meters).
  - `calculateRSI(2.1, 0.2)` returns `0.105` (interpreting `2.1` as centimeters, dividing by 100).
- This introduces a 95.2% sudden discontinuity drop in the calculated RSI at the boundary of `2.0`.
- If an athlete inputs jump height in cm but it happens to be small (e.g. `1.8` cm for rapid hops/ankle stiffness bounds), it is treated as `1.8` meters, producing a 100x overestimation.
- Additionally, the UI code in `js/data-analysis.js` (lines 784, 788, 808) always appends `' cm'` to displayed heights, leading to confusion if the values were parsed in meters (e.g. displaying `0.3 cm` for a `30 cm` jump).

### D. Missing `dropHeight` Ingestion Guard
- In `js/parser.js` line 96, parsed Excel rows are filtered using the following guard:
  ```javascript
  if (record.load > 0 || record.distance > 0 || record.jumpHeight > 0 || record.contactTime > 0) {
      allRecords.push(record);
  }
  ```
- The metric `record.dropHeight` is omitted from this guard.
- When running `test_stress_parser.js`, the test case `"Drop Height Header Mapping"` fails because the Excel sheet contains only `dropHeight` metrics along with athlete and exercise names. Since `dropHeight` is not checked in the guard, the record is excluded, resulting in an empty array and throwing `"Nessun dato utile trovato nel file Excel."`.

### E. progression Table Negative/NaN Power Values
- In `js/physics-engine.js` line 136, power is calculated as:
  ```javascript
  power: Math.round(this.calculatePower(this.calculateForce(roundedLoad), predictedVel))
  ```
- While `velocity` is clamped via `Math.max(0.1, predictedVel).toFixed(2)`, the power calculation uses the raw, unclamped `predictedVel`.
- If the regression slope is positive (e.g. due to bad user inputs) or very steep, `predictedVel` can be negative or `NaN`.
- This results in a physical absurdity of negative or `NaN` power values in the predictive progression table.

---

## 2. Logic Chain
1. **Collinearity Vulnerability**:
   - Because `slope` can be close to zero without being exactly zero, any code performing division by `slope` (such as $F_0$ and `predictLoad`) is vulnerable to division by an infinitesimal number.
   - This translates to astronomical values in biomechanical outputs ($F_0$, $P_{max}$, 1RM estimates) instead of throwing an error or being bounded.
2. **`predictLoad` Zero-Division**:
   - The method `predictLoad` assumes `slope` is non-zero. Although `estimate1RM` checks for `regression.slope === 0`, direct calls to `predictLoad` on a flat regression line will cause division by zero, returning `Infinity`, `-Infinity`, or `NaN`.
3. **RSI Discontinuity**:
   - Using a simple heuristic (`jumpHeight > 2.0`) to infer the unit (meters vs. centimeters) creates a mathematical boundary discontinuity. Since normal human jump heights can span both sides of `2` depending on the unit, inputs close to `2.0` (like `1.9` cm vs `2.1` cm) will produce wildly erroneous values.
4. **Parser Dropping Drop Jump Records**:
   - The Excel ingestion loop only keeps records if they have `load`, `distance`, `jumpHeight`, or `contactTime`. The omission of `dropHeight` means that any spreadsheet listing drop heights without other columns (e.g., setup spreadsheets or incomplete rows) will be dropped, causing parsing failures.
5. **Progression Table Power Leak**:
   - Clamping `velocity` in the returned progression array but not in the formula for `power` allows negative or `NaN` velocities to propagate directly to the user-facing power metric, causing display errors.

---

## 3. Caveats
- We did not modify any source code files, as the task was review-only.
- We assumed the existing test framework in the project is representative of the execution environment.
- We did not investigate how the front-end handles the displaying of `NaN` or `Infinity` outside the standard VBT progression table.

---

## 4. Conclusion
The current implementation of the physics engine and Excel parser has several vulnerabilities:
1. **Mathematical instability**: collinear loads/velocities produce astronomical biomechanical outputs.
2. **Direct division by zero**: `predictLoad` crashes or returns `Infinity` on zero-slope regression models.
3. **Unit conversion discontinuity**: RSI calculations are unstable for jump heights around the `2.0` boundary.
4. **Ingestion filters**: Excel parsing filters out rows containing only `dropHeight` metrics.
5. **Progression calculations**: progression tables display negative or `NaN` power values due to unclamped inputs.

**Actionable Recommendations**:
1. Add a tolerance guard for slope in regression calculation (e.g., if `Math.abs(slope) < 1e-4`, set it to `0` or throw a collinearity warning).
2. Guard `predictLoad` internally against `slope === 0` or tiny slopes.
3. Replace the heuristic `jumpHeight > 2.0` in `calculateRSI` with an explicit unit parameter or use a more robust multi-variable check.
4. Add `record.dropHeight > 0` to the filter guard in `js/parser.js`.
5. Clamp `predictedVel` to a minimum of `0` or `0.1` before passing it to `calculatePower` in `generateVBTProgression`.

---

## 5. Verification Method
1. Run `test_stress_parser.js` using node:
   ```bash
   C:\Users\ptomm\AppData\Local\ms-playwright-go\1.57.0\node.exe test_stress_parser.js
   ```
   *Currently, this test fails on "Drop Height Header Mapping" due to the missing guard on `dropHeight`.*
2. Run `test_regression_edge_cases.js` using node:
   ```bash
   C:\Users\ptomm\AppData\Local\ms-playwright-go\1.57.0\node.exe test_regression_edge_cases.js
   ```
   *Observe the outputs for Test 7 (horizontal collinearity) and Test 7b (exact 0 slope).*
3. Run `test_load_velocity.js` using node:
   ```bash
   C:\Users\ptomm\AppData\Local\ms-playwright-go\1.57.0\node.exe test_load_velocity.js
   ```
   *Verify standard cases.*
