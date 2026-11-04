# Project: T7 Workout Sports Analytics Platform & Exercise Catalog Architecture

## Architecture
- **Biomechanical Physics & Math Engine** (`js/physics-engine.js`): Functional calculation module exposing Load-Velocity profiling, Linear & Quadratic regression, automated model selection based on Adjusted R², Median Absolute Deviation outlier filtering, and 95% Confidence Intervals for 1RM predictions.
- **UI & Visualization Layer** (`js/data-analysis.js`, `index.html`, `css/style.css`, `src/`): React 18 + TypeScript strict SPA with Chart.js visual dashboard (4 interactive charts: `#vbt-chart`, `#power-curve-chart`, `#jump-heights-chart`, `#rsi-trials-chart`), Three.js WebGL 3D Avatar (Google Draco compressed GLB) with orbital touch controls and muscle activation coloring (Agonists, Synergists, Stabilizers).
- **Miro Architecture Blueprint & Technical Specifications** (`architecture-blueprint/`): 18 operational flowcharts distributed across 3 Tiers (Tier 1 Consumer, Tier 2 Pro P.IVA, Tier 3 Elite Club Enterprise) and 6 Functional Columns on Miro Board `uXjVEbo6L2o=`.
- **Database Tripartite Architecture**: Silo 1 (Consumer/Public PostgreSQL), Silo 2 (Bunker Pro & Encrypted Club KMS Enclave), Silo 3 (De-identified Research Lake).
- **Test Infrastructure & Verification** (`py test_check.py`, `test_load_velocity.js`, `test_analysis.js`, `test_hybrid_regression.js`): Strict TypeScript delimiter validation across 108 files, exercise/condition/source dataset integrity verification, and unit test suites.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Hybrid Regression & Precision | Implement quadratic regression, auto-model selection (Linear vs Quadratic), MAD outlier filtering, and 95% CI 1RM estimation in `js/physics-engine.js` + update tests | None | DONE |
| 2 | Premium Chart.js Visualization | Overhaul chart rendering in `js/data-analysis.js` with glowing neon line plugins, glassmorphism tooltips, responsive canvas containers, and CSS extraction in `css/style.css` | M1 | DONE |
| 3 | Final Audit Report | Generate `FINAL_AUDIT_REPORT.md` artifact documenting math weaknesses, hybrid mitigations, and UI improvements | M1, M2 | DONE |
| 4 | Exercise Catalog Overhaul (Col 2: Flowcharts #02, #08, #14) | Align technical specifications (.md), Mermaid source files (.mmd), Master Registry, and Miro Board with the approved "Legge del Catalogo": Tier 1 (3D Avatar, Why & Fix, Filtered Search, Favorites, Read-Only, ZERO Video Upload), Tier 2 (3D Catalog, Max 1080p Full HD, In-App Trimming & Speed Control, Strengths/Weaknesses + AI Support, Favorites, Strict 1:1 Sharing), Tier 3 (4K Max, Team Broadcast, Dedicated Working Groups, Multi-Athlete Ingest with Individual AI Corrections, 3D Muscle Fiber Stress Analysis) | M1-M3 | IN_PROGRESS |

## Interface Contracts

### 1. Exercise Catalog Tiers ("Legge del Catalogo")
- **Tier 1 (B2C Casual - Flow 2A)**:
  - `GET /api/v1/catalog/exercises?muscle=&district=&category=&search=` -> 328 standard exercises + 3D Draco mesh + Why & Fix guidance
  - `POST /api/v1/user/favorites` -> Silo 1 `user_favorites`
  - `POST /api/v1/user/personal-videos` -> `403 Forbidden` (`ERR_UPLOAD_FORBIDDEN_TIER1` - Zero upload policy)
- **Tier 2 (B2B Pro P.IVA - Flow 2B)**:
  - `POST /api/v1/pro/catalog/custom-video-exercise` -> Max 1080p Full HD at 60fps, trimming `[startMs, endMs]`, speed `0.25x - 2.0x`, manual strengths/weaknesses + AI RAG (322 papers) completion
  - `POST /api/v1/pro/favorites` -> Silo 2 `pro_favorites`
  - `POST /api/v1/pro/share/athlete-1to1` -> Strict 1:1 athlete assignment. Multiple recipients trigger `403 Forbidden` (`ERR_SHARE_LIMIT_EXCEEDED_TIER2`)
- **Tier 3 (B2B Enterprise - Flow 2C)**:
  - `POST /api/v1/club/catalog/multicamera-4k-exercise` -> Max 4K Ultra HD at 60/120fps, Telestrator tactical vectors (N), FEA 3D muscle fiber stress analysis
  - `POST /api/v1/club/exercises/batch-multi-athlete` -> Multi-athlete concurrent ingest of same exercise with individualized AI corrections per athlete
  - `POST /api/v1/club/workgroups/distribute` -> Distribution to dedicated working groups (defenders, forwards, RTP) with technical explanation
  - `POST /api/v1/club/share/global-team-broadcast` -> Broadcast to entire squad with Dynamic Forensic Watermark
  - Dual Signature: Mandatory Head S&C + Team Doctor FIDO2 co-signatures

### 2. Biomechanical Engine (`PhysicsEngine` ↔ `DataAnalysis`)
- `PhysicsEngine.analyzeLoadVelocity(dataset, options)`
  - Input: `dataset` array of `{ load: number, velocity: number }`
  - Output: `{ modelType: 'linear'|'quadratic', r2Adj: number, coefficients: object, f0: number, v0: number, pmax: number, rm1: { estimated: number, ci95: [number, number], margin: number } }`
- `PhysicsEngine.estimate1RM(model, mvt, options)`
  - Output: `{ value: number, ci95Min: number, ci95Max: number, margin: number }`

## Code & Technical Layout
- `src/`: React 18 + TypeScript strict components and exercise datasets (296 exercises, 119 conditions, 322 sources)
- `js/physics-engine.js`: Biomechanical computations & regression algorithms
- `js/data-analysis.js`: Chart.js rendering, dataset parsing, and UI updates
- `css/style.css`: App styling, glassmorphism tooltips, chart container styles
- `architecture-blueprint/00-capitolato-tecnico-e-glossario/`: Authoritative technical specifications (01-18 .md) & `MASTER-FLOWCHART-REGISTRY.md`
- `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/`: Mermaid source diagrams (.mmd) for 18 flowcharts
- `.agents/rules/`: Architecture and design rules (Rule 08, 09, 10)
- `test_check.py`: System validation suite testing exercises, conditions, sources, TypeScript syntax, tsconfig, index.html, and sw.js
