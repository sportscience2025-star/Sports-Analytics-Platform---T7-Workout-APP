/**
 * data-analysis.js
 * UI and Controller for the Data Analysis & VBT section (V4 Multi-Athlete & NLP).
 */

(function () {
    'use strict';

    // --- Costanti Operative e Limiti per Fallback Analisi Dati ---
    const PERCENT_MULTIPLIER = 100;
    const DECIMAL_RADIX = 10;
    const FALLBACK_MAX_HEADER_SCAN = 10;
    const DEFAULT_REPS_COUNT = 1;
    const DEFAULT_ATHLETE_FALLBACK = 'Atleta';
    const DEFAULT_EXERCISE_FALLBACK = 'Generale';
    const RESILIENT_INSTRUMENT_TYPE = 'GENERAL_TABULAR';
    const RESILIENT_INSTRUMENT_LABEL = 'Dataset Excel (Modalità Resiliente)';

    // --- Chart.js Neon Glow Plugin (Milestone 2) ---
    const neonGlowPlugin = {
        id: 'neonGlow',
        beforeDatasetDraw(chart, args) {
            const { ctx } = chart;
            const dataset = chart.data.datasets[args.index];
            if (dataset && dataset.glow !== false) {
                ctx.save();
                const glowColor = dataset.glowColor || dataset.borderColor || dataset.backgroundColor || '#00f0ff';
                const glowBlur = dataset.glowBlur !== undefined ? dataset.glowBlur : 15;
                if (glowColor && typeof glowColor === 'string') {
                    ctx.shadowColor = glowColor;
                    ctx.shadowBlur = glowBlur;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }
            }
        },
        afterDatasetDraw(chart, args) {
            const { ctx } = chart;
            const dataset = chart.data.datasets[args.index];
            if (dataset && dataset.glow !== false) {
                ctx.restore();
            }
        }
    };

    // --- Chart.js Custom Glassmorphism Tooltip Handler (Milestone 2) ---
    const glassTooltipHandler = function(context) {
        const { chart, tooltip } = context;
        let tooltipEl = document.getElementById('chartjs-glass-tooltip');

        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-glass-tooltip';
            tooltipEl.className = 'glass-tooltip';
            document.body.appendChild(tooltipEl);
        }

        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = '0';
            tooltipEl.style.pointerEvents = 'none';
            return;
        }

        if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map(b => b.lines);

            let innerHtml = '';
            if (titleLines.length > 0) {
                innerHtml += `<div class="glass-tooltip-title">${titleLines.join('<br>')}</div>`;
            }

            innerHtml += '<div class="glass-tooltip-body">';
            bodyLines.forEach((body, i) => {
                const colors = tooltip.labelColors[i] || {};
                const color = colors.borderColor || colors.backgroundColor || '#00f0ff';
                const colorStr = typeof color === 'string' ? color : '#00f0ff';
                const span = `<span class="glass-tooltip-indicator" style="background:${colorStr}; box-shadow: 0 0 8px ${colorStr};"></span>`;
                innerHtml += `<div class="glass-tooltip-item">${span} <span>${body}</span></div>`;
            });
            innerHtml += '</div>';

            tooltipEl.innerHTML = innerHtml;
        }

        const position = chart.canvas.getBoundingClientRect();
        const bodyScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const bodyScrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        tooltipEl.style.opacity = '1';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.left = position.left + bodyScrollLeft + tooltip.caretX + 'px';
        tooltipEl.style.top = position.top + bodyScrollTop + tooltip.caretY - 10 + 'px';
    };

    // --- Chart.js VBT Velocity Zones Background Plugin ---
    const vbtZonesPlugin = {
        id: 'vbtZones',
        beforeDraw(chart) {
            const { ctx, chartArea, scales } = chart;
            if (!chartArea || !scales || !scales.y || !scales.x) return;
            const yScale = scales.y;
            const { left, right, top, bottom } = chartArea;

            // 4 fasce VBT:
            // 1. Forza Massima (< 0.50 m/s, rgba(239,68,68,0.08))
            // 2. Forza-Velocità (0.50 - 0.75 m/s, rgba(245,158,11,0.08))
            // 3. Velocità-Forza (0.75 - 1.00 m/s, rgba(59,130,246,0.08))
            // 4. Velocità Pura (> 1.00 m/s, rgba(16,185,129,0.08))
            const zones = [
                { min: 0, max: 0.50, color: 'rgba(239, 68, 68, 0.08)', label: 'Forza Massima (<0.50 m/s)', textColor: 'rgba(239, 68, 68, 0.65)' },
                { min: 0.50, max: 0.75, color: 'rgba(245, 158, 11, 0.08)', label: 'Forza-Velocità (0.50-0.75 m/s)', textColor: 'rgba(245, 158, 11, 0.65)' },
                { min: 0.75, max: 1.00, color: 'rgba(59, 130, 246, 0.08)', label: 'Velocità-Forza (0.75-1.00 m/s)', textColor: 'rgba(59, 130, 246, 0.65)' },
                { min: 1.00, max: Math.max(1.8, yScale.max || 1.8), color: 'rgba(16, 185, 129, 0.08)', label: 'Velocità Pura (>1.00 m/s)', textColor: 'rgba(16, 185, 129, 0.65)' }
            ];

            ctx.save();
            zones.forEach(z => {
                const valTop = Math.min(z.max, yScale.max);
                const valBottom = Math.max(z.min, yScale.min);
                if (valTop <= valBottom) return;

                const yPixelTop = yScale.getPixelForValue(valTop);
                const yPixelBottom = yScale.getPixelForValue(valBottom);

                const drawTop = Math.max(top, yPixelTop);
                const drawBottom = Math.min(bottom, yPixelBottom);
                const h = drawBottom - drawTop;

                if (h > 0) {
                    ctx.fillStyle = z.color;
                    ctx.fillRect(left, drawTop, right - left, h);

                    // Etichetta discreta della zona VBT sul bordo destro
                    ctx.font = '600 10px Inter, -apple-system, sans-serif';
                    ctx.fillStyle = z.textColor;
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'top';
                    ctx.fillText(z.label, right - 8, drawTop + 4);
                }
            });
            ctx.restore();
        }
    };

    function extractMVT(text, exercise) {
        if (!text || !exercise) return null;
        const lowerText = text.toLowerCase();
        const lowerExercise = exercise.toLowerCase();
        
        // 1. Try regex with exercise name and MVT sequence
        const specificRegex = new RegExp(lowerExercise + '\\s+mvt\\s*(?:di|da|a|:|==?|\\s)\\s*(0\\.\\d+)', 'i');
        let match = lowerText.match(specificRegex);
        if (match && match[1]) {
            return parseFloat(match[1]);
        }

        // Another pattern
        const specificRegex2 = new RegExp('mvt\\s*(?:di|da|a|:|==?|\\s|per|lo|il)*\\s*' + lowerExercise + '\\s*(?:di\\s*circa|di|da|a|:|==?|\\s)*\\s*(0\\.\\d+)', 'i');
        match = lowerText.match(specificRegex2);
        if (match && match[1]) {
            return parseFloat(match[1]);
        }

        // Another pattern: vicinity match
        const exerciseIndex = lowerText.indexOf(lowerExercise);
        if (exerciseIndex !== -1) {
            const startLoc = Math.max(0, exerciseIndex - 150);
            const vicinity = lowerText.substring(startLoc, Math.min(lowerText.length, exerciseIndex + 200));
            const mvtRegex = /mvt\s*(?:di|da|a|:|==?|\s)\s*(0\.\d+)/gi;
            let matchObj;
            while ((matchObj = mvtRegex.exec(vicinity)) !== null) {
                if (matchObj[1]) {
                    const mvtValueStr = matchObj[1];
                    const matchStartInText = startLoc + matchObj.index;
                    const mvtValueStartInText = matchStartInText + matchObj[0].indexOf(mvtValueStr);
                    
                    // Verify if another exercise name is closer or in-between
                    const commonExercises = ['bench press', 'bench', 'panca', 'squat', 'deadlift', 'stacco', 'overhead press', 'ohp', 'military press', 'lento avanti', 'trazioni', 'chin-up', 'pull-up', 'leg press', 'curl'];
                    let isFalseMatch = false;
                    for (const otherEx of commonExercises) {
                        if (otherEx === lowerExercise || otherEx.includes(lowerExercise) || lowerExercise.includes(otherEx)) {
                            continue;
                        }
                        let tempIdx = lowerText.indexOf(otherEx);
                        while (tempIdx !== -1) {
                            const distTarget = Math.abs(exerciseIndex - mvtValueStartInText);
                            const distOther = Math.abs(tempIdx - mvtValueStartInText);
                            
                            const isBetween = (exerciseIndex < tempIdx && tempIdx < mvtValueStartInText) ||
                                              (mvtValueStartInText < tempIdx && tempIdx < exerciseIndex);
                                              
                            if (distOther < distTarget || isBetween) {
                                isFalseMatch = true;
                                break;
                            }
                            tempIdx = lowerText.indexOf(otherEx, tempIdx + 1);
                        }
                        if (isFalseMatch) break;
                    }
                    if (!isFalseMatch) {
                        return parseFloat(mvtValueStr);
                    }
                }
            }
        }
        return null;
    }

    window.DataAnalysisUI = class DataAnalysis {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.reactiveGrid = null;
            this.chartInstance = null;
            this.powerCurveChart = null;
            this.jumpHeightChart = null;
            this.rsiChart = null;
            this.customCharts = [];
            this.parseResult = null; // Holds { rawData, athletes, exercises }
            this.selectedAthlete = null;
            this.selectedExercise = null;
            this._isRecalculating = false;
        }

        cleanup() {
            const tooltipEl = document.getElementById('chartjs-glass-tooltip');
            if (tooltipEl) tooltipEl.remove();

            if (this.chartInstance) {
                this.chartInstance.destroy();
                this.chartInstance = null;
            }
            if (this.powerCurveChart) {
                this.powerCurveChart.destroy();
                this.powerCurveChart = null;
            }
            if (this.jumpHeightChart) {
                this.jumpHeightChart.destroy();
                this.jumpHeightChart = null;
            }
            if (this.rsiChart) {
                this.rsiChart.destroy();
                this.rsiChart = null;
            }
            if (this.customCharts && Array.isArray(this.customCharts)) {
                this.customCharts.forEach(c => {
                    if (c && typeof c.destroy === 'function') c.destroy();
                });
                this.customCharts = [];
            }
        }

        render() {
            if (!this.container) return;

            this.container.innerHTML = `
                <div class="analysis-container" style="max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem;">
                    <!-- HEADER SECTION -->
                    <div style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
                        <h2 style="font-size: 1.8rem; margin: 0 0 0.25rem 0; color: white;">Data Analisi Biomeccanica & Prestazione</h2>
                        <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">Flusso integrato seamless: ingestione file, compilazione reattiva e cruscotto prestazionale live-binding.</p>
                    </div>

                    <!-- UNIFIED TOP CONTROL PANEL -->
                    <div class="analysis-unified-top-panel" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
                        <!-- COMPACT DROPZONE -->
                        <div class="drop-zone" id="vbt-drop-zone" style="border: 2px dashed rgba(0, 240, 255, 0.35); background: rgba(15, 23, 42, 0.5); border-radius: 10px; padding: 1rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s ease;">
                            <p style="margin: 0; font-size: 0.95rem; font-weight: 600; color: white;">
                                Trascina un file CSV, Excel (.xlsx), PDF o Immagine (oppure modifica direttamente la griglia sotto)
                            </p>
                            <small style="color: var(--text-muted); font-size: 0.78rem; display: block; margin-top: 4px;">
                                Auto-rilevamento per VBT, Pedane di Forza, IMU Blocchi, Fotocellule Sprint, Videoanalisi 2D, Salti Verticali e Palla Medica
                            </small>
                            <input type="file" id="vbt-file-input" style="display: none;" accept=".xlsx,.xls,.csv,.pdf,image/*">
                        </div>

                        <div id="ocr-progress" style="display:none; margin-bottom: 0.5rem;">
                            <small style="color:var(--text-muted);">Scansione immagine in corso...</small>
                            <div style="width:100%; height:4px; background:#333; border-radius:2px; margin-top:5px;">
                                <div id="ocr-progress-bar" style="width:0%; height:100%; background:var(--accent); border-radius:2px; transition:width 0.2s;"></div>
                            </div>
                        </div>

                        <!-- PARAMETER CONTROLS BAR -->
                        <div class="analysis-params-bar" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem;">
                            <!-- Test Type Selector -->
                            <div style="flex: 1.5; min-width: 240px;">
                                <label for="unified-test-type-select" style="display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent); font-weight: 700; margin-bottom: 0.35rem;">Tipo di Test / Strumento</label>
                                <select id="unified-test-type-select" class="custom-select-vbt" style="width: 100%; padding: 0.5rem 0.75rem; background: #0f172a; color: white; border: 1px solid rgba(0,240,255,0.4); border-radius: 8px; font-weight: 600; font-size: 0.88rem;">
                                    <option value="VBT" selected>VBT (Encoder lineari: Vitruve, Speed4Lifts, GymAware)</option>
                                    <option value="PAP_ANALYSIS">Post-Activation Potentiation (Studio PAP & Profilo Neuromuscolare)</option>
                                    <option value="FORCE_PLATE">Pedana di Forza (ForceDecks, Hawkin Dynamics, Kistler)</option>
                                    <option value="BLOCK_ACCEL">Accelerometro / IMU Blocchi di Partenza</option>
                                    <option value="SPRINT_TIMING">Fotocellule Sprint (Microgate Witty, Freelap)</option>
                                    <option value="VIDEO_KINEMATICS">Videoanalisi Cinematica 2D (Kinovea, Dartfish)</option>
                                    <option value="JUMP_TEST">Test Salto Verticale (SJ, CMJ, Drop Jump - EUR & RSI)</option>
                                    <option value="MEDICINE_BALL">Lancio Palla Medica (Cinematica & Potenza Sayers/Harman)</option>
                                    <option value="GENERAL_TABULAR">Dati Tabellari Grezzi (Generico)</option>
                                </select>
                            </div>

                            <!-- Load PAP Benchmark Button -->
                            <div style="flex: 0 0 auto;">
                                <button type="button" id="btn-load-pap-benchmark" style="padding: 0.52rem 0.95rem; background: linear-gradient(135deg, rgba(0,240,255,0.18), rgba(99,102,241,0.22)); color: #00f0ff; border: 1px solid rgba(0,240,255,0.45); border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
                                    Carica Studio PAP (28 Luglio)
                                </button>
                            </div>

                            <!-- Athlete Name -->
                            <div style="flex: 1; min-width: 170px;">
                                <label for="manual-athlete" style="display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 700; margin-bottom: 0.35rem;">Atleta</label>
                                <input type="text" id="manual-athlete" value="Mario Rossi" class="custom-input" placeholder="Nome Atleta" style="width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px; background: rgba(0,0,0,0.3); color: white; border: 1px solid var(--border); font-size: 0.88rem;">
                            </div>

                            <!-- Exercise Name -->
                            <div style="flex: 1; min-width: 170px;">
                                <label for="unified-exercise-input" style="display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 700; margin-bottom: 0.35rem;">Esercizio / Prova</label>
                                <input type="text" id="unified-exercise-input" value="Panca Piana" class="custom-input" placeholder="Esercizio / Prova" style="width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px; background: rgba(0,0,0,0.3); color: white; border: 1px solid var(--border); font-size: 0.88rem;">
                            </div>

                            <!-- VBT Specific Controls -->
                            <div id="vbt-controls-wrapper" style="display: flex; gap: 0.75rem; align-items: flex-end; flex-wrap: wrap;">
                                <div id="manual-mvt-container" style="display: flex; flex-direction: column;">
                                    <label for="vbt-mvt-input" style="display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 700; margin-bottom: 0.35rem;">MVT (m/s)</label>
                                    <div class="mvt-stepper-wrap">
                                        <button type="button" class="stepper-btn minus" aria-label="Decrease MVT">−</button>
                                        <input type="number" step="0.01" min="0.05" max="1.50" id="vbt-mvt-input" value="0.30" class="stepper-input" style="width: 70px;">
                                        <button type="button" class="stepper-btn plus" aria-label="Increase MVT">+</button>
                                    </div>
                                    <input type="number" step="0.01" id="manual-mvt" value="0.30" style="display: none;">
                                </div>
                                <div>
                                    <label for="nlp-regression-model" style="display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 700; margin-bottom: 0.35rem;">Modello Regressione</label>
                                    <select id="nlp-regression-model" class="custom-select-vbt" style="padding: 0.5rem 0.75rem; background: #0f172a; color: white; border: 1px solid var(--border); border-radius: 8px; font-size: 0.88rem;">
                                        <option value="auto">Auto (Consigliata)</option>
                                        <option value="linear">Lineare</option>
                                        <option value="quadratic">Quadratica</option>
                                    </select>
                                    <select id="manual-regression-model" style="display: none;">
                                        <option value="auto">Auto (Consigliata)</option>
                                        <option value="linear">Lineare</option>
                                        <option value="quadratic">Quadratica</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- REACTIVE DATA GRID CONTAINER -->
                    <div id="reactive-grid-container" style="margin-bottom: 1.5rem;"></div>

                    <!-- MULTI-ATHLETE & MULTI-EXERCISE SELECTOR BAR -->
                    <div id="filter-bar-container" style="display: none; margin-bottom: 1.5rem;"></div>

                    <!-- DYNAMIC DASHBOARD CONTAINER -->
                    <div id="dashboard-container" style="display: flex; flex-direction: column; gap: 2rem;">
                        <div style="padding: 2.5rem; border: 1px dashed var(--border); border-radius: 12px; text-align: center; color: var(--text-muted);">
                            Compila le prove nella griglia sopra o rilascia un file per visualizzare il cruscotto biomeccanico.
                        </div>
                    </div>

                    <!-- NLP TEXT QUERY SECTION -->
                    <div id="nlp-section" style="display:none; margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
                        <h3 style="margin-top:0; color:var(--accent);">Chiedi all'Intelligenza</h3>
                        <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.5rem;">Scrivi cosa vuoi analizzare o usa i bottoni rapidi.</p>
                        <textarea id="nlp-prompt" placeholder="Es. Calcola lo Squat di Riccardo..." style="width:100%; height:80px; padding:0.75rem; border-radius:8px; background:rgba(0,0,0,0.3); color:white; border:1px solid var(--border); margin-bottom:1rem;"></textarea>
                        
                        <button id="btn-nlp-analyze" style="width: 100%; background: linear-gradient(135deg,#10b981,#6366f1); color: white; padding: 0.85rem; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">
                            Esegui Analisi
                        </button>
                        
                        <!-- QUICK ACTION BUTTONS -->
                        <div id="quick-actions" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;"></div>
                    </div>

                    <!-- HIDDEN BACKWARD COMPATIBILITY SCAFFOLDING -->
                    <div style="display: none;" aria-hidden="true">
                        <div class="analysis-tabs">
                            <button class="analysis-tab-btn active" data-tab="upload">Carica File</button>
                            <button class="analysis-tab-btn" data-tab="manual">Inserimento Manuale</button>
                        </div>
                        <div id="tab-upload-content"></div>
                        <div id="tab-manual-content">
                            <select id="manual-test-type">
                                <option value="VBT_SQUAT">VBT: Squat (MVT: 0.30 m/s)</option>
                                <option value="VBT_BENCH">VBT: Bench Press (MVT: 0.15 m/s)</option>
                                <option value="VBT_DEADLIFT">VBT: Deadlift (MVT: 0.15 m/s)</option>
                                <option value="VBT_CUSTOM">VBT: Custom (MVT custom)</option>
                                <option value="JUMP_EUR_RSI">Jump Test (EUR & RSI)</option>
                            </select>
                            <div id="manual-vbt-table-container">
                                <tbody id="manual-vbt-tbody">
                                    <tr class="manual-vbt-row">
                                        <td><input type="number" class="manual-load-val custom-input" value="60"></td>
                                        <td><input type="number" class="manual-velocity-val custom-input" value="1.00"></td>
                                        <td><button type="button" class="btn-remove-vbt-row">&times;</button></td>
                                    </tr>
                                </tbody>
                                <button type="button" id="btn-add-vbt-row">+ Aggiungi Punto</button>
                            </div>
                            <div id="manual-jump-container">
                                <input type="number" id="manual-sj-height" value="31.0">
                                <input type="number" id="manual-cmj-height" value="34.0">
                                <input type="number" id="manual-dj-height" value="37.0">
                                <input type="number" id="manual-dj-contact" value="0.190">
                            </div>
                            <button id="btn-manual-calculate">Elabora Dati Manuali</button>
                        </div>
                    </div>
                </div>
            `;

            // Initialize ReactiveGrid component
            if (window.ReactiveGrid) {
                this.reactiveGrid = new window.ReactiveGrid({
                    containerId: 'reactive-grid-container',
                    testType: 'VBT',
                    debounceMs: 250,
                    onChange: (records, summary) => {
                        this.handleGridDataChange(records, summary);
                    },
                    onExport: (records, testType) => {
                        this.handleGridExport(records, testType);
                    }
                });
            }

            this.bindEvents();
            if (window.App && typeof window.App.initNumberSteppers === 'function') {
                window.App.initNumberSteppers(this.container);
            }
        }

        bindEvents() {
            // UNIFIED TEST TYPE SELECTOR
            const unifiedTestSelect = document.getElementById('unified-test-type-select');
            const vbtWrap = document.getElementById('vbt-controls-wrapper');
            const exInput = document.getElementById('unified-exercise-input');
            const legacyTestSelect = document.getElementById('manual-test-type');

            if (unifiedTestSelect) {
                unifiedTestSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (this.reactiveGrid) {
                        this.reactiveGrid.setTestType(val);
                    }
                    if (vbtWrap) {
                        vbtWrap.style.display = (val === 'VBT') ? 'flex' : 'none';
                    }
                    if (exInput && window.TestRegistry) {
                        const def = window.TestRegistry.get(val);
                        if (def && def.defaultExercise) {
                            exInput.value = def.defaultExercise;
                        }
                    }
                    if (legacyTestSelect) {
                        if (val === 'VBT') legacyTestSelect.value = 'VBT_CUSTOM';
                        else if (val === 'JUMP_TEST') legacyTestSelect.value = 'JUMP_EUR_RSI';
                    }
                    if (val === 'PAP_ANALYSIS') {
                        this.renderPAPDashboard();
                    }
                });
            }

            // PAP BENCHMARK BUTTON
            const btnPapBenchmark = document.getElementById('btn-load-pap-benchmark');
            if (btnPapBenchmark) {
                btnPapBenchmark.addEventListener('click', () => {
                    if (unifiedTestSelect) unifiedTestSelect.value = 'PAP_ANALYSIS';
                    if (vbtWrap) vbtWrap.style.display = 'none';
                    if (this.reactiveGrid) {
                        this.reactiveGrid.setTestType('PAP_ANALYSIS');
                        if (window.PAPBenchmarkData) {
                            const bData = window.PAPBenchmarkData.getBenchmarkDataset();
                            const gridRows = bData.map(a => ({
                                athlete: a.name,
                                exercise: a.protocol.name,
                                jumpHeight: a.singleJumps.sjPost,
                                contactTime: (a.reactiveReboundsPost[0] && a.reactiveReboundsPost[0].tc) || 0.142,
                                rsi: (a.reactiveReboundsPost[0] && a.reactiveReboundsPost[0].rsi) || 2.50,
                                flightTime: (a.reactiveReboundsPost[0] && a.reactiveReboundsPost[0].tf) || 0.539
                            }));
                            this.reactiveGrid.setData(gridRows);
                        }
                    }
                    this.renderPAPDashboard();
                });
            }

            // ATHLETE & EXERCISE INPUT CHANGES (Debounced refresh)
            const athleteInput = document.getElementById('manual-athlete');
            if (athleteInput) {
                athleteInput.addEventListener('input', () => {
                    if (this.reactiveGrid && this.reactiveGrid.records && this.reactiveGrid.records.length > 0) {
                        this.reactiveGrid._triggerChange();
                    }
                });
            }
            if (exInput) {
                exInput.addEventListener('input', () => {
                    if (this.reactiveGrid && this.reactiveGrid.records && this.reactiveGrid.records.length > 0) {
                        this.reactiveGrid._triggerChange();
                    }
                });
            }

            // VBT MVT & REGRESSION MODEL
            const mvtInput = document.getElementById('vbt-mvt-input');
            const manualMvtInput = document.getElementById('manual-mvt');
            if (mvtInput) {
                mvtInput.addEventListener('input', () => {
                    if (manualMvtInput) manualMvtInput.value = mvtInput.value;
                    if (this.reactiveGrid && this.reactiveGrid.testType === 'VBT') {
                        this.reactiveGrid._triggerChange();
                    }
                });
            }

            const modelSelect = document.getElementById('nlp-regression-model');
            const manualModelSelect = document.getElementById('manual-regression-model');
            if (modelSelect) {
                modelSelect.addEventListener('change', () => {
                    if (manualModelSelect) manualModelSelect.value = modelSelect.value;
                    if (this.reactiveGrid && this.reactiveGrid.testType === 'VBT') {
                        this.reactiveGrid._triggerChange();
                    }
                });
            }

            // DROPZONE & FILE INPUT
            const dropZone = document.getElementById('vbt-drop-zone');
            const fileInput = document.getElementById('vbt-file-input');

            if (dropZone && fileInput) {
                dropZone.addEventListener('click', () => fileInput.click());

                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropZone.style.borderColor = 'var(--accent)';
                    dropZone.style.background = 'rgba(0, 240, 255, 0.1)';
                });

                dropZone.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    dropZone.style.borderColor = 'rgba(0, 240, 255, 0.35)';
                    dropZone.style.background = 'rgba(15, 23, 42, 0.5)';
                });

                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropZone.style.borderColor = 'rgba(0, 240, 255, 0.35)';
                    dropZone.style.background = 'rgba(15, 23, 42, 0.5)';
                    if (e.dataTransfer.files.length) {
                        this.handleFile(e.dataTransfer.files[0]);
                    }
                });

                fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length) {
                        const file = e.target.files[0];
                        e.target.value = '';
                        this.handleFile(file);
                    }
                });
            }

            // NLP ANALYZE BUTTON
            document.getElementById('btn-nlp-analyze')?.addEventListener('click', () => {
                const prompt = document.getElementById('nlp-prompt').value;
                this.executeNLPQuery(prompt);
            });

            // BACKWARD COMPATIBILITY EVENT LISTENERS (Hidden elements)
            const legacyBtnCalc = document.getElementById('btn-manual-calculate');
            if (legacyBtnCalc) {
                legacyBtnCalc.addEventListener('click', () => {
                    const athlete = (athleteInput?.value || 'Atleta').trim();
                    const testType = legacyTestSelect?.value || 'VBT_CUSTOM';
                    if (testType.startsWith('VBT_')) {
                        const dataPoints = (this.reactiveGrid && this.reactiveGrid.records.length > 0)
                            ? this.reactiveGrid.records.filter(r => r.load > 0 && r.velocity > 0)
                            : [{ load: 60, velocity: 1.0 }, { load: 80, velocity: 0.8 }];
                        const selectedModel = modelSelect ? modelSelect.value : 'auto';
                        this.renderVBTDashboard(dataPoints, athlete, testType.replace('VBT_', ''), selectedModel);
                    } else {
                        const sj = parseFloat(document.getElementById('manual-sj-height')?.value) || 0;
                        const cmj = parseFloat(document.getElementById('manual-cmj-height')?.value) || 0;
                        const djH = parseFloat(document.getElementById('manual-dj-height')?.value) || 0;
                        const djC = parseFloat(document.getElementById('manual-dj-contact')?.value) || 0;
                        const points = [];
                        if (sj > 0) points.push({ athlete, exercise: 'SJ', jumpHeight: sj });
                        if (cmj > 0) points.push({ athlete, exercise: 'CMJ', jumpHeight: cmj });
                        if (djH > 0 && djC > 0) points.push({ athlete, exercise: 'DJ', jumpHeight: djH, contactTime: djC });
                        this.renderJumpDashboard(points.length > 0 ? points : [{ athlete, exercise: 'CMJ', jumpHeight: 35 }], athlete);
                    }
                });
            }
        }

        /**
         * Reattivo: gestisce aggiornamenti in tempo reale (debounce 250ms) dalla ReactiveGrid
         */
        handleGridDataChange(records, summary) {
            const athlete = (document.getElementById('manual-athlete')?.value || 'Atleta').trim();
            const exercise = (document.getElementById('unified-exercise-input')?.value || '').trim();
            const testType = this.reactiveGrid ? this.reactiveGrid.testType : 'VBT';
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            if (!records || records.length === 0) {
                this.cleanup();
                dashboard.innerHTML = `
                    <div style="padding: 2.5rem; border: 1px dashed var(--border); border-radius: 12px; text-align: center; color: var(--text-muted);">
                        Nessuna prova presente. Aggiungi righe alla griglia o rilascia un file per visualizzare il cruscotto.
                    </div>
                `;
                return;
            }

            if (testType === 'VBT') {
                const vbtData = records.filter(r => {
                    const l = Number(r.load);
                    const v = Number(r.velocity);
                    return !isNaN(l) && !isNaN(v) && l > 0 && v > 0;
                });
                if (vbtData.length === 0) {
                    this.cleanup();
                    dashboard.innerHTML = `
                        <div style="padding: 2rem; border: 1px solid rgba(245,158,11,0.4); background: rgba(245,158,11,0.05); border-radius: 12px; text-align: center; color: #f59e0b;">
                            Dati VBT incompleti: inserisci Carico (kg) e Velocità (m/s) maggiori di zero.
                        </div>
                    `;
                } else if (vbtData.length === 1) {
                    this.renderSingleVBTPointDashboard(vbtData[0], athlete, exercise || 'Esercizio VBT');
                } else {
                    const selectedModel = document.getElementById('nlp-regression-model')?.value || 'auto';
                    this.renderVBTDashboard(vbtData, athlete, exercise || 'Squat', selectedModel);
                }
            } else if (testType === 'MEDICINE_BALL') {
                this.renderMedicineBallDashboard(records, athlete, exercise || 'Lancio Palla Medica');
            } else if (testType === 'FORCE_PLATE') {
                this.renderForcePlateDashboard(records, athlete, exercise || 'Pedana di Forza');
            } else if (testType === 'BLOCK_ACCEL') {
                this.renderAccelerometerDashboard(records, athlete, exercise || 'Partenza dai Blocchi');
            } else if (testType === 'SPRINT_TIMING') {
                this.renderSprintDashboard(records, athlete, exercise || 'Sprint');
            } else if (testType === 'VIDEO_KINEMATICS') {
                this.renderKinematicsDashboard(records, athlete, exercise || 'Videoanalisi Cinematica 2D');
            } else if (testType === 'JUMP_TEST') {
                this.renderJumpDashboard(records, athlete);
            } else {
                this.renderGenericDataDashboard(records, athlete, exercise || 'Dati Tabellari', this.parseResult ? this.parseResult.headers : null);
            }
        }

        /**
         * Gestisce l'esportazione Excel a 2 fogli sbloccati (.xlsx) per il coach
         */
        handleGridExport(records, testType) {
            const athlete = (document.getElementById('manual-athlete')?.value || 'Atleta').trim();
            if (!window.AnalysisExporter) {
                console.warn('[DataAnalysisUI] AnalysisExporter non disponibile');
                return;
            }
            const summary = this.reactiveGrid ? this.reactiveGrid._calculateSummary() : {};
            window.AnalysisExporter.exportToExcel({
                testType: testType || (this.reactiveGrid ? this.reactiveGrid.testType : 'VBT'),
                athleteName: athlete,
                records: records || [],
                kpiData: summary.metrics || {},
                coachNotes: ''
            }).catch(err => {
                console.error('[DataAnalysisUI] Errore esportazione Excel:', err);
            });
        }

        /**
         * Risolve l'istanza del modulo DataParser verificando in ordine sequenziale i namespace globali.
         * Se window._parserFileReaders e disponibile, lo assegna a window.DataParser per retrocompatibilita.
         *
         * @returns {Object|null} Istanza del parser con metodo parseExcel, o null se non disponibile.
         */
        _resolveParser() {
            if (typeof window !== 'undefined' && window.DataParser && typeof window.DataParser.parseExcel === 'function') {
                return window.DataParser;
            }
            if (typeof window !== 'undefined' && window._parserFileReaders && typeof window._parserFileReaders.parseExcel === 'function') {
                window.DataParser = window._parserFileReaders;
                return window.DataParser;
            }
            if (typeof globalThis !== 'undefined' && globalThis.DataParser && typeof globalThis.DataParser.parseExcel === 'function') {
                return globalThis.DataParser;
            }
            if (typeof self !== 'undefined' && self.DataParser && typeof self.DataParser.parseExcel === 'function') {
                return self.DataParser;
            }
            return null;
        }

        /**
         * Fallback di emergenza per la lettura di file Excel (.xlsx, .xls) qualora
         * il modulo completo DataParser non risulti ancora pronto ma SheetJS (XLSX) sia caricato.
         * Estrae le righe dati e mappa i campi di base (load, velocity, athlete, exercise)
         * costruendo un oggetto compatibile per il rendering tabellare generico.
         *
         * @param {File|Blob|ArrayBuffer|Uint8Array} file - Il file Excel da processare.
         * @returns {Promise<Object>} Oggetto compatibile con l'interfaccia di analisi contenente records, metadata e rawData.
         */
        async _parseExcelEmergencyFallback(file) {
            const xlsxLib = (typeof window !== 'undefined' && window.XLSX)
                ? window.XLSX
                : ((typeof globalThis !== 'undefined' && globalThis.XLSX) ? globalThis.XLSX : null);

            if (!xlsxLib || typeof xlsxLib.read !== 'function') {
                throw new Error("Libreria SheetJS (XLSX) non disponibile nel browser per il fallback di emergenza.");
            }

            // Lettura del flusso binario del file tramite buffer o FileReader
            let dataBuffer;
            if (file instanceof ArrayBuffer) {
                dataBuffer = file;
            } else if (file instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(file))) {
                dataBuffer = file.buffer || file;
            } else if (file && typeof file.arrayBuffer === 'function') {
                try {
                    dataBuffer = await file.arrayBuffer();
                } catch (abErr) {
                    console.warn('[DataAnalysis] Lettura file.arrayBuffer fallita, passaggio a FileReader:', abErr);
                    dataBuffer = await new Promise((resolve, reject) => {
                        if (typeof FileReader === 'undefined') {
                            return reject(new Error("Ambiente privo di supporto FileReader."));
                        }
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = (err) => reject(err);
                        reader.readAsArrayBuffer(file);
                    });
                }
            } else if (typeof FileReader !== 'undefined') {
                dataBuffer = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (err) => reject(err);
                    reader.readAsArrayBuffer(file);
                });
            } else {
                throw new Error("Formato file non supportato o FileReader non disponibile per il fallback.");
            }

            // Parsing della cartella di lavoro tramite XLSX
            const uint8 = (dataBuffer instanceof Uint8Array) ? dataBuffer : new Uint8Array(dataBuffer);
            const workbook = xlsxLib.read(uint8, { type: 'array' });
            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new Error("Il file Excel non contiene fogli di lavoro validi.");
            }

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            if (!worksheet) {
                throw new Error("Impossibile accedere al primo foglio di lavoro del file Excel.");
            }

            const rawMatrix = (xlsxLib.utils && typeof xlsxLib.utils.sheet_to_json === 'function')
                ? xlsxLib.utils.sheet_to_json(worksheet, { header: 1 })
                : [];

            if (!rawMatrix || rawMatrix.length === 0) {
                throw new Error("Il foglio di lavoro Excel selezionato e vuoto.");
            }

            // Individuazione dell'indice della riga di intestazione
            let headerRowIndex = -1;
            const scanLimit = Math.min(rawMatrix.length, FALLBACK_MAX_HEADER_SCAN);
            for (let i = 0; i < scanLimit; i++) {
                const rowCandidate = rawMatrix[i];
                if (Array.isArray(rowCandidate) && rowCandidate.some(cell => cell !== null && cell !== undefined && String(cell).trim().length > 0)) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                throw new Error("Nessuna riga di dati o intestazione valida riscontrata nel foglio.");
            }

            // Normalizzazione intestazioni
            const rawHeaders = rawMatrix[headerRowIndex].map((h, idx) => {
                const clean = (h !== null && h !== undefined) ? String(h).trim() : '';
                return clean.length > 0 ? clean : `Colonna ${idx + 1}`;
            });

            // Mappatura colonne essenziali: athlete, exercise, load, velocity, reps, set, date
            let athleteCol = -1;
            let exerciseCol = -1;
            let loadCol = -1;
            let velocityCol = -1;
            let repsCol = -1;
            let setCol = -1;
            let dateCol = -1;

            rawHeaders.forEach((h, idx) => {
                const lower = h.toLowerCase().trim();
                if (athleteCol === -1 && (lower.includes('atleta') || lower.includes('athlete') || lower === 'nome' || lower === 'name' || lower === 'player')) {
                    athleteCol = idx;
                } else if (exerciseCol === -1 && (lower.includes('esercizio') || lower.includes('exercise') || lower.includes('drill') || lower.includes('movimento'))) {
                    exerciseCol = idx;
                } else if (loadCol === -1 && (lower.includes('carico') || lower.includes('load') || lower.includes('peso') || lower.includes('weight') || lower === 'kg')) {
                    loadCol = idx;
                } else if (velocityCol === -1 && (lower.includes('velocit') || lower.includes('velocity') || lower.includes('speed') || lower.includes('m/s') || lower === 'vel')) {
                    velocityCol = idx;
                } else if (repsCol === -1 && (lower.includes('rip') || lower.includes('rep'))) {
                    repsCol = idx;
                } else if (setCol === -1 && (lower.includes('serie') || lower.includes('set'))) {
                    setCol = idx;
                } else if (dateCol === -1 && (lower.includes('data') || lower.includes('date') || lower.includes('giorno'))) {
                    dateCol = idx;
                }
            });

            const dataRows = rawMatrix.slice(headerRowIndex + 1);
            const records = [];
            const athletesSet = new Set();
            const exercisesSet = new Set();

            for (let r = 0; r < dataRows.length; r++) {
                const row = dataRows[r];
                if (!Array.isArray(row) || row.length === 0) continue;
                // Salta righe completamente vuote
                if (row.every(c => c === null || c === undefined || String(c).trim() === '')) continue;

                const athleteName = (athleteCol >= 0 && row[athleteCol] !== undefined && row[athleteCol] !== null && String(row[athleteCol]).trim().length > 0)
                    ? String(row[athleteCol]).trim()
                    : DEFAULT_ATHLETE_FALLBACK;

                const exerciseName = (exerciseCol >= 0 && row[exerciseCol] !== undefined && row[exerciseCol] !== null && String(row[exerciseCol]).trim().length > 0)
                    ? String(row[exerciseCol]).trim()
                    : DEFAULT_EXERCISE_FALLBACK;

                let parsedLoad = null;
                if (loadCol >= 0 && row[loadCol] !== undefined && row[loadCol] !== null) {
                    const cleanNum = parseFloat(String(row[loadCol]).replace(',', '.'));
                    if (!isNaN(cleanNum)) parsedLoad = cleanNum;
                }

                let parsedVelocity = null;
                if (velocityCol >= 0 && row[velocityCol] !== undefined && row[velocityCol] !== null) {
                    const cleanNum = parseFloat(String(row[velocityCol]).replace(',', '.'));
                    if (!isNaN(cleanNum)) parsedVelocity = cleanNum;
                }

                let parsedReps = DEFAULT_REPS_COUNT;
                if (repsCol >= 0 && row[repsCol] !== undefined && row[repsCol] !== null) {
                    const cleanNum = parseInt(String(row[repsCol]), DECIMAL_RADIX);
                    if (!isNaN(cleanNum) && cleanNum > 0) parsedReps = cleanNum;
                }

                let parsedSet = null;
                if (setCol >= 0 && row[setCol] !== undefined && row[setCol] !== null) {
                    const cleanNum = parseInt(String(row[setCol]), DECIMAL_RADIX);
                    if (!isNaN(cleanNum)) parsedSet = cleanNum;
                }

                const rec = {
                    athlete: athleteName,
                    athleteRaw: athleteName,
                    athleteRawId: null,
                    exercise: exerciseName,
                    exerciseId: null,
                    load: parsedLoad,
                    velocity: parsedVelocity,
                    repsCount: parsedReps,
                    setNumber: parsedSet,
                    date: (dateCol >= 0 && row[dateCol]) ? String(row[dateCol]).trim() : null,
                    _rawRow: row,
                    _cells: {}
                };

                // Assegnazione valori dinamici a livello di cella per tabelle generiche
                rawHeaders.forEach((colName, cIdx) => {
                    const cellVal = row[cIdx];
                    if (cellVal !== undefined && cellVal !== null) {
                        rec._cells[colName] = cellVal;
                        if (!(colName in rec)) {
                            rec[colName] = cellVal;
                        }
                    }
                });

                records.push(rec);
                if (athleteName && athleteName !== DEFAULT_ATHLETE_FALLBACK) {
                    athletesSet.add(athleteName);
                }
                if (exerciseName && exerciseName !== DEFAULT_EXERCISE_FALLBACK) {
                    exercisesSet.add(exerciseName);
                }
            }

            const athletesList = Array.from(athletesSet);
            if (athletesList.length === 0) athletesList.push(DEFAULT_ATHLETE_FALLBACK);

            const exercisesList = Array.from(exercisesSet);
            if (exercisesList.length === 0) exercisesList.push(DEFAULT_EXERCISE_FALLBACK);

            return {
                records: records,
                rawData: records,
                originalRecords: records,
                instrumentType: RESILIENT_INSTRUMENT_TYPE,
                instrumentLabel: RESILIENT_INSTRUMENT_LABEL,
                rawHeaders: rawHeaders,
                headers: rawHeaders,
                athletes: athletesList,
                exercises: exercisesList,
                encodedAthletes: [],
                aggregationInfo: null
            };
        }

        /**
         * Gestisce il caricamento e parsing di un file (Excel, CSV, PDF o Immagine OCR).
         * Utilizza un resolver multi-livello per localizzare DataParser o il fallback di emergenza SheetJS per Excel.
         *
         * @param {File|Blob} file - Il file da analizzare.
         */
        async handleFile(file) {
            this.cleanup();
            this.parseResult = null;
            const dashboard = document.getElementById('dashboard-container');
            if (dashboard) {
                dashboard.innerHTML = `<div style="padding: 2rem; border: 1px dashed var(--border); border-radius: 12px; text-align: center; color: var(--text-muted);">Elaborazione in corso...</div>`;
            }
            const nlpSection = document.getElementById('nlp-section');
            if (nlpSection) nlpSection.style.display = 'none';
            const quickActions = document.getElementById('quick-actions');
            if (quickActions) quickActions.innerHTML = '';

            const dropZone = document.getElementById('vbt-drop-zone');
            const p = dropZone ? dropZone.querySelector('p') : null;

            if (p) {
                p.innerHTML = `<span style="color:var(--accent)">Elaborazione file in corso...</span>`;
            }

            const parser = this._resolveParser();
            let parseRes = null;

            try {
                if (file && file.type && file.type.includes('image')) {
                    if (!parser || typeof parser.parseImageOCR !== 'function') {
                        throw new Error("Modulo OCR non disponibile o DataParser non inizializzato.");
                    }
                    const ocrProgress = document.getElementById('ocr-progress');
                    const bar = document.getElementById('ocr-progress-bar');
                    if (ocrProgress) ocrProgress.style.display = 'block';
                    try {
                        parseRes = await parser.parseImageOCR(file, (progress) => {
                            if (bar) bar.style.width = (progress * PERCENT_MULTIPLIER) + '%';
                        });
                    } finally {
                        if (ocrProgress) ocrProgress.style.display = 'none';
                    }
                } else if (file && ((file.type && file.type.includes('pdf')) || (file.name && file.name.toLowerCase().endsWith('.pdf')))) {
                    if (!parser || typeof parser.parsePDF !== 'function') {
                        throw new Error("Modulo PDF non disponibile o DataParser non inizializzato.");
                    }
                    parseRes = await parser.parsePDF(file);
                } else {
                    if (parser && typeof parser.parseExcel === 'function') {
                        parseRes = await parser.parseExcel(file);
                    } else if (typeof window !== 'undefined' && window.XLSX) {
                        parseRes = await this._parseExcelEmergencyFallback(file);
                    } else {
                        throw new Error("Motore di analisi dati (DataParser) non ancora pronto nel browser. Ricarica la pagina (Ctrl+F5) per sincronizzare i moduli.");
                    }
                }
            } catch (err) {
                console.error('[DataAnalysis] Errore parsing file:', err);
                alert("Errore nell'analisi del file: " + err.message);
                if (p) {
                    p.innerHTML = `<span style="color:#ef4444">Errore di lettura file. Riprova.</span>`;
                }
                return;
            }

            // Normalizzazione record/rawData per garantire piena compatibilita bidirezionale
            if (parseRes) {
                if (!parseRes.rawData && Array.isArray(parseRes.records)) {
                    parseRes.rawData = parseRes.records;
                }
                if (!parseRes.records && Array.isArray(parseRes.rawData)) {
                    parseRes.records = parseRes.rawData;
                }
            }

            this.parseResult = parseRes;

            try {
                // Mostra dettagli aggregazione se presenti
                const aggInfo = this.parseResult.aggregationInfo;
                const aggBadge = aggInfo
                    ? ` <span style="color:#10b981; font-size:0.8rem;">(${aggInfo})</span>`
                    : '';
                const instLabel = this.parseResult.instrumentLabel || 'Dataset Tabellare';
                const instType = this.parseResult.instrumentType || 'GENERAL_TABULAR';

                // Sincronizza selettore tipo test
                const unifiedTestSelect = document.getElementById('unified-test-type-select');
                if (unifiedTestSelect) unifiedTestSelect.value = instType;
                const vbtWrap = document.getElementById('vbt-controls-wrapper');
                if (vbtWrap) vbtWrap.style.display = (instType === 'VBT') ? 'flex' : 'none';

                // Popola griglia reattiva se istanziata
                if (this.reactiveGrid) {
                    this.reactiveGrid.setTestType(instType);
                    this.reactiveGrid.setData(this.parseResult.rawData);
                }

                if (p) {
                    p.innerHTML = `
                        <span style="color:var(--accent); font-weight:600;">Estratte ${this.parseResult.rawData.length} righe dati</span>
                        <div style="font-size:0.8rem; color:#94a3b8; margin-top:0.25rem;">Strumento: <strong style="color:white;">${instLabel}</strong>${aggBadge}</div>
                        <div style="font-size:0.8rem; color:#10b981; margin-top:0.35rem;">Dati caricati nella griglia sottostante e cruscotto aggiornato.</div>
                    `;
                }

                // Visualizza sezione query NLP
                const nlpSectionEl = document.getElementById('nlp-section');
                if (nlpSectionEl) nlpSectionEl.style.display = 'block';
                this.generateQuickActions();

                // Modale ridenominazione ID cifrati o codificati se presenti
                const encodedAthletes = this.parseResult.encodedAthletes || [];
                if (encodedAthletes.length > 0) {
                    this._showAthleteRenameModal(encodedAthletes);
                }

                // Estrazione metadata atleti ed esercizi
                const athletes = this.getAthletes();
                const athleteName = (athletes && athletes.length > 0)
                    ? athletes[0]
                    : (this.parseResult.rawData[0] ? this.parseResult.rawData[0].athlete : 'Atleta');
                const exercises = this.getExercisesForAthlete(athleteName);
                const exerciseName = (exercises && exercises.length > 0)
                    ? exercises[0]
                    : (this.parseResult.rawData[0] ? this.parseResult.rawData[0].exercise : '');

                // Seleziona e renderizza istantaneamente primo atleta ed esercizio
                this.selectAthleteAndExercise(athleteName, exerciseName);

            } catch (uiErr) {
                console.warn('[DataAnalysis] Errore rendering cruscotto avanzato, fallback a vista tabellare:', uiErr);
                const athleteName = (this.parseResult && this.parseResult.rawData && this.parseResult.rawData[0] && this.parseResult.rawData[0].athlete !== 'Sconosciuto')
                    ? this.parseResult.rawData[0].athlete
                    : 'Atleta';
                const exerciseName = (this.parseResult && this.parseResult.rawData && this.parseResult.rawData[0] && this.parseResult.rawData[0].exercise !== 'Sconosciuto')
                    ? this.parseResult.rawData[0].exercise
                    : 'Dati File';
                const headers = this.parseResult ? (this.parseResult.headers || this.parseResult.rawHeaders) : null;
                const rawData = this.parseResult ? (this.parseResult.rawData || this.parseResult.records || []) : [];
                this.renderGenericDataDashboard(rawData, athleteName, exerciseName, headers);
            }
        }

        /** Helper: restituisce la lista di tutti gli atleti unici rilevati nel file */
        getAthletes() {
            if (!this.parseResult) return [];
            const list = [];
            if (Array.isArray(this.parseResult.athletes)) {
                this.parseResult.athletes.forEach(a => {
                    const trimmed = (a || '').trim();
                    if (trimmed && !list.includes(trimmed)) list.push(trimmed);
                });
            }
            if (Array.isArray(this.parseResult.rawData)) {
                this.parseResult.rawData.forEach(r => {
                    const trimmed = (r.athlete || '').trim();
                    if (trimmed && !list.includes(trimmed)) list.push(trimmed);
                });
            }
            return list;
        }

        /** Helper: restituisce gli esercizi svolti da uno specifico atleta nel dataset */
        getExercisesForAthlete(athlete) {
            if (!this.parseResult || !Array.isArray(this.parseResult.rawData)) return [];
            const athLower = (athlete || '').trim().toLowerCase();
            const exList = [];
            this.parseResult.rawData.forEach(r => {
                const rAth = (r.athlete || '').trim().toLowerCase();
                const ex = (r.exercise || '').trim();
                if ((!athLower || rAth === athLower) && ex && !exList.includes(ex)) {
                    exList.push(ex);
                }
            });
            return exList;
        }

        /** Renderizza la barra selettore multi-atleta e multi-esercizio in cima al pannello */
        renderFilterBar(targetAthlete, targetExercise) {
            const container = document.getElementById('filter-bar-container');
            if (!container) return;

            const athletes = this.getAthletes();
            if (athletes.length === 0) {
                container.style.display = 'none';
                return;
            }

            container.style.display = 'block';

            // Determina atleta selezionato
            if (!targetAthlete || !athletes.includes(targetAthlete)) {
                targetAthlete = (this.selectedAthlete && athletes.includes(this.selectedAthlete))
                    ? this.selectedAthlete
                    : athletes[0];
            }
            this.selectedAthlete = targetAthlete;

            // Determina esercizi svolti ESCLUSIVAMENTE da questo atleta
            const exercises = this.getExercisesForAthlete(targetAthlete);
            if (!targetExercise || !exercises.includes(targetExercise)) {
                targetExercise = (this.selectedExercise && exercises.includes(this.selectedExercise))
                    ? this.selectedExercise
                    : (exercises[0] || '');
            }
            this.selectedExercise = targetExercise;

            // Opzioni atleta
            const athleteOptions = athletes.map(a =>
                `<option value="${a}" ${a === targetAthlete ? 'selected' : ''}>${a}</option>`
            ).join('');

            // Opzioni esercizio (per select nativo)
            const exerciseOptions = exercises.map(e =>
                `<option value="${e}" ${e === targetExercise ? 'selected' : ''}>${e}</option>`
            ).join('');

            // Pillole esercizio
            const pillButtons = exercises.map(ex => {
                const count = this.parseResult.rawData.filter(r =>
                    (r.athlete || '').trim().toLowerCase() === targetAthlete.toLowerCase() &&
                    (r.exercise || '').trim().toLowerCase() === ex.toLowerCase()
                ).length;
                const isActive = (ex.toLowerCase() === (targetExercise || '').toLowerCase());
                const countBadge = count > 0 ? ` <span style="font-size:0.75rem; opacity:0.85; margin-left:4px;">(${count} ${count === 1 ? 'serie' : 'serie'})</span>` : '';
                const activeStyle = isActive
                    ? 'background: linear-gradient(135deg, #00f0ff, #3b82f6); color: #0b1120; font-weight: 700; border: 1px solid #00f0ff; box-shadow: 0 0 14px rgba(0,240,255,0.45); transform: translateY(-1px);'
                    : 'background: rgba(255,255,255,0.06); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); font-weight: 500;';

                return `<button type="button" class="filter-exercise-pill" data-exercise="${CSS.escape(ex)}"
                    style="padding: 0.4rem 0.85rem; border-radius: 20px; font-size: 0.82rem; cursor: pointer; transition: all 0.2s ease; ${activeStyle}">
                    ${ex}${countBadge}
                </button>`;
            }).join('');

            container.innerHTML = `
                <div class="filter-bar-card" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.90)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px; padding: 0.9rem 1.25rem; box-shadow: 0 8px 32px rgba(0,0,0,0.35); backdrop-filter: blur(10px);">
                    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
                        <!-- Selettore Atleta -->
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: rgba(0,240,255,0.15); border: 1px solid rgba(0,240,255,0.35); color: #00f0ff; font-size: 1.15rem;">
                                👤
                            </div>
                            <div>
                                <label for="filter-athlete-select" style="display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 700; margin-bottom: 2px;">Atleta Selezionato</label>
                                <select id="filter-athlete-select" class="custom-select-vbt" style="padding: 0.45rem 0.85rem; font-size: 0.95rem; font-weight: 700; color: white; background: #0f172a; border: 1px solid rgba(0,240,255,0.4); border-radius: 8px; cursor: pointer; min-width: 175px; outline: none;">
                                    ${athleteOptions}
                                </select>
                            </div>
                        </div>

                        <!-- Selettore ed Esercizi Atleta -->
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; flex: 1; min-width: 260px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 700;">Esercizi di ${targetAthlete} (${exercises.length})</span>
                                <select id="filter-exercise-select" class="custom-select-vbt" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: white; cursor: pointer; display: none;">
                                    ${exerciseOptions}
                                </select>
                            </div>
                            <div id="filter-exercise-pills" style="display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: flex-end;">
                                ${pillButtons.length > 0 ? pillButtons : '<span style="color:#94a3b8; font-size:0.8rem;">Nessun esercizio rilevato</span>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Event listener atleta
            const athleteSelect = document.getElementById('filter-athlete-select');
            if (athleteSelect) {
                athleteSelect.addEventListener('change', (e) => {
                    const newAthlete = e.target.value;
                    const availableExs = this.getExercisesForAthlete(newAthlete);
                    const chosenEx = availableExs.includes(this.selectedExercise)
                        ? this.selectedExercise
                        : (availableExs[0] || '');
                    this.selectAthleteAndExercise(newAthlete, chosenEx);
                });
            }

            // Event listener select nativo esercizio
            const exSelect = document.getElementById('filter-exercise-select');
            if (exSelect) {
                exSelect.addEventListener('change', (e) => {
                    this.selectAthleteAndExercise(this.selectedAthlete, e.target.value);
                });
            }

            // Event listeners pillole esercizio
            const pills = container.querySelectorAll('.filter-exercise-pill');
            pills.forEach(pill => {
                pill.addEventListener('click', () => {
                    const chosenEx = pill.dataset.exercise;
                    this.selectAthleteAndExercise(this.selectedAthlete, chosenEx);
                });
            });
        }

        /** Seleziona atleta ed esercizio, aggiorna filtri, tabella manuale e ridisegna istantaneamente */
        selectAthleteAndExercise(athlete, exercise) {
            this.selectedAthlete = athlete;
            this.selectedExercise = exercise;

            const athleteInput = document.getElementById('manual-athlete');
            if (athleteInput && athlete) athleteInput.value = athlete;
            const exInput = document.getElementById('unified-exercise-input');
            if (exInput && exercise) exInput.value = exercise;

            // 1. Aggiorna la barra filtri in alto
            this.renderFilterBar(athlete, exercise);

            if (!this.parseResult || !Array.isArray(this.parseResult.rawData)) return;

            const athLower = (athlete || '').trim().toLowerCase();
            const exLower = (exercise || '').trim().toLowerCase();

            let matchedRecords = this.parseResult.rawData.filter(r => {
                const rAth = (r.athlete || '').trim().toLowerCase();
                const rEx = (r.exercise || '').trim().toLowerCase();
                return (!athLower || rAth === athLower) && (!exLower || rEx === exLower);
            });

            // Se nessun record corrisponde con esercizio esatto, proviamo a cercare per solo atleta
            if (matchedRecords.length === 0 && athLower) {
                matchedRecords = this.parseResult.rawData.filter(r => (r.athlete || '').trim().toLowerCase() === athLower);
                if (matchedRecords.length > 0 && !exercise) {
                    exercise = matchedRecords[0].exercise;
                    this.selectedExercise = exercise;
                    if (exInput) exInput.value = exercise;
                }
            }

            // Aggiorna anche la griglia reattiva se presente
            if (this.reactiveGrid && matchedRecords.length > 0) {
                this.reactiveGrid.setData(matchedRecords);
            }

            // 2. Aggiorna istantaneamente la tabella manuale a sinistra
            this.syncManualInputsWithSelection(athlete, exercise, matchedRecords);

            // 3. Ridisegna istantaneamente i grafici specifici per quell'atleta ed esercizio
            this.renderDashboardForSelection(athlete, exercise, matchedRecords);
        }

        /** Sincronizza i campi di input manuale (atleta, test type, MVT e righe tabella VBT) */
        syncManualInputsWithSelection(athlete, exercise, records) {
            const manualAthleteInput = document.getElementById('manual-athlete');
            if (manualAthleteInput && athlete) {
                manualAthleteInput.value = athlete;
            }

            const testTypeSelect = document.getElementById('manual-test-type');
            const vbtTableContainer = document.getElementById('manual-vbt-table-container');
            const mvtContainer = document.getElementById('manual-mvt-container');
            const jumpContainer = document.getElementById('manual-jump-container');
            const mvtInput = document.getElementById('manual-mvt');
            const vbtMvtEl = document.getElementById('vbt-mvt-input');

            const exName = (exercise || '').toLowerCase();
            let isJump = ['cmj', 'sj', 'dj', 'salto', 'jump'].some(term => exName.includes(term));
            if (!isJump && records.some(r => r.jumpHeight > 0)) {
                isJump = true;
            }

            if (isJump) {
                if (testTypeSelect) testTypeSelect.value = 'JUMP_EUR_RSI';
                if (vbtTableContainer) vbtTableContainer.style.display = 'none';
                if (mvtContainer) mvtContainer.style.display = 'none';
                if (jumpContainer) jumpContainer.style.display = 'block';

                const sj = records.find(r => (r.exercise || '').toLowerCase().includes('sj') || (r.exercise || '').toLowerCase().includes('squat jump'));
                const cmj = records.find(r => (r.exercise || '').toLowerCase().includes('cmj') || (r.exercise || '').toLowerCase().includes('countermovement'));
                const dj = records.find(r => (r.exercise || '').toLowerCase().includes('dj') || (r.contactTime > 0 && r.jumpHeight > 0));

                if (sj && document.getElementById('manual-sj-height') && sj.jumpHeight) {
                    document.getElementById('manual-sj-height').value = sj.jumpHeight;
                }
                if (cmj && document.getElementById('manual-cmj-height') && cmj.jumpHeight) {
                    document.getElementById('manual-cmj-height').value = cmj.jumpHeight;
                }
                if (dj) {
                    if (document.getElementById('manual-dj-height') && dj.jumpHeight) {
                        document.getElementById('manual-dj-height').value = dj.jumpHeight;
                    }
                    if (document.getElementById('manual-dj-contact') && dj.contactTime) {
                        document.getElementById('manual-dj-contact').value = dj.contactTime;
                    }
                }
            } else {
                // VBT Exercise: determina soglia MVT specifica per esercizio (0.30 squat, 0.15 bench/deadlift)
                let defaultMvt = 0.30;
                if (testTypeSelect) {
                    if (exName.includes('squat')) {
                        testTypeSelect.value = 'VBT_SQUAT';
                        defaultMvt = 0.30;
                    } else if (exName.includes('bench') || exName.includes('panca')) {
                        testTypeSelect.value = 'VBT_BENCH';
                        defaultMvt = 0.15;
                    } else if (exName.includes('deadlift') || exName.includes('stacco')) {
                        testTypeSelect.value = 'VBT_DEADLIFT';
                        defaultMvt = 0.15;
                    } else {
                        testTypeSelect.value = 'VBT_CUSTOM';
                        defaultMvt = 0.30;
                    }
                }

                if (vbtTableContainer) vbtTableContainer.style.display = 'block';
                if (mvtContainer) mvtContainer.style.display = 'block';
                if (jumpContainer) jumpContainer.style.display = 'none';

                if (mvtInput) mvtInput.value = defaultMvt.toFixed(2);
                if (vbtMvtEl) vbtMvtEl.value = defaultMvt.toFixed(2);

                const vbtData = records.filter(r => r.load > 0 && r.velocity > 0);
                const vbtTbody = document.getElementById('manual-vbt-tbody');
                if (vbtTbody && vbtData.length > 0) {
                    vbtTbody.innerHTML = '';
                    vbtData.forEach(point => {
                        const tr = document.createElement('tr');
                        tr.className = 'manual-vbt-row';
                        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                        tr.innerHTML = `
                            <td style="padding: 0.25rem;"><input type="number" step="1" class="manual-load-val custom-input" value="${point.load}" style="width: 90%; padding: 0.35rem; background:rgba(0,0,0,0.2); color:white; border:1px solid var(--border); border-radius: 4px;"></td>
                            <td style="padding: 0.25rem;"><input type="number" step="0.01" class="manual-velocity-val custom-input" value="${point.velocity.toFixed(3)}" style="width: 90%; padding: 0.35rem; background:rgba(0,0,0,0.2); color:white; border:1px solid var(--border); border-radius: 4px;"></td>
                            <td style="padding: 0.25rem; text-align: center;"><button type="button" class="btn-remove-vbt-row" style="background: transparent; color: #ef4444; border: none; cursor: pointer; font-size: 1.2rem;">&times;</button></td>
                        `;
                        vbtTbody.appendChild(tr);
                    });
                }
            }
        }

        /** Smista e renderizza la dashboard specifica per i record selezionati */
        renderDashboardForSelection(athlete, exercise, records) {
            const instType = (this.parseResult && this.parseResult.instrumentType) || (this.reactiveGrid ? this.reactiveGrid.testType : 'VBT');
            if (instType === 'FORCE_PLATE') {
                this.renderForcePlateDashboard(records, athlete, exercise || 'Pedana di Forza');
                return;
            }
            if (instType === 'BLOCK_ACCEL') {
                this.renderAccelerometerDashboard(records, athlete, exercise || 'Partenza dai Blocchi');
                return;
            }
            if (instType === 'SPRINT_TIMING') {
                this.renderSprintDashboard(records, athlete, exercise || 'Sprint');
                return;
            }
            if (instType === 'VIDEO_KINEMATICS') {
                this.renderKinematicsDashboard(records, athlete, exercise || 'Videoanalisi Cinematica 2D');
                return;
            }
            if (instType === 'MEDICINE_BALL') {
                this.renderMedicineBallDashboard(records, athlete, exercise || 'Lancio Palla Medica');
                return;
            }
            if (instType === 'PAP_ANALYSIS' || (this.parseResult && window.PAPBenchmarkData && window.PAPBenchmarkData.isPAPDataset(this.parseResult.rawData, this.parseResult.headers))) {
                this.renderPAPDashboard(records, athlete);
                return;
            }

            const vbtData = records.filter(d => d.load > 0 && d.velocity > 0);
            const isJump = records.some(r => r.jumpHeight > 0) || instType === 'JUMP_TEST';

            if (vbtData.length >= 2) {
                const nlpModelSelect = document.getElementById('nlp-regression-model');
                const selectedModel = nlpModelSelect ? nlpModelSelect.value : 'auto';
                this.renderVBTDashboard(vbtData, athlete, exercise || 'Squat', selectedModel);
            } else if (vbtData.length === 1) {
                this.renderSingleVBTPointDashboard(vbtData[0], athlete, exercise || 'Esercizio VBT');
            } else if (isJump) {
                this.renderJumpDashboard(records, athlete);
            } else {
                this.renderGenericDataDashboard(records, athlete, exercise || 'Dati Grezzi', this.parseResult ? this.parseResult.headers : null);
            }

            // Append correlated scientific literature panel without altering calculations
            setTimeout(() => {
                this._renderCorrelatedEvidencePanel(athlete, exercise, records, instType);
            }, 120);
        }

        /**
         * Renderizza il pannello "Evidenza Scientifica Correlata" basato sul RAG adapter
         * correlando le evidenze con lo strumento, l'esercizio e le metriche rilevate.
         */
        _renderCorrelatedEvidencePanel(athlete, exercise, records, instType) {
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            document.getElementById('correlated-scientific-evidence-panel')?.remove();

            const adapter = window.App && window.App.RAGRationaleAdapter;
            if (!adapter || typeof adapter.getEvidenceForDataAnalysis !== 'function') return;

            const detectedMetricNames = [];
            if (records && records.length > 0) {
                const sample = records[0];
                if (sample.velocity !== undefined) detectedMetricNames.push('velocity', 'vbt');
                if (sample.load !== undefined) detectedMetricNames.push('load', '1rm');
                if (sample.power !== undefined) detectedMetricNames.push('power', 'potenza');
                if (sample.jumpHeight !== undefined) detectedMetricNames.push('jump', 'salto');
                if (sample.contactTime !== undefined) detectedMetricNames.push('stiffness', 'tempo contatto');
                if (sample.acceleration !== undefined) detectedMetricNames.push('accelerazione', 'sprint');
            }

            const context = {
                instrumentType: instType || 'VBT',
                exercise: exercise || 'Allenamento',
                athlete: athlete,
                detectedMetricNames: detectedMetricNames
            };

            const evidenceList = adapter.getEvidenceForDataAnalysis(context, 3);
            if (!evidenceList || evidenceList.length === 0) return;

            const evidencePanel = document.createElement('div');
            evidencePanel.id = 'correlated-scientific-evidence-panel';
            evidencePanel.className = 'rag-card';
            evidencePanel.style.marginTop = '1.5rem';
            evidencePanel.style.background = 'var(--bg-surface)';
            evidencePanel.style.border = '1px solid var(--border)';
            evidencePanel.style.borderRadius = 'var(--radius-md)';
            evidencePanel.style.padding = '1.25rem';
            evidencePanel.style.boxShadow = 'var(--shadow-sm)';

            evidencePanel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 0.6rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.1rem;">📚</span>
                        <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-primary); font-weight: 700;">
                            Evidenza Scientifica Correlata ai Dati
                        </h4>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Knowledge Base RAG</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                    ${evidenceList.map(src => {
                        const safeUrl = (src.url && src.url.startsWith('http')) ? window.escapeHTML(src.url) : '#';
                        return `
                            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
                                <div>
                                    <div style="display: flex; gap: 0.35rem; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap;">
                                        <span class="source-area-tag" style="font-size: 0.68rem; padding: 0.15rem 0.4rem;">${window.escapeHTML(src.area || 'Biomeccanica')}</span>
                                        <span class="source-year-tag" style="font-size: 0.68rem; padding: 0.15rem 0.35rem;">${window.escapeHTML(String(src.year || ''))}</span>
                                        ${src.studyType ? `<span class="source-study-badge ${src.studyType.toLowerCase().replace(/\s+/g, '-')}" style="font-size: 0.65rem; padding: 0.15rem 0.4rem;">${window.escapeHTML(src.studyType)}</span>` : ''}
                                    </div>
                                    <h5 style="font-size: 0.88rem; color: var(--text-primary); margin: 0 0 0.35rem 0; line-height: 1.35; font-weight: 600;">
                                        ${window.escapeHTML(src.title || '')}
                                    </h5>
                                    <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.45; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                        ${window.escapeHTML(src.abstract || '')}
                                    </p>
                                </div>
                                <div style="margin-top: 0.6rem; padding-top: 0.45rem; border-top: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 0.75rem; color: var(--accent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">
                                        ${window.escapeHTML(src.authors || '')}
                                    </span>
                                    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color: #818cf8; text-decoration: none; font-size: 0.75rem; font-weight: 600;" onclick="event.stopPropagation();">
                                        PubMed ↗
                                    </a>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            dashboard.appendChild(evidencePanel);
        }

        /** Show a modal to assign readable names to encoded athlete IDs. */
        _showAthleteRenameModal(encodedAthletes) {
            // Remove existing modal
            document.getElementById('athlete-rename-modal')?.remove();

            const modal = document.createElement('div');
            modal.id = 'athlete-rename-modal';
            modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; padding:1rem;';

            const fields = encodedAthletes.map(a =>
                `<div style="margin-bottom:0.75rem;">
                    <label style="display:block; font-size:0.78rem; color:#94a3b8; margin-bottom:4px;">ID encoder: <code style="color:#f59e0b; word-break:break-all;">${a.raw}</code></label>
                    <input type="text" id="rename-${CSS.escape(a.raw)}" value="${a.readable}"
                        style="width:100%; padding:0.5rem 0.75rem; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:8px; color:white; font-size:0.95rem;">
                </div>`
            ).join('');

            modal.innerHTML = `
                <div style="background:#1e293b; border:1px solid rgba(255,255,255,0.12); border-radius:16px; padding:2rem; max-width:480px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,0.5);">
                    <h3 style="margin:0 0 0.5rem 0; color:white;">👤 Rinomina Atleti</h3>
                    <p style="color:#94a3b8; font-size:0.85rem; margin:0 0 1.5rem 0;">L'encoder usa ID codificati. Assegna nomi leggibili per le analisi:</p>
                    ${fields}
                    <div style="display:flex; gap:0.75rem; justify-content:flex-end; margin-top:1.25rem;">
                        <button id="rename-skip" style="padding:0.5rem 1.2rem; background:transparent; border:1px solid rgba(255,255,255,0.2); border-radius:8px; color:#94a3b8; cursor:pointer;">Salta</button>
                        <button id="rename-confirm" style="padding:0.5rem 1.5rem; background:linear-gradient(135deg,#6366f1,#10b981); border:none; border-radius:8px; color:white; font-weight:600; cursor:pointer;">✅ Conferma</button>
                    </div>
                </div>`;

            document.body.appendChild(modal);

            const close = () => modal.remove();

            document.getElementById('rename-skip').onclick = close;
            document.getElementById('rename-confirm').onclick = () => {
                // Apply renames
                encodedAthletes.forEach(a => {
                    const input = document.getElementById(`rename-${CSS.escape(a.raw)}`);
                    const newName = input ? input.value.trim() : a.readable;
                    if (newName && newName !== a.readable) {
                        // Update all records in parseResult
                        this.parseResult.rawData.forEach(r => {
                            if (r.athlete === a.readable || r.athleteRaw === a.raw) {
                                r.athlete = newName;
                            }
                        });
                        // Update athletes array
                        const idx = this.parseResult.athletes.indexOf(a.readable);
                        if (idx >= 0) this.parseResult.athletes[idx] = newName;
                    }
                });
                const firstAthlete = (this.parseResult.athletes && this.parseResult.athletes.length > 0) ? this.parseResult.athletes[0] : null;
                const exs = this.getExercisesForAthlete(firstAthlete);
                this.selectAthleteAndExercise(firstAthlete, exs[0] || '');
                this.generateQuickActions();
                close();
            };

            // Close on backdrop click
            modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
        }

        /** Analisi Rapide: genera chip SOLO per le coppie reali (atleta, esercizio) presenti nel dataset */
        generateQuickActions() {
            const container = document.getElementById('quick-actions');
            if (!container) return;
            container.innerHTML = '<small style="color:var(--text-muted); display:block; margin-bottom:6px; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.04em;">Analisi rapide (dati rilevati):</small>';

            if (!this.parseResult || !Array.isArray(this.parseResult.rawData) || this.parseResult.rawData.length === 0) {
                container.innerHTML = '';
                return;
            }

            // Mappa delle coppie reali presenti nel dataset: NO prodotto cartesiano!
            const comboMap = new Map();
            this.parseResult.rawData.forEach(r => {
                const ath = (r.athlete || '').trim();
                const ex = (r.exercise || '').trim();
                if (!ath || !ex) return;
                const key = `${ath}___${ex}`;
                if (!comboMap.has(key)) {
                    comboMap.set(key, { athlete: ath, exercise: ex, count: 0 });
                }
                comboMap.get(key).count++;
            });

            const wrap = document.createElement('div');
            wrap.style.cssText = 'display:flex; flex-wrap:wrap; gap:0.4rem;';

            const btnStyle = 'padding: 0.45rem 0.9rem; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.3); border-radius: 20px; color: #a5b4fc; cursor: pointer; font-size: 0.82rem; white-space: nowrap; transition: all 0.2s; font-weight: 500;';

            if (comboMap.size === 0) {
                const btn = document.createElement('button');
                btn.className = 'quick-btn';
                btn.textContent = 'Analizza tutto';
                btn.style.cssText = btnStyle;
                btn.onclick = () => {
                    const firstAth = this.getAthletes()[0];
                    const firstEx = this.getExercisesForAthlete(firstAth)[0];
                    if (firstAth) this.selectAthleteAndExercise(firstAth, firstEx);
                };
                wrap.appendChild(btn);
            } else {
                // Genera chip SOLO per le coppie (atleta, esercizio) con almeno 1 record reale
                comboMap.forEach(({ athlete, exercise, count }) => {
                    const seriesLabel = count === 1 ? '1 serie' : `${count} serie`;
                    const btn = document.createElement('button');
                    btn.className = 'quick-btn';
                    btn.textContent = `${exercise} – ${athlete} (${seriesLabel})`;
                    btn.style.cssText = btnStyle;
                    btn.onmouseover = () => { btn.style.background = 'rgba(99,102,241,0.3)'; btn.style.color = 'white'; };
                    btn.onmouseout  = () => { btn.style.background = 'rgba(99,102,241,0.12)'; btn.style.color = '#a5b4fc'; };
                    btn.onclick = () => {
                        const query = `Analizza ${exercise} di ${athlete}`;
                        const promptEl = document.getElementById('nlp-prompt');
                        if (promptEl) promptEl.value = query;
                        // Al clic, seleziona l'atleta e l'esercizio anche nella barra filtri e renderizza la dashboard
                        this.selectAthleteAndExercise(athlete, exercise);
                    };
                    wrap.appendChild(btn);
                });
            }

            container.appendChild(wrap);
        }

        /** Query NLP con riconoscimento flessibile di atleta ed esercizio, senza falsi allarmi */
        executeNLPQuery(prompt) {
            if (!this.parseResult || !this.parseResult.rawData || this.parseResult.rawData.length === 0) {
                alert("Nessun dato caricato. Carica prima un file o inserisci i dati manualmente.");
                return;
            }

            const rawPrompt = (prompt || '').trim();
            if (!rawPrompt) return;

            // Normalizzazione robusta (rimozione accenti, lowercase, caratteri speciali)
            const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').trim();
            const pNorm = norm(rawPrompt);
            const { rawData } = this.parseResult;
            const athletes = this.getAthletes();

            // 1. NLP: Atleta match semantico
            let targetAthlete = null;
            let bestAthMatchLen = 0;

            for (const ath of athletes) {
                const aNorm = norm(ath);
                if (!aNorm) continue;
                // Match esatto/inclusione nome completo
                if (pNorm.includes(aNorm) && aNorm.length > bestAthMatchLen) {
                    targetAthlete = ath;
                    bestAthMatchLen = aNorm.length;
                }
                // Match per singola parola (se lunghezza >= 3 caratteri)
                const parts = aNorm.split(/\s+/).filter(w => w.length >= 3);
                for (const part of parts) {
                    const regex = new RegExp(`\\b${part}\\b`, 'i');
                    if (regex.test(pNorm) && part.length > bestAthMatchLen) {
                        targetAthlete = ath;
                        bestAthMatchLen = part.length;
                    }
                }
            }

            // Fallback: match sui raw ID codificati degli atleti
            if (!targetAthlete) {
                for (const r of rawData) {
                    if (r.athleteRaw) {
                        const rawPrefix = norm(r.athleteRaw.split('_')[0]);
                        if (rawPrefix && rawPrefix.length >= 3 && pNorm.includes(rawPrefix)) {
                            targetAthlete = r.athlete;
                            break;
                        }
                    }
                }
            }

            // Se nessun atleta specificato nel testo, usa quello già selezionato o il primo disponibile
            if (!targetAthlete) {
                targetAthlete = this.selectedAthlete || athletes[0];
            }

            // 2. NLP: Esercizio match semantico (priorità agli esercizi svolti dall'atleta target)
            const availableExs = this.getExercisesForAthlete(targetAthlete);
            const allExercises = this.parseResult.exercises || [];
            const candidateExs = availableExs.length > 0 ? availableExs : allExercises;

            let targetExercise = null;

            // Dizionario sinonimi per pesistica e test biomeccanici
            const exerciseSynonyms = [
                { canonical: 'squat', keys: ['squat', 'back squat', 'front squat', 'accosciata', 'sq'] },
                { canonical: 'stacco', keys: ['stacco', 'deadlift', 'stacco da terra', 'dl', 'mezzo stacco'] },
                { canonical: 'panca', keys: ['panca', 'bench', 'bench press', 'distensioni panca', 'distensioni', 'bp'] },
                { canonical: 'military', keys: ['military', 'overhead', 'ohp', 'lento', 'lento avanti', 'spinte'] },
                { canonical: 'trazioni', keys: ['trazioni', 'pull up', 'chin up', 'pullup', 'chinup'] },
                { canonical: 'salto', keys: ['salto', 'jump', 'salti', 'cmj', 'sj', 'dj', 'eur', 'rsi', 'forza reattiva'] }
            ];

            // A. Match diretto sul nome dell'esercizio
            for (const ex of candidateExs) {
                const exNorm = norm(ex);
                if (pNorm.includes(exNorm)) {
                    targetExercise = ex;
                    break;
                }
                const parts = exNorm.split(/\s+/).filter(w => w.length >= 3);
                for (const part of parts) {
                    const regex = new RegExp(`\\b${part}\\b`, 'i');
                    if (regex.test(pNorm)) {
                        targetExercise = ex;
                        break;
                    }
                }
                if (targetExercise) break;
            }

            // B. Match avanzato tramite sinonimi
            if (!targetExercise) {
                for (const group of exerciseSynonyms) {
                    const matchedSynonym = group.keys.some(k => pNorm.includes(k));
                    if (matchedSynonym) {
                        // Cerca tra gli esercizi dell'atleta quello che appartiene alla stessa famiglia
                        targetExercise = candidateExs.find(e => {
                            const eNorm = norm(e);
                            return group.keys.some(k => eNorm.includes(k));
                        });
                        if (targetExercise) break;
                    }
                }
            }

            // C. Se l'utente non ha specificato l'esercizio o non combacia, usa il primo esercizio dell'atleta
            if (!targetExercise && candidateExs.length > 0) {
                targetExercise = candidateExs[0];
            }

            // 3. Determina tipo di analisi specifica
            const isJumpQuery = ["salto", "jump", "cmj", "sj", "dj", "eur", "rsi", "forza reattiva"].some(t => pNorm.includes(t));
            const isRunning = pNorm.includes('corsa') || pNorm.includes('run') || pNorm.includes('volume') || pNorm.includes('passo');

            // 4. Esecuzione e rendering senza falsi allarmi
            if (isJumpQuery) {
                const jumpData = rawData.filter(r => {
                    const matchAth = !targetAthlete || (r.athlete || '').toLowerCase() === targetAthlete.toLowerCase();
                    const hasJump = r.jumpHeight > 0 || ['cmj','sj','dj'].some(j => (r.exercise || '').toLowerCase().includes(j));
                    return matchAth && hasJump;
                });
                if (jumpData.length > 0) {
                    this.renderJumpDashboard(jumpData, targetAthlete);
                    return;
                }
            }

            if (isRunning) {
                const runData = rawData.filter(r => !targetAthlete || (r.athlete || '').toLowerCase() === targetAthlete.toLowerCase());
                if (runData.length > 0) {
                    this.renderRunningDashboard(runData, targetAthlete, targetExercise);
                    return;
                }
            }

            // Seleziona e aggiorna l'interfaccia, i filtri e il cruscotto
            if (targetAthlete) {
                this.selectAthleteAndExercise(targetAthlete, targetExercise || candidateExs[0]);
            } else {
                alert(`Nessun dato trovato per la query: "${rawPrompt}".`);
            }
        }

        renderVBTDashboard(data, athlete, exercise, selectedModel = 'auto') {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');

            // Dati validi per VBT
            const vbtData = data.filter(d => d.load > 0 && d.velocity > 0);
            if (vbtData.length < 2) {
                dashboard.innerHTML = `<div style="padding: 2rem; border: 1px solid red; color: red;">Dati VBT insufficienti (servono almeno 2 punti Carico-Velocità).</div>`;
                return;
            }

            const mvtEl = document.getElementById('vbt-mvt-input');
            const mvt = mvtEl ? parseFloat(mvtEl.value) || 0.30 : 0.30;

            // Query RAG for custom MVT based on athlete and exercise
            if (window.RAGEngine && typeof window.RAGEngine.semanticSearch === 'function' && athlete && !this._isRecalculating) {
                const queryText = `${athlete} ${exercise} MVT`;
                window.RAGEngine.semanticSearch(queryText, 5).then(chunks => {
                    let customMVT = null;
                    for (const chunk of chunks) {
                        const parsedMVT = extractMVT(chunk.text, exercise);
                        if (parsedMVT !== null) {
                            customMVT = parsedMVT;
                            break;
                        }
                    }
                    if (customMVT !== null && customMVT !== mvt) {

                        const vbtMvtInput = document.getElementById('vbt-mvt-input');
                        if (vbtMvtInput) {
                            vbtMvtInput.value = customMVT;
                        }
                        const manualMvtInput = document.getElementById('manual-mvt');
                        if (manualMvtInput) {
                            manualMvtInput.value = customMVT;
                        }
                        // Recalculate with new MVT
                        this._isRecalculating = true;
                        try {
                            this.renderVBTDashboard(data, athlete, exercise, selectedModel);
                        } finally {
                            this._isRecalculating = false;
                        }
                    }
                }).catch(err => {
                    console.warn('[VBT Analysis] Failed to retrieve custom MVT from RAG:', err);
                });
            }
            let reg = null;
            let warningBadge = '';

            if (selectedModel === 'linear') {
                reg = window.PhysicsEngine.linearRegressionVBT(vbtData);
            } else if (selectedModel === 'quadratic') {
                reg = window.PhysicsEngine.quadraticRegressionVBT(vbtData);
                if (!reg) {
                    reg = window.PhysicsEngine.linearRegressionVBT(vbtData);
                    warningBadge = `<span style="background: rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); border-radius:4px; font-size:0.75rem; padding:2px 7px; margin-left:8px;">⚠ Dati insufficienti per Quadratica, fallback a Lineare</span>`;
                }
            } else {
                reg = (window.PhysicsEngine.autoSelectRegressionVBT ? window.PhysicsEngine.autoSelectRegressionVBT(vbtData) : null) || window.PhysicsEngine.linearRegressionVBT(vbtData);
            }

            if (!reg) {
                dashboard.innerHTML = `<div style="padding: 2rem; border: 1px solid red; color: red;">Errore nel calcolo della regressione. Verificare i dati.</div>`;
                return;
            }
            const oneRM        = window.PhysicsEngine.estimate1RM(reg, mvt, { detailed: true });
            const oneRMVal     = (oneRM && typeof oneRM === 'object') ? (oneRM.value ?? oneRM.estimated) : oneRM;
            const rounded1RM   = Math.round(oneRMVal / 2.5) * 2.5;
            const zoneTable    = window.PhysicsEngine.generateLoadVelocityTable(oneRMVal, reg);
            const velStepsTable = window.PhysicsEngine.generateVelocityStepsTable ? window.PhysicsEngine.generateVelocityStepsTable(oneRMVal, reg) : [];
            const bryanMannTable = window.PhysicsEngine.generateBryanMannVBTTable ? window.PhysicsEngine.generateBryanMannVBTTable(oneRMVal, reg, exercise) : [];
            const progression  = window.PhysicsEngine.generateVBTProgression(oneRMVal, reg, 6);

            // R² quality color
            const r2Color = reg.rSquared >= 0.95 ? '#10b981' : reg.rSquared >= 0.80 ? '#f59e0b' : '#ef4444';

            // Outlier badge
            const outlierBadge = reg.outlierCount > 0
                ? `<span style="background: rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.3); border-radius:4px; font-size:0.75rem; padding:2px 7px; margin-left:8px;">⚠ ${reg.outlierCount} outlier rimoss${reg.outlierCount === 1 ? 'o' : 'i'}</span>`
                : '';

            const sfvpVal = (reg && typeof reg.sfvp === 'number' && Number.isFinite(reg.sfvp)) ? reg.sfvp : 0;
            const sfvpDisplay = (sfvpVal > 0 ? '+' : '') + sfvpVal.toFixed(1) + '%';

            let html = `
                <!-- HEADER -->
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
                    <h3 style="margin:0;">Profilo Carico-Velocità ${athlete ? '– ' + athlete : ''} ${exercise ? '[' + exercise + ']' : ''} ${outlierBadge}${warningBadge}</h3>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <select class="dashboard-model-select" style="background:rgba(0,0,0,0.3); color:white; border:1px solid var(--border); border-radius:8px; padding:0.5rem; font-size:0.85rem; outline:none; cursor:pointer;">
                            <option value="auto" ${selectedModel === 'auto' ? 'selected' : ''}>Modello: Auto (${selectedModel === 'auto' && reg.modelType ? (reg.modelType === 'quadratic' ? 'Quad' : 'Lin') : 'Consigliata'})</option>
                            <option value="linear" ${selectedModel === 'linear' ? 'selected' : ''}>Modello: Lineare</option>
                            <option value="quadratic" ${selectedModel === 'quadratic' ? 'selected' : ''}>Modello: Quadratica</option>
                        </select>
                        <span style="background: rgba(16,185,129,0.2); color:#10b981; padding:4px 10px; border-radius:4px; font-size:0.8rem; font-weight:600;">VBT Mode</span>
                    </div>
                </div>

                <!-- KPI CARDS -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; margin-top:1rem;">
                    <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:10px; padding:1rem; text-align:center;">
                        <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; color:#10b981; margin-bottom:0.25rem;">1RM Stimato (MVT ${mvt} m/s)</div>
                        <div style="font-size:1.8rem; font-weight:800; color:white;">${rounded1RM} <span style="font-size:0.9rem; font-weight:400;">kg</span> <span style="font-size:0.85rem; font-weight:600; color:#10b981;">(± ${oneRM.margin != null ? oneRM.margin.toFixed(1) : '0.0'} kg)</span></div>
                        <small style="color:var(--text-muted); font-size:0.72rem; display:block; margin-top:4px;">95% CI: [${oneRM.ci95Min != null ? oneRM.ci95Min.toFixed(1) : rounded1RM.toFixed(1)} - ${oneRM.ci95Max != null ? oneRM.ci95Max.toFixed(1) : rounded1RM.toFixed(1)} kg] · ${oneRMVal.toFixed(2)} kg puntuale</small>
                    </div>
                    <div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.3); border-radius:10px; padding:1rem; text-align:center;" title="F₀ = forza massimale teorica (intercetta a V=0 della retta OLS)">
                        <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; color:#818cf8; margin-bottom:0.25rem;">Forza Massimale F₀</div>
                        <div style="font-size:1.6rem; font-weight:800; color:white;">${(reg.f0_N != null ? reg.f0_N : 0).toFixed(0)} <span style="font-size:0.9rem; font-weight:400;">N</span></div>
                        <small style="color:var(--text-muted); font-size:0.72rem;">≈ ${(reg.f0 != null ? reg.f0 : 0).toFixed(1)} kg · V₀ = ${(reg.v0 != null ? reg.v0 : 0).toFixed(3)} m/s</small>
                    </div>
                    <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:1rem; text-align:center;">
                        <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; color:#f87171; margin-bottom:0.25rem;">Potenza Massimale Pmax</div>
                        <div style="font-size:1.6rem; font-weight:800; color:white;">${Math.round(reg.pmax || 0)} <span style="font-size:0.9rem; font-weight:400;">W</span></div>
                        <small style="color:var(--text-muted); font-size:0.72rem;">a ~${(reg.pmaxLoad != null ? reg.pmaxLoad : 0).toFixed(1)} kg · ${(reg.pmaxVelocity != null ? reg.pmaxVelocity.toFixed(3) : '0.000')} m/s</small>
                    </div>
                    <div style="background:rgba(${r2Color === '#10b981' ? '16,185,129' : r2Color === '#f59e0b' ? '245,158,11' : '239,68,68'},0.08); border:1px solid rgba(${r2Color === '#10b981' ? '16,185,129' : r2Color === '#f59e0b' ? '245,158,11' : '239,68,68'},0.3); border-radius:10px; padding:1rem; text-align:center;">
                        <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; color:${r2Color}; margin-bottom:0.25rem;">R² Affidabilità</div>
                        <div style="font-size:1.6rem; font-weight:800; color:white;">${(reg.rSquared != null ? reg.rSquared : 0).toFixed(4)}</div>
                        <small style="color:var(--text-muted); font-size:0.72rem;">${reg.qualityLabel} · SEE ${(reg.see != null ? reg.see : 0).toFixed(4)} m/s</small>
                    </div>
                </div>

                <!-- CHARTS ROW: Scatter + Power Curve (responsive: side-by-side on wide, stacked on narrow) -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:1.5rem; margin-top:1.5rem;">
                    <div class="analysis-chart-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                            <h4 style="margin:0; font-size:1rem; color:white; font-weight:700;">Profilo Carico-Velocità</h4>
                            <div style="display:inline-flex; align-items:center; gap:0.5rem;">
                                <span style="background:rgba(0,240,255,0.12); color:#00f0ff; border:1px solid rgba(0,240,255,0.3); border-radius:6px; font-size:0.75rem; padding:2px 8px; font-family:monospace; font-weight:700;">📐 ${reg.equation}</span>
                                <span style="background:rgba(${r2Color === '#10b981' ? '16,185,129' : r2Color === '#f59e0b' ? '245,158,11' : '239,68,68'},0.15); color:${r2Color}; border:1px solid rgba(${r2Color === '#10b981' ? '16,185,129' : r2Color === '#f59e0b' ? '245,158,11' : '239,68,68'},0.3); border-radius:6px; font-size:0.75rem; padding:2px 8px; font-family:monospace; font-weight:800;">R² = ${(reg.rSquared != null ? reg.rSquared : 0).toFixed(4)}</span>
                            </div>
                        </div>
                        <div class="chart-canvas-container" style="position:relative; height:320px;">
                            <canvas id="vbt-chart"></canvas>
                        </div>
                        <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-top:0.75rem; flex-wrap:wrap;">
                            <span style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.35); border-radius:6px; padding:3px 10px; font-size:0.78rem; color:#f59e0b; font-weight:600;">⚡ Soglia MVT: ${mvt.toFixed(2)} m/s (${(exercise || '').toLowerCase().includes('squat') ? 'Squat' : 'Panca/Stacco'})</span>
                            <span style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.35); border-radius:6px; padding:3px 10px; font-size:0.78rem; color:#10b981; font-weight:700;">🎯 1RM Stimato: ${rounded1RM} kg</span>
                        </div>
                    </div>
                    <div class="analysis-chart-card" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                            <h4 style="margin:0; font-size:1rem; color:white; font-weight:700;">Curva di Potenza Parabolica P(L) = F·V</h4>
                            <span style="background:rgba(217,70,239,0.15); color:#d946ef; border:1px solid rgba(217,70,239,0.3); border-radius:6px; font-size:0.75rem; padding:2px 8px; font-weight:700;">Picco Pmax: ${Math.round(reg.pmax || 0)} W</span>
                        </div>
                        <div class="chart-canvas-container" style="position:relative; height:320px;">
                            <canvas id="power-curve-chart"></canvas>
                        </div>
                        <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-top:0.75rem; flex-wrap:wrap;">
                            <span style="background:rgba(217,70,239,0.12); border:1px solid rgba(217,70,239,0.3); border-radius:6px; padding:3px 10px; font-size:0.78rem; color:#d946ef; font-weight:700;">👑 Pmax: ${Math.round(reg.pmax || 0)} W</span>
                            <span style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:6px; padding:3px 10px; font-size:0.78rem; color:#f59e0b; font-weight:600;">⚖️ Lopt: ${(reg.pmaxLoad != null ? reg.pmaxLoad : 0).toFixed(1)} kg</span>
                            <span style="background:rgba(6,182,212,0.12); border:1px solid rgba(6,182,212,0.3); border-radius:6px; padding:3px 10px; font-size:0.78rem; color:#06b6d4; font-weight:600;">🚀 Vopt: ${(reg.pmaxVelocity != null ? reg.pmaxVelocity.toFixed(3) : '0.000')} m/s</span>
                        </div>
                    </div>
                </div>

                <!-- F-V PROFILE BIAS -->
                <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:1.25rem; margin-top:1.5rem;">
                    <h4 style="margin:0 0 0.75rem 0; font-size:0.95rem; color:white;">Squilibrio Forza-Velocità (Sfvp)</h4>
                    <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
                        <div style="flex:1; min-width:200px;">
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">
                                <span>← Velocità</span><span>Forza →</span>
                            </div>
                            <div style="background:rgba(255,255,255,0.1); border-radius:999px; height:12px; position:relative; overflow:visible;">
                                <div style="position:absolute; left:50%; top:-2px; width:2px; height:16px; background:rgba(255,255,255,0.3);"></div>
                                <div style="position:absolute; top:0; height:12px; border-radius:999px;
                                    ${sfvpVal >= 0
                                        ? `left:50%; width:${Math.min(Math.abs(sfvpVal) * 0.5, 50)}%; background:linear-gradient(90deg,#f59e0b,#ef4444);`
                                        : `right:50%; width:${Math.min(Math.abs(sfvpVal) * 0.5, 50)}%; background:linear-gradient(270deg,#06b6d4,#6366f1);`
                                    }">
                                </div>
                            </div>
                        </div>
                        <div style="background:rgba(255,255,255,0.06); border-radius:8px; padding:0.6rem 1rem; font-size:0.88rem; color:white; white-space:nowrap;">
                            ${sfvpDisplay}
                        </div>
                    </div>
                </div>



                <!-- ROUND VELOCITY STEPS TABLE -->
                <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:1.5rem; overflow-x:auto; margin-top:1.5rem;">
                    <h4 style="margin:0 0 1rem 0; font-size:0.95rem; color:white;">Tabella di Allenamento VBT</h4>
                    <table style="width:100%; border-collapse:collapse; font-size:0.85rem; min-width:500px;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border); color:var(--accent); font-size:0.78rem; text-transform:uppercase;">
                                <th style="padding:0.6rem 0.75rem; text-align:left;">Velocità (m/s)</th>
                                <th style="padding:0.6rem 0.75rem; text-align:right;">Carico Allenante (kg)</th>
                                <th style="padding:0.6rem 0.75rem; text-align:right;">% 1RM</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${velStepsTable.map(s => `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:0.6rem 0.75rem; font-weight:700; color:#38bdf8;">${s.velocity} m/s</td>
                                <td style="padding:0.6rem 0.75rem; text-align:right; font-weight:600; color:white;">${s.load2_5kg} kg</td>
                                <td style="padding:0.6rem 0.75rem; text-align:right; font-weight:600; color:#cbd5e1;">${s.pct}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>



                <!-- BRYAN MANN VBT FORCE ZONES TABLE -->
                <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:1.5rem; overflow-x:auto; margin-top:1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
                        <h4 style="margin:0; font-size:0.95rem; color:white;">Tabella Completa VBT (Zone di Forza Bryan Mann)</h4>
                        <span style="font-size:0.75rem; color:var(--text-muted); background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:4px; border:1px solid rgba(255,255,255,0.1);">Target Biomeccanici VBT</span>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.85rem; min-width:650px;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border); color:var(--accent); font-size:0.78rem; text-transform:uppercase;">
                                <th style="padding:0.6rem 0.75rem; text-align:left;">Zona di Forza</th>
                                <th style="padding:0.6rem 0.75rem; text-align:center;">Range %1RM</th>
                                <th style="padding:0.6rem 0.75rem; text-align:center;">Velocità Target</th>
                                <th style="padding:0.6rem 0.75rem; text-align:right;">Carico (kg)</th>
                                <th style="padding:0.6rem 0.75rem; text-align:right;">Velocità Stimata</th>
                                <th style="padding:0.6rem 0.75rem; text-align:right;">Forza (N)</th>
                                <th style="padding:0.6rem 0.75rem; text-align:right;">Potenza (W)</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${bryanMannTable.map(s => {
                            const loadVal = (s.load2_5kg != null && !isNaN(s.load2_5kg)) ? s.load2_5kg : 0;
                            const velVal = (s.velocity != null && !isNaN(s.velocity)) ? (typeof s.velocity === 'number' ? s.velocity.toFixed(3) : s.velocity) : '0.000';
                            const forceVal = (s.forceN != null && !isNaN(s.forceN)) ? Math.round(s.forceN) : 0;
                            const powerVal = (s.powerW != null && !isNaN(s.powerW)) ? Math.round(s.powerW) : 0;
                            return `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:0.6rem 0.75rem; font-weight:700;">
                                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${s.color || '#fff'}; margin-right:8px;"></span>
                                    <span style="color:white;">${s.zone || ''}</span>
                                </td>
                                <td style="padding:0.6rem 0.75rem; text-align:center; color:#cbd5e1; font-weight:600;">${s.pctRange || ''}</td>
                                <td style="padding:0.6rem 0.75rem; text-align:center; color:#38bdf8; font-weight:600;">${s.targetVelocity || ''}</td>
                                <td style="padding:0.6rem 0.75rem; text-align:right; font-weight:700; color:white;">${loadVal} kg</td>
                                <td style="padding:0.6rem 0.75rem; text-align:right; font-weight:600; color:#38bdf8;">${velVal} m/s</td>
                                <td style="padding:0.6rem 0.75rem; text-align:right; font-weight:600; color:#818cf8;">${forceVal} N</td>
                                <td style="padding:0.6rem 0.75rem; text-align:right; font-weight:700; color:#f87171;">${powerVal} W</td>
                            </tr>`;
                        }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            dashboard.innerHTML = html;

            const modelSelect = dashboard.querySelector('.dashboard-model-select');
            if (modelSelect) {
                modelSelect.addEventListener('change', (e) => {
                    this.renderVBTDashboard(data, athlete, exercise, e.target.value);
                });
            }

            // === CHART 1: Load-Velocity Scatter + Regression Line ===
            const ctx1 = document.getElementById('vbt-chart')?.getContext('2d');
            if (ctx1) {
                const scatterData = vbtData.map(d => ({ x: d.load, y: d.velocity }));
                const loads = vbtData.map(d => d.load);
                const minL = Math.max(0, loads.reduce((a, b) => Math.min(a, b), Infinity) * 0.85);
                const maxL = Math.max(oneRMVal * 1.08, loads.reduce((a, b) => Math.max(a, b), -Infinity) * 1.05);
                const steps = 80;
                const lineData = [];
                for (let i = 0; i <= steps; i++) {
                    const L = minL + (maxL - minL) * (i / steps);
                    const V = reg.predictVelocity(L);
                    if (V >= 0) lineData.push({ x: parseFloat(L.toFixed(2)), y: parseFloat(V.toFixed(4)) });
                }
                // MVT line
                const mvtLine = [{ x: minL, y: mvt }, { x: maxL, y: mvt }];
                // 1RM point
                const oneRMPoint = [{ x: parseFloat(oneRMVal.toFixed(2)), y: mvt }];

                this.chartInstance = new Chart(ctx1, {
                    type: 'scatter',
                    plugins: [vbtZonesPlugin, neonGlowPlugin],
                    data: {
                        datasets: [
                            {
                                label: '1RM Stimato: ' + rounded1RM + ' kg',
                                data: oneRMPoint,
                                type: 'scatter',
                                backgroundColor: '#10b981',
                                borderColor: '#ffffff',
                                borderWidth: 2,
                                pointStyle: 'rectRot',
                                pointRadius: 9,
                                pointHoverRadius: 12,
                                glowColor: '#10b981',
                                glowBlur: 18,
                                order: 0
                            },
                            {
                                label: 'Dati Reali (Cyan Neon)',
                                data: scatterData,
                                backgroundColor: '#00f0ff',
                                borderColor: '#ffffff',
                                borderWidth: 2,
                                glowColor: '#00f0ff',
                                glowBlur: 16,
                                pointRadius: 7,
                                pointHoverRadius: 10,
                                order: 1
                            },
                            {
                                label: reg.modelType === 'quadratic' ? 'Regressione Quadratica Hybrid' : 'Regressione Lineare OLS',
                                data: lineData,
                                type: 'line',
                                borderColor: '#38bdf8',
                                glowColor: '#38bdf8',
                                glowBlur: 14,
                                borderWidth: 3,
                                fill: false,
                                pointRadius: 0,
                                showLine: true,
                                order: 2
                            },
                            {
                                label: `Soglia MVT — ${mvt.toFixed(2)} m/s`,
                                data: mvtLine,
                                type: 'line',
                                borderColor: '#f59e0b',
                                glowColor: '#f59e0b',
                                glowBlur: 12,
                                borderWidth: 2,
                                borderDash: [8, 4],
                                fill: false,
                                pointRadius: 0,
                                showLine: true,
                                order: 3
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#cbd5e1',
                                    font: { family: 'Inter, -apple-system, sans-serif', size: 11 },
                                    padding: 10,
                                    boxWidth: 12,
                                    usePointStyle: true
                                }
                            },
                            tooltip: {
                                enabled: false,
                                external: glassTooltipHandler,
                                callbacks: {
                                    label: (ctx) => {
                                        if (ctx.dataset.label.includes('1RM Stimato')) {
                                            return `🎯 1RM Stimato: ${ctx.parsed.x.toFixed(1)} kg @ MVT ${ctx.parsed.y.toFixed(2)} m/s`;
                                        }
                                        if (ctx.dataset.label.includes('Dati Reali')) {
                                            return `⚡ Carico: ${ctx.parsed.x} kg → Velocità: ${ctx.parsed.y.toFixed(3)} m/s`;
                                        }
                                        return `${ctx.dataset.label}: ${ctx.parsed.x.toFixed(1)} kg → ${ctx.parsed.y.toFixed(3)} m/s`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: { display: true, text: 'Carico esercizio (kg)', color: '#94a3b8', font: { family: 'Inter', size: 12, weight: 600 } },
                                ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                                grid: { color: 'rgba(255,255,255,0.06)' },
                                min: 0
                            },
                            y: {
                                title: { display: true, text: 'Velocità media (m/s)', color: '#94a3b8', font: { family: 'Inter', size: 12, weight: 600 } },
                                ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                                grid: { color: 'rgba(255,255,255,0.06)' },
                                min: 0,
                                max: Math.max(1.5, Math.ceil((Math.max(...vbtData.map(d => d.velocity), 1.3) * 1.2) * 10) / 10)
                            }
                        }
                    }
                });
            }

            // === CHART 2: Power Curve (Parabola Biomeccanica Continua) ===
            const ctx2 = document.getElementById('power-curve-chart')?.getContext('2d');
            if (ctx2) {
                const loads = vbtData.map(d => d.load);
                const dataMaxL = loads.reduce((a, b) => Math.max(a, b), 0);
                const f0Safe = (reg.f0 && reg.f0 > 0) ? reg.f0 : Math.max(oneRMVal * 1.15, dataMaxL * 1.25);
                const minL = 0;
                const maxL = f0Safe * 1.02;
                
                // Campionamento continuo di 45 punti della parabola biomeccanica P(L) = L * 9.81 * V(L)
                const powerPoints = [];
                const sampleSteps = 45;
                for (let i = 0; i <= sampleSteps; i++) {
                    const L = minL + (maxL - minL) * (i / sampleSteps);
                    const V = reg.predictVelocity(L);
                    const Vclamped = Math.max(0, V);
                    const P = L * 9.81 * Vclamped;
                    powerPoints.push({ x: parseFloat(L.toFixed(1)), y: Math.round(P) });
                }

                // Evidenziazione vertice parabola: Pmax, Lopt, Vopt
                const lOpt = reg.pmaxLoad != null ? reg.pmaxLoad : (f0Safe * 0.5);
                const vOpt = reg.pmaxVelocity != null ? reg.pmaxVelocity : ((reg.v0 || 1.0) * 0.5);
                const pMaxVal = Math.round(reg.pmax || (lOpt * 9.81 * Math.max(0, vOpt)));
                const pmaxPoint = [{ x: parseFloat(lOpt.toFixed(1)), y: pMaxVal }];

                // Punti sperimentali di potenza reale
                const realPowerPoints = vbtData.map(d => ({
                    x: d.load,
                    y: Math.round(d.load * 9.81 * d.velocity)
                }));

                // Gradiente viola/magenta
                const powerGradient = ctx2.createLinearGradient(0, 0, 0, 300);
                powerGradient.addColorStop(0, 'rgba(217, 70, 239, 0.45)');
                powerGradient.addColorStop(0.6, 'rgba(147, 51, 234, 0.18)');
                powerGradient.addColorStop(1, 'rgba(147, 51, 234, 0.01)');

                this.powerCurveChart = new Chart(ctx2, {
                    type: 'line',
                    plugins: [neonGlowPlugin],
                    data: {
                        datasets: [
                            {
                                label: `Vertice Pmax: ${pMaxVal} W (Lopt: ${lOpt.toFixed(1)} kg, Vopt: ${vOpt.toFixed(2)} m/s)`,
                                data: pmaxPoint,
                                backgroundColor: '#ffe600',
                                borderColor: '#ffffff',
                                borderWidth: 2,
                                glowColor: '#ffe600',
                                glowBlur: 20,
                                pointRadius: 9,
                                pointHoverRadius: 12,
                                type: 'scatter',
                                order: 0
                            },
                            {
                                label: 'Potenza Sperimentale (Dati Reali)',
                                data: realPowerPoints,
                                type: 'scatter',
                                backgroundColor: '#00f0ff',
                                borderColor: '#ffffff',
                                borderWidth: 1.5,
                                glowColor: '#00f0ff',
                                glowBlur: 14,
                                pointRadius: 5.5,
                                pointHoverRadius: 8,
                                order: 1
                            },
                            {
                                label: 'Curva Parabolica P(L) = F·V',
                                data: powerPoints,
                                borderColor: '#d946ef',
                                backgroundColor: powerGradient,
                                glowColor: '#d946ef',
                                glowBlur: 18,
                                borderWidth: 3,
                                pointRadius: 0,
                                fill: true,
                                tension: 0.38,
                                order: 2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#cbd5e1',
                                    font: { family: 'Inter, -apple-system, sans-serif', size: 11 },
                                    padding: 10,
                                    boxWidth: 12,
                                    usePointStyle: true
                                }
                            },
                            tooltip: {
                                enabled: false,
                                external: glassTooltipHandler,
                                callbacks: {
                                    label: (ctx) => {
                                        if (ctx.datasetIndex === 0) {
                                            return `👑 Pmax: ${ctx.parsed.y} W @ Carico: ${ctx.parsed.x.toFixed(1)} kg (Vopt: ${vOpt.toFixed(3)} m/s)`;
                                        }
                                        if (ctx.datasetIndex === 1) {
                                            return `⚡ Potenza Reale: ${ctx.parsed.y} W @ ${ctx.parsed.x} kg`;
                                        }
                                        return `Potenza Stimata: ${ctx.parsed.y} W @ ${ctx.parsed.x.toFixed(1)} kg`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: { display: true, text: 'Carico esercizio (kg)', color: '#94a3b8', font: { family: 'Inter', size: 12, weight: 600 } },
                                ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                                grid: { color: 'rgba(255,255,255,0.06)' },
                                min: 0
                            },
                            y: {
                                title: { display: true, text: 'Potenza meccanica (W)', color: '#94a3b8', font: { family: 'Inter', size: 12, weight: 600 } },
                                ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                                grid: { color: 'rgba(255,255,255,0.06)' },
                                min: 0
                            }
                        }
                    }
                });
            }
        }

        renderRunningDashboard(data, athlete, exercise) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
            
            // Calcolo Base Volumi Corsa
            let totalDistance = 0;
            let totalTime = 0; // assumiamo minuti
            
            data.forEach(d => {
                if (d.distance) totalDistance += d.distance;
                if (d.time) totalTime += d.time;
            });

            // Removed arbitrary >500 conversion (Bug B2)
            // Se necessario, l'unità dovrebbe essere specificata dall'utente.

            const avgPace = totalTime > 0 && totalDistance > 0 ? (totalTime / totalDistance).toFixed(2) : '-';

            dashboard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:1rem;">
                    <h3>🏃‍♂️ Volumi di Lavoro ${athlete ? '- ' + athlete : ''} ${exercise ? '[' + exercise + ']' : ''}</h3>
                    <span style="background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Running Mode</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--accent);">Distanza Totale</div>
                        <div style="font-size: 2rem; font-weight: bold; color: white;">${totalDistance.toFixed(2)} km</div>
                    </div>
                    <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; color: #818cf8;">Passo Medio</div>
                        <div style="font-size: 2rem; font-weight: bold; color: white;">${avgPace} <small>min/km</small></div>
                    </div>
                </div>
            `;
        }

        renderJumpDashboard(data, athlete) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            const sjPoints = [];
            const cmjPoints = [];
            const djPoints = [];

            data.forEach(r => {
                const ex = (r.exercise || '').toLowerCase();
                if (ex.includes('sj') || ex.includes('squat jump') || ex.includes('squatjump')) {
                    sjPoints.push(r);
                } else if (ex.includes('cmj') || ex.includes('countermovement') || ex.includes('counter movement')) {
                    cmjPoints.push(r);
                } else if (ex.includes('dj') || ex.includes('drop jump') || ex.includes('dropjump') || (r.contactTime > 0 && r.jumpHeight > 0)) {
                    djPoints.push(r);
                }
            });

            const sjHeights = sjPoints.map(p => p.jumpHeight).filter(h => typeof h === 'number' && !isNaN(h) && h > 0);
            const cmjHeights = cmjPoints.map(p => p.jumpHeight).filter(h => typeof h === 'number' && !isNaN(h) && h > 0);
            const djHeights = djPoints.map(p => p.jumpHeight).filter(h => typeof h === 'number' && !isNaN(h) && h > 0);
            const djContactTimes = djPoints.map(p => p.contactTime).filter(t => typeof t === 'number' && !isNaN(t) && t > 0);

            const avgSJ = sjHeights.length > 0 ? sjHeights.reduce((a, b) => a + b, 0) / sjHeights.length : 0;
            const avgCMJ = cmjHeights.length > 0 ? cmjHeights.reduce((a, b) => a + b, 0) / cmjHeights.length : 0;
            const avgDJHeight = djHeights.length > 0 ? djHeights.reduce((a, b) => a + b, 0) / djHeights.length : 0;
            const avgDJContact = djContactTimes.length > 0 ? djContactTimes.reduce((a, b) => a + b, 0) / djContactTimes.length : 0;

            const eur = window.PhysicsEngine.calculateEUR(avgCMJ, avgSJ);

            const djRSIs = [];
            djPoints.forEach(p => {
                if (typeof p.jumpHeight === 'number' && typeof p.contactTime === 'number' && p.jumpHeight > 0 && p.contactTime > 0) {
                    const rsi = window.PhysicsEngine.calculateRSI(p.jumpHeight, p.contactTime);
                    djRSIs.push({
                        height: p.jumpHeight,
                        contactTime: p.contactTime,
                        rsi: rsi
                    });
                }
            });

            const avgRSI = djRSIs.length > 0 ? djRSIs.reduce((a, b) => a + b.rsi, 0) / djRSIs.length : 0;

            // Classifications
            let eurClass = "N/A";
            if (eur > 0) {
                if (eur < 1.05) eurClass = "Dominanza Concentrica";
                else if (eur <= 1.15) eurClass = "Bilanciato";
                else eurClass = "Dominanza Elastica";
            }

            let rsiClass = "N/A";
            if (avgRSI > 0) {
                if (avgRSI < 1.5) rsiClass = "Basso";
                else if (avgRSI < 2.0) rsiClass = "Moderato";
                else if (avgRSI <= 2.5) rsiClass = "Alto";
                else rsiClass = "Elite";
            }

            const evaluationText = window.PhysicsEngine.evaluateJumpPerformance(eur, avgRSI);

            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:1rem;">
                    <h3>Valutazione Salto e Forza Reattiva ${athlete ? '- ' + athlete : ''}</h3>
                    <span style="background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Jump Test Mode</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
                    <!-- EUR Card -->
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem;">
                        <h4 style="margin-top: 0; color: var(--accent); font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <span>🔄</span> Efficienza Elastica (EUR)
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <small style="color: var(--text-muted); display: block; font-size: 0.8rem;">Squat Jump (SJ) Medio</small>
                                <strong style="font-size: 1.4rem; color: white;">${avgSJ > 0 ? avgSJ.toFixed(1) + ' cm' : 'N/A'}</strong>
                            </div>
                            <div>
                                <small style="color: var(--text-muted); display: block; font-size: 0.8rem;">Countermovement (CMJ) Medio</small>
                                <strong style="font-size: 1.4rem; color: white;">${avgCMJ > 0 ? avgCMJ.toFixed(1) + ' cm' : 'N/A'}</strong>
                            </div>
                        </div>
                        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05);">
                            <small style="color: var(--text-muted); display: block; font-size: 0.8rem;">Eccentric Utilization Ratio (EUR)</small>
                            <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.25rem;">
                                <strong style="font-size: 1.8rem; color: #10b981;">${eur > 0 ? eur.toFixed(4) : 'N/A'}</strong>
                                ${eur > 0 ? `<span style="font-size: 0.9rem; color: #10b981; font-weight: 600;">(${eurClass})</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- RSI Card -->
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem;">
                        <h4 style="margin-top: 0; color: var(--accent); font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <span>⚡</span> Forza Reattiva (RSI)
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <small style="color: var(--text-muted); display: block; font-size: 0.8rem;">Drop Jump (DJ) Medio</small>
                                <strong style="font-size: 1.4rem; color: white;">${avgDJHeight > 0 ? avgDJHeight.toFixed(1) + ' cm' : 'N/A'}</strong>
                            </div>
                            <div>
                                <small style="color: var(--text-muted); display: block; font-size: 0.8rem;">Tempo di Contatto Medio</small>
                                <strong style="font-size: 1.4rem; color: white;">${avgDJContact > 0 ? avgDJContact.toFixed(3) + ' s' : 'N/A'}</strong>
                            </div>
                        </div>
                        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05);">
                            <small style="color: var(--text-muted); display: block; font-size: 0.8rem;">Reactive Strength Index (RSI)</small>
                            <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.25rem;">
                                <strong style="font-size: 1.8rem; color: #6366f1;">${avgRSI > 0 ? avgRSI.toFixed(4) : 'N/A'}</strong>
                                ${avgRSI > 0 ? `<span style="font-size: 0.9rem; color: #6366f1; font-weight: 600;">(${rsiClass})</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
                    <h4 style="margin-top: 0; color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 0.5rem;">
                        Analisi Qualitativa del Profilo di Forza
                    </h4>
                    <p style="white-space: pre-wrap; line-height: 1.6; margin: 0.5rem 0 0 0; color: #d1d5db; font-size: 0.95rem;">
                        ${evaluationText}
                    </p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
                    <div class="analysis-chart-card">
                        <h5 style="margin-top:0; margin-bottom: 1rem; color: white; font-size: 1rem;">Confronto Altezze: CMJ vs SJ</h5>
                        <div class="chart-canvas-container">
                            <canvas id="jump-heights-chart"></canvas>
                        </div>
                    </div>
                    <div class="analysis-chart-card">
                        <h5 style="margin-top:0; margin-bottom: 1rem; color: white; font-size: 1rem;">Drop Jump: Andamento RSI per Prova</h5>
                        <div class="chart-canvas-container">
                            <canvas id="rsi-trials-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;

            dashboard.innerHTML = html;

            // Render Charts
            // 1. heights chart (CMJ vs SJ)
            const ctxHeights = document.getElementById('jump-heights-chart')?.getContext('2d');
            if (ctxHeights) {
                const maxTrials = Math.max(sjHeights.length, cmjHeights.length);
                const labels = [];
                for (let i = 0; i < maxTrials; i++) {
                    labels.push(`Prova ${i + 1}`);
                }
                this.jumpHeightChart = new Chart(ctxHeights, {
                    type: 'bar',
                    plugins: [neonGlowPlugin],
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Squat Jump (SJ)',
                                data: sjHeights,
                                backgroundColor: '#00ff9d',
                                borderColor: '#00ff9d',
                                glowColor: '#00ff9d',
                                glowBlur: 12,
                                borderRadius: 6
                            },
                            {
                                label: 'Countermovement Jump (CMJ)',
                                data: cmjHeights,
                                backgroundColor: '#8b5cf6',
                                borderColor: '#8b5cf6',
                                glowColor: '#8b5cf6',
                                glowBlur: 12,
                                borderRadius: 6
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { labels: { color: '#cbd5e1', font: { family: 'Inter', size: 12 }, padding: 12 } },
                            tooltip: {
                                enabled: false,
                                external: glassTooltipHandler,
                                callbacks: {
                                    label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} cm`
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                                grid: { color: 'rgba(255,255,255,0.05)' }
                            },
                            y: {
                                title: { display: true, text: 'Altezza (cm)', color: '#94a3b8', font: { family: 'Inter', size: 12, weight: 500 } },
                                ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                                grid: { color: 'rgba(255,255,255,0.05)' },
                                min: 0
                            }
                        }
                    }
                });
            }

            // 2. drop jump rsi trials chart
            const ctxRsi = document.getElementById('rsi-trials-chart')?.getContext('2d');
            if (ctxRsi) {
                if (djRSIs.length > 0) {
                    const rsiLabels = djRSIs.map((_, idx) => `Prova ${idx + 1}`);
                    const rsiValues = djRSIs.map(d => d.rsi);
                    this.rsiChart = new Chart(ctxRsi, {
                        type: 'line',
                        plugins: [neonGlowPlugin],
                        data: {
                            labels: rsiLabels,
                            datasets: [{
                                label: 'RSI per Prova',
                                data: rsiValues,
                                borderColor: '#ff9900',
                                backgroundColor: 'rgba(255, 153, 0, 0.12)',
                                glowColor: '#ff9900',
                                glowBlur: 16,
                                borderWidth: 3,
                                pointRadius: 7,
                                pointHoverRadius: 9,
                                fill: true,
                                tension: 0.2
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { labels: { color: '#cbd5e1', font: { family: 'Inter', size: 12 }, padding: 12 } },
                                tooltip: {
                                    enabled: false,
                                    external: glassTooltipHandler,
                                    callbacks: {
                                        label: (ctx) => `RSI: ${ctx.parsed.y.toFixed(2)}`
                                    }
                                }
                            },
                            scales: {
                                x: {
                                    ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                                    grid: { color: 'rgba(255,255,255,0.05)' }
                                },
                                y: {
                                    title: { display: true, text: 'RSI', color: '#94a3b8', font: { family: 'Inter', size: 12, weight: 500 } },
                                    ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                                    grid: { color: 'rgba(255,255,255,0.05)' },
                                    min: 0,
                                    suggestedMax: 3.0
                                }
                            }
                        }
                    });
                }
            }
        }

        /**
         * Renderizza la suite completa di analisi Post-Activation Potentiation (PAP) e dinamica di salto.
         * Integra validazione balistica cinematica, soglie MDC al 95%, test inferenziali (p-value, Hedges g)
         * e il cruscotto prescrittivo del Coach AI Engine.
         * @param {Array<Object>} [records=null] - Record opzionali estratti da file importato.
         * @param {string} [athlete=null] - Nome dell'atleta selezionato.
         */
        renderPAPDashboard(records = null, athlete = null) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            if (window.PAPAnalysis && typeof window.PAPAnalysis.initDashboard === 'function') {
                const view = window.PAPAnalysis.initDashboard('dashboard-container', { records, selectedAthlete: athlete });
                if (view && this.customCharts) {
                    this.customCharts.push({
                        destroy: () => {
                            if (view && typeof view.destroyCharts === 'function') {
                                view.destroyCharts();
                            }
                        }
                    });
                }
            } else {
                dashboard.innerHTML = `
                    <div style="padding: 2.5rem; text-align: center; border: 1px dashed #ef4444; border-radius: 12px; color: #fca5a5;">
                        Modulo di Analisi PAP e Dinamica di Salto non disponibile. Ricaricare l'applicazione.
                    </div>
                `;
            }
        }

        renderSingleVBTPointDashboard(point, athlete, exercise) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            const load = typeof point.load === 'number' ? point.load : parseFloat(point.load) || 0;
            const velocity = typeof point.velocity === 'number' ? point.velocity : parseFloat(point.velocity) || 0;
            const power = point.power || Math.round(load * 9.81 * velocity);

            let estimated1RM = 'N/A';
            let pct1RM = 'N/A';
            if (velocity > 0.15 && velocity < 1.8) {
                const estPct = Math.min(98, Math.max(30, Math.round(-60 * velocity + 115)));
                pct1RM = `~${estPct}%`;
                const est1RMVal = Math.round(load / (estPct / 100));
                estimated1RM = `${est1RMVal} kg`;
            }

            dashboard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:1rem;">
                    <div>
                        <h3 style="margin:0; font-size:1.4rem; color:white;">⚡ Analisi VBT: Singola Prova</h3>
                        <p style="margin:0.25rem 0 0 0; color:var(--text-muted); font-size:0.85rem;">Atleta: <strong style="color:white;">${athlete || 'Atleta'}</strong> | Esercizio: <strong style="color:var(--accent);">${exercise || 'VBT'}</strong></p>
                    </div>
                    <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; font-weight:600; border: 1px solid rgba(16,185,129,0.3);">
                        Encoder VBT (Singolo Punto)
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted);">Carico Sollevato</div>
                        <div style="font-size: 2rem; font-weight: 800; color: white; margin-top: 0.25rem;">${load} <small style="font-size:1rem; color:var(--text-muted);">kg</small></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted);">Velocità Media</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #10b981; margin-top: 0.25rem;">${velocity.toFixed(2)} <small style="font-size:1rem; color:var(--text-muted);">m/s</small></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted);">Potenza Stimata</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #818cf8; margin-top: 0.25rem;">${power} <small style="font-size:1rem; color:var(--text-muted);">W</small></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted);">Stima %1RM / 1RM</div>
                        <div style="font-size: 1.6rem; font-weight: 800; color: #f59e0b; margin-top: 0.25rem;">${estimated1RM} <small style="font-size:0.9rem; color:var(--text-muted);">(${pct1RM})</small></div>
                    </div>
                </div>

                <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 10px; padding: 1.25rem; margin-top: 1.5rem;">
                    <h4 style="margin:0 0 0.5rem 0; color:#818cf8; font-size:0.95rem;">💡 Suggerimento Metodologico</h4>
                    <p style="margin:0; font-size:0.85rem; color:#cbd5e1; line-height:1.5;">
                        È stata caricata una singola ripetizione/carico. Per ottenere il profilo completo Carico-Velocità a 2 o più punti con calcolo della regressione lineare/quadratica ed R², carica o aggiungi un secondo carico nella scheda <em>Inserimento Manuale</em>.
                    </p>
                </div>
            `;
        }

        renderForcePlateDashboard(data, athlete, exercise) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            const fzValues = data.map(r => r.forceZ).filter(v => typeof v === 'number' && !isNaN(v));
            const peakForces = data.map(r => r.peakForce).filter(v => typeof v === 'number' && !isNaN(v));
            const rfds = data.map(r => r.rfd).filter(v => typeof v === 'number' && !isNaN(v));
            const impulses = data.map(r => r.impulse).filter(v => typeof v === 'number' && !isNaN(v));
            const rsimods = data.map(r => r.rsimod).filter(v => typeof v === 'number' && !isNaN(v));
            const leftForces = data.map(r => r.leftForce).filter(v => typeof v === 'number' && !isNaN(v));
            const rightForces = data.map(r => r.rightForce).filter(v => typeof v === 'number' && !isNaN(v));

            const maxPeakForce = peakForces.length > 0 ? Math.max(...peakForces) : (fzValues.length > 0 ? Math.max(...fzValues) : 0);
            const avgMeanForce = fzValues.length > 0 ? (fzValues.reduce((a, b) => a + b, 0) / fzValues.length) : 0;
            const maxRFD = rfds.length > 0 ? Math.max(...rfds) : 0;
            const avgImpulse = impulses.length > 0 ? (impulses.reduce((a, b) => a + b, 0) / impulses.length) : 0;
            const avgRSImod = rsimods.length > 0 ? (rsimods.reduce((a, b) => a + b, 0) / rsimods.length) : 0;

            let asymmetryText = 'N/A';
            let asymmetryVal = 0;
            if (leftForces.length > 0 && rightForces.length > 0) {
                const avgL = leftForces.reduce((a, b) => a + b, 0) / leftForces.length;
                const avgR = rightForces.reduce((a, b) => a + b, 0) / rightForces.length;
                if (Math.max(avgL, avgR) > 0) {
                    asymmetryVal = Math.abs(avgR - avgL) / Math.max(avgL, avgR) * 100;
                    asymmetryText = `${asymmetryVal.toFixed(1)}% (${avgR >= avgL ? 'Destro domin.' : 'Sinistro domin.'})`;
                }
            }

            dashboard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:1rem;">
                    <div>
                        <h3 style="margin:0; font-size:1.4rem; color:white;">🏋️‍♂️ Analisi Pedana di Forza</h3>
                        <p style="margin:0.25rem 0 0 0; color:var(--text-muted); font-size:0.85rem;">Atleta: <strong style="color:white;">${athlete || 'Atleta'}</strong> | Test: <strong style="color:var(--accent);">${exercise || 'Forza Verticale'}</strong></p>
                    </div>
                    <span style="background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; font-weight:600; border: 1px solid rgba(99,102,241,0.3);">
                        Pedana di Forza
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Picco di Forza (Fmax)</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #10b981; margin-top: 0.25rem;">${maxPeakForce > 0 ? maxPeakForce.toFixed(0) : 'N/A'} <small style="font-size:0.9rem; color:var(--text-muted);">N</small></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Tasso Sviluppo Forza (RFD)</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #6366f1; margin-top: 0.25rem;">${maxRFD > 0 ? maxRFD.toFixed(0) : 'N/A'} <small style="font-size:0.9rem; color:var(--text-muted);">N/s</small></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Impulso Meccanico</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 0.25rem;">${avgImpulse > 0 ? avgImpulse.toFixed(1) : 'N/A'} <small style="font-size:0.9rem; color:var(--text-muted);">N·s</small></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">RSI Modificato</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #ec4899; margin-top: 0.25rem;">${avgRSImod > 0 ? avgRSImod.toFixed(3) : 'N/A'}</div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Asimmetria L/R</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: ${asymmetryVal > 15 ? '#ef4444' : '#10b981'}; margin-top: 0.25rem;">${asymmetryText}</div>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
                    <h4 style="margin:0 0 1rem 0; color:white; font-size:1.05rem;">Tracciato Forza Verticale Fz (N)</h4>
                    <div style="height: 320px; width: 100%; position: relative;">
                        <canvas id="force-plate-chart"></canvas>
                    </div>
                </div>
            `;

            const chartData = fzValues.length > 0 ? fzValues : (peakForces.length > 0 ? peakForces : []);
            if (chartData.length > 0) {
                const labels = chartData.map((_, i) => `#${i + 1}`);
                const ctx = document.getElementById('force-plate-chart')?.getContext('2d');
                if (ctx) {
                    const newChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Forza Fz (N)',
                                data: chartData,
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                borderWidth: 2.5,
                                pointRadius: chartData.length > 50 ? 0 : 4,
                                fill: true,
                                tension: 0.2
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { labels: { color: '#cbd5e1' } } },
                            scales: {
                                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                y: {
                                    title: { display: true, text: 'Forza (N)', color: '#94a3b8' },
                                    ticks: { color: '#94a3b8' },
                                    grid: { color: 'rgba(255,255,255,0.05)' }
                                }
                            }
                        }
                    });
                    if (!this.customCharts) this.customCharts = [];
                    this.customCharts.push(newChart);
                }
            }
        }

        renderAccelerometerDashboard(data, athlete, exercise) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            const horizAccels = data.map(r => r.horizontalAccel).filter(v => typeof v === 'number' && !isNaN(v));
            const resAccels = data.map(r => r.resultantAccel).filter(v => typeof v === 'number' && !isNaN(v));
            const rxTimes = data.map(r => r.reactionTime).filter(v => typeof v === 'number' && !isNaN(v) && v > 0);
            const pushTimes = data.map(r => r.pushDuration).filter(v => typeof v === 'number' && !isNaN(v) && v > 0);
            const exitVels = data.map(r => r.exitVelocity).filter(v => typeof v === 'number' && !isNaN(v) && v > 0);

            const peakHoriz = horizAccels.length > 0 ? Math.max(...horizAccels) : (resAccels.length > 0 ? Math.max(...resAccels) : 0);
            const reactionTime = rxTimes.length > 0 ? rxTimes[0] : 0;
            const reactionTimeMs = reactionTime > 0 ? (reactionTime > 5 ? Math.round(reactionTime) : Math.round(reactionTime * 1000)) : 0;
            const pushDuration = pushTimes.length > 0 ? pushTimes[0] : 0;
            const exitVel = exitVels.length > 0 ? Math.max(...exitVels) : (peakHoriz > 0 && pushDuration > 0 ? (peakHoriz * pushDuration * 0.55).toFixed(2) : 0);

            dashboard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:1rem;">
                    <div>
                        <h3 style="margin:0; font-size:1.4rem; color:white;">🚀 Partenza dai Blocchi (Accelerometro / IMU)</h3>
                        <p style="margin:0.25rem 0 0 0; color:var(--text-muted); font-size:0.85rem;">Atleta: <strong style="color:white;">${athlete || 'Atleta'}</strong> | Prova: <strong style="color:var(--accent);">${exercise || 'Blocchi di Partenza'}</strong></p>
                    </div>
                    <span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; font-weight:600; border: 1px solid rgba(245,158,11,0.3);">
                        IMU Blocchi
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Tempo di Reazione (RT)</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: ${reactionTimeMs < 100 && reactionTimeMs > 0 ? '#ef4444' : '#10b981'}; margin-top: 0.25rem;">
                            ${reactionTimeMs > 0 ? reactionTimeMs + ' ms' : 'N/A'}
                        </div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">${reactionTimeMs >= 100 ? '✅ Valida World Athletics' : (reactionTimeMs > 0 ? '⚠️ Falsa Partenza (<100ms)' : 'Non specificato')}</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Tempo di Spinta Blocchi</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #818cf8; margin-top: 0.25rem;">
                            ${pushDuration > 0 ? pushDuration.toFixed(3) + ' s' : 'N/A'}
                        </div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Block clearance time</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Picco Accelerazione Orizz.</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 0.25rem;">
                            ${peakHoriz > 0 ? peakHoriz.toFixed(2) : 'N/A'} <small style="font-size:0.9rem; color:var(--text-muted);">m/s²</small>
                        </div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Propulsione orizzontale</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Velocità Uscita Stimata</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #10b981; margin-top: 0.25rem;">
                            ${exitVel > 0 ? exitVel : 'N/A'} <small style="font-size:0.9rem; color:var(--text-muted);">m/s</small>
                        </div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">${exitVel > 0 ? (exitVel * 3.6).toFixed(1) + ' km/h' : ''}</small>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
                    <h4 style="margin:0 0 1rem 0; color:white; font-size:1.05rem;">Profilo Accelerazione di Spinta sui Blocchi</h4>
                    <div style="height: 300px; width: 100%; position: relative;">
                        <canvas id="accel-blocks-chart"></canvas>
                    </div>
                </div>
            `;

            const accelData = horizAccels.length > 0 ? horizAccels : (resAccels.length > 0 ? resAccels : []);
            if (accelData.length > 0) {
                const labels = accelData.map((_, i) => `#${i + 1}`);
                const ctx = document.getElementById('accel-blocks-chart')?.getContext('2d');
                if (ctx) {
                    const newChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Accelerazione (m/s²)',
                                data: accelData,
                                borderColor: '#f59e0b',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                borderWidth: 2.5,
                                pointRadius: accelData.length > 50 ? 0 : 3,
                                fill: true,
                                tension: 0.25
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { labels: { color: '#cbd5e1' } } },
                            scales: {
                                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                y: {
                                    title: { display: true, text: 'Accelerazione (m/s²)', color: '#94a3b8' },
                                    ticks: { color: '#94a3b8' },
                                    grid: { color: 'rgba(255,255,255,0.05)' }
                                }
                            }
                        }
                    });
                    if (!this.customCharts) this.customCharts = [];
                    this.customCharts.push(newChart);
                }
            }
        }

        renderSprintDashboard(data, athlete, exercise) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            const splits = [];
            const firstRow = data[0] || {};
            if (firstRow.split_5m) splits.push({ distance: 5, time: firstRow.split_5m });
            if (firstRow.split_10m) splits.push({ distance: 10, time: firstRow.split_10m });
            if (firstRow.split_20m) splits.push({ distance: 20, time: firstRow.split_20m });
            if (firstRow.split_30m) splits.push({ distance: 30, time: firstRow.split_30m });
            if (firstRow.split_60m) splits.push({ distance: 60, time: firstRow.split_60m });

            if (splits.length === 0) {
                data.forEach(r => {
                    const d = r.splitDistance || r.distance;
                    const t = r.cumulativeTime || r.splitTime || r.time;
                    if (d > 0 && t > 0) {
                        splits.push({ distance: d, time: t });
                    }
                });
            }

            splits.sort((a, b) => a.distance - b.distance);

            let maxSpeedMs = 0;
            const splitRows = splits.map((s, i) => {
                let segmentDist = s.distance;
                let segmentTime = s.time;
                if (i > 0) {
                    segmentDist = s.distance - splits[i - 1].distance;
                    segmentTime = s.time - splits[i - 1].time;
                }
                const segSpeedMs = segmentTime > 0 ? (segmentDist / segmentTime) : 0;
                const segSpeedKmh = segSpeedMs * 3.6;
                if (segSpeedMs > maxSpeedMs) maxSpeedMs = segSpeedMs;

                return {
                    distance: s.distance,
                    cumulativeTime: s.time,
                    segmentTime: segmentTime.toFixed(3),
                    speedMs: segSpeedMs.toFixed(2),
                    speedKmh: segSpeedKmh.toFixed(1)
                };
            });

            const totalTime = splits.length > 0 ? splits[splits.length - 1].time : 0;
            const totalDistance = splits.length > 0 ? splits[splits.length - 1].distance : 0;

            const v0Est = (maxSpeedMs * 1.08).toFixed(2);
            const f0Est = totalTime > 0 ? (v0Est / (splits[0]?.time || 1.8) * 1.3).toFixed(2) : 'N/A';

            dashboard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:1rem;">
                    <div>
                        <h3 style="margin:0; font-size:1.4rem; color:white;">⏱️ Fotocellule & Analisi Sprint</h3>
                        <p style="margin:0.25rem 0 0 0; color:var(--text-muted); font-size:0.85rem;">Atleta: <strong style="color:white;">${athlete || 'Atleta'}</strong> | Prova: <strong style="color:var(--accent);">${exercise || 'Sprint ' + totalDistance + 'm'}</strong></p>
                    </div>
                    <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; font-weight:600; border: 1px solid rgba(16,185,129,0.3);">
                        Fotocellule
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Tempo Totale (${totalDistance}m)</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #10b981; margin-top: 0.25rem;">${totalTime > 0 ? totalTime.toFixed(3) : 'N/A'} <small style="font-size:1rem; color:var(--text-muted);">s</small></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Velocità di Picco (Vmax)</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #818cf8; margin-top: 0.25rem;">${(maxSpeedMs * 3.6).toFixed(1)} <small style="font-size:1rem; color:var(--text-muted);">km/h</small></div>
                        <small style="color:var(--text-muted); font-size:0.8rem;">${maxSpeedMs.toFixed(2)} m/s</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Stima V0 (Samozino)</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #f59e0b; margin-top: 0.25rem;">${v0Est} <small style="font-size:1rem; color:var(--text-muted);">m/s</small></div>
                        <small style="color:var(--text-muted); font-size:0.8rem;">Velocità max teorica</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Stima F0 Teorica</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #ec4899; margin-top: 0.25rem;">${f0Est} <small style="font-size:1rem; color:var(--text-muted);">N/kg</small></div>
                        <small style="color:var(--text-muted); font-size:0.8rem;">Forza orizzontale</small>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin-top: 1.5rem;">
                    <h4 style="margin:0 0 1rem 0; color:white; font-size:1rem;">Dettaglio Intertempi alle Fotocellule</h4>
                    <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:var(--text-muted); text-align:left;">
                                <th style="padding:0.5rem;">Traguardo</th>
                                <th style="padding:0.5rem;">Tempo Cumulativo</th>
                                <th style="padding:0.5rem;">Tempo Tratta</th>
                                <th style="padding:0.5rem;">Velocità Tratta</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${splitRows.map(row => `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:0.5rem; font-weight:bold; color:white;">${row.distance} m</td>
                                    <td style="padding:0.5rem; color:#10b981;">${row.cumulativeTime} s</td>
                                    <td style="padding:0.5rem; color:#818cf8;">${row.segmentTime} s</td>
                                    <td style="padding:0.5rem; color:#f59e0b;">${row.speedKmh} km/h (${row.speedMs} m/s)</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
                    <h4 style="margin:0 0 1rem 0; color:white; font-size:1.05rem;">Profilo di Accelerazione e Velocità di Sprint</h4>
                    <div style="height: 300px; width: 100%; position: relative;">
                        <canvas id="sprint-velocity-chart"></canvas>
                    </div>
                </div>
            `;

            if (splitRows.length > 0) {
                const ctx = document.getElementById('sprint-velocity-chart')?.getContext('2d');
                if (ctx) {
                    const newChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: splitRows.map(r => `${r.distance}m`),
                            datasets: [{
                                label: 'Velocità (km/h)',
                                data: splitRows.map(r => parseFloat(r.speedKmh)),
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                borderWidth: 3,
                                pointRadius: 6,
                                fill: true,
                                tension: 0.3
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { labels: { color: '#cbd5e1' } } },
                            scales: {
                                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                y: {
                                    title: { display: true, text: 'Velocità (km/h)', color: '#94a3b8' },
                                    ticks: { color: '#94a3b8' },
                                    grid: { color: 'rgba(255,255,255,0.05)' },
                                    min: 0
                                }
                            }
                        }
                    });
                    if (!this.customCharts) this.customCharts = [];
                    this.customCharts.push(newChart);
                }
            }
        }

        renderKinematicsDashboard(data, athlete, exercise) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            const kneeAngles = data.map(r => r.kneeAngle).filter(v => typeof v === 'number' && !isNaN(v));
            const hipAngles = data.map(r => r.hipAngle).filter(v => typeof v === 'number' && !isNaN(v));
            const ankleAngles = data.map(r => r.ankleAngle).filter(v => typeof v === 'number' && !isNaN(v));
            const genericAngles = data.map(r => r.jointAngle).filter(v => typeof v === 'number' && !isNaN(v));

            const primaryAngles = kneeAngles.length > 0 ? kneeAngles : (genericAngles.length > 0 ? genericAngles : (hipAngles.length > 0 ? hipAngles : []));
            const minAngle = primaryAngles.length > 0 ? Math.min(...primaryAngles) : 0;
            const maxAngle = primaryAngles.length > 0 ? Math.max(...primaryAngles) : 0;
            const rom = (maxAngle - minAngle).toFixed(1);

            const angularVels = data.map(r => r.angularVelocity).filter(v => typeof v === 'number' && !isNaN(v));
            const peakAngVel = angularVels.length > 0 ? Math.max(...angularVels.map(Math.abs)) : 0;

            dashboard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:1rem;">
                    <div>
                        <h3 style="margin:0; font-size:1.4rem; color:white;">📐 Videoanalisi Cinematica 2D</h3>
                        <p style="margin:0.25rem 0 0 0; color:var(--text-muted); font-size:0.85rem;">Atleta: <strong style="color:white;">${athlete || 'Atleta'}</strong> | Esercizio: <strong style="color:var(--accent);">${exercise || 'Cinematica Articolare'}</strong></p>
                    </div>
                    <span style="background: rgba(147, 51, 234, 0.15); color: #c084fc; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; font-weight:600; border: 1px solid rgba(147,51,234,0.3);">
                        Kinovea / Dartfish / Tracker
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Range di Movimento (ROM)</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #10b981; margin-top: 0.25rem;">${rom > 0 ? rom + '°' : 'N/A'}</div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Escursione angolare</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Flessione Massima</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #818cf8; margin-top: 0.25rem;">${minAngle > 0 ? minAngle.toFixed(1) + '°' : 'N/A'}</div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Inversione movimento</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Estensione Massima</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #f59e0b; margin-top: 0.25rem;">${maxAngle > 0 ? maxAngle.toFixed(1) + '°' : 'N/A'}</div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Apertura articolare</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Velocità Angolare Picco</div>
                        <div style="font-size: 2rem; font-weight: 800; color: #ec4899; margin-top: 0.25rem;">${peakAngVel > 0 ? peakAngVel.toFixed(0) : 'N/A'} <small style="font-size:0.9rem; color:var(--text-muted);">°/s</small></div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Velocità di estensione</small>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
                    <h4 style="margin:0 0 1rem 0; color:white; font-size:1.05rem;">Tracciato Angoli Articolari nel Tempo / Fotogrammi</h4>
                    <div style="height: 320px; width: 100%; position: relative;">
                        <canvas id="kinematics-chart"></canvas>
                    </div>
                </div>
            `;

            if (primaryAngles.length > 0) {
                const labels = data.map((r, i) => r.frame ? `F${r.frame}` : (r.time ? `${r.time}s` : `#${i + 1}`));
                const datasets = [];

                if (kneeAngles.length > 0) {
                    datasets.push({
                        label: 'Ginocchio (°)',
                        data: kneeAngles,
                        borderColor: '#c084fc',
                        backgroundColor: 'rgba(192, 132, 252, 0.1)',
                        borderWidth: 2.5,
                        pointRadius: kneeAngles.length > 60 ? 0 : 3,
                        fill: false
                    });
                }
                if (hipAngles.length > 0) {
                    datasets.push({
                        label: 'Anca (°)',
                        data: hipAngles,
                        borderColor: '#38bdf8',
                        borderWidth: 2,
                        pointRadius: hipAngles.length > 60 ? 0 : 3,
                        fill: false
                    });
                }
                if (ankleAngles.length > 0) {
                    datasets.push({
                        label: 'Caviglia (°)',
                        data: ankleAngles,
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                        pointRadius: ankleAngles.length > 60 ? 0 : 3,
                        fill: false
                    });
                }
                if (datasets.length === 0 && genericAngles.length > 0) {
                    datasets.push({
                        label: 'Angolo Articolare (°)',
                        data: genericAngles,
                        borderColor: '#c084fc',
                        borderWidth: 2.5,
                        fill: false
                    });
                }

                const ctx = document.getElementById('kinematics-chart')?.getContext('2d');
                if (ctx) {
                    const newChart = new Chart(ctx, {
                        type: 'line',
                        data: { labels, datasets },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { labels: { color: '#cbd5e1' } } },
                            scales: {
                                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                y: {
                                    title: { display: true, text: 'Gradi (°)', color: '#94a3b8' },
                                    ticks: { color: '#94a3b8' },
                                    grid: { color: 'rgba(255,255,255,0.05)' }
                                }
                            }
                        }
                    });
                    if (!this.customCharts) this.customCharts = [];
                    this.customCharts.push(newChart);
                }
            }
        }

        renderMedicineBallDashboard(data, athlete, exercise) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            const physics = (typeof window !== 'undefined' && window.MedicineBallPhysics)
                ? window.MedicineBallPhysics
                : ((typeof global !== 'undefined' && global.MedicineBallPhysics) ? global.MedicineBallPhysics : null);

            const validThrows = [];

            if (Array.isArray(data)) {
                data.forEach((row, idx) => {
                    const mass = Number(row.mass);
                    const dist = Number(row.distance);
                    if (!isNaN(mass) && mass > 0 && !isNaN(dist) && dist > 0) {
                        const calcInput = {
                            mass: mass,
                            distance: dist,
                            releaseAngle: (row.releaseAngle !== undefined && row.releaseAngle !== null && row.releaseAngle !== '') ? Number(row.releaseAngle) : undefined,
                            releaseHeight: (row.releaseHeight !== undefined && row.releaseHeight !== null && row.releaseHeight !== '') ? Number(row.releaseHeight) : undefined,
                            pushDuration: (row.pushDuration !== undefined && row.pushDuration !== null && row.pushDuration !== '')
                                ? Number(row.pushDuration)
                                : ((row.pushTime !== undefined && row.pushTime !== null && row.pushTime !== '') ? Number(row.pushTime) : undefined),
                            flightTime: (row.flightTime !== undefined && row.flightTime !== null && row.flightTime !== '') ? Number(row.flightTime) : undefined
                        };

                        const res = (physics && typeof physics.calculate === 'function')
                            ? physics.calculate(calcInput)
                            : {
                                valid: true,
                                isExtreme: false,
                                exitVelocity: Number(Math.sqrt((9.81 * dist) / Math.sin(2 * 45 * Math.PI / 180)).toFixed(2)),
                                exitVelocityKmh: Number((Math.sqrt((9.81 * dist) / Math.sin(2 * 45 * Math.PI / 180)) * 3.6).toFixed(2)),
                                meanPower: Number((0.5 * mass * (9.81 * dist) / 0.18).toFixed(1)),
                                peakPower: Number((mass * (9.81 * dist) / 0.18).toFixed(1)),
                                mechanicalWork: Number((0.5 * mass * (9.81 * dist)).toFixed(1)),
                                harmanPower: Number((61.9 * dist + 36.0 * mass).toFixed(1)),
                                sayersPower: Number((52.2 * dist + 40.5 * mass).toFixed(1)),
                                trajectory: []
                            };

                        validThrows.push({
                            index: idx + 1,
                            mass: mass,
                            distance: dist,
                            res: res
                        });
                    }
                });
            }

            if (validThrows.length === 0) {
                dashboard.innerHTML = `
                    <div style="padding: 2.5rem; border: 1px dashed var(--border); border-radius: 12px; text-align: center; color: var(--text-muted);">
                        Nessun dato valido per Lancio Palla Medica. Inserisci Massa (kg) e Distanza (m) maggiori di zero.
                    </div>
                `;
                return;
            }

            let bestThrow = validThrows[0];
            let maxDist = 0;
            let maxPower = 0;
            let sumDist = 0;
            let sumPower = 0;

            validThrows.forEach(t => {
                sumDist += t.distance;
                sumPower += t.res.meanPower;
                if (t.distance > maxDist) {
                    maxDist = t.distance;
                    bestThrow = t;
                }
                if (t.res.meanPower > maxPower) {
                    maxPower = t.res.meanPower;
                }
            });

            const avgDist = sumDist / validThrows.length;
            const avgPower = sumPower / validThrows.length;
            const v0 = bestThrow.res.exitVelocity;
            const v0Kmh = (v0 * 3.6).toFixed(1);
            const peakPower = bestThrow.res.peakPower;
            const harmanP = bestThrow.res.harmanPower;
            const sayersP = bestThrow.res.sayersPower;
            const work = bestThrow.res.mechanicalWork;

            dashboard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                        <h3 style="margin:0; font-size:1.4rem; color:white;">Analisi Lancio Palla Medica</h3>
                        <p style="margin:0.25rem 0 0 0; color:var(--text-muted); font-size:0.85rem;">Atleta: <strong style="color:white;">${athlete || 'Atleta'}</strong> | Prova: <strong style="color:var(--accent);">${exercise || 'Lancio Toracico'}</strong> | Prove: <strong style="color:white;">${validThrows.length}</strong></p>
                    </div>
                    <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; font-weight:600; border: 1px solid rgba(16,185,129,0.3);">
                        Palla Medica (Sayers / Harman)
                    </span>
                </div>

                <!-- KPI CARDS -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Distanza Massima</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #10b981; margin-top: 0.25rem;">${maxDist.toFixed(2)} <small style="font-size:0.9rem; color:var(--text-muted);">m</small></div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Media: ${avgDist.toFixed(2)} m (Massa: ${bestThrow.mass} kg)</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Velocità Uscita (v₀)</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #00f0ff; margin-top: 0.25rem;">${v0.toFixed(2)} <small style="font-size:0.9rem; color:var(--text-muted);">m/s</small></div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">≈ ${v0Kmh} km/h (Cinematica balistica)</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Potenza Media (Pmean)</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #6366f1; margin-top: 0.25rem;">${maxPower.toFixed(1)} <small style="font-size:0.9rem; color:var(--text-muted);">W</small></div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Picco: ${peakPower.toFixed(1)} W · Lavoro: ${work.toFixed(0)} J</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Formula Harman (1995)</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 0.25rem;">${harmanP.toFixed(0)} <small style="font-size:0.9rem; color:var(--text-muted);">W</small></div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">61.9·d + 36.0·m</small>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Formula Sayers (1999)</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #ec4899; margin-top: 0.25rem;">${sayersP.toFixed(0)} <small style="font-size:0.9rem; color:var(--text-muted);">W</small></div>
                        <small style="color:var(--text-muted); font-size:0.75rem;">52.2·d + 40.5·m</small>
                    </div>
                </div>

                <!-- CHARTS -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem;">
                        <h4 style="margin:0 0 1rem 0; color:white; font-size:1.05rem;">Traiettoria Parabolica del Miglior Lancio</h4>
                        <div style="height: 300px; width: 100%; position: relative;">
                            <canvas id="medicine-ball-chart"></canvas>
                        </div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem;">
                        <h4 style="margin:0 0 1rem 0; color:white; font-size:1.05rem;">Confronto Prove (Distanza & Potenza)</h4>
                        <div style="height: 300px; width: 100%; position: relative;">
                            <canvas id="medicine-ball-trials-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;

            // Trajectory Chart
            const trajPoints = (bestThrow.res.trajectory && bestThrow.res.trajectory.length > 0)
                ? bestThrow.res.trajectory
                : [
                    { x: 0, y: 1.0 },
                    { x: Number((bestThrow.distance * 0.5).toFixed(1)), y: 2.5 },
                    { x: bestThrow.distance, y: 0 }
                ];

            const trajCtx = document.getElementById('medicine-ball-chart')?.getContext('2d');
            if (trajCtx && typeof Chart !== 'undefined') {
                const chart1 = new Chart(trajCtx, {
                    type: 'line',
                    data: {
                        labels: trajPoints.map(p => p.x.toFixed(1) + ' m'),
                        datasets: [{
                            label: 'Altezza Traiettoria (m)',
                            data: trajPoints.map(p => p.y),
                            borderColor: '#00f0ff',
                            backgroundColor: 'rgba(0, 240, 255, 0.12)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.35,
                            pointRadius: 4,
                            pointBackgroundColor: '#00f0ff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { labels: { color: '#cbd5e1' } } },
                        scales: {
                            x: { title: { display: true, text: 'Gittata Orizzontale (m)', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                            y: { title: { display: true, text: 'Altezza (m)', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, min: 0, grid: { color: 'rgba(255,255,255,0.05)' } }
                        }
                    }
                });
                if (!this.customCharts) this.customCharts = [];
                this.customCharts.push(chart1);
            }

            // Trials Comparison Chart
            const trialsCtx = document.getElementById('medicine-ball-trials-chart')?.getContext('2d');
            if (trialsCtx && typeof Chart !== 'undefined') {
                const chart2 = new Chart(trialsCtx, {
                    type: 'bar',
                    data: {
                        labels: validThrows.map(t => `Lancio ${t.index} (${t.mass}kg)`),
                        datasets: [
                            {
                                label: 'Distanza (m)',
                                data: validThrows.map(t => t.distance),
                                backgroundColor: 'rgba(16, 185, 129, 0.65)',
                                borderColor: '#10b981',
                                borderWidth: 1,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Potenza Media (W)',
                                data: validThrows.map(t => t.res.meanPower),
                                backgroundColor: 'rgba(99, 102, 241, 0.65)',
                                borderColor: '#6366f1',
                                borderWidth: 1,
                                yAxisID: 'y1'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { labels: { color: '#cbd5e1' } } },
                        scales: {
                            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                            y: { type: 'linear', position: 'left', title: { display: true, text: 'Distanza (m)', color: '#10b981' }, ticks: { color: '#10b981' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                            y1: { type: 'linear', position: 'right', title: { display: true, text: 'Potenza (W)', color: '#818cf8' }, ticks: { color: '#818cf8' }, grid: { drawOnChartArea: false } }
                        }
                    }
                });
                if (!this.customCharts) this.customCharts = [];
                this.customCharts.push(chart2);
            }
        }

        /**
         * Renderizza la vista di fallback o visualizzazione per dataset tabellari generici.
         * @param {Array<Object>} data - Righe estratte dal file Excel o CSV.
         * @param {string} athlete - Nome atleta selezionato.
         * @param {string} exercise - Nome esercizio o etichetta del foglio.
         * @param {Array<string>} [headers] - Intestazioni delle colonne del dataset.
         */
        renderGenericDataDashboard(data, athlete, exercise, headers) {
            this.cleanup();
            const dashboard = document.getElementById('dashboard-container');
            if (!dashboard) return;

            const safeData = Array.isArray(data) ? data : [];
            const cols = (headers && headers.length > 0)
                ? headers
                : Object.keys(safeData[0] || {}).filter(k => !k.startsWith('_') && k !== 'athlete' && k !== 'exercise');

            const getCellValue = (r, c, colIdx) => {
                if (!r) return '-';
                if (r._cells && r._cells[c] !== undefined && r._cells[c] !== null && String(r._cells[c]).trim() !== '') {
                    return String(r._cells[c]);
                }
                if (r[c] !== undefined && r[c] !== null && String(r[c]).trim() !== '') {
                    return String(r[c]);
                }
                if (r._rawRow && r._rawRow[colIdx] !== undefined && r._rawRow[colIdx] !== null && String(r._rawRow[colIdx]).trim() !== '') {
                    return String(r._rawRow[colIdx]);
                }
                const lower = String(c).toLowerCase();
                if ((lower.includes('eserciz') || lower.includes('exercise')) && r.exercise && r.exercise !== 'Sconosciuto') {
                    return r.exercise;
                }
                if (lower.includes('serie') || lower.includes('set')) {
                    if (r.setNumber !== null && r.setNumber !== undefined) return r.setNumber;
                }
                if (lower.includes('rip') || lower.includes('rep')) {
                    if (r.repsCount !== null && r.repsCount !== undefined) return r.repsCount;
                }
                if (lower.includes('caric') || lower.includes('load') || lower.includes('peso')) {
                    if (r.load !== null && r.load !== undefined) return r.load;
                }
                if (lower.includes('not') || lower.includes('comment')) {
                    if (r.notes) return r.notes;
                }
                return '-';
            };

            dashboard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:1rem;">
                    <div>
                        <h3 style="margin:0; font-size:1.4rem; color:white;">Ingestione Dati Tabellari</h3>
                        <p style="margin:0.25rem 0 0 0; color:var(--text-muted); font-size:0.85rem;">Atleta: <strong style="color:white;">${athlete || 'Atleta'}</strong> | Righe estratte: <strong style="color:var(--accent);">${safeData.length}</strong></p>
                    </div>
                    <span style="background: rgba(255, 255, 255, 0.1); color: white; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; font-weight:600;">
                        Dataset Tabellare
                    </span>
                </div>

                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin-top: 1.5rem; max-height: 420px; overflow-y: auto;">
                    <h4 style="margin:0 0 1rem 0; color:white; font-size:1rem;">Anteprima Dati Rilevati</h4>
                    <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:var(--text-muted); text-align:left;">
                                <th style="padding:0.5rem; position:sticky; top:0; background:#080c16;">#</th>
                                ${cols.slice(0, 8).map(c => `<th style="padding:0.5rem; position:sticky; top:0; background:#080c16;">${c}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${safeData.slice(0, 50).map((r, i) => `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:0.4rem; color:var(--text-muted);">${i + 1}</td>
                                    ${cols.slice(0, 8).map((c, cIdx) => `<td style="padding:0.4rem; color:white;">${getCellValue(r, c, cIdx)}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${safeData.length > 50 ? `<div style="text-align:center; padding:0.5rem; color:var(--text-muted); font-size:0.8rem;">Visualizzate 50 di ${safeData.length} righe totali</div>` : ''}
                </div>
            `;
        }
    };

    // Esposizione globale compatibile sia come DataAnalysis che come DataAnalysisUI
    if (typeof window !== 'undefined') {
        window.DataAnalysis = window.DataAnalysisUI;
    }
    if (typeof globalThis !== 'undefined') {
        globalThis.DataAnalysis = window.DataAnalysisUI;
    }
})();
