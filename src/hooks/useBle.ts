/**
 * src/hooks/useBle.ts
 * Hook consumatore dedicato per la telemetria hardware BLE e streaming VBT/Cardio.
 * Espone scorciatoie ergonomiche e pre-calcolate per grafici e widget UI in tempo reale.
 * Conforme ad ADR-01 (Thin Client), ADR-03 (Rigore Metrologico SI) e Regola 02.
 */

import { useBleContext, BleContextValue } from '../context/BleContext';
import { MetersPerSecond, Watts, Newtons, LinearTransducerRepetition } from '../types';

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
 * @returns Stato della telemetria con flag precalcolati e scorciatoie per i widget
 */
export function useBle(): UseBleReturn {
  const context = useBleContext();

  const vbtVelocity = context.liveTelemetry?.vbtFrame?.instantVelocityMps ?? null;
  const vbtPower = context.liveTelemetry?.vbtFrame?.instantPowerW ?? null;
  const vbtForce = context.liveTelemetry?.vbtFrame?.instantForceN ?? null;
  const heartRateBpm = context.liveTelemetry?.heartRateFrame?.heartRateBpm ?? null;
  const latestRepetition = context.liveTelemetry?.latestRepetition ?? null;
  const repetitionCount = context.liveTelemetry?.repetitionHistory.length ?? 0;

  let connectionStatusLabel = 'Nessun sensore connesso';
  if (context.isVbtConnected && context.isHeartRateConnected) {
    connectionStatusLabel = 'Encoder VBT e Cardio connessi';
  } else if (context.isVbtConnected) {
    connectionStatusLabel = 'Encoder VBT connesso';
  } else if (context.isHeartRateConnected) {
    connectionStatusLabel = 'Cardiofrequenzimetro connesso';
  } else if (context.isScanning) {
    connectionStatusLabel = 'Scansione sensori in corso...';
  } else if (context.isSimulatorActive) {
    connectionStatusLabel = 'Simulatore hardware attivo (10 Hz)';
  }

  return {
    ...context,
    vbtVelocity,
    vbtPower,
    vbtForce,
    heartRateBpm,
    latestRepetition,
    repetitionCount,
    connectionStatusLabel
  };
}

export default useBle;
