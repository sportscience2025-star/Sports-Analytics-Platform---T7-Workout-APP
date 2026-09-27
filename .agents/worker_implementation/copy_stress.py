import os

src_path = r"e:\Nuove App Installate\App esercizi scienze motorie\.agents\challenger_redesign_2\test_program_generation_stress.js"
dest_path = r"e:\Nuove App Installate\App esercizi scienze motorie\tests\test_periodization_stress.js"

with open(src_path, "r", encoding="utf-8") as src:
    content = src.read()

# Replace line 12 projectRoot
old_line = "const projectRoot = path.resolve(__dirname, '../../');"
new_line = "const projectRoot = path.resolve(__dirname, '../');"

if old_line in content:
    content = content.replace(old_line, new_line)
    print("Replaced projectRoot successfully.")
else:
    print("Exact old_line not found, checking...")
    import re
    content, count = re.subn(r"path\.resolve\(__dirname,\s*'\.\./\.\.'\)", "path.resolve(__dirname, '../')", content)
    print(f"Replaced {count} occurrences using regex.")

# Ensure target directory exists
os.makedirs(os.path.dirname(dest_path), exist_ok=True)

with open(dest_path, "w", encoding="utf-8") as dest:
    dest.write(content)

print(f"Copied from {src_path} to {dest_path}")
