/**
 * src/components/common/EmptyState.tsx
 * Componente standardizzato per Empty State guidati con icona SVG lineare,
 * checklist interattiva opzionale e CTA ad alto contrasto (CAPITOLATO_TECNICO Sez. 4).
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useMemo, useCallback } from 'react';
import { isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import {
  MIN_TOUCH_TARGET_PX,
  SURFACE_CARD_BG,
  SURFACE_SUBTLE_BG,
  SURFACE_BORDER_SUBTLE,
  TEXT_PRIMARY_CONTRAST,
  TEXT_SECONDARY_CONTRAST,
  ACCENT_CYAN,
  ACCENT_INDIGO,
  sanitizeDisplayText,
  getCommonFocusStyle
} from './ui-state-utils';

export const DEFAULT_EMPTY_TITLE = 'Nessun dato disponibile';
export const DEFAULT_EMPTY_DESCRIPTION =
  'Completa la configurazione iniziale o modifica i filtri per popolare questa vista.';
export const EMPTY_STATE_CLASS_NAME = 't7-empty-state';
export const EMPTY_STATE_MAX_WIDTH_PX = 560;
export const EMPTY_STATE_RADIUS_PX = 16;
export const EMPTY_ICON_CONTAINER_PX = 48;
export const EMPTY_ICON_SIZE_PX = 24;

export interface EmptyChecklistItem {
  /** Identificativo univoco della voce della checklist. */
  readonly id: string;
  /** Testo descrittivo dell'azione guidata da completare. */
  readonly label: string;
  /** Stato di completamento iniziale o controllato della voce. */
  readonly completed?: boolean;
  /** Callback opzionale invocata al click sulla singola voce. */
  readonly onToggle?: (id: string) => void;
}

export interface EmptyStateProps {
  /** Titolo principale dell'Empty State. */
  title?: string;
  /** Spiegazione chiara e contestuale per guidare l'utente. */
  description?: string;
  /** Icona vettoriale personalizzata opzionale (esclusivamente SVG). */
  icon?: React.ReactNode;
  /** Elenco di azioni guidate interattive (zero tabelle mute). */
  checklist?: readonly EmptyChecklistItem[];
  /** Etichetta del pulsante d'azione primario (CTA). */
  actionLabel?: string;
  /** Gestore del pulsante d'azione primario. */
  onAction?: () => void;
  /** Etichetta del pulsante d'azione secondario opzionale. */
  secondaryActionLabel?: string;
  /** Gestore del pulsante d'azione secondario opzionale. */
  onSecondaryAction?: () => void;
  /** Variante compatta per card o pannelli laterali. */
  compact?: boolean;
}

/**
 * Icona SVG lineare predefinita per Empty State (zero emoji).
 * @returns Elemento SVG geometrico inline
 */
const DefaultEmptyIcon: React.FC = () => (
  <svg
    width={EMPTY_ICON_SIZE_PX}
    height={EMPTY_ICON_SIZE_PX}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M8 10h8" />
    <path d="M8 14h5" />
  </svg>
);

/**
 * Vista Empty State guidata in stile Apple Dark Cockpit con checklist interattiva e CTA accessibili.
 * @param props Titolo, descrizione, icona SVG, checklist opzionale e azioni primarie/secondarie
 * @returns Card guidata ad alto contrasto WCAG AA/AAA
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  checklist,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false
}) => {
  const [localCheckedMap, setLocalCheckedMap] = useState<Readonly<Record<string, boolean>>>({});
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const safeTitle = sanitizeDisplayText(title, DEFAULT_EMPTY_TITLE);
  const safeDescription = sanitizeDisplayText(description, DEFAULT_EMPTY_DESCRIPTION);
  const safePrimaryLabel = sanitizeDisplayText(actionLabel, '');
  const safeSecondaryLabel = sanitizeDisplayText(secondaryActionLabel, '');

  const normalizedChecklist = useMemo<readonly EmptyChecklistItem[]>(() => {
    if (!Array.isArray(checklist)) {
      return [];
    }
    return checklist.filter((item) => {
      return (
        item !== null &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        item.id.trim().length > 0 &&
        sanitizeDisplayText(item.label, '').length > 0
      );
    });
  }, [checklist]);

  const handleToggleChecklistItem = useCallback((item: EmptyChecklistItem): void => {
    if (item.onToggle) {
      item.onToggle(item.id);
      return;
    }
    setLocalCheckedMap((prev) => ({
      ...prev,
      [item.id]: !(prev[item.id] ?? Boolean(item.completed))
    }));
  }, []);

  const handleFocus = useCallback((id: string, event: React.FocusEvent<HTMLButtonElement>): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setFocusedId(id);
    }
  }, []);

  const handleBlur = useCallback((): void => {
    setFocusedId(null);
  }, []);

  const completedCount = useMemo<number>(() => {
    let count = 0;
    for (const item of normalizedChecklist) {
      const checked = item.onToggle
        ? Boolean(item.completed)
        : (localCheckedMap[item.id] ?? Boolean(item.completed));
      if (checked) {
        count += 1;
      }
    }
    return count;
  }, [normalizedChecklist, localCheckedMap]);

  return (
    <section
      className={EMPTY_STATE_CLASS_NAME}
      aria-label={safeTitle}
      data-ui-state="empty"
      style={{
        width: '100%',
        maxWidth: `${EMPTY_STATE_MAX_WIDTH_PX}px`,
        margin: compact ? '0.75rem auto' : '1.5rem auto',
        padding: compact ? '1.25rem' : '1.75rem',
        backgroundColor: SURFACE_CARD_BG,
        border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
        borderRadius: `${EMPTY_STATE_RADIUS_PX}px`,
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: `${EMPTY_ICON_CONTAINER_PX}px`,
          height: `${EMPTY_ICON_CONTAINER_PX}px`,
          borderRadius: '12px',
          backgroundColor: 'rgba(56, 189, 248, 0.14)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          color: ACCENT_CYAN,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon ?? <DefaultEmptyIcon />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST }}>
          {safeTitle}
        </h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: TEXT_SECONDARY_CONTRAST, lineHeight: 1.55 }}>
          {safeDescription}
        </p>
      </div>

      {normalizedChecklist.length > 0 && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            textAlign: 'left',
            marginTop: '0.25rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: ACCENT_CYAN
            }}
          >
            <span>Passi Consigliati</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {completedCount}/{normalizedChecklist.length}
            </span>
          </div>

          {normalizedChecklist.map((item) => {
            const isChecked = item.onToggle
              ? Boolean(item.completed)
              : (localCheckedMap[item.id] ?? Boolean(item.completed));
            const safeItemLabel = sanitizeDisplayText(item.label, item.id);
            const focusKey = `check-${item.id}`;

            return (
              <button
                key={item.id}
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => handleToggleChecklistItem(item)}
                onFocus={(e) => handleFocus(focusKey, e)}
                onBlur={handleBlur}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  width: '100%',
                  minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                  padding: '0.55rem 0.75rem',
                  borderRadius: '10px',
                  border: isChecked
                    ? '1px solid rgba(16, 185, 129, 0.45)'
                    : `1px solid ${SURFACE_BORDER_SUBTLE}`,
                  backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.12)' : SURFACE_SUBTLE_BG,
                  color: TEXT_PRIMARY_CONTRAST,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  ...getCommonFocusStyle(focusedId === focusKey)
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '5px',
                    border: isChecked ? '1px solid #10b981' : '1px solid rgba(203, 213, 225, 0.45)',
                    backgroundColor: isChecked ? '#10b981' : 'transparent',
                    color: '#0b0e14',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isChecked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span style={{ textDecoration: isChecked ? 'line-through' : 'none', opacity: isChecked ? 0.85 : 1 }}>
                  {safeItemLabel}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {(safePrimaryLabel.length > 0 || safeSecondaryLabel.length > 0) && (
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.25rem' }}>
          {safeSecondaryLabel.length > 0 && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              onFocus={(e) => handleFocus('secondary-cta', e)}
              onBlur={handleBlur}
              style={{
                minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                border: `1px solid ${SURFACE_BORDER_SUBTLE}`,
                backgroundColor: 'transparent',
                color: TEXT_SECONDARY_CONTRAST,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                ...getCommonFocusStyle(focusedId === 'secondary-cta')
              }}
            >
              {safeSecondaryLabel}
            </button>
          )}

          {safePrimaryLabel.length > 0 && onAction && (
            <button
              type="button"
              onClick={onAction}
              onFocus={(e) => handleFocus('primary-cta', e)}
              onBlur={handleBlur}
              style={{
                minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                padding: '0.55rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid rgba(99, 102, 241, 0.5)',
                backgroundColor: ACCENT_INDIGO,
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                ...getCommonFocusStyle(focusedId === 'primary-cta')
              }}
            >
              {safePrimaryLabel}
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default EmptyState;
