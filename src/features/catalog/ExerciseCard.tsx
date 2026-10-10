/**
 * src/features/catalog/ExerciseCard.tsx
 * Card reattiva per il catalogo esercizi (Cockpit Dark Theme).
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Costanti descrittive, nessun numero magico.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React from 'react';
import type { Exercise } from '../../types/exercise';

const MAX_SECONDARY_MUSCLES_PREVIEW = 3;

export interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onOpenDetailModal?: (exercise: Exercise) => void;
}

/**
 * Card esercizio per la griglia responsive del catalogo.
 */
export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isFavorite = false,
  onToggleFavorite,
  onOpenDetailModal,
}) => {
  const quality = exercise.quality || 'N/A';
  const qualityClass = quality ? `quality-${quality.toLowerCase()}` : 'secondary';
  const typeSlug = (exercise.type || '').toLowerCase();
  const typeClass = typeSlug ? `tag--${typeSlug}` : '';
  const secMuscles = Array.isArray(exercise.secondaryMuscles)
    ? exercise.secondaryMuscles.slice(0, MAX_SECONDARY_MUSCLES_PREVIEW)
    : [];

  return (
    <article
      className="exercise-card animate-fade-in-up"
      onClick={() => onOpenDetailModal?.(exercise)}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--bg-surface, #111827)',
        border: '1px solid var(--border, #1f293d)',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div>
        {/* Header Card: Tag e Cuoricino Preferiti (SVG) */}
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div className="card-tags" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span className={`tag tag--type ${typeClass}`}>{exercise.type}</span>
            <span className={`tag ${qualityClass}`}>{quality}</span>
            <span className="tag secondary">{exercise.level}</span>
          </div>

          <button
            type="button"
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(exercise.id);
            }}
            aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFavorite ? '#ef4444' : '#94a3b8',
              transition: 'transform 0.15s ease',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFavorite ? '#ef4444' : 'none'}
              stroke={isFavorite ? '#ef4444' : '#94a3b8'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Body Card: Titolo, Target Muscolare, Pills secondari, Descrizione */}
        <div className="card-body">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: '0 0 0.25rem 0' }}>
            {exercise.name}
          </h3>
          <p
            className="muscle-target"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary, #6366f1)',
              margin: '0 0 0.4rem 0',
            }}
          >
            {exercise.primaryMuscle}
          </p>

          {secMuscles.length > 0 && (
            <div className="sec-muscles-wrap" style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {secMuscles.map((m) => (
                <span
                  key={m}
                  className="sec-muscle-pill"
                  style={{
                    fontSize: '0.72rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#94a3b8',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          )}

          <p
            className="description"
            style={{
              fontSize: '0.825rem',
              color: 'var(--text-secondary, #94a3b8)',
              lineHeight: '1.4',
              margin: '0.5rem 0 0 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {exercise.description}
          </p>
        </div>
      </div>

      {/* Actions Footer: Attrezzatura e Tasto Scheda */}
      <div
        className="card-actions"
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          className="tag chip--equipment"
          style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          {exercise.equipment}
        </span>
        <button
          type="button"
          className="btn-card-action"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetailModal?.(exercise);
          }}
          title="Vedi dettagli esercizio"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--primary, #6366f1)',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
          }}
        >
          <span>Scheda</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </article>
  );
};
