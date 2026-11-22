/**
 * tests/ble-context.test.ts
 * Suite di test unitari per il BleContext e Telemetria Hardware (TASK-006).
 * Verifica graceful degradation, costanti SI, mock generator e rendering React 18.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BleProvider,
  useBleContext,
  checkWebBluetoothSupport,
  SIMULATOR_INTERVAL_MS,
  STORAGE_KEY_BLE_SIMULATOR,
  DEFAULT_SIMULATED_DEVICES
} from '../src/context/BleContext';
import { useBle } from '../src/hooks/useBle';
import { MIN_HEART_RATE_BPM, MAX_HEART_RATE_BPM } from '../src/types/device';

console.log('--- STARTING BLE CONTEXT & TELEMETRY TEST SUITE ---');

// -------------------------------------------------------------
// 1. Web Bluetooth Detection & Headless Graceful Degradation
// -------------------------------------------------------------
console.log('[Test 1] Testing Web Bluetooth detection and graceful degradation...');
const isSupportedInNode = checkWebBluetoothSupport();
assert.strictEqual(isSupportedInNode, false); // In Node.js senza browser BLE deve restituire false senza eccezioni

assert.strictEqual(SIMULATOR_INTERVAL_MS, 100);
assert.strictEqual(STORAGE_KEY_BLE_SIMULATOR, 't7_ble_simulator_active');
assert.strictEqual(MIN_HEART_RATE_BPM, 30);
assert.strictEqual(MAX_HEART_RATE_BPM, 240);

// -------------------------------------------------------------
// 2. Dispositivi Predefiniti Simulati
// -------------------------------------------------------------
console.log('[Test 2] Testing DEFAULT_SIMULATED_DEVICES integrity...');
assert.strictEqual(DEFAULT_SIMULATED_DEVICES.length, 2);

const vitruve = DEFAULT_SIMULATED_DEVICES[0];
assert.strictEqual(vitruve.id, 'sim_vitruve_01');
assert.strictEqual(vitruve.type, 'vbt_encoder');
assert.strictEqual(vitruve.connectionStatus, 'disconnected');
assert.strictEqual(typeof vitruve.batteryLevel, 'number');

const polar = DEFAULT_SIMULATED_DEVICES[1];
assert.strictEqual(polar.id, 'sim_polar_01');
assert.strictEqual(polar.type, 'heart_rate_strap');
assert.strictEqual(polar.connectionStatus, 'disconnected');
assert.strictEqual(typeof polar.batteryLevel, 'number');

// -------------------------------------------------------------
// 3. React 18 Static Rendering: Default BleProvider State
// -------------------------------------------------------------
console.log('[Test 3] Testing BleProvider default static rendering...');

function DefaultConsumer() {
  const ctx = useBleContext();
  return React.createElement(
    'div',
    { 'data-testid': 'ble-summary' },
    `${ctx.isBluetoothSupported}|${ctx.isScanning}|${ctx.isSimulatorActive}|${ctx.isAnyConnected}|${ctx.devices.length}`
  );
}

const defaultHtml = renderToStaticMarkup(
  React.createElement(
    BleProvider,
    null,
    React.createElement(DefaultConsumer)
  )
);
assert.strictEqual(
  defaultHtml,
  '<div data-testid="ble-summary">false|false|false|false|2</div>'
);

// -------------------------------------------------------------
// 4. React 18 Static Rendering: Simulator Autostart
// -------------------------------------------------------------
console.log('[Test 4] Testing BleProvider with autoStartSimulator...');

const simHtml = renderToStaticMarkup(
  React.createElement(
    BleProvider,
    { autoStartSimulator: true },
    React.createElement(DefaultConsumer)
  )
);
assert.strictEqual(
  simHtml,
  '<div data-testid="ble-summary">false|false|true|false|2</div>'
);

// -------------------------------------------------------------
// 5. Consumer Hook useBle & Label Formatting
// -------------------------------------------------------------
console.log('[Test 5] Testing useBle consumer hook shortcuts...');

function ShortcutConsumer() {
  const hook = useBle();
  return React.createElement(
    'div',
    { 'data-testid': 'shortcuts' },
    `${hook.connectionStatusLabel}|${hook.vbtVelocity === null}|${hook.heartRateBpm === null}|${hook.repetitionCount}`
  );
}

const shortcutDefaultHtml = renderToStaticMarkup(
  React.createElement(
    BleProvider,
    null,
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(
  shortcutDefaultHtml,
  '<div data-testid="shortcuts">Nessun sensore connesso|true|true|0</div>'
);

const shortcutSimHtml = renderToStaticMarkup(
  React.createElement(
    BleProvider,
    { autoStartSimulator: true },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(
  shortcutSimHtml,
  '<div data-testid="shortcuts">Simulatore hardware attivo (10 Hz)|true|true|0</div>'
);

// -------------------------------------------------------------
// 6. Test Invocazione Fuori da BleProvider
// -------------------------------------------------------------
console.log('[Test 6] Testing error throw when useBleContext is called outside provider...');
assert.throws(() => {
  renderToStaticMarkup(React.createElement(DefaultConsumer));
}, (err: Error) => {
  return err.message === 'useBleContext must be used within a BleProvider';
});

console.log('--- ALL BLE CONTEXT & TELEMETRY TESTS PASSED (100% OK) ---');
