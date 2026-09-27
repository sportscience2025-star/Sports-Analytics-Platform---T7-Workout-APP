# Handoff Report — Milestone 1: Intelligent Hybrid Regression & Precision

**Author**: Worker 1 (`teamwork_preview_worker`)  
**Date**: June 27, 2026  
**Milestone**: Milestone 1  
**Working Directory**: `e:\Nuove App Installate\App esercizi scienze motorie\.agents\worker_m1_1`  

---

## 1. Observation

- **Modified Files**:
  - `js/physics-engine.js`:
    - Updated `linearRegressionVBT` (lines 22–156) to return `modelType: 'linear'`, `rSquaredAdj`, `coefficients: { c0, c1, c2: 0 }`, `meanV`, and `ssVV`.
    - Added `_median(sortedArr)` and `_removeOutliersMAD(data)` (lines 160–201) implementing Median Absolute Deviation outlier filtering for modified Z-score $\le 2.5$.
    - Added `_solve3x3(A, B)` (lines 225–243) implementing 3x3 normal system solving via Cramer's Rule.
    - Added `quadraticRegressionVBT(data)` (lines 245–370) implementing $V = c_2 L^2 + c_1 L + c_0$, calculating $V_0, F_0, F_{0,N}, P_{\max}$, $P_{\max}$ load, and power curve.
    - Added `autoSelectRegressionVBT(data)` (lines 388–414) implementing dynamic model selection comparing Adjusted $R^2$ ($R^2_{\text{adj}}$) between linear and quadratic fits with sample size ($n < 4$) safety guards and physical curvature checks ($c_2 \le 0.0001, F_0 > 0, V_0 > 0$).
    - Added `analyzeLoadVelocity(dataset, options)` (lines 416–444) matching the interface contract in `PROJECT.md`.
    - Updated `estimate1RM(regression, mvt, options)` (lines 446–522) calculating Standard Error of 1RM and 95% Confidence Intervals using Student's t-distribution critical values. Returns a hybrid `Number` object containing `{ value, estimated, ci95Min, ci95Max, margin, ci95 }`.
- **Created Verification Test Script**:
  - `test_hybrid_regression.js`: 20 autonomous assertions covering dynamic switching, 95% CI bounds, biomechanical parameters, and MAD outlier filtering.
- **CLI Verification Results**:
  - `node test_hybrid_regression.js`: **20 PASS / 0 FAIL** (100% success).
  - `node test_load_velocity.js`: **41 PASS / 0 FAIL** (100% backward compatibility maintained).
  - `node test_vbt_math_stress.js`: **33 PASS / 0 FAIL**.
  - `node test_analysis.js`: **PASS**.
  - `node test_regression_edge_cases.js`: **PASS**.

---

## 2. Logic Chain

1. **Problem**: Real-world load-velocity data displays non-linear curvature at extremes, while small sample sizes ($n < 4$) risk severe overfitting under quadratic fitting. Furthermore, single-point 1RM predictions lacked uncertainty bounds.
2. **Dynamic Model Selection Logic**:
   - For $n < 4$, the degrees of freedom ($df = n - 3$) for quadratic regression are insufficient, forcing a linear model.
   - For $n \ge 4$, both OLS linear and 3x3 system quadratic models are evaluated.
   - The quadratic model is selected only if $R^2_{\text{adj, quad}} > R^2_{\text{adj, lin}} + 0.003$ and the quadratic curvature is biomechanically valid ($c_2 \le 0.0001$, preventing unphysical upward velocity acceleration with load).
3. **95% Confidence Interval Logic**:
   - The Standard Error of estimated 1RM is derived via inverse regression calibration variance:
     $$SE_{\hat{L}_{1\text{RM}}} = \frac{SEE}{|V'(L_{1\text{RM}})|} \sqrt{1 + \frac{1}{n} + \frac{(\text{MVT} - \bar{V})^2}{\sum (V_i - \bar{V})^2}}$$
   - Applying Student's t-distribution critical value $t_{df, 0.975}$ yields margin $t \cdot SE_{\hat{L}_{1\text{RM}}}$ and upper/lower bounds.
4. **Backward Compatibility Strategy**:
   - `estimate1RM` returns a `Number` instance augmented with property accessors (`.value`, `.estimated`, `.ci95Min`, `.ci95Max`, `.margin`, `.ci95`). This ensures legacy calls expecting a primitive numeric value (e.g. `oneRM.toFixed(2)` or `Math.round(oneRM / 2.5)`) execute without modification, while supporting structured object destructuring.

---

## 3. Caveats

- Node environment on this system requires execution via full path `& "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe"` as `node` is not registered in user PATH environment variables.
- When $n < 4$, 95% Confidence Intervals use approximated t-distribution degrees of freedom ($df = 1$ or fallback) due to restricted calibration samples.

---

## 4. Conclusion

Milestone 1 is complete and verified. `js/physics-engine.js` now features:
- Dynamic OLS Linear vs Quadratic polynomial regression.
- MAD residual outlier filtering.
- 95% Confidence Interval estimation for 1RM.
- 100% backward compatibility and exact compliance with `PROJECT.md` interface contracts.

---

## 5. Verification Method

To independently verify the implementation, execute the CLI test commands using PowerShell:

```powershell
# 1. Run new hybrid regression verification suite
& "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" test_hybrid_regression.js

# 2. Run existing load-velocity suite to confirm backward compatibility
& "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" test_load_velocity.js

# 3. Run mathematical stress tests
& "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" test_vbt_math_stress.js
```

Inspection files: `js/physics-engine.js`, `test_hybrid_regression.js`.
