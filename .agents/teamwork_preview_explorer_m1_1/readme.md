# Explorer Task: Client-Side RAG Exploration

## Objective
Audit the codebase to understand the existing UI view routing, the AI workout generator in `js/logic.js`, the data analysis dashboard in `js/data-analysis.js`, and the testing framework, in order to propose a concrete implementation strategy for the client-side RAG feature.

## Scope of Audit
1. View Routing & Navigation:
   - Identify where to add a new nav item and view `rag_knowledge` in `index.html`, `js/app.js`, and `js/ui.js`.
2. Core AI Generator (`js/logic.js`):
   - Locate `generateFullProgram` and explain how we can query the IndexedDB vector database and adapt program variables (sets, reps, exercise selection, volume, RPE) based on the retrieved user methodology.
3. Data Analysis Dashboard (`js/data-analysis.js`):
   - Locate how VBT parameters or profiling zones are computed and how user-defined methodologies from RAG can adapt them.
4. Testing Framework:
   - Check how tests in `tests/` are loaded by `tests/runner.html`.
5. CDNs / Libraries:
   - Check which external libraries are loaded in `index.html` and propose how to load mammoth.js and transformers.js (or fallback vectorizers).

## Output
Create `handoff.md` in this directory containing your findings and recommendations.
