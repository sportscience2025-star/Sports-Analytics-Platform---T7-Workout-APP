/**
 * tests/layout-shell.test.ts
 * Suite di test unitari per la Global Navigation Shell e componenti di Layout (TASK-007).
 * Verifica costanti dimensionali, zero emoji, rendering React 18 e integrazione contesti.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TierProvider } from '../src/context/TierContext';
import { AthleteProvider } from '../src/context/AthleteContext';
import { BleProvider } from '../src/context/BleContext';
import {
  GlobalHeader,
  GlobalNavigationShell,
  ContextSelectorDropdown,
  TierBadgeSwitcher,
  BleStatusPill,
  HEADER_HEIGHT_PX,
  Z_INDEX_HEADER,
  Z_INDEX_DROPDOWN,
  Z_INDEX_TIER_POPOVER,
  Z_INDEX_BLE_POPOVER,
  DROPDOWN_WIDTH_PX,
  AVAILABILITY_COLORS
} from '../src/components/layout';

console.log('--- STARTING GLOBAL NAVIGATION SHELL TEST SUITE ---');

// -------------------------------------------------------------
// 1. Validazione Costanti Dimensionali e Z-Index (Regola 02)
// -------------------------------------------------------------
console.log('[Test 1] Testing layout dimensions, z-index and color constants...');
assert.strictEqual(HEADER_HEIGHT_PX, 64);
assert.strictEqual(Z_INDEX_HEADER, 50);
assert.strictEqual(Z_INDEX_DROPDOWN, 60);
assert.strictEqual(Z_INDEX_TIER_POPOVER, 60);
assert.strictEqual(Z_INDEX_BLE_POPOVER, 60);
assert.strictEqual(DROPDOWN_WIDTH_PX, 320);

assert.strictEqual(AVAILABILITY_COLORS.fit, '#10b981');
assert.strictEqual(AVAILABILITY_COLORS.caution, '#f59e0b');
assert.strictEqual(AVAILABILITY_COLORS.rehab, '#a855f7');
assert.strictEqual(AVAILABILITY_COLORS.injured, '#f43f5e');

// Helper per avvolgere i componenti nei Provider globali per il test
function renderWithProviders(element: React.ReactElement): string {
  return renderToStaticMarkup(
    React.createElement(
      TierProvider,
      { persistState: false },
      React.createElement(
        AthleteProvider,
        { persistState: false },
        React.createElement(
          BleProvider,
          null,
          element
        )
      )
    )
  );
}

// -------------------------------------------------------------
// 2. Rendering ContextSelectorDropdown (2-Click Selector)
// -------------------------------------------------------------
console.log('[Test 2] Testing ContextSelectorDropdown static rendering...');
const selectorHtml = renderWithProviders(React.createElement(ContextSelectorDropdown));
assert.ok(selectorHtml.includes('Atleta Attivo'));
assert.ok(selectorHtml.includes('Marco Rossi'));
assert.ok(selectorHtml.includes('aria-haspopup="listbox"'));

// -------------------------------------------------------------
// 3. Rendering TierBadgeSwitcher
// -------------------------------------------------------------
console.log('[Test 3] Testing TierBadgeSwitcher static rendering...');
const tierHtml = renderWithProviders(React.createElement(TierBadgeSwitcher));
assert.ok(tierHtml.includes('TIER 1'));
assert.ok(tierHtml.includes('CONSUMER'));

// -------------------------------------------------------------
// 4. Rendering BleStatusPill
// -------------------------------------------------------------
console.log('[Test 4] Testing BleStatusPill static rendering...');
const bleHtml = renderWithProviders(React.createElement(BleStatusPill));
assert.ok(bleHtml.includes('BLE'));
assert.ok(bleHtml.includes('<polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"'));

// -------------------------------------------------------------
// 5. Rendering GlobalHeader
// -------------------------------------------------------------
console.log('[Test 5] Testing GlobalHeader master bar rendering...');
const headerHtml = renderWithProviders(React.createElement(GlobalHeader));
assert.ok(headerHtml.includes('WORKOUT'));
assert.ok(headerHtml.includes('Cockpit'));
assert.ok(headerHtml.includes(`height:${HEADER_HEIGHT_PX}px`));
assert.ok(headerHtml.includes('fixed'));

// -------------------------------------------------------------
// 6. Rendering GlobalNavigationShell con Child Content
// -------------------------------------------------------------
console.log('[Test 6] Testing GlobalNavigationShell container rendering with children...');
const shellHtml = renderWithProviders(
  React.createElement(
    GlobalNavigationShell,
    null,
    React.createElement('div', { id: 'test-view' }, 'Content Body')
  )
);
assert.ok(shellHtml.includes('<main'));
assert.ok(shellHtml.includes(`padding-top:${HEADER_HEIGHT_PX}px`));
assert.ok(shellHtml.includes('id="test-view"'));
assert.ok(shellHtml.includes('Content Body'));

// -------------------------------------------------------------
// 7. Verifica Zero Emoji (Regola 01)
// -------------------------------------------------------------
console.log('[Test 7] Verifying zero spontaneous emojis in rendered layout...');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert.strictEqual(emojiRegex.test(shellHtml), false);

console.log('--- ALL GLOBAL NAVIGATION SHELL TESTS PASSED (100% OK) ---');
