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

/**
 * Stato di Energy Availability secondo il Consensus Statement IOC su REDs:
 * - `'optimal'`: >= OPTIMAL_EA_THRESHOLD_KCAL_KG_FFM (45.0 kcal/kg FFM/die)
 * - `'suboptimal'`: compreso tra LEA_THRESHOLD_KCAL_KG_FFM (30.0) e 45.0 kcal/kg FFM/die
 * - `'high_risk_reds'`: < LEA_THRESHOLD_KCAL_KG_FFM (30.0 kcal/kg FFM/die, Low Energy Availability severa)
 */
export type EnergyAvailabilityStatus =
  | 'optimal'
  | 'suboptimal'
  | 'high_risk_reds';

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

/**
 * Alias di contratto per le metriche bioimpedenziometriche BIVA (IMPLEMENTATION_ROADMAP).
 */
export type BiaMetrics = BiaVectorMetrics;

/**
 * Singolo slot/pasto giornaliero all'interno di un piano nutrizionale o guida educativa.
 */
export interface MealSlot {
  id: string;
  slotLabel: string; // es. 'Colazione', 'Pre-Allenamento', 'Post-Allenamento'
  scheduledTime24h: string; // Formato HH:mm (es. '08:00')
  energyKcal?: number;
  proteinGrams?: number;
  carbohydratesGrams?: number;
  fatGrams?: number;
  fluidTargetLiters?: number;
  rehydrationRatioApplied?: number; // Compreso tra REHYDRATION_RATIO_MIN (1.2) e REHYDRATION_RATIO_MAX (1.5)
  containsCaffeine: boolean;
  caffeineCurfewHour24h: number; // Default CAFFEINE_CURFEW_HOUR_24H (16)
  notes?: string;
}

/**
 * Piano nutrizionale o guida educativa alimentare conforme ad Art. 348 c.p.
 * I piani di tipo `'grammed_clinical'` richiedono un ruolo sanitario abilitato (`LegalNutritionRole` clinico).
 */
export interface MealPlan {
  id: string;
  athleteId: string;
  title: string;
  date: string;
  dietaryPattern: DietaryPattern;
  planType: MealPlanType;
  prescribedByRole: LegalNutritionRole;
  prescribedByUserId: string;
  dailyEnergyTargetKcal?: number;
  targetBodyMassKg?: Kilograms;
  rehydrationRatioRange: readonly [typeof REHYDRATION_RATIO_MIN, typeof REHYDRATION_RATIO_MAX];
  caffeineCurfewHour24h: typeof CAFFEINE_CURFEW_HOUR_24H;
  slots: readonly MealSlot[];
  notes?: string;
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
