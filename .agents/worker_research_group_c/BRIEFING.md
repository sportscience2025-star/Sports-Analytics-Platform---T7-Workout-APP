# BRIEFING — 2026-09-14T13:07:30Z

## Mission
Research and generate exactly 28 genuine, peer-reviewed scientific sources (14 Clinico, 14 Sport di Squadra) indexed on PubMed with valid PMIDs/URLs, zero duplicates against the existing 161 sources, save to sources_group_c.json, and produce full report and handoff.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_c
- Original parent: 56493819-546c-4901-9d9b-5f654a2028bf
- Milestone: Knowledge Base Expansion Task 1 (Research Group C)

## 🔒 Key Constraints
- Exactly 28 sources: 14 Clinico, 14 Sport di Squadra.
- All MUST be genuine peer-reviewed papers indexed on PubMed with valid PMIDs and URLs.
- Zero duplicates against the existing 161 sources cataloged in explorer_sources_inventory/report.md.
- Follow schema specification strictly (id, title, authors, journal, year, area, abstract, url, rules).
- Rules must use valid controlled vocabulary for patientTypes, sports, goals, injuries.
- No emojis in titles, abstracts, or keys.
- Output JSON array to e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_c/sources_group_c.json.

## Current Parent
- Conversation ID: 56493819-546c-4901-9d9b-5f654a2028bf
- Updated: 2026-09-14T13:07:30Z

## Task Summary
- **What to build**: sources_group_c.json (28 sources), report.md, handoff.md.
- **Success criteria**: 28 valid sources, 0 duplicates, valid PMIDs, proper taxonomy, passing tests.
- **Interface contracts**: schema defined in DISPATCH.md and report.md.

## Key Decisions Made
- Selected 14 landmark Clinico studies (ACL RTS criteria, hamstring eccentric/algorithm, tendinopathy HSR, rotator cuff, chronic LBP motor control, knee OA, groin active training, ankle sprain guidelines).
- Selected 14 landmark Sport di Squadra studies (GPS microtechnology, deceleration demands, ACWR coupling/sweet spot, repeated sprint ability, 30-15 IFT, Yo-Yo IR1, fixture congestion, Premier League running profiles, in-season strength microdosing).
- Verified 100% of candidates against NCBI Entrez e-utilities API.
- Confirmed zero collisions with 161 existing sources.

## Artifact Index
- `sources_group_c.json` — 28 scientific sources in JSON format
- `report.md` — Complete research report with bibliography and rationale
- `handoff.md` — Standard 5-component handoff report
- `validate_sources_group_c.py` — Automated verification suite
