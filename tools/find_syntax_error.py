import re

files = [
    'tests/test_periodization_stress.js',
    'tests/test_regression_edge_cases.js',
    'tests/test_adversarial_physics.js',
    'tests/test_chart_verification.js'
]

for tf in files:
    with open(tf, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    print(f"\nChecking {tf} ({len(lines)} lines):")
    non_ascii = []
    for i, line in enumerate(lines):
        for char in line:
            if ord(char) > 127:
                non_ascii.append((i+1, char, hex(ord(char))))
    print(f"Found {len(non_ascii)} non-ascii chars.")
    for line_num, char, h in non_ascii[:10]:
        print(f"  Line {line_num}: {char} ({h})")
