# Task Assignment: Research Worker Group C (Clinico, Sport di Squadra)

## Objective
Generate 28 genuine, peer-reviewed scientific sources in exact JSON format:
- **Clinico / Riabilitazione**: exactly 14 new sources (e.g. ACL rehabilitation criteria-based return to sport, hamstring strain rehabilitation and Nordic curls, patellar tendinopathy heavy slow resistance, rotator cuff exercise progression, lumbar motor control, knee osteoarthritis exercise prescription; van Dyk, Ardern, Malliaras, Rio, Cools, McGill, O'Sullivan).
- **Sport di Squadra**: exactly 14 new sources (e.g. microtechnology in team sports, acute:chronic workload ratio, repeated sprint ability, small-sided games vs HIIT, deceleration fatigue, return to play protocols in soccer/basketball/rugby; Gabbett, Buchheit, Impellizzeri, Bishop, Harper, Bradley).

## Mandatory Requirements
1. **Deduplication**: Read `.agents/explorer_sources_inventory/report.md` (specifically §5 Master Deduplication Reference). DO NOT duplicate any of the 161 existing titles or PMIDs!
2. **Authenticity**: Every source MUST be a real, verifiable peer-reviewed paper with actual authors, publication year, journal, and valid PubMed PMID / URL (`https://pubmed.ncbi.nlm.nih.gov/<PMID>/`).
3. **Format**: Valid JSON array written to `.agents/worker_research_group_c/sources_group_c.json`.
4. **Schema**:
   ```json
   {
     "id": "sci_<area_prefix>_<firstauthor>_<year>",
     "title": "Exact Title of the Paper in English",
     "authors": "Author A, Author B, Author C, et al.",
     "journal": "Journal Name (e.g. Br J Sports Med, J Orthop Sports Phys Ther, Int J Sports Physiol Perform)",
     "year": 2023,
     "area": "Clinico" | "Sport di Squadra",
     "abstract": "Dettagliata spiegazione in italiano del razionale riabilitativo/sport-specifico, progressioni di carico e prevenzione infortuni.",
     "url": "https://pubmed.ncbi.nlm.nih.gov/<PMID>/",
     "rules": {
       "patientTypes": ["Clinico" | "Atleta"],
       "sports": ["Calcio", "Basketball", "Sport di Squadra", ...],
       "goals": ["Rehab", "Power", "Resistenza", ...],
       "injuries": [...]
     }
   }
   ```
5. **No Emojis**: Do not use emojis in titles, abstracts, or keys.
6. Write your report in `report.md` and handoff in `handoff.md`.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-14T12:56:53Z
You are Worker Research Group C (Clinico, Sport di Squadra).
Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_c
Read your assignment in e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_c/DISPATCH.md
Also read ORIGINAL_REQUEST.md at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
And the Master Deduplication Index in: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_sources_inventory/report.md
And project guidelines in: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md

Task: Generate exactly 28 peer-reviewed scientific sources:
- 14 for Clinico
- 14 for Sport di Squadra
All MUST be real papers indexed on PubMed with valid PMIDs and URLs. Zero duplicates against the 161 existing sources.
Save the valid JSON array to: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_c/sources_group_c.json
Write report.md and handoff.md in your working directory. Send a message to parent when done.
