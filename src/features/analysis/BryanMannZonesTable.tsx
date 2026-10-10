/**
 * src/features/analysis/BryanMannZonesTable.tsx
 * Tabella analitica delle 5 zone di forza di Bryan Mann e tabella di scomposizione VBT (1.0 - 0.3 m/s).
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola 02: Zero numeri magici, costanti in MAIUSCOLO.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React from 'react';
import type { VbtCalculatedResults } from './useVbtAnalysis';

export interface BryanMannZonesTableProps {
  results: VbtCalculatedResults;
}

/**
 * Tabella zone Bryan Mann e scomposizione step di velocità VBT.
 */
export const BryanMannZonesTable: React.FC<BryanMannZonesTableProps> = ({ results }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Widget Equilibrio Forza-Velocità (Foto 2) */}
      <div
        style={{
          background: 'var(--bg-body, #0b0e14)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.5rem',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
            Equilibrio Profilo Forza-Velocità (Sfv)
          </span>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: results.sfvPercent >= 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: results.sfvPercent >= 0 ? '#38bdf8' : '#eab308',
            }}
          >
            {results.imbalanceLabel} ({results.sfvPercent > 0 ? `+${results.sfvPercent}` : results.sfvPercent}%)
          </span>
        </div>

        {/* Visualizzatore slider bilanciamento */}
        <div style={{ position: 'relative', width: '100%', height: '10px', background: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${Math.max(10, Math.min(90, 50 + results.sfvPercent))}%`,
              width: '12px',
              marginLeft: '-6px',
              background: '#6366f1',
              borderRadius: '999px',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
          <span>Deficit di Forza (-30%)</span>
          <span style={{ color: '#10b981' }}>Equilibrato (0%)</span>
          <span>Deficit di Velocità (+30%)</span>
        </div>
      </div>

      {/* Tabella 5 Zone di Forza Bryan Mann */}
      <div
        style={{
          background: 'var(--bg-body, #0b0e14)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.5rem',
          padding: '1rem',
          overflowX: 'auto',
        }}
      >
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 0.75rem 0' }}>
          Zone di Forza Velocity-Based (Bryan Mann)
        </h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f293d', color: '#64748b', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Zona</th>
              <th style={{ padding: '0.5rem' }}>%1RM</th>
              <th style={{ padding: '0.5rem' }}>Velocità Target</th>
              <th style={{ padding: '0.5rem' }}>Carico Stimato</th>
              <th style={{ padding: '0.5rem' }}>Velocità Stimata</th>
              <th style={{ padding: '0.5rem' }}>Forza</th>
              <th style={{ padding: '0.5rem' }}>Potenza</th>
            </tr>
          </thead>
          <tbody>
            {results.mannZones.map((z) => (
              <tr key={z.zone} style={{ borderBottom: '1px solid #141c2e' }}>
                <td style={{ padding: '0.5rem', fontWeight: 600, color: z.color }}>
                  {z.zone}
                </td>
                <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>{z.pctRange}</td>
                <td style={{ padding: '0.5rem', color: '#94a3b8' }}>{z.targetVelocity}</td>
                <td style={{ padding: '0.5rem', color: '#f1f5f9', fontWeight: 700 }}>
                  {z.load2_5kg} kg
                </td>
                <td style={{ padding: '0.5rem', color: '#38bdf8' }}>
                  {z.velocity.toFixed(2)} m/s
                </td>
                <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>
                  {Math.round(z.forceN)} N
                </td>
                <td style={{ padding: '0.5rem', color: '#eab308' }}>
                  {Math.round(z.powerW)} W
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabella Scomposizione Velocità (1.0 - 0.3 m/s) */}
      <div
        style={{
          background: 'var(--bg-body, #0b0e14)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.5rem',
          padding: '1rem',
          overflowX: 'auto',
        }}
      >
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 0.75rem 0' }}>
          Tabella di Allenamento VBT — Velocità Target vs Carico
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
          {results.velocitySteps.map((step) => (
            <div
              key={step.velocity}
              style={{
                background: '#111827',
                border: '1px solid #1f293d',
                borderRadius: '0.375rem',
                padding: '0.6rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                {step.velocity.toFixed(1)} m/s
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.2rem' }}>
                {step.loadKg} kg
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                ~{step.pct1RM}% 1RM
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
