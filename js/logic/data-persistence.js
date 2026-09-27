/**
 * js/logic/data-persistence.js
 * DATA PERSISTENCE — Export / Import (Local JSON backup & restore)
 * Saves all user data as a JSON file the user can store anywhere (e.g. E:\)
 */

(function () {
    'use strict';

    window.App = window.App || {};

    /**
     * Raccoglie tutti i dati da localStorage e avvia il download del file JSON di backup.
     */
    window.App.exportAllData = function () {
        const APP_VERSION = '13';

        // Raccoglie tutte le chiavi localStorage utilizzate dall'app
        const snapshot = {
            __meta: {
                appVersion: APP_VERSION,
                exportedAt: new Date().toISOString(),
                exportedAtLocal: new Date().toLocaleString('it-IT'),
                totalExercisesInCatalog: (window.App.getExercises ? window.App.getExercises().length : null)
            },
            t7_favorites:          JSON.parse(localStorage.getItem('t7_favorites'))          || [],
            t7_prog_params:        JSON.parse(localStorage.getItem('t7_prog_params'))        || {},
            t7_temp_pathologies:   JSON.parse(localStorage.getItem('t7_temp_pathologies'))   || [],
            t7_last_export:        localStorage.getItem('t7_last_export')                    || null
        };

        // Serializzazione e download nel browser
        const json    = JSON.stringify(snapshot, null, 2);
        const blob    = new Blob([json], { type: 'application/json' });
        const url     = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split('T')[0]; // es. 2026-09-11
        const a       = document.createElement('a');
        a.href        = url;
        a.download    = `t7_workout_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Memorizza timestamp dell'ultimo export
        localStorage.setItem('t7_last_export', new Date().toISOString());

        return snapshot.__meta;
    };

    /**
     * Importa un file di backup JSON precedentemente esportato.
     * Ripristina i dati in localStorage e ricarica l'applicazione.
     * @param {File} file — il file .json selezionato dall'utente
     */
    window.App.importAllData = function (file) {
        if (!file || file.type !== 'application/json') {
            alert('⚠️ File non valido. Seleziona un file .json esportato da T7 Workout.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);

                // Validazione di base — deve contenere il campo __meta
                if (!data.__meta) {
                    alert('⚠️ Il file non è un backup valido di T7 Workout.');
                    return;
                }

                const confirmed = confirm(
                    `📦 Stai per importare un backup salvato il:\n` +
                    `${data.__meta.exportedAtLocal || data.__meta.exportedAt}\n\n` +
                    `Questa operazione sovrascriverà i dati attuali.\nContinuare?`
                );
                if (!confirmed) return;

                // Ripristina ciascuna chiave (escludendo __meta)
                const RESTORABLE_KEYS = [
                    't7_favorites',
                    't7_prog_params',
                    't7_temp_pathologies',
                    't7_last_export'
                ];

                RESTORABLE_KEYS.forEach(key => {
                    if (data[key] !== undefined && data[key] !== null) {
                        const value = typeof data[key] === 'string'
                            ? data[key]
                            : JSON.stringify(data[key]);
                        localStorage.setItem(key, value);
                    }
                });

                alert('✅ Backup importato con successo!\nL\'app verrà ricaricata.');
                location.reload();

            } catch (err) {
                alert('❌ Errore durante la lettura del file:\n' + err.message);
                console.error('[App] Import error:', err);
            }
        };
        reader.readAsText(file);
    };

})();
