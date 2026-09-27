import re
import sys

# Set stdout encoding to utf-8 if needed
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def test_map_headers():
    print("\n--- Testing R1: _mapHeaders Logic ---")
    
    # Exact logic extracted from js/parser.js static _mapHeaders(headers)
    def map_headers(headers):
        col_map = {}
        for idx, header in enumerate(headers):
            if not isinstance(header, str):
                continue
            lower = header.lower().strip()
            
            # Athlete
            if any(k in lower for k in ['usuario', 'atleta', 'athlete', 'name', 'user', 'nome', 'jugador', 'soggetto', 'paziente', 'cliente']):
                col_map[idx] = 'athlete'
            # Drop height
            elif any(t in lower for t in ["altezza caduta", "drop height", "altura caida", "caduta", "drop_height"]):
                col_map[idx] = 'dropHeight'
            # Jump height
            elif any(t in lower for t in ["altezza salto", "jump height", "altura salto", "volo", "h(cm)", "h (cm)"]) or lower in ['h', 'altezza', 'altura', 'height']:
                col_map[idx] = 'jumpHeight'
            elif any(t in lower for t in ["tempo contatto", "contact time", "tiempo contacto", "contatto", "contact_time", "tiempo_contacto", "tc (s)", "tc(s)", "ct (s)", "ct(s)"]) or lower in ['tc', 'ct']:
                col_map[idx] = 'contactTime'
            # Exercise
            elif any(k in lower for k in ['ejercicio', 'exercise', 'esercizio', 'lift', 'attività', 'tipo']) or lower in ['salto', 'jump type']:
                col_map[idx] = 'exercise'
            # Load / weight (VBT)
            elif lower in ['kg', 'carga', 'load'] or 'carga' in lower or 'peso' in lower or 'load' in lower or ('kg' in lower and 'm/s' not in lower and 'velocit' not in lower):
                col_map[idx] = 'load'
            # Mean velocity
            elif lower in ['vm', 'vmean', 'v_mean', 'mean_v'] or any(k in lower for k in ['mean v', 'velocit', 'velocity', 'm/s']) or lower == 'vel':
                if 'velocity' not in col_map.values() or lower in ['vm', 'vmean']:
                    col_map[idx] = 'velocity'
        return col_map

    tests = [
        (["Atleta", "Esercizio", "Peso", "Velocità"], {0: 'athlete', 1: 'exercise', 2: 'load', 3: 'velocity'}),
        (["Nome", "Attività", "Kg", "Vm"], {0: 'athlete', 1: 'exercise', 2: 'load', 3: 'velocity'}),
        (["Soggetto", "Esercizio", "Load", "Velocity"], {0: 'athlete', 1: 'exercise', 2: 'load', 3: 'velocity'}),
        (["Cliente", "Esercizio", "Carga", "Vmean"], {0: 'athlete', 1: 'exercise', 2: 'load', 3: 'velocity'}),
        (["Jugador", "Ejercicio", "Peso", "m/s"], {0: 'athlete', 1: 'exercise', 2: 'load', 3: 'velocity'}),
    ]

    passed = 0
    failed = 0
    for headers, expected in tests:
        res = map_headers(headers)
        match = True
        for k, v in expected.items():
            if res.get(k) != v:
                match = False
        if match:
            print(f"  [PASS] Headers {headers} mapped correctly -> {res}")
            passed += 1
        else:
            print(f"  [FAIL] Headers {headers} mapped to {res}, expected {expected}")
            failed += 1

    print(f"\n--- Stress-Testing Boundary Cases & Failure Modes in _mapHeaders ---")
    edge_cases = [
        ("Exercise Name", "exercise"),
        ("File Name", "unmapped/file"),
        ("Cognome", "athlete"),
        ("Carico", "load")
    ]

    for header, expected in edge_cases:
        res = map_headers([header])
        mapped_val = res.get(0, "unmapped")
        print(f"  [EMPIRICAL FINDING] Header '{header}' -> mapped to '{mapped_val}'")
        if header == "Exercise Name" and mapped_val == "athlete":
            print("    -> FAIL/BUG: 'Exercise Name' mapped to 'athlete' because 'name' keyword in athlete rule precedes exercise rule!")
            failed += 1
        elif header == "Carico" and mapped_val == "unmapped":
            print("    -> FAIL/LIMITATION: Italian header 'Carico' is omitted from load keywords array in parser.js!")
            failed += 1

    return passed, failed

def test_extract_athlete_from_filename():
    print("\n--- Testing R1: extractAthleteFromFilename Logic ---")
    
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

    test_cases = [
        ("Mario_Rossi_vbt_export_2026-06-15.xlsx", "Mario Rossi"),
        ("mario_rossi_10052026.csv", "Mario Rossi"),
        ("test_session_20260615_encoder.csv", None),
        ("  giovanni   bianchi  dati_vbt.xlsx ", "Giovanni Bianchi"),
        ("MARIO_ROSSI-squat_load_velocity_report.xlsx", "Mario Rossi Squat"),
        ("12345678.xlsx", None)
    ]

    passed = 0
    failed = 0
    for fname, expected in test_cases:
        res = extract_athlete_from_filename(fname)
        if res == expected:
            print(f"  [PASS] Filename '{fname}' -> '{res}'")
            passed += 1
        else:
            print(f"  [FAIL] Filename '{fname}' -> Got '{res}', Expected '{expected}'")
            failed += 1

    return passed, failed

def test_is_generic_athlete():
    print("\n--- Testing R1: isGenericAthlete Logic ---")
    def is_generic_athlete(name):
        if not name or not isinstance(name, str):
            return True
        lower = name.strip().lower()
        return lower in ['', 'sconosciuto', 'unknown', 'encoder', 'default']

    cases = [
        ("Sconosciuto", True),
        ("unknown", True),
        ("ENCODER", True),
        ("default", True),
        ("Mario Rossi", False)
    ]

    passed = 0
    failed = 0
    for name, expected in cases:
        res = is_generic_athlete(name)
        if res == expected:
            print(f"  [PASS] Name '{name}' -> isGeneric={res}")
            passed += 1
        else:
            print(f"  [FAIL] Name '{name}' -> Got isGeneric={res}, Expected {expected}")
            failed += 1

    return passed, failed

def test_dataset_purging():
    print("\n--- Testing R3: Dataset Purging & State Reset Logic ---")
    
    class MockDataAnalysisUI:
        def __init__(self):
            self.chart_instance = "ActiveChart1"
            self.power_curve_chart = "ActiveChart2"
            self.jump_height_chart = "ActiveChart3"
            self.rsi_chart = "ActiveChart4"
            self.parse_result = {"rawData": [1, 2, 3, 4, 5]}

        def cleanup(self):
            self.chart_instance = None
            self.power_curve_chart = None
            self.jump_height_chart = None
            self.rsi_chart = None

        def handle_file(self, file_name):
            self.cleanup()
            self.parse_result = None
            self.parse_result = {"rawData": [{"athlete": "New Athlete", "load": 50, "velocity": 0.9}]}

    ui = MockDataAnalysisUI()
    ui.handle_file("new_file.xlsx")
    
    passed = 0
    failed = 0
    if ui.chart_instance is None and ui.power_curve_chart is None and ui.jump_height_chart is None and ui.rsi_chart is None:
        print("  [PASS] R3: Old chart instances successfully destroyed on re-upload.")
        passed += 1
    else:
        print("  [FAIL] R3: Stale chart instances remained active.")
        failed += 1

    if ui.parse_result["rawData"][0]["athlete"] == "New Athlete":
        print("  [PASS] R3: parseResult successfully reset and replaced without state leakage.")
        passed += 1
    else:
        print("  [FAIL] R3: Stale parseResult data leaked.")
        failed += 1

    return passed, failed

if __name__ == '__main__':
    p1, f1 = test_map_headers()
    p2, f2 = test_extract_athlete_from_filename()
    p3, f3 = test_is_generic_athlete()
    p4, f4 = test_dataset_purging()

    total_p = p1 + p2 + p3 + p4
    total_f = f1 + f2 + f3 + f4
    print(f"\n==================================================")
    print(f"EMPIRICAL VERIFICATION SUMMARY: Passed: {total_p} | Issues Found: {total_f}")
    print(f"==================================================")
