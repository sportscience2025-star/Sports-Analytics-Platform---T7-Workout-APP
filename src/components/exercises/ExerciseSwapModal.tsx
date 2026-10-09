/**
 * src/components/exercises/ExerciseSwapModal.tsx
 * Modale interattivo per la sostituzione (Swap) di un esercizio nel programma.
 * Permette al preparatore atletico di trovare alternative biomeccanicamente affini.
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Exercise } from '../../types/exercise';
import { getAllExercises } from '../../data/exercises/index';

export interface ExerciseSwapModalProps {
  targetExerciseName: string;
  targetPrimaryMuscle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectReplacement: (replacement: Exercise) => void;
}

export const ExerciseSwapModal: React.FC<ExerciseSwapModalProps> = ({
  targetExerciseName,
  targetPrimaryMuscle,
  isOpen,
  onClose,
  onSelectReplacement,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSameMuscleOnly, setFilterSameMuscleOnly] = useState<boolean>(true);

  const allExercisesList = useMemo(() => getAllExercises(), []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  const alternatives = useMemo(() => {
    let list = allExercisesList;

    // Se richiesto, filtra prima per lo stesso gruppo muscolare primario
    if (filterSameMuscleOnly && targetPrimaryMuscle) {
      const pmNorm = targetPrimaryMuscle.toLowerCase();
      list = list.filter((ex) =>
        ex.primaryMuscle.toLowerCase().includes(pmNorm) ||
        pmNorm.includes(ex.primaryMuscle.toLowerCase()) ||
        ex.muscles.some((m) => m.toLowerCase().includes(pmNorm))
      );
    }

    // Ricerca testuale
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.primaryMuscle.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q)
      );
    }

    // Escludi l'esercizio target stesso se ha lo stesso nome
    return list.filter((ex) => ex.name.toLowerCase() !== targetExerciseName.toLowerCase());
  }, [allExercisesList, filterSameMuscleOnly, targetPrimaryMuscle, searchQuery, targetExerciseName]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
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
          maxWidth: '700px',
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
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#0f172a',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Sostituzione Esercizio Scheda
            </span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: '0.2rem 0 0 0' }}>
              Sostituisci: {targetExerciseName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#334155',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '0.375rem',
              width: '32px',
              height: '32px',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            X
          </button>
        </div>

        {/* Toolbar filtri */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            background: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <input
            type="text"
            placeholder="Cerca esercizio alternativo per nome o attrezzo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.375rem',
              color: '#f8fafc',
              padding: '0.5rem 0.75rem',
              boxSizing: 'border-box',
            }}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterSameMuscleOnly}
              onChange={(e) => setFilterSameMuscleOnly(e.target.checked)}
            />
            Mostra solo alternative con target muscolare affine ({targetPrimaryMuscle || 'Stesso gruppo'})
          </label>
        </div>

        {/* Lista alternative */}
        <div style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alternatives.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              Nessun esercizio alternativo trovato con i criteri specificati.
            </div>
          ) : (
            alternatives.map((ex) => (
              <div
                key={ex.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '0.5rem',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{ex.name}</strong>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#334155', color: '#cbd5e1' }}>
                      {ex.equipment}
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#1e293b', color: '#38bdf8' }}>
                      {ex.quality}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Muscolo target: {ex.primaryMuscle} | Tipo: {ex.type} | Livello: {ex.level}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectReplacement(ex);
                    onClose();
                  }}
                  style={{
                    background: '#10b981',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.45rem 0.85rem',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Seleziona
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
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
              color: '#f8fafc',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.4rem 1rem',
              cursor: 'pointer',
            }}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};
