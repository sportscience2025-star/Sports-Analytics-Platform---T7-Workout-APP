/**
 * Wizard View Module
 * Gestione della programmazione allenamento guidata dall'IA
 */
(function () {
    'use strict';

    window.App = window.App || {};
    window.App.Views = window.App.Views || {};

    window.App.Views['wizard'] = {
        name: 'wizard',
        title: 'Programmazione Guidata',

        render: function (appContainer, state) {
            appContainer.innerHTML = `
                <div id="wizard-container"></div>
            `;

            const activeProgram = state.currentProgram || (function () {
                try {
                    const stored = localStorage.getItem('t7_current_program');
                    return stored ? JSON.parse(stored) : null;
                } catch (_) { return null; }
            })();

            if (activeProgram) {
                state.currentProgram = activeProgram;
                window.App.renderWizard('wizard-container');
                const wContainer = document.getElementById('wizard-container');
                if (wContainer) {
                    const intakeWrap = wContainer.querySelector('.intake-wrapper');
                    const resultEl = wContainer.querySelector('#prog-result');
                    if (intakeWrap) intakeWrap.style.display = 'none';
                    if (resultEl) {
                        resultEl.classList.remove('hidden');
                        window.App.renderProgramResult('prog-result', activeProgram);
                    }
                }
            } else {
                window.App.renderWizard('wizard-container', async (preferences, program) => {
                    const finalProgram = program || (window.AI?.generateFullProgram ? await window.AI.generateFullProgram(preferences) : null);
                    if (finalProgram) {
                        state.currentProgram = finalProgram;
                        if (!program) {
                            window.App.saveProgramState?.(finalProgram);
                            window.App.renderProgramResult('wizard-container', finalProgram);
                        }
                    }
                });
            }
        },

        cleanup: function () {
            if (window.App.SwapManager && typeof window.App.SwapManager.cleanup === 'function') {
                window.App.SwapManager.cleanup();
            }
        }
    };
})();
