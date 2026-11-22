/**
 * src/services/storage/sync-queue.ts
 * Servizio di accodamento e sincronizzazione resiliente delle transazioni offline verso il backend.
 *
 * Include:
 * - Generazione automatica di Idempotency-Key univoca (UUID v4) per prevenire duplicati di rete.
 * - Recupero automatico delle transazioni zombie (rimaste in 'syncing' dopo crash o reload).
 * - Calcolo del backoff esponenziale con jitter per evitare picchi simultanei (thundering herd).
 * - Prevenzione dell'Head-of-Line blocking (le transazioni con nextRetryAt futuro non bloccano le successive).
 * - Rispetto dei vincoli di isolamento multi-tenant (ADR-02) tramite tracciamento siloPartition e clubId.
 *
 * Conforme ad ADR-01 (Thin Client), Regola 01 (zero any) e Regola 02 (un file = una responsabilita).
 */

import {
  QueuedTransaction,
  QueueTransactionStatus,
  QueueStatusSummary,
  HttpMethod,
} from './types';
import {
  STORE_OFFLINE_QUEUE,
  INDEX_QUEUE_STATUS,
  DEFAULT_MAX_RETRIES,
  BASE_RETRY_DELAY_MS,
  MAX_RETRY_DELAY_MS,
  STALE_SYNCING_THRESHOLD_MS,
  JITTER_FACTOR,
} from './constants';
import { indexedDBService, IndexedDBService } from './indexeddb';
import { DataSiloPartition } from '../../types/tier';

/** Parametri per l'accodamento di una nuova transazione */
export interface EnqueueTransactionParams {
  readonly endpoint: string;
  readonly method: HttpMethod;
  readonly payload: unknown;
  readonly headers?: Readonly<Record<string, string>>;
  readonly maxRetries?: number;
  readonly siloPartition: DataSiloPartition;
  readonly clubId?: string;
  readonly userId: string;
}

/**
 * Genera un identificatore univoco UUID v4 compatibile browser e test runner.
 */
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback pseudocasuale per ambienti senza Web Crypto
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Calcola il prossimo istante di retry con backoff esponenziale e jitter casuale.
 * Formula: Delay = min(MAX, BASE * 2^retries) * (1 +/- jitter)
 */
export function calculateNextRetryDelayMs(retryCount: number): number {
  const exponentialDelay = Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * Math.pow(2, retryCount));
  const jitterRange = exponentialDelay * JITTER_FACTOR;
  const jitterOffset = (Math.random() * 2 - 1) * jitterRange;
  return Math.max(BASE_RETRY_DELAY_MS, Math.round(exponentialDelay + jitterOffset));
}

export class SyncQueueService {
  private readonly storage: IndexedDBService;

  constructor(storage: IndexedDBService = indexedDBService) {
    this.storage = storage;
  }

  /**
   * Accoda una nuova operazione nella coda transazioni offline con chiave di idempotenza.
   *
   * @param params Dati della richiesta API
   * @returns ID univoco della transazione generata
   */
  public async enqueue(params: EnqueueTransactionParams): Promise<string> {
    const transactionId = generateUuid();
    const idempotencyKey = generateUuid();
    const now = new Date().toISOString();

    const record: QueuedTransaction = {
      transactionId,
      idempotencyKey,
      endpoint: params.endpoint,
      method: params.method,
      payload: params.payload,
      headers: params.headers,
      status: 'pending',
      createdAt: now,
      retryCount: 0,
      maxRetries: params.maxRetries ?? DEFAULT_MAX_RETRIES,
      siloPartition: params.siloPartition,
      clubId: params.clubId,
      userId: params.userId,
    };

    await this.storage.set(STORE_OFFLINE_QUEUE, record);
    return transactionId;
  }

  /**
   * Recupera le transazioni 'syncing' rimaste bloccate (zombie) da oltre la soglia temporale e le reimposta a 'pending'.
   *
   * @param thresholdMs Tempo limite in ms (default: 60000)
   * @returns Numero di transazioni zombie recuperate
   */
  public async recoverStaleSyncing(thresholdMs = STALE_SYNCING_THRESHOLD_MS): Promise<number> {
    const syncingItems = await this.storage.getByIndex(STORE_OFFLINE_QUEUE, INDEX_QUEUE_STATUS, 'syncing');
    const now = Date.now();
    let recoveredCount = 0;

    for (const item of syncingItems) {
      const updatedAtMs = new Date(item.createdAt).getTime();
      if (now - updatedAtMs > thresholdMs) {
        const recovered: QueuedTransaction = {
          ...item,
          status: 'pending',
          lastError: 'Recuperata da stato zombie (timeout o crash precedente)',
        };
        await this.storage.set(STORE_OFFLINE_QUEUE, recovered);
        recoveredCount++;
      }
    }

    return recoveredCount;
  }

  /**
   * Preleva le transazioni pronte per l'invio (pending e con nextRetryAt trascorso), ordinate per tempo di creazione FIFO.
   *
   * @param limit Numero massimo di elementi da prelevare
   * @returns Array di transazioni pronte all'invio
   */
  public async peekPending(limit = 10): Promise<QueuedTransaction[]> {
    const pendingItems = await this.storage.getByIndex(STORE_OFFLINE_QUEUE, INDEX_QUEUE_STATUS, 'pending');
    const nowIso = new Date().toISOString();

    // Filtra elementi che non hanno raggiunto il nextRetryAt (prevenzione starvation/busy loop)
    const readyItems = pendingItems.filter((item) => {
      if (!item.nextRetryAt) return true;
      return item.nextRetryAt <= nowIso;
    });

    // Ordina cronologicamente FIFO (piu vecchie prima)
    readyItems.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    return readyItems.slice(0, limit);
  }

  /**
   * Marca una transazione come in fase di trasmissione ('syncing').
   *
   * @param transactionId ID transazione
   */
  public async markSyncing(transactionId: string): Promise<void> {
    const item = await this.storage.get(STORE_OFFLINE_QUEUE, transactionId);
    if (!item) return;

    const updated: QueuedTransaction = {
      ...item,
      status: 'syncing',
    };
    await this.storage.set(STORE_OFFLINE_QUEUE, updated);
  }

  /**
   * Marca una transazione come completata con successo, rimuovendola dalla coda.
   *
   * @param transactionId ID transazione completata
   */
  public async markCompleted(transactionId: string): Promise<void> {
    await this.storage.delete(STORE_OFFLINE_QUEUE, transactionId);
  }

  /**
   * Registra il fallimento di una transazione, incrementa il retry e calcola il backoff.
   * Se l'errore e permanente (es. 400 Bad Request) o i tentativi sono esauriti, la transazione viene marcata 'failed'.
   *
   * @param transactionId ID transazione
   * @param error Descrizione dell'errore
   * @param isPermanent Se true, non effettua ulteriori retry
   */
  public async markFailed(transactionId: string, error: string, isPermanent = false): Promise<void> {
    const item = await this.storage.get(STORE_OFFLINE_QUEUE, transactionId);
    if (!item) return;

    const newRetryCount = item.retryCount + 1;
    const isExhausted = newRetryCount >= item.maxRetries;

    if (isPermanent || isExhausted) {
      const failed: QueuedTransaction = {
        ...item,
        status: 'failed',
        retryCount: newRetryCount,
        lastError: error,
      };
      await this.storage.set(STORE_OFFLINE_QUEUE, failed);
      return;
    }

    // Calcolo backoff esponenziale con jitter per il prossimo tentativo
    const delayMs = calculateNextRetryDelayMs(newRetryCount);
    const nextRetryAt = new Date(Date.now() + delayMs).toISOString();

    const retrying: QueuedTransaction = {
      ...item,
      status: 'pending',
      retryCount: newRetryCount,
      nextRetryAt,
      lastError: error,
    };
    await this.storage.set(STORE_OFFLINE_QUEUE, retrying);
  }

  /**
   * Elimina definitivamente dalla coda le transazioni marcate come fallite ('failed').
   *
   * @returns Numero di elementi eliminati
   */
  public async purgeExhausted(): Promise<number> {
    const failedItems = await this.storage.getByIndex(STORE_OFFLINE_QUEUE, INDEX_QUEUE_STATUS, 'failed');
    for (const item of failedItems) {
      await this.storage.delete(STORE_OFFLINE_QUEUE, item.transactionId);
    }
    return failedItems.length;
  }

  /**
   * Restituisce un riepilogo aggregato dello stato della coda.
   */
  public async getQueueStatus(): Promise<QueueStatusSummary> {
    const all = await this.storage.getAll(STORE_OFFLINE_QUEUE);
    let pendingCount = 0;
    let syncingCount = 0;
    let failedCount = 0;

    for (const item of all) {
      if (item.status === 'pending') pendingCount++;
      else if (item.status === 'syncing') syncingCount++;
      else if (item.status === 'failed') failedCount++;
    }

    return {
      pendingCount,
      syncingCount,
      failedCount,
      totalCount: all.length,
    };
  }
}

/** Istanza singleton esportata per l'intera applicazione */
export const syncQueueService = new SyncQueueService();
