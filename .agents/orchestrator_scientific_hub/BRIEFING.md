# BRIEFING — 2026-07-13T21:07:00Z

## Mission
Expand the scientific library of T7 Workout app from 105 to around 160 peer-reviewed sources.

## 🔒 My Identity
- Archetype: orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub
- Original parent: main agent
- Original parent conversation ID: 0e672bc6-a8ca-48b5-b059-bac0b628e9e7

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub/plan.md
1. **Decompose**: Decompose the task into milestones (e.g. exploration of existing database, gathering sources, implementation of database expansion, verification/audit).
2. **Dispatch & Execute**:
   - **Delegate (sub-orchestrator)**: Spawn a worker or sub-orchestrator to do research, formatting, and validation.
3. **On failure**:
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: at 16 spawns, write handoff.md, spawn successor
- **Work items**:
  1. Explore codebase & design plan [pending]
  2. Implement expansion [pending]
  3. Validate database syntax and tests [pending]
- **Current phase**: 1
- **Current focus**: Explore codebase & design plan

## 🔒 Key Constraints
- Expand from 105 to around 160 sources (adding ~55 sources).
- Distribute sources equamente among the 7 categories (at least 5 new sources per category).
- Ensure no duplicates (IDs, titles, URLs).
- Format matches the existing structure.
- Run `py test_check.py` and `py run_all_js_tests.py`.
- Bump SW cache version in `sw.js`.
- Respect safety rules in `AGENTS.md`.
- Never write, modify, or create source code files directly (we are DISPATCH-ONLY orchestrator).

## Current Parent
- Conversation ID: 0e672bc6-a8ca-48b5-b059-bac0b628e9e7
- Updated: not yet

## Key Decisions Made
- Use Project pattern with single worker for source gathering and expansion implementation, since it's a data expansion task.
- First explore the current database to get the categories, formatting, and exact list of existing sources to prevent duplicates.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_sources | teamwork_preview_explorer | Explore database & verify current tests | in-progress | 9da6b147-8dc2-4bb3-8ce6-76fd6d34c0f2 |

## Succession Status
- Succession required: no
- Spawn count: 1 / 16
- Pending subagents: 9da6b147-8dc2-4bb3-8ce6-76fd6d34c0f2
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: 01b1b7e3-3cf0-4e20-b44a-d6b2ad14875d/task-15
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub/plan.md — Project plan
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub/progress.md — Progress tracker
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_scientific_hub/handoff.md — Handoff report
