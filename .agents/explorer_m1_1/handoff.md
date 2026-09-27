# Handoff Report: Physics/Math Engine Investigation

**Agent**: Explorer 1 (`teamwork_preview_explorer`)  
**Working Directory**: `e:\Nuove App Installate\App esercizi scienze motorie\.agents\explorer_m1_1`  
**Target Module**: Physics & Math Engine (`js/physics-engine.js`, `js/data-analysis.js`, `js/logic.js`)  

---

## 1. Observation
- **Codebase Locations Identified**:
  - `js/physics-engine.js` lines 22–150: Implements `linearRegressionVBT(data)` using Ordinary Least Squares (OLS) linear equations to compute slope $a$, intercept $b$, $R^2$, and $SEE$.
  - `js/physics-engine.js` lines 84–109: Calculates theoretical biomechanical parameters $V_0 = b$, $F_0 = -b/a$, $F_{0,N} = F_0 \times 9.81$, theoretical peak power $P_{\max} = (F_{0,N} \cdot V_0) / 4$, optimal power load $F_0/2$, and velocity $V_0/2$.
  - `js/physics-engine.js` lines 203–208: Implements `estimate1RM(regression, mvt)` returning single point estimate $\text{1RM} = (\text{MVT} - b)/a$.
  - `js/physics-engine.js` lines 156–175: Implements `_removeOutliersIQR(data)` filtering residuals using IQR upper fence ($Q_3 + 1.5 \times IQR$), conditional on $n \ge 5$.
  - `test_load_velocity.js` & `test_regression_edge_cases.js`: Automated node test suites validating linear regression correctness, edge cases (zero slope, collinear points), and noisy data robustness.
- **Tool Commands Executed**:
  - Direct read (`view_file`) on `js/physics-engine.js`, `js/data-analysis.js`, `js/logic.js`, `test_load_velocity.js`, `test_regression_edge_cases.js`.

---

## 2. Logic Chain
- **Observation**: `PhysicsEngine.linearRegressionVBT` strictly computes OLS linear model $V = aL + b$.
- **Inference**: High-intensity multi-joint strength exercises and broad load ranges exhibit non-linear velocity loss. Fitting a linear model on curved data introduces systematic error, skewing $V_0$, $F_0$, and 1RM predictions.
- **Observation**: `_removeOutliersIQR` is guarded by `if (data.length >= 5)` and fits a baseline OLS model including potential outliers.
- **Inference**: In practical VBT settings with 3–4 load points, outlier filtering is bypassed completely. When enabled, initial OLS line fitting is distorted by leverage points (masking effect).
- **Observation**: `estimate1RM` returns scalar load without confidence bounds.
- **Inference**: Strength coaches lack quantitative measurement error bounds ($95\%$ CI) needed to separate signal (adaptation) from noise (encoder precision / daily variability).
- **Conclusion**: Upgrading to a dual Linear/Quadratic model with automated model selection based on $R^2_{\text{adj}}$, robust MAD outlier filtering, and inverse regression $95\%$ CI formulas will significantly elevate scientific rigor and practical utility.

---

## 3. Caveats
- No source code in `js/` was modified during this investigation, as this is a read-only exploration task.
- Implementation of proposed quadratic regression and matrix solvers will require careful numeric handling for $3 \times 3$ matrix inversion to avoid singular matrix errors when loads are close or collinear.

---

## 4. Conclusion
The current physics engine in `js/physics-engine.js` provides a clean, mathematically accurate OLS linear regression baseline compliant with Samozino et al. literature. However, it lacks support for curvilinear load-velocity profiles, robust small-sample outlier detection, and statistical uncertainty estimation (95% CI). Detailed mathematical specifications and formulas for quadratic modeling, automated model selection ($R^2_{\text{adj}}$), MAD outlier filtering, and 1RM calibration confidence intervals have been fully documented in `analysis.md`.

---

## 5. Verification Method
1. Inspect `e:\Nuove App Installate\App esercizi scienze motorie\.agents\explorer_m1_1\analysis.md` for full mathematical formulations and derivations.
2. Run existing node verification scripts to confirm current baseline behavior:
   ```bash
   node test_load_velocity.js
   node test_regression_edge_cases.js
   ```
3. Verify that all proposed formulas in `analysis.md` satisfy edge cases (e.g., degree of freedom constraints $n \ge 4$ for quadratic fit).
