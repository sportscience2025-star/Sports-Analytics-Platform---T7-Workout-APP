/**
 * src/types/program.ts
 * Interfacce condivise per il Workout Generator (Programmazione & Periodizzazione).
 * Rispetta la Regola R1 (Divieto di any) e Regola R2 (Interfacce condivise).
 */

import { Exercise } from './exercise';
import { RiskAnalysisProfile } from './clinical';

export type PeriodizationMethod =
  | 'LINEAR'
  | 'DUP'
  | 'BLOCK'
  | 'CONJUGATE'
  | 'POLARIZED'
  | 'CLINICAL';

export interface FormattedExercise {
  id: string;
  name: string;
  category: 'Main' | 'Accessory' | 'Clinical' | 'Warmup' | 'Cooldown';
  sets: number;
  reps: number | string;
  loadPct1RM?: number;
  loadKg?: number;
  rpe: number;
  restSec: number;
  tempo: string;
  notes?: string;
  exerciseRef?: Exercise;
}

export interface WorkoutSession {
  dayName: string;
  focus: string;
  warmup: FormattedExercise[];
  exercises: FormattedExercise[];
  cooldown: FormattedExercise[];
  estimatedDurationMin: number;
}

export interface PhaseBlueprint {
  phaseIndex: number;
  name: string;
  durationWeeks: number;
  volumeTier: 'Basso' | 'Medio' | 'Alto';
  intensityPctRange: [number, number];
  rpeCap: number;
  kneeRomLimitDeg?: number;
  sessions: WorkoutSession[];
  weeklyFocus: string;
}

export interface ScientificRationale {
  athleteProfile: string;
  periodizationArchitecture: string;
  biomechanicalPrescriptions: string;
  vbtStrategy: string;
  citations: string[];
}

export interface WorkoutProgram {
  id: string;
  athleteName: string;
  sport: string;
  goal: string;
  durationWeeks: number;
  totalWeeks?: number;
  daysPerWeek?: number;
  periodizationMethod: PeriodizationMethod;
  riskProfile: RiskAnalysisProfile;
  phases: PhaseBlueprint[];
  rationale: ScientificRationale;
  ragMatchScore?: number;
  createdAt: string;
  generatedAt?: string;
  updatedAt?: string;
}

