/**
 * src/features/analysis/AnalysisView.tsx
 * Cruscotto Data Analisi VBT & Profilo F-V a 2 colonne (Foto 2).
 *
 * Conforme a:
 * - Foto 2: Colonna sinistra form reattivo MVT / tabella punti, colonna destra 4 KPI card,
 *           grafico F-V OLS con MVT tratteggiata, curva di potenza Pmax, slider Sfv e zone Bryan Mann.
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Zero numeri magici, costanti in MAIUSCOLO.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React from 'react';
import { useVbtAnalysis } from './useVbtAnalysis';
import { ManualInputForm } from './ManualInputForm';
import { VbtCharts } from './VbtCharts';
import { BryanMannZonesTable } from './BryanMannZonesTable';

/**
 * View principale del modulo Data Analisi VBT & Biomeccanica.
 */
export const AnalysisView: React.FC = () => {
  const {
    athleteName,
    setAthleteName,
    exerciseName,
    setExerciseName,
    mvt,
    stepMvt,
    setMvt,
    regressionModel,
    setRegressionModel,
    points,
    addPoint,
    removePoint,
    clearPoints,
    loadDemoData,
    results,
    isValid,
  } = useVbtAnalysis();

  return (
    <div className="analysis-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Modulo */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              DATA ANALISI &amp; VBT
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
              }}
            >
              Samozino &amp; González-Badillo (2012-2024)
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #f1f5f9)' }}>
            Valutazione Profilo Carico-Velocità (F-V)
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Modellazione biomeccanica predittiva del massimale 1RM, F0, Pmax e prescrizione delle zone Bryan Mann.
          </p>
        </div>
      </section>

      {/* Layout a 2 Colonne (Foto 2) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 380px) 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
        className="vbt-dashboard-grid"
      >
        {/* Colonna Sinistra: Form Ingestione Dati */}
        <aside>
          <ManualInputForm
            athleteName={athleteName}
            onAthleteChange={setAthleteName}
            exerciseName={exerciseName}
            onExerciseChange={setExerciseName}
            mvt={mvt}
            onMvtStep={stepMvt}
            onMvtSet={setMvt}
            regressionModel={regressionModel}
            onRegressionModelChange={setRegressionModel}
            points={points}
            onAddPoint={addPoint}
            onRemovePoint={removePoint}
            onClearPoints={clearPoints}
            onLoadDemo={loadDemoData}
          />
        </aside>

        {/* Colonna Destra: Dashboard Risultati (Foto 2) */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Dashboard Destro */}
          <div
            style={{
              background: 'var(--bg-surface, #111827)',
              border: '1px solid var(--border, #1f293d)',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                Profilo Carico-Velocità — {athleteName || 'Atleta'} [{exerciseName}]
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                MVT configurata: <strong style={{ color: '#38bdf8' }}>{mvt.toFixed(2)} m/s</strong> • {points.length} punti sperimentali
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                VBT Mode
              </span>
            </div>
          </div>

          {isValid && results ? (
            <>
              {/* Le 4 KPI Card (Foto 2) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                {/* KPI 1: 1RM Stimato */}
                <div
                  style={{
                    background: 'var(--bg-surface, #111827)',
                    border: '1px solid var(--border, #1f293d)',
                    borderLeft: '4px solid #10b981',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    1RM Stimato (MVT {mvt.toFixed(2)} m/s)
                  </span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                    {results.oneRM.value} <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>kg</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                    IC 95%: [{results.oneRM.ci95Min} - {results.oneRM.ci95Max}] kg
                  </span>
                </div>

                {/* KPI 2: Forza Massimale F0 */}
                <div
                  style={{
                    background: 'var(--bg-surface, #111827)',
                    border: '1px solid var(--border, #1f293d)',
                    borderLeft: '4px solid #06b6d4',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Forza Massimale F0 (v=0)
                  </span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06b6d4', marginTop: '0.25rem' }}>
                    {results.f0_N} <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>N</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                    F0 eq: {results.f0_kg} kg • V0: {results.v0} m/s
                  </span>
                </div>

                {/* KPI 3: Potenza Massima Pmax */}
                <div
                  style={{
                    background: 'var(--bg-surface, #111827)',
                    border: '1px solid var(--border, #1f293d)',
                    borderLeft: '4px solid #eab308',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Potenza Massima Pmax
                  </span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#eab308', marginTop: '0.25rem' }}>
                    {results.pmax} <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>W</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                    Carico Ottimale: {results.pmaxLoad} kg • {results.pmaxVelocity} m/s
                  </span>
                </div>

                {/* KPI 4: R2 Affidabilità */}
                <div
                  style={{
                    background: 'var(--bg-surface, #111827)',
                    border: '1px solid var(--border, #1f293d)',
                    borderLeft: '4px solid #6366f1',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    R² Affidabilità Regressione
                  </span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8', marginTop: '0.25rem' }}>
                    {results.rSquared.toFixed(3)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                    {results.qualityLabel} • SEE: {results.see}
                  </span>
                </div>
              </div>

              {/* Grafici Interattivi Chart.js */}
              <VbtCharts points={points} results={results} mvt={mvt} />

              {/* Tabella Bryan Mann & Slider Sbilanciamento */}
              <BryanMannZonesTable results={results} />
            </>
          ) : (
            /* Empty State / Not enough points */
            <div
              style={{
                background: 'var(--bg-surface, #111827)',
                border: '1px dashed var(--border, #1f293d)',
                borderRadius: '0.75rem',
                padding: '3rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
                Dati di misurazione insufficienti
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, maxWidth: '420px' }}>
                Per calcolare la regressione OLS e stimare il massimale 1RM, inserisci almeno 2 punti distinti di carico e velocità nella colonna a sinistra oppure carica i dati dimostrativi.
              </p>
              <button
                type="button"
                onClick={loadDemoData}
                style={{
                  background: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Carica Dati Demo (Squat)
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
