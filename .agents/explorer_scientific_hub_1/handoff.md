# Handoff Report — Explorer Scientific Hub 1

This handoff details the analysis of the AI workout generator's technical explanations, the designed data schema for a scientific sources database, and the proposed integration strategy.

---

## 1. Observation

Direct observations made in the workspace `e:\Nuove App Installate\App esercizi scienze motorie`:
* **Call to explanations**: In `js/logic.js` at line 88, the function `_generateTechnicalExplanations` is invoked with user parameters:
  ```javascript
  88:             const explanations = this._generateTechnicalExplanations(params);
  ```
* **Explanations structure**: Inside `js/logic.js` (lines 814–868), `_generateTechnicalExplanations(params)` builds explanations statically:
  ```javascript
  814:         _generateTechnicalExplanations(params) {
  815:             const explanations = [];
  ...
  821:             explanations.push({
  822:                 category: 'Periodizzazione',
  823:                 title: 'Struttura Mesocicli 3+1 (Carico & Scarico)',
  824:                 text: 'Il programma segue un modello...'
  825:             });
  ...
  827:             if (!isClinical && sport === 'Endurance') {
  ...
  835:             if (!isClinical && sport === 'Sport di Squadra') {
  ...
  843:             if (!isClinical && sport === 'Bodybuilding') {
  ...
  854:             if (isClinical && hasKneePathology) {
  ...
  867:             return explanations;
  868:         }
  ```
* **HTML Imports**: `index.html` loads scripts in the following order (lines 102–111):
  ```html
  102:     <script src="js/data.js?v=pwa_v13"></script>
  ...
  107:     <script src="js/parser.js?v=pwa_v13"></script>
  108:     <script src="js/logic.js?v=pwa_v13"></script>
  ```
* **Absence of database**: No file named `js/knowledge-base.js` exists in the codebase.

---

## 2. Logic Chain

1. **Need for Separating Logic and Content**: The current hardcoded architecture of `_generateTechnicalExplanations(params)` bundles scientific rationale directly within the generator class. This makes it difficult to maintain, verify, or expand references.
2. **Schema Formulation**: By mapping `params` fields (e.g. `patientType`, `sport`, `goal`, `injuries`) to a clean rules object (e.g. `{ patientTypes: [...], sports: [...], injuries: [...] }`), we can model any clinical or athletic condition. This schema has been successfully drafted in `proposed_knowledge-base.js` under the `window.App.scientificSources` array.
3. **Decoupled Load Order**: To ensure that the dynamic mapping engine has access to the database at run-time, `js/knowledge-base.js` must be declared in `index.html` prior to `js/logic.js` (modeled in `proposed_index.patch`).
4. **Dynamic Mapping Implementation**: The filtering loop matches active workout parameters against the rules list. If all query arrays defined on a source match the active workout parameters (or if `rules` is empty), the source is formatted and returned (modeled in `proposed_logic.patch`).

---

## 3. Caveats

* **Local Environment Execution**: Node and Python were not available in the local Windows environment path during this analysis. Programmatic unit tests (`test_logic.js`) could not be run locally.
* **Fallback Strategy**: In the event that `js/knowledge-base.js` fails to load (e.g., due to networking or cache issues), a fallback static method `_getStaticExplanationsFallback` was included in the logic patch to avoid runtime script failures.

---

## 4. Conclusion

The codebase is fully primed for dynamic scientific explanation generation. Implementing this change involves adding the new `js/knowledge-base.js` script to the application, modifying `js/logic.js` to perform rule-based matching, and updating the script load order in `index.html`. 

We have prepared all required proposals in the working directory:
1. `proposed_knowledge-base.js` (scientific database)
2. `proposed_logic.patch` (logic integration patch)
3. `proposed_index.patch` (HTML import order patch)
4. `analysis.md` (detailed architectural findings)

---

## 5. Verification Method

To verify the integration after applying the patch files:
1. **Load Test**: Open `index.html` in a web browser. Access the Developer Console (F12) and type `window.App.scientificSources`. Verify that the database is loaded as an array of objects.
2. **Explanations Test**: Run the following code in the browser's Developer Console:
   ```javascript
   // Test for Clinical Knee patient
   var progKnee = window.AI.generateFullProgram({
       patientType: 'Clinico',
       injuries: ['post_op_lca'],
       days: 2,
       weeks: 12
   });
   console.log(progKnee.explanations);
   ```
   *Expected results*: The explanations array must contain the `Periodizzazione` explanation, the two `Clinico: Ginocchio` sources (Rio et al. and Alfredson & Lorentzon), and no athletic sport-specific sources.
3. **Athletic Endurance Test**: Run in Console:
   ```javascript
   // Test for Endurance Athlete
   var progEndur = window.AI.generateFullProgram({
       patientType: 'Atleta',
       sport: 'Endurance',
       days: 2,
       weeks: 12
   });
   console.log(progEndur.explanations);
   ```
   *Expected results*: The explanations array must contain `Periodizzazione` and the `Sport: Endurance` source (Rønnestad & Mujika), with no clinical or other sport-specific sources.
