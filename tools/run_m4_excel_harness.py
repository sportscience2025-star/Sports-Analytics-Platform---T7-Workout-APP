import http.server
import socketserver
import json
import threading
import sys
import os
import time
import subprocess

PORT = 8086
received_report = None
server_instance = None

def safe_print(text):
    try:
        print(text)
        sys.stdout.flush()
    except UnicodeEncodeError:
        enc = sys.stdout.encoding or 'utf-8'
        print(text.encode(enc, errors='replace').decode(enc))
        sys.stdout.flush()

class HarnessHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_POST(self):
        global received_report
        if self.path == '/harness-results':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            received_report = json.loads(post_data.decode('utf-8'))

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "received"}).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

def start_server():
    global server_instance
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), HarnessHandler) as httpd:
            server_instance = httpd
            httpd.serve_forever()
    except Exception as e:
        safe_print(f"Server error: {e}")

if __name__ == '__main__':
    safe_print("Starting harness server thread on port 8086...")
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1.0)

    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    browser = chrome_path if os.path.exists(chrome_path) else edge_path

    url = f"http://localhost:{PORT}/tests/m4_excel_test_harness.html"
    cmd = [browser, "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--remote-debugging-port=0", "--disable-http-cache", url]

    safe_print(f"Launching browser: {browser}")
    log_file = open("harness_run.log", "w", encoding="utf-8", errors="replace")
    proc = subprocess.Popen(cmd, stdout=log_file, stderr=log_file)

    safe_print("Waiting for test harness execution...")
    for _ in range(30):
        if received_report is not None:
            break
        time.sleep(1)

    proc.terminate()
    log_file.close()

    safe_print("\n" + "=" * 60)
    safe_print("EXCELJS EXPORT EMPIRICAL HARNESS RESULTS")
    safe_print("=" * 60)

    if received_report:
        safe_print(json.dumps(received_report, indent=2))
        with open(".agents/teamwork_preview_challenger_m4_1/harness_results.json", "w", encoding="utf-8") as f:
            json.dump(received_report, f, indent=2)
    else:
        safe_print("[ERROR] No report received within timeout!")
        sys.exit(1)

    sys.exit(0 if received_report.get('status') == 'PASS' else 1)
