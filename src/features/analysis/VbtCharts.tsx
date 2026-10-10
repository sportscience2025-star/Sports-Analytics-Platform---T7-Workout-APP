/**
 * src/features/analysis/VbtCharts.tsx
 * Componente per i due grafici Chart.js del Cruscotto VBT:
 * 1. Profilo Carico-Velocità con OLS, linea MVT tratteggiata e 1RM.
 * 2. Curva di Potenza Parabolica P = F·v con evidenziazione vertice Pmax.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola 02: Costanti in MAIUSCOLO.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  registerables,
} from 'chart.js';
import type { LoadVelocityPoint } from '../../types/physics';
import type { VbtCalculatedResults } from './useVbtAnalysis';

ChartJS.register(...registerables);

const CURVE_POINTS_STEP_COUNT = 50;

export interface VbtChartsProps {
  points: LoadVelocityPoint[];
  results: VbtCalculatedResults | null;
  mvt: number;
}

/**
 * Rendering Chart.js per il profilo Carico-Velocità e Curva di Potenza.
 */
export const VbtCharts: React.FC<VbtChartsProps> = ({ points, results, mvt }) => {
  const fvCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const powerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fvChartRef = useRef<ChartJS | null>(null);
  const powerChartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!results || points.length < 2) {
      if (fvChartRef.current) {
        fvChartRef.current.destroy();
        fvChartRef.current = null;
      }
      if (powerChartRef.current) {
        powerChartRef.current.destroy();
        powerChartRef.current = null;
      }
      return;
    }

    const loads = points.map((p) => p.load);
    const minLoad = Math.max(0, Math.min(...loads) * 0.85);
    const oneRMVal = results.oneRM.value || Math.max(...loads) * 1.2;
    const maxLoad = Math.max(oneRMVal * 1.08, Math.max(...loads) * 1.05);

    // --- GRAFICO 1: Carico - Velocità ---
    if (fvCanvasRef.current) {
      if (fvChartRef.current) {
        fvChartRef.current.destroy();
        fvChartRef.current = null;
      }

      const scatterData = points.map((p) => ({ x: p.load, y: p.velocity }));
      const lineData: { x: number; y: number }[] = [];

      for (let i = 0; i <= CURVE_POINTS_STEP_COUNT; i++) {
        const curL = minLoad + (maxLoad - minLoad) * (i / CURVE_POINTS_STEP_COUNT);
        const curV = results.slope * curL + results.intercept;
        if (curV >= 0) {
          lineData.push({ x: parseFloat(curL.toFixed(1)), y: parseFloat(curV.toFixed(3)) });
        }
      }

      const mvtLine = [
        { x: minLoad, y: mvt },
        { x: maxLoad, y: mvt },
      ];

      const oneRMPoint = [{ x: parseFloat(oneRMVal.toFixed(1)), y: mvt }];

      const ctx1 = fvCanvasRef.current.getContext('2d');
      if (ctx1) {
        fvChartRef.current = new ChartJS(ctx1, {
          type: 'scatter',
          data: {
            datasets: [
              {
                label: `1RM Stimato: ${oneRMVal.toFixed(1)} kg`,
                data: oneRMPoint,
                type: 'scatter',
                backgroundColor: '#10b981',
                borderColor: '#ffffff',
                borderWidth: 2,
                pointStyle: 'rectRot',
                pointRadius: 8,
                pointHoverRadius: 10,
                order: 0,
              },
              {
                label: 'Dati Sperimentali',
                data: scatterData,
                type: 'scatter',
                backgroundColor: '#06b6d4',
                borderColor: '#06b6d4',
                pointRadius: 6,
                pointHoverRadius: 8,
                order: 1,
              },
              {
                label: `OLS: ${results.equation}`,
                data: lineData,
                type: 'line',
                borderColor: '#6366f1',
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                pointRadius: 0,
                fill: false,
                order: 2,
              },
              {
                label: `MVT Soglia (${mvt.toFixed(2)} m/s)`,
                data: mvtLine,
                type: 'line',
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                order: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: {
                labels: { color: '#cbd5e1', font: { size: 10 } },
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                type: 'linear',
                min: 0,
                max: Math.ceil(maxLoad / 20) * 20,
                title: { display: true, text: 'Carico (kg)', color: '#94a3b8' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8', stepSize: 20 },
              },
              y: {
                title: { display: true, text: 'Velocità Media (m/s)', color: '#94a3b8' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' },
                min: 0,
              },
            },
          },
        });
      }
    }

    // --- GRAFICO 2: Curva di Potenza Parabolica P = F·v ---
    if (powerCanvasRef.current) {
      if (powerChartRef.current) {
        powerChartRef.current.destroy();
        powerChartRef.current = null;
      }

      const powerLineData: { x: number; y: number }[] = [];
      for (let i = 0; i <= CURVE_POINTS_STEP_COUNT; i++) {
        const curL = (maxLoad * i) / CURVE_POINTS_STEP_COUNT;
        const curV = results.slope * curL + results.intercept;
        if (curV > 0) {
          const powerW = curL * 9.81 * curV;
          powerLineData.push({ x: parseFloat(curL.toFixed(1)), y: parseFloat(powerW.toFixed(1)) });
        }
      }

      const pmaxPoint = [
        {
          x: results.pmaxLoad,
          y: results.pmax,
        },
      ];

      const ctx2 = powerCanvasRef.current.getContext('2d');
      if (ctx2) {
        const gradient = ctx2.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, 'rgba(217, 70, 239, 0.35)');
        gradient.addColorStop(1, 'rgba(217, 70, 239, 0.02)');

        powerChartRef.current = new ChartJS(ctx2, {
          type: 'scatter',
          data: {
            datasets: [
              {
                label: `Pmax: ${results.pmax} W @ ${results.pmaxLoad} kg`,
                data: pmaxPoint,
                type: 'scatter',
                backgroundColor: '#eab308',
                borderColor: '#ffffff',
                borderWidth: 2,
                pointRadius: 8,
                pointHoverRadius: 10,
                order: 0,
              },
              {
                label: 'Curva di Potenza P(L) = F·v',
                data: powerLineData,
                type: 'line',
                borderColor: '#d946ef',
                backgroundColor: gradient,
                borderWidth: 2.5,
                fill: true,
                pointRadius: 0,
                tension: 0.35,
                order: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: {
                labels: { color: '#cbd5e1', font: { size: 10 } },
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                type: 'linear',
                min: 0,
                max: Math.ceil(maxLoad / 20) * 20,
                title: { display: true, text: 'Carico (kg)', color: '#94a3b8' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8', stepSize: 20 },
              },
              y: {
                title: { display: true, text: 'Potenza Meccanica (Watt)', color: '#94a3b8' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' },
                min: 0,
              },
            },
          },
        });
      }
    }
  }, [points, results, mvt]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
      {/* Grafico F-V */}
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
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
            Profilo Carico-Velocità (F-V)
          </span>
          {results && (
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              {results.equation}
            </span>
          )}
        </div>
        <div style={{ position: 'relative', height: '260px', width: '100%' }}>
          <canvas ref={fvCanvasRef} />
        </div>
      </div>

      {/* Grafico Curva di Potenza */}
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
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
            Curva di Potenza Meccanica P(L) = F·v
          </span>
          {results && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(234, 179, 8, 0.15)',
                color: '#eab308',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid rgba(234, 179, 8, 0.3)',
              }}
            >
              Pmax: {results.pmax} W
            </span>
          )}
        </div>
        <div style={{ position: 'relative', height: '260px', width: '100%' }}>
          <canvas ref={powerCanvasRef} />
        </div>
      </div>
    </div>
  );
};
