/**
 * src/services/storage/constants.ts
 * Costanti operative, nomi database, store, indici e parametri di sincronizzazione.
 * Conforme ad ADR-01 (Thin Client), ADR-02 (3 Silos Stagni) e Regola 02 (un file = una responsabilita).
 */

/** Nome del database IndexedDB locale per il Thin Client PWA */
export const DB_NAME = 't7_workout_offline_db';

/** Versione corrente dello schema del database */
export const DB_VERSION = 1;

// ============================================================================
// NOMI DEGLI OBJECT STORE (4 STORE CANONICI)
// ============================================================================

/** Store per le sessioni di allenamento attive e storiche del Workout Player */
export const STORE_WORKOUT_SESSIONS = 'workout_sessions' as const;

/** Store per gli appunti scientifici e mappe concettuali dell'Area Studio */
export const STORE_STUDY_NOTES = 'study_notes' as const;

/** Store per la cache locale dei preferiti e segnalibri */
export const STORE_FAVORITES_CACHE = 'favorites_cache' as const;

/** Store per la coda delle transazioni offline in attesa di sincronizzazione */
export const STORE_OFFLINE_QUEUE = 'offline_queue' as const;

// ============================================================================
// NOMI DEGLI INDICI PER I 4 STORE
// ============================================================================

// Indici per workout_sessions
export const INDEX_SESSIONS_ATHLETE_ID = 'by_athleteId' as const;
export const INDEX_SESSIONS_STARTED_AT = 'by_startedAt' as const;
export const INDEX_SESSIONS_IS_SYNCED = 'by_isSynced' as const;

// Indici per study_notes
export const INDEX_NOTES_SOURCE_ID = 'by_sourceId' as const;
export const INDEX_NOTES_UPDATED_AT = 'by_updatedAt' as const;

// Indici per favorites_cache
export const INDEX_FAVORITES_USER_ID = 'by_userId' as const;
export const INDEX_FAVORITES_ITEM_TYPE = 'by_itemType' as const;
export const INDEX_FAVORITES_FOLDER_ID = 'by_folderId' as const;

// Indici per offline_queue
export const INDEX_QUEUE_STATUS = 'by_status' as const;
export const INDEX_QUEUE_CREATED_AT = 'by_createdAt' as const;
export const INDEX_QUEUE_NEXT_RETRY_AT = 'by_nextRetryAt' as const;

// ============================================================================
// PARAMETRI DI RETRY, TIMEOUT E RESILIENZA SYNC QUEUE
// ============================================================================

/** Numero massimo predefinito di tentativi di sincronizzazione prima del fallimento permanente */
export const DEFAULT_MAX_RETRIES = 5;

/** Ritardo base per il calcolo del backoff esponenziale in millisecondi */
export const BASE_RETRY_DELAY_MS = 1000;

/** Ritardo massimo consentito per un tentativo di retry in millisecondi (60 secondi) */
export const MAX_RETRY_DELAY_MS = 60000;

/** Soglia per identificare una transazione 'syncing' rimasta bloccata come zombie (60 secondi) */
export const STALE_SYNCING_THRESHOLD_MS = 60000;

/** Fattore di jitter casuale per prevenire picchi simultanei di riconnessione (thundering herd) */
export const JITTER_FACTOR = 0.25;
