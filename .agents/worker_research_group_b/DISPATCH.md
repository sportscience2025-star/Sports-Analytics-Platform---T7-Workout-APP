# Task Assignment: Research Worker Group B (Biomeccanica, Fisiologia)

## Objective
Generate 28 genuine, peer-reviewed scientific sources in exact JSON format:
- **Biomeccanica**: exactly 14 new sources (e.g. force-vector theory, RFD kinetics, eccentric-concentric coupling, hip vs knee dominance in squats/hinges, moment arms, EMG muscle recruitment, Schoenfeld, Vigotsky, Contreras, Escamilla, Beardsley, Cleather).
- **Fisiologia**: exactly 14 new sources (e.g. hypertrophy mechanisms, satellite cells, muscle protein synthesis, metabolic stress, hormonal responses, fiber type transitions, autonomic HRV recovery, Phillips, Morton, Schoenfeld, Hawley, Joyner, Bishop).

## Mandatory Requirements
1. **Deduplication**: Read `.agents/explorer_sources_inventory/report.md` (specifically §5 Master Deduplication Reference). DO NOT duplicate any of the 161 existing titles or PMIDs!
2. **Authenticity**: Every source MUST be a real, verifiable peer-reviewed paper with actual authors, publication year, journal, and valid PubMed PMID / URL (`https://pubmed.ncbi.nlm.nih.gov/<PMID>/`).
3. **Format**: Valid JSON array written to `.agents/worker_research_group_b/sources_group_b.json`.
4. **Schema**:
   ```json
   {
     "id": "sci_<area_prefix>_<firstauthor>_<year>",
     "title": "Exact Title of the Paper in English",
     "authors": "Author A, Author B, Author C, et al.",
     "journal": "Journal Name (e.g. Sports Med, Med Sci Sports Exerc, J Appl Physiol)",
     "year": 2023,
     "area": "Biomeccanica" | "Fisiologia",
     "abstract": "Dettagliata spiegazione in italiano dell'impatto pratico e biomeccanico/fisiologico per la periodizzazione e programmazione.",
     "url": "https://pubmed.ncbi.nlm.nih.gov/<PMID>/",
     "rules": {
       "patientTypes": ["Atleta" | "Clinico"],
       "sports": [...],
       "goals": ["Hypertrophy", "Strength", "Resistenza", "Power", ...]
     }
   }
   ```
5. **No Emojis**: Do not use emojis in titles, abstracts, or keys.
6. Write your report in `report.md` and handoff in `handoff.md`.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-14T12:56:53Z
You are Worker Research Group B (Biomeccanica, Fisiologia).
Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_b
Read your assignment in e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_b/DISPATCH.md
Also read ORIGINAL_REQUEST.md at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
And the Master Deduplication Index in: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_sources_inventory/report.md
And project guidelines in: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md

Task: Generate exactly 28 peer-reviewed scientific sources:
- 14 for Biomeccanica
- 14 for Fisiologia
All MUST be real papers indexed on PubMed with valid PMIDs and URLs. Zero duplicates against the 161 existing sources.
Save the valid JSON array to: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_b/sources_group_b.json
Write report.md and handoff.md in your working directory. Send a message to parent when done.

