import os

test_file_path = r"e:\Nuove App Installate\App esercizi scienze motorie\tests\test_chart_verification.js"
with open(test_file_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

first_line = lines[0]
with open("repr_output.txt", "w", encoding="utf-8") as f_out:
    f_out.write(repr(first_line[:1000]))
