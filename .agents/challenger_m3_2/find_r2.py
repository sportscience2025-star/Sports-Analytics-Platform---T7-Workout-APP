import os, glob

for root, dirs, files in os.walk("e:/Nuove App Installate/App esercizi scienze motorie"):
    for file in files:
        if file.endswith(('.js', '.html', '.md')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'sfvp' in content or 'fvBias' in content or 'Sfv' in content or 'R2' in content:
                    lines = [i+1 for i, line in enumerate(content.splitlines()) if any(k in line for k in ['sfvp', 'fvBias', 'Sfv', 'R2'])]
                    print(f"{file} -> lines: {lines[:10]}")
