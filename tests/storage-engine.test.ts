/**
 * tests/storage-engine.test.ts
 * Test suite per Offline Storage Engine, In-Memory Fallback, IndexedDBService e SyncQueueService (TASK-003).
 * Eseguibile con: npx tsx tests/storage-engine.test.ts
 */

import assert from 'node:assert';
import {
  InMemoryStorageEngine,
  IndexedDBService,
  SyncQueueService,
  STORE_WORKOUT_SESSIONS,
  STORE_STUDY_NOTES,
  STORE_FAVORITES_CACHE,
  STORE_OFFLINE_QUEUE,
  INDEX_SESSIONS_ATHLETE_ID,
  INDEX_SESSIONS_SYNC_STATE,
  INDEX_NOTES_SOURCE_ID,
  INDEX_FAVORITES_ITEM_TYPE,
  SYNC_STATE_PENDING,
  SYNC_STATE_SYNCED,
  DEFAULT_PEEK_LIMIT,
  BASE_RETRY_DELAY_MS,
  WorkoutSessionRecord,
  StudyNoteRecord,
  FavoritesCacheRecord,
  calculateNextRetryDelayMs,
} from '../src/services/storage';

const SILO_CONSUMER = 'silo1_consumer' as const;
const SILO_CLUB_BUNKER = 'silo2_club_bunker' as const;
const STALE_OFFSET_MS = 70000;
const STALE_THRESHOLD_MS = 60000;
const LOAD_BENCH_KG = 100;
const MUTATED_LOAD_KG = 999;

interface MockIndexMeta {
  readonly name: string;
  readonly keyPath: string;
  readonly unique: boolean;
}

interface MockStoreMeta {
  readonly name: string;
  readonly keyPath: string;
  readonly records: Map<string, Record<string, unknown>>;
  readonly indexes: Map<string, MockIndexMeta>;
}

/**
 * Crea un DOMStringList simulata per verificare objectStoreNames senza usare cast any.
 *
 * @param getNames Funzione che restituisce i nomi correnti degli store
 * @returns Oggetto compatibile con DOMStringList
 */
function createMockDomStringList(getNames: () => string[]): DOMStringList {
  const list = {
    get length(): number {
      return getNames().length;
    },
    contains(name: string): boolean {
      return getNames().includes(name);
    },
    item(index: number): string | null {
      return getNames()[index] ?? null;
    },
    [Symbol.iterator](): ArrayIterator<string> {
      return getNames()[Symbol.iterator]();
    },
  };
  return list as unknown as DOMStringList;
}

/**
 * Crea una finta factory IDBFactory per testare onupgradeneeded, CRUD, indici numerici, errori operativi e onabort.
 *
 * @param options Configurazione di simulazione per errori operativi o abort su readonly
 * @returns Oggetto con factory IDBFactory e registro ispezionabile degli store creati
 */
function createMockIndexedDbFactory(options?: {
  failSetWithError?: Error;
  abortReadonly?: boolean;
}): {
  factory: IDBFactory;
  stores: Map<string, MockStoreMeta>;
} {
  const stores = new Map<string, MockStoreMeta>();

  const mockDb = {
    get objectStoreNames(): DOMStringList {
      return createMockDomStringList(() => Array.from(stores.keys()));
    },
    createObjectStore(name: string, opts?: IDBObjectStoreParameters): IDBObjectStore {
      const keyPath = typeof opts?.keyPath === 'string' ? opts.keyPath : 'id';
      const storeMeta: MockStoreMeta = {
        name,
        keyPath,
        records: new Map<string, Record<string, unknown>>(),
        indexes: new Map<string, MockIndexMeta>(),
      };
      stores.set(name, storeMeta);

      const mockStore = {
        createIndex(indexName: string, indexKeyPath: string, indexOpts?: IDBIndexParameters): IDBIndex {
          storeMeta.indexes.set(indexName, {
            name: indexName,
            keyPath: indexKeyPath,
            unique: Boolean(indexOpts?.unique),
          });
          return {} as IDBIndex;
        },
      };
      return mockStore as unknown as IDBObjectStore;
    },
    transaction(storeName: string, mode: IDBTransactionMode): IDBTransaction {
      const storeMeta = stores.get(storeName);
      if (!storeMeta) {
        throw new Error(`Object store non trovato: ${storeName}`);
      }

      const tx: {
        error: DOMException | null;
        oncomplete: ((ev: Event) => void) | null;
        onerror: ((ev: Event) => void) | null;
        onabort: ((ev: Event) => void) | null;
        objectStore: (name: string) => IDBObjectStore;
      } = {
        error: null,
        oncomplete: null,
        onerror: null,
        onabort: null,
        objectStore(): IDBObjectStore {
          const objectStoreMock = {
            get(key: IDBValidKey): IDBRequest {
              const req = createMockRequest<unknown>();
              queueMicrotask(() => {
                if (mode === 'readonly' && options?.abortReadonly) {
                  tx.error = new Error('Readonly transaction aborted') as unknown as DOMException;
                  tx.onabort?.(new Event('abort'));
                  return;
                }
                req.result = storeMeta.records.get(String(key)) ?? undefined;
                req.onsuccess?.(new Event('success'));
              });
              return req as unknown as IDBRequest;
            },
            put(value: Record<string, unknown>): IDBRequest {
              const req = createMockRequest<IDBValidKey>();
              queueMicrotask(() => {
                if (options?.failSetWithError) {
                  tx.error = options.failSetWithError as unknown as DOMException;
                  tx.onerror?.(new Event('error'));
                  return;
                }
                const pk = String(value[storeMeta.keyPath]);
                storeMeta.records.set(pk, structuredClone(value));
                req.result = pk;
                req.onsuccess?.(new Event('success'));
                tx.oncomplete?.(new Event('complete'));
              });
              return req as unknown as IDBRequest;
            },
            delete(key: IDBValidKey): IDBRequest {
              const req = createMockRequest<undefined>();
              queueMicrotask(() => {
                storeMeta.records.delete(String(key));
                req.onsuccess?.(new Event('success'));
                tx.oncomplete?.(new Event('complete'));
              });
              return req as unknown as IDBRequest;
            },
            clear(): IDBRequest {
              const req = createMockRequest<undefined>();
              queueMicrotask(() => {
                storeMeta.records.clear();
                req.onsuccess?.(new Event('success'));
                tx.oncomplete?.(new Event('complete'));
              });
              return req as unknown as IDBRequest;
            },
            getAll(): IDBRequest {
              const req = createMockRequest<Record<string, unknown>[]>();
              queueMicrotask(() => {
                if (mode === 'readonly' && options?.abortReadonly) {
                  tx.error = new Error('Readonly getAll aborted') as unknown as DOMException;
                  tx.onabort?.(new Event('abort'));
                  return;
                }
                req.result = Array.from(storeMeta.records.values()).map((r) => structuredClone(r));
                req.onsuccess?.(new Event('success'));
              });
              return req as unknown as IDBRequest;
            },
            count(): IDBRequest {
              const req = createMockRequest<number>();
              queueMicrotask(() => {
                if (mode === 'readonly' && options?.abortReadonly) {
                  tx.error = new Error('Readonly count aborted') as unknown as DOMException;
                  tx.onabort?.(new Event('abort'));
                  return;
                }
                req.result = storeMeta.records.size;
                req.onsuccess?.(new Event('success'));
              });
              return req as unknown as IDBRequest;
            },
            index(indexName: string): IDBIndex {
              const indexMeta = storeMeta.indexes.get(indexName);
              if (!indexMeta) {
                throw new Error(`Indice non trovato: ${indexName}`);
              }
              return {
                getAll(query?: IDBValidKey): IDBRequest {
                  const req = createMockRequest<Record<string, unknown>[]>();
                  queueMicrotask(() => {
                    if (mode === 'readonly' && options?.abortReadonly) {
                      tx.error = new Error('Readonly index getAll aborted') as unknown as DOMException;
                      tx.onabort?.(new Event('abort'));
                      return;
                    }
                    const matched = Array.from(storeMeta.records.values())
                      .filter((rec) => rec[indexMeta.keyPath] === query)
                      .map((rec) => structuredClone(rec));
                    req.result = matched;
                    req.onsuccess?.(new Event('success'));
                  });
                  return req as unknown as IDBRequest;
                },
              } as unknown as IDBIndex;
            },
          };
          return objectStoreMock as unknown as IDBObjectStore;
        },
      };

      return tx as unknown as IDBTransaction;
    },
    close(): void {
      // No-op per mock
    },
    onversionchange: null as ((ev: IDBVersionChangeEvent) => void) | null,
    onclose: null as ((ev: Event) => void) | null,
  };

  const factory = {
    open(): IDBOpenDBRequest {
      const openReq: {
        result: IDBDatabase;
        error: DOMException | null;
        onupgradeneeded: ((ev: IDBVersionChangeEvent) => void) | null;
        onsuccess: ((ev: Event) => void) | null;
        onerror: ((ev: Event) => void) | null;
        onblocked: ((ev: Event) => void) | null;
      } = {
        result: mockDb as unknown as IDBDatabase,
        error: null,
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        onblocked: null,
      };

      queueMicrotask(() => {
        const upgradeEvent = { target: openReq } as unknown as IDBVersionChangeEvent;
        openReq.onupgradeneeded?.(upgradeEvent);
        const successEvent = { target: openReq } as unknown as Event;
        openReq.onsuccess?.(successEvent);
      });

      return openReq as unknown as IDBOpenDBRequest;
    },
  };

  return {
    factory: factory as unknown as IDBFactory,
    stores,
  };
}

/**
 * Crea un oggetto request simulato compatibile con IDBRequest.
 *
 * @returns Oggetto request con result, error e handler di completamento
 */
function createMockRequest<T>(): {
  result: T | undefined;
  error: DOMException | null;
  onsuccess: ((ev: Event) => void) | null;
  onerror: ((ev: Event) => void) | null;
} {
  return {
    result: undefined,
    error: null,
    onsuccess: null,
    onerror: null,
  };
}

/**
 * Esegue una funzione asincrona sostituendo temporaneamente globalThis.indexedDB e ripristinandolo al termine.
 *
 * @param mockFactory Valore temporaneo da assegnare a globalThis.indexedDB
 * @param fn Funzione di test da eseguire nel contesto temporaneo
 * @returns Promise risolta al termine dell'esecuzione e del ripristino
 */
async function withGlobalIndexedDb(
  mockFactory: IDBFactory | undefined,
  fn: () => Promise<void>
): Promise<void> {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
  Object.defineProperty(globalThis, 'indexedDB', {
    value: mockFactory,
    configurable: true,
    writable: true,
  });

  try {
    await fn();
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, 'indexedDB', originalDescriptor);
    } else {
      delete (globalThis as { indexedDB?: IDBFactory }).indexedDB;
    }
  }
}

console.log('=== RUNNING OFFLINE STORAGE & SYNC QUEUE TEST SUITE ===');

/**
 * Esegue l'intera suite di test unitari per InMemoryStorageEngine, SyncQueueService e IndexedDBService.
 *
 * @returns Promise risolta quando tutte le asserzioni superano i controlli
 */
async function runTests(): Promise<void> {
  const engine = new InMemoryStorageEngine();

  // -------------------------------------------------------------
  // 1. Test In-Memory Storage: workout_sessions & syncState (0 | 1)
  // -------------------------------------------------------------
  console.log('[1/8] Testing workout_sessions CRUD, syncState numeric index & ADR-02 fields...');
  const session1: WorkoutSessionRecord = {
    sessionId: 'sess_001',
    athleteId: 'ath_101',
    programId: 'prog_alpha',
    microcycleDay: 'MD-3',
    startedAt: '2026-11-22T10:00:00.000Z',
    status: 'active',
    sets: [
      {
        setNumber: 1,
        exerciseId: 'chest_01',
        exerciseName: 'Bench Press',
        targetReps: 5,
        actualReps: 5,
        loadKg: LOAD_BENCH_KG,
        completedAt: '2026-11-22T10:05:00.000Z',
      },
    ],
    totalVolumeKg: 500,
    syncState: SYNC_STATE_PENDING,
    siloPartition: SILO_CLUB_BUNKER,
    clubId: 'club_juventus',
    updatedAt: '2026-11-22T10:05:00.000Z',
  };

  await engine.set(STORE_WORKOUT_SESSIONS, session1);
  assert.strictEqual(await engine.count(STORE_WORKOUT_SESSIONS), 1);

  const retrieved = await engine.get(STORE_WORKOUT_SESSIONS, 'sess_001');
  assert.notStrictEqual(retrieved, null);
  assert.strictEqual(retrieved?.athleteId, 'ath_101');
  assert.strictEqual(retrieved?.syncState, SYNC_STATE_PENDING);
  assert.strictEqual(retrieved?.siloPartition, SILO_CLUB_BUNKER);
  assert.strictEqual(retrieved?.clubId, 'club_juventus');

  // Test Index by_athleteId e by_syncState numerico (0 / 1)
  const byAthlete = await engine.getByIndex(STORE_WORKOUT_SESSIONS, INDEX_SESSIONS_ATHLETE_ID, 'ath_101');
  assert.strictEqual(byAthlete.length, 1);
  assert.strictEqual(byAthlete[0].sessionId, 'sess_001');

  const pendingSessions = await engine.getByIndex(
    STORE_WORKOUT_SESSIONS,
    INDEX_SESSIONS_SYNC_STATE,
    SYNC_STATE_PENDING
  );
  assert.strictEqual(pendingSessions.length, 1);
  const syncedSessions = await engine.getByIndex(
    STORE_WORKOUT_SESSIONS,
    INDEX_SESSIONS_SYNC_STATE,
    SYNC_STATE_SYNCED
  );
  assert.strictEqual(syncedSessions.length, 0);

  // Test Deep Clone Isolation
  (session1.sets as unknown as { loadKg: number }[])[0].loadKg = MUTATED_LOAD_KG;
  const retrievedAfterMutation = await engine.get(STORE_WORKOUT_SESSIONS, 'sess_001');
  assert.strictEqual(
    retrievedAfterMutation?.sets[0].loadKg,
    LOAD_BENCH_KG,
    'in-memory storage must preserve clone immutability'
  );

  // -------------------------------------------------------------
  // 2. Test In-Memory Storage: study_notes con userId e siloPartition
  // -------------------------------------------------------------
  console.log('[2/8] Testing study_notes Store...');
  const note1: StudyNoteRecord = {
    noteId: 'note_001',
    userId: 'usr_researcher_1',
    sourceId: 'PMID_34567890',
    title: 'VBT Force-Velocity Profiling Meta-Analysis',
    content: 'Threshold of 0.30 m/s confirmed for 1RM bench press.',
    tags: ['vbt', 'bench_press', 'strength'],
    siloPartition: SILO_CONSUMER,
    createdAt: '2026-11-22T08:00:00.000Z',
    updatedAt: '2026-11-22T08:30:00.000Z',
  };

  await engine.set(STORE_STUDY_NOTES, note1);
  const noteByPmid = await engine.getByIndex(STORE_STUDY_NOTES, INDEX_NOTES_SOURCE_ID, 'PMID_34567890');
  assert.strictEqual(noteByPmid.length, 1);
  assert.strictEqual(noteByPmid[0].userId, 'usr_researcher_1');

  // -------------------------------------------------------------
  // 3. Test In-Memory Storage: favorites_cache con siloPartition
  // -------------------------------------------------------------
  console.log('[3/8] Testing favorites_cache Store...');
  const fav1: FavoritesCacheRecord = {
    bookmarkId: 'fav_001',
    userId: 'usr_coach_1',
    itemType: 'exercise',
    itemId: 'leg_squat_01',
    title: 'Back Squat 3D',
    tags: ['quads', 'compound'],
    orderIndex: 0,
    siloPartition: SILO_CONSUMER,
    cachedAt: '2026-11-22T09:00:00.000Z',
  };

  await engine.set(STORE_FAVORITES_CACHE, fav1);
  const exercisesFav = await engine.getByIndex(STORE_FAVORITES_CACHE, INDEX_FAVORITES_ITEM_TYPE, 'exercise');
  assert.strictEqual(exercisesFav.length, 1);
  assert.strictEqual(exercisesFav[0].bookmarkId, 'fav_001');

  // -------------------------------------------------------------
  // 4. Test SyncQueueService: IStorageEngine injection, idempotency & tenant isolation
  // -------------------------------------------------------------
  console.log('[4/8] Testing SyncQueueService Enqueue, Tenant Validation & Scoping...');
  const syncQueue = new SyncQueueService(engine);

  await assert.rejects(
    () =>
      syncQueue.enqueue({
        endpoint: '/api/v1/club/telemetry',
        method: 'POST',
        payload: { x: 1 },
        siloPartition: SILO_CLUB_BUNKER,
        userId: 'usr_doc_1',
      }),
    /clubId/,
    'enqueue must require clubId for silo2_club_bunker'
  );

  const tx1Id = await syncQueue.enqueue({
    idempotencyKey: 'custom-idemp-key-001',
    endpoint: '/api/v1/sessions',
    method: 'POST',
    payload: { sessionId: 'sess_001' },
    siloPartition: SILO_CLUB_BUNKER,
    clubId: 'club_juventus',
    userId: 'usr_doc_1',
    maxRetries: 3,
  });

  const tx2Id = await syncQueue.enqueue({
    endpoint: '/api/v1/readiness',
    method: 'POST',
    payload: { athleteId: 'ath_101', pvtScore: 88 },
    siloPartition: SILO_CLUB_BUNKER,
    clubId: 'club_milan',
    userId: 'usr_doc_2',
    maxRetries: 3,
  });

  const scopedJuventus = await syncQueue.peekPending(DEFAULT_PEEK_LIMIT, {
    siloPartition: SILO_CLUB_BUNKER,
    clubId: 'club_juventus',
  });
  assert.strictEqual(scopedJuventus.length, 1);
  assert.strictEqual(scopedJuventus[0].transactionId, tx1Id);
  assert.strictEqual(scopedJuventus[0].idempotencyKey, 'custom-idemp-key-001');

  // Clamping limit <= 0 a >= 1
  const clampedLimit = await syncQueue.peekPending(0);
  assert.strictEqual(clampedLimit.length, 1, 'limit <= 0 must clamp to at least 1');

  const pending = await syncQueue.peekPending(DEFAULT_PEEK_LIMIT);
  assert.strictEqual(pending.length, 2);
  assert.strictEqual(pending[0].transactionId, tx1Id, 'FIFO ordering respected');
  assert.notStrictEqual(pending[0].idempotencyKey, pending[1].idempotencyKey, 'Distinct idempotency keys');

  // Mark Syncing (verifica syncStartedAt e updatedAt)
  await syncQueue.markSyncing(tx1Id);
  const syncingRecord = await engine.get(STORE_OFFLINE_QUEUE, tx1Id);
  assert.notStrictEqual(syncingRecord?.syncStartedAt, undefined);
  assert.notStrictEqual(syncingRecord?.updatedAt, undefined);

  const afterSyncing = await syncQueue.peekPending(DEFAULT_PEEK_LIMIT);
  assert.strictEqual(afterSyncing.length, 1, 'Syncing transaction excluded from peekPending');
  assert.strictEqual(afterSyncing[0].transactionId, tx2Id);

  await syncQueue.markCompleted(tx1Id);
  assert.strictEqual(await engine.get(STORE_OFFLINE_QUEUE, tx1Id), null, 'Completed tx deleted');

  // -------------------------------------------------------------
  // 5. Test Retry Backoff Guard, Exhaustion & syncStartedAt Zombie Recovery
  // -------------------------------------------------------------
  console.log('[5/8] Testing Backoff Guard, Exhaustion & syncStartedAt Zombie Recovery...');
  const nanDelay = calculateNextRetryDelayMs(Number.NaN);
  const negativeDelay = calculateNextRetryDelayMs(-5);
  assert.strictEqual(Number.isFinite(nanDelay) && nanDelay >= BASE_RETRY_DELAY_MS, true);
  assert.strictEqual(Number.isFinite(negativeDelay) && negativeDelay >= BASE_RETRY_DELAY_MS, true);

  const delay1 = calculateNextRetryDelayMs(1);
  const delay2 = calculateNextRetryDelayMs(2);
  assert.strictEqual(delay1 >= BASE_RETRY_DELAY_MS, true);
  assert.strictEqual(delay2 >= delay1 * 0.8, true, 'Delay increases with retryCount');

  await syncQueue.markFailed(tx2Id, 'Network error 503');
  const tx2AfterFail = await engine.get(STORE_OFFLINE_QUEUE, tx2Id);
  assert.strictEqual(tx2AfterFail?.retryCount, 1);
  assert.strictEqual(tx2AfterFail?.status, 'pending');
  assert.notStrictEqual(tx2AfterFail?.nextRetryAt, undefined);

  await syncQueue.markFailed(tx2Id, 'Validation error 422', true);
  const tx2PermanentFail = await engine.get(STORE_OFFLINE_QUEUE, tx2Id);
  assert.strictEqual(tx2PermanentFail?.status, 'failed');

  const queueStatus = await syncQueue.getQueueStatus();
  assert.strictEqual(queueStatus.failedCount, 1);
  assert.strictEqual(queueStatus.pendingCount, 0);

  const purged = await syncQueue.purgeExhausted();
  assert.strictEqual(purged, 1);
  assert.strictEqual((await syncQueue.getQueueStatus()).totalCount, 0);

  // Zombie A: createdAt vecchio ma syncStartedAt recente -> NON deve essere recuperato
  const activeOldTxId = await syncQueue.enqueue({
    endpoint: '/api/v1/telemetry',
    method: 'POST',
    payload: { speed: 9.8 },
    siloPartition: SILO_CONSUMER,
    userId: 'user_athlete_1',
  });
  await syncQueue.markSyncing(activeOldTxId);
  const activeOldRecord = await engine.get(STORE_OFFLINE_QUEUE, activeOldTxId);
  if (activeOldRecord) {
    await engine.set(STORE_OFFLINE_QUEUE, {
      ...activeOldRecord,
      createdAt: new Date(Date.now() - STALE_OFFSET_MS).toISOString(),
    });
  }

  // Zombie B: createdAt recente ma syncStartedAt vecchio -> DEVE essere recuperato
  const zombieTxId = await syncQueue.enqueue({
    endpoint: '/api/v1/telemetry',
    method: 'POST',
    payload: { speed: 10.5 },
    siloPartition: SILO_CONSUMER,
    userId: 'user_athlete_1',
  });
  await syncQueue.markSyncing(zombieTxId);
  const zombieRecord = await engine.get(STORE_OFFLINE_QUEUE, zombieTxId);
  if (zombieRecord) {
    await engine.set(STORE_OFFLINE_QUEUE, {
      ...zombieRecord,
      syncStartedAt: new Date(Date.now() - STALE_OFFSET_MS).toISOString(),
    });
  }

  const recoveredCount = await syncQueue.recoverStaleSyncing(STALE_THRESHOLD_MS);
  assert.strictEqual(recoveredCount, 1, 'Only transaction with stale syncStartedAt is recovered');

  const stillSyncing = await engine.get(STORE_OFFLINE_QUEUE, activeOldTxId);
  assert.strictEqual(stillSyncing?.status, 'syncing');

  const recoveredRecord = await engine.get(STORE_OFFLINE_QUEUE, zombieTxId);
  assert.strictEqual(recoveredRecord?.status, 'pending');
  assert.strictEqual(recoveredRecord?.syncStartedAt, undefined);

  // -------------------------------------------------------------
  // 6. Test IndexedDBService Fallback quando globalThis.indexedDB non e disponibile
  // -------------------------------------------------------------
  console.log('[6/8] Testing IndexedDBService fallback when globalThis.indexedDB is unavailable...');
  await withGlobalIndexedDb(undefined, async () => {
    const idbService = new IndexedDBService();
    await idbService.set(STORE_STUDY_NOTES, note1);
    const fetched = await idbService.get(STORE_STUDY_NOTES, note1.noteId);
    assert.strictEqual(fetched?.noteId, note1.noteId);
    assert.strictEqual(await idbService.count(STORE_STUDY_NOTES), 1);
  });

  // -------------------------------------------------------------
  // 7. Test IndexedDBService onblocked rejection (nessun hang infinito)
  // -------------------------------------------------------------
  console.log('[7/8] Testing IndexedDBService openRequest.onblocked clean rejection...');
  const blockedFactory = {
    open(): IDBOpenDBRequest {
      const openReq: {
        result: IDBDatabase | null;
        error: DOMException | null;
        onupgradeneeded: ((ev: IDBVersionChangeEvent) => void) | null;
        onsuccess: ((ev: Event) => void) | null;
        onerror: ((ev: Event) => void) | null;
        onblocked: ((ev: Event) => void) | null;
      } = {
        result: null,
        error: null,
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        onblocked: null,
      };
      queueMicrotask(() => {
        openReq.onblocked?.(new Event('blocked'));
      });
      return openReq as unknown as IDBOpenDBRequest;
    },
  } as unknown as IDBFactory;

  await withGlobalIndexedDb(blockedFactory, async () => {
    const idbService = new IndexedDBService();
    await assert.rejects(
      () => idbService.getDatabase(),
      /bloccata/i,
      'getDatabase must reject cleanly on onblocked instead of hanging'
    );
  });

  // -------------------------------------------------------------
  // 8. Test IndexedDBService onupgradeneeded, numeric syncState index, operational error propagation & onabort
  // -------------------------------------------------------------
  console.log('[8/8] Testing IndexedDBService schema creation, numeric syncState & error propagation...');
  const mockSetup = createMockIndexedDbFactory();
  await withGlobalIndexedDb(mockSetup.factory, async () => {
    const idbService = new IndexedDBService();
    await idbService.set(STORE_WORKOUT_SESSIONS, session1);

    // Verifica creazione dei 4 store e indice by_syncState (mai by_isSynced)
    assert.strictEqual(mockSetup.stores.has(STORE_WORKOUT_SESSIONS), true);
    assert.strictEqual(mockSetup.stores.has(STORE_STUDY_NOTES), true);
    assert.strictEqual(mockSetup.stores.has(STORE_FAVORITES_CACHE), true);
    assert.strictEqual(mockSetup.stores.has(STORE_OFFLINE_QUEUE), true);

    const sessionStoreMeta = mockSetup.stores.get(STORE_WORKOUT_SESSIONS);
    assert.strictEqual(sessionStoreMeta?.indexes.has(INDEX_SESSIONS_SYNC_STATE), true);
    assert.strictEqual(sessionStoreMeta?.indexes.get(INDEX_SESSIONS_SYNC_STATE)?.keyPath, 'syncState');
    assert.strictEqual(sessionStoreMeta?.indexes.has('by_isSynced'), false);

    const bySyncState = await idbService.getByIndex(
      STORE_WORKOUT_SESSIONS,
      INDEX_SESSIONS_SYNC_STATE,
      SYNC_STATE_PENDING
    );
    assert.strictEqual(bySyncState.length, 1);
    assert.strictEqual(bySyncState[0].sessionId, session1.sessionId);

    const allSessions = await idbService.getAll(STORE_WORKOUT_SESSIONS);
    assert.strictEqual(allSessions.length, 1);
    assert.strictEqual(await idbService.count(STORE_WORKOUT_SESSIONS), 1);

    await idbService.delete(STORE_WORKOUT_SESSIONS, session1.sessionId);
    assert.strictEqual(await idbService.count(STORE_WORKOUT_SESSIONS), 0);

    await idbService.set(STORE_STUDY_NOTES, note1);
    await idbService.clear(STORE_STUDY_NOTES);
    assert.strictEqual(await idbService.count(STORE_STUDY_NOTES), 0);
  });

  // Verifica propagazione errori operativi (es. QuotaExceededError NON silenziato dal fallback)
  const quotaError = new Error('QuotaExceededError: disk limit reached');
  const failingSetup = createMockIndexedDbFactory({ failSetWithError: quotaError });
  await withGlobalIndexedDb(failingSetup.factory, async () => {
    const idbService = new IndexedDBService();
    await assert.rejects(
      () => idbService.set(STORE_WORKOUT_SESSIONS, session1),
      /QuotaExceededError/,
      'Operational transaction error must propagate rather than falling back silently'
    );
    // Verifica che il servizio NON sia passato al fallback in-memory dopo l'errore operativo
    assert.strictEqual(await idbService.count(STORE_WORKOUT_SESSIONS), 0);
  });

  // Verifica gestione transaction.onabort sulle operazioni readonly (get, getAll, getByIndex, count)
  const abortSetup = createMockIndexedDbFactory({ abortReadonly: true });
  await withGlobalIndexedDb(abortSetup.factory, async () => {
    const idbService = new IndexedDBService();
    await assert.rejects(() => idbService.get(STORE_WORKOUT_SESSIONS, 'sess_001'), /aborted/i);
    await assert.rejects(() => idbService.getAll(STORE_WORKOUT_SESSIONS), /aborted/i);
    await assert.rejects(
      () => idbService.getByIndex(STORE_WORKOUT_SESSIONS, INDEX_SESSIONS_SYNC_STATE, SYNC_STATE_PENDING),
      /aborted/i
    );
    await assert.rejects(() => idbService.count(STORE_WORKOUT_SESSIONS), /aborted/i);
  });

  console.log('SUCCESS: ALL 8 STORAGE & SYNC QUEUE TEST STEPS PASSED (100%)!');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
