import re
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    print(f"--- Checking {filepath} ---")
    for i, line in enumerate(lines):
        # Check for single quoted strings containing apostrophes like '...dell'...
        # Match pattern where single quotes are used for string delimiters, but inside there is an unescaped single quote
        # Let's find matches where a single quote is preceded by a letter and followed by a letter, inside single quoted string or js properties
        if "Retto dell'Addome" in line or "Traverso dell'Addome" in line:
            if "'Retto dell'Addome'" in line or "'Traverso dell'Addome'" in line or "dell'Addome'" in line or "dell'Anteriore'" in line:
                print(f"L{i+1}: {line.strip()}")
        # Also check general unescaped single quote patterns in JS strings
        # A simple check: search for lines containing single quotes used around strings where an unescaped apostrophe splits it
        # E.g., 'text'text'
        # Let's check using regex for property values in JS: e.g., primaryMuscle: '...', muscles: [...]
        if ("primaryMuscle:" in line or "muscles:" in line or "label:" in line) and "'" in line:
            # check if line has odd number of single quotes or bad quotes
            pass

for f in ['js/data.js']:
    check_file(f)
