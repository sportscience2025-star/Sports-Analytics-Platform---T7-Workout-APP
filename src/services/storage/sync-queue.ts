/**
 * src/services/storage/sync-queue.ts
 * Servizio di accodamento e sincronizzazione resiliente delle transazioni offline verso il backend.
 *
 * Include:
 * - Generazione automatica o esplicita di Idempotency-Key univoca (UUID v4) per prevenire duplicati di rete.
 * - Recupero automatico delle transazioni zombie (rimaste in 'syncing' oltre soglia) su syncStartedAt/createdAt.
 * - Calcolo del backoff esponenziale con jitter per evitare picchi simultanei (thundering herd).
 * - Prevenzione dell'Head-of-Line blocking (le transazioni con nextRetryAt futuro non bloccano le successive).
 * - Rispetto dei vincoli di isolamento multi-tenant (ADR-02) tramite tracciamento siloPartition, userId e clubId.
 *
 * Conforme ad ADR-01 (Thin Client), Regola 01 (zero any) e Regola 02 (un file = una responsabilita).
 */

import {
  QueuedTransaction,
  QueueStatusSummary,
  HttpMethod,
  IStorageEngine,
  SyncQueueScopeFilter,
} from './types';
import {
  STORE_OFFLINE_QUEUE,
  INDEX_QUEUE_STATUS,
  DEFAULT_MAX_RETRIES,
  DEFAULT_PEEK_LIMIT,
  MIN_PEEK_LIMIT,
  BASE_RETRY_DELAY_MS,
  MAX_RETRY_DELAY_MS,
  STALE_SYNCING_THRESHOLD_MS,
  JITTER_FACTOR,
} from './constants';
import { indexedDBService } from './indexeddb';
import { DataSiloPartition, SILO2_CLUB_BUNKER } from '../../types/tier';

const TYPEOF_UNDEFINED = 'undefined';
const TYPEOF_FUNCTION = 'function';
const RETRY_EXPONENT_BASE = 2;
const MIN_RETRY_COUNT = 0;
const STATUS_PENDING = 'pending' as const;
const STATUS_SYNCING = 'syncing' as const;
const STATUS_FAILED = 'failed' as const;

const UUID_FALLBACK_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
const UUID_HEX_RADIX = 16;

const ERROR_USER_ID_REQUIRED = 'userId obbligatorio per accodare una transazione offline';
const ERROR_CLUB_ID_REQUIRED_SILO2 = 'clubId obbligatorio per transazioni nel Silo 2 (silo2_club_bunker)';
const ERROR_STALE_SYNCING_RECOVERED = 'Recuperata da stato zombie (timeout o crash precedente)';

/** Parametri per l'accodamento di una nuova transazione */
export interface EnqueueTransactionParams {
  readonly idempotencyKey?: string;
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
 * Genera un identificatore univoco UUID v4 compatibile con browser, Web Worker e test runner.
 *
 * @returns Stringa UUID v4 univoca
 */
function generateUuid(): string {
  if (typeof crypto !== TYPEOF_UNDEFINED && typeof crypto.randomUUID === TYPEOF_FUNCTION) {
    return crypto.randomUUID();
  }
  // Fallback pseudocasuale per ambienti privi di crypto.randomUUID
  return UUID_FALLBACK_TEMPLATE.replace(/[xy]/g, (c) => {
    const r = (Math.random() * UUID_HEX_RADIX) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(UUID_HEX_RADIX);
  });
}

/**
 * Calcola il prossimo istante di retry con backoff esponenziale e jitter casuale.
 * Formula: Delay = min(MAX, BASE * 2^retries) * (1 +/- jitter)
 *
 * @param retryCount Numero corrente di tentativi falliti (valori negativi o NaN sono normalizzati a 0)
 * @returns Ritardo in millisecondi sempre >= BASE_RETRY_DELAY_MS
 */
export function calculateNextRetryDelayMs(retryCount: number): number {
  const safeRetryCount =
    Number.isFinite(retryCount) && retryCount >= MIN_RETRY_COUNT
      ? Math.floor(retryCount)
      : MIN_RETRY_COUNT;
  const exponentialDelay = Math.min(
    MAX_RETRY_DELAY_MS,
    BASE_RETRY_DELAY_MS * Math.pow(RETRY_EXPONENT_BASE, safeRetryCount)
  );
  const jitterRange = exponentialDelay * JITTER_FACTOR;
  const jitterOffset = (Math.random() * 2 - 1) * jitterRange;
  return Math.max(BASE_RETRY_DELAY_MS, Math.round(exponentialDelay + jitterOffset));
}

/**
 * Servizio per la gestione della coda offline di sincronizzazione con supporto a idempotenza e isolamento tenant.
 */
export class SyncQueueService {
  private readonly storage: IStorageEngine;

  /**
   * Inizializza il servizio associandolo a un motore di storage astratto IStorageEngine.
   *
   * @param storage Motore di persistenza conforme a IStorageEngine (default: singleton indexedDBService)
   */
  constructor(storage: IStorageEngine = indexedDBService) {
    this.storage = storage;
  }

  /**
   * Accoda una nuova operazione nella coda transazioni offline con chiave di idempotenza e vincoli ADR-02.
   *
   * @param params Dati della richiesta API e contesto tenant
   * @returns ID univoco della transazione generata
   */
  public async enqueue(params: EnqueueTransactionParams): Promise<string> {
    const normalizedUserId = params.userId.trim();
    if (!normalizedUserId) {
      throw new Error(ERROR_USER_ID_REQUIRED);
    }

    const normalizedClubId = params.clubId?.trim();
    if (params.siloPartition === SILO2_CLUB_BUNKER && !normalizedClubId) {
      throw new Error(ERROR_CLUB_ID_REQUIRED_SILO2);
    }

    const transactionId = generateUuid();
    const trimmedKey = params.idempotencyKey?.trim();
    const idempotencyKey = trimmedKey && trimmedKey.length > 0 ? trimmedKey : generateUuid();
    const now = new Date().toISOString();

    const record: QueuedTransaction = {
      transactionId,
      idempotencyKey,
      endpoint: params.endpoint,
      method: params.method,
      payload: params.payload,
      headers: params.headers,
      status: STATUS_PENDING,
      createdAt: now,
      updatedAt: now,
      retryCount: MIN_RETRY_COUNT,
      maxRetries: params.maxRetries ?? DEFAULT_MAX_RETRIES,
      siloPartition: params.siloPartition,
      clubId: normalizedClubId || undefined,
      userId: normalizedUserId,
    };

    await this.storage.set(STORE_OFFLINE_QUEUE, record);
    return transactionId;
  }

  /**
   * Recupera le transazioni 'syncing' rimaste bloccate (zombie) da oltre la soglia temporale e le reimposta a 'pending'.
   * Utilizza syncStartedAt con fallback su createdAt per evitare falsi positivi su record vecchi appena avviati.
   *
   * @param thresholdMs Tempo limite in millisecondi (default: STALE_SYNCING_THRESHOLD_MS)
   * @returns Numero di transazioni zombie recuperate
   */
  public async recoverStaleSyncing(thresholdMs = STALE_SYNCING_THRESHOLD_MS): Promise<number> {
    const safeThresholdMs =
      Number.isFinite(thresholdMs) && thresholdMs >= 0 ? thresholdMs : STALE_SYNCING_THRESHOLD_MS;
    const syncingItems = await this.storage.getByIndex(STORE_OFFLINE_QUEUE, INDEX_QUEUE_STATUS, STATUS_SYNCING);
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    let recoveredCount = 0;

    for (const item of syncingItems) {
      const referenceTimestamp = item.syncStartedAt ?? item.createdAt;
      const referenceMs = new Date(referenceTimestamp).getTime();
      if (Number.isNaN(referenceMs) || nowMs - referenceMs > safeThresholdMs) {
        const recovered: QueuedTransaction = {
          ...item,
          status: STATUS_PENDING,
          syncStartedAt: undefined,
          updatedAt: nowIso,
          lastError: ERROR_STALE_SYNCING_RECOVERED,
        };
        await this.storage.set(STORE_OFFLINE_QUEUE, recovered);
        recoveredCount++;
      }
    }

    return recoveredCount;
  }

  /**
   * Preleva le transazioni pronte per l'invio (pending e con nextRetryAt trascorso), ordinate FIFO.
   * Consente di filtrare opzionalmente per tenant (userId, siloPartition, clubId).
   *
   * @param limit Numero massimo di elementi da prelevare (normalizzato a >= 1)
   * @param scope Filtro opzionale di isolamento multi-tenant
   * @returns Array di transazioni pronte all'invio ordinate per createdAt crescente
   */
  public async peekPending(
    limit: number = DEFAULT_PEEK_LIMIT,
    scope?: SyncQueueScopeFilter
  ): Promise<QueuedTransaction[]> {
    const safeLimit = Number.isFinite(limit)
      ? Math.max(MIN_PEEK_LIMIT, Math.floor(limit))
      : DEFAULT_PEEK_LIMIT;
    const pendingItems = await this.storage.getByIndex(STORE_OFFLINE_QUEUE, INDEX_QUEUE_STATUS, STATUS_PENDING);
    const nowIso = new Date().toISOString();

    // Applica scoping tenant opzionale e filtra elementi con nextRetryAt futuro
    const readyItems = pendingItems.filter((item) => {
      if (scope?.userId !== undefined && item.userId !== scope.userId) {
        return false;
      }
      if (scope?.siloPartition !== undefined && item.siloPartition !== scope.siloPartition) {
        return false;
      }
      if (scope?.clubId !== undefined && item.clubId !== scope.clubId) {
        return false;
      }
      if (!item.nextRetryAt) {
        return true;
      }
      return item.nextRetryAt <= nowIso;
    });

    // Ordina cronologicamente FIFO (piu vecchie prima)
    readyItems.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    return readyItems.slice(0, safeLimit);
  }

  /**
   * Marca una transazione come in fase di trasmissione ('syncing') registrando syncStartedAt e updatedAt.
   *
   * @param transactionId ID univoco della transazione
   * @returns Promise risolta al termine dell'aggiornamento di stato
   */
  public async markSyncing(transactionId: string): Promise<void> {
    const item = await this.storage.get(STORE_OFFLINE_QUEUE, transactionId);
    if (!item) return;

    const now = new Date().toISOString();
    const updated: QueuedTransaction = {
      ...item,
      status: STATUS_SYNCING,
      syncStartedAt: now,
      updatedAt: now,
    };
    await this.storage.set(STORE_OFFLINE_QUEUE, updated);
  }

  /**
   * Marca una transazione come completata con successo, rimuovendola dalla coda offline.
   *
   * @param transactionId ID univoco della transazione completata
   * @returns Promise risolta al termine della rimozione
   */
  public async markCompleted(transactionId: string): Promise<void> {
    await this.storage.delete(STORE_OFFLINE_QUEUE, transactionId);
  }

  /**
   * Registra il fallimento di una transazione, incrementa il retry e calcola il backoff esponenziale.
   * Se l'errore e permanente o i tentativi sono esauriti, la transazione viene marcata 'failed'.
   *
   * @param transactionId ID univoco della transazione
   * @param error Descrizione testuale dell'errore riscontrato
   * @param isPermanent Se true, evita ulteriori retry e marca subito 'failed'
   * @returns Promise risolta al termine dell'aggiornamento
   */
  public async markFailed(transactionId: string, error: string, isPermanent = false): Promise<void> {
    const item = await this.storage.get(STORE_OFFLINE_QUEUE, transactionId);
    if (!item) return;

    const newRetryCount = item.retryCount + 1;
    const isExhausted = newRetryCount >= item.maxRetries;
    const nowIso = new Date().toISOString();

    if (isPermanent || isExhausted) {
      const failed: QueuedTransaction = {
        ...item,
        status: STATUS_FAILED,
        syncStartedAt: undefined,
        updatedAt: nowIso,
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
      status: STATUS_PENDING,
      syncStartedAt: undefined,
      updatedAt: nowIso,
      retryCount: newRetryCount,
      nextRetryAt,
      lastError: error,
    };
    await this.storage.set(STORE_OFFLINE_QUEUE, retrying);
  }

  /**
   * Elimina definitivamente dalla coda tutte le transazioni marcate come fallite ('failed').
   *
   * @returns Numero totale di transazioni fallite rimosse
   */
  public async purgeExhausted(): Promise<number> {
    const failedItems = await this.storage.getByIndex(STORE_OFFLINE_QUEUE, INDEX_QUEUE_STATUS, STATUS_FAILED);
    for (const item of failedItems) {
      await this.storage.delete(STORE_OFFLINE_QUEUE, item.transactionId);
    }
    return failedItems.length;
  }

  /**
   * Restituisce un riepilogo aggregato dei contatori correnti della coda offline.
   *
   * @returns Oggetto QueueStatusSummary con pendingCount, syncingCount, failedCount e totalCount
   */
  public async getQueueStatus(): Promise<QueueStatusSummary> {
    const all = await this.storage.getAll(STORE_OFFLINE_QUEUE);
    let pendingCount = 0;
    let syncingCount = 0;
    let failedCount = 0;

    for (const item of all) {
      if (item.status === STATUS_PENDING) pendingCount++;
      else if (item.status === STATUS_SYNCING) syncingCount++;
      else if (item.status === STATUS_FAILED) failedCount++;
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
