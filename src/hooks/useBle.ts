/**
 * src/hooks/useBle.ts
 * Hook consumatore dedicato per la telemetria hardware BLE e streaming VBT/Cardio/T7.
 * Espone scorciatoie ergonomiche, dispositivi connessi ed errori di connessione con memoizzazione stabile.
 * Conforme ad ADR-01 (Thin Client), ADR-03 (Rigore Metrologico SI) e Regola 02.
 */

import { useMemo } from 'react';
import { useBleContext, BleContextValue } from '../context/BleContext';
import { MetersPerSecond, Watts, Newtons, LinearTransducerRepetition } from '../types';

// ============================================================================
// COSTANTI ETICHETTE STATO CONNESSIONE (REGOLA 02)
// ============================================================================

const LABEL_NO_SENSOR = 'Nessun sensore connesso';
const LABEL_VBT_AND_HR_CONNECTED = 'Encoder VBT e Cardio connessi';
const LABEL_VBT_CONNECTED = 'Encoder VBT connesso';
const LABEL_HR_CONNECTED = 'Cardiofrequenzimetro connesso';
const LABEL_SCANNING = 'Scansione sensori in corso...';
const LABEL_SIMULATOR_ACTIVE = 'Simulatore hardware attivo (10 Hz)';

export interface UseBleReturn extends BleContextValue {
  vbtVelocity: MetersPerSecond | null;
  vbtPower: Watts | null;
  vbtForce: Newtons | null;
  heartRateBpm: number | null;
  latestRepetition: LinearTransducerRepetition | null;
  repetitionCount: number;
  connectionStatusLabel: string;
}

/**
 * Hook per accedere e controllare la telemetria BLE hardware o simulata.
 * Memoizza l'oggetto restituito per garantire stabilita referenziale ai componenti UI.
 * @returns Stato della telemetria con flag precalcolati, connectedDevices, connectionError e scorciatoie
 */
export function useBle(): UseBleReturn {
  const context = useBleContext();

  return useMemo<UseBleReturn>(() => {
    const vbtVelocity = context.liveTelemetry?.vbtFrame?.instantVelocityMps ?? null;
    const vbtPower = context.liveTelemetry?.vbtFrame?.instantPowerW ?? null;
    const vbtForce = context.liveTelemetry?.vbtFrame?.instantForceN ?? null;
    const heartRateBpm = context.liveTelemetry?.heartRateFrame?.heartRateBpm ?? null;
    const latestRepetition = context.liveTelemetry?.latestRepetition ?? null;
    const repetitionCount = context.liveTelemetry?.repetitionHistory.length ?? 0;

    let connectionStatusLabel = LABEL_NO_SENSOR;
    if (context.isVbtConnected && context.isHeartRateConnected) {
      connectionStatusLabel = LABEL_VBT_AND_HR_CONNECTED;
    } else if (context.isVbtConnected) {
      connectionStatusLabel = LABEL_VBT_CONNECTED;
    } else if (context.isHeartRateConnected) {
      connectionStatusLabel = LABEL_HR_CONNECTED;
    } else if (context.isScanning) {
      connectionStatusLabel = LABEL_SCANNING;
    } else if (context.isSimulatorActive) {
      connectionStatusLabel = LABEL_SIMULATOR_ACTIVE;
    }

    return {
      ...context,
      connectedDevices: context.connectedDevices,
      connectionError: context.connectionError,
      vbtVelocity,
      vbtPower,
      vbtForce,
      heartRateBpm,
      latestRepetition,
      repetitionCount,
      connectionStatusLabel
    };
  }, [context]);
}

export default useBle;
