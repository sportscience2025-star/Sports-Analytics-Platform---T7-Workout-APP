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

import React, { useState } from 'react';
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
}

const TABS: TabDefinition[] = [
  { id: 'catalog', label: 'Catalogo' },
  { id: 'wizard', label: 'Programmazione' },
  { id: 'analysis', label: 'Data Analisi' },
  { id: 'sources', label: 'Libreria Fonti' },
  { id: 'rag', label: 'RAG' },
  { id: 'favorites', label: 'Preferiti' },
];

/**
 * Componente radice dell'applicazione T7 Workout PWA.
 */
export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const { favoritesCount } = useFavorites();

  return (
    <div className="t7-app-root">
      {/* Header Professionale Conforme a Foto 1 */}
      <header className="app-header">
        <div className="logo">
          <h1>
            T7 <span className="highlight">Workout</span>
          </h1>
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
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
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
