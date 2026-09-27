import os

txt_path = r"e:\Nuove App Installate\App esercizi scienze motorie\test_out.txt"
if os.path.exists(txt_path):
    with open(txt_path, "r", encoding="utf-16", errors="ignore") as f:
        content = f.read()
    # Print or write to a UTF-8 file
    with open("test_out_utf8.txt", "w", encoding="utf-8") as out:
        out.write(content)
    print("Converted test_out.txt to UTF-8")
else:
    print("test_out.txt not found")
