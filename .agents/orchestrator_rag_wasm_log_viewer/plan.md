# Plan: RAG WASM Log Viewer & Ingestion Fix

This plan outlines the task decomposition, specialist assignment, and verification checklist to address the RAG WASM log viewer requirements (R1-R5).

## Task Decomposition & Milestones

1. **Milestone 1: Exploration & Research**
   - **Specialist**: Explorer (`teamwork_preview_explorer`)
   - **Goal**: Analyze the codebase, locate target elements, styles, and configurations. Determine exact replacement chunks for R1-R5.
   - **Status**: Completed.

2. **Milestone 2: Code Implementation & Invalidation**
   - **Specialist**: Worker (`teamwork_preview_worker`)
   - **Goal**: Implement R2 (console logs capture and redirection in `js/rag-ui.js`) and R5 (Service Worker cache bump in `sw.js`).
   - **Status**: Completed.

3. **Milestone 3: Verification & Review**
   - **Specialist**: Reviewer (`teamwork_preview_reviewer`)
   - **Goal**: Perform visual code inspection, verify CSS toggle styling, and validate browser compatibility and baseline test results.
   - **Status**: Completed.

4. **Milestone 4: Forensic Integrity Audit**
   - **Specialist**: Forensic Auditor (`teamwork_preview_auditor`)
   - **Goal**: Run integrity checks to confirm no facade code was introduced and WASM fallback environment variables are genuinely configure-active under `file://`.
   - **Status**: Completed.

5. **Milestone 5: Project Handoff**
   - **Specialist**: Sub-orchestrator (`sub_orch`)
   - **Goal**: Write final handoff report (`handoff.md`) and notify parent agent of successful completion.
   - **Status**: Completed.

## Technical Details

- **R1: System Logs Card**: Place logs in `dev-only` card outside upload progress. Render dynamically.
- **R2: Console Intercept**: Patch `console.log`, `console.warn`, `console.error` globally in UI module. Buffer log entries up to 300 items in `window.RAGUI_Logs`.
- **R3: CSS Toggle**: Use CSS classes (`.dev-mode-active`, `.dev-only`, `.user-only`) for metadata toggling to avoid DOM rebuilds.
- **R4: file:// fallbacks**: Disable browser caching and restrict WASM to a single thread under `file://` to prevent upload hangs.
- **R5: SW Cache Bump**: Increment Service Worker cache name to invalid cache and force update.

## Test Strategy

- Run syntax checker `py test_check.py` on JS assets.
- Execute headless browser test suite `py run_tests_headless.py`.
- Verify RAG core and UI tests pass correctly.
