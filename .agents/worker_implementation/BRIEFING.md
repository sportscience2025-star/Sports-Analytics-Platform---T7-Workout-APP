# BRIEFING — 2026-07-13T20:59:41Z

## Mission
Repair corrupted tests, implement personalized warm-up & cool-down logic, update UI selection cards, bump service worker cache, and verify all tests pass.

## 🔒 My Identity
- Archetype: Implementer & QA
- Roles: implementer, qa, specialist
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_implementation
- Original parent: e2576703-a78b-4c1f-9915-5c080e6a36ae
- Milestone: Feature Implementation and Test Restoration

## 🔒 Key Constraints
- CODE_ONLY network mode: No external network access.
- Precision surgery: Modify only necessary files.
- Cache version bump in `sw.js` (e.g., 't7-workout-v31' -> 't7-workout-v32').
- JS syntax validation via `py test_check.py` is mandatory.
- Run `py run_all_js_tests.py` and verify all 17 tests pass.
- No dummy/facade implementations.
- Parse ID correctly, validate UI binding to prevent "undefined".

## Current Parent
- Conversation ID: e2576703-a78b-4c1f-9915-5c080e6a36ae
- Updated: not yet

## Task Summary
- **What to build**: Personalized warmup/cooldown routines in `js/logic.js`, new options in `js/ui.js`, bump cache in `sw.js`, repair 4 corrupted test files (`tests/test_adversarial_physics.js`, `tests/test_chart_verification.js`, `tests/test_periodization_stress.js`, `tests/test_regression_edge_cases.js`).
- **Success criteria**: Syntax check passing, all 17 unit/integration tests passing.
- **Interface contracts**: `_addWarmupByPhase` and `_addCooldownByPhase` signatures in `js/logic.js`.
- **Code layout**: Source in `js/`, tests in `tests/`.

## Key Decisions Made
- [TBD]

## Artifact Index
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_implementation/ORIGINAL_REQUEST.md — Copy of original instructions

## Change Tracker
- **Files modified**: [TBD]
- **Build status**: [TBD]
- **Pending issues**: [TBD]

## Quality Status
- **Build/test result**: [TBD]
- **Lint status**: [TBD]
- **Tests added/modified**: [TBD]

## Loaded Skills
- None loaded.
