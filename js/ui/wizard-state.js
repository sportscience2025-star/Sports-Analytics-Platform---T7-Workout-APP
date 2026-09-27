/**
 * wizard-state.js
 * ═══════════════════════════════════════════════════════════════════
 * Gestione centralizzata dello stato del programma di allenamento attivo.
 *
 * RESPONSABILITA':
 *   - Lettura/scrittura del programma corrente in localStorage (chiave: 't7_current_program')
 *   - Reset del programma con conferma utente
 *   - Salvataggio parametri wizard (chiave: 't7_prog_params')
 *
 * FUNZIONI ESPOSTE:
 *   - window.App.clearCurrentProgram()         -> Cancella programma attivo
 *   - window.App.resetWizardWithConfirmation() -> Reset con confirm() dialog
 *   - window.App.getProgramState()             -> Legge programma da memoria o localStorage
 *   - window.App.saveProgramState(program)     -> Salva programma in memoria e localStorage
 *
 * DIPENDENZE: Nessuna (file autonomo, deve caricare PRIMO nella catena wizard)
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};

    const STORAGE_KEY_CURRENT_PROGRAM = 't7_current_program';
    const STORAGE_KEY_PROG_PARAMS = 't7_prog_params';

    /**
     * Resetta lo stato del programma attivo in memoria e nel localStorage
     * @returns {void}
     */
    window.App.clearCurrentProgram = function () {
        if (window.App.state) {
            window.App.state.currentProgram = null;
        }
        window.App.currentProgram = null;
        try {
            localStorage.removeItem(STORAGE_KEY_CURRENT_PROGRAM);
        } catch (_) {}
    };

    /**
     * Richiede conferma all'utente per scartare il programma attivo e riaprire il wizard
     * @returns {void}
     */
    window.App.resetWizardWithConfirmation = function () {
        const confirmReset = confirm('Hai un programma generato attivo. Vuoi scartarlo per crearne uno nuovo?');
        if (confirmReset) {
            window.App.clearCurrentProgram();
            if (typeof window.App.switchView === 'function') {
                window.App.switchView('wizard');
            } else {
                const container = document.getElementById('wizard-container') || document.getElementById('app-container');
                if (container && typeof window.App.renderWizard === 'function') {
                    window.App.renderWizard('wizard-container');
                }
            }
        }
    };

    /**
     * Legge il programma corrente dalla memoria applicativa o dal localStorage come fallback
     * @returns {Object|null} Oggetto programma attivo o null se non presente
     */
    window.App.getProgramState = function () {
        if (window.App.state && window.App.state.currentProgram) {
            return window.App.state.currentProgram;
        }
        if (window.App.currentProgram) {
            return window.App.currentProgram;
        }
        try {
            const raw = localStorage.getItem(STORAGE_KEY_CURRENT_PROGRAM);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (window.App.state) {
                    window.App.state.currentProgram = parsed;
                }
                window.App.currentProgram = parsed;
                return parsed;
            }
        } catch (_) {}
        return null;
    };

    /**
     * Salva lo stato del programma sia nello stato in memoria sia in localStorage
     * @param {Object} program - Oggetto programma generato/modificato
     * @returns {void}
     */
    window.App.saveProgramState = function (program) {
        if (window.App.state) {
            window.App.state.currentProgram = program;
        }
        window.App.currentProgram = program;
        try {
            if (program) {
                localStorage.setItem(STORAGE_KEY_CURRENT_PROGRAM, JSON.stringify(program));
            } else {
                localStorage.removeItem(STORAGE_KEY_CURRENT_PROGRAM);
            }
        } catch (_) {}
    };

})();
