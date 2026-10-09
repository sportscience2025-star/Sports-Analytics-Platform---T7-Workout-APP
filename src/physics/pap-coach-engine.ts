/**
 * src/physics/pap-coach-engine.ts
 * Motore Prescrittivo e Decisionale per Preparatori Atletici (Coach AI Engine).
 * Responsabilità:
 * 1. Diagnosi automatica dello stato PAP dell'atleta (Potenziamento Reale, Fatica Reale, Invariato / Rumore).
 * 2. Classificazione della tipologia di fatica: Concentrica, Reattiva/Stiffness o Ammortizzativa.
 * 3. Alert e indicazioni di dosaggio volumetrico.
 * 4. Raccomandazione personalizzata della finestra temporale di recupero ottimale pre-gara.
 * 5. Direttive di correzione tecnica con prescrizione di esercitazioni di campo.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import type { PairedTTestResult, RSIDecomposition } from '../types/pap';

export type PAPDiagnosis =
  | 'POTENZIAMENTO_REALE'
  | 'FATICA_REALE'
  | 'INVARIATO_RUMORE';

export type FatigueType =
  | 'NESSUNA_FATICA'
  | 'FATICA_CONCENTRICA'
  | 'FATICA_REATTIVA_STIFFNESS'
  | 'FATICA_AMMORTIZZATIVA';

export interface CoachPrescription {
  diagnosis: PAPDiagnosis;
  fatigueType: FatigueType;
  title: string;
  summary: string;
  optimalRecoveryMinutes: [number, number];
  volumeDosageRecommendation: string;
  fieldDrills: string[];
  alertLevel: 'low' | 'medium' | 'high';
}

export interface CoachEvaluationInput {
  tTest: PairedTTestResult;
  rsiDecomposition?: RSIDecomposition;
  meanPreHeightCm: number;
  meanPostHeightCm: number;
  sport?: string;
  athleteAge?: number;
  bodyMassKg?: number;
}

/**
 * Valuta lo stato di potenziamento o fatica post-attivazione e produce prescrizioni operative per il coach.
 *
 * @param input - Risultati del test statistico, RSI e dati morfologici
 * @returns Oggetto CoachPrescription con diagnosi, timing ottimale e indicazioni di campo
 */
export function evaluatePAPCoachState(input: CoachEvaluationInput): CoachPrescription {
  const {
    tTest,
    rsiDecomposition,
    meanPreHeightCm,
    meanPostHeightCm,
    athleteAge = 22,
    bodyMassKg = 75,
  } = input;

  const deltaPct = meanPreHeightCm > 0
    ? ((meanPostHeightCm - meanPreHeightCm) / meanPreHeightCm) * 100
    : 0;

  const meanDifference = tTest.meanDifference ?? tTest.meanDiff ?? 0;
  const mdc95 = tTest.mdc95 ?? (tTest.sdDiff > 0 ? parseFloat((1.96 * Math.SQRT2 * (tTest.sdDiff / Math.sqrt(Math.max(1, tTest.df + 1)))).toFixed(2)) : 1.5);

  const isStatisticallySignificant = tTest.isSignificant && tTest.pValue < 0.05;
  const isAboveMDC = Math.abs(meanDifference) >= mdc95;

  let diagnosis: PAPDiagnosis = 'INVARIATO_RUMORE';
  if (isStatisticallySignificant && isAboveMDC) {
    diagnosis = deltaPct > 0 ? 'POTENZIAMENTO_REALE' : 'FATICA_REALE';
  } else if (deltaPct > 5.0 && meanDifference > 0) {
    diagnosis = 'POTENZIAMENTO_REALE';
  } else if (deltaPct < -5.0 && meanDifference < 0) {
    diagnosis = 'FATICA_REALE';
  }

  // Identificazione tipologia di fatica
  let fatigueType: FatigueType = 'NESSUNA_FATICA';
  if (diagnosis === 'FATICA_REALE') {
    if (rsiDecomposition) {
      const stiffnessDeficit = rsiDecomposition.stiffnessDeficitPct ?? (rsiDecomposition.deltaTcPct > 0 ? rsiDecomposition.deltaTcPct : 0);
      const contractileFatigue = rsiDecomposition.contractileFatiguePct ?? (rsiDecomposition.deltaHeightPct < 0 ? Math.abs(rsiDecomposition.deltaHeightPct) : 0);
      if (rsiDecomposition.mechanism === 'Fatica da stiffness' || stiffnessDeficit > 40) {
        fatigueType = 'FATICA_REATTIVA_STIFFNESS';
      } else if (rsiDecomposition.mechanism === 'Fatica contrattile' || contractileFatigue > 40) {
        fatigueType = 'FATICA_CONCENTRICA';
      } else {
        fatigueType = 'FATICA_AMMORTIZZATIVA';
      }
    } else {
      fatigueType = 'FATICA_CONCENTRICA';
    }
  }

  // Finestra di recupero consigliata
  let optimalRecoveryMinutes: [number, number] = [8, 12];
  if (bodyMassKg > 85 || athleteAge > 30) {
    optimalRecoveryMinutes = [12, 16];
  } else if (bodyMassKg < 68 && athleteAge < 25) {
    optimalRecoveryMinutes = [6, 10];
  }

  // Generazione raccomandazioni e drill di campo
  let title = '';
  let summary = '';
  let volumeDosageRecommendation = '';
  let alertLevel: 'low' | 'medium' | 'high' = 'low';
  const fieldDrills: string[] = [];

  switch (diagnosis) {
    case 'POTENZIAMENTO_REALE':
      title = 'Risposta PAP Efficace e Sovrasollecitazione Positiva';
      summary = `L atleta ha mostrato un incremento reale delle prestazioni (+${deltaPct.toFixed(1)}%) superiore al rumore biologico (MDC 95%). La finestra di potenziamento neuromuscolare è ottimale.`;
      volumeDosageRecommendation = 'Conservare il protocollo di pre-attivazione testato (volume: 2-3 serie da 3 ripetizioni al carico target).';
      fieldDrills.push(
        'Drop Jump con rimbalzo reattivo immediato',
        'Accelerazioni brevi sui 10-15 metri con avvio da fermo',
        'Balzi alternati orizzontali ad alta stiffness'
      );
      alertLevel = 'low';
      break;

    case 'FATICA_REALE':
      title = 'Prevalenza della Fatica Neuromuscolare sul Potenziamento';
      summary = `Rilevato decremento significativo delle prestazioni (${deltaPct.toFixed(1)}%). Il carico di attivazione o i tempi di recupero intermedi sono stati eccessivi, inducendo stanchezza periferica o centrale.`;
      volumeDosageRecommendation = 'Ridurre il volume dell esercizio di attivazione del 30-40% ed estendere l intervallo pre-gara di 3-5 minuti.';
      alertLevel = 'high';

      if (fatigueType === 'FATICA_REATTIVA_STIFFNESS') {
        fieldDrills.push(
          'Pogo Jumps a ginocchia tese per ripristino compliance tendinea',
          'Andature di caviglia su terreno elastico con scarpe da gara',
          'Isometrie plantari su gradino a carico naturale'
        );
      } else {
        fieldDrills.push(
          'Esercitazioni di scarico spinale e mobilità dinamica fluida',
          'Flessioni dell anca dinamiche a gamba tesa a corpo libero',
          'Corsa leggera a ritmo degressivo prima del richiamo'
        );
      }
      break;

    case 'INVARIATO_RUMORE':
    default:
      title = 'Variazione Non Significativa (Rumore Biologico)';
      summary = `La differenza registrata (${deltaPct.toFixed(1)}%) rientra nell intervallo di variabilità naturale (MDC 95% = ${mdc95.toFixed(2)} cm). L attivazione non ha prodotto né affaticamento né beneficio netto.`;
      volumeDosageRecommendation = 'Testare una variazione del carico di attivazione (+/- 5% 1RM) o un tempo di attesa leggermente più lungo (+2 minuti).';
      fieldDrills.push(
        'CMJ standard con controllo dell ampiezza di caricamento',
        'Balzi su box basso per taratura della velocità di stacco'
      );
      alertLevel = 'medium';
      break;
  }

  return {
    diagnosis,
    fatigueType,
    title,
    summary,
    optimalRecoveryMinutes,
    volumeDosageRecommendation,
    fieldDrills,
    alertLevel,
  };
}
