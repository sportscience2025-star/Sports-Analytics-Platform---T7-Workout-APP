/**
 * src/components/layout/GlobalHeader.tsx
 * Testata fissa superiore Dark Cockpit ispirata al design industriale Apple.
 * ZONA 3 Schema 5: Brand, TierBadgeSwitcher, ContextSelectorDropdown a 2 click, BleStatusPill e menu utente.
 * Conforme a Regola 01 (zero emoji spontanee, solo SVG) e Regola 02 (costanti in MAIUSCOLO).
 */

import React from 'react';
import { ContextSelectorDropdown } from './ContextSelectorDropdown';
import { TierBadgeSwitcher } from './TierBadgeSwitcher';
import { BleStatusPill } from './BleStatusPill';

export const HEADER_HEIGHT_PX = 64;
export const Z_INDEX_HEADER = 50;

export interface GlobalHeaderProps {
  onProfileClick?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onProfileClick }) => {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: `${HEADER_HEIGHT_PX}px`,
        backgroundColor: 'rgba(11, 14, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: Z_INDEX_HEADER,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        boxSizing: 'border-box'
      }}
    >
      {/* Sezione Sinistra: Brand & Tier Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Badge Logo T7 */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ContextSelectorDropdown />
      </div>

      {/* Sezione Destra: Stato Hardware BLE e Azioni Profilo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <BleStatusPill />

        {/* Pulsante Menu Profilo / Impostazioni */}
        <button
          type="button"
          onClick={onProfileClick}
          aria-label="Menu profilo e impostazioni utente"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '999px',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 150ms ease-in-out',
            outline: 'none'
          }}
        >
          {/* Icona Utente SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default GlobalHeader;
