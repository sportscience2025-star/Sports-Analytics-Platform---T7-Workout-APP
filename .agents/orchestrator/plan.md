# Project Plan: Excel Export Overhaul Project

## Overview
This project overhauls the Excel export functionality of the T7 Workout PWA. It replaces SheetJS with ExcelJS (`https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js`) in `index.html` and `js/ui.js` to enable rich formatting, custom styling, colors, borders, merged cells, auto column widths, and proper cell alignments in exported `.xlsx` files.

## Work Breakdown & Milestones

### Milestone 1: Architectural Exploration & Test Suite Baseline (M1)
- Dispatch 3 Explorers (`teamwork_preview_explorer`):
  - **Explorer 1 (`.agents/teamwork_preview_explorer_m1_1/`)**: Audit `index.html` for ExcelJS CDN integration and `js/ui.js` for existing export functions and SheetJS usage.
  - **Explorer 2 (`.agents/teamwork_preview_explorer_m1_2/`)**: Analyze R2 and R3 formatting specs ("Info Generali", "Timeline", Phase header blocks, merged day headers `#0c4a6e`, table headers `#0284c7`, warmup rows `#fef3c7`, cooldown rows `#f0f9ff`, auto-width calculations).
  - **Explorer 3 (`.agents/teamwork_preview_explorer_m1_3/`)**: Audit test execution environment (`py test_check.py`, `py run_tests_headless.py`, `py run_all_js_tests.py`), verify baseline test pass rate (19/19), and design export verification checks.

### Milestone 2: ExcelJS Integration, General Info & Timeline Sheets (M2)
- Synthesize Explorer findings.
- Dispatch Worker (`teamwork_preview_worker`):
  - Integrate ExcelJS script tag into `index.html` if missing/unverified.
  - Overhaul export function in `js/ui.js` with ExcelJS workbook creation (`ExcelJS.Workbook`).
  - Implement styled "Info Generali" sheet with athlete metadata cards, clear borders, defined column widths.
  - Implement styled "Timeline" sheet with 12-week progression plan layout.
  - Bump SW cache version in `sw.js` (e.g. `t7-workout-v49`).
  - Run syntax check (`py test_check.py`) and test suite (`py run_tests_headless.py`).

### Milestone 3: Training Phase Sheets Formatting & Styling (M3)
- Dispatch Worker (`teamwork_preview_worker`):
  - Format Phase header blocks (Rows 2-4: Phase name, focus, objectives with subtle borders).
  - Format Day Headers: merged cells across cols A-K, dark blue fill (`#0c4a6e`), bold white text.
  - Format Table Headers (`#`, `Esercizio`, `Tipo`, `Serie`, `Ripetizioni`, `Recupero`, `RPE`, `Tempo`, `Carico`, `Adattato?`, `Note Coach`): blue fill (`#0284c7`), bold white text.
  - Format Row Styling: Warmup rows light amber (`#fef3c7`), Cardio/Cooldown rows light blue/slate (`#f0f9ff`).
  - Set auto-fitted column widths with minimum thresholds and cell alignments (left for text, center for numbers/RPE).
  - Validate syntax (`py test_check.py`) and tests (`py run_tests_headless.py`).

### Milestone 4: Comprehensive Review, Verification & Forensic Audit (M4)
- Dispatch 2 Reviewers (`teamwork_preview_reviewer`), 2 Challengers (`teamwork_preview_challenger`), and 1 Forensic Auditor (`teamwork_preview_auditor`).
- Reviewers: verify code elegance, styling specs conformance, SW version bump, and syntax validity.
- Challengers: run stress tests on export function across various workout configurations and verify generated workbook structure.
- Forensic Auditor: perform static and dynamic integrity audit to ensure no hardcoded data or facade implementations exist.
- Gate Check: Ensure 100% test pass (19/19), Reviewer approval, Challenger pass, and Forensic Auditor CLEAN verdict.
- Issue victory report to Sentinel and main agent.
