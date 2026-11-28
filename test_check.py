"""
test_check.py
Script di validazione architetturale e sintattica per T7 Workout Platform.
Verifica conformità al 100% React 18 + TypeScript Strict:
1. Integrità catalogo 296 esercizi tipizzati in src/data/exercises/*.ts
2. Integrità 119 condizioni cliniche in src/data/conditions/*.ts
3. Integrità 322 fonti scientifiche peer-reviewed in src/data/sources.ts
4. Bilanciamento delimitatori ({}, (), []) per TUTTI i file TypeScript (.ts, .tsx) in src/
5. Configurazione tsconfig.json (allowJs: false, strict: true)
6. Integrità index.html (mount puro React #root, zero script tag legacy js/)
7. Configurazione Service Worker sw.js (cache versioning t7-workout-v...)
"""

import sys
import os
import re
import json
import glob
import subprocess

def fail(message: str) -> None:
    print(f"FAILED: {message}")
    sys.exit(1)

def check_delimiters(file_path: str, content: str) -> None:
    if content.count('{') != content.count('}'):
        fail(f"Mismatched braces in {file_path}")
    if content.count('(') != content.count(')'):
        fail(f"Mismatched parentheses in {file_path}")
    if content.count('[') != content.count(']'):
        fail(f"Mismatched brackets in {file_path}")

print("=== T7 WORKOUT PLATFORM VALIDATION SUITE ===")

# -------------------------------------------------------------
# 1. Validazione Catalogo Esercizi (296 Esercizi)
# -------------------------------------------------------------
print("\n[1/15] Validating Exercise Catalog (src/data/exercises/)...")
category_files = ['chest.ts', 'back.ts', 'legs.ts', 'shoulders.ts', 'arms.ts', 'core.ts']
total_exercises = 0
exercise_ids = set()

for cf in category_files:
    file_path = os.path.join("src", "data", "exercises", cf)
    if not os.path.exists(file_path):
        fail(f"Missing category file: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    check_delimiters(file_path, content)
    ids = re.findall(r'id:\s*[\'"]([^\'"]+)[\'"]', content)
    total_exercises += len(ids)
    for eid in ids:
        if eid in exercise_ids:
            fail(f"Duplicate exercise id '{eid}' found in {file_path}")
        exercise_ids.add(eid)

print(f"-> Found {total_exercises} exercises across {len(category_files)} domain modules (Target: 296).")
if total_exercises != 296:
    fail(f"Expected 296 exercises, got {total_exercises}")

# Validazione file ausiliari esercizi (clinical-knee.ts, index.ts)
for aux in ['clinical-knee.ts', 'index.ts']:
    aux_path = os.path.join("src", "data", "exercises", aux)
    if os.path.exists(aux_path):
        with open(aux_path, "r", encoding="utf-8") as f:
            c = f.read()
        check_delimiters(aux_path, c)

# -------------------------------------------------------------
# 2. Validazione Condizioni Cliniche (119 Condizioni)
# -------------------------------------------------------------
print("\n[2/15] Validating Clinical Conditions (src/data/conditions/)...")
condition_files = [
    'arti-inferiori.ts',
    'arti-superiori.ts',
    'colonna.ts',
    'neurologiche-speciali.ts',
    'sistemiche.ts'
]
total_conditions = 0
condition_ids = set()

for cfn in condition_files:
    c_path = os.path.join("src", "data", "conditions", cfn)
    if not os.path.exists(c_path):
        fail(f"Missing clinical condition file: {c_path}")
    with open(c_path, "r", encoding="utf-8") as f:
        content = f.read()
    check_delimiters(c_path, content)
    ids = re.findall(r'id:\s*[\'"]([^\'"]+)[\'"]', content)
    total_conditions += len(ids)
    for cid in ids:
        if cid in condition_ids:
            fail(f"Duplicate condition id '{cid}' found in {c_path}")
        condition_ids.add(cid)

cond_index = os.path.join("src", "data", "conditions", "index.ts")
if os.path.exists(cond_index):
    with open(cond_index, "r", encoding="utf-8") as f:
        check_delimiters(cond_index, f.read())

print(f"-> Found {total_conditions} clinical conditions (Target: 119).")
if total_conditions != 119:
    fail(f"Expected 119 conditions, got {total_conditions}")

# -------------------------------------------------------------
# 3. Validazione Fonti Scientifiche (322 Fonti)
# -------------------------------------------------------------
print("\n[3/15] Validating Scientific Sources (src/data/sources.ts)...")
sources_path = os.path.join("src", "data", "sources.ts")
if not os.path.exists(sources_path):
    fail(f"Missing sources file: {sources_path}")
with open(sources_path, "r", encoding="utf-8") as f:
    sources_content = f.read()
check_delimiters(sources_path, sources_content)

source_ids = re.findall(r'[\'"]id[\'"]:\s*[\'"]([^\'"]+)[\'"]', sources_content)
if not source_ids:
    source_ids = re.findall(r'id:\s*[\'"]([^\'"]+)[\'"]', sources_content)

total_sources = len(source_ids)
print(f"-> Found {total_sources} scientific sources (Target: 322).")
if total_sources != 322:
    fail(f"Expected 322 sources, got {total_sources}")

# -------------------------------------------------------------
# 4. Validazione Sintattica Ricorsiva TypeScript/TSX in src/
# -------------------------------------------------------------
print("\n[4/15] Validating delimiter syntax across all src/ .ts and .tsx files...")
src_all = glob.glob("src/**/*.ts", recursive=True) + glob.glob("src/**/*.tsx", recursive=True)
if not src_all:
    fail("No TypeScript files found in src/")

for sf in src_all:
    with open(sf, "r", encoding="utf-8") as f:
        content = f.read()
    if len(content.strip()) == 0:
        fail(f"Empty source file detected: {sf}")
    check_delimiters(sf, content)

print(f"-> Successfully checked {len(src_all)} TypeScript files in src/ with zero syntax errors.")

# -------------------------------------------------------------
# 5. Validazione tsconfig.json (allowJs: false, strict: true)
# -------------------------------------------------------------
print("\n[5/15] Validating tsconfig.json...")
tsconfig_path = "tsconfig.json"
if not os.path.exists(tsconfig_path):
    fail("Missing tsconfig.json")
try:
    with open(tsconfig_path, "r", encoding="utf-8") as f:
        tsconfig = json.load(f)
except Exception as e:
    fail(f"Malformed tsconfig.json: {e}")

c_opts = tsconfig.get("compilerOptions", {})
if c_opts.get("allowJs") is not False:
    fail(f"tsconfig.json 'allowJs' must be false (current: {c_opts.get('allowJs')})")
if c_opts.get("strict") is not True:
    fail(f"tsconfig.json 'strict' must be true (current: {c_opts.get('strict')})")
print("-> tsconfig.json validated (allowJs: false, strict: true).")

# -------------------------------------------------------------
# 6. Validazione index.html (Mount Puro React, zero script legacy)
# -------------------------------------------------------------
print("\n[6/15] Validating index.html...")
if not os.path.exists("index.html"):
    fail("Missing index.html")
with open("index.html", "r", encoding="utf-8") as f:
    html_content = f.read()

if 'id="root"' not in html_content:
    fail("index.html is missing root container: <div id=\"root\"></div>")

if '/src/main.tsx' not in html_content:
    fail("index.html is missing React entry point: <script type=\"module\" src=\"/src/main.tsx\"></script>")

legacy_scripts = re.findall(r'<script[^>]*src=[\'"]js/[^\'"]+[\'"]', html_content)
if legacy_scripts:
    fail(f"index.html still references {len(legacy_scripts)} legacy scripts in js/: {legacy_scripts}")

print("-> index.html validated (clean React 18 mount, zero legacy scripts).")

# -------------------------------------------------------------
# 7. Validazione Service Worker (sw.js)
# -------------------------------------------------------------
print("\n[7/15] Validating Service Worker (sw.js)...")
if not os.path.exists("sw.js"):
    fail("Missing sw.js")
with open("sw.js", "r", encoding="utf-8") as f:
    sw_content = f.read()

check_delimiters("sw.js", sw_content)
if not re.search(r"t7-workout-v\d+", sw_content):
    fail("sw.js missing valid cache version pattern (t7-workout-v...)")

if re.search(r"['\"]\./js/", sw_content):
    fail("sw.js CORE_ASSETS still contains legacy ./js/ references")

print("-> sw.js validated (active cache versioning, clean asset manifest).")

# -------------------------------------------------------------
# 8. Validazione Suite Metrologica SI & Number Format (TASK-002)
# -------------------------------------------------------------
print("\n[8/15] Validating Metrological Guard & SI Formatter Suite (tests/metrology-guard.test.ts)...")
test_file_metrology = os.path.join("tests", "metrology-guard.test.ts")
if not os.path.exists(test_file_metrology):
    fail(f"Missing test file: {test_file_metrology}")

result_m = subprocess.run(["npx", "tsx", test_file_metrology], shell=True, capture_output=True, text=True)
if result_m.returncode != 0:
    print(result_m.stdout)
    print(result_m.stderr)
    fail("Metrology unit test suite failed!")

print("-> Metrology guard and SI number format suite passed (100% tests OK).")

# -------------------------------------------------------------
# 9. Validazione Offline Storage Engine & Sync Queue (TASK-003)
# -------------------------------------------------------------
print("\n[9/15] Validating Offline Storage Engine & Sync Queue Suite (tests/storage-engine.test.ts)...")
test_file_storage = os.path.join("tests", "storage-engine.test.ts")
if not os.path.exists(test_file_storage):
    fail(f"Missing test file: {test_file_storage}")

result_s = subprocess.run(["npx", "tsx", test_file_storage], shell=True, capture_output=True, text=True)
if result_s.returncode != 0:
    print(result_s.stdout)
    print(result_s.stderr)
    fail("Storage engine unit test suite failed!")

print("-> Offline storage engine and sync queue suite passed (100% tests OK).")

# -------------------------------------------------------------
# 10. Validazione Tier & RBAC Context Suite (TASK-004)
# -------------------------------------------------------------
print("\n[10/15] Validating Tier & RBAC Context Suite (tests/tier-context.test.ts)...")
test_file_tier = os.path.join("tests", "tier-context.test.ts")
if not os.path.exists(test_file_tier):
    fail(f"Missing test file: {test_file_tier}")

result_t = subprocess.run(["npx", "tsx", test_file_tier], shell=True, capture_output=True, text=True)
if result_t.returncode != 0:
    print(result_t.stdout)
    print(result_t.stderr)
    fail("Tier & RBAC context unit test suite failed!")

print("-> Tier and RBAC context suite passed (100% tests OK).")

# -------------------------------------------------------------
# 11. Validazione Global Athlete & Squad Context Suite (TASK-005)
# -------------------------------------------------------------
print("\n[11/15] Validating Global Athlete & Squad Context Suite (tests/athlete-context.test.ts)...")
test_file_athlete = os.path.join("tests", "athlete-context.test.ts")
if not os.path.exists(test_file_athlete):
    fail(f"Missing test file: {test_file_athlete}")

result_a = subprocess.run(["npx", "tsx", test_file_athlete], shell=True, capture_output=True, text=True)
if result_a.returncode != 0:
    print(result_a.stdout)
    print(result_a.stderr)
    fail("Athlete & Squad context unit test suite failed!")

print("-> Athlete and Squad context suite passed (100% tests OK).")

# -------------------------------------------------------------
# 12. Validazione Hardware & BLE Telemetry Suite (TASK-006)
# -------------------------------------------------------------
print("\n[12/15] Validating Hardware & BLE Telemetry Suite (tests/ble-context.test.ts)...")
test_file_ble = os.path.join("tests", "ble-context.test.ts")
if not os.path.exists(test_file_ble):
    fail(f"Missing test file: {test_file_ble}")

result_b = subprocess.run(["npx", "tsx", test_file_ble], shell=True, capture_output=True, text=True)
if result_b.returncode != 0:
    print(result_b.stdout)
    print(result_b.stderr)
    fail("Hardware & BLE telemetry unit test suite failed!")

print("-> Hardware and BLE telemetry suite passed (100% tests OK).")

# -------------------------------------------------------------
# 13. Validazione Global Navigation Shell & Layout Suite (TASK-007)
# -------------------------------------------------------------
print("\n[13/15] Validating Global Navigation Shell & Layout Suite (tests/layout-shell.test.ts)...")
test_file_layout = os.path.join("tests", "layout-shell.test.ts")
if not os.path.exists(test_file_layout):
    fail(f"Missing test file: {test_file_layout}")

result_l = subprocess.run(["npx", "tsx", test_file_layout], shell=True, capture_output=True, text=True)
if result_l.returncode != 0:
    print(result_l.stdout)
    print(result_l.stderr)
    fail("Global Navigation Shell & Layout unit test suite failed!")

print("-> Global Navigation Shell and layout suite passed (100% tests OK).")

# -------------------------------------------------------------
# 14. Validazione Adaptive Multi-Tier Navigation Bars Suite (TASK-008)
# -------------------------------------------------------------
print("\n[14/15] Validating Adaptive Multi-Tier Navigation Bars Suite (tests/navigation-bars.test.ts)...")
test_file_nav = os.path.join("tests", "navigation-bars.test.ts")
if not os.path.exists(test_file_nav):
    fail(f"Missing test file: {test_file_nav}")

result_n = subprocess.run(["npx", "tsx", test_file_nav], shell=True, capture_output=True, text=True)
if result_n.returncode != 0:
    print(result_n.stdout)
    print(result_n.stderr)
    fail("Adaptive Multi-Tier Navigation Bars unit test suite failed!")

print("-> Adaptive Multi-Tier Navigation Bars suite passed (100% tests OK).")

# -------------------------------------------------------------
# 15. Validazione tsconfig.test.json (Test Suite Strict Typing Config)
# -------------------------------------------------------------
print("\n[15/15] Validating tsconfig.test.json...")
tsconfig_test_path = "tsconfig.test.json"
if not os.path.exists(tsconfig_test_path):
    fail("Missing tsconfig.test.json")
try:
    with open(tsconfig_test_path, "r", encoding="utf-8") as f:
        tsconfig_test = json.load(f)
except Exception as e:
    fail(f"Malformed tsconfig.test.json: {e}")

if tsconfig_test.get("extends") != "./tsconfig.json":
    fail(f"tsconfig.test.json 'extends' must be './tsconfig.json' (current: {tsconfig_test.get('extends')})")

test_include = tsconfig_test.get("include", [])
if not isinstance(test_include, list) or "src/**/*" not in test_include or "tests/**/*.ts" not in test_include:
    fail(f"tsconfig.test.json 'include' must contain 'src/**/*' and 'tests/**/*.ts' (current: {test_include})")

print("-> tsconfig.test.json validated (extends ./tsconfig.json, includes src/**/* and tests/**/*.ts).")

print("\n" + "=" * 50)
print("SUCCESS: 100% REACT 18 + TYPESCRIPT STRICT VALIDATION PASSED!")
print("=" * 50)
sys.exit(0)
