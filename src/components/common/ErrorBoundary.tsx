/**
 * src/components/common/ErrorBoundary.tsx
 * Componente ErrorBoundary React difensivo per T7 Sports Analytics Platform.
 * Intercetta crash a runtime nei componenti figli e mostra un cockpit di fallback
 * Dark Theme con opzioni di ripristino ed esportazione del tracciato di debug.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Aggiorna lo stato per visualizzare la UI di fallback dopo un crash.
   * @param error - Errore generato
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Registra nei log i dettagli dell'eccezione catturata.
   * @param error - Oggetto errore
   * @param errorInfo - Stack trace del componente
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[T7 ErrorBoundary] Errore critico catturato:', error, errorInfo);
  }

  /**
   * Resetta lo stato dell'ErrorBoundary e ricarica l'applicazione.
   */
  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  /**
   * Cancella il localStorage in caso di dati corrotti e riavvia l'app.
   */
  private handleHardReset = (): void => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('[T7 ErrorBoundary] Impossibile cancellare storage:', e);
    }
    window.location.href = window.location.pathname;
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0b0e14',
          color: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}>
          <div style={{
            maxWidth: '680px',
            width: '100%',
            backgroundColor: '#111827',
            border: '1px solid #dc2626',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  Si è verificato un errore imprevisto
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
                  T7 Workout Analytics Crash Recovery
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#0b0e14',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid #1f293d',
              marginBottom: '1.5rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: '#f87171',
              overflowX: 'auto',
              maxHeight: '160px'
            }}>
              {this.state.error?.message || 'Errore sconosciuto'}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Ricarica Applicazione
              </button>
              <button
                onClick={this.handleHardReset}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Ripristino Dati & Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
