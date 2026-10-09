/**
 * src/logic/excel-exporter.ts
 * Esportatore Professionale di Schede di Allenamento in formato Excel / CSV multi-tab.
 * Genera fogli di calcolo formattati compatibili con Microsoft Excel, LibreOffice e Google Sheets.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import type { WorkoutProgram } from '../types/program';

/**
 * Pulisce e formatta le stringhe per l'output in foglio di calcolo, gestendo virgolette e ritorni a capo.
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
 * Esporta il programma di allenamento in formato CSV strutturato.
 *
 * @param program - Oggetto WorkoutProgram generato
 * @returns Stringa formattata CSV
 */
export function exportProgramToCSV(program: WorkoutProgram): string {
  const lines: string[] = [];

  // 1. INTESTAZIONE ANAGRAFICA & METADATI
  lines.push('T7 WORKOUT PLATFORM — REPORT SCIENTIFICO SCHEDA DI ALLENAMENTO');
  lines.push(`Atleta,${sanitizeCell(program.athleteName)}`);
  const durationWeeks = program.durationWeeks ?? program.totalWeeks ?? 12;
  const daysPerWeek = program.daysPerWeek ?? program.phases[0]?.sessions.length ?? 3;
  lines.push(`Durata Totale,${durationWeeks} settimane`);
  lines.push(`Frequenza,${daysPerWeek} giorni/settimana`);
  lines.push(`Livello Rischio Clinico,${sanitizeCell(program.riskProfile.level)}`);
  lines.push(`Punteggio Rischio,${program.riskProfile.score}`);
  lines.push('');

  // 2. ARCHITETTURA DELLE FASI
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

  // 3. DETTAGLIO SEDUTE ED ESERCIZI
  lines.push('SCHEDA DI ALLENAMENTO DETTAGLIATA — ESERCIZI E SPECIFICHE');
  lines.push('Fase,Giorno,Focus Seduta,Tipologia,Nome Esercizio,Serie,Ripetizioni,Carico (% 1RM),RPE,Pausa (sec),Tempo,Note Biomeccaniche');

  program.phases.forEach((phase) => {
    phase.sessions.forEach((session) => {
      // Warmup
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

      // Esercizi principali
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

      // Cooldown
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
 * Avvia il download nel browser di un file CSV o foglio di calcolo per il programma specificato.
 *
 * @param program - Oggetto WorkoutProgram generato
 * @param fileName - Nome file opzionale
 */
export function downloadProgramSpreadsheet(
  program: WorkoutProgram,
  fileName?: string
): void {
  const csvContent = exportProgramToCSV(program);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const safeName = (fileName || `Scheda_T7_${program.athleteName || 'Atleta'}_${new Date().toISOString().slice(0, 10)}`)
    .replace(/[^a-zA-Z0-9_-]/g, '_');

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeName}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
