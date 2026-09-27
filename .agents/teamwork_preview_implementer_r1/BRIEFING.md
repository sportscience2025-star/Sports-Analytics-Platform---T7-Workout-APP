# Implementer Round 1 Briefing

## Identity & Role
- **Archetype**: implementer@swe_light
- **Target Files**:
  - `js/logic.js`
  - `tests/test_logic.js`
  - `sw.js`
  - `test_check.py` (for cache name sync)
- **Directory**: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/teamwork_preview_implementer_r1`

## Requirements
- **R1. Validazione Input**: Add checks at start of `analyzeRiskProfile` to prevent TypeError if `selectedPathologyIds` is not an array or `window.App.getConditions()` returns undefined (fallback to LOW risk).
- **R2. Categorie Critiche**: Extend `hasHighRiskCategory` logic to include `reumatologiche` (if `riskLevel` is not 'low') and `speciali` (unconditional or non-low risk).
- **R3. Bonus Comorbilità**: Add +1 to `riskScore` for each category that contains 2 or more active pathologies.
- **R4. Soglie Configurabili**: Introduce `this.thresholds = { HIGH: 4, MEDIUM: 2 };` in `WorkoutGeneratorAI` constructor; use them in `analyzeRiskProfile` instead of hardcoded numbers; update comment at line 41.
- **R5. Testing & Verification**: Update `tests/test_logic.js` with mock conditions, write >= 3 new test cases, run tests and `py test_check.py`.
- **Cache Bump**: Increment SW cache version in `sw.js` (e.g. `v59` -> `v60`).
