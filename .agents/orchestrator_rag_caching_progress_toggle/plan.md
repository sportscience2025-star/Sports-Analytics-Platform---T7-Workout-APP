# plan.md — RAG Caching & Progress UI

## Architecture
- **RAG Engine** (`js/rag-engine.js`): Load AI model with transformers.js, perform chunking and embeddings. Needs to disable cache on `file://` by setting `transformers.env.useBrowserCache = false`. Needs to implement `progress_callback` to receive download events.
- **RAG UI** (`js/rag-ui.js`): Renders RAG interface, handles developer mode toggle, hooks up model loading progress to UI elements. Needs refactoring of Developer Mode toggle to use CSS class changes instead of `this.render()`.
- **RAG Worker** (`js/rag-worker.js`): Runs embedding task in worker thread.
- **Service Worker** (`sw.js`): Caches files, requires cache version bump after updates to js/css/assets.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Planning | Investigate codebase structure, active DOM layout, existing tests, and how RAG engine interacts with RAG UI. | None | DONE |
| 2 | Implementation | 1. Disable browser cache on file:// (`js/rag-engine.js`).<br>2. Add model download progress to UI (`js/rag-engine.js` & `js/rag-ui.js`).<br>3. Refactor Developer Mode toggle to CSS class toggling. | M1 | DONE |
| 3 | Testing & Code Safety | Validate syntax using `test_check.py`, run JavaScript test suite via `run_all_js_tests.py`, bump Service Worker cache version in `sw.js`. | M2 | DONE |
| 4 | Reporting & Handoff | Document changes, verify all checks, compile final verification evidence, send success message. | M3 | IN_PROGRESS |

## Interface Contracts
- **`rag-engine.js` ↔ `rag-ui.js`**: `progress_callback` triggers UI update in `rag-ui.js` for model download percent.
- **CSS classes**: `.dev-mode-active` toggled on main wrapper to control visibility of logs/metadata.
