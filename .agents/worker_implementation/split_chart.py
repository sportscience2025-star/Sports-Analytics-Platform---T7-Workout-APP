import os

test_file_path = r"e:\Nuove App Installate\App esercizi scienze motorie\tests\test_chart_verification.js"
with open(test_file_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

first_line = lines[0]

# Split first_line by literal "\n" (which is backslash followed by n)
parts = first_line.split("\\n")

output_path = r"e:\Nuove App Installate\App esercizi scienze motorie\.agents\worker_implementation\split_lines.txt"
with open(output_path, "w", encoding="utf-8") as out:
    for idx, part in enumerate(parts):
        out.write(f"{idx + 1}: {part}\n")

print(f"Split into {len(parts)} parts and wrote to {output_path}")
