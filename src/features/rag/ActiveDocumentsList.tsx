/**
 * src/features/rag/ActiveDocumentsList.tsx
 * Lista dei documenti caricati nella Knowledge Base locale (Pannello Sinistro RAG, Foto 3).
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Zero numeri magici.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React from 'react';
import type { RagDocument } from '../../types/rag';

export interface ActiveDocumentsListProps {
  documents: RagDocument[];
  onDeleteDocument: (id: string) => void;
}

const BYTES_PER_KB = 1024;

/**
 * Visualizzatore della lista dei documenti attivi nella knowledge base locale.
 */
export const ActiveDocumentsList: React.FC<ActiveDocumentsListProps> = ({
  documents,
  onDeleteDocument,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Documenti Attivi ({documents.length})
        </span>
        <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          IndexedDB Attivo
        </span>
      </div>

      {documents.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-body, #0b0e14)',
            border: '1px dashed var(--border, #1f293d)',
            borderRadius: '0.5rem',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.8rem',
            lineHeight: 1.5,
          }}
        >
          Nessun documento caricato in memoria locale. Trascina un file per avviare l&apos;indicizzazione vettoriale.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
          {documents.map((doc) => {
            const kbSize = Math.round(doc.sizeBytes / BYTES_PER_KB);
            return (
              <div
                key={doc.id}
                style={{
                  background: 'var(--bg-body, #0b0e14)',
                  border: '1px solid var(--border, #1f293d)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#818cf8',
                      padding: '0.35rem',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>

                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#f1f5f9',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '180px',
                      }}
                      title={doc.name}
                    >
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'flex', gap: '0.4rem', marginTop: '0.15rem' }}>
                      <span>{kbSize} KB</span>
                      <span>•</span>
                      <span>~{doc.tokenCount} token</span>
                      <span>•</span>
                      <span>{doc.chunksCount} chunk</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteDocument(doc.id)}
                  title="Elimina documento"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    padding: '0.35rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
