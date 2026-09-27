# Project: Data Analysis Architecture Overhaul (T7 Workout PWA)

## Architecture
- **Layer 1: TestRegistry (`js/analysis/test-registry.js`)**:
  Modular, extensible registry supporting all 8 biomechanical test types (VBT, Force Plate, Block Accel IMU, Sprint Timing, Video Kinematics, Jump Test, Medicine Ball, General Tabular). Defines schemas, columns, validation rules, raw header mappings, and canonical literature sample datasets.
- **Layer 2: Physics Engine & Medicine Ball Kinematics (`js/analysis/medicine-ball-physics.js`)**:
  Ballistic trajectory models ($v_0 = \frac{d}{\cos\theta} \sqrt{\frac{g}{2(h_0 + d \tan\theta)}}$), time-of-flight models, kinetic work-energy power ($P_{mean} = \frac{m v_0^2}{2 t_{push}}$, $P_{peak} = 2 P_{mean}$), Sayers/Harman power formulas, and trajectory arc coordinate generation.
- **Layer 3: Reactive Table Grid (`js/analysis/reactive-grid.js`)**:
  Polymorphic editable table grid adapting dynamically to the active test type. Supports in-place editing, row addition/deletion, sample data population, clear actions, and a 250ms debounced event emitter for live-binding. Zero `NaN`, zero `undefined`.
- **Layer 4: Analysis Exporter (`js/analysis/analysis-exporter.js`)**:
  Unlocked 2-sheet `.xlsx` workbook generator using ExcelJS (SheetJS fallback): Sheet 1 "Dati Prove", Sheet 2 "Sintesi Biomeccanica & KPI" with a dedicated coach notes section. Zero locked cells, zero passwords.
- **Layer 5: Unified UI & Orchestrator (`js/data-analysis.js`)**:
  Replaces the 2-tab split ("Carica File" vs "Inserimento Manuale") with a single seamless layout: Top dropzone + Test & Athlete selectors -> Reactive Grid with toolbar -> Live-bound KPI cards and Chart.js dashboards. Preserves all 24 mandatory tokens checked by `test_check.py`.
- **Layer 6: Platform & Test Infrastructure**:
  `sw.js` cache bumped to `t7-workout-v65` with `CORE_ASSETS` updated; `test_check.py` aligned; comprehensive E2E test suite in `tests/test_analysis_reactive_grid.js`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Unified Seamless Layout | Consolidated layout combining compact dropzone, test/athlete selectors, and reactive grid without tab switching | M5 | ORIGINAL_REQUEST.md R1 |
| 2 | In-Place Editable Grid | Dynamic HTML table with polymorphic columns, units, placeholders, and validation for active test type | M3 | ORIGINAL_REQUEST.md R1 |
| 3 | 250ms Debounced Live-Binding | Automatic recalculation of KPIs and charts 250ms after user stops typing or modifies rows | M3 | ORIGINAL_REQUEST.md R3 |
| 4 | One-Click Sample Data | Button to populate canonical literature test trials for instant testing of any instrument | M3 | ORIGINAL_REQUEST.md R1 |
| 5 | File Auto-Detection & Ingestion | Auto-detect instrument from CSV/Excel, switch test type, and immediately populate grid | M5 | ORIGINAL_REQUEST.md R1 |
| 6 | Centralized `TestRegistry` | Registry object defining column schemas, types, units, validation, mappings, and sample data | M1 | ORIGINAL_REQUEST.md R2 |
| 7 | VBT Test Type Schema | Schema and metrics for Linear Encoders (Load, Velocity, Peak Vel, Power, ROM, 1RM, Bryan Mann zones) | M1 | ORIGINAL_REQUEST.md R2 |
| 8 | Force Plate Test Type Schema | Schema and metrics for Force Plates ($F_z$, Peak Force, RFD, Impulse, RSI-mod, L/R Asymmetry) | M1 | ORIGINAL_REQUEST.md R2 |
| 9 | Block Accel Test Type Schema | Schema and metrics for IMU Block Starts (RT, Push Duration, $A_x, A_y, A_z$, Exit Velocity) | M1 | ORIGINAL_REQUEST.md R2 |
| 10 | Sprint Timing Test Type Schema | Schema and metrics for Sprint Photocells (Split distances, Cumulative times, Split velocities, $V_{max}$) | M1 | ORIGINAL_REQUEST.md R2 |
| 11 | 2D Kinematics Test Type Schema | Schema and metrics for Video Analysis (Joint angles for knee/hip/ankle/trunk, angular velocity) | M1 | ORIGINAL_REQUEST.md R2 |
| 12 | Jump Test Type Schema | Schema and metrics for Vertical Jumps (SJ, CMJ, DJ, Contact Time, Drop Height, EUR, RSI) | M1 | ORIGINAL_REQUEST.md R2 |
| 13 | Medicine Ball Test Type Schema | Schema for Medicine Ball Throws (Mass, Distance, Flight Time, Release Angle, Release Height, Push Time) | M1 | ORIGINAL_REQUEST.md R2 |
| 14 | Ballistic Range Trajectory Model | Closed-form calculation of $v_0$ from range $d$, release height $h_0$, angle $\theta$, and $g=9.81 m/s^2$ | M2 | ORIGINAL_REQUEST.md R2 |
| 15 | Flight-Time Velocity Solver | Calculates launch velocity $v_0$ and launch angle $\theta$ when measured flight time is provided | M2 | ORIGINAL_REQUEST.md R2 |
| 16 | Work-Energy Propulsive Power | Calculates $P_{mean} = \frac{m v_0^2}{2 t_{push}}$ and $P_{peak} = 2 P_{mean}$ with default $t_{push} = 0.18s$ | M2 | ORIGINAL_REQUEST.md R2 |
| 17 | Sayers & Harman Power Regressions | Empirical power formulas for medicine ball throws: $P_{peak, Harman} = 61.9 d + 36.0 m$, $P_{peak, Sayers}$ | M2 | ORIGINAL_REQUEST.md R2 |
| 18 | Raw Tabular Fallback (`GENERAL_TABULAR`) | Dynamic generic column fallback with column stats preview | M1 | ORIGINAL_REQUEST.md R2 |
| 19 | Two-Sheet Excel Workbook (.xlsx) | Generates .xlsx with Sheet 1 "Dati Prove" and Sheet 2 "Sintesi Biomeccanica & KPI" via ExcelJS/SheetJS | M4 | ORIGINAL_REQUEST.md R4 |
| 20 | Unlocked Cells & Coach Notes | Sheet 2 includes dedicated editable Coach Notes block with zero locked cells and zero passwords | M4 | ORIGINAL_REQUEST.md R4 |
| 21 | Medicine Ball File Auto-Detection | Added keyword detection in `DataParser.detectInstrumentType` in `js/parser.js` | M1 | ORIGINAL_REQUEST.md R2 |
| 22 | Backward-Compatible Orchestrator | `js/data-analysis.js` orchestrates new modules while preserving all 24 required tokens and methods | M5 | ORIGINAL_REQUEST.md R5 |
| 23 | Service Worker & Syntax Check Alignment | Bump cache to `t7-workout-v65` in `sw.js` and `test_check.py`, and check delimiter balance on analysis files | M5 | ORIGINAL_REQUEST.md R5 |
| 24 | E2E Testing Suite Verification | Complete 4-tier test suite in `tests/test_analysis_reactive_grid.js` verifying registry, physics, grid, and export | M6 | ORIGINAL_REQUEST.md R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | `TestRegistry` & Parser Instrument Detection | `js/analysis/test-registry.js` for all 8 test types + `js/parser.js` update for `MEDICINE_BALL` | none | PLANNED |
| M2 | Medicine Ball Ballistic Physics Engine | `js/analysis/medicine-ball-physics.js` + integration with `window.PhysicsEngine` | none | PLANNED |
| M3 | Reactive Grid & 250ms Debounced Live-Binding | `js/analysis/reactive-grid.js` table component with live-binding, toolbar, and safe fallbacks | M1, M2 | PLANNED |
| M4 | Coach-Centric Unlocked 2-Sheet Excel Exporter | `js/analysis/analysis-exporter.js` generating unlocked 2-sheet .xlsx with coach notes | M1 | PLANNED |
| M5 | Orchestrator Integration & System Alignment | `js/data-analysis.js` unified layout, `index.html` scripts, `sw.js` cache bump, `test_check.py` | M1, M2, M3, M4 | PLANNED |
| M6 | Final E2E Test Suite Pass & Adversarial Hardening | Verification of 100% tests in `tests/test_analysis_reactive_grid.js`, `test_check.py`, and adversarial stress | M5, TEST_READY | PLANNED |

## Interface Contracts

### `TestRegistry` (`js/analysis/test-registry.js`)
- `window.TestRegistry.register(testDefinition: Object): void`
- `window.TestRegistry.get(testId: String): Object`
- `window.TestRegistry.getAll(): Object`
- `window.TestRegistry.getColumnsFor(testId: String): Array<ColumnDefinition>`
- `window.TestRegistry.getSampleDataFor(testId: String): Array<Object>`
- `window.TestRegistry.mapRawHeaders(headers: Array<String>, testId: String): Object`

### `MedicineBallPhysics` (`js/analysis/medicine-ball-physics.js`)
- `window.MedicineBallPhysics.calculate(input: { mass: Number, distance: Number, flightTime?: Number, releaseAngle?: Number, releaseHeight?: Number, pushDuration?: Number }): Object`
  - Output: `{ exitVelocity: Number, exitVelocityKmh: Number, meanPower: Number, peakPower: Number, mechanicalWork: Number, harmanPower: Number, sayersPower: Number, trajectory: Array<{x: Number, y: Number}>, valid: Boolean }`
- Standard benchmark: `calculate({ mass: 3, distance: 10 })` yields `exitVelocity ≈ 9.9 m/s`, `meanPower ≈ 818 W`, `peakPower ≈ 1635 W`.

### `ReactiveGrid` (`js/analysis/reactive-grid.js`)
- `new window.ReactiveGrid({ containerId: String, testType: String, onChange: Function(records: Array, summary: Object), debounceMs: 250 })`
- Methods:
  - `setTestType(testType: String): void`
  - `setData(records: Array<Object>): void`
  - `getData(): Array<Object>`
  - `addRow(initialData?: Object): void`
  - `removeRow(index: Number): void`
  - `loadSampleData(): void`
  - `clear(): void`
  - `destroy(): void`

### `AnalysisExporter` (`js/analysis/analysis-exporter.js`)
- `window.AnalysisExporter.exportToExcel({ testType: String, athleteName: String, records: Array<Object>, kpiData: Object, coachNotes?: String, filename?: String }): Promise<Boolean>`
  - Generates 2-sheet workbook: Sheet 1 "Dati Prove", Sheet 2 "Sintesi Biomeccanica & KPI".
  - Strictly zero locked cells, zero passwords.

## Code Layout
```
js/
├── analysis/
│   ├── test-registry.js
│   ├── medicine-ball-physics.js
│   ├── reactive-grid.js
│   └── analysis-exporter.js
├── data-analysis.js
├── parser.js
├── physics-engine.js
└── views/
    └── analysis-view.js
tests/
├── test_analysis_reactive_grid.js
├── runner.html
└── ...
sw.js
test_check.py
```
