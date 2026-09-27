import re

with open(r"e:\Nuove App Installate\App esercizi scienze motorie\js\data-analysis.js", 'r', encoding='utf-8') as f:
    js_analysis = f.read()

idx = js_analysis.find("rsi-trials-chart")
while idx != -1:
    print(f"=== MATCH AT {idx} ===")
    print(js_analysis[max(0, idx-50):min(len(js_analysis), idx+300)])
    idx = js_analysis.find("rsi-trials-chart", idx+1)
