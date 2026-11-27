/**
 * src/context/TierContext.tsx
 * React Context per la gestione deterministica del Tier (Tier 1, Tier 2, Tier 3) e RBAC.
 * Conforme ad ADR-01 (Thin Client), ADR-02 (3 Silos Stagni), GDPR Art. 9 e Art. 348 c.p.
 */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  TierLevel,
  UserRole,
  AppModuleId,
  TierFeaturePermissions,
  DataSiloPartition,
  TIER_PERMISSIONS_MATRIX,
  TIER_LEVEL_CONSUMER,
  TIER_LEVEL_PRO,
  TIER_LEVEL_ELITE,
  SILO1_CONSUMER,
  SILO2_CLUB_BUNKER,
  SILO3_RESEARCH,
  MAX_ATHLETES_TIER1,
  NUTRITION_PRESCRIPTION_ROLES,
  isClinicalStaff,
  canPrescribeNutrition
} from '../types/tier';
import {
  readStorageSafe,
  writeStorageSafe,
  removeStorageSafe
} from '../utils/storage-safe';

// ============================================================================
// COSTANTI DI CONFIGURAZIONE E CONTROLLO RBAC
// ============================================================================

export const STORAGE_KEY_TIER = 't7_simulated_tier';
export const STORAGE_KEY_ROLE = 't7_simulated_role';
export const STORAGE_KEY_CLINICAL_LICENSE = 't7_simulated_clinical_license';

export const DEFAULT_TIER: TierLevel = TIER_LEVEL_CONSUMER;
export const DEFAULT_ROLE: UserRole = 'athlete';
export const DEFAULT_CLINICAL_LICENSE = false;
export const DEFAULT_SIMULATOR_ENABLED = true;
export const DEFAULT_PERSIST_STATE = true;

const ROLE_ATHLETE: UserRole = 'athlete';
const ROLE_RESEARCHER: UserRole = 'researcher';

const SERIALIZED_TRUE = 'true';
const SERIALIZED_FALSE = 'false';
const CONTEXT_ERROR_MESSAGE = 'useTierContext must be used within a TierProvider';

export const VALID_TIER_LEVELS: readonly TierLevel[] = Object.freeze([
  TIER_LEVEL_CONSUMER,
  TIER_LEVEL_PRO,
  TIER_LEVEL_ELITE
]);

export const VALID_USER_ROLES: readonly UserRole[] = Object.freeze([
  'athlete',
  'head_coach',
  'sc_coach',
  'physiotherapist',
  'team_doctor',
  'sports_doctor',
  'clinical_nutritionist',
  'dietitian',
  'match_analyst',
  'researcher',
  'admin'
]);

const TIER1_ALLOWED_ROLES: readonly UserRole[] = Object.freeze([ROLE_ATHLETE]);
const TIER2_ALLOWED_ROLES: readonly UserRole[] = Object.freeze([
  ROLE_ATHLETE,
  'head_coach',
  'sc_coach',
  'physiotherapist',
  'clinical_nutritionist',
  'dietitian',
  'sports_doctor'
]);
const TIER3_ALLOWED_ROLES: readonly UserRole[] = Object.freeze([
  ROLE_ATHLETE,
  'head_coach',
  'sc_coach',
  'physiotherapist',
  'clinical_nutritionist',
  'dietitian',
  'sports_doctor',
  'team_doctor',
  'match_analyst',
  ROLE_RESEARCHER,
  'admin'
]);

export const ALLOWED_ROLES_BY_TIER: Readonly<Record<TierLevel, readonly UserRole[]>> = Object.freeze({
  [TIER_LEVEL_CONSUMER]: TIER1_ALLOWED_ROLES,
  [TIER_LEVEL_PRO]: TIER2_ALLOWED_ROLES,
  [TIER_LEVEL_ELITE]: TIER3_ALLOWED_ROLES
} as Record<TierLevel, readonly UserRole[]>);

// ============================================================================
// TIPI E INTERFACCE PUBBLICHE
// ============================================================================

export type TierBooleanFeatureKey =
  | 'canExportRawExcel'
  | 'canAccessAdvancedBiomechanics'
  | 'canAccessMultiStaffBunker'
  | 'canAccessResearchWarehouse'
  | 'hasCustomBranding';

export interface TierRbacState {
  tier: TierLevel;
  role: UserRole;
  hasClinicalLicense: boolean;
}

export interface TierContextValue {
  tier: TierLevel;
  role: UserRole;
  hasClinicalLicense: boolean;
  simulatorEnabled: boolean;
  permissions: TierFeaturePermissions;
  maxAthletes: number;
  dataSilo: DataSiloPartition;
  isTier1: boolean;
  isTier2: boolean;
  isTier3: boolean;
  isClinical: boolean;
  canPrescribeDiet: boolean;
  setTier: (tier: TierLevel) => void;
  setRole: (role: UserRole) => void;
  setHasClinicalLicense: (allowed: boolean) => void;
  hasAccess: (permissionKey: TierBooleanFeatureKey) => boolean;
  isModuleAllowed: (moduleId: AppModuleId) => boolean;
  resetToDefaults: () => void;
}

export interface TierProviderProps {
  children?: React.ReactNode;
  defaultTier?: TierLevel;
  defaultRole?: UserRole;
  defaultClinicalLicense?: boolean;
  persistState?: boolean;
  /**
   * Abilita il simulatore client-side (demo/collaudo) e la persistenza in localStorage.
   * In produzione deve essere impostato a `false` affinche Tier, Ruolo e Licenza derivino solo da JWT server-side.
   */
  simulatorEnabled?: boolean;
}

// ============================================================================
// GUARDIE RUNTIME E LOGICA DETERMINISTICA RBAC
// ============================================================================

/**
 * Type guard runtime per verificare la validita di un livello Tier.
 * @param value Valore da esaminare
 * @returns true se il valore e un TierLevel valido
 */
export function isValidTier(value: unknown): value is TierLevel {
  if (typeof value !== 'string') {
    return false;
  }
  return VALID_TIER_LEVELS.includes(value as TierLevel);
}

/**
 * Type guard runtime per verificare la validita di un ruolo RBAC utente.
 * @param value Valore da esaminare
 * @returns true se il valore e un UserRole valido
 */
export function isValidRole(value: unknown): value is UserRole {
  if (typeof value !== 'string') {
    return false;
  }
  return VALID_USER_ROLES.includes(value as UserRole);
}

/**
 * Verifica se un ruolo RBAC e consentito all'interno di un determinato livello Tier.
 * @param tier Livello di abbonamento target
 * @param role Ruolo utente da verificare
 * @returns true se il ruolo e ammesso per quel Tier
 */
export function isRoleAllowedInTier(tier: TierLevel, role: UserRole): boolean {
  const allowedRoles = ALLOWED_ROLES_BY_TIER[tier] || ALLOWED_ROLES_BY_TIER[DEFAULT_TIER];
  return allowedRoles.includes(role);
}

/**
 * Normalizza il ruolo utente in base al Tier attivo applicando il principio del privilegio minimo.
 * @param tier Livello di abbonamento attivo
 * @param role Ruolo candidato
 * @returns Il ruolo stesso se consentito nel Tier, altrimenti DEFAULT_ROLE ('athlete')
 */
export function normalizeRoleForTier(tier: TierLevel, role: UserRole): UserRole {
  if (isRoleAllowedInTier(tier, role)) {
    return role;
  }
  return DEFAULT_ROLE;
}

/**
 * Verifica l'idoneita legale a possedere una licenza clinica per prescrizione nutrizionale (Art. 348 c.p.).
 * @param tier Livello di abbonamento attivo
 * @param role Ruolo RBAC dell'utente
 * @returns true solo per Tier >= 2 e professioni sanitarie/nutrizionali abilitate
 */
export function canHoldClinicalLicense(tier: TierLevel, role: UserRole): boolean {
  if (tier === TIER_LEVEL_CONSUMER) {
    return false;
  }
  return NUTRITION_PRESCRIPTION_ROLES.includes(role);
}

/**
 * Risolve la partizione del Silo dati multi-tenant in base a Tier e Ruolo.
 * Conforme ad ADR-02 (3 Silos Stagni).
 * @param tier Livello di abbonamento attivo
 * @param role Ruolo RBAC dell'utente
 * @returns Partizione isolata di appartenenza (Silo 1, Silo 2 o Silo 3)
 */
export function resolveDataSilo(tier: TierLevel, role: UserRole): DataSiloPartition {
  if (tier === TIER_LEVEL_ELITE) {
    if (role === ROLE_RESEARCHER) {
      return SILO3_RESEARCH;
    }
    if (role !== ROLE_ATHLETE) {
      return SILO2_CLUB_BUNKER;
    }
  }
  return SILO1_CONSUMER;
}

/**
 * Calcola i permessi effettivi combinando la matrice di abbonamento e il ruolo RBAC (Tier x Role).
 * Impedisce a ruoli non-staff (es. athlete in Tier 3) l'accesso a Bunker, Export Excel e Warehouse.
 * @param tier Livello di abbonamento attivo
 * @param role Ruolo RBAC attivo
 * @returns Oggetto immutabile TierFeaturePermissions effettivo per la coppia (tier, role)
 */
export function computeEffectivePermissions(tier: TierLevel, role: UserRole): TierFeaturePermissions {
  const base = TIER_PERMISSIONS_MATRIX[tier] || TIER_PERMISSIONS_MATRIX[DEFAULT_TIER];
  const effectiveRole = normalizeRoleForTier(tier, role);

  if (effectiveRole === ROLE_ATHLETE) {
    return Object.freeze({
      tier: base.tier,
      maxAthletes: MAX_ATHLETES_TIER1,
      canExportRawExcel: false,
      canAccessAdvancedBiomechanics: base.canAccessAdvancedBiomechanics,
      canAccessMultiStaffBunker: false,
      canAccessResearchWarehouse: false,
      hasCustomBranding: false,
      allowedModules: base.allowedModules
    });
  }

  if (effectiveRole === ROLE_RESEARCHER) {
    return Object.freeze({
      tier: base.tier,
      maxAthletes: base.maxAthletes,
      canExportRawExcel: false,
      canAccessAdvancedBiomechanics: base.canAccessAdvancedBiomechanics,
      canAccessMultiStaffBunker: false,
      canAccessResearchWarehouse: tier === TIER_LEVEL_ELITE,
      hasCustomBranding: false,
      allowedModules: base.allowedModules
    });
  }

  return Object.freeze({
    tier: base.tier,
    maxAthletes: base.maxAthletes,
    canExportRawExcel: base.canExportRawExcel,
    canAccessAdvancedBiomechanics: base.canAccessAdvancedBiomechanics,
    canAccessMultiStaffBunker: base.canAccessMultiStaffBunker,
    canAccessResearchWarehouse: false,
    hasCustomBranding: base.hasCustomBranding,
    allowedModules: base.allowedModules
  });
}

/**
 * Risolve lo stato di riferimento configurato sul provider normalizzando eventuali combinazioni non valide.
 * @param defaultTier Tier iniziale opzionale passato al provider
 * @param defaultRole Ruolo iniziale opzionale passato al provider
 * @param defaultClinicalLicense Flag licenza clinica iniziale opzionale
 * @returns Stato RBAC coerente utilizzato per inizializzazione e resetToDefaults
 */
export function resolveBaselineState(
  defaultTier?: TierLevel,
  defaultRole?: UserRole,
  defaultClinicalLicense?: boolean
): TierRbacState {
  const tier = defaultTier && isValidTier(defaultTier) ? defaultTier : DEFAULT_TIER;
  const candidateRole = defaultRole && isValidRole(defaultRole) ? defaultRole : DEFAULT_ROLE;
  const role = normalizeRoleForTier(tier, candidateRole);
  const candidateLicense = typeof defaultClinicalLicense === 'boolean'
    ? defaultClinicalLicense
    : DEFAULT_CLINICAL_LICENSE;
  const hasClinicalLicense = canHoldClinicalLicense(tier, role) ? candidateLicense : DEFAULT_CLINICAL_LICENSE;

  return {
    tier,
    role,
    hasClinicalLicense
  };
}

/**
 * Calcola lo stato iniziale del provider fondendo props configurate e storage simulato quando abilitato.
 * @param baseline Stato di baseline risolto dalle props
 * @param defaultTier Tier esplicito dalle props (se presente ha precedenza sullo storage)
 * @param defaultRole Ruolo esplicito dalle props (se presente ha precedenza sullo storage)
 * @param defaultClinicalLicense Licenza esplicita dalle props (se presente ha precedenza sullo storage)
 * @param shouldReadStorage Flag che abilita la lettura da localStorage
 * @returns Stato RBAC iniziale sanitizzato
 */
export function resolveInitialState(
  baseline: TierRbacState,
  defaultTier?: TierLevel,
  defaultRole?: UserRole,
  defaultClinicalLicense?: boolean,
  shouldReadStorage: boolean = false
): TierRbacState {
  if (!shouldReadStorage) {
    return baseline;
  }

  let resolvedTier = baseline.tier;
  if (!defaultTier || !isValidTier(defaultTier)) {
    const storedTier = readStorageSafe(STORAGE_KEY_TIER);
    if (isValidTier(storedTier)) {
      resolvedTier = storedTier;
    }
  }

  let candidateRole = defaultRole && isValidRole(defaultRole) ? defaultRole : DEFAULT_ROLE;
  if (!defaultRole || !isValidRole(defaultRole)) {
    const storedRole = readStorageSafe(STORAGE_KEY_ROLE);
    if (isValidRole(storedRole)) {
      candidateRole = storedRole;
    }
  }
  const resolvedRole = normalizeRoleForTier(resolvedTier, candidateRole);

  let candidateLicense = typeof defaultClinicalLicense === 'boolean'
    ? defaultClinicalLicense
    : DEFAULT_CLINICAL_LICENSE;
  if (typeof defaultClinicalLicense !== 'boolean') {
    const storedLicense = readStorageSafe(STORAGE_KEY_CLINICAL_LICENSE);
    if (storedLicense === SERIALIZED_TRUE) {
      candidateLicense = true;
    } else if (storedLicense === SERIALIZED_FALSE) {
      candidateLicense = false;
    }
  }
  const resolvedLicense = canHoldClinicalLicense(resolvedTier, resolvedRole)
    ? candidateLicense
    : DEFAULT_CLINICAL_LICENSE;

  return {
    tier: resolvedTier,
    role: resolvedRole,
    hasClinicalLicense: resolvedLicense
  };
}

/**
 * Applica una transizione di Tier garantendo il downgrade automatico di ruolo non ammesso e licenza clinica.
 * @param prev Stato RBAC precedente
 * @param newTier Nuovo Tier richiesto
 * @returns Nuovo stato RBAC valido oppure prev se il Tier non e valido
 */
export function applyTierChange(prev: TierRbacState, newTier: TierLevel): TierRbacState {
  if (!isValidTier(newTier)) {
    return prev;
  }
  const nextRole = normalizeRoleForTier(newTier, prev.role);
  const nextLicense = canHoldClinicalLicense(newTier, nextRole) ? prev.hasClinicalLicense : false;

  if (prev.tier === newTier && prev.role === nextRole && prev.hasClinicalLicense === nextLicense) {
    return prev;
  }

  return {
    tier: newTier,
    role: nextRole,
    hasClinicalLicense: nextLicense
  };
}

/**
 * Applica una transizione di Ruolo verificando l'ammissibilita nel Tier attivo e la guardia Art. 348 c.p.
 * @param prev Stato RBAC precedente
 * @param newRole Nuovo ruolo richiesto
 * @returns Nuovo stato RBAC oppure prev se il ruolo e invalido o non consentito nel Tier attivo
 */
export function applyRoleChange(prev: TierRbacState, newRole: UserRole): TierRbacState {
  if (!isValidRole(newRole) || !isRoleAllowedInTier(prev.tier, newRole)) {
    return prev;
  }
  const nextLicense = canHoldClinicalLicense(prev.tier, newRole) ? prev.hasClinicalLicense : false;

  if (prev.role === newRole && prev.hasClinicalLicense === nextLicense) {
    return prev;
  }

  return {
    tier: prev.tier,
    role: newRole,
    hasClinicalLicense: nextLicense
  };
}

/**
 * Applica l'aggiornamento della licenza clinica rispettando rigorosamente l'Art. 348 c.p.
 * Blocca l'attivazione in Tier 1 o per ruoli privi di abilitazione sanitaria/nutrizionale.
 * @param prev Stato RBAC precedente
 * @param allowed Valore booleano richiesto per la licenza clinica
 * @returns Nuovo stato RBAC con licenza aggiornata o bloccata a false
 */
export function applyClinicalLicenseChange(prev: TierRbacState, allowed: boolean): TierRbacState {
  const boolValue = Boolean(allowed);
  const nextLicense = boolValue && canHoldClinicalLicense(prev.tier, prev.role);

  if (prev.hasClinicalLicense === nextLicense) {
    return prev;
  }

  return {
    tier: prev.tier,
    role: prev.role,
    hasClinicalLicense: nextLicense
  };
}

/**
 * Persiste in localStorage lo stato simulato corrente tramite helper protetti SSR-safe.
 * @param state Stato RBAC da salvare
 */
function persistStateToStorage(state: TierRbacState): void {
  writeStorageSafe(STORAGE_KEY_TIER, state.tier);
  writeStorageSafe(STORAGE_KEY_ROLE, state.role);
  writeStorageSafe(STORAGE_KEY_CLINICAL_LICENSE, String(state.hasClinicalLicense));
}

// ============================================================================
// REACT CONTEXT E PROVIDER
// ============================================================================

export const TierContext = createContext<TierContextValue | null>(null);

/**
 * Componente Provider per la diffusione reattiva del Tier e dei permessi RBAC.
 * @param props Proprieta del provider (figli, configurazione iniziale, persistenza e flag simulatore)
 * @returns Elemento React Provider con memoizzazione ottimale
 */
export const TierProvider: React.FC<TierProviderProps> = ({
  children,
  defaultTier,
  defaultRole,
  defaultClinicalLicense,
  persistState = DEFAULT_PERSIST_STATE,
  simulatorEnabled = DEFAULT_SIMULATOR_ENABLED
}) => {
  const effectivePersist = simulatorEnabled && persistState;

  const baselineState = useMemo<TierRbacState>(
    () => resolveBaselineState(defaultTier, defaultRole, defaultClinicalLicense),
    [defaultTier, defaultRole, defaultClinicalLicense]
  );

  const [state, setState] = useState<TierRbacState>(() =>
    resolveInitialState(baselineState, defaultTier, defaultRole, defaultClinicalLicense, effectivePersist)
  );

  /**
   * Aggiorna il livello Tier simulato applicando il downgrade di ruolo/licenza se necessario.
   * No-op quando simulatorEnabled e false (modalita produzione JWT-backed).
   * @param newTier Nuovo livello di abbonamento da impostare
   */
  const setTier = useCallback((newTier: TierLevel): void => {
    if (!simulatorEnabled) {
      return;
    }
    setState((prev) => {
      const next = applyTierChange(prev, newTier);
      if (effectivePersist && next !== prev) {
        persistStateToStorage(next);
      }
      return next;
    });
  }, [simulatorEnabled, effectivePersist]);

  /**
   * Aggiorna il ruolo RBAC simulato se consentito nel Tier attivo, azzerando la licenza se non clinico.
   * No-op quando simulatorEnabled e false (modalita produzione JWT-backed).
   * @param newRole Nuovo ruolo RBAC da impostare
   */
  const setRole = useCallback((newRole: UserRole): void => {
    if (!simulatorEnabled) {
      return;
    }
    setState((prev) => {
      const next = applyRoleChange(prev, newRole);
      if (effectivePersist && next !== prev) {
        persistStateToStorage(next);
      }
      return next;
    });
  }, [simulatorEnabled, effectivePersist]);

  /**
   * Imposta la licenza clinica applicando la guardia Art. 348 c.p. (solo Tier >= 2 e ruoli abilitati).
   * No-op quando simulatorEnabled e false (modalita produzione JWT-backed).
   * @param allowed Flag di attivazione licenza clinica
   */
  const setHasClinicalLicense = useCallback((allowed: boolean): void => {
    if (!simulatorEnabled) {
      return;
    }
    setState((prev) => {
      const next = applyClinicalLicenseChange(prev, allowed);
      if (effectivePersist && next !== prev) {
        persistStateToStorage(next);
      }
      return next;
    });
  }, [simulatorEnabled, effectivePersist]);

  /**
   * Ripristina lo stato iniziale configurato sul TierProvider (props o default di modulo) e pulisce lo storage.
   * No-op quando simulatorEnabled e false (modalita produzione JWT-backed).
   */
  const resetToDefaults = useCallback((): void => {
    if (!simulatorEnabled) {
      return;
    }
    setState(baselineState);
    if (effectivePersist) {
      removeStorageSafe(STORAGE_KEY_TIER);
      removeStorageSafe(STORAGE_KEY_ROLE);
      removeStorageSafe(STORAGE_KEY_CLINICAL_LICENSE);
    }
  }, [simulatorEnabled, effectivePersist, baselineState]);

  const permissions: TierFeaturePermissions = useMemo(
    () => computeEffectivePermissions(state.tier, state.role),
    [state.tier, state.role]
  );

  /**
   * Verifica se una specifica feature booleana e abilitata per la coppia (tier, role) corrente.
   * @param permissionKey Chiave del permesso booleano in TierFeaturePermissions
   * @returns true se la feature e autorizzata
   */
  const hasAccess = useCallback((permissionKey: TierBooleanFeatureKey): boolean => {
    return Boolean(permissions[permissionKey]);
  }, [permissions]);

  /**
   * Verifica se un modulo applicativo e accessibile nell'abbonamento corrente.
   * @param moduleId Identificativo del modulo applicativo
   * @returns true se il modulo e presente tra quelli autorizzati
   */
  const isModuleAllowed = useCallback((moduleId: AppModuleId): boolean => {
    return permissions.allowedModules.includes(moduleId);
  }, [permissions]);

  const isTier1 = state.tier === TIER_LEVEL_CONSUMER;
  const isTier2 = state.tier === TIER_LEVEL_PRO;
  const isTier3 = state.tier === TIER_LEVEL_ELITE;
  const isClinical = isClinicalStaff(state.role);
  const canPrescribeDiet = canPrescribeNutrition(state.role, state.hasClinicalLicense);
  const maxAthletes = permissions.maxAthletes;
  const dataSilo = resolveDataSilo(state.tier, state.role);

  const contextValue: TierContextValue = useMemo(() => {
    return {
      tier: state.tier,
      role: state.role,
      hasClinicalLicense: state.hasClinicalLicense,
      simulatorEnabled,
      permissions,
      maxAthletes,
      dataSilo,
      isTier1,
      isTier2,
      isTier3,
      isClinical,
      canPrescribeDiet,
      setTier,
      setRole,
      setHasClinicalLicense,
      hasAccess,
      isModuleAllowed,
      resetToDefaults
    };
  }, [
    state.tier,
    state.role,
    state.hasClinicalLicense,
    simulatorEnabled,
    permissions,
    maxAthletes,
    dataSilo,
    isTier1,
    isTier2,
    isTier3,
    isClinical,
    canPrescribeDiet,
    setTier,
    setRole,
    setHasClinicalLicense,
    hasAccess,
    isModuleAllowed,
    resetToDefaults
  ]);

  return (
    <TierContext.Provider value={contextValue}>
      {children}
    </TierContext.Provider>
  );
};

/**
 * Hook interno per accedere al contesto TierContext.
 * Solleva un errore chiaro se invocato fuori da un TierProvider.
 * @returns Valore tipizzato del contesto Tier
 */
export function useTierContext(): TierContextValue {
  const context = useContext(TierContext);
  if (!context) {
    throw new Error(CONTEXT_ERROR_MESSAGE);
  }
  return context;
}
