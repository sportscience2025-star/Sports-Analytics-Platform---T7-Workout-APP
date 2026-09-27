import re

def deep_explore():
    with open('js/data.js', 'r', encoding='utf-8') as f:
        data_txt = f.read()
    with open('js/logic.js', 'r', encoding='utf-8') as f:
        logic_txt = f.read()

    out = []
    out.append("=== 1. MUSCLE_TAXONOMY DETAILS ===")
    tax_match = re.search(r'window\.App\.MUSCLE_TAXONOMY\s*=\s*(\{[\s\S]*?\});', data_txt)
    if tax_match:
        out.append(tax_match.group(1))

    out.append("\n=== 2. LOGIC.JS HARDCODED MUSCLE KEYWORDS & REFS ===")
    for i, line in enumerate(logic_txt.splitlines(), 1):
        if any(k in line for k in ['muscleKeywords', 'primaryMuscle', 'muscles', 'Gambe', 'Femorali', 'Quadricipiti']):
            if any(term in line for term in ['includes', 'filter', 'const', 'let', 'if']):
                out.append(f"logic.js:{i} -> {line.strip()[:130]}")

    out.append("\n=== 3. ANOMALIES & NON-STANDARD MUSCLE NAMES IN EXERCISES ===")
    sec_raw = re.findall(r'secondaryMuscles:\s*\[([^\]]+)\]', data_txt)
    musc_raw = re.findall(r'muscles:\s*\[([^\]]+)\]', data_txt)
    prim_raw = re.findall(r'primaryMuscle:\s*[\'\"]([^\'\"]+)[\'\"]', data_txt)

    all_terms = set()
    for b in sec_raw + musc_raw:
        for m in re.findall(r'[\'\"]([^\'\"]+)[\'\"]', b):
            all_terms.add(m.strip())
    for m in prim_raw:
        all_terms.add(m.strip())

    out.append("All distinct muscle terms referenced in exercises catalog:")
    for t in sorted(list(all_terms)):
        out.append(f"  - {t}")

    with open('.agents/explorer_m1_data/deep_out.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    print("Successfully generated deep_out.txt in UTF-8")

if __name__ == '__main__':
    deep_explore()
