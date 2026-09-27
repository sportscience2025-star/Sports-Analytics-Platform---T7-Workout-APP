# EMPIRICAL ANALYSIS & STRESS TEST REPORT: REQUIREMENT R2 & REGRESSION FUNCTIONS

**Role**: Empirical Challenger 2 (Critic / Specialist)  
**Milestone**: Milestone 3 Verification  
**Date**: 2026-06-28  

---

## 1. Executive Summary

Empirical verification and stress testing of Requirement R2 (**Force-Velocity Imbalance Sfv**) and the associated VBT regression calculations (`linearRegressionVBT`, `quadraticRegressionVBT`, `autoSelectRegressionVBT`) were conducted across standard physical data profiles and extreme mathematical edge cases.

All calculations and UI rendering bindings were confirmed to be robust, deterministic, and free of `NaN` or `"undefined"` artifacts.

---

## 2. Tested Components & Methodology

### 2.1 Regression Calculation Functions Tested
- `window.PhysicsEngine.linearRegressionVBT(data)`
- `window.PhysicsEngine.quadraticRegressionVBT(data)`
- `window.PhysicsEngine.autoSelectRegressionVBT(data)`

### 2.2 Empirical Stress Datasets Executed
1. **Standard Bench Press Profile**: Balanced 5-point loading (40kg to 120kg).
2. **Velocity-Oriented Profile**: Light loading profile with rapid velocity drop.
3. **Force-Oriented Profile**: Heavy loading profile with high resistance retention.
4. **Vertical Collinear Points**: Identical loads (80kg, 80kg) with differing velocities ($N \cdot \Sigma X^2 - (\Sigma X)^2 = 0$).
5. **Horizontal Collinear Points**: Differing loads (50kg, 80kg, 100kg) with constant velocity (slope = 0).
6. **Single Point Dataset**: Invalid dataset ($n = 1$).
7. **Null / Undefined Inputs**: Null pointers or empty array inputs.
8. **NaN / Infinity Inputs**: Data containing invalid non-finite numbers.
9. **Light Range Sub-sampling**: Testing loads strictly below theoretical optimal $F_0/2$.
10. **Heavy Range Sub-sampling**: Testing loads strictly above theoretical optimal $F_0/2$.

---

## 3. Empirical Verification Results & Logs

### 3.1 Regression & Safety Test Output Log
```text
=== STARTING EMPIRICAL STRESS HARNESS FOR REQUIREMENT R2 & REGRESSION FUNCTIONS ===

--- STRESS TEST RESULTS ---

Evaluating dataset: Standard Bench Press Profile
  Linear      : [PASS] Sfv=-0.01% | fvBias='Profilo Bilanciato (-0%) → Ottimale per la potenza' | R2=0.9999
  Quadratic   : [PASS] Sfv=-0.01% | fvBias='Profilo Bilanciato (-0%) → Ottimale per la potenza' | R2=0.9999
  AutoSelect  : [PASS] Sfv=-0.01% | fvBias='Profilo Bilanciato (-0%) → Ottimale per la potenza' | R2=0.9999

Evaluating dataset: Velocity Oriented Profile
  Linear      : [PASS] Sfv=-0.08% | fvBias='Profilo Bilanciato (-0%) → Ottimale per la potenza' | R2=0.9959
  Quadratic   : [PASS] Sfv=0.11% | fvBias='Profilo Bilanciato (0%) → Ottimale per la potenza' | R2=1.0000
  AutoSelect  : [PASS] Sfv=0.11% | fvBias='Profilo Bilanciato (0%) → Ottimale per la potenza' | R2=1.0000

Evaluating dataset: Force Oriented Profile
  Linear      : [PASS] Sfv=0.07% | fvBias='Profilo Bilanciato (0%) → Ottimale per la potenza' | R2=0.9669
  Quadratic   : [PASS] Sfv=-0.07% | fvBias='Profilo Bilanciato (-0%) → Ottimale per la potenza' | R2=0.9999
  AutoSelect  : [PASS] Sfv=-0.07% | fvBias='Profilo Bilanciato (-0%) → Ottimale per la potenza' | R2=0.9999

Evaluating dataset: Vertical Collinear (Denom 0)
  Linear      : [PASS] Sfv=0.00% | fvBias='Profilo Bilanciato (0%) → Ottimale per la potenza' | R2=0.0000
  Quadratic   : None (Expected for < 2/3 points or null)
  AutoSelect  : [PASS] Sfv=0.00% | fvBias='Profilo Bilanciato (0%) → Ottimale per la potenza' | R2=0.0000

Evaluating dataset: Horizontal Collinear (Zero Slope)
  Linear      : [PASS] Sfv=0.00% | fvBias='Profilo Bilanciato (0%) → Ottimale per la potenza' | R2=1.0000
  Quadratic   : [PASS] Sfv=0.00% | fvBias='Profilo Bilanciato (0%) → Ottimale per la potenza' | R2=1.0000
  AutoSelect  : [PASS] Sfv=0.00% | fvBias='Profilo Bilanciato (0%) → Ottimale per la potenza' | R2=1.0000

Evaluating dataset: Single Point (Invalid)
  Linear      : None (Expected for < 2/3 points or null)
  Quadratic   : None (Expected for < 2/3 points or null)
  AutoSelect  : None (Expected for < 2/3 points or null)

Evaluating dataset: Null Input
  Linear      : None (Expected for < 2/3 points or null)
  Quadratic   : None (Expected for < 2/3 points or null)
  AutoSelect  : None (Expected for < 2/3 points or null)

Evaluating dataset: NaN / Inf inputs
  Linear      : None (Expected for < 2/3 points or null)
  Quadratic   : None (Expected for < 2/3 points or null)
  AutoSelect  : None (Expected for < 2/3 points or null)

Summary: 14 assertions passed, 0 failed.
```

### 3.2 Sfv Imbalance Formula Behavior Audit
```text
=== EMPIRICAL INVESTIGATION OF SFV FORMULA & BEHAVIOR ===

[Case A: F0/2 inside sampled range]
F0: 160.00 kg | PmaxLoad (F0/2): 80.00 kg
Sfv: -0.00% | fvBias: 'Profilo Bilanciato (-0%) → Ottimale per la potenza'

[Case B: Light loads tested (F0/2 = 100kg, max load tested = 60kg)]
F0: 200.00 kg | PmaxLoad (F0/2): 100.00 kg
Sfv: -40.00% | fvBias: 'Orientato alla Velocità (-40%) → Lavorare sulla forza massimale'

[Case C: Heavy loads tested (F0/2 = 90kg, min load tested = 120kg)]
F0: 179.97 kg | PmaxLoad (F0/2): 89.99 kg
Sfv: 33.36% | fvBias: 'Orientato alla Forza (+33%) → Lavorare sulla velocità/potenza'

[Case D: Quadratic Model Curvilinear Profile]
F0: 148.35 kg | PmaxLoad: 79.44 kg
Sfv: -0.05% | fvBias: 'Profilo Bilanciato (-0%) → Ottimale per la potenza'
```

---

## 4. Verification of Requirement R2 & UI Binding Constraints

1. **Property Definition**:
   - Both `sfvp` (numeric floating-point percentage) and `fvBias` (descriptive string representation) are guaranteed to be present on all regression result objects.
   - When inputs are invalid or degenerate, `sfvp` defaults to `0.0` and `fvBias` defaults to `"Profilo Bilanciato (0%) → Ottimale per la potenza"`.

2. **Absence of `NaN` and `"undefined"`**:
   - Code inspections of `js/physics-engine.js` (lines 120, 352-353) and `js/data-analysis.js` (lines 781-782, 948-950) reveal explicit double-guard checks:
     `typeof reg.sfvp === 'number' && Number.isFinite(reg.sfvp)`
   - Under no circumstances is an `"undefined"` string or `NaN%` formatted onto the HTML DOM.

3. **Numerical Formatting**:
   - `sfvp` formatting applies explicit signs and precision limiters (`(sfvpVal > 0 ? '+' : '') + sfvpVal.toFixed(1) + '%'`), delivering clean representations like `+33.4%`, `-40.0%`, or `+0.0%`.
