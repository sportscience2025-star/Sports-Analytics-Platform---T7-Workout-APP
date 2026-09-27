# BRIEFING — 2026-09-11T13:14:00+02:00

## Mission
Survey the existing Data Analysis codebase (js/data-analysis.js, index.html, DOM structures, charts, globals, SheetJS) and produce architectural recommendations for the modular js/analysis/ structure.

## 🔒 My Identity
- Archetype: explorer
- Roles: codebase-survey, technical-investigation
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_codebase_survey
- Original parent: 1887f487-b37e-41eb-840b-e829b3df8c77
- Milestone: codebase-survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Chirurgia precisa: write only to own folder (.agents/explorer_codebase_survey)
- No emojis spontaneously in code/UI
- Maintain backward compatibility with existing tests and identifiers
- Provide evidence chain for every finding

## Current Parent
- Conversation ID: 1887f487-b37e-41eb-840b-e829b3df8c77
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `js/data-analysis.js`: 2712 lines, monolithic class `DataAnalysisUI`, current tabs, plugins, 9 dashboards.
  - `js/views/analysis-view.js`: views lifecycle, instantiates `new window.DataAnalysisUI('analysis-container')`.
  - `index.html`: external CDNs (Chart.js, XLSX, ExcelJS, etc.), script tags order.
  - `sw.js`: `CACHE_NAME = 't7-workout-v64'`, `CORE_ASSETS`.
  - `test_check.py`: 24 required tokens in `js/data-analysis.js`, cache name check, delimiter checks for modular files.
  - `js/parser.js`: `DataParser.parseExcel`, `detectInstrumentType` (supports 6 instruments, needs MEDICINE_BALL addition).
  - `js/physics-engine.js`: `PhysicsEngine` class, regression, VBT and jump physics.
  - `js/logic.js` & `js/logic/`: reference modular pattern with browser script loading + Node.js fallback loader.
  - `tests/test_chart_verification.js`, `test_vbt_fallbacks.js`, `test_multi_instrument_excel.js`.
- **Key findings**:
  - Full backward compatibility matrix documented (24 tokens for `test_check.py`, audit requirements for `sfvpDisplay` / `Number.isFinite`, chart instance variables).
  - Modular architecture mapped: 4 modules under `js/analysis/` (`test-registry.js`, `reactive-grid.js`, `medicine-ball-physics.js`, `analysis-exporter.js`), orchestrated by `js/data-analysis.js`.
  - Seamless unified layout design replaces tabbed interface with compact dropzone + polymorphic reactive grid + live 250ms debounced dashboard.
- **Unexplored areas**: None within survey scope.

## Key Decisions Made
- Architecture recommendation: Adopt the established `js/logic.js` modular pattern for `js/analysis/` with dual-mode loading (browser `<script>` tags + Node.js `fs.existsSync` dynamic loader) to preserve 100% test runner and browser compatibility.

## Artifact Index
- DISPATCH.md — Task instructions and dispatch log
- progress.md — Heartbeat and exploration progress
- handoff.md — Complete 5-component survey report
