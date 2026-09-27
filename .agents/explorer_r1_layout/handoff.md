# Explorer 2 Handoff Report — HTML, CDN & Service Worker Audit

## 1. Observation

### HTML Script Tags & External Libraries (`index.html`)
- In `index.html` lines 115-123, external JS libraries are loaded in the `<body>` element right before local application scripts:
  - Line 116: `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`
  - Line 117: `<script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>`
  - Line 118: `<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>`
  - Line 119: `<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>`
  - Line 120: `<script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"></script>`
  - Line 121: `<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.js"></script>`
  - Line 122: `<script src="https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js"></script>`
- Local script files are loaded on lines 125-137 (`js/data.js` ... `js/ui.js` ... `js/app.js`).

### Current SheetJS Usage (`js/ui.js`)
- In `js/ui.js` line 1192: `_exportProgramToExcel(result)` checks `typeof XLSX === 'undefined'`.
- Lines 1202-1293: SheetJS workbook creation via `XLSX.utils.book_new()`, `XLSX.utils.aoa_to_sheet()`, and `XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })`.

### Service Worker Versioning (`sw.js`)
- In `sw.js` line 6:
  `const CACHE_NAME = 't7-workout-v47';`
- Per project rules (`AGENTS.md`), any modification to JS/CSS/asset files requires incrementing `CACHE_NAME`.

---

## 2. Logic Chain

1. **Script Placement for ExcelJS**:
   - Replacing line 117 in `index.html`:
     - Old: `<script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>`
     - New: `<script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>`
   - Reason: Placing ExcelJS in the `<!-- External Libraries -->` section before local scripts (`js/ui.js`) guarantees that global `window.ExcelJS` is defined when application UI functions execute.

2. **Global Availability & Export Behavior (`window.ExcelJS`)**:
   - The UMD bundle `exceljs.min.js` exposes `window.ExcelJS`.
   - Browser client-side export workflow using ExcelJS:
     ```javascript
     const workbook = new ExcelJS.Workbook();
     // Build sheets, apply cell fills, borders, font formatting, column widths...
     const buffer = await workbook.xlsx.writeBuffer();
     const blob = new Blob([buffer], { 
         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
     });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `Programma_${goalName}_${dateStr}.xlsx`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
     ```
   - Key differences from SheetJS:
     - `_exportProgramToExcel(result)` in `js/ui.js` must be made `async` because `workbook.xlsx.writeBuffer()` returns a Promise resolving to an `ArrayBuffer`.
     - Direct `Blob` creation with MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` eliminates the need for binary string conversion helpers like `s2ab()`.

3. **Cache Invalidation (`sw.js`)**:
   - Current cache name: `t7-workout-v47` (line 6 of `sw.js`).
   - Targeted bump version: `t7-workout-v48`.
   - Modifying `index.html` and `js/ui.js` in Milestone 2 requires updating line 6 in `sw.js` to `const CACHE_NAME = 't7-workout-v48';` to ensure clients load the new script bundle and UI logic without stale SW cache issues.

---

## 3. Caveats

- **Network Dependency**: ExcelJS script loading relies on the JSDelivr CDN (`https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js`). If offline during initial load before SW pre-caching, CDN fetch will fail unless cached.
- **Async Export Function**: Converting `_exportProgramToExcel` from synchronous to `async` requires handling error rejection gracefully (e.g., `try/catch` around `await workbook.xlsx.writeBuffer()`).

---

## 4. Conclusion

1. **CDN Script Tag**: Replace line 117 of `index.html` with:
   `<script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>`
2. **Global Access & API**: `window.ExcelJS` will be globally accessible. Workbook generation requires `const workbook = new ExcelJS.Workbook();` and buffer generation via `await workbook.xlsx.writeBuffer()`.
3. **Service Worker Bump**: Bump `sw.js` line 6 from `'t7-workout-v47'` to `'t7-workout-v48'`.

---

## 5. Verification Method

To verify these changes after implementation in Milestone 2:
1. Syntax Validation:
   ```cmd
   py test_check.py
   ```
2. Test Suite Validation:
   ```cmd
   py run_all_js_tests.py
   ```
3. Browser Verification:
   - Load `index.html` in browser.
   - Verify `window.ExcelJS` is defined in dev console (`typeof window.ExcelJS !== 'undefined'`).
   - Trigger Excel Export button (`#btn-export-excel`) and verify file download (`Programma_*.xlsx`).
   - Inspect Service Worker cache in DevTools to confirm active cache name is `t7-workout-v48`.
