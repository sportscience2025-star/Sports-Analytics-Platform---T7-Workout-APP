/**
 * src/components/layout/BottomNav.tsx
 * Barra di navigazione inferiore Mobile PWA (< 1024px) touch-friendly a 5 tab primarie + menu "Altro".
 * Rispetta tap target >= 44x44px, safe-area inferiore iOS/Android e chiusura sheet su Escape/desktop resize.
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppModuleId } from '../../types';
import { useTier } from '../../hooks/useTier';
import { useDismissiblePopover, isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import { TIER_STYLES } from './TierBadgeSwitcher';
import {
  CANONICAL_MODULES,
  CanonicalModuleItem,
  BOTTOM_NAV_HEIGHT_PX,
  DESKTOP_MEDIA_QUERY,
  Z_INDEX_NAV,
  Z_INDEX_BOTTOM_SHEET,
  MIN_TOUCH_TARGET_PX,
  MOBILE_TOUCH_HEIGHT_PX,
  MOBILE_PRIMARY_TAB_COUNT,
  NAV_BLUR_PX,
  NAV_TRANSITION_MS,
  NAV_GLASS_BG,
  NAV_SHEET_GLASS_BG,
  NAV_BORDER_SUBTLE,
  NAV_ACTIVE_BG,
  NAV_ACTIVE_COLOR,
  NAV_TEXT_PRIMARY,
  NAV_TEXT_SECONDARY,
  NAV_LOCKED_COLOR,
  NAV_ALERT_BG,
  NAV_BADGE_BG,
  SAFE_AREA_BOTTOM_CSS,
  OVERFLOW_BUTTON_ID,
  OVERFLOW_SHEET_ID,
  ModuleNavIcon,
  LockNavIcon,
  MoreNavIcon,
  formatBadgeCount,
  getModuleBadgeCount,
  getKeyboardFocusStyle
} from './navigation-config';

export const BOTTOM_NAV_CLASS_NAME = 't7-bottom-nav';
export const BOTTOM_SHEET_RADIUS_PX = 16;

export interface BottomNavProps {
  /** Identificativo del modulo canonico attualmente attivo. */
  activeModule: AppModuleId;
  /** Callback invocata alla selezione di un modulo consentito dal Tier attivo. */
  onSelectModule: (moduleId: AppModuleId) => void;
  /** Callback invocata al tap su un modulo bloccato dal Tier gating. */
  onLockedModuleClick: (moduleItem: CanonicalModuleItem) => void;
  /** Conteggio alert sportivi del roster attivo (mostrato su Cockpit). */
  alertCount?: number;
  /** Conteggio esercizi preferiti salvati (mostrato su Preferiti). */
  favoritesCount?: number;
  /** Consente di renderizzare lo sheet "Altro" aperto al mount per test statici e snapshot. */
  defaultMoreOpen?: boolean;
}

/**
 * Barra tab inferiore Mobile con 5 azioni principali, menu "Altro" ed elevata ergonomia touch.
 * @param props Stato attivo, gestori di navigazione/gating e contatori dinamici
 * @returns Elemento `<nav>` ancorato al fondo con safe-area e sheet espandibile
 */
export const BottomNav: React.FC<BottomNavProps> = ({
  activeModule,
  onSelectModule,
  onLockedModuleClick,
  alertCount = 0,
  favoritesCount = 0,
  defaultMoreOpen = false
}) => {
  const { isModuleAllowed } = useTier();
  const [focusedControlId, setFocusedControlId] = useState<string | null>(null);

  const handleMoreClose = useCallback((): void => {
    setFocusedControlId(null);
  }, []);

  const {
    isOpen: isMoreOpen,
    toggle: toggleMore,
    close: closeMore,
    containerRef,
    triggerRef
  } = useDismissiblePopover({
    initialOpen: defaultMoreOpen,
    onClose: handleMoreClose
  });

  // Chiude automaticamente lo sheet mobile se il viewport viene ridimensionato a desktop (>= 1024px)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleViewportChange = (event: MediaQueryListEvent): void => {
      if (event.matches) {
        closeMore(false);
      }
    };
    mediaQuery.addEventListener('change', handleViewportChange);
    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, [closeMore]);

  const primaryModules = useMemo<readonly CanonicalModuleItem[]>(() => {
    return CANONICAL_MODULES.filter((mod) => mod.isMobilePrimary).slice(0, MOBILE_PRIMARY_TAB_COUNT);
  }, []);

  const overflowModules = useMemo<readonly CanonicalModuleItem[]>(() => {
    const primaryIds = new Set(primaryModules.map((m) => m.id));
    return CANONICAL_MODULES.filter((mod) => !primaryIds.has(mod.id));
  }, [primaryModules]);

  const isOverflowActive = useMemo<boolean>(() => {
    return overflowModules.some((mod) => mod.id === activeModule);
  }, [overflowModules, activeModule]);

  const overflowBadgeTotal = useMemo<number>(() => {
    let total = 0;
    for (const mod of overflowModules) {
      total += getModuleBadgeCount(mod.id, alertCount, favoritesCount);
    }
    return total;
  }, [overflowModules, alertCount, favoritesCount]);

  /**
   * Gestisce il tap su una scheda primaria o di overflow, chiudendo lo sheet prima di eventuali modali.
   * @param item Modulo canonico toccato dall'utente
   * @param fromSheet Indica se la selezione proviene dallo sheet espandibile "Altro"
   */
  const handleSelectItem = useCallback((item: CanonicalModuleItem, fromSheet: boolean): void => {
    if (fromSheet) {
      closeMore(false);
    }
    if (!isModuleAllowed(item.id)) {
      onLockedModuleClick(item);
      return;
    }
    onSelectModule(item.id);
  }, [closeMore, isModuleAllowed, onLockedModuleClick, onSelectModule]);

  const handleControlFocus = useCallback((
    controlId: string,
    event: React.FocusEvent<HTMLButtonElement>
  ): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setFocusedControlId(controlId);
    }
  }, []);

  const handleControlBlur = useCallback((): void => {
    setFocusedControlId(null);
  }, []);

  return (
    <div ref={containerRef} className={BOTTOM_NAV_CLASS_NAME}>
      {/* Sheet Moduli Aggiuntivi ("Altro") */}
      {isMoreOpen && (
        <div
          id={OVERFLOW_SHEET_ID}
          role="dialog"
          aria-label="Altri moduli applicativi"
          style={{
            position: 'fixed',
            bottom: `calc(${BOTTOM_NAV_HEIGHT_PX}px + ${SAFE_AREA_BOTTOM_CSS} + 8px)`,
            right: '12px',
            left: '12px',
            maxWidth: '420px',
            marginLeft: 'auto',
            backgroundColor: NAV_SHEET_GLASS_BG,
            backdropFilter: `blur(${NAV_BLUR_PX}px)`,
            WebkitBackdropFilter: `blur(${NAV_BLUR_PX}px)`,
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: `${BOTTOM_SHEET_RADIUS_PX}px`,
            boxShadow: '0 -12px 32px rgba(0, 0, 0, 0.65)',
            padding: '0.65rem',
            zIndex: Z_INDEX_BOTTOM_SHEET,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: NAV_TEXT_SECONDARY,
              padding: '0.2rem 0.5rem'
            }}
          >
            Altri Moduli
          </div>

          {overflowModules.map((mod) => {
            const allowed = isModuleAllowed(mod.id);
            const isActive = allowed && activeModule === mod.id;
            const requiredTierStyle = TIER_STYLES[mod.requiredTier];
            const badgeCount = getModuleBadgeCount(mod.id, alertCount, favoritesCount);

            return (
              <button
                key={`more-${mod.id}`}
                type="button"
                onClick={() => handleSelectItem(mod, true)}
                onFocus={(e) => handleControlFocus(`more-${mod.id}`, e)}
                onBlur={handleControlBlur}
                aria-current={isActive ? 'page' : undefined}
                aria-label={
                  allowed
                    ? mod.label
                    : `${mod.label} — Richiede ${requiredTierStyle.label}`
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  width: '100%',
                  minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                  padding: '0.55rem 0.75rem',
                  borderRadius: '10px',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                  backgroundColor: isActive ? NAV_ACTIVE_BG : 'rgba(30, 41, 59, 0.45)',
                  color: !allowed ? NAV_LOCKED_COLOR : isActive ? NAV_ACTIVE_COLOR : NAV_TEXT_PRIMARY,
                  cursor: 'pointer',
                  textAlign: 'left',
                  ...getKeyboardFocusStyle(focusedControlId === `more-${mod.id}`)
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                  <ModuleNavIcon moduleId={mod.id} />
                  <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 500, color: NAV_TEXT_PRIMARY }}>
                    {mod.label}
                  </span>
                </span>

                {!allowed ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '999px',
                      backgroundColor: requiredTierStyle.bgColor,
                      border: `1px solid ${requiredTierStyle.borderColor}`,
                      color: requiredTierStyle.textColor,
                      flexShrink: 0
                    }}
                  >
                    <LockNavIcon />
                    <span>{requiredTierStyle.label}</span>
                  </span>
                ) : badgeCount > 0 ? (
                  <span
                    aria-hidden="true"
                    style={{
                      minWidth: '22px',
                      height: '20px',
                      padding: '0 0.4rem',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: NAV_BADGE_BG,
                      color: NAV_ACTIVE_COLOR
                    }}
                  >
                    {formatBadgeCount(badgeCount)}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* Barra Inferiore Fissa 5 Tab + "Altro" */}
      <nav
        aria-label="Navigazione mobile principale"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          minHeight: `calc(${BOTTOM_NAV_HEIGHT_PX}px + ${SAFE_AREA_BOTTOM_CSS})`,
          paddingTop: '0.25rem',
          paddingBottom: `max(0.25rem, ${SAFE_AREA_BOTTOM_CSS})`,
          paddingLeft: '0.25rem',
          paddingRight: '0.25rem',
          backgroundColor: NAV_GLASS_BG,
          backdropFilter: `blur(${NAV_BLUR_PX}px)`,
          WebkitBackdropFilter: `blur(${NAV_BLUR_PX}px)`,
          borderTop: `1px solid ${NAV_BORDER_SUBTLE}`,
          zIndex: Z_INDEX_NAV,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          boxSizing: 'border-box',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.45)'
        }}
      >
        {primaryModules.map((mod) => {
          const allowed = isModuleAllowed(mod.id);
          const isActive = allowed && activeModule === mod.id;
          const badgeCount = getModuleBadgeCount(mod.id, alertCount, favoritesCount);
          const isAlertModule = mod.id === 'cockpit';

          return (
            <button
              key={`bottom-${mod.id}`}
              type="button"
              onClick={() => handleSelectItem(mod, false)}
              onFocus={(e) => handleControlFocus(`bottom-${mod.id}`, e)}
              onBlur={handleControlBlur}
              aria-current={isActive ? 'page' : undefined}
              aria-label={
                allowed
                  ? badgeCount > 0
                    ? `${mod.label} (${badgeCount})`
                    : mod.label
                  : `${mod.label} — Richiede ${TIER_STYLES[mod.requiredTier].label}`
              }
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                flex: 1,
                minWidth: `${MIN_TOUCH_TARGET_PX}px`,
                minHeight: `${MOBILE_TOUCH_HEIGHT_PX}px`,
                padding: '0.25rem 0.2rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? NAV_ACTIVE_BG : 'transparent',
                color: !allowed
                  ? NAV_LOCKED_COLOR
                  : isActive
                  ? NAV_ACTIVE_COLOR
                  : NAV_TEXT_SECONDARY,
                cursor: 'pointer',
                transition: `all ${NAV_TRANSITION_MS}ms ease`,
                ...getKeyboardFocusStyle(focusedControlId === `bottom-${mod.id}`)
              }}
            >
              <ModuleNavIcon moduleId={mod.id} />
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}
              >
                {mod.shortLabel}
              </span>

              {badgeCount > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '14%',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    borderRadius: '999px',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isAlertModule ? NAV_ALERT_BG : NAV_ACTIVE_COLOR,
                    color: isAlertModule ? '#ffffff' : '#090d16'
                  }}
                >
                  {formatBadgeCount(badgeCount)}
                </span>
              )}
            </button>
          );
        })}

        {/* Pulsante Overflow "Altro" */}
        <button
          ref={triggerRef}
          id={OVERFLOW_BUTTON_ID}
          type="button"
          onClick={toggleMore}
          onFocus={(e) => handleControlFocus(OVERFLOW_BUTTON_ID, e)}
          onBlur={handleControlBlur}
          aria-haspopup="dialog"
          aria-expanded={isMoreOpen}
          aria-controls={OVERFLOW_SHEET_ID}
          aria-label={isOverflowActive ? 'Altro (sezione attiva)' : 'Altro'}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            flex: 1,
            minWidth: `${MIN_TOUCH_TARGET_PX}px`,
            minHeight: `${MOBILE_TOUCH_HEIGHT_PX}px`,
            padding: '0.25rem 0.2rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: isOverflowActive || isMoreOpen ? NAV_ACTIVE_BG : 'transparent',
            color: isOverflowActive || isMoreOpen ? NAV_ACTIVE_COLOR : NAV_TEXT_SECONDARY,
            cursor: 'pointer',
            transition: `all ${NAV_TRANSITION_MS}ms ease`,
            ...getKeyboardFocusStyle(focusedControlId === OVERFLOW_BUTTON_ID)
          }}
        >
          <MoreNavIcon />
          <span style={{ fontSize: '0.65rem', fontWeight: isOverflowActive ? 700 : 500, lineHeight: 1.1 }}>
            Altro
          </span>
          {overflowBadgeTotal > 0 && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '4px',
                right: '14%',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                borderRadius: '999px',
                fontSize: '0.62rem',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: NAV_ACTIVE_COLOR,
                color: '#090d16'
              }}
            >
              {formatBadgeCount(overflowBadgeTotal)}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};

export default BottomNav;
