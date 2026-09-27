# Scope: Excel Export Overhaul Project

## Architecture & Overview
- Target files: `index.html` (ExcelJS CDN script addition), `js/ui.js` (ExcelJS export overhaul), `sw.js` (Service Worker cache version bump).
- Target CDN: `https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js`.
- Verification tools: `py test_check.py`, `py run_tests_headless.py`, `py run_all_js_tests.py`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Exploration & Architecture Baseline | Audit index.html, js/ui.js, layout requirements, test runner | none | IN_PROGRESS |
| 2 | M2: ExcelJS Integration & Info/Timeline Sheets | ExcelJS integration, overhaul Info Generali & Timeline sheets, SW bump | M1 | PLANNED |
| 3 | M3: Training Phase Sheets Styling & Layout | Format Header blocks, merged day headers, table headers, warmup/cooldown colors, auto-widths | M2 | PLANNED |
| 4 | M4: Verification, Testing & Forensic Audit | Reviewers, Challengers, Forensic Auditor verification and test suite execution | M3 | PLANNED |

## Interface & Formatting Contracts
- Export entry point: `window.UI.exportToExcel()` / Excel export button handler in `js/ui.js`.
- Service Worker: `CACHE_NAME` in `sw.js` must be incremented.
- ExcelJS Styling Specs:
  - Day Headers: merged A-K, fill `#0c4a6e` (dark blue), text bold white (`#ffffff`).
  - Table Headers: fill `#0284c7` (blue), text bold white (`#ffffff`).
  - Warmup rows: fill `#fef3c7` (light amber).
  - Cooldown/Cardio rows: fill `#f0f9ff` (light blue/slate).
  - Column alignment: text left, numeric/time/RPE center.
  - Column widths: calculated dynamically with minimum padding.
