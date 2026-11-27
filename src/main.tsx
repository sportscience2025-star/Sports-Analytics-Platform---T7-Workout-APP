/**
 * src/main.tsx
 * Entry point dell'applicazione React per T7 Sports Analytics Platform.
 * Effettua il mount di React nell'elemento #root protetto da ErrorBoundary globale.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const ROOT_ELEMENT_ID = 'root';
const FALLBACK_CONTAINER_ID = 'app-container';
const MOUNT_ERROR_MESSAGE =
  '[T7 App] Impossibile trovare elemento DOM per il mount (#root o #app-container).';

/**
 * Monta l'albero React radice all'interno dell'elemento DOM specificato.
 * @param targetElement Elemento DOM contenitore in cui montare l'applicazione
 * @returns void
 */
function renderAppRoot(targetElement: HTMLElement): void {
  const root = ReactDOM.createRoot(targetElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

/**
 * Risolve il contenitore DOM disponibile (#root o fallback #app-container) e avvia il mount dell'app.
 * @returns void
 */
function mountApplication(): void {
  const container =
    document.getElementById(ROOT_ELEMENT_ID) ??
    document.getElementById(FALLBACK_CONTAINER_ID);

  if (!container) {
    console.error(MOUNT_ERROR_MESSAGE);
    return;
  }

  renderAppRoot(container);
}

mountApplication();
