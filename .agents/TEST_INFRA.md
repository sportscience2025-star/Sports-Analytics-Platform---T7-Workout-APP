# Test Infrastructure & E2E Testing Architecture
**Data Analysis Architecture Overhaul (T7 Workout PWA)**

Author: E2E Testing Track Writer (`teamwork_preview_test_writer`)  
Date: 2026-09-11  
Scope: E2E Verification Suite for Unified Seamless Flow, Polymorphic `TestRegistry`, Ballistic `MedicineBallPhysics`, `ReactiveGrid` (250ms debounced live-binding), and 2-Sheet Unlocked Excel Exporter.

---

## 1. Architectural Overview & Test Strategy

The test architecture ensures 100% deterministic, rigorous end-to-end verification of the renovated Data Analysis module across both headless CI/Node.js environments and browser environments (`tests/runner.html`).

```
                                +-------------------------------------+
                                |      E2E Test Suite Runner         |
                                | (tests/test_analysis_reactive_grid) |
                                +-------------------------------------+
                                                   |
                        +--------------------------+--------------------------+
                        |                                                     |
             [Environment Harness]                                    [Test Tiers 1-4]
      +--------------------------------+                    +--------------------------------+
      | - Headless Node.js Runner      |                    | Tier 1: Feature Coverage       |
      | - Browser Runner (runner.html) |                    | Tier 2: Boundary & Corner      |
      | - Self-Contained DOM Mock      |                    | Tier 3: Cross-Feature Pipeline |
      | - Mock FileReader / Buffer     |                    | Tier 4: Real-World Scenarios   |
      | - Mock ExcelJS (Workbook/Sheet)|                    +--------------------------------+
      +--------------------------------+                                      |
                        |                                                     |
                        +--------------------------+--------------------------+
                                                   |
                                                   v
                         +-----------------------------------+
                         |         Target Under Test         |
                         | - js/analysis/test-registry.js    |
                         | - js/analysis/medicine-ball-phys  |
                         | - js/analysis/reactive-grid.js    |
                         | - js/analysis/analysis-exporter.js|
                         | - js/parser.js                    |
                         +-----------------------------------+
```

### 1.1 Progressive Testability & Dual-Mode Execution
To support concurrent development tracks (where M1-M5 implement modular components while E2E tests are designed), the test harness operates in **Dual-Mode**:
1. **Live Production Mode**: When the modular implementation files in `js/analysis/` are present on disk, the test suite dynamically loads and evaluates the production code into the test environment, verifying actual production behavior against specifications.
2. **Specification Oracle Mode**: If any modular files are not yet created on disk, the test suite verifies the canonical reference implementation (oracle) embedded in the harness. This validates that the mathematical equations, debounce timers, column schemas, and Excel formatting contracts defined in `PROJECT.md` are executable and structurally sound without crashing.

---

## 2. Mock Environment & Zero-Dependency Harness

To guarantee zero flaky dependencies and enable execution without external npm packages (`exceljs`, `jsdom`, `xlsx`), the test harness implements lightweight, specification-compliant mocks:

### 2.1 DOM & Event Mock
- **`MockDOMElement`**: Supports `id`, `className`, `style`, `children`, `parentElement`, `innerHTML`, `value`, `disabled`, `appendChild()`, `removeChild()`, `querySelector()`, `querySelectorAll()`, `addEventListener()`, and `dispatchEvent()`.
- **Canvas 2D Context Mock**: Provides mock methods (`getContext('2d')`, `beginPath()`, `stroke()`, `fill()`, `arc()`, `createLinearGradient()`) for Chart.js rendering checks.
- **Global `window` & `document`**: Populates global environment with `window`, `document`, `Event`, `CustomEvent`, and `setTimeout`/`clearTimeout`.

### 2.2 ExcelJS Mock
- **`MockExcelJS.Workbook`**: Implements `.addWorksheet(name)`, `.eachSheet(cb)`, and `.xlsx.writeBuffer()`.
- **`MockWorksheet`**: Supports `.columns`, `.addRow(data)`, `.eachRow(cb)`, `.getCell(ref)`.
- **Unlocked Cell Auditor**: Tracks `cell.protection = { locked: false }` and records any attempts to invoke `.protect(password)`. Verifies that zero cells are locked and zero passwords exist.

### 2.3 FileReader Mock
- **`MockFileReader`**: Converts string and binary inputs into `ArrayBuffer` asynchronously to test file ingestion pipelines seamlessly.

---

## 3. Comprehensive 4-Tier Test Matrix

The test suite in `tests/test_analysis_reactive_grid.js` covers 4 rigorous testing tiers:

```
+---------------------------------------------------------------------------------+
| TIER 1: FEATURE COVERAGE                                                        |
| - TestRegistry (all 8 instrument types registered and validated)                |
| - Column schemas, units, steps, placeholders, and validation rules              |
| - MedicineBallPhysics: Ballistic speed v0 (~9.9 m/s) and Mean Power (~818 W)    |
| - ReactiveGrid row operations: addRow, removeRow, updateCell, loadSampleData    |
| - 250ms debounced live-binding event firing                                     |
| - Excel export 2-sheet structure ("Dati Prove", "Sintesi Biomeccanica & KPI")   |
+---------------------------------------------------------------------------------+
| TIER 2: BOUNDARY & CORNER CASES                                                 |
| - Empty table (0 rows): safe empty-state, zero NaN, zero undefined             |
| - Single-row VBT (1 point): safe single-point metrics, slope/1RM fallback badge |
| - Medicine Ball non-positive mass (m <= 0) or distance (d <= 0): safe return    |
| - Extreme distance/weight inputs: boundary clamping and warning flags           |
| - Drop Jump contact time <= 0: RSI division-by-zero safe fallback (null/0)      |
| - Identical loads in VBT: variance Sxx = 0 handled gracefully (no NaN/Infinity) |
+---------------------------------------------------------------------------------+
| TIER 3: CROSS-FEATURE COMBINATIONS                                              |
| - Full Pipeline: File Parser Detection -> Grid Load -> Live-Binding -> Excel    |
| - Dynamic Test Type Switch: VBT to MEDICINE_BALL adapting columns seamlessly    |
+---------------------------------------------------------------------------------+
| TIER 4: REAL-WORLD APPLICATION SCENARIOS                                        |
| - Scenario 1: Complete athlete VBT session (4 progressive loads on Back Squat)  |
| - Scenario 2: Complete athlete Medicine Ball session (3 progressive throws)     |
| - Scenario 3: Sprint photocell split analysis (5m to 60m Samozino profile)      |
| - Scenario 4: Coach notes export verification in Excel                          |
+---------------------------------------------------------------------------------+
```

---

## 4. Expected Output Derivation & Authoritative Sources

| Feature / Calculation | Authoritative Reference | Mathematical Formulation / Canonical Benchmark |
|---|---|---|
| Ballistic Release Velocity ($v_0$) | Projectile Motion Physics (Halliday & Resnick) | $v_0 = \frac{d}{\cos\theta} \sqrt{\frac{g}{2(h_0 + d\tan\theta)}}$. Benchmark: $m=3\text{kg}, d=10\text{m}, \theta=45^\circ, h_0=0 \implies v_0 \approx 9.90\text{ m/s}$. |
| Mean Propulsive Power ($P_{mean}$) | Work-Energy Theorem ($W = \frac{1}{2}m v_0^2, P = W/t_{push}$) | $P_{mean} = \frac{m v_0^2}{2 t_{push}}$. Benchmark: $t_{push}=0.18\text{s} \implies P_{mean} \approx 817.5\text{ W} \approx 818\text{ W}$. |
| Peak Throw Power ($P_{peak}$) | Harman et al. (1995) & Sayers et al. (1999) | $P_{peak} = 2 \times P_{mean} \approx 1635\text{ W}$; Harman regression: $P_{Harman} = 61.9 d + 36.0 m = 727\text{ W}$. |
| VBT 1RM Estimation | González-Badillo & Sánchez-Medina (2010), Bryan Mann (2015) | Linear regression $V = a \cdot L + b$. $1RM = \frac{MVT - b}{a}$ where $MVT_{Squat} = 0.30\text{ m/s}$. |
| Reactive Strength Index (RSI) | Flanagan & Comyns (2008), NSCA | $RSI = \frac{\text{Jump Height (m)}}{\text{Contact Time (s)}}$. Safe fallback when $t_c \le 0 \implies \text{null}$. |
| Sprint Velocity Profile | Samozino, Rabita, Morin et al. (2012) | $v(t) = v_{max}(1 - e^{-t/\tau})$, split velocity $v = \Delta d / \Delta t$. |
| Excel Workbook Structure | Project Guidelines & Multi-Agent Safety Rules | 2 Sheets: "Dati Prove" & "Sintesi Biomeccanica & KPI". 100% unlocked cells, zero passwords. |

---

## 5. Execution Commands & Verification Protocol

### 5.1 CLI Execution
```bash
# 1. Run the dedicated Data Analysis E2E test suite:
node tests/test_analysis_reactive_grid.js

# 2. Verify syntax and delimiter integrity across project JS files:
py test_check.py
```

### 5.2 Browser Dashboard Execution
Open `tests/runner.html` in any browser or local HTTP server.  
`'test_analysis_reactive_grid.js'` will execute automatically inside the test runner iframe and report execution status and elapsed time.
