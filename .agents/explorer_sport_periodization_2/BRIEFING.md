# BRIEFING — 2026-06-16T11:31:00Z

## Mission
Explore the Excel export logic and UI wizard to understand how to implement R2 (Coach-Friendly Unlocked Excel Export) and R4 (Wizard UI Update).

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Codebase Explorer 2
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_sport_periodization_2
- Original parent: 4c1b5dc4-574e-417b-97d7-a10e9bafd4ab
- Milestone: Exploration and Analysis of Excel Export & Wizard UI

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do not write or edit any source files (e.g. `js/ui.js`, `index.html`, etc.)
- Do not run any tests
- Code only network mode: No external internet access, use local search only

## Current Parent
- Conversation ID: 4c1b5dc4-574e-417b-97d7-a10e9bafd4ab
- Updated: 2026-06-16T11:31:00Z

## Investigation State
- **Explored paths**:
  - `index.html` (external script check: SheetJS/xlsx is loaded on line 95)
  - `js/app.js` (router check: calls `window.App.renderWizard` and `window.App.renderProgramResult` for the wizard view)
  - `js/ui.js` (wizard UI definitions, collects form parameters, defines `_exportProgramToExcel` generating SpreadsheetML `.xls` strings on line 943)
  - `js/logic.js` (workout generation engine, defines `window.AI.generateFullProgram` on line 71)
- **Key findings**:
  - Excel export in `_exportProgramToExcel` does not use the loaded SheetJS library; it generates SpreadsheetML markup and downloads it with a `.xls` extension, which triggers security warnings in Excel and has highly merged, rigid cells.
  - Wizard UI weeks selection (4, 8, 12, 16) is already available as input, but periodization generation in `js/logic.js` is currently hardcoded to 12 weeks.
  - Wizard UI lacks any dropdown for "Sport Praticato" (Endurance, Sport di Squadra, Bodybuilding).
- **Unexplored areas**: None. The logic path is fully mapped.

## Key Decisions Made
- Recommend rewriting `_exportProgramToExcel` using SheetJS (`window.XLSX`) for native, fully unlocked `.xlsx` exports.
- Propose dynamic week scaling in `js/logic.js` using a blueprint allocation mapping.
- Propose sport selection dropdown in Step 1 of the wizard and integrate athletic routing into `_formatExerciseForPhase`.

## Artifact Index
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_sport_periodization_2/ORIGINAL_REQUEST.md — Original request instructions
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_sport_periodization_2/BRIEFING.md — Current agent briefing and working memory
