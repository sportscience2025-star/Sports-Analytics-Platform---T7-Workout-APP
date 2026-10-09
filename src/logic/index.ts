/**
 * src/logic/index.ts
 * Barrel file per i motori di logica clinica, analisi del rischio, periodizzazione, session building ed export.
 * Rispetta la Regola R1 (Zero any) e Regola R2 (Single Source of Truth).
 */

export * from './risk-analyzer';
export * from './periodization';
export * from './warmup-cooldown';
export * from './session-builder';
export * from './excel-exporter';
export * from './pdf-exporter';
export * from './data-persistence';
