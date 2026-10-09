/**
 * src/logic/warmup-cooldown.ts
 * Generatore dei Protocolli di Riscaldamento Dinamico (Warmup) e Defaticamento (Cooldown).
 * Personalizzato in base a: stato clinico, fase della periodizzazione, sport praticato e distretti target.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import type { FormattedExercise } from '../types/program';

export interface WarmupCooldownOptions {
  phaseIndex: number;
  isClinical: boolean;
  sport?: string;
  focus?: string;
  patientType?: string;
}

/**
 * Genera il protocollo di riscaldamento specifico in testa alla seduta.
 *
 * @param options - Parametri clinici e di programmazione
 * @returns Array di esercizi di riscaldamento tipizzati come FormattedExercise
 */
export function buildWarmupProtocol(options: WarmupCooldownOptions): FormattedExercise[] {
  const { phaseIndex, isClinical, sport = '', focus = '', patientType = '' } = options;

  // 1. Protocollo per atleti o pazienti clinici / anziani
  if (isClinical || patientType === 'Clinico' || patientType === 'Clinico_Anziano' || patientType === 'Anziano') {
    if (phaseIndex === 1) {
      return [
        {
          id: 'w_cli_01',
          name: 'Cat-Cow Mobilità Spinale',
          category: 'Warmup',
          sets: 1,
          reps: '60s',
          rpe: 4,
          restSec: 30,
          tempo: 'Continuo',
          notes: 'Mobilizzazione fluida del rachide senza forzare i fine corsa.',
        },
        {
          id: 'w_cli_02',
          name: 'Ponte Glutei a Terra Bipodalico',
          category: 'Warmup',
          sets: 2,
          reps: '15',
          rpe: 5,
          restSec: 30,
          tempo: '2-1-2',
          notes: 'Attivazione glutei con retroversione del bacino a terra.',
        },
        {
          id: 'w_cli_03',
          name: 'Bird-Dog Attivazione Core e Multifido',
          category: 'Warmup',
          sets: 2,
          reps: '10/lato',
          rpe: 5,
          restSec: 30,
          tempo: '2-2-2',
          notes: 'Conservare stabilità del bacino orizzontale.',
        },
      ];
    }

    if (phaseIndex === 2 || phaseIndex === 3) {
      return [
        {
          id: 'w_cli_04',
          name: 'Step-up su Box Basso (10cm)',
          category: 'Warmup',
          sets: 2,
          reps: '10/lato',
          rpe: 5,
          restSec: 30,
          tempo: '3-0-1',
          notes: 'Discesa lenta controllata, ginocchio in asse col secondo dito.',
        },
        {
          id: 'w_cli_05',
          name: 'Clamshells Attivazione Medio Gluteo',
          category: 'Warmup',
          sets: 2,
          reps: '12/lato',
          rpe: 5,
          restSec: 30,
          tempo: '2-1-2',
          notes: 'Fianco a terra, piedi a contatto, bacino perpendicolare.',
        },
      ];
    }

    return [
      {
        id: 'w_cli_06',
        name: 'Squat a Corpo Libero (ROM controllato 80 deg)',
        category: 'Warmup',
        sets: 2,
        reps: '10',
        rpe: 5,
        restSec: 30,
        tempo: '2-1-2',
        notes: 'Discesa fluida senza sovraccaricare le articolazioni.',
      },
      {
        id: 'w_cli_07',
        name: 'Ponti Glutei Bipodalici Dinamici',
        category: 'Warmup',
        sets: 2,
        reps: '12',
        rpe: 5,
        restSec: 30,
        tempo: '2-1-2',
        notes: 'Attivazione della catena cinetica posteriore.',
      },
    ];
  }

  // 2. Protocollo per sport specifici
  if (sport === 'Atletica Leggera' || sport === 'Sprint') {
    return [
      {
        id: 'w_atl_01',
        name: 'Drills di Corsa (Skips A/B, Calciata Dietro)',
        category: 'Warmup',
        sets: 2,
        reps: '15m',
        rpe: 6,
        restSec: 30,
        tempo: 'Dinamico',
        notes: 'Focus su reattività caviglia e ciclo passata.',
      },
      {
        id: 'w_atl_02',
        name: 'Affondi Dinamici in Avanzamento con Torsione',
        category: 'Warmup',
        sets: 2,
        reps: '8/lato',
        rpe: 5,
        restSec: 30,
        tempo: 'Continuo',
        notes: 'Mobilità anca ed estensione toracica.',
      },
      {
        id: 'w_atl_03',
        name: 'Ponti Glutei Monopodalici',
        category: 'Warmup',
        sets: 2,
        reps: '10/lato',
        rpe: 6,
        restSec: 30,
        tempo: '2-1-1',
        notes: 'Pre-attivazione estensori dell anca.',
      },
    ];
  }

  if (sport === 'Calcio' || sport === 'Basket' || sport === 'Pallavolo') {
    return [
      {
        id: 'w_sq_01',
        name: 'Corsa a Navetta con Cambi di Direzione Soft',
        category: 'Warmup',
        sets: 1,
        reps: '5 min',
        rpe: 5,
        restSec: 45,
        tempo: 'Dinamico',
        notes: 'Innalzamento temperatura corporea e frequenza cardiaca.',
      },
      {
        id: 'w_sq_02',
        name: 'Single-Leg Balance & Reach',
        category: 'Warmup',
        sets: 2,
        reps: '8/lato',
        rpe: 5,
        restSec: 30,
        tempo: 'Controllato',
        notes: 'Propriocezione caviglia e ginocchio.',
      },
      {
        id: 'w_sq_03',
        name: 'Inchworm con Apertura Toracica',
        category: 'Warmup',
        sets: 2,
        reps: '6 reps',
        rpe: 5,
        restSec: 30,
        tempo: 'Continuo',
        notes: 'Allungamento catena posteriore e mobilità spalle.',
      },
    ];
  }

  // 3. Protocollo Standard per Allenamento di Forza / Ipertrofia
  const isLower = focus.toLowerCase().includes('gambe') || focus.toLowerCase().includes('lower');
  if (isLower) {
    return [
      {
        id: 'w_std_01',
        name: 'World Greatest Stretch (Affondo + Torsione Toracica)',
        category: 'Warmup',
        sets: 2,
        reps: '6/lato',
        rpe: 5,
        restSec: 30,
        tempo: 'Dinamico',
        notes: 'Mobilizzazione anca, caviglia e rachide toracico.',
      },
      {
        id: 'w_std_02',
        name: 'Cossack Squat a Corpo Libero',
        category: 'Warmup',
        sets: 2,
        reps: '8/lato',
        rpe: 5,
        restSec: 30,
        tempo: 'Controllato',
        notes: 'Allungamento adduttori e mobilità caviglia in dorsiflessione.',
      },
      {
        id: 'w_std_03',
        name: 'Band Glute Bridge con Extra-Rotazione',
        category: 'Warmup',
        sets: 2,
        reps: '15 reps',
        rpe: 5,
        restSec: 30,
        tempo: '2-1-2',
        notes: 'Attivazione piccolo e medio gluteo con loop band.',
      },
    ];
  }

  // Riscaldamento Upper Body Standard
  return [
    {
      id: 'w_up_01',
      name: 'Dislocazioni Spalle con Bastone o Elastico',
      category: 'Warmup',
      sets: 2,
      reps: '15 reps',
      rpe: 4,
      restSec: 30,
      tempo: 'Fluido',
      notes: 'Mobilità cingolo scapolo-omerale senza compensi lombari.',
    },
    {
      id: 'w_up_02',
      name: 'Band Pull-Apart (Retrazione ed Extra-Rotazione Scapolare)',
      category: 'Warmup',
      sets: 2,
      reps: '15 reps',
      rpe: 5,
      restSec: 30,
      tempo: '2-1-2',
      notes: 'Attivazione deltoidi posteriori e romboidi.',
    },
    {
      id: 'w_up_03',
      name: 'Push-up Plus su Rialzo (Protraente Scapolare)',
      category: 'Warmup',
      sets: 2,
      reps: '12 reps',
      rpe: 5,
      restSec: 30,
      tempo: '2-1-2',
      notes: 'Attivazione selettiva del gran dentato.',
    },
  ];
}

/**
 * Genera il protocollo di defaticamento (Cooldown) post-seduta.
 *
 * @param focus - Focus muscolare della seduta
 * @returns Array di esercizi di defaticamento tipizzati come FormattedExercise
 */
export function buildCooldownProtocol(focus: string = ''): FormattedExercise[] {
  const isLower = focus.toLowerCase().includes('gambe') || focus.toLowerCase().includes('lower');

  if (isLower) {
    return [
      {
        id: 'c_low_01',
        name: 'Stretching Statico Flessori Anca (Psoas)',
        category: 'Cooldown',
        sets: 2,
        reps: '45s/lato',
        rpe: 3,
        restSec: 15,
        tempo: 'Statico',
        notes: 'Retroversione attiva del bacino per allungare il retto femorale.',
      },
      {
        id: 'c_low_02',
        name: 'Stretching Ischio-Crurali a Terra con Corda/Elastico',
        category: 'Cooldown',
        sets: 2,
        reps: '45s/lato',
        rpe: 3,
        restSec: 15,
        tempo: 'Statico',
        notes: 'Ginocchio disteso, respirazione profonda diaframmatica.',
      },
      {
        id: 'c_low_03',
        name: 'Decompressione Spinale (Posizione del Bambino / Child Pose)',
        category: 'Cooldown',
        sets: 1,
        reps: '90s',
        rpe: 2,
        restSec: 0,
        tempo: 'Rilassamento',
        notes: 'Allungamento erettori spinali e decompressione del rachide.',
      },
    ];
  }

  return [
    {
      id: 'c_up_01',
      name: 'Stretching Pettorale al Muro a 90 deg',
      category: 'Cooldown',
      sets: 2,
      reps: '40s/lato',
      rpe: 3,
      restSec: 15,
      tempo: 'Statico',
      notes: 'Apertura scapolare ed espansione toracica.',
    },
    {
      id: 'c_up_02',
      name: 'Stretching Gran Dorsale a Presa Fissa (Barra o Rack)',
      category: 'Cooldown',
      sets: 2,
      reps: '40s/lato',
      rpe: 3,
      restSec: 15,
      tempo: 'Statico',
      notes: 'Allungamento miofasciale della catena laterale.',
    },
    {
      id: 'c_up_03',
      name: 'Respirazione Diaframmatica Supina 4-7-8',
      category: 'Cooldown',
      sets: 1,
      reps: '2 min',
      rpe: 1,
      restSec: 0,
      tempo: 'Respiratorio',
      notes: 'Attivazione del tono parasimpatico per accelerare il recupero.',
    },
  ];
}
