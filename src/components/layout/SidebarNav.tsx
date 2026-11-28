/**
 * src/components/layout/SidebarNav.tsx
 * Barra laterale fissa Desktop (>= 1024px) adattiva ai permessi del Tier attivo.
 * Mostra i 7 moduli canonici, indicatori di stato attivo, badge contatori dinamici
 * e lucchetti per moduli bloccati con apertura della modale di upgrade.
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useCallback } from 'react';
import { AppModuleId } from '../../types';
import { useTier } from '../../hooks/useTier';
import { isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import { HEADER_HEIGHT_PX, SAFE_AREA_TOP_CSS } from './GlobalHeader';
import { TIER_STYLES } from './TierBadgeSwitcher';
import {
  CANONICAL_MODULES,
  CanonicalModuleItem,
  SIDEBAR_WIDTH_PX,
  Z_INDEX_NAV,
  MIN_TOUCH_TARGET_PX,
  NAV_BLUR_PX,
  NAV_TRANSITION_MS,
  NAV_GLASS_BG,
  NAV_BORDER_SUBTLE,
  NAV_ACTIVE_BG,
  NAV_ACTIVE_COLOR,
  NAV_TEXT_PRIMARY,
  NAV_TEXT_SECONDARY,
  NAV_LOCKED_COLOR,
  NAV_ALERT_BG,
  NAV_BADGE_BG,
  ModuleNavIcon,
  LockNavIcon,
  formatBadgeCount,
  getModuleBadgeCount,
  getKeyboardFocusStyle
} from './navigation-config';

export const SIDEBAR_PADDING_Y_PX = 16;
export const SIDEBAR_PADDING_X_PX = 12;
export const SIDEBAR_ITEM_RADIUS_PX = 10;
export const SIDEBAR_CLASS_NAME = 't7-sidebar-nav';

export interface SidebarNavProps {
  /** Identificativo del modulo canonico attualmente attivo. */
  activeModule: AppModuleId;
  /** Callback invocata alla selezione di un modulo consentito dal Tier attivo. */
  onSelectModule: (moduleId: AppModuleId) => void;
  /** Callback invocata quando l'utente clicca su un modulo bloccato dal Tier gating. */
  onLockedModuleClick: (moduleItem: CanonicalModuleItem) => void;
  /** Conteggio alert sportivi del roster attivo (mostrato su Cockpit). */
  alertCount?: number;
  /** Conteggio esercizi preferiti salvati (mostrato su Preferiti). */
  favoritesCount?: number;
}

/**
 * Barra laterale adattiva Desktop con feature gating deterministico per Tier 1/2/3.
 * @param props Modulo attivo, gestori di selezione/blocco e contatori dinamici
 * @returns Elemento `<aside>` fisso a sinistra sotto la testata globale
 */
export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeModule,
  onSelectModule,
  onLockedModuleClick,
  alertCount = 0,
  favoritesCount = 0
}) => {
  const { isModuleAllowed } = useTier();
  const [focusedModuleId, setFocusedModuleId] = useState<AppModuleId | null>(null);

  /**
   * Instrada il click sul modulo verificando il gating deterministico del Tier corrente.
   * @param item Configurazione del modulo canonico selezionato
   */
  const handleItemClick = useCallback((item: CanonicalModuleItem): void => {
    if (!isModuleAllowed(item.id)) {
      onLockedModuleClick(item);
      return;
    }
    onSelectModule(item.id);
  }, [isModuleAllowed, onLockedModuleClick, onSelectModule]);

  /**
   * Attiva il focus ring visibile esclusivamente su navigazione da tastiera.
   * @param moduleId Identificativo del modulo focalizzato
   * @param event Evento focus React
   */
  const handleItemFocus = useCallback((
    moduleId: AppModuleId,
    event: React.FocusEvent<HTMLButtonElement>
  ): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setFocusedModuleId(moduleId);
    }
  }, []);

  /**
   * Ripulisce lo stato di focus ring al blur del pulsante modulo.
   */
  const handleItemBlur = useCallback((): void => {
    setFocusedModuleId(null);
  }, []);

  return (
    <aside
      className={SIDEBAR_CLASS_NAME}
      aria-label="Barra laterale moduli T7"
      style={{
        position: 'fixed',
        top: `calc(${HEADER_HEIGHT_PX}px + ${SAFE_AREA_TOP_CSS})`,
        bottom: 0,
        left: 0,
        width: `${SIDEBAR_WIDTH_PX}px`,
        backgroundColor: NAV_GLASS_BG,
        backdropFilter: `blur(${NAV_BLUR_PX}px)`,
        WebkitBackdropFilter: `blur(${NAV_BLUR_PX}px)`,
        borderRight: `1px solid ${NAV_BORDER_SUBTLE}`,
        zIndex: Z_INDEX_NAV,
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: `${SIDEBAR_PADDING_Y_PX}px ${SIDEBAR_PADDING_X_PX}px`,
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <nav aria-label="Navigazione moduli desktop" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: NAV_TEXT_SECONDARY,
            padding: '0.25rem 0.65rem 0.45rem'
          }}
        >
          Moduli Piattaforma
        </div>

        {CANONICAL_MODULES.map((mod) => {
          const allowed = isModuleAllowed(mod.id);
          const isActive = allowed && activeModule === mod.id;
          const badgeCount = getModuleBadgeCount(mod.id, alertCount, favoritesCount);
          const requiredTierStyle = TIER_STYLES[mod.requiredTier];
          const isAlertModule = mod.id === 'cockpit';

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => handleItemClick(mod)}
              onFocus={(e) => handleItemFocus(mod.id, e)}
              onBlur={handleItemBlur}
              aria-current={isActive ? 'page' : undefined}
              aria-label={
                allowed
                  ? badgeCount > 0
                    ? `${mod.label} (${badgeCount})`
                    : mod.label
                  : `${mod.label} — Richiede ${requiredTierStyle.label}`
              }
              title={mod.description}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.65rem',
                width: '100%',
                minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                padding: '0.55rem 0.7rem',
                borderRadius: `${SIDEBAR_ITEM_RADIUS_PX}px`,
                border: isActive
                  ? '1px solid rgba(56, 189, 248, 0.35)'
                  : '1px solid transparent',
                backgroundColor: isActive ? NAV_ACTIVE_BG : 'transparent',
                color: !allowed
                  ? NAV_LOCKED_COLOR
                  : isActive
                  ? NAV_ACTIVE_COLOR
                  : NAV_TEXT_PRIMARY,
                cursor: 'pointer',
                textAlign: 'left',
                transition: `all ${NAV_TRANSITION_MS}ms ease-in-out`,
                opacity: allowed ? 1 : 0.78,
                ...getKeyboardFocusStyle(focusedModuleId === mod.id)
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                <span style={{ flexShrink: 0, display: 'inline-flex' }}>
                  <ModuleNavIcon moduleId={mod.id} />
                </span>
                <span
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: isActive ? 600 : 500,
                    lineHeight: 1.25,
                    color: !allowed ? NAV_TEXT_SECONDARY : isActive ? NAV_TEXT_PRIMARY : NAV_TEXT_PRIMARY
                  }}
                >
                  {mod.shortLabel}
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
                    padding: '0.15rem 0.4rem',
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '22px',
                    height: '20px',
                    padding: '0 0.4rem',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    backgroundColor: isAlertModule ? NAV_ALERT_BG : NAV_BADGE_BG,
                    color: isAlertModule ? '#ffffff' : NAV_ACTIVE_COLOR,
                    flexShrink: 0
                  }}
                >
                  {formatBadgeCount(badgeCount)}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarNav;
