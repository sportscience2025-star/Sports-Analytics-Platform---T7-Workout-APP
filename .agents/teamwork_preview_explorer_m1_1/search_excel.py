import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

keywords = ['export', 'excel', 'xlsx', 'sheetjs', 'exceljs', 'exporttoexcel', 'workbook', 'saveas', 'blob', 'fasi', 'fase', 'scheda']
project_dir = r'e:/Nuove App Installate/App esercizi scienze motorie'

print("--- SEARCH RESULTS ---")
for root, dirs, files in os.walk(project_dir):
    if '.agents' in root or '.git' in root or 'node_modules' in root or 'test_out' in root:
        continue
    for file in files:
        if file.endswith(('.js', '.html', '.json')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                for line_num, line in enumerate(lines, 1):
                    for kw in ['export', 'excel', 'xlsx', 'sheetjs', 'exceljs', 'exporttoexcel', 'workbook']:
                        if re.search(r'\b' + re.escape(kw) + r'\b', line, re.IGNORECASE):
                            rel_path = os.path.relpath(path, project_dir)
                            print(f"{rel_path}:{line_num} [{kw}] {line.strip()[:120]}")
