# Handoff Report: AI Program Rationale & Citation Restructuring (R3)

**Agent:** Explorer 3 (Requirement R3 Specialist)  
**Task:** Inspect AI program rationale logic, design a cohesive narrative synthesis mechanism, and design clean literature citation separation.  
**Working Directory:** `e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_r3_rationale`  

---

## 1. Observation

1. **Program Generation & Explanation Logic (`js/logic.js`)**:
   - Lines 91-190 (`generateFullProgram`): Generates workout phases and calls `this._generateTechnicalExplanations(params)`. Citations are flattened to `{ title, url }` arrays.
   - Lines 1262-1336 (`_generateTechnicalExplanations`): Iterates over `window.App.scientificSources` from `js/knowledge-base.js` matching rules against athlete inputs. It formats explanation objects embedding raw Italian paper abstracts (`source.abstract`) concatenated with reference text:
     ```javascript
     text: `${source.abstract}\n\nRiferimento: ${referenceText} (${source.url})`
     ```
2. **Scientific Knowledge Base (`js/knowledge-base.js`)**:
   - Lines 12-2254: Contains 105+ peer-reviewed study objects with structured attributes (`id`, `title`, `authors`, `journal`, `year`, `area`, `abstract`, `url`, `rules`).
3. **DOM Rendering (`js/ui.js`)**:
   - Lines 591-608 & 902-909 (`renderProgramResult` and CSS): Renders explanation objects in `.technical-explanations-section` as cards displaying `exp.text` (which contains full raw abstract paragraphs).
   - Lines 761-776: Renders periodization rationale as a generic static paragraph (`result.periodization.rationale`).
4. **Automated Test Suite (`test_knowledge_base.js`)**:
   - Asserts database integrity and checks that generated program explanations/citations reference mandatory researchers (`Seiler`, `Pareja-Blanco`, `Escamilla`, `González-Badillo`, `Samozino`).

---

## 2. Logic Chain

1. **Observation 1 & 3** show that program explanations currently copy-paste long academic abstracts into UI cards, causing visual clutter and failing to deliver a unified narrative explaining why the specific program was constructed for the individual athlete.
2. **Observation 2** shows that `js/knowledge-base.js` already possesses clean metadata (`authors`, `year`, `journal`, `area`, `url`). This metadata can be extracted cleanly without needing raw abstract text in the UI.
3. Therefore, as designed in `analysis.md`, `WorkoutGeneratorAI` should implement `_generateSummaryRationale(params, method, activeSources)` to construct a single dynamic, multi-variable narrative paragraph (`summaryRationale`) placed at the top of the generated program view (below `.report-header-v3`).
4. Concurrently, `generateFullProgram` and `js/ui.js` should separate citations into compact cards (`{ title, authors, year, journal, area, url }`) without abstract text, fulfilling Requirement R3 while satisfying all test assertions in `test_knowledge_base.js` (Observation 4).

---

## 3. Caveats

- **Test Script Compatibility**: Existing test scripts (`test_knowledge_base.js`) check for author names (e.g. `seiler`, `pareja-blanco`, `escamilla`, `gonzález-badillo`, `samozino`) inside `program.explanations` or `program.citations`. The implementer must ensure that `program.summaryRationale`, `program.citations`, and any updated `program.explanations` preserve author name strings so automated test assertions pass seamlessly.
- **UI Responsiveness**: Compact citation cards must maintain fluid responsive behavior on small screen devices (mobile screens < 600px).

---

## 4. Conclusion

The architectural investigation for Requirement R3 is complete. The detailed strategy for dynamic narrative rationale synthesis and clean citation separation has been documented in `e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_r3_rationale/analysis.md`. The design provides clear before-and-after data contracts and precise step-by-step implementation instructions for the Implementer agent.

---

## 5. Verification Method

To independently verify this analysis and future implementation:

1. **Inspect Documentation Artifacts**:
   - Read `analysis.md` in this directory to verify the 4-pillar narrative synthesis engine and compact citation data model specifications.
2. **Run Existing Knowledge Base Test Suite**:
   - Command: `node test_knowledge_base.js`
   - Expected Result: "🎉 All tests passed successfully!"
3. **Run Logic Engine Test Suite**:
   - Command: `node test_logic.js`
   - Expected Result: All logic tests pass without error.
