import http.server
import socketserver
import json
import threading
import sys
import os
import time
import subprocess

PORT = 8086
current_test = ""
test_status = "RUNNING"

def safe_print(text):
    try:
        print(text)
        sys.stdout.flush()
    except UnicodeEncodeError:
        enc = sys.stdout.encoding or 'utf-8'
        print(text.encode(enc, errors='replace').decode(enc))
        sys.stdout.flush()

class SingleTestRunnerHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_POST(self):
        global test_status
        if self.path == '/test-results':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            results = json.loads(post_data.decode('utf-8'))
            
            safe_print(f"\n[{current_test}] RESULT: {results.get('status')}")
            safe_print(f"[{current_test}] MESSAGE: {results.get('message')}")
            test_status = results.get('status')
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "received"}).encode('utf-8'))
        elif self.path == '/log':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            log_data = json.loads(post_data.decode('utf-8'))
            prefix = "[Browser Error]" if log_data.get('type') == 'error' else "[Browser Console]"
            safe_print(f"[{current_test}] {prefix} {log_data.get('text')}")
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), SingleTestRunnerHandler) as httpd:
            httpd.serve_forever()
    except Exception as e:
        safe_print(f"Server error: {e}")

if __name__ == '__main__':
    # Change working dir to repo root so handler can find tests/ and js/
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
    os.chdir(repo_root)
    
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1.0)

    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    browser = chrome_path if os.path.exists(chrome_path) else edge_path

    tests_to_run = ['test_rag.js', 'test_vbt_fallbacks.js']
    
    overall_pass = True
    for test in tests_to_run:
        current_test = test
        test_status = "RUNNING"
        url = f"http://localhost:{PORT}/tests/iframe_runner.html?test={test}"
        cmd = [browser, "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--remote-debugging-port=9222", "--disable-http-cache", url]
        
        safe_print(f"\n==================================================")
        safe_print(f"LAUNCHING TEST: {test}")
        safe_print(f"==================================================")
        
        proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Wait up to 30 seconds for this test to complete
        for _ in range(30):
            time.sleep(1)
            if test_status != "RUNNING":
                break
        
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()
            
        if test_status == "PASS":
            safe_print(f"[{test}] SUCCESS")
        else:
            safe_print(f"[{test}] FAILED OR TIMED OUT (status: {test_status})")
            overall_pass = False

    sys.exit(0 if overall_pass else 1)
