/**
 * src/utils/storage-safe.ts
 * Helper condivisi per accesso protetto a localStorage (SSR-safe ed exception-safe).
 * Conforme a Regola 01 e Regola 02 (TypeScript strict, zero any, costanti e JSDoc).
 */

// ============================================================================
// COSTANTI DI CONTROLLO AMBIENTE
// ============================================================================

const TYPEOF_UNDEFINED = 'undefined';

// ============================================================================
// HELPER INTERNO
// ============================================================================

/**
 * Risolve in sicurezza l'istanza window.localStorage gestendo SSR e policy sandbox.
 * @returns Istanza Storage disponibile oppure null se non accessibile
 */
function getLocalStorageSafe(): Storage | null {
  try {
    if (
      typeof window !== TYPEOF_UNDEFINED &&
      typeof window.localStorage !== TYPEOF_UNDEFINED &&
      window.localStorage !== null
    ) {
      return window.localStorage;
    }
  } catch {
    // Accesso a window.localStorage bloccato da policy browser o iframe sandbox
  }
  return null;
}

// ============================================================================
// API PUBBLICA STORAGE SICURO
// ============================================================================

/**
 * Legge in sicurezza una stringa da localStorage con gestione SSR e sandbox browser.
 * @param key Chiave di storage da leggere
 * @returns Stringa salvata oppure null se assente o storage non disponibile
 */
export function readStorageSafe(key: string): string | null {
  const storage = getLocalStorageSafe();
  if (storage === null) {
    return null;
  }
  try {
    return storage.getItem(key);
  } catch {
    // Lettura storage non disponibile o bloccata dalle policy browser
    return null;
  }
}

/**
 * Scrive in sicurezza una stringa in localStorage gestendo quote esaurite e sandbox.
 * @param key Chiave di storage su cui scrivere
 * @param value Valore testuale da salvare
 * @returns true se la scrittura e riuscita, false in caso di errore o SSR
 */
export function writeStorageSafe(key: string, value: string): boolean {
  const storage = getLocalStorageSafe();
  if (storage === null) {
    return false;
  }
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    // QuotaExceededError o accesso storage bloccato dalle policy browser
    return false;
  }
}

/**
 * Rimuove in sicurezza una chiave da localStorage con gestione SSR e sandbox browser.
 * @param key Chiave di storage da rimuovere
 * @returns true se la rimozione e riuscita, false in caso di errore o SSR
 */
export function removeStorageSafe(key: string): boolean {
  const storage = getLocalStorageSafe();
  if (storage === null) {
    return false;
  }
  try {
    storage.removeItem(key);
    return true;
  } catch {
    // Accesso storage non disponibile o bloccato dalle policy browser
    return false;
  }
}

/**
 * Legge e deserializza un payload JSON da localStorage in modo sicuro per SSR e sandbox.
 * @param key Chiave di storage da leggere e parsare
 * @returns Valore deserializzato tipizzato come T oppure null se assente, non valido o inaccessibile
 */
export function readStorageJsonSafe<T>(key: string): T | null {
  const raw = readStorageSafe(key);
  if (raw === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed as T;
  } catch {
    // Payload JSON malformato o non deserializzabile
    return null;
  }
}
