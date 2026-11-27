/**
 * src/context/BleContext.tsx
 * React Context per il monitoraggio hardware BLE e streaming di telemetria VBT/Cardio/T7.
 * Conforme ad ADR-01 (Thin Client), ADR-03 (Rigore Metrologico SI), Tier Gating e Regola 02.
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  BleDeviceInfo,
  BleDeviceType,
  BleConnectionStatus,
  BleDeviceNative,
  BleGattCharacteristic,
  LiveTelemetryState,
  LinearTransducerRepetition,
  VbtTelemetryFrame,
  HeartRateTelemetryFrame,
  TierLevel,
  GATT_HEART_RATE_SERVICE_UUID,
  GATT_CYCLING_POWER_SERVICE_UUID,
  GATT_FITNESS_MACHINE_SERVICE_UUID,
  GATT_T7_VBT_ENCODER_SERVICE_UUID,
  GATT_T7_LACTATE_SENSOR_SERVICE_UUID,
  MIN_HEART_RATE_BPM,
  MAX_HEART_RATE_BPM,
  MIN_ECCENTRIC_VELOCITY_MPS,
  MAX_VALID_VELOCITY_MPS,
  asMetersPerSecond,
  asWatts,
  asNewtons,
  asMilliseconds
} from '../types';
import { sanitizeNumeric, clampToRange } from '../utils/metrology-guard';
import { readStorageSafe, writeStorageSafe } from '../utils/storage-safe';

// ============================================================================
// COSTANTI HARDWARE, TEMPISTICHE, GATT UUID E CINEMATICA (REGOLA 02)
// ============================================================================

export const SIMULATOR_INTERVAL_MS = 100; // Frequenza simulatore 10 Hz (100 ms)
export const SIMULATED_SCAN_DURATION_MS = 1500;
export const SIMULATED_CONNECT_DELAY_MS = 400;
export const SIMULATED_DISCONNECT_DELAY_MS = 200;
export const STORAGE_KEY_BLE_SIMULATOR = 't7_ble_simulator_active';

export const DEFAULT_ALLOWED_TIER: TierLevel = 'tier3';
export const T7_VENDOR_ID = 'T7_LABS';
export const SIMULATED_DEVICE_ID_PREFIX = 'sim_';

export const GATT_HEART_RATE_MEASUREMENT_CHAR_UUID = '00002a37-0000-1000-8000-00805f9b34fb';
export const GATT_CYCLING_POWER_MEASUREMENT_CHAR_UUID = '00002a63-0000-1000-8000-00805f9b34fb';
export const GATT_FITNESS_MACHINE_CHAR_UUID = '00002ad2-0000-1000-8000-00805f9b34fb';
export const GATT_T7_VBT_TELEMETRY_CHAR_UUID = '77010002-7437-4000-8000-00805f9b34fb';
export const GATT_T7_LACTATE_TELEMETRY_CHAR_UUID = '77020002-7437-4000-8000-00805f9b34fb';

const HR_FLAG_16BIT_MASK = 0x01;
const HR_MIN_BYTES_8BIT = 2;
const HR_MIN_BYTES_16BIT = 3;
const VBT_PACKET_MIN_BYTES = 12;
const VBT_DISPLACEMENT_OFFSET_BYTES = 0;
const VBT_VELOCITY_OFFSET_BYTES = 4;
const VBT_FORCE_OFFSET_BYTES = 8;

const MS_PER_MINUTE = 60000;
const MS_PER_SECOND = 1000;
const MM_PER_METER = 1000;
const TWO_PI = Math.PI * 2;

const SIM_CYCLE_TICKS = 20; // Ciclo completo concentrico + eccentrico da 2.0 s a 10 Hz
const SIM_DISPLACEMENT_AMPLITUDE_MM = 240; // Escursione totale 480 mm (0.48 m)
const SIM_DISPLACEMENT_FALLBACK_MM = 240;
const SIM_BASELINE_FORCE_N = 900; // Forza isometrica/carico di riferimento (N)
const SIM_FV_SLOPE_N_PER_MPS = 260; // Pendenza inversa Forza-Velocita (N / (m/s))
const SIM_MIN_FORCE_N = 100;
const SIM_MAX_FORCE_N = 5000;
const SIM_MIN_POWER_W = 0;
const SIM_MAX_POWER_W = 8000;

const SIM_HR_BASELINE_BPM = 142;
const SIM_HR_AMPLITUDE_BPM = 8;
const SIM_HR_FREQUENCY_RAD = 0.15;

const MOCK_REP_BASE_VELOCITY_MPS = 0.72;
const MOCK_REP_VELOCITY_STEP_MPS = 0.04;
const MOCK_REP_VELOCITY_MODULO = 4;
const MOCK_REP_MIN_VELOCITY_MPS = 0.2;
const MOCK_REP_MAX_VELOCITY_MPS = 2.5;
const MOCK_REP_PEAK_VELOCITY_RATIO = 1.38;
const MOCK_REP_MIN_PEAK_VELOCITY_MPS = 0.3;
const MOCK_REP_MAX_PEAK_VELOCITY_MPS = 3.5;
const MOCK_REP_BASELINE_FORCE_N = 920;
const MOCK_REP_FV_SLOPE_N_PER_MPS = 240;
const MOCK_REP_MIN_FORCE_N = 100;
const MOCK_REP_MAX_FORCE_N = 3000;
const MOCK_REP_POWER_FACTOR = 1.15;
const MOCK_REP_MIN_POWER_W = 100;
const MOCK_REP_MAX_POWER_W = 4000;
const MOCK_REP_ROM_METERS = 0.48;
const MOCK_REP_DURATION_MS = 620;

const DEFAULT_NATIVE_BATTERY_PCT = 100;
const DEFAULT_NATIVE_RSSI_DBM = -60;

const MSG_ERR_TIER1_BLE_BLOCKED = 'Connettivita hardware BLE non disponibile nel piano Tier 1.';
const MSG_ERR_TIER2_PROPRIETARY_ONLY = 'Il piano Tier 2 supporta esclusivamente sensori proprietari T7.';
const MSG_ERR_DEVICE_NOT_FOUND = 'Dispositivo BLE non trovato nel registro corrente.';
const MSG_ERR_NO_GATT_SERVER = 'Server GATT Web Bluetooth non disponibile sul dispositivo selezionato.';
const MSG_ERR_GATT_SERVICE_NOT_FOUND = 'Nessun servizio GATT compatibile rilevato sul dispositivo BLE.';
const MSG_ERR_GATT_CONNECTION_FAILED = 'Errore durante la connessione GATT Web Bluetooth.';
const MSG_ERR_SCAN_FAILED = 'Errore durante la scansione Web Bluetooth.';

const T7_PROPRIETARY_SERVICES: readonly string[] = Object.freeze([
  GATT_T7_VBT_ENCODER_SERVICE_UUID,
  GATT_T7_LACTATE_SENSOR_SERVICE_UUID
]);

const UNIVERSAL_GATT_SERVICES: readonly string[] = Object.freeze([
  GATT_HEART_RATE_SERVICE_UUID,
  GATT_CYCLING_POWER_SERVICE_UUID,
  GATT_FITNESS_MACHINE_SERVICE_UUID,
  GATT_T7_VBT_ENCODER_SERVICE_UUID,
  GATT_T7_LACTATE_SENSOR_SERVICE_UUID
]);

export const DEFAULT_SIMULATED_DEVICES: readonly BleDeviceInfo[] = Object.freeze([
  {
    id: 'sim_vitruve_01',
    name: 'Vitruve Encoder (Simulated)',
    type: 'vbt_encoder',
    connectionStatus: 'disconnected',
    vendorId: 'VITRUVE',
    isT7Proprietary: false,
    batteryLevel: 94,
    rssi: -58,
    firmwareVersion: 'v2.4.1',
    hardwareSerial: 'VIT-SIM-001'
  },
  {
    id: 'sim_polar_01',
    name: 'Polar H10 (Simulated)',
    type: 'heart_rate_strap',
    connectionStatus: 'disconnected',
    vendorId: 'POLAR',
    isT7Proprietary: false,
    batteryLevel: 88,
    rssi: -62,
    firmwareVersion: 'v3.1.0',
    hardwareSerial: 'POL-SIM-002'
  },
  {
    id: 'sim_t7_smartband_01',
    name: 'T7 SmartBand Pro',
    type: 'lactate_analyzer',
    connectionStatus: 'disconnected',
    vendorId: T7_VENDOR_ID,
    isT7Proprietary: true,
    batteryLevel: 96,
    rssi: -52,
    firmwareVersion: 'v1.8.0',
    hardwareSerial: 'T7-SB-PRO-001'
  }
]);

// ============================================================================
// CONTRATTI INTERNI WEB BLUETOOTH (STRICT TYPESCRIPT, ZERO ANY)
// ============================================================================

interface WebBluetoothFilter {
  readonly services?: readonly (string | number)[];
  readonly namePrefix?: string;
}

interface WebBluetoothRequestDeviceOptions {
  readonly filters?: readonly WebBluetoothFilter[];
  readonly optionalServices?: readonly (string | number)[];
  readonly acceptAllDevices?: boolean;
}

interface WebBluetoothNavigator {
  readonly bluetooth?: {
    requestDevice: (options: WebBluetoothRequestDeviceOptions) => Promise<BleDeviceNative>;
  };
}

interface NativeSubscriptionEntry {
  readonly device: BleDeviceNative;
  readonly characteristic?: BleGattCharacteristic;
  readonly onValueChanged?: (event: Event) => void;
  readonly onDisconnected: (event: Event) => void;
}

interface GattCandidateDescriptor {
  readonly serviceUuid: string;
  readonly characteristicUuid: string;
  readonly parserKind: 'heart_rate' | 'vbt';
}

const GATT_SUBSCRIPTION_CANDIDATES: readonly GattCandidateDescriptor[] = Object.freeze([
  {
    serviceUuid: GATT_T7_VBT_ENCODER_SERVICE_UUID,
    characteristicUuid: GATT_T7_VBT_TELEMETRY_CHAR_UUID,
    parserKind: 'vbt'
  },
  {
    serviceUuid: GATT_HEART_RATE_SERVICE_UUID,
    characteristicUuid: GATT_HEART_RATE_MEASUREMENT_CHAR_UUID,
    parserKind: 'heart_rate'
  },
  {
    serviceUuid: GATT_CYCLING_POWER_SERVICE_UUID,
    characteristicUuid: GATT_CYCLING_POWER_MEASUREMENT_CHAR_UUID,
    parserKind: 'vbt'
  },
  {
    serviceUuid: GATT_FITNESS_MACHINE_SERVICE_UUID,
    characteristicUuid: GATT_FITNESS_MACHINE_CHAR_UUID,
    parserKind: 'vbt'
  },
  {
    serviceUuid: GATT_T7_LACTATE_SENSOR_SERVICE_UUID,
    characteristicUuid: GATT_T7_LACTATE_TELEMETRY_CHAR_UUID,
    parserKind: 'heart_rate'
  }
]);

export interface BleContextValue {
  devices: readonly BleDeviceInfo[];
  connectedDevices: BleDeviceInfo[];
  isScanning: boolean;
  isBluetoothSupported: boolean;
  isSimulatorActive: boolean;
  isBleAllowedForTier: boolean;
  allowedTier: TierLevel;
  connectionError: string | null;
  liveTelemetry: LiveTelemetryState | null;
  isAnyConnected: boolean;
  isVbtConnected: boolean;
  isHeartRateConnected: boolean;
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectDevice: (deviceId: string) => Promise<void>;
  disconnectDevice: (deviceId: string) => Promise<void>;
  toggleSimulator: (active?: boolean) => void;
  generateMockRepetition: () => LinearTransducerRepetition;
  clearTelemetry: () => void;
}

export interface BleProviderProps {
  children?: React.ReactNode;
  initialDevices?: readonly BleDeviceInfo[];
  autoStartSimulator?: boolean;
  allowedTier?: TierLevel;
}

export interface SimulatedKinematicsSample {
  readonly displacementMm: number;
  readonly velocityMps: ReturnType<typeof asMetersPerSecond>;
  readonly forceN: ReturnType<typeof asNewtons>;
  readonly powerW: ReturnType<typeof asWatts>;
}

// ============================================================================
// FUNZIONI PURE DI SUPPORTO, POLICY TIER, CINEMATICA E PARSING GATT
// ============================================================================

/**
 * Rileva il supporto della Web Bluetooth API nel runtime del browser in modo sicuro.
 * @returns true se Web Bluetooth API e disponibile e supportata
 */
export function checkWebBluetoothSupport(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const nav = navigator as unknown as WebBluetoothNavigator;
  return typeof nav.bluetooth !== 'undefined' && typeof nav.bluetooth.requestDevice === 'function';
}

/**
 * Verifica se il piano di abbonamento corrente abilita la connettivita hardware BLE.
 * Tier 1 blocca il BLE; Tier 2 abilita i wearable T7; Tier 3 abilita l'hub universale.
 * @param tier Livello di abbonamento attivo
 * @returns true se la connettivita BLE e consentita dal piano
 */
export function isBleEnabledForTier(tier: TierLevel): boolean {
  return tier !== 'tier1';
}

/**
 * Verifica se uno specifico dispositivo BLE e autorizzato dal Tier di abbonamento attivo.
 * @param device Metadati del dispositivo BLE candidato
 * @param tier Livello di abbonamento attivo
 * @returns true se il dispositivo puo essere collegato nel Tier indicato
 */
export function isDeviceAllowedForTier(device: BleDeviceInfo, tier: TierLevel): boolean {
  if (tier === 'tier1') {
    return false;
  }
  if (tier === 'tier2') {
    return device.isT7Proprietary === true;
  }
  return true;
}

/**
 * Determina se un dispositivo appartiene al set simulato locale.
 * @param deviceId Identificativo univoco del dispositivo
 * @returns true se l'ID identifica un sensore simulato
 */
function isSimulatedDeviceId(deviceId: string): boolean {
  return deviceId.startsWith(SIMULATED_DEVICE_ID_PREFIX);
}

/**
 * Classifica tipo hardware e proprieta T7 a partire dal dispositivo Web Bluetooth nativo.
 * @param nativeDevice Istanza Web Bluetooth BluetoothDevice nativa
 * @returns Tipo BLE inferito, flag proprietario T7 e vendorId opzionale
 */
function classifyNativeDevice(nativeDevice: BleDeviceNative): {
  type: BleDeviceType;
  isT7Proprietary: boolean;
  vendorId?: string;
} {
  const lowerName = (nativeDevice.name ?? '').toLowerCase();
  if (lowerName.includes('t7')) {
    const isEncoder = lowerName.includes('vbt') || lowerName.includes('encoder');
    return {
      type: isEncoder ? 'vbt_encoder' : 'lactate_analyzer',
      isT7Proprietary: true,
      vendorId: T7_VENDOR_ID
    };
  }
  if (lowerName.includes('polar') || lowerName.includes('h10') || lowerName.includes('heart')) {
    return { type: 'heart_rate_strap', isT7Proprietary: false };
  }
  if (lowerName.includes('vitruve') || lowerName.includes('vbt') || lowerName.includes('encoder')) {
    return { type: 'vbt_encoder', isT7Proprietary: false };
  }
  return { type: 'generic_sensor', isT7Proprietary: false };
}

/**
 * Calcola un campione cinematico coerente per fase concentrica/eccentrica e legge inversa Forza-Velocita.
 * Modella lo spostamento $y(t) = A(1 - \cos(2\pi \cdot \text{phase}))$ e la derivata $v(t) = \dot{y}(t)$,
 * garantendo $F$ decrescente al crescere di $v$ attorno al carico base e limiti SI rigorosi.
 * @param tick Contatore discreto del timer di simulazione (10 Hz)
 * @returns Campione cinematico validato con unita SI brandizzate
 */
export function computeSimulatedKinematics(tick: number): SimulatedKinematicsSample {
  const phase = (tick % SIM_CYCLE_TICKS) / SIM_CYCLE_TICKS;
  const angleRad = phase * TWO_PI;

  const rawDisplacementMm = SIM_DISPLACEMENT_AMPLITUDE_MM * (1 - Math.cos(angleRad));
  const displacementMm = sanitizeNumeric(rawDisplacementMm, SIM_DISPLACEMENT_FALLBACK_MM);

  // Derivata analitica dello spostamento in m/s: positiva in concentrica (0..0.5), negativa in eccentrica (0.5..1)
  const amplitudeMeters = SIM_DISPLACEMENT_AMPLITUDE_MM / MM_PER_METER;
  const cycleDurationSeconds = (SIM_CYCLE_TICKS * SIMULATOR_INTERVAL_MS) / MS_PER_SECOND;
  const rawVelocityMps = amplitudeMeters * (TWO_PI / cycleDurationSeconds) * Math.sin(angleRad);
  const velocityMps = asMetersPerSecond(
    clampToRange(rawVelocityMps, MIN_ECCENTRIC_VELOCITY_MPS, MAX_VALID_VELOCITY_MPS)
  );

  // Relazione inversa Forza-Velocita: F diminuisce all'aumentare della velocita concentrica
  const rawForceN = SIM_BASELINE_FORCE_N - SIM_FV_SLOPE_N_PER_MPS * velocityMps;
  const forceN = asNewtons(clampToRange(rawForceN, SIM_MIN_FORCE_N, SIM_MAX_FORCE_N));

  const rawPowerW = Math.max(SIM_MIN_POWER_W, forceN * velocityMps);
  const powerW = asWatts(clampToRange(rawPowerW, SIM_MIN_POWER_W, SIM_MAX_POWER_W));

  return {
    displacementMm,
    velocityMps,
    forceN,
    powerW
  };
}

/**
 * Decodifica un pacchetto GATT Heart Rate Measurement (UUID 0x2A37) in un frame tipizzato.
 * @param dataView Buffer binario DataView ricevuto dalla caratteristica GATT
 * @param deviceId Identificativo del dispositivo sorgente
 * @param sequenceNumber Numero progressivo del pacchetto ricevuto
 * @returns Frame HeartRateTelemetryFrame valido oppure null se il buffer e incompleto
 */
export function parseHeartRateMeasurement(
  dataView: DataView,
  deviceId: string,
  sequenceNumber: number
): HeartRateTelemetryFrame | null {
  if (dataView.byteLength < HR_MIN_BYTES_8BIT) {
    return null;
  }

  const flags = dataView.getUint8(0);
  const is16Bit = (flags & HR_FLAG_16BIT_MASK) !== 0;

  let rawBpm = 0;
  if (is16Bit) {
    if (dataView.byteLength < HR_MIN_BYTES_16BIT) {
      return null;
    }
    rawBpm = dataView.getUint16(1, true);
  } else {
    rawBpm = dataView.getUint8(1);
  }

  const heartRateBpm = Math.round(clampToRange(rawBpm, MIN_HEART_RATE_BPM, MAX_HEART_RATE_BPM));
  return {
    deviceId,
    deviceType: 'heart_rate_strap',
    timestampMs: asMilliseconds(Date.now()),
    sequenceNumber,
    heartRateBpm,
    rrIntervalsMs: [asMilliseconds(Math.round(MS_PER_MINUTE / heartRateBpm))]
  };
}

/**
 * Decodifica un pacchetto binario GATT VBT (3 x Float32 little-endian: displacementMm, velocityMps, forceN).
 * @param dataView Buffer binario DataView ricevuto dalla caratteristica GATT VBT
 * @param deviceId Identificativo del dispositivo sorgente
 * @param sequenceNumber Numero progressivo del pacchetto ricevuto
 * @returns Frame VbtTelemetryFrame validato in unita SI oppure null se incompleto
 */
export function parseVbtTelemetryPacket(
  dataView: DataView,
  deviceId: string,
  sequenceNumber: number
): VbtTelemetryFrame | null {
  if (dataView.byteLength < VBT_PACKET_MIN_BYTES) {
    return null;
  }

  const displacementMm = sanitizeNumeric(
    dataView.getFloat32(VBT_DISPLACEMENT_OFFSET_BYTES, true),
    0
  );
  const rawVelocity = sanitizeNumeric(
    dataView.getFloat32(VBT_VELOCITY_OFFSET_BYTES, true),
    0
  );
  const rawForce = sanitizeNumeric(
    dataView.getFloat32(VBT_FORCE_OFFSET_BYTES, true),
    0
  );

  const velocity = asMetersPerSecond(
    clampToRange(rawVelocity, MIN_ECCENTRIC_VELOCITY_MPS, MAX_VALID_VELOCITY_MPS)
  );
  const force = asNewtons(clampToRange(rawForce, 0, SIM_MAX_FORCE_N));
  const power = asWatts(
    clampToRange(Math.max(SIM_MIN_POWER_W, force * velocity), SIM_MIN_POWER_W, SIM_MAX_POWER_W)
  );

  return {
    deviceId,
    deviceType: 'vbt_encoder',
    timestampMs: asMilliseconds(Date.now()),
    sequenceNumber,
    displacementMm,
    instantVelocityMps: velocity,
    instantForceN: force,
    instantPowerW: power
  };
}

export const BleContext = createContext<BleContextValue | null>(null);

// ============================================================================
// PROVIDER HARDWARE BLE & TELEMETRIA
// ============================================================================

/**
 * Provider React per la gestione della telemetria hardware, Web Bluetooth API e gating per Tier.
 * @param props Proprieta del provider (figli, dispositivi iniziali, autostart simulatore, Tier abilitato)
 * @returns Elemento React Provider con memoizzazione ottimale
 */
export const BleProvider: React.FC<BleProviderProps> = ({
  children,
  initialDevices,
  autoStartSimulator,
  allowedTier = DEFAULT_ALLOWED_TIER
}) => {
  const isMountedRef = useRef<boolean>(true);
  const simulatorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanWaiterRef = useRef<(() => void) | null>(null);
  const deviceTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const deviceWaitersRef = useRef<Map<string, () => void>>(new Map());
  const pendingStatusRef = useRef<Map<string, BleConnectionStatus>>(new Map());
  const nativeDevicesRef = useRef<Map<string, BleDeviceNative>>(new Map());
  const nativeSubscriptionsRef = useRef<Map<string, NativeSubscriptionEntry>>(new Map());

  const repCounterRef = useRef<number>(0);
  const simTickRef = useRef<number>(0);
  const gattSeqRef = useRef<number>(0);

  const isBluetoothSupported = useMemo<boolean>(() => {
    return checkWebBluetoothSupport();
  }, []);

  const isBleAllowedForTier = useMemo<boolean>(() => {
    return isBleEnabledForTier(allowedTier);
  }, [allowedTier]);

  const [devices, setDevices] = useState<readonly BleDeviceInfo[]>(() => {
    return initialDevices ?? DEFAULT_SIMULATED_DEVICES;
  });
  const devicesRef = useRef<readonly BleDeviceInfo[]>(devices);
  devicesRef.current = devices;

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(() => {
    if (!isBleEnabledForTier(allowedTier)) {
      return false;
    }
    if (typeof autoStartSimulator === 'boolean') {
      return autoStartSimulator;
    }
    return readStorageSafe(STORAGE_KEY_BLE_SIMULATOR) === 'true';
  });
  const isSimulatorActiveRef = useRef<boolean>(isSimulatorActive);
  isSimulatorActiveRef.current = isSimulatorActive;

  const [liveTelemetry, setLiveTelemetry] = useState<LiveTelemetryState | null>(null);

  const connectedDevices = useMemo<BleDeviceInfo[]>(() => {
    return devices.filter((d) => d.connectionStatus === 'connected');
  }, [devices]);

  const isAnyConnected = useMemo<boolean>(() => {
    return connectedDevices.length > 0;
  }, [connectedDevices]);

  const isVbtConnected = useMemo<boolean>(() => {
    return connectedDevices.some((d) => d.type === 'vbt_encoder');
  }, [connectedDevices]);

  const isHeartRateConnected = useMemo<boolean>(() => {
    return connectedDevices.some((d) => d.type === 'heart_rate_strap');
  }, [connectedDevices]);

  /**
   * Cancella in sicurezza un singolo timeout registrato rimuovendolo dal set di tracciamento.
   * @param handle Handle del timer da annullare
   * @returns void
   */
  const clearManagedTimeout = useCallback((handle: ReturnType<typeof setTimeout> | null): void => {
    if (handle === null) {
      return;
    }
    clearTimeout(handle);
    activeTimeoutsRef.current.delete(handle);
  }, []);

  /**
   * Pianifica un timeout registrandolo automaticamente per la pulizia deterministica su unmount o cancellazione.
   * @param callback Funzione da eseguire allo scadere del ritardo
   * @param delayMs Ritardo in millisecondi
   * @returns Handle del timer schedulato
   */
  const scheduleManagedTimeout = useCallback(
    (callback: () => void, delayMs: number): ReturnType<typeof setTimeout> => {
      const handle = setTimeout(() => {
        activeTimeoutsRef.current.delete(handle);
        callback();
      }, delayMs);
      activeTimeoutsRef.current.add(handle);
      return handle;
    },
    []
  );

  /**
   * Annulla eventuali timer e promise pendenti relativi alla transizione di un dispositivo specifico.
   * @param deviceId Identificativo del dispositivo BLE
   * @returns void
   */
  const cancelDeviceTransition = useCallback(
    (deviceId: string): void => {
      const existingTimer = deviceTimeoutsRef.current.get(deviceId) ?? null;
      if (existingTimer !== null) {
        clearManagedTimeout(existingTimer);
        deviceTimeoutsRef.current.delete(deviceId);
      }
      const pendingWaiter = deviceWaitersRef.current.get(deviceId);
      if (pendingWaiter) {
        deviceWaitersRef.current.delete(deviceId);
        pendingWaiter();
      }
    },
    [clearManagedTimeout]
  );

  /**
   * Pulisce tutti i timer asincroni attivi e risolve eventuali promise di transizione pendenti.
   * @returns void
   */
  const clearAllManagedTimeouts = useCallback((): void => {
    activeTimeoutsRef.current.forEach((handle) => {
      clearTimeout(handle);
    });
    activeTimeoutsRef.current.clear();
    scanTimeoutRef.current = null;
    if (scanWaiterRef.current) {
      const resolveScan = scanWaiterRef.current;
      scanWaiterRef.current = null;
      resolveScan();
    }
    deviceTimeoutsRef.current.clear();

    deviceWaitersRef.current.forEach((resolveWaiter) => {
      resolveWaiter();
    });
    deviceWaitersRef.current.clear();
  }, []);

  /**
   * Aggiorna lo stato di connessione di un dispositivo tramite aggiornamento funzionale privo di stale closure.
   * @param deviceId Identificativo del dispositivo BLE
   * @param newStatus Nuovo stato di connessione da applicare
   * @returns void
   */
  const updateDeviceStatus = useCallback(
    (deviceId: string, newStatus: BleConnectionStatus): void => {
      setDevices((prev) =>
        prev.map((d) => {
          if (d.id === deviceId) {
            return { ...d, connectionStatus: newStatus };
          }
          return d;
        })
      );
    },
    []
  );

  /**
   * Rimuove listener GATT nativi e chiude le notifiche Web Bluetooth per un dispositivo specifico.
   * @param deviceId Identificativo del dispositivo BLE nativo
   * @returns void
   */
  const cleanupNativeSubscription = useCallback((deviceId: string): void => {
    const sub = nativeSubscriptionsRef.current.get(deviceId);
    if (!sub) {
      return;
    }
    nativeSubscriptionsRef.current.delete(deviceId);

    if (sub.characteristic && sub.onValueChanged) {
      try {
        sub.characteristic.removeEventListener('characteristicvaluechanged', sub.onValueChanged);
      } catch {
        // Rimozione listener tollerante in caso di disconnessione hardware improvvisa
      }
      try {
        void sub.characteristic.stopNotifications().catch(() => undefined);
      } catch {
        // Ignora errori durante stopNotifications su server GATT gia disconnesso
      }
    }

    try {
      sub.device.removeEventListener('gattserverdisconnected', sub.onDisconnected);
    } catch {
      // Rimozione listener tollerante
    }
  }, []);

  /**
   * Interrompe la scansione BLE attiva cancellando l'eventuale timeout simulato pendente.
   * @returns void
   */
  const stopScan = useCallback((): void => {
    if (scanTimeoutRef.current !== null) {
      clearManagedTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    if (scanWaiterRef.current) {
      const resolveScan = scanWaiterRef.current;
      scanWaiterRef.current = null;
      resolveScan();
    }
    setIsScanning(false);
  }, [clearManagedTimeout]);

  /**
   * Avvia la scansione dei dispositivi tramite Web Bluetooth API o discovery simulato controllato dal Tier.
   * @returns Promise risolta al termine del flusso di scoperta
   */
  const startScan = useCallback(async (): Promise<void> => {
    if (!isBleEnabledForTier(allowedTier)) {
      setConnectionError(MSG_ERR_TIER1_BLE_BLOCKED);
      setIsScanning(false);
      return;
    }

    setConnectionError(null);
    if (scanTimeoutRef.current !== null) {
      clearManagedTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    if (scanWaiterRef.current) {
      const resolvePrevScan = scanWaiterRef.current;
      scanWaiterRef.current = null;
      resolvePrevScan();
    }

    if (!isBluetoothSupported || isSimulatorActiveRef.current) {
      setIsScanning(true);
      await new Promise<void>((resolve) => {
        scanWaiterRef.current = resolve;
        const timerHandle = scheduleManagedTimeout(() => {
          if (scanTimeoutRef.current === timerHandle) {
            scanTimeoutRef.current = null;
          }
          if (scanWaiterRef.current === resolve) {
            scanWaiterRef.current = null;
          }
          if (isMountedRef.current) {
            setIsScanning(false);
          }
          resolve();
        }, SIMULATED_SCAN_DURATION_MS);
        scanTimeoutRef.current = timerHandle;
      });
      return;
    }

    const nav = navigator as unknown as WebBluetoothNavigator;
    const bluetoothApi = nav.bluetooth;
    if (!bluetoothApi) {
      return;
    }

    try {
      setIsScanning(true);
      const allowedServices =
        allowedTier === 'tier2' ? T7_PROPRIETARY_SERVICES : UNIVERSAL_GATT_SERVICES;

      const nativeDevice = await bluetoothApi.requestDevice({
        filters: [{ services: allowedServices }],
        optionalServices: allowedServices
      });

      if (!isMountedRef.current) {
        return;
      }

      const classification = classifyNativeDevice(nativeDevice);
      const candidateInfo: BleDeviceInfo = {
        id: nativeDevice.id,
        name: nativeDevice.name ?? `BLE Device (${nativeDevice.id})`,
        type: classification.type,
        connectionStatus: 'disconnected',
        vendorId: classification.vendorId,
        isT7Proprietary: classification.isT7Proprietary,
        batteryLevel: DEFAULT_NATIVE_BATTERY_PCT,
        rssi: DEFAULT_NATIVE_RSSI_DBM
      };

      if (!isDeviceAllowedForTier(candidateInfo, allowedTier)) {
        setConnectionError(MSG_ERR_TIER2_PROPRIETARY_ONLY);
        return;
      }

      nativeDevicesRef.current.set(nativeDevice.id, nativeDevice);
      setDevices((prev) => {
        const exists = prev.some((d) => d.id === candidateInfo.id);
        if (exists) {
          return prev.map((d) => (d.id === candidateInfo.id ? { ...d, ...candidateInfo } : d));
        }
        return [...prev, candidateInfo];
      });
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : MSG_ERR_SCAN_FAILED;
        setConnectionError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsScanning(false);
      }
    }
  }, [allowedTier, clearManagedTimeout, isBluetoothSupported, scheduleManagedTimeout]);

  /**
   * Connette un dispositivo BLE nativo tramite GATT oppure attiva la connessione simulata con attesa asincrona.
   * Applica il controllo Tier 1/2/3 e previene connessioni duplicate o race condition.
   * @param deviceId Identificativo univoco del dispositivo da connettere
   * @returns Promise risolta al completamento o annullamento della transizione
   */
  const connectDevice = useCallback(
    async (deviceId: string): Promise<void> => {
      if (!isBleEnabledForTier(allowedTier)) {
        setConnectionError(MSG_ERR_TIER1_BLE_BLOCKED);
        return;
      }

      const target = devicesRef.current.find((d) => d.id === deviceId);
      if (!target) {
        setConnectionError(MSG_ERR_DEVICE_NOT_FOUND);
        return;
      }

      if (!isDeviceAllowedForTier(target, allowedTier)) {
        setConnectionError(MSG_ERR_TIER2_PROPRIETARY_ONLY);
        return;
      }

      const effectiveStatus = pendingStatusRef.current.get(deviceId) ?? target.connectionStatus;
      if (effectiveStatus === 'connected' || effectiveStatus === 'connecting') {
        return;
      }

      setConnectionError(null);
      cancelDeviceTransition(deviceId);

      const nativeDevice = nativeDevicesRef.current.get(deviceId);
      if (nativeDevice && !isSimulatorActiveRef.current) {
        if (!nativeDevice.gatt) {
          setConnectionError(MSG_ERR_NO_GATT_SERVER);
          updateDeviceStatus(deviceId, 'error');
          return;
        }

        pendingStatusRef.current.set(deviceId, 'connecting');
        updateDeviceStatus(deviceId, 'connecting');

        try {
          cleanupNativeSubscription(deviceId);
          const server = await nativeDevice.gatt.connect();

          const onDisconnected = (): void => {
            cleanupNativeSubscription(deviceId);
            pendingStatusRef.current.delete(deviceId);
            if (!isMountedRef.current) {
              return;
            }
            updateDeviceStatus(deviceId, 'disconnected');
            const anyOtherConnected = devicesRef.current.some(
              (d) => d.id !== deviceId && d.connectionStatus === 'connected'
            );
            if (!anyOtherConnected) {
              setLiveTelemetry(null);
            }
          };

          nativeDevice.addEventListener('gattserverdisconnected', onDisconnected);

          let subscribedCharacteristic: BleGattCharacteristic | undefined;
          let subscribedHandler: ((event: Event) => void) | undefined;

          for (const candidate of GATT_SUBSCRIPTION_CANDIDATES) {
            try {
              const service = await server.getPrimaryService(candidate.serviceUuid);
              const characteristic = await service.getCharacteristic(candidate.characteristicUuid);
              await characteristic.startNotifications();

              const onValueChanged = (event: Event): void => {
                if (!isMountedRef.current) {
                  return;
                }
                const eventTarget = event.target as unknown as BleGattCharacteristic | null;
                const dataView = eventTarget?.value ?? characteristic.value;
                if (!dataView) {
                  return;
                }
                gattSeqRef.current += 1;
                const seq = gattSeqRef.current;

                if (candidate.parserKind === 'heart_rate') {
                  const hrFrame = parseHeartRateMeasurement(dataView, deviceId, seq);
                  if (hrFrame) {
                    setLiveTelemetry((prev) => ({
                      vbtFrame: prev?.vbtFrame ?? null,
                      heartRateFrame: hrFrame,
                      latestRepetition: prev?.latestRepetition ?? null,
                      repetitionHistory: prev?.repetitionHistory ?? [],
                      lastUpdatedMs: hrFrame.timestampMs
                    }));
                  }
                } else {
                  const vbtFrame = parseVbtTelemetryPacket(dataView, deviceId, seq);
                  if (vbtFrame) {
                    setLiveTelemetry((prev) => ({
                      vbtFrame,
                      heartRateFrame: prev?.heartRateFrame ?? null,
                      latestRepetition: prev?.latestRepetition ?? null,
                      repetitionHistory: prev?.repetitionHistory ?? [],
                      lastUpdatedMs: vbtFrame.timestampMs
                    }));
                  }
                }
              };

              characteristic.addEventListener('characteristicvaluechanged', onValueChanged);
              subscribedCharacteristic = characteristic;
              subscribedHandler = onValueChanged;
              break;
            } catch {
              // Servizio GATT non esposto da questo sensore: prova il candidato successivo
            }
          }

          if (!subscribedCharacteristic) {
            nativeDevice.removeEventListener('gattserverdisconnected', onDisconnected);
            pendingStatusRef.current.delete(deviceId);
            if (isMountedRef.current) {
              updateDeviceStatus(deviceId, 'error');
              setConnectionError(MSG_ERR_GATT_SERVICE_NOT_FOUND);
            }
            return;
          }

          nativeSubscriptionsRef.current.set(deviceId, {
            device: nativeDevice,
            characteristic: subscribedCharacteristic,
            onValueChanged: subscribedHandler,
            onDisconnected
          });

          pendingStatusRef.current.delete(deviceId);
          if (isMountedRef.current) {
            updateDeviceStatus(deviceId, 'connected');
          }
        } catch (err: unknown) {
          cleanupNativeSubscription(deviceId);
          pendingStatusRef.current.delete(deviceId);
          if (isMountedRef.current) {
            updateDeviceStatus(deviceId, 'error');
            const message = err instanceof Error ? err.message : MSG_ERR_GATT_CONNECTION_FAILED;
            setConnectionError(message);
          }
        }
        return;
      }

      pendingStatusRef.current.set(deviceId, 'connecting');
      updateDeviceStatus(deviceId, 'connecting');

      await new Promise<void>((resolve) => {
        deviceWaitersRef.current.set(deviceId, resolve);
        const timerHandle = scheduleManagedTimeout(() => {
          deviceTimeoutsRef.current.delete(deviceId);
          deviceWaitersRef.current.delete(deviceId);
          pendingStatusRef.current.delete(deviceId);

          if (isMountedRef.current) {
            updateDeviceStatus(deviceId, 'connected');
          }
          resolve();
        }, SIMULATED_CONNECT_DELAY_MS);
        deviceTimeoutsRef.current.set(deviceId, timerHandle);
      });
    },
    [
      allowedTier,
      cancelDeviceTransition,
      cleanupNativeSubscription,
      scheduleManagedTimeout,
      updateDeviceStatus
    ]
  );

  /**
   * Disconnette un dispositivo BLE nativo o simulato e pulisce la telemetria residua se nessun sensore resta connesso.
   * @param deviceId Identificativo univoco del dispositivo da disconnettere
   * @returns Promise risolta al completamento della disconnessione
   */
  const disconnectDevice = useCallback(
    async (deviceId: string): Promise<void> => {
      const target = devicesRef.current.find((d) => d.id === deviceId);
      if (!target) {
        return;
      }

      const effectiveStatus = pendingStatusRef.current.get(deviceId) ?? target.connectionStatus;
      if (effectiveStatus === 'disconnected' || effectiveStatus === 'disconnecting') {
        return;
      }

      cancelDeviceTransition(deviceId);

      const nativeDevice = nativeDevicesRef.current.get(deviceId);
      if (nativeDevice) {
        cleanupNativeSubscription(deviceId);
        try {
          if (nativeDevice.gatt?.connected) {
            nativeDevice.gatt.disconnect();
          }
        } catch {
          // Tolleranza su errore disconnect in chiusura hardware
        }
      }

      pendingStatusRef.current.set(deviceId, 'disconnecting');
      updateDeviceStatus(deviceId, 'disconnecting');

      await new Promise<void>((resolve) => {
        deviceWaitersRef.current.set(deviceId, resolve);
        const timerHandle = scheduleManagedTimeout(() => {
          deviceTimeoutsRef.current.delete(deviceId);
          deviceWaitersRef.current.delete(deviceId);
          pendingStatusRef.current.delete(deviceId);

          if (isMountedRef.current) {
            updateDeviceStatus(deviceId, 'disconnected');
            const anyOtherConnected = devicesRef.current.some((d) => {
              if (d.id === deviceId) {
                return false;
              }
              const status = pendingStatusRef.current.get(d.id) ?? d.connectionStatus;
              return status === 'connected';
            });
            if (!anyOtherConnected) {
              setLiveTelemetry(null);
            }
          }
          resolve();
        }, SIMULATED_DISCONNECT_DELAY_MS);
        deviceTimeoutsRef.current.set(deviceId, timerHandle);
      });
    },
    [cancelDeviceTransition, cleanupNativeSubscription, scheduleManagedTimeout, updateDeviceStatus]
  );

  /**
   * Azzera il buffer della telemetria corrente e resetta i contatori di ripetizioni e tick del simulatore.
   * @returns void
   */
  const clearTelemetry = useCallback((): void => {
    repCounterRef.current = 0;
    simTickRef.current = 0;
    setLiveTelemetry(null);
  }, []);

  /**
   * Genera una ripetizione VBT mock fisicamente coerente con la relazione inversa Forza-Velocita.
   * @returns Ripetizione completata tipizzata LinearTransducerRepetition
   */
  const generateMockRepetition = useCallback((): LinearTransducerRepetition => {
    repCounterRef.current += 1;
    const repNum = repCounterRef.current;

    const rawMeanVel =
      MOCK_REP_BASE_VELOCITY_MPS + (repNum % MOCK_REP_VELOCITY_MODULO) * MOCK_REP_VELOCITY_STEP_MPS;
    const meanVel = asMetersPerSecond(
      clampToRange(rawMeanVel, MOCK_REP_MIN_VELOCITY_MPS, MOCK_REP_MAX_VELOCITY_MPS)
    );
    const peakVel = asMetersPerSecond(
      clampToRange(
        meanVel * MOCK_REP_PEAK_VELOCITY_RATIO,
        MOCK_REP_MIN_PEAK_VELOCITY_MPS,
        MOCK_REP_MAX_PEAK_VELOCITY_MPS
      )
    );
    // Forza media inversamente proporzionale alla velocita media propulsiva
    const rawMeanForce = MOCK_REP_BASELINE_FORCE_N - MOCK_REP_FV_SLOPE_N_PER_MPS * meanVel;
    const meanForce = asNewtons(
      clampToRange(rawMeanForce, MOCK_REP_MIN_FORCE_N, MOCK_REP_MAX_FORCE_N)
    );
    const peakPower = asWatts(
      clampToRange(
        meanForce * meanVel * MOCK_REP_POWER_FACTOR,
        MOCK_REP_MIN_POWER_W,
        MOCK_REP_MAX_POWER_W
      )
    );

    const completedRep: LinearTransducerRepetition = {
      repNumber: repNum,
      meanPropulsiveVelocityMps: meanVel,
      peakVelocityMps: peakVel,
      meanForceN: meanForce,
      peakPowerW: peakPower,
      romMeters: MOCK_REP_ROM_METERS,
      durationMs: asMilliseconds(MOCK_REP_DURATION_MS)
    };

    setLiveTelemetry((prev) => {
      const history = prev?.repetitionHistory ?? [];
      const updatedHistory = [...history, completedRep];
      const nowMs = asMilliseconds(Date.now());

      return {
        vbtFrame: prev?.vbtFrame ?? null,
        heartRateFrame: prev?.heartRateFrame ?? null,
        latestRepetition: completedRep,
        repetitionHistory: updatedHistory,
        lastUpdatedMs: nowMs
      };
    });

    return completedRep;
  }, []);

  /**
   * Attiva o disattiva il simulatore locale a 10 Hz persistendone lo stato in localStorage.
   * Connette automaticamente i dispositivi simulati consentiti dal Tier quando attivato e li disconnette quando spento.
   * @param active Stato target opzionale; se omesso inverte lo stato corrente
   * @returns void
   */
  const toggleSimulator = useCallback(
    (active?: boolean): void => {
      const nextState = typeof active === 'boolean' ? active : !isSimulatorActiveRef.current;

      if (nextState && !isBleEnabledForTier(allowedTier)) {
        setConnectionError(MSG_ERR_TIER1_BLE_BLOCKED);
        return;
      }

      setConnectionError(null);
      setIsSimulatorActive(nextState);
      writeStorageSafe(STORAGE_KEY_BLE_SIMULATOR, String(nextState));

      if (nextState) {
        setDevices((prev) =>
          prev.map((d) => {
            if (isSimulatedDeviceId(d.id) && isDeviceAllowedForTier(d, allowedTier)) {
              cancelDeviceTransition(d.id);
              pendingStatusRef.current.delete(d.id);
              return { ...d, connectionStatus: 'connected' };
            }
            return d;
          })
        );
      } else {
        setDevices((prev) =>
          prev.map((d) => {
            if (isSimulatedDeviceId(d.id) && d.connectionStatus !== 'disconnected') {
              cancelDeviceTransition(d.id);
              pendingStatusRef.current.delete(d.id);
              return { ...d, connectionStatus: 'disconnected' };
            }
            return d;
          })
        );
        const hasNativeConnected = devicesRef.current.some(
          (d) => !isSimulatedDeviceId(d.id) && d.connectionStatus === 'connected'
        );
        if (!hasNativeConnected) {
          setLiveTelemetry(null);
        }
      }
    },
    [allowedTier, cancelDeviceTransition]
  );

  // Applica il gating del Tier in caso di cambio dinamico del piano di abbonamento
  useEffect(() => {
    if (!isBleEnabledForTier(allowedTier) && isSimulatorActiveRef.current) {
      setIsSimulatorActive(false);
      writeStorageSafe(STORAGE_KEY_BLE_SIMULATOR, String(false));
    }

    setDevices((prev) => {
      let changed = false;
      const next = prev.map((d) => {
        if (d.connectionStatus !== 'disconnected' && !isDeviceAllowedForTier(d, allowedTier)) {
          changed = true;
          cancelDeviceTransition(d.id);
          pendingStatusRef.current.delete(d.id);
          cleanupNativeSubscription(d.id);
          return { ...d, connectionStatus: 'disconnected' as const };
        }
        return d;
      });
      return changed ? next : prev;
    });
  }, [allowedTier, cancelDeviceTransition, cleanupNativeSubscription]);

  // Gestione timer stream del simulatore a 10 Hz
  useEffect(() => {
    if (!isSimulatorActive || !isBleEnabledForTier(allowedTier)) {
      if (simulatorTimerRef.current) {
        clearInterval(simulatorTimerRef.current);
        simulatorTimerRef.current = null;
      }
      return;
    }

    simulatorTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        return;
      }

      simTickRef.current += 1;
      const tick = simTickRef.current;
      const nowMs = asMilliseconds(Date.now());
      const kinematics = computeSimulatedKinematics(tick);

      const vbtDeviceAllowed = allowedTier === 'tier3';
      const vbtFrame: VbtTelemetryFrame | null = vbtDeviceAllowed
        ? {
            deviceId: 'sim_vitruve_01',
            deviceType: 'vbt_encoder',
            timestampMs: nowMs,
            sequenceNumber: tick,
            displacementMm: kinematics.displacementMm,
            instantVelocityMps: kinematics.velocityMps,
            instantForceN: kinematics.forceN,
            instantPowerW: kinematics.powerW
          }
        : null;

      const rawHr = SIM_HR_BASELINE_BPM + Math.sin(tick * SIM_HR_FREQUENCY_RAD) * SIM_HR_AMPLITUDE_BPM;
      const heartRateBpm = Math.round(clampToRange(rawHr, MIN_HEART_RATE_BPM, MAX_HEART_RATE_BPM));

      const hrFrame: HeartRateTelemetryFrame | null = vbtDeviceAllowed
        ? {
            deviceId: 'sim_polar_01',
            deviceType: 'heart_rate_strap',
            timestampMs: nowMs,
            sequenceNumber: tick,
            heartRateBpm,
            rrIntervalsMs: [asMilliseconds(Math.round(MS_PER_MINUTE / heartRateBpm))]
          }
        : null;

      setLiveTelemetry((prev) => ({
        vbtFrame,
        heartRateFrame: hrFrame,
        latestRepetition: prev?.latestRepetition ?? null,
        repetitionHistory: prev?.repetitionHistory ?? [],
        lastUpdatedMs: nowMs
      }));
    }, SIMULATOR_INTERVAL_MS);

    return () => {
      if (simulatorTimerRef.current) {
        clearInterval(simulatorTimerRef.current);
        simulatorTimerRef.current = null;
      }
    };
  }, [allowedTier, isSimulatorActive]);

  // Cleanup deterministico di tutti i timer, intervalli e sottoscrizioni GATT su unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (simulatorTimerRef.current) {
        clearInterval(simulatorTimerRef.current);
        simulatorTimerRef.current = null;
      }
      clearAllManagedTimeouts();

      const nativeIds = Array.from(nativeSubscriptionsRef.current.keys());
      for (const id of nativeIds) {
        cleanupNativeSubscription(id);
      }
    };
  }, [cleanupNativeSubscription, clearAllManagedTimeouts]);

  const contextValue: BleContextValue = useMemo(() => {
    return {
      devices,
      connectedDevices,
      isScanning,
      isBluetoothSupported,
      isSimulatorActive,
      isBleAllowedForTier,
      allowedTier,
      connectionError,
      liveTelemetry,
      isAnyConnected,
      isVbtConnected,
      isHeartRateConnected,
      startScan,
      stopScan,
      connectDevice,
      disconnectDevice,
      toggleSimulator,
      generateMockRepetition,
      clearTelemetry
    };
  }, [
    devices,
    connectedDevices,
    isScanning,
    isBluetoothSupported,
    isSimulatorActive,
    isBleAllowedForTier,
    allowedTier,
    connectionError,
    liveTelemetry,
    isAnyConnected,
    isVbtConnected,
    isHeartRateConnected,
    startScan,
    stopScan,
    connectDevice,
    disconnectDevice,
    toggleSimulator,
    generateMockRepetition,
    clearTelemetry
  ]);

  return <BleContext.Provider value={contextValue}>{children}</BleContext.Provider>;
};

/**
 * Hook interno per accedere al contesto BleContext.
 * Solleva un errore chiaro se invocato fuori da un BleProvider.
 * @returns Valore tipizzato del contesto BLE
 */
export function useBleContext(): BleContextValue {
  const context = useContext(BleContext);
  if (!context) {
    throw new Error('useBleContext must be used within a BleProvider');
  }
  return context;
}
