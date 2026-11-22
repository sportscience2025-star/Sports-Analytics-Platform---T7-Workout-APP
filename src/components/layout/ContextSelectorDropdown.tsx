/**
 * src/components/layout/ContextSelectorDropdown.tsx
 * Selettore Permanente Globale di Contesto Atleta / Squadra conforme alla "Regola dei 2 Click".
 * ZONA 3 Schema 5: Ricerca veloce, visualizzazione disponibilità sportiva (GDPR Art. 9) e switch atomico.
 * Conforme a Regola 01 (zero emoji spontanee, solo SVG) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useAthleteContext } from '../../hooks/useAthleteContext';
import { AthleticAvailabilityStatus } from '../../types';

export const Z_INDEX_DROPDOWN = 60;
export const DROPDOWN_WIDTH_PX = 320;

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

export const ContextSelectorDropdown: React.FC = () => {
  const {
    contextMode,
    selectedTeam,
    selectedAthlete,
    teams,
    roster,
    allAthletes,
    isAthleteMode,
    isTeamMode,
    selectAthleteAndMode,
    selectTeamAndMode
  } = useAthleteContext();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'athletes' | 'teams'>('athletes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Chiusura al click esterno e con tasto Escape
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Lista atleti filtrata per ricerca
  const filteredAthletes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sourceList = activeTab === 'athletes' && selectedTeam ? roster : allAthletes;
    if (!query) {
      return sourceList;
    }
    return sourceList.filter((ath) => {
      const fullName = `${ath.name} ${ath.surname}`.toLowerCase();
      const role = ath.tacticalRole.toLowerCase();
      return fullName.includes(query) || role.includes(query);
    });
  }, [searchQuery, activeTab, selectedTeam, roster, allAthletes]);

  // Gestione selezione atleta a 2 click (Click 1 apre, Click 2 seleziona e chiude)
  const handleSelectAthlete = useCallback((athleteId: string): void => {
    selectAthleteAndMode(athleteId);
    setIsOpen(false);
  }, [selectAthleteAndMode]);

  // Gestione selezione squadra a 2 click
  const handleSelectTeam = useCallback((teamId: string): void => {
    selectTeamAndMode(teamId);
    setIsOpen(false);
  }, [selectTeamAndMode]);

  const toggleDropdown = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  const currentStatusColor = selectedAthlete
    ? AVAILABILITY_COLORS[selectedAthlete.availabilityStatus]
    : '#10b981';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bottone Trigger permanente */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Selettore globale contesto atleta o squadra"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          minHeight: '40px',
          padding: '0.45rem 0.85rem',
          backgroundColor: isOpen ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '10px',
          color: '#f8fafc',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'all 150ms ease-in-out',
          outline: 'none'
        }}
      >
        {/* Indicatore visivo disponibilità sportiva */}
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isTeamMode ? '#38bdf8' : currentStatusColor,
            boxShadow: `0 0 8px ${isTeamMode ? '#38bdf8' : currentStatusColor}`
          }}
        />

        {/* Etichetta contesto attivo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <span style={{ fontSize: '0.70rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
            {isTeamMode ? 'Squadra Attiva' : 'Atleta Attivo'}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
            {isTeamMode
              ? selectedTeam?.name || 'Tutte le Squadre'
              : selectedAthlete
              ? `${selectedAthlete.name} ${selectedAthlete.surname}`
              : 'Seleziona Atleta'}
          </span>
        </div>

        {/* Icona Chevron SVG */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            marginLeft: '0.25rem',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu Listbox */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: `${DROPDOWN_WIDTH_PX}px`,
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65)',
            zIndex: Z_INDEX_DROPDOWN,
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          {/* Selettore Tab (Atleti vs Squadre se disponibili) */}
          {teams.length > 0 && (
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.35rem'
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('athletes')}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'athletes' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: activeTab === 'athletes' ? '#38bdf8' : '#94a3b8',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Atleti ({roster.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('teams')}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'teams' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: activeTab === 'teams' ? '#38bdf8' : '#94a3b8',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Squadre ({teams.length})
              </button>
            </div>
          )}

          {/* Campo di Ricerca Istantanea */}
          <div style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                style={{ position: 'absolute', left: '8px' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'athletes' ? 'Cerca per nome o ruolo...' : 'Cerca squadra...'}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.4rem 0.5rem 0.4rem 2rem',
                  fontSize: '0.8rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Elenco Selezionabile */}
          <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '0.25rem 0' }}>
            {activeTab === 'athletes' ? (
              filteredAthletes.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                  Nessun atleta trovato
                </div>
              ) : (
                filteredAthletes.map((ath) => {
                  const isSelected = isAthleteMode && selectedAthlete?.id === ath.id;
                  const statusColor = AVAILABILITY_COLORS[ath.availabilityStatus];
                  const statusLabel = AVAILABILITY_LABELS[ath.availabilityStatus];

                  return (
                    <button
                      key={ath.id}
                      type="button"
                      onClick={() => handleSelectAthlete(ath.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                        border: 'none',
                        borderLeft: isSelected ? '3px solid #38bdf8' : '3px solid transparent',
                        color: '#f1f5f9',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background-color 100ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400 }}>
                          {ath.name} {ath.surname}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          {ath.tacticalRole} • {ath.currentWeightKg} kg
                        </span>
                      </div>

                      {/* Pillola stato disponibilità */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.68rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '999px',
                          backgroundColor: `${statusColor}22`,
                          color: statusColor,
                          border: `1px solid ${statusColor}44`
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: statusColor }} />
                        {statusLabel}
                      </span>
                    </button>
                  );
                })
              )
            ) : (
              teams.map((t) => {
                const isSelected = isTeamMode && selectedTeam?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTeam(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      border: 'none',
                      borderLeft: isSelected ? '3px solid #38bdf8' : '3px solid transparent',
                      color: '#f1f5f9',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400 }}>
                        {t.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Codice: {t.clubCode}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                      {t.rosterAthleteIds.length} atleti
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
