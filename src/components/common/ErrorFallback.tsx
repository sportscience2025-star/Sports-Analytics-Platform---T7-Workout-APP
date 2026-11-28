/**
 * src/components/common/ErrorFallback.tsx
 * Banner/card di errore ad alto contrasto con pulsante "Riprova", exponential backoff
 * a prova di React StrictMode e memory leak, indicatore offline PWA e dettagli collassabili.
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import {
  BASE_RETRY_DELAY_MS,
  MAX_RETRY_ATTEMPTS,
  BACKOFF_MULTIPLIER,
  MAX_BACKOFF_DELAY_MS,
  RETRY_TICK_INTERVAL_MS,
  MIN_TOUCH_TARGET_PX,
  SURFACE_DARK_BG,
  SURFACE_CARD_BG,
  SURFACE_BORDER_SUBTLE,
  TEXT_PRIMARY_CONTRAST,
  TEXT_SECONDARY_CONTRAST,
  ERROR_TEXT_SAFE,
  ERROR_BORDER_COLOR,
  ERROR_SURFACE_BG,
  WARNING_TEXT_SAFE,
  WARNING_SURFACE_BG,
  WARNING_BORDER_COLOR,
  ACCENT_INDIGO,
  RetryBackoffStatus,
  sanitizeDisplayText,
  extractSafeErrorMessage,
  computeBackoffDelayMs,
  resolveNextFailureState,
  getCommonFocusStyle
} from './ui-state-utils';

export const DEFAULT_ERROR_TITLE = 'Errore durante il caricamento';
export const DEFAULT_ERROR_MESSAGE =
  'Si e verificato un problema temporaneo di rete o elaborazione. Riprova tra pochi istanti.';
export const ERROR_FALLBACK_CLASS_NAME = 't7-error-fallback';
export const ERROR_CARD_MAX_WIDTH_PX = 600;
export const ERROR_CARD_RADIUS_PX = 16;

export interface ErrorFallbackProps {
  /** Titolo dell'avviso errore mostrato all'utente. */
  title?: string;
  /** Messaggio descrittivo amichevole. */
  message?: string;
  /** Oggetto Error o testo grezzo da cui estrarre diagnostica sicura. */
  error?: Error | string | null;
  /** Log diagnostico tecnico opzionale mostrato solo su espansione esplicita. */
  technicalDetails?: string;
  /** Handler di ripristino invocato al click su "Riprova". */
  onRetry?: () => void | Promise<void>;
  /** Handler opzionale per ricaricare l'intera applicazione quando i tentativi sono esauriti. */
  onReload?: () => void;
  /** Ritardo base iniziale (ms) per l'exponential backoff. */
  baseDelayMs?: number;
  /** Numero massimo di tentativi consecutivi prima dello stato exhausted. */
  maxRetries?: number;
  /** Fattore moltiplicativo dell'exponential backoff. */
  backoffMultiplier?: number;
  /** Override esplicito stato offline PWA (altrimenti rilevato via navigator.onLine in useEffect). */
  isOffline?: boolean;
}

/**
 * Vista Error / Fallback State accessibile con exponential backoff e recupero da stati esauriti.
 * @param props Messaggi errore, handler retry/reload, parametri backoff e stato offline
 * @returns Card errore ad alto contrasto con `role="alert"` e dettagli diagnostici collassabili
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  title,
  message,
  error,
  technicalDetails,
  onRetry,
  onReload,
  baseDelayMs = BASE_RETRY_DELAY_MS,
  maxRetries = MAX_RETRY_ATTEMPTS,
  backoffMultiplier = BACKOFF_MULTIPLIER,
  isOffline
}) => {
  const [retryStatus, setRetryStatus] = useState<RetryBackoffStatus>('idle');
  const [retryAttempts, setRetryAttempts] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [clientOffline, setClientOffline] = useState<boolean>(false);
  const [focusedButtonId, setFocusedButtonId] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(false);
  const inFlightRef = useRef<boolean>(false);
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownDeadlineRef = useRef<number>(0);

  const detailsRegionId = useId();
  const safeMaxRetries = Math.max(1, Math.floor(maxRetries));

  const clearRetryTimers = useCallback((): void => {
    if (cooldownTimeoutRef.current !== null) {
      clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = null;
    }
    if (tickIntervalRef.current !== null) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  // StrictMode-safe mount lifecycle & cleanup timer
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      inFlightRef.current = false;
      clearRetryTimers();
    };
  }, [clearRetryTimers]);

  // Rilevamento offline SSR-safe (solo client dopo l'idratazione)
  useEffect(() => {
    if (isOffline !== undefined || typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const syncOnlineStatus = (): void => {
      setClientOffline(navigator.onLine === false);
    };

    syncOnlineStatus();
    window.addEventListener('online', syncOnlineStatus);
    window.addEventListener('offline', syncOnlineStatus);
    return () => {
      window.removeEventListener('online', syncOnlineStatus);
      window.removeEventListener('offline', syncOnlineStatus);
    };
  }, [isOffline]);

  const startCooldown = useCallback((attemptIndex: number): void => {
    clearRetryTimers();
    const delayMs = computeBackoffDelayMs(
      attemptIndex,
      baseDelayMs,
      backoffMultiplier,
      MAX_BACKOFF_DELAY_MS
    );
    const deadline = Date.now() + delayMs;
    cooldownDeadlineRef.current = deadline;
    setRemainingSeconds(Math.max(1, Math.ceil(delayMs / 1000)));

    tickIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        return;
      }
      const leftMs = cooldownDeadlineRef.current - Date.now();
      if (leftMs <= 0) {
        setRemainingSeconds(0);
      } else {
        setRemainingSeconds(Math.ceil(leftMs / 1000));
      }
    }, RETRY_TICK_INTERVAL_MS);

    cooldownTimeoutRef.current = setTimeout(() => {
      clearRetryTimers();
      if (!isMountedRef.current) {
        return;
      }
      setRemainingSeconds(0);
      setRetryStatus('idle');
    }, delayMs);
  }, [baseDelayMs, backoffMultiplier, clearRetryTimers]);

  const handleRetryClick = useCallback(async (): Promise<void> => {
    if (!onRetry || inFlightRef.current || retryStatus === 'cooldown' || retryStatus === 'exhausted') {
      return;
    }

    inFlightRef.current = true;
    setRetryStatus('retrying');

    try {
      await Promise.resolve(onRetry());
    } catch {
      // L'errore e atteso se il servizio continua a fallire durante il backoff
    } finally {
      inFlightRef.current = false;
    }

    if (!isMountedRef.current) {
      return;
    }

    const { nextAttempts, nextStatus } = resolveNextFailureState(retryAttempts, safeMaxRetries);
    setRetryAttempts(nextAttempts);
    setRetryStatus(nextStatus);

    if (nextStatus === 'cooldown') {
      startCooldown(nextAttempts - 1);
    }
  }, [onRetry, retryStatus, retryAttempts, safeMaxRetries, startCooldown]);

  const handleResetAttempts = useCallback((): void => {
    clearRetryTimers();
    inFlightRef.current = false;
    setRetryAttempts(0);
    setRemainingSeconds(0);
    setRetryStatus('idle');
  }, [clearRetryTimers]);

  const handleReloadPage = useCallback((): void => {
    if (onReload) {
      onReload();
      return;
    }
    if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      window.location.reload();
    }
  }, [onReload]);

  const handleFocus = useCallback((id: string, event: React.FocusEvent<HTMLButtonElement>): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setFocusedButtonId(id);
    }
  }, []);

  const handleBlur = useCallback((): void => {
    setFocusedButtonId(null);
  }, []);

  const safeTitle = sanitizeDisplayText(title, DEFAULT_ERROR_TITLE);
  const fallbackFromError = extractSafeErrorMessage(error, DEFAULT_ERROR_MESSAGE);
  const safeMessage = sanitizeDisplayText(message, fallbackFromError);
  const safeTechnical = sanitizeDisplayText(
    technicalDetails ?? (error instanceof Error ? error.stack || error.message : ''),
    ''
  );
  const effectiveOffline = isOffline !== undefined ? isOffline : clientOffline;

  return (
    <section
      className={ERROR_FALLBACK_CLASS_NAME}
      data-ui-state="error"
      style={{
        width: '100%',
        maxWidth: `${ERROR_CARD_MAX_WIDTH_PX}px`,
        margin: '1.25rem auto',
        padding: '1.5rem',
        backgroundColor: SURFACE_CARD_BG,
        border: `1px solid ${ERROR_BORDER_COLOR}`,
        borderRadius: `${ERROR_CARD_RADIUS_PX}px`,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxSizing: 'border-box'
      }}
    >
      {/* Regione critica annunciata dallo screen reader */}
      <div role="alert" aria-live="assertive" aria-atomic="true" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: ERROR_SURFACE_BG,
              color: ERROR_TEXT_SAFE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST }}>
              {safeTitle}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: ERROR_TEXT_SAFE, lineHeight: 1.5 }}>
              {safeMessage}
            </p>
          </div>
        </div>

        {effectiveOffline && (
          <div
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: WARNING_SURFACE_BG,
              border: `1px solid ${WARNING_BORDER_COLOR}`,
              color: WARNING_TEXT_SAFE,
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            Connessione assente: modalita offline PWA attiva con sincronizzazione differita.
          </div>
        )}
      </div>

      {/* Stato backoff fuori dalla live region assertive per evitare spam vocale */}
      {retryAttempts > 0 && (
        <div
          aria-live="off"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            fontSize: '0.78rem',
            color: TEXT_SECONDARY_CONTRAST,
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          <span>
            Tentativi effettuati: {retryAttempts}/{safeMaxRetries}
          </span>
          {retryStatus === 'cooldown' && remainingSeconds > 0 && (
            <span>Prossimo tentativo disponibile tra {remainingSeconds}s</span>
          )}
          {retryStatus === 'exhausted' && (
            <span style={{ color: ERROR_TEXT_SAFE, fontWeight: 600 }}>
              Limite tentativi raggiunto
            </span>
          )}
        </div>
      )}

      {/* Barra azioni */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {onRetry && retryStatus !== 'exhausted' && (
          <button
            type="button"
            onClick={handleRetryClick}
            disabled={retryStatus === 'retrying' || retryStatus === 'cooldown'}
            onFocus={(e) => handleFocus('retry-btn', e)}
            onBlur={handleBlur}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              minHeight: `${MIN_TOUCH_TARGET_PX}px`,
              padding: '0.55rem 1.15rem',
              borderRadius: '10px',
              border: '1px solid rgba(99, 102, 241, 0.55)',
              backgroundColor: ACCENT_INDIGO,
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: retryStatus === 'retrying' || retryStatus === 'cooldown' ? 'not-allowed' : 'pointer',
              opacity: retryStatus === 'retrying' || retryStatus === 'cooldown' ? 0.65 : 1,
              ...getCommonFocusStyle(focusedButtonId === 'retry-btn')
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>
              {retryStatus === 'retrying'
                ? 'Ripristino...'
                : retryStatus === 'cooldown'
                ? `Attendi (${remainingSeconds}s)`
                : 'Riprova'}
            </span>
          </button>
        )}

        {retryStatus === 'exhausted' && (
          <>
            <button
              type="button"
              onClick={handleResetAttempts}
              onFocus={(e) => handleFocus('reset-attempts-btn', e)}
              onBlur={handleBlur}
              style={{
                minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(99, 102, 241, 0.55)',
                backgroundColor: ACCENT_INDIGO,
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                ...getCommonFocusStyle(focusedButtonId === 'reset-attempts-btn')
              }}
            >
              Ripristina Tentativi
            </button>

            <button
              type="button"
              onClick={handleReloadPage}
              onFocus={(e) => handleFocus('reload-btn', e)}
              onBlur={handleBlur}
              style={{
                minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
                backgroundColor: 'transparent',
                color: TEXT_SECONDARY_CONTRAST,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                ...getCommonFocusStyle(focusedButtonId === 'reload-btn')
              }}
            >
              Ricarica Pagina
            </button>
          </>
        )}

        {safeTechnical.length > 0 && (
          <button
            type="button"
            aria-expanded={isDetailsOpen}
            aria-controls={detailsRegionId}
            onClick={() => setIsDetailsOpen((prev) => !prev)}
            onFocus={(e) => handleFocus('details-btn', e)}
            onBlur={handleBlur}
            style={{
              minHeight: `${MIN_TOUCH_TARGET_PX}px`,
              padding: '0.55rem 0.9rem',
              borderRadius: '10px',
              border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
              backgroundColor: 'transparent',
              color: TEXT_SECONDARY_CONTRAST,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              ...getCommonFocusStyle(focusedButtonId === 'details-btn')
            }}
          >
            {isDetailsOpen ? 'Nascondi Dettagli' : 'Dettagli Tecnici'}
          </button>
        )}
      </div>

      {isDetailsOpen && safeTechnical.length > 0 && (
        <pre
          id={detailsRegionId}
          style={{
            margin: 0,
            padding: '0.85rem',
            borderRadius: '10px',
            backgroundColor: SURFACE_DARK_BG,
            border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
            color: ERROR_TEXT_SAFE,
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '160px',
            overflowY: 'auto'
          }}
        >
          {safeTechnical}
        </pre>
      )}
    </section>
  );
};

export default ErrorFallback;
