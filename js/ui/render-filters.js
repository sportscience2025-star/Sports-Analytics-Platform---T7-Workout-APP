/**
 * UI Render Filters — Filter Bar & Search
 * Extracted from ui.js
 */
window.App = window.App || {};
/**
 * Mappa anatomica per icone patologiche cliniche
 * @param {string} key - Chiave anatomica (es. neck, spine, knee)
 * @returns {string} Emoji anatomica associata o icona generica
 */
function getIcon(key) {
    const icons = {
        'neck': '🦒', 'spine': '🦴', 'spine_curved': '〰️', 'disc': '💿',
        'shoulder': '💪', 'knee': '🦵', 'ligament': '🩹', 'heart': '❤️',
        'body': '🧘', 'hand': '✋', 'arm': '🦾', 'drop': '🩸', 'lungs': '🫁', 'foot': '🦶', 'hip': '🦴'
    };
    return icons[key] || '🩺';
}

/**
 * Renderizza la barra filtri con ricerca testuale e menu a discesa personalizzati
 * @param {string} containerId - ID dell'elemento DOM contenitore dei filtri
 * @param {Function} onFilterChange - Callback invocata alla variazione di qualsiasi filtro
 * @returns {void}
 */
window.App.renderFilters = function (containerId, onFilterChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const taxonomy = window.App.MUSCLE_TAXONOMY || {};
    
    // Internal active filter state
    const currentFilters = {
        search: '',
        muscle: 'all',
        level: 'all',
        equipment: 'all',
        quality: 'all',
        sortBy: 'default'
    };

    // Options datasets for custom dropdowns
    const levelOptions = [
        { val: 'all', label: 'Tutti i Livelli' },
        { val: 'Principiante', label: 'Principiante' },
        { val: 'Intermedio', label: 'Intermedio' },
        { val: 'Avanzato', label: 'Avanzato' }
    ];

    const equipmentOptions = [
        { val: 'all', label: 'Tutta l\'Attrezzatura' },
        { val: 'Bilanciere', label: 'Bilanciere' },
        { val: 'Manubri', label: 'Manubri' },
        { val: 'Corpo Libero', label: 'Corpo Libero' },
        { val: 'Macchine', label: 'Macchine' },
        { val: 'Cavi', label: 'Cavi' },
        { val: 'Sbarra Trazioni', label: 'Sbarra / Trazioni' },
        { val: 'Attrezzi', label: 'Altri Attrezzi' },
        { val: 'Panca', label: 'Panca' }
    ];

    const qualityOptions = [
        { val: 'all', label: 'Tutte le Qualità' },
        { val: 'Forza', label: 'Forza' },
        { val: 'Ipertrofia', label: 'Ipertrofia' },
        { val: 'Potenza', label: 'Potenza' },
        { val: 'Stabilità', label: 'Stabilità' }
    ];

    const sortOptions = [
        { val: 'default', label: 'Ordina: Predefinito' },
        { val: 'name_asc', label: 'Nome (A-Z)' },
        { val: 'name_desc', label: 'Nome (Z-A)' },
        { val: 'muscle_asc', label: 'Per Muscolo' },
        { val: 'level_asc', label: 'Per Livello' },
        { val: 'type_asc', label: 'Per Tipo (Multiarticolare prima)' }
    ];

    // Main Filter Bar HTML
    container.innerHTML = `
        <div class="catalog-filter-wrapper animate-fade-in">
            <div class="filter-bar-main">
                <div class="search-group">
                    <span class="search-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>
                    <input type="text" id="filter-search" class="search-input" placeholder="Cerca esercizi (es. Squat, Panca)..." />
                    <button type="button" id="search-clear" class="search-clear-btn" style="display:none;">✕</button>
                </div>
                
                <div class="custom-select-group">
                    <!-- Custom Muscle Dropdown -->
                    <div class="custom-select-container" id="container-muscle">
                        <button type="button" class="custom-select-trigger" id="trigger-muscle" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="menu-muscle" aria-label="Seleziona distretto muscolare">
                            <span class="trigger-text">Muscolo: Tutti</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div class="custom-select-menu hidden" id="menu-muscle">
                            <div class="dropdown-search-wrap">
                                <svg class="search-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input type="text" class="dropdown-search-input" id="search-muscle-input" placeholder="Cerca muscolo..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Cerca distretto muscolare" role="searchbox" />
                            </div>
                            <div class="dropdown-options-list" role="listbox" tabindex="-1">
                                <div class="custom-option selected" data-val="all" role="option" aria-selected="true" tabindex="0">
                                    <span>Tutti i Muscoli</span>
                                    <span class="check-icon">✓</span>
                                </div>
                                ${Object.keys(taxonomy).map(key => `
                                    <div class="dropdown-group-header" data-group="${taxonomy[key].label.toLowerCase()}">${taxonomy[key].label}</div>
                                    ${taxonomy[key].muscles.map(m => `
                                        <div class="custom-option" data-val="${m}" data-group="${taxonomy[key].label.toLowerCase()}" role="option" aria-selected="false" tabindex="0">
                                            <span>${m}</span>
                                            <span class="check-icon">✓</span>
                                        </div>
                                    `).join('')}
                                `).join('')}
                                <div class="dropdown-empty-state" id="muscle-empty-state">Nessun muscolo trovato</div>
                            </div>
                        </div>
                    </div>

                    <!-- Custom Level Dropdown -->
                    <div class="custom-select-container" id="container-level">
                        <button type="button" class="custom-select-trigger" id="trigger-level" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="menu-level" aria-label="Seleziona livello di esperienza">
                            <span class="trigger-text">Livello: Tutti</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div class="custom-select-menu hidden" id="menu-level">
                            <div class="dropdown-options-list" role="listbox" tabindex="-1">
                                ${levelOptions.map(opt => `
                                    <div class="custom-option ${opt.val === 'all' ? 'selected' : ''}" data-val="${opt.val}" role="option" aria-selected="${opt.val === 'all' ? 'true' : 'false'}" tabindex="0">
                                        <span>${opt.label}</span>
                                        <span class="check-icon">✓</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Custom Equipment Dropdown -->
                    <div class="custom-select-container" id="container-equipment">
                        <button type="button" class="custom-select-trigger" id="trigger-equipment" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="menu-equipment" aria-label="Seleziona attrezzatura">
                            <span class="trigger-text">Attrezzatura: Tutta</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div class="custom-select-menu hidden" id="menu-equipment">
                            <div class="dropdown-options-list" role="listbox" tabindex="-1">
                                ${equipmentOptions.map(opt => `
                                    <div class="custom-option ${opt.val === 'all' ? 'selected' : ''}" data-val="${opt.val}" role="option" aria-selected="${opt.val === 'all' ? 'true' : 'false'}" tabindex="0">
                                        <span>${opt.label}</span>
                                        <span class="check-icon">✓</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Custom Quality Dropdown -->
                    <div class="custom-select-container" id="container-quality">
                        <button type="button" class="custom-select-trigger" id="trigger-quality" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="menu-quality" aria-label="Seleziona qualità allenata">
                            <span class="trigger-text">Qualità: Tutte</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div class="custom-select-menu hidden" id="menu-quality">
                            <div class="dropdown-options-list" role="listbox" tabindex="-1">
                                ${qualityOptions.map(opt => `
                                    <div class="custom-option ${opt.val === 'all' ? 'selected' : ''}" data-val="${opt.val}" role="option" aria-selected="${opt.val === 'all' ? 'true' : 'false'}" tabindex="0">
                                        <span>${opt.label}</span>
                                        <span class="check-icon">✓</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Custom Sort Dropdown -->
                    <div class="custom-select-container" id="container-sort">
                        <button type="button" class="custom-select-trigger" id="trigger-sort" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="menu-sort" aria-label="Seleziona ordinamento">
                            <span class="trigger-text">Ordina: Predefinito</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div class="custom-select-menu hidden" id="menu-sort">
                            <div class="dropdown-options-list" role="listbox" tabindex="-1">
                                ${sortOptions.map(opt => `
                                    <div class="custom-option ${opt.val === 'default' ? 'selected' : ''}" data-val="${opt.val}" role="option" aria-selected="${opt.val === 'default' ? 'true' : 'false'}" tabindex="0">
                                        <span>${opt.label}</span>
                                        <span class="check-icon">✓</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                        <!-- Reset Filters Button (Hidden by default) -->
                        <button type="button" id="btn-reset-filters" class="btn-reset-filters" style="display:none;">
                            ↺ Reset
                        </button>

                        <button type="button" id="btn-add-exercise" class="btn-primary" style="padding: 0.65rem 1.1rem; font-size: 0.9rem; border-radius: var(--radius-md);">+ Aggiungi</button>
                    </div>
                </div>
            </div>
        `;

        /**
         * Notifica i subscriber della variazione dei filtri e aggiorna la visibilità del tasto reset
         * @returns {void}
         */
        function notifyChange() {
            // Toggle Reset Button visibility
            const isFiltered = currentFilters.search !== '' ||
                currentFilters.muscle !== 'all' ||
                currentFilters.level !== 'all' ||
                currentFilters.equipment !== 'all' ||
                currentFilters.quality !== 'all' ||
                currentFilters.sortBy !== 'default';
            const resetBtn = container.querySelector('#btn-reset-filters');
            if (resetBtn) resetBtn.style.display = isFiltered ? 'inline-flex' : 'none';

            onFilterChange({ ...currentFilters });
        }

        // 1. Search input binding
        const searchInput = container.querySelector('#filter-search');
        const searchClear = container.querySelector('#search-clear');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentFilters.search = e.target.value;
                if (searchClear) searchClear.style.display = e.target.value ? 'block' : 'none';
                notifyChange();
            });
        }
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    currentFilters.search = '';
                    searchClear.style.display = 'none';
                    notifyChange();
                }
            });
        }

        // 2. Custom Dropdowns toggle logic
        const selectTypes = ['muscle', 'level', 'equipment', 'quality', 'sort'];
        
        /**
         * Chiude tutti i menu a tendina aperti nel componente filtri
         * @returns {void}
         */
        function closeAllMenus() {
            container.querySelectorAll('.custom-select-menu').forEach(m => m.classList.add('hidden'));
            container.querySelectorAll('.custom-select-container').forEach(c => c.classList.remove('open'));
            container.querySelectorAll('.custom-select-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
        }

        /**
         * Ripristina la ricerca nel menu muscoli e reimposta la visualizzazione di tutte le opzioni
         * @returns {void}
         */
        function resetMuscleSearch() {
            const searchIn = container.querySelector('#search-muscle-input');
            if (searchIn) searchIn.value = '';
            const menu = container.querySelector('#menu-muscle');
            if (menu) {
                menu.querySelectorAll('.custom-option').forEach(opt => {
                    opt.style.display = '';
                    opt.setAttribute('aria-hidden', 'false');
                });
                menu.querySelectorAll('.dropdown-group-header').forEach(hdr => {
                    hdr.style.display = '';
                });
                const emptyState = menu.querySelector('#muscle-empty-state');
                if (emptyState) emptyState.style.display = 'none';
            }
        }

        // Gestione chiusura menu globale e tasto Escape con rimozione handler precedenti
        if (window.App._activeFilterCloseHandler) {
            document.removeEventListener('click', window.App._activeFilterCloseHandler);
            document.removeEventListener('keydown', window.App._activeFilterKeyHandler);
        }
        window.App._activeFilterCloseHandler = function (e) {
            if (!e.target.closest('.custom-select-container')) {
                closeAllMenus();
            }
        };
        window.App._activeFilterKeyHandler = function (e) {
            if (e.key === 'Escape') {
                closeAllMenus();
            }
        };
        document.addEventListener('click', window.App._activeFilterCloseHandler);
        document.addEventListener('keydown', window.App._activeFilterKeyHandler);

        /**
         * Aggiorna lo stato visivo dell'opzione selezionata e l'etichetta del trigger
         * @param {string} type - Tipo di filtro (muscle, level, equipment, quality, sort)
         * @param {string} val - Valore selezionato
         * @returns {void}
         */
        function updateCustomSelectUI(type, val) {
            const containerEl = container.querySelector(`#container-${type}`);
            const trigger = container.querySelector(`#trigger-${type}`);
            const menu = container.querySelector(`#menu-${type}`);
            if (!trigger || !menu) return;

            // Update selected option class and ARIA state
            menu.querySelectorAll('.custom-option').forEach(opt => {
                const isSel = opt.dataset.val === val;
                opt.classList.toggle('selected', isSel);
                opt.setAttribute('aria-selected', String(isSel));
            });

            // Update trigger text
            const textSpan = trigger.querySelector('.trigger-text');
            if (textSpan) {
                if (val === 'all' || val === 'default') {
                    const defaults = {
                        muscle: 'Muscolo: Tutti',
                        level: 'Livello: Tutti',
                        equipment: 'Attrezzatura: Tutta',
                        quality: 'Qualità: Tutte',
                        sort: 'Ordina: Predefinito'
                    };
                    textSpan.textContent = defaults[type];
                    trigger.classList.remove('has-value');
                } else {
                    if (type === 'sort') {
                        const match = sortOptions.find(o => o.val === val);
                        textSpan.textContent = match ? match.label : 'Ordina';
                    } else {
                        const prefixMap = { muscle: 'Muscolo: ', level: 'Livello: ', equipment: 'Attrezzatura: ', quality: 'Qualità: ' };
                        textSpan.textContent = prefixMap[type] + val;
                    }
                    trigger.classList.add('has-value');
                }
            }
        }

        selectTypes.forEach(type => {
            const containerEl = container.querySelector(`#container-${type}`);
            const trigger = container.querySelector(`#trigger-${type}`);
            const menu = container.querySelector(`#menu-${type}`);
            if (!trigger || !menu) return;

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = !menu.classList.contains('hidden');
                closeAllMenus();
                if (!isOpen) {
                    menu.classList.remove('hidden');
                    containerEl.classList.add('open');
                    trigger.setAttribute('aria-expanded', 'true');
                    // Reset and focus search if muscle dropdown
                    if (type === 'muscle') {
                        resetMuscleSearch();
                        const searchInMenu = menu.querySelector('.dropdown-search-input');
                        if (searchInMenu) searchInMenu.focus();
                    } else {
                        const selOpt = menu.querySelector('.custom-option.selected') || menu.querySelector('.custom-option');
                        if (selOpt) selOpt.focus();
                    }
                }
            });

            // Trigger keyboard navigation
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (menu.classList.contains('hidden')) {
                        trigger.click();
                    } else {
                        const firstOpt = menu.querySelector('.custom-option');
                        if (firstOpt) firstOpt.focus();
                    }
                }
            });

            /**
             * Applica il valore dell'opzione selezionata e chiude il menu
             * @param {string} selectedVal - Valore selezionato
             * @returns {void}
             */
            function selectOption(selectedVal) {
                if (type === 'sort') {
                    currentFilters.sortBy = selectedVal;
                } else {
                    currentFilters[type] = selectedVal;
                }

                if (type === 'muscle') {
                    resetMuscleSearch();
                }

                updateCustomSelectUI(type, selectedVal);
                closeAllMenus();
                trigger.focus();
                notifyChange();
            }

            menu.querySelectorAll('.custom-option').forEach(opt => {
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectOption(opt.dataset.val);
                });

                opt.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        selectOption(opt.dataset.val);
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        e.stopPropagation();
                        const allOpts = Array.from(menu.querySelectorAll('.custom-option')).filter(o => o.style.display !== 'none');
                        const curIdx = allOpts.indexOf(opt);
                        if (curIdx >= 0 && curIdx < allOpts.length - 1) {
                            allOpts[curIdx + 1].focus();
                        }
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        e.stopPropagation();
                        const allOpts = Array.from(menu.querySelectorAll('.custom-option')).filter(o => o.style.display !== 'none');
                        const curIdx = allOpts.indexOf(opt);
                        if (curIdx > 0) {
                            allOpts[curIdx - 1].focus();
                        } else if (type === 'muscle') {
                            const searchInMenu = menu.querySelector('.dropdown-search-input');
                            if (searchInMenu) searchInMenu.focus();
                        }
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        closeAllMenus();
                        trigger.focus();
                    }
                });
            });
        });

        // Search inside muscle dropdown
        const muscleSearchIn = container.querySelector('#search-muscle-input');
        const muscleSearchWrap = container.querySelector('.dropdown-search-wrap');
        if (muscleSearchWrap && muscleSearchIn) {
            muscleSearchWrap.addEventListener('click', (e) => {
                e.stopPropagation();
                muscleSearchIn.focus();
            });
        }
        if (muscleSearchIn) {
            muscleSearchIn.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                const menu = container.querySelector('#menu-muscle');
                if (!menu) return;

                let visibleCount = 0;
                const visibleGroups = new Set();

                menu.querySelectorAll('.custom-option').forEach(opt => {
                    if (opt.dataset.val === 'all') {
                        const isVis = (!term || 'tutti i muscoli'.includes(term));
                        opt.style.display = isVis ? '' : 'none';
                        opt.setAttribute('aria-hidden', String(!isVis));
                        if (isVis) visibleCount++;
                        return;
                    }
                    const txtSpan = opt.querySelector('span');
                    const txt = (txtSpan ? txtSpan.textContent : opt.textContent).toLowerCase();
                    const group = (opt.dataset.group || '').toLowerCase();
                    const isVis = !term || txt.includes(term) || group.includes(term);
                    opt.style.display = isVis ? '' : 'none';
                    opt.setAttribute('aria-hidden', String(!isVis));
                    if (isVis) {
                        visibleCount++;
                        if (opt.dataset.group) visibleGroups.add(opt.dataset.group);
                    }
                });

                menu.querySelectorAll('.dropdown-group-header').forEach(hdr => {
                    const groupKey = (hdr.dataset.group || hdr.textContent).toLowerCase();
                    const isVis = !term || visibleGroups.has(groupKey) || groupKey.includes(term);
                    hdr.style.display = isVis ? '' : 'none';
                });

                const emptyState = menu.querySelector('#muscle-empty-state');
                if (emptyState) {
                    emptyState.style.display = (visibleCount === 0) ? 'block' : 'none';
                }
            });

            muscleSearchIn.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const firstVisOpt = Array.from(container.querySelectorAll('#menu-muscle .custom-option')).find(o => o.style.display !== 'none');
                    if (firstVisOpt) firstVisOpt.focus();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const firstVisOpt = Array.from(container.querySelectorAll('#menu-muscle .custom-option')).find(o => o.style.display !== 'none');
                    if (firstVisOpt) firstVisOpt.click();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeAllMenus();
                    const trig = container.querySelector('#trigger-muscle');
                    if (trig) trig.focus();
                }
            });

            muscleSearchIn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Reset Button Event
        const resetBtn = container.querySelector('#btn-reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                currentFilters.search = '';
                currentFilters.muscle = 'all';
                currentFilters.level = 'all';
                currentFilters.equipment = 'all';
                currentFilters.quality = 'all';
                currentFilters.sortBy = 'default';

                if (searchInput) searchInput.value = '';
                if (searchClear) searchClear.style.display = 'none';
                resetMuscleSearch();

                selectTypes.forEach(type => updateCustomSelectUI(type, type === 'sort' ? 'default' : 'all'));

                notifyChange();
            });
        }

    // Add Button Event
    const btnAdd = container.querySelector('#btn-add-exercise');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.App.renderAddExerciseModal(onFilterChange);
        });
    }
};
