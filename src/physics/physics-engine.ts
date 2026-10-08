/**
 * src/physics/physics-engine.ts
 * Motore matematico e biomeccanico per Velocity Based Training (VBT) e Force-Velocity Profiling.
 * Implementa i modelli di Samozino et al. (2012, 2016) e González-Badillo & Pareja-Blanco.
 *
 * Rispetta le regole di architettura TypeScript Strict:
 * - Regola R1: Zero `any`.
 * - Regola R2: Interfacce condivise da `src/types/physics.ts`.
 * - Correzione metrologica IQR: calcolo di Q1, Q3 e IQR sui residui OLS preliminari.
 * - Normalizzazione 1RM: plain object `OneRMResult` senza boxed `new Number()`.
 */

import type {
  LoadVelocityPoint,
  LinearRegressionResult,
  QuadraticRegressionResult,
  HybridRegressionResult,
  OneRMResult,
  ResidualPoint,
  BryanMannZoneRow,
  VBTProgressionItem,
  VBTAnalysisResult,
  LoadVelocityTableRow,
  VelocityStepTableRow
} from '../types/physics';

// ============================================================================
// COSTANTI BIOMECCANICHE E METROLOGICHE
// ============================================================================

export const GRAVITY_MPS2 = 9.81;
export const DEFAULT_MVT = 0.30;
export const MIN_POINTS_LINEAR = 2;
export const MIN_POINTS_QUAD = 3;
export const MIN_POINTS_IQR = 4;
export const MIN_POINTS_MAD = 4;
export const IQR_MULTIPLIER = 1.5;
export const MAD_MOD_Z_THRESHOLD = 2.5;
export const MAD_NORMAL_SCALE = 0.6745;
export const COLLINEAR_EPSILON = 1e-9;
export const ZERO_SLOPE_EPSILON = 1e-4;
export const ZERO_TOLERANCE = 1e-6;
export const QUAD_C2_EPSILON = 1e-7;
export const R2_EXCELLENT = 0.98;
export const R2_GREAT = 0.95;
export const R2_GOOD = 0.90;
export const R2_ACCEPTABLE = 0.80;
export const QUAD_R2_GAIN_THRESHOLD = 0.003;
export const SFVP_THRESHOLD = 15;
export const EUR_LOWER_THRESHOLD = 1.05;
export const EUR_UPPER_THRESHOLD = 1.15;
export const RSI_LOW_THRESHOLD = 1.5;
export const RSI_MODERATE_THRESHOLD = 2.0;
export const RSI_HIGH_THRESHOLD = 2.5;
export const JUMP_HEIGHT_UNIT_CONVERSION_THRESHOLD = 3.0;

// Tabella t-Student critica a due code (alfa = 0.05) per gradi di libertà da 1 a 10
const STUDENT_T_TABLE_95: Readonly<Record<number, number>> = {
  1: 12.706,
  2: 4.303,
  3: 3.182,
  4: 2.776,
  5: 2.571,
  6: 2.447,
  7: 2.365,
  8: 2.306,
  9: 2.262,
  10: 2.228
};

// ============================================================================
// FUNZIONI METROLOGICHE E STATISTICHE AUSILIARIE
// ============================================================================

/**
 * Calcola la mediana di un array numerico.
 * @param arr - Vettore di numeri.
 * @returns Valore mediano dell'array o 0 se vuoto.
 */
export function calculateMedian(arr: number[]): number {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const len = sorted.length;
  const mid = Math.floor(len / 2);
  return len % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Rimuove gli outlier di velocità applicando il metodo dell'Interquartile Range (IQR)
 * sui RESIDUI rispetto a una retta di regressione OLS preliminare.
 * Correzione metrologica: applicare l'IQR alle velocità grezze è un errore perché
 * la velocità decresce fisiologicamente con il carico; il filtraggio è valido solo
 * sullo scostamento rispetto al modello ipotetico.
 *
 * @param data - Array di punti carico-velocità.
 * @returns Array privo di outlier residui (preserva almeno MIN_POINTS_LINEAR punti).
 */
export function removeOutliersIQR(data: LoadVelocityPoint[]): LoadVelocityPoint[] {
  if (!data || data.length < MIN_POINTS_IQR) return data;

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const pt of data) {
    sumX += pt.load;
    sumY += pt.velocity;
    sumXY += pt.load * pt.velocity;
    sumXX += pt.load * pt.load;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (Math.abs(denominator) < COLLINEAR_EPSILON) {
    return data;
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Calcolo dei residui rispetto al profilo preliminare OLS
  const residuals = data.map((pt) => pt.velocity - (slope * pt.load + intercept));
  const sortedResiduals = [...residuals].sort((a, b) => a - b);

  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sortedResiduals[q1Index];
  const q3 = sortedResiduals[q3Index];
  const iqr = q3 - q1;

  const fenceLower = q1 - IQR_MULTIPLIER * iqr;
  const fenceUpper = q3 + IQR_MULTIPLIER * iqr;

  const filtered = data.filter((_, idx) => {
    const res = residuals[idx];
    return res >= fenceLower && res <= fenceUpper;
  });

  return filtered.length >= 3 ? filtered : data;
}

/**
 * Rimuove gli outlier di velocità utilizzando la Median Absolute Deviation (MAD)
 * sui residui della regressione lineare preliminare.
 *
 * @param data - Array di punti carico-velocità.
 * @returns Array privo di outlier residui (preserva almeno 3 punti).
 */
export function removeOutliersMAD(data: LoadVelocityPoint[]): LoadVelocityPoint[] {
  if (!data || data.length < MIN_POINTS_MAD) return data;

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const pt of data) {
    sumX += pt.load;
    sumY += pt.velocity;
    sumXY += pt.load * pt.velocity;
    sumXX += pt.load * pt.load;
  }

  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < COLLINEAR_EPSILON) return data;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const residuals = data.map((pt) => pt.velocity - (slope * pt.load + intercept));
  const medianRes = calculateMedian(residuals);

  const absDevs = residuals.map((r) => Math.abs(r - medianRes));
  const mad = calculateMedian(absDevs);

  if (mad < COLLINEAR_EPSILON) return data;

  const filtered = data.filter((_, i) => {
    const modZ = (MAD_NORMAL_SCALE * Math.abs(residuals[i] - medianRes)) / mad;
    return modZ <= MAD_MOD_Z_THRESHOLD;
  });

  return filtered.length >= 3 ? filtered : data;
}

/**
 * Risolve un sistema lineare 3x3 per la regressione polinomiale tramite la Regola di Cramer.
 *
 * @param A - Matrice dei coefficienti 3x3.
 * @param B - Vettore dei termini noti 3x1.
 * @returns Vettore soluzione [c0, c1, c2] oppure null se la matrice è degenere.
 */
function solve3x3(A: number[][], B: number[]): [number, number, number] | null {
  const det3 = (M: number[][]): number =>
    M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
    M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
    M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);

  const d = det3(A);
  if (Math.abs(d) < 1e-12) return null;

  const replaceCol = (M: number[][], col: number, V: number[]): number[][] =>
    M.map((row, i) => row.map((val, j) => (j === col ? V[i] : val)));

  const c0 = det3(replaceCol(A, 0, B)) / d;
  const c1 = det3(replaceCol(A, 1, B)) / d;
  const c2 = det3(replaceCol(A, 2, B)) / d;

  return [c0, c1, c2];
}

/**
 * Trova il carico empirico alla massima potenza esplorando l'intervallo di dati con scansione lineare.
 *
 * @param data - Punti carico-velocità.
 * @param slope - Pendenza della retta OLS.
 * @param intercept - Intercetta della retta OLS.
 * @returns Carico in kg corrispondente alla potenza meccanica di picco.
 */
function findEmpiricalPmaxLoad(data: LoadVelocityPoint[], slope: number, intercept: number): number {
  const loads = data.map((d) => d.load);
  const minLoad = loads.reduce((a, b) => Math.min(a, b), Infinity);
  const maxLoad = loads.reduce((a, b) => Math.max(a, b), -Infinity);
  let maxP = 0;
  let bestLoad = (minLoad + maxLoad) / 2;
  const step = Math.max(0.1, (maxLoad - minLoad) / 500);

  for (let L = minLoad; L <= maxLoad; L += step) {
    const V = slope * L + intercept;
    if (V <= 0) break;
    const P = L * GRAVITY_MPS2 * V;
    if (P > maxP) {
      maxP = P;
      bestLoad = L;
    }
  }

  return bestLoad;
}

/**
 * Trova il carico empirico alla massima potenza per il modello quadratico.
 *
 * @param data - Punti carico-velocità.
 * @param c2 - Coefficiente quadratico.
 * @param c1 - Coefficiente lineare.
 * @param c0 - Termine noto.
 * @returns Carico in kg corrispondente alla massima potenza.
 */
function findEmpiricalPmaxLoadQuad(
  data: LoadVelocityPoint[],
  c2: number,
  c1: number,
  c0: number
): number {
  const loads = data.map((d) => d.load);
  const minLoad = loads.reduce((a, b) => Math.min(a, b), Infinity);
  const maxLoad = loads.reduce((a, b) => Math.max(a, b), -Infinity);
  let maxP = 0;
  let bestLoad = (minLoad + maxLoad) / 2;
  const step = Math.max(0.1, (maxLoad - minLoad) / 500);

  for (let L = minLoad; L <= maxLoad; L += step) {
    const V = c2 * L * L + c1 * L + c0;
    if (V <= 0) break;
    const P = L * GRAVITY_MPS2 * V;
    if (P > maxP) {
      maxP = P;
      bestLoad = L;
    }
  }

  return bestLoad;
}

// ============================================================================
// REGRESSIONE LINEARE E QUADRATICA VBT
// ============================================================================

/**
 * Calcola la regressione lineare per il profilo Carico-Velocità (F-V).
 * Modello: V = slope * L + intercept
 * - F0 = -intercept / slope (carico teorico a velocità zero)
 * - V0 = intercept (velocità teorica a carico zero)
 * - Pmax = F0_N * V0 / 4 (potenza teorica di picco)
 *
 * @param data - Array di { load: kg, velocity: m/s }.
 * @returns Oggetto LinearRegressionResult o null se dati insufficienti.
 */
export function linearRegressionVBT(data: LoadVelocityPoint[]): LinearRegressionResult | null {
  if (!data || data.length < MIN_POINTS_LINEAR) return null;

  // Filtraggio valori non validi o non finiti
  const validData = data.filter(
    (pt) =>
      typeof pt.load === 'number' &&
      isFinite(pt.load) &&
      typeof pt.velocity === 'number' &&
      isFinite(pt.velocity)
  );

  if (validData.length < MIN_POINTS_LINEAR) return null;

  // Rimozione outlier IQR metrologica sui residui per N >= 5
  let cleanData = validData;
  if (validData.length >= 5) {
    cleanData = removeOutliersIQR(validData);
    if (cleanData.length < 3) cleanData = validData;
  }

  const n = cleanData.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const pt of cleanData) {
    sumX += pt.load;
    sumY += pt.velocity;
    sumXY += pt.load * pt.velocity;
    sumXX += pt.load * pt.load;
    sumYY += pt.velocity * pt.velocity;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (Math.abs(denominator) < COLLINEAR_EPSILON) {
    return {
      modelType: 'linear',
      coefficients: { c0: 0, c1: 0, c2: 0 },
      slope: 0,
      intercept: 0,
      rSquared: 0,
      rSquaredAdj: 0,
      see: 0,
      v0: 0,
      f0: 0,
      f0_N: 0,
      pmax: 0,
      pmaxLoad: 0,
      pmaxVelocity: 0,
      sfvp: 0,
      n,
      outlierCount: data.length - n,
      meanV: 0,
      ssVV: 0,
      equation: 'Dati insufficienti (carichi identici)',
      qualityLabel: 'Profilo non valido',
      fvBias: 'Non valutabile',
      residuals: [],
      predictVelocity: () => 0,
      predictLoad: () => 0
    };
  }

  let slope = (n * sumXY - sumX * sumY) / denominator;
  if (Math.abs(slope) < ZERO_SLOPE_EPSILON) {
    slope = 0;
  }
  const intercept = (sumY - slope * sumX) / n;

  // Calcolo R-squared e residui
  const yMean = sumY / n;
  let totalSS = 0;
  let residualSS = 0;
  const residuals: ResidualPoint[] = [];

  for (const pt of cleanData) {
    const yPred = slope * pt.load + intercept;
    const res = pt.velocity - yPred;
    residuals.push({ load: pt.load, velocity: pt.velocity, predicted: yPred, residual: res });
    totalSS += Math.pow(pt.velocity - yMean, 2);
    residualSS += Math.pow(res, 2);
  }

  const rSquared = totalSS < 1e-12 ? 1 : Math.max(0, Math.min(1, 1 - residualSS / totalSS));
  const see = n > 2 ? Math.sqrt(residualSS / (n - 2)) : 0;

  // Parametri biomeccanici
  const v0 = intercept;
  const f0 = Math.abs(slope) > ZERO_TOLERANCE && intercept > ZERO_TOLERANCE ? -intercept / slope : 0;
  const f0_N = f0 * GRAVITY_MPS2;
  const pmax = f0_N > 0 && v0 > 0 ? (f0_N * v0) / 4 : 0;
  const pmaxLoad = f0 / 2;
  const pmaxVelocity = v0 / 2;

  const loadAtMaxPower = findEmpiricalPmaxLoad(cleanData, slope, intercept);
  const sfvp = f0 > 0 ? ((loadAtMaxPower - pmaxLoad) / pmaxLoad) * 100 : 0;

  let qualityLabel: string;
  if (rSquared >= R2_EXCELLENT) qualityLabel = '⭐ Eccellente (R²≥0.98)';
  else if (rSquared >= R2_GREAT) qualityLabel = '✅ Ottima (R²≥0.95)';
  else if (rSquared >= R2_GOOD) qualityLabel = '⚠️ Buona (R²≥0.90)';
  else if (rSquared >= R2_ACCEPTABLE) qualityLabel = '⚠️ Accettabile (R²≥0.80)';
  else qualityLabel = '❌ Bassa (R²<0.80) – Rieseguire test';

  let fvBias: string;
  if (sfvp > SFVP_THRESHOLD) {
    fvBias = `Orientato alla Forza (+${sfvp.toFixed(0)}%) → Lavorare sulla velocità/potenza`;
  } else if (sfvp < -SFVP_THRESHOLD) {
    fvBias = `Orientato alla Velocità (${sfvp.toFixed(0)}%) → Lavorare sulla forza massimale`;
  } else {
    fvBias = `Profilo Bilanciato (${sfvp.toFixed(0)}%) → Ottimale per la potenza`;
  }

  const rSquaredAdj = n > 2 ? Math.max(0, 1 - ((1 - rSquared) * (n - 1)) / (n - 2)) : rSquared;

  return {
    modelType: 'linear',
    coefficients: { c0: intercept, c1: slope, c2: 0 },
    slope,
    intercept,
    rSquared,
    rSquaredAdj,
    see,
    v0,
    f0,
    f0_N,
    pmax,
    pmaxLoad,
    pmaxVelocity,
    sfvp,
    n,
    outlierCount: data.length - n,
    meanV: yMean,
    ssVV: totalSS,
    equation: `V = ${slope.toFixed(4)}·L + ${intercept.toFixed(4)}`,
    qualityLabel,
    fvBias,
    residuals,
    predictVelocity: (load: number): number => slope * load + intercept,
    predictLoad: (vel: number): number => (Math.abs(slope) < COLLINEAR_EPSILON ? 0 : (vel - intercept) / slope)
  };
}

/**
 * Calcola la regressione polinomiale di 2° grado per il profilo Carico-Velocità.
 * Modello: V = c2 * L^2 + c1 * L + c0
 *
 * @param data - Array di punti { load: kg, velocity: m/s }.
 * @returns Oggetto QuadraticRegressionResult o null se dati insufficienti.
 */
export function quadraticRegressionVBT(data: LoadVelocityPoint[]): QuadraticRegressionResult | null {
  if (!data || data.length < MIN_POINTS_QUAD) return null;

  const validData = data.filter(
    (pt) =>
      typeof pt.load === 'number' &&
      isFinite(pt.load) &&
      typeof pt.velocity === 'number' &&
      isFinite(pt.velocity)
  );

  if (validData.length < MIN_POINTS_QUAD) return null;

  let cleanData = validData;
  if (validData.length >= 4) {
    cleanData = removeOutliersMAD(validData);
    if (cleanData.length < 3) cleanData = validData;
  }

  const n = cleanData.length;
  let sL0 = n;
  let sL1 = 0;
  let sL2 = 0;
  let sL3 = 0;
  let sL4 = 0;
  let sV0 = 0;
  let sLV = 0;
  let sL2V = 0;

  for (const pt of cleanData) {
    const l = pt.load;
    const v = pt.velocity;
    const l2 = l * l;
    sL1 += l;
    sL2 += l2;
    sL3 += l2 * l;
    sL4 += l2 * l2;
    sV0 += v;
    sLV += l * v;
    sL2V += l2 * v;
  }

  const A = [
    [sL0, sL1, sL2],
    [sL1, sL2, sL3],
    [sL2, sL3, sL4]
  ];
  const B = [sV0, sLV, sL2V];

  const coeffs = solve3x3(A, B);
  if (!coeffs) return null;

  const [c0, c1, c2] = coeffs;
  const yMean = sV0 / n;
  let totalSS = 0;
  let residualSS = 0;
  const residuals: ResidualPoint[] = [];

  for (const pt of cleanData) {
    const yPred = c2 * pt.load * pt.load + c1 * pt.load + c0;
    const res = pt.velocity - yPred;
    residuals.push({ load: pt.load, velocity: pt.velocity, predicted: yPred, residual: res });
    totalSS += Math.pow(pt.velocity - yMean, 2);
    residualSS += Math.pow(res, 2);
  }

  const rSquared = totalSS < 1e-12 ? 1 : Math.max(0, Math.min(1, 1 - residualSS / totalSS));
  const p = 2;
  const rSquaredAdj = n > p + 1 ? Math.max(0, 1 - ((1 - rSquared) * (n - 1)) / (n - p - 1)) : rSquared;
  const see = n > p + 1 ? Math.sqrt(residualSS / (n - p - 1)) : 0;
  const v0 = c0;

  let f0 = 0;
  if (Math.abs(c2) < QUAD_C2_EPSILON) {
    f0 = Math.abs(c1) > ZERO_TOLERANCE && c0 > ZERO_TOLERANCE ? -c0 / c1 : 0;
  } else {
    const disc = c1 * c1 - 4 * c2 * c0;
    if (disc >= 0) {
      const root1 = (-c1 - Math.sqrt(disc)) / (2 * c2);
      const root2 = (-c1 + Math.sqrt(disc)) / (2 * c2);
      const validRoots = [root1, root2].filter((r) => r > 0);
      f0 = validRoots.length > 0 ? Math.min(...validRoots) : 0;
    }
  }
  const f0_N = f0 * GRAVITY_MPS2;

  let pmaxLoad = f0 > 0 ? f0 / 2 : 0;
  const pDisc = 4 * c1 * c1 - 12 * c2 * c0;
  if (Math.abs(c2) > QUAD_C2_EPSILON && pDisc >= 0) {
    const pr1 = (-2 * c1 - Math.sqrt(pDisc)) / (6 * c2);
    const pr2 = (-2 * c1 + Math.sqrt(pDisc)) / (6 * c2);
    const validP = [pr1, pr2].filter((r) => r > 0 && r < (f0 || 1000));
    if (validP.length > 0) pmaxLoad = validP[0];
  }
  const pmaxVel = c2 * pmaxLoad * pmaxLoad + c1 * pmaxLoad + c0;
  const pmax = f0_N > 0 && pmaxVel > 0 ? pmaxLoad * GRAVITY_MPS2 * pmaxVel : 0;

  const loadAtMaxPower = findEmpiricalPmaxLoadQuad(cleanData, c2, c1, c0);
  let sfvp = f0 > 0 ? ((loadAtMaxPower - pmaxLoad) / pmaxLoad) * 100 : 0;
  if (!Number.isFinite(sfvp)) sfvp = 0;

  let qualityLabel: string;
  if (rSquaredAdj >= R2_EXCELLENT) qualityLabel = '⭐ Eccellente (R²adj≥0.98)';
  else if (rSquaredAdj >= R2_GREAT) qualityLabel = '✅ Ottima (R²adj≥0.95)';
  else if (rSquaredAdj >= R2_GOOD) qualityLabel = '⚠️ Buona (R²adj≥0.90)';
  else if (rSquaredAdj >= R2_ACCEPTABLE) qualityLabel = '⚠️ Accettabile (R²adj≥0.80)';
  else qualityLabel = '❌ Bassa (R²adj<0.80) – Rieseguire test';

  let fvBias: string;
  if (sfvp > SFVP_THRESHOLD) {
    fvBias = `Orientato alla Forza (+${sfvp.toFixed(0)}%) → Lavorare sulla velocità/potenza`;
  } else if (sfvp < -SFVP_THRESHOLD) {
    fvBias = `Orientato alla Velocità (${sfvp.toFixed(0)}%) → Lavorare sulla forza massimale`;
  } else {
    fvBias = `Profilo Bilanciato (${sfvp.toFixed(0)}%) → Ottimale per la potenza`;
  }

  const isPhysical = c2 <= 0.0001 && f0 > 0 && v0 > 0;

  return {
    modelType: 'quadratic',
    coefficients: { c0, c1, c2 },
    slope: c1,
    intercept: c0,
    rSquared,
    rSquaredAdj,
    see,
    v0,
    f0,
    f0_N,
    pmax,
    pmaxLoad,
    pmaxVelocity: pmaxVel,
    sfvp,
    n,
    outlierCount: data.length - n,
    meanV: yMean,
    ssVV: totalSS,
    equation: `V = ${c2 >= 0 ? '+' : ''}${c2.toFixed(5)}·L² ${c1 >= 0 ? '+' : ''}${c1.toFixed(4)}·L + ${c0.toFixed(4)}`,
    qualityLabel,
    fvBias,
    residuals,
    isPhysical,
    predictVelocity: (load: number): number => c2 * load * load + c1 * load + c0,
    predictLoad: (vel: number): number => {
      if (Math.abs(c2) < QUAD_C2_EPSILON) {
        return Math.abs(c1) < COLLINEAR_EPSILON ? 0 : (vel - c0) / c1;
      }
      const d = c1 * c1 - 4 * c2 * (c0 - vel);
      if (d < 0) return 0;
      const r1 = (-c1 - Math.sqrt(d)) / (2 * c2);
      const r2 = (-c1 + Math.sqrt(d)) / (2 * c2);
      const valid = [r1, r2].filter((r) => r >= 0);
      return valid.length > 0 ? Math.min(...valid) : 0;
    }
  };
}

/**
 * Seleziona automaticamente il modello di regressione ottimale (Lineare vs Quadratico)
 * in base al guadagno di R² corretto e alla plausibilità biomeccanica (Samozino 2014).
 *
 * @param data - Array di punti { load, velocity }.
 * @returns Modello selezionato (LinearRegressionResult o QuadraticRegressionResult) o null.
 */
export function autoSelectRegressionVBT(data: LoadVelocityPoint[]): HybridRegressionResult | null {
  if (!data || data.length < MIN_POINTS_LINEAR) return null;

  let cleanData = data;
  if (data.length >= 4) {
    cleanData = removeOutliersMAD(data);
    if (cleanData.length < 3) cleanData = data;
  }

  const n = cleanData.length;
  const linReg = linearRegressionVBT(cleanData);

  if (n < 4 || !linReg) {
    return linReg;
  }

  const quadReg = quadraticRegressionVBT(cleanData);
  if (!quadReg) return linReg;

  const r2Gain = quadReg.rSquaredAdj - linReg.rSquaredAdj;
  const isPhysical = quadReg.coefficients.c2 <= 0.0001 && quadReg.f0 > 0 && quadReg.v0 > 0;

  if (r2Gain > QUAD_R2_GAIN_THRESHOLD && isPhysical) {
    return quadReg;
  }

  return linReg;
}

// ============================================================================
// STIMA DEL CARICO MASSIMALE (1RM) CON INTERVALLO DI CONFIDENZA 95%
// ============================================================================

/**
 * Stima il carico 1RM in base alla Minimum Velocity Threshold (MVT) con intervallo di confidenza al 95%.
 * Normalizzazione metrologica: restituisce sempre un plain object tipizzato come OneRMResult.
 *
 * @param regression - Modello di regressione lineare o quadratico.
 * @param mvt - Minimum Velocity Threshold in m/s (default 0.30 m/s).
 * @returns Plain object OneRMResult { value, estimated, ci95Min, ci95Max, margin, ci95 }.
 */
export function estimate1RM(
  regression: HybridRegressionResult | null | undefined,
  mvt: number = DEFAULT_MVT
): OneRMResult {
  const emptyResult: OneRMResult = {
    value: 0,
    estimated: 0,
    ci95Min: 0,
    ci95Max: 0,
    margin: 0,
    ci95: [0, 0]
  };

  if (!regression) return emptyResult;

  const slope =
    regression.slope !== undefined
      ? regression.slope
      : regression.coefficients
        ? regression.coefficients.c1
        : 0;
  const v0 = regression.v0 ?? regression.intercept ?? 0;

  if (v0 <= 0 || mvt <= 0 || mvt >= v0) {
    return emptyResult;
  }

  let est = 0;
  if (typeof regression.predictLoad === 'function') {
    est = Math.max(0, regression.predictLoad(mvt));
  } else if (Math.abs(slope) > COLLINEAR_EPSILON) {
    est = Math.max(0, (mvt - v0) / slope);
  }

  if (isNaN(est) || !isFinite(est) || est <= 0) {
    return emptyResult;
  }

  const see = regression.see || 0.01;
  const n = regression.n || 5;
  const meanV = regression.meanV ?? 0.60;
  const ssVV = regression.ssVV ?? 0.10;

  let effSlope = Math.abs(slope);
  if (regression.modelType === 'quadratic' && regression.coefficients) {
    const { c2, c1 } = regression.coefficients;
    effSlope = Math.abs(2 * c2 * est + c1) || effSlope;
  }
  if (effSlope < 1e-5) effSlope = 1e-5;

  const se1RM =
    (see / effSlope) *
    Math.sqrt(1 + 1 / n + Math.pow(mvt - meanV, 2) / Math.max(1e-6, ssVV));

  const df = Math.max(1, n - (regression.modelType === 'quadratic' ? 3 : 2));
  const tCrit = STUDENT_T_TABLE_95[df] ?? (df > 30 ? 1.96 : 2.0 + 2.0 / df);

  const margin = tCrit * se1RM;
  const ci95Min = Math.max(0, est - margin);
  const ci95Max = est + margin;

  return {
    value: est,
    estimated: est,
    ci95Min,
    ci95Max,
    margin,
    ci95: [ci95Min, ci95Max]
  };
}

// ============================================================================
// GENERATORI DI TABELLE E ZONE DI VELOCITÀ VBT
// ============================================================================

/**
 * Genera la tabella carico-velocità per le zone percentuali standard di 1RM (30% - 100%).
 *
 * @param oneRM - 1RM stimato in kg.
 * @param regression - Modello di regressione per calcolare la velocità attesa.
 * @returns Array di righe LoadVelocityTableRow per ogni zona percentuale.
 */
export function generateLoadVelocityTable(
  oneRM: number,
  regression: HybridRegressionResult | null | undefined
): LoadVelocityTableRow[] {
  if (!oneRM || oneRM <= 0 || !regression) return [];

  const zones = [
    { pct: 0.30, zone: 'Potenza Balistica', color: '#06b6d4' },
    { pct: 0.40, zone: 'Potenza Alta', color: '#10b981' },
    { pct: 0.50, zone: 'Potenza Moderata', color: '#84cc16' },
    { pct: 0.55, zone: 'Ibrida Forza-Vel.', color: '#a3e635' },
    { pct: 0.60, zone: 'Ibrida Forza-Vel.', color: '#eab308' },
    { pct: 0.65, zone: 'Forza-Velocità', color: '#f59e0b' },
    { pct: 0.70, zone: 'Forza-Velocità', color: '#f97316' },
    { pct: 0.75, zone: 'Forza-Resistenza', color: '#f87171' },
    { pct: 0.80, zone: 'Forza Sub-Max', color: '#f43f5e' },
    { pct: 0.85, zone: 'Forza Sub-Max', color: '#fb7185' },
    { pct: 0.90, zone: 'Forza Massimale', color: '#f472b6' },
    { pct: 0.95, zone: 'Forza Massimale', color: '#ff3385' },
    { pct: 1.00, zone: '1RM (MVT)', color: '#ff3366' }
  ];

  return zones.map((z) => {
    const loadRaw = oneRM * z.pct;
    const load5 = Math.round(loadRaw / 2.5) * 2.5;
    const load5kg = Math.round(loadRaw / 5) * 5;
    const vel = regression.predictVelocity(loadRaw);
    const velClamped = Math.max(0, vel);
    const forceN = loadRaw * GRAVITY_MPS2;
    const power = forceN * velClamped;

    return {
      pct: `${(z.pct * 100).toFixed(0)}%`,
      zone: z.zone,
      color: z.color,
      loadRaw: loadRaw.toFixed(1),
      load5kg,
      load2_5kg: load5,
      velocity: velClamped.toFixed(3),
      forceN: forceN.toFixed(0),
      power: power.toFixed(0)
    };
  });
}

/**
 * Genera la tabella carico-velocità per passi fissi di velocità (da 1.0 m/s a 0.3 m/s).
 *
 * @param oneRM - 1RM stimato in kg.
 * @param regression - Modello di regressione per predire il carico.
 * @returns Array di righe VelocityStepTableRow.
 */
export function generateVelocityStepsTable(
  oneRM: number,
  regression: HybridRegressionResult | null | undefined
): VelocityStepTableRow[] {
  if (!regression || typeof regression.predictLoad !== 'function') return [];
  const velocities = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];

  return velocities.map((vTarget) => {
    const rawVal = regression.predictLoad(vTarget);
    const loadRaw = isNaN(rawVal) || !isFinite(rawVal) ? 0 : Math.max(0, rawVal);
    const load2_5kg = Math.round(loadRaw / 2.5) * 2.5;
    const pct1RM = oneRM && oneRM > 0 ? (loadRaw / oneRM) * 100 : 0;

    return {
      velocity: vTarget.toFixed(1),
      loadRaw: loadRaw.toFixed(1),
      load2_5kg,
      pct: `${pct1RM.toFixed(1)}%`
    };
  });
}

/**
 * Genera una progressione di allenamento settimanale basata su VBT.
 *
 * @param oneRM - 1RM stimato in kg.
 * @param regression - Modello di regressione per calcolare la velocità attesa.
 * @param weeks - Numero di settimane (default 4).
 * @returns Array di elementi VBTProgressionItem.
 */
export function generateVBTProgression(
  oneRM: number,
  regression: HybridRegressionResult | null | undefined,
  weeks: number = 4
): VBTProgressionItem[] {
  const safeOneRM = isNaN(oneRM) || oneRM <= 0 ? 0 : oneRM;
  const progression: VBTProgressionItem[] = [];
  const percentages = [0.70, 0.75, 0.80, 0.85, 0.88, 0.90];

  for (let i = 0; i < weeks; i++) {
    const targetPct = percentages[Math.min(i, percentages.length - 1)];
    const rawLoad = safeOneRM * targetPct;
    const roundedLoad = Math.floor(rawLoad / 5) * 5;
    let predictedVel = regression ? regression.predictVelocity(roundedLoad) : 0;
    if (isNaN(predictedVel)) predictedVel = 0;
    const clampedVel = Math.max(0.05, predictedVel);
    const forceN = roundedLoad * GRAVITY_MPS2;
    const power = forceN * clampedVel;

    progression.push({
      week: i + 1,
      percentage: `${(targetPct * 100).toFixed(0)}%`,
      load: roundedLoad,
      velocity: clampedVel.toFixed(3),
      forceN: forceN.toFixed(0),
      force: Math.round(forceN),
      power: Math.round(power),
      powerW: power.toFixed(0)
    });
  }

  return progression;
}

// ============================================================================
// CALCOLI BIOMECCANICI ELEMENTARI E PROFILO DEI SALTI
// ============================================================================

/**
 * Calcola la forza peso (Newton) = massa (kg) * g (m/s²).
 *
 * @param massKg - Massa in chilogrammi.
 * @returns Forza in Newton.
 */
export function calculateForce(massKg: number): number {
  if (typeof massKg !== 'number' || isNaN(massKg) || !isFinite(massKg) || massKg <= 0) return 0;
  return massKg * GRAVITY_MPS2;
}

/**
 * Calcola la potenza meccanica (Watt) = forza (N) * velocità (m/s).
 *
 * @param forceN - Forza in Newton.
 * @param velocityMs - Velocità in m/s.
 * @returns Potenza in Watt.
 */
export function calculatePower(forceN: number, velocityMs: number): number {
  if (typeof forceN !== 'number' || typeof velocityMs !== 'number' || isNaN(forceN) || isNaN(velocityMs)) {
    return 0;
  }
  return Math.max(0, forceN * velocityMs);
}

/**
 * Calcola l'Eccentric Utilization Ratio (EUR) = altezza CMJ / altezza SJ.
 *
 * @param cmjHeight - Altezza Countermovement Jump (cm).
 * @param sjHeight - Altezza Squat Jump (cm).
 * @returns Indice EUR (adimensionale).
 */
export function calculateEUR(cmjHeight: number, sjHeight: number): number {
  if (
    typeof cmjHeight !== 'number' ||
    typeof sjHeight !== 'number' ||
    isNaN(cmjHeight) ||
    isNaN(sjHeight) ||
    cmjHeight <= 0 ||
    sjHeight <= 0
  ) {
    return 0;
  }
  return cmjHeight / sjHeight;
}

/**
 * Calcola il Reactive Strength Index (RSI) = altezza salto (m) / tempo contatto (s).
 * Riconosce automaticamente altezze in cm (se > 3.0) e le converte in metri.
 *
 * @param jumpHeight - Altezza salto (cm o m).
 * @param contactTime - Tempo di contatto (secondi).
 * @returns Indice RSI in m/s.
 */
export function calculateRSI(jumpHeight: number, contactTime: number): number {
  if (
    typeof jumpHeight !== 'number' ||
    typeof contactTime !== 'number' ||
    isNaN(jumpHeight) ||
    isNaN(contactTime) ||
    jumpHeight <= 0 ||
    contactTime <= 0
  ) {
    return 0;
  }
  const heightM = jumpHeight > JUMP_HEIGHT_UNIT_CONVERSION_THRESHOLD ? jumpHeight / 100 : jumpHeight;
  return heightM / contactTime;
}

/**
 * Valuta il profilo del salto integrando EUR e RSI secondo i cut-off di letteratura (Bosco, Young).
 *
 * @param eur - Indice EUR (CMJ/SJ).
 * @param rsi - Indice RSI (m/s).
 * @returns Interpretazione clinico-biomeccanica strutturata.
 */
export function evaluateJumpPerformance(eur: number, rsi: number): string {
  let eurEval = '';
  if (!eur || eur <= 0) {
    eurEval = 'N/A (Dato EUR mancante)';
  } else if (eur < EUR_LOWER_THRESHOLD) {
    eurEval = `Dominanza Concentrica (EUR = ${eur.toFixed(4)}). L'atleta dipende principalmente dalla produzione di forza concentrica e non sfrutta adeguatamente il ciclo di allungamento-accorciamento (SSC). Suggerisce allenamento reattivo e pliometrico per migliorare lo stoccaggio di energia elastica.`;
  } else if (eur <= EUR_UPPER_THRESHOLD) {
    eurEval = `Profilo Bilanciato (EUR = ${eur.toFixed(4)}). Trasferimento ottimale di energia attraverso il ciclo SSC. Incremento tipico del 5-15% di performance con il contromovimento.`;
  } else {
    eurEval = `Dominanza SSC / Deficit Concentrico (EUR = ${eur.toFixed(4)}). L'atleta ha un eccellente utilizzo dell'elasticità ma può presentare un deficit nella produzione assoluta di forza concentrica. Suggerisce lavoro con squat isometrici o con pausa.`;
  }

  let rsiEval = '';
  if (!rsi || rsi <= 0) {
    rsiEval = 'N/A (Dato RSI mancante)';
  } else if (rsi < RSI_LOW_THRESHOLD) {
    rsiEval = `Basso (RSI = ${rsi.toFixed(4)}). Capacità reattiva e rigidità muscolo-tendinea scarse. Focus su meccanica di atterraggio, pliometria a bassa intensità (pogo hops) e forza generale.`;
  } else if (rsi < RSI_MODERATE_THRESHOLD) {
    rsiEval = `Moderato (RSI = ${rsi.toFixed(4)}). Capacità reattiva media. L'atleta può beneficiare di salti a ostacoli progressivi e drop jump moderato.`;
  } else if (rsi <= RSI_HIGH_THRESHOLD) {
    rsiEval = `Alto (RSI = ${rsi.toFixed(4)}). Buona capacità reattiva e rigidità tendinea. Mantenere e ottimizzare all'altezza di caduta attuale.`;
  } else {
    rsiEval = `Elite (RSI = ${rsi.toFixed(4)}). Eccezionale rigidità tendinea e capacità di rimbalzo reattivo. Implementare shock training avanzato o pliometria appesantita.`;
  }

  return `Profilo EUR: ${eurEval}\n\nProfilo RSI: ${rsiEval}`;
}

/**
 * Genera la tabella delle 5 zone di forza secondo Bryan Mann.
 * Adatta i cut-off di velocità per esercizi a basso MVT (es. panca o stacco vs squat).
 *
 * @param oneRM - 1RM stimato o noto in kg.
 * @param regression - Modello di regressione per predire la velocità.
 * @param exerciseName - Nome dell'esercizio per la calibrazione MVT.
 * @returns Array di righe BryanMannZoneRow.
 */
export function generateBryanMannVBTTable(
  oneRM: number,
  regression: HybridRegressionResult | null | undefined,
  exerciseName: string = ''
): BryanMannZoneRow[] {
  if (typeof oneRM !== 'number' || isNaN(oneRM) || oneRM <= 0 || !regression) {
    return [];
  }

  const exStr = typeof exerciseName === 'string' ? exerciseName.toLowerCase() : '';
  const isBenchOrLowMVT =
    exStr.includes('bench') ||
    exStr.includes('panca') ||
    exStr.includes('stacco') ||
    exStr.includes('deadlift') ||
    exStr.includes('chest') ||
    exStr.includes('distensioni');

  const zones = [
    {
      zone: 'Forza Assoluta',
      pctRange: '>90%',
      medianPct: 0.95,
      targetVelocity: isBenchOrLowMVT ? '<0.35 m/s' : '<0.50 m/s',
      color: '#f43f5e'
    },
    {
      zone: 'Forza Accelerativa',
      pctRange: '80-90%',
      medianPct: 0.85,
      targetVelocity: isBenchOrLowMVT ? '0.35 - 0.60 m/s' : '0.50 - 0.75 m/s',
      color: '#f59e0b'
    },
    {
      zone: 'Forza-Velocità',
      pctRange: '60-80%',
      medianPct: 0.70,
      targetVelocity: isBenchOrLowMVT ? '0.60 - 0.85 m/s' : '0.75 - 1.00 m/s',
      color: '#eab308'
    },
    {
      zone: 'Velocità-Forza',
      pctRange: '30-60%',
      medianPct: 0.45,
      targetVelocity: isBenchOrLowMVT ? '0.85 - 1.15 m/s' : '1.00 - 1.30 m/s',
      color: '#10b981'
    },
    {
      zone: 'Forza Iniziale',
      pctRange: '<30%',
      medianPct: 0.225,
      targetVelocity: isBenchOrLowMVT ? '>1.15 m/s' : '>1.30 m/s',
      color: '#06b6d4'
    }
  ];

  return zones.map((z) => {
    let loadRaw = oneRM * z.medianPct;
    if (typeof loadRaw !== 'number' || isNaN(loadRaw) || !isFinite(loadRaw)) loadRaw = 0;

    let load2_5kg = Math.round(loadRaw / 2.5) * 2.5;
    if (typeof load2_5kg !== 'number' || isNaN(load2_5kg) || !isFinite(load2_5kg)) load2_5kg = 0;

    let velocity = 0;
    if (regression && typeof regression.predictVelocity === 'function') {
      const pv = regression.predictVelocity(load2_5kg);
      if (typeof pv === 'number' && !isNaN(pv) && isFinite(pv)) {
        velocity = Math.max(0, pv);
      }
    }

    const forceN = calculateForce(load2_5kg);
    const powerW = calculatePower(forceN, velocity);

    return {
      zone: z.zone,
      pctRange: z.pctRange,
      targetVelocity: z.targetVelocity,
      medianPct: `${(z.medianPct * 100).toFixed(1)}%`,
      loadRaw,
      load2_5kg,
      velocity,
      forceN,
      powerW,
      color: z.color
    };
  });
}

/**
 * Opzioni per il wrapper di analisi unificato.
 */
export interface AnalyzeLoadVelocityOptions {
  mvt?: number;
}

/**
 * Esegue in un'unica chiamata la selezione automatica della regressione e la stima del 1RM.
 * Restituisce un oggetto VBTAnalysisResult unificato, conforme all'interfaccia condivisa.
 *
 * @param data - Array di punti { load, velocity }.
 * @param options - Opzioni di configurazione opzionali (mvt).
 * @returns Risultato unificato VBTAnalysisResult o null se il test non è valido.
 */
export function analyzeLoadVelocity(
  data: LoadVelocityPoint[],
  options: AnalyzeLoadVelocityOptions = {}
): VBTAnalysisResult | null {
  const mvt = typeof options.mvt === 'number' ? options.mvt : DEFAULT_MVT;
  const regression = autoSelectRegressionVBT(data);
  if (!regression) return null;

  const rm1 = estimate1RM(regression, mvt);

  return {
    modelType: regression.modelType,
    slope:
      regression.slope ??
      (regression.coefficients ? regression.coefficients.c1 : 0),
    intercept:
      regression.intercept ??
      (regression.coefficients ? regression.coefficients.c0 : 0),
    r2: regression.rSquared,
    rSquared: regression.rSquared,
    f0: regression.f0,
    v0: regression.v0,
    pmax: regression.pmax,
    outlierCount: regression.outlierCount || 0,
    regression,
    rm1
  };
}

// ============================================================================
// CLASSE PHYSICS ENGINE (COMPATIBILITÀ API ES6 / TYPESCRIPT)
// ============================================================================

/**
 * Classe che raggruppa tutti i metodi statici del motore biomeccanico e statistico VBT.
 */
export class PhysicsEngine {
  static linearRegressionVBT = linearRegressionVBT;
  static quadraticRegressionVBT = quadraticRegressionVBT;
  static autoSelectRegressionVBT = autoSelectRegressionVBT;
  static estimate1RM = estimate1RM;
  static generateLoadVelocityTable = generateLoadVelocityTable;
  static generateVelocityStepsTable = generateVelocityStepsTable;
  static generateVBTProgression = generateVBTProgression;
  static calculateForce = calculateForce;
  static calculatePower = calculatePower;
  static calculateEUR = calculateEUR;
  static calculateRSI = calculateRSI;
  static evaluateJumpPerformance = evaluateJumpPerformance;
  static generateBryanMannVBTTable = generateBryanMannVBTTable;
  static analyzeLoadVelocity = analyzeLoadVelocity;
  static removeOutliersIQR = removeOutliersIQR;
  static removeOutliersMAD = removeOutliersMAD;
  static calculateMedian = calculateMedian;
}
