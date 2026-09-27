# Handoff Report: ExcelJS CDN Integration & Service Worker Cache Management

**Agent**: Explorer 2 (Milestone 1)  
**Working Directory**: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/teamwork_preview_explorer_m1_2`  
**Date**: 2026-07-25  
**Type**: Hard Handoff (Task complete)  

---

## 1. Observation

1. **`index.html` Script Structure**:
   - File path: `e:/Nuove App Installate/App esercizi scienze motorie/index.html`
   - Lines 115–123 contain external library CDN scripts:
     ```html
     115:     <!-- External Libraries -->
     116:     <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
     117:     <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
     118:     <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
     119:     <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
     120:     <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"></script>
     121:     <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.js"></script>
     122:     <script src="https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js"></script>
     ```
   - No `<meta http-equiv="Content-Security-Policy">` tags or CSP restrictions exist in `index.html`.

2. **`sw.js` Cache Configuration**:
   - File path: `e:/Nuove App Installate/App esercizi scienze motorie/sw.js`
   - Line 6 defines current cache version:
     ```javascript
     const CACHE_NAME = 't7-workout-v47';
     ```
   - Line 73 filters cross-origin fetch events:
     ```javascript
     if (!request.url.startsWith(self.location.origin)) return;
     ```
   - `CORE_ASSETS` (lines 9–34) contains only local relative paths (`./`, `./index.html`, `./js/...`).

---

## 2. Logic Chain

1. **Placement of ExcelJS Script Tag**:
   - Observation: SheetJS (`xlsx.full.min.js`) is loaded at line 117 from `https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js`.
   - Inference: ExcelJS CDN (`https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js`) should be inserted immediately after line 117 to keep Excel processing libraries grouped together before application scripts (`js/data.js` onwards).

2. **Service Worker Versioning**:
   - Observation: `sw.js` currently uses `const CACHE_NAME = 't7-workout-v47';`.
   - Project Rule (`AGENTS.md`): "Bump SW cache: ogni volta che si modificano file JS, CSS o asset, incrementa il numero di versione della cache in `sw.js` (es: `t7-workout-v14` → `t7-workout-v15`) per invalidare la cache browser."
   - Inference: Adding ExcelJS to `index.html` modifies the application asset graph. `CACHE_NAME` must be updated to `'t7-workout-v48'`.

3. **CDN Request Interception in Service Worker**:
   - Observation: Line 73 in `sw.js` explicitly returns early if `!request.url.startsWith(self.location.origin)`.
   - Inference: Cross-origin CDN scripts are deliberately bypassed by `sw.js`. ExcelJS does not need to be registered in `CORE_ASSETS`, nor does `sw.js` require logic changes beyond the cache version bump.

4. **Security / CSP Compatibility**:
   - Observation: `index.html` already loads six libraries from `cdn.jsdelivr.net`.
   - Inference: Adding `https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js` uses an established origin and will not trigger any CSP or CORS issues.

---

## 3. Caveats

- **Network Dependency**: ExcelJS will be loaded dynamically from CDN at runtime. Offline usage relies on the browser's HTTP cache unless a local vendor file copy is added in future iterations.
- **Global Scope Availability**: `ExcelJS` will be accessible globally via `window.ExcelJS`. Code calling ExcelJS must check `typeof ExcelJS !== 'undefined'` before invoking constructor calls if network failures occur.

---

## 4. Conclusion

1. Insert `<script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>` at line 118 of `index.html`.
2. Update line 6 of `sw.js` to `const CACHE_NAME = 't7-workout-v48';`.
3. No additional CSP or Service Worker fetch changes are required.

---

## 5. Verification Method

1. Run standard JS test suite:
   ```bash
   py run_all_js_tests.py
   ```
2. Run syntax validation script:
   ```bash
   py test_check.py
   ```
3. Inspect `index.html` (lines 115-125) to verify `<script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>` is present.
4. Inspect `sw.js` (line 6) to verify `CACHE_NAME` is set to `'t7-workout-v48'`.
