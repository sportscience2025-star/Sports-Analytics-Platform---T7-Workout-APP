/**
 * src/features/sources/SourcesView.tsx
 * Visualizzatore completo della Libreria Evidenze Scientifiche (322 fonti peer-reviewed).
 *
 * Conforme a:
 * - Modulo 5: Database indicizzato di paper scientifici accreditati, filtri tematici per tag,
 *             ricerca full-text e modale "Leggi evidenza" con abstract strutturato.
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Zero numeri magici, costanti in MAIUSCOLO.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React, { useState, useMemo } from 'react';
import { scientificSources } from '../../data/sources';
import type { ScientificSource } from '../../types/rag';
import { PaperDetailModal } from './PaperDetailModal';

const CATEGORIES: string[] = [
  'Tutti',
  'Biomeccanica',
  'Fisiologia',
  'VBT',
  'Clinico',
  'Atletica Leggera',
  'Sollevamento Pesi',
  'Sport di Squadra',
  'Riabilitazione',
  'Nutrizione Sportiva',
  'Prevenzione Infortuni',
  'Psicologia dello Sport',
  'Sport Individuali',
];

const PAGE_SIZE = 18;

/**
 * View principale del modulo Libreria Fonti Scientifiche.
 */
export const SourcesView: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<string>('Tutti');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<ScientificSource | null>(null);
  const [page, setPage] = useState<number>(1);

  const filteredSources = useMemo<ScientificSource[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    return scientificSources.filter((src) => {
      const matchArea = selectedArea === 'Tutti' || src.area === selectedArea;
      if (!matchArea) return false;

      if (!q) return true;
      const matchTitle = src.title.toLowerCase().includes(q);
      const matchAuthors = src.authors.toLowerCase().includes(q);
      const matchJournal = src.journal.toLowerCase().includes(q);
      const matchAbstract = src.abstract ? src.abstract.toLowerCase().includes(q) : false;
      const matchYear = String(src.year).includes(q);

      return matchTitle || matchAuthors || matchJournal || matchAbstract || matchYear;
    });
  }, [selectedArea, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSources.length / PAGE_SIZE));
  const paginatedSources = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSources.slice(start, start + PAGE_SIZE);
  }, [filteredSources, page]);

  const handleAreaChange = (cat: string) => {
    setSelectedArea(cat);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  return (
    <div className="sources-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Modulo */}
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
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              EVIDENZE PEER-REVIEWED
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
              <strong style={{ color: 'var(--text-primary, #f1f5f9)' }}>{scientificSources.length}</strong> paper indicizzati
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #f1f5f9)' }}>
            Libreria Fonti Scientifiche
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Repository di pubblicazioni peer-reviewed, RCT e metanalisi per la prescrizione dell&apos;allenamento evidence-based.
          </p>
        </div>
      </section>

      {/* Toolbar Ricerca & Filtri Categorie */}
      <section
        style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.5rem',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
        }}
      >
        {/* Campo Cerca */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cerca per autore (Badillo, Suchomel, Rhea), titolo, rivista o anno..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.5rem',
              background: 'var(--bg-body, #0b0e14)',
              border: '1px solid var(--border, #1f293d)',
              borderRadius: '0.375rem',
              color: 'var(--text-primary, #f1f5f9)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Chips Filtro Categorie Tematiche */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedArea === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleAreaChange(cat)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.25rem',
                  border: isActive ? '1px solid #6366f1' : '1px solid var(--border, #1f293d)',
                  background: isActive ? '#6366f1' : 'var(--bg-body, #0b0e14)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Griglia Card Studi */}
      {filteredSources.length === 0 ? (
        <div
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: '#64748b',
            background: 'var(--bg-surface, #111827)',
            borderRadius: '0.5rem',
            border: '1px dashed var(--border, #1f293d)',
          }}
        >
          Nessuna evidenza scientifica corrisponde ai filtri impostati.
        </div>
      ) : (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {paginatedSources.map((source) => (
            <article
              key={source.id}
              onClick={() => setSelectedSource(source)}
              style={{
                background: 'var(--bg-surface, #111827)',
                border: '1px solid var(--border, #1f293d)',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                    }}
                  >
                    {source.area || 'Generale'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{source.year}</span>
                </div>

                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    margin: '0 0 0.35rem 0',
                    lineHeight: '1.35',
                  }}
                >
                  {source.title}
                </h3>

                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.4rem 0' }}>
                  {source.authors}
                </p>

                <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  {source.journal}
                </div>

                {source.abstract && (
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#94a3b8',
                      margin: 0,
                      lineHeight: '1.45',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {source.abstract}
                  </p>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border, #1f293d)',
                  paddingTop: '0.65rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ID: {source.id}
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span>Leggi evidenza</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Paginazione */}
      {totalPages > 1 && (
        <nav
          aria-label="Paginazione fonti scientifiche"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
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

      {/* Modale Dettaglio Paper */}
      <PaperDetailModal
        paper={selectedSource}
        isOpen={selectedSource !== null}
        onClose={() => setSelectedSource(null)}
      />
    </div>
  );
};
