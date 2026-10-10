/**
 * src/features/catalog/CatalogView.tsx
 * Visualizzatore completo del Catalogo Esercizi (Cockpit Dark Theme).
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Zero numeri magici, costanti MAIUSCOLE in testa.
 * - Regola R1: Strict TypeScript, zero any.
 * - Regola R3: Modularità e separazione delle responsabilità.
 */

import React, { useState } from 'react';
import { useCatalog } from './useCatalog';
import { useFavorites } from '../../hooks/useFavorites';
import { MultiParamFilterBar } from './MultiParamFilterBar';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseBiomechanicsModal } from './ExerciseBiomechanicsModal';
import { AddExerciseModal } from '../../components/exercises/AddExerciseModal';
import type { Exercise } from '../../types/exercise';

const DEFAULT_PAGE_SIZE = 12;

/**
 * View principale del modulo Catalogo Esercizi.
 */
export const CatalogView: React.FC = () => {
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
    resetFilters,
  } = useCatalog({ initialPageSize: DEFAULT_PAGE_SIZE });

  const { isFavorite, toggleFavorite, addCustomExercise } = useFavorites();
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
      {/* Header Modulo con Badge e Contatore Dinamico */}
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
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
              }}
            >
              <strong style={{ color: 'var(--text-primary, #f1f5f9)' }}>{totalCount}</strong> esercizi disponibili
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #f1f5f9)' }}>
            Catalogo Esercizi
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Libreria tassonomica con biomeccanica, cue tecnici verbali, criteri oggettivi ed errori comuni.
          </p>
        </div>
      </section>

      {/* Barra Filtri Multi-Parametro */}
      <MultiParamFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedMuscle={selectedMuscle}
        onMuscleChange={setSelectedMuscle}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        selectedEquipment={selectedEquipment}
        onEquipmentChange={setSelectedEquipment}
        selectedQuality={selectedQuality}
        onQualityChange={setSelectedQuality}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetFilters={resetFilters}
        isFilterActive={isFilterActive}
      />

      {/* Griglia Esercizi (Responsive 3 colonne) */}
      {paginatedExercises.length > 0 ? (
        <section
          className="catalog-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {paginatedExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isFavorite={isFavorite(exercise.id)}
              onToggleFavorite={toggleFavorite}
              onOpenDetailModal={setModalExercise}
            />
          ))}
        </section>
      ) : (
        /* Empty State */
        <div
          style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px dashed var(--border, #1f293d)',
            borderRadius: '0.75rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary, #6366f1)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)', margin: '0 0 0.25rem 0' }}>
              Nessun esercizio trovato
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, maxWidth: '420px' }}>
              I parametri di ricerca o i filtri selezionati non hanno prodotto risultati. Prova a reimpostare i filtri per vedere tutti gli esercizi.
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            style={{
              background: 'var(--primary, #6366f1)',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reimposta Filtri
          </button>
        </div>
      )}

      {/* Controlli di Paginazione */}
      {totalPages > 1 && (
        <nav
          aria-label="Paginazione catalogo"
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
              background: 'var(--bg-surface, #111827)',
              border: '1px solid var(--border, #1f293d)',
              color: page <= 1 ? '#475569' : 'var(--text-primary, #f1f5f9)',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Precedente
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', padding: '0 0.5rem' }}>
            Pagina <strong style={{ color: 'var(--text-primary, #f1f5f9)' }}>{page}</strong> di {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              background: 'var(--bg-surface, #111827)',
              border: '1px solid var(--border, #1f293d)',
              color: page >= totalPages ? '#475569' : 'var(--text-primary, #f1f5f9)',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Successiva
          </button>
        </nav>
      )}

      {/* Modale Dettaglio Biomeccanico */}
      <ExerciseBiomechanicsModal
        exercise={modalExercise}
        isOpen={modalExercise !== null}
        onClose={() => setModalExercise(null)}
        isFavorite={modalExercise ? isFavorite(modalExercise.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      {/* Modale Aggiunta Esercizio */}
      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(newEx) => {
          addCustomExercise(newEx);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};
