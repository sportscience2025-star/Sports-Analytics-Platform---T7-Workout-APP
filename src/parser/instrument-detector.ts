/**
 * src/parser/instrument-detector.ts
 * Classificazione automatica dello strumento di misura e del contesto sport science.
 * Riconosce 8 categorie strumentali esaminando metriche e intestazioni del file.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

export type InstrumentCategory =
  | 'VBT'
  | 'FORCE_PLATE'
  | 'BLOCK_ACCEL'
  | 'SPRINT_TIMING'
  | 'MEDICINE_BALL'
  | 'VIDEO_KINEMATICS'
  | 'JUMP_TEST'
  | 'GENERAL_TABULAR';

export interface InstrumentDetectionResult {
  type: InstrumentCategory;
  label: string;
  summary: string;
  metrics: string[];
}

/**
 * Classifica lo strumento analizzando le intestazioni delle colonne e un campione di record.
 *
 * @param headers - Intestazioni delle colonne del foglio di calcolo
 * @param sampleRecords - Record campione con valori estratti
 * @returns Risultato di classificazione dello strumento
 */
export function detectInstrumentType(
  headers: string[],
  sampleRecords: Record<string, unknown>[] = []
): InstrumentDetectionResult {
  const hStr = (headers || []).map((h) => String(h).toLowerCase()).join(' ');

  // 1. Pedana di Forza (Force Plate)
  const hasForceHeaders = /\b(f_?z|forza_?verticale|vertical_?force|kistler|hawkin|forcedecks|rfd|impulso|impulse)\b/i.test(hStr);
  if (hasForceHeaders) {
    return {
      type: 'FORCE_PLATE',
      label: 'Pedana di Forza (Hawkin Dynamics / ForceDecks / Kistler)',
      summary: 'Dati di forza verticale, RFD, picco di forza e impulso',
      metrics: ['forceZ', 'peakForce', 'rfd', 'impulse', 'rsimod'],
    };
  }

  // 2. Accelerometro Blocchi di Partenza (Sprint Acceleration)
  const hasAccelHeaders = /\b(accel|acceleraz|blocco|blocchi|block_?start|a_?horiz|reaction_?time)\b/i.test(hStr);
  if (hasAccelHeaders) {
    return {
      type: 'BLOCK_ACCEL',
      label: 'Accelerometro / Blocchi di Partenza',
      summary: 'Dati di accelerazione orizzontale e tempo di reazione',
      metrics: ['horizontalAccel', 'reactionTime', 'pushDuration'],
    };
  }

  // 3. Fotocellule Cronometraggio Sprint
  const hasSprintHeaders = /\b(split|fotocellula|timing|gate|tempo_?parziale|split_?time|freelap|microgate|witty)\b/i.test(hStr);
  if (hasSprintHeaders) {
    return {
      type: 'SPRINT_TIMING',
      label: 'Fotocellule Cronometraggio Sprint (Microgate / Freelap / Witty)',
      summary: 'Intertempi, velocità di sprint e tempi parziali',
      metrics: ['splitTime', 'splitDistance', 'splitSpeed'],
    };
  }

  // 4. Lancio Palla Medica
  const hasMedBallHeaders = /\b(palla_?medica|medicine_?ball|lancio|throw|getto|distanza_?lancio|throw_?dist)\b/i.test(hStr);
  if (hasMedBallHeaders) {
    return {
      type: 'MEDICINE_BALL',
      label: 'Lancio Palla Medica (Test Balistico)',
      summary: 'Distanza di lancio, massa palla e stima potenza di rilascio',
      metrics: ['distance', 'ballMass', 'exitVelocity', 'peakPower'],
    };
  }

  // 5. Test di Salto (Optojump / Pedana a contatto)
  const hasJumpHeaders = /\b(optojump|cmj|sj|flight_?time|tempo_?volo|contact_?time|tempo_?contatto|rsi)\b/i.test(hStr);
  if (hasJumpHeaders) {
    return {
      type: 'JUMP_TEST',
      label: 'Sistema Optoelettronico Salto (Optojump / Microgate)',
      summary: 'Altezza di salto, tempi di volo/contatto e RSI',
      metrics: ['jumpHeight', 'flightTime', 'contactTime', 'rsi'],
    };
  }

  // 6. Video Analisi Cinematica (Kinovea)
  const hasKinoveaHeaders = /\b(kinovea|coordinate|angolo|joint_?angle|traiettoria|pixel|tracking)\b/i.test(hStr);
  if (hasKinoveaHeaders) {
    return {
      type: 'VIDEO_KINEMATICS',
      label: 'Video Analisi Cinematica 2D (Kinovea)',
      summary: 'Angoli articolari, traiettorie e coordinate di tracking',
      metrics: ['jointAngle', 'angularVelocity', 'coordinates'],
    };
  }

  // 7. VBT Linear Encoder (Vitruve / GymAware / Speed4Lifts / Chronojump)
  const hasVbtHeaders = /\b(vmean|v_mean|vm|vmp|mpv|vmax|mean_?velocity|mean_?speed|velocit|velocity|speed|encoder|vitruve|gymaware|speed4lifts)\b/i.test(hStr) ||
    (/\b(load|carico|peso)\b/i.test(hStr) && /\b(vel|speed|m\/s)\b/i.test(hStr));

  const hasVbtData = sampleRecords.some((r) => {
    const l = Number(r.load || r.carico || r.weight);
    const v = Number(r.velocity || r.velocita || r.speed || r.vmean);
    return !isNaN(l) && l > 0 && !isNaN(v) && v > 0;
  });

  if (hasVbtHeaders || hasVbtData) {
    return {
      type: 'VBT',
      label: 'Encoder Lineare VBT (Vitruve / GymAware / Speed4Lifts)',
      summary: 'Profilo Carico-Velocità, velocità media concentrica e potenza',
      metrics: ['load', 'velocity', 'peakVelocity', 'power'],
    };
  }

  // Fallback generico
  return {
    type: 'GENERAL_TABULAR',
    label: 'Dataset Tabulare Generico Sport Science',
    summary: 'Dati tabulari sport science e serie storiche',
    metrics: headers.slice(0, 5),
  };
}
