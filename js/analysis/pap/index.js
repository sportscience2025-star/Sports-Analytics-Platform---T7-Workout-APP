/**
 * js/analysis/pap/index.js
 * Modulo di aggregazione ed entry point per la suite Post-Activation Potentiation (PAP).
 *
 * Raggruppa ed espone:
 * - PAPIntegrityValidator: validazione balistica cinematica, filtro artefatti TC=-1 e tempi reali
 * - PAPStatsEngine: calcolo MDC 95%, inferenza statistica (p-value, Hedges g), EUR e correlazioni
 * - PAPCoachEngine: diagnosi automatica, dosaggio volumetrico, finestre di recupero e prescrizioni
 * - PAPBenchmarkData: archivio certificato dello studio sperimentale del 28 Luglio 2026
 * - PAPDashboardView: interfaccia utente interattiva con Executive Summary, Master Dashboard e 5 Tab
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    /**
     * Struttura consolidata della suite PAP.
     */
    const PAPAnalysis = {
        get Validator() {
            return root.PAPIntegrityValidator;
        },
        get StatsEngine() {
            return root.PAPStatsEngine;
        },
        get CoachEngine() {
            return root.PAPCoachEngine;
        },
        get BenchmarkData() {
            return root.PAPBenchmarkData;
        },
        get DashboardView() {
            return root.PAPDashboardView;
        },
        get Charts() {
            return root.PAPDashboardCharts;
        },
        get Tabs() {
            return root.PAPDashboardTabs;
        },
        get Export() {
            return root.PAPDashboardExport;
        },

        /**
         * Crea e renderizza direttamente l'interfaccia PAP in un contenitore specifico.
         * @param {string} containerId - ID contenitore DOM.
         * @param {Object} [options={}] - Opzioni addizionali.
         * @returns {PAPDashboardView} Istanza creata e renderizzata.
         */
        initDashboard(containerId, options = {}) {
            if (!this.DashboardView) {
                console.error('[PAPAnalysis] PAPDashboardView non ancora caricato.');
                return null;
            }
            const view = new this.DashboardView(containerId, options);
            view.render();
            return view;
        }
    };

    // Esposizione globale
    root.PAPAnalysis = PAPAnalysis;
})();
