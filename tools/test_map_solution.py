import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

tax_match = re.search(r'window\.App\.MUSCLE_TAXONOMY\s*=\s*(\{[\s\S]*?\n\s*\});', content)
tax_code = tax_match.group(1)

taxonomy = {}
category_blocks = re.findall(r"['\"](\w+)['\"]:\s*\{\s*label:\s*['\"]([^'\"]+)['\"],\s*muscles:\s*\[([^\]]+)\]\s*\}", tax_code)
for cat_key, label, muscles_raw in category_blocks:
    muscles_list = [m.strip("'\" \n") for m in muscles_raw.split(',')]
    taxonomy[cat_key] = {
        'label': label,
        'muscles': muscles_list
    }

ex_matches = re.finditer(r"\{\s*id:\s*['\"]([^'\"]+)['\"],[\s\S]*?primaryMuscle:\s*['\"]([^'\"]+)['\"][\s\S]*?muscles:\s*\[([^\]]*)\]", content)
exercises = []
for m in ex_matches:
    ex_id = m.group(1)
    pm = m.group(2)
    muscles_raw = m.group(3)
    muscles = [x.strip("'\" \n") for x in muscles_raw.split(',') if x.strip("'\" \n")]
    exercises.append({
        'id': ex_id,
        'primaryMuscle': pm,
        'muscles': muscles
    })

anatomical_map = {
    'Dentato Anteriore': ['Dentato Anteriore', 'Pettorali', 'Petto', 'Gran Dentato'],
    'Grande Rotondo': ['Grande Rotondo', 'Gran Dorsale', 'Dorso', 'Schiena'],
    'Sottospinato': ['Sottospinato', 'Cuffia dei Rotatori', 'Rotatori Esterni', 'Deltoide Posteriore', 'Spalle'],
    'Vasto Mediale': ['Vasto Mediale', 'Quadricipiti', 'Vasto Laterale', 'Retto Femorale', 'Gambe'],
    'Vasto Intermedio': ['Vasto Intermedio', 'Quadricipiti', 'Vasto Laterale', 'Retto Femorale', 'Gambe'],
    'Semitendinoso': ['Semitendinoso', 'Ischiocrurali', 'Bicipite Femorale', 'Femorali', 'Gambe'],
    'Semimembranoso': ['Semimembranoso', 'Ischiocrurali', 'Bicipite Femorale', 'Femorali', 'Gambe'],
    'Piccolo Gluteo': ['Piccolo Gluteo', 'Glutei', 'Medio Gluteo', 'Grande Gluteo'],
    'Tensore della Fascia Lata': ['Tensore della Fascia Lata', 'Glutei', 'Medio Gluteo', 'Abduttori', 'Gambe'],
    'Flessori delle Dita': ['Flessori delle Dita', 'Avambracci', 'Flessori del Polso', 'Braccia'],
    'Estensori delle Dita': ['Estensori delle Dita', 'Avambracci', 'Estensori del Polso', 'Braccia'],
    'Peronieri': ['Peronieri', 'Polpacci', 'Gastrocnemio', 'Soleo', 'Caviglie', 'Piedi'],
    'Muscoli Intrinseci del Piede': ['Muscoli Intrinseci del Piede', 'Piedi', 'Polpacci', 'Caviglie'],
    'Cuffia dei Rotatori': ['Cuffia dei Rotatori', 'Rotatori Esterni', 'Sottospinato', 'Spalle'],
    'Tricipite Brachiale (Capo Mediale)': ['Tricipite Brachiale (Capo Mediale)', 'Tricipite Brachiale', 'Tricipiti', 'Braccia'],
    'Flessori del Polso': ['Flessori del Polso', 'Avambracci', 'Braccia'],
    'Estensori del Polso': ['Estensori del Polso', 'Avambracci', 'Braccia'],
    'Obliquo Interno': ['Obliquo Interno', 'Obliquo Esterno', 'Obliqui', 'Addominali', 'Core'],
    'Quadrato dei Lumbi': ['Quadrato dei Lumbi', 'Erettori Spinali', 'Core', 'Schiena']
}

def get_exercises(filters_muscle):
    target_muscles = [filters_muscle]
    if filters_muscle in taxonomy:
        target_muscles = taxonomy[filters_muscle]['muscles']
    else:
        for group in taxonomy.values():
            if filters_muscle.lower() in group['label'].lower():
                target_muscles = group['muscles']
                break
    
    if filters_muscle in anatomical_map:
        target_muscles.extend(anatomical_map[filters_muscle])

    results = []
    for ex in exercises:
        match = False
        if ex['primaryMuscle'] in target_muscles or ex['primaryMuscle'] == filters_muscle:
            match = True
        elif any(m in target_muscles or m == filters_muscle for m in ex['muscles']):
            match = True
        elif any(filters_muscle.lower() in m.lower() or m.lower() in filters_muscle.lower() for m in [ex['primaryMuscle']] + ex['muscles']):
            match = True
            
        if match:
            results.append(ex)
    return results

all_options = list(taxonomy.keys())
for cat in taxonomy.values():
    all_options.extend(cat['muscles'])

zero_matches = []
for opt in all_options:
    res = get_exercises(opt)
    if len(res) == 0:
        zero_matches.append(opt)

print(f"Zero match count with anatomical map: {len(zero_matches)}")
if zero_matches:
    print("Zero matches:", zero_matches)
else:
    print("ALL 49 MUSCLE OPTIONS MATCH AT LEAST 1 EXERCISE!")
