import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/logic.js', 'r', encoding='utf-8') as f:
    logic_code = f.read()

with open('js/app.js', 'r', encoding='utf-8') as f:
    app_code = f.read()

print("=== js/logic.js filter logic ===")
start = logic_code.find('filterExercises')
if start == -1:
    start = logic_code.find('filter')
print(logic_code[start:start+1000])

print("\n=== js/app.js filter logic ===")
start = app_code.find('filter')
print(app_code[start:start+1000])
