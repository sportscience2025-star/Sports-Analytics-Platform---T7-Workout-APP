/**
 * src/features/home/home-mock-data.ts
 * Tipi di dominio, costanti metrologiche, guardie RBAC/privacy e fixture demo
 * per la Home Dashboard & Control Room Cockpit (TASK-010).
 * Conforme ad ADR-01 (Thin Client), ADR-02 (3 Silos Stagni), ADR-03 (SI) e Regole 01/02.
 */

import {
  AppModuleId,
  AthleticAvailabilityStatus,
  GlobalContextMode,
  RtpPhase,
  SILO2_CLUB_BUNKER,
  TIER_LEVEL_ELITE,
  TierLevel,
  UserRole
} from '../../types';
import {
  computeEffectivePermissions,
  isRoleAllowedInTier,
  isValidRole,
  isValidTier,
  resolveDataSilo
} from '../../context/TierContext';
import { clampToRange, sanitizeNumeric } from '../../utils/metrology-guard';
import {
  formatLoad,
  formatNumericValue,
  NARROW_NO_BREAK_SPACE,
  PLACEHOLDER_EMPTY_DASH
} from '../../utils/number-format';
import { sanitizeDisplayText } from '../../components/common/ui-state-utils';
import type { ViewStateStatus } from '../../components/common/ViewStateContainer';

// ============================================================================
// COSTANTI DOCUMENTATE & SOGLIE METROLOGICHE (ZERO MAGIC NUMBERS)
// ============================================================================

export const ACWR_HIGH_RISK_THRESHOLD = 1.50;
export const READINESS_ALERT_THRESHOLD = 65;
export const MAX_SESSION_TONNAGE_KG = 250000;
export const MAX_SESSION_DURATION_MIN = 600;
export const MIN_POSITIVE_METRIC = 0;

export const UNIT_MINUTES_SHORT = 'min';
export const CERTIFICATION_BADGE_LABEL = 'T7 VERIFIED';
export const DEFAULT_BASELINE_MIN_MONTHS = 6;

export const ROLE_ATHLETE_RESTRICTED: UserRole = 'athlete';
export const ROLE_RESEARCHER_RESTRICTED: UserRole = 'researcher';

export type MicrocycleSessionCategory = 'Forza/VBT' | 'Field/GPS' | 'Recovery' | 'Match' | 'Test';
export type MicrocycleLoadFocus = 'Alta' | 'Media' | 'Bassa' | 'Gara';
export type TeamHealthAlertCategory = 'acwr_spike' | 'readiness_drop' | 'rtp_status' | 'nutrition_flag';

// ============================================================================
// CONTRATTI DATI (PRIVO DI DIAGNOSI CLINICHE EMR - GDPR ART. 9)
// ============================================================================

export interface DailyWorkoutPlan {
  readonly id: string;
  readonly athleteId: string;
  readonly teamId: string;
  readonly title: string;
  readonly focus: string;
  readonly estimatedVolumeKg: number;
  readonly estimatedDurationMin: number;
  readonly exercisesCount: number;
  readonly targetRpe: number;
  readonly scheduledSlot: string;
  readonly isCalibratingBaseline?: boolean;
  readonly baselineSessionCount?: number;
}

export interface PrHighlightItem {
  readonly exerciseName: string;
  readonly metricText: string;
}

export interface CertifiedT7Card {
  readonly id: string;
  readonly athleteId: string;
  readonly athleteName: string;
  readonly teamId: string;
  readonly completedDateLabel: string;
  readonly sessionTitle: string;
  readonly totalVolumeKg: number;
  readonly durationMin: number;
  readonly prCount: number;
  readonly prHighlights: readonly PrHighlightItem[];
  readonly certificationCode: string;
  readonly availabilityStatusAtSession?: AthleticAvailabilityStatus;
}

export interface ShareableT7Summary {
  readonly cardId: string;
  readonly workoutTitle: string;
  readonly completedDate: string;
  readonly formattedVolumeKg: string;
  readonly formattedDurationMin: string;
  readonly prCount: number;
  readonly prHighlights: readonly PrHighlightItem[];
  readonly certificationBadge: string;
}

export interface MicrocycleDaySlot {
  readonly id: string;
  readonly teamId: string;
  readonly dayTag: string;
  readonly dayLabel: string;
  readonly dateLabel: string;
  readonly sessionType: MicrocycleSessionCategory;
  readonly loadFocus: MicrocycleLoadFocus;
  readonly eventNote: string;
  readonly isToday: boolean;
  readonly isMatchOrTest: boolean;
}

export interface TeamHealthAlert {
  readonly id: string;
  readonly teamId: string;
  readonly athleteId: string;
  readonly athleteName: string;
  readonly category: TeamHealthAlertCategory;
  readonly availabilityStatus: Exclude<AthleticAvailabilityStatus, 'fit'>;
  readonly rtpPhase?: RtpPhase;
  readonly acwr?: number;
  readonly readinessScore?: number;
  readonly operationalNote: string;
}

// ============================================================================
// FIXTURE DIMOSTRATIVE COERENTI CON DEMO_TEAMS (team_pro_01) E DEMO_ATHLETES
// ============================================================================

export const DEMO_DAILY_WORKOUTS: readonly DailyWorkoutPlan[] = Object.freeze([
  {
    id: 'wkt_today_01',
    athleteId: 'ath_01',
    teamId: 'team_pro_01',
    title: 'Forza Esplosiva & VBT Lower Body',
    focus: 'Potenza picco squat & contrasto balistico (target >= 0,75 m/s)',
    estimatedVolumeKg: 4850,
    estimatedDurationMin: 65,
    exercisesCount: 6,
    targetRpe: 8,
    scheduledSlot: '10:30 - 11:35'
  },
  {
    id: 'wkt_today_02',
    athleteId: 'ath_02',
    teamId: 'team_pro_01',
    title: 'Conditioning Adattato & Mobilita Anca',
    focus: 'Modulazione carico esterno + pre-attivazione catena posteriore',
    estimatedVolumeKg: 2640,
    estimatedDurationMin: 45,
    exercisesCount: 5,
    targetRpe: 6,
    scheduledSlot: '11:00 - 11:45',
    isCalibratingBaseline: true,
    baselineSessionCount: 4
  },
  {
    id: 'wkt_today_03',
    athleteId: 'ath_03',
    teamId: 'team_pro_01',
    title: 'Ricondizionamento Neuromuscolare Controllato',
    focus: 'Controllo eccentrico e stabilita monopodalica (Protocollo RTP)',
    estimatedVolumeKg: 1420,
    estimatedDurationMin: 40,
    exercisesCount: 4,
    targetRpe: 5,
    scheduledSlot: '15:00 - 15:40'
  }
]);

export const DEMO_CERTIFIED_T7_CARDS: readonly CertifiedT7Card[] = Object.freeze([
  {
    id: 'card_t7_901',
    athleteId: 'ath_01',
    athleteName: 'Marco Rossi',
    teamId: 'team_pro_01',
    completedDateLabel: 'Ieri, 18:10',
    sessionTitle: 'Block Pull & Sprint Accelerazione',
    totalVolumeKg: 6420,
    durationMin: 72,
    prCount: 2,
    prHighlights: Object.freeze([
      { exerciseName: 'Back Squat VBT', metricText: '0,88 m/s @ 110 kg' },
      { exerciseName: 'CMJ Potenza Picco', metricText: '4420 W' }
    ]),
    certificationCode: 'T7-CERT-901A',
    availabilityStatusAtSession: 'fit'
  },
  {
    id: 'card_t7_902',
    athleteId: 'ath_02',
    athleteName: 'Luca Bianchi',
    teamId: 'team_pro_01',
    completedDateLabel: '2 giorni fa',
    sessionTitle: 'Forza Resistente & Core Stability',
    totalVolumeKg: 3890,
    durationMin: 54,
    prCount: 1,
    prHighlights: Object.freeze([
      { exerciseName: 'Trap Bar Deadlift', metricText: '135,0 kg' }
    ]),
    certificationCode: 'T7-CERT-902B',
    availabilityStatusAtSession: 'caution'
  },
  {
    id: 'card_t7_903',
    athleteId: 'ath_01',
    athleteName: 'Marco Rossi',
    teamId: 'team_pro_01',
    completedDateLabel: '4 giorni fa',
    sessionTitle: 'Upper Power & PAP Bench Press',
    totalVolumeKg: 4180,
    durationMin: 58,
    prCount: 1,
    prHighlights: Object.freeze([
      { exerciseName: 'Panca Piana MPV', metricText: '0,76 m/s @ 90 kg' }
    ]),
    certificationCode: 'T7-CERT-903C',
    availabilityStatusAtSession: 'fit'
  }
]);

export const DEMO_MICROCYCLE_SLOTS: readonly MicrocycleDaySlot[] = Object.freeze([
  {
    id: 'mc_md4',
    teamId: 'team_pro_01',
    dayTag: 'MD-4',
    dayLabel: 'Mer',
    dateLabel: '25 Nov',
    sessionType: 'Forza/VBT',
    loadFocus: 'Alta',
    eventNote: 'Picco forza massima e VBT',
    isToday: false,
    isMatchOrTest: false
  },
  {
    id: 'mc_md3',
    teamId: 'team_pro_01',
    dayTag: 'MD-3',
    dayLabel: 'Gio',
    dateLabel: '26 Nov',
    sessionType: 'Field/GPS',
    loadFocus: 'Alta',
    eventNote: 'Esercitazioni campo HSR & sprint',
    isToday: false,
    isMatchOrTest: false
  },
  {
    id: 'mc_md2',
    teamId: 'team_pro_01',
    dayTag: 'MD-2',
    dayLabel: 'Ven',
    dateLabel: '27 Nov',
    sessionType: 'Test',
    loadFocus: 'Media',
    eventNote: 'Test reattivita CMJ & PVT-B mattina',
    isToday: false,
    isMatchOrTest: true
  },
  {
    id: 'mc_md1',
    teamId: 'team_pro_01',
    dayTag: 'MD-1',
    dayLabel: 'Sab',
    dateLabel: '28 Nov',
    sessionType: 'Recovery',
    loadFocus: 'Bassa',
    eventNote: 'Attivazione neurale pre-gara',
    isToday: true,
    isMatchOrTest: false
  },
  {
    id: 'mc_md0',
    teamId: 'team_pro_01',
    dayTag: 'MD',
    dayLabel: 'Dom',
    dateLabel: '29 Nov',
    sessionType: 'Match',
    loadFocus: 'Gara',
    eventNote: 'Gara di Campionato • Kick-off 15:00',
    isToday: false,
    isMatchOrTest: true
  }
]);

export const DEMO_TEAM_HEALTH_ALERTS: readonly TeamHealthAlert[] = Object.freeze([
  {
    id: 'alert_01',
    teamId: 'team_pro_01',
    athleteId: 'ath_02',
    athleteName: 'Luca Bianchi',
    category: 'acwr_spike',
    availabilityStatus: 'caution',
    acwr: 1.68,
    readinessScore: 68,
    operationalNote: 'ACWR acuto sopra soglia 1,50 — Modulare volume ad alta velocita.'
  },
  {
    id: 'alert_02',
    teamId: 'team_pro_01',
    athleteId: 'ath_03',
    athleteName: 'Alessandro Esposito',
    category: 'readiness_drop',
    availabilityStatus: 'rehab',
    rtpPhase: 'return_to_training',
    readinessScore: 54,
    operationalNote: 'Readiness sotto soglia 65 — Verifica pre-seduta con staff.'
  },
  {
    id: 'alert_03',
    teamId: 'team_pro_01',
    athleteId: 'ath_04',
    athleteName: 'Matteo Ferrari',
    category: 'nutrition_flag',
    availabilityStatus: 'injured',
    rtpPhase: 'acute_protection',
    readinessScore: 48,
    operationalNote: 'Flag stato carico/nutrizionale — Richiesta valutazione staff autorizzato.'
  }
]);

// ============================================================================
// GUARDIE RBAC, PRIVACY & FORMATTAZIONE METROLOGICA SI
// ============================================================================

/**
 * Verifica fail-closed se l'utente corrente e autorizzato a visualizzare gli alert prioritari di squadra.
 * Richiede Tier 3 Elite Club, ruolo staff operativo (esclusi `athlete` e `researcher`),
 * partizione Silo 2 Club Bunker e permesso `canAccessMultiStaffBunker`.
 * @param tier Livello di abbonamento attivo
 * @param role Ruolo RBAC attivo
 * @returns true solo per staff autorizzato in Tier 3
 */
export function isAuthorizedForTeamAlerts(tier: TierLevel, role: UserRole): boolean {
  if (!isValidTier(tier) || !isValidRole(role)) {
    return false;
  }
  if (tier !== TIER_LEVEL_ELITE) {
    return false;
  }
  if (!isRoleAllowedInTier(tier, role)) {
    return false;
  }
  if (role === ROLE_ATHLETE_RESTRICTED || role === ROLE_RESEARCHER_RESTRICTED) {
    return false;
  }
  if (resolveDataSilo(tier, role) !== SILO2_CLUB_BUNKER) {
    return false;
  }
  return computeEffectivePermissions(tier, role).canAccessMultiStaffBunker === true;
}

/**
 * Formatta il tonnellaggio cumulativo di seduta in kg rispettando il Sistema Internazionale.
 * Preserva `-- kg` per valori assenti/corrotti (`NaN`, `Infinity`, negativi) e normalizza `-0`.
 * @param volumeKg Tonnellaggio totale della sessione in kg (puo superare 1000 kg)
 * @returns Stringa formattata con spazio sottile SI (es. `4.850,0 kg` o `-- kg`)
 */
export function formatSessionTonnageKg(volumeKg: number | null | undefined): string {
  if (typeof volumeKg !== 'number' || !Number.isFinite(volumeKg) || volumeKg < MIN_POSITIVE_METRIC) {
    return formatLoad(null);
  }
  const normalizedZero = volumeKg === 0 ? 0 : volumeKg;
  const clamped = clampToRange(normalizedZero, MIN_POSITIVE_METRIC, MAX_SESSION_TONNAGE_KG);
  return formatLoad(clamped);
}

/**
 * Formatta la durata di una seduta in minuti con protezione da `NaN` e valori negativi.
 * @param durationMin Durata stimata o effettiva in minuti
 * @returns Stringa formattata (`65 min` o `-- min`)
 */
export function formatSessionDurationMin(durationMin: number | null | undefined): string {
  if (typeof durationMin !== 'number' || !Number.isFinite(durationMin) || durationMin < MIN_POSITIVE_METRIC) {
    return `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}${UNIT_MINUTES_SHORT}`;
  }
  const clamped = clampToRange(Math.round(durationMin), MIN_POSITIVE_METRIC, MAX_SESSION_DURATION_MIN);
  return `${formatNumericValue(clamped, 0)}${NARROW_NO_BREAK_SPACE}${UNIT_MINUTES_SHORT}`;
}

/**
 * Formatta in modo sicuro il rapporto ACWR adimensionale a 2 decimali.
 * @param acwr Valore ACWR pre-calcolato dal server
 * @returns Valore formattato in locale italiano (es. `1,68`) o placeholder `--`
 */
export function formatAcwrMetric(acwr: number | null | undefined): string {
  if (typeof acwr !== 'number' || !Number.isFinite(acwr) || acwr < MIN_POSITIVE_METRIC) {
    return PLACEHOLDER_EMPTY_DASH;
  }
  const normalized = acwr === 0 ? 0 : acwr;
  return formatNumericValue(normalized, 2);
}

/**
 * Crea un riepilogo condivisibile di una Card Certificata T7 applicando allowlist rigorosa:
 * esclude qualsiasi identificativo sensibile, stato clinico, RTP, ACWR, Readiness o peso corporeo.
 * @param card Card Certificata T7 di origine
 * @returns Oggetto privo di dati sensibili pronto per esportazione social
 */
export function buildShareableT7Summary(card: CertifiedT7Card): ShareableT7Summary {
  return Object.freeze({
    cardId: sanitizeDisplayText(card.id, 'card_t7'),
    workoutTitle: sanitizeDisplayText(card.sessionTitle, 'Sessione Certificata T7'),
    completedDate: sanitizeDisplayText(card.completedDateLabel, 'Completata'),
    formattedVolumeKg: formatSessionTonnageKg(card.totalVolumeKg),
    formattedDurationMin: formatSessionDurationMin(card.durationMin),
    prCount: Math.max(0, Math.floor(sanitizeNumeric(card.prCount, 0))),
    prHighlights: Object.freeze(
      card.prHighlights.map((item) => ({
        exerciseName: sanitizeDisplayText(item.exerciseName, 'Esercizio'),
        metricText: sanitizeDisplayText(item.metricText, PLACEHOLDER_EMPTY_DASH)
      }))
    ),
    certificationBadge: sanitizeDisplayText(card.certificationCode, CERTIFICATION_BADGE_LABEL)
  });
}

/**
 * Seleziona la sessione pianificata del giorno coerente con la modalita Atleta o Squadra e il roster attivo.
 * @param plans Elenco piani giornalieri disponibili
 * @param contextMode Modalita contesto globale (`athlete` o `team`)
 * @param selectedAthleteId ID atleta selezionato
 * @param selectedTeamId ID squadra selezionata
 * @param rosterIds Insieme degli ID atleta nel roster attivo
 * @returns Piano giornaliero corrispondente o `null` se assente
 */
export function resolveDailyWorkoutForContext(
  plans: readonly DailyWorkoutPlan[],
  contextMode: GlobalContextMode,
  selectedAthleteId: string | null,
  selectedTeamId: string | null,
  rosterIds: ReadonlySet<string>
): DailyWorkoutPlan | null {
  if (plans.length === 0) {
    return null;
  }
  if (contextMode === 'athlete') {
    if (!selectedAthleteId) {
      return null;
    }
    return plans.find((plan) => plan.athleteId === selectedAthleteId) ?? null;
  }
  return (
    plans.find(
      (plan) =>
        (selectedTeamId === null || plan.teamId === selectedTeamId) &&
        rosterIds.has(plan.athleteId)
    ) ?? null
  );
}

/**
 * Filtra le Card Certificate T7 per l'atleta selezionato o per il roster della squadra attiva.
 * @param cards Storico completo disponibile
 * @param contextMode Modalita contesto (`athlete` o `team`)
 * @param selectedAthleteId ID atleta attivo
 * @param selectedTeamId ID squadra attiva
 * @param rosterIds Insieme degli ID appartenenti al roster attivo
 * @returns Elenco filtrato delle Card Certificate T7
 */
export function resolveCertifiedCardsForContext(
  cards: readonly CertifiedT7Card[],
  contextMode: GlobalContextMode,
  selectedAthleteId: string | null,
  selectedTeamId: string | null,
  rosterIds: ReadonlySet<string>
): readonly CertifiedT7Card[] {
  if (contextMode === 'athlete') {
    if (!selectedAthleteId) {
      return [];
    }
    return cards.filter((card) => card.athleteId === selectedAthleteId);
  }
  return cards.filter(
    (card) =>
      (selectedTeamId === null || card.teamId === selectedTeamId) &&
      rosterIds.has(card.athleteId)
  );
}

/**
 * Filtra gli alert prioritari sul perimetro del roster attivo (evitando leak cross-team).
 * @param alerts Elenco alert disponibili
 * @param contextMode Modalita contesto (`athlete` o `team`)
 * @param selectedAthleteId ID atleta attivo
 * @param selectedTeamId ID squadra attiva
 * @param rosterIds Insieme degli ID del roster attivo
 * @returns Alert prioritari visibili nel contesto corrente
 */
export function resolveTeamAlertsForContext(
  alerts: readonly TeamHealthAlert[],
  contextMode: GlobalContextMode,
  selectedAthleteId: string | null,
  selectedTeamId: string | null,
  rosterIds: ReadonlySet<string>
): readonly TeamHealthAlert[] {
  const scopedByTeam = alerts.filter(
    (alert) =>
      (selectedTeamId === null || alert.teamId === selectedTeamId) &&
      rosterIds.has(alert.athleteId)
  );
  if (contextMode === 'athlete' && selectedAthleteId) {
    return scopedByTeam.filter((alert) => alert.athleteId === selectedAthleteId);
  }
  return scopedByTeam;
}

/**
 * Determina lo stato UI della Control Room combinando eventuali override espliciti e presenza contenuti.
 * @param explicitState Stato forzato opzionale da props (`loading`, `error`, `empty`, `populated`)
 * @param hasContent True se e presente almeno un contenuto operativo da mostrare
 * @returns Stato finale da passare a `ViewStateContainer`
 */
export function resolveControlRoomViewState(
  explicitState: ViewStateStatus | undefined,
  hasContent: boolean
): ViewStateStatus {
  if (explicitState !== undefined) {
    return explicitState;
  }
  return hasContent ? 'populated' : 'empty';
}

export interface ControlRoomQuickAction {
  readonly moduleId: AppModuleId;
  readonly label: string;
}

export const CONTROL_ROOM_QUICK_ACTIONS: readonly ControlRoomQuickAction[] = Object.freeze([
  { moduleId: 'programming', label: 'Programmazione' },
  { moduleId: 'analysis', label: 'Data Analisi & VBT' },
  { moduleId: 'catalog', label: 'Catalogo 3D' },
  { moduleId: 'nutrition', label: 'Diario Nutrizione' }
]);
