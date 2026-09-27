import os, sys, glob, subprocess, time, http.server, socketserver, threading, json

PORT = 8094

html_template = """<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body>
<script>
window.onerror = function(msg, url, line, col, error) {
    fetch('/test-results', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: 'FAIL', file: '%%FILE%%', msg: msg, line: line, col: col })
    });
    return true;
};
</script>
<script src="../%%FILE%%"></script>
<script>
setTimeout(function() {
    fetch('/test-results', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: 'PASS', file: '%%FILE%%' })
    });
}, 300);
</script>
</body>
</html>
"""

js_files = glob.glob('js/*.js') + glob.glob('sw.js')
results = []

for jf in js_files:
    html = html_template.replace('%%FILE%%', jf.replace('\\', '/'))
    with open('tests/syntax_test.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    container = {'res_data': None}
    done_event = threading.Event()
    
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args): pass
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            super().end_headers()
        def do_POST(self):
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            container['res_data'] = json.loads(post_data.decode('utf-8'))
            self.send_response(200)
            self.end_headers()
            done_event.set()

    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
    server_thread = threading.Thread(target=httpd.serve_forever)
    server_thread.daemon = True
    server_thread.start()
    
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    subprocess.Popen([edge_path, '--headless', '--disable-gpu', f'http://127.0.0.1:{PORT}/tests/syntax_test.html'])
    
    done_event.wait(timeout=3.0)
    httpd.shutdown()
    httpd.server_close()
    
    res_data = container['res_data']
    if res_data:
        results.append(res_data)
        print(f"[{res_data.get('status')}] {jf}: {res_data.get('msg', 'OK')}")
    else:
        results.append({'status': 'TIMEOUT', 'file': jf})
        print(f"[TIMEOUT] {jf}")

with open('all_js_syntax_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
