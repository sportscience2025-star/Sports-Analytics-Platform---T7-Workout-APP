/**
 * src/context/AthleteContext.tsx
 * React Context per il Selettore Permanente Globale di Contesto Atleta/Squadra.
 * Conforme ad ADR-01 (Thin Client), ADR-02 (3 Silos Stagni), ZONA 3 Schema 5 e Regola dei 2 Click.
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  Athlete,
  Team,
  GlobalContextMode,
  AVAILABILITY_FIT,
  AVAILABILITY_CAUTION,
  AVAILABILITY_REHAB,
  AVAILABILITY_INJURED,
  SILO1_CONSUMER,
  SENSITIVITY_STANDARD,
  asKilograms
} from '../types';

export const STORAGE_KEY_CONTEXT = 't7_active_context';
export const DEFAULT_CONTEXT_MODE: GlobalContextMode = 'athlete';

export const DEMO_TEAMS: readonly Team[] = Object.freeze([
  {
    id: 'team_pro_01',
    name: 'T7 Elite Performance Squad',
    clubCode: 'T7-PRO',
    tier: 'tier2',
    siloPartition: SILO1_CONSUMER,
    rosterAthleteIds: ['ath_01', 'ath_02', 'ath_03', 'ath_04'],
    staffUserIds: ['staff_coach_01', 'staff_physio_01'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z'
  }
]);

export const DEMO_ATHLETES: readonly Athlete[] = Object.freeze([
  {
    id: 'ath_01',
    name: 'Marco',
    surname: 'Rossi',
    dateOfBirth: '1998-05-14',
    tier: 'tier2',
    siloPartition: SILO1_CONSUMER,
    sensitivityClass: SENSITIVITY_STANDARD,
    tacticalRole: 'striker',
    availabilityStatus: AVAILABILITY_FIT,
    heightCm: 184,
    currentWeightKg: asKilograms(78.5),
    teamId: 'team_pro_01',
    optInResearchWarehouse: true
  },
  {
    id: 'ath_02',
    name: 'Luca',
    surname: 'Bianchi',
    dateOfBirth: '2000-09-22',
    tier: 'tier2',
    siloPartition: SILO1_CONSUMER,
    sensitivityClass: SENSITIVITY_STANDARD,
    tacticalRole: 'central_midfielder',
    availabilityStatus: AVAILABILITY_CAUTION,
    heightCm: 177,
    currentWeightKg: asKilograms(74.0),
    teamId: 'team_pro_01',
    optInResearchWarehouse: true
  },
  {
    id: 'ath_03',
    name: 'Alessandro',
    surname: 'Esposito',
    dateOfBirth: '1996-03-11',
    tier: 'tier2',
    siloPartition: SILO1_CONSUMER,
    sensitivityClass: SENSITIVITY_STANDARD,
    tacticalRole: 'center_back',
    availabilityStatus: AVAILABILITY_REHAB,
    currentRtpPhase: 'return_to_training',
    heightCm: 189,
    currentWeightKg: asKilograms(85.0),
    teamId: 'team_pro_01',
    optInResearchWarehouse: false
  },
  {
    id: 'ath_04',
    name: 'Matteo',
    surname: 'Ferrari',
    dateOfBirth: '1995-12-03',
    tier: 'tier2',
    siloPartition: SILO1_CONSUMER,
    sensitivityClass: SENSITIVITY_STANDARD,
    tacticalRole: 'goalkeeper',
    availabilityStatus: AVAILABILITY_INJURED,
    currentRtpPhase: 'acute_protection',
    heightCm: 193,
    currentWeightKg: asKilograms(88.0),
    teamId: 'team_pro_01',
    optInResearchWarehouse: true
  }
]);

export interface PersistedContextState {
  mode: GlobalContextMode;
  selectedTeamId: string | null;
  selectedAthleteId: string | null;
}

export interface AthleteContextValue {
  contextMode: GlobalContextMode;
  selectedTeam: Team | null;
  selectedAthlete: Athlete | null;
  selectedTeamId: string | null;
  selectedAthleteId: string | null;
  teams: readonly Team[];
  roster: readonly Athlete[];
  allAthletes: readonly Athlete[];
  isAthleteMode: boolean;
  isTeamMode: boolean;
  isRosterEmpty: boolean;
  selectAthlete: (athleteId: string) => void;
  selectTeam: (teamId: string) => void;
  setContextMode: (mode: GlobalContextMode) => void;
  selectAthleteAndMode: (athleteId: string) => void;
  selectTeamAndMode: (teamId: string) => void;
  resetContext: () => void;
}

export interface AthleteProviderProps {
  children: React.ReactNode;
  initialTeams?: readonly Team[];
  initialAthletes?: readonly Athlete[];
  defaultTeamId?: string;
  defaultAthleteId?: string;
  defaultMode?: GlobalContextMode;
  persistState?: boolean;
  enforceSingleAthlete?: boolean;
}

/**
 * Type guard runtime per verificare la validita della modalita di contesto.
 * @param value Valore da esaminare
 * @returns true se il valore e un GlobalContextMode valido
 */
export function isValidContextMode(value: unknown): value is GlobalContextMode {
  return value === 'team' || value === 'athlete';
}

/**
 * Lettura protetta da storage locale con gestione SSR e sandbox browsers.
 * @param key Chiave di storage
 * @returns Stringa salvata o null
 */
function readStorageSafe(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Accesso storage non disponibile o bloccato dalle policy browser
  }
  return null;
}

/**
 * Scrittura protetta in storage locale con gestione SSR e sandbox browsers.
 * @param key Chiave di storage
 * @param value Valore da salvare
 */
function writeStorageSafe(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Accesso storage non disponibile o bloccato dalle policy browser
  }
}

/**
 * Rimozione protetta da storage locale con gestione SSR e sandbox browsers.
 * @param key Chiave di storage
 */
function removeStorageSafe(key: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Accesso storage non disponibile o bloccato dalle policy browser
  }
}

export const AthleteContext = createContext<AthleteContextValue | null>(null);

/**
 * Componente Provider per la gestione reattiva del Selettore Permanente Globale di Contesto.
 * @param props Proprieta del provider (dati iniziali, persistenza e vincoli di Tier)
 * @returns Elemento React Provider con memoizzazione ottimale
 */
export const AthleteProvider: React.FC<AthleteProviderProps> = ({
  children,
  initialTeams,
  initialAthletes,
  defaultTeamId,
  defaultAthleteId,
  defaultMode,
  persistState = true,
  enforceSingleAthlete = false
}) => {
  const teams = useMemo<readonly Team[]>(() => {
    if (enforceSingleAthlete) {
      return [];
    }
    return initialTeams ?? DEMO_TEAMS;
  }, [enforceSingleAthlete, initialTeams]);

  const allAthletes = useMemo<readonly Athlete[]>(() => {
    return initialAthletes ?? DEMO_ATHLETES;
  }, [initialAthletes]);

  const teamMap = useMemo(() => {
    const map = new Map<string, Team>();
    for (const t of teams) {
      map.set(t.id, t);
    }
    return map;
  }, [teams]);

  const athleteMap = useMemo(() => {
    const map = new Map<string, Athlete>();
    for (const a of allAthletes) {
      map.set(a.id, a);
    }
    return map;
  }, [allAthletes]);

  const [contextMode, setContextModeState] = useState<GlobalContextMode>(() => {
    if (enforceSingleAthlete) {
      return 'athlete';
    }
    if (defaultMode && isValidContextMode(defaultMode)) {
      return defaultMode;
    }
    if (persistState) {
      const stored = readStorageSafe(STORAGE_KEY_CONTEXT);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<PersistedContextState>;
          if (isValidContextMode(parsed.mode)) {
            return parsed.mode;
          }
        } catch {
          // JSON malformato: prosegui con il fallback predefinito
        }
      }
    }
    return DEFAULT_CONTEXT_MODE;
  });

  const [selectedTeamId, setSelectedTeamIdState] = useState<string | null>(() => {
    if (enforceSingleAthlete) {
      return null;
    }
    if (defaultTeamId && teamMap.has(defaultTeamId)) {
      return defaultTeamId;
    }
    if (persistState) {
      const stored = readStorageSafe(STORAGE_KEY_CONTEXT);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<PersistedContextState>;
          if (typeof parsed.selectedTeamId === 'string' && teamMap.has(parsed.selectedTeamId)) {
            return parsed.selectedTeamId;
          }
        } catch {
          // JSON malformato: prosegui con il fallback predefinito
        }
      }
    }
    return teams[0]?.id ?? null;
  });

  const [selectedAthleteId, setSelectedAthleteIdState] = useState<string | null>(() => {
    if (defaultAthleteId && athleteMap.has(defaultAthleteId)) {
      return defaultAthleteId;
    }
    if (persistState) {
      const stored = readStorageSafe(STORAGE_KEY_CONTEXT);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<PersistedContextState>;
          if (typeof parsed.selectedAthleteId === 'string' && athleteMap.has(parsed.selectedAthleteId)) {
            return parsed.selectedAthleteId;
          }
        } catch {
          // JSON malformato: prosegui con il fallback predefinito
        }
      }
    }
    if (selectedTeamId && teamMap.has(selectedTeamId)) {
      const team = teamMap.get(selectedTeamId);
      const firstInRoster = team?.rosterAthleteIds[0];
      if (firstInRoster && athleteMap.has(firstInRoster)) {
        return firstInRoster;
      }
    }
    return allAthletes[0]?.id ?? null;
  });

  const selectedTeam = useMemo<Team | null>(() => {
    if (!selectedTeamId) {
      return null;
    }
    return teamMap.get(selectedTeamId) ?? null;
  }, [selectedTeamId, teamMap]);

  const roster = useMemo<readonly Athlete[]>(() => {
    if (enforceSingleAthlete) {
      return allAthletes.slice(0, 1);
    }
    if (!selectedTeamId || !selectedTeam) {
      return allAthletes;
    }
    return allAthletes.filter((a) => {
      return a.teamId === selectedTeamId || selectedTeam.rosterAthleteIds.includes(a.id);
    });
  }, [enforceSingleAthlete, allAthletes, selectedTeamId, selectedTeam]);

  const selectedAthlete = useMemo<Athlete | null>(() => {
    if (!selectedAthleteId) {
      return null;
    }
    return athleteMap.get(selectedAthleteId) ?? null;
  }, [selectedAthleteId, athleteMap]);

  const isAthleteMode = contextMode === 'athlete';
  const isTeamMode = contextMode === 'team';
  const isRosterEmpty = roster.length === 0;

  const selectTeam = useCallback((teamId: string): void => {
    if (enforceSingleAthlete) {
      return;
    }
    if (!teamMap.has(teamId)) {
      return;
    }
    setSelectedTeamIdState(teamId);
    const targetTeam = teamMap.get(teamId);
    if (!targetTeam) {
      return;
    }
    setSelectedAthleteIdState((currentAthId) => {
      if (currentAthId && targetTeam.rosterAthleteIds.includes(currentAthId)) {
        return currentAthId;
      }
      return targetTeam.rosterAthleteIds[0] ?? null;
    });
  }, [enforceSingleAthlete, teamMap]);

  const selectAthlete = useCallback((athleteId: string): void => {
    if (!athleteMap.has(athleteId)) {
      return;
    }
    setSelectedAthleteIdState(athleteId);
    const targetAthlete = athleteMap.get(athleteId);
    if (targetAthlete && targetAthlete.teamId && !enforceSingleAthlete) {
      if (teamMap.has(targetAthlete.teamId)) {
        setSelectedTeamIdState(targetAthlete.teamId);
      }
    }
  }, [athleteMap, enforceSingleAthlete, teamMap]);

  const setContextMode = useCallback((mode: GlobalContextMode): void => {
    if (enforceSingleAthlete) {
      return;
    }
    if (!isValidContextMode(mode)) {
      return;
    }
    setContextModeState(mode);
  }, [enforceSingleAthlete]);

  const selectAthleteAndMode = useCallback((athleteId: string): void => {
    selectAthlete(athleteId);
    setContextModeState('athlete');
  }, [selectAthlete]);

  const selectTeamAndMode = useCallback((teamId: string): void => {
    if (enforceSingleAthlete) {
      return;
    }
    selectTeam(teamId);
    setContextModeState('team');
  }, [enforceSingleAthlete, selectTeam]);

  const resetContext = useCallback((): void => {
    if (enforceSingleAthlete) {
      setContextModeState('athlete');
      setSelectedTeamIdState(null);
      setSelectedAthleteIdState(allAthletes[0]?.id ?? null);
    } else {
      const defaultT = teams[0]?.id ?? null;
      setContextModeState(DEFAULT_CONTEXT_MODE);
      setSelectedTeamIdState(defaultT);
      if (defaultT && teamMap.has(defaultT)) {
        const teamObj = teamMap.get(defaultT);
        setSelectedAthleteIdState(teamObj?.rosterAthleteIds[0] ?? allAthletes[0]?.id ?? null);
      } else {
        setSelectedAthleteIdState(allAthletes[0]?.id ?? null);
      }
    }
    if (persistState) {
      removeStorageSafe(STORAGE_KEY_CONTEXT);
    }
  }, [enforceSingleAthlete, allAthletes, teams, teamMap, persistState]);

  useEffect(() => {
    if (persistState) {
      const stateToPersist: PersistedContextState = {
        mode: contextMode,
        selectedTeamId,
        selectedAthleteId
      };
      writeStorageSafe(STORAGE_KEY_CONTEXT, JSON.stringify(stateToPersist));
    }
  }, [persistState, contextMode, selectedTeamId, selectedAthleteId]);

  const contextValue: AthleteContextValue = useMemo(() => {
    return {
      contextMode,
      selectedTeam,
      selectedAthlete,
      selectedTeamId,
      selectedAthleteId,
      teams,
      roster,
      allAthletes,
      isAthleteMode,
      isTeamMode,
      isRosterEmpty,
      selectAthlete,
      selectTeam,
      setContextMode,
      selectAthleteAndMode,
      selectTeamAndMode,
      resetContext
    };
  }, [
    contextMode,
    selectedTeam,
    selectedAthlete,
    selectedTeamId,
    selectedAthleteId,
    teams,
    roster,
    allAthletes,
    isAthleteMode,
    isTeamMode,
    isRosterEmpty,
    selectAthlete,
    selectTeam,
    setContextMode,
    selectAthleteAndMode,
    selectTeamAndMode,
    resetContext
  ]);

  return (
    <AthleteContext.Provider value={contextValue}>
      {children}
    </AthleteContext.Provider>
  );
};

/**
 * Hook interno per accedere al contesto AthleteContext.
 * Solleva un errore chiaro se invocato fuori da un AthleteProvider.
 * @returns Valore tipizzato del contesto Atleta/Squadra
 */
export function useAthleteContext(): AthleteContextValue {
  const context = useContext(AthleteContext);
  if (!context) {
    throw new Error('useAthleteContext must be used within an AthleteProvider');
  }
  return context;
}
