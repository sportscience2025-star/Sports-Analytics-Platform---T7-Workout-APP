/**
 * src/logic/session-builder.ts
 * Motore Deterministico per la Composizione e Generazione delle Sedute di Allenamento (WorkoutSession).
 * Gestisce:
 * 1. Protocolli chirurgici per riabilitazione ginocchio (fasi cliniche 1..8).
 * 2. Selezione biomeccanica degli esercizi fondamentali e accessori in base al focus di giornata.
 * 3. Assegnazione di serie, ripetizioni, percentuali di carico, tempo esecutivo e recupero.
 * 4. Integrazione con warmup e cooldown specifici.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import type { FormattedExercise, WorkoutSession } from '../types/program';
import type { Exercise } from '../types/exercise';
import { buildWarmupProtocol, buildCooldownProtocol } from './warmup-cooldown';

export interface BuildSessionOptions {
  phaseIndex: number;
  dayIndex: number;
  totalDays: number;
  focus: string;
  isClinical: boolean;
  patientType?: string;
  sport?: string;
  equipment?: string;
  intensityRange: [number, number];
  rpeCap: number;
  availableExercises: Exercise[];
}

/**
 * Giorni della settimana standard per la denominazione delle sedute.
 */
const DAY_NAMES = [
  'Giorno 1 — Lunedì',
  'Giorno 2 — Mercoledì',
  'Giorno 3 — Venerdì',
  'Giorno 4 — Sabato',
  'Giorno 5 — Martedì',
  'Giorno 6 — Giovedì',
];

/**
 * Costanti di default per evitare numeri magici (Regola 02).
 */
const DEFAULT_SETS = 3;
const DEFAULT_REST_SEC = 90;
const DEFAULT_SESSION_DURATION_MIN = 60;
const CLINICAL_SESSION_DURATION_MIN = 45;

/**
 * Protocollo di esercizi clinici per riabilitazione ginocchio (fasi 1..3).
 */
function buildClinicalKneeExercises(phaseIndex: number, focus: string): FormattedExercise[] {
  if (phaseIndex === 1) {
    if (focus.includes('Glutei') || focus.includes('Core')) {
      return [
        {
          id: 'cli_01',
          name: 'Isometric Wall Sit (Angolo limitato a 60 deg flessione)',
          category: 'Clinical',
          sets: 3,
          reps: '30s',
          rpe: 6,
          restSec: 60,
          tempo: 'Isometria',
          notes: 'Limitare flessione ginocchio a 60 gradi. Schiaccia una pallina morbida tra le ginocchia.',
        },
        {
          id: 'cli_02',
          name: 'Ponte Glutei Monolaterale (a terra)',
          category: 'Clinical',
          sets: 3,
          reps: '10/lato',
          rpe: 6,
          restSec: 60,
          tempo: '2-1-2',
          notes: 'Spingi dal tallone, contrai il gluteo attivamente senza inarcare la schiena.',
        },
        {
          id: 'cli_03',
          name: 'Standard Plank sui gomiti',
          category: 'Clinical',
          sets: 3,
          reps: '45s',
          rpe: 6,
          restSec: 60,
          tempo: 'Isometria',
          notes: 'Mantieni allineamento neutro spalle-bacino-caviglie.',
        },
      ];
    }

    return [
      {
        id: 'cli_04',
        name: 'Goblet Squat su Box Alto (Angolo ginocchio max 60 deg)',
        category: 'Clinical',
        sets: 3,
        reps: '10',
        rpe: 5,
        restSec: 75,
        tempo: '3-1-1',
        notes: 'Limitare flessione ginocchio a 60 gradi. Box alto funge da blocco meccanico di sicurezza.',
      },
      {
        id: 'cli_05',
        name: 'Stacco Rumeno leggero con Manubri',
        category: 'Clinical',
        sets: 3,
        reps: '10',
        rpe: 6,
        restSec: 60,
        tempo: '3-0-2',
        notes: 'Sblocca le ginocchia solo di 10-15 gradi e spingi il bacino indietro.',
      },
      {
        id: 'cli_06',
        name: 'Straight Leg Raise (Supino, anca flessa 45 deg)',
        category: 'Clinical',
        sets: 3,
        reps: '12/lato',
        rpe: 6,
        restSec: 45,
        tempo: '2-0-2',
        notes: 'Mantieni il ginocchio teso attivamente durante tutto il sollevamento.',
      },
    ];
  }

  // Fasi avanzate cliniche (Fase 2 o 3)
  return [
    {
      id: 'cli_08',
      name: 'Step-up su Box Basso (Altezza 10cm, discesa lenta)',
      category: 'Clinical',
      sets: 3,
      reps: '10/lato',
      rpe: 6,
      restSec: 60,
      tempo: '3-0-1',
      notes: 'Focalizzati sulla discesa controllata di 3 secondi. Il ginocchio deve seguire il piede.',
    },
    {
      id: 'cli_09',
      name: 'Leg Press a 45 deg (Range limitato a 80 deg flessione)',
      category: 'Clinical',
      sets: 3,
      reps: '12',
      rpe: 6,
      restSec: 75,
      tempo: '2-1-2',
      notes: 'Piedi alti e larghi sulla pedana per minimizzare le forze di taglio rotulee.',
    },
    {
      id: 'cli_10',
      name: 'Leg Curl Seduto con Range Protetto',
      category: 'Clinical',
      sets: 3,
      reps: '12',
      rpe: 6,
      restSec: 60,
      tempo: '2-0-2',
      notes: 'Rafforzamento selettivo degli ischio-crurali per stabilità del crociato.',
    },
  ];
}

/**
 * Seleziona esercizi compatibili dal catalogo in base al focus muscolare e all'attrezzatura.
 */
function pickExercisesForFocus(
  catalog: Exercise[],
  focus: string,
  userEquipment: string = '',
  count: number = 4,
  dayOffset: number = 0
): Exercise[] {
  const normalizedFocus = focus.toLowerCase();

  const isEquipmentOk = (ex: Exercise): boolean => {
    if (!userEquipment || userEquipment === 'Completa' || userEquipment === 'Palestra') return true;
    if (userEquipment === 'Calisthenics') return ex.equipment === 'Corpo Libero' || ex.equipment === 'Sbarra Trazioni';
    if (userEquipment === 'Minimal' || userEquipment === 'Casa') {
      return ['Corpo Libero', 'Manubri', 'Bilanciere', 'Panca'].includes(ex.equipment);
    }
    return true;
  };

  const matched = catalog.filter((ex) => {
    if (!isEquipmentOk(ex)) return false;
    const pm = ex.primaryMuscle.toLowerCase();

    if (normalizedFocus.includes('spinta') || normalizedFocus.includes('push') || normalizedFocus.includes('petto')) {
      return pm.includes('petto') || pm.includes('deltoide') || pm.includes('tricipite');
    }

    if (normalizedFocus.includes('tirata') || normalizedFocus.includes('pull') || normalizedFocus.includes('dorso')) {
      return pm.includes('dorsale') || pm.includes('trapezio') || pm.includes('bicipite');
    }

    if (normalizedFocus.includes('lower') || normalizedFocus.includes('gambe') || normalizedFocus.includes('squat')) {
      return pm.includes('vasto') || pm.includes('gluteo') || pm.includes('femorale') || pm.includes('gastrocnemio');
    }

    if (normalizedFocus.includes('potenza')) {
      return ex.type === 'Multiarticolare' && (ex.quality === 'Potenza' || ex.quality === 'Forza');
    }

    // Default Full Body / Rotazione per dayOffset
    return true;
  });

  const pool = matched.length >= count ? matched : catalog;

  // Seleziona un subset bilanciato tra multiarticolari e isolamento, ruotando con dayOffset
  const multi = pool.filter((ex) => ex.type === 'Multiarticolare');
  const iso = pool.filter((ex) => ex.type === 'Isolamento' || ex.type === 'Isometrico');

  const selected: Exercise[] = [];
  const multiStart = multi.length > 0 ? (dayOffset * 2) % multi.length : 0;
  const isoStart = iso.length > 0 ? (dayOffset * 2) % iso.length : 0;

  if (multi.length > 0) selected.push(multi[multiStart]);
  if (multi.length > 1) selected.push(multi[(multiStart + 1) % multi.length]);
  if (iso.length > 0) selected.push(iso[isoStart]);
  if (iso.length > 1) selected.push(iso[(isoStart + 1) % iso.length]);

  let fallbackIdx = (dayOffset * count) % pool.length;
  while (selected.length < count && selected.length < pool.length) {
    const candidate = pool[fallbackIdx % pool.length];
    if (!selected.some((s) => s.id === candidate.id)) {
      selected.push(candidate);
    }
    fallbackIdx++;
  }

  return selected;
}

/**
 * Costruisce una sessione di allenamento (WorkoutSession) completa e validata.
 *
 * @param options - Configurazione della seduta
 * @returns Oggetto WorkoutSession pronto per il rendering
 */
export function buildWorkoutSession(options: BuildSessionOptions): WorkoutSession {
  const {
    phaseIndex,
    dayIndex,
    focus,
    isClinical,
    patientType,
    sport,
    equipment,
    intensityRange,
    rpeCap,
    availableExercises,
  } = options;

  const dayName = DAY_NAMES[(dayIndex - 1) % DAY_NAMES.length];

  // 1. Riscaldamento
  const warmup = buildWarmupProtocol({
    phaseIndex,
    isClinical,
    sport,
    focus,
    patientType,
  });

  // 2. Defaticamento
  const cooldown = buildCooldownProtocol(focus);

  // 3. Esercizi della Seduta
  let exercises: FormattedExercise[] = [];

  if (isClinical && patientType !== 'Atleta') {
    exercises = buildClinicalKneeExercises(phaseIndex, focus);
  } else {
    const rawExercises = pickExercisesForFocus(availableExercises, focus, equipment, 4, dayIndex);
    const isStrengthFocus = focus.toLowerCase().includes('forza');
    const isHypertrophyFocus = focus.toLowerCase().includes('ipertrofia');
    const isPowerFocus = focus.toLowerCase().includes('potenza');
    const isDeload = focus.toLowerCase().includes('scarico') || rpeCap <= 6;

    exercises = rawExercises.map((ex, idx) => {
      const isMain = idx < 2 && ex.type === 'Multiarticolare';
      let sets = isMain ? 4 : DEFAULT_SETS;
      let reps: string | number = isMain ? 6 : 10;
      let loadPct = Math.round(intensityRange[0] + (intensityRange[1] - intensityRange[0]) * 0.5);
      let rpe = Math.min(rpeCap, isMain ? rpeCap : Math.max(5, rpeCap - 1));
      let restSec = isMain ? 120 : DEFAULT_REST_SEC;
      let tempo = isMain ? '2-0-1' : '2-1-2';

      if (isDeload) {
        sets = isMain ? 3 : 2;
        reps = '8-10';
        loadPct = Math.max(45, Math.round(intensityRange[0] * 0.9));
        rpe = 5.5;
        restSec = 60;
        tempo = '2-0-2';
      } else if (isStrengthFocus) {
        sets = isMain ? 4 : 3;
        reps = isMain ? '3-5' : '6-8';
        loadPct = isMain ? Math.max(intensityRange[1] - 3, 78) : Math.max(intensityRange[0], 68);
        restSec = isMain ? 150 : 90;
        tempo = isMain ? '2-0-1' : '2-1-1';
      } else if (isHypertrophyFocus) {
        sets = isMain ? 4 : 3;
        reps = isMain ? '8-10' : '10-12';
        loadPct = isMain ? 72 : 65;
        restSec = isMain ? 90 : 60;
        tempo = '3-1-2';
      } else if (isPowerFocus) {
        sets = isMain ? 4 : 3;
        reps = isMain ? '3-5' : '5-6';
        loadPct = isMain ? 58 : 50;
        restSec = isMain ? 120 : 90;
        tempo = 'X-0-1';
      }

      return {
        id: ex.id,
        name: ex.name,
        category: (isMain ? 'Main' : 'Accessory') as FormattedExercise['category'],
        sets,
        reps,
        loadPct1RM: loadPct,
        rpe,
        restSec,
        tempo,
        exerciseRef: ex,
        notes: ex.execution.cues ? ex.execution.cues[0] : `Focus su traiettoria e stabilità (${ex.primaryMuscle}).`,
      };
    });
  }

  const estimatedDurationMin = isClinical
    ? CLINICAL_SESSION_DURATION_MIN
    : DEFAULT_SESSION_DURATION_MIN;

  return {
    dayName,
    focus,
    warmup,
    exercises,
    cooldown,
    estimatedDurationMin,
  };
}
