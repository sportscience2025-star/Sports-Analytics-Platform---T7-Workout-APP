/**
 * src/App.tsx
 * Contenitore principale dell'applicazione React per T7 Sports Analytics Platform.
 * Gestisce la navigazione tra i moduli di analisi biomeccanica e consultazione scientifica.
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola R3: Modularità e separazione delle responsabilità.
 * - Regola R1: Zero any, tipizzazione TypeScript strict.
 */

import React, { useState } from 'react';
import { VBTAnalysisView } from './components/vbt/VBTAnalysisView';
import { ExerciseCatalogView } from './components/exercises/ExerciseCatalogView';

export type ActiveTab = 'vbt' | 'catalog';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('vbt');

  return (
    <div
      className="t7-app-root"
      style={{
        minHeight: '100vh',
        background: '#080c16',
        color: '#f8fafc',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Header Professionale */}
      <header
        style={{
          borderBottom: '1px solid #1e293b',
          background: '#0b1120',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          {/* Logo e Titolo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                color: '#ffffff',
                letterSpacing: '-0.5px'
              }}
            >
              T7
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: '-0.025em',
                  color: '#ffffff'
                }}
              >
                T7 Sports Analytics Platform
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                Biomeccanica Clinica, VBT &amp; Periodizzazione Evidence-Based
              </span>
            </div>
          </div>

          {/* Navigazione Schede */}
          <nav
            aria-label="Navigazione moduli principali"
            style={{
              display: 'flex',
              background: '#1e293b',
              padding: '0.25rem',
              borderRadius: '0.5rem',
              gap: '0.25rem'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('vbt')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'vbt' ? 600 : 500,
                background: activeTab === 'vbt' ? '#6366f1' : 'transparent',
                color: activeTab === 'vbt' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Analisi VBT &amp; Biomeccanica
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'catalog' ? 600 : 500,
                background: activeTab === 'catalog' ? '#6366f1' : 'transparent',
                color: activeTab === 'catalog' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Catalogo Esercizi Scientifico
            </button>
          </nav>
        </div>
      </header>

      {/* Contenuto Principale */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem 1.5rem' }}>
        {activeTab === 'vbt' && <VBTAnalysisView />}
        {activeTab === 'catalog' && <ExerciseCatalogView />}
      </main>
    </div>
  );
};

export default App;
