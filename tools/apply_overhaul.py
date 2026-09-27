import re, os

print("Starting taxonomy and data overhaul script...")

# 1. Update js/data.js
with open('js/data.js', 'r', encoding='utf-8') as f:
    data_content = f.read()

# Replace MUSCLE_TAXONOMY definition
old_tax_pattern = r"window\.App\.MUSCLE_TAXONOMY\s*=\s*\{[\s\S]*?\};"
new_tax = """window.App.MUSCLE_TAXONOMY = {
        'Chest': {
            label: 'Pettorali (Chest)',
            muscles: ['Pettorale Maggiore (Capo Clavicolare)', 'Pettorale Maggiore (Capo Sternocostale)', 'Pettorale Minore', 'Dentato Anteriore']
        },
        'Back': {
            label: 'Schiena / Dorso (Back)',
            muscles: ['Gran Dorsale', 'Trapezio (Superiore)', 'Trapezio (Medio/Inferiore)', 'Romboidi', 'Erettori Spinali', 'Grande Rotondo', 'Sottospinato']
        },
        'Legs': {
            label: 'Gambe / Arti Inferiori (Legs)',
            muscles: ['Vasto Laterale', 'Vasto Mediale', 'Vasto Intermedio', 'Retto Femorale', 'Bicipite Femorale', 'Semitendinoso', 'Semimembranoso', 'Grande Gluteo', 'Medio Gluteo', 'Piccolo Gluteo', 'Gastrocnemio', 'Soleo', 'Adduttori', 'Tensore della Fascia Lata']
        },
        'Feet': {
            label: 'Piedi e Caviglie (Feet & Ankles)',
            muscles: ['Tibiale Anteriore', 'Flessori delle Dita', 'Estensori delle Dita', 'Peronieri', 'Muscoli Intrinseci del Piede']
        },
        'Shoulders': {
            label: 'Spalle / Deltoidi (Shoulders)',
            muscles: ['Deltoide Anteriore', 'Deltoide Laterale', 'Deltoide Posteriore', 'Cuffia dei Rotatori']
        },
        'Arms': {
            label: 'Braccia (Arms)',
            muscles: ['Bicipite Brachiale (Capo Lungo)', 'Bicipite Brachiale (Capo Breve)', 'Brachiale', 'Brachioradiale', 'Tricipite Brachiale (Capo Lungo)', 'Tricipite Brachiale (Capo Laterale)', 'Tricipite Brachiale (Capo Mediale)', 'Flessori del Polso', 'Estensori del Polso']
        },
        'Core': {
            label: 'Core / Addome (Core)',
            muscles: ['Retto dell\'Addome', 'Obliquo Esterno', 'Obliquo Interno', 'Traverso dell\'Addome', 'Quadrato dei Lumbi']
        }
    };"""

data_content = re.sub(old_tax_pattern, new_tax, data_content)

# Clean anomalies globally in data_content
data_content = data_content.replace('"Flessori dell"', '"Flessori dell\'Anca"')
data_content = data_content.replace("'Flessori dell'", "'Flessori dell\'Anca'")
data_content = data_content.replace('"Tricep (Capo Lungo)"', '"Tricipite Brachiale (Capo Lungo)"')
data_content = data_content.replace("'Tricep (Capo Lungo)'", "'Tricipite Brachiale (Capo Lungo)'")
data_content = data_content.replace('"Deltoide Anteriore/Laterale"', '"Deltoide Anteriore", "Deltoide Laterale"')
data_content = data_content.replace("'Deltoide Anteriore/Laterale'", "'Deltoide Anteriore', 'Deltoide Laterale'")
data_content = data_content.replace('"Trapezio Medio/Inferiore"', '"Trapezio (Medio/Inferiore)"')
data_content = data_content.replace("'Trapezio Medio/Inferiore'", "'Trapezio (Medio/Inferiore)'")

# Now overhaul exercise catalog primaryMuscle and muscles tags
start_idx = data_content.find('window.App.exercises = [')
end_idx = data_content.find('if (!window.App.exercises) return;')
ex_section = data_content[start_idx:end_idx]

def transform_block(block):
    id_m = re.search(r"id:\s*['\"]([^'\"]+)['\"]", block)
    name_m = re.search(r"name:\s*['\"]([^'\"]+)['\"]", block)
    prim_m = re.search(r"primaryMuscle:\s*['\"]([^'\"]+)['\"]", block)
    musc_m = re.search(r"muscles:\s*\[([^\]]*)\]", block)
    
    if not (id_m and name_m and prim_m):
        return block
        
    ex_id = id_m.group(1)
    name = name_m.group(1)
    old_prim = prim_m.group(1)
    
    n_lower = name.lower()
    p_lower = old_prim.lower()
    
    new_prim = old_prim
    macro = 'Gambe'
    
    if p_lower in ['petto']:
        macro = 'Petto'
        if any(w in n_lower for w in ['inclin', 'alto', 'upper']):
            new_prim = 'Pettorale Maggiore (Capo Clavicolare)'
        elif any(w in n_lower for w in ['dip', 'declin', 'basso', 'lower']):
            new_prim = 'Pettorale Maggiore (Capo Sternocostale)'
        else:
            new_prim = 'Pettorale Maggiore (Capo Sternocostale)'
    elif p_lower in ['schiena', 'gran dorsale']:
        macro = 'Schiena'
        if any(w in n_lower for w in ['lat', 'pull-up', 'pulldown', 'trazioni', 'pullover']):
            new_prim = 'Gran Dorsale'
        elif any(w in n_lower for w in ['shrug', 'scroll', 'trapez']):
            new_prim = 'Trapezio (Superiore)'
        elif any(w in n_lower for w in ['face pull', 'rear', 'romboid']):
            new_prim = 'Trapezio (Medio/Inferiore)'
        elif any(w in n_lower for w in ['deadlift', 'stacco', 'hyperextension', 'good morning', 'erettor', 'rack pull']):
            new_prim = 'Erettori Spinali'
        elif any(w in n_lower for w in ['row', 'remat', 't-bar']):
            new_prim = 'Gran Dorsale'
        else:
            new_prim = 'Gran Dorsale'
    elif p_lower in ['spalle']:
        macro = 'Spalle'
        if any(w in n_lower for w in ['latera', 'alzat', 'side']):
            new_prim = 'Deltoide Laterale'
        elif any(w in n_lower for w in ['rear', 'posterio', 'reverse fly', 'face pull', 'croci invers']):
            new_prim = 'Deltoide Posteriore'
        elif any(w in n_lower for w in ['rotat', 'cuff', 'externa', 'rotaz']):
            new_prim = 'Cuffia dei Rotatori'
        else:
            new_prim = 'Deltoide Anteriore'
    elif p_lower in ['braccia', 'tricipiti', 'bicipiti']:
        macro = 'Braccia'
        if any(w in n_lower for w in ['tricep', 'pushdown', 'french', 'skull', 'dip', 'close grip', 'kickback', 'pin press', 'jm press']):
            if any(w in n_lower for w in ['overhead', 'french', 'skull', 'lungo']):
                new_prim = 'Tricipite Brachiale (Capo Lungo)'
            else:
                new_prim = 'Tricipite Brachiale (Capo Laterale)'
        elif any(w in n_lower for w in ['hammer', 'brachiorad', 'revers']):
            new_prim = 'Brachioradiale'
        elif any(w in n_lower for w in ['preacher', 'scott', 'concentr', 'breve', 'spider']):
            new_prim = 'Bicipite Brachiale (Capo Breve)'
        else:
            new_prim = 'Bicipite Brachiale (Capo Lungo)'
    elif p_lower in ['gambe', 'femorali', 'glutei', 'polpacci']:
        macro = 'Gambe'
        if any(w in n_lower for w in ['tibial', 'piede', 'cavigli', 'airex', 'monopodalico', 'propriocez']):
            new_prim = 'Tibiale Anteriore'
            macro = 'Piedi'
        elif any(w in n_lower for w in ['calf', 'polpac', 'donkey', 'pogo', 'jump rope']):
            if 'seated' in n_lower or 'seduto' in n_lower:
                new_prim = 'Soleo'
            else:
                new_prim = 'Gastrocnemio'
        elif any(w in n_lower for w in ['leg curl', 'nordic', 'hamstring', 'rumeno', 'rdl', 'stacco rumeno']):
            new_prim = 'Bicipite Femorale'
        elif any(w in n_lower for w in ['hip thrust', 'glut', 'bridge', 'ponte', 'kickback', 'frog']):
            new_prim = 'Grande Gluteo'
        elif any(w in n_lower for w in ['abduzi', 'clam', 'monster', 'medio gluteo']):
            new_prim = 'Medio Gluteo'
        elif any(w in n_lower for w in ['addutt', 'adduct']):
            new_prim = 'Adduttori'
        elif any(w in n_lower for w in ['extension']):
            new_prim = 'Retto Femorale'
        else:
            new_prim = 'Vasto Laterale'
    elif p_lower in ['core']:
        macro = 'Core'
        if any(w in n_lower for w in ['obliq', 'woodchopper', 'russian', 'torsion', 'side plank', 'copenhagen']):
            new_prim = 'Obliquo Esterno'
        elif any(w in n_lower for w in ['rollout', 'wheel', 'dragon', 'plank', 'vacuum', 'travers', 'pallof']):
            new_prim = 'Traverso dell\'Addome'
        else:
            new_prim = 'Retto dell\'Addome'

    # Replace primaryMuscle string in block
    new_block = re.sub(r"primaryMuscle:\s*['\"][^'\"]+['\"]", f"primaryMuscle: '{new_prim}'", block)
    
    # Update muscles array in block to ensure dual-layer tagging
    if musc_m:
        current_musc_str = musc_m.group(1)
        # Parse items
        items = [x.strip().strip("'\"") for x in current_musc_str.split(',') if x.strip()]
        # Add new_prim and macro if not present
        if new_prim not in items:
            items.insert(0, new_prim)
        if macro not in items:
            items.append(macro)
        if old_prim not in items and old_prim:
            items.append(old_prim)
        new_musc_str = ", ".join([f"'{it}'" for it in items])
        new_block = re.sub(r"muscles:\s*\[[^\]]*\]", f"muscles: [{new_musc_str}]", new_block)
        
    return new_block

# Process all blocks
new_ex_section = re.sub(r"(\{\s*id:\s*['\"][^'\"]+['\"][\s\S]*?\n\s*\})", lambda m: transform_block(m.group(1)), ex_section)
data_content = data_content[:start_idx] + new_ex_section + data_content[end_idx:]

# Also update getExercises in data.js to handle taxonomy category keys & macro groups
get_ex_pattern = r"// 2\. Body Part \(Muscle\)[\s\S]*?results = results\.filter\(ex =>[\s\S]*?\);[\s\S]*?\}"
new_get_ex_filter = """// 2. Body Part (Muscle)
            if (filters.muscle && filters.muscle !== 'all') {
                const tax = window.App.MUSCLE_TAXONOMY || {};
                let targetMuscles = [filters.muscle];
                
                if (tax[filters.muscle]) {
                    targetMuscles = tax[filters.muscle].muscles;
                } else {
                    for (const group of Object.values(tax)) {
                        if (group.label.toLowerCase().includes(filters.muscle.toLowerCase())) {
                            targetMuscles = group.muscles;
                            break;
                        }
                    }
                }
                
                results = results.filter(ex =>
                    targetMuscles.includes(ex.primaryMuscle) ||
                    ex.primaryMuscle === filters.muscle ||
                    (ex.muscles && ex.muscles.some(m => targetMuscles.includes(m) || m === filters.muscle))
                );
            }"""

data_content = re.sub(r"// 2\. Body Part \(Muscle\)[\s\S]*?results\.filter\(ex =>[\s\S]*?\);\n\s*\}", new_get_ex_filter, data_content)

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(data_content)

print("Updated js/data.js successfully.")

# 2. Update js/logic.js
with open('js/logic.js', 'r', encoding='utf-8') as f:
    logic_content = f.read()

logic_content = logic_content.replace(
    "const muscleKeywords = ['Petto', 'Schiena', 'Gambe', 'Spalle', 'Braccia', 'Core', 'Glutei', 'Polpacci', 'Cardio', 'Mobilità', 'Allungamento'];",
    "const muscleKeywords = ['Petto', 'Schiena', 'Gambe', 'Spalle', 'Braccia', 'Core', 'Glutei', 'Polpacci', 'Piedi', 'Cardio', 'Mobilità', 'Allungamento'];"
)

with open('js/logic.js', 'w', encoding='utf-8') as f:
    f.write(logic_content)

print("Updated js/logic.js successfully.")

# 3. Update js/ui.js
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_content = f.read()

ui_content = ui_content.replace(
    "if (group.sub.includes(selectedMuscle)) {",
    "if ((group.muscles && group.muscles.includes(selectedMuscle)) || (group.sub && group.sub.includes(selectedMuscle))) {"
)

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui_content)

print("Updated js/ui.js successfully.")

# 4. Update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw_content = f.read()

sw_content = sw_content.replace("const CACHE_NAME = 't7-workout-v29';", "const CACHE_NAME = 't7-workout-v30';")

with open('sw.js', 'w', encoding='utf-8') as f:
    sw_content = f.write(sw_content)

print("Updated sw.js successfully.")
