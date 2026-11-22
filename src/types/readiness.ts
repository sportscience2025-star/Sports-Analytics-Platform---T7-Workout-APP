/**
 * src/types/readiness.ts
 * Neuroscienze dello Sport, PVT-B (3-min), Z-Score MAD e Triage Pre-Sessione.
 * Conforme a ZONA 4 (Flowchart 15 Readiness Section), ADR-01 (Thin Client) e Regola 02.
 */

import { Milliseconds, Seconds } from './physics';

// Costanti Scientifiche Validate PVT-B (Basner & Dinges, 2011)
export const PVTB_LAPSE_THRESHOLD_MS = 355 as Milliseconds;
export const PVTB_FALSE_START_THRESHOLD_MS = 100 as Milliseconds;
export const PVTB_MAX_VALID_RT_MS = 2000 as Milliseconds;
export const PVTB_STANDARD_TEST_DURATION_SEC = 180 as Seconds; // 3 minuti

// Costanti Statistica Robusta (Rousseeuw & Croux)
export const MAD_NORMAL_CONSISTENCY_CONSTANT = 1.4826;
export const BASELINE_ROLLING_WINDOW_DAYS = 28; // 4 microcicli standard

export type TestingContext = 'morning_fasted' | 'pre_session_acute';

export type InjuryAlertLevel =
  | 'optimal'
  | 'moderate_monitor'
  | 'high_fatigue_overload'
  | 'clinical_restriction';

export interface PvtBMetrics {
  testTimestamp: string;
  context: TestingContext;
  totalStimuliCount: number;
  validResponsesCount: number;
  medianRtMs: Milliseconds;
  mean10PercentFastestMs: Milliseconds;
  mean10PercentSlowestMs: Milliseconds;
  meanSpeedInvRt: number; // 1 / RT (1/s)
  lapsesCount: number; // RT > 355 ms
  falseStartsCount: number; // RT < 100 ms
  intraIndividualVariabilityMs: Milliseconds;
  isTestValid: boolean;
}

export interface DecoupledSubScores {
  sleepScore: number; // 0 - 100
  hrvRmssdScore: number; // 0 - 100
  neuromuscularScore: number; // 0 - 100 (da PVT-B o CMJ)
  workloadBalanceScore: number; // 0 - 100 (ACWR EWMA)
  subjectiveWellnessScore: number; // 0 - 100 (Hooper Index)
}

export interface RobustZScoreWindow {
  metricName: string;
  median: number;
  medianAbsoluteDeviation: number;
  robustZScore: number; // (x - median) / (MAD * 1.4826)
  windowDays: number;
}

export interface TrainingReadinessComposite {
  athleteId: string;
  date: string;
  compositeScore: number; // Indice ponderato 0 - 100
  subScores: DecoupledSubScores;
  alertLevel: InjuryAlertLevel;
  pvtMetrics?: PvtBMetrics;
  calculatedZScores?: readonly RobustZScoreWindow[];
  recommendationSummary: string;
}

export interface InjuryRiskEvaluation {
  athleteId: string;
  evaluationDate: string;
  alertLevel: InjuryAlertLevel;
  hasRedFlags: boolean;
  twoPhaseRationalePercentage: number; // AI Rationale limitata (es. 70%)
  contributingRiskFactors: readonly string[];
  medicalReviewRequired: boolean;
}
