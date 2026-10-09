/**
 * src/logic/pdf-exporter.ts
 * Modulo per la stampa professionale e l'esportazione PDF delle schede di allenamento.
 * Inietta stili di stampa ad alta fedeltà con impaginazione pulita e avvia la stampa del browser.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import type { WorkoutProgram } from '../types/program';

/**
 * Attiva la stampa della scheda corrente tramite la finestra di stampa nativa del browser.
 * In alternativa genera una finestra popup standalone ottimizzata per il salvataggio PDF.
 *
 * @param program - Oggetto WorkoutProgram generato
 */
export function printWorkoutProgram(program: WorkoutProgram): void {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    // Fallback: stampa la pagina attiva
    window.print();
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Scheda di Allenamento — ${program.athleteName || 'Atleta'}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.4;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    h1 {
      font-size: 18pt;
      margin: 0 0 5px 0;
      color: #0f172a;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 15px;
      background: #f1f5f9;
      padding: 10px;
      border-radius: 4px;
      font-size: 9.5pt;
    }
    .phase-card {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .phase-title {
      font-size: 13pt;
      font-weight: 700;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .session-title {
      font-size: 11pt;
      font-weight: 600;
      margin: 10px 0 5px 0;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      text-align: left;
    }
    th {
      background: #e2e8f0;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: 600;
      background: #e2e8f0;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>T7 WORKOUT PLATFORM — SCHEDA DI ALLENAMENTO</h1>
    <div style="font-size: 9pt; color: #64748b;">Report Scientifico di Programmazione e Periodizzazione Biomeccanica</div>
  </div>

  <div class="meta-grid">
    <div><strong>Atleta:</strong> ${program.athleteName || 'N/D'}</div>
    <div><strong>Periodizzazione:</strong> ${program.periodizationMethod}</div>
    <div><strong>Durata:</strong> ${program.durationWeeks ?? program.totalWeeks ?? 12} settimane</div>
    <div><strong>Frequenza:</strong> ${program.daysPerWeek ?? program.phases[0]?.sessions.length ?? 3} giorni/settimana</div>
    <div><strong>Profilo Rischio:</strong> ${program.riskProfile.level} (${program.riskProfile.score} pt)</div>
    <div><strong>Data Generazione:</strong> ${new Date(program.createdAt || program.generatedAt || Date.now()).toLocaleDateString('it-IT')}</div>
  </div>

  ${program.phases
    .map(
      (phase) => `
    <div class="phase-card">
      <div class="phase-title">
        Fase ${phase.phaseIndex}: ${phase.name} (${phase.durationWeeks} sett.) — Focus: ${phase.weeklyFocus}
      </div>
      <div style="font-size: 9pt; color: #475569; margin-bottom: 8px;">
        Intensita: ${phase.intensityPctRange[0]}% - ${phase.intensityPctRange[1]}% 1RM | Cap RPE: ${phase.rpeCap}
      </div>

      ${phase.sessions
        .map(
          (session) => `
        <div class="session-title">${session.dayName} — Focus: ${session.focus}</div>
        <table>
          <thead>
            <tr>
              <th style="width: 35%;">Esercizio</th>
              <th style="width: 15%;">Tipo</th>
              <th style="width: 12%;">Serie x Reps</th>
              <th style="width: 10%;">Carico</th>
              <th style="width: 8%;">RPE</th>
              <th style="width: 10%;">Recupero</th>
              <th style="width: 10%;">Tempo</th>
            </tr>
          </thead>
          <tbody>
            ${session.exercises
              .map(
                (ex) => `
              <tr>
                <td><strong>${ex.name}</strong>${ex.notes ? `<br><small style="color: #64748b;">${ex.notes}</small>` : ''}</td>
                <td><span class="badge">${ex.category}</span></td>
                <td>${ex.sets} x ${ex.reps}</td>
                <td>${ex.loadPct1RM ? `${ex.loadPct1RM}%` : '-'}</td>
                <td>${ex.rpe}</td>
                <td>${ex.restSec}s</td>
                <td>${ex.tempo}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `
        )
        .join('')}
    </div>
  `
    )
    .join('')}

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
