/**
 * src/components/rag/RAGKnowledgeView.tsx
 * Componente visuale per il Knowledge Hub scientifico e consultazione RAG in-browser.
 *
 * Conforme a:
 * - Regola R3: Componente snello; logica delegata a useRAGKnowledge.
 * - Regola 01: Zero emoji spontanee nell'interfaccia.
 * - Regola R1: Zero any, tipizzazione con ScientificSource.
 */

import React from 'react';
import { useRAGKnowledge } from '../../hooks/useRAGKnowledge';

export const RAGKnowledgeView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedArea,
    setSelectedArea,
    selectedStudyType,
    setSelectedStudyType,
    page,
    setPage,
    areas,
    studyTypes,
    paginatedSources,
    totalCount,
    totalPages,
    executiveSummary,
    resetFilters
  } = useRAGKnowledge({ initialPageSize: 6 });

  return (
    <div className="rag-knowledge-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intestazione del Modulo */}
      <section className="section-header" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Knowledge Hub Scientifico &amp; Consultazione RAG
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
          Archivio peer-reviewed di 320+ studi scientifici indicizzati per fisiologia, biomeccanica, VBT e riabilitazione.
        </p>
      </section>

      {/* Pannello Ricerca & Filtri */}
      <section
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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              aria-label="Cerca evidenze scientifiche per parola chiave, autore o rivista"
              placeholder="Interroga il Knowledge Hub (es. Samozino, velocity loss, hypertrophy, ACL, squat)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
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

          {(searchQuery || selectedArea !== 'Tutte' || selectedStudyType !== 'Tutti') && (
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

        {/* Filtri tematici per Area e Tipologia Studio */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="rag-area-select" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Disciplina:
            </label>
            <select
              id="rag-area-select"
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.45rem 0.75rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              <option value="Tutte">Tutte le Discipline ({totalCount})</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="rag-type-select" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Design Studio:
            </label>
            <select
              id="rag-type-select"
              value={selectedStudyType}
              onChange={(e) => {
                setSelectedStudyType(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.45rem 0.75rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              <option value="Tutti">Tutti i Tipi</option>
              {studyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 'auto' }}>
            Studi Corrispondenti: {totalCount}
          </span>
        </div>
      </section>

      {/* RAG Executive Summary (Visualizzato quando c'è una ricerca attiva) */}
      {executiveSummary && (
        <section
          style={{
            background: '#090d16',
            border: '1px solid #3b82f6',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#60a5fa', margin: 0 }}>
              Sintesi dell Evidenza RAG (Riepilogo Esecutivo)
            </h3>
            <span
              style={{
                fontSize: '0.75rem',
                background: '#1e3a8a',
                color: '#bfdbfe',
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem'
              }}
            >
              {executiveSummary.sourceCount} Fonti Analizzate
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            {executiveSummary.overviewText}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {executiveSummary.extractedMetrics.map((m, idx) => (
              <div key={idx} style={{ background: '#1e293b', padding: '0.6rem 0.75rem', borderRadius: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>{m.label}</span>
                <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{m.value}</strong>
              </div>
            ))}
          </div>

          {executiveSummary.practicalTakeaways.length > 0 && (
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8', display: 'block', marginBottom: '0.35rem' }}>
                Evidenze Chiave Estratte:
              </span>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                {executiveSummary.practicalTakeaways.map((takeaway, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Risultati: Griglia Documenti Scientifici */}
      {paginatedSources.length === 0 ? (
        <div
          style={{
            padding: '2.5rem',
            background: '#0f172a',
            borderRadius: '0.5rem',
            textAlign: 'center',
            color: '#64748b',
            border: '1px dashed #334155'
          }}
        >
          Nessuna evidenza scientifica corrisponde ai criteri di ricerca impostati.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {paginatedSources.map((source) => (
            <article
              key={source.id}
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'border-color 0.15s ease'
              }}
            >
              {/* Header Articolo: Badge Disciplina & Tipologia */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.25rem',
                    background: '#1e293b',
                    color: '#38bdf8'
                  }}
                >
                  {source.area}
                </span>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {source.studyType && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.45rem',
                        borderRadius: '0.25rem',
                        background: '#064e3b',
                        color: '#6ee7b7'
                      }}
                    >
                      {source.studyType}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '0.25rem',
                      background: '#1e293b',
                      color: '#94a3b8'
                    }}
                  >
                    {source.year}
                  </span>
                </div>
              </div>

              {/* Titolo e Autori */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.35rem 0', lineHeight: 1.35 }}>
                  {source.title}
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 500 }}>
                  {source.authors}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.15rem' }}>
                  {source.journal} ({source.year})
                </div>
              </div>

              {/* Estratto Abstract */}
              <p
                style={{
                  fontSize: '0.825rem',
                  color: '#cbd5e1',
                  margin: 0,
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {source.abstract}
              </p>

              {/* Regole & Applicabilita (se presenti) */}
              {source.rules && (
                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {source.rules.sports && source.rules.sports.length > 0 && (
                    <div>
                      Sport: <strong style={{ color: '#e2e8f0' }}>{source.rules.sports.join(', ')}</strong>
                    </div>
                  )}
                  {source.rules.goals && source.rules.goals.length > 0 && (
                    <div>
                      Obiettivi: <strong style={{ color: '#e2e8f0' }}>{source.rules.goals.join(', ')}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Footer con Link alla Fonte Originale */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid #1e293b', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    color: '#6366f1',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Consulta su PubMed / Journal
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Controlli di Paginazione */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            style={{
              padding: '0.45rem 0.85rem',
              background: '#1e293b',
              color: page <= 1 ? '#475569' : '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              cursor: page <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Precedente
          </button>

          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Pagina {page} di {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            style={{
              padding: '0.45rem 0.85rem',
              background: '#1e293b',
              color: page >= totalPages ? '#475569' : '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Successiva
          </button>
        </div>
      )}
    </div>
  );
};
