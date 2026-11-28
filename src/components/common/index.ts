/**
 * src/components/common/index.ts
 * Barrel file per i componenti UI comuni, l'ErrorBoundary globale
 * e l'infrastruttura standardizzata dei 4 Stati UI.
 * Conforme a Regola 02 (un file = una responsabilita, barrel exports ordinati).
 */

export * from './ErrorBoundary';
export * from './ui-state-utils';
export * from './EmptyState';
export * from './LoadingSkeleton';
export * from './ErrorFallback';
export * from './ViewStateContainer';
