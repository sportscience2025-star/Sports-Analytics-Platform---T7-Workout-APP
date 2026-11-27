/**
 * src/context/AthleteContext.tsx
 * React Context per il Selettore Permanente Globale di Contesto Atleta/Squadra.
 * Conforme ad ADR-01 (Thin Client), ADR-02 (3 Silos Stagni), ZONA 3 Schema 5 e Regola dei 2 Click.
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  MAX_ATHLETES_TIER1,
  asKilograms
} from '../types';
import { readStorageSafe, writeStorageSafe, removeStorageSafe } from '../utils/storage-safe';

// ============================================================================
// COSTANTI DI CONFIGURAZIONE CONTESTO
// ============================================================================

export const STORAGE_KEY_CONTEXT = 't7_active_context';
export const CONTEXT_MODE_ATHLETE: GlobalContextMode = 'athlete';
export const CONTEXT_MODE_TEAM: GlobalContextMode = 'team';
export const DEFAULT_CONTEXT_MODE: GlobalContextMode = CONTEXT_MODE_ATHLETE;

const FIRST_ITEM_INDEX = 0;
const DUAL_ROLE_PRIMARY_WEIGHT = 0.7;
const DUAL_ROLE_SECONDARY_WEIGHT = 0.3;

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
    dualRole: {
      primaryRole: 'central_midfielder',
      primaryWeight: DUAL_ROLE_PRIMARY_WEIGHT,
      secondaryRole: 'attacking_midfielder',
      secondaryWeight: DUAL_ROLE_SECONDARY_WEIGHT
    },
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
  children?: React.ReactNode;
  initialTeams?: readonly Team[];
  initialAthletes?: readonly Athlete[];
  defaultTeamId?: string;
  defaultAthleteId?: string;
  defaultMode?: GlobalContextMode;
  persistState?: boolean;
  enforceSingleAthlete?: boolean;
}

// ============================================================================
// FUNZIONI DI SUPPORTO E RICONCILIAZIONE
// ============================================================================

/**
 * Type guard runtime per verificare che un valore sia una stringa.
 * @param value Valore da esaminare
 * @returns true se il valore e di tipo string
 */
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard runtime per verificare la validita della modalita di contesto.
 * @param value Valore da esaminare
 * @returns true se il valore e un GlobalContextMode valido
 */
export function isValidContextMode(value: unknown): value is GlobalContextMode {
  return value === CONTEXT_MODE_TEAM || value === CONTEXT_MODE_ATHLETE;
}

/**
 * Legge e deserializza lo stato persistito in localStorage gestendo payload malformati.
 * @returns Oggetto parziale persistito oppure null se assente o corrotto
 */
function readPersistedContextState(): Partial<PersistedContextState> | null {
  const stored = readStorageSafe(STORAGE_KEY_CONTEXT);
  if (stored === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    return parsed as Partial<PersistedContextState>;
  } catch {
    // JSON malformato: ignora e consente il ripristino tramite fallback predefinito
    return null;
  }
}

/**
 * Persiste in localStorage la transizione di stato esplicita quando la persistenza e abilitata.
 * @param persistState Flag di abilitazione persistenza
 * @param state Stato completo del contesto da serializzare
 */
function persistContextState(persistState: boolean, state: PersistedContextState): void {
  if (!persistState) {
    return;
  }
  writeStorageSafe(STORAGE_KEY_CONTEXT, JSON.stringify(state));
}

/**
 * Risolve l'atleta predefinito per una squadra verificando l'esistenza in athleteMap.
 * Controlla prima rosterAthleteIds[0], poi altri ID del roster validi, infine il primo atleta con teamId corrispondente.
 * @param team Squadra target
 * @param athletes Lista completa degli atleti autorizzati
 * @param athleteMap Mappa indicizzata degli atleti per ID
 * @returns ID atleta valido oppure null se nessun atleta corrisponde
 */
function resolveTeamDefaultAthleteId(
  team: Team,
  athletes: readonly Athlete[],
  athleteMap: ReadonlyMap<string, Athlete>
): string | null {
  const firstRosterId = team.rosterAthleteIds[FIRST_ITEM_INDEX];
  if (firstRosterId && athleteMap.has(firstRosterId)) {
    return firstRosterId;
  }
  const validRosterId = team.rosterAthleteIds.find((id) => athleteMap.has(id));
  if (validRosterId) {
    return validRosterId;
  }
  const teamMatchedAthlete = athletes.find((athlete) => athlete.teamId === team.id);
  return teamMatchedAthlete ? teamMatchedAthlete.id : null;
}

/**
 * Verifica se un atleta appartiene al perimetro della squadra indicata.
 * @param athleteId ID dell'atleta da controllare
 * @param team Squadra di riferimento
 * @param athleteMap Mappa indicizzata degli atleti
 * @returns true se l'atleta esiste ed e associato alla squadra
 */
function isAthleteInTeam(
  athleteId: string,
  team: Team,
  athleteMap: ReadonlyMap<string, Athlete>
): boolean {
  const athlete = athleteMap.get(athleteId);
  if (!athlete) {
    return false;
  }
  return team.rosterAthleteIds.includes(athleteId) || athlete.teamId === team.id;
}

/**
 * Risolve il teamId coerente quando viene selezionato un atleta.
 * Se athlete.teamId e presente in teamMap lo restituisce; se assente da teamMap azzera o cerca un roster contenente l'atleta.
 * @param athlete Atleta selezionato
 * @param teams Elenco squadre attive
 * @param teamMap Mappa indicizzata delle squadre
 * @returns ID squadra valido oppure null se l'atleta non appartiene ad alcuna squadra attiva
 */
function resolveAthleteTeamId(
  athlete: Athlete,
  teams: readonly Team[],
  teamMap: ReadonlyMap<string, Team>
): string | null {
  if (isString(athlete.teamId)) {
    return teamMap.has(athlete.teamId) ? athlete.teamId : null;
  }
  const matchedTeam = teams.find((team) => team.rosterAthleteIds.includes(athlete.id));
  return matchedTeam ? matchedTeam.id : null;
}

interface InitialResolutionParams {
  enforceSingleAthlete: boolean;
  persistState: boolean;
  teams: readonly Team[];
  allAthletes: readonly Athlete[];
  teamMap: ReadonlyMap<string, Team>;
  athleteMap: ReadonlyMap<string, Athlete>;
  defaultMode?: GlobalContextMode;
  defaultTeamId?: string;
  defaultAthleteId?: string;
}

/**
 * Calcola lo stato iniziale del provider all'avvio rispettando Tier 1 lock, override espliciti e localStorage.
 * Non effettua scritture su localStorage per non sovrascrivere lo stato utente al mount.
 * @param params Parametri di configurazione e mappe indicizzate del provider
 * @returns Stato iniziale coerente del contesto
 */
function resolveInitialContextState(params: InitialResolutionParams): PersistedContextState {
  const {
    enforceSingleAthlete,
    persistState,
    teams,
    allAthletes,
    teamMap,
    athleteMap,
    defaultMode,
    defaultTeamId,
    defaultAthleteId
  } = params;

  if (enforceSingleAthlete) {
    return {
      mode: CONTEXT_MODE_ATHLETE,
      selectedTeamId: null,
      selectedAthleteId: allAthletes[FIRST_ITEM_INDEX]?.id ?? null
    };
  }

  const hasDefaultModeOverride = defaultMode !== undefined && isValidContextMode(defaultMode);
  const hasDefaultTeamOverride = defaultTeamId !== undefined && teamMap.has(defaultTeamId);
  const hasDefaultAthleteOverride = defaultAthleteId !== undefined && athleteMap.has(defaultAthleteId);

  // Legge da storage solo se almeno un campo non e sovrascritto da props esplicite
  const shouldReadStorage =
    persistState && (!hasDefaultModeOverride || !hasDefaultTeamOverride || !hasDefaultAthleteOverride);
  const persisted = shouldReadStorage ? readPersistedContextState() : null;

  const mode: GlobalContextMode = hasDefaultModeOverride
    ? defaultMode
    : persisted && isValidContextMode(persisted.mode)
      ? persisted.mode
      : DEFAULT_CONTEXT_MODE;

  let selectedTeamId: string | null = null;
  if (hasDefaultTeamOverride && isString(defaultTeamId)) {
    selectedTeamId = defaultTeamId;
  } else if (
    persisted &&
    isString(persisted.selectedTeamId) &&
    teamMap.has(persisted.selectedTeamId)
  ) {
    selectedTeamId = persisted.selectedTeamId;
  } else {
    selectedTeamId = teams[FIRST_ITEM_INDEX]?.id ?? null;
  }

  let selectedAthleteId: string | null = null;
  if (hasDefaultAthleteOverride && isString(defaultAthleteId)) {
    selectedAthleteId = defaultAthleteId;
    if (!hasDefaultTeamOverride && (!persisted || !isString(persisted.selectedTeamId))) {
      const defaultAthlete = athleteMap.get(defaultAthleteId);
      if (defaultAthlete) {
        selectedTeamId = resolveAthleteTeamId(defaultAthlete, teams, teamMap);
      }
    }
  } else if (
    persisted &&
    isString(persisted.selectedAthleteId) &&
    athleteMap.has(persisted.selectedAthleteId)
  ) {
    const persistedTeam = selectedTeamId ? teamMap.get(selectedTeamId) : undefined;
    // Se defaultTeamId ha forzato una squadra specifica, accetta l'atleta persistito solo se appartiene a quella squadra
    if (!hasDefaultTeamOverride || (persistedTeam && isAthleteInTeam(persisted.selectedAthleteId, persistedTeam, athleteMap))) {
      selectedAthleteId = persisted.selectedAthleteId;
    }
  }

  if (selectedAthleteId === null && selectedTeamId && teamMap.has(selectedTeamId)) {
    const activeTeam = teamMap.get(selectedTeamId);
    if (activeTeam) {
      selectedAthleteId = resolveTeamDefaultAthleteId(activeTeam, allAthletes, athleteMap);
    }
  }

  if (selectedAthleteId === null) {
    selectedAthleteId = allAthletes[FIRST_ITEM_INDEX]?.id ?? null;
  }

  return {
    mode,
    selectedTeamId,
    selectedAthleteId
  };
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
    const sourceAthletes = initialAthletes ?? DEMO_ATHLETES;
    if (enforceSingleAthlete) {
      return sourceAthletes.slice(FIRST_ITEM_INDEX, MAX_ATHLETES_TIER1);
    }
    return sourceAthletes;
  }, [enforceSingleAthlete, initialAthletes]);

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

  const [contextState, setContextState] = useState<PersistedContextState>(() =>
    resolveInitialContextState({
      enforceSingleAthlete,
      persistState,
      teams,
      allAthletes,
      teamMap,
      athleteMap,
      defaultMode,
      defaultTeamId,
      defaultAthleteId
    })
  );

  // Ref sincronizzato per prevenire letture stale su transizioni imperative consecutive nello stesso batch
  const latestStateRef = useRef<PersistedContextState>(contextState);
  latestStateRef.current = contextState;

  const { mode: contextMode, selectedTeamId, selectedAthleteId } = contextState;

  // Clamp reattivo se enforceSingleAthlete cambia da false a true a runtime (Tier 1 lock)
  useEffect(() => {
    if (!enforceSingleAthlete) {
      return;
    }
    const authorizedAthleteId = allAthletes[FIRST_ITEM_INDEX]?.id ?? null;
    const current = latestStateRef.current;
    if (
      current.mode !== CONTEXT_MODE_ATHLETE ||
      current.selectedTeamId !== null ||
      current.selectedAthleteId !== authorizedAthleteId
    ) {
      const clampedState: PersistedContextState = {
        mode: CONTEXT_MODE_ATHLETE,
        selectedTeamId: null,
        selectedAthleteId: authorizedAthleteId
      };
      latestStateRef.current = clampedState;
      setContextState(clampedState);
      persistContextState(persistState, clampedState);
    }
  }, [enforceSingleAthlete, allAthletes, persistState]);

  /**
   * Applica in modo atomico una transizione di stato e la persiste in localStorage se abilitato.
   * @param nextState Nuovo stato completo del contesto
   */
  const applyStateTransition = useCallback((nextState: PersistedContextState): void => {
    latestStateRef.current = nextState;
    setContextState(nextState);
    persistContextState(persistState, nextState);
  }, [persistState]);

  /**
   * Costruisce il prossimo stato riconciliato per il cambio squadra mantenendo un atleta valido del roster.
   * @param teamId ID della squadra selezionata
   * @param modeOverride Eventuale modalita esplicita da applicare
   * @returns Nuovo stato riconciliato oppure null se squadra non trovata o bloccata da Tier 1
   */
  const buildTeamTransitionState = useCallback((
    teamId: string,
    modeOverride?: GlobalContextMode
  ): PersistedContextState | null => {
    if (enforceSingleAthlete) {
      return null;
    }
    const targetTeam = teamMap.get(teamId);
    if (!targetTeam) {
      return null;
    }
    const current = latestStateRef.current;
    const keepCurrentAthlete =
      current.selectedAthleteId !== null &&
      isAthleteInTeam(current.selectedAthleteId, targetTeam, athleteMap);

    const nextAthleteId = keepCurrentAthlete
      ? current.selectedAthleteId
      : resolveTeamDefaultAthleteId(targetTeam, allAthletes, athleteMap);

    return {
      mode: modeOverride ?? current.mode,
      selectedTeamId: teamId,
      selectedAthleteId: nextAthleteId
    };
  }, [enforceSingleAthlete, teamMap, athleteMap, allAthletes]);

  /**
   * Costruisce il prossimo stato riconciliato per il cambio atleta allineando la squadra associata.
   * @param athleteId ID dell'atleta selezionato
   * @param modeOverride Eventuale modalita esplicita da applicare
   * @returns Nuovo stato riconciliato oppure null se atleta non trovato o bloccato da Tier 1
   */
  const buildAthleteTransitionState = useCallback((
    athleteId: string,
    modeOverride?: GlobalContextMode
  ): PersistedContextState | null => {
    if (enforceSingleAthlete) {
      return null;
    }
    const targetAthlete = athleteMap.get(athleteId);
    if (!targetAthlete) {
      return null;
    }
    const current = latestStateRef.current;
    const nextTeamId = resolveAthleteTeamId(targetAthlete, teams, teamMap);
    return {
      mode: modeOverride ?? current.mode,
      selectedTeamId: nextTeamId,
      selectedAthleteId: athleteId
    };
  }, [enforceSingleAthlete, athleteMap, teams, teamMap]);

  const selectedTeam = useMemo<Team | null>(() => {
    if (!selectedTeamId) {
      return null;
    }
    return teamMap.get(selectedTeamId) ?? null;
  }, [selectedTeamId, teamMap]);

  const roster = useMemo<readonly Athlete[]>(() => {
    if (enforceSingleAthlete) {
      return allAthletes.slice(FIRST_ITEM_INDEX, MAX_ATHLETES_TIER1);
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

  const isAthleteMode = contextMode === CONTEXT_MODE_ATHLETE;
  const isTeamMode = contextMode === CONTEXT_MODE_TEAM;
  const isRosterEmpty = roster.length === 0;

  /**
   * Seleziona la squadra attiva riconciliando l'atleta selezionato sul relativo roster.
   * @param teamId ID della squadra target
   */
  const selectTeam = useCallback((teamId: string): void => {
    const nextState = buildTeamTransitionState(teamId);
    if (nextState) {
      applyStateTransition(nextState);
    }
  }, [buildTeamTransitionState, applyStateTransition]);

  /**
   * Seleziona l'atleta attivo riconciliando o azzerando selectedTeamId in base a teamMap.
   * @param athleteId ID dell'atleta target
   */
  const selectAthlete = useCallback((athleteId: string): void => {
    const nextState = buildAthleteTransitionState(athleteId);
    if (nextState) {
      applyStateTransition(nextState);
    }
  }, [buildAthleteTransitionState, applyStateTransition]);

  /**
   * Aggiorna la modalita di contesto globale ('athlete' o 'team') se consentito dal Tier.
   * @param mode Nuova modalita di contesto
   */
  const setContextMode = useCallback((mode: GlobalContextMode): void => {
    if (enforceSingleAthlete || !isValidContextMode(mode)) {
      return;
    }
    applyStateTransition({
      ...latestStateRef.current,
      mode
    });
  }, [enforceSingleAthlete, applyStateTransition]);

  /**
   * Switch atomico 2-click su atleta specifico con attivazione della modalita 'athlete'.
   * @param athleteId ID dell'atleta target
   */
  const selectAthleteAndMode = useCallback((athleteId: string): void => {
    const nextState = buildAthleteTransitionState(athleteId, CONTEXT_MODE_ATHLETE);
    if (nextState) {
      applyStateTransition(nextState);
    }
  }, [buildAthleteTransitionState, applyStateTransition]);

  /**
   * Switch atomico 2-click su squadra specifica con attivazione della modalita 'team'.
   * @param teamId ID della squadra target
   */
  const selectTeamAndMode = useCallback((teamId: string): void => {
    const nextState = buildTeamTransitionState(teamId, CONTEXT_MODE_TEAM);
    if (nextState) {
      applyStateTransition(nextState);
    }
  }, [buildTeamTransitionState, applyStateTransition]);

  /**
   * Ripristina lo stato iniziale di default e rimuove la chiave persistita da localStorage senza riscriverla.
   */
  const resetContext = useCallback((): void => {
    let resetState: PersistedContextState;
    if (enforceSingleAthlete) {
      resetState = {
        mode: CONTEXT_MODE_ATHLETE,
        selectedTeamId: null,
        selectedAthleteId: allAthletes[FIRST_ITEM_INDEX]?.id ?? null
      };
    } else {
      const defaultT = teams[FIRST_ITEM_INDEX]?.id ?? null;
      const defaultTeamObj = defaultT ? teamMap.get(defaultT) : undefined;
      const defaultAthId = defaultTeamObj
        ? resolveTeamDefaultAthleteId(defaultTeamObj, allAthletes, athleteMap)
        : (allAthletes[FIRST_ITEM_INDEX]?.id ?? null);

      resetState = {
        mode: DEFAULT_CONTEXT_MODE,
        selectedTeamId: defaultT,
        selectedAthleteId: defaultAthId
      };
    }

    latestStateRef.current = resetState;
    setContextState(resetState);

    if (persistState) {
      removeStorageSafe(STORAGE_KEY_CONTEXT);
    }
  }, [enforceSingleAthlete, allAthletes, teams, teamMap, athleteMap, persistState]);

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
 * Hook interno grezzo per accedere al contesto AthleteContext.
 * Solleva un errore chiaro se invocato fuori da un AthleteProvider.
 * @returns Valore tipizzato del contesto Atleta/Squadra
 */
export function useAthleteRawContext(): AthleteContextValue {
  const context = useContext(AthleteContext);
  if (!context) {
    throw new Error('useAthleteRawContext must be used within an AthleteProvider');
  }
  return context;
}
