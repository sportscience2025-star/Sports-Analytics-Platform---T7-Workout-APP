import http.server
import socketserver
import json
import subprocess
import threading
import sys
import os
import time

PORT = 8092

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
            print("TEST RESULTS SUMMARY")
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
                    print(f"[PASS] {test_file:<40} ({duration:.0f} ms)")
                    passed_count += 1
                else:
                    print(f"[FAIL] {test_file:<40} ({duration:.0f} ms)")
                    failed_count += 1
                logs = res.get('logs', [])
                for log in logs:
                    text = log.get('text', '').encode('ascii', 'replace').decode('ascii')
                    print(f"   [{log.get('type', 'info').upper()}] {text}")
            
            print("=" * 50)
            print(f"TOTAL: {passed_count + failed_count} | PASSED: {passed_count} | FAILED: {failed_count}")
            print("=" * 50 + "\n")
            
            def shutdown_server():
                time.sleep(0.5)
                os._exit(0 if results.get('status') == 'PASS' else 1)
                
            threading.Thread(target=shutdown_server).start()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "received"}).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), TestRunnerHandler) as httpd:
            httpd.serve_forever()
    except Exception as e:
        print(f"Server error: {e}")

if __name__ == '__main__':
    try:
        test_file_target = sys.argv[1] if len(sys.argv) > 1 else "test_adversarial_physics.js"
        
        server_thread = threading.Thread(target=start_server, daemon=True)
        server_thread.start()
        time.sleep(1.0)
        
        edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
        
        cmd = [edge_path, '--headless', '--disable-gpu', f"http://localhost:{PORT}/.agents/challenger_m1_1/runner_single.html?test={test_file_target}"]
        print(f"Launching headless Edge for {test_file_target}...")
        proc = subprocess.Popen(cmd)
        
        start_time = time.time()
        while time.time() - start_time < 30:
            time.sleep(1)
        
        print("Timeout waiting for test results!")
        proc.kill()
        sys.exit(1)
    except Exception as ex:
        print(f"Main error: {ex}")
        sys.exit(1)
