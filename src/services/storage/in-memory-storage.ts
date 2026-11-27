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
  INDEX_SESSIONS_SYNC_STATE,
  INDEX_NOTES_SOURCE_ID,
  INDEX_NOTES_UPDATED_AT,
  INDEX_FAVORITES_USER_ID,
  INDEX_FAVORITES_ITEM_TYPE,
  INDEX_FAVORITES_FOLDER_ID,
  INDEX_QUEUE_STATUS,
  INDEX_QUEUE_CREATED_AT,
  INDEX_QUEUE_NEXT_RETRY_AT,
} from './constants';

const TYPEOF_OBJECT = 'object';
const TYPEOF_FUNCTION = 'function';

/**
 * Estrae la chiave primaria di un record in base allo store di destinazione.
 *
 * @param storeName Nome dello store canonico
 * @param record Oggetto record da ispezionare
 * @returns Chiave primaria serializzata come stringa
 */
function getPrimaryKeyForRecord(storeName: AppStoreName, record: unknown): string {
  if (!record || typeof record !== TYPEOF_OBJECT) {
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
 *
 * @param indexName Nome dell'indice secondario interrogato
 * @param record Record sorgente da cui estrarre il valore indicizzato
 * @returns Valore del campo associato all'indice oppure undefined
 */
function getIndexedFieldValue(indexName: string, record: unknown): unknown {
  if (!record || typeof record !== TYPEOF_OBJECT) return undefined;
  const obj = record as Record<string, unknown>;

  switch (indexName) {
    case INDEX_SESSIONS_ATHLETE_ID:
      return obj.athleteId;
    case INDEX_SESSIONS_STARTED_AT:
      return obj.startedAt;
    case INDEX_SESSIONS_SYNC_STATE:
      return obj.syncState;

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
 *
 * @param val Valore tipizzato da clonare
 * @returns Copia profonda indipendente del valore
 */
function safeClone<T>(val: T): T {
  if (typeof structuredClone === TYPEOF_FUNCTION) {
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

  /**
   * Recupera la mappa interna isolata corrispondente allo store richiesto.
   *
   * @param storeName Nome dello store canonico
   * @returns Mappa chiave-valore associata allo store
   */
  private getStoreMap(storeName: AppStoreName): Map<string, unknown> {
    const map = this.stores.get(storeName);
    if (!map) {
      throw new Error(`Store in-memory ${storeName} non inizializzato`);
    }
    return map;
  }

  /**
   * Recupera un singolo record per chiave primaria dallo store in-memory.
   *
   * @param storeName Nome dello store canonico
   * @param key Chiave primaria del record
   * @returns Record clonato se presente, altrimenti null
   */
  public async get<K extends AppStoreName>(storeName: K, key: string): Promise<StoreRecordMap[K] | null> {
    const map = this.getStoreMap(storeName);
    const item = map.get(key);
    if (item === undefined) {
      return null;
    }
    return safeClone(item) as StoreRecordMap[K];
  }

  /**
   * Inserisce o aggiorna un record nello store in-memory preservando l'isolamento tramite clone.
   *
   * @param storeName Nome dello store canonico
   * @param value Record tipizzato da salvare
   * @returns Promise risolta al termine della scrittura
   */
  public async set<K extends AppStoreName>(storeName: K, value: StoreRecordMap[K]): Promise<void> {
    const map = this.getStoreMap(storeName);
    const key = getPrimaryKeyForRecord(storeName, value);
    if (!key) {
      throw new Error(`Chiave primaria assente per il record nello store ${storeName}`);
    }
    map.set(key, safeClone(value));
  }

  /**
   * Elimina un record per chiave primaria dallo store in-memory.
   *
   * @param storeName Nome dello store canonico
   * @param key Chiave primaria del record da rimuovere
   * @returns Promise risolta al termine della cancellazione
   */
  public async delete<K extends AppStoreName>(storeName: K, key: string): Promise<void> {
    const map = this.getStoreMap(storeName);
    map.delete(key);
  }

  /**
   * Restituisce tutti i record presenti nello store in-memory come copie isolate.
   *
   * @param storeName Nome dello store canonico
   * @returns Array di tutti i record presenti nello store
   */
  public async getAll<K extends AppStoreName>(storeName: K): Promise<StoreRecordMap[K][]> {
    const map = this.getStoreMap(storeName);
    const list: StoreRecordMap[K][] = [];
    for (const val of map.values()) {
      list.push(safeClone(val) as StoreRecordMap[K]);
    }
    return list;
  }

  /**
   * Filtra e restituisce i record dello store in-memory che corrispondono al valore indicizzato.
   *
   * @param storeName Nome dello store canonico
   * @param indexName Nome dell'indice secondario su cui filtrare
   * @param query Valore scalare valido come IDBValidKey (stringa o numero)
   * @returns Array dei record corrispondenti alla query
   */
  public async getByIndex<K extends AppStoreName>(
    storeName: K,
    indexName: string,
    query: string | number
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

  /**
   * Svuota completamente tutti i record dello store in-memory specificato.
   *
   * @param storeName Nome dello store canonico
   * @returns Promise risolta al termine dello svuotamento
   */
  public async clear<K extends AppStoreName>(storeName: K): Promise<void> {
    const map = this.getStoreMap(storeName);
    map.clear();
  }

  /**
   * Conta il numero totale di record presenti nello store in-memory.
   *
   * @param storeName Nome dello store canonico
   * @returns Numero intero dei record presenti nello store
   */
  public async count<K extends AppStoreName>(storeName: K): Promise<number> {
    const map = this.getStoreMap(storeName);
    return map.size;
  }
}
