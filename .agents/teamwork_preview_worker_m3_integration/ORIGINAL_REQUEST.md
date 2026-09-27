## 2026-07-14T11:24:07Z
Implement Milestone 3: UI Integration & AI Hook.
You need to implement the RAG UI and hook similarity search into program generation and data analysis.

1. **RAG UI (create `js/rag-ui.js` and modify `index.html` + `css/style.css`)**:
   - Add a navigation item in `index.html` (e.g. data-view="rag") or integrate it into the Scientific Hub view. The best place is inside the main navigation (e.g., as "Knowledge Base RAG") or inside the existing Scientific Hub as a secondary tab. Let's make it a new nav tab: `<a href="#" class="nav-item" data-view="rag">Knowledge Base RAG</a>` in `index.html`'s header and `<button class="bottom-nav-item" data-view="rag">...<span>RAG KB</span></button>` in mobile bottom nav.
   - Implement the view rendering in `js/rag-ui.js` (registered in the main router inside `js/ui.js` / `js/app.js`):
     - Drag & Drop upload area for PDF, Excel, Word.
     - Progress bar display during file analysis and embedding generation.
     - Document listing showing document name, size, type, upload date, and a "Delete" button.
     - Document deletion logic calling `window.RAGEngine.deleteDocument(docId)`.
     - A search query trial box allowing users to input a test question and view retrieved text chunks sorted by similarity score.
   - Verify UI binding safety: Ensure that if values are empty, NaN, or undefined, they are handled gracefully and never show up as "undefined" on the screen.

2. **Program Generation Integration (`js/logic.js`, `js/app.js`, `js/ui.js`)**:
   - Refactor `WorkoutGeneratorAI.prototype.generateFullProgram` in `js/logic.js` to be an `async` function.
   - Before compiling the program inside `generateFullProgram`, retrieve the top 3 relevant methodology chunks from the RAG engine by executing:
     `const queryText = (params.patientObjective || '') + ' ' + (params.goal || '');`
     `const ragContexts = await window.RAGEngine.semanticSearch(queryText, 3);`
   - Use these chunks to augment the generated workout program:
     - Check if any chunk text suggests avoiding certain exercises (e.g., "evitare leg extension") and dynamically add them to the `classification.excluded` array.
     - Append retrieved methodology details as a new section or card under `explanations`.
   - Update `js/app.js` and `js/ui.js` where `generateFullProgram` is called (e.g., inside the program generator wizard's submit callback or form processor) to use `await` when calling `generateFullProgram` (since it is now an async function returning a Promise).

3. **Data Analysis Dashboard Integration (`js/data-analysis.js`)**:
   - Update `DataAnalysisUI` class in `js/data-analysis.js`:
     - When performing VBT analysis, search the RAG database for specific Minimum Velocity Thresholds (MVT) based on the athlete's name or profile.
     - If an uploaded document chunk specifies a custom MVT for an exercise (e.g., "Squat MVT di 0.45 m/s" or "panca MVT di 0.20 m/s"), extract the decimal value using a regex or simple parser, and override the default hardcoded MVT values (`0.30` or `0.15`) in the analysis calculations.

4. **Service Worker and Scripts registration**:
   - Register `js/rag-ui.js` script tag in `index.html`.
   - Bump cache version in `sw.js` (e.g., `t7-workout-v36` -> `t7-workout-v37`) and add `js/rag-ui.js` to the cache assets array.

Steps:
1. Examine `index.html`, `js/ui.js`, `js/app.js`, `js/logic.js`, `js/data-analysis.js`, and `sw.js`.
2. Write `js/rag-ui.js` and update `index.html` & `css/style.css` to add the RAG panel.
3. Modify `js/logic.js` (refactor to async, integrate similarity query) and update `js/app.js`/`js/ui.js` calls.
4. Modify `js/data-analysis.js` VBT MVT calculation.
5. Update `sw.js` cache settings.
6. Verify syntax with `py test_check.py`.
7. Run the full unit/integration test suite with `py run_all_js_tests.py` (which now includes `test_rag.js`) and ensure all 20 tests pass.
8. Document changes in `handoff.md` and report back.
