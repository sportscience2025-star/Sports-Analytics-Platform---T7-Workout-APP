/**
 * tests/tier-context.test.ts
 * Suite di test unitari per il Tier & RBAC Context Provider (TASK-004).
 * Verifica matrici permessi, guardie runtime, GDPR Art. 9, Art. 348 c.p., e comportamento React Context.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  TierProvider,
  useTierContext,
  isValidTier,
  isValidRole,
  resolveDataSilo,
  DEFAULT_TIER,
  DEFAULT_ROLE,
  DEFAULT_CLINICAL_LICENSE,
  STORAGE_KEY_TIER,
  STORAGE_KEY_ROLE,
  STORAGE_KEY_CLINICAL_LICENSE
} from '../src/context/TierContext';
import { useTier } from '../src/hooks/useTier';
import {
  TIER_PERMISSIONS_MATRIX,
  MAX_ATHLETES_TIER1,
  MAX_ATHLETES_TIER2,
  MAX_ATHLETES_TIER3,
  SILO1_CONSUMER,
  SILO2_CLUB_BUNKER,
  SILO3_RESEARCH
} from '../src/types/tier';

console.log('--- STARTING TIER & RBAC CONTEXT TEST SUITE ---');

// -------------------------------------------------------------
// 1. Validazione Runtime Type Guards
// -------------------------------------------------------------
console.log('[Test 1] Testing runtime type guards (isValidTier, isValidRole)...');
assert.strictEqual(isValidTier('tier1'), true);
assert.strictEqual(isValidTier('tier2'), true);
assert.strictEqual(isValidTier('tier3'), true);
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
assert.strictEqual(resolveDataSilo('tier1', 'athlete'), SILO1_CONSUMER);
assert.strictEqual(resolveDataSilo('tier2', 'head_coach'), SILO1_CONSUMER);
assert.strictEqual(resolveDataSilo('tier3', 'head_coach'), SILO2_CLUB_BUNKER);
assert.strictEqual(resolveDataSilo('tier3', 'team_doctor'), SILO2_CLUB_BUNKER);
assert.strictEqual(resolveDataSilo('tier1', 'researcher'), SILO3_RESEARCH);
assert.strictEqual(resolveDataSilo('tier2', 'researcher'), SILO3_RESEARCH);
assert.strictEqual(resolveDataSilo('tier3', 'researcher'), SILO3_RESEARCH);

// -------------------------------------------------------------
// 3. Matrice Permessi e Gating Tier 1, Tier 2, Tier 3
// -------------------------------------------------------------
console.log('[Test 3] Testing permissions matrix integrity...');
const p1 = TIER_PERMISSIONS_MATRIX.tier1;
assert.strictEqual(p1.tier, 'tier1');
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
assert.strictEqual(p2.tier, 'tier2');
assert.strictEqual(p2.maxAthletes, MAX_ATHLETES_TIER2);
assert.strictEqual(p2.canExportRawExcel, true);
assert.strictEqual(p2.canAccessAdvancedBiomechanics, true);
assert.strictEqual(p2.canAccessMultiStaffBunker, false);
assert.strictEqual(p2.canAccessResearchWarehouse, false);
assert.strictEqual(p2.hasCustomBranding, false);
assert.strictEqual(p2.allowedModules.includes('companion_together'), true);
assert.strictEqual(p2.allowedModules.includes('companion_movely'), false);

const p3 = TIER_PERMISSIONS_MATRIX.tier3;
assert.strictEqual(p3.tier, 'tier3');
assert.strictEqual(p3.maxAthletes, MAX_ATHLETES_TIER3);
assert.strictEqual(p3.canExportRawExcel, true);
assert.strictEqual(p3.canAccessAdvancedBiomechanics, true);
assert.strictEqual(p3.canAccessMultiStaffBunker, true);
assert.strictEqual(p3.canAccessResearchWarehouse, true);
assert.strictEqual(p3.hasCustomBranding, true);
assert.strictEqual(p3.allowedModules.includes('companion_movely'), true);
assert.strictEqual(p3.allowedModules.includes('companion_together'), true);

// -------------------------------------------------------------
// 4. React Context Provider & useTierContext Rendering
// -------------------------------------------------------------
console.log('[Test 4] Testing TierProvider and useTierContext with static rendering...');

function ConsumerComponent() {
  const ctx = useTierContext();
  return React.createElement(
    'div',
    { 'data-testid': 'tier-info' },
    `${ctx.tier}|${ctx.role}|${ctx.dataSilo}|${ctx.isTier1}|${ctx.isClinical}|${ctx.canPrescribeDiet}|${ctx.maxAthletes}`
  );
}

// Rendering default provider
const defaultMarkup = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    { persistState: false },
    React.createElement(ConsumerComponent)
  )
);
assert.strictEqual(
  defaultMarkup,
  `<div data-testid="tier-info">${DEFAULT_TIER}|${DEFAULT_ROLE}|silo1_consumer|true|false|false|${MAX_ATHLETES_TIER1}</div>`
);

// Rendering Tier 2 Pro Coach with physiotherapist role
const proMarkup = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    {
      defaultTier: 'tier2',
      defaultRole: 'physiotherapist',
      defaultClinicalLicense: false,
      persistState: false
    },
    React.createElement(ConsumerComponent)
  )
);
assert.strictEqual(
  proMarkup,
  `<div data-testid="tier-info">tier2|physiotherapist|silo1_consumer|false|true|false|${MAX_ATHLETES_TIER2}</div>`
);

// Rendering Tier 3 Elite Club with team_doctor role (GDPR Art. 9 + Art. 348 c.p.)
const doctorMarkup = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    {
      defaultTier: 'tier3',
      defaultRole: 'team_doctor',
      defaultClinicalLicense: false,
      persistState: false
    },
    React.createElement(ConsumerComponent)
  )
);
assert.strictEqual(
  doctorMarkup,
  `<div data-testid="tier-info">tier3|team_doctor|silo2_club_bunker|false|true|true|${MAX_ATHLETES_TIER3}</div>`
);

// -------------------------------------------------------------
// 5. Test Consumer Hook useTier & Feature Shortcuts
// -------------------------------------------------------------
console.log('[Test 5] Testing useTier consumer hook shortcuts...');

function ShortcutConsumer() {
  const tierHook = useTier();
  return React.createElement(
    'span',
    { 'data-testid': 'shortcuts' },
    `${tierHook.canExportExcel}:${tierHook.canAccessBiomechanics}:${tierHook.canAccessBunker}:${tierHook.canAccessResearch}:${tierHook.hasCustomBranding}`
  );
}

// Tier 1 shortcuts
const t1Shortcuts = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    { defaultTier: 'tier1', persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(t1Shortcuts, '<span data-testid="shortcuts">false:false:false:false:false</span>');

// Tier 2 shortcuts
const t2Shortcuts = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    { defaultTier: 'tier2', persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(t2Shortcuts, '<span data-testid="shortcuts">true:true:false:false:false</span>');

// Tier 3 shortcuts
const t3Shortcuts = renderToStaticMarkup(
  React.createElement(
    TierProvider,
    { defaultTier: 'tier3', persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(t3Shortcuts, '<span data-testid="shortcuts">true:true:true:true:true</span>');

// -------------------------------------------------------------
// 6. Test Errore Invocazione Fuori da TierProvider
// -------------------------------------------------------------
console.log('[Test 6] Testing error throw when useTierContext is called outside provider...');
assert.throws(() => {
  renderToStaticMarkup(React.createElement(ConsumerComponent));
}, (err: Error) => {
  return err.message === 'useTierContext must be used within a TierProvider';
});

// -------------------------------------------------------------
// 7. Test Costanti e Chiavi di Configurazione
// -------------------------------------------------------------
console.log('[Test 7] Verifying uppercase constants...');
assert.strictEqual(STORAGE_KEY_TIER, 't7_simulated_tier');
assert.strictEqual(STORAGE_KEY_ROLE, 't7_simulated_role');
assert.strictEqual(STORAGE_KEY_CLINICAL_LICENSE, 't7_simulated_clinical_license');
assert.strictEqual(DEFAULT_TIER, 'tier1');
assert.strictEqual(DEFAULT_ROLE, 'athlete');
assert.strictEqual(DEFAULT_CLINICAL_LICENSE, false);

console.log('--- ALL TIER & RBAC CONTEXT TESTS PASSED (100% OK) ---');
