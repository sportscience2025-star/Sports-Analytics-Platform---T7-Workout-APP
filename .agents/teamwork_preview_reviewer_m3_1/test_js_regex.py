import re

filename = "Mario_Rossi_2024-05-10.xlsx"
clean = re.sub(r'\.[^/.]+$', '', filename)
print("After ext strip:", clean)

# JS regex behavior simulation
# In JS \w is [a-zA-Z0-9_]. So between '_' and '2', both are \w, so \b does NOT match!
print("Matches \\b\\d{4} in '_2024'?", re.search(r'\b\d{4}', clean))

# What if line 599 (replacing _ with space) happened BEFORE line 595?
clean_fixed = re.sub(r'[-_.]', ' ', clean)
print("After replacing delimiters with space:", clean_fixed)
clean_fixed = re.sub(r'\b\d{4}[-/._]\d{2}[-/._]\d{2}\b', '', clean_fixed)
print("After stripping date:", clean_fixed)
