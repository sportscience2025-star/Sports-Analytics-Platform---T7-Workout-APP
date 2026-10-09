/**
 * src/parser/athlete-resolver.ts
 * Risoluzione e decodifica di nomi atleta, ID hardware sensori e nomi file.
 * Conforme alla Regola 03 (Parsing Intelligente dei Dati): estrae sempre nomi leggibili da ID grezzi.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

const MIN_HEX_TOKEN_LENGTH = 8;
const DEVICE_KEYWORDS = ['encoder', 'sensor', 'device', 'vbt', 'id', 'mac', 'dispositivo', 'sensore', 'test', 'lineare'];

/**
 * Verifica se un frammento testuale è riconducibile a un ID hardware.
 */
function isDeviceToken(part: string): boolean {
  if (!part || typeof part !== 'string') return false;
  const lower = part.trim().toLowerCase();
  if (!lower) return false;
  if (DEVICE_KEYWORDS.includes(lower)) return true;
  if (/\d/.test(lower)) return true;
  if (lower.length >= MIN_HEX_TOKEN_LENGTH && /^[a-f0-9]+$/i.test(lower)) return true;
  return false;
}

/**
 * Verifica se una stringa è un identificativo codificato da un sensore.
 */
function isEncodedId(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (!trimmed || (!trimmed.includes('_') && !trimmed.includes('-'))) return false;
  const parts = trimmed.split(/[-_]+/);
  return parts.some((p) => isDeviceToken(p));
}

/**
 * Estrae una porzione di nome leggibile da una stringa identificativa di un dispositivo.
 */
function extractNameFromId(encoded: string): string {
  if (!encoded || typeof encoded !== 'string') return '';
  const parts = encoded.split(/[-_]+/).filter(Boolean);
  const nameParts = parts.filter((p) => !isDeviceToken(p));
  if (nameParts.length > 0) {
    return nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  }
  return '';
}

/**
 * Pulisce il nome di un file rimuovendo estensioni, date e prefissi comuni.
 */
function cleanFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') return '';
  let name = fileName.replace(/\.[^/.]+$/, ''); // Rimuove estensione
  name = name.replace(/^export[_\-\s]*/i, '');
  name = name.replace(/^report[_\-\s]*/i, '');
  name = name.replace(/^data[_\-\s]*/i, '');
  name = name.replace(/_\d{8,}.*$/, '');
  name = name.replace(/[-_]+/g, ' ').trim();
  return name;
}

/**
 * Risolve in modo intelligente e deterministico il nome dell'atleta.
 *
 * @param rawName - Nome estratto dalle colonne del file
 * @param fallbackName - Nome di fallback opzionale
 * @param fileName - Nome del file caricato per estrazione euristica
 * @returns Nome leggibile dell'atleta
 */
export function resolveAthleteName(
  rawName: string = '',
  fallbackName: string = 'Atleta',
  fileName: string = ''
): string {
  const cleanRaw = rawName.trim();

  // Se è un ID codificato con underscore, estrai la componente nominativa
  if (cleanRaw && isEncodedId(cleanRaw)) {
    const extracted = extractNameFromId(cleanRaw);
    if (extracted.length > 1) return extracted;
  }

  if (cleanRaw && cleanRaw.toLowerCase() !== 'unknown' && cleanRaw.toLowerCase() !== 'sconosciuto') {
    return cleanRaw;
  }

  // Tenta estrazione dal nome file
  if (fileName) {
    const cleanedFile = cleanFileName(fileName);
    if (cleanedFile && cleanedFile.length > 2) {
      return cleanedFile;
    }
  }

  return fallbackName || 'Atleta';
}
