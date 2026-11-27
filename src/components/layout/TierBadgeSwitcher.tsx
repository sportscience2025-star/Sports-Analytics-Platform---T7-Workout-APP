/**
 * src/components/layout/TierBadgeSwitcher.tsx
 * Badge interattivo del livello di abbonamento (Tier 1 Consumer, Tier 2 Pro Coach, Tier 3 Elite Club).
 * Include popover rapido per simulazione e collaudo runtime conforme ad ADR-02 e ZONA 3 Schema 5.
 * Conforme a Regola 01 (zero emoji spontanee, solo SVG) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useCallback, useId } from 'react';
import { useTier } from '../../hooks/useTier';
import { useDismissiblePopover, isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import { TierLevel } from '../../types';

export const Z_INDEX_TIER_POPOVER = 60;
export const TIER_POPOVER_WIDTH_PX = 260;
export const TIER_POPOVER_VIEWPORT_MARGIN_PX = 24;
export const TIER_POPOVER_OFFSET_PX = 8;
export const TIER_POPOVER_BLUR_PX = 20;
export const TIER_BADGE_MIN_HEIGHT_PX = 32;
export const TIER_DOT_SIZE_PX = 6;
export const TIER_CHECK_ICON_SIZE_PX = 14;
export const TIER_TRANSITION_MS = 150;
export const TIER_ITEM_TRANSITION_MS = 100;
export const TIER_BORDER_RADIUS_PILL_PX = 999;
export const TIER_BORDER_RADIUS_POPOVER_PX = 12;
export const TIER_BORDER_RADIUS_ITEM_PX = 8;
export const TIER_POPOVER_GLASS_BG = 'rgba(15, 23, 42, 0.88)';
export const TIER_ITEM_IDLE_BG = 'rgba(30, 41, 59, 0.5)';
export const TIER_FOCUS_RING_OUTLINE = '2px solid #38bdf8';
export const TIER_FOCUS_RING_SHADOW = '0 0 0 3px rgba(56, 189, 248, 0.35)';

export const TIER_OPTIONS: readonly TierLevel[] = Object.freeze(['tier1', 'tier2', 'tier3']);

export interface TierStyleConfig {
  label: string;
  sublabel: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
  glowColor: string;
}

export const TIER_STYLES: Readonly<Record<TierLevel, TierStyleConfig>> = Object.freeze({
  tier1: {
    label: 'TIER 1',
    sublabel: 'Consumer',
    borderColor: 'rgba(148, 163, 184, 0.3)',
    textColor: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.1)',
    glowColor: 'rgba(148, 163, 184, 0.15)'
  },
  tier2: {
    label: 'TIER 2',
    sublabel: 'Pro Coach',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    textColor: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
    glowColor: 'rgba(56, 189, 248, 0.25)'
  },
  tier3: {
    label: 'TIER 3',
    sublabel: 'Elite Club',
    borderColor: 'rgba(168, 85, 247, 0.45)',
    textColor: '#c084fc',
    bgColor: 'rgba(168, 85, 247, 0.16)',
    glowColor: 'rgba(168, 85, 247, 0.35)'
  }
});

export interface TierBadgeSwitcherProps {
  /** Permette di renderizzare il popover aperto al mount per test statici e snapshot. */
  defaultOpen?: boolean;
}

/**
 * Badge interattivo per visualizzare e simulare il livello di abbonamento attivo (`tier1`/`tier2`/`tier3`).
 * @param props Proprieta opzionali del componente (es. `defaultOpen`)
 * @returns Pillola trigger e popover accessibile con riepilogo permessi Silo/Bunker
 */
export const TierBadgeSwitcher: React.FC<TierBadgeSwitcherProps> = ({
  defaultOpen = false
}) => {
  const { tier, setTier, maxAthletes, canExportExcel, canAccessBunker, dataSilo } = useTier();
  const [focusedElementId, setFocusedElementId] = useState<string | null>(null);
  const popoverId = useId();

  /**
   * Azzera lo stato di evidenziazione focus alla chiusura del popover.
   */
  const handlePopoverClose = useCallback((): void => {
    setFocusedElementId(null);
  }, []);

  const {
    isOpen,
    toggle,
    close,
    containerRef,
    triggerRef
  } = useDismissiblePopover({
    initialOpen: defaultOpen,
    onClose: handlePopoverClose
  });

  /**
   * Applica il livello Tier selezionato nel contesto RBAC e chiude il popover.
   * @param targetTier Livello abbonamento scelto dall'utente
   */
  const handleSelectTier = useCallback(
    (targetTier: TierLevel): void => {
      setTier(targetTier);
      close(true);
    },
    [setTier, close]
  );

  /**
   * Applica l'anello di focus visibile quando il controllo e raggiunto da tastiera.
   * @param elementId Identificativo logico del bottone
   * @param event Evento focus React
   */
  const handleControlFocus = useCallback(
    (elementId: string, event: React.FocusEvent<HTMLButtonElement>): void => {
      if (isKeyboardFocusTarget(event.currentTarget)) {
        setFocusedElementId(elementId);
      }
    },
    []
  );

  /**
   * Rimuove lo stato di focus visibile al blur del bottone.
   * @param elementId Identificativo logico del bottone
   */
  const handleControlBlur = useCallback((elementId: string): void => {
    setFocusedElementId((prev) => (prev === elementId ? null : prev));
  }, []);

  /**
   * Calcola gli stili CSS di focus accessibile per il controllo indicato.
   * @param elementId Identificativo logico del bottone
   * @returns Oggetto stile per focus-visible oppure oggetto vuoto
   */
  const getFocusStyle = useCallback(
    (elementId: string): React.CSSProperties => {
      if (focusedElementId !== elementId) {
        return {};
      }
      return {
        outline: TIER_FOCUS_RING_OUTLINE,
        outlineOffset: '2px',
        boxShadow: TIER_FOCUS_RING_SHADOW
      };
    },
    [focusedElementId]
  );

  const activeStyle = TIER_STYLES[tier];

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Badge interattivo */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        onFocus={(e) => handleControlFocus('trigger', e)}
        onBlur={() => handleControlBlur('trigger')}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        aria-label="Livello Tier attivo, premi per cambiare simulazione"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          minHeight: `${TIER_BADGE_MIN_HEIGHT_PX}px`,
          padding: '0.2rem 0.65rem',
          backgroundColor: activeStyle.bgColor,
          border: `1px solid ${activeStyle.borderColor}`,
          borderRadius: `${TIER_BORDER_RADIUS_PILL_PX}px`,
          color: activeStyle.textColor,
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          boxShadow: `0 0 10px ${activeStyle.glowColor}`,
          transition: `all ${TIER_TRANSITION_MS}ms ease-in-out`,
          whiteSpace: 'nowrap',
          ...getFocusStyle('trigger')
        }}
      >
        <span
          style={{
            width: `${TIER_DOT_SIZE_PX}px`,
            height: `${TIER_DOT_SIZE_PX}px`,
            borderRadius: '50%',
            backgroundColor: activeStyle.textColor
          }}
        />
        <span>{activeStyle.label} • {activeStyle.sublabel.toUpperCase()}</span>
      </button>

      {/* Popover Switcher per Collaudo e Simulazione */}
      {isOpen && (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Pannello simulatore abbonamento Tier"
          style={{
            position: 'absolute',
            top: `calc(100% + ${TIER_POPOVER_OFFSET_PX}px)`,
            left: 0,
            width: `min(${TIER_POPOVER_WIDTH_PX}px, calc(100vw - ${TIER_POPOVER_VIEWPORT_MARGIN_PX}px))`,
            maxWidth: `calc(100vw - ${TIER_POPOVER_VIEWPORT_MARGIN_PX}px)`,
            backgroundColor: TIER_POPOVER_GLASS_BG,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: `${TIER_BORDER_RADIUS_POPOVER_PX}px`,
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)',
            padding: '0.75rem',
            zIndex: Z_INDEX_TIER_POPOVER,
            backdropFilter: `blur(${TIER_POPOVER_BLUR_PX}px)`,
            WebkitBackdropFilter: `blur(${TIER_POPOVER_BLUR_PX}px)`
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Simulatore Abbonamento
          </div>

          {/* Opzioni di switch per collaudo */}
          {TIER_OPTIONS.map((tKey) => {
            const config = TIER_STYLES[tKey];
            const isCurrent = tier === tKey;
            const controlId = `tier-opt-${tKey}`;

            return (
              <button
                key={tKey}
                type="button"
                onClick={() => handleSelectTier(tKey)}
                onFocus={(e) => handleControlFocus(controlId, e)}
                onBlur={() => handleControlBlur(controlId)}
                aria-pressed={isCurrent}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  marginBottom: '0.3rem',
                  backgroundColor: isCurrent ? config.bgColor : TIER_ITEM_IDLE_BG,
                  border: `1px solid ${isCurrent ? config.borderColor : 'transparent'}`,
                  borderRadius: `${TIER_BORDER_RADIUS_ITEM_PX}px`,
                  color: isCurrent ? config.textColor : '#f1f5f9',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: `background-color ${TIER_ITEM_TRANSITION_MS}ms ease`,
                  ...getFocusStyle(controlId)
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{config.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{config.sublabel}</div>
                </div>

                {isCurrent && (
                  <svg
                    width={TIER_CHECK_ICON_SIZE_PX}
                    height={TIER_CHECK_ICON_SIZE_PX}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}

          {/* Riepilogo feature abilitate nel Tier corrente */}
          <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.7rem', color: '#94a3b8' }}>
            <div>Max Atleti: <strong style={{ color: '#f1f5f9', fontVariantNumeric: 'tabular-nums' }}>{maxAthletes}</strong></div>
            <div>Export Excel: <strong style={{ color: canExportExcel ? '#10b981' : '#f43f5e' }}>{canExportExcel ? 'Abilitato' : 'Bloccato'}</strong></div>
            <div>Bunker KMS: <strong style={{ color: canAccessBunker ? '#10b981' : '#f43f5e' }}>{canAccessBunker ? 'Attivo' : 'No'}</strong></div>
            <div>Partizione: <span style={{ color: '#38bdf8' }}>{dataSilo}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierBadgeSwitcher;
