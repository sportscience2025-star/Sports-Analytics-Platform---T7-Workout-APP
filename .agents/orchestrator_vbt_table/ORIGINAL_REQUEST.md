# Original User Request

## Initial Request — 2026-06-29T22:55:18Z

You are the Project Orchestrator for Progetto T7 Workout PWA.
Working directory for agent metadata: e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_vbt_table
Project workspace: e:/Nuove App Installate/App esercizi scienze motorie

Your objective: Orchestrate the implementation of the new user request documented in ORIGINAL_REQUEST.md (and .agents/ORIGINAL_REQUEST.md).

Summary of Requirements:
1. R1. Creazione Tabella Completa VBT: Add a new table below the existing "Tabella di Allenamento VBT" in Data Analysis view. Classify load & velocity into 5 standard force zones (Bryan Mann): Absolute Strength (>90% 1RM, <0.50 m/s), Accelerative Strength (80%-90% 1RM, 0.50-0.75 m/s), Strength-Speed (60%-80% 1RM, 0.75-1.00 m/s), Speed-Strength (30%-60% 1RM, 1.00-1.30 m/s), Starting Strength (<30% 1RM, >1.30 m/s). Adapt threshold velocities dynamically based on exercise type if MVT profile is supported.
2. R2. Calcoli Biomeccanici: For each row, compute Force (N) = mass(kg) * 9.81 and Power (W) = Force * velocity(m/s). Ensure no undefined or NaN values, with proper fallback and rounding logic (e.g., 2.5kg plate steps).
3. R3. Preservare layout esistente: Do not modify or degrade existing VBT training table or current graphics; append as a new independent module/card below.

Safety & Guidelines:
- Follow Multi-Agent Safety Rules in AGENTS.md (py run_all_js_tests.py after changes, bump SW cache in sw.js when modifying JS/CSS, prevent undefined UI binding, run py test_check.py on JS edits).
- Maintain plan.md and progress.md in your working directory .agents/orchestrator_vbt_table.
- When all milestones are complete, report completion to Sentinel.
