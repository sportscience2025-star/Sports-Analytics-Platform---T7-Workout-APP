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

  // Ascolto eventi back/forward della cronologia browser
  useEffect(() => {
    const handleHashChange = () => {
      const resolved = resolveTabFromHash(window.location.hash);
      setActiveTabState(resolved);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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

        {/* Navigazione Principale a 6 Schede con Indicatore Attivo e Badge Preferiti */}
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
    </div>
  );
};

export default App;
