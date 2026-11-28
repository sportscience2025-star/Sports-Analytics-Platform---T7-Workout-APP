/**
 * src/components/layout/TierUpgradeModal.tsx
 * Modale accessibile WAI-ARIA per la gestione del Feature Gating su moduli di Tier superiore.
 * Implementa focus trap Tab/Shift+Tab, ripristino del focus al trigger, blocco scroll body,
 * chiusura su Escape/backdrop e consapevolezza di `simulatorEnabled`.
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useEffect, useRef, useState, useCallback, useId } from 'react';
import { AppModuleId, TierLevel } from '../../types';
import { useTier } from '../../hooks/useTier';
import { isKeyboardFocusTarget, shouldDismissOnKey } from '../../hooks/useDismissiblePopover';
import { TIER_STYLES } from './TierBadgeSwitcher';
import {
  CanonicalModuleItem,
  Z_INDEX_MODAL,
  MIN_TOUCH_TARGET_PX,
  NAV_BLUR_PX,
  NAV_TEXT_PRIMARY,
  NAV_TEXT_SECONDARY,
  LockNavIcon,
  getKeyboardFocusStyle
} from './navigation-config';

export const MODAL_BACKDROP_BG = 'rgba(8, 12, 22, 0.78)';
export const MODAL_CARD_BG = 'rgba(15, 23, 42, 0.94)';
export const MODAL_MAX_WIDTH_PX = 460;
export const MODAL_RADIUS_PX = 16;
export const TAB_KEY = 'Tab';
const FOCUSABLE_ELEMENTS_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface TierUpgradeModalProps {
  /** Controlla la visibilita della modale di upgrade. */
  isOpen: boolean;
  /** Modulo bloccato che ha attivato la richiesta di upgrade. */
  targetModule: CanonicalModuleItem | null;
  /** Callback di chiusura modale. */
  onClose: () => void;
  /** Callback invocata dopo uno switch simulato riuscito verso il Tier richiesto. */
  onUpgradeSuccess?: (upgradedTier: TierLevel, moduleId: AppModuleId) => void;
  /** Callback produzione invocata quando `simulatorEnabled` e false (flusso checkout JWT). */
  onRequestUpgrade?: (requiredTier: TierLevel, moduleId: AppModuleId) => void;
}

/**
 * Modale bloccante di Feature Gating che illustra i vantaggi del Tier superiore e abilita l'upgrade.
 * @param props Stato apertura, modulo target e callback di chiusura o upgrade
 * @returns Dialog accessibile con glassmorphism o null quando chiuso
 */
export const TierUpgradeModal: React.FC<TierUpgradeModalProps> = ({
  isOpen,
  targetModule,
  onClose,
  onUpgradeSuccess,
  onRequestUpgrade
}) => {
  const { simulatorEnabled, setTier } = useTier();
  const [focusedButtonId, setFocusedButtonId] = useState<'close' | 'cancel' | 'cta' | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const descriptionId = useId();

  // Gestisce salvataggio/ripristino focus, blocco scroll body, Escape e focus trap da tastiera
  useEffect(() => {
    if (!isOpen || !targetModule || typeof document === 'undefined') {
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (shouldDismissOnKey(event.key)) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === TAB_KEY && modalRef.current) {
        const focusables = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
        );
        if (focusables.length === 0) {
          return;
        }
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
        } else if (!event.shiftKey && document.activeElement === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocusRef.current && previousFocusRef.current.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, targetModule, onClose]);

  const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handlePrimaryAction = useCallback((): void => {
    if (!targetModule) {
      return;
    }
    const requiredTier = targetModule.requiredTier;
    if (simulatorEnabled) {
      setTier(requiredTier);
      onUpgradeSuccess?.(requiredTier, targetModule.id);
    } else {
      onRequestUpgrade?.(requiredTier, targetModule.id);
    }
    onClose();
  }, [targetModule, simulatorEnabled, setTier, onUpgradeSuccess, onRequestUpgrade, onClose]);

  const handleBtnFocus = useCallback((
    id: 'close' | 'cancel' | 'cta',
    event: React.FocusEvent<HTMLButtonElement>
  ): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setFocusedButtonId(id);
    }
  }, []);

  const handleBtnBlur = useCallback((): void => {
    setFocusedButtonId(null);
  }, []);

  if (!isOpen || !targetModule) {
    return null;
  }

  const tierStyle = TIER_STYLES[targetModule.requiredTier];
  const ctaLabel = simulatorEnabled
    ? `Simula Upgrade a ${tierStyle.label}`
    : `Richiedi Upgrade a ${tierStyle.label}`;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z_INDEX_MODAL,
        backgroundColor: MODAL_BACKDROP_BG,
        backdropFilter: `blur(${NAV_BLUR_PX}px)`,
        WebkitBackdropFilter: `blur(${NAV_BLUR_PX}px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box'
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        style={{
          width: '100%',
          maxWidth: `${MODAL_MAX_WIDTH_PX}px`,
          backgroundColor: MODAL_CARD_BG,
          border: `1px solid ${tierStyle.borderColor}`,
          borderRadius: `${MODAL_RADIUS_PX}px`,
          boxShadow: `0 24px 48px rgba(0, 0, 0, 0.75), 0 0 28px ${tierStyle.glowColor}`,
          padding: '1.5rem',
          color: NAV_TEXT_PRIMARY,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                alignSelf: 'flex-start',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: tierStyle.bgColor,
                border: `1px solid ${tierStyle.borderColor}`,
                color: tierStyle.textColor
              }}
            >
              <LockNavIcon />
              <span>RICHIEDE {tierStyle.label} • {tierStyle.sublabel.toUpperCase()}</span>
            </span>

            <h2 id={titleId} style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: NAV_TEXT_PRIMARY }}>
              Sblocca {targetModule.label}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            onFocus={(e) => handleBtnFocus('close', e)}
            onBlur={handleBtnBlur}
            aria-label="Chiudi finestra upgrade"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: `${MIN_TOUCH_TARGET_PX}px`,
              minHeight: `${MIN_TOUCH_TARGET_PX}px`,
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              color: NAV_TEXT_SECONDARY,
              cursor: 'pointer',
              flexShrink: 0,
              ...getKeyboardFocusStyle(focusedButtonId === 'close')
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p id={descriptionId} style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: NAV_TEXT_SECONDARY, lineHeight: 1.5 }}>
          {targetModule.description}
        </p>

        <div
          style={{
            backgroundColor: 'rgba(11, 14, 20, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '0.9rem 1rem',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: tierStyle.textColor, marginBottom: '0.5rem' }}>
            Funzionalita incluse con l'upgrade
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: NAV_TEXT_PRIMARY }}>
            {targetModule.upgradeBenefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onClose}
            onFocus={(e) => handleBtnFocus('cancel', e)}
            onBlur={handleBtnBlur}
            style={{
              minHeight: `${MIN_TOUCH_TARGET_PX}px`,
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backgroundColor: 'transparent',
              color: NAV_TEXT_SECONDARY,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              ...getKeyboardFocusStyle(focusedButtonId === 'cancel')
            }}
          >
            Annulla
          </button>

          <button
            type="button"
            onClick={handlePrimaryAction}
            onFocus={(e) => handleBtnFocus('cta', e)}
            onBlur={handleBtnBlur}
            style={{
              minHeight: `${MIN_TOUCH_TARGET_PX}px`,
              padding: '0.55rem 1.15rem',
              borderRadius: '10px',
              border: `1px solid ${tierStyle.borderColor}`,
              backgroundColor: tierStyle.bgColor,
              color: tierStyle.textColor,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              ...getKeyboardFocusStyle(focusedButtonId === 'cta')
            }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TierUpgradeModal;
