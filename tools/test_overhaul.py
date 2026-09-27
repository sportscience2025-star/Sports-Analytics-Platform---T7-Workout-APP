import re, json

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's extract exercises text
start_idx = content.find('window.App.exercises = [')
end_idx = content.find('if (!window.App.exercises) return;')
ex_text = content[start_idx:end_idx]

# Pattern to find exercise blocks
# We will match individual exercise objects
blocks = re.findall(r"(\{\s*id:\s*['\"][^'\"]+['\"][\s\S]*?\n\s*\})", ex_text)
print(f"Found {len(blocks)} blocks.")

def map_exercise(block):
    id_m = re.search(r"id:\s*['\"]([^'\"]+)['\"]", block)
    name_m = re.search(r"name:\s*['\"]([^'\"]+)['\"]", block)
    prim_m = re.search(r"primaryMuscle:\s*['\"]([^'\"]+)['\"]", block)
    sec_m = re.search(r"secondaryMuscles:\s*\[([^\]]*)\]", block)
    musc_m = re.search(r"muscles:\s*\[([^\]]*)\]", block)
    
    ex_id = id_m.group(1) if id_m else ''
    name = name_m.group(1) if name_m else ''
    old_prim = prim_m.group(1) if prim_m else ''
    
    n_lower = name.lower()
    p_lower = old_prim.lower()
    
    new_prim = old_prim
    macro_group = 'Altro'
    
    # Map Chest
    if p_lower in ['petto']:
        macro_group = 'Petto'
        if any(w in n_lower for w in ['inclin', 'alto', 'upper']):
            new_prim = 'Pettorale Maggiore (Capo Clavicolare)'
        elif any(w in n_lower for w in ['dip', 'declin', 'basso', 'lower']):
            new_prim = 'Pettorale Maggiore (Capo Sternocostale)'
        else:
            new_prim = 'Pettorale Maggiore (Capo Sternocostale)'
            
    # Map Back
    elif p_lower in ['schiena', 'gran dorsale']:
        macro_group = 'Schiena'
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
            
    # Map Shoulders
    elif p_lower in ['spalle']:
        macro_group = 'Spalle'
        if any(w in n_lower for w in ['latera', 'alzat', 'side']):
            new_prim = 'Deltoide Laterale'
        elif any(w in n_lower for w in ['rear', 'posterio', 'reverse fly', 'face pull', 'croci invers']):
            new_prim = 'Deltoide Posteriore'
        elif any(w in n_lower for w in ['rotat', 'cuff', 'externa', 'rotaz']):
            new_prim = 'Cuffia dei Rotatori'
        else:
            new_prim = 'Deltoide Anteriore'
            
    # Map Arms / Bicipiti / Tricipiti
    elif p_lower in ['braccia', 'tricipiti', 'bicipiti']:
        macro_group = 'Braccia'
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
            
    # Map Legs / Femorali / Glutei / Polpacci
    elif p_lower in ['gambe', 'femorali', 'glutei', 'polpacci']:
        macro_group = 'Gambe'
        if any(w in n_lower for w in ['tibial', 'piede', 'cavigli', 'airex', 'monopodalico', 'propriocez']):
            new_prim = 'Tibiale Anteriore'
            macro_group = 'Piedi'
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
            
    # Map Core
    elif p_lower in ['core']:
        macro_group = 'Core'
        if any(w in n_lower for w in ['obliq', 'woodchopper', 'russian', 'torsion', 'side plank', 'copenhagen']):
            new_prim = 'Obliquo Esterno'
        elif any(w in n_lower for w in ['rollout', 'wheel', 'dragon', 'plank', 'vacuum', 'travers', 'pallof']):
            new_prim = 'Traverso dell\'Addome'
        else:
            new_prim = 'Retto dell\'Addome'
            
    return ex_id, name, old_prim, new_prim, macro_group

mapped = [map_exercise(b) for b in blocks]
from collections import Counter
print("New primary muscle counts:")
for k, v in Counter(m[3] for m in mapped).most_common():
    print(f"  {k}: {v}")
