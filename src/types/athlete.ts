/**
 * src/types/athlete.ts
 * Anagrafica Atleta, Gestione Squadre Bunker, Tattica e Disponibilita Sportiva.
 * Separazione rigorosa tra disponibilita sportiva e referto clinico EMR.
 * Conforme ad ADR-02 (Silos Multi-Tenant) e Regola 02.
 */

import { TierLevel, DataSiloPartition, SensitivityClass } from './tier';
import { Kilograms } from './physics';

export type AthleticAvailabilityStatus = 'fit' | 'caution' | 'rehab' | 'injured';

export type TacticalRole =
  | 'goalkeeper'
  | 'center_back'
  | 'full_back'
  | 'defensive_midfielder'
  | 'central_midfielder'
  | 'attacking_midfielder'
  | 'winger'
  | 'striker'
  | 'generic_athlete';

export type RtpPhase =
  | 'acute_protection'
  | 'subacute_reconditioning'
  | 'return_to_run'
  | 'return_to_training'
  | 'return_to_competition';

export interface DualTacticalRoleAssignment {
  primaryRole: TacticalRole;
  secondaryRole?: TacticalRole;
  primaryWeight: number; // Normalizzato 0.0 - 1.0 (es. 0.8)
  secondaryWeight: number; // Normalizzato 0.0 - 1.0 (es. 0.2, somma = 1.0)
}

export interface BodyMassRecord {
  date: string;
  weightKg: Kilograms;
  source: 'manual' | 'ble_smart_scale' | 'clinical_intake';
}

export interface BaselineHistory {
  metricKey: string;
  baselineModeApplied: 'INDIVIDUAL_HISTORICAL' | 'ROLE_COHORT_WEIGHTED_MEDIAN';
  value: number;
  sampleSize: number;
  lastUpdated: string;
}

export interface Athlete {
  id: string;
  name: string;
  surname: string;
  dateOfBirth?: string;
  tier: TierLevel;
  siloPartition: DataSiloPartition;
  sensitivityClass: SensitivityClass;
  tacticalRole: TacticalRole;
  dualRole?: DualTacticalRoleAssignment;
  availabilityStatus: AthleticAvailabilityStatus;
  currentRtpPhase?: RtpPhase;
  heightCm?: number;
  currentWeightKg?: Kilograms;
  bodyMassHistory?: readonly BodyMassRecord[];
  baselineMetrics?: readonly BaselineHistory[];
  teamId?: string;
  optInResearchWarehouse: boolean; // Consenso informato GDPR Silo 3
}

export interface Team {
  id: string;
  name: string;
  clubCode: string;
  tier: TierLevel;
  siloPartition: DataSiloPartition;
  kmsKeyId?: string; // Presente solo in Silo 2 (Tier 3 Bunker)
  rosterAthleteIds: readonly string[];
  staffUserIds: readonly string[];
  createdAt: string;
  updatedAt: string;
}

export type GlobalContextMode = 'team' | 'athlete';

export interface GlobalContextState {
  mode: GlobalContextMode;
  activeTeamId?: string;
  activeAthleteId?: string;
}

export const AVAILABILITY_FIT: AthleticAvailabilityStatus = 'fit';
export const AVAILABILITY_CAUTION: AthleticAvailabilityStatus = 'caution';
export const AVAILABILITY_REHAB: AthleticAvailabilityStatus = 'rehab';
export const AVAILABILITY_INJURED: AthleticAvailabilityStatus = 'injured';
