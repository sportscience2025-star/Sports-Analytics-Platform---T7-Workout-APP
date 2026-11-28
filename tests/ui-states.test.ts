/**
 * tests/ui-states.test.ts
 * Suite di test unitari per Standard 4-State UI Infrastructure (TASK-009):
 * EmptyState, LoadingSkeleton, ErrorFallback, ViewStateContainer, ui-state-utils ed ErrorBoundary.
 * Verifica sanitizzazione anti-NaN/undefined, exponential backoff deterministico,
 * accessibilita WAI-ARIA, GPU skeleton e assenza totale di emoji.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ErrorBoundary,
  EmptyState,
  LoadingSkeleton,
  ErrorFallback,
  ViewStateContainer,
  BASE_RETRY_DELAY_MS,
  MAX_RETRY_ATTEMPTS,
  BACKOFF_MULTIPLIER,
  MAX_BACKOFF_DELAY_MS,
  SHIMMER_DURATION_MS,
  MIN_TOUCH_TARGET_PX,
  sanitizeDisplayText,
  extractSafeErrorMessage,
  sanitizeProgressPercent,
  sanitizeSkeletonRows,
  computeBackoffDelayMs,
  resolveNextFailureState
} from '../src/components/common';

console.log('--- STARTING STANDARD 4-STATE UI INFRASTRUCTURE TEST SUITE ---');

// -------------------------------------------------------------
// 1. Costanti Maiuscole e Esportazione ErrorBoundary
// -------------------------------------------------------------
console.log('[Test 1] Testing resilience constants and ErrorBoundary barrel export...');
assert.strictEqual(BASE_RETRY_DELAY_MS, 1000);
assert.strictEqual(MAX_RETRY_ATTEMPTS, 5);
assert.strictEqual(BACKOFF_MULTIPLIER, 2);
assert.strictEqual(MAX_BACKOFF_DELAY_MS, 30000);
assert.strictEqual(SHIMMER_DURATION_MS, 1500);
assert.strictEqual(MIN_TOUCH_TARGET_PX, 44);
assert.strictEqual(typeof ErrorBoundary, 'function');

// -------------------------------------------------------------
// 2. Sanitizzatori Puri Anti-NaN / Anti-Undefined
// -------------------------------------------------------------
console.log('[Test 2] Testing pure sanitizers against NaN, Infinity and undefined...');
assert.strictEqual(sanitizeDisplayText('  Valido  ', 'Fallback'), 'Valido');
assert.strictEqual(sanitizeDisplayText('   ', 'Fallback'), 'Fallback');
assert.strictEqual(sanitizeDisplayText('undefined', 'Fallback'), 'Fallback');
assert.strictEqual(sanitizeDisplayText(null, 'Fallback'), 'Fallback');

assert.strictEqual(extractSafeErrorMessage(new Error('Errore server 503'), 'Fallback'), 'Errore server 503');
assert.strictEqual(extractSafeErrorMessage(new Error('   '), 'Fallback'), 'Fallback');
assert.strictEqual(extractSafeErrorMessage({ message: '  Timeout API  ' }, 'Fallback'), 'Timeout API');
assert.strictEqual(extractSafeErrorMessage(undefined, 'Fallback'), 'Fallback');
assert.strictEqual(extractSafeErrorMessage({ code: 500 }, 'Fallback'), 'Fallback');

assert.strictEqual(sanitizeProgressPercent(undefined), undefined);
assert.strictEqual(sanitizeProgressPercent(42.6), 43);
assert.strictEqual(sanitizeProgressPercent(Number.NaN), 0);
assert.strictEqual(sanitizeProgressPercent(Number.POSITIVE_INFINITY), 0);
assert.strictEqual(sanitizeProgressPercent(-15), 0);
assert.strictEqual(sanitizeProgressPercent(180), 100);

assert.strictEqual(sanitizeSkeletonRows(undefined), 3);
assert.strictEqual(sanitizeSkeletonRows(Number.NaN), 3);
assert.strictEqual(sanitizeSkeletonRows(-5), 1);
assert.strictEqual(sanitizeSkeletonRows(999), 12);
assert.strictEqual(sanitizeSkeletonRows(5.8), 5);

// -------------------------------------------------------------
// 3. Exponential Backoff & Macchina a Stati Retry
// -------------------------------------------------------------
console.log('[Test 3] Testing deterministic exponential backoff calculation and state transitions...');
assert.strictEqual(computeBackoffDelayMs(0), 1000);
assert.strictEqual(computeBackoffDelayMs(1), 2000);
assert.strictEqual(computeBackoffDelayMs(2), 4000);
assert.strictEqual(computeBackoffDelayMs(3), 8000);
assert.strictEqual(computeBackoffDelayMs(4), 16000);
assert.strictEqual(computeBackoffDelayMs(5), 30000);
assert.strictEqual(computeBackoffDelayMs(20), 30000);
assert.strictEqual(computeBackoffDelayMs(Number.NaN), 1000);
assert.strictEqual(computeBackoffDelayMs(-3), 1000);

assert.deepStrictEqual(resolveNextFailureState(0, 5), { nextAttempts: 1, nextStatus: 'cooldown' });
assert.deepStrictEqual(resolveNextFailureState(3, 5), { nextAttempts: 4, nextStatus: 'cooldown' });
assert.deepStrictEqual(resolveNextFailureState(4, 5), { nextAttempts: 5, nextStatus: 'exhausted' });

// -------------------------------------------------------------
// 4. EmptyState: Checklist Interattiva, SVG & Contrasto
// -------------------------------------------------------------
console.log('[Test 4] Testing EmptyState interactive checklist, SVG icon and accessibility...');
const emptyHtml = renderToStaticMarkup(
  React.createElement(EmptyState, {
    title: 'Nessuna sessione registrata',
    description: 'Collega un sensore VBT o crea una scheda di allenamento per iniziare.',
    checklist: [
      { id: 'c1', label: 'Configura profilo atleta', completed: true },
      { id: 'c2', label: 'Associa encoder lineare', completed: false },
      { id: 'invalid', label: '   ', completed: false }
    ],
    actionLabel: 'Crea Scheda',
    onAction: () => {},
    secondaryActionLabel: 'Esplora Catalogo',
    onSecondaryAction: () => {}
  })
);

assert.ok(emptyHtml.includes('data-ui-state="empty"'));
assert.ok(emptyHtml.includes('Nessuna sessione registrata'));
assert.ok(emptyHtml.includes('role="checkbox"'));
assert.ok(emptyHtml.includes('aria-checked="true"'));
assert.ok(emptyHtml.includes('aria-checked="false"'));
assert.ok(emptyHtml.includes('>1/2<'));
assert.ok(emptyHtml.includes('min-height:44px'));
assert.ok(emptyHtml.includes('Crea Scheda'));
assert.ok(emptyHtml.includes('Esplora Catalogo'));
assert.strictEqual(emptyHtml.includes('undefined'), false);
assert.strictEqual(emptyHtml.includes('outline:none'), false);

// -------------------------------------------------------------
// 5. LoadingSkeleton: Varianti, Shimmer GPU e ProgressBar Sicura
// -------------------------------------------------------------
console.log('[Test 5] Testing LoadingSkeleton GPU shimmer and hostile numeric inputs...');
const skeletonNormalHtml = renderToStaticMarkup(
  React.createElement(LoadingSkeleton, {
    variant: 'chart',
    rows: 4,
    progressPercent: 65,
    label: 'Elaborazione curva forza-velocita...'
  })
);
assert.ok(skeletonNormalHtml.includes('data-ui-state="loading"'));
assert.ok(skeletonNormalHtml.includes('role="status"'));
assert.ok(skeletonNormalHtml.includes('aria-busy="true"'));
assert.ok(skeletonNormalHtml.includes('role="progressbar"'));
assert.ok(skeletonNormalHtml.includes('aria-valuenow="65"'));
assert.ok(skeletonNormalHtml.includes('t7-skeleton-shimmer'));
assert.ok(skeletonNormalHtml.includes('>65%<'));

const skeletonHostileHtml = renderToStaticMarkup(
  React.createElement(LoadingSkeleton, {
    variant: 'table',
    rows: Number.NaN,
    progressPercent: 250,
    showProgressBar: true
  })
);
assert.ok(skeletonHostileHtml.includes('aria-valuenow="100"'));
assert.ok(skeletonHostileHtml.includes('>100%<'));
assert.strictEqual(skeletonHostileHtml.includes('NaN'), false);
assert.strictEqual(skeletonHostileHtml.includes('undefined'), false);

const skeletonIndeterminateHtml = renderToStaticMarkup(
  React.createElement(LoadingSkeleton, {
    variant: 'list',
    rows: -20
  })
);
assert.strictEqual(skeletonIndeterminateHtml.includes('role="progressbar"'), false);

// -------------------------------------------------------------
// 6. ErrorFallback: Role Alert, Offline PWA & Safe Diagnostics
// -------------------------------------------------------------
console.log('[Test 6] Testing ErrorFallback accessibility, offline warning and safe error formatting...');
const errorHtml = renderToStaticMarkup(
  React.createElement(ErrorFallback, {
    title: 'Sincronizzazione interrotta',
    error: new Error('Gateway 504 Timeout'),
    technicalDetails: 'Stack trace: GatewayTimeoutError at line 42',
    onRetry: () => {},
    isOffline: true
  })
);
assert.ok(errorHtml.includes('data-ui-state="error"'));
assert.ok(errorHtml.includes('role="alert"'));
assert.ok(errorHtml.includes('aria-live="assertive"'));
assert.ok(errorHtml.includes('Gateway 504 Timeout'));
assert.ok(errorHtml.includes('modalita offline PWA attiva'));
assert.ok(errorHtml.includes('aria-expanded="false"'));
assert.ok(errorHtml.includes('>Riprova<'));
assert.strictEqual(errorHtml.includes('outline:none'), false);

const errorHostileHtml = renderToStaticMarkup(
  React.createElement(ErrorFallback, {
    title: '   ',
    message: '',
    error: null
  })
);
assert.strictEqual(errorHostileHtml.includes('undefined'), false);
assert.ok(errorHostileHtml.includes('Errore durante il caricamento'));

// -------------------------------------------------------------
// 7. ViewStateContainer: Tutti i 4 Stati UI & Populated Zero-Wrapper
// -------------------------------------------------------------
console.log('[Test 7] Testing ViewStateContainer across all 4 states and unexpected fallback...');
const populatedCleanHtml = renderToStaticMarkup(
  React.createElement(
    ViewStateContainer,
    { state: 'populated' },
    React.createElement('div', { id: 'raw-chart-node' }, 'Chart Ready')
  )
);
assert.strictEqual(populatedCleanHtml, '<div id="raw-chart-node">Chart Ready</div>');

const populatedRegionHtml = renderToStaticMarkup(
  React.createElement(
    ViewStateContainer,
    { state: 'populated', populatedAriaLabel: 'Pannello Metriche VBT' },
    React.createElement('span', null, 'OK')
  )
);
assert.ok(populatedRegionHtml.includes('role="region"'));
assert.ok(populatedRegionHtml.includes('data-ui-state="populated"'));

const containerLoadingHtml = renderToStaticMarkup(
  React.createElement(ViewStateContainer, { state: 'loading', loadingProps: { variant: 'card' } })
);
assert.ok(containerLoadingHtml.includes('data-ui-state="loading"'));

const containerEmptyHtml = renderToStaticMarkup(
  React.createElement(ViewStateContainer, { state: 'empty' })
);
assert.ok(containerEmptyHtml.includes('data-ui-state="empty"'));

const containerErrorHtml = renderToStaticMarkup(
  React.createElement(ViewStateContainer, { state: 'error' })
);
assert.ok(containerErrorHtml.includes('data-ui-state="error"'));

// -------------------------------------------------------------
// 8. Verifica Assenza Totale Emoji (Regola 01)
// -------------------------------------------------------------
console.log('[Test 8] Verifying zero spontaneous emojis across all 4-state UI components...');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert.strictEqual(emojiRegex.test(emptyHtml), false);
assert.strictEqual(emojiRegex.test(skeletonNormalHtml), false);
assert.strictEqual(emojiRegex.test(errorHtml), false);
assert.strictEqual(emojiRegex.test(populatedRegionHtml), false);

console.log('--- ALL STANDARD 4-STATE UI INFRASTRUCTURE TESTS PASSED (100% OK) ---');
