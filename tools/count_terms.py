import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

terms = ['Dentato Anteriore', 'Grande Rotondo', 'Sottospinato', 'Vasto Mediale', 'Vasto Intermedio', 'Semitendinoso', 'Semimembranoso', 'Piccolo Gluteo', 'Tensore della Fascia Lata', 'Flessori delle Dita', 'Estensori delle Dita', 'Peronieri', 'Muscoli Intrinseci del Piede', 'Cuffia dei Rotatori', 'Tricipite Brachiale (Capo Mediale)', 'Flessori del Polso', 'Estensori del Polso', 'Obliquo Interno', 'Quadrato dei Lumbi']

for t in terms:
    count = content.count(t)
    print(f"Term '{t}': appears {count} times in js/data.js")
