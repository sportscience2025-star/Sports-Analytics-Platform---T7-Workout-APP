import re
import json

filepath = "../../js/knowledge-base.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# We can match all the "area": "..." fields in the file.
# But to be absolutely precise, let's parse the scientificSources array as a JSON or using regex.
# Since it's a JS structure but contains valid JSON-like objects inside, we can extract the JSON-like objects.

# Find window.App.scientificSources = [ ... ];
# Let's match all occurrences of: "area": "..." or "area":  "..."
# Note that in the file we have: "area":  "Atletica Leggera",
# Let's find all "id" and "area" values to map them.

pattern = re.compile(r'{\s*"id":\s*"([^"]+)",.*?"area":\s*"([^"]+)"', re.DOTALL)
matches = pattern.findall(content)

# Let's also do a simpler regex matching just "area" field values to double check:
area_pattern = re.compile(r'"area":\s*"([^"]+)"')
areas = area_pattern.findall(content)

print(f"Total area matches: {len(areas)}")
from collections import Counter
counts = Counter(areas)
for cat, cnt in sorted(counts.items()):
    print(f"{cat}: {cnt}")

print("\nDetail of sources:")
# Let's also parse the array using json.loads by extracting the array block.
start_idx = content.find("window.App.scientificSources = [")
if start_idx != -1:
    start_idx = content.find("[", start_idx)
    end_idx = content.find("];", start_idx)
    array_str = content[start_idx:end_idx+1]
    
    # Let's try parsing this with json.loads. To do that we might need to remove trailing commas if any,
    # but let's see. Python's json module is strict. If it fails, regex is fine.
    # Let's see if we can convert it to valid JSON.
    try:
        # Simple cleanup if needed:
        # replace single quotes or JS syntax? No, the file uses double quotes mostly.
        # But let's check if we can load it.
        # Sometimes there are unicode characters.
        data = json.loads(array_str)
        print(f"JSON parsed successfully! Total items: {len(data)}")
        json_counts = Counter([item["area"] for item in data])
        for cat, cnt in sorted(json_counts.items()):
            print(f"JSON Category - {cat}: {cnt}")
    except Exception as e:
        print(f"JSON parsing failed: {e}")
        # Let's fall back to regex block parsing.
        # Let's split by "{ " and " }"
        blocks = re.findall(r'\{\s*"id":.*?\n\s*\}', content, re.DOTALL)
        print(f"Total blocks matched: {len(blocks)}")
        block_areas = []
        for block in blocks:
            area_m = re.search(r'"area":\s*"([^"]+)"', block)
            if area_m:
                block_areas.append(area_m.group(1))
            else:
                print(f"Warning: no area in block: {block[:100]}...")
        block_counts = Counter(block_areas)
        for cat, cnt in sorted(block_counts.items()):
            print(f"Block Category - {cat}: {cnt}")
        print(f"Total from blocks: {len(block_areas)}")
