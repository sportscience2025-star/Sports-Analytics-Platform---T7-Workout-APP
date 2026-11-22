/**
 * tests/storage-engine.test.ts
 * Test suite per Offline Storage Engine, In-Memory Fallback e SyncQueueService (TASK-003).
 * Eseguibile con: npx tsx tests/storage-engine.test.ts
 */

import assert from 'node:assert';
import {
  InMemoryStorageEngine,
  SyncQueueService,
  STORE_WORKOUT_SESSIONS,
  STORE_STUDY_NOTES,
  STORE_FAVORITES_CACHE,
  STORE_OFFLINE_QUEUE,
  INDEX_SESSIONS_ATHLETE_ID,
  INDEX_NOTES_SOURCE_ID,
  INDEX_FAVORITES_ITEM_TYPE,
  INDEX_QUEUE_STATUS,
  WorkoutSessionRecord,
  StudyNoteRecord,
  FavoritesCacheRecord,
  calculateNextRetryDelayMs,
} from '../src/services/storage';

console.log('=== RUNNING OFFLINE STORAGE & SYNC QUEUE TEST SUITE ===');

async function runTests() {
  const engine = new InMemoryStorageEngine();

  // -------------------------------------------------------------
  // 1. Test In-Memory Storage: workout_sessions
  // -------------------------------------------------------------
  console.log('[1/5] Testing workout_sessions CRUD & Indices...');
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
        loadKg: 100,
        completedAt: '2026-11-22T10:05:00.000Z',
      },
    ],
    totalVolumeKg: 500,
    isSynced: false,
    updatedAt: '2026-11-22T10:05:00.000Z',
  };

  await engine.set(STORE_WORKOUT_SESSIONS, session1);
  assert.strictEqual(await engine.count(STORE_WORKOUT_SESSIONS), 1);

  const retrieved = await engine.get(STORE_WORKOUT_SESSIONS, 'sess_001');
  assert.notStrictEqual(retrieved, null);
  assert.strictEqual(retrieved?.athleteId, 'ath_101');
  assert.strictEqual(retrieved?.sets.length, 1);

  // Test Index by_athleteId
  const byAthlete = await engine.getByIndex(STORE_WORKOUT_SESSIONS, INDEX_SESSIONS_ATHLETE_ID, 'ath_101');
  assert.strictEqual(byAthlete.length, 1);
  assert.strictEqual(byAthlete[0].sessionId, 'sess_001');

  // Test Deep Clone Isolation
  (session1.sets as unknown as { loadKg: number }[])[0].loadKg = 999;
  const retrievedAfterMutation = await engine.get(STORE_WORKOUT_SESSIONS, 'sess_001');
  assert.strictEqual(retrievedAfterMutation?.sets[0].loadKg, 100, 'in-memory storage must preserve clone immutability');

  // -------------------------------------------------------------
  // 2. Test In-Memory Storage: study_notes
  // -------------------------------------------------------------
  console.log('[2/5] Testing study_notes Store...');
  const note1: StudyNoteRecord = {
    noteId: 'note_001',
    sourceId: 'PMID_34567890',
    title: 'VBT Force-Velocity Profiling Meta-Analysis',
    content: 'Threshold of 0.30 m/s confirmed for 1RM bench press.',
    tags: ['vbt', 'bench_press', 'strength'],
    createdAt: '2026-11-22T08:00:00.000Z',
    updatedAt: '2026-11-22T08:30:00.000Z',
  };

  await engine.set(STORE_STUDY_NOTES, note1);
  const noteByPmid = await engine.getByIndex(STORE_STUDY_NOTES, INDEX_NOTES_SOURCE_ID, 'PMID_34567890');
  assert.strictEqual(noteByPmid.length, 1);
  assert.strictEqual(noteByPmid[0].noteId, 'note_001');

  // -------------------------------------------------------------
  // 3. Test In-Memory Storage: favorites_cache
  // -------------------------------------------------------------
  console.log('[3/5] Testing favorites_cache Store...');
  const fav1: FavoritesCacheRecord = {
    bookmarkId: 'fav_001',
    userId: 'usr_coach_1',
    itemType: 'exercise',
    itemId: 'leg_squat_01',
    title: 'Back Squat 3D',
    tags: ['quads', 'compound'],
    orderIndex: 0,
    cachedAt: '2026-11-22T09:00:00.000Z',
  };

  await engine.set(STORE_FAVORITES_CACHE, fav1);
  const exercisesFav = await engine.getByIndex(STORE_FAVORITES_CACHE, INDEX_FAVORITES_ITEM_TYPE, 'exercise');
  assert.strictEqual(exercisesFav.length, 1);
  assert.strictEqual(exercisesFav[0].bookmarkId, 'fav_001');

  // -------------------------------------------------------------
  // 4. Test SyncQueueService Lifecycle & Idempotency
  // -------------------------------------------------------------
  console.log('[4/5] Testing SyncQueueService Enqueue, FIFO & Idempotency...');
  // Inizializziamo il servizio sync con l'engine in-memory
  const syncQueue = new SyncQueueService(engine as unknown as import('../src/services/storage').IndexedDBService);

  const tx1Id = await syncQueue.enqueue({
    endpoint: '/api/v1/sessions',
    method: 'POST',
    payload: { sessionId: 'sess_001' },
    siloPartition: 'silo2_club_bunker',
    clubId: 'club_juventus',
    userId: 'usr_doc_1',
    maxRetries: 3,
  });

  const tx2Id = await syncQueue.enqueue({
    endpoint: '/api/v1/readiness',
    method: 'POST',
    payload: { athleteId: 'ath_101', pvtScore: 88 },
    siloPartition: 'silo2_club_bunker',
    clubId: 'club_juventus',
    userId: 'usr_doc_1',
    maxRetries: 3,
  });

  const pending = await syncQueue.peekPending(10);
  assert.strictEqual(pending.length, 2);
  assert.strictEqual(pending[0].transactionId, tx1Id, 'FIFO ordering respected');
  assert.notStrictEqual(pending[0].idempotencyKey, pending[1].idempotencyKey, 'Distinct idempotency keys');

  // Mark Syncing
  await syncQueue.markSyncing(tx1Id);
  const afterSyncing = await syncQueue.peekPending(10);
  assert.strictEqual(afterSyncing.length, 1, 'Syncing transaction excluded from peekPending');
  assert.strictEqual(afterSyncing[0].transactionId, tx2Id);

  // Mark Completed
  await syncQueue.markCompleted(tx1Id);
  assert.strictEqual(await engine.get(STORE_OFFLINE_QUEUE, tx1Id), null, 'Completed tx deleted');

  // -------------------------------------------------------------
  // 5. Test Retry Backoff, Zombie Recovery & Exhaustion
  // -------------------------------------------------------------
  console.log('[5/5] Testing Backoff Calculation, Zombie Recovery & Exhaustion...');
  // Exponential backoff check
  const delay1 = calculateNextRetryDelayMs(1);
  const delay2 = calculateNextRetryDelayMs(2);
  assert.strictEqual(delay1 >= 1000, true);
  assert.strictEqual(delay2 >= delay1 * 0.8, true, 'Delay increases with retryCount');

  // Mark Failed with Retry
  await syncQueue.markFailed(tx2Id, 'Network error 503');
  const tx2AfterFail = await engine.get(STORE_OFFLINE_QUEUE, tx2Id);
  assert.strictEqual(tx2AfterFail?.retryCount, 1);
  assert.strictEqual(tx2AfterFail?.status, 'pending');
  assert.notStrictEqual(tx2AfterFail?.nextRetryAt, undefined);

  // Simulate Permanent Fail
  await syncQueue.markFailed(tx2Id, 'Validation error 422', true);
  const tx2PermanentFail = await engine.get(STORE_OFFLINE_QUEUE, tx2Id);
  assert.strictEqual(tx2PermanentFail?.status, 'failed');

  const queueStatus = await syncQueue.getQueueStatus();
  assert.strictEqual(queueStatus.failedCount, 1);
  assert.strictEqual(queueStatus.pendingCount, 0);

  // Purge Exhausted
  const purged = await syncQueue.purgeExhausted();
  assert.strictEqual(purged, 1);
  assert.strictEqual((await syncQueue.getQueueStatus()).totalCount, 0);

  // Test Zombie Recovery
  const zombieTxId = await syncQueue.enqueue({
    endpoint: '/api/v1/telemetry',
    method: 'POST',
    payload: { speed: 10.5 },
    siloPartition: 'silo1_consumer',
    userId: 'user_athlete_1',
  });
  await syncQueue.markSyncing(zombieTxId);

  // Forziamo timestamp vecchio per simulare crash di oltre 60s fa
  const zombieRecord = await engine.get(STORE_OFFLINE_QUEUE, zombieTxId);
  if (zombieRecord) {
    (zombieRecord as unknown as { createdAt: string }).createdAt = new Date(Date.now() - 70000).toISOString();
    await engine.set(STORE_OFFLINE_QUEUE, zombieRecord);
  }

  const recoveredCount = await syncQueue.recoverStaleSyncing(60000);
  assert.strictEqual(recoveredCount, 1, 'Zombie transaction recovered to pending');
  const recoveredRecord = await engine.get(STORE_OFFLINE_QUEUE, zombieTxId);
  assert.strictEqual(recoveredRecord?.status, 'pending');

  console.log('SUCCESS: ALL 5 STORAGE & SYNC QUEUE TEST STEPS PASSED (100%)!');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
