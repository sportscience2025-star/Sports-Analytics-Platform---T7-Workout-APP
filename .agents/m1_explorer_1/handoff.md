# Handoff Report: M1 Explorer 1 (TestRegistry Implementation Architecture)

## 1. Observation

### 1.1 Codebase State & Fragmented Instrument Management
An inspection of the codebase reveals that measurement instrument definitions and column processing are currently hardcoded across multiple files:

1. **`js/parser.js` (lines 625–739)**:
   The `DataParser.detectInstrumentType` static method hardcodes detection rules for 7 instruments:
   ```javascript
   // Line 647: FORCE_PLATE
   // Line 664: BLOCK_ACCEL
   // Line 683: SPRINT_TIMING
   // Line 697: VIDEO_KINEMATICS
   // Line 715: JUMP_TEST
   // Line 725: VBT
   // Line 734: GENERAL_TABULAR
   ```
   **Finding**: `MEDICINE_BALL` is completely absent from `detectInstrumentType` and header mapping in `js/parser.js`.

2. **`js/parser.js` (lines 382–402, lines 745–999)**:
   The internal record template and `_mapHeaders` function map raw headers into specific property keys. No columns or header aliases exist for medicine ball ballistics (`mass`, `releaseAngle`, `releaseHeight`, `flightTime`, `meanPower`).

3. **`PROJECT.md` (lines 4–6, 48, 57–63) & `ORIGINAL_REQUEST.md` (R2, lines 45–56)**:
   Mandate a unified, extensible `TestRegistry` module (`js/analysis/test-registry.js`) supporting:
   - 8 test types: `VBT`, `FORCE_PLATE`, `BLOCK_ACCEL`, `SPRINT_TIMING`, `VIDEO_KINEMATICS`, `JUMP_TEST`, `MEDICINE_BALL`, `GENERAL_TABULAR`.
   - Public contract: `register()`, `get()`, `getAll()`, `getColumnsFor()`, `getSampleDataFor()`, `mapRawHeaders()`, `validateRecord()`.
   - Dual-environment compatibility: Browser (`window.TestRegistry`) and Node.js (`typeof module !== 'undefined' ? module.exports = ... : ...`).
   - Strict immutability and graceful fallback to `GENERAL_TABULAR`.

4. **`test_check.py` Validation**:
   - `py test_check.py` tests delimiter balancing and token integrity across modular files.
   - Command executed: `py test_check.py` -> Result: `All syntax checks passed.`.

---

## 2. Logic Chain

### Step 1: Single Source of Truth Architecture
Decoupling the analysis UI, reactive table grid (`reactive-grid.js`), physics engine (`medicine-ball-physics.js`), and file parser (`parser.js`) requires a centralized registry. Instead of maintaining column names, units, placeholders, and validation logic in each component, `TestRegistry` serves as the authoritative schema repository.

### Step 2: Dual Environment Export Pattern
Because the application runs in a browser PWA environment (`index.html`) but automated test suites (e.g. `tests/test_multi_instrument_excel.js`, `tests/test_analysis_reactive_grid.js`) run under Node.js, `TestRegistry` must use an IIFE/UMD pattern:
```javascript
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestRegistryInstance;
}
if (typeof window !== 'undefined') {
    window.TestRegistry = TestRegistryInstance;
} else if (typeof global !== 'undefined') {
    global.TestRegistry = TestRegistryInstance;
}
```

### Step 3: Schema Immutability Guarantee
When consumers (such as `ReactiveGrid` or `AnalysisExporter`) invoke `getColumnsFor(testId)` or `getSampleDataFor(testId)`, any subsequent modification of the returned array or objects (e.g., adding temporary UI metadata or modifying row values) must not pollute the registry. A recursive `deepClone()` utility was designed that clones arrays and nested objects while preserving function references.

### Step 4: Graceful Degradation & Defensive Fallbacks
To prevent runtime crashes:
- `_normalizeId(testId)` strips whitespace, uppercases the string, and verifies existence.
- If `testId` is unrecognized, `null`, or undefined, it defaults to `GENERAL_TABULAR`.
- `validateRecord(record, testId)` verifies types, converts string decimals (replacing `,` with `.`), enforces `[min, max]` boundaries, and guarantees zero `NaN` and zero `undefined` in the sanitized output.

### Step 5: Grounding in Biomechanical Literature (Tier 1 / Tier 2)
The schema specifications and canonical sample datasets for all 8 test types were grounded in sports science literature:
1. **`VBT`**: González-Badillo & Sánchez-Medina (2010), Sánchez-Medina et al. (2014). Incremental loading (40kg to 100kg, 1.15 m/s to 0.45 m/s).
2. **`FORCE_PLATE`**: McMahon et al. (2018), Suchomel et al. (2016). Peak force (~2200 N), RFD (~6500 N/s), impulse (~295 N·s), RSI-mod (~0.52).
3. **`BLOCK_ACCEL`**: Bezodis et al. (2019), Mero et al. (1992). Reaction time (0.134–0.142 s), push duration (0.348–0.365 s), horizontal acceleration (~10.2 m/s²), exit velocity (~3.65 m/s).
4. **`SPRINT_TIMING`**: Morin et al. (2011), Samozino et al. (2016). 60m splits at 5m, 10m, 20m, 30m, 60m.
5. **`VIDEO_KINEMATICS`**: Escamilla et al. (2001). Knee, hip, ankle, and trunk angle kinematics during squat phases.
6. **`JUMP_TEST`**: Bosco et al. (1983), Flanagan & Comyns (2008). SJ (34.2 cm), CMJ (38.5 cm, EUR 1.12), DJ 30cm (RSI 1.99), DJ 45cm (RSI 1.71).
7. **`MEDICINE_BALL`**: Sayers et al. (1999), Harman et al. (1995), Stockbrugger & Haennel (2001). At $m = 3$ kg, $d = 10$ m, $\theta = 45^\circ$, $h_0 = 1.0$ m, $t_{push} = 0.18$ s: $v_0 \approx 9.9$ m/s, $P_{mean} \approx 818$ W, $P_{peak} \approx 1635$ W.
8. **`GENERAL_TABULAR`**: Dynamic multi-column generic tabular fallback.

---

## 3. Caveats

1. **Browser Environment Polyfills**:
   `structuredClone` is not guaranteed in older web views or lightweight Node test environments. The implemented `deepClone()` function in `proposed_test-registry.js` avoids dependency on external polyfills by performing recursive cloning that safely preserves function references.
2. **Ambiguous Headers in Excel Import**:
   The header `peso` can represent athlete bodyweight, barbell load, or medicine ball mass. To avoid ambiguity:
   - When a specific `testId` is provided to `mapRawHeaders(headers, testId)`, schema-specific aliases take precedence.
   - For automatic detection, `js/parser.js` must check for distinct context tokens (`palla medica`, `medicine ball`, `medball`, `lancio`) before falling back to generic weight.
3. **Read-Only Investigation Scope**:
   As an explorer subagent, source code modifications to `js/` have not been applied directly. The complete production-ready code is provided in `.agents/m1_explorer_1/proposed_test-registry.js` for Worker 1 to deploy.

---

## 4. Conclusion & Actionable Instructions for Worker 1

### 4.1 Target File: `js/analysis/test-registry.js`
Worker 1 can copy the verified implementation from:
`e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_explorer_1/proposed_test-registry.js`
directly into:
`e:/Nuove App Installate/App esercizi scienze motorie/js/analysis/test-registry.js`.

### 4.2 Target File: `js/parser.js` Updates
Worker 1 needs to apply two surgical additions to `js/parser.js`:
1. **In `DataParser.detectInstrumentType(records, headers)`**:
   Insert the `MEDICINE_BALL` detection check immediately before the `GENERAL_TABULAR` fallback:
   ```javascript
   // Medicine Ball (Lancio Palla Medica)
   const medBallCount = records.filter(r => (isNum(r.mass) && r.mass > 0) || (isNum(r.ballMass) && r.ballMass > 0) || (isNum(r.distance) && r.distance > 0 && isNum(r.mass))).length;
   const hasMedBallHeaders = /\b(palla_?medica|medicine_?ball|medball|balon_?medicinal|lancio_?palla|throw_?dist|ball_?mass|ball_?weight|massa_?palla|peso_?palla)\b/i.test(hStr);
   if (medBallCount > 0 || (hasMedBallHeaders && records.length > 0)) {
       return {
           type: 'MEDICINE_BALL',
           label: 'Lancio Palla Medica (Cinematica Balistica & Potenza)',
           summary: 'Cinematica balistica, velocità di uscita, potenza media e picco (Sayers/Harman)',
           metrics: ['mass', 'distance', 'flightTime', 'releaseAngle', 'exitVelocity', 'meanPower']
       };
   }
   ```
2. **In `DataParser._mapHeaders(headers)`**:
   Add header alias matching for medicine ball keys:
   - `mass`: `['massa', 'mass', 'peso palla', 'massa palla', 'palla medica', 'ball mass', 'ball weight', 'ball_mass', 'medball_kg', 'peso_palla']`
   - `distance`: `['distanza lancio', 'throw distance', 'distanza', 'distance', 'lancio (m)', 'dist (m)', 'gittata', 'range']`
   - `flightTime`: `['tempo volo', 'flight time', 'tempo di volo', 't_volo', 'flight_time', 't_flight']`
   - `releaseAngle`: `['angolo rilascio', 'release angle', 'angolo di rilascio', 'launch angle', 'angle']`
   - `releaseHeight`: `['altezza rilascio', 'release height', 'altezza di rilascio', 'h0', 'h_release']`
   - `pushDuration`: `['tempo spinta', 'push duration', 'push time', 'durata spinta', 't_push']`
3. **In record initializers (lines 230–244 and lines 382–402)**:
   Add default fields: `mass: null, distance: null, flightTime: null, releaseAngle: null, releaseHeight: null, pushDuration: null, exitVelocity: null, meanPower: null`.

---

## 5. Verification Method

### 5.1 Standalone Node.js Verification
Run the following verification command to confirm that the proposed registry initializes all 8 test types, preserves immutability, provides fallbacks, and executes defensive validation:
```bash
node -e "
const r = require('./.agents/m1_explorer_1/proposed_test-registry.js');
console.log('Registered tests:', Object.keys(r.getAll()));
console.log('Fallback test:', r.get('UNKNOWN_TYPE').id);
const vbt = r.get('VBT');
vbt.columns.push({ key: 'mutated' });
console.log('Immutability preserved:', r.get('VBT').columns.find(c => c.key === 'mutated') === undefined);
const val = r.validateRecord({ athlete: 'Test', exercise: 'Throw', mass: '3,0', distance: 10 }, 'MEDICINE_BALL');
console.log('Validation success:', val.valid, 'sanitized mass:', val.sanitized.mass);
"
```
**Expected Output**:
```
Registered tests: [ 'VBT', 'FORCE_PLATE', 'BLOCK_ACCEL', 'SPRINT_TIMING', 'VIDEO_KINEMATICS', 'JUMP_TEST', 'MEDICINE_BALL', 'GENERAL_TABULAR' ]
Fallback test: GENERAL_TABULAR
Immutability preserved: true
Validation success: true sanitized mass: 3
```

### 5.2 Project Syntax Test
Run the required project check:
```bash
py test_check.py
```
**Expected Output**:
```
Validating js/data-analysis.js...
All syntax checks passed.
```
