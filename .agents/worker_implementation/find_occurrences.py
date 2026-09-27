import re

logic_path = r"e:\Nuove App Installate\App esercizi scienze motorie\js\logic.js"
with open(logic_path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.splitlines()

print("Occurrences of '_addWarmupByPhase':")
for idx, line in enumerate(lines):
    if "_addWarmupByPhase" in line:
        print(f"Line {idx+1}: {line}")

print("\nOccurrences of '_addCooldownByPhase':")
for idx, line in enumerate(lines):
    if "_addCooldownByPhase" in line:
        print(f"Line {idx+1}: {line}")

print("\nOccurrences of 'Clinico':")
for idx, line in enumerate(lines):
    if "Clinico" in line or "clinico" in line:
        # Print only if it has 'patientType' or is related to checks
        if "patientType" in line or "Clinico" in line:
            print(f"Line {idx+1}: {line}")
