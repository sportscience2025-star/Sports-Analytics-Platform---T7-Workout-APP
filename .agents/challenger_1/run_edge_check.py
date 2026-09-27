import subprocess
import os
import time

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
user_data = os.path.join(os.getcwd(), 'tmp_edge_user_data')

# Run headless edge visiting tests/runner.html or index.html
cmd = [
    edge_path,
    '--headless=new',
    '--dump-dom',
    f'--user-data-dir={user_data}',
    'http://localhost:8080/tests/runner.html'
]

print("Launching Edge to check runner page output...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("DOM Output length:", len(res.stdout))
print("DOM Output snippet:\n", res.stdout[:500])
