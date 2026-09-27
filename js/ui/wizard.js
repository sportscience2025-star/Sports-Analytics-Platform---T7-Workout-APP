/**
 * wizard.js — Entry Point Coordinatore Sezione Programmazione
 * ═══════════════════════════════════════════════════════════════════
 * Coordina la visualizzazione del report del programma di allenamento:
 *   1. Inietta gli stili CSS tramite App.injectResultStyles()
 *   2. Chiama i generatori HTML modulari di App.ResultBuilder
 *   3. Assembla l'interfaccia nel container indicato
 *   4. Gestisce i tab delle fasi, la bibliografia a fisarmonica e gli alert clinici
 *   5. Inizializza App.SwapManager per la modifica/sostituzione interattiva
 *   6. Mantiene la catena di risoluzione dettagli esercizio (resolveExerciseDetail -> renderDetail)
 *
 * FUNZIONI ESPOSTE:
 *   - window.App.renderProgramResult(containerId, result)
 *
 * DIPENDENZE:
 *   - wizard-state.js          (gestione stato programma e persistenza)
 *   - wizard-result-styles.js  (stili CSS report, responsive e print)
 *   - wizard-result-builder.js (generatori HTML per sezioni report)
 *   - wizard-swap.js           (sistema interattivo di modifica/sostituzione)
 *   - wizard-intake.js         (wizard 5 step di creazione profilo)
 *   - window.App.resolveExerciseDetail() (da exercise-detail-resolver.js)
 *   - window.App.renderDetail() (da catalog.js)
 *   - window._exportProgramToExcel() (da export.js)
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};

    /**
     * Renderizza il report completo del programma di allenamento generato
     * @param {string} containerId - ID dell'elemento DOM contenitore del risultato
     * @param {Object} result - Oggetto contenente il programma completo generato dall'IA
     * @returns {void}
     */
    window.App.renderProgramResult = function (containerId, result) {
        const container = document.getElementById(containerId);
        if (!container || !result) return;

        container.classList.remove('hidden');

        // 1. Iniezione stili CSS dedicati (idempotente)
        if (window.App.injectResultStyles) {
            window.App.injectResultStyles();
        }

        // 2. Consolidamento note di sicurezza clinica
        const allClinicalNotes = [...(result.notes || [])];
        if (result.phases) {
            result.phases.forEach(phase => {
                if (phase.schedule) {
                    phase.schedule.forEach(day => {
                        if (day.exercises) {
                            day.exercises.forEach(ex => {
                                if (ex.note && !allClinicalNotes.includes(ex.note)) {
                                    allClinicalNotes.push(ex.note);
                                }
                            });
                        }
                    });
                }
            });
        }

        // 3. Generazione HTML modulare tramite App.ResultBuilder
        const rb = window.App.ResultBuilder;
        if (!rb) {
            console.error('[T7] ResultBuilder non disponibile.');
            return;
        }

        const headerHtml = rb.buildHeaderHtml(result);
        const rationaleHtml = rb.buildRationaleHtml(result);
        const periodizationHtml = rb.buildPeriodizationHtml(result);
        const clinicalNotesHtml = rb.buildClinicalNotesHtml(allClinicalNotes);
        const progressionHtml = rb.buildProgressionTableHtml(result);
        const bibliographyHtml = rb.buildBibliographyHtml(result);
        const phaseSelectorHtml = rb.buildPhaseSelectorHtml(result.phases || []);

        const firstPhase = (result.phases && result.phases.length > 0) ? result.phases[0] : null;
        const activePhaseHtml = firstPhase ? rb.buildPhaseContentHtml(firstPhase, result) : '';
        const actionsHtml = rb.buildActionsHtml();

        // 4. Assemblaggio layout nel container
        container.innerHTML = `
            <div class="program-result-v3 animate-fade-in">
                ${headerHtml}
                ${rationaleHtml}
                ${periodizationHtml}
                ${clinicalNotesHtml}
                ${progressionHtml}
                ${bibliographyHtml}
                ${phaseSelectorHtml}
                <div id="active-phase-container" class="active-phase-schedule-container">
                    ${activePhaseHtml}
                </div>
                ${actionsHtml}
            </div>
        `;

        const reportRoot = container.querySelector('.program-result-v3');
        if (!reportRoot) return;

        // 5. Listener: Cambio tab fasi del programma
        reportRoot.querySelectorAll('.phase-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (window.App.SwapManager && typeof window.App.SwapManager.cleanup === 'function') {
                    window.App.SwapManager.cleanup();
                }

                const targetBtn = e.currentTarget;
                reportRoot.querySelectorAll('.phase-tab-btn').forEach(b => b.classList.remove('active'));
                targetBtn.classList.add('active');

                const phaseId = parseInt(targetBtn.dataset.phaseId, 10);
                const phaseData = (result.phases || []).find(p => p.id == phaseId);

                const activePhaseContainer = reportRoot.querySelector('#active-phase-container');
                if (activePhaseContainer && phaseData && rb.buildPhaseContentHtml) {
                    activePhaseContainer.innerHTML = rb.buildPhaseContentHtml(phaseData, result);
                }
            });
        });

        // 6. Listener: Accordion prescrizioni di sicurezza clinica
        const caToggle = reportRoot.querySelector('.ca-toggle');
        if (caToggle) {
            caToggle.addEventListener('click', () => {
                const isExpanded = caToggle.getAttribute('aria-expanded') === 'true';
                caToggle.setAttribute('aria-expanded', !isExpanded);
                const caBody = reportRoot.querySelector('.ca-body');
                if (caBody) {
                    caBody.hidden = isExpanded;
                }
            });
        }

        // 7. Listener: Accordion riferimenti bibliografici (click + tastiera Enter/Space)
        function toggleBibItem(summaryEl) {
            if (!summaryEl) return;
            const isExpanded = summaryEl.getAttribute('aria-expanded') === 'true';
            summaryEl.setAttribute('aria-expanded', !isExpanded);
            const detail = summaryEl.nextElementSibling;
            if (detail && detail.classList.contains('bib-detail')) {
                detail.hidden = isExpanded;
            }
        }

        reportRoot.addEventListener('click', (e) => {
            const summary = e.target.closest('.bib-summary');
            if (summary) {
                toggleBibItem(summary);
            }
        });

        reportRoot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const summary = e.target.closest('.bib-summary');
                if (summary) {
                    e.preventDefault();
                    toggleBibItem(summary);
                }
            }
        });

        // 8. Listener: Esportazione PDF / Stampa
        const btnPdf = reportRoot.querySelector('#btn-export-pdf');
        if (btnPdf) {
            btnPdf.addEventListener('click', () => {
                window.print();
            });
        }

        // 9. Listener: Esportazione Excel (.xlsx)
        const btnExcel = reportRoot.querySelector('#btn-export-excel');
        if (btnExcel) {
            btnExcel.addEventListener('click', async () => {
                const exportFn = window._exportProgramToExcel || (typeof _exportProgramToExcel !== 'undefined' ? _exportProgramToExcel : null);
                if (typeof exportFn === 'function') {
                    await exportFn(result);
                } else {
                    console.error('[T7] Modulo di esportazione Excel non caricato.');
                }
            });
        }

        // 10. Listener: Reset e Nuova Scheda con conferma
        const btnClose = reportRoot.querySelector('#btn-close-report');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                if (window.App.resetWizardWithConfirmation) {
                    window.App.resetWizardWithConfirmation();
                }
            });
        }

        // 11. Listener: Popup dettaglio esercizio (preserva integrazione resolveExerciseDetail + renderDetail)
        reportRoot.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-ex-detail');
            if (!btn) return;
            e.stopPropagation();

            const exName = btn.dataset.exName;
            const exId = btn.dataset.exId;
            const rawPhaseId = btn.dataset.phaseId;
            const phaseId = (rawPhaseId !== undefined && rawPhaseId !== null && String(rawPhaseId).trim() !== '') ? rawPhaseId : null;
            let fullEx = null;

            if (window.App.resolveExerciseDetail) {
                fullEx = window.App.resolveExerciseDetail(exId, exName, { result, container: reportRoot, phaseId });
            } else if (window.App.getExercises) {
                const all = window.App.getExercises();
                fullEx = all.find(item => item && ((item.id && item.id === exId) || item.name === exName));
            }

            if (fullEx && window.App.renderDetail) {
                window.App.renderDetail(fullEx);
            }
        });

        // 12. Inizializzazione gestore interattivo Swap/Edit/Delete
        if (window.App.SwapManager && typeof window.App.SwapManager.init === 'function') {
            window.App.SwapManager.init(reportRoot, result);
        }

        // Scroll fluido al report generato
        container.scrollIntoView({ behavior: 'smooth' });
    };

})();
