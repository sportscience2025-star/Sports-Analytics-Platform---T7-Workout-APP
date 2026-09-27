# Task Assignment: Research Worker Group A (Atletica Leggera, Sollevamento Pesi, VBT)

## Objective
Generate 43 genuine, peer-reviewed scientific sources in exact JSON format:
- **Atletica Leggera**: exactly 14 new sources (e.g. sprint mechanics, Morin, Samozino, Weyand, Haugen, hurdle kinematics, middle distance pacing).
- **Sollevamento Pesi**: exactly 14 new sources (e.g. Olympic weightlifting, Storey & Smith, Kauhanen, Garhammer, Suchomel, weightlifting pulling derivatives).
- **VBT (Velocity Based Training)**: exactly 15 new sources (e.g. González-Badillo, Sánchez-Medina, Weakley, Pareja-Blanco, García-Ramos, Balsalobre-Fernández, velocity loss thresholds, minimal velocity thresholds).

## Mandatory Requirements
1. **Deduplication**: Read `.agents/explorer_sources_inventory/report.md` (specifically §5 Master Deduplication Reference). DO NOT duplicate any of the 161 existing titles or PMIDs!
2. **Authenticity**: Every source MUST be a real, verifiable peer-reviewed paper with actual authors, publication year, journal, and valid PubMed PMID / URL (`https://pubmed.ncbi.nlm.nih.gov/<PMID>/`).
3. **Format**: Valid JSON array written to `.agents/worker_research_group_a/sources_group_a.json`.
4. **Schema**:
   ```json
   {
     "id": "sci_<area_prefix>_<firstauthor>_<year>",
     "title": "Exact Title of the Paper in English",
     "authors": "Author A, Author B, Author C, et al.",
     "journal": "Journal Name (e.g. J Strength Cond Res, Sports Med, Eur J Appl Physiol)",
     "year": 2023,
     "area": "Atletica Leggera" | "Sollevamento Pesi" | "VBT",
     "abstract": "Dettagliata spiegazione in italiano dell'impatto pratico e metodologico per la programmazione dell'allenamento.",
     "url": "https://pubmed.ncbi.nlm.nih.gov/<PMID>/",
     "rules": {
       "patientTypes": ["Atleta"],
       "sports": ["Atletica Leggera", "Sport di Squadra", "Generic", ...],
       "goals": ["Power", "Strength", "Resistenza", ...]
     }
   }
   ```
5. **No Emojis**: Do not use emojis in titles, abstracts, or keys.
6. Write your report in `report.md` and handoff in `handoff.md`.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-14T12:56:53Z
You are Worker Research Group A (Atletica Leggera, Sollevamento Pesi, VBT).
Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_a
Read your assignment in e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_a/DISPATCH.md
Also read ORIGINAL_REQUEST.md at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
And the Master Deduplication Index in: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_sources_inventory/report.md
And project guidelines in: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md

Task: Generate exactly 43 peer-reviewed scientific sources:
- 14 for Atletica Leggera
- 14 for Sollevamento Pesi
- 15 for VBT
All MUST be real papers indexed on PubMed with valid PMIDs and URLs. Zero duplicates against the 161 existing sources.
Save the valid JSON array to: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_a/sources_group_a.json
Write report.md and handoff.md in your working directory. Send a message to parent when done.

