# BRIEFING — 2026-06-15T21:16:08Z

## Mission
Analyze code issues in js/parser.js, js/data-analysis.js, js/app.js, and js/physics-engine.js and formulate a precise fix strategy.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Read-only investigator
- Working directory: e:\Nuove App Installate\App esercizi scienze motorie\js
- Original parent: 4b415e04-b83d-43a8-a872-7b883ea64319
- Milestone: Fix Analysis and Handoff Report

## 🔒 Key Constraints
- Read-only investigation — do NOT implement changes in main codebase (only inside my folder).
- Network restricted — CODE_ONLY mode, no external connections.

## Current Parent
- Conversation ID: 4b415e04-b83d-43a8-a872-7b883ea64319
- Updated: 2026-06-15T21:16:08Z

## Investigation State
- **Explored paths**:
  - `js/parser.js` - Checked sparse row handling and header matching precedence.
  - `js/data-analysis.js` - Inspected Chart.js instantiations and potential leaks.
  - `js/app.js` - Studied navigation view router rendering and state tracking.
  - `js/physics-engine.js` - Checked linear regression, 1RM, and RSI calculations.
  - `test_load_velocity.js` - Studied existing test structure.
- **Key findings**:
  - `rows[i].filter` in `js/parser.js` will throw TypeError if the sheet contains null/undefined rows.
  - Header matching checks `jumpHeight` first; since it includes "altezza" and "height", it intercepts "altezza caduta" and "drop height" before they reach the `dropHeight` check.
  - Switching between dashboards and views creates new Chart.js charts without cleaning up previous ones, leading to memory leaks.
  - Vertical collinear points (identical loads, different velocities) result in division by zero (zero denominator) when calculating slope, producing `NaN` or `Infinity`.
  - Zero slope in regression causes division by zero in `estimate1RM`.
  - Floating point errors on collinear datasets can lead to R-squared values slightly outside `[0, 1]`.
  - RSI calculation handles centimeters vs meters with a threshold of `jumpHeight > 5`, causing a severe discontinuity for low jump heights (e.g. 3.5 cm is treated as 3.5 m).
- **Unexplored areas**: None.

## Key Decisions Made
- Proposed introducing a `cleanup()` method to `DataAnalysisUI` that destroys all three chart instances.
- Proposed calling `cleanup()` in `DataAnalysisUI` render functions and in the `js/app.js` view switcher.
- Proposed shifting the `dropHeight` header check before `jumpHeight` in `_mapHeaders`.
- Proposed returning a safe zeroed-parameter object when linear regression has a zero denominator, and guarding `estimate1RM` against `slope === 0`.
- Proposed clamping R-squared calculation to `[0, 1]` and using a small epsilon threshold (`1e-12`) to detect collinearity.
- Proposed changing the RSI unit conversion threshold to `2.0`.
- Prepared the extension of `test_load_velocity.js` to assert all fixes.

## Artifact Index
- e:\Nuove App Installate\App esercizi scienze motorie\.agents\explorer_fixes\handoff.md — Handoff report for implementer
