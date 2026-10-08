/**
 * src/components/pap/PAPAnalysisView.tsx
 * Componente visuale per la Suite Salto Verticale, Profilazione Neuromuscolare e Protocolli PAP.
 *
 * Conforme a:
 * - Regola R3: Componente snello dedicato al rendering, logica delegata a usePAPAnalysis.
 * - Regola 01: Zero emoji spontanee.
 * - Regola R1: Zero any, tipizzazione con interfacce condivise.
 */

import React, { useState } from 'react';
import { usePAPAnalysis } from '../../hooks/usePAPAnalysis';

export const PAPAnalysisView: React.FC = () => {
  const {
    sjHeight,
    setSjHeight,
    cmjHeight,
    setCmjHeight,
    abkHeight,
    setAbkHeight,
    bodyMassKg,
    setBodyMassKg,
    contactTimeMs,
    setContactTimeMs,

    neuromuscularProfile,
    relativePowerWkg,
    rsiValue,

    baselineJumps,
    postJumps,
    addBaselineJump,
    addPostJump,
    removeBaselineJump,
    removePostJump,
    clearPAPJumps,

    potentiationResult,
    twoSampleTTest,

    loadPresetResponder,
    loadPresetFatigue
  } = usePAPAnalysis();

  const [inputPreJump, setInputPreJump] = useState<string>('');
  const [inputPostJump, setInputPostJump] = useState<string>('');

  const handleAddPre = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputPreJump);
    if (!isNaN(val) && val > 0) {
      addBaselineJump(val);
      setInputPreJump('');
    }
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputPostJump);
    if (!isNaN(val) && val > 0) {
      addPostJump(val);
      setInputPostJump('');
    }
  };

  const getStatusColor = (classification: string) => {
    switch (classification) {
      case 'Responder':
        return { bg: '#064e3b', border: '#10b981', text: '#6ee7b7' };
      case 'Negative Responder':
        return { bg: '#450a0a', border: '#ef4444', text: '#fca5a5' };
      default:
        return { bg: '#1e293b', border: '#64748b', text: '#cbd5e1' };
    }
  };

  const statusBadge = getStatusColor(potentiationResult.classification);

  return (
    <div className="pap-analysis-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Modulo */}
      <section className="section-header" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Suite Salto &amp; Potenziamento Post-Attivazione (PAP)
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
          Valutazione neuromuscolare del ciclo allungamento-accorciato (SSC), EUR, RSI e calcolo statistico del PAP (MDC 95%).
        </p>
      </section>

      {/* Preset Rapidi */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={loadPresetResponder}
          style={{
            fontSize: '0.8rem',
            padding: '0.4rem 0.8rem',
            background: '#1e293b',
            color: '#38bdf8',
            border: '1px solid #334155',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Carica Esempio: Atleta Responder (+7.8%)
        </button>
        <button
          type="button"
          onClick={loadPresetFatigue}
          style={{
            fontSize: '0.8rem',
            padding: '0.4rem 0.8rem',
            background: '#1e293b',
            color: '#f87171',
            border: '1px solid #334155',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Carica Esempio: Atleta Affaticato (-8.2%)
        </button>
      </div>

      {/* Griglia Principale: Profilo EUR & Protocollo PAP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Sezione 1: Profilazione Neuromuscolare (EUR, SJ, CMJ, Abalakov) */}
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Profilazione Neuromuscolare &amp; Meccanica di Salto
          </h3>

          {/* Form Inserimento Misure Basali */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label htmlFor="sj-input" style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Squat Jump - SJ (cm)
              </label>
              <input
                id="sj-input"
                type="number"
                step="0.1"
                min="10"
                value={sjHeight}
                onChange={(e) => setSjHeight(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label htmlFor="cmj-input" style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Countermovement - CMJ (cm)
              </label>
              <input
                id="cmj-input"
                type="number"
                step="0.1"
                min="10"
                value={cmjHeight}
                onChange={(e) => setCmjHeight(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label htmlFor="abk-input" style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Abalakov Jump - ABK (cm)
              </label>
              <input
                id="abk-input"
                type="number"
                step="0.1"
                min="10"
                value={abkHeight}
                onChange={(e) => setAbkHeight(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label htmlFor="mass-input" style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Massa Corporea (kg)
              </label>
              <input
                id="mass-input"
                type="number"
                step="0.5"
                min="30"
                value={bodyMassKg}
                onChange={(e) => setBodyMassKg(parseFloat(e.target.value) || 70)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label htmlFor="tc-input" style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Tempo di Contatto - TC (ms)
              </label>
              <input
                id="tc-input"
                type="number"
                step="5"
                min="80"
                value={contactTimeMs}
                onChange={(e) => setContactTimeMs(parseInt(e.target.value) || 200)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Griglia Risultati Biomeccanici */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: '#1e293b', padding: '0.65rem', borderRadius: '0.375rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>EUR Ratio (CMJ/SJ)</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>
                {neuromuscularProfile.eurRatio.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#a78bfa' }}>
                +{neuromuscularProfile.eurPercent.toFixed(1)}% elastico
              </span>
            </div>

            <div style={{ background: '#1e293b', padding: '0.65rem', borderRadius: '0.375rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Potenza Sayers</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>
                {relativePowerWkg.toFixed(1)} W/kg
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                {(relativePowerWkg * bodyMassKg).toFixed(0)} W totali
              </span>
            </div>

            <div style={{ background: '#1e293b', padding: '0.65rem', borderRadius: '0.375rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>RSI (Reactivity)</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>
                {rsiValue.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>h(m) / tc(s)</span>
            </div>

            <div style={{ background: '#1e293b', padding: '0.65rem', borderRadius: '0.375rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Transfer Braccia</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f472b6' }}>
                +{neuromuscularProfile.armsContributionCm.toFixed(1)} cm
              </div>
              <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>
                {neuromuscularProfile.armsTransferQuality}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: '#090d16', padding: '0.65rem', borderRadius: '0.375rem' }}>
            Classificazione: <strong>{neuromuscularProfile.classification}</strong>
            {neuromuscularProfile.hasConcentricDeficit && (
              <span style={{ display: 'block', color: '#f87171', marginTop: '0.2rem' }}>
                Rilevato deficit concentrico di base (SJ &lt; 38cm).
              </span>
            )}
          </div>
        </section>

        {/* Sezione 2: Valutazione Potenziamento Post-Attivazione (PAP) */}
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
              Protocollo Sperimentale PAP
            </h3>
            {(baselineJumps.length > 0 || postJumps.length > 0) && (
              <button
                type="button"
                onClick={clearPAPJumps}
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
                Azzera Serie
              </button>
            )}
          </div>

          {/* Form Inserimento Salti Pre / Post */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <form onSubmit={handleAddPre} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="pre-jump-val" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Aggiungi Baseline (cm):
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <input
                  id="pre-jump-val"
                  type="number"
                  step="0.1"
                  placeholder="es. 38.5"
                  value={inputPreJump}
                  onChange={(e) => setInputPreJump(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.4rem 0.5rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.25rem',
                    color: '#f8fafc',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.4rem 0.6rem',
                    background: '#334155',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </form>

            <form onSubmit={handleAddPost} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="post-jump-val" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Aggiungi Post-Attivazione (cm):
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <input
                  id="post-jump-val"
                  type="number"
                  step="0.1"
                  placeholder="es. 41.2"
                  value={inputPostJump}
                  onChange={(e) => setInputPostJump(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.4rem 0.5rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.25rem',
                    color: '#f8fafc',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.4rem 0.6rem',
                    background: '#6366f1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </form>
          </div>

          {/* Liste Salti Pre vs Post */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
            <div style={{ background: '#1e293b', padding: '0.5rem', borderRadius: '0.375rem' }}>
              <span style={{ color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                Baseline ({baselineJumps.length}):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {baselineJumps.map((val, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#0f172a',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '0.25rem',
                      color: '#f8fafc',
                      fontSize: '0.75rem'
                    }}
                  >
                    {val.toFixed(1)} cm
                    <button
                      type="button"
                      onClick={() => removeBaselineJump(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', marginLeft: '0.25rem', cursor: 'pointer' }}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '0.5rem', borderRadius: '0.375rem' }}>
              <span style={{ color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                Post ({postJumps.length}):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {postJumps.map((val, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#0f172a',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '0.25rem',
                      color: '#38bdf8',
                      fontSize: '0.75rem'
                    }}
                  >
                    {val.toFixed(1)} cm
                    <button
                      type="button"
                      onClick={() => removePostJump(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', marginLeft: '0.25rem', cursor: 'pointer' }}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card Esito e Statistica PAP */}
          <div
            style={{
              background: statusBadge.bg,
              border: `1px solid ${statusBadge.border}`,
              borderRadius: '0.375rem',
              padding: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: statusBadge.text, textTransform: 'uppercase' }}>
                Esito: {potentiationResult.classification}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                {potentiationResult.deltaPercent >= 0 ? '+' : ''}
                {potentiationResult.deltaPercent.toFixed(2)}%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', marginTop: '0.6rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Media Baseline:</span>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#f8fafc' }}>
                  {potentiationResult.baseline.toFixed(1)} cm
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Media Post:</span>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#38bdf8' }}>
                  {potentiationResult.post.toFixed(1)} cm
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Delta Assoluto:</span>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#f8fafc' }}>
                  {potentiationResult.deltaAbsolute >= 0 ? '+' : ''}
                  {potentiationResult.deltaAbsolute.toFixed(1)} cm
                </strong>
              </div>
              {potentiationResult.cohenD !== undefined && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cohen&apos;s d:</span>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#a78bfa' }}>
                    {potentiationResult.cohenD.toFixed(2)} ({potentiationResult.effectSize})
                  </strong>
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.4rem' }}>
              Significativita t-test: p = {twoSampleTTest.pValue.toFixed(4)}{' '}
              {twoSampleTTest.isSignificant ? '(Significativo p < 0.05)' : '(Non significativo)'}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
