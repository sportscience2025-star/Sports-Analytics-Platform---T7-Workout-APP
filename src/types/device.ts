/**
 * src/types/device.ts
 * Connettivita BLE, Standard GATT UUID e Strutture di Telemetria Hardware.
 * Compatibile con Web Bluetooth API nativa del browser e sensori proprietari T7.
 * Conforme a Regola 02 (costanti in MAIUSCOLO, zero magic numbers).
 */

import { Milliseconds, Newtons, Watts, MetersPerSecond } from './physics';

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

// Servizi Proprietari T7 Hardware Ecosystem
export const GATT_T7_VBT_ENCODER_SERVICE_UUID = '0000t701-0000-1000-8000-00805f9b34fb';
export const GATT_T7_LACTATE_SENSOR_SERVICE_UUID = '0000t702-0000-1000-8000-00805f9b34fb';

export interface BleDeviceInfo {
  id: string;
  name: string;
  type: BleDeviceType;
  connectionStatus: BleConnectionStatus;
  batteryLevel?: number; // 0 - 100%
  rssi?: number; // Intensita segnale dBm
  firmwareVersion?: string;
  hardwareSerial?: string;
}

export interface TelemetryFrame {
  deviceId: string;
  deviceType: BleDeviceType;
  timestampMs: Milliseconds;
  sequenceNumber: number;
}

export interface HeartRateTelemetryFrame extends TelemetryFrame {
  deviceType: 'heart_rate_strap';
  heartRateBpm: number;
  rrIntervalsMs?: readonly Milliseconds[];
}

export interface VbtTelemetryFrame extends TelemetryFrame {
  deviceType: 'vbt_encoder';
  displacementMm: number;
  instantVelocityMps: MetersPerSecond;
  instantForceN?: Newtons;
  instantPowerW?: Watts;
}

export interface LinearTransducerRepetition {
  repNumber: number;
  meanPropulsiveVelocityMps: MetersPerSecond;
  peakVelocityMps: MetersPerSecond;
  meanForceN?: Newtons;
  peakPowerW?: Watts;
  romMeters: number;
  durationMs: Milliseconds;
}

export const MIN_HEART_RATE_BPM = 30;
export const MAX_HEART_RATE_BPM = 240;

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
