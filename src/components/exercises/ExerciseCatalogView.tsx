/**
 * src/components/exercises/ExerciseCatalogView.tsx
 * Visualizzatore del catalogo scientifico con barra di ricerca, filtri combinati e paginazione.
 * Conforme a:
 * - Regola R3: Componente snello; logica delegata a useExerciseCatalog.
 * - Regola 01: Zero emoji spontanee.
 * - Regola R1: Zero any, tipizzazione con Exercise.
 */

import React from 'react';
import { useExerciseCatalog } from '../../hooks/useExerciseCatalog';
import { ExerciseCard } from './ExerciseCard';

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
    page,
    setPage,
    paginatedExercises,
    totalCount,
    totalPages,
    muscles,
    qualities,
    levels,
    resetFilters
  } = useExerciseCatalog({ initialPageSize: 6 });

  return (
    <div className="exercise-catalog-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Catalogo */}
      <section className="catalog-header" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Catalogo Esercizi Scientifico
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
          Repository biomeccanico degli esercizi con classificazione anatomica, cues motori ed analisi degli errori.
        </p>
      </section>

      {/* Sezione Filtri e Ricerca */}
      <section
        className="filters-panel"
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {/* Barra di ricerca principale */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              aria-label="Cerca esercizio per nome, muscolo o tag"
              placeholder="Cerca esercizio per nome, muscolo, tag (es. panca, squat, glutei)..."
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
                boxSizing: 'border-box'
              }}
            />
          </div>

          {(searchQuery || selectedMuscle !== 'Tutti' || selectedQuality !== 'Tutte' || selectedLevel !== 'Tutti') && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                padding: '0.6rem 0.9rem',
                background: '#334155',
                color: '#cbd5e1',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Ripristina Filtri
            </button>
          )}
        </div>

        {/* Dropdown Filtri Multipli */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.85rem'
          }}
        >
          {/* Gruppo Muscolare */}
          <div>
            <label
              htmlFor="filter-muscle"
              style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase' }}
            >
              Gruppo Muscolare
            </label>
            <select
              id="filter-muscle"
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              {muscles.map((muscle) => (
                <option key={muscle} value={muscle}>
                  {muscle}
                </option>
              ))}
            </select>
          </div>

          {/* Qualità Atletica */}
          <div>
            <label
              htmlFor="filter-quality"
              style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase' }}
            >
              Qualità Atletica
            </label>
            <select
              id="filter-quality"
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              <option value="Tutte">Tutte le Qualità</option>
              {qualities.map((quality) => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>
          </div>

          {/* Livello Tecnico */}
          <div>
            <label
              htmlFor="filter-level"
              style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase' }}
            >
              Livello Tecnico
            </label>
            <select
              id="filter-level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              <option value="Tutti">Tutti i Livelli</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Barra contatore risultati */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
          <span>
            Risultati trovati: <strong style={{ color: '#f8fafc' }}>{totalCount}</strong>
          </span>
          {totalPages > 1 && (
            <span>
              Pagina {page} di {totalPages}
            </span>
          )}
        </div>
      </section>

      {/* Griglia delle Card Esercizio */}
      {paginatedExercises.length > 0 ? (
        <section
          className="exercises-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {paginatedExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </section>
      ) : (
        <div
          style={{
            padding: '2.5rem',
            background: '#0f172a',
            border: '1px dashed #334155',
            borderRadius: '0.5rem',
            textAlign: 'center',
            color: '#94a3b8'
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Nessun esercizio corrispondente ai filtri impostati
          </div>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            Prova a modificare il termine di ricerca o azzera i filtri muscolari e qualitativi.
          </p>
        </div>
      )}

      {/* Paginazione */}
      {totalPages > 1 && (
        <nav
          aria-label="Navigazione pagine catalogo"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem'
          }}
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            style={{
              padding: '0.45rem 0.85rem',
              background: page <= 1 ? '#1e293b' : '#334155',
              color: page <= 1 ? '#64748b' : '#f8fafc',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              cursor: page <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Precedente
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
            <button
              key={pNum}
              type="button"
              onClick={() => setPage(pNum)}
              style={{
                width: '36px',
                height: '36px',
                background: pNum === page ? '#6366f1' : '#1e293b',
                color: pNum === page ? '#ffffff' : '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: pNum === page ? 700 : 400,
                cursor: 'pointer'
              }}
            >
              {pNum}
            </button>
          ))}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              padding: '0.45rem 0.85rem',
              background: page >= totalPages ? '#1e293b' : '#334155',
              color: page >= totalPages ? '#64748b' : '#f8fafc',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Successivo
          </button>
        </nav>
      )}
    </div>
  );
};
