import sys, glob, re

sys.stdout.reconfigure(encoding='utf-8')

def check_file(filepath):
    print(f"=== Checking {filepath} ===")
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        # Check for single quoted strings containing unescaped apostrophes
        # e.g. 'Retto dell'Addome' or 'Traverso dell'Addome'
        if "'Retto dell'Addome'" in line or "'Traverso dell'Addome'" in line or "'Capo Lungo'" in line or "'Capo Breve'" in line:
            print(f"Line {i+1}: {line.strip()}")

check_file('js/data.js')
check_file('js/knowledge-base.js')
