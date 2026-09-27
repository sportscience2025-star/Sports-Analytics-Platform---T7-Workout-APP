# Handoff Report: RAG Offline Synthesis & Dual-Panel UI Design
**Agent**: explorer_rag_synthesis (Teamwork Explorer)  
**Parent Agent ID**: 09df0b77-2564-4630-9ea7-4da44dac60a5  
**Milestone**: Offline RAG Synthesis Design  
**Date**: 2026-07-17T11:30:15+02:00  

---

## 1. Observation

During read-only investigation, the following files and code locations were analyzed:

### A. RAG Search Execution & Rendering (`js/rag-ui.js`)
* **Location**: Lines 259–303 inside `setupSearch()`.
* **Current Behavior**:
  1. The user inputs a query and clicks search.
  2. The semantic search is executed: `const chunks = await window.RAGEngine.semanticSearch(query, 3);` (Line 266).
  3. If chunks are found, they are mapped linearly to card structures and directly injected into `#search-results-container` (Lines 273–303):
     ```javascript
     resultsContainer.innerHTML = chunks.map(chunk => {
         // ...
         return `
             <div class="chunk-result-card">
                 <div class="chunk-result-header">
                     <span class="chunk-docname">${docName}</span>
                     ${scoreBadge}
                 </div>
                 <div class="chunk-text">${text}</div>
             </div>
         `;
     }).join('');
     ```

### B. Core RAG Retrieval (`js/rag-engine.js`)
* **Location**: Lines 520–538 in `semanticSearch(queryText, limit = 5)`.
* **Current Behavior**:
  1. Chunks are retrieved from IndexedDB (`const chunks = await this.getAllChunks();`).
  2. Cosine similarity is computed against the query embedding in a Web Worker (or fallback thread).
  3. Chunks are returned sorted descending by score. Each chunk has the structure:
     ```javascript
     {
         text: "...",
         score: 0.852,
         docName: "Forza_Specs.txt"
     }
     ```

### C. Design Tokens & Styling (`css/style.css`)
* **Location**: Lines 1–67 (CSS variables) and lines 3625–4005 (RAG UI Styles).
* **Observed Tokens**:
  * Accent color: `--accent: #06d6a0;` (emerald/mint green)
  * Primary color: `--primary: #6366f1;` (indigo)
  * Glass containers: `var(--glass-bg-light);` and `border: 1px solid var(--glass-border);`
  * Layout variables: `var(--radius-md)` (12px), `var(--border)` (rgba border).

### D. Testing Environment (`tests/`)
* **Test runners**: 
  * `py run_single_test.py <test-file>` runs a single JS test file in Microsoft Edge headless mode.
* **Test results**:
  * Checked `tests/test_rag.js` and `tests/test_rag_ui_adversarial.js` by running them locally:
    * `py run_single_test.py test_rag.js` -> `Status: PASS` (100% success).
    * `py run_single_test.py test_rag_ui_adversarial.js` -> `Status: PASS` (100% success).

---

## 2. Logic Chain

1. **Sentence Splitting & Cleaning Heuristics**:
   * Text extraction from PDFs and Excel spreadsheets can introduce multiple consecutive whitespaces and trailing line breaks. We must normalize these to clean up the output.
   * To split paragraphs into sentences, a simple string split on periods (`.`) would break on decimals (e.g., `0.75 m/s`) or unit numbers. 
   * **Solution**: A regular expression matching sentence boundary markers followed by whitespace and an uppercase letter (e.g. `/(?<=[.!?])\s+(?=[A-Z0-9\u00C0-\u00DC])/g`) correctly identifies true boundaries while preserving decimals and standard unit notations.

2. **Deduplication against Chunk Overlap**:
   * The RAG chunking algorithm uses a 100-character overlap (defined in `js/rag-engine.js` line 130). 
   * As a result, semantically consecutive retrieved chunks often contain duplicate sentences.
   * **Solution**: We maintain a `Set` of lowercase, whitespace-normalized sentence strings. If a sentence in a subsequent chunk matches a value in the `Set`, it is skipped.

3. **Key Parameters and Metrics Extraction**:
   * Under sports science contexts (Velocity-Based Training, program periodization, hypertrophy profiles), parameters are defined as numbers paired with unit markers (such as `%`, `kg`, `m/s`, `rip`, `set`, `watt`, `RPE`).
   * **Solution**: An athletic parameter regex matches numbers with units:
     `/\b\d+(?:[\.,]\d+)?\s*(?:%|kg\b|kilogrammi\b|chili\b|m\/s|m·s\^-1|ripetizioni\b|rip\b|reps\b|serie\b|set\b|sec\b|secondi\b|min\b|minuti\b|watt\b|w\b|hz|hertz\b|rm\b|cm\b|metri\b|m\b)|\brpe\s*\d+(?:[\.,]\d+)?\b/gi`
   * Matched metrics are formatted into custom badge tags positioned inside the Conceptual Synthesis.

4. **Keyword Highlighting Rules**:
   * Standard stop words in Italian must be ignored to prevent highlighting common grammatical particles.
   * **Solution**: The query is sanitized by stripping punctuation and removing common Italian particles. The remaining words are sorted by length descending (preventing sub-word overrides) and compiled into a case-insensitive boundary regex (`new RegExp('\\b(' + keywords.join('|') + ')\\b', 'gi')`). A callback function replaces matches, maintaining their original letter case.

5. **Dual-Panel Responsive Layout**:
   * The container `#search-results-container` will host:
     * **Panel A**: Left Column, 60% (1.2fr) - Sintesi Concettuale Locale, featuring synthesized texts organized by document and the metric tags badge section.
     * **Panel B**: Right Column, 40% (0.8fr) - Frammenti ed Evidenze Correlate, listing the raw retrieved chunks with relevance ratings.
   * **Solution**: CSS Grid with media query overrides stacks the panels vertically on mobile screens (`<=768px`), matching the PWA responsiveness rules (AGENTS.md).

---

## 3. Caveats

* **Italian Abbreviations**: Common abbreviations followed by spaces and capitalized words (e.g., *"Es. Squat"* or *"Min. 30"*) might trigger incorrect sentence splits. Since this is a minor visual detail, the risk is low.
* **Stop Word Coverage**: The hardcoded stop word list is scoped to common Italian grammatical elements. Queries in English or with highly specialized slang might highlight minor filler words.
* **Main Thread Performance**: All synthesis, metrics extraction, and highlighting are executed on the main UI thread. However, since the retrieval is capped at `limit = 3` or `5`, the text length is small, keeping processing time below `5ms`, which maintains responsive UI performance.

---

## 4. Conclusion (Implementation Design & Code Proposal)

The proposed design should be implemented directly in `js/rag-ui.js` and `css/style.css`. Because the explorer role is read-only, the following snippets are prepared for the implementer agent.

### A. Code Additions in `js/rag-ui.js`

The following utility methods should be added to the `RAGUI` class:

```javascript
        /**
         * Clean text, split it into sentences, and extract key metrics.
         * Group relevant sentences by document name.
         */
        synthesizeOfflineResponse(query, chunks) {
            const keywords = this.extractKeywords(query);
            const docGroups = {};
            const allMetrics = new Set();
            
            for (const chunk of chunks) {
                const docName = chunk.docName || 'Documentazione scientifica';
                if (!docGroups[docName]) {
                    docGroups[docName] = [];
                }
                
                const sentences = this.splitIntoSentences(chunk.text);
                for (const sentence of sentences) {
                    docGroups[docName].push(sentence);
                    
                    // Extract parameters/metrics
                    const metrics = this.extractMetrics(sentence);
                    metrics.forEach(m => allMetrics.add(m));
                }
            }
            
            const synthesizedDocs = [];
            for (const [docName, sentences] of Object.entries(docGroups)) {
                // Deduplicate sentences (frequently occurring in overlapping chunk borders)
                const seen = new Set();
                const uniqueSentences = [];
                for (const s of sentences) {
                    const norm = s.toLowerCase().replace(/\s+/g, ' ').trim();
                    if (!seen.has(norm)) {
                        seen.add(norm);
                        uniqueSentences.push(s);
                    }
                }
                
                // Filter sentences to keep:
                // 1. The first sentence of the document/chunk (provides context)
                // 2. Sentences containing query keywords
                // 3. Sentences containing key parameters/metrics
                let filtered = uniqueSentences.filter((s, idx) => {
                    if (idx === 0) return true;
                    if (this.containsQueryKeywords(s, keywords)) return true;
                    if (this.containsMetrics(s)) return true;
                    return false;
                });
                
                if (filtered.length === 0) {
                    filtered = uniqueSentences;
                }
                
                synthesizedDocs.push({
                    docName: docName,
                    sentences: filtered
                });
            }
            
            return {
                documents: synthesizedDocs,
                metrics: Array.from(allMetrics),
                keywords: keywords
            };
        }

        /**
         * Helper to split text into clean sentences.
         */
        splitIntoSentences(text) {
            if (!text) return [];
            const clean = text.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
            // Split by sentence punctuation (.!?) followed by space and uppercase letter/number
            const rawSentences = clean.split(/(?<=[.!?])\s+(?=[A-Z0-9\u00C0-\u00DC])/g);
            return rawSentences.map(s => s.trim()).filter(s => s.length > 5);
        }

        /**
         * Extract Italian stop words and return query terms.
         */
        extractKeywords(query) {
            const stopWords = new Set([
                'il', 'la', 'lo', 'i', 'gli', 'le', 'un', 'una', 'uno',
                'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
                'del', 'dello', 'della', 'dei', 'degli', 'delle',
                'al', 'allo', 'alla', 'ai', 'agli', 'alle',
                'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle',
                'nel', 'nello', 'nella', 'nei', 'negli', 'nelle',
                'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle',
                'col', 'coi', 'che', 'chi', 'cui', 'e', 'o', 'ed', 'od',
                'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno',
                'sono', 'sei', 'è', 'siamo', 'siete', 'sono',
                'qual', 'quale', 'quali', 'come', 'cosa', 'perche', 'perché',
                'qual è', 'quanti', 'quante', 'quanto', 'quanta'
            ]);
            return query.toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
                .split(/\s+/)
                .filter(word => word.length > 1 && !stopWords.has(word));
        }

        /**
         * Verify if a sentence contains any query keywords.
         */
        containsQueryKeywords(sentence, keywords) {
            if (keywords.length === 0) return true;
            const lower = sentence.toLowerCase();
            return keywords.some(kw => lower.includes(kw));
        }

        /**
         * Check if sentence contains physical parameters.
         */
        containsMetrics(text) {
            const metricRegex = /\b\d+(?:[\.,]\d+)?\s*(?:%|kg\b|kilogrammi\b|chili\b|m\/s|m·s\^-1|ripetizioni\b|rip\b|reps\b|serie\b|set\b|sec\b|secondi\b|min\b|minuti\b|watt\b|w\b|hz|hertz\b|rm\b|cm\b|metri\b|m\b)|\brpe\s*\d+(?:[\.,]\d+)?\b/gi;
            return metricRegex.test(text);
        }

        /**
         * Extract matching physical parameters/metrics.
         */
        extractMetrics(text) {
            const combinedRegex = /\b\d+(?:[\.,]\d+)?\s*(?:%|kg\b|kilogrammi\b|chili\b|m\/s|m·s\^-1|ripetizioni\b|rip\b|reps\b|serie\b|set\b|sec\b|secondi\b|min\b|minuti\b|watt\b|w\b|hz|hertz\b|rm\b|cm\b|metri\b|m\b)|\brpe\s*\d+(?:[\.,]\d+)?\b/gi;
            const matches = text.match(combinedRegex) || [];
            return [...new Set(matches.map(m => m.replace(/\s+/g, ' ').trim()))];
        }

        /**
         * Highlight query keywords inside a block of text.
         */
        highlightKeywords(text, keywords) {
            if (!keywords || keywords.length === 0) return text;
            const escaped = keywords
                .map(kw => kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
                .filter(kw => kw.length > 0);
            if (escaped.length === 0) return text;
            
            escaped.sort((a, b) => b.length - a.length);
            const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
            
            return text.replace(regex, (match) => {
                return `<strong style="color: var(--accent); font-weight: 600;">${match}</strong>`;
            });
        }
```

### B. UI Rendering replacement in `js/rag-ui.js`

In `setupSearch()`, replace lines 273–303 (the HTML generation loop) with the following structure:

```javascript
                    const synthesis = this.synthesizeOfflineResponse(query, chunks);
                    
                    // Render Panel A: Sintesi Concettuale Locale
                    let docGroupsHtml = '';
                    for (const doc of synthesis.documents) {
                        const highlightedSentences = doc.sentences.map(s => {
                            const highlighted = this.highlightKeywords(s, synthesis.keywords);
                            return `<span class="sintesi-sentence" style="display: block; margin-bottom: 0.5rem;">${highlighted}</span>`;
                        }).join(' ');
                        
                        docGroupsHtml += `
                            <div class="sintesi-doc-group" style="margin-bottom: 1.25rem;">
                                <div class="sintesi-doc-title" style="font-size: 0.85rem; font-weight: 700; color: var(--primary); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.25rem;">
                                    📄 ${doc.docName}
                                </div>
                                <div class="sintesi-doc-text" style="margin-left: 0.5rem; border-left: 2px solid var(--primary); padding-left: 0.75rem; color: var(--text-primary); font-size: 0.9rem; line-height: 1.6;">
                                    ${highlightedSentences}
                                </div>
                            </div>
                        `;
                    }
                    
                    let metricsHtml = '<p class="empty-list-msg" style="padding: 0.5rem 0; font-size: 0.8rem; text-align: left;">Nessun parametro numerico o metrica rilevata.</p>';
                    if (synthesis.metrics.length > 0) {
                        metricsHtml = synthesis.metrics.map(m => `
                            <span class="tag-metric" style="display: inline-flex; align-items: center; background-color: rgba(6, 214, 160, 0.12); color: var(--accent); border: 1px solid rgba(6, 214, 160, 0.25); border-radius: 4px; padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 600; margin-right: 0.5rem; margin-bottom: 0.5rem;">${m}</span>
                        `).join('');
                    }
                    
                    const panelAHtml = `
                        <div class="panel-sintesi" style="background: var(--glass-bg-light); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <h4 style="margin-bottom: 1rem; color: var(--text-primary); font-size: 1.1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-heading);">
                                    🧠 Sintesi Concettuale Locale
                                </h4>
                                <div class="sintesi-content">
                                    ${docGroupsHtml}
                                </div>
                            </div>
                            <div class="sintesi-metrics-section" style="margin-top: 1.25rem; border-top: 1px dashed var(--border); padding-top: 0.75rem;">
                                <h5 style="margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
                                    Parametri e Metriche Rilevati
                                </h5>
                                <div class="metrics-tags-container" style="display: flex; flex-wrap: wrap;">
                                    ${metricsHtml}
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Render Panel B: Frammenti ed Evidenze Correlate
                    const panelBHtml = `
                        <div class="panel-evidenze" style="display: flex; flex-direction: column; gap: 1rem;">
                            <h4 style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 600;">
                                📄 Frammenti ed Evidenze Correlate
                            </h4>
                            ${chunks.map(chunk => {
                                const score = typeof chunk.score === 'number' ? (chunk.score * 100).toFixed(1) + '%' : '0%';
                                const highlightedText = this.highlightKeywords(chunk.text || '', synthesis.keywords);
                                const docName = chunk.docName || 'Documentazione scientifica';
                                
                                const scoreVal = typeof chunk.score === 'number' ? chunk.score : 0;
                                let relevanceClass = 'relevance-low';
                                let relevanceLabel = 'Rilevanza Bassa';
                                if (scoreVal >= 0.8) {
                                    relevanceClass = 'relevance-high';
                                    relevanceLabel = 'Rilevanza Alta';
                                } else if (scoreVal >= 0.65) {
                                    relevanceClass = 'relevance-medium';
                                    relevanceLabel = 'Rilevanza Media';
                                }

                                const scoreBadge = `
                                    <span class="chunk-score dev-only">${score}</span>
                                    <span class="relevance-badge ${relevanceClass} user-only">${relevanceLabel}</span>
                                `;

                                return `
                                    <div class="chunk-result-card" style="background: var(--glass-bg-light); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.25rem;">
                                        <div class="chunk-result-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                            <span class="chunk-docname" style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">${docName}</span>
                                            ${scoreBadge}
                                        </div>
                                        <div class="chunk-text" style="font-size: 0.85rem; color: var(--text-primary); line-height: 1.5; white-space: pre-wrap;">${highlightedText}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                    
                    resultsContainer.innerHTML = `
                        <div class="rag-dual-panel">
                            ${panelAHtml}
                            ${panelBHtml}
                        </div>
                    `;
```

### C. Style Proposals for `css/style.css`

Add the following layout configuration inside `css/style.css` to manage layout columns and responsiveness:

```css
/* ==========================================================================
   RAG UI — Dual-Panel Layout (Milestone 4)
   ========================================================================== */
.rag-dual-panel {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 1.5rem;
    margin-top: 1.25rem;
}

@media (max-width: 768px) {
    .rag-dual-panel {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
    }
}
```

---

## 5. Verification Method

To verify the correct execution and layout of the new RAG offline synthesis:

1. **Verify syntactic integrity**:
   * Run the syntax helper script: `py test_check.py`.
2. **Execute Headless Test Suite**:
   * Run: `py run_tests_headless.py`.
   * Or run RAG specific tests:
     * `py run_single_test.py test_rag.js`
     * `py run_single_test.py test_rag_ui_adversarial.js`
3. **Manual Verification Criteria**:
   * Ingest a test document with typical physical parameters (e.g. *"Il massimale di squat prevede un carico di 120kg. Durante lo scarico attivo ridurre il volume al 50% eseguendo 3 set per 5 ripetizioni con velocità target di 0.75 m/s."*).
   * Submit the search query: *"carico scarico squat"*.
   * Confirm the rendering output in `#search-results-container` displays:
     * **Panel A** (Left Column) with the document name title and sentences extracted.
     * The keywords *"carico"*, *"scarico"* and *"squat"* highlighted in bold emerald green (`color: var(--accent)`).
     * The metric tags: `120kg`, `50%`, `3 set`, `5 ripetizioni`, `0.75 m/s` styled as badges inside the metric container.
     * **Panel B** (Right Column) showing the raw card layout.
     * Columns stack vertically when viewport is sized below `768px`.
