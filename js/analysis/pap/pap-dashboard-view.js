/**
 * js/analysis/pap/pap-dashboard-view.js
 * Modulo Orchestratore del Cruscotto PAP (Post-Activation Potentiation & Profilo Neuromuscolare).
 *
 * Architettura Modulare (Task E1):
 * - Rendering Tab HTML delegato a: window.PAPDashboardTabs (pap-dashboard-tabs.js)
 * - Rendering Grafici Chart.js delegato a: window.PAPDashboardCharts (pap-dashboard-charts.js)
 * - Esportazione File delegata a: window.PAPDashboardExport (pap-dashboard-export.js)
 * - Orchestrazione stato, validazione cinematica, elaborazione dati e ciclo di vita: questa classe.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Costanti Grafiche e Tematiche Anti-Gravity ---
    const COLOR_PRIMARY = '#00f0ff';
    const COLOR_ACCENT = '#6366f1';
    const COLOR_SUCCESS = '#10b981';
    const COLOR_WARNING = '#f59e0b';
    const COLOR_DANGER = '#ef4444';
    const COLOR_NEUTRAL = '#94a3b8';
    const COLOR_BG_CARD = 'rgba(15, 23, 42, 0.75)';
    const COLOR_BORDER = 'rgba(255, 255, 255, 0.10)';

    /**
     * Componente UI orchestratore per la visualizzazione dell'analisi avanzata PAP e dinamica di salto.
     */
    class PAPDashboardView {

        /**
         * Inizializza l'istanza del cruscotto PAP.
         * @param {string} containerId - ID dell'elemento DOM contenitore.
         * @param {Object} [options={}] - Opzioni di configurazione.
         */
        constructor(containerId, options = {}) {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
            this.options = options;
            this.activeTab = options.activeTab || 'overview'; // 'overview' | 'mdc' | 'stiffness' | 'neuromuscular' | 'athlete'
            this.selectedAthleteId = options.selectedAthleteId || null;
            if (options.selectedAthlete && Array.isArray(options.athletes)) {
                const found = options.athletes.find(a => String(a.id) === String(options.selectedAthlete) || a.name === options.selectedAthlete);
                if (found) this.selectedAthleteId = found.id;
            }
            this.filterOutcome = 'ALL';
            this.filterProtocol = 'ALL';
            this.charts = {};
            this.athletesData = [];
            this.processedResults = [];
            this.selectedTrendAthleteId = 'BENCHMARK_COMPARE';
            this.isAuditNotesOpen = false;
            this.isReportModalOpen = false;
            this._eventsBound = false;
        }

        /**
         * Pulisce i grafici Chart.js attivi per prevenire memory leak o sovrapposizioni su canvas.
         */
        destroyCharts() {
            Object.keys(this.charts).forEach(key => {
                if (this.charts[key] && typeof this.charts[key].destroy === 'function') {
                    this.charts[key].destroy();
                }
            });
            this.charts = {};
        }

        /**
         * Alterna la visibilità della finestra modale contenente le note metrologiche dell'Audit.
         */
        toggleAuditNotesModal() {
            this.isAuditNotesOpen = !this.isAuditNotesOpen;
            const modal = document.getElementById('pap-audit-modal-backdrop');
            if (modal) {
                modal.style.display = this.isAuditNotesOpen ? 'flex' : 'none';
            }
        }

        /**
         * Apre la finestra modale per la lettura immersiva del Master Report Scientifico PAP.
         */
        openFullHtmlReportModal() {
            this.isReportModalOpen = true;
            const modal = document.getElementById('pap-report-modal-backdrop');
            if (modal) {
                modal.style.display = 'flex';
            }
        }

        /**
         * Chiude la finestra modale del Master Report Scientifico PAP.
         */
        closeFullHtmlReportModal() {
            this.isReportModalOpen = false;
            const modal = document.getElementById('pap-report-modal-backdrop');
            if (modal) {
                modal.style.display = 'none';
            }
        }

        /**
         * Elabora il dataset degli atleti applicando validazione cinematica, calcolo statistico e motore prescrittivo.
         * @param {Array<Object>} [rawAthletes=null] - Dataset atleti. Se nullo, prova ad estrarre da options o benchmark.
         */
        processDataset(rawAthletes = null) {
            let source = rawAthletes;
            if (!source && this.options && this.options.csvText && root.PAPBenchmarkData) {
                source = root.PAPBenchmarkData.parseOptojumpCSV(this.options.csvText);
            }
            if (!source) {
                source = (root.PAPBenchmarkData && typeof root.PAPBenchmarkData.getBenchmarkDataset === 'function')
                    ? root.PAPBenchmarkData.getBenchmarkDataset()
                    : [];
            }
            this.athletesData = source || [];
            if (this.athletesData.length > 0 && !this.selectedAthleteId) {
                this.selectedAthleteId = this.athletesData[0].id;
            }

            const results = [];
            if (this.athletesData.length === 0) {
                this.processedResults = [];
                return;
            }

            const Validator = root.PAPIntegrityValidator;
            const Stats = root.PAPStatsEngine;
            const Coach = root.PAPCoachEngine;

            source.forEach(athlete => {
                const sjPre = athlete.singleJumps?.sjPre || 0;
                const sjPost = athlete.singleJumps?.sjPost || 0;
                const cmjPre = athlete.singleJumps?.cmjPre || 0;
                const cmjPost = athlete.singleJumps?.cmjPost || 0;
                const abkPre = athlete.singleJumps?.abkPre || 0;
                const abkPost = athlete.singleJumps?.abkPost || 0;

                // 1. Valutazione MDC 95%
                const sjMdc = Stats ? Stats.evaluateSingleJumpMDC('SJ', sjPre, sjPost) : { deltaPercent: 0, isRealChange: false };
                const cmjMdc = Stats ? Stats.evaluateSingleJumpMDC('CMJ', cmjPre, cmjPost) : { deltaPercent: 0, isRealChange: false };
                const abkMdc = Stats ? Stats.evaluateSingleJumpMDC('ABK', abkPre, abkPost) : { deltaPercent: 0, isRealChange: false };

                // 2. Pulizia rimbalzi e rimozione artefatto iniziale TC = -1
                const cleanReboundsPre = Validator ? Validator.sanitizeReactiveRebounds(athlete.reactiveReboundsPre || []) : { validRebounds: [] };
                const cleanReboundsPost = Validator ? Validator.sanitizeReactiveRebounds(athlete.reactiveReboundsPost || []) : { validRebounds: [] };

                // 3. Statistica inferenziale rimbalzi reattivi (p-value, Hedges g, Delta RSI)
                const preRsiVals = cleanReboundsPre.validRebounds.map(r => r.rsi);
                const postRsiVals = cleanReboundsPost.validRebounds.map(r => r.rsi);
                const rsiTTest = Stats ? Stats.calculateTwoSampleTTest(preRsiVals, postRsiVals) : { deltaPercent: 0, pValue: 1, isSignificant: false };
                const rsiHedges = Stats ? Stats.calculateHedgesG(preRsiVals, postRsiVals) : { g: 0 };

                const preTcVals = cleanReboundsPre.validRebounds.map(r => r.tc);
                const postTcVals = cleanReboundsPost.validRebounds.map(r => r.tc);
                const preHVals = cleanReboundsPre.validRebounds.map(r => r.height);
                const postHVals = cleanReboundsPost.validRebounds.map(r => r.height);

                const avgPreRsi = Stats ? Stats.calculateCV(preRsiVals).mean : 0;
                const avgPostRsi = Stats ? Stats.calculateCV(postRsiVals).mean : 0;
                const avgPreTc = Stats ? Stats.calculateCV(preTcVals).mean : 0;
                const avgPostTc = Stats ? Stats.calculateCV(postTcVals).mean : 0;
                const avgPreH = Stats ? Stats.calculateCV(preHVals).mean : 0;
                const avgPostH = Stats ? Stats.calculateCV(postHVals).mean : 0;

                // 4. Scomposizione determinanti RSI
                const rsiDecomposition = Stats ? Stats.decomposeRSI(avgPreRsi, avgPostRsi, avgPreTc, avgPostTc, avgPreH, avgPostH) : {};

                // 5. Dinamica intra-serie e pendenza
                const dynamicsPre = Stats ? Stats.analyzeIntraSetDynamics(cleanReboundsPre.validRebounds) : {};
                const dynamicsPost = Stats ? Stats.analyzeIntraSetDynamics(cleanReboundsPost.validRebounds) : {};

                // 6. Profilo neuromuscolare basale (EUR e braccia)
                const neuromuscular = Stats ? Stats.computeNeuromuscularProfile(sjPre, cmjPre, abkPre) : {};

                // 7. Calcolo Potenza specifica e Matrice Efficienza Potenza vs RSI
                const powerWkg = Stats ? Stats.computeRelativePowerWkg(sjPre, athlete.mass, athlete.singleJumps?.powerSjWkg) : 0;
                const peakPreRsi = preRsiVals.length > 0 ? Math.max(...preRsiVals) : avgPreRsi;
                const powerRsiMatrix = Stats ? Stats.evaluatePowerVsRsiMatrix(powerWkg, avgPreRsi, peakPreRsi, athlete.mass) : {};

                // 8. Diagnosi prescrittiva del Coach Engine
                const diagnosis = Coach ? Coach.diagnosePAPStatus(
                    athlete,
                    { SJ: sjMdc, CMJ: cmjMdc, ABK: abkMdc },
                    { p: rsiTTest.pValue, deltaPercent: rsiTTest.deltaPercent, decomposition: rsiDecomposition }
                ) : { category: 'DA DETERMINARE', badgeColor: 'neutral' };

                // 9. Raccomandazioni e dosaggio
                const volumetricDosage = Coach ? Coach.suggestVolumetricDosage(athlete, athlete.protocol, diagnosis) : {};
                const recoveryWindow = Coach ? Coach.recommendRecoveryWindow(athlete, dynamicsPre, athlete.recoveryTimeMin) : {};
                const technicalDirectives = Coach ? Coach.generateTechnicalCorrectives(dynamicsPre, neuromuscular, rsiDecomposition) : [];

                results.push({
                    athlete,
                    sjMdc,
                    cmjMdc,
                    abkMdc,
                    rsiStats: {
                        preMean: avgPreRsi,
                        postMean: avgPostRsi,
                        deltaPercent: rsiTTest.deltaPercent,
                        pValue: rsiTTest.pValue,
                        hedgesG: rsiHedges.g,
                        isSignificant: rsiTTest.isSignificant
                    },
                    rsiDecomposition,
                    dynamicsPre,
                    dynamicsPost,
                    neuromuscular,
                    powerWkg,
                    powerRsiMatrix,
                    diagnosis,
                    volumetricDosage,
                    recoveryWindow,
                    technicalDirectives,
                    cleanReboundsPre,
                    cleanReboundsPost
                });
            });

            this.processedResults = results;
        }

        /**
         * Renderizza l'intera vista PAP e inizializza i listener e i grafici attivi.
         */
        render() {
            this.container = document.getElementById(this.containerId);
            if (!this.container) return;

            this.destroyCharts();
            this.processDataset(this.athletesData.length > 0 ? this.athletesData : null);

            if (!this.processedResults || this.processedResults.length === 0) {
                this.container.innerHTML = `
                    <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; padding: 3rem 1.5rem; text-align: center;">
                        <h3 style="color: #ffffff; margin-bottom: 0.5rem; font-size: 1.15rem;">Nessun dato di test caricato</h3>
                        <p style="color: ${COLOR_NEUTRAL}; font-size: 0.9rem; margin-bottom: 0;">
                            Carica un file di test per visualizzare l'analisi. Formati supportati: Optojump CSV, file multi-sezione Microgate.
                        </p>
                    </div>
                `;
                return;
            }

            const tabs = root.PAPDashboardTabs;

            const html = `
                <div class="pap-analytics-suite" style="display: flex; flex-direction: column; gap: 1.5rem; font-family: Inter, -apple-system, sans-serif;">
                    <!-- HEADER & ACTIONS BAR -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid ${COLOR_BORDER}; padding-bottom: 1.25rem;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="background: rgba(0, 240, 255, 0.15); color: ${COLOR_PRIMARY}; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.05em; border: 1px solid rgba(0, 240, 255, 0.3);">
                                    ANTI-GRAVITY SPORT SCIENCE
                                </span>
                                <span style="background: rgba(16, 185, 129, 0.12); color: ${COLOR_SUCCESS}; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 0.75rem; border: 1px solid rgba(16, 185, 129, 0.25);">
                                    Analisi Dinamica PAP
                                </span>
                            </div>
                            <h2 style="font-size: 1.75rem; font-weight: 800; margin: 0.5rem 0 0.25rem 0; color: white;">
                                Post-Activation Potentiation & Profilo Neuromuscolare
                            </h2>
                            <p style="color: ${COLOR_NEUTRAL}; margin: 0; font-size: 0.88rem; max-width: 800px;">
                                Elaborazione integrata: validazione cinematica balistica, soglie MDC al 95%, test inferenziali (p-value, Hedges' g) e prescrizioni per lo staff tecnico.
                            </p>
                        </div>
                        <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
                            <button id="pap-btn-export-excel" class="pap-action-btn" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); padding: 0.5rem 0.95rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                                Esporta Excel (.xlsx)
                            </button>
                            <button id="pap-btn-export-html" class="pap-action-btn" style="background: rgba(0, 240, 255, 0.15); color: #00f0ff; border: 1px solid rgba(0, 240, 255, 0.35); padding: 0.5rem 0.95rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                                Scarica Report HTML
                            </button>
                            <button id="pap-btn-view-report" class="pap-action-btn" style="background: linear-gradient(135deg, ${COLOR_PRIMARY}, ${COLOR_ACCENT}); color: #0b1120; border: none; padding: 0.5rem 1.05rem; border-radius: 8px; font-size: 0.82rem; font-weight: 800; cursor: pointer; box-shadow: 0 0 12px rgba(0,240,255,0.35); transition: all 0.2s;">
                                Visualizza Report Completo
                            </button>
                            <button id="pap-btn-audit-notes" class="pap-action-btn" style="background: rgba(255,255,255,0.06); color: white; border: 1px solid rgba(255,255,255,0.18); padding: 0.5rem 0.85rem; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                Note Metrologiche Audit
                            </button>
                        </div>
                    </div>

                    <!-- EXECUTIVE SUMMARY / KPI CARDS -->
                    ${tabs ? tabs.renderExecutiveSummaryHtml(this) : this._renderExecutiveSummaryHtml()}

                    <!-- NAVIGATION TAB BAR -->
                    <div class="pap-tabs-bar" style="display: flex; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">
                        <button class="pap-tab-item ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
                            1. Panoramica & Dashboard Sintetica
                        </button>
                        <button class="pap-tab-item ${this.activeTab === 'mdc' ? 'active' : ''}" data-tab="mdc">
                            2. Misure PRE-POST & Soglie MDC
                        </button>
                        <button class="pap-tab-item ${this.activeTab === 'stiffness' ? 'active' : ''}" data-tab="stiffness">
                            3. Stiffness & Dinamica di Salto
                        </button>
                        <button class="pap-tab-item ${this.activeTab === 'neuromuscular' ? 'active' : ''}" data-tab="neuromuscular">
                            4. Profilo Neuromuscolare (EUR, W/kg, Massa)
                        </button>
                        <button class="pap-tab-item ${this.activeTab === 'athlete' ? 'active' : ''}" data-tab="athlete">
                            5. Scheda Clinico-Tecnica Individuale
                        </button>
                    </div>

                    <!-- ACTIVE TAB CONTENT CONTAINER -->
                    <div id="pap-tab-content-area" style="min-height: 400px;">
                        ${tabs ? tabs.renderCurrentTabHtml(this) : this._renderCurrentTabHtml()}
                    </div>

                    <!-- MODALE NOTE METROLOGICHE AUDIT -->
                    <div id="pap-audit-modal-backdrop" style="position: fixed; inset: 0; background: rgba(8, 12, 22, 0.85); backdrop-filter: blur(8px); z-index: 9999; display: ${this.isAuditNotesOpen ? 'flex' : 'none'}; align-items: center; justify-content: center; padding: 1.5rem;">
                        <div style="background: #0f172a; border: 1px solid rgba(0, 240, 255, 0.35); border-radius: 14px; max-width: 780px; width: 100%; max-height: 88vh; overflow-y: auto; padding: 1.75rem; box-shadow: 0 10px 40px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem;">
                                <div>
                                    <h3 style="margin: 0; color: ${COLOR_PRIMARY}; font-size: 1.25rem;">
                                        Note Metrologiche e Rigore Scientifico (Audit di Campo)
                                    </h3>
                                    <span style="font-size: 0.8rem; color: ${COLOR_NEUTRAL};">
                                        Benchmark Sessione 28 Luglio 2026 – Confronto Dati Grezzi vs Report
                                    </span>
                                </div>
                                <button id="pap-modal-close-btn" style="background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.35rem 0.7rem; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
                                    Chiudi
                                </button>
                            </div>
                            <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; display: flex; flex-direction: column; gap: 0.85rem;">
                                <div style="background: rgba(0,240,255,0.05); border-left: 3px solid ${COLOR_PRIMARY}; padding: 0.75rem 1rem; border-radius: 4px;">
                                    <strong style="color: white; display: block; margin-bottom: 0.25rem;">1. Soglie di Rumore Strumentale (MDC 95%)</strong>
                                    L'errore tipico di misura reale (TEM) calcolato sui doppi tentativi stabilisce che la soglia minima per considerare reale una variazione e:
                                    <strong>SJ: ±5.4%</strong> (Markovic 2004), <strong>CMJ: ±6.8%</strong> (Heishman 2020), <strong>ABK: ±8.0%</strong>. Le assunzioni di variazioni al ±2-3% scambiavano rumore casuale per adattamento neuromuscolare.
                                </div>
                                <div style="background: rgba(16,185,129,0.05); border-left: 3px solid ${COLOR_SUCCESS}; padding: 0.75rem 1rem; border-radius: 4px;">
                                    <strong style="color: white; display: block; margin-bottom: 0.25rem;">2. Standardizzazione Rimbalzi & Rimozione Artefatto TC = -1</strong>
                                    Il primo stacco nei rimbalzi continui (registrato a TC = -1) e escluso da ogni calcolo. L'analisi PRE-POST e standardizzata sulla finestra comparativa a 8 stacchi validi.
                                </div>
                                <div style="background: rgba(99,102,241,0.05); border-left: 3px solid ${COLOR_ACCENT}; padding: 0.75rem 1rem; border-radius: 4px;">
                                    <strong style="color: white; display: block; margin-bottom: 0.25rem;">3. Indipendenza tra Forza Concentrica e Reattivita Tendinea</strong>
                                    La risposta concentrica (SJ) e quella reattiva (RSI) rispondono in modo biomeccanicamente indipendente. Vietato mediarle in un indice generico unico.
                                </div>
                                <div style="background: rgba(245,158,11,0.05); border-left: 3px solid ${COLOR_WARNING}; padding: 0.75rem 1rem; border-radius: 4px;">
                                    <strong style="color: white; display: block; margin-bottom: 0.25rem;">4. Massa Corporea come Freno Inerziale</strong>
                                    La stiffness nei rimbalzi fast-SSC correla negativamente con il peso corporeo ($r \\approx -0.77$). Gli atleti pesanti pagano il costo della fisica delle leve articolari caricate.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- MODALE MASTER REPORT SCIENTIFICO COMPLETO -->
                    <div id="pap-report-modal-backdrop" style="position: fixed; inset: 0; background: rgba(8, 12, 22, 0.9); backdrop-filter: blur(10px); z-index: 10000; display: ${this.isReportModalOpen ? 'flex' : 'none'}; align-items: center; justify-content: center; padding: 1rem;">
                        <div style="background: #0f172a; border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 16px; width: 96%; max-width: 1280px; height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.8);">
                            <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 0.85rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <span style="font-family: Outfit, sans-serif; font-weight: 700; color: #00f0ff; font-size: 1.05rem;">
                                        Master Report Scientifico PAP — 28 Luglio 2026
                                    </span>
                                    <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
                                        Audit + Coaching Integrato
                                    </span>
                                </div>
                                <div style="display: flex; gap: 0.6rem; align-items: center;">
                                    <button id="pap-btn-download-html-from-modal" style="background: rgba(0, 240, 255, 0.15); color: #00f0ff; border: 1px solid rgba(0, 240, 255, 0.35); border-radius: 6px; padding: 0.4rem 0.85rem; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
                                        Scarica HTML
                                    </button>
                                    <a href="./Cartella Temporanea/REPORT_DEFINITIVO_PAP_28_07_2026.html" target="_blank" style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 6px; padding: 0.4rem 0.85rem; font-size: 0.8rem; font-weight: 700; text-decoration: none;">
                                        Apri in Nuova Scheda
                                    </a>
                                    <button id="pap-report-modal-close-btn" style="background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 0.4rem 0.85rem; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
                                        Chiudi
                                    </button>
                                </div>
                            </div>
                            <div style="flex: 1; width: 100%; background: #080c16;">
                                <iframe id="pap-report-iframe" src="./Cartella Temporanea/REPORT_DEFINITIVO_PAP_28_07_2026.html" style="width: 100%; height: 100%; border: none;"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.container.innerHTML = html;
            this._bindTabEvents();
            this._renderTabCharts();
        }

        /**
         * Collega gli event listener per i tab, i filtri, i selettori e i pulsanti interattivi tramite delegazione.
         * @private
         */
        _bindTabEvents() {
            if (!this.container || this._eventsBound) return;
            this._eventsBound = true;

            // Delegazione eventi click
            this.container.addEventListener('click', (e) => {
                // 1. Cambio Tab
                const tabBtn = e.target.closest('.pap-tab-item');
                if (tabBtn) {
                    const targetTab = tabBtn.dataset.tab;
                    if (targetTab && targetTab !== this.activeTab) {
                        this.activeTab = targetTab;
                        this.render();
                    }
                    return;
                }

                // 2. Click su pulsanti "Dettagli" nella sinottica
                const viewBtn = e.target.closest('.pap-btn-view-athlete');
                if (viewBtn) {
                    const athleteId = parseInt(viewBtn.dataset.athleteId, 10);
                    if (athleteId) {
                        this.selectedAthleteId = athleteId;
                        this.activeTab = 'athlete';
                        this.render();
                    }
                    return;
                }

                // 3. Apertura modale Note Metrologiche Audit
                const auditNotesBtn = e.target.closest('#pap-btn-audit-notes, #pap-btn-load-audit-notes');
                if (auditNotesBtn) {
                    this.toggleAuditNotesModal();
                    return;
                }

                // 4. Chiusura modale Note Metrologiche
                const closeBtn = e.target.closest('#pap-modal-close-btn');
                if (closeBtn || e.target.id === 'pap-audit-modal-backdrop') {
                    this.toggleAuditNotesModal();
                    return;
                }

                // 5. Apertura modale Master Report Completo
                const viewReportBtn = e.target.closest('#pap-btn-view-report');
                if (viewReportBtn) {
                    this.openFullHtmlReportModal();
                    return;
                }

                // 6. Chiusura modale Master Report Completo
                const closeReportBtn = e.target.closest('#pap-report-modal-close-btn');
                if (closeReportBtn || e.target.id === 'pap-report-modal-backdrop') {
                    this.closeFullHtmlReportModal();
                    return;
                }

                // 7. Download HTML da dentro la modale
                const downloadFromModal = e.target.closest('#pap-btn-download-html-from-modal');
                if (downloadFromModal) {
                    this.exportHtmlReport();
                    return;
                }

                // 8. Esportazione Excel (.xlsx)
                const exportExcelBtn = e.target.closest('#pap-btn-export-excel, #pap-btn-export-technical');
                if (exportExcelBtn) {
                    this.exportExcelWorkbook();
                    return;
                }

                // 9. Esportazione Report HTML
                const exportHtmlBtn = e.target.closest('#pap-btn-export-html');
                if (exportHtmlBtn) {
                    this.exportHtmlReport();
                    return;
                }

                // 10. Esportazione Sintesi Coach (.txt)
                const exportCoachBtn = e.target.closest('#pap-btn-export-coach');
                if (exportCoachBtn) {
                    this.exportCoachSummary();
                    return;
                }
            });

            // Delegazione eventi change (select e filtri)
            this.container.addEventListener('change', (e) => {
                // 1. Filtro Esito nella tabella sinottica (Tab 1)
                if (e.target.id === 'pap-filter-outcome') {
                    this.filterOutcome = e.target.value;
                    const contentArea = document.getElementById('pap-tab-content-area');
                    if (contentArea && this.activeTab === 'overview') {
                        contentArea.innerHTML = this._renderOverviewTabHtml();
                    }
                    return;
                }

                // 2. Selettore atleta nella scheda individuale (Tab 5)
                if (e.target.id === 'pap-select-athlete-individual') {
                    this.selectedAthleteId = parseInt(e.target.value, 10);
                    const contentArea = document.getElementById('pap-tab-content-area');
                    if (contentArea && this.activeTab === 'athlete') {
                        contentArea.innerHTML = this._renderAthleteDetailTabHtml();
                    }
                    return;
                }

                // 3. Selettore atleta o benchmark trend saltelli (Tab 3)
                if (e.target.id === 'pap-select-athlete-trend') {
                    this.selectedTrendAthleteId = e.target.value === 'BENCHMARK_COMPARE' ? 'BENCHMARK_COMPARE' : parseInt(e.target.value, 10);
                    this._renderIntraSetTrendChart();
                    return;
                }
            });
        }

        /**
         * Renderizza i grafici Chart.js delegando al modulo dedicato.
         * @private
         */
        _renderTabCharts() {
            if (root.PAPDashboardCharts && typeof root.PAPDashboardCharts.renderTabCharts === 'function') {
                root.PAPDashboardCharts.renderTabCharts(this);
            }
        }

        /**
         * Aggiorna il grafico del trend intra-serie nel Tab 3 delegando a PAPDashboardCharts.
         * @private
         */
        _renderIntraSetTrendChart() {
            if (root.PAPDashboardCharts && typeof root.PAPDashboardCharts.renderIntraSetTrendChart === 'function') {
                root.PAPDashboardCharts.renderIntraSetTrendChart(this);
            }
        }

        // --- Helper di Fallback e Compatibilita per Chiamate Dirette ---

        _renderExecutiveSummaryHtml() {
            return root.PAPDashboardTabs ? root.PAPDashboardTabs.renderExecutiveSummaryHtml(this) : '';
        }

        _renderCurrentTabHtml() {
            return root.PAPDashboardTabs ? root.PAPDashboardTabs.renderCurrentTabHtml(this) : '';
        }

        _renderOverviewTabHtml() {
            return root.PAPDashboardTabs ? root.PAPDashboardTabs.renderOverviewTabHtml(this) : '';
        }

        _renderSynopticRowHtml(r) {
            return root.PAPDashboardTabs ? root.PAPDashboardTabs.renderSynopticRowHtml(r) : '';
        }

        _renderMdcTabHtml() {
            return root.PAPDashboardTabs ? root.PAPDashboardTabs.renderMdcTabHtml(this) : '';
        }

        _renderStiffnessTabHtml() {
            return root.PAPDashboardTabs ? root.PAPDashboardTabs.renderStiffnessTabHtml(this) : '';
        }

        _renderNeuromuscularTabHtml() {
            return root.PAPDashboardTabs ? root.PAPDashboardTabs.renderNeuromuscularTabHtml(this) : '';
        }

        _renderAthleteDetailTabHtml() {
            return root.PAPDashboardTabs ? root.PAPDashboardTabs.renderAthleteDetailTabHtml(this) : '';
        }

        exportTechnicalReport() {
            if (root.PAPDashboardExport) root.PAPDashboardExport.exportTechnicalReport(this);
        }

        exportCoachSummary() {
            if (root.PAPDashboardExport) root.PAPDashboardExport.exportCoachSummary(this);
        }

        exportExcelWorkbook() {
            if (root.PAPDashboardExport) return root.PAPDashboardExport.exportExcelWorkbook(this);
        }

        exportHtmlReport() {
            if (root.PAPDashboardExport) root.PAPDashboardExport.exportHtmlReport();
        }
    }

    // Esposizione globale
    root.PAPDashboardView = PAPDashboardView;
})();
