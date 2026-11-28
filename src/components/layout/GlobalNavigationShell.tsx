/**
 * src/components/layout/GlobalNavigationShell.tsx
 * Container master della Global Navigation Shell (Apple Dark Cockpit Layout).
 * Integra GlobalHeader fisso, SidebarNav Desktop, BottomNav Mobile e TierUpgradeModal
 * con compensazione responsive del layout principale e zero Layout Shift (CLS).
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppModuleId, TierLevel } from '../../types';
import { useTier } from '../../hooks/useTier';
import { useAthleteContext } from '../../hooks/useAthleteContext';
import { useFavorites } from '../../hooks/useFavorites';
import { GlobalHeader, HEADER_HEIGHT_PX, SAFE_AREA_TOP_CSS } from './GlobalHeader';
import { SidebarNav } from './SidebarNav';
import { BottomNav } from './BottomNav';
import { TierUpgradeModal } from './TierUpgradeModal';
import {
  CanonicalModuleItem,
  computeRosterAlertCount
} from './navigation-config';

export const SHELL_BG_COLOR = '#0b0e14';
export const SHELL_TEXT_COLOR = '#f1f5f9';
export const SHELL_FONT_FAMILY = "'Inter', system-ui, -apple-system, sans-serif";
export const SHELL_MAIN_PADDING_TOP_CSS = `calc(${HEADER_HEIGHT_PX}px + ${SAFE_AREA_TOP_CSS})`;
export const DEFAULT_ACTIVE_MODULE: AppModuleId = 'cockpit';
export const SHELL_MAIN_CLASS = 't7-shell-main';
export const SHELL_MAIN_NAV_CLASS = 't7-shell-main t7-shell-main--with-nav';

export interface GlobalNavigationShellProps {
  /** Contenuto applicativo renderizzato nell'area principale. */
  children?: React.ReactNode;
  /** Callback opzionale per il pulsante profilo nella GlobalHeader. */
  onProfileClick?: () => void;
  /** Stato opzionale del menu profilo per l'attributo `aria-expanded`. */
  isProfileMenuOpen?: boolean;
  /** Abilita SidebarNav desktop e BottomNav mobile adattive (default: true). */
  showNavigation?: boolean;
  /** Modulo attivo in modalita controllata. */
  activeModule?: AppModuleId;
  /** Modulo iniziale in modalita non controllata (default: 'cockpit'). */
  defaultModule?: AppModuleId;
  /** Callback invocata al cambio di modulo consentito. */
  onModuleChange?: (moduleId: AppModuleId) => void;
  /** Override opzionale del contatore preferiti (altrimenti derivato da `useFavorites`). */
  favoritesCount?: number;
  /** Override opzionale del contatore alert atleti (altrimenti derivato dal roster attivo). */
  alertCount?: number;
  /** Callback produzione invocata quando un modulo richiede upgrade con simulatore disattivo. */
  onRequestUpgrade?: (requiredTier: TierLevel, moduleId: AppModuleId) => void;
}

/**
 * Shell principale di navigazione dell'applicazione PWA con header fisso, barre multi-tier e gating modale.
 * @param props Proprieta della shell, controllo navigazione e override opzionali dei contatori
 * @returns Contenitore pagina full-height privo di layout shift e conforme a Tier RBAC
 */
export const GlobalNavigationShell: React.FC<GlobalNavigationShellProps> = ({
  children,
  onProfileClick,
  isProfileMenuOpen,
  showNavigation = true,
  activeModule,
  defaultModule = DEFAULT_ACTIVE_MODULE,
  onModuleChange,
  favoritesCount,
  alertCount,
  onRequestUpgrade
}) => {
  const { isModuleAllowed } = useTier();
  const { roster } = useAthleteContext();
  const { favoritesCount: storedFavoritesCount } = useFavorites();

  const [internalActiveModule, setInternalActiveModule] = useState<AppModuleId>(defaultModule);
  const [lockedModalModule, setLockedModalModule] = useState<CanonicalModuleItem | null>(null);

  const rawActiveModule = activeModule !== undefined ? activeModule : internalActiveModule;
  const isCandidateAllowed = isModuleAllowed(rawActiveModule);
  const effectiveActiveModule: AppModuleId = isCandidateAllowed
    ? rawActiveModule
    : DEFAULT_ACTIVE_MODULE;

  // Allinea lo stato interno non controllato in caso di downgrade runtime del Tier
  useEffect(() => {
    if (activeModule === undefined && !isCandidateAllowed && internalActiveModule !== DEFAULT_ACTIVE_MODULE) {
      setInternalActiveModule(DEFAULT_ACTIVE_MODULE);
    }
  }, [activeModule, isCandidateAllowed, internalActiveModule]);

  const effectiveFavoritesCount = favoritesCount !== undefined
    ? favoritesCount
    : storedFavoritesCount;

  const effectiveAlertCount = useMemo<number>(() => {
    if (alertCount !== undefined) {
      return alertCount;
    }
    return computeRosterAlertCount(roster);
  }, [alertCount, roster]);

  /**
   * Aggiorna il modulo attivo (in modalita non controllata) e notifica l'eventuale listener esterno.
   * @param moduleId Modulo canonico selezionato e gia verificato come consentito
   */
  const handleSelectModule = useCallback((moduleId: AppModuleId): void => {
    if (!isModuleAllowed(moduleId)) {
      return;
    }
    if (activeModule === undefined) {
      setInternalActiveModule(moduleId);
    }
    onModuleChange?.(moduleId);
  }, [activeModule, isModuleAllowed, onModuleChange]);

  /**
   * Apre la modale esplicativa di upgrade quando l'utente interagisce con un modulo bloccato.
   * @param moduleItem Configurazione del modulo bloccato nel Tier corrente
   */
  const handleLockedModuleClick = useCallback((moduleItem: CanonicalModuleItem): void => {
    setLockedModalModule(moduleItem);
  }, []);

  /**
   * Chiude la modale di upgrade azzerando il modulo target.
   */
  const handleCloseUpgradeModal = useCallback((): void => {
    setLockedModalModule(null);
  }, []);

  /**
   * Completa la navigazione verso il modulo appena sbloccato dallo switch simulato di Tier.
   * @param _upgradedTier Nuovo Tier attivato dal simulatore
   * @param unlockedModuleId Modulo precedentemente bloccato ora accessibile
   */
  const handleUpgradeSuccess = useCallback((_upgradedTier: TierLevel, unlockedModuleId: AppModuleId): void => {
    if (activeModule === undefined) {
      setInternalActiveModule(unlockedModuleId);
    }
    onModuleChange?.(unlockedModuleId);
  }, [activeModule, onModuleChange]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: SHELL_BG_COLOR,
        color: SHELL_TEXT_COLOR,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: SHELL_FONT_FAMILY
      }}
    >
      {/* Testata Fissa Superiore */}
      <GlobalHeader
        onProfileClick={onProfileClick}
        isProfileMenuOpen={isProfileMenuOpen}
      />

      {/* Barra Laterale Desktop (>= 1024px) */}
      {showNavigation && (
        <SidebarNav
          activeModule={effectiveActiveModule}
          onSelectModule={handleSelectModule}
          onLockedModuleClick={handleLockedModuleClick}
          alertCount={effectiveAlertCount}
          favoritesCount={effectiveFavoritesCount}
        />
      )}

      {/* Contenitore Principale con compensazione responsive rigida (Zero Layout Shift) */}
      <main
        className={showNavigation ? SHELL_MAIN_NAV_CLASS : SHELL_MAIN_CLASS}
        style={{
          flex: 1,
          paddingTop: SHELL_MAIN_PADDING_TOP_CSS,
          minWidth: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </main>

      {/* Barra Inferiore Mobile (< 1024px) */}
      {showNavigation && (
        <BottomNav
          activeModule={effectiveActiveModule}
          onSelectModule={handleSelectModule}
          onLockedModuleClick={handleLockedModuleClick}
          alertCount={effectiveAlertCount}
          favoritesCount={effectiveFavoritesCount}
        />
      )}

      {/* Modale Upgrade per Moduli Bloccati */}
      {showNavigation && (
        <TierUpgradeModal
          isOpen={lockedModalModule !== null}
          targetModule={lockedModalModule}
          onClose={handleCloseUpgradeModal}
          onUpgradeSuccess={handleUpgradeSuccess}
          onRequestUpgrade={onRequestUpgrade}
        />
      )}
    </div>
  );
};

export default GlobalNavigationShell;
