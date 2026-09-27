# Handoff Report: Round 3 Adversarial Review & Fixes (teamwork_preview_reviewer_3)

> [!WARNING] **Skepticism Disclaimer**
> Very high confidence on multi-level resolution, parent catalog variant matching with Italian prepositions/connectors, string phase ID preservation, and defense against NaN/object strings; however real physical mobile touch dispatch and Chromium SW background eviction lifecycle remain hardware/runtime-dependent and verified only in Node.js/headless simulation.

---

## 1. What the prior attempt got wrong

### Issue 1: Failure of Normalized Resolution (Level 3) on Athletic Exercises with Prepositions and Connectors
- **Input:** Exercises with natural Italian connectors or prepositional phrases in programming view, e.g. `'Panca Piana con Bilanciere (Presa Stretta)'`, `'Trazioni alla Sbarra (Presa Supina)'`, `'Military Press con Bilanciere (In Piedi)'`, `'Affondi Camminati con Bilanciere (Focus Glutei)'`.
- **Expected:** Level 3 matches the official parent exercise in catalog (`ch_b01` Panca Piana Bilanciere, `hyp_bk12` Trazioni Presa Supina, `frc_ps02` Military Press, `hyp_lg55` Affondi Camminati con Bilanciere).
- **Actual:** Level 3 failed completely and fell back to Level 4 synthetic exercises (`syn_...`), bypassing official technique cues, setups, and biomechanical catalog errors.
- **Root cause:** `findInCatalogNormalized` strictly tested `cleanLower.startsWith(itemLower)` and `cleanLower.includes(itemLower)` on raw cleaned strings without removing Italian prepositions/articles (`'con'`, `'alla'`, `'allo'`, `'al'`, etc.), without checking catalog item `variants` arrays, and without token overlap scoring.

### Issue 2: Event Listener in `wizard.js` Produced `NaN` for String Phase IDs
- **Input:** User clicking `.btn-ex-detail` in a program having non-numeric or string phase IDs (e.g. `data-phase-id="fase_accumulo"` or `data-phase-id="blocco_realizzazione"`).
- **Expected:** `wizard.js` passes the valid phase ID string to `window.App.resolveExerciseDetail(..., { phaseId })`.
- **Actual:** Line 1139 executed `parseInt(btn.dataset.phaseId, 10)` which produced `NaN`. In `findExerciseInProgram`, `String(NaN)` evaluated to `'NaN'`, causing phase disambiguation to fail completely for all string phase IDs.
- **Root cause:** Unconditional `parseInt` on `btn.dataset.phaseId` instead of checking and passing the raw attribute string.

### Issue 3: Incomplete Sentinel String Rejection in `isSafeValue`
- **Input:** Upstream specs or program note containing string representations of `'NaN'` or `'[object Object]'` (e.g. from template coercions or unparsed objects).
- **Expected:** `isSafeValue` rejects them and triggers fallback values.
- **Actual:** `'NaN'` and `'[object Object]'` evaluated to `true`, allowing these literal strings to leak into `description`, `context`, and specs chips.
- **Root cause:** `isSafeValue` checked `''`, `'undefined'`, `'null'`, `'n/a'`, `'-'`, but lacked predicates for `'nan'` and `'[object object]'`.

### Issue 4: Potential Leak of Dirty Strings in `progEx.note` and `progEx.primaryMuscle`
- **Input:** Program exercise with `note: 'undefined'` or `primaryMuscle: ['Gambe', 'Core']` (array format from some AI generator outputs).
- **Expected:** `note` string sanitized before concatenation; `primaryMuscle` correctly extracted as primary string without array coercion artifacts.
- **Actual:** `note: 'undefined'` produced `"Nota programma: undefined"`, and array `primaryMuscle` bypassed string validations.
- **Root cause:** `progEx.note` was checked only for truthiness (`progEx.note ? ...`) rather than `isSafeValue(progEx.note)`, and `progEx.primaryMuscle` lacked array unwrapping.

---

## 2. What I changed

1. **`js/ui/exercise-detail-resolver.js`**:
   - Added uppercase constants at top of file for scoring and matching (`SCORE_DIRECT_MATCH = 100`, `SCORE_STOPWORD_MATCH = 80`, `SCORE_SUBSTRING_MATCH = 50`, `SCORE_SUBSTRING_STOPWORD_MATCH = 40`, `SCORE_TOKEN_MATCH_BASE = 30`, `SCORE_TOKEN_RATIO_WEIGHT = 40`, `MIN_TOKEN_MATCH_RATIO = 0.6`, `MIN_TOKEN_COMMON_COUNT = 2`).
   - Defined `ITALIAN_STOPWORDS` set for prepositions and connectors (`con`, `al`, `alla`, `allo`, `alle`, `ai`, `agli`, `da`, `di`, `del`, etc.).
   - Updated `isSafeValue(val)` to reject `'nan'` and `'[object object]'` in addition to `'undefined'`, `'null'`, `'n/a'`, `'-'`.
   - Added `cleanStopwords(str)` and `extractSignificantWords(str)` helpers.
   - Completely upgraded `findInCatalogNormalized`:
     - Checks direct match on cleaned name (parentheses stripped).
     - Checks matches against catalog items' `variants` array.
     - Strips Italian stopwords and checks equality against catalog item names and catalog variants.
     - Checks raw full name (with variant included) against catalog variants with stopwords removed.
     - Performs scored prefix/substring matching on both literal and stopword-cleaned strings.
     - Performs multi-word token overlap matching (>= 2 common words, >= 60% of item words).
   - In `findExerciseInProgram`: added guard `!Number.isNaN(preferredPhaseId)` and supported `day.exercises || day.workout || []`.
   - In `buildSyntheticExercise`: sanitized `note`, `finalName`, `finalId` with `isSafeValue`, and handled `Array.isArray(progEx.primaryMuscle)`.
   - In `enrichCatalogMatch`: initialized `enriched.execution` before accessing `execution.context`, sanitized `customName`, `customId`, and `progEx.note` with `isSafeValue`, and guaranteed `enriched.muscles` is always a populated array.

2. **`js/ui/wizard.js`**:
   - Fixed line 1139 to extract `rawPhaseId = btn.dataset.phaseId` and pass string/numeric ID without unconditional `parseInt`, completely eliminating `NaN` generation on string phase IDs.

3. **`sw.js`**:
   - Incremented Service Worker cache version from `t7-workout-v71` to `t7-workout-v72` per PWA cache invalidation rules.

4. **`test_check.py`**:
   - Updated cache name expectation to `t7-workout-v72`.

5. **`tests/test_exercise_detail_resolver.js`**:
   - Synchronized Test 12 click listener mock with `wizard.js`.
   - Added Test 19: Normalized matching with prepositions/connectors finds catalog parents (`Panca Piana con Bilanciere`, `Trazioni alla Sbarra`, `Military Press con Bilanciere`, `Affondi Camminati con Bilanciere`).
   - Added Test 20: Event listener in `wizard.js` disambiguates non-numeric string phase IDs (`blocco_accumulo` vs `blocco_realizzazione`) without `NaN`.
   - Added Test 21: Defense against `'nan'`, `'[object Object]'`, and dirty strings in `progEx.note`.
   - Added Test 22: Safe handling of `progEx.primaryMuscle` passed as an array.

---

## 3. Verification Record

- **Deep Verification (ran actual tests):**
  - `py test_check.py`: Exit 0 (`Validating js/data-analysis.js... All syntax checks passed.`).
  - `node tests/test_exercise_detail_resolver.js`: Exit 0 (27/27 tests passing, up from 23/23).
  - Validated multi-profile program generation (Sportivo Ipertrofia, Clinico LCA, Clinico Anziano Spalla):
    - All 136 exercises across 3 full programs resolve with 0 undefined, 0 N/A, 0 NaN, 0 [object Object].
    - Catalog exercises resolve to official cards; warmup and cardio resolve to enriched synthetic cards.
- **Shallow Verification (manual only):**
  - Inspection of `wizard.js` click handler event delegation.
  - Inspection of `sw.js` `CORE_ASSETS` and `index.html` script loading order.
- **Unverified aspects:**
  - Real browser hardware GPU canvas / active video playback from `getExerciseMedia`.
  - Service worker background lifecycle in Chromium under physical offline network throttling.
  - Manual touch gesture dispatch on physical mobile touchscreens.

---

## 4. Known Issues

- `Minor Robustness Risk`: Arbitrary non-Italian gibberish strings with zero anatomical keywords fall back to 'Condizionamento Globale' and 'A corpo libero' with 2 general biomechanical errors.
- `Shallow Verification`: Service worker offline cache update has not been verified inside an actual Chromium service worker runtime with active HTTP cache eviction.

---

## 5. Remaining risk & next step

The multi-level exercise detail resolver is now resilient against prepositional variations, stops words from breaking catalog matches, supports non-numeric phase IDs without NaN corruption, sanitizes sentinel strings (`nan`, `[object object]`, `undefined`, `n/a`), and ensures every detail button click across all program types opens a complete, informative, and leak-free modal. All 27 automated tests and syntax/delimiter checks pass with Exit 0. The task is complete.
