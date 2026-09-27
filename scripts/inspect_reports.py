import re

for path in ['Cartella Temporanea/AUDIT 2 tentativo_PAP_28_07_2026.html', 'Cartella Temporanea/tentativo report_PAP_28_07_2026.html']:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    print('=== ' + path + ' ===')
    imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content)
    for i, src in enumerate(imgs):
        print(f'  Img {i}: len={len(src)} preview={src[:60]}...')
