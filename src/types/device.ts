/**
 * src/types/device.ts
 * Connettivita BLE, Standard GATT UUID e Strutture di Telemetria Hardware.
 * Compatibile con Web Bluetooth API nativa del browser e sensori proprietari T7.
 * Conforme a Regola 02 (costanti in MAIUSCOLO, zero magic numbers).
 */

import {
  Milliseconds,
  Newtons,
  Watts,
  MetersPerSecond,
  Kilograms,
  Degrees
} from './physics';

export type BleDeviceType =
  | 'vbt_encoder'
  | 'heart_rate_strap'
  | 'optical_sensor'
  | 'smart_scale'
  | 'lactate_analyzer'
  | 'gps_tracker'
  | 'generic_sensor';

export type BleConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'error';

// Standard Bluetooth SIG GATT Services (16-bit short e Canonical 128-bit)
export const GATT_HEART_RATE_SERVICE_16BIT = 0x180D;
export const GATT_HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';

export const GATT_CYCLING_POWER_SERVICE_16BIT = 0x1818;
export const GATT_CYCLING_POWER_SERVICE_UUID = '00001818-0000-1000-8000-00805f9b34fb';

export const GATT_FITNESS_MACHINE_SERVICE_16BIT = 0x1826;
export const GATT_FITNESS_MACHINE_SERVICE_UUID = '00001826-0000-1000-8000-00805f9b34fb';

// Servizi Proprietari T7 Hardware Ecosystem (UUID 128-bit vendor validi, esterni al Bluetooth SIG Base UUID)
export const GATT_T7_VBT_ENCODER_SERVICE_UUID = '77010001-7437-4000-8000-00805f9b34fb';
export const GATT_T7_LACTATE_SENSOR_SERVICE_UUID = '77020001-7437-4000-8000-00805f9b34fb';

export const MIN_BATTERY_LEVEL_PCT = 0;
export const MAX_BATTERY_LEVEL_PCT = 100;
export const MIN_HEART_RATE_BPM = 30;
export const MAX_HEART_RATE_BPM = 240;

/**
 * Metadati identificativi e stato di connessione di un dispositivo BLE rilevato o associato.
 */
export interface BleDeviceInfo {
  id: string;
  name: string;
  type: BleDeviceType;
  connectionStatus: BleConnectionStatus;
  vendorId?: string;
  isT7Proprietary?: boolean;
  batteryLevel?: number; // 0 - 100%
  rssi?: number; // Intensita segnale in dBm
  firmwareVersion?: string;
  hardwareSerial?: string;
}

/**
 * Struttura base comune a tutti i pacchetti di telemetria hardware ricevuti via BLE.
 */
export interface BaseTelemetryFrame {
  deviceId: string;
  deviceType: BleDeviceType;
  timestampMs: Milliseconds;
  sequenceNumber: number;
}

/**
 * Pacchetto telemetrico per fascia cardiofrequenzimetra (bpm e intervalli RR in ms).
 */
export interface HeartRateTelemetryFrame extends BaseTelemetryFrame {
  deviceType: 'heart_rate_strap';
  heartRateBpm: number;
  rrIntervalsMs?: readonly Milliseconds[];
}

/**
 * Pacchetto telemetrico per encoder lineare VBT (spostamento in mm, velocita in m/s, forza in N, potenza in W).
 */
export interface VbtTelemetryFrame extends BaseTelemetryFrame {
  deviceType: 'vbt_encoder';
  displacementMm: number;
  instantVelocityMps: MetersPerSecond;
  instantForceN?: Newtons;
  instantPowerW?: Watts;
}

/**
 * Pacchetto telemetrico per sensore ottico o motion-capture (angoli articolari in gradi).
 */
export interface OpticalSensorTelemetryFrame extends BaseTelemetryFrame {
  deviceType: 'optical_sensor';
  kneeAngleDeg?: Degrees;
  hipAngleDeg?: Degrees;
  ankleAngleDeg?: Degrees;
  trackingConfidence?: number; // 0.0 - 1.0
}

/**
 * Pacchetto telemetrico per bilancia impedenziometrica smart (massa corporea in kg e bioimpedenza in Ohm).
 */
export interface SmartScaleTelemetryFrame extends BaseTelemetryFrame {
  deviceType: 'smart_scale';
  bodyMassKg: Kilograms;
  resistanceOhms?: number;
  reactanceOhms?: number;
}

/**
 * Pacchetto telemetrico per analizzatore di lattato ematico / wearable T7 (concentrazione in mmol/L).
 */
export interface LactateAnalyzerTelemetryFrame extends BaseTelemetryFrame {
  deviceType: 'lactate_analyzer';
  bloodLactateMmolL: number;
  sampleTemperatureCelsius?: number;
  isT7Wearable?: boolean;
}

/**
 * Alias di compatibilita per il frame wearable lattato T7.
 */
export type T7WearableTelemetryFrame = LactateAnalyzerTelemetryFrame;

/**
 * Pacchetto telemetrico per tracker GPS da campo (velocita istantanea in m/s e distanza in metri).
 */
export interface GpsTrackerTelemetryFrame extends BaseTelemetryFrame {
  deviceType: 'gps_tracker';
  instantSpeedMps: MetersPerSecond;
  totalDistanceMeters: number;
  accelerationMps2?: number;
  highSpeedRunningMeters?: number;
}

/**
 * Pacchetto telemetrico generico per sensori ausiliari con unita esplicita.
 */
export interface GenericSensorTelemetryFrame extends BaseTelemetryFrame {
  deviceType: 'generic_sensor';
  metricKey: string;
  numericValue: number;
  unitLabel: string;
}

/**
 * Discriminated union completa per tutti i frame di telemetria hardware supportati.
 */
export type TelemetryFrame =
  | VbtTelemetryFrame
  | HeartRateTelemetryFrame
  | OpticalSensorTelemetryFrame
  | SmartScaleTelemetryFrame
  | LactateAnalyzerTelemetryFrame
  | GpsTrackerTelemetryFrame
  | GenericSensorTelemetryFrame;

export interface LinearTransducerRepetition {
  repNumber: number;
  meanPropulsiveVelocityMps: MetersPerSecond;
  peakVelocityMps: MetersPerSecond;
  meanForceN?: Newtons;
  peakPowerW?: Watts;
  romMeters: number;
  durationMs: Milliseconds;
}

export interface LiveTelemetryState {
  vbtFrame: VbtTelemetryFrame | null;
  heartRateFrame: HeartRateTelemetryFrame | null;
  latestRepetition: LinearTransducerRepetition | null;
  repetitionHistory: readonly LinearTransducerRepetition[];
  lastUpdatedMs: Milliseconds;
}

// ============================================================================
// CONTRATTI WEB BLUETOOTH API NATIVI (ZERO ANY, STRICT TYPESCRIPT)
// ============================================================================

export interface BleGattCharacteristic {
  readonly uuid: string;
  readonly value?: DataView;
  readValue?: () => Promise<DataView>;
  writeValue?: (value: BufferSource) => Promise<void>;
  startNotifications(): Promise<BleGattCharacteristic>;
  stopNotifications(): Promise<BleGattCharacteristic>;
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
}

export interface BleGattServer {
  readonly connected: boolean;
  connect(): Promise<BleGattServer>;
  disconnect(): void;
  getPrimaryService(serviceUuid: string | number): Promise<BleGattService>;
}

export interface BleGattService {
  readonly uuid: string;
  getCharacteristic(characteristicUuid: string | number): Promise<BleGattCharacteristic>;
}

export interface BleDeviceNative {
  readonly id: string;
  readonly name?: string;
  readonly gatt?: BleGattServer;
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
}
