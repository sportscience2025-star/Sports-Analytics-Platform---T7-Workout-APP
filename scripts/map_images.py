import re

def get_images(path):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    # find img src and nearby figcaption
    figures = re.findall(r'<figure>(.*?)</figure>', html, re.DOTALL)
    res = []
    for fig in figures:
        src_match = re.search(r'src=["\']([^"\']+)["\']', fig)
        cap_match = re.search(r'<figcaption>(.*?)</figcaption>', fig, re.DOTALL)
        src = src_match.group(1) if src_match else ''
        cap = cap_match.group(1).strip() if cap_match else ''
        res.append((cap, src))
    return res

audit_imgs = get_images('Cartella Temporanea/AUDIT 2 tentativo_PAP_28_07_2026.html')
report_imgs = get_images('Cartella Temporanea/tentativo report_PAP_28_07_2026.html')

print('AUDIT IMAGES:')
for idx, (cap, src) in enumerate(audit_imgs):
    print(f'Audit {idx}: {cap[:80]} (src len: {len(src)})')

print('\nREPORT IMAGES:')
for idx, (cap, src) in enumerate(report_imgs):
    print(f'Report {idx}: {cap[:80]} (src len: {len(src)})')
