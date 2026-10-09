/**
 * src/parser/header-mapper.ts
 * Mappatura semantica avanzata delle intestazioni di colonna per encoder e strumenti di misura.
 * Converte colonne grezze multilingue (IT, EN, ES) nei campi normalizzati del sistema T7.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

const LOAD_KEYWORDS = [
  'weight', 'weights', 'wt', 'peso (kg)', 'carico (kg)', 'peso [kg]', 'carico [kg]',
  'pesi', 'kg load', 'kg_load', 'load (kg)', 'load [kg]', 'weight (kg)', 'weight [kg]',
  'load', 'carico', 'peso', 'carga', 'kg'
];

const VELOCITY_KEYWORDS = [
  'speed', 'speeds', 'velocita (m/s)', 'velocità (m/s)', 'vel (m/s)', 'speed (m/s)',
  'velocità media', 'velocita media', 'mean speed', 'mean velocity', 'velocity (m/s)',
  'velocita [m/s]', 'velocità [m/s]', 'vel [m/s]', 'speed [m/s]', 'velocity [m/s]',
  'vm', 'vmean', 'v_mean', 'mean_v', 'vel', 'velocity', 'velocita', 'velocità', 'velocidad', 'mpv'
];

const PEAK_VELOCITY_KEYWORDS = [
  'vmax', 'v_max', 'peak speed', 'peak velocity', 'velocita picco', 'velocità picco',
  'max speed', 'max velocity', 'vel picco', 'velocidad maxima'
];

const POWER_KEYWORDS = [
  'power', 'potenza', 'potencia', 'watts', 'w', 'potenza (w)', 'power (w)', 'mean power', 'potenza media'
];

const REPS_KEYWORDS = [
  'reps', 'ripetizioni', 'repetitions', 'reps_count', 'n_reps', 'rip', 'rep',
  'n_ripetizioni', 'ripetizione', 'count', 'n reps', 'n ripetizioni'
];

const SETS_KEYWORDS = [
  'set', 'sets', 'serie', 'n_serie', 'set_num', 'set_index', 'numero serie', 'n serie'
];

const ATHLETE_KEYWORDS = [
  'athlete', 'atleta', 'name', 'nome', 'cognome', 'full_name', 'sportivo', 'subject', 'soggetto'
];

const EXERCISE_KEYWORDS = [
  'exercise', 'esercizio', 'ejercicio', 'movimento', 'test', 'exercise_name', 'nome esercizio'
];

const DATE_KEYWORDS = [
  'date', 'data', 'fecha', 'timestamp', 'datetime', 'giorno', 'ora'
];

export interface HeaderMapResult {
  loadIndex: number;
  velocityIndex: number;
  peakVelocityIndex: number;
  powerIndex: number;
  repsIndex: number;
  setsIndex: number;
  athleteIndex: number;
  exerciseIndex: number;
  dateIndex: number;
}

/**
 * Cerca l'indice della colonna che meglio corrisponde a un elenco di parole chiave.
 */
function findMatchingColumn(headers: string[], keywords: string[]): number {
  const normHeaders = headers.map((h) => h.toLowerCase().trim());

  // 1. Corrispondenza esatta
  for (let i = 0; i < normHeaders.length; i++) {
    if (keywords.includes(normHeaders[i])) return i;
  }

  // 2. Corrispondenza sottostringa
  for (let i = 0; i < normHeaders.length; i++) {
    for (const kw of keywords) {
      if (normHeaders[i].includes(kw)) return i;
    }
  }

  return -1;
}

/**
 * Mappa le intestazioni di un file tabulare nei canali standard del parser VBT.
 *
 * @param headers - Array delle intestazioni delle colonne del file
 * @returns Mappa degli indici di colonna per ciascuna grandezza fisica
 */
export function mapHeaders(headers: string[]): HeaderMapResult {
  return {
    loadIndex: findMatchingColumn(headers, LOAD_KEYWORDS),
    velocityIndex: findMatchingColumn(headers, VELOCITY_KEYWORDS),
    peakVelocityIndex: findMatchingColumn(headers, PEAK_VELOCITY_KEYWORDS),
    powerIndex: findMatchingColumn(headers, POWER_KEYWORDS),
    repsIndex: findMatchingColumn(headers, REPS_KEYWORDS),
    setsIndex: findMatchingColumn(headers, SETS_KEYWORDS),
    athleteIndex: findMatchingColumn(headers, ATHLETE_KEYWORDS),
    exerciseIndex: findMatchingColumn(headers, EXERCISE_KEYWORDS),
    dateIndex: findMatchingColumn(headers, DATE_KEYWORDS),
  };
}
