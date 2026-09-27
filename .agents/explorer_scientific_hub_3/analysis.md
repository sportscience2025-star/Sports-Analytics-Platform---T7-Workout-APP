# Scientific Hub (Libreria Fonti) Testing Strategy Analysis

This report outlines the findings and a complete testing strategy to verify the requirements **R1** (Database Scientifico Interno) and **R2** (Generazione Spiegazioni AI Arricchite) for the Sports Science Web Application.

---

## 1. Analysis of Existing Test Infrastructure

By examining the existing codebase, specifically `test_logic.js` and `test_parsing.js`, we identified the project's testing pattern:

1. **Environment Mocks**: The tests do not run in a browser. They run in a Node.js CLI environment and mock browser globals such as `global.window` and browser-specific APIs (like `FileReader`, `XLSX`, or `pdfjsLib`).
2. **Module Ingestion**: The scripts read the raw JavaScript files from the `js/` directory using Node's `fs` and `path` modules and load them into the global Node context using `eval()`.
3. **Custom Assertions**: The tests do not use external frameworks like Mocha or Jest. Instead, they define a simple, custom `assert` helper:
   ```javascript
   function assert(condition, message) {
       if (!condition) {
           console.error("❌ Assertion Failed:", message);
           process.exit(1);
       }
   }
   ```
4. **Execution Mode**: Tests are run directly via the Node command line:
   ```bash
   node test_logic.js
   ```
   If all tests pass, the script exits with code `0`. If any assertion fails, it prints a message and exits with code `1`, halting execution.

---

## 2. Proposed Testing Strategy for R1 (Database Scientifico Interno)

Requirement R1 specifies that `js/knowledge-base.js` must contain at least five mandatory scientific sources, each exposing:
- `id` (unique)
- `title` (article/study title)
- `authors` (author names)
- `journal` and `year` (metadata)
- `area` (scientific area: e.g., "Fisiologia", "Biomeccanica", "VBT", "Periodizzazione", "Clinico")
- `abstract` or `keyTakeaway` (practical Italian summary)
- `url` (valid clickable PubMed/DOI link)
- `rules` (object containing criteria for range mappings: RPE, ROM, load %)

### R1 Test Strategy:
1. **Load and Expose**: Load `js/knowledge-base.js` into the Node environment using `eval`. Verify that it defines an array named `ScientificKnowledgeBase` on the global `window` object.
2. **Schema Integrity**: Iterate through each element in the array and verify the presence and type of mandatory fields. Confirm that `id` values are unique and that the URLs are valid HTTP/HTTPS links.
3. **Mandatory Source Presence**: Verify that the five required papers are represented:
   - **González-Badillo & Sánchez-Medina (2010)**
   - **Pierre Samozino et al. (2012 / 2016)**
   - **Pareja-Blanco et al. (2017)**
   - **Escamilla et al. (2001 / 2012)**
   - **Stephen Seiler (2010)**

---

## 3. Proposed Testing Strategy for R2 (Generazione Spiegazioni AI Arricchite)

Requirement R2 specifies that the AI program generator in `js/logic.js` must dynamically enrich technical explanations using the scientific database based on user inputs.

### R2 Test Strategy:
1. **Mock Workout Generation**: Load the generator engine `js/logic.js` and instantiate `WorkoutGeneratorAI`. Call the `generateFullProgram` method with different sports and clinical input parameters.
2. **Case Verification**:
   - **Endurance Athlete**: Generate a program with `sportPraticato: 'Endurance'`. Assert that the generated program's explanations contain references to **Seiler (2010)** (Polarized training 80/20 model, low/high intensity distribution).
   - **Bodybuilding Athlete**: Generate a program with `sportPraticato: 'Bodybuilding'` and `goal: 'Hypertrophy'`. Assert that explanations cite **Pareja-Blanco et al. (2017)** (Velocity Loss concept: VL20 vs VL40).
   - **Clinical Knee Injury**: Generate a program with `patientType: 'Clinico'` and `injuries: ['post_op_lca']`. Assert that:
     1. Explanations cite **Escamilla et al.** (Squat biomechanics / knee joint rehabilitation).
     2. Exercises in early phases (Phase 1) contain notes limiting knee ROM (e.g., `60°` max) and prescribe isometric exercises.
   - **Strength / VBT Goal**: Generate an athletic program with `goal: 'Strength'`. Assert that explanations reference **González-Badillo & Sánchez-Medina (2010)** (VBT load-velocity relationship) and/or **Samozino et al.** (Force-Velocity profiling).
3. **Bibliography Extraction**: Verify that the generated program object returns a list of citations (or appends them to explanations) containing exact article metadata and valid, clickable URLs (PubMed or DOI link).

---

## 4. Proposed Test File: `test_knowledge_base.js`

The testing logic has been drafted in a standalone test script named `proposed_test_knowledge_base.js`. This script loads the browser modules in Node.js, configures appropriate mocks, and runs the assertions described above.

*The full script is saved as `proposed_test_knowledge_base.js` in the agent directory.*

---

## 5. Execution and Validation Protocol

To run and validate the proposed tests:

1. **Setup**: Once the worker agent implements `js/knowledge-base.js` and updates `js/logic.js`, the test file `test_knowledge_base.js` should be created in the project root.
2. **Command**: Run the tests using the following command in PowerShell/CMD:
   ```bash
   node test_knowledge_base.js
   ```
3. **Validation**:
   - **Success Condition**: The console prints:
     ```
     === Loading modules ===
     ✅ Modules loaded successfully.

     === Running Scientific Hub Integrity & Validation Tests ===
     
     --- Testing R1: Database Scientifico Interno ---
     ✅ Success: Found X sources in the database.
     ✅ Success: All sources have valid IDs, URLs, rules objects, and mandatory keys.
     ✅ Success: Verified presence of mandatory source: González-Badillo
     ✅ Success: Verified presence of mandatory source: Samozino
     ✅ Success: Verified presence of mandatory source: Pareja-Blanco
     ✅ Success: Verified presence of mandatory source: Escamilla
     ✅ Success: Verified presence of mandatory source: Seiler
     --- R1 tests passed successfully ---

     --- Testing R2: Generazione Spiegazioni AI Arricchite ---
     Testing Scenario A: Sport = Endurance...
     ✅ Success: Endurance program correctly cites Seiler.
     Testing Scenario B: Sport = Bodybuilding...
     ✅ Success: Bodybuilding program correctly cites Pareja-Blanco.
     Testing Scenario C: PatientType = Clinico (Knee Pathology)...
     ✅ Success: Clinical knee program correctly cites Escamilla and applies ROM limits.
     Testing Scenario D: Strength / VBT Goal...
     ✅ Success: Strength program correctly cites VBT/Force-Velocity literature.
     Testing bibliography links in generated program output...
     ✅ Success: Bibliography list/citation links are present and correct.
     --- R2 tests passed successfully ---

     🎉 All tests passed successfully! The scientific database and dynamic AI citation-linking logic meet all requirements.
     ```
     The process exits with code `0`.
   - **Failure Condition**: Any failed assertion throws an error, prints a description (e.g., `❌ Assertion Failed: Endurance program must contain a citation/reference to Seiler's work in explanations`), and exits with code `1`.
