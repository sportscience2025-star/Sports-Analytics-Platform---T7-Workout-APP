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
