import subprocess, time, sys, os, threading, http.server, socketserver, json

PORT = 8085

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
            
            output = []
            output.append("\n" + "=" * 50)
            output.append("T7 WORKOUT TEST SUITE SUMMARY")
            output.append("=" * 50)
            output.append(f"Status: {results.get('status')}")
            output.append(f"Message: {results.get('message')}")
            output.append("-" * 50)
            
            details = results.get('results', {})
            passed_count = 0
            failed_count = 0
            
            for test_file, res in details.items():
                status = res.get('status')
                duration = res.get('duration', 0)
                if status == 'PASS':
                    output.append(f"PASS {test_file:<40} ({duration:.0f} ms)")
                    passed_count += 1
                else:
                    output.append(f"FAIL {test_file:<40} ({duration:.0f} ms)")
                    failed_count += 1
                    logs = res.get('logs', [])
                    for log in logs:
                        output.append(f"   [{log.get('type')}] {log.get('text')}")
            
            output.append("=" * 50)
            output.append(f"TOTAL: {passed_count + failed_count} | PASSED: {passed_count} | FAILED: {failed_count}")
            output.append("=" * 50 + "\n")
            
            full_out = "\n".join(output)
            print(full_out)
            sys.stdout.flush()
            
            with open('test_output.log', 'w', encoding='utf-8') as f_out:
                f_out.write(full_out)
            
            def shutdown_server():
                time.sleep(0.5)
                os._exit(0)
                
            threading.Thread(target=shutdown_server).start()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "received"}).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

def start_runner():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    
    def run_browser():
        time.sleep(1.0)
        cmd = [edge_path, '--headless', '--disable-gpu', f'http://127.0.0.1:{PORT}/tests/runner.html']
        subprocess.run(cmd)

    threading.Thread(target=run_browser).start()

    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("127.0.0.1", PORT), TestRunnerHandler) as httpd:
            httpd.serve_forever()
    except Exception as e:
        print(f"Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    start_runner()
