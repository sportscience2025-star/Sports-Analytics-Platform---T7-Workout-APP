/**
 * src/components/exercises/ExerciseCard.tsx
 * Card accessibile per la visualizzazione dettagliata di un esercizio scientifico.
 * Mostra: nome, muscoli target, qualità, livello, cues ed errori comuni.
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola R1: Zero any, tipizzazione con Exercise.
 */

import React, { useState } from 'react';
import { Exercise } from '../../types/exercise';

export interface ExerciseCardProps {
  exercise: Exercise;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'Forza':
        return '#6366f1';
      case 'Potenza':
        return '#ec4899';
      case 'Ipertrofia':
        return '#10b981';
      case 'Stabilità':
        return '#06b6d4';
      case 'Resistenza':
        return '#f59e0b';
      default:
        return '#94a3b8';
    }
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'Principiante':
        return '#22c55e';
      case 'Intermedio':
        return '#eab308';
      case 'Avanzato':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  return (
    <article
      className="exercise-card"
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '0.5rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.875rem'
      }}
    >
      {/* Intestazione Card */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {exercise.name}
            </h3>
            {exercise.nameEn && (
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
                {exercise.nameEn}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.2rem 0.45rem',
                borderRadius: '0.25rem',
                border: `1px solid ${getQualityColor(exercise.quality)}`,
                color: getQualityColor(exercise.quality)
              }}
            >
              {exercise.quality}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.2rem 0.45rem',
                borderRadius: '0.25rem',
                background: '#1e293b',
                color: getLevelColor(exercise.level)
              }}
            >
              {exercise.level}
            </span>
          </div>
        </div>

        {/* Muscoli e Attrezzatura */}
        <div style={{ marginTop: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.75rem' }}>
          <span style={{ color: '#94a3b8' }}>
            Target: <strong style={{ color: '#e2e8f0' }}>{exercise.primaryMuscle}</strong>
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#94a3b8' }}>
            Tipo: <span style={{ color: '#cbd5e1' }}>{exercise.type}</span>
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#94a3b8' }}>
            Attrezzo: <span style={{ color: '#cbd5e1' }}>{exercise.equipment}</span>
          </span>
        </div>

        {/* Descrizione sintetica */}
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.4', margin: '0.75rem 0 0 0' }}>
          {exercise.description}
        </p>
      </div>

      {/* Dettagli Espandibili (Cues, Passaggi ed Errori) */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          aria-expanded={showDetails}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6366f1',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          {showDetails ? 'Nascondi Protocollo Esecutivo' : 'Mostra Protocollo & Errori Comuni'}
        </button>

        {showDetails && (
          <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Cues Biomeccanici */}
            {exercise.execution.cues && exercise.execution.cues.length > 0 && (
              <div style={{ background: '#1e293b', padding: '0.65rem 0.8rem', borderRadius: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Cues Biomeccanici di Attivazione
                </span>
                <ul style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {exercise.execution.cues.map((cue, idx) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>
                      {cue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fasi Esecutive Principali */}
            {exercise.execution.steps && exercise.execution.steps.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Fasi del Movimento
                </span>
                <ol style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {exercise.execution.steps.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Errori Comuni e Correzioni */}
            {exercise.errors && exercise.errors.length > 0 && (
              <div style={{ background: '#1c1917', border: '1px solid #292524', padding: '0.65rem 0.8rem', borderRadius: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>
                  Errori Critici &amp; Correzioni
                </span>
                <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {exercise.errors.map((err, idx) => (
                    <div key={idx} style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>
                      <div style={{ fontWeight: 600, color: '#fca5a5' }}>
                        Errore: {err.error}
                      </div>
                      <div style={{ color: '#a8a29e', margin: '0.15rem 0' }}>
                        Causa: {err.why}
                      </div>
                      <div style={{ color: '#86efac' }}>
                        Fix: {err.fix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
