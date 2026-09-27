# Technical Analysis: Requirement R2 — Clinical Conditions & Citations Restructuring

## Executive Summary
This document provides an exact architectural and DOM-level analysis of how clinical condition notes and literature citations cards are currently generated and rendered in the application (`js/ui.js` and `js/logic.js`). It specifies exact line numbers and concrete code modifications required to:
1. **Hoist clinical condition notes ONCE to the top of the program view** (under the program summary header) and **remove repetitive clinical notes from individual exercise cards**.
2. **Restructure literature citations cards** to display **ONLY the study title and author/year**, completely eliminating abstract/key takeaway text for a compact, professional presentation.

---

## 1. Code Base Inspection & Component Architecture

### 1.1 Files Involved
- **`js/ui.js`**: Primary DOM renderer module containing `window.App.renderProgramResult` (lines 552–1063) and `getPhaseContentHtml` (lines 611–735).
- **`js/logic.js`**: AI Workout Generator Engine containing `generateFullProgram` (lines 91–191) and `_generateTechnicalExplanations` (lines 1262–1336).
- **`js/knowledge-base.js`**: Scientific database supplying source metadata (`title`, `authors`, `year`, `abstract`, `url`).

---

## 2. Deep Dive: Clinical Condition Notes Restructuring

### 2.1 Current Implementation & Problem Identification
Currently, clinical warnings and safety precautions exist in two separate data properties:
1. **Program-Level Safety Notes (`result.notes`)**:
   - Generated in `js/logic.js` at line 187 (`notes: this._generateClinicalNotes(riskProfile.pathologies)`).
   - Rendered in `js/ui.js` at **lines 778–785** inside `<div class="clinical-alerts-card">`.
2. **Exercise-Level Adaptation Notes (`ex.note`)**:
   - Generated in `js/logic.js` at lines 1140–1150 (in `_formatExerciseForPhase`) and lines 48–52 (in `classifyExercises`).
   - Rendered in `js/ui.js` at **line 681** inside `getPhaseContentHtml`:
     ```javascript
     ${ex.note ? `<div class="ec-note">${ex.note}</div>` : ''}
     ```
   - **Problem**: In clinical programs, every single exercise card in every workout day redundantly displays identical or repetitive notes (e.g., `⚠️ Limitare flessione ginocchio a 90° max. Ginocchio: adattato...`). This clutters the UI and violates Requirement R2.

### 2.2 Hoisting Strategy & Modifications

#### Modification 2.2.1: Consolidate Notes at Top of Program View (`js/ui.js`)
**Location:** `js/ui.js`, around **lines 775–786** (inside `window.App.renderProgramResult`).

**Target Code (Current Lines 778–785):**
```javascript
<!-- CLINICAL WARNING NOTES -->
${result.notes.length > 0 ? `
<div class="clinical-alerts-card">
    <h4>⚠️ Prescrizioni di Sicurezza Clinica</h4>
    <ul>
        ${result.notes.map(note => `<li>${note}</li>`).join('')}
    </ul>
</div>` : ''}
```

**Proposed Replacement Code:**
Before generating the HTML string in `renderProgramResult`, consolidate all program-level notes AND all unique exercise-level clinical notes (`ex.note`) into a single array:
```javascript
// Consolidate all clinical safety notes and exercise adaptation warnings ONCE
const exerciseNotes = [];
if (result.phases) {
    result.phases.forEach(phase => {
        if (phase.schedule) {
            phase.schedule.forEach(day => {
                if (day.exercises) {
                    day.exercises.forEach(ex => {
                        if (ex.note && !exerciseNotes.includes(ex.note)) {
                            exerciseNotes.push(ex.note);
                        }
                    });
                }
            });
        }
    });
}
const allClinicalNotes = [...new Set([...(result.notes || []), ...exerciseNotes])];
```

Then render `allClinicalNotes` once at the top of the program view (below the header summary):
```javascript
<!-- CLINICAL WARNING NOTES (CONSOLIDATED) -->
${allClinicalNotes.length > 0 ? `
<div class="clinical-alerts-card">
    <h4>⚠️ Prescrizioni di Sicurezza Clinica & Adattamenti</h4>
    <ul>
        ${allClinicalNotes.map(note => `<li>${window.escapeHTML(note)}</li>`).join('')}
    </ul>
</div>` : ''}
```

#### Modification 2.2.2: Remove Clinical Notes from Individual Exercise Cards (`js/ui.js`)
**Location:** `js/ui.js`, **line 681** (inside `getPhaseContentHtml`).

**Target Code (Current Line 681):**
```javascript
${ex.note ? `<div class="ec-note">${ex.note}</div>` : ''}
```

**Proposed Replacement Code:**
Remove line 681 completely or replace with an empty string so individual exercise cards remain clean and free of repetitive clinical condition notes.

---

## 3. Deep Dive: Literature Citations Restructuring

### 3.1 Current Implementation & Problem Identification
Currently, literature citations and technical explanations are generated in `js/logic.js` (lines 1312–1333) and rendered in `js/ui.js` (lines 591–608).
- In `js/logic.js` (line 1316), `exp.text` is constructed by concatenating the full scientific abstract text (`${source.abstract}\n\nRiferimento: ${referenceText}`).
- In `js/ui.js` (line 603), the DOM renders `<p class="explanation-text">${exp.text}</p>`, resulting in large blocks of raw abstract text inside explanation cards.
- **Problem**: Requirement R2 mandates displaying **ONLY study title and author/year** on literature citation cards, completely removing abstract/key takeaway text to keep cards compact and readable.

### 3.2 Citation Restructuring Strategy & Modifications

#### Modification 3.2.1: Update Citation Card DOM Generation (`js/ui.js`)
**Location:** `js/ui.js`, **lines 591–608** (and/or dedicated literature citations rendering).

**Target Code (Current Lines 591–608):**
```javascript
let explanationsHtml = '';
if (result.explanations && result.explanations.length > 0) {
    explanationsHtml = `
    <div class="technical-explanations-section">
        <h3>🧠 Spiegazione Tecnica della Programmazione (R3)</h3>
        <div class="explanations-grid">
            ${result.explanations.map(exp => `
                <div class="explanation-card">
                    <div class="explanation-card-header">
                        <span class="badge-category">${exp.category}</span>
                        <strong>${exp.title}</strong>
                    </div>
                    <p class="explanation-text">${exp.text}</p>
                </div>
            `).join('')}
        </div>
    </div>`;
}
```

**Proposed Replacement Code:**
Structure literature citation cards to cleanly extract and present ONLY Study Title, Authors, Year, and optional PubMed/DOI link, discarding abstract body text:

```javascript
let citationsHtml = '';
const citationsList = result.citations || [];
if (citationsList.length > 0) {
    citationsHtml = `
    <div class="literature-citations-section" style="margin-top: 2.5rem; border-top: 1px solid var(--border); padding-top: 2rem;">
        <h3 style="font-size: 1.3rem; margin-bottom: 1.25rem; color: var(--text-primary);">📚 Fonti Scientifiche & Citazioni</h3>
        <div class="citations-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            ${citationsList.map(c => {
                const title = c.title || (c.sourceMetadata ? c.sourceMetadata.title : '');
                const authors = c.authors || (c.sourceMetadata ? c.sourceMetadata.authors : '');
                const year = c.year || (c.sourceMetadata ? c.sourceMetadata.year : '');
                const url = c.url || (c.sourceMetadata ? c.sourceMetadata.url : '#');
                const safeUrl = (url && url.startsWith('http')) ? window.escapeHTML(url) : '#';
                
                return `
                    <div class="citation-card" style="background: rgba(30, 41, 59, 0.4); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">
                        <div>
                            <strong style="color: var(--text-primary); font-size: 0.95rem; line-height: 1.4; display: block; margin-bottom: 0.5rem;">${window.escapeHTML(title)}</strong>
                            <span style="color: var(--accent); font-size: 0.85rem; font-weight: 600; display: block;">${window.escapeHTML(authors)} (${window.escapeHTML(String(year))})</span>
                        </div>
                        ${safeUrl !== '#' ? `
                            <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 0.5rem; margin-top: 0.25rem;">
                                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none; font-size: 0.8rem; font-weight: 600;">PubMed / DOI ↗</a>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    </div>`;
}
```

---

## 4. Summary Matrix of Required Changes

| Target File | Line Range | Purpose | Modification Summary |
|---|---|---|---|
| `js/ui.js` | 681 | Per-Exercise Notes Removal | Remove `${ex.note ? `<div class="ec-note">${ex.note}</div>` : ''}` from exercise cards in `getPhaseContentHtml`. |
| `js/ui.js` | 778–785 | Clinical Notes Hoisting | Consolidate `result.notes` and all unique `ex.note` values into `allClinicalNotes` and display ONCE in top banner. |
| `js/ui.js` | 591–608 | Literature Citations Compact Grid | Restructure literature citation card templates to render study title and author/year only, removing abstract text. |

---

## 5. Verification Plan
1. **Clinical Notes Verification**:
   - Generate a program with clinical conditions (e.g. Paziente Clinico with ACL/knee pathologies).
   - Confirm that all safety prescriptions and adaptation notes appear in the top `clinical-alerts-card` below the title summary.
   - Confirm that individual exercise cards in all phases have zero repetitive `ec-note` elements.
2. **Citations Restructuring Verification**:
   - Inspect generated literature citation cards at the bottom of the program view.
   - Assert that cards display ONLY study title, authors, year, and PubMed link.
   - Assert that no abstract or long key takeaway text is present in citation cards.
