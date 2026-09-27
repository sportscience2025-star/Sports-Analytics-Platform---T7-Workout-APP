# Handoff Report — explorer_rag_wasm_log_viewer

## 1. Observation
Below are the exact observations, file paths, line numbers, and references from the codebase investigation:

*   **R1: Move `#dev-progress-logs` out of `#upload-progress-container` into its own card**
    *   File: `js/rag-ui.js`
    *   Lines 156-159:
        ```html
        <div class="rag-card dev-only rag-margin-top">
            <h3>💻 Log di Sistema (Developer Mode)</h3>
            <div id="dev-progress-logs" class="dev-progress-logs"></div>
        </div>
        ```
    *   File: `css/style.css`
    *   Lines 3920-3928:
        ```css
        .rag-ui-wrapper .dev-only {
            display: none !important;
        }
        .rag-ui-wrapper.dev-mode-active .dev-only {
            display: inline-block !important;
        }
        .rag-ui-wrapper.dev-mode-active div.dev-only {
            display: block !important;
        }
        ```
    *   Lines 3914-3916:
        ```css
        .rag-ui-wrapper.dev-mode-active .dev-progress-logs {
            display: flex !important;
        }
        ```

*   **R2: Capture console logs and append dynamically in real-time**
    *   File: `js/rag-ui.js`
    *   Lines 19-39 (setup console interception):
        ```javascript
        setupConsoleRedirection() {
            if (window.RAGUI_ConsoleRedirected) return;
            window.RAGUI_ConsoleRedirected = true;

            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;

            const appendToLogs = (level, ...args) => {
                const time = new Date().toLocaleTimeString('it-IT');
                const text = args.map(arg => {
                    if (arg instanceof Error) return arg.message + '\n' + arg.stack;
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                }).join(' ');
                
                const formatted = `[${time}] [${level}] ${text}`;
                
                if (!window.RAGUI_Logs) window.RAGUI_Logs = [];
                window.RAGUI_Logs.push({ level, formatted });
                if (window.RAGUI_Logs.length > 300) window.RAGUI_Logs.shift();

                const logsEl = document.getElementById('dev-progress-logs');
                if (logsEl) {
                    const div = document.createElement('div');
                    div.className = `log-${level.toLowerCase()}`;
                    div.textContent = formatted;
                    logsEl.appendChild(div);
                    logsEl.scrollTop = logsEl.scrollHeight;
                }
            };
        ```
    *   Lines 414-424 (upload progress logs initialization in `processNextFile`):
        ```javascript
        if (logsEl) {
            logsEl.innerHTML = '';
        }

        const addLog = (msg) => {
            if (logsEl) {
                const time = new Date().toLocaleTimeString('it-IT');
                logsEl.innerHTML += `<div>[${time}] ${msg}</div>`;
                logsEl.scrollTop = logsEl.scrollHeight;
            }
        };
        ```
    *   Line 514 (error logging in `processNextFile`'s catch block):
        ```javascript
        addLog(`ERRORE: ${err.message}`);
        ```

*   **R3: Document metadata template modification for dev/user classes**
    *   File: `js/rag-ui.js`
    *   Lines 349-352:
        ```javascript
        const metaText = `
            <span class="dev-only">${fileType} • ${chunkCount} frammenti • Caricato il ${dateStr}</span>
            <span class="user-only">${fileType} • Pronto • Caricato il ${dateStr}</span>
        `;
        ```
    *   Lines 197-210 (dev-mode toggle event handler):
        ```javascript
        devToggle.addEventListener('change', (e) => {
            this.state.devMode = e.target.checked;
            if (this.state.devMode) {
                wrapper.classList.add('dev-mode-active');
            } else {
                wrapper.classList.remove('dev-mode-active');
            }
            
            // Update dynamically the text of the progress bar if processing
            const statusTextEl = this.container.querySelector('#upload-status-text');
            if (this.isProcessing && statusTextEl && this.currentStepKey) {
                statusTextEl.textContent = this.getStepText(this.currentStepKey);
            }
        });
        ```

*   **R4: Single-threaded WASM and Cache disabler configuration under file://**
    *   File: `js/rag-engine.js`
    *   Lines 324-336 (environment settings in `initFallbackEngine()`):
        ```javascript
        // Configure transformers environment
        if (tf && tf.env) {
            tf.env.allowLocalModels = false;
            const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
            if (isFileProtocol) {
                tf.env.useBrowserCache = false;
                if (!tf.env.backends) tf.env.backends = {};
                if (!tf.env.backends.onnx) tf.env.backends.onnx = {};
                if (!tf.env.backends.onnx.wasm) tf.env.backends.onnx.wasm = {};
                tf.env.backends.onnx.wasm.numThreads = 1;
                console.log("[RAG Engine] Cache browser disabilitata su protocollo file://");
            }
        }
        ```
    *   Lines 352-355 (promise rejection catch in `initFallbackEngine()`):
        ```javascript
        } catch (error) {
            console.error("[RAG Engine] Failed to load Transformers via dynamic import:", error);
            throw error;
        }
        ```
    *   File: `js/rag-worker.js`
    *   Lines 31-35 (promise rejection catch in Web Worker model init):
        ```javascript
        } catch (error) {
            console.error("[RAG Worker] Failed to initialize model:", error);
            modelPromise = null;
            throw error;
        }
        ```

*   **R5: Service Worker and Headless Test Scripts**
    *   File: `sw.js`
    *   Line 6 (cache version):
        ```javascript
        const CACHE_NAME = 't7-workout-v45';
        ```
    *   File: `run_tests_headless.py`

---

## 2. Logic Chain
1.  **R1 Analysis**:
    *   Observation shows `#dev-progress-logs` is already defined inside a card element `<div class="rag-card dev-only rag-margin-top">` with class `dev-only`, separate from the card containing `#upload-progress-container`.
    *   The CSS selectors `.rag-ui-wrapper .dev-only` (hidden by default) and `.rag-ui-wrapper.dev-mode-active .dev-only` (visible as block or inline-block) correctly handle toggling.
    *   Therefore, the layout and CSS rules are already fully correct and require no modifications.
2.  **R2 Analysis**:
    *   Observation shows that `processNextFile()` clears `#dev-progress-logs`'s HTML (`logsEl.innerHTML = '';`) and defines a local `addLog` helper that manually appends text to `#dev-progress-logs`.
    *   Because `addLog` does not write to the console, its logs bypass the `console` redirection, meaning they are never stored in the historical `window.RAGUI_Logs` cache. Any UI re-render or toggle will wipe them out.
    *   Wiping the logs at file upload start also deletes older system/console log history from the card.
    *   To fix this, `processNextFile()` should not wipe the log box, and `addLog` should route messages through `console.log(...)` (and `console.error(...)` in the catch block). This way, every step of document indexing is captured in `window.RAGUI_Logs` and rendered in real-time.
3.  **R3 Analysis**:
    *   Observation shows that `loadDocuments()` populates documents metadata rendering both `dev-only` and `user-only` `span` elements.
    *   Toggling the switch adds/removes `.dev-mode-active` class to the wrapper. CSS selector `.rag-ui-wrapper.dev-mode-active .dev-only` automatically changes their display state without re-rendering the DOM.
    *   Toggling dev mode does not touch variables/flags of active upload (`this.isProcessing`), thus the active upload state remains entirely unaffected. No changes are required.
4.  **R4 Analysis**:
    *   Observation shows `tf.env.useBrowserCache = false` and `tf.env.backends.onnx.wasm.numThreads = 1` are properly configured in `js/rag-engine.js` when `isFileProtocol` is true.
    *   Rejections in fallback engine initialization (`initFallbackEngine`) and worker model loading (`initModel`) are properly caught in try-catch blocks and logged using `console.error(...)`.
5.  **R5 Analysis**:
    *   The cache version is defined in `sw.js` on line 6. Incrementing it invalidates browser caches.
    *   The script `run_tests_headless.py` starts a server and runs Chrome/Edge in `--headless=new` mode, sending POST results to `/test-results`.

---

## 3. Caveats
*   Redirection of console methods is set up globally on `window` when `RAGUI` is instantiated. If logs are emitted before the RAG view is visited at least once, those early logs won't be captured.
*   The tests inside `tests/` were not fully executed as we are a read-only explorer, but the `run_tests_headless.py` and `run_all_js_tests.py` scripts are correctly defined.

---

## 4. Conclusion & Proposed Code Changes
The requested layout, WASM, cache, and metadata configurations are already correctly implemented.
The only component requiring modification is the log capturing and rendering behavior in `js/rag-ui.js` (R2) and the cache version bump in `sw.js` (R5).

### Proposed Changes for `js/rag-ui.js`

#### Chunk 1: Update local `addLog` helper inside `processNextFile` to route through console.log and prevent log clear
**File**: `js/rag-ui.js`  
**Target lines**: 414-424  
**Target Content**:
```javascript
            if (logsEl) {
                logsEl.innerHTML = '';
            }

            const addLog = (msg) => {
                if (logsEl) {
                    const time = new Date().toLocaleTimeString('it-IT');
                    logsEl.innerHTML += `<div>[${time}] ${msg}</div>`;
                    logsEl.scrollTop = logsEl.scrollHeight;
                }
            };
```
**Replacement Content**:
```javascript
            const addLog = (msg) => {
                console.log(msg);
            };
```

#### Chunk 2: Route file processing error to `console.error`
**File**: `js/rag-ui.js`  
**Target lines**: 512-516  
**Target Content**:
```javascript
            } catch (err) {
                console.error("Error processing file in RAG UI:", err);
                addLog(`ERRORE: ${err.message}`);
                alert(`Errore durante il caricamento di "${file.name}": ` + err.message);
```
**Replacement Content**:
```javascript
            } catch (err) {
                console.error("Error processing file in RAG UI:", err);
                console.error(`ERRORE: ${err.message}`);
                alert(`Errore durante il caricamento di "${file.name}": ` + err.message);
```

### Proposed Changes for `sw.js` (Cache Version Bump)

#### Chunk 3: Bump the service worker cache version
**File**: `sw.js`  
**Target lines**: 6-6  
**Target Content**:
```javascript
const CACHE_NAME = 't7-workout-v45';
```
**Replacement Content**:
```javascript
const CACHE_NAME = 't7-workout-v46';
```

---

## 5. Verification Method
1.  **Syntax Verification**: Run `python test_check.py` to ensure javascript syntax validity of `js/rag-ui.js` and `sw.js` post-modification.
2.  **Headless Tests Run**: Execute `python run_tests_headless.py` or `python run_all_js_tests.py` to confirm all tests pass successfully.
3.  **UI & Logs Verification**:
    *   Open the application, navigate to the RAG UI section.
    *   Toggle Developer Mode on. Verify that the "Log di Sistema (Developer Mode)" card appears and shows the initialization console logs.
    *   Upload a PDF or TXT document. Verify that progress messages appear inside `#dev-progress-logs` in real-time, prefixed with timestamp and level (e.g. `[11:00:00] [INFO] Lettura file in corso...`).
    *   Toggle Developer Mode off and on again. Confirm that the logs inside "Log di Sistema" are preserved and not lost or re-rendered, and that the upload status is still showing.
