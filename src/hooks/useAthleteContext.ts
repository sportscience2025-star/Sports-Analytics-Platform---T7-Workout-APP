/**
 * src/hooks/useAthleteContext.ts
 * Hook consumatore dedicato per il Selettore Permanente Globale di Contesto Atleta/Squadra.
 * Espone scorciatoie ergonomiche per la consultazione rapida nei componenti UI e nelle viste.
 * Conforme ad ADR-01 (Thin Client) e Regola 02 (un file = una responsabilita).
 */

import { useAthleteContext as useAthleteContextInternal, AthleteContextValue } from '../context/AthleteContext';
import { AthleticAvailabilityStatus, TacticalRole } from '../types';

export interface UseAthleteContextReturn extends AthleteContextValue {
  activeAvailabilityStatus: AthleticAvailabilityStatus | null;
  activeTacticalRole: TacticalRole | null;
  athleteFullName: string;
  teamName: string;
  isFit: boolean;
  isInjuredOrRehab: boolean;
}

/**
 * Hook per accedere e manovrare il contesto attivo Atleta / Squadra.
 * @returns Stato del contesto con flag precalcolati e metodi di switch a 2 click
 */
export function useAthleteContext(): UseAthleteContextReturn {
  const context = useAthleteContextInternal();

  const athleteFullName = context.selectedAthlete
    ? `${context.selectedAthlete.name} ${context.selectedAthlete.surname}`
    : '';

  const teamName = context.selectedTeam ? context.selectedTeam.name : '';

  const activeAvailabilityStatus = context.selectedAthlete
    ? context.selectedAthlete.availabilityStatus
    : null;

  const activeTacticalRole = context.selectedAthlete
    ? context.selectedAthlete.tacticalRole
    : null;

  const isFit = activeAvailabilityStatus === 'fit';
  const isInjuredOrRehab =
    activeAvailabilityStatus === 'injured' || activeAvailabilityStatus === 'rehab';

  return {
    ...context,
    activeAvailabilityStatus,
    activeTacticalRole,
    athleteFullName,
    teamName,
    isFit,
    isInjuredOrRehab
  };
}

export default useAthleteContext;
