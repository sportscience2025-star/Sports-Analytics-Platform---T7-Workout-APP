/**
 * src/types/nutrition.ts
 * Composizione Corporea, Antropometria, Jackson-Pollock, BIVA Vettoriale ed Energy Availability.
 * Piena conformita all'ADR-01 (Thin Client), Art. 348 c.p. e linee guida IOC su REDs.
 * Conforme a Regola 02 (un file = una responsabilita, costanti in MAIUSCOLO).
 */

import { Kilograms, Degrees } from './physics';

// Costanti Energy Availability & REDs (IOC Consensus Statement)
export const LEA_THRESHOLD_KCAL_KG_FFM = 30.0;
export const OPTIMAL_EA_THRESHOLD_KCAL_KG_FFM = 45.0;

// Costanti Tasso di Sudorazione e Reidratazione
export const REHYDRATION_RATIO_MIN = 1.2;
export const REHYDRATION_RATIO_MAX = 1.5;

// Orario limite assunzione caffeina (tutela sonno atleti)
export const CAFFEINE_CURFEW_HOUR_24H = 16;

export type EnergyAvailabilityStatus =
  | 'optimal'
  | 'suboptimal'
  | 'low_risk_reds';

export type BivaHydrationStatus =
  | 'dehydrated'
  | 'euhydrated'
  | 'hyperhydrated';

export type BivaCellIntegrityStatus =
  | 'depleted_cell_mass'
  | 'normal_cell_mass'
  | 'high_athletic_cell_mass';

export type ToleranceEllipsePercentile =
  | 'percentile_50'
  | 'percentile_75'
  | 'percentile_95'
  | 'outside_95';

export type DietaryPattern =
  | 'omnivorous'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian';

export type LegalNutritionRole =
  | 'clinical_nutritionist'
  | 'dietitian'
  | 'sports_doctor'
  | 'strength_coach'
  | 'personal_trainer';

export type MealPlanType =
  | 'grammed_clinical'
  | 'educational_portions_timing';

// Discriminated Union Plicometria Jackson-Pollock per Rigore Anatomico
export interface JacksonPollock3Male {
  protocol: 'jp3_male';
  chestMm: number;
  abdomenMm: number;
  thighMm: number;
}

export interface JacksonPollock3Female {
  protocol: 'jp3_female';
  tricepsMm: number;
  suprailiacMm: number;
  thighMm: number;
}

export interface JacksonPollock7 {
  protocol: 'jp7';
  chestMm: number;
  midaxillaryMm: number;
  tricepsMm: number;
  subscapularMm: number;
  abdomenMm: number;
  suprailiacMm: number;
  thighMm: number;
}

export type SkinfoldAssessment =
  | JacksonPollock3Male
  | JacksonPollock3Female
  | JacksonPollock7;

export interface BiaVectorMetrics {
  resistanceOhms: number; // R (Ohm)
  reactanceOhms: number; // Xc (Ohm)
  heightNormalizedResistanceOhmsPerMeter: number; // R/H (Ohm/m)
  heightNormalizedReactanceOhmsPerMeter: number; // Xc/H (Ohm/m)
  phaseAngleDegrees: Degrees; // phi in gradi
  impedanceVectorLengthOhmsPerMeter: number; // |Z|/H
  hydrationStatus: BivaHydrationStatus;
  cellIntegrityStatus: BivaCellIntegrityStatus;
  toleranceEllipse: ToleranceEllipsePercentile;
}

export interface EnergyAvailabilityRecord {
  athleteId: string;
  date: string;
  energyIntakeKcal: number;
  exerciseEnergyExpenditureKcal: number;
  fatFreeMassKg: Kilograms;
  energyAvailabilityValue: number; // (EI - EEE) / FFM (kcal/kg FFM/die)
  status: EnergyAvailabilityStatus;
}

export interface BodyMetricsEntry {
  id: string;
  athleteId: string;
  date: string;
  weightKg: Kilograms;
  heightCm: number;
  bmi: number;
  waistCircumferenceCm?: number;
  hipCircumferenceCm?: number;
  armCircumferenceCm?: number;
  thighCircumferenceCm?: number;
  fatMassPercentage?: number;
  fatMassKg?: Kilograms;
  fatFreeMassKg?: Kilograms;
  ffmi?: number; // Fat-Free Mass Index: FFM / (Height in m)^2
  skinfold?: SkinfoldAssessment;
  biva?: BiaVectorMetrics;
  notes?: string;
}

export interface DopingBatchCheck {
  id: string;
  supplementName: string;
  batchNumber: string;
  certifyingBody: 'Informed_Sport' | 'Cologne_List' | 'NSF_Certified_for_Sport' | 'None';
  isCertifiedClean: boolean;
  verificationDate: string;
  notes?: string;
}
