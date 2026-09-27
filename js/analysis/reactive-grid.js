/**
 * js/analysis/reactive-grid.js
 * Polymorphic, interactive table grid component for sports science & biomechanical data.
 * Features in-place cell editing, dynamic schema adaptation via TestRegistry,
 * toolbar actions (+ Aggiungi Prova, Rimuovi, Dati Demo, Svuota), and 250ms debounced live-binding.
 *
 * Environment: Browser (window.ReactiveGrid) & Node.js (module.exports)
 * Follows AGENTS.md rules: zero emoji spontaneously, clean modular design, defensive data validation.
 */

(function () {
    'use strict';

    class ReactiveGrid {
        /**
         * @param {Object} config
         * @param {string} [config.containerId='reactive-grid-container']
         * @param {string} [config.testType='VBT']
         * @param {Function} [config.onChange] - Callback fired on 250ms debounce with (records, summary)
         * @param {number} [config.debounceMs=250] - Debounce interval in milliseconds
         * @param {Function} [config.onExport] - Optional handler for export button click
         */
        constructor(config = {}) {
            this.containerId = config.containerId || 'reactive-grid-container';
            this.testType = config.testType || 'VBT';
            this.debounceMs = (config.debounceMs !== undefined) ? config.debounceMs : 250;
            this.onChange = typeof config.onChange === 'function' ? config.onChange : (() => {});
            this.onExport = typeof config.onExport === 'function' ? config.onExport : null;

            this.records = [];
            this._debounceTimer = null;
            this._registry = (typeof window !== 'undefined' && window.TestRegistry) ? window.TestRegistry : null;

            this.columns = this._getColumns();
            this.render();
        }

        /**
         * Resolves column definitions from TestRegistry or fallback
         * @private
         */
        _getColumns() {
            const registry = this._registry || (typeof window !== 'undefined' ? window.TestRegistry : null);
            if (registry && typeof registry.getColumnsFor === 'function') {
                return registry.getColumnsFor(this.testType) || [];
            }
            return [];
        }

        /**
         * Changes the active test type and updates the column schema.
         * Clears active rows and triggers debounced change.
         * @param {string} newType
         */
        setTestType(newType) {
            if (!newType) return;
            this.testType = newType;
            this.columns = this._getColumns();
            this.records = [];
            this.render();
            this._triggerChange();
        }

        /**
         * Sets data rows directly (e.g. from file parser or presets).
         * @param {Array<Object>} records
         */
        setData(records) {
            this.records = Array.isArray(records) ? records.map(r => ({ ...r })) : [];
            this.render();
            this._triggerChange();
        }

        /**
         * Returns a copy of the current records.
         * @returns {Array<Object>}
         */
        getData() {
            return this.records.map(r => ({ ...r }));
        }

        /**
         * Appends a new blank or pre-filled row.
         * @param {Object} [initialData={}]
         */
        addRow(initialData = {}) {
            const newRow = {};
            this.columns.forEach(col => {
                if (initialData[col.key] !== undefined && initialData[col.key] !== null) {
                    newRow[col.key] = initialData[col.key];
                } else {
                    newRow[col.key] = (col.default !== undefined) ? col.default : null;
                }
            });
            this.records.push(newRow);
            this.render();
            this._triggerChange();
        }

        /**
         * Removes the row at the specified index.
         * @param {number} index
         */
        removeRow(index) {
            if (index >= 0 && index < this.records.length) {
                this.records.splice(index, 1);
                this.render();
                this._triggerChange();
            }
        }

        /**
         * Updates a specific cell value with sanitization.
         * @param {number} rowIndex
         * @param {string} columnKey
         * @param {*} value
         */
        updateCell(rowIndex, columnKey, value) {
            if (!this.records[rowIndex]) return;

            const col = this.columns.find(c => c.key === columnKey);
            if (col && col.type === 'number') {
                if (value === '' || value === null || value === undefined) {
                    this.records[rowIndex][columnKey] = null;
                } else {
                    const cleanStr = String(value).trim().replace(',', '.');
                    const num = parseFloat(cleanStr);
                    this.records[rowIndex][columnKey] = isNaN(num) ? value : num;
                }
            } else {
                this.records[rowIndex][columnKey] = value;
            }

            this._triggerChange();
        }

        /**
         * Populates canonical sample dataset for the active test type.
         */
        loadSampleData() {
            const registry = this._registry || (typeof window !== 'undefined' ? window.TestRegistry : null);
            if (registry && typeof registry.getSampleDataFor === 'function') {
                const samples = registry.getSampleDataFor(this.testType);
                if (Array.isArray(samples) && samples.length > 0) {
                    this.setData(samples);
                    return;
                }
            }
            this.setData([]);
        }

        /**
         * Clears all rows in the grid.
         */
        clear() {
            this.records = [];
            this.render();
            this._triggerChange();
        }

        /**
         * Cleans up timers and memory.
         */
        destroy() {
            if (this._debounceTimer) {
                clearTimeout(this._debounceTimer);
                this._debounceTimer = null;
            }
            this.records = [];
        }

        /**
         * Fires debounced live-binding recalculation.
         * @private
         */
        _triggerChange() {
            if (this._debounceTimer) {
                clearTimeout(this._debounceTimer);
            }
            this._debounceTimer = setTimeout(() => {
                const summary = this._calculateSummary();
                this.onChange(this.getData(), summary);
            }, this.debounceMs);
        }

        /**
         * Computes biometrical summary and readiness for charts/KPIs.
         * Strictly prevents NaN and undefined outputs.
         * @private
         * @returns {Object}
         */
        _calculateSummary() {
            const count = this.records.length;
            if (count === 0) {
                return {
                    pointsCount: 0,
                    status: 'EMPTY',
                    canCalculateRegression: false,
                    message: 'Nessuna prova inserita. Aggiungi righe manualmente o carica un file.',
                    metrics: {}
                };
            }

            // VBT summary calculation
            if (this.testType === 'VBT') {
                const validRows = this.records.filter(r =>
                    typeof r.load === 'number' && !isNaN(r.load) && r.load > 0 &&
                    typeof r.velocity === 'number' && !isNaN(r.velocity) && r.velocity > 0
                );

                if (validRows.length === 0) {
                    return {
                        pointsCount: 0,
                        status: 'EMPTY',
                        canCalculateRegression: false,
                        message: 'Inserisci carichi e velocita validi.',
                        metrics: {}
                    };
                }

                if (validRows.length === 1) {
                    return {
                        pointsCount: 1,
                        status: 'SINGLE_POINT',
                        canCalculateRegression: false,
                        message: 'Inserisci almeno 2 prove per tracciare la regressione.',
                        metrics: {
                            meanLoad: validRows[0].load,
                            meanVelocity: validRows[0].velocity,
                            peakPower: (typeof validRows[0].power === 'number') ? validRows[0].power : null
                        }
                    };
                }

                const loads = validRows.map(r => r.load);
                const vels = validRows.map(r => r.velocity);
                const n = validRows.length;
                const meanX = loads.reduce((a, b) => a + b, 0) / n;
                const meanY = vels.reduce((a, b) => a + b, 0) / n;

                let sxx = 0, sxy = 0, syy = 0;
                for (let i = 0; i < n; i++) {
                    sxx += Math.pow(loads[i] - meanX, 2);
                    sxy += (loads[i] - meanX) * (vels[i] - meanY);
                    syy += Math.pow(vels[i] - meanY, 2);
                }

                if (sxx === 0) {
                    return {
                        pointsCount: n,
                        status: 'IDENTICAL_LOADS',
                        canCalculateRegression: false,
                        slope: null,
                        r2: 0,
                        message: 'I carichi inseriti sono identici; inserisci carichi incrementali differenti.',
                        metrics: { meanLoad: meanX, meanVelocity: meanY }
                    };
                }

                const slope = sxy / sxx;
                const intercept = meanY - slope * meanX;
                const r2 = (syy > 0) ? Math.pow(sxy, 2) / (sxx * syy) : 0;
                const mvt = 0.30;
                const est1RM = (slope !== 0) ? (mvt - intercept) / slope : null;

                return {
                    pointsCount: n,
                    status: 'OK',
                    canCalculateRegression: true,
                    slope: Number(slope.toFixed(5)),
                    intercept: Number(intercept.toFixed(3)),
                    r2: Number(r2.toFixed(3)),
                    est1RM: (est1RM !== null && isFinite(est1RM) && est1RM > 0) ? Math.round(est1RM) : null,
                    metrics: {
                        meanLoad: Number(meanX.toFixed(1)),
                        meanVelocity: Number(meanY.toFixed(3))
                    }
                };
            }

            // MEDICINE_BALL summary calculation
            if (this.testType === 'MEDICINE_BALL') {
                const physics = (typeof window !== 'undefined' && window.MedicineBallPhysics) ? window.MedicineBallPhysics : null;
                const validThrows = [];
                let maxDist = 0;
                let maxP = 0;

                this.records.forEach(r => {
                    const dist = Number(r.distance);
                    if (!isNaN(dist) && dist > maxDist) maxDist = dist;

                    if (physics && typeof physics.calculate === 'function') {
                        const res = physics.calculate(r);
                        if (res && res.valid) {
                            validThrows.push(res);
                            if (res.meanPower > maxP) maxP = res.meanPower;
                        }
                    }
                });

                return {
                    pointsCount: this.records.length,
                    status: 'OK',
                    metrics: {
                        maxDistance: Number(maxDist.toFixed(2)),
                        maxPower: Number(maxP.toFixed(1)),
                        validThrows: validThrows.length
                    }
                };
            }

            // JUMP_TEST summary calculation
            if (this.testType === 'JUMP_TEST') {
                let maxH = 0;
                let maxRsi = 0;
                this.records.forEach(r => {
                    const h = Number(r.jumpHeight);
                    if (!isNaN(h) && h > maxH) maxH = h;
                    const ct = Number(r.contactTime);
                    if (!isNaN(h) && !isNaN(ct) && ct > 0) {
                        const rsiVal = (h / 100) / (ct / 1000);
                        if (rsiVal > maxRsi) maxRsi = rsiVal;
                    }
                });
                return {
                    pointsCount: this.records.length,
                    status: 'OK',
                    metrics: {
                        maxHeight: Number(maxH.toFixed(1)),
                        maxRsi: maxRsi > 0 ? Number(maxRsi.toFixed(2)) : null
                    }
                };
            }

            return {
                pointsCount: this.records.length,
                status: 'OK',
                metrics: {}
            };
        }

        /**
         * Renders the interactive table and toolbar into the container element.
         */
        render() {
            if (typeof document === 'undefined') return;
            const container = document.getElementById(this.containerId);
            if (!container) return;

            const cols = this.columns;
            const count = this.records.length;

            let html = `
                <div class="reactive-grid-wrapper" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; margin-top: 1rem;">
                    <!-- Toolbar -->
                    <div class="reactive-grid-toolbar" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-weight: 600; font-size: 0.95rem; color: var(--accent);">Griglia Prove (${count})</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            <button type="button" class="btn-grid-add-row" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.82rem; font-weight: 600;">+ Aggiungi Prova</button>
                            <button type="button" class="btn-grid-load-samples" style="background: rgba(99,102,241,0.15); border: 1px solid #6366f1; color: #818cf8; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.82rem;">Dati Demo</button>
                            <button type="button" class="btn-grid-clear" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.4); color: #f87171; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.82rem;">Svuota</button>
                            <button type="button" class="btn-grid-export-excel" style="background: rgba(16,185,129,0.25); border: 1px solid #10b981; color: white; padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.82rem; font-weight: 600;">Esporta Excel (.xlsx)</button>
                        </div>
                    </div>

                    <!-- Table Container -->
                    <div class="reactive-grid-table-scroll" style="overflow-x: auto; max-height: 420px;">
                        <table class="reactive-grid-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: var(--text-muted);">
                                    <th style="padding: 0.5rem 0.75rem; text-align: center; width: 45px;">#</th>
            `;

            cols.forEach(col => {
                const unitStr = col.unit ? ` (${col.unit})` : '';
                html += `<th style="padding: 0.5rem 0.75rem; text-align: left; white-space: nowrap;">${col.label}${unitStr}</th>`;
            });

            html += `
                                    <th style="padding: 0.5rem 0.75rem; text-align: center; width: 50px;">Azione</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            if (count === 0) {
                html += `
                    <tr>
                        <td colspan="${cols.length + 2}" style="text-align: center; padding: 2rem; color: var(--text-muted); font-style: italic;">
                            Nessuna prova presente. Clicca su "+ Aggiungi Prova" o "Dati Demo", oppure rilascia un file nella dropzone sopra.
                        </td>
                    </tr>
                `;
            } else {
                this.records.forEach((row, rIdx) => {
                    html += `<tr class="grid-row" data-row-index="${rIdx}" style="border-bottom: 1px solid rgba(255,255,255,0.05);">`;
                    html += `<td style="padding: 0.4rem 0.5rem; text-align: center; color: var(--text-muted);">${rIdx + 1}</td>`;

                    cols.forEach(col => {
                        const val = (row[col.key] !== undefined && row[col.key] !== null) ? row[col.key] : '';
                        const inputType = (col.type === 'number') ? 'number' : 'text';
                        const stepAttr = col.step ? `step="${col.step}"` : '';
                        const minAttr = (col.min !== undefined) ? `min="${col.min}"` : '';
                        const maxAttr = (col.max !== undefined) ? `max="${col.max}"` : '';
                        const placeAttr = col.placeholder ? `placeholder="${col.placeholder}"` : '';

                        html += `
                            <td style="padding: 0.3rem 0.4rem;">
                                <input type="${inputType}" class="grid-cell-input custom-input"
                                    data-row="${rIdx}" data-col="${col.key}"
                                    value="${val}" ${stepAttr} ${minAttr} ${maxAttr} ${placeAttr}
                                    style="width: 100%; min-width: 80px; padding: 0.35rem 0.5rem; background: rgba(0,0,0,0.3); color: white; border: 1px solid var(--border); border-radius: 4px; font-size: 0.85rem;">
                            </td>
                        `;
                    });

                    html += `
                        <td style="padding: 0.3rem 0.5rem; text-align: center;">
                            <button type="button" class="btn-grid-remove-row" data-row="${rIdx}" title="Elimina Prova" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 1.1rem; padding: 0.2rem 0.4rem;">&times;</button>
                        </td>
                    </tr>
                    `;
                });
            }

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = html;
            this._bindDomEvents(container);
        }

        /**
         * Binds DOM event listeners for in-place editing and buttons.
         * @private
         * @param {HTMLElement} container
         */
        _bindDomEvents(container) {
            // Cell editing inputs
            const inputs = container.querySelectorAll('.grid-cell-input');
            inputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    const row = parseInt(e.target.dataset.row, 10);
                    const col = e.target.dataset.col;
                    this.updateCell(row, col, e.target.value);
                });
            });

            // Add Row button
            const btnAdd = container.querySelector('.btn-grid-add-row');
            if (btnAdd) {
                btnAdd.addEventListener('click', () => this.addRow());
            }

            // Load Samples button
            const btnSamples = container.querySelector('.btn-grid-load-samples');
            if (btnSamples) {
                btnSamples.addEventListener('click', () => this.loadSampleData());
            }

            // Clear button
            const btnClear = container.querySelector('.btn-grid-clear');
            if (btnClear) {
                btnClear.addEventListener('click', () => this.clear());
            }

            // Remove Row buttons
            const removeBtns = container.querySelectorAll('.btn-grid-remove-row');
            removeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const row = parseInt(e.target.dataset.row, 10);
                    this.removeRow(row);
                });
            });

            // Export Excel button
            const btnExport = container.querySelector('.btn-grid-export-excel');
            if (btnExport) {
                btnExport.addEventListener('click', () => {
                    if (typeof this.onExport === 'function') {
                        this.onExport(this.getData(), this.testType);
                    } else if (typeof window !== 'undefined' && window.AnalysisExporter) {
                        window.AnalysisExporter.exportToExcel({
                            testType: this.testType,
                            athleteName: 'Atleta',
                            records: this.getData()
                        }).catch(err => console.error('[ReactiveGrid] Export failed:', err));
                    }
                });
            }
        }
    }

    // Environment exposure
    if (typeof window !== 'undefined') {
        window.ReactiveGrid = ReactiveGrid;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ReactiveGrid;
    }
})();
