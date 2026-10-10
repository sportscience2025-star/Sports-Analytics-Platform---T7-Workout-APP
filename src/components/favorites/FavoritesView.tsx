/**
 * src/components/favorites/FavoritesView.tsx
 * Visualizzatore degli esercizi salvati nei Preferiti con filtri rapidi e modale dettaglio.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola R3: Componente modulare dedicato al rendering.
 * - Regola R1: Zero any, tipizzazione con Exercise.
 */

import React, { useState, useMemo } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { getAllExercises } from '../../data/exercises';
import { ExerciseCard } from '../exercises/ExerciseCard';
import { ExerciseDetailModal } from '../exercises/ExerciseDetailModal';
import type { Exercise } from '../../types/exercise';

export const FavoritesView: React.FC = () => {
  const { favoriteIds, isFavorite, toggleFavorite, favoritesCount } = useFavorites();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Tutti');
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

  // Filtra per ricerca e muscolo
  const filteredFavorites = useMemo<Exercise[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    return allFavExercises.filter((ex) => {
      const matchMuscle = selectedMuscle === 'Tutti' || ex.primaryMuscle === selectedMuscle;
      if (!matchMuscle) return false;

      if (!q) return true;
      const matchName = ex.name.toLowerCase().includes(q);
      const matchDesc = ex.description.toLowerCase().includes(q);
      const matchEquip = ex.equipment.toLowerCase().includes(q);

      return matchName || matchDesc || matchEquip;
    });
  }, [allFavExercises, searchQuery, selectedMuscle]);

  return (
    <div className="favorites-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Modulo */}
      <section
        style={{
          borderBottom: '1px solid #1e293b',
          paddingBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Esercizi Preferiti
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
            Libreria personalizzata di esercizi salvati per la composizione rapida delle schede di allenamento.
          </p>
        </div>

        <span
          className="results-counter-pill"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            padding: '0.4rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <strong>{favoritesCount}</strong> esercizi salvati
        </span>
      </section>

      {/* Toolbar Ricerca & Filtri */}
      {favoritesCount > 0 && (
        <section
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: '1 1 260px' }}>
            <input
              type="text"
              placeholder="Cerca tra i preferiti (es. Panca, Squat)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              style={{
                padding: '0.6rem 0.85rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.9rem',
              }}
            >
              {availableMuscles.map((m) => (
                <option key={m} value={m}>
                  Muscolo: {m}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {/* Griglia Esercizi Preferiti */}
      {favoritesCount === 0 ? (
        <div
          style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            background: '#090d16',
            borderRadius: '0.5rem',
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Nessun esercizio salvato nei preferiti
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '480px', margin: 0 }}>
            Aggiungi esercizi ai tuoi preferiti cliccando sull icona del cuore nelle card del Catalogo Esercizi per ritrovarli rapidamente qui.
          </p>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            background: '#090d16',
            borderRadius: '0.5rem',
            border: '1px solid #1e293b',
            color: '#64748b',
          }}
        >
          Nessun esercizio preferito corrisponde ai termini di ricerca impostati.
        </div>
      ) : (
        <div
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
              onToggleFavorite={() => toggleFavorite(exercise.id)}
              onOpenDetailModal={(ex) => setModalExercise(ex)}
            />
          ))}
        </div>
      )}

      {/* Modale Dettaglio Esercizio */}
      {modalExercise && (
        <ExerciseDetailModal
          isOpen={true}
          exercise={modalExercise}
          onClose={() => setModalExercise(null)}
          isFavorite={isFavorite(modalExercise.id)}
          onToggleFavorite={() => toggleFavorite(modalExercise.id)}
        />
      )}
    </div>
  );
};
