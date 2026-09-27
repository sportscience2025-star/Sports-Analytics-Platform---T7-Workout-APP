import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's map specific exercises to newly introduced anatomical terms to ensure complete database records mapping
# For example:
# - Squat, Leg Extension, Leg Press -> Vasto Mediale, Vasto Intermedio
# - Stacco, RDL, Leg Curl -> Semitendinoso, Semimembranoso
# - Push-up, Dip, Overhead Press -> Dentato Anteriore
# - Lat Pulldown, Pull-up, Rematore -> Grande Rotondo
# - Face Pull, External Rotation -> Sottospinato, Cuffia dei Rotatori
# - Clamshell, Monster Walk -> Piccolo Gluteo, Tensore della Fascia Lata
# - Wrist Curl, Farmer Carry -> Flessori del Polso, Flessori delle Dita
# - Reverse Wrist Curl -> Estensori del Polso, Estensori delle Dita
# - Calf Raise, Monopodalic balance -> Peronieri, Muscoli Intrinseci del Piede
# - Russian Twist, Side Plank, Pallof Press -> Obliquo Interno, Quadrato dei Lumbi
# - Pushdown, Dips, Close Grip Bench -> Tricipite Brachiale (Capo Mediale)

# Let's check how many exercises currently match each of the 19 terms directly
terms_to_check = [
    'Dentato Anteriore', 'Grande Rotondo', 'Sottospinato', 'Vasto Mediale', 
    'Vasto Intermedio', 'Semitendinoso', 'Semimembranoso', 'Piccolo Gluteo', 
    'Tensore della Fascia Lata', 'Flessori delle Dita', 'Estensori delle Dita', 
    'Peronieri', 'Muscoli Intrinseci del Piede', 'Cuffia dei Rotatori', 
    'Tricipite Brachiale (Capo Mediale)', 'Flessori del Polso', 'Estensori del Polso', 
    'Obliquo Interno', 'Quadrato dei Lumbi'
]

print("Starting term enrichment check...")
