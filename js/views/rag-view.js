/**
 * RAG View Module
 * Gestione dell'interfaccia Retrieval-Augmented Generation e document intelligence
 */
(function () {
    'use strict';

    window.App = window.App || {};
    window.App.Views = window.App.Views || {};

    window.App.Views['rag'] = {
        name: 'rag',
        title: 'Knowledge',

        render: function (appContainer, state) {
            appContainer.innerHTML = `
                <div id="rag-container"></div>
            `;
            if (window.RAGUI) {
                state.ragUI = new window.RAGUI('rag-container');
                state.ragUI.render();
            } else {
                appContainer.innerHTML = '<div style="padding: 2rem;">Errore: Modulo RAG UI non caricato.</div>';
            }
        },

        cleanup: function () {
            // Teardown se necessario
        }
    };
})();
