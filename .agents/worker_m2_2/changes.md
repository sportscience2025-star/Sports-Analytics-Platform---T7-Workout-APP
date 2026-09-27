# Changes Document — Requirement R1 Iteration 2 Remediation

## Files Modified

### 1. `js/parser.js`
- **Added `isDeviceToken(part)` helper**: Checks if a string segment contains digits (`/\d/`) or matches generic system keywords (`encoder`, `sensor`, `device`, `vbt`, `id`, `mac`).
- **Updated `isEncodedId(name)`**:
  - Validates input is non-empty and contains `_`.
  - Splits input by `_`.
  - Returns `true` if the lowercased first part is a system keyword (`encoder`, `sensor`, `device`, `vbt`) OR if the last part is a device token (`isDeviceToken(lastPart)`).
  - Standard human names like `Mario_Rossi` or `Gianni_Maria_Verdi` without device tokens return `false`.
- **Updated `extractReadableName(encodedId)`**:
  - Completely removed the tautological `|| parts.length > 1` condition inside the `if (parts.length > 1)` block.
  - Slices off the last segment (`parts.slice(0, -1)`) strictly if `isDeviceToken(lastPart)` returns `true`.
  - Filters out empty segments, title-cases each segment, joins them with spaces, and returns `"Encoder"` if the result is generic (`isGenericAthlete`).

### 2. `sw.js`
- **Bumped Service Worker cache version**: Incremented `CACHE_NAME` from `'t7-workout-v19'` to `'t7-workout-v20'` to satisfy multi-agent PWA cache invalidation rules.

### 3. Verification Artifacts (`verify_r1.js`, `verify_r1.py`)
- Created automated test execution scripts to verify all required test cases:
  - `Tommaso_mhkuhpch00134m` -> `isEncodedId: true`, `extractReadableName: "Tommaso"`
  - `Mario_Rossi_mhkuhpch00134m` -> `isEncodedId: true`, `extractReadableName: "Mario Rossi"`
  - `Tommaso_vbt01` -> `isEncodedId: true`, `extractReadableName: "Tommaso"`
  - `encoder_123456` -> `isEncodedId: true`, `extractReadableName: "Encoder"`
  - `Mario_Rossi` -> `isEncodedId: false`, `extractReadableName: "Mario Rossi"`
