import subprocess
import re
import json

edge_cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless',
    '--disable-gpu',
    '--dump-dom',
    r'e:\Nuove App Installate\App esercizi scienze motorie\tests\test_m1_2_empirical.html'
]

res = subprocess.run(edge_cmd, capture_output=True, encoding='utf-8', errors='replace', timeout=15)
dom = res.stdout

start_str = '<div id="results">'
end_str = '</div>'

if start_str in dom:
    idx1 = dom.find(start_str) + len(start_str)
    idx2 = dom.find(end_str, idx1)
    content = dom[idx1:idx2]
    print("Found content length:", len(content))
    with open('test_results_output.json', 'w', encoding='utf-8') as f:
        f.write(content)
    
    try:
        data = json.loads(content)
        print(f"Passed: {data['testsPassed']} | Failed: {data['testsFailed']}")
        for d in data['details']:
            print(f"[{d['status']}] {d['name']}")
            if d['status'] == 'FAIL':
                print(f"    Details: {d['details']}")
    except Exception as e:
        print("JSON parse error:", e)
else:
    print("Could not find div id=results")
