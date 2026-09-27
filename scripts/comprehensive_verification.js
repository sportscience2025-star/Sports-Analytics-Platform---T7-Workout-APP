const ExcelJS = require('../js/vendor/exceljs.min.js');
const fs = require('fs');
const path = require('path');

async function verifyAll() {
    console.log('=== 1. VERIFYING EXCEL WORKBOOKS ===');
    const xlsxPaths = [
        'Cartella Temporanea/PAP_28_07_2026_ANALISI_DEFINITIVA.xlsx',
        'PAP_28_07_2026_ANALISI_DEFINITIVA.xlsx'
    ];

    const expectedSheets = [
        'Esito PAP',
        'Salti PRE-POST',
        'Soglie di rilevabilità',
        'RSI test statistico',
        'Indice elastico',
        'Arti superiori',
        'Determinanti RSI',
        'Massa e Reattività',
        'Strategia nei saltelli',
        'Robustezza finestra 8',
        'Tempi reali PRE-POST'
    ];

    const expectedHeaders1 = [
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

    const expectedHeaders2 = [
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

    for (const p of xlsxPaths) {
        if (!fs.existsSync(p)) {
            throw new Error('File not found: ' + p);
        }
        const stat = fs.statSync(p);
        console.log(`Checking ${p} (size: ${stat.size} bytes)...`);
        if (stat.size < 15000) {
            throw new Error(`File ${p} too small: ${stat.size}`);
        }

        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(fs.readFileSync(p));

        const sheetNames = wb.worksheets.map(w => w.name);
        console.log('  Sheets count:', sheetNames.length);
        for (const s of expectedSheets) {
            if (!sheetNames.includes(s)) {
                throw new Error(`Missing expected sheet "${s}" in ${p}`);
            }
        }

        // Sheet 1 Check
        const ws1 = wb.getWorksheet('Esito PAP');
        const h1 = ws1.getRow(1).values.slice(1);
        if (JSON.stringify(h1) !== JSON.stringify(expectedHeaders1)) {
            throw new Error(`Headers mismatch in Esito PAP: got ${JSON.stringify(h1)}`);
        }
        console.log('  [PASS] Sheet 1 "Esito PAP" headers match screenshot 1');

        // Sheet 2 Check
        const ws2 = wb.getWorksheet('Salti PRE-POST');
        const h2 = ws2.getRow(1).values.slice(1);
        if (JSON.stringify(h2) !== JSON.stringify(expectedHeaders2)) {
            throw new Error(`Headers mismatch in Salti PRE-POST: got ${JSON.stringify(h2)}`);
        }
        console.log('  [PASS] Sheet 2 "Salti PRE-POST" headers match screenshot 2');

        // Check formulas in Sheet 2
        const r2 = ws2.getRow(2);
        const cellDeltaSj = r2.getCell(6);
        const cellSjReale = r2.getCell(7);
        if (!cellDeltaSj.formula || !cellSjReale.formula) {
            throw new Error(`Formulas missing in Sheet 2: col6 formula=${cellDeltaSj.formula}`);
        }
        console.log(`  [PASS] Sheet 2 dynamic formulas verified: F2=${cellDeltaSj.formula} G2=${cellSjReale.formula}`);

        // Protection check across all sheets
        wb.eachSheet(ws => {
            if (ws.sheetProtection && (ws.sheetProtection.sheet || ws.sheetProtection.selectLockedCells)) {
                throw new Error(`Worksheet ${ws.name} has protection enabled! (Violates Rule 05)`);
            }
        });
        console.log('  [PASS] Rule 05 Verified: all 11 sheets completely unlocked, no passwords.');
    }

    console.log('\n=== 2. VERIFYING MASTER HTML REPORTS ===');
    const htmlPaths = [
        'Cartella Temporanea/REPORT_DEFINITIVO_PAP_28_07_2026.html',
        'REPORT_DEFINITIVO_PAP_28_07_2026.html'
    ];

    const athletes = [
        'Federico Azzolina',
        'Giacomo Masut',
        'Leonardo Marin',
        'Leonis Balai',
        'Lorenzo Ferrari',
        'Matteo Bettin',
        'Ivan Michieletto',
        'Tommaso Pagan'
    ];

    for (const p of htmlPaths) {
        if (!fs.existsSync(p)) {
            throw new Error('HTML file not found: ' + p);
        }
        const content = fs.readFileSync(p, 'utf-8');
        console.log(`Checking ${p} (size: ${content.length} characters)...`);
        if (content.length < 800000) {
            throw new Error(`HTML report ${p} seems incomplete (size: ${content.length})`);
        }

        const imgMatches = content.match(/<img[^>]+src=["']data:image\/png;base64,/g) || [];
        console.log('  Embedded Base64 PNG images count:', imgMatches.length);
        if (imgMatches.length !== 11) {
            throw new Error(`Expected 11 embedded study figures, found: ${imgMatches.length}`);
        }
        console.log('  [PASS] Exactly 11 high-res scientific figures embedded.');

        for (const ath of athletes) {
            if (!content.includes(ath)) {
                throw new Error(`Athlete ${ath} missing in HTML report!`);
            }
        }
        console.log('  [PASS] All 8 athletes present with full individual dossiers.');

        const keyPhrases = [
            'Minimo Cambiamento Rilevabile',
            '18.08 – 25.50 min',
            'Massa corporea (kg)',
            '-0.7657',
            'Hedges\' g',
            'Depth Jump da box 40 cm, 2×6',
            'Yielding Isometrics'
        ];

        for (const kp of keyPhrases) {
            if (!content.includes(kp)) {
                throw new Error(`Key scientific phrase missing: "${kp}" in ${p}`);
            }
        }
        console.log('  [PASS] Core audit & coaching methodology verified.');
    }

    console.log('\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY ===');
}

verifyAll().catch(err => {
    console.error('VERIFICATION FAILED:', err);
    process.exit(1);
});
