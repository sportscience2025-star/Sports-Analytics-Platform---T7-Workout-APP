/**
 * src/components/wizard/ProgramTimelineTable.tsx
 * Tabella compatta per la visualizzazione della timeline delle settimane del macrociclo.
 * Collocata in cima alla sezione operativa del programma.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee nell'interfaccia.
 * - Regola 02: Single responsibility, modularita e commenti chiari.
 * - Regola R1: Zero any, TypeScript strict.
 */

import React from 'react';
import type { PhaseBlueprint } from '../../types/program';

interface ProgramTimelineTableProps {
  phases: PhaseBlueprint[];
}

interface TimelineRow {
  phase: PhaseBlueprint;
  startWeek: number;
  endWeek: number;
  weekLabel: string;
}

const TABLE_HEADER_STYLE: React.CSSProperties = {
  padding: '0.65rem 0.85rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #334155'
};

const TABLE_CELL_STYLE: React.CSSProperties = {
  padding: '0.75rem 0.85rem',
  fontSize: '0.825rem',
  color: '#e2e8f0',
  borderBottom: '1px solid #1e293b',
  verticalAlign: 'middle'
};

/**
 * Componente per il rendering della tabella di progressione temporale a settimane.
 * Calcola l'intervallo temporale cumulativo per ciascuna fase.
 *
 * @param props - Oggetto contenente l'elenco delle fasi del programma
 * @returns Elemento JSX della tabella timeline
 */
export const ProgramTimelineTable: React.FC<ProgramTimelineTableProps> = ({ phases }) => {
  let cumulativeWeek = 1;
  const rows: TimelineRow[] = phases.map((phase) => {
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
    <section
      aria-label="Timeline Settimane e Suddivisione Programma"
      style={{
        background: '#090d16',
        border: '1px solid #1e293b',
        borderRadius: '0.5rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Timeline Settimane &amp; Suddivisione Macrociclo
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Architettura temporale delle fasi di carico, intensita target e progressione metodologica.
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="prog-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={TABLE_HEADER_STYLE}>Settimane</th>
              <th style={TABLE_HEADER_STYLE}>Fase &amp; Obiettivo</th>
              <th style={TABLE_HEADER_STYLE}>Volume</th>
              <th style={TABLE_HEADER_STYLE}>Intensita Target</th>
              <th style={TABLE_HEADER_STYLE}>Cap RPE</th>
              <th style={TABLE_HEADER_STYLE}>Focus Metodologico</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ phase, weekLabel }) => (
              <tr key={phase.phaseIndex} style={{ transition: 'background 0.15s ease' }}>
                <td style={TABLE_CELL_STYLE}>
                  <strong style={{ color: '#38bdf8' }}>{weekLabel}</strong>
                  <span style={{ display: 'block', fontSize: '0.725rem', color: '#64748b' }}>
                    ({phase.durationWeeks} sett.)
                  </span>
                </td>
                <td style={TABLE_CELL_STYLE}>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                    {phase.name.startsWith('Fase') || phase.name.startsWith('Blocco')
                      ? phase.name
                      : `Fase ${phase.phaseIndex}: ${phase.name}`}
                  </div>
                  {phase.kneeRomLimitDeg && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        color: '#34d399',
                        marginTop: '0.2rem'
                      }}
                    >
                      ROM Ginocchio: {phase.kneeRomLimitDeg} deg
                    </span>
                  )}
                </td>
                <td style={TABLE_CELL_STYLE}>
                  <span
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: phase.volumeTier === 'Alto' ? '#1e1b4b' : phase.volumeTier === 'Medio' ? '#1e293b' : '#064e3b',
                      color: phase.volumeTier === 'Alto' ? '#a5b4fc' : phase.volumeTier === 'Medio' ? '#cbd5e1' : '#6ee7b7',
                      border: '1px solid #334155'
                    }}
                  >
                    {phase.volumeTier}
                  </span>
                </td>
                <td style={TABLE_CELL_STYLE}>
                  <strong style={{ color: '#f8fafc' }}>
                    {phase.intensityPctRange[0]}% - {phase.intensityPctRange[1]}% 1RM
                  </strong>
                </td>
                <td style={TABLE_CELL_STYLE}>
                  <span style={{ color: '#fcd34d', fontWeight: 600 }}>RPE &lt;= {phase.rpeCap}</span>
                </td>
                <td style={TABLE_CELL_STYLE}>
                  <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{phase.weeklyFocus}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
