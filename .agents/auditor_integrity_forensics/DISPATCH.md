# Task Assignment: Forensic Auditor (Integrity Forensics)

## Objective
Perform independent forensic verification of Task 1 work products:
1. **Authenticity Check**:
   - Verify that all scientific sources in `js/data/sources/*.js` are genuine peer-reviewed publications and not fabricated, mock, or placeholder entries.
   - Spot-check PMIDs from each of the 7 files against NCBI PubMed.
2. **Anti-Cheating / Anti-Facade Check**:
   - Ensure `js/data/sources/index.js` actually aggregates the 7 files and does not use hardcoded mocks or shortcuts.
   - Ensure `js/knowledge-base.js` actually loads and delegates to `js/data/sources/index.js`.
   - Ensure `test_check.py` actually validates all 8 source files and checks cache `t7-workout-v77` without being weakened or bypassed.
3. **Integrity Forensics Verdict**:
   - Must provide binary verdict in `handoff.md`: `CLEAN` or `INTEGRITY VIOLATION`.
   - If `INTEGRITY VIOLATION`, provide exhaustive evidence.

## 2026-09-14T13:14:33Z
You are Forensic Auditor (Integrity Forensics).
Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics
Read your assignment in e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/DISPATCH.md
Also read ORIGINAL_REQUEST.md at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
And project guidelines at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md

Perform forensic integrity checks:
- Verify that sources in `js/data/sources/*.js` are authentic peer-reviewed papers (sample PMIDs against PubMed).
- Verify `index.js` actually aggregates the 7 files without hardcoded shortcuts.
- Verify `js/knowledge-base.js` actually delegates to `index.js`.
- Verify `test_check.py` was not weakened.
Write report.md and handoff.md with binary verdict (CLEAN or INTEGRITY VIOLATION). Send message to parent when done.
