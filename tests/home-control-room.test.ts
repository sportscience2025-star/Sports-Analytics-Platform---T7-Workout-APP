/**
 * tests/home-control-room.test.ts
 * Suite di test unitari per Home Dashboard & Control Room Cockpit (TASK-010):
 * Verifica matrice RBAC Tier 3 per TeamHealthAlertsBanner, isolamento Silo 3 (researcher),
 * separazione GDPR Art. 9 (zero diagnosi EMR), filtro privacy Condividi,
 * metrologia SI tonnellaggi > 1000 kg, switch Atleta/Squadra e 4 Stati UI.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TierProvider } from '../src/context/TierContext';
import { AthleteProvider } from '../src/context/AthleteContext';
import {
  ACWR_HIGH_RISK_THRESHOLD,
  READINESS_ALERT_THRESHOLD,
  MAX_SESSION_TONNAGE_KG,
  DEMO_CERTIFIED_T7_CARDS,
  DEMO_TEAM_HEALTH_ALERTS,
  ControlRoomView,
  TeamHealthAlertsBanner,
  isAuthorizedForTeamAlerts,
  formatSessionTonnageKg,
  formatSessionDurationMin,
  formatAcwrMetric,
  buildShareableT7Summary
} from '../src/features/home';
import { NARROW_NO_BREAK_SPACE } from '../src/utils/number-format';
import { GlobalContextMode, TierLevel, UserRole } from '../src/types';

console.log('--- STARTING HOME CONTROL ROOM TEST SUITE ---');

// -------------------------------------------------------------
// 1. Matrice RBAC Completa per TeamHealthAlertsBanner
// -------------------------------------------------------------
console.log('[Test 1] Testing fail-closed RBAC matrix (isAuthorizedForTeamAlerts)...');
assert.strictEqual(ACWR_HIGH_RISK_THRESHOLD, 1.50);
assert.strictEqual(READINESS_ALERT_THRESHOLD, 65);
assert.strictEqual(MAX_SESSION_TONNAGE_KG, 250000);

assert.strictEqual(isAuthorizedForTeamAlerts('tier1', 'athlete'), false);
assert.strictEqual(isAuthorizedForTeamAlerts('tier1', 'head_coach'), false);
assert.strictEqual(isAuthorizedForTeamAlerts('tier2', 'head_coach'), false);
assert.strictEqual(isAuthorizedForTeamAlerts('tier2', 'physiotherapist'), false);
assert.strictEqual(isAuthorizedForTeamAlerts('tier3', 'athlete'), false);
assert.strictEqual(isAuthorizedForTeamAlerts('tier3', 'researcher'), false);
assert.strictEqual(isAuthorizedForTeamAlerts('tier3', 'head_coach'), true);
assert.strictEqual(isAuthorizedForTeamAlerts('tier3', 'sc_coach'), true);
assert.strictEqual(isAuthorizedForTeamAlerts('tier3', 'physiotherapist'), true);
assert.strictEqual(isAuthorizedForTeamAlerts('tier3', 'team_doctor'), true);
assert.strictEqual(isAuthorizedForTeamAlerts('tier3', 'clinical_nutritionist'), true);
assert.strictEqual(isAuthorizedForTeamAlerts('tier3', 'match_analyst'), true);
assert.strictEqual(isAuthorizedForTeamAlerts('tier3', 'admin'), true);
assert.strictEqual(isAuthorizedForTeamAlerts('tier9' as TierLevel, 'head_coach'), false);

// -------------------------------------------------------------
// 2. Metrologia SI Tonnellaggi > 1000 kg & Sanitizzazione Ostile
// -------------------------------------------------------------
console.log('[Test 2] Testing SI session tonnage (> 1000 kg), duration and NaN guards...');
assert.strictEqual(formatSessionTonnageKg(4850).endsWith(`${NARROW_NO_BREAK_SPACE}kg`), true);
assert.strictEqual(formatSessionTonnageKg(12400).includes('12.400'), true);
assert.strictEqual(formatSessionTonnageKg(-0), `0,0${NARROW_NO_BREAK_SPACE}kg`);
assert.strictEqual(formatSessionTonnageKg(Number.NaN), `--${NARROW_NO_BREAK_SPACE}kg`);
assert.strictEqual(formatSessionTonnageKg(Number.POSITIVE_INFINITY), `--${NARROW_NO_BREAK_SPACE}kg`);
assert.strictEqual(formatSessionTonnageKg(-150), `--${NARROW_NO_BREAK_SPACE}kg`);
assert.strictEqual(formatSessionTonnageKg(null), `--${NARROW_NO_BREAK_SPACE}kg`);

assert.strictEqual(formatSessionDurationMin(65), `65${NARROW_NO_BREAK_SPACE}min`);
assert.strictEqual(formatSessionDurationMin(Number.NaN), `--${NARROW_NO_BREAK_SPACE}min`);
assert.strictEqual(formatAcwrMetric(1.68), '1,68');
assert.strictEqual(formatAcwrMetric(Number.NaN), '--');

// -------------------------------------------------------------
// 3. Filtro Privacy Social Sharing (buildShareableT7Summary)
// -------------------------------------------------------------
console.log('[Test 3] Testing Certified T7 Card privacy allowlist...');
const shared = buildShareableT7Summary(DEMO_CERTIFIED_T7_CARDS[0]);
assert.strictEqual(shared.cardId, 'card_t7_901');
assert.strictEqual(shared.workoutTitle, 'Block Pull & Sprint Accelerazione');
assert.strictEqual(shared.prCount, 2);
assert.strictEqual('athleteId' in shared, false);
assert.strictEqual('athleteName' in shared, false);
assert.strictEqual('teamId' in shared, false);
assert.strictEqual('availabilityStatusAtSession' in shared, false);

/**
 * Helper di rendering statico per la Control Room con configurazione Tier/Ruolo/Contesto.
 */
function renderControlRoom(
  tier: TierLevel,
  role: UserRole,
  mode: GlobalContextMode,
  athleteId?: string,
  extraProps: Partial<React.ComponentProps<typeof ControlRoomView>> = {}
): string {
  return renderToStaticMarkup(
    React.createElement(
      TierProvider,
      { defaultTier: tier, defaultRole: role, persistState: false },
      React.createElement(
        AthleteProvider,
        {
          persistState: false,
          enforceSingleAthlete: tier === 'tier1',
          defaultMode: tier === 'tier1' ? 'athlete' : mode,
          defaultAthleteId: athleteId
        },
        React.createElement(ControlRoomView, extraProps)
      )
    )
  );
}

// -------------------------------------------------------------
// 4. Isolamento TeamHealthAlertsBanner (Tier 1/2/Athlete/Researcher vs Tier 3 Staff)
// -------------------------------------------------------------
console.log('[Test 4] Testing TeamHealthAlertsBanner Tier 3 RBAC visibility and GDPR Art. 9...');
const renderAlertBanner = (tier: TierLevel, role: UserRole): string =>
  renderToStaticMarkup(
    React.createElement(
      TierProvider,
      { defaultTier: tier, defaultRole: role, persistState: false },
      React.createElement(TeamHealthAlertsBanner, { alerts: DEMO_TEAM_HEALTH_ALERTS })
    )
  );

assert.strictEqual(renderAlertBanner('tier1', 'athlete'), '');
assert.strictEqual(renderAlertBanner('tier2', 'head_coach'), '');
assert.strictEqual(renderAlertBanner('tier3', 'athlete'), '');
assert.strictEqual(renderAlertBanner('tier3', 'researcher'), '');

const coachBannerHtml = renderAlertBanner('tier3', 'head_coach');
assert.ok(coachBannerHtml.includes('Alert Prioritari Squadra (3)'));
assert.ok(coachBannerHtml.includes('ACWR 1,68'));
assert.strictEqual(coachBannerHtml.includes('Triage sanitario richiesto'), false);

const doctorBannerHtml = renderAlertBanner('tier3', 'team_doctor');
assert.ok(doctorBannerHtml.includes('Alert Prioritari Squadra (3)'));
assert.ok(doctorBannerHtml.includes('Triage sanitario richiesto'));

// -------------------------------------------------------------
// 5. Switch Atleta / Squadra, Baseline Calibration & Silo 3 Researcher
// -------------------------------------------------------------
console.log('[Test 5] Testing Athlete vs Team context switching and researcher Silo 3 isolation...');
const athleteCalibrationHtml = renderControlRoom('tier2', 'sc_coach', 'athlete', 'ath_02');
assert.ok(athleteCalibrationHtml.includes('Control Room Atleta • Luca Bianchi'));
assert.ok(athleteCalibrationHtml.includes('Baseline di ruolo temporanea (fase di calibrazione: 4 sessioni registrate)'));
assert.ok(athleteCalibrationHtml.includes('tabular-nums'));

const teamTier3Html = renderControlRoom('tier3', 'head_coach', 'team');
assert.ok(teamTier3Html.includes('Control Room Squadra • T7 Elite Performance Squad'));
assert.ok(teamTier3Html.includes('4 atleti monitorati'));
assert.ok(teamTier3Html.includes('Alert Prioritari Squadra'));

const researcherHtml = renderControlRoom('tier3', 'researcher', 'team');
assert.ok(researcherHtml.includes('Partizione Research Warehouse Attiva (Silo 3)'));
assert.strictEqual(researcherHtml.includes('Marco Rossi'), false);
assert.strictEqual(researcherHtml.includes('Luca Bianchi'), false);
assert.strictEqual(researcherHtml.includes('Alert Prioritari Squadra'), false);

// -------------------------------------------------------------
// 6. Verifica Tutti i 4 Stati UI (Loading, Error, Empty, Populated)
// -------------------------------------------------------------
console.log('[Test 6] Testing all 4 mandatory UI states via ViewStateContainer...');
const loadingHtml = renderControlRoom('tier1', 'athlete', 'athlete', 'ath_01', { viewState: 'loading' });
assert.ok(loadingHtml.includes('data-ui-state="loading"'));
assert.ok(loadingHtml.includes('role="status"'));

const errorHtml = renderControlRoom('tier1', 'athlete', 'athlete', 'ath_01', {
  viewState: 'error',
  error: new Error('Connessione API interrotta')
});
assert.ok(errorHtml.includes('data-ui-state="error"'));
assert.ok(errorHtml.includes('role="alert"'));
assert.ok(errorHtml.includes('Connessione API interrotta'));

const emptyAutoHtml = renderControlRoom('tier1', 'athlete', 'athlete', 'ath_01', {
  dailyWorkouts: [],
  certifiedCards: [],
  microcycleSlots: []
});
assert.ok(emptyAutoHtml.includes('data-ui-state="empty"'));
assert.ok(emptyAutoHtml.includes('Pianifica Sessione'));

// -------------------------------------------------------------
// 7. Verifica Assenza Diagnosi EMR, Emoji, NaN, undefined & outline:none
// -------------------------------------------------------------
console.log('[Test 7] Verifying zero EMR diagnosis leaks, zero emojis, zero NaN and accessible focus...');
const forbiddenEmrTerms = ['lesione crociato', 'tendinopatia', 'pubalgia', 'RMN', 'FANS', 'undefined', 'NaN', 'outline:none'];
const allHtml = [coachBannerHtml, doctorBannerHtml, athleteCalibrationHtml, teamTier3Html, researcherHtml, emptyAutoHtml].join(' ');
for (const term of forbiddenEmrTerms) {
  assert.strictEqual(allHtml.includes(term), false, `Forbidden term found: ${term}`);
}

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert.strictEqual(emojiRegex.test(allHtml), false);

console.log('--- ALL HOME CONTROL ROOM TESTS PASSED (100% OK) ---');
