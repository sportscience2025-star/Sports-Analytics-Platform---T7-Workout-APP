import os

test_file_path = r"e:\Nuove App Installate\App esercizi scienze motorie\tests\test_chart_verification.js"
with open(test_file_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
first_line = lines[0]
print(f"First line length: {len(first_line)}")
print(f"First line starts with: {first_line[:200]}")
print(f"First line ends with: {first_line[-200:]}")
