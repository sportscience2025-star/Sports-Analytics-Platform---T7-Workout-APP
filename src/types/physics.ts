/**
 * src/types/physics.ts
 * Interfacce condivise per il motore Biomeccanico e VBT (Samozino / González-Badillo).
 * Rispetta la Regola R1 (Divieto di any) e Regola R2 (Interfacce condivise).
 */

/**
 * @deprecated Legacy unbranded VBT point. Use {@link SiKinematicsPoint} with branded SI units
 * (`Kilograms`, `MetersPerSecond`, `Newtons`, `Watts`) for new code.
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

/**
 * @deprecated Legacy unbranded VBT analysis payload. Uses unbranded numbers and legacy `f0_kg`
 * naming (kg instead of SI Newtons). Migrate callers to `VBTAnalysisResult`, `SiKinematicsPoint`,
 * and branded SI types (`Kilograms`, `MetersPerSecond`, `Newtons`, `Watts`).
 */
export interface VbtAnalysisData {
  athleteName: string;
  testType: string;
  mvt: number;
  regressionModel: 'auto_linear' | 'linear' | 'polynomial';
  points: Array<{
    load: number;
    velocity: number;
    reps?: number;
  }>;
  results?: {
    oneRM: {
      value: number;
      ci95Min: number;
      ci95Max: number;
      margin: number;
    };
    f0: number;
    /** @deprecated Legacy force-at-zero-velocity in kg; prefer `f0_N` in Newtons (SI). */
    f0_kg: number;
    v0: number;
    pmax: number;
    pmaxLoad: number;
    pmaxVelocity: number;
    rSquared: number;
    qualityLabel: string;
    see: number;
    equation: string;
    sfvPercent: number;
    imbalanceLabel: string;
    mannZones: Array<{
      zone: string;
      pctRange: string;
      targetVelocity: string;
      loadRaw: number;
      velocity: number;
      forceN: number;
      powerW: number;
      color: string;
    }>;
  };
}

// ==========================================
// RIGORE METROLOGICO SISTEMA INTERNAZIONALE (ADR-03)
// ==========================================

declare const __brand: unique symbol;
export type Brand<K, T> = K & { readonly [__brand]: T };

export type Newtons = Brand<number, 'Newtons'>;
export type Watts = Brand<number, 'Watts'>;
export type MetersPerSecond = Brand<number, 'MetersPerSecond'>;
export type Kilograms = Brand<number, 'Kilograms'>;
export type Degrees = Brand<number, 'Degrees'>;
export type Milliseconds = Brand<number, 'Milliseconds'>;
export type Seconds = Brand<number, 'Seconds'>;

export const STANDARD_GRAVITY_MPS2 = 9.80665;
export const MIN_VALID_LOAD_KG = 0.0;
export const MAX_VALID_LOAD_KG = 1000.0;
export const MIN_VALID_VELOCITY_MPS = 0.0;
export const MIN_ECCENTRIC_VELOCITY_MPS = -5.0;
export const MAX_VALID_VELOCITY_MPS = 12.50;

/**
 * Smart constructor con validazione di finitezza per la Forza in Newton.
 * @param value Valore numerico della forza
 * @returns Valore tipizzato Newtons
 */
export function asNewtons(value: number): Newtons {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Valore non valido per Forza (Newtons): ${value}`);
  }
  return value as Newtons;
}

/**
 * Smart constructor con validazione di finitezza per la Potenza in Watt.
 * @param value Valore numerico della potenza
 * @returns Valore tipizzato Watts
 */
export function asWatts(value: number): Watts {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Valore non valido per Potenza (Watts): ${value}`);
  }
  return value as Watts;
}

/**
 * Smart constructor per la Velocita in m/s con verifica limiti fisici (supporta fase eccentrica negativa fino a MIN_ECCENTRIC_VELOCITY_MPS).
 * @param value Valore numerico della velocita in m/s compreso tra MIN_ECCENTRIC_VELOCITY_MPS (-5.0) e MAX_VALID_VELOCITY_MPS (12.50)
 * @returns Valore tipizzato MetersPerSecond
 */
export function asMetersPerSecond(value: number): MetersPerSecond {
  if (!Number.isFinite(value) || value < MIN_ECCENTRIC_VELOCITY_MPS || value > MAX_VALID_VELOCITY_MPS) {
    throw new TypeError(
      `Valore non valido per Velocita (m/s): ${value} (intervallo consentito [${MIN_ECCENTRIC_VELOCITY_MPS}, ${MAX_VALID_VELOCITY_MPS}])`
    );
  }
  return value as MetersPerSecond;
}

/**
 * Smart constructor per il Carico in kg con verifica limiti fisici [MIN_VALID_LOAD_KG, MAX_VALID_LOAD_KG].
 * @param value Valore numerico del carico in kg compreso tra 0.0 e 1000.0
 * @returns Valore tipizzato Kilograms
 */
export function asKilograms(value: number): Kilograms {
  if (!Number.isFinite(value) || value < MIN_VALID_LOAD_KG || value > MAX_VALID_LOAD_KG) {
    throw new TypeError(
      `Valore non valido per Carico (kg): ${value} (intervallo consentito [${MIN_VALID_LOAD_KG}, ${MAX_VALID_LOAD_KG}])`
    );
  }
  return value as Kilograms;
}

/**
 * Smart constructor per l'Angolo articolare in gradi.
 * @param value Valore numerico dell'angolo
 * @returns Valore tipizzato Degrees
 */
export function asDegrees(value: number): Degrees {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Valore non valido per Angolo (gradi): ${value}`);
  }
  return value as Degrees;
}

/**
 * Smart constructor per il Tempo in millisecondi (non negativo).
 * @param value Valore numerico del tempo in ms
 * @returns Valore tipizzato Milliseconds
 */
export function asMilliseconds(value: number): Milliseconds {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`Valore non valido per Tempo (ms): ${value}`);
  }
  return value as Milliseconds;
}

/**
 * Smart constructor per il Tempo in secondi (non negativo).
 * @param value Valore numerico del tempo in s
 * @returns Valore tipizzato Seconds
 */
export function asSeconds(value: number): Seconds {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`Valore non valido per Tempo (s): ${value}`);
  }
  return value as Seconds;
}

export interface SiKinematicsPoint {
  loadKg: Kilograms;
  velocityMps: MetersPerSecond;
  forceN?: Newtons;
  powerW?: Watts;
  reps?: number;
  timestampMs?: Milliseconds;
}


