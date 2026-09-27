# Dispatch: M1 Spec Miner (`TestRegistry` & Parser Detection)

- Working Directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner
- Original Request: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
- Project Scope: e:/Nuove App Installate/App esercizi scienze motorie/.agents/PROJECT.md
- Project Guidelines: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md

## Objective
Define the exact specification for Milestone 1: `TestRegistry` and Parser Instrument Detection:
1. Provide the complete JS object definitions for all 8 test types to be stored in `TestRegistry`:
   - `VBT`, `FORCE_PLATE`, `BLOCK_ACCEL`, `SPRINT_TIMING`, `VIDEO_KINEMATICS`, `JUMP_TEST`, `MEDICINE_BALL`, `GENERAL_TABULAR`.
   - For every test type, enumerate: `id`, `name`, `category`, `columns` array (key, label, unit, type, step, min, max, defaultVal, placeholder, calculated, required), `rawMappings` (case-insensitive header synonyms), `defaultSampleData` (realistic literature rows for 1-click test fill), `kpiDefinitions` (which metrics to display in summary cards), and `chartType`.
2. Detail the exact regex and keyword patterns for `MEDICINE_BALL` in `DataParser.detectInstrumentType`:
   - Keywords: `palla medica`, `medicine ball`, `medball`, `lancio`, `throw`, `shot put`, `ball mass`, `peso palla`, etc.
   - Distinctive headers: `ball_mass`, `throw_distance`, `distanza`, `peso_palla`, `flight_time`, `release_angle`.
3. Output your findings to `e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner/handoff.md` and send message to parent.

## 2026-09-11T11:15:31Z
You are the M1 Spec Miner for TestRegistry and Parser Detection.
Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner.
Read e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner/DISPATCH.md.
Also read e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md and e:/Nuove App Installate/App esercizi scienze motorie/.agents/PROJECT.md.
Detail the complete definitions for all 8 test types and keyword detection patterns for MEDICINE_BALL.
Write your report to e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner/handoff.md and send message to parent.
