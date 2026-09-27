# Original User Request

## Initial Request — 2026-07-17T11:06:04+02:00

# Teamwork Project Prompt

Fix RAG upload hanging at 85% by forcing single-threaded WASM and disabling caching. Create a dedicated real-time log viewer card for Developer Mode that redirects console outputs to the UI without DOM re-renders.

Working directory: e:/Nuove App Installate/App esercizi scienze motorie
Integrity mode: development

## Requirements

### R1. Dedicated System Logs Card for Developer Mode
Move the `#dev-progress-logs` element out of the `#upload-progress-container` and place it inside its own dedicated card: `💻 Log di Sistema (Developer Mode)` using the `dev-only` class. Update `css/style.css` so that `div.dev-only` displays as `block !important` when `.dev-mode-active` is active.

### R2. Global Console Redirection
Intercept and capture global console outputs (`console.log`, `console.warn`, `console.error`) inside `js/rag-ui.js`. Store them in a persistent global buffer (e.g., `window.RAGUI_Logs`) up to 300 entries, and append them dynamically to the `#dev-progress-logs` element in real-time. On UI render, populate the logs card with the existing log history.

### R3. Smooth Metadata and Toggle Updates
Modify the document metadata template in `loadDocuments` to render both standard and developer metadata (using `user-only` and `dev-only` classes) so that metadata toggles instantly via CSS without full DOM re-renders. Ensure that toggling Developer Mode preserves active upload state.

### R4. Prevent Ingestion Stall on file://
Verify that `js/rag-engine.js` correctly configures single-threaded WASM (`tf.env.backends.onnx.wasm.numThreads = 1`) and disables caching (`tf.env.useBrowserCache = false`) under `file://` protocol. Ensure all promise rejections in `initFallbackEngine` and model loading are logged to the console so they are caught by the redirector.

### R5. SW Cache Bump & Test Validation
Run the headless test suite `py run_tests_headless.py` and verify that the RAG unit tests pass. Increment the Service Worker cache version in `sw.js` (e.g. `t7-workout-v45` -> `t7-workout-v46`).

## Acceptance Criteria

### Developer Mode Log Panel
- [ ] Toggling "Vista Avanzata" immediately shows the `💻 Log di Sistema` card on the left column.
- [ ] The log card displays all past console outputs and updates in real-time as new console messages are printed.
- [ ] Document metadata toggles instantly when dev mode is switched.

### Upload Hang Verification
- [ ] Ingestion no longer blocks indefinitely at 85%. If an error occurs during model fetch/compilation, it is logged and alerted to the user.
