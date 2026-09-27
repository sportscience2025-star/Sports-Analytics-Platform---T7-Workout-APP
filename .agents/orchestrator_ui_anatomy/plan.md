# Project Plan: UI Filtering Simplification & Anatomical Hierarchy Overhaul

## Architecture Overview
The T7 Workout PWA consists of a frontend application (vanilla JS, HTML, CSS) with exercises and muscle group mappings stored in data configuration files (`js/knowledge-base.js`, `js/data.js`, etc.) and rendered via UI modules (`js/ui.js`, `js/app.js`, etc.).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Exploration & Architecture Audit | Investigate file structures, data definitions, UI code for quick filter buttons, and muscle definitions | none | DONE |
| 2 | M2: R1 UI Filtering Simplification | Remove horizontal row of quick filter buttons, keep dropdown menu | M1 | DONE |
| 3 | M3: R2 Anatomical Hierarchy Overhaul | Restructure muscle categories in data files, remove repetitions, add "Piedi", expand muscle bellies (Italian nomenclature) | M1 | DONE |
| 4 | M4: Final Verification & Cache Bump | Run py test_check.py, py run_all_js_tests.py, bump SW cache version in sw.js | M2, M3 | IN_PROGRESS |

## Interface & Safety Requirements
- Mandatory syntax check with `py test_check.py`.
- Mandatory test suite run with `py run_all_js_tests.py`.
- Increment SW cache version in `sw.js` (e.g. t7-workout-v15 -> t7-workout-v16).
- Ensure UI bindings prevent 'undefined'.
