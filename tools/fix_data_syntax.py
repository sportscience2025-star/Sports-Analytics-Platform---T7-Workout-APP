import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find all occurrences of unescaped single quote strings
# Patterns like 'Retto dell'Addome' or 'Traverso dell'Addome'
replacements = [
    ("'Retto dell'Addome'", '"Retto dell\'Addome"'),
    ("'Traverso dell'Addome'", '"Traverso dell\'Addome"'),
    ("'Tensore della Fascia Lata'", '"Tensore della Fascia Lata"'), # check if needed
]

count = 0
for old, new in replacements:
    c = content.count(old)
    if c > 0:
        print(f"Replacing {c} occurrences of {old}")
        content = content.replace(old, new)
        count += c

# Let's check for any other '...dell'...' patterns in content using regex
# match ' followed by words, followed by dell' or d' or l', followed by words, followed by '
matches = set(re.findall(r"'[A-Za-z\s]*[a-z]+'[A-Za-z\s]*'", content))
print("Other potential matches:", matches)

if count > 0:
    with open('js/data.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated js/data.js successfully.")
