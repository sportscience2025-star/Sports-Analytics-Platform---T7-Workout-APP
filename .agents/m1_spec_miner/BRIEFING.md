# BRIEFING — 2026-09-11T11:23:00Z

## Mission
Discover and document the complete specifications for TestRegistry (8 biomechanical test types) and DataParser detection patterns for MEDICINE_BALL.

## 🔒 My Identity
- Archetype: specification-miner
- Roles: [Specification Miner, Teamwork Specialist]
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner
- Original parent: 1887f487-b37e-41eb-840b-e829b3df8c77
- Milestone: M1 (TestRegistry & Parser Detection)

## 🔒 Key Constraints
- Read-only on production code: Do NOT implement anything in src/js (specification discovery only).
- Work strictly inside working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner.
- No spontaneous emojis in documentation or code.
- Prioritize authoritative sources (ORIGINAL_REQUEST.md, PROJECT.md, scientific literature, existing parser.js and physics-engine.js).
- Cover all 8 test types thoroughly: VBT, FORCE_PLATE, BLOCK_ACCEL, SPRINT_TIMING, VIDEO_KINEMATICS, JUMP_TEST, MEDICINE_BALL, GENERAL_TABULAR.
- Enumerate complete schema for every test type: id, name, category, columns array (key, label, unit, type, step, min, max, defaultVal, placeholder, calculated, required), rawMappings (synonyms), defaultSampleData (literature rows), kpiDefinitions, chartType.
- Detail exact regex and keyword patterns for MEDICINE_BALL detection in DataParser.detectInstrumentType and _mapHeaders.
- Output handoff report to handoff.md and send message to parent.

## Current Parent
- Conversation ID: 1887f487-b37e-41eb-840b-e829b3df8c77
- Updated: 2026-09-11T11:23:00Z

## Task Summary
- **What to build**: Specification report for M1 containing full TestRegistry definitions and parser detection rules.
- **Success criteria**: Detailed, actionable, complete JavaScript object schemas for all 8 test types, unambiguous rawMappings and regexes for MEDICINE_BALL, verified against codebase and scientific literature.
- **Interface contracts**: e:/Nuove App Installate/App esercizi scienze motorie/.agents/PROJECT.md
- **Code layout**: e:/Nuove App Installate/App esercizi scienze motorie/.agents/PROJECT.md § Code Layout

## Key Decisions Made
- All 8 test types fully detailed in JavaScript object format with 46 distinct column definitions.
- Placed MEDICINE_BALL detection immediately before VBT in `detectInstrumentType` to prevent 'peso' collision with VBT regex.
- Added compound mappings in `_mapHeaders` for `ballMass`, `throwDistance`, `releaseAngle`, `releaseHeight`, `flightTime`.
- Grounded all default sample data rows in peer-reviewed sports science literature (Sayers, Harman, Bosco, Bezodis, Morin, Samozino, Winter, Sánchez-Medina).

## Artifact Index
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner/DISPATCH.md — Assignment instructions
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner/BRIEFING.md — Persistent situational memory
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner/progress.md — Liveness heartbeat and step tracking
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/m1_spec_miner/handoff.md — Final specification report
