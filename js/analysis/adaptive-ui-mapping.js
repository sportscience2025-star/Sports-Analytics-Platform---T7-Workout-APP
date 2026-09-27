/**
 * js/analysis/adaptive-ui-mapping.js
 * Modulo di Mappatura Assistita delle Colonne per Dataset Generici (TEST_TYPE_GENERIC).
 *
 * Responsabilità:
 * 1. Generazione del markup HTML per la finestra modale di associazione campi/colonne.
 * 2. Selezione dinamica del protocollo target (Jump Stiffness, VBT, Sprint, Video2D, Force/IMTP).
 * 3. Associazione interattiva delle metriche primarie e secondarie dai dati grezzi.
 * 4. Applicazione della mappatura tramite DataClassifier e re-rendering della dashboard.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Costanti Cromatiche ---
    const COLOR_CYAN = '#00f0ff';
    const COLOR_INDIGO = '#6366f1';
    const COLOR_SLATE = '#94a3b8';

    const AdaptiveUIMapping = {

        /**
         * Genera l'HTML della modale non invasiva per la mappatura assistita delle colonne.
         * @param {Object} sessionData - Payload normalizzato della sessione.
         * @returns {string} Stringa HTML della modale.
         */
        renderAssistedMappingModalHtml(sessionData) {
            const headers = sessionData?.headers || [];
            const testTypes = [
                { id: 'TEST_TYPE_JUMP_STIFFNESS', label: 'Salti Verticali & Stiffness (TC, TF, Altezza Salto)' },
                { id: 'TEST_TYPE_VBT', label: 'VBT Velocity-Based Training (Carico, Velocità Media)' },
                { id: 'TEST_TYPE_SPRINT_GATES', label: 'Sprint & Fotocellule (Split 10m, Tempo Totale)' },
                { id: 'TEST_TYPE_VIDEO_2D', label: 'Videoanalisi Cinematica 2D (Angoli Articolari, ROM)' },
                { id: 'TEST_TYPE_FORCE_ISOMETRIC', label: 'Pedana di Forza IMTP (Picco Forza, RFD)' }
            ];

            return `
                <div class="assisted-mapping-modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.75); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                    <div style="background: #0f172a; border: 1px solid rgba(0,240,255,0.4); border-radius: 16px; padding: 1.75rem; width: 90%; max-width: 580px; display: flex; flex-direction: column; gap: 1.25rem; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h3 style="margin: 0; color: #ffffff; font-size: 1.15rem; font-weight: 800;">
                                Mappatura Assistita Colonne Dataset
                            </h3>
                            <button id="btn-close-mapping-modal" style="background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer;">&times;</button>
                        </div>
                        <p style="margin: 0; color: ${COLOR_SLATE}; font-size: 0.85rem; line-height: 1.5;">
                            Seleziona la tipologia di test e assegna le colonne corrispondenti del file caricato. La dashboard si riconfigurerà istantaneamente.
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                            <div>
                                <label style="display: block; font-size: 0.78rem; font-weight: 700; color: ${COLOR_CYAN}; margin-bottom: 0.3rem;">Protocollo di Test Target:</label>
                                <select id="mapping-target-type" style="width: 100%; padding: 0.55rem; background: rgba(15,23,42,0.8); color: #ffffff; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;">
                                    ${testTypes.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
                                </select>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                                <div>
                                    <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.2rem;">Colonna Atleta:</label>
                                    <select id="mapping-col-athlete" style="width: 100%; padding: 0.45rem; background: rgba(15,23,42,0.8); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;">
                                        <option value="">-- Seleziona --</option>
                                        ${headers.map(h => `<option value="${h}">${h}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.2rem;">Colonna Esercizio / Prova:</label>
                                    <select id="mapping-col-exercise" style="width: 100%; padding: 0.45rem; background: rgba(15,23,42,0.8); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;">
                                        <option value="">-- Seleziona --</option>
                                        ${headers.map(h => `<option value="${h}">${h}</option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                                <div>
                                    <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.2rem;">Metrica Primaria (Carico / Altezza / Split 10m):</label>
                                    <select id="mapping-col-metric1" style="width: 100%; padding: 0.45rem; background: rgba(15,23,42,0.8); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;">
                                        <option value="">-- Seleziona --</option>
                                        ${headers.map(h => `<option value="${h}">${h}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.2rem;">Metrica Secondaria (Velocità / TC / Split Totale):</label>
                                    <select id="mapping-col-metric2" style="width: 100%; padding: 0.45rem; background: rgba(15,23,42,0.8); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;">
                                        <option value="">-- Seleziona --</option>
                                        ${headers.map(h => `<option value="${h}">${h}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem;">
                            <button id="btn-cancel-mapping" style="padding: 0.55rem 1rem; border-radius: 8px; background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); font-weight: 600; cursor: pointer;">
                                Annulla
                            </button>
                            <button id="btn-apply-mapping" style="padding: 0.55rem 1.25rem; border-radius: 8px; background: linear-gradient(135deg, ${COLOR_CYAN}, ${COLOR_INDIGO}); color: #080c16; font-weight: 800; border: none; cursor: pointer;">
                                Applica e Riconfigura
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Applica la mappatura selezionata riconfigurando il dataset della sessione.
         * @param {Object} ui - Istanza di AdaptiveUI.
         * @param {Object} sessionData - Payload normalizzato della sessione.
         */
        applyMapping(ui, sessionData) {
            const container = ui.container;
            if (!container) return;

            const targetType = container.querySelector('#mapping-target-type')?.value;
            const athleteCol = container.querySelector('#mapping-col-athlete')?.value;
            const exerciseCol = container.querySelector('#mapping-col-exercise')?.value;
            const metric1Col = container.querySelector('#mapping-col-metric1')?.value;
            const metric2Col = container.querySelector('#mapping-col-metric2')?.value;

            if (root.DataClassifier && typeof root.DataClassifier.mapGenericDataToTestType === 'function') {
                const remapped = root.DataClassifier.mapGenericDataToTestType(
                    sessionData.rawData,
                    { athleteCol, exerciseCol, metric1Col, metric2Col },
                    targetType,
                    sessionData.metadata?.filename || 'dataset_mappato.xlsx'
                );
                ui.isMappingModalOpen = false;
                ui.render(remapped);
            }
        }
    };

    // Esposizione globale
    root.AdaptiveUIMapping = AdaptiveUIMapping;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AdaptiveUIMapping;
    }
})();
