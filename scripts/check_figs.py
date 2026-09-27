import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Cartella Temporanea/AUDIT 2 tentativo_PAP_28_07_2026.html', 'r', encoding='utf-8') as f:
    audit_html = f.read()

with open('Cartella Temporanea/tentativo report_PAP_28_07_2026.html', 'r', encoding='utf-8') as f:
    rep_html = f.read()

audit_figs = re.findall(r'<figure>(.*?)</figure>', audit_html, re.DOTALL)
rep_figs = re.findall(r'<figure>(.*?)</figure>', rep_html, re.DOTALL)

print(f'Audit figures found: {len(audit_figs)}')
print(f'Report figures found: {len(rep_figs)}')

for i, f in enumerate(audit_figs):
    cap = re.search(r'<figcaption>(.*?)</figcaption>', f, re.DOTALL)
    print(f'Audit Fig {i}: {cap.group(1).strip()[:100]}')

for i, f in enumerate(rep_figs):
    cap = re.search(r'<figcaption>(.*?)</figcaption>', f, re.DOTALL)
    print(f'Report Fig {i}: {cap.group(1).strip()[:100]}')
