/**
 * src/logic/periodization.ts
 * Motore Deterministico di Selezione della Periodizzazione e Architettura del Macrociclo.
 *
 * Conforme a:
 * - Regola R1: Zero any, tipizzazione TypeScript strict con interfacce da src/types/program.ts.
 * - Regola R2: Interfacce condivise.
 * - Regola 01: Zero emoji spontanee.
 * - Riferimenti scientifici accademici: Bompa, Zatsiorsky, Issurin, Rhea, Schoenfeld, Simmons, Seiler.
 */

import type {
  PeriodizationMethod,
  PhaseBlueprint,
  ScientificRationale,
  WorkoutProgram,
  WorkoutSession,
  FormattedExercise
} from '../types/program';
import type { RiskAnalysisProfile } from '../types/clinical';
import type { Exercise } from '../types/exercise';
import { allExercises } from '../data/exercises';
import { classifyExercises } from './risk-analyzer';

export interface PeriodizationSelectionParams {
  patientType?: 'Atleta' | 'Clinico' | 'Clinico_Anziano' | string;
  sport?: string;
  sportPraticato?: string;
  level?: 'Beginner' | 'Junior' | 'Intermediate' | 'Advanced' | 'Elite' | 'Principiante' | 'Intermedio' | 'Avanzato' | string;
  goal?: 'Hypertrophy' | 'Strength' | 'Power' | 'Definition' | 'Resistenza' | 'Forza' | 'Ipertrofia' | 'Potenza' | 'Definizione' | string;
  weeks?: number | string;
  days?: number | string;
  athleteName?: string;
}

export interface PeriodizationDetail {
  method: PeriodizationMethod;
  name: string;
  rationale: string;
  progressionPattern: string;
  keyResearchers: string;
}

// ============================================================================
// METODI E DETTAGLI ACCADEMICI
// ============================================================================

export const PERIODIZATION_DETAILS: Record<PeriodizationMethod, PeriodizationDetail> = {
  CLINICAL: {
    method: 'CLINICAL',
    name: 'Periodizzazione Clinica Riabilitativa',
    rationale:
      'Il programma segue una progressione clinica strutturata per fasi riabilitative specifiche, minimizzando il rischio di sovraccarico articolare e rispettando i tempi fisiologici di riparazione tessutale.',
    progressionPattern:
      "Passaggio graduale da contrazioni isometriche a dinamiche controllate, con rigido vincolo sui gradi di ROM articolare e cap sull'RPE.",
    keyResearchers: 'Bompa & Haff (2009), Kisner & Colby (2012), Escamilla et al. (2001)'
  },
  LINEAR: {
    method: 'LINEAR',
    name: 'Periodizzazione Lineare Tradizionale',
    rationale:
      "La periodizzazione lineare e il metodo piu documentato e validato per atleti principianti. Zatsiorsky & Kraemer (2006) e Bompa & Haff (2009) dimostrano che la progressione graduale del carico e ottimale quando le riserve di adattamento sono ampie. La sequenza Adattamento Anatomico -> Ipertrofia -> Forza Massima -> Picco massimizza l'efficienza neuromuscolare.",
    progressionPattern:
      "Progressione con incremento graduale dell'intensita (% 1RM) e sistematica riduzione del volume da microciclo a microciclo.",
    keyResearchers: 'Zatsiorsky & Kraemer (2006), Bompa & Haff (2009)'
  },
  BLOCK: {
    method: 'BLOCK',
    name: 'Periodizzazione a Blocchi (Block Periodization)',
    rationale:
      "La periodizzazione a blocchi di Issurin (2008) concentra un singolo stimolo dominante per blocco, massimizzando l'adattamento specifico prima di passare al successivo. Per atleti avanzati, questo approccio supera la periodizzazione lineare poiche previene l'interferenza biologica tra qualita fisiche concorrenti.",
    progressionPattern:
      'Tre mesocicli sequenziali: Accumulazione (alto volume, intensita moderata) -> Intensificazione (volume moderato, intensita elevata) -> Realizzazione (basso volume, picco e tapering). Ciascun blocco si conclude con una settimana di scarico.',
    keyResearchers: 'Issurin (2008), Verkhoshansky (2009)'
  },
  DUP: {
    method: 'DUP',
    name: 'Periodizzazione Ondulante Giornaliera (Daily Undulating Periodization)',
    rationale:
      'La DUP (Rhea et al. 2002, Schoenfeld 2016) varia sistematicamente volume e intensita ad ogni seduta settimanale, prevenendo la stagnazione neurale e massimizzando il segnale anabolico. Colquhoun et al. (2017) hanno dimostrato guadagni di forza e ipertrofia superiori alla periodizzazione lineare in atleti intermedi.',
    progressionPattern:
      'Rotazione infra-settimanale delle variabili (Giorno Forza, Giorno Ipertrofia, Giorno Potenza) con incremento progressivo dei carichi del 2.5-5% sui microcicli.',
    keyResearchers: 'Rhea et al. (2002), Schoenfeld (2016), Colquhoun et al. (2017)'
  },
  CONJUGATE: {
    method: 'CONJUGATE',
    name: 'Periodizzazione Coniugata',
    rationale:
      'Il metodo coniugato di Louie Simmons (1999) sviluppa simultaneamente forza massimale (giorni Max Effort - ME) e velocita di reclutamento (giorni Dynamic Effort - DE), prevenendo la decelerazione tipica dei sistemi sequenziali tradizionali.',
    progressionPattern:
      'Alternanza di sedute Max Effort (carichi 90-100% 1RM a 1-3 ripetizioni) e Dynamic Effort (carichi 50-65% 1RM con accelerazione compensatoria massimale), integrati da lavoro accessorio mirato.',
    keyResearchers: 'Simmons (1999), Thibaudeau (2006), Zatsiorsky & Kraemer (2006)'
  },
  POLARIZED: {
    method: 'POLARIZED',
    name: 'Periodizzazione Polarizzata',
    rationale:
      "La periodizzazione polarizzata di Seiler (2010) stabilisce che la massima risposta adattativa si ottiene ripartendo l'80% del volume a bassa intensita (Zone 1-2, RPE <= 6) e il 20% ad alta intensita (Zone 4-5, RPE >= 9), evitando la zona grigia di intensita moderata che induce fatica cronica sproporzionata.",
    progressionPattern:
      'Distribuzione bimodalmente polarizzata del carico settimanale: 80% volume a bassa intensita aerobica/tecnica e 20% a stimolo massimale/sovramassimale.',
    keyResearchers: 'Seiler (2010), Foster et al. (2015)'
  }
};

/**
 * Seleziona deterministicamente il metodo di periodizzazione ottimale.
 */
export function selectPeriodizationMethod(params: PeriodizationSelectionParams): PeriodizationMethod {
  if (params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano') {
    return 'CLINICAL';
  }

  const sport = (params.sportPraticato || params.sport || '').toLowerCase();
  const level = (params.level || '').toLowerCase();
  const goal = (params.goal || '').toLowerCase();
  const parsedWeeks = typeof params.weeks === 'number' ? params.weeks : parseInt(String(params.weeks), 10);
  const weeksTotal = isNaN(parsedWeeks) || parsedWeeks <= 0 ? 12 : parsedWeeks;

  const isEndurance =
    sport.includes('endurance') || sport.includes('corsa') || goal.includes('endurance') || goal.includes('resistenza');
  const isBeginner =
    level.includes('beginner') || level.includes('junior') || level.includes('principiante');
  const isIntermediate =
    level.includes('intermediate') || level.includes('intermedio');
  const isAdvanced =
    level.includes('advanced') || level.includes('elite') || level.includes('avanzato');

  const isStrength = goal.includes('strength') || goal.includes('forza');
  const isHypertrophy =
    goal.includes('hypertrophy') ||
    goal.includes('ipertrofia') ||
    goal.includes('definition') ||
    goal.includes('definizione');
  const isPower = goal.includes('power') || goal.includes('potenza');

  if (isEndurance && !isStrength) {
    return 'POLARIZED';
  }
  if (isBeginner) {
    return 'LINEAR';
  }
  if (isIntermediate && (isHypertrophy || isEndurance)) {
    return 'DUP';
  }
  if (isIntermediate && isStrength && weeksTotal < 10) {
    return 'LINEAR';
  }
  if (isAdvanced && (isStrength || isPower) && weeksTotal >= 12) {
    return 'BLOCK';
  }
  if (isAdvanced && (isStrength || isPower) && weeksTotal < 12) {
    return 'CONJUGATE';
  }
  if (isAdvanced && isHypertrophy) {
    return 'CONJUGATE';
  }
  if (isAdvanced && isEndurance) {
    return 'POLARIZED';
  }

  return 'DUP';
}

/**
 * Denominazione standard dello split settimanale.
 */
export function getSplitName(days: number): string {
  const map: Record<number, string> = {
    2: 'Full Body x2',
    3: 'Push - Pull - Legs',
    4: 'Upper / Lower (4 Day Split)',
    5: 'PHAT / Upper-Lower-PPL',
    6: 'Push - Pull - Legs x2'
  };
  return map[days] ?? `${days} Sedute / Settimana`;
}

/**
 * Denominazione dello split specifico per la fase.
 */
export function getPhaseSplitName(
  phaseId: number,
  days: number,
  isClinical: boolean,
  method: PeriodizationMethod = 'LINEAR'
): string {
  if (isClinical) {
    if (phaseId % 2 === 0) return 'Scarico & Mobilita Funzionale';
    if (phaseId === 1) return days === 2 ? 'Full Body Isometrico' : 'Mobilita & Isometria Funzionale';
    if (phaseId === 3 || phaseId === 7) return days === 2 ? 'Upper/Lower Controllato' : 'Forza Eccentrica & Stabilita';
    if (phaseId === 5) return days === 2 ? 'Full Body Dinamico' : 'Forza Dinamica & Re-integrazione';
    return 'Valutazione Funzionale & Tapering';
  }

  if (method === 'DUP') {
    if (phaseId % 2 === 0) return 'Scarico DUP Ondulato';
    return days === 2 ? 'DUP Full Body Alternato' : days === 3 ? 'DUP Push-Pull-Legs' : 'DUP Upper/Lower';
  }

  if (method === 'CONJUGATE') {
    if (phaseId % 2 === 0) return 'Scarico Coniugato Tecnico';
    return days === 2 ? 'ME/DE Full Body Rotante' : 'Coniugato ME/DE Split';
  }

  if (method === 'POLARIZED') {
    if (phaseId % 2 === 0) return 'Scarico Polarizzato Rigenerativo';
    return 'Polarizzato 80/20';
  }

  if (method === 'BLOCK') {
    if (phaseId % 2 === 0) return 'Transizione & Scarico Attivo';
    if (phaseId === 1) return 'Accumulo / Capacita di Lavoro';
    if (phaseId === 3) return 'Intensificazione Neuromuscolare';
    return 'Realizzazione / Tapering';
  }

  if (phaseId % 2 === 0) return 'Scarico Rigenerativo';
  if (phaseId === 1) return days === 2 ? 'Full Body Adattamento Anatomico' : 'Full Body GPP';
  if (phaseId === 3) return days === 3 ? 'Push-Pull-Legs Ipertrofia' : 'Upper/Lower Forza-Ipertrofia';
  if (phaseId === 5) return 'Forza Massima & Picco Neurale';
  return 'Tapering & Test Massimali';
}

/**
 * Genera il rationale scientifico quadripartito (4 pilastri scientifici).
 */
export function generateScientificRationale(
  params: PeriodizationSelectionParams,
  method: PeriodizationMethod,
  riskProfile: RiskAnalysisProfile
): ScientificRationale {
  const isClinical = params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano';
  const sport = params.sportPraticato || params.sport || 'Generale';
  const goal = params.goal || 'Forza';
  const level = params.level || 'Intermedio';

  // Pilastro 1: Profilo e contesto
  let athleteProfile = '';
  if (isClinical) {
    athleteProfile = `Paziente in regime di tutela clinica (score rischio: ${riskProfile.score}, livello: ${riskProfile.level}). La programmazione e calibrata per garantire la riparazione connettivale e il controllo delle forze di taglio articolari.`;
  } else {
    athleteProfile = `Atleta praticante ${sport} con obiettivo prioritario "${goal}" e livello prestativo "${level}". Architettura formulata per stimolare adattamenti neuromuscolari mirati evitando sovrallenamento sistemico.`;
  }

  // Pilastro 2: Architettura di periodizzazione
  const details = PERIODIZATION_DETAILS[method];
  const periodizationArchitecture = `${details.name}: ${details.rationale} Schema progressivo: ${details.progressionPattern}`;

  // Pilastro 3: Prescrizioni biomeccaniche
  let biomechanicalPrescriptions = '';
  if (isClinical) {
    biomechanicalPrescriptions =
      'Prescrizione biomeccanica con limitazione rigorosa del ROM nei gradi critici (Escamilla et al. 2001), enfasi sulle contrazioni isometriche ed eccentriche e divieto di cedimento muscolare concentrico.';
  } else {
    biomechanicalPrescriptions =
      'Selezione degli esercizi secondo i piani di movimento e catene cinetiche principali. Distribuzione bilanciata del volume per i pattern di spinta, tirata, accosciata e cerniera d anca per minimizzare gli squilibri articolari.';
  }

  // Pilastro 4: Strategia VBT
  let vbtStrategy = '';
  if (isClinical) {
    vbtStrategy =
      'Controllo del tempo sotto tensione (TUT) con cadenza rallentata (3-0-1 o 4-0-1) per stimolare la meccanotrasduzione tenocitaria riducendo la velocita di picco.';
  } else {
    vbtStrategy =
      'Autoregolazione mediante Velocity-Based Training (González-Badillo & Sánchez-Medina 2010): arresto delle serie al raggiungimento della soglia del 10-20% di velocity loss per massimizzare la potenza senza affaticamento neurale residuo.';
  }

  // Citazioni accademiche
  const citations = [
    details.keyResearchers,
    'González-Badillo, J. J., & Sánchez-Medina, L. (2010). Movement velocity as a measure of loading intensity. IJSM.',
    'Schoenfeld, B. J. (2016). Science and Development of Muscle Hypertrophy. Human Kinetics.',
    'Samozino, P., et al. (2012). Optimal force-velocity profile in ballistic movements. MSSE.'
  ];

  return {
    athleteProfile,
    periodizationArchitecture,
    biomechanicalPrescriptions,
    vbtStrategy,
    citations
  };
}

/**
 * Costruisce gli esercizi formattati per una sessione.
 */
function buildSampleSessionExercises(
  isClinical: boolean,
  method: PeriodizationMethod,
  phaseIndex: number,
  availablePool: Exercise[]
): { warmup: FormattedExercise[]; exercises: FormattedExercise[]; cooldown: FormattedExercise[] } {
  // Warmup standard
  const warmup: FormattedExercise[] = [
    {
      id: 'wm_01',
      name: isClinical ? 'Mobilita Articolare Controllata & Isometria Precoce' : 'Warm-up Generale & Attivazione Dinamica',
      category: 'Warmup',
      sets: 2,
      reps: '10-12',
      rpe: 4,
      restSec: 45,
      tempo: '2-0-2',
      notes: 'Focus su temperatura tessutale ed escursione articolare senza fatica.'
    }
  ];

  // Cooldown standard
  const cooldown: FormattedExercise[] = [
    {
      id: 'cd_01',
      name: isClinical ? 'Defaticamento Passivo & Respirazione Diaframmatica' : 'Rilascio Miofasciale & Stretching Statico',
      category: 'Cooldown',
      sets: 1,
      reps: '5 min',
      rpe: 2,
      restSec: 0,
      tempo: 'Lento',
      notes: 'Ripristino del tono parasimpatico.'
    }
  ];

  // Esercizi target
  const pool = availablePool.length > 0 ? availablePool : allExercises;
  const picked = pool.slice(0, 4);

  const exercises: FormattedExercise[] = picked.map((ex, idx) => {
    const isMain = idx < 2;
    const sets = isClinical ? 3 : isMain ? 4 : 3;
    const reps = isClinical ? '10-12' : method === 'CONJUGATE' && isMain ? '3-5' : method === 'BLOCK' && phaseIndex === 2 ? '4-6' : '8-10';
    const loadPct = isClinical ? 50 : isMain ? 75 : 65;
    const rpe = isClinical ? 6 : isMain ? 8 : 7;
    const restSec = isClinical ? 60 : isMain ? 120 : 90;
    const tempo = isClinical ? '3-0-1' : '2-0-1';

    return {
      id: ex.id,
      name: ex.name,
      category: isClinical ? 'Clinical' : isMain ? 'Main' : 'Accessory',
      sets,
      reps,
      loadPct1RM: loadPct,
      rpe,
      restSec,
      tempo,
      notes: `Focus su tecnica e traiettoria biomeccanica (${ex.primaryMuscle}).`,
      exerciseRef: ex
    };
  });

  return { warmup, exercises, cooldown };
}

/**
 * Genera il piano di allenamento completo (WorkoutProgram) con fasi e sessioni.
 */
export function generateWorkoutProgram(
  params: PeriodizationSelectionParams,
  riskProfile: RiskAnalysisProfile
): WorkoutProgram {
  const isClinical = params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano';
  const method = selectPeriodizationMethod(params);
  const athleteName = params.athleteName && params.athleteName.trim().length > 0 ? params.athleteName.trim() : 'Atleta T7';
  const sport = params.sportPraticato || params.sport || 'Preparazione Atletica Generale';
  const goal = params.goal || (isClinical ? 'Rieducazione Funzionale' : 'Forza & Ipertrofia');

  const parsedWeeks = typeof params.weeks === 'number' ? params.weeks : parseInt(String(params.weeks), 10);
  const durationWeeks = isNaN(parsedWeeks) || parsedWeeks <= 0 ? 12 : parsedWeeks;

  const parsedDays = typeof params.days === 'number' ? params.days : parseInt(String(params.days), 10);
  const daysPerWeek = isNaN(parsedDays) || parsedDays <= 0 ? 3 : parsedDays;

  // Classifica gli esercizi disponibili
  const classified = classifyExercises(allExercises, []);
  const availablePool = classified.available;

  // Costruzione delle fasi
  const numPhases = isClinical ? 4 : method === 'BLOCK' ? 3 : 4;
  const weeksPerPhase = Math.max(1, Math.floor(durationWeeks / numPhases));
  const phases: PhaseBlueprint[] = [];

  for (let pIdx = 1; pIdx <= numPhases; pIdx++) {
    const isDeload = pIdx === numPhases && !isClinical;
    const sessions: WorkoutSession[] = [];

    for (let day = 1; day <= daysPerWeek; day++) {
      const { warmup, exercises, cooldown } = buildSampleSessionExercises(
        isClinical,
        method,
        pIdx,
        availablePool
      );

      sessions.push({
        dayName: `Giorno ${day}`,
        focus: isClinical
          ? `Seduta ${day} - Controllo Neuromuscolare & ROM Limitato`
          : `Seduta ${day} - ${getPhaseSplitName(pIdx, daysPerWeek, isClinical, method)}`,
        warmup,
        exercises,
        cooldown,
        estimatedDurationMin: isClinical ? 45 : 60
      });
    }

    let phaseName = '';
    let weeklyFocus = '';
    let intensityRange: [number, number] = [60, 70];
    let rpeCap = 7;
    let kneeRomLimitDeg: number | undefined = undefined;

    if (isClinical) {
      kneeRomLimitDeg = pIdx === 1 ? 60 : pIdx === 2 ? 80 : 90;
      phaseName = `Fase ${pIdx}: ${
        pIdx === 1
          ? 'Mobilita & Isometria Protetta'
          : pIdx === 2
          ? 'Forza Eccentrica Controllata'
          : pIdx === 3
          ? 'Potenziamento Dinamico Funzionale'
          : 'Transizione & Ritorno all Attivita'
      }`;
      weeklyFocus = `Controllo del ROM articolare (${kneeRomLimitDeg} deg) e attivazione senza sovraccarico.`;
      intensityRange = [45, 60];
      rpeCap = pIdx === 1 ? 6 : pIdx === 2 ? 7 : 7.5;
    } else {
      if (method === 'BLOCK') {
        phaseName =
          pIdx === 1
            ? 'Blocco 1: Accumulazione (Volume)'
            : pIdx === 2
            ? 'Blocco 2: Intensificazione (Carico)'
            : 'Blocco 3: Realizzazione & Tapering';
        intensityRange = pIdx === 1 ? [65, 75] : pIdx === 2 ? [80, 90] : [90, 97];
        weeklyFocus =
          pIdx === 1
            ? 'Accumulo di volume di lavoro ed ipertrofia specifica.'
            : pIdx === 2
            ? 'Conversione neurale ad alta intensita di carico.'
            : 'Picco di potenza e supercompensazione prestazionale.';
        rpeCap = pIdx === 3 ? 9 : 8.5;
      } else {
        phaseName = `Fase ${pIdx}: ${
          pIdx === 1
            ? 'Adattamento Anatomico & GPP'
            : pIdx === 2
            ? 'Sviluppo Ipertrofico & Forza Base'
            : pIdx === 3
            ? 'Intensificazione della Forza Massima'
            : 'Picco Prestazionale & Scarico'
        }`;
        intensityRange = pIdx === 1 ? [60, 70] : pIdx === 2 ? [70, 80] : pIdx === 3 ? [80, 87] : [60, 92];
        weeklyFocus = `Progressione secondo ${method} con focus su intensita e recupero neurale.`;
        rpeCap = isDeload ? 6 : 8.5;
      }
    }

    phases.push({
      phaseIndex: pIdx,
      name: phaseName,
      durationWeeks: weeksPerPhase,
      volumeTier: pIdx === 1 ? 'Alto' : pIdx === 2 ? 'Medio' : 'Basso',
      intensityPctRange: intensityRange,
      rpeCap,
      kneeRomLimitDeg,
      sessions,
      weeklyFocus
    });
  }

  const rationale = generateScientificRationale(params, method, riskProfile);

  return {
    id: `prog_${Date.now()}`,
    athleteName,
    sport,
    goal,
    durationWeeks,
    periodizationMethod: method,
    riskProfile,
    phases,
    rationale,
    createdAt: new Date().toISOString()
  };
}
