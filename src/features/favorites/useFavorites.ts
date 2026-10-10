/**
 * src/features/favorites/useFavorites.ts
 * Re-export e wrapping del custom hook useFavorites per il modulo Preferiti.
 * Rispetta la Regola R1 (Strict TypeScript, zero any).
 */

export { useFavorites } from '../../hooks/useFavorites';
export type { UseFavoritesReturn } from '../../hooks/useFavorites';
