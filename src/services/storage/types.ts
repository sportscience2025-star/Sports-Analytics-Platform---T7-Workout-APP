/**
 * src/services/storage/types.ts
 * Contratti di tipo TypeScript strict per gli Object Store e il motore di persistenza.
 * Conforme a Regola 01 (zero any) e Regola 02 (un file = una responsabilita).
 */

import {
  STORE_WORKOUT_SESSIONS,
  STORE_STUDY_NOTES,
  STORE_FAVORITES_CACHE,
  STORE_OFFLINE_QUEUE,
  SYNC_STATE_PENDING,
  SYNC_STATE_SYNCED,
} from './constants';
import { DataSiloPartition } from '../../types/tier';

/** Unione discriminata dei 4 store ufficiali */
export type AppStoreName =
  | typeof STORE_WORKOUT_SESSIONS
  | typeof STORE_STUDY_NOTES
  | typeof STORE_FAVORITES_CACHE
  | typeof STORE_OFFLINE_QUEUE;

/** Flag numerico di stato sincronizzazione compatibile con IDBValidKey */
export type SyncStateFlag = typeof SYNC_STATE_PENDING | typeof SYNC_STATE_SYNCED;

// ============================================================================
// STORE 1: WORKOUT SESSIONS (WORKOUT PLAYER PWA)
// ============================================================================

export type WorkoutSessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export interface WorkoutSetRecord {
  readonly setNumber: number;
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly targetReps: number;
  readonly actualReps: number;
  readonly loadKg: number;
  readonly rpe?: number;
  readonly velocityMps?: number;
  readonly restDurationSec?: number;
  readonly completedAt: string;
}

export interface WorkoutSessionRecord {
  readonly sessionId: string; // Primary key
  readonly athleteId: string; // Indexed: by_athleteId
  readonly programId?: string;
  readonly microcycleDay?: string; // es. "MD-3" o "Week 2 - Day 1"
  readonly startedAt: string; // Indexed: by_startedAt
  readonly completedAt?: string;
  readonly status: WorkoutSessionStatus;
  readonly sets: readonly WorkoutSetRecord[];
  readonly totalVolumeKg: number;
  readonly notes?: string;
  readonly syncState: SyncStateFlag; // Indexed: by_syncState (0 = pending, 1 = synced)
  readonly siloPartition: DataSiloPartition; // Isolamento multi-tenant ADR-02
  readonly clubId?: string; // Obbligatorio per silo2_club_bunker
  readonly updatedAt: string;
}

// ============================================================================
// STORE 2: STUDY NOTES (AREA STUDIO SCIENTIFICA)
// ============================================================================

export interface StudyNoteRecord {
  readonly noteId: string; // Primary key
  readonly userId: string; // Proprietario dell'appunto per isolamento tenant
  readonly sourceId: string; // Indexed: by_sourceId (PMID o DOI studio)
  readonly sourceTitle?: string;
  readonly athleteId?: string; // Opzionale se collegato a caso studio atleta
  readonly title: string;
  readonly content: string;
  readonly tags: readonly string[];
  readonly canvasData?: string; // Vettori SVG o serialized state per mappe concettuali
  readonly siloPartition: DataSiloPartition; // Isolamento multi-tenant ADR-02
  readonly clubId?: string; // Obbligatorio per silo2_club_bunker
  readonly createdAt: string;
  readonly updatedAt: string; // Indexed: by_updatedAt
}

// ============================================================================
// STORE 3: FAVORITES CACHE (SEGNALIBRI & PREFERITI)
// ============================================================================

export type FavoriteItemType = 'exercise' | 'program' | 'source' | 'custom_video';

export interface FavoritesCacheRecord {
  readonly bookmarkId: string; // Primary key
  readonly userId: string; // Indexed: by_userId
  readonly itemType: FavoriteItemType; // Indexed: by_itemType
  readonly itemId: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly folderId?: string; // Indexed: by_folderId (per cartelle tematiche Tier 2)
  readonly tags: readonly string[];
  readonly orderIndex: number;
  readonly siloPartition: DataSiloPartition; // Isolamento multi-tenant ADR-02
  readonly clubId?: string; // Obbligatorio per silo2_club_bunker
  readonly cachedAt: string;
}

// ============================================================================
// STORE 4: OFFLINE QUEUE (TRANSAZIONI IN ATTESA DI RETE)
// ============================================================================

export type QueueTransactionStatus = 'pending' | 'syncing' | 'failed';
export type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface QueuedTransaction {
  readonly transactionId: string; // Primary key (UUID v4)
  readonly idempotencyKey: string; // Inviato come header Idempotency-Key
  readonly endpoint: string;
  readonly method: HttpMethod;
  readonly payload: unknown;
  readonly headers?: Readonly<Record<string, string>>;
  readonly status: QueueTransactionStatus; // Indexed: by_status
  readonly createdAt: string; // Indexed: by_createdAt (ordinamento FIFO)
  readonly syncStartedAt?: string; // Timestamp ingresso in stato 'syncing' per recovery zombie
  readonly updatedAt?: string; // Timestamp ultimo aggiornamento di stato
  readonly retryCount: number;
  readonly maxRetries: number;
  readonly nextRetryAt?: string; // Indexed: by_nextRetryAt (prevenzione starvation)
  readonly lastError?: string;
  readonly siloPartition: DataSiloPartition; // Isolamento multi-tenant ADR-02
  readonly clubId?: string;
  readonly userId: string;
}

/** Filtro opzionale di scoping multi-tenant per il prelievo delle transazioni pendenti */
export interface SyncQueueScopeFilter {
  readonly userId?: string;
  readonly siloPartition?: DataSiloPartition;
  readonly clubId?: string;
}

// ============================================================================
// MAPPATURA TIPIZZATA DEGLI STORE
// ============================================================================

export interface StoreRecordMap {
  [STORE_WORKOUT_SESSIONS]: WorkoutSessionRecord;
  [STORE_STUDY_NOTES]: StudyNoteRecord;
  [STORE_FAVORITES_CACHE]: FavoritesCacheRecord;
  [STORE_OFFLINE_QUEUE]: QueuedTransaction;
}

// ============================================================================
// INTERFACCIA ASTRATTA DEL MOTORE DI PERSISTENZA
// ============================================================================

export interface IStorageEngine {
  get<K extends AppStoreName>(storeName: K, key: string): Promise<StoreRecordMap[K] | null>;
  set<K extends AppStoreName>(storeName: K, value: StoreRecordMap[K]): Promise<void>;
  delete<K extends AppStoreName>(storeName: K, key: string): Promise<void>;
  getAll<K extends AppStoreName>(storeName: K): Promise<StoreRecordMap[K][]>;
  getByIndex<K extends AppStoreName>(
    storeName: K,
    indexName: string,
    query: string | number
  ): Promise<StoreRecordMap[K][]>;
  clear<K extends AppStoreName>(storeName: K): Promise<void>;
  count<K extends AppStoreName>(storeName: K): Promise<number>;
}

export interface QueueStatusSummary {
  readonly pendingCount: number;
  readonly syncingCount: number;
  readonly failedCount: number;
  readonly totalCount: number;
}
