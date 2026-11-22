/**
 * src/context/BleContext.tsx
 * React Context per il monitoraggio hardware BLE e streaming di telemetria VBT/Cardio.
 * Conforme ad ADR-01 (Thin Client), ADR-03 (Rigore Metrologico SI) e Regola 02.
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  BleDeviceInfo,
  BleConnectionStatus,
  LiveTelemetryState,
  LinearTransducerRepetition,
  VbtTelemetryFrame,
  HeartRateTelemetryFrame,
  MIN_HEART_RATE_BPM,
  MAX_HEART_RATE_BPM,
  asMetersPerSecond,
  asWatts,
  asNewtons,
  asMilliseconds
} from '../types';
import { sanitizeNumeric, clampToRange } from '../utils/metrology-guard';

export const SIMULATOR_INTERVAL_MS = 100; // Frequenza simulatore 10 Hz (100 ms)
export const STORAGE_KEY_BLE_SIMULATOR = 't7_ble_simulator_active';

export const DEFAULT_SIMULATED_DEVICES: readonly BleDeviceInfo[] = Object.freeze([
  {
    id: 'sim_vitruve_01',
    name: 'Vitruve Encoder (Simulated)',
    type: 'vbt_encoder',
    connectionStatus: 'disconnected',
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
    batteryLevel: 88,
    rssi: -62,
    firmwareVersion: 'v3.1.0',
    hardwareSerial: 'POL-SIM-002'
  }
]);

export interface BleContextValue {
  devices: readonly BleDeviceInfo[];
  isScanning: boolean;
  isBluetoothSupported: boolean;
  isSimulatorActive: boolean;
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
  children: React.ReactNode;
  initialDevices?: readonly BleDeviceInfo[];
  autoStartSimulator?: boolean;
}

/**
 * Rileva il supporto della Web Bluetooth API nel runtime del browser in modo sicuro.
 * @returns true se Web Bluetooth API e disponibile e supportata
 */
export function checkWebBluetoothSupport(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const nav = navigator as { bluetooth?: { requestDevice?: unknown } };
  return typeof nav.bluetooth !== 'undefined' && typeof nav.bluetooth.requestDevice === 'function';
}

export const BleContext = createContext<BleContextValue | null>(null);

/**
 * Provider React per la gestione della telemetria hardware e connettivita BLE.
 * @param props Proprieta del provider (figli, configurazione iniziale e autostart simulatore)
 * @returns Elemento React Provider con memoizzazione ottimale
 */
export const BleProvider: React.FC<BleProviderProps> = ({
  children,
  initialDevices,
  autoStartSimulator = false
}) => {
  const isMountedRef = useRef<boolean>(true);
  const simulatorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const repCounterRef = useRef<number>(0);
  const simTickRef = useRef<number>(0);

  const isBluetoothSupported = useMemo<boolean>(() => {
    return checkWebBluetoothSupport();
  }, []);

  const [devices, setDevices] = useState<readonly BleDeviceInfo[]>(() => {
    return initialDevices ?? DEFAULT_SIMULATED_DEVICES;
  });

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(autoStartSimulator);
  const [liveTelemetry, setLiveTelemetry] = useState<LiveTelemetryState | null>(null);

  const isAnyConnected = useMemo<boolean>(() => {
    return devices.some((d) => d.connectionStatus === 'connected');
  }, [devices]);

  const isVbtConnected = useMemo<boolean>(() => {
    return devices.some(
      (d) => d.type === 'vbt_encoder' && d.connectionStatus === 'connected'
    );
  }, [devices]);

  const isHeartRateConnected = useMemo<boolean>(() => {
    return devices.some(
      (d) => d.type === 'heart_rate_strap' && d.connectionStatus === 'connected'
    );
  }, [devices]);

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

  const startScan = useCallback(async (): Promise<void> => {
    if (!isBluetoothSupported) {
      // In ambiente privo di Web Bluetooth API, la scansione attiva il discovery simulato
      setIsScanning(true);
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsScanning(false);
        }
      }, 1500);
      return;
    }

    try {
      setIsScanning(true);
      // Web Bluetooth API requestDevice verra integrata con filtri UUID
    } catch {
      // Errore o annullamento da parte dell'utente nel picker nativo
    } finally {
      if (isMountedRef.current) {
        setIsScanning(false);
      }
    }
  }, [isBluetoothSupported]);

  const stopScan = useCallback((): void => {
    setIsScanning(false);
  }, []);

  const connectDevice = useCallback(
    async (deviceId: string): Promise<void> => {
      const target = devices.find((d) => d.id === deviceId);
      if (!target || target.connectionStatus === 'connecting') {
        return;
      }

      updateDeviceStatus(deviceId, 'connecting');

      // Simulazione handshake asincrono o aggancio GATT reale
      setTimeout(() => {
        if (isMountedRef.current) {
          updateDeviceStatus(deviceId, 'connected');
        }
      }, 400);
    },
    [devices, updateDeviceStatus]
  );

  const disconnectDevice = useCallback(
    async (deviceId: string): Promise<void> => {
      const target = devices.find((d) => d.id === deviceId);
      if (!target || target.connectionStatus === 'disconnecting') {
        return;
      }

      updateDeviceStatus(deviceId, 'disconnecting');

      setTimeout(() => {
        if (isMountedRef.current) {
          updateDeviceStatus(deviceId, 'disconnected');
        }
      }, 200);
    },
    [devices, updateDeviceStatus]
  );

  const clearTelemetry = useCallback((): void => {
    setLiveTelemetry(null);
  }, []);

  const generateMockRepetition = useCallback((): LinearTransducerRepetition => {
    repCounterRef.current += 1;
    const repNum = repCounterRef.current;

    // Variazione deterministica fisiologica per ciascuna ripetizione simulata
    const meanVel = asMetersPerSecond(clampToRange(0.72 + (repNum % 4) * 0.04, 0.2, 2.5));
    const peakVel = asMetersPerSecond(clampToRange(meanVel * 1.38, 0.3, 3.5));
    const meanForce = asNewtons(clampToRange(720 + (repNum % 3) * 35, 100, 3000));
    const peakPower = asWatts(clampToRange(580 + (repNum % 5) * 45, 100, 4000));
    const rom = 0.48;
    const durMs = asMilliseconds(620);

    const completedRep: LinearTransducerRepetition = {
      repNumber: repNum,
      meanPropulsiveVelocityMps: meanVel,
      peakVelocityMps: peakVel,
      meanForceN: meanForce,
      peakPowerW: peakPower,
      romMeters: rom,
      durationMs: durMs
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

  const toggleSimulator = useCallback((active?: boolean): void => {
    setIsSimulatorActive((prev) => {
      const nextState = typeof active === 'boolean' ? active : !prev;
      return nextState;
    });
  }, []);

  // Gestione timer stream del simulatore a 10 Hz
  useEffect(() => {
    if (!isSimulatorActive) {
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

      // Profilo sinusoidale per simulare l'escursione concentrica ed eccentrica
      const phase = (tick % 30) / 30; // Ciclo di 3 secondi a 10 Hz
      const rawDisplacement = Math.sin(phase * Math.PI * 2) * 240 + 250;
      const displacement = sanitizeNumeric(rawDisplacement, 250);

      const rawVel = phase < 0.5 ? Math.sin(phase * Math.PI) * 1.15 : 0.05;
      const velocity = asMetersPerSecond(clampToRange(rawVel, 0.0, 3.5));

      const rawForce = 680 + velocity * 220;
      const force = asNewtons(clampToRange(rawForce, 0, 5000));

      const rawPower = velocity * force;
      const power = asWatts(clampToRange(rawPower, 0, 8000));

      const vbtFrame: VbtTelemetryFrame = {
        deviceId: 'sim_vitruve_01',
        deviceType: 'vbt_encoder',
        timestampMs: nowMs,
        sequenceNumber: tick,
        displacementMm: displacement,
        instantVelocityMps: velocity,
        instantForceN: force,
        instantPowerW: power
      };

      // Frequenza cardiaca simulata: 138 - 156 bpm con fluttuazioni fisiologiche
      const rawHr = 142 + Math.sin(tick * 0.15) * 8;
      const heartRateBpm = Math.round(clampToRange(rawHr, MIN_HEART_RATE_BPM, MAX_HEART_RATE_BPM));

      const hrFrame: HeartRateTelemetryFrame = {
        deviceId: 'sim_polar_01',
        deviceType: 'heart_rate_strap',
        timestampMs: nowMs,
        sequenceNumber: tick,
        heartRateBpm,
        rrIntervalsMs: [asMilliseconds(Math.round(60000 / heartRateBpm))]
      };

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
  }, [isSimulatorActive]);

  // Cleanup all'unmount del componente
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (simulatorTimerRef.current) {
        clearInterval(simulatorTimerRef.current);
        simulatorTimerRef.current = null;
      }
    };
  }, []);

  const contextValue: BleContextValue = useMemo(() => {
    return {
      devices,
      isScanning,
      isBluetoothSupported,
      isSimulatorActive,
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
    isScanning,
    isBluetoothSupported,
    isSimulatorActive,
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
