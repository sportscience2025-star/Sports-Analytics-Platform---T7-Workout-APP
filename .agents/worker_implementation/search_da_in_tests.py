import os

tests_dir = r"e:\Nuove App Installate\App esercizi scienze motorie\tests"
for f_name in os.listdir(tests_dir):
    if f_name.endswith(".js"):
        f_path = os.path.join(tests_dir, f_name)
        with open(f_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        if "data-analysis" in content:
            print(f"{f_name} contains 'data-analysis'")
