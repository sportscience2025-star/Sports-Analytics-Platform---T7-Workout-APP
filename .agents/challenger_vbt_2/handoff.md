# Handoff Report

## 1. Observation
- **File Paths and Lines**:
  - `e:\Nuove App Installate\App esercizi scienze motorie\js\parser.js` (lines 41-49):
    ```javascript
    for (let i = 0; i < Math.min(10, rows.length); i++) {
        const row = rows[i];
        const stringCount = row.filter(cell => typeof cell === 'string').length;
        if (stringCount >= 3) {
            headerRowIdx = i;
            headers = row;
            break;
        }
    }
    ```
  - `e:\Nuove App Installate\App esercizi scienze motorie\js\parser.js` (lines 140-151):
    ```javascript
    // Altezza Salto (jumpHeight)
    else if (["altezza salto", "jump height", "altura salto", "altezza", "height", "altura", "volo"].some(term => lower.includes(term)) || lower === 'h') {
        colMap[idx] = 'jumpHeight';
    }
    // Altezza Caduta (dropHeight)
    else if (["altezza caduta", "drop height", "altura caida", "caduta"].some(term => lower.includes(term))) {
        colMap[idx] = 'dropHeight';
    }
    ```
- **Stress-Test Failures**:
  - Running `test_stress_parser.js` outputted:
    ```
    --- Test Case: Sparse Sheet with Undefined Rows ---
    ❌ Expected success but parser failed/rejected: Cannot read properties of null (reading 'filter')
    ```
    and
    ```
    --- Test Case: Drop Height Header Mapping ---
    Mapped record for drop height headers: {
      athlete: 'Mario Rossi',
      exercise: 'Squat',
      ...
      jumpHeight: 30,
      contactTime: null,
      dropHeight: 40
    }
    ❌ Validation failed: Precedence Bug Confirmed: drop height headers mapped to jumpHeight instead of dropHeight! jumpHeight=30, dropHeight=40
    ```
- **Project Verification Test**:
  - Running `test_load_velocity.js` outputted:
    ```
    === Running VBT and Ingestion Verification Script ===
    ...
    PASS
    ```

## 2. Logic Chain
1. **Sparse Sheet Crash**:
   - `rows` returned from `XLSX.utils.sheet_to_json(sheet, { header: 1 })` represents the sheet row-by-row. Sparse or empty rows inside the sheet result in `null` or `undefined` elements inside the `rows` array.
   - During the first 10 rows header scan, the parser fetches `row = rows[i]`. If `row` is `null`/`undefined`, invoking `row.filter(...)` throws a `TypeError: Cannot read properties of null/undefined (reading 'filter')`.
   - This error is caught in the global file reader block and rejects the promise with a `TypeError`, causing the parser to fail completely on sparse sheets.
2. **Drop Height Mapping Precedence Defect**:
   - In `_mapHeaders`, the conditions are evaluated sequentially.
   - The `jumpHeight` condition checks if the header contains any term from `["altezza salto", "jump height", "altura salto", "altezza", "height", "altura", "volo"]`.
   - The `dropHeight` condition checks if the header contains any term from `["altezza caduta", "drop height", "altura caida", "caduta"]`.
   - Because `jumpHeight` is checked first and contains general terms (`"altezza"`, `"height"`, `"altura"`), any drop height header that uses those terms (e.g. `"altezza caduta"`, `"drop height"`, `"altura caida"`) triggers the `jumpHeight` rule first, gets mapped to `jumpHeight`, and the correct `dropHeight` branch is never reached.

## 3. Caveats
- Tests were executed using a programmatically mocked `XLSX` reader to feed structured sheet data arrays since node is not globally on the system path and we had to run using Adobe's local node binary.
- OCR/Tesseract and PDF parsers were not stress-tested because the scope focuses on `DataParser.parseExcel` data ingestion.

## 4. Conclusion
- The excel parser is fragile when digesting sparse files, throwing a `TypeError` and refusing to process valid records further down the sheet.
- Column mapping has a structural precedence defect which misclassifies Drop Height columns as Jump Height, corrupting the results of jump performance metrics (such as RSI/EUR calculation inputs).
- **Recommended Mitigations**:
  - In `js/parser.js` line 43: Add `if (!row) continue;` or `const stringCount = row ? row.filter(cell => typeof cell === 'string').length : 0;`.
  - In `js/parser.js` line 140: Swap the check order so `dropHeight` is checked before `jumpHeight`, or exclude `dropHeight` terms from triggering `jumpHeight`.

## 5. Verification Method
- Execute the stress-test harness:
  `& 'C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe' test_stress_parser.js`
- Verify project test suite completion:
  `& 'C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe' test_load_velocity.js`

---

## Adversarial Review Summary

**Overall risk assessment**: HIGH

### Challenges

#### [High] Challenge 1: Sparse Row Crash
- **Assumption challenged**: Headers appear in the very first rows and all rows in the header search area are populated.
- **Attack scenario**: A sheet has an empty first row or header starts after blank rows.
- **Blast radius**: The parsing process fails completely for that spreadsheet.
- **Mitigation**: Add null checks on the row variable before filtering.

#### [High] Challenge 2: Column Precedence Defect
- **Assumption challenged**: Substring searching in the header mapping does not overlap.
- **Attack scenario**: A user uploads a sheet containing drop jump heights ("altezza caduta", "drop height").
- **Blast radius**: The drop height data is misclassified as jump height, corrupting calculations.
- **Mitigation**: Process specific longer terms first (dropHeight) before general shorter terms (jumpHeight).
