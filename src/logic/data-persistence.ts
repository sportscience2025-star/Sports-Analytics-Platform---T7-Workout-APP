/**
 * src/logic/data-persistence.ts
 * Gestore della Persistenza, Backup e Ripristino dei Dati dell'Applicazione.
 * Gestisce l'esportazione dello snapshot applicativo su file JSON e il suo ripristino sicuro.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

export const STORAGE_KEYS = {
  CURRENT_PROGRAM: 't7_current_program',
  PROG_PARAMS: 't7_prog_params',
  TEMP_PATHOLOGIES: 't7_temp_pathologies',
  FAVORITES: 't7_favorites',
  CUSTOM_EXERCISES: 't7_custom_exercises',
  LAST_EXPORT: 't7_last_export',
} as const;

export interface AppBackupSnapshot {
  version: string;
  exportedAt: string;
  data: {
    t7_current_program: unknown;
    t7_prog_params: unknown;
    t7_temp_pathologies: unknown;
    t7_favorites: unknown;
    t7_custom_exercises: unknown;
    t7_last_export: string | null;
  };
}

/**
 * Raccoglie tutti i dati dal localStorage e crea un oggetto di backup strutturato.
 *
 * @returns Snapshot applicativo tipizzato
 */
export function createBackupSnapshot(): AppBackupSnapshot {
  const readKey = (key: string): unknown => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item);
    } catch {
      return localStorage.getItem(key);
    }
  };

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      t7_current_program: readKey(STORAGE_KEYS.CURRENT_PROGRAM),
      t7_prog_params: readKey(STORAGE_KEYS.PROG_PARAMS),
      t7_temp_pathologies: readKey(STORAGE_KEYS.TEMP_PATHOLOGIES),
      t7_favorites: readKey(STORAGE_KEYS.FAVORITES),
      t7_custom_exercises: readKey(STORAGE_KEYS.CUSTOM_EXERCISES),
      t7_last_export: localStorage.getItem(STORAGE_KEYS.LAST_EXPORT),
    },
  };
}

/**
 * Avvia il download del file JSON di backup con marcatura oraria ISO.
 */
export function downloadBackupFile(): void {
  const snapshot = createBackupSnapshot();
  const jsonStr = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `t7_backup_${timestamp}.json`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  try {
    localStorage.setItem(STORAGE_KEYS.LAST_EXPORT, new Date().toISOString());
  } catch {
    // Ignora errori di storage
  }
}

/**
 * Ripristina i dati da un oggetto snapshot di backup nel localStorage.
 *
 * @param snapshot - Oggetto di backup caricato
 * @returns Esito booleano dell'operazione
 */
export function restoreFromSnapshot(snapshot: AppBackupSnapshot): boolean {
  if (!snapshot || !snapshot.data) {
    return false;
  }

  const { data } = snapshot;

  const writeKey = (key: string, value: unknown): void => {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  try {
    if ('t7_current_program' in data) writeKey(STORAGE_KEYS.CURRENT_PROGRAM, data.t7_current_program);
    if ('t7_prog_params' in data) writeKey(STORAGE_KEYS.PROG_PARAMS, data.t7_prog_params);
    if ('t7_temp_pathologies' in data) writeKey(STORAGE_KEYS.TEMP_PATHOLOGIES, data.t7_temp_pathologies);
    if ('t7_favorites' in data) writeKey(STORAGE_KEYS.FAVORITES, data.t7_favorites);
    if ('t7_custom_exercises' in data) writeKey(STORAGE_KEYS.CUSTOM_EXERCISES, data.t7_custom_exercises);
    writeKey(STORAGE_KEYS.LAST_EXPORT, new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}

/**
 * Legge un file JSON caricato dall'utente e ne applica il ripristino.
 *
 * @param file - File JSON di backup selezionato
 * @returns Promessa che risolve con true se il ripristino ha avuto successo
 */
export function restoreFromFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as AppBackupSnapshot;
        const ok = restoreFromSnapshot(parsed);
        resolve(ok);
      } catch {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
}
