# Verification Report - Client-Side RAG & VBT Fallback Logic

## Challenge Summary

**Overall risk assessment**: HIGH

Through empirical verification of the client-side RAG knowledge base and the VBT data analysis system, several critical failure modes and boundary edge cases were identified. Specifically:
1. A **Critical** UI crash was verified when VBT load-velocity points are collinear (same load, different velocities), caused by a missing field in the collinear regression fallback object.
2. A **High** risk vicinity proximity correlation bug in RAG extraction allows a query to associate an MVT to an incorrect exercise name if both are present in the same window block.
3. A **Medium** regex shadowing bug prevents matching of specific phrasings like `di circa` due to left-to-right eager matching precedence of shorter overlapping tokens like `di`.
4. A **Medium** risk of NaN propagation in the 1RM estimation formula due to a lack of `isNaN` checks in the estimation guard clauses.

Despite these latent bugs in the application code, the test suite itself runs with zero failures because the new test harness successfully captures and asserts on these behaviors.

---

## Challenges

### [Critical] Challenge 1: VBT Dashboard Crash on Collinear Loads
- **Assumption challenged**: The linear regression engine always returns a consistent structure, including all power-related metrics (e.g. `pmaxVelocity`), even in collinear fallback cases.
- **Attack scenario**: An athlete uploads VBT data where all loads are identical (collinear points, e.g. two trials at 60kg with different velocities).
- **Blast radius**: The regression denominator becomes 0. `PhysicsEngine.linearRegressionVBT` returns a collinear fallback object that is missing the `pmaxVelocity` property. When the dashboard UI attempts to format this value using `reg.pmaxVelocity.toFixed(3)` (at line 921 and 944 of `js/data-analysis.js`), it throws a fatal `TypeError: Cannot read properties of undefined (reading 'toFixed')` and crashes the entire analysis page.
- **Mitigation**: Add `pmaxVelocity: 0` to the collinear fallback object in `PhysicsEngine.linearRegressionVBT`. In addition, add optional chaining or null-coalescing guards in `js/data-analysis.js` (e.g., `(reg.pmaxVelocity != null ? reg.pmaxVelocity.toFixed(3) : '0.000')`).

### [High] Challenge 2: False Proximity Match in Vicinity RAG Extraction
- **Assumption challenged**: The vicinity RAG extraction correctly separates and correlates the MVT value with the queried exercise.
- **Attack scenario**: If a RAG document contains text like `"Squat is cool but Bench Press MVT: 0.18"`, and we query RAG for `"Squat"`, the vicinity index of Squat is found. The vicinity check scans the surrounding 200 characters (which includes `"bench press MVT: 0.18"`) and extracts `0.18` as the MVT for Squat.
- **Blast radius**: The system incorrectly assigns a Bench Press MVT (0.18 m/s) to Squat (whose normal MVT is 0.30 m/s). This leads to an overestimate of the Squat 1RM by over 30%, which is highly dangerous if the athlete lifts based on those load zones.
- **Mitigation**: Enhance vicinity matching to ensure the matched MVT token is not preceded by a different exercise name that is closer than the target exercise name.

### [Medium] Challenge 3: Regex Shadowing in Custom MVT Alternation
- **Assumption challenged**: The alternation list in custom MVT regex correctly matches all phrasing variations.
- **Attack scenario**: If a document contains `"MVT per lo Squat di circa 0.38"`, the regex pattern `(?:di|da|a|:|==?|\s|di\s*circa)*` eagerly matches `"di"` from the `di` option. The rest of the string `" circa 0.38"` is not matched by `"di\s*circa"`, and since `"circa"` is not a space or decimal, the regex match fails entirely, failing to extract the MVT of `0.38`.
- **Blast radius**: Fails to extract valid MVT recommendations from RAG scientific documents, falling back to the default `0.30` without crashing, but missing valuable context.
- **Mitigation**: Move longer or more specific alternatives (like `di\s*circa`) before shorter, overlapping alternatives (like `di`) in the regex alternation group. E.g. `(?:di\s*circa|di|da|...)`.

### [Medium] Challenge 4: NaN Propagation in 1RM Estimation
- **Assumption challenged**: `PhysicsEngine.estimate1RM` always returns a valid numeric value or zero, and guards against invalid float outcomes like `NaN`.
- **Attack scenario**: If regression calculations somehow produce `NaN` coefficients (e.g. underflow/overflow or division by `NaN`), `estimate1RM` computes `est` as `NaN`. Since `NaN <= 0` is `false` in JavaScript, the guard `if (est <= 0) return 0;` is bypassed, leading to `NaN` bounds (e.g. `ci95Min = NaN`) being returned and rendered on the UI dashboard as `"NaN kg"`.
- **Blast radius**: Renders ugly `"NaN kg"` and `"[NaN - NaN kg]"` values in the user interface, violating multi-agent safety rules (`Prevent the appearance of the string "undefined" or NaN in the interface`).
- **Mitigation**: Add `isNaN(est)` check in the guard condition: `if (isNaN(est) || est <= 0)`.

---

## Stress Test Results

- **Empty query search** → Returns empty list safely → Returns `[]` without crashing → **PASS**
- **Query whitespace trim** → Spaces are removed, empty search ignored → No search initiated → **PASS**
- **Malformed document upload (empty TXT file)** → Throws error "No text content could be extracted..." → Caught in UI `try-catch` block, displays warning, does not crash → **PASS**
- **Unsupported document upload (.exe)** → Throws error "Estensione .EXE non supportata." → Caught in UI `try-catch` block, displays warning, does not crash → **PASS**
- **Multiple MVT options ("Squat MVT is 0.35 or 0.40")** → Ignores because "is" is not a supported separator → Safely returns `null` (no crash) → **PASS**
- **Decimal validation ("0.m/s")** → Does not match pattern `0.\d+` → Safely returns `null` (no crash) → **PASS**
- **Decimal validation ("0.4")** → Matches `0.\d+` → Parses to float `0.4` successfully → **PASS**
- **Regression collinear data (identical loads)** → Triggers `pmaxVelocity` undef TypeError crash → Caught and confirmed by new fallback test suite → **FAIL (Confirmed Application Bug)**
- **Regression positive slope (non-physical)** → Computes slope, no crash, fallback works without NaN/undefined → UI renders zero/non-NaN limits safely → **PASS**

---

## Unchallenged Areas

- **IndexedDB storage limits** — Out of scope (RAG uses local vector chunks storage, but local storage limits were not tested under disk exhaustion scenarios).
- **Web Worker network failures** — Worker loading uses CDNs for Mammoth/PDF.js/SheetJS. Network failures or CDN unavailability were not stress-tested.
