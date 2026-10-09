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
  stiffnessDeficitPct?: number;
  contractileFatiguePct?: number;
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

export type PotentiationClassification = 'Responder' | 'Non-Responder' | 'Negative Responder';

export interface PotentiationResponse {
  baseline: number;
  post: number;
  deltaAbsolute: number;
  deltaPercent: number;
  classification: PotentiationClassification;
  isResponder: boolean;
  cohenD?: number;
  effectSize?: string;
}

export interface PairedTTestResult {
  tStat: number;
  df: number;
  pValue: number;
  meanDiff: number;
  meanDifference?: number;
  sdDiff: number;
  isSignificant: boolean;
  cohenD: number;
  mdc95?: number;
}

export interface TwoSampleTTestResult {
  tStat: number;
  df: number;
  pValue: number;
  meanPre: number;
  meanPost: number;
  deltaPercent: number;
  isSignificant: boolean;
}

export interface HedgesGResult {
  g: number;
  d: number;
  correctionJ: number;
  pooledSD: number;
  effectSizeLabel?: 'Trascurabile' | 'Piccolo' | 'Medio' | 'Grande';
}

export interface PearsonCorrelationResult {
  r: number;
  rSquared: number;
  pValue: number;
  tStat: number;
  ci95: [number, number];
  isSignificant: boolean;
  n: number;
}

export interface LinearRegressionSimpleResult {
  slope: number;
  intercept: number;
  rSquared: number;
  tStat: number;
  pValue: number;
  n: number;
}

export interface CVResult {
  mean: number;
  sd: number;
  cvPercent: number;
  n: number;
}

export interface IntraSetDynamicsResult {
  cvRsi: number;
  cvTc: number;
  cvH: number;
  slopeRsi: number;
  pSlope: number;
  pattern: 'METRONOMICO' | 'ACCENSIONE_TARDIVA' | 'DECADIMENTO_FATICA' | 'DISPERSIVO' | 'NON_VALUTABILE';
  couplingR: number;
  couplingP: number;
  strategy: 'ELASTICA_REATTIVA' | 'STRATEGIA_DI_SPINTA' | 'NEUTRA';
  reboundCount: number;
}

export interface NeuromuscularProfileResult {
  eurRatio: number;
  eurPercent: number;
  classification: 'ELASTICO_DIPENDENTE' | 'FORZA_DIPENDENTE' | 'MISTO_BILANCIATO' | 'NON_DETERMINATO';
  hasConcentricDeficit: boolean;
  armsContributionCm: number;
  armsTransferQuality: 'ECCELLENTE_COORDINATIVO' | 'BUONO' | 'RIDOTTO_LIMITATO' | 'INVARIATO' | 'NON_DETERMINATO';
}

export interface PowerVsRsiMatrixResult {
  efficiencyMean: number;
  efficiencyPeak: number;
  relativePowerWkg: number;
  classification: string;
  rfdDeficitLevel: string;
  rationale: string;
}

export type PAPJumpType = 'SJ' | 'CMJ' | 'ABK' | 'DJ';

export interface PAPTrial {
  id: string;
  heightCm: number;
  contactTimeSec?: number;
}

export interface PAPPreset {
  id: string;
  name: string;
  description: string;
  jumpType: PAPJumpType;
  preTrials: Array<{ heightCm: number; contactTimeSec?: number }>;
  postTrials: Array<{ heightCm: number; contactTimeSec?: number }>;
}
