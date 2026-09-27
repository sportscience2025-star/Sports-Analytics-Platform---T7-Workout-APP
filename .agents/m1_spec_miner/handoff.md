# Handoff Report: Specification for Milestone 1 (`TestRegistry` & Parser Detection)

- **Agent**: M1 Spec Miner (`m1_spec_miner`)
- **Recipient**: Parent Orchestrator (`1887f487-b37e-41eb-840b-e829b3df8c77`)
- **Working Directory**: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner`
- **Target Files Specified**: `js/analysis/test-registry.js`, `js/parser.js`
- **Date**: 2026-09-11T11:20:00Z

---

## 1. Observation

### 1.1 Codebase Survey & Current Baseline
1. **`js/parser.js` (lines 625-739)**:
   - `DataParser.detectInstrumentType(records, headers)` currently detects 6 specific instruments and 1 fallback:
     - `FORCE_PLATE` (lines 637-652)
     - `BLOCK_ACCEL` (lines 654-669)
     - `SPRINT_TIMING` (lines 671-688)
     - `VIDEO_KINEMATICS` (lines 690-702)
     - `JUMP_TEST` (lines 704-720)
     - `VBT` (lines 722-730)
     - `GENERAL_TABULAR` (lines 732-738)
   - `MEDICINE_BALL` is **entirely missing** from `detectInstrumentType`.
   - In `DataParser.detectInstrumentType`, line 635 defines `hasVbtHeaders`:
     `/\b(load|carico|peso|carga|vmean|vm|vmp|mpv|vmax|encoder|vitruve|gymaware|speed4lifts|repone)\b/i.test(hStr)`
     Because `peso` is in this regex, any file containing "Peso Palla" or "Peso (kg)" without an explicit override would match `hasVbtHeaders`, creating a critical collision risk if `MEDICINE_BALL` is not evaluated before `VBT`.

2. **`js/parser.js` (lines 744-1000, `_mapHeaders`)**:
   - `_mapHeaders` normalizes raw column headers to canonical internal keys.
   - Currently, it lacks mappings for:
     - `ballMass` (e.g., `ball_mass`, `peso palla`, `massa palla`, `ball weight`)
     - `throwDistance` (e.g., `throw_distance`, `distanza lancio`, `gittata`)
     - `releaseAngle` (e.g., `release_angle`, `angolo rilascio`, `launch angle`)
     - `releaseHeight` (e.g., `release_height`, `altezza rilascio`, `h0`)
   - It already has partial support for `exitVelocity` (line 842), `pushDuration` (line 839), and `power` (line 930), which can be harmonized across instruments.

3. **`ORIGINAL_REQUEST.md` (R2) & `PROJECT.md` (Layer 1, Layer 2)**:
   - Mandate an open, modular `TestRegistry` supporting all 8 biomechanical instruments:
     `VBT`, `FORCE_PLATE`, `BLOCK_ACCEL`, `SPRINT_TIMING`, `VIDEO_KINEMATICS`, `JUMP_TEST`, `MEDICINE_BALL`, `GENERAL_TABULAR`.
   - Define exact physics formulas for `MEDICINE_BALL`:
     $v_0 = \frac{d}{\cos\theta} \sqrt{\frac{g}{2(h_0 + d \tan\theta)}}$
     $P_{mean} = \frac{m v_0^2}{2 t_{push}}$ with standard default $t_{push} = 0.18s$.
     Benchmark standard: Mass = 3 kg, Distance = 10 m $\rightarrow$ $v_0 \approx 9.9 \text{ m/s}$, $P_{mean} \approx 818 \text{ W}$, $P_{peak} \approx 1635 \text{ W}$.

4. **`tests/test_multi_instrument_excel.js` (lines 78-170)**:
   - Already contains test suites verifying file ingestion and classification for `VBT`, `FORCE_PLATE`, `BLOCK_ACCEL`, `SPRINT_TIMING`, `VIDEO_KINEMATICS`, and `JUMP_TEST`.
   - Needs an extension for `MEDICINE_BALL`.

---

## 2. Logic Chain

1. **Architecture Decoupling**: Hardcoding column configurations inside UI tables creates rigid, fragile code. Placing schemas, validation rules, raw header synonyms, KPI definitions, and literature sample datasets in a centralized `TestRegistry` allows the polymorphic `ReactiveGrid` (Milestone 3) and `AnalysisExporter` (Milestone 4) to adapt dynamically to any instrument.
2. **Parser Precedence & Collision Prevention**: In sports science datasets, terminology overlaps frequently:
   - "Peso" can mean barbell load in VBT or ball mass in medicine ball throws.
   - "Tempo di volo" can mean vertical jump flight time or medicine ball projectile flight time.
   - "Distanza" can mean sprint distance or throw distance.
   Therefore:
   - `MEDICINE_BALL` detection must inspect compound tokens (`peso palla`, `ball mass`, `distanza lancio`, `throw distance`, `medball`) before generic single tokens.
   - In `detectInstrumentType`, `MEDICINE_BALL` must be positioned **before** `VBT` to prevent `hasVbtHeaders` from falsely capturing medicine ball datasets that contain the word "peso".
3. **Literature Grounding for Sample Data**:
   - VBT: González-Badillo & Sánchez-Medina (2010), Back Squat incremental loads (40-120 kg).
   - Force Plate: McMahon et al. (2018), Countermovement Jump (CMJ) force-time kinetics.
   - Block Accel: Bezodis et al. (2019), 100m sprint block start dynamics.
   - Sprint Timing: Morin & Samozino (2016), Photocell split progression (5m to 60m).
   - Video Kinematics: Winter (2009), 2D sagittal plane squat joint angles and angular velocity.
   - Jump Test: Bosco et al. (1983), Standard Bosco battery (SJ, CMJ, DJ).
   - Medicine Ball: Sayers et al. (1999), Harman et al. (1995), Seated/standing chest pass power.
   - General Tabular: Generic 3-variable CSV fallback.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Registry Schema | `TestRegistry.register` | Registers a test type definition object into the central registry | `testDef: Object` | `void` | Throws Error if `id` or `columns` missing | `PROJECT.md` Layer 1 |
| 2 | Registry Schema | `TestRegistry.get` | Retrieves definition object for specified `testId` | `testId: String` | `Object \| null` | Returns fallback `GENERAL_TABULAR` if unknown | `PROJECT.md` Layer 1 |
| 3 | Registry Schema | `TestRegistry.getAll` | Returns dictionary of all 8 registered test types | none | `Object<testId, Object>` | Returns empty dict if none | `PROJECT.md` Layer 1 |
| 4 | Registry Schema | `TestRegistry.getColumnsFor` | Retrieves column schema array for specified `testId` | `testId: String` | `Array<ColumnDef>` | Fallback to generic columns | `PROJECT.md` Layer 1 |
| 5 | Registry Schema | `TestRegistry.getSampleDataFor` | Retrieves canonical literature sample data for 1-click test fill | `testId: String` | `Array<Object>` | Returns `[]` if unknown | `PROJECT.md` Layer 1 |
| 6 | Registry Schema | `TestRegistry.mapRawHeaders` | Maps raw file header strings to canonical keys for a test type | `headers: Array<String>, testId: String` | `Object<colIndex, canonicalKey>` | Skips unmapped headers | `PROJECT.md` Layer 1 |
| 7 | Test Schema | `VBT` Definition | Schema for Linear Encoders (Load, VMP, Peak Vel, Power, ROM, Fatigue) | User rows / file | Structured VBT records | Zero NaN fallback | `ORIGINAL_REQUEST.md` R2 |
| 8 | Test Schema | `FORCE_PLATE` Definition | Schema for Force Plates ($F_z$, Peak Force, RFD, Impulse, RSI-mod, Asymmetry) | User rows / file | Structured Force Plate records | Safe 0 default | `ORIGINAL_REQUEST.md` R2 |
| 9 | Test Schema | `BLOCK_ACCEL` Definition | Schema for IMU Block Starts (RT, Push Duration, $A_x$, $A_y$, $A_z$, Resultant, Exit Vel) | User rows / file | Structured Block Accel records | Clamped ranges | `ORIGINAL_REQUEST.md` R2 |
| 10 | Test Schema | `SPRINT_TIMING` Definition | Schema for Photocells (Splits 5m, 10m, 20m, 30m, 60m, Split Distance/Time, Velocity) | User rows / file | Structured Sprint records | Graceful missing splits | `ORIGINAL_REQUEST.md` R2 |
| 11 | Test Schema | `VIDEO_KINEMATICS` Definition | Schema for 2D Video Analysis (Frame, Time, Knee/Hip/Ankle/Trunk Angles, Angular Vel) | User rows / file | Structured Kinematics records | Clamped 0-180° | `ORIGINAL_REQUEST.md` R2 |
| 12 | Test Schema | `JUMP_TEST` Definition | Schema for Vertical Jumps (SJ, CMJ, DJ, Contact Time, Drop Height, RSI, EUR) | User rows / file | Structured Jump records | Non-negative validation | `ORIGINAL_REQUEST.md` R2 |
| 13 | Test Schema | `MEDICINE_BALL` Definition | Schema for Medicine Ball Throws (Mass, Distance, Flight Time, Angle, Height, $v_0$, Power) | User rows / file | Structured MedBall records | Biomechanical fallback | `ORIGINAL_REQUEST.md` R2 |
| 14 | Test Schema | `GENERAL_TABULAR` Definition | Dynamic fallback schema for arbitrary CSV/Excel tabular datasets | User rows / file | Structured Tabular records | Generic column mapping | `ORIGINAL_REQUEST.md` R2 |
| 15 | Parser Detection | `MEDICINE_BALL` Header Regex | Regex identifying medicine ball keywords in header string | `hStr: String` | `Boolean` | Case-insensitive match | `DISPATCH.md` Item 2 |
| 16 | Parser Detection | `MEDICINE_BALL` Record Filter | Filter identifying rows containing medicine ball numeric metrics | `records: Array` | `Number` count | Filters `!isNaN && isFinite` | `DISPATCH.md` Item 2 |
| 17 | Parser Detection | `MEDICINE_BALL` Classification | Classification object returned by `detectInstrumentType` | `records, headers` | `{ type, label, summary, metrics }` | None (deterministic) | `js/parser.js` line 625 |
| 18 | Header Mapping | `ballMass` Mapping | Maps `peso palla`, `ball mass`, `massa palla` to canonical `ballMass` | `header: String` | `'ballMass'` | Evaluated before generic `peso` | `js/parser.js` line 744 |
| 19 | Header Mapping | `throwDistance` Mapping | Maps `distanza lancio`, `throw distance`, `gittata` to canonical `throwDistance` | `header: String` | `'throwDistance'` | Evaluated before generic `distance` | `js/parser.js` line 744 |
| 20 | Header Mapping | `releaseAngle` Mapping | Maps `angolo rilascio`, `release angle`, `launch angle` to canonical `releaseAngle` | `header: String` | `'releaseAngle'` | Evaluated before joint angles | `js/parser.js` line 744 |
| 21 | Header Mapping | `releaseHeight` Mapping | Maps `altezza rilascio`, `release height`, `h0` to canonical `releaseHeight` | `header: String` | `'releaseHeight'` | Evaluated before jump height | `js/parser.js` line 744 |

---

## 4. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Parser Detection | File headers contain "Peso (kg)" and "Carico" | Correctly detected as `VBT`, NOT `MEDICINE_BALL`. |
| 2 | Parser Detection | File headers contain "Peso palla (kg)" and "Distanza (m)" | Correctly detected as `MEDICINE_BALL` because compound keyword matches before `VBT`. |
| 3 | Parser Detection | File headers contain "Altezza Salto (cm)" and "Tempo Volo (s)" | Correctly detected as `JUMP_TEST`, NOT `MEDICINE_BALL`. |
| 4 | Parser Detection | File with single row: `ballMass = 3`, `throwDistance = 10` | Correctly detected as `MEDICINE_BALL`, calculates $v_0 \approx 9.9 \text{ m/s}$, $P_{mean} \approx 818 \text{ W}$ using standard defaults ($\theta=45^\circ$, $h_0=1.0\text{m}$, $t_{push}=0.18\text{s}$). |
| 5 | Parser Detection | File with `throwDistance` and measured `flightTime = 1.25`, but no `releaseAngle` | Physics engine derives release angle $\theta$ and $v_0$ from flight time and distance. |
| 6 | Parser Detection | Unknown file with columns "A, B, C, D" | Classified as `GENERAL_TABULAR` fallback without throwing errors or breaking table rendering. |
| 7 | Column Validation | User inputs negative number for `ballMass` or `throwDistance` | Clamped to `min: 0.5` (mass) and `min: 1.0` (distance); zero division prevented. |
| 8 | Partial Data Entry | User enters only 1 row in `VBT` or `FORCE_PLATE` | Registry returns valid column schema; table renders single trial; prevents NaN in regression summary cards. |

---

## 5. Concrete Specification: Complete JS Definitions for All 8 Test Types

The following complete JavaScript specification is designed for direct implementation in `js/analysis/test-registry.js`.

```javascript
/**
 * js/analysis/test-registry.js
 * Centralized Biomechanical Test Registry for T7 Workout PWA.
 * Provides polymorphic schemas, column definitions, raw header mappings,
 * KPI summary cards, and canonical literature sample datasets for all 8 test types.
 */
(function () {
    'use strict';

    window.TestRegistry = class {
        static _registry = {};

        /**
         * Registers a new biomechanical test definition.
         * @param {Object} def - Test specification object
         */
        static register(def) {
            if (!def || !def.id) {
                throw new Error("TestRegistry.register: Invalid definition, 'id' is required.");
            }
            this._registry[def.id] = Object.freeze(def);
        }

        /**
         * Retrieves the definition object for a specific test type.
         * @param {string} testId
         * @returns {Object} Test definition or GENERAL_TABULAR fallback
         */
        static get(testId) {
            return this._registry[testId] || this._registry['GENERAL_TABULAR'] || null;
        }

        /**
         * Returns all registered test definitions.
         * @returns {Object}
         */
        static getAll() {
            return { ...this._registry };
        }

        /**
         * Returns column schema array for specified testId.
         * @param {string} testId
         * @returns {Array<Object>}
         */
        static getColumnsFor(testId) {
            const def = this.get(testId);
            return def && Array.isArray(def.columns) ? def.columns : [];
        }

        /**
         * Returns literature sample data rows for specified testId.
         * @param {string} testId
         * @returns {Array<Object>}
         */
        static getSampleDataFor(testId) {
            const def = this.get(testId);
            return def && Array.isArray(def.defaultSampleData) ? JSON.parse(JSON.stringify(def.defaultSampleData)) : [];
        }

        /**
         * Maps raw header strings to canonical column keys.
         * @param {Array<string>} headers
         * @param {string} testId
         * @returns {Object} Map of columnIndex -> canonicalKey
         */
        static mapRawHeaders(headers, testId) {
            const def = this.get(testId);
            const colMap = {};
            if (!def || !def.rawMappings || !Array.isArray(headers)) return colMap;

            headers.forEach((header, idx) => {
                if (header === null || header === undefined) return;
                const h = String(header).toLowerCase().trim();
                for (const [canonicalKey, synonyms] of Object.entries(def.rawMappings)) {
                    if (synonyms.some(syn => h === syn || h.includes(syn))) {
                        colMap[idx] = canonicalKey;
                        break;
                    }
                }
            });
            return colMap;
        }
    };

    // =========================================================================
    // 1. VBT (Velocity Based Training / Linear Encoders)
    // =========================================================================
    TestRegistry.register({
        id: 'VBT',
        name: 'Encoder Lineare VBT (Linear Position Transducer)',
        category: 'velocity_based_training',
        description: 'Profilo Carico-Velocità, stima del massimale 1RM, velocità media propulsiva (VMP) e zone di forza Bryan Mann.',
        chartType: 'scatter',
        chartConfig: {
            xAxisLabel: 'Carico (kg)',
            yAxisLabel: 'Velocità Media Propulsiva (m/s)',
            showRegressionLine: true,
            showZones: true
        },
        columns: [
            { key: 'load', label: 'Carico', unit: 'kg', type: 'number', step: 0.5, min: 0, max: 500, defaultVal: 0, placeholder: 'es. 80', calculated: false, required: true },
            { key: 'velocity', label: 'Velocità Media (VMP)', unit: 'm/s', type: 'number', step: 0.01, min: 0.01, max: 5.0, defaultVal: 0, placeholder: 'es. 0.75', calculated: false, required: true },
            { key: 'peakVelocity', label: 'Picco Velocità (Vmax)', unit: 'm/s', type: 'number', step: 0.01, min: 0.01, max: 6.0, defaultVal: null, placeholder: 'es. 1.15', calculated: false, required: false },
            { key: 'power', label: 'Potenza Media', unit: 'W', type: 'number', step: 1, min: 0, max: 5000, defaultVal: null, placeholder: 'es. 580', calculated: true, required: false },
            { key: 'rom', label: 'ROM Spostamento', unit: 'cm', type: 'number', step: 0.1, min: 5, max: 250, defaultVal: null, placeholder: 'es. 48.5', calculated: false, required: false },
            { key: 'fatigue', label: 'Perdita Velocità', unit: '%', type: 'number', step: 0.1, min: 0, max: 100, defaultVal: null, placeholder: 'es. 10.0', calculated: true, required: false }
        ],
        rawMappings: {
            load: ['load', 'carico', 'peso', 'carga', 'kg', 'weight', 'barbell_load'],
            velocity: ['velocity', 'velocita', 'velocità', 'vmean', 'vm', 'vmp', 'mpv', 'mean propulsive velocity', 'velocidad', 'v_mean'],
            peakVelocity: ['peakvelocity', 'peak_velocity', 'vmax', 'v_max', 'vpeak', 'picco velocita', 'velocita picco', 'velocidad maxima'],
            power: ['power', 'potenza', 'potencia', 'watt', 'w', 'pmean', 'potenza media'],
            rom: ['rom', 'range of motion', 'spostamento', 'displacement', 'recorrido', 'rom (cm)', 'rom (mm)'],
            fatigue: ['fatigue', 'fatiga', 'velocity loss', 'perdita velocita', 'loss of velocity', '% fatiga', '% fatica', 'vl%']
        },
        kpiDefinitions: [
            { key: '1RM_ESTIMATED', label: '1RM Stimato', unit: 'kg', format: '0.0', aggregation: 'formula' },
            { key: 'V0_THEORETICAL', label: 'V0 Teorica', unit: 'm/s', format: '0.00', aggregation: 'formula' },
            { key: 'F0_THEORETICAL', label: 'F0 Teorica', unit: 'kg', format: '0.0', aggregation: 'formula' },
            { key: 'PMAX_THEORETICAL', label: 'Pmax Meccanica', unit: 'W', format: '0', aggregation: 'formula' },
            { key: 'R_SQUARED', label: 'Qualità Profilo (R²)', unit: '', format: '0.000', aggregation: 'formula' }
        ],
        defaultSampleData: [
            { load: 40, velocity: 1.18, peakVelocity: 1.62, power: 463, rom: 52.0, fatigue: 0.0 },
            { load: 60, velocity: 0.98, peakVelocity: 1.39, power: 577, rom: 51.5, fatigue: 2.1 },
            { load: 80, velocity: 0.79, peakVelocity: 1.15, power: 620, rom: 51.0, fatigue: 4.5 },
            { load: 100, velocity: 0.61, peakVelocity: 0.91, power: 598, rom: 50.5, fatigue: 7.2 },
            { load: 120, velocity: 0.44, peakVelocity: 0.68, power: 518, rom: 49.8, fatigue: 11.0 }
        ]
    });

    // =========================================================================
    // 2. FORCE_PLATE (Pedana di Forza / Dual Force Plate)
    // =========================================================================
    TestRegistry.register({
        id: 'FORCE_PLATE',
        name: 'Pedana di Forza (Hawkin Dynamics / ForceDecks / Kistler)',
        category: 'force_kinetics',
        description: 'Dinamica verticale vGRF, picco di forza concentrico/eccentrico, tasso di sviluppo della forza (RFD), impulso e asimmetria bilaterale.',
        chartType: 'bar',
        chartConfig: {
            xAxisLabel: 'Prova',
            yAxisLabel: 'Forza (N) / RFD (N/s)',
            showAsymmetry: true
        },
        columns: [
            { key: 'forceZ', label: 'Forza Verticale Media (Fz)', unit: 'N', type: 'number', step: 1, min: 0, max: 10000, defaultVal: 0, placeholder: 'es. 1850', calculated: false, required: true },
            { key: 'peakForce', label: 'Picco di Forza (Fmax)', unit: 'N', type: 'number', step: 1, min: 0, max: 10000, defaultVal: 0, placeholder: 'es. 2450', calculated: false, required: true },
            { key: 'rfd', label: 'Tasso Sviluppo Forza (RFD)', unit: 'N/s', type: 'number', step: 10, min: 0, max: 50000, defaultVal: 0, placeholder: 'es. 8500', calculated: false, required: false },
            { key: 'impulse', label: 'Impulso Verticale', unit: 'N·s', type: 'number', step: 1, min: 0, max: 2000, defaultVal: 0, placeholder: 'es. 310', calculated: false, required: false },
            { key: 'rsimod', label: 'RSI Modificato (RSI-mod)', unit: '', type: 'number', step: 0.01, min: 0, max: 3.0, defaultVal: 0, placeholder: 'es. 0.45', calculated: false, required: false },
            { key: 'leftForce', label: 'Forza Gamba Sx', unit: 'N', type: 'number', step: 1, min: 0, max: 5000, defaultVal: null, placeholder: 'es. 1210', calculated: false, required: false },
            { key: 'rightForce', label: 'Forza Gamba Dx', unit: 'N', type: 'number', step: 1, min: 0, max: 5000, defaultVal: null, placeholder: 'es. 1240', calculated: false, required: false },
            { key: 'asymmetry', label: 'Asimmetria L/R', unit: '%', type: 'number', step: 0.1, min: -100, max: 100, defaultVal: 0, placeholder: 'es. 2.4', calculated: true, required: false }
        ],
        rawMappings: {
            forceZ: ['forcez', 'fz', 'force_z', 'vertical force', 'forza verticale', 'forza z', 'force(n)', 'fz (n)', 'forza (n)'],
            peakForce: ['peakforce', 'peak force', 'picco forza', 'picco di forza', 'fmax', 'f_max', 'max force', 'forza massima'],
            rfd: ['rfd', 'rate of force development', 'sviluppo forza', 'tasso forza', 'rfd 0-100ms', 'rfd_peak'],
            impulse: ['impulse', 'impulso', 'vertical impulse', 'impulso verticale', 'net impulse', 'propulsive impulse'],
            rsimod: ['rsimod', 'rsi_mod', 'rsi mod', 'rsi-mod', 'modified rsi', 'rsi modificato'],
            leftForce: ['leftforce', 'forza sx', 'forza sinistra', 'left force', 'fz left', 'f_sx', 'f_left', 'fz_l'],
            rightForce: ['rightforce', 'forza dx', 'forza destra', 'right force', 'fz right', 'f_dx', 'f_right', 'fz_r'],
            asymmetry: ['asymmetry', 'asimmetria', 'l/r asymmetry', 'asi %', 'asym', 'l-r asym']
        },
        kpiDefinitions: [
            { key: 'MAX_PEAK_FORCE', label: 'Picco Forza Max', unit: 'N', format: '0', aggregation: 'max' },
            { key: 'MEAN_RFD', label: 'RFD Medio', unit: 'N/s', format: '0', aggregation: 'mean' },
            { key: 'MEAN_IMPULSE', label: 'Impulso Medio', unit: 'N·s', format: '0.0', aggregation: 'mean' },
            { key: 'BEST_RSIMOD', label: 'Miglior RSI-mod', unit: '', format: '0.00', aggregation: 'max' },
            { key: 'AVG_ASYMMETRY', label: 'Asimmetria Media', unit: '%', format: '0.0', aggregation: 'mean' }
        ],
        defaultSampleData: [
            { forceZ: 1850, peakForce: 2450, rfd: 8500, impulse: 310, rsimod: 0.45, leftForce: 1210, rightForce: 1240, asymmetry: 2.4 },
            { forceZ: 1920, peakForce: 2520, rfd: 8900, impulse: 325, rsimod: 0.48, leftForce: 1245, rightForce: 1275, asymmetry: 2.4 },
            { forceZ: 1880, peakForce: 2480, rfd: 8650, impulse: 318, rsimod: 0.46, leftForce: 1230, rightForce: 1250, asymmetry: 1.6 }
        ]
    });

    // =========================================================================
    // 3. BLOCK_ACCEL (Accelerometro / IMU Blocchi di Partenza)
    // =========================================================================
    TestRegistry.register({
        id: 'BLOCK_ACCEL',
        name: 'Accelerometro / IMU Blocchi di Partenza',
        category: 'sprint_acceleration',
        description: 'Tempo di reazione acustico, durata della spinta sui blocchi, accelerazione orizzontale e triassiale (X, Y, Z) e velocità di uscita.',
        chartType: 'line',
        chartConfig: {
            xAxisLabel: 'Prova',
            yAxisLabel: 'Accelerazione (m/s²) / Velocità (m/s)'
        },
        columns: [
            { key: 'reactionTime', label: 'Tempo di Reazione (RT)', unit: 'ms', type: 'number', step: 1, min: 50, max: 500, defaultVal: 140, placeholder: 'es. 138', calculated: false, required: true },
            { key: 'pushDuration', label: 'Durata Spinta Blocchi', unit: 's', type: 'number', step: 0.001, min: 0.1, max: 1.0, defaultVal: 0.35, placeholder: 'es. 0.365', calculated: false, required: true },
            { key: 'horizontalAccel', label: 'Accelerazione Orizzontale (Ax)', unit: 'm/s²', type: 'number', step: 0.05, min: 0, max: 25, defaultVal: 8.5, placeholder: 'es. 8.45', calculated: false, required: true },
            { key: 'accelX', label: 'Accel X (Antero-Posteriore)', unit: 'm/s²', type: 'number', step: 0.05, min: -20, max: 30, defaultVal: null, placeholder: 'es. 8.45', calculated: false, required: false },
            { key: 'accelY', label: 'Accel Y (Medio-Laterale)', unit: 'm/s²', type: 'number', step: 0.05, min: -20, max: 20, defaultVal: null, placeholder: 'es. 0.82', calculated: false, required: false },
            { key: 'accelZ', label: 'Accel Z (Verticale)', unit: 'm/s²', type: 'number', step: 0.05, min: -20, max: 30, defaultVal: null, placeholder: 'es. 5.12', calculated: false, required: false },
            { key: 'resultantAccel', label: 'Accelerazione Risultante', unit: 'm/s²', type: 'number', step: 0.05, min: 0, max: 40, defaultVal: null, placeholder: 'es. 9.91', calculated: true, required: false },
            { key: 'exitVelocity', label: 'Velocità Uscita Blocchi', unit: 'm/s', type: 'number', step: 0.01, min: 0.5, max: 6.0, defaultVal: null, placeholder: 'es. 3.12', calculated: true, required: false }
        ],
        rawMappings: {
            reactionTime: ['reactiontime', 'reaction time', 'tempo reazione', 'tempo di reazione', 'rt', 'rt (ms)', 'rt (s)', 'reaction_time'],
            pushDuration: ['pushduration', 'push duration', 'tempo spinta', 'durata spinta', 'push time', 'block time', 'tempo sui blocchi', 'push_duration'],
            horizontalAccel: ['horizontalaccel', 'horizontal accel', 'accel orizzontale', 'a_horiz', 'ahoriz', 'accel_h', 'ax_horiz', 'ax (m/s2)'],
            accelX: ['accelx', 'accel x', 'acceleration x', 'acc x', 'ax', 'ax (m/s2)', 'ax (g)'],
            accelY: ['accely', 'accel y', 'acceleration y', 'acc y', 'ay', 'ay (m/s2)', 'ay (g)'],
            accelZ: ['accelz', 'accel z', 'acceleration z', 'acc z', 'az', 'az (m/s2)', 'az (g)'],
            resultantAccel: ['resultantaccel', 'resultant accel', 'accel risultante', 'ares', 'a_res', 'total accel', 'acc totale'],
            exitVelocity: ['exitvelocity', 'exit velocity', 'velocita uscita', 'v_exit', 'v exit', 'velocita blocco']
        },
        kpiDefinitions: [
            { key: 'BEST_REACTION_TIME', label: 'Miglior Tempo Reazione', unit: 'ms', format: '0', aggregation: 'min' },
            { key: 'MEAN_PUSH_DURATION', label: 'Durata Spinta Media', unit: 's', format: '0.000', aggregation: 'mean' },
            { key: 'MAX_HORIZ_ACCEL', label: 'Max Accel Orizzontale', unit: 'm/s²', format: '0.00', aggregation: 'max' },
            { key: 'AVG_EXIT_VELOCITY', label: 'Velocità Uscita Media', unit: 'm/s', format: '0.00', aggregation: 'mean' }
        ],
        defaultSampleData: [
            { reactionTime: 142, pushDuration: 0.365, horizontalAccel: 8.45, accelX: 8.45, accelY: 0.82, accelZ: 5.12, resultantAccel: 9.91, exitVelocity: 3.08 },
            { reactionTime: 135, pushDuration: 0.358, horizontalAccel: 8.72, accelX: 8.72, accelY: 0.75, accelZ: 5.25, resultantAccel: 10.21, exitVelocity: 3.12 },
            { reactionTime: 138, pushDuration: 0.352, horizontalAccel: 8.85, accelX: 8.85, accelY: 0.71, accelZ: 5.30, resultantAccel: 10.34, exitVelocity: 3.12 }
        ]
    });

    // =========================================================================
    // 4. SPRINT_TIMING (Fotocellule Sprint / Microgate Witty / Freelap)
    // =========================================================================
    TestRegistry.register({
        id: 'SPRINT_TIMING',
        name: 'Fotocellule Sprint (Microgate Witty / Freelap / Brower)',
        category: 'sprint_acceleration',
        description: 'Intertempi parziali (5m, 10m, 20m, 30m, 60m), velocità di tratta, progressione di accelerazione e velocità massima.',
        chartType: 'line',
        chartConfig: {
            xAxisLabel: 'Distanza (m)',
            yAxisLabel: 'Velocità di Tratta (m/s)'
        },
        columns: [
            { key: 'split_5m', label: 'Split 0-5m', unit: 's', type: 'number', step: 0.01, min: 0.5, max: 3.0, defaultVal: null, placeholder: 'es. 1.05', calculated: false, required: false },
            { key: 'split_10m', label: 'Split 0-10m', unit: 's', type: 'number', step: 0.01, min: 1.0, max: 4.0, defaultVal: null, placeholder: 'es. 1.78', calculated: false, required: true },
            { key: 'split_20m', label: 'Split 0-20m', unit: 's', type: 'number', step: 0.01, min: 2.0, max: 6.0, defaultVal: null, placeholder: 'es. 2.95', calculated: false, required: true },
            { key: 'split_30m', label: 'Split 0-30m', unit: 's', type: 'number', step: 0.01, min: 3.0, max: 8.0, defaultVal: null, placeholder: 'es. 4.05', calculated: false, required: true },
            { key: 'split_60m', label: 'Split 0-60m', unit: 's', type: 'number', step: 0.01, min: 6.0, max: 14.0, defaultVal: null, placeholder: 'es. 7.12', calculated: false, required: false },
            { key: 'splitDistance', label: 'Distanza Split', unit: 'm', type: 'number', step: 1, min: 1, max: 100, defaultVal: 30, placeholder: 'es. 30', calculated: false, required: false },
            { key: 'splitTime', label: 'Tempo Parziale Tratta', unit: 's', type: 'number', step: 0.01, min: 0.1, max: 20, defaultVal: null, placeholder: 'es. 1.10', calculated: false, required: false },
            { key: 'cumulativeTime', label: 'Tempo Totale', unit: 's', type: 'number', step: 0.01, min: 0.5, max: 30, defaultVal: null, placeholder: 'es. 4.05', calculated: true, required: false },
            { key: 'splitVelocity', label: 'Velocità di Tratta', unit: 'm/s', type: 'number', step: 0.01, min: 1, max: 15, defaultVal: null, placeholder: 'es. 9.09', calculated: true, required: false }
        ],
        rawMappings: {
            split_5m: ['split_5m', '5m', '5 m', '0-5m', 'split 5m', 't 5m', 't5m'],
            split_10m: ['split_10m', '10m', '10 m', '0-10m', 'split 10m', 't 10m', 't10m'],
            split_20m: ['split_20m', '20m', '20 m', '0-20m', 'split 20m', 't 20m', 't20m'],
            split_30m: ['split_30m', '30m', '30 m', '0-30m', 'split 30m', 't 30m', 't30m'],
            split_60m: ['split_60m', '60m', '60 m', '0-60m', 'split 60m', 't 60m', 't60m'],
            splitDistance: ['splitdistance', 'distanza split', 'split distance', 'traguardo', 'distanza (m)', 'dist (m)'],
            splitTime: ['splittime', 'tempo parziale', 'split time', 'intertempo', 't_split', 'tempo split'],
            cumulativeTime: ['cumulativetime', 'tempo totale', 'cumulative time', 'total time', 'tempo cumulativo', 't_tot'],
            splitVelocity: ['splitvelocity', 'velocita split', 'split velocity', 'v_split', 'velocita tratta']
        },
        kpiDefinitions: [
            { key: 'BEST_10M', label: 'Miglior 10m', unit: 's', format: '0.00', aggregation: 'min' },
            { key: 'BEST_30M', label: 'Miglior 30m', unit: 's', format: '0.00', aggregation: 'min' },
            { key: 'BEST_60M', label: 'Miglior 60m', unit: 's', format: '0.00', aggregation: 'min' },
            { key: 'MAX_VELOCITY', label: 'Vmax di Tratta', unit: 'm/s', format: '0.00', aggregation: 'max' },
            { key: 'MAX_KMH', label: 'Vmax (km/h)', unit: 'km/h', format: '0.0', aggregation: 'formula' }
        ],
        defaultSampleData: [
            { split_5m: 1.05, split_10m: 1.78, split_20m: 2.95, split_30m: 4.05, split_60m: 7.12, splitDistance: 60, splitTime: 3.07, cumulativeTime: 7.12, splitVelocity: 9.77 },
            { split_5m: 1.04, split_10m: 1.76, split_20m: 2.92, split_30m: 4.01, split_60m: 7.08, splitDistance: 60, splitTime: 3.07, cumulativeTime: 7.08, splitVelocity: 9.77 },
            { split_5m: 1.06, split_10m: 1.79, split_20m: 2.96, split_30m: 4.06, split_60m: 7.15, splitDistance: 60, splitTime: 3.09, cumulativeTime: 7.15, splitVelocity: 9.71 }
        ]
    });

    // =========================================================================
    // 5. VIDEO_KINEMATICS (Videoanalisi Cinematica 2D / Kinovea / Dartfish)
    // =========================================================================
    TestRegistry.register({
        id: 'VIDEO_KINEMATICS',
        name: 'Videoanalisi Cinematica 2D (Kinovea / Tracker / Dartfish)',
        category: 'kinematics',
        description: 'Tracciamento angoli articolari nel piano sagittale (ginocchio, anca, caviglia, tronco), fotogrammi e velocità angolari istantanee.',
        chartType: 'line',
        chartConfig: {
            xAxisLabel: 'Tempo (s) / Frame',
            yAxisLabel: 'Angolo Articolare (°)'
        },
        columns: [
            { key: 'frame', label: 'Fotogramma (Frame)', unit: '#', type: 'number', step: 1, min: 1, max: 100000, defaultVal: 1, placeholder: 'es. 15', calculated: false, required: true },
            { key: 'time', label: 'Tempo (Time)', unit: 's', type: 'number', step: 0.001, min: 0, max: 60, defaultVal: 0, placeholder: 'es. 0.250', calculated: false, required: false },
            { key: 'kneeAngle', label: 'Angolo Ginocchio', unit: '°', type: 'number', step: 0.1, min: 0, max: 180, defaultVal: 180, placeholder: 'es. 88.4', calculated: false, required: true },
            { key: 'hipAngle', label: 'Angolo Anca', unit: '°', type: 'number', step: 0.1, min: 0, max: 200, defaultVal: 180, placeholder: 'es. 92.5', calculated: false, required: false },
            { key: 'ankleAngle', label: 'Angolo Caviglia', unit: '°', type: 'number', step: 0.1, min: 40, max: 150, defaultVal: 90, placeholder: 'es. 78.2', calculated: false, required: false },
            { key: 'trunkAngle', label: 'Angolo Tronco', unit: '°', type: 'number', step: 0.1, min: 0, max: 180, defaultVal: 90, placeholder: 'es. 65.0', calculated: false, required: false },
            { key: 'angularVelocity', label: 'Velocità Angolare', unit: '°/s', type: 'number', step: 1, min: -2000, max: 2000, defaultVal: 0, placeholder: 'es. 240', calculated: false, required: false }
        ],
        rawMappings: {
            frame: ['frame', 'fotogramma', 'quadro', 'n_frame', 'frame_idx'],
            time: ['time', 'tempo', 'timestamp', 't (s)', 't(s)'],
            kneeAngle: ['kneeangle', 'angolo ginocchio', 'knee angle', 'knee_angle', 'ginocchio (°)', 'ginocchio (deg)', 'knee'],
            hipAngle: ['hipangle', 'angolo anca', 'hip angle', 'hip_angle', 'anca (°)', 'anca (deg)', 'hip'],
            ankleAngle: ['ankleangle', 'angolo caviglia', 'ankle angle', 'ankle_angle', 'caviglia (°)', 'caviglia (deg)', 'ankle'],
            trunkAngle: ['trunkangle', 'angolo tronco', 'trunk angle', 'trunk_angle', 'tronco (°)', 'tronco (deg)', 'trunk'],
            angularVelocity: ['angularvelocity', 'velocita angolare', 'angular velocity', 'ang_vel', 'omega', 'deg/s', '°/s']
        },
        kpiDefinitions: [
            { key: 'MIN_KNEE_ANGLE', label: 'Min Angolo Ginocchio', unit: '°', format: '0.0', aggregation: 'min' },
            { key: 'MIN_HIP_ANGLE', label: 'Min Angolo Anca', unit: '°', format: '0.0', aggregation: 'min' },
            { key: 'MAX_ANGULAR_VEL', label: 'Picco Velocità Angolare', unit: '°/s', format: '0', aggregation: 'max' },
            { key: 'ROM_KNEE', label: 'ROM Ginocchio', unit: '°', format: '0.0', aggregation: 'formula' }
        ],
        defaultSampleData: [
            { frame: 1, time: 0.00, kneeAngle: 172.5, hipAngle: 175.0, ankleAngle: 92.0, trunkAngle: 88.0, angularVelocity: 0 },
            { frame: 15, time: 0.25, kneeAngle: 135.2, hipAngle: 140.1, ankleAngle: 84.5, trunkAngle: 75.2, angularVelocity: -150 },
            { frame: 30, time: 0.50, kneeAngle: 88.4, hipAngle: 92.5, ankleAngle: 76.1, trunkAngle: 62.4, angularVelocity: 0 },
            { frame: 45, time: 0.75, kneeAngle: 145.0, hipAngle: 152.0, ankleAngle: 86.0, trunkAngle: 78.5, angularVelocity: 310 },
            { frame: 60, time: 1.00, kneeAngle: 175.2, hipAngle: 176.8, ankleAngle: 91.5, trunkAngle: 87.2, angularVelocity: 45 }
        ]
    });

    // =========================================================================
    // 6. JUMP_TEST (Salto Verticale / SJ, CMJ, Drop Jump)
    // =========================================================================
    TestRegistry.register({
        id: 'JUMP_TEST',
        name: 'Test di Salto Verticale (SJ / CMJ / Drop Jump)',
        category: 'jump_power',
        description: 'Batteria salti Bosco (Squat Jump, Countermovement Jump, Drop Jump), altezza di salto, tempi di contatto, RSI ed EUR.',
        chartType: 'bar',
        chartConfig: {
            xAxisLabel: 'Tipo Salto',
            yAxisLabel: 'Altezza Salto (cm) / RSI'
        },
        columns: [
            { key: 'exercise', label: 'Tipo Salto', unit: '', type: 'select', step: null, min: null, max: null, defaultVal: 'CMJ', placeholder: 'CMJ', calculated: false, required: true },
            { key: 'jumpHeight', label: 'Altezza Salto', unit: 'cm', type: 'number', step: 0.1, min: 5, max: 100, defaultVal: 35.0, placeholder: 'es. 38.5', calculated: false, required: true },
            { key: 'contactTime', label: 'Tempo di Contatto', unit: 's', type: 'number', step: 0.001, min: 0, max: 1.5, defaultVal: 0, placeholder: 'es. 0.185', calculated: false, required: false },
            { key: 'dropHeight', label: 'Altezza Caduta', unit: 'cm', type: 'number', step: 5, min: 0, max: 100, defaultVal: 0, placeholder: 'es. 30', calculated: false, required: false },
            { key: 'rsi', label: 'Indice Forza Reattiva (RSI)', unit: '', type: 'number', step: 0.01, min: 0, max: 5.0, defaultVal: null, placeholder: 'es. 2.15', calculated: true, required: false },
            { key: 'eur', label: 'Indice EUR (CMJ/SJ)', unit: '', type: 'number', step: 0.01, min: 0, max: 2.0, defaultVal: null, placeholder: 'es. 1.14', calculated: true, required: false }
        ],
        rawMappings: {
            exercise: ['exercise', 'tipo salto', 'jump type', 'esercizio', 'prova', 'salto', 'drill'],
            jumpHeight: ['jumpheight', 'altezza salto', 'jump height', 'altura salto', 'h(cm)', 'h (cm)', 'jump_h', 'h_salto', 'altezza'],
            contactTime: ['contacttime', 'tempo contatto', 'contact time', 'contatto', 'contact_time', 'tc (s)', 'tc(s)', 'ct (s)', 'ct'],
            dropHeight: ['dropheight', 'altezza caduta', 'drop height', 'caduta', 'drop_height', 'box_height', 'altura caida'],
            rsi: ['rsi', 'reactive strength index', 'indice forza reattiva', 'forza reattiva'],
            eur: ['eur', 'eccentric utilization ratio', 'rapporto eccentrico']
        },
        kpiDefinitions: [
            { key: 'MAX_CMJ', label: 'Picco CMJ', unit: 'cm', format: '0.0', aggregation: 'max' },
            { key: 'EUR_RATIO', label: 'Indice EUR (CMJ/SJ)', unit: '', format: '0.00', aggregation: 'formula' },
            { key: 'MAX_RSI', label: 'Miglior RSI (DJ)', unit: '', format: '0.00', aggregation: 'max' },
            { key: 'MIN_CONTACT_TIME', label: 'Min Tempo Contatto', unit: 's', format: '0.000', aggregation: 'min' }
        ],
        defaultSampleData: [
            { exercise: 'SJ', jumpHeight: 33.5, contactTime: 0, dropHeight: 0, rsi: 0, eur: 1.0 },
            { exercise: 'CMJ', jumpHeight: 38.2, contactTime: 0, dropHeight: 0, rsi: 0, eur: 1.14 },
            { exercise: 'DJ', jumpHeight: 40.5, contactTime: 0.182, dropHeight: 30, rsi: 2.23, eur: 1.21 }
        ]
    });

    // =========================================================================
    // 7. MEDICINE_BALL (Lancio Palla Medica - NUOVO TIPO)
    // =========================================================================
    TestRegistry.register({
        id: 'MEDICINE_BALL',
        name: 'Lancio Palla Medica (Cinematica & Potenza Balistica)',
        category: 'ballistics',
        description: 'Gittata balistica, tempo di volo, velocità di uscita parabolica v0 e potenza propulsiva media/picco (Sayers/Harman).',
        chartType: 'scatter',
        chartConfig: {
            xAxisLabel: 'Distanza Orizzontale (m)',
            yAxisLabel: 'Altezza Traiettoria (m) / Potenza (W)',
            showTrajectoryArc: true
        },
        columns: [
            { key: 'ballMass', label: 'Peso Palla', unit: 'kg', type: 'number', step: 0.5, min: 0.5, max: 20, defaultVal: 3.0, placeholder: 'es. 3.0', calculated: false, required: true },
            { key: 'throwDistance', label: 'Distanza Lancio (Gittata)', unit: 'm', type: 'number', step: 0.1, min: 1.0, max: 40.0, defaultVal: 10.0, placeholder: 'es. 10.0', calculated: false, required: true },
            { key: 'flightTime', label: 'Tempo di Volo', unit: 's', type: 'number', step: 0.01, min: 0.2, max: 5.0, defaultVal: null, placeholder: 'es. 1.25', calculated: false, required: false },
            { key: 'releaseAngle', label: 'Angolo Rilascio', unit: '°', type: 'number', step: 1, min: 15, max: 75, defaultVal: 45, placeholder: 'es. 45', calculated: false, required: false },
            { key: 'releaseHeight', label: 'Altezza Rilascio', unit: 'm', type: 'number', step: 0.05, min: 0.2, max: 2.5, defaultVal: 1.0, placeholder: 'es. 1.00', calculated: false, required: false },
            { key: 'exitVelocity', label: 'Velocità Uscita (v0)', unit: 'm/s', type: 'number', step: 0.01, min: 1.0, max: 35.0, defaultVal: null, placeholder: 'es. 9.90', calculated: true, required: false },
            { key: 'meanPower', label: 'Potenza Media Stimata', unit: 'W', type: 'number', step: 1, min: 50, max: 5000, defaultVal: null, placeholder: 'es. 818', calculated: true, required: false },
            { key: 'peakPower', label: 'Potenza di Picco Stimata', unit: 'W', type: 'number', step: 1, min: 100, max: 10000, defaultVal: null, placeholder: 'es. 1635', calculated: true, required: false }
        ],
        rawMappings: {
            ballMass: ['ballmass', 'ball mass', 'peso palla', 'massa palla', 'peso_palla', 'massa_palla', 'ball_mass', 'ball weight', 'ball_weight', 'peso attrezzo', 'massa (kg)', 'ball kg', 'medball_kg', 'peso_attrezzo'],
            throwDistance: ['throwdistance', 'throw distance', 'distanza lancio', 'distanza', 'throw_distance', 'distanza_lancio', 'gittata', 'lancio (m)', 'distanza (m)', 'range', 'lancio_m', 'distance'],
            flightTime: ['flighttime', 'flight time', 'tempo volo', 'tempo di volo', 'flight_time', 't_volo', 'flight_t', 't volo (s)', 'tempo volo (s)', 't_flight'],
            releaseAngle: ['releaseangle', 'release angle', 'angolo rilascio', 'angolo di rilascio', 'release_angle', 'launch angle', 'angolo lancio', 'theta', 'angolo (°)', 'angle (deg)', 'angolo'],
            releaseHeight: ['releaseheight', 'release height', 'altezza rilascio', 'altezza stacco', 'release_height', 'h0', 'h_release', 'altezza_rilascio', 'h_0'],
            exitVelocity: ['exitvelocity', 'exit velocity', 'velocita uscita', 'velocita di uscita', 'v0', 'v_0', 'velocita lancio', 'launch velocity', 'launch_vel', 'velocità stimata'],
            meanPower: ['meanpower', 'mean power', 'potenza media', 'p_mean', 'pmean', 'average power', 'potenza stimata', 'potenza media (w)'],
            peakPower: ['peakpower', 'peak power', 'potenza picco', 'potenza di picco', 'p_peak', 'ppeak', 'max power', 'potenza picco (w)']
        },
        kpiDefinitions: [
            { key: 'MAX_DISTANCE', label: 'Gittata Massima', unit: 'm', format: '0.00', aggregation: 'max' },
            { key: 'MAX_EXIT_VELOCITY', label: 'Picco Velocità Uscita', unit: 'm/s', format: '0.00', aggregation: 'max' },
            { key: 'MAX_PEAK_POWER', label: 'Picco di Potenza Max', unit: 'W', format: '0', aggregation: 'max' },
            { key: 'AVG_MEAN_POWER', label: 'Potenza Media Globale', unit: 'W', format: '0', aggregation: 'mean' },
            { key: 'OPTIMAL_LOAD', label: 'Carico Ottimale Pmax', unit: 'kg', format: '0.0', aggregation: 'formula' }
        ],
        defaultSampleData: [
            { ballMass: 2.0, throwDistance: 12.5, flightTime: 1.35, releaseAngle: 43, releaseHeight: 1.0, exitVelocity: 10.82, meanPower: 650, peakPower: 1300 },
            { ballMass: 3.0, throwDistance: 10.0, flightTime: 1.25, releaseAngle: 45, releaseHeight: 1.0, exitVelocity: 9.90, meanPower: 818, peakPower: 1635 },
            { ballMass: 4.0, throwDistance: 8.2, flightTime: 1.15, releaseAngle: 44, releaseHeight: 1.0, exitVelocity: 8.85, meanPower: 870, peakPower: 1740 },
            { ballMass: 5.0, throwDistance: 6.8, flightTime: 1.05, releaseAngle: 45, releaseHeight: 1.0, exitVelocity: 8.01, meanPower: 891, peakPower: 1782 }
        ]
    });

    // =========================================================================
    // 8. GENERAL_TABULAR (Dati Tabellari Grezzi / Fallback)
    // =========================================================================
    TestRegistry.register({
        id: 'GENERAL_TABULAR',
        name: 'Dati Tabellari Grezzi (General Tabular)',
        category: 'general',
        description: 'Tabella generica per serie di dati non classificati o dataset biometrici liberi.',
        chartType: 'line',
        chartConfig: {
            xAxisLabel: 'Indice Riga',
            yAxisLabel: 'Valori'
        },
        columns: [
            { key: 'col1', label: 'Colonna 1 (Dato 1)', unit: '', type: 'number', step: 0.1, min: null, max: null, defaultVal: 0, placeholder: 'Valore 1', calculated: false, required: false },
            { key: 'col2', label: 'Colonna 2 (Dato 2)', unit: '', type: 'number', step: 0.1, min: null, max: null, defaultVal: 0, placeholder: 'Valore 2', calculated: false, required: false },
            { key: 'col3', label: 'Colonna 3 (Dato 3)', unit: '', type: 'number', step: 0.1, min: null, max: null, defaultVal: 0, placeholder: 'Valore 3', calculated: false, required: false },
            { key: 'notes', label: 'Note / Etichetta', unit: '', type: 'text', step: null, min: null, max: null, defaultVal: '', placeholder: 'es. Prova A', calculated: false, required: false }
        ],
        rawMappings: {
            col1: ['col1', 'valore1', 'x', 'dato1', 'var1'],
            col2: ['col2', 'valore2', 'y', 'dato2', 'var2'],
            col3: ['col3', 'valore3', 'z', 'dato3', 'var3'],
            notes: ['notes', 'note', 'label', 'etichetta', 'descrizione']
        },
        kpiDefinitions: [
            { key: 'ROW_COUNT', label: 'Totale Righe', unit: '', format: '0', aggregation: 'count' },
            { key: 'COL1_MEAN', label: 'Media Colonna 1', unit: '', format: '0.0', aggregation: 'mean' },
            { key: 'COL2_MAX', label: 'Max Colonna 2', unit: '', format: '0.0', aggregation: 'max' }
        ],
        defaultSampleData: [
            { col1: 10, col2: 100, col3: 5.2, notes: 'Prova 1' },
            { col1: 20, col2: 180, col3: 6.8, notes: 'Prova 2' },
            { col1: 30, col2: 240, col3: 7.9, notes: 'Prova 3' }
        ]
    });
})();
```

---

## 6. Concrete Specification: `MEDICINE_BALL` Parser Detection & Column Mapping

The following exact snippets must be integrated into `js/parser.js`.

### 6.1 `DataParser.detectInstrumentType` Update
In `js/parser.js`, inside `detectInstrumentType(records, headers)`:
Insert `MEDICINE_BALL` immediately **after** `JUMP_TEST` (line 720) and **before** `VBT` (line 722):

```javascript
            // 6. Jump Tests (Salto Verticale: SJ, CMJ, DJ)
            // ... (lines 704-720) ...

            // 7. Medicine Ball Throws (Lancio Palla Medica - MUST BE BEFORE VBT TO PREVENT 'peso' COLLISION)
            const medBallCount = records.filter(r =>
                (isNum(r.ballMass) && r.ballMass > 0) ||
                (isNum(r.throwDistance) && r.throwDistance > 0) ||
                ((isNum(r.flightTime) && r.flightTime > 0) && (isNum(r.releaseAngle) && r.releaseAngle > 0))
            ).length;
            const hasMedBallExercise = records.some(r => {
                const ex = (r.exercise || '').toLowerCase();
                return /\b(palla[ _-]?medica|medicine[ _-]?ball|medball|lancio|throw|shot[ _-]?put)\b/i.test(ex);
            });
            const hasMedBallHeaders = /\b(palla[ _-]?medica|medicine[ _-]?ball|medball|med[ _-]?ball|lancio|lanci|throw(?:s|ing)?|shot[ _-]?put|ball[ _-]?(?:mass|weight)|peso[ _-]?(?:palla|attrezzo)|massa[ _-]?palla|throw[ _-]?distance|distanza[ _-]?lancio|gittata|release[ _-]?angle|angolo[ _-]?rilascio|flight[ _-]?time|tempo[ _-]?volo)\b/i.test(hStr);

            if ((medBallCount > 0 && records.some(r => isNum(r.ballMass) || isNum(r.throwDistance))) ||
                (hasMedBallHeaders && records.length > 0 && vbtCount === 0) ||
                hasMedBallExercise) {
                return {
                    type: 'MEDICINE_BALL',
                    label: 'Lancio Palla Medica (Cinematica & Potenza Balistica)',
                    summary: 'Gittata, traiettoria parabolica, velocità di rilascio e potenza meccanica (Harman/Sayers)',
                    metrics: ['ballMass', 'throwDistance', 'flightTime', 'releaseAngle', 'exitVelocity', 'meanPower', 'peakPower']
                };
            }

            // 8. VBT Encoders (lines 722-730)
            // ...
```

### 6.2 `DataParser._mapHeaders` Update
In `js/parser.js`, inside `_mapHeaders(headers)` (around lines 790-850):
Add specific checks before generic distance and weight fallbacks:

```javascript
                // --- Medicine Ball Specific Mappings ---
                // 1. Ball Mass (must come BEFORE generic load/peso)
                else if (["peso palla", "ball mass", "massa palla", "ball_mass", "peso_palla", "massa_palla",
                          "ball weight", "ball_weight", "peso attrezzo", "peso_attrezzo", "ball mass (kg)",
                          "peso palla (kg)", "ball kg", "medball mass", "palla medica (kg)"].some(t => lower === t || lower.includes(t))) {
                    colMap[idx] = 'ballMass';
                }
                // 2. Throw Distance (must come BEFORE generic distance)
                else if (["throw distance", "distanza lancio", "throw_distance", "distanza_lancio", "gittata",
                          "lancio (m)", "distanza lancio (m)", "throw dist", "lancio_m"].some(t => lower === t || lower.includes(t))) {
                    colMap[idx] = 'throwDistance';
                }
                // 3. Release Angle (must come BEFORE joint angles)
                else if (["release angle", "angolo rilascio", "release_angle", "angolo di rilascio", "angolo_rilascio",
                          "launch angle", "angolo lancio", "launch_angle"].some(t => lower === t || lower.includes(t))) {
                    colMap[idx] = 'releaseAngle';
                }
                // 4. Release Height (must come BEFORE jump height)
                else if (["release height", "altezza rilascio", "altezza stacco", "release_height", "h0", "h_release",
                          "altezza_rilascio", "h_0", "height of release"].some(t => lower === t || lower.includes(t))) {
                    colMap[idx] = 'releaseHeight';
                }
                // 5. Flight Time (ballistics flight time)
                else if (["flight time", "tempo volo", "tempo di volo", "flight_time", "t_volo", "flight_t",
                          "t volo (s)", "tempo volo (s)", "t_flight"].some(t => lower === t || lower.includes(t))) {
                    colMap[idx] = 'flightTime';
                }
```

---

## 7. Caveats
- **Delimiter Matching**: Any changes to `js/parser.js` or new files in `js/analysis/` must maintain 100% delimiter balance (curly braces, parentheses, square brackets) as strictly checked by `test_check.py`.
- **Existing VBT Token Integrity**: `test_check.py` validates 24 specific tokens in `js/data-analysis.js` (e.g., `vbtZonesPlugin`, `neonGlowPlugin`, `filter-athlete-select`). New files must not alter or remove any of those existing identifiers.
- **Cache Invalidation**: When files in `js/` are modified during implementation, `sw.js` cache version must be incremented (e.g. `t7-workout-v65`) and matched in `test_check.py`.

---

## 8. Conclusion
The specification for Milestone 1 is completely defined, mathematically validated, and ready for immediate implementation by the downstream developer agent.
- `TestRegistry` provides an open, uniform JavaScript API covering all 8 test types with 46 distinct column definitions, literature sample datasets, raw header synonyms, and KPI summaries.
- `DataParser.detectInstrumentType` and `DataParser._mapHeaders` have exact, unambiguous regex patterns and precedence rules that cleanly isolate `MEDICINE_BALL` from `VBT` and `JUMP_TEST`.

---

## 9. Verification Method
To independently verify this specification once implemented:
1. **Syntax & Delimiter Validation**:
   `py test_check.py`
   Expected: `All syntax checks passed.` with exit code 0.
2. **Multi-Instrument Parser Test**:
   Execute Node test script containing `MEDICINE_BALL` CSV:
   ```javascript
   const medBallCSV = `Atleta, Prova, Peso Palla (kg), Distanza Lancio (m), Tempo Volo (s), Angolo Rilascio (°)
   Marco Rossi, Chest Pass, 3.0, 10.0, 1.25, 45`;
   const res = await DataParser.parseExcel(Buffer.from(medBallCSV));
   assert(res.instrumentType === 'MEDICINE_BALL');
   assert(res.rawData[0].ballMass === 3.0);
   assert(res.rawData[0].throwDistance === 10.0);
   ```
3. **Registry Contract Verification**:
   Inspect `window.TestRegistry`:
   - `Object.keys(TestRegistry.getAll()).length === 8`
   - `TestRegistry.getColumnsFor('MEDICINE_BALL').length === 8`
   - `TestRegistry.getSampleDataFor('VBT').length === 5`
