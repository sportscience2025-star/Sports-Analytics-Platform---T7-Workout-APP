/**
 * src/components/layout/TierBadgeSwitcher.tsx
 * Badge interattivo del livello di abbonamento (Tier 1 Consumer, Tier 2 Pro Coach, Tier 3 Elite Club).
 * Include popover rapido per simulazione e collaudo runtime conforme ad ADR-02 e ZONA 3 Schema 5.
 * Conforme a Regola 01 (zero emoji spontanee, solo SVG) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTier } from '../../hooks/useTier';
import { TierLevel } from '../../types';

export const Z_INDEX_TIER_POPOVER = 60;

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

export const TierBadgeSwitcher: React.FC = () => {
  const { tier, setTier, maxAthletes, canExportExcel, canAccessBunker, dataSilo } = useTier();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTier = useCallback((targetTier: TierLevel): void => {
    setTier(targetTier);
    setIsOpen(false);
  }, [setTier]);

  const activeStyle = TIER_STYLES[tier];

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Badge interattivo */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Livello Tier attivo, premi per cambiare simulazione"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          minHeight: '32px',
          padding: '0.2rem 0.65rem',
          backgroundColor: activeStyle.bgColor,
          border: `1px solid ${activeStyle.borderColor}`,
          borderRadius: '999px',
          color: activeStyle.textColor,
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          boxShadow: `0 0 10px ${activeStyle.glowColor}`,
          transition: 'all 150ms ease-in-out',
          outline: 'none'
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: activeStyle.textColor
          }}
        />
        <span>{activeStyle.label} • {activeStyle.sublabel.toUpperCase()}</span>
      </button>

      {/* Popover Switcher per Collaudo e Simulazione */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Pannello simulatore abbonamento Tier"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: '260px',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)',
            padding: '0.75rem',
            zIndex: Z_INDEX_TIER_POPOVER,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Simulatore Abbonamento
          </div>

          {/* Opzioni di switch per collaudo */}
          {(['tier1', 'tier2', 'tier3'] as const).map((tKey) => {
            const config = TIER_STYLES[tKey];
            const isCurrent = tier === tKey;

            return (
              <button
                key={tKey}
                type="button"
                onClick={() => handleSelectTier(tKey)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  marginBottom: '0.3rem',
                  backgroundColor: isCurrent ? config.bgColor : 'rgba(30, 41, 59, 0.5)',
                  border: `1px solid ${isCurrent ? config.borderColor : 'transparent'}`,
                  borderRadius: '8px',
                  color: isCurrent ? config.textColor : '#f1f5f9',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 100ms ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{config.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{config.sublabel}</div>
                </div>

                {isCurrent && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}

          {/* Riepilogo feature abilitate nel Tier corrente */}
          <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.7rem', color: '#94a3b8' }}>
            <div>Max Atleti: <strong style={{ color: '#f1f5f9' }}>{maxAthletes}</strong></div>
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
