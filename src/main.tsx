/**
 * src/main.tsx
 * Entry point dell'applicazione React per T7 Sports Analytics Platform.
 * Effettua il mount di React nell'elemento #root.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Fallback difensivo nel caso in cui l'id sia app-container
  const fallbackContainer = document.getElementById('app-container');
  if (fallbackContainer) {
    const root = ReactDOM.createRoot(fallbackContainer);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error('[T7 App] Impossibile trovare elemento DOM per il mount (#root o #app-container).');
  }
}
