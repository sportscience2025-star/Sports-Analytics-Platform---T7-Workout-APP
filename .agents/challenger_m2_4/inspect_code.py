import re

with open(r"e:\Nuove App Installate\App esercizi scienze motorie\js\data-analysis.js", 'r', encoding='utf-8') as f:
    js_analysis = f.read()

cleanup_match = re.search(r'cleanup\s*\(\)\s*\{([\s\S]*?)\n\s*\}', js_analysis)
if cleanup_match:
    print("--- CLEANUP BODY ---")
    print(cleanup_match.group(1))

rsi_empty_logic = re.search(r'const canvas = document\.getElementById\(\'rsi-trials-chart\'\);[\s\S]*?canvas\.parentElement\.appendChild', js_analysis)
if rsi_empty_logic:
    print("--- RSI EMPTY LOGIC ---")
    print(rsi_empty_logic.group(0))
