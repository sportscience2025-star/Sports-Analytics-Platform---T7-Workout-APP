import subprocess, time, sys, os, threading, http.server, socketserver, json

PORT = 8089
TEST_FILE = sys.argv[1] if len(sys.argv) > 1 else 'test_rag_ui_adversarial.js'

def safe_print(text):
    try:
        print(text)
        sys.stdout.flush()
    except UnicodeEncodeError:
        enc = sys.stdout.encoding or 'utf-8'
        print(text.encode(enc, errors='replace').decode(enc))
        sys.stdout.flush()

# Read runner.html and replace testFiles
with open('tests/runner.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace testFiles array
start_idx = html.find('const testFiles = [')
end_idx = html.find('];', start_idx)
new_test_files = f"const testFiles = [\n            '{TEST_FILE}'\n        "
html = html[:start_idx] + new_test_files + html[end_idx:]

with open('tests/runner_single.html', 'w', encoding='utf-8') as f:
    f.write(html)

class RobustTestRunnerHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
        
    def do_POST(self):
        if self.path == '/test-results':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            results = json.loads(post_data.decode('utf-8'))

            safe_print("\n" + "=" * 50)
            safe_print(f"SINGLE TEST RESULT: {TEST_FILE}")
            safe_print("=" * 50)
            safe_print(f"Status: {results.get('status')}")
            safe_print(f"Message: {results.get('message')}")
            safe_print("-" * 50)
            
            details = results.get('results', {})
            for test_file, res in details.items():
                safe_print(f"File: {test_file} | Status: {res.get('status')} | Duration: {res.get('duration', 0):.0f} ms")
                logs = res.get('logs', [])
                for log in logs:
                    safe_print(f"   [{log.get('type')}] {log.get('text')}")
            safe_print("=" * 50 + "\n")
            
            # Write single_test_results.json
            with open('single_test_results.json', 'w', encoding='utf-8') as f_out:
                json.dump(results, f_out, indent=2)
            
            def shutdown_server():
                time.sleep(0.5)
                os._exit(0 if results.get('status') == 'PASS' else 1)
                
            threading.Thread(target=shutdown_server).start()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "received"}).encode('utf-8'))
        elif self.path == '/log':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            log_data = json.loads(post_data.decode('utf-8'))
            prefix = "[Browser Error]" if log_data.get('type') == 'error' else "[Browser Console]"
            safe_print(f"{prefix} {log_data.get('text')}")
            
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

def start_runner():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    
    def run_browser():
        time.sleep(1.5)
        import shutil
        for d in os.listdir(os.getcwd()):
            if d.startswith('tmp_edge_user_data_single_') or d == 'tmp_edge_user_data_single':
                try:
                    shutil.rmtree(d)
                except Exception:
                    pass
        user_data = os.path.join(os.getcwd(), f'tmp_edge_user_data_single_{int(time.time())}')
        cmd = [edge_path, '--headless=new', f'--user-data-dir={user_data}', '--disable-gpu', '--disable-cache', f'http://localhost:{PORT}/tests/runner_single.html']
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    threading.Thread(target=run_browser).start()

    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), RobustTestRunnerHandler) as httpd:
            httpd.serve_forever()
    except Exception as e:
        print(f"Server error: {e}")
        sys.stdout.flush()
        sys.exit(1)

if __name__ == '__main__':
    start_runner()
