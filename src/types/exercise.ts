/**
 * src/types/exercise.ts
 * Interfacce condivise per il dominio Esercizi (Single Source of Truth).
 * Rispetta la Regola R1 (Divieto di any) e Regola R2 (Interfacce condivise).
 */

export type ExerciseLevel = 'Principiante' | 'Intermedio' | 'Avanzato' | 'Elite/Pro';
export type ExerciseType = 'Multiarticolare' | 'Isolamento' | 'Isometrico';
export type ExerciseQuality = 'Forza' | 'Ipertrofia' | 'Stabilità' | 'Potenza' | 'Resistenza';

export interface CommonError {
  error: string;
  why: string;
  fix: string;
}

export interface ExecutionGuide {
  context?: string;
  setup?: string[];
  steps: string[];
  cues?: string[];
  criteria?: string[];
}

export interface Exercise {
  id: string;
  name: string;
  nameEn?: string;
  primaryMuscle: string;
  secondaryMuscles?: string[];
  muscles: string[];
  type: ExerciseType;
  level: ExerciseLevel;
  equipment: string;
  variants?: string[];
  quality: ExerciseQuality;
  execution: ExecutionGuide;
  errors: CommonError[];
  description: string;
  tags?: string[];
}
