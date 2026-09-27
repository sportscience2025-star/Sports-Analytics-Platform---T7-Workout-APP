# Scope: RAG Redesign

## Architecture
The RAG UI component (`js/rag-ui.js`) renders the user interface in a container `#rag-container` dynamically injected by `js/app.js` when the "rag" view is active. The styling is defined in `css/style.css` (specifically in the RAG UI section starting at line 3626). The underlying indexing and search logic is powered by `js/rag-engine.js` and run in the background via `js/rag-worker.js`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Navigation & Copy Updates | Update `index.html` navigation links. Refactor titles and descriptions in `js/rag-ui.js` and add the glassmorphic info banner. | None | PLANNED |
| 2 | Premium UI Glassmorphism | Update `css/style.css` to define glassmorphic rules for `.rag-card`, `.chunk-result-card`, and clean up inline styles in `js/rag-ui.js`. | M1 | PLANNED |
| 3 | Interaction Bug Fixes | Fix drag & drop event flickering using `pointer-events: none` on child elements and clear the file input value upon upload in `js/rag-ui.js`. | M2 | PLANNED |
| 4 | Streamlined UX (Jargon Removal) | Implement user-facing text refactoring and dynamic relevance badges. Add an optional "Vista Avanzata" (Developer Mode) toggle in the RAG UI to hide/expose chunks, vector telemetry, and logs. | M3 | PLANNED |
| 5 | Cache Bump & Syntax Validation | Increment cache version in `sw.js` and run syntactical checks with `test_check.py` and test run with `run_all_js_tests.py`. | M4 | PLANNED |

## Interface Contracts
- **`RAGUI`**: Continues to mount at `#rag-container` and bind search & upload interactions.
- **State Properties**: Add `state.devMode` (default `false`) inside `RAGUI` or window state to control advanced view rendering.
