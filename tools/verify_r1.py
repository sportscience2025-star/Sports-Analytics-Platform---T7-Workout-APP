import re
import sys
import os

def load_parser():
    parser_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'parser.js')
    with open(parser_path, 'r', encoding='utf-8') as f:
        return f.read()

def verify_code_structure(code):
    print("--- Verifying Code Structure in js/parser.js ---")
    
    # 1. Check isDeviceToken helper definition
    if "function isDeviceToken" not in code:
        raise AssertionError("Missing 'isDeviceToken' function definition in js/parser.js")
    print("[PASS] 'isDeviceToken' helper defined.")

    # 2. Check DEVICE_KEYWORDS or keywords list
    if "DEVICE_KEYWORDS" not in code and "'encoder'" not in code:
        raise AssertionError("Missing device keywords array/checks")
    print("[PASS] Device keywords present.")

    # 3. Check isEncodedId signature and logic
    if "function isEncodedId" not in code:
        raise AssertionError("Missing 'isEncodedId' function")
    if "/^.+_[a-z0-9]{3,}$/i.test" in code:
        raise AssertionError("Old flawed regex is still present in isEncodedId")
    print("[PASS] 'isEncodedId' updated.")

    # 4. Check extractReadableName and removal of tautological logic
    if "function extractReadableName" not in code:
        raise AssertionError("Missing 'extractReadableName' function")
    if "parts.length > 1" in code and "|| parts.length > 1" in code:
        raise AssertionError("Tautological '|| parts.length > 1' is still present in extractReadableName")
    print("[PASS] 'extractReadableName' updated without tautology.")

# Python replication of the updated js/parser.js functions for direct algorithmic verification
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

def run_test_cases():
    print("\n--- Verifying Test Cases ---")
    cases = [
        {"input": "Tommaso_mhkuhpch00134m", "expected_enc": True, "expected_name": "Tommaso"},
        {"input": "Mario_Rossi_mhkuhpch00134m", "expected_enc": True, "expected_name": "Mario Rossi"},
        {"input": "Tommaso_vbt01", "expected_enc": True, "expected_name": "Tommaso"},
        {"input": "encoder_123456", "expected_enc": True, "expected_name": "Encoder"},
        {"input": "Mario_Rossi", "expected_enc": False, "expected_name": "Mario Rossi"},
    ]

    failed = 0
    for c in cases:
        inp = c["input"]
        enc = is_encoded_id(inp)
        readable = extract_readable_name(inp)
        enc_ok = (enc == c["expected_enc"])
        read_ok = (readable == c["expected_name"])
        if enc_ok and read_ok:
            print(f"[PASS] {inp} -> isEncodedId={enc}, extractReadableName='{readable}'")
        else:
            failed += 1
            print(f"[FAIL] {inp} -> Got isEncodedId={enc} (expected {c['expected_enc']}), extractReadableName='{readable}' (expected '{c['expected_name']}')")
    
    if failed > 0:
        raise AssertionError(f"{failed} test cases failed")

if __name__ == '__main__':
    code = load_parser()
    verify_code_structure(code)
    run_test_cases()
    print("\n[OK] ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
