import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def verify_r1():
    print("--- Verifying R1 in js/parser.js ---")
    with open('js/parser.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verify isEncodedId regex
    regex_match = re.search(r'function isEncodedId\(name\)\s*\{[^}]*return\s*/([^/]+)/i\.test', content)
    assert regex_match, "isEncodedId regex pattern not found"
    pattern = regex_match.group(1)
    print(f"isEncodedId regex pattern found: /{pattern}/i")
    assert pattern == '^.+_[a-z0-9]{3,}$', f"Regex pattern mismatch! Expected ^.+_[a-z0-9]{{3,}}$ got {pattern}"
    
    # Test JS python emulation for logic
    def is_encoded_id(name):
        if not name or not isinstance(name, str): return False
        return bool(re.search(r'^.+_[a-z0-9]{3,}$', name.strip(), re.IGNORECASE))
        
    def extract_readable_name(encoded_id):
        if not encoded_id or not isinstance(encoded_id, str): return "Encoder"
        trimmed = encoded_id.strip()
        if not trimmed: return "Encoder"
        parts = trimmed.split('_')
        name_parts = parts
        if len(parts) > 1:
            last_part = parts[-1]
            if re.search(r'^[a-z0-9]{3,}$', last_part, re.IGNORECASE) or len(parts) > 1:
                name_parts = parts[:-1]
        extracted = " ".join([p.capitalize() for p in name_parts if p]).strip()
        is_generic = not extracted or extracted.lower() in ['sconosciuto', 'unknown', 'encoder', 'default']
        return "Encoder" if is_generic else extracted

    assert is_encoded_id("Tommaso_mhkuhpch00134m") == True
    assert is_encoded_id("Mario_Rossi_mhkuhpch00134m") == True
    assert is_encoded_id("Tommaso_abc") == True
    assert is_encoded_id("Tommaso_ab") == False
    
    assert extract_readable_name("Tommaso_mhkuhpch00134m") == "Tommaso"
    assert extract_readable_name("Mario_Rossi_mhkuhpch00134m") == "Mario Rossi"
    assert extract_readable_name("Unknown_mhkuhpch00134m") == "Encoder"
    print("✅ R1 verification PASSED!")

def verify_r2():
    print("\n--- Verifying R2 in js/physics-engine.js and js/data-analysis.js ---")
    with open('js/physics-engine.js', 'r', encoding='utf-8') as f:
        pe_content = f.read()
        
    assert 'quadraticRegressionVBT' in pe_content
    # Check fvBias and Number.isFinite in quadraticRegressionVBT
    quad_block = pe_content[pe_content.find('quadraticRegressionVBT'):pe_content.find('autoSelectRegressionVBT')]
    assert 'Number.isFinite(sfvp)' in quad_block, "Number.isFinite guard missing in quadraticRegressionVBT"
    assert 'fvBias,' in quad_block, "fvBias missing from quadraticRegressionVBT return object"
    print("✅ R2 physics-engine verification PASSED!")

    with open('js/data-analysis.js', 'r', encoding='utf-8') as f:
        da_content = f.read()

    vbt_start = da_content.find('renderVBTDashboard(data, athlete, exercise)')
    vbt_end = da_content.find('renderRunningDashboard(data, athlete, exercise)')
    render_vbt_block = da_content[vbt_start:vbt_end]
    print(f"renderVBTDashboard block length: {len(render_vbt_block)}")
    assert '${sfvpDisplay}' in render_vbt_block, "sfvpDisplay missing from renderVBTDashboard"
    assert render_vbt_block.count('${reg.fvBias}') == 0, "reg.fvBias should no longer be rendered directly in renderVBTDashboard"
    print("✅ R2 data-analysis verification PASSED!")

def verify_sw():
    print("\n--- Verifying SW Cache Bump ---")
    with open('sw.js', 'r', encoding='utf-8') as f:
        sw_content = f.read()
    assert "const CACHE_NAME = 't7-workout-v18';" in sw_content, "SW cache version not bumped to v18"
    print("✅ Service Worker Cache Bump verification PASSED!")

if __name__ == '__main__':
    verify_r1()
    verify_r2()
    verify_sw()
    print("\n🎉 ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
