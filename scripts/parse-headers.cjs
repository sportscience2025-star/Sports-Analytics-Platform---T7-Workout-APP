const fs = require('fs');
const content = fs.readFileSync('C:/Users/ptomm/.gemini/antigravity/brain/8349caa3-f159-4ea3-8f6a-d0701c32f9bd/.system_generated/steps/130/output.txt', 'utf8');
const lines = content.split('\n');

const items = [];
for (const line of lines) {
  const m = line.match(/\[(\d+)\] \(x: (-?\d+), y: (-?\d+), w: (\d+), h: (\d+), font: (\d+)\) -> "(.*)"/);
  if (m) {
    items.push({
      idx: parseInt(m[1]),
      x: parseInt(m[2]),
      y: parseInt(m[3]),
      w: parseInt(m[4]),
      h: parseInt(m[5]),
      font: parseInt(m[6]),
      text: m[7]
    });
  }
}

// Major section headers usually have large width (w >= 900) or are section titles
const majorHeaders = items.filter(it => {
  return (it.w >= 900 || it.font >= 16 || it.text.match(/^(\d+\.\s*(FLUSSO|ONBOARDING|ARCHITETTURA|WORKFLOW)|Together|Movely|Tactical|Medical)/i));
});

console.log('=== MAJOR SECTION HEADERS ===');
majorHeaders.sort((a,b) => a.y - b.y || a.x - b.x).forEach(h => {
  console.log(`y: ${h.y.toString().padStart(5)}, x: ${h.x.toString().padStart(6)}, w: ${h.w.toString().padStart(5)}, font: ${h.font} -> "${h.text}"`);
});
