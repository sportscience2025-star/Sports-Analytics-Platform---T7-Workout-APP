# Task Assignment: Reviewer 2 (Scientific Quality & Schema Completeness)

## Objective
Perform an independent review of the scientific sources corpus in `js/data/sources/`:
1. **Source Counts**:
   - Total sources must be >= 250 (actual target: 260).
   - Verify count per area:
     - `atletica.js`: 35
     - `sollevamento-pesi.js`: 31
     - `fisiologia.js`: 47
     - `vbt.js`: 28
     - `biomeccanica.js`: 40
     - `clinico.js`: 40
     - `sport-squadra.js`: 39
2. **Schema & Integrity**:
   - Every single entry must have: `id`, `title`, `authors`, `journal`, `year`, `area`, `abstract`, `url`, `rules`.
   - `rules.patientTypes` must be present ("Atleta" or "Clinico").
   - Controlled vocabulary for sports, goals, injuries.
   - All abstracts must be in Italian, clear, and relevant.
   - No duplicate IDs, no duplicate titles, no duplicate PMIDs.
3. **Preservation of Baseline**:
   - Confirm all 161 original sources from `knowledge-base.js` were preserved.
4. **Verdict**: Explicit verdict in `handoff.md`: `APPROVE` or `REQUEST_CHANGES`.

## 2026-09-14T13:14:33Z
You are Reviewer 2 (Scientific Quality & Schema Completeness).
Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/reviewer_scientific_quality
Read your assignment in e:/Nuove App Installate/App esercizi scienze motorie/.agents/reviewer_scientific_quality/DISPATCH.md
Also read ORIGINAL_REQUEST.md at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
And project guidelines at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md

Review the scientific corpus in `js/data/sources/`:
- Verify 260 total sources (exceeds 250 target).
- Check schema completeness for all entries (all 9 fields, valid Italian abstracts, valid patientTypes).
- Confirm zero duplicate IDs, titles, or PMIDs.
- Confirm all 161 original sources were preserved.
Write report.md and handoff.md with explicit verdict (APPROVE or REQUEST_CHANGES). Send message to parent when done.
