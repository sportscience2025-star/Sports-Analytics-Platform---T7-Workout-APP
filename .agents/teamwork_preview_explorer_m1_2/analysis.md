# Analysis Report: ExcelJS CDN Integration & Service Worker Cache Management

**Agent**: Explorer 2 (Milestone 1)  
**Target Files Analyzed**: `index.html`, `sw.js`  
**Date**: 2026-07-25  

---

## 1. Executive Summary
This analysis evaluates the requirements for integrating the **ExcelJS** library (`exceljs@4.4.0`) into `index.html` via CDN and updating the Service Worker (`sw.js`) cache configuration according to project conventions (`AGENTS.md`).

Key conclusions:
1. **ExcelJS CDN Placement**: `index.html` already loads multiple libraries from `https://cdn.jsdelivr.net`. The ExcelJS script tag should be added directly after the existing SheetJS (`xlsx.full.min.js`) tag in the `<!-- External Libraries -->` section (around line 118).
2. **Service Worker Cache Bump**: `sw.js` defines `const CACHE_NAME = 't7-workout-v47'`. Per project safety rules, modifying application assets requires incrementing this version to `t7-workout-v48`.
3. **Cross-Origin Handling in Service Worker**: `sw.js` explicitly bypasses cross-origin requests via `if (!request.url.startsWith(self.location.origin)) return;`. As a result, cross-origin CDN assets like ExcelJS are not pre-cached in `CORE_ASSETS` and rely on standard browser HTTP caching.
4. **Content Security Policy (CSP)**: No restrictive meta CSP tags exist in `index.html`. Since `cdn.jsdelivr.net` is already trusted and used for six other libraries, loading ExcelJS from `cdn.jsdelivr.net` introduces zero security conflicts or new origin restrictions.

---

## 2. Detailed Findings

### A. `index.html` Script Tag Structure & Placement
- **Location of External Libraries**: Lines 115-123 in `index.html`.
- **Existing CDN Tags**:
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
- **Recommended ExcelJS CDN Tag**:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>
  ```
- **Exact Target Position**: Immediately after line 117 (SheetJS script tag) and prior to internal application scripts (which start at line 125 with `js/data.js`).
- **Scope & Global Exposure**: Loading this script exposes `window.ExcelJS` globally, enabling `new ExcelJS.Workbook()` calls across `js/data-analysis.js`, `js/ui.js`, or dedicated export modules.

---

### B. Service Worker (`sw.js`) Cache Management Analysis
- **Current Cache Version**: Line 6 of `sw.js`:
  ```javascript
  const CACHE_NAME = 't7-workout-v47';
  ```
- **Cache Invalidation Requirement**: Per `AGENTS.md` guidelines ("Bump SW cache"), any modification to JS/CSS/HTML or asset structure requires incrementing `CACHE_NAME`.
  - Target value: `const CACHE_NAME = 't7-workout-v48';`
- **Asset Interception & CDN Behavior**:
  - `CORE_ASSETS` array (lines 9–34) contains local relative assets (`./`, `./index.html`, `./js/*.js`, etc.).
  - Cross-origin fetch filter at line 73:
    ```javascript
    if (!request.url.startsWith(self.location.origin)) return;
    ```
  - This ensures cross-origin CDN requests (such as `https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js`) are ignored by the Service Worker and fetched normally by the browser network stack.
  - Adding ExcelJS to `CORE_ASSETS` is **not** required nor recommended because cross-origin requests are intentionally excluded from SW pre-caching.

---

### C. Security & Content Security Policy (CSP) Assessment
- **Meta CSP Tags**: None found in `index.html`.
- **Domain Whitelisting**: `cdn.jsdelivr.net` is already used for Chart.js, SheetJS, Tesseract.js, Day.js, PDF.js, and Mammoth.js.
- **Risk Assessment**: Low/Zero risk. ExcelJS is served from `https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js`, matching existing trusted origins.

---

## 3. Concrete Instructions for Implementer

### Step 1: Update `index.html`
Insert line 118 in `index.html`:
```html
    <!-- External Libraries -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
```

### Step 2: Update `sw.js`
Update line 6 in `sw.js`:
```javascript
// BEFORE
const CACHE_NAME = 't7-workout-v47';

// AFTER
const CACHE_NAME = 't7-workout-v48';
```

---

## 4. Verification Method
1. Open `index.html` in browser or run `py run_all_js_tests.py` to confirm app loads without errors.
2. In browser Developer Tools console, verify `typeof window.ExcelJS !== 'undefined'` returns `true`.
3. Check Application -> Service Worker tab in DevTools to verify cache name updated to `t7-workout-v48`.
