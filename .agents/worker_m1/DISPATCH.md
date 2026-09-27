# Dispatch: M1 Worker (`TestRegistry` & Parser Instrument Detection)

- Working Directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_m1
- Original Request: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
- Project Scope: e:/Nuove App Installate/App esercizi scienze motorie/.agents/PROJECT.md
- Project Guidelines: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own and may edit:
1. `js/analysis/test-registry.js` (NEW file to create)
2. `js/parser.js` (surgical edits)
3. `tests/test_multi_instrument_excel.js` (adding Tests 10 & 11)

Do NOT modify `js/data-analysis.js` or `sw.js` in this milestone.

## Task Instructions
Implement Milestone 1 following the authoritative specifications from M1 Explorers:
1. Create `js/analysis/test-registry.js` using the tested implementation from:
   `e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_explorer_1/proposed_test-registry.js`.
   Ensure it registers all 8 test types (`VBT`, `FORCE_PLATE`, `BLOCK_ACCEL`, `SPRINT_TIMING`, `VIDEO_KINEMATICS`, `JUMP_TEST`, `MEDICINE_BALL`, `GENERAL_TABULAR`), supports both Browser (`window.TestRegistry`) and Node.js (`module.exports`), provides deep cloning for immutability, and defensive validation.
2. Update `js/parser.js` per `e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_explorer_2/handoff.md`:
   - Add dedicated Medicine Ball keys in `parseExcelOrCSV` record template: `ballMass`, `throwDistance`, `flightTime`, `releaseAngle`, `releaseHeight`.
   - Update `hasValidData` to check `ballMass > 0`, `throwDistance > 0`, `flightTime > 0`.
   - Insert `MEDICINE_BALL` detection in `detectInstrumentType` at priority 5 (after `SPRINT_TIMING`, before `VIDEO_KINEMATICS`).
   - Add Medicine Ball header aliases in `_mapHeaders` BEFORE line 794 (Jump height `volo` check).
   - Add post-detection normalization for minimal datasets (mapping `load` and `distance` to `ballMass` and `throwDistance`).
3. Add Tests 10 & 11 to `tests/test_multi_instrument_excel.js` as detailed in `m1_explorer_2/handoff.md`.
4. Run verification commands:
   - `node tests/test_multi_instrument_excel.js`
   - `node tests/test_analysis_reactive_grid.js` (Section 1 should pass)
   - `py test_check.py`
5. Report all command outputs and results in `e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_m1/handoff.md`. Notify parent via `send_message`.

## 2026-09-11T11:19:53Z
You are M1 Worker for TestRegistry & Parser Instrument Detection.
Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_m1.
Read e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_m1/DISPATCH.md.
Also read e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md and e:/Nuove App Installate/App esercizi scienze motorie/.agents/PROJECT.md.
Follow the mandatory integrity warning.
Create js/analysis/test-registry.js and update js/parser.js and tests/test_multi_instrument_excel.js.
Run tests (node tests/test_multi_instrument_excel.js, node tests/test_analysis_reactive_grid.js, py test_check.py).
Write your report to e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_m1/handoff.md and notify parent via send_message.
