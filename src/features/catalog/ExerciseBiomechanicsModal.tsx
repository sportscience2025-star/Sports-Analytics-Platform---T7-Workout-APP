/**
 * src/features/catalog/ExerciseBiomechanicsModal.tsx
 * Scheda modale biomeccanica ad altissima fedeltà per i dettagli dell'esercizio.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Costanti descrittive in MAIUSCOLO, zero numeri magici.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React, { useEffect, useCallback } from 'react';
import type { Exercise } from '../../types/exercise';

export interface ExerciseBiomechanicsModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const QUALITY_COLOR_MAP: Record<string, string> = {
  Forza: '#6366f1',
  Potenza: '#ec4899',
  Ipertrofia: '#10b981',
  Stabilità: '#06b6d4',
  Resistenza: '#f59e0b',
};

const LEVEL_COLOR_MAP: Record<string, string> = {
  Principiante: '#22c55e',
  Intermedio: '#eab308',
  Avanzato: '#ef4444',
  'Elite/Pro': '#a855f7',
};

/**
 * Modale della Scheda Biomeccanica dell'Esercizio.
 */
export const ExerciseBiomechanicsModal: React.FC<ExerciseBiomechanicsModalProps> = ({
  exercise,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !exercise) {
    return null;
  }

  const qualityColor = QUALITY_COLOR_MAP[exercise.quality] || '#64748b';
  const levelColor = LEVEL_COLOR_MAP[exercise.level] || '#64748b';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-biomechanics-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 14, 20, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.75rem',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Header modale */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1f293d',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: '#0b0e14',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: '#1e293b',
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                }}
              >
                {exercise.id}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: qualityColor,
                  color: '#ffffff',
                  fontWeight: 600,
                }}
              >
                {exercise.quality}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: levelColor,
                  color: '#0b0e14',
                  fontWeight: 700,
                }}
              >
                {exercise.level}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#06b6d4',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  fontWeight: 600,
                }}
              >
                {exercise.type}
              </span>
            </div>
            <h2
              id="modal-biomechanics-title"
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#f8fafc',
                margin: 0,
              }}
            >
              {exercise.name}
            </h2>
            {exercise.nameEn && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                {exercise.nameEn}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(exercise.id)}
                style={{
                  background: isFavorite ? 'rgba(239, 68, 68, 0.15)' : '#1e293b',
                  color: isFavorite ? '#f87171' : '#f8fafc',
                  border: isFavorite ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #334155',
                  borderRadius: '0.375rem',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? '#ef4444' : 'none'}
                  stroke={isFavorite ? '#ef4444' : 'currentColor'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{isFavorite ? 'Salvato' : 'Salva'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi finestra"
              style={{
                background: '#1e293b',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Corpo modale con scroll */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Quadro Biomeccanico */}
          {exercise.description && (
            <div
              style={{
                background: '#0f172a',
                padding: '0.875rem 1rem',
                borderRadius: '0.5rem',
                borderLeft: '4px solid #6366f1',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#818cf8' }}>Razionale Biomeccanico:</strong> {exercise.description}
            </div>
          )}

          {/* Griglia Informazioni Muscolari & Attrezzatura */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div style={{ background: '#0b0e14', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #1f293d' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Muscolo Primario</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', marginTop: '0.2rem' }}>
                {exercise.primaryMuscle}
              </div>
            </div>

            <div style={{ background: '#0b0e14', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #1f293d' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Attrezzatura</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', marginTop: '0.2rem' }}>
                {exercise.equipment}
              </div>
            </div>

            {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
              <div style={{ background: '#0b0e14', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #1f293d' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Sinergici / Stabilizzatori</div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                  {exercise.secondaryMuscles.join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Sezione Come Eseguire: Setup ed Esecuzione */}
          {exercise.execution && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Come Eseguire
              </h3>

              {/* Setup Iniziale */}
              {exercise.execution.setup && exercise.execution.setup.length > 0 && (
                <div style={{ background: '#0b0e14', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1f293d' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                    Setup Iniziale
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    {exercise.execution.setup.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step di Esecuzione */}
              {exercise.execution.steps && exercise.execution.steps.length > 0 && (
                <div style={{ background: '#0b0e14', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1f293d' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                    Fasi di Esecuzione
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    {exercise.execution.steps.map((st, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>{st}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Cue Tecnici Verbali */}
              {exercise.execution.cues && exercise.execution.cues.length > 0 && (
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                    Cue Tecnici Propriocettivi
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#e0e7ff', fontSize: '0.875rem' }}>
                    {exercise.execution.cues.map((cue, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem', fontStyle: 'italic' }}>&quot;{cue}&quot;</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Criteri di Validità */}
              {exercise.execution.criteria && exercise.execution.criteria.length > 0 && (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                    Criteri Oggettivi di Validità
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#d1fae5', fontSize: '0.875rem' }}>
                    {exercise.execution.criteria.map((crit, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{crit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Box Errori Comuni da Evitare */}
          {exercise.errors && exercise.errors.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Errori Comuni da Evitare
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {exercise.errors.map((err, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(239, 68, 68, 0.06)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '0.5rem',
                      padding: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>{err.error}</span>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                      <strong style={{ color: '#fca5a5' }}>Perché:</strong> {err.why}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#86efac' }}>
                      <strong style={{ color: '#4ade80' }}>Correzione:</strong> {err.fix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
