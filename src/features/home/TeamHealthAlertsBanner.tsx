/**
 * src/features/home/TeamHealthAlertsBanner.tsx
 * Banner prioritario alert di squadra per la Control Room (ACWR > 1.50, cali Readiness, Red Flags).
 * Isolamento RBAC rigoroso: visibile ESCLUSIVAMENTE in Tier 3 con ruolo staff autorizzato
 * (Silo 2 Bunker), zero referti clinici EMR in chiaro (GDPR Art. 9).
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (costanti in MAIUSCOLO).
 */

import React, { useState, useCallback } from 'react';
import { useTier } from '../../hooks/useTier';
import { isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import { AVAILABILITY_COLORS, AVAILABILITY_LABELS } from '../../components/layout/ContextSelectorDropdown';
import {
  ERROR_BORDER_COLOR,
  ERROR_SURFACE_BG,
  ERROR_TEXT_SAFE,
  MIN_TOUCH_TARGET_PX,
  SURFACE_DARK_BG,
  TEXT_PRIMARY_CONTRAST,
  TEXT_SECONDARY_CONTRAST,
  WARNING_TEXT_SAFE,
  getCommonFocusStyle,
  sanitizeDisplayText
} from '../../components/common/ui-state-utils';
import {
  ACWR_HIGH_RISK_THRESHOLD,
  READINESS_ALERT_THRESHOLD,
  TeamHealthAlert,
  formatAcwrMetric,
  isAuthorizedForTeamAlerts
} from './home-mock-data';

export const TEAM_ALERTS_BANNER_RADIUS_PX = 16;

export interface TeamHealthAlertsBannerProps {
  /** Alert prioritari filtrati sul roster attivo (privi di diagnosi EMR). */
  alerts: readonly TeamHealthAlert[];
  /** Callback a 1 click per selezionare l'atleta e aprire Data Analisi / Monitoraggio. */
  onInspectAthlete?: (athleteId: string) => void;
}

/**
 * Renderizza il banner di allerta prioritaria squadra esclusivamente per Tier 3 Staff autorizzato.
 * Fail-closed: restituisce `null` per Tier 1, Tier 2, atleti e ricercatori Silo 3.
 * @param props Elenco alert sportivi/readiness e callback di ispezione atleta
 * @returns Banner Dark Cockpit ad alto contrasto oppure `null`
 */
export const TeamHealthAlertsBanner: React.FC<TeamHealthAlertsBannerProps> = ({
  alerts,
  onInspectAthlete
}) => {
  const { tier, role, isClinical } = useTier();
  const [focusedAlertId, setFocusedAlertId] = useState<string | null>(null);

  const handleFocus = useCallback((id: string, event: React.FocusEvent<HTMLButtonElement>): void => {
    if (isKeyboardFocusTarget(event.currentTarget)) {
      setFocusedAlertId(id);
    }
  }, []);

  const handleBlur = useCallback((): void => {
    setFocusedAlertId(null);
  }, []);

  // Guardia fail-closed RBAC + ADR-02 (Silo 2 Club Bunker)
  if (!isAuthorizedForTeamAlerts(tier, role)) {
    return null;
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Alert prioritari salute e carico rosa Tier 3"
      data-rbac-silo="silo2_club_bunker"
      style={{
        padding: '1.15rem 1.25rem',
        backgroundColor: ERROR_SURFACE_BG,
        border: `1px solid ${ERROR_BORDER_COLOR}`,
        borderRadius: `${TEAM_ALERTS_BANNER_RADIUS_PX}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ERROR_TEXT_SAFE} strokeWidth="2" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: TEXT_PRIMARY_CONTRAST }}>
            Alert Prioritari Squadra ({alerts.length})
          </h3>
        </div>

        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: ERROR_TEXT_SAFE }}>
          Soglia ACWR &gt; {formatAcwrMetric(ACWR_HIGH_RISK_THRESHOLD)} • Readiness &lt; {READINESS_ALERT_THRESHOLD}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {alerts.map((alert) => {
          const statusColor = AVAILABILITY_COLORS[alert.availabilityStatus];
          const statusLabel = AVAILABILITY_LABELS[alert.availabilityStatus];
          const hasHighAcwr =
            typeof alert.acwr === 'number' &&
            Number.isFinite(alert.acwr) &&
            alert.acwr > ACWR_HIGH_RISK_THRESHOLD;

          return (
            <div
              key={alert.id}
              style={{
                padding: '0.75rem 0.9rem',
                borderRadius: '12px',
                backgroundColor: SURFACE_DARK_BG,
                border: `1px solid ${statusColor}44`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.88rem', color: TEXT_PRIMARY_CONTRAST }}>
                    {sanitizeDisplayText(alert.athleteName, 'Atleta')}
                  </strong>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '999px',
                      backgroundColor: `${statusColor}22`,
                      color: statusColor
                    }}
                  >
                    {statusLabel}
                  </span>
                  {hasHighAcwr && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: WARNING_TEXT_SAFE, fontVariantNumeric: 'tabular-nums' }}>
                      ACWR {formatAcwrMetric(alert.acwr)}
                    </span>
                  )}
                  {typeof alert.readinessScore === 'number' && Number.isFinite(alert.readinessScore) && (
                    <span style={{ fontSize: '0.72rem', color: TEXT_SECONDARY_CONTRAST, fontVariantNumeric: 'tabular-nums' }}>
                      Readiness {Math.round(alert.readinessScore)}/100
                    </span>
                  )}
                </div>

                <p style={{ margin: 0, fontSize: '0.8rem', color: TEXT_SECONDARY_CONTRAST }}>
                  {sanitizeDisplayText(alert.operationalNote, 'Monitoraggio carico richiesto.')}
                </p>

                {isClinical && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: ERROR_TEXT_SAFE }}>
                    Triage sanitario richiesto — Apri Cartella Clinica (Silo 2)
                  </span>
                )}
              </div>

              {onInspectAthlete && (
                <button
                  type="button"
                  onClick={() => onInspectAthlete(alert.athleteId)}
                  onFocus={(e) => handleFocus(`alert-${alert.id}`, e)}
                  onBlur={handleBlur}
                  style={{
                    minHeight: `${MIN_TOUCH_TARGET_PX}px`,
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    border: `1px solid ${ERROR_BORDER_COLOR}`,
                    backgroundColor: ERROR_SURFACE_BG,
                    color: ERROR_TEXT_SAFE,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    ...getCommonFocusStyle(focusedAlertId === `alert-${alert.id}`)
                  }}
                >
                  Apri Analisi Atleta
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TeamHealthAlertsBanner;
