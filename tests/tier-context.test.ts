/**
 * tests/tier-context.test.ts
 * Suite di test unitari per il Tier & RBAC Context Provider (TASK-004).
 * Verifica matrici permessi, gating congiunto (tier, role), guardie runtime,
 * Silos ADR-02, GDPR Art. 9, Art. 348 c.p., persistenza localStorage e React Context.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  TierProvider,
  useTierContext,
  isValidTier,
  isValidRole,
  isRoleAllowedInTier,
  normalizeRoleForTier,
  canHoldClinicalLicense,
  resolveDataSilo,
  computeEffectivePermissions,
  resolveBaselineState,
  applyTierChange,
  applyRoleChange,
  applyClinicalLicenseChange,
  DEFAULT_TIER,
  DEFAULT_ROLE,
  DEFAULT_CLINICAL_LICENSE,
  STORAGE_KEY_TIER,
  STORAGE_KEY_ROLE,
  STORAGE_KEY_CLINICAL_LICENSE,
  TierRbacState
} from '../src/context/TierContext';
import { useTier } from '../src/hooks/useTier';
import {
  TIER_PERMISSIONS_MATRIX,
  TIER_LEVEL_CONSUMER,
  TIER_LEVEL_PRO,
  TIER_LEVEL_ELITE,
  MAX_ATHLETES_TIER1,
  MAX_ATHLETES_TIER2,
  MAX_ATHLETES_TIER3,
  SILO1_CONSUMER,
  SILO2_CLUB_BUNKER,
  SILO3_RESEARCH
} from '../src/types/tier';

console.log('--- STARTING TIER & RBAC CONTEXT TEST SUITE ---');

// -------------------------------------------------------------
// Helper locale per simulare window.localStorage in ambiente Node SSR
// -------------------------------------------------------------
function withMockLocalStorage(initialEntries: Record<string, string>, fn: () => void): void {
  const store = new Map<string, string>(Object.entries(initialEntries));
  const mockStorage: Storage = {
    get length(): number {
      return store.size;
    },
    clear(): void {
      store.clear();
    },
    getItem(key: string): string | null {
      return store.has(key) ? (store.get(key) ?? null) : null;
    },
    key(index: number): string | null {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value));
    }
  };

  const globalRef = globalThis as typeof globalThis & { window?: Window & typeof globalThis };
  const previousWindow = globalRef.window;
  const hadWindow = 'window' in globalRef;

  globalRef.window = { localStorage: mockStorage } as unknown as Window & typeof globalThis;
  try {
    fn();
  } finally {
    if (hadWindow) {
      globalRef.window = previousWindow;
    } else {
      Reflect.deleteProperty(globalRef, 'window');
    }
  }
}

// -------------------------------------------------------------
// 1. Validazione Runtime Type Guards (inclusi nuovi ruoli)
// -------------------------------------------------------------
console.log('[Test 1] Testing runtime type guards (isValidTier, isValidRole)...');
assert.strictEqual(isValidTier(TIER_LEVEL_CONSUMER), true);
assert.strictEqual(isValidTier(TIER_LEVEL_PRO), true);
assert.strictEqual(isValidTier(TIER_LEVEL_ELITE), true);
assert.strictEqual(isValidTier('tier4'), false);
assert.strictEqual(isValidTier(null), false);
assert.strictEqual(isValidTier(undefined), false);
assert.strictEqual(isValidTier(123), false);
assert.strictEqual(isValidTier(''), false);

assert.strictEqual(isValidRole('athlete'), true);
assert.strictEqual(isValidRole('head_coach'), true);
assert.strictEqual(isValidRole('sc_coach'), true);
assert.strictEqual(isValidRole('physiotherapist'), true);
assert.strictEqual(isValidRole('team_doctor'), true);
assert.strictEqual(isValidRole('sports_doctor'), true);
assert.strictEqual(isValidRole('clinical_nutritionist'), true);
assert.strictEqual(isValidRole('dietitian'), true);
assert.strictEqual(isValidRole('match_analyst'), true);
assert.strictEqual(isValidRole('researcher'), true);
assert.strictEqual(isValidRole('admin'), true);
assert.strictEqual(isValidRole('superadmin'), false);
assert.strictEqual(isValidRole('guest'), false);
assert.strictEqual(isValidRole(null), false);
assert.strictEqual(isValidRole(42), false);

// -------------------------------------------------------------
// 2. Risoluzione Multi-Tenant Data Silo (ADR-02)
// -------------------------------------------------------------
console.log('[Test 2] Testing multi-tenant data silo resolution (resolveDataSilo)...');
assert.strictEqual(resolveDataSilo(TIER_LEVEL_CONSUMER, 'athlete'), SILO1_CONSUMER);
assert.strictEqual(resolveDataSilo(TIER_LEVEL_CONSUMER, 'researcher'), SILO1_CONSUMER);
assert.strictEqual(resolveDataSilo(TIER_LEVEL_PRO, 'head_coach'), SILO1_CONSUMER);
assert.strictEqual(resolveDataSilo(TIER_LEVEL_PRO, 'researcher'), SILO1_CONSUMER);
assert.strictEqual(resolveDataSilo(TIER_LEVEL_ELITE, 'athlete'), SILO1_CONSUMER);
assert.strictEqual(resolveDataSilo(TIER_LEVEL_ELITE, 'head_coach'), SILO2_CLUB_BUNKER);
assert.strictEqual(resolveDataSilo(TIER_LEVEL_ELITE, 'team_doctor'), SILO2_CLUB_BUNKER);
assert.strictEqual(resolveDataSilo(TIER_LEVEL_ELITE, 'clinical_nutritionist'), SILO2_CLUB_BUNKER);
assert.strictEqual(resolveDataSilo(TIER_LEVEL_ELITE, 'researcher'), SILO3_RESEARCH);

// -------------------------------------------------------------
// 3. Matrice Permessi Statici e Permessi Congiunti (Tier x Role)
// -------------------------------------------------------------
console.log('[Test 3] Testing static permissions matrix and joint (tier, role) permissions...');
const p1 = TIER_PERMISSIONS_MATRIX.tier1;
assert.strictEqual(p1.tier, TIER_LEVEL_CONSUMER);
assert.strictEqual(p1.maxAthletes, MAX_ATHLETES_TIER1);
assert.strictEqual(p1.canExportRawExcel, false);
assert.strictEqual(p1.canAccessAdvancedBiomechanics, false);
assert.strictEqual(p1.canAccessMultiStaffBunker, false);
assert.strictEqual(p1.canAccessResearchWarehouse, false);
assert.strictEqual(p1.hasCustomBranding, false);
assert.strictEqual(p1.allowedModules.includes('cockpit'), true);
assert.strictEqual(p1.allowedModules.includes('companion_together'), false);
assert.strictEqual(p1.allowedModules.includes('companion_movely'), false);

const p2 = TIER_PERMISSIONS_MATRIX.tier2;
assert.strictEqual(p2.tier, TIER_LEVEL_PRO);
assert.strictEqual(p2.maxAthletes, MAX_ATHLETES_TIER2);
assert.strictEqual(p2.canExportRawExcel, true);
assert.strictEqual(p2.canAccessAdvancedBiomechanics, true);
assert.strictEqual(p2.canAccessMultiStaffBunker, false);
assert.strictEqual(p2.canAccessResearchWarehouse, false);
assert.strictEqual(p2.hasCustomBranding, false);
assert.strictEqual(p2.allowedModules.includes('companion_together'), true);
assert.strictEqual(p2.allowedModules.includes('companion_movely'), false);

const p3 = TIER_PERMISSIONS_MATRIX.tier3;
assert.strictEqual(p3.tier, TIER_LEVEL_ELITE);
assert.strictEqual(p3.maxAthletes, MAX_ATHLETES_TIER3);
assert.strictEqual(p3.canExportRawExcel, true);
assert.strictEqual(p3.canAccessAdvancedBiomechanics, true);
assert.strictEqual(p3.canAccessMultiStaffBunker, true);
assert.strictEqual(p3.canAccessResearchWarehouse, false);
assert.strictEqual(p3.hasCustomBranding, true);
assert.strictEqual(p3.allowedModules.includes('companion_movely'), true);
assert.strictEqual(p3.allowedModules.includes('companion_together'), true);
assert.strictEqual(p3.allowedModules.includes('rag'), true);

// Athlete in Tier 3 NON accede a Bunker, Export Excel, Research Warehouse, Branding o roster multi-atleta
const t3AthletePerms = computeEffectivePermissions(TIER_LEVEL_ELITE, 'athlete');
assert.strictEqual(t3AthletePerms.maxAthletes, MAX_ATHLETES_TIER1);
assert.strictEqual(t3AthletePerms.canExportRawExcel, false);
assert.strictEqual(t3AthletePerms.canAccessMultiStaffBunker, false);
assert.strictEqual(t3AthletePerms.canAccessResearchWarehouse, false);
assert.strictEqual(t3AthletePerms.hasCustomBranding, false);

// Staff in Tier 3 accede a Bunker & Export Excel ma NON a Research Warehouse
const t3CoachPerms = computeEffectivePermissions(TIER_LEVEL_ELITE, 'head_coach');
assert.strictEqual(t3CoachPerms.maxAthletes, MAX_ATHLETES_TIER3);
assert.strictEqual(t3CoachPerms.canExportRawExcel, true);
assert.strictEqual(t3CoachPerms.canAccessMultiStaffBunker, true);
assert.strictEqual(t3CoachPerms.canAccessResearchWarehouse, false);
assert.strictEqual(t3CoachPerms.hasCustomBranding, true);

// Solo 'researcher' in Tier 3 accede a Research Warehouse (e NON a Club Bunker)
const t3ResearcherPerms = computeEffectivePermissions(TIER_LEVEL_ELITE, 'researcher');
assert.strictEqual(t3ResearcherPerms.canAccessResearchWarehouse, true);
assert.strictEqual(t3ResearcherPerms.canAccessMultiStaffBunker, false);
assert.strictEqual(t3ResearcherPerms.canExportRawExcel, false);

// -------------------------------------------------------------
// 4. Ruoli Consentiti per Tier, Transizioni RBAC & Guardia Art. 348 c.p.
// -------------------------------------------------------------
console.log('[Test 4] Testing allowed roles per tier, transitions, and Art. 348 c.p. guard...');
assert.strictEqual(isRoleAllowedInTier(TIER_LEVEL_CONSUMER, 'athlete'), true);
assert.strictEqual(isRoleAllowedInTier(TIER_LEVEL_CONSUMER, 'head_coach'), false);
assert.strictEqual(isRoleAllowedInTier(TIER_LEVEL_CONSUMER, 'clinical_nutritionist'), false);
assert.strictEqual(isRoleAllowedInTier(TIER_LEVEL_PRO, 'clinical_nutritionist'), true);
assert.strictEqual(isRoleAllowedInTier(TIER_LEVEL_PRO, 'dietitian'), true);
assert.strictEqual(isRoleAllowedInTier(TIER_LEVEL_PRO, 'sports_doctor'), true);
assert.strictEqual(isRoleAllowedInTier(TIER_LEVEL_PRO, 'team_doctor'), false);
assert.strictEqual(isRoleAllowedInTier(TIER_LEVEL_PRO, 'researcher'), false);
assert.strictEqual(isRoleAllowedInTier(TIER_LEVEL_ELITE, 'team_doctor'), true);
assert.strictEqual(isRoleAllowedInTier(TIER_LEVEL_ELITE, 'researcher'), true);
assert.strictEqual(normalizeRoleForTier(TIER_LEVEL_CONSUMER, 'team_doctor'), 'athlete');

assert.strictEqual(canHoldClinicalLicense(TIER_LEVEL_CONSUMER, 'athlete'), false);
assert.strictEqual(canHoldClinicalLicense(TIER_LEVEL_CONSUMER, 'clinical_nutritionist'), false);
assert.strictEqual(canHoldClinicalLicense(TIER_LEVEL_PRO, 'sc_coach'), false);
assert.strictEqual(canHoldClinicalLicense(TIER_LEVEL_PRO, 'physiotherapist'), false);
assert.strictEqual(canHoldClinicalLicense(TIER_LEVEL_PRO, 'clinical_nutritionist'), true);
assert.strictEqual(canHoldClinicalLicense(TIER_LEVEL_PRO, 'dietitian'), true);
assert.strictEqual(canHoldClinicalLicense(TIER_LEVEL_PRO, 'sports_doctor'), true);
assert.strictEqual(canHoldClinicalLicense(TIER_LEVEL_ELITE, 'team_doctor'), true);

// Transizioni di stato pure
const initial: TierRbacState = {
  tier: TIER_LEVEL_CONSUMER,
  role: 'athlete',
  hasClinicalLicense: false
};
// Blocco Art. 348 c.p. in Tier 1 / athlete
assert.deepStrictEqual(applyClinicalLicenseChange(initial, true), initial);
// Blocco ruolo non consentito in Tier 1
assert.deepStrictEqual(applyRoleChange(initial, 'researcher'), initial);

// Upgrade a Tier 2 + ruolo sc_coach -> licenza clinica ancora bloccata
const t2Coach = applyRoleChange(applyTierChange(initial, TIER_LEVEL_PRO), 'sc_coach');
assert.deepStrictEqual(t2Coach, { tier: TIER_LEVEL_PRO, role: 'sc_coach', hasClinicalLicense: false });
assert.deepStrictEqual(applyClinicalLicenseChange(t2Coach, true), t2Coach);

// Switch a clinical_nutritionist in Tier 2 -> licenza clinica consentita
const t2Nutri = applyClinicalLicenseChange(applyRoleChange(t2Coach, 'clinical_nutritionist'), true);
assert.deepStrictEqual(t2Nutri, { tier: TIER_LEVEL_PRO, role: 'clinical_nutritionist', hasClinicalLicense: true });

// Downgrade a Tier 1 -> ruolo torna ad 'athlete' e licenza clinica azzerata a false
const downgradedT1 = applyTierChange(t2Nutri, TIER_LEVEL_CONSUMER);
assert.deepStrictEqual(downgradedT1, { tier: TIER_LEVEL_CONSUMER, role: 'athlete', hasClinicalLicense: false });

// Tier 3 team_doctor con licenza -> switch a sc_coach azzera la licenza
const t3Doctor: TierRbacState = { tier: TIER_LEVEL_ELITE, role: 'team_doctor', hasClinicalLicense: true };
const t3Coach = applyRoleChange(t3Doctor, 'sc_coach');
assert.deepStrictEqual(t3Coach, { tier: TIER_LEVEL_ELITE, role: 'sc_coach', hasClinicalLicense: false });

// Tier 3 team_doctor -> downgrade a Tier 2 ('team_doctor' non ammesso in Tier 2) -> 'athlete' + false
const downgradedT2 = applyTierChange(t3Doctor, TIER_LEVEL_PRO);
assert.deepStrictEqual(downgradedT2, { tier: TIER_LEVEL_PRO, role: 'athlete', hasClinicalLicense: false });

// Baseline reset resolution preserva props configurate sul Provider
assert.deepStrictEqual(
  resolveBaselineState(TIER_LEVEL_PRO, 'clinical_nutritionist', true),
  { tier: TIER_LEVEL_PRO, role: 'clinical_nutritionist', hasClinicalLicense: true }
);
assert.deepStrictEqual(
  resolveBaselineState(TIER_LEVEL_CONSUMER, 'team_doctor', true),
  { tier: TIER_LEVEL_CONSUMER, role: 'athlete', hasClinicalLicense: false }
);

// -------------------------------------------------------------
// 5. React Context Provider, hasAccess, isModuleAllowed & useTierContext Rendering
// -------------------------------------------------------------
console.log('[Test 5] Testing TierProvider, hasAccess, isModuleAllowed and static rendering...');

function ConsumerComponent() {
  const ctx = useTierContext();
  return React.createElement(
    'div',
    { 'data-testid': 'tier-info' },
    `${ctx.tier}|${ctx.role}|${ctx.dataSilo}|${ctx.isTier1}|${ctx.isClinical}|${ctx.canPrescribeDiet}|${ctx.maxAthletes}|${ctx.hasAccess('canAccessMultiStaffBunker')}|${ctx.isModuleAllowed('rag')}`
  );
}

// Default provider
const defaultMarkup = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    { persistState: false },
    React.createElement(ConsumerComponent)
  )
);
assert.strictEqual(
  defaultMarkup,
  `<div data-testid="tier-info">${DEFAULT_TIER}|${DEFAULT_ROLE}|silo1_consumer|true|false|false|${MAX_ATHLETES_TIER1}|false|false</div>`
);

// Tier 2 Pro Coach with physiotherapist role (clinico GDPR Art. 9, non prescrittore dieta)
const proMarkup = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    {
      defaultTier: TIER_LEVEL_PRO,
      defaultRole: 'physiotherapist',
      defaultClinicalLicense: true,
      persistState: false
    },
    React.createElement(ConsumerComponent)
  )
);
assert.strictEqual(
  proMarkup,
  `<div data-testid="tier-info">tier2|physiotherapist|silo1_consumer|false|true|false|${MAX_ATHLETES_TIER2}|false|false</div>`
);

// Tier 3 Elite Club with team_doctor WITHOUT clinical license -> canPrescribeDiet = false
const doctorUnlicensedMarkup = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    {
      defaultTier: TIER_LEVEL_ELITE,
      defaultRole: 'team_doctor',
      defaultClinicalLicense: false,
      persistState: false
    },
    React.createElement(ConsumerComponent)
  )
);
assert.strictEqual(
  doctorUnlicensedMarkup,
  `<div data-testid="tier-info">tier3|team_doctor|silo2_club_bunker|false|true|false|${MAX_ATHLETES_TIER3}|true|true</div>`
);

// Tier 3 Elite Club with team_doctor WITH clinical license -> canPrescribeDiet = true
const doctorLicensedMarkup = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    {
      defaultTier: TIER_LEVEL_ELITE,
      defaultRole: 'team_doctor',
      defaultClinicalLicense: true,
      persistState: false
    },
    React.createElement(ConsumerComponent)
  )
);
assert.strictEqual(
  doctorLicensedMarkup,
  `<div data-testid="tier-info">tier3|team_doctor|silo2_club_bunker|false|true|true|${MAX_ATHLETES_TIER3}|true|true</div>`
);

// Tier 2 clinical_nutritionist WITH clinical license -> canPrescribeDiet = true
const nutritionistMarkup = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    {
      defaultTier: TIER_LEVEL_PRO,
      defaultRole: 'clinical_nutritionist',
      defaultClinicalLicense: true,
      persistState: false
    },
    React.createElement(ConsumerComponent)
  )
);
assert.strictEqual(
  nutritionistMarkup,
  `<div data-testid="tier-info">tier2|clinical_nutritionist|silo1_consumer|false|true|true|${MAX_ATHLETES_TIER2}|false|false</div>`
);

// -------------------------------------------------------------
// 6. Test Consumer Hook useTier & Feature Shortcuts (Tier x Role)
// -------------------------------------------------------------
console.log('[Test 6] Testing useTier consumer hook shortcuts across roles...');

function ShortcutConsumer() {
  const tierHook = useTier();
  return React.createElement(
    'span',
    { 'data-testid': 'shortcuts' },
    `${tierHook.canExportExcel}:${tierHook.canAccessBiomechanics}:${tierHook.canAccessBunker}:${tierHook.canAccessResearch}:${tierHook.hasCustomBranding}:${tierHook.simulatorEnabled}`
  );
}

// Tier 1 athlete
const t1Shortcuts = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    { defaultTier: TIER_LEVEL_CONSUMER, persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(t1Shortcuts, '<span data-testid="shortcuts">false:false:false:false:false:true</span>');

// Tier 2 head_coach
const t2CoachShortcuts = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    { defaultTier: TIER_LEVEL_PRO, defaultRole: 'head_coach', persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(t2CoachShortcuts, '<span data-testid="shortcuts">true:true:false:false:false:true</span>');

// Tier 3 athlete (bloccato da Bunker, Excel, Research, Branding)
const t3AthleteShortcuts = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    { defaultTier: TIER_LEVEL_ELITE, defaultRole: 'athlete', persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(t3AthleteShortcuts, '<span data-testid="shortcuts">false:true:false:false:false:true</span>');

// Tier 3 head_coach (Bunker + Excel + Branding, no Research Warehouse)
const t3CoachShortcuts = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    { defaultTier: TIER_LEVEL_ELITE, defaultRole: 'head_coach', persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(t3CoachShortcuts, '<span data-testid="shortcuts">true:true:true:false:true:true</span>');

// Tier 3 researcher (Research Warehouse attivo, Bunker disabilitato)
const t3ResearchShortcuts = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    { defaultTier: TIER_LEVEL_ELITE, defaultRole: 'researcher', persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(t3ResearchShortcuts, '<span data-testid="shortcuts">false:true:false:true:false:true</span>');

// -------------------------------------------------------------
// 7. Persistenza localStorage, Recovery Valori Corrotti e simulatorEnabled=false
// -------------------------------------------------------------
console.log('[Test 7] Testing localStorage persistence, corrupt recovery, and simulatorEnabled=false...');

// 7a. Ripristino valido da localStorage
withMockLocalStorage(
  {
    [STORAGE_KEY_TIER]: 'tier2',
    [STORAGE_KEY_ROLE]: 'clinical_nutritionist',
    [STORAGE_KEY_CLINICAL_LICENSE]: 'true'
  },
  () => {
    const persistedHtml = renderToStaticMarkup(
      React.createElement(
        TierProvider,
        { persistState: true },
        React.createElement(ConsumerComponent)
      )
    );
    assert.strictEqual(
      persistedHtml,
      `<div data-testid="tier-info">tier2|clinical_nutritionist|silo1_consumer|false|true|true|${MAX_ATHLETES_TIER2}|false|false</div>`
    );
  }
);

// 7b. Recovery da valori corrotti o incompatibili in localStorage
withMockLocalStorage(
  {
    [STORAGE_KEY_TIER]: 'tier99_corrupt',
    [STORAGE_KEY_ROLE]: 'root_hacker',
    [STORAGE_KEY_CLINICAL_LICENSE]: 'maybe'
  },
  () => {
    const recoveredHtml = renderToStaticMarkup(
      React.createElement(
        TierProvider,
        { persistState: true },
        React.createElement(ConsumerComponent)
      )
    );
    assert.strictEqual(
      recoveredHtml,
      `<div data-testid="tier-info">tier1|athlete|silo1_consumer|true|false|false|${MAX_ATHLETES_TIER1}|false|false</div>`
    );
  }
);

// 7c. Sanitizzazione incrociata (tier1 in storage ma role researcher e clinical true)
withMockLocalStorage(
  {
    [STORAGE_KEY_TIER]: 'tier1',
    [STORAGE_KEY_ROLE]: 'researcher',
    [STORAGE_KEY_CLINICAL_LICENSE]: 'true'
  },
  () => {
    const sanitizedHtml = renderToStaticMarkup(
      React.createElement(
        TierProvider,
        { persistState: true },
        React.createElement(ConsumerComponent)
      )
    );
    assert.strictEqual(
      sanitizedHtml,
      `<div data-testid="tier-info">tier1|athlete|silo1_consumer|true|false|false|${MAX_ATHLETES_TIER1}|false|false</div>`
    );
  }
);

// 7d. simulatorEnabled=false ignora localStorage simulato
withMockLocalStorage(
  {
    [STORAGE_KEY_TIER]: 'tier3',
    [STORAGE_KEY_ROLE]: 'researcher',
    [STORAGE_KEY_CLINICAL_LICENSE]: 'true'
  },
  () => {
    const prodHtml = renderToStaticMarkup(
      React.createElement(
        TierProvider,
        { persistState: true, simulatorEnabled: false },
        React.createElement(ShortcutConsumer)
      )
    );
    assert.strictEqual(
      prodHtml,
      '<span data-testid="shortcuts">false:false:false:false:false:false</span>'
    );
  }
);

// -------------------------------------------------------------
// 8. Test Errore Invocazione Fuori da TierProvider
// -------------------------------------------------------------
console.log('[Test 8] Testing error throw when useTierContext is called outside provider...');
assert.throws(() => {
  renderToStaticMarkup(React.createElement(ConsumerComponent));
}, (err: Error) => {
  return err.message === 'useTierContext must be used within a TierProvider';
});

// -------------------------------------------------------------
// 9. Test Costanti e Chiavi di Configurazione
// -------------------------------------------------------------
console.log('[Test 9] Verifying uppercase constants...');
assert.strictEqual(STORAGE_KEY_TIER, 't7_simulated_tier');
assert.strictEqual(STORAGE_KEY_ROLE, 't7_simulated_role');
assert.strictEqual(STORAGE_KEY_CLINICAL_LICENSE, 't7_simulated_clinical_license');
assert.strictEqual(DEFAULT_TIER, TIER_LEVEL_CONSUMER);
assert.strictEqual(DEFAULT_ROLE, 'athlete');
assert.strictEqual(DEFAULT_CLINICAL_LICENSE, false);

console.log('--- ALL TIER & RBAC CONTEXT TESTS PASSED (100% OK) ---');
