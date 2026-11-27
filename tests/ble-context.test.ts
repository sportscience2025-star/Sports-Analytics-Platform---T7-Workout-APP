/**
 * tests/ble-context.test.ts
 * Suite di test unitari per il BleContext e Telemetria Hardware (TASK-006).
 * Verifica graceful degradation, costanti SI, cinematica Forza-Velocita, T7 wearable,
 * Tier 1/2/3 gating, path Web Bluetooth GATT, gestione timer e ciclo vita React 18.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import {
  BleProvider,
  BleContextValue,
  useBleContext,
  checkWebBluetoothSupport,
  isBleEnabledForTier,
  isDeviceAllowedForTier,
  computeSimulatedKinematics,
  parseHeartRateMeasurement,
  parseVbtTelemetryPacket,
  SIMULATOR_INTERVAL_MS,
  SIMULATED_SCAN_DURATION_MS,
  SIMULATED_CONNECT_DELAY_MS,
  SIMULATED_DISCONNECT_DELAY_MS,
  STORAGE_KEY_BLE_SIMULATOR,
  DEFAULT_SIMULATED_DEVICES,
  GATT_HEART_RATE_MEASUREMENT_CHAR_UUID,
  GATT_T7_VBT_TELEMETRY_CHAR_UUID
} from '../src/context/BleContext';
import { useBle, UseBleReturn } from '../src/hooks/useBle';
import {
  MIN_HEART_RATE_BPM,
  MAX_HEART_RATE_BPM,
  GATT_HEART_RATE_SERVICE_UUID,
  GATT_T7_VBT_ENCODER_SERVICE_UUID,
  GATT_T7_LACTATE_SENSOR_SERVICE_UUID,
  BleDeviceNative,
  BleGattServer,
  BleGattService,
  BleGattCharacteristic
} from '../src/types/device';

/**
 * Crea un nodo DOM minimale headless compatibile con React 18 createRoot in ambiente Node.
 * @returns Container DOM simulato per il montaggio di test React
 */
function createMinimalDomContainer(): HTMLElement {
  const createNode = (tagName: string): Record<string, unknown> => {
    const node: Record<string, unknown> = {
      nodeType: 1,
      tagName: tagName.toUpperCase(),
      nodeName: tagName.toUpperCase(),
      namespaceURI: 'http://www.w3.org/1999/xhtml',
      childNodes: [] as unknown[],
      children: [] as unknown[],
      style: {},
      attributes: {} as Record<string, string>,
      textContent: '',
      innerHTML: '',
      parentNode: null,
      ownerDocument: null as unknown,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      setAttribute: (k: string, v: string) => {
        (node.attributes as Record<string, string>)[k] = v;
      },
      removeAttribute: (k: string) => {
        delete (node.attributes as Record<string, string>)[k];
      },
      appendChild: (child: Record<string, unknown>) => {
        child.parentNode = node;
        (node.childNodes as unknown[]).push(child);
        return child;
      },
      removeChild: (child: Record<string, unknown>) => {
        const list = node.childNodes as unknown[];
        const idx = list.indexOf(child);
        if (idx >= 0) {
          list.splice(idx, 1);
        }
        child.parentNode = null;
        return child;
      },
      insertBefore: (child: Record<string, unknown>, before: Record<string, unknown> | null) => {
        child.parentNode = node;
        const list = node.childNodes as unknown[];
        const idx = before ? list.indexOf(before) : -1;
        if (idx >= 0) {
          list.splice(idx, 0, child);
        } else {
          list.push(child);
        }
        return child;
      }
    };
    return node;
  };

  const fakeDocument: Record<string, unknown> = {
    nodeType: 9,
    createElement: (tag: string) => {
      const el = createNode(tag);
      el.ownerDocument = fakeDocument;
      return el;
    },
    createElementNS: (_ns: string, tag: string) => {
      const el = createNode(tag);
      el.ownerDocument = fakeDocument;
      return el;
    },
    createTextNode: (text: string) => ({
      nodeType: 3,
      nodeValue: text,
      textContent: text,
      parentNode: null,
      ownerDocument: fakeDocument
    }),
    createComment: (text: string) => ({
      nodeType: 8,
      nodeValue: text,
      parentNode: null,
      ownerDocument: fakeDocument
    }),
    addEventListener: () => undefined,
    removeEventListener: () => undefined
  };

  const globalObj = globalThis as unknown as {
    document?: unknown;
    window?: unknown;
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  };
  globalObj.IS_REACT_ACT_ENVIRONMENT = true;
  if (!globalObj.document) {
    globalObj.document = fakeDocument;
  }
  if (!globalObj.window) {
    globalObj.window = {
      document: fakeDocument,
      HTMLIFrameElement: function FakeHTMLIFrameElement() {}
    };
  }

  const rootEl = createNode('div');
  rootEl.ownerDocument = fakeDocument;
  return rootEl as unknown as HTMLElement;
}

/**
 * Attende un numero di millisecondi specificato nei test asincroni.
 * @param ms Durata dell'attesa in millisecondi
 * @returns Promise risolta allo scadere del timer
 */
function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function runSuite(): Promise<void> {
  console.log('--- STARTING BLE CONTEXT & TELEMETRY TEST SUITE ---');

  // -------------------------------------------------------------
  // 1. Web Bluetooth Detection, Costanti & UUID Hex Validi
  // -------------------------------------------------------------
  console.log('[Test 1] Testing Web Bluetooth detection, constants, and valid GATT UUIDs...');
  const isSupportedInNode = checkWebBluetoothSupport();
  assert.strictEqual(isSupportedInNode, false);

  assert.strictEqual(SIMULATOR_INTERVAL_MS, 100);
  assert.strictEqual(SIMULATED_SCAN_DURATION_MS, 1500);
  assert.strictEqual(SIMULATED_CONNECT_DELAY_MS, 400);
  assert.strictEqual(SIMULATED_DISCONNECT_DELAY_MS, 200);
  assert.strictEqual(STORAGE_KEY_BLE_SIMULATOR, 't7_ble_simulator_active');
  assert.strictEqual(MIN_HEART_RATE_BPM, 30);
  assert.strictEqual(MAX_HEART_RATE_BPM, 240);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  assert.ok(uuidRegex.test(GATT_HEART_RATE_SERVICE_UUID));
  assert.ok(uuidRegex.test(GATT_T7_VBT_ENCODER_SERVICE_UUID));
  assert.ok(uuidRegex.test(GATT_T7_LACTATE_SENSOR_SERVICE_UUID));
  assert.ok(uuidRegex.test(GATT_HEART_RATE_MEASUREMENT_CHAR_UUID));
  assert.ok(uuidRegex.test(GATT_T7_VBT_TELEMETRY_CHAR_UUID));

  // -------------------------------------------------------------
  // 2. Dispositivi Predefiniti Simulati (incluso T7 SmartBand Pro)
  // -------------------------------------------------------------
  console.log('[Test 2] Testing DEFAULT_SIMULATED_DEVICES integrity and T7 wearable...');
  assert.strictEqual(DEFAULT_SIMULATED_DEVICES.length, 3);

  const vitruve = DEFAULT_SIMULATED_DEVICES[0];
  assert.strictEqual(vitruve.id, 'sim_vitruve_01');
  assert.strictEqual(vitruve.type, 'vbt_encoder');
  assert.strictEqual(vitruve.connectionStatus, 'disconnected');
  assert.strictEqual(vitruve.isT7Proprietary, false);
  assert.strictEqual(typeof vitruve.batteryLevel, 'number');

  const polar = DEFAULT_SIMULATED_DEVICES[1];
  assert.strictEqual(polar.id, 'sim_polar_01');
  assert.strictEqual(polar.type, 'heart_rate_strap');
  assert.strictEqual(polar.connectionStatus, 'disconnected');
  assert.strictEqual(polar.isT7Proprietary, false);
  assert.strictEqual(typeof polar.batteryLevel, 'number');

  const t7Band = DEFAULT_SIMULATED_DEVICES[2];
  assert.strictEqual(t7Band.id, 'sim_t7_smartband_01');
  assert.strictEqual(t7Band.name, 'T7 SmartBand Pro');
  assert.strictEqual(t7Band.isT7Proprietary, true);
  assert.strictEqual(t7Band.vendorId, 'T7_LABS');
  assert.strictEqual(t7Band.connectionStatus, 'disconnected');

  // -------------------------------------------------------------
  // 3. Tier 1/2/3 BLE Policy Checks
  // -------------------------------------------------------------
  console.log('[Test 3] Testing Tier 1/2/3 BLE gating helpers...');
  assert.strictEqual(isBleEnabledForTier('tier1'), false);
  assert.strictEqual(isBleEnabledForTier('tier2'), true);
  assert.strictEqual(isBleEnabledForTier('tier3'), true);

  assert.strictEqual(isDeviceAllowedForTier(vitruve, 'tier1'), false);
  assert.strictEqual(isDeviceAllowedForTier(t7Band, 'tier1'), false);

  assert.strictEqual(isDeviceAllowedForTier(vitruve, 'tier2'), false);
  assert.strictEqual(isDeviceAllowedForTier(polar, 'tier2'), false);
  assert.strictEqual(isDeviceAllowedForTier(t7Band, 'tier2'), true);

  assert.strictEqual(isDeviceAllowedForTier(vitruve, 'tier3'), true);
  assert.strictEqual(isDeviceAllowedForTier(polar, 'tier3'), true);
  assert.strictEqual(isDeviceAllowedForTier(t7Band, 'tier3'), true);

  // -------------------------------------------------------------
  // 4. Cinematica Simulatore & Legge Inversa Forza-Velocita (SI)
  // -------------------------------------------------------------
  console.log('[Test 4] Testing simulator kinematics & inverse Force-Velocity relationship...');
  const lowConc = computeSimulatedKinematics(1);
  const peakConc = computeSimulatedKinematics(5); // phase 0.25 -> max positive velocity
  const peakEcc = computeSimulatedKinematics(15); // phase 0.75 -> negative eccentric velocity

  assert.ok(Number(peakConc.velocityMps) > Number(lowConc.velocityMps));
  assert.ok(Number(peakConc.velocityMps) > 0);
  assert.ok(Number(peakEcc.velocityMps) < 0);
  // Forza decresce al crescere della velocita concentrica
  assert.ok(Number(peakConc.forceN) < Number(lowConc.forceN));
  // In eccentrica la forza frenante supera la forza concentrica veloce
  assert.ok(Number(peakEcc.forceN) > Number(peakConc.forceN));
  assert.ok(Number(peakConc.powerW) > 0);
  assert.strictEqual(Number(peakEcc.powerW), 0);

  // -------------------------------------------------------------
  // 5. Parser Pacchetti GATT (Heart Rate & VBT)
  // -------------------------------------------------------------
  console.log('[Test 5] Testing GATT DataView parsers...');
  const hrBuf = new ArrayBuffer(2);
  const hrView = new DataView(hrBuf);
  hrView.setUint8(0, 0x00);
  hrView.setUint8(1, 152);
  const parsedHr = parseHeartRateMeasurement(hrView, 'native_hr_1', 1);
  if (!parsedHr) {
    assert.fail('Expected parsedHr to be non-null');
  }
  assert.strictEqual(parsedHr.heartRateBpm, 152);
  assert.strictEqual(parsedHr.deviceType, 'heart_rate_strap');

  const vbtBuf = new ArrayBuffer(12);
  const vbtView = new DataView(vbtBuf);
  vbtView.setFloat32(0, 310, true);
  vbtView.setFloat32(4, 0.85, true);
  vbtView.setFloat32(8, 760, true);
  const parsedVbt = parseVbtTelemetryPacket(vbtView, 'native_vbt_1', 2);
  if (!parsedVbt) {
    assert.fail('Expected parsedVbt to be non-null');
  }
  assert.strictEqual(Math.round(Number(parsedVbt.displacementMm)), 310);
  assert.ok(Math.abs(Number(parsedVbt.instantVelocityMps) - 0.85) < 0.001);
  assert.strictEqual(Math.round(Number(parsedVbt.instantForceN)), 760);

  // -------------------------------------------------------------
  // 6. React 18 Static Rendering: Default, Simulator Autostart & Tier Gating
  // -------------------------------------------------------------
  console.log('[Test 6] Testing BleProvider static rendering and useBle shortcuts...');

  function DefaultConsumer() {
    const ctx = useBleContext();
    return React.createElement(
      'div',
      { 'data-testid': 'ble-summary' },
      `${ctx.isBluetoothSupported}|${ctx.isScanning}|${ctx.isSimulatorActive}|${ctx.isAnyConnected}|${ctx.devices.length}|${ctx.isBleAllowedForTier}|${ctx.connectedDevices.length}`
    );
  }

  const defaultHtml = renderToStaticMarkup(
    React.createElement(BleProvider, null, React.createElement(DefaultConsumer))
  );
  assert.strictEqual(
    defaultHtml,
    '<div data-testid="ble-summary">false|false|false|false|3|true|0</div>'
  );

  const simHtml = renderToStaticMarkup(
    React.createElement(BleProvider, { autoStartSimulator: true }, React.createElement(DefaultConsumer))
  );
  assert.strictEqual(
    simHtml,
    '<div data-testid="ble-summary">false|false|true|false|3|true|0</div>'
  );

  const tier1Html = renderToStaticMarkup(
    React.createElement(
      BleProvider,
      { allowedTier: 'tier1', autoStartSimulator: true },
      React.createElement(DefaultConsumer)
    )
  );
  assert.strictEqual(
    tier1Html,
    '<div data-testid="ble-summary">false|false|false|false|3|false|0</div>'
  );

  function ShortcutConsumer() {
    const hook = useBle();
    return React.createElement(
      'div',
      { 'data-testid': 'shortcuts' },
      `${hook.connectionStatusLabel}|${hook.vbtVelocity === null}|${hook.heartRateBpm === null}|${hook.repetitionCount}`
    );
  }

  const shortcutDefaultHtml = renderToStaticMarkup(
    React.createElement(BleProvider, null, React.createElement(ShortcutConsumer))
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
  // 7. Errore Invocazione Fuori da BleProvider
  // -------------------------------------------------------------
  console.log('[Test 7] Testing error throw when useBleContext is called outside provider...');
  assert.throws(
    () => {
      renderToStaticMarkup(React.createElement(DefaultConsumer));
    },
    (err: Error) => err.message === 'useBleContext must be used within a BleProvider'
  );

  // -------------------------------------------------------------
  // 8. Test Interattivi Stateful (connectDevice, disconnectDevice, startScan, stopScan, toggleSimulator, clearTelemetry, Tier gating, Timer cleanup)
  // -------------------------------------------------------------
  console.log('[Test 8] Testing interactive BleProvider flows, memoization, and timer cleanup...');
  const container = createMinimalDomContainer();
  const root = createRoot(container);

  const bleRef: { ctx: BleContextValue | null; hook: UseBleReturn | null } = {
    ctx: null,
    hook: null
  };
  const getCtx = (): BleContextValue => {
    if (!bleRef.ctx) {
      assert.fail('Expected BleContextValue to be populated');
    }
    return bleRef.ctx;
  };
  const getHook = (): UseBleReturn => {
    if (!bleRef.hook) {
      assert.fail('Expected UseBleReturn to be populated');
    }
    return bleRef.hook;
  };

  function Harness({ tier }: { tier?: 'tier1' | 'tier2' | 'tier3' }) {
    const ctx = useBleContext();
    const hook = useBle();
    bleRef.ctx = ctx;
    bleRef.hook = hook;
    return React.createElement('span', null, `${ctx.connectedDevices.length}:${tier ?? 'tier3'}`);
  }

  const renderHarness = async (tier: 'tier1' | 'tier2' | 'tier3' = 'tier3'): Promise<void> => {
    await act(async () => {
      root.render(
        React.createElement(
          BleProvider,
          { allowedTier: tier },
          React.createElement(Harness, { tier })
        )
      );
    });
  };

  await renderHarness('tier3');
  const firstHookRef = getHook();

  // Verifica stabilita referenziale useBle su re-render invariato
  await renderHarness('tier3');
  assert.strictEqual(getHook(), firstHookRef);

  // Test connectDevice + connectedDevices + already-connected guard
  await act(async () => {
    await getCtx().connectDevice('sim_vitruve_01');
  });
  assert.strictEqual(getCtx().isAnyConnected, true);
  assert.strictEqual(getCtx().isVbtConnected, true);
  assert.strictEqual(getCtx().connectedDevices.length, 1);
  assert.strictEqual(getCtx().connectedDevices[0].id, 'sim_vitruve_01');

  // Guard su doppia connessione
  await act(async () => {
    await getCtx().connectDevice('sim_vitruve_01');
  });
  assert.strictEqual(getCtx().connectedDevices.length, 1);

  // Genera mock repetition e verifica clearTelemetry su disconnectDevice quando nessun dispositivo resta connesso
  await act(async () => {
    const rep = getCtx().generateMockRepetition();
    assert.strictEqual(rep.repNumber, 1);
  });
  assert.ok(getCtx().liveTelemetry !== null);
  assert.strictEqual(getCtx().liveTelemetry!.repetitionHistory.length, 1);

  await act(async () => {
    await getCtx().disconnectDevice('sim_vitruve_01');
  });
  assert.strictEqual(getCtx().isAnyConnected, false);
  assert.strictEqual(getCtx().connectedDevices.length, 0);
  assert.strictEqual(getCtx().liveTelemetry, null);

  // Test clearTelemetry resetta repCounterRef e simTickRef
  await act(async () => {
    getCtx().generateMockRepetition();
    getCtx().clearTelemetry();
  });
  assert.strictEqual(getCtx().liveTelemetry, null);
  await act(async () => {
    const repAfterReset = getCtx().generateMockRepetition();
    assert.strictEqual(repAfterReset.repNumber, 1);
  });

  // Test startScan + stopScan anticipato
  let scanPromise: Promise<void> | null = null;
  await act(async () => {
    scanPromise = getCtx().startScan();
  });
  assert.strictEqual(getCtx().isScanning, true);
  await act(async () => {
    getCtx().stopScan();
    if (scanPromise) {
      await scanPromise;
    }
  });
  assert.strictEqual(getCtx().isScanning, false);

  // Test toggleSimulator(true) connette dispositivi simulati e toggleSimulator(false) li disconnette
  await act(async () => {
    getCtx().toggleSimulator(true);
  });
  assert.strictEqual(getCtx().isSimulatorActive, true);
  assert.strictEqual(getCtx().connectedDevices.length, 3);

  await act(async () => {
    await sleepMs(SIMULATOR_INTERVAL_MS + 40);
  });
  assert.ok(getCtx().liveTelemetry !== null);
  assert.ok(getCtx().liveTelemetry!.vbtFrame !== null);
  assert.ok(getCtx().liveTelemetry!.heartRateFrame !== null);

  await act(async () => {
    getCtx().toggleSimulator(false);
  });
  assert.strictEqual(getCtx().isSimulatorActive, false);
  assert.strictEqual(getCtx().connectedDevices.length, 0);
  assert.strictEqual(getCtx().liveTelemetry, null);

  // Test Tier 2: solo T7 SmartBand Pro consentito, Vitruve bloccato
  await renderHarness('tier2');
  await act(async () => {
    await getCtx().connectDevice('sim_vitruve_01');
  });
  assert.strictEqual(getCtx().connectedDevices.length, 0);
  assert.ok(getCtx().connectionError !== null);

  await act(async () => {
    await getCtx().connectDevice('sim_t7_smartband_01');
  });
  assert.strictEqual(getCtx().connectedDevices.length, 1);
  assert.strictEqual(getCtx().connectedDevices[0].id, 'sim_t7_smartband_01');
  assert.strictEqual(getCtx().connectionError, null);

  // Test Tier 1: BLE completamente bloccato
  await renderHarness('tier1');
  assert.strictEqual(getCtx().isBleAllowedForTier, false);
  assert.strictEqual(getCtx().connectedDevices.length, 0);
  await act(async () => {
    await getCtx().connectDevice('sim_t7_smartband_01');
  });
  assert.strictEqual(getCtx().connectedDevices.length, 0);
  assert.ok(getCtx().connectionError !== null);

  // Test transizione conflittuale (connectDevice interrotto da disconnectDevice + unmount durante timer pendente)
  await renderHarness('tier3');
  await act(async () => {
    const pendingConnect = getCtx().connectDevice('sim_polar_01');
    await getCtx().disconnectDevice('sim_polar_01');
    await pendingConnect;
  });
  assert.strictEqual(getCtx().connectedDevices.length, 0);

  // Avvia scan e smonta subito per verificare pulizia deterministica dei timer senza eccezioni
  await act(async () => {
    void getCtx().startScan();
    root.unmount();
  });
  await sleepMs(60);

  // -------------------------------------------------------------
  // 9. Test Path Web Bluetooth API Mockato (Discovery + GATT Subscribe + Disconnect)
  // -------------------------------------------------------------
  console.log('[Test 9] Testing Web Bluetooth discovery and GATT notification path...');
  let valueChangedHandler: ((ev: Event) => void) | null = null;
  let disconnectedHandler: ((ev: Event) => void) | null = null;
  let gattConnected = false;

  const mockCharacteristic: BleGattCharacteristic = {
    uuid: GATT_HEART_RATE_MEASUREMENT_CHAR_UUID,
    value: hrView,
    startNotifications: async () => mockCharacteristic,
    stopNotifications: async () => mockCharacteristic,
    addEventListener: (type, listener) => {
      if (type === 'characteristicvaluechanged') {
        valueChangedHandler = listener;
      }
    },
    removeEventListener: (type, listener) => {
      if (type === 'characteristicvaluechanged' && valueChangedHandler === listener) {
        valueChangedHandler = null;
      }
    }
  };

  const mockService: BleGattService = {
    uuid: GATT_HEART_RATE_SERVICE_UUID,
    getCharacteristic: async (charUuid) => {
      if (charUuid !== GATT_HEART_RATE_MEASUREMENT_CHAR_UUID) {
        throw new Error('Characteristic not found');
      }
      return mockCharacteristic;
    }
  };

  const mockGattServer: BleGattServer = {
    get connected() {
      return gattConnected;
    },
    connect: async () => {
      gattConnected = true;
      return mockGattServer;
    },
    disconnect: () => {
      gattConnected = false;
    },
    getPrimaryService: async (serviceUuid) => {
      if (serviceUuid !== GATT_HEART_RATE_SERVICE_UUID) {
        throw new Error('Service not found');
      }
      return mockService;
    }
  };

  const mockNativeDevice: BleDeviceNative = {
    id: 'native_polar_h10',
    name: 'Polar H10 Native',
    gatt: mockGattServer,
    addEventListener: (type, listener) => {
      if (type === 'gattserverdisconnected') {
        disconnectedHandler = listener;
      }
    },
    removeEventListener: (type, listener) => {
      if (type === 'gattserverdisconnected' && disconnectedHandler === listener) {
        disconnectedHandler = null;
      }
    }
  };

  const globalNavTarget = globalThis as unknown as {
    window?: Record<string, unknown>;
  };
  const prevWindow = globalNavTarget.window;
  const prevNavDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  globalNavTarget.window = prevWindow ?? {};
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    writable: true,
    value: {
      bluetooth: {
        requestDevice: async () => mockNativeDevice
      }
    }
  });

  try {
    assert.strictEqual(checkWebBluetoothSupport(), true);
    const nativeContainer = createMinimalDomContainer();
    const nativeRoot = createRoot(nativeContainer);
    let nativeCtx: BleContextValue | null = null;

    function NativeHarness() {
      nativeCtx = useBleContext();
      return React.createElement('span', null, String(nativeCtx.connectedDevices.length));
    }

    await act(async () => {
      nativeRoot.render(
        React.createElement(BleProvider, { allowedTier: 'tier3' }, React.createElement(NativeHarness))
      );
    });

    await act(async () => {
      await nativeCtx!.startScan();
    });
    assert.ok(nativeCtx!.devices.some((d) => d.id === 'native_polar_h10'));

    await act(async () => {
      await nativeCtx!.connectDevice('native_polar_h10');
    });
    assert.strictEqual(nativeCtx!.isHeartRateConnected, true);
    assert.ok(valueChangedHandler !== null);

    // Simula notifica GATT incoming
    await act(async () => {
      valueChangedHandler!({ target: mockCharacteristic } as unknown as Event);
    });
    assert.strictEqual(nativeCtx!.liveTelemetry?.heartRateFrame?.heartRateBpm, 152);

    // Simula disconnessione improvvisa GATT
    await act(async () => {
      disconnectedHandler!({} as Event);
    });
    assert.strictEqual(nativeCtx!.isHeartRateConnected, false);
    assert.strictEqual(nativeCtx!.liveTelemetry, null);

    await act(async () => {
      nativeRoot.unmount();
    });
  } finally {
    globalNavTarget.window = prevWindow;
    if (prevNavDescriptor) {
      Object.defineProperty(globalThis, 'navigator', prevNavDescriptor);
    }
  }

  console.log('--- ALL BLE CONTEXT & TELEMETRY TESTS PASSED (100% OK) ---');
}

runSuite().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
