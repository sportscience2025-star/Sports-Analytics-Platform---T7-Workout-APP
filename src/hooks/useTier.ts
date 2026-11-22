/**
 * src/hooks/useTier.ts
 * Hook consumatore dedicato per la gestione del Tier e dei permessi RBAC.
 * Espone scorciatoie ergonomiche e sicure per il feature gating nei componenti UI.
 * Conforme ad ADR-01 (Thin Client) e Regola 02 (un file = una responsabilita).
 */

import { useTierContext, TierContextValue } from '../context/TierContext';

export interface UseTierReturn extends TierContextValue {
  canExportExcel: boolean;
  canAccessBiomechanics: boolean;
  canAccessBunker: boolean;
  canAccessResearch: boolean;
  hasCustomBranding: boolean;
}

/**
 * Hook per verificare il livello di abbonamento attivo e autorizzazioni RBAC.
 * @returns Stato del contesto con flag precalcolati per il rendering condizionale
 */
export function useTier(): UseTierReturn {
  const context = useTierContext();

  return {
    ...context,
    canExportExcel: context.permissions.canExportRawExcel,
    canAccessBiomechanics: context.permissions.canAccessAdvancedBiomechanics,
    canAccessBunker: context.permissions.canAccessMultiStaffBunker,
    canAccessResearch: context.permissions.canAccessResearchWarehouse,
    hasCustomBranding: context.permissions.hasCustomBranding
  };
}

export default useTier;
