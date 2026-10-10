/**
 * src/components/wizard/ProgramActionsBar.tsx
 * Barra dei comandi per l'esportazione e gestione della scheda (Excel, PDF/Stampa, Backup, Reset).
 * Utilizzabile sia in cima al report sia in calce.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee nell'interfaccia.
 * - Regola 02: Single responsibility e commenti chiari.
 * - Regola R1: Zero any, TypeScript strict.
 */

import React from 'react';

interface ProgramActionsBarProps {
  onExportExcel: () => void;
  onExportPdf: () => void;
  onBackupJson: () => void;
  onReset: () => void;
  position: 'top' | 'bottom';
}

const BASE_BTN_STYLE: React.CSSProperties = {
  padding: '0.5rem 0.9rem',
  borderRadius: '0.375rem',
  fontSize: '0.825rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap'
};

/**
 * Componente per la barra dei pulsanti di esportazione (posizionabile in alto o in basso).
 *
 * @param props - Callback di gestione click e posizione
 * @returns Elemento JSX della barra azioni
 */
export const ProgramActionsBar: React.FC<ProgramActionsBarProps> = ({
  onExportExcel,
  onExportPdf,
  onBackupJson,
  onReset,
  position
}) => {

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    ...(position === 'bottom'
      ? {
          borderTop: '1px solid #1e293b',
          paddingTop: '1.25rem',
          justifyContent: 'flex-end',
          marginTop: '0.5rem'
        }
      : {})
  };

  return (
    <div
      className={`report-actions-v3 report-actions-${position}`}
      style={containerStyle}
      role="toolbar"
      aria-label={`Azioni Programma (${position === 'top' ? 'Superiore' : 'Inferiore'})`}
    >
      <button
        type="button"
        onClick={onExportExcel}
        className="btn-excel-export"
        style={{
          ...BASE_BTN_STYLE,
          background: '#10b981',
          color: '#ffffff',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
        }}
      >
        Excel (.xlsx)
      </button>

      <button
        type="button"
        onClick={onExportPdf}
        className="btn-pdf-export"
        style={{
          ...BASE_BTN_STYLE,
          background: '#0284c7',
          color: '#ffffff',
          fontWeight: 600,
        }}
      >
        PDF / Stampa
      </button>

      <button
        type="button"
        onClick={onBackupJson}
        className="btn-backup-json"
        style={{
          ...BASE_BTN_STYLE,
          background: '#334155',
          color: '#cbd5e1',
        }}
      >
        Backup JSON
      </button>

      <button
        type="button"
        onClick={onReset}
        className="btn-close-report"
        style={{
          ...BASE_BTN_STYLE,
          background: '#1e293b',
          color: '#cbd5e1',
          border: '1px solid #334155',
        }}
      >
        + Nuova Scheda
      </button>
    </div>
  );
};
