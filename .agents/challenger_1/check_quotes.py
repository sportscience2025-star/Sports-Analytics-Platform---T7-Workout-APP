import os

DATA_JS = r"e:\Nuove App Installate\App esercizi scienze motorie\js\data.js"

with open(DATA_JS, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- SEARCHING FOR UNESCAPED SINGLE QUOTES IN DATA.JS ---")
for i, line in enumerate(lines, 1):
    if "dell'Addome" in line or "dell'addome" in line:
        print(f"L{i}: {line.strip()[:110]}")
