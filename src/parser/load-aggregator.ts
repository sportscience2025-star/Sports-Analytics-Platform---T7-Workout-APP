/**
 * src/parser/load-aggregator.ts
 * Aggregazione statistica delle ripetizioni VBT per gradino di carico (Load Step).
 * Calcola velocità media, velocità massima, deviazione standard e coefficiente di variazione.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import type { LoadVelocityPoint } from '../types/physics';

export interface RawRepetition {
  load: number;
  velocity: number;
  peakVelocity?: number;
  power?: number;
  setIndex?: number;
  repIndex?: number;
}

export interface AggregatedLoadStep {
  load: number;
  repsCount: number;
  meanVelocity: number;
  maxVelocity: number;
  sdVelocity: number;
  cvPercent: number;
  meanPower?: number;
}

/**
 * Raggruppa le singole ripetizioni per carico ed esegue l'aggregazione statistica.
 *
 * @param reps - Array di ripetizioni grezze estratte dal file encoder
 * @returns Array di gradini di carico ordinati in senso crescente
 */
export function aggregateRepsByLoad(reps: RawRepetition[]): AggregatedLoadStep[] {
  const validReps = reps.filter(
    (r) => !isNaN(r.load) && r.load > 0 && !isNaN(r.velocity) && r.velocity > 0
  );

  const groups = new Map<number, RawRepetition[]>();

  for (const rep of validReps) {
    const roundedLoad = Math.round(rep.load * 10) / 10;
    const existing = groups.get(roundedLoad) || [];
    existing.push(rep);
    groups.set(roundedLoad, existing);
  }

  const steps: AggregatedLoadStep[] = [];

  for (const [load, repList] of groups.entries()) {
    const velocities = repList.map((r) => r.velocity);
    const meanVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const maxVelocity = Math.max(...velocities);

    // Deviazione standard
    let variance = 0;
    if (velocities.length > 1) {
      const sumSq = velocities.reduce((acc, v) => acc + (v - meanVelocity) ** 2, 0);
      variance = sumSq / (velocities.length - 1);
    }
    const sdVelocity = Math.sqrt(variance);
    const cvPercent = meanVelocity > 0 ? (sdVelocity / meanVelocity) * 100 : 0;

    // Potenza media
    const powers = repList.map((r) => r.power).filter((p): p is number => typeof p === 'number' && !isNaN(p));
    const meanPower = powers.length > 0 ? powers.reduce((a, b) => a + b, 0) / powers.length : undefined;

    steps.push({
      load,
      repsCount: repList.length,
      meanVelocity: Math.round(meanVelocity * 1000) / 1000,
      maxVelocity: Math.round(maxVelocity * 1000) / 1000,
      sdVelocity: Math.round(sdVelocity * 1000) / 1000,
      cvPercent: Math.round(cvPercent * 10) / 10,
      meanPower: meanPower !== undefined ? Math.round(meanPower * 10) / 10 : undefined,
    });
  }

  // Ordina per carico crescente
  return steps.sort((a, b) => a.load - b.load);
}

/**
 * Converte i gradini di carico in punti standard LoadVelocityPoint per l'analisi di regressione.
 *
 * @param steps - Gradini aggregati
 * @param useBestRep - Se true utilizza la velocità massima per carico, altrimenti la velocità media
 * @returns Array di punti LoadVelocityPoint
 */
export function toLoadVelocityPoints(
  steps: AggregatedLoadStep[],
  useBestRep: boolean = false
): LoadVelocityPoint[] {
  return steps.map((s) => ({
    load: s.load,
    velocity: useBestRep ? s.maxVelocity : s.meanVelocity,
  }));
}
