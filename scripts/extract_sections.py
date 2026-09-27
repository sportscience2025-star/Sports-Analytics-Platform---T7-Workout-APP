import sys, re
sys.stdout.reconfigure(encoding='utf-8')

def extract_sections(path):
    print('========================================')
    print('FILE: ' + path)
    print('========================================')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # find all headings with their following text
    parts = re.split(r'<h([1-3])[^>]*>(.*?)</h\1>', html, flags=re.DOTALL)
    print(f'Total parts: {len(parts)}')
    # parts[0] is preamble
    # then for each: parts[i] = level, parts[i+1] = heading_html, parts[i+2] = content_html
    i = 1
    while i < len(parts):
        lvl = parts[i]
        h_text = re.sub(r'<.*?>', '', parts[i+1]).strip()
        body = parts[i+2]
        clean_body = re.sub(r'<.*?>', ' ', body)
        clean_body = re.sub(r'\s+', ' ', clean_body).strip()
        print(f'{"  " * (int(lvl)-1)}H{lvl}: {h_text}')
        print(f'{"  " * (int(lvl)-1)}   Preview: {clean_body[:180]}...\n')
        i += 3

extract_sections('Cartella Temporanea/AUDIT 2 tentativo_PAP_28_07_2026.html')
extract_sections('Cartella Temporanea/tentativo report_PAP_28_07_2026.html')
