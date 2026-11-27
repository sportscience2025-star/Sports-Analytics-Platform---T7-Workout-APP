/**
 * src/components/layout/GlobalHeader.tsx
 * Testata fissa superiore Dark Cockpit ispirata al design industriale Apple.
 * ZONA 3 Schema 5: Brand, TierBadgeSwitcher, ContextSelectorDropdown a 2 click, BleStatusPill e menu utente.
 * Conforme a Regola 01 (zero emoji spontanee, solo SVG) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useCallback } from 'react';
import { ContextSelectorDropdown } from './ContextSelectorDropdown';
import { TierBadgeSwitcher } from './TierBadgeSwitcher';
import { BleStatusPill } from './BleStatusPill';
import { isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';

export const HEADER_HEIGHT_PX = 64;
export const Z_INDEX_HEADER = 50;
export const HEADER_BLUR_PX = 20;
export const LOGO_BADGE_SIZE_PX = 32;
export const LOGO_BADGE_RADIUS_PX = 8;
export const PROFILE_BUTTON_SIZE_PX = 36;
export const PROFILE_ICON_SIZE_PX = 18;
export const PROFILE_TRANSITION_MS = 150;
export const SAFE_AREA_TOP_CSS = 'env(safe-area-inset-top, 0px)';
export const HEADER_GLASS_BG = 'rgba(11, 14, 20, 0.85)';
export const PROFILE_BUTTON_BG = 'rgba(30, 41, 59, 0.6)';
export const HEADER_FOCUS_OUTLINE = '2px solid #38bdf8';
export const HEADER_FOCUS_SHADOW = '0 0 0 3px rgba(56, 189, 248, 0.35)';
export const PROFILE_BUTTON_LABEL = 'Menu profilo e impostazioni utente';

/**
 * Gestore di ripiego no-op quando il consumer non fornisce `onProfileClick`.
 */
const DEFAULT_PROFILE_CLICK = (): void => {};

export interface GlobalHeaderProps {
  /** Callback opzionale invocata al click sul pulsante profilo utente. */
  onProfileClick?: () => void;
  /** Stato opzionale di apertura del menu profilo associato per `aria-expanded`. */
  isProfileMenuOpen?: boolean;
}

/**
 * Barra fissa superiore della Global Navigation Shell con supporto safe-area e wrap mobile.
 * @param props Proprieta della testata (`onProfileClick` e `isProfileMenuOpen` opzionali)
 * @returns Elemento `<header>` fisso ad alto contrasto con selettore di contesto e stato hardware
 */
export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  onProfileClick = DEFAULT_PROFILE_CLICK,
  isProfileMenuOpen
}) => {
  const [isProfileFocused, setIsProfileFocused] = useState<boolean>(false);

  /**
   * Inoltra l'evento di attivazione del pulsante profilo al callback configurato.
   */
  const handleProfileButtonClick = useCallback((): void => {
    onProfileClick();
  }, [onProfileClick]);

  /**
   * Attiva l'anello di focus accessibile solo su navigazione da tastiera (`:focus-visible`).
   * @param event Evento focus React del pulsante profilo
   */
  const handleProfileFocus = useCallback((event: React.FocusEvent<HTMLButtonElement>): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setIsProfileFocused(true);
    }
  }, []);

  /**
   * Disattiva l'anello di focus al blur del pulsante profilo.
   */
  const handleProfileBlur = useCallback((): void => {
    setIsProfileFocused(false);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        minHeight: `calc(${HEADER_HEIGHT_PX}px + ${SAFE_AREA_TOP_CSS})`,
        backgroundColor: HEADER_GLASS_BG,
        backdropFilter: `blur(${HEADER_BLUR_PX}px)`,
        WebkitBackdropFilter: `blur(${HEADER_BLUR_PX}px)`,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: Z_INDEX_HEADER,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem 0.75rem',
        paddingTop: `calc(0.375rem + ${SAFE_AREA_TOP_CSS})`,
        paddingBottom: '0.375rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}
    >
      {/* Sezione Sinistra: Brand & Tier Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Badge Logo T7 */}
          <div
            style={{
              width: `${LOGO_BADGE_SIZE_PX}px`,
              height: `${LOGO_BADGE_SIZE_PX}px`,
              borderRadius: `${LOGO_BADGE_RADIUS_PX}px`,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: '#ffffff',
              boxShadow: '0 0 12px rgba(2, 132, 199, 0.4)'
            }}
          >
            T7
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '0.04em',
                lineHeight: 1.1
              }}
            >
              WORKOUT
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#38bdf8',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}
            >
              Cockpit
            </span>
          </div>
        </div>

        {/* Switcher Livello Tier */}
        <TierBadgeSwitcher />
      </div>

      {/* Sezione Centrale: Selettore Permanente Atleta/Squadra a 2 Click */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, maxWidth: '100%' }}>
        <ContextSelectorDropdown />
      </div>

      {/* Sezione Destra: Stato Hardware BLE e Azioni Profilo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
        <BleStatusPill />

        {/* Pulsante Menu Profilo / Impostazioni */}
        <button
          type="button"
          onClick={handleProfileButtonClick}
          onFocus={handleProfileFocus}
          onBlur={handleProfileBlur}
          title={PROFILE_BUTTON_LABEL}
          aria-label={PROFILE_BUTTON_LABEL}
          aria-expanded={isProfileMenuOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${PROFILE_BUTTON_SIZE_PX}px`,
            height: `${PROFILE_BUTTON_SIZE_PX}px`,
            borderRadius: '999px',
            backgroundColor: PROFILE_BUTTON_BG,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: `all ${PROFILE_TRANSITION_MS}ms ease-in-out`,
            ...(isProfileFocused
              ? {
                  outline: HEADER_FOCUS_OUTLINE,
                  outlineOffset: '2px',
                  boxShadow: HEADER_FOCUS_SHADOW
                }
              : {})
          }}
        >
          {/* Icona Utente SVG */}
          <svg
            width={PROFILE_ICON_SIZE_PX}
            height={PROFILE_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default GlobalHeader;
