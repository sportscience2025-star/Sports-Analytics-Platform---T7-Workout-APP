import glob

js_files = glob.glob('js/*.js')
for jf in js_files:
    with open(jf, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    for i, line in enumerate(lines):
        # simple check for unescaped apostrophes inside single quoted strings
        # e.g. '...dell'...'
        if "'" in line and not line.strip().startswith("//") and not line.strip().startswith("*"):
            # check for patterns like '...dell'Addome...' or similar
            parts = line.split("'")
            # if odd number of quotes or identifier right after quote without operator/comma
            if len(parts) > 2:
                for idx in range(1, len(parts)-1):
                    token = parts[idx].strip()
                    # if token is just letters (like Addome) and next char isn't comma or colon or bracket
                    if token.isalpha() and idx % 2 == 1:
                        pass
