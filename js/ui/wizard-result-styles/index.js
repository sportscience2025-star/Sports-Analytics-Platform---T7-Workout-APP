/**
 * js/ui/wizard-result-styles/index.js
 * ═══════════════════════════════════════════════════════════════════
 * Entry point per gli stili CSS del report risultato programmazione.
 * Concatena i moduli CSS registrati preservando rigorosamente
 * l'ordine di specificita e cascata, garantendo l'idempotenza
 * dell'inserimento nel DOM tramite l'elemento #result-view-styles.
 *
 * FUNZIONE ESPOSTA:
 *   - window.App.injectResultStyles() -> Inietta CSS nel DOM (una sola volta)
 *
 * DIPENDENZE:
 *   - 01-report-shell.js
 *   - 02-progression-bibliography.js
 *   - 03-exercise-table.js
 *   - 04-exercise-overlays.js
 *   - 05-actions-toast.js
 *   - 06-responsive.js
 *   - 07-print.js
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};

    const STYLES_ELEMENT_ID = 'result-view-styles';

    // Ordine di concatenazione tassativo per preservare cascata e specificita CSS
    const ORDERED_CHUNKS = [
        'reportShell',
        'progressionBibliography',
        'exerciseTable',
        'exerciseOverlays',
        'actionsToast',
        'responsive',
        'print'
    ];

    /**
     * Inietta gli stili CSS del report di programmazione nel DOM se non gia presenti.
     * Concatena tutti i moduli registrati nell'ordine corretto garantendo idempotenza.
     * @returns {void}
     */
    window.App.injectResultStyles = function () {
        if (document.getElementById(STYLES_ELEMENT_ID)) {
            return;
        }

        const chunks = (window.App.ResultStyles && window.App.ResultStyles.chunks) || {};
        const combinedCss = ORDERED_CHUNKS
            .map(function (key) {
                return chunks[key] || '';
            })
            .join('\n');

        const style = document.createElement('style');
        style.id = STYLES_ELEMENT_ID;
        style.textContent = combinedCss;
        document.head.appendChild(style);
    };
})();
