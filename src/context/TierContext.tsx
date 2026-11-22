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
  SILO1_CONSUMER,
  SILO2_CLUB_BUNKER,
  SILO3_RESEARCH,
  isClinicalStaff,
  canPrescribeNutrition
} from '../types';

export const STORAGE_KEY_TIER = 't7_simulated_tier';
export const STORAGE_KEY_ROLE = 't7_simulated_role';
export const STORAGE_KEY_CLINICAL_LICENSE = 't7_simulated_clinical_license';

export const DEFAULT_TIER: TierLevel = TIER_LEVEL_CONSUMER;
export const DEFAULT_ROLE: UserRole = 'athlete';
export const DEFAULT_CLINICAL_LICENSE = false;

export type TierBooleanFeatureKey =
  | 'canExportRawExcel'
  | 'canAccessAdvancedBiomechanics'
  | 'canAccessMultiStaffBunker'
  | 'canAccessResearchWarehouse'
  | 'hasCustomBranding';

export interface TierContextValue {
  tier: TierLevel;
  role: UserRole;
  hasClinicalLicense: boolean;
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
  children: React.ReactNode;
  defaultTier?: TierLevel;
  defaultRole?: UserRole;
  defaultClinicalLicense?: boolean;
  persistState?: boolean;
}

/**
 * Type guard runtime per verificare la validita di un livello Tier.
 * @param value Valore da esaminare
 * @returns true se il valore e un TierLevel valido
 */
export function isValidTier(value: unknown): value is TierLevel {
  return value === 'tier1' || value === 'tier2' || value === 'tier3';
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
  return (
    value === 'athlete' ||
    value === 'head_coach' ||
    value === 'sc_coach' ||
    value === 'physiotherapist' ||
    value === 'team_doctor' ||
    value === 'match_analyst' ||
    value === 'researcher' ||
    value === 'admin'
  );
}

/**
 * Risolve la partizione del Silo dati multi-tenant in base a Tier e Ruolo.
 * Conforme ad ADR-02 (3 Silos Stagni).
 * @param tier Livello di abbonamento attivo
 * @param role Ruolo RBAC dell'utente
 * @returns Partizione isolata di appartenenza (Silo 1, Silo 2 o Silo 3)
 */
export function resolveDataSilo(tier: TierLevel, role: UserRole): DataSiloPartition {
  if (role === 'researcher') {
    return SILO3_RESEARCH;
  }
  if (tier === 'tier3') {
    return SILO2_CLUB_BUNKER;
  }
  return SILO1_CONSUMER;
}

/**
 * Lettura protetta da storage locale con gestione SSR e sandbox browsers.
 * @param key Chiave di storage
 * @returns Stringa salvata o null
 */
function readStorageSafe(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Accesso storage non disponibile o bloccato dalle policy browser
  }
  return null;
}

/**
 * Scrittura protetta in storage locale con gestione SSR e sandbox browsers.
 * @param key Chiave di storage
 * @param value Valore da salvare
 */
function writeStorageSafe(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Accesso storage non disponibile o bloccato dalle policy browser
  }
}

/**
 * Rimozione protetta da storage locale con gestione SSR e sandbox browsers.
 * @param key Chiave di storage
 */
function removeStorageSafe(key: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Accesso storage non disponibile o bloccato dalle policy browser
  }
}

export const TierContext = createContext<TierContextValue | null>(null);

/**
 * Componente Provider per la diffusione reattiva del Tier e dei permessi RBAC.
 * @param props Proprieta del provider (figli, configurazione iniziale e persistenza)
 * @returns Elemento React Provider con memoizzazione ottimale
 */
export const TierProvider: React.FC<TierProviderProps> = ({
  children,
  defaultTier,
  defaultRole,
  defaultClinicalLicense,
  persistState = true
}) => {
  const [tier, setTierState] = useState<TierLevel>(() => {
    if (defaultTier && isValidTier(defaultTier)) {
      return defaultTier;
    }
    if (persistState) {
      const stored = readStorageSafe(STORAGE_KEY_TIER);
      if (isValidTier(stored)) {
        return stored;
      }
    }
    return DEFAULT_TIER;
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    if (defaultRole && isValidRole(defaultRole)) {
      return defaultRole;
    }
    if (persistState) {
      const stored = readStorageSafe(STORAGE_KEY_ROLE);
      if (isValidRole(stored)) {
        return stored;
      }
    }
    return DEFAULT_ROLE;
  });

  const [hasClinicalLicense, setClinicalLicenseState] = useState<boolean>(() => {
    if (typeof defaultClinicalLicense === 'boolean') {
      return defaultClinicalLicense;
    }
    if (persistState) {
      const stored = readStorageSafe(STORAGE_KEY_CLINICAL_LICENSE);
      if (stored === 'true') {
        return true;
      }
      if (stored === 'false') {
        return false;
      }
    }
    return DEFAULT_CLINICAL_LICENSE;
  });

  const setTier = useCallback((newTier: TierLevel): void => {
    if (!isValidTier(newTier)) {
      return;
    }
    setTierState(newTier);
    if (persistState) {
      writeStorageSafe(STORAGE_KEY_TIER, newTier);
    }
  }, [persistState]);

  const setRole = useCallback((newRole: UserRole): void => {
    if (!isValidRole(newRole)) {
      return;
    }
    setRoleState(newRole);
    if (persistState) {
      writeStorageSafe(STORAGE_KEY_ROLE, newRole);
    }
  }, [persistState]);

  const setHasClinicalLicense = useCallback((allowed: boolean): void => {
    const boolValue = Boolean(allowed);
    setClinicalLicenseState(boolValue);
    if (persistState) {
      writeStorageSafe(STORAGE_KEY_CLINICAL_LICENSE, String(boolValue));
    }
  }, [persistState]);

  const resetToDefaults = useCallback((): void => {
    setTierState(DEFAULT_TIER);
    setRoleState(DEFAULT_ROLE);
    setClinicalLicenseState(DEFAULT_CLINICAL_LICENSE);
    if (persistState) {
      removeStorageSafe(STORAGE_KEY_TIER);
      removeStorageSafe(STORAGE_KEY_ROLE);
      removeStorageSafe(STORAGE_KEY_CLINICAL_LICENSE);
    }
  }, [persistState]);

  const permissions: TierFeaturePermissions = useMemo(() => {
    return TIER_PERMISSIONS_MATRIX[tier] || TIER_PERMISSIONS_MATRIX[DEFAULT_TIER];
  }, [tier]);

  const hasAccess = useCallback((permissionKey: TierBooleanFeatureKey): boolean => {
    return Boolean(permissions[permissionKey]);
  }, [permissions]);

  const isModuleAllowed = useCallback((moduleId: AppModuleId): boolean => {
    return permissions.allowedModules.includes(moduleId);
  }, [permissions]);

  const isTier1 = tier === 'tier1';
  const isTier2 = tier === 'tier2';
  const isTier3 = tier === 'tier3';
  const isClinical = isClinicalStaff(role);
  const canPrescribeDiet = canPrescribeNutrition(role, hasClinicalLicense);
  const maxAthletes = permissions.maxAthletes;
  const dataSilo = resolveDataSilo(tier, role);

  const contextValue: TierContextValue = useMemo(() => {
    return {
      tier,
      role,
      hasClinicalLicense,
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
    tier,
    role,
    hasClinicalLicense,
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
    throw new Error('useTierContext must be used within a TierProvider');
  }
  return context;
}
