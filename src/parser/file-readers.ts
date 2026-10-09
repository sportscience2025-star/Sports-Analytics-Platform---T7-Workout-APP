/**
 * src/parser/file-readers.ts
 * Lettore ed estrattore di file per dati sport science e encoder VBT (CSV, TSV, testo delimitato).
 * Include algoritmo di individuazione euristica dell'intestazione (Header Scoring).
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import { mapHeaders, type HeaderMapResult } from './header-mapper';
import { normalizeExercise } from './exercise-dict';
import { resolveAthleteName } from './athlete-resolver';
import { type RawRepetition } from './load-aggregator';

export interface ParsedFileDataset {
  athleteName: string;
  exerciseName: string;
  headers: string[];
  records: RawRepetition[];
  rawRowsCount: number;
}

/**
 * Divide una riga CSV gestendo correttamente i campi racchiusi tra virgolette.
 */
export function parseDelimitedLine(line: string, delimiter?: string): string[] {
  const d = delimiter || (line.includes(';') ? ';' : line.includes('\t') ? '\t' : ',');
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === d && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Individua la riga contenente l'intestazione della tabella tramite scoring pesato.
 */
function findHeaderRowIndex(rows: string[][]): { index: number; map: HeaderMapResult } {
  let bestIndex = 0;
  let bestScore = -1;
  let bestMap = mapHeaders([]);

  const maxRowsToInspect = Math.min(rows.length, 30);

  for (let i = 0; i < maxRowsToInspect; i++) {
    const candidateHeaders = rows[i];
    const candidateMap = mapHeaders(candidateHeaders);

    let score = 0;
    if (candidateMap.loadIndex >= 0) score += 5;
    if (candidateMap.velocityIndex >= 0) score += 5;
    if (candidateMap.peakVelocityIndex >= 0) score += 3;
    if (candidateMap.repsIndex >= 0) score += 2;
    if (candidateMap.setsIndex >= 0) score += 2;
    if (candidateMap.athleteIndex >= 0) score += 2;
    if (candidateMap.exerciseIndex >= 0) score += 2;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
      bestMap = candidateMap;
    }
  }

  return { index: bestIndex, map: bestMap };
}

/**
 * Converte una stringa di testo delimitato in un dataset VBT tipizzato.
 *
 * @param content - Contenuto testuale del file CSV o TSV
 * @param fileName - Nome del file caricato (utilizzato per dedurre atleta o esercizio)
 * @returns Dataset strutturato ParsedFileDataset
 */
export function readDelimitedText(content: string, fileName: string = ''): ParsedFileDataset {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) {
    return {
      athleteName: resolveAthleteName('', 'Atleta', fileName),
      exerciseName: 'Sconosciuto',
      headers: [],
      records: [],
      rawRowsCount: 0,
    };
  }

  // Rileva delimitatore prevalente
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';

  const rows = lines.map((line) => parseDelimitedLine(line, delimiter));
  const { index: headerRowIndex, map: headerMap } = findHeaderRowIndex(rows);

  const headers = rows[headerRowIndex] || [];
  const dataRows = rows.slice(headerRowIndex + 1);

  let rawAthlete = '';
  let rawExercise = '';
  const records: RawRepetition[] = [];

  for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
    const row = dataRows[rIdx];
    if (row.length < 2) continue;

    if (!rawAthlete && headerMap.athleteIndex >= 0 && row[headerMap.athleteIndex]) {
      rawAthlete = row[headerMap.athleteIndex];
    }
    if (!rawExercise && headerMap.exerciseIndex >= 0 && row[headerMap.exerciseIndex]) {
      rawExercise = row[headerMap.exerciseIndex];
    }

    const loadStr = headerMap.loadIndex >= 0 ? row[headerMap.loadIndex] : '';
    const velStr = headerMap.velocityIndex >= 0 ? row[headerMap.velocityIndex] : '';

    const loadVal = parseFloat(loadStr.replace(',', '.'));
    const velVal = parseFloat(velStr.replace(',', '.'));

    if (!isNaN(loadVal) && loadVal > 0 && !isNaN(velVal) && velVal > 0) {
      const peakVelStr = headerMap.peakVelocityIndex >= 0 ? row[headerMap.peakVelocityIndex] : '';
      const powerStr = headerMap.powerIndex >= 0 ? row[headerMap.powerIndex] : '';
      const setStr = headerMap.setsIndex >= 0 ? row[headerMap.setsIndex] : '';
      const repStr = headerMap.repsIndex >= 0 ? row[headerMap.repsIndex] : '';

      const peakVel = peakVelStr ? parseFloat(peakVelStr.replace(',', '.')) : undefined;
      const powerVal = powerStr ? parseFloat(powerStr.replace(',', '.')) : undefined;
      const setIdx = setStr ? parseInt(setStr, 10) : undefined;
      const repIdx = repStr ? parseInt(repStr, 10) : undefined;

      records.push({
        load: loadVal,
        velocity: velVal,
        peakVelocity: peakVel && !isNaN(peakVel) ? peakVel : undefined,
        power: powerVal && !isNaN(powerVal) ? powerVal : undefined,
        setIndex: setIdx && !isNaN(setIdx) ? setIdx : undefined,
        repIndex: repIdx && !isNaN(repIdx) ? repIdx : undefined,
      });
    }
  }

  const athleteName = resolveAthleteName(rawAthlete, 'Atleta', fileName);
  const exerciseName = normalizeExercise(rawExercise || fileName);

  return {
    athleteName,
    exerciseName,
    headers,
    records,
    rawRowsCount: lines.length,
  };
}
