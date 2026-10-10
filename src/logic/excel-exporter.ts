/**
 * src/logic/excel-exporter.ts
 * Esportatore Professionale di Schede di Allenamento in formato Excel (.xlsx) Multi-Tab con ExcelJS.
 * Genera cartelle di lavoro Excel con styling ad alta fedeltà, fogli multipli colorati,
 * banner clinici e griglie formattate conformi alla Foto 5.
 *
 * Rispetta la Regola 01 (Zero emoji spontanee) e Regola R1 (Zero any, TypeScript strict).
 */

import ExcelJS from 'exceljs';
import type { WorkoutProgram } from '../types/program';

/**
 * Opzioni di formattazione per le celle Excel.
 */
interface StyleOptions {
  fillColor?: string | null;
  fontColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  hAlign?: 'left' | 'center' | 'right';
  vAlign?: 'top' | 'middle' | 'bottom';
  wrapText?: boolean;
  border?: boolean;
  borderColor?: string;
}

/**
 * Pulisce una stringa o valore indefinito fornendo un fallback sicuro.
 *
 * @param val - Valore di input
 * @param fallback - Valore di default in caso di assenza
 * @returns Stringa pulita
 */
function safeVal(val: unknown, fallback: string = '-'): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  return str.length > 0 ? str : fallback;
}

/**
 * Applica stili visivi completi a una singola cella di ExcelJS.
 *
 * @param cell - Cella target ExcelJS
 * @param options - Proprietà di stile (colori, font, allineamento, bordi)
 */
function applyStyles(cell: ExcelJS.Cell, options: StyleOptions = {}): void {
  const {
    fillColor = null,
    fontColor = '000000',
    fontSize = 10,
    bold = false,
    italic = false,
    hAlign = 'left',
    vAlign = 'middle',
    wrapText = false,
    border = true,
    borderColor = 'CBD5E1',
  } = options;

  if (fillColor) {
    const hex = fillColor.replace('#', '');
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: hex.length === 6 ? 'FF' + hex : hex },
    };
  }

  const fontHex = fontColor.replace('#', '');
  cell.font = {
    name: 'Segoe UI',
    size: fontSize,
    bold: !!bold,
    italic: !!italic,
    color: { argb: fontHex.length === 6 ? 'FF' + fontHex : fontHex },
  };

  cell.alignment = {
    vertical: vAlign,
    horizontal: hAlign,
    wrapText: !!wrapText,
  };

  if (border) {
    const bHex = borderColor.replace('#', '');
    const bArgb = bHex.length === 6 ? 'FF' + bHex : bHex;
    cell.border = {
      top: { style: 'thin', color: { argb: bArgb } },
      left: { style: 'thin', color: { argb: bArgb } },
      bottom: { style: 'thin', color: { argb: bArgb } },
      right: { style: 'thin', color: { argb: bArgb } },
    };
  }
}

/**
 * Genera ed esporta una vera cartella di lavoro Excel (.xlsx) a fogli multipli
 * con banner verde, intestazioni scure e righe stilizzate (Foto 5).
 *
 * @param program - Oggetto WorkoutProgram generato dal wizard
 * @param customFileName - Nome opzionale per il file esportato
 */
export async function exportProgramToExcel(
  program: WorkoutProgram,
  customFileName?: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'T7 Workout App';
  workbook.lastModifiedBy = 'T7 Workout App';
  workbook.created = new Date();

  const athleteName = safeVal(program.athleteName, 'Atleta');
  const durationWeeks = program.durationWeeks ?? program.totalWeeks ?? 12;
  const daysPerWeek = program.daysPerWeek ?? program.phases[0]?.sessions.length ?? 3;

  // ─────────────────────────────────────────────────────────────
  // TAB 1: "Info Generali"
  // ─────────────────────────────────────────────────────────────
  const wsInfo = workbook.addWorksheet('Info Generali', { views: [{ showGridLines: true }] });
  wsInfo.columns = [
    { width: 28 }, // Col A: Parametro
    { width: 35 }, // Col B: Valore (parte 1)
    { width: 25 }, // Col C: Valore (parte 2)
    { width: 35 }, // Col D: Valore (parte 3)
  ];

  // Riga 1: Title Banner A1:D1
  wsInfo.mergeCells('A1:D1');
  const titleCell = wsInfo.getCell('A1');
  titleCell.value = 'T7 WORKOUT — SCHEDA DI PROGRAMMAZIONE CLINICA E SPORTIVA';
  wsInfo.getRow(1).height = 38;
  applyStyles(titleCell, {
    fillColor: '1E293B',
    fontColor: 'FFFFFF',
    fontSize: 14,
    bold: true,
    hAlign: 'center',
    vAlign: 'middle',
  });

  wsInfo.getRow(2).height = 12;

  // Sezione 1: Dati Atleta e Parametri di Base
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
    vAlign: 'middle',
  });

  const metadataItems: [string, string][] = [
    ['Nome Atleta', athleteName],
    ['Sport Praticato', safeVal(program.sport, 'Generale')],
    ['Obiettivo Principale', safeVal(program.goal, 'Ipertrofia & Forza')],
    ['Durata Totale', `${durationWeeks} settimane`],
    ['Frequenza Settimanale', `${daysPerWeek} giorni/settimana`],
    ['Livello Rischio Clinico', safeVal(program.riskProfile?.level?.toUpperCase(), 'LOW')],
    ['Punteggio Rischio', String(program.riskProfile?.score ?? 0)],
    [
      'Patologie / Condizioni Rilevate',
      program.riskProfile?.notes && program.riskProfile.notes.length > 0
        ? program.riskProfile.notes.join('; ')
        : 'Nessuna controindicazione rilevata',
    ],
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
      vAlign: 'middle',
    });

    const vCell = wsInfo.getCell(`B${rowIdx}`);
    vCell.value = val;
    applyStyles(vCell, {
      fillColor: 'FFFFFF',
      fontColor: '1E293B',
      fontSize: 10,
      hAlign: 'left',
      vAlign: 'middle',
      wrapText: true,
    });

    ['C', 'D'].forEach((col) => {
      applyStyles(wsInfo.getCell(`${col}${rowIdx}`), { fillColor: 'FFFFFF', border: true });
    });

    rowIdx++;
  });

  wsInfo.getRow(rowIdx).height = 14;
  rowIdx++;

  // Sezione 2: Metodologia e Razionale Clinico
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
    vAlign: 'middle',
  });
  rowIdx++;

  const methItems: [string, string][] = [
    ['Metodo Periodizzazione', safeVal(program.periodizationMethod, 'Daily Undulating Periodization')],
    ['Razionale Metodologico', safeVal(program.rationale?.periodizationArchitecture, 'Ottimizzazione del recupero neurale e tissutale')],
    [
      'Riferimenti Scientifici',
      program.rationale?.citations && program.rationale.citations.length > 0
        ? program.rationale.citations.join('; ')
        : 'Schoenfeld et al. (2021); Rhea et al. (2002); Helms et al. (2018)',
    ],
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
      vAlign: 'middle',
    });

    const vCell = wsInfo.getCell(`B${rowIdx}`);
    vCell.value = val;
    applyStyles(vCell, {
      fillColor: 'FFFFFF',
      fontColor: '1E293B',
      fontSize: 10,
      hAlign: 'left',
      vAlign: 'middle',
      wrapText: true,
    });

    ['C', 'D'].forEach((col) => {
      applyStyles(wsInfo.getCell(`${col}${rowIdx}`), { fillColor: 'FFFFFF', border: true });
    });

    rowIdx++;
  });

  // ─────────────────────────────────────────────────────────────
  // TAB 2: "Timeline"
  // ─────────────────────────────────────────────────────────────
  const wsTimeline = workbook.addWorksheet('Timeline', { views: [{ showGridLines: true }] });
  wsTimeline.columns = [
    { width: 16 }, // Fase
    { width: 20 }, // Settimane
    { width: 22 }, // Volume
    { width: 22 }, // Intensita
    { width: 50 }, // Focus
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
    vAlign: 'middle',
  });

  // Intestazioni Colonne
  const tCols = ['Fase', 'Settimane', 'Volume', 'Intensità', 'Focus Metodologico'];
  wsTimeline.getRow(3).height = 24;
  tCols.forEach((colName, colI) => {
    const colLetter = String.fromCharCode(65 + colI);
    const cell = wsTimeline.getCell(`${colLetter}3`);
    cell.value = colName;
    applyStyles(cell, {
      fillColor: '0F766E',
      fontColor: 'FFFFFF',
      fontSize: 10,
      bold: true,
      hAlign: colI === 4 ? 'left' : 'center',
      vAlign: 'middle',
    });
  });

  let tRowIdx = 4;
  program.phases.forEach((phase, idx) => {
    const row = wsTimeline.getRow(tRowIdx);
    row.height = 22;
    const bg = idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';

    const rowValues = [
      `Fase ${phase.phaseIndex}`,
      `${phase.durationWeeks} sett.`,
      safeVal(phase.volumeTier || 'Medio'),
      `${phase.intensityPctRange[0]}% - ${phase.intensityPctRange[1]}% 1RM (RPE ${phase.rpeCap})`,
      safeVal(phase.weeklyFocus),
    ];

    rowValues.forEach((val, colI) => {
      const colLetter = String.fromCharCode(65 + colI);
      const cell = wsTimeline.getCell(`${colLetter}${tRowIdx}`);
      cell.value = val;
      applyStyles(cell, {
        fillColor: bg,
        fontColor: '1E293B',
        fontSize: 10,
        bold: colI === 0,
        hAlign: colI === 4 ? 'left' : 'center',
        vAlign: 'middle',
      });
    });

    tRowIdx++;
  });

  // ─────────────────────────────────────────────────────────────
  // TAB 3+: Phase Sheets ("Fase 1", "Fase 2", etc.) — Foto 5
  // ─────────────────────────────────────────────────────────────
  program.phases.forEach((phase) => {
    const rawPhaseName = `Fase ${phase.phaseIndex} - ${phase.name}`;
    const sheetName = `Fase ${phase.phaseIndex}`.substring(0, 31);

    const wsPhase = workbook.addWorksheet(sheetName, { views: [{ showGridLines: true }] });
    wsPhase.columns = [
      { width: 6 },  // #
      { width: 34 }, // Esercizio
      { width: 16 }, // Tipo
      { width: 10 }, // Serie
      { width: 14 }, // Ripetizioni
      { width: 12 }, // Recupero
      { width: 10 }, // RPE
      { width: 12 }, // Tempo
      { width: 12 }, // Carico
      { width: 12 }, // Adattato?
      { width: 40 }, // Note Coach
    ];

    // Riga 1: Phase Name Block Banner Verde (Foto 5)
    wsPhase.mergeCells('A1:K1');
    const p1Cell = wsPhase.getCell('A1');
    p1Cell.value = rawPhaseName.toUpperCase();
    wsPhase.getRow(1).height = 36;
    applyStyles(p1Cell, {
      fillColor: '047857', // Smeraldo scuro professionale
      fontColor: 'FFFFFF',
      fontSize: 14,
      bold: true,
      hAlign: 'center',
      vAlign: 'middle',
    });

    // Riga 2: Settimane / Focus
    wsPhase.mergeCells('A2:K2');
    const p2Cell = wsPhase.getCell('A2');
    p2Cell.value = `Durata: ${phase.durationWeeks} Settimane  |  Focus: ${safeVal(phase.weeklyFocus)}`;
    wsPhase.getRow(2).height = 24;
    applyStyles(p2Cell, {
      fillColor: '334155', // Slate scuro
      fontColor: 'FFFFFF',
      fontSize: 11,
      bold: true,
      hAlign: 'center',
      vAlign: 'middle',
    });

    // Riga 3: Obiettivo
    wsPhase.mergeCells('A3:K3');
    const p3Cell = wsPhase.getCell('A3');
    p3Cell.value = `Obiettivo Clinico & Prestazionale: Intensità target ${phase.intensityPctRange[0]}-${phase.intensityPctRange[1]}% 1RM, RPE Cap ${phase.rpeCap}`;
    wsPhase.getRow(3).height = 22;
    applyStyles(p3Cell, {
      fillColor: 'F8FAFC',
      fontColor: '334155',
      fontSize: 10,
      italic: true,
      hAlign: 'left',
      vAlign: 'middle',
    });

    // Riga 4: Spaziatore
    wsPhase.getRow(4).height = 12;

    let pRowIdx = 5;

    phase.sessions.forEach((session, dayIdx) => {
      // Day Header A:K Blu Scuro (Foto 5)
      wsPhase.mergeCells(`A${pRowIdx}:K${pRowIdx}`);
      const dCell = wsPhase.getCell(`A${pRowIdx}`);
      const dayFocusText = session.focus ? ` — ${session.focus}` : '';
      dCell.value = `${safeVal(session.dayName, 'Giorno ' + (dayIdx + 1))}${dayFocusText}`;
      wsPhase.getRow(pRowIdx).height = 26;
      applyStyles(dCell, {
        fillColor: '0C4A6E', // Blue scuro
        fontColor: 'FFFFFF',
        fontSize: 11,
        bold: true,
        hAlign: 'left',
        vAlign: 'middle',
      });
      ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].forEach((c) => {
        applyStyles(wsPhase.getCell(`${c}${pRowIdx}`), { fillColor: '0C4A6E', border: true });
      });
      pRowIdx++;

      // Intestazioni Colonne Tabella Esercizi Azzurre (Foto 5)
      const exCols = [
        '#',
        'Esercizio',
        'Tipo',
        'Serie',
        'Ripetizioni',
        'Recupero',
        'RPE',
        'Tempo',
        'Carico',
        'Adattato?',
        'Note Coach',
      ];
      wsPhase.getRow(pRowIdx).height = 24;
      exCols.forEach((colName, colI) => {
        const colLetter = String.fromCharCode(65 + colI);
        const cell = wsPhase.getCell(`${colLetter}${pRowIdx}`);
        cell.value = colName;
        applyStyles(cell, {
          fillColor: '0284C7', // Sky Blue scuro
          fontColor: 'FFFFFF',
          fontSize: 10,
          bold: true,
          hAlign: colI === 1 || colI === 10 ? 'left' : 'center',
          vAlign: 'middle',
        });
      });
      pRowIdx++;

      let itemIndex = 1;

      // 1. Righe Riscaldamento (Giallo tenue)
      session.warmup.forEach((w) => {
        const r = wsPhase.getRow(pRowIdx);
        r.height = 22;
        const rowValues = [
          itemIndex++,
          `${w.name} (Riscaldamento)`,
          'Riscaldamento',
          w.sets,
          w.reps,
          `${w.restSec}s`,
          w.rpe,
          safeVal(w.tempo, '2-0-2-0'),
          '-',
          'NO',
          safeVal(w.notes, 'Attivazione dinamica'),
        ];

        rowValues.forEach((val, colI) => {
          const colLetter = String.fromCharCode(65 + colI);
          const cell = wsPhase.getCell(`${colLetter}${pRowIdx}`);
          cell.value = val;
          applyStyles(cell, {
            fillColor: 'FEF3C7', // Giallo ambra tenue
            fontColor: '92400E',
            fontSize: 10,
            bold: colI === 1,
            hAlign: colI === 1 || colI === 10 ? 'left' : 'center',
            vAlign: 'middle',
            wrapText: colI === 1 || colI === 10,
          });
        });
        pRowIdx++;
      });

      // 2. Righe Esercizi Principali
      session.exercises.forEach((ex, exIdx) => {
        const r = wsPhase.getRow(pRowIdx);
        r.height = 22;
        const bg = exIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
        const isAdapted = ex.category === 'Clinical' || (ex.notes ? ex.notes.toLowerCase().includes('adatt') : false);

        const rowValues = [
          itemIndex++,
          ex.name,
          safeVal(ex.category, 'Principale'),
          ex.sets,
          ex.reps,
          `${ex.restSec}s`,
          ex.rpe,
          safeVal(ex.tempo, '3-0-1-0'),
          ex.loadPct1RM ? `${ex.loadPct1RM}%` : '-',
          isAdapted ? 'SÌ' : 'NO',
          safeVal(ex.notes, 'Esecuzione controllata'),
        ];

        rowValues.forEach((val, colI) => {
          const colLetter = String.fromCharCode(65 + colI);
          const cell = wsPhase.getCell(`${colLetter}${pRowIdx}`);
          cell.value = val;
          applyStyles(cell, {
            fillColor: isAdapted ? 'FFFBEB' : bg,
            fontColor: isAdapted ? 'B45309' : '1E293B',
            fontSize: 10,
            bold: isAdapted && colI === 9,
            hAlign: colI === 1 || colI === 10 ? 'left' : 'center',
            vAlign: 'middle',
            wrapText: colI === 1 || colI === 10,
          });
        });
        pRowIdx++;
      });

      // 3. Righe Defaticamento (Azzurrino tenue)
      session.cooldown.forEach((c) => {
        const r = wsPhase.getRow(pRowIdx);
        r.height = 22;
        const rowValues = [
          itemIndex++,
          `${c.name} (Defaticamento)`,
          'Defaticamento',
          c.sets,
          c.reps,
          `${c.restSec}s`,
          c.rpe,
          safeVal(c.tempo, 'Statico'),
          '-',
          'NO',
          safeVal(c.notes, 'Decompressione tissutale'),
        ];

        rowValues.forEach((val, colI) => {
          const colLetter = String.fromCharCode(65 + colI);
          const cell = wsPhase.getCell(`${colLetter}${pRowIdx}`);
          cell.value = val;
          applyStyles(cell, {
            fillColor: 'F0F9FF', // Azzurrino tenue
            fontColor: '1E3A8A',
            fontSize: 10,
            bold: colI === 1,
            hAlign: colI === 1 || colI === 10 ? 'left' : 'center',
            vAlign: 'middle',
            wrapText: colI === 1 || colI === 10,
          });
        });
        pRowIdx++;
      });

      // Spaziatore tra sedute
      wsPhase.getRow(pRowIdx).height = 10;
      pRowIdx++;
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TAB FINALE: "Spiegazioni Tecniche"
  // ─────────────────────────────────────────────────────────────
  const wsExp = workbook.addWorksheet('Spiegazioni Tecniche', { views: [{ showGridLines: true }] });
  wsExp.columns = [
    { width: 20 }, // Categoria
    { width: 32 }, // Parametro / Esercizio
    { width: 65 }, // Spiegazione Tecnica
  ];

  // Banner A1:C1
  wsExp.mergeCells('A1:C1');
  const expBanner = wsExp.getCell('A1');
  expBanner.value = 'GUIDA METODOLOGICA E SPIEGAZIONI TECNICHE';
  wsExp.getRow(1).height = 36;
  applyStyles(expBanner, {
    fillColor: '1E293B',
    fontColor: 'FFFFFF',
    fontSize: 14,
    bold: true,
    hAlign: 'center',
    vAlign: 'middle',
  });

  const expCols = ['Categoria', 'Parametro', 'Spiegazione Tecnica & Indicazioni Cliniche'];
  wsExp.getRow(3).height = 24;
  expCols.forEach((colName, colI) => {
    const colLetter = String.fromCharCode(65 + colI);
    const cell = wsExp.getCell(`${colLetter}3`);
    cell.value = colName;
    applyStyles(cell, {
      fillColor: '0F766E',
      fontColor: 'FFFFFF',
      fontSize: 10,
      bold: true,
      hAlign: colI === 0 ? 'center' : 'left',
      vAlign: 'middle',
    });
  });

  const explanations: [string, string, string][] = [
    ['Parametri', 'RPE (Rating of Perceived Exertion)', 'Scala da 1 a 10 per quantificare lo sforzo percepito e le ripetizioni in riserva (RIR = 10 - RPE).'],
    ['Parametri', 'Tempo (Es. 3-0-1-0)', 'Notazione della velocità di contrazione: fase eccentrica - pausa isometrica - fase concentrica - pausa in contrazione.'],
    ['Parametri', 'Carico (% 1RM)', 'Percentuale stimata rispetto al massimale teorico calcolato con equazioni validated (Brzycki / Epley).'],
    ['Clinica', 'Adattamenti Articolari', 'Modifiche a ROM, angoli o piani di lavoro per preservare strutture lese o in fase di rimodellamento.'],
    ['Periodizzazione', 'DUP (Daily Undulating)', 'Variazione sistematica del volume e dell intensità tra le sedute della stessa settimana per prevenire l assuefazione.'],
  ];

  let expRowIdx = 4;
  explanations.forEach(([cat, param, desc], idx) => {
    const row = wsExp.getRow(expRowIdx);
    row.height = 24;
    const bg = idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';

    [cat, param, desc].forEach((val, colI) => {
      const colLetter = String.fromCharCode(65 + colI);
      const cell = wsExp.getCell(`${colLetter}${expRowIdx}`);
      cell.value = val;
      applyStyles(cell, {
        fillColor: bg,
        fontColor: '1E293B',
        fontSize: 10,
        bold: colI === 1,
        hAlign: colI === 0 ? 'center' : 'left',
        vAlign: 'middle',
        wrapText: colI === 2,
      });
    });

    expRowIdx++;
  });

  // ─────────────────────────────────────────────────────────────
  // DOWNLOAD BROWSER FILE .xlsx
  // ─────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const goalSanitized = (program.goal || 'Programma').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const finalFileName = customFileName || `Programma_T7_${athleteName.replace(/\s+/g, '_')}_${goalSanitized}_${dateStr}.xlsx`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = finalFileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Pulisce e formatta le stringhe per l'output in formato CSV.
 */
function sanitizeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Esporta il programma di allenamento in formato CSV strutturato (Fallback).
 *
 * @param program - Oggetto WorkoutProgram generato
 * @returns Stringa formattata CSV
 */
export function exportProgramToCSV(program: WorkoutProgram): string {
  const lines: string[] = [];

  lines.push('T7 WORKOUT PLATFORM — REPORT SCIENTIFICO SCHEDA DI ALLENAMENTO');
  lines.push(`Atleta,${sanitizeCell(program.athleteName)}`);
  const durationWeeks = program.durationWeeks ?? program.totalWeeks ?? 12;
  const daysPerWeek = program.daysPerWeek ?? program.phases[0]?.sessions.length ?? 3;
  lines.push(`Durata Totale,${durationWeeks} settimane`);
  lines.push(`Frequenza,${daysPerWeek} giorni/settimana`);
  lines.push(`Livello Rischio Clinico,${sanitizeCell(program.riskProfile?.level)}`);
  lines.push(`Punteggio Rischio,${program.riskProfile?.score ?? 0}`);
  lines.push('');

  lines.push('MACROCICLO — PIANIFICAZIONE DELLE FASI');
  lines.push('Fase,Nome Fase,Durata (Settimane),Focus Settimanale,Intensita Range (% 1RM),Cap RPE');
  program.phases.forEach((phase) => {
    lines.push([
      phase.phaseIndex,
      sanitizeCell(phase.name),
      phase.durationWeeks,
      sanitizeCell(phase.weeklyFocus),
      `"${phase.intensityPctRange[0]}% - ${phase.intensityPctRange[1]}%"`,
      phase.rpeCap,
    ].join(','));
  });
  lines.push('');

  lines.push('SCHEDA DI ALLENAMENTO DETTAGLIATA — ESERCIZI E SPECIFICHE');
  lines.push('Fase,Giorno,Focus Seduta,Tipologia,Nome Esercizio,Serie,Ripetizioni,Carico (% 1RM),RPE,Pausa (sec),Tempo,Note Biomeccaniche');

  program.phases.forEach((phase) => {
    phase.sessions.forEach((session) => {
      session.warmup.forEach((w) => {
        lines.push([
          phase.phaseIndex,
          sanitizeCell(session.dayName),
          sanitizeCell(session.focus),
          'Riscaldamento',
          sanitizeCell(w.name),
          w.sets,
          sanitizeCell(w.reps),
          '-',
          w.rpe,
          w.restSec,
          sanitizeCell(w.tempo),
          sanitizeCell(w.notes || ''),
        ].join(','));
      });

      session.exercises.forEach((ex) => {
        lines.push([
          phase.phaseIndex,
          sanitizeCell(session.dayName),
          sanitizeCell(session.focus),
          sanitizeCell(ex.category),
          sanitizeCell(ex.name),
          ex.sets,
          sanitizeCell(ex.reps),
          ex.loadPct1RM ? `${ex.loadPct1RM}%` : '-',
          ex.rpe,
          ex.restSec,
          sanitizeCell(ex.tempo),
          sanitizeCell(ex.notes || ''),
        ].join(','));
      });

      session.cooldown.forEach((c) => {
        lines.push([
          phase.phaseIndex,
          sanitizeCell(session.dayName),
          sanitizeCell(session.focus),
          'Defaticamento',
          sanitizeCell(c.name),
          c.sets,
          sanitizeCell(c.reps),
          '-',
          c.rpe,
          c.restSec,
          sanitizeCell(c.tempo),
          sanitizeCell(c.notes || ''),
        ].join(','));
      });
    });
  });

  return lines.join('\n');
}

/**
 * Avvia il download rapido nel browser (reindirizza verso exportProgramToExcel).
 *
 * @param program - Oggetto WorkoutProgram generato
 * @param fileName - Nome file opzionale
 */
export function downloadProgramSpreadsheet(
  program: WorkoutProgram,
  fileName?: string
): void {
  exportProgramToExcel(program, fileName).catch((err: unknown) => {
    console.error('Errore durante esportazione Excel XLSX:', err);
    try {
      const csvContent = exportProgramToCSV(program);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const athleteSlug = (program.athleteName || 'Atleta').replace(/\s+/g, '_');
      a.download = `Programma_T7_${athleteSlug}_fallback.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (fallbackErr: unknown) {
      console.error('Errore durante fallback CSV:', fallbackErr);
    }
  });
}
