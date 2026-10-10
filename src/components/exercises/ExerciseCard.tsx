/**
 * src/components/exercises/ExerciseCard.tsx
 * Card ad alta fedeltà per la visualizzazione dell'esercizio nel Catalogo (Foto 1).
 * Mostra: tag tipo, qualità, livello, cuoricino preferiti, nome, muscolo target,
 * micro-pill secondari, descrizione sintetica, chip attrezzatura e tasto "Scheda ->".
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola R1: Zero any, tipizzazione con Exercise.
 */

import React from 'react';
import type { Exercise } from '../../types/exercise';

export interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onOpenDetailModal?: (exercise: Exercise) => void;
}

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
    ? exercise.secondaryMuscles.slice(0, 3)
    : [];

  return (
    <article
      className="exercise-card animate-fade-in-up"
      onClick={() => onOpenDetailModal?.(exercise)}
      style={{
        cursor: 'pointer',
      }}
    >
      {/* Header Card: Tag e Cuoricino Preferiti */}
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            fontSize: '1.15rem',
            cursor: 'pointer',
            padding: '0.2rem',
            lineHeight: 1,
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Body Card: Titolo, Target Muscolare, Pills secondari, Descrizione */}
      <div className="card-body" style={{ marginTop: '0.65rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
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
          <div className="sec-muscles-wrap">
            {secMuscles.map((m) => (
              <span key={m} className="sec-muscle-pill">
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

      {/* Actions Footer: Attrezzatura e Tasto Scheda -> */}
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
        <span className="tag chip--equipment">{exercise.equipment}</span>
        <button
          type="button"
          className="btn-card-action"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetailModal?.(exercise);
          }}
          title="Vedi dettagli esercizio"
        >
          <span>Scheda</span>
          <span className="action-arrow">→</span>
        </button>
      </div>
    </article>
  );
};
