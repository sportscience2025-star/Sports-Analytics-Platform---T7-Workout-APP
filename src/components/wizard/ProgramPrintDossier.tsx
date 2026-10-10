/**
 * src/components/wizard/ProgramPrintDossier.tsx
 * Componente dedicato al rendering del Dossier Completo di Stampa A4 ad alta densita (Fasi 1..N).
 * Risiede nel DOM ma viene visualizzato ESCLUSIVAMENTE in fase di stampa (@media print).
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee nell'interfaccia.
 * - Regola 02: Single responsibility, modularita, commenti chiari, nessun numero magico.
 * - Regola R1: Zero any, TypeScript strict.
 * - Specifiche: piano_miglioramento_pdf_programmazione.md (Dossier A4 compatto 3-5 pagine,
 *   tutte le fasi incluse, layout tabellare puro, box [ _____ kg ], controllo salti pagina).
 */

import React from 'react';
import type { WorkoutProgram } from '../../types/program';
import { cleanCitationList } from '../../logic/citation-cleaner';

interface ProgramPrintDossierProps {
  program: WorkoutProgram;
  periodizationDetail?: {
    name: string;
    rationale: string;
    keyResearchers: string;
  };
}

const DEFAULT_ESTIMATED_DURATION_MIN = 60;
const DEFAULT_MACROCYCLE_WEEKS = 12;
const DEFAULT_DAYS_PER_WEEK = 3;

/**
 * Componente per il rendering del dossier cartaceo/PDF ad alta densita per la stampa A4.
 *
 * @param props - Oggetto con programma e dettagli opzionali di periodizzazione
 * @returns Elemento JSX del dossier A4 completo di tutte le fasi
 */
export const ProgramPrintDossier: React.FC<ProgramPrintDossierProps> = ({
  program,
  periodizationDetail
}) => {
  const durationWeeks = program.durationWeeks ?? program.totalWeeks ?? DEFAULT_MACROCYCLE_WEEKS;
  const daysPerWeek = program.daysPerWeek ?? program.phases[0]?.sessions.length ?? DEFAULT_DAYS_PER_WEEK;
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

  return (
    <div className="print-only-dossier" aria-hidden="true">
      {/* ============================================================ */}
      {/* PAGINA 1: SCHEDA MASTER & ARCHITETTURA MACROCICLO           */}
      {/* ============================================================ */}
      <div className="master-header">
        <div>
          <h1>T7 WORKOUT PLATFORM</h1>
          <div className="sub-title">Dossier Scientifico di Programmazione e Periodizzazione Biomeccanica</div>
        </div>
        <div className="doc-meta">
          <div>Data: <strong>{formattedDate}</strong></div>
          <div>Atleta: <strong>{program.athleteName || 'N/D'}</strong></div>
        </div>
      </div>

      {/* Passaporto Atleta */}
      <div className="passport-card">
        <div className="passport-item"><strong>Atleta:</strong> {program.athleteName || 'Atleta'}</div>
        <div className="passport-item"><strong>Disciplina:</strong> {program.sport || 'Generale'}</div>
        <div className="passport-item"><strong>Obiettivo:</strong> {program.goal}</div>
        <div className="passport-item"><strong>Metodo:</strong> {program.periodizationMethod}</div>
        <div className="passport-item"><strong>Durata:</strong> {durationWeeks} Settimane ({program.phases.length} Fasi)</div>
        <div className="passport-item"><strong>Frequenza:</strong> {daysPerWeek} Sedute / Settimana</div>
        <div className="passport-item">
          <strong>Rischio Clinico:</strong> {(program.riskProfile?.level || 'low').toUpperCase()} ({program.riskProfile?.score ?? 0} pt)
        </div>
        <div className="passport-item">
          <strong>Condizioni:</strong> {program.riskProfile?.activePathologyCount ?? 0} attive
        </div>
        <div className="passport-item">
          <strong>Stato Clinico:</strong> {program.riskProfile?.criticalCategoryPresent ? 'Monitoraggio Alto' : 'Idoneo'}
        </div>
      </div>

      {/* Timeline Macrociclo a Settimane */}
      <div className="section-title">Timeline Settimane &amp; Suddivisione Macrociclo</div>
      <table className="prog-table">
        <thead>
          <tr>
            <th style={{ width: '14%' }}>Settimane</th>
            <th style={{ width: '26%' }}>Fase &amp; Obiettivo</th>
            <th style={{ width: '12%' }}>Volume</th>
            <th style={{ width: '18%' }}>Intensita Target</th>
            <th style={{ width: '10%' }}>Cap RPE</th>
            <th style={{ width: '20%' }}>Focus Metodologico</th>
          </tr>
        </thead>
        <tbody>
          {phaseTimeline.map(({ phase, weekLabel }) => (
            <tr key={phase.phaseIndex}>
              <td>
                <strong>{weekLabel}</strong>
                <br />
                <small style={{ color: '#64748b' }}>({phase.durationWeeks} sett.)</small>
              </td>
              <td>
                <strong>Fase {phase.phaseIndex}: {phase.name}</strong>
                {phase.kneeRomLimitDeg && (
                  <>
                    <br />
                    <small style={{ color: '#059669' }}>ROM Ginocchio: {phase.kneeRomLimitDeg} deg</small>
                  </>
                )}
              </td>
              <td>{phase.volumeTier}</td>
              <td>{phase.intensityPctRange[0]}% - {phase.intensityPctRange[1]}% 1RM</td>
              <td>RPE &le; {phase.rpeCap}</td>
              <td>{phase.weeklyFocus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rationale Scientifico - 4 Pilastri */}
      <div className="section-title">Rationale Scientifico &amp; Logica di Allenamento AI</div>
      <div className="rationale-grid">
        <div className="rationale-box">
          <span className="r-title">1. Profilo Atleta &amp; Contesto</span>
          <div>{program.rationale.athleteProfile}</div>
        </div>
        <div className="rationale-box">
          <span className="r-title">2. Architettura di Periodizzazione</span>
          <div>{program.rationale.periodizationArchitecture}</div>
        </div>
        <div className="rationale-box">
          <span className="r-title">3. Prescrizioni Biomeccaniche</span>
          <div>{program.rationale.biomechanicalPrescriptions}</div>
        </div>
        <div className="rationale-box">
          <span className="r-title">4. Strategia Velocity-Based Training</span>
          <div>{program.rationale.vbtStrategy}</div>
        </div>
      </div>

      {/* Metodo Periodizzazione Dettagliato (se presente) */}
      {periodizationDetail && (
        <div className="rationale-box" style={{ marginBottom: '8pt' }}>
          <span className="r-title">Metodo: {program.periodizationMethod} &bull; {periodizationDetail.name}</span>
          <div>{periodizationDetail.rationale}</div>
          <small style={{ color: '#64748b', display: 'block', marginTop: '2pt' }}>
            Riferimenti: {periodizationDetail.keyResearchers}
          </small>
        </div>
      )}

      {/* Prescrizioni di Sicurezza Clinica (se presenti) */}
      {program.riskProfile?.notes && program.riskProfile.notes.length > 0 && (
        <div className="clinical-alert-box">
          <strong>Prescrizioni di Sicurezza Clinica e Tutela Articolare:</strong>
          <ul style={{ margin: '2pt 0 0 0', paddingLeft: '12pt' }}>
            {program.riskProfile.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Salto pagina pulito dopo la scheda master per avviare le schede operative su pagina nuova */}
      <div className="page-break" />

      {/* ============================================================ */}
      {/* PAGINE 2..N: SCHEDE OPERATIVE DELLE SEDUTE (TUTTE LE FASI)   */}
      {/* ============================================================ */}
      {phaseTimeline.map(({ phase, weekLabel }) => (
        <div key={phase.phaseIndex} className="phase-wrapper">
          <div className="phase-banner">
            <h2>FASE {phase.phaseIndex}: {(phase.name || '').toUpperCase()} ({weekLabel} &bull; {phase.durationWeeks} sett.)</h2>
            <div className="phase-meta">
              Intensita: {phase.intensityPctRange[0]}% - {phase.intensityPctRange[1]}% 1RM &bull; Cap RPE: {phase.rpeCap}
              {phase.kneeRomLimitDeg ? ` \u2022 ROM: ${phase.kneeRomLimitDeg} deg` : ''}
            </div>
          </div>

          {phase.sessions.map((session, sIdx) => (
            <div key={sIdx} className="day-card">
              <div className="day-header">
                <div className="day-title">{session.dayName}</div>
                <div className="day-focus">
                  Focus: <strong>{session.focus}</strong> (~{session.estimatedDurationMin || DEFAULT_ESTIMATED_DURATION_MIN} min)
                </div>
              </div>

              {session.warmup && session.warmup.length > 0 && (
                <div className="aux-routine">
                  <strong>Riscaldamento Dinamico: </strong>
                  {session.warmup.map((w) => `${w.name} (${w.sets}x${w.reps})`).join(' \u2022 ')}
                </div>
              )}

              <table className="ex-interactive-table">
                <thead>
                  <tr>
                    <th style={{ width: '27%' }}>Esercizio</th>
                    <th style={{ width: '8%' }}>Cat.</th>
                    <th style={{ width: '8%' }} className="text-center">Serie</th>
                    <th style={{ width: '9%' }} className="text-center">Reps</th>
                    <th style={{ width: '10%' }} className="text-center">Carico %</th>
                    <th style={{ width: '7%' }} className="text-center">RPE</th>
                    <th style={{ width: '8%' }} className="text-center">Recupero</th>
                    <th style={{ width: '8%' }} className="text-center">Tempo</th>
                    <th style={{ width: '15%' }} className="text-center">Carico Effettivo</th>
                  </tr>
                </thead>
                <tbody>
                  {session.exercises.map((ex, eIdx) => (
                    <tr key={eIdx}>
                      <td>
                        <strong>{ex.name}</strong>
                        {ex.notes && <div className="ex-note">{ex.notes}</div>}
                      </td>
                      <td><span className="badge-cat">{ex.category}</span></td>
                      <td className="text-center"><strong>{ex.sets}</strong></td>
                      <td className="text-center">{ex.reps}</td>
                      <td className="text-center">{ex.loadPct1RM ? `${ex.loadPct1RM}%` : (ex.loadKg ? `${ex.loadKg}kg` : '-')}</td>
                      <td className="text-center">{ex.rpe}</td>
                      <td className="text-center">{ex.restSec}s</td>
                      <td className="text-center">{ex.tempo}</td>
                      <td className="text-center"><span className="log-box">[ &nbsp; &nbsp; &nbsp; &nbsp; kg ]</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {session.cooldown && session.cooldown.length > 0 && (
                <div className="aux-routine">
                  <strong>Defaticamento: </strong>
                  {session.cooldown.map((c) => `${c.name} (${c.sets}x${c.reps})`).join(' \u2022 ')}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* ============================================================ */}
      {/* CALCE: RIFERIMENTI SCIENTIFICI & BIBLIOGRAFIA                */}
      {/* ============================================================ */}
      {cleanedCitations.length > 0 && (
        <div className="bib-section">
          <div style={{ fontWeight: 700, fontSize: '8pt', color: '#0f172a', textTransform: 'uppercase' }}>
            Riferimenti Scientifici e Pubblicazioni Peer-Reviewed:
          </div>
          <div className="bib-grid">
            {cleanedCitations.map((c, idx) => (
              <div key={idx}>&bull; {c}</div>
            ))}
          </div>
        </div>
      )}

      <div className="dossier-footer">
        <div>T7 Sports Analytics Platform &bull; Documento generato ad uso professionale del preparatore atletico e chinesiologo.</div>
        <div>{formattedDate}</div>
      </div>
    </div>
  );
};
