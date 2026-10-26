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
      text: m[7]
    });
  }
}

const targets = [
  { num: 1, x: -2570, y: 260 },
  { num: 2, x: -256, y: 330 },
  { num: 3, x: 2459, y: 465 },
  { num: 4, x: 4171, y: 465 },
  { num: 5, x: 6048, y: 465 },
  { num: 6, x: 7937, y: 465 },

  { num: 7, x: -2448, y: 3090 },
  { num: 8, x: -181, y: 2960 },
  { num: 9, x: 2459, y: 2940 },
  { num: 10, x: 4171, y: 2940 },
  { num: 11, x: 6048, y: 2940 },
  { num: 12, x: 7937, y: 2940 },

  { num: 13, x: -2925, y: 6580 },
  { num: 14, x: -108, y: 6245 },
  { num: 15, x: 2875, y: 6580 },
  { num: 16, x: 4587, y: 6580 },
  { num: 17, x: 6464, y: 6580 },
  { num: 18, x: 8353, y: 6580 }
];

targets.forEach(t => {
  const coll = items.filter(it => Math.abs(it.x - t.x) < 250 && Math.abs(it.y - t.y) < 70);
  if (coll.length > 0) {
    console.log(`Target #${t.num} near (${t.x}, ${t.y}) has close items:`, coll.map(c => `(${c.x}, ${c.y}) "${c.text.slice(0, 40)}"`));
  } else {
    console.log(`Target #${t.num} near (${t.x}, ${t.y}) is 100% CLEAR.`);
  }
});
