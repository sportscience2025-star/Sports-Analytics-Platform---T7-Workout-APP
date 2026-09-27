# Handoff Report — Review of Sport Periodization & VBT Engine

This report details the objective review, adversarial stress-testing, and validation findings of the periodization logic, UI rendering, Excel export, and VBT mathematical calculations.

---

## Part 1: Antigravity Standard Handoff Report

### 1. Observation
I directly executed the test suite using `agy-node.cmd` (Node.js v24.14.0 wrapper) in the workspace directory. The following observations were recorded:

*   **Test Suite Runs**:
    *   Command: `agy-node.cmd test_logic.js`
        *   Result: `All tests passed successfully!`
    *   Command: `agy-node.cmd test_parsing.js`
        *   Result: `All assertions passed successfully!`
    *   Command: `agy-node.cmd test_analysis.js`
        *   Result: `All test assertions passed successfully!`
    *   Command: `agy-node.cmd test_load_velocity.js`
        *   Result: `RISULTATI: 39 PASS / 2 FAIL / 41 TOTALI`
        *   Verbatim failure output:
            ```
            ❌ FAIL  Jump "H (cm)" → jumpHeight  
            ❌ FAIL  Jump "TC (s)" → contactTime  
            ```
    *   Command: `agy-node.cmd test_vbt_math_stress.js`
        *   Result: Failed with exit code 1.
        *   Verbatim failure output:
            ```
            ❌ Failure: Tiny slope below threshold is truncated to 0
            ```
    *   Command: `agy-node.cmd test_regression_edge_cases.js`
        *   Result: The task was blocked (hung) on test 11 (Extremely high weights dataset: `[{"load":1e10,"velocity":1.5},{"load":2e10,"velocity":1.0}]`) and had to be manually terminated (`manage_task kill`).

*   **Code Inspections**:
    *   `js/parser.js` line 308-320:
        ```javascript
        // Jump height
        else if (["altezza salto", "jump height", "altura salto", "volo"].some(t => lower.includes(t)) ||
            lower === 'h' || lower === 'altezza' || lower === 'altura' || lower === 'height') {
            colMap[idx] = 'jumpHeight';
        }
        // Contact time (before generic 'time')
        else if (["tempo contatto", "contact time", "tiempo contatto", "contatto", "contact_time", "tiempo_contacto"].some(t => lower.includes(t)) ||
            lower === 'tc' || lower === 'ct') {
            colMap[idx] = 'contactTime';
        }
        ```
    *   `js/physics-engine.js` line 183-189:
        ```javascript
        for (let L = minLoad; L <= maxLoad; L += 0.5) {
            const V = slope * L + intercept;
            if (V <= 0) break;
            const P = L * 9.81 * V; // simplified: F(N) * V
            if (P > maxP) { maxP = P; bestLoad = L; }
        }
        ```
    *   `js/ui.js` line 1022-1110 contains `_exportProgramToExcel(result)` where data is mapped to distinct sheets using SheetJS (`XLSX.utils.book_append_sheet(wb, wsInfo, 'Info Generali')`, etc.), but does not set the `!protect` property or use merges (`!merges`) inside exercise lists.

### 2. Logic Chain
1.  **Header Mapping Failure**: The unit test `test_load_velocity.js` uses headers `'H (cm)'` and `'TC (s)'` for testing. In `js/parser.js`, the code maps headers by comparing the lowercased trimmed value (`lower`) using strict equality (e.g. `lower === 'h'` or `lower === 'tc'`). Since `"h (cm)"` and `"tc (s)"` do not exactly equal `"h"` and `"tc"`, and do not contain any of the listed multi-word substrings, they are not mapped, causing the two test assertions to fail.
2.  **CPU Lockup/DoS**: The dataset for extremely high loads in `test_regression_edge_cases.js` specifies `minLoad = 1e10` and `maxLoad = 2e10`. In `js/physics-engine.js`, the helper `_findEmpiricalPmaxLoad` scans from `minLoad` to `maxLoad` in steps of `0.5` (`L += 0.5`). This results in `20,000,000,000` (20 billion) loop iterations. Since `V` stays positive in this range (`V = -5e-11 * L + 2`), the `V <= 0` guard is never triggered, causing the browser/node thread to lock up for a prolonged period, causing a CPU denial of service.
3.  **Test Suite Mismatch**: `test_vbt_math_stress.js` asserts that a very flat slope (below `1e-4`) will be truncated to `0` (`assert(regFlat.slope === 0)`). However, `js/physics-engine.js` has no such truncation threshold (it only checks `denominator < 1e-9` for exact collinearity). The flat dataset has a tiny but non-zero slope (~`1.05e-8`), which passes the denominator check and remains non-zero. This mismatch causes the test to fail.
4.  **UI & Export Soundness**: The dynamic week scaling (4, 8, 12, 16 weeks), active recovery deload configurations, and sport overrides (Endurance, Bodybuilding, Team Sports) behave exactly as required. The Excel export uses SheetJS to write clean, unmerged grid structures into four or more worksheets, with no sheet protection active.

### 3. Caveats
- Browser UI interactions (such as the actual drag-and-drop of Excel files or Tesseract OCR execution) were not verified inside a headless browser since no browser-based test suite (e.g. Puppeteer/Cypress) is present in the repository. Analysis was performed via code paths and CLI runner scripts.
- The 5% RM drop in deload intensity is interpreted as "maintaining load %RM" in the sense of keeping the athlete within the heavy movement context, rather than dropping to absolute light warmups.

### 4. Conclusion
The sport periodization overrides, UI wizard rendering, deload structures, and Excel exports are implemented correctly according to specifications. However, the VBT calculations and parsing engines contain major issues: a critical CPU DoS vulnerability during regression under huge load values, a standard force plate header mapping bug, and a minor test suite assertion mismatch. Therefore, the verdict is **REQUEST_CHANGES**.

### 5. Verification Method
To reproduce the findings:
1. Run `agy-node.cmd test_load_velocity.js` to observe the two failed jump header assertions.
2. Run `agy-node.cmd test_vbt_math_stress.js` to observe the tiny slope truncation failure.
3. Run `agy-node.cmd test_regression_edge_cases.js` to observe the CPU hang/lockup (terminate using Ctrl+C or task kill once verified).

---

## Part 2: Quality Review Report

**Verdict**: REQUEST_CHANGES

### Findings

#### [Critical] Finding 1: CPU Lockup / Denial of Service in Physics Engine
-   **What**: Infinite/very long loop locking up the javascript thread.
-   **Where**: `js/physics-engine.js`, line 183 (`_findEmpiricalPmaxLoad` loop).
-   **Why**: The loop increments by `0.5` from `minLoad` to `maxLoad`. When user inputs extreme load values (e.g. `1e10` to `2e10` kg), this loop executes 20 billion times, locking up the CPU.
-   **Suggestion**: Instead of scanning with a hardcoded step of `0.5`, the step size should scale with the range (e.g. `const step = Math.max(0.1, (maxLoad - minLoad) / 200)`), or the maximum power load should be solved analytically. For a linear F-V profile, the mechanical power is $P = L \cdot g \cdot (a \cdot L + b) = a \cdot g \cdot L^2 + b \cdot g \cdot L$. The maximum of this quadratic function is located at $L = -b / (2a)$, which is exactly `f0 / 2`. The scan loop is mathematically redundant and should be replaced by an analytical check `bestLoad = f0 / 2`, clamped to the `[minLoad, maxLoad]` interval.

#### [Major] Finding 2: Jump Metric Header Mapping Failure
-   **What**: Standard force plate headers containing unit markers are not mapped.
-   **Where**: `js/parser.js`, lines 308-320 (`_mapHeaders` method).
-   **Why**: Headers like `'H (cm)'` and `'TC (s)'` are parsed to lowercased `"h (cm)"` and `"tc (s)"`. The code only checks for exact equality with `'h'` or `'tc'` (or other substrings not containing these).
-   **Suggestion**: Update the mapping logic in `js/parser.js` (and the test helper in `test_load_velocity.js`) to support these standard strings. E.g., change `lower === 'h'` to `lower === 'h' || lower.startsWith('h ') || lower.includes('(cm)')`, and same for `tc`.

#### [Minor] Finding 3: Test Suite Mismatch on Slope Truncation
-   **What**: Unit test asserts a feature that is not in the source code.
-   **Where**: `test_vbt_math_stress.js`, line 80.
-   **Why**: The test asserts `regFlat.slope === 0` for very flat slopes, assuming a threshold of `1e-4` is implemented. No such threshold is present in `js/physics-engine.js`.
-   **Suggestion**: Either implement the slope threshold guard in `js/physics-engine.js` (e.g. `if (Math.abs(slope) < 1e-4) slope = 0;`), or correct the test to reflect the true mathematical outputs.

### Verified Claims
-   **Dynamic weeks scaling**: Checked via `test_logic.js` (weeks 4, 8, 12, 16 scale correctly to 2, 4, 6, 8 phases) $\rightarrow$ **PASS**.
-   **Endurance constraints**: Capped to 2 days, multi-joint exercises only, reps = 5, load = 85% RM $\rightarrow$ verified via `test_logic.js` $\rightarrow$ **PASS**.
-   **Bodybuilding constraints**: Reps = 10, load = 75% RM, rest = 75s, isolation exercises included $\rightarrow$ verified via `test_logic.js` $\rightarrow$ **PASS**.
-   **Team sports constraints**: Tempo = `'X-0-1'` or `'X-0-X'` $\rightarrow$ verified via `test_logic.js` $\rightarrow$ **PASS**.
-   **Deload sets reduction**: Sets drop by 40-50% (measured at ~42%) $\rightarrow$ verified via `test_logic.js` $\rightarrow$ **PASS**.
-   **Excel export structure**: In `js/ui.js`, 4+ distinct worksheets are appended, cells are not merged in lists, and no sheet protection is set $\rightarrow$ verified via code path review $\rightarrow$ **PASS**.
-   **UI Wizard logic**: Conditional toggling of sport praticato on subject type is correctly wired $\rightarrow$ verified via code path review $\rightarrow$ **PASS**.

---

## Part 3: Adversarial Review Report

**Overall risk assessment**: HIGH (due to the CPU DoS vulnerability).

### Challenges

#### [Critical] Challenge 1: Loop Step CPU Hog (Vulnerability 1)
-   **Assumption challenged**: That users will only input standard athletic weight ranges (e.g., 0 - 500kg).
-   **Attack scenario**: A user uploads a messy Excel sheet containing a column formatted as timestamps or large ID values mapped as "load", or manually types an extremely large load value.
-   **Blast radius**: Entire browser tab freezes / locks up, triggering a "Page Unresponsive" dialog. In offline or local contexts, it consumes 100% of a CPU core until terminated.
-   **Mitigation**: Remove the scan loop in `_findEmpiricalPmaxLoad` and calculate the optimal load mathematically using the peak of the quadratic power curve (since $P = g \cdot L \cdot (a \cdot L + b)$, $P'_{L} = g(2a \cdot L + b) = 0 \implies L_{opt} = -b / (2a)$ which is $F0 / 2$). Alternatively, use a dynamic step size `(maxLoad - minLoad) / 100`.

#### [High] Challenge 2: Fragile Header Mappings (Vulnerability 2)
-   **Assumption challenged**: That encoder and force plate outputs use clean, un-annotated column headers.
-   **Attack scenario**: Uploading standard csv/xlsx exports from force plates (such as ForceDecks) which format columns with unit markers (e.g. `H (cm)` or `TC (s)`).
-   **Blast radius**: Important metrics (jump height and contact time) are not parsed, leaving athletes' profiles empty or causing calculations to fail silently.
-   **Mitigation**: Use regular expressions or less restrictive string contains checks in `_mapHeaders`.

### Stress Test Results
-   *Scenario 1*: Collinear data points (same load or same velocity) $\rightarrow$ Handled successfully via guards returning `slope: 0`, preventing division by zero $\rightarrow$ **PASS**.
-   *Scenario 2*: NaNs and invalid types in load/velocity inputs $\rightarrow$ Returns `slope: NaN` but does not crash; handles calculations gracefully $\rightarrow$ **PASS**.
-   *Scenario 3*: Flat datasets $\rightarrow$ Assertion failed in test due to lack of flat slope truncation threshold in code $\rightarrow$ **FAIL**.
-   *Scenario 4*: High loads dataset $\rightarrow$ CPU lockup due to 20 billion iterations loop $\rightarrow$ **FAIL**.

### Unchallenged Areas
-   **Visual PDF Rendering**: The exact visual output of the browser printing dialog (page breaks, margin sizing) depends on the browser engine's printer implementation and cannot be fully tested headlessly without a visual rendering framework.
