# BRIEFING — 2026-07-13T23:01:00Z

## Mission
Implement personalized warm-up (RAMP) and cool-down routines supporting 5 macro-profiles, and update the UI menus.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_warmup_cooldown
- Original parent: main agent
- Original parent conversation ID: 4f7ed068-a3f3-4d71-b03d-bf4abef63f79

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_warmup_cooldown/SCOPE.md
1. **Decompose**: Decompose task into: exploration, logic implementation, UI update, verification and integration.
2. **Dispatch & Execute** (pick ONE):
   - **Direct (iteration loop)**: Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate.
   - **Delegate (sub-orchestrator)**: Spawn a sub-orchestrator for large milestones.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Spawn successor when count >= 16, write handoff.md, kill crons.
- **Work items**:
  1. Explore current files and run test suite [done]
  2. Implement personalized warm-up/cool-down routines and UI menus [in-progress]
  3. Validate syntax, run test suite, and audit [pending]
- **Current phase**: 2
- **Current focus**: Implement logic changes, UI options, and restore test suite.

## 🔒 Key Constraints
- Multi-Agent Safety Rules (Progetto T7 Workout PWA): precise changes, sw cache bump, no cross-agent conflicts, test after every change.
- Zero-tolerance integrity enforcement (no hardcoded test results, etc.).
- Never reuse a subagent after it has delivered its handoff — always spawn fresh

## Current Parent
- Conversation ID: 4f7ed068-a3f3-4d71-b03d-bf4abef63f79
- Updated: not yet

## Key Decisions Made
- Use Project pattern with single Explorer-Worker-Reviewer iteration cycles.
- Resolve test file corruption to restore testing liveness.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_1 | teamwork_preview_explorer | Explore warm-ups, cool-downs, UI menu, sw.js, and tests | completed | 6e3a8a9c-70d1-4565-b07f-b85c9e618f7a |
| worker_1 | teamwork_preview_worker | Implement routines, UI options, restore tests, bump sw.js cache | in-progress | 7af674a0-d397-4ce5-98c4-99e6ca64cec8 |

## Succession Status
- Spawn count: 2 / 16
- Pending subagents: 7af674a0-d397-4ce5-98c4-99e6ca64cec8
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-21
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_warmup_cooldown/plan.md — Current execution plan
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_warmup_cooldown/progress.md — Dynamic progress tracker
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_warmup_cooldown/SCOPE.md — Milestone decomposition document
