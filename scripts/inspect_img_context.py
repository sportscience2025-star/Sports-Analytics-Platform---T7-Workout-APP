import re

for path in ['Cartella Temporanea/AUDIT 2 tentativo_PAP_28_07_2026.html', 'Cartella Temporanea/tentativo report_PAP_28_07_2026.html']:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    print('=== ' + path + ' ===')
    matches = list(re.finditer(r'<img[^>]+>', content))
    for i, m in enumerate(matches):
        start = max(0, m.start() - 300)
        end = min(len(content), m.end() + 300)
        snippet = content[start:end]
        snippet_no_img = re.sub(r'<img[^>]+>', f'[IMG {i}]', snippet)
        print(f'--- Img {i} Context ---')
        print(snippet_no_img.strip()[:400])
