/**
 * tests/navigation-bars.test.ts
 * Suite di test unitari per Adaptive Multi-Tier Navigation Bars (TASK-008):
 * SidebarNav, BottomNav, TierUpgradeModal, GlobalNavigationShell e helper di navigazione.
 * Verifica Tier 1/2/3 feature gating, zero emoji, accessibilita WAI-ARIA, contatori 99+ e safe-area.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TierProvider } from '../src/context/TierContext';
import { AthleteProvider, DEMO_ATHLETES } from '../src/context/AthleteContext';
import { BleProvider } from '../src/context/BleContext';
import {
  SidebarNav,
  BottomNav,
  TierUpgradeModal,
  GlobalNavigationShell,
  HEADER_HEIGHT_PX,
  CANONICAL_MODULES,
  SIDEBAR_WIDTH_PX,
  BOTTOM_NAV_HEIGHT_PX,
  BREAKPOINT_DESKTOP_PX,
  Z_INDEX_NAV,
  Z_INDEX_BOTTOM_SHEET,
  Z_INDEX_MODAL,
  MIN_TOUCH_TARGET_PX,
  MOBILE_PRIMARY_TAB_COUNT,
  MAX_BADGE_COUNT,
  formatBadgeCount,
  computeRosterAlertCount,
  getModuleBadgeCount
} from '../src/components/layout';
import { TierLevel } from '../src/types';

console.log('--- STARTING ADAPTIVE MULTI-TIER NAVIGATION BARS TEST SUITE ---');

// -------------------------------------------------------------
// 1. Validazione Costanti Dimensionali, Z-Index e Moduli Canonici
// -------------------------------------------------------------
console.log('[Test 1] Testing navigation constants and canonical modules configuration...');
assert.strictEqual(SIDEBAR_WIDTH_PX, 240);
assert.strictEqual(BOTTOM_NAV_HEIGHT_PX, 60);
assert.strictEqual(BREAKPOINT_DESKTOP_PX, 1024);
assert.strictEqual(Z_INDEX_NAV, 40);
assert.strictEqual(Z_INDEX_BOTTOM_SHEET, 65);
assert.strictEqual(Z_INDEX_MODAL, 70);
assert.strictEqual(MIN_TOUCH_TARGET_PX, 44);
assert.strictEqual(MOBILE_PRIMARY_TAB_COUNT, 5);
assert.strictEqual(MAX_BADGE_COUNT, 99);
assert.strictEqual(CANONICAL_MODULES.length, 7);

const expectedModuleIds = ['cockpit', 'catalog', 'programming', 'analysis', 'community', 'favorites', 'nutrition'];
assert.deepStrictEqual(
  CANONICAL_MODULES.map((m) => m.id),
  expectedModuleIds
);

// -------------------------------------------------------------
// 2. Helper Puri: Contatori Badge e Alert Clinico/Sportivi
// -------------------------------------------------------------
console.log('[Test 2] Testing badge counters and roster alert computation...');
assert.strictEqual(formatBadgeCount(0), '0');
assert.strictEqual(formatBadgeCount(-5), '0');
assert.strictEqual(formatBadgeCount(7), '7');
assert.strictEqual(formatBadgeCount(99), '99');
assert.strictEqual(formatBadgeCount(120), '99+');
assert.strictEqual(computeRosterAlertCount(DEMO_ATHLETES), 3);
assert.strictEqual(computeRosterAlertCount([DEMO_ATHLETES[0]]), 0);
assert.strictEqual(getModuleBadgeCount('cockpit', 3, 12), 3);
assert.strictEqual(getModuleBadgeCount('favorites', 3, 12), 12);
assert.strictEqual(getModuleBadgeCount('catalog', 3, 12), 0);

/**
 * Helper di rendering statico con i 3 Provider globali configurabili per Tier.
 */
function renderNavWithTier(
  element: React.ReactElement,
  tier: TierLevel = 'tier1',
  simulatorEnabled = true
): string {
  return renderToStaticMarkup(
    React.createElement(
      TierProvider,
      { defaultTier: tier, persistState: false, simulatorEnabled },
      React.createElement(
        AthleteProvider,
        { persistState: false, enforceSingleAthlete: tier === 'tier1' },
        React.createElement(BleProvider, { allowedTier: tier }, element)
      )
    )
  );
}

const noopSelect = (): void => {};
const noopLocked = (): void => {};
const noopClose = (): void => {};

// -------------------------------------------------------------
// 3. SidebarNav: Feature Gating Tier 1 vs Tier 2 e Badge 99+
// -------------------------------------------------------------
console.log('[Test 3] Testing SidebarNav multi-tier gating, active indicator and badges...');
const sidebarTier1Html = renderNavWithTier(
  React.createElement(SidebarNav, {
    activeModule: 'cockpit',
    onSelectModule: noopSelect,
    onLockedModuleClick: noopLocked,
    alertCount: 3,
    favoritesCount: 120
  }),
  'tier1'
);

assert.ok(sidebarTier1Html.includes('t7-sidebar-nav'));
assert.ok(sidebarTier1Html.includes('aria-current="page"'));
assert.ok(sidebarTier1Html.includes('Fonti Scientifiche &amp; AI Studio — Richiede TIER 2'));
assert.ok(sidebarTier1Html.includes('>3<'));
assert.ok(sidebarTier1Html.includes('>99+<'));
assert.strictEqual(sidebarTier1Html.includes('disabled=""'), false);
assert.strictEqual(sidebarTier1Html.includes('outline:none'), false);

const sidebarTier2Html = renderNavWithTier(
  React.createElement(SidebarNav, {
    activeModule: 'community',
    onSelectModule: noopSelect,
    onLockedModuleClick: noopLocked,
    alertCount: 3,
    favoritesCount: 4
  }),
  'tier2'
);

assert.strictEqual(sidebarTier2Html.includes('Richiede TIER 2'), false);
assert.ok(sidebarTier2Html.includes('aria-current="page" aria-label="Fonti Scientifiche &amp; AI Studio"'));

// -------------------------------------------------------------
// 4. BottomNav: 5 Tab Primarie + "Altro" Sheet + Safe Area
// -------------------------------------------------------------
console.log('[Test 4] Testing BottomNav 5 primary tabs, Altro sheet and safe-area...');
const bottomClosedHtml = renderNavWithTier(
  React.createElement(BottomNav, {
    activeModule: 'cockpit',
    onSelectModule: noopSelect,
    onLockedModuleClick: noopLocked,
    alertCount: 2,
    favoritesCount: 5
  }),
  'tier1'
);

assert.ok(bottomClosedHtml.includes('t7-bottom-nav'));
assert.ok(bottomClosedHtml.includes('env(safe-area-inset-bottom, 0px)'));
assert.ok(bottomClosedHtml.includes('min-width:44px'));
assert.ok(bottomClosedHtml.includes('min-height:48px'));
assert.ok(bottomClosedHtml.includes('>Altro<'));
assert.ok(bottomClosedHtml.includes('aria-haspopup="dialog"'));
assert.ok(bottomClosedHtml.includes('aria-expanded="false"'));

const bottomOpenHtml = renderNavWithTier(
  React.createElement(BottomNav, {
    activeModule: 'nutrition',
    onSelectModule: noopSelect,
    onLockedModuleClick: noopLocked,
    defaultMoreOpen: true
  }),
  'tier1'
);

assert.ok(bottomOpenHtml.includes('aria-expanded="true"'));
assert.ok(bottomOpenHtml.includes('id="t7-bottom-nav-more-sheet"'));
assert.ok(bottomOpenHtml.includes('Altri Moduli'));
assert.ok(bottomOpenHtml.includes('Diario Nutrizione &amp; Stile di Vita'));
assert.ok(bottomOpenHtml.includes('Fonti Scientifiche &amp; AI Studio — Richiede TIER 2'));

// -------------------------------------------------------------
// 5. TierUpgradeModal: Modalita Simulatore vs Produzione JWT
// -------------------------------------------------------------
console.log('[Test 5] Testing TierUpgradeModal accessibility and simulator awareness...');
const lockedCommunity = CANONICAL_MODULES.find((m) => m.id === 'community') ?? null;
assert.ok(lockedCommunity !== null);

const closedModalHtml = renderNavWithTier(
  React.createElement(TierUpgradeModal, {
    isOpen: false,
    targetModule: lockedCommunity,
    onClose: noopClose
  }),
  'tier1'
);
assert.strictEqual(closedModalHtml, '');

const simModalHtml = renderNavWithTier(
  React.createElement(TierUpgradeModal, {
    isOpen: true,
    targetModule: lockedCommunity,
    onClose: noopClose
  }),
  'tier1',
  true
);
assert.ok(simModalHtml.includes('role="dialog"'));
assert.ok(simModalHtml.includes('aria-modal="true"'));
assert.ok(simModalHtml.includes('Sblocca Fonti Scientifiche &amp; AI Studio'));
assert.ok(simModalHtml.includes('Simula Upgrade a TIER 2'));
assert.strictEqual(simModalHtml.toLowerCase().includes('autofocus'), false);
assert.strictEqual(simModalHtml.includes('outline:none'), false);

const prodModalHtml = renderNavWithTier(
  React.createElement(TierUpgradeModal, {
    isOpen: true,
    targetModule: lockedCommunity,
    onClose: noopClose
  }),
  'tier1',
  false
);
assert.ok(prodModalHtml.includes('Richiedi Upgrade a TIER 2'));

// -------------------------------------------------------------
// 6. GlobalNavigationShell: Integrazione Completa e Downgrade Guard
// -------------------------------------------------------------
console.log('[Test 6] Testing GlobalNavigationShell adaptive layout integration and downgrade guard...');
const shellNavHtml = renderNavWithTier(
  React.createElement(
    GlobalNavigationShell,
    { activeModule: 'community', favoritesCount: 8 },
    React.createElement('div', { id: 'main-content' }, 'Dashboard Body')
  ),
  'tier1'
);

assert.ok(shellNavHtml.includes('t7-shell-main--with-nav'));
assert.ok(shellNavHtml.includes(`padding-top:calc(${HEADER_HEIGHT_PX}px + env(safe-area-inset-top, 0px))`));
assert.ok(shellNavHtml.includes('t7-sidebar-nav'));
assert.ok(shellNavHtml.includes('t7-bottom-nav'));
// In Tier 1 'community' e bloccato: il fallback deve mantenere attivo Cockpit (roster 1 atleta fit -> 0 alert)
assert.ok(shellNavHtml.includes('aria-current="page" aria-label="Cockpit Dashboard"'));
assert.strictEqual(
  shellNavHtml.includes('aria-current="page" aria-label="Fonti Scientifiche &amp; AI Studio"'),
  false
);

// In Tier 2 'community' e sbloccato e il roster demo ha 3 alert attivi su Cockpit
const shellTier2Html = renderNavWithTier(
  React.createElement(
    GlobalNavigationShell,
    { activeModule: 'community', favoritesCount: 8 },
    React.createElement('div', { id: 'main-content-t2' }, 'Dashboard Body Tier 2')
  ),
  'tier2'
);
assert.ok(shellTier2Html.includes('aria-current="page" aria-label="Fonti Scientifiche &amp; AI Studio"'));
assert.ok(shellTier2Html.includes('aria-label="Cockpit Dashboard (3)"'));

const shellLegacyHtml = renderNavWithTier(
  React.createElement(
    GlobalNavigationShell,
    { showNavigation: false },
    React.createElement('div', { id: 'legacy-body' }, 'Legacy Mode')
  ),
  'tier1'
);
assert.strictEqual(shellLegacyHtml.includes('t7-sidebar-nav'), false);
assert.strictEqual(shellLegacyHtml.includes('t7-bottom-nav'), false);

// -------------------------------------------------------------
// 7. Verifica Assenza Totale Emoji (Regola 01)
// -------------------------------------------------------------
console.log('[Test 7] Verifying zero spontaneous emojis across all navigation components...');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert.strictEqual(emojiRegex.test(sidebarTier1Html), false);
assert.strictEqual(emojiRegex.test(bottomOpenHtml), false);
assert.strictEqual(emojiRegex.test(simModalHtml), false);
assert.strictEqual(emojiRegex.test(shellNavHtml), false);

console.log('--- ALL ADAPTIVE MULTI-TIER NAVIGATION BARS TESTS PASSED (100% OK) ---');
