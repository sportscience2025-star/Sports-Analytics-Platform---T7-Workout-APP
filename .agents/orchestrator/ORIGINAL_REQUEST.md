# Original User Request

## 2026-06-28T23:56:17Z

Revisione completa del codice dell'interfaccia utente per l'identificazione e la risoluzione di problemi grafici, layout sbavati su mobile, bottoni mal allineati e contrasti di colore.

Requirements:
R1. Verifica Responsività Mobile: Identificare e correggere elementi dell'interfaccia (tabelle, card esercizi, filtri) che sbordano, risultano tagliati o mal allineati su schermi piccoli. Utilizzare esclusivamente CSS personalizzato in linea con lo stile style.css esistente, senza librerie esterne.
R2. Contrasti e Allineamento: Rivedere il design system (colori e font definiti in index.html e style.css) per risolvere problemi di contrasto e sistemare bottoni o icone non centrati nei rispettivi contenitori.

Acceptance Criteria:
- style.css contiene regole @media (max-width: 768px) adeguate per impedire lo scorrimento orizzontale non voluto sulla pagina.
- Non esistono elementi UI con colori di testo che si confondono con il loro background (verificabile analizzando i colori HEX/RGB in style.css).
- Nessuna libreria esterna (es. Bootstrap, Tailwind) è stata aggiunta nei file HTML, ma sono stati mantenuti e arricchiti i CSS vanilla del progetto.

Safety Rules:
- Run `py run_all_js_tests.py` after changes and report results.
- Bump SW cache version in `sw.js` whenever modifying JS/CSS files.
- Precise surgery on CSS/HTML files.

## 2026-07-13T21:07:32Z

You are the Project Orchestrator. Your mission is to implement a new client-side RAG knowledge base section where users can upload external documents (Excel, Word, PDF). This custom knowledge will be used to enhance the application's AI, workout programming, and data analysis algorithms to adapt to the user's methodologies.

Refer to the original user request recorded in `e:\Nuove App Installate\App esercizi scienze motorie\ORIGINAL_REQUEST.md`.

You must follow the project's Multi-Agent Safety Rules (found in `.agents/AGENTS.md` and user instructions):
- Modify only strictly necessary files (precise surgery).
- Bump SW cache version in `sw.js` whenever JS, CSS, or assets are modified.
- Run `py run_all_js_tests.py` after each set of modifications and ensure they pass.
- Syntactic Validation: Run `py test_check.py` before completing any file modification to check JS syntax.
- Extract descriptive default names from raw encoder IDs.
- Validate UI bindings to prevent "undefined" or "NaN" display.

Please initialize your plan in `.agents/orchestrator/plan.md` and update `.agents/orchestrator/progress.md` periodically. Make sure to report your completion status when all requirements are fully implemented and verified.

## 2026-07-25T17:41:09Z

# Teamwork Project Prompt: Clinical Database Expansion and UI Safety project

Analisi, espansione e messa in sicurezza del database clinico (patologie e limitazioni) utilizzato nel modulo "Salute" del sistema.

Working directory: e:/Nuove App Installate/App esercizi scienze motorie
Integrity mode: development

## Requirements

### R1. Ricerca Web ed Espansione del Database Clinico
Attualmente l'array `window.App.clinicalConditions` in `js/data.js` contiene 385 condizioni suddivise in 9 categorie. Il team deve analizzare questo elenco ed effettuare ricerche web per individuare eventuali limitazioni, patologie o infortuni sportivi comuni mancanti (es. sindromi specifiche, post-operatori frequenti, tendinopatie rare ma rilevanti per il fitness). Qualsiasi nuova condizione individuata deve essere aggiunta all'array mantenendo il formato esatto (`id`, `name`, `nameEn`, `category`, `description`, `icon`, `riskLevel`).

### R2. Verifica Integrità e Validazione
Il team deve assicurarsi che non ci siano ID duplicati o chiavi di categoria non valide nel database espanso in `js/data.js`.

### R3. Messa in Sicurezza della UI (Error Boundary)
Aggiungere una gestione degli errori ("error boundary" tramite `try...catch`) in `js/ui.js` nel momento in cui viene chiamato `window.ClinicalManager.init()`. Questo eviterà che futuri errori di sintassi nei file delle dipendenze (come quello appena corretto in `clinical.js`) blocchino l'intera interfaccia lasciando la sezione "Salute" inspiegabilmente vuota. In caso di errore, mostrare un fallback visivo a schermo.

## Acceptance Criteria

### Espansione Database
- [ ] L'array `clinicalConditions` contiene nuove condizioni rispetto alle 385 originarie, derivate da ricerche reali sul web relative a infortuni sportivi.
- [ ] Le nuove condizioni rispettano strettamente il formato dell'oggetto originale.

### Sicurezza UI
- [ ] L'inizializzazione del ClinicalManager (`window.ClinicalManager.init`) è avvolta in un blocco `try/catch`.
- [ ] In caso di fallimento dell'inizializzazione, l'interfaccia non si interrompe in modo silenzioso, ma mostra un messaggio di avviso o un fallback.

## 2026-07-25T17:42:46Z

Enhance the Excel export functionality of the workout generator to produce a highly polished, professional strength and conditioning program spreadsheet, matching the multi-tab, stylized design in the user's reference.

Working directory: e:/Nuove App Installate/App esercizi scienze motorie
Integrity mode: development

## Requirements

### R1. ExcelJS Integration
Integrate `ExcelJS` library into the application by adding the CDN script tag to `index.html`. Replace the SheetJS-based export logic in `js/ui.js` with an ExcelJS-based implementation to enable custom styling, colors, borders, column widths, and merged cells.

### R2. Tab: General Info & Timeline
Overhaul the "Info Generali" and "Timeline" sheets. Use professional styling, including bold headers, clear borders, defined column widths, and key-value card structures to display the athlete's metadata and the 12-week progression plan cleanly.

### R3. Tab: Phase Sheets Layout
Format each training phase sheet to look like a professional coach's template:
- **Header Blocks**: Row 2-4 should contain Phase name, focus, and objectives, with proper spacing and subtle borders.
- **Day Headers**: Daily headers (e.g. `Giorno 1: [Focus]`) must span across columns (merged cells) with a dark blue background fill (`#0c4a6e` or `#1e3a8a`) and bold white text.
- **Table Headers**: Column headers (`#`, `Esercizio`, `Tipo`, `Serie`, `Ripetizioni`, `Recupero`, `RPE`, `Tempo`, `Carico`, `Adattato?`, `Note Coach`) must be styled with a blue fill (`#0284c7` or `#2563eb`) and bold white text.
- **Row Styling**: 
  - Warmup rows (Riscaldamento) must have a light orange/amber background (`#fef3c7`).
  - Cardio/Cooldown rows (Defaticamento) must have a light blue/slate background (`#f0f9ff` or `#f1f5f9`).
  - Columns must have automatic width calculation with minimum thresholds, and proper text alignments (left-aligned names, centered numeric/time values).

## Verification Plan

### Automated Tests
- Run `py run_tests_headless.py` to ensure that modifying `index.html` and `js/ui.js` does not introduce any Javascript errors or break existing test suites.

### Manual Verification
- Generate a workout program and export it to Excel.
- Verify that the downloaded `.xlsx` file opens in Microsoft Excel or Google Sheets without format errors, has multiple styled tabs, and matches the visual styling shown in the user's reference image (merged day headers, colored warmup rows, and column headers).

## Acceptance Criteria

### Technical & Compatibility
- [ ] No Javascript errors on application load or during program generation.
- [ ] `py run_tests_headless.py` reports all 19 tests PASS.

### Spreadsheet Layout & Styling
- [ ] The downloaded file contains "Info Generali", "Timeline", and individual Phase tabs.
- [ ] Columns A-K are auto-fitted and aligned correctly (text left, numbers/reps/RPE center).
- [ ] Daily headers are merged and styled in dark blue with white bold text.
- [ ] Table headers are styled in medium blue with white bold text.
- [ ] Warmup exercises are colored in light amber (`#fef3c7`).
- [ ] Cardio/Cooldown exercises are colored in light blue/grey.


