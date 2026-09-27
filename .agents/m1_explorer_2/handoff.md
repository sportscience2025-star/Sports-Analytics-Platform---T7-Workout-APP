# Handoff Report: M1 Explorer 2 — Parser Ingestion Integration

## 1. Observation

### 1.1 Codebase Inspection (`js/parser.js`)

1. **`detectInstrumentType` hierarchy (lines 625–739)**:
   The current method classifies incoming sports science datasets by evaluating the following order:
   - Lines 629–635: Pre-calculates `vbtCount` and `hasVbtHeaders`:
     ```javascript
     const vbtCount = records.filter(r => isNum(r.load) && r.load > 0 &&
         ((isNum(r.velocity) && r.velocity > 0) ||
          (isNum(r.peakVelocity) && r.peakVelocity > 0) ||
          (isNum(r.propulsiveVelocity) && r.propulsiveVelocity > 0) ||
          (isNum(r.power) && r.power > 0))).length;
     const hasVbtHeaders = /\b(load|carico|peso|carga|vmean|vm|vmp|mpv|vmax|encoder|vitruve|gymaware|speed4lifts|repone)\b/i.test(hStr);
     ```
   - Lines 637–652: `FORCE_PLATE` detection (priority 1).
   - Lines 654–669: `BLOCK_ACCEL` detection (priority 2).
   - Lines 671–688: `SPRINT_TIMING` detection (priority 3).
   - Lines 690–702: `VIDEO_KINEMATICS` detection (priority 4):
     ```javascript
     const kinCount = records.filter(r => isNum(r.kneeAngle) || isNum(r.hipAngle) || isNum(r.ankleAngle) ||
         isNum(r.trunkAngle) || isNum(r.jointAngle) || isNum(r.angularVelocity) ||
         (isNum(r.frame) && (isNum(r.coordX) || isNum(r.coordY)))).length;
     const hasKinHeaders = /\b(kinovea|dartfish|tracker|angolo|angle|joint|ginocchio|knee|anca|hip|caviglia|ankle|tronco|trunk|marker|deg|°)\b/i.test(hStr);
     if (kinCount > 0 || (hasKinHeaders && records.length > 0 && vbtCount === 0)) {
         return {
             type: 'VIDEO_KINEMATICS',
             label: 'Videoanalisi Cinematica 2D (Kinovea / Dartfish / Tracker)',
             summary: 'Cinematica articolare, traiettorie marker e velocità angolari',
             metrics: ['kneeAngle', 'hipAngle', 'ankleAngle', 'trunkAngle', 'jointAngle', 'angularVelocity']
         };
     }
     ```
   - Lines 704–720: `JUMP_TEST` detection (priority 5):
     ```javascript
     const jumpCount = records.filter(r => (isNum(r.jumpHeight) && r.jumpHeight > 0) ||
         (isNum(r.contactTime) && r.contactTime > 0) ||
         (isNum(r.dropHeight) && r.dropHeight > 0)).length;
     const hasJumpExercise = records.some(r => {
         const ex = (r.exercise || '').toLowerCase();
         return ex === 'cmj' || ex === 'sj' || ex === 'dj' || ex.includes('jump') || ex.includes('salto');
     });
     const hasJumpHeaders = /\b(altezza_?salto|jump_?height|drop_?height|caduta|cmj|sj|dj)\b/i.test(hStr);
     if ((jumpCount > 0 || hasJumpExercise || hasJumpHeaders) && vbtCount === 0) { ... }
     ```
   - Lines 722–730: `VBT` detection (priority 6).
   - Lines 732–738: `GENERAL_TABULAR` fallback (priority 7).

2. **Critical Collision Hazard 1: `volo` substring in Jump Height mapping (line 794)**:
   In `_mapHeaders(headers)`:
   ```javascript
   // 8. Jump height
   else if (["altezza salto", "jump height", "altura salto", "volo", "h(cm)", "h (cm)", "jump_h", "h_salto"].some(t => lower.includes(t)) ||
       lower === 'h' || lower === 'altezza' || lower === 'altura' || lower === 'height' || lower === 'salto') {
       colMap[idx] = 'jumpHeight';
   }
   ```
   Because `"tempo di volo"`.includes(`"volo"`) is strictly `true`, any column header named `Tempo di Volo (s)` will be mis-mapped to `jumpHeight` unless preempted by a dedicated `flightTime` rule placed before line 794.

3. **Critical Collision Hazard 2: `angolo` and `°` regex in `VIDEO_KINEMATICS` (line 694)**:
   If a Medicine Ball file contains `Angolo Rilascio (°)`, `hasKinHeaders` evaluates to `true` (matching `angolo` and `°`). If `VIDEO_KINEMATICS` is evaluated before `MEDICINE_BALL`, the file will be misclassified as `VIDEO_KINEMATICS`.

4. **Critical Collision Hazard 3: `aggregateByLoad` rep grouping (lines 140–149)**:
   ```javascript
   const vbtRecords = records.filter(r => r.load > 0 && r.velocity > 0);
   if (vbtRecords.length === 0) return { aggregated: records, originalN: records.length, wasAggregated: false };
   ```
   If Medicine Ball records use `ballMass` and `throwDistance` (rather than `load` and `velocity`), `vbtRecords.length` is 0. This guarantees that `aggregateByLoad` will NEVER falsely compress repeated throws with the same ball weight (e.g. 3 throws with a 3 kg ball) into a single row.

5. **Current Test Status**:
   - `node tests/test_multi_instrument_excel.js` executed with exit code 0:
     `ALL MULTI-INSTRUMENT EXCEL TESTS PASSED (9/9)`.
   - `py test_check.py` executed with exit code 0:
     `All syntax checks passed.`.

---

## 2. Logic Chain

1. **Premise 1**: Medicine Ball throw testing involves biomechanical variables: ball mass $m$ (kg), throw distance $d$ (m), flight time $t_{flight}$ (s), release angle $\theta$ (°), release height $h_0$ (m), push duration $t_{push}$ (s), exit velocity $v_0$ (m/s), and propulsive power $P$ (W).
2. **Premise 2**: In `js/parser.js`, raw headers from CSV or Excel are mapped in `_mapHeaders(headers)`. Because line 794 matches any substring containing `"volo"` to `jumpHeight`, Medicine Ball flight time (`"tempo di volo"`, `"flight time"`, `"t_volo"`) must be matched BEFORE line 794 to avoid corrupting the record's jump height field.
3. **Premise 3**: Similarly, Medicine Ball release height (`"altezza rilascio"`, `"release height"`) must be matched before generic height/jump height (lines 789–796), and release angle (`"angolo rilascio"`, `"release angle"`) must be matched before generic joint angle (line 905).
4. **Premise 4**: In `detectInstrumentType(records, headers, extraContext)`:
   - Force Plate (priority 1), Block Accel (priority 2), and Sprint Timing (priority 3) have unambiguous kinetic/timing metrics (`forceZ`, `rfd`, `horizontalAccel`, `reactionTime`, `splitDistance`, `split_5m`).
   - If `MEDICINE_BALL` is inserted at priority 5 (immediately after `SPRINT_TIMING` and before `VIDEO_KINEMATICS`), any Medicine Ball file with release angle or flight time is correctly classified as `MEDICINE_BALL` and will not trigger `VIDEO_KINEMATICS` (via `angolo`/`°`) or `JUMP_TEST` (via `volo`).
   - Because `vbtCount === 0` is required for `MEDICINE_BALL`, real VBT files (`load > 0 && velocity > 0`) are guaranteed to bypass Medicine Ball and proceed to `VBT`.
5. **Premise 5**: Requirement R2 mandates supporting both full inputs and minimal inputs where only `Peso (kg)` and `Distanza (m)` are provided. If a file has `r.load > 0` and `r.distance > 0` with `vbtCount === 0`, post-detection normalization ensures `r.ballMass = r.ballMass || r.load` and `r.throwDistance = r.throwDistance || r.distance`.
6. **Premise 6**: When `window.MedicineBallPhysics` is available in the runtime, the parser can directly enrich the records with calculated biomechanical metrics (`exitVelocity`, `meanPower`, `peakPower`), while safely degrading to raw inputs when physics engine modules are not yet evaluated.

---

## 3. Caveats

- **Headless Unit Tests**: In isolated Node.js test runners where `window.MedicineBallPhysics` is not yet required, the parser must guard calculations with `typeof window !== 'undefined' && window.MedicineBallPhysics && typeof window.MedicineBallPhysics.calculate === 'function'`. The reactive grid live-binding will recalculate these values upon rendering.
- **Ambiguous Minimal Inputs**: If a file contains exclusively `Peso (kg)` and `Distanza (m)` with no exercise column, no sheet name, and no velocity, it is classified as `MEDICINE_BALL`. This matches sports science domain conventions (VBT uses load + velocity/ROM, Sprint uses distance + time, Jumps use height + time).
- No other caveats.

---

## 4. Conclusion & Actionable Implementation Plan

### 4.1 Changes to `js/parser.js`

#### A. Record Template in `parseExcelOrCSV` (around line 382–402)
Add dedicated Medicine Ball keys:
```javascript
// Medicine Ball Throws
ballMass: null, throwDistance: null, flightTime: null, releaseAngle: null, releaseHeight: null,
```

#### B. `hasValidData` in `parseExcelOrCSV` (around line 489)
Add valid data conditions:
```javascript
(record.ballMass !== null && record.ballMass > 0) ||
(record.throwDistance !== null && record.throwDistance > 0) ||
(record.flightTime !== null && record.flightTime > 0) ||
```

#### C. `extraContext` and Post-Detection Normalization in `parseExcelOrCSV` (around line 552)
Replace:
```javascript
const detected = DataParser.detectInstrumentType(finalRecords, firstSheetHeaders);
```
With:
```javascript
const extraContext = {
    sheetNames: Object.keys(workbookSheets || {}),
    filename: (file && file.name) ? file.name : ''
};
const detected = DataParser.detectInstrumentType(finalRecords, firstSheetHeaders, extraContext);

if (detected.type === 'MEDICINE_BALL') {
    finalRecords.forEach(r => {
        if ((r.ballMass === null || r.ballMass === undefined) && typeof r.load === 'number' && r.load > 0) {
            r.ballMass = r.load;
        }
        if ((r.throwDistance === null || r.throwDistance === undefined) && typeof r.distance === 'number' && r.distance > 0) {
            r.throwDistance = r.distance;
        }
        if ((r.flightTime === null || r.flightTime === undefined) && typeof r.time === 'number' && r.time > 0 && r.time < 10) {
            r.flightTime = r.time;
        }
        if (typeof window !== 'undefined' && window.MedicineBallPhysics && typeof window.MedicineBallPhysics.calculate === 'function') {
            if (typeof r.ballMass === 'number' && r.ballMass > 0 && typeof r.throwDistance === 'number' && r.throwDistance > 0) {
                const physics = window.MedicineBallPhysics.calculate({
                    mass: r.ballMass,
                    distance: r.throwDistance,
                    flightTime: r.flightTime || undefined,
                    releaseAngle: r.releaseAngle || undefined,
                    releaseHeight: r.releaseHeight || undefined,
                    pushDuration: r.pushDuration || undefined
                });
                if (physics && physics.valid) {
                    if (r.exitVelocity === null || r.exitVelocity === undefined) r.exitVelocity = physics.exitVelocity;
                    if (r.power === null || r.power === undefined) r.power = physics.meanPower;
                    r.meanPower = physics.meanPower;
                    r.peakPower = physics.peakPower;
                }
            }
        }
    });
}
```

#### D. `detectInstrumentType` (lines 625–739)
Update signature:
```javascript
static detectInstrumentType(records, headers, extraContext = {}) {
```
Insert at Priority 5 (immediately following `SPRINT_TIMING`, before `VIDEO_KINEMATICS`):
```javascript
            // 5. Medicine Ball (Lancio Palla Medica - Cinematica Balistica & Potenza)
            const medBallCount = records.filter(r =>
                (isNum(r.ballMass) && r.ballMass > 0) ||
                (isNum(r.throwDistance) && r.throwDistance > 0) ||
                ((isNum(r.flightTime) && r.flightTime > 0) && (isNum(r.throwDistance) || isNum(r.ballMass) || /\b(palla|ball|lancio|throw)\b/i.test(hStr))) ||
                (isNum(r.releaseAngle) && r.releaseAngle > 0) ||
                (isNum(r.releaseHeight) && r.releaseHeight > 0) ||
                ((isNum(r.load) && r.load > 0) && (isNum(r.distance) && r.distance > 0))
            ).length;

            const hasMedBallHeaders = /\b(palla_?medica|medicine_?ball|medball|peso_?palla|ball_?mass|ball_?weight|massa_?palla|distanza_?lancio|throw_?dist(ance)?|distanza_?palla|angolo_?rilascio|release_?angle|angolo_?lancio|altezza_?rilascio|release_?height)\b/i.test(hStr) ||
                (/\b(lancio|throw)\b/i.test(hStr) && /\b(tempo_?volo|flight_?time)\b/i.test(hStr));

            const hasMedBallExercise = records.some(r => {
                const ex = (r.exercise || '').toLowerCase();
                return /palla_?medica|medicine_?ball|medball|lancio|throw/i.test(ex);
            });

            const hasMedBallContext = Boolean(
                (extraContext && extraContext.sheetNames && extraContext.sheetNames.some(s => /palla_?medica|medicine_?ball|medball|lancio/i.test(s))) ||
                (extraContext && extraContext.filename && /palla_?medica|medicine_?ball|medball|lancio/i.test(extraContext.filename))
            );

            if ((medBallCount > 0 || hasMedBallHeaders || hasMedBallExercise || hasMedBallContext) && vbtCount === 0) {
                return {
                    type: 'MEDICINE_BALL',
                    label: 'Lancio Palla Medica (Cinematica & Potenza Balistica)',
                    summary: 'Cinematica balistica, velocità di uscita, tempo di volo e potenza propulsiva stimata',
                    metrics: ['ballMass', 'throwDistance', 'flightTime', 'releaseAngle', 'releaseHeight', 'exitVelocity', 'meanPower', 'peakPower']
                };
            }
```

#### E. `_mapHeaders(headers)` (around line 789)
Insert BEFORE line 794 (Jump height):
```javascript
                // Medicine Ball - Release Height (MUST precede generic Jump Height)
                else if (["altezza rilascio", "release height", "altezza di rilascio", "launch height", "h_rilascio", "h0", "h_release"].some(t => lower.includes(t))) {
                    colMap[idx] = 'releaseHeight';
                }
                // Medicine Ball - Flight Time (MUST precede Jump Height which checks 'volo')
                else if (["tempo di volo", "tempo volo", "flight time", "flight_time", "t_volo", "t volo", "tof", "time of flight"].some(t => lower.includes(t))) {
                    colMap[idx] = 'flightTime';
                }
                // Medicine Ball - Release Angle (MUST precede Video Kinematics 'angolo')
                else if (["angolo rilascio", "release angle", "launch angle", "angolo di rilascio", "angolo lancio", "angolo di lancio", "angolo_rilascio", "release_angle"].some(t => lower.includes(t))) {
                    colMap[idx] = 'releaseAngle';
                }
                // Medicine Ball - Ball Mass (MUST precede VBT 'load/peso')
                else if (["peso palla", "ball mass", "ball_mass", "ball weight", "peso_palla", "massa palla", "massa_palla", "medball mass", "medball weight", "palla medica", "peso attrezzo", "massa attrezzo"].some(t => lower.includes(t))) {
                    colMap[idx] = 'ballMass';
                }
                // Medicine Ball - Throw Distance (MUST precede generic 'distance')
                else if (["distanza lancio", "throw distance", "throw_distance", "distanza_lancio", "lunghezza lancio", "lancio (m)", "gittata", "gettata", "mb distance", "ball distance", "distanza palla"].some(t => lower.includes(t))) {
                    colMap[idx] = 'throwDistance';
                }
                // Medicine Ball / Physics - Estimated Velocity & Power
                else if (["velocita stimata", "velocità stimata", "estimated velocity", "velocita lancio", "velocità lancio", "v0 (m/s)", "v0"].some(t => lower.includes(t))) {
                    colMap[idx] = 'exitVelocity';
                }
                else if (["potenza stimata", "potenza stimata (w)", "potenza media palla", "sayers power", "harman power", "estimated power"].some(t => lower.includes(t))) {
                    colMap[idx] = 'power';
                }
```

### 4.2 Additions to `tests/test_multi_instrument_excel.js`
Add Tests 10 & 11 to verify Medicine Ball detection and minimal input normalization:
```javascript
    // Test 10: Medicine Ball Full Ingestion
    console.log("\n10. Testing Medicine Ball (Palla Medica) Full File Parsing...");
    const medballCSV = `Atleta, Esercizio, Peso Palla (kg), Distanza Lancio (m), Tempo di Volo (s), Angolo Rilascio (°)
Paolo Belli, Lancio Petto, 3.0, 10.2, 1.18, 44
Paolo Belli, Lancio Petto, 4.0, 8.5, 1.05, 43
Paolo Belli, Lancio Petto, 5.0, 7.2, 0.95, 42`;

    const mbRes = await DataParser.parseExcel(Buffer.from(medballCSV));
    assert(mbRes.instrumentType === 'MEDICINE_BALL', `Expected MEDICINE_BALL, got ${mbRes.instrumentType}`);
    assert(mbRes.rawData.length === 3, `Expected 3 records, got ${mbRes.rawData.length}`);
    assert(mbRes.rawData[0].ballMass === 3.0, `Expected ballMass 3.0, got ${mbRes.rawData[0].ballMass}`);
    assert(mbRes.rawData[0].throwDistance === 10.2, `Expected throwDistance 10.2, got ${mbRes.rawData[0].throwDistance}`);
    assert(mbRes.rawData[0].flightTime === 1.18, `Expected flightTime 1.18, got ${mbRes.rawData[0].flightTime}`);
    assert(mbRes.rawData[0].releaseAngle === 44, `Expected releaseAngle 44, got ${mbRes.rawData[0].releaseAngle}`);
    console.log(`   ✅ Medicine Ball auto-detected: ${mbRes.instrumentLabel}`);
    passed++;

    // Test 11: Medicine Ball Minimal Inputs (Carico + Distanza fallback)
    console.log("\n11. Testing Medicine Ball Minimal Fallback Parsing (Carico + Distanza)...");
    const mbMinimalCSV = `Atleta, Esercizio, Peso, Distanza
Sofia Neri, Overhead Throw, 3, 10
Sofia Neri, Overhead Throw, 3, 10.4
Sofia Neri, Overhead Throw, 3, 9.8`;

    const mbMinRes = await DataParser.parseExcel(Buffer.from(mbMinimalCSV));
    assert(mbMinRes.instrumentType === 'MEDICINE_BALL', `Expected MEDICINE_BALL, got ${mbMinRes.instrumentType}`);
    assert(mbMinRes.rawData.length === 3, `Expected 3 records (no VBT aggregation loss), got ${mbMinRes.rawData.length}`);
    assert(mbMinRes.rawData[0].ballMass === 3, `Expected ballMass 3, got ${mbMinRes.rawData[0].ballMass}`);
    assert(mbMinRes.rawData[0].throwDistance === 10, `Expected throwDistance 10, got ${mbMinRes.rawData[0].throwDistance}`);
    console.log("   ✅ Medicine Ball minimal inputs auto-detected and normalized!");
    passed++;
```

---

## 5. Verification Method

1. **Syntax and Token Check**:
   Command: `py test_check.py`
   Expected result: `All syntax checks passed.` with exit code 0.

2. **Multi-Instrument Parser Test Suite**:
   Command: `node tests/test_multi_instrument_excel.js`
   Expected result: All 9 existing tests pass (100% regression free) + Tests 10 & 11 pass (`11/11 PASSED`).

3. **Core Parser Test Suite**:
   Command: `node tests/test_parsing.js` and `node tests/test_stress_parser.js`
   Expected result: Exit code 0 with zero uncaught exceptions.

4. **Invalidation Conditions**:
   - If any VBT test in `tests/test_multi_instrument_excel.js` detects `MEDICINE_BALL` instead of `VBT`.
   - If `Tempo di Volo (s)` maps to `jumpHeight`.
   - If `Angolo Rilascio (°)` triggers `VIDEO_KINEMATICS`.
   - If `aggregateByLoad` merges multiple throws of identical ball mass into a single row.
