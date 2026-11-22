/**
 * src/services/storage/in-memory-storage.ts
 * Motore di storage in-memory puro con isolamento a mappe per ciascuno store.
 * Utilizzato come fallback trasparente quando IndexedDB e indisponibile o bloccato (SSR, Incognito restrittivo).
 *
 * Conforme ad ADR-01 (Thin Client), Regola 01 (zero any) e Regola 02 (un file = una responsabilita).
 */

import {
  AppStoreName,
  StoreRecordMap,
  IStorageEngine,
} from './types';
import {
  STORE_WORKOUT_SESSIONS,
  STORE_STUDY_NOTES,
  STORE_FAVORITES_CACHE,
  STORE_OFFLINE_QUEUE,
  INDEX_SESSIONS_ATHLETE_ID,
  INDEX_SESSIONS_STARTED_AT,
  INDEX_SESSIONS_IS_SYNCED,
  INDEX_NOTES_SOURCE_ID,
  INDEX_NOTES_UPDATED_AT,
  INDEX_FAVORITES_USER_ID,
  INDEX_FAVORITES_ITEM_TYPE,
  INDEX_FAVORITES_FOLDER_ID,
  INDEX_QUEUE_STATUS,
  INDEX_QUEUE_CREATED_AT,
  INDEX_QUEUE_NEXT_RETRY_AT,
} from './constants';

/**
 * Funzione helper per ottenere la chiave primaria di un record in base allo store.
 */
function getPrimaryKeyForRecord(storeName: AppStoreName, record: unknown): string {
  if (!record || typeof record !== 'object') {
    throw new Error(`Record non valido per lo store ${storeName}`);
  }
  const obj = record as Record<string, unknown>;
  switch (storeName) {
    case STORE_WORKOUT_SESSIONS:
      return String(obj.sessionId ?? '');
    case STORE_STUDY_NOTES:
      return String(obj.noteId ?? '');
    case STORE_FAVORITES_CACHE:
      return String(obj.bookmarkId ?? '');
    case STORE_OFFLINE_QUEUE:
      return String(obj.transactionId ?? '');
    default:
      throw new Error(`Store non riconosciuto: ${String(storeName)}`);
  }
}

/**
 * Risolve il valore del campo associato ad un nome di indice.
 */
function getIndexedFieldValue(indexName: string, record: unknown): unknown {
  if (!record || typeof record !== 'object') return undefined;
  const obj = record as Record<string, unknown>;

  switch (indexName) {
    case INDEX_SESSIONS_ATHLETE_ID:
      return obj.athleteId;
    case INDEX_SESSIONS_STARTED_AT:
      return obj.startedAt;
    case INDEX_SESSIONS_IS_SYNCED:
      return obj.isSynced;

    case INDEX_NOTES_SOURCE_ID:
      return obj.sourceId;
    case INDEX_NOTES_UPDATED_AT:
      return obj.updatedAt;

    case INDEX_FAVORITES_USER_ID:
      return obj.userId;
    case INDEX_FAVORITES_ITEM_TYPE:
      return obj.itemType;
    case INDEX_FAVORITES_FOLDER_ID:
      return obj.folderId;

    case INDEX_QUEUE_STATUS:
      return obj.status;
    case INDEX_QUEUE_CREATED_AT:
      return obj.createdAt;
    case INDEX_QUEUE_NEXT_RETRY_AT:
      return obj.nextRetryAt;

    default:
      return obj[indexName];
  }
}

/**
 * Esegue una clonazione profonda sicura per replicare lo Structured Clone Algorithm di IndexedDB.
 */
function safeClone<T>(val: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(val);
  }
  return JSON.parse(JSON.stringify(val)) as T;
}

/**
 * Motore di persistenza volatile in-memory con parita funzionale su chiavi ed indici.
 */
export class InMemoryStorageEngine implements IStorageEngine {
  private readonly stores = new Map<AppStoreName, Map<string, unknown>>([
    [STORE_WORKOUT_SESSIONS, new Map<string, unknown>()],
    [STORE_STUDY_NOTES, new Map<string, unknown>()],
    [STORE_FAVORITES_CACHE, new Map<string, unknown>()],
    [STORE_OFFLINE_QUEUE, new Map<string, unknown>()],
  ]);

  private getStoreMap(storeName: AppStoreName): Map<string, unknown> {
    const map = this.stores.get(storeName);
    if (!map) {
      throw new Error(`Store in-memory ${storeName} non inizializzato`);
    }
    return map;
  }

  public async get<K extends AppStoreName>(storeName: K, key: string): Promise<StoreRecordMap[K] | null> {
    const map = this.getStoreMap(storeName);
    const item = map.get(key);
    if (item === undefined) {
      return null;
    }
    return safeClone(item) as StoreRecordMap[K];
  }

  public async set<K extends AppStoreName>(storeName: K, value: StoreRecordMap[K]): Promise<void> {
    const map = this.getStoreMap(storeName);
    const key = getPrimaryKeyForRecord(storeName, value);
    if (!key) {
      throw new Error(`Chiave primaria assente per il record nello store ${storeName}`);
    }
    map.set(key, safeClone(value));
  }

  public async delete<K extends AppStoreName>(storeName: K, key: string): Promise<void> {
    const map = this.getStoreMap(storeName);
    map.delete(key);
  }

  public async getAll<K extends AppStoreName>(storeName: K): Promise<StoreRecordMap[K][]> {
    const map = this.getStoreMap(storeName);
    const list: StoreRecordMap[K][] = [];
    for (const val of map.values()) {
      list.push(safeClone(val) as StoreRecordMap[K]);
    }
    return list;
  }

  public async getByIndex<K extends AppStoreName>(
    storeName: K,
    indexName: string,
    query: string | number | boolean
  ): Promise<StoreRecordMap[K][]> {
    const map = this.getStoreMap(storeName);
    const results: StoreRecordMap[K][] = [];

    for (const val of map.values()) {
      const indexedVal = getIndexedFieldValue(indexName, val);
      if (indexedVal === query) {
        results.push(safeClone(val) as StoreRecordMap[K]);
      }
    }

    return results;
  }

  public async clear<K extends AppStoreName>(storeName: K): Promise<void> {
    const map = this.getStoreMap(storeName);
    map.clear();
  }

  public async count<K extends AppStoreName>(storeName: K): Promise<number> {
    const map = this.getStoreMap(storeName);
    return map.size;
  }
}
