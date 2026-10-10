/**
 * src/App.tsx
 * Contenitore principale dell'applicazione React per T7 Workout Platform.
 * Gestisce l'architettura Feature-Driven a 6 schede canoniche in Dark Cockpit:
 * 1. Catalogo (src/features/catalog/)
 * 2. Programmazione (src/features/programming/)
 * 3. Data Analisi (src/features/analysis/)
 * 4. Libreria Fonti (src/features/sources/)
 * 5. Knowledge RAG (src/features/rag/)
 * 6. Preferiti (src/features/favorites/)
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola R3: Architettura Feature-Driven.
 * - Regola R1: Zero any, tipizzazione TypeScript strict.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CatalogView } from './features/catalog';
import { ProgrammingView } from './features/programming';
import { AnalysisView } from './features/analysis';
import { SourcesView } from './features/sources';
import { RagView } from './features/rag';
import { FavoritesView } from './features/favorites';
import { useFavorites } from './features/favorites';

export type ActiveTab = 'catalog' | 'wizard' | 'analysis' | 'sources' | 'rag' | 'favorites';

interface TabDefinition {
  id: ActiveTab;
  label: string;
  hash: string;
}

const TABS: TabDefinition[] = [
  { id: 'catalog', label: 'Catalogo', hash: '#catalogo' },
  { id: 'wizard', label: 'Programmazione', hash: '#programmazione' },
  { id: 'analysis', label: 'Data Analisi', hash: '#analisi' },
  { id: 'sources', label: 'Libreria Fonti', hash: '#fonti' },
  { id: 'rag', label: 'RAG', hash: '#rag' },
  { id: 'favorites', label: 'Preferiti', hash: '#preferiti' },
];

/**
 * Mappa un hash URL nella rispettiva scheda attiva con supporto a sinonimi italiani e inglesi.
 */
function resolveTabFromHash(hash: string): ActiveTab {
  const cleanHash = hash.replace(/^#/, '').toLowerCase().trim();
  switch (cleanHash) {
    case 'programmazione':
    case 'wizard':
    case 'scheda':
      return 'wizard';
    case 'analisi':
    case 'analysis':
    case 'vbt':
      return 'analysis';
    case 'fonti':
    case 'sources':
    case 'paper':
      return 'sources';
    case 'rag':
    case 'chat':
    case 'ai':
      return 'rag';
    case 'preferiti':
    case 'favorites':
    case 'fav':
      return 'favorites';
    case 'catalogo':
    case 'catalog':
    default:
      return 'catalog';
  }
}

/**
 * Componente radice dell'applicazione T7 Workout PWA.
 */
export const App: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return resolveTabFromHash(window.location.hash);
    }
    return 'catalog';
  });

  const { favoritesCount } = useFavorites();

  // Sincronizzazione cambio tab con URL Hash per navigazione diretta e cronologia
  const handleSelectTab = useCallback((tabId: ActiveTab) => {
    setActiveTabState(tabId);
    const tabDef = TABS.find((t) => t.id === tabId);
    if (tabDef && typeof window !== 'undefined' && window.location.hash !== tabDef.hash) {
      window.history.pushState(null, '', tabDef.hash);
    }
  }, []);

  // Ascolto eventi back/forward della cronologia browser (hashchange e popstate)
  useEffect(() => {
    const handleHashChange = () => {
      const resolved = resolveTabFromHash(window.location.hash);
      setActiveTabState(resolved);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  return (
    <div className="t7-app-root">
      {/* Header Professionale Conforme a Foto 1 */}
      <header className="app-header">
        <div className="logo">
          <h1>
            T7 <span className="highlight">Workout</span>
          </h1>
          <span className="logo-badge">SPORTS ANALYTICS</span>
        </div>

        {/* Navigazione Principale Desktop a 6 Schede con Indicatore Attivo e Badge Preferiti */}
        <nav className="main-nav" aria-label="Navigazione principale">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{tab.label}</span>
                {tab.id === 'favorites' && favoritesCount > 0 && (
                  <span className="nav-badge" aria-label={`${favoritesCount} preferiti salvati`}>
                    {favoritesCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Contenitore Principale con Switcher di Rendering Feature-Driven */}
      <main className="app-container" id="app-container">
        {activeTab === 'catalog' && <CatalogView />}
        {activeTab === 'wizard' && <ProgrammingView />}
        {activeTab === 'analysis' && <AnalysisView />}
        {activeTab === 'sources' && <SourcesView />}
        {activeTab === 'rag' && <RagView />}
        {activeTab === 'favorites' && <FavoritesView />}
      </main>

      {/* Barra di Navigazione Mobile Inferiore (visibile sotto 768px via media query) */}
      <nav className="bottom-nav" aria-label="Navigazione mobile">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={`bottom-${tab.id}`}
              type="button"
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              title={tab.label}
            >
              {tab.id === 'catalog' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              )}
              {tab.id === 'wizard' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M9 12h6" />
                  <path d="M9 16h6" />
                </svg>
              )}
              {tab.id === 'analysis' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              )}
              {tab.id === 'sources' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              )}
              {tab.id === 'rag' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
                </svg>
              )}
              {tab.id === 'favorites' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
              <span>{tab.label}</span>
              {tab.id === 'favorites' && favoritesCount > 0 && (
                <span className="bottom-nav-badge" aria-label={`${favoritesCount} preferiti salvati`}>
                  {favoritesCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default App;
