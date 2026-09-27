/**
 * wizard-result-builder.js
 * ═══════════════════════════════════════════════════════════════════
 * Generatori HTML per le sezioni del report del programma di allenamento.
 * Ogni funzione riceve i dati dal motore AI (oggetto result) e restituisce
 * una stringa HTML pronta per l'inserimento nel DOM.
 *
 * RESPONSABILITA': Separazione netta tra dati (logic.js) e presentazione (UI).
 *                  Qui si definisce COSA viene mostrato, non COME appare (stili in wizard-result-styles.js).
 *
 * FUNZIONI ESPOSTE (via window.App.ResultBuilder):
 *   .buildHeaderHtml(result)              -> Header con titolo, badge, indicatore rischio
 *   .buildRationaleHtml(result)           -> Card rationale scientifico strutturato in 4 blocchi
 *   .buildPeriodizationHtml(result)       -> Card metodo di periodizzazione
 *   .buildClinicalNotesHtml(allNotes)     -> Prescrizioni sicurezza (collapsible)
 *   .buildProgressionTableHtml(result)    -> Tabella timeline settimane (responsive)
 *   .buildBibliographyHtml(result)        -> Lista compatta citazioni scientifiche (accordion)
 *   .buildPhaseSelectorHtml(phases)       -> Tab selettori fasi
 *   .buildPhaseContentHtml(phase, result) -> Contenuto fase: obiettivo + banner clinico + tabella esercizi interattiva
 *   .buildActionsHtml()                   -> Bottoni export PDF/Excel/Nuova Scheda
 *
 * DIPENDENZE:
 *   - window.escapeHTML() (da helpers.js)
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};
    window.App.ResultBuilder = window.App.ResultBuilder || {};

    const DEFAULT_WEEKS_COUNT = 12;
    const CLINICAL_COLLAPSE_THRESHOLD = 3;

    /**
     * Sanitizza una stringa per l'output HTML sicuro
     * @param {string} str - Stringa da sanitizzare
     * @returns {string} Stringa sanitizzata
     */
    function safeEscape(str) {
        if (typeof window.escapeHTML === 'function') {
            return window.escapeHTML(str);
        }
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Genera l'HTML dell'header del report con titolo, badge e profilo di rischio
     * @param {Object} result - Oggetto programma generato dall'IA
     * @returns {string} Frammento HTML dell'header
     */
    window.App.ResultBuilder.buildHeaderHtml = function (result) {
        const meta = result.meta || {};
        const riskLevel = meta.riskLevel || 'LOW';
        const riskColor = riskLevel === 'HIGH' ? '#ef4444' :
            riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981';

        const isClinical = meta.patientType === 'Clinico';
        const patientTypeLabel = isClinical ? 'Paziente Clinico' : 'Atleta / Fitness';
        const sportTagHtml = (!isClinical && meta.sportPraticato && meta.sportPraticato !== 'N/A')
            ? `<span class="tag sport">Sport: ${safeEscape(meta.sportPraticato)}</span>`
            : '';

        return `
            <div class="report-header-v3">
                <div class="rh-left">
                    <span class="rh-kicker">REPORT DI PROGRAMMAZIONE COMPLETO</span>
                    <h2>Scheda di Preparazione Atletica Personale</h2>
                    <div class="rh-meta">
                        <span class="tag patient-type">${patientTypeLabel}</span>
                        ${sportTagHtml}
                        <span class="tag split">${safeEscape(meta.splitName || '')}</span>
                        <span class="tag goal">${safeEscape(meta.goal || '')}</span>
                        <span class="tag level">${safeEscape(meta.level || '')}</span>
                    </div>
                </div>
                <div class="rh-right">
                    <div class="risk-indicator" style="--risk-color: ${riskColor}">
                        <div class="risk-lbl">Profilo di Rischio</div>
                        <div class="risk-val">${safeEscape(riskLevel)}</div>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Genera l'HTML del rationale scientifico strutturato in 4 blocchi indipendenti
     * con fallback retrocompatibile al testo unico
     * @param {Object} result - Oggetto programma generato dall'IA
     * @returns {string} Frammento HTML della card rationale
     */
    window.App.ResultBuilder.buildRationaleHtml = function (result) {
        if (!result.rationaleStructured && !result.summaryRationale) return '';

        let contentHtml = '';
        if (result.rationaleStructured) {
            const s = result.rationaleStructured;
            contentHtml = `
                <div class="rc-grid">
                    <div class="rc-block block-goal">
                        <div class="rc-block-label">Obiettivo della Programmazione</div>
                        <p class="rc-block-text">${safeEscape(s.obiettivo)}</p>
                    </div>
                    <div class="rc-block block-arch">
                        <div class="rc-block-label">Architettura di Periodizzazione</div>
                        <p class="rc-block-text">${safeEscape(s.architettura)}</p>
                    </div>
                    <div class="rc-block block-biomech">
                        <div class="rc-block-label">Prescrizioni Biomeccaniche</div>
                        <p class="rc-block-text">${safeEscape(s.biomeccanica || 'Nessuna prescrizione biomeccanica specifica.')}</p>
                    </div>
                    <div class="rc-block block-load">
                        <div class="rc-block-label">Strategia di Carico e Progressione</div>
                        <p class="rc-block-text">${safeEscape(s.carico)}</p>
                    </div>
                </div>
            `;
        } else {
            contentHtml = `<p class="summary-rationale-fallback">${safeEscape(result.summaryRationale)}</p>`;
        }

        return `
            <div class="rationale-card-v4">
                <div class="rc-header">
                    <span class="rc-badge">Rationale Scientifico & Logica di Allenamento AI</span>
                </div>
                ${contentHtml}
            </div>
        `;
    };

    /**
     * Genera l'HTML della card descrittiva del metodo di periodizzazione adottato
     * @param {Object} result - Oggetto programma generato dall'IA
     * @returns {string} Frammento HTML del metodo di periodizzazione
     */
    window.App.ResultBuilder.buildPeriodizationHtml = function (result) {
        if (!result.periodization) return '';

        const p = result.periodization;
        return `
            <div class="periodization-card-v3">
                <div class="p-card-header">
                    <span class="p-card-badge">Metodo di Periodizzazione AI</span>
                    <h4 class="p-card-title">${safeEscape(p.name || '')}</h4>
                </div>
                <div class="p-card-body">
                    <p class="p-rationale">${safeEscape(p.rationale || '')}</p>
                    <div class="p-pattern-box">
                        <strong>Progressione:</strong> ${safeEscape(p.progressionPattern || '')}
                    </div>
                    <div class="p-researchers">
                        Riferimenti Scientifici: <em>${safeEscape(p.keyResearchers || '')}</em>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Genera l'HTML delle prescrizioni di sicurezza clinica con comportamento collapsibile
     * @param {Array<string>} allNotes - Array di note cliniche deduplicate
     * @returns {string} Frammento HTML delle prescrizioni cliniche
     */
    window.App.ResultBuilder.buildClinicalNotesHtml = function (allNotes) {
        if (!allNotes || allNotes.length === 0) return '';

        const isCollapsed = allNotes.length > CLINICAL_COLLAPSE_THRESHOLD;
        return `
            <div class="clinical-alerts-v2">
                <button type="button" class="ca-toggle" aria-expanded="${isCollapsed ? 'false' : 'true'}">
                    <span class="ca-title">Prescrizioni di Sicurezza Clinica</span>
                    <span class="ca-count">${allNotes.length} prescrizioni</span>
                    <span class="ca-chevron">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </span>
                </button>
                <div class="ca-body" ${isCollapsed ? 'hidden' : ''}>
                    <ul class="ca-list">
                        ${allNotes.map(note => `<li>${safeEscape(note)}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    };

    /**
     * Genera l'HTML della timeline di progressione a settimane con supporto responsive mobile
     * @param {Object} result - Oggetto programma generato dall'IA
     * @returns {string} Frammento HTML della tabella di progressione
     */
    window.App.ResultBuilder.buildProgressionTableHtml = function (result) {
        const weeks = (result.meta && result.meta.weeks) || DEFAULT_WEEKS_COUNT;
        const progression = result.progression || [];

        return `
            <div class="progression-section">
                <h3>Timeline ${weeks} Settimane</h3>
                <div class="table-responsive">
                    <table class="prog-table">
                        <thead>
                            <tr>
                                <th>Settimane</th>
                                <th>Fase</th>
                                <th>Volume</th>
                                <th>Intensità</th>
                                <th>Focus Clinico / Metodologico</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${progression.map(p => `
                                <tr>
                                    <td data-label="Settimane"><span class="badge-week">${safeEscape(p.weeks || '')}</span></td>
                                    <td data-label="Fase"><strong>${safeEscape(p.phase || '')}</strong></td>
                                    <td data-label="Volume">${safeEscape(p.vol || '')}</td>
                                    <td data-label="Intensità">${safeEscape(p.int || '')}</td>
                                    <td data-label="Focus">${safeEscape(p.note || '')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    /**
     * Genera l'HTML della bibliografia scientifica in lista verticale compatta con accordion
     * @param {Object} result - Oggetto programma generato dall'IA
     * @returns {string} Frammento HTML della bibliografia
     */
    window.App.ResultBuilder.buildBibliographyHtml = function (result) {
        const citationsList = (result.citations && result.citations.length > 0)
            ? result.citations
            : (result.explanations || []).map(e => e.sourceMetadata || {
                title: e.title,
                authors: '',
                year: '',
                journal: '',
                area: e.category,
                url: ''
            });

        if (!citationsList || citationsList.length === 0) return '';

        return `
            <div class="bibliography-section">
                <h3>Riferimenti Scientifici e Bibliografia</h3>
                <div class="bib-list">
                    ${citationsList.map(cit => {
                        const area = cit.area || 'Scienza dello Sport';
                        const year = cit.year || '';
                        const title = cit.title || '';
                        let authors = cit.authors || '';
                        // Pulizia metadati di debug RAG per veste editoriale pulita nel report/PDF
                        authors = authors.replace(/•?\s*Similarity Score:\s*[\d.]+/gi, '').trim();
                        if (authors.endsWith('•')) authors = authors.slice(0, -1).trim();
                        if (!authors && String(area).toUpperCase().includes('RAG')) {
                            authors = 'Archivio Metodologico Interno T7';
                        }
                        const journal = cit.journal || '';
                        const url = cit.url || '';

                        return `
                            <div class="bib-item">
                                <div class="bib-summary" tabindex="0" role="button" aria-expanded="false">
                                    <span class="bib-badge">${safeEscape(area)}</span>
                                    <span class="bib-year">${safeEscape(year)}</span>
                                    <span class="bib-title" title="${safeEscape(title)}">${safeEscape(title)}</span>
                                    <span class="bib-chevron">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="6 9 12 15 18 9"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="bib-detail" hidden>
                                    <p class="bib-authors">${safeEscape(authors)}${journal ? ` &bull; <em>${safeEscape(journal)}</em>` : ''}</p>
                                    ${url ? `<a href="${safeEscape(url)}" target="_blank" rel="noopener" class="bib-doi-link">Fonte PubMed / DOI &rarr;</a>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    };

    /**
     * Genera l'HTML dei bottoni selettori delle fasi
     * @param {Array<Object>} phases - Array delle fasi del programma
     * @returns {string} Frammento HTML del selettore fasi
     */
    window.App.ResultBuilder.buildPhaseSelectorHtml = function (phases) {
        if (!phases || phases.length === 0) return '';

        return `
            <div class="phase-selector-section">
                <h3>Esplora le ${phases.length} Fasi del Programma</h3>
                <div class="phase-tabs-v3">
                    ${phases.map((p, idx) => `
                        <button type="button" class="phase-tab-btn ${idx === 0 ? 'active' : ''} ${p.isDeload ? 'is-deload-tab' : ''}" data-phase-id="${p.id}">
                            <span class="tab-weeks">${safeEscape(p.weeks || '')}</span>
                            <span class="tab-name">${safeEscape((p.name || '').split(':')[0])}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    };

    /**
     * Genera l'HTML del contenuto di una fase specifica (obiettivo, specifiche cliniche, tabella esercizi)
     * @param {Object} phase - Oggetto fase da visualizzare
     * @param {Object} result - Oggetto programma completo per metadati
     * @returns {string} Frammento HTML del contenuto della fase
     */
    window.App.ResultBuilder.buildPhaseContentHtml = function (phase, result) {
        if (!phase || !phase.schedule) return '';

        let scheduleHtml = '';
        phase.schedule.forEach((day, dayIndex) => {
            if (day.isRest) {
                scheduleHtml += `
                    <div class="day-card rest-day">
                        <div class="day-header">
                            <h4>${safeEscape(day.name)}</h4>
                            <span class="badge rest">RECUPERO</span>
                        </div>
                        <div class="day-body">Recupero Attivo (Stretching leggero, Mobilità, Rilascio Miofasciale)</div>
                    </div>
                `;
            } else {
                const exercises = day.exercises || [];
                const warmups = exercises.filter(e => e.isWarmup);
                const workout = exercises.filter(e => !e.isWarmup && !e.isCardio);
                const cardio = exercises.filter(e => e.isCardio);

                const focusText = Array.isArray(day.focus) ? day.focus.join(' • ') : (day.focus || '');

                scheduleHtml += `
                    <div class="day-card work-day">
                        <div class="day-header">
                            <div class="dh-left">
                                <h4>${safeEscape(day.name)}</h4>
                                <span class="day-focus">${safeEscape(focusText)}</span>
                            </div>
                            <div class="dh-right">
                                <span class="time-badge">~${day.estDuration || 50} min</span>
                            </div>
                        </div>

                        <div class="day-content">
                            <!-- WARMUP -->
                            ${warmups.length > 0 ? `
                                <div class="section-block warmup-block">
                                    <h5>Warm-Up (Riscaldamento)</h5>
                                    ${warmups.map(ex => {
                                        const globalIndex = exercises.indexOf(ex);
                                        const specs = ex.specs || {};
                                        return `
                                            <div class="warmup-row">
                                                <div>
                                                    <span class="ex-name">${safeEscape(ex.name)}</span>
                                                    <span class="ex-specs" style="margin-left: 0.5rem;">${safeEscape(specs.sets || 2)} x ${safeEscape(specs.reps || '10-12')}</span>
                                                </div>
                                                <button type="button" class="btn-ex-detail" data-ex-id="${safeEscape(ex.id || '')}" data-ex-name="${safeEscape(ex.name)}" data-phase-id="${phase.id}" data-day-index="${dayIndex}" data-global-index="${globalIndex}" title="Vedi dettagli" style="background: transparent; border: none; cursor: pointer; color: var(--primary, #6366f1); display: flex; align-items: center;">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : ''}

                            <!-- MAIN WORKOUT: TABELLA INTERATTIVA -->
                            <div class="section-block main-block">
                                <h5>Allenamento Principale</h5>
                                <div class="ex-table-wrapper">
                                    <table class="ex-interactive-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Esercizio</th>
                                                <th>Serie</th>
                                                <th>Reps</th>
                                                <th>Carico</th>
                                                <th>RPE</th>
                                                <th>Rest</th>
                                                <th>Tempo</th>
                                                <th class="col-actions"></th>
                                                <th class="col-print-log">Carico Effettivo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${workout.map((ex, i) => {
                                                const globalIndex = exercises.indexOf(ex);
                                                const specs = ex.specs || {};
                                                const escapedName = safeEscape(ex.name);
                                                const noteHtml = ex.note ? `<div class="ex-inline-note">${safeEscape(ex.note)}</div>` : '';

                                                return `
                                                    <tr class="ex-row-interactive ${ex.isadapted ? 'is-adapted' : ''}"
                                                        data-ex-id="${safeEscape(ex.id || '')}"
                                                        data-ex-name="${escapedName}"
                                                        data-phase-id="${phase.id}"
                                                        data-day-index="${dayIndex}"
                                                        data-global-index="${globalIndex}">
                                                        <td data-label="#">${i + 1}</td>
                                                        <td data-label="Esercizio" class="ex-cell-name">
                                                            <button type="button" class="btn-ex-detail ex-name-btn" data-ex-id="${safeEscape(ex.id || '')}" data-ex-name="${escapedName}" data-phase-id="${phase.id}" title="Vedi dettagli esercizio">
                                                                ${escapedName}
                                                            </button>
                                                            ${ex.isadapted ? '<span class="adapted-badge">ADATTATO</span>' : ''}
                                                            ${noteHtml}
                                                        </td>
                                                        <td data-label="Serie">${safeEscape(specs.sets !== undefined ? specs.sets : 3)}</td>
                                                        <td data-label="Reps">${safeEscape(specs.reps || '10')}</td>
                                                        <td data-label="Carico" class="cell-highlight">${safeEscape(specs.load || 'A corpo libero')}</td>
                                                        <td data-label="RPE">${safeEscape(specs.rpe !== undefined ? specs.rpe : 7)}</td>
                                                        <td data-label="Rest">${safeEscape(specs.rest || '90s')}</td>
                                                        <td data-label="Tempo">${safeEscape(specs.tempo || '2-0-2-0')}</td>
                                                        <td class="col-actions">
                                                            <button type="button" class="ex-action-btn" title="Azioni esercizio"
                                                                    data-ex-id="${safeEscape(ex.id || '')}"
                                                                    data-ex-name="${escapedName}"
                                                                    data-phase-id="${phase.id}"
                                                                    data-day-index="${dayIndex}"
                                                                    data-global-index="${globalIndex}">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                                                                </svg>
                                                            </button>
                                                        </td>
                                                        <td class="col-print-log">
                                                            <span class="print-log-box">[ &nbsp; &nbsp; &nbsp; &nbsp; kg ]</span>
                                                        </td>
                                                    </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- CARDIO / DEFATICAMENTO -->
                            ${cardio.length > 0 ? `
                                <div class="section-block cardio-block">
                                    <h5>Defaticamento & Cardio</h5>
                                    ${cardio.map(c => {
                                        const globalIndex = exercises.indexOf(c);
                                        const specs = c.specs || {};
                                        return `
                                            <div class="cardio-row">
                                                <div>
                                                    <span class="c-name">${safeEscape(c.name)}</span>
                                                    <span class="c-specs" style="margin-left: 0.5rem;">${safeEscape(specs.sets || 1)} &bull; ${safeEscape(specs.reps || '10 min')}</span>
                                                </div>
                                                <button type="button" class="btn-ex-detail" data-ex-id="${safeEscape(c.id || '')}" data-ex-name="${safeEscape(c.name)}" data-phase-id="${phase.id}" data-day-index="${dayIndex}" data-global-index="${globalIndex}" title="Vedi dettagli" style="background: transparent; border: none; cursor: pointer; color: var(--primary, #6366f1); display: flex; align-items: center;">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }
        });

        const isClinical = result.meta && result.meta.patientType === 'Clinico';
        const clinicalSpecsHtml = isClinical ? `
            <div class="phase-clinical-specs-banner">
                <div class="spec-bubble">
                    <span class="lbl">RPE Limite (Cap)</span>
                    <span class="val">RPE ${phase.rpeCap || 6}</span>
                </div>
                <div class="spec-bubble">
                    <span class="lbl">ROM Ginocchio Consentito</span>
                    <span class="val">${phase.kneeROM || 90}&deg; flessione max</span>
                </div>
                <div class="spec-bubble ${phase.isDeload ? 'deload-status' : 'work-status'}">
                    <span class="lbl">Stato Fase</span>
                    <span class="val">${phase.isDeload ? 'Scarico Clinico' : 'Fase Attiva'}</span>
                </div>
            </div>
        ` : '';

        const progItem = (result.progression && result.progression[phase.id - 1]) || {};

        return `
            <div class="phase-objective-card">
                <h4>Obiettivo della Fase</h4>
                <p>${safeEscape(phase.objective || '')}</p>
                <div class="phase-meta-info">
                    <span><strong>Volume:</strong> ${safeEscape(progItem.vol || 'N/A')}</span>
                    <span><strong>Intensità:</strong> ${safeEscape(progItem.int || 'N/A')}</span>
                    <span><strong>Focus:</strong> ${safeEscape(phase.focus || '')}</span>
                </div>
            </div>
            ${clinicalSpecsHtml}
            <div class="schedule-grid-v3">${scheduleHtml}</div>
        `;
    };

    /**
     * Genera l'HTML dei pulsanti di esportazione Excel, PDF e reset scheda
     * @param {string} [position='bottom'] - Posizione ('top' o 'bottom')
     * @returns {string} Frammento HTML del blocco azioni report
     */
    window.App.ResultBuilder.buildActionsHtml = function (position = 'bottom') {
        const idSuffix = position === 'top' ? '-top' : '';
        const positionClass = position === 'top' ? 'report-actions-top' : 'report-actions-bottom';
        return `
            <div class="report-actions-v3 ${positionClass}">
                <div class="export-group">
                    <span class="export-label">Esporta Programma</span>
                    <div class="export-btns">
                        <button type="button" class="btn-excel-export" id="btn-export-excel${idSuffix}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            Excel (.xlsx)
                        </button>
                        <button type="button" class="btn-pdf-export" id="btn-export-pdf${idSuffix}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="12" y1="18" x2="12" y2="12"/>
                                <line x1="9" y1="15" x2="15" y2="15"/>
                            </svg>
                            PDF / Stampa
                        </button>
                    </div>
                </div>
                <button type="button" class="btn-close-report" id="btn-close-report${idSuffix}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Nuova Scheda
                </button>
            </div>
        `;
    };

    /**
     * Genera l'HTML di tutte le fasi sequenziali del programma per il rendering di stampa A4
     * @param {Object} result - Oggetto programma completo
     * @returns {string} Frammento HTML di tutte le fasi
     */
    window.App.ResultBuilder.buildAllPhasesPrintHtml = function (result) {
        const phases = result.phases || [];
        if (phases.length === 0) return '';

        return `
            <div class="print-all-phases-container">
                ${phases.map((phase, idx) => {
                    const phaseContent = window.App.ResultBuilder.buildPhaseContentHtml(phase, result);
                    const progItem = (result.progression && result.progression[phase.id - 1]) || {};
                    return `
                        <div class="print-phase-block">
                            <div class="print-phase-header">
                                <span class="print-phase-kicker">FASE ${idx + 1} DI ${phases.length}</span>
                                <h3>${safeEscape(phase.name || '')}</h3>
                                <div class="print-phase-meta">
                                    <span><strong>Settimane:</strong> ${safeEscape(phase.weeks || '')}</span>
                                    <span><strong>Volume:</strong> ${safeEscape(progItem.vol || 'N/A')}</span>
                                    <span><strong>Intensità:</strong> ${safeEscape(progItem.int || 'N/A')}</span>
                                    <span><strong>Focus:</strong> ${safeEscape(phase.focus || '')}</span>
                                </div>
                            </div>
                            ${phaseContent}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    };

})();
