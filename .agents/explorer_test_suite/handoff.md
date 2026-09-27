# Handoff Report: Test Infrastructure & Cache Versioning (Explorer 3)

## 1. Observation
- **Test Execution Script (`run_all_js_tests.py`)**:
  - Starts an HTTP server on port 8080 (`PORT = 8080`) and opens `http://localhost:8080/runner.html` in the browser (lines 10, 87, 90).
  - Listens on POST `/test-results` (line 22). Prints console output: `"🔬 T7 WORKOUT TEST SUITE SUMMARY"`, total passed/failed, and exits via `os._exit(0)` on pass or `1` on failure (lines 28, 62).
- **Test Dashboard (`runner.html`)**:
  - Configured with `testFiles` array (lines 349-367) containing 17 JS files (`test_logic.js`, `test_periodization_extreme_cases.js`, `test_periodization_stress.js`, `test_regression_edge_cases.js`, `test_vbt_math_stress.js`, `test_stress_math_and_parser.js`, `test_stress_parser.js`, `test_load_velocity.js`, `test_analysis.js`, `test_parsing.js`, `test_adversarial_challenger.js`, `test_adversarial_physics.js`, `test_adversarial_scientific_hub.js`, `test_chart_verification.js`, `test_hybrid_regression.js`, `test_knowledge_base.js`, `test_r2_r4_empirical.js`).
  - Executes each test in an isolated `<iframe>` (`iframe_runner.html?test=<file>`, line 493).
  - Note: `test_empirical_r1_r3.js` exists in root directory but is **not listed** in `testFiles` in `runner.html`.
- **Service Worker (`sw.js`)**:
  - Current cache version constant on line 6: `const CACHE_NAME = 't7-workout-v17';`.
  - Core cached assets array `CORE_ASSETS` (lines 9-31) includes HTML, CSS, manifest, icons, and 11 JS files (`data.js`, `media.js`, `knowledge-base.js`, `physics-engine.js`, `parser.js`, `logic.js`, `ui.js`, `data-analysis.js`, `app.js`, `impact-calculator.js`, `clinical.js`).
  - `activate` listener (lines 47-60) deletes any old cache key where `key !== CACHE_NAME`.
- **Requirements R1 & R2 Scope (`.agents/ORIGINAL_REQUEST.md`)**:
  - R1: Raw encoder ID auto-parsing (e.g., `Tommaso_mhkuhpch00134m` -> extract `"Tommaso"` before `_` as UI default input, avoiding generic `"Encoder"`).
  - R2: Force-Velocity Imbalance (Sfv) calculation & UI binding fix to eliminate `"undefined"` on badges/sliders and display pure numeric values.

## 2. Logic Chain
1. **Infrastructure Flow**: When `py run_all_js_tests.py` is invoked, it launches a local server and opens `runner.html`. `runner.html` iterates through `testFiles`, running each test inside an `iframe_runner.html` sandbox. Results are posted back to python via HTTP POST `/test-results`.
2. **Cache Versioning Rule**: Per `AGENTS.md` and `sw.js` implementation, static assets are cached under `t7-workout-v17`. Any code changes in `js/`, `css/`, or root HTML will be ignored by clients with existing Service Workers unless `CACHE_NAME` in `sw.js` is incremented (e.g. `t7-workout-v18`).
3. **Coverage Gap Synthesis**:
   - For R1: Existing tests (`test_parsing.js`, `test_empirical_r1_r3.js`) check dataset table headers and full file names (e.g. `Mario_Rossi_vbt_export_2026-06-15.xlsx`). They do NOT test parsing raw device/sensor string IDs like `Tommaso_mhkuhpch00134m` or verifying DOM input binding in UI controls (`#manual-athlete`).
   - For R2: Existing physics tests (`test_load_velocity.js`) test mathematical OLS output. They do NOT test UI DOM binding or verify that DOM elements displaying Sfv metrics are free of `"undefined"` or correctly formatted as pure numbers under edge/degenerate mathematical cases.

## 3. Caveats
- Browser test execution relies on system default browser launching during `py run_all_js_tests.py`.
- `test_empirical_r1_r3.js` is currently run standalone via `python run_empirical_r1_r3_verification.py` rather than through `runner.html`. Recommendation is provided to consolidate test registration.

## 4. Conclusion
- The test infrastructure and cache versioning mechanisms are well-structured and functioning.
- To maintain SW cache validity during R1/R2 implementations, workers must bump `sw.js` to `t7-workout-v18`.
- Concrete test additions must be registered in `runner.html` to cover raw encoder ID token splitting (R1), DOM input fallback (R1), UI `"undefined"` prevention (R2), and pure numerical formatting for Sfv (R2).

## 5. Verification Method
- **Verify Test Suite Execution**: Run `py run_all_js_tests.py` from terminal. Confirm server starts on port 8080, browser opens, 17 suites execute, and summary report prints cleanly with 0 failures.
- **Verify Cache Versioning**: Inspect `sw.js` line 6 to confirm `CACHE_NAME` matches current version (`t7-workout-v17`).
- **Verify Detailed Findings**: Inspect `e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_test_suite/analysis.md`.
