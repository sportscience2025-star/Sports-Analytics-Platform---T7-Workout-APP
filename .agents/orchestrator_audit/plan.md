# Project Plan: T7 Workout Data Analisi Section Audit

## Goal
Conduct a thorough audit of the 'Data Analisi' section of the T7 Workout web application. This includes verifying the correctness of all mathematical and physical formulas, reviewing code efficiency and performance across five main files, identifying enhancements, and producing a comprehensive report artifact in the working directory.

## Phases and Milestones

### Phase 1: Exploration and In-depth Audit (Milestone 1)
- **Objective**: Analyze `js/physics-engine.js` formulas against literature, and audit code quality/performance in:
  - `js/physics-engine.js`
  - `js/data-analysis.js`
  - `js/parser.js`
  - `js/impact-calculator.js`
  - `js/clinical.js`
- **Activities**:
  - Spawn `teamwork_preview_explorer` agents to audit formulas and code files.
  - Review existing test scripts (e.g. `test_vbt_math_stress.js`, `test_regression_edge_cases.js`, `test_load_velocity.js`) to see how calculations are verified.
- **Verification**: Exploration reports highlighting formulas, unit checks, performance bottlenecks, and parsing edge cases.

### Phase 2: Draft Report Compilation (Milestone 2)
- **Objective**: Write the draft markdown report artifact.
- **Activities**:
  - Spawn a `teamwork_preview_worker` agent to write the report following the required outline:
    - Formula Audit Table (Formula Name, Implementation, Reference, Verdict, Notes).
    - Code Quality Section (Optimization recommendations ranked by impact, code snippets, line ranges).
    - Missing Features / Enhancements (scientifically backed).
    - Bug Report (functional bugs).
- **Verification**: Worker creates the report file in the working directory.

### Phase 3: Review & Adversarial Challenge (Milestone 3)
- **Objective**: Peer-review the report and math formulas; run stress-testing of VBT math and regression.
- **Activities**:
  - Spawn `teamwork_preview_reviewer` agents to review the report content and correctness.
  - Spawn `teamwork_preview_challenger` to run stress tests (e.g. `test_vbt_math_stress.js`, `test_regression_edge_cases.js`, etc.) and ensure the correctness of regression and VBT math.
- **Verification**: Reviewer approval and Challenger verification of test results.

### Phase 4: Forensic Audit (Milestone 4)
- **Objective**: Conduct integrity audit on the findings.
- **Activities**:
  - Spawn `teamwork_preview_auditor` to verify report integrity, verifying that no findings are fabricated or hardcoded.
- **Verification**: Auditor CLEAN verdict.

### Phase 5: Synthesis & Reporting (Milestone 5)
- **Objective**: Synthesize the findings and report completion to the Sentinel.
- **Activities**:
  - Write final handoff.md and send completion message to Sentinel.
