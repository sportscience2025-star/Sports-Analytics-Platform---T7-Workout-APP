import re
import json

def is_generic_athlete(name):
    if not name or not isinstance(name, str):
        return True
    lower = name.strip().lower()
    return lower in ['', 'sconosciuto', 'unknown', 'encoder', 'default']

def is_encoded_id(name):
    if not name or not isinstance(name, str):
        return False
    # /^.+_[a-z0-9]{3,}$/i.test(name.trim())
    trimmed = name.strip()
    return bool(re.match(r'^.+_[a-zA-Z0-9]{3,}$', trimmed))

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
        # if (/^[a-z0-9]{3,}$/i.test(lastPart) || parts.length > 1)
        if bool(re.match(r'^[a-zA-Z0-9]{3,}$', last_part)) or len(parts) > 1:
            name_parts = parts[:-1]

    filtered_parts = [p for p in name_parts if len(p) > 0]
    mapped_parts = [p[0].upper() + p[1:].lower() for p in filtered_parts]
    extracted = " ".join(mapped_parts).strip()

    if not extracted or is_generic_athlete(extracted):
        return "Encoder"
    return extracted

test_cases = [
    # Requirement R1 explicit examples
    {"id": "Tommaso_mhkuhpch00134m", "desc": "Single name with long token"},
    {"id": "Mario_Rossi_mhkuhpch00134m", "desc": "Multi-word name with long token"},
    {"id": "Tommaso_vbt01", "desc": "Short device token"},
    {"id": "encoder_123456", "desc": "Generic encoder token"},
    
    # Structural & Edge cases
    {"id": "", "desc": "Empty string"},
    {"id": "   ", "desc": "Whitespace string"},
    {"id": None, "desc": "Null input"},
    {"id": 12345, "desc": "Numeric input"},
    
    # Stress testing underscores & multi-word names
    {"id": "Mario_Rossi", "desc": "Multi-word name with underscore (surname ends in >2 alphanum)"},
    {"id": "Gianni_Maria_Verdi", "desc": "3-part name with underscores"},
    {"id": "Athlete_1", "desc": "Athlete with number index"},
    
    # Token format variations & special characters
    {"id": "_mhkuhpch00134m", "desc": "Leading underscore only"},
    {"id": "Tommaso_", "desc": "Trailing underscore only"},
    {"id": "Tommaso_a", "desc": "Underscore with 1-char token"},
    {"id": "Tommaso_ab", "desc": "Underscore with 2-char token"},
    {"id": "Tommaso_abc", "desc": "Underscore with 3-char token"},
    {"id": "Tommaso@Gym_mhkuhpch00134m", "desc": "Special character @ in name"},
    {"id": "Anna-Maria_mhkuhpch00134m", "desc": "Hyphenated name with token"},
    {"id": "Encoder", "desc": "Literal 'Encoder' string"},
    {"id": "UNKNOWN_123", "desc": "Generic unknown token"}
]

print("=========================================================")
print(" EMPIRICAL VERIFICATION RESULTS FOR REQUIREMENT R1 ")
print("=========================================================\n")

results = []
for idx, tc in enumerate(test_cases, 1):
    inp = tc["id"]
    is_enc = is_encoded_id(inp)
    readable = extract_readable_name(inp)
    res = {
        "index": idx,
        "desc": tc["desc"],
        "input": "None" if inp is None else repr(inp),
        "isEncodedId": is_enc,
        "extractReadableName": readable
    }
    results.append(res)
    print(f"Test #{idx}: [{tc['desc']}]")
    print(f"  Input:                {res['input']}")
    print(f"  isEncodedId():        {res['isEncodedId']}")
    print(f"  extractReadableName(): \"{res['extractReadableName']}\"")
    print("---------------------------------------------------------")

with open("test_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\nSaved raw results to test_results.json")
