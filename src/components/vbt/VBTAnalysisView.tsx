/**
 * src/components/vbt/VBTAnalysisView.tsx
 * Componente di rendering per il test Velocity-Based Training (VBT) e profilazione F-V.
 * Conforme a:
 * - Regola R3: Componente snello; logica delegata a useVBTAnalysis.
 * - Regola 01: Zero emoji spontanee.
 * - Regola R1: Zero any, tipizzazione TypeScript strict.
 */

import React, { useState } from 'react';
import { useVBTAnalysis } from '../../hooks/useVBTAnalysis';
import { parseMeasurementFile } from '../../parser';

export const VBTAnalysisView: React.FC = () => {
  const {
    points,
    addPoint,
    removePoint,
    clearPoints,
    setPoints,
    mvt,
    setMvt,
    analysisResult,
    zones
  } = useVBTAnalysis();

  const [inputLoad, setInputLoad] = useState<string>('');
  const [inputVelocity, setInputVelocity] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddCustomPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const loadVal = parseFloat(inputLoad);
    const velVal = parseFloat(inputVelocity);

    if (isNaN(loadVal) || loadVal <= 0) {
      setFormError('Inserire un carico valido (kg > 0).');
      return;
    }
    if (isNaN(velVal) || velVal <= 0 || velVal > 3.5) {
      setFormError('Inserire una velocità valida (0 < m/s <= 3.5).');
      return;
    }

    addPoint({ load: loadVal, velocity: velVal });
    setInputLoad('');
    setInputVelocity('');
    setFormError(null);
  };

  const handleLoadPreset = (presetPoints: Array<{ load: number; velocity: number }>) => {
    setPoints(presetPoints);
  };

  return (
    <div className="vbt-analysis-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intestazione modulo */}
      <section className="section-header" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Valutazione Profilo Carico-Velocità (VBT)
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
          Modellazione biomeccanica F-V secondo Samozino e González-Badillo con stima 1RM e zone di forza di Bryan Mann.
        </p>
      </section>

      {/* Pannello Inserimento Dati */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Form inserimento punto */}
        <div
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Registrazione Misurazioni
          </h3>

          <form onSubmit={handleAddCustomPoint} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="vbt-load-input"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Carico (kg)
                </label>
                <input
                  id="vbt-load-input"
                  type="number"
                  step="0.5"
                  min="1"
                  placeholder="es. 70"
                  value={inputLoad}
                  onChange={(e) => setInputLoad(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label
                  htmlFor="vbt-vel-input"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Velocità Media (m/s)
                </label>
                <input
                  id="vbt-vel-input"
                  type="number"
                  step="0.01"
                  min="0.05"
                  max="3.5"
                  placeholder="es. 0.75"
                  value={inputVelocity}
                  onChange={(e) => setInputVelocity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {formError && (
              <div style={{ color: '#f87171', fontSize: '0.8rem' }}>{formError}</div>
            )}

            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                background: '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Aggiungi Punto
            </button>
          </form>

          {/* Preset rapidi */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
              Carica Protocollo Incrementale Standard:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() =>
                  handleLoadPreset([
                    { load: 40, velocity: 1.0 },
                    { load: 60, velocity: 0.8 },
                    { load: 80, velocity: 0.6 }
                  ])
                }
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.6rem',
                  background: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Squat 3 Punti (40-60-80kg)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleLoadPreset([
                    { load: 50, velocity: 0.85 },
                    { load: 70, velocity: 0.68 },
                    { load: 90, velocity: 0.5 },
                    { load: 105, velocity: 0.35 }
                  ])
                }
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.6rem',
                  background: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Panca 4 Punti (50-105kg)
              </button>

              <label
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.6rem',
                  background: '#047857',
                  color: '#ffffff',
                  border: '1px solid #059669',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Carica File Encoder (CSV/TSV)
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const text = await file.text();
                      const parsed = parseMeasurementFile(text, file.name);
                      if (parsed.points.length > 0) {
                        setPoints(parsed.points);
                      }
                    } catch {
                      // Ignora errori di parsing
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Configurazione MVT */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="mvt-select" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                MVT Target (Soglia Minima di Velocità):
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>
                {mvt.toFixed(2)} m/s
              </span>
            </div>
            <select
              id="mvt-select"
              value={mvt}
              onChange={(e) => setMvt(parseFloat(e.target.value))}
              style={{
                width: '100%',
                marginTop: '0.25rem',
                padding: '0.4rem 0.6rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              <option value="0.30">0.30 m/s – Back Squat Standard</option>
              <option value="0.15">0.15 m/s – Panca Piana / Deadlift</option>
              <option value="0.20">0.20 m/s – Military Press</option>
              <option value="0.35">0.35 m/s – Front Squat</option>
            </select>
          </div>
        </div>

        {/* Tabella punti correnti */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
              Punti Sperimentali ({points.length})
            </h3>
            {points.length > 0 && (
              <button
                type="button"
                onClick={clearPoints}
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Azzera Dati
              </button>
            )}
          </div>

          {points.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.875rem', padding: '1rem 0', textAlign: 'center' }}>
              Nessun dato registrato. Aggiungi almeno 2 punti per avviare la regressione.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>#</th>
                    <th style={{ padding: '0.5rem' }}>Carico (kg)</th>
                    <th style={{ padding: '0.5rem' }}>Velocità (m/s)</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((pt, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}>
                      <td style={{ padding: '0.5rem', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>{pt.load.toFixed(1)} kg</td>
                      <td style={{ padding: '0.5rem' }}>{pt.velocity.toFixed(2)} m/s</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => removePoint(idx)}
                          aria-label={`Rimuovi punto carico ${pt.load} kg`}
                          style={{
                            background: 'transparent',
                            color: '#ef4444',
                            border: 'none',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            padding: '0.2rem 0.4rem'
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
          )}
        </div>
      </div>

      {/* Risultati Metriche Calcolate */}
      {analysisResult ? (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Parametri Biomeccanici &amp; Modello F-V
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  background: '#1e293b',
                  color: '#94a3b8'
                }}
              >
                Modello: {analysisResult.modelType.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  background: analysisResult.rSquared >= 0.95 ? '#064e3b' : '#78350f',
                  color: analysisResult.rSquared >= 0.95 ? '#6ee7b7' : '#fde68a'
                }}
              >
                Qualità: {analysisResult.qualityLabel ?? (analysisResult.rSquared >= 0.95 ? 'Alta' : 'Moderata')}
              </span>
            </div>
          </div>

          {/* Griglia KPI */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem'
            }}
          >
            {/* 1RM stimato con CI 95% */}
            <div
              style={{
                background: '#1e293b',
                padding: '0.85rem',
                borderRadius: '0.375rem',
                borderLeft: '4px solid #6366f1'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                1RM Stimato (@ MVT {mvt}m/s)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {analysisResult.rm1 ? analysisResult.rm1.estimated.toFixed(1) : '--'} kg
              </div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.2rem' }}>
                CI 95%: [
                {analysisResult.rm1 ? analysisResult.rm1.ci95Min.toFixed(1) : '--'} -{' '}
                {analysisResult.rm1 ? analysisResult.rm1.ci95Max.toFixed(1) : '--'} kg]
              </div>
            </div>

            {/* R2 e R2adj */}
            <div
              style={{
                background: '#1e293b',
                padding: '0.85rem',
                borderRadius: '0.375rem',
                borderLeft: '4px solid #10b981'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                Bontà di Adattamento (R²)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {analysisResult.rSquared.toFixed(3)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                R²adj: {analysisResult.r2Adj !== undefined ? analysisResult.r2Adj.toFixed(3) : analysisResult.rSquared.toFixed(3)}
              </div>
            </div>

            {/* Pendenza (Slope) */}
            <div
              style={{
                background: '#1e293b',
                padding: '0.85rem',
                borderRadius: '0.375rem',
                borderLeft: '4px solid #f59e0b'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                Pendenza (Slope)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {analysisResult.slope.toFixed(4)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                (m/s per kg)
              </div>
            </div>

            {/* V0 Teorico */}
            <div
              style={{
                background: '#1e293b',
                padding: '0.85rem',
                borderRadius: '0.375rem',
                borderLeft: '4px solid #06b6d4'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                V0 (Intercetta Carico Zero)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {analysisResult.v0.toFixed(2)} m/s
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Velocità massima teorica
              </div>
            </div>

            {/* F0 Teorico */}
            <div
              style={{
                background: '#1e293b',
                padding: '0.85rem',
                borderRadius: '0.375rem',
                borderLeft: '4px solid #ec4899'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                F0 (Carico a V=0)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {analysisResult.f0.toFixed(1)} kg
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {(analysisResult.f0 * 9.81).toFixed(0)} N
              </div>
            </div>

            {/* Pmax */}
            <div
              style={{
                background: '#1e293b',
                padding: '0.85rem',
                borderRadius: '0.375rem',
                borderLeft: '4px solid #8b5cf6'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                Potenza Meccanica Max (Pmax)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {analysisResult.pmax.toFixed(0)} W
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                @ carico ottimale {(analysisResult.f0 / 2).toFixed(1)} kg
              </div>
            </div>
          </div>

          {/* Equazione del profilo */}
          <div
            style={{
              padding: '0.75rem',
              background: '#090d16',
              borderRadius: '0.375rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: '#38bdf8'
            }}
          >
            Equazione Profilo: {analysisResult.equation ?? `V = ${analysisResult.slope.toFixed(4)}·L + ${analysisResult.intercept.toFixed(4)}`}
          </div>
        </section>
      ) : (
        <div
          style={{
            padding: '1.5rem',
            background: '#0f172a',
            borderRadius: '0.5rem',
            textAlign: 'center',
            color: '#64748b',
            border: '1px dashed #334155'
          }}
        >
          Inserisci almeno 2 misurazioni valide per generare la regressione e i parametri biomeccanici.
        </div>
      )}

      {/* Tabella Zone Bryan Mann */}
      {zones.length > 0 && (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Prescrizione Zone di Allenamento (Bryan Mann)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Base 1RM: {analysisResult?.rm1?.estimated.toFixed(1)} kg
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Zona F-V</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Range %1RM</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Target Velocità</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Carico Calcolato</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Velocità Prevista</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Forza / Potenza</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zoneRow, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: zoneRow.color,
                          marginRight: '0.5rem'
                        }}
                      />
                      {zoneRow.zone}
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', color: '#94a3b8' }}>{zoneRow.pctRange}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>{zoneRow.targetVelocity}</td>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600, color: '#f8fafc' }}>
                      {zoneRow.load2_5kg.toFixed(1)} kg
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', color: '#38bdf8' }}>
                      {zoneRow.velocity > 0 ? `${zoneRow.velocity.toFixed(2)} m/s` : '--'}
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', color: '#94a3b8' }}>
                      {zoneRow.forceN.toFixed(0)} N / {zoneRow.powerW.toFixed(0)} W
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
