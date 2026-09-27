# BRIEFING — 2026-07-13T23:15:00+02:00

## Mission
Expand the scientific library of T7 Workout app from 105 to around 160 peer-reviewed sources in js/knowledge-base.js.

## 🔒 My Identity
- Archetype: Project Orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub_2
- Original parent: main agent
- Original parent conversation ID: 0e672bc6-a8ca-48b5-b059-bac0b628e9e7

## 🔒 My Workflow
- **Pattern**: Project Pattern (Orchestrator Procedure 2B Iteration Loop / 2A Decompose & Delegate if needed)
- **Scope document**: e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub_2/PROJECT.md
1. **Decompose**: Split the task into exploration/research of scientific papers, implementation of the changes in js/knowledge-base.js, and verification (syntax check, test suites, and sw.js cache bump).
2. **Dispatch & Execute**:
   - **Direct (iteration loop)**: Use the Explorer -> Worker -> Reviewer -> Challenger -> Auditor cycle.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (last resort)
4. **Succession**: Self-succeed at 16 spawns, write handoff.md, spawn successor.
- **Work items**:
  1. Set up project plan and project scope documents [done]
  2. Spawn Explorer to research and catalog 55-65 papers across 7 categories [pending]
  3. Spawn Worker to integrate the new studies into js/knowledge-base.js and bump sw.js cache [pending]
  4. Spawn Reviewer to check correctness, completeness, and layout [pending]
  5. Spawn Challenger to run test suite and verify no regressions [pending]
  6. Spawn Forensic Auditor to run integrity checks [pending]
- **Current phase**: 1
- **Current focus**: Work Item 1 (Project setup)

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.
- Total count of sources in js/knowledge-base.js must be between 155 and 170.
- Each category must have at least 5 new sources added.
- No duplicate IDs or titles.
- Valid PubMed or DOI URLs.
- Italian abstracts of 3-5 sentences describing practical application to training.
- Version of cache in sw.js must be bumped.

## Current Parent
- Conversation ID: 0e672bc6-a8ca-48b5-b059-bac0b628e9e7
- Updated: 2026-07-13T23:15:00+02:00

## Key Decisions Made
- Use Project Pattern directly on this task. Since it is relatively structured, we will explore/research first to build a solid library list, then execute the implementation and verification.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|

## Succession Status
- Succession required: no
- Spawn count: 0 / 16
- Pending subagents: none
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: not started
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub_2/ORIGINAL_REQUEST.md — Verbatim user request
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub_2/BRIEFING.md — Memory index
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub_2/PROJECT.md — Global architecture and milestones
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub_2/progress.md — Step-by-step progress heartbeat
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub_2/plan.md — Detailed execution plan
