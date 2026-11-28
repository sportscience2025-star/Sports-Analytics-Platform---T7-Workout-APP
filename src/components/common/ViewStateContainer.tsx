/**
 * src/components/common/ViewStateContainer.tsx
 * Orchestratore standardizzato per i 4 Stati UI obbligatori su ogni vista (CAPITOLATO_TECNICO Sez. 4):
 * Loading State, Error / Fallback State, Empty State e Populated State.
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO, zero wrapper rigidi in Populated).
 */

import React from 'react';
import { EmptyState, EmptyStateProps } from './EmptyState';
import { LoadingSkeleton, LoadingSkeletonProps } from './LoadingSkeleton';
import { ErrorFallback, ErrorFallbackProps } from './ErrorFallback';

export type ViewStateStatus = 'loading' | 'error' | 'empty' | 'populated';

export const VIEW_STATE_DEFAULT_ERROR_TITLE = 'Stato vista non valido';
export const VIEW_STATE_DEFAULT_ERROR_MESSAGE =
  'Impossibile determinare lo stato corrente del modulo. Riprova a sincronizzare i dati.';

export interface ViewStateContainerProps {
  /** Stato corrente della vista: loading | error | empty | populated. */
  state: ViewStateStatus;
  /** Contenuto completo da renderizzare nello stato populated. */
  children?: React.ReactNode;
  /** Proprieta opzionali inoltrate a `LoadingSkeleton` nello stato loading. */
  loadingProps?: LoadingSkeletonProps;
  /** Proprieta opzionali inoltrate a `EmptyState` nello stato empty. */
  emptyProps?: EmptyStateProps;
  /** Proprieta opzionali inoltrate a `ErrorFallback` nello stato error. */
  errorProps?: ErrorFallbackProps;
  /** Etichetta ARIA opzionale quando si applica un contenitore allo stato populated. */
  populatedAriaLabel?: string;
  /** Classe CSS opzionale applicata allo stato populated (se omessa evita nodi wrapper extra). */
  className?: string;
  /** Stile inline opzionale applicato allo stato populated (se omesso evita nodi wrapper extra). */
  style?: React.CSSProperties;
}

/**
 * Orchestratore reattivo deterministico per i 4 stati UI della piattaforma.
 * Nello stato `populated` restituisce direttamente `{children}` senza alterare griglie o Chart.js,
 * aggiungendo un contenitore `<div data-ui-state="populated">` solo se vengono passati stile/classe/ariaLabel.
 * @param props Stato attivo, figli populated e configurazioni per loading/empty/error
 * @returns Vista coerente con lo stato richiesto e fallback sicuro su valori imprevisti
 */
export const ViewStateContainer: React.FC<ViewStateContainerProps> = ({
  state,
  children,
  loadingProps,
  emptyProps,
  errorProps,
  populatedAriaLabel,
  className,
  style
}) => {
  switch (state) {
    case 'loading':
      return <LoadingSkeleton {...loadingProps} />;

    case 'error':
      return <ErrorFallback {...errorProps} />;

    case 'empty':
      return <EmptyState {...emptyProps} />;

    case 'populated': {
      if (className || style || populatedAriaLabel) {
        return (
          <div
            className={className}
            style={style}
            role={populatedAriaLabel ? 'region' : undefined}
            aria-label={populatedAriaLabel}
            data-ui-state="populated"
          >
            {children}
          </div>
        );
      }
      return <>{children}</>;
    }

    default:
      return (
        <ErrorFallback
          title={VIEW_STATE_DEFAULT_ERROR_TITLE}
          message={VIEW_STATE_DEFAULT_ERROR_MESSAGE}
          {...errorProps}
        />
      );
  }
};

export default ViewStateContainer;
