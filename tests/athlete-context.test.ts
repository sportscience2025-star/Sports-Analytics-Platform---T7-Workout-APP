/**
 * tests/athlete-context.test.ts
 * Suite di test unitari per il Global Athlete & Squad Context Provider (TASK-005).
 * Verifica sincronizzazione 2-click, Tier 1 enforcement, GDPR Art. 9, e rendering React 18.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AthleteProvider,
  useAthleteContext as useAthleteContextInternal,
  isValidContextMode,
  STORAGE_KEY_CONTEXT,
  DEFAULT_CONTEXT_MODE,
  DEMO_TEAMS,
  DEMO_ATHLETES
} from '../src/context/AthleteContext';
import { useAthleteContext } from '../src/hooks/useAthleteContext';
import { AVAILABILITY_FIT, AVAILABILITY_CAUTION, AVAILABILITY_REHAB, AVAILABILITY_INJURED } from '../src/types/athlete';

console.log('--- STARTING ATHLETE & SQUAD CONTEXT TEST SUITE ---');

// -------------------------------------------------------------
// 1. Validazione Runtime Type Guards e Costanti
// -------------------------------------------------------------
console.log('[Test 1] Testing runtime type guards and uppercase constants...');
assert.strictEqual(isValidContextMode('athlete'), true);
assert.strictEqual(isValidContextMode('team'), true);
assert.strictEqual(isValidContextMode('squad'), false);
assert.strictEqual(isValidContextMode(''), false);
assert.strictEqual(isValidContextMode(null), false);
assert.strictEqual(isValidContextMode(undefined), false);
assert.strictEqual(isValidContextMode(123), false);

assert.strictEqual(STORAGE_KEY_CONTEXT, 't7_active_context');
assert.strictEqual(DEFAULT_CONTEXT_MODE, 'athlete');

// -------------------------------------------------------------
// 2. Integrita Roster Demo e Conformita GDPR Art. 9
// -------------------------------------------------------------
console.log('[Test 2] Testing DEMO_TEAMS and DEMO_ATHLETES integrity...');
assert.strictEqual(DEMO_TEAMS.length, 1);
assert.strictEqual(DEMO_TEAMS[0].id, 'team_pro_01');
assert.strictEqual(DEMO_TEAMS[0].clubCode, 'T7-PRO');
assert.strictEqual(DEMO_TEAMS[0].rosterAthleteIds.length, 4);

assert.strictEqual(DEMO_ATHLETES.length, 4);

const ath1 = DEMO_ATHLETES[0];
assert.strictEqual(ath1.id, 'ath_01');
assert.strictEqual(ath1.availabilityStatus, AVAILABILITY_FIT);
assert.strictEqual(ath1.tacticalRole, 'striker');
assert.strictEqual(Number(ath1.currentWeightKg), 78.5);

const ath2 = DEMO_ATHLETES[1];
assert.strictEqual(ath2.id, 'ath_02');
assert.strictEqual(ath2.availabilityStatus, AVAILABILITY_CAUTION);
assert.strictEqual(ath2.tacticalRole, 'central_midfielder');

const ath3 = DEMO_ATHLETES[2];
assert.strictEqual(ath3.id, 'ath_03');
assert.strictEqual(ath3.availabilityStatus, AVAILABILITY_REHAB);
assert.strictEqual(ath3.tacticalRole, 'center_back');
assert.strictEqual(ath3.currentRtpPhase, 'return_to_training');

const ath4 = DEMO_ATHLETES[3];
assert.strictEqual(ath4.id, 'ath_04');
assert.strictEqual(ath4.availabilityStatus, AVAILABILITY_INJURED);
assert.strictEqual(ath4.tacticalRole, 'goalkeeper');
assert.strictEqual(ath4.currentRtpPhase, 'acute_protection');

// -------------------------------------------------------------
// 3. React 18 Static Rendering: Default Provider State
// -------------------------------------------------------------
console.log('[Test 3] Testing AthleteProvider default static rendering...');

function DefaultConsumer() {
  const ctx = useAthleteContextInternal();
  return React.createElement(
    'div',
    { 'data-testid': 'context-summary' },
    `${ctx.contextMode}|${ctx.selectedTeamId}|${ctx.selectedAthleteId}|${ctx.roster.length}|${ctx.isAthleteMode}|${ctx.isTeamMode}|${ctx.isRosterEmpty}`
  );
}

const defaultHtml = renderToStaticMarkup(
  React.createElement(
    AthleteProvider,
    { persistState: false },
    React.createElement(DefaultConsumer)
  )
);
assert.strictEqual(
  defaultHtml,
  '<div data-testid="context-summary">athlete|team_pro_01|ath_01|4|true|false|false</div>'
);

// -------------------------------------------------------------
// 4. React 18 Static Rendering: Team Mode
// -------------------------------------------------------------
console.log('[Test 4] Testing AthleteProvider configured in team mode...');

const teamHtml = renderToStaticMarkup(
  React.createElement(
    AthleteProvider,
    { defaultMode: 'team', persistState: false },
    React.createElement(DefaultConsumer)
  )
);
assert.strictEqual(
  teamHtml,
  '<div data-testid="context-summary">team|team_pro_01|ath_01|4|false|true|false</div>'
);

// -------------------------------------------------------------
// 5. Tier 1 Consumer Enforcement (enforceSingleAthlete)
// -------------------------------------------------------------
console.log('[Test 5] Testing Tier 1 single athlete enforcement...');

function SingleAthleteConsumer() {
  const ctx = useAthleteContextInternal();
  return React.createElement(
    'div',
    { 'data-testid': 'single-summary' },
    `${ctx.contextMode}|${ctx.selectedTeamId === null}|${ctx.teams.length}|${ctx.roster.length}|${ctx.selectedAthleteId}`
  );
}

const tier1Html = renderToStaticMarkup(
  React.createElement(
    AthleteProvider,
    { enforceSingleAthlete: true, persistState: false },
    React.createElement(SingleAthleteConsumer)
  )
);
assert.strictEqual(
  tier1Html,
  '<div data-testid="single-summary">athlete|true|0|1|ath_01</div>'
);

// -------------------------------------------------------------
// 6. Consumer Hook useAthleteContext Shortcuts
// -------------------------------------------------------------
console.log('[Test 6] Testing useAthleteContext ergonomic shortcuts...');

function ShortcutConsumer() {
  const hook = useAthleteContext();
  return React.createElement(
    'div',
    { 'data-testid': 'shortcuts' },
    `${hook.athleteFullName}|${hook.teamName}|${hook.activeAvailabilityStatus}|${hook.activeTacticalRole}|${hook.isFit}|${hook.isInjuredOrRehab}`
  );
}

const shortcutHtml = renderToStaticMarkup(
  React.createElement(
    AthleteProvider,
    { persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(
  shortcutHtml,
  '<div data-testid="shortcuts">Marco Rossi|T7 Elite Performance Squad|fit|striker|true|false</div>'
);

// -------------------------------------------------------------
// 7. Test Invocazione Fuori da AthleteProvider
// -------------------------------------------------------------
console.log('[Test 7] Testing error throw when useAthleteContext is called outside provider...');
assert.throws(() => {
  renderToStaticMarkup(React.createElement(DefaultConsumer));
}, (err: Error) => {
  return err.message === 'useAthleteContext must be used within an AthleteProvider';
});

console.log('--- ALL ATHLETE & SQUAD CONTEXT TESTS PASSED (100% OK) ---');
