/**
 * src/services/storage/indexeddb.ts
 * Driver nativo IndexedDB su Promise del browser/Web Worker con gestione avanzata del ciclo di vita della connessione.
 *
 * Include:
 * - Creazione e migrazione atomica dei 4 Object Store canonici su onupgradeneeded.
 * - Gestione onversionchange, onblocked e onclose per prevenire deadlock tra tab e durante aggiornamenti PWA.
 * - Transazioni atomiche chiuse su oncomplete/onerror/onabort senza await intermedi.
 * - Fallback trasparente a InMemoryStorageEngine solo quando IndexedDB e indisponibile o non apribile.
 *
 * Conforme ad ADR-01 (Thin Client), Regola 01 (zero any) e Regola 02 (un file = una responsabilita).
 */

import {
  AppStoreName,
  StoreRecordMap,
  IStorageEngine,
} from './types';
import {
  DB_NAME,
  DB_VERSION,
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
import { InMemoryStorageEngine } from './in-memory-storage';

const TYPEOF_UNDEFINED = 'undefined';
const TYPEOF_FUNCTION = 'function';
const INDEXEDDB_MODE_READONLY = 'readonly' as const;
const INDEXEDDB_MODE_READWRITE = 'readwrite' as const;

const ERROR_INDEXEDDB_UNAVAILABLE = 'IndexedDB non disponibile in questo ambiente';
const ERROR_OPEN_UNKNOWN = 'Errore sconosciuto apertura IndexedDB';
const ERROR_OPEN_BLOCKED = 'Apertura IndexedDB bloccata da un altra connessione attiva';
const ERROR_TRANSACTION_FAILED = 'Errore transazione IndexedDB';
const ERROR_TRANSACTION_ABORTED = 'Transazione IndexedDB abortita';
const ERROR_REQUEST_FAILED = 'Errore richiesta IndexedDB';

/**
 * Driver IndexedDB nativo compatibile con Main Thread e Web Worker tramite globalThis.indexedDB.
 */
export class IndexedDBService implements IStorageEngine {
  private dbInstance: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private fallbackEngine: InMemoryStorageEngine | null = null;
  private isUsingFallback = false;

  /**
   * Risolve l'istanza IDBFactory globale compatibile con browser e Web Worker.
   *
   * @returns Oggetto IDBFactory se presente su globalThis, altrimenti undefined
   */
  private getIndexedDbFactory(): IDBFactory | undefined {
    if (typeof globalThis === TYPEOF_UNDEFINED) {
      return undefined;
    }
    const factory = (globalThis as { indexedDB?: IDBFactory | null }).indexedDB;
    if (!factory || typeof factory.open !== TYPEOF_FUNCTION) {
      return undefined;
    }
    return factory;
  }

  /**
   * Determina se l'ambiente corrente supporta IndexedDB.
   *
   * @returns true se globalThis.indexedDB espone il metodo open, altrimenti false
   */
  private isIndexedDbAvailable(): boolean {
    return this.getIndexedDbFactory() !== undefined;
  }

  /**
   * Attiva e restituisce il motore fallback volatile in memoria.
   *
   * @returns Istanza InMemoryStorageEngine condivisa dal servizio
   */
  private activateFallback(): IStorageEngine {
    if (!this.fallbackEngine) {
      this.fallbackEngine = new InMemoryStorageEngine();
    }
    this.isUsingFallback = true;
    return this.fallbackEngine;
  }

  /**
   * Ottiene o apre la connessione singleton a IndexedDB, gestendo upgrade e blocchi.
   *
   * @returns Promise risolta con la connessione attiva IDBDatabase
   */
  public async getDatabase(): Promise<IDBDatabase> {
    const factory = this.getIndexedDbFactory();
    if (!factory) {
      throw new Error(ERROR_INDEXEDDB_UNAVAILABLE);
    }

    if (this.dbInstance) {
      return this.dbInstance;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      let openRequest: IDBOpenDBRequest;
      try {
        openRequest = factory.open(DB_NAME, DB_VERSION);
      } catch (err) {
        this.dbPromise = null;
        return reject(err);
      }

      openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Store workout_sessions (syncState numerico 0/1 come IDBValidKey)
        if (!db.objectStoreNames.contains(STORE_WORKOUT_SESSIONS)) {
          const sessionStore = db.createObjectStore(STORE_WORKOUT_SESSIONS, { keyPath: 'sessionId' });
          sessionStore.createIndex(INDEX_SESSIONS_ATHLETE_ID, 'athleteId', { unique: false });
          sessionStore.createIndex(INDEX_SESSIONS_STARTED_AT, 'startedAt', { unique: false });
          sessionStore.createIndex(INDEX_SESSIONS_SYNC_STATE, 'syncState', { unique: false });
        }

        // 2. Store study_notes
        if (!db.objectStoreNames.contains(STORE_STUDY_NOTES)) {
          const notesStore = db.createObjectStore(STORE_STUDY_NOTES, { keyPath: 'noteId' });
          notesStore.createIndex(INDEX_NOTES_SOURCE_ID, 'sourceId', { unique: false });
          notesStore.createIndex(INDEX_NOTES_UPDATED_AT, 'updatedAt', { unique: false });
        }

        // 3. Store favorites_cache
        if (!db.objectStoreNames.contains(STORE_FAVORITES_CACHE)) {
          const favStore = db.createObjectStore(STORE_FAVORITES_CACHE, { keyPath: 'bookmarkId' });
          favStore.createIndex(INDEX_FAVORITES_USER_ID, 'userId', { unique: false });
          favStore.createIndex(INDEX_FAVORITES_ITEM_TYPE, 'itemType', { unique: false });
          favStore.createIndex(INDEX_FAVORITES_FOLDER_ID, 'folderId', { unique: false });
        }

        // 4. Store offline_queue
        if (!db.objectStoreNames.contains(STORE_OFFLINE_QUEUE)) {
          const queueStore = db.createObjectStore(STORE_OFFLINE_QUEUE, { keyPath: 'transactionId' });
          queueStore.createIndex(INDEX_QUEUE_STATUS, 'status', { unique: false });
          queueStore.createIndex(INDEX_QUEUE_CREATED_AT, 'createdAt', { unique: false });
          queueStore.createIndex(INDEX_QUEUE_NEXT_RETRY_AT, 'nextRetryAt', { unique: false });
        }
      };

      openRequest.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.dbInstance = db;

        // Gestione aggiornamenti PWA su altra scheda per prevenire deadlock
        db.onversionchange = () => {
          db.close();
          this.dbInstance = null;
          this.dbPromise = null;
        };

        // Gestione chiusura anomala da parte del browser
        db.onclose = () => {
          this.dbInstance = null;
          this.dbPromise = null;
        };

        resolve(db);
      };

      openRequest.onerror = (event: Event) => {
        const target = event.target as IDBOpenDBRequest;
        this.dbPromise = null;
        reject(target.error ?? new Error(ERROR_OPEN_UNKNOWN));
      };

      openRequest.onblocked = () => {
        // Rifiuta esplicitamente per evitare attese infinite se un'altra scheda blocca l'upgrade
        this.dbPromise = null;
        reject(new Error(ERROR_OPEN_BLOCKED));
      };
    });

    return this.dbPromise.catch((err) => {
      this.dbPromise = null;
      this.activateFallback();
      throw err;
    });
  }

  /**
   * Esegue un'operazione sullo store usando il fallback in-memory solo se IndexedDB e assente o non apribile.
   * Gli errori operativi delle transazioni (es. QuotaExceededError, DataError, ConstraintError) vengono propagati.
   *
   * @param operation Funzione operativa su IDBDatabase
   * @param fallbackOp Funzione equivalente sul motore in-memory
   * @returns Promise risolta con il risultato dell'operazione
   */
  private async executeWithFallback<R>(
    operation: (db: IDBDatabase) => Promise<R>,
    fallbackOp: (fb: IStorageEngine) => Promise<R>
  ): Promise<R> {
    if (this.isUsingFallback || !this.isIndexedDbAvailable()) {
      return fallbackOp(this.activateFallback());
    }

    let db: IDBDatabase;
    try {
      db = await this.getDatabase();
    } catch {
      return fallbackOp(this.activateFallback());
    }

    // Errori operativi di transazione/richiesta non devono silenziarsi nel fallback volatile
    return operation(db);
  }

  /**
   * Recupera un singolo record per chiave primaria dallo store indicato.
   *
   * @param storeName Nome dello store canonico
   * @param key Chiave primaria del record
   * @returns Record trovato oppure null se assente
   */
  public async get<K extends AppStoreName>(storeName: K, key: string): Promise<StoreRecordMap[K] | null> {
    return this.executeWithFallback(
      (db) =>
        new Promise<StoreRecordMap[K] | null>((resolve, reject) => {
          const transaction = db.transaction(storeName, INDEXEDDB_MODE_READONLY);
          const store = transaction.objectStore(storeName);
          const request = store.get(key);

          request.onsuccess = () => {
            resolve((request.result as StoreRecordMap[K]) ?? null);
          };

          request.onerror = () => reject(request.error ?? new Error(ERROR_REQUEST_FAILED));
          transaction.onerror = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_FAILED));
          transaction.onabort = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_ABORTED));
        }),
      (fb) => fb.get(storeName, key)
    );
  }

  /**
   * Inserisce o aggiorna in modo atomico un record nello store indicato.
   *
   * @param storeName Nome dello store canonico
   * @param value Record tipizzato da persistere
   * @returns Promise risolta al completamento della transazione
   */
  public async set<K extends AppStoreName>(storeName: K, value: StoreRecordMap[K]): Promise<void> {
    return this.executeWithFallback(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(storeName, INDEXEDDB_MODE_READWRITE);
          const store = transaction.objectStore(storeName);
          store.put(value);

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_FAILED));
          transaction.onabort = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_ABORTED));
        }),
      (fb) => fb.set(storeName, value)
    );
  }

  /**
   * Elimina in modo atomico un record identificato dalla chiave primaria.
   *
   * @param storeName Nome dello store canonico
   * @param key Chiave primaria del record da eliminare
   * @returns Promise risolta al completamento della transazione
   */
  public async delete<K extends AppStoreName>(storeName: K, key: string): Promise<void> {
    return this.executeWithFallback(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(storeName, INDEXEDDB_MODE_READWRITE);
          const store = transaction.objectStore(storeName);
          store.delete(key);

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_FAILED));
          transaction.onabort = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_ABORTED));
        }),
      (fb) => fb.delete(storeName, key)
    );
  }

  /**
   * Legge tutti i record presenti nello store indicato.
   *
   * @param storeName Nome dello store canonico
   * @returns Array di tutti i record presenti nello store
   */
  public async getAll<K extends AppStoreName>(storeName: K): Promise<StoreRecordMap[K][]> {
    return this.executeWithFallback(
      (db) =>
        new Promise<StoreRecordMap[K][]>((resolve, reject) => {
          const transaction = db.transaction(storeName, INDEXEDDB_MODE_READONLY);
          const store = transaction.objectStore(storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            resolve((request.result as StoreRecordMap[K][]) ?? []);
          };

          request.onerror = () => reject(request.error ?? new Error(ERROR_REQUEST_FAILED));
          transaction.onerror = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_FAILED));
          transaction.onabort = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_ABORTED));
        }),
      (fb) => fb.getAll(storeName)
    );
  }

  /**
   * Interroga un indice secondario dello store utilizzando una chiave valida IndexedDB (stringa o numero).
   *
   * @param storeName Nome dello store canonico
   * @param indexName Nome dell'indice secondario
   * @param query Chiave di ricerca (stringa o numero)
   * @returns Array dei record corrispondenti alla chiave cercata
   */
  public async getByIndex<K extends AppStoreName>(
    storeName: K,
    indexName: string,
    query: string | number
  ): Promise<StoreRecordMap[K][]> {
    return this.executeWithFallback(
      (db) =>
        new Promise<StoreRecordMap[K][]>((resolve, reject) => {
          const transaction = db.transaction(storeName, INDEXEDDB_MODE_READONLY);
          const store = transaction.objectStore(storeName);
          const index = store.index(indexName);
          const request = index.getAll(query);

          request.onsuccess = () => {
            resolve((request.result as StoreRecordMap[K][]) ?? []);
          };

          request.onerror = () => reject(request.error ?? new Error(ERROR_REQUEST_FAILED));
          transaction.onerror = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_FAILED));
          transaction.onabort = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_ABORTED));
        }),
      (fb) => fb.getByIndex(storeName, indexName, query)
    );
  }

  /**
   * Svuota completamente tutti i record dello store indicato in modo atomico.
   *
   * @param storeName Nome dello store canonico
   * @returns Promise risolta al completamento dello svuotamento
   */
  public async clear<K extends AppStoreName>(storeName: K): Promise<void> {
    return this.executeWithFallback(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(storeName, INDEXEDDB_MODE_READWRITE);
          const store = transaction.objectStore(storeName);
          store.clear();

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_FAILED));
          transaction.onabort = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_ABORTED));
        }),
      (fb) => fb.clear(storeName)
    );
  }

  /**
   * Conta il numero totale di record presenti nello store indicato.
   *
   * @param storeName Nome dello store canonico
   * @returns Numero intero dei record nello store
   */
  public async count<K extends AppStoreName>(storeName: K): Promise<number> {
    return this.executeWithFallback(
      (db) =>
        new Promise<number>((resolve, reject) => {
          const transaction = db.transaction(storeName, INDEXEDDB_MODE_READONLY);
          const store = transaction.objectStore(storeName);
          const request = store.count();

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => reject(request.error ?? new Error(ERROR_REQUEST_FAILED));
          transaction.onerror = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_FAILED));
          transaction.onabort = () => reject(transaction.error ?? new Error(ERROR_TRANSACTION_ABORTED));
        }),
      (fb) => fb.count(storeName)
    );
  }
}

/** Istanza singleton esportata per l'intera applicazione */
export const indexedDBService = new IndexedDBService();
