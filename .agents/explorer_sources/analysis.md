# Scientific Sources & Test Runner Analysis Report

## Executive Summary
This report analyzes the scientific sources present in the `js/knowledge-base.js` database, retrieves the Service Worker cache version from `sw.js`, and verifies the test execution suite. 

All 18 JavaScript unit tests pass successfully with zero errors. All JS files conform to syntactical rules.

---

## 1. Scientific Sources Statistics (`js/knowledge-base.js`)
We parsed the `window.App.scientificSources` array inside `js/knowledge-base.js` and counted **105** peer-reviewed studies. The distribution across the 7 categories is as follows:

| Category | Number of Sources | Percentage |
| :--- | :---: | :---: |
| **Fisiologia** | 25 | 23.8% |
| **Biomeccanica** | 18 | 17.1% |
| **Clinico** | 18 | 17.1% |
| **Sport di Squadra** | 17 | 16.2% |
| **Atletica Leggera** | 13 | 12.4% |
| **Sollevamento Pesi** | 9 | 8.6% |
| **VBT** | 5 | 4.8% |
| **Total** | **105** | **100.0%** |

---

## 2. Service Worker Cache Version (`sw.js`)
Reading the `sw.js` file, we identified the current cache name configuration:
* **Cache Name / Version**: `'t7-workout-v31'`
* **Asset List**: 15 items pre-cached (including core HTML, styles, scripts, and icons).

---

## 3. Test Runner Validation & Status

### A. Syntax Verification (`py tools/test_check.py`)
The syntax validator was executed and all 11 core JS modules passed:
```
OK: js\app.js
OK: js\clinical.js
OK: js\data-analysis.js
OK: js\data.js
OK: js\impact-calculator.js
OK: js\knowledge-base.js
OK: js\logic.js
OK: js\media.js
OK: js\parser.js
OK: js\physics-engine.js
OK: js\ui.js
```

### B. JavaScript Unit Tests (`py run_all_js_tests.py` & `py run_tests_headless.py`)
1. **`py run_all_js_tests.py`**:
   This script launches a local HTTP server on port 8080 and attempts to open an interactive, non-headless browser via python's `webbrowser` library. In automated/non-GUI server execution environments, this script hangs indefinitely because the default browser cannot run interactively without a GUI session.
2. **`py run_tests_headless.py`**:
   To validate the test suite, we successfully ran the headless alternative, which spins up Chrome/Edge in `--headless` mode on port 8085. 
   
**Results:** **PASS (18 tests passed, 0 failed)**.
```
==================================================
T7 WORKOUT TEST SUITE HEADLESS RESULTS
==================================================
Status: PASS
Message: Suite complete. Passed: 18, Failed: 0. Time: 13930ms
--------------------------------------------------
PASS test_logic.js                            (868 ms)
PASS test_periodization_extreme_cases.js      (524 ms)
PASS test_periodization_stress.js             (2461 ms)
PASS test_regression_edge_cases.js            (625 ms)
PASS test_vbt_math_stress.js                  (602 ms)
PASS test_stress_math_and_parser.js           (555 ms)
PASS test_stress_parser.js                    (904 ms)
PASS test_load_velocity.js                    (588 ms)
PASS test_analysis.js                         (544 ms)
PASS test_parsing.js                          (693 ms)
PASS test_adversarial_challenger.js           (702 ms)
PASS test_adversarial_physics.js              (409 ms)
PASS test_adversarial_scientific_hub.js       (547 ms)
PASS test_chart_verification.js               (733 ms)
PASS test_hybrid_regression.js                (824 ms)
PASS test_knowledge_base.js                   (957 ms)
PASS test_r2_r4_empirical.js                  (244 ms)
PASS test_bryan_mann_stress.js                (352 ms)
==================================================
TOTAL: 18 | PASSED: 18 | FAILED: 0
==================================================
```
