/**
 * src/components/sources/ScientificSourcesView.tsx
 * Visualizzatore interattivo della Libreria Evidenze Scientifiche (322 fonti peer-reviewed).
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola R3: Componente modulare e performante.
 * - Regola R1: Zero any, tipizzazione con ScientificSource.
 */

import React, { useState, useMemo } from 'react';
import { scientificSources } from '../../data/sources';
import type { ScientificSource } from '../../types/rag';

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

const PAGE_SIZE = 24;

export const ScientificSourcesView: React.FC = () => {
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
    <div className="scientific-sources-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            Libreria Evidenze Scientifiche
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
            Repository di 322 pubblicazioni scientifiche peer-reviewed, RCT e metanalisi per la periodizzazione evidence-based.
          </p>
        </div>

        <span
          className="results-counter-pill"
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#818cf8',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            padding: '0.4rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <strong>{filteredSources.length}</strong> fonti disponibili
        </span>
      </section>

      {/* Toolbar Ricerca & Filtri Categoria */}
      <section
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Input Ricerca */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Cerca per autore, titolo studio, rivista o parola chiave..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.375rem',
              color: '#f8fafc',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Chip Categorie */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedArea === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleAreaChange(cat)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '0.25rem',
                  border: isActive ? '1px solid #6366f1' : '1px solid #334155',
                  background: isActive ? '#6366f1' : '#1e293b',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 600 : 500,
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

      {/* Griglia Card Evidenze Scientifiche */}
      {filteredSources.length === 0 ? (
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
          Nessuna evidenza scientifica corrisponde ai filtri selezionati.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {paginatedSources.map((source) => (
            <article
              key={source.id}
              onClick={() => setSelectedSource(source)}
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
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

                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>
                  {source.authors}
                </p>

                <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  {source.journal}
                </div>

                {source.abstract && (
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      lineHeight: '1.4',
                      margin: 0,
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
                  borderTop: '1px solid #1e293b',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#10b981',
                      textDecoration: 'none',
                    }}
                  >
                    PubMed / DOI -&gt;
                  </a>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Archivio T7</span>
                )}

                <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>
                  Dettagli studio -&gt;
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Controlli Paginazione Fonti Scientifiche */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Pagina <strong style={{ color: '#f8fafc' }}>{page}</strong> di {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Modale Dettaglio Fonte Scientifica */}
      {selectedSource && (
        <div
          onClick={() => setSelectedSource(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.25rem',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#818cf8',
                  }}
                >
                  {selectedSource.area} • {selectedSource.year}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  {selectedSource.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  {selectedSource.authors}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#38bdf8', fontStyle: 'italic', marginTop: '0.25rem' }}>
                  {selectedSource.journal}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                }}
              >
                x
              </button>
            </div>

            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'block', marginBottom: '0.35rem' }}>
                Abstract &amp; Sintesi Clinico-Biomeccanica:
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                {selectedSource.abstract || 'Nessun abstract sintetico registrato per questa pubblicazione.'}
              </p>
            </div>

            {selectedSource.url && (
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href={selectedSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#10b981',
                    color: '#ffffff',
                    borderRadius: '0.375rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Apri su PubMed / DOI -&gt;
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
