/**
 * src/App.tsx
 * Contenitore principale dell'applicazione React per T7 Workout Platform.
 * Gestisce l'architettura a 6 schede canoniche:
 * 1. Catalogo (Catalogo Esercizi Completo)
 * 2. Programmazione (Generatore Allenamenti AI & Periodizzazione)
 * 3. Data Analisi (Cruscotto Biomeccanico Polimorfico per 8 Strumenti)
 * 4. Libreria Fonti (Scientific Hub con 322 fonti peer-reviewed)
 * 5. Knowledge (Knowledge Base Semantica RAG)
 * 6. Preferiti (Gestione Integrata Esercizi Salvati)
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola R3: Modularità e separazione delle responsabilità.
 * - Regola R1: Zero any, tipizzazione TypeScript strict.
 */

import React, { useState } from 'react';
import { ExerciseCatalogView } from './components/exercises/ExerciseCatalogView';
import { WorkoutWizardView } from './components/wizard/WorkoutWizardView';
import { DataAnalysisView } from './components/analysis/DataAnalysisView';
import { ScientificSourcesView } from './components/sources/ScientificSourcesView';
import { RAGKnowledgeView } from './components/rag/RAGKnowledgeView';
import { FavoritesView } from './components/favorites/FavoritesView';
import { useFavorites } from './hooks/useFavorites';

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
  { id: 'rag', label: 'Knowledge' },
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
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  position: 'relative',
                }}
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

      {/* Contenitore Principale con Switcher di Rendering */}
      <main className="app-container" id="app-container">
        {activeTab === 'catalog' && <ExerciseCatalogView />}
        {activeTab === 'wizard' && <WorkoutWizardView />}
        {activeTab === 'analysis' && <DataAnalysisView />}
        {activeTab === 'sources' && <ScientificSourcesView />}
        {activeTab === 'rag' && <RAGKnowledgeView />}
        {activeTab === 'favorites' && <FavoritesView />}
      </main>
    </div>
  );
};

export default App;
