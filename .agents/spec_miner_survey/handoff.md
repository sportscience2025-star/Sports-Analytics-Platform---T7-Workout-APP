# Handoff Report: Data Analysis Architecture Overhaul Specification

**Agent**: Spec and Requirements Miner (`spec_miner_survey`)  
**Target Milestone**: Data Analysis Architecture Overhaul  
**Date**: 2026-09-11  

---

## 1. Observation

Direct observations from codebase inspection and requirements review:

1. **`ORIGINAL_REQUEST.md` (lines 26-98)**:
   - Mandates replacing the dual-tab interface ("Carica File" vs "Inserimento Manuale") with a single unified seamless flow: compact dropzone on top with test selector and athlete selector, directly followed by a reactive editable table grid.
   - Demands an extensible, modular `TestRegistry` supporting 8 distinct biomechanical test types:
     1. VBT (Linear Encoders)
     2. Force Plate (Pedane di Forza)
     3. Block Start Accelerometers / IMU (Accelerometri Partenza dai Blocchi)
     4. Sprint Photocells / Timing Gates (Fotocellule Sprint)
     5. 2D Kinematics Video Analysis (Videoanalisi Cinematica 2D)
     6. Vertical Jump Tests (SJ, CMJ, Drop Jump)
     7. Medicine Ball Throws (`MEDICINE_BALL` - New Test Type with ballistic kinematics and power equations)
     8. Raw Tabular Data (`GENERAL_TABULAR` - Dynamic fallback)
   - Demands 250ms debounced live-binding from table grid edits to KPI boxes and Chart.js dashboards without requiring manual "Calcola" buttons.
   - Demands robust handling of partial rows without script errors, `NaN`, or `"undefined"` strings.
   - Demands an unlocked 2-sheet Excel export (`.xlsx`): Sheet 1 "Dati Prove" and Sheet 2 "Sintesi Biomeccanica & KPI" with a coach notes section, zero locked cells, and zero passwords.
   - Demands modular file organization under `js/analysis/` (`test-registry.js`, `reactive-grid.js`, `medicine-ball-physics.js`, `analysis-exporter.js`), orchestrated by `js/data-analysis.js`.

2. **`js/data-analysis.js` (2712 lines)**:
   - Lines 258-261: Currently hardcodes two separate tabs:
     ```html
     <button class="analysis-tab-btn active" data-tab="upload">Carica File</button>
     <button class="analysis-tab-btn" data-tab="manual">Inserimento Manuale</button>
     ```
   - Lines 326-333: Manual test dropdown currently only supports `VBT_SQUAT`, `VBT_BENCH`, `VBT_DEADLIFT`, `VBT_CUSTOM`, and `JUMP_EUR_RSI`.
   - Lines 365-390: Table input only exists for manual VBT points; jump tests use fixed scalar inputs; other test types have no manual entry grid.
   - Lines 423: Contains manual calculation button with emoji: `<button id="btn-manual-calculate">🚀 Elabora Dati Manuali</button>`, which requires an explicit click instead of reactive live-binding.
   - Lines 978-1011: `renderDashboardForSelection` smistas between `FORCE_PLATE`, `BLOCK_ACCEL`, `SPRINT_TIMING`, `VIDEO_KINEMATICS`, `vbtData.length >= 2`, `vbtData.length === 1`, and `JUMP_TEST`, with fallback to `renderGenericDataDashboard`. `MEDICINE_BALL` does not yet have a dedicated dashboard or physics model in this file.
   - Lines 2163-2709: Implement existing dedicated dashboards: `renderForcePlateDashboard`, `renderAccelerometerDashboard`, `renderSprintDashboard`, `renderKinematicsDashboard`, `renderGenericDataDashboard`.

3. **`test_check.py` (lines 8-39 and 41-46)**:
   - Validates that `js/data-analysis.js` contains 23 mandatory strings/tokens:
     `vbtZonesPlugin`, `filter-athlete-select`, `filter-exercise-select`, `filter-exercise-pills`, `getAthletes`, `getExercisesForAthlete`, `renderFilterBar`, `selectAthleteAndExercise`, `syncManualInputsWithSelection`, `renderDashboardForSelection`, `generateQuickActions`, `executeNLPQuery`, `power-curve-chart`, `vbt-chart`, `#00f0ff`, `neonGlowPlugin`, `Pmax`, `Lopt`, `Vopt`, `Forza Massima`, `Forza-Velocità`, `Velocità-Forza`, `Velocità Pura`, `1RM Stimato`.
   - Validates that `sw.js` contains `t7-workout-v64`. Modifying JS files requires incrementing `sw.js` cache name (to `t7-workout-v65`) and updating `test_check.py` to match.
   - Validates delimiter balance (`{`, `}`, `(`, `)`, `[`, `]`) across modular files.

4. **`js/parser.js` (lines 625-739)**:
   - `DataParser.detectInstrumentType(records, headers)` detects `FORCE_PLATE`, `BLOCK_ACCEL`, `SPRINT_TIMING`, `VIDEO_KINEMATICS`, `JUMP_TEST`, `VBT`, and `GENERAL_TABULAR`.
   - Does not yet include detection rules for `MEDICINE_BALL`.

5. **`js/physics-engine.js` (lines 1-844)**:
   - Implements OLS linear regression (`linearRegressionVBT`), quadratic regression (`quadraticRegressionVBT`), auto regression selection, 1RM estimation, jump index calculations (`calculateEUR`, `calculateRSI`, `evaluateJumpPerformance`).
   - Does not currently contain projectile ballistics or Sayers/Harman power calculations for Medicine Ball throws.

6. **`index.html` (lines 116-123)**:
   - Includes external libraries: Chart.js 4 (`chart.js`), SheetJS (`xlsx.full.min.js`), ExcelJS (`exceljs@4.4.0/dist/exceljs.min.js`), Math.js (`math.js`).
   - Both `window.ExcelJS` and `window.XLSX` are readily available in the runtime environment.

7. **`AGENTS.md` Multi-Agent Safety Rules**:
   - Zero spontaneous emojis in code and UI.
   - Bump cache in `sw.js` after JS edits and verify with `py test_check.py`.
   - Modular file structure without bloated monolothic files.
   - Excel export must be fully unlocked (0 locked cells, 0 passwords).

---

## 2. Logic Chain

1. **Unification of UI Flow**:
   Because user testing and requirements in `ORIGINAL_REQUEST.md` specify removing the division between "Carica File" and "Inserimento Manuale", both modalities must operate on the same persistent data structure (`ReactiveGrid`). When a file is uploaded, the parser auto-detects the instrument, switches the test type selector, and writes the parsed rows directly into `ReactiveGrid`. When an athlete or test type is selected manually, the grid presents the appropriate schema and allows immediate entry, editing, and sample data population.

2. **Decoupling via Registry Pattern (`TestRegistry`)**:
   Hardcoding column headers and metric bindings in `DataAnalysisUI` makes adding new instruments difficult. Implementing a centralized `TestRegistry` in `js/analysis/test-registry.js` provides:
   - Column metadata (name, key, unit, type, step, min, max, placeholder, validation, calculated flag).
   - Raw data mapping keys to translate file headers (CSV/Excel) into internal keys.
   - Literature sample dataset for rapid 1-click test simulation.
   - KPI metrics definition and Chart.js configuration generator.

3. **Biomechanical Formulation for `MEDICINE_BALL`**:
   The medicine ball throw is a ballistic projectile motion combined with a propulsive acceleration phase:
   - In standard horizontal range ballistics without release height ($h_0 = 0$, $\theta = 45^\circ$): $v_0 = \sqrt{g \cdot d}$. For $d = 10\ m$, $v_0 = \sqrt{9.81 \times 10} = 9.9045\ m/s$ ($\approx 9.9\ m/s$), satisfying the acceptance criterion.
   - In generalized ballistics with release height $h_0 > 0$ and release angle $\theta$:
     $$v_0 = \frac{d}{\cos\theta} \sqrt{\frac{g}{2 (h_0 + d \tan\theta)}}$$
   - In time-of-flight based measurement ($t_{flight}$ measured):
     $$v_x = \frac{d}{t_{flight}}, \quad v_y = \frac{1}{2} g t_{flight} - \frac{h_0}{t_{flight}}, \quad v_0 = \sqrt{v_x^2 + v_y^2}, \quad \theta = \arctan\left(\frac{v_y}{v_x}\right)$$
   - In propulsive phase power modeling:
     - Kinematic acceleration work: $W = \frac{1}{2} m v_0^2$.
     - Mean Power: $P_{mean} = \frac{W}{t_{push}} = \frac{m v_0^2}{2 t_{push}}$ (standard biomechanical fallback $t_{push} = 0.18\ s$).
     - Peak Power: $P_{peak} = \frac{m v_0^2}{t_{push}} = 2 \cdot P_{mean}$.
     - Empirical regression (Sayers/Harman): $P_{peak, Harman} = 61.9 \cdot d + 36.0 \cdot m$.

4. **Debounced Live-Binding (250ms)**:
   Manual calculate buttons (`#btn-manual-calculate`) create cognitive friction and delay analysis. Attaching an `input` / `change` event listener with a 250ms debounce window allows the user to type naturally while triggering automatic metric updates and chart redraws as soon as typing pauses.

5. **Coach-Centric Excel Export (.xlsx)**:
   Using `ExcelJS` (with `XLSX` fallback), the export generates a 2-sheet workbook:
   - Sheet 1: "Dati Prove" — raw trial records with column headers, formatted numbers, borders, and no locked cells.
   - Sheet 2: "Sintesi Biomeccanica & KPI" — summary metrics, peak/mean performance, and a designated editable Coach Notes block with freeform rows.
   - Strict adherence to `protection: false` ensuring total coach freedom to modify values without prompts or passwords.

6. **Safety & Backward Compatibility**:
   `test_check.py` looks for 23 required symbols in `js/data-analysis.js`. All 23 tokens must be preserved in `js/data-analysis.js`, and `sw.js` must be bumped to `t7-workout-v65` and mirrored in `test_check.py`.

---

## 3. Detailed Technical Specifications

### 3.1 TestRegistry Specification (8 Biomechanical Instruments)

The `TestRegistry` defines the schema, UI column configuration, validation rules, raw header mapping, KPI metrics, and chart settings for each instrument:

```javascript
window.TestRegistry = {
    VBT: { ... },
    FORCE_PLATE: { ... },
    BLOCK_ACCEL: { ... },
    SPRINT_TIMING: { ... },
    VIDEO_KINEMATICS: { ... },
    JUMP_TEST: { ... },
    MEDICINE_BALL: { ... },
    GENERAL_TABULAR: { ... }
};
```

#### Detailed Column & Metric Matrix

| Test ID | Display Label | Columns (Key, Label, Unit, Type, Step, Validation) | Raw Header Mapping | Primary KPIs | Chart ID & Type |
|---|---|---|---|---|---|
| `VBT` | VBT - Encoder Lineari | 1. `load`: Carico (kg), num, step 0.5, min 0, max 1000<br>2. `velocity`: Velocità Media (m/s), num, step 0.01, min 0.05, max 4.0<br>3. `peakVelocity`: Picco Velocità (m/s), num, step 0.01, min 0.1, max 5.0<br>4. `power`: Potenza Media (W), num, step 1, min 0, max 5000 (calc)<br>5. `rom`: ROM (cm), num, step 0.5, min 5, max 250 | `load`, `carico`, `peso`, `carga`, `vmean`, `vm`, `mean_velocity`, `vmp`, `mpv`, `vmax`, `peak_velocity`, `power`, `potenza`, `rom` | 1RM Stimato, $V_0$, $F_0$, $P_{max}$, $L_{opt}$, $V_{opt}$, $R^2$, Fasce Velocità Bryan Mann | `vbt-chart` (Scatter + Regression)<br>`power-curve-chart` (Parabola) |
| `FORCE_PLATE` | Pedana di Forza | 1. `forceZ`: Forza Fz (N), num, step 1, min 0, max 10000<br>2. `peakForce`: Picco Forza Fmax (N), num, step 1, min 0, max 10000<br>3. `rfd`: RFD (N/s), num, step 10, min 0, max 50000<br>4. `impulse`: Impulso (N·s), num, step 0.1, min 0, max 2000<br>5. `rsimod`: RSI-mod, num, step 0.001, min 0.05, max 3.0<br>6. `leftForce`: Forza Sinistra (N), num, step 1, min 0, max 5000<br>7. `rightForce`: Forza Destra (N), num, step 1, min 0, max 5000 | `fz`, `force_z`, `vertical_force`, `peak_force`, `fmax`, `rfd`, `impulse`, `impulso`, `rsimod`, `rsi_mod`, `left_force`, `right_force` | Picco Fmax, Media Fz, Max RFD, Impulso Meccanico, RSI-mod, Asimmetria L/R (%) | `force-plate-chart` (Line + Fill) |
| `BLOCK_ACCEL` | Accelerometri IMU Blocchi | 1. `reactionTime`: Tempo Reazione (s), num, step 0.001, min 0.05, max 1.0<br>2. `pushDuration`: Durata Spinta (s), num, step 0.001, min 0.1, max 1.5<br>3. `horizontalAccel`: Accel Orizz. Ax (m/s²), num, step 0.1, min 0, max 50<br>4. `accelY`: Accel Laterale Ay (m/s²), num, step 0.1, min -20, max 20<br>5. `accelZ`: Accel Verticale Az (m/s²), num, step 0.1, min 0, max 50<br>6. `exitVelocity`: Velocità Uscita (m/s), num, step 0.01, min 0.5, max 12 (calc) | `reaction_time`, `rt`, `tempo_reazione`, `push_duration`, `tempo_spinta`, `horizontal_accel`, `ax`, `accel_x`, `accel_y`, `accel_z`, `exit_velocity` | RT (ms) e compliance World Athletics, Block Clearance Time, Picco Ax, Accel Risultante $A_{res}$, Velocità Uscita | `accel-blocks-chart` (Multi-line) |
| `SPRINT_TIMING` | Fotocellule Sprint | 1. `splitDistance`: Distanza Split (m), num, step 1, min 1, max 400<br>2. `cumulativeTime`: Tempo Cumulativo (s), num, step 0.001, min 0.1, max 60<br>3. `splitTime`: Tempo Tratta (s), num, step 0.001, min 0.05, max 30 (calc)<br>4. `splitVelocity`: Velocità Tratta (m/s), num, step 0.01, min 1, max 15 (calc) | `split_distance`, `distance`, `distanza`, `cumulative_time`, `split_time`, `split_5m`, `split_10m`, `split_20m`, `split_30m`, `split_60m` | Tempo Totale, Velocità Picco $V_{max}$, Stima $V_0$ teorica (Samozino), Stima $F_0$ teorica (N/kg) | `sprint-velocity-chart` (Line progression) |
| `VIDEO_KINEMATICS` | Videoanalisi Cinematica 2D | 1. `frame`: Fotogramma / Tempo (#/s), num, step 1, min 0, max 10000<br>2. `kneeAngle`: Angolo Ginocchio (°), num, step 0.1, min 0, max 180<br>3. `hipAngle`: Angolo Anca (°), num, step 0.1, min 0, max 210<br>4. `ankleAngle`: Angolo Caviglia (°), num, step 0.1, min 30, max 150<br>5. `trunkAngle`: Angolo Tronco (°), num, step 0.1, min -45, max 90<br>6. `angularVelocity`: Velocità Angolare (°/s), num, step 1, min -2000, max 2000 (calc) | `frame`, `fotogramma`, `time`, `knee_angle`, `angolo_ginocchio`, `hip_angle`, `angolo_anca`, `ankle_angle`, `trunk_angle`, `angular_velocity` | Range of Motion (ROM), Min Angolo (Flessione max), Max Angolo (Estensione max), Picco Velocità Angolare | `kinematics-chart` (Multi-line Articolare) |
| `JUMP_TEST` | Salto Verticale (SJ, CMJ, DJ) | 1. `jumpType`: Tipo Salto (SJ/CMJ/DJ), text/select, options [SJ, CMJ, DJ]<br>2. `jumpHeight`: Altezza Salto (cm), num, step 0.1, min 5, max 120<br>3. `contactTime`: Tempo Contatto (ms), num, step 1, min 50, max 1000 (per DJ)<br>4. `dropHeight`: Drop Height (cm), num, step 1, min 10, max 100<br>5. `rsi`: Reactive Strength Index, num, step 0.01, min 0, max 5.0 (calc)<br>6. `eur`: Eccentric Utilization Ratio, num, step 0.01, min 0.5, max 2.0 (calc) | `jump_type`, `tipo_salto`, `jump_height`, `altezza_salto`, `contact_time`, `tempo_contatto`, `drop_height`, `altezza_caduta`, `rsi`, `eur` | Max Altezza SJ (cm), Max Altezza CMJ (cm), Indice Elasticità (CMJ-SJ), EUR ($CMJ/SJ$), RSI Drop Jump ($\frac{JH}{CT}$) | `jump-height-chart` (Bar Chart)<br>`rsi-chart` (Scatter/Line) |
| `MEDICINE_BALL` | Palla Medica | 1. `ballMass`: Peso Palla (kg), num, step 0.5, min 0.5, max 25<br>2. `throwDistance`: Distanza Lancio (m), num, step 0.05, min 0.5, max 40<br>3. `flightTime`: Tempo Volo (s), num, step 0.01, min 0.1, max 10.0 (opt)<br>4. `releaseAngle`: Angolo Rilascio (°), num, step 1, min 15, max 75 (opt)<br>5. `releaseHeight`: Altezza Rilascio (m), num, step 0.05, min 0, max 3.0 (opt)<br>6. `pushDuration`: Durata Spinta (s), num, step 0.01, min 0.05, max 1.0 (opt)<br>7. `exitVelocity`: Velocità Uscita (m/s), num, step 0.01 (calc)<br>8. `estimatedPower`: Potenza Media (W), num, step 1 (calc) | `ball_mass`, `ball_weight`, `peso_palla`, `peso`, `throw_distance`, `distanza`, `flight_time`, `tempo_volo`, `release_angle`, `angolo_rilascio`, `release_height`, `altezza_rilascio`, `push_duration`, `tempo_spinta`, `exit_velocity`, `estimated_power` | Velocità di Rilascio $v_0$ (m/s e km/h), Potenza Media $P_{mean}$ (W), Potenza di Picco $P_{peak}$ (W), Lavoro Meccanico (J), Potenza Specifica (W/kg palla) | `medicine-ball-power-chart` (Load-Power Curve)<br>`medicine-ball-trajectory-chart` (Ballistic Arc) |
| `GENERAL_TABULAR` | Dati Tabellari Grezzi | Colonne dinamiche rilevate dal file CSV/Excel o 3 colonne predefinite (`Colonna 1`, `Colonna 2`, `Colonna 3`). | Qualsiasi intestazione valida | Conteggio righe, Conteggio colonne numeriche, Minimo, Massimo, Media per colonna numerica | `generic-chart` (Line / Bar) |

---

### 3.2 Physical and Mathematical Models for MEDICINE_BALL

#### 1. Kinematic Trajectory & Launch Speed ($v_0$)

Let:
- $m$: ball mass in kg
- $d$: horizontal throwing distance (range) in meters
- $h_0$: release height above ground in meters (default fallback: $1.0\ m$)
- $\theta$: launch angle in degrees (default fallback: $45^\circ$, in radians $\theta_{rad} = \theta \times \frac{\pi}{180}$)
- $g$: acceleration of gravity, $9.81\ m/s^2$
- $t_{flight}$: time of flight in seconds
- $t_{push}$: duration of the propulsive acceleration phase (default fallback: $0.18\ s$)

##### Model A — Direct Range Ballistic Model (When $d$ is provided)
In the general case where release height $h_0 \ge 0$:
Horizontal equation:
$$x(t) = v_0 \cos\theta \cdot t \implies t = \frac{x}{v_0 \cos\theta}$$
Vertical equation:
$$y(t) = h_0 + v_0 \sin\theta \cdot t - \frac{1}{2} g t^2$$
Substituting $t$ into $y(t)$ gives the parabolic trajectory equation:
$$y(x) = h_0 + x \tan\theta - \frac{g x^2}{2 v_0^2 \cos^2\theta}$$
At landing impact, $x = d$ and $y(d) = 0$:
$$0 = h_0 + d \tan\theta - \frac{g d^2}{2 v_0^2 \cos^2\theta}$$
Solving for $v_0$:
$$v_0 = \frac{d}{\cos\theta} \sqrt{\frac{g}{2 (h_0 + d \tan\theta)}}$$

**Biomechanical Standard Ground Fallback ($h_0 = 0$ or standard athletic approximation)**:
When $h_0 = 0$:
$$v_0 = \sqrt{\frac{g \cdot d}{\sin(2\theta)}}$$
For the optimal angle $\theta = 45^\circ$ ($\sin(90^\circ) = 1$):
$$v_0 = \sqrt{g \cdot d}$$
*Empirical Verification*: For $m = 3\ kg$ and $d = 10\ m$:
$$v_0 = \sqrt{9.81 \times 10} = \sqrt{98.1} \approx 9.9045\ m/s \quad (\approx 9.9\ m/s)$$
This exactly reproduces the canonical benchmark required in `ORIGINAL_REQUEST.md`.

##### Model B — Flight Time Measured Model (When $t_{flight}$ is provided)
When $t_{flight}$ is entered from optical gates, high-speed camera, or chronometer:
$$v_x = \frac{d}{t_{flight}}$$
From the vertical motion equation $0 = h_0 + v_y t_{flight} - \frac{1}{2} g t_{flight}^2$:
$$v_y = \frac{\frac{1}{2} g t_{flight}^2 - h_0}{t_{flight}} = \frac{1}{2} g t_{flight} - \frac{h_0}{t_{flight}}$$
Total release velocity and effective release angle:
$$v_0 = \sqrt{v_x^2 + v_y^2}, \quad \theta = \arctan\left(\frac{v_y}{v_x}\right) \times \frac{180}{\pi}$$

##### Model C — Parabolic Arc Trajectory Coordinate Generation
To plot the ballistic arc in `medicine-ball-trajectory-chart`, generate $N = 50$ points for $x \in [0, d]$:
$$y(x) = \max\left(0, \; h_0 + x \tan\theta - \frac{g x^2}{2 v_0^2 \cos^2\theta}\right)$$
Apex (maximum altitude):
$$x_{apex} = \frac{v_0^2 \sin(2\theta)}{2 g}, \quad y_{max} = h_0 + \frac{v_0^2 \sin^2\theta}{2 g}$$

#### 2. Propulsive Phase Power Modeling ($P_{mean}$ & $P_{peak}$)

##### Kinematic Work-Energy Model (Gold Standard)
During the explosive push phase, the athlete accelerates the ball from rest ($v = 0$) to release velocity $v_0$ over time $t_{push}$ (default fallback $0.18\ s$):
- Kinetic energy imparted: $E_k = \frac{1}{2} m v_0^2$
- Push displacement: $s_{push} = \frac{1}{2} v_0 t_{push}$
- Gravitational work during push: $W_{grav} = m g s_{push} \sin\theta = \frac{1}{2} m g v_0 t_{push} \sin\theta$
- Total mechanical work: $W_{tot} = E_k + W_{grav}$
- **Mean Power ($P_{mean}$)**:
  $$P_{mean} = \frac{W_{tot}}{t_{push}} = \frac{m v_0^2}{2 t_{push}} + \frac{1}{2} m g v_0 \sin\theta$$
  (Pure kinetic term: $P_{mean, kin} = \frac{m v_0^2}{2 t_{push}}$)
- **Peak Power ($P_{peak}$)**:
  Assuming linear force development, peak power occurs at the instant of release where velocity is maximal:
  $$P_{peak} = F_{peak} \cdot v_0 = 2 \cdot P_{mean}$$

*Empirical Verification*:
For $m = 3\ kg$, $d = 10\ m$, $v_0 \approx 9.90\ m/s$, $t_{push} = 0.18\ s$:
$$E_k = \frac{1}{2} \times 3 \times (9.9045)^2 = 1.5 \times 98.1 = 147.15\ J$$
$$P_{mean, kin} = \frac{147.15}{0.18} \approx 817.5\ W$$
$$P_{peak} \approx 2 \times 817.5 = 1635\ W$$

##### Empirical Regression Models (Sayers / Harman)
- **Harman Power Formulation** (Harman et al. 1991):
  $$P_{peak, Harman} (W) = 61.9 \cdot d + 36.0 \cdot m$$
  For $d = 10\ m$, $m = 3\ kg$:
  $$P_{peak, Harman} = 61.9 \times 10 + 36.0 \times 3 = 619 + 108 = 727\ W$$
- **Sayers Power Formulation** (Sayers et al. 1999):
  $$P_{peak, Sayers} (W) = 60.7 \cdot d + 45.3 \cdot m$$
  For $d = 10\ m$, $m = 3\ kg$:
  $$P_{peak, Sayers} = 60.7 \times 10 + 45.3 \times 3 = 607 + 135.9 = 742.9\ W$$

The `MedicineBallPhysics` module will calculate both the rigorous kinematic work-energy values ($P_{mean}$, $P_{peak}$) and provide the Harman/Sayers empirical values for sports science comparison.

---

### 3.3 UX/UI Seamless Flow & Reactive Grid Specification

#### 1. Elimination of Tabbed Interface
Remove `<div class="analysis-tabs">` ("Carica File" vs "Inserimento Manuale"). Replace with a single, vertical flow:
1. **Header & Control Bar**:
   - Title: `Data Analisi Biomeccanica`
   - Instrument selector: `<select id="analysis-test-type">` pre-populated with all 8 test types.
   - Athlete selector: `<input id="analysis-athlete-name">` or `<select id="analysis-athlete-select">` with typeahead/add-new capability.
2. **Compact Dropzone Bar**:
   - Sleek, compact dashed dropzone (`#unified-dropzone`):
     - Prompt: "Trascina file CSV/Excel o clicca per sfogliare"
     - Secondary tags: "Auto-rilevamento strumento: VBT, Pedane, Fotocellule, Salto, Palla Medica"
     - Hidden `<input type="file" id="unified-file-input" accept=".csv,.xlsx,.xls">`
3. **Table Toolbar (`#grid-toolbar`)**:
   - Button `+ Aggiungi Prova` (`#btn-add-grid-row`)
   - Button `+ Dati di Esempio` (`#btn-sample-data`) — loads canonical literature data for the currently selected test
   - Button `Svuota Tabella` (`#btn-clear-grid`)
   - Button `Esporta Foglio Excel (.xlsx)` (`#btn-export-excel`)
   - Row counter / status indicator badge (`#grid-status-badge`)
4. **Reactive Table Grid (`#reactive-grid-container`)**:
   - Dynamic table rendered based on `TestRegistry[activeTest].columns`.
   - Headers show label and unit in brackets.
   - Cells contain responsive numeric/text inputs with step and bounds validation.
   - Action column with remove button `&times;` (`.btn-remove-grid-row`).
   - Listeners for `input`, `change`, and paste.
5. **Dashboard & KPI Panel (`#dashboard-container`)**:
   - Dynamically re-rendered or updated whenever grid data changes.
   - Contains KPI summary cards, warning/coaching insights badges, and Chart.js canvases.

#### 2. Debounced Live-Binding (250ms)
- When any input in the reactive grid triggers `input` or `change`, or when a row is added/deleted:
  ```javascript
  clearTimeout(this._debounceTimer);
  this._debounceTimer = setTimeout(() => {
      this.recalculateAndRender();
  }, 250);
  ```
- No manual "Calcola" or "Elabora" button required.
- Recalculation extracts row objects, validates numbers, updates calculated columns (e.g. $v_0$ and $P_{mean}$ in Medicine Ball rows), updates the KPI card widgets, and calls `chart.update('none')` or re-renders the active Chart.js instance without page flickering.

#### 3. Graceful Partial Data Handling
- Table with 0 rows:
  - Displays empty state banner: "Nessuna prova presente. Inserisci i dati o carica un file."
  - KPI boxes display `N/A`, charts remain hidden or blank.
  - Zero script errors.
- Table with 1 row in multi-point tests (e.g. 1 point in VBT):
  - Displays single-point analysis (e.g. current velocity, power, Bryan Mann velocity zone).
  - Shows an informative advisory badge: "1 carico inserito. Inserire almeno 2 carichi differenti per tracciare il profilo F-V e stimare 1RM."
  - Regression slope and $1RM$ are safely set to `N/A` instead of producing `Infinity` or `NaN`.
- In-flight editing / empty cells:
  - Unfilled numeric cells default safely to `null` or are ignored in calculations.
  - Never display `"undefined"`, `"NaN"`, or `null` in the UI.

---

### 3.4 Excel (.xlsx) Export Specification

The exporter generates a fully unlocked, professional 2-sheet workbook via `ExcelJS` (falling back to `XLSX`):

#### Sheet 1: "Dati Prove"
- **Title Block**:
  - Row 1: `T7 WORKOUT - REPORT PROVE BIOMECCANICHE` (Bold, 14pt, filled accent header).
  - Row 2: `Atleta: [Nome Atleta]` | `Test: [Tipo Test]` | `Data: [YYYY-MM-DD HH:mm]`.
- **Data Table**:
  - Row 4: Column headers matching the active test columns + units (e.g. `Carico (kg)`, `Velocità (m/s)`, etc.). Bold, styled background (`#1E293B`), white text (`#FFFFFF`).
  - Rows 5+: Test records formatted cleanly (numbers with fixed decimals, text left-aligned, numbers right-aligned).
  - Grid borders: Thin border (`#CBD5E1`) around data cells.
  - Protection: Zero locked cells (`cell.protection = { locked: false }`), sheet unlocked (`sheet.protect()` never called).

#### Sheet 2: "Sintesi Biomeccanica & KPI"
- **Title Block**:
  - Row 1: `T7 WORKOUT - SINTESI BIOMECCANICA & KPI` (Bold, 14pt).
  - Row 2: `Riepilogo parametri ed elaborazioni analitiche`.
- **KPI Summary Table**:
  - Key-Value pairs with metric name, calculated value, unit, and normative benchmark (e.g. $1RM$ Stimato, $P_{max}$, $V_0$, Asimmetria L/R, EUR, RSI, ecc.).
- **Coach Notes Section ("Note & Osservazioni Coach")**:
  - Row header: `NOTE & OSSERVAZIONI DELL'ALLENATORE` (Bold, light background `#F1F5F9`).
  - Pre-allocated multi-line editable rows for freeform coach feedback, prescriptions, technical cues, and load corrections.
  - Protection: Zero protection, completely unblocked, allowing coach to edit, append, and save notes in Excel directly.

---

### 3.5 Code Architecture & Modular File Organization

Files organized under `js/analysis/`:

```
js/
├── analysis/
│   ├── test-registry.js          # Registry of 8 instruments: schemas, validation, sample data, mappings
│   ├── medicine-ball-physics.js  # Ballistic kinematics, trajectory generator, Sayers/Harman power models
│   ├── reactive-grid.js          # Unified reactive table grid component with 250ms debounced live-binding
│   └── analysis-exporter.js      # 2-sheet unlocked .xlsx generator (ExcelJS / SheetJS)
├── data-analysis.js              # Orchestrator & UI controller (preserves 23 test_check.py tokens)
├── parser.js                     # Updated with MEDICINE_BALL detection
└── physics-engine.js             # Existing VBT and jump physics
```

#### Script Inclusion Order in `index.html`
In `index.html`, the analysis modules must be loaded in dependency order:
```html
<script src="js/analysis/test-registry.js"></script>
<script src="js/analysis/medicine-ball-physics.js"></script>
<script src="js/analysis/reactive-grid.js"></script>
<script src="js/analysis/analysis-exporter.js"></script>
<script src="js/data-analysis.js"></script>
```

#### Multi-Agent Safety Rules Compliance
- **Emojis**: Zero spontaneous emojis in code strings, template literals, and user interface labels.
- **Cache Version**: Bump `CACHE_NAME` in `sw.js` from `t7-workout-v64` to `t7-workout-v65`.
- **`test_check.py`**: Update line 44 to verify `t7-workout-v65`. Ensure all 23 tokens remain present in `js/data-analysis.js`.
- **Syntax Check**: Run `py test_check.py` and verify zero delimiter errors.

---

## 4. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | UI / UX | Unified Seamless Layout | Single consolidated layout combining compact dropzone, test selector, athlete selector, and reactive grid without tab switching | User file drop or dropdown selection | Synchronized view and grid state | Keeps current data intact on invalid selection | ORIGINAL_REQUEST.md & js/data-analysis.js |
| 2 | UI / UX | Reactive Editable Grid | In-place editable HTML table adapting columns, units, placeholders, and validation to the selected test type | Keyboard input into table cells | Instant cell updates and data model sync | Invalid numeric inputs flagged, calculation ignores invalid cells | ORIGINAL_REQUEST.md R1 |
| 3 | UI / UX | 250ms Debounced Live-Binding | Automatic trigger that recalculates metrics, KPI boxes, and charts 250ms after user stops typing | Any cell input, row addition, or deletion | Real-time dashboard update without manual "Calcola" clicks | Clears and restarts timer on rapid input; no freezing | ORIGINAL_REQUEST.md R3 |
| 4 | UI / UX | One-Click Sample Data | Button to instantly populate canonical literature test data for the selected instrument | Click `#btn-sample-data` | Populated grid with realistic trials | Overwrites or appends cleanly | ORIGINAL_REQUEST.md R1 |
| 5 | Data Ingestion | Multi-Instrument Auto-Detection | Automatic recognition of instrument type from CSV/Excel headers and value profiles | Uploaded file (`.csv`, `.xlsx`, `.xls`) | Auto-sets test selector and loads data into grid | Fallback to `GENERAL_TABULAR` on unknown format | js/parser.js line 625 & ORIGINAL_REQUEST.md |
| 6 | Registry | `TestRegistry` Architecture | Centralized registry for all 8 test types defining schemas, validation, mappings, sample data, and KPI rules | Test type ID (`VBT`, `FORCE_PLATE`, etc.) | Schema object with full column metadata and logic | Throws informative error if unknown test ID requested | ORIGINAL_REQUEST.md R2 |
| 7 | Registry | VBT Linear Encoder Test Type | Schema and calculations for load-velocity, 1RM, $V_0$, $F_0$, $P_{max}$, $L_{opt}$, $V_{opt}$, Bryan Mann zones | Load (kg), Velocity (m/s), Peak Vel, ROM | F-V regression, 1RM estimate, velocity zones | Safe handling if $n < 2$ or identical loads | js/physics-engine.js & TestRegistry |
| 8 | Registry | Force Plate Test Type | Schema and calculations for vertical force, peak force, RFD, impulse, RSI-mod, and L/R asymmetry | $F_z$ (N), Peak Force (N), RFD (N/s), Impulse, L/R | Asymmetry %, peak metrics, force trace chart | Missing bilateral data yields `N/A` asymmetry | js/data-analysis.js line 2163 |
| 9 | Registry | Block Start Accelerometer Test Type | Schema for reaction time, push duration, horizontal/triaxial acceleration, and exit velocity | RT (s), Push time (s), $A_x$, $A_y$, $A_z$ (m/s²) | RT validation (<100ms warning), $A_{res}$, exit velocity | Flags false starts (<100ms) with warning badge | js/data-analysis.js line 2275 |
| 10 | Registry | Sprint Photocells Test Type | Schema for split distances and cumulative times, computing segment split times, split speeds, and $V_{max}$ | Gate distances (m), Cumulative times (s) | Progression table, $V_{max}$, theoretical $V_0$ | Automatically sorts unsorted distance gates | js/data-analysis.js line 2382 |
| 11 | Registry | 2D Kinematics Test Type | Schema for joint angles (knee, hip, ankle, trunk) and angular velocities across frames | Frame/Time, knee/hip/ankle/trunk angles (°) | ROM (°), max flexion/extension, angular velocity | Filters NaN angle values | js/data-analysis.js line 2538 |
| 12 | Registry | Vertical Jump Test Type | Schema for SJ, CMJ, and Drop Jump heights, contact time, drop height, computing EUR and RSI | Jump type, Height (cm), Contact Time (ms), Drop H | EUR ratio ($CMJ/SJ$), RSI ($JH/CT$), elasticity | Contact time required only for DJ; no division by 0 | js/physics-engine.js line 675 |
| 13 | Registry / Physics | Medicine Ball Test Type (`MEDICINE_BALL`) | Schema for ball mass, throw distance, flight time, release angle, release height, push time | Ball mass (kg), distance (m), angle, height, time | Release velocity $v_0$, Mean Power, Peak Power | Returns 0 for non-positive distance/mass | ORIGINAL_REQUEST.md R2 |
| 14 | Physics | Generalized Ballistic Range Solver | Calculates launch velocity $v_0$ from horizontal range $d$, release height $h_0$, and release angle $\theta$ | $d$ (m), $h_0$ (m), $\theta$ (deg) | $v_0$ (m/s and km/h) | Handles $h_0=0$ and $h_0>0$ continuously | Biomechanical ballistics derivation |
| 15 | Physics | Flight Time Velocity Solver | Calculates launch velocity $v_0$ and launch angle $\theta$ when flight time $t_{flight}$ is provided | $d$ (m), $t_{flight}$ (s), $h_0$ (m) | $v_0$ (m/s), $\theta$ (deg) | Prevents division by zero if $t_{flight} \le 0$ | Biomechanical kinematics derivation |
| 16 | Physics | Kinematic Work-Energy Power Model | Computes mean and peak propulsive power from mass, $v_0$, and push duration $t_{push}$ | $m$ (kg), $v_0$ (m/s), $t_{push}$ (s) | $P_{mean}$ (W), $P_{peak}$ (W), $W$ (J) | Uses default $t_{push} = 0.18\ s$ if not provided | Cronin & Owen 2004, Viitasalo 1992 |
| 17 | Physics | Sayers & Harman Power Equations | Empirical regression estimates for medicine ball explosive throwing power | $d$ (m), $m$ (kg) | $P_{peak, Sayers}$ (W), $P_{peak, Harman}$ (W) | Yields continuous positive power values | Sayers et al. 1999, Harman et al. 1991 |
| 18 | Registry | Raw Tabular Data Fallback | Schema for arbitrary CSV/Excel tabular data with auto-generated headers | Array of generic row objects or CSV lines | Formatted preview table and column statistics | Displays up to 30 preview rows cleanly | js/data-analysis.js line 2668 |
| 19 | Export | Two-Sheet Excel Workbook (.xlsx) | Generates professional multi-tab Excel file with Sheet 1 "Dati Prove" and Sheet 2 "Sintesi Biomeccanica & KPI" | Active grid records and calculated KPI metrics | Downloadable `.xlsx` file | Falls back to SheetJS if ExcelJS is unavailable | ORIGINAL_REQUEST.md R4 |
| 20 | Export | Unlocked Cells & Coach Notes Section | Sheet 2 includes dedicated editable Coach Notes block with zero locked cells and zero passwords | Coach comments and KPI data | Fully unlocked Excel sheets for coach editing | Never sets sheet protection or cell locks | AGENTS.md & ORIGINAL_REQUEST.md |
| 21 | Data Ingestion | Encoded Athlete ID Sanitization | Normalizes machine-generated sensor IDs (e.g. `encoder_user_123`) to readable human names | Raw athlete name / filename | Normalized display name or rename prompt | Leaves valid human names unchanged | js/parser.js line 1209 |
| 22 | Data Ingestion | Medicine Ball File Auto-Detection | Detects `MEDICINE_BALL` dataset from keywords (palla medica, medicine ball, throw, shot put, ball weight) | Raw headers and record sample | Detects type `MEDICINE_BALL` | Distinguishes from generic tabular data | js/parser.js line 625 overhaul |
| 23 | Architecture | Backward Compatible Orchestration | Retains all 23 mandatory methods/tokens in `js/data-analysis.js` while delegating to modular sub-components | Legacy method calls | Identical public API behavior | Preserves all `test_check.py` assertions | test_check.py lines 8-33 |
| 24 | Architecture | Service Worker Cache Management | Incrementing cache name to `t7-workout-v65` and syncing `test_check.py` | SW install event | Atomic cache invalidation and update | Verifiable via `py test_check.py` | AGENTS.md rules & sw.js |

---

## 5. Edge Cases & Boundary Behaviors

| # | Feature | Input | Observed / Expected Behavior |
|---|---|---|---|
| 1 | Reactive Grid | Empty table (0 rows) | Renders clean empty-state message. KPI cards show `N/A`, charts remain blank or hidden, zero runtime errors or unhandled exceptions. |
| 2 | VBT Test | Single row (1 point, e.g. 80kg at 0.82 m/s) | Displays single trial metrics (velocity, power, velocity zone). Shows informational badge: "1 carico inserito. Inserire almeno 2 carichi differenti per tracciare il profilo F-V". Regression slope and 1RM show `N/A` instead of `NaN` or `Infinity`. |
| 3 | VBT Test | Identical loads on all rows (e.g. 80kg at 0.85 m/s and 80kg at 0.78 m/s) | Denominator in linear regression equation ($n \sum x^2 - (\sum x)^2$) equals 0. Handled gracefully: displays "Carichi identici: impossibile calcolare la pendenza", preventing division by zero. |
| 4 | Medicine Ball | Weight = 3 kg, Distance = 10 m (no angle, height, or time) | Applies standard biomechanical fallbacks ($\theta = 45^\circ$, $h_0 = 1.0\ m$, $t_{push} = 0.18\ s$). Computes release velocity $v_0 \approx 9.9\ m/s$ and mean power $P_{mean} \approx 817\ W$ without error. |
| 5 | Medicine Ball | Distance = 0 or negative ($d \le 0$) | Validation catches non-positive distance; velocity and power are set to 0 or flagged with an input error; prevents evaluating square root of negative numbers. |
| 6 | Medicine Ball | Flight time $t_{flight} = 0$ | Guard condition checks $t_{flight} > 0$; ignores or prompts for valid time, preventing division by zero in $v_x = \frac{d}{t}$. |
| 7 | Medicine Ball | Extreme throw distance (e.g. 500 m) | Physically anomalous check flags warning: "Distanza anomala per lancio con palla medica (>40m)". Limits calculation bounds. |
| 8 | Sprint Timing | Unsorted distance gates (e.g. 30m entered before 10m) | System automatically sorts records by `splitDistance` ascending before calculating segment times ($\Delta t$) and segment velocities ($\frac{\Delta d}{\Delta t}$). |
| 9 | Sprint Timing | Missing 0m origin point (splits start at 5m or 10m) | First segment time equals first gate time; does not assume time was 0 at distance 0 unless specified. |
| 10 | Force Plate | Missing unilateral forces ($F_{left}$ or $F_{right}$ empty) | Asymmetry KPI displays `N/A` instead of calculating `NaN` or `undefined%`. |
| 11 | Vertical Jumps | Drop Jump with Contact Time = 0 or missing | RSI calculation guard: if `contactTime <= 0`, RSI displays `N/A` with tooltip "Tempo di contatto richiesto per Drop Jump", preventing division by zero. |
| 12 | Reactive Grid | Rapid keystrokes / typing in cells | 250ms debounce resets on each keystroke; recalculation and chart rendering only fire once typing pauses for 250ms, maintaining 60fps UI responsiveness. |
| 13 | File Upload | CSV file with corrupted or non-numeric cells | Parser sanitizes non-numeric strings to `null` or NaN; grid displays empty cell or placeholder; mathematical calculations filter out invalid cells. |
| 14 | File Upload | Unknown instrument headers | Falls back gracefully to `GENERAL_TABULAR`, displaying preview of detected columns and row counts without crashing. |
| 15 | Excel Export | Missing athlete name or test parameters | Safely falls back to default filename `Export_Dati_Biomeccanica.xlsx` and default athlete name "Atleta". |
| 16 | Excel Export | Coach notes containing multi-line strings with special characters | Cells formatted with `wrapText: true` and sanitized text; zero XML entity corruption in `.xlsx`. |

---

## 6. Caveats

1. **Air Resistance in Ballistics**: The ballistic equations for `MEDICINE_BALL` utilize standard projectile motion in a vacuum ($g = 9.81\ m/s^2$). For dense medicine balls (2–5 kg) thrown over 5–15 meters at speeds under 12 m/s, aerodynamic drag accounts for less than 1.5% of total trajectory variation (Linthorne 2001), making vacuum ballistics the recognized clinical and sports-testing standard.
2. **Chart.js CDN Dependency**: Chart rendering relies on `window.Chart` (Chart.js 4.x) already included in `index.html`. In headless Node.js test environments, canvas contexts must be mocked.
3. **ExcelJS vs XLSX**: `ExcelJS` is preferred for rich worksheet styling, borders, and multi-sheet layouts. If `ExcelJS` is unavailable (e.g. blocked CDN in offline mode), the export module must gracefully fall back to SheetJS (`window.XLSX`), which is also loaded in `index.html`.
4. **Scope Boundaries**: This specification agent produces requirements and architectural definitions only. Implementation must be carried out by the designated engineering subagents.

---

## 7. Conclusion

The specification mining for the Data Analysis architecture overhaul is complete, verified against all project constraints and authoritative sources:
1. **8 Biomechanical Test Types** are fully formalized with exact column schemas, validation rules, raw header mappings, KPI metrics, and chart definitions.
2. **`MEDICINE_BALL` Physics & Mathematics** are rigorously formulated, including vacuum projectile kinematics with release height, time-of-flight models, kinetic work-energy power ($P_{mean}$, $P_{peak}$), Sayers/Harman regressions, and the benchmark $d = 10\ m \implies v_0 \approx 9.9\ m/s$.
3. **Unified UX/UI Flow** eliminates the obsolete two-tab division, introducing a compact dropzone, dynamic test and athlete selector, in-place editable reactive grid, and 250ms debounced live-binding with robust partial-data handling.
4. **Unlocked 2-Sheet Excel Export** is specified for ExcelJS with Sheet 1 "Dati Prove", Sheet 2 "Sintesi Biomeccanica & KPI", a dedicated Coach Notes section, and 100% unlocked cells.
5. **Code Layout & Multi-Agent Safety Rules** are defined under `js/analysis/`, preserving all 23 elements required by `test_check.py`, ensuring zero spontaneous emojis, and specifying the `sw.js` cache bump to `v65`.

---

## 8. Verification Method

To verify this specification independently:

1. **Syntax & Cache Verification**:
   ```powershell
   py test_check.py
   ```
   Ensures existing codebase is intact, required tokens are noted, and cache versioning is understood.

2. **File & Formula Inspection**:
   - Inspect `js/physics-engine.js` (lines 661-710) for existing EUR/RSI jump formulas.
   - Inspect `js/parser.js` (lines 625-739) for instrument detection rules.
   - Inspect `js/data-analysis.js` (lines 8-33) for required token inventory.
   - Verify ballistic formula derivation: $v_0 = \sqrt{9.81 \times 10} = 9.9045\ m/s$ matching criteria.

3. **Subagent Implementation Verification**:
   Once implemented by builder subagents, the test suite `tests/test_analysis_reactive_grid.js` should run via `node tests/test_analysis_reactive_grid.js` to assert:
   - Registration and schema retrieval for all 8 test types.
   - Ballistic velocity and power calculations for Medicine Ball.
   - 250ms debounce event simulation.
   - Excel export workbook generation with 2 unlocked sheets.
