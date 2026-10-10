/**
 * src/features/sources/PaperDetailModal.tsx
 * Modale "Leggi evidenza" per i dettagli completi del paper scientifico.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Zero numeri magici.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React, { useEffect, useCallback } from 'react';
import type { ScientificSource } from '../../types/rag';

export interface PaperDetailModalProps {
  paper: ScientificSource | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modale di dettaglio e consultazione dello studio scientifico peer-reviewed.
 */
export const PaperDetailModal: React.FC<PaperDetailModalProps> = ({ paper, isOpen, onClose }) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !paper) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 14, 20, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.75rem',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Header modale */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1f293d',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            background: '#0b0e14',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                }}
              >
                {paper.area || 'Scientific Paper'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Anno {paper.year}
              </span>
              {paper.studyType && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                  }}
                >
                  {paper.studyType}
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0, lineHeight: 1.35 }}>
              {paper.title}
            </h3>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              {paper.authors}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi finestra"
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#94a3b8',
              borderRadius: '0.375rem',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Contenuto modale */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Rivista e Link */}
          <div
            style={{
              background: '#0b0e14',
              border: '1px solid #1f293d',
              borderRadius: '0.5rem',
              padding: '0.85rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Rivista Scientifica</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', marginTop: '0.15rem' }}>
                {paper.journal}
              </div>
            </div>

            {paper.url && (
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#6366f1',
                  color: '#ffffff',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>Consulta su PubMed / DOI</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>

          {/* Abstract Completo */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Abstract dello Studio
            </h4>
            <div
              style={{
                background: '#0b0e14',
                border: '1px solid #1f293d',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontSize: '0.875rem',
                color: '#cbd5e1',
                lineHeight: 1.65,
              }}
            >
              {paper.abstract}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
