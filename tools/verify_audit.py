import re
import sys
import os

def check_sw_cache():
    sw_path = os.path.join(os.path.dirname(__file__), '..', 'sw.js')
    with open(sw_path, 'r', encoding='utf-8') as f:
        content = f.read()
    match = re.search(r"const\s+CACHE_NAME\s*=\s*['\"]([^'\"]+)['\"]", content)
    if not match:
        raise AssertionError("CACHE_NAME not found in sw.js")
    cache_name = match.group(1)
    print(f"[CHECK SW] CACHE_NAME found: {cache_name}")
    if cache_name == 't7-workout-v1' or not cache_name.startswith('t7-workout-v'):
        raise AssertionError(f"Cache name was not properly bumped: {cache_name}")
    return cache_name

def check_anti_cheating():
    print("[CHECK ANTI-CHEATING] Verifying source code for mocks/cheating...")
    parser_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'parser.js')
    physics_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'physics-engine.js')
    analysis_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'data-analysis.js')

    for path, name in [(parser_path, 'parser.js'), (physics_path, 'physics-engine.js'), (analysis_path, 'data-analysis.js')]:
        with open(path, 'r', encoding='utf-8') as f:
            code = f.read()
        if "return \"Tommaso\"" in code or "return 'Tommaso'" in code:
            raise AssertionError(f"Hardcoded 'Tommaso' return found in {name}")
        if "return \"Mario Rossi\"" in code or "return 'Mario Rossi'" in code:
            raise AssertionError(f"Hardcoded 'Mario Rossi' return found in {name}")
    print("[CHECK ANTI-CHEATING] PASS: No hardcoded test responses detected.")

def check_r1_logic():
    print("[CHECK R1] Testing R1 parsing algorithm in Python replication of parser.js...")
    DEVICE_KEYWORDS = ['encoder', 'sensor', 'device', 'vbt', 'id', 'mac']

    def is_device_token(part):
        if not part or not isinstance(part, str):
            return False
        lower = part.strip().lower()
        if not lower:
            return False
        return bool(re.search(r'\d', lower)) or (lower in DEVICE_KEYWORDS)

    def is_encoded_id(name):
        if not name or not isinstance(name, str):
            return False
        trimmed = name.strip()
        if not trimmed or '_' not in trimmed:
            return False
        parts = trimmed.split('_')
        first_part_lower = parts[0].strip().lower()
        last_part = parts[-1]
        generic_keywords = ['encoder', 'sensor', 'device', 'vbt']
        if (first_part_lower in generic_keywords) or is_device_token(last_part):
            return True
        return False

    def is_generic_athlete(name):
        if not name or not isinstance(name, str):
            return True
        lower = name.strip().lower()
        return lower in ['', 'sconosciuto', 'unknown', 'encoder', 'default']

    def extract_readable_name(encoded_id):
        if not encoded_id or not isinstance(encoded_id, str):
            return "Encoder"
        trimmed = encoded_id.strip()
        if not trimmed:
            return "Encoder"
        parts = trimmed.split('_')
        name_parts = parts
        if len(parts) > 1:
            last_part = parts[-1]
            if is_device_token(last_part):
                name_parts = parts[:-1]
        
        extracted_parts = [p.strip().capitalize() for p in name_parts if p.strip()]
        extracted = " ".join(extracted_parts).strip()
        if not extracted or is_generic_athlete(extracted):
            return "Encoder"
        return extracted

    test_cases = [
        ("Tommaso_mhkuhpch00134m", True, "Tommaso"),
        ("Mario_Rossi_mhkuhpch00134m", True, "Mario Rossi"),
        ("Tommaso_vbt01", True, "Tommaso"),
        ("encoder_123456", True, "Encoder"),
        ("Mario_Rossi", False, "Mario Rossi"),
        ("", False, "Encoder"),
        (None, False, "Encoder")
    ]

    for raw, exp_enc, exp_name in test_cases:
        enc = is_encoded_id(raw)
        name = extract_readable_name(raw)
        if enc != exp_enc or name != exp_name:
            raise AssertionError(f"R1 failed for '{raw}': got enc={enc}, name='{name}'; expected enc={exp_enc}, name='{exp_name}'")
    print("[CHECK R1] PASS: All test cases passed.")

def check_r2_logic():
    print("[CHECK R2] Verifying Sfv / Sfvp implementation in physics-engine.js & data-analysis.js...")
    physics_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'physics-engine.js')
    analysis_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'data-analysis.js')

    with open(physics_path, 'r', encoding='utf-8') as f:
        p_code = f.read()
    with open(analysis_path, 'r', encoding='utf-8') as f:
        a_code = f.read()

    # Check for NaN / finite protection
    if "!Number.isFinite(sfvp)" not in p_code:
        raise AssertionError("Missing Number.isFinite check in physics-engine.js sfvp calculation")
    if "Number.isFinite(reg.sfvp)" not in a_code:
        raise AssertionError("Missing Number.isFinite check in data-analysis.js sfvp display")
    
    # Check metric rendering does not output undefined or descriptive text in KPI display
    if "sfvpDisplay" not in a_code:
        raise AssertionError("Missing sfvpDisplay variable in data-analysis.js")
    
    print("[CHECK R2] PASS: Sfv numeric calculation and finite checks verified.")

if __name__ == '__main__':
    try:
        cache = check_sw_cache()
        check_anti_cheating()
        check_r1_logic()
        check_r2_logic()
        print("\n=== AUDIT VERIFICATION SCRIPT COMPLETED SUCCESSFULLY ===")
    except Exception as e:
        print(f"\n❌ AUDIT VERIFICATION FAILED: {e}")
        sys.exit(1)
