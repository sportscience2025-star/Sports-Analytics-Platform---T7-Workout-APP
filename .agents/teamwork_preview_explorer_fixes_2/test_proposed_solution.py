import re

def proposed_extract_athlete(filename):
    if not filename or not isinstance(filename, str):
        return None
    
    # Step 1: Strip file extension (case-insensitive)
    clean = re.sub(r'\.[a-zA-Z0-9]+$', '', filename)
    
    # Define custom boundaries for alphanumeric tokens:
    # A boundary is start of string (^), end of string ($), or any non-alphanumeric character ([^a-zA-Z0-9])
    # In JS: (^|[^a-zA-Z0-9]) and ($|[^a-zA-Z0-9])
    
    # Step 2: Remove dates (YYYY-MM-DD, DD-MM-YYYY, YYYY_MM_DD, DD_MM_YYYY, YYYY.MM.DD, DD.MM.YYYY)
    # 4-digit year first: YYYY[-_.]MM[-_.]DD
    clean = re.sub(r'(?:^|[^a-zA-Z0-9])\d{4}[-_.]\d{2}[-_.]\d{2}(?:$|[^a-zA-Z0-9])', ' ', clean)
    # 2-digit day first: DD[-_.]MM[-_.]YYYY
    clean = re.sub(r'(?:^|[^a-zA-Z0-9])\d{2}[-_.]\d{2}[-_.]\d{4}(?:$|[^a-zA-Z0-9])', ' ', clean)
    # 8-digit compact date: YYYYMMDD or DDMMYYYY (e.g. 20260615 or 15062026)
    clean = re.sub(r'(?:^|[^a-zA-Z0-9])(?:19|20)\d{6}(?:$|[^a-zA-Z0-9])', ' ', clean)
    clean = re.sub(r'(?:^|[^a-zA-Z0-9])\d{4}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])(?:$|[^a-zA-Z0-9])', ' ', clean)
    clean = re.sub(r'(?:^|[^a-zA-Z0-9])(?:0[1-9]|[12]\d|3[01])(?:0[1-9]|1[0-2])(?:19|20)\d{2}(?:$|[^a-zA-Z0-9])', ' ', clean)
    # Isolated 4-digit years (19xx or 20xx)
    clean = re.sub(r'(?:^|[^a-zA-Z0-9])(?:19|20)\d{2}(?:$|[^a-zA-Z0-9])', ' ', clean)
    
    # Step 3: Replace all separators (-, _, ., +, comma) with spaces
    clean = re.sub(r'[-_.,+]', ' ', clean)
    
    # Step 4: Remove metric/load patterns (e.g., 100kg, 80.5kg, 5reps, 1rm, v2, v1)
    clean = re.sub(r'\b\d+(?:\.\d+)?(?:kg|g|lb|lbs|reps?|sets?|m|s|ms|km|h|m/s|km/h|rm|v\d+)\b', ' ', clean, flags=re.IGNORECASE)
    
    # Step 5: Remove noise words dictionary (comprehensive list of technical, exercise, metric, and software terms)
    noise_words = [
        # Export / file status / generic terms
        'encoder', 'dati', 'data', 'export', 'report', 'vbt', 'test', 'tests', 'session', 'sessione',
        'allenamento', 'workout', 'scheda', 'valutazione', 'misura', 'misurazione', 'registro', 'log',
        'summary', 'riepilogo', 'backup', 'raw', 'file', 'profilo', 'profile', 'mvt', '1rm', 'load',
        'velocity', 'velocita', 'velocità', 'final', 'finale', 'copy', 'copia', 'latest', 'new', 'nuovo',
        'temp', 'tmp', 'draft', 'version', 'versione', 'ver', 'default', 'unknown', 'sconosciuto',
        # Exercise names (to isolate athlete name when filename includes exercise)
        'squat', 'panca', 'bench', 'stacco', 'deadlift', 'press', 'cmj', 'sj', 'dj', 'jump', 'salto',
        'thrust', 'rdl', 'lunge', 'affondi', 'trazioni', 'pullup', 'row', 'rematore',
        # Equipment / Brands
        'beast', 'push', 'linear', 'vitruve', 'flex', 'speedience', 'gymaware', 'chronojump'
    ]
    
    noise_pattern = r'\b(?:' + '|'.join(noise_words) + r')\b'
    clean = re.sub(noise_pattern, ' ', clean, flags=re.IGNORECASE)
    
    # Step 6: Clean extra spaces and numbers
    # Remove standalone numbers or pure alphanumeric codes leftover (like 'v2' if not caught)
    clean = re.sub(r'\b\d+\b', ' ', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    
    if not clean or re.match(r'^\d+$', clean):
        return None
        
    # Step 7: Title-case each word properly
    words = clean.split(' ')
    # Filter out single-letter noise or empty strings if necessary, but keep names like "De Luca", "Da Silva"
    formatted_words = [w.capitalize() for w in words if w]
    
    if not formatted_words:
        return None
        
    return ' '.join(formatted_words)

test_cases = [
    "Giuseppe_Garibaldi_report_15-06-2026.xlsx",
    "Marco_Rossi.data.final.xlsx",
    "Mario_Rossi_2024-05-10.xlsx",
    "Luca_Verdi_vbt_session_20260615.csv",
    "Giovanni_Bianchi_export_15_06_2026.xlsx",
    "Antonio_De_Luca_allenamento_v2.xlsx",
    "Francesco_Rinaldi_Squat_100kg_2026.xlsx",
    "Jean-Paul_Belmondo_test_15.06.2026.xlsx",
    "Mario.Rossi_backup_2026.pdf",
    "15-06-2026_report_export.xlsx" # Should return None
]

print("--- PROPOSED IMPLEMENTATION RESULTS ---")
for tc in test_cases:
    res = proposed_extract_athlete(tc)
    print(f"File: {tc:<45} -> Output: '{res}'")
