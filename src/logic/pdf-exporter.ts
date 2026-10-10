/**
 * src/logic/pdf-exporter.ts
 * Modulo per la generazione del Dossier di Stampa Professionale A4 e PDF delle schede di allenamento.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola 02: Single responsibility, modularita, nessun numero magico.
 * - Regola R1: Zero any, TypeScript strict.
 * - Specifiche: piano_miglioramento_pdf_programmazione.md (Dossier A4 compatto 3-5 pagine,
 *   tutte le fasi incluse, layout tabellare puro, box di logging carichi reali, controllo salti pagina).
 */

import type { WorkoutProgram } from '../types/program';
import { cleanCitationList } from './citation-cleaner';

const DEFAULT_ESTIMATED_DURATION_MIN = 60;

/**
 * Costruisce l'intero documento HTML per la stampa ad alta densita A4.
 *
 * @param program - Oggetto WorkoutProgram con tutte le fasi e sedute
 * @returns Stringa HTML completa formattata per stampa/salvataggio PDF
 */
export function buildPrintDossierHtml(program: WorkoutProgram): string {
  const durationWeeks = program.durationWeeks ?? program.totalWeeks ?? 12;
  const daysPerWeek = program.daysPerWeek ?? program.phases[0]?.sessions.length ?? 3;
  const formattedDate = new Date(program.createdAt || program.generatedAt || Date.now()).toLocaleDateString('it-IT');
  const cleanedCitations = cleanCitationList(program.rationale?.citations || []);

  // Calcolo timeline progressiva delle settimane
  let cumulativeWeek = 1;
  const phaseTimeline = program.phases.map((phase) => {
    const startWeek = cumulativeWeek;
    const endWeek = cumulativeWeek + phase.durationWeeks - 1;
    cumulativeWeek = endWeek + 1;
    return {
      phase,
      startWeek,
      endWeek,
      weekLabel: startWeek === endWeek ? `Sett. ${startWeek}` : `Sett. ${startWeek} - ${endWeek}`
    };
  });

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Scheda di Allenamento — ${program.athleteName || 'Atleta'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 8.5pt;
      line-height: 1.35;
    }

    /* Intestazione Cover / Briefing */
    .master-header {
      border-bottom: 2pt solid #0f172a;
      padding-bottom: 6pt;
      margin-bottom: 10pt;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .master-header h1 {
      font-size: 15pt;
      font-weight: 800;
      margin: 0;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .master-header .sub-title {
      font-size: 8.5pt;
      color: #475569;
      margin-top: 2pt;
    }

    .master-header .doc-meta {
      font-size: 8pt;
      color: #64748b;
      text-align: right;
    }

    /* Griglia Passaporto Atleta */
    .passport-card {
      background: #f8fafc;
      border: 1pt solid #cbd5e1;
      border-radius: 3pt;
      padding: 7pt 9pt;
      margin-bottom: 10pt;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5pt 10pt;
      font-size: 8.5pt;
    }

    .passport-item strong {
      color: #334155;
    }

    /* Sezioni Master e Titoli */
    .section-title {
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1pt solid #cbd5e1;
      padding-bottom: 2pt;
      margin: 9pt 0 5pt 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    /* Tabelle Generali ad Alta Densita */
    table {
      display: table !important;
      width: 100% !important;
      border-collapse: collapse !important;
      margin-bottom: 8pt;
      font-size: 8pt;
    }

    thead {
      display: table-header-group !important;
    }

    tbody {
      display: table-row-group !important;
    }

    tr {
      display: table-row !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    th, td {
      display: table-cell !important;
      border: 0.75pt solid #cbd5e1 !important;
      padding: 3.5pt 5pt !important;
      vertical-align: middle !important;
      text-align: left;
    }

    th {
      background-color: #f1f5f9 !important;
      font-weight: 700 !important;
      color: #0f172a !important;
      font-size: 7.5pt !important;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    td::before {
      content: none !important;
      display: none !important;
    }

    .text-center {
      text-align: center !important;
    }

    /* Griglia Rationale a 4 Blocchi */
    .rationale-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6pt;
      margin-bottom: 8pt;
    }

    .rationale-box {
      border: 0.75pt solid #cbd5e1;
      border-radius: 3pt;
      background: #f8fafc;
      padding: 5pt 7pt;
      font-size: 8pt;
      break-inside: avoid;
    }

    .rationale-box .r-title {
      font-size: 7.5pt;
      font-weight: 700;
      color: #1e40af;
      text-transform: uppercase;
      display: block;
      margin-bottom: 2pt;
    }

    /* Box Note Cliniche */
    .clinical-alert-box {
      border: 1pt solid #d97706;
      background: #fffbeb;
      border-radius: 3pt;
      padding: 6pt 8pt;
      margin-bottom: 8pt;
      font-size: 8pt;
      color: #92400e;
    }

    /* Salti Pagina Puliti */
    .page-break {
      break-after: page !important;
      page-break-after: always !important;
      height: 0;
      margin: 0;
      padding: 0;
    }

    /* Banner di Fase */
    .phase-banner {
      background: #0f172a;
      color: #ffffff;
      padding: 5pt 8pt;
      border-radius: 3pt;
      margin: 10pt 0 7pt 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      break-after: avoid;
      page-break-after: avoid;
    }

    .phase-banner h2 {
      font-size: 9.5pt;
      font-weight: 800;
      margin: 0;
      letter-spacing: 0.02em;
    }

    .phase-banner .phase-meta {
      font-size: 8pt;
      color: #93c5fd;
    }

    /* Card Seduta Giornaliera */
    .day-card {
      border: 0.75pt solid #cbd5e1;
      border-radius: 3pt;
      background: #ffffff;
      padding: 6pt 8pt 4pt 8pt;
      margin-bottom: 8pt;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .day-header {
      border-bottom: 0.75pt solid #e2e8f0;
      padding-bottom: 3pt;
      margin-bottom: 4pt;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .day-title {
      font-size: 9pt;
      font-weight: 700;
      color: #0f172a;
    }

    .day-focus {
      font-size: 8pt;
      color: #475569;
    }

    .aux-routine {
      font-size: 7.5pt;
      color: #475569;
      background: #f8fafc;
      border: 0.5pt solid #e2e8f0;
      border-radius: 2pt;
      padding: 2.5pt 5pt;
      margin-bottom: 4pt;
    }

    .badge-cat {
      display: inline-block;
      font-size: 7pt;
      font-weight: 600;
      padding: 1pt 3pt;
      border-radius: 2pt;
      background: #e2e8f0;
      color: #334155;
    }

    .ex-note {
      font-size: 7pt;
      color: #64748b;
      margin-top: 1pt;
    }

    .log-box {
      font-family: monospace;
      font-size: 7.5pt;
      color: #64748b;
      background: #f8fafc;
      border: 0.5pt dashed #cbd5e1;
      border-radius: 2pt;
      padding: 2pt 4pt;
      text-align: center;
      white-space: nowrap;
    }

    /* Bibliografia Finale */
    .bib-section {
      margin-top: 8pt;
      border-top: 1pt solid #cbd5e1;
      padding-top: 6pt;
      break-inside: avoid;
    }

    .bib-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3pt 8pt;
      font-size: 7.25pt;
      color: #475569;
      margin-top: 4pt;
      line-height: 1.3;
    }

    /* Running Footer Istituzionale */
    .dossier-footer {
      border-top: 0.75pt solid #cbd5e1;
      padding-top: 4pt;
      margin-top: 10pt;
      font-size: 7pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }

    /* Barra di controllo su schermo (nascosta in stampa) */
    .no-print {
      display: flex;
    }

    @media print {
      .no-print {
        display: none !important;
      }
    }

    .screen-preview-bar {
      background: #0f172a;
      color: #f8fafc;
      padding: 7pt 14pt;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 9999;
      box-shadow: 0 2pt 8pt rgba(0,0,0,0.25);
      font-size: 8.5pt;
      border-bottom: 1pt solid #334155;
      margin-bottom: 10pt;
    }

    .btn-preview-print {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 4.5pt 10pt;
      border-radius: 3pt;
      font-weight: 700;
      font-size: 8pt;
      cursor: pointer;
      margin-right: 6pt;
    }

    .btn-preview-close {
      background: #334155;
      color: #cbd5e1;
      border: none;
      padding: 4.5pt 9pt;
      border-radius: 3pt;
      font-size: 8pt;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <!-- Barra di Controllo Schermo (Esclusa dal PDF stampato) -->
  <div class="screen-preview-bar no-print">
    <div>
      <strong>T7 WORKOUT PLATFORM</strong> &bull; Anteprima Dossier A4 &bull; ${program.athleteName || 'Atleta'}
    </div>
    <div>
      <button type="button" onclick="triggerPrintNow()" class="btn-preview-print">Stampa / Salva in PDF</button>
      <button type="button" onclick="window.close()" class="btn-preview-close">Chiudi</button>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- PAGINA 1: SCHEDA MASTER & ARCHITETTURA MACROCICLO           -->
  <!-- ============================================================ -->
  <div class="master-header">
    <div>
      <h1>T7 WORKOUT PLATFORM</h1>
      <div class="sub-title">Dossier Scientifico di Programmazione e Periodizzazione Biomeccanica</div>
    </div>
    <div class="doc-meta">
      <div>Data: <strong>${formattedDate}</strong></div>
      <div>Atleta: <strong>${program.athleteName || 'N/D'}</strong></div>
    </div>
  </div>

  <!-- Passaporto Atleta -->
  <div class="passport-card">
    <div class="passport-item"><strong>Atleta:</strong> ${program.athleteName || 'Atleta'}</div>
    <div class="passport-item"><strong>Disciplina:</strong> ${program.sport || 'Generale'}</div>
    <div class="passport-item"><strong>Obiettivo:</strong> ${program.goal}</div>
    <div class="passport-item"><strong>Metodo:</strong> ${program.periodizationMethod}</div>
    <div class="passport-item"><strong>Durata:</strong> ${durationWeeks} Settimane (${program.phases.length} Fasi)</div>
    <div class="passport-item"><strong>Frequenza:</strong> ${daysPerWeek} Sedute / Settimana</div>
    <div class="passport-item"><strong>Rischio Clinico:</strong> ${(program.riskProfile?.level || 'low').toUpperCase()} (${program.riskProfile?.score ?? 0} pt)</div>
    <div class="passport-item"><strong>Condizioni:</strong> ${program.riskProfile?.activePathologyCount ?? 0} attive</div>
    <div class="passport-item"><strong>Stato Clinico:</strong> ${program.riskProfile?.criticalCategoryPresent ? 'Monitoraggio Alto' : 'Idoneo'}</div>
  </div>

  <!-- Timeline Macrociclo a Settimane -->
  <div class="section-title">Timeline Settimane &amp; Suddivisione Macrociclo</div>
  <table>
    <thead>
      <tr>
        <th style="width: 14%;">Settimane</th>
        <th style="width: 26%;">Fase &amp; Obiettivo</th>
        <th style="width: 12%;">Volume</th>
        <th style="width: 18%;">Intensita Target</th>
        <th style="width: 10%;">Cap RPE</th>
        <th style="width: 20%;">Focus Metodologico</th>
      </tr>
    </thead>
    <tbody>
      ${phaseTimeline
        .map(
          ({ phase, weekLabel }) => `
        <tr>
          <td><strong>${weekLabel}</strong><br><small style="color: #64748b;">(${phase.durationWeeks} sett.)</small></td>
          <td><strong>Fase ${phase.phaseIndex}: ${phase.name}</strong>${phase.kneeRomLimitDeg ? `<br><small style="color: #059669;">ROM Ginocchio: ${phase.kneeRomLimitDeg} deg</small>` : ''}</td>
          <td>${phase.volumeTier}</td>
          <td>${phase.intensityPctRange[0]}% - ${phase.intensityPctRange[1]}% 1RM</td>
          <td>RPE &le; ${phase.rpeCap}</td>
          <td>${phase.weeklyFocus}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <!-- Rationale Scientifico - 4 Pilastri -->
  <div class="section-title">Rationale Scientifico &amp; Logica di Allenamento AI</div>
  <div class="rationale-grid">
    <div class="rationale-box">
      <span class="r-title">1. Profilo Atleta &amp; Contesto</span>
      <div>${program.rationale.athleteProfile}</div>
    </div>
    <div class="rationale-box">
      <span class="r-title">2. Architettura di Periodizzazione</span>
      <div>${program.rationale.periodizationArchitecture}</div>
    </div>
    <div class="rationale-box">
      <span class="r-title">3. Prescrizioni Biomeccaniche</span>
      <div>${program.rationale.biomechanicalPrescriptions}</div>
    </div>
    <div class="rationale-box">
      <span class="r-title">4. Strategia Velocity-Based Training</span>
      <div>${program.rationale.vbtStrategy}</div>
    </div>
  </div>

  <!-- Prescrizioni di Sicurezza Clinica (se presenti) -->
  ${
    program.riskProfile.notes.length > 0
      ? `
    <div class="clinical-alert-box">
      <strong>Prescrizioni di Sicurezza Clinica e Tutela Articolare:</strong>
      <ul style="margin: 2pt 0 0 0; padding-left: 12pt;">
        ${program.riskProfile.notes.map((n) => `<li>${n}</li>`).join('')}
      </ul>
    </div>
  `
      : ''
  }

  <!-- Salto pagina dopo la scheda master per avviare le schede operative su pagina pulita -->
  <div class="page-break"></div>

  <!-- ============================================================ -->
  <!-- PAGINE 2..N: SCHEDE OPERATIVE DELLE SEDUTE (TUTTE LE FASI)   -->
  <!-- ============================================================ -->
  ${phaseTimeline
    .map(
      ({ phase, weekLabel }) => `
    <div class="phase-banner">
      <h2>FASE ${phase.phaseIndex}: ${phase.name.toUpperCase()} (${weekLabel} &bull; ${phase.durationWeeks} sett.)</h2>
      <div class="phase-meta">
        Intensita: ${phase.intensityPctRange[0]}% - ${phase.intensityPctRange[1]}% 1RM &bull; Cap RPE: ${phase.rpeCap}
        ${phase.kneeRomLimitDeg ? `&bull; ROM: ${phase.kneeRomLimitDeg} deg` : ''}
      </div>
    </div>

    ${phase.sessions
      .map(
        (session) => `
      <div class="day-card">
        <div class="day-header">
          <div class="day-title">${session.dayName}</div>
          <div class="day-focus">Focus: <strong>${session.focus}</strong> (~${session.estimatedDurationMin || DEFAULT_ESTIMATED_DURATION_MIN} min)</div>
        </div>

        ${
          session.warmup.length > 0
            ? `
          <div class="aux-routine">
            <strong>Riscaldamento Dinamico:</strong>
            ${session.warmup.map((w) => `${w.name} (${w.sets}x${w.reps})`).join(' &bull; ')}
          </div>
        `
            : ''
        }

        <table>
          <thead>
            <tr>
              <th style="width: 27%;">Esercizio</th>
              <th style="width: 8%;">Cat.</th>
              <th style="width: 8%;" class="text-center">Serie</th>
              <th style="width: 9%;" class="text-center">Reps</th>
              <th style="width: 10%;" class="text-center">Carico %</th>
              <th style="width: 7%;" class="text-center">RPE</th>
              <th style="width: 8%;" class="text-center">Recupero</th>
              <th style="width: 8%;" class="text-center">Tempo</th>
              <th style="width: 15%;" class="text-center">Carico Effettivo</th>
            </tr>
          </thead>
          <tbody>
            ${session.exercises
              .map(
                (ex) => `
              <tr>
                <td>
                  <strong>${ex.name}</strong>
                  ${ex.notes ? `<div class="ex-note">${ex.notes}</div>` : ''}
                </td>
                <td><span class="badge-cat">${ex.category}</span></td>
                <td class="text-center"><strong>${ex.sets}</strong></td>
                <td class="text-center">${ex.reps}</td>
                <td class="text-center">${ex.loadPct1RM ? `${ex.loadPct1RM}%` : (ex.loadKg ? `${ex.loadKg}kg` : '-')}</td>
                <td class="text-center">${ex.rpe}</td>
                <td class="text-center">${ex.restSec}s</td>
                <td class="text-center">${ex.tempo}</td>
                <td class="text-center"><span class="log-box">[ &nbsp; &nbsp; &nbsp; &nbsp; kg ]</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        ${
          session.cooldown.length > 0
            ? `
          <div class="aux-routine">
            <strong>Defaticamento:</strong>
            ${session.cooldown.map((c) => `${c.name} (${c.sets}x${c.reps})`).join(' &bull; ')}
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('')}
  `
    )
    .join('')}

  <!-- ============================================================ -->
  <!-- CALCE: RIFERIMENTI SCIENTIFICI & BIBLIOGRAFIA                -->
  <!-- ============================================================ -->
  ${
    cleanedCitations.length > 0
      ? `
    <div class="bib-section">
      <div style="font-weight: 700; font-size: 8pt; color: #0f172a; text-transform: uppercase;">
        Riferimenti Scientifici e Pubblicazioni Peer-Reviewed:
      </div>
      <div class="bib-grid">
        ${cleanedCitations.map((c) => `<div>&bull; ${c}</div>`).join('')}
      </div>
    </div>
  `
      : ''
  }

  <div class="dossier-footer">
    <div>T7 Sports Analytics Platform &bull; Documento generato ad uso professionale del preparatore atletico e chinesiologo.</div>
    <div>${formattedDate}</div>
  </div>

  <script>
    function triggerPrintNow() {
      window.focus();
      try {
        window.print();
      } catch (e) {
        console.warn('Auto-print prompt error:', e);
      }
    }

    // Esegui la stampa in automatico dopo che il DOM e i font sono pronti (gestione readyState per popup)
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(triggerPrintNow, 300);
    } else {
      window.addEventListener('DOMContentLoaded', function() {
        setTimeout(triggerPrintNow, 300);
      });
      window.addEventListener('load', function() {
        setTimeout(triggerPrintNow, 300);
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Attiva la stampa della scheda corrente generando una finestra standalone
 * formattata con impaginazione A4 pura e layout tabellare multi-fase.
 *
 * @param program - Oggetto WorkoutProgram generato
 */
export function printWorkoutProgram(program: WorkoutProgram): void {
  const html = buildPrintDossierHtml(program);
  const printWindow = window.open('', '_blank', 'width=1020,height=850');

  if (!printWindow) {
    // Fallback: se la popup e bloccata dal browser, stampa la pagina attiva
    window.print();
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  // Fallback trigger da contesto chiamante per browser che inibiscono script inline in popup document.write
  setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // Ignorato se la finestra e gia stata chiusa o ha gia avviato la stampa
    }
  }, 400);
}
