/**
 * Data Layer Entrypoint & Loader (Backward-Compatible Orchestrator)
 * Carica ed espone in sequenza: taxonomy.js, conditions.js, exercises.js, init.js, filters.js
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
            path.join(baseDir, 'data'),
            path.join(baseDir, 'js', 'data'),
            path.join(baseDir, '..', 'js', 'data'),
            'js/data',
            'data'
        ];
        let dataDir = null;
        for (const c of candidates) {
            try {
                if (fs.existsSync(path.join(c, 'taxonomy.js'))) {
                    dataDir = c;
                    break;
                }
            } catch (e) {}
        }
        if (dataDir) {
            const files = ['taxonomy.js', 'conditions.js', 'exercises.js', 'init.js', 'filters.js'];
            for (const f of files) {
                const p = path.join(dataDir, f);
                try {
                    if (fs.existsSync(p)) {
                        const code = fs.readFileSync(p, 'utf8');
                        eval(code);
                    }
                } catch (e) {
                    console.error('[Data Loader] Errore caricamento', p, e);
                }
            }
        }
    } else {
        // Ambiente Browser: assicura che initData sia stato eseguito
        if (typeof window.App.initData === 'function' && !window.App._dataInitialized) {
            window.App.initData();
        }
    }
})();
