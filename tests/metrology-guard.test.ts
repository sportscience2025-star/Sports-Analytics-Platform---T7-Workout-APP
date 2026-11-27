/**
 * tests/metrology-guard.test.ts
 * Test suite matematica e metrologica per MetrologyGuard & NumberFormat (TASK-002).
 * Eseguibile nativamente con: npx tsx tests/metrology-guard.test.ts
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
  MIN_PHYSIOLOGICAL_LOAD_KG,
  MAX_PHYSIOLOGICAL_LOAD_KG,
  DEFAULT_MIN_LOAD_KG,
  DEFAULT_MAX_LOAD_KG,
  MIN_PHYSIOLOGICAL_VELOCITY_MPS,
  MAX_PHYSIOLOGICAL_VELOCITY_MPS,
  MIN_ECCENTRIC_VELOCITY_MPS,
  MIN_PHYSIOLOGICAL_FORCE_N,
  MAX_PHYSIOLOGICAL_FORCE_N,
  MIN_SHEAR_FORCE_N,
  MIN_PHYSIOLOGICAL_POWER_W,
  MAX_PHYSIOLOGICAL_POWER_W,
  MIN_PHYSIOLOGICAL_ANGLE_DEG,
  MAX_PHYSIOLOGICAL_ANGLE_DEG,
  MIN_PHYSIOLOGICAL_TIME_MS,
  MAX_PHYSIOLOGICAL_TIME_MS,
  MIN_PHYSIOLOGICAL_TIME_SEC,
  MAX_PHYSIOLOGICAL_TIME_SEC,
  type ValidationResult,
  type MetrologyErrorCode,
} from '../src/utils/metrology-guard.ts';

function expectFailureCode<T extends number>(
  result: ValidationResult<T>,
  expectedCode: MetrologyErrorCode,
  message?: string
): void {
  assert.strictEqual(result.isValid, false, message);
  if (!result.isValid) {
    assert.strictEqual(result.errorCode, expectedCode, message);
  }
}

import {
  formatNumericValue,
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
  MAX_FORMAT_DECIMALS,
} from '../src/utils/number-format.ts';

import {
  readStorageSafe,
  writeStorageSafe,
  sanitizeNumeric as barrelSanitizeNumeric,
  formatNumericValue as barrelFormatNumericValue,
} from '../src/utils/index.ts';

console.log('=== RUNNING METROLOGY & NUMBER FORMAT SUITE ===');

// 1. Test sanitizeNumeric
console.log('[1/7] Testing sanitizeNumeric...');
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
assert.strictEqual(sanitizeNumeric('1.250,5'), 1250.5, 'Italian grouping dot + comma decimal parsed cleanly');
assert.strictEqual(sanitizeNumeric('-1.250,75'), -1250.75, 'Negative Italian grouping + comma decimal parsed cleanly');
assert.strictEqual(sanitizeNumeric('  0.82  '), 0.82, 'trimmed float parsed correctly');
assert.strictEqual(sanitizeNumeric('0x10', 42), 42, 'hex string rejected');
assert.strictEqual(sanitizeNumeric('-0xFF', 42), 42, 'negative hex string rejected');
assert.strictEqual(sanitizeNumeric('0b1010', 42), 42, 'binary string rejected');
assert.strictEqual(sanitizeNumeric('0o77', 42), 42, 'octal string rejected');
assert.strictEqual(sanitizeNumeric('1.2.3,4', 42), 42, 'malformed grouped string rejected');
assert.strictEqual(sanitizeNumeric('invalid', NaN), 0, 'non-finite fallback guarded to 0');
assert.strictEqual(sanitizeNumeric('invalid', Infinity), 0, 'Infinity fallback guarded to 0');
assert.strictEqual(Object.is(sanitizeNumeric('invalid', -0), 0), true, '-0 fallback normalized to +0');

// 2. Test safeDivide
console.log('[2/7] Testing safeDivide...');
assert.strictEqual(safeDivide(10, 2), 5, 'regular division');
assert.strictEqual(safeDivide(10, 0, 999), 999, 'zero division returns fallback');
assert.strictEqual(safeDivide(10, EPSILON_DIVISION_GUARD, 999), 999, 'epsilon division returns fallback');
assert.strictEqual(safeDivide(10, -EPSILON_DIVISION_GUARD / 2, 999), 999, 'negative tiny denominator returns fallback');
assert.strictEqual(safeDivide(NaN, 5, 999), 999, 'NaN numerator returns fallback');
assert.strictEqual(safeDivide(5, Infinity, 999), 999, 'Infinity denominator returns fallback');
assert.strictEqual(Object.is(safeDivide(-0, 5), 0), true, 'safeDivide(-0, 5) normalized to +0');
assert.strictEqual(Object.is(safeDivide(0, -5), 0), true, 'safeDivide(0, -5) normalized to +0');
assert.strictEqual(safeDivide(10, 0, NaN), 0, 'safeDivide non-finite fallback guarded to 0');

// 3. Test clampToRange
console.log('[3/7] Testing clampToRange...');
assert.strictEqual(clampToRange(50, 0, 100), 50, 'inside range preserved');
assert.strictEqual(clampToRange(-10, 0, 100), 0, 'below min clamped to min');
assert.strictEqual(clampToRange(150, 0, 100), 100, 'above max clamped to max');
assert.strictEqual(clampToRange(NaN, 10, 20), 10, 'NaN returns min');
assert.strictEqual(Object.is(clampToRange(-0, 0, 100), 0), true, 'clampToRange(-0) normalized to +0');
assert.strictEqual(Object.is(clampToRange(-5, -0, 100), 0), true, 'clampToRange(-0 min) normalized to +0');
assert.strictEqual(clampToRange(50, 100, 0), 50, 'inverted bounds swapped safely');
assert.strictEqual(clampToRange(-10, 100, 0), 0, 'inverted bounds clamp below effective min');
assert.strictEqual(clampToRange(150, 100, 0), 100, 'inverted bounds clamp above effective max');
assert.strictEqual(clampToRange(50, NaN, 100), 50, 'NaN min guarded');
assert.strictEqual(clampToRange(150, NaN, 100), 100, 'NaN min respects finite max');
assert.strictEqual(clampToRange(NaN, NaN, NaN), 0, 'all-NaN args guarded to 0');

// 4. Test Boundary Validators (including all 7 validators & edge cases)
console.log('[4/7] Testing Boundary Validators...');
assert.strictEqual(DEFAULT_MIN_LOAD_KG, MIN_PHYSIOLOGICAL_LOAD_KG, 'DEFAULT_MIN_LOAD_KG alias matches');
assert.strictEqual(DEFAULT_MAX_LOAD_KG, MAX_PHYSIOLOGICAL_LOAD_KG, 'DEFAULT_MAX_LOAD_KG alias matches');

// Load
const validLoad = validateLoadKg('120,5');
assert.strictEqual(validLoad.isValid, true, 'valid load recognized');
if (validLoad.isValid) {
  assert.strictEqual(validLoad.value, 120.5);
}
assert.strictEqual(validateLoadKg(MIN_PHYSIOLOGICAL_LOAD_KG).isValid, true, 'exact min load 0 valid');
assert.strictEqual(validateLoadKg(MAX_PHYSIOLOGICAL_LOAD_KG).isValid, true, 'exact max load valid');
const negativeLoad = validateLoadKg(-5);
expectFailureCode(negativeLoad, 'BELOW_MIN');
const overloadLoad = validateLoadKg(MAX_PHYSIOLOGICAL_LOAD_KG + 0.1);
expectFailureCode(overloadLoad, 'ABOVE_MAX');

// customMin < 0 on non-negative branded types must NOT throw TypeError
const loadNegCustomMin = validateLoadKg(-5, undefined, { customMin: -10 });
expectFailureCode(loadNegCustomMin, 'BELOW_MIN', 'load with customMin < 0 rejects negative cleanly');
assert.strictEqual(validateLoadKg(50, undefined, { customMin: -10 }).isValid, true, 'load >= 0 passes with customMin < 0');
expectFailureCode(validateLoadKg(1500, undefined, { customMax: 2000 }), 'ABOVE_MAX', 'load customMax > hardMax guarded');

// Velocity
assert.strictEqual(validateVelocityMps(MIN_PHYSIOLOGICAL_VELOCITY_MPS).isValid, true, 'velocity 0 valid');
assert.strictEqual(validateVelocityMps(MAX_PHYSIOLOGICAL_VELOCITY_MPS).isValid, true, 'velocity exact max valid');
const validVel = validateVelocityMps(0.82);
assert.strictEqual(validVel.isValid, true);
if (validVel.isValid) {
  assert.strictEqual(validVel.value, 0.82);
}
const eccVelDisallowed = validateVelocityMps(-1.2);
expectFailureCode(eccVelDisallowed, 'BELOW_MIN');

// No silent clamping when customMin < 0 and allowNegative is false
const velNoSilentClamp = validateVelocityMps(-1.2, undefined, { customMin: -2 });
expectFailureCode(velNoSilentClamp, 'BELOW_MIN', 'velocity negative with !allowNegative must fail, not silent-clamp');

const eccVelAllowed = validateVelocityMps(-1.2, undefined, { allowNegative: true });
assert.strictEqual(eccVelAllowed.isValid, true);
if (eccVelAllowed.isValid) {
  assert.strictEqual(eccVelAllowed.value, -1.2);
}
assert.strictEqual(validateVelocityMps(MIN_ECCENTRIC_VELOCITY_MPS, undefined, { allowNegative: true }).isValid, true, 'exact eccentric min valid');
expectFailureCode(validateVelocityMps(MIN_ECCENTRIC_VELOCITY_MPS - 0.1, undefined, { allowNegative: true, customMin: -10 }), 'BELOW_MIN', 'velocity below hardMin guarded without TypeError');

// Force
assert.strictEqual(validateForceN(MIN_PHYSIOLOGICAL_FORCE_N).isValid, true, 'force 0 valid');
assert.strictEqual(validateForceN(MAX_PHYSIOLOGICAL_FORCE_N).isValid, true, 'force exact max valid');
expectFailureCode(validateForceN(-1), 'BELOW_MIN', 'negative force rejected without allowNegative');
assert.strictEqual(validateForceN(MIN_SHEAR_FORCE_N, undefined, { allowNegative: true }).isValid, true, 'force exact shear min valid');
expectFailureCode(validateForceN(MIN_SHEAR_FORCE_N - 1, undefined, { allowNegative: true }), 'BELOW_MIN', 'force below shear min rejected');
const shearForceAllowed = validateForceN(-350, undefined, { allowNegative: true });
assert.strictEqual(shearForceAllowed.isValid, true);

// Power
assert.strictEqual(validatePowerW(MIN_PHYSIOLOGICAL_POWER_W).isValid, true, 'power 0 valid');
assert.strictEqual(validatePowerW(MAX_PHYSIOLOGICAL_POWER_W).isValid, true, 'power exact max valid');
expectFailureCode(validatePowerW(-10), 'BELOW_MIN', 'negative power rejected');
expectFailureCode(validatePowerW(MAX_PHYSIOLOGICAL_POWER_W + 1), 'ABOVE_MAX', 'power above max rejected');

// Angle with custom physiological knee bounds (0-165)
assert.strictEqual(validateAngleDeg(MIN_PHYSIOLOGICAL_ANGLE_DEG).isValid, true, 'angle 0 valid');
assert.strictEqual(validateAngleDeg(MAX_PHYSIOLOGICAL_ANGLE_DEG).isValid, true, 'angle 360 valid');
const kneeValid = validateAngleDeg(90, undefined, { customMin: 0, customMax: 165 });
assert.strictEqual(kneeValid.isValid, true);
const kneeHyperextended = validateAngleDeg(180, undefined, { customMin: 0, customMax: 165 });
expectFailureCode(kneeHyperextended, 'ABOVE_MAX');
assert.strictEqual(validateAngleDeg(-15, undefined, { allowNegative: true, customMin: -30 }).isValid, true, 'negative angle allowed with allowNegative + customMin');
expectFailureCode(validateAngleDeg(-15, undefined, { customMin: -30 }), 'BELOW_MIN', 'negative angle rejected when !allowNegative');

// TimeMs & TimeSec
assert.strictEqual(validateTimeMs(MIN_PHYSIOLOGICAL_TIME_MS).isValid, true, 'timeMs 0 valid');
assert.strictEqual(validateTimeMs(MAX_PHYSIOLOGICAL_TIME_MS).isValid, true, 'timeMs exact max valid');
expectFailureCode(validateTimeMs(-5, undefined, { customMin: -10 }), 'BELOW_MIN', 'timeMs customMin < 0 guarded without TypeError');
expectFailureCode(validateTimeMs(MAX_PHYSIOLOGICAL_TIME_MS + 1), 'ABOVE_MAX');

assert.strictEqual(validateTimeSec(MIN_PHYSIOLOGICAL_TIME_SEC).isValid, true, 'timeSec 0 valid');
assert.strictEqual(validateTimeSec(MAX_PHYSIOLOGICAL_TIME_SEC).isValid, true, 'timeSec exact max valid');
expectFailureCode(validateTimeSec(-1, undefined, { customMin: -5 }), 'BELOW_MIN', 'timeSec customMin < 0 guarded without TypeError');
expectFailureCode(validateTimeSec(MAX_PHYSIOLOGICAL_TIME_SEC + 1), 'ABOVE_MAX');

// Invalid bounds & non-finite options / fallback
expectFailureCode(validateAngleDeg(50, undefined, { customMin: 200, customMax: 100 }), 'INVALID_BOUNDS', 'inverted custom bounds rejected');
expectFailureCode(validateAngleDeg(50, undefined, { customMin: NaN }), 'NON_FINITE', 'NaN customMin rejected');
expectFailureCode(validateAngleDeg(50, undefined, { customMax: Infinity }), 'NON_FINITE', 'Infinity customMax rejected');
const badFallbackResult = validateLoadKg('invalid', NaN as never);
assert.strictEqual(badFallbackResult.isValid, false);
if (!badFallbackResult.isValid) {
  assert.strictEqual(badFallbackResult.fallback, 0, 'non-finite fallback normalized to 0');
}

// NaN / Infinity / -Infinity / undefined / null / '0x10' across ALL 7 validators
const allValidators: Array<{
  readonly name: string;
  readonly fn: (v: unknown) => ValidationResult<number>;
}> = [
  { name: 'validateLoadKg', fn: (v) => validateLoadKg(v) },
  { name: 'validateVelocityMps', fn: (v) => validateVelocityMps(v) },
  { name: 'validateForceN', fn: (v) => validateForceN(v) },
  { name: 'validatePowerW', fn: (v) => validatePowerW(v) },
  { name: 'validateAngleDeg', fn: (v) => validateAngleDeg(v) },
  { name: 'validateTimeMs', fn: (v) => validateTimeMs(v) },
  { name: 'validateTimeSec', fn: (v) => validateTimeSec(v) },
];
const invalidInputs: readonly unknown[] = [NaN, Infinity, -Infinity, undefined, null, '0x10'];
for (const { name, fn } of allValidators) {
  for (const invalidVal of invalidInputs) {
    const res = fn(invalidVal);
    assert.strictEqual(res.isValid, false, `${name}(${String(invalidVal)}) must fail`);
    if (!res.isValid) {
      assert.strictEqual(res.errorCode, 'NON_FINITE', `${name}(${String(invalidVal)}) must return NON_FINITE`);
    }
  }
}

// 5. Test formatNumericValue edge cases
console.log('[5/7] Testing formatNumericValue...');
assert.notStrictEqual(formatNumericValue(-0.001, 2), '-0,00', 'near-zero negative must not format as -0,00');
assert.strictEqual(formatNumericValue(-0.001, 2), '0,00', '-0.001 with 2 decimals formats as 0,00');
assert.strictEqual(formatNumericValue(-0.4, 0), '0', '-0.4 with 0 decimals formats as 0');
assert.strictEqual(formatNumericValue(-0, 1), '0,0', '-0 with 1 decimal formats as 0,0');
assert.strictEqual(formatNumericValue(1.23456, 4), '1,2346', '4 decimals uses it-IT comma decimal');
assert.strictEqual(formatNumericValue(1.23456, -2), '1', 'negative decimals clamped to 0 without RangeError');
assert.strictEqual(formatNumericValue(1.23456789, 200), formatNumericValue(1.23456789, MAX_FORMAT_DECIMALS), 'huge decimals clamped to MAX_FORMAT_DECIMALS without RangeError');
assert.strictEqual(formatNumericValue(1.23, NaN), '1', 'NaN decimals defaults to 0');

// 6. Test SI Formatters
console.log('[6/7] Testing SI Formatters...');
// Force (consistent 0 decimals, supports negative shear force)
assert.strictEqual(formatForce(2450), `2450${NARROW_NO_BREAK_SPACE}N`, 'consistent integer force formatting');
assert.strictEqual(formatForce(45.5), `46${NARROW_NO_BREAK_SPACE}N`, 'below-100 force also uses 0 decimals (no jitter)');
assert.strictEqual(formatForce(-350), `-350${NARROW_NO_BREAK_SPACE}N`, 'negative shear force formatted');
assert.strictEqual(formatForce(null), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}N`);
assert.strictEqual(formatForce(NaN), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}N`);

// Power (non-negative guard)
assert.strictEqual(formatPower(1250).endsWith(`${NARROW_NO_BREAK_SPACE}W`), true, 'ends with thin space W');
assert.strictEqual(formatPower(-50), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}W`, 'negative power returns placeholder');
assert.strictEqual(formatPower(undefined), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}W`);

// Velocity (2 decimals strictly, supports negative eccentric)
assert.strictEqual(formatVelocity(0.82), `0,82${NARROW_NO_BREAK_SPACE}m/s`);
assert.strictEqual(formatVelocity(1), `1,00${NARROW_NO_BREAK_SPACE}m/s`);
assert.strictEqual(formatVelocity(-0.95), `-0,95${NARROW_NO_BREAK_SPACE}m/s`);

// Load (1 decimal strictly, non-negative guard)
assert.strictEqual(formatLoad(102.5), `102,5${NARROW_NO_BREAK_SPACE}kg`);
assert.strictEqual(formatLoad(100), `100,0${NARROW_NO_BREAK_SPACE}kg`);
assert.strictEqual(formatLoad(-10), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}kg`, 'negative load returns placeholder');

// Angle (no space before °)
assert.strictEqual(formatAngle(85), '85°');
assert.strictEqual(formatAngle(null), `${PLACEHOLDER_EMPTY_DASH}°`);

// Times (non-negative guard)
assert.strictEqual(formatTimeMs(245), `245${NARROW_NO_BREAK_SPACE}ms`);
assert.strictEqual(formatTimeMs(-5), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}ms`, 'negative timeMs returns placeholder');
assert.strictEqual(formatTimeSec(4.28), `4,28${NARROW_NO_BREAK_SPACE}s`);
assert.strictEqual(formatTimeSec(-1), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}s`, 'negative timeSec returns placeholder');

// Cardiovascular (non-negative guard)
assert.strictEqual(formatHeartRate(162), `162${NARROW_NO_BREAK_SPACE}bpm`);
assert.strictEqual(formatHeartRate(-60), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}bpm`, 'negative HR returns placeholder');
assert.strictEqual(formatHrvRmssd(64), `64${NARROW_NO_BREAK_SPACE}ms`);
assert.strictEqual(formatHrvRmssd(-10), `${PLACEHOLDER_EMPTY_DASH}${NARROW_NO_BREAK_SPACE}ms`, 'negative HRV returns placeholder');

// 7. Test MetricDisplayData (Anti-Jittering) & Barrel Exports
console.log('[7/7] Testing formatMetricWithUnit & barrel exports...');
const displayValid = formatMetricWithUnit(102.5, 'kg', 1);
assert.strictEqual(displayValid.valueText, '102,5');
assert.strictEqual(displayValid.unitText, 'kg');
assert.strictEqual(displayValid.isPlaceholder, false);

const displayInvalid = formatMetricWithUnit(null, 'W', 0);
assert.strictEqual(displayInvalid.valueText, PLACEHOLDER_EMPTY_DASH);
assert.strictEqual(displayInvalid.unitText, 'W');
assert.strictEqual(displayInvalid.isPlaceholder, true);

assert.strictEqual(typeof readStorageSafe, 'function', 'storage-safe exported from utils barrel');
assert.strictEqual(typeof writeStorageSafe, 'function', 'writeStorageSafe exported from utils barrel');
assert.strictEqual(barrelSanitizeNumeric('10,5'), 10.5, 'barrel sanitizeNumeric works');
assert.strictEqual(barrelFormatNumericValue(10.5, 1), '10,5', 'barrel formatNumericValue works');
assert.strictEqual(readStorageSafe('t7_test_ssr_key'), null, 'SSR safe read returns null in Node');

console.log('SUCCESS: ALL METROLOGY & NUMBER FORMAT TESTS PASSED (100%)!');
