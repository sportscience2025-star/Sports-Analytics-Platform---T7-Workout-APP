/**
 * src/types/physics.ts
 * Interfacce condivise per il motore Biomeccanico e VBT (Samozino / González-Badillo).
 * Rispetta la Regola R1 (Divieto di any) e Regola R2 (Interfacce condivise).
 */

export interface LoadVelocityPoint {
  load: number;
  velocity: number;
  athlete?: string;
  exercise?: string;
  reps?: number;
  date?: string;
}

export interface OneRMResult {
  value: number;
  estimated: number;
  ci95Min: number;
  ci95Max: number;
  margin: number;
  ci95: [number, number];
}

export interface ResidualPoint {
  load: number;
  velocity: number;
  predicted: number;
  residual: number;
}

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  rSquaredAdj: number;
  v0: number;
  f0: number;
  f0_N: number;
  pmax: number;
  pmaxLoad: number;
  pmaxVelocity: number;
  see: number;
  n: number;
  outlierCount: number;
  equation: string;
  qualityLabel: string;
  modelType: 'linear';
  rm1?: OneRMResult;
  coefficients?: {
    c2: number;
    c1: number;
    c0: number;
  };
  sfvp?: number;
  meanV?: number;
  ssVV?: number;
  fvBias?: string;
  residuals?: ResidualPoint[];
  predictVelocity: (load: number) => number;
  predictLoad: (velocity: number) => number;
}

export interface QuadraticRegressionResult {
  coefficients: {
    c2: number;
    c1: number;
    c0: number;
  };
  rSquared: number;
  rSquaredAdj: number;
  v0: number;
  f0: number;
  f0_N: number;
  pmax: number;
  pmaxLoad: number;
  pmaxVelocity: number;
  see: number;
  n: number;
  outlierCount: number;
  equation: string;
  qualityLabel: string;
  isPhysical: boolean;
  modelType: 'quadratic';
  rm1?: OneRMResult;
  slope?: number;
  intercept?: number;
  sfvp?: number;
  meanV?: number;
  ssVV?: number;
  fvBias?: string;
  residuals?: ResidualPoint[];
  predictVelocity: (load: number) => number;
  predictLoad: (velocity: number) => number;
}

export type HybridRegressionResult = LinearRegressionResult | QuadraticRegressionResult;

export interface VBTZone {
  name: string;
  minVelocity: number;
  maxVelocity: number;
  pct1RMMin: number;
  pct1RMMax: number;
  color: string;
}

export interface BryanMannZoneRow {
  zone: string;
  pctRange: string;
  targetVelocity: string;
  medianPct: string;
  loadRaw: number;
  load2_5kg: number;
  velocity: number;
  forceN: number;
  powerW: number;
  color: string;
}

export interface VBTProgressionItem {
  week: number;
  percentage: string;
  load: number;
  velocity: string;
  forceN: string;
  force: number;
  power: number;
  powerW: string;
}

export interface VBTAnalysisResult {
  modelType: 'linear' | 'quadratic';
  slope: number;
  intercept: number;
  r2: number;
  rSquared: number;
  r2Adj?: number;
  f0: number;
  f0_N?: number;
  v0: number;
  pmax: number;
  pmaxLoad?: number;
  pmaxVelocity?: number;
  outlierCount: number;
  see?: number;
  equation?: string;
  qualityLabel?: string;
  regression: HybridRegressionResult;
  rm1: OneRMResult;
}

export interface LoadVelocityTableRow {
  pct: string;
  zone: string;
  color: string;
  loadRaw: string;
  load5kg: number;
  load2_5kg: number;
  velocity: string;
  forceN: string;
  power: string;
}

export interface VelocityStepTableRow {
  velocity: string;
  loadRaw: string;
  load2_5kg: number;
  pct: string;
}
