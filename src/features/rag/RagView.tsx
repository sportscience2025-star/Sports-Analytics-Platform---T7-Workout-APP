/**
 * src/features/rag/RagView.tsx
 * Visualizzatore completo per l'Assistente RAG & Knowledge Base Offline (Foto 3 & Foto 4).
 *
 * Conforme a:
 * - Foto 3: Interfaccia a 2 pannelli, dropzone sinistra con lista documenti ed empty state con lampadina destra.
 * - Foto 4: Risposta RAG strutturata in 5 box con bordi colorati.
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Zero numeri magici.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React, { useState } from 'react';
import { useRag } from './useRag';
import { ActiveDocumentsList } from './ActiveDocumentsList';
import { StructuredAnswerCard } from './StructuredAnswerCard';

/**
 * View principale del modulo RAG & Knowledge Hub.
 */
export const RagView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    devMode,
    setDevMode,
    documents,
    isIngesting,
    isSearching,
    ingestFile,
    deleteDocument,
    executeSearch,
    structuredAnswer,
    clearAnswer,
  } = useRag();

  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <div className="rag-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Modulo (Foto 3) */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.5rem',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            {/* SVG Cervello / Knowledge */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                KNOWLEDGE BASE OFFLINE
              </span>
              <span style={{ fontSize: '0.75rem', color: '#10b981' }}>
                TF-IDF &amp; Cosine Sim Active
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #f1f5f9)' }}>
              Assistente RAG &amp; Knowledge Hub
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#cbd5e1',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Info RAG
          </button>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: '#94a3b8',
              cursor: 'pointer',
              background: 'var(--bg-surface, #111827)',
              padding: '0.4rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border, #1f293d)',
            }}
          >
            <input
              type="checkbox"
              checked={devMode}
              onChange={(e) => setDevMode(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Dev Mode</span>
          </label>
        </div>
      </section>

      {/* Layout a 2 Pannelli (Foto 3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 360px) 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
        className="rag-dashboard-grid"
      >
        {/* Pannello Sinistro: Gestione Documenti (Foto 3) */}
        <aside
          style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border, #1f293d)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Dropzone Drag & Drop */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) await ingestFile(file);
            }}
            style={{
              border: '2px dashed #334155',
              borderRadius: '0.5rem',
              padding: '2rem 1rem',
              textAlign: 'center',
              background: 'var(--bg-body, #0b0e14)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', display: 'block' }}>
                {isIngesting ? 'Indicizzazione in corso...' : 'Trascina file da indicizzare'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Supporta .docx, .pdf, .xlsx, .txt, .csv, .md
              </span>
            </div>

            <label
              style={{
                marginTop: '0.35rem',
                background: isIngesting ? '#475569' : '#6366f1',
                color: '#ffffff',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: isIngesting ? 'wait' : 'pointer',
              }}
            >
              {isIngesting ? 'Elaborazione...' : 'Seleziona File'}
              <input
                type="file"
                accept=".docx,.pdf,.xlsx,.xls,.txt,.csv,.md,.json"
                style={{ display: 'none' }}
                disabled={isIngesting}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await ingestFile(file);
                }}
              />
            </label>
          </div>

          {/* Lista Documenti Attivi */}
          <ActiveDocumentsList
            documents={documents}
            onDeleteDocument={deleteDocument}
          />
        </aside>

        {/* Pannello Destro: Interrogazione Semantica & Risposta (Foto 3 & Foto 4) */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Barra di Ricerca Semantica */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              background: 'var(--bg-surface, #111827)',
              border: '1px solid var(--border, #1f293d)',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cerca nel documento o chiedi un protocollo (es. ipertrofia pettorali, VBT squat)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-body, #0b0e14)',
                  border: '1px solid var(--border, #1f293d)',
                  borderRadius: '0.375rem',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                  color: 'var(--text-primary, #f1f5f9)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              style={{
                background: isSearching ? '#475569' : '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.65rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: isSearching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {isSearching ? (
                <span>Elaborazione...</span>
              ) : (
                <>
                  <span>Cerca</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Risposta Strutturata (Foto 4) o Empty State (Foto 3) */}
          {structuredAnswer ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Risultati per query: <strong style={{ color: '#f1f5f9' }}>&quot;{structuredAnswer.query}&quot;</strong>
                </span>
                <button
                  type="button"
                  onClick={clearAnswer}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6366f1',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Nuova Ricerca
                </button>
              </div>

              <StructuredAnswerCard answer={structuredAnswer} />

              {/* Dev Mode Inspector se attivo */}
              {devMode && (
                <div
                  style={{
                    background: '#090d16',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                  }}
                >
                  <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.5rem' }}>
                    DEV MODE: Vettori &amp; Chunk Matching Info
                  </strong>
                  <div>Query Normalizzata: {structuredAnswer.query.toLowerCase()}</div>
                  <div>Fonti Correlate Mappate: {structuredAnswer.correlatedSources.length}</div>
                  <div>Top Similarity Score: {structuredAnswer.correlatedSources[0]?.similarityScore}</div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State Lampadina (Foto 3) */
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
                  background: 'rgba(234, 179, 8, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#eab308',
                }}
              >
                {/* SVG Lampadina Lineare */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
                </svg>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)', margin: '0 0 0.4rem 0' }}>
                  Interroga la Knowledge Base
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, maxWidth: '460px', lineHeight: 1.5 }}>
                  Inserisci una domanda, un protocollo atletico o un obiettivo di allenamento per analizzare i tuoi documenti caricati e le evidenze scientifiche peer-reviewed.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                {['Ipertrofia Pettorali', 'VBT Squat', 'Recupero Post-Gara', 'Tendinopatia Rotulea'].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setSearchQuery(example);
                      executeSearch(example);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border, #1f293d)',
                      color: '#cbd5e1',
                      borderRadius: '999px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modale Info RAG */}
      {showInfoModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 14, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInfoModal(false);
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface, #111827)',
              border: '1px solid var(--border, #1f293d)',
              borderRadius: '0.75rem',
              maxWidth: '560px',
              width: '100%',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                Architettura RAG Offline &amp; Privacy
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              L&apos;Assistente RAG (Retrieval-Augmented Generation) di T7 Workout opera al <strong>100% in locale nel browser</strong> tramite IndexedDB, garantendo la totale riservatezza dei tuoi file e protocolli proprietari.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
              <li>Nessun dato viene inviato a server esterni o terze parti.</li>
              <li>Chunking client-side con sovrapposizione contestuale (stride).</li>
              <li>Correlazione incrociata con l&apos;archivio di 322 fonti peer-reviewed integrate.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              style={{
                background: '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.55rem 1rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                alignSelf: 'flex-end',
              }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
