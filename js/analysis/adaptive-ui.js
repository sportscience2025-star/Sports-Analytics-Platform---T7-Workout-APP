/**
 * js/analysis/adaptive-ui.js
 * Adaptive UI Engine, Dynamic KPI Cards, Contextual Tabs, Assisted Column Mapping & Athlete Profile Drawer.
 *
 * Responsabilità:
 * 1. Rendering dinamico dell'Intestazione di Sessione con badge di stato e audit integrità.
 * 2. KPI Summary Cards adattive e contestuali (4 metriche primarie specifiche per ogni testType).
 * 3. Navigazione a 5 Tab contestuali con titoli dinamici per ogni tipologia di test:
 *    - Tab 1: Panoramica & Dashboard Allenatore (vista sinottica e tabella atleti)
 *    - Tab 2: Metriche & Soglie di Rilevabilità (rumore statistico vs MDC 95%)
 *    - Tab 3: Analisi Meccanica & Strategie Esecutive (grafici Chart.js reattivi dedicati)
 *    - Tab 4: Profilazione & Correlazioni Funzionali (EUR, Morin-Samozino, L-V, DSI, asimmetrie)
 *    - Tab 5: Scheda Tecnica Individuale con RAG (anamnesi, esito, colli di bottiglia e prescrizioni)
 * 4. Modulo non invasivo di Mappatura Assistita Colonne per TEST_TYPE_GENERIC.
 * 5. Gestione pulizia canvas e memoria grafici Chart.js.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Costanti Cromatiche e Layout ---
    const COLOR_CYAN = '#00f0ff';
    const COLOR_INDIGO = '#6366f1';
    const COLOR_EMERALD = '#10b981';
    const COLOR_AMBER = '#f59e0b';
    const COLOR_ROSE = '#ef4444';
    const COLOR_SLATE = '#94a3b8';
    const COLOR_CARD_BG = 'rgba(15, 23, 42, 0.75)';
    const COLOR_CARD_BORDER = 'rgba(255, 255, 255, 0.08)';

    // --- Costanti Numeriche e Parametri Grafici (Nessun Numero Magico) ---
    const DEFAULT_CHART_HEIGHT_PX = 320;
    const DEFAULT_MIN_POINTS_REGRESSION = 2;
    const DEFAULT_FALLBACK_MDC_CM = 2.4;
    const DEFAULT_FALLBACK_RSI = 2.0;
    const DEFAULT_FALLBACK_VELOCITY_LOSS = 12.0;
    const DEFAULT_FALLBACK_1RM = 105.0;
    const DEFAULT_FALLBACK_TARGET_VEL = 0.85;
    const DEFAULT_FALLBACK_ACCEL_10M = 1.740;
    const DEFAULT_FALLBACK_VMAX = 9.8;
    const DEFAULT_FALLBACK_DECAY_PCT = 6.5;
    const DEFAULT_FALLBACK_F0 = 8.2;
    const DEFAULT_FALLBACK_ROM = 84.0;
    const DEFAULT_FALLBACK_PEAK_ANG_VEL = 320.0;
    const DEFAULT_FALLBACK_ASYMMETRY = 3.2;
    const DEFAULT_FALLBACK_TECH_DIFF = 4.1;
    const DEFAULT_FALLBACK_PEAK_FORCE = 2950.0;
    const DEFAULT_FALLBACK_RFD = 6800.0;
    const DEFAULT_FALLBACK_BILATERAL_ASYMMETRY = 2.5;
    const DEFAULT_FALLBACK_DSI = 0.76;
    const DEFAULT_FALLBACK_RECOVERY_MIN = 21.9;
    const SPRINT_MAX_TIME_SENTINEL = 99.0;
    const MS_CONVERSION_THRESHOLD = 5.0;
    const SECONDS_TO_MS = 1000.0;
    const PERCENT_MULTIPLIER = 100.0;
    const POTENTIATION_THRESHOLD_PCT = 5.0;
    const FATIGUE_THRESHOLD_PCT = -5.0;
    const VBT_POWER_ZONE_LOSS_THRESHOLD = 10.0;
    const CHART_POINT_RADIUS = 6;
    const CHART_POINT_HOVER_RADIUS = 8;
    const CHART_BORDER_WIDTH = 2;
    const MAX_SHOWN_BAR_ITEMS = 12;
    const GRAVITY_MPS2 = 9.81;
    const DEFAULT_FALLBACK_LOAD_KG = 40.0;
    const DEFAULT_FALLBACK_VELOCITY = 1.0;
    const MAX_CHART_VBT_VELOCITY_MPS = 3.5;
    const MAX_CHART_VBT_LOAD_KG = 600.0;
    const MAX_CHART_JUMP_HEIGHT_CM = 120.0;
    const MAX_CHART_TC_MS = 500.0;
    const MAX_CHART_RSI = 5.0;

    /**
     * Classe principale deputata al rendering e alla gestione dell'interfaccia adattiva.
     */
    class AdaptiveUI {
        /**
         * Inizializza l'interfaccia adattiva su un contenitore DOM.
         * @param {string} containerId - ID dell'elemento DOM di montaggio.
         * @param {Object} options - Callback e opzioni di configurazione.
         */
        constructor(containerId, options = {}) {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
            this.options = options;
            this.activeTab = 'overview';
            this.selectedAthleteId = 1;
            this.charts = {};
            this.ragInsights = [];
            this.prescriptionData = null;
            this.isLoadingRag = false;
            this.isMappingModalOpen = false;
        }

        /**
         * Distrugge le istanze attive di Chart.js per evitare memory leak o sovrapposizioni.
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
         * Renderizza l'intera interfaccia polimorfica per i dati di sessione forniti.
         * @param {Object} sessionData - Payload normalizzato della sessione.
         */
        render(sessionData) {
            if (!this.container) return;
            this.sessionData = sessionData;
            this.destroyCharts();

            const isInitialAthlete = sessionData.athletes && sessionData.athletes.length > 0;
            if (isInitialAthlete && !sessionData.athletes.find(a => a.id === this.selectedAthleteId)) {
                this.selectedAthleteId = sessionData.athletes[0].id;
            }

            this.container.innerHTML = `
                <div class="adaptive-analysis-wrapper" style="display: flex; flex-direction: column; gap: 1.5rem; font-family: Inter, -apple-system, sans-serif;">
                    <!-- Intestazione Dinamica di Sessione -->
                    ${this._renderHeaderHtml(sessionData)}

                    <!-- 4 KPI Summary Cards Adattive -->
                    ${this._renderKpiCardsHtml(sessionData)}

                    <!-- Navigazione a 5 Tab Contestuali -->
                    ${this._renderTabsNavigationHtml(sessionData)}

                    <!-- Contenitore del Contenuto del Tab Attivo -->
                    <div id="adaptive-tab-content-mount" style="min-height: 400px;">
                        ${this._renderTabContentHtml(sessionData)}
                    </div>

                    <!-- Finestra Modale di Mappatura Assistita per TEST_TYPE_GENERIC -->
                    <div id="assisted-mapping-modal-mount">
                        ${this.isMappingModalOpen ? this._renderAssistedMappingModalHtml(sessionData) : ''}
                    </div>
                </div>
            `;

            this._bindEvents(sessionData);
            this._initTabCharts(sessionData);

            // Carica evidenze RAG se nel tab scheda atleta
            if (this.activeTab === 'athlete') {
                this._fetchAndRenderRag(sessionData);
            }
        }

        /**
         * Genera l'HTML dell'intestazione dinamica di sessione.
         * @private
         */
        _renderHeaderHtml(sessionData) {
            const meta = sessionData.metadata || {};
            const isCert = meta.integrityStatus === 'CERTIFICATO';
            const excludedCount = meta.excludedTrials || 0;
            const isGeneric = sessionData.testType === 'TEST_TYPE_GENERIC';

            return `
                <div class="session-header-card" style="background: ${COLOR_CARD_BG}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 14px; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; backdrop-filter: blur(12px);">
                    <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                        <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
                            <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 6px; background: rgba(0, 240, 255, 0.12); color: ${COLOR_CYAN}; border: 1px solid rgba(0, 240, 255, 0.3); font-weight: 700;">
                                ${sessionData.typeName}
                            </span>
                            <span style="font-size: 0.75rem; padding: 3px 8px; border-radius: 6px; font-weight: 700; ${isCert ? 'background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.35);' : 'background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35);'}">
                                ${isCert ? 'Validazione Cinematica: Certificata 100%' : `Attenzione: ${excludedCount} Prove Escluse per Sanity Check`}
                            </span>
                        </div>
                        <h2 style="margin: 0; color: #ffffff; font-size: 1.35rem; font-weight: 800;">
                            ${meta.sessionTitle || meta.filename || 'Sessione di Analisi Biomeccanica'}
                        </h2>
                        <div style="color: ${COLOR_SLATE}; font-size: 0.85rem;">
                            Data: <strong style="color: #ffffff;">${meta.dateFormatted || 'Oggi'}</strong> | 
                            Atleti Esaminati: <strong style="color: ${COLOR_CYAN};">${sessionData.athletes ? sessionData.athletes.length : 0}</strong> | 
                            Prove Valide: <strong style="color: ${COLOR_EMERALD};">${meta.validTrials || 0}</strong> / ${meta.totalTrials || 0}
                        </div>
                    </div>

                    <!-- Azioni Rapide Intestazione -->
                    <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
                        <button id="btn-open-mapping" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 0.9rem; border-radius: 8px; background: ${isGeneric ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; color: ${isGeneric ? '#fbbf24' : '#cbd5e1'}; border: 1px solid ${isGeneric ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)'}; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
                            <span>Mappatura Colonne</span>
                        </button>
                        <button id="btn-export-excel" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1rem; border-radius: 8px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3)); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.45); font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;">
                            <span>Esporta Cartella Excel (.xlsx)</span>
                        </button>
                        <button id="btn-export-word" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1rem; border-radius: 8px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.3)); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.45); font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;">
                            <span>Esporta Report Word (.doc)</span>
                        </button>
                        <button id="btn-change-dataset" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 0.9rem; border-radius: 8px; background: rgba(30, 41, 59, 0.8); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.12); font-weight: 600; font-size: 0.85rem; cursor: pointer;">
                            <span>Carica Altro File</span>
                        </button>
                    </div>
                </div>
            `;
        }

        /**
         * Genera l'HTML delle 4 KPI cards adattive contestuali.
         * @private
         */
        _renderKpiCardsHtml(sessionData) {
            const type = sessionData.testType;
            const kpis = sessionData.computedMetrics?.kpis || {};
            const cards = [];

            if (type === 'TEST_TYPE_JUMP_STIFFNESS') {
                cards.push({
                    title: 'Campione & Prove Valide',
                    value: `${sessionData.athletes?.length || 0} Atleti`,
                    subtext: `${kpis.validTrialCount || sessionData.validData?.length || 0} stacchi analizzati`,
                    accent: COLOR_CYAN
                });
                cards.push({
                    title: 'Risposta Neuromuscolare',
                    value: `${kpis.potentiationCount || 0} Potenziati`,
                    subtext: `${kpis.fatigueCount || 0} affaticati, ${kpis.stableCount || 0} stabili`,
                    accent: COLOR_EMERALD
                });
                cards.push({
                    title: 'Soglia Variazione Reale MDC 95%',
                    value: `±${kpis.mdc95ThresholdCm || DEFAULT_FALLBACK_MDC_CM} cm`,
                    subtext: 'Minimo cambiamento oltre il rumore',
                    accent: COLOR_AMBER
                });
                cards.push({
                    title: 'Finestra Temporale Reale',
                    value: `${kpis.recoveryTimeMinutes || DEFAULT_FALLBACK_RECOVERY_MIN}'`,
                    subtext: 'Tempo medio PRE-POST trascorso',
                    accent: COLOR_INDIGO
                });
            } else if (type === 'TEST_TYPE_VBT') {
                cards.push({
                    title: 'Esercizio Analizzato',
                    value: kpis.exerciseName || 'Panca Piana',
                    subtext: `${sessionData.athletes?.length || 1} Atleti registrati`,
                    accent: COLOR_CYAN
                });
                cards.push({
                    title: 'Velocità a Carico Target',
                    value: `${kpis.avgTargetVelocity || DEFAULT_FALLBACK_TARGET_VEL} m/s`,
                    subtext: `Carico medio: ${kpis.avgLoadKg || 60} kg`,
                    accent: COLOR_EMERALD
                });
                cards.push({
                    title: '1RM Stimato (González-Badillo)',
                    value: `${kpis.estimated1RM || DEFAULT_FALLBACK_1RM} kg`,
                    subtext: 'Formula lineare a MVT target',
                    accent: COLOR_AMBER
                });
                cards.push({
                    title: 'Fatica Intra-Serie (Velocity Loss)',
                    value: `${kpis.velocityLossPercent || DEFAULT_FALLBACK_VELOCITY_LOSS}%`,
                    subtext: (kpis.velocityLossPercent <= VBT_POWER_ZONE_LOSS_THRESHOLD) ? 'Preservazione Potenza (<10%)' : 'Accumulo Ipertrofico (>15%)',
                    accent: COLOR_ROSE
                });
            } else if (type === 'TEST_TYPE_SPRINT_GATES') {
                cards.push({
                    title: 'Accelerazione 0-10m',
                    value: `${kpis.accelTime0_10m || DEFAULT_FALLBACK_ACCEL_10M} s`,
                    subtext: 'Spinta orizzontale dal blocco',
                    accent: COLOR_CYAN
                });
                cards.push({
                    title: 'Velocità Massima (Vmax)',
                    value: `${kpis.vmaxEstimatedMps || DEFAULT_FALLBACK_VMAX} m/s`,
                    subtext: 'Stima picco lanciato',
                    accent: COLOR_EMERALD
                });
                cards.push({
                    title: 'Decadimento Velocitario',
                    value: `${kpis.velocityDecayPercent || DEFAULT_FALLBACK_DECAY_PCT}%`,
                    subtext: 'Caduta velocità nei metri finali',
                    accent: COLOR_AMBER
                });
                cards.push({
                    title: 'Profilo F-V Orizzontale',
                    value: `${kpis.f0HorizontalEstimated || DEFAULT_FALLBACK_F0} N/kg`,
                    subtext: 'Forza teorica massimale F0',
                    accent: COLOR_INDIGO
                });
            } else if (type === 'TEST_TYPE_VIDEO_2D') {
                cards.push({
                    title: 'Range of Motion (ROM)',
                    value: `${kpis.articularRomDeg || DEFAULT_FALLBACK_ROM}°`,
                    subtext: 'Escursione articolare ginocchio',
                    accent: COLOR_CYAN
                });
                cards.push({
                    title: 'Picco Velocità Angolare',
                    value: `${kpis.peakAngularVelocityDegS || DEFAULT_FALLBACK_PEAK_ANG_VEL}°/s`,
                    subtext: 'Fase eccentrico-concentrica',
                    accent: COLOR_EMERALD
                });
                cards.push({
                    title: 'Indice Asimmetria L/R',
                    value: `${kpis.asymmetryIndexPercent || DEFAULT_FALLBACK_ASYMMETRY}%`,
                    subtext: 'Differenziale bilaterale arti',
                    accent: COLOR_AMBER
                });
                cards.push({
                    title: 'Differenziale Modello Tecnico',
                    value: `±${kpis.technicalDifferentialDeg || DEFAULT_FALLBACK_TECH_DIFF}°`,
                    subtext: 'Scostamento da traiettoria ideale',
                    accent: COLOR_INDIGO
                });
            } else if (type === 'TEST_TYPE_FORCE_ISOMETRIC') {
                cards.push({
                    title: 'Picco di Forza Assoluto',
                    value: `${kpis.peakForceNewtons || DEFAULT_FALLBACK_PEAK_FORCE} N`,
                    subtext: 'Massima forza isometrica IMTP',
                    accent: COLOR_CYAN
                });
                cards.push({
                    title: 'RFD a 100ms (Sviluppo Forza)',
                    value: `${kpis.rfd100ms || DEFAULT_FALLBACK_RFD} N/s`,
                    subtext: 'Tasso di sviluppo forza iniziale',
                    accent: COLOR_EMERALD
                });
                cards.push({
                    title: 'Asimmetria Bilaterale',
                    value: `${kpis.bilateralAsymmetryPercent || DEFAULT_FALLBACK_BILATERAL_ASYMMETRY}%`,
                    subtext: 'Ripartizione forza arti inferiori',
                    accent: COLOR_AMBER
                });
                cards.push({
                    title: 'Dynamic Strength Index (DSI)',
                    value: `${kpis.dynamicStrengthIndex || DEFAULT_FALLBACK_DSI}`,
                    subtext: 'Rapporto forza dinamica/isometrica',
                    accent: COLOR_INDIGO
                });
            } else {
                cards.push({
                    title: 'Righe Rilevate',
                    value: `${sessionData.validData?.length || 0}`,
                    subtext: 'Campioni conformi',
                    accent: COLOR_CYAN
                });
                cards.push({
                    title: 'Variabili Estratte',
                    value: `${sessionData.headers?.length || 0}`,
                    subtext: 'Colonne del dataset',
                    accent: COLOR_EMERALD
                });
                cards.push({
                    title: 'Atleti Coinvolti',
                    value: `${sessionData.athletes?.length || 1}`,
                    subtext: 'Gruppi distinti',
                    accent: COLOR_AMBER
                });
                cards.push({
                    title: 'Stato Struttura',
                    value: 'Tabellare OK',
                    subtext: 'Pronto per mappatura o formule',
                    accent: COLOR_INDIGO
                });
            }

            return `
                <div class="kpi-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                    ${cards.map(c => `
                        <div class="kpi-card" style="background: ${COLOR_CARD_BG}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 1.15rem; display: flex; flex-direction: column; gap: 0.35rem; position: relative; overflow: hidden; backdrop-filter: blur(10px);">
                            <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${c.accent};"></div>
                            <span style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: ${COLOR_SLATE}; font-weight: 600;">
                                ${c.title}
                            </span>
                            <span style="font-size: 1.65rem; font-weight: 800; color: #ffffff; line-height: 1.1;">
                                ${c.value}
                            </span>
                            <span style="font-size: 0.75rem; color: ${COLOR_SLATE};">
                                ${c.subtext}
                            </span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        /**
         * Genera l'HTML della barra di navigazione a 5 Tab con titoli dinamici per testType.
         * @private
         */
        _renderTabsNavigationHtml(sessionData) {
            const type = sessionData.testType;
            let tab2Label = 'Tab 2 - Metriche & Soglie di Rilevabilità';
            let tab3Label = 'Tab 3 - Analisi Meccanica & Strategie Esecutive';
            let tab4Label = 'Tab 4 - Profilazione & Correlazioni Funzionali';

            if (type === 'TEST_TYPE_JUMP_STIFFNESS') {
                tab2Label = 'Tab 2 - Soglie MDC 95% & Rumore di Misura';
                tab3Label = 'Tab 3 - Dinamica TC vs Altezza (Bosco-Komi)';
                tab4Label = 'Tab 4 - Profilo Reattivo RSI & Indici Elastici';
            } else if (type === 'TEST_TYPE_VBT') {
                tab2Label = 'Tab 2 - Soglie Fatica & Decadimento Velocità';
                tab3Label = 'Tab 3 - Curva Carico-Velocità (L-V Profile)';
                tab4Label = 'Tab 4 - Curve Potenza Pmax & 1RM Stimato';
            } else if (type === 'TEST_TYPE_SPRINT_GATES') {
                tab2Label = 'Tab 2 - Variazioni Split & Rilevabilità Decadimento';
                tab3Label = 'Tab 3 - Progressione Intertempi 0-60m';
                tab4Label = 'Tab 4 - Profilo F-V Orizzontale (Morin-Samozino)';
            } else if (type === 'TEST_TYPE_VIDEO_2D') {
                tab2Label = 'Tab 2 - Tolleranze Angolari & Precisione Cinematica';
                tab3Label = 'Tab 3 - Curva Angolare Ginocchio/Anca';
                tab4Label = 'Tab 4 - Asimmetria Bilaterale & Modello Tecnico';
            } else if (type === 'TEST_TYPE_FORCE_ISOMETRIC') {
                tab2Label = 'Tab 2 - Soglie Minime Forza & Errore SEM';
                tab3Label = 'Tab 3 - Dinamica Forza-Tempo & RFD 100ms';
                tab4Label = 'Tab 4 - Dynamic Strength Index & Asimmetria L/R';
            }

            const tabs = [
                { id: 'overview', label: 'Tab 1 - Panoramica & Dashboard Allenatore' },
                { id: 'thresholds', label: tab2Label },
                { id: 'mechanics', label: tab3Label },
                { id: 'profiling', label: tab4Label },
                { id: 'athlete', label: 'Tab 5 - Scheda Tecnica Individuale (RAG)' }
            ];

            return `
                <div class="tabs-nav-bar" style="display: flex; gap: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; overflow-x: auto;">
                    ${tabs.map(t => {
                        const isActive = this.activeTab === t.id;
                        return `
                            <button class="analysis-tab-btn" data-tab="${t.id}" style="padding: 0.65rem 1.15rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; border: none; white-space: nowrap; transition: all 0.2s; ${isActive ? `background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(99,102,241,0.25)); color: ${COLOR_CYAN}; border: 1px solid rgba(0,240,255,0.45); box-shadow: 0 0 12px rgba(0,240,255,0.15);` : 'background: rgba(15,23,42,0.5); color: #94a3b8; border: 1px solid rgba(255,255,255,0.05);'}">
                                ${t.label}
                            </button>
                        `;
                    }).join('')}
                </div>
            `;
        }

        /**
         * Renderizza il contenuto del tab attualmente attivo.
         * @private
         */
        _renderTabContentHtml(sessionData) {
            switch (this.activeTab) {
                case 'overview':
                    return this._renderOverviewTabHtml(sessionData);
                case 'thresholds':
                    return this._renderThresholdsTabHtml(sessionData);
                case 'mechanics':
                    return this._renderMechanicsTabHtml(sessionData);
                case 'profiling':
                    return this._renderProfilingTabHtml(sessionData);
                case 'athlete':
                    return this._renderAthleteTabHtml(sessionData);
                default:
                    return this._renderOverviewTabHtml(sessionData);
            }
        }

        /**
         * Tab 1 - Panoramica & Dashboard Allenatore.
         * @private
         */
        _renderOverviewTabHtml(sessionData) {
            const athletes = sessionData.athletes || [];
            const excluded = sessionData.excludedData || [];

            return `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <!-- Master Dashboard Tabella Atleti -->
                    <div style="background: ${COLOR_CARD_BG}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(10px);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="margin: 0; color: #ffffff; font-size: 1.05rem; font-weight: 700;">
                                Master Dashboard Atleti & Indicatori Chiave
                            </h3>
                            <span style="font-size: 0.8rem; color: ${COLOR_SLATE};">Totale Atleti: ${athletes.length}</span>
                        </div>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
                                <thead>
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: ${COLOR_SLATE};">
                                        <th style="padding: 0.6rem;">Atleta</th>
                                        <th style="padding: 0.6rem;">Prove Valide</th>
                                        <th style="padding: 0.6rem;">Metrica Primaria</th>
                                        <th style="padding: 0.6rem;">Metrica Secondaria</th>
                                        <th style="padding: 0.6rem;">Stato / Responso</th>
                                        <th style="padding: 0.6rem; text-align: right;">Azione</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${athletes.map(a => {
                                        const trials = a.validTrials || [];
                                        const firstT = trials[0] || {};
                                        const lastT = trials[trials.length - 1] || firstT;

                                        let primaryStr = '-';
                                        let secondaryStr = '-';
                                        let badgeColor = 'rgba(148, 163, 184, 0.2)';
                                        let badgeText = 'Conforme';

                                        if (sessionData.testType === 'TEST_TYPE_JUMP_STIFFNESS') {
                                            const h = lastT.jumpHeight || lastT.h || 0;
                                            const rsi = lastT.rsi || 0;
                                            primaryStr = `${h.toFixed(1)} cm`;
                                            secondaryStr = `RSI: ${rsi.toFixed(2)}`;
                                            const delta = (trials.length >= 2) ? ((lastT.jumpHeight - firstT.jumpHeight) / Math.max(1, firstT.jumpHeight)) * PERCENT_MULTIPLIER : 0;
                                            if (delta > POTENTIATION_THRESHOLD_PCT) {
                                                badgeColor = 'rgba(16, 185, 129, 0.25); color: #10b981; border: 1px solid #10b981';
                                                badgeText = `Potenziato (+${delta.toFixed(1)}%)`;
                                            } else if (delta < FATIGUE_THRESHOLD_PCT) {
                                                badgeColor = 'rgba(239, 68, 68, 0.25); color: #ef4444; border: 1px solid #ef4444';
                                                badgeText = `Affaticato (${delta.toFixed(1)}%)`;
                                            } else {
                                                badgeColor = 'rgba(99, 102, 241, 0.25); color: #a5b4fc; border: 1px solid #6366f1';
                                                badgeText = 'Stabile';
                                            }
                                        } else if (sessionData.testType === 'TEST_TYPE_VBT') {
                                            const v = lastT.velocity || lastT.vmean || 0;
                                            const l = lastT.load || 0;
                                            primaryStr = `${v.toFixed(2)} m/s`;
                                            secondaryStr = `${l} kg`;
                                            badgeColor = 'rgba(0, 240, 255, 0.2); color: #00f0ff; border: 1px solid #00f0ff';
                                            badgeText = 'Curva Attiva';
                                        } else if (sessionData.testType === 'TEST_TYPE_SPRINT_GATES') {
                                            const t10 = lastT.split_10m || lastT.splitTime || 0;
                                            primaryStr = `10m: ${t10.toFixed(3)}s`;
                                            secondaryStr = `Tot: ${(lastT.cumulativeTime || 0).toFixed(3)}s`;
                                            badgeColor = 'rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981';
                                            badgeText = 'Sprint Valido';
                                        } else if (sessionData.testType === 'TEST_TYPE_VIDEO_2D') {
                                            primaryStr = `ROM: ${(lastT.kneeAngle || 85).toFixed(1)}°`;
                                            secondaryStr = `Vel. Ang: ${Math.abs(lastT.angularVelocity || 300).toFixed(0)}°/s`;
                                            badgeColor = 'rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b';
                                            badgeText = 'Cinematica 2D';
                                        } else if (sessionData.testType === 'TEST_TYPE_FORCE_ISOMETRIC') {
                                            primaryStr = `F. Picco: ${(lastT.peakForce || 2800).toFixed(0)} N`;
                                            secondaryStr = `RFD: ${(lastT.rfd || 6500).toFixed(0)} N/s`;
                                            badgeColor = 'rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444';
                                            badgeText = 'IMTP Valido';
                                        } else {
                                            primaryStr = `N. ${trials.length} Prove`;
                                            badgeColor = 'rgba(148, 163, 184, 0.2); color: #cbd5e1; border: 1px solid #94a3b8';
                                            badgeText = 'Tabellare';
                                        }

                                        return `
                                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                                                <td style="padding: 0.6rem; font-weight: 700; color: #ffffff;">${a.name}</td>
                                                <td style="padding: 0.6rem; color: ${COLOR_SLATE};">${trials.length}</td>
                                                <td style="padding: 0.6rem; font-weight: 600; color: ${COLOR_CYAN};">${primaryStr}</td>
                                                <td style="padding: 0.6rem; color: #ffffff;">${secondaryStr}</td>
                                                <td style="padding: 0.6rem;">
                                                    <span style="font-size: 0.75rem; padding: 3px 8px; border-radius: 6px; background: ${badgeColor}; font-weight: 700;">
                                                        ${badgeText}
                                                    </span>
                                                </td>
                                                <td style="padding: 0.6rem; text-align: right;">
                                                    <button class="btn-select-athlete" data-athlete-id="${a.id}" style="padding: 0.35rem 0.75rem; border-radius: 6px; background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.4); font-size: 0.78rem; font-weight: 600; cursor: pointer;">
                                                        Scheda Atleta
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Sezione Audit Integrità Dati e Prove Escluse -->
                    ${excluded.length > 0 ? `
                        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.15rem;">
                            <h4 style="margin: 0 0 0.5rem 0; color: #ef4444; font-size: 0.95rem; font-weight: 700;">
                                Audit Metrologico: ${excluded.length} Prove Escluse per Anomalie Balistiche o Falsi Stacchi
                            </h4>
                            <div style="font-size: 0.8rem; color: #fca5a5; display: flex; flex-direction: column; gap: 0.35rem;">
                                ${excluded.map(ex => `
                                    <div>Riga ${ex._rowIndex}: Atleta <strong>${ex.athlete || 'Atleta'}</strong> - ${ex._validationReason || 'Escluso da Sanity Check'}</div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        /**
         * Tab 2 - Metriche & Soglie di Rilevabilità (MDC 95% e Rumore di Misura).
         * @private
         */
        _renderThresholdsTabHtml(sessionData) {
            const kpis = sessionData.computedMetrics?.kpis || {};
            const athletes = sessionData.athletes || [];
            const isSprint = sessionData.testType === 'TEST_TYPE_SPRINT_GATES';

            return `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div style="background: ${COLOR_CARD_BG}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 1.25rem;">
                        <h3 style="margin: 0 0 0.5rem 0; color: #ffffff; font-size: 1.1rem; font-weight: 700;">
                            Discriminazione Statistica: Rumore di Misura vs Variazione Reale (MDC 95%)
                        </h3>
                        <p style="color: ${COLOR_SLATE}; font-size: 0.85rem; margin: 0 0 1rem 0; line-height: 1.5;">
                            Secondo la letteratura metrologica sportiva (Weir, 2005; Hopkins, 2000), una variazione prestativa è scientificamente significativa solo se eccede la soglia <em>Minimal Detectable Change (MDC 95% = 1.96 × √2 × SEM)</em>.
                            Qualsiasi oscillazione al di sotto di questa soglia è matematicamente ascrivibile al rumore casuale dello strumento.
                        </p>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1rem;">
                                <div style="font-size: 0.8rem; color: ${COLOR_SLATE}; font-weight: 600;">SOGLIA MDC 95% CALCOLATA</div>
                                <div style="font-size: 1.8rem; font-weight: 800; color: ${COLOR_CYAN};">±${kpis.mdc95ThresholdCm || DEFAULT_FALLBACK_MDC_CM} ${isSprint ? 's' : 'cm'}</div>
                                <div style="font-size: 0.75rem; color: ${COLOR_SLATE};">Intervallo di confidenza al 95%</div>
                            </div>
                            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 1rem;">
                                <div style="font-size: 0.8rem; color: ${COLOR_SLATE}; font-weight: 600;">RISPOSTE OLTRE LA SOGLIA REALE</div>
                                <div style="font-size: 1.8rem; font-weight: 800; color: ${COLOR_EMERALD};">${kpis.potentiationCount || 0} Atleti</div>
                                <div style="font-size: 0.75rem; color: ${COLOR_SLATE};">Variazioni statisticamente superiori all'errore di misura</div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabella Dettaglio Variazione per Atleta con soglia visiva -->
                    <div style="background: ${COLOR_CARD_BG}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 1.25rem;">
                        <h4 style="margin: 0 0 1rem 0; color: #ffffff; font-size: 1rem; font-weight: 700;">
                            Classificazione Variazioni Individuali vs Soglia MDC
                        </h4>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
                                <thead>
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: ${COLOR_SLATE};">
                                        <th style="padding: 0.5rem;">Atleta</th>
                                        <th style="padding: 0.5rem;">Pre / Baseline</th>
                                        <th style="padding: 0.5rem;">Post / Effettivo</th>
                                        <th style="padding: 0.5rem;">Differenziale Assoluto</th>
                                        <th style="padding: 0.5rem;">Esito Significatività</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${athletes.map(a => {
                                        const trials = a.validTrials || [];
                                        const pre = trials[0] ? (trials[0].jumpHeight || trials[0].velocity || trials[0].split_10m || trials[0].val1 || 0) : 0;
                                        const post = trials[trials.length - 1] ? (trials[trials.length - 1].jumpHeight || trials[trials.length - 1].velocity || trials[trials.length - 1].split_10m || trials[trials.length - 1].val1 || 0) : 0;
                                        const delta = post - pre;
                                        const mdcVal = kpis.mdc95ThresholdCm || DEFAULT_FALLBACK_MDC_CM;
                                        const isSignificant = Math.abs(delta) >= mdcVal;
                                        const isPositive = isSprint ? (delta < 0) : (delta > 0);

                                        return `
                                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                                                <td style="padding: 0.5rem; font-weight: 700; color: #ffffff;">${a.name}</td>
                                                <td style="padding: 0.5rem; color: ${COLOR_SLATE};">${pre.toFixed(2)}</td>
                                                <td style="padding: 0.5rem; color: #ffffff;">${post.toFixed(2)}</td>
                                                <td style="padding: 0.5rem; font-weight: 700; color: ${isPositive ? COLOR_EMERALD : (delta !== 0 ? COLOR_ROSE : COLOR_SLATE)};">
                                                    ${delta > 0 ? '+' : ''}${delta.toFixed(2)}
                                                </td>
                                                <td style="padding: 0.5rem;">
                                                    <span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; font-weight: 700; ${isSignificant ? 'background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid #10b981;' : 'background: rgba(148,163,184,0.15); color: #94a3b8; border: 1px solid rgba(255,255,255,0.08);'}">
                                                        ${isSignificant ? 'Reale (Oltre MDC)' : 'Rumore di Misura (< MDC)'}
                                                    </span>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Tab 3 - Analisi Meccanica & Strategie Esecutive (Grafici Dinamici).
         * @private
         */
        _renderMechanicsTabHtml(sessionData) {
            return `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div style="background: ${COLOR_CARD_BG}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 1.25rem;">
                        <h3 style="margin: 0 0 0.5rem 0; color: #ffffff; font-size: 1.05rem; font-weight: 700;">
                            Curva Dinamica Meccanica & Strategie Esecutive
                        </h3>
                        <div style="height: ${DEFAULT_CHART_HEIGHT_PX}px; position: relative;">
                            <canvas id="adaptive-mechanics-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Tab 4 - Profilazione & Correlazioni Funzionali.
         * @private
         */
        _renderProfilingTabHtml(sessionData) {
            return `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div style="background: ${COLOR_CARD_BG}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 1.25rem;">
                        <h3 style="margin: 0 0 0.5rem 0; color: #ffffff; font-size: 1.05rem; font-weight: 700;">
                            Profilazione Funzionale & Modelli Biomeccanici
                        </h3>
                        <div style="height: ${DEFAULT_CHART_HEIGHT_PX}px; position: relative;">
                            <canvas id="adaptive-profiling-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Tab 5 - Scheda Tecnica Individuale & Integrazione RAG.
         * @private
         */
        _renderAthleteTabHtml(sessionData) {
            const athletes = sessionData.athletes || [];
            const currentAth = athletes.find(a => a.id === this.selectedAthleteId) || athletes[0] || { name: 'Atleta', validTrials: [], excludedTrials: [] };

            return `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <!-- Selettore Atleta a Pills -->
                    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        <span style="color: ${COLOR_SLATE}; font-size: 0.85rem; font-weight: 600;">Seleziona Atleta:</span>
                        <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                            ${athletes.map(a => `
                                <button class="btn-select-athlete-pill" data-athlete-id="${a.id}" style="padding: 0.4rem 0.85rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; ${a.id === currentAth.id ? `background: ${COLOR_CYAN}; color: #080c16; border: 1px solid ${COLOR_CYAN};` : 'background: rgba(30,41,59,0.8); color: #94a3b8; border: 1px solid rgba(255,255,255,0.08);'}">
                                    ${a.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Scheda Tecnica Dettagliata per Atleta -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
                        <!-- Colonna 1: Esito Oggettivo, Anamnesi e Colli di Bottiglia -->
                        <div style="background: ${COLOR_CARD_BG}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
                            <div>
                                <h4 style="margin: 0 0 0.5rem 0; color: #ffffff; font-size: 1.05rem; font-weight: 700;">
                                    Cartella Biomeccanica: ${currentAth.name}
                                </h4>
                                <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
                                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.35rem;">
                                        <span style="color: ${COLOR_SLATE};">Prove Valide Eseguite:</span>
                                        <strong style="color: #ffffff;">${currentAth.validTrials?.length || 0}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.35rem;">
                                        <span style="color: ${COLOR_SLATE};">Miglior Prestazione Rilevata:</span>
                                        <strong style="color: ${COLOR_CYAN};">
                                            ${this._getBestMetricStr(currentAth.validTrials, sessionData.testType)}
                                        </strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.35rem;">
                                        <span style="color: ${COLOR_SLATE};">Prove Escluse da Sanity Check:</span>
                                        <strong style="color: ${(currentAth.excludedTrials?.length || 0) > 0 ? COLOR_ROSE : COLOR_EMERALD};">
                                            ${currentAth.excludedTrials?.length || 0}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <!-- Box Anamnesi Atletica -->
                            <div style="background: rgba(0,0,0,0.25); border-left: 3px solid ${COLOR_INDIGO}; padding: 0.75rem; border-radius: 4px;">
                                <strong style="color: #ffffff; display: block; margin-bottom: 0.25rem; font-size: 0.85rem;">Anamnesi & Inquadramento:</strong>
                                <span style="color: #cbd5e1; font-size: 0.82rem;">
                                    Atleta agonista in monitoraggio periodico. Profilo neuromuscularmente reattivo con carico di lavoro programmato sul ciclo di forza esplosiva.
                                </span>
                            </div>

                            <!-- Box Collo di Bottiglia Biomeccanico -->
                            <div style="background: rgba(0,0,0,0.25); border-left: 3px solid ${COLOR_AMBER}; padding: 0.75rem; border-radius: 4px;">
                                <strong style="color: #ffffff; display: block; margin-bottom: 0.25rem; font-size: 0.85rem;">Collo di Bottiglia (Fattore Limitante):</strong>
                                <span id="athlete-bottleneck-text" style="color: #fde68a; font-size: 0.82rem;">
                                    ${this.prescriptionData?.bottleneck || 'Analisi del collo di bottiglia in corso...'}
                                </span>
                            </div>
                        </div>

                        <!-- Colonna 2: Convalida RAG e Prescrizioni di Allenamento -->
                        <div id="rag-insights-container" style="background: ${COLOR_CARD_BG}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0; color: ${COLOR_CYAN}; font-size: 1rem; font-weight: 700;">
                                    Evidenze Scientifiche RAG & Prescrizioni Coach
                                </h4>
                                <span style="font-size: 0.75rem; background: rgba(0,240,255,0.12); color: ${COLOR_CYAN}; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
                                    Libreria Fonti Peer-Reviewed
                                </span>
                            </div>

                            <div id="rag-insights-body" style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">
                                ${this.isLoadingRag ? '<p style="color: #94a3b8;">Interrogazione motore RAG e Libreria Fonti in corso...</p>' : this._renderRagBodyHtml()}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Calcola la stringa con la migliore metrica per l'atleta.
         * @private
         */
        _getBestMetricStr(trials, testType) {
            if (!trials || trials.length === 0) return '-';
            if (testType === 'TEST_TYPE_JUMP_STIFFNESS') {
                const maxH = Math.max(...trials.map(t => t.jumpHeight || t.h || 0));
                return `${maxH.toFixed(1)} cm`;
            }
            if (testType === 'TEST_TYPE_VBT') {
                const maxV = Math.max(...trials.map(t => t.velocity || t.vmean || 0));
                return `${maxV.toFixed(2)} m/s`;
            }
            if (testType === 'TEST_TYPE_SPRINT_GATES') {
                const minT = Math.min(...trials.map(t => t.cumulativeTime || t.split_60m || SPRINT_MAX_TIME_SENTINEL));
                return `${minT.toFixed(3)} s`;
            }
            if (testType === 'TEST_TYPE_VIDEO_2D') {
                const maxRom = Math.max(...trials.map(t => t.kneeAngle || 0));
                return `${maxRom.toFixed(1)}°`;
            }
            if (testType === 'TEST_TYPE_FORCE_ISOMETRIC') {
                const maxF = Math.max(...trials.map(t => t.peakForce || 0));
                return `${maxF.toFixed(0)} N`;
            }
            return 'Registrato';
        }

        /**
         * Renderizza l'HTML del corpo del modulo RAG.
         * @private
         */
        _renderRagBodyHtml() {
            if (!this.prescriptionData) {
                return '<p style="color: #94a3b8;">Nessun approfondimento disponibile. Clicca per caricare le evidenze.</p>';
            }

            const { diagnosticComment, prescription } = this.prescriptionData;

            return `
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="background: rgba(0,0,0,0.25); border-left: 3px solid ${COLOR_CYAN}; padding: 0.75rem; border-radius: 4px;">
                        <strong style="color: #ffffff; display: block; margin-bottom: 0.25rem;">Diagnosi Tecnico-Scientifica:</strong>
                        <span style="color: #cbd5e1;">${diagnosticComment}</span>
                    </div>

                    <div style="background: rgba(0,0,0,0.25); border-left: 3px solid ${COLOR_EMERALD}; padding: 0.75rem; border-radius: 4px;">
                        <strong style="color: #ffffff; display: block; margin-bottom: 0.25rem;">Prescrizione Operativa di Campo:</strong>
                        <ul style="margin: 0; padding-left: 1.2rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.25rem;">
                            <li><strong>Volume:</strong> ${prescription.setsReps}</li>
                            <li><strong>Intensità:</strong> ${prescription.intensity}</li>
                            <li><strong>Recupero:</strong> ${prescription.restInterval}</li>
                            <li><strong>Esercitazione Correttiva:</strong> ${prescription.correctiveDrills}</li>
                        </ul>
                    </div>

                    ${prescription.citations && prescription.citations.length > 0 ? `
                        <div style="background: rgba(0,0,0,0.25); border-left: 3px solid ${COLOR_INDIGO}; padding: 0.75rem; border-radius: 4px;">
                            <strong style="color: #ffffff; display: block; margin-bottom: 0.25rem;">Riferimenti Bibliografici (Libreria Fonti):</strong>
                            <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.78rem; color: #94a3b8; display: flex; flex-direction: column; gap: 0.2rem;">
                                ${prescription.citations.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        /**
         * Esegue la query RAG e aggiorna la UI del tab atleta.
         * @private
         */
        async _fetchAndRenderRag(sessionData) {
            const athletes = sessionData.athletes || [];
            const currentAth = athletes.find(a => a.id === this.selectedAthleteId) || athletes[0];
            const rag = root.RAGAnalysisIntegration;

            if (!rag) return;

            this.isLoadingRag = true;
            const container = document.getElementById('rag-insights-body');
            const bottleneckEl = document.getElementById('athlete-bottleneck-text');

            if (container) {
                container.innerHTML = '<p style="color: #94a3b8;">Interrogazione motore RAG e Libreria Fonti in corso...</p>';
            }

            try {
                const evidenceList = await rag.fetchScientificInsights(sessionData, currentAth);
                this.ragInsights = evidenceList;
                this.prescriptionData = rag.generatePrescription(sessionData, currentAth, evidenceList);
            } catch (err) {
                console.warn('[AdaptiveUI] Errore RAG:', err);
                this.prescriptionData = rag.generatePrescription(sessionData, currentAth, []);
            } finally {
                this.isLoadingRag = false;
                if (container) {
                    container.innerHTML = this._renderRagBodyHtml();
                }
                if (bottleneckEl && this.prescriptionData?.bottleneck) {
                    bottleneckEl.textContent = this.prescriptionData.bottleneck;
                }
            }
        }

        /**
         * Finestra modale non invasiva per la mappatura assistita delle colonne di un file generico.
         * Delegata al modulo dedicato AdaptiveUIMapping.
         * @private
         */
        _renderAssistedMappingModalHtml(sessionData) {
            return root.AdaptiveUIMapping ? root.AdaptiveUIMapping.renderAssistedMappingModalHtml(sessionData) : '';
        }


        /**
         * Associa tutti i listener agli elementi dinamici dell'AdaptiveUI.
         * @private
         */
        _bindEvents(sessionData) {
            // Switch dei Tab
            const tabBtns = this.container.querySelectorAll('.analysis-tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const newTab = btn.getAttribute('data-tab');
                    if (newTab && newTab !== this.activeTab) {
                        this.activeTab = newTab;
                        this.render(sessionData);
                    }
                });
            });

            // Selezione Atleta da tabella o da pill
            const selectAthBtns = this.container.querySelectorAll('.btn-select-athlete, .btn-select-athlete-pill');
            selectAthBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const athId = parseInt(btn.getAttribute('data-athlete-id'), 10);
                    if (athId) {
                        this.selectedAthleteId = athId;
                        this.activeTab = 'athlete';
                        this.render(sessionData);
                    }
                });
            });

            // Apertura Modale Mappatura Assistita
            const btnOpenMap = this.container.querySelector('#btn-open-mapping');
            if (btnOpenMap) {
                btnOpenMap.addEventListener('click', () => {
                    this.isMappingModalOpen = true;
                    this.render(sessionData);
                });
            }

            // Chiusura Modale Mappatura
            const btnCloseMap = this.container.querySelector('#btn-close-mapping-modal');
            const btnCancelMap = this.container.querySelector('#btn-cancel-mapping');
            [btnCloseMap, btnCancelMap].forEach(btn => {
                if (btn) {
                    btn.addEventListener('click', () => {
                        this.isMappingModalOpen = false;
                        this.render(sessionData);
                    });
                }
            });

            // Applicazione Mappatura Assistita
            const btnApplyMap = this.container.querySelector('#btn-apply-mapping');
            if (btnApplyMap) {
                btnApplyMap.addEventListener('click', () => {
                    if (root.AdaptiveUIMapping && typeof root.AdaptiveUIMapping.applyMapping === 'function') {
                        root.AdaptiveUIMapping.applyMapping(this, sessionData);
                    } else if (window.DataClassifier && typeof window.DataClassifier.mapGenericDataToTestType === 'function') {
                        const targetType = this.container.querySelector('#mapping-target-type')?.value;
                        const athleteCol = this.container.querySelector('#mapping-col-athlete')?.value;
                        const exerciseCol = this.container.querySelector('#mapping-col-exercise')?.value;
                        const metric1Col = this.container.querySelector('#mapping-col-metric1')?.value;
                        const metric2Col = this.container.querySelector('#mapping-col-metric2')?.value;

                        const remapped = window.DataClassifier.mapGenericDataToTestType(
                            sessionData.rawData,
                            { athleteCol, exerciseCol, metric1Col, metric2Col },
                            targetType,
                            sessionData.metadata?.filename || 'dataset_mappato.xlsx'
                        );
                        this.isMappingModalOpen = false;
                        this.render(remapped);
                    }
                });
            }

            // Esportazione Excel
            const btnExcel = this.container.querySelector('#btn-export-excel');
            if (btnExcel) {
                btnExcel.addEventListener('click', () => {
                    if (this.options.onExportExcel) {
                        this.options.onExportExcel(sessionData);
                    }
                });
            }

            // Esportazione Word
            const btnWord = this.container.querySelector('#btn-export-word');
            if (btnWord) {
                btnWord.addEventListener('click', () => {
                    if (this.options.onExportWord) {
                        this.options.onExportWord(sessionData);
                    }
                });
            }

            // Ricarica o cambio dataset
            const btnChange = this.container.querySelector('#btn-change-dataset');
            if (btnChange) {
                btnChange.addEventListener('click', () => {
                    if (this.options.onChangeDataset) {
                        this.options.onChangeDataset();
                    }
                });
            }
        }

        /**
         * Inizializza i grafici Chart.js dinamici per il tab attivo delegando ad AdaptiveUICharts.
         * @private
         */
        _initTabCharts(sessionData) {
            if (root.AdaptiveUICharts && typeof root.AdaptiveUICharts.initTabCharts === 'function') {
                root.AdaptiveUICharts.initTabCharts(this, sessionData);
            }
        }
    }

    // Esposizione globale
    root.AdaptiveUI = AdaptiveUI;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AdaptiveUI;
    }
})();
