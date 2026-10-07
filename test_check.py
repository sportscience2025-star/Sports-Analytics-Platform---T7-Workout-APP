import sys

print("Validating js/data-analysis.js...")
with open("js/data-analysis.js", "r", encoding="utf-8") as f:
    code = f.read()

# Check for required methods and elements
required_elements = [
    "vbtZonesPlugin",
    "filter-athlete-select",
    "filter-exercise-select",
    "filter-exercise-pills",
    "getAthletes",
    "getExercisesForAthlete",
    "renderFilterBar",
    "selectAthleteAndExercise",
    "syncManualInputsWithSelection",
    "renderDashboardForSelection",
    "generateQuickActions",
    "executeNLPQuery",
    "power-curve-chart",
    "vbt-chart",
    "#00f0ff",
    "neonGlowPlugin",
    "Pmax",
    "Lopt",
    "Vopt",
    "Forza Massima",
    "Forza-Velocità",
    "Velocità-Forza",
    "Velocità Pura",
    "1RM Stimato"
]

missing = [el for el in required_elements if el not in code]
if missing:
    print("FAILED: Missing elements:", missing)
    sys.exit(1)

# Check sw.js cache name
import re
with open("sw.js", "r", encoding="utf-8") as f:
    sw_code = f.read()

if not re.search(r"t7-workout-v\d+", sw_code):
    print("FAILED: sw.js does not contain expected CACHE_NAME pattern (t7-workout-v...)")
    sys.exit(1)

# Check data files
data_files = [
    "js/data/taxonomy.js"
]
for df in data_files:
    try:
        with open(df, "r", encoding="utf-8") as f:
            c = f.read()
            if c.count('{') != c.count('}'):
                print(f"FAILED: Mismatched braces in {df}")
                sys.exit(1)
            if c.count('(') != c.count(')'):
                print(f"FAILED: Mismatched parentheses in {df}")
                sys.exit(1)
            if c.count('[') != c.count(']'):
                print(f"FAILED: Mismatched brackets in {df}")
                sys.exit(1)
    except Exception as e:
        print(f"FAILED: Cannot read {df}: {e}")
        sys.exit(1)

# Check all js/data/sources modular files exist and have balanced delimiters
sources_files = [
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
    "js/knowledge-base.js"
]

for sf in sources_files:
    try:
        with open(sf, "r", encoding="utf-8") as f:
            c = f.read()
            if c.count('{') != c.count('}'):
                print(f"FAILED: Mismatched braces in {sf}")
                sys.exit(1)
            if c.count('(') != c.count(')'):
                print(f"FAILED: Mismatched parentheses in {sf}")
                sys.exit(1)
            if c.count('[') != c.count(']'):
                print(f"FAILED: Mismatched brackets in {sf}")
                sys.exit(1)
    except Exception as e:
        print(f"FAILED: Cannot read {sf}: {e}")
        sys.exit(1)

# Check all js/logic modular files exist and have balanced delimiters
import glob
logic_files = [
    "js/logic/risk-analyzer.js",
    "js/logic/periodization.js",
    "js/logic/phase-builder.js",
    "js/logic/session-builder.js",
    "js/logic/exercise-formatter.js",
    "js/logic/warmup-cooldown.js",
    "js/logic/rationale-generator.js",
    "js/logic/data-persistence.js",
    "js/logic.js"
]

for lf in logic_files:
    try:
        with open(lf, "r", encoding="utf-8") as f:
            c = f.read()
            # Basic delimiter balance check
            if c.count('{') != c.count('}'):
                print(f"FAILED: Mismatched braces in {lf}")
                sys.exit(1)
            if c.count('(') != c.count(')'):
                print(f"FAILED: Mismatched parentheses in {lf}")
                sys.exit(1)
            if c.count('[') != c.count(']'):
                print(f"FAILED: Mismatched brackets in {lf}")
                sys.exit(1)
    except Exception as e:
        print(f"FAILED: Cannot read {lf}: {e}")
        sys.exit(1)

# Check all js/parser modular files exist and have balanced delimiters
parser_files = [
    "js/parser/exercise-dict.js",
    "js/parser/athlete-resolver.js",
    "js/parser/load-aggregator.js",
    "js/parser/header-mapper.js",
    "js/parser/instrument-detector.js",
    "js/parser/file-readers.js",
    "js/parser.js"
]

for pf in parser_files:
    try:
        with open(pf, "r", encoding="utf-8") as f:
            c = f.read()
            # Basic delimiter balance check
            if c.count('{') != c.count('}'):
                print(f"FAILED: Mismatched braces in {pf}")
                sys.exit(1)
            if c.count('(') != c.count(')'):
                print(f"FAILED: Mismatched parentheses in {pf}")
                sys.exit(1)
            if c.count('[') != c.count(']'):
                print(f"FAILED: Mismatched brackets in {pf}")
                sys.exit(1)
    except Exception as e:
        print(f"FAILED: Cannot read {pf}: {e}")
        sys.exit(1)

# Check all js/ui and js/views modular files exist and have balanced delimiters
ui_and_view_files = [
    "js/ui/helpers.js",
    "js/ui/favorites.js",
    "js/ui/exercise-detail-resolver.js",
    "js/ui/wizard-state.js",
    "js/ui/wizard-result-styles/01-report-shell.js",
    "js/ui/wizard-result-styles/02-progression-bibliography.js",
    "js/ui/wizard-result-styles/03-exercise-table.js",
    "js/ui/wizard-result-styles/04-exercise-overlays.js",
    "js/ui/wizard-result-styles/05-actions-toast.js",
    "js/ui/wizard-result-styles/06-responsive.js",
    "js/ui/wizard-result-styles/07-print.js",
    "js/ui/wizard-result-styles/index.js",
    "js/ui/wizard-result-builder.js",
    "js/ui/wizard-swap.js",
    "js/ui/wizard-intake.js",
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

for uf in ui_and_view_files:
    try:
        with open(uf, "r", encoding="utf-8") as f:
            c = f.read()
            if c.count('{') != c.count('}'):
                print(f"FAILED: Mismatched braces in {uf}")
                sys.exit(1)
            if c.count('(') != c.count(')'):
                print(f"FAILED: Mismatched parentheses in {uf}")
                sys.exit(1)
            if c.count('[') != c.count(']'):
                print(f"FAILED: Mismatched brackets in {uf}")
                sys.exit(1)
    except Exception as e:
        print(f"FAILED: Cannot read {uf}: {e}")
        sys.exit(1)

# Check all js/analysis and pap modular files exist and have balanced delimiters
analysis_files = [
    "js/analysis/test-registry.js",
    "js/analysis/medicine-ball-physics.js",
    "js/analysis/reactive-grid.js",
    "js/analysis/data-classifier.js",
    "js/analysis/rag-integration.js",
    "js/analysis/adaptive-ui-charts.js",
    "js/analysis/adaptive-ui-mapping.js",
    "js/analysis/adaptive-ui.js",
    "js/analysis/analysis-exporter.js",
    "js/analysis/pap/pap-integrity-validator.js",
    "js/analysis/pap/pap-stats-engine.js",
    "js/analysis/pap/pap-coach-engine.js",
    "js/analysis/pap/pap-benchmark-data.js",
    "js/analysis/pap/pap-dashboard-charts.js",
    "js/analysis/pap/pap-dashboard-tabs.js",
    "js/analysis/pap/pap-dashboard-export.js",
    "js/analysis/pap/pap-dashboard-view.js",
    "js/analysis/pap/index.js"
]

for af in analysis_files:
    try:
        with open(af, "r", encoding="utf-8") as f:
            c = f.read()
            if c.count('{') != c.count('}'):
                print(f"FAILED: Mismatched braces in {af}")
                sys.exit(1)
            if c.count('(') != c.count(')'):
                print(f"FAILED: Mismatched parentheses in {af}")
                sys.exit(1)
            if c.count('[') != c.count(']'):
                print(f"FAILED: Mismatched brackets in {af}")
                sys.exit(1)
    except Exception as e:
        print(f"FAILED: Cannot read {af}: {e}")
        sys.exit(1)

# Check RAG core files exist and have balanced delimiters
rag_files = [
    "js/rag-engine.js",
    "js/rag-worker.js",
    "js/rag-knowledge-bridge.js",
    "js/rag-ui.js"
]

for rf in rag_files:
    try:
        with open(rf, "r", encoding="utf-8") as f:
            c = f.read()
            if c.count('{') != c.count('}'):
                print(f"FAILED: Mismatched braces in {rf}")
                sys.exit(1)
            if c.count('(') != c.count(')'):
                print(f"FAILED: Mismatched parentheses in {rf}")
                sys.exit(1)
            if c.count('[') != c.count(']'):
                print(f"FAILED: Mismatched brackets in {rf}")
                sys.exit(1)
    except Exception as e:
        print(f"FAILED: Cannot read {rf}: {e}")
        sys.exit(1)

print("All syntax checks passed.")
sys.exit(0)
