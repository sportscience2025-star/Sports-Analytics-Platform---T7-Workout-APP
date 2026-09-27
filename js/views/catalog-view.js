/**
 * Catalog View Module
 * Gestione della schermata del catalogo esercizi e filtri
 */
(function () {
    'use strict';

    window.App = window.App || {};
    window.App.Views = window.App.Views || {};

    const DEBOUNCE_FILTER_MS = 300;
    let filterTimeout = null;
    let currentRequestToken = 0;

    window.App.Views['catalog'] = {
        name: 'catalog',
        title: 'Catalogo Esercizi',

        /**
         * Renderizza la vista del catalogo esercizi con toolbar compatta e contatore
         * @param {HTMLElement} appContainer - Elemento contenitore dell'applicazione
         * @param {Object} state - Stato globale dell'applicazione
         * @returns {void}
         */
        render: function (appContainer, state) {
            state = state || {};

            // Skeleton / Structure compatta senza blocco hero ridondante
            appContainer.innerHTML = '';
            const catalogWrapper = document.createElement('div');
            catalogWrapper.className = 'catalog-container';
            catalogWrapper.innerHTML = `
                <div class="catalog-toolbar">
                    <span class="results-counter-pill" id="results-counter"><strong>...</strong> esercizi disponibili</span>
                </div>
                <div id="filter-container"></div>
                <div id="catalog-grid" class="catalog-grid"></div>
            `;
            appContainer.appendChild(catalogWrapper);

            // Debounce mechanism for catalog filtering
            window.App.renderFilters('filter-container', (newFilters) => {
                clearTimeout(filterTimeout);

                filterTimeout = setTimeout(async () => {
                    const token = ++currentRequestToken;

                    // Filter Handler
                    state.filters = newFilters;
                    // Show loading state if needed
                    const grid = document.getElementById('catalog-grid');
                    if (grid) grid.innerHTML = '<p>Aggiornamento...</p>';

                    // Fetch and Render
                    const fetchedExercises = await window.App.getExercises(state.filters);

                    // Check if this request is still the most recent one
                    if (token !== currentRequestToken) return;

                    state.filteredExercises = fetchedExercises || [];
                    window.App.renderCatalog(state.filteredExercises);

                    // Update results counter
                    const counter = document.getElementById('results-counter');
                    if (counter) {
                        const count = state.filteredExercises.length;
                        const isFiltered = !!(state.filters.search || (state.filters.muscle && state.filters.muscle !== 'all') || (state.filters.level && state.filters.level !== 'all') || (state.filters.equipment && state.filters.equipment !== 'all') || (state.filters.quality && state.filters.quality !== 'all'));
                        const suffix = isFiltered
                            ? (count === 1 ? 'esercizio trovato' : 'esercizi trovati')
                            : (count === 1 ? 'esercizio disponibile' : 'esercizi disponibili');
                        counter.innerHTML = `<strong>${count}</strong> ${suffix}`;
                    }
                }, DEBOUNCE_FILTER_MS);
            });

            // Reset active filters to match newly mounted filter bar
            state.filters = {};

            // Retrieve all available exercises from cache or data module safely
            let allAvailable = null;
            if (Array.isArray(state.allExercises) && state.allExercises.length > 0) {
                allAvailable = state.allExercises;
            } else if (typeof window.App.getExercises === 'function') {
                try {
                    const res = window.App.getExercises();
                    if (Array.isArray(res) && res.length > 0) {
                        allAvailable = res;
                        state.allExercises = res;
                    }
                } catch (_) {}
            }
            if (!allAvailable && Array.isArray(state.exercises) && state.exercises.length > 0) {
                allAvailable = state.exercises;
            }

            const initialExercises = allAvailable || [];
            state.exercises = initialExercises;
            window.App.renderCatalog(initialExercises);

            // Initialize counter with singular/plural support
            const counter = document.getElementById('results-counter');
            if (counter) {
                const count = initialExercises.length;
                counter.innerHTML = `<strong>${count}</strong> ${count === 1 ? 'esercizio disponibile' : 'esercizi disponibili'}`;
            }
        },

        /**
         * Teardown e cancellazione dei timer pendenti della vista
         * @returns {void}
         */
        cleanup: function () {
            if (filterTimeout) {
                clearTimeout(filterTimeout);
                filterTimeout = null;
            }
        }
    };
})();
