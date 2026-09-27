# Task Assignment: Explorer PMID Remediation 3 (NCBI Search Automation Tool & Group A Fixes)

## Objective
Remediate the integrity failure reported by the Forensic Auditor.
Read:
- Auditor's Full Report: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/report.md`
- Auditor's Verification Results: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/pubmed_verification_results.json`
- Dead ends log: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_sources_expansion/DEAD_ENDS.md`

Your task:
1. Fix the 5 hallucinated PMIDs introduced by Group A:
   - `sci_sprint_nagahara_2014`
   - `sci_power_soriano_2015`
   - `sci_weightlifting_hackett_2016`
   - `sci_weightlifting_arabatzi_2012_coactivation`
   - `sci_vbt_balsalobre_2018_app`
   Find their EXACT real PMIDs on PubMed.
2. Fix the 2 non-existent PMIDs:
   - `20024937` in `vbt.js` -> find genuine paper PMID
   - `26672828` in `sport-squadra.js` -> find genuine paper PMID
3. Design and build a standalone Python script `resolve_all_pmids.py` that takes all 260 sources, uses `urllib.request` to query NCBI Entrez `esearch.fcgi?db=pubmed&term=<title>[Title]+AND+<author>[Author]`, retrieves the verified PMID, and verifies it with `esummary.fcgi`.
4. Write your findings, script, and test results to `report.md` and `handoff.md`.

## 2026-09-14T13:20:12Z
You are Explorer PMID Remediation 3.
Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_3
Read your assignment in e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_3/DISPATCH.md
Also read ORIGINAL_REQUEST.md at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
And project guidelines at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md
And the Forensic Auditor's full evidence report at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/report.md
And raw evidence at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/pubmed_verification_results.json

Your task:
1. Fix the 5 Group A hallucinated PMIDs and 2 non-existent PMIDs with exact real PMIDs.
2. Build resolve_all_pmids.py script to query NCBI Entrez e-utilities API and automate title/author PMID resolution.
Write report.md and handoff.md in your working directory. Send message to parent when done.

