# Handoff Report — PWA & Integration Architecture for Scientific Sources Modularization

## 1. Observation
- **Current Monolith**: `js/knowledge-base.js` contains 3,407 lines and 161 entries. Analysis via Node.js script confirmed distribution by area:
  - `Atletica Leggera`: 21
  - `Sollevamento Pesi`: 17
  - `Fisiologia`: 33
  - `VBT`: 13
  - `Biomeccanica`: 26
  - `Clinico`: 26
  - `Sport di Squadra`: 25
  Total: 161 sources.
- **Cache Version**: `sw.js` line 6 defines `const CACHE_NAME = 't7-workout-v76';`. `test_check.py` line 44 asserts `if "t7-workout-v76" not in sw_code:`. The project is currently at `v76` (not `v68`).
- **Core Assets**: `sw.js` lines 20-35 include `./js/knowledge-base.js` in `CORE_ASSETS`.
- **Script Loading in `index.html`**: `js/knowledge-base.js` is included at line 145, situated between `js/parser.js` (line 144) and `<!-- Logic Modules -->` (line 146).
- **Direct Consumers**:
  - `js/ui/scientific-hub.js` (line 69): `const allSources = window.App.scientificSources || [];`
  - `js/logic/rationale-generator.js` (line 95, 101): `if (!window.App || !window.App.scientificSources) ... window.App.scientificSources.forEach(...)`
  - `js/views/scientific-hub-view.js` (line 36): invokes `window.App.renderScientificHub`
  - `js/ui/wizard.js` (line 638, 830-860): renders citations and rationale
  - `js/ui/export.js` (lines 193, 575): exports citations
- **Test Dependents**:
  - `tests/test_adversarial_challenger.js` (line 111): `const kbPath = path.join(__dirname, '..', 'js', 'knowledge-base.js'); eval(kbCode);`
  - `tests/test_adversarial_scientific_hub.js` (line 70-73): checks `fs.existsSync(kbPath)`
  - `tests/test_periodization_stress.js` (line 26): `loadModule('js/knowledge-base.js');`
  - `tests/test_new_profiles.js` (line 26): `loadModule('js/knowledge-base.js');`
- **Architectural Precedents**:
  - `js/data.js`, `js/parser.js`, and `js/logic.js` all use a dual-environment pattern: sequential `<script>` tags in `index.html` for browser, and `if (typeof require !== 'undefined')` candidate scanning with `fs.readFileSync` and `eval()` for Node.js test runners.

## 2. Logic Chain
1. *Premise 1*: Browser execution is vanilla JavaScript without native module bundling or import maps. Scripts execute synchronously in the order declared in `index.html` (Observation 4).
2. *Premise 2*: `js/logic/rationale-generator.js` and `js/ui/scientific-hub.js` require `window.App.scientificSources` to be populated at the moment their logic runs (Observation 5).
3. *Step 1*: Therefore, modular source scripts (`atletica.js`, `sollevamento-pesi.js`, `fisiologia.js`, `vbt.js`, `biomeccanica.js`, `clinico.js`, `sport-squadra.js`) must execute before `js/data/sources/index.js`, and `index.js` must execute before `js/logic.js` in `index.html`.
4. *Step 2*: Line 145 in `index.html` (where `js/knowledge-base.js` currently resides) is the exact insertion point before `<!-- Logic Modules -->`. Replacing line 145 with the 8 modular source scripts guarantees data availability without disrupting any other modules.
5. *Premise 3*: Node.js test suites directly load `js/knowledge-base.js` via `fs.readFileSync` and `eval` and fail if the file is missing (Observation 6).
6. *Step 3*: If `js/knowledge-base.js` is kept as a thin backward-compatibility wrapper that delegates to `js/data/sources/index.js`, all 4 dependent test suites will continue passing without needing individual test rewrites.
7. *Premise 4*: `sw.js` uses `cache.addAll(CORE_ASSETS)` during installation (Observation 3). Any 404 failure aborts the install.
8. *Step 4*: Adding all 8 modular files (`./js/data/sources/*.js`) and keeping `./js/knowledge-base.js` in `CORE_ASSETS` ensures complete offline caching.
9. *Premise 5*: Modifying JS files and PWA assets mandates a cache bump per project rules. The current version in `sw.js` and `test_check.py` is `t7-workout-v76` (Observation 2).
10. *Step 5*: The cache version must be incremented from `t7-workout-v76` to `t7-workout-v77` in both `sw.js` and `test_check.py`.
11. *Step 6*: `test_check.py` must be extended with delimiter checks for the 8 new source files and the updated cache name.

## 3. Caveats
- **Research Content**: This investigation focused exclusively on the architecture, loading sequence, caching, and test compatibility. The content of the ~90 new scientific sources to be added is managed by the research subagents.
- **Memory Footprint**: Expanding from 161 to 250+ entries increases memory by ~100-150KB, which is trivial for modern browsers and Service Worker cache.
- **No Bundler Assumption**: The project does not currently use a build step or bundler. If a bundler is introduced in the future, the aggregator `index.js` could use standard ES module imports/exports.

## 4. Conclusion
The modularization of `js/knowledge-base.js` into 7 thematic area files under `js/data/sources/` plus an aggregator `index.js` and a backward-compatibility facade in `js/knowledge-base.js` is completely specified, architecturally sound, and 100% compatible with both browser PWA execution and Node.js test runners.

### Action Plan for Implementer:
1. Create `js/data/sources/` with the 7 thematic files and `index.js`.
2. Populate the 7 files with the 161 existing sources + ~90 newly researched sources.
3. Replace `js/knowledge-base.js` with the lightweight compatibility facade.
4. Update `index.html` at line 145 with the 8 new script tags + `knowledge-base.js`.
5. Update `sw.js`: bump `CACHE_NAME` to `t7-workout-v77` and add the 8 files to `CORE_ASSETS`.
6. Update `test_check.py`: assert `t7-workout-v77` and add delimiter loop for `sources_files`.

## 5. Verification Method
1. Run syntax and cache verification:
   `py test_check.py`
   Expected result: `All syntax checks passed.` (Exit 0).
2. Run test suites that load knowledge base:
   - `node tests/test_periodization_stress.js`
   - `node tests/test_new_profiles.js`
   - `node tests/test_adversarial_challenger.js`
   - `node tests/test_adversarial_scientific_hub.js`
   Expected result: All tests pass with 0 failures.
3. Verify modular export integrity via Node CLI:
   `node -e "const fs = require('fs'); global.window = {}; eval(fs.readFileSync('js/data/sources/index.js', 'utf8')); console.log(global.window.App.scientificSources.length);"`
   Expected result: $\ge 250$.
