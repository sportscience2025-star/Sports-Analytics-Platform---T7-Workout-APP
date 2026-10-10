/**
 * src/features/analysis/useVbtAnalysis.ts
 * Custom hook e motore biomeccanico puro per VBT & Profilo F-V.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola 02: Zero numeri magici, costanti in MAIUSCOLO in testa al file.
 * - Regola R1: Strict TypeScript, zero any.
 */

import { useState, useMemo, useCallback } from 'react';
import type { LoadVelocityPoint, BryanMannZoneRow } from '../../types/physics';

export const GRAVITY_MPS2 = 9.81;
export const DEFAULT_MVT_SQUAT = 0.30;
export const DEFAULT_MVT_BENCH = 0.15;
export const MIN_POINTS_OLS = 2;
export const CONFIDENCE_T_95 = 2.447; // t-Student approssimato per n=6-8 (df=4-6)

export interface VbtExercisePreset {
  name: string;
  defaultMvt: number;
}

export const EXERCISE_PRESETS: VbtExercisePreset[] = [
  { name: 'Squat', defaultMvt: 0.30 },
  { name: 'Panca Piana', defaultMvt: 0.15 },
  { name: 'Stacco da Terra', defaultMvt: 0.15 },
  { name: 'Hip Thrust', defaultMvt: 0.25 },
  { name: 'Military Press', defaultMvt: 0.20 },
  { name: 'Trazioni Zavorrate', defaultMvt: 0.20 },
];

export const DEMO_VBT_POINTS: LoadVelocityPoint[] = [
  { load: 40, velocity: 1.02 },
  { load: 60, velocity: 0.84 },
  { load: 80, velocity: 0.65 },
  { load: 100, velocity: 0.48 },
];

export interface VbtCalculatedResults {
  oneRM: {
    value: number;
    ci95Min: number;
    ci95Max: number;
    margin: number;
  };
  f0_N: number;
  f0_kg: number;
  v0: number;
  pmax: number;
  pmaxLoad: number;
  pmaxVelocity: number;
  slope: number;
  intercept: number;
  rSquared: number;
  see: number;
  equation: string;
  qualityLabel: string;
  sfvPercent: number;
  imbalanceLabel: string;
  mannZones: BryanMannZoneRow[];
  velocitySteps: Array<{
    velocity: number;
    loadKg: number;
    pct1RM: number;
  }>;
}

export interface UseVbtAnalysisReturn {
  athleteName: string;
  setAthleteName: (name: string) => void;
  exerciseName: string;
  setExerciseName: (name: string) => void;
  mvt: number;
  setMvt: (mvt: number) => void;
  stepMvt: (delta: number) => void;
  regressionModel: 'auto_linear' | 'linear' | 'polynomial';
  setRegressionModel: (model: 'auto_linear' | 'linear' | 'polynomial') => void;
  points: LoadVelocityPoint[];
  addPoint: (point: LoadVelocityPoint) => void;
  updatePoint: (index: number, field: 'load' | 'velocity', value: number) => void;
  removePoint: (index: number) => void;
  clearPoints: () => void;
  loadDemoData: () => void;
  setPoints: (points: LoadVelocityPoint[]) => void;
  results: VbtCalculatedResults | null;
  isValid: boolean;
}

/**
 * Custom Hook per la modellazione VBT e curva Carico-Velocità.
 */
export function useVbtAnalysis(): UseVbtAnalysisReturn {
  const [athleteName, setAthleteName] = useState<string>('Mario Rossi');
  const [exerciseName, setExerciseNameState] = useState<string>('Squat');
  const [mvt, setMvt] = useState<number>(DEFAULT_MVT_SQUAT);
  const [regressionModel, setRegressionModel] = useState<'auto_linear' | 'linear' | 'polynomial'>('auto_linear');
  const [points, setPoints] = useState<LoadVelocityPoint[]>(DEMO_VBT_POINTS);

  const setExerciseName = useCallback((newEx: string) => {
    setExerciseNameState(newEx);
    const found = EXERCISE_PRESETS.find((p) => p.name.toLowerCase() === newEx.toLowerCase());
    if (found) {
      setMvt(found.defaultMvt);
    }
  }, []);

  const stepMvt = useCallback((delta: number) => {
    setMvt((prev) => {
      const next = parseFloat((prev + delta).toFixed(2));
      return next > 0.05 && next < 1.0 ? next : prev;
    });
  }, []);

  const addPoint = useCallback((point: LoadVelocityPoint) => {
    if (point.load > 0 && point.velocity > 0) {
      setPoints((prev) => [...prev, point]);
    }
  }, []);

  const updatePoint = useCallback((index: number, field: 'load' | 'velocity', value: number) => {
    setPoints((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }, []);

  const removePoint = useCallback((index: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearPoints = useCallback(() => {
    setPoints([]);
  }, []);

  const loadDemoData = useCallback(() => {
    setPoints(DEMO_VBT_POINTS);
  }, []);

  // Calcolo matematico biomeccanico OLS puro
  const results = useMemo<VbtCalculatedResults | null>(() => {
    const valid = points.filter((p) => p.load > 0 && p.velocity > 0);
    if (valid.length < MIN_POINTS_OLS) {
      return null;
    }

    const n = valid.length;
    let sumL = 0;
    let sumV = 0;
    valid.forEach((p) => {
      sumL += p.load;
      sumV += p.velocity;
    });

    const meanL = sumL / n;
    const meanV = sumV / n;

    let ssLL = 0;
    let ssVV = 0;
    let ssLV = 0;

    valid.forEach((p) => {
      const dL = p.load - meanL;
      const dV = p.velocity - meanV;
      ssLL += dL * dL;
      ssVV += dV * dV;
      ssLV += dL * dV;
    });

    if (ssLL === 0 || ssVV === 0) {
      return null;
    }

    // Pendenza a e intercetta b
    const slope = ssLV / ssLL;
    const intercept = meanV - slope * meanL;

    // R-quadro e Standard Error of Estimate
    const rSquared = Math.max(0, Math.min(1, (ssLV * ssLV) / (ssLL * ssVV)));
    let sumResSq = 0;
    valid.forEach((p) => {
      const predictedV = slope * p.load + intercept;
      const res = p.velocity - predictedV;
      sumResSq += res * res;
    });

    const df = Math.max(1, n - 2);
    const see = Math.sqrt(sumResSq / df);

    // Stima 1RM = (MVT - b) / a
    let oneRMVal = 0;
    if (Math.abs(slope) > 0.0001) {
      oneRMVal = (mvt - intercept) / slope;
    }
    oneRMVal = Math.max(0, oneRMVal);

    // Intervallo di confidenza al 95% per 1RM
    const se1RM = Math.abs(slope) > 0.0001 ? see / Math.abs(slope) : 0;
    const margin = CONFIDENCE_T_95 * se1RM;
    const ci95Min = Math.max(0, oneRMVal - margin);
    const ci95Max = oneRMVal + margin;

    // F0 teorica a v = 0 (in Newton e kg)
    const f0_kg = Math.abs(slope) > 0.0001 ? Math.max(0, -intercept / slope) : oneRMVal;
    const f0_N = f0_kg * GRAVITY_MPS2;
    const v0 = Math.max(0, intercept);

    // Curva di potenza: P(L) = F * v = (L * 9.81) * (a * L + b)
    // Vertice: L_opt = -b / (2 * a), V_opt = b / 2
    let pmaxLoad = 0;
    let pmaxVelocity = 0;
    let pmax = 0;

    if (Math.abs(slope) > 0.0001) {
      pmaxLoad = Math.max(0, -intercept / (2 * slope));
      pmaxVelocity = Math.max(0, intercept / 2);
      pmax = (pmaxLoad * GRAVITY_MPS2) * pmaxVelocity;
    }

    // Label di qualità R2
    let qualityLabel = 'Bassa Affidabilità';
    if (rSquared >= 0.98) qualityLabel = 'Eccellente (Tier 1)';
    else if (rSquared >= 0.95) qualityLabel = 'Buona (Tier 2)';
    else if (rSquared >= 0.90) qualityLabel = 'Moderata (Tier 3)';

    // Sbilanciamento F-V (Sfv in %)
    const theoreticalOptimumRatio = 1.0;
    const actualRatio = oneRMVal > 0 ? f0_kg / oneRMVal : 1.0;
    const sfvPercent = Math.round((actualRatio - theoreticalOptimumRatio) * 100);
    let imbalanceLabel = 'Profilo Bilanciato';
    if (sfvPercent > 10) imbalanceLabel = 'Deficit di Velocità';
    else if (sfvPercent < -10) imbalanceLabel = 'Deficit di Forza';

    // Equazione stringa
    const eqSign = slope >= 0 ? '+' : '-';
    const equation = `v = ${intercept.toFixed(2)} ${eqSign} ${Math.abs(slope).toFixed(4)}·L`;

    // 5 Zone Bryan Mann
    const mannZones: BryanMannZoneRow[] = [
      {
        zone: 'Forza Assoluta',
        pctRange: '>90% 1RM',
        targetVelocity: '< 0.50 m/s',
        medianPct: '95%',
        loadRaw: oneRMVal * 0.95,
        load2_5kg: Math.round((oneRMVal * 0.95) / 2.5) * 2.5,
        velocity: Math.max(0, slope * (oneRMVal * 0.95) + intercept),
        forceN: (oneRMVal * 0.95) * GRAVITY_MPS2,
        powerW: (oneRMVal * 0.95 * GRAVITY_MPS2) * Math.max(0, slope * (oneRMVal * 0.95) + intercept),
        color: '#ef4444',
      },
      {
        zone: 'Forza Accelerativa',
        pctRange: '80-90% 1RM',
        targetVelocity: '0.50 - 0.75 m/s',
        medianPct: '85%',
        loadRaw: oneRMVal * 0.85,
        load2_5kg: Math.round((oneRMVal * 0.85) / 2.5) * 2.5,
        velocity: Math.max(0, slope * (oneRMVal * 0.85) + intercept),
        forceN: (oneRMVal * 0.85) * GRAVITY_MPS2,
        powerW: (oneRMVal * 0.85 * GRAVITY_MPS2) * Math.max(0, slope * (oneRMVal * 0.85) + intercept),
        color: '#f97316',
      },
      {
        zone: 'Forza-Potenza',
        pctRange: '60-80% 1RM',
        targetVelocity: '0.75 - 1.00 m/s',
        medianPct: '70%',
        loadRaw: oneRMVal * 0.70,
        load2_5kg: Math.round((oneRMVal * 0.70) / 2.5) * 2.5,
        velocity: Math.max(0, slope * (oneRMVal * 0.70) + intercept),
        forceN: (oneRMVal * 0.70) * GRAVITY_MPS2,
        powerW: (oneRMVal * 0.70 * GRAVITY_MPS2) * Math.max(0, slope * (oneRMVal * 0.70) + intercept),
        color: '#eab308',
      },
      {
        zone: 'Velocità-Forza',
        pctRange: '40-60% 1RM',
        targetVelocity: '1.00 - 1.30 m/s',
        medianPct: '50%',
        loadRaw: oneRMVal * 0.50,
        load2_5kg: Math.round((oneRMVal * 0.50) / 2.5) * 2.5,
        velocity: Math.max(0, slope * (oneRMVal * 0.50) + intercept),
        forceN: (oneRMVal * 0.50) * GRAVITY_MPS2,
        powerW: (oneRMVal * 0.50 * GRAVITY_MPS2) * Math.max(0, slope * (oneRMVal * 0.50) + intercept),
        color: '#3b82f6',
      },
      {
        zone: 'Forza Iniziale / Velocità',
        pctRange: '<40% 1RM',
        targetVelocity: '> 1.30 m/s',
        medianPct: '30%',
        loadRaw: oneRMVal * 0.30,
        load2_5kg: Math.round((oneRMVal * 0.30) / 2.5) * 2.5,
        velocity: Math.max(0, slope * (oneRMVal * 0.30) + intercept),
        forceN: (oneRMVal * 0.30) * GRAVITY_MPS2,
        powerW: (oneRMVal * 0.30 * GRAVITY_MPS2) * Math.max(0, slope * (oneRMVal * 0.30) + intercept),
        color: '#10b981',
      },
    ];

    // Scomposizione step di velocità (1.0 m/s down to 0.3 m/s)
    const velocitySteps: Array<{ velocity: number; loadKg: number; pct1RM: number }> = [];
    for (let v = 1.0; v >= 0.3; v -= 0.1) {
      const vClean = parseFloat(v.toFixed(1));
      const loadForV = Math.abs(slope) > 0.0001 ? Math.max(0, (vClean - intercept) / slope) : 0;
      const pct = oneRMVal > 0 ? (loadForV / oneRMVal) * 100 : 0;
      velocitySteps.push({
        velocity: vClean,
        loadKg: Math.round(loadForV * 10) / 10,
        pct1RM: Math.round(pct),
      });
    }

    return {
      oneRM: {
        value: Math.round(oneRMVal * 10) / 10,
        ci95Min: Math.round(ci95Min * 10) / 10,
        ci95Max: Math.round(ci95Max * 10) / 10,
        margin: Math.round(margin * 10) / 10,
      },
      f0_N: Math.round(f0_N),
      f0_kg: Math.round(f0_kg * 10) / 10,
      v0: Math.round(v0 * 100) / 100,
      pmax: Math.round(pmax),
      pmaxLoad: Math.round(pmaxLoad * 10) / 10,
      pmaxVelocity: Math.round(pmaxVelocity * 100) / 100,
      slope,
      intercept,
      rSquared,
      see: Math.round(see * 1000) / 1000,
      equation,
      qualityLabel,
      sfvPercent,
      imbalanceLabel,
      mannZones,
      velocitySteps,
    };
  }, [points, mvt]);

  return {
    athleteName,
    setAthleteName,
    exerciseName,
    setExerciseName,
    mvt,
    setMvt,
    stepMvt,
    regressionModel,
    setRegressionModel,
    points,
    addPoint,
    updatePoint,
    removePoint,
    clearPoints,
    loadDemoData,
    setPoints,
    results,
    isValid: results !== null,
  };
}
