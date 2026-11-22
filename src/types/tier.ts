/**
 * src/types/tier.ts
 * Dominio Abbonamenti, Ruoli RBAC, Feature Gating e Isolamento Multi-Tenant Silos.
 * Conforme ad ADR-02 (3 Silos Stagni), Glossario #115 e Regola 02 (un file = una responsabilita).
 */

export type TierLevel = 'tier1' | 'tier2' | 'tier3';

export type UserRole =
  | 'athlete'
  | 'head_coach'
  | 'sc_coach'
  | 'physiotherapist'
  | 'team_doctor'
  | 'match_analyst'
  | 'researcher'
  | 'admin';

export type DataSiloPartition =
  | 'silo1_consumer'
  | 'silo2_club_bunker'
  | 'silo3_research';

export type SensitivityClass =
  | 'STANDARD'
  | 'CLINICAL_GDPR_ART9';

export type AppModuleId =
  | 'cockpit'
  | 'catalog'
  | 'programming'
  | 'analysis'
  | 'community'
  | 'favorites'
  | 'nutrition'
  | 'companion_movely'
  | 'companion_together';

export interface TierFeaturePermissions {
  tier: TierLevel;
  maxAthletes: number;
  canExportRawExcel: boolean;
  canAccessAdvancedBiomechanics: boolean;
  canAccessMultiStaffBunker: boolean;
  canAccessResearchWarehouse: boolean;
  hasCustomBranding: boolean;
  allowedModules: readonly AppModuleId[];
}

export const TIER_LEVEL_CONSUMER: TierLevel = 'tier1';
export const TIER_LEVEL_PRO: TierLevel = 'tier2';
export const TIER_LEVEL_ELITE: TierLevel = 'tier3';

export const SILO1_CONSUMER: DataSiloPartition = 'silo1_consumer';
export const SILO2_CLUB_BUNKER: DataSiloPartition = 'silo2_club_bunker';
export const SILO3_RESEARCH: DataSiloPartition = 'silo3_research';

export const SENSITIVITY_STANDARD: SensitivityClass = 'STANDARD';
export const SENSITIVITY_CLINICAL: SensitivityClass = 'CLINICAL_GDPR_ART9';

export const MAX_ATHLETES_TIER1 = 1;
export const MAX_ATHLETES_TIER2 = 50;
export const MAX_ATHLETES_TIER3 = 10000;

export const TIER_PERMISSIONS_MATRIX: Readonly<Record<TierLevel, TierFeaturePermissions>> = Object.freeze({
  tier1: {
    tier: 'tier1',
    maxAthletes: MAX_ATHLETES_TIER1,
    canExportRawExcel: false,
    canAccessAdvancedBiomechanics: false,
    canAccessMultiStaffBunker: false,
    canAccessResearchWarehouse: false,
    hasCustomBranding: false,
    allowedModules: [
      'cockpit',
      'catalog',
      'programming',
      'analysis',
      'favorites',
      'nutrition',
    ],
  },
  tier2: {
    tier: 'tier2',
    maxAthletes: MAX_ATHLETES_TIER2,
    canExportRawExcel: true,
    canAccessAdvancedBiomechanics: true,
    canAccessMultiStaffBunker: false,
    canAccessResearchWarehouse: false,
    hasCustomBranding: false,
    allowedModules: [
      'cockpit',
      'catalog',
      'programming',
      'analysis',
      'community',
      'favorites',
      'nutrition',
      'companion_together',
    ],
  },
  tier3: {
    tier: 'tier3',
    maxAthletes: MAX_ATHLETES_TIER3,
    canExportRawExcel: true,
    canAccessAdvancedBiomechanics: true,
    canAccessMultiStaffBunker: true,
    canAccessResearchWarehouse: true,
    hasCustomBranding: true,
    allowedModules: [
      'cockpit',
      'catalog',
      'programming',
      'analysis',
      'community',
      'favorites',
      'nutrition',
      'companion_movely',
      'companion_together',
    ],
  },
});

/**
 * Verifica se un ruolo appartiene allo staff sanitario autorizzato (GDPR Art. 9).
 * @param role Ruolo RBAC dell'utente
 * @returns true se il ruolo ha accesso ai dati clinici sensibili
 */
export function isClinicalStaff(role: UserRole): boolean {
  return role === 'team_doctor' || role === 'physiotherapist';
}

/**
 * Verifica se un utente e abilitato all'elaborazione di piani nutrizionali personalizzati (Art. 348 c.p.).
 * @param role Ruolo RBAC dell'utente
 * @param hasClinicalLicense Flag di iscrizione all'albo dei biologi nutrizionisti o medici
 * @returns true se l'utente possiede titolo legale per prescrivere diete grammate
 */
export function canPrescribeNutrition(role: UserRole, hasClinicalLicense: boolean = false): boolean {
  if (role === 'team_doctor') return true;
  return hasClinicalLicense;
}
