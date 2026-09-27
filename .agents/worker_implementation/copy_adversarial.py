import os

src_path = r"e:\Nuove App Installate\App esercizi scienze motorie\.agents\challenger_m1_1\test_adversarial_physics.js"
dest_path = r"e:\Nuove App Installate\App esercizi scienze motorie\tests\test_adversarial_physics.js"

with open(src_path, "r", encoding="utf-8") as src:
    content = src.read()

# Replace line 8 physicsPath
old_line = "const physicsPath = path.join(__dirname, '..', '..', 'js', 'physics-engine.js');"
new_line = "const physicsPath = path.join(__dirname, '..', 'js', 'physics-engine.js');"

if old_line in content:
    content = content.replace(old_line, new_line)
    print("Replaced physicsPath successfully.")
else:
    # Let's search for similar line if not exact
    print("Exact old_line not found, checking...")
    import re
    content, count = re.subn(r"path\.join\(__dirname,\s*'\.\.',\s*'\.\.',\s*'js',\s*'physics-engine\.js'\)", "path.join(__dirname, '..', 'js', 'physics-engine.js')", content)
    print(f"Replaced {count} occurrences using regex.")

# Ensure target directory exists
os.makedirs(os.path.dirname(dest_path), exist_ok=True)

with open(dest_path, "w", encoding="utf-8") as dest:
    dest.write(content)

print(f"Copied from {src_path} to {dest_path}")
