# Changes Log - RAG Caching, Fallback Progress, and Developer Mode CSS Toggle

This document details all the changes made to implement the features and refactoring requested.

## Modified Files

The following files have been modified:
1. `js/rag-engine.js`
2. `js/rag-ui.js`
3. `css/style.css`
4. `sw.js`
5. `tests/test_rag_ui_adversarial.js`

No other files have been modified.

---

## Detailed Changes

### 1. `js/rag-engine.js`
- Added `this.modelProgressCallback = null;` to the constructor of `RAGEngineClass` to keep track of fallback model download progress callbacks.
- Added checking of the `file://` protocol (`window.location.protocol === 'file:'`) inside `initFallbackEngine()`.
- Set `tf.env.useBrowserCache = false` when running under `file://` to prevent browser security exceptions regarding Cache API.
- Passed `progress_callback` options into the Xenova `pipeline('feature-extraction', ...)` instantiation to capture model download status and pass it to `this.modelProgressCallback`.

### 2. `js/rag-ui.js`
- Added `this.currentStepKey = 'init';` in `RAGUI` constructor.
- Implemented `getStepText(stepKey)` method on `RAGUI` to resolve localized step descriptions dynamically based on the presence of `.dev-mode-active` on the `.rag-ui-wrapper` element.
- Refactored `render()` to append `.dev-mode-active` to `.rag-ui-wrapper` initially if developer mode is enabled.
- Removed the `hidden` class from the `#dev-progress-logs` element in the HTML template (visibility is now fully managed by CSS classes).
- Updated the Developer Mode checkbox (`#rag-dev-toggle`) event listener:
  - Toggles the `.dev-mode-active` class on `.rag-ui-wrapper` rather than calling `this.render()`, preserving the user UI state (like active search queries).
  - Dynamically updates the active progress bar status text during an upload without restarting the operation.
- Refactored semantic search score badge rendering to output both `.chunk-score` (with `.dev-only` class) and `.relevance-badge` (with `.user-only` class) simultaneously.
- Refactored uploaded document metadata rendering to output both `.dev-only` and `.user-only` description spans simultaneously.
- Modified `processNextFile()` to use step keys instead of static strings when triggering progress updates.
- Registered a callback on `window.RAGEngine.modelProgressCallback` during document saving (step 4) to capture fallback model downloading and update the progress bar from 85% to 95% dynamically.
- Cleared the callback on operation completion/failure in the `finally` block.

### 3. `css/style.css`
- Added generic `.hidden { display: none !important; }` utility class.
- Added selector rules to hide `.dev-only` elements and show `.user-only` elements by default under `.rag-ui-wrapper`.
- Added selector rules to show `.dev-only` elements and hide `.user-only` elements when `.dev-mode-active` is present on `.rag-ui-wrapper`.
- Modified `.dev-progress-logs` style to have `display: none !important;` by default, and `display: flex !important;` when `.dev-mode-active` is applied to `.rag-ui-wrapper`.

### 4. `sw.js`
- Incremented `CACHE_NAME` from `'t7-workout-v40'` to `'t7-workout-v41'` to force cache invalidation and ensure updated JS and CSS are fetched by the browser.

### 5. `tests/test_rag_ui_adversarial.js`
- Updated the Developer Mode toggle test assertion: changed from asserting that search input value is lost (the old bug behavior) to asserting that it is successfully preserved (the new expected behavior).

---

## Verification Results

1. **Syntax Checks**: Ran `py test_check.py` and confirmed syntax check passed successfully:
   ```
   All syntax checks passed.
   ```
2. **Unit Tests**: Ran `py run_tests_headless.py` and verified:
   - `test_rag.js` passes successfully (337 ms).
   - The refactored RAG UI toggle preservation works as intended.
