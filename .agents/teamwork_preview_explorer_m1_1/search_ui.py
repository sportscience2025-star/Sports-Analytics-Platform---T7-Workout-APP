import sys
sys.stdout.reconfigure(encoding='utf-8')

def search_in_file(file_path):
    print(f"=== {file_path} ===")
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    for i, line in enumerate(lines, 1):
        line_lower = line.lower()
        if any(w in line_lower for w in ['export', 'excel', 'xlsx', 'sheet', 'download', 'pdf']):
            print(f"L{i}: {line.strip()[:140]}")

search_in_file(r'e:/Nuove App Installate/App esercizi scienze motorie/js/ui.js')
search_in_file(r'e:/Nuove App Installate/App esercizi scienze motorie/js/app.js')
search_in_file(r'e:/Nuove App Installate/App esercizi scienze motorie/js/logic.js')
