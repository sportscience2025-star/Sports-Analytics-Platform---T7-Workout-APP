/**
 * src/physics/pap-stats-engine.ts
 * Motore di Calcolo Biomeccanico e Statistico per Protocolli PAP (Post-Activation Potentiation) e Analisi Salto.
 *
 * Implementa algoritmi basati sulla letteratura scientifica:
 * - Minimal Detectable Change (MDC 95%) per salti verticali (Markovic et al., Heishman et al.).
 * - Scomposizione biomeccanica dell'RSI (Reactive Strength Index).
 * - Statistica inferenziale: t-test di Student (appaiato e indipendente), Cohen's d e Hedges' g corretto.
 * - Profilazione neuromuscolare (EUR, transfer braccia ABK-CMJ, deficit RFD precoce).
 *
 * Rispetta le regole TypeScript strict:
 * - Regola R1: Zero `any`.
 * - Regola R2: Tipi e interfacce condivise da `src/types/pap.ts`.
 */

import type {
  SingleJumpEvaluation,
  RSIDecomposition,
  StudentTTestResult,
  PotentiationClassification,
  PotentiationResponse,
  PairedTTestResult,
  TwoSampleTTestResult,
  HedgesGResult,
  PearsonCorrelationResult,
  LinearRegressionSimpleResult,
  CVResult,
  IntraSetDynamicsResult,
  NeuromuscularProfileResult,
  PowerVsRsiMatrixResult
} from '../types/pap';

// ============================================================================
// COSTANTI METROLOGICHE E STATISTICHE DI RIFERIMENTO
// ============================================================================

export const MDC_SJ_PERCENT = 5.4;
export const MDC_CMJ_PERCENT = 6.8;
export const MDC_ABK_PERCENT = 8.0;
export const MDC_EUR_PP_THRESHOLD = 10.0;
export const MDC_ARMS_DELTA_CM = 5.50;

export const EUR_HIGH_ELASTIC_THRESHOLD = 1.15;
export const EUR_BALANCED_LOW_THRESHOLD = 1.05;
export const CONCENTRIC_DEFICIT_SJ_CUTOFF_CM = 38.0;

export const CV_METRONOMIC_LIMIT_PERCENT = 6.5;
export const CV_DISPERSIVE_LIMIT_PERCENT = 8.5;
export const COUPLING_PUSH_R_THRESHOLD = 0.60;
export const SIGNIFICANCE_ALPHA = 0.05;
export const LATE_ACTIVATION_P_LIMIT = 0.06;

export const Z_SCORE_95 = 1.96;
export const SQRT_TWO = 1.4142135623730951;
export const BETACF_MAX_ITER = 100;
export const BETACF_EPSILON = 1e-7;
export const BETACF_FPMIN = 1e-30;
export const SMALL_SAMPLE_HEDGES_OFFSET = 9;

export const SAYERS_SJ_HEIGHT_COEFF = 60.7;
export const SAYERS_SJ_MASS_COEFF = 45.3;
export const SAYERS_SJ_CONSTANT = 2055.0;

export const HIGH_POWER_WKG_THRESHOLD = 13.5;
export const LOW_POWER_WKG_THRESHOLD = 12.5;
export const LOW_RSI_THRESHOLD = 1.60;
export const HEAVY_BODY_MASS_CUTOFF_KG = 80.0;

export const POTENTIATION_THRESHOLD_PERCENT = 2.5;
export const COHEN_D_TRIVIAL = 0.2;
export const COHEN_D_SMALL = 0.5;
export const COHEN_D_MEDIUM = 0.8;

// ============================================================================
// FUNZIONI MATEMATICHE E DISTRIBUZIONI STATISTICHE AUSILIARIE
// ============================================================================

/**
 * Frazione continua incompleta di Gauss/Lentz per il calcolo della funzione Beta.
 *
 * @param a - Parametro forma a.
 * @param b - Parametro forma b.
 * @param x - Argomento x in (0, 1).
 * @returns Valore della frazione continua.
 */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;
  let c = 1.0;
  let d = 1.0 - (qab * x) / qap;
  if (Math.abs(d) < BETACF_FPMIN) d = BETACF_FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= BETACF_MAX_ITER; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < BETACF_FPMIN) d = BETACF_FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < BETACF_FPMIN) c = BETACF_FPMIN;
    d = 1.0 / d;
    h *= d * c;

    aa = -((a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < BETACF_FPMIN) d = BETACF_FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < BETACF_FPMIN) c = BETACF_FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1.0) <= BETACF_EPSILON) break;
  }
  return h;
}

/**
 * Approssimazione di Lanczos per il logaritmo naturale della funzione Gamma (lgamma).
 *
 * @param z - Argomento reale positivo.
 * @returns Valore ln(Gamma(z)).
 */
function logGamma(z: number): number {
  const coefficients = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953
  ];
  const x = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < coefficients.length; j++) {
    ser += coefficients[j] / (x + 1.0 + j);
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

/**
 * Funzione Beta incompleta regolarizzata I_x(a, b).
 *
 * @param a - Parametro forma a.
 * @param b - Parametro forma b.
 * @param x - Argomento x in [0, 1].
 * @returns Valore cumulativo in [0, 1].
 */
function incompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0.0) return 0.0;
  if (x >= 1.0) return 1.0;

  const logBeta = logGamma(a + b) - logGamma(a) - logGamma(b);
  const bt = Math.exp(logBeta + a * Math.log(x) + b * Math.log(1.0 - x));

  if (x < (a + 1.0) / (a + b + 2.0)) {
    return (bt * betaContinuedFraction(a, b, x)) / a;
  } else {
    return 1.0 - (bt * betaContinuedFraction(b, a, 1.0 - x)) / b;
  }
}

// ============================================================================
// STATISTICA DESCRITTIVA ED INFERENZIALE
// ============================================================================

/**
 * Calcola la media aritmetica, deviazione standard campionaria (N-1) e Coefficiente di Variazione (CV%).
 *
 * @param values - Vettore numerico di campioni.
 * @returns Oggetto CVResult con media, sd, cvPercent e n.
 */
export function calculateCV(values: number[]): CVResult {
  if (!Array.isArray(values) || values.length === 0) {
    return { mean: 0, sd: 0, cvPercent: 0, n: 0 };
  }

  const validValues = values.filter((v) => typeof v === 'number' && isFinite(v));
  const n = validValues.length;
  if (n === 0) {
    return { mean: 0, sd: 0, cvPercent: 0, n: 0 };
  }

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  if (n === 1) {
    return { mean: parseFloat(mean.toFixed(4)), sd: 0, cvPercent: 0, n: 1 };
  }

  const varianceSum = validValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const sd = Math.sqrt(varianceSum / (n - 1));
  const cvPercent = mean !== 0 ? (sd / Math.abs(mean)) * 100 : 0;

  return {
    mean: parseFloat(mean.toFixed(4)),
    sd: parseFloat(sd.toFixed(4)),
    cvPercent: parseFloat(cvPercent.toFixed(2)),
    n
  };
}

/**
 * Calcola il p-value a due code della distribuzione t di Student dato il valore t e i gradi di libertà (df).
 *
 * @param tStat - Statistica test t di Student.
 * @param df - Gradi di libertà (deve essere > 0).
 * @returns P-value a due code compreso tra 0 e 1.
 */
export function calculateStudentPValue(tStat: number, df: number): number {
  if (typeof tStat !== 'number' || isNaN(tStat) || typeof df !== 'number' || df <= 0) {
    return 1.0;
  }
  const absT = Math.abs(tStat);
  const x = df / (df + absT * absT);
  const p = incompleteBeta(df / 2.0, 0.5, x);
  return Math.max(0.0, Math.min(1.0, parseFloat(p.toFixed(5))));
}

/**
 * Calcola la regressione lineare ordinaria (OLS) y = slope * x + intercept.
 * Include la statistica t e il p-value della pendenza.
 *
 * @param xValues - Vettore indipendente X.
 * @param yValues - Vettore dipendente Y.
 * @returns Risultato di regressione LinearRegressionSimpleResult.
 */
export function linearRegression(xValues: number[], yValues: number[]): LinearRegressionSimpleResult {
  if (
    !Array.isArray(xValues) ||
    !Array.isArray(yValues) ||
    xValues.length < 2 ||
    xValues.length !== yValues.length
  ) {
    return { slope: 0, intercept: 0, rSquared: 0, pValue: 1.0, tStat: 0, n: 0 };
  }

  const n = xValues.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumXX += xValues[i] * xValues[i];
  }

  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-12) {
    return { slope: 0, intercept: sumY / n, rSquared: 0, pValue: 1.0, tStat: 0, n };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yPred = slope * xValues[i] + intercept;
    ssTot += Math.pow(yValues[i] - yMean, 2);
    ssRes += Math.pow(yValues[i] - yPred, 2);
  }

  const rSquared = ssTot > 1e-12 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const df = n - 2;
  let tStat = 0;
  let pValue = 1.0;

  if (df > 0 && ssTot > 1e-12) {
    const sResidual = Math.sqrt(ssRes / df);
    const sSlope = sResidual / Math.sqrt(sumXX - (sumX * sumX) / n);
    if (sSlope > 1e-12) {
      tStat = slope / sSlope;
      pValue = calculateStudentPValue(tStat, df);
    }
  }

  return {
    slope: parseFloat(slope.toFixed(5)),
    intercept: parseFloat(intercept.toFixed(5)),
    rSquared: parseFloat(rSquared.toFixed(4)),
    tStat: parseFloat(tStat.toFixed(4)),
    pValue,
    n
  };
}

/**
 * Calcola il coefficiente di correlazione di Pearson (r), R^2, p-value e Intervallo di Confidenza al 95% (Fisher z).
 *
 * @param xValues - Vettore X.
 * @param yValues - Vettore Y.
 * @returns Oggetto PearsonCorrelationResult.
 */
export function calculatePearsonCorrelation(
  xValues: number[],
  yValues: number[]
): PearsonCorrelationResult {
  if (
    !Array.isArray(xValues) ||
    !Array.isArray(yValues) ||
    xValues.length < 3 ||
    xValues.length !== yValues.length
  ) {
    return { r: 0, rSquared: 0, pValue: 1.0, tStat: 0, ci95: [0, 0], isSignificant: false, n: 0 };
  }

  const n = xValues.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumXX += xValues[i] * xValues[i];
    sumYY += yValues[i] * yValues[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denomX = n * sumXX - sumX * sumX;
  const denomY = n * sumYY - sumY * sumY;

  if (denomX <= 0 || denomY <= 0) {
    return { r: 0, rSquared: 0, pValue: 1.0, tStat: 0, ci95: [0, 0], isSignificant: false, n };
  }

  const r = numerator / Math.sqrt(denomX * denomY);
  const clampedR = Math.max(-0.9999, Math.min(0.9999, r));
  const rSquared = clampedR * clampedR;

  const df = n - 2;
  const tStat = (clampedR * Math.sqrt(df)) / Math.sqrt(1 - clampedR * clampedR);
  const pValue = calculateStudentPValue(tStat, df);

  // Trasformazione di Fisher z per intervallo di confidenza al 95%
  const z = 0.5 * Math.log((1 + clampedR) / (1 - clampedR));
  const seZ = 1.0 / Math.sqrt(n - 3);
  const zLower = z - Z_SCORE_95 * seZ;
  const zUpper = z + Z_SCORE_95 * seZ;
  const rLower = (Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1);
  const rUpper = (Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1);

  const isSignificant = pValue < SIGNIFICANCE_ALPHA && !(rLower < 0 && rUpper > 0);

  return {
    r: parseFloat(clampedR.toFixed(4)),
    rSquared: parseFloat(rSquared.toFixed(4)),
    pValue,
    tStat: parseFloat(tStat.toFixed(4)),
    ci95: [parseFloat(rLower.toFixed(3)), parseFloat(rUpper.toFixed(3))],
    isSignificant,
    n
  };
}

/**
 * Calcola l'Effect Size Cohen's d ed etichetta qualitativa da medie e pooled standard deviation.
 *
 * @param meanPre - Media serie PRE.
 * @param meanPost - Media serie POST.
 * @param pooledSD - Deviazione standard combinata.
 * @returns Oggetto con d e label qualitativa.
 */
export function calculateCohensD(
  meanPre: number,
  meanPost: number,
  pooledSD: number
): { d: number; label: 'Trascurabile' | 'Piccolo' | 'Medio' | 'Grande' } {
  if (pooledSD <= 1e-9) {
    return { d: 0, label: 'Trascurabile' };
  }
  const d = (meanPost - meanPre) / pooledSD;
  const absD = Math.abs(d);

  let label: 'Trascurabile' | 'Piccolo' | 'Medio' | 'Grande';
  if (absD < COHEN_D_TRIVIAL) label = 'Trascurabile';
  else if (absD < COHEN_D_SMALL) label = 'Piccolo';
  else if (absD < COHEN_D_MEDIUM) label = 'Medio';
  else label = 'Grande';

  return { d: parseFloat(d.toFixed(4)), label };
}

/**
 * Calcola la dimensione dell'effetto Hedges' g tra due serie indipendenti o pre-post,
 * applicando il fattore correttivo per piccoli campioni J.
 *
 * @param samplePre - Serie PRE.
 * @param samplePost - Serie POST.
 * @returns Risultato HedgesGResult con g, d, fattore J e deviazione standard pooled.
 */
export function calculateHedgesG(samplePre: number[], samplePost: number[]): HedgesGResult {
  const preStats = calculateCV(samplePre);
  const postStats = calculateCV(samplePost);

  const n1 = preStats.n;
  const n2 = postStats.n;

  if (n1 < 2 || n2 < 2) {
    return { g: 0, d: 0, correctionJ: 1.0, pooledSD: 0, effectSizeLabel: 'Trascurabile' };
  }

  const df = n1 + n2 - 2;
  const s1Sq = Math.pow(preStats.sd, 2);
  const s2Sq = Math.pow(postStats.sd, 2);
  const pooledVar = ((n1 - 1) * s1Sq + (n2 - 1) * s2Sq) / df;
  const pooledSD = Math.sqrt(pooledVar);

  if (pooledSD <= 1e-9) {
    return { g: 0, d: 0, correctionJ: 1.0, pooledSD: 0, effectSizeLabel: 'Trascurabile' };
  }

  const cohenD = (postStats.mean - preStats.mean) / pooledSD;
  const correctionJ = 1.0 - 3.0 / (4.0 * (n1 + n2) - SMALL_SAMPLE_HEDGES_OFFSET);
  const hedgesG = cohenD * correctionJ;
  const absG = Math.abs(hedgesG);

  let effectSizeLabel: 'Trascurabile' | 'Piccolo' | 'Medio' | 'Grande';
  if (absG < COHEN_D_TRIVIAL) effectSizeLabel = 'Trascurabile';
  else if (absG < COHEN_D_SMALL) effectSizeLabel = 'Piccolo';
  else if (absG < COHEN_D_MEDIUM) effectSizeLabel = 'Medio';
  else effectSizeLabel = 'Grande';

  return {
    g: parseFloat(hedgesG.toFixed(4)),
    d: parseFloat(cohenD.toFixed(4)),
    correctionJ: parseFloat(correctionJ.toFixed(4)),
    pooledSD: parseFloat(pooledSD.toFixed(4)),
    effectSizeLabel
  };
}

/**
 * Esegue il test t di Student per due campioni indipendenti.
 *
 * @param samplePre - Serie PRE.
 * @param samplePost - Serie POST.
 * @returns Risultato TwoSampleTTestResult.
 */
export function calculateTwoSampleTTest(
  samplePre: number[],
  samplePost: number[]
): TwoSampleTTestResult {
  const preStats = calculateCV(samplePre);
  const postStats = calculateCV(samplePost);
  const n1 = preStats.n;
  const n2 = postStats.n;

  if (n1 < 2 || n2 < 2) {
    return {
      tStat: 0,
      df: 0,
      pValue: 1.0,
      meanPre: preStats.mean,
      meanPost: postStats.mean,
      deltaPercent: 0,
      isSignificant: false
    };
  }

  const df = n1 + n2 - 2;
  const s1Sq = Math.pow(preStats.sd, 2);
  const s2Sq = Math.pow(postStats.sd, 2);
  const pooledSD = Math.sqrt(((n1 - 1) * s1Sq + (n2 - 1) * s2Sq) / df);

  const seDiff = pooledSD * Math.sqrt(1.0 / n1 + 1.0 / n2);
  const tStat = seDiff > 1e-9 ? (postStats.mean - preStats.mean) / seDiff : 0;
  const pValue = calculateStudentPValue(tStat, df);

  const deltaPercent = preStats.mean !== 0 ? ((postStats.mean - preStats.mean) / preStats.mean) * 100 : 0;
  const isSignificant = pValue < SIGNIFICANCE_ALPHA;

  return {
    tStat: parseFloat(tStat.toFixed(4)),
    df,
    pValue,
    meanPre: preStats.mean,
    meanPost: postStats.mean,
    deltaPercent: parseFloat(deltaPercent.toFixed(2)),
    isSignificant
  };
}

/**
 * Esegue il test t di Student per dati appaiati (paired t-test) sugli stessi soggetti Pre vs Post.
 *
 * @param samplePre - Serie PRE.
 * @param samplePost - Serie POST (medesima dimensione di samplePre).
 * @returns Oggetto PairedTTestResult con t, df, p-value, meanDiff, sdDiff e cohenD.
 */
export function calculatePairedTTest(samplePre: number[], samplePost: number[]): PairedTTestResult {
  if (
    !Array.isArray(samplePre) ||
    !Array.isArray(samplePost) ||
    samplePre.length < 2 ||
    samplePre.length !== samplePost.length
  ) {
    return {
      tStat: 0,
      df: 0,
      pValue: 1.0,
      meanDiff: 0,
      sdDiff: 0,
      isSignificant: false,
      cohenD: 0
    };
  }

  const n = samplePre.length;
  const diffs: number[] = [];

  for (let i = 0; i < n; i++) {
    diffs.push(samplePost[i] - samplePre[i]);
  }

  const sumDiff = diffs.reduce((acc, d) => acc + d, 0);
  const meanDiff = sumDiff / n;

  const varSum = diffs.reduce((acc, d) => acc + Math.pow(d - meanDiff, 2), 0);
  const sdDiff = Math.sqrt(varSum / (n - 1));

  const seDiff = sdDiff / Math.sqrt(n);
  const tStat = seDiff > 1e-9 ? meanDiff / seDiff : 0;
  const df = n - 1;
  const pValue = calculateStudentPValue(tStat, df);

  const cohenD = sdDiff > 1e-9 ? meanDiff / sdDiff : 0;
  const isSignificant = pValue < SIGNIFICANCE_ALPHA;

  return {
    tStat: parseFloat(tStat.toFixed(4)),
    df,
    pValue,
    meanDiff: parseFloat(meanDiff.toFixed(4)),
    sdDiff: parseFloat(sdDiff.toFixed(4)),
    isSignificant,
    cohenD: parseFloat(cohenD.toFixed(4))
  };
}

/**
 * Wrapper compatibile per StudentTTestResult tipizzato in `src/types/pap.ts`.
 *
 * @param samplePre - Serie PRE.
 * @param samplePost - Serie POST.
 * @returns Oggetto conforme all'interfaccia StudentTTestResult.
 */
export function runInferentialStats(
  samplePre: number[],
  samplePost: number[]
): StudentTTestResult {
  const paired = calculatePairedTTest(samplePre, samplePost);
  const hedges = calculateHedgesG(samplePre, samplePost);

  return {
    tValue: paired.tStat,
    pValue: paired.pValue,
    degreesOfFreedom: paired.df,
    isSignificant: paired.isSignificant,
    hedgesG: hedges.g,
    effectSizeLabel: hedges.effectSizeLabel ?? 'Trascurabile'
  };
}

// ============================================================================
// VALUTAZIONE RISPOSTA PAP E CLASSIFICAZIONE RESPONDER
// ============================================================================

/**
 * Calcola la percentuale di variazione di potenziamento: ((post - baseline) / baseline) * 100.
 *
 * @param baseline - Prestazione al baseline (pre-stimolo).
 * @param post - Prestazione dopo stimolo condizionante (post-stimolo).
 * @returns Percentuale di variazione (positiva per incremento, negativa per decremento).
 */
export function calculatePotentiationPercent(baseline: number, post: number): number {
  if (typeof baseline !== 'number' || baseline <= 0 || typeof post !== 'number' || !isFinite(post)) {
    return 0;
  }
  return parseFloat((((post - baseline) / baseline) * 100).toFixed(2));
}

/**
 * Classifica la risposta al protocollo PAP secondo soglie di variazione percentuale.
 * - Responder: delta >= +soglia% (es. +2.5%).
 * - Negative Responder: delta <= -soglia% (fatica prevalente).
 * - Non-Responder: variazione compresa nei limiti di rumore.
 *
 * @param deltaPercent - Variazione percentuale ((post - baseline) / baseline) * 100.
 * @param thresholdPercent - Soglia di significatività biologica (default 2.5%).
 * @returns Classificazione PotentiationClassification.
 */
export function classifyPotentiationResponse(
  deltaPercent: number,
  thresholdPercent: number = POTENTIATION_THRESHOLD_PERCENT
): PotentiationClassification {
  if (deltaPercent >= thresholdPercent) {
    return 'Responder';
  } else if (deltaPercent <= -thresholdPercent) {
    return 'Negative Responder';
  } else {
    return 'Non-Responder';
  }
}

/**
 * Opzioni per il calcolo della risposta al potenziamento.
 */
export interface PotentiationOptions {
  thresholdPercent?: number;
  pooledSD?: number;
}

/**
 * Calcola l'oggetto completo di risposta PAP con classificazione ed effect size.
 *
 * @param baseline - Prestazione baseline.
 * @param post - Prestazione post.
 * @param options - Configurazione opzionale (thresholdPercent, pooledSD).
 * @returns Risultato completo PotentiationResponse.
 */
export function calculatePotentiationResponse(
  baseline: number,
  post: number,
  options: PotentiationOptions = {}
): PotentiationResponse {
  const threshold = options.thresholdPercent ?? POTENTIATION_THRESHOLD_PERCENT;
  const deltaAbsolute = parseFloat((post - baseline).toFixed(2));
  const deltaPercent = calculatePotentiationPercent(baseline, post);
  const classification = classifyPotentiationResponse(deltaPercent, threshold);
  const isResponder = classification === 'Responder';

  let cohenD: number | undefined;
  let effectSize: string | undefined;

  if (options.pooledSD && options.pooledSD > 1e-9) {
    const cd = calculateCohensD(baseline, post, options.pooledSD);
    cohenD = cd.d;
    effectSize = cd.label;
  }

  return {
    baseline,
    post,
    deltaAbsolute,
    deltaPercent,
    classification,
    isResponder,
    cohenD,
    effectSize
  };
}

// ============================================================================
// METROLOGIA DEI SALTI E MINIMAL DETECTABLE CHANGE (MDC 95%)
// ============================================================================

/**
 * Valuta la variazione di un singolo salto confrontandola con la soglia MDC al 95% di letteratura.
 *
 * @param testType - Tipologia di salto ('SJ' | 'CMJ' | 'ABK').
 * @param preHeight - Altezza salto PRE in cm.
 * @param postHeight - Altezza salto POST in cm.
 * @returns Oggetto SingleJumpEvaluation tipizzato.
 */
export function evaluateSingleJumpMDC(
  testType: 'SJ' | 'CMJ' | 'ABK' | string,
  preHeight: number,
  postHeight: number
): SingleJumpEvaluation {
  let mdcThreshold = MDC_SJ_PERCENT;
  const typeUpper = String(testType || 'SJ').trim().toUpperCase();

  let jumpType: 'SJ' | 'CMJ' | 'ABK' = 'SJ';
  if (typeUpper.includes('CMJ')) {
    mdcThreshold = MDC_CMJ_PERCENT;
    jumpType = 'CMJ';
  } else if (typeUpper.includes('ABK') || typeUpper.includes('ABALAKOV')) {
    mdcThreshold = MDC_ABK_PERCENT;
    jumpType = 'ABK';
  }

  if (
    typeof preHeight !== 'number' ||
    preHeight <= 0 ||
    typeof postHeight !== 'number' ||
    postHeight <= 0
  ) {
    return {
      jumpType,
      preHeightCm: preHeight || 0,
      postHeightCm: postHeight || 0,
      deltaPercent: 0,
      mdcPercent: mdcThreshold,
      isRealChange: false,
      classification: 'Invariato (Rumore di Misura)'
    };
  }

  const deltaCm = postHeight - preHeight;
  const deltaPercent = (deltaCm / preHeight) * 100.0;
  const isRealChange = Math.abs(deltaPercent) >= mdcThreshold;

  let classification: 'Potenziamento Reale' | 'Fatica Reale' | 'Invariato (Rumore di Misura)' =
    'Invariato (Rumore di Misura)';
  if (isRealChange) {
    classification = deltaPercent > 0 ? 'Potenziamento Reale' : 'Fatica Reale';
  }

  return {
    jumpType,
    preHeightCm: parseFloat(preHeight.toFixed(2)),
    postHeightCm: parseFloat(postHeight.toFixed(2)),
    deltaPercent: parseFloat(deltaPercent.toFixed(2)),
    mdcPercent: mdcThreshold,
    isRealChange,
    classification
  };
}

// ============================================================================
// SCOMPOSIZIONE BIOMECCANICA DELL'RSI E DINAMICHE INTRA-SERIE
// ============================================================================

/**
 * Scomposizione biomeccanica determinanti dell'RSI (Delta RSI = f(Delta TC, Delta H)).
 *
 * @param rsiPre - RSI medio PRE.
 * @param rsiPost - RSI medio POST.
 * @param tcPreSec - Tempo di contatto PRE (secondi).
 * @param tcPostSec - Tempo di contatto POST (secondi).
 * @param hPreCm - Altezza media PRE (cm).
 * @param hPostCm - Altezza media POST (cm).
 * @returns Oggetto conforme all'interfaccia RSIDecomposition.
 */
export function decomposeRSI(
  rsiPre: number,
  rsiPost: number,
  tcPreSec: number,
  tcPostSec: number,
  hPreCm: number,
  hPostCm: number
): RSIDecomposition {
  const deltaRsiPercent = rsiPre > 0 ? ((rsiPost - rsiPre) / rsiPre) * 100 : 0;
  const deltaTcPercent = tcPreSec > 0 ? ((tcPostSec - tcPreSec) / tcPreSec) * 100 : 0;
  const deltaHPercent = hPreCm > 0 ? ((hPostCm - hPreCm) / hPreCm) * 100 : 0;

  let mechanism:
    | "Potenziamento d'impulso"
    | 'Fatica da stiffness'
    | 'Fatica contrattile'
    | 'Fatica combinata / mista'
    | 'Compensazione di spinta'
    | 'Stabile' = 'Stabile';
  let interpretation = 'Variazione nei limiti della variabilità fisiologica.';

  if (deltaRsiPercent >= 3.0 && deltaHPercent > 0 && deltaTcPercent <= 1.5) {
    mechanism = "Potenziamento d'impulso";
    interpretation =
      "Potenziamento d'impulso: la rigidità tendinea è preservata o incrementata (TC stabile o ridotto) con netto guadagno di altezza.";
  } else if (deltaTcPercent > 2.5 && deltaRsiPercent <= -2.5) {
    mechanism = 'Fatica da stiffness';
    interpretation =
      "Fatica da stiffness: cedimento elastico del complesso muscolo-tendineo della caviglia con allungamento dell'ammortizzazione a terra.";
  } else if (deltaHPercent <= -3.0 && Math.abs(deltaTcPercent) <= 2.0) {
    mechanism = 'Fatica contrattile';
    interpretation =
      'Fatica contrattile periferica: crollo della capacità di spinta verticale in salita a parità di tempo di contatto a terra.';
  } else if (deltaRsiPercent < -2.5 && deltaHPercent < 0 && deltaTcPercent > 0) {
    mechanism = 'Fatica combinata / mista';
    interpretation =
      'Fatica combinata: decadimento contemporaneo sia della rigidità reattiva a terra che della propulsione concentrica.';
  } else if (deltaHPercent > 2.0 && deltaTcPercent > 2.0) {
    mechanism = 'Compensazione di spinta';
    interpretation =
      "Compensazione per spinta concentrica: l'atleta baratta la reattività rapida allungando il tempo a terra per saltare più in alto.";
  }

  return {
    deltaRsiPct: parseFloat(deltaRsiPercent.toFixed(2)),
    deltaTcPct: parseFloat(deltaTcPercent.toFixed(2)),
    deltaHeightPct: parseFloat(deltaHPercent.toFixed(2)),
    mechanism,
    interpretation
  };
}

/**
 * Singolo rimbalzo nella serie di saltelli reattivi.
 */
export interface ReboundMeasure {
  rsi: number;
  tc: number;
  height: number;
}

/**
 * Analisi della dinamica intra-serie: costanza motoria (CV%), pendenza (slope)
 * e accoppiamento TC <-> Altezza (r di Pearson).
 *
 * @param rebounds - Vettore dei rimbalzi reattivi della serie.
 * @returns Risultato IntraSetDynamicsResult.
 */
export function analyzeIntraSetDynamics(rebounds: ReboundMeasure[]): IntraSetDynamicsResult {
  if (!Array.isArray(rebounds) || rebounds.length < 3) {
    return {
      cvRsi: 0,
      cvTc: 0,
      cvH: 0,
      slopeRsi: 0,
      pSlope: 1.0,
      pattern: 'NON_VALUTABILE',
      couplingR: 0,
      couplingP: 1.0,
      strategy: 'NEUTRA',
      reboundCount: rebounds ? rebounds.length : 0
    };
  }

  const rsiVals = rebounds.map((r) => r.rsi);
  const tcVals = rebounds.map((r) => r.tc);
  const hVals = rebounds.map((r) => r.height);
  const indices = rebounds.map((_, i) => i + 1);

  const statsRsi = calculateCV(rsiVals);
  const statsTc = calculateCV(tcVals);
  const statsH = calculateCV(hVals);

  const regRsi = linearRegression(indices, rsiVals);

  let pattern: 'METRONOMICO' | 'ACCENSIONE_TARDIVA' | 'DECADIMENTO_FATICA' | 'DISPERSIVO' | 'NON_VALUTABILE' =
    'METRONOMICO';
  if (regRsi.slope > 0.015 && regRsi.pValue < LATE_ACTIVATION_P_LIMIT) {
    pattern = 'ACCENSIONE_TARDIVA';
  } else if (regRsi.slope < -0.02 && regRsi.pValue < SIGNIFICANCE_ALPHA) {
    pattern = 'DECADIMENTO_FATICA';
  } else if (statsRsi.cvPercent > CV_DISPERSIVE_LIMIT_PERCENT) {
    pattern = 'DISPERSIVO';
  }

  const coupling = calculatePearsonCorrelation(tcVals, hVals);
  let strategy: 'ELASTICA_REATTIVA' | 'STRATEGIA_DI_SPINTA' | 'NEUTRA' = 'ELASTICA_REATTIVA';
  if (coupling.r >= COUPLING_PUSH_R_THRESHOLD && coupling.pValue < SIGNIFICANCE_ALPHA) {
    strategy = 'STRATEGIA_DI_SPINTA';
  }

  return {
    cvRsi: statsRsi.cvPercent,
    cvTc: statsTc.cvPercent,
    cvH: statsH.cvPercent,
    slopeRsi: regRsi.slope,
    pSlope: regRsi.pValue,
    pattern,
    couplingR: coupling.r,
    couplingP: coupling.pValue,
    strategy,
    reboundCount: rebounds.length
  };
}

/**
 * Calcola il profilo neuromuscolare basale: EUR (CMJ/SJ), transfer braccia (ABK-CMJ)
 * e discrimina deficit concentrici mascherati.
 *
 * @param sjHeight - Altezza Squat Jump (cm).
 * @param cmjHeight - Altezza Countermovement Jump (cm).
 * @param abkHeight - Altezza Abalakov Jump (cm, facoltativo).
 * @returns Profilo NeuromuscularProfileResult.
 */
export function computeNeuromuscularProfile(
  sjHeight: number,
  cmjHeight: number,
  abkHeight?: number
): NeuromuscularProfileResult {
  if (!sjHeight || sjHeight <= 0 || !cmjHeight || cmjHeight <= 0) {
    return {
      eurRatio: 0,
      eurPercent: 0,
      classification: 'NON_DETERMINATO',
      hasConcentricDeficit: false,
      armsContributionCm: 0,
      armsTransferQuality: 'NON_DETERMINATO'
    };
  }

  const eurRatio = cmjHeight / sjHeight;
  const eurPercent = ((cmjHeight - sjHeight) / sjHeight) * 100.0;

  let classification: 'ELASTICO_DIPENDENTE' | 'FORZA_DIPENDENTE' | 'MISTO_BILANCIATO' | 'NON_DETERMINATO' =
    'MISTO_BILANCIATO';
  if (eurRatio > EUR_HIGH_ELASTIC_THRESHOLD) {
    classification = 'ELASTICO_DIPENDENTE';
  } else if (eurRatio < EUR_BALANCED_LOW_THRESHOLD) {
    classification = 'FORZA_DIPENDENTE';
  }

  const hasConcentricDeficit =
    eurRatio > EUR_HIGH_ELASTIC_THRESHOLD && sjHeight < CONCENTRIC_DEFICIT_SJ_CUTOFF_CM;

  let armsContributionCm = 0;
  let armsTransferQuality: 'ECCELLENTE_COORDINATIVO' | 'BUONO' | 'RIDOTTO_LIMITATO' | 'INVARIATO' | 'NON_DETERMINATO' =
    'INVARIATO';
  if (abkHeight && abkHeight > 0) {
    armsContributionCm = abkHeight - cmjHeight;
    if (armsContributionCm >= 8.0) {
      armsTransferQuality = 'ECCELLENTE_COORDINATIVO';
    } else if (armsContributionCm >= 5.0) {
      armsTransferQuality = 'BUONO';
    } else {
      armsTransferQuality = 'RIDOTTO_LIMITATO';
    }
  }

  return {
    eurRatio: parseFloat(eurRatio.toFixed(3)),
    eurPercent: parseFloat(eurPercent.toFixed(1)),
    classification,
    hasConcentricDeficit,
    armsContributionCm: parseFloat(armsContributionCm.toFixed(2)),
    armsTransferQuality
  };
}

/**
 * Atleta per la matrice di correlazione massa vs reattività.
 */
export interface AthleteMassRsiInput {
  athlete?: string;
  bodyMassKg?: number;
  mass?: number | string;
  baselineRsi?: number;
  rsi?: number | string;
}

/**
 * Correlazione di Pearson tra massa corporea e reattività (RSI).
 *
 * @param athletesData - Array con massa e rsi degli atleti.
 * @returns Risultato di correlazione PearsonCorrelationResult.
 */
export function correlateBodyMassWithRsi(
  athletesData: AthleteMassRsiInput[]
): PearsonCorrelationResult {
  if (!Array.isArray(athletesData) || athletesData.length < 3) {
    return { r: 0, rSquared: 0, pValue: 1.0, tStat: 0, ci95: [0, 0], isSignificant: false, n: 0 };
  }

  const masses: number[] = [];
  const rsis: number[] = [];

  for (const a of athletesData) {
    const rawMass =
      typeof a.bodyMassKg === 'number'
        ? a.bodyMassKg
        : typeof a.mass === 'number'
          ? a.mass
          : typeof a.mass === 'string'
            ? parseFloat(a.mass)
            : 0;

    const rawRsi =
      typeof a.baselineRsi === 'number'
        ? a.baselineRsi
        : typeof a.rsi === 'number'
          ? a.rsi
          : typeof a.rsi === 'string'
            ? parseFloat(a.rsi)
            : 0;

    if (rawMass > 0 && rawRsi > 0 && isFinite(rawMass) && isFinite(rawRsi)) {
      masses.push(rawMass);
      rsis.push(rawRsi);
    }
  }

  return calculatePearsonCorrelation(masses, rsis);
}

/**
 * Calcola la potenza relativa espressa nello Squat Jump (W/kg).
 * Se fornita potenza in Watt, la divide per il peso; altrimenti applica la formula di Sayers et al. (1999).
 *
 * @param jumpHeightCm - Altezza di salto in cm.
 * @param bodyMassKg - Massa corporea in kg.
 * @param peakPowerWatts - Potenza di picco opzionale in Watt.
 * @returns Potenza relativa in W/kg.
 */
export function computeRelativePowerWkg(
  jumpHeightCm: number,
  bodyMassKg: number,
  peakPowerWatts?: number | null
): number {
  if (typeof bodyMassKg !== 'number' || bodyMassKg <= 0 || !isFinite(bodyMassKg)) {
    return 0;
  }

  if (typeof peakPowerWatts === 'number' && peakPowerWatts > 0 && isFinite(peakPowerWatts)) {
    return parseFloat((peakPowerWatts / bodyMassKg).toFixed(2));
  }

  if (typeof jumpHeightCm !== 'number' || jumpHeightCm <= 0 || !isFinite(jumpHeightCm)) {
    return 0;
  }

  const estimatedWatts =
    SAYERS_SJ_HEIGHT_COEFF * jumpHeightCm +
    SAYERS_SJ_MASS_COEFF * bodyMassKg -
    SAYERS_SJ_CONSTANT;
  const validWatts = Math.max(0, estimatedWatts);
  return parseFloat((validWatts / bodyMassKg).toFixed(2));
}

/**
 * Analizza la matrice Efficienza Potenza (W/kg) vs RSI per discriminare deficit di RFD precoce.
 *
 * @param relativePowerWkg - Potenza relativa SJ (W/kg).
 * @param rsiMean - RSI medio.
 * @param rsiPeak - RSI di picco.
 * @param bodyMassKg - Massa corporea in kg.
 * @returns Risultato PowerVsRsiMatrixResult.
 */
export function evaluatePowerVsRsiMatrix(
  relativePowerWkg: number,
  rsiMean: number,
  rsiPeak: number,
  bodyMassKg: number
): PowerVsRsiMatrixResult {
  const pWkg = typeof relativePowerWkg === 'number' && relativePowerWkg > 0 ? relativePowerWkg : 0;
  const meanRsi = typeof rsiMean === 'number' && rsiMean > 0 ? rsiMean : 0;
  const peakRsi = typeof rsiPeak === 'number' && rsiPeak > 0 ? rsiPeak : meanRsi;
  const massKg = typeof bodyMassKg === 'number' && bodyMassKg > 0 ? bodyMassKg : 70;

  const efficiencyMean = pWkg > 0 ? meanRsi / pWkg : 0;
  const efficiencyPeak = pWkg > 0 ? peakRsi / pWkg : 0;

  let classification = 'EFFICIENZA_BILANCIATA';
  let rfdDeficitLevel = 'NESSUNO';
  let rationale = '';

  if (
    pWkg >= HIGH_POWER_WKG_THRESHOLD &&
    meanRsi < LOW_RSI_THRESHOLD &&
    massKg < HEAVY_BODY_MASS_CUTOFF_KG
  ) {
    classification = 'DEFICIT_RFD_PRECOCE';
    rfdDeficitLevel = 'MARCATO';
    rationale = `L'atleta esprime elevata potenza su archi temporali estesi (>300 ms, ${pWkg.toFixed(1)} W/kg), ma manifesta un deficit selettivo nello sviluppo rapido di forza nei primi 100 ms (RSI ${meanRsi.toFixed(2)}).`;
  } else if (massKg >= HEAVY_BODY_MASS_CUTOFF_KG && meanRsi < LOW_RSI_THRESHOLD) {
    classification = 'PENALITA_INERZIALE_MASSA';
    rfdDeficitLevel = 'MODERATO';
    rationale = `L'RSI moderato (${meanRsi.toFixed(2)}) è coerente con la taglia corporea elevata (${massKg} kg, correlazione inversa r = -0.77). Non costituisce deficit neuromuscolare rispetto ai pari peso.`;
  } else if (pWkg < LOW_POWER_WKG_THRESHOLD) {
    classification = 'DEFICIT_POTENZA_CONCENTRICA';
    rfdDeficitLevel = 'MODERATO';
    rationale = `Potenza relativa SJ sotto soglia (${pWkg.toFixed(1)} W/kg): il collo di bottiglia risiede nella forza concentrica propulsiva a monte e non nella reattività di caviglia.`;
  } else {
    classification = 'EFFICIENZA_BILANCIATA';
    rfdDeficitLevel = 'NESSUNO';
    rationale = `Rapporto armonico tra potenza propulsiva (${pWkg.toFixed(1)} W/kg) e reattività fast-SSC (RSI ${meanRsi.toFixed(2)}, picco ${peakRsi.toFixed(2)}).`;
  }

  return {
    efficiencyMean: parseFloat(efficiencyMean.toFixed(4)),
    efficiencyPeak: parseFloat(efficiencyPeak.toFixed(4)),
    relativePowerWkg: parseFloat(pWkg.toFixed(2)),
    classification,
    rfdDeficitLevel,
    rationale
  };
}

// ============================================================================
// CLASSE PAP STATS ENGINE (COMPATIBILITÀ API ES6 / TYPESCRIPT)
// ============================================================================

/**
 * Classe che raggruppa tutti i metodi statici del motore PAP e analisi salti.
 */
export class PAPStatsEngine {
  static calculateCV = calculateCV;
  static calculateStudentPValue = calculateStudentPValue;
  static linearRegression = linearRegression;
  static calculatePearsonCorrelation = calculatePearsonCorrelation;
  static calculateCohensD = calculateCohensD;
  static calculateHedgesG = calculateHedgesG;
  static calculateTwoSampleTTest = calculateTwoSampleTTest;
  static calculatePairedTTest = calculatePairedTTest;
  static runInferentialStats = runInferentialStats;
  static calculatePotentiationPercent = calculatePotentiationPercent;
  static classifyPotentiationResponse = classifyPotentiationResponse;
  static calculatePotentiationResponse = calculatePotentiationResponse;
  static evaluateSingleJumpMDC = evaluateSingleJumpMDC;
  static decomposeRSI = decomposeRSI;
  static analyzeIntraSetDynamics = analyzeIntraSetDynamics;
  static computeNeuromuscularProfile = computeNeuromuscularProfile;
  static correlateBodyMassWithRsi = correlateBodyMassWithRsi;
  static computeRelativePowerWkg = computeRelativePowerWkg;
  static evaluatePowerVsRsiMatrix = evaluatePowerVsRsiMatrix;
}
