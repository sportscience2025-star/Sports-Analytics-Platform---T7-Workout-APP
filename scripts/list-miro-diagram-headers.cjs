const TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';
const BOARD_ID = 'uXjVEbo6L2o=';

async function run() {
  let cursor = null;
  let allItems = [];
  do {
    const url = `https://api.miro.com/v2/boards/${BOARD_ID}/items?limit=50` + (cursor ? `&cursor=${cursor}` : '');
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
    const d = await res.json();
    if (!d.data || d.data.length === 0) break;
    allItems.push(...d.data);
    cursor = d.cursor;
  } while (cursor);

  // Group by Y coordinates to understand rows (Tiers)
  // Let's filter for main diagram section titles/cards
  const titles = allItems.filter(it => {
    const c = (it.data?.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // Headers typically have font size >= 14 or start with numbers/names
    return (
      c.match(/^(\d+\.|\bWORKFLOW\b|\bFLOW\b|\bTIER\b|\bTogether\b|\bMovely\b|\bMedical\b|\bTactical\b)/i) ||
      (it.style?.fontSize && parseInt(it.style.fontSize) >= 14)
    );
  }).map(it => ({
    id: it.id,
    type: it.type,
    x: Math.round(it.position?.x || 0),
    y: Math.round(it.position?.y || 0),
    w: Math.round(it.geometry?.width || 0),
    h: Math.round(it.geometry?.height || 0),
    fontSize: it.style?.fontSize,
    fillColor: it.style?.fillColor,
    text: (it.data?.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }));

  // Sort by Y first, then X
  titles.sort((a, b) => a.y - b.y || a.x - b.x);

  console.log(`Found ${titles.length} title-like items:`);
  titles.forEach((t, i) => {
    console.log(`[${i+1}] (x: ${t.x}, y: ${t.y}, w: ${t.w}, h: ${t.h}, font: ${t.fontSize}) -> "${t.text}"`);
  });
}
run();
