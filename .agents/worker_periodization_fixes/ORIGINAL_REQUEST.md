## 2026-06-16T12:02:35Z
You are teamwork_preview_worker. Your working directory is e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_periodization_fixes.
Your task is to fix three bugs identified in the VBT/Jump analysis modules to ensure 100% of the project's test suites pass successfully without hangs or failures.

### MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Bug 1: CPU DoS Loop Hang in `_findEmpiricalPmaxLoad`
- **Location 1**: `js/physics-engine.js` (around line 183 inside `_findEmpiricalPmaxLoad`)
- **Location 2**: `test_load_velocity.js` (around line 55 inside the inline `_findEmpiricalPmaxLoad`)
- **Problem**: When a dataset contains extremely large loads (e.g. `1e10` and `2e10` in `test_regression_edge_cases.js`), incrementing by a static step of `0.5` causes billions of iterations and hangs the CPU.
- **Fix**: Calculate a dynamic step size:
  ```javascript
  const step = Math.max(0.5, (maxLoad - minLoad) / 1000);
  for (let L = minLoad; L <= maxLoad; L += step) {
  ```
  Ensure this is applied to BOTH `js/physics-engine.js` and `test_load_velocity.js`.

### Bug 2: Jump Metric Header Mapping Failure for Units
- **Location 1**: `js/parser.js` (around lines 312-320 inside `_mapHeaders`)
- **Location 2**: `test_load_velocity.js` (around lines 270-275 inside the inline `mapHeaders`)
- **Problem**: Lowercased trimmed headers like `"h (cm)"` and `"tc (s)"` fail to map to `jumpHeight` and `contactTime` because the check strictly looks for `lower === 'h'` or `lower === 'tc'`.
- **Fix**: Allow substring or startsWith matches for units in parentheses:
  - For jumpHeight: `lower === 'h' || lower.startsWith('h (') || lower.startsWith('h(')`
  - For contactTime: `lower === 'tc' || lower.startsWith('tc (') || lower.startsWith('tc(') || lower === 'ct' || lower.startsWith('ct (') || lower.startsWith('ct(')`
  Apply this to BOTH `js/parser.js` and `test_load_velocity.js`.

### Bug 3: Slope Truncation Mismatch in VBT Linear Regression
- **Location 1**: `js/physics-engine.js` (around line 60 inside `linearRegressionVBT` after computing slope)
- **Location 2**: `test_load_velocity.js` (around line 78 inside the inline `linearRegressionVBT` after computing slope)
- **Problem**: `test_vbt_math_stress.js` fails because it asserts that a flat dataset with slope below a `1e-4` threshold is truncated to `0` (`assert(regFlat.slope === 0, "Tiny slope below threshold is truncated to 0")`), but this threshold is missing in `PhysicsEngine`.
- **Fix**: Add a check:
  ```javascript
  if (Math.abs(slope) < 1e-4) {
      slope = 0;
  }
  ```
  Apply this to BOTH `js/physics-engine.js` and `test_load_velocity.js`.

### Tasks:
1. Apply the fixes to `js/physics-engine.js`, `js/parser.js`, and `test_load_velocity.js`.
2. Run the full test suite to verify everything passes:
   - `node test_logic.js`
   - `node test_parsing.js`
   - `node test_analysis.js`
   - `node test_load_velocity.js`
   - `node test_vbt_math_stress.js`
   - `node test_regression_edge_cases.js`
3. Document the command outputs and verify that 100% of tests are passing.
4. Write a report `handoff.md` and message the parent conversation ID `4c1b5dc4-574e-417b-97d7-a10e9bafd4ab` when done.
