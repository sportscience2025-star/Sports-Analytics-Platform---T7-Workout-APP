# Codebase Analysis Report: Warmup, Cooldown, UI Profiles, and Test Architecture

This report details the findings from exploring the codebase of **T7 Workout** concerning the customization of warmup/cooldown generation, UI selections for sports and patient types, the testing suite architecture, and service worker cache configuration.

---

## 1. Warmup and Cooldown Generation Engine (`js/logic.js`)

The functions `_addWarmupByPhase` and `_addCooldownByPhase` in `js/logic.js` handle the dynamic insertion of warmup and cooldown exercises into generated workouts based on the periodization phase and the subject's profile.

### Current Implementation & Signatures
```javascript
_addWarmupByPhase(phaseId, session, focus, isClinical)
_addCooldownByPhase(phaseId, session, isClinical)
```

- **How they are called**:
  In `_generatePhases` (lines 461-462):
  ```javascript
  day.exercises = this._addWarmupByPhase(blueprint.id, day.exercises, day.focus, isClinical);
  day.exercises = this._addCooldownByPhase(blueprint.id, day.exercises, isClinical);
  ```
  Here:
  - `blueprint.id` is the current phase ID (1 to 8).
  - `day.exercises` is the current exercise list (session).
  - `day.focus` is the focus muscle group/modality of the day (used for warmup).
  - `isClinical` is a boolean flag indicating if the patient is clinical, evaluated in `_generatePhases` as:
    ```javascript
    const isClinical = params.patientType === 'Clinico';
    ```

### How They Can Receive Profile Information
Currently, these functions only receive the `isClinical` flag and lack direct access to other parameters (such as `sport`, `level`, or specific pathology/injury lists) contained in the `params` object passed to `generateFullProgram(params)`.

To enable customized warmup and cooldown routines for specific sports (e.g. Calcio, Basket, Sprint) or new patient types, we should pass the entire `params` object (or specific properties of it) from `_generatePhases` down to `_addWarmupByPhase` and `_addCooldownByPhase`.

**Proposed Signature Update:**
```javascript
_addWarmupByPhase(phaseId, session, focus, isClinical, params)
_addCooldownByPhase(phaseId, session, isClinical, params)
```
Inside the functions, we can then extract:
- `params.sportPraticato || params.sport` (e.g. to add sport-specific drills like FIFA 11+ for Calcio, or dynamic jumps for Basket).
- `params.level` (e.g. to scale volume/intensity of activation).
- `params.injuries` (e.g. to add targeted injury prevention exercises, like hamstring eccentric drills for those with muscle tear history).

---

## 2. UI Profile Selection (`index.html` and `js/ui.js`)

In the T7 Workout application, `index.html` serves as a simple shell that imports JS libraries and scripts. The intake form panels, controls, and grids are dynamically generated and managed in `js/ui.js`.

### Current Selections
- **Patient Types (`patientType`)** are defined in `js/ui.js` (lines 160-167) as card selectors:
  - `Atleta` (Atleta / Fitness)
  - `Clinico` (Paziente Clinico)
  - `Anziano` (Senior 60+)
  - `Junior` (Junior < 18 anni)
- **Sports (`sportPraticato`)** are defined in `js/ui.js` (lines 173-181), inside a `#sport-praticato-group` container which is displayed only if `patientType === 'Atleta'`:
  - `Bodybuilding` (Bodybuilding)
  - `Endurance` (Endurance)
  - `Sport di Squadra` (Sport di Squadra)

### Where & How to Insert New Options

We should insert the new options into `js/ui.js` as follows:

#### A. Sports Group (inside `#sport-praticato-group` cards grid)
We can insert radio card options for:
1. **Calcio** (value: `"Calcio"`)
2. **Basket** (value: `"Basketball"` - to align with the name used in `js/knowledge-base.js` rules)
3. **Atletica Sprint** (value: `"Atletica Leggera"` - to align with rules in `js/knowledge-base.js`)

*Location to insert:* `js/ui.js` under line 181:
```javascript
<label class="intake-option-card compact ${saved.sportPraticato==='Calcio'?'selected':''}">
    <input type="radio" name="sportPraticato" value="Calcio" ${saved.sportPraticato==='Calcio'?'checked':''}><strong>Calcio</strong><small>Prevenzione e RSA</small>
</label>
<label class="intake-option-card compact ${saved.sportPraticato==='Basketball'?'selected':''}">
    <input type="radio" name="sportPraticato" value="Basketball" ${saved.sportPraticato==='Basketball'?'checked':''}><strong>Basket</strong><small>Vertical Jump e COD</small>
</label>
<label class="intake-option-card compact ${saved.sportPraticato==='Atletica Leggera'?'selected':''}">
    <input type="radio" name="sportPraticato" value="Atletica Leggera" ${saved.sportPraticato==='Atletica Leggera'?'checked':''}><strong>Atletica Sprint</strong><small>Accelerazione e RFD</small>
</label>
```

#### B. Patient Types Group (inside `Tipo di Soggetto` cards grid)
We can insert option cards for:
1. **Runner Amatoriale/Sedentario** (value: `"Sedentario"` - to align with the scientific sources targeting sedentary subjects/running economy)
2. **Pazienti Clinici/Anziani** (value: `"Clinico_Anziano"` - to represent a combined profile)

*Location to insert:* `js/ui.js` under line 167:
```javascript
<label class="intake-option-card ${saved.patientType==='Sedentario'?'selected':''}">
    <input type="radio" name="patientType" value="Sedentario" ${saved.patientType==='Sedentario'?'checked':''}><span class="option-icon">🏃‍♂️</span><strong>Runner Amatoriale/Sedentario</strong><small>Inizio graduale e cardio base</small>
</label>
<label class="intake-option-card ${saved.patientType==='Clinico_Anziano'?'selected':''}">
    <input type="radio" name="patientType" value="Clinico_Anziano" ${saved.patientType==='Clinico_Anziano'?'checked':''}><span class="option-icon">🩺👵</span><strong>Pazienti Clinici / Anziani</strong><small>Rafforzamento sicuro e mobilità</small>
</label>
```

#### C. Codebase Impact on logic and UI logic
- **Visibility logic**: `toggleSportPraticato` in `js/ui.js` (line 509) displays the sports selection if `patientType === 'Atleta'`. We might want to keep it hidden for clinical/sedentary profiles, or adapt it.
- **Clinical checks**: Throughout `js/logic.js`, the app checks `params.patientType === 'Clinico'` to trigger specific clinical safeguards (e.g. ROM caps, low RPE, specific periodization). These checks must be updated to include the new `"Clinico_Anziano"` type:
  ```javascript
  const isClinical = params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano';
  ```
  Key lines in `js/logic.js` requiring this update are: **71, 140, 229, 849, 871, 944, 1263, 1266, 1269, 1285, 1343, 1419**.
- **Senior checks**: Where senior features (like low impact) are applied, we should check `params.patientType === 'Anziano' || params.patientType === 'Clinico_Anziano'`.

---

## 3. Test Suite Architecture (`tests/`)

The test suite of T7 Workout is built to run tests in both Node-like and full browser contexts.

### How Tests are Run
- **Test Runner (`tests/runner.html`)**: A web page that orchestrates the execution of all tests. It displays a UI list of tests, their status (PASS/FAIL), execution times, and logs.
- **Isolation (`tests/iframe_runner.html`)**: Tests are run in isolation using dynamically generated `<iframe>` elements. This prevents tests from polluting the global window or localStorage state of one another.
- **Node.js Mocking**: `iframe_runner.html` mocks standard Node.js global variables and APIs:
  - `global` points to a proxy wrapping the browser `window`.
  - `require` is mocked to return browser-compatible implementations of Node's `'fs'` (using synchronous XHR requests to fetch local files) and `'path'`.
  - `process.exit(code)` is intercepted to notify the parent runner window of test completion.
- **Headless Execution (`run_tests_headless.py`)**: Spawns a headless Chrome or Edge browser targeting `tests/runner.html`. Tests execute asynchronously, and results are POSTed back to a local python server, which prints summaries and terminates with the appropriate exit code.
- **Interactive Execution (`run_all_js_tests.py`)**: Similar to the headless runner, but opens the test page in the default system browser for visual inspection and manual debugging.

### Test Structure Example (`tests/test_logic.js`)
`tests/test_logic.js` is a lightweight test script (27 lines) that sets up the mock environment (specifically mocking the catalog data `window.App.getExercises` and conditions `window.App.getConditions`) and loads the core logic file `js/logic.js` for execution. More extensive tests, such as `test_periodization_stress.js`, load the complete logic and execute multiple test permutations of `generateFullProgram` to check that the periodization phases are generated correctly under diverse constraints.

### Crucial Finding: Test File Corruption
During the execution of the headless test suite, **4 out of 17 tests failed** with the following error:
`SyntaxError: Invalid or unexpected token` in `iframe_runner.html` at `new Function` line 202.

Further investigation into the test files revealed severe file integrity issues:
1. **`tests/test_periodization_stress.js`**
2. **`tests/test_regression_edge_cases.js`**
3. **`tests/test_adversarial_physics.js`**
4. **`tests/test_chart_verification.js`**

These files are corrupted with filesystem sector dumps or API execution logs (containing strings like `write_to_file* CodeContent* Description* Overwrite* TargetFile* toolAction* toolSummary` and binary GUIDs) prepended or injected directly into the JavaScript files.
- For example, in `test_adversarial_physics.js`, binary corruption and API log headers start at line 23.
- In `test_chart_verification.js`, they start at line 1, pushing the actual JavaScript code to line 39.
Because of this corruption, these test scripts are invalid JavaScript and fail to parse. This is a pre-existing condition not related to our current analysis.

---

## 4. Cache Version (`sw.js`)

In `sw.js`, which handles service worker installation and assets pre-caching:
- **Cache version variable name**: `CACHE_NAME` (defined on line 6).
- **Cache version value**: `'t7-workout-v31'`.

---

## 5. Synthesis & Verification

The existing periodization engine and scientific knowledge base are already prepared with rules for sports like `Calcio` and `Basketball` and patient conditions. The UI options and checks can be seamlessly integrated following the proposed mapping. 

The test suite has been successfully run using the headless test runner to examine the baseline behavior. The 13 uncorrupted tests passed successfully (PASS), while the 4 corrupted tests failed (FAIL) due to the syntax errors caused by pre-existing file corruption.

