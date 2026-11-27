/**
 * src/components/layout/GlobalNavigationShell.tsx
 * Container master della Global Navigation Shell (Apple Dark Cockpit Layout).
 * Include GlobalHeader fisso con compensazione safe-area per prevenzione CLS e slot per i contenuti.
 * Conforme a Regola 01 (zero emoji) e Regola 02 (costanti in MAIUSCOLO).
 */

import React from 'react';
import { GlobalHeader, HEADER_HEIGHT_PX, SAFE_AREA_TOP_CSS } from './GlobalHeader';

export const SHELL_BG_COLOR = '#0b0e14';
export const SHELL_TEXT_COLOR = '#f1f5f9';
export const SHELL_FONT_FAMILY = "'Inter', system-ui, -apple-system, sans-serif";
export const SHELL_MAIN_PADDING_TOP_CSS = `calc(${HEADER_HEIGHT_PX}px + ${SAFE_AREA_TOP_CSS})`;

export interface GlobalNavigationShellProps {
  /** Contenuto applicativo renderizzato sotto la barra fissa superiore. */
  children?: React.ReactNode;
  /** Callback opzionale per il pulsante profilo nella GlobalHeader. */
  onProfileClick?: () => void;
  /** Stato opzionale del menu profilo per l'attributo `aria-expanded`. */
  isProfileMenuOpen?: boolean;
}

/**
 * Shell principale di navigazione dell'applicazione PWA con header fisso e safe-area top.
 * @param props Figli React e callback opzionali della testata
 * @returns Contenitore pagina full-height privo di layout shift
 */
export const GlobalNavigationShell: React.FC<GlobalNavigationShellProps> = ({
  children,
  onProfileClick,
  isProfileMenuOpen
}) => {
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

      {/* Contenitore Principale con compensazione padding rigida e safe-area (Zero Layout Shift) */}
      <main
        style={{
          flex: 1,
          paddingTop: SHELL_MAIN_PADDING_TOP_CSS,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default GlobalNavigationShell;
