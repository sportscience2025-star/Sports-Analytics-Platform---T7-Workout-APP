/**
 * wizard-swap.js
 * ═══════════════════════════════════════════════════════════════════
 * Sistema interattivo di gestione esercizi per il preparatore atletico.
 * Permette di Modificare, Eliminare e Sostituire (Swap) esercizi nel programma
 * generato dall'AI, trasformando la scheda da visualizzazione statica a strumento
 * di lavoro interattivo.
 *
 * FUNZIONALITA':
 *   1. Menu contestuale su click/tap di ogni esercizio (Modifica / Elimina / Swap)
 *   2. Pannello Swap con ricerca nel catalogo + suggerimenti AI
 *   3. Modifica inline delle specifiche esercizio (serie, reps, carico, RPE, rest, tempo)
 *   4. Eliminazione con sistema Undo (toast "Annulla" per 5 secondi)
 *   5. Persistenza automatica delle modifiche in localStorage
 *
 * FUNZIONI ESPOSTE (via window.App.SwapManager):
 *   .init(container, result)                  -> Inizializza il sistema sul container del report
 *   .openContextMenu(btn, exData)             -> Mostra menu contestuale posizionato
 *   .openSwapPanel(targetEx, ctxData)         -> Apre pannello swap con AI suggestions
 *   .openEditPanel(targetEx, ctxData)         -> Apre modal modifica specifiche
 *   .deleteExercise(targetEx, ctxData)        -> Rimuove esercizio con supporto undo
 *   .applySwap(oldEx, newEx, ctxData)         -> Sostituisce esercizio nel programma
 *   .cleanup()                                -> Rimuove listener ed elementi modali DOM
 *
 * DIPENDENZE:
 *   - window.App.getExercises()
 *   - window.App.inferMovementPattern()
 *   - window.AI.suggestSwapAlternatives()
 *   - window.App.ResultBuilder.buildPhaseContentHtml()
 *   - window.App.saveProgramState()
 *   - window.escapeHTML()
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};
    window.App.SwapManager = window.App.SwapManager || {};

    const UNDO_STACK_MAX = 10;
    const UNDO_TOAST_DURATION_MS = 5000;
    const MAX_CATALOG_SEARCH_RESULTS = 10;
    const CONTEXT_MENU_OFFSET_PX = 4;
    const CONTEXT_MENU_MIN_WIDTH_PX = 200;
    const VIEWPORT_PADDING_PX = 8;
    const ESTIMATED_MENU_HEIGHT_PX = 150;

    let _activeContainer = null;
    let _activeResult = null;
    let _targetContext = null;
    let _undoStack = [];
    let _undoTimeoutId = null;

    let _contextMenuEl = null;
    let _swapPanelEl = null;
    let _editModalEl = null;
    let _undoToastEl = null;

    /**
     * Sanitizza una stringa per output HTML sicuro
     * @param {string} str - Stringa di input
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
     * Assicura la creazione degli elementi DOM di supporto (menu contestuale, modali, toast)
     * nel body del documento.
     * @returns {void}
     */
    function ensureDOMElements() {
        // 1. Menu Contestuale
        if (!document.getElementById('ex-context-menu')) {
            _contextMenuEl = document.createElement('div');
            _contextMenuEl.id = 'ex-context-menu';
            _contextMenuEl.className = 'ex-context-menu hidden';
            _contextMenuEl.setAttribute('role', 'menu');
            _contextMenuEl.innerHTML = `
                <button type="button" class="ecm-item" data-action="edit">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifica
                </button>
                <button type="button" class="ecm-item ecm-swap" data-action="swap">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="17 1 21 5 17 9"/>
                        <path d="M3 11V9a4 4 0 014-4h14"/>
                        <polyline points="7 23 3 19 7 15"/>
                        <path d="M21 13v2a4 4 0 01-4 4H3"/>
                    </svg>
                    Swap / Sostituisci
                </button>
                <div class="ecm-divider"></div>
                <button type="button" class="ecm-item ecm-danger" data-action="delete">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                    Elimina
                </button>
            `;
            document.body.appendChild(_contextMenuEl);

            _contextMenuEl.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const action = btn.dataset.action;
                closeContextMenu();

                if (!_targetContext) return;

                if (action === 'edit') {
                    window.App.SwapManager.openEditPanel(_targetContext.exercise, _targetContext);
                } else if (action === 'delete') {
                    window.App.SwapManager.deleteExercise(_targetContext.exercise, _targetContext);
                } else if (action === 'swap') {
                    window.App.SwapManager.openSwapPanel(_targetContext.exercise, _targetContext);
                }
            });
        } else {
            _contextMenuEl = document.getElementById('ex-context-menu');
        }

        // 2. Swap Panel Modale
        if (!document.getElementById('swap-panel')) {
            _swapPanelEl = document.createElement('div');
            _swapPanelEl.id = 'swap-panel';
            _swapPanelEl.className = 'swap-panel-overlay hidden';
            _swapPanelEl.innerHTML = `
                <div class="swap-panel-box">
                    <div class="sp-header">
                        <h3>Sostituisci Esercizio</h3>
                        <button type="button" class="sp-close" id="sp-close-btn">&times;</button>
                    </div>
                    <div class="sp-current">
                        <span class="sp-label">Sostituendo:</span>
                        <strong id="sp-current-name"></strong>
                    </div>
                    <div class="sp-body-scroll">
                        <!-- AI SUGGESTIONS -->
                        <div class="sp-ai-section">
                            <div class="sp-ai-header">
                                <span class="sp-ai-badge">Alternative consigliate dall'AI</span>
                            </div>
                            <div class="sp-ai-list" id="sp-ai-list"></div>
                        </div>

                        <!-- MANUAL SEARCH -->
                        <div class="sp-search-section">
                            <span class="sp-label">Oppure cerca nel catalogo completo</span>
                            <input type="text" id="sp-search-input" class="sp-search-input" placeholder="Cerca per nome esercizio...">
                            <div class="sp-search-results" id="sp-search-results"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(_swapPanelEl);

            _swapPanelEl.querySelector('#sp-close-btn').addEventListener('click', closeSwapPanel);
            _swapPanelEl.addEventListener('click', (e) => {
                if (e.target === _swapPanelEl) closeSwapPanel();
            });

            // Ricerca manuale catalogo con debounce semplice
            const searchInput = _swapPanelEl.querySelector('#sp-search-input');
            searchInput.addEventListener('input', () => {
                handleCatalogSearch(searchInput.value.trim());
            });
        } else {
            _swapPanelEl = document.getElementById('swap-panel');
        }

        // 3. Edit Modal
        if (!document.getElementById('edit-ex-modal')) {
            _editModalEl = document.createElement('div');
            _editModalEl.id = 'edit-ex-modal';
            _editModalEl.className = 'edit-modal-overlay hidden';
            _editModalEl.innerHTML = `
                <div class="edit-modal-box">
                    <div class="edit-modal-header">
                        <h3 id="edit-modal-title">Modifica Esercizio</h3>
                        <button type="button" class="sp-close" id="edit-modal-close">&times;</button>
                    </div>
                    <form id="edit-specs-form">
                        <div class="edit-grid">
                            <div class="edit-field">
                                <label for="edit-sets">Serie</label>
                                <input type="number" id="edit-sets" min="1" max="10" required>
                            </div>
                            <div class="edit-field">
                                <label for="edit-reps">Reps</label>
                                <input type="text" id="edit-reps" required>
                            </div>
                            <div class="edit-field">
                                <label for="edit-load">Carico</label>
                                <input type="text" id="edit-load" required>
                            </div>
                            <div class="edit-field">
                                <label for="edit-rpe">RPE</label>
                                <input type="number" id="edit-rpe" min="1" max="10" step="0.5" required>
                            </div>
                            <div class="edit-field">
                                <label for="edit-rest">Rest</label>
                                <input type="text" id="edit-rest" required>
                            </div>
                            <div class="edit-field">
                                <label for="edit-tempo">Tempo</label>
                                <input type="text" id="edit-tempo" required>
                            </div>
                        </div>
                        <div class="edit-modal-actions">
                            <button type="button" class="btn-cancel-edit" id="btn-cancel-edit">Annulla</button>
                            <button type="submit" class="btn-save-edit">Salva Modifiche</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(_editModalEl);

            _editModalEl.querySelector('#edit-modal-close').addEventListener('click', closeEditModal);
            _editModalEl.querySelector('#btn-cancel-edit').addEventListener('click', closeEditModal);
            _editModalEl.addEventListener('click', (e) => {
                if (e.target === _editModalEl) closeEditModal();
            });

            _editModalEl.querySelector('#edit-specs-form').addEventListener('submit', (e) => {
                e.preventDefault();
                saveEditModalValues();
            });
        } else {
            _editModalEl = document.getElementById('edit-ex-modal');
        }

        // 4. Undo Toast
        if (!document.getElementById('undo-toast')) {
            _undoToastEl = document.createElement('div');
            _undoToastEl.id = 'undo-toast';
            _undoToastEl.className = 'undo-toast hidden';
            _undoToastEl.innerHTML = `
                <span class="undo-toast-msg" id="undo-toast-msg"></span>
                <button type="button" class="undo-toast-btn" id="undo-toast-btn">Annulla</button>
            `;
            document.body.appendChild(_undoToastEl);

            _undoToastEl.querySelector('#undo-toast-btn').addEventListener('click', () => {
                undoLast();
            });
        } else {
            _undoToastEl = document.getElementById('undo-toast');
        }
    }

    /**
     * Chiude il menu contestuale
     */
    function closeContextMenu() {
        if (_contextMenuEl) {
            _contextMenuEl.classList.add('hidden');
        }
    }

    /**
     * Chiude il pannello swap
     */
    function closeSwapPanel() {
        if (_swapPanelEl) {
            _swapPanelEl.classList.add('hidden');
        }
        _targetContext = null;
    }

    /**
     * Chiude la modale di modifica
     */
    function closeEditModal() {
        if (_editModalEl) {
            _editModalEl.classList.add('hidden');
        }
    }

    /**
     * Gestisce la ricerca testuale nel catalogo esercizi
     * @param {string} query - Testo di ricerca
     */
    function handleCatalogSearch(query) {
        const resultsEl = _swapPanelEl.querySelector('#sp-search-results');
        if (!resultsEl) return;

        if (!query || query.length < 2) {
            resultsEl.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem 0;">Digita almeno 2 caratteri per cercare...</div>';
            return;
        }

        const allExercises = (window.App && typeof window.App.getExercises === 'function')
            ? window.App.getExercises()
            : [];

        const lowerQuery = query.toLowerCase();
        const currentExId = _targetContext?.exercise?.id;

        const matches = allExercises
            .filter(ex => ex && ex.name && ex.id !== currentExId && ex.name.toLowerCase().includes(lowerQuery))
            .slice(0, MAX_CATALOG_SEARCH_RESULTS);

        if (matches.length === 0) {
            resultsEl.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem 0;">Nessun esercizio trovato per "' + safeEscape(query) + '"</div>';
            return;
        }

        resultsEl.innerHTML = matches.map(ex => `
            <div class="sp-search-item" data-catalog-id="${safeEscape(ex.id)}">
                <div class="sp-search-item-info">
                    <span class="sp-search-item-name">${safeEscape(ex.name)}</span>
                    <span class="sp-search-item-sub">${safeEscape(ex.primaryMuscle || '')} &bull; ${safeEscape(ex.equipment || 'Corpo Libero')}</span>
                </div>
                <button type="button" class="sp-select-btn btn-choose-catalog" data-catalog-id="${safeEscape(ex.id)}">Seleziona</button>
            </div>
        `).join('');

        resultsEl.querySelectorAll('.btn-choose-catalog').forEach(btn => {
            btn.addEventListener('click', () => {
                const exId = btn.dataset.catalogId;
                const chosen = allExercises.find(e => e.id === exId);
                if (chosen && _targetContext) {
                    window.App.SwapManager.applySwap(_targetContext.exercise, chosen, _targetContext);
                }
            });
        });
    }

    /**
     * Salva i valori inseriti nella modale di modifica rapida delle specifiche
     */
    function saveEditModalValues() {
        if (!_targetContext || !_targetContext.exercise) return;

        const ex = _targetContext.exercise;
        const phase = _activeResult?.phases?.find(p => p.id == _targetContext.phaseId);
        const day = phase?.schedule?.[_targetContext.dayIndex];
        const previousExercises = day?.exercises ? JSON.parse(JSON.stringify(day.exercises)) : null;

        const setsVal = parseInt(document.getElementById('edit-sets').value, 10) || 3;
        const repsVal = document.getElementById('edit-reps').value.trim() || '10';
        const loadVal = document.getElementById('edit-load').value.trim() || 'A corpo libero';
        const rpeVal = parseFloat(document.getElementById('edit-rpe').value) || 7;
        const restVal = document.getElementById('edit-rest').value.trim() || '90s';
        const tempoVal = document.getElementById('edit-tempo').value.trim() || '2-0-2-0';

        ex.specs = ex.specs || {};
        ex.specs.sets = setsVal;
        ex.specs.reps = repsVal;
        ex.specs.load = loadVal;
        ex.specs.rpe = rpeVal;
        ex.specs.rest = restVal;
        ex.specs.tempo = tempoVal;

        // Persistenza
        if (window.App.saveProgramState) {
            window.App.saveProgramState(_activeResult);
        }

        // Aggiorna vista fase corrente
        refreshCurrentPhaseView(_targetContext.phaseId);

        closeEditModal();

        if (previousExercises && day) {
            pushUndo(`Modificato "${ex.name}"`, () => {
                day.exercises = JSON.parse(JSON.stringify(previousExercises));
                if (window.App.saveProgramState) {
                    window.App.saveProgramState(_activeResult);
                }
                refreshCurrentPhaseView(_targetContext.phaseId);
            });
        }
    }

    /**
     * Rigenera il contenuto della fase attiva nel container della programmazione
     * @param {number} phaseId - ID della fase da aggiornare
     */
    function refreshCurrentPhaseView(phaseId) {
        if (!_activeContainer || !_activeResult) return;
        const activePhaseContainer = _activeContainer.querySelector('#active-phase-container');
        if (!activePhaseContainer) return;

        const phase = _activeResult.phases.find(p => p.id === phaseId);
        if (phase && window.App.ResultBuilder && typeof window.App.ResultBuilder.buildPhaseContentHtml === 'function') {
            activePhaseContainer.innerHTML = window.App.ResultBuilder.buildPhaseContentHtml(phase, _activeResult);
        }
    }

    /**
     * Registra un'azione nello stack di rollback e mostra il toast temporizzato per l'annullamento
     * @param {string} actionLabel - Descrizione dell'azione da mostrare all'utente
     * @param {Function} restoreFn - Funzione di ripristino dello stato precedente
     */
    function pushUndo(actionLabel, restoreFn) {
        _undoStack.push({ actionLabel, restoreFn, timestamp: Date.now() });
        if (_undoStack.length > UNDO_STACK_MAX) {
            _undoStack.shift();
        }

        if (_undoToastEl) {
            _undoToastEl.querySelector('#undo-toast-msg').textContent = actionLabel;
            _undoToastEl.classList.remove('hidden');

            if (_undoTimeoutId) clearTimeout(_undoTimeoutId);
            _undoTimeoutId = setTimeout(() => {
                _undoToastEl.classList.add('hidden');
            }, UNDO_TOAST_DURATION_MS);
        }
    }

    /**
     * Esegue il rollback dell'ultima operazione effettuata
     */
    function undoLast() {
        if (_undoStack.length === 0) return;
        const entry = _undoStack.pop();
        if (_undoTimeoutId) clearTimeout(_undoTimeoutId);
        if (_undoToastEl) _undoToastEl.classList.add('hidden');

        if (typeof entry.restoreFn === 'function') {
            entry.restoreFn();
        }
    }

    /**
     * Gestore per chiudere il menu contestuale al click all'esterno
     * @param {MouseEvent} e - Evento click del mouse
     */
    /**
     * Gestore per chiudere il menu contestuale al click all'esterno
     * @param {MouseEvent} e - Evento click del mouse
     */
    function onDocumentClick(e) {
        if (_contextMenuEl && !_contextMenuEl.classList.contains('hidden')) {
            if (!_contextMenuEl.contains(e.target) && !e.target.closest('.ex-action-btn') && !e.target.closest('.ex-row-interactive')) {
                closeContextMenu();
            }
        }
    }

    /**
     * Gestore per la chiusura tramite tasto Escape di menu e finestre modali
     * @param {KeyboardEvent} e - Evento tastiera
     */
    function onDocumentKeyDown(e) {
        if (e.key === 'Escape') {
            closeContextMenu();
            closeSwapPanel();
            closeEditModal();
        }
    }

    /**
     * Gestore dei click delegati all'interno del container della programmazione
     * @param {MouseEvent} e - Evento click
     */
    function onContainerClick(e) {
        // Se il click è avvenuto sul bottone dettaglio esercizio, non aprire il menu contestuale
        if (e.target.closest('.btn-ex-detail')) return;

        // Cerca il bottone azione diretto o il bottone azione della riga cliccata
        const actionBtn = e.target.closest('.ex-action-btn') || e.target.closest('.ex-row-interactive')?.querySelector('.ex-action-btn');
        if (!actionBtn) return;
        e.stopPropagation();

        const phaseId = parseInt(actionBtn.dataset.phaseId, 10);
        const dayIndex = parseInt(actionBtn.dataset.dayIndex, 10);
        const globalIndex = parseInt(actionBtn.dataset.globalIndex, 10);
        const exId = actionBtn.dataset.exId;
        const exName = actionBtn.dataset.exName;

        const phase = _activeResult?.phases?.find(p => p.id == phaseId);
        const day = phase?.schedule?.[dayIndex];
        if (!day || !day.exercises) return;

        let exercise = day.exercises[globalIndex];
        if (!exercise || (exId && exercise.id !== exId && exercise.name !== exName)) {
            exercise = day.exercises.find(e => (exId && e.id === exId) || e.name === exName) || exercise;
        }

        if (!exercise) return;

        const resolvedIndex = day.exercises.indexOf(exercise);

        _targetContext = {
            phaseId: phaseId,
            dayIndex: dayIndex,
            globalIndex: resolvedIndex >= 0 ? resolvedIndex : globalIndex,
            exercise: exercise,
            exId: exId || exercise.id,
            exName: exName || exercise.name
        };

        window.App.SwapManager.openContextMenu(actionBtn, _targetContext);
    }

    /**
     * Inizializza il gestore interattivo Swap/Edit/Delete sul report del programma
     * @param {HTMLElement} container - Elemento contenitore del report
     * @param {Object} result - Oggetto programma generato dall'IA
     * @returns {void}
     */
    window.App.SwapManager.init = function (container, result) {
        _activeContainer = container;
        _activeResult = result;

        ensureDOMElements();

        document.removeEventListener('click', onDocumentClick);
        document.addEventListener('click', onDocumentClick);

        document.removeEventListener('keydown', onDocumentKeyDown);
        document.addEventListener('keydown', onDocumentKeyDown);

        if (_activeContainer) {
            _activeContainer.removeEventListener('click', onContainerClick);
            _activeContainer.addEventListener('click', onContainerClick);
        }
    };

    /**
     * Mostra il menu contestuale posizionato vicino al bottone d'azione cliccato.
     * Poiché .ex-context-menu è a posizionamento fisso (position: fixed),
     * vengono utilizzate coordinate viewport (senza window.scrollY/scrollX)
     * e viene controllata l'eventuale fuoriuscita dallo schermo.
     * @param {HTMLElement} btn - Bottone cliccato
     * @param {Object} ctxData - Dati contestuali dell'esercizio
     */
    window.App.SwapManager.openContextMenu = function (btn, ctxData) {
        if (!_contextMenuEl) return;
        _targetContext = ctxData;

        const rect = btn.getBoundingClientRect();
        const menuHeight = _contextMenuEl.offsetHeight || ESTIMATED_MENU_HEIGHT_PX;
        const menuWidth = _contextMenuEl.offsetWidth || CONTEXT_MENU_MIN_WIDTH_PX;

        // Se lo spazio sotto il bottone è insufficiente, apri sopra il bottone
        let top = rect.bottom + CONTEXT_MENU_OFFSET_PX;
        if (top + menuHeight > window.innerHeight - VIEWPORT_PADDING_PX) {
            top = Math.max(VIEWPORT_PADDING_PX, rect.top - menuHeight - CONTEXT_MENU_OFFSET_PX);
        }

        // Limita l'uscita orizzontale a destra e a sinistra dello schermo
        let left = rect.left;
        if (left + menuWidth > window.innerWidth - VIEWPORT_PADDING_PX) {
            left = Math.max(VIEWPORT_PADDING_PX, window.innerWidth - menuWidth - VIEWPORT_PADDING_PX);
        }

        _contextMenuEl.style.top = Math.round(top) + 'px';
        _contextMenuEl.style.left = Math.round(left) + 'px';
        _contextMenuEl.classList.remove('hidden');
    };

    /**
     * Apre il pannello di sostituzione (Swap) con alternative AI e ricerca catalogo
     * @param {Object} targetEx - Esercizio da sostituire
     * @param {Object} ctxData - Dati contestuali dell'esercizio
     */
    window.App.SwapManager.openSwapPanel = function (targetEx, ctxData) {
        ensureDOMElements();
        _targetContext = ctxData;

        _swapPanelEl.querySelector('#sp-current-name').textContent = targetEx.name || '';
        const searchInput = _swapPanelEl.querySelector('#sp-search-input');
        if (searchInput) searchInput.value = '';

        const searchResultsEl = _swapPanelEl.querySelector('#sp-search-results');
        if (searchResultsEl) searchResultsEl.innerHTML = '';

        // Calcola suggerimenti AI
        const aiListEl = _swapPanelEl.querySelector('#sp-ai-list');
        let suggestions = [];

        if (window.AI && typeof window.AI.suggestSwapAlternatives === 'function') {
            const context = {
                params: _activeResult.meta || {},
                riskProfile: {
                    level: _activeResult.meta?.riskLevel || 'LOW',
                    pathologies: (_activeResult.meta?.pathologyNames || []).map(name => ({ name }))
                }
            };
            suggestions = window.AI.suggestSwapAlternatives(targetEx, context);
        }

        if (suggestions.length === 0) {
            aiListEl.innerHTML = `
                <div style="font-size:0.85rem; color:var(--text-secondary); padding: 0.5rem 0;">
                    Nessun esercizio alternativo con punteggio sufficiente trovato. Usa la ricerca nel catalogo qui sotto.
                </div>
            `;
        } else {
            aiListEl.innerHTML = suggestions.map(({ exercise: ex, reason }) => `
                <div class="sp-ai-item" data-ex-id="${safeEscape(ex.id)}">
                    <div>
                        <div class="sp-ai-item-name">${safeEscape(ex.name)}</div>
                        <div class="sp-ai-item-reason">${safeEscape(reason)}</div>
                    </div>
                    <button type="button" class="sp-select-btn btn-choose-ai" data-ex-id="${safeEscape(ex.id)}">Seleziona</button>
                </div>
            `).join('');

            aiListEl.querySelectorAll('.btn-choose-ai').forEach(btn => {
                btn.addEventListener('click', () => {
                    const chosenId = btn.dataset.exId;
                    const allExercises = (window.App && typeof window.App.getExercises === 'function')
                        ? window.App.getExercises()
                        : [];
                    const chosen = allExercises.find(e => e.id === chosenId);
                    if (chosen && _targetContext) {
                        window.App.SwapManager.applySwap(_targetContext.exercise, chosen, _targetContext);
                    }
                });
            });
        }

        _swapPanelEl.classList.remove('hidden');
    };

    /**
     * Apre la modale per la modifica diretta delle specifiche di carico dell'esercizio
     * @param {Object} targetEx - Esercizio da modificare
     * @param {Object} ctxData - Dati contestuali dell'esercizio
     */
    window.App.SwapManager.openEditPanel = function (targetEx, ctxData) {
        ensureDOMElements();
        _targetContext = ctxData;

        const specs = targetEx.specs || {};
        document.getElementById('edit-modal-title').textContent = 'Modifica: ' + (targetEx.name || 'Esercizio');
        document.getElementById('edit-sets').value = specs.sets !== undefined ? specs.sets : 3;
        document.getElementById('edit-reps').value = specs.reps || '10';
        document.getElementById('edit-load').value = specs.load || 'A corpo libero';
        document.getElementById('edit-rpe').value = specs.rpe !== undefined ? specs.rpe : 7;
        document.getElementById('edit-rest').value = specs.rest || '90s';
        document.getElementById('edit-tempo').value = specs.tempo || '2-0-2-0';

        _editModalEl.classList.remove('hidden');
    };

    /**
     * Rimuove un esercizio dal programma e registra l'operazione nello stack undo con snapshot immutabile
     * @param {Object} targetEx - Esercizio da eliminare
     * @param {Object} ctxData - Dati contestuali dell'esercizio
     */
    window.App.SwapManager.deleteExercise = function (targetEx, ctxData) {
        const phase = _activeResult?.phases?.find(p => p.id == ctxData.phaseId);
        const day = phase?.schedule?.[ctxData.dayIndex];
        if (!day || !day.exercises) return;

        // Cattura snapshot completo dell'elenco esercizi del giorno per ripristino sicuro
        const previousExercises = JSON.parse(JSON.stringify(day.exercises));

        let indexToRemove = ctxData.globalIndex;
        if (day.exercises[indexToRemove] !== targetEx) {
            indexToRemove = day.exercises.findIndex(e => e === targetEx || (targetEx.id && e.id === targetEx.id) || e.name === targetEx.name);
        }
        if (indexToRemove < 0) return;

        const removedEx = day.exercises.splice(indexToRemove, 1)[0];
        if (!removedEx) return;

        // Persistenza
        if (window.App.saveProgramState) {
            window.App.saveProgramState(_activeResult);
        }

        // Aggiorna UI
        refreshCurrentPhaseView(ctxData.phaseId);

        // Registra operazione di rollback (Undo)
        pushUndo(`Esercizio "${removedEx.name}" eliminato`, () => {
            day.exercises = JSON.parse(JSON.stringify(previousExercises));
            if (window.App.saveProgramState) {
                window.App.saveProgramState(_activeResult);
            }
            refreshCurrentPhaseView(ctxData.phaseId);
        });
    };

    /**
     * Sostituisce un esercizio con un nuovo esercizio selezionato dal catalogo o da suggerimento AI
     * @param {Object} oldEx - Esercizio originale
     * @param {Object} newEx - Nuovo esercizio selezionato
     * @param {Object} ctxData - Dati contestuali dell'esercizio
     */
    window.App.SwapManager.applySwap = function (oldEx, newEx, ctxData) {
        const phase = _activeResult?.phases?.find(p => p.id == ctxData.phaseId);
        const day = phase?.schedule?.[ctxData.dayIndex];
        if (!day || !day.exercises) return;

        // Cattura snapshot completo dell'elenco esercizi del giorno per ripristino sicuro
        const previousExercises = JSON.parse(JSON.stringify(day.exercises));

        let targetIndex = ctxData.globalIndex;
        if (day.exercises[targetIndex] !== oldEx) {
            targetIndex = day.exercises.findIndex(e => e === oldEx || (oldEx.id && e.id === oldEx.id) || e.name === oldEx.name);
        }
        if (targetIndex < 0) return;

        const swappedExercise = {
            id: newEx.id || ('swp_' + Date.now()),
            name: newEx.name,
            primaryMuscle: newEx.primaryMuscle || oldEx.primaryMuscle || 'Gambe',
            type: newEx.type || oldEx.type || 'Multiarticolare',
            isWarmup: false,
            isCardio: false,
            isadapted: false,
            specs: {
                sets: (oldEx.specs && oldEx.specs.sets !== undefined) ? oldEx.specs.sets : 3,
                reps: (oldEx.specs && oldEx.specs.reps) || '10',
                load: (oldEx.specs && oldEx.specs.load) || 'Carico moderato',
                rpe: (oldEx.specs && oldEx.specs.rpe !== undefined) ? oldEx.specs.rpe : 7,
                rest: (oldEx.specs && oldEx.specs.rest) || '90s',
                tempo: (oldEx.specs && oldEx.specs.tempo) || '2-0-2-0'
            },
            note: ''
        };

        day.exercises[targetIndex] = swappedExercise;

        // Persistenza
        if (window.App.saveProgramState) {
            window.App.saveProgramState(_activeResult);
        }

        closeSwapPanel();

        // Aggiorna UI
        refreshCurrentPhaseView(ctxData.phaseId);

        // Registra operazione di rollback (Undo)
        pushUndo(`Sostituito con "${newEx.name}"`, () => {
            day.exercises = JSON.parse(JSON.stringify(previousExercises));
            if (window.App.saveProgramState) {
                window.App.saveProgramState(_activeResult);
            }
            refreshCurrentPhaseView(ctxData.phaseId);
        });
    };

    /**
     * Rimuove elementi DOM e listener al cambio di vista
     * @returns {void}
     */
    window.App.SwapManager.cleanup = function () {
        closeContextMenu();
        closeSwapPanel();
        closeEditModal();
        if (_undoToastEl) _undoToastEl.classList.add('hidden');
        if (_undoTimeoutId) clearTimeout(_undoTimeoutId);
        document.removeEventListener('click', onDocumentClick);
        document.removeEventListener('keydown', onDocumentKeyDown);
        if (_activeContainer) {
            _activeContainer.removeEventListener('click', onContainerClick);
        }
    };

})();
