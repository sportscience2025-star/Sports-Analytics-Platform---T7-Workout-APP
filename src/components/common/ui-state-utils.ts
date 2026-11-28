/**
 * src/components/common/ui-state-utils.ts
 * Funzioni pure condivise, costanti di resilienza UI e sanitizzazione sicura per i 4 stati UI.
 * Riusa i guardiani SI non-allocanti di `metrology-guard.ts` ed evita cicli con `src/components/layout/`.
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO, zero duplicazioni).
 */

import React from 'react';
import { sanitizeNumeric, clampToRange } from '../../utils/metrology-guard';

export const MIN_TOUCH_TARGET_PX = 44;
export const MIN_PROGRESS_PERCENT = 0;
export const MAX_PROGRESS_PERCENT = 100;
export const MIN_SKELETON_ROWS = 1;
export const MAX_SKELETON_ROWS = 12;
export const DEFAULT_SKELETON_ROWS = 3;

export const BASE_RETRY_DELAY_MS = 1000;
export const MAX_RETRY_ATTEMPTS = 5;
export const BACKOFF_MULTIPLIER = 2;
export const MAX_BACKOFF_DELAY_MS = 30000;
export const SHIMMER_DURATION_MS = 1500;
export const RETRY_TICK_INTERVAL_MS = 250;

export const SURFACE_DARK_BG = '#0b0e14';
export const SURFACE_CARD_BG = 'rgba(15, 23, 42, 0.86)';
export const SURFACE_SUBTLE_BG = 'rgba(30, 41, 59, 0.55)';
export const SURFACE_BORDER_SUBTLE = 'rgba(255, 255, 255, 0.1)';
export const TEXT_PRIMARY_CONTRAST = '#f8fafc';
export const TEXT_SECONDARY_CONTRAST = '#cbd5e1';
export const TEXT_MUTED_SAFE = '#94a3b8';
export const ACCENT_CYAN = '#38bdf8';
export const ACCENT_INDIGO = '#4f46e5';
export const ERROR_TEXT_SAFE = '#fca5a5';
export const ERROR_BORDER_COLOR = 'rgba(244, 63, 94, 0.45)';
export const ERROR_SURFACE_BG = 'rgba(244, 63, 94, 0.14)';
export const WARNING_TEXT_SAFE = '#fcd34d';
export const WARNING_SURFACE_BG = 'rgba(245, 158, 11, 0.14)';
export const WARNING_BORDER_COLOR = 'rgba(245, 158, 11, 0.4)';

export const COMMON_FOCUS_OUTLINE = '2px solid #38bdf8';
export const COMMON_FOCUS_SHADOW = '0 0 0 3px rgba(56, 189, 248, 0.35)';

export type RetryBackoffStatus = 'idle' | 'retrying' | 'cooldown' | 'exhausted';

/**
 * Sanitizza una stringa destinata alla visualizzazione UI impedendo stringhe vuote o "undefined".
 * @param value Valore testuale grezzo da validare
 * @param fallback Testo predefinito sicuro se `value` non e valido o e solo spazi
 * @returns Stringa non vuota e sicura per il rendering
 */
export function sanitizeDisplayText(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0 && trimmed !== 'undefined' && trimmed !== 'null') {
      return trimmed;
    }
  }
  return fallback;
}

/**
 * Estrae un messaggio diagnostico sicuro da un errore arbitrario (Error, stringa o oggetto).
 * @param error Valore catturato da blocco `catch` o prop
 * @param fallback Messaggio di ripiego quando l'errore non contiene testo leggibile
 * @returns Testo errore sicuro (mai "undefined" o "[object Object]")
 */
export function extractSafeErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') {
    return sanitizeDisplayText(error, fallback);
  }
  if (error instanceof Error) {
    return sanitizeDisplayText(error.message, fallback);
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const candidate = (error as { message?: unknown }).message;
    return sanitizeDisplayText(candidate, fallback);
  }
  return fallback;
}

/**
 * Sanitizza la percentuale di avanzamento dello skeleton distinguendo modalita indeterminata e valori corrotti.
 * @param value Valore numerico opzionale in ingresso
 * @returns Intero nel range [0, 100], oppure `undefined` se esplicitamente non specificato
 */
export function sanitizeProgressPercent(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const numeric = sanitizeNumeric(value, 0);
  return clampToRange(Math.round(numeric), MIN_PROGRESS_PERCENT, MAX_PROGRESS_PERCENT);
}

/**
 * Sanitizza il numero di righe/elementi scheletro entro limiti sicuri per prevenire RangeError o freeze DOM.
 * @param value Numero di righe richiesto
 * @param fallback Valore di ripiego (default: 3)
 * @returns Intero garantito nel range [1, 12]
 */
export function sanitizeSkeletonRows(
  value: unknown,
  fallback: number = DEFAULT_SKELETON_ROWS
): number {
  const numeric = sanitizeNumeric(value, fallback);
  return clampToRange(Math.floor(numeric), MIN_SKELETON_ROWS, MAX_SKELETON_ROWS);
}

/**
 * Calcola il ritardo di exponential backoff in millisecondi con protezione da overflow e NaN.
 * Formula: min(maxDelayMs, baseDelayMs * (multiplier ^ attemptIndex)).
 * @param attemptIndex Indice del tentativo fallito a partire da 0
 * @param baseDelayMs Ritardo base iniziale in ms (default: 1000)
 * @param multiplier Fattore moltiplicativo per ogni tentativo (default: 2)
 * @param maxDelayMs Tetto massimo di attesa in ms (default: 30000)
 * @returns Attesa sicura e finita in millisecondi
 */
export function computeBackoffDelayMs(
  attemptIndex: number,
  baseDelayMs: number = BASE_RETRY_DELAY_MS,
  multiplier: number = BACKOFF_MULTIPLIER,
  maxDelayMs: number = MAX_BACKOFF_DELAY_MS
): number {
  const safeAttempt = Math.max(0, Math.floor(sanitizeNumeric(attemptIndex, 0)));
  const safeBase = Math.max(0, sanitizeNumeric(baseDelayMs, BASE_RETRY_DELAY_MS));
  const safeMultiplier = Math.max(1, sanitizeNumeric(multiplier, BACKOFF_MULTIPLIER));
  const safeMax = Math.max(safeBase, sanitizeNumeric(maxDelayMs, MAX_BACKOFF_DELAY_MS));

  const rawDelay = safeBase * Math.pow(safeMultiplier, safeAttempt);
  if (!Number.isFinite(rawDelay)) {
    return safeMax;
  }
  return Math.min(safeMax, Math.round(rawDelay));
}

/**
 * Risolve lo stato successivo del meccanismo di retry dopo un tentativo eseguito.
 * @param currentAttempts Numero di tentativi gia effettuati prima dell'ultimo esito
 * @param maxRetries Numero massimo consentito di tentativi (default: 5)
 * @returns Prossimo stato (`cooldown` o `exhausted`) e contatore aggiornato
 */
export function resolveNextFailureState(
  currentAttempts: number,
  maxRetries: number = MAX_RETRY_ATTEMPTS
): { nextAttempts: number; nextStatus: RetryBackoffStatus } {
  const safeMax = Math.max(1, Math.floor(sanitizeNumeric(maxRetries, MAX_RETRY_ATTEMPTS)));
  const safeCurrent = Math.max(0, Math.floor(sanitizeNumeric(currentAttempts, 0)));
  const nextAttempts = safeCurrent + 1;
  const nextStatus: RetryBackoffStatus = nextAttempts >= safeMax ? 'exhausted' : 'cooldown';
  return { nextAttempts, nextStatus };
}

/**
 * Restituisce lo stile inline del focus ring accessibile preservando la navigazione da tastiera.
 * @param isFocused Indica se il focus da tastiera e attivo sul controllo
 * @returns Oggetto CSSProperties per evidenziare il focus
 */
export function getCommonFocusStyle(isFocused: boolean): React.CSSProperties {
  if (!isFocused) {
    return {};
  }
  return {
    outline: COMMON_FOCUS_OUTLINE,
    outlineOffset: '2px',
    boxShadow: COMMON_FOCUS_SHADOW
  };
}
