/**
 * src/hooks/useFavorites.ts
 * Custom Hook per la gestione reattiva degli Esercizi Preferiti e degli Esercizi Custom.
 * Isola lo stato e la persistenza in localStorage dai componenti UI (Regola R3).
 * Rispetta la Regola R1 (Zero any) e Regola R2 (Interfacce da src/types/exercise.ts).
 */

import { useState, useEffect, useCallback } from 'react';
import type { Exercise } from '../types/exercise';

const STORAGE_KEY_FAVORITES = 't7_favorites';
const STORAGE_KEY_CUSTOM = 't7_custom_exercises';

export interface UseFavoritesReturn {
  favoriteIds: string[];
  favoritesCount: number;
  customExercises: Exercise[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  addCustomExercise: (exercise: Exercise) => void;
  deleteCustomExercise: (id: string) => void;
  getFavoriteExercises: (allCatalogExercises: Exercise[]) => Exercise[];
}

/**
 * Hook per interagire con i preferiti salvati e gli esercizi creati dall'utente.
 */
export function useFavorites(): UseFavoritesReturn {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [customExercises, setCustomExercises] = useState<Exercise[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM);
      return stored ? (JSON.parse(stored) as Exercise[]) : [];
    } catch {
      return [];
    }
  });

  // Salva i preferiti su localStorage ad ogni variazione
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favoriteIds));
    } catch {
      // Ignora errori di quota storage
    }
  }, [favoriteIds]);

  // Salva gli esercizi custom su localStorage ad ogni variazione
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customExercises));
    } catch {
      // Ignora errori di quota storage
    }
  }, [customExercises]);

  /**
   * Verifica se un determinato ID esercizio appartiene alla lista dei preferiti.
   */
  const isFavorite = useCallback(
    (id: string): boolean => {
      if (!id) return false;
      return favoriteIds.includes(id);
    },
    [favoriteIds]
  );

  /**
   * Alterna lo stato di preferito per l'esercizio indicato.
   */
  const toggleFavorite = useCallback((id: string): void => {
    if (!id) return;
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  /**
   * Aggiunge un esercizio ai preferiti se non già presente.
   */
  const addFavorite = useCallback((id: string): void => {
    if (!id) return;
    setFavoriteIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  /**
   * Rimuove un esercizio dai preferiti.
   */
  const removeFavorite = useCallback((id: string): void => {
    if (!id) return;
    setFavoriteIds((prev) => prev.filter((item) => item !== id));
  }, []);

  /**
   * Aggiunge un esercizio personalizzato all'elenco locale e persistente.
   */
  const addCustomExercise = useCallback((exercise: Exercise): void => {
    if (!exercise || !exercise.id) return;
    setCustomExercises((prev) => {
      const filtered = prev.filter((ex) => ex.id !== exercise.id);
      return [...filtered, exercise];
    });
  }, []);

  /**
   * Elimina un esercizio personalizzato per ID.
   */
  const deleteCustomExercise = useCallback((id: string): void => {
    if (!id) return;
    setCustomExercises((prev) => prev.filter((ex) => ex.id !== id));
  }, []);

  /**
   * Restituisce l'elenco completo degli oggetti Exercise preferiti,
   * combinando sia il catalogo di sistema sia gli esercizi custom.
   */
  const getFavoriteExercises = useCallback(
    (allCatalogExercises: Exercise[]): Exercise[] => {
      const merged = [...allCatalogExercises, ...customExercises];
      const favMap = new Map<string, Exercise>();
      merged.forEach((ex) => {
        if (favoriteIds.includes(ex.id)) {
          favMap.set(ex.id, ex);
        }
      });
      return Array.from(favMap.values());
    },
    [favoriteIds, customExercises]
  );

  return {
    favoriteIds,
    favoritesCount: favoriteIds.length,
    customExercises,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    addCustomExercise,
    deleteCustomExercise,
    getFavoriteExercises,
  };
}
