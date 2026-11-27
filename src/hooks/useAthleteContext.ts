/**
 * src/hooks/useAthleteContext.ts
 * Hook consumatore dedicato per il Selettore Permanente Globale di Contesto Atleta/Squadra.
 * Espone scorciatoie ergonomiche per la consultazione rapida nei componenti UI e nelle viste.
 * Conforme ad ADR-01 (Thin Client) e Regola 02 (un file = una responsabilita).
 */

import { useMemo } from 'react';
import { useAthleteRawContext, AthleteContextValue } from '../context/AthleteContext';
import {
  AthleticAvailabilityStatus,
  TacticalRole,
  DualTacticalRoleAssignment,
  RtpPhase,
  AVAILABILITY_FIT,
  AVAILABILITY_INJURED,
  AVAILABILITY_REHAB
} from '../types';

const EMPTY_STRING = '';

export interface UseAthleteContextReturn extends AthleteContextValue {
  activeAvailabilityStatus: AthleticAvailabilityStatus | null;
  activeTacticalRole: TacticalRole | null;
  dualRole: DualTacticalRoleAssignment | undefined;
  currentRtpPhase: RtpPhase | undefined;
  athleteFullName: string;
  teamName: string;
  isFit: boolean;
  isInjuredOrRehab: boolean;
}

/**
 * Hook per accedere e manovrare il contesto attivo Atleta / Squadra con scorciatoie memoizzate.
 * @returns Stato del contesto con flag precalcolati, doppio ruolo, fase RTP e metodi di switch a 2 click
 */
export function useAthleteContext(): UseAthleteContextReturn {
  const context = useAthleteRawContext();

  return useMemo<UseAthleteContextReturn>(() => {
    const athlete = context.selectedAthlete;
    const athleteFullName = athlete
      ? `${athlete.name} ${athlete.surname}`
      : EMPTY_STRING;

    const teamName = context.selectedTeam ? context.selectedTeam.name : EMPTY_STRING;

    const activeAvailabilityStatus = athlete
      ? athlete.availabilityStatus
      : null;

    const activeTacticalRole = athlete
      ? athlete.tacticalRole
      : null;

    const dualRole = athlete?.dualRole;
    const currentRtpPhase = athlete?.currentRtpPhase;

    const isFit = activeAvailabilityStatus === AVAILABILITY_FIT;
    const isInjuredOrRehab =
      activeAvailabilityStatus === AVAILABILITY_INJURED ||
      activeAvailabilityStatus === AVAILABILITY_REHAB;

    return {
      ...context,
      activeAvailabilityStatus,
      activeTacticalRole,
      dualRole,
      currentRtpPhase,
      athleteFullName,
      teamName,
      isFit,
      isInjuredOrRehab
    };
  }, [context]);
}

export default useAthleteContext;
