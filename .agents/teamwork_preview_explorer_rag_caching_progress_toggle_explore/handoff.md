# Handoff Report - RAG Cache, Progress Bar & Dev Mode Toggle Planning

This handoff report summarizes the read-only investigation and outlines the exact implementation plan for disabling browser cache on `file://`, connecting progress callbacks to the UI, and refactoring the Developer Mode toggle.

---

## 1. Observation

Direct observations made during codebase exploration:

- **Browser Cache Configuration**:
  In `js/rag-engine.js` (lines 324-326), `transformers.env` configuration currently only disables local models:
  ```javascript
  if (tf && tf.env) {
      tf.env.allowLocalModels = false;
  }
  ```
  No setting exists for `tf.env.useBrowserCache` on the local `file://` protocol.

- **Transformers pipeline callback**:
  In `js/rag-engine.js` (line 333), the fallback engine initializes the Xenova pipeline on the main thread:
  ```javascript
  this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  ```
  It does not pass a `progress_callback` to receive download updates, which causes the UI to stall at 85% ("Salvataggio nel database locale...") during fallback initialization.

- **Developer Mode State & Rendering**:
  In `js/rag-ui.js` (lines 112-118), toggling developer mode causes a full re-render of the component:
  ```javascript
  const devToggle = this.container.querySelector('#rag-dev-toggle');
  if (devToggle) {
      devToggle.addEventListener('change', async (e) => {
          this.state.devMode = e.target.checked;
          await this.render();
      });
  }
  ```
  This destroys user state (e.g. search query, active progress state).

- **HTML DOM Structure**:
  In `js/rag-ui.js`, the main wrapper class is `.rag-ui-wrapper` (line 21).

- **CSS Definitions**:
  In `css/style.css`, RAG UI styles start around line 3628. The console log container class `.dev-progress-logs` (lines 3899-3913) has `display: flex;` set directly and is toggled via class `hidden` in JavaScript, which is not defined generically in `css/style.css` (only for specific components).

- **Service Worker**:
  In `sw.js` (line 6), the current cache name is `'t7-workout-v40'`:
  ```javascript
  const CACHE_NAME = 't7-workout-v40';
  ```

- **Validation Tooling**:
  The project has `test_check.py` which runs a syntax verification check on all JavaScript files. Calling `py test_check.py` returns `"All syntax checks passed."`

---

## 2. Logic Chain

1. **Caching**: Under `file://` protocol, browser caching using the Cache API (which Xenova Transformers tries to access by default) is restricted by browser security policies and will fail.
   - *Therefore*, setting `tf.env.useBrowserCache = false` when `window.location.protocol === 'file:'` is necessary to prevent runtime exceptions.
2. **Download Stall**: The weight file for `'Xenova/all-MiniLM-L6-v2'` is ~90MB. When executing on `file://` (fallback engine on main thread), it must be downloaded.
   - *Therefore*, providing a `progress_callback` to the `pipeline` instantiation and exposing it via a property on `window.RAGEngine` allows `RAGUI` to subscribe to progress events.
   - *Therefore*, mapping this download progress (0-100%) to the 85-95% segment of the file upload progress bar ensures smooth, informative updates and prevents stalling.
3. **Dev Mode Toggle**: Re-rendering the entire UI on toggling 'Vista Avanzata' destroys inputs and active state.
   - *Therefore*, toggling a `.dev-mode-active` class on `.rag-ui-wrapper` allows CSS to control metadata visibility instantly.
   - *Therefore*, rendering both user and developer-specific spans (using `.user-only` and `.dev-only` classes) simultaneously in the DOM, then filtering their display property in CSS, keeps the UI interactive and lightweight.
   - *Therefore*, updating step labels dynamically mid-upload requires moving `steps` selection to a getter `this.getStepText(this.currentStepKey)` which checks the active wrapper class rather than hardcoding static text during step transitions.
4. **Cache Invalidation**: Modifying `js/rag-engine.js`, `js/rag-ui.js`, or `css/style.css` will be cached by clients running the PWA service worker.
   - *Therefore*, bumping `CACHE_NAME` to `'t7-workout-v41'` in `sw.js` is required to invalidate client-side caches.

---

## 3. Caveats

- **Network Speed / Environment**: On slow networks, fallback initialization will still take time; however, showing the file-by-file progress mitigates user frustration.
- **Worker fallback**: The Web Worker (`js/rag-worker.js`) is only bypassed on `file://` or on errors. If a worker fails for reasons other than `file://`, progress reporting won't automatically propagate to the main thread unless messages are passed back. This is correct since fallback initialization only executes on the main thread.
- **Generic `.hidden`**: We assume no other component relies on a broken `.hidden` class, but adding a general `.hidden { display: none !important; }` rule is safe and ensures the upload progress container behaves correctly.

---

## 4. Conclusion

A highly detailed plan has been written to `analysis.md` in this directory. The target changes are highly localized, surgical, and safe, satisfying all project safety rules:
1. Local `useBrowserCache` bypass on `file://` in `js/rag-engine.js`.
2. Exposing model progress callbacks to the UI during fallback initialization.
3. CSS-based toggle of `.dev-mode-active` class to replace costly `this.render()` calls.
4. Service Worker version increment in `sw.js` for cache invalidation.

---

## 5. Verification Method

- **Syntax Validation**: Run `py test_check.py` to verify JS file integrity.
- **Manual Verification**:
  1. Open the project via `file://` protocol in the browser.
  2. Perform a document upload in the RAG UI.
  3. Verify that:
     - The download of model components shows a real-time percentage and file names.
     - No security exceptions are thrown regarding the Cache API.
     - Toggling Developer Mode updates the view immediately without resetting active inputs or current progress text.
