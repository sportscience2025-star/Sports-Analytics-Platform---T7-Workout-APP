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
  getLevels
} from '../data/exercises/index';

export interface UseExerciseCatalogOptions {
  initialPageSize?: number;
  initialMuscle?: string;
  initialQuality?: string;
  initialLevel?: string;
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
  resetFilters: () => void;
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
  const [page, setPageState] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(options.initialPageSize ?? 6);

  const allExercises = useMemo<Exercise[]>(() => getAllExercises(), []);
  const muscles = useMemo<string[]>(() => ['Tutti', ...getMuscleGroups()], []);
  const qualities = useMemo<ExerciseQuality[]>(() => getQualities(), []);
  const levels = useMemo<ExerciseLevel[]>(() => getLevels(), []);

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
        const matchesPrimary = exercise.primaryMuscle.toLowerCase() === selectedMuscle.toLowerCase();
        const matchesSecondary = exercise.muscles.some(
          (m) => m.toLowerCase() === selectedMuscle.toLowerCase()
        );
        if (!matchesPrimary && !matchesSecondary) {
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

      return true;
    });
  }, [allExercises, searchQuery, selectedMuscle, selectedQuality, selectedLevel]);

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
    resetFilters
  };
}
