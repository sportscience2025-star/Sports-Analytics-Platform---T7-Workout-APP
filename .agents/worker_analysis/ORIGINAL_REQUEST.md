## 2026-06-15T14:29:09Z

You are the teamwork_preview_worker. Your working directory is e:\Nuove App Installate\App esercizi scienze motorie\.agents\worker_analysis.
Your mission is to implement VBT Progression Analysis and Jump Test Strength Evaluation in the sports science app.

### Tasks:
1. Update `js/physics-engine.js` to add mathematical helpers for Jump Test evaluation:
   - `static calculateEUR(cmjHeight, sjHeight)` -> returns the Eccentric Utilization Ratio (`CMJ_Height / SJ_Height`). Ensure it handles edge cases (e.g., zero or negative values).
   - `static calculateRSI(jumpHeight, contactTime)` -> returns the Reactive Strength Index. If the height is in centimeters (heuristic: value > 5), convert it to meters first (`height_m = jumpHeight / 100`). Divide by `contactTime` in seconds to return standard RSI. Ensure it handles edge cases.
   - `static evaluateJumpPerformance(eur, rsi)` -> returns a detailed qualitative evaluation string for the athlete's explosive-elastic vs concentric dominance (EUR) and reactive strength stiffness (RSI).
2. Update `js/data-analysis.js` to add a Jump Test Dashboard:
   - Update `executeNLPQuery(prompt)` to detect jump-related queries (e.g., containing "salto", "jump", "cmj", "sj", "dj", "eur", "rsi", "forza reattiva").
   - If a jump query is detected, filter the parsed data and route it to `this.renderJumpDashboard(filteredData, targetAthlete)`.
   - Implement `renderJumpDashboard(data, athlete)` to:
     - Group data points by exercise/jump type (CMJ, SJ, DJ).
     - Calculate relevant heights (e.g., max or average CMJ and SJ heights) and contact times.
     - Compute the EUR and RSI using the `PhysicsEngine` functions.
     - Build a card-based metrics layout displaying:
       - CMJ Height, SJ Height, EUR with qualitative classification.
       - DJ Jump Height, DJ Contact Time, RSI with qualitative classification.
     - Append a section with the qualitative strength profile evaluation.
     - Render a Chart.js bar chart comparing CMJ vs SJ heights.
     - Render a Chart.js scatter/line chart for Drop Jump RSI trials.
3. Create `test_analysis.js` at the project root. This Node.js script must:
   - Mock standard browser environment globals (`window`) and load `js/physics-engine.js` inside the VM or global context.
   - Run tests against a known dataset:
     - SJ heights: `[30, 32, 31]` (e.g., average = 31 cm)
     - CMJ heights: `[33, 35, 34]` (e.g., average = 34 cm)
     - DJ trials: heights `[36, 38]` cm, contact times `[0.20, 0.18]` s
     - Load/Velocity data: loads `[60, 80, 100, 120]` kg, velocities `[0.90, 0.72, 0.55, 0.38]` m/s.
   - Run assertions verifying:
     - Computed EUR matches the expected value (e.g., `34 / 31 ≈ 1.0968`) within a small margin.
     - Computed RSI matches expected values (e.g., `(36/100) / 0.20 = 1.8` and `(38/100) / 0.18 ≈ 2.111`) within a small margin.
     - Linear regression yields correct slope, intercept, R², and 1RM estimate for VBT data.
   - Print success messages when all assertions pass.
4. Run `node test_analysis.js` and verify it passes.
5. Create a handoff report at `e:\Nuove App Installate\App esercizi scienze motorie\.agents\worker_analysis\handoff.md` detailing:
   - Modified files.
   - Test command execution output.
   - Biomechanical formulas and threshold metrics used.
6. Send a message to the caller (id: ede19483-177d-48b4-9574-90335d83c33b) when done.

### MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
