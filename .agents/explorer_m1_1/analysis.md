# Physics & Mathematics Engine Analysis Report

**Target Engine**: `js/physics-engine.js` (Velocity Based Training & Biomechanical Computations)  
**Author**: Explorer 1 (`teamwork_preview_explorer`)  
**Date**: June 27, 2026  

---

## 1. Inventory of Current Implementations

The core mathematical and biomechanical calculations for Velocity-Based Training (VBT) reside primarily within `window.PhysicsEngine` in `js/physics-engine.js` (supported by `js/data-analysis.js` for execution orchestration).

### 1.1 Linear Regression (`PhysicsEngine.linearRegressionVBT`, lines 22–150)
- **Model**: Fits Ordinary Least Squares (OLS) linear regression model of Velocity ($V$, m/s) on Load ($L$, kg):
  $$V(L) = a \cdot L + b$$
  where $a$ is the slope (`slope`) and $b$ is the y-intercept (`intercept`).
- **OLS Computations**:
  $$\text{denominator} = n \sum L^2 - (\sum L)^2$$
  $$a = \frac{n \sum (L \cdot V) - (\sum L)(\sum V)}{\text{denominator}}$$
  $$b = \frac{\sum V - a \sum L}{n}$$
- **Goodness-of-Fit & Error**:
  - Coefficient of Determination ($R^2$): Calculated via Total Sum of Squares ($SS_{tot}$) and Residual Sum of Squares ($SS_{res}$):
    $$R^2 = 1 - \frac{\sum (V_i - \hat{V}_i)^2}{\sum (V_i - \bar{V})^2}$$
  - Standard Error of Estimate ($SEE$):
    $$SEE = \sqrt{\frac{SS_{res}}{n - 2}} \quad (n > 2)$$

### 1.2 Biomechanical Parameters ($F_0, V_0, P_{\max}$)
- **Theoretical Maximum Velocity ($V_0$)**: Represented directly by the y-intercept $b$ (velocity when load $L = 0$).
  $$V_0 = b \quad [\text{m/s}]$$
- **Theoretical Maximum Force / Load ($F_0$)**: Represented by the x-intercept (load when velocity $V = 0$).
  $$F_0 = -\frac{b}{a} \quad [\text{kg}]$$
  $$F_{0,N} = F_0 \times 9.81 \quad [\text{N}]$$
- **Theoretical Maximum Power ($P_{\max}$)**: Based on Samozino et al. (2012, 2016) linear force-velocity profile model. Peak power occurs at optimal load $L_{\text{opt}} = F_0 / 2$ and optimal velocity $V_{\text{opt}} = V_0 / 2$:
  $$P_{\max} = \frac{F_{0,N} \cdot V_0}{4} \quad [\text{W}]$$
- **Force-Velocity Imbalance ($S_{\text{fvp}}$)**: Calculated as percentage deviation between empirical peak power load scan (`_findEmpiricalPmaxLoad`, lines 180–195) and theoretical optimal load $F_0/2$.

### 1.3 1RM Estimation (`PhysicsEngine.estimate1RM`, lines 203–208)
- **Minimum Velocity Threshold (MVT)**: Extrapolates 1RM load by evaluating the inverse linear model at a given exercise-specific MVT (e.g., $0.30\text{ m/s}$ for Squat, $0.15\text{ m/s}$ for Bench Press/Deadlift):
  $$\text{1RM} = \frac{\text{MVT} - b}{a} = \text{predictLoad}(\text{MVT})$$

### 1.4 Outlier Filtering (`PhysicsEngine._removeOutliersIQR`, lines 156–175)
- Evaluated prior to final regression if dataset length $n \ge 5$.
- Fits initial OLS line, calculates absolute residuals $|V_i - \hat{V}_i|$, sorts residuals, and removes points exceeding the upper fence:
  $$\text{Fence} = Q_3 + 1.5 \times (Q_3 - Q_1)$$

---

## 2. Mathematical Limitations & Weaknesses Analysis

While the current engine is clean and well-structured, mathematical inspection reveals critical limitations in real-world sports science application:

| Feature Area | Current Implementation Details | Identified Limitation / Mathematical Weakness | Real-World Impact |
| :--- | :--- | :--- | :--- |
| **Curve Fitting** | Strictly OLS Linear ($V = aL + b$) | Multi-joint exercises and wide load spectra (20%–90% 1RM) exhibit second-order curvilinear load-velocity profiles (curvatures near light loads and heavy loads). | Systematic over/under-estimation of $V_0$, $F_0$, and 1RM by 5% to 15% when true response is curvilinear. |
| **Outlier Detection** | IQR on residuals (`_removeOutliersIQR`) | 1. Requires $n \ge 5$ (completely bypassed in standard 3–4 load VBT protocols).<br>2. Initial OLS fit includes outliers, biasing the mean and residual calculations (masking effect).<br>3. `Math.floor` quartile indexing on small samples yields poor quantile estimates. | Leveraged errors or noisy encoder reads distort 1RM prediction without trigger detection. |
| **Statistical Inference** | Point estimates only (`estimate1RM`) | Provides zero variance, standard error, or confidence intervals for predicted 1RM. Reports single deterministic numbers (e.g., `150.0 kg`). | Practitioners cannot assess prediction uncertainty or distinguish true strength gains from measurement noise. |
| **Pmax Calculation** | Scan + fixed Samozino linear formula | Linear assumption fixes peak power strictly at $F_0/2$. If real data curve shifts peak power load, theoretical formula clashes with empirical scan. | Discrepancy between reported theoretical $P_{\max}$ and actual optimal training load. |

---

## 3. Technical Recommendations & Proposed Formulations

### 3.1 Quadratic Polynomial Regression Engine
Implement standard 2nd-degree polynomial regression ($V(L) = c_2 L^2 + c_1 L + c_0$).
To solve for coefficients $\mathbf{C} = [c_0, c_1, c_2]^T$, solve the normal system $(X^T X)\mathbf{C} = X^T Y$:

$$\begin{bmatrix} n & \sum L & \sum L^2 \\ \sum L & \sum L^2 & \sum L^3 \\ \sum L^2 & \sum L^3 & \sum L^4 \end{bmatrix} \begin{bmatrix} c_0 \\ c_1 \\ c_2 \end{bmatrix} = \begin{bmatrix} \sum V \\ \sum L V \\ \sum L^2 V \end{bmatrix}$$

**Biomechanical Derivatives for Quadratic Model**:
1. **$V_0$**: $c_0$
2. **$F_0$**: Solve $c_2 L^2 + c_1 L + c_0 = 0 \Rightarrow F_0 = \frac{-c_1 - \sqrt{c_1^2 - 4 c_2 c_0}}{2 c_2}$ (physically valid positive root).
3. **$P(L)$**: Power curve $P(L) = L \cdot 9.81 \cdot (c_2 L^2 + c_1 L + c_0) = 9.81 (c_2 L^3 + c_1 L^2 + c_0 L)$.
4. **$P_{\max}$ Load**: Find roots of $\frac{dP}{dL} = 0 \Rightarrow 3 c_2 L^2 + 2 c_1 L + c_0 = 0$.

### 3.2 Automated Model Selection (Linear vs. Quadratic)
To prevent overfitting on small samples while capturing non-linearity on larger sets, implement an automated model selector using **Adjusted Coefficient of Determination ($R^2_{\text{adj}}$)** or **AICc**:

$$R^2_{\text{adj}} = 1 - \frac{(1 - R^2)(n - 1)}{n - p - 1}$$
where $p = 1$ for Linear model and $p = 2$ for Quadratic model.

**Decision Logic Rules**:
1. If dataset length $n < 4$, **force Linear model** (insufficient degrees of freedom for robust quadratic fit).
2. If $n \ge 4$, compute both Linear and Quadratic regressions.
3. Select Quadratic model ONLY IF:
   - $R^2_{\text{adj, quad}} > R^2_{\text{adj, lin}} + 0.02$ (meaningful explanation of variance).
   - Quadratic concave downwards ($c_2 < 0$ or physically valid monotonic decline in load test range).
4. Otherwise, default to Linear model.

### 3.3 Robust Outlier Filtering (Modified Z-score / MAD)
Replace or enhance the IQR filter with Median Absolute Deviation (MAD) on residuals or Cook's Distance to handle sample sizes down to $n = 4$:
$$\text{Residual}_i = V_i - \hat{V}_i$$
$$\text{MAD} = \text{median}(| \text{Residual}_i - \text{median}(\text{Residual}) |)$$
$$\text{Modified Z-score}_i = \frac{0.6745 \cdot |\text{Residual}_i - \text{median}(\text{Residual})|}{\text{MAD}}$$
Filter out points where $\text{Modified Z-score}_i > 2.5$ or $3.0$.

### 3.4 95% Confidence Interval Formulas for 1RM
To compute the $95\%$ Confidence Interval for predicted 1RM ($L_{1\text{RM}}$) at $V = \text{MVT}$:
Standard Error of Calibration ($\hat{L}_{0}$ at target velocity $V_{0} = \text{MVT}$):

$$SE_{\hat{L}_{1\text{RM}}} \approx \frac{SEE}{|a|} \sqrt{1 + \frac{1}{n} + \frac{(\text{MVT} - \bar{V})^2}{\sum (V_i - \bar{V})^2}}$$

**$95\%$ Confidence Interval**:
$$\text{CI}_{95\%} = \hat{L}_{1\text{RM}} \pm t_{n-2, 0.975} \cdot SE_{\hat{L}_{1\text{RM}}}$$
(Where $t_{n-2, 0.975}$ is the critical t-value, e.g. $\approx 4.303$ for $df=2$, $3.182$ for $df=3$, $2.776$ for $df=4$).

---

## 4. Summary Patch Blueprint

A proposed patch for `js/physics-engine.js` will add:
1. `quadraticRegressionVBT(data)` alongside `linearRegressionVBT(data)`.
2. `autoSelectRegressionVBT(data)` orchestrating automated model selection.
3. Statistical inference helper returning `oneRM_CI95` with upper/lower bounds.
