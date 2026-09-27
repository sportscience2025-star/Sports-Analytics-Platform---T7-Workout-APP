import os

ui_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../js/ui.js"))
with open(ui_path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.splitlines()
with open("ui_options_out.txt", "w", encoding="utf-8") as out:
    out.write("Search results for 'patientType':\n")
    for idx, line in enumerate(lines):
        if "patientType" in line:
            out.write(f"Line {idx+1}: {line}\n")

    out.write("\nSearch results for 'sportPraticato':\n")
    for idx, line in enumerate(lines):
        if "sportPraticato" in line:
            out.write(f"Line {idx+1}: {line}\n")
