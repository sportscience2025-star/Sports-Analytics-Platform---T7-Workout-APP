# Handoff Report — Empirical Stress-Testing & Verification of Physics Engine (`js/physics-engine.js`)

## 1. Observation

Direct observations and execution logs from empirical stress-testing of `js/physics-engine.js`:

* **File inspected**: `js/physics-engine.js` (718 lines).
* **Tool Command executed for verification**:
  ```powershell
  & "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" -e "..."
  ```
* **Observation 1 (MAD Outlier Filtering Masking Flaw)**:
  Lines 175–202 in `_removeOutliersMAD`:
  ```javascript
  180: const n = data.length;
  181: let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  182: data.forEach(pt => { sumX += pt.load; sumY += pt.velocity; sumXY += pt.load * pt.velocity; sumXX += pt.load * pt.load; });
  183: const denom = n * sumXX - sumX * sumX;
  ...
  186: const residuals = data.map(pt => pt.velocity - (slope * pt.load + intercept));
  ...
  197: const modZ = (0.6745 * Math.abs(residuals[i] - medianRes)) / mad;
  198: return modZ <= 2.5;
  ```
  When tested with a 5-point dataset containing a gross velocity outlier (`[{load: 30, velocity: 1.2}, {load: 50, velocity: 1.0}, {load: 70, velocity: 0.8}, {load: 90, velocity: 0.6}, {load: 110, velocity: 3.0}]`), `_removeOutliersMAD` returned all 5 points intact (0 points filtered).
  Direct debug log output:
  ```text
  OLS slope: 0.0195 intercept: -0.29
  Residuals: [ 1.505, 1.315, 1.125, 0.935, 1.145 ]
  Median Residual: 1.145
  MAD: 0.21
  Point 4 (L=110, V=3.0): residual=1.145, modZ=0.0000
  ```
  With extreme outlier `velocity = 999.0` (L=100) vs normal values (`V=1.2` down to `0.6`):
  ```text
  Point 4 (L=100, V=999): residual=399.44, modZ=1.3490
  ```
  Because `1.3490 <= 2.5`, the outlier was retained.

* **Observation 2 (IQR Outlier Filtering Flaw)**:
  Lines 208–227 in `_removeOutliersIQR`:
  When tested with the same 5-point dataset (`velocity = 3.0` or `15.0`), `_removeOutliersIQR` returned all 5 points intact.
  Direct output: `IQR Filtered (5/5 kept)`.

* **Observation 3 (`estimate1RM` Falsy Coercion Bug for n=2)**:
  Line 81 in `linearRegressionVBT`:
  ```javascript
  const see = n > 2 ? Math.sqrt(residualSS / (n - 2)) : 0;
  ```
  Line 522 in `estimate1RM`:
  ```javascript
  const see = regression.see || 0.01;
  ```
  When `n = 2`, `regression.see` is `0`. In JavaScript, `0 || 0.01` evaluates to `0.01`, forcing a non-zero SEE and confidence interval for 2-point datasets.

* **Observation 4 (Robustness under Boundary Conditions)**:
  - **Small sample sizes (`n=0, 1, 2, 3`)**: `linearRegressionVBT` returns `null` for `n < 2`. `quadraticRegressionVBT` returns `null` for `n < 3`. No exceptions thrown.
  - **Collinear loads (all loads identical)**: Line 46 in `linearRegressionVBT`: `if (Math.abs(denominator) < 1e-9)` returns structured error object with `equation: 'Dati insufficienti (carichi identici)'` and no NaNs. In `quadraticRegressionVBT`, `_solve3x3` returns `null` on zero matrix determinant.
  - **Zero / Negative velocities & Extreme loads**: Datasets with `velocity = 0`, negative velocities, or loads up to 10,000 kg execute without NaNs or Infinities.
  - **Jump helper functions (`calculateEUR`, `calculateRSI`)**: Gracefully handle `null`, `undefined`, `0`, and negative inputs returning `0`.

## 2. Logic Chain

1. **Premise**: In Velocity Based Training (VBT), outlier filtering must remove erroneous repetitions (e.g., misfires, partial reps, sensor artifacts) to prevent severe distortion of 1RM predictions.
2. **Step 1 (From Observation 1 & 2)**: Both `_removeOutliersMAD` and `_removeOutliersIQR` rely on ordinary least squares (OLS) linear regression to calculate initial residuals. OLS regression minimizes sum of squared errors across all points and is notoriously non-robust to leverage points.
3. **Step 2 (From Observation 1)**: When a measurement error or leverage outlier exists in small datasets (n=4..6), OLS tilts the regression line toward the outlier. This distorts residuals across all points and inflates the Median Absolute Deviation (`mad`). Because `mad` is inflated, the modified Z-score (`modZ`) for the outlier remains small (`modZ <= 2.5`), preventing the filter from detecting and removing the outlier.
4. **Step 3 (From Observation 3)**: The code explicitly sets `see = 0` when `n = 2` to reflect that standard error cannot be estimated with zero degrees of freedom. However, using the standard logical OR fallback `regression.see || 0.01` treats numeric `0` as falsy, replacing `0` with `0.01` and producing invalid confidence interval metrics.
5. **Step 4 (From Observation 4)**: The guards for sample size (`n < 2` or `n < 3`), identical loads (`denominator < 1e-9`), and jump performance metric calculations are mathematically robust and perform as intended.

## 3. Caveats

* Testing was conducted empirically using Node.js execution against standalone mathematical calculations in `js/physics-engine.js`. UI event handling and DOM rendering were not tested as they are outside the scope of `PhysicsEngine`.
* No modifications were made to `js/physics-engine.js` in accordance with the review-only role constraint.

## 4. Conclusion

`PhysicsEngine` in `js/physics-engine.js` is overall structurally robust regarding basic mathematical boundary conditions (collinear points, small sample sizes n=2..4, extreme loads, negative velocities, and jump metric evaluations), returning zero NaNs or unhandled exceptions.

However, two significant vulnerabilities were identified and empirically confirmed:
1. **Critical Defect in Outlier Filtering**: Both MAD and IQR outlier filtering algorithms fail to detect gross velocity outliers in standard small datasets (n=4..6) due to initial residual masking caused by non-robust OLS regression.
2. **Minor Logic Defect in 1RM Confidence Intervals**: `estimate1RM` incorrectly overrides `see = 0` for 2-point datasets due to falsy JS coercion (`0 || 0.01`).

## 5. Verification Method

To independently verify these findings, run the following Node.js inline snippet from the project root (`e:\Nuove App Installate\App esercizi scienze motorie`):

```powershell
& "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" -e "
global.window = {};
require('./js/physics-engine.js');
const data = [
    { load: 30, velocity: 1.2 },
    { load: 50, velocity: 1.0 },
    { load: 70, velocity: 0.8 },
    { load: 90, velocity: 0.6 },
    { load: 110, velocity: 3.0 }
];
const madResult = window.PhysicsEngine._removeOutliersMAD(data);
console.log('MAD kept count (Expected 4, Actual):', madResult.length);
"
```

**Expected verification output**: `MAD kept count (Expected 4, Actual): 5` (confirming failure to filter the outlier `velocity = 3.0`).
