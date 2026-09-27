# Project: Data Analysis Dashboard Overhaul & Hybrid Regression Engine

## Architecture
- **Physics & Math Engine** (`js/physics-engine.js`): Pure functional calculation module exposing Load-Velocity profiling, Linear & Quadratic regression, automated model selection based on Adjusted R², Median Absolute Deviation outlier filtering, and 95% Confidence Intervals for 1RM predictions.
- **UI & Visualization Layer** (`js/data-analysis.js`, `index.html`, `css/style.css`): Chart.js visual dashboard managing 4 interactive charts (`#vbt-chart`, `#power-curve-chart`, `#jump-heights-chart`, `#rsi-trials-chart`). Enhanced with glowing neon line plugins, glassmorphism HTML tooltips, responsive container sizing, and CSS extraction.
- **Test Infrastructure & Verification** (`test_load_velocity.js`, `test_analysis.js`, `test_hybrid_regression.js`): CLI Node test scripts and browser runner testing mathematical accuracy, model selection triggering, CI bounds, and UI regressions.
- **Documentation Artifact** (`FINAL_AUDIT_REPORT.md`): Final mathematical audit report detailing initial weaknesses, mitigations, and UI enhancements.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Hybrid Regression & Precision | Implement quadratic regression, auto-model selection (Linear vs Quadratic), MAD outlier filtering, and 95% CI 1RM estimation in `js/physics-engine.js` + update tests | None | DONE |
| 2 | Premium Chart.js Visualization | Overhaul chart rendering in `js/data-analysis.js` with glowing neon line plugins, glassmorphism tooltips, responsive canvas containers, and CSS extraction in `css/style.css` | M1 | DONE |
| 3 | Final Audit Report | Generate `FINAL_AUDIT_REPORT.md` artifact documenting math weaknesses, hybrid mitigations, and UI improvements | M1, M2 | IN_PROGRESS |

## Interface Contracts
### `PhysicsEngine` ↔ `DataAnalysis`
- `PhysicsEngine.analyzeLoadVelocity(dataset, options)`
  - Input: `dataset` array of `{ load: number, velocity: number }`
  - Output: `{ modelType: 'linear'|'quadratic', r2Adj: number, coefficients: object, f0: number, v0: number, pmax: number, rm1: { estimated: number, ci95: [number, number], margin: number } }`
- `PhysicsEngine.estimate1RM(model, mvt, options)`
  - Output: `{ value: number, ci95Min: number, ci95Max: number, margin: number }`

## Code Layout
- `js/physics-engine.js`: Biomechanical computations & regression algorithms
- `js/data-analysis.js`: Chart.js rendering, dataset parsing, and UI updates
- `css/style.css`: App styling, glassmorphism tooltips, chart container styles
- `index.html`: UI markup & canvas containers
- `test_load_velocity.js`, `test_analysis.js`, `test_hybrid_regression.js`: Test suites
