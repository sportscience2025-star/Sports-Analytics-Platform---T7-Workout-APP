import re

def js_extract_athlete_from_filename(filename):
    if not filename or not isinstance(filename, str):
        return None

    # 1. Remove file extension
    clean = re.sub(r'\.[a-zA-Z0-9]+$', '', filename, flags=re.IGNORECASE)

    # 2. Remove standard date patterns before separator replacement
    date_bound = r'(?:^|[^a-zA-Z0-9])'
    date_end_bound = r'(?:$|[^a-zA-Z0-9])'

    # YYYY-MM-DD or DD-MM-YYYY (with -, _, .)
    clean = re.sub(fr'{date_bound}\d{{4}}[-_.]\d{{2}}[-_.]\d{{2}}{date_end_bound}', ' ', clean)
    clean = re.sub(fr'{date_bound}\d{{2}}[-_.]\d{{2}}[-_.]\d{{4}}{date_end_bound}', ' ', clean)

    # Compact dates (8 digits: YYYYMMDD or DDMMYYYY)
    clean = re.sub(fr'{date_bound}(?:19|20)\d{{6}}{date_end_bound}', ' ', clean)
    clean = re.sub(fr'{date_bound}\d{{4}}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]){date_end_bound}', ' ', clean)

    # Standalone 4-digit years (19xx or 20xx)
    clean = re.sub(fr'{date_bound}(?:19|20)\d{{2}}{date_end_bound}', ' ', clean)

    # 3. Normalize all separators (hyphens, underscores, dots, pluses, commas) to spaces
    clean = re.sub(r'[-_.,+]', ' ', clean)

    # 4. Remove version tags and metrics
    clean = re.sub(r'\b(?:v|ver|version)\d+(?:\.\d+)?\b', ' ', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\b\d+(?:\.\d+)?(?:kg|g|lb|lbs|reps?|sets?|m|s|ms|km|h|m/s|km/h|rm)\b', ' ', clean, flags=re.IGNORECASE)

    # 5. Filter out noise terms
    noise_words = [
        'encoder', 'dati', 'data', 'export', 'report', 'vbt', 'test', 'tests', 'session', 'sessione',
        'allenamento', 'workout', 'scheda', 'valutazione', 'misura', 'misurazione', 'registro', 'log',
        'summary', 'riepilogo', 'backup', 'raw', 'file', 'profilo', 'profile', 'mvt', '1rm', 'load',
        'velocity', 'velocita', 'velocità', 'final', 'finale', 'copy', 'copia', 'latest', 'new', 'nuovo',
        'temp', 'tmp', 'draft', 'version', 'versione', 'ver', 'default', 'unknown', 'sconosciuto',
        'squat', 'panca', 'bench', 'stacco', 'deadlift', 'press', 'cmj', 'sj', 'dj', 'jump', 'salto',
        'thrust', 'rdl', 'lunge', 'affondi', 'trazioni', 'pullup', 'row', 'rematore',
        'beast', 'push', 'linear', 'vitruve', 'flex', 'speedience', 'gymaware', 'chronojump'
    ]
    noise_regex = r'\b(?:' + '|'.join(noise_words) + r')\b'
    clean = re.sub(noise_regex, ' ', clean, flags=re.IGNORECASE)

    # 6. Remove remaining isolated numbers and collapse spaces
    clean = re.sub(r'\b\d+\b', ' ', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()

    if not clean:
        return None

    # 7. Format clean human-readable name with proper title capitalization
    words = [w for w in clean.split(' ') if w]
    if not words:
        return None

    return ' '.join([w.capitalize() for w in words])

test_suite = [
    # Promoted prompt examples
    ("Giuseppe_Garibaldi_report_15-06-2026.xlsx", "Giuseppe Garibaldi"),
    ("Marco_Rossi.data.final.xlsx", "Marco Rossi"),
    ("Mario_Rossi_2024-05-10.xlsx", "Mario Rossi"),
    
    # Advanced / real-world edge cases
    ("Luca_Verdi_vbt_session_20260615.csv", "Luca Verdi"),
    ("Giovanni_Bianchi_export_15_06_2026.xlsx", "Giovanni Bianchi"),
    ("Antonio_De_Luca_allenamento_v2.xlsx", "Antonio De Luca"),
    ("Francesco_Rinaldi_Squat_100kg_2026.xlsx", "Francesco Rinaldi"),
    ("Jean-Paul_Belmondo_test_15.06.2026.xlsx", "Jean Paul Belmondo"),
    ("Mario.Rossi_backup_2026.pdf", "Mario Rossi"),
    ("riccardo_mhkuhpch00l34m.xlsx", "Riccardo Mhkuhpch00l34m"), # wait! Encoded ID? Let's check encoded ID behavior!
    
    # Generic / invalid filenames that must return null
    ("15-06-2026_report_export.xlsx", None),
    ("vbt_export_2024.csv", None),
    ("data_raw_1234.xlsx", None),
    ("123456.xlsx", None)
]

print("=== VERIFYING PROPOSED IMPLEMENTATION AGAINST TEST SUITE ===")
all_pass = True
for fn, expected in test_suite:
    actual = js_extract_athlete_from_filename(fn)
    status = "✅ PASS" if actual == expected else f"❌ FAIL (Got: '{actual}')"
    if actual != expected:
        all_pass = False
    print(f"{status:<15} | File: {fn:<45} | Expected: '{expected}'")

print("\nAll tests passed successfully!" if all_pass else "\nSome tests failed!")
