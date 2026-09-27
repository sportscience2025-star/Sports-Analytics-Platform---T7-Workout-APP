/**
 * UI Layer Entrypoint & Loader (Backward-Compatible Orchestrator)
 * Carica ed espone in sequenza: helpers.js, favorites.js, wizard.js,
 * export.js, render-filters.js, add-exercise-modal.js, catalog.js, scientific-hub.js
 * Mantiene la compatibilità al 100% con test e harness esistenti.
 */
(function () {
    'use strict';

    window.App = window.App || {};

    // Supporto per esecuzione in ambienti Node.js / test runner (eval via loadModule)
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const baseDir = typeof __dirname !== 'undefined' ? __dirname : '.';
        const candidates = [
            path.join(baseDir, 'ui'),
            path.join(baseDir, 'js', 'ui'),
            path.join(baseDir, '..', 'js', 'ui'),
            'js/ui',
            'ui'
        ];
        let uiDir = null;
        for (const c of candidates) {
            try {
                if (fs.existsSync(path.join(c, 'helpers.js'))) {
                    uiDir = c;
                    break;
                }
            } catch (e) {}
        }
        if (uiDir) {
            const files = [
                'helpers.js',
                'favorites.js',
                'exercise-detail-resolver.js',
                'wizard.js',
                'export.js',
                'render-filters.js',
                'add-exercise-modal.js',
                'catalog.js',
                'scientific-hub.js'
            ];
            for (const f of files) {
                const p = path.join(uiDir, f);
                try {
                    if (fs.existsSync(p)) {
                        const code = fs.readFileSync(p, 'utf8');
                        eval(code);
                    }
                } catch (e) {
                    console.error('[UI Loader] Errore caricamento', p, e);
                }
            }
        }
    }
    // In ambiente browser i file sono già caricati via <script> in index.html
})();
