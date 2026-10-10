/**
 * src/features/favorites/FavoritesView.tsx
 * Visualizzatore completo degli Esercizi Preferiti (Cockpit Dark Theme, Foto 5).
 *
 * Conforme a:
 * - Foto 5: Header con badge "LA TUA LIBRERIA", pillola contatore dinamica ed empty state con lente.
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Zero numeri magici, costanti in MAIUSCOLO.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React, { useState, useMemo } from 'react';
import { useFavorites } from './useFavorites';
import { getAllExercises } from '../../data/exercises';
import { ExerciseCard } from '../catalog/ExerciseCard';
import { ExerciseBiomechanicsModal } from '../catalog/ExerciseBiomechanicsModal';
import type { Exercise } from '../../types/exercise';

const CANONICAL_LEVELS = ['Tutti', 'Principiante', 'Intermedio', 'Avanzato', 'Elite/Pro'];
const CANONICAL_EQUIPMENTS = ['Tutta', 'Bilanciere', 'Manubri', 'Corpo Libero', 'Macchine', 'Cavi', 'Altri Attrezzi'];
const CANONICAL_QUALITIES = ['Tutte', 'Forza', 'Ipertrofia', 'Potenza', 'Stabilità', 'Resistenza'];

/**
 * View del modulo Preferiti.
 */
export const FavoritesView: React.FC = () => {
  const { favoriteIds, isFavorite, toggleFavorite, favoritesCount } = useFavorites();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Tutti');
  const [selectedLevel, setSelectedLevel] = useState<string>('Tutti');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('Tutta');
  const [selectedQuality, setSelectedQuality] = useState<string>('Tutte');
  const [modalExercise, setModalExercise] = useState<Exercise | null>(null);

  // Recupera tutti gli esercizi marcati come preferiti
  const allFavExercises = useMemo<Exercise[]>(() => {
    const all = getAllExercises();
    return all.filter((ex) => favoriteIds.includes(ex.id));
  }, [favoriteIds]);

  // Lista muscoli disponibili tra i preferiti
  const availableMuscles = useMemo<string[]>(() => {
    const set = new Set<string>();
    allFavExercises.forEach((ex) => {
      if (ex.primaryMuscle) set.add(ex.primaryMuscle);
    });
    return ['Tutti', ...Array.from(set).sort()];
  }, [allFavExercises]);

  // Filtra per ricerca e parametri
  const filteredFavorites = useMemo<Exercise[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    return allFavExercises.filter((ex) => {
      if (selectedMuscle !== 'Tutti' && ex.primaryMuscle !== selectedMuscle) return false;
      if (selectedLevel !== 'Tutti' && ex.level !== selectedLevel) return false;
      if (selectedQuality !== 'Tutte' && ex.quality !== selectedQuality) return false;
      if (selectedEquipment !== 'Tutta' && !ex.equipment.toLowerCase().includes(selectedEquipment.toLowerCase())) return false;

      if (!q) return true;
      const matchName = ex.name.toLowerCase().includes(q);
      const matchDesc = ex.description.toLowerCase().includes(q);
      const matchEquip = ex.equipment.toLowerCase().includes(q);
      return matchName || matchDesc || matchEquip;
    });
  }, [allFavExercises, searchQuery, selectedMuscle, selectedLevel, selectedEquipment, selectedQuality]);

  const isFilterActive =
    searchQuery.trim().length > 0 ||
    selectedMuscle !== 'Tutti' ||
    selectedLevel !== 'Tutti' ||
    selectedEquipment !== 'Tutta' ||
    selectedQuality !== 'Tutte';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMuscle('Tutti');
    setSelectedLevel('Tutti');
    setSelectedEquipment('Tutta');
    setSelectedQuality('Tutte');
  };

  return (
    <div className="favorites-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Modulo (Foto 5) */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border, #1f293d)',
          paddingBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              LA TUA LIBRERIA
            </span>
            <span
              className="results-counter-pill"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary, #94a3b8)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
              }}
            >
              <strong style={{ color: '#f87171' }}>{favoritesCount}</strong> esercizi salvati
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #f1f5f9)' }}>
            Esercizi Preferiti
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Libreria personalizzata di esercizi salvati per la consultazione rapida e la composizione schede.
          </p>
        </div>
      </section>

      {/* Toolbar Ricerca & Filtri (visibile quando ci sono preferiti) */}
      {favoritesCount > 0 && (
        <section
          style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border, #1f293d)',
            borderRadius: '0.5rem',
            padding: '0.875rem 1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          {/* Cerca */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cerca tra i tuoi preferiti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-body, #0b0e14)',
                border: '1px solid var(--border, #1f293d)',
                borderRadius: '0.375rem',
                padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                color: 'var(--text-primary, #f1f5f9)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Muscolo */}
          <select
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
            style={{
              flex: '0 1 140px',
              background: 'var(--bg-body, #0b0e14)',
              border: '1px solid var(--border, #1f293d)',
              borderRadius: '0.375rem',
              padding: '0.55rem 0.75rem',
              color: 'var(--text-primary, #f1f5f9)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {availableMuscles.map((m) => (
              <option key={m} value={m}>
                {m === 'Tutti' ? 'Tutti i Muscoli' : m}
              </option>
            ))}
          </select>

          {/* Livello */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            style={{
              flex: '0 1 125px',
              background: 'var(--bg-body, #0b0e14)',
              border: '1px solid var(--border, #1f293d)',
              borderRadius: '0.375rem',
              padding: '0.55rem 0.75rem',
              color: 'var(--text-primary, #f1f5f9)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {CANONICAL_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl === 'Tutti' ? 'Tutti i Livelli' : lvl}
              </option>
            ))}
          </select>

          {/* Attrezzatura */}
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            style={{
              flex: '0 1 135px',
              background: 'var(--bg-body, #0b0e14)',
              border: '1px solid var(--border, #1f293d)',
              borderRadius: '0.375rem',
              padding: '0.55rem 0.75rem',
              color: 'var(--text-primary, #f1f5f9)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {CANONICAL_EQUIPMENTS.map((eq) => (
              <option key={eq} value={eq}>
                {eq === 'Tutta' ? 'Tutta Attrezzatura' : eq}
              </option>
            ))}
          </select>

          {/* Qualità */}
          <select
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
            style={{
              flex: '0 1 130px',
              background: 'var(--bg-body, #0b0e14)',
              border: '1px solid var(--border, #1f293d)',
              borderRadius: '0.375rem',
              padding: '0.55rem 0.75rem',
              color: 'var(--text-primary, #f1f5f9)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {CANONICAL_QUALITIES.map((q) => (
              <option key={q} value={q}>
                {q === 'Tutte' ? 'Tutte le Qualità' : q}
              </option>
            ))}
          </select>

          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.375rem',
                padding: '0.55rem 0.75rem',
                color: '#f87171',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          )}
        </section>
      )}

      {/* Griglia Esercizi Preferiti oppure Empty State (Foto 5) */}
      {favoritesCount === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px dashed var(--border, #1f293d)',
            borderRadius: '0.75rem',
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)', margin: '0 0 0.4rem 0' }}>
              Nessun esercizio salvato
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, maxWidth: '480px', lineHeight: 1.5 }}>
              Non hai ancora salvato alcun esercizio nei tuoi preferiti. Clicca sull&apos;icona del cuore sulle schede del catalogo per aggiungerli qui.
            </p>
          </div>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px dashed var(--border, #1f293d)',
            borderRadius: '0.75rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'var(--text-secondary, #94a3b8)',
            fontSize: '0.9rem',
          }}
        >
          Nessun esercizio preferito corrisponde ai filtri di ricerca selezionati.
        </div>
      ) : (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredFavorites.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isFavorite={isFavorite(exercise.id)}
              onToggleFavorite={toggleFavorite}
              onOpenDetailModal={setModalExercise}
            />
          ))}
        </section>
      )}

      {/* Modale Dettaglio Biomeccanico */}
      <ExerciseBiomechanicsModal
        exercise={modalExercise}
        isOpen={modalExercise !== null}
        onClose={() => setModalExercise(null)}
        isFavorite={modalExercise ? isFavorite(modalExercise.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
};
