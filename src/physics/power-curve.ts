/**
 * src/physics/power-curve.ts
 * Motore di Modellazione e Ottimizzazione della Curva di Potenza Meccanica (Power-Load Profile).
 * Calcola:
 * - Potenza meccanica istantanea e media (P = F * V)
 * - Carico ottimale di potenza (L_opt)
 * - Velocità ottimale di potenza (V_opt)
 * - Potenza massimale di picco teorica (P_max)
 * - Punti campionati per il rendering ad alta fedeltà su Chart.js
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import type { LoadVelocityPoint } from '../types/physics';

const GRAVITY_MPS2 = 9.81;
const DEFAULT_SAMPLES_COUNT = 30;

export interface PowerCurvePoint {
  load: number;
  velocity: number;
  power: number;
}

export interface PowerCurveAnalysis {
  pmax: number;
  optimalLoad: number;
  optimalVelocity: number;
  curvePoints: PowerCurvePoint[];
  empiricalPoints: PowerCurvePoint[];
  f0: number;
  v0: number;
}

/**
 * Calcola l'analisi completa della curva di potenza partendo da un profilo Carico-Velocità.
 *
 * @param points - Array di punti Carico-Velocità sperimentali
 * @param f0 - Forza massimale estrapolata a velocità zero (N o kg)
 * @param v0 - Velocità teorica estrapolata a carico zero (m/s)
 * @param bodyMassKg - Massa corporea dell'atleta in kg (opzionale, default 0 per pesi liberi puri)
 * @returns Oggetto PowerCurveAnalysis con P_max, L_opt, V_opt e serie di punti
 */
export function analyzePowerCurve(
  points: LoadVelocityPoint[],
  f0: number,
  v0: number,
  bodyMassKg: number = 0
): PowerCurveAnalysis {
  // Punti empirici con potenza calcolata: P = (m_tot * g) * v
  const empiricalPoints: PowerCurvePoint[] = points.map((pt) => {
    const totalMass = pt.load + bodyMassKg;
    const force = totalMass * GRAVITY_MPS2;
    const power = Math.max(0, force * pt.velocity);
    return {
      load: pt.load,
      velocity: pt.velocity,
      power: Math.round(power * 10) / 10,
    };
  });

  // Secondo il modello bi-lineare di Samozino / Jaric:
  // V(L) = V_0 * (1 - L / L_0)
  // P(L) = L * g * V_0 * (1 - L / L_0)
  // Il vertice della parabola si ottiene a L_opt = L_0 / 2, V_opt = V_0 / 2
  // P_max = (L_0 * g * V_0) / 4
  const l0 = f0 > 0 ? f0 : (empiricalPoints.length > 0 ? Math.max(...empiricalPoints.map((p) => p.load)) * 1.3 : 100);
  const safeV0 = v0 > 0 ? v0 : (empiricalPoints.length > 0 ? Math.max(...empiricalPoints.map((p) => p.velocity)) * 1.2 : 1.5);

  const optimalLoad = Math.round((l0 / 2) * 10) / 10;
  const optimalVelocity = Math.round((safeV0 / 2) * 100) / 100;
  const pmax = Math.round(((optimalLoad + bodyMassKg) * GRAVITY_MPS2 * optimalVelocity) * 10) / 10;

  // Campionamento dei punti della curva continua per Chart.js
  const curvePoints: PowerCurvePoint[] = [];
  const maxPlotLoad = Math.max(l0 * 1.05, 10);
  const step = maxPlotLoad / DEFAULT_SAMPLES_COUNT;

  for (let currentLoad = 0; currentLoad <= maxPlotLoad; currentLoad += step) {
    const v = Math.max(0, safeV0 * (1 - currentLoad / l0));
    const force = (currentLoad + bodyMassKg) * GRAVITY_MPS2;
    const power = force * v;

    curvePoints.push({
      load: Math.round(currentLoad * 10) / 10,
      velocity: Math.round(v * 100) / 100,
      power: Math.round(power * 10) / 10,
    });
  }

  return {
    pmax,
    optimalLoad,
    optimalVelocity,
    curvePoints,
    empiricalPoints,
    f0,
    v0: safeV0,
  };
}
