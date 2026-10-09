/**
 * src/parser/index.ts
 * Entry point unificato per la suite di Parsing Multi-Encoder e Strumenti di Misura Biomeccanici.
 * Rispetta la Regola R1 (Zero any) e Regola R2 (Single Source of Truth).
 */

import { readDelimitedText, type ParsedFileDataset } from './file-readers';
import { detectInstrumentType, type InstrumentDetectionResult } from './instrument-detector';
import { aggregateRepsByLoad, toLoadVelocityPoints, type AggregatedLoadStep } from './load-aggregator';
import type { LoadVelocityPoint } from '../types/physics';

export * from './file-readers';
export * from './header-mapper';
export * from './athlete-resolver';
export * from './instrument-detector';
export * from './load-aggregator';
export * from './exercise-dict';

export interface MeasurementFileResult {
  instrument: InstrumentDetectionResult;
  athleteName: string;
  exerciseName: string;
  aggregatedSteps: AggregatedLoadStep[];
  points: LoadVelocityPoint[];
  rawRecordsCount: number;
}

/**
 * Funzione principale di parsing per file esportati da encoder e pedane di forza.
 *
 * @param content - Stringa di testo (CSV, TSV) del file
 * @param fileName - Nome del file caricato
 * @returns Oggetto MeasurementFileResult pronto per l'analisi VBT
 */
export function parseMeasurementFile(
  content: string,
  fileName: string = ''
): MeasurementFileResult {
  const parsed = readDelimitedText(content, fileName);
  const instrument = detectInstrumentType(parsed.headers, parsed.records as unknown as Record<string, unknown>[]);
  const aggregatedSteps = aggregateRepsByLoad(parsed.records);
  const points = toLoadVelocityPoints(aggregatedSteps, false);

  return {
    instrument,
    athleteName: parsed.athleteName,
    exerciseName: parsed.exerciseName,
    aggregatedSteps,
    points,
    rawRecordsCount: parsed.records.length,
  };
}
