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
// COSTANTI TIPOGRAFICHE & PLACEHOLDER STANDARD (ZERO MAGIC STRINGS)
// ============================================================================

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

export const FORMATTER_DECIMAL_0 = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const FORMATTER_DECIMAL_1 = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const FORMATTER_DECIMAL_2 = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const FORMATTER_DECIMAL_3 = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

// ============================================================================
// STRUTTURE DATI DI RENDERING DOM (ANTI-JITTERING)
// ============================================================================

export interface MetricDisplayData {
  readonly valueText: string;
  readonly unitText: string;
  readonly isPlaceholder: boolean;
}

// ============================================================================
// FORMATTATORI SCALARI PURI
// ============================================================================

/**
 * Formatta un valore numerico scalare puro secondo la precisione decimale specificata.
 * Restituisce il placeholder se il valore e nullo, indefinito o non finito.
 *
 * @param val Valore numerico (o nullo/indefinito)
 * @param decimals Numero di cifre decimali (0, 1, 2, 3)
 * @param placeholder Stringa di fallback se non valido (default: '--')
 * @returns Stringa formattata (es. "102,5", "0,82", "--")
 */
export function formatNumericValue(
  val: number | null | undefined,
  decimals = 0,
  placeholder = PLACEHOLDER_EMPTY_DASH
): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return placeholder;
  }

  const safeVal = sanitizeNumeric(val, 0);

  switch (decimals) {
    case 0:
      return FORMATTER_DECIMAL_0.format(safeVal);
    case 1:
      return FORMATTER_DECIMAL_1.format(safeVal);
    case 2:
      return FORMATTER_DECIMAL_2.format(safeVal);
    case 3:
      return FORMATTER_DECIMAL_3.format(safeVal);
    default:
      return safeVal.toFixed(decimals);
  }
}

// ============================================================================
// FORMATTATORI COMPLETI CON UNITA DI MISURA SISTEMA INTERNAZIONALE
// ============================================================================

/**
 * Formatta un valore di Forza in Newton (N).
 * Intero se >= 100 N, con 1 decimale se < 100 N.
 *
 * @param n Valore della forza in Newton
 * @returns Stringa con unita (es. "2\u202F450\u202FN" o "--\u202FN")
 */
export function formatForce(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) {
    return `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}N`;
  }
  const decimals = Math.abs(n) < 100 ? 1 : 0;
  return `${formatNumericValue(n, decimals)}${NARROW_NO_BREAK_SPACE}N`;
}

/**
 * Formatta un valore di Potenza in Watt (W).
 * Intero secondo gli standard di biomeccanica e fisiologia sportiva.
 *
 * @param w Valore della potenza in Watt
 * @returns Stringa con unita (es. "1\u202F250\u202FW" o "--\u202FW")
 */
export function formatPower(w: number | null | undefined): string {
  if (w === null || w === undefined || !Number.isFinite(w)) {
    return `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}W`;
  }
  return `${formatNumericValue(w, 0)}${NARROW_NO_BREAK_SPACE}W`;
}

/**
 * Formatta un valore di Velocita in metri al secondo (m/s).
 * Tassativamente 2 decimali per sensibilita VBT (differenziale 5% 1RM).
 *
 * @param v Valore della velocita in m/s
 * @returns Stringa con unita (es. "0,82\u202Fm/s" o "--\u202Fm/s")
 */
export function formatVelocity(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) {
    return `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}m/s`;
  }
  return `${formatNumericValue(v, 2)}${NARROW_NO_BREAK_SPACE}m/s`;
}

/**
 * Formatta un valore di Carico / Massa in chilogrammi (kg).
 * Tassativamente 1 decimale per coerenza con micropiastre (0.5/1.25/2.5 kg).
 *
 * @param kg Valore del carico in kg
 * @returns Stringa con unita (es. "102,5\u202Fkg" o "--\u202Fkg")
 */
export function formatLoad(kg: number | null | undefined): string {
  if (kg === null || kg === undefined || !Number.isFinite(kg)) {
    return `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}kg`;
  }
  return `${formatNumericValue(kg, 1)}${NARROW_NO_BREAK_SPACE}kg`;
}

/**
 * Formatta un angolo articolare in gradi sessagesimali (°).
 * Nessuno spazio tra valore e simbolo del grado (es. "85°").
 *
 * @param deg Angolo in gradi
 * @param precision Cifre decimali (default: 0 per ROM, 1 per pose estimation)
 * @returns Stringa con grado (es. "85°" o "--°")
 */
export function formatAngle(deg: number | null | undefined, precision = 0): string {
  if (deg === null || deg === undefined || !Number.isFinite(deg)) {
    return `${PLACEHOLDER_EMPTY_DASH}°`;
  }
  return `${formatNumericValue(deg, precision)}°`;
}

/**
 * Formatta un tempo in millisecondi (ms) per tempi di contatto, volo o PVT.
 *
 * @param ms Tempo in millisecondi
 * @returns Stringa con unita (es. "245\u202Fms" o "--\u202Fms")
 */
export function formatTimeMs(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) {
    return `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}ms`;
  }
  return `${formatNumericValue(ms, 0)}${NARROW_NO_BREAK_SPACE}ms`;
}

/**
 * Formatta un tempo in secondi (s) per sprint e cronometraggi.
 *
 * @param s Tempo in secondi
 * @param precision Cifre decimali (default: 2)
 * @returns Stringa con unita (es. "4,28\u202Fs" o "--\u202Fs")
 */
export function formatTimeSec(s: number | null | undefined, precision = 2): string {
  if (s === null || s === undefined || !Number.isFinite(s)) {
    return `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}s`;
  }
  return `${formatNumericValue(s, precision)}${NARROW_NO_BREAK_SPACE}s`;
}

/**
 * Formatta la Frequenza Cardiaca in battiti al minuto (bpm).
 *
 * @param bpm Frequenza cardiaca
 * @returns Stringa con unita (es. "162\u202Fbpm" o "--\u202Fbpm")
 */
export function formatHeartRate(bpm: number | null | undefined): string {
  if (bpm === null || bpm === undefined || !Number.isFinite(bpm)) {
    return `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}bpm`;
  }
  return `${formatNumericValue(bpm, 0)}${NARROW_NO_BREAK_SPACE}bpm`;
}

/**
 * Formatta la variabilita cardiaca HRV rMSSD in millisecondi (ms).
 *
 * @param hrv Valore rMSSD in ms
 * @returns Stringa con unita (es. "64\u202Fms" o "--\u202Fms")
 */
export function formatHrvRmssd(hrv: number | null | undefined): string {
  if (hrv === null || hrv === undefined || !Number.isFinite(hrv)) {
    return `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}ms`;
  }
  return `${formatNumericValue(hrv, 0)}${NARROW_NO_BREAK_SPACE}ms`;
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
  decimals = 0
): MetricDisplayData {
  const isPlaceholder = val === null || val === undefined || !Number.isFinite(val);
  const valueText = formatNumericValue(val, decimals, PLACEHOLDER_EMPTY_DASH);
  return {
    valueText,
    unitText: unit,
    isPlaceholder,
  };
}
