# Handoff Report: Explorer 2 — Requirement R2 (Clinical Conditions & Citations Restructuring)

## 1. Observation
Direct analysis of the DOM generation and AI workout engine codebase revealed the following exact code structures:

1. **Per-Exercise Clinical Notes Rendering (`js/ui.js:681`)**:
   In `js/ui.js`, inside `getPhaseContentHtml(phase)` (lines 662–684), individual exercise cards render notes using:
   ```javascript
   ${ex.note ? `<div class="ec-note">${ex.note}</div>` : ''}
   ```
   In `js/logic.js` (lines 1140–1150), `ex.note` is populated with adaptation warnings (e.g. `⚠️ Limitare flessione ginocchio a 90° max`), causing repetitive notes under every exercise card in clinical profiles.

2. **Top-Level Clinical Warning Banner (`js/ui.js:778-785`)**:
   In `js/ui.js`, inside `renderProgramResult`, clinical notes are rendered using `result.notes`:
   ```javascript
   ${result.notes.length > 0 ? `
   <div class="clinical-alerts-card">
       <h4>⚠️ Prescrizioni di Sicurezza Clinica</h4>
       <ul>
           ${result.notes.map(note => `<li>${note}</li>`).join('')}
       </ul>
   </div>` : ''}
   ```
   Currently, `result.notes` only contains general pathology descriptions from `_generateClinicalNotes`, while specific exercise adaptation warnings remain scattered inside individual exercise objects (`ex.note`).

3. **Literature Citations Card Generation (`js/ui.js:591-608` & `js/logic.js:1312-1333`)**:
   In `js/logic.js` (line 1316), `exp.text` is constructed by combining `source.abstract` and reference links. In `js/ui.js` (line 603), `<p class="explanation-text">${exp.text}</p>` prints the full abstract text inside explanation cards.

---

## 2. Logic Chain
- **Premise 1**: Requirement R2 requires clinical condition notes to be displayed ONCE at the top of the program view and removed from per-exercise cards.
- **Reasoning**: To avoid repeating adaptation notes under every single exercise card, we must remove `${ex.note ...}` rendering from `getPhaseContentHtml` at line 681 in `js/ui.js`. Simultaneously, in `renderProgramResult` (lines 778–785), we collect all unique exercise adaptation notes (`ex.note`) alongside `result.notes` into `allClinicalNotes` and render them ONCE in the top `clinical-alerts-card`.
- **Premise 2**: Requirement R2 requires literature citations cards to display ONLY study title and author/year, completely removing abstract text.
- **Reasoning**: By updating the citation card rendering template in `js/ui.js` (lines 591–608) to output strictly `title`, `authors`, `year`, and PubMed link, we eliminate the verbose abstract paragraph (`source.abstract`), fulfilling the compact visual design requirement.

---

## 3. Caveats
- **Read-Only Investigation**: As an Explorer subagent, no modifications have been executed in the source code files (`js/ui.js` or `js/logic.js`). Implementation is scoped for Milestone 2.
- **Coach Cues**: Removing `ex.note` from exercise cards removes clinical adaptation text. If non-clinical coach execution cues are needed per exercise in future versions, they should use a dedicated `ex.coachCue` property instead of `ex.note`.

---

## 4. Conclusion
The exact code locations and drop-in replacements for implementing Requirement R2 have been pinpointed and documented in `analysis.md`.
- **Clinical Notes**: Remove line 681 in `js/ui.js`; consolidate all notes into `allClinicalNotes` in lines 778–785 of `js/ui.js`.
- **Citations Cards**: Replace lines 591–608 in `js/ui.js` with compact citation card templates displaying title and author/year only.

---

## 5. Verification Method
1. **Source Code Inspection**: Check `analysis.md` for exact line numbers and replacement snippets.
2. **Browser Verification (Post-Implementation)**:
   - Generate a workout program selecting a clinical condition (e.g. knee pathology). Verify that safety notes appear once in the top card and individual exercise cards have no `ec-note` elements.
   - Inspect literature citations cards and verify they show title, author, year, and link, with zero abstract text.
