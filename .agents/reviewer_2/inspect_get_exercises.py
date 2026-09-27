import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/data.js', 'r', encoding='utf-8') as f:
    data_code = f.read()

with open('js/app.js', 'r', encoding='utf-8') as f:
    app_code = f.read()

print("=== Searching getExercises ===")
for fname, code in [('js/data.js', data_code), ('js/app.js', app_code)]:
    start = code.find('getExercises')
    if start != -1:
        print(f"Found in {fname}:")
        print(code[start:start+1200])

