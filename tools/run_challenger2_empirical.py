import os, sys, time, subprocess, json, http.server, socketserver, threading

PORT = 8092

class TestRunnerHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args): pass
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    def do_POST(self):
        if self.path == '/test-results':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            results = json.loads(post_data.decode('utf-8'))
            
            with open('challenger2_final_results.json', 'w', encoding='utf-8') as rf:
                json.dump(results, rf, indent=2)
            
            print("VERIFICATION COMPLETE. Saved to challenger2_final_results.json")
            sys.stdout.flush()
            
            def shutdown():
                time.sleep(0.5)
                os._exit(0)
            threading.Thread(target=shutdown).start()
            self.send_response(200)
            self.end_headers()

def start_runner():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    def run_browser():
        time.sleep(1.0)
        cmd = [edge_path, '--headless', '--disable-gpu', f'http://127.0.0.1:{PORT}/tests/challenger2_verify.html']
        subprocess.run(cmd)

    threading.Thread(target=run_browser).start()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), TestRunnerHandler) as httpd:
        httpd.serve_forever()

if __name__ == '__main__':
    start_runner()
