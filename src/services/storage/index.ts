/**
 * src/services/storage/index.ts
 * Barrel file centralizzato per il motore di storage offline e la coda di sincronizzazione.
 * Conforme a Regola 02 (un file = una responsabilita, barrel file per cartella).
 */

export * from './constants';
export * from './types';
export * from './in-memory-storage';
export * from './indexeddb';
export * from './sync-queue';
