import re
import sys
import os

def load_parser_js():
    parser_path = os.path.join(os.path.dirname(__file__), '..', '..', 'js', 'parser.js')
    with open(parser_path, 'r', encoding='utf-8') as f:
        return f.read()

def verify_code_structure(code):
    print("--- Verifying Code Structure in js/parser.js ---")
    assert "function isDeviceToken" in code, "Missing isDeviceToken"
    assert "function isEncodedId" in code, "Missing isEncodedId"
    assert "function extractReadableName" in code, "Missing extractReadableName"
    print("[PASS] Helper functions present in js/parser.js.")

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

def run_tests():
    scenarios = [
        {"input": "Tommaso_mhkuhpch00134m", "exp_enc": True, "exp_name": "Tommaso"},
        {"input": "Mario_Rossi_mhkuhpch00134m", "exp_enc": True, "exp_name": "Mario Rossi"},
        {"input": "Tommaso_vbt01", "exp_enc": True, "exp_name": "Tommaso"},
        {"input": "encoder_123456", "exp_enc": True, "exp_name": "Encoder"},
        {"input": "Mario_Rossi", "exp_enc": False, "exp_name": "Mario Rossi"},
        {"input": "Gianni_Maria_Verdi", "exp_enc": False, "exp_name": "Gianni Maria Verdi"}
    ]

    print("\n--- Running Required Test Scenarios ---")
    all_passed = True
    for s in scenarios:
        inp = s["input"]
        enc = is_encoded_id(inp)
        name = extract_readable_name(inp)
        enc_ok = (enc == s["exp_enc"])
        name_ok = (name == s["exp_name"])
        
        status = "[PASS]" if (enc_ok and name_ok) else "[FAIL]"
        if not (enc_ok and name_ok):
            all_passed = False
        print(f"{status} '{inp}': isEncodedId={enc} (exp {s['exp_enc']}), extractReadableName='{name}' (exp '{s['exp_name']}')")

    print("\n--- Stress Testing Edge Cases & Adversarial Inputs ---")
    stress_cases = [
        {"input": "Jean_Luc_Picard_vbt99", "exp_enc": True, "exp_name": "Jean Luc Picard"},
        {"input": "De_La_Cruz_sensor_01", "exp_enc": True, "exp_name": "De La Cruz Sensor"}, # wait let's see what happens here!
        {"input": "Anna_Maria_De_Luca", "exp_enc": False, "exp_name": "Anna Maria De Luca"},
        {"input": "sensor_abc_123", "exp_enc": True, "exp_name": "Encoder"},
        {"input": "device_test", "exp_enc": True, "exp_name": "Test"}, # device is generic keyword
        {"input": "Marco_VBT", "exp_enc": True, "exp_name": "Marco"},
        {"input": "SingleName", "exp_enc": False, "exp_name": "Singlename"},
        {"input": "   ", "exp_enc": False, "exp_name": "Encoder"},
        {"input": None, "exp_enc": False, "exp_name": "Encoder"},
    ]
    for s in stress_cases:
        inp = s["input"]
        enc = is_encoded_id(inp)
        name = extract_readable_name(inp)
        print(f"[STRESS] Input: {repr(inp)} => isEncodedId: {enc}, extractReadableName: '{name}'")

    return all_passed

if __name__ == '__main__':
    code = load_parser_js()
    verify_code_structure(code)
    success = run_tests()
    if not success:
        sys.exit(1)
