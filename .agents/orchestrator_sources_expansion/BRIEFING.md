# BRIEFING — 2026-09-14T13:20:20Z

## Mission
Espandere e modularizzare il database delle fonti scientifiche della PWA T7 Workout da 161 a oltre 250 voci (≥90 nuove fonti peer-reviewed) suddivise in 7 aree modulari, aggiornando index.html, sw.js (cache v77) e test_check.py senza regressioni, e bonificare al 100% l'integrità bibliografica e i PMIDs PubMed rilevati dall'audit forense.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_sources_expansion
- Original parent: parent
- Original parent conversation ID: 6cc9631e-5518-4a29-b181-07a0e5a36cff

## 🔒 My Workflow
- **Pattern**: Project / Milestone Orchestration
- **Scope document**: e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_sources_expansion/plan.md
1. **Decompose**:
   - Milestone 1: [COMPLETATA] Analisi codebase, mappatura 161 fonti esistenti, schema dati, inventario anti-duplicati e architettura PWA.
   - Milestone 2: [COMPLETATA] Ricerca e strutturazione di 99 nuove fonti scientifiche (totale 260).
   - Milestone 3: [COMPLETATA] Modularizzazione in `js/data/sources/`, facade `js/knowledge-base.js`, `index.html`, `sw.js` (cache v77) e `test_check.py`.
   - Milestone 4: [ITERATION 1 FAILED -> ITERATION 2 IN PROGRESS]
     - Iteration 1: Audit forense ha rilevato 138 PMIDs disallineati/allucinati contro API live NCBI PubMed. Verdetto: INTEGRITY VIOLATION.
     - Iteration 2: Bonifica automatizzata dei PMIDs tramite query NCBI Entrez e-utilities per associare il PMID autentico a tutti i 260 studi, poi nuovo audit forense.
2. **Dispatch & Execute**:
   - 3 Explorers di bonifica PMID (in esecuzione).
   - Segue Worker di bonifica e ri-verifica.
3. **On failure**:
   - Binary veto on audit violation: loop back with full audit evidence.
4. **Succession**:
   - Threshold: 16 spawn. (Attuali: 14).

## 🔒 Key Constraints
- DISPATCH-ONLY: Non scrivere codice sorgente o test direttamente, non eseguire comandi di build/test direttamente. Solo metadata/state files (.md) in `.agents/`.
- NO MAGIC NUMBERS: costanti in MAIUSCOLO.
- NO EMOJI spontanee.
- Commenti obbligatori su ogni funzione.
- Cache bump in `sw.js`: da `t7-workout-v76` a `t7-workout-v77` e allineamento in `test_check.py`.
- Zero tolerance per duplicati o fonti fake/inventate/mismatched (100% corrispondenza reale con PubMed).

## Current Parent
- Conversation ID: 6cc9631e-5518-4a29-b181-07a0e5a36cff
- Updated: not yet

## Key Decisions Made
- L'audit forense ha bocciato legittimamente l'integrità dei PMIDs (mismatch storico ereditato dal vecchio `knowledge-base.js` + 5 errori di Gruppo A).
- Abbiamo bloccato incondizionatamente l'avanzamento, registrato l'approccio fallito in `DEAD_ENDS.md`, e avviato l'Iterazione 2 con 3 Explorer specializzati nella risoluzione esatta dei PMIDs reali tramite API NCBI Entrez.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_sources_inventory | teamwork_preview_explorer | M1: Catalogazione 161 fonti esistenti | completed | 84dc1286-fa68-46ce-ae6a-e1bd474617b5 |
| explorer_pwa_integration | teamwork_preview_explorer | M1: Analisi integrazione PWA | completed | 96a33450-65b2-4729-9f0f-5aaed436c2b0 |
| worker_research_group_a | teamwork_preview_worker | M2: Ricerca 43 fonti (Atletica, Pesi, VBT) | completed | 90f7ba4e-802e-42d3-888f-8fc61ce9fb66 |
| worker_research_group_b | teamwork_preview_worker | M2: Ricerca 28 fonti (Biomeccanica, Fisiologia) | completed | ad4f6823-d452-4025-8971-e7b691fb1d21 |
| worker_research_group_c | teamwork_preview_worker | M2: Ricerca 28 fonti (Clinico, Sport Squadra) | completed | b4406ba1-03cd-4250-9ccb-21e91c0e04c4 |
| worker_sources_modularizer | teamwork_preview_worker | M3: Implementazione modularizzazione | completed | b88f0932-6890-400e-b88a-44ceb0067d8a |
| reviewer_code_architecture | teamwork_preview_reviewer | M4 (Iter 1): Code review architettura | completed (APPROVE) | d54012fe-ee7b-4f0c-ad84-4fbd7dc3874d |
| reviewer_scientific_quality | teamwork_preview_reviewer | M4 (Iter 1): Review qualità scientifica | completed (APPROVE) | 3ce0d1ab-6966-4600-afea-80eb2ae33a20 |
| challenger_syntax_and_pwa | teamwork_preview_challenger | M4 (Iter 1): Verifica empirica PWA | completed (APPROVE) | 6d14cbbd-7f02-41dc-be15-0b475894238a |
| challenger_empirical_validation | teamwork_preview_challenger | M4 (Iter 1): Verifica test Node | completed (APPROVE) | 1c48a6d4-9a16-417d-a529-63542ff09c10 |
| auditor_integrity_forensics | teamwork_preview_auditor | M4 (Iter 1): Audit forense | completed (INTEGRITY VIOLATION) | c007cdfa-b421-4394-b19e-6d8ba430afb1 |
| explorer_pmid_rem_1 | teamwork_preview_explorer | M4 (Iter 2): Remediation PMIDs Biomech, Clinico, Squadra | running | 3a8b5c4a-7f70-49f6-98f3-0a4bd0d8ffc7 |
| explorer_pmid_rem_2 | teamwork_preview_explorer | M4 (Iter 2): Remediation PMIDs Atletica, Pesi, Fisio, VBT | running | 424a2567-d631-4401-9aad-64bab8e610e4 |
| explorer_pmid_rem_3 | teamwork_preview_explorer | M4 (Iter 2): Script NCBI Entrez & Fix Gruppo A | running | 36fc719e-917c-40b5-a61b-f33f8eb0b6fb |

## Succession Status
- Succession required: no
- Spawn count: 14 / 16
- Pending subagents: 3a8b5c4a-7f70-49f6-98f3-0a4bd0d8ffc7, 424a2567-d631-4401-9aad-64bab8e610e4, 36fc719e-917c-40b5-a61b-f33f8eb0b6fb
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-10 (*/10 * * * *)
- Safety timer: none

## Artifact Index
- `plan.md` — Piano operativo e architettura milestone
- `progress.md` — Stato esecuzione e heartbeat
- `DISPATCH.md` — Log istruzioni ricevute
- `DEAD_ENDS.md` — Registro tentativi falliti per prevenire oscillazione
- `GATE_STATUS.md` — Registro verdetti di gate
