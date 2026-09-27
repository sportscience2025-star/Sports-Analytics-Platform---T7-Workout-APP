# Scope: RAG WASM & Log Viewer Card Implementation

## Architecture
- **Front-End Components**:
  - `js/rag-engine.js` runs Transformers.js model feature extraction in fallback (main thread) mode when CORS/web worker restrictions apply.
  - `js/rag-ui.js` handles file uploads, progress bars, search UI, and developer mode toggle.
  - `css/style.css` styles the application and the RAG glassmorphism cards.
  - `sw.js` manages local caching for offline PWA operations.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Force Single-Thread WASM and Disable Cache on file:// | Configure ONNX threads and disable cache inside `js/rag-engine.js` on `file://` | None | DONE (9ef736c5) |
| 2 | Dedicated System Logs Card for Developer Mode | Add log card with class `dev-only` in `js/rag-ui.js` and style `div.dev-only` to `display: block !important` when `.dev-mode-active` in `css/style.css` | None | PLANNED |
| 3 | Console Redirection to Log Card | Capture console log/warn/error inside `js/rag-ui.js` and render dynamically without full DOM rebuilds | M2 | PLANNED |
| 4 | Verification, Integration & Cache Bump | Syntax validation, run test suite, update `sw.js` cache version, and final QA | M1, M2, M3 | PLANNED |

## Interface Contracts
### `console` Interception
- Intercepted functions: `console.log`, `console.warn`, `console.error`
- Log format: `[HH:MM:SS] [LEVEL] Message`
- UI target: `<div id="rag-system-logs" class="dev-system-logs"></div>`
- Redirection must preserve output on the browser debugger console.

### ONNX Environment Configuration
- `tf.env.backends.onnx.wasm.numThreads = 1`
- `tf.env.useBrowserCache = false`
- Only applied dynamically when `window.location.protocol === 'file:'` is true.
