import re

def current_extract_athlete(filename):
    if not filename or not isinstance(filename, str):
        return None
    # 1. Strip extension
    clean = re.sub(r'\.[^/.]+$', '', filename)
    # 2. Date stripping
    clean = re.sub(r'\b\d{4}[-/._]\d{2}[-/._]\d{2}\b', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\b\d{2}[-/._]\d{2}[-/._]\d{4}\b', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\b\d{8}\b', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\b(19|20)\d{2}\b', '', clean, flags=re.IGNORECASE)
    # 3. Separators replacement
    clean = re.sub(r'[-_.]', ' ', clean)
    # 4. Noise replacement
    noise_regex = r'\b(encoder|dati|data|export|report|vbt|test|session|sessione|allenamento|workout|backup|raw|file|profilo|mvt|1rm|load|velocity)\b'
    clean = re.sub(noise_regex, '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\s+', ' ', clean).strip()
    if not clean or re.match(r'^\d+$', clean):
        return None
    return ' '.join([w.capitalize() for w in clean.split(' ')])

test_cases = [
    "Giuseppe_Garibaldi_report_15-06-2026.xlsx",
    "Marco_Rossi.data.final.xlsx",
    "Mario_Rossi_2024-05-10.xlsx",
    "Luca_Verdi_vbt_session_20260615.csv",
    "Giovanni_Bianchi_export_15_06_2026.xlsx",
    "Antonio_De_Luca_allenamento_v2.xlsx",
    "Francesco_Rinaldi_Squat_100kg_2026.xlsx"
]

print("--- CURRENT IMPLEMENTATION RESULTS ---")
for tc in test_cases:
    res = current_extract_athlete(tc)
    print(f"File: {tc:<45} -> Output: '{res}'")
