# Handoff Report — Client-Side RAG Tech Spec

## 1. Observation
- **File Paths and Lines**:
  - `index.html` (Lines 41-47): Defines navigation items:
    ```html
    <nav class="main-nav">
        <a href="#" class="nav-item" data-view="catalog">Catalogo</a>
        <a href="#" class="nav-item" data-view="wizard">Programmazione</a>
        <a href="#" class="nav-item" data-view="analysis">Data Analisi</a>
        <a href="#" class="nav-item" data-view="scientific_hub">Libreria Fonti</a>
        <a href="#" class="nav-item" data-view="favorites">Preferiti</a>
    </nav>
    ```
    Line 107-112 imports external libraries: Chart.js, SheetJS, Tesseract.js, Day.js, PDF.js, and Math.js.
  - `js/logic.js` (Line 91): Defines `generateFullProgram(params)` inside class `WorkoutGeneratorAI` synchronously:
    ```javascript
    generateFullProgram(params) {
        // 1. Risk Analysis & Classification
        const exercises = (window.App?.getExercises?.()) || [];
        const riskProfile = this.analyzeRiskProfile(params.injuries || []);
    ```
  - `js/data-analysis.js` (Lines 367-369): Hardcoded MVT thresholds for VBT manual input:
    ```javascript
    if (val === 'VBT_SQUAT') mvtInput.value = '0.30';
    else if (val === 'VBT_BENCH') mvtInput.value = '0.15';
    else if (val === 'VBT_DEADLIFT') mvtInput.value = '0.15';
    ```
  - `sw.js` (Line 6): Uses the cache version:
    ```javascript
    const CACHE_NAME = 't7-workout-v33';
    ```
  - `tests/runner.html` (Lines 349-369): Lists active test files:
    ```javascript
    const testFiles = [
        'test_logic.js',
        'test_periodization_extreme_cases.js',
        // ...
    ];
    ```

---

## 2. Logic Chain
1. **Adding Mammoth.js and Web Worker**: We need to parse DOCX files. Adding `mammoth.browser.min.js` via JSDeliver CDN to `index.html` resolves this requirement (supported by `index.html` analysis).
2. **Asynchronous Hook for logic.js**: Since `generateFullProgram` is currently synchronous but IndexedDB operations are asynchronous, we must refactor it to `async generateFullProgram(params)`. This allows the UI to `await` vector queries before building the workout structure (supported by `js/logic.js` analysis).
3. **Overriding VBT Parameters**: Currently, MVT values in `js/data-analysis.js` are hardcoded. By performing semantic searches against the IndexedDB `t7_rag_db` (using query vectors generated in the Web Worker), we can retrieve specific MVT suggestions and overwrite these defaults dynamically (supported by `js/data-analysis.js` analysis).
4. **PWA Offline Support**: Bumping the version string `CACHE_NAME` in `sw.js` to at least `t7-workout-v34` and adding RAG script files to `CORE_ASSETS` ensures that service worker caches are correctly cleared and the new RAG module is available offline (supported by `sw.js` analysis).
5. **Regression/Unit Testing**: By creating `tests/test_rag.js` and appending it to `testFiles` in `tests/runner.html`, we ensure that our IndexedDB schemas and Web Worker communication are verified automatically during suite runs (supported by `tests/runner.html` analysis).

---

## 3. Caveats
- **Local Model Storage**: The model `Xenova/all-MiniLM-L6-v2` is ~45MB. While it will be cached by the browser's Cache Storage or IndexedDB after the first load, the initial download might take a few seconds depending on the user's connection. A loading state must be shown in the UI.
- **Asynchronous Flow**: Transitioning `generateFullProgram` to be asynchronous requires propagating `async/await` to calling elements in `js/app.js` and `js/ui.js` (specifically in the wizard submission handler).

---

## 4. Conclusion
The client-side RAG design using `t7_rag_db` (with `documents` and `chunks` stores) and a dedicated Web Worker (`js/rag-worker.js`) running Transformers.js is fully feasible, fits within the existing layout/PWA versioning scheme, and can be integrated into workout program generation and VBT data analysis with minimal, localized changes.

---

## 5. Verification Method
1. **Unit Testing**: Run the test suite via the CLI script:
   ```powershell
   python run_all_js_tests.py
   ```
   Or open `tests/runner.html` in the browser.
2. **RAG Test Suite Verification**: Verify that the new `tests/test_rag.js` passes under the iframe runner.
3. **Database Inspection**: Use Chrome DevTools -> Application -> IndexedDB to verify `t7_rag_db` has the correct stores (`documents` and `chunks`).
