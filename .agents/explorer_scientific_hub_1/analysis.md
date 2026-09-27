# Scientific Hub Integration Analysis

**Date**: 2026-06-17  
**Agent**: Explorer Scientific Hub 1 (Read-Only)  
**Objective**: Examine the workout generation codebase (specifically `js/logic.js`), design a scientific sources schema, and propose a dynamic explanation system based on program inputs.

---

## 1. Analysis of Existing AI Technical Explanations

### Location in Codebase
The technical explanations for generated programs are built inside the class `WorkoutGeneratorAI` defined in `js/logic.js` (lines 9 to 869). Specifically:
* **Function**: `_generateTechnicalExplanations(params)` (lines 814–868).
* **Call Site**: This function is called from the main generation entry point `generateFullProgram(params)` at line 88:
  ```javascript
  88:             const explanations = this._generateTechnicalExplanations(params);
  ```

### Current Logical Constraints
Explanations are currently hardcoded based on the following conditional statements in `_generateTechnicalExplanations(params)`:
1. **Always Included**:
   * **Category**: `'Periodizzazione'`
   * **Title**: `'Struttura Mesocicli 3+1 (Carico & Scarico)'`
   * **Rationale**: Covers the 3+1 mesocycle structure (accumulation/deload).
2. **Endurance Athlete**:
   * **Condition**: `!isClinical && sport === 'Endurance'`
   * **Category**: `'Sport: Endurance'`
   * **Title**: `'Allenamento della Forza Submassimale ad Alta Intensità'`
3. **Team Sport Athlete**:
   * **Condition**: `!isClinical && sport === 'Sport di Squadra'`
   * **Category**: `'Sport: Sport di Squadra'`
   * **Title**: `'Rate of Force Development (RFD) & Lavoro Unilaterale'`
4. **Bodybuilding Athlete**:
   * **Condition**: `!isClinical && sport === 'Bodybuilding'`
   * **Category**: `'Sport: Bodybuilding'`
   * **Title**: `'Tensione Meccanica & Stress Metabolico'`
5. **Clinical Knee Pathologies**:
   * **Condition**: `isClinical && hasKneePathology` (checks if any active injury is in a knee-specific list: `['post_op_lca', 'lesione_lca', 'knee_generic', 'gonarthrosis', 'patellar_tendonitis', 'condromalacia_rotulea', 'meniscus']`).
   * Generates two separate cards:
     * **Card 1**: `'Isometria ad Angolo Specifico per Tendinopatie e Post-Chirurgia'`
     * **Card 2**: `'Lavoro Eccentrico Controllato e Rimodellamento del Collagene'`

---

## 2. Proposed Data Schema for Scientific Sources (`js/knowledge-base.js`)

We propose introducing a dedicated database of scientific references in `js/knowledge-base.js`. This separates content from execution logic and allows medical/scientific practitioners to add references without modifying core generation algorithms.

### Schema Blueprint (JSON / JavaScript Object)
Each reference object contains:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` | Unique identifier (e.g., `sci_knee_isometric_2015`). |
| `title` | `String` | Title of the research paper. |
| `authorsJournalYear` | `String` | Citation format: Authors, Journal, Year. |
| `scientificArea` | `String` | Clinical or athletic categorization (maps to UI category). |
| `abstractTakeaway` | `String` | Summary of findings translated to practical workout rationale. |
| `pubmedDoiLink` | `String` | External link for verification (PubMed/DOI). |
| `rules` | `Object` | Criteria determining when this source matches program inputs. |

### The `rules` Filtering Engine
The `rules` object supports four optional query dimensions:
* `patientTypes`: `Array<String>` (e.g., `["Clinico"]`, `["Atleta"]`). Matches the current patient type.
* `sports`: `Array<String>` (e.g., `["Endurance"]`). Matches selected sport.
* `goals`: `Array<String>` (e.g., `["Ipertrofia"]`). Matches target training goal.
* `injuries`: `Array<String>` (e.g., `["post_op_lca"]`). Matches if at least one selected injury matches.

*Note: If `rules` is empty (`{}`), the source is treated as universally applicable (e.g., general periodization).*

---

## 3. Dynamic Integration and Matching Strategy

To make explanations dynamic:
1. **Script Order**: Load `js/knowledge-base.js` after `js/parser.js` and before `js/logic.js` in `index.html`.
2. **Filtering Algorithm**: Replace the hardcoded conditional checks in `_generateTechnicalExplanations(params)` with a loop over `window.App.scientificSources`.
3. **Matching Evaluation**:
   * For each source, verify that all defined rule arrays contain the corresponding value from `params`.
   * If a rule array is omitted or empty, it matches unconditionally.
   * If all rules pass, push the matched source to the output list.
4. **Resilience**: Include a fallback to the original hardcoded explanations if `window.App.scientificSources` fails to load.

---

## 4. Summary of Proposed Changes (Artifacts)

We have generated proposed changes as read-only files in our agent directory:
* **`proposed_knowledge-base.js`**: Contains the full JavaScript database of scientific sources, including core references for Periodization, Endurance, Team Sports, Bodybuilding, Knee Rehabilitation, and a new study for Spine Stabilization.
* **`proposed_logic.patch`**: Standard patch showing the code modifications to replace the static `_generateTechnicalExplanations` function with the rule-matching engine and a static fallback method.
* **`proposed_index.patch`**: Standard patch showing how to include the new script in `index.html`.
