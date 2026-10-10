/**
 * src/features/rag/StructuredAnswerCard.tsx
 * Visualizzatore di Risposta RAG Strutturata nei 5 box ad alto contrasto (Foto 4).
 *
 * Conforme a:
 * - Foto 4: 1. Quadro Generale (viola), 2. Meccanismi Fisiologici (verde), 3. Indicazioni Pratiche (blu),
 *           4. Fonti Correlate con similarity score, 5. Parametri e Metriche con chip.
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Zero numeri magici.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React from 'react';
import type { StructuredRagAnswer } from './useRag';

export interface StructuredAnswerCardProps {
  answer: StructuredRagAnswer;
}

/**
 * Visualizzatore strutturato in 5 box della risposta semantica RAG.
 */
export const StructuredAnswerCard: React.FC<StructuredAnswerCardProps> = ({ answer }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Box 1: RISPOSTA E QUADRO GENERALE (Viola / Indigo) */}
      <div
        style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid #6366f1',
          borderLeft: '5px solid #6366f1',
          borderRadius: '0.65rem',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#818cf8',
              background: 'rgba(99, 102, 241, 0.15)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            QUADRO GENERALE
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Risposta Sintetica &amp; Razionale Scientifico
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6 }}>
          {answer.overview}
        </p>
      </div>

      {/* Box 2: MECCANISMI FISIOLOGICI & PRINCIPI CHIAVE (Verde Smeraldo) */}
      <div
        style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid #10b981',
          borderLeft: '5px solid #10b981',
          borderRadius: '0.65rem',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#34d399',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            FISIOLOGIA &amp; BIOMECCANICA
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Meccanismi Fisiologici &amp; Principi Chiave
          </h3>
        </div>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {answer.mechanisms.map((mech, idx) => (
            <li key={idx} style={{ fontSize: '0.875rem', color: '#d1fae5', lineHeight: 1.5 }}>
              {mech}
            </li>
          ))}
        </ol>
      </div>

      {/* Box 3: INDICAZIONI PRATICHE & APPLICAZIONE (Ciano / Blu) */}
      <div
        style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid #06b6d4',
          borderLeft: '5px solid #06b6d4',
          borderRadius: '0.65rem',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#38bdf8',
              background: 'rgba(6, 182, 212, 0.15)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            APPLICAZIONE PRATICA
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Indicazioni Pratiche &amp; Protocolli di Carico
          </h3>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {answer.practicalApplications.map((app, idx) => (
            <li key={idx} style={{ fontSize: '0.875rem', color: '#e0f2fe', lineHeight: 1.5 }}>
              {app}
            </li>
          ))}
        </ul>
      </div>

      {/* Box 4: APPROFONDIMENTO FONTI CORRELATE (Documenti & Peer-Reviewed) */}
      <div
        style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.65rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              FONTI EVIDENZA
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Approfondimento Fonti Correlate
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {answer.correlatedSources.length} estratti verificati
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {answer.correlatedSources.map((src, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-body, #0b0e14)',
                border: '1px solid var(--border, #1f293d)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
                  {src.sourceName}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                  }}
                >
                  Similarity Score: {src.similarityScore.toFixed(4)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.45 }}>
                &quot;{src.excerpt}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Box 5: PARAMETRI E METRICHE RILEVATE (Chip Numerici) */}
      <div
        style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.65rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.15)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            METRICHE ESTRATTE
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Parametri e Metriche Rilevate
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
          {answer.parametersAndMetrics.map((metric, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-body, #0b0e14)',
                border: '1px solid var(--border, #1f293d)',
                borderRadius: '0.375rem',
                padding: '0.65rem 0.85rem',
              }}
            >
              <div style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                {metric.label}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.2rem' }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
