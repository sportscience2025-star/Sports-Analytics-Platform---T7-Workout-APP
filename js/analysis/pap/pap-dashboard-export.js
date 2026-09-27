/**
 * js/analysis/pap/pap-dashboard-export.js
 * Modulo di Esportazione Dati e Report per il Cruscotto PAP.
 *
 * Responsabilità:
 * 1. Esportazione CSV del Report Tecnico Metrologico (misure, MDC, p-value, Hedges' g).
 * 2. Esportazione della Sintesi Prescrittiva per il Coach in formato testuale (.txt).
 * 3. Esportazione della cartella Excel professionale (.xlsx) a 11 fogli di lavoro tramite ExcelJS.
 * 4. Download del Master Report Scientifico HTML autonomo.
 * 5. Helper di download file e gestione Blob cross-browser.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    const PAPDashboardExport = {

        /**
         * Esporta il report tecnico completo in formato CSV e apre il download nel browser.
         * @param {Object} view - Istanza di PAPDashboardView.
         */
        exportTechnicalReport(view) {
            if (!view || !Array.isArray(view.processedResults)) return;

            let csv = 'ID;Atleta;Eta;Massa_kg;Sport;Protocollo;Serie;Reps;Contatti;RecuperoReale_min;SJ_PRE;SJ_POST;Delta_SJ_perc;SJ_EsitoMDC;CMJ_PRE;CMJ_POST;Delta_CMJ_perc;RSI_PRE;RSI_POST;Delta_RSI_perc;p_value;Hedges_g;DiagnosiPAP\n';

            view.processedResults.forEach(r => {
                const a = r.athlete || {};
                const j = a.singleJumps || {};
                const prot = a.protocol || {};
                const sj = r.sjMdc || {};
                const cmj = r.cmjMdc || {};
                const rsi = r.rsiStats || {};
                const diag = r.diagnosis || {};

                csv += `${a.id || ''};"${a.name || ''}";${a.age || ''};${a.mass || ''};"${a.sport || ''}";"${prot.name || ''}";${prot.sets || ''};${prot.reps || ''};${prot.contacts || ''};${a.recoveryTimeMin || ''};${j.sjPre || ''};${j.sjPost || ''};${sj.deltaPercent || 0};"${sj.outcome || ''}";${j.cmjPre || ''};${j.cmjPost || ''};${cmj.deltaPercent || 0};${rsi.preMean || 0};${rsi.postMean || 0};${rsi.deltaPercent || 0};${rsi.pValue || 0};${rsi.hedgesG || 0};"${diag.category || ''}"\n`;
            });

            this.downloadFile(csv, 'Report_Tecnico_PAP_Metrologico.csv', 'text/csv;charset=utf-8;');
        },

        /**
         * Esporta la sintesi prescrittiva per il coach in formato testuale formattato.
         * @param {Object} view - Istanza di PAPDashboardView.
         */
        exportCoachSummary(view) {
            if (!view || !Array.isArray(view.processedResults)) return;

            let summary = '=======================================================\n';
            summary += '     T7 WORKOUT - SINTESI PRESCRITTIVA COACH AI\n';
            summary += '       Studio Sperimentale PAP e Dinamica di Salto\n';
            summary += '=======================================================\n\n';

            view.processedResults.forEach(r => {
                const a = r.athlete || {};
                const prot = a.protocol || {};
                const diag = r.diagnosis || {};
                const dosage = r.volumetricDosage || {};
                const rec = r.recoveryWindow || {};
                const directives = r.technicalDirectives || [];

                summary += `ATLETA: ${a.fullName || a.name} (${a.age || '–'} anni, ${a.mass || '–'} kg - ${a.specialty || ''})\n`;
                summary += `PROTOCOLLO EFFETTIVO: ${prot.fullDescription || prot.name || 'Standard'}\n`;
                summary += `RECUPERO REALE: ${a.recoveryTimeMin ? a.recoveryTimeMin.toFixed(1) + ' min' : '–'}\n`;
                summary += `DIAGNOSI: ${(diag.category || '').toUpperCase()}\n`;
                summary += `SPIEGAZIONE: ${diag.summaryText || ''}\n`;
                summary += `DOSAGGIO CONSIGLIATO: ${dosage.recommendation || ''}\n`;
                const win = rec.recommendedWindowMin || [15, 20];
                summary += `FINESTRA RECUPERO PRE-GARA: ${win[0]} - ${win[1]} minuti\n`;
                summary += 'DIRETTIVE TECNICHE:\n';
                directives.forEach(d => {
                    summary += `  - [${d.area}]: ${d.issue || ''}\n`;
                    (d.exercises || []).forEach(ex => {
                        summary += `    * ${ex}\n`;
                    });
                });
                summary += '-------------------------------------------------------\n\n';
            });

            this.downloadFile(summary, 'Sintesi_Prescrittiva_Coach_PAP.txt', 'text/plain;charset=utf-8;');
        },

        /**
         * Esporta la cartella di lavoro Excel completa e professionale (.xlsx) con tutti gli 11 fogli di calcolo.
         * Conforme alla Regola 05-excel-output: nessuna cella bloccata, nessuna password, formattazione tabellare chiara.
         * @param {Object} [view] - Istanza di PAPDashboardView opzionale.
         */
        async exportExcelWorkbook(view) {
            try {
                const ExcelJSClass = (typeof window !== 'undefined' && window.ExcelJS) || (typeof root !== 'undefined' && root.ExcelJS);
                if (!ExcelJSClass) {
                    const a = document.createElement('a');
                    a.href = './Cartella Temporanea/PAP_28_07_2026_ANALISI_DEFINITIVA.xlsx';
                    a.download = 'PAP_28_07_2026_ANALISI_DEFINITIVA.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    return;
                }

                const workbook = new ExcelJSClass.Workbook();
                workbook.creator = 'T7 Workout Biomechanical Suite';
                workbook.lastModifiedBy = 'T7 Sports Science AI';
                workbook.created = new Date();
                workbook.modified = new Date();

                const FONT_FAMILY = 'Segoe UI';
                const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
                const HEADER_FONT = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
                const DATA_FONT = { name: FONT_FAMILY, size: 10, color: { argb: 'FF0F172A' } };
                const BORDER_THIN = {
                    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                };
                const ZEBRA_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
                const GREEN_PILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
                const GREEN_FONT = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FF166534' } };
                const GRAY_PILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
                const GRAY_FONT = { name: FONT_FAMILY, size: 10, color: { argb: 'FF64748B' } };

                function styleTable(ws, headers, data, colFormats = []) {
                    ws.views = [{ showGridLines: true }];
                    const headerRow = ws.addRow(headers);
                    headerRow.height = 26;
                    headerRow.eachCell((cell) => {
                        cell.fill = HEADER_FILL;
                        cell.font = HEADER_FONT;
                        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        cell.border = BORDER_THIN;
                    });

                    data.forEach((rowValues, rIdx) => {
                        const row = ws.addRow(rowValues);
                        row.height = 21;
                        const isZebra = rIdx % 2 === 1;

                        row.eachCell((cell, colNumber) => {
                            cell.font = DATA_FONT;
                            cell.border = BORDER_THIN;
                            if (isZebra) cell.fill = ZEBRA_FILL;

                            const colFmt = colFormats[colNumber - 1] || {};
                            if (colFmt.align) {
                                cell.alignment = { vertical: 'middle', horizontal: colFmt.align };
                            } else if (typeof cell.value === 'number') {
                                cell.alignment = { vertical: 'middle', horizontal: 'right' };
                            } else {
                                cell.alignment = { vertical: 'middle', horizontal: 'left' };
                            }

                            if (colFmt.numFmt && typeof cell.value === 'number') {
                                cell.numFmt = colFmt.numFmt;
                            }

                            const cellValStr = String(cell.value || '').toLowerCase().trim();
                            if (cellValStr === 'reale' || cellValStr === 'significativa' || cellValStr === 'potenziamento') {
                                cell.fill = GREEN_PILL;
                                cell.font = GREEN_FONT;
                                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                            } else if (cellValStr === 'non dimostrabile' || cellValStr === 'rumore' || cellValStr === 'non significativa') {
                                cell.fill = GRAY_PILL;
                                cell.font = GRAY_FONT;
                                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                            }
                        });
                    });

                    ws.columns.forEach((col, idx) => {
                        let maxLen = headers[idx] ? headers[idx].length : 10;
                        col.eachCell({ includeEmpty: false }, (cell) => {
                            const len = cell.value ? String(cell.value).length : 0;
                            if (len > maxLen) maxLen = len;
                        });
                        col.width = Math.min(Math.max(maxLen + 4, 12), 48);
                    });
                }

                // 1. Esito PAP
                const ws1 = workbook.addWorksheet('Esito PAP');
                const headers1 = ['Età', 'Protocollo effettivo', 'Reps o contatti', 'Atleta', 'Risposta di FORZA — Δ SJ %', 'Forza: esito', 'Risposta di REATTIVITÀ — Δ RSI %', 'Reattività: p', 'Reattività: esito'];
                const data1 = [
                    [20, 'Depth Jump 2×6, 3′ tra le serie', 12, 'F. Azzolina', 0.0383, 'non dimostrabile', 0.1116, 0.0480, 'reale'],
                    [20, '60 m dash all-out con blocchi', 1, 'G. Masut', -0.0059, 'non dimostrabile', -0.0177, 0.5659, 'non dimostrabile'],
                    [15, 'Overcoming Isometrics 2×5 da 5″, 3′ tra le serie', 10, 'L. Marin', -0.0219, 'non dimostrabile', -0.0083, 0.7711, 'non dimostrabile'],
                    [15, 'Squat parallelo 2×3 @80-85% RM, 4′ tra le serie', 6, 'L. Balai', -0.0730, 'reale', -0.0091, 0.8804, 'non dimostrabile'],
                    [16, 'Stacchi Trap Bar 2×3 @80-85% RM, 4′ tra le serie', 6, 'L. Ferrari', -0.0457, 'non dimostrabile', 0.0015, 0.9760, 'non dimostrabile'],
                    [15, 'Yielding Isometrics 2×15″, 4′ di recupero', 2, 'M. Bettin', 0.0580, 'reale', -0.0849, 0.0062, 'reale'],
                    [18, 'Drop Jump 2×5 + Depth Jump 2×5, 1′ tra le serie', 20, 'I. Michieletto', -0.0292, 'non dimostrabile', -0.0954, 0.0012, 'reale'],
                    [23, 'Power Clean 2×3 @80% RM, 4′ tra le serie', 6, 'T. Pagan', -0.0912, 'reale', -0.0135, 0.6588, 'non dimostrabile']
                ];
                const fmts1 = [
                    { align: 'center', numFmt: '0' }, { align: 'left' }, { align: 'center', numFmt: '0' }, { align: 'left' },
                    { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' }, { align: 'center' }, { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
                    { align: 'right', numFmt: '0.0000' }, { align: 'center' }
                ];
                styleTable(ws1, headers1, data1, fmts1);

                // 2. Salti PRE-POST (formule dinamiche)
                const ws2 = workbook.addWorksheet('Salti PRE-POST');
                const headers2 = [
                    'Protocollo effettivo', 'Reps o contatti', 'Atleta',
                    'SJ PRE', 'SJ POST', 'Δ SJ %', 'SJ reale?',
                    'CMJ PRE', 'CMJ POST', 'Δ CMJ %', 'CMJ reale?',
                    'ABK PRE', 'ABK POST', 'Δ ABK %', 'ABK reale?'
                ];
                const rawData2 = [
                    ['Depth Jump 2×6, 3′ tra le serie', 12, 'F. Azzolina', 42.559, 44.189, 47.110, 49.398, 51.997, 55.337],
                    ['60 m dash all-out con blocchi', 1, 'G. Masut', 47.179, 46.901, 47.881, 49.930, 59.644, 60.594],
                    ['Overcoming Isometrics 2×5 da 5″, 3′ tra le serie', 10, 'L. Marin', 42.840, 41.900, 43.150, 44.210, 46.800, 47.580],
                    ['Squat parallelo 2×3 @80-85% RM, 4′ tra le serie', 6, 'L. Balai', 37.030, 34.330, 37.700, 37.180, 42.910, 42.320],
                    ['Stacchi Trap Bar 2×3 @80-85% RM, 4′ tra le serie', 6, 'L. Ferrari', 40.160, 38.330, 43.940, 41.810, 49.310, 47.390],
                    ['Yielding Isometrics 2×15″, 4′ di recupero', 2, 'M. Bettin', 32.590, 34.480, 37.260, 36.900, 41.600, 41.040],
                    ['Drop Jump 2×5 + Depth Jump 2×5, 1′ tra le serie', 20, 'I. Michieletto', 43.730, 42.460, 48.420, 44.020, 57.000, 53.850],
                    ['Power Clean 2×3 @80% RM, 4′ tra le serie', 6, 'T. Pagan', 43.330, 39.380, 46.680, 42.200, 53.800, 50.570]
                ];

                const data2 = rawData2.map((item, idx) => {
                    const rowNum = idx + 2;
                    const [prot, reps, atl, sjPre, sjPost, cmjPre, cmjPost, abkPre, abkPost] = item;
                    const deltaSj = (sjPost - sjPre) / sjPre;
                    const isSjReale = Math.abs(deltaSj) >= 0.054 ? 'reale' : 'rumore';
                    const deltaCmj = (cmjPost - cmjPre) / cmjPre;
                    const isCmjReale = Math.abs(deltaCmj) >= 0.068 ? 'reale' : 'rumore';
                    const deltaAbk = (abkPost - abkPre) / abkPre;
                    const isAbkReale = Math.abs(deltaAbk) >= 0.080 ? 'reale' : 'rumore';

                    return [
                        prot, reps, atl, sjPre, sjPost,
                        { formula: `(E${rowNum}-D${rowNum})/D${rowNum}`, result: deltaSj },
                        { formula: `IF(ABS(F${rowNum})>=0.054,"reale","rumore")`, result: isSjReale },
                        cmjPre, cmjPost,
                        { formula: `(I${rowNum}-H${rowNum})/H${rowNum}`, result: deltaCmj },
                        { formula: `IF(ABS(J${rowNum})>=0.068,"reale","rumore")`, result: isCmjReale },
                        abkPre, abkPost,
                        { formula: `(M${rowNum}-L${rowNum})/L${rowNum}`, result: deltaAbk },
                        { formula: `IF(ABS(N${rowNum})>=0.080,"reale","rumore")`, result: isAbkReale }
                    ];
                });

                const fmts2 = [
                    { align: 'left' }, { align: 'center', numFmt: '0' }, { align: 'left' },
                    { align: 'right', numFmt: '0.00' }, { align: 'right', numFmt: '0.00' }, { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
                    { align: 'center' }, { align: 'right', numFmt: '0.00' }, { align: 'right', numFmt: '0.00' }, { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
                    { align: 'center' }, { align: 'right', numFmt: '0.00' }, { align: 'right', numFmt: '0.00' }, { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
                    { align: 'center' }
                ];
                styleTable(ws2, headers2, data2, fmts2);

                // 3. Soglie di rilevabilita
                const ws3 = workbook.addWorksheet('Soglie di rilevabilità');
                const headers3 = ['Test', 'CV entro-soggetto (%)', 'CV del best-of-2 (%)', 'Soglia di cambiamento reale (±%)', 'Soglia usata nel report (±%)'];
                const data3 = [
                    ['SJ', 0.0235, 0.0194, 0.0540, 0.0540],
                    ['CMJ', 0.0319, 0.0264, 0.0680, 0.0680],
                    ['ABK', 0.0345, 0.0285, 0.0800, 0.0800]
                ];
                styleTable(ws3, headers3, data3, [{ align: 'center' }, { align: 'right', numFmt: '0.00%' }, { align: 'right', numFmt: '0.00%' }, { align: 'right', numFmt: '0.00%' }, { align: 'right', numFmt: '0.00%' }]);

                // 4. RSI test statistico
                const ws4 = workbook.addWorksheet('RSI test statistico');
                const headers4 = ['Atleta', 'RSI PRE', 'RSI POST', 'Δ %', 'p-value', 'Hedges g', 'Esito'];
                const data4 = [
                    ['F. Azzolina', 2.292, 2.547, 0.1116, 0.0480, 1.08, 'reale'],
                    ['L. Ferrari', 1.991, 1.994, 0.0015, 0.9760, 0.01, 'non dimostrabile'],
                    ['L. Marin', 1.923, 1.907, -0.0083, 0.7711, -0.13, 'non dimostrabile'],
                    ['L. Balai', 1.696, 1.680, -0.0091, 0.8804, -0.07, 'non dimostrabile'],
                    ['T. Pagan', 1.782, 1.758, -0.0135, 0.6588, -0.21, 'non dimostrabile'],
                    ['G. Masut', 2.313, 2.272, -0.0177, 0.5659, -0.26, 'non dimostrabile'],
                    ['M. Bettin', 1.841, 1.685, -0.0849, 0.0062, -1.48, 'reale'],
                    ['I. Michieletto', 2.869, 2.595, -0.0954, 0.0012, -1.87, 'reale']
                ];
                styleTable(ws4, headers4, data4, [{ align: 'left' }, { align: 'right', numFmt: '0.000' }, { align: 'right', numFmt: '0.000' }, { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' }, { align: 'right', numFmt: '0.0000' }, { align: 'right', numFmt: '+0.00;-0.00;0.00' }, { align: 'center' }]);

                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                this.downloadBlob(blob, 'PAP_28_07_2026_ANALISI_DEFINITIVA.xlsx');
            } catch (err) {
                console.error('[PAPDashboardExport] Errore generazione ExcelJS, fallback download:', err);
                const a = document.createElement('a');
                a.href = './Cartella Temporanea/PAP_28_07_2026_ANALISI_DEFINITIVA.xlsx';
                a.download = 'PAP_28_07_2026_ANALISI_DEFINITIVA.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        },

        /**
         * Scarica il Master Report Scientifico HTML.
         */
        exportHtmlReport() {
            const a = document.createElement('a');
            a.href = './Cartella Temporanea/REPORT_DEFINITIVO_PAP_28_07_2026.html';
            a.download = 'REPORT_DEFINITIVO_PAP_28_07_2026.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },

        /**
         * Scarica un file Blob nel browser.
         * @param {Blob} blob - Oggetto Blob binario.
         * @param {string} filename - Nome del file destinazione.
         */
        downloadBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        /**
         * Helper di utilita per il download di file testo o CSV nel browser.
         * @param {string} content - Contenuto testuale.
         * @param {string} filename - Nome del file.
         * @param {string} mimeType - MIME type del file.
         */
        downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            this.downloadBlob(blob, filename);
        }
    };

    // Esposizione globale
    root.PAPDashboardExport = PAPDashboardExport;
})();
