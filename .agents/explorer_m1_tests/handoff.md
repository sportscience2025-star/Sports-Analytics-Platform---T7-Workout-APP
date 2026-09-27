# Milestone 1 Investigation Report: Test Infrastructure & SW Cache Configuration

## 1. Observation
- **Service Worker Cache File (`sw.js`)**:
  - Exact file location: `sw.js` (project root).
  - Current cache version string: `const CACHE_NAME = 't7-workout-v28';` at line 6. Comment at line 2 indicates `T7 Workout - Service Worker v5`.
  - Core asset manifest: `CORE_ASSETS` array (lines 9-31) lists 16 assets (`./`, `index.html`, `offline.html`, `manifest.json`, `style.css`, 11 core JS modules, 2 PNG icons).
  - Cache cleaning logic: In `activate` event handler (lines 47-60), `caches.keys()` iterates over existing cache stores and purges any key where `key !== CACHE_NAME`.
- **Syntax Validation Script (`tools/test_check.py`)**:
  - Exact file location: `tools/test_check.py`.
  - Script behavior: Uses Python `glob.glob('../js/*.js')` (line 4) to read JS modules in `js/` directory when executed from inside `tools/`.
  - Stack-based parser: Implements custom character scanning for bracket matching (`()`, `{}`, `[]`), quote escaping (`"`, `'`, `` ` ``), and comment filtering (`//`, `/* */`).
  - Terminal run output: Running `py test_check.py` with CWD `e:/Nuove App Installate/App esercizi scienze motorie/tools` validated 10 JS modules as `OK` (`app.js`, `clinical.js`, `data-analysis.js`, `data.js`, `impact-calculator.js`, `knowledge-base.js`, `logic.js`, `media.js`, `parser.js`, `physics-engine.js`). It printed `ERROR in ../js\ui.js: Mismatched ( (from L14:C17) with ] at L1167:C279`.
- **Test Suite Runner (`run_all_js_tests.py` & `tests/`)**:
  - Exact file location: `run_all_js_tests.py` (project root).
  - Execution architecture: Spun up Python `http.server` on port 8080 (`PORT = 8080`). Opens default web browser via `webbrowser.open("http://localhost:8080/tests/runner.html")`.
  - Dashboard & Iframe execution: `tests/runner.html` iterates through 17 test files, embedding each inside an isolated iframe running `tests/iframe_runner.html?test=<test_file>`.
  - Mock environment (`tests/iframe_runner.html`): Mocks Node.js runtime globals (`Buffer`, `process`, `__dirname`, `__filename`, `require` for `fs` and `path`, `global`) to execute Node-formatted JS unit tests inside browser context.
  - Test suite files in `tests/` (17 total files verified by `tools/run_empirical_checks.py`):
    1. `test_logic.js` (2,100 bytes)
    2. `test_periodization_extreme_cases.js` (506 bytes)
    3. `test_periodization_stress.js` (100,252 bytes)
    4. `test_regression_edge_cases.js` (100,252 bytes)
    5. `test_vbt_math_stress.js` (343 bytes)
    6. `test_stress_math_and_parser.js` (984 bytes)
    7. `test_stress_parser.js` (9,606 bytes)
    8. `test_load_velocity.js` (2,321 bytes)
    9. `test_analysis.js` (391 bytes)
    10. `test_parsing.js` (8,677 bytes)
    11. `test_adversarial_challenger.js` (4,247 bytes)
    12. `test_adversarial_physics.js` (15,215 bytes)
    13. `test_adversarial_scientific_hub.js` (2,398 bytes)
    14. `test_chart_verification.js` (16,056 bytes)
    15. `test_hybrid_regression.js` (5,654 bytes)
    16. `test_knowledge_base.js` (2,355 bytes)
    17. `test_r2_r4_empirical.js` (338 bytes)

## 2. Logic Chain
1. **Service Worker Cache Invalidation Mechanism**:
   - `sw.js` defines `CACHE_NAME = 't7-workout-v28'`.
   - When any JS or CSS file is modified, browser cache must be invalidated. Per project guidelines (`AGENTS.md`), updating JS/CSS files requires incrementing `CACHE_NAME` (e.g. `v28` -> `v29`).
   - During SW activation (`activate` event), the code filters existing cache keys and calls `caches.delete(key)` on all keys that do not equal `CACHE_NAME`. Thus, bumping the version string guarantees that stale cached files are deleted on clients upon service worker update.
2. **JavaScript Syntax Verification (`test_check.py`) Analysis**:
   - `AGENTS.md` mandates running `py test_check.py` after editing any JS file.
   - Analysis of `tools/test_check.py` code shows it looks for `glob.glob('../js/*.js')`. Therefore, executing it from the project root yields zero matches. It must be run with working directory set to `tools/`.
   - Inspection of `ui.js` error output (`Mismatched ( at L14:C17`) reveals a structural scanner limitation: `test_check.py` line-scanning logic handles standard quotes and code comments, but does NOT tokenize JavaScript regular expression literals (such as `.replace(/"/g, '&quot;')` at lines 11-15 of `ui.js`). At line 14, `test_check.py` treats the quote in `/"/g` as a opening string literal, causing character tracking desynchronization.
3. **Test Infrastructure Architecture**:
   - Node.js binary is not installed in the local operating environment (`node` command returned `CommandNotFoundException`).
   - The test infrastructure compensates by implementing a browser-based runner architecture (`run_all_js_tests.py` + `tests/runner.html` + `tests/iframe_runner.html`).
   - `iframe_runner.html` polyfills Node modules (`fs`, `path`) via synchronous XMLHttpRequests to local relative paths and intercepts `console.log`/`console.error`.
   - All 17 unit/stress/adversarial test scripts test specific core components (`logic.js`, `parser.js`, `physics-engine.js`, `knowledge-base.js`, `data-analysis.js`).

## 3. Caveats
- Node.js is not present in the local OS environment PATH. Running tests via standard command-line test runners like Jest or mocha is not directly supported; test execution relies on `py run_all_js_tests.py` which launches the default browser, or Python verification scripts in `tools/`.
- `tools/test_check.py` relies on relative paths (`../js/*.js`) and will fail silently with zero output if executed outside the `tools/` directory.
- `tools/test_check.py` fails on regular expression literals containing quotes (e.g., in `ui.js`), reporting false-positive syntax desynchronization.

## 4. Conclusion
- The test infrastructure is fully located and operational. The primary entry point for full functional verification is `py run_all_js_tests.py` (which runs all 17 test suites via browser iframe integration).
- Syntax checking is governed by `tools/test_check.py` in `tools/` (subject to regex literal limitations).
- Service worker cache versioning is managed by `const CACHE_NAME = 't7-workout-v28';` in `sw.js`. Any future agent modifying frontend scripts must increment this string (e.g. `t7-workout-v29`) and run syntax checks.

## 5. Verification Method
1. **Verify Test Suites Existence & Integrity**:
   - Run command: `py tools/run_empirical_checks.py` from project root `e:/Nuove App Installate/App esercizi scienze motorie`.
   - Expected result: Output listing `TOTAL TEST SUITES: 17 | PASSED: 17 | FAILED: 0`.
2. **Verify Syntax Validation Script**:
   - Run command: `py test_check.py` from directory `e:/Nuove App Installate/App esercizi scienze motorie/tools`.
   - Expected result: Scans 11 JS files, returns `OK` for 10 files and flags known regex string literal desynchronization in `ui.js`.
3. **Verify Service Worker Cache Configuration**:
   - Inspect `sw.js` line 6: Confirm `CACHE_NAME` matches format `t7-workout-vXX` (currently `t7-workout-v28`).
4. **Run Full JS Test Suite**:
   - Run command: `py run_all_js_tests.py` from project root `e:/Nuove App Installate/App esercizi scienze motorie`.
   - Expected result: Server starts on `http://localhost:8080`, launches browser, executes 17 test suites in isolated iframes, and receives `POST /test-results` returning `PASS` status.
