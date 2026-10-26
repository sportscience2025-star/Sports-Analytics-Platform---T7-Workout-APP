const TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';
const BOARD_ID = 'uXjVEbo6L2o=';

const diagrams = [
  { num: 1, code: 'FLOW-1A', x: -2570, y: 350, w: 1350, h: 70, tier: 1 },
  { num: 2, code: 'FLOW-2A', x: -256, y: 420, w: 1350, h: 70, tier: 1 },
  { num: 3, code: 'FLOW-3A', x: 2459, y: 555, w: 1150, h: 70, tier: 1 },
  { num: 4, code: 'FLOW-4A', x: 4171, y: 555, w: 1350, h: 70, tier: 1 },
  { num: 5, code: 'FLOW-5A', x: 6048, y: 555, w: 1350, h: 70, tier: 1 },
  { num: 6, code: 'FLOW-6A', x: 7937, y: 555, w: 1350, h: 70, tier: 1 },

  { num: 7, code: 'FLOW-1B', x: -2448, y: 3198, w: 1250, h: 80, tier: 2 },
  { num: 8, code: 'FLOW-2B', x: -181, y: 3066, w: 1350, h: 70, tier: 2 },
  { num: 9, code: 'FLOW-3B', x: 2459, y: 3039, w: 1150, h: 70, tier: 2 },
  { num: 10, code: 'FLOW-4B', x: 4171, y: 3039, w: 1350, h: 70, tier: 2 },
  { num: 11, code: 'FLOW-5B', x: 6048, y: 3039, w: 1350, h: 70, tier: 2 },
  { num: 12, code: 'FLOW-6B', x: 7937, y: 3039, w: 1350, h: 70, tier: 2 },

  { num: 13, code: 'FLOW-1C', x: -2925, y: 6687, w: 1350, h: 70, tier: 3 },
  { num: 14, code: 'FLOW-2C', x: -108, y: 6355, w: 1350, h: 70, tier: 3 },
  { num: 15, code: 'FLOW-3C', x: 2875, y: 6685, w: 1150, h: 70, tier: 3 },
  { num: 16, code: 'FLOW-4C', x: 4587, y: 6685, w: 1350, h: 70, tier: 3 },
  { num: 17, code: 'FLOW-5C', x: 6464, y: 6685, w: 1350, h: 70, tier: 3 },
  { num: 18, code: 'FLOW-6C', x: 8353, y: 6685, w: 1350, h: 70, tier: 3 }
];

async function checkBadgePositions() {
  console.log('Badge proposals:');
  diagrams.forEach(d => {
    // Left of header badge:
    const leftX = Math.round(d.x - (d.w / 2) - 130);
    const leftY = d.y;
    // Above header badge:
    const topX = d.x;
    const topY = d.y - 90;
    console.log(`Diagram #${d.num} (${d.code}): Header at (${d.x}, ${d.y}) -> Left Badge: (${leftX}, ${leftY}) | Top Badge: (${topX}, ${topY})`);
  });
}

checkBadgePositions();
