/**
 * src/components/layout/GlobalNavigationShell.tsx
 * Container master della Global Navigation Shell (Apple Dark Cockpit Layout).
 * Include GlobalHeader fisso a 64px, compensazione padding per prevenzione CLS e slot per i contenuti.
 * Conforme a Regola 01 (zero emoji) e Regola 02 (costanti in MAIUSCOLO).
 */

import React from 'react';
import { GlobalHeader, HEADER_HEIGHT_PX } from './GlobalHeader';

export interface GlobalNavigationShellProps {
  children: React.ReactNode;
  onProfileClick?: () => void;
}

export const GlobalNavigationShell: React.FC<GlobalNavigationShellProps> = ({
  children,
  onProfileClick
}) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0e14',
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Testata Fissa Superiore */}
      <GlobalHeader onProfileClick={onProfileClick} />

      {/* Contenitore Principale con compensazione padding rigida (Zero Layout Shift) */}
      <main
        style={{
          flex: 1,
          paddingTop: `${HEADER_HEIGHT_PX}px`,
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
