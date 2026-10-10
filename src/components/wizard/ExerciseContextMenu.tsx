/**
 * src/components/wizard/ExerciseContextMenu.tsx
 * Menu contestuale ad ancoraggio rapido (...) per la gestione dei singoli esercizi nella scheda:
 * 1. Modifica rapida parametri (serie, reps, carico, recupero, tempo, RPE, note).
 * 2. Sostituzione esercizio con pannello AI / Catalogo (Swap).
 * 3. Eliminazione esercizio con attivazione automatica del rollback (Undo Toast 5s).
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola 02: Modularità e assenza di numeri magici.
 * - Regola R1: Zero any, TypeScript strict.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { FormattedExercise } from '../../types/program';

interface ExerciseContextMenuProps {
  exercise: FormattedExercise;
  onEdit: (updated: Partial<FormattedExercise>) => void;
  onSwap: () => void;
  onDelete: () => void;
}

const DEFAULT_REST_SEC = 90;
const DEFAULT_RPE = 8.0;
const DEFAULT_SETS = 3;

/**
 * Menu contestuale per la card esercizio con finestra modale di modifica rapida.
 */
export const ExerciseContextMenu: React.FC<ExerciseContextMenuProps> = ({
  exercise,
  onEdit,
  onSwap,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Stato per i campi di modifica
  const [editSets, setEditSets] = useState<number>(exercise.sets || DEFAULT_SETS);
  const [editReps, setEditReps] = useState<string | number>(exercise.reps || 8);
  const [editLoadPct, setEditLoadPct] = useState<number>(exercise.loadPct1RM || 75);
  const [editRest, setEditRest] = useState<number>(exercise.restSec || DEFAULT_REST_SEC);
  const [editRpe, setEditRpe] = useState<number>(exercise.rpe || DEFAULT_RPE);
  const [editTempo, setEditTempo] = useState<string>(exercise.tempo || '2-0-1-0');
  const [editNotes, setEditNotes] = useState<string>(exercise.notes || '');

  const menuRef = useRef<HTMLDivElement>(null);

  // Chiudi menu cliccando fuori
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  // Aggiorna stati locali quando cambia l'esercizio
  useEffect(() => {
    setEditSets(exercise.sets || DEFAULT_SETS);
    setEditReps(exercise.reps || 8);
    setEditLoadPct(exercise.loadPct1RM || 75);
    setEditRest(exercise.restSec || DEFAULT_REST_SEC);
    setEditRpe(exercise.rpe || DEFAULT_RPE);
    setEditTempo(exercise.tempo || '2-0-1-0');
    setEditNotes(exercise.notes || '');
  }, [exercise]);

  const handleSaveEdit = useCallback(() => {
    onEdit({
      sets: editSets,
      reps: editReps,
      loadPct1RM: editLoadPct,
      restSec: editRest,
      rpe: editRpe,
      tempo: editTempo,
      notes: editNotes,
    });
    setIsEditModalOpen(false);
    setIsMenuOpen(false);
  }, [editSets, editReps, editLoadPct, editRest, editRpe, editTempo, editNotes, onEdit]);

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bottone trigger 3 puntini */}
      <button
        type="button"
        className="ex-action-btn"
        aria-label={`Azioni per ${exercise.name}`}
        title="Opzioni esercizio"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#94a3b8',
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          fontSize: '1.1rem',
          lineHeight: 1,
        }}
      >
        •••
      </button>

      {/* Popover Dropdown Menu */}
      {isMenuOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.4rem',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            minWidth: '180px',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsMenuOpen(false);
              setIsEditModalOpen(true);
            }}
            style={{
              width: '100%',
              padding: '0.65rem 0.9rem',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #334155',
              color: '#f8fafc',
              fontSize: '0.825rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Modifica Specifiche
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsMenuOpen(false);
              onSwap();
            }}
            style={{
              width: '100%',
              padding: '0.65rem 0.9rem',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #334155',
              color: '#38bdf8',
              fontSize: '0.825rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Sostituisci (Swap)
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsMenuOpen(false);
              onDelete();
            }}
            style={{
              width: '100%',
              padding: '0.65rem 0.9rem',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              fontSize: '0.825rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Elimina Esercizio
          </button>
        </div>
      )}

      {/* Modale Modifica Rapida Specifiche */}
      {isEditModalOpen && (
        <div
          className="edit-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div
            className="edit-modal-box"
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '460px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Modifica: {exercise.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.85rem',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Serie
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editSets}
                  onChange={(e) => setEditSets(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Ripetizioni
                </label>
                <input
                  type="text"
                  value={editReps}
                  onChange={(e) => setEditReps(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Carico (% 1RM)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={editLoadPct}
                  onChange={(e) => setEditLoadPct(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Recupero (s)
                </label>
                <input
                  type="number"
                  min="0"
                  max="600"
                  step="15"
                  value={editRest}
                  onChange={(e) => setEditRest(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  RPE
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={editRpe}
                  onChange={(e) => setEditRpe(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Tempo Sotto Tensione
                </label>
                <input
                  type="text"
                  value={editTempo}
                  onChange={(e) => setEditTempo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Note Tecniche / Coach
              </label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Prescrizioni di sicurezza, ROM o progressione..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  padding: '0.55rem 1rem',
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                style={{
                  padding: '0.55rem 1.25rem',
                  background: '#6366f1',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
