/**
 * src/components/common/LoadingSkeleton.tsx
 * Skeleton screen pulsante hardware-accelerated con barra percentuale opzionale
 * per il Loading State obbligatorio (CAPITOLATO_TECNICO Sez. 4).
 * Conforme a Regola 01 (zero emoji, zero NaN/undefined, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React from 'react';
import {
  DEFAULT_SKELETON_ROWS,
  SHIMMER_DURATION_MS,
  SURFACE_CARD_BG,
  SURFACE_BORDER_SUBTLE,
  TEXT_PRIMARY_CONTRAST,
  TEXT_SECONDARY_CONTRAST,
  ACCENT_CYAN,
  sanitizeDisplayText,
  sanitizeProgressPercent,
  sanitizeSkeletonRows
} from './ui-state-utils';

export type LoadingSkeletonVariant = 'card' | 'list' | 'table' | 'chart';

export const DEFAULT_LOADING_LABEL = 'Caricamento dati in corso...';
export const SKELETON_CLASS_NAME = 't7-skeleton-container';
export const SKELETON_SHIMMER_CLASS = 't7-skeleton-shimmer';
export const SKELETON_PROGRESS_TRACK_CLASS = 't7-skeleton-progress-track';
export const SKELETON_PROGRESS_FILL_CLASS = 't7-skeleton-progress-fill';
export const SKELETON_CHART_HEIGHT_PX = 180;
export const SKELETON_ROW_HEIGHT_PX = 18;
export const SKELETON_CARD_RADIUS_PX = 16;

export interface LoadingSkeletonProps {
  /** Layout visivo dello skeleton: card, list, table oppure chart. */
  variant?: LoadingSkeletonVariant;
  /** Numero di elementi/righe scheletro (sanitizzato nel range 1..12). */
  rows?: number;
  /** Avanzamento percentuale opzionale (sanitizzato nel range 0..100). */
  progressPercent?: number;
  /** Etichetta descrittiva accessibile annunciata dagli screen reader. */
  label?: string;
  /** Forza la visualizzazione della barra di avanzamento anche in modalita 0%. */
  showProgressBar?: boolean;
}

/**
 * Componente Loading State hardware-accelerated con shimmer GPU (`translate3d`) e `prefers-reduced-motion`.
 * @param props Variante layout, numero righe, percentuale opzionale ed etichetta accessibile
 * @returns Contenitore `role="status"` con `aria-busy="true"` e barra `progressbar` opzionale
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  rows = DEFAULT_SKELETON_ROWS,
  progressPercent,
  label,
  showProgressBar = false
}) => {
  const safeRows = sanitizeSkeletonRows(rows, DEFAULT_SKELETON_ROWS);
  const safeProgress = sanitizeProgressPercent(progressPercent);
  const safeLabel = sanitizeDisplayText(label, DEFAULT_LOADING_LABEL);
  const shouldRenderProgress = showProgressBar || safeProgress !== undefined;
  const resolvedPercent = safeProgress ?? 0;
  const rowIndices = Array.from({ length: safeRows }, (_, index) => index);

  return (
    <section
      className={SKELETON_CLASS_NAME}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={safeLabel}
      data-ui-state="loading"
      data-shimmer-duration-ms={SHIMMER_DURATION_MS}
      style={{
        width: '100%',
        padding: '1.25rem',
        backgroundColor: SURFACE_CARD_BG,
        border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
        borderRadius: `${SKELETON_CARD_RADIUS_PX}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        boxSizing: 'border-box'
      }}
    >
      {/* Intestazione con etichetta e percentuale sicura */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: TEXT_PRIMARY_CONTRAST }}>
          {safeLabel}
        </span>

        {shouldRenderProgress && (
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: ACCENT_CYAN,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {resolvedPercent}%
          </span>
        )}
      </div>

      {/* Barra di avanzamento GPU-friendly (scaleX) */}
      {shouldRenderProgress && (
        <div
          className={SKELETON_PROGRESS_TRACK_CLASS}
          role="progressbar"
          aria-label="Avanzamento caricamento"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={resolvedPercent}
          aria-valuetext={`${resolvedPercent}%`}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '999px',
            backgroundColor: 'rgba(30, 41, 59, 0.85)',
            overflow: 'hidden'
          }}
        >
          <div
            className={SKELETON_PROGRESS_FILL_CLASS}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
              transform: `scaleX(${resolvedPercent / 100})`,
              transformOrigin: 'left center'
            }}
          />
        </div>
      )}

      {/* Segnaposto grafici shimmer marcati aria-hidden */}
      {variant === 'chart' && (
        <div
          aria-hidden="true"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
        >
          <div
            className={SKELETON_SHIMMER_CLASS}
            style={{ width: '42%', height: `${SKELETON_ROW_HEIGHT_PX}px`, borderRadius: '6px' }}
          />
          <div
            className={SKELETON_SHIMMER_CLASS}
            style={{ width: '100%', height: `${SKELETON_CHART_HEIGHT_PX}px`, borderRadius: '12px' }}
          />
        </div>
      )}

      {variant === 'table' && (
        <div
          aria-hidden="true"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <div
            className={SKELETON_SHIMMER_CLASS}
            style={{ width: '100%', height: '28px', borderRadius: '8px', opacity: 0.9 }}
          />
          {rowIndices.map((idx) => (
            <div
              key={`table-row-${idx}`}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}
            >
              <div className={SKELETON_SHIMMER_CLASS} style={{ height: `${SKELETON_ROW_HEIGHT_PX}px`, borderRadius: '6px' }} />
              <div className={SKELETON_SHIMMER_CLASS} style={{ height: `${SKELETON_ROW_HEIGHT_PX}px`, borderRadius: '6px' }} />
              <div className={SKELETON_SHIMMER_CLASS} style={{ height: `${SKELETON_ROW_HEIGHT_PX}px`, borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      )}

      {variant === 'list' && (
        <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {rowIndices.map((idx) => (
            <div
              key={`list-row-${idx}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div
                className={SKELETON_SHIMMER_CLASS}
                style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0 }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div className={SKELETON_SHIMMER_CLASS} style={{ width: '68%', height: '14px', borderRadius: '5px' }} />
                <div className={SKELETON_SHIMMER_CLASS} style={{ width: '44%', height: '12px', borderRadius: '5px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === 'card' && (
        <div
          aria-hidden="true"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem'
          }}
        >
          {rowIndices.map((idx) => (
            <div
              key={`card-item-${idx}`}
              style={{
                padding: '0.85rem',
                borderRadius: '12px',
                border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
                backgroundColor: 'rgba(11, 14, 20, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div className={SKELETON_SHIMMER_CLASS} style={{ width: '55%', height: '14px', borderRadius: '5px' }} />
              <div className={SKELETON_SHIMMER_CLASS} style={{ width: '85%', height: '24px', borderRadius: '6px' }} />
              <div className={SKELETON_SHIMMER_CLASS} style={{ width: '40%', height: '12px', borderRadius: '5px' }} />
            </div>
          ))}
        </div>
      )}

      <span style={{ fontSize: '0.75rem', color: TEXT_SECONDARY_CONTRAST }}>
        Attendere il completamento della sincronizzazione...
      </span>
    </section>
  );
};

export default LoadingSkeleton;
