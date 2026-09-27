import re

def test_js_parser_logic(filename):
    if not filename or not isinstance(filename, str):
        return None
    clean = re.sub(r'\.[^/.]+$', '', filename)
    clean = re.sub(r'\b\d{4}[-/._]\d{2}[-/._]\d{2}\b', '', clean)
    clean = re.sub(r'\b\d{2}[-/._]\d{2}[-/._]\d{4}\b', '', clean)
    clean = re.sub(r'\b\d{8}\b', '', clean)
    clean = re.sub(r'\b(19|20)\d{2}\b', '', clean)
    clean = re.sub(r'[-_.]', ' ', clean)
    noise_regex = r'\b(encoder|dati|data|export|report|vbt|test|session|sessione|allenamento|workout|backup|raw|file|profilo|mvt|1rm|load|velocity)\b'
    clean = re.sub(noise_regex, '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\s+', ' ', clean).strip()
    if not clean or re.match(r'^\d+$', clean):
        return None
    return ' '.join([w.capitalize() for w in clean.split(' ')])

samples = [
    "Mario_Rossi_2024-05-10.xlsx",
    "Luca_Verdi_20240510.csv",
    "Giuseppe_Garibaldi_report_15-06-2026.xlsx",
    "Marco_Bianchi.xlsx"
]

for s in samples:
    print(f"Input: {s:<45} -> Output: {test_js_parser_logic(s)}")
