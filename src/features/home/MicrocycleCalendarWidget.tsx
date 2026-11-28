/**
 * src/features/home/MicrocycleCalendarWidget.tsx
 * Widget Calendario Stagionale & Microciclo corrente della Control Room Cockpit.
 * Evidenzia i giorni MD-X, il giorno corrente, i prossimi test atletici e le gare in calendario.
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useCallback } from 'react';
import { isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import {
  ACCENT_CYAN,
  MIN_TOUCH_TARGET_PX,
  SURFACE_BORDER_SUBTLE,
  SURFACE_CARD_BG,
  SURFACE_SUBTLE_BG,
  TEXT_PRIMARY_CONTRAST,
  TEXT_SECONDARY_CONTRAST,
  WARNING_TEXT_SAFE,
  getCommonFocusStyle,
  sanitizeDisplayText
} from '../../components/common/ui-state-utils';
import { MicrocycleDaySlot } from './home-mock-data';

export const MICROCYCLE_CARD_RADIUS_PX = 16;

export interface MicrocycleCalendarWidgetProps {
  /** Giorni del microciclo stagionale corrente (MD-4..MD). */
  slots: readonly MicrocycleDaySlot[];
  /** Callback rapida verso il modulo di Programmazione (Regola dei 2 Click). */
  onOpenProgramming?: () => void;
}

/**
 * Renderizza il calendario compatto del microciclo settimanale e i prossimi test o gare.
 * @param props Slot giornalieri MD-X e callback di navigazione verso Programmazione
 * @returns Card calendario stagionale Dark Cockpit ad alto contrasto
 */
export const MicrocycleCalendarWidget: React.FC<MicrocycleCalendarWidgetProps> = ({
  slots,
  onOpenProgramming
}) => {
  const [isButtonFocused, setIsButtonFocused] = useState<boolean>(false);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLButtonElement>): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setIsButtonFocused(true);
    }
  }, []);

  const handleBlur = useCallback((): void => {
    setIsButtonFocused(false);
  }, []);

  return (
    <section
      aria-label="Calendario stagionale e microciclo corrente"
      style={{
        padding: '1.25rem',
        backgroundColor: SURFACE_CARD_BG,
        border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
        borderRadius: `${MICROCYCLE_CARD_RADIUS_PX}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: ACCENT_CYAN }}>
            Calendario Stagionale
          </span>
          <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.05rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST }}>
            Microciclo Corrente &amp; Test
          </h3>
        </div>

        {onOpenProgramming && (
          <button
            type="button"
            onClick={onOpenProgramming}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              minHeight: `${MIN_TOUCH_TARGET_PX}px`,
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              color: ACCENT_CYAN,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              ...getCommonFocusStyle(isButtonFocused)
            }}
          >
            Apri Programmazione
          </button>
        )}
      </div>

      {slots.length === 0 ? (
        <div
          style={{
            padding: '0.95rem',
            borderRadius: '10px',
            backgroundColor: SURFACE_SUBTLE_BG,
            fontSize: '0.85rem',
            color: TEXT_SECONDARY_CONTRAST
          }}
        >
          Nessun evento di microciclo pianificato in questa settimana.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
            gap: '0.6rem'
          }}
        >
          {slots.map((slot) => {
            const borderColor = slot.isToday
              ? 'rgba(56, 189, 248, 0.65)'
              : slot.isMatchOrTest
              ? 'rgba(245, 158, 11, 0.5)'
              : SURFACE_BORDER_SUBTLE;

            return (
              <div
                key={slot.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  backgroundColor: slot.isToday ? 'rgba(56, 189, 248, 0.12)' : SURFACE_SUBTLE_BG,
                  border: `1px solid ${borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: slot.isMatchOrTest ? WARNING_TEXT_SAFE : ACCENT_CYAN, fontVariantNumeric: 'tabular-nums' }}>
                    {sanitizeDisplayText(slot.dayTag, 'MD')}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: TEXT_SECONDARY_CONTRAST }}>
                    {sanitizeDisplayText(slot.dayLabel, '')} {sanitizeDisplayText(slot.dateLabel, '')}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST }}>
                  {slot.sessionType}
                </div>

                <div style={{ fontSize: '0.74rem', color: TEXT_SECONDARY_CONTRAST, lineHeight: 1.35 }}>
                  {sanitizeDisplayText(slot.eventNote, 'Seduta ordinaria')}
                </div>

                {slot.isToday && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: ACCENT_CYAN }}>
                    Oggi
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MicrocycleCalendarWidget;
