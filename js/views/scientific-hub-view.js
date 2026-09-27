/**
 * js/views/scientific-hub-view.js
 * Scientific Hub View Module
 * Gestione della vista della libreria delle fonti scientifiche e linee guida metodologiche
 */
(function () {
    'use strict';

    window.App = window.App || {};
    window.App.Views = window.App.Views || {};

    window.App.Views['scientific_hub'] = {
        name: 'scientific_hub',
        title: 'Libreria Fonti Scientifiche',

        /**
         * Renderizza la libreria delle fonti scientifiche con toolbar compatta e contatore
         * @param {HTMLElement} appContainer - Elemento contenitore dell'applicazione
         * @param {Object} state - Stato globale dell'applicazione
         * @returns {void}
         */
        render: function (appContainer, state) {
            state = state || {};

            appContainer.innerHTML = '';
            const hubWrapper = document.createElement('div');
            hubWrapper.className = 'hub-container scientific-hub-wrapper';
            hubWrapper.innerHTML = `
                <div class="catalog-toolbar" style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 0;">Libreria Evidenze Scientifiche</h2>
                    </div>
                    <span class="results-counter-pill" id="sources-counter"><strong>...</strong> fonti disponibili</span>
                </div>
                <div id="sources-filter-container"></div>
                <div id="sources-grid" class="scientific-grid"></div>
            `;
            appContainer.appendChild(hubWrapper);

            if (window.App.renderScientificHub) {
                window.App.renderScientificHub('sources-filter-container', 'sources-grid');
            } else {
                const grid = document.getElementById('sources-grid');
                if (grid) grid.innerHTML = '<p class="error-state">Errore: Modulo Scientific Hub non caricato.</p>';
            }
        },

        /**
         * Teardown e rilascio risorse della vista hub scientifico
         * @returns {void}
         */
        cleanup: function () {
            // Teardown se necessario
        }
    };
})();
