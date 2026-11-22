/**
 * tests/metrology-guard.test.ts
 * Test suite matematica e metrologica per MetrologyGuard & NumberFormat (TASK-002).
 * Eseguibile nativamente con: node --experimental-strip-types tests/metrology-guard.test.ts
 */

import assert from 'node:assert';
import {
  sanitizeNumeric,
  safeDivide,
  clampToRange,
  validateLoadKg,
  validateVelocityMps,
  validateForceN,
  validatePowerW,
  validateAngleDeg,
  validateTimeMs,
  validateTimeSec,
  EPSILON_DIVISION_GUARD,
} from '../src/utils/metrology-guard.ts';

import {
  formatForce,
  formatPower,
  formatVelocity,
  formatLoad,
  formatAngle,
  formatTimeMs,
  formatTimeSec,
  formatHeartRate,
  formatHrvRmssd,
  formatMetricWithUnit,
  NARROW_NO_BREAK_SPACE,
  PLACEHOLDER_EMPTY_DASH,
} from '../src/utils/number-format.ts';

console.log('=== RUNNING METROLOGY & NUMBER FORMAT SUITE ===');

// 1. Test sanitizeNumeric
console.log('[1/6] Testing sanitizeNumeric...');
assert.strictEqual(sanitizeNumeric(null, 42), 42, 'null should return fallback');
assert.strictEqual(sanitizeNumeric(undefined, 42), 42, 'undefined should return fallback');
assert.strictEqual(sanitizeNumeric(false, 42), 42, 'boolean false should return fallback');
assert.strictEqual(sanitizeNumeric(true, 42), 42, 'boolean true should return fallback');
assert.strictEqual(sanitizeNumeric('', 42), 42, 'empty string should return fallback');
assert.strictEqual(sanitizeNumeric('   ', 42), 42, 'whitespace string should return fallback');
assert.strictEqual(sanitizeNumeric(NaN, 42), 42, 'NaN should return fallback');
assert.strictEqual(sanitizeNumeric(Infinity, 42), 42, 'Infinity should return fallback');
assert.strictEqual(sanitizeNumeric(-Infinity, 42), 42, '-Infinity should return fallback');
assert.strictEqual(sanitizeNumeric(100), 100, 'regular number preserved');
assert.strictEqual(sanitizeNumeric(-0), 0, '-0 should be normalized to +0');
assert.strictEqual(Object.is(sanitizeNumeric(-0), 0), true, '-0 normalized to positive 0');
assert.strictEqual(sanitizeNumeric('102,5'), 102.5, 'European comma parsed correctly');
assert.strictEqual(sanitizeNumeric('  0.82  '), 0.82, 'trimmed float parsed correctly');

// 2. Test safeDivide
console.log('[2/6] Testing safeDivide...');
assert.strictEqual(safeDivide(10, 2), 5, 'regular division');
assert.strictEqual(safeDivide(10, 0, 999), 999, 'zero division returns fallback');
assert.strictEqual(safeDivide(10, EPSILON_DIVISION_GUARD, 999), 999, 'epsilon division returns fallback');
assert.strictEqual(safeDivide(10, -EPSILON_DIVISION_GUARD / 2, 999), 999, 'negative tiny denominator returns fallback');
assert.strictEqual(safeDivide(NaN, 5, 999), 999, 'NaN numerator returns fallback');
assert.strictEqual(safeDivide(5, Infinity, 999), 999, 'Infinity denominator returns fallback');

// 3. Test clampToRange
console.log('[3/6] Testing clampToRange...');
assert.strictEqual(clampToRange(50, 0, 100), 50, 'inside range preserved');
assert.strictEqual(clampToRange(-10, 0, 100), 0, 'below min clamped to min');
assert.strictEqual(clampToRange(150, 0, 100), 100, 'above max clamped to max');
assert.strictEqual(clampToRange(NaN, 10, 20), 10, 'NaN returns min');

// 4. Test Boundary Validators
console.log('[4/6] Testing Boundary Validators...');
// Load
const validLoad = validateLoadKg('120,5');
assert.strictEqual(validLoad.isValid, true, 'valid load recognized');
if (validLoad.isValid) {
  assert.strictEqual(validLoad.value, 120.5);
}
const negativeLoad = validateLoadKg(-5);
assert.strictEqual(negativeLoad.isValid, false);
assert.strictEqual(negativeLoad.errorCode, 'BELOW_MIN');

const overloadLoad = validateLoadKg(1500);
assert.strictEqual(overloadLoad.isValid, false);
assert.strictEqual(overloadLoad.errorCode, 'ABOVE_MAX');

// Velocity
const validVel = validateVelocityMps(0.82);
assert.strictEqual(validVel.isValid, true);
if (validVel.isValid) {
  assert.strictEqual(validVel.value, 0.82);
}
const eccVelDisallowed = validateVelocityMps(-1.2);
assert.strictEqual(eccVelDisallowed.isValid, false);
assert.strictEqual(eccVelDisallowed.errorCode, 'BELOW_MIN');

const eccVelAllowed = validateVelocityMps(-1.2, undefined, { allowNegative: true });
assert.strictEqual(eccVelAllowed.isValid, true);
if (eccVelAllowed.isValid) {
  assert.strictEqual(eccVelAllowed.value, -1.2);
}

// Force
const validForce = validateForceN(2450);
assert.strictEqual(validForce.isValid, true);
const shearForceAllowed = validateForceN(-350, undefined, { allowNegative: true });
assert.strictEqual(shearForceAllowed.isValid, true);

// Power
const validPower = validatePowerW(1250);
assert.strictEqual(validPower.isValid, true);

// Angle with custom physiological knee bounds (0-165)
const kneeValid = validateAngleDeg(90, undefined, { customMin: 0, customMax: 165 });
assert.strictEqual(kneeValid.isValid, true);
const kneeHyperextended = validateAngleDeg(180, undefined, { customMin: 0, customMax: 165 });
assert.strictEqual(kneeHyperextended.isValid, false);
assert.strictEqual(kneeHyperextended.errorCode, 'ABOVE_MAX');

// Time
const validTimeMs = validateTimeMs(250);
assert.strictEqual(validTimeMs.isValid, true);
const validTimeSec = validateTimeSec(4.28);
assert.strictEqual(validTimeSec.isValid, true);

// 5. Test SI Formatters
console.log('[5/6] Testing SI Formatters...');
// Force
assert.strictEqual(formatForce(2450).endsWith(`${NARROW_NO_BREAK_SPACE}N`), true, 'ends with thin space N');
assert.strictEqual(formatForce(45.5).endsWith(`${NARROW_NO_BREAK_SPACE}N`), true, 'ends with thin space N');
assert.strictEqual(formatForce(null), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}N`);
assert.strictEqual(formatForce(NaN), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}N`);

// Power
assert.strictEqual(formatPower(1250).endsWith(`${NARROW_NO_BREAK_SPACE}W`), true, 'ends with thin space W');
assert.strictEqual(formatPower(undefined), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}W`);

// Velocity (2 decimals strictly)
assert.strictEqual(formatVelocity(0.82), `0,82${NARROW_NO_BREAK_SPACE}m/s`);
assert.strictEqual(formatVelocity(1), `1,00${NARROW_NO_BREAK_SPACE}m/s`);

// Load (1 decimal strictly)
assert.strictEqual(formatLoad(102.5), `102,5${NARROW_NO_BREAK_SPACE}kg`);
assert.strictEqual(formatLoad(100), `100,0${NARROW_NO_BREAK_SPACE}kg`);

// Angle (no space before °)
assert.strictEqual(formatAngle(85), '85°');
assert.strictEqual(formatAngle(null), `${PLACEHOLDER_EMPTY_DASH}°`);

// Times
assert.strictEqual(formatTimeMs(245), `245${NARROW_NO_BREAK_SPACE}ms`);
assert.strictEqual(formatTimeSec(4.28), `4,28${NARROW_NO_BREAK_SPACE}s`);

// Cardiovascular
assert.strictEqual(formatHeartRate(162), `162${NARROW_NO_BREAK_SPACE}bpm`);
assert.strictEqual(formatHrvRmssd(64), `64${NARROW_NO_BREAK_SPACE}ms`);

// 6. Test MetricDisplayData (Anti-Jittering)
console.log('[6/6] Testing formatMetricWithUnit...');
const displayValid = formatMetricWithUnit(102.5, 'kg', 1);
assert.strictEqual(displayValid.valueText, '102,5');
assert.strictEqual(displayValid.unitText, 'kg');
assert.strictEqual(displayValid.isPlaceholder, false);

const displayInvalid = formatMetricWithUnit(null, 'W', 0);
assert.strictEqual(displayInvalid.valueText, PLACEHOLDER_EMPTY_DASH);
assert.strictEqual(displayInvalid.unitText, 'W');
assert.strictEqual(displayInvalid.isPlaceholder, true);

console.log('SUCCESS: ALL METROLOGY & NUMBER FORMAT TESTS PASSED (100%)!');
