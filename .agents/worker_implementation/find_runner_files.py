import os

runner_path = r"e:\Nuove App Installate\App esercizi scienze motorie\tests\runner.html"
with open(runner_path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.splitlines()
for idx, line in enumerate(lines):
    if "testFiles =" in line or "test_logic" in line or "test_periodization" in line:
        print(f"Line {idx+1}: {line}")
