/**
 * src/components/layout/ContextSelectorDropdown.tsx
 * Selettore Permanente Globale di Contesto Atleta / Squadra conforme alla "Regola dei 2 Click".
 * ZONA 3 Schema 5: Ricerca istantanea multi-squadra, accessibilita WAI-ARIA completa,
 * etichette tattiche localizzate e formattazione peso sicura (ADR-03 / Regola 02).
 */

import React, { useState, useMemo, useCallback, useId } from 'react';
import { useAthleteContext } from '../../hooks/useAthleteContext';
import { useDismissiblePopover, isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import { AthleticAvailabilityStatus, TacticalRole, Athlete, Team } from '../../types';
import { formatLoad } from '../../utils/number-format';

export const Z_INDEX_DROPDOWN = 60;
export const DROPDOWN_WIDTH_PX = 320;
export const POPOVER_VIEWPORT_MARGIN_PX = 24;
export const POPOVER_OFFSET_PX = 6;
export const POPOVER_BLUR_PX = 20;
export const TRIGGER_BLUR_PX = 12;
export const TRIGGER_MIN_HEIGHT_PX = 40;
export const LIST_MAX_HEIGHT_PX = 240;
export const TRANSITION_DURATION_MS = 150;
export const ITEM_TRANSITION_MS = 100;
export const STATUS_DOT_SIZE_PX = 8;
export const OPTION_DOT_SIZE_PX = 5;
export const CHEVRON_ICON_SIZE_PX = 16;
export const SEARCH_ICON_SIZE_PX = 14;
export const SEARCH_ICON_LEFT_PX = 8;
export const BORDER_RADIUS_TRIGGER_PX = 10;
export const BORDER_RADIUS_POPOVER_PX = 12;
export const BORDER_RADIUS_ITEM_PX = 6;
export const BORDER_RADIUS_PILL_PX = 999;
export const SELECTED_BORDER_WIDTH_PX = 3;

export const POPOVER_GLASS_BG = 'rgba(15, 23, 42, 0.88)';
export const TRIGGER_BG_CLOSED = 'rgba(15, 23, 42, 0.75)';
export const TRIGGER_BG_OPEN = 'rgba(30, 41, 59, 0.9)';
export const SEARCH_INPUT_BG = 'rgba(30, 41, 59, 0.6)';
export const TAB_ACTIVE_BG = 'rgba(56, 189, 248, 0.15)';
export const ITEM_SELECTED_BG = 'rgba(56, 189, 248, 0.12)';
export const ITEM_ACTIVE_BG = 'rgba(56, 189, 248, 0.08)';
export const CROSS_TEAM_BADGE_BG = 'rgba(148, 163, 184, 0.16)';
export const FOCUS_RING_OUTLINE = '2px solid #38bdf8';
export const FOCUS_RING_SHADOW = '0 0 0 3px rgba(56, 189, 248, 0.35)';
export const UNSET_INDEX = -1;
export const ARROW_DOWN_KEY = 'ArrowDown';
export const ARROW_UP_KEY = 'ArrowUp';
export const ENTER_KEY = 'Enter';
export const ROLE_TAB = 'tab';

export const AVAILABILITY_COLORS: Readonly<Record<AthleticAvailabilityStatus, string>> = Object.freeze({
  fit: '#10b981',
  caution: '#f59e0b',
  rehab: '#a855f7',
  injured: '#f43f5e'
});

export const AVAILABILITY_LABELS: Readonly<Record<AthleticAvailabilityStatus, string>> = Object.freeze({
  fit: 'Disponibile',
  caution: 'Carico Ridotto',
  rehab: 'Return-to-Play',
  injured: 'Blocco Clinico'
});

export const TACTICAL_ROLE_LABELS: Readonly<Record<TacticalRole, string>> = Object.freeze({
  goalkeeper: 'Portiere',
  center_back: 'Difensore Centrale',
  full_back: 'Terzino',
  defensive_midfielder: 'Mediano',
  central_midfielder: 'Centrocampista',
  attacking_midfielder: 'Trequartista',
  winger: 'Ala',
  striker: 'Attaccante',
  generic_athlete: 'Atleta Generico'
});

export type ContextSelectorTab = 'athletes' | 'teams';

export interface ContextSelectorDropdownProps {
  /** Permette di aprire il popover gia al primo render (utile per test SSR/statici). */
  defaultOpen?: boolean;
}

/**
 * Converte un identificativo di ruolo tattico `snake_case` nella relativa etichetta italiana leggibile.
 * @param role Codice ruolo tattico dell'atleta
 * @returns Etichetta leggibile in italiano (fallback sicuro sul valore grezzo se non mappato)
 */
export function formatTacticalRoleLabel(role: TacticalRole): string {
  return TACTICAL_ROLE_LABELS[role] ?? role;
}

/**
 * Costruisce il sottotitolo anagrafico dell'atleta evitando stringhe `undefined kg` quando il peso e assente.
 * @param athlete Record atleta da formattare
 * @returns Ruolo tattico leggibile ed eventuale massa corporea formattata in kg (ISO 80000-1)
 */
export function formatAthleteSubtitle(athlete: Athlete): string {
  const roleLabel = formatTacticalRoleLabel(athlete.tacticalRole);
  if (athlete.currentWeightKg !== undefined && Number.isFinite(athlete.currentWeightKg)) {
    return `${roleLabel} • ${formatLoad(athlete.currentWeightKg)}`;
  }
  return roleLabel;
}

/**
 * Filtra l'elenco globale degli atleti per nome completo, ruolo tattico localizzato o codice squadra.
 * @param athletes Lista completa degli atleti accessibili
 * @param query Testo di ricerca inserito dall'utente
 * @param teamById Mappa opzionale ID squadra -> Team per filtrare anche per nome/codice club
 * @returns Sottoinsieme filtrato di atleti
 */
export function filterAthletesByQuery(
  athletes: readonly Athlete[],
  query: string,
  teamById?: ReadonlyMap<string, Team>
): readonly Athlete[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return athletes;
  }

  return athletes.filter((ath) => {
    const fullName = `${ath.name} ${ath.surname}`.toLowerCase();
    const rawRole = ath.tacticalRole.toLowerCase();
    const localizedRole = formatTacticalRoleLabel(ath.tacticalRole).toLowerCase();
    const team = ath.teamId && teamById ? teamById.get(ath.teamId) : undefined;
    const teamMatch = team
      ? team.name.toLowerCase().includes(normalizedQuery) ||
        team.clubCode.toLowerCase().includes(normalizedQuery)
      : false;

    return (
      fullName.includes(normalizedQuery) ||
      rawRole.includes(normalizedQuery) ||
      localizedRole.includes(normalizedQuery) ||
      teamMatch
    );
  });
}

/**
 * Filtra l'elenco delle squadre per nome o codice club.
 * @param teams Lista delle squadre disponibili
 * @param query Testo di ricerca inserito dall'utente
 * @returns Sottoinsieme filtrato di squadre
 */
export function filterTeamsByQuery(
  teams: readonly Team[],
  query: string
): readonly Team[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return teams;
  }

  return teams.filter((team) => {
    return (
      team.name.toLowerCase().includes(normalizedQuery) ||
      team.clubCode.toLowerCase().includes(normalizedQuery)
    );
  });
}

/**
 * Selettore permanente di contesto Atleta/Squadra con switch atomico in <= 2 click tra team diversi.
 * @param props Proprieta opzionali del selettore (es. `defaultOpen` per collaudo statico)
 * @returns Componente React accessibile del selettore globale
 */
export const ContextSelectorDropdown: React.FC<ContextSelectorDropdownProps> = ({
  defaultOpen = false
}) => {
  const {
    selectedTeam,
    selectedAthlete,
    teams,
    allAthletes,
    isAthleteMode,
    isTeamMode,
    selectAthleteAndMode,
    selectTeamAndMode
  } = useAthleteContext();

  const [activeTab, setActiveTab] = useState<ContextSelectorTab>('athletes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(UNSET_INDEX);
  const [focusedElementId, setFocusedElementId] = useState<string | null>(null);

  const baseId = useId();
  const popoverId = `${baseId}-popover`;
  const listboxId = `${baseId}-listbox`;

  /**
   * Ripristina lo stato transiente della ricerca e dell'indice attivo alla chiusura del popover.
   */
  const handlePopoverClose = useCallback((): void => {
    setSearchQuery('');
    setActiveIndex(UNSET_INDEX);
    setFocusedElementId(null);
  }, []);

  const {
    isOpen,
    toggle,
    close,
    containerRef,
    triggerRef
  } = useDismissiblePopover({
    initialOpen: defaultOpen,
    onClose: handlePopoverClose
  });

  /**
   * Mappa rapida per risolvere il nome/codice squadra associato a ciascun atleta cross-team.
   */
  const teamByIdMap = useMemo(() => {
    const map = new Map<string, Team>();
    for (const team of teams) {
      map.set(team.id, team);
    }
    return map;
  }, [teams]);

  /**
   * Ordina gli atleti privilegiando la rosa attiva mantenendo selezionabili tutti gli atleti in <= 2 click.
   */
  const orderedAthletes = useMemo(() => {
    if (!selectedTeam) {
      return allAthletes;
    }
    const activeRosterSet = new Set(selectedTeam.rosterAthleteIds);
    const inActiveTeam: Athlete[] = [];
    const crossTeam: Athlete[] = [];

    for (const ath of allAthletes) {
      if (activeRosterSet.has(ath.id) || ath.teamId === selectedTeam.id) {
        inActiveTeam.push(ath);
      } else {
        crossTeam.push(ath);
      }
    }
    return [...inActiveTeam, ...crossTeam];
  }, [allAthletes, selectedTeam]);

  const filteredAthletes = useMemo(() => {
    return filterAthletesByQuery(orderedAthletes, searchQuery, teamByIdMap);
  }, [orderedAthletes, searchQuery, teamByIdMap]);

  const filteredTeams = useMemo(() => {
    return filterTeamsByQuery(teams, searchQuery);
  }, [teams, searchQuery]);

  const currentItemCount = activeTab === 'athletes' ? filteredAthletes.length : filteredTeams.length;

  /**
   * Cambia tab azzerando ricerca e cursore tastiera per evitare risultati incoerenti.
   * @param nextTab Scheda di destinazione (`athletes` o `teams`)
   */
  const handleTabChange = useCallback((nextTab: ContextSelectorTab): void => {
    setActiveTab(nextTab);
    setSearchQuery('');
    setActiveIndex(UNSET_INDEX);
  }, []);

  /**
   * Seleziona un atleta (anche di altra squadra) in un singolo click e chiude il popover.
   * @param athleteId Identificativo univoco dell'atleta
   */
  const handleSelectAthlete = useCallback(
    (athleteId: string): void => {
      selectAthleteAndMode(athleteId);
      close(true);
    },
    [selectAthleteAndMode, close]
  );

  /**
   * Seleziona una squadra in un singolo click e chiude il popover.
   * @param teamId Identificativo univoco della squadra
   */
  const handleSelectTeam = useCallback(
    (teamId: string): void => {
      selectTeamAndMode(teamId);
      close(true);
    },
    [selectTeamAndMode, close]
  );

  /**
   * Gestisce la variazione del campo ricerca aggiornando il cursore tastiera.
   * @param event Evento input controllato
   */
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.target.value;
    setSearchQuery(nextValue);
    setActiveIndex(nextValue.trim().length > 0 ? 0 : UNSET_INDEX);
  }, []);

  /**
   * Gestisce la navigazione da tastiera (`ArrowUp`, `ArrowDown`, `Enter`) dentro il popover.
   * @param event Evento tastiera intercettato sul contenitore `role="dialog"`
   */
  const handlePopoverKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (currentItemCount === 0) {
        return;
      }

      if (event.key === ARROW_DOWN_KEY) {
        event.preventDefault();
        setActiveIndex((prev) => (prev < 0 ? 0 : (prev + 1) % currentItemCount));
        return;
      }

      if (event.key === ARROW_UP_KEY) {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev <= 0 ? currentItemCount - 1 : prev - 1
        );
        return;
      }

      if (event.key === ENTER_KEY) {
        const targetEl = event.target instanceof HTMLElement ? event.target : null;
        if (targetEl?.getAttribute('role') === ROLE_TAB) {
          return;
        }

        const safeIndex = activeIndex >= 0 && activeIndex < currentItemCount ? activeIndex : UNSET_INDEX;
        if (safeIndex === UNSET_INDEX) {
          return;
        }

        event.preventDefault();
        if (activeTab === 'athletes') {
          const targetAthlete = filteredAthletes[safeIndex];
          if (targetAthlete) {
            handleSelectAthlete(targetAthlete.id);
          }
        } else {
          const targetTeam = filteredTeams[safeIndex];
          if (targetTeam) {
            handleSelectTeam(targetTeam.id);
          }
        }
      }
    },
    [
      currentItemCount,
      activeIndex,
      activeTab,
      filteredAthletes,
      filteredTeams,
      handleSelectAthlete,
      handleSelectTeam
    ]
  );

  /**
   * Restituisce gli stili di focus accessibile solo quando il controllo riceve focus da tastiera.
   * @param elementId Identificativo logico del controllo interattivo
   * @returns Oggetto parziale di stile CSS per `:focus-visible`
   */
  const getFocusStyle = useCallback(
    (elementId: string): React.CSSProperties => {
      if (focusedElementId !== elementId) {
        return {};
      }
      return {
        outline: FOCUS_RING_OUTLINE,
        outlineOffset: '2px',
        boxShadow: FOCUS_RING_SHADOW
      };
    },
    [focusedElementId]
  );

  /**
   * Registra lo stato di focus da tastiera sul controllo attivo.
   * @param elementId Identificativo logico del controllo
   * @param event Evento focus React
   */
  const handleControlFocus = useCallback(
    (elementId: string, event: React.FocusEvent<HTMLElement>): void => {
      if (isKeyboardFocusTarget(event.currentTarget)) {
        setFocusedElementId(elementId);
      }
    },
    []
  );

  /**
   * Rimuove l'evidenziazione di focus al blur del controllo.
   * @param elementId Identificativo logico del controllo
   */
  const handleControlBlur = useCallback((elementId: string): void => {
    setFocusedElementId((prev) => (prev === elementId ? null : prev));
  }, []);

  const currentStatusColor = selectedAthlete
    ? AVAILABILITY_COLORS[selectedAthlete.availabilityStatus]
    : AVAILABILITY_COLORS.fit;

  const activeOptionId =
    activeIndex >= 0 && activeIndex < currentItemCount
      ? `${baseId}-option-${activeTab}-${activeIndex}`
      : undefined;

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
      {/* Bottone Trigger permanente */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        onFocus={(e) => handleControlFocus('trigger', e)}
        onBlur={() => handleControlBlur('trigger')}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        aria-label="Selettore globale contesto atleta o squadra"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          minHeight: `${TRIGGER_MIN_HEIGHT_PX}px`,
          maxWidth: '100%',
          padding: '0.45rem 0.85rem',
          backgroundColor: isOpen ? TRIGGER_BG_OPEN : TRIGGER_BG_CLOSED,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: `${BORDER_RADIUS_TRIGGER_PX}px`,
          color: '#f8fafc',
          cursor: 'pointer',
          backdropFilter: `blur(${TRIGGER_BLUR_PX}px)`,
          WebkitBackdropFilter: `blur(${TRIGGER_BLUR_PX}px)`,
          transition: `all ${TRANSITION_DURATION_MS}ms ease-in-out`,
          ...getFocusStyle('trigger')
        }}
      >
        {/* Indicatore visivo disponibilita sportiva */}
        <span
          style={{
            width: `${STATUS_DOT_SIZE_PX}px`,
            height: `${STATUS_DOT_SIZE_PX}px`,
            flexShrink: 0,
            borderRadius: '50%',
            backgroundColor: isTeamMode ? '#38bdf8' : currentStatusColor,
            boxShadow: `0 0 8px ${isTeamMode ? '#38bdf8' : currentStatusColor}`
          }}
        />

        {/* Etichetta contesto attivo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            minWidth: 0
          }}
        >
          <span
            style={{
              fontSize: '0.70rem',
              textTransform: 'uppercase',
              color: '#94a3b8',
              letterSpacing: '0.05em'
            }}
          >
            {isTeamMode ? 'Squadra Attiva' : 'Atleta Attivo'}
          </span>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#f1f5f9',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '180px'
            }}
          >
            {isTeamMode
              ? selectedTeam?.name || 'Tutte le Squadre'
              : selectedAthlete
              ? `${selectedAthlete.name} ${selectedAthlete.surname}`
              : 'Seleziona Atleta'}
          </span>
        </div>

        {/* Icona Chevron SVG */}
        <svg
          width={CHEVRON_ICON_SIZE_PX}
          height={CHEVRON_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            marginLeft: '0.25rem',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform ${TRANSITION_DURATION_MS}ms ease`
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Popover Dialog Selettore Contesto */}
      {isOpen && (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Selettore contesto atleta o squadra"
          onKeyDown={handlePopoverKeyDown}
          style={{
            position: 'absolute',
            top: `calc(100% + ${POPOVER_OFFSET_PX}px)`,
            left: 0,
            width: `min(${DROPDOWN_WIDTH_PX}px, calc(100vw - ${POPOVER_VIEWPORT_MARGIN_PX}px))`,
            maxWidth: `calc(100vw - ${POPOVER_VIEWPORT_MARGIN_PX}px)`,
            backgroundColor: POPOVER_GLASS_BG,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: `${BORDER_RADIUS_POPOVER_PX}px`,
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65)',
            zIndex: Z_INDEX_DROPDOWN,
            overflow: 'hidden',
            backdropFilter: `blur(${POPOVER_BLUR_PX}px)`,
            WebkitBackdropFilter: `blur(${POPOVER_BLUR_PX}px)`
          }}
        >
          {/* Selettore Tab sempre disponibile (Atleti / Squadre) */}
          <div
            role="tablist"
            aria-label="Modalita contesto"
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '0.35rem',
              gap: '0.25rem'
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'athletes'}
              onClick={() => handleTabChange('athletes')}
              onFocus={(e) => handleControlFocus('tab-athletes', e)}
              onBlur={() => handleControlBlur('tab-athletes')}
              style={{
                flex: 1,
                padding: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: activeTab === 'athletes' ? TAB_ACTIVE_BG : 'transparent',
                color: activeTab === 'athletes' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                borderRadius: `${BORDER_RADIUS_ITEM_PX}px`,
                cursor: 'pointer',
                ...getFocusStyle('tab-athletes')
              }}
            >
              Atleti ({allAthletes.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'teams'}
              onClick={() => handleTabChange('teams')}
              onFocus={(e) => handleControlFocus('tab-teams', e)}
              onBlur={() => handleControlBlur('tab-teams')}
              style={{
                flex: 1,
                padding: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: activeTab === 'teams' ? TAB_ACTIVE_BG : 'transparent',
                color: activeTab === 'teams' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                borderRadius: `${BORDER_RADIUS_ITEM_PX}px`,
                cursor: 'pointer',
                ...getFocusStyle('tab-teams')
              }}
            >
              Squadre ({teams.length})
            </button>
          </div>

          {/* Campo di Ricerca Istantanea (senza autoFocus trap) */}
          <div style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg
                width={SEARCH_ICON_SIZE_PX}
                height={SEARCH_ICON_SIZE_PX}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                aria-hidden="true"
                style={{ position: 'absolute', left: `${SEARCH_ICON_LEFT_PX}px`, pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={(e) => handleControlFocus('search-input', e)}
                onBlur={() => handleControlBlur('search-input')}
                aria-label={activeTab === 'athletes' ? 'Cerca atleta per nome o ruolo' : 'Cerca squadra'}
                aria-controls={listboxId}
                aria-activedescendant={activeOptionId}
                placeholder={activeTab === 'athletes' ? 'Cerca per nome o ruolo...' : 'Cerca squadra...'}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.4rem 0.5rem 0.4rem 2rem',
                  fontSize: '0.8rem',
                  backgroundColor: SEARCH_INPUT_BG,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: `${BORDER_RADIUS_ITEM_PX}px`,
                  color: '#f8fafc',
                  ...getFocusStyle('search-input')
                }}
              />
            </div>
          </div>

          {/* Elenco Selezionabile WAI-ARIA Listbox */}
          <div
            id={listboxId}
            role="listbox"
            aria-label={activeTab === 'athletes' ? 'Elenco atleti' : 'Elenco squadre'}
            style={{ maxHeight: `${LIST_MAX_HEIGHT_PX}px`, overflowY: 'auto', padding: '0.25rem 0' }}
          >
            {activeTab === 'athletes' ? (
              filteredAthletes.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                  Nessun atleta trovato
                </div>
              ) : (
                filteredAthletes.map((ath, index) => {
                  const isSelected = isAthleteMode && selectedAthlete?.id === ath.id;
                  const isKeyboardActive = activeIndex === index;
                  const statusColor = AVAILABILITY_COLORS[ath.availabilityStatus];
                  const statusLabel = AVAILABILITY_LABELS[ath.availabilityStatus];
                  const athleteTeam = ath.teamId ? teamByIdMap.get(ath.teamId) : undefined;
                  const isCrossTeam = Boolean(athleteTeam && athleteTeam.id !== selectedTeam?.id);
                  const optionId = `${baseId}-option-athletes-${index}`;

                  return (
                    <button
                      key={ath.id}
                      id={optionId}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectAthlete(ath.id)}
                      onFocus={(e) => handleControlFocus(optionId, e)}
                      onBlur={() => handleControlBlur(optionId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: isSelected
                          ? ITEM_SELECTED_BG
                          : isKeyboardActive
                          ? ITEM_ACTIVE_BG
                          : 'transparent',
                        border: 'none',
                        borderLeft: isSelected
                          ? `${SELECTED_BORDER_WIDTH_PX}px solid #38bdf8`
                          : `${SELECTED_BORDER_WIDTH_PX}px solid transparent`,
                        color: '#f1f5f9',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: `background-color ${ITEM_TRANSITION_MS}ms ease`,
                        ...getFocusStyle(optionId)
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400 }}>
                            {ath.name} {ath.surname}
                          </span>
                          {athleteTeam && (isCrossTeam || teams.length > 1) && (
                            <span
                              style={{
                                fontSize: '0.62rem',
                                fontWeight: 600,
                                padding: '0.1rem 0.35rem',
                                borderRadius: `${BORDER_RADIUS_PILL_PX}px`,
                                backgroundColor: CROSS_TEAM_BADGE_BG,
                                color: '#cbd5e1'
                              }}
                            >
                              {athleteTeam.clubCode}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          {formatAthleteSubtitle(ath)}
                        </span>
                      </div>

                      {/* Pillola stato disponibilita */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          flexShrink: 0,
                          fontSize: '0.68rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: `${BORDER_RADIUS_PILL_PX}px`,
                          backgroundColor: `${statusColor}22`,
                          color: statusColor,
                          border: `1px solid ${statusColor}44`
                        }}
                      >
                        <span
                          style={{
                            width: `${OPTION_DOT_SIZE_PX}px`,
                            height: `${OPTION_DOT_SIZE_PX}px`,
                            borderRadius: '50%',
                            backgroundColor: statusColor
                          }}
                        />
                        {statusLabel}
                      </span>
                    </button>
                  );
                })
              )
            ) : filteredTeams.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                Nessuna squadra trovata
              </div>
            ) : (
              filteredTeams.map((team, index) => {
                const isSelected = isTeamMode && selectedTeam?.id === team.id;
                const isKeyboardActive = activeIndex === index;
                const optionId = `${baseId}-option-teams-${index}`;

                return (
                  <button
                    key={team.id}
                    id={optionId}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectTeam(team.id)}
                    onFocus={(e) => handleControlFocus(optionId, e)}
                    onBlur={() => handleControlBlur(optionId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      backgroundColor: isSelected
                        ? ITEM_SELECTED_BG
                        : isKeyboardActive
                        ? ITEM_ACTIVE_BG
                        : 'transparent',
                      border: 'none',
                      borderLeft: isSelected
                        ? `${SELECTED_BORDER_WIDTH_PX}px solid #38bdf8`
                        : `${SELECTED_BORDER_WIDTH_PX}px solid transparent`,
                      color: '#f1f5f9',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: `background-color ${ITEM_TRANSITION_MS}ms ease`,
                      ...getFocusStyle(optionId)
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400 }}>
                        {team.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Codice: {team.clubCode}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>
                      {team.rosterAthleteIds.length} atleti
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextSelectorDropdown;
