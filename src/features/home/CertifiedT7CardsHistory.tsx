/**
 * src/features/home/CertifiedT7CardsHistory.tsx
 * Carosello/lista delle Card Certificate T7 concluse con tonnellaggio in kg, durata in min,
 * badge PR battuti, codice certificazione e pulsante "Condividi" filtrato per privacy (zero dati clinici/EMR).
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useCallback } from 'react';
import { isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import {
  ACCENT_CYAN,
  MIN_TOUCH_TARGET_PX,
  SURFACE_BORDER_SUBTLE,
  SURFACE_CARD_BG,
  SURFACE_SUBTLE_BG,
  TEXT_PRIMARY_CONTRAST,
  TEXT_SECONDARY_CONTRAST,
  getCommonFocusStyle,
  sanitizeDisplayText
} from '../../components/common/ui-state-utils';
import {
  CertifiedT7Card,
  ShareableT7Summary,
  buildShareableT7Summary,
  formatSessionDurationMin,
  formatSessionTonnageKg
} from './home-mock-data';

export const HISTORY_CARD_RADIUS_PX = 16;
export const HISTORY_EMPTY_MESSAGE = 'Nessuna Card Certificata T7 completata per il contesto attivo.';

export interface CertifiedT7CardsHistoryProps {
  /** Elenco Card Certificate T7 gia filtrate sul contesto attivo. */
  cards: readonly CertifiedT7Card[];
  /** Indica se mostrare il nome dell'atleta su ciascuna card (utile in modalita Squadra). */
  showAthleteName?: boolean;
  /** Disabilita la condivisione esterna (es. per ruolo researcher su Silo 3). */
  allowSharing?: boolean;
  /** Callback opzionale all'apertura del dettaglio card. */
  onInspectCard?: (cardId: string) => void;
  /** Callback opzionale alla richiesta di condivisione con payload privacy-filtered. */
  onShareCard?: (summary: ShareableT7Summary) => void;
  /** Callback rapida verso Programmazione quando lo storico e vuoto. */
  onExploreProgramming?: () => void;
}

/**
 * Renderizza lo storico delle Card Certificate T7 con metriche SI e filtro privacy per social export.
 * @param props Lista card, flag visibilita condivisione e gestori interazione
 * @returns Griglia card Dark Cockpit oppure mini Empty State guidato
 */
export const CertifiedT7CardsHistory: React.FC<CertifiedT7CardsHistoryProps> = ({
  cards,
  showAthleteName = false,
  allowSharing = true,
  onInspectCard,
  onShareCard,
  onExploreProgramming
}) => {
  const [sharedSummaryPreview, setSharedSummaryPreview] = useState<ShareableT7Summary | null>(null);
  const [focusedButtonId, setFocusedButtonId] = useState<string | null>(null);

  const handleShareClick = useCallback((card: CertifiedT7Card): void => {
    if (!allowSharing) {
      return;
    }
    const sanitizedSummary = buildShareableT7Summary(card);
    setSharedSummaryPreview(sanitizedSummary);
    onShareCard?.(sanitizedSummary);
  }, [allowSharing, onShareCard]);

  const handleFocus = useCallback((id: string, event: React.FocusEvent<HTMLButtonElement>): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setFocusedButtonId(id);
    }
  }, []);

  const handleBlur = useCallback((): void => {
    setFocusedButtonId(null);
  }, []);

  return (
    <section
      aria-label="Storico Card Certificate T7"
      style={{
        padding: '1.25rem',
        backgroundColor: SURFACE_CARD_BG,
        border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
        borderRadius: `${HISTORY_CARD_RADIUS_PX}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.95rem',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: ACCENT_CYAN }}>
            Storico Certificato
          </span>
          <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.05rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST }}>
            Ultimi Allenamenti Conclusi
          </h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: TEXT_SECONDARY_CONTRAST, fontVariantNumeric: 'tabular-nums' }}>
          {cards.length} sessioni certificate
        </span>
      </div>

      {sharedSummaryPreview && (
        <div
          role="status"
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          Card &quot;{sharedSummaryPreview.workoutTitle}&quot; ({sharedSummaryPreview.formattedVolumeKg}): riepilogo privo di dati clinici/EMR pronto per la condivisione.
        </div>
      )}

      {cards.length === 0 ? (
        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: SURFACE_SUBTLE_BG,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: TEXT_SECONDARY_CONTRAST }}>
            {HISTORY_EMPTY_MESSAGE}
          </span>
          {onExploreProgramming && (
            <button
              type="button"
              onClick={onExploreProgramming}
              onFocus={(e) => handleFocus('history-empty-cta', e)}
              onBlur={handleBlur}
              style={{
                minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                backgroundColor: 'rgba(56, 189, 248, 0.14)',
                color: ACCENT_CYAN,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                ...getCommonFocusStyle(focusedButtonId === 'history-empty-cta')
              }}
            >
              Vai a Programmazione
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.75rem'
          }}
        >
          {cards.map((card) => {
            const safeTitle = sanitizeDisplayText(card.sessionTitle, 'Sessione T7');
            const safeAthlete = sanitizeDisplayText(card.athleteName, 'Atleta');

            return (
              <article
                key={card.id}
                style={{
                  padding: '0.95rem',
                  borderRadius: '12px',
                  backgroundColor: SURFACE_SUBTLE_BG,
                  border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: ACCENT_CYAN }}>
                      {sanitizeDisplayText(card.certificationCode, 'T7-CERT')}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: TEXT_SECONDARY_CONTRAST }}>
                      {sanitizeDisplayText(card.completedDateLabel, 'Completata')}
                    </span>
                  </div>

                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST }}>
                    {safeTitle}
                  </h4>

                  {showAthleteName && (
                    <span style={{ fontSize: '0.78rem', color: TEXT_SECONDARY_CONTRAST }}>
                      Atleta: {safeAthlete}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ color: TEXT_PRIMARY_CONTRAST, fontWeight: 700 }}>
                    {formatSessionTonnageKg(card.totalVolumeKg)}
                  </span>
                  <span style={{ color: TEXT_SECONDARY_CONTRAST }}>
                    {formatSessionDurationMin(card.durationMin)}
                  </span>
                  {card.prCount > 0 && (
                    <span style={{ color: '#34d399', fontWeight: 700 }}>
                      {card.prCount} PR
                    </span>
                  )}
                </div>

                {card.prHighlights.length > 0 && (
                  <div style={{ fontSize: '0.74rem', color: TEXT_SECONDARY_CONTRAST }}>
                    {card.prHighlights[0].exerciseName}: <strong style={{ color: TEXT_PRIMARY_CONTRAST }}>{card.prHighlights[0].metricText}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => onInspectCard?.(card.id)}
                    onFocus={(e) => handleFocus(`inspect-${card.id}`, e)}
                    onBlur={handleBlur}
                    style={{
                      flex: 1,
                      minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                      padding: '0.4rem 0.65rem',
                      borderRadius: '8px',
                      border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
                      backgroundColor: 'rgba(15, 23, 42, 0.7)',
                      color: TEXT_PRIMARY_CONTRAST,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      ...getCommonFocusStyle(focusedButtonId === `inspect-${card.id}`)
                    }}
                  >
                    Dettaglio
                  </button>

                  {allowSharing && (
                    <button
                      type="button"
                      onClick={() => handleShareClick(card)}
                      onFocus={(e) => handleFocus(`share-${card.id}`, e)}
                      onBlur={handleBlur}
                      style={{
                        flex: 1,
                        minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                        padding: '0.4rem 0.65rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        color: ACCENT_CYAN,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        ...getCommonFocusStyle(focusedButtonId === `share-${card.id}`)
                      }}
                    >
                      Condividi
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CertifiedT7CardsHistory;
