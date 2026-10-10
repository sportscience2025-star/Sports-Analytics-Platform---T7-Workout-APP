/**
 * src/components/exercises/ExerciseCatalogView.tsx
 * Visualizzatore fedele al 100% del Catalogo Esercizi (Foto 1 & Foto 2).
 * Include:
 * - Badge "LIBRERIA COMPLETA", Titolo "Catalogo Esercizi", Contatore pill dinamico.
 * - Toolbar orizzontale compatta con: Cerca, Muscolo, Livello, Attrezzatura, Qualità (Foto 2) e pulsante verde "+ Aggiungi".
 * - Griglia responsive di ExerciseCard con modale di dettaglio e inserimento custom.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola R3: Componente snello; logica delegata a useExerciseCatalog.
 * - Regola R1: Zero any, tipizzazione con Exercise.
 */

import React, { useState } from 'react';
import { useExerciseCatalog } from '../../hooks/useExerciseCatalog';
import { useFavorites } from '../../hooks/useFavorites';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { AddExerciseModal } from './AddExerciseModal';
import type { Exercise } from '../../types/exercise';

export const ExerciseCatalogView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedMuscle,
    setSelectedMuscle,
    selectedQuality,
    setSelectedQuality,
    selectedLevel,
    setSelectedLevel,
    selectedEquipment,
    setSelectedEquipment,
    page,
    setPage,
    paginatedExercises,
    totalCount,
    totalPages,
    muscles,
    qualities,
    levels,
    equipments,
    resetFilters,
  } = useExerciseCatalog({ initialPageSize: 12 });

  const {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    addCustomExercise,
  } = useFavorites();

  const [modalExercise, setModalExercise] = useState<Exercise | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const isFilterActive =
    searchQuery.trim().length > 0 ||
    selectedMuscle !== 'Tutti' ||
    selectedQuality !== 'Tutte' ||
    selectedLevel !== 'Tutti' ||
    selectedEquipment !== 'Tutta';

  return (
    <div className="exercise-catalog-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intestazione Catalogo (Foto 1) */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
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
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary, #6366f1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              LIBRERIA COMPLETA
            </span>
            <span
              className="results-counter-pill"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary, #94a3b8)',
                background: 'rgba(255,255,255,0.04)',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <strong style={{ color: 'var(--text-primary, #ffffff)' }}>{totalCount}</strong> esercizi disponibili
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Catalogo Esercizi
          </h2>
        </div>
      </section>

      {/* Toolbar Orizzontale Compatta (Foto 1 & Foto 2) */}
      <section
        className="filter-bar-main"
        style={{
          background: 'rgba(17, 24, 39, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        {/* Campo Cerca con Lente SVG */}
        <div style={{ flex: '1 1 240px', position: 'relative', minWidth: '200px' }}>
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cerca esercizi (es. Squat, Panc)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              background: '#090d16',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.85rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Dropdown Muscolo */}
        <select
          value={selectedMuscle}
          onChange={(e) => setSelectedMuscle(e.target.value)}
          aria-label="Filtro distretto muscolare"
          style={{
            padding: '0.55rem 0.75rem',
            background: '#090d16',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          {muscles.map((m) => (
            <option key={m} value={m}>
              Muscolo: {m}
            </option>
          ))}
        </select>

        {/* Dropdown Livello */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          aria-label="Filtro livello atletico"
          style={{
            padding: '0.55rem 0.75rem',
            background: '#090d16',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <option value="Tutti">Livello: Tutti</option>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>

        {/* Dropdown Attrezzatura */}
        <select
          value={selectedEquipment}
          onChange={(e) => setSelectedEquipment(e.target.value)}
          aria-label="Filtro attrezzatura"
          style={{
            padding: '0.55rem 0.75rem',
            background: '#090d16',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          {equipments.map((eq) => (
            <option key={eq} value={eq}>
              Attrezzatura: {eq}
            </option>
          ))}
        </select>

        {/* Dropdown Qualità (Foto 2) */}
        <select
          value={selectedQuality}
          onChange={(e) => setSelectedQuality(e.target.value)}
          aria-label="Filtro qualità allenata"
          style={{
            padding: '0.55rem 0.75rem',
            background: '#090d16',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <option value="Tutte">Tutte le Qualità</option>
          {qualities.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>

        {/* Pulsante verde in evidenza: + Aggiungi (Foto 2) */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          style={{
            padding: '0.55rem 1.15rem',
            background: '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          }}
        >
          + Aggiungi
        </button>

        {/* Reset Filtri */}
        {isFilterActive && (
          <button
            type="button"
            onClick={resetFilters}
            style={{
              padding: '0.55rem 0.85rem',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        )}
      </section>

      {/* Griglia Esercizi (Foto 1) */}
      {paginatedExercises.length === 0 ? (
        <div
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: '#64748b',
            background: '#090d16',
            borderRadius: '0.5rem',
            border: '1px solid #1e293b',
          }}
        >
          Nessun esercizio trovato. Prova a modificare i filtri di ricerca.
        </div>
      ) : (
        <div className="catalog-grid">
          {paginatedExercises.map((exercise) => (
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

      {/* Paginazione */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
          }}
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            style={{
              padding: '0.45rem 0.85rem',
              background: page <= 1 ? '#090d16' : '#1e293b',
              color: page <= 1 ? '#475569' : '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            &lt;- Precedente
          </button>

          <span style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '0 0.5rem' }}>
            Pagina <strong>{page}</strong> di <strong>{totalPages}</strong>
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              padding: '0.45rem 0.85rem',
              background: page >= totalPages ? '#090d16' : '#1e293b',
              color: page >= totalPages ? '#475569' : '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Successiva -&gt;
          </button>
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

      {/* Modale Aggiungi Esercizio Custom */}
      {isAddModalOpen && (
        <AddExerciseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newEx: Exercise) => {
            addCustomExercise(newEx);
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
