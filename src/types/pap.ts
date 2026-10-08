/**
 * src/types/pap.ts
 * Interfacce condivise per il modulo Post-Activation Potentiation (PAP) e analisi salti.
 * Rispetta la Regola R1 (Divieto di any) e Regola R2 (Interfacce condivise).
 */

export type PAPStatus = 'POTENZIAMENTO_REALE' | 'FATICA_REALE' | 'INVARIATO';

export interface JumpMeasure {
  jumpNumber: number;
  flightTimeMs: number;
  contactTimeMs: number;
  heightCm: number;
  rsi: number;
}

export interface SingleJumpEvaluation {
  jumpType: 'SJ' | 'CMJ' | 'ABK';
  preHeightCm: number;
  postHeightCm: number;
  deltaPercent: number;
  mdcPercent: number;
  isRealChange: boolean;
  classification: 'Potenziamento Reale' | 'Fatica Reale' | 'Invariato (Rumore di Misura)';
}

export interface RSIDecomposition {
  deltaRsiPct: number;
  deltaTcPct: number;
  deltaHeightPct: number;
  mechanism:
    | 'Potenziamento d\'impulso'
    | 'Fatica da stiffness'
    | 'Fatica contrattile'
    | 'Fatica combinata / mista'
    | 'Compensazione di spinta'
    | 'Stabile';
  interpretation: string;
}

export interface StudentTTestResult {
  tValue: number;
  pValue: number;
  degreesOfFreedom: number;
  isSignificant: boolean;
  hedgesG: number;
  effectSizeLabel: 'Trascurabile' | 'Piccolo' | 'Medio' | 'Grande';
}

export interface PAPAthleteDiagnosis {
  athlete: string;
  status: PAPStatus;
  primaryMechanism: string;
  singleJumps: SingleJumpEvaluation[];
  rsiDecomposition?: RSIDecomposition;
  inferentialStats?: StudentTTestResult;
  recommendation: string;
}

export interface PAPCohortSummary {
  totalAthletes: number;
  respondersCount: number;
  fatigueCount: number;
  neutralCount: number;
  responderPercent: number;
  dominantTrend: string;
}
