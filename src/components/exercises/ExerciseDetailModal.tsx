/**
 * src/components/exercises/ExerciseDetailModal.tsx
 * Scheda modale completa per i dettagli tecnici e biomeccanici dell'esercizio.
 * Rispetta la Regola 01 (Zero emoji spontanee) e Regola R1 (Zero any, TypeScript strict).
 */

import React, { useEffect, useCallback } from 'react';
import type { Exercise } from '../../types/exercise';

export interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}) => {
  // Gestione chiusura con tasto Escape
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

  const getQualityBadgeColor = (quality: string): string => {
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
        return '#64748b';
    }
  };

  const getLevelBadgeColor = (level: string): string => {
    switch (level) {
      case 'Principiante':
        return '#22c55e';
      case 'Intermedio':
        return '#eab308';
      case 'Avanzato':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-exercise-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
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
          background: '#0b1329',
          border: '1px solid #1e293b',
          borderRadius: '0.75rem',
          maxWidth: '800px',
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
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: '#0f172a',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
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
                  background: getQualityBadgeColor(exercise.quality),
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
                  background: getLevelBadgeColor(exercise.level),
                  color: '#000000',
                  fontWeight: 600,
                }}
              >
                {exercise.level}
              </span>
            </div>
            <h2
              id="modal-exercise-title"
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
                  background: isFavorite ? '#eab308' : '#1e293b',
                  color: isFavorite ? '#000000' : '#f8fafc',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isFavorite ? 'Preferito [Attivo]' : 'Salva nei Preferiti'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi finestra"
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '0.375rem',
                width: '32px',
                height: '32px',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              X
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
          {/* Descrizione / Contesto Biomeccanico */}
          {exercise.description && (
            <div
              style={{
                background: '#1e293b',
                padding: '0.875rem 1rem',
                borderRadius: '0.5rem',
                borderLeft: '4px solid #38bdf8',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              <strong>Quadro Biomeccanico:</strong> {exercise.description}
            </div>
          )}

          {/* Dettagli Tassonomici */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              background: '#0f172a',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #1e293b',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Muscolo Primario</span>
              <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{exercise.primaryMuscle}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Tipologia</span>
              <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{exercise.type}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Attrezzatura</span>
              <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{exercise.equipment}</strong>
            </div>
            {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Muscoli Secondari</span>
                <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                  {exercise.secondaryMuscles.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Guida all'esecuzione */}
          {exercise.execution && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#38bdf8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Protocollo di Esecuzione Tecnica
              </h3>

              {/* Setup */}
              {exercise.execution.setup && exercise.execution.setup.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>Fase di Setup:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                    {exercise.execution.setup.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Steps */}
              {exercise.execution.steps && exercise.execution.steps.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>Fasi del Movimento:</h4>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                    {exercise.execution.steps.map((st, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>{st}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Cues biomeccanici */}
              {exercise.execution.cues && exercise.execution.cues.length > 0 && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '0.875rem 1rem',
                  }}
                >
                  <h4 style={{ fontSize: '0.85rem', color: '#34d399', margin: '0 0 0.5rem 0' }}>
                    Spunti Tecnici e Cues Mentali:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                    {exercise.execution.cues.map((c, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Errori Comuni e Correzioni */}
          {exercise.errors && exercise.errors.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#f87171', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Errori Frequenti e Correzioni Cliniche
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {exercise.errors.map((err, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      Errore: {err.error}
                    </div>
                    {err.why && (
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        Causa: {err.why}
                      </div>
                    )}
                    {err.fix && (
                      <div style={{ color: '#86efac', fontSize: '0.8rem', fontWeight: 500 }}>
                        Correzione: {err.fix}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Varianti */}
          {exercise.variants && exercise.variants.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>Varianti Disponibili:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {exercise.variants.map((v, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.8rem',
                      background: '#1e293b',
                      color: '#cbd5e1',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #334155',
                    }}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer modale */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'flex-end',
            background: '#0f172a',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#334155',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1.25rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
