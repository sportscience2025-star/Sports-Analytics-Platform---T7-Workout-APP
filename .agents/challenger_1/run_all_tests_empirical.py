import http.server
import socketserver
import json
import subprocess
import threading
import os
import time
import sys

PORT = 8085 # Use port 8085 to avoid conflict

class TestRunnerHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
        
    def do_POST(self):
        if self.path == '/test-results':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            results = json.loads(post_data.decode('utf-8'))
            
            print("\n" + "=" * 50)
            print("T7 WORKOUT TEST SUITE EMPIRICAL RESULTS")
            print("=" * 50)
            print(f"Status: {results.get('status')}")
            print(f"Message: {results.get('message')}")
            print("-" * 50)
            
            details = results.get('results', {})
            passed_count = 0
            failed_count = 0
            
            for test_file, res in details.items():
                status = res.get('status')
                duration = res.get('duration', 0)
                if status == 'PASS':
                    print(f"PASS {test_file:<40} ({duration:.0f} ms)")
                    passed_count += 1
                else:
                    print(f"FAIL {test_file:<40} ({duration:.0f} ms)")
                    failed_count += 1
                    logs = res.get('logs', [])
                    for log in logs:
                        if log.get('type') == 'error':
                            print(f"   [ERROR] {log.get('text')}")
            
            print("=" * 50)
            print(f"TOTAL: {passed_count + failed_count} | PASSED: {passed_count} | FAILED: {failed_count}")
            print("=" * 50 + "\n")
            
            with open(r'e:\Nuove App Installate\App esercizi scienze motorie\.agents\challenger_1\test_results.json', 'w') as f:
                json.dump(results, f, indent=2)

            def shutdown():
                time.sleep(0.5)
                os._exit(0)
            threading.Thread(target=shutdown).start()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "received"}).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

def start():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    
    def run_browser():
        time.sleep(1.5)
        user_data = os.path.join(os.getcwd(), 'tmp_edge_user_data_ch1')
        cmd = [edge_path, '--headless=new', f'--user-data-dir={user_data}', '--disable-gpu', f'http://localhost:{PORT}/tests/runner.html']
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print("Edge execution stderr:", res.stderr)

    threading.Thread(target=run_browser).start()

    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), TestRunnerHandler) as httpd:
            print(f"Test server listening on http://localhost:{PORT}...")
            httpd.serve_forever()
    except Exception as e:
        print(f"Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    start()
