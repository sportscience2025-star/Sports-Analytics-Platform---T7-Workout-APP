/**
 * js/analysis/pap/pap-dashboard-charts.js
 * Modulo Grafici Chart.js per Cruscotto PAP (Minimal Detectable Change, Stiffness, Intra-set Trend, Neuromuscolare).
 *
 * Responsabilità:
 * 1. Rendering e distruzione sicura dei canvas Chart.js per la suite PAP.
 * 2. Visualizzazione variazioni SJ vs soglia metrologica MDC al 95%.
 * 3. Scatter plot bivariato TC vs Altezza per l'analisi della stiffness.
 * 4. Analisi andamento temporale intra-serie dei rimbalzi (confronto PRE vs POST).
 * 5. Scatter Massa vs RSI basale e grafico a barre EUR (CMJ/SJ).
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Costanti Biomeccaniche e di Visualizzazione ---
    const MDC_SJ_PERCENT = 5.4;
    const EUR_HIGH_ELASTIC_THRESHOLD = 1.15;
    const EUR_BALANCED_LOW_THRESHOLD = 1.05;
    const STANDARD_REBOUND_MAX_COUNT = 8;

    const PAPDashboardCharts = {

        /**
         * Renderizza i grafici Chart.js pertinenti al tab attualmente visualizzato.
         * @param {Object} view - Istanza di PAPDashboardView.
         */
        renderTabCharts(view) {
            if (typeof Chart === 'undefined' || !view) return;

            if (view.activeTab === 'mdc') {
                this.renderMdcChart(view);
            } else if (view.activeTab === 'stiffness') {
                this.renderStiffnessCharts(view);
            } else if (view.activeTab === 'neuromuscular') {
                this.renderNeuromuscularCharts(view);
            }
        },

        /**
         * Renderizza il grafico Chart.js delle variazioni SJ vs soglia MDC (±5.4%).
         * @param {Object} view - Istanza di PAPDashboardView.
         */
        renderMdcChart(view) {
            const canvas = document.getElementById('pap-mdc-chart');
            if (!canvas || typeof Chart === 'undefined') return;

            if (view.charts.mdcChart && typeof view.charts.mdcChart.destroy === 'function') {
                view.charts.mdcChart.destroy();
                delete view.charts.mdcChart;
            }

            const labels = view.processedResults.map(r => r.athlete.name);
            const deltas = view.processedResults.map(r => r.sjMdc.deltaPercent);
            const bgColors = deltas.map(d => Math.abs(d) >= MDC_SJ_PERCENT ? (d > 0 ? '#10b981' : '#ef4444') : '#64748b');

            view.charts.mdcChart = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Δ SJ %',
                            data: deltas,
                            backgroundColor: bgColors,
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `Δ SJ: ${ctx.parsed.y.toFixed(2)}% (${Math.abs(ctx.parsed.y) >= MDC_SJ_PERCENT ? 'Oltre MDC ' + MDC_SJ_PERCENT + '%' : 'Entro il rumore'})`
                            }
                        }
                    },
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: {
                            ticks: { color: '#94a3b8' },
                            grid: { color: 'rgba(255,255,255,0.08)' },
                            title: { display: true, text: 'Variazione % nello Squat Jump', color: '#94a3b8' }
                        }
                    }
                }
            });
        },

        /**
         * Renderizza i grafici Chart.js del tab Stiffness (Scatter TC vs H e Trend intra-serie).
         * @param {Object} view - Istanza di PAPDashboardView.
         */
        renderStiffnessCharts(view) {
            if (typeof Chart === 'undefined' || !view) return;

            // 1. Scatter TC vs Altezza
            const canvasScatter = document.getElementById('pap-stiffness-scatter-chart');
            if (canvasScatter) {
                if (view.charts.stiffnessScatter && typeof view.charts.stiffnessScatter.destroy === 'function') {
                    view.charts.stiffnessScatter.destroy();
                    delete view.charts.stiffnessScatter;
                }

                const scatterDatasets = view.processedResults.map((r, idx) => {
                    const colors = ['#00f0ff', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];
                    const col = colors[idx % colors.length];
                    const pts = (r.cleanReboundsPre?.validRebounds || []).map(reb => ({ x: reb.tc, y: reb.height }));
                    return {
                        label: r.athlete.name,
                        data: pts,
                        backgroundColor: col,
                        borderColor: col,
                        pointRadius: 5
                    };
                });

                view.charts.stiffnessScatter = new Chart(canvasScatter.getContext('2d'), {
                    type: 'scatter',
                    data: { datasets: scatterDatasets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { labels: { color: '#cbd5e1', boxWidth: 10 } },
                            tooltip: {
                                callbacks: {
                                    label: (ctx) => `${ctx.dataset.label}: TC ${ctx.parsed.x.toFixed(3)}s, H ${ctx.parsed.y.toFixed(1)}cm`
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: { display: true, text: 'Tempo di Contatto (s)', color: '#94a3b8' },
                                ticks: { color: '#94a3b8' },
                                grid: { color: 'rgba(255,255,255,0.05)' }
                            },
                            y: {
                                title: { display: true, text: 'Altezza di Volo (cm)', color: '#94a3b8' },
                                ticks: { color: '#94a3b8' },
                                grid: { color: 'rgba(255,255,255,0.05)' }
                            }
                        }
                    }
                });
            }

            // 2. Trend intra-serie
            this.renderIntraSetTrendChart(view);
        },

        /**
         * Renderizza o aggiorna il grafico Chart.js dell'andamento intra-serie dei rimbalzi (Tab 3).
         * @param {Object} view - Istanza di PAPDashboardView.
         */
        renderIntraSetTrendChart(view) {
            const canvasTrend = document.getElementById('pap-intraset-trend-chart');
            if (!canvasTrend || typeof Chart === 'undefined' || !view) return;

            if (view.charts.intraTrend && typeof view.charts.intraTrend.destroy === 'function') {
                view.charts.intraTrend.destroy();
                delete view.charts.intraTrend;
            }

            const datasets = [];
            let maxRebounds = STANDARD_REBOUND_MAX_COUNT;

            if (view.selectedTrendAthleteId === 'BENCHMARK_COMPARE') {
                // Prendi i primi due atleti per confronto sintetico
                const first = view.processedResults[0];
                const second = view.processedResults[1];

                if (first) {
                    const fReb = (first.cleanReboundsPre?.validRebounds || []).map(r => r.rsi);
                    maxRebounds = Math.max(maxRebounds, fReb.length);
                    datasets.push({
                        label: `${first.athlete.name} (PRE)`,
                        data: fReb,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        tension: 0.2
                    });
                }
                if (second) {
                    const sReb = (second.cleanReboundsPre?.validRebounds || []).map(r => r.rsi);
                    maxRebounds = Math.max(maxRebounds, sReb.length);
                    datasets.push({
                        label: `${second.athlete.name} (PRE)`,
                        data: sReb,
                        borderColor: '#00f0ff',
                        backgroundColor: 'rgba(0, 240, 255, 0.2)',
                        tension: 0.2
                    });
                }
            } else {
                const targetId = parseInt(view.selectedTrendAthleteId, 10);
                const athResult = view.processedResults.find(r => r.athlete.id === targetId) || view.processedResults[0];
                if (athResult) {
                    const preReb = (athResult.cleanReboundsPre?.validRebounds || []).map(r => r.rsi);
                    const postReb = (athResult.cleanReboundsPost?.validRebounds || []).map(r => r.rsi);
                    maxRebounds = Math.max(maxRebounds, preReb.length, postReb.length);

                    datasets.push({
                        label: `${athResult.athlete.name} – PRE (Basale)`,
                        data: preReb,
                        borderColor: '#00f0ff',
                        backgroundColor: 'rgba(0, 240, 255, 0.15)',
                        tension: 0.2
                    });

                    datasets.push({
                        label: `${athResult.athlete.name} – POST (${athResult.rsiStats.deltaPercent >= 0 ? '+' : ''}${athResult.rsiStats.deltaPercent.toFixed(1)}%)`,
                        data: postReb,
                        borderColor: athResult.rsiStats.deltaPercent >= 0 ? '#10b981' : '#ef4444',
                        backgroundColor: athResult.rsiStats.deltaPercent >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        tension: 0.2
                    });
                }
            }

            const labels = Array.from({ length: maxRebounds }, (_, i) => `Stacco ${i + 1}`);

            view.charts.intraTrend = new Chart(canvasTrend.getContext('2d'), {
                type: 'line',
                data: {
                    labels,
                    datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#cbd5e1' } }
                    },
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: {
                            title: { display: true, text: 'RSI per Stacco', color: '#94a3b8' },
                            ticks: { color: '#94a3b8' },
                            grid: { color: 'rgba(255,255,255,0.05)' }
                        }
                    }
                }
            });
        },

        /**
         * Renderizza i grafici Chart.js del tab Profilo Neuromuscolare (Massa vs RSI ed EUR).
         * @param {Object} view - Istanza di PAPDashboardView.
         */
        renderNeuromuscularCharts(view) {
            if (typeof Chart === 'undefined' || !view) return;

            // 1. Scatter Massa vs RSI
            const canvasMass = document.getElementById('pap-mass-rsi-chart');
            if (canvasMass) {
                if (view.charts.massRsi && typeof view.charts.massRsi.destroy === 'function') {
                    view.charts.massRsi.destroy();
                    delete view.charts.massRsi;
                }

                const points = view.processedResults.map(r => ({
                    x: r.athlete.mass,
                    y: r.rsiStats.preMean,
                    name: r.athlete.name
                }));

                view.charts.massRsi = new Chart(canvasMass.getContext('2d'), {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: 'Atleti (Massa vs RSI)',
                            data: points,
                            backgroundColor: '#00f0ff',
                            borderColor: '#00f0ff',
                            pointRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (ctx) => {
                                        const raw = ctx.raw;
                                        return `${raw.name}: ${raw.x} kg → RSI ${raw.y.toFixed(2)}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: { display: true, text: 'Massa Corporea (kg)', color: '#94a3b8' },
                                ticks: { color: '#94a3b8' },
                                grid: { color: 'rgba(255,255,255,0.05)' }
                            },
                            y: {
                                title: { display: true, text: 'RSI Basale', color: '#94a3b8' },
                                ticks: { color: '#94a3b8' },
                                grid: { color: 'rgba(255,255,255,0.05)' }
                            }
                        }
                    }
                });
            }

            // 2. Bar chart EUR Basale
            const canvasEur = document.getElementById('pap-eur-chart');
            if (canvasEur) {
                if (view.charts.eurChart && typeof view.charts.eurChart.destroy === 'function') {
                    view.charts.eurChart.destroy();
                    delete view.charts.eurChart;
                }

                const labels = view.processedResults.map(r => r.athlete.name);
                const eurVals = view.processedResults.map(r => r.neuromuscular.eurRatio);
                const bgColors = eurVals.map(v => v >= EUR_HIGH_ELASTIC_THRESHOLD ? '#8b5cf6' : (v >= EUR_BALANCED_LOW_THRESHOLD ? '#6366f1' : '#f59e0b'));

                view.charts.eurChart = new Chart(canvasEur.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{
                            label: 'EUR Ratio (CMJ/SJ)',
                            data: eurVals,
                            backgroundColor: bgColors,
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (ctx) => `EUR: ${ctx.parsed.y.toFixed(3)} (${ctx.parsed.y >= EUR_HIGH_ELASTIC_THRESHOLD ? 'Elastico-dipendente' : (ctx.parsed.y >= EUR_BALANCED_LOW_THRESHOLD ? 'Bilanciato' : 'Forza-dipendente')})`
                                }
                            }
                        },
                        scales: {
                            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                            y: {
                                min: 0.9,
                                title: { display: true, text: 'Rapporto EUR (CMJ / SJ)', color: '#94a3b8' },
                                ticks: { color: '#94a3b8' },
                                grid: { color: 'rgba(255,255,255,0.05)' }
                            }
                        }
                    }
                });
            }
        }
    };

    // Esposizione globale
    root.PAPDashboardCharts = PAPDashboardCharts;
})();
