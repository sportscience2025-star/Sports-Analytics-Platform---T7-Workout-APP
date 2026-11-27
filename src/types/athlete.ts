/**
 * src/types/athlete.ts
 * Anagrafica Atleta, Gestione Squadre Bunker, Tattica e Disponibilita Sportiva.
 * Separazione rigorosa tra disponibilita sportiva e referto clinico EMR.
 * Conforme ad ADR-02 (Silos Multi-Tenant) e Regola 02.
 */

import { TierLevel, DataSiloPartition, SensitivityClass } from './tier';
import { Kilograms } from './physics';

export const MIN_TACTICAL_ROLE_WEIGHT = 0.0;
export const MAX_TACTICAL_ROLE_WEIGHT = 1.0;
export const TACTICAL_ROLE_WEIGHT_SUM = 1.0;

export type AthleticAvailabilityStatus = 'fit' | 'caution' | 'rehab' | 'injured';

/**
 * Stato clinico / disponibilita sportiva dell'atleta (contratto IMPLEMENTATION_ROADMAP).
 */
export type ClinicalStatus = AthleticAvailabilityStatus;

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

/**
 * Assegnazione tattica a ruolo primario o doppio ruolo ponderato.
 * Invariante: `primaryWeight + (secondaryWeight ?? 0) === TACTICAL_ROLE_WEIGHT_SUM` (1.0),
 * con ciascun peso normalizzato nell'intervallo [MIN_TACTICAL_ROLE_WEIGHT, MAX_TACTICAL_ROLE_WEIGHT].
 */
export interface DualTacticalRoleAssignment {
  primaryRole: TacticalRole;
  primaryWeight: number; // Normalizzato 0.0 - 1.0 (es. 0.8); invariante: primaryWeight + (secondaryWeight ?? 0) === 1.0
  secondaryRole?: TacticalRole;
  secondaryWeight?: number; // Normalizzato 0.0 - 1.0 (es. 0.2), obbligatorio quando secondaryRole e valorizzato
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

/**
 * Profilo atleta operativo (Silo 1 Consumer o Silo 2 Club Bunker).
 * Invariante ADR-02: il passaggio verso Silo 3 (`silo3_research`) richiede `optInResearchWarehouse === true`
 * e la rimozione irreversibile di ogni PII (`name`, `surname`, `dateOfBirth`) tramite {@link DeidentifiedResearchAthlete}.
 */
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

/**
 * Proiezione anonimizzata di un record atleta destinata esclusivamente al Silo 3 Research Warehouse (ADR-02).
 * Esclude categoricamente identificativi personali diretti (nome, cognome, data di nascita, teamId).
 */
export interface DeidentifiedResearchAthlete {
  pseudonymId: string;
  siloPartition: 'silo3_research';
  sensitivityClass: SensitivityClass;
  tacticalRole: TacticalRole;
  dualRole?: DualTacticalRoleAssignment;
  availabilityStatus: AthleticAvailabilityStatus;
  currentRtpPhase?: RtpPhase;
  heightCm?: number;
  currentWeightKg?: Kilograms;
  bodyMassHistory?: readonly BodyMassRecord[];
  baselineMetrics?: readonly BaselineHistory[];
  optInResearchWarehouse: true;
}

/**
 * Squadra / Club multi-tenant.
 * Invariante ADR-02 (Silo 2): quando `siloPartition === 'silo2_club_bunker'` (Tier 3 Elite Club),
 * `kmsKeyId` identifica la chiave crittografica KMS dedicata del tenant ed e obbligatorio lato server.
 */
export interface Team {
  id: string;
  name: string;
  clubCode: string;
  tier: TierLevel;
  siloPartition: DataSiloPartition;
  kmsKeyId?: string; // Obbligatorio in Silo 2 ('silo2_club_bunker' / Tier 3 Bunker) per isolamento crittografico tenant
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
