import os, glob

test_files = glob.glob('tests/*.js')
for tf in test_files:
    with open(tf, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    for i, line in enumerate(lines[:30]):
        if any(k in line for k in ['file:///', '\x0c', 'Sfile:', 'C:/Users', 'scratch']):
            out = f"File {tf} line {i+1}: {repr(line[:80])}"
            print(out.encode('ascii', errors='backslashreplace').decode('ascii'))
