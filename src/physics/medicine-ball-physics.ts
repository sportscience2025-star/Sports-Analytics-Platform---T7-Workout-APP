/**
 * src/physics/medicine-ball-physics.ts
 * Motore di Fisica Biomeccanica e Cinematica Balistica per Lanci con Palla Medica.
 * Calcola velocità di uscita, potenza propulsiva media e di picco, lavoro meccanico,
 * regressioni empiriche di Sayers/Harman e traiettoria balistica 2D.
 *
 * Riferimenti scientifici:
 * - Sayers et al. (1999) - Medicine ball throw power estimations
 * - Harman et al. (1995) - Ballistic throw power equations
 * - Linthorne (2001) - Projectile dynamics in sports biomechanics
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

const GRAVITY_MPS2 = 9.81;
const DEFAULT_RELEASE_ANGLE_DEG = 45.0;
const DEFAULT_RELEASE_HEIGHT_M = 1.0;
const DEFAULT_PUSH_DURATION_S = 0.18;
const TRAJECTORY_SAMPLES_COUNT = 30;

export interface MedicineBallInput {
  mass: number;
  distance: number;
  flightTime?: number;
  releaseAngle?: number;
  releaseHeight?: number;
  pushDuration?: number;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
}

export interface MedicineBallResult {
  valid: boolean;
  isExtreme: boolean;
  exitVelocity: number;
  exitVelocityKmh: number;
  meanPower: number;
  peakPower: number;
  mechanicalWork: number;
  harmanPower: number;
  sayersPower: number;
  flightTimeCalculated: number;
  peakHeight: number;
  trajectory: TrajectoryPoint[];
}

/**
 * Calcola cinematica e potenza per un lancio balistico di palla medica.
 *
 * @param input - Parametri del lancio (massa, distanza, angolo, altezza rilascio)
 * @returns Risultati cinematici e di potenza
 */
export function calculateMedicineBallThrow(input: MedicineBallInput): MedicineBallResult {
  const mass = Number(input.mass);
  const distance = Number(input.distance);
  const g = GRAVITY_MPS2;

  // Controlli di validità
  if (isNaN(mass) || mass <= 0 || isNaN(distance) || distance <= 0) {
    return {
      valid: false,
      isExtreme: false,
      exitVelocity: 0,
      exitVelocityKmh: 0,
      meanPower: 0,
      peakPower: 0,
      mechanicalWork: 0,
      harmanPower: 0,
      sayersPower: 0,
      flightTimeCalculated: 0,
      peakHeight: 0,
      trajectory: [],
    };
  }

  const thetaDeg = input.releaseAngle ?? DEFAULT_RELEASE_ANGLE_DEG;
  const h0 = input.releaseHeight ?? DEFAULT_RELEASE_HEIGHT_M;
  const pushDuration = input.pushDuration ?? DEFAULT_PUSH_DURATION_S;
  const thetaRad = (thetaDeg * Math.PI) / 180;

  let v0 = 0;
  let flightTime = 0;

  if (input.flightTime && input.flightTime > 0) {
    flightTime = Number(input.flightTime);
    const cosTheta = Math.cos(thetaRad);
    v0 = cosTheta > 0 ? distance / (flightTime * cosTheta) : 0;
  } else {
    // Risoluzione equazione balistica:
    // y = h0 + x * tan(theta) - (g * x^2) / (2 * v0^2 * cos^2(theta))
    // A terra y = 0:
    // v0 = (x / cos(theta)) * sqrt( g / (2 * (x * tan(theta) + h0)) )
    const cosTheta = Math.cos(thetaRad);
    const sinTheta = Math.sin(thetaRad);
    const tanTheta = Math.tan(thetaRad);

    const denom = 2 * (cosTheta * cosTheta) * (distance * tanTheta + h0);
    if (denom > 0) {
      v0 = Math.sqrt((g * distance * distance) / denom);
      // Calcolo tempo di volo teorico
      const vy = v0 * sinTheta;
      const discriminant = vy * vy + 2 * g * h0;
      flightTime = discriminant >= 0 ? (vy + Math.sqrt(discriminant)) / g : 0;
    }
  }

  const exitVelocityKmh = Math.round(v0 * 3.6 * 10) / 10;
  const work = 0.5 * mass * v0 * v0 + mass * g * h0;
  const meanPower = pushDuration > 0 ? work / pushDuration : 0;
  const peakPower = 2 * meanPower;

  // Formule empiriche Sayers e Harman
  const sayersPower = Math.max(0, 21.67 * mass * distance + 1338);
  const harmanPower = Math.max(0, 61.9 * distance + 36.0 * mass + 1822);

  // Calcolo altezza massima di picco della traiettoria
  const vy = v0 * Math.sin(thetaRad);
  const peakHeight = h0 + (vy * vy) / (2 * g);

  // Generazione punti traiettoria 2D
  const trajectory: TrajectoryPoint[] = [];
  const stepX = distance / TRAJECTORY_SAMPLES_COUNT;
  const cosTheta = Math.cos(thetaRad);
  const tanTheta = Math.tan(thetaRad);

  for (let currentX = 0; currentX <= distance; currentX += stepX) {
    const y = h0 + currentX * tanTheta - (g * currentX * currentX) / (2 * v0 * v0 * cosTheta * cosTheta);
    trajectory.push({
      x: Math.round(currentX * 100) / 100,
      y: Math.max(0, Math.round(y * 100) / 100),
    });
  }

  // Verifica valori estremi anomali
  const isExtreme = v0 > 35 || distance > 30 || mass > 25;

  return {
    valid: true,
    isExtreme,
    exitVelocity: Math.round(v0 * 100) / 100,
    exitVelocityKmh,
    meanPower: Math.round(meanPower * 10) / 10,
    peakPower: Math.round(peakPower * 10) / 10,
    mechanicalWork: Math.round(work * 10) / 10,
    harmanPower: Math.round(harmanPower * 10) / 10,
    sayersPower: Math.round(sayersPower * 10) / 10,
    flightTimeCalculated: Math.round(flightTime * 1000) / 1000,
    peakHeight: Math.round(peakHeight * 100) / 100,
    trajectory,
  };
}
