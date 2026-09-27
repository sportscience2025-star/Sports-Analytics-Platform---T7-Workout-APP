import json
import codecs

test_file_path = r"e:\Nuove App Installate\App esercizi scienze motorie\tests\test_chart_verification.js"
with open(test_file_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

first_line = lines[0]
idx = first_line.rfind('","Description":')
if idx != -1:
    js_escaped = first_line[:idx]
else:
    js_escaped = first_line

print(f"js_escaped length: {len(js_escaped)}")
print(f"Ends with: {js_escaped[-50:]}")

try:
    # Wrap in double quotes and parse
    # Since it is already JSON-escaped, wrapping in quotes should make it a valid JSON string.
    # Wait, what if there are unescaped backslashes? json.loads might fail, let's see.
    js_code = json.loads('"' + js_escaped + '"')
    print("Successfully decoded with json.loads")
except Exception as e:
    print("json.loads failed:", e)
    # Fallback using codecs escape decode
    # unicode-escape decodes \n, \t, \uXXXX, etc.
    # But it might not handle \" -> " correctly or might have issues.
    # Let's do a replace of common escapes or use a bytes-based escape_decode.
    try:
        # We need to decode double-escaped characters.
        # escape_decode handles \n, \t, etc.
        # Let's try:
        decoded_bytes, _ = codecs.escape_decode(js_escaped.encode('utf-8'))
        js_code = decoded_bytes.decode('utf-8')
        print("Successfully decoded with escape_decode")
    except Exception as e2:
        print("escape_decode failed:", e2)
        js_code = js_escaped.replace('\\n', '\n').replace('\\"', '"').replace("\\'", "'").replace('\\u003e', '>').replace('\\u0026', '&')

# Save it
with open(test_file_path, "w", encoding="utf-8") as f_out:
    f_out.write(js_code)

print("Saved cleaned test_chart_verification.js")
