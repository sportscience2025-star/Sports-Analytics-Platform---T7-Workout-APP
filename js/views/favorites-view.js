/**
 * Favorites View Module
 * Gestione degli esercizi preferiti salvati dall'utente
 */
(function () {
    'use strict';

    window.App = window.App || {};
    window.App.Views = window.App.Views || {};

    window.App.Views['favorites'] = {
        name: 'favorites',
        title: 'Esercizi Preferiti',

        /**
         * Renderizza la vista degli esercizi preferiti con toolbar compatta e contatore
         * @param {HTMLElement} appContainer - Elemento contenitore dell'applicazione
         * @param {Object} state - Stato globale dell'applicazione
         * @returns {void}
         */
        render: function (appContainer, state) {
            state = state || {};

            appContainer.innerHTML = `
                <div class="favorites-container">
                    <div class="catalog-toolbar">
                        <span class="results-counter-pill" id="favorites-counter"><strong>...</strong> esercizi salvati</span>
                    </div>
                    <div id="filter-container"></div>
                    <div id="catalog-grid" class="catalog-grid"></div>
                </div>
            `;

            // Get favorite exercises with safe array fallback
            const favs = window.App.getFavoriteExercises ? window.App.getFavoriteExercises() : [];
            state.favoriteExercises = Array.isArray(favs) ? favs : [];

            // Update counter
            const favCounter = appContainer.querySelector('#favorites-counter');
            if (favCounter) {
                const count = state.favoriteExercises.length;
                favCounter.innerHTML = `<strong>${count}</strong> ${count === 1 ? 'esercizio salvato' : 'esercizi salvati'}`;
            }

            // Render filters for favorites
            window.App.renderFilters('filter-container', async (filters) => {
                state.filters = filters;

                // Apply all 6 filter criteria to favorites via unified getExercises engine
                const allFiltered = window.App.getExercises(filters) || [];
                const favIds = new Set((state.favoriteExercises || []).map(e => e.id));
                let filtered = allFiltered.filter(e => e && favIds.has(e.id));

                window.App.renderCatalog(filtered);

                // Update counter
                if (favCounter) {
                    const count = filtered.length;
                    const isFiltered = !!(
                        filters.search ||
                        (filters.muscle && filters.muscle !== 'all') ||
                        (filters.level && filters.level !== 'all') ||
                        (filters.equipment && filters.equipment !== 'all') ||
                        (filters.quality && filters.quality !== 'all') ||
                        (filters.sortBy && filters.sortBy !== 'default')
                    );
                    const suffix = isFiltered
                        ? (count === 1 ? 'esercizio trovato' : 'esercizi trovati')
                        : (count === 1 ? 'esercizio salvato' : 'esercizi salvati');
                    favCounter.innerHTML = `<strong>${count}</strong> ${suffix}`;
                }
            });

            // Initial render
            if (state.favoriteExercises.length === 0) {
                const catalogGrid = document.getElementById('catalog-grid');
                if (catalogGrid) {
                    catalogGrid.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-title">Nessun esercizio salvato</div>
                            <p>Inizia ad aggiungere esercizi ai preferiti cliccando sull'icona del cuore nel catalogo</p>
                            <p class="empty-state-hint">I tuoi esercizi preferiti ti permetteranno di programmare allenamenti più velocemente</p>
                        </div>
                    `;
                }
            } else {
                window.App.renderCatalog(state.favoriteExercises);
            }

            // Sync counter dynamically when an exercise is favorited/unfavorited within this view
            const catalogGridEl = appContainer.querySelector('#catalog-grid');
            if (catalogGridEl && typeof catalogGridEl.addEventListener === 'function') {
                catalogGridEl.addEventListener('click', (e) => {
                    const favBtn = e.target.closest('.favorite-btn');
                    if (favBtn && favCounter) {
                        setTimeout(() => {
                            const updatedFavs = window.App.getFavoriteExercises ? window.App.getFavoriteExercises() : [];
                            state.favoriteExercises = Array.isArray(updatedFavs) ? updatedFavs : [];
                            const isFiltered = !!(
                                state.filters && (
                                    state.filters.search ||
                                    (state.filters.muscle && state.filters.muscle !== 'all') ||
                                    (state.filters.level && state.filters.level !== 'all') ||
                                    (state.filters.equipment && state.filters.equipment !== 'all') ||
                                    (state.filters.quality && state.filters.quality !== 'all') ||
                                    (state.filters.sortBy && state.filters.sortBy !== 'default')
                                )
                            );
                            const count = isFiltered
                                ? (catalogGridEl.querySelectorAll('.exercise-card .favorite-btn.active').length)
                                : state.favoriteExercises.length;
                            const suffix = isFiltered
                                ? (count === 1 ? 'esercizio trovato' : 'esercizi trovati')
                                : (count === 1 ? 'esercizio salvato' : 'esercizi salvati');
                            favCounter.innerHTML = `<strong>${count}</strong> ${suffix}`;
                        }, 0);
                    }
                }, true);
            }
        },

        /**
         * Teardown e rilascio risorse della vista preferiti
         * @returns {void}
         */
        cleanup: function () {
            // Teardown se necessario
        }
    };
})();
