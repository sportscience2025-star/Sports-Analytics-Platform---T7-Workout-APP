import os
import sys
import re
import time
import json
import socketserver
import http.server
import threading
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = r'e:\Nuove App Installate\App esercizi scienze motorie'
CHROME_PATH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
PORT = 8085

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def run_server():
    os.chdir(PROJECT_ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

# Start server thread
server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()
time.sleep(1.0)

print(f"Started local HTTP server on port {PORT}")

# Run Chrome Headless to render and execute tests
cmd = [
    CHROME_PATH,
    '--headless=new',
    '--disable-gpu',
    '--dump-dom',
    f'http://localhost:{PORT}/.agents/challenger_m2_2/live_empirical_runner.html'
]

print("Executing Chrome Headless live browser verification...")
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
dom_output = res.stdout

print("\n" + "=" * 60)
print("🔬 CHROME HEADLESS LIVE DOM OUTPUT SUMMARY")
print("=" * 60)

# Extract test results from DOM output
passes = dom_output.count('[PASS]')
fails = dom_output.count('[FAIL]')

for line in dom_output.splitlines():
    if '[PASS]' in line or '[FAIL]' in line:
        clean_line = re.sub(r'<[^>]+>', ' ', line).strip()
        if clean_line:
            print(clean_line)

print("=" * 60)
print(f"LIVE BROWSER TEST SUMMARY: {passes} PASSED | {fails} FAILED")
print("=" * 60)

# Save live test results log
with open(os.path.join(PROJECT_ROOT, '.agents', 'challenger_m2_2', 'live_test_output.txt'), 'w', encoding='utf-8') as f:
    f.write(dom_output)
