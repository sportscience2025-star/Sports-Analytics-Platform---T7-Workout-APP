/**
 * tests/layout-shell.test.ts
 * Suite di test unitari per la Global Navigation Shell, hook useDismissiblePopover e accessibilita (TASK-007).
 * Verifica telemetria SI formattata, assenza di "undefined kg", ruoli WAI-ARIA,
 * sfondi traslucidi glassmorphism, zero emoji e comportamento dei filtri/popover.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TierProvider } from '../src/context/TierContext';
import { AthleteProvider } from '../src/context/AthleteContext';
import { BleContext, BleContextValue, BleProvider } from '../src/context/BleContext';
import {
  Athlete,
  Team,
  BleDeviceInfo,
  SILO1_CONSUMER,
  SENSITIVITY_STANDARD,
  AVAILABILITY_FIT,
  AVAILABILITY_CAUTION,
  asKilograms,
  asMetersPerSecond,
  asWatts,
  asNewtons,
  asMilliseconds
} from '../src/types';
import { NARROW_NO_BREAK_SPACE } from '../src/utils/number-format';
import {
  POPOVER_DISMISS_KEY,
  shouldDismissOnKey,
  shouldDismissOnOutsidePointer,
  isKeyboardFocusTarget
} from '../src/hooks/useDismissiblePopover';
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
  POPOVER_GLASS_BG,
  TIER_POPOVER_GLASS_BG,
  BLE_POPOVER_GLASS_BG,
  AVAILABILITY_COLORS,
  TACTICAL_ROLE_LABELS,
  BLE_DEVICE_TYPE_LABELS,
  formatTacticalRoleLabel,
  formatAthleteSubtitle,
  filterAthletesByQuery,
  filterTeamsByQuery,
  getBleDeviceTypeLabel
} from '../src/components/layout';

console.log('--- STARTING GLOBAL NAVIGATION SHELL TEST SUITE ---');

// -------------------------------------------------------------
// 1. Validazione Costanti Dimensionali, Z-Index e Glassmorphism
// -------------------------------------------------------------
console.log('[Test 1] Testing layout dimensions, z-index, glassmorphism and role constants...');
assert.strictEqual(HEADER_HEIGHT_PX, 64);
assert.strictEqual(Z_INDEX_HEADER, 50);
assert.strictEqual(Z_INDEX_DROPDOWN, 60);
assert.strictEqual(Z_INDEX_TIER_POPOVER, 60);
assert.strictEqual(Z_INDEX_BLE_POPOVER, 60);
assert.strictEqual(DROPDOWN_WIDTH_PX, 320);

assert.strictEqual(POPOVER_GLASS_BG, 'rgba(15, 23, 42, 0.88)');
assert.strictEqual(TIER_POPOVER_GLASS_BG, 'rgba(15, 23, 42, 0.88)');
assert.strictEqual(BLE_POPOVER_GLASS_BG, 'rgba(15, 23, 42, 0.88)');

assert.strictEqual(AVAILABILITY_COLORS.fit, '#10b981');
assert.strictEqual(AVAILABILITY_COLORS.caution, '#f59e0b');
assert.strictEqual(AVAILABILITY_COLORS.rehab, '#a855f7');
assert.strictEqual(AVAILABILITY_COLORS.injured, '#f43f5e');

assert.strictEqual(TACTICAL_ROLE_LABELS.striker, 'Attaccante');
assert.strictEqual(TACTICAL_ROLE_LABELS.center_back, 'Difensore Centrale');
assert.strictEqual(formatTacticalRoleLabel('goalkeeper'), 'Portiere');

// -------------------------------------------------------------
// 2. Verifica Hook Helpers useDismissiblePopover
// -------------------------------------------------------------
console.log('[Test 2] Testing useDismissiblePopover dismissal helpers and constants...');
assert.strictEqual(POPOVER_DISMISS_KEY, 'Escape');
assert.strictEqual(shouldDismissOnKey('Escape'), true);
assert.strictEqual(shouldDismissOnKey('Enter'), false);
assert.strictEqual(shouldDismissOnOutsidePointer(null, null), false);
assert.strictEqual(isKeyboardFocusTarget(null), false);

// Helper per avvolgere i componenti nei Provider globali per il test
function renderWithProviders(
  element: React.ReactElement,
  customAthletes?: readonly Athlete[],
  customTeams?: readonly Team[]
): string {
  return renderToStaticMarkup(
    React.createElement(
      TierProvider,
      { persistState: false },
      React.createElement(
        AthleteProvider,
        {
          persistState: false,
          initialAthletes: customAthletes,
          initialTeams: customTeams
        },
        React.createElement(BleProvider, null, element)
      )
    )
  );
}

// -------------------------------------------------------------
// 3. ContextSelectorDropdown: Peso Assente, Cross-Team e ARIA
// -------------------------------------------------------------
console.log('[Test 3] Testing ContextSelectorDropdown ARIA roles, missing weight safety, and cross-team selection...');
const testTeams: readonly Team[] = [
  {
    id: 'team_a',
    name: 'Prima Squadra Alpha',
    clubCode: 'T7-A',
    tier: 'tier3',
    siloPartition: SILO1_CONSUMER,
    rosterAthleteIds: ['ath_weight'],
    staffUserIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'team_b',
    name: 'Primavera Beta',
    clubCode: 'T7-B',
    tier: 'tier3',
    siloPartition: SILO1_CONSUMER,
    rosterAthleteIds: ['ath_no_weight'],
    staffUserIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

const testAthletes: readonly Athlete[] = [
  {
    id: 'ath_weight',
    name: 'Marco',
    surname: 'Rossi',
    tier: 'tier2',
    siloPartition: SILO1_CONSUMER,
    sensitivityClass: SENSITIVITY_STANDARD,
    tacticalRole: 'striker',
    availabilityStatus: AVAILABILITY_FIT,
    currentWeightKg: asKilograms(78.5),
    teamId: 'team_a',
    optInResearchWarehouse: true
  },
  {
    id: 'ath_no_weight',
    name: 'Giulio',
    surname: 'Verdi',
    tier: 'tier2',
    siloPartition: SILO1_CONSUMER,
    sensitivityClass: SENSITIVITY_STANDARD,
    tacticalRole: 'center_back',
    availabilityStatus: AVAILABILITY_CAUTION,
    teamId: 'team_b',
    optInResearchWarehouse: false
  }
];

assert.strictEqual(
  formatAthleteSubtitle(testAthletes[0]),
  `Attaccante • 78,5${NARROW_NO_BREAK_SPACE}kg`
);
assert.strictEqual(formatAthleteSubtitle(testAthletes[1]), 'Difensore Centrale');
assert.strictEqual(filterTeamsByQuery(testTeams, 'beta').length, 1);
assert.strictEqual(filterTeamsByQuery(testTeams, 'T7-A').length, 1);
assert.strictEqual(filterAthletesByQuery(testAthletes, 'verdi').length, 1);
assert.strictEqual(filterAthletesByQuery(testAthletes, 'Difensore Centrale').length, 1);

const openSelectorHtml = renderWithProviders(
  React.createElement(ContextSelectorDropdown, { defaultOpen: true }),
  testAthletes,
  testTeams
);

// Verifica sicurezza "undefined kg" e rendering cross-team
assert.strictEqual(openSelectorHtml.includes('undefined kg'), false);
assert.strictEqual(openSelectorHtml.includes('undefined'), false);
assert.ok(openSelectorHtml.includes('Marco Rossi'));
assert.ok(openSelectorHtml.includes('Giulio Verdi'));
assert.ok(openSelectorHtml.includes('T7-B'));
assert.ok(openSelectorHtml.includes('Attaccante'));
assert.ok(openSelectorHtml.includes('Difensore Centrale'));

// Verifica ARIA roles e assenza autoFocus / outline:none
assert.ok(openSelectorHtml.includes('aria-haspopup="dialog"'));
assert.ok(openSelectorHtml.includes('role="dialog"'));
assert.ok(openSelectorHtml.includes('role="tablist"'));
assert.ok(openSelectorHtml.includes('role="tab"'));
assert.ok(openSelectorHtml.includes('role="listbox"'));
assert.ok(openSelectorHtml.includes('role="option"'));
assert.ok(openSelectorHtml.includes('aria-selected="true"'));
assert.strictEqual(openSelectorHtml.toLowerCase().includes('autofocus'), false);
assert.strictEqual(openSelectorHtml.includes('outline:none'), false);
assert.ok(openSelectorHtml.includes('rgba(15, 23, 42, 0.88)'));
assert.ok(openSelectorHtml.includes('min(320px, calc(100vw - 24px))'));

// Verifica che il tab switcher non venga nascosto se teams.length === 0
const emptyTeamsSelectorHtml = renderWithProviders(
  React.createElement(ContextSelectorDropdown, { defaultOpen: true }),
  testAthletes,
  []
);
assert.ok(emptyTeamsSelectorHtml.includes('role="tablist"'));
assert.ok(emptyTeamsSelectorHtml.includes('Squadre (0)'));

// -------------------------------------------------------------
// 4. Rendering TierBadgeSwitcher (Aperto e Chiuso)
// -------------------------------------------------------------
console.log('[Test 4] Testing TierBadgeSwitcher translucent popover and accessibility...');
const tierOpenHtml = renderWithProviders(
  React.createElement(TierBadgeSwitcher, { defaultOpen: true })
);
assert.ok(tierOpenHtml.includes('TIER 1'));
assert.ok(tierOpenHtml.includes('CONSUMER'));
assert.ok(tierOpenHtml.includes('role="dialog"'));
assert.ok(tierOpenHtml.includes('rgba(15, 23, 42, 0.88)'));
assert.strictEqual(tierOpenHtml.includes('outline:none'), false);

// -------------------------------------------------------------
// 5. Rendering BleStatusPill: Telemetria SI 10Hz, Device Labels e Stato Disabilitato
// -------------------------------------------------------------
console.log('[Test 5] Testing BleStatusPill SI telemetry formatting, tabular-nums and device types...');
assert.strictEqual(Object.keys(BLE_DEVICE_TYPE_LABELS).length, 8);
assert.strictEqual(getBleDeviceTypeLabel('vbt_encoder'), 'Encoder VBT');
assert.strictEqual(getBleDeviceTypeLabel('heart_rate_strap'), 'Cardiofrequenzimetro');
assert.strictEqual(getBleDeviceTypeLabel('t7_wearable'), 'Wearable T7');
assert.strictEqual(getBleDeviceTypeLabel('smart_scale'), 'Bilancia Smart BIA');
assert.strictEqual(getBleDeviceTypeLabel('lactate_analyzer'), 'Analizzatore Lattato');
assert.strictEqual(getBleDeviceTypeLabel('gps_tracker'), 'Tracker GPS');
assert.strictEqual(getBleDeviceTypeLabel('optical_sensor'), 'Sensore Ottico');
assert.strictEqual(getBleDeviceTypeLabel('generic_sensor'), 'Sensore Generico');

const mockDevices: readonly BleDeviceInfo[] = [
  {
    id: 'dev_vbt',
    name: 'T7 Linear Encoder',
    type: 'vbt_encoder',
    connectionStatus: 'connected'
  },
  {
    id: 'dev_lactate',
    name: 'T7 Lactate Pro',
    type: 'lactate_analyzer',
    connectionStatus: 'connecting'
  },
  {
    id: 'dev_scale',
    name: 'T7 Smart Scale',
    type: 'smart_scale',
    connectionStatus: 'disconnected'
  }
];

const mockBleContextValue: BleContextValue = {
  devices: mockDevices,
  connectedDevices: [mockDevices[0]],
  isScanning: true,
  isBluetoothSupported: true,
  isSimulatorActive: true,
  isBleAllowedForTier: true,
  allowedTier: 'tier3',
  connectionError: null,
  isAnyConnected: true,
  isVbtConnected: true,
  isHeartRateConnected: false,
  liveTelemetry: {
    vbtFrame: {
      deviceId: 'dev_vbt',
      deviceType: 'vbt_encoder',
      timestampMs: asMilliseconds(1000),
      sequenceNumber: 1,
      displacementMm: 450,
      instantVelocityMps: asMetersPerSecond(0.85),
      instantPowerW: asWatts(620),
      instantForceN: asNewtons(740)
    },
    heartRateFrame: {
      deviceId: 'dev_hr',
      deviceType: 'heart_rate_strap',
      timestampMs: asMilliseconds(1000),
      sequenceNumber: 1,
      heartRateBpm: 148
    },
    latestRepetition: null,
    repetitionHistory: [],
    lastUpdatedMs: asMilliseconds(1000)
  },
  startScan: async () => {},
  stopScan: () => {},
  connectDevice: async () => {},
  disconnectDevice: async () => {},
  toggleSimulator: () => {},
  generateMockRepetition: () => {
    throw new Error('Not invoked in static render test');
  },
  clearTelemetry: () => {}
};

const bleLiveHtml = renderToStaticMarkup(
  React.createElement(
    BleContext.Provider,
    { value: mockBleContextValue },
    React.createElement(BleStatusPill, { defaultOpen: true })
  )
);

assert.ok(bleLiveHtml.includes('SIM 10Hz'));
assert.ok(bleLiveHtml.includes('rgba(15, 23, 42, 0.88)'));
assert.ok(bleLiveHtml.includes('tabular-nums'));
assert.ok(bleLiveHtml.includes(`0,85${NARROW_NO_BREAK_SPACE}m/s`));
assert.ok(bleLiveHtml.includes(`620${NARROW_NO_BREAK_SPACE}W`));
assert.ok(bleLiveHtml.includes(`740${NARROW_NO_BREAK_SPACE}N`));
assert.ok(bleLiveHtml.includes(`148${NARROW_NO_BREAK_SPACE}bpm`));
assert.ok(bleLiveHtml.includes('Analizzatore Lattato'));
assert.ok(bleLiveHtml.includes('Bilancia Smart BIA'));
assert.ok(bleLiveHtml.includes('disabled=""'));
assert.ok(bleLiveHtml.includes('Scansione in corso...'));
assert.strictEqual(bleLiveHtml.includes('outline:none'), false);

// -------------------------------------------------------------
// 6. GlobalHeader & GlobalNavigationShell: Safe-Area e Mobile Wrap
// -------------------------------------------------------------
console.log('[Test 6] Testing GlobalHeader & GlobalNavigationShell safe-area, wrap and zero emojis...');
const headerHtml = renderWithProviders(
  React.createElement(GlobalHeader, { isProfileMenuOpen: false })
);
assert.ok(headerHtml.includes('WORKOUT'));
assert.ok(headerHtml.includes('Cockpit'));
assert.ok(headerHtml.includes(`calc(${HEADER_HEIGHT_PX}px + env(safe-area-inset-top, 0px))`));
assert.ok(headerHtml.includes('flex-wrap:wrap'));
assert.ok(headerHtml.includes('aria-expanded="false"'));
assert.ok(headerHtml.includes('title="Menu profilo e impostazioni utente"'));
assert.strictEqual(headerHtml.includes('outline:none'), false);

const shellHtml = renderWithProviders(
  React.createElement(
    GlobalNavigationShell,
    { isProfileMenuOpen: true },
    React.createElement('div', { id: 'test-view' }, 'Content Body')
  )
);
assert.ok(shellHtml.includes('<main'));
assert.ok(shellHtml.includes(`padding-top:calc(${HEADER_HEIGHT_PX}px + env(safe-area-inset-top, 0px))`));
assert.ok(shellHtml.includes('id="test-view"'));
assert.ok(shellHtml.includes('Content Body'));
assert.ok(shellHtml.includes('aria-expanded="true"'));

// Verifica Zero Emoji (Regola 01)
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert.strictEqual(emojiRegex.test(shellHtml), false);
assert.strictEqual(emojiRegex.test(openSelectorHtml), false);
assert.strictEqual(emojiRegex.test(tierOpenHtml), false);
assert.strictEqual(emojiRegex.test(bleLiveHtml), false);

console.log('--- ALL GLOBAL NAVIGATION SHELL TESTS PASSED (100% OK) ---');
