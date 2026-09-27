# Task Assignment: Explorer PMID Remediation 2 (Atletica, Sollevamento Pesi, Fisiologia, VBT)

## Objective
Remediate the integrity failure reported by the Forensic Auditor.
Read:
- Auditor's Full Report: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/report.md`
- Auditor's Verification Results: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/pubmed_verification_results.json`
- Dead ends log: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_sources_expansion/DEAD_ENDS.md`
- `js/data/sources/atletica.js`, `js/data/sources/sollevamento-pesi.js`, `js/data/sources/fisiologia.js`, `js/data/sources/vbt.js`

Your task:
1. For every study flagged as mismatched or non-existent in these 4 files:
   - Identify the real paper title and first author.
   - Formulate the exact genuine NCBI PubMed PMID via E-utilities / PubMed search query (title + author).
2. Generate an exact replacement dictionary / mapping table: `{ "id": "sci_...", "current_url": "...", "correct_pmid": "...", "correct_url": "..." }`.
3. Write your findings and remediation script / table to `report.md` and `handoff.md`.

## 2026-09-14T13:20:12Z
You are Explorer PMID Remediation 2.
Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2
Read your assignment in e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2/DISPATCH.md
Also read ORIGINAL_REQUEST.md at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
And project guidelines at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md
And the Forensic Auditor's full evidence report at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/report.md
And raw evidence at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/pubmed_verification_results.json

Your task:
Identify genuine PMIDs for all mismatched studies in Atletica, Sollevamento Pesi, Fisiologia, and VBT. Formulate the exact mapping table with real PubMed PMIDs.
Write report.md and handoff.md in your working directory. Send message to parent when done.
