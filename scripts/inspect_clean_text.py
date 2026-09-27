import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('Cartella Temporanea/REPORT_DEFINITIVO_PAP_28_07_2026.html', 'r', encoding='utf-8') as f:
    text = f.read()

# strip tags to see the actual text
clean_text = re.sub(r'<style.*?</style>', '', text, flags=re.DOTALL)
clean_text = re.sub(r'<script.*?</script>', '', clean_text, flags=re.DOTALL)
clean_text = re.sub(r'<[^>]+>', ' ', clean_text)
clean_text = re.sub(r'\s+', ' ', clean_text)

print('Clean text length:', len(clean_text))
print(clean_text[:2500])
