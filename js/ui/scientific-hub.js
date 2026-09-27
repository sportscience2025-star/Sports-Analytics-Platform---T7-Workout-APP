/**
 * js/ui/scientific-hub.js
 * UI Scientific Hub — Evidence Library, Advanced Filtering, Sorting and Detail Views.
 * High-performance, modular UI component integrated with T7 Design System.
 */
window.App = window.App || {};

(function () {
    'use strict';

    const SEARCH_DEBOUNCE_MS = 250;
    const DEFAULT_SORT_MODE = 'recent';
    const MIN_VALID_YEAR = 1950;
    const MAX_VALID_YEAR = 2030;

    /**
     * Helper to compute sanitized CSS class for study types.
     * @param {string} studyType - Human readable study type
     * @returns {string} CSS class modifier
     */
    function getStudyTypeClass(studyType) {
        if (!studyType) return 'rct';
        const norm = studyType.toLowerCase();
        if (norm.includes('meta-anal')) return 'meta-analisi';
        if (norm.includes('revisione') || norm.includes('systematic')) return 'revisione-sistematica';
        if (norm.includes('linee') || norm.includes('guideline') || norm.includes('consensus')) return 'linee-guida';
        return 'rct';
    }

    /**
     * Renderizza l'Hub Scientifico con filtri per categoria, barra di ricerca, ordinamento e griglia delle fonti.
     * @param {string} filterContainerId - ID dell'elemento DOM contenitore dei filtri
     * @param {string} gridContainerId - ID dell'elemento DOM contenitore della griglia
     * @returns {void}
     */
    window.App.renderScientificHub = function (filterContainerId, gridContainerId) {
        const filterContainer = document.getElementById(filterContainerId);
        const gridContainer = document.getElementById(gridContainerId);
        if (!filterContainer || !gridContainer) return;

        // State for filtering & sorting
        let searchVal = '';
        let activeCategory = 'Tutti';
        let sortMode = DEFAULT_SORT_MODE;
        let minYear = null;
        let maxYear = null;

        /**
         * Calcola il conteggio delle fonti per ciascuna categoria
         * @param {Array<Object>} sources - Array completo delle fonti
         * @returns {Object} Mappa categoria -> numero fonti
         */
        function computeCategoryCounts(sources) {
            const counts = { Tutti: sources.length };
            sources.forEach(s => {
                if (s.area) {
                    counts[s.area] = (counts[s.area] || 0) + 1;
                }
            });
            return counts;
        }

        /**
         * Renderizza la barra filtri superiore e i chip delle categorie
         */
        function renderFilters() {
            const allSources = window.App.scientificSources || [];
            const categoryCounts = computeCategoryCounts(allSources);

            // 12 official categories + Tutti
            const categories = [
                'Tutti',
                'Biomeccanica',
                'Fisiologia',
                'VBT',
                'Clinico',
                'Atletica Leggera',
                'Sollevamento Pesi',
                'Sport di Squadra',
                'Riabilitazione',
                'Nutrizione Sportiva',
                'Prevenzione Infortuni',
                'Psicologia dello Sport',
                'Sport Individuali'
            ];

            filterContainer.innerHTML = `
                <div class="scientific-toolbar">
                    <div class="scientific-toolbar-row1">
                        <div class="scientific-search-box">
                            <span class="search-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </span>
                            <input type="text" id="source-filter-search" class="scientific-search-input" placeholder="Cerca studi, autori, parole chiave o patologie..." value="${window.escapeHTML(searchVal)}" />
                        </div>

                        <div class="scientific-controls-group">
                            <select id="source-sort-select" class="scientific-sort-select" title="Ordina evidenze">
                                <option value="recent" ${sortMode === 'recent' ? 'selected' : ''}>Più recenti</option>
                                <option value="oldest" ${sortMode === 'oldest' ? 'selected' : ''}>Meno recenti</option>
                                <option value="title_asc" ${sortMode === 'title_asc' ? 'selected' : ''}>Titolo A-Z</option>
                                <option value="journal_asc" ${sortMode === 'journal_asc' ? 'selected' : ''}>Per rivista</option>
                            </select>

                            <div class="scientific-year-filter">
                                <label for="source-min-year">Da:</label>
                                <input type="number" id="source-min-year" class="scientific-year-input" placeholder="1990" min="${MIN_VALID_YEAR}" max="${MAX_VALID_YEAR}" value="${minYear || ''}" />
                                <label for="source-max-year">A:</label>
                                <input type="number" id="source-max-year" class="scientific-year-input" placeholder="2026" min="${MIN_VALID_YEAR}" max="${MAX_VALID_YEAR}" value="${maxYear || ''}" />
                            </div>
                        </div>
                    </div>

                    <div class="scientific-categories-container">
                        ${categories.map(cat => {
                            const count = categoryCounts[cat] || 0;
                            const isActive = cat === activeCategory;
                            return `
                                <button type="button" class="scientific-chip ${isActive ? 'active' : ''}" data-category="${cat}">
                                    <span>${cat}</span>
                                    <span class="scientific-chip-count">${count}</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            // Debounced Search listener
            const searchInput = document.getElementById('source-filter-search');
            let debounceTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    searchVal = e.target.value.trim();
                    updateGrid();
                }, SEARCH_DEBOUNCE_MS);
            });

            // Sort selector listener
            const sortSelect = document.getElementById('source-sort-select');
            sortSelect.addEventListener('change', (e) => {
                sortMode = e.target.value;
                updateGrid();
            });

            // Year range listeners
            const minYearInput = document.getElementById('source-min-year');
            const maxYearInput = document.getElementById('source-max-year');
            const handleYearChange = () => {
                minYear = minYearInput.value ? parseInt(minYearInput.value, 10) : null;
                maxYear = maxYearInput.value ? parseInt(maxYearInput.value, 10) : null;
                updateGrid();
            };
            minYearInput.addEventListener('change', handleYearChange);
            maxYearInput.addEventListener('change', handleYearChange);

            // Category chip click listeners
            const chipButtons = filterContainer.querySelectorAll('.scientific-chip');
            chipButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetBtn = e.currentTarget;
                    activeCategory = targetBtn.getAttribute('data-category');
                    chipButtons.forEach(b => {
                        b.classList.toggle('active', b.getAttribute('data-category') === activeCategory);
                    });
                    updateGrid();
                });
            });
        }

        /**
         * Filtra, ordina e renderizza la griglia delle card scientifiche
         */
        function updateGrid() {
            const allSources = window.App.scientificSources || [];

            // 1. Filtraggio per Categoria, Testo e Anno
            let filtered = allSources.filter(source => {
                if (!source) return false;

                const matchesCategory = activeCategory === 'Tutti' || source.area === activeCategory;

                const term = searchVal.toLowerCase();
                const matchesSearch = !term ||
                    (source.title || '').toLowerCase().includes(term) ||
                    (source.authors || '').toLowerCase().includes(term) ||
                    (source.journal || '').toLowerCase().includes(term) ||
                    (source.abstract || '').toLowerCase().includes(term) ||
                    (source.area || '').toLowerCase().includes(term) ||
                    (source.studyType || '').toLowerCase().includes(term);

                const matchesMinYear = !minYear || (source.year && source.year >= minYear);
                const matchesMaxYear = !maxYear || (source.year && source.year <= maxYear);

                return matchesCategory && matchesSearch && matchesMinYear && matchesMaxYear;
            });

            // 2. Ordinamento
            filtered.sort((a, b) => {
                if (sortMode === 'recent') return (b.year || 0) - (a.year || 0);
                if (sortMode === 'oldest') return (a.year || 0) - (b.year || 0);
                if (sortMode === 'title_asc') return (a.title || '').localeCompare(b.title || '');
                if (sortMode === 'journal_asc') return (a.journal || '').localeCompare(b.journal || '');
                return 0;
            });

            // 3. Aggiornamento contatore UI
            const counter = document.getElementById('sources-counter');
            if (counter) {
                const count = filtered.length;
                const isFiltered = !!(searchVal || activeCategory !== 'Tutti' || minYear || maxYear);
                const suffix = isFiltered
                    ? (count === 1 ? 'fonte trovata' : 'fonti trovate')
                    : (count === 1 ? 'fonte disponibile' : 'fonti disponibili');
                counter.innerHTML = `<strong>${count}</strong> ${suffix}`;
            }

            // 4. Rendering delle card
            gridContainer.className = 'scientific-grid';
            gridContainer.innerHTML = '';

            if (filtered.length === 0) {
                gridContainer.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
                        <div class="empty-state-title" style="font-size: 1.25rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">Nessuna evidenza scientifica trovata</div>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">Prova a modificare i filtri di ricerca, l'intervallo temporale o la categoria tematica.</p>
                    </div>
                `;
                return;
            }

            filtered.forEach((source, index) => {
                const card = document.createElement('article');
                card.className = 'source-card';
                card.style.animationDelay = `${Math.min(index * 0.03, 0.4)}s`;

                const safeUrl = (source.url && source.url.startsWith('http')) ? window.escapeHTML(source.url) : '#';
                const studyTypeClass = getStudyTypeClass(source.studyType);

                card.innerHTML = `
                    <div class="source-card-header">
                        <div class="source-card-header-top">
                            <div class="source-tags-row">
                                <span class="source-area-tag">${window.escapeHTML(source.area || 'Generale')}</span>
                                <span class="source-year-tag">${window.escapeHTML(String(source.year || ''))}</span>
                            </div>
                            <span class="source-study-badge ${studyTypeClass}">${window.escapeHTML(source.studyType || 'Evidenza')}</span>
                        </div>
                        <span class="source-journal-text" title="${window.escapeHTML(source.journal || '')}">${window.escapeHTML(source.journal || '')}</span>
                    </div>

                    <div class="source-card-body">
                        <h3 class="source-card-title">${window.escapeHTML(source.title || '')}</h3>
                        <p class="source-card-authors">${window.escapeHTML(source.authors || '')}</p>
                        <div class="source-card-abstract-wrapper">
                            <p class="source-card-abstract">${window.escapeHTML(source.abstract || '')}</p>
                        </div>
                    </div>

                    <div class="source-card-footer">
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="source-pubmed-link" onclick="event.stopPropagation();">
                            PubMed / DOI ↗
                        </a>
                        <button type="button" class="source-read-btn">Leggi evidenza →</button>
                    </div>
                `;

                card.addEventListener('click', () => {
                    window.App.renderSourceDetail(source);
                });

                gridContainer.appendChild(card);
            });
        }

        renderFilters();
        updateGrid();
    };

    /**
     * Renderizza la modale di dettaglio per una fonte scientifica con design moderno
     * @param {Object} source - Oggetto contenente i metadati della fonte scientifica
     * @returns {void}
     */
    window.App.renderSourceDetail = function (source) {
        if (!source) return;

        const safeUrl = (source.url && source.url.startsWith('http')) ? window.escapeHTML(source.url) : '#';
        const studyTypeClass = getStudyTypeClass(source.studyType);

        // Estrai regole contestuali
        const rules = source.rules || {};
        const patientTypes = (rules.patientTypes || []).join(', ') || 'Tutti';
        const sports = (rules.sports || []).join(', ') || 'Generale / Multi-sport';
        const goals = (rules.goals || []).join(', ') || 'Generale';
        const injuries = (rules.injuries || []).join(', ') || 'Nessuno specifico';

        const content = `
            <div class="exercise-detail-modal source-detail-modal" style="display: flex; flex-direction: column; height: 100%;">
                <div class="modal-hero" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 2rem; border-radius: var(--radius-md) var(--radius-md) 0 0; border-bottom: 1px solid var(--border);">
                    <div class="source-detail-header-tags">
                        <span class="source-area-tag">${window.escapeHTML(source.area || '')}</span>
                        <span class="source-year-tag">${window.escapeHTML(String(source.year || ''))}</span>
                        <span class="source-study-badge ${studyTypeClass}">${window.escapeHTML(source.studyType || 'Evidenza')}</span>
                    </div>
                    <h2 style="font-size: 1.45rem; color: var(--text-primary); line-height: 1.35; margin: 0 0 0.6rem;">${window.escapeHTML(source.title || '')}</h2>
                    <p style="color: var(--accent); font-weight: 600; font-size: 0.95rem; margin: 0;">${window.escapeHTML(source.authors || '')}</p>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.35rem 0 0;">Rivista: <strong>${window.escapeHTML(source.journal || '')}</strong></p>
                </div>
                
                <div class="modal-scroll-content" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; max-height: calc(75vh - 140px); overflow-y: auto;">
                    <section>
                        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 700; letter-spacing: 0.05em;">Abstract & Takeaway per il Coach</h4>
                        <p style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.65; margin: 0;">${window.escapeHTML(source.abstract || '')}</p>
                    </section>

                    <section>
                        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 700; letter-spacing: 0.05em;">Ambiti di Applicazione Metodologica</h4>
                        <div class="source-rules-grid">
                            <div class="source-rule-pill">
                                <span class="source-rule-label">Popolazione Target</span>
                                <span class="source-rule-value">${window.escapeHTML(patientTypes)}</span>
                            </div>
                            <div class="source-rule-pill">
                                <span class="source-rule-label">Sport Correlati</span>
                                <span class="source-rule-value">${window.escapeHTML(sports)}</span>
                            </div>
                            <div class="source-rule-pill">
                                <span class="source-rule-label">Obiettivi Motori</span>
                                <span class="source-rule-value">${window.escapeHTML(goals)}</span>
                            </div>
                            <div class="source-rule-pill">
                                <span class="source-rule-label">Infortuni / Patologie</span>
                                <span class="source-rule-value">${window.escapeHTML(injuries)}</span>
                            </div>
                        </div>
                    </section>

                    <hr style="border: 0; border-top: 1px solid var(--border); margin: 0.25rem 0;">

                    <section style="display: flex; justify-content: space-between; align-items: center;">
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem;">
                            <span>Consulta su PubMed / Archivio Ufficiale</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    </section>
                </div>
            </div>
        `;
        window.App.openModal(content);
    };

})();
