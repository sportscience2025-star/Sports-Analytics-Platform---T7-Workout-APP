/**
 * T7 Workout - RAG User Interface
 * Provides drag-and-drop ingestion, progress tracking, document management, and semantic search trial UI.
 */

(function () {
    const SYNTHESIS_MIN_SCORE = 0.15;
    const MMR_RELEVANCE_WEIGHT = 0.6;
    const MMR_DIVERSITY_WEIGHT = 0.4;
    const MAX_EXECUTIVE_SUMMARY_SENTENCES = 3;
    const MAX_COLLECTED_MECHANISMS = 4;
    const MAX_COLLECTED_TAKEAWAYS = 4;
    const MIN_PROPOSITION_LENGTH = 20;
    const FALLBACK_CHUNK_THRESHOLD = 2;
    const DEFAULT_RELEVANCE_SCORE = 0.5;

    class RAGUI {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.uploadQueue = [];
            this.isProcessing = false;
            this.state = {
                devMode: false
            };
            this.currentStepKey = 'init';
            this.setupConsoleRedirection();
        }

        setupConsoleRedirection() {
            if (window.RAGUI_ConsoleRedirected) return;
            window.RAGUI_ConsoleRedirected = true;

            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;

            const appendToLogs = (level, ...args) => {
                const time = new Date().toLocaleTimeString('it-IT');
                const text = args.map(arg => {
                    if (arg instanceof Error) return arg.message + '\n' + arg.stack;
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                }).join(' ');
                
                const formatted = `[${time}] [${level}] ${text}`;
                
                if (!window.RAGUI_Logs) window.RAGUI_Logs = [];
                window.RAGUI_Logs.push({ level, formatted });
                if (window.RAGUI_Logs.length > 300) window.RAGUI_Logs.shift();

                const logsEl = document.getElementById('dev-progress-logs');
                if (logsEl) {
                    const div = document.createElement('div');
                    div.className = `log-${level.toLowerCase()}`;
                    div.textContent = formatted;
                    logsEl.appendChild(div);
                    logsEl.scrollTop = logsEl.scrollHeight;
                }
            };

            console.log = (...args) => {
                originalLog.apply(console, args);
                appendToLogs('INFO', ...args);
            };
            console.warn = (...args) => {
                originalWarn.apply(console, args);
                appendToLogs('WARN', ...args);
            };
            console.error = (...args) => {
                originalError.apply(console, args);
                appendToLogs('ERROR', ...args);
            };
        }

        getStepText(stepKey) {
            const stepsDev = {
                init: 'Caricamento file...',
                read: 'Lettura file...',
                extract: 'Estrazione testo in corso...',
                embed: 'Generazione vettori di embedding locali...',
                save: 'Salvataggio nel database locale...',
                done: 'Completato con successo!'
            };
            const stepsUser = {
                init: 'Caricamento del documento...',
                read: 'Lettura del documento in corso...',
                extract: 'Analisi del testo e delle tabelle...',
                embed: 'Configurazione assistente personalizzato...',
                save: 'Archiviazione sicura sul dispositivo...',
                done: 'Documento indicizzato con successo!'
            };
            const wrap = this.container ? this.container.querySelector('.rag-ui-wrapper') : null;
            const isDev = wrap ? wrap.classList.contains('dev-mode-active') : this.state.devMode;
            return isDev ? (stepsDev[stepKey] || '') : (stepsUser[stepKey] || '');
        }

        async render() {
            if (!this.container) return;

            this.container.innerHTML = `
                <div class="rag-ui-wrapper ${this.state.devMode ? 'dev-mode-active' : ''}">
                    <!-- Top Action Header -->
                    <div class="rag-header-bar">
                        <div class="rag-header-info">
                            <h2 class="rag-page-title">Knowledge</h2>
                            <p class="rag-page-subtitle">Interroga i tuoi protocolli e documenti scientifici con l'intelligenza artificiale locale offline.</p>
                        </div>
                        <div class="rag-header-actions">
                            <button id="rag-info-btn" class="rag-info-btn" title="Come funziona la Knowledge?">
                                <span class="rag-info-icon">ℹ️</span>
                                <span>Info</span>
                            </button>
                            <div class="rag-view-toggle-container">
                                <span class="rag-toggle-label">Dev Mode</span>
                                <label class="rag-toggle-switch">
                                    <input type="checkbox" id="rag-dev-toggle" ${this.state.devMode ? 'checked' : ''}>
                                    <span class="rag-toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Modal Informativo RAG (A Comparsa) -->
                    <div id="rag-info-modal" class="rag-modal-backdrop hidden">
                        <div class="rag-modal-card">
                            <div class="rag-modal-header">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 1.25rem;">ℹ️</span>
                                    <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-primary);">Come funziona la Knowledge?</h3>
                                </div>
                                <button id="rag-modal-close" class="rag-modal-close-btn">&times;</button>
                            </div>
                            <div class="rag-modal-body" style="font-size: 0.92rem; line-height: 1.6; color: var(--text-secondary); margin-top: 0.75rem;">
                                <p>Il modulo <strong>Knowledge</strong> potenzia l'intelligenza artificiale locale del tuo dispositivo. Quando fai una domanda, il sistema cerca le informazioni più rilevanti tra i documenti caricati e le fonti scientifiche per formulare risposte precise, personalizzate e scientificamente fondate, garantendo la massima <strong>privacy offline</strong> senza inviare dati a server esterni.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Layout Principale: Sidebar a Lato + Contenuto Centrale -->
                    <div class="rag-workspace-grid">
                        <!-- Colonna Laterale: Caricamento e Gestione Documenti -->
                        <div class="rag-sidebar-col">
                            <!-- Card Caricamento -->
                            <div class="rag-card rag-card-compact">
                                <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--text-primary);">📤 Carica Documenti</h4>
                                <div id="drag-drop-zone" class="drag-drop-zone drag-drop-zone-compact">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <p style="font-size: 0.85rem; margin: 0.35rem 0 0.15rem; font-weight: 500;">Trascina qui o seleziona file</p>
                                    <span class="file-hint" style="font-size: 0.72rem;">PDF, DOCX, XLSX, TXT</span>
                                    <input type="file" id="rag-file-input" multiple accept=".pdf,.xlsx,.xls,.docx,.txt" style="display: none;" />
                                </div>
                                
                                <div id="upload-progress-container" class="upload-progress-container hidden" style="margin-top: 0.75rem;">
                                    <div class="progress-info">
                                        <span id="upload-filename" class="upload-filename" style="font-size: 0.8rem;">File...</span>
                                        <span id="upload-percentage" class="upload-percentage" style="font-size: 0.8rem;">0%</span>
                                    </div>
                                    <div class="progress-bar-bg">
                                        <div id="upload-progress-bar" class="progress-bar-fill" style="width: 0%;"></div>
                                    </div>
                                    <div id="upload-status-text" class="upload-status-text" style="font-size: 0.72rem;">Inizializzazione...</div>
                                </div>
                            </div>

                            <!-- Card Documenti Caricati con Finestrella / Accordion a Scomparsa -->
                            <div class="rag-card rag-card-compact" style="margin-top: 0.75rem;">
                                <div class="rag-docs-accordion-header" id="rag-docs-toggle-btn" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none;">
                                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                                        <span style="font-size: 0.95rem;">📄</span>
                                        <h4 style="margin: 0; font-size: 0.9rem; color: var(--text-primary);">Documenti Attivi</h4>
                                        <span id="rag-doc-count-badge" class="badge-count" style="font-size: 0.72rem; padding: 0.1rem 0.45rem; border-radius: 12px; background: rgba(99, 102, 241, 0.2); color: var(--primary); font-weight: 700;">0</span>
                                    </div>
                                    <span id="rag-docs-chevron" style="font-size: 0.75rem; color: var(--text-secondary); transition: transform 0.2s ease;">▼</span>
                                </div>
                                <div id="rag-docs-collapsible" class="rag-docs-collapsible" style="margin-top: 0.5rem;">
                                    <div id="doc-list-container">
                                        <p class="empty-list-msg" style="font-size: 0.8rem; padding: 0.5rem 0;">Caricamento documenti...</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Log di Sistema (Developer Mode) -->
                            <div class="rag-card dev-only" style="margin-top: 0.75rem;">
                                <h4 style="font-size: 0.85rem; margin-bottom: 0.4rem;">💻 Log di Sistema</h4>
                                <div id="dev-progress-logs" class="dev-progress-logs"></div>
                            </div>
                        </div>

                        <!-- Colonna Centrale: Ricerca e Sintesi Concettuale Intelligente -->
                        <div class="rag-main-content-col">
                            <!-- Barra di Ricerca Primaria -->
                            <div class="rag-card rag-search-card" style="padding: 1rem 1.25rem;">
                                <div class="search-box-wrapper" style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
                                    <div style="position: relative; flex: 1 1 280px;">
                                        <input type="text" id="rag-search-input" class="rag-search-input" style="width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.25rem; font-size: 0.95rem; border-radius: var(--radius-sm, 6px);" placeholder="Cerca nella libreria scientifica o nei documenti..." />
                                        <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); opacity: 0.6; pointer-events: none; font-size: 0.95rem;">🔍</span>
                                    </div>
                                    <select id="rag-source-type-filter" class="scientific-sort-select" style="max-width: 200px; font-size: 0.85rem; height: 38px;" title="Filtra origine dei risultati">
                                        <option value="">Tutte le fonti</option>
                                        <option value="builtin_kb">Libreria Scientifica</option>
                                        <option value="user_document">Documenti Utente</option>
                                    </select>
                                    <button id="rag-search-btn" class="btn-primary rag-search-btn" style="padding: 0.65rem 1.35rem; font-weight: 600; border-radius: var(--radius-sm, 6px);">
                                        Cerca
                                    </button>
                                </div>
                            </div>

                            <!-- Risultati della Ricerca: Sintesi Concettuale Centrale -->
                            <div id="search-results-container" style="margin-top: 1rem;">
                                <div class="rag-welcome-placeholder" style="text-align: center; padding: 3.5rem 1.5rem; background: var(--glass-bg); border: 1px dashed var(--border); border-radius: var(--radius-md);">
                                    <span style="font-size: 2.5rem; display: block; margin-bottom: 0.75rem;">💡</span>
                                    <h4 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.15rem;">Cosa desideri approfondire?</h4>
                                    <p style="font-size: 0.9rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto; line-height: 1.5;">
                                        Inserisci una domanda per ottenere una sintesi concettuale esplicativa, principi fisiologici e parametri operativi estratti dai tuoi documenti.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupDragAndDrop();
            this.setupSearch();
            this.setupAccordionAndModal();

            // Populate system logs if any have been recorded
            const logsEl = this.container.querySelector('#dev-progress-logs');
            if (logsEl && window.RAGUI_Logs) {
                logsEl.innerHTML = window.RAGUI_Logs.map(log => {
                    return `<div class="log-${log.level.toLowerCase()}">${log.formatted}</div>`;
                }).join('');
                logsEl.scrollTop = logsEl.scrollHeight;
            }

            const devToggle = this.container.querySelector('#rag-dev-toggle');
            const wrapper = this.container.querySelector('.rag-ui-wrapper');
            if (devToggle && wrapper) {
                devToggle.addEventListener('change', (e) => {
                    this.state.devMode = e.target.checked;
                    if (this.state.devMode) {
                        wrapper.classList.add('dev-mode-active');
                    } else {
                        wrapper.classList.remove('dev-mode-active');
                    }
                    
                    // Update dynamically the text of the progress bar if processing
                    const statusTextEl = this.container.querySelector('#upload-status-text');
                    if (this.isProcessing && statusTextEl && this.currentStepKey) {
                        statusTextEl.textContent = this.getStepText(this.currentStepKey);
                    }
                });
            }

            await this.loadDocuments();
        }

        setupAccordionAndModal() {
            // Documents Accordion Toggle
            const docsToggleBtn = this.container.querySelector('#rag-docs-toggle-btn');
            const docsCollapsible = this.container.querySelector('#rag-docs-collapsible');
            const docsChevron = this.container.querySelector('#rag-docs-chevron');
            if (docsToggleBtn && docsCollapsible) {
                docsToggleBtn.addEventListener('click', () => {
                    const isCollapsed = docsCollapsible.classList.toggle('collapsed');
                    if (docsChevron) {
                        docsChevron.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
                    }
                });
            }

            // Info Modal Controls
            const infoBtn = this.container.querySelector('#rag-info-btn');
            const infoModal = this.container.querySelector('#rag-info-modal');
            const modalClose = this.container.querySelector('#rag-modal-close');
            if (infoBtn && infoModal) {
                infoBtn.addEventListener('click', () => infoModal.classList.remove('hidden'));
            }
            if (modalClose && infoModal) {
                modalClose.addEventListener('click', () => infoModal.classList.add('hidden'));
            }
            if (infoModal) {
                infoModal.addEventListener('click', (e) => {
                    if (e.target === infoModal) infoModal.classList.add('hidden');
                });
            }
        }

        setupDragAndDrop() {
            const zone = this.container.querySelector('#drag-drop-zone');
            const fileInput = this.container.querySelector('#rag-file-input');

            if (!zone || !fileInput) return;

            zone.addEventListener('click', () => fileInput.click());

            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('dragover');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    this.handleFiles(e.dataTransfer.files);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFiles(e.target.files);
                    fileInput.value = '';
                }
            });
        }

        setupSearch() {
            const searchInput = this.container.querySelector('#rag-search-input');
            const searchBtn = this.container.querySelector('#rag-search-btn');

            if (!searchInput || !searchBtn) return;

            const triggerSearch = async () => {
                const query = (searchInput.value || '').trim();
                if (!query) return;

                const resultsContainer = this.container.querySelector('#search-results-container');
                resultsContainer.innerHTML = '<p class="empty-list-msg">Ricerca in corso...</p>';

                try {
                    if (!window.RAGEngine) {
                        throw new Error("RAG Engine non caricato.");
                    }
                    const filterEl = this.container.querySelector('#rag-source-type-filter');
                    const filterSourceType = filterEl ? (filterEl.value || null) : null;
                    const chunks = await window.RAGEngine.semanticSearch(query, 5, filterSourceType);
                    
                    if (chunks.length === 0) {
                        resultsContainer.innerHTML = '<p class="empty-list-msg">Nessun frammento rilevante trovato. Prova a selezionare "Tutte le fonti" o modifica i termini di ricerca.</p>';
                        return;
                    }

                    const synthesis = this.synthesizeOfflineResponse(query, chunks);
                    
                    // Render Panel A: Sintesi Concettuale Locale (ChatGPT/Claude style structured explanation)
                    let docGroupsHtml = '';
                    for (const doc of synthesis.documents) {
                        const highlightedSentences = (doc.sentences || []).map(s => {
                            const highlighted = this.highlightKeywords(s, synthesis.keywords);
                            return `<div class="sintesi-sentence" style="margin-bottom: 0.5rem; line-height: 1.6;">${highlighted}</div>`;
                        }).join('');
                        
                        docGroupsHtml += `
                            <div class="sintesi-doc-group" style="margin-bottom: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm, 6px); padding: 0.75rem;">
                                <div class="sintesi-doc-title" style="font-size: 0.85rem; font-weight: 700; color: var(--primary); margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.35rem;">
                                    📄 ${doc.docName}
                                </div>
                                <div class="sintesi-doc-text" style="margin-left: 0.25rem; border-left: 2px solid var(--primary); padding-left: 0.75rem; color: var(--text-primary); font-size: 0.88rem;">
                                    ${highlightedSentences || '<span style="color: var(--text-secondary);">Contenuto analizzato dal documento.</span>'}
                                </div>
                            </div>
                        `;
                    }
                    
                    // Render Executive Overview
                    let overviewHtml = '';
                    if (synthesis.executiveSummary) {
                        overviewHtml = `
                            <div class="sintesi-overview-card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: var(--radius-md, 8px); padding: 1rem; margin-bottom: 1.25rem;">
                                <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #818cf8; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.35rem;">
                                    💡 Risposta e Quadro Generale
                                </div>
                                <p style="color: var(--text-primary); font-size: 0.92rem; line-height: 1.65; margin: 0;">
                                    ${this.highlightKeywords(synthesis.executiveSummary, synthesis.keywords)}
                                </p>
                            </div>
                        `;
                    }

                    // Render Physiological / Biomechanical Mechanisms
                    let mechanismsHtml = '';
                    if (synthesis.mechanisms && synthesis.mechanisms.length > 0) {
                        mechanismsHtml = `
                            <div class="sintesi-mechanisms-card" style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md, 8px); padding: 0.9rem; margin-bottom: 1.25rem;">
                                <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #34d399; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.35rem;">
                                    ⚡ Meccanismi Fisiologici & Principi Chiave
                                </div>
                                <ul style="margin: 0; padding-left: 1.2rem; color: var(--text-primary); font-size: 0.88rem; line-height: 1.6;">
                                    ${synthesis.mechanisms.map(m => `<li style="margin-bottom: 0.35rem;">${this.highlightKeywords(m, synthesis.keywords)}</li>`).join('')}
                                </ul>
                            </div>
                        `;
                    }

                    // Render Actionable Takeaways
                    let takeawaysHtml = '';
                    if (synthesis.takeaways && synthesis.takeaways.length > 0) {
                        takeawaysHtml = `
                            <div class="sintesi-takeaways-card" style="background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: var(--radius-md, 8px); padding: 0.9rem; margin-bottom: 1.25rem;">
                                <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #60a5fa; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.35rem;">
                                    🎯 Indicazioni Pratiche & Applicazione
                                </div>
                                <ul style="margin: 0; padding-left: 1.2rem; color: var(--text-primary); font-size: 0.88rem; line-height: 1.6;">
                                    ${synthesis.takeaways.map(t => `<li style="margin-bottom: 0.35rem;">${this.highlightKeywords(t, synthesis.keywords)}</li>`).join('')}
                                </ul>
                            </div>
                        `;
                    }

                    // Render Metrics
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
                                    🧠 Sintesi Concettuale Intelligente
                                </h4>
                                <div class="sintesi-content">
                                    ${overviewHtml}
                                    ${mechanismsHtml}
                                    ${takeawaysHtml}
                                    <div class="sintesi-details-section" style="margin-top: 1rem;">
                                        <h5 style="margin-bottom: 0.6rem; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
                                            Approfondimento Fonti Correlate
                                        </h5>
                                        ${docGroupsHtml}
                                    </div>
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
                                const score = (chunk && typeof chunk.score === 'number') ? (chunk.score * 100).toFixed(1) + '%' : '0%';
                                const highlightedText = this.highlightKeywords((chunk && chunk.text) || '', synthesis.keywords);
                                const docName = (chunk && chunk.docName) || 'Documentazione scientifica';
                                
                                const scoreVal = (chunk && typeof chunk.score === 'number') ? chunk.score : 0;
                                let relevanceClass = 'relevance-low';
                                let relevanceLabel = 'Rilevanza Bassa';
                                if (scoreVal >= 0.8) {
                                    relevanceClass = 'relevance-high';
                                    relevanceLabel = 'Rilevanza Alta';
                                } else if (scoreVal >= 0.65) {
                                    relevanceClass = 'relevance-medium';
                                    relevanceLabel = 'Rilevanza Media';
                                }

                                const isBuiltin = chunk.sourceType === 'builtin_kb' || chunk.documentId === 'builtin_knowledge_base';
                                const originBadge = isBuiltin
                                    ? `<span class="source-origin-badge" style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.35); border-radius: 4px; padding: 0.15rem 0.45rem; font-size: 0.7rem; font-weight: 700; margin-right: 0.5rem;">Libreria Scientifica</span>`
                                    : `<span class="source-origin-badge" style="background: rgba(14, 165, 233, 0.15); color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.35); border-radius: 4px; padding: 0.15rem 0.45rem; font-size: 0.7rem; font-weight: 700; margin-right: 0.5rem;">Documento Utente</span>`;

                                const scoreBadge = `
                                    <span class="chunk-score dev-only">${score}</span>
                                    <span class="relevance-badge ${relevanceClass} user-only">${relevanceLabel}</span>
                                `;

                                return `
                                    <div class="chunk-result-card" style="background: var(--glass-bg-light); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.25rem;">
                                        <div class="chunk-result-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                            <div style="display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap;">
                                                ${originBadge}
                                                <span class="chunk-docname" style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">${docName}</span>
                                            </div>
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
                } catch (err) {
                    console.error("RAG UI Search Error:", err);
                    resultsContainer.innerHTML = `<p class="empty-list-msg" style="color: var(--danger);">Errore durante la ricerca: ${err.message || 'Errore sconosciuto'}</p>`;
                }
            };

            searchBtn.addEventListener('click', triggerSearch);
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    triggerSearch();
                }
            });
        }

        /**
         * Clean text, split it into coherent propositions, and synthesize structured responses.
         * Generates executive summary, physiological/biomechanical mechanisms, practical takeaways, and metrics.
         * @param {string} query - Ricerca o domanda dell'utente
         * @param {Array<Object>} chunks - Frammenti recuperati dalla ricerca semantica
         * @returns {Object} Risultato strutturato della sintesi
         */
        synthesizeOfflineResponse(query, chunks) {
            const keywords = this.extractKeywords(query);
            const docGroups = {};
            const allMetrics = new Set();
            const allSentencesList = [];
            
            const validChunks = Array.isArray(chunks) ? chunks : [];
            const scoredChunks = validChunks.filter(c => {
                const s = typeof c.score === 'number' ? c.score : (typeof c.similarity === 'number' ? c.similarity : 0);
                return s >= SYNTHESIS_MIN_SCORE;
            });
            // Fallback: se la soglia è troppo restrittiva e lascia meno di 2 chunk, usa validChunks
            const chunksToSynthesize = scoredChunks.length >= FALLBACK_CHUNK_THRESHOLD ? scoredChunks : validChunks;
            
            for (const chunk of chunksToSynthesize) {
                if (!chunk) continue;
                const docName = chunk.docName || 'Documentazione scientifica';
                if (!docGroups[docName]) {
                    docGroups[docName] = [];
                }
                
                const text = chunk.text || '';
                const sentences = this.splitIntoSentences(text);
                for (const sentence of sentences) {
                    docGroups[docName].push(sentence);
                    allSentencesList.push({ docName, sentence });
                    
                    // Extract parameters/metrics
                    const metrics = this.extractMetrics(sentence);
                    metrics.forEach(m => allMetrics.add(m));
                }
            }
            
            const synthesizedDocs = [];
            const collectedMechanisms = [];
            const collectedTakeaways = [];
            const keyExplanations = [];

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
                
                // Identify sentences with high informational relevance
                let filtered = uniqueSentences.filter((s, idx) => {
                    if (idx === 0) return true;
                    if (this.containsQueryKeywords(s, keywords)) return true;
                    if (this.containsMetrics(s)) return true;
                    return false;
                });
                
                if (filtered.length === 0) {
                    filtered = uniqueSentences;
                }

                // Analyze concepts inside sentences for mechanisms and takeaways
                for (const s of uniqueSentences) {
                    const topic = this.classifyTopicDomain(s);
                    const cleanSentence = this.cleanSentenceProposition(s);

                    if (topic === 'mechanism') {
                        if (cleanSentence.length > MIN_PROPOSITION_LENGTH && !collectedMechanisms.includes(cleanSentence)) {
                            collectedMechanisms.push(cleanSentence);
                        }
                    } else if (topic === 'takeaway') {
                        if (cleanSentence.length > MIN_PROPOSITION_LENGTH && !collectedTakeaways.includes(cleanSentence)) {
                            collectedTakeaways.push(cleanSentence);
                        }
                    }

                    if (this.containsQueryKeywords(s, keywords) && cleanSentence.length > MIN_PROPOSITION_LENGTH && !keyExplanations.includes(cleanSentence)) {
                        keyExplanations.push(cleanSentence);
                    }
                }
                
                synthesizedDocs.push({
                    docName: docName,
                    sentences: filtered
                });
            }

            // Build a cohesive Executive Summary paragraph using MMR
            const candidateSentences = keyExplanations.length > 0
                ? keyExplanations
                : allSentencesList.map(x => this.cleanSentenceProposition(x.sentence));
            const executiveSummary = this.buildExecutiveSummary(candidateSentences, keywords, MAX_EXECUTIVE_SUMMARY_SENTENCES);
            
            return {
                documents: synthesizedDocs,
                executiveSummary: executiveSummary,
                mechanisms: collectedMechanisms.slice(0, MAX_COLLECTED_MECHANISMS),
                takeaways: collectedTakeaways.slice(0, MAX_COLLECTED_TAKEAWAYS),
                metrics: Array.from(allMetrics),
                keywords: keywords
            };
        }

        /**
         * Classifica una frase in un dominio tematico (meccanismo, takeaway, definizione, dato, altro)
         * mediante dizionario bilingue IT/EN strutturato.
         * @param {string} sentence - Frase da classificare
         * @returns {'mechanism'|'takeaway'|'definition'|'data'|'other'} Dominio tematico identificato
         */
        classifyTopicDomain(sentence) {
            if (!sentence) return 'other';
            const s = sentence.toLowerCase();

            const MECHANISM_TERMS = [
                // IT
                'anaerob', 'aerob', 'lattat', 'energia', 'metabol', 'atp', 'fosfagen',
                'glicolis', 'neuromuscolar', 'fibra', 'reclutamento', 'forza-velocit',
                'potenza', 'vo2', 'soglia', 'meccanic', 'ipertrofi', 'adattamento', 'tensione',
                // EN
                'anaerobic', 'aerobic', 'lactate', 'energy', 'metabolic', 'phosphagen',
                'glycolysis', 'neuromuscular', 'fiber', 'recruitment', 'force-velocity',
                'power', 'threshold', 'mechanism', 'hypertrophy', 'adaptation', 'tension'
            ];

            const TAKEAWAY_TERMS = [
                // IT
                'scarico', 'recupero', 'consigli', 'ripetizioni', 'serie', 'volume',
                'intensit', 'progressione', 'protocollo', 'allenamento', 'esecuzion',
                'frequenza', 'pacing', 'strategia', 'raccomand',
                // EN
                'rest', 'recovery', 'recommendation', 'repetitions', 'sets', 'volume',
                'intensity', 'progression', 'protocol', 'training', 'execution', 'frequency',
                'pacing', 'strategy', 'guideline'
            ];

            const DEFINITION_TERMS = [
                // IT & EN
                'definiz', 'è un', 'si definisce', 'consiste', 'indica', 'riferisce',
                'is defined', 'refers to', 'consists of', 'means', 'describes'
            ];

            if (MECHANISM_TERMS.some(t => s.includes(t))) return 'mechanism';
            if (TAKEAWAY_TERMS.some(t => s.includes(t))) return 'takeaway';
            if (DEFINITION_TERMS.some(t => s.includes(t))) return 'definition';
            if (this.containsMetrics(sentence)) return 'data';
            return 'other';
        }

        /**
         * Seleziona proposizioni usando MMR (Maximal Marginal Relevance) semplificata:
         * massimizza la rilevanza rispetto alle parole chiave e la diversità lessicale tra frasi.
         * @param {string[]} candidates - Frasi candidate per il sommario
         * @param {string[]} keywords - Parole chiave estratte dalla query
         * @param {number} [maxSentences=MAX_EXECUTIVE_SUMMARY_SENTENCES] - Numero massimo di frasi nel sommario
         * @returns {string} Paragrafo esecutivo coerente
         */
        buildExecutiveSummary(candidates, keywords = [], maxSentences = MAX_EXECUTIVE_SUMMARY_SENTENCES) {
            if (!candidates || candidates.length === 0) {
                return 'Le evidenze scientifiche estratte forniscono linee guida per la query selezionata.';
            }

            const selected = [];
            const remaining = [...candidates].filter(s => typeof s === 'string' && s.trim().length > 0);
            if (remaining.length === 0) {
                return 'Le evidenze scientifiche estratte forniscono linee guida per la query selezionata.';
            }

            const kwList = Array.isArray(keywords) ? keywords : [];

            while (selected.length < maxSentences && remaining.length > 0) {
                let bestIdx = 0;
                let bestScore = -Infinity;

                remaining.forEach((sentence, idx) => {
                    const sLower = sentence.toLowerCase();

                    // Rilevanza rispetto alle keyword
                    const kwMatchCount = kwList.filter(kw => sLower.includes(kw)).length;
                    const relevanceScore = kwList.length > 0 ? (kwMatchCount / kwList.length) : DEFAULT_RELEVANCE_SCORE;

                    // Diversità lessicale rispetto alle frasi già selezionate
                    const selectedWords = new Set(selected.flatMap(s => s.toLowerCase().split(/\s+/)));
                    const candidateWords = sLower.split(/\s+/);
                    const newWords = candidateWords.filter(w => !selectedWords.has(w)).length;
                    const diversityScore = candidateWords.length > 0 ? (newWords / candidateWords.length) : 1;

                    // Score combinato MMR
                    const combinedScore = (MMR_RELEVANCE_WEIGHT * relevanceScore) + (MMR_DIVERSITY_WEIGHT * diversityScore);
                    if (combinedScore > bestScore) {
                        bestScore = combinedScore;
                        bestIdx = idx;
                    }
                });

                selected.push(remaining[bestIdx]);
                remaining.splice(bestIdx, 1);
            }

            return selected.join(' ');
        }

        /**
         * Clean text proposition from table artifacts and broken delimiters.
         */
        cleanSentenceProposition(text) {
            if (!text) return "";
            let clean = text.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
            // Remove orphan table numbers, e.g. "Fonti 3 3 3 II."
            clean = clean.replace(/Fonti\s+\d+(\s+\d+)*\s*(II|III|IV|V)?\.?/gi, '');
            clean = clean.replace(/\[\d+\]/g, ''); // remove citation brackets like [1]
            clean = clean.replace(/\|\s*/g, ' - '); // clean table pipes
            clean = clean.replace(/\s{2,}/g, ' ').trim();
            return clean;
        }

        /**
         * Helper to split text into clean sentences.
         */
        splitIntoSentences(text) {
            if (!text) return [];
            // Clean newlines but preserve paragraph stops
            const clean = text.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
            // Split by sentence punctuation (.!?) followed by space and uppercase letter/number
            const rawSentences = clean.split(/(?<=[.!?])\s+(?=[A-Z0-9\u00C0-\u00DC])/g);
            return rawSentences.map(s => this.cleanSentenceProposition(s)).filter(s => s.length > 5);
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
            return (query || '').toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_\x60~()?]/g, "")
                .split(/\s+/)
                .filter(word => word.length > 1 && !stopWords.has(word));
        }

        /**
         * Verify if a sentence contains any query keywords.
         */
        containsQueryKeywords(sentence, keywords) {
            if (!sentence) return false;
            if (!keywords || keywords.length === 0) return true;
            const lower = sentence.toLowerCase();
            return keywords.some(kw => lower.includes(kw));
        }

        /**
         * Check if sentence contains physical parameters.
         */
        containsMetrics(text) {
            if (!text) return false;
            const metricRegex = /\b\d+(?:[\.,]\d+)?\s*(?:%|kg\b|kilogrammi\b|chili\b|m\/s|m·s\^-1|ripetizioni\b|rip\b|reps\b|serie\b|set\b|sec\b|secondi\b|min\b|minuti\b|watt\b|w\b|hz|hertz\b|rm\b|cm\b|metri\b|m\b)|\brpe\s*\d+(?:[\.,]\d+)?\b/i;
            return metricRegex.test(text);
        }

        /**
         * Extract matching physical parameters/metrics.
         */
        extractMetrics(text) {
            if (!text) return [];
            const combinedRegex = /\b\d+(?:[\.,]\d+)?\s*(?:%|kg\b|kilogrammi\b|chili\b|m\/s|m·s\^-1|ripetizioni\b|rip\b|reps\b|serie\b|set\b|sec\b|secondi\b|min\b|minuti\b|watt\b|w\b|hz|hertz\b|rm\b|cm\b|metri\b|m\b)|\brpe\s*\d+(?:[\.,]\d+)?\b/gi;
            const matches = text.match(combinedRegex) || [];
            return [...new Set(matches.map(m => m.replace(/\s+/g, ' ').trim()))];
        }

        /**
         * Highlight query keywords inside a block of text.
         */
        highlightKeywords(text, keywords) {
            if (!text) return '';
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


        async loadDocuments() {
            const listContainer = this.container.querySelector('#doc-list-container');
            const countBadge = this.container.querySelector('#rag-doc-count-badge');
            if (!listContainer) return;

            try {
                if (!window.RAGEngine || !window.RAGEngine.dbPromise) {
                    listContainer.innerHTML = '<p class="empty-list-msg" style="font-size: 0.8rem; padding: 0.5rem 0;">RAG Engine non pronto.</p>';
                    if (countBadge) countBadge.textContent = '0';
                    return;
                }

                const db = await window.RAGEngine.dbPromise;
                const docs = await new Promise((resolve, reject) => {
                    const transaction = db.transaction(['documents'], 'readonly');
                    const store = transaction.objectStore('documents');
                    const request = store.getAll();
                    request.onsuccess = (e) => resolve(e.target.result || []);
                    request.onerror = (e) => reject(e.target.error);
                });

                if (countBadge) {
                    countBadge.textContent = String(docs.length);
                }

                if (docs.length === 0) {
                    listContainer.innerHTML = '<p class="empty-list-msg" style="font-size: 0.8rem; padding: 0.5rem 0;">Nessun documento caricato nella Knowledge Base.</p>';
                    return;
                }

                listContainer.innerHTML = docs.map(doc => {
                    const docId = doc.id || '';
                    const name = doc.name || 'Senza nome';
                    const fileType = doc.fileType || 'N/A';
                    const chunkCount = typeof doc.chunkCount === 'number' ? doc.chunkCount : 0;
                    const dateStr = doc.addedAt ? new Date(doc.addedAt).toLocaleDateString('it-IT') : 'N/A';

                    const metaText = `
                        <span class="dev-only">${fileType} • ${chunkCount} frammenti • Caricato il ${dateStr}</span>
                        <span class="user-only">${fileType} • Pronto • Caricato il ${dateStr}</span>
                    `;

                    return `
                        <div class="doc-item">
                            <div class="doc-info">
                                <span class="doc-name">${name}</span>
                                <span class="doc-meta">${metaText}</span>
                            </div>
                            <button class="btn-delete" data-id="${docId}">Elimina</button>
                        </div>
                    `;
                }).join('');

                listContainer.querySelectorAll('.btn-delete').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const docId = e.target.dataset.id;
                        if (docId) {
                            if (confirm("Sei sicuro di voler eliminare questo documento e tutti i frammenti associati?")) {
                                try {
                                    await window.RAGEngine.deleteDocument(docId);
                                    await this.loadDocuments();
                                } catch (err) {
                                    alert("Errore durante l'eliminazione: " + err.message);
                                }
                            }
                        }
                    });
                });
            } catch (err) {
                console.error("Failed to load documents in RAG UI:", err);
                listContainer.innerHTML = '<p class="empty-list-msg" style="color: var(--danger);">Errore nel caricamento dei documenti.</p>';
            }
        }

        handleFiles(files) {
            for (let i = 0; i < files.length; i++) {
                this.uploadQueue.push(files[i]);
            }
            this.processNextFile();
        }

        async processNextFile() {
            if (this.isProcessing || this.uploadQueue.length === 0) return;

            this.isProcessing = true;
            const file = this.uploadQueue.shift();

            const progressContainer = this.container.querySelector('#upload-progress-container');
            const filenameEl = this.container.querySelector('#upload-filename');
            const percentageEl = this.container.querySelector('#upload-percentage');
            const progressBar = this.container.querySelector('#upload-progress-bar');
            const statusText = this.container.querySelector('#upload-status-text');
            const logsEl = this.container.querySelector('#dev-progress-logs');

            progressContainer.classList.remove('hidden');
            filenameEl.textContent = file.name || 'File';
            percentageEl.textContent = '0%';
            progressBar.style.width = '0%';

            this.currentStepKey = 'init';
            statusText.textContent = this.getStepText('init');

            const addLog = (msg) => {
                console.log(msg);
            };

            addLog(`Inizio elaborazione per: ${file.name}`);

            const updateProgress = (pct, stepKeyOrText) => {
                percentageEl.textContent = `${pct}%`;
                progressBar.style.width = `${pct}%`;
                if (stepKeyOrText) {
                    if (['init', 'read', 'extract', 'embed', 'save', 'done'].includes(stepKeyOrText)) {
                        this.currentStepKey = stepKeyOrText;
                        statusText.textContent = this.getStepText(stepKeyOrText);
                    } else {
                        statusText.textContent = stepKeyOrText;
                    }
                }
            };

            try {
                const ext = (file.name || '').split('.').pop().toUpperCase();
                let fileType = ext;
                if (ext === 'XLS') fileType = 'XLSX';
                if (ext === 'TEXT') fileType = 'TXT';

                if (!['PDF', 'XLSX', 'DOCX', 'TXT'].includes(fileType)) {
                    throw new Error(`Estensione .${ext} non supportata.`);
                }

                // Step 1: Read the file
                addLog(`Lettura file in corso (tipo: ${fileType})...`);
                updateProgress(15, 'read');
                const arrayBuffer = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(new Error("Errore durante la lettura del file."));
                    reader.readAsArrayBuffer(file);
                });
                addLog("File caricato in memoria.");

                // Step 2 & 3: Extraction and embeddings generation via Engine
                addLog("Elaborazione e indicizzazione semantica del documento...");
                updateProgress(35, 'extract');

                if (window.RAGEngine) {
                    window.RAGEngine.modelProgressCallback = (data) => {
                        if (data.status === 'downloading') {
                            const fileName = data.file || '';
                            const progress = typeof data.progress === 'number' ? Math.round(data.progress) : 0;
                            const wrap = this.container.querySelector('.rag-ui-wrapper');
                            const isDev = wrap && wrap.classList.contains('dev-mode-active');
                            
                            const msg = isDev
                                ? `Download modello: ${fileName} (${progress}%)`
                                : `Scaricamento componenti AI locali... (${progress}%)`;
                            
                            // Scale the progress from 40% to 75% of the overall progress bar
                            const scaledProgress = Math.min(75, Math.round(40 + (progress * 0.35)));
                            updateProgress(scaledProgress, msg);
                            
                            addLog(`Scaricamento file modello (${fileName}): ${progress}%`);
                        } else if (data.status === 'done') {
                            addLog(`Scaricamento completato per: ${data.file || ''}`);
                        } else if (data.status === 'ready') {
                            addLog(`Modello caricato correttamente.`);
                        }
                    };
                }

                await window.RAGEngine.addDocument(file.name, fileType, arrayBuffer, (pct, step) => {
                    updateProgress(pct, step);
                    if (step === 'extract') addLog("Estrazione del testo dal documento...");
                    if (step === 'embed') addLog("Generazione vettori di embedding locali...");
                    if (step === 'save') addLog("Salvataggio documento e indici in IndexedDB...");
                });
                
                addLog("Documento registrato nel database locale.");
                updateProgress(100, 'done');
                addLog("Indicizzazione completata con successo!");

                progressContainer.classList.add('hidden');
                await this.loadDocuments();
            } catch (err) {
                console.error("Error processing file in RAG UI:", err);
                console.error(`ERRORE: ${err.message}`);
                alert(`Errore durante il caricamento di "${file.name}": ` + err.message);
                progressContainer.classList.add('hidden');
            } finally {
                if (window.RAGEngine) {
                    window.RAGEngine.modelProgressCallback = null;
                }
                this.isProcessing = false;
                this.processNextFile();
            }
        }
    }

    window.RAGUI = RAGUI;
})();
