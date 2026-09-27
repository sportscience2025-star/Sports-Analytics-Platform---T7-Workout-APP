import json, re

# Read js/data.js and extract exercises and MUSCLE_TAXONOMY
with open('js/data.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Extract taxonomy
tax_match = re.search(r'window\.App\.MUSCLE_TAXONOMY\s*=\s*(\{.*?\});\s*//', js_content, re.DOTALL)
if not tax_match:
    tax_match = re.search(r'window\.App\.MUSCLE_TAXONOMY\s*=\s*(\{.*?\});', js_content, re.DOTALL)

print("Taxonomy match found?", tax_match is not None)

# Let's write a node-like evaluator using python jsbeautifier / re or exec in node if possible? Wait, we can parse window.App.exercises using python or json if cleanly formatted, or write a JS script run via edge / python headless!
