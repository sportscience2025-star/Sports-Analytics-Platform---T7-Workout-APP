## 2026-06-17T21:27:10Z
Identity: teamwork_preview_explorer (Formula Auditor)
Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_audit_1/
Scope: physics-engine.js formulas audit

Your task is to analyze every mathematical and physical formula in `js/physics-engine.js` (and any related calculations in the codebase) for correctness against standard peer-reviewed literature.
1. Perform OLS Linear regression verification (slope, intercept, R2, SEE).
2. Verify F-V Profile parameters: F0, V0, Pmax = F0 * V0 / 4, load at Pmax = F0 / 2. Reference: Samozino et al. 2012, 2016.
3. Verify 1RM estimation via MVT (minimum velocity threshold) against Gonzalez-Badillo & Sánchez-Medina (2010).
4. Verify Sfvp (Force-Velocity imbalance) logic and Pmax load scanner (_findEmpiricalPmaxLoad).
5. Verify EUR (CMJ/SJ) CMJ/SJ formula and threshold bands (Bosco, Young et al.).
6. Verify RSI (Reactive Strength Index = Jump Height / Ground Contact Time) from DJ. Check unit conversion (cm to m) and thresholds.
7. Verify Power calculation (P = F * V = mass * g * velocity). Ensure units are correct (kg -> N via *9.81, *m/s -> Watts).
8. Verify IQR outlier removal logic (_removeOutliersIQR) for OLS two-pass fence logic.

Write a detailed handoff report `handoff.md` in your working directory `e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_audit_1/` summarizing all findings. Include file paths, line numbers, literature references, and a verdict (Correct/Incorrect) with explanations.
