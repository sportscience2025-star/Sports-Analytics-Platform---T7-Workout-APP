/**
 * src/features/analysis/ManualInputForm.tsx
 * Form reattivo per l'ingestione dati (Foto 2, Colonna Sinistra).
 * Include: Tab Switcher (Carica File / Inserimento Manuale), Stepper MVT,
 * selettore modello OLS, tabella punti Carico-Velocità e pulsanti demo/svuota.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Zero numeri magici, costanti in MAIUSCOLO.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React, { useState } from 'react';
import type { LoadVelocityPoint } from '../../types/physics';
import { EXERCISE_PRESETS } from './useVbtAnalysis';

export interface ManualInputFormProps {
  athleteName: string;
  onAthleteChange: (name: string) => void;
  exerciseName: string;
  onExerciseChange: (exercise: string) => void;
  mvt: number;
  onMvtStep: (delta: number) => void;
  onMvtSet: (val: number) => void;
  regressionModel: 'auto_linear' | 'linear' | 'polynomial';
  onRegressionModelChange: (model: 'auto_linear' | 'linear' | 'polynomial') => void;
  points: LoadVelocityPoint[];
  onAddPoint: (point: LoadVelocityPoint) => void;
  onRemovePoint: (index: number) => void;
  onClearPoints: () => void;
  onLoadDemo: () => void;
  onFileDrop?: (file: File) => Promise<{ success: boolean; message: string; count?: number }> | void;
}

const MVT_STEP = 0.05;

/**
 * Componente form di input e configurazione per il cruscotto VBT.
 */
export const ManualInputForm: React.FC<ManualInputFormProps> = ({
  athleteName,
  onAthleteChange,
  exerciseName,
  onExerciseChange,
  mvt,
  onMvtStep,
  regressionModel,
  onRegressionModelChange,
  points,
  onAddPoint,
  onRemovePoint,
  onClearPoints,
  onLoadDemo,
  onFileDrop,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'file'>('manual');
  const [newLoad, setNewLoad] = useState<string>('');
  const [newVelocity, setNewVelocity] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleProcessFile = async (file: File) => {
    if (!onFileDrop) return;
    try {
      const res = await onFileDrop(file);
      if (res) {
        setUploadStatus(res);
      }
    } catch (err) {
      setUploadStatus({
        success: false,
        message: err instanceof Error ? err.message : 'Errore nel caricamento file',
      });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(newLoad);
    const v = parseFloat(newVelocity);

    if (isNaN(l) || l <= 0) {
      setErrorMsg('Carico non valido (richiesto kg > 0)');
      return;
    }
    if (isNaN(v) || v <= 0 || v > 3.0) {
      setErrorMsg('Velocità non valida (richiesto 0 < m/s <= 3.0)');
      return;
    }

    onAddPoint({ load: l, velocity: v });
    setNewLoad('');
    setNewVelocity('');
    setErrorMsg(null);
  };

  return (
    <div
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
      {/* Tab Switcher: Carica File / Inserimento Manuale (Foto 2) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-body, #0b0e14)',
          borderRadius: '0.5rem',
          padding: '0.25rem',
          border: '1px solid var(--border, #1f293d)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          style={{
            background: activeTab === 'manual' ? '#1e293b' : 'transparent',
            color: activeTab === 'manual' ? '#f1f5f9' : '#94a3b8',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          Inserimento Manuale
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          style={{
            background: activeTab === 'file' ? '#1e293b' : 'transparent',
            color: activeTab === 'file' ? '#f1f5f9' : '#94a3b8',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          Carica File
        </button>
      </div>

      {activeTab === 'file' ? (
        /* Sezione Carica File Drag & Drop */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleProcessFile(file);
            }}
            style={{
              border: '2px dashed #334155',
              borderRadius: '0.5rem',
              padding: '2.5rem 1rem',
              textAlign: 'center',
              background: 'var(--bg-body, #0b0e14)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
              Trascina file CSV, TSV o Excel di encoder
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Riconoscimento automatico colonne Carico e Velocità
            </span>
            <label
              style={{
                marginTop: '0.5rem',
                background: '#6366f1',
                color: '#ffffff',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Seleziona File
              <input
                type="file"
                accept=".csv,.tsv,.txt,.xlsx,.xls"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessFile(file);
                }}
              />
            </label>
          </div>

          {uploadStatus && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                lineHeight: 1.4,
                background: uploadStatus.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: uploadStatus.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                color: uploadStatus.success ? '#34d399' : '#f87171',
              }}
            >
              {uploadStatus.message}
            </div>
          )}
        </div>
      ) : (
        /* Inserimento Manuale */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Input Atleta */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Atleta
            </label>
            <input
              type="text"
              value={athleteName}
              onChange={(e) => onAthleteChange(e.target.value)}
              placeholder="es. Mario Rossi"
              style={{
                width: '100%',
                background: 'var(--bg-body, #0b0e14)',
                border: '1px solid var(--border, #1f293d)',
                borderRadius: '0.375rem',
                padding: '0.55rem 0.75rem',
                color: 'var(--text-primary, #f1f5f9)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Selezione Esercizio */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Esercizio / Tipo Test
            </label>
            <select
              value={exerciseName}
              onChange={(e) => onExerciseChange(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-body, #0b0e14)',
                border: '1px solid var(--border, #1f293d)',
                borderRadius: '0.375rem',
                padding: '0.55rem 0.75rem',
                color: 'var(--text-primary, #f1f5f9)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {EXERCISE_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name} (MVT: {preset.defaultMvt.toFixed(2)} m/s)
                </option>
              ))}
            </select>
          </div>

          {/* Stepper MVT (Foto 2) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Soglia Velocità Minima (MVT)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-body, #0b0e14)',
                border: '1px solid var(--border, #1f293d)',
                borderRadius: '0.375rem',
                padding: '0.25rem 0.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => onMvtStep(-MVT_STEP)}
                style={{
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: 'none',
                  borderRadius: '0.25rem',
                  width: '28px',
                  height: '28px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                -
              </button>
              <span
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#38bdf8',
                  fontSize: '0.9rem',
                }}
              >
                {mvt.toFixed(2)} m/s
              </span>
              <button
                type="button"
                onClick={() => onMvtStep(MVT_STEP)}
                style={{
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: 'none',
                  borderRadius: '0.25rem',
                  width: '28px',
                  height: '28px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Modello di Regressione */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Modello di Regressione
            </label>
            <select
              value={regressionModel}
              onChange={(e) => onRegressionModelChange(e.target.value as 'auto_linear' | 'linear' | 'polynomial')}
              style={{
                width: '100%',
                background: 'var(--bg-body, #0b0e14)',
                border: '1px solid var(--border, #1f293d)',
                borderRadius: '0.375rem',
                padding: '0.55rem 0.75rem',
                color: 'var(--text-primary, #f1f5f9)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="auto_linear">Auto (Consigliato: OLS Lineare)</option>
              <option value="linear">Lineare Puro (Samozino 2012)</option>
              <option value="polynomial">Polinomiale 2° Grado</option>
            </select>
          </div>

          {/* Form Aggiunta Singolo Punto */}
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8' }}>
              Aggiungi Punto di Misurazione
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '0.5rem' }}>
              <input
                type="number"
                step="0.5"
                min="1"
                placeholder="Carico (kg)"
                value={newLoad}
                onChange={(e) => setNewLoad(e.target.value)}
                style={{
                  background: 'var(--bg-body, #0b0e14)',
                  border: '1px solid var(--border, #1f293d)',
                  borderRadius: '0.375rem',
                  padding: '0.45rem 0.65rem',
                  color: 'var(--text-primary, #f1f5f9)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="3.0"
                placeholder="Velocità (m/s)"
                value={newVelocity}
                onChange={(e) => setNewVelocity(e.target.value)}
                style={{
                  background: 'var(--bg-body, #0b0e14)',
                  border: '1px solid var(--border, #1f293d)',
                  borderRadius: '0.375rem',
                  padding: '0.45rem 0.65rem',
                  color: 'var(--text-primary, #f1f5f9)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.45rem',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                + Aggiungi
              </button>
            </div>
            {errorMsg && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errorMsg}</span>
            )}
          </form>

          {/* Tabella Punti Registrati */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
                Punti Carico-Velocità ({points.length})
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onLoadDemo}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Carica Dati Demo
                </button>
                <button
                  type="button"
                  onClick={onClearPoints}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Svuota
                </button>
              </div>
            </div>

            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid var(--border, #1f293d)',
                borderRadius: '0.375rem',
                background: 'var(--bg-body, #0b0e14)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f293d', color: '#64748b' }}>
                    <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Carico</th>
                    <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Velocità</th>
                    <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #141c2e' }}>
                      <td style={{ padding: '0.35rem 0.6rem', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '0.35rem 0.6rem', color: '#f1f5f9', fontWeight: 600 }}>{p.load} kg</td>
                      <td style={{ padding: '0.35rem 0.6rem', color: '#38bdf8' }}>{p.velocity.toFixed(2)} m/s</td>
                      <td style={{ padding: '0.35rem 0.6rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => onRemovePoint(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#f87171',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Elimina
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
