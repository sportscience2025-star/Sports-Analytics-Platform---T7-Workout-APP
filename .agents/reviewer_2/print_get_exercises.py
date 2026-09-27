import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/data.js', 'r', encoding='utf-8') as f:
    code = f.read()

start = code.find('getExercises = function')
print(code[start:start+2000])

