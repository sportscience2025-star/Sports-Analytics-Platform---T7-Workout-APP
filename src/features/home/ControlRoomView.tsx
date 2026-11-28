/**
 * src/features/home/ControlRoomView.tsx
 * Vista principale Home Dashboard & Control Room Cockpit (TASK-010).
 * Integra i 4 stati UI (`ViewStateContainer`), switch istantaneo Atleta/Squadra,
 * Regola dei 2 Click, isolamento Silo 3 (`researcher`) e banner alert Tier 3.
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useMemo, useCallback } from 'react';
import { AppModuleId } from '../../types';
import { useTier } from '../../hooks/useTier';
import { useAthleteContext } from '../../hooks/useAthleteContext';
import { isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import { ViewStateContainer, ViewStateStatus } from '../../components/common/ViewStateContainer';
import {
  ACCENT_CYAN,
  MIN_TOUCH_TARGET_PX,
  SURFACE_BORDER_SUBTLE,
  SURFACE_CARD_BG,
  TEXT_PRIMARY_CONTRAST,
  TEXT_SECONDARY_CONTRAST,
  getCommonFocusStyle
} from '../../components/common/ui-state-utils';
import {
  CONTROL_ROOM_QUICK_ACTIONS,
  CertifiedT7Card,
  DEMO_CERTIFIED_T7_CARDS,
  DEMO_DAILY_WORKOUTS,
  DEMO_MICROCYCLE_SLOTS,
  DEMO_TEAM_HEALTH_ALERTS,
  DailyWorkoutPlan,
  MicrocycleDaySlot,
  ROLE_RESEARCHER_RESTRICTED,
  ShareableT7Summary,
  TeamHealthAlert,
  resolveCertifiedCardsForContext,
  resolveControlRoomViewState,
  resolveDailyWorkoutForContext,
  resolveTeamAlertsForContext
} from './home-mock-data';
import { DailyWorkoutCard } from './DailyWorkoutCard';
import { CertifiedT7CardsHistory } from './CertifiedT7CardsHistory';
import { MicrocycleCalendarWidget } from './MicrocycleCalendarWidget';
import { TeamHealthAlertsBanner } from './TeamHealthAlertsBanner';

export const CONTROL_ROOM_PADDING_CSS = '1.25rem';
export const CONTROL_ROOM_MAX_WIDTH_PX = 1280;

export interface ControlRoomViewProps {
  /** Override esplicito dello stato UI (`loading`, `error`, `empty`, `populated`). */
  viewState?: ViewStateStatus;
  /** Errore esplicito inoltrato a `ErrorFallback` quando `viewState === 'error'`. */
  error?: Error | string | null;
  /** Handler retry per `ErrorFallback` nello stato errore. */
  onRetry?: () => void;
  /** Override offline PWA per test o simulazione. */
  isOffline?: boolean;
  /** Callback di navigazione rapida verso uno dei moduli della piattaforma. */
  onNavigateModule?: (moduleId: AppModuleId) => void;
  /** Callback invocata al click su "Avvia Sessione" nella DailyWorkoutCard. */
  onStartSession?: (workoutId: string) => void;
  /** Callback invocata al click su "Dettaglio" di una Card Certificata T7. */
  onInspectCard?: (cardId: string) => void;
  /** Callback invocata al click su "Condividi" con summary filtrato per privacy. */
  onShareCard?: (summary: ShareableT7Summary) => void;
  /** Fixture opzionali dei piani giornalieri (default: `DEMO_DAILY_WORKOUTS`). */
  dailyWorkouts?: readonly DailyWorkoutPlan[];
  /** Fixture opzionali dello storico Card T7 (default: `DEMO_CERTIFIED_T7_CARDS`). */
  certifiedCards?: readonly CertifiedT7Card[];
  /** Fixture opzionali del calendario microciclo (default: `DEMO_MICROCYCLE_SLOTS`). */
  microcycleSlots?: readonly MicrocycleDaySlot[];
  /** Fixture opzionali degli alert squadra Tier 3 (default: `DEMO_TEAM_HEALTH_ALERTS`). */
  teamAlerts?: readonly TeamHealthAlert[];
}

/**
 * Centro di comando primario della piattaforma T7: orchestrazione a 2 click e 4 stati UI.
 * @param props Gestori di navigazione, override stato e dataset opzionali
 * @returns Vista Control Room protetta da `ViewStateContainer` e RBAC Silos
 */
export const ControlRoomView: React.FC<ControlRoomViewProps> = ({
  viewState,
  error,
  onRetry,
  isOffline,
  onNavigateModule,
  onStartSession,
  onInspectCard,
  onShareCard,
  dailyWorkouts = DEMO_DAILY_WORKOUTS,
  certifiedCards = DEMO_CERTIFIED_T7_CARDS,
  microcycleSlots = DEMO_MICROCYCLE_SLOTS,
  teamAlerts = DEMO_TEAM_HEALTH_ALERTS
}) => {
  const { role, isModuleAllowed } = useTier();
  const {
    contextMode,
    selectedTeam,
    selectedTeamId,
    selectedAthleteId,
    roster,
    isTeamMode,
    isRosterEmpty,
    athleteFullName,
    teamName,
    activeAvailabilityStatus,
    selectAthleteAndMode
  } = useAthleteContext();

  const [focusedActionId, setFocusedActionId] = useState<string | null>(null);
  const isResearcherRole = role === ROLE_RESEARCHER_RESTRICTED;

  const rosterIdSet = useMemo<ReadonlySet<string>>(() => {
    return new Set(roster.map((ath) => ath.id));
  }, [roster]);

  const activeDailyWorkout = useMemo<DailyWorkoutPlan | null>(() => {
    if (isResearcherRole) {
      return null;
    }
    return resolveDailyWorkoutForContext(
      dailyWorkouts,
      contextMode,
      selectedAthleteId,
      selectedTeamId,
      rosterIdSet
    );
  }, [isResearcherRole, dailyWorkouts, contextMode, selectedAthleteId, selectedTeamId, rosterIdSet]);

  const activeCards = useMemo<readonly CertifiedT7Card[]>(() => {
    if (isResearcherRole) {
      return [];
    }
    return resolveCertifiedCardsForContext(
      certifiedCards,
      contextMode,
      selectedAthleteId,
      selectedTeamId,
      rosterIdSet
    );
  }, [isResearcherRole, certifiedCards, contextMode, selectedAthleteId, selectedTeamId, rosterIdSet]);

  const activeMicrocycleSlots = useMemo<readonly MicrocycleDaySlot[]>(() => {
    return microcycleSlots.filter(
      (slot) => selectedTeamId === null || slot.teamId === selectedTeamId
    );
  }, [microcycleSlots, selectedTeamId]);

  const activeAlerts = useMemo<readonly TeamHealthAlert[]>(() => {
    return resolveTeamAlertsForContext(
      teamAlerts,
      contextMode,
      selectedAthleteId,
      selectedTeamId,
      rosterIdSet
    );
  }, [teamAlerts, contextMode, selectedAthleteId, selectedTeamId, rosterIdSet]);

  const hasContent =
    isResearcherRole ||
    (!isRosterEmpty &&
      (activeDailyWorkout !== null ||
        activeCards.length > 0 ||
        activeMicrocycleSlots.length > 0));

  const resolvedState = resolveControlRoomViewState(viewState, hasContent);

  const handleInspectAlertAthlete = useCallback((athleteId: string): void => {
    selectAthleteAndMode(athleteId);
    onNavigateModule?.('analysis');
  }, [selectAthleteAndMode, onNavigateModule]);

  const handleActionFocus = useCallback((id: string, event: React.FocusEvent<HTMLButtonElement>): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setFocusedActionId(id);
    }
  }, []);

  const handleActionBlur = useCallback((): void => {
    setFocusedActionId(null);
  }, []);

  const contextHeading = isResearcherRole
    ? 'Research Hub — Vista De-identificata Silo 3'
    : isTeamMode
    ? `Control Room Squadra • ${teamName || 'Rosa Attiva'}`
    : `Control Room Atleta • ${athleteFullName || 'Atleta'}`;

  const contextSubtitle = isResearcherRole
    ? 'Accesso statistico anonimizzato: nessuna PII individuale di Club esposta.'
    : isTeamMode
    ? `${roster.length} atleti monitorati nel microciclo corrente.`
    : 'Riepilogo giornaliero, storico certificato T7 e calendario personalizzato.';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: `${CONTROL_ROOM_MAX_WIDTH_PX}px`,
        margin: '0 auto',
        padding: CONTROL_ROOM_PADDING_CSS,
        boxSizing: 'border-box'
      }}
    >
      <ViewStateContainer
        state={resolvedState}
        populatedAriaLabel="Control Room & Home Dashboard"
        loadingProps={{
          variant: 'card',
          rows: 4,
          label: 'Sincronizzazione Control Room in corso...'
        }}
        errorProps={{
          title: 'Impossibile caricare la Control Room',
          error,
          onRetry,
          isOffline
        }}
        emptyProps={{
          title: 'Control Room pronta per la configurazione',
          description:
            'Nessuna sessione o dato microciclo associato al contesto selezionato. Pianifica la prima scheda operativa.',
          checklist: [
            { id: 'step-prog', label: 'Crea o assegna una scheda di allenamento', completed: false },
            { id: 'step-vbt', label: 'Verifica sensoristica BLE o baseline iniziale', completed: false }
          ],
          actionLabel: 'Pianifica Sessione',
          onAction: () => onNavigateModule?.('programming')
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Testata Contesto & Azioni Rapide a 2 Click */}
          <header
            style={{
              padding: '1.1rem 1.25rem',
              backgroundColor: SURFACE_CARD_BG,
              border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
              borderRadius: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: ACCENT_CYAN }}>
                T7 Control Room • {isTeamMode && selectedTeam ? selectedTeam.clubCode : 'Cockpit'}
              </span>
              <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: TEXT_PRIMARY_CONTRAST }}>
                {contextHeading}
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: TEXT_SECONDARY_CONTRAST }}>
                {contextSubtitle}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {CONTROL_ROOM_QUICK_ACTIONS.filter((act) => isModuleAllowed(act.moduleId)).map((act) => (
                <button
                  key={act.moduleId}
                  type="button"
                  onClick={() => onNavigateModule?.(act.moduleId)}
                  onFocus={(e) => handleActionFocus(act.moduleId, e)}
                  onBlur={handleActionBlur}
                  style={{
                    minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                    padding: '0.45rem 0.85rem',
                    borderRadius: '10px',
                    border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
                    backgroundColor: 'rgba(30, 41, 59, 0.65)',
                    color: TEXT_PRIMARY_CONTRAST,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    ...getCommonFocusStyle(focusedActionId === act.moduleId)
                  }}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </header>

          {isResearcherRole ? (
            <section
              aria-label="Workspace ricerca anonimizzata Silo 3"
              style={{
                padding: '1.25rem',
                backgroundColor: SURFACE_CARD_BG,
                border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST }}>
                Partizione Research Warehouse Attiva (Silo 3)
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: TEXT_SECONDARY_CONTRAST, lineHeight: 1.5 }}>
                Per conformita GDPR ed isolamento Silo 3, i profili individuali e gli alert operativi di Club non sono esposti in questa vista. Accedi a Data Analisi o Libreria Fonti per serie temporali de-identificate.
              </p>
            </section>
          ) : (
            <>
              {/* Alert Prioritari Tier 3 + Staff Autorizzato */}
              <TeamHealthAlertsBanner
                alerts={activeAlerts}
                onInspectAthlete={handleInspectAlertAthlete}
              />

              {/* Sessione del Giorno */}
              <DailyWorkoutCard
                workout={activeDailyWorkout}
                availabilityStatus={isTeamMode ? null : activeAvailabilityStatus}
                contextLabel={isTeamMode ? (teamName || 'Squadra') : (athleteFullName || 'Atleta')}
                onStartSession={onStartSession ?? (() => onNavigateModule?.('programming'))}
                onPlanSession={() => onNavigateModule?.('programming')}
              />

              {/* Calendario Stagionale & Microciclo */}
              <MicrocycleCalendarWidget
                slots={activeMicrocycleSlots}
                onOpenProgramming={() => onNavigateModule?.('programming')}
              />

              {/* Storico Card Certificate T7 */}
              <CertifiedT7CardsHistory
                cards={activeCards}
                showAthleteName={isTeamMode}
                allowSharing={!isResearcherRole}
                onInspectCard={onInspectCard}
                onShareCard={onShareCard}
                onExploreProgramming={() => onNavigateModule?.('programming')}
              />
            </>
          )}
        </div>
      </ViewStateContainer>
    </div>
  );
};

export default ControlRoomView;
