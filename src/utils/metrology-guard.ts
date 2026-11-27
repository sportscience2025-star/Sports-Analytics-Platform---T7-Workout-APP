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
  MIN_ECCENTRIC_VELOCITY_MPS as PHYSICS_MIN_ECCENTRIC_VELOCITY_MPS,
} from '../types/physics';

// ============================================================================
// COSTANTI METROLOGICHE & LIMITI FISIOLOGICI DOCUMENTATI (ZERO MAGIC NUMBERS)
// ============================================================================

/** Epsilon per prevenzione divisioni per zero ed indeterminazioni IEEE 754 */
export const EPSILON_DIVISION_GUARD = 1e-7;

/** Limiti fisiologici Carico / Massa (kg) */
export const MIN_PHYSIOLOGICAL_LOAD_KG = MIN_VALID_LOAD_KG;
export const MAX_PHYSIOLOGICAL_LOAD_KG = MAX_VALID_LOAD_KG;
export const DEFAULT_MIN_LOAD_KG = MIN_PHYSIOLOGICAL_LOAD_KG;
export const DEFAULT_MAX_LOAD_KG = MAX_PHYSIOLOGICAL_LOAD_KG;

/** Limiti fisiologici Velocita (m/s) */
export const MIN_PHYSIOLOGICAL_VELOCITY_MPS = MIN_VALID_VELOCITY_MPS;
export const MAX_PHYSIOLOGICAL_VELOCITY_MPS = MAX_VALID_VELOCITY_MPS;
export const MIN_ECCENTRIC_VELOCITY_MPS = PHYSICS_MIN_ECCENTRIC_VELOCITY_MPS;

/** Limiti fisiologici Forza (N) */
export const MIN_PHYSIOLOGICAL_FORCE_N = 0.0;
export const MAX_PHYSIOLOGICAL_FORCE_N = 15000.0;
export const MIN_SHEAR_FORCE_N = -5000.0;

/** Limiti fisiologici Potenza (W) */
export const MIN_PHYSIOLOGICAL_POWER_W = 0.0;
export const MAX_PHYSIOLOGICAL_POWER_W = 10000.0;

/** Limiti fisiologici Angoli articolari (Gradi sessagesimali) */
export const MIN_PHYSIOLOGICAL_ANGLE_DEG = 0.0;
export const MAX_PHYSIOLOGICAL_ANGLE_DEG = 360.0;

/** Limiti temporali (ms / s) */
export const MIN_PHYSIOLOGICAL_TIME_MS = 0.0;
export const MAX_PHYSIOLOGICAL_TIME_MS = 86400000.0;
export const MIN_PHYSIOLOGICAL_TIME_SEC = 0.0;
export const MAX_PHYSIOLOGICAL_TIME_SEC = 86400.0;

/** Pattern per rigetto notazioni numeriche non decimali (esadecimale, binario, ottale) */
const NON_DECIMAL_RADIX_REGEX = /^[+-]?0[xbo]/i;

/** Pattern per stringhe numeriche italiane con separatore migliaia '.' e decimale ',' (es. "1.250,5") */
const ITALIAN_GROUPING_COMMA_REGEX = /^[+-]?\d{1,3}(?:\.\d{3})+(?:,\d*)?$/;

/** Pattern per stringhe decimali semplici con virgola europea (es. "102,5") */
const SIMPLE_COMMA_DECIMAL_REGEX = /^[+-]?(?:\d+,\d*|\d*,\d+)$/;

// ============================================================================
// TIPI E STRUTTURE DEL RISULTATO DI VALIDAZIONE (BOUNDARY-PATH)
// ============================================================================

export type MetrologyErrorCode =
  | 'NON_FINITE'
  | 'BELOW_MIN'
  | 'ABOVE_MAX'
  | 'INVALID_BOUNDS';

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

interface BoundedMetricConfig<T extends number> {
  readonly label: string;
  readonly unit: string;
  readonly defaultMin: number;
  readonly defaultMax: number;
  readonly negativeMin?: number;
  readonly hardMin?: number;
  readonly hardMax?: number;
  readonly defaultFallback: T;
  readonly brand: (value: number) => T;
}

// ============================================================================
// HELPER INTERNI CONDIVISI (PARSING STRETTO & VALIDATORE GENERICO)
// ============================================================================

/**
 * Converte un valore grezzo in numero finito normalizzando -0 in +0, oppure restituisce null.
 * Rigetta notazioni non decimali (0x/0b/0o) e gestisce il formato italiano con separatore migliaia e virgola.
 *
 * @param val Valore grezzo in ingresso
 * @returns Numero finito valido oppure null se non convertibile
 */
function parseFiniteNumeric(val: unknown): number | null {
  if (val === null || val === undefined || typeof val === 'boolean') {
    return null;
  }

  if (typeof val === 'number') {
    if (!Number.isFinite(val)) {
      return null;
    }
    return val === 0 ? 0 : val;
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.length === 0 || NON_DECIMAL_RADIX_REGEX.test(trimmed)) {
      return null;
    }

    let normalizedString = trimmed;
    if (trimmed.includes(',')) {
      if (ITALIAN_GROUPING_COMMA_REGEX.test(trimmed)) {
        // Rimuove i punti delle migliaia prima di convertire la virgola decimale
        normalizedString = trimmed.replace(/\./g, '').replace(',', '.');
      } else if (SIMPLE_COMMA_DECIMAL_REGEX.test(trimmed)) {
        normalizedString = trimmed.replace(',', '.');
      } else {
        return null;
      }
    }

    const parsed = Number(normalizedString);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parsed === 0 ? 0 : parsed;
  }

  return null;
}

/**
 * Normalizza il valore di fallback assicurando finitezza e rispetto dei limiti fisici del costruttore.
 *
 * @param fallback Valore di ripiego fornito dal chiamante
 * @param config Configurazione della grandezza fisica target
 * @returns Valore di fallback garantito valido e tipizzato come T
 */
function resolveSafeFallback<T extends number>(fallback: T, config: BoundedMetricConfig<T>): T {
  if (!Number.isFinite(fallback)) {
    return config.defaultFallback;
  }

  const normalized = fallback === 0 ? 0 : fallback;
  if (config.hardMin !== undefined && normalized < config.hardMin) {
    return config.defaultFallback;
  }
  if (config.hardMax !== undefined && normalized > config.hardMax) {
    return config.defaultFallback;
  }

  return config.brand(normalized);
}

/**
 * Validatore generico condiviso per tutte le grandezze metrologiche SI limitate su intervallo [min, max].
 * Verifica opzioni, limiti fisici del costruttore, finitezza e coerenza di allowNegative senza silent clamping.
 *
 * @param val Valore grezzo in ingresso
 * @param fallback Valore di ripiego tipizzato
 * @param options Opzioni opzionali per limiti custom e segno negativo
 * @param config Configurazione metrologica e costruttore branded della grandezza
 * @returns ValidationResult tipizzato con esito positivo o errore strutturato
 */
function validateBoundedMetric<T extends number>(
  val: unknown,
  fallback: T,
  options: NumericValidationOptions | undefined,
  config: BoundedMetricConfig<T>
): ValidationResult<T> {
  const safeFallback = resolveSafeFallback(fallback, config);
  const suffix = config.unit.length > 0 ? ` ${config.unit}` : '';

  if (options?.customMin !== undefined && !Number.isFinite(options.customMin)) {
    return {
      isValid: false,
      fallback: safeFallback,
      errorCode: 'NON_FINITE',
      rawValue: val,
      message: `Limite minimo custom non finito per ${config.label}: ${String(options.customMin)}`,
    };
  }

  if (options?.customMax !== undefined && !Number.isFinite(options.customMax)) {
    return {
      isValid: false,
      fallback: safeFallback,
      errorCode: 'NON_FINITE',
      rawValue: val,
      message: `Limite massimo custom non finito per ${config.label}: ${String(options.customMax)}`,
    };
  }

  const allowNegative = options?.allowNegative ?? false;
  const baseMin = allowNegative && config.negativeMin !== undefined ? config.negativeMin : config.defaultMin;

  let effectiveMin = options?.customMin ?? baseMin;
  // Impedisce valori negativi se allowNegative e disabilitato anche in presenza di customMin < 0
  if (!allowNegative && effectiveMin < 0) {
    effectiveMin = 0;
  }
  // Applica il pavimento fisico del tipo branded per prevenire TypeError dai costruttori
  if (config.hardMin !== undefined && effectiveMin < config.hardMin) {
    effectiveMin = config.hardMin;
  }

  let effectiveMax = options?.customMax ?? config.defaultMax;
  if (config.hardMax !== undefined && effectiveMax > config.hardMax) {
    effectiveMax = config.hardMax;
  }

  if (effectiveMin > effectiveMax) {
    return {
      isValid: false,
      fallback: safeFallback,
      errorCode: 'INVALID_BOUNDS',
      rawValue: val,
      message: `Intervallo non valido per ${config.label}: min (${effectiveMin}${suffix}) > max (${effectiveMax}${suffix})`,
    };
  }

  const sanitized = parseFiniteNumeric(val);
  if (sanitized === null) {
    return {
      isValid: false,
      fallback: safeFallback,
      errorCode: 'NON_FINITE',
      rawValue: val,
      message: `${config.label} non numerico o non finito: ${String(val)}`,
    };
  }

  if (sanitized < effectiveMin) {
    return {
      isValid: false,
      fallback: safeFallback,
      errorCode: 'BELOW_MIN',
      rawValue: val,
      message: `${config.label} (${sanitized}${suffix}) inferiore al limite consentito (${effectiveMin}${suffix})`,
    };
  }

  if (sanitized > effectiveMax) {
    return {
      isValid: false,
      fallback: safeFallback,
      errorCode: 'ABOVE_MAX',
      rawValue: val,
      message: `${config.label} (${sanitized}${suffix}) superiore al limite fisiologico (${effectiveMax}${suffix})`,
    };
  }

  return {
    isValid: true,
    value: config.brand(sanitized),
  };
}

// ============================================================================
// CONFIGURAZIONI DOMINIO SI (ALLOCATE UNA SOLA VOLTA A MODULE LOAD)
// ============================================================================

const LOAD_KG_CONFIG: BoundedMetricConfig<Kilograms> = {
  label: 'Carico',
  unit: 'kg',
  defaultMin: MIN_PHYSIOLOGICAL_LOAD_KG,
  defaultMax: MAX_PHYSIOLOGICAL_LOAD_KG,
  hardMin: MIN_VALID_LOAD_KG,
  hardMax: MAX_VALID_LOAD_KG,
  defaultFallback: asKilograms(0),
  brand: asKilograms,
};

const VELOCITY_MPS_CONFIG: BoundedMetricConfig<MetersPerSecond> = {
  label: 'Velocita',
  unit: 'm/s',
  defaultMin: MIN_PHYSIOLOGICAL_VELOCITY_MPS,
  defaultMax: MAX_PHYSIOLOGICAL_VELOCITY_MPS,
  negativeMin: MIN_ECCENTRIC_VELOCITY_MPS,
  hardMin: MIN_ECCENTRIC_VELOCITY_MPS,
  hardMax: MAX_VALID_VELOCITY_MPS,
  defaultFallback: asMetersPerSecond(0),
  brand: asMetersPerSecond,
};

const FORCE_N_CONFIG: BoundedMetricConfig<Newtons> = {
  label: 'Forza',
  unit: 'N',
  defaultMin: MIN_PHYSIOLOGICAL_FORCE_N,
  defaultMax: MAX_PHYSIOLOGICAL_FORCE_N,
  negativeMin: MIN_SHEAR_FORCE_N,
  defaultFallback: asNewtons(0),
  brand: asNewtons,
};

const POWER_W_CONFIG: BoundedMetricConfig<Watts> = {
  label: 'Potenza',
  unit: 'W',
  defaultMin: MIN_PHYSIOLOGICAL_POWER_W,
  defaultMax: MAX_PHYSIOLOGICAL_POWER_W,
  defaultFallback: asWatts(0),
  brand: asWatts,
};

const ANGLE_DEG_CONFIG: BoundedMetricConfig<Degrees> = {
  label: 'Angolo',
  unit: '°',
  defaultMin: MIN_PHYSIOLOGICAL_ANGLE_DEG,
  defaultMax: MAX_PHYSIOLOGICAL_ANGLE_DEG,
  defaultFallback: asDegrees(0),
  brand: asDegrees,
};

const TIME_MS_CONFIG: BoundedMetricConfig<Milliseconds> = {
  label: 'Tempo',
  unit: 'ms',
  defaultMin: MIN_PHYSIOLOGICAL_TIME_MS,
  defaultMax: MAX_PHYSIOLOGICAL_TIME_MS,
  hardMin: 0,
  defaultFallback: asMilliseconds(0),
  brand: asMilliseconds,
};

const TIME_SEC_CONFIG: BoundedMetricConfig<Seconds> = {
  label: 'Tempo',
  unit: 's',
  defaultMin: MIN_PHYSIOLOGICAL_TIME_SEC,
  defaultMax: MAX_PHYSIOLOGICAL_TIME_SEC,
  hardMin: 0,
  defaultFallback: asSeconds(0),
  brand: asSeconds,
};

// ============================================================================
// SEZIONE 1: FUNZIONI HOT-PATH (NON-ALLOCANTI, PER STREAMING BLE 60-120 FPS)
// ============================================================================

/**
 * Sanitizza un valore generico garantendo un numero finito sicuro IEEE 754.
 * Gestisce conversioni da stringhe con virgola (es. "102,5" e "1.250,5"), normalizza -0 in +0,
 * rigetta stringhe 0x/0b/0o, vuote, null, undefined e booleani verso il fallback sicuro.
 *
 * @param val Valore grezzo in ingresso (numero, stringa, null, undefined)
 * @param fallback Valore numerico di recupero sicuro in caso di valore non valido (default: 0)
 * @returns Valore numerico finito garantito (mai NaN, mai Infinity, mai -0)
 */
export function sanitizeNumeric(val: unknown, fallback = 0): number {
  const safeFallback = typeof fallback === 'number' && Number.isFinite(fallback)
    ? (fallback === 0 ? 0 : fallback)
    : 0;
  const parsed = parseFiniteNumeric(val);
  return parsed === null ? safeFallback : parsed;
}

/**
 * Esegue una divisione sicura tra due numeri applicando la guardia epsilon contro la divisione per zero.
 * Previene tassativamente Infinity, -Infinity, NaN e normalizza -0 in +0.
 *
 * @param numerator Numeratore
 * @param denominator Denominatore
 * @param fallback Valore di recupero in caso di denominatore non valido o quasi-zero (default: 0)
 * @returns Risultato della divisione normalizzato oppure fallback finito
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  const safeFallback = Number.isFinite(fallback) ? (fallback === 0 ? 0 : fallback) : 0;
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return safeFallback;
  }
  if (Math.abs(denominator) <= EPSILON_DIVISION_GUARD) {
    return safeFallback;
  }
  const result = numerator / denominator;
  if (!Number.isFinite(result)) {
    return safeFallback;
  }
  return result === 0 ? 0 : result;
}

/**
 * Limita un valore numerico entro l'intervallo chiuso specificato [min, max].
 * Gestisce limiti invertiti (min > max), limiti non finiti e normalizza -0 in +0.
 *
 * @param val Valore numerico da limitare
 * @param min Limite inferiore consentito
 * @param max Limite superiore consentito
 * @returns Valore finito compreso nell'intervallo sicuro
 */
export function clampToRange(val: number, min: number, max: number): number {
  const minFinite = Number.isFinite(min);
  const maxFinite = Number.isFinite(max);

  if (!minFinite && !maxFinite) {
    return Number.isFinite(val) ? (val === 0 ? 0 : val) : 0;
  }

  if (!minFinite) {
    const safeMax = max === 0 ? 0 : max;
    if (!Number.isFinite(val) || val > safeMax) {
      return safeMax;
    }
    return val === 0 ? 0 : val;
  }

  if (!maxFinite) {
    const safeMin = min === 0 ? 0 : min;
    if (!Number.isFinite(val) || val < safeMin) {
      return safeMin;
    }
    return val === 0 ? 0 : val;
  }

  const effectiveMin = min <= max ? min : max;
  const effectiveMax = min <= max ? max : min;

  if (!Number.isFinite(val) || val < effectiveMin) {
    return effectiveMin === 0 ? 0 : effectiveMin;
  }
  if (val > effectiveMax) {
    return effectiveMax === 0 ? 0 : effectiveMax;
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
  fallback = LOAD_KG_CONFIG.defaultFallback,
  options?: NumericValidationOptions
): ValidationResult<Kilograms> {
  return validateBoundedMetric(val, fallback, options, LOAD_KG_CONFIG);
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
  fallback = VELOCITY_MPS_CONFIG.defaultFallback,
  options?: NumericValidationOptions
): ValidationResult<MetersPerSecond> {
  return validateBoundedMetric(val, fallback, options, VELOCITY_MPS_CONFIG);
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
  fallback = FORCE_N_CONFIG.defaultFallback,
  options?: NumericValidationOptions
): ValidationResult<Newtons> {
  return validateBoundedMetric(val, fallback, options, FORCE_N_CONFIG);
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
  fallback = POWER_W_CONFIG.defaultFallback,
  options?: NumericValidationOptions
): ValidationResult<Watts> {
  return validateBoundedMetric(val, fallback, options, POWER_W_CONFIG);
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
  fallback = ANGLE_DEG_CONFIG.defaultFallback,
  options?: NumericValidationOptions
): ValidationResult<Degrees> {
  return validateBoundedMetric(val, fallback, options, ANGLE_DEG_CONFIG);
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
  fallback = TIME_MS_CONFIG.defaultFallback,
  options?: NumericValidationOptions
): ValidationResult<Milliseconds> {
  return validateBoundedMetric(val, fallback, options, TIME_MS_CONFIG);
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
  fallback = TIME_SEC_CONFIG.defaultFallback,
  options?: NumericValidationOptions
): ValidationResult<Seconds> {
  return validateBoundedMetric(val, fallback, options, TIME_SEC_CONFIG);
}
