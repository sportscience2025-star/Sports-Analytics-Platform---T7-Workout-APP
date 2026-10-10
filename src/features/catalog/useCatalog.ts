/**
 * src/features/catalog/useCatalog.ts
 * Custom hook per il modulo Catalogo Esercizi.
 * Incapsula lo stato di ricerca, multi-filtri e paginazione.
 * Rispetta la Regola R1 (Strict TypeScript, zero any) e Regola 02 (Zero numeri magici).
 */

export { useExerciseCatalog as useCatalog } from '../../hooks/useExerciseCatalog';
export type {
  UseExerciseCatalogOptions as UseCatalogOptions,
  UseExerciseCatalogReturn as UseCatalogReturn,
} from '../../hooks/useExerciseCatalog';
