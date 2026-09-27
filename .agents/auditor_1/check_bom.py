import os

test_files = [
    'test_periodization_stress.js',
    'test_regression_edge_cases.js',
    'test_adversarial_physics.js',
    'test_chart_verification.js'
]

root = 'e:/Nuove App Installate/App esercizi scienze motorie/tests'

print("--- EXAMINING TEST FILE ENCODING AND HEAD ---")
for tf in test_files:
    path = os.path.join(root, tf)
    with open(path, 'rb') as f:
        raw = f.read(50)
    print(f"\n{tf}:")
    print(f"  Raw first 20 bytes: {raw[:20]}")
    if raw.startswith(b'\xef\xbb\xbf'):
        print("  [ALERT] UTF-8 BOM DETECTED!")
    else:
        print("  [OK] No UTF-8 BOM detected.")
