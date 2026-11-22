/**
 * src/utils/metrology-guard.ts
 * Modulo runtime di validazione dimensionale e sanitizzazione per grandezze del Sistema Internazionale (SI).
 * Conforme ad ADR-01 (Thin Client), ADR-03 (Rigore Metrologico SI) e Regola 02 (un file = una responsabilita).
 *
 * Architettura a due percorsi:
 * 1. Hot-Path (Streaming BLE a 60-120 fps): funzioni scalari non-allocanti (zero Garbage Collection overhead).
 * 2. Boundary-Path (Form input, payload API, persistenza): validatori con ValidationResult<T> tipizzato.
 */

import {
  Newtons,
  Watts,
  MetersPerSecond,
  Kilograms,
  Degrees,
  Milliseconds,
  Seconds,
  asNewtons,
  asWatts,
  asMetersPerSecond,
  asKilograms,
  asDegrees,
  asMilliseconds,
  asSeconds,
  MIN_VALID_LOAD_KG,
  MAX_VALID_LOAD_KG,
  MIN_VALID_VELOCITY_MPS,
  MAX_VALID_VELOCITY_MPS,
} from '../types/physics';

// ============================================================================
// COSTANTI METROLOGICHE & LIMITI FISIOLOGICI DOCUMENTATI (ZERO MAGIC NUMBERS)
// ============================================================================

/** Epsilon per prevenzione divisioni per zero ed indeterminazioni IEEE 754 */
export const EPSILON_DIVISION_GUARD = 1e-7;

/** Limiti fisiologici Carico / Massa (kg) */
export const MIN_PHYSIOLOGICAL_LOAD_KG = MIN_VALID_LOAD_KG; // 0.0 kg
export const MAX_PHYSIOLOGICAL_LOAD_KG = MAX_VALID_LOAD_KG; // 1000.0 kg (record mondiale powerlifting + margine sicurezza)

/** Limiti fisiologici Velocita (m/s) */
export const MIN_PHYSIOLOGICAL_VELOCITY_MPS = MIN_VALID_VELOCITY_MPS; // 0.0 m/s
export const MAX_BARBELL_VBT_VELOCITY_MPS = 4.0; // Velocita massima propulsiva bilanciere (jump squat scarico)
export const MAX_PHYSIOLOGICAL_VELOCITY_MPS = MAX_VALID_VELOCITY_MPS; // 12.50 m/s (picco assoluto sprint umano Usain Bolt 12.42 m/s)
export const MIN_ECCENTRIC_VELOCITY_MPS = -5.0; // Limite inferiore velocita eccentrica negativa VBT

/** Limiti fisiologici Forza (N) */
export const MIN_PHYSIOLOGICAL_FORCE_N = 0.0;
export const MAX_PHYSIOLOGICAL_FORCE_N = 15000.0; // Picco massimo atleti elite drop jump / IMTP su pedane Vald ForceDecks
export const MIN_SHEAR_FORCE_N = -5000.0; // Forze di taglio orizzontali / frenata antero-posteriore

/** Limiti fisiologici Potenza (W) */
export const MIN_PHYSIOLOGICAL_POWER_W = 0.0;
export const MAX_PHYSIOLOGICAL_POWER_W = 10000.0; // Picco alattacido cicloergometro / pedana velocisti

/** Limiti fisiologici Angoli articolari (Gradi sessagesimali) */
export const MIN_PHYSIOLOGICAL_ANGLE_DEG = 0.0;
export const MAX_PHYSIOLOGICAL_ANGLE_DEG = 360.0;
export const KNEE_FLEXION_MIN_DEG = 0.0;
export const KNEE_FLEXION_MAX_DEG = 165.0; // Escursione fisiologica flesso-estensione ginocchio

/** Limiti temporali (ms / s) */
export const MIN_PHYSIOLOGICAL_TIME_MS = 0.0;
export const MAX_PHYSIOLOGICAL_TIME_MS = 86400000.0; // 24 ore in millisecondi
export const MIN_PHYSIOLOGICAL_TIME_SEC = 0.0;
export const MAX_PHYSIOLOGICAL_TIME_SEC = 86400.0; // 24 ore in secondi

// ============================================================================
// TIPI E STRUTTURE DEL RISULTATO DI VALIDAZIONE (BOUNDARY-PATH)
// ============================================================================

export type MetrologyErrorCode =
  | 'NON_FINITE'
  | 'BELOW_MIN'
  | 'ABOVE_MAX'
  | 'ZERO_DIVISION_RISK';

export interface ValidationSuccess<T> {
  readonly isValid: true;
  readonly value: T;
}

export interface ValidationFailure<T> {
  readonly isValid: false;
  readonly fallback: T;
  readonly errorCode: MetrologyErrorCode;
  readonly rawValue: unknown;
  readonly message: string;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure<T>;

export interface NumericValidationOptions {
  readonly allowNegative?: boolean;
  readonly customMin?: number;
  readonly customMax?: number;
}

// ============================================================================
// SEZIONE 1: FUNZIONI HOT-PATH (NON-ALLOCANTI, PER STREAMING BLE 60-120 FPS)
// ============================================================================

/**
 * Sanitizza un valore generico garantendo un numero finito sicuro IEEE 754.
 * Gestisce conversioni da stringhe con virgola (formato europeo continentale "102,5"),
 * intercetta e normalizza il -0 in +0, rigetta stringhe vuote, null, undefined e booleani verso il fallback.
 *
 * @param val Valore grezzo in ingresso (numero, stringa, null, undefined)
 * @param fallback Valore numerico di recupero sicuro in caso di valore non valido (default: 0)
 * @returns Valore numerico finito garantito (mai NaN, mai Infinity)
 */
export function sanitizeNumeric(val: unknown, fallback = 0): number {
  if (val === null || val === undefined || typeof val === 'boolean') {
    return fallback;
  }

  if (typeof val === 'number') {
    if (!Number.isFinite(val)) {
      return fallback;
    }
    return val === 0 ? 0 : val;
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.length === 0) {
      return fallback;
    }
    const normalizedString = trimmed.replace(',', '.');
    const parsed = Number(normalizedString);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return parsed === 0 ? 0 : parsed;
  }

  return fallback;
}

/**
 * Esegue una divisione sicura tra due numeri applicando la guardia epsilon contro la divisione per zero.
 * Previene tassativamente la produzione di Infinity, -Infinity o NaN.
 *
 * @param numerator Numeratore
 * @param denominator Denominatore
 * @param fallback Valore di recupero in caso di denominatore non valido o quasi-zero (default: 0)
 * @returns Risultato della divisione o fallback
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return fallback;
  }
  if (Math.abs(denominator) <= EPSILON_DIVISION_GUARD) {
    return fallback;
  }
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : fallback;
}

/**
 * Limita un valore numerico entro l'intervallo chiuso specificato [min, max].
 * Se il valore non e finito, restituisce min.
 *
 * @param val Valore numerico da limitare
 * @param min Limite inferiore consentito
 * @param max Limite superiore consentito
 * @returns Valore compreso tra min e max
 */
export function clampToRange(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) {
    return min;
  }
  if (val < min) {
    return min;
  }
  if (val > max) {
    return max;
  }
  return val === 0 ? 0 : val;
}

// ============================================================================
// SEZIONE 2: VALIDATORI FUNZIONALI PURI (BOUNDARY-PATH / CONTRATTI DI DOMINIO)
// ============================================================================

/**
 * Valida un valore di Carico / Massa in chilogrammi (kg).
 *
 * @param val Valore grezzo in ingresso
 * @param fallback Valore di ripiego (default: 0 kg)
 * @param options Opzioni per limiti customizzati
 * @returns ValidationResult contenente il valore tipizzato Kilograms
 */
export function validateLoadKg(
  val: unknown,
  fallback = asKilograms(0),
  options?: NumericValidationOptions
): ValidationResult<Kilograms> {
  const sanitized = sanitizeNumeric(val, NaN);
  const min = options?.customMin ?? MIN_PHYSIOLOGICAL_LOAD_KG;
  const max = options?.customMax ?? MAX_PHYSIOLOGICAL_LOAD_KG;

  if (!Number.isFinite(sanitized)) {
    return {
      isValid: false,
      fallback,
      errorCode: 'NON_FINITE',
      rawValue: val,
      message: `Carico non numerico o non finito: ${String(val)}`,
    };
  }

  if (sanitized < min) {
    return {
      isValid: false,
      fallback,
      errorCode: 'BELOW_MIN',
      rawValue: val,
      message: `Carico (${sanitized} kg) inferiore al limite consentito (${min} kg)`,
    };
  }

  if (sanitized > max) {
    return {
      isValid: false,
      fallback,
      errorCode: 'ABOVE_MAX',
      rawValue: val,
      message: `Carico (${sanitized} kg) superiore al limite fisiologico (${max} kg)`,
    };
  }

  return {
    isValid: true,
    value: asKilograms(sanitized),
  };
}

/**
 * Valida un valore di Velocita in metri al secondo (m/s).
 * Supporta opzionalmente valori negativi per la fase eccentrica VBT.
 *
 * @param val Valore grezzo in ingresso
 * @param fallback Valore di ripiego (default: 0 m/s)
 * @param options Opzioni (es. allowNegative: true per fase eccentrica)
 * @returns ValidationResult contenente il valore tipizzato MetersPerSecond
 */
export function validateVelocityMps(
  val: unknown,
  fallback = asMetersPerSecond(0),
  options?: NumericValidationOptions
): ValidationResult<MetersPerSecond> {
  const sanitized = sanitizeNumeric(val, NaN);
  const allowNegative = options?.allowNegative ?? false;
  const min = options?.customMin ?? (allowNegative ? MIN_ECCENTRIC_VELOCITY_MPS : MIN_PHYSIOLOGICAL_VELOCITY_MPS);
  const max = options?.customMax ?? MAX_PHYSIOLOGICAL_VELOCITY_MPS;

  if (!Number.isFinite(sanitized)) {
    return {
      isValid: false,
      fallback,
      errorCode: 'NON_FINITE',
      rawValue: val,
      message: `Velocita non numerica o non finita: ${String(val)}`,
    };
  }

  if (sanitized < min) {
    return {
      isValid: false,
      fallback,
      errorCode: 'BELOW_MIN',
      rawValue: val,
      message: `Velocita (${sanitized} m/s) inferiore al limite consentito (${min} m/s)`,
    };
  }

  if (sanitized > max) {
    return {
      isValid: false,
      fallback,
      errorCode: 'ABOVE_MAX',
      rawValue: val,
      message: `Velocita (${sanitized} m/s) superiore al limite fisiologico (${max} m/s)`,
    };
  }

  return {
    isValid: true,
    value: asMetersPerSecond(sanitized < 0 && !allowNegative ? 0 : sanitized),
  };
}

/**
 * Valida un valore di Forza in Newton (N).
 * Supporta opzionalmente valori negativi per forze di taglio orizzontali su pedane biassiali/triassiali.
 *
 * @param val Valore grezzo in ingresso
 * @param fallback Valore di ripiego (default: 0 N)
 * @param options Opzioni (allowNegative: true per forze orizzontali Fx/Fy)
 * @returns ValidationResult contenente il valore tipizzato Newtons
 */
export function validateForceN(
  val: unknown,
  fallback = asNewtons(0),
  options?: NumericValidationOptions
): ValidationResult<Newtons> {
  const sanitized = sanitizeNumeric(val, NaN);
  const allowNegative = options?.allowNegative ?? false;
  const min = options?.customMin ?? (allowNegative ? MIN_SHEAR_FORCE_N : MIN_PHYSIOLOGICAL_FORCE_N);
  const max = options?.customMax ?? MAX_PHYSIOLOGICAL_FORCE_N;

  if (!Number.isFinite(sanitized)) {
    return {
      isValid: false,
      fallback,
      errorCode: 'NON_FINITE',
      rawValue: val,
      message: `Forza non numerica o non finita: ${String(val)}`,
    };
  }

  if (sanitized < min) {
    return {
      isValid: false,
      fallback,
      errorCode: 'BELOW_MIN',
      rawValue: val,
      message: `Forza (${sanitized} N) inferiore al limite consentito (${min} N)`,
    };
  }

  if (sanitized > max) {
    return {
      isValid: false,
      fallback,
      errorCode: 'ABOVE_MAX',
      rawValue: val,
      message: `Forza (${sanitized} N) superiore al limite fisiologico (${max} N)`,
    };
  }

  return {
    isValid: true,
    value: asNewtons(sanitized),
  };
}

/**
 * Valida un valore di Potenza in Watt (W).
 *
 * @param val Valore grezzo in ingresso
 * @param fallback Valore di ripiego (default: 0 W)
 * @param options Opzioni per limiti customizzati
 * @returns ValidationResult contenente il valore tipizzato Watts
 */
export function validatePowerW(
  val: unknown,
  fallback = asWatts(0),
  options?: NumericValidationOptions
): ValidationResult<Watts> {
  const sanitized = sanitizeNumeric(val, NaN);
  const min = options?.customMin ?? MIN_PHYSIOLOGICAL_POWER_W;
  const max = options?.customMax ?? MAX_PHYSIOLOGICAL_POWER_W;

  if (!Number.isFinite(sanitized)) {
    return {
      isValid: false,
      fallback,
      errorCode: 'NON_FINITE',
      rawValue: val,
      message: `Potenza non numerica o non finita: ${String(val)}`,
    };
  }

  if (sanitized < min) {
    return {
      isValid: false,
      fallback,
      errorCode: 'BELOW_MIN',
      rawValue: val,
      message: `Potenza (${sanitized} W) inferiore al limite consentito (${min} W)`,
    };
  }

  if (sanitized > max) {
    return {
      isValid: false,
      fallback,
      errorCode: 'ABOVE_MAX',
      rawValue: val,
      message: `Potenza (${sanitized} W) superiore al limite fisiologico (${max} W)`,
    };
  }

  return {
    isValid: true,
    value: asWatts(sanitized),
  };
}

/**
 * Valida un angolo articolare in gradi sessagesimali (°).
 *
 * @param val Valore grezzo in ingresso
 * @param fallback Valore di ripiego (default: 0°)
 * @param options Opzioni con min/max custom (es. flesso-estensione ginocchio 0-165°)
 * @returns ValidationResult contenente il valore tipizzato Degrees
 */
export function validateAngleDeg(
  val: unknown,
  fallback = asDegrees(0),
  options?: NumericValidationOptions
): ValidationResult<Degrees> {
  const sanitized = sanitizeNumeric(val, NaN);
  const min = options?.customMin ?? MIN_PHYSIOLOGICAL_ANGLE_DEG;
  const max = options?.customMax ?? MAX_PHYSIOLOGICAL_ANGLE_DEG;

  if (!Number.isFinite(sanitized)) {
    return {
      isValid: false,
      fallback,
      errorCode: 'NON_FINITE',
      rawValue: val,
      message: `Angolo non numerico o non finito: ${String(val)}`,
    };
  }

  if (sanitized < min) {
    return {
      isValid: false,
      fallback,
      errorCode: 'BELOW_MIN',
      rawValue: val,
      message: `Angolo (${sanitized}°) inferiore al limite articolare (${min}°)`,
    };
  }

  if (sanitized > max) {
    return {
      isValid: false,
      fallback,
      errorCode: 'ABOVE_MAX',
      rawValue: val,
      message: `Angolo (${sanitized}°) superiore al limite articolare (${max}°)`,
    };
  }

  return {
    isValid: true,
    value: asDegrees(sanitized),
  };
}

/**
 * Valida un intervallo di tempo in millisecondi (ms).
 *
 * @param val Valore grezzo in ingresso
 * @param fallback Valore di ripiego (default: 0 ms)
 * @param options Opzioni per limiti customizzati
 * @returns ValidationResult contenente il valore tipizzato Milliseconds
 */
export function validateTimeMs(
  val: unknown,
  fallback = asMilliseconds(0),
  options?: NumericValidationOptions
): ValidationResult<Milliseconds> {
  const sanitized = sanitizeNumeric(val, NaN);
  const min = options?.customMin ?? MIN_PHYSIOLOGICAL_TIME_MS;
  const max = options?.customMax ?? MAX_PHYSIOLOGICAL_TIME_MS;

  if (!Number.isFinite(sanitized)) {
    return {
      isValid: false,
      fallback,
      errorCode: 'NON_FINITE',
      rawValue: val,
      message: `Tempo in ms non numerico o non finito: ${String(val)}`,
    };
  }

  if (sanitized < min) {
    return {
      isValid: false,
      fallback,
      errorCode: 'BELOW_MIN',
      rawValue: val,
      message: `Tempo (${sanitized} ms) negativo o inferiore al minimo (${min} ms)`,
    };
  }

  if (sanitized > max) {
    return {
      isValid: false,
      fallback,
      errorCode: 'ABOVE_MAX',
      rawValue: val,
      message: `Tempo (${sanitized} ms) superiore al massimo consentito (${max} ms)`,
    };
  }

  return {
    isValid: true,
    value: asMilliseconds(sanitized),
  };
}

/**
 * Valida un intervallo di tempo in secondi (s).
 *
 * @param val Valore grezzo in ingresso
 * @param fallback Valore di ripiego (default: 0 s)
 * @param options Opzioni per limiti customizzati
 * @returns ValidationResult contenente il valore tipizzato Seconds
 */
export function validateTimeSec(
  val: unknown,
  fallback = asSeconds(0),
  options?: NumericValidationOptions
): ValidationResult<Seconds> {
  const sanitized = sanitizeNumeric(val, NaN);
  const min = options?.customMin ?? MIN_PHYSIOLOGICAL_TIME_SEC;
  const max = options?.customMax ?? MAX_PHYSIOLOGICAL_TIME_SEC;

  if (!Number.isFinite(sanitized)) {
    return {
      isValid: false,
      fallback,
      errorCode: 'NON_FINITE',
      rawValue: val,
      message: `Tempo in secondi non numerico o non finito: ${String(val)}`,
    };
  }

  if (sanitized < min) {
    return {
      isValid: false,
      fallback,
      errorCode: 'BELOW_MIN',
      rawValue: val,
      message: `Tempo (${sanitized} s) negativo o inferiore al minimo (${min} s)`,
    };
  }

  if (sanitized > max) {
    return {
      isValid: false,
      fallback,
      errorCode: 'ABOVE_MAX',
      rawValue: val,
      message: `Tempo (${sanitized} s) superiore al massimo consentito (${max} s)`,
    };
  }

  return {
    isValid: true,
    value: asSeconds(sanitized),
  };
}
