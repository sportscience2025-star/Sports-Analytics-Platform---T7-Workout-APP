/**
 * src/App.tsx
 * Contenitore principale dell'applicazione React per T7 Workout Platform.
 * Monta i Provider globali (TierProvider, AthleteProvider con lock Tier 1, BleProvider)
 * e la GlobalNavigationShell con barra di sotto-navigazione desktop a 6 schede e bottom-nav mobile:
 * 1. Catalogo (src/features/catalog/)
 * 2. Programmazione (src/features/programming/)
 * 3. Data Analisi (src/features/analysis/)
 * 4. Libreria Fonti (src/features/sources/)
 * 5. Knowledge RAG (src/features/rag/)
 * 6. Preferiti (src/features/favorites/)
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola 02: Costanti MAIUSCOLE, docstring JSDoc su ogni funzione e componente.
 * - Regola R1: Zero any, tipizzazione TypeScript strict.
 * - Regola R3: Architettura Feature-Driven.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TierProvider, AthleteProvider, BleProvider } from './context';
import { useTier } from './hooks/useTier';
import { GlobalNavigationShell } from './components/layout';
import { CatalogView } from './features/catalog';
import { ProgrammingView } from './features/programming';
import { AnalysisView } from './features/analysis';
import { SourcesView } from './features/sources';
import { RagView } from './features/rag';
import { FavoritesView, useFavorites } from './features/favorites';

export type ActiveTab = 'catalog' | 'wizard' | 'analysis' | 'sources' | 'rag' | 'favorites';

interface TabDefinition {
  readonly id: ActiveTab;
  readonly label: string;
  readonly hash: string;
}

const DEFAULT_ACTIVE_TAB: ActiveTab = 'catalog';
const FAVORITES_TAB_ID: ActiveTab = 'favorites';
const HASH_PREFIX_REGEX = /^#/;
const MOBILE_BREAKPOINT_PX = 768;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`;
const SUBNAV_Z_INDEX = 10;
const SUBNAV_BG_COLOR = 'rgba(11, 14, 20, 0.78)';
const SUBNAV_BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';
const SUBNAV_PADDING = '0.65rem 1.5rem';
const SVG_VIEWBOX = '0 0 24 24';
const SVG_STROKE_WIDTH = 2;

const TABS: readonly TabDefinition[] = Object.freeze([
  { id: 'catalog', label: 'Catalogo', hash: '#catalogo' },
  { id: 'wizard', label: 'Programmazione', hash: '#programmazione' },
  { id: 'analysis', label: 'Data Analisi', hash: '#analisi' },
  { id: 'sources', label: 'Libreria Fonti', hash: '#fonti' },
  { id: 'rag', label: 'RAG', hash: '#rag' },
  { id: 'favorites', label: 'Preferiti', hash: '#preferiti' }
]);

/**
 * Mappa un hash URL nella rispettiva scheda attiva con supporto a sinonimi italiani e inglesi.
 * @param hash Stringa hash letta da window.location.hash
 * @returns Identificativo tipizzato della scheda corrispondente
 */
function resolveTabFromHash(hash: string): ActiveTab {
  const cleanHash = hash.replace(HASH_PREFIX_REGEX, '').toLowerCase().trim();
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
      return DEFAULT_ACTIVE_TAB;
  }
}

/**
 * Determina in modo SSR-safe la scheda iniziale leggendo l'hash URL corrente.
 * @returns Scheda attiva iniziale
 */
function getInitialActiveTab(): ActiveTab {
  if (typeof window !== 'undefined' && window.location.hash) {
    return resolveTabFromHash(window.location.hash);
  }
  return DEFAULT_ACTIVE_TAB;
}

/**
 * Rileva in modo SSR-safe se il viewport corrente rientra nel breakpoint mobile.
 * @returns true se la larghezza del viewport soddisfa MOBILE_MEDIA_QUERY
 */
function getInitialIsMobileViewport(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

interface BottomNavIconProps {
  readonly tabId: ActiveTab;
}

/**
 * Renderizza l'icona vettoriale SVG associata alla scheda nella barra inferiore mobile.
 * @param props Proprieta contenenti l'identificativo della scheda
 * @returns Elemento SVG coerente con la scheda richiesta
 */
const BottomNavIcon: React.FC<BottomNavIconProps> = ({ tabId }) => {
  switch (tabId) {
    case 'catalog':
      return (
        <svg viewBox={SVG_VIEWBOX} fill="none" stroke="currentColor" strokeWidth={SVG_STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'wizard':
      return (
        <svg viewBox={SVG_VIEWBOX} fill="none" stroke="currentColor" strokeWidth={SVG_STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      );
    case 'analysis':
      return (
        <svg viewBox={SVG_VIEWBOX} fill="none" stroke="currentColor" strokeWidth={SVG_STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'sources':
      return (
        <svg viewBox={SVG_VIEWBOX} fill="none" stroke="currentColor" strokeWidth={SVG_STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'rag':
      return (
        <svg viewBox={SVG_VIEWBOX} fill="none" stroke="currentColor" strokeWidth={SVG_STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
        </svg>
      );
    case 'favorites':
      return (
        <svg viewBox={SVG_VIEWBOX} fill="none" stroke="currentColor" strokeWidth={SVG_STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
  }
};

/**
 * Shell applicativa interna connessa a TierContext, AthleteProvider, BleProvider e GlobalNavigationShell.
 * Gestisce il routing a 6 schede, la sincronizzazione con l'hash URL e la barra di navigazione responsive.
 * @returns Albero JSX della shell completa con viste Feature-Driven
 */
export const T7AppShell: React.FC = () => {
  const { tier, isTier1 } = useTier();
  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialActiveTab);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(getInitialIsMobileViewport);
  const { favoritesCount } = useFavorites();

  /**
   * Attiva la scheda selezionata e aggiorna l'hash URL tramite History API.
   * @param tabId Identificativo della scheda selezionata dall'utente
   * @returns void
   */
  const handleSelectTab = useCallback((tabId: ActiveTab): void => {
    setActiveTabState(tabId);
    const tabDef = TABS.find((t) => t.id === tabId);
    if (tabDef && typeof window !== 'undefined' && window.location.hash !== tabDef.hash) {
      window.history.pushState(null, '', tabDef.hash);
    }
  }, []);

  // Ascolto eventi back/forward della cronologia browser (hashchange e popstate)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    /**
     * Allinea lo stato della scheda attiva al cambio di hash URL o navigazione avanti/indietro.
     * @returns void
     */
    const handleHashChange = (): void => {
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

  // Monitoraggio breakpoint mobile per nascondere la sub-navigazione desktop sotto 768px
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    /**
     * Aggiorna il flag mobile quando la larghezza della finestra attraversa il breakpoint.
     * @param event Evento di cambio stato della media query
     * @returns void
     */
    const handleMediaChange = (event: MediaQueryListEvent): void => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return (
    <AthleteProvider enforceSingleAthlete={isTier1}>
      <BleProvider allowedTier={tier}>
        <GlobalNavigationShell>
          <div className="t7-app-root" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Barra di Sotto-Navigazione Desktop a 6 Schede sotto GlobalHeader (senza logo duplicato ne sticky overlap) */}
            {!isMobileViewport && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: SUBNAV_PADDING,
                  backgroundColor: SUBNAV_BG_COLOR,
                  borderBottom: `1px solid ${SUBNAV_BORDER_COLOR}`,
                  position: 'relative',
                  zIndex: SUBNAV_Z_INDEX
                }}
              >
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
                        {tab.id === FAVORITES_TAB_ID && favoritesCount > 0 && (
                          <span className="nav-badge" aria-label={`${favoritesCount} preferiti salvati`}>
                            {favoritesCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Contenitore Principale con Switcher di Rendering Feature-Driven */}
            <div
              className="app-container"
              id="app-container"
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              {activeTab === 'catalog' && <CatalogView />}
              {activeTab === 'wizard' && <ProgrammingView />}
              {activeTab === 'analysis' && <AnalysisView />}
              {activeTab === 'sources' && <SourcesView />}
              {activeTab === 'rag' && <RagView />}
              {activeTab === 'favorites' && <FavoritesView />}
            </div>

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
                    <BottomNavIcon tabId={tab.id} />
                    <span>{tab.label}</span>
                    {tab.id === FAVORITES_TAB_ID && favoritesCount > 0 && (
                      <span className="bottom-nav-badge" aria-label={`${favoritesCount} preferiti salvati`}>
                        {favoritesCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </GlobalNavigationShell>
      </BleProvider>
    </AthleteProvider>
  );
};

/**
 * Componente radice dell'applicazione T7 Workout PWA con TierProvider globale.
 * @returns Provider Tier globale che incapsula la shell applicativa T7AppShell
 */
export const App: React.FC = () => {
  return (
    <TierProvider>
      <T7AppShell />
    </TierProvider>
  );
};

export default App;
