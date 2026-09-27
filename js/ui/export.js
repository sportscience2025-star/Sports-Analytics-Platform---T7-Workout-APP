/**
 * UI Export — Excel/PDF Program Export
 * Extracted from ui.js
 */
// ─────────────────────────────────────────────────────────────────
// EXCEL EXPORT — Professional Multi-Tab Workbook (ExcelJS Upgrade)
// ─────────────────────────────────────────────────────────────────
async function _exportProgramToExcel(result) {
    if (typeof ExcelJS !== 'undefined') {
        return await _exportWithExcelJS(result);
    }
    if (typeof XLSX !== 'undefined') {
        return _exportWithLegacyXLSX(result);
    }
    alert('⚠️ Nessuna libreria Excel (ExcelJS o SheetJS) trovata. Ricarica la pagina.');
}

async function _exportWithExcelJS(result) {
    const meta = result?.meta || result?.info || {};
    const phases = result?.phases || [];
    const progression = result?.progression || result?.timeline || [];
    const explanations = result?.explanations || [];
    const periodization = result?.periodization || meta?.periodization || {};

    const safeVal = (val, defaultVal = 'N/A') => {
        if (val === undefined || val === null) return defaultVal;
        const str = String(val).trim();
        if (str === '' || str === 'undefined' || str === 'null') return defaultVal;
        return str;
    };

    const applyStyles = (cell, {
        fillColor = null,
        fontColor = '000000',
        fontSize = 10,
        bold = false,
        italic = false,
        hAlign = 'left',
        vAlign = 'middle',
        wrapText = false,
        border = true,
        borderColor = 'CBD5E1'
    } = {}) => {
        if (fillColor) {
            const hex = fillColor.replace('#', '');
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: hex.length === 6 ? 'FF' + hex : hex }
            };
        }
        const fontHex = fontColor.replace('#', '');
        cell.font = {
            name: 'Segoe UI',
            size: fontSize,
            bold: !!bold,
            italic: !!italic,
            color: { argb: fontHex.length === 6 ? 'FF' + fontHex : fontHex }
        };
        cell.alignment = {
            vertical: vAlign,
            horizontal: hAlign,
            wrapText: !!wrapText
        };
        if (border) {
            const bHex = borderColor.replace('#', '');
            const bArgb = bHex.length === 6 ? 'FF' + bHex : bHex;
            cell.border = {
                top: { style: 'thin', color: { argb: bArgb } },
                left: { style: 'thin', color: { argb: bArgb } },
                bottom: { style: 'thin', color: { argb: bArgb } },
                right: { style: 'thin', color: { argb: bArgb } }
            };
        }
    };

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'T7 Workout App';
    workbook.lastModifiedBy = 'T7 Workout App';
    workbook.created = new Date();

    // ─────────────────────────────────────────────────────────────
    // TAB 1: "Info Generali"
    // ─────────────────────────────────────────────────────────────
    const wsInfo = workbook.addWorksheet('Info Generali', { views: [{ showGridLines: true }] });
    wsInfo.columns = [
        { width: 28 }, // Col A: Parametro
        { width: 35 }, // Col B: Valore (parte 1)
        { width: 25 }, // Col C: Valore (parte 2)
        { width: 35 }  // Col D: Valore (parte 3)
    ];

    // Row 1: Title Banner A1:D1
    wsInfo.mergeCells('A1:D1');
    const titleCell = wsInfo.getCell('A1');
    titleCell.value = 'T7 WORKOUT - SCHEDA DI PROGRAMMAZIONE CLINICA E SPORTIVA';
    wsInfo.getRow(1).height = 38;
    applyStyles(titleCell, {
        fillColor: '1E293B',
        fontColor: 'FFFFFF',
        fontSize: 14,
        bold: true,
        hAlign: 'center',
        vAlign: 'middle'
    });

    wsInfo.getRow(2).height = 12;

    // Section 1 Header - Dati Atleta e Parametri di Base A3:D3
    wsInfo.mergeCells('A3:D3');
    const sec1Header = wsInfo.getCell('A3');
    sec1Header.value = 'DATI ATLETA E PARAMETRI DI BASE';
    wsInfo.getRow(3).height = 26;
    applyStyles(sec1Header, {
        fillColor: '0F766E',
        fontColor: 'FFFFFF',
        fontSize: 11,
        bold: true,
        hAlign: 'left',
        vAlign: 'middle'
    });

    // Metadata Card Table
    const metadataItems = [
        ['Livello Atleta', safeVal(meta.level)],
        ['Tipo Soggetto', safeVal(meta.patientType)],
        ['Sport Praticato', safeVal(meta.sportPraticato)],
        ['Obiettivo', safeVal(meta.goal)],
        ['Durata Programma', safeVal(meta.weeks ? `${meta.weeks} settimane` : null, '12 settimane')],
        ['Frequenza', safeVal(meta.days ? `${meta.days} giorni/settimana` : meta.frequency)],
        ['Attrezzatura', safeVal(meta.equipment)],
        ['Livello di Rischio', safeVal(meta.riskLevel, 'LOW')],
        ['Patologie/Condizioni', safeVal(Array.isArray(meta.pathologyNames) && meta.pathologyNames.length > 0 ? meta.pathologyNames.join(', ') : meta.pathologies, 'Nessuna')]
    ];

    let rowIdx = 4;
    metadataItems.forEach(([key, val]) => {
        const row = wsInfo.getRow(rowIdx);
        row.height = 22;
        wsInfo.mergeCells(`B${rowIdx}:D${rowIdx}`);

        const kCell = wsInfo.getCell(`A${rowIdx}`);
        kCell.value = key;
        applyStyles(kCell, {
            fillColor: 'F8FAFC',
            fontColor: '334155',
            fontSize: 10,
            bold: true,
            hAlign: 'left',
            vAlign: 'middle'
        });

        const vCell = wsInfo.getCell(`B${rowIdx}`);
        vCell.value = val;
        applyStyles(vCell, {
            fillColor: 'FFFFFF',
            fontColor: '1E293B',
            fontSize: 10,
            hAlign: 'left',
            vAlign: 'middle',
            wrapText: true
        });

        ['C', 'D'].forEach(c => {
            applyStyles(wsInfo.getCell(`${c}${rowIdx}`), { fillColor: 'FFFFFF', border: true });
        });

        rowIdx++;
    });

    wsInfo.getRow(rowIdx).height = 14;
    rowIdx++;

    // Periodization Methodology Box Header
    wsInfo.mergeCells(`A${rowIdx}:D${rowIdx}`);
    const methHeader = wsInfo.getCell(`A${rowIdx}`);
    methHeader.value = 'METODOLOGIA DI PERIODIZZAZIONE E RAZIONALE CLINICO';
    wsInfo.getRow(rowIdx).height = 26;
    applyStyles(methHeader, {
        fillColor: '0F766E',
        fontColor: 'FFFFFF',
        fontSize: 11,
        bold: true,
        hAlign: 'left',
        vAlign: 'middle'
    });
    rowIdx++;

    const methItems = [
        ['Metodo Periodizzazione', safeVal(meta.periodizationMethod || meta.method || periodization.method || result.method)],
        ['Modello di Carico', safeVal(meta.periodizationModel || meta.model || periodization.model || result.model)],
        ['Razionale Clinico', safeVal(meta.clinicalRationale || periodization.rationale || result.clinicalRationale)],
        ['Riferimenti Scientifici', safeVal(Array.isArray(meta.citations) ? meta.citations.join('; ') : meta.citations || periodization.citations || result.citations)]
    ];

    methItems.forEach(([key, val]) => {
        const row = wsInfo.getRow(rowIdx);
        row.height = 24;
        wsInfo.mergeCells(`B${rowIdx}:D${rowIdx}`);

        const kCell = wsInfo.getCell(`A${rowIdx}`);
        kCell.value = key;
        applyStyles(kCell, {
            fillColor: 'F8FAFC',
            fontColor: '334155',
            fontSize: 10,
            bold: true,
            hAlign: 'left',
            vAlign: 'middle'
        });

        const vCell = wsInfo.getCell(`B${rowIdx}`);
        vCell.value = val;
        applyStyles(vCell, {
            fillColor: 'FFFFFF',
            fontColor: '1E293B',
            fontSize: 10,
            hAlign: 'left',
            vAlign: 'middle',
            wrapText: true
        });

        ['C', 'D'].forEach(c => {
            applyStyles(wsInfo.getCell(`${c}${rowIdx}`), { fillColor: 'FFFFFF', border: true });
        });

        rowIdx++;
    });

    // ─────────────────────────────────────────────────────────────
    // TAB 2: "Timeline"
    // ─────────────────────────────────────────────────────────────
    const wsTimeline = workbook.addWorksheet('Timeline', { views: [{ showGridLines: true }] });
    wsTimeline.columns = [
        { width: 16 },
        { width: 22 },
        { width: 18 },
        { width: 18 },
        { width: 50 }
    ];

    // Banner A1:E1
    wsTimeline.mergeCells('A1:E1');
    const tBanner = wsTimeline.getCell('A1');
    tBanner.value = 'PIANIFICAZIONE TEMPORALE DEL MACROCICLO';
    wsTimeline.getRow(1).height = 36;
    applyStyles(tBanner, {
        fillColor: '1E293B',
        fontColor: 'FFFFFF',
        fontSize: 14,
        bold: true,
        hAlign: 'center',
        vAlign: 'middle'
    });

    wsTimeline.getRow(2).height = 12;

    // Table Headers
    const tHeaders = ['Settimane', 'Fase', 'Volume', 'Intensità', 'Focus Clinico / Metodologico'];
    wsTimeline.getRow(3).height = 26;
    tHeaders.forEach((th, i) => {
        const colLetter = String.fromCharCode(65 + i);
        const cell = wsTimeline.getCell(`${colLetter}3`);
        cell.value = th;
        applyStyles(cell, {
            fillColor: '0F766E',
            fontColor: 'FFFFFF',
            fontSize: 10,
            bold: true,
            hAlign: i === 4 ? 'left' : 'center',
            vAlign: 'middle'
        });
    });

    let tRowIdx = 4;
    progression.forEach((row, idx) => {
        const r = wsTimeline.getRow(tRowIdx);
        r.height = 24;
        const bg = idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';

        const vals = [
            safeVal(row.weeks || row.settimane || row.week, `Sett. ${idx + 1}`),
            safeVal(row.phase || row.fase || row.name, `Fase ${idx + 1}`),
            safeVal(row.vol || row.volume),
            safeVal(row.int || row.intensita || row.intensity),
            safeVal(row.note || row.focus || row.focusClinico || row.description)
        ];

        vals.forEach((v, colI) => {
            const colLetter = String.fromCharCode(65 + colI);
            const cell = wsTimeline.getCell(`${colLetter}${tRowIdx}`);
            cell.value = v;
            applyStyles(cell, {
                fillColor: bg,
                fontColor: '1E293B',
                fontSize: 10,
                hAlign: colI === 4 ? 'left' : 'center',
                vAlign: 'middle',
                wrapText: colI === 4
            });
        });

        tRowIdx++;
    });

    // ─────────────────────────────────────────────────────────────
    // TAB 3+: Phase Sheets ("Fase 1", "Fase 2", etc.)
    // ─────────────────────────────────────────────────────────────
    phases.forEach((phase, phaseIdx) => {
        const rawPhaseName = safeVal(phase.name, `Fase ${phase.id || phaseIdx + 1}`);
        const sheetName = rawPhaseName.replace(/[\[\]\*\/\\\?:]/g, '-').substring(0, 31);

        const wsPhase = workbook.addWorksheet(sheetName, { views: [{ showGridLines: true }] });
        wsPhase.columns = [
            { width: 6 },   // #
            { width: 32 },  // Esercizio (min width 28)
            { width: 16 },  // Tipo
            { width: 10 },  // Serie
            { width: 14 },  // Ripetizioni
            { width: 12 },  // Recupero
            { width: 10 },  // RPE
            { width: 12 },  // Tempo
            { width: 12 },  // Carico
            { width: 12 },  // Adattato?
            { width: 38 }   // Note Coach (min width 35)
        ];

        // Row 1: Phase Name Block
        wsPhase.mergeCells('A1:K1');
        const p1Cell = wsPhase.getCell('A1');
        p1Cell.value = rawPhaseName.toUpperCase();
        wsPhase.getRow(1).height = 36;
        applyStyles(p1Cell, {
            fillColor: '047857',
            fontColor: 'FFFFFF',
            fontSize: 14,
            bold: true,
            hAlign: 'center',
            vAlign: 'middle'
        });

        // Row 2: Settimane / Focus
        wsPhase.mergeCells('A2:K2');
        const p2Cell = wsPhase.getCell('A2');
        p2Cell.value = `Settimane: ${safeVal(phase.weeks)}  |  Focus: ${safeVal(phase.focus)}`;
        wsPhase.getRow(2).height = 24;
        applyStyles(p2Cell, {
            fillColor: '334155',
            fontColor: 'FFFFFF',
            fontSize: 11,
            bold: true,
            hAlign: 'center',
            vAlign: 'middle'
        });

        // Row 3: Obiettivo
        wsPhase.mergeCells('A3:K3');
        const p3Cell = wsPhase.getCell('A3');
        p3Cell.value = `Obiettivo Clinico & Prestazionale: ${safeVal(phase.objective || phase.objectives || phase.goal)}`;
        wsPhase.getRow(3).height = 22;
        applyStyles(p3Cell, {
            fillColor: 'F8FAFC',
            fontColor: '334155',
            fontSize: 10,
            italic: true,
            hAlign: 'left',
            vAlign: 'middle'
        });

        // Row 4: Blank spacing row
        wsPhase.getRow(4).height = 12;

        let pRowIdx = 5;
        const schedule = phase.schedule || phase.days || [];

        schedule.forEach((day, dayIdx) => {
            if (day.isRest) {
                wsPhase.mergeCells(`A${pRowIdx}:K${pRowIdx}`);
                const restCell = wsPhase.getCell(`A${pRowIdx}`);
                restCell.value = `🛌 ${safeVal(day.name, 'Giorno ' + (dayIdx + 1))}: RIPOSO ATTIVO / RECUPERO STRUTTURALE`;
                wsPhase.getRow(pRowIdx).height = 26;
                applyStyles(restCell, {
                    fillColor: '059669',
                    fontColor: 'FFFFFF',
                    fontSize: 11,
                    bold: true,
                    hAlign: 'left',
                    vAlign: 'middle'
                });
                ['B','C','D','E','F','G','H','I','J','K'].forEach(c => {
                    applyStyles(wsPhase.getCell(`${c}${pRowIdx}`), { fillColor: '059669', border: true });
                });
                pRowIdx += 2;
                return;
            }

            // Day Header A:K
            wsPhase.mergeCells(`A${pRowIdx}:K${pRowIdx}`);
            const dCell = wsPhase.getCell(`A${pRowIdx}`);
            const dayFocusText = day.focus ? ` — ${day.focus}` : '';
            dCell.value = `🏋️ ${safeVal(day.name, 'Giorno ' + (dayIdx + 1))}${dayFocusText}`;
            wsPhase.getRow(pRowIdx).height = 26;
            applyStyles(dCell, {
                fillColor: '0C4A6E',
                fontColor: 'FFFFFF',
                fontSize: 11,
                bold: true,
                hAlign: 'left',
                vAlign: 'middle'
            });
            ['B','C','D','E','F','G','H','I','J','K'].forEach(c => {
                applyStyles(wsPhase.getCell(`${c}${pRowIdx}`), { fillColor: '0C4A6E', border: true });
            });
            pRowIdx++;

            // Table Column Headers
            const exCols = ['#', 'Esercizio', 'Tipo', 'Serie', 'Ripetizioni', 'Recupero', 'RPE', 'Tempo', 'Carico', 'Adattato?', 'Note Coach'];
            wsPhase.getRow(pRowIdx).height = 24;
            exCols.forEach((colName, colI) => {
                const colLetter = String.fromCharCode(65 + colI);
                const cell = wsPhase.getCell(`${colLetter}${pRowIdx}`);
                cell.value = colName;
                applyStyles(cell, {
                    fillColor: '0284c7',
                    fontColor: 'FFFFFF',
                    fontSize: 10,
                    bold: true,
                    hAlign: (colI === 1 || colI === 10) ? 'left' : 'center',
                    vAlign: 'middle'
                });
            });
            pRowIdx++;

            // Exercise Rows
            const exList = day.exercises || [];
            exList.forEach((ex, exIdx) => {
                const r = wsPhase.getRow(pRowIdx);
                r.height = 22;

                const isWarmup = !!ex.isWarmup || (ex.type && (ex.type.toLowerCase().includes('warmup') || ex.type.toLowerCase().includes('riscaldamento'))) || ex.category === 'warmup';
                const isCardio = !!ex.isCardio || (ex.type && (ex.type.toLowerCase().includes('cardio') || ex.type.toLowerCase().includes('defaticamento') || ex.type.toLowerCase().includes('cooldown'))) || ex.category === 'cooldown' || ex.category === 'cardio';

                let bg = exIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
                let fg = '1E293B';

                if (isWarmup) {
                    bg = 'FEF3C7';
                    fg = '92400E';
                } else if (isCardio) {
                    bg = 'F0F9FF';
                    fg = '1E3A8A';
                }

                let suffix = '';
                if (isWarmup) suffix = ' (Riscaldamento)';
                if (isCardio) suffix = ' (Defaticamento)';

                const exTypeStr = ex.type || ex.category || (isWarmup ? 'Riscaldamento' : isCardio ? 'Defaticamento' : 'Principale');
                const isAdaptedStr = (ex.isadapted || ex.isAdapted || ex.adapted) ? 'SÌ' : 'NO';

                const rowValues = [
                    exIdx + 1,
                    safeVal(ex.name, 'Esercizio') + suffix,
                    safeVal(exTypeStr),
                    safeVal(ex.specs?.sets || ex.sets),
                    safeVal(ex.specs?.reps || ex.reps),
                    safeVal(ex.specs?.rest || ex.rest),
                    safeVal(ex.specs?.rpe || ex.rpe),
                    safeVal(ex.specs?.tempo || ex.tempo),
                    safeVal(ex.specs?.load || ex.load),
                    isAdaptedStr,
                    safeVal(ex.note || ex.coachNotes || ex.notes)
                ];

                rowValues.forEach((val, colI) => {
                    const colLetter = String.fromCharCode(65 + colI);
                    const cell = wsPhase.getCell(`${colLetter}${pRowIdx}`);
                    cell.value = val;
                    applyStyles(cell, {
                        fillColor: bg,
                        fontColor: fg,
                        fontSize: 10,
                        bold: isWarmup || isCardio,
                        hAlign: (colI === 1 || colI === 10) ? 'left' : 'center',
                        vAlign: 'middle',
                        wrapText: (colI === 1 || colI === 10)
                    });
                });

                pRowIdx++;
            });

            wsPhase.getRow(pRowIdx).height = 12;
            pRowIdx++;
        });
    });

    // ─────────────────────────────────────────────────────────────
    // TAB N+: "Spiegazioni Tecniche"
    // ─────────────────────────────────────────────────────────────
    const wsExp = workbook.addWorksheet('Spiegazioni Tecniche', { views: [{ showGridLines: true }] });
    wsExp.columns = [
        { width: 22 },
        { width: 32 },
        { width: 65 }
    ];

    wsExp.mergeCells('A1:C1');
    const expCell = wsExp.getCell('A1');
    expCell.value = 'GLOSSARIO TECNICO, RAGIONALE E NOTE DI SICUREZZA';
    wsExp.getRow(1).height = 36;
    applyStyles(expCell, {
        fillColor: '1E293B',
        fontColor: 'FFFFFF',
        fontSize: 14,
        bold: true,
        hAlign: 'center',
        vAlign: 'middle'
    });

    wsExp.getRow(2).height = 12;

    const expHeaders = ['Categoria', 'Titolo / Argomento', 'Spiegazione Dettagliata'];
    wsExp.getRow(3).height = 26;
    expHeaders.forEach((h, i) => {
        const colLetter = String.fromCharCode(65 + i);
        const cell = wsExp.getCell(`${colLetter}3`);
        cell.value = h;
        applyStyles(cell, {
            fillColor: '0284c7',
            fontColor: 'FFFFFF',
            fontSize: 10,
            bold: true,
            hAlign: i === 0 ? 'center' : 'left',
            vAlign: 'middle'
        });
    });

    let expRowIdx = 4;
    explanations.forEach((item, idx) => {
        const r = wsExp.getRow(expRowIdx);
        r.height = 26;
        const bg = idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';

        const rowVals = [
            safeVal(item.category || item.categoria, 'Generale'),
            safeVal(item.title || item.argomento || item.name),
            safeVal(item.text || item.explanation || item.spiegazione)
        ];

        rowVals.forEach((v, colI) => {
            const colLetter = String.fromCharCode(65 + colI);
            const cell = wsExp.getCell(`${colLetter}${expRowIdx}`);
            cell.value = v;
            applyStyles(cell, {
                fillColor: bg,
                fontColor: '1E293B',
                fontSize: 10,
                bold: colI === 1,
                hAlign: colI === 0 ? 'center' : 'left',
                vAlign: 'middle',
                wrapText: colI === 2
            });
        });

        expRowIdx++;
    });

    if (result.safetyNotes || result.citations) {
        wsExp.getRow(expRowIdx).height = 14;
        expRowIdx++;

        wsExp.mergeCells(`A${expRowIdx}:C${expRowIdx}`);
        const sCell = wsExp.getCell(`A${expRowIdx}`);
        sCell.value = 'NOTE DI SICUREZZA E RIFERIMENTI SCIENTIFICI';
        wsExp.getRow(expRowIdx).height = 26;
        applyStyles(sCell, {
            fillColor: '334155',
            fontColor: 'FFFFFF',
            fontSize: 11,
            bold: true,
            hAlign: 'left',
            vAlign: 'middle'
        });
        ['B', 'C'].forEach(c => {
            applyStyles(wsExp.getCell(`${c}${expRowIdx}`), { fillColor: '334155', border: true });
        });
        expRowIdx++;

        if (result.safetyNotes) {
            const notesArr = Array.isArray(result.safetyNotes) ? result.safetyNotes : [result.safetyNotes];
            notesArr.forEach(note => {
                wsExp.getRow(expRowIdx).height = 24;
                const vals = ['Sicurezza', 'Precauzione Clinica', safeVal(note)];
                vals.forEach((v, colI) => {
                    const colLetter = String.fromCharCode(65 + colI);
                    const cell = wsExp.getCell(`${colLetter}${expRowIdx}`);
                    cell.value = v;
                    applyStyles(cell, {
                        fillColor: 'FEF2F2',
                        fontColor: '991B1B',
                        fontSize: 10,
                        hAlign: colI === 0 ? 'center' : 'left',
                        vAlign: 'middle',
                        wrapText: colI === 2
                    });
                });
                expRowIdx++;
            });
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Export Serialization
    // ─────────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const goalName = (meta.goal || 'Programma').replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Programma_${goalName}_${dateStr}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function _exportWithLegacyXLSX(result) {
    const meta = result.meta || result.info || {};
    const phases = result.phases || [];
    const progression = result.progression || result.timeline || [];
    const explanations = result.explanations || [];

    const wb = XLSX.utils.book_new();

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

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const goalName = (meta.goal || 'Programma').replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Programma_${goalName}_${dateStr}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Esporta esplicitamente per accesso cross-modulo sicuro sia in browser che in test runner
if (typeof window !== 'undefined') {
    window._exportProgramToExcel = _exportProgramToExcel;
    window.App = window.App || {};
    window.App._exportProgramToExcel = _exportProgramToExcel;
}
