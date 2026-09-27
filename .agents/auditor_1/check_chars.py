import os
import re

test_files = [
    'test_periodization_stress.js',
    'test_regression_edge_cases.js',
    'test_adversarial_physics.js',
    'test_chart_verification.js'
]

root = 'e:/Nuove App Installate/App esercizi scienze motorie/tests'

for tf in test_files:
    path = os.path.join(root, tf)
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # check for non-ascii characters or backticks or unescaped characters
    non_ascii = [(i+1, char, ord(char)) for i, char in enumerate(content) if ord(char) > 127]
    print(f"{tf}: {len(non_ascii)} non-ASCII characters found.")
    if non_ascii:
        print(f"  First 3 non-ASCII: {non_ascii[:3]}")
