/**
 * src/utils/number-format.ts
 * Formattazione numerica ergonomica e tipografia SI per cockpit ad alto contrasto.
 * Conforme ad ADR-01 (Thin Client), ADR-03 (Rigore Metrologico SI), ISO 80000-1 e Regola 02.
 *
 * Include:
 * - Singleton statici Intl.NumberFormat per azzerare il Garbage Collection overhead in streaming.
 * - Notazione SI con spazio sottile non interrompibile (\u202F Narrow No-Break Space).
 * - Separazione semantica DOM per prevenire il jittering nei layout a 60-120 fps.
 */

import { sanitizeNumeric } from './metrology-guard';

// ============================================================================
// COSTANTI TIPOGRAFICHE, PRECISIONI SI & PLACEHOLDER STANDARD (ZERO MAGIC NUMBERS)
// ============================================================================

/** Locale italiano standard per formattazione numerica con virgola decimale */
export const LOCALE_IT = 'it-IT';

/** Limiti di precisione decimale supportati dalla cache Intl.NumberFormat */
export const MIN_FORMAT_DECIMALS = 0;
export const MAX_FORMAT_DECIMALS = 6;

const DECIMAL_BASE = 10;
const HALF_ROUNDING_THRESHOLD = 0.5;
const NEGATIVE_ZERO_TEXT_REGEX = /^-0+(?:,0+)?$/;

/** Precisioni decimali standard per ciascuna grandezza SI */
const DECIMALS_FORCE_N = 0;
const DECIMALS_POWER_W = 0;
const DECIMALS_VELOCITY_MPS = 2;
const DECIMALS_LOAD_KG = 1;
const DECIMALS_ANGLE_DEG = 0;
const DECIMALS_TIME_MS = 0;
const DECIMALS_TIME_SEC = 2;
const DECIMALS_HEART_RATE_BPM = 0;
const DECIMALS_HRV_RMSSD_MS = 0;

/** Simboli ufficiali SI e fisiologici */
const UNIT_NEWTONS = 'N';
const UNIT_WATTS = 'W';
const UNIT_VELOCITY_MPS = 'm/s';
const UNIT_KILOGRAMS = 'kg';
const UNIT_DEGREES = '°';
const UNIT_MILLISECONDS = 'ms';
const UNIT_SECONDS = 's';
const UNIT_BPM = 'bpm';

/** Spazio sottile non interrompibile raccomandato da ISO 80000-1 e BIPM SI Brochure */
export const NARROW_NO_BREAK_SPACE = '\u202F';

/** Placeholder per valore assente o in attesa di calcolo */
export const PLACEHOLDER_EMPTY_DASH = '--';

/** Placeholder per metrica non applicabile al contesto */
export const PLACEHOLDER_NOT_AVAILABLE = 'N/D';

/** Placeholder per sensore in fase di calibrazione/tara */
export const PLACEHOLDER_CALIBRATING = 'CALIBRATING';

// ============================================================================
// SINGLETON STATICI INTL.NUMBERFORMAT (ZERO ALLOCAZIONI RUNTIME A 120 FPS)
// ============================================================================

/**
 * Crea un formattatore Intl.NumberFormat con precisione fissa per il locale italiano.
 * @param fractionDigits Numero esatto di cifre decimali richieste
 * @returns Istanza Intl.NumberFormat configurata
 */
function createFixedItFormatter(fractionDigits: number): Intl.NumberFormat {
  return new Intl.NumberFormat(LOCALE_IT, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export const FORMATTER_DECIMAL_0 = createFixedItFormatter(0);
export const FORMATTER_DECIMAL_1 = createFixedItFormatter(1);
export const FORMATTER_DECIMAL_2 = createFixedItFormatter(2);
export const FORMATTER_DECIMAL_3 = createFixedItFormatter(3);

const FORMATTER_CACHE: readonly Intl.NumberFormat[] = Object.freeze([
  FORMATTER_DECIMAL_0,
  FORMATTER_DECIMAL_1,
  FORMATTER_DECIMAL_2,
  FORMATTER_DECIMAL_3,
  ...Array.from(
    { length: MAX_FORMAT_DECIMALS - 3 },
    (_, offset) => createFixedItFormatter(offset + 4)
  ),
]);

// ============================================================================
// STRUTTURE DATI DI RENDERING DOM (ANTI-JITTERING)
// ============================================================================

export interface MetricDisplayData {
  readonly valueText: string;
  readonly unitText: string;
  readonly isPlaceholder: boolean;
}

// ============================================================================
// HELPER INTERNO DI FORMATTAZIONE SI
// ============================================================================

/**
 * Formatta una grandezza fisica con separatore SI, gestendo null/non-finiti e valori negativi vietati.
 *
 * @param val Valore numerico grezzo
 * @param decimals Precisione decimale desiderata
 * @param unit Simbolo unita di misura SI
 * @param allowNegative Se false, valori < 0 restituiscono il placeholder con unita
 * @returns Stringa formattata completa di unita o placeholder
 */
function formatSiQuantity(
  val: number | null | undefined,
  decimals: number,
  unit: string,
  allowNegative: boolean
): string {
  if (val === null || val === undefined || !Number.isFinite(val) || (!allowNegative && val < 0)) {
    return `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}${unit}`;
  }
  return `${formatNumericValue(val, decimals)}${NARROW_NO_BREAK_SPACE}${unit}`;
}

// ============================================================================
// FORMATTATORI SCALARI PURI
// ============================================================================

/**
 * Formatta un valore numerico scalare puro secondo la precisione decimale specificata [0, MAX_FORMAT_DECIMALS].
 * Normalizza i valori prossimi allo zero negativo (es. -0,001) a +0 per evitare la stampa di "-0,00".
 * Restituisce il placeholder se il valore e nullo, indefinito o non finito.
 *
 * @param val Valore numerico (o nullo/indefinito)
 * @param decimals Numero di cifre decimali (limitato in [0, MAX_FORMAT_DECIMALS])
 * @param placeholder Stringa di fallback se non valido (default: '--')
 * @returns Stringa formattata in locale it-IT (es. "102,5", "0,82", "--")
 */
export function formatNumericValue(
  val: number | null | undefined,
  decimals = MIN_FORMAT_DECIMALS,
  placeholder = PLACEHOLDER_EMPTY_DASH
): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return placeholder;
  }

  const safeDecimals = Number.isFinite(decimals)
    ? Math.min(MAX_FORMAT_DECIMALS, Math.max(MIN_FORMAT_DECIMALS, Math.trunc(decimals)))
    : MIN_FORMAT_DECIMALS;

  const safeVal = sanitizeNumeric(val, 0);
  // Azzera valori negativi sotto la soglia di meta passo decimale per impedire "-0" o "-0,00"
  const zeroThreshold = HALF_ROUNDING_THRESHOLD / Math.pow(DECIMAL_BASE, safeDecimals);
  const normalizedVal = safeVal === 0 || Math.abs(safeVal) < zeroThreshold ? 0 : safeVal;

  const formatter = FORMATTER_CACHE[safeDecimals] ?? FORMATTER_DECIMAL_0;
  const formatted = formatter.format(normalizedVal);

  if (normalizedVal < 0 && NEGATIVE_ZERO_TEXT_REGEX.test(formatted)) {
    return formatted.slice(1);
  }
  return formatted;
}

// ============================================================================
// FORMATTATORI COMPLETI CON UNITA DI MISURA SISTEMA INTERNAZIONALE
// ============================================================================

/**
 * Formatta un valore di Forza in Newton (N) con precisione intera costante (0 decimali)
 * per azzerare il jitter tipografico durante streaming a 60-120 fps.
 * Supporta valori negativi per forze di taglio orizzontali.
 * Nota it-IT: i valori a 4 cifre (es. 2450) non usano separatore migliaia ("2450\u202FN"),
 * mentre da 5 cifre usano il punto ("12.450\u202FN").
 *
 * @param n Valore della forza in Newton
 * @returns Stringa con unita (es. "2450\u202FN" o "--\u202FN")
 */
export function formatForce(n: number | null | undefined): string {
  return formatSiQuantity(n, DECIMALS_FORCE_N, UNIT_NEWTONS, true);
}

/**
 * Formatta un valore di Potenza in Watt (W) con precisione intera (0 decimali).
 * Valori negativi, nulli o non finiti restituiscono il placeholder "--\u202FW".
 *
 * @param w Valore della potenza in Watt (atteso >= 0)
 * @returns Stringa con unita (es. "1250\u202FW" o "--\u202FW")
 */
export function formatPower(w: number | null | undefined): string {
  return formatSiQuantity(w, DECIMALS_POWER_W, UNIT_WATTS, false);
}

/**
 * Formatta un valore di Velocita in metri al secondo (m/s).
 * Tassativamente 2 decimali per sensibilita VBT (supporta fase eccentrica negativa).
 *
 * @param v Valore della velocita in m/s
 * @returns Stringa con unita (es. "0,82\u202Fm/s" o "--\u202Fm/s")
 */
export function formatVelocity(v: number | null | undefined): string {
  return formatSiQuantity(v, DECIMALS_VELOCITY_MPS, UNIT_VELOCITY_MPS, true);
}

/**
 * Formatta un valore di Carico / Massa in chilogrammi (kg) con 1 decimale.
 * Valori negativi, nulli o non finiti restituiscono il placeholder "--\u202Fkg".
 *
 * @param kg Valore del carico in kg (atteso >= 0)
 * @returns Stringa con unita (es. "102,5\u202Fkg" o "--\u202Fkg")
 */
export function formatLoad(kg: number | null | undefined): string {
  return formatSiQuantity(kg, DECIMALS_LOAD_KG, UNIT_KILOGRAMS, false);
}

/**
 * Formatta un angolo articolare in gradi sessagesimali (°).
 * Nessuno spazio tra valore e simbolo del grado (es. "85°").
 *
 * @param deg Angolo in gradi
 * @param precision Cifre decimali (default: 0 per ROM, 1 per pose estimation)
 * @returns Stringa con grado (es. "85°" o "--°")
 */
export function formatAngle(deg: number | null | undefined, precision = DECIMALS_ANGLE_DEG): string {
  if (deg === null || deg === undefined || !Number.isFinite(deg)) {
    return `${PLACEHOLDER_EMPTY_DASH}${UNIT_DEGREES}`;
  }
  return `${formatNumericValue(deg, precision)}${UNIT_DEGREES}`;
}

/**
 * Formatta un tempo in millisecondi (ms) per tempi di contatto, volo o PVT.
 * Valori negativi, nulli o non finiti restituiscono il placeholder "--\u202Fms".
 *
 * @param ms Tempo in millisecondi (atteso >= 0)
 * @returns Stringa con unita (es. "245\u202Fms" o "--\u202Fms")
 */
export function formatTimeMs(ms: number | null | undefined): string {
  return formatSiQuantity(ms, DECIMALS_TIME_MS, UNIT_MILLISECONDS, false);
}

/**
 * Formatta un tempo in secondi (s) per sprint e cronometraggi.
 * Valori negativi, nulli o non finiti restituiscono il placeholder "--\u202Fs".
 *
 * @param s Tempo in secondi (atteso >= 0)
 * @param precision Cifre decimali (default: 2)
 * @returns Stringa con unita (es. "4,28\u202Fs" o "--\u202Fs")
 */
export function formatTimeSec(s: number | null | undefined, precision = DECIMALS_TIME_SEC): string {
  return formatSiQuantity(s, precision, UNIT_SECONDS, false);
}

/**
 * Formatta la Frequenza Cardiaca in battiti al minuto (bpm).
 * Valori negativi, nulli o non finiti restituiscono il placeholder "--\u202Fbpm".
 *
 * @param bpm Frequenza cardiaca (attesa >= 0)
 * @returns Stringa con unita (es. "162\u202Fbpm" o "--\u202Fbpm")
 */
export function formatHeartRate(bpm: number | null | undefined): string {
  return formatSiQuantity(bpm, DECIMALS_HEART_RATE_BPM, UNIT_BPM, false);
}

/**
 * Formatta la variabilita cardiaca HRV rMSSD in millisecondi (ms).
 * Valori negativi, nulli o non finiti restituiscono il placeholder "--\u202Fms".
 *
 * @param hrv Valore rMSSD in ms (atteso >= 0)
 * @returns Stringa con unita (es. "64\u202Fms" o "--\u202Fms")
 */
export function formatHrvRmssd(hrv: number | null | undefined): string {
  return formatSiQuantity(hrv, DECIMALS_HRV_RMSSD_MS, UNIT_MILLISECONDS, false);
}

// ============================================================================
// FORMATTATORE SEMANTICO DOM PER REACT (ANTI-JITTERING)
// ============================================================================

/**
 * Formatta una metrica separando valore ed etichetta per consentire il rendering
 * in elementi HTML distinti (<span class="value"> e <span class="unit">),
 * prevenendo lo scorrimento orizzontale o il layout shift durante streaming ad alto framerate.
 *
 * @param val Valore numerico
 * @param unit Unita di misura (es. 'N', 'W', 'm/s', 'kg', '°')
 * @param decimals Precisione decimale (default: 0)
 * @returns MetricDisplayData con valore, unita e flag placeholder
 */
export function formatMetricWithUnit(
  val: number | null | undefined,
  unit: string,
  decimals = MIN_FORMAT_DECIMALS
): MetricDisplayData {
  const isPlaceholder = val === null || val === undefined || !Number.isFinite(val);
  const valueText = formatNumericValue(val, decimals, PLACEHOLDER_EMPTY_DASH);
  return {
    valueText,
    unitText: unit,
    isPlaceholder,
  };
}
