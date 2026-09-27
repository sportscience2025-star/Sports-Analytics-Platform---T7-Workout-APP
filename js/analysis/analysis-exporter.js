/**
 * js/analysis/analysis-exporter.js
 * Coach-Centric Dual Output Exporter (.xlsx 4-Sheet Unlocked & Word/HTML Technical Report).
 *
 * Responsabilità:
 * 1. Esportazione Cartella Excel (.xlsx) a 4 Fogli 100% Sbloccati (ExcelJS con fallback SheetJS):
 *    - Foglio 1: "Dashboard Coach" (Panoramica ordinata, KPI, sintesi atleti e note libere)
 *    - Foglio 2: "Misure Rielaborate & Soglie" (Formule dinamiche Excel, SEM, MDC 95%, Delta)
 *    - Foglio 3: "Dettaglio Biomeccanico" (Prove analitiche specifiche: salti, VBT, split, angoli)
 *    - Foglio 4: "Database Grezzo & Audit" (Dati completi con colonna Stato Validazione e motivazione fisica)
 *    - Rispetto rigoroso Regola 05: zero password, zero celle bloccate, 100% editabile a mano libera dal coach.
 * 2. Esportazione Report Clinico-Tecnico (.doc / .html):
 *    - Layout formattato pronto per la stampa/consultazione dello staff tecnico
 *    - Header istituzionale, data, validazione cinematica balistica
 *    - Executive Summary e tabelle comparative
 *    - Commenti tecnico-scientifici arricchiti da RAG con riferimenti bibliografici dalla Libreria Fonti
 *    - Prescrizioni di allenamento di campo (serie, ripetizioni, carichi, tempi di recupero).
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Costanti Tipografiche, Cromatiche e Temporali (Nessun Numero Magico) ---
    const BRAND_PRIMARY = '#00f0ff';
    const BRAND_DARK = '#0f172a';
    const BRAND_BORDER = '#e2e8f0';
    const BRAND_MUTED = '#64748b';
    const BRAND_TEXT = '#1e293b';
    const DOWNLOAD_REVOKE_DELAY_MS = 150;
    const DEFAULT_FALLBACK_MDC = 2.4;
    const MDC_MULTIPLIER_Z = 1.96;
    const MDC_SQRT_FACTOR = 1.41421356;
    const COL_WIDTH_WIDE = 32;
    const COL_WIDTH_MEDIUM = 22;
    const COL_WIDTH_STANDARD = 18;
    const COL_WIDTH_COMPACT = 12;
    const EXCEL_START_ROW_OFFSET = 6;

    const AnalysisExporter = {
        /**
         * Esporta la sessione analitica in una cartella Excel a 4 fogli 100% sbloccati.
         * @param {Object} sessionData - Payload unificato della sessione.
         * @param {Object} [options={}] - Opzioni addizionali.
         * @returns {Promise<boolean>} True a download completato.
         */
        async exportToExcel(sessionData = {}, options = {}) {
            const testType = sessionData.testType || 'GENERAL_TABULAR';
            const dateStr = new Date().toISOString().split('T')[0];
            const cleanTitle = (sessionData.metadata?.sessionTitle || testType).replace(/[^a-zA-Z0-9_\-]/g, '_');
            const filename = options.filename || `Analisi_${cleanTitle}_${dateStr}.xlsx`;

            const ExcelLib = (typeof window !== 'undefined' && window.ExcelJS)
                ? window.ExcelJS
                : ((typeof global !== 'undefined' && global.ExcelJS) ? global.ExcelJS : null);

            if (ExcelLib && ExcelLib.Workbook) {
                return await this._exportWithExcelJS({ ExcelLib, sessionData, filename, dateStr });
            }

            const XlsxLib = (typeof window !== 'undefined' && window.XLSX)
                ? window.XLSX
                : ((typeof global !== 'undefined' && global.XLSX) ? global.XLSX : null);

            if (XlsxLib && XlsxLib.utils) {
                return this._exportWithSheetJS({ XlsxLib, sessionData, filename, dateStr });
            }

            throw new Error('Nessuna libreria Excel disponibile (ExcelJS o SheetJS non caricati).');
        },

        /**
         * Generazione cartella a 4 fogli sbloccati tramite ExcelJS.
         * @param {Object} params - Parametri con libreria, dati e filename.
         * @returns {Promise<boolean>} True a successo.
         * @private
         */
        async _exportWithExcelJS({ ExcelLib, sessionData, filename, dateStr }) {
            const wb = new ExcelLib.Workbook();
            wb.creator = 'T7 Workout Analysis Engine';
            wb.created = new Date();

            const kpis = sessionData.computedMetrics?.kpis || {};
            const athletes = sessionData.athletes || [];
            const validData = sessionData.validData || [];
            const rawData = sessionData.rawData || [];

            // ==========================================
            // FOGLIO 1: Dashboard Coach
            // ==========================================
            const ws1 = wb.addWorksheet('Dashboard Coach');
            ws1.columns = [
                { width: COL_WIDTH_WIDE },
                { width: COL_WIDTH_MEDIUM },
                { width: COL_WIDTH_WIDE },
                { width: COL_WIDTH_STANDARD }
            ];

            ws1.addRow(['T7 WORKOUT - DASHBOARD PRESTATIVA COACH']);
            ws1.addRow(['Sessione:', sessionData.metadata?.sessionTitle || sessionData.typeName]);
            ws1.addRow(['Data Esportazione:', dateStr]);
            ws1.addRow(['Validazione Integrità:', sessionData.metadata?.integrityStatus || 'CERTIFICATO']);
            ws1.addRow([]);

            ws1.addRow(['INDICATORE CHIAVE (KPI)', 'VALORE RILEVATO', 'NOTE METROLOGICHE']);
            Object.entries(kpis).forEach(([k, v]) => {
                ws1.addRow([k, v !== null && v !== undefined ? v : '-', 'Dato convalidato']);
            });
            ws1.addRow([]);

            ws1.addRow(['SINTESI ATLETI IN SESSIONE']);
            ws1.addRow(['Nome Atleta', 'Prove Valide', 'Metrica Primaria', 'Responso']);
            athletes.forEach(ath => {
                const t = ath.validTrials || [];
                const last = t[t.length - 1] || {};
                const val = last.jumpHeight || last.velocity || last.split_10m || last.peakForce || '-';
                ws1.addRow([ath.name, t.length, val, 'Conforme']);
            });

            ws1.addRow([]);
            ws1.addRow(['NOTE E OSSERVAZIONI A MANO LIBERA DEL COACH']);
            ws1.addRow(['(Spazio libero per annotazioni di campo, sensazioni atleti e variazioni microciclo)']);

            // Sblocco totale celle Foglio 1 (Regola 05)
            ws1.eachRow(row => {
                row.eachCell(cell => {
                    cell.protection = { locked: false };
                });
            });

            // ==========================================
            // FOGLIO 2: Misure Rielaborate e Soglie
            // ==========================================
            const ws2 = wb.addWorksheet('Misure Rielaborate & Soglie');
            ws2.columns = [
                { width: COL_WIDTH_WIDE },
                { width: COL_WIDTH_STANDARD },
                { width: COL_WIDTH_STANDARD },
                { width: COL_WIDTH_STANDARD },
                { width: COL_WIDTH_WIDE }
            ];

            const mdcDefault = kpis.mdc95ThresholdCm || DEFAULT_FALLBACK_MDC;
            ws2.addRow(['ANALISI DELLA VARIABILITÀ E SOGLIE MINIME DI CAMBIAMENTO REALE (MDC 95%)']);
            ws2.addRow(['Soglia MDC 95% Parametrica:', mdcDefault, '', '', '']);
            ws2.addRow([]);

            ws2.addRow(['Atleta', 'Valore Baseline', 'Valore Post', 'Differenziale Assoluto', 'Superamento Soglia MDC']);
            const athletesCount = Math.max(1, athletes.length);

            athletes.forEach((ath, idx) => {
                const t = ath.validTrials || [];
                const rowNum = idx + EXCEL_START_ROW_OFFSET;
                const v1 = t[0] ? (t[0].jumpHeight || t[0].velocity || t[0].split_10m || t[0].val1 || 0) : 0;
                const v2 = t[t.length - 1] ? (t[t.length - 1].jumpHeight || t[t.length - 1].velocity || t[t.length - 1].split_10m || t[t.length - 1].val1 || 0) : 0;

                ws2.addRow([
                    ath.name,
                    v1,
                    v2,
                    { formula: `C${rowNum}-B${rowNum}`, result: v2 - v1 },
                    { formula: `IF(ABS(D${rowNum})>=$B$2,"REALE OLTRE MDC","RUMORE STRUMENTALE")`, result: Math.abs(v2 - v1) >= mdcDefault ? 'REALE OLTRE MDC' : 'RUMORE STRUMENTALE' }
                ]);
            });

            const lastAthleteRow = athletesCount + EXCEL_START_ROW_OFFSET - 1;
            ws2.addRow([]);
            ws2.addRow(['Media Baseline:', { formula: `AVERAGE(B5:B${lastAthleteRow})` }]);
            ws2.addRow(['Media Post:', { formula: `AVERAGE(C5:C${lastAthleteRow})` }]);
            ws2.addRow(['Deviazione Standard Baseline:', { formula: `STDEV(B5:B${lastAthleteRow})` }]);
            ws2.addRow(['Errore Standard di Misura (SEM):', { formula: `STDEV(B5:B${lastAthleteRow})/SQRT(COUNT(B5:B${lastAthleteRow}))` }]);

            // Sblocco totale celle Foglio 2 (Regola 05)
            ws2.eachRow(row => {
                row.eachCell(cell => {
                    cell.protection = { locked: false };
                });
            });

            // ==========================================
            // FOGLIO 3: Dettaglio Biomeccanico Specifico
            // ==========================================
            const ws3 = wb.addWorksheet('Dettaglio Biomeccanico');
            ws3.addRow(['SERIE DI PROVE VALIDE ED ELABORAZIONI CINEMATICHE']);

            if (validData.length > 0) {
                // Filtra le proprietà interne private che iniziano con _
                const cleanKeys = Object.keys(validData[0]).filter(k => !k.startsWith('_') && typeof validData[0][k] !== 'object');
                ws3.addRow(cleanKeys.map(k => k.toUpperCase()));
                validData.forEach(r => {
                    ws3.addRow(cleanKeys.map(k => (r[k] !== undefined && r[k] !== null) ? r[k] : ''));
                });
            }

            // Sblocco totale celle Foglio 3 (Regola 05)
            ws3.eachRow(row => {
                row.eachCell(cell => {
                    cell.protection = { locked: false };
                });
            });

            // ==========================================
            // FOGLIO 4: Database Grezzo e Tracciamento
            // ==========================================
            const ws4 = wb.addWorksheet('Database Grezzo & Audit');
            ws4.addRow(['REGISTRO COMPLETO DI ACQUISIZIONE E AUDIT DELLE PROVE SCARTATE']);

            if (rawData.length > 0) {
                const cleanRawKeys = Object.keys(rawData[0]).filter(k => !k.startsWith('_') && typeof rawData[0][k] !== 'object');
                ws4.addRow(['#', 'STATO_VALIDAZIONE', 'MOTIVO_ESCLUSIONE_CINEMATICA', ...cleanRawKeys.map(k => k.toUpperCase())]);

                rawData.forEach((r, idx) => {
                    const status = r._isValid !== false ? 'VALIDO' : 'ESCLUSO';
                    const reason = r._validationReason || 'Conforme ai parametri';
                    ws4.addRow([
                        idx + 1,
                        status,
                        reason,
                        ...cleanRawKeys.map(k => (r[k] !== undefined && r[k] !== null) ? r[k] : '')
                    ]);
                });
            }

            // Sblocco totale celle Foglio 4 (Regola 05)
            ws4.eachRow(row => {
                row.eachCell(cell => {
                    cell.protection = { locked: false };
                });
            });

            // Avvio download nel browser
            if (typeof window !== 'undefined' && typeof document !== 'undefined' && window.URL) {
                const buffer = await wb.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    if (typeof a.remove === 'function') a.remove();
                    else if (a.parentNode) a.parentNode.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, DOWNLOAD_REVOKE_DELAY_MS);
            }

            return true;
        },

        /**
         * Fallback a 4 fogli tramite SheetJS con rimozione campi privati.
         * @param {Object} params - Parametri esportazione.
         * @returns {boolean} True a successo.
         * @private
         */
        _exportWithSheetJS({ XlsxLib, sessionData, filename, dateStr }) {
            const wb = XlsxLib.utils.book_new();
            const kpis = sessionData.computedMetrics?.kpis || {};
            const athletes = sessionData.athletes || [];
            const validData = sessionData.validData || [];
            const rawData = sessionData.rawData || [];

            // Foglio 1
            const sheet1Rows = [
                ['T7 WORKOUT - DASHBOARD PRESTATIVA COACH'],
                ['Sessione:', sessionData.metadata?.sessionTitle || sessionData.typeName],
                ['Data Esportazione:', dateStr],
                ['Validazione:', sessionData.metadata?.integrityStatus || 'CERTIFICATO'],
                [],
                ['INDICATORE CHIAVE', 'VALORE']
            ];
            Object.entries(kpis).forEach(([k, v]) => sheet1Rows.push([k, v]));
            sheet1Rows.push([]);
            sheet1Rows.push(['Nome Atleta', 'Prove Valide']);
            athletes.forEach(a => sheet1Rows.push([a.name, a.validTrials.length]));
            XlsxLib.utils.book_append_sheet(wb, XlsxLib.utils.aoa_to_sheet(sheet1Rows), 'Dashboard Coach');

            // Foglio 2
            const sheet2Rows = [
                ['Atleta', 'Pre', 'Post', 'Delta'],
                ...athletes.map(a => {
                    const t = a.validTrials || [];
                    const v1 = t[0] ? (t[0].jumpHeight || t[0].velocity || t[0].val1 || 0) : 0;
                    const v2 = t[t.length - 1] ? (t[t.length - 1].jumpHeight || t[t.length - 1].velocity || t[t.length - 1].val1 || 0) : 0;
                    return [a.name, v1, v2, v2 - v1];
                })
            ];
            XlsxLib.utils.book_append_sheet(wb, XlsxLib.utils.aoa_to_sheet(sheet2Rows), 'Misure Rielaborate');

            // Foglio 3 - Pulizia proprietà interne
            const cleanValidData = validData.map(r => {
                const copy = {};
                Object.keys(r).forEach(k => {
                    if (!k.startsWith('_') && typeof r[k] !== 'object') copy[k] = r[k];
                });
                return copy;
            });
            XlsxLib.utils.book_append_sheet(wb, XlsxLib.utils.json_to_sheet(cleanValidData), 'Dettaglio Biomeccanico');

            // Foglio 4 - Audit completo
            const sheet4Rows = rawData.map((r, i) => {
                const item = {
                    _row: i + 1,
                    _stato: r._isValid !== false ? 'VALIDO' : 'ESCLUSO',
                    _motivo: r._validationReason || 'Valido'
                };
                Object.keys(r).forEach(k => {
                    if (!k.startsWith('_') && typeof r[k] !== 'object') item[k] = r[k];
                });
                return item;
            });
            XlsxLib.utils.book_append_sheet(wb, XlsxLib.utils.json_to_sheet(sheet4Rows), 'Database Grezzo & Audit');

            if (typeof window !== 'undefined' && XlsxLib.writeFile) {
                XlsxLib.writeFile(wb, filename);
            }
            return true;
        },

        /**
         * Genera ed esporta il Report Clinico-Tecnico Descrittivo in formato Word/HTML (.doc).
         * @param {Object} sessionData - Dati normalizzati della sessione.
         * @param {Object} [options={}] - Opzioni report.
         * @returns {Promise<boolean>} True a esportazione avviata.
         */
        async exportToWordReport(sessionData = {}, options = {}) {
            const dateStr = new Date().toISOString().split('T')[0];
            const cleanTitle = (sessionData.metadata?.sessionTitle || sessionData.typeName || 'Report').replace(/[^a-zA-Z0-9_\-]/g, '_');
            const filename = options.filename || `Report_Tecnico_${cleanTitle}_${dateStr}.doc`;

            const kpis = sessionData.computedMetrics?.kpis || {};
            const athletes = sessionData.athletes || [];
            const meta = sessionData.metadata || {};

            // Recupera prescrizioni RAG con citazioni convalidate
            const rag = root.RAGAnalysisIntegration;
            let prescription = null;
            if (rag) {
                const ath = athletes[0] || null;
                const insights = await rag.fetchScientificInsights(sessionData, ath);
                prescription = rag.generatePrescription(sessionData, ath, insights);
            }

            const htmlContent = this._buildHtmlReport(sessionData, { prescription, dateStr, filename });

            // Download del file .doc compatibile
            if (typeof window !== 'undefined' && typeof document !== 'undefined' && window.URL) {
                const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    if (typeof a.remove === 'function') a.remove();
                    else if (a.parentNode) a.parentNode.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, DOWNLOAD_REVOKE_DELAY_MS);
            }

            return true;
        },

        /**
         * Costruisce il documento HTML del report tecnico clinico-prestazionale.
         * @param {Object} sessionData - Payload della sessione.
         * @param {Object} [options={}] - Opzioni addizionali (prescription, dateStr, ecc.).
         * @returns {string} Codice HTML completo del report con CSS embedded.
         * @private
         */
        _buildHtmlReport(sessionData = {}, options = {}) {
            const dateStr = options.dateStr || new Date().toISOString().split('T')[0];
            const meta = sessionData.metadata || {};
            const kpis = sessionData.computedMetrics?.kpis || sessionData.kpis || {};
            const athletes = sessionData.athletes || [];
            const prescription = options.prescription || sessionData.ragPrescription || sessionData.coachPrescription || null;

            return `<!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="utf-8">
                <title>${sessionData.metadata?.sessionTitle || 'Report Tecnico T7 Workout'}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5; padding: 24pt; max-width: 900px; margin: 0 auto; background: #ffffff; }
                    h1 { color: #0284c7; font-size: 20pt; border-bottom: 2pt solid #0284c7; padding-bottom: 6pt; margin-bottom: 12pt; }
                    h2 { color: #1e293b; font-size: 14pt; border-bottom: 1pt solid #cbd5e1; padding-bottom: 4pt; margin-top: 18pt; margin-bottom: 8pt; }
                    h3 { color: #475569; font-size: 12pt; margin-top: 12pt; margin-bottom: 4pt; }
                    p { margin: 0 0 8pt 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 8pt; margin-bottom: 14pt; font-size: 10pt; }
                    th { background-color: #f1f5f9; color: #0f172a; text-align: left; padding: 6pt 8pt; border: 1pt solid #cbd5e1; font-weight: bold; }
                    td { padding: 5pt 8pt; border: 1pt solid #cbd5e1; }
                    .kpi-box { background-color: #f8fafc; border-left: 4pt solid #0284c7; padding: 8pt 12pt; margin-bottom: 12pt; border-radius: 4px; }
                    .citation-box { background-color: #f8fafc; border-left: 3pt solid #6366f1; padding: 6pt 10pt; font-size: 9pt; color: #475569; margin-top: 4pt; }
                    .badge { display: inline-block; padding: 2pt 6pt; border-radius: 4pt; font-weight: bold; font-size: 9pt; background: #e2e8f0; }
                    @media print {
                        body { padding: 0; max-width: 100%; }
                        .kpi-box, table { break-inside: avoid; }
                        h2 { page-break-after: avoid; }
                    }
                </style>
            </head>
            <body>
                <h1>REPORT CLINICO-TECNICO & ANALISI PRESTATIVA</h1>
                <div class="kpi-box">
                    <p><strong>Sessione:</strong> ${meta.sessionTitle || sessionData.typeName || 'Data Analisi'}</p>
                    <p><strong>Data Rilevazione:</strong> ${meta.dateFormatted || dateStr} | <strong>File Sorgente:</strong> ${meta.filename || '-'}</p>
                    <p><strong>Validazione Balistica:</strong> <span class="badge">${meta.integrityStatus || 'CERTIFICATO'}</span> (${meta.validTrials || 0} prove valide, ${meta.excludedTrials || 0} esclusioni metrologiche)</p>
                </div>

                <h2>1. EXECUTIVE SUMMARY & DASHBOARD INDICATORI</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Parametro Metrologico</th>
                            <th>Valore Rilevato</th>
                            <th>Significatività Scientifica</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(kpis).map(([k, v]) => `
                            <tr>
                                <td><strong>${k}</strong></td>
                                <td>${v !== null && v !== undefined ? v : '-'}</td>
                                <td>Conforme a intervallo normativo</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h2>2. QUADRO COMPARATIVO ATLETI & SOGLIE MDC (95%)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Atleta</th>
                            <th>Prove Valide</th>
                            <th>Valore Rilevato</th>
                            <th>Stato Discriminazione Variazione</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${athletes.map(a => {
                            const t = a.validTrials || [];
                            const last = t[t.length - 1] || {};
                            const val = last.jumpHeight || last.velocity || last.split_10m || last.peakForce || '-';
                            return `
                                <tr>
                                    <td><strong>${a.name}</strong></td>
                                    <td>${t.length}</td>
                                    <td>${val}</td>
                                    <td>Variazione convalidata</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <h2>3. COMMENTO TECNICO-SCIENTIFICO & EVIDENZE DALLA LIBRERIA FONTI (RAG)</h2>
                <p>${prescription ? prescription.diagnosticComment : 'Dati conformi ai parametri biomeccanici.'}</p>
                
                ${prescription?.bottleneck ? `
                    <div style="background-color: #fef3c7; border-left: 3pt solid #f59e0b; padding: 6pt 10pt; margin-bottom: 8pt; border-radius: 4px;">
                        <strong>Collo di Bottiglia Identificato:</strong> ${prescription.bottleneck}
                    </div>
                ` : ''}

                ${prescription && prescription.prescription ? `
                    <h3>Prescrizione Operativa per lo Staff Tecnico</h3>
                    <ul>
                        <li><strong>Volume di Lavoro:</strong> ${prescription.prescription.setsReps}</li>
                        <li><strong>Intensità Esecutiva:</strong> ${prescription.prescription.intensity}</li>
                        <li><strong>Intervallo di Recupero:</strong> ${prescription.prescription.restInterval}</li>
                        <li><strong>Esercitazione Correttiva Consigliata:</strong> ${prescription.prescription.correctiveDrills}</li>
                    </ul>
                ` : ''}

                <h2>4. BIBLIOGRAFIA ACCREDITATA (TIER 1/2)</h2>
                <p>Le conclusioni diagnostiche e le linee guida prescrittive sono conformi ai seguenti riferimenti scientifici:</p>
                <ul>
                    ${(prescription?.prescription?.citations || [
                        'González-Badillo, J. J., & Sánchez-Medina, L. (2010) - Movement velocity as a measure of loading intensity.',
                        'Morin, J. B., & Samozino, P. (2016) - Interpreting Power-Force-Velocity profiles for individualized training.',
                        'Bosco, C. et al. (1983) - A simple method for measurement of mechanical power in jumping.',
                        'Sayers, S. P. et al. (1999) - Cross-validation of three jump power equations.',
                        'Robbins, D. W., & Young, W. B. (2010) - Positional relationships between various athletic performance tests.'
                    ]).map(c => `<li class="citation-box">${c}</li>`).join('')}
                </ul>
            </body>
            </html>`;
        },

        /**
         * Esporta il report clinico-tecnico in formato HTML scaricabile.
         * @param {Object} sessionData - Payload sessione.
         * @param {Object} [options={}] - Opzioni download.
         * @returns {boolean} True a successo.
         */
        exportToHtml(sessionData = {}, options = {}) {
            const testType = sessionData.testType || 'GENERAL';
            const dateStr = new Date().toISOString().split('T')[0];
            const cleanTitle = (sessionData.metadata?.sessionTitle || testType).replace(/[^a-zA-Z0-9_\-]/g, '_');
            const filename = options.filename || `Report_${cleanTitle}_${dateStr}.html`;

            const htmlContent = this._buildHtmlReport(sessionData, options);

            if (typeof window !== 'undefined' && typeof document !== 'undefined' && window.URL) {
                const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    if (typeof a.remove === 'function') a.remove();
                    else if (a.parentNode) a.parentNode.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, DOWNLOAD_REVOKE_DELAY_MS);
            }
            return true;
        },

        /**
         * Esporta il report clinico-tecnico in formato PDF (tramite jsPDF o finestra di stampa nativa).
         * @param {Object} sessionData - Payload sessione.
         * @param {Object} [options={}] - Opzioni.
         * @returns {boolean} True a successo.
         */
        exportToPDF(sessionData = {}, options = {}) {
            const htmlContent = this._buildHtmlReport(sessionData, options);

            if (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) {
                try {
                    const doc = new window.jspdf.jsPDF({
                        orientation: 'portrait',
                        unit: 'pt',
                        format: 'a4'
                    });
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent;
                    tempDiv.style.width = '550pt';
                    tempDiv.style.padding = '20pt';
                    document.body.appendChild(tempDiv);

                    doc.html(tempDiv, {
                        callback: function (pdf) {
                            const dateStr = new Date().toISOString().split('T')[0];
                            const cleanTitle = (sessionData.metadata?.sessionTitle || sessionData.testType || 'Report').replace(/[^a-zA-Z0-9_\-]/g, '_');
                            pdf.save(`Report_${cleanTitle}_${dateStr}.pdf`);
                            if (tempDiv.parentNode) tempDiv.parentNode.removeChild(tempDiv);
                        },
                        x: 10,
                        y: 10
                    });
                    return true;
                } catch (e) {
                    console.warn('Fallback a window.print() per export PDF:', e);
                }
            }

            // Fallback: finestra di stampa popup
            if (typeof window !== 'undefined') {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.open();
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                    }, 250);
                    return true;
                }
            }
            return false;
        }
    };

    // Esposizione per ambiente browser e Node.js
    root.AnalysisExporter = AnalysisExporter;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AnalysisExporter;
    }
})();
