# BRIEFING — 2026-07-14T10:41:41Z

## Mission
Implement a client-side RAG knowledge base for local document upload, vector search, and contextual augmentation.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: e:\Nuove App Installate\App esercizi scienze motorie\.agents\orchestrator_rag_knowledge_base
- Original parent: main agent
- Original parent conversation ID: bfb4d97f-6c66-4056-ac34-c6cd23a6d87f

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: e:\Nuove App Installate\App esercizi scienze motorie\.agents\orchestrator_rag_knowledge_base\PROJECT.md
1. **Decompose**: Decompose requirements into milestones (R1 Document Upload, R2 Local Vector Database & Embeddings, R3 RAG Retrieval & Contextual Augmentation).
2. **Dispatch & Execute** (pick ONE):
   - **Delegate (sub-orchestrator)**: Spawn sub-orchestrators for milestones or handle directly with Explorer -> Worker -> Reviewer loop. Since the tasks are highly integrated, we will decompose and spawn subagents for investigation, implementation, and verification.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: at 16 spawns, write handoff.md, spawn successor
- **Work items**:
  1. Decompose & Plan [pending]
  2. Implement R1 Document Upload [pending]
  3. Implement R2 Local Vector DB & Embeddings [pending]
  4. Implement R3 RAG Retrieval & Contextual Augmentation [pending]
  5. Integration & E2E Testing [pending]
- **Current phase**: 1
- **Current focus**: Decompose & Plan

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- Ensure safety rules in AGENTS.md: run tests using py run_all_js_tests.py, test syntax with py test_check.py, prevent "undefined" UI binding, and bump SW cache in sw.js.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh

## Current Parent
- Conversation ID: bfb4d97f-6c66-4056-ac34-c6cd23a6d87f
- Updated: not yet

## Key Decisions Made
- Use Project Orchestrator pattern.
- Plan to delegate tasks to specialist subagents (explorer, worker, reviewer, challenger).

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_1 | teamwork_preview_explorer | Milestone 1: Exploration & Technical Audit | completed | 3c76bdf5-7d71-4f17-9363-ec725605ffc7 |
| worker_1 | teamwork_preview_worker | Milestone 2: Core RAG Engine & Local Vector DB | failed | f625baf9-a34c-4390-9aa4-4d1e43b941a0 |
| worker_1_gen2 | teamwork_preview_worker | Milestone 2: Core RAG Engine & Local Vector DB (Gen 2) | completed | 9beb8357-8556-40fd-977e-4f0a0d47a198 |
| worker_2 | teamwork_preview_worker | Milestone 3: UI Integration & AI Hook | completed | 02c6385c-655a-4d41-b8bd-aa83f1dff4d6 |
| reviewer_1 | teamwork_preview_reviewer | Milestone 4: Verification & Review | completed | 288722ed-5903-4dd9-9ea9-1388611f84e5 |
| challenger_1 | teamwork_preview_challenger | Milestone 4: Challenger Verification | completed | fd39a207-ae1a-4ec2-8f59-4a34f4105a36 |
| auditor_1 | teamwork_preview_auditor | Milestone 4: Forensic Audit | completed | 61c9d21f-1605-4d4d-be44-06497fd9f69d |
| worker_3 | teamwork_preview_worker | Milestone 4: Remediation & Fixes | pending | e5093c4c-eb95-4683-8cf9-ee77604d7cf5 |

## Succession Status
- Succession required: no
- Spawn count: 8 / 16
- Pending subagents: [e5093c4c-eb95-4683-8cf9-ee77604d7cf5]
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: 005570d7-ca9f-4798-a5e7-93201e91241a/task-198
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- e:\Nuove App Installate\App esercizi scienze motorie\.agents\orchestrator_rag_knowledge_base\ORIGINAL_REQUEST.md — Original User Request
- e:\Nuove App Installate\App esercizi scienze motorie\.agents\orchestrator_rag_knowledge_base\BRIEFING.md — My working memory
- e:\Nuove App Installate\App esercizi scienze motorie\.agents\orchestrator_rag_knowledge_base\progress.md — Heartbeat & Liveness progress tracking
- e:\Nuove App Installate\App esercizi scienze motorie\.agents\orchestrator_rag_knowledge_base\PROJECT.md — Global index and architectural layout
