# Project: RAG WASM Log Viewer & Ingestion Fix

## Architecture
- **RAG Ingestion Engine** (`js/rag-engine.js`): Manages Transformers.js feature extraction, chunking, and IndexedDB local storage. Under `file://` protocol, forces single-threaded WASM and disables browser cache.
- **RAG UI Layer** (`js/rag-ui.js`, `css/style.css`): Integrates user interface for document upload, semantic search, and developer-mode log display. Captures console logs and routes them dynamically.
- **Service Worker** (`sw.js`): Caches application shell assets. Incremented to invalidate local caches.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Prototyping | Research code and identify replacement targets | None | IN_PROGRESS |
| 2 | Dev Logs UI & Console Redir | Move `#dev-progress-logs` to dedicated card, intercept logs to `window.RAGUI_Logs` | M1 | PLANNED |
| 3 | Metadata & Dev Mode Toggle | Render dual metadata in `loadDocuments` and CSS toggle without DOM re-render | M2 | PLANNED |
| 4 | file:// WASM Ingestion Fix | Force single-thread WASM, disable cache on `file://`, error handling in engine | M3 | PLANNED |
| 5 | Validation & SW Bump | Increment SW Cache version, run unit tests, run syntax tests | M4 | PLANNED |

## Interface Contracts
- `window.RAGUI_Logs`: Global buffer for console logs (max 300 entries) of format `{ level: string, formatted: string }`.

## Code Layout
- `js/rag-engine.js` - Fallback engine initialization and WASM settings
- `js/rag-ui.js` - Log UI, document lists, global console interceptor
- `css/style.css` - Styles for `.dev-only` and `#dev-progress-logs`
- `sw.js` - Service worker cache version
