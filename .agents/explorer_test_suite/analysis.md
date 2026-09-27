# Detailed Technical Analysis: Test Infrastructure & Cache Versioning (T7 Workout PWA)

## Executive Summary
This report presents an exhaustive investigation of the test infrastructure, Service Worker cache versioning scheme, and existing test coverage for the T7 Workout PWA project. Special emphasis is placed on identifying test gaps and formulating concrete test case recommendations for **Requirement R1 (Encoder ID Auto-Parsing)** and **Requirement R2 (Force-Velocity Imbalance / Sfv UI Binding & Calculation Fix)**.

---

## 1. Test Infrastructure Architecture (`run_all_js_tests.py` & Test Suite)

### 1.1 Python Test Server (`run_all_js_tests.py`)
- **Mechanism**: Spawns a custom Python HTTP server using `http.server.SimpleHTTPRequestHandler` on port 8080 and automatically launches the system web browser to `http://localhost:8080/runner.html`.
- **Muted Logs & CORS**: Overrides `log_message` to keep terminal output clean and injects `Access-Control-Allow-Origin: *` headers.
- **IPC Endpoint (`/test-results`)**: Handles `POST` payloads containing overall status, test duration, and detailed logs. Upon receipt, prints a formatted console summary (`🔬 T7 WORKOUT TEST SUITE SUMMARY`) and exits cleanly with exit code `0` (if all passed) or `1` (if any failed).

### 1.2 Dashboard Test Runner (`runner.html` & `iframe_runner.html`)
- **Isolation Execution**: For each test JS file, `runner.html` creates a hidden `<iframe>` pointing to `iframe_runner.html?test=<file>`. Each test runs in an isolated browser context.
- **IPC Communication**: Iframes communicate results back to `runner.html` via `window.postMessage`.
- **Registered Test Files**: Currently, `runner.html` defines 17 test JS files in its `testFiles` array:
  1. `test_logic.js`
  2. `test_periodization_extreme_cases.js`
  3. `test_periodization_stress.js`
  4. `test_regression_edge_cases.js`
  5. `test_vbt_math_stress.js`
  6. `test_stress_math_and_parser.js`
  7. `test_stress_parser.js`
  8. `test_load_velocity.js`
  9. `test_analysis.js`
  10. `test_parsing.js`
  11. `test_adversarial_challenger.js`
  12. `test_adversarial_physics.js`
  13. `test_adversarial_scientific_hub.js`
  14. `test_chart_verification.js`
  15. `test_hybrid_regression.js`
  16. `test_knowledge_base.js`
  17. `test_r2_r4_empirical.js`

### 1.3 Discrepancy & Standalone Runner Scripts
- **Unregistered Test File**: `test_empirical_r1_r3.js` is present in the repository root alongside a dedicated Python runner `run_empirical_r1_r3_verification.py`, but is **not registered** in `runner.html`'s `testFiles` array.
- **Other Standalone Test Scripts**:
  - `run_chart_verification.py`
  - `run_empirical_checks.py`
  - `run_empirical_r1_r3_verification.py`
  - `simulate_test_suite.py`
  - `verify_excel.py`

---

## 2. Service Worker Cache Versioning (`sw.js`)

### 2.1 Current Configuration
- **Cache Constant**: `const CACHE_NAME = 't7-workout-v17';` (Line 6 in `sw.js`).
- **Naming Pattern**: `t7-workout-v<N>`, where `<N>` is an integer version index (e.g., `v17` -> `v18`).
- **Pre-cached Core Assets**: Includes `./index.html`, `./offline.html`, `./manifest.json`, `./css/style.css`, and all 11 JavaScript modules (`data.js`, `media.js`, `knowledge-base.js`, `physics-engine.js`, `parser.js`, `logic.js`, `ui.js`, `data-analysis.js`, `app.js`, `impact-calculator.js`, `clinical.js`), along with application icons.

### 2.2 Caching Behavior & Cleanup
- **HTML Navigation**: Network-first strategy to ensure fresh document retrieval, falling back to cached HTML and then `offline.html`.
- **Static Assets**: Cache-first strategy for JS/CSS/images.
- **Cache Invalidation**: During the SW `activate` event, any cache key in `caches.keys()` that does not match `CACHE_NAME` is purged via `caches.delete(key)`.
- **Mandatory AGENTS.md Compliance Rule**: Whenever any JS, CSS, or static asset file is modified during worker implementations for R1 or R2, `CACHE_NAME` in `sw.js` MUST be bumped (e.g., from `t7-workout-v17` to `t7-workout-v18`).

---

## 3. Existing Test Mapping & Gap Analysis for R1 and R2

### 3.1 Categorization of Existing Tests
| Category | File | Description |
|---|---|---|
| **Physics & Math Calculations** | `test_load_velocity.js`, `test_vbt_math_stress.js`, `test_adversarial_physics.js`, `test_hybrid_regression.js` | Validates OLS linear/quadratic regression, F0, V0, Pmax, MAD outlier removal, 95% CI bounds, and mathematical stability. |
| **Data Parser** | `test_parsing.js`, `test_stress_parser.js`, `test_stress_math_and_parser.js`, `test_empirical_r1_r3.js` | Tests Excel (XLSX/CSV) and PDF ingestion, table layout detection, column header mapping, and basic athlete extraction from filenames. |
| **UI & DOM Interactions** | `test_analysis.js`, `test_chart_verification.js`, `test_r2_r4_empirical.js` | Tests Chart.js canvas instance lifecycle, custom MVT stepper controls, navigation badges, and local storage state persistence. |

### 3.2 Specific Gap Analysis

#### **Requirement R1 (Encoder ID Auto-Parsing)**
- **Scope**: When processing raw device/sensor IDs (e.g., `Tommaso_mhkuhpch00134m`), extract the readable athlete name (`Tommaso`) by splitting on `_` for UI default inputs, avoiding generic placeholders like `"Encoder"`.
- **Existing Coverage**: `test_parsing.js` tests dataset ingestion with standard names ("Mario Rossi"). `test_empirical_r1_r3.js` tests filename extraction on full filenames like `Mario_Rossi_vbt_export_2026-06-15.xlsx`.
- **Gaps**:
  1. No test verifies splitting raw device/sensor string tokens (e.g. `Tommaso_mhkuhpch00134m` -> `Tommaso`).
  2. No test verifies DOM binding in UI input controls (`#manual-athlete` or dropdown selects) to ensure `"Encoder"` is replaced with the extracted string.
  3. No test verifies fallback behavior when raw IDs lack readable names (e.g., `_sensor_123`, `992831`).

#### **Requirement R2 (Force-Velocity Imbalance / Sfv UI Binding & Calculation Fix)**
- **Scope**: Fix logic causing Force-Velocity Imbalance (Sfv) badge/slider to render `"undefined"`. Ensure valid numerical outputs without extra descriptive text or string error states.
- **Existing Coverage**: `test_load_velocity.js` checks `sfvp` numerical calculation on ideal data.
- **Gaps**:
  1. No test verifies UI DOM elements (e.g., `#sfv-badge`, `#sfv-slider`, or VBT summary cards) for the presence of `"undefined"`.
  2. No test checks degenerate or edge-case physics inputs (collinear points, zero slope, missing metrics) where `sfv` calculation might evaluate to `NaN` or `undefined`.
  3. No test validates that the bound UI value displays strictly pure numerical formatting (e.g., `12.5%` or `12.5`) as specified in acceptance criteria.

---

## 4. Test Case Recommendations for R1 and R2

To guarantee complete coverage and robust regression prevention, the following test suites should be added to the test suite (e.g. in `test_parsing.js` and `test_load_velocity.js`, or a new `test_r1_r2_empirical_verification.js` registered in `runner.html`):

### 4.1 Recommended Test Cases for R1 (Encoder ID Auto-Parsing)
1. **`Test_R1_Raw_Encoder_ID_Splitting`**:
   - *Input*: `Tommaso_mhkuhpch00134m`, `Giuseppe_sensor_9812`, `Elena_vbt_001`.
   - *Assert*: `DataParser.extractAthleteFromRawId(id)` returns `"Tommaso"`, `"Giuseppe"`, `"Elena"`.
2. **`Test_R1_UI_Input_Default_Binding`**:
   - *Input*: Ingest raw data record with raw athlete ID `Tommaso_mhkuhpch00134m`.
   - *Assert*: DOM element `#manual-athlete` (or relevant athlete select) has `.value === 'Tommaso'` and does NOT equal `'Encoder'`.
3. **`Test_R1_Encoder_ID_Fallback`**:
   - *Input*: Raw IDs with no valid prefix, e.g., `_123456`, `encoder_001`, `12345`.
   - *Assert*: Gracefully falls back to empty string `""` or `"Encoder"` without throwing errors.

### 4.2 Recommended Test Cases for R2 (Sfv Calculation & UI Binding)
1. **`Test_R2_Sfv_Undefined_Prevention`**:
   - *Input*: Various datasets (ideal, noisy, degenerate with identical loads, 2-point datasets).
   - *Assert*: Rendered Sfv DOM element (`#sfv-badge` or equivalent) `innerHTML` / `textContent` does NOT contain the string `"undefined"`.
2. **`Test_R2_Sfv_Numerical_Formatting`**:
   - *Input*: Standard VBT dataset producing F-V imbalance.
   - *Assert*: Returned Sfv result is a finite number, and UI text output displays purely numerical value (e.g. matches regex `/^[+-]?\d+(\.\d+)?%?$/`).
3. **`Test_R2_Sfv_Degenerate_Fallback`**:
   - *Input*: Empty dataset, single point, or collinear load points where slope is 0.
   - *Assert*: `PhysicsEngine.linearRegressionVBT` returns fallback `sfvp: 0` (or structured fallback object) instead of `undefined` or `NaN`.

---

## 5. Summary of Actionable Next Steps for Workers
1. **Service Worker**: Upon completing changes in JS/CSS, update `sw.js` line 6: `const CACHE_NAME = 't7-workout-v18';`.
2. **Test Integration**: Ensure new R1/R2 test cases are added to a JS test file that is explicitly listed in `runner.html`'s `testFiles` array so that `py run_all_js_tests.py` executes them automatically.
