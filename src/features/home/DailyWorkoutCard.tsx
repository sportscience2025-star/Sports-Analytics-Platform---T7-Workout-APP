/**
 * src/features/home/DailyWorkoutCard.tsx
 * Card "Sessione del Giorno" della Control Room Cockpit.
 * Mostra focus operativo, tonnellaggio stimato (kg), durata (min), stato Semaforo RTP,
 * eventuale badge calibrazione baseline (< 6 mesi) e pulsante rapido "Avvia Sessione".
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useCallback } from 'react';
import { AthleticAvailabilityStatus } from '../../types';
import { AVAILABILITY_COLORS, AVAILABILITY_LABELS } from '../../components/layout/ContextSelectorDropdown';
import { isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import {
  ACCENT_CYAN,
  ACCENT_INDIGO,
  MIN_TOUCH_TARGET_PX,
  SURFACE_BORDER_SUBTLE,
  SURFACE_CARD_BG,
  SURFACE_SUBTLE_BG,
  TEXT_PRIMARY_CONTRAST,
  TEXT_SECONDARY_CONTRAST,
  WARNING_BORDER_COLOR,
  WARNING_SURFACE_BG,
  WARNING_TEXT_SAFE,
  getCommonFocusStyle,
  sanitizeDisplayText
} from '../../components/common/ui-state-utils';
import {
  DailyWorkoutPlan,
  formatSessionDurationMin,
  formatSessionTonnageKg
} from './home-mock-data';

export const DAILY_WORKOUT_CARD_RADIUS_PX = 16;
export const DAILY_WORKOUT_EMPTY_LABEL = 'Nessuna sessione pianificata per oggi';
export const DAILY_WORKOUT_EMPTY_CTA = 'Pianifica Sessione';

export interface DailyWorkoutCardProps {
  /** Piano allenamento odierno risolto per atleta o squadra (null se nessuno). */
  workout: DailyWorkoutPlan | null;
  /** Stato Semaforo RTP corrente (disponibilita sportiva, mai diagnosi EMR). */
  availabilityStatus: AthleticAvailabilityStatus | null;
  /** Etichetta contesto visualizzato (nome atleta o nome squadra). */
  contextLabel: string;
  /** Callback invocata al click su "Avvia Sessione" (Regola dei 2 Click). */
  onStartSession?: (workoutId: string) => void;
  /** Callback di navigazione rapida verso la programmazione se nessuna scheda e presente. */
  onPlanSession?: () => void;
}

/**
 * Renderizza la card della sessione odierna oppure un mini Empty State guidato senza spazi vuoti.
 * @param props Dati sessione, disponibilita RTP e handler di navigazione/avvio
 * @returns Card Dark Cockpit ad alto contrasto con unita SI
 */
export const DailyWorkoutCard: React.FC<DailyWorkoutCardProps> = ({
  workout,
  availabilityStatus,
  contextLabel,
  onStartSession,
  onPlanSession
}) => {
  const [isActionFocused, setIsActionFocused] = useState<boolean>(false);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLButtonElement>): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setIsActionFocused(true);
    }
  }, []);

  const handleBlur = useCallback((): void => {
    setIsActionFocused(false);
  }, []);

  const safeContextLabel = sanitizeDisplayText(contextLabel, 'Profilo Attivo');
  const statusColor = availabilityStatus ? AVAILABILITY_COLORS[availabilityStatus] : ACCENT_CYAN;
  const statusLabel = availabilityStatus ? AVAILABILITY_LABELS[availabilityStatus] : 'Squadra';

  if (!workout) {
    return (
      <section
        aria-label={DAILY_WORKOUT_EMPTY_LABEL}
        style={{
          padding: '1.25rem',
          backgroundColor: SURFACE_CARD_BG,
          border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
          borderRadius: `${DAILY_WORKOUT_CARD_RADIUS_PX}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.85rem',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: ACCENT_CYAN }}>
            Sessione del Giorno • {safeContextLabel}
          </span>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST }}>
            {DAILY_WORKOUT_EMPTY_LABEL}
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: TEXT_SECONDARY_CONTRAST, lineHeight: 1.45 }}>
            Assegna una seduta giornaliera o genera un microciclo per avviare il Workout Player.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onPlanSession?.()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            alignSelf: 'flex-start',
            minHeight: `${MIN_TOUCH_TARGET_PX}px`,
            padding: '0.55rem 1.1rem',
            borderRadius: '10px',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            backgroundColor: ACCENT_INDIGO,
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            ...getCommonFocusStyle(isActionFocused)
          }}
        >
          {DAILY_WORKOUT_EMPTY_CTA}
        </button>
      </section>
    );
  }

  const formattedTonnage = formatSessionTonnageKg(workout.estimatedVolumeKg);
  const formattedDuration = formatSessionDurationMin(workout.estimatedDurationMin);

  return (
    <section
      aria-label={`Sessione del giorno: ${workout.title}`}
      style={{
        padding: '1.35rem',
        backgroundColor: SURFACE_CARD_BG,
        border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
        borderRadius: `${DAILY_WORKOUT_CARD_RADIUS_PX}px`,
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxSizing: 'border-box'
      }}
    >
      {/* Intestazione con Semaforo RTP e Fascia Oraria */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: ACCENT_CYAN }}>
            Sessione Pianificata • {sanitizeDisplayText(workout.scheduledSlot, 'Oggi')}
          </span>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST }}>
            {sanitizeDisplayText(workout.title, 'Allenamento Odierno')}
          </h3>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            backgroundColor: `${statusColor}22`,
            border: `1px solid ${statusColor}55`,
            color: statusColor,
            fontSize: '0.74rem',
            fontWeight: 700
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: statusColor }} />
          <span>{statusLabel}</span>
        </span>
      </div>

      <p style={{ margin: 0, fontSize: '0.875rem', color: TEXT_SECONDARY_CONTRAST, lineHeight: 1.5 }}>
        {sanitizeDisplayText(workout.focus, 'Sessione tecnica personalizzata')}
      </p>

      {/* Badge calibrazione obbligatorio per atleti con storico < 6 mesi */}
      {workout.isCalibratingBaseline && (
        <div
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '10px',
            backgroundColor: WARNING_SURFACE_BG,
            border: `1px solid ${WARNING_BORDER_COLOR}`,
            color: WARNING_TEXT_SAFE,
            fontSize: '0.78rem',
            fontWeight: 600
          }}
        >
          Baseline di ruolo temporanea (fase di calibrazione: {workout.baselineSessionCount ?? 0} sessioni registrate)
        </div>
      )}

      {/* Griglia Metriche SI con tabular-nums */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.65rem'
        }}
      >
        <div style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', backgroundColor: SURFACE_SUBTLE_BG }}>
          <div style={{ fontSize: '0.7rem', color: TEXT_SECONDARY_CONTRAST, textTransform: 'uppercase' }}>Volume Stimato</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST, fontVariantNumeric: 'tabular-nums' }}>
            {formattedTonnage}
          </div>
        </div>

        <div style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', backgroundColor: SURFACE_SUBTLE_BG }}>
          <div style={{ fontSize: '0.7rem', color: TEXT_SECONDARY_CONTRAST, textTransform: 'uppercase' }}>Durata</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST, fontVariantNumeric: 'tabular-nums' }}>
            {formattedDuration}
          </div>
        </div>

        <div style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', backgroundColor: SURFACE_SUBTLE_BG }}>
          <div style={{ fontSize: '0.7rem', color: TEXT_SECONDARY_CONTRAST, textTransform: 'uppercase' }}>Esercizi</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST, fontVariantNumeric: 'tabular-nums' }}>
            {workout.exercisesCount} • RPE {workout.targetRpe}
          </div>
        </div>
      </div>

      {/* Azione Primaria a 1 Click */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: TEXT_SECONDARY_CONTRAST }}>
          Contesto: <strong style={{ color: TEXT_PRIMARY_CONTRAST }}>{safeContextLabel}</strong>
        </span>

        <button
          type="button"
          onClick={() => onStartSession?.(workout.id)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            minHeight: `${MIN_TOUCH_TARGET_PX}px`,
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            backgroundColor: ACCENT_INDIGO,
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            ...getCommonFocusStyle(isActionFocused)
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>Avvia Sessione</span>
        </button>
      </div>
    </section>
  );
};

export default DailyWorkoutCard;
