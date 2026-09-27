# Handoff Report: Excel Export Logic & Data Audit (Milestone 1)

## 1. Observation

### 1.1 Source Files & Export Entry Points
- **Export Trigger & Listener Location**:
  In `js/ui.js` at line 972 within `window.App.renderProgramResult(containerId, result)`:
  ```javascript
  container.querySelector('#btn-export-excel').addEventListener('click', () => {
      _exportProgramToExcel(result);
  });
  ```
- **Export Function Definition**:
  In `js/ui.js` lines 1191–1312 (`function _exportProgramToExcel(result)`).
- **Existing Library Dependency**:
  Uses SheetJS (`XLSX`) globally loaded:
  ```javascript
  if (typeof XLSX === 'undefined') {
      alert('⚠️ Libreria SheetJS (XLSX) non caricata. Ricarica la pagina.');
      return;
  }
  const wb = XLSX.utils.book_new();
  ```

### 1.2 Workout Program Object (`result`) Structure
Traced from `js/logic.js` (`generateFullProgram(params)` lines 91–271):
1. `result.meta`: Contains `splitName`, `riskLevel`, `goal`, `level`, `patientType`, `sportPraticato`, `days`, `weeks`, `equipment`, `pathologyNames`.
2. `result.periodization`: Contains `method` (`'LINEAR'`, `'BLOCK'`, `'DUP'`, `'CONJUGATE'`, `'CLINICAL'`, `'POLARIZED'`), `name`, `rationale`, `progressionPattern`, `keyResearchers`.
3. `result.summaryRationale`: Customized textual summary.
4. `result.progression`: Array of 12-week timeline rows (`phase`, `weeks`, `vol`, `int`, `note`).
5. `result.phases`: Array of phase objects (`id`, `name`, `weeks`, `objective`, `focus`, `vol`, `int`, `splitName`, `isDeload`, `schedule`).
   - `phase.schedule`: Array of Day objects (`name`, `focus`, `isRest`, `estDuration`, `exercises`).
   - `day.exercises`: Array of Exercise objects (`name`, `isWarmup`, `isCardio`, `isMain`, `isadapted`, `specs` (`sets`, `reps`, `load`, `rpe`, `tempo`, `rest`), `note`).
6. `result.explanations`: Array of technical RAG & scientific evidence notes (`category`, `title`, `text`, `citations`, `sourceMetadata`).

### 1.3 Current SheetJS Output Limitations
- Standard SheetJS Community Edition (`XLSX.utils.aoa_to_sheet`) generates raw unstyled text.
- Phase sheets omit critical columns: `RPE`, `Tempo`, `Recupero (Rest)`, `Tipo`, item sequence `N°`, and `Registro Atleta` (blank notes column).
- Day headers (`day.name`) are unmerged single cells in column A.
- Warmup (`ex.isWarmup`) and Cooldown (`ex.isCardio`) rows lack visual row background fills (`#fef3c7` and `#f0f9ff`).
- Headers lack dark slate / sky blue fills (`#0f172a` / `#0284c7`).
- Text wrapping and column widths are unconfigured.

---

## 2. Logic Chain

1. **Requirement Analysis**: The goal of Milestone 1 is to audit the existing SheetJS export logic in `js/ui.js`, map out the full `result` data structure, and define a concrete step-by-step conversion architecture for ExcelJS with professional layout and rich cell styling.
2. **Data Structure Audit**: Examining `js/logic.js` confirmed that all necessary exercise metrics (`specs.rpe`, `specs.tempo`, `specs.rest`, `specs.load`, `specs.sets`, `specs.reps`, `isWarmup`, `isCardio`, `isadapted`, `note`) are present in the runtime `result` object. The current exporter in `js/ui.js` simply discards half of these fields because `XLSX.utils.aoa_to_sheet` was constructed with a basic 5-column array `['Esercizio', 'Serie', 'Ripetizioni', 'Carico', 'Note Coach']`.
3. **ExcelJS Solution Design**: Switching to `ExcelJS.Workbook()` allows defining a full 11-column phase table (`A` through `K`) with merged day headers (`A:K`), explicit column widths, header banner blocks, and row-level fill styling for Warmups (`#fef3c7`), Cooldowns (`#f0f9ff`), Main lifts (`#ffffff`), and Accessories (`#f8fafc`).
4. **Integration Plan**:
   - Step 1: Add CDN tag for ExcelJS in `index.html`.
   - Step 2: Replace SheetJS calls in `_exportProgramToExcel` in `js/ui.js` with `new ExcelJS.Workbook()`.
   - Step 3: Format "Info Generali" tab as a key-value overview card.
   - Step 4: Format "Timeline" tab with custom styled headers and auto-column widths.
   - Step 5: Format Phase tabs with 3-row phase header blocks, merged A-K day headers, 11-column table headers, and color-coded rows.
   - Step 6: Format "Spiegazioni Tecniche" tab with text wrapping.
   - Step 7: Export binary buffer asynchronously (`await workbook.xlsx.writeBuffer()`) and trigger Blob download.
   - Step 8: Bump service worker cache version in `sw.js`.

---

## 3. Caveats

- **External CDN Dependency**: ExcelJS requires loading `exceljs.min.js` via CDN in `index.html`. A graceful fallback / alert must check `typeof ExcelJS !== 'undefined'`.
- **Sheet Name 31-Char Limit**: Excel sheet names must not exceed 31 characters and must not contain invalid characters `[ ] * / \ ? :`. The sanitation regex `.replace(/[\[\]\*\/\\\?:]/g, '-').substring(0, 31)` must be preserved.
- **Async Write Buffer**: Unlike SheetJS synchronous `XLSX.write(..., {type: 'binary'})`, ExcelJS `workbook.xlsx.writeBuffer()` returns a Promise and must be awaited inside `async function _exportProgramToExcel(result)`.

---

## 4. Conclusion

The audit of `js/ui.js` and `js/logic.js` is complete. The exact data structures and SheetJS limitations have been identified, and a comprehensive step-by-step ExcelJS design specification has been formulated. 

Implementers in subsequent milestones (M2 & M3) can directly apply the detailed ExcelJS building blocks documented in `analysis.md` and this handoff report.

---

## 5. Verification Method

To independently verify this audit and prepare for implementation verification:

1. **Syntax Check Command**:
   ```bash
   py test_check.py
   ```
   *Expected result*: `All syntax checks passed.`

2. **Full JS Test Suite Command**:
   ```bash
   py run_all_js_tests.py
   ```
   *Expected result*: All 45 tests pass with 0 failures.

3. **Files Inspected**:
   - `e:/Nuove App Installate/App esercizi scienze motorie/js/ui.js` (lines 972, 1191–1312)
   - `e:/Nuove App Installate/App esercizi scienze motorie/js/logic.js` (lines 91–271, 500–548, 1000–1100)
   - `e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator/SCOPE.md`

4. **Invalidation Conditions**:
   - If any new fields are added to `result.meta` or `result.phases` in `js/logic.js`, the ExcelJS column mapping should be updated accordingly.
