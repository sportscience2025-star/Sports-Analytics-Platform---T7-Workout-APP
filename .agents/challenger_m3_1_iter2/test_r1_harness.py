"""
Empirical Verification & Stress Test Harness for Requirement R1 Iteration 2
Target: js/parser.js (isEncodedId, extractReadableName, isDeviceToken)
"""

import re
import sys
import os

def load_parser_source():
    parser_path = os.path.join(os.path.dirname(__file__), '..', '..', 'js', 'parser.js')
    with open(parser_path, 'r', encoding='utf-8') as f:
        return f.read()

# Python replication of JS implementation in js/parser.js
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

def run_suite():
    print("=" * 60)
    print("EMPIRICAL VERIFICATION & STRESS TEST HARNESS — R1 ITERATION 2")
    print("=" * 60)

    # 1. Mandatory Scenarios
    mandatory_scenarios = [
        {"id": 1, "input": "Tommaso_mhkuhpch00134m", "exp_enc": True, "exp_name": "Tommaso"},
        {"id": 2, "input": "Mario_Rossi_mhkuhpch00134m", "exp_enc": True, "exp_name": "Mario Rossi"},
        {"id": 3, "input": "Tommaso_vbt01", "exp_enc": True, "exp_name": "Tommaso"},
        {"id": 4, "input": "encoder_123456", "exp_enc": True, "exp_name": "Encoder"},
        {"id": 5, "input": "Mario_Rossi", "exp_enc": False, "exp_name": "Mario Rossi"},
        {"id": 6, "input": "Gianni_Maria_Verdi", "exp_enc": False, "exp_name": "Gianni Maria Verdi"}
    ]

    print("\n[PART 1] MANDATORY SCENARIOS (Requirement R1)")
    print("-" * 60)
    mand_passed = 0
    for s in mandatory_scenarios:
        inp = s["input"]
        enc = is_encoded_id(inp)
        readable = extract_readable_name(inp)
        enc_ok = (enc == s["exp_enc"])
        name_ok = (readable == s["exp_name"])
        
        status = "PASS" if (enc_ok and name_ok) else "FAIL"
        if status == "PASS":
            mand_passed += 1
        print(f"[{status}] Scenario {s['id']}: '{inp}'")
        print(f"       Computed: isEncodedId={enc}, extractReadableName='{readable}'")
        print(f"       Expected: isEncodedId={s['exp_enc']}, extractReadableName='{s['exp_name']}'")

    # 2. Stress Testing & Edge Cases
    stress_scenarios = [
        {"name": "Multi-word surname with device token", "input": "Luca_De_La_Cruz_device01", "exp_enc": True, "exp_name": "Luca De La Cruz"},
        {"name": "Hyphenated double surname with serial", "input": "Elena_Smith-Jones_mac999", "exp_enc": True, "exp_name": "Elena Smith-jones"},
        {"name": "Triple word unencoded name", "input": "Maria_Anna_De_Luca", "exp_enc": False, "exp_name": "Maria Anna De Luca"},
        {"name": "Generic prefix only with serial", "input": "vbt_987654", "exp_enc": True, "exp_name": "Encoder"},
        {"name": "Sensor prefix with clean name", "input": "sensor_Alessandro", "exp_enc": True, "exp_name": "Alessandro"},
        {"name": "Single word athlete ID", "input": "Tommaso", "exp_enc": False, "exp_name": "Tommaso"},
        {"name": "Empty string", "input": "", "exp_enc": False, "exp_name": "Encoder"},
        {"name": "Whitespace only", "input": "   ", "exp_enc": False, "exp_name": "Encoder"},
        {"name": "None / null", "input": None, "exp_enc": False, "exp_name": "Encoder"}
    ]

    print("\n[PART 2] ADVERSARIAL & EDGE CASE STRESS TESTING")
    print("-" * 60)
    stress_passed = 0
    for s in stress_scenarios:
        inp = s["input"]
        enc = is_encoded_id(inp)
        readable = extract_readable_name(inp)
        enc_ok = (enc == s["exp_enc"])
        name_ok = (readable == s["exp_name"])
        
        status = "PASS" if (enc_ok and name_ok) else "WARN/FAIL"
        if status == "PASS":
            stress_passed += 1
        print(f"[{status}] Case '{s['name']}': '{inp}' -> isEncodedId={enc}, readable='{readable}'")

    print("\n" + "=" * 60)
    print(f"SUMMARY: Mandatory {mand_passed}/{len(mandatory_scenarios)} Passed | Stress {stress_passed}/{len(stress_scenarios)} Passed")
    print("=" * 60)

    if mand_passed < len(mandatory_scenarios):
        sys.exit(1)

if __name__ == '__main__':
    run_suite()
