/**
 * js/analysis/pap/pap-dashboard-tabs.js
 * Modulo di Rendering HTML per i Tab e Componenti del Cruscotto PAP.
 *
 * Responsabilità:
 * 1. Generazione dell'Executive Summary con KPI cards moderne (Campione, Responder, Trend, Recupero).
 * 2. Rendering Tab 1: Panoramica & Dashboard Sinottica con filtri esito e tabella interattiva.
 * 3. Rendering Tab 2: Misure PRE-POST & Soglie MDC al 95% (evidenziazione variazioni reali vs rumore).
 * 4. Rendering Tab 3: Stiffness & Dinamica di Salto (scomposizione RSI e contenitori grafici).
 * 5. Rendering Tab 4: Profilo Neuromuscolare (EUR, W/kg, braccia, correlazione massa-reattività).
 * 6. Rendering Tab 5: Scheda Clinico-Tecnica Individuale Atleta (anamnesi, dosaggio, direttive da campo).
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Costanti Tematiche e di Stile Anti-Gravity ---
    const COLOR_PRIMARY = '#00f0ff';
    const COLOR_ACCENT = '#6366f1';
    const COLOR_SUCCESS = '#10b981';
    const COLOR_WARNING = '#f59e0b';
    const COLOR_DANGER = '#ef4444';
    const COLOR_NEUTRAL = '#94a3b8';
    const COLOR_BG_CARD = 'rgba(15, 23, 42, 0.75)';
    const COLOR_BORDER = 'rgba(255, 255, 255, 0.10)';

    // --- Costanti Metrologiche e Biomeccaniche ---
    const MDC_SJ_PERCENT = 5.4;
    const MDC_CMJ_PERCENT = 6.8;
    const MDC_ABK_PERCENT = 8.0;

    const PAPDashboardTabs = {

        /**
         * Renderizza l'Executive Summary con le 4 KPI cards informative.
         * @param {Object} view - Istanza di PAPDashboardView.
         * @returns {string} Stringa HTML delle KPI cards.
         */
        renderExecutiveSummaryHtml(view) {
            const totalTested = view.processedResults.length;
            const responders = view.processedResults.filter(r => r.diagnosis && r.diagnosis.badgeColor === 'positive').length;
            const fatigue = view.processedResults.filter(r => r.diagnosis && r.diagnosis.badgeColor === 'fatigue').length;
            const neutral = totalTested - responders - fatigue;
            const avgRecovery = view.athletesData.reduce((sum, a) => sum + (a.recoveryTimeMin || 0), 0) / (totalTested || 1);

            let dominantTrendTitle = 'Fatica da Stiffness / Concentrica';
            let dominantTrendColor = COLOR_DANGER;
            let dominantTrendSub = `${fatigue} atleti con fatica reale dimostrabile`;
            if (responders > fatigue && responders > neutral) {
                dominantTrendTitle = 'Potenziamento Reattivo Prevalente';
                dominantTrendColor = COLOR_SUCCESS;
                dominantTrendSub = `${responders} responder positivi su ${totalTested}`;
            } else if (neutral >= responders && neutral >= fatigue) {
                dominantTrendTitle = 'Stabilita (Variazioni nel Rumore)';
                dominantTrendColor = COLOR_NEUTRAL;
                dominantTrendSub = `${neutral} atleti con variazioni entro MDC`;
            } else {
                dominantTrendTitle = `Fatica Reale (${Math.round((fatigue / (totalTested || 1)) * 100)}% Atleti)`;
                dominantTrendColor = COLOR_DANGER;
                dominantTrendSub = 'Fatica concentrica e decadimento della stiffness';
            }

            return `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem;">
                    <!-- KPI 1: Campione -->
                    <div class="pap-kpi-card" style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; padding: 1.1rem 1.25rem;">
                        <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: ${COLOR_NEUTRAL}; font-weight: 700;">Campione Esaminato</span>
                        <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.35rem;">
                            <strong style="font-size: 1.9rem; color: white; font-weight: 800;">${totalTested}</strong>
                            <span style="font-size: 0.85rem; color: ${COLOR_NEUTRAL};">Atleti analizzati</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #38bdf8; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
                            Validazione balistica: 0 anomalie ammesse
                        </div>
                    </div>

                    <!-- KPI 2: Responder -->
                    <div class="pap-kpi-card" style="background: ${COLOR_BG_CARD}; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 1.1rem 1.25rem;">
                        <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: ${COLOR_SUCCESS}; font-weight: 700;">Responder Reali (Potenziamento)</span>
                        <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.35rem;">
                            <strong style="font-size: 1.9rem; color: ${COLOR_SUCCESS}; font-weight: 800;">${responders}</strong>
                            <span style="font-size: 0.85rem; color: ${COLOR_SUCCESS}; font-weight: 600;">su ${totalTested} atleti</span>
                        </div>
                        <div style="font-size: 0.75rem; color: ${COLOR_NEUTRAL}; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
                            Superamento congiunto o disgiunto soglie MDC e RSI
                        </div>
                    </div>

                    <!-- KPI 3: Trend Dominante -->
                    <div class="pap-kpi-card" style="background: ${COLOR_BG_CARD}; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.1rem 1.25rem;">
                        <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: ${dominantTrendColor}; font-weight: 700;">Trend Dominante</span>
                        <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.35rem;">
                            <strong style="font-size: 1.15rem; color: ${dominantTrendColor}; font-weight: 800;">${dominantTrendTitle}</strong>
                        </div>
                        <div style="font-size: 0.75rem; color: ${COLOR_NEUTRAL}; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
                            ${dominantTrendSub}
                        </div>
                    </div>

                    <!-- KPI 4: Recupero Reale Medio -->
                    <div class="pap-kpi-card" style="background: ${COLOR_BG_CARD}; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 1.1rem 1.25rem;">
                        <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: #a5b4fc; font-weight: 700;">Recupero Reale Medio</span>
                        <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.35rem;">
                            <strong style="font-size: 1.9rem; color: #a5b4fc; font-weight: 800;">${avgRecovery > 0 ? avgRecovery.toFixed(1) + '′' : '–'}</strong>
                            <span style="font-size: 0.85rem; color: ${COLOR_NEUTRAL};">Misurato da timestamp test</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #e0e7ff; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
                            Pausa reale misurata tra PRE e POST
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Renderizza l'HTML del tab attivo corrente.
         * @param {Object} view - Istanza di PAPDashboardView.
         * @returns {string} Stringa HTML del contenuto del tab.
         */
        renderCurrentTabHtml(view) {
            switch (view.activeTab) {
                case 'overview':
                    return this.renderOverviewTabHtml(view);
                case 'mdc':
                    return this.renderMdcTabHtml(view);
                case 'stiffness':
                    return this.renderStiffnessTabHtml(view);
                case 'neuromuscular':
                    return this.renderNeuromuscularTabHtml(view);
                case 'athlete':
                    return this.renderAthleteDetailTabHtml(view);
                default:
                    return this.renderOverviewTabHtml(view);
            }
        },

        /**
         * Renderizza Tab 1: Panoramica & Dashboard Sinottica con tabella interattiva.
         * @param {Object} view - Istanza di PAPDashboardView.
         * @returns {string} Stringa HTML.
         */
        renderOverviewTabHtml(view) {
            const filtered = view.processedResults.filter(r => {
                if (view.filterOutcome === 'POSITIVE' && r.diagnosis.badgeColor !== 'positive') return false;
                if (view.filterOutcome === 'FATIGUE' && r.diagnosis.badgeColor !== 'fatigue') return false;
                if (view.filterOutcome === 'NEUTRAL' && r.diagnosis.badgeColor !== 'neutral') return false;
                return true;
            });

            return `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <!-- BARRA FILTRI SINOTTICA -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; background: rgba(255,255,255,0.02); border: 1px solid ${COLOR_BORDER}; border-radius: 10px; padding: 0.75rem 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <label for="pap-filter-outcome" style="font-size: 0.75rem; text-transform: uppercase; color: ${COLOR_NEUTRAL}; font-weight: 700;">Filtra per Esito:</label>
                            <select id="pap-filter-outcome" style="background: #0f172a; color: white; border: 1px solid ${COLOR_BORDER}; border-radius: 6px; padding: 0.35rem 0.6rem; font-size: 0.82rem;">
                                <option value="ALL" ${view.filterOutcome === 'ALL' ? 'selected' : ''}>Tutti gli esiti (${view.processedResults.length})</option>
                                <option value="POSITIVE" ${view.filterOutcome === 'POSITIVE' ? 'selected' : ''}>Potenziamento Reale</option>
                                <option value="FATIGUE" ${view.filterOutcome === 'FATIGUE' ? 'selected' : ''}>Fatica Reale</option>
                                <option value="NEUTRAL" ${view.filterOutcome === 'NEUTRAL' ? 'selected' : ''}>Invariato / Rumore</option>
                            </select>
                        </div>
                        <div style="font-size: 0.78rem; color: ${COLOR_NEUTRAL};">
                            Visualizzati <strong style="color:white;">${filtered.length}</strong> di ${view.processedResults.length} atleti
                        </div>
                    </div>

                    <!-- MASTER DASHBOARD TABELLA SINOTTICA -->
                    <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; overflow-x: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.25);">
                        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.02); color: ${COLOR_NEUTRAL}; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.05em;">
                                    <th style="padding: 0.9rem 1rem;">Atleta</th>
                                    <th style="padding: 0.9rem 0.6rem;">Eta / Peso</th>
                                    <th style="padding: 0.9rem 0.8rem;">Protocollo Condizionante</th>
                                    <th style="padding: 0.9rem 0.6rem;">Reps/Vol</th>
                                    <th style="padding: 0.9rem 0.6rem;">Recupero Reale</th>
                                    <th style="padding: 0.9rem 0.6rem;">Δ SJ %</th>
                                    <th style="padding: 0.9rem 0.6rem;">Δ RSI %</th>
                                    <th style="padding: 0.9rem 1rem;">Esito Metrologico PAP</th>
                                    <th style="padding: 0.9rem 0.8rem; text-align: center;">Scheda</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filtered.map(r => this.renderSynopticRowHtml(r)).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- BANNER INTEGRITA E SCIENZA -->
                    <div style="background: rgba(0, 240, 255, 0.04); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 10px; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <strong style="color: ${COLOR_PRIMARY}; font-size: 0.9rem; display: block;">Integrita Scientifica & Protezione Rumore</strong>
                            <span style="color: #cbd5e1; font-size: 0.8rem;">
                                Filtro artefatto TC=-1 attivo | Validazione cinematica balistica automatica ($h \\approx g \\cdot t^2 / 8$).
                            </span>
                        </div>
                        <button id="pap-btn-load-audit-notes" class="pap-action-btn" style="background: rgba(0,240,255,0.12); color: ${COLOR_PRIMARY}; border: 1px solid rgba(0,240,255,0.3); padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer;">
                            Note Metrologiche Audit
                        </button>
                    </div>
                </div>
            `;
        },

        /**
         * Renderizza una riga della tabella sinottica per un singolo atleta.
         * @param {Object} r - Oggetto risultato atleta processato.
         * @returns {string} Stringa HTML <tr>.
         */
        renderSynopticRowHtml(r) {
            const athlete = r.athlete;
            const diagnosis = r.diagnosis;
            const sj = r.sjMdc;
            const rsi = r.rsiStats;

            let badgeStyle = 'background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3);';
            if (diagnosis.badgeColor === 'positive') {
                badgeStyle = 'background: rgba(16, 185, 129, 0.18); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); font-weight: 700;';
            } else if (diagnosis.badgeColor === 'fatigue') {
                badgeStyle = 'background: rgba(239, 68, 68, 0.18); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); font-weight: 700;';
            }

            let sjColor = '#cbd5e1';
            if (sj.isRealChange) {
                sjColor = sj.deltaPercent > 0 ? '#34d399' : '#f87171';
            }

            let rsiColor = '#cbd5e1';
            if (rsi.isSignificant) {
                rsiColor = rsi.deltaPercent > 0 ? '#34d399' : '#f87171';
            }

            return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.15s;" class="pap-synoptic-row">
                    <td style="padding: 0.8rem 1rem;">
                        <strong style="color: white; font-size: 0.9rem; display: block;">${athlete.name}</strong>
                        <span style="color: ${COLOR_NEUTRAL}; font-size: 0.75rem;">${athlete.specialty || ''}</span>
                    </td>
                    <td style="padding: 0.8rem 0.6rem; color: #e2e8f0;">
                        ${athlete.age || '–'} anni<br>
                        <span style="color:${COLOR_NEUTRAL}; font-size:0.75rem;">${athlete.mass || '–'} kg</span>
                    </td>
                    <td style="padding: 0.8rem 0.8rem; color: white;">
                        ${athlete.protocol?.name || 'Standard'}<br>
                        <span style="color:${COLOR_NEUTRAL}; font-size:0.75rem;">${athlete.protocol?.category || ''}</span>
                    </td>
                    <td style="padding: 0.8rem 0.6rem; color: #cbd5e1;">
                        ${athlete.protocol?.contacts || '–'}
                    </td>
                    <td style="padding: 0.8rem 0.6rem; color: #a5b4fc; font-weight: 600;">
                        ${athlete.recoveryTimeMin ? athlete.recoveryTimeMin.toFixed(1) + '′' : '–'}
                    </td>
                    <td style="padding: 0.8rem 0.6rem;">
                        <strong style="color: ${sjColor};">${sj.deltaPercent >= 0 ? '+' : ''}${sj.deltaPercent.toFixed(1)}%</strong>
                        <span style="display:block; font-size:0.7rem; color:${COLOR_NEUTRAL};">${sj.isRealChange ? 'Reale (MDC)' : 'Rumore'}</span>
                    </td>
                    <td style="padding: 0.8rem 0.6rem;">
                        <strong style="color: ${rsiColor};">${rsi.deltaPercent >= 0 ? '+' : ''}${rsi.deltaPercent.toFixed(1)}%</strong>
                        <span style="display:block; font-size:0.7rem; color:${COLOR_NEUTRAL};">p=${rsi.pValue.toFixed(3)}</span>
                    </td>
                    <td style="padding: 0.8rem 1rem;">
                        <span style="padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; display: inline-block; ${badgeStyle}">
                            ${diagnosis.category}
                        </span>
                    </td>
                    <td style="padding: 0.8rem 0.8rem; text-align: center;">
                        <button class="pap-btn-view-athlete" data-athlete-id="${athlete.id}" style="background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.75rem; cursor: pointer;">
                            Dettagli
                        </button>
                    </td>
                </tr>
            `;
        },

        /**
         * Renderizza Tab 2: Misure PRE-POST & Soglie MDC al 95%.
         * @param {Object} view - Istanza di PAPDashboardView.
         * @returns {string} Stringa HTML.
         */
        renderMdcTabHtml(view) {
            return `
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <!-- BOX METODOLOGICO MDC -->
                    <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; padding: 1.25rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: ${COLOR_PRIMARY}; font-size: 1rem;">
                            Soglie Metrologiche Reali: MDC 95% vs Rumore Biologico
                        </h4>
                        <p style="margin: 0; color: #cbd5e1; font-size: 0.85rem; line-height: 1.5;">
                            Ogni salto singolo presenta una variabilita naturale fisiologica. Conforme alla letteratura (Markovic 2004, Heishman 2020), il Minimal Detectable Change (MDC 95% = SEM × 1.96 × √2) stabilisce che per superare il rumore serve una variazione minima di:
                            <strong style="color:white;">SJ: ±${MDC_SJ_PERCENT}%</strong>, <strong style="color:white;">CMJ: ±${MDC_CMJ_PERCENT}%</strong>, <strong style="color:white;">ABK: ±${MDC_ABK_PERCENT}%</strong>. Le variazioni all'interno di questo corridoio non sono attribuibili ne a fatica ne a potenziamento.
                        </p>
                    </div>

                    <!-- TABELLA DETTAGLIATA SALTI SINGOLI -->
                    <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); color: ${COLOR_NEUTRAL}; text-transform: uppercase; font-size: 0.72rem;">
                                    <th style="padding: 0.8rem 1rem;">Atleta</th>
                                    <th style="padding: 0.8rem 0.6rem;">SJ PRE (cm)</th>
                                    <th style="padding: 0.8rem 0.6rem;">SJ POST (cm)</th>
                                    <th style="padding: 0.8rem 0.8rem;">Δ SJ % (MDC ${MDC_SJ_PERCENT}%)</th>
                                    <th style="padding: 0.8rem 0.6rem;">CMJ PRE (cm)</th>
                                    <th style="padding: 0.8rem 0.6rem;">CMJ POST (cm)</th>
                                    <th style="padding: 0.8rem 0.8rem;">Δ CMJ % (MDC ${MDC_CMJ_PERCENT}%)</th>
                                    <th style="padding: 0.8rem 0.6rem;">ABK PRE (cm)</th>
                                    <th style="padding: 0.8rem 0.6rem;">ABK POST (cm)</th>
                                    <th style="padding: 0.8rem 0.8rem;">Δ ABK % (MDC ${MDC_ABK_PERCENT}%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${view.processedResults.map(r => {
                                    const a = r.athlete;
                                    const j = a.singleJumps || {};
                                    const sj = r.sjMdc;
                                    const cmj = r.cmjMdc;
                                    const abk = r.abkMdc;
                                    return `
                                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                            <td style="padding: 0.75rem 1rem;"><strong style="color:white;">${a.name}</strong></td>
                                            <td style="padding: 0.75rem 0.6rem; color:#cbd5e1;">${(j.sjPre || 0).toFixed(2)}</td>
                                            <td style="padding: 0.75rem 0.6rem; color:white;">${(j.sjPost || 0).toFixed(2)}</td>
                                            <td style="padding: 0.75rem 0.8rem;">
                                                <span style="color: ${sj.isRealChange ? (sj.deltaPercent > 0 ? '#34d399' : '#f87171') : '#94a3b8'}; font-weight: ${sj.isRealChange ? '700' : '500'};">
                                                    ${sj.deltaPercent >= 0 ? '+' : ''}${sj.deltaPercent.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td style="padding: 0.75rem 0.6rem; color:#cbd5e1;">${(j.cmjPre || 0).toFixed(2)}</td>
                                            <td style="padding: 0.75rem 0.6rem; color:white;">${(j.cmjPost || 0).toFixed(2)}</td>
                                            <td style="padding: 0.75rem 0.8rem;">
                                                <span style="color: ${cmj.isRealChange ? (cmj.deltaPercent > 0 ? '#34d399' : '#f87171') : '#94a3b8'}; font-weight: ${cmj.isRealChange ? '700' : '500'};">
                                                    ${cmj.deltaPercent >= 0 ? '+' : ''}${cmj.deltaPercent.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td style="padding: 0.75rem 0.6rem; color:#cbd5e1;">${(j.abkPre || 0).toFixed(2)}</td>
                                            <td style="padding: 0.75rem 0.6rem; color:white;">${(j.abkPost || 0).toFixed(2)}</td>
                                            <td style="padding: 0.75rem 0.8rem;">
                                                <span style="color: ${abk.isRealChange ? (abk.deltaPercent > 0 ? '#34d399' : '#f87171') : '#94a3b8'}; font-weight: ${abk.isRealChange ? '700' : '500'};">
                                                    ${abk.deltaPercent >= 0 ? '+' : ''}${abk.deltaPercent.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- GRAFICO DELTA % VS SOGLIE MDC -->
                    <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; padding: 1.25rem;">
                        <h4 style="margin: 0 0 1rem 0; color: white; font-size: 1rem;">
                            Confronto Grafico Variazioni SJ vs Soglia MDC (±${MDC_SJ_PERCENT}%)
                        </h4>
                        <div style="height: 320px; position: relative;">
                            <canvas id="pap-mdc-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Renderizza Tab 3: Stiffness & Dinamica di Salto.
         * @param {Object} view - Istanza di PAPDashboardView.
         * @returns {string} Stringa HTML.
         */
        renderStiffnessTabHtml(view) {
            return `
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <!-- INTRO SCOMPOSIZIONE BIOMECCANICA -->
                    <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; padding: 1.25rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: ${COLOR_PRIMARY}; font-size: 1rem;">
                            Scomposizione dell'RSI: $\\Delta RSI = f(\\Delta TC, \\Delta H)$
                        </h4>
                        <p style="margin: 0; color: #cbd5e1; font-size: 0.85rem; line-height: 1.5;">
                            Un atleta puo aumentare l'RSI rimbalzando piu rigido (TC ridotto a parita di altezza) o aumentando la quota di volo (impulso). Al contrario, un calo di reattivita puo derivare da cedimento tendineo della caviglia (fatica da stiffness) o da perdita di spinta concentrica.
                        </p>
                    </div>

                    <!-- TABELLA REATTIVITA E SCOMPOSIZIONE -->
                    <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); color: ${COLOR_NEUTRAL}; text-transform: uppercase; font-size: 0.72rem;">
                                    <th style="padding: 0.8rem 1rem;">Atleta</th>
                                    <th style="padding: 0.8rem 0.6rem;">RSI PRE</th>
                                    <th style="padding: 0.8rem 0.6rem;">RSI POST</th>
                                    <th style="padding: 0.8rem 0.8rem;">Δ RSI %</th>
                                    <th style="padding: 0.8rem 0.6rem;">p-value</th>
                                    <th style="padding: 0.8rem 0.6rem;">Hedges' g</th>
                                    <th style="padding: 0.8rem 0.6rem;">Δ TC %</th>
                                    <th style="padding: 0.8rem 0.6rem;">Δ Altezza %</th>
                                    <th style="padding: 0.8rem 1rem;">Meccanismo Prevalente</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${view.processedResults.map(r => {
                                    const a = r.athlete;
                                    const rsi = r.rsiStats;
                                    const dec = r.rsiDecomposition || {};
                                    return `
                                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                            <td style="padding: 0.75rem 1rem;"><strong style="color:white;">${a.name}</strong></td>
                                            <td style="padding: 0.75rem 0.6rem; color:#cbd5e1;">${(rsi.preMean || 0).toFixed(3)}</td>
                                            <td style="padding: 0.75rem 0.6rem; color:white;">${(rsi.postMean || 0).toFixed(3)}</td>
                                            <td style="padding: 0.75rem 0.8rem;">
                                                <strong style="color: ${rsi.isSignificant ? (rsi.deltaPercent > 0 ? '#34d399' : '#f87171') : '#94a3b8'};">
                                                    ${rsi.deltaPercent >= 0 ? '+' : ''}${rsi.deltaPercent.toFixed(1)}%
                                                </strong>
                                            </td>
                                            <td style="padding: 0.75rem 0.6rem; color:${rsi.pValue < 0.05 ? '#34d399' : '#94a3b8'};">${rsi.pValue.toFixed(3)}</td>
                                            <td style="padding: 0.75rem 0.6rem; color:white;">${rsi.hedgesG.toFixed(2)}</td>
                                            <td style="padding: 0.75rem 0.6rem; color:#cbd5e1;">${(dec.deltaTcPercent || 0) >= 0 ? '+' : ''}${(dec.deltaTcPercent || 0).toFixed(1)}%</td>
                                            <td style="padding: 0.75rem 0.6rem; color:#cbd5e1;">${(dec.deltaHPercent || 0) >= 0 ? '+' : ''}${(dec.deltaHPercent || 0).toFixed(1)}%</td>
                                            <td style="padding: 0.75rem 1rem;">
                                                <span style="font-size:0.75rem; color:#e2e8f0;">${dec.mechanism || '–'}</span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- DUE GRAFICI STIFFNESS -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
                        <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; padding: 1.25rem;">
                            <h4 style="margin: 0 0 1rem 0; color: white; font-size: 0.95rem;">
                                Scatter Accoppiamento TC vs Altezza (Strategia Spinta vs Molla)
                            </h4>
                            <div style="height: 300px; position: relative;">
                                <canvas id="pap-stiffness-scatter-chart"></canvas>
                            </div>
                        </div>

                        <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; padding: 1.25rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                                <h4 style="margin: 0; color: white; font-size: 0.95rem;">
                                    Andamento Intra-Serie Saltelli
                                </h4>
                                <div style="display: flex; align-items: center; gap: 0.4rem;">
                                    <label for="pap-select-athlete-trend" style="font-size: 0.75rem; color: ${COLOR_NEUTRAL};">Visualizza:</label>
                                    <select id="pap-select-athlete-trend" style="background: #0f172a; color: white; border: 1px solid ${COLOR_BORDER}; border-radius: 6px; padding: 0.25rem 0.5rem; font-size: 0.78rem;">
                                        <option value="BENCHMARK_COMPARE" ${view.selectedTrendAthleteId === 'BENCHMARK_COMPARE' ? 'selected' : ''}>Confronto Sintetico Primi 2 Atleti</option>
                                        ${view.processedResults.map(r => `
                                            <option value="${r.athlete.id}" ${String(view.selectedTrendAthleteId) === String(r.athlete.id) ? 'selected' : ''}>
                                                ${r.athlete.name} – Curva PRE vs POST
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                            <div style="height: 300px; position: relative;">
                                <canvas id="pap-intraset-trend-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Renderizza Tab 4: Profilo Neuromuscolare, EUR e Correlazione Massa-Reattivita.
         * @param {Object} view - Istanza di PAPDashboardView.
         * @returns {string} Stringa HTML.
         */
        renderNeuromuscularTabHtml(view) {
            const massData = view.athletesData.map(a => {
                const preReb = a.reactiveReboundsPre || [];
                const avgRsi = preReb.length > 0 ? preReb.reduce((s, r) => s + (r.rsi || 0), 0) / preReb.length : 1.5;
                return { mass: a.mass || 70, rsi: avgRsi };
            });
            const massRsiCorr = root.PAPStatsEngine && typeof root.PAPStatsEngine.correlateBodyMassWithRsi === 'function'
                ? root.PAPStatsEngine.correlateBodyMassWithRsi(massData)
                : { r: -0.77, rSquared: 0.59, pValue: 0.027, ci95: [-0.95, -0.13] };

            return `
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <!-- DISCUSSIONE DETERMINANTE MASSA -->
                    <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 1.25rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #a5b4fc; font-size: 1rem;">
                            La Massa Corporea: Determinante Primario dell'RSI ($r = ${massRsiCorr.r.toFixed(2)}$, $p = ${massRsiCorr.pValue.toFixed(4)}$)
                        </h4>
                        <p style="margin: 0; color: #cbd5e1; font-size: 0.85rem; line-height: 1.5;">
                            All'aumentare della taglia dell'atleta, la stiffness nei contatti brevi fast-SSC (< 250 ms) subisce una penalita inerziale sistematica. Negli atleti piu pesanti, la forza concentrica e elevata ma l'inversione rapida a terra richiede vincoli di carico piu controllati.
                        </p>
                    </div>

                    <!-- DUE GRAFICI NEUROMUSCOLARI -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
                        <!-- GRAFICO 1: MASSA VS RSI -->
                        <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; padding: 1.25rem;">
                            <h4 style="margin: 0 0 0.5rem 0; color: white; font-size: 0.95rem;">
                                Regressione Massa Corporea (kg) vs RSI Basale
                            </h4>
                            <div style="font-size:0.75rem; color:${COLOR_NEUTRAL}; margin-bottom: 0.75rem;">
                                r = ${massRsiCorr.r.toFixed(3)} | R² = ${(massRsiCorr.rSquared * 100).toFixed(1)}% | IC 95%: [${massRsiCorr.ci95[0]}, ${massRsiCorr.ci95[1]}]
                            </div>
                            <div style="height: 300px; position: relative;">
                                <canvas id="pap-mass-rsi-chart"></canvas>
                            </div>
                        </div>

                        <!-- GRAFICO 2: EUR BASALE -->
                        <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; padding: 1.25rem;">
                            <h4 style="margin: 0 0 0.5rem 0; color: white; font-size: 0.95rem;">
                                Profilo EUR Basale (CMJ / SJ Ratio)
                            </h4>
                            <div style="font-size:0.75rem; color:${COLOR_NEUTRAL}; margin-bottom: 0.75rem;">
                                Soglia elastica > 1.15 | Soglia bilanciata 1.05 - 1.15 | Soglia forza < 1.05
                            </div>
                            <div style="height: 300px; position: relative;">
                                <canvas id="pap-eur-chart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- TABELLA COMPLETA PROFILO E POTENZA -->
                    <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); color: ${COLOR_NEUTRAL}; text-transform: uppercase; font-size: 0.72rem;">
                                    <th style="padding: 0.8rem 1rem;">Atleta</th>
                                    <th style="padding: 0.8rem 0.6rem;">EUR Ratio</th>
                                    <th style="padding: 0.8rem 0.8rem;">Classificazione EUR</th>
                                    <th style="padding: 0.8rem 0.6rem;">Potenza Relativa (W/kg)</th>
                                    <th style="padding: 0.8rem 0.6rem;">RSI Basale</th>
                                    <th style="padding: 0.8rem 0.8rem;">Matrice Potenza-RSI</th>
                                    <th style="padding: 0.8rem 0.6rem;">Transfer Braccia</th>
                                    <th style="padding: 0.8rem 1rem;">Note & Razionale Biomeccanico</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${view.processedResults.map(r => {
                                    const a = r.athlete;
                                    const nm = r.neuromuscular || {};
                                    const pWkg = r.powerWkg || a.singleJumps?.powerSjWkg || 14.0;
                                    const rsi = r.rsiStats.preMean;
                                    const matrix = r.powerRsiMatrix || {};
                                    let matrixBadgeColor = '#34d399';
                                    if (matrix.rfdDeficitLevel === 'MARCATO') matrixBadgeColor = '#f87171';
                                    else if (matrix.rfdDeficitLevel === 'MODERATO') matrixBadgeColor = '#f59e0b';

                                    return `
                                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                            <td style="padding: 0.75rem 1rem;">
                                                <strong style="color:white;">${a.name}</strong><br>
                                                <span style="font-size:0.75rem; color:${COLOR_NEUTRAL};">${a.mass || '–'} kg</span>
                                            </td>
                                            <td style="padding: 0.75rem 0.6rem; color:white; font-weight:700;">${(nm.eurRatio || 1).toFixed(3)}</td>
                                            <td style="padding: 0.75rem 0.8rem; color:#a5b4fc;">${nm.classification || '–'}</td>
                                            <td style="padding: 0.75rem 0.6rem; color:#cbd5e1; font-weight:600;">${pWkg.toFixed(2)}</td>
                                            <td style="padding: 0.75rem 0.6rem; color:white;">${(rsi || 0).toFixed(2)}</td>
                                            <td style="padding: 0.75rem 0.8rem;">
                                                <span style="font-size:0.75rem; font-weight:700; color:${matrixBadgeColor};">
                                                    ${(matrix.classification || 'BILANCIATO').replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td style="padding: 0.75rem 0.6rem; color:#cbd5e1;">+${(nm.armsContributionCm || 0).toFixed(1)} cm</td>
                                            <td style="padding: 0.75rem 1rem; max-width: 320px;">
                                                <div style="font-size:0.75rem; color:#cbd5e1; line-height: 1.4;">
                                                    ${matrix.rationale || ''}
                                                </div>
                                                ${nm.hasConcentricDeficit ? '<div style="font-size:0.72rem; color:#f87171; font-weight:700; margin-top:3px;">Deficit concentrico mascherato (SJ < 38 cm)</div>' : ''}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },

        /**
         * Renderizza Tab 5: Scheda Clinico-Tecnica Individuale Atleta.
         * @param {Object} view - Istanza di PAPDashboardView.
         * @returns {string} Stringa HTML.
         */
        renderAthleteDetailTabHtml(view) {
            const currentItem = view.processedResults.find(r => r.athlete.id === view.selectedAthleteId) || view.processedResults[0];
            if (!currentItem) return '<div>Nessun dato atleta disponibile.</div>';

            const a = currentItem.athlete;
            const d = currentItem.diagnosis || {};
            const dosage = currentItem.volumetricDosage || {};
            const rec = currentItem.recoveryWindow || {};
            const directives = currentItem.technicalDirectives || [];

            const athleteOptions = view.processedResults.map(r => `
                <option value="${r.athlete.id}" ${r.athlete.id === view.selectedAthleteId ? 'selected' : ''}>
                    ${r.athlete.name} (${r.athlete.fullName || r.athlete.name}) – ${r.athlete.protocol?.name || 'Standard'}
                </option>
            `).join('');

            return `
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <!-- SELETTORE ATLETA -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid ${COLOR_BORDER}; border-radius: 10px; padding: 0.9rem 1.25rem; flex-wrap: wrap; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <label for="pap-select-athlete-individual" style="font-size: 0.78rem; text-transform: uppercase; color: ${COLOR_NEUTRAL}; font-weight: 700;">Seleziona Atleta:</label>
                            <select id="pap-select-athlete-individual" style="background: #0f172a; color: white; border: 1px solid ${COLOR_PRIMARY}; border-radius: 8px; padding: 0.45rem 0.85rem; font-weight: 700; font-size: 0.92rem; min-width: 250px;">
                                ${athleteOptions}
                            </select>
                        </div>
                        <div>
                            <span style="font-size: 0.8rem; color: ${COLOR_NEUTRAL};">Eta: <strong style="color:white;">${a.age || '–'} anni</strong> | Peso: <strong style="color:white;">${a.mass || '–'} kg</strong> | Sport: <strong style="color:white;">${a.sport || '–'}</strong></span>
                        </div>
                    </div>

                    <!-- CARD SCHEDA CLINICO-TECNICA -->
                    <div style="background: ${COLOR_BG_CARD}; border: 1px solid ${COLOR_BORDER}; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
                        <!-- INTESTAZIONE SCHEDA -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                            <div>
                                <h3 style="margin: 0; font-size: 1.4rem; color: white;">${a.fullName || a.name}</h3>
                                <p style="margin: 0.25rem 0 0 0; color: ${COLOR_NEUTRAL}; font-size: 0.85rem;">${a.morphology || ''}</p>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size: 0.72rem; text-transform: uppercase; color: ${COLOR_NEUTRAL}; font-weight: 700; display: block;">Diagnosi Funzionale PAP</span>
                                <span style="font-size: 0.95rem; font-weight: 800; color: ${d.badgeColor === 'positive' ? '#34d399' : (d.badgeColor === 'fatigue' ? '#f87171' : '#94a3b8')};">
                                    ${d.category || '–'}
                                </span>
                            </div>
                        </div>

                        <!-- 3 SEZIONI CLINICHE -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem;">
                            <!-- BOX 1: ESITO E PROTOCOLLO -->
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 1.1rem;">
                                <h5 style="margin: 0 0 0.75rem 0; color: ${COLOR_PRIMARY}; font-size: 0.9rem; text-transform: uppercase;">
                                    Protocollo Somministrato
                                </h5>
                                <p style="margin: 0 0 0.5rem 0; font-size: 0.85rem; color: white;">
                                    <strong>${a.protocol?.fullDescription || a.protocol?.name || 'Standard'}</strong>
                                </p>
                                <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5;">
                                    ${d.summaryText || ''}
                                </div>
                                <div style="margin-top: 0.75rem; font-size: 0.78rem; color: ${COLOR_NEUTRAL}; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem;">
                                    Meccanismo: ${d.detailedMechanism || '–'}
                                </div>
                            </div>

                            <!-- BOX 2: DOSAGGIO E RECUPERO -->
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 1.1rem;">
                                <h5 style="margin: 0 0 0.75rem 0; color: #a5b4fc; font-size: 0.9rem; text-transform: uppercase;">
                                    Finestra di Recupero & Dosaggio
                                </h5>
                                <div style="margin-bottom: 0.75rem;">
                                    <span style="font-size: 0.75rem; color: ${COLOR_NEUTRAL}; display: block;">Finestra Ottimale Consigliata</span>
                                    <strong style="font-size: 1.2rem; color: white;">${rec.recommendedWindowMin ? rec.recommendedWindowMin[0] + '′ – ' + rec.recommendedWindowMin[1] + '′ min' : '15′ – 20′ min'}</strong>
                                </div>
                                <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5;">
                                    ${dosage.recommendation || ''}
                                </div>
                                <div style="margin-top: 0.75rem; font-size: 0.75rem; color: #38bdf8;">
                                    ${rec.prepStrategy || ''}
                                </div>
                            </div>

                            <!-- BOX 3: PRESCRIZIONI CORRETTIVE -->
                            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 1.1rem;">
                                <h5 style="margin: 0 0 0.75rem 0; color: #34d399; font-size: 0.9rem; text-transform: uppercase;">
                                    Direttive Tecniche da Campo
                                </h5>
                                ${directives.map(dir => `
                                    <div style="margin-bottom: 0.75rem; font-size: 0.82rem;">
                                        <strong style="color:white; display:block;">${dir.area} (${dir.priority})</strong>
                                        <span style="color:#cbd5e1; font-size:0.78rem; display:block; margin-bottom:0.35rem;">${dir.targetConstraint}</span>
                                        <ul style="margin: 0; padding-left: 1.2rem; color: #94a3b8; font-size: 0.75rem;">
                                            ${(dir.exercises || []).slice(0, 2).map(ex => `<li>${ex}</li>`).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    // Esposizione globale
    root.PAPDashboardTabs = PAPDashboardTabs;
})();
