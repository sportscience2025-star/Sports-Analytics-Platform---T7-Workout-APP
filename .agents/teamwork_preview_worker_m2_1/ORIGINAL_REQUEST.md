## 2026-07-25T15:44:29Z
You are Worker 1 for Milestone 2 and Milestone 3 of the Excel Export Enhancement project.
Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/teamwork_preview_worker_m2_1

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objective:
Implement the ExcelJS export upgrade across `index.html`, `sw.js`, and `js/ui.js` matching all specifications in R1, R2, and R3.

Detailed Requirements:
1. **`index.html` Integration**:
   - Add ExcelJS CDN script tag: `<script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>` right after `xlsx.full.min.js` (around line 117).
2. **`sw.js` Cache Bump**:
   - Bump `CACHE_NAME` from `'t7-workout-v47'` to `'t7-workout-v48'`.
3. **`js/ui.js` Export Functionality Overhaul**:
   - Upgrade `_exportProgramToExcel(result)` (or replace/augment it with async `_exportWithExcelJS(result)`) to build a high-quality, professional multi-tab Excel workbook using `ExcelJS.Workbook()`.
   - **Tab 1: "Info Generali"**:
     - Title banner merged `A1:D1` with dark fill (`#1E293B`) and 14pt+ bold white text: `"T7 WORKOUT - SCHEDA DI PROGRAMMAZIONE CLINICA E SPORTIVA"`.
     - Key-value card table for athlete metadata (Livello, Tipo Soggetto, Sport, Obiettivo, Durata, Frequenza, Attrezzatura, Livello Rischio, Patologie/Condizioni).
     - Periodization methodology box (Metodo, Modello, Razionale Clinico, Citazioni).
     - Clear borders, bold headers, defined column widths.
   - **Tab 2: "Timeline"**:
     - Macrocycle timeline table: Columns `['Settimane', 'Fase', 'Volume', 'Intensità', 'Focus Clinico / Metodologico']`.
     - Styled headers with blue fill (`#0F766E` or `#0284c7`) and bold white text. Clear grid lines and row alignments.
   - **Tab 3+: Phase Sheets ("Fase 1", "Fase 2", etc.)**:
     - **Header Blocks (Rows 1-4)**: Row 1 Phase Name (`#047857` fill, 14pt bold white text), Row 2 Settimane/Focus (`#334155` fill, white text), Row 3 Obiettivo (`#F8FAFC` fill, italic text).
     - **Day Headers**: Daily headers (e.g. `Giorno 1: [Focus]` or `Giorno 1: Upper Body / Spinta`) must span across columns (merged cells A:K or A:G) with dark blue background fill (`#0c4a6e` or `#1e3a8a`) and bold white text. Rest days styled with green/emerald fill (`#059669` or `#065F46`).
     - **Table Headers**: Column headers `['#', 'Esercizio', 'Tipo', 'Serie', 'Ripetizioni', 'Recupero', 'RPE', 'Tempo', 'Carico', 'Adattato?', 'Note Coach']` (or standard exercise table headers covering exercise name, specs, notes, adapt status) styled with blue fill (`#0284c7` or `#2563eb`) and bold white text.
     - **Row Styling**:
       - Warmup rows (`isWarmup` flag or warm-up exercise) colored light orange/amber background (`#fef3c7`).
       - Cardio/Cooldown rows (`isCardio` flag or cooldown exercise) colored light blue/slate background (`#f0f9ff` or `#f1f5f9`).
       - Alternating row background colors for regular rows.
     - **Column Sizing & Alignment**: Auto-fitted column widths with minimum thresholds (e.g. exercise name min width 28, notes min width 35). Text columns left-aligned, numeric/time/RPE/reps columns centered.
   - **Tab N+: "Spiegazioni Tecniche"**:
     - Columns: `['Categoria', 'Titolo / Argomento', 'Spiegazione Dettagliata']` + Safety notes + Citations.
   - **Export Serialization**:
     - Use `await workbook.xlsx.writeBuffer()` to generate Uint8Array buffer, create Blob `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, generate Object URL, and trigger download.
4. **Verification & Tests**:
   - Run `py test_check.py` using `run_command` to verify JavaScript syntax integrity.
   - Run `py run_tests_headless.py` using `run_command` to verify all 19 headless tests PASS.
   - Run `py run_all_js_tests.py` using `run_command` to verify no regressions.
5. **Output**:
   - Write `e:/Nuove App Installate/App esercizi scienze motorie/.agents/teamwork_preview_worker_m2_1/changes.md` summarizing code modifications and test execution outputs.
   - Write `handoff.md` with complete verification results.
   - Send a message when finished.
