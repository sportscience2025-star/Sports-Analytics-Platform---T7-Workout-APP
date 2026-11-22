/**
 * src/services/storage/indexeddb.ts
 * Driver nativo IndexedDB su Promise del browser con gestione avanzata del ciclo di vita della connessione.
 *
 * Include:
 * - Creazione e migrazione atomica dei 4 Object Store canonici su onupgradeneeded.
 * - Gestione onversionchange, onblocked e onclose per prevenire deadlock tra tab e durante aggiornamenti PWA.
 * - Transazioni atomiche chiuse su oncomplete/onerror/onabort senza await intermedi.
 * - Fallback trasparente a InMemoryStorageEngine in ambienti restrittivi o privi di IndexedDB.
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
import { InMemoryStorageEngine } from './in-memory-storage';

export class IndexedDBService implements IStorageEngine {
  private dbInstance: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private fallbackEngine: InMemoryStorageEngine | null = null;
  private isUsingFallback = false;

  /**
   * Determina se l'ambiente supporta IndexedDB.
   */
  private isIndexedDbAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  }

  /**
   * Commuta il servizio al fallback in memoria trasparente.
   */
  private activateFallback(): IStorageEngine {
    if (!this.fallbackEngine) {
      this.fallbackEngine = new InMemoryStorageEngine();
    }
    this.isUsingFallback = true;
    return this.fallbackEngine;
  }

  /**
   * Ottiene o apre la connessione singleton a IndexedDB.
   */
  public async getDatabase(): Promise<IDBDatabase> {
    if (!this.isIndexedDbAvailable()) {
      throw new Error('IndexedDB non disponibile in questo ambiente');
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
        openRequest = window.indexedDB.open(DB_NAME, DB_VERSION);
      } catch (err) {
        this.dbPromise = null;
        return reject(err);
      }

      openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Store workout_sessions
        if (!db.objectStoreNames.contains(STORE_WORKOUT_SESSIONS)) {
          const sessionStore = db.createObjectStore(STORE_WORKOUT_SESSIONS, { keyPath: 'sessionId' });
          sessionStore.createIndex(INDEX_SESSIONS_ATHLETE_ID, 'athleteId', { unique: false });
          sessionStore.createIndex(INDEX_SESSIONS_STARTED_AT, 'startedAt', { unique: false });
          sessionStore.createIndex(INDEX_SESSIONS_IS_SYNCED, 'isSynced', { unique: false });
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
        reject(target.error ?? new Error('Errore sconosciuto apertura IndexedDB'));
      };

      openRequest.onblocked = () => {
        // Un'altra scheda sta bloccando l'aggiornamento
        this.dbPromise = null;
      };
    });

    return this.dbPromise.catch((err) => {
      this.dbPromise = null;
      this.activateFallback();
      throw err;
    });
  }

  /**
   * Esegue un'operazione generica gestendo in modo trasparente l'eventuale fallback.
   */
  private async executeWithFallback<R>(operation: (db: IDBDatabase) => Promise<R>, fallbackOp: (fb: IStorageEngine) => Promise<R>): Promise<R> {
    if (this.isUsingFallback) {
      return fallbackOp(this.activateFallback());
    }

    try {
      const db = await this.getDatabase();
      return await operation(db);
    } catch {
      return fallbackOp(this.activateFallback());
    }
  }

  public async get<K extends AppStoreName>(storeName: K, key: string): Promise<StoreRecordMap[K] | null> {
    return this.executeWithFallback(
      (db) =>
        new Promise<StoreRecordMap[K] | null>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(key);

          request.onsuccess = () => {
            resolve((request.result as StoreRecordMap[K]) ?? null);
          };

          request.onerror = () => reject(request.error);
          transaction.onerror = () => reject(transaction.error);
        }),
      (fb) => fb.get(storeName, key)
    );
  }

  public async set<K extends AppStoreName>(storeName: K, value: StoreRecordMap[K]): Promise<void> {
    return this.executeWithFallback(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          store.put(value);

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error ?? new Error('Transazione abortita'));
        }),
      (fb) => fb.set(storeName, value)
    );
  }

  public async delete<K extends AppStoreName>(storeName: K, key: string): Promise<void> {
    return this.executeWithFallback(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          store.delete(key);

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error ?? new Error('Transazione abortita'));
        }),
      (fb) => fb.delete(storeName, key)
    );
  }

  public async getAll<K extends AppStoreName>(storeName: K): Promise<StoreRecordMap[K][]> {
    return this.executeWithFallback(
      (db) =>
        new Promise<StoreRecordMap[K][]>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            resolve((request.result as StoreRecordMap[K][]) ?? []);
          };

          request.onerror = () => reject(request.error);
          transaction.onerror = () => reject(transaction.error);
        }),
      (fb) => fb.getAll(storeName)
    );
  }

  public async getByIndex<K extends AppStoreName>(
    storeName: K,
    indexName: string,
    query: string | number | boolean
  ): Promise<StoreRecordMap[K][]> {
    return this.executeWithFallback(
      (db) =>
        new Promise<StoreRecordMap[K][]>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const index = store.index(indexName);
          const request = index.getAll(query as IDBValidKey);

          request.onsuccess = () => {
            resolve((request.result as StoreRecordMap[K][]) ?? []);
          };

          request.onerror = () => reject(request.error);
          transaction.onerror = () => reject(transaction.error);
        }),
      (fb) => fb.getByIndex(storeName, indexName, query)
    );
  }

  public async clear<K extends AppStoreName>(storeName: K): Promise<void> {
    return this.executeWithFallback(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          store.clear();

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error ?? new Error('Transazione abortita'));
        }),
      (fb) => fb.clear(storeName)
    );
  }

  public async count<K extends AppStoreName>(storeName: K): Promise<number> {
    return this.executeWithFallback(
      (db) =>
        new Promise<number>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.count();

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => reject(request.error);
          transaction.onerror = () => reject(transaction.error);
        }),
      (fb) => fb.count(storeName)
    );
  }
}

/** Istanza singleton esportata per l'intera applicazione */
export const indexedDBService = new IndexedDBService();
