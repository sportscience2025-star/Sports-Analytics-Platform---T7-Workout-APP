# Dispatch: Spec and Requirements Miner

- Working Directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/spec_miner_survey
- Original Request: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
- Project Guidelines: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md

## Task Description
Mine and formalize the complete, rigorous specification from ORIGINAL_REQUEST.md and AGENTS.md for the Data Analysis architecture overhaul.
Specifically:
1. Enumerate all 8 biomechanical test types required for `TestRegistry` (VBT, Force Plate, IMU, Sprint Photocells, 2D Videoanalysis, Vertical Jumps, MEDICINE_BALL, General Tabular). Detail all columns, units, types, placeholders, validation, default formulas.
2. Formulate the exact physical and mathematical models for `MEDICINE_BALL`:
   - Launch speed $v_0$ calculation: ballistic trajectory with release height $h_0$, range $d$, release angle $\theta$, acceleration of gravity $g = 9.81 m/s^2$.
   - Sayers & Harman equations for peak/mean power ($P_{mean}$, $P_{peak}$).
   - Default fallbacks: angle $45^\circ$, release height $1.0m$, push duration $0.18s$, etc.
3. Detail the UX/UI requirements:
   - Unified seamless flow: compact dropzone, test and athlete selector.
   - Reactive grid: headers, in-place editing, add/remove row, rapid sample data insertion.
   - File ingestion auto-detection rules for CSV/Excel.
   - Debounced live-binding (250ms) updating KPI and Chart.js without manual calculation buttons.
   - Robust handling of partial data without 'undefined' or 'NaN'.
4. Detail the Excel export (.xlsx) requirements:
   - 2 worksheets: "Dati Prove" and "Sintesi Biomeccanica & KPI".
   - Zero locked cells, zero passwords. Coach notes section.
5. Detail safety and compliance rules (no spontaneous emojis, sw.js cache bump, test_check.py compatibility, modular file structure in js/analysis/).

Output your detailed report to `e:/Nuove App Installate/App esercizi scienze motorie/.agents/spec_miner_survey/handoff.md`.
Use `send_message` to notify orchestrator upon completion.

## 2026-09-11T11:10:44Z

You are the Spec and Requirements Miner.
Your working directory is e:/Nuove App Installate/App esercizi scienze motorie/.agents/spec_miner_survey.
Read your instructions in e:/Nuove App Installate/App esercizi scienze motorie/.agents/spec_miner_survey/DISPATCH.md.
Also read e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md and e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md.
Mine all specifications, formulas, test types, and requirements, and output your comprehensive report to e:/Nuove App Installate/App esercizi scienze motorie/.agents/spec_miner_survey/handoff.md.
When finished, send a message to parent with your summary.
