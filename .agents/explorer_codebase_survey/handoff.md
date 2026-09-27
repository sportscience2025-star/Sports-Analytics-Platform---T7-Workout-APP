# Handoff Report: Codebase Survey & Architectural Plan for Data Analysis Layer

**Role**: Codebase Data Analysis Explorer  
**Working Directory**: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_codebase_survey`  
**Date & UTC Timestamp**: 2026-09-11T11:15:00Z  
**Status**: Investigation Complete — Architectural Roadmap Ready for Implementation  

---

## 1. Observation

Direct examination of the codebase reveals the following concrete findings, line numbers, tool outputs, and execution results:

### 1.1 Monolithic Architecture of `js/data-analysis.js`
- **Path**: `e:/Nuove App Installate/App esercizi scienze motorie/js/data-analysis.js`
- **Size**: 2,712 lines, 176,541 bytes.
- **Top-level Plugins & Utilities**:
  - `neonGlowPlugin` (lines 10–34): Applies canvas shadow styling (`ctx.shadowColor = glowColor || '#00f0ff'`).
  - `glassTooltipHandler` (lines 37–84): Dynamically generates and positions `#chartjs-glass-tooltip` with glassmorphic backdrop.
  - `vbtZonesPlugin` (lines 87–147): Renders colored background bands on canvas for 4 VBT velocity zones: `"Forza Massima"` (< 0.50 m/s), `"Forza-Velocità"` (0.50–0.75 m/s), `"Velocità-Forza"` (0.75–1.00 m/s), `"Velocità Pura"` (> 1.00 m/s).
  - `extractMvtThresholdFromNLPQuery` (lines 149–198): Regex parser extracting MVT thresholds from natural language inputs.
- **Class Definition & Lifecycle**:
  - `window.DataAnalysisUI = class { ... }` (line 200).
  - Constructor (lines 201–211):
    ```javascript
    this.container = document.getElementById(containerId);
    this.chartInstance = null;
    this.powerCurveChart = null;
    this.jumpHeightChart = null;
    this.rsiChart = null;
    this.parseResult = null;
    this.selectedAthlete = null;
    this.selectedExercise = null;
    this._isRecalculating = false;
    ```
  - `cleanup()` (lines 213–239): Removes `#chartjs-glass-tooltip` and calls `.destroy()` on `this.chartInstance`, `this.powerCurveChart`, `this.jumpHeightChart`, `this.rsiChart`, and `this.customCharts` array.
- **Current Layout & Tab Separation** (lines 241–444):
  - Injects a 2-column grid (`grid-template-columns: 1fr 2fr; gap: 2rem;`).
  - Left column (`.analysis-input-panel`) currently forces a hard separation into two tabs (`.analysis-tabs`):
    - Tab 1: `<button class="analysis-tab-btn active" data-tab="upload">Carica File</button>` showing `#tab-upload-content` (dropzone `#vbt-drop-zone`, file input `#vbt-file-input`, `#ocr-progress`, `#nlp-section`).
    - Tab 2: `<button class="analysis-tab-btn" data-tab="manual">Inserimento Manuale</button>` showing `#tab-manual-content` (athlete input `#manual-athlete`, test type select `#manual-test-type`, `#manual-mvt-container`, manual table `#manual-vbt-tbody`, jump inputs `#manual-jump-container`, calculate button `#btn-manual-calculate`).
  - Right column (`.analysis-output-panel`): Contains `#filter-bar-container` (multi-athlete/exercise selector) and `#dashboard-container`.
- **Existing Dashboard Render Methods**:
  - `renderVBTDashboard` (lines 1283–1800): Renders `#vbt-chart`, `#power-curve-chart`, KPI cards (`1RM Stimato`, `Pmax`, `Lopt`, `Vopt`), F-V profile bias bar (`sfvpDisplay`, line 1367), round velocity steps table, Bryan Mann training zones table.
  - `renderSingleVBTPointDashboard` (lines 2106–2161): Handles 1-point VBT entry.
  - `renderJumpDashboard` (lines 1838–2104): Renders `#jump-heights-chart`, `#rsi-trials-chart`, EUR/RSI KPIs.
  - `renderForcePlateDashboard` (lines 2163–2273): Renders `#force-plate-chart`.
  - `renderAccelerometerDashboard` (lines 2275–2380): Renders `#accel-chart`.
  - `renderSprintDashboard` (lines 2382–2536): Renders `#sprint-chart` and split tables.
  - `renderKinematicsDashboard` (lines 2538–2666): Renders `#kinematics-chart`.
  - `renderGenericDataDashboard` (lines 2668–2709): Renders raw tabular preview.

### 1.2 View Integration in `js/views/analysis-view.js` & `index.html`
- **`js/views/analysis-view.js`**:
  - Lines 15–25: Injects `<div id="analysis-container"></div>` into `#app-container`, instantiates `state.analysisUI = new window.DataAnalysisUI('analysis-container')`, and invokes `state.analysisUI.render()`.
  - Lines 27–32: Calls `state.analysisUI.cleanup()` on view destruction.
- **`index.html` External CDN Libraries**:
  - Line 116: `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` (`window.Chart`).
  - Line 117: `<script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>` (`window.XLSX`).
  - Line 118: `<script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>` (`window.ExcelJS`).
  - Both SheetJS and ExcelJS are already available in the browser global scope.

### 1.3 `test_check.py` Hard Validation Requirements
Execution of `py test_check.py` confirms that `js/data-analysis.js` is verified against 24 mandatory string tokens (lines 8–33):
1. `vbtZonesPlugin`
2. `filter-athlete-select`
3. `filter-exercise-select`
4. `filter-exercise-pills`
5. `getAthletes`
6. `getExercisesForAthlete`
7. `renderFilterBar`
8. `selectAthleteAndExercise`
9. `syncManualInputsWithSelection`
10. `renderDashboardForSelection`
11. `generateQuickActions`
12. `executeNLPQuery`
13. `power-curve-chart`
14. `vbt-chart`
15. `#00f0ff`
16. `neonGlowPlugin`
17. `Pmax`
18. `Lopt`
19. `Vopt`
20. `Forza Massima`
21. `Forza-Velocità`
22. `Velocità-Forza`
23. `Velocità Pura`
24. `1RM Stimato`
Furthermore:
- Line 44: `if "t7-workout-v64" not in sw_code:` verifies the ServiceWorker cache version.
- Lines 50–79: Scans modular files (`logic_files`) for balanced delimiters (`{}` `()` `[]`). When `js/analysis/` is introduced, it should follow this exact verification pattern.

### 1.4 Node.js Test Harness Expectations (`tests/test_chart_verification.js`)
- `tests/test_chart_verification.js` evaluates `js/data-analysis.js` in a mocked DOM environment via:
  ```javascript
  const analysisCode = fs.readFileSync(analysisPath, 'utf8');
  eval(analysisCode);
  const DataAnalysisUI = global.window.DataAnalysisUI;
  const ui = new DataAnalysisUI('dashboard-container');
  ```
- Directly accesses `ui.chartInstance`, `ui.powerCurveChart`, `ui.jumpHeightChart`, and `ui.rsiChart`.
- Directly executes `ui.renderVBTDashboard(data, athlete, exercise)` and `ui.renderJumpDashboard(data, athlete)`.
- Tests pass cleanly (`ALL EMPIRICAL VERIFICATIONS COMPLETED`) as verified via `node tests/test_chart_verification.js`.

### 1.5 Current Instrument Coverage in `js/parser.js`
- Lines 625–739 of `js/parser.js` (`DataParser.detectInstrumentType`):
  - Supports 6 instruments: `FORCE_PLATE`, `BLOCK_ACCEL`, `SPRINT_TIMING`, `VIDEO_KINEMATICS`, `JUMP_TEST`, `VBT`, with `GENERAL_TABULAR` fallback.
  - Currently missing: `MEDICINE_BALL` (Test con Palla Medica).

---

## 2. Logic Chain

```
[Observation 1.1: 2712 lines in data-analysis.js + separate Carica File/Inserimento Manuale tabs]
      │
      ├─► [Observation 1.3: test_check.py requires 24 exact string tokens in data-analysis.js]
      ├─► [Observation 1.4: test_chart_verification.js evals data-analysis.js in Node.js]
      └─► [Reference Pattern: js/logic.js dynamically loads js/logic/*.js in Node and browser]
      │
      ▼
[Inference 1: Architectural Split]
We must modularize into `js/analysis/` (test-registry.js, reactive-grid.js, medicine-ball-physics.js, analysis-exporter.js) while preserving `js/data-analysis.js` as the central orchestrator that exposes window.DataAnalysisUI and all 24 required tokens and methods.

      │
      ├─► [Observation 1.1: Tab buttons #tab-upload-content vs #tab-manual-content]
      ├─► [Requirement R1: Unified layout with top Dropzone + Reactive Grid + Live Dashboard]
      └─► [Requirement R3: 250ms debounce on cell typing and row addition]
      │
      ▼
[Inference 2: Reactive Grid & Live Binding]
Eliminate the separate tabs in UI render. Create a unified layout:
- Top: Compact Dropzone with Test Type selector & Athlete selector.
- Center: Reactive Grid whose columns adapt polymorphically based on TestRegistry.
- Live-binding: 250ms debounced input listener updating KPI cards and Chart.js canvases automatically without a manual "Calcola" button.

      │
      ├─► [Observation 1.5: parser.js lacks MEDICINE_BALL detection]
      ├─► [Requirement R2: MEDICINE_BALL test with Sayers/Harman ballistic physics]
      └─► [Formula check: v0 = sqrt(g * R) = sqrt(9.81 * 10) = 9.90 m/s for 3kg @ 10m]
      │
      ▼
[Inference 3: Medicine Ball Physics Module]
Implement `js/analysis/medicine-ball-physics.js` providing closed-form ballistic kinematics:
- Minimal input (weight, distance) -> v0 = sqrt(g * R) / sin(2*theta)^0.5 (~9.9 m/s), Pmean = (0.5 * m * v0^2) / 0.18s.
- Full input (flight time, launch angle) -> exact 2D projectile equations.
- Add MEDICINE_BALL to TestRegistry and to DataParser.detectInstrumentType.

      │
      ├─► [Observation 1.2: window.ExcelJS & window.XLSX both present in index.html]
      ├─► [Requirement R4: 2-sheet unlocked .xlsx export ("Dati Prove" & "Sintesi Biomeccanica & KPI")]
      └─► [AGENTS.md Rule: Zero locked cells, zero passwords, clear tabular layout]
      │
      ▼
[Inference 4: Analysis Exporter Module]
Implement `js/analysis/analysis-exporter.js` generating a 2-sheet workbook via ExcelJS (primary) and SheetJS (fallback), attaching an "Esporta Foglio Excel (.xlsx)" button to the reactive grid toolbar.
```

---

## 3. Caveats

1. **Node.js Test Runner Compatibility**:
   `test_chart_verification.js` and `test_vbt_fallbacks.js` load `js/data-analysis.js` using `eval(fs.readFileSync(analysisPath, 'utf8'))` inside Node.js without `index.html`. Therefore, `js/data-analysis.js` MUST include the Node.js sub-module loader (pattern from `js/logic.js` lines 21–65) so that submodules in `js/analysis/` are synchronously loaded if evaluated outside a browser context.
2. **Backward Compatibility Tokens**:
   `test_check.py` checks for the literal presence of strings (e.g. `vbtZonesPlugin`, `Pmax`, `Lopt`, `Vopt`, `1RM Stimato`, `renderFilterBar`, `filter-athlete-select`). These strings and methods must remain present in `js/data-analysis.js`.
3. **Canvas Element Mocking in Tests**:
   `tests/test_vbt_fallbacks.js` confirmed a minor pre-existing mock issue (`ctx2.createLinearGradient is not a function`). Any new canvas or chart interactions must be guarded with `if (typeof ctx.createLinearGradient === 'function')` or fall back safely to solid color fills, preventing test failures in lightweight Node test environments.
4. **No Emojis Rule**:
   Per project rules in `AGENTS.md` ("Emoji: Non utilizzare emoji, figure o immagini in modo spontaneo..."), all UI labels, button texts, table headers, and badges must be clean text without spontaneous emojis.

---

## 4. Conclusion & Architectural Roadmap

### 4.1 Recommended Folder & File Structure
```
js/
├── analysis/
│   ├── test-registry.js          # Registry defining schemas, columns, validation, sample data for all 8 test types
│   ├── medicine-ball-physics.js  # Ballistic equations (Sayers/Harman) for medicine ball throw test
│   ├── reactive-grid.js          # Editable spreadsheet grid, polymorphic columns, row add/remove, 250ms debouncer
│   └── analysis-exporter.js      # 2-sheet unlocked Excel (.xlsx) generator using ExcelJS / SheetJS
├── data-analysis.js              # Orchestrator: window.DataAnalysisUI, plugins, backward-compatibility facade
└── views/
    └── analysis-view.js          # Router view connector (no changes required)
```

### 4.2 Module Specifications

#### Module 1: `js/analysis/test-registry.js`
- **Global Object**: `window.TestRegistry`
- **8 Supported Tests**:
  1. `VBT`: Load (kg), Propulsive Velocity (m/s), Peak Velocity (m/s), Power (W), ROM (cm).
  2. `FORCE_PLATE`: Fz (N), Peak Force (N), RFD (N/s), Impulse (N·s), RSI-mod.
  3. `BLOCK_ACCEL`: Horizontal Accel (m/s²), Accel X, Accel Y, Reaction Time (s), Push Duration (s).
  4. `SPRINT_TIMING`: Split 5m (s), 10m (s), 20m (s), 30m (s), 60m (s), Cumulative Time (s).
  5. `VIDEO_KINEMATICS`: Knee Angle (°), Hip Angle (°), Ankle Angle (°), Trunk Angle (°), Angular Velocity (°/s).
  6. `JUMP_TEST`: Jump Height (cm), Contact Time (ms), Drop Height (cm), RSI, EUR.
  7. `MEDICINE_BALL` (NEW): Ball Weight (kg), Throw Distance (m), Flight Time (s), Release Angle (°), Estimated Velocity (m/s), Estimated Power (W).
  8. `GENERAL_TABULAR`: Dynamic generic columns with raw file data fallback.
- **Methods**:
  - `TestRegistry.register(definition)`
  - `TestRegistry.get(testId)`
  - `TestRegistry.getAll()`
  - `TestRegistry.getColumnsFor(testId)`
  - `TestRegistry.getSampleDataFor(testId)`

#### Module 2: `js/analysis/medicine-ball-physics.js`
- **Global Object**: `window.MedicineBallPhysics` (also exposed to `window.PhysicsEngine.calculateMedicineBall`)
- **Physics Equations**:
  - Standard ballistic release: default $\theta = 45^\circ$, $h_0 = 1.0\text{ m}$, $\Delta t_{push} = 0.18\text{ s}$, $g = 9.81\text{ m/s}^2$.
  - Minimal case ($m = 3\text{ kg}$, $R = 10\text{ m}$):
    $$v_0 = \sqrt{\frac{g \cdot R}{\sin(2\theta)}} = \sqrt{9.81 \times 10} \approx 9.9045\text{ m/s}$$
    $$E_k = \frac{1}{2} m v_0^2 = 0.5 \times 3 \times 98.1 = 147.15\text{ J}$$
    $$P_{mean} = \frac{E_k}{\Delta t_{push}} = \frac{147.15}{0.18} \approx 817.5\text{ W}$$
    $$P_{peak} \approx 2 \times P_{mean} \approx 1635\text{ W}$$
  - Full case (with measured $t_{flight}$ and/or $\theta$):
    $$v_{0x} = \frac{R}{t_{flight}}, \quad v_{0y} = \frac{\frac{1}{2} g t_{flight}^2 - h_0}{t_{flight}}, \quad v_0 = \sqrt{v_{0x}^2 + v_{0y}^2}$$
  - Defensive fallback: Checks `Number.isFinite`, rejects non-positive mass/distance, guarantees no `NaN` or `undefined`.

#### Module 3: `js/analysis/reactive-grid.js`
- **Global Object**: `window.ReactiveGrid`
- **Features**:
  - Renders interactive `<table>` inside `#reactive-grid-container`.
  - Headers and input cell types dynamically generated from `TestRegistry.getColumnsFor(activeTestType)`.
  - Action toolbar:
    - `[+ Aggiungi Prova]` button.
    - `[Inserisci Dati Esempio]` button (fills standard literature test trials).
    - `[Pulisci]` button.
    - Row-level delete `[Elimina]` button.
  - 250ms Debounced Event Dispatch:
    ```javascript
    const debounce = (fn, delay = 250) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };
    ```
  - Graceful partial data handling: If only 1 row is valid, emits a non-blocking `data-partial` status allowing single-point KPI rendering without crashing or throwing errors.

#### Module 4: `js/analysis/analysis-exporter.js`
- **Global Object**: `window.AnalysisExporter`
- **Features**:
  - Button placed in toolbar: `Esporta Foglio Excel (.xlsx)`.
  - Sheet 1: `"Dati Prove"` — Full table of test trials with columns, units, and raw numbers. Fully unlocked (`locked: false` on all cells).
  - Sheet 2: `"Sintesi Biomeccanica & KPI"` — Summary metrics (mean, peak, 1RM, F0, Pmax, EUR, RSI, v0, etc.), test date, athlete name, plus dedicated unlocked notes block for coach notes.
  - Zero password protection, zero locked cells.
  - Dual library support: uses `window.ExcelJS` when present; falls back to `window.XLSX` (`xlsx.full.min.js`).

#### Module 5: Refactored `js/data-analysis.js` (Orchestrator)
- Retains `window.DataAnalysisUI` class.
- Includes the Node.js loader pattern to load `js/analysis/*.js` in non-browser environments.
- Replaces the old 2-tab DOM (`.analysis-tabs`, `#tab-upload-content`, `#tab-manual-content`) with the seamless unified view:
  ```
  +----------------------------------------------------------------------+
  | TOP BAR: [Dropzone Compatta] | [Tipo Test Select] | [Atleta Select]  |
  +----------------------------------------------------------------------+
  | REACTIVE GRID: Polymorphic Table (Columns adapt to selected test)    |
  | Toolbar: [+ Aggiungi Prova] | [Dati Esempio] | [Esporta Excel .xlsx] |
  +----------------------------------------------------------------------+
  | LIVE DASHBOARD (Chart.js + KPI Cards) - Auto-updated with 250ms debounce |
  +----------------------------------------------------------------------+
  ```
- File drag & drop: When a file is dropped or selected, `DataParser.parseExcel` auto-detects instrument type, switches the selector, and immediately populates the reactive grid with extracted rows.
- Preserves all required backward compatibility tokens, plugins, and test methods.

### 4.3 Integration Steps for Implementation Agents
1. Create `js/analysis/` directory with 4 modules.
2. Update `js/parser.js` to add `MEDICINE_BALL` keyword detection (`ball`, `palla`, `lancio`, `throw`, `peso_palla`).
3. Refactor `js/data-analysis.js` to orchestrate the new layout while retaining all 24 required tokens and public methods.
4. Add script tags in `index.html`:
   ```html
   <script src="js/analysis/test-registry.js"></script>
   <script src="js/analysis/medicine-ball-physics.js"></script>
   <script src="js/analysis/reactive-grid.js"></script>
   <script src="js/analysis/analysis-exporter.js"></script>
   <script src="js/data-analysis.js"></script>
   ```
5. Update `sw.js`:
   - Add `./js/analysis/*.js` to `CORE_ASSETS`.
   - Bump cache name: `t7-workout-v64` -> `t7-workout-v65`.
6. Update `test_check.py`:
   - Update cache check to `t7-workout-v65`.
   - Add `js/analysis/*.js` to syntax delimiter check list.
7. Create test suite `tests/test_analysis_reactive_grid.js` validating the registry, medicine ball ballistic formulas, 250ms debounce, and Excel generation.

---

## 5. Verification Method

To independently verify this survey and future implementations:

1. **Syntax & Delimiter Validation**:
   ```powershell
   py test_check.py
   ```
   *Expected outcome*: Exits with code 0 ("All syntax checks passed.").
2. **Chart.js & Memory Verification**:
   ```powershell
   node tests/test_chart_verification.js
   ```
   *Expected outcome*: Exits with code 0 (All 5 empirical test suites pass).
3. **Multi-Instrument Excel Parser Test**:
   ```powershell
   node tests/test_multi_instrument_excel.js
   ```
   *Expected outcome*: Exits with code 0 (All 9 tests pass).
4. **New Dedicated Suite for Reactive Grid & Medicine Ball Physics**:
   ```powershell
   node tests/test_analysis_reactive_grid.js
   ```
   *Expected outcome*: Exits with code 0, confirming:
   - `MEDICINE_BALL` ballistic calculations: 3kg @ 10m yields $v_0 \approx 9.9\text{ m/s}$ and $P_{mean} \approx 818\text{ W}$.
   - Reactive grid event dispatching and 250ms debounce.
   - Excel export producing valid 2-sheet structure with zero cell locks.

**Invalidation Conditions**:
- Any modification that removes or alters the 24 required tokens in `js/data-analysis.js` without updating `test_check.py`.
- Any modification causing unmatched brackets or delimiters in `.js` files.
- Modifying files without bumping `CACHE_NAME` in `sw.js` and syncing `test_check.py`.
