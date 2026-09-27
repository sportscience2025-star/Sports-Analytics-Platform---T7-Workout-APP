# Adversarial Challenge & Handoff Report — VBT Physics & Excel Parser

## 1. Observation

We performed manual code review and automated stress testing of the physics and ingestion modules.

### Path & Line Locations
- **`js/physics-engine.js`**:
  - `linearRegressionVBT(data)`: Lines 16–86
  - `predictLoad(velocity)`: Line 84: `predictLoad: (velocity) => (velocity - intercept) / slope`
  - `estimate1RM(regression, mvt)`: Lines 92–95
  - `calculateRSI(jumpHeight, contactTime)`: Lines 167–179
- **`js/parser.js`**:
  - `parseExcel(file)` row filtering: Line 96: `if (record.load > 0 || record.distance > 0 || record.jumpHeight > 0 || record.contactTime > 0)`
  - `parseExcel(file)` header detection: Lines 41–50
  - `_mapHeaders(headers)`: Lines 131–182
  - `_parseTextData(text)` metric extraction: Lines 333–352

### Empirical Test Commands & Outputs
We ran the standard verification suite and our adversarial suite:
1. `C:\Users\ptomm\AppData\Local\ms-playwright-go\1.57.0\node.exe test_load_velocity.js` (Completed successfully)
2. `C:\Users\ptomm\AppData\Local\ms-playwright-go\1.57.0\node.exe test_stress_math_and_parser.js`

Verbatim Output of the Stress-Test Command:
```
=== ADVERSARIAL STRESS TESTING FOR PHYSICS & PARSER ===

--- Section 1: linearRegressionVBT / estimate1RM Collinearity & Division by Zero ---
Near-collinear slope: 2.991758887410948e-17
Near-collinear f0: -26740122787512360
Near-collinear pmax: -52464120909099330
Near-collinear estimate1RM(0.3): 0
Positive slope: 0.01
Positive intercept: 0
Positive f0: -0
Positive estimate1RM(0.3): 30
Zero slope slope: 0
Zero slope predictLoad(0.3): -Infinity
Zero slope predictLoad(0.8): NaN
NaN input regression: {
  slope: NaN,
  intercept: NaN,
  rSquared: NaN,
  v0: NaN,
  f0: NaN,
  f0_N: NaN,
  pmax: NaN,
  predictVelocity: [Function: predictVelocity],
  predictLoad: [Function: predictLoad]
}

--- Section 2: RSI Unit Conversion Discontinuity ---
RSI at 2.0m/cm: 10
RSI at 2.01m/cm: 0.10049999999999998
RSI at 1.99m/cm: 9.95
RSI discontinuity ratio: 99.50248756218907

--- Section 3: VBT Progression Table Robustness ---
Progression with NaN 1RM (first week): {
  week: 1,
  percentage: '70%',
  load: NaN,
  velocity: 'NaN',
  force: NaN,
  power: NaN
}
Progression with null regression (first week): {
  week: 1,
  percentage: '70%',
  load: 105,
  velocity: '0.10',
  force: 1030,
  power: 0
}
Progression with NaN regression (first week): {
  week: 1,
  percentage: '70%',
  load: 105,
  velocity: 'NaN',
  force: 1030,
  power: NaN
}

--- Section 4: Excel Parser Filter Robustness ---

--- Section 5: OCR/PDF Running Data Parsing Capability ---
OCR/PDF text parsing result for running data: {"rawData":[],"athletes":[],"exercises":[]}
[Drop Height Only] REJECTED: Nessun dato utile trovato nel file Excel.
[Pace and Time Only] REJECTED: Nessun dato utile trovato nel file Excel.
[Running Two Columns Header Check] REJECTED: Nessun dato utile trovato nel file Excel.
[VBT with 0 Load] REJECTED: Nessun dato utile trovato nel file Excel.
```

---

## 2. Logic Chain

1. **Floating Point Near-Division-by-Zero**: 
   In `linearRegressionVBT`, for a nearly horizontal collinear dataset (velocities almost identical across loads), the slope evaluates to a tiny non-zero number (e.g. `2.99e-17`) instead of `0`. 
   Consequently, `f0 = -intercept / slope` and `pmax` yield massive non-physical values (upwards of $10^{16}$). If the slope is slightly negative, `estimate1RM` evaluates to a massive value, causing the UI to display garbage numbers and breaking Chart.js scaling.
2. **True Zero-Slope Unprotected Division**:
   If the slope is exactly `0`, `predictLoad` performs a direct division by zero: `(velocity - intercept) / slope`, producing `-Infinity` or `NaN`. 
3. **Biomechanical Violation (Positive Slope)**:
   A positive slope (velocity increasing with load) is physically impossible for concentric maximum-effort lifts. 
   When `slope > 0`, `estimate1RM(regression, 0.3)` uses the positive slope regression and predicts a 1RM that is *lower* than the loads the athlete actually lifted (e.g., predicting `30` kg when they already lifted `100` kg at 1.0 m/s), which is mathematically and physically incorrect.
4. **Discontinuity in RSI Unit Heuristic**:
   In `calculateRSI`, jump height is auto-converted from centimeters to meters if `jumpHeight > 2.0`. 
   For a jump of `2.0` (treated as meters), the RSI is `10.0`. For a jump of `2.01` (treated as centimeters), the RSI is `0.10`. This produces a massive 99.5x discontinuity around the `2.0` mark.
5. **Incomplete Parser Filtering**:
   In `parseExcel`, rows are only added to the dataset if `record.load > 0 || record.distance > 0 || record.jumpHeight > 0 || record.contactTime > 0`.
   - Rows containing *only* drop height (`dropHeight`) are discarded, causing drop-only datasets to reject during Excel ingestion.
   - Rows containing *only* running time (`time`) or running pace (`pace`) are discarded.
   - VBT rows containing velocity but a missing or `0` load are discarded.
6. **Restrictive Header Ingestion**:
   `parseExcel` looks for at least 3 string cells to identify headers. A spreadsheet containing a 2-column format (e.g. `["Distanza", "Tempo"]`) will fail to match the header rule, skipping the sheet entirely.
7. **Pace Mapping Omission**:
   `_mapHeaders` lacks any keyword checks for running pace (e.g., "pace", "ritmo", "min/km"), ensuring `pace` always remains `null`.
8. **OCR/PDF Running Data Limitation**:
   `_parseTextData` does not extract `distance`, `time`, or `pace`, rendering OCR/PDF ingestion completely blind to running activities.

---

## 3. Caveats

- We assumed that typical VBT datasets will have at least 2 points (as checked by the UI). However, we did not investigate multi-sheet Excel files containing non-tabular content.
- We did not mock OCR image parsing via Tesseract directly, but simulated it through `_parseTextData` which contains the text extraction logic for OCR.

---

## 4. Conclusion & Adversarial Challenge Report

### Challenge Summary
- **Overall Risk Assessment**: **HIGH**
- **Critical Flaws**: Division-by-zero errors causing `-Infinity` in predictLoad, extreme float collinearity breaking profile variables ($F_0$, $P_{\text{max}}$, 1RM), unit conversion discontinuities in RSI, and incomplete parser ingestion logic filtering out valid jump (`dropHeight`) and running (`time`, `pace`) data rows.

---

### Challenges

#### [High] Challenge 1: Float Near-Division-by-Zero under Collinearity
- **Assumption challenged**: That denominator guards against division-by-zero for collinear points.
- **Attack scenario**: A dataset with identical velocities across different loads (horizontal collinearity) with minor floating-point variations.
- **Blast radius**: `f0` and `pmax` calculate to astronomical numbers (e.g. $10^{16}$ kg / Watts). Chart.js scales the x-axis to infinity, squashing the scatter points to a single pixel and displaying non-physical values on the dashboard.
- **Mitigation**: Add a minimum threshold for the slope. If `Math.abs(slope) < 1e-4`, treat the slope as `0` (or raise an error indicating a flat velocity profile).

#### [High] Challenge 2: Incomplete Row Ingestion Filter in `parseExcel`
- **Assumption challenged**: The filter `record.load > 0 || record.distance > 0 || record.jumpHeight > 0 || record.contactTime > 0` catches all valid rows.
- **Attack scenario**: Ingesting a spreadsheet containing Drop Jump (DJ) tests where only drop height and jump height are recorded, or running logs with only time/pace.
- **Blast radius**: The parser discards these valid rows. If all rows in the file are drop-jump or running logs without distance/load, the spreadsheet is rejected entirely.
- **Mitigation**: Add `record.dropHeight > 0`, `record.time > 0`, and `record.velocity > 0` to the filter condition in `js/parser.js` line 96.

#### [Medium] Challenge 3: RSI Conversion Discontinuity at 2.0
- **Assumption challenged**: That auto-detecting cm vs. meters at a threshold of `2.0` is robust.
- **Attack scenario**: A low jump test height of 1.8 cm or 2.0 cm is processed.
- **Blast radius**: The function treats `2.0` as meters, yielding an RSI of 10.0, while `2.01` is treated as cm (0.0201m), yielding an RSI of 0.10.
- **Mitigation**: Change the threshold to a smaller boundary (e.g. `1.5` since human jump heights in meters never exceed 1.5m, but centimeter jumps can easily be under 2.0cm), or explicitly query/parse the unit from the column headers if available.

#### [Medium] Challenge 4: Positive Slope Validation Failure
- **Assumption challenged**: That linear regression always produces a negative slope.
- **Attack scenario**: User enters datasets where velocity increases as load increases.
- **Blast radius**: The 1RM calculation succeeds but estimates a value smaller than the actual loads lifted (e.g. 1RM of 30 kg when 100 kg was lifted).
- **Mitigation**: In `estimate1RM`, guard against positive slope: `if (regression.slope >= 0) return 0;`.

#### [Low] Challenge 5: Running Header Identification Restrictiveness
- **Assumption challenged**: Headers always contain at least 3 string cells.
- **Attack scenario**: Simple running logs with columns `["Distanza", "Tempo"]`.
- **Blast radius**: The parser ignores the header row, skipping the sheet entirely.
- **Mitigation**: Reduce the minimum string cell count for header detection to `2` instead of `3`.

---

### Stress Test Results

| Scenario | Expected Behavior | Actual Behavior | Pass/Fail |
|---|---|---|---|
| Near-collinear horizontal dataset | Flat profile error or zeroed regression | Massive values ($10^{16}$ kg/W) | **FAIL** |
| Exact zero slope regression | Safe fallback for `predictLoad` | Returns `-Infinity` / `NaN` | **FAIL** |
| Positive slope VBT dataset | Refuse to calculate 1RM / return 0 | Returns physically invalid 1RM | **FAIL** |
| RSI height conversion at 2.0 | Continuous scaling / warning | 99.5x discontinuity step | **FAIL** |
| Drop-jump sheet with only `dropHeight` | Successfully parse records | Rejects: "Nessun dato utile trovato" | **FAIL** |
| Running sheet with only `time` / `pace` | Successfully parse records | Rejects: "Nessun dato utile trovato" | **FAIL** |
| Running sheet with 2 columns | Successfully parse headers | Ignores headers & skips sheet | **FAIL** |
| PDF/OCR text running data | Successfully parse running records | Returns empty rawData | **FAIL** |

---

### Unchallenged Areas
- Image processing (OCR) engines themselves: We did not test Tesseract's image preprocessing behavior since it is library-dependent and not part of the custom JS parsing code.

---

## 5. Verification Method

To independently verify these findings, run the custom stress-testing harness with Node:
```powershell
C:\Users\ptomm\AppData\Local\ms-playwright-go\1.57.0\node.exe test_stress_math_and_parser.js
```
- Inspect output logs under `--- Section 1 ---` to verify float division errors.
- Inspect output logs under `--- Section 2 ---` to verify the 99.5x RSI discontinuity.
- Inspect output logs under `--- Section 4 & 5 ---` to verify parser rejections and OCR running data omissions.
- Invalidation conditions: The test output will print `SUCCESS` or display correct physical values if the underlying implementation is fixed.
