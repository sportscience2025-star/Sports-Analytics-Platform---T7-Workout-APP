import re

def extract_athlete_from_filename(filename):
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

def is_encoded_id(name):
    if not name or not isinstance(name, str):
        return False
    return bool(re.match(r'^.+_[a-z0-9]{6,}$', name.strip(), re.IGNORECASE))

def extract_readable_name(encoded_id):
    if not encoded_id:
        return encoded_id
    parts = encoded_id.split('_')
    return parts[0].capitalize()

# Test cases
test_cases = [
    ("Mario_Rossi_2024-05-10.xlsx", "Mario Rossi"),
    ("Luca_Verdi_session_2024-05-10_backup_20240510.xlsx", "Luca Verdi"),
    ("Mario_Rossi_2024-05-10.vbt.xlsx", "Mario Rossi"),
    ("Marco_Rossi.data.final.xlsx", "Marco Rossi Final"),
    ("Riccardo_mhkuhpch00l34m.xlsx", "Riccardo Mhkuhpch00l34m"),
]

print("--- Testing extractAthleteFromFilename ---")
for fn, expected in test_cases:
    res = extract_athlete_from_filename(fn)
    print(f"Filename: '{fn}' -> Extracted: '{res}' | Expected: '{expected}'")

print("\n--- Testing isEncodedId & extractReadableName ---")
encoded_ids = ["Riccardo_mhkuhpch00l34m", "Mario_123456", "Luca_abc", "Mario Rossi"]
for eid in encoded_ids:
    is_enc = is_encoded_id(eid)
    readable = extract_readable_name(eid) if is_enc else eid
    print(f"ID: '{eid}' -> Encoded? {is_enc} | Readable: '{readable}'")
