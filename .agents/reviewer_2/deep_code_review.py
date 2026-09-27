import sys, glob, re, json

sys.stdout.reconfigure(encoding='utf-8')

print("=== STARTING COMPREHENSIVE INDEPENDENT CODE REVIEW ===")

# 1. Check JS syntax and unescaped quotes across all js files
js_files = glob.glob('js/*.js')

def check_js_syntax(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for unescaped single quotes inside single quoted strings like 'Retto dell'Addome'
    # Pattern matching single quote, words, single quote, words, single quote (without backslash escape)
    bad_quotes = []
    lines = content.splitlines()
    for i, line in enumerate(lines):
        # Look for patterns like: '... dell'...' or '... l'...'
        # Specifically match 'X dell'Y' or similar single quote strings
        matches = re.findall(r"'[^'\\]*?['\u2019][^'\\]*?'", line)
        for m in matches:
            # check if inside there is an unescaped single quote
            bad_quotes.append((i+1, line.strip()))
    return bad_quotes

print("\n--- Checking files for unescaped single quotes in JS strings ---")
for js in js_files:
    issues = check_js_syntax(js)
    if issues:
        print(f"File {js} has potential string quoting issues:")
        for line_no, text in issues[:5]:
            print(f"  Line {line_no}: {text}")
        if len(issues) > 5:
            print(f"  ... and {len(issues)-5} more.")

# 2. Check MUSCLE_TAXONOMY consistency and updated terms across exercises
print("\n--- Checking MUSCLE_TAXONOMY & Exercise database consistency ---")
with open('js/data.js', 'r', encoding='utf-8') as f:
    data_content = f.read()

# Extract taxonomy from data.js
tax_start = data_content.find('MUSCLE_TAXONOMY =')
tax_end = data_content.find('};', tax_start)
tax_str = data_content[tax_start:tax_end+2]

# Let's extract all muscles listed in MUSCLE_TAXONOMY
taxonomy_muscles = set()
for line in tax_str.splitlines():
    if 'muscles:' in line:
        # extract items in array
        arr_str = line[line.find('['):line.find(']')+1]
        # find strings
        items = re.findall(r"['\"]([^'\"]+)['\"]", arr_str)
        for it in items:
            taxonomy_muscles.add(it)

print(f"Total taxonomy muscle terms defined: {len(taxonomy_muscles)}")
print("Taxonomy terms sample:", list(taxonomy_muscles)[:10])

# Check for 'Piedi' district/group in taxonomy
if 'Feet' in tax_str or 'Piedi' in tax_str:
    print("[PASS] District 'Piedi' is present in MUSCLE_TAXONOMY.")
else:
    print("[FAIL] District 'Piedi' is MISSING in MUSCLE_TAXONOMY!")

# Check for repetitions like 'Gambe' under 'Gambe (Legs)'
if "'Gambe'" in tax_str.split('Legs')[1].split('}')[0] if 'Legs' in tax_str else False:
    print("[FAIL] Repetition 'Gambe' found under Legs in taxonomy!")
else:
    print("[PASS] Repetition 'Gambe' removed from under Legs taxonomy.")

# Check anatomical terms expansion
anatomical_checks = ['Bicipite Femorale', 'Semitendinoso', 'Semimembranoso', 'Vasto Laterale', 'Vasto Mediale', 'Vasto Intermedio', 'Retto Femorale']
missing_anat = [term for term in anatomical_checks if term not in taxonomy_muscles]
if not missing_anat:
    print("[PASS] All required anatomical muscle terms are present in taxonomy!")
else:
    print(f"[FAIL] Missing anatomical terms in taxonomy: {missing_anat}")

