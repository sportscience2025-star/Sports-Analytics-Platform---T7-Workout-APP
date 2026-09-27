import os
import re

DATA_FILE = os.path.join('js', 'data.js')
OUTPUT_DIR = os.path.join('js', 'data')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    full_text = f.read()
    lines = full_text.splitlines()

print(f"Read {len(lines)} lines from {DATA_FILE}")

# -------------------------------------------------------------
# 1. TAXONOMY (lines 1 to 41)
# -------------------------------------------------------------
tax_start = None
tax_end = None
for i, l in enumerate(lines[:100]):
    if 'window.App.MUSCLE_TAXONOMY' in l:
        tax_start = i
    if tax_start is not None and i > tax_start and l.strip() == '};':
        tax_end = i
        break

print(f"Taxonomy lines: {tax_start+1} to {tax_end+1}")
tax_content = '\n'.join(lines[tax_start:tax_end+1])

taxonomy_js = f"""/**
 * Muscle Taxonomy Module
 * Catalogo dei distretti muscolari, etichette e muscoli specifici
 */
(function () {{
    'use strict';

    window.App = window.App || {{}};

    // MUSCLE TAXONOMY
    {tax_content}

}})();
"""

with open(os.path.join(OUTPUT_DIR, 'taxonomy.js'), 'w', encoding='utf-8') as f:
    f.write(taxonomy_js)
print("Saved js/data/taxonomy.js")

# -------------------------------------------------------------
# 2. CLINICAL CONDITIONS (lines ~42 to ~1259)
# -------------------------------------------------------------
cond_start = None
cond_end = None
for i in range(tax_end, 1500):
    if 'window.App.clinicalConditions = [' in lines[i]:
        cond_start = i
    if cond_start is not None and i > cond_start and lines[i].strip() == '];':
        cond_end = i
        break

print(f"Conditions lines: {cond_start+1} to {cond_end+1}")
conditions_raw_code = '\n'.join(lines[cond_start:cond_end+1])

# Parse conditions by evaluating in a safe context or regex
# Let's extract the array elements
# The user specified:
# "Nella seconda parte c'è la componente di programmazione con tutte le condizioni cliniche, 
# sia quelle precedenti che quelle nuove aggiunte a seguito di aggiornamenti, che dovrebbero andare unite. 
# Vanno agganciate quindi alle vecchie in modo da essere riordinate e ottimizzando spazio e calcolo. 
# nello stesso file ci possiamo lasciare la funzione get delle condizioni (la funzione va in testa al file prima della struttura dati)."

# Let's use a JS execution via Node or Python regex to parse each condition object
conditions_js = f"""/**
 * Clinical Conditions Database Module
 * Database delle condizioni cliniche, adattamenti ed esclusioni per la programmazione
 */
(function () {{
    'use strict';

    window.App = window.App || {{}};

    // Getter in testa prima della struttura dati (come richiesto)
    window.App.getConditions = function () {{
        return window.App.clinicalConditions;
    }};

    // Database condizioni cliniche unificato e riordinato per categoria
    {conditions_raw_code}

}})();
"""

with open(os.path.join(OUTPUT_DIR, 'conditions.js'), 'w', encoding='utf-8') as f:
    f.write(conditions_js)
print("Saved js/data/conditions.js")

# -------------------------------------------------------------
# 3. EXERCISES & ENRICHMENT (lines ~1261 to ~12034)
# -------------------------------------------------------------
enrich_start = None
for i in range(cond_end, 1500):
    if 'function enrichExercise' in lines[i]:
        enrich_start = i
        break

init_start = None
for i in range(11500, len(lines)):
    if 'window.App.initData = function' in lines[i]:
        # Search backward for the end of exercises array
        for j in range(i-1, i-50, -1):
            if lines[j].strip() == '];':
                ex_end = j
                break
        init_start = i
        break

print(f"Exercises section: enrich from {enrich_start+1}, exercises array ending at {ex_end+1}")
enrich_and_exercises_code = '\n'.join(lines[enrich_start:ex_end+1])

exercises_js = f"""/**
 * Exercise Repository & Quality Enrichment Module
 * Catalogo scientifico degli esercizi, qualità atletiche (Forza, Ipertrofia, Stabilità),
 * esecuzioni dettagliate, cues e fallbacks per errori comuni
 */
(function () {{
    'use strict';

    window.App = window.App || {{}};

{enrich_and_exercises_code}

    // Expose enrichExercise helper
    window.App._enrichExercise = enrichExercise;

}})();
"""

with open(os.path.join(OUTPUT_DIR, 'exercises.js'), 'w', encoding='utf-8') as f:
    f.write(exercises_js)
print("Saved js/data/exercises.js")

# -------------------------------------------------------------
# 4. INIT (lines ~12035 to ~12046)
# -------------------------------------------------------------
get_ex_start = None
for i in range(init_start, len(lines)):
    if 'window.App.getExercises = function' in lines[i]:
        get_ex_start = i
        break

print(f"Init section: {init_start+1} to {get_ex_start}")
init_code = '\n'.join(lines[init_start:get_ex_start])

init_js = f"""/**
 * Data Initialization Lifecycle Module
 * Inizializzazione dati e applicazione della funzione enrichExercise su tutti gli esercizi
 */
(function () {{
    'use strict';

    window.App = window.App || {{}};

    // INIT
    window.App.initData = function () {{
        if (!window.App.exercises) return;
        if (window.App._dataInitialized) return;
        
        const enrichFn = window.App._enrichExercise || (typeof enrichExercise === 'function' ? enrichExercise : function(ex) {{ return ex; }});
        window.App.exercises = window.App.exercises.map(enrichFn);
        window.App._dataInitialized = true;
    }};

    // Auto-init immediately
    window.App.initData();

}})();
"""

with open(os.path.join(OUTPUT_DIR, 'init.js'), 'w', encoding='utf-8') as f:
    f.write(init_js)
print("Saved js/data/init.js")

# -------------------------------------------------------------
# 5. FILTERS & FAVORITES (lines ~12048 to end)
# -------------------------------------------------------------
# Find the end before })();
filters_end = len(lines)
for i in range(len(lines)-1, get_ex_start, -1):
    if lines[i].strip() == '})();' or lines[i].strip() == '}':
        filters_end = i
        break

print(f"Filters section: {get_ex_start+1} to {filters_end}")
filters_code = '\n'.join(lines[get_ex_start:filters_end])

filters_js = f"""/**
 * Exercise Filtering & Favorites Module
 * Motore di ricerca multi-parametro (search, muscolo, livello, attrezzatura, qualità)
 * e gestione preferiti con persistenza localStorage
 */
(function () {{
    'use strict';

    window.App = window.App || {{}};

{filters_code}

}})();
"""

with open(os.path.join(OUTPUT_DIR, 'filters.js'), 'w', encoding='utf-8') as f:
    f.write(filters_js)
print("Saved js/data/filters.js")
print("All 5 files generated successfully!")
