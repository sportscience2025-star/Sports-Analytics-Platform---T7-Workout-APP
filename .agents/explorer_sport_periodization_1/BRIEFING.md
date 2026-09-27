# BRIEFING — 2026-06-16T13:42:00+02:00

## Mission
Investigate the AI program generation engine in js/logic.js to understand how to implement R1 (Sport-Specific Periodization Logic).

## 🔒 My Identity
- Archetype: Codebase Explorer
- Roles: Explorer, Investigator
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_sport_periodization_1
- Original parent: 4c1b5dc4-574e-417b-97d7-a10e9bafd4ab
- Milestone: Explorer Sport Periodization R1

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do not run any tests
- Code-only network mode (no external services or HTTP requests)

## Current Parent
- Conversation ID: 4c1b5dc4-574e-417b-97d7-a10e9bafd4ab
- Updated: 2026-06-16T13:42:00+02:00

## Investigation State
- **Explored paths**:
  - `js/logic.js` (WorkoutGeneratorAI class and global instantiation)
  - `js/ui.js` (renderWizard steps, objectives panel, collectData, and rendering layouts)
  - `js/data.js` (enrichExercise, getExercises, and database schema)
  - `index.html` (HTML structure)
- **Key findings**:
  - Found `WorkoutGeneratorAI` in `js/logic.js` which is initialized as `window.AI` globally.
  - Discovered a critical redundancy bug: the phase generator loop in `_generatePhases` tries to adjust sets/reps, but this is completely overridden in `_formatExerciseForPhase` because the latter discards the incoming specs.
  - Deload logic currently drops intensity drastically (load 50-60% RM, reps 12, RPE 5, tempo 3-0-3), which doesn't match modern sports science recommendations for high-intensity low-volume deloads.
  - "Sport Praticato" inputs are missing from both the wizard UI (`js/ui.js`) and the generator parameters.
  - Scaled weeks (4, 8, 12, 16) are selected in the UI but completely ignored in the generator, which is hardcoded to 12 weeks (6 phases).
- **Unexplored areas**:
  - None within the scope of R1.

## Key Decisions Made
- Outlined a concrete implementation plan for R1.
- Proposed a clean separation of deload week logic: clinical patients receive traditional low-load active recovery, whereas athletes receive sports-science compliant high-intensity low-volume deloads.
- Formulated a sorting/ranking scoring algorithm to prioritize sport-specific exercises in `_buildDynamicSession` rather than splitting the catalog database.
- Proposed scaling program length dynamically in 4-week mesocycles (3 weeks load + 1 week deload) which tiles perfectly into 4, 8, 12, or 16 weeks.
- Recommended consolidating all base goal formatting, sport overrides, phase-specific progressions, and deload volume reductions inside `_formatExerciseForPhase` to resolve the double-formatting bug.

## Artifact Index
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_sport_periodization_1/handoff.md — Analysis and implementation plan for R1
