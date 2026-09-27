# Adversarial Reviewer Round 1 Report

> [!WARNING] **Skepticism Disclaimer**
> High confidence (96%): Verified through active execution of all 4 test suites (104 empirical stress assertions, 7 stress parser scenarios, and full Excel/PDF extraction tests) across Node.js runtime, though live browser drag-and-drop file ingestion was verified via mock runners rather than a headless browser instance.

## 1. What the prior attempt got wrong
1. **Uninvoked Test Runners Masking Failures**:
   - **Input**: Executing `node tests/test_parsing.js` and `node tests/test_stress_parser.js`.
   - **Expected**: Automated test suites execute, log verification steps, assert data correctness, and report pass/fail verdicts.
   - **Actual**: Both scripts loaded without executing any tests, returning empty stdout and exit code 0.
   - **Root Cause**: Neither file invoked its main test function (`runTests()` in `test_parsing.js` and `runAll()` in `test_stress_parser.js`). The prior attempt claimed `runTests()` was executed with 100% success, but the invocation was missing from the committed test files.

2. **VBT Non-positive/Corrupt Load Filtering Failure (Scenarios 4 and 6 in `test_stress_parser.js`)**:
   - **Input**: Excel data containing a load column (`"Carga"`) with corrupt non-numeric values (`"broken"`) or non-positive loads (`0`, `-10`) paired with valid velocities (`0.55`, `0.75`).
   - **Expected**: Rows lacking a valid positive load (`load > 0`) must be rejected/filtered out in VBT datasets, and if all rows are filtered, `DataParser.parseExcel` must reject with `Error("Nessun dato utile trovato nel file Excel.")`.
   - **Actual**: The parser accepted rows with corrupt/zero/negative loads because `(record.velocity !== null && record.velocity > 0)` was evaluated as an independent `OR` clause in `hasValidData`, causing Scenario 4 (`Non-numeric Values in Numeric Fields`) to fail and Scenario 6 (`All Invalid/Filtered Records`) to succeed instead of rejecting.
   - **Root Cause**: In `js/parser/file-readers.js`, `hasValidData` did not enforce that in datasets defining a `load` column (`hasLoadCol = Object.values(colMap).includes('load')`), a VBT record requires `record.load !== null && record.load > 0`. A velocity measurement without a positive load is invalid for VBT profiles.

## 2. What I changed
- **`js/parser/file-readers.js`**:
  - Added detection of whether the current sheet contains a mapped load column: `const hasLoadCol = Object.values(colMap).includes('load');`.
  - Enforced `hasValidVbt` logic: when `hasLoadCol` is true, VBT validity strictly requires `(record.load !== null && record.load > 0)`. If false, falls back to checking velocity and derived metrics.
  - Removed redundant standalone VBT metric checks from `hasValidData` to prevent bypass of load validation.
- **`tests/test_parsing.js`**:
  - Added invocation `runTests().catch(...)` at the end of the file to execute the Excel and PDF extraction assertions upon running `node tests/test_parsing.js`.
- **`tests/test_stress_parser.js`**:
  - Added invocation `runAll().catch(...)` at the end of the file to execute all 7 stress test scenarios upon running `node tests/test_stress_parser.js`.

## 3. Verification Record
- **Deep Verification (ran actual tests):**
  - `py test_check.py`: Passed with exit code 0 (`Validating js/data-analysis.js... All syntax checks passed.`). Confirmed delimiter balance across all `js/parser/` and `js/logic/` files and verified `sw.js` cache version `t7-workout-v66`.
  - `node tests/test_parsing.js`: Passed with exit code 0 (`Excel parsed successfully: 8 records found.`, `PDF parsed successfully: 8 records found.`, `All assertions passed successfully!`).
  - `node tests/test_stress_parser.js`: Passed with exit code 0 (7 / 7 test cases passed: Standard Good Data, No Columns Matching, Sparse Sheet, Non-numeric Values in Numeric Fields, Mismatched Row Lengths, All Invalid/Filtered Records, Drop Height Header Mapping).
  - `node tests/test_parser_empirical_stress.js`: Passed with exit code 0 (104 / 104 assertions passed across all 5 empirical suites: Cross-Instrument Discrimination, Medicine Ball Edge Cases, Repeated Trials & aggregateByLoad Integrity, Header Collision Avoidance, Robustness & Adversarial Boundaries).
- **Shallow Verification (manual only):**
  - Verified `js/parser.js` line count: 146 lines (< 150 lines threshold).
  - Verified no unexpected emojis or unicode symbols exist in any of the 7 parser files.
- **Unverified aspects:**
  - Live browser physical drag-and-drop file ingestion with DOM rendering in Google Chrome / Microsoft Edge.

## 4. Known Issues
- `Minor Robustness Risk`: In Node.js environments lacking browser APIs (`window`, `FileReader`), `parseExcel` and `parsePDF` require passing a binary Buffer or Uint8Array.
- `Minor Robustness Risk`: In client browsers without `pdfjsLib` or `Tesseract.js` loaded on `window`, `parsePDF` and `parseImageOCR` will reject with library-missing error messages.

## 5. Remaining risk & next step
The modularization of `js/parser/` into 6 distinct files, along with the lightweight facade `js/parser.js`, is functionally complete, robust, and passes 100% of all test suites (including newly executed stress and parsing suites). The task is ready for merge.
