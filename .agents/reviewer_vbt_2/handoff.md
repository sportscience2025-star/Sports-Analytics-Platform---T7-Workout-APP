# Handoff Report — VBT Math and manual entry/file upload integrations review

## 1. Observation

### Code Observations

#### A. Chart.js Lifecycle Management in `js/data-analysis.js`
In `js/data-analysis.js`, the class `DataAnalysisUI` instantiates three different chart variables:
- `this.chartInstance` (VBT chart)
- `this.jumpHeightChart` (Jump heights chart)
- `this.rsiChart` (RSI trials chart)

However, their lifecycles are poorly managed when transitioning between dashboard views:
- **`renderVBTDashboard` (lines 547-551):** Only destroys `this.chartInstance`.
  ```javascript
  // Destroy old Chart instance if exists to prevent canvas reuse error
  if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
  }
  ```
  It does not destroy `this.jumpHeightChart` or `this.rsiChart`, meaning if the user switches from the Jump view to the VBT view, the jump charts are leaked.
- **`renderJumpDashboard` (lines 839-842, 883-885):** Replaces the dashboard's outer HTML and then destroys `this.jumpHeightChart` and `this.rsiChart` if they exist.
  ```javascript
  dashboard.innerHTML = html;
  ...
  if (this.jumpHeightChart) {
      this.jumpHeightChart.destroy();
  }
  ...
  if (this.rsiChart) {
      this.rsiChart.destroy();
  }
  ```
  It does not destroy `this.chartInstance`, meaning switching from VBT to Jump leaks the VBT scatter chart.
- **`renderRunningDashboard` (lines 652-688):** Does not destroy *any* of the three chart instances, causing a memory leak if the user moves to the running pace page from VBT or Jump view.
- **`js/app.js` View Switching (lines 152-162):** When navigating away from the 'analysis' view, the container is cleared via `appContainer.innerHTML = ''` without calling any cleanup/destroy method on `DataAnalysisUI`. Since Chart.js instances register globally in `Chart.instances` and bind resize event listeners to `window` for responsive charts, these instances remain in memory indefinitely, causing a memory leak every time the user transitions between tabs.

#### B. Math Logic in `js/physics-engine.js`
- **Division by Zero in `linearRegressionVBT` (line 35):**
  ```javascript
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  ```
  If all load values in the input data points are identical (variance is zero), the denominator `n * sumXX - sumX * sumX` equals 0, resulting in `slope` being `NaN` or `Infinity`.
- **Estimation of 1RM with slope = 0 (lines 75-78, 67):**
  ```javascript
  static estimate1RM(regression, mvt = 0.30) {
      if (!regression) return 0;
      return Math.max(0, regression.predictLoad(mvt));
  }
  ```
  Where `predictLoad` is `(velocity) => (velocity - intercept) / slope`. If slope is 0 or extremely close to 0, this results in division by zero and outputs `Infinity`, leading to rendering failures (rendering `NaN` or `Infinity` in the UI).
- **RSI Calculation Discontinuity (lines 157-161):**
  ```javascript
  let heightM = jumpHeight;
  if (jumpHeight > 5) {
      heightM = jumpHeight / 100;
  }
  ```
  This creates a critical logical discontinuity. If the input jump height is `5` cm (e.g. from a very small jump or test error), it is treated as `5` meters. If it is `5.1` cm, it is treated as `0.051` meters (divided by 100). This represents a 100x discrepancy at the boundary.

---

### Command Outputs

Three test scripts were executed to verify the code:

#### 1. `test_load_velocity.js`
Command: `& "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" test_load_velocity.js`
Result:
```
=== Running VBT and Ingestion Verification Script ===
✅ slope verified: -0.008282485875706201 (expected: -0.008282, error: 0.0059%)
✅ intercept verified: 1.4961016949152528 (expected: 1.496102, error: 0.0000%)
✅ R^2 verified: 0.9999553332973519 (expected: 0.9998, error: 0.0155%)
✅ F0 verified: 180.6343792633016 (expected: 180.63, error: 0.0024%)
✅ V0 verified: 1.4961016949152528 (expected: 1.496, error: 0.0068%)
✅ Pmax verified: 662.7817508931254 (expected: 662.78, error: 0.0003%)
✅ 1RM at MVT=0.3 verified: 144.4133697135062 (expected: 144.4133697135062, error: 0.0000%)

Parsing Excel file: sample_messy_data.xlsx...
Excel parsed: 8 records found.
✅ Luca Verdi squat data point verified: 80kg @ 0.55m/s

PASS
```

#### 2. `test_parsing.js`
Command: `& "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" test_parsing.js`
Result:
```
=== Running DataParser Tests ===

Parsing Excel file: sample_messy_data.xlsx...
Excel parsed successfully: 8 records found.
Athletes: [ 'Mario Rossi', 'Luca Verdi' ]
Exercises: [ 'CMJ', 'SJ', 'DJ', 'Squat' ]

Parsing PDF file: sample_messy_data.pdf...
PDF parsed successfully: 8 records found.
Athletes: [ 'Mario Rossi', 'Luca Verdi' ]
Exercises: [ 'CMJ', 'SJ', 'DJ', 'SQUAT' ]

✅ All assertions passed successfully!
Parsed data output successfully written to parsed_output.json.
```

#### 3. `test_analysis.js`
Command: `& "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" test_analysis.js`
Result:
```
=== Running PhysicsEngine Jump Test & VBT Progression Tests ===

--- Testing EUR ---
✅ Asserted Average SJ height: 31.00000 is close to 31.00000
✅ Asserted Average CMJ height: 34.00000 is close to 34.00000
✅ Asserted EUR calculation: 1.09677 is close to 1.09677
✅ EUR edge cases handled successfully.

--- Testing RSI ---
✅ Asserted RSI Trial 1: 1.80000 is close to 1.80000
✅ Asserted RSI Trial 2: 2.11111 is close to 2.11111
✅ RSI edge cases handled successfully.

--- Testing Jump Performance Evaluation ---
Generated qualitative evaluation output:
EUR Profile: Balanced (EUR = 1.0968). The athlete displays an optimal transfer of energy through the stretch-shortening cycle (SSC). Standard 5-15% performance increase with countermovement.

RSI Profile: Moderate (RSI = 1.9556). Average reactive capacity. Athlete can benefit from progressive barrier jumps and moderate drop jump training.
✅ Qualitative evaluation checks passed.

--- Testing VBT Linear Regression & 1RM ---
✅ Asserted VBT Regression Slope: -0.00865 is close to -0.00865
✅ Asserted VBT Regression Intercept: 1.41600 is close to 1.41600
✅ Asserted VBT Regression R-Squared: 0.99980 is close to 0.99980
✅ Asserted 1RM Estimate: 129.01734 is close to 129.01734
✅ VBT regression and 1RM checks passed.

🎉 All test assertions passed successfully!
```

---

## 2. Logic Chain

1. **Active Chart Listeners:** Chart.js constructs canvas overlays, holds DOM references, and binds active event listeners (`resize` etc.) to the `window` object when responsive modes are active.
2. **Missing Cleanup on Transition:** When switching dashboards (VBT vs Jump vs Running) or clearing the parent container `#analysis-container` on tab navigation, the code does not consistently invoke `.destroy()` on the charts that are removed from the DOM.
3. **Memory Accumulation:** As a result, the browser cannot garbage-collect these detached Chart objects, leading to memory leaks and errors when canvases with identical IDs are re-created (like "Canvas already in use" error in Chart.js).
4. **Duplicate Load Points Exception:** If the user enters multiple data coordinates with the same load (e.g. 100kg @ 0.5m/s and 100kg @ 0.4m/s), the variance in X is 0. Computing linear regression divides the covariance by variance, yielding division by zero ($0 / 0$ or $K / 0$). The slope evaluates to `NaN` or `Infinity`, which breaks `estimate1RM` and the progression table, writing `NaN` to the HTML template.
5. **RSI Threshold Issue:** The condition `jumpHeight > 5` splits behavior: values $> 5$ are assumed to be in centimeters and divided by 100 to get meters. Values $\le 5$ are assumed to be in meters. If an athlete does a test jump of exactly $5.0$ cm, it is treated as $5.0$ meters, yielding an RSI 100x higher than reality. A value of $5.1$ cm yields $0.051$ meters, creating an unnatural step boundary.

---

## 3. Caveats
- No browser-level memory profiling (Heap snapshots) was performed, as the review is limited to a CLI environment.
- The analysis assumes default Chart.js behavior regarding global instances registry, which is standard for current versions of the library.

---

## 4. Conclusion

### Quality Review Report

**Verdict**: REQUEST_CHANGES

#### Findings

##### [Critical] Finding 1 — Chart.js Instances Memory Leak
- **What**: Chart.js instances (`this.chartInstance`, `this.jumpHeightChart`, `this.rsiChart`) are not destroyed when switching dashboards or changing navigation views.
- **Where**: `js/data-analysis.js` (inside `renderVBTDashboard`, `renderJumpDashboard`, `renderRunningDashboard`) and `js/app.js` (inside `switchView`/`renderView` logic).
- **Why**: Canvas destruction without calling `.destroy()` leaks memory, causes window resize handler overhead, and can trigger Chart.js context reuse errors.
- **Suggestion**: Create a `cleanup()` method on `DataAnalysisUI` that destroys all three charts and call it in `js/app.js` before clearing the container. Additionally, ensure that each rendering method (`renderVBTDashboard`, `renderJumpDashboard`, `renderRunningDashboard`) destroys all three charts before drawing new ones.

##### [Major] Finding 2 — Discontinuity in RSI jump height conversion
- **What**: The condition `jumpHeight > 5` to convert centimeters to meters causes low jumps (e.g., 5 cm or less) to be incorrectly parsed as 5 meters.
- **Where**: `js/physics-engine.js`, line 158.
- **Why**: Results in incorrect data processing (100x inflated values) for very low jumps.
- **Suggestion**: Change the threshold to a safer value or enforce standard units. If unit conversion is needed, a better check is `jumpHeight > 2.0` (as human jump heights are rarely above 2.0 meters, and anything higher is definitely in cm).

##### [Major] Finding 3 — Division by Zero in Linear Regression
- **What**: `linearRegressionVBT` divides by 0 when input load data points have zero variance (all loads are identical).
- **Where**: `js/physics-engine.js`, line 35.
- **Why**: Causes the slope to be `NaN` or `Infinity`, which crashes subsequent calculations and renders `NaN` or `Infinity` in the UI.
- **Suggestion**: Check if `(n * sumXX - sumX * sumX) === 0` and return `null` or a default object to gracefully handle the error.

##### [Minor] Finding 4 — Missing `showLine: true` in Scatter Chart Regression Dataset
- **What**: The regression line is defined in a scatter chart using `type: 'line'`, but `showLine: true` is omitted.
- **Where**: `js/data-analysis.js`, line 639.
- **Why**: In some Chart.js versions, datasets with `type: 'line'` inside a scatter chart do not render the connection line unless `showLine: true` is explicitly set, resulting in an invisible regression line since `pointRadius` is 0.
- **Suggestion**: Add `showLine: true` to the regression dataset configuration.

#### Verified Claims
- **Claim**: VBT Linear Regression and 1RM calculation math logic -> Verified via `test_load_velocity.js` and manual analytical calculation -> **PASS**
- **Claim**: Ingestion parsing of Luca Verdi Squat data point (80kg @ 0.55m/s) -> Verified via `test_load_velocity.js` -> **PASS**

---

### Adversarial Review / Challenge Report

**Overall risk assessment**: HIGH

#### Challenges

##### [High] Challenge 1 — Memory exhaustion under long usage sessions
- **Assumption challenged**: SPA views can clear components by simply overwriting `innerHTML`.
- **Attack scenario**: A user switches back and forth between "Data Analisi" and other tabs 50 times during a long training session. Each switch creates new Chart.js instances with resize listeners attached to the window, accumulating references to dead canvases and contexts.
- **Blast radius**: Increased CPU load, page lags during resizing, and eventual OOM (Out Of Memory) crash in the user's browser.
- **Mitigation**: Implement a lifecycle cleanup handler that runs whenever a view transitions.

##### [Medium] Challenge 2 — Broken regression page on identical loads
- **Assumption challenged**: Users will always enter at least two distinct load points.
- **Attack scenario**: A trainer records two sets of Squats both at 100 kg but at different velocities (e.g. 100kg @ 0.50m/s and 100kg @ 0.45m/s).
- **Blast radius**: Linear regression computes `NaN` slope and intercept, breaking the prediction of 1RM, F0, V0, Pmax, and filling the predictive progression table with `NaN` metrics.
- **Mitigation**: Implement a check in `linearRegressionVBT` to verify that at least two distinct load levels are present, returning a helpful validation message if not.

##### [Medium] Challenge 3 — Discontinuity at 5.0 cm Jump Height
- **Assumption challenged**: A jump height $\le 5.0$ is in meters, and $> 5.0$ is in cm.
- **Attack scenario**: An athlete performs a jump of exactly 5.0 cm (or 4.5 cm).
- **Blast radius**: The system interprets it as 5.0 meters, giving an Elite RSI score of e.g. 25.0 instead of 0.25.
- **Mitigation**: Use `jumpHeight > 2.0` (or `2.5`) as the threshold for centimeter-to-meter conversion, since no athlete has a vertical jump height of 2 meters or more.

---

## 5. Verification Method

- Run the verification script:
  `node test_load_velocity.js` (or use the absolute path of Node if not in system PATH).
- Validate the issues manually in a browser environment by checking:
  1. Window resize events: Inspect `window._resources` or the list of resize event listeners in Chrome DevTools after switching tabs.
  2. Entering duplicate loads in manual entry VBT and clicking "Elabora Dati Manuali".
  3. Entering a 5.0 cm jump height in manual entry and checking the resulting RSI classification.
