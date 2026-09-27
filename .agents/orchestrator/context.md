# Context & Background: Excel Export Overhaul Project

## Project Objectives
1. **R1: ExcelJS Integration**:
   - Add ExcelJS library CDN script tag to `index.html` (`https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js`).
   - Replace SheetJS export logic in `js/ui.js` with an ExcelJS-based implementation supporting styling, custom colors, borders, column widths, and merged cells.
2. **R2: Tab: General Info & Timeline**:
   - Overhaul "Info Generali" and "Timeline" sheets.
   - Professional styling, bold headers, clear borders, defined column widths, key-value card structures for athlete metadata and 12-week progression plan.
3. **R3: Tab: Phase Sheets Layout**:
   - Header Blocks (Rows 2-4): Phase name, focus, objectives with proper spacing and subtle borders.
   - Day Headers: Daily headers (e.g. `Giorno 1: [Focus]`) span across columns A-K (merged cells) with dark blue background (`#0c4a6e` or `#1e3a8a`) and bold white text.
   - Table Headers (`#`, `Esercizio`, `Tipo`, `Serie`, `Ripetizioni`, `Recupero`, `RPE`, `Tempo`, `Carico`, `Adattato?`, `Note Coach`): styled with blue fill (`#0284c7` or `#2563eb`) and bold white text.
   - Row Styling:
     - Warmup rows (Riscaldamento): light orange/amber background (`#fef3c7`).
     - Cardio/Cooldown rows (Defaticamento): light blue/slate background (`#f0f9ff` or `#f1f5f9`).
     - Column Alignment & Widths: auto-fitted columns with minimum thresholds, text left-aligned, numbers/reps/RPE centered.
4. **Safety & Verification Rules**:
   - Modifica solo i file necessari (`index.html`, `js/ui.js`, `sw.js`).
   - Bump SW cache version in `sw.js`.
   - Run `py test_check.py` to validate JS syntax.
   - Run `py run_tests_headless.py` and `py run_all_js_tests.py` and ensure all 19 tests pass.
