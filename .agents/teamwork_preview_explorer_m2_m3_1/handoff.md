# Handoff Report: Milestone 2 & 3 Design for RAG System Log and Console Interception

This report details the investigation, design decisions, and precise implementation instructions for adding the Developer Mode system log card (Milestone 2) and capturing global console outputs safely using an in-memory buffer and direct DOM manipulation (Milestone 3).

---

## 1. Observation

During the read-only investigation, the following files and code blocks were examined:

1. **`js/rag-ui.js`**
   - The RAG UI is wrapped in an immediately invoked function expression (IIFE):
     ```javascript
     (function () {
         class RAGUI {
             constructor(containerId) { ... }
             async render() { ... }
             // ...
         }
         window.RAGUI = RAGUI;
     })();
     ```
   - Inside `render()` (around lines 112–128), the layout is divided into a left column (`rag-col` for uploading and listing docs) and a right column (`rag-col` for search trial):
     ```javascript
     <!-- Colonna Destra: Ricerca Trial -->
     <div class="rag-col">
         <div class="rag-card">
             <h3>🔍 Ricerca Semantica Trial</h3>
             ...
         </div>
     </div>
     ```
   - The developer toggle event listener (lines 135–152) adds or removes the `.dev-mode-active` class on `.rag-ui-wrapper` but does **not** trigger a full `this.render()`, preserving the user's focus/form state.

2. **`css/style.css`**
   - The dev-only rules are defined at lines 3920–3931:
     ```css
     .rag-ui-wrapper .dev-only {
         display: none !important;
     }
     .rag-ui-wrapper.dev-mode-active .dev-only {
         display: inline-block !important;
     }
     ```
   - Monospace developer console log container styling (`.dev-progress-logs`) is defined at lines 3899–3913. It is set to `display: none !important` by default and becomes `display: flex !important` when `.dev-mode-active` is active.

3. **`sw.js`**
   - The Service Worker cache name is defined at line 6:
     ```javascript
     const CACHE_NAME = 't7-workout-v44';
     ```

4. **`tests/test_rag_ui_adversarial.js`**
   - Headless test verification suite contains RAG UI verification assertions. Running `py run_single_test.py test_rag_ui_adversarial.js` confirms that all current tests for RAG UI pass successfully.

---

## 2. Logic Chain

The step-by-step reasoning from observations to the proposed design is as follows:

1. **Milestone 2 Card Placement and CSS Update**:
   - The new card `💻 Log di Sistema (Developer Mode)` needs to be added inside `js/rag-ui.js` as a card marked with the `dev-only` class. Placing it in the right column beneath the "Ricerca Semantica Trial" card balances the two-column grid layout.
   - Since card elements are block-level wrappers (`div`), they should be rendered as block-level elements when visible. However, the existing rule `.rag-ui-wrapper.dev-mode-active .dev-only { display: inline-block !important; }` in `css/style.css` overrides this. 
   - Therefore, a more specific rule targeting `div.dev-only` elements:
     ```css
     .rag-ui-wrapper.dev-mode-active div.dev-only {
         display: block !important;
     }
     ```
     must be added to `css/style.css` to guarantee they render as block containers and maintain layout integrity.

2. **Milestone 3 Global Console Interception**:
   - To safely capture outputs of `console.log`, `console.warn`, and `console.error` immediately upon loading, we must override the global `console` methods at the beginning of the IIFE in `js/rag-ui.js`.
   - By capturing reference to the original methods (`originalLog = console.log`, etc.) and invoking them using `.apply(console, arguments)`, we preserve the standard browser developer tools logs and maintain compatibility with test runner overrides (e.g. `tests/iframe_runner.html`).
   - A private `logBuffer` array is introduced in the IIFE scope to store logs as `{ type, message, timestamp }` objects. This serves as the in-memory buffer before the DOM renders. We cap its size at 200 logs to prevent memory bloat.

3. **Populating the DOM and Appending Without Re-rendering**:
   - When `RAGUI.render()` executes, it generates the DOM. We identify the log container `#system-logs-container` inside the newly inserted card, empty its content, and populate it with all entries currently stored in `logBuffer`.
   - When subsequent console logs are fired, if `#system-logs-container` exists in the DOM, we directly append a newly constructed `div` child element to it. This dynamic DOM append operation bypasses `this.render()`, satisfying the requirement to avoid DOM re-renders and protecting active file uploads, input focus, and search state.

4. **Service Worker Version Bump**:
   - Since both `js/rag-ui.js` and `css/style.css` are modified, `sw.js` must be updated to invalidate browser cache by bumping the cache name version to `t7-workout-v45`.

---

## 3. Caveats

- **Test Suite Execution**: The browser tests must be run headlessly (e.g. via `py run_tests_headless.py`) because of the lack of interactive display environments in typical terminal sessions.

---

## 4. Conclusion & Proposed Code Modifications

The proposed implementation details are highly precise and ready to be applied.

### Modification 1: `js/rag-ui.js`
*   **Location**: Immediately after the opening IIFE statement (Line 6).
*   **Description**: Define console override wrappers, log buffering, and DOM appending helper logic.
*   **Code to Insert**:
    ```javascript
        // Console output interception and buffering for Developer Mode
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        const logBuffer = [];
        const MAX_BUFFER_SIZE = 200;

        function handleLog(type, args) {
            let message = '';
            try {
                message = args.map(arg => {
                    if (arg === null) return 'null';
                    if (arg === undefined) return 'undefined';
                    if (typeof arg === 'object') {
                        try {
                            return JSON.stringify(arg);
                        } catch (e) {
                            try {
                                return String(arg);
                            } catch (err) {
                                return '[Object]';
                            }
                        }
                    }
                    try {
                        return String(arg);
                    } catch (err) {
                        return '[Unrepresentable value]';
                    }
                }).join(' ');
            } catch (e) {
                message = '[Error formatting log message]';
            }

            const timestamp = new Date().toLocaleTimeString('it-IT');
            const logEntry = { type, message, timestamp };

            logBuffer.push(logEntry);
            if (logBuffer.length > MAX_BUFFER_SIZE) {
                logBuffer.shift();
            }

            const container = document.getElementById('system-logs-container');
            if (container) {
                appendLogToDOM(container, logEntry);
            }
        }

        function appendLogToDOM(container, log) {
            const logEl = document.createElement('div');
            logEl.style.wordBreak = 'break-all';
            logEl.style.lineHeight = '1.4';

            if (log.type === 'warn') {
                logEl.style.color = 'var(--warning, #f59e0b)';
            } else if (log.type === 'error') {
                logEl.style.color = 'var(--danger, #ef4444)';
            } else {
                logEl.style.color = 'var(--accent, #06d6a0)';
            }

            logEl.textContent = `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`;
            container.appendChild(logEl);
            container.scrollTop = container.scrollHeight;
        }

        // Override console methods to capture logs
        console.log = function (...args) {
            originalLog.apply(console, args);
            handleLog('log', args);
        };

        console.warn = function (...args) {
            originalWarn.apply(console, args);
            handleLog('warn', args);
        };

        console.error = function (...args) {
            originalError.apply(console, args);
            handleLog('error', args);
        };
    ```

*   **Location**: Inside the `render()` method, within the right column HTML string (under `search-results-container`).
*   **Target lines to edit**: Inside the `this.container.innerHTML` assignment, append the card structure after the closing of `search-results-container`'s card wrapper.
*   **Diff snippet**:
    ```html
                                    <div id="search-results-container" class="rag-margin-top">
                                        <p class="empty-list-msg">Inserisci una query per visualizzare i risultati della ricerca semantica.</p>
                                    </div>
                                </div>
    
                                <!-- Card Log di Sistema (Developer Mode) -->
                                <div class="rag-card rag-margin-top dev-only">
                                    <h3>💻 Log di Sistema (Developer Mode)</h3>
                                    <div id="system-logs-container" class="dev-progress-logs" style="max-height: 250px;"></div>
                                </div>
                            </div>
    ```

*   **Location**: Immediately after the `innerHTML` assignment (around line 131).
*   **Description**: Populate the log card with the buffered messages on render.
*   **Code to Insert**:
    ```javascript
                // Populate the system logs container with buffered logs
                const systemLogsContainer = this.container.querySelector('#system-logs-container');
                if (systemLogsContainer) {
                    systemLogsContainer.innerHTML = '';
                    logBuffer.forEach(log => appendLogToDOM(systemLogsContainer, log));
                }
    ```

### Modification 2: `css/style.css`
*   **Location**: Right after line 3925.
*   **Description**: Ensure that the card with the `dev-only` class is displayed as `block !important` (instead of `inline-block !important`) when Developer Mode is active.
*   **Code to Insert**:
    ```css
    .rag-ui-wrapper.dev-mode-active div.dev-only {
        display: block !important;
    }
    ```

### Modification 3: `sw.js`
*   **Location**: Line 6.
*   **Description**: Increment the Service Worker cache version number.
*   **Target Content**:
    ```javascript
    const CACHE_NAME = 't7-workout-v44';
    ```
*   **Replacement Content**:
    ```javascript
    const CACHE_NAME = 't7-workout-v45';
    ```

---

## 5. Verification Method

To verify the correct functionality of the implemented design:

1.  **Execute the automated tests**:
    Run the headless test suite from the root directory:
    ```powershell
    py run_tests_headless.py
    ```
    Verify that the test execution finishes successfully and report results.
2.  **Verify syntax checks**:
    Run `py test_check.py` to ensure that there are no syntax errors introduced in the modified files.
3.  **Manual Verification Steps**:
    - Load the application in a browser and enable "Developer Mode" (Vista Avanzata) toggle.
    - Check that the `💻 Log di Sistema (Developer Mode)` card is displayed dynamically as a block-level card element without breaking the page layout.
    - Open the browser developer console and trigger log outputs (e.g. by performing semantic search trials or file uploads).
    - Verify that log statements, warnings, and errors appear dynamically in the scrollable log card.
    - Inspect the input fields or the file upload progress bar to verify that typing or active uploads are not interrupted or reset (verifying that re-rendering did not trigger).
