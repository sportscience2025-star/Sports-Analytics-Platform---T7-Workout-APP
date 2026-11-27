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
  | 'sports_doctor'
  | 'clinical_nutritionist'
  | 'dietitian'
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
  | 'catalog'
  | 'programming'
  | 'analysis'
  | 'sources'
  | 'rag'
  | 'favorites'
  | 'nutrition'
  | 'onboarding'
  | 'cockpit'
  | 'community'
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

export const CLINICAL_STAFF_ROLES: readonly UserRole[] = Object.freeze([
  'team_doctor',
  'sports_doctor',
  'physiotherapist',
  'clinical_nutritionist',
  'dietitian'
]);

export const NUTRITION_PRESCRIPTION_ROLES: readonly UserRole[] = Object.freeze([
  'team_doctor',
  'sports_doctor',
  'clinical_nutritionist',
  'dietitian'
]);

const TIER1_ALLOWED_MODULES: readonly AppModuleId[] = Object.freeze([
  'cockpit',
  'onboarding',
  'catalog',
  'programming',
  'analysis',
  'sources',
  'favorites',
  'nutrition'
]);

const TIER2_ALLOWED_MODULES: readonly AppModuleId[] = Object.freeze([
  'cockpit',
  'onboarding',
  'catalog',
  'programming',
  'analysis',
  'sources',
  'community',
  'favorites',
  'nutrition',
  'companion_together'
]);

const TIER3_ALLOWED_MODULES: readonly AppModuleId[] = Object.freeze([
  'cockpit',
  'onboarding',
  'catalog',
  'programming',
  'analysis',
  'sources',
  'rag',
  'community',
  'favorites',
  'nutrition',
  'companion_movely',
  'companion_together'
]);

export const TIER_PERMISSIONS_MATRIX: Readonly<Record<TierLevel, TierFeaturePermissions>> = Object.freeze({
  tier1: Object.freeze({
    tier: 'tier1',
    maxAthletes: MAX_ATHLETES_TIER1,
    canExportRawExcel: false,
    canAccessAdvancedBiomechanics: false,
    canAccessMultiStaffBunker: false,
    canAccessResearchWarehouse: false,
    hasCustomBranding: false,
    allowedModules: TIER1_ALLOWED_MODULES
  }),
  tier2: Object.freeze({
    tier: 'tier2',
    maxAthletes: MAX_ATHLETES_TIER2,
    canExportRawExcel: true,
    canAccessAdvancedBiomechanics: true,
    canAccessMultiStaffBunker: false,
    canAccessResearchWarehouse: false,
    hasCustomBranding: false,
    allowedModules: TIER2_ALLOWED_MODULES
  }),
  tier3: Object.freeze({
    tier: 'tier3',
    maxAthletes: MAX_ATHLETES_TIER3,
    canExportRawExcel: true,
    canAccessAdvancedBiomechanics: true,
    canAccessMultiStaffBunker: true,
    // Silo 3 Research Warehouse e riservato ai soli utenti con ruolo 'researcher' ed opt-in (ADR-02)
    canAccessResearchWarehouse: false,
    hasCustomBranding: true,
    allowedModules: TIER3_ALLOWED_MODULES
  })
});

/**
 * Verifica se un ruolo appartiene allo staff sanitario autorizzato (GDPR Art. 9).
 * @param role Ruolo RBAC dell'utente
 * @returns true se il ruolo ha accesso ai dati clinici sensibili
 */
export function isClinicalStaff(role: UserRole): boolean {
  return CLINICAL_STAFF_ROLES.includes(role);
}

/**
 * Verifica se un utente e abilitato all'elaborazione di piani nutrizionali personalizzati (Art. 348 c.p.).
 * Richiede sia una licenza clinica attiva sia l'appartenenza a una professione sanitaria/nutrizionale abilitata.
 * @param role Ruolo RBAC dell'utente
 * @param hasClinicalLicense Flag di iscrizione all'albo dei biologi nutrizionisti, dietisti o medici
 * @returns true se l'utente possiede titolo legale e ruolo clinico per prescrivere diete grammate
 */
export function canPrescribeNutrition(role: UserRole, hasClinicalLicense: boolean = false): boolean {
  if (!hasClinicalLicense) {
    return false;
  }
  return NUTRITION_PRESCRIPTION_ROLES.includes(role);
}
