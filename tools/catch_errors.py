import http.server
import socketserver
import json
import webbrowser
import threading
import time
import os

class LogHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
        
    def do_POST(self):
        if self.path == '/log':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            print(f"BROWSER LOG: {data}")
            self.send_response(200)
            self.end_headers()
            
            # Shut down if it's an error
            def shutdown():
                time.sleep(1)
                os._exit(0)
            threading.Thread(target=shutdown).start()

PORT = 8081
socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("", PORT), LogHandler)

def open_browser():
    time.sleep(1)
    webbrowser.open(f"http://localhost:{PORT}/debug.html")

threading.Thread(target=open_browser).start()
print("Listening on 8081...")
httpd.serve_forever()
