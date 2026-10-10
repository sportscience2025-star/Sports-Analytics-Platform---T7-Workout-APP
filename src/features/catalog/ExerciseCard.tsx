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
 * Restituisce i colori semantici ad alto contrasto per la qualità neuromuscolare.
 */
function getQualitySemanticStyle(quality?: string): React.CSSProperties {
  const q = (quality || '').toLowerCase().trim();
  switch (q) {
    case 'forza':
      return {
        background: 'rgba(249, 115, 22, 0.15)',
        color: '#f97316',
        border: '1px solid rgba(249, 115, 22, 0.35)',
      };
    case 'ipertrofia':
      return {
        background: 'rgba(129, 140, 248, 0.15)',
        color: '#818cf8',
        border: '1px solid rgba(129, 140, 248, 0.35)',
      };
    case 'potenza':
      return {
        background: 'rgba(234, 179, 8, 0.15)',
        color: '#eab308',
        border: '1px solid rgba(234, 179, 8, 0.35)',
      };
    case 'stabilita':
    case 'stabilità':
      return {
        background: 'rgba(6, 182, 212, 0.15)',
        color: '#06b6d4',
        border: '1px solid rgba(6, 182, 212, 0.35)',
      };
    case 'resistenza':
      return {
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.35)',
      };
    default:
      return {
        background: 'rgba(148, 163, 184, 0.15)',
        color: '#94a3b8',
        border: '1px solid rgba(148, 163, 184, 0.3)',
      };
  }
}

/**
 * Restituisce lo stile semantico per la tipologia di esercizio (Multiarticolare, Isolamento, ecc.).
 */
function getTypeSemanticStyle(type?: string): React.CSSProperties {
  const t = (type || '').toLowerCase().trim();
  if (t.includes('multi')) {
    return {
      background: 'rgba(14, 165, 233, 0.15)',
      color: '#38bdf8',
      border: '1px solid rgba(56, 189, 248, 0.35)',
    };
  }
  if (t.includes('isol')) {
    return {
      background: 'rgba(168, 85, 247, 0.15)',
      color: '#c084fc',
      border: '1px solid rgba(192, 132, 252, 0.35)',
    };
  }
  if (t.includes('isom')) {
    return {
      background: 'rgba(245, 158, 11, 0.15)',
      color: '#fbbf24',
      border: '1px solid rgba(251, 191, 36, 0.35)',
    };
  }
  return {
    background: 'rgba(148, 163, 184, 0.12)',
    color: '#94a3b8',
    border: '1px solid rgba(148, 163, 184, 0.25)',
  };
}

/**
 * Card esercizio per la griglia responsive del catalogo (Cockpit Dark Theme).
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

  const qualityStyle = getQualitySemanticStyle(quality);
  const typeStyle = getTypeSemanticStyle(exercise.type);

  return (
    <article
      className="exercise-card animate-fade-in-up"
      onClick={() => onOpenDetailModal?.(exercise)}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#111827',
        border: '1px solid #1f293d',
        borderRadius: '12px',
        padding: '1.25rem',
        minHeight: '220px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div>
        {/* Header Card: Tag semantici e Cuoricino Preferiti (SVG reattivo, zero emoji) */}
        <div
          className="card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.85rem',
          }}
        >
          <div className="card-tags" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span
              className={`tag tag--type ${typeClass}`}
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                lineHeight: 1.2,
                ...typeStyle,
              }}
            >
              {exercise.type}
            </span>
            <span
              className={`tag ${qualityClass}`}
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                lineHeight: 1.2,
                ...qualityStyle,
              }}
            >
              {quality}
            </span>
            <span
              className="tag secondary"
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                background: 'rgba(148, 163, 184, 0.15)',
                color: '#94a3b8',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                lineHeight: 1.2,
              }}
            >
              {exercise.level}
            </span>
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
              padding: '0.35rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFavorite ? '#ef4444' : '#94a3b8',
              transition: 'transform 0.15s ease, background 0.15s ease',
            }}
          >
            <svg
              width="20"
              height="20"
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
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#f1f5f9',
              margin: '0 0 0.25rem 0',
              lineHeight: 1.3,
            }}
          >
            {exercise.name}
          </h3>
          <p
            className="muscle-target"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#6366f1',
              margin: '0 0 0.45rem 0',
            }}
          >
            {exercise.primaryMuscle}
          </p>

          {secMuscles.length > 0 && (
            <div className="sec-muscles-wrap" style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {secMuscles.map((m) => (
                <span
                  key={m}
                  className="sec-muscle-pill"
                  style={{
                    fontSize: '0.72rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    lineHeight: 1.2,
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
              color: '#94a3b8',
              lineHeight: '1.45',
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

      {/* Actions Footer: Attrezzatura smeraldo e Tasto Scheda a pillola con freccia SVG */}
      <div
        className="card-actions"
        style={{
          marginTop: '1.1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          className="tag chip--equipment"
          style={{
            fontSize: '0.75rem',
            padding: '0.22rem 0.55rem',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontWeight: 600,
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.95rem',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#818cf8',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          <span>Scheda</span>
          <svg
            className="action-arrow"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </article>
  );
};
