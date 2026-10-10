/**
 * src/hooks/useExerciseCatalog.ts
 * Custom Hook per la consultazione e il filtraggio del Catalogo Esercizi Scientifico.
 * Isola tutta la logica di ricerca, multi-filtro e paginazione dai componenti visivi (Regola R3).
 * Zero any: interfacce rigorose tipizzate da src/types/exercise.ts.
 */

import { useState, useMemo, useCallback } from 'react';
import { Exercise, ExerciseLevel, ExerciseQuality } from '../types/exercise';
import {
  getAllExercises,
  getMuscleGroups,
  getQualities,
  getLevels,
} from '../data/exercises/index';

export interface UseExerciseCatalogOptions {
  initialPageSize?: number;
  initialMuscle?: string;
  initialQuality?: string;
  initialLevel?: string;
  initialEquipment?: string;
}

export interface UseExerciseCatalogReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMuscle: string;
  setSelectedMuscle: (muscle: string) => void;
  selectedQuality: string;
  setSelectedQuality: (quality: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  selectedEquipment: string;
  setSelectedEquipment: (equipment: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  filteredExercises: Exercise[];
  paginatedExercises: Exercise[];
  totalCount: number;
  totalPages: number;
  muscles: string[];
  qualities: ExerciseQuality[];
  levels: ExerciseLevel[];
  equipments: string[];
  resetFilters: () => void;
}

const CANONICAL_EQUIPMENTS = [
  'Tutta',
  'Bilanciere',
  'Manubri',
  'Corpo Libero',
  'Macchine',
  'Cavi',
];

/**
 * Verifica se un esercizio soddisfa il filtro muscolare selezionato.
 * Supporta gruppi canonici (es. 'Pettorali', 'Quadricipiti', 'Glutei', 'Dorsali')
 * e singoli capi/distretti specifici (es. 'Capo Sternocostale', 'Gran Dorsale').
 *
 * @param exercise - Esercizio da valutare
 * @param selectedMuscle - Filtro muscolare selezionato
 * @returns true se l'esercizio corrisponde al filtro
 */
export function matchExerciseMuscle(exercise: Exercise, selectedMuscle: string): boolean {
  if (!selectedMuscle || selectedMuscle === 'Tutti') {
    return true;
  }

  const target = selectedMuscle.trim().toLowerCase();
  const primary = (exercise.primaryMuscle || '').toLowerCase();
  const allMuscles = [primary, ...(exercise.muscles || []).map((m) => m.toLowerCase())];

  // 1. Gruppo Pettorali
  if (target === 'pettorali' || target === 'petto') {
    return allMuscles.some((m) => m.includes('petto') || m.includes('pettoral'));
  }
  if (target.includes('clavicolar')) {
    return allMuscles.some((m) => m.includes('clavicolar'));
  }
  if (target.includes('sternocostal')) {
    return allMuscles.some((m) => m.includes('sternocostal'));
  }
  if (target.includes('pettorale minore')) {
    return allMuscles.some((m) => m.includes('minore') && m.includes('pettor'));
  }

  // 2. Gruppo Dorsali & Schiena
  if (target === 'dorsali' || target === 'dorsali & schiena' || target === 'schiena') {
    return allMuscles.some((m) =>
      ['dorsal', 'schiena', 'erettor', 'trapezio', 'romboid', 'sottospinat', 'rotondo'].some((k) =>
        m.includes(k)
      )
    );
  }
  if (target.includes('gran dorsale')) {
    return allMuscles.some((m) => m.includes('gran dorsale'));
  }
  if (target.includes('erettor')) {
    return allMuscles.some((m) => m.includes('erettor'));
  }
  if (target.includes('grande rotondo')) {
    return allMuscles.some((m) => m.includes('grande rotondo'));
  }
  if (target.includes('romboid')) {
    return allMuscles.some((m) => m.includes('romboid'));
  }
  if (target.includes('trapezio')) {
    return allMuscles.some((m) => m.includes('trapezio'));
  }
  if (target.includes('sottospinat')) {
    return allMuscles.some((m) => m.includes('sottospinat'));
  }

  // 3. Gruppo Spalle & Cingolo Scapolare
  if (target === 'spalle & cingolo scapolare' || target === 'deltoidi' || target === 'spalle') {
    return allMuscles.some((m) => m.includes('deltoid') || m.includes('spall') || m.includes('cuffia'));
  }
  if (target.includes('anteriore') && (target.includes('deltoid') || target.includes('spall'))) {
    return allMuscles.some((m) => m.includes('deltoide anteriore'));
  }
  if (target.includes('laterale') && (target.includes('deltoid') || target.includes('spall'))) {
    return allMuscles.some((m) => m.includes('deltoide laterale'));
  }
  if (target.includes('posteriore') && (target.includes('deltoid') || target.includes('spall'))) {
    return allMuscles.some((m) => m.includes('deltoide posteriore'));
  }
  if (target.includes('cuffia') || target.includes('rotator')) {
    return allMuscles.some((m) => m.includes('cuffia') || m.includes('rotator'));
  }

  // 4. Gruppo Arti Inferiori
  if (target === 'arti inferiori' || target === 'gambe') {
    return allMuscles.some((m) =>
      [
        'quadricipit',
        'vasto',
        'retto femorale',
        'ischiocrur',
        'femorale',
        'glute',
        'polpacc',
        'gastrocnemi',
        'soleo',
        'adduttor',
        'abduttor',
      ].some((k) => m.includes(k))
    );
  }
  if (target === 'quadricipiti' || target === 'quadricipite') {
    return allMuscles.some((m) =>
      m.includes('quadricipit') || m.includes('vasto') || m.includes('retto femorale')
    );
  }
  if (target === 'ischiocrurali' || target === 'femorali') {
    return allMuscles.some((m) => m.includes('ischiocrur') || m.includes('femorale'));
  }
  if (target === 'glutei' || target === 'gluteo') {
    return allMuscles.some((m) => m.includes('glute'));
  }
  if (target.includes('grande gluteo')) {
    return allMuscles.some((m) => m.includes('grande gluteo'));
  }
  if (target.includes('medio gluteo')) {
    return allMuscles.some((m) => m.includes('medio gluteo') || m.includes('gluteo medio'));
  }
  if (target === 'polpacci' || target === 'polpaccio') {
    return allMuscles.some((m) =>
      m.includes('polpacc') || m.includes('gastrocnemi') || m.includes('soleo') || m.includes('tibiale')
    );
  }
  if (target.includes('gastrocnemi')) {
    return allMuscles.some((m) => m.includes('gastrocnemi'));
  }
  if (target.includes('soleo')) {
    return allMuscles.some((m) => m.includes('soleo'));
  }
  if (target.includes('adduttor')) {
    return allMuscles.some((m) => m.includes('adduttor'));
  }
  if (target.includes('abduttor')) {
    return allMuscles.some((m) => m.includes('abduttor'));
  }

  // 5. Gruppo Braccia
  if (target === 'braccia') {
    return allMuscles.some((m) =>
      ['bicipit', 'tricipit', 'brachial', 'brachioradial', 'avambracc'].some((k) => m.includes(k))
    );
  }
  if (target === 'bicipiti' || target === 'bicipite' || target.includes('bicipite')) {
    if (target.includes('capo lungo')) {
      return allMuscles.some((m) => m.includes('bicipit') && m.includes('lungo'));
    }
    if (target.includes('capo breve')) {
      return allMuscles.some((m) => m.includes('bicipit') && m.includes('breve'));
    }
    return allMuscles.some((m) => m.includes('bicipit'));
  }
  if (target === 'tricipiti' || target === 'tricipite' || target.includes('tricipite')) {
    if (target.includes('capo lungo')) {
      return allMuscles.some((m) => m.includes('tricipit') && m.includes('lungo'));
    }
    if (target.includes('capo laterale')) {
      return allMuscles.some((m) => m.includes('tricipit') && m.includes('laterale'));
    }
    return allMuscles.some((m) => m.includes('tricipit'));
  }
  if (target.includes('brachial') || target.includes('brachioradial')) {
    return allMuscles.some((m) => m.includes('brachial') || m.includes('brachioradial'));
  }
  if (target.includes('avambracc') || target.includes('polso')) {
    return allMuscles.some((m) => m.includes('avambracc') || m.includes('polso') || m.includes('brachioradial'));
  }

  // 6. Gruppo Core & Tronco
  if (target === 'core & tronco' || target === 'core' || target === 'tronco') {
    return allMuscles.some((m) =>
      ['core', 'addom', 'obliqu', 'trasvers', 'lombar'].some((k) => m.includes(k))
    );
  }
  if (target.includes('retto addominale') || target.includes('retto dell')) {
    return allMuscles.some((m) => m.includes('retto dell') || m.includes('retto addominale'));
  }
  if (target.includes('obliqu')) {
    return allMuscles.some((m) => m.includes('obliqu'));
  }
  if (target.includes('trasvers')) {
    return allMuscles.some((m) => m.includes('trasvers') || m.includes('traverso'));
  }
  if (target.includes('lombar')) {
    return allMuscles.some((m) => m.includes('lombar') || m.includes('erettor'));
  }

  // Fallback: confronto per sottostringa
  return allMuscles.some((m) => m.includes(target) || target.includes(m));
}

export function useExerciseCatalog(
  options: UseExerciseCatalogOptions = {}
): UseExerciseCatalogReturn {
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [selectedMuscle, setSelectedMuscleState] = useState<string>(
    options.initialMuscle ?? 'Tutti'
  );
  const [selectedQuality, setSelectedQualityState] = useState<string>(
    options.initialQuality ?? 'Tutte'
  );
  const [selectedLevel, setSelectedLevelState] = useState<string>(
    options.initialLevel ?? 'Tutti'
  );
  const [selectedEquipment, setSelectedEquipmentState] = useState<string>(
    options.initialEquipment ?? 'Tutta'
  );
  const [page, setPageState] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(options.initialPageSize ?? 12);

  const allExercises = useMemo<Exercise[]>(() => getAllExercises(), []);
  const muscles = useMemo<string[]>(() => ['Tutti', ...getMuscleGroups()], []);
  const qualities = useMemo<ExerciseQuality[]>(() => getQualities(), []);
  const levels = useMemo<ExerciseLevel[]>(() => getLevels(), []);
  const equipments = useMemo<string[]>(() => CANONICAL_EQUIPMENTS, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setPageState(1);
  }, []);

  const setSelectedMuscle = useCallback((muscle: string) => {
    setSelectedMuscleState(muscle);
    setPageState(1);
  }, []);

  const setSelectedQuality = useCallback((quality: string) => {
    setSelectedQualityState(quality);
    setPageState(1);
  }, []);

  const setSelectedLevel = useCallback((level: string) => {
    setSelectedLevelState(level);
    setPageState(1);
  }, []);

  const setSelectedEquipment = useCallback((equipment: string) => {
    setSelectedEquipmentState(equipment);
    setPageState(1);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPageState(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQueryState('');
    setSelectedMuscleState('Tutti');
    setSelectedQualityState('Tutte');
    setSelectedLevelState('Tutti');
    setSelectedEquipmentState('Tutta');
    setPageState(1);
  }, []);

  const filteredExercises = useMemo<Exercise[]>(() => {
    const queryNorm = searchQuery.trim().toLowerCase();

    return allExercises.filter((exercise) => {
      // Filtro testuale (nome, nome inglese, muscoli, tags, descrizione)
      if (queryNorm) {
        const matchName = exercise.name.toLowerCase().includes(queryNorm);
        const matchNameEn = exercise.nameEn ? exercise.nameEn.toLowerCase().includes(queryNorm) : false;
        const matchMuscle = exercise.muscles.some((m) => m.toLowerCase().includes(queryNorm));
        const matchTags = exercise.tags ? exercise.tags.some((t) => t.toLowerCase().includes(queryNorm)) : false;
        const matchDesc = exercise.description.toLowerCase().includes(queryNorm);

        if (!matchName && !matchNameEn && !matchMuscle && !matchTags && !matchDesc) {
          return false;
        }
      }

      // Filtro muscolare
      if (selectedMuscle !== 'Tutti') {
        if (!matchExerciseMuscle(exercise, selectedMuscle)) {
          return false;
        }
      }

      // Filtro qualità atletica
      if (selectedQuality !== 'Tutte' && exercise.quality !== selectedQuality) {
        return false;
      }

      // Filtro livello atletico
      if (selectedLevel !== 'Tutti' && exercise.level !== selectedLevel) {
        return false;
      }

      // Filtro attrezzatura
      if (selectedEquipment !== 'Tutta') {
        const eqNorm = exercise.equipment.toLowerCase();
        const targetNorm = selectedEquipment.toLowerCase();
        let matches = eqNorm.includes(targetNorm);
        if (!matches) {
          if (targetNorm === 'corpo libero' && (eqNorm.includes('corpo') || eqNorm.includes('libero'))) {
            matches = true;
          } else if (targetNorm === 'macchine' && eqNorm.includes('macchin')) {
            matches = true;
          }
        }
        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }, [allExercises, searchQuery, selectedMuscle, selectedQuality, selectedLevel, selectedEquipment]);

  const totalCount = filteredExercises.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const paginatedExercises = useMemo<Exercise[]>(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredExercises.slice(startIndex, startIndex + pageSize);
  }, [filteredExercises, page, pageSize]);

  return {
    searchQuery,
    setSearchQuery,
    selectedMuscle,
    setSelectedMuscle,
    selectedQuality,
    setSelectedQuality,
    selectedLevel,
    setSelectedLevel,
    selectedEquipment,
    setSelectedEquipment,
    page,
    setPage,
    pageSize,
    setPageSize,
    filteredExercises,
    paginatedExercises,
    totalCount,
    totalPages,
    muscles,
    qualities,
    levels,
    equipments,
    resetFilters,
  };
}
