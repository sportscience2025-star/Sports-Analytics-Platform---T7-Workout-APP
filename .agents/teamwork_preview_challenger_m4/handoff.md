# Handoff Report - client-side RAG & VBT Fallback Logic Verification

## 1. Observation
- **Syntax Checks**: Executed `py test_check.py` which printed `"All syntax checks passed."` (line 9).
- **Original Test Suite**: Running `py run_tests_headless.py` executed 20 tests (`test_logic.js`, `test_periodization_extreme_cases.js`, `test_periodization_stress.js`, `test_regression_edge_cases.js`, `test_vbt_math_stress.js`, `test_stress_math_and_parser.js`, `test_stress_parser.js`, `test_load_velocity.js`, `test_analysis.js`, `test_parsing.js`, `test_adversarial_challenger.js`, `test_adversarial_physics.js`, `test_adversarial_scientific_hub.js`, `test_chart_verification.js`, `test_hybrid_regression.js`, `test_knowledge_base.js`, `test_r2_r4_empirical.js`, `test_bryan_mann_stress.js`, `test_new_profiles.js`, `test_rag.js`) and reported `TOTAL: 20 | PASSED: 20 | FAILED: 0`.
- **Regex Edge Cases**: Testing MVT regex on custom test strings using `tests/test_mvt_regex.py` showed:
  - `Squat MVT is 0.35` returned `None` (failed to match due to `"is"` exclusion).
  - `MVT per lo Squat di circa 0.38` returned `None` (failed due to `"di"` alternative eagerly matching and shadowing `"di circa"` in `js/data-analysis.js` lines 99).
  - `Squat is cool but Bench Press MVT: 0.18` returned `0.18` (vicinity match checked 200 characters without verifying if the matched MVT token belonged to Squat or another exercise).
  - `Squat MVT 0.m/s` returned `None` (properly rejected).
  - `Squat MVT 0.4` returned `0.4` (properly parsed).
- **VBT Dashboard Crash**: Running our new fallback verification test `tests/test_vbt_fallbacks.js` exposed a crash on collinear inputs (e.g., identical loads):
  - Error: `TypeError: Cannot read properties of undefined (reading 'toFixed')` at line 921 of `js/data-analysis.js` (`reg.pmaxVelocity.toFixed(3)`).
  - Triggered because `PhysicsEngine.linearRegressionVBT` returns an object missing the `pmaxVelocity` property under `Math.abs(denominator) < 1e-9` (collinear loads).
- **NaN Propagation**: In `js/physics-engine.js` line 511, `estimate1RM` lacks `isNaN` checks:
  - If a regression model yields `NaN` values, the `est <= 0` guard is bypassed because `NaN <= 0` is false, propagating `NaN` directly to `rounded1RM` and the UI dashboard.

## 2. Logic Chain
- **VBT Dashboard Crash**: The regression engine returns a collinear fallback object on line 53 when the denominator is zero. Since this returned object (lines 54-63) lists `pmax: 0` and `pmaxLoad: 0` but omits `pmaxVelocity`, reference to `reg.pmaxVelocity` results in `undefined`. Consequently, formatting this value with `toFixed` on line 921 throws a `TypeError` and crashes the dashboard UI.
- **Vicinity Proximity Bug**: The vicinity check inside `extractMVT` (lines 106-114) uses `indexOf` to find the exercise name, takes a substring index window, and then searches with a generic `mvtRegex` pattern. Because this pattern does not reference the exercise name itself, it will match any MVT value in that window, even if it explicitly belongs to another exercise (like "Bench Press") occurring in the proximity.
- **Regex Shadowing**: The alternation group `(?:di|da|a|:|==?|\s|di\s*circa)*` contains `"di"` before `"di\s*circa"`. Regex engines perform left-to-right eager matching, so the engine matches `"di"`, leaving `" circa 0.38"` unconsumed by the group, causing the overall match to fail.

## 3. Caveats
- IndexedDB storage limit behavior was not investigated under disk pressure.
- We assumed Web Worker loading remains robust under network failures (since tests use local mocks).

## 4. Conclusion
The client-side RAG engine and VBT fallback mechanisms contain several verified vulnerabilities:
- **Collinear crash**: A missing property in the fallback object crashes the data-analysis view.
- **RAG Proximity mismatch**: Close-by exercise data gets misattributed.
- **Regex shadowing**: Prevents valid phrase parsing.
- **NaN propagation**: Missing `isNaN` checks in 1RM estimations.
We recommend implementing explicit property guards, reordering regex alternations, and validating numeric outputs before UI binding.

## 5. Verification Method
- Execute `py run_tests_headless.py`.
- Check `tests/test_vbt_fallbacks.js` which verifies the collinear crash, regex shadowing, and vicinity bug.
- Verify `tests/test_mvt_regex.py` for exact regex behavior comparison.
