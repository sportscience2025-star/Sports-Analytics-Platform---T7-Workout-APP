/**
 * js/views/analysis-view.js
 * Unified, Polymorphic & RAG-Driven Data Analysis View.
 *
 * Sostituisce i selettori statici hardcoded (subnav PAP vs VBT) con:
 * 1. Unico stato centrale reattivo (currentSessionData) polimorfico.
 * 2. Smart Dropzone Universale (.xlsx, .csv, .json, .txt) con motore euristico di auto-classificazione.
 * 3. Istanziazione e mount dell'AdaptiveUI (Intestazione dinamica, 4 KPI cards contestuali, 5 Tab e RAG).
 * 4. Doppio motore di esportazione integrato (Cartella Excel 4 fogli sbloccati & Report Word .doc).
 */

(function () {
    'use strict';

    window.App = window.App || {};
    window.App.Views = window.App.Views || {};

    // --- Costanti Cromatiche e Layout ---
    const COLOR_CYAN = '#00f0ff';
    const COLOR_INDIGO = '#6366f1';
    const COLOR_EMERALD = '#10b981';
    const COLOR_AMBER = '#f59e0b';
    const COLOR_ROSE = '#ef4444';
    const COLOR_PURPLE = '#a855f7';
    const COLOR_SLATE = '#94a3b8';
    const COLOR_CARD_BG = 'rgba(15, 23, 42, 0.75)';
    const COLOR_BORDER = 'rgba(255, 255, 255, 0.08)';
    const EMPTY_ITEMS_COUNT = 0;
    const FIRST_ITEM_INDEX = 0;
    const SPINNER_CONTAINER_HEIGHT_PX = 350;
    const GRAVITY_CONSTANT_MPS2 = 9.81;
    const KINEMATIC_COEFF = 8.0;
    const CM_TO_METERS = 100.0;

    // --- Stato Centrale Reattivo di Sessione ---
    let currentSessionData = null;
    let adaptiveUiInstance = null;

    window.App.Views['analysis'] = {
        name: 'analysis',
        title: 'Data Analisi & Performance Biomeccanica',

        /**
         * Renderizza la vista Data Analisi.
         * Se una sessione è attiva, renderizza la dashboard adattiva; altrimenti mostra la Smart Dropzone.
         * @param {HTMLElement} appContainer - Contenitore principale DOM.
         * @param {Object} state - Stato globale dell'applicazione.
         */
        render: function (appContainer, state) {
            this.cleanup(state);

            appContainer.innerHTML = `
                <div class="analysis-view-wrapper" style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <!-- Area di Montaggio Dinamico -->
                    <div id="analysis-main-mount"></div>
                </div>
            `;

            const mount = document.getElementById('analysis-main-mount');
            if (!mount) return;

            // Se è presente una sessione attiva, renderizza direttamente AdaptiveUI
            if (currentSessionData) {
                this._renderActiveSession(mount, state);
            } else {
                this._renderSmartDropzone(mount, state);
            }
        },

        /**
         * Renderizza la Smart Dropzone Universale per l'acquisizione di file eterogenei o dataset campione.
         * @private
         */
        _renderSmartDropzone: function (mount, state) {
            mount.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 960px; margin: 0 auto; width: 100%;">
                    <!-- Header Descrittivo Ingestione -->
                    <div style="text-align: center; padding: 1rem 0;">
                        <h2 style="margin: 0 0 0.5rem 0; color: #ffffff; font-size: 1.6rem; font-weight: 800;">
                            Piattaforma Universale di Analisi Biomeccanica & Sport Science
                        </h2>
                        <p style="margin: 0; color: ${COLOR_SLATE}; font-size: 0.95rem; max-width: 680px; margin: 0 auto; line-height: 1.5;">
                            Trascina o carica qualsiasi tracciato di test (Salti, VBT con encoder, Sprint a fotocellule, Videoanalisi 2D, Pedane di forza). Il classificatore euristico identificherà il protocollo e autoconfigurerà dashboard, soglie e consultazione scientifica RAG.
                        </p>
                    </div>

                    <!-- Smart Dropzone Box -->
                    <div id="universal-dropzone" style="border: 2px dashed rgba(0, 240, 255, 0.35); border-radius: 16px; background: rgba(15, 23, 42, 0.6); padding: 3rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.25s; position: relative; backdrop-filter: blur(12px);">
                        <input type="file" id="universal-file-input" accept=".xlsx,.xls,.csv,.json,.txt" style="display: none;" />
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                            <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.3); display: flex; align-items: center; justify-content: center;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${COLOR_CYAN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                            </div>
                            <div>
                                <h3 style="margin: 0 0 0.35rem 0; color: #ffffff; font-size: 1.15rem; font-weight: 700;">
                                    Trascina qui il file di test oppure clicca per sfogliare
                                </h3>
                                <p style="margin: 0; color: ${COLOR_SLATE}; font-size: 0.85rem;">
                                    Formati supportati: Excel (.xlsx, .xls), CSV, JSON, Log TXT fotocellule
                                </p>
                            </div>
                            <span style="font-size: 0.78rem; padding: 4px 12px; border-radius: 20px; background: rgba(255, 255, 255, 0.05); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.1);">
                                Sanity Check & Validazione Cinematica Balistica Integrata
                            </span>
                        </div>
                    </div>

                    <!-- Sezione Dataset Campione Preconfigurati -->
                    <div style="background: ${COLOR_CARD_BG}; border: 1px solid ${COLOR_BORDER}; border-radius: 14px; padding: 1.5rem; backdrop-filter: blur(10px);">
                        <h4 style="margin: 0 0 0.35rem 0; color: #ffffff; font-size: 0.95rem; font-weight: 700;">
                            Oppure esplora con un dataset campione certificato:
                        </h4>
                        <p style="margin: 0 0 1.25rem 0; color: ${COLOR_SLATE}; font-size: 0.82rem;">
                            Carica istantaneamente archivi biomeccanici reali completi di calcoli, audit e letteratura scientifica:
                        </p>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.75rem;">
                            <button class="btn-load-sample" data-sample="TEST_TYPE_JUMP_STIFFNESS" style="text-align: left; padding: 0.85rem 1rem; border-radius: 10px; background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.25); color: #ffffff; cursor: pointer; transition: all 0.2s;">
                                <div style="font-weight: 700; font-size: 0.88rem; color: ${COLOR_CYAN}; margin-bottom: 0.2rem;">Salti Verticali & Stiffness (PAP)</div>
                                <div style="font-size: 0.75rem; color: ${COLOR_SLATE};">Studio 28 Luglio 2026, MDC 95%, TC, TF, RSI e filtro Salto 2680</div>
                            </button>

                            <button class="btn-load-sample" data-sample="TEST_TYPE_VBT" style="text-align: left; padding: 0.85rem 1rem; border-radius: 10px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); color: #ffffff; cursor: pointer; transition: all 0.2s;">
                                <div style="font-weight: 700; font-size: 0.88rem; color: #a5b4fc; margin-bottom: 0.2rem;">VBT Encoder Lineare</div>
                                <div style="font-size: 0.75rem; color: ${COLOR_SLATE};">Curve Carico-Velocità, stima 1RM González-Badillo e calo velocità</div>
                            </button>

                            <button class="btn-load-sample" data-sample="TEST_TYPE_SPRINT_GATES" style="text-align: left; padding: 0.85rem 1rem; border-radius: 10px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); color: #ffffff; cursor: pointer; transition: all 0.2s;">
                                <div style="font-weight: 700; font-size: 0.88rem; color: #34d399; margin-bottom: 0.2rem;">Sprint a Fotocellule Witty</div>
                                <div style="font-size: 0.75rem; color: ${COLOR_SLATE};">Intertempi 0-5m, 10m, 20m, 30m, 60m e profilo F-V Morin-Samozino</div>
                            </button>

                            <button class="btn-load-sample" data-sample="TEST_TYPE_VIDEO_2D" style="text-align: left; padding: 0.85rem 1rem; border-radius: 10px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); color: #ffffff; cursor: pointer; transition: all 0.2s;">
                                <div style="font-weight: 700; font-size: 0.88rem; color: #fbbf24; margin-bottom: 0.2rem;">Videoanalisi Cinematica 2D</div>
                                <div style="font-size: 0.75rem; color: ${COLOR_SLATE};">Angoli articolari ginocchio/anca Kinovea e velocità angolari</div>
                            </button>

                            <button class="btn-load-sample" data-sample="TEST_TYPE_FORCE_ISOMETRIC" style="text-align: left; padding: 0.85rem 1rem; border-radius: 10px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); color: #ffffff; cursor: pointer; transition: all 0.2s;">
                                <div style="font-weight: 700; font-size: 0.88rem; color: #f87171; margin-bottom: 0.2rem;">Pedana di Forza (IMTP)</div>
                                <div style="font-size: 0.75rem; color: ${COLOR_SLATE};">Picco di forza, RFD a 100ms e asimmetria bilaterale arti</div>
                            </button>

                            <button class="btn-load-sample" data-sample="TEST_TYPE_MEDICINE_BALL" style="text-align: left; padding: 0.85rem 1rem; border-radius: 10px; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); color: #ffffff; cursor: pointer; transition: all 0.2s;">
                                <div style="font-weight: 700; font-size: 0.88rem; color: #c084fc; margin-bottom: 0.2rem;">Lancio Palla Medica (Cinematica)</div>
                                <div style="font-size: 0.75rem; color: ${COLOR_SLATE};">Massa 3-5kg, gittata, tempo volo e stima potenza Sayers-Harman</div>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            this._bindDropzoneEvents(mount, state);
        },

        /**
         * Associa gli eventi di Drag & Drop, selezione file e bottoni campione.
         * @private
         */
        _bindDropzoneEvents: function (mount, state) {
            const dropzone = mount.querySelector('#universal-dropzone');
            const fileInput = mount.querySelector('#universal-file-input');

            if (dropzone && fileInput) {
                dropzone.addEventListener('click', () => fileInput.click());

                dropzone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropzone.style.borderColor = COLOR_CYAN;
                    dropzone.style.background = 'rgba(0, 240, 255, 0.08)';
                });

                dropzone.addEventListener('dragleave', () => {
                    dropzone.style.borderColor = 'rgba(0, 240, 255, 0.35)';
                    dropzone.style.background = 'rgba(15, 23, 42, 0.6)';
                });

                dropzone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropzone.style.borderColor = 'rgba(0, 240, 255, 0.35)';
                    dropzone.style.background = 'rgba(15, 23, 42, 0.6)';
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                        this._handleFileUpload(files[0], mount, state);
                    }
                });

                fileInput.addEventListener('change', (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                        this._handleFileUpload(files[0], mount, state);
                    }
                });
            }

            // Pulsanti di caricamento rapido dataset campione
            const sampleBtns = mount.querySelectorAll('.btn-load-sample');
            sampleBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sampleType = btn.getAttribute('data-sample');
                    if (window.DataClassifier && typeof window.DataClassifier.getSampleDataset === 'function') {
                        currentSessionData = window.DataClassifier.getSampleDataset(sampleType);
                        this._renderActiveSession(mount, state);
                    }
                });
            });
        },

        /**
         * Gestisce l'ingestione, parsing, classificazione e normalizzazione del file caricato.
         * @private
         */
        _handleFileUpload: async function (file, mount, state) {
            if (!file) return;

            // Feedback di caricamento
            mount.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 350px; gap: 1rem;">
                    <div style="width: 44px; height: 44px; border: 3px solid rgba(0, 240, 255, 0.2); border-top-color: ${COLOR_CYAN}; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                    <p style="color: ${COLOR_SLATE}; font-size: 0.9rem; margin: 0;">
                        Ingestione ed esame euristico di <strong>${file.name}</strong>...
                    </p>
                </div>
            `;

            try {
                let records = [];
                let headers = [];

                if (file.name.endsWith('.json')) {
                    const text = await file.text();
                    const parsed = JSON.parse(text);
                    records = Array.isArray(parsed) ? parsed : (parsed.records || parsed.data || []);
                    headers = records.length > 0 ? Object.keys(records[0]) : [];
                } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
                    const text = await file.text();
                    const isOptojumpMultiSection = text.includes('**** Persone') || text.includes('**** Salti') || text.includes('**** Sessione');

                    if (isOptojumpMultiSection && window.PAPBenchmarkData && typeof window.PAPBenchmarkData.parseOptojumpCSV === 'function') {
                        // Parser specializzato ad albero gerarchico Optojump
                        const athletes = window.PAPBenchmarkData.parseOptojumpCSV(text);
                        const rawRecords = [];

                        athletes.forEach(ath => {
                            if (ath.singleJumps) {
                                if (ath.singleJumps.sjPre) rawRecords.push({ athlete: ath.name, exercise: 'SJ PRE', jumpHeight: ath.singleJumps.sjPre, flightTime: Math.sqrt(KINEMATIC_COEFF * (ath.singleJumps.sjPre / CM_TO_METERS) / GRAVITY_CONSTANT_MPS2), contactTime: 0, rsi: 0, type: 'SJ' });
                                if (ath.singleJumps.sjPost) rawRecords.push({ athlete: ath.name, exercise: 'SJ POST', jumpHeight: ath.singleJumps.sjPost, flightTime: Math.sqrt(KINEMATIC_COEFF * (ath.singleJumps.sjPost / CM_TO_METERS) / GRAVITY_CONSTANT_MPS2), contactTime: 0, rsi: 0, type: 'SJ' });
                                if (ath.singleJumps.cmjPre) rawRecords.push({ athlete: ath.name, exercise: 'CMJ PRE', jumpHeight: ath.singleJumps.cmjPre, flightTime: Math.sqrt(KINEMATIC_COEFF * (ath.singleJumps.cmjPre / CM_TO_METERS) / GRAVITY_CONSTANT_MPS2), contactTime: 0, rsi: 0, type: 'CMJ' });
                                if (ath.singleJumps.cmjPost) rawRecords.push({ athlete: ath.name, exercise: 'CMJ POST', jumpHeight: ath.singleJumps.cmjPost, flightTime: Math.sqrt(KINEMATIC_COEFF * (ath.singleJumps.cmjPost / CM_TO_METERS) / GRAVITY_CONSTANT_MPS2), contactTime: 0, rsi: 0, type: 'CMJ' });
                                if (ath.singleJumps.abkPre) rawRecords.push({ athlete: ath.name, exercise: 'ABK PRE', jumpHeight: ath.singleJumps.abkPre, flightTime: Math.sqrt(KINEMATIC_COEFF * (ath.singleJumps.abkPre / CM_TO_METERS) / GRAVITY_CONSTANT_MPS2), contactTime: 0, rsi: 0, type: 'ABK' });
                                if (ath.singleJumps.abkPost) rawRecords.push({ athlete: ath.name, exercise: 'ABK POST', jumpHeight: ath.singleJumps.abkPost, flightTime: Math.sqrt(KINEMATIC_COEFF * (ath.singleJumps.abkPost / CM_TO_METERS) / GRAVITY_CONSTANT_MPS2), contactTime: 0, rsi: 0, type: 'ABK' });
                            }
                            (ath.reactiveReboundsPre || []).forEach((reb, idx) => {
                                rawRecords.push({ athlete: ath.name, exercise: `Rimbalzo PRE #${idx + 1}`, jumpHeight: reb.height, contactTime: reb.tc, flightTime: reb.tf, rsi: reb.rsi, type: 'RJ' });
                            });
                            (ath.reactiveReboundsPost || []).forEach((reb, idx) => {
                                rawRecords.push({ athlete: ath.name, exercise: `Rimbalzo POST #${idx + 1}`, jumpHeight: reb.height, contactTime: reb.tc, flightTime: reb.tf, rsi: reb.rsi, type: 'RJ' });
                            });
                        });

                        const parsedHeaders = ['athlete', 'exercise', 'jumpHeight', 'contactTime', 'flightTime', 'rsi', 'type'];
                        currentSessionData = window.DataClassifier.normalizeSessionData(rawRecords, parsedHeaders, file.name, {
                            sessionTitle: 'Studio Sperimentale PAP & Dinamica di Salto Reattivo (Optojump)',
                            forceTestType: 'TEST_TYPE_JUMP_STIFFNESS'
                        });

                        if (athletes && athletes.length > 0) {
                            currentSessionData.athletes = athletes.map((ath, idx) => {
                                const trials = rawRecords.filter(r => r.athlete === ath.name);
                                return Object.assign({}, ath, {
                                    id: ath.id || (idx + 1),
                                    name: ath.name || ath.fullName,
                                    trials,
                                    validTrials: trials,
                                    excludedTrials: []
                                });
                            });
                        }

                        this._renderActiveSession(mount, state);
                        return;
                    }

                    // Tenta prima il parser multi-livello DataParser.parseExcel
                    let parsedOk = false;
                    if (window.DataParser && typeof window.DataParser.parseExcel === 'function') {
                        try {
                            const parsed = await window.DataParser.parseExcel(file);
                            records = parsed.rawData || parsed.records || [];
                            headers = parsed.headers || (records[0] ? Object.keys(records[0]) : []);
                            if (records && records.length > EMPTY_ITEMS_COUNT) parsedOk = true;
                        } catch (parseErr) {
                            console.warn('[AnalysisView] parseExcel fallito su file CSV/TXT, fallback a decoder testuale:', parseErr);
                        }
                    }
                    // Fallback nativo su readCSVRows
                    if (!parsedOk) {
                        const readCSVFn = (window._parserHeaderMapper && window._parserHeaderMapper.readCSVRows) ||
                                          (window.DataParser && window.DataParser.readCSVRows) ||
                                          (window.DataParser && window.DataParser._readCSVRows);
                        if (typeof readCSVFn === 'function') {
                            const rows = readCSVFn(text);
                            if (rows && rows.length > 1) {
                                headers = rows[FIRST_ITEM_INDEX].map((h, i) => (h ? String(h).trim() : `Colonna ${i + 1}`));
                                records = rows.slice(1).map(row => {
                                    const obj = {};
                                    headers.forEach((h, i) => {
                                        obj[h] = row[i] !== undefined ? row[i] : null;
                                    });
                                    return obj;
                                });
                                parsedOk = true;
                            }
                        }
                    }
                    // Fallback SheetJS
                    if (!parsedOk && window.XLSX) {
                        const buffer = await file.arrayBuffer();
                        const wb = window.XLSX.read(new Uint8Array(buffer), { type: 'array' });
                        const firstSheet = wb.Sheets[wb.SheetNames[FIRST_ITEM_INDEX]];
                        records = window.XLSX.utils.sheet_to_json(firstSheet, { defval: null });
                        headers = records.length > 0 ? Object.keys(records[FIRST_ITEM_INDEX]) : [];
                    }
                } else if (window.DataParser && typeof window.DataParser.parseExcel === 'function') {
                    // Utilizzo del parser multi-livello integrato nel progetto
                    const parsed = await window.DataParser.parseExcel(file);
                    records = parsed.rawData || parsed.records || [];
                    headers = parsed.headers || (records[0] ? Object.keys(records[0]) : []);
                } else if (window.XLSX) {
                    // Fallback diretto su SheetJS
                    const buffer = await file.arrayBuffer();
                    const wb = window.XLSX.read(new Uint8Array(buffer), { type: 'array' });
                    const firstSheet = wb.Sheets[wb.SheetNames[0]];
                    records = window.XLSX.utils.sheet_to_json(firstSheet, { defval: null });
                    headers = records.length > 0 ? Object.keys(records[0]) : [];
                } else {
                    throw new Error('Nessun parser disponibile nel contesto applicativo.');
                }

                if (!records || records.length === 0) {
                    throw new Error('Nessuna riga valida estratta dal file.');
                }

                // Normalizzazione polimorfica tramite DataClassifier
                if (window.DataClassifier && typeof window.DataClassifier.normalizeSessionData === 'function') {
                    currentSessionData = window.DataClassifier.normalizeSessionData(records, headers, file.name, {
                        sessionTitle: file.name.replace(/\.[^/.]+$/, '')
                    });
                } else {
                    throw new Error('Modulo DataClassifier non caricato.');
                }

                this._renderActiveSession(mount, state);
            } catch (err) {
                console.error('[AnalysisView] Errore upload:', err);
                mount.innerHTML = `
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 12px; padding: 2rem; text-align: center;">
                        <h3 style="color: #ef4444; margin: 0 0 0.5rem 0;">Errore durante l'acquisizione del file</h3>
                        <p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 1.5rem;">${err.message || 'Formato non riconosciuto o danneggiato.'}</p>
                        <button id="btn-retry-upload" style="padding: 0.6rem 1.25rem; border-radius: 8px; background: #ef4444; color: #ffffff; font-weight: 700; border: none; cursor: pointer;">
                            Riprova Caricamento
                        </button>
                    </div>
                `;
                const retryBtn = mount.querySelector('#btn-retry-upload');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => this._renderSmartDropzone(mount, state));
                }
            }
        },

        /**
         * Renderizza la sessione attiva montando l'AdaptiveUI con le relative callback di esportazione.
         * @private
         */
        _renderActiveSession: function (mount, state) {
            if (!currentSessionData) return;

            if (window.AdaptiveUI) {
                adaptiveUiInstance = new window.AdaptiveUI('analysis-main-mount', {
                    onExportExcel: (session) => {
                        if (window.AnalysisExporter && typeof window.AnalysisExporter.exportToExcel === 'function') {
                            window.AnalysisExporter.exportToExcel(session);
                        }
                    },
                    onExportWord: (session) => {
                        if (window.AnalysisExporter && typeof window.AnalysisExporter.exportToWordReport === 'function') {
                            window.AnalysisExporter.exportToWordReport(session);
                        }
                    },
                    onExportHtml: (session) => {
                        if (window.AnalysisExporter && typeof window.AnalysisExporter.exportToHtml === 'function') {
                            window.AnalysisExporter.exportToHtml(session);
                        }
                    },
                    onExportPDF: (session) => {
                        if (window.AnalysisExporter && typeof window.AnalysisExporter.exportToPDF === 'function') {
                            window.AnalysisExporter.exportToPDF(session);
                        }
                    },
                    onChangeDataset: () => {
                        currentSessionData = null;
                        this._renderSmartDropzone(mount, state);
                    }
                });
                adaptiveUiInstance.render(currentSessionData);
            } else {
                mount.innerHTML = '<div style="padding: 2rem; color: #ef4444;">Errore: Modulo AdaptiveUI non caricato.</div>';
            }
        },

        /**
         * Pulisce le istanze attive per prevenire memory leak.
         * @param {Object} state - Stato dell'applicazione.
         */
        cleanup: function (state) {
            if (adaptiveUiInstance && typeof adaptiveUiInstance.destroyCharts === 'function') {
                adaptiveUiInstance.destroyCharts();
                adaptiveUiInstance = null;
            }
            if (state) {
                if (state.analysisUI && typeof state.analysisUI.cleanup === 'function') {
                    state.analysisUI.cleanup();
                    state.analysisUI = null;
                }
                if (state.papUI && typeof state.papUI.destroyCharts === 'function') {
                    state.papUI.destroyCharts();
                    state.papUI = null;
                }
            }
        }
    };
})();
