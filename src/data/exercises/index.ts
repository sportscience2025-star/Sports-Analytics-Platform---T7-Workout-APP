/**
 * src/data/exercises/index.ts
 * Barrel file e aggregatore del Data Layer Esercizi di T7 Workout Platform.
 * Esporta il catalogo unificato allExercises e funzioni di lookup/filtro pure.
 * Rispetta la Regola R1 (Zero any, TypeScript strict) e Regola R2 (Single Source of Truth).
 */

import type { Exercise, ExerciseLevel, ExerciseQuality } from '../../types/exercise';
import { chestExercises } from './chest';
import { backExercises } from './back';
import { legsExercises } from './legs';
import { shouldersExercises } from './shoulders';
import { armsExercises } from './arms';
import { coreExercises } from './core';
import { kneeClinicalExercises } from './clinical-knee';

// Esportazione dei moduli specifici per dominio
export {
  chestExercises,
  backExercises,
  legsExercises,
  shouldersExercises,
  armsExercises,
  coreExercises,
  kneeClinicalExercises,
};

/**
 * Catalogo globale aggregato di tutti gli esercizi tipizzati del sistema.
 */
export const allExercises: Exercise[] = [
  ...chestExercises,
  ...backExercises,
  ...legsExercises,
  ...shouldersExercises,
  ...armsExercises,
  ...coreExercises,
  ...kneeClinicalExercises,
];

/**
 * Costanti descrittive per evitare numeri magici nelle funzioni di ricerca.
 */
const MIN_SEARCH_QUERY_LENGTH = 1;
const MATCH_NOT_FOUND_INDEX = -1;

/**
 * Mappa interna indicizzata per ID per garantire lookup a tempo costante O(1).
 */
const exercisesByIdMap: ReadonlyMap<string, Exercise> = new Map(
  allExercises.map((exercise: Exercise) => [exercise.id.toLowerCase(), exercise])
);

/**
 * Restituisce l array completo di tutti gli esercizi tipizzati a catalogo.
 *
 * @returns Array contenente tutti gli esercizi aggregati.
 */
export function getAllExercises(): Exercise[] {
  return allExercises;
}

/**
 * Cerca e restituisce un esercizio corrispondente all identificatore univoco specificato.
 * Il confronto viene eseguito in modalità case-insensitive e ignora spaziature accidentali.
 *
 * @param id - Identificatore univoco dell esercizio (es. 'ch_01', 'bk_02', 'cli_01')
 * @returns L oggetto Exercise corrispondente se presente, altrimenti undefined.
 *
 * @example
 * ```ts
 * const ex = getExerciseById('ch_01');
 * console.log(ex?.name); // 'Panca Piana con Bilanciere'
 * ```
 */
export function getExerciseById(id: string): Exercise | undefined {
  if (!id || id.trim().length === 0) {
    return undefined;
  }
  const normalizedId = id.trim().toLowerCase();
  return exercisesByIdMap.get(normalizedId);
}

/**
 * Restituisce l elenco di tutti gli esercizi che reclutano il muscolo specificato,
 * verificando il muscolo primario, i secondari e la lista generale dei muscoli coinvolti.
 *
 * @param muscle - Denominazione del muscolo da cercare (es. 'Quadricipiti', 'Gran Dorsale', 'Core')
 * @returns Array di esercizi che coinvolgono il muscolo indicato. Restituisce array vuoto se nessun match.
 *
 * @example
 * ```ts
 * const quadExercises = getExercisesByMuscle('Quadricipiti');
 * ```
 */
export function getExercisesByMuscle(muscle: string): Exercise[] {
  const normalizedMuscle = muscle.trim().toLowerCase();
  if (normalizedMuscle.length < MIN_SEARCH_QUERY_LENGTH) {
    return [];
  }

  return allExercises.filter((exercise: Exercise) => {
    const primaryMatches = exercise.primaryMuscle.toLowerCase().includes(normalizedMuscle);
    const secondaryMatches = exercise.secondaryMuscles?.some((m: string) =>
      m.toLowerCase().includes(normalizedMuscle)
    ) ?? false;
    const musclesMatches = exercise.muscles.some((m: string) =>
      m.toLowerCase().includes(normalizedMuscle)
    );

    return primaryMatches || secondaryMatches || musclesMatches;
  });
}

/**
 * Restituisce l elenco di tutti gli esercizi categorizzati con la qualità atletica richiesta.
 *
 * @param quality - Qualità atletica target ('Forza' | 'Ipertrofia' | 'Stabilità' | 'Potenza' | 'Resistenza')
 * @returns Array di esercizi che allenano prioritariamente la qualità specificata.
 *
 * @example
 * ```ts
 * const strengthExercises = getExercisesByQuality('Forza');
 * ```
 */
export function getExercisesByQuality(quality: ExerciseQuality): Exercise[] {
  return allExercises.filter((exercise: Exercise) => exercise.quality === quality);
}

/**
 * Restituisce l elenco di tutti gli esercizi compatibili con l attrezzatura indicata.
 *
 * @param equipment - Denominazione dell attrezzatura (es. 'Bilanciere', 'Manubri', 'Corpo Libero', 'Cavi', 'Macchine')
 * @returns Array di esercizi eseguibili con l attrezzatura specificata.
 *
 * @example
 * ```ts
 * const dumbbellExercises = getExercisesByEquipment('Manubri');
 * ```
 */
export function getExercisesByEquipment(equipment: string): Exercise[] {
  const normalizedEquipment = equipment.trim().toLowerCase();
  if (normalizedEquipment.length < MIN_SEARCH_QUERY_LENGTH) {
    return [];
  }

  return allExercises.filter((exercise: Exercise) =>
    exercise.equipment.toLowerCase().includes(normalizedEquipment)
  );
}

/**
 * Esegue una ricerca testuale full-text multi-termine nel catalogo degli esercizi.
 * Ispeziona nome (italiano ed inglese), muscoli, descrizione, attrezzatura e tag tematici.
 *
 * @param query - Stringa di ricerca inserita dall utente
 * @returns Array di esercizi corrispondenti a tutti i token della query. Restituisce array vuoto se query vuota.
 *
 * @example
 * ```ts
 * const results = searchExercises('panca manubri petto');
 * ```
 */
export function searchExercises(query: string): Exercise[] {
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length < MIN_SEARCH_QUERY_LENGTH) {
    return [];
  }

  const queryTokens = cleanQuery.split(/\s+/).filter((token: string) => token.length > 0);
  if (queryTokens.length === 0) {
    return [];
  }

  return allExercises.filter((exercise: Exercise) => {
    // Costruzione stringa unificata di ricerca per l esercizio
    const searchableContent = [
      exercise.name,
      exercise.nameEn ?? '',
      exercise.primaryMuscle,
      ...(exercise.secondaryMuscles ?? []),
      ...exercise.muscles,
      exercise.description,
      exercise.equipment,
      exercise.type,
      exercise.quality,
      exercise.level,
      ...(exercise.tags ?? []),
    ]
      .join(' ')
      .toLowerCase();

    // Tutti i token devono essere presenti nel contenuto dell esercizio (logica AND)
    return queryTokens.every(
      (token: string) => searchableContent.indexOf(token) !== MATCH_NOT_FOUND_INDEX
    );
  });
}

/**
 * Restituisce l elenco ordinato e deduplicato di tutti i gruppi muscolari censiti a catalogo.
 *
 * @returns Array di stringhe con i nomi dei gruppi muscolari univoci.
 */
export function getMuscleGroups(): string[] {
  const muscleSet = new Set<string>();
  for (const ex of allExercises) {
    if (ex.primaryMuscle) {
      muscleSet.add(ex.primaryMuscle);
    }
    for (const m of ex.muscles) {
      muscleSet.add(m);
    }
  }
  return Array.from(muscleSet).sort((a: string, b: string) => a.localeCompare(b, 'it'));
}

/**
 * Restituisce l elenco di tutte le qualità atletiche gestite dal sistema.
 *
 * @returns Array con i valori del tipo unione ExerciseQuality.
 */
export function getQualities(): ExerciseQuality[] {
  return ['Forza', 'Ipertrofia', 'Stabilità', 'Potenza', 'Resistenza'];
}

/**
 * Restituisce l elenco di tutti i livelli di competenza atletica previsti dal sistema.
 *
 * @returns Array con i valori del tipo unione ExerciseLevel.
 */
export function getLevels(): ExerciseLevel[] {
  return ['Principiante', 'Intermedio', 'Avanzato'];
}
