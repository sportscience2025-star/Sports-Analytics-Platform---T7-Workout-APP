# Handoff Report: Physics Engine Formula Audit

This report presents a comprehensive mathematical and physical audit of the formula implementations within `js/physics-engine.js` against standard peer-reviewed biomechanical and statistical literature.

---

## 1. Observation

The audit targets `js/physics-engine.js` and its associated test suites: `test_regression_edge_cases.js`, `test_stress_math_and_parser.js`, and `test_analysis.js`. Below are the verbatim implementations and lines identified for the eight audit components.

### 1.1 OLS Linear Regression Verification
*   **File Path**: `js/physics-engine.js`
*   **Line Numbers**: 60-79
*   **Verbatim Code**:
    ```javascript
    // OLS slope and intercept
    const slope     = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const yMean = sumY / n;
    let totalSS = 0, residualSS = 0;
    const residuals = [];
    cleanData.forEach(pt => {
        const yPred = slope * pt.load + intercept;
        const res   = pt.velocity - yPred;
        residuals.push({ load: pt.load, velocity: pt.velocity, predicted: yPred, residual: res });
        totalSS    += Math.pow(pt.velocity - yMean, 2);
        residualSS += Math.pow(res, 2);
    });
    const rSquared = totalSS < 1e-12
        ? 1
        : Math.max(0, Math.min(1, 1 - residualSS / totalSS));

    // Standard error of estimate (SEE) for confidence
    const see = n > 2 ? Math.sqrt(residualSS / (n - 2)) : 0;
    ```

### 1.2 F-V Profile Parameters (F0, V0, Pmax, Optimal Load)
*   **File Path**: `js/physics-engine.js`
*   **Line Numbers**: 81-103
*   **Verbatim Code**:
    ```javascript
    // V0: theoretical velocity at zero load (y-intercept) [m/s]
    const v0 = intercept;

    // F0: theoretical maximal force = load at zero velocity (x-intercept) [kg]
    // V = slope*L + intercept = 0 => L = -intercept / slope
    const f0 = (slope < -1e-6 && intercept > 1e-6)
        ? -intercept / slope
        : 0;

    // F0 in Newtons (weight force, assuming gravity = 9.81 m/s²)
    const f0_N = f0 * 9.81;

    // Pmax: Theoretical maximum mechanical power [W]
    // For a linear F-V profile: Pmax = F0(N) * V0 / 4
    // (occurs at load = F0/2 and velocity = V0/2)
    const pmax = (f0_N > 0 && v0 > 0) ? (f0_N * v0) / 4 : 0;

    // Load at Pmax = F0/2 [kg]
    const pmaxLoad = f0 / 2;

    // Velocity at Pmax = V0/2 [m/s]
    const pmaxVelocity = v0 / 2;
    ```

### 1.3 1RM Estimation via MVT
*   **File Path**: `js/physics-engine.js`
*   **Line Numbers**: 199-203
*   **Verbatim Code**:
    ```javascript
    static estimate1RM(regression, mvt = 0.30) {
        if (!regression || regression.slope >= 0 || isNaN(regression.slope)) return 0;
        if (mvt <= 0 || mvt >= regression.v0) return 0;
        return Math.max(0, regression.predictLoad(mvt));
    }
    ```
    *Note: `regression.predictLoad` is defined as `(vel) => (Math.abs(slope) < 1e-9) ? 0 : (vel - intercept) / slope` at line 145.*

### 1.4 Sfvp (Force-Velocity Imbalance) & Pmax Load Scanner
*   **File Path**: `js/physics-engine.js`
*   **Line Numbers**: 105-111, 178-190
*   **Verbatim Code**:
    ```javascript
    // F-V Imbalance: ratio of actual Pmax load to F0/2
    // Sfvp = (Pmax_load_actual - F0/2) / F0/2 * 100
    // Here: slope gives optimal load = -b/(2a) so Sfvp = 0 for a perfectly symmetric profile
    // We calculate the load of max power empirically from the actual data
    const loadAtMaxPower = this._findEmpiricalPmaxLoad(cleanData, slope, intercept);
    const sfvp = f0 > 0 ? ((loadAtMaxPower - pmaxLoad) / pmaxLoad) * 100 : 0;
    ```
    ```javascript
    /**
     * Find load at empirical maximum power by scanning the data range.
     * @private
     */
    static _findEmpiricalPmaxLoad(data, slope, intercept) {
        const minLoad = Math.min(...data.map(d => d.load));
        const maxLoad = Math.max(...data.map(d => d.load));
        let maxP = 0, bestLoad = (minLoad + maxLoad) / 2;
        // Scan with fine step
        for (let L = minLoad; L <= maxLoad; L += 0.5) {
            const V = slope * L + intercept;
            if (V <= 0) break;
            const P = L * 9.81 * V; // simplified: F(N) * V
            if (P > maxP) { maxP = P; bestLoad = L; }
        }
        return bestLoad;
    }
    ```

### 1.5 EUR (CMJ/SJ) Formula and Bands
*   **File Path**: `js/physics-engine.js`
*   **Line Numbers**: 307-311, 328-338
*   **Verbatim Code**:
    ```javascript
    static calculateEUR(cmjHeight, sjHeight) {
        if (typeof cmjHeight !== 'number' || typeof sjHeight !== 'number' ||
            isNaN(cmjHeight) || isNaN(sjHeight) || cmjHeight <= 0 || sjHeight <= 0) return 0;
        return cmjHeight / sjHeight;
    }
    ```
    *Evaluation Bands (Lines 332-338)*: Concentric Dominance if `eur < 1.05`; Balanced if `eur <= 1.15`; SSC Dominance/Concentric Deficit if `eur > 1.15`.

### 1.6 RSI (Reactive Strength Index) Formula, Unit Conversion, and Bands
*   **File Path**: `js/physics-engine.js`
*   **Line Numbers**: 316-322, 340-352
*   **Verbatim Code**:
    ```javascript
    static calculateRSI(jumpHeight, contactTime) {
        if (typeof jumpHeight !== 'number' || typeof contactTime !== 'number' ||
            isNaN(jumpHeight) || isNaN(contactTime) || jumpHeight <= 0 || contactTime <= 0) return 0;
        // Auto-convert cm to m if needed
        const heightM = jumpHeight > 1.5 ? jumpHeight / 100 : jumpHeight;
        return heightM / contactTime;
    }
    ```
    *Evaluation Bands (Lines 340-352)*: Low if `rsi < 1.5`; Moderate if `rsi < 2.0`; High if `rsi <= 2.5`; Elite if `rsi > 2.5`.

### 1.7 Power Calculation
*   **File Path**: `js/physics-engine.js`
*   **Line Numbers**: 293-302
*   **Verbatim Code**:
    ```javascript
    static calculateForce(massKg) {
        return massKg * 9.81;
    }
    static calculatePower(forceN, velocityMs) {
        return forceN * velocityMs;
    }
    ```

### 1.8 IQR Outlier Removal Logic
*   **File Path**: `js/physics-engine.js`
*   **Line Numbers**: 25-31, 153-172
*   **Verbatim Code**:
    ```javascript
    static _removeOutliersIQR(data) {
        // First pass: simple regression
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        data.forEach(pt => { sumX += pt.load; sumY += pt.velocity; sumXY += pt.load * pt.velocity; sumXX += pt.load * pt.load; });
        const denom = n * sumXX - sumX * sumX;
        if (Math.abs(denom) < 1e-9) return data;
        const slope = (n * sumXY - sumX * sumY) / denom;
        const intercept = (sumY - slope * sumX) / n;

        // Calculate residuals
        const residuals = data.map(pt => Math.abs(pt.velocity - (slope * pt.load + intercept)));
        const sorted = [...residuals].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(n * 0.25)];
        const q3 = sorted[Math.floor(n * 0.75)];
        const iqr = q3 - q1;
        const fence = q3 + 1.5 * iqr;

        return data.filter((_, i) => residuals[i] <= fence);
    }
    ```

---

## 2. Logic Chain

### 2.1 OLS Regression
1.  The standard mathematical formulas for simple linear regression coefficients $a$ (slope) and $b$ (intercept) are:
    $$a = \frac{n \sum xy - \sum x \sum y}{n \sum x^2 - (\sum x)^2}, \quad b = \frac{\sum y - a \sum x}{n}$$
2.  The code computes `denominator = n * sumXX - sumX * sumX`, and then sets `slope = (n * sumXY - sumX * sumY) / denominator` and `intercept = (sumY - slope * sumX) / n`.
3.  These code statements are mathematically equivalent to the OLS definitions.
4.  R-squared is computed as $R^2 = 1 - \frac{SS_{res}}{SS_{tot}}$. If $SS_{tot} < 10^{-12}$ (horizontal collinearity, zero variance), the code returns 1.0 to avoid division by zero.
5.  SEE is computed as $\sqrt{SS_{res} / (n - 2)}$, which has the correct statistical degrees of freedom for simple linear regression. The guard `n > 2` prevents division by zero when $n \le 2$.

### 2.2 F-V Profile Parameters
1.  According to Samozino's model, the linear Force-Velocity relationship is $v(F) = V_0(1 - F/F_0) = V_0 - \frac{V_0}{F_0}F$. When mapped to external load $L$ and velocity $V$, we get $V(L) = aL + b$.
2.  Thus, the y-intercept $b$ is the theoretical maximal velocity at zero load ($V_0$), and the x-intercept $-b/a$ is the theoretical maximal load at zero velocity ($F_0$).
3.  The code sets $v_0 = intercept$ and $f0 = -intercept / slope$ (guarded for negative slope), which is correct.
4.  Power is $P = F \times v = F \times V_0 (1 - F / F_0) = V_0 F - \frac{V_0}{F_0}F^2$. Taking the derivative with respect to $F$ gives the peak power at $F = F_0 / 2$.
5.  Evaluating $P(F_0 / 2)$ yields:
    $$P_{max} = \frac{F_0}{2} \times V_0 \left(1 - \frac{F_0/2}{F_0}\right) = \frac{F_0 \times V_0}{4}$$
6.  The code sets `pmaxLoad = f0 / 2` and `pmax = (f0_N * v0) / 4`. This is mathematically correct.

### 2.3 1RM Estimation via MVT
1.  Under the VBT framework, the 1RM load is estimated as the load that yields a velocity equal to the Minimum Velocity Threshold (MVT) for the target exercise.
2.  Since $V_{1RM} = MVT = a \cdot 1RM + b$, we solve for 1RM:
    $$1RM = \frac{MVT - b}{a}$$
3.  The code uses `regression.predictLoad(mvt)`, which returns `(mvt - intercept) / slope`.
4.  Since $slope < 0$ and $intercept = V_0 > MVT$, both numerator and denominator are negative, yielding a positive 1RM. This matches the Gonzalez-Badillo & Sánchez-Medina (2010) methodology.

### 2.4 F-V Imbalance (Sfvp) and Scanner Flaw
1.  Samozino's $S_{fvp}$ (Force-Velocity imbalance in %) measures the deviation of the athlete's actual F-V slope from their *optimal* F-V slope ($S_{fv,opt}$). The optimal slope depends on the athlete's anthropometrics (body mass and vertical push-off distance), which are not inputs to the function.
2.  The code defines the imbalance as:
    $$Sfvp = \frac{L_{opt,empirical} - L_{opt,theoretical}}{L_{opt,theoretical}} \times 100$$
    where $L_{opt,theoretical} = F_0 / 2$, and $L_{opt,empirical}$ is found by `_findEmpiricalPmaxLoad`.
3.  `_findEmpiricalPmaxLoad` scans for the peak power predicted by the regression line *restricted to the tested loads* `[minLoad, maxLoad]`.
4.  Because the power function $P(L) = L \cdot 9.81 \cdot (slope \cdot L + intercept)$ is a downward-opening parabola with its vertex at $F_0 / 2$:
    *   If $F_0 / 2$ is inside `[minLoad, maxLoad]`, the scanner will find $L_{opt,empirical} \approx F_0 / 2$, yielding $Sfvp \approx 0\%$ (Balanced).
    *   If $F_0 / 2$ is outside `[minLoad, maxLoad]`, $L_{opt,empirical}$ is capped at the boundary (`minLoad` or `maxLoad`).
5.  Therefore, $Sfvp$ is not a physical property of the athlete, but rather an artifact of the selected testing range. For example, testing the same athlete with 30-70 kg vs 30-110 kg will yield different classifications ("Velocity-Oriented" vs "Balanced") despite identical regression profiles. This is biomechanically invalid.
6.  Additionally, scanning the parabola is computationally redundant and introduces step discretization error, as the vertex can be computed directly in closed form ($F_0 / 2$).

### 2.5 EUR CMJ/SJ
1.  McGuigan et al. (2006) and Young (2006) define the Eccentric Utilization Ratio as $EUR = \frac{CMJ}{SJ}$. The code implements `cmjHeight / sjHeight`, which is correct.
2.  The thresholds ($< 1.05$ for Concentric Dominance, $1.05 - 1.15$ for Balanced, $> 1.15$ for SSC Dominance) match standard literature guidelines.

### 2.6 RSI Discontinuity Flaw
1.  The Reactive Strength Index is defined as $RSI = \frac{JumpHeight(m)}{ContactTime(s)}$.
2.  The code implements an auto-conversion step: `const heightM = jumpHeight > 1.5 ? jumpHeight / 100 : jumpHeight;`.
3.  If a user inputs $1.51 \text{ cm}$, the code divides by 100 to get $0.0151 \text{ m}$ (Correct).
4.  If a user inputs $1.50 \text{ cm}$, the code does not divide by 100, treating it as $1.50 \text{ m}$ (Incorrect, 100x error).
5.  If an elite athlete jumps $1.60 \text{ m}$, the code divides it by 100 to get $0.0160 \text{ m}$ (Incorrect, 100x error).
6.  This hardcoded threshold creates a critical mathematical discontinuity around 1.5.

### 2.7 Power Calculation
1.  Force $F(N) = m(\text{kg}) \times g(\text{m/s}^2)$. Power $P(W) = F(N) \times v(\text{m/s})$.
2.  The code implements `massKg * 9.81` and `forceN * velocityMs`.
3.  This is correct under classical mechanics using $g = 9.81 \text{ m/s}^2$.

### 2.8 IQR Outlier Removal
1.  The code uses Tukey's fence formula on the absolute residuals: $Fence = Q_3 + 1.5 \times IQR$.
2.  Indices are determined using `Math.floor(n * 0.25)` and `Math.floor(n * 0.75)`.
3.  This is a standard statistical approach. The safety check `cleanData.length < 3` prevents regression degradation.

---

## 3. Caveats

1.  **Concentric Acceleration during Lifts**: The force calculation $F = m \cdot 9.81$ is a static approximation. It neglects the acceleration of the barbell ($F = m(g + a)$), which is standard for simplified VBT tools but represents a mechanical simplification.
2.  **Squat Body Mass Neglection**: For squatting exercises, the force and power calculations do not include the portion of body mass being moved (typically ~88-90% of body weight). This means calculated absolute power is an underestimation of the true concentric power of the system (athlete + bar).
3.  **Active Environment execution**: It was not possible to execute the test scripts within the shell because the `node` environment is not installed on this system. All code analysis was conducted statically.

---

## 4. Conclusion

| Component | Target File | Lines | Literature | Verdict | Rationale & Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OLS Regression** | `js/physics-engine.js` | 60-79 | Standard Stats | **Correct** | Standard OLS formulation. Safe against division by zero. |
| **F-V Parameters** | `js/physics-engine.js` | 81-103 | Samozino 2012 | **Correct** | Closed-form equations for linear F-V profile, optimal load ($F_0/2$), and $P_{max}$ ($F_0 V_0 / 4$) are correct. |
| **1RM via MVT** | `js/physics-engine.js` | 199-203 | Gonzalez-Badillo 2010 | **Correct** | Translates MVT to load using regression line. Standard VBT procedure. |
| **Sfvp & Pmax Scanner** | `js/physics-engine.js` | 105-111, 178-190 | Samozino 2012/2016 | **Incorrect / Flawed** | **1. Biomechanical Flaw:** Samozino's $S_{fvp}$ requires body weight and push-off height; this formula is a custom approximation.<br>**2. Mathematical Flaw:** Capping the search range to tested loads makes the classification dependent on testing range boundaries instead of the athlete's physical profile.<br>**3. Computational Redundancy:** A grid scan is used for a quadratic curve vertex that has a known closed-form solution ($F_0/2$). |
| **EUR Formula & Bands** | `js/physics-engine.js` | 307-311, 328-338 | Bosco 1982, Young 2006 | **Correct** | standard $EUR = CMJ / SJ$ ratio and valid physiological thresholds. |
| **RSI & Conversion** | `js/physics-engine.js` | 316-322, 340-352 | Flanagan 2008 | **Flawed** | **Unit Conversion Discontinuity:** The hardcoded `1.5` threshold causes a 100-fold discontinuity at 1.5 cm/m, miscalculating very low jumps (<1.5cm) or very high jumps (>1.5m). |
| **Power Calculation** | `js/physics-engine.js` | 293-302 | Classical Mechanics | **Correct** | Correct unit conversions ($kg \to N \to W$). Uses $g=9.81$ approximation. |
| **IQR Outlier Removal** | `js/physics-engine.js` | 25-31, 153-172 | Tukey's Fences | **Correct** | Implementation is correct and includes a safety reversion guard to prevent sample size collapse. |

### Minor Inconsistencies Identified
1.  **Rounding Inconsistency**:
    *   In `generateLoadVelocityTable` (lines 232-238), power/velocity predictions are computed using the exact `loadRaw` (unrounded), but the table shows rounded weights (`load5` / `load5kg`).
    *   In `generateVBTProgression` (lines 267-273), power/velocity predictions are computed using the rounded weight `roundedLoad` (which is rounded down using `Math.floor(rawLoad / 5) * 5`).
    *   This causes different predicted velocities for the same nominal training percentages. E.g. at 70% 1RM, the training table shows a higher velocity because the load was rounded down.
2.  **Test Suite Mismatch**:
    *   `test_vbt_math_stress.js` (line 80) asserts that a tiny slope is truncated to 0 (`assert(regFlat.slope === 0)`). However, neither `js/physics-engine.js` nor the proposed replacement in `.agents/explorer_exploration/proposed_physics-engine.js` actually performs this truncation. The test suite is out of sync with the actual implementation.

---

## 5. Verification Method

To verify these findings and check the code behavior, inspect the following files:

1.  **Physics Engine Code**: Check `js/physics-engine.js` to inspect lines 105-111 and 178-190 for the grid search scanner, and line 320 for the `1.5` threshold in `calculateRSI`.
2.  **Unit Discontinuity Verification**:
    In a JavaScript console, run:
    ```javascript
    // Discontinuity at 1.5 threshold
    console.log(PhysicsEngine.calculateRSI(1.50, 0.200)); // Expected: 7.5 (Treated as 1.50m)
    console.log(PhysicsEngine.calculateRSI(1.51, 0.200)); // Expected: 0.0755 (Treated as 1.51cm -> 0.0151m)
    ```
    This confirms the 100-fold jump.
3.  **Sfvp Boundary Dependency Verification**:
    Run a simulation with two datasets representing the same linear profile ($V = -0.006L + 1.20 \implies F_0 = 200 \text{ kg}$, $P_{max} \text{ load} = 100 \text{ kg}$), but different testing ranges:
    *   **Range A (30 to 70 kg)**:
        `const dataA = [{load: 30, velocity: 1.02}, {load: 50, velocity: 0.9}, {load: 70, velocity: 0.78}];`
        `const regA = PhysicsEngine.linearRegressionVBT(dataA);`
        `console.log(regA.sfvp, regA.fvBias);` // Will output sfvp = -30%, "Orientato alla Velocità"
    *   **Range B (30 to 110 kg)**:
        `const dataB = [...dataA, {load: 90, velocity: 0.66}, {load: 110, velocity: 0.54}];`
        `const regB = PhysicsEngine.linearRegressionVBT(dataB);`
        `console.log(regB.sfvp, regB.fvBias);` // Will output sfvp = 0%, "Profilo Bilanciato"
    This confirms the physical classification shifts from "velocity-deficient" to "balanced" purely based on the tested load boundaries, even though the underlying athlete's regression line is identical.
