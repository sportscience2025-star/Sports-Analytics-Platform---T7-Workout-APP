# Handoff Report: Fix Strategy for App Esercizi Scienze Motorie

This report outlines the analysis and precise fix strategy for identified issues in the application's parser, data analysis UI, and physics engine.

---

## 1. Observation

### Observation 1.1: TypeError on Sparse/Empty Rows in `js/parser.js`
In `js/parser.js` at lines 41-49:
```javascript
for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    const stringCount = row.filter(cell => typeof cell === 'string').length;
    if (stringCount >= 3) {
        headerRowIdx = i;
        headers = row;
        break;
    }
}
```
If `rows[i]` is sparse or contains an empty/null row, `row` is `null` or `undefined`. Calling `.filter()` on it throws a `TypeError: Cannot read properties of null (reading 'filter')`.

### Observation 1.2: Header Precedence Bug in `js/parser.js`
In `js/parser.js` at lines 130-151 (`_mapHeaders` method):
```javascript
// Altezza Salto (jumpHeight)
else if (["altezza salto", "jump height", "altura salto", "altezza", "height", "altura", "volo"].some(term => lower.includes(term)) || lower === 'h') {
    colMap[idx] = 'jumpHeight';
}
// Tempo Contatto (contactTime)
else if (["tempo contatto", "contact time", "tiempo contatto", "contatto", "contact_time"].some(term => lower.includes(term)) || lower === 'tc') {
    colMap[idx] = 'contactTime';
}
// Altezza Caduta (dropHeight)
else if (["altezza caduta", "drop height", "altura caida", "caduta"].some(term => lower.includes(term))) {
    colMap[idx] = 'dropHeight';
}
```
Since the checks for `jumpHeight` include broad substrings like `"altezza"`, `"height"`, and `"altura"`, headers representing drop height (e.g., `"altezza caduta"`, `"drop height"`, or `"altura caida"`) will match the `jumpHeight` condition first. They will never reach the check for `dropHeight`, resulting in a header mapping precedence bug.

### Observation 1.3: Chart.js Memory Leaks in `js/data-analysis.js` & `js/app.js`
In `js/data-analysis.js`:
- The class `DataAnalysisUI` creates multiple charts (`this.chartInstance`, `this.jumpHeightChart`, `this.rsiChart`) but only destroys `this.chartInstance` inside `renderVBTDashboard` before rendering a new VBT scatter chart. It does not destroy the other charts when switching dashboards (e.g. from jump analysis to VBT or running mode).
- The class lacks a unified `destroy()` or `cleanup()` method.
- The scatter regression line dataset:
```javascript
{ label: 'Regressione', data: lineData, type: 'line', borderColor: '#6366f1', borderWidth: 2, fill: false, pointRadius: 0 }
```
lacks `showLine: true`, which is required in Chart.js scatter plots to make line datasets visible.

In `js/app.js`:
- Under `case 'analysis':` in `renderView(viewName)` (lines 152-162), a new instance of `window.DataAnalysisUI` is constructed and rendered every time the view is loaded, without cleaning up active charts from the previous instance, leading to memory leaks.

### Observation 1.4: Division by Zero in `js/physics-engine.js`
In `js/physics-engine.js` at lines 35-36:
```javascript
const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
const intercept = (sumY - slope * sumX) / n;
```
If the denominator `(n * sumXX - sumX * sumX) === 0` (e.g. vertical collinear points where all loads are identical), the slope is calculated as `NaN` or `Infinity`.
Also at lines 75-78 (`estimate1RM`):
```javascript
static estimate1RM(regression, mvt = 0.30) {
    if (!regression) return 0;
    return Math.max(0, regression.predictLoad(mvt));
}
```
If `regression.slope === 0` (horizontal collinear points where all velocities are identical), then calling `predictLoad(mvt)` which computes `(mvt - intercept) / slope` results in division by zero, yielding `Infinity` or `NaN`.

### Observation 1.5: R-squared floating point error on collinear datasets
In `js/physics-engine.js` at line 49:
```javascript
const rSquared = totalSS === 0 ? 1 : 1 - (residualSS / totalSS);
```
On collinear datasets, `residualSS / totalSS` can evaluate to a value slightly greater than 1 or less than 0 due to floating point precision errors (e.g. resulting in negative R^2 or values > 1).

### Observation 1.6: Unit conversion discontinuity in `calculateRSI`
In `js/physics-engine.js` at lines 157-160 (`calculateRSI`):
```javascript
let heightM = jumpHeight;
if (jumpHeight > 5) {
    heightM = jumpHeight / 100;
}
```
If a small jump of `3.5` cm is performed, it is not converted to meters since `3.5 <= 5`. It is instead treated as `3.5` meters, causing a severe 100x discontinuity.

---

## 2. Logic Chain

1. **TypeError Fix**: By adding `if (!row) continue;` before `row.filter` in `js/parser.js`, any sparse, empty, or null row is skipped safely before executing array methods, thus avoiding the `TypeError`.
2. **Header Precedence Bug Fix**: By reordering the mapping in `_mapHeaders` so that the more specific check for `dropHeight` occurs before the broader check for `jumpHeight`, columns like `"altezza caduta"` or `"drop height"` will correctly map to `dropHeight`, leaving `"altezza salto"` and `"altezza"` to fall through to `jumpHeight`.
3. **Chart.js Memory Leak Fix**:
   - Creating a unified `cleanup()` method in `DataAnalysisUI` that calls `.destroy()` on `this.chartInstance`, `this.jumpHeightChart`, and `this.rsiChart` ensures all charts can be disposed of in a single call.
   - Calling `this.cleanup()` at the start of all rendering methods in `DataAnalysisUI` clears any existing charts when switching dashboards.
   - Storing `analysisUI` on `state.analysisUI` in `js/app.js` and calling `state.analysisUI.cleanup()` when routing to any new view removes resize/hover event listeners and frees memory before clearing the DOM container.
   - Adding `showLine: true` ensures Chart.js renders the regression line in the VBT scatter chart.
4. **Division by Zero Fix**:
   - Checking `denominator === 0` in `linearRegressionVBT` and returning a zeroed regression object (with safe fallback methods) prevents propagation of `Infinity`/`NaN`.
   - Adding a guard `if (regression.slope === 0) return 0;` inside `estimate1RM` prevents division by zero when the slope is flat.
5. **R-squared Floating Point Error Fix**:
   - Clamping the `rSquared` result using `Math.max(0, Math.min(1, ...))` guarantees that R-squared is always bounded within the mathematically valid range `[0, 1]`.
   - Checking if `totalSS < 1e-12` handles near-perfect collinearity gracefully.
6. **Unit Conversion Fix**:
   - Changing the threshold from `jumpHeight > 5` to `jumpHeight > 2.0` ensures any value in centimeters (which is practically always > 2.0 cm, whereas no human jumps > 2.0 m) is converted to meters, preventing the unit discontinuity for small jumps (e.g. 3.5 cm).

---

## 3. Caveats

- **Assumptions**: It is assumed that no human jump height exceeds 2.0 meters. The vertical jump world record is under 1.7 meters, so this threshold is biomechanically safe.
- **Chart.js version**: The memory leak cleanup relies on standard Chart.js API behavior where `.destroy()` removes the chart instance and cleans up event listeners.

---

## 4. Conclusion

The proposed fixes systematically resolve memory leaks, type errors, math errors (division by zero), and parsing mapping precedence issues across the codebase.

---

## 5. Proposed Code Edits

### File: `js/parser.js`

#### Edit 1: Safe Sparse Row Check
**Target Location**: `parseExcel` (around line 41)
```javascript
<<<<
                            for (let i = 0; i < Math.min(10, rows.length); i++) {
                                const row = rows[i];
                                const stringCount = row.filter(cell => typeof cell === 'string').length;
                                if (stringCount >= 3) {
                                    headerRowIdx = i;
                                    headers = row;
                                    break;
                                }
                            }
====
                            for (let i = 0; i < Math.min(10, rows.length); i++) {
                                const row = rows[i];
                                if (!row) continue;
                                const stringCount = row.filter(cell => typeof cell === 'string').length;
                                if (stringCount >= 3) {
                                    headerRowIdx = i;
                                    headers = row;
                                    break;
                                }
                            }
>>>>
```

#### Edit 2: Header Precedence Reordering
**Target Location**: `_mapHeaders` (around line 140)
```javascript
<<<<
                // Altezza Salto (jumpHeight)
                else if (["altezza salto", "jump height", "altura salto", "altezza", "height", "altura", "volo"].some(term => lower.includes(term)) || lower === 'h') {
                    colMap[idx] = 'jumpHeight';
                }
                // Tempo Contatto (contactTime)
                else if (["tempo contatto", "contact time", "tiempo contatto", "contatto", "contact_time"].some(term => lower.includes(term)) || lower === 'tc') {
                    colMap[idx] = 'contactTime';
                }
                // Altezza Caduta (dropHeight)
                else if (["altezza caduta", "drop height", "altura caida", "caduta"].some(term => lower.includes(term))) {
                    colMap[idx] = 'dropHeight';
                }
====
                // Altezza Caduta (dropHeight)
                else if (["altezza caduta", "drop height", "altura caida", "caduta"].some(term => lower.includes(term))) {
                    colMap[idx] = 'dropHeight';
                }
                // Altezza Salto (jumpHeight)
                else if (["altezza salto", "jump height", "altura salto", "altezza", "height", "altura", "volo"].some(term => lower.includes(term)) || lower === 'h') {
                    colMap[idx] = 'jumpHeight';
                }
                // Tempo Contatto (contactTime)
                else if (["tempo contatto", "contact time", "tiempo contatto", "contatto", "contact_time"].some(term => lower.includes(term)) || lower === 'tc') {
                    colMap[idx] = 'contactTime';
                }
>>>>
```

---

### File: `js/data-analysis.js`

#### Edit 1: Add `cleanup()` Method to Class
**Target Location**: Inside `DataAnalysisUI` (around line 14)
```javascript
<<<<
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.chartInstance = null;
            this.parseResult = null; // Holds { rawData, athletes, exercises }
        }

        render() {
====
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.chartInstance = null;
            this.jumpHeightChart = null;
            this.rsiChart = null;
            this.parseResult = null; // Holds { rawData, athletes, exercises }
        }

        cleanup() {
            if (this.chartInstance) {
                this.chartInstance.destroy();
                this.chartInstance = null;
            }
            if (this.jumpHeightChart) {
                this.jumpHeightChart.destroy();
                this.jumpHeightChart = null;
            }
            if (this.rsiChart) {
                this.rsiChart.destroy();
                this.rsiChart = null;
            }
        }

        render() {
>>>>
```

#### Edit 2: Call `cleanup()` inside Render Dashboard methods
**Target Location 1**: `renderVBTDashboard` (around line 545)
```javascript
<<<<
            // Destroy old Chart instance if exists to prevent canvas reuse error
            if (this.chartInstance) {
                this.chartInstance.destroy();
                this.chartInstance = null;
            }
====
            // Destroy old Chart instances to prevent canvas reuse error and memory leaks
            this.cleanup();
>>>>
```

**Target Location 2**: `renderRunningDashboard` (around line 652)
```javascript
<<<<
        renderRunningDashboard(data, athlete, exercise) {
            const dashboard = document.getElementById('dashboard-container');
====
        renderRunningDashboard(data, athlete, exercise) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
>>>>
```

**Target Location 3**: `renderJumpDashboard` (around line 690)
```javascript
<<<<
        renderJumpDashboard(data, athlete) {
            const dashboard = document.getElementById('dashboard-container');
====
        renderJumpDashboard(data, athlete) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
>>>>
```

#### Edit 3: Ensure `showLine: true` is set on Regression Line
**Target Location**: `renderVBTDashboard` (around line 635)
```javascript
<<<<
                        { label: 'Regressione', data: lineData, type: 'line', borderColor: '#6366f1', borderWidth: 2, fill: false, pointRadius: 0 }
====
                        { label: 'Regressione', data: lineData, type: 'line', borderColor: '#6366f1', borderWidth: 2, fill: false, pointRadius: 0, showLine: true }
>>>>
```

---

### File: `js/app.js`

#### Edit 1: Add `analysisUI` to State and Call `cleanup()` on Routing
**Target Location 1**: `state` definition (around line 8)
```javascript
<<<<
const state = {
    currentView: 'catalog',
    filters: {},
    exercises: [],
    programContext: {}
};
====
const state = {
    currentView: 'catalog',
    filters: {},
    exercises: [],
    programContext: {},
    analysisUI: null
};
>>>>
```

**Target Location 2**: `renderView` (around line 69)
```javascript
<<<<
function renderView(viewName) {
    appContainer.innerHTML = ''; // Clear current view
====
function renderView(viewName) {
    // Cleanup active Chart.js instances to prevent memory leaks
    if (state.analysisUI && typeof state.analysisUI.cleanup === 'function') {
        state.analysisUI.cleanup();
        state.analysisUI = null;
    }

    appContainer.innerHTML = ''; // Clear current view
>>>>
```

**Target Location 3**: `renderView` 'analysis' case (around line 152)
```javascript
<<<<
        case 'analysis':
            appContainer.innerHTML = `
                <div id="analysis-container"></div>
            `;
            if (window.DataAnalysisUI) {
                const analysisUI = new window.DataAnalysisUI('analysis-container');
                analysisUI.render();
            } else {
====
        case 'analysis':
            appContainer.innerHTML = `
                <div id="analysis-container"></div>
            `;
            if (window.DataAnalysisUI) {
                state.analysisUI = new window.DataAnalysisUI('analysis-container');
                state.analysisUI.render();
            } else {
>>>>
```

---

### File: `js/physics-engine.js`

#### Edit 1: Guard Against Division by Zero and floating point clamp R-squared in `linearRegressionVBT`
**Target Location**: `linearRegressionVBT` (around line 34)
```javascript
<<<<
            // Calculate slope (m) and intercept (b): y = mx + b
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            // Calculate R-squared
            const yMean = sumY / n;
            let totalSS = 0;
            let residualSS = 0;
            
            data.forEach(point => {
                const yPred = slope * point.load + intercept;
                totalSS += Math.pow(point.velocity - yMean, 2);
                residualSS += Math.pow(point.velocity - yPred, 2);
            });

            const rSquared = totalSS === 0 ? 1 : 1 - (residualSS / totalSS);
====
            // Guard against division by zero (e.g. collinear loads)
            const denominator = n * sumXX - sumX * sumX;
            if (denominator === 0) {
                return {
                    slope: 0,
                    intercept: 0,
                    rSquared: 0,
                    v0: 0,
                    f0: 0,
                    f0_N: 0,
                    pmax: 0,
                    predictVelocity: (load) => 0,
                    predictLoad: (velocity) => 0
                };
            }

            // Calculate slope (m) and intercept (b): y = mx + b
            const slope = (n * sumXY - sumX * sumY) / denominator;
            const intercept = (sumY - slope * sumX) / n;

            // Calculate R-squared
            const yMean = sumY / n;
            let totalSS = 0;
            let residualSS = 0;
            
            data.forEach(point => {
                const yPred = slope * point.load + intercept;
                totalSS += Math.pow(point.velocity - yMean, 2);
                residualSS += Math.pow(point.velocity - yPred, 2);
            });

            // Guard against floating point precision errors on collinear datasets
            const rSquared = totalSS < 1e-12 ? 1 : Math.max(0, Math.min(1, 1 - (residualSS / totalSS)));
>>>>
```

#### Edit 2: Guard Against Division by Zero in `estimate1RM`
**Target Location**: `estimate1RM` (around line 75)
```javascript
<<<<
        static estimate1RM(regression, mvt = 0.30) {
            if (!regression) return 0;
            return Math.max(0, regression.predictLoad(mvt));
        }
====
        static estimate1RM(regression, mvt = 0.30) {
            if (!regression || regression.slope === 0) return 0;
            return Math.max(0, regression.predictLoad(mvt));
        }
>>>>
```

#### Edit 3: Fix Unit Conversion Discontinuity in `calculateRSI`
**Target Location**: `calculateRSI` (around line 157)
```javascript
<<<<
            let heightM = jumpHeight;
            if (jumpHeight > 5) {
                heightM = jumpHeight / 100;
            }
====
            let heightM = jumpHeight;
            if (jumpHeight > 2.0) {
                heightM = jumpHeight / 100;
            }
>>>>
```

---

## 6. Verification Method

To verify these changes, we can extend `test_load_velocity.js` to assert the fixes directly. Add the following code at the end of the `run()` function in `test_load_velocity.js`:

```javascript
    // C. Verify Edge Cases and Fixes

    // C1. Verify parser handles empty/sparse rows gracefully
    console.log("\nVerifying parser empty/sparse rows handler...");
    const sparseSheet = [
        ["Atleta", "Esercizio", "Carico", "Velocità"],
        null, // Sparse empty row
        ["Mario Rossi", "Squat", 60, 1.0],
        undefined, // Sparse undefined row
        ["Mario Rossi", "Squat", 85, 0.75]
    ];
    const mockXLSXForSparse = {
        read: () => ({ SheetNames: ['Sheet1'], Sheets: { 'Sheet1': sparseSheet } }),
        utils: { sheet_to_json: (sheet) => sheet }
    };
    
    // Save current global XLSX and restore later
    const originalXLSX = global.XLSX;
    global.XLSX = mockXLSXForSparse;
    global.window.XLSX = mockXLSXForSparse;
    
    try {
        const sparseBuffer = Buffer.from("dummy");
        const parsedSparse = await DataParser.parseExcel(sparseBuffer);
        if (parsedSparse.rawData.length === 2) {
            console.log("✅ Parser successfully handled sparse/empty rows and extracted 2 records!");
        } else {
            console.error(`❌ Parser failed on sparse/empty rows. Expected 2 records, got ${parsedSparse.rawData.length}`);
            process.exit(1);
        }
    } catch (e) {
        console.error("❌ Parser threw exception on sparse/empty rows:", e);
        process.exit(1);
    } finally {
        global.XLSX = originalXLSX;
        global.window.XLSX = originalXLSX;
    }

    // C2. Verify dropHeight vs jumpHeight header precedence mapping
    console.log("\nVerifying header precedence mapping...");
    const testHeaders = ["drop height", "altezza", "dropHeight", "altezza salto"];
    const colMap = DataParser._mapHeaders(testHeaders);
    
    if (colMap[0] === 'dropHeight' && colMap[1] === 'jumpHeight' && colMap[2] === 'dropHeight' && colMap[3] === 'jumpHeight') {
        console.log("✅ Header mapping precedence verified successfully!");
    } else {
        console.error("❌ Header mapping precedence failure. Map result:", colMap);
        process.exit(1);
    }

    // C3. Verify division by zero safety in linearRegressionVBT and estimate1RM
    console.log("\nVerifying division by zero safety...");
    const collinearVertDataset = [
        { load: 80, velocity: 1.0 },
        { load: 80, velocity: 0.5 }
    ];
    const collinearReg = PhysicsEngine.linearRegressionVBT(collinearVertDataset);
    if (collinearReg && collinearReg.slope === 0 && collinearReg.intercept === 0) {
        console.log("✅ Division by zero prevented: collinear vertical dataset returned zeroed regression object.");
    } else {
        console.error("❌ Division by zero failure for collinear vertical dataset. Result:", collinearReg);
        process.exit(1);
    }
    
    const est1RMZeroSlope = PhysicsEngine.estimate1RM(collinearReg, 0.3);
    if (est1RMZeroSlope === 0) {
        console.log("✅ 1RM estimation guarded against division by zero (slope === 0) and returned 0.");
    } else {
        console.error(`❌ 1RM estimation failed. Expected 0, got ${est1RMZeroSlope}`);
        process.exit(1);
    }

    // C4. Verify R-squared floating point clamping
    console.log("\nVerifying R-squared floating point clamping...");
    // Let's test a dataset that is perfectly collinear to see if rSquared is clamped to [0,1]
    const collinearHorizDataset = [
        { load: 50, velocity: 0.8 },
        { load: 80, velocity: 0.8 }
    ];
    const collinearHorizReg = PhysicsEngine.linearRegressionVBT(collinearHorizDataset);
    if (collinearHorizReg && collinearHorizReg.rSquared === 1) {
        console.log("✅ R-squared clamped to 1 for perfectly horizontal collinear dataset.");
    } else {
        console.error("❌ R-squared calculation failed for horizontal collinear dataset:", collinearHorizReg);
        process.exit(1);
    }

    // C5. Verify unit conversion in calculateRSI
    console.log("\nVerifying unit conversion discontinuity fixes in calculateRSI...");
    const rsiCm = PhysicsEngine.calculateRSI(35.0, 0.200); // 35 cm, should convert to 0.35m -> RSI = 1.75
    const rsiM = PhysicsEngine.calculateRSI(0.35, 0.200);  // 0.35 m, should keep 0.35m -> RSI = 1.75
    const rsiLowCm = PhysicsEngine.calculateRSI(3.5, 0.200); // 3.5 cm, should convert to 0.035m -> RSI = 0.175
    
    assertClose(rsiCm, 1.75, 0.01, "RSI (35.0cm)");
    assertClose(rsiM, 1.75, 0.01, "RSI (0.35m)");
    assertClose(rsiLowCm, 0.175, 0.01, "RSI (3.5cm)");
```

Once the implementer applies the edits, they can execute `node test_load_velocity.js` (when Node is available in their environment) to verify that all VBT computations and parsing edge cases pass successfully.
