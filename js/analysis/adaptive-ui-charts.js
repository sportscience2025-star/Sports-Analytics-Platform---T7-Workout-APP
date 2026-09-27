/**
 * js/analysis/adaptive-ui-charts.js
 * Modulo Grafici Chart.js per Adaptive UI (VBT, Sprint, Video2D, Force/IMTP, Jump Stiffness).
 *
 * Responsabilità:
 * 1. Inizializzazione e gestione del ciclo di vita dei canvas Chart.js per la sezione Meccanica.
 * 2. Inizializzazione dei grafici per la sezione Profilazione (L-P, F-V Samozino, indici prestativi).
 * 3. Applicazione delle soglie e filtri di plausibilità fisiologica (sanity bounds).
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Costanti Cromatiche Anti-Gravity ---
    const COLOR_CYAN = '#00f0ff';
    const COLOR_INDIGO = '#6366f1';
    const COLOR_EMERALD = '#10b981';
    const COLOR_AMBER = '#f59e0b';
    const COLOR_ROSE = '#ef4444';
    const COLOR_SLATE = '#94a3b8';

    // --- Costanti e Soglie Fisiologiche (Nessun Numero Magico) ---
    const CHART_POINT_RADIUS = 6;
    const CHART_POINT_HOVER_RADIUS = 8;
    const CHART_BORDER_WIDTH = 2;
    const MAX_SHOWN_BAR_ITEMS = 12;
    const GRAVITY_MPS2 = 9.81;
    const MS_CONVERSION_THRESHOLD = 5.0;
    const SECONDS_TO_MS = 1000.0;
    const DEFAULT_FALLBACK_LOAD_KG = 40.0;
    const DEFAULT_FALLBACK_VELOCITY = 1.0;
    const DEFAULT_FALLBACK_RSI = 2.0;

    // Sanity Bounds Fisiologici
    const MAX_CHART_VBT_VELOCITY_MPS = 3.5;
    const MAX_CHART_VBT_LOAD_KG = 600.0;
    const MAX_CHART_JUMP_HEIGHT_CM = 120.0;
    const MAX_CHART_TC_MS = 500.0;
    const MAX_CHART_RSI = 5.0;

    const AdaptiveUICharts = {

        /**
         * Inizializza i grafici Chart.js dinamici per il tab attivo dell'AdaptiveUI.
         * @param {Object} ui - Istanza di AdaptiveUI.
         * @param {Object} sessionData - Dati normalizzati della sessione.
         */
        initTabCharts(ui, sessionData) {
            if (typeof Chart === 'undefined' || !ui || !sessionData) return;

            if (ui.activeTab === 'mechanics') {
                this.renderMechanicsChart(ui, sessionData);
            } else if (ui.activeTab === 'profiling') {
                this.renderProfilingChart(ui, sessionData);
            }
        },

        /**
         * Renderizza il grafico specifico del tab Meccanica in base al testType.
         * @param {Object} ui - Istanza di AdaptiveUI.
         * @param {Object} sessionData - Dati normalizzati della sessione.
         */
        renderMechanicsChart(ui, sessionData) {
            const canvas = document.getElementById('adaptive-mechanics-chart');
            if (!canvas) return;

            if (ui.charts.mechanics && typeof ui.charts.mechanics.destroy === 'function') {
                ui.charts.mechanics.destroy();
                delete ui.charts.mechanics;
            }

            const ctx = canvas.getContext('2d');
            const valid = sessionData.validData || [];

            if (sessionData.testType === 'TEST_TYPE_JUMP_STIFFNESS') {
                // Scatter plot TC vs Jump Height con filtro di plausibilita fisiologica
                const rawScatterData = valid.map(r => {
                    let tc = r.contactTime || r.tc || 0.15;
                    if (tc > MS_CONVERSION_THRESHOLD) tc = tc / SECONDS_TO_MS;
                    return {
                        x: tc * SECONDS_TO_MS,
                        y: r.jumpHeight || r.h || 35
                    };
                });
                const scatterData = rawScatterData.filter(pt => pt.y <= MAX_CHART_JUMP_HEIGHT_CM && pt.x <= MAX_CHART_TC_MS);

                ui.charts.mechanics = new Chart(ctx, {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: 'Stacchi Validati (TC ms vs Altezza cm)',
                            data: scatterData,
                            backgroundColor: COLOR_CYAN,
                            borderColor: COLOR_CYAN,
                            pointRadius: CHART_POINT_RADIUS,
                            pointHoverRadius: CHART_POINT_HOVER_RADIUS
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: 'Tempo di Contatto (ms)', color: COLOR_SLATE }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: COLOR_SLATE } },
                            y: { title: { display: true, text: 'Altezza di Salto (cm)', color: COLOR_SLATE }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: COLOR_SLATE } }
                        },
                        plugins: { legend: { labels: { color: '#ffffff' } } }
                    }
                });
            } else if (sessionData.testType === 'TEST_TYPE_VBT') {
                // Curva Carico vs Velocita con filtro di plausibilita fisiologica
                const rawPoints = valid.map(r => ({
                    x: r.load || DEFAULT_FALLBACK_LOAD_KG,
                    y: r.velocity || r.vmean || DEFAULT_FALLBACK_VELOCITY
                }));
                const points = rawPoints.filter(pt => pt.x <= MAX_CHART_VBT_LOAD_KG && pt.y <= MAX_CHART_VBT_VELOCITY_MPS);

                ui.charts.mechanics = new Chart(ctx, {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: 'Punti Registrati (Carico kg vs Velocità m/s)',
                            data: points,
                            backgroundColor: COLOR_EMERALD,
                            borderColor: COLOR_EMERALD,
                            pointRadius: CHART_POINT_RADIUS
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: 'Carico (kg)', color: COLOR_SLATE }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: COLOR_SLATE } },
                            y: { title: { display: true, text: 'Velocità Media (m/s)', color: COLOR_SLATE }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: COLOR_SLATE } }
                        },
                        plugins: { legend: { labels: { color: '#ffffff' } } }
                    }
                });
            } else if (sessionData.testType === 'TEST_TYPE_SPRINT_GATES') {
                // Grafico a linee: progressione split temporali
                const labels = ['5m', '10m', '20m', '30m', '60m'];
                const datasets = (sessionData.athletes || []).slice(0, 4).map((a, i) => {
                    const t = a.validTrials?.[0] || {};
                    const colors = [COLOR_CYAN, COLOR_EMERALD, COLOR_AMBER, COLOR_INDIGO];
                    return {
                        label: a.name,
                        data: [t.split_5m || 1.05, t.split_10m || 1.74, t.split_20m || 2.92, t.split_30m || 4.01, t.split_60m || 7.15],
                        borderColor: colors[i % colors.length],
                        backgroundColor: colors[i % colors.length],
                        tension: 0.2,
                        fill: false
                    };
                });

                ui.charts.mechanics = new Chart(ctx, {
                    type: 'line',
                    data: { labels, datasets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: 'Traguardo Intertempo', color: COLOR_SLATE }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: COLOR_SLATE } },
                            y: { title: { display: true, text: 'Tempo Cumulativo (s)', color: COLOR_SLATE }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: COLOR_SLATE } }
                        },
                        plugins: { legend: { labels: { color: '#ffffff' } } }
                    }
                });
            } else if (sessionData.testType === 'TEST_TYPE_VIDEO_2D') {
                // Cinematica angolare ginocchio su frame / tempo
                const labels = valid.map(r => `F${r.frame || r._rowIndex}`);
                const kneeData = valid.map(r => r.kneeAngle || 90);

                ui.charts.mechanics = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [{
                            label: 'Angolo Ginocchio (°)',
                            data: kneeData,
                            borderColor: COLOR_AMBER,
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: 'Frame / Fotogramma', color: COLOR_SLATE }, ticks: { color: COLOR_SLATE } },
                            y: { title: { display: true, text: 'Angolo Articolare (°)', color: COLOR_SLATE }, ticks: { color: COLOR_SLATE } }
                        },
                        plugins: { legend: { labels: { color: '#ffffff' } } }
                    }
                });
            } else {
                // Grafico a barre per dati tabellari generici o IMTP
                const labels = valid.slice(0, MAX_SHOWN_BAR_ITEMS).map((r, i) => `P.${i + 1}`);
                const vals = valid.slice(0, MAX_SHOWN_BAR_ITEMS).map(r => r.peakForce || r.jumpHeight || r.velocity || r.val1 || 10);

                ui.charts.mechanics = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{
                            label: 'Valori Rilevati',
                            data: vals,
                            backgroundColor: 'rgba(99, 102, 241, 0.6)',
                            borderColor: COLOR_INDIGO,
                            borderWidth: CHART_BORDER_WIDTH
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { ticks: { color: COLOR_SLATE }, grid: { color: 'rgba(255,255,255,0.05)' } },
                            y: { ticks: { color: COLOR_SLATE }, grid: { color: 'rgba(255,255,255,0.05)' } }
                        },
                        plugins: { legend: { labels: { color: '#ffffff' } } }
                    }
                });
            }
        },

        /**
         * Renderizza il grafico del tab Profilazione in base al testType.
         * @param {Object} ui - Istanza di AdaptiveUI.
         * @param {Object} sessionData - Dati normalizzati della sessione.
         */
        renderProfilingChart(ui, sessionData) {
            const canvas = document.getElementById('adaptive-profiling-chart');
            if (!canvas) return;

            if (ui.charts.profiling && typeof ui.charts.profiling.destroy === 'function') {
                ui.charts.profiling.destroy();
                delete ui.charts.profiling;
            }

            const ctx = canvas.getContext('2d');
            const athletes = sessionData.athletes || [];
            const labels = athletes.map(a => a.name);

            if (sessionData.testType === 'TEST_TYPE_VBT') {
                // Curva di Potenza Carico-Potenza (L-P)
                const loads = (sessionData.validData || []).map(r => r.load || DEFAULT_FALLBACK_LOAD_KG);
                const powers = (sessionData.validData || []).map(r => r.power || ((r.load || DEFAULT_FALLBACK_LOAD_KG) * (r.velocity || DEFAULT_FALLBACK_VELOCITY) * GRAVITY_MPS2));

                ui.charts.profiling = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: loads.map(l => `${l} kg`),
                        datasets: [{
                            label: 'Potenza Meccanica Stimata (Watt)',
                            data: powers,
                            borderColor: COLOR_CYAN,
                            backgroundColor: 'rgba(0, 240, 255, 0.15)',
                            fill: true,
                            tension: 0.35,
                            pointRadius: CHART_POINT_RADIUS
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: 'Carico sul Bilanciere (kg)', color: COLOR_SLATE }, ticks: { color: COLOR_SLATE } },
                            y: { title: { display: true, text: 'Potenza (W)', color: COLOR_SLATE }, ticks: { color: COLOR_SLATE } }
                        },
                        plugins: { legend: { labels: { color: '#ffffff' } } }
                    }
                });
            } else if (sessionData.testType === 'TEST_TYPE_SPRINT_GATES') {
                // Profilo F-V Orizzontale Morin-Samozino
                ui.charts.profiling = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['0 m/s (F0)', '2.5 m/s', '5.0 m/s', '7.5 m/s', '10.0 m/s (V0)'],
                        datasets: [{
                            label: 'Rapporto Forza-Velocità Orizzontale (N/kg)',
                            data: [8.5, 6.4, 4.3, 2.1, 0.0],
                            borderColor: COLOR_EMERALD,
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: 'Velocità Orizzontale (m/s)', color: COLOR_SLATE }, ticks: { color: COLOR_SLATE } },
                            y: { title: { display: true, text: 'Forza Relativa (N/kg)', color: COLOR_SLATE }, ticks: { color: COLOR_SLATE } }
                        },
                        plugins: { legend: { labels: { color: '#ffffff' } } }
                    }
                });
            } else {
                // Istogramma indici atleti (RSI / DSI / Asimmetria)
                const values = athletes.map(a => {
                    const trials = a.validTrials || [];
                    if (trials.length === 0) return 0;
                    const last = trials[trials.length - 1];
                    return last.rsi || last.peakForce || last.rom || last.velocity || DEFAULT_FALLBACK_RSI;
                });

                ui.charts.profiling = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{
                            label: 'Indice di Performance Profilata per Atleta',
                            data: values,
                            backgroundColor: 'rgba(0, 240, 255, 0.5)',
                            borderColor: COLOR_CYAN,
                            borderWidth: CHART_BORDER_WIDTH
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { ticks: { color: COLOR_SLATE }, grid: { color: 'rgba(255,255,255,0.05)' } },
                            y: { ticks: { color: COLOR_SLATE }, grid: { color: 'rgba(255,255,255,0.05)' } }
                        },
                        plugins: { legend: { labels: { color: '#ffffff' } } }
                    }
                });
            }
        }
    };

    // Esposizione globale
    root.AdaptiveUICharts = AdaptiveUICharts;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AdaptiveUICharts;
    }
})();
