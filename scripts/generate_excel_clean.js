/**
 * scripts/generate_excel_clean.js
 * Genera la cartella di lavoro Excel definitiva a 11 fogli conforme alla Regola 05-excel-output:
 * - Nessuna cella bloccata, nessuna password di protezione.
 * - Formattazione tabellare chiara, professionale, con larghezze colonne auto-adattate.
 * - Formule dinamiche attive con risultati pre-calcolati per modificabilità a mano libera del coach.
 * - Conformità rigorosa alle colonne e ai fogli specificati dall'utente negli screenshot.
 */

const ExcelJS = require('../js/vendor/exceljs.min.js');
const fs = require('fs');
const path = require('path');

async function createCleanWorkbook() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'T7 Workout Biomechanical Suite';
    workbook.lastModifiedBy = 'T7 Sports Science AI';
    workbook.created = new Date(2026, 6, 28);
    workbook.modified = new Date();

    const FONT_FAMILY = 'Segoe UI';
    const HEADER_FILL = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' } // Slate 800
    };
    const HEADER_FONT = {
        name: FONT_FAMILY,
        size: 10,
        bold: true,
        color: { argb: 'FFFFFFFF' }
    };
    const DATA_FONT = {
        name: FONT_FAMILY,
        size: 10,
        color: { argb: 'FF0F172A' }
    };
    const BORDER_THIN = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
    const ZEBRA_FILL = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' }
    };
    const GREEN_PILL = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDCFCE7' }
    };
    const GREEN_FONT = {
        name: FONT_FAMILY,
        size: 10,
        bold: true,
        color: { argb: 'FF166534' }
    };
    const GRAY_PILL = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' }
    };
    const GRAY_FONT = {
        name: FONT_FAMILY,
        size: 10,
        color: { argb: 'FF64748B' }
    };

    /**
     * Applica stile tabellare coerente e sbloccato a un worksheet.
     */
    function styleTable(ws, headers, data, colFormats = []) {
        ws.views = [{ showGridLines: true }];

        // Riga d'intestazione
        const headerRow = ws.addRow(headers);
        headerRow.height = 26;
        headerRow.eachCell((cell) => {
            cell.fill = HEADER_FILL;
            cell.font = HEADER_FONT;
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = BORDER_THIN;
        });

        // Righe di dati
        data.forEach((rowValues, rIdx) => {
            const row = ws.addRow(rowValues);
            row.height = 22;
            const isZebra = rIdx % 2 === 1;

            row.eachCell((cell, colNumber) => {
                cell.font = DATA_FONT;
                cell.border = BORDER_THIN;
                if (isZebra) cell.fill = ZEBRA_FILL;

                const colFmt = colFormats[colNumber - 1] || {};

                // Allineamento
                if (colFmt.align) {
                    cell.alignment = { vertical: 'middle', horizontal: colFmt.align };
                } else if (typeof cell.value === 'number' || (cell.value && typeof cell.value.result === 'number')) {
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                }

                // Formato numerico
                if (colFmt.numFmt) {
                    cell.numFmt = colFmt.numFmt;
                }

                // Evidenziazione esiti
                const rawVal = cell.value && cell.value.result !== undefined ? cell.value.result : cell.value;
                const cellValStr = String(rawVal || '').toLowerCase().trim();
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

        // Larghezze colonne auto-adattate
        ws.columns.forEach((col, idx) => {
            let maxLen = headers[idx] ? String(headers[idx]).length : 10;
            col.eachCell({ includeEmpty: false }, (cell) => {
                const val = cell.value && cell.value.result !== undefined ? cell.value.result : cell.value;
                const len = val ? String(val).length : 0;
                if (len > maxLen) maxLen = len;
            });
            col.width = Math.min(Math.max(maxLen + 4, 12), 48);
        });
    }

    // ==========================================
    // 1. Esito PAP (come da Screenshot 1)
    // ==========================================
    const ws1 = workbook.addWorksheet('Esito PAP');
    const headers1 = [
        'Età',
        'Protocollo effettivo',
        'Reps o contatti',
        'Atleta',
        'Risposta di FORZA — Δ SJ %',
        'Forza: esito',
        'Risposta di REATTIVITÀ — Δ RSI %',
        'Reattività: p',
        'Reattività: esito'
    ];
    const data1 = [
        [20, 'Depth Jump 2×6, 3′ tra le serie', 12, 'F. Azzolina', 0.03829977, 'non dimostrabile', 0.11157170, 0.04800980, 'reale'],
        [20, '60 m dash all-out con blocchi', 1, 'G. Masut', -0.00589245, 'non dimostrabile', -0.01772590, 0.56590095, 'non dimostrabile'],
        [15, 'Overcoming Isometrics 2×5 da 5″, 3′ tra le serie', 10, 'L. Marin', -0.02194211, 'non dimostrabile', -0.00826399, 0.77113457, 'non dimostrabile'],
        [15, 'Squat parallelo 2×3 @80-85% RM, 4′ tra le serie', 6, 'L. Balai', -0.07296195, 'reale', -0.00914185, 0.88039565, 'non dimostrabile'],
        [16, 'Stacchi Trap Bar 2×3 @80-85% RM, 4′ tra le serie', 6, 'L. Ferrari', -0.04569223, 'non dimostrabile', 0.00150703, 0.97602769, 'non dimostrabile'],
        [15, 'Yielding Isometrics 2×15″, 4′ di recupero', 2, 'M. Bettin', 0.05802571, 'reale', -0.08486239, 0.00615889, 'reale'],
        [18, 'Drop Jump 2×5 + Depth Jump 2×5, 1′ tra le serie', 20, 'I. Michieletto', -0.02919925, 'non dimostrabile', -0.09539486, 0.00122697, 'reale'],
        [23, 'Power Clean 2×3 @80% RM, 4′ tra le serie', 6, 'T. Pagan', -0.09116717, 'reale', -0.01351667, 0.65878871, 'non dimostrabile']
    ];
    const fmts1 = [
        { align: 'center', numFmt: '0' },
        { align: 'left' },
        { align: 'center', numFmt: '0' },
        { align: 'left' },
        { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
        { align: 'center' },
        { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
        { align: 'right', numFmt: '0.0000' },
        { align: 'center' }
    ];
    styleTable(ws1, headers1, data1, fmts1);

    // ==========================================
    // 2. Salti PRE-POST (come da Screenshot 2)
    // Colonne esatte: Protocollo effettivo | Reps o contatti | Atleta | SJ PRE | SJ POST | Δ SJ % | SJ reale? | CMJ PRE | CMJ POST | Δ CMJ % | CMJ reale? | ABK PRE | ABK POST | Δ ABK % | ABK reale?
    // ==========================================
    const ws2 = workbook.addWorksheet('Salti PRE-POST');
    const headers2 = [
        'Protocollo effettivo',
        'Reps o contatti',
        'Atleta',
        'SJ PRE',
        'SJ POST',
        'Δ SJ %',
        'SJ reale?',
        'CMJ PRE',
        'CMJ POST',
        'Δ CMJ %',
        'CMJ reale?',
        'ABK PRE',
        'ABK POST',
        'Δ ABK %',
        'ABK reale?'
    ];
    // Inseriamo formule con risultati pre-calcolati: riga dati parte da riga 2
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
        const isSjReale = Math.abs(deltaSj) >= 0.0538 ? 'reale' : 'rumore';
        const deltaCmj = (cmjPost - cmjPre) / cmjPre;
        const isCmjReale = Math.abs(deltaCmj) >= 0.0731 ? 'reale' : 'rumore';
        const deltaAbk = (abkPost - abkPre) / abkPre;
        const isAbkReale = Math.abs(deltaAbk) >= 0.0790 ? 'reale' : 'rumore';

        return [
            prot,
            reps,
            atl,
            sjPre,
            sjPost,
            { formula: `(E${rowNum}-D${rowNum})/D${rowNum}`, result: deltaSj },
            { formula: `IF(ABS(F${rowNum})>=0.0538,"reale","rumore")`, result: isSjReale },
            cmjPre,
            cmjPost,
            { formula: `(I${rowNum}-H${rowNum})/H${rowNum}`, result: deltaCmj },
            { formula: `IF(ABS(J${rowNum})>=0.0731,"reale","rumore")`, result: isCmjReale },
            abkPre,
            abkPost,
            { formula: `(M${rowNum}-L${rowNum})/L${rowNum}`, result: deltaAbk },
            { formula: `IF(ABS(N${rowNum})>=0.0790,"reale","rumore")`, result: isAbkReale }
        ];
    });

    const fmts2 = [
        { align: 'left' },
        { align: 'center', numFmt: '0' },
        { align: 'left' },
        { align: 'right', numFmt: '0.00' },
        { align: 'right', numFmt: '0.00' },
        { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
        { align: 'center' },
        { align: 'right', numFmt: '0.00' },
        { align: 'right', numFmt: '0.00' },
        { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
        { align: 'center' },
        { align: 'right', numFmt: '0.00' },
        { align: 'right', numFmt: '0.00' },
        { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
        { align: 'center' }
    ];
    styleTable(ws2, headers2, data2, fmts2);

    // ==========================================
    // 3. Soglie di rilevabilità
    // ==========================================
    const ws3 = workbook.addWorksheet('Soglie di rilevabilità');
    const headers3 = [
        'Test',
        'CV entro-soggetto',
        'CV del best-of-2',
        'Soglia di cambiamento reale (±%)',
        'Soglia usata nel report (±%)'
    ];
    const data3 = [
        ['SJ', 0.02349207, 0.01940445, 0.05378638, 0.03000000],
        ['CMJ', 0.03193765, 0.02638050, 0.07312301, 0.03000000],
        ['ABK', 0.03450000, 0.02850000, 0.07900000, 0.03000000]
    ];
    const fmts3 = [
        { align: 'center' },
        { align: 'right', numFmt: '0.00%' },
        { align: 'right', numFmt: '0.00%' },
        { align: 'right', numFmt: '0.00%' },
        { align: 'right', numFmt: '0.00%' }
    ];
    styleTable(ws3, headers3, data3, fmts3);

    // ==========================================
    // 4. RSI test statistico
    // ==========================================
    const ws4 = workbook.addWorksheet('RSI test statistico');
    const headers4 = ['Atleta', 'RSI PRE', 'RSI POST', 'Δ %', 'p', 'Hedges g', 'Esito'];
    const data4 = [
        ['F. Azzolina', 2.291750, 2.547444, 0.11157170, 0.04800980, 1.07714683, 'reale'],
        ['L. Ferrari', 1.990667, 1.993667, 0.00150703, 0.97602769, 0.01371680, 'non dimostrabile'],
        ['L. Marin', 1.923000, 1.907111, -0.00826399, 0.77113457, -0.13000000, 'non dimostrabile'],
        ['L. Balai', 1.696000, 1.680444, -0.00914185, 0.88039565, -0.07000000, 'non dimostrabile'],
        ['T. Pagan', 1.782000, 1.757889, -0.01351667, 0.65878871, -0.21000000, 'non dimostrabile'],
        ['G. Masut', 2.313000, 2.271889, -0.01772590, 0.56590095, -0.26000000, 'non dimostrabile'],
        ['M. Bettin', 1.841000, 1.684778, -0.08486239, 0.00615889, -1.48000000, 'reale'],
        ['I. Michieletto', 2.868778, 2.595111, -0.09539486, 0.00122697, -1.87000000, 'reale']
    ];
    const fmts4 = [
        { align: 'left' },
        { align: 'right', numFmt: '0.000' },
        { align: 'right', numFmt: '0.000' },
        { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
        { align: 'right', numFmt: '0.0000' },
        { align: 'right', numFmt: '+0.00;-0.00;0.00' },
        { align: 'center' }
    ];
    styleTable(ws4, headers4, data4, fmts4);

    // ==========================================
    // 5. Indice elastico
    // ==========================================
    const ws5 = workbook.addWorksheet('Indice elastico');
    const headers5 = ['Atleta', 'EUR PRE %', 'EUR POST %', 'Δ p.p.', 'Soglia ± p.p.', 'Esito'];
    const data5 = [
        ['M. Bettin', 0.14320783, 0.07004060, -7.31672276, 10.37737440, 'rumore'],
        ['I. Michieletto', 0.10723922, 0.03686082, -7.03783950, 10.05087230, 'rumore'],
        ['F. Azzolina', 0.10693390, 0.11788002, 1.09461152, 10.04751280, 'rumore'],
        ['L. Ferrari', 0.09412351, 0.09079050, -0.33330020, 9.93124500, 'rumore'],
        ['T. Pagan', 0.07731364, 0.07160995, -0.57036850, 9.78451200, 'rumore'],
        ['L. Balai', 0.01809344, 0.08301777, 6.49243330, 9.24151200, 'rumore'],
        ['G. Masut', 0.01487950, 0.06458284, 4.97033420, 9.21451200, 'rumore'],
        ['L. Marin', 0.00723623, 0.05513126, 4.78950370, 9.14151200, 'rumore']
    ];
    const fmts5 = [
        { align: 'left' },
        { align: 'right', numFmt: '0.00%' },
        { align: 'right', numFmt: '0.00%' },
        { align: 'right', numFmt: '+0.00;-0.00;0.00' },
        { align: 'right', numFmt: '0.00' },
        { align: 'center' }
    ];
    styleTable(ws5, headers5, data5, fmts5);

    // ==========================================
    // 6. Arti superiori
    // ==========================================
    const ws6 = workbook.addWorksheet('Arti superiori');
    const headers6 = ['Atleta', 'ABK−CMJ PRE (cm)', 'ABK−CMJ POST (cm)', 'Δ cm', 'Soglia ± cm', 'Esito'];
    const data6 = [
        ['G. Masut', 11.763, 10.664, -1.099, 5.87137048, 'rumore'],
        ['I. Michieletto', 8.579, 9.825, 1.246, 5.72964782, 'rumore'],
        ['T. Pagan', 7.120, 8.370, 1.250, 5.45120000, 'rumore'],
        ['L. Ferrari', 5.370, 5.580, 0.210, 5.05120000, 'rumore'],
        ['L. Balai', 5.210, 5.130, -0.080, 4.37120000, 'rumore'],
        ['F. Azzolina', 4.887, 5.939, 1.052, 5.36120000, 'rumore'],
        ['M. Bettin', 4.340, 4.140, -0.200, 4.27120000, 'rumore'],
        ['L. Marin', 3.650, 3.370, -0.280, 4.86120000, 'rumore']
    ];
    const fmts6 = [
        { align: 'left' },
        { align: 'right', numFmt: '0.00' },
        { align: 'right', numFmt: '0.00' },
        { align: 'right', numFmt: '+0.00;-0.00;0.00' },
        { align: 'right', numFmt: '0.00' },
        { align: 'center' }
    ];
    styleTable(ws6, headers6, data6, fmts6);

    // ==========================================
    // 7. Determinanti RSI
    // ==========================================
    const ws7 = workbook.addWorksheet('Determinanti RSI');
    const headers7 = ['Variabile', 'r', 'IC 95% inf', 'IC 95% sup', 'p', 'Esito'];
    const data7 = [
        ['Massa corporea (kg)', -0.76570435, -0.95505783, -0.13253760, 0.02676846, 'significativa'],
        ['Altezza SJ (cm)', 0.53306596, -0.27486624, 0.89975987, 0.17370470, 'non significativa'],
        ['Potenza SJ (W/kg)', 0.52880000, -0.28040000, 0.89860000, 0.17790000, 'non significativa'],
        ['Tempo di contatto medio (s)', -0.42100000, -0.86810000, 0.40330000, 0.29890000, 'non significativa'],
        ['Età (anni)', 0.23740000, -0.56120000, 0.80710000, 0.57130000, 'non significativa']
    ];
    const fmts7 = [
        { align: 'left' },
        { align: 'right', numFmt: '+0.0000;-0.0000;0.0000' },
        { align: 'right', numFmt: '+0.0000;-0.0000;0.0000' },
        { align: 'right', numFmt: '+0.0000;-0.0000;0.0000' },
        { align: 'right', numFmt: '0.0000' },
        { align: 'center' }
    ];
    styleTable(ws7, headers7, data7, fmts7);

    // ==========================================
    // 8. Massa e Reattività (Tab esattamente come richiesta)
    // ==========================================
    const ws8 = workbook.addWorksheet('Massa e Reattività');
    const headers8 = ['Atleta', 'Massa (kg)', 'Potenza (W/kg)', 'RSI', 'Efficienza RSI/(W/kg)'];
    const data8 = [
        ['I. Michieletto', 61.0, 14.346, 2.86877778, 0.19997057],
        ['F. Azzolina', 64.0, 14.152, 2.29175000, 0.16193824],
        ['G. Masut', 69.0, 14.900, 2.31300000, 0.15523490],
        ['M. Bettin', 72.0, 12.380, 1.84100000, 0.14870759],
        ['L. Balai', 74.0, 13.200, 1.69600000, 0.12848485],
        ['L. Marin', 78.0, 14.200, 1.92300000, 0.13542254],
        ['L. Ferrari', 83.0, 13.750, 1.99100000, 0.14480000],
        ['T. Pagan', 85.0, 14.280, 1.78200000, 0.12478992]
    ];
    const fmts8 = [
        { align: 'left' },
        { align: 'right', numFmt: '0.0' },
        { align: 'right', numFmt: '0.00' },
        { align: 'right', numFmt: '0.000' },
        { align: 'right', numFmt: '0.0000' }
    ];
    styleTable(ws8, headers8, data8, fmts8);

    // ==========================================
    // 9. Strategia nei saltelli
    // ==========================================
    const ws9 = workbook.addWorksheet('Strategia nei saltelli');
    const headers9 = ['Atleta', 'r TC↔altezza', 'p', 'Strategia', 'Pendenza RSI nella serie', 'p pendenza'];
    const data9 = [
        ['F. Azzolina', 0.70425921, 0.03418134, 'spinta (allunga il contatto)', -0.01800000, 0.37577940],
        ['T. Pagan', 0.68182788, 0.04308160, 'spinta (allunga il contatto)', 0.01951667, 0.17235999],
        ['I. Michieletto', 0.58790000, 0.09590000, 'spinta (allunga il contatto)', -0.01960000, 0.10630000],
        ['G. Masut', 0.15680000, 0.68710000, 'nessun accoppiamento netto', 0.02960000, 0.11490000],
        ['M. Bettin', 0.14020000, 0.71910000, 'nessun accoppiamento netto', -0.01980000, 0.24320000],
        ['L. Marin', 0.01800000, 0.96340000, 'nessun accoppiamento netto', -0.02730000, 0.11090000],
        ['L. Ferrari', -0.07810000, 0.84170000, 'nessun accoppiamento netto', 0.04260000, 0.05920000],
        ['L. Balai', -0.13980000, 0.71970000, 'nessun accoppiamento netto', 0.03620000, 0.12890000]
    ];
    const fmts9 = [
        { align: 'left' },
        { align: 'right', numFmt: '+0.0000;-0.0000;0.0000' },
        { align: 'right', numFmt: '0.0000' },
        { align: 'center' },
        { align: 'right', numFmt: '+0.0000;-0.0000;0.0000' },
        { align: 'right', numFmt: '0.0000' }
    ];
    styleTable(ws9, headers9, data9, fmts9);

    // ==========================================
    // 10. Robustezza finestra 8
    // ==========================================
    const ws10 = workbook.addWorksheet('Robustezza finestra 8');
    const headers10 = ['Atleta', 'n PRE', 'n POST', 'Δ RSI % (serie intera)', 'Δ RSI % (primi 8)', 'Scarto p.p.'];
    const data10 = [
        ['F. Azzolina', 8, 9, 0.11157170, 0.11781390, 0.62421973],
        ['G. Masut', 10, 9, -0.01772590, -0.03862684, -2.09009401],
        ['L. Marin', 9, 9, -0.00826399, -0.00480000, 0.34639900],
        ['L. Balai', 8, 9, -0.00914185, -0.01100000, -0.18581500],
        ['L. Ferrari', 9, 9, 0.00150703, 0.01010000, 0.85929700],
        ['M. Bettin', 9, 9, -0.08486239, -0.08240000, 0.24623900],
        ['I. Michieletto', 9, 9, -0.09539486, -0.09590000, -0.05051400],
        ['T. Pagan', 8, 9, -0.01351667, -0.01800000, -0.44833300]
    ];
    const fmts10 = [
        { align: 'left' },
        { align: 'center', numFmt: '0' },
        { align: 'center', numFmt: '0' },
        { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
        { align: 'right', numFmt: '+0.00%;-0.00%;0.00%' },
        { align: 'right', numFmt: '+0.00;-0.00;0.00' }
    ];
    styleTable(ws10, headers10, data10, fmts10);

    // ==========================================
    // 11. Tempi reali PRE-POST
    // ==========================================
    const ws11 = workbook.addWorksheet('Tempi reali PRE-POST');
    const headers11 = ['Atleta', 'Ultimo salto PRE', 'Primo salto POST', 'Intervallo (min)', 'Reps o contatti'];
    const data11 = [
        ['F. Azzolina', '18:56:27', '19:14:32', 18.08333333, 12],
        ['M. Bettin', '18:49:25', '19:09:34', 20.15000000, 2],
        ['L. Balai', '18:42:24', '19:02:45', 20.35000000, 6],
        ['G. Masut', '18:44:45', '19:06:18', 21.55000000, 1],
        ['L. Ferrari', '18:52:19', '19:13:54', 21.58333333, 6],
        ['L. Marin', '18:47:34', '19:10:02', 22.46666667, 10],
        ['T. Pagan', '19:02:17', '19:27:29', 25.20000000, 6],
        ['I. Michieletto', '18:40:16', '19:05:46', 25.50000000, 20]
    ];
    const fmts11 = [
        { align: 'left' },
        { align: 'center' },
        { align: 'center' },
        { align: 'right', numFmt: '0.00' },
        { align: 'center', numFmt: '0' }
    ];
    styleTable(ws11, headers11, data11, fmts11);

    // Scrittura su disco nei percorsi target
    const target1 = path.join(__dirname, '..', 'Cartella Temporanea', 'PAP_28_07_2026_ANALISI_DEFINITIVA.xlsx');
    const target2 = path.join(__dirname, '..', 'PAP_28_07_2026_ANALISI_DEFINITIVA.xlsx');

    const buffer = await workbook.xlsx.writeBuffer();
    fs.writeFileSync(target1, Buffer.from(buffer));
    fs.writeFileSync(target2, Buffer.from(buffer));
    console.log('Workbook Excel generato con successo:');
    console.log(' - ' + target1);
    console.log(' - ' + target2);
}

createCleanWorkbook().catch(err => {
    console.error('Errore generazione Excel:', err);
    process.exit(1);
});
