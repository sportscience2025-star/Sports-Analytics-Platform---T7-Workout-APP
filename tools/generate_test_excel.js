const playwright = require('C:/Users/ptomm/AppData/Local/ms-playwright-go/1.57.0/package');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log("Launching headless browser to generate Excel...");
    const browser = await playwright.chromium.launch({
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        headless: true
    });
    const page = await browser.newPage();

    const indexPath = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');
    console.log("Navigating to:", indexPath);
    await page.goto(indexPath);

    console.log("Waiting for window.XLSX to load...");
    await page.waitForFunction(() => typeof window.XLSX !== 'undefined', { timeout: 10000 });
    console.log("window.XLSX loaded successfully.");

    console.log("Generating workout program and exporting workbook to Base64 in browser context...");
    const base64Data = await page.evaluate(() => {
        const result = window.AI.generateFullProgram({
            patientType: 'Atleta',
            weeks: 12,
            days: 3,
            goal: 'Strength',
            level: 'Intermediate',
            equipment: 'Full Gym'
        });

        const meta = result.meta || {};
        const phases = result.phases || [];
        const progression = result.progression || [];
        const explanations = result.explanations || [];

        const wb = XLSX.utils.book_new();

        // Sheet 1: Info Generali
        const infoData = [
            ['Parametro', 'Valore'],
            ['Livello Atleta', meta.level || ''],
            ['Tipo Soggetto', meta.patientType || ''],
            ['Sport Praticato', meta.sportPraticato || 'N/A'],
            ['Obiettivo', meta.goal || ''],
            ['Durata Programma', (meta.weeks || 12) + ' settimane'],
            ['Giorni/settimana', meta.days || ''],
            ['Attrezzatura', meta.equipment || ''],
            ['Livello di Rischio', meta.riskLevel || 'LOW'],
            ['Patologie/Condizioni', (meta.pathologyNames || []).join(', ') || 'Nessuna']
        ];
        const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
        XLSX.utils.book_append_sheet(wb, wsInfo, 'Info Generali');

        // Sheet 2: Timeline
        const timelineData = [
            ['Fase', 'Settimane', 'Volume', 'Intensità', 'Focus']
        ];
        progression.forEach((row, i) => {
            timelineData.push([
                row.phase || `Fase ${i + 1}`,
                row.weeks || '',
                row.vol || '',
                row.int || '',
                row.note || ''
            ]);
        });
        const wsTimeline = XLSX.utils.aoa_to_sheet(timelineData);
        XLSX.utils.book_append_sheet(wb, wsTimeline, 'Timeline');

        // Sheet 3+: Phase sheets (Fase 1, Fase 2, etc.)
        phases.forEach(phase => {
            const phaseName = (phase.name || `Fase ${phase.id}`).replace(/[\[\]\*\/\\\?:]/g, '-');
            const sheetName = phaseName.substring(0, 31);
            
            const phaseData = [
                ['Fase:', phase.name || ''],
                ['Settimane:', phase.weeks || ''],
                ['Focus:', phase.focus || ''],
                ['Obiettivo:', phase.objective || ''],
                [],
                ['Esercizio', 'Serie', 'Ripetizioni', 'Carico', 'Note Coach']
            ];
            
            (phase.schedule || []).forEach(day => {
                phaseData.push([day.name || '', '', '', '', '']);
                if (day.isRest) {
                    phaseData.push(['🛌 RIPOSO', '', '', '', '']);
                    phaseData.push([]);
                    return;
                }
                
                const exList = day.exercises || [];
                exList.forEach(ex => {
                    let suffix = '';
                    if (ex.isWarmup) suffix = ' (Riscaldamento)';
                    if (ex.isCardio) suffix = ' (Defaticamento)';
                    
                    phaseData.push([
                        (ex.name || '') + suffix,
                        ex.specs?.sets || '',
                        ex.specs?.reps || '',
                        ex.specs?.load || '',
                        ex.note || ''
                    ]);
                });
                phaseData.push([]);
            });
            
            const wsPhase = XLSX.utils.aoa_to_sheet(phaseData);
            XLSX.utils.book_append_sheet(wb, wsPhase, sheetName);
        });

        // Sheet Last: Spiegazioni Tecniche
        const explanationData = [
            ['Categoria', 'Titolo', 'Spiegazione Tecnica']
        ];
        explanations.forEach(exp => {
            explanationData.push([
                exp.category || '',
                exp.title || '',
                exp.text || ''
            ]);
        });
        const wsExplanations = XLSX.utils.aoa_to_sheet(explanationData);
        XLSX.utils.book_append_sheet(wb, wsExplanations, 'Spiegazioni Tecniche');

        return XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    });

    console.log("Writing base64 to program_test.xlsx...");
    fs.writeFileSync('../test_data/program_test.xlsx', Buffer.from(base64Data, 'base64'));
    console.log("Excel file written successfully: program_test.xlsx");

    await browser.close();
    process.exit(0);
})().catch(err => {
    console.error("Error generating Excel:", err);
    process.exit(1);
});
