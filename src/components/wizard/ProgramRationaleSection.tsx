/**
 * src/components/wizard/ProgramRationaleSection.tsx
 * Sezione di approfondimento teorico, rationale biomeccanico, prescrizioni cliniche e bibliografia.
 * Posizionata in calce alla scheda di allenamento per garantire priorita operativa al programma.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee nell'interfaccia.
 * - Regola 02: Single responsibility e commenti chiari.
 * - Regola R1: Zero any, TypeScript strict.
 */

import React from 'react';
import type { ScientificRationale } from '../../types/program';
import { cleanCitationList } from '../../logic/citation-cleaner';

interface ProgramRationaleSectionProps {
  rationale: ScientificRationale;
  periodizationMethod: string;
  periodizationDetail?: {
    name: string;
    rationale: string;
    keyResearchers: string;
  };
  clinicalNotes?: string[];
}

const CARD_BOX_STYLE: React.CSSProperties = {
  background: '#1e293b',
  padding: '0.85rem',
  borderRadius: '0.375rem',
  border: '1px solid #334155'
};

/**
 * Componente per il rendering della sezione teorica e scientifica evidence-based in calce.
 *
 * @param props - Oggetto con rationale, metodo, note cliniche e citazioni
 * @returns Elemento JSX della sezione rationale
 */
export const ProgramRationaleSection: React.FC<ProgramRationaleSectionProps> = ({
  rationale,
  periodizationMethod,
  periodizationDetail,
  clinicalNotes = []
}) => {
  const cleanedCitations = cleanCitationList(rationale.citations);

  return (
    <section
      aria-label="Rationale Scientifico e Bibliografia"
      style={{
        background: '#090d16',
        border: '1px solid #1e293b',
        borderRadius: '0.5rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Rationale Scientifico &amp; Logica di Allenamento AI
        </h4>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Evidenze fisiologiche, biomeccaniche e principi di adattamento neuromuscolare applicati.
        </span>
      </div>

      {/* Griglia a 4 Pilastri */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.85rem'
        }}
      >
        <div style={CARD_BOX_STYLE}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', display: 'block' }}>
            1. Profilo Atleta &amp; Contesto
          </span>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
            {rationale.athleteProfile}
          </p>
        </div>

        <div style={CARD_BOX_STYLE}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', display: 'block' }}>
            2. Architettura di Periodizzazione
          </span>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
            {rationale.periodizationArchitecture}
          </p>
        </div>

        <div style={CARD_BOX_STYLE}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'block' }}>
            3. Prescrizioni Biomeccaniche
          </span>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
            {rationale.biomechanicalPrescriptions}
          </p>
        </div>

        <div style={CARD_BOX_STYLE}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f472b6', display: 'block' }}>
            4. Strategia Velocity-Based Training
          </span>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
            {rationale.vbtStrategy}
          </p>
        </div>
      </div>

      {/* Metodo di Periodizzazione */}
      {periodizationDetail && (
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.375rem',
            padding: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              Metodo di Periodizzazione Adottato: {periodizationMethod}
            </span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.25rem' }}>
            {periodizationDetail.name}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
            {periodizationDetail.rationale}
          </p>
          <span style={{ fontSize: '0.75rem', color: '#a78bfa', display: 'block', marginTop: '0.4rem' }}>
            Riferimenti Chiave: {periodizationDetail.keyResearchers}
          </span>
        </div>
      )}

      {/* Evidenze Scientifiche Pertinenti dalla Letteratura Peer-Reviewed */}
      {rationale.matchedEvidence && rationale.matchedEvidence.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Evidenze Scientifiche Peer-Reviewed Correlate ({rationale.matchedEvidence.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Banca Dati Indicizzata PubMed / DOI
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.85rem'
            }}
          >
            {rationale.matchedEvidence.map((ev) => (
              <div
                key={ev.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      {ev.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                      {ev.year}
                    </span>
                  </div>

                  <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.35 }}>
                    {ev.title}
                  </h5>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    {ev.authors} — <em>{ev.journal}</em>
                  </p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                    {ev.takeaway}
                  </p>
                </div>

                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      color: '#38bdf8',
                      textDecoration: 'none',
                      fontWeight: 600,
                      marginTop: '0.5rem'
                    }}
                  >
                    <span>Leggi evidenza su PubMed</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescrizioni di Sicurezza Clinica */}
      {clinicalNotes.length > 0 && (
        <div
          style={{
            background: '#1c1917',
            border: '1px solid #78350f',
            borderRadius: '0.375rem',
            padding: '1rem'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fcd34d', display: 'block', marginBottom: '0.35rem' }}>
            Prescrizioni di Sicurezza Clinica e Tutela Articolare:
          </span>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.775rem', color: '#fde68a' }}>
            {clinicalNotes.map((note, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Riferimenti Bibliografici Puliti */}
      {cleanedCitations.length > 0 && (
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.85rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
            Riferimenti Scientifici e Bibliografia:
          </span>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
            {cleanedCitations.map((c, idx) => (
              <li key={idx} style={{ marginBottom: '0.2rem' }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
