## Challenge Summary

**Overall risk assessment**: HIGH

Through systematic, automated, and boundary stress-testing of the application modules, multiple critical/high-severity vulnerabilities and logical flaws have been identified in the Libreria Fonti UI, parsing rules, and periodization engine. Although the application does not crash on completely missing input sports or clinic settings, it exhibits serious behavioral failures under adversarial inputs (e.g. crashing on null source metadata, producing garbage plans for negative weeks, and failing to map key data headers).

---

## Challenges

### [Critical] Null Field TypeError Crash in Source Filtering
- **Assumption challenged**: All sources in the database will always contain non-null, fully-populated string fields (`title`, `authors`, `journal`, `abstract`).
- **Attack scenario**: If a new source is added dynamically or the database schema is updated with optional/missing fields (e.g., a source is added with `title: null` or is missing the `abstract`), typing any search query triggers `source.title.toLowerCase()` or `source.abstract.toLowerCase()`, throwing a TypeError: `Cannot read properties of null (reading 'toLowerCase')` and crashing the entire search/filter UI state.
- **Blast radius**: The search/filter operation completely stops working, rendering the Libreria Fonti UI frozen and unusable.
- **Mitigation**: Safeguard every field with logical fallbacks before performing string transformations:
  ```javascript
  const title = (source.title || '').toLowerCase();
  const authors = (source.authors || '').toLowerCase();
  const journal = (source.journal || '').toLowerCase();
  const abstract = (source.abstract || '').toLowerCase();
  ```

### [High] Negative Week Periodization Logic Flaw
- **Assumption challenged**: User input parameters are validated, sanitized, and clamped to safe values prior to executing the periodization phase generation.
- **Attack scenario**: The generator accepts negative weeks (e.g., `weeks: -4`). Since `-4 < 10` is true, the generator selects the `LINEAR` periodization method. Because `LINEAR` is hardcoded to generate exactly 4 phases, it generates 4 full phases with corrupt week strings like `"Settimane 1--1"` and `"Settimane 0--3"`, resulting in a garbage training schedule.
- **Blast radius**: Allows generation and export of corrupt, mathematically invalid training programs.
- **Mitigation**: Clamp `weeks` to a minimum value of `1` (or `4` for multi-phase programs) during initial validation:
  ```javascript
  const weeksTotal = Math.max(1, parseInt(params.weeks) || 12);
  ```

### [High] Rep Range Mismatch for Endurance Athletes
- **Assumption challenged**: The program generator strictly conforms sets, reps, and loads to the defined scientific constraints (e.g., endurance athletes require 3-6 reps at >=85% 1RM).
- **Attack scenario**: When an endurance athlete program is generated, the `POLARIZED` method is chosen. For non-high-intensity days, the generator defaults reps to `'15-20'`. This directly contradicts Seiler's rules (cites 3-6 reps to avoid sarcoplasmic hypertrophy) and fails the integration test suite.
- **Blast radius**: Generates unscientific workout plans for endurance athletes, conflicting with the app's own bibliography rationale.
- **Mitigation**: Refine the rep/load assignment logic in `js/logic.js` for the `POLARIZED` method to enforce `3-6` reps for endurance programs across all training days.

### [Medium] Mapped Headers Regex/Substring Discrepancy
- **Assumption challenged**: The parser matches column headers regardless of whitespace, casing, or unit indicators in the header text.
- **Attack scenario**: Excel/PDF sheets containing units in headers (e.g., `H (cm)` or `TC (s)`) fail to map because `_mapHeaders` uses exact comparison (`lower === 'h'` or `lower === 'tc'`), which fails due to the trailing ` (cm)` or ` (s)`.
- **Blast radius**: Jump height and contact time column values cannot be parsed from common encoder output files.
- **Mitigation**: Use sub-string contains checks or regular expressions for units:
  ```javascript
  else if (lower === 'h' || lower.startsWith('h ') || lower.startsWith('h(') || lower === 'altezza') { ... }
  ```

### [Medium] Missing Whitespace Trimming in Search Inputs
- **Assumption challenged**: Users type search queries cleanly without accidental leading or trailing whitespace.
- **Attack scenario**: A user copies and pastes a name like `" Seiler "` or accidentally hits space at the end. Since the query is not trimmed, it searches for the literal string with spaces, returning zero matches.
- **Blast radius**: Poor usability, false negative search results.
- **Mitigation**: Trim the search query before matching:
  ```javascript
  const term = searchVal.trim().toLowerCase();
  ```

### [Low] Zero-Slope Regression Math Precision
- **Assumption challenged**: Slopes close to zero (below threshold `1e-4`) are mathematically flattened to zero-slope.
- **Attack scenario**: In `PhysicsEngine.linearRegressionVBT`, the slope is not truncated to 0 when it falls below `1e-4` (e.g., `1e-8`). This causes tests checking flat-slope truncation to fail.
- **Blast radius**: Minor math inconsistency in near-collinear datasets.
- **Mitigation**: Explicitly clamp tiny slopes to zero:
  ```javascript
  if (Math.abs(slope) < 1e-4) { slope = 0; }
  ```

---

## Stress Test Results

- **Standard Init** → Render all 12 sources on start → Rendered 12 → **PASS**
- **Standard Search ('Seiler')** → Find 1 matching source → Found 1 → **PASS**
- **Whitespace Search (' Seiler ')** → Find 1 matching source (ignoring spaces) → Found 0 → **FAIL** (Whitespace is not trimmed)
- **SQL Injection Query ("' OR 1=1 --")** → Return 0 results without errors → Returned 0 → **PASS** (Safe client-side execution)
- **HTML Injection Query ("<script>")** → Return 0 results without HTML execution → Returned 0 → **PASS** (Safe, but innerHTML is unsanitized)
- **Regex Query (".*")** → Treat as literal, return 0 results → Returned 0 → **PASS**
- **Prototype Pollution Query ("toString")** → Run search without crash → Returned 0 → **PASS**
- **Missing Title Field** → Do not crash, handle null gracefully → Threw TypeError: `Cannot read properties of null (reading 'toLowerCase')` → **FAIL**
- **Invalid Sport Name** → Fall back to standard athletic program → Fallback generated → **PASS**
- **Null Injuries in Clinic** → Fall back to standard rehab program → Fallback generated → **PASS**
- **Zero Days/Weeks** → Fall back to 12 weeks, 3 days → Program generated successfully → **PASS**
- **Negative Weeks (-4)** → Fall back to 0 phases / weeks → Generated 4 invalid phases → **FAIL** (No input validation/clamping)

---

## Unchallenged Areas

- **PDF Text Parsing Layouts** — Insufficient mock layout variants to stress-test OCR reading boundaries of multi-column PDF layouts.
