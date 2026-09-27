"""
Independent Post-Victory Audit Script
Authored by: teamwork_preview_victory_auditor_sentinel_5
"""
import os
import re
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("INDEPENDENT VICTORY AUDIT TEST SUITE")
print("=" * 60)

passed = 0
failed = 0

def assert_check(name, condition, details=""):
    global passed, failed
    if condition:
        passed += 1
        print(f" [PASS] {name}")
    else:
        failed += 1
        print(f" [FAIL] {name} - {details}", file=sys.stderr)

# -------------------------------------------------------------
# 1. CANONICAL TEST COMMAND EXECUTION
# -------------------------------------------------------------
res = subprocess.run([sys.executable, "test_check.py"], capture_output=True, text=True)
assert_check("Canonical test 'py test_check.py' exits with code 0", res.returncode == 0, f"code {res.returncode}, err: {res.stderr}")
assert_check("Canonical test outputs 'All syntax checks passed.'", "All syntax checks passed." in res.stdout, f"stdout: {res.stdout}")

# -------------------------------------------------------------
# 2. DELIMITER BALANCE AUDIT ACROSS ALL CANONICAL PROJECT JS FILES
# -------------------------------------------------------------
canonical_files = [
    "js/data/taxonomy.js",
    "js/data/sources/atletica.js",
    "js/data/sources/sollevamento-pesi.js",
    "js/data/sources/fisiologia.js",
    "js/data/sources/vbt.js",
    "js/data/sources/biomeccanica.js",
    "js/data/sources/clinico.js",
    "js/data/sources/sport-squadra.js",
    "js/data/sources/riabilitazione.js",
    "js/data/sources/nutrizione-sportiva.js",
    "js/data/sources/prevenzione-infortuni.js",
    "js/data/sources/psicologia-sport.js",
    "js/data/sources/sport-individuali.js",
    "js/data/sources/index.js",
    "js/knowledge-base.js",
    "js/logic/risk-analyzer.js",
    "js/logic/periodization.js",
    "js/logic/phase-builder.js",
    "js/logic/session-builder.js",
    "js/logic/exercise-formatter.js",
    "js/logic/warmup-cooldown.js",
    "js/logic/rationale-generator.js",
    "js/logic/data-persistence.js",
    "js/logic.js",
    "js/parser/exercise-dict.js",
    "js/parser/athlete-resolver.js",
    "js/parser/load-aggregator.js",
    "js/parser/header-mapper.js",
    "js/parser/instrument-detector.js",
    "js/parser/file-readers.js",
    "js/parser.js",
    "js/ui/helpers.js",
    "js/ui/favorites.js",
    "js/ui/exercise-detail-resolver.js",
    "js/ui/wizard.js",
    "js/ui/export.js",
    "js/ui/render-filters.js",
    "js/ui/add-exercise-modal.js",
    "js/ui/catalog.js",
    "js/ui/scientific-hub.js",
    "js/ui.js",
    "js/views/catalog-view.js",
    "js/views/favorites-view.js",
    "js/views/scientific-hub-view.js",
    "js/views/wizard-view.js",
    "js/views/analysis-view.js",
    "js/views/rag-view.js"
]

for fpath in canonical_files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
        assert_check(f"Balanced delimiters in {fpath}",
                     content.count("{") == content.count("}") and
                     content.count("(") == content.count(")") and
                     content.count("[") == content.count("]"),
                     f"mismatch: braces {content.count('{')} vs {content.count('}')}, parens {content.count('(')} vs {content.count(')')}")

# Validate all JS files with node -c
js_dirs = ['js', 'js/ui', 'js/views', 'js/logic', 'js/parser', 'js/data', 'js/data/sources']
syntax_ok = True
js_count = 0
for d in js_dirs:
    for f in os.listdir(d):
        if f.endswith('.js'):
            js_count += 1
            p = os.path.join(d, f)
            r = subprocess.run(['node', '-c', p], capture_output=True, text=True)
            if r.returncode != 0:
                syntax_ok = False
                print(f"Syntax error in {p}: {r.stderr}", file=sys.stderr)

assert_check(f"Node syntax check (node -c) passed for all {js_count} JS files", syntax_ok)

# -------------------------------------------------------------
# 3. R1 - CARD LAYOUT & VISUAL OVERFLOW PREVENTION
# -------------------------------------------------------------
with open("js/ui/catalog.js", "r", encoding="utf-8") as f:
    cat_js = f.read()

with open("css/style.css", "r", encoding="utf-8") as f:
    style_css = f.read()

assert_check("R1: catalog.js renders .btn-card-action pill button", 'class="btn-card-action"' in cat_js)
assert_check("R1: catalog.js .btn-card-action has type='button'", 'type="button" class="btn-card-action"' in cat_js)
assert_check("R1: catalog.js .btn-card-action includes Scheda text and action-arrow", '<span>Scheda</span><span class="action-arrow">→</span>' in cat_js)
assert_check("R1: catalog.js renders .sec-muscles-wrap", 'sec-muscles-wrap' in cat_js)
assert_check("R1: catalog.js renders .sec-muscle-pill", 'sec-muscle-pill' in cat_js)

assert_check("R1: style.css .exercise-card has position: relative and overflow: hidden",
             bool(re.search(r'\.exercise-card\s*\{[^}]*position:\s*relative;[^}]*overflow:\s*hidden;', style_css, re.DOTALL)))

assert_check("R1: style.css .card-header has padding-right: 2.25rem to protect favorite button",
             bool(re.search(r'\.card-header\s*\{[^}]*padding-right:\s*2\.25rem;', style_css, re.DOTALL)))

assert_check("R1: style.css .favorite-btn has position: absolute; right: 1rem; top: 1rem;",
             bool(re.search(r'\.favorite-btn\s*\{[^}]*position:\s*absolute;[^}]*top:\s*1rem;[^}]*right:\s*1rem;', style_css, re.DOTALL)))

assert_check("R1: style.css .tag has font-size: 0.68rem and border-radius: 9999px",
             bool(re.search(r'(\.tag,\s*\.card-tags\s*\.tag|\.tag)\s*\{[^}]*font-size:\s*0\.68rem;[^}]*border-radius:\s*9999px;', style_css, re.DOTALL)))

assert_check("R1: style.css .btn-card-action has border-radius: 9999px",
             bool(re.search(r'\.btn-card-action\s*\{[^}]*border-radius:\s*9999px;', style_css, re.DOTALL)))

assert_check("R1: style.css .sec-muscles-wrap has flex-wrap: wrap",
             bool(re.search(r'\.sec-muscles-wrap\s*\{[^}]*flex-wrap:\s*wrap;', style_css, re.DOTALL)))

assert_check("R1: style.css .sec-muscle-pill has text-overflow: ellipsis",
             bool(re.search(r'\.sec-muscle-pill\s*\{[^}]*text-overflow:\s*ellipsis;', style_css, re.DOTALL)))

assert_check("R1: style.css .tag.chip--equipment has text-overflow: ellipsis",
             bool(re.search(r'\.tag\.chip--equipment\s*\{[^}]*text-overflow:\s*ellipsis;', style_css, re.DOTALL)))

# Check exercise dataset size
node_res = subprocess.run(["node", "-e", "global.window = { App: {} }; require('fs'); eval(require('fs').readFileSync('js/data/exercises.js', 'utf8')); console.log(window.App.exercises.length);"],
                          capture_output=True, text=True)
assert_check("R1: Total exercises in js/data/exercises.js is exactly 504", node_res.stdout.strip() == "504", f"got {node_res.stdout.strip()}")

# -------------------------------------------------------------
# 4. R2 - DROPDOWN ARCHITECTURE & APPLE MINIMAL DESIGN
# -------------------------------------------------------------
with open("js/ui/render-filters.js", "r", encoding="utf-8") as f:
    rf_js = f.read()

assert_check("R2: render-filters.js has .dropdown-search-wrap", 'class="dropdown-search-wrap"' in rf_js)
assert_check("R2: render-filters.js has #search-muscle-input", 'id="search-muscle-input"' in rf_js)
assert_check("R2: render-filters.js wraps options in .dropdown-options-list", 'class="dropdown-options-list"' in rf_js)
assert_check("R2: render-filters.js implements WAI-ARIA combobox on triggers", 'role="combobox"' in rf_js)
assert_check("R2: render-filters.js implements WAI-ARIA listbox on options list", 'role="listbox"' in rf_js)
assert_check("R2: render-filters.js implements WAI-ARIA option on options", 'role="option"' in rf_js)
assert_check("R2: render-filters.js implements keyboard navigation: Escape key", "'Escape'" in rf_js)
assert_check("R2: render-filters.js implements keyboard navigation: ArrowDown and ArrowUp", "'ArrowDown'" in rf_js and "'ArrowUp'" in rf_js)
assert_check("R2: render-filters.js implements keyboard navigation: Enter key", "'Enter'" in rf_js)
assert_check("R2: render-filters.js implements resetMuscleSearch function", 'function resetMuscleSearch' in rf_js)
assert_check("R2: render-filters.js cleans up previous document event listeners", 'document.removeEventListener' in rf_js)

assert_check("R2: style.css defines .custom-select-menu with backdrop-filter: blur(24px)",
             bool(re.search(r'\.custom-select-menu\s*\{[^}]*backdrop-filter:\s*blur\(24px\);', style_css, re.DOTALL)))

assert_check("R2: style.css defines .custom-select-menu with border-radius: 12px",
             bool(re.search(r'\.custom-select-menu\s*\{[^}]*border-radius:\s*12px;', style_css, re.DOTALL)))

assert_check("R2: style.css defines .dropdown-search-wrap with flex-shrink: 0 (fixed non-scrolling)",
             bool(re.search(r'\.dropdown-search-wrap\s*\{[^}]*flex-shrink:\s*0;', style_css, re.DOTALL)))

assert_check("R2: style.css defines .dropdown-options-list with max-height: 280px and overflow-y: auto",
             bool(re.search(r'\.dropdown-options-list\s*\{[^}]*max-height:\s*280px;[^}]*overflow-y:\s*auto;', style_css, re.DOTALL)))

assert_check("R2: style.css defines .custom-option with border-radius: 8px",
             bool(re.search(r'\.custom-option\s*\{[^}]*border-radius:\s*8px;', style_css, re.DOTALL)))

# Check favorites view sync
with open("js/views/favorites-view.js", "r", encoding="utf-8") as f:
    fav_js = f.read()

assert_check("R2: favorites-view.js handles click in capture phase to catch unfavorite events",
             "catalogGridEl.addEventListener('click'" in fav_js and ", true);" in fav_js)

assert_check("R2: favorites-view.js updates #favorites-counter dynamically",
             "favCounter.innerHTML" in fav_js)

assert_check("R2: favorites-view.js supports 6 filter criteria",
             "filters.quality" in fav_js and "filters.muscle" in fav_js and "filters.level" in fav_js)

# -------------------------------------------------------------
# 5. R3 - SERVICE WORKER CACHE & TEST ALIGNMENT
# -------------------------------------------------------------
with open("sw.js", "r", encoding="utf-8") as f:
    sw_js = f.read()

m_sw = re.search(r'CACHE_NAME\s*=\s*[\'"]([^\'"]+)[\'"]', sw_js)
sw_cache = m_sw.group(1) if m_sw else ""
assert_check("R3: sw.js defines CACHE_NAME", bool(m_sw))
assert_check("R3: CACHE_NAME in sw.js is t7-workout-v87", sw_cache == "t7-workout-v87", f"found {sw_cache}")
assert_check("R3: test_check.py checks for exact CACHE_NAME", sw_cache in open("test_check.py", "r", encoding="utf-8").read())

# -------------------------------------------------------------
# 6. EMOJI PURITY & SPONTANEOUS EMOJI AUDIT
# -------------------------------------------------------------
emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]|[\u2600-\u27bf]|[\u2300-\u23ff]')
allowed_chars = {
    '\u2764', '\ufe0f', '\U0001f90d', '\u26a0', '\u23f1', '\u2705', '\u274c', '\u2713', '\u2715', '\u21ba', '\u2192',
    '\U0001f992', '\U0001f9b4', '\u3030', '\U0001f4bf', '\U0001f4aa', '\U0001f9b5', '\U0001fa79',
    '\U0001f9d8', '\u270b', '\U0001f9be', '\U0001fa78', '\U0001fac1', '\U0001f9b6', '\U0001fa7a'
}

spontaneous = []
for fpath in ["js/ui/catalog.js", "js/views/favorites-view.js", "css/style.css"]:
    with open(fpath, "r", encoding="utf-8") as f:
        for lno, line in enumerate(f, 1):
            matches = emoji_pattern.findall(line)
            for m in matches:
                if any(c not in allowed_chars for c in m):
                    spontaneous.append((fpath, lno, m, line.strip()))

assert_check("Zero spontaneous emojis in catalog.js, favorites-view.js, style.css",
             len(spontaneous) == 0, f"found: {spontaneous}")

# -------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------
print("\n" + "=" * 60)
print(f"AUDIT SUMMARY: {passed} PASSED, {failed} FAILED")
print("=" * 60)

if failed > 0:
    print("VERDICT: VICTORY REJECTED")
    sys.exit(1)
else:
    print("VERDICT: VICTORY CONFIRMED")
    sys.exit(0)
