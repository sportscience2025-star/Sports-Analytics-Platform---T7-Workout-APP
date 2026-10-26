const TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';
const BOARD_ID = 'uXjVEbo6L2o=';

async function run() {
  try {
    let cursor = null;
    let allItems = [];
    let page = 0;
    do {
      const url = `https://api.miro.com/v2/boards/${BOARD_ID}/items?limit=50` + (cursor ? `&cursor=${cursor}` : '');
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/json'
        }
      });
      const d = await res.json();
      if (!d.data || d.data.length === 0) break;
      allItems.push(...d.data);
      cursor = d.cursor;
      page++;
      console.log(`Page ${page}: got ${d.data.length} items (total: ${allItems.length})`);
    } while (cursor && page < 20);

    console.log(`Total items retrieved: ${allItems.length}`);

    // Look for items with text or titles
    const candidates = [];
    for (const item of allItems) {
      const content = item.data?.content || item.data?.title || '';
      if (!content) continue;
      const clean = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (
        clean.toLowerCase().includes('flow') ||
        clean.toLowerCase().includes('software') ||
        clean.toLowerCase().includes('tier') ||
        clean.toLowerCase().includes('zona') ||
        clean.toLowerCase().includes('cockpit') ||
        clean.toLowerCase().includes('onboarding') ||
        clean.toLowerCase().includes('workout') ||
        clean.toLowerCase().includes('wearable') ||
        clean.toLowerCase().includes('social') ||
        clean.toLowerCase().includes('movely') ||
        clean.toLowerCase().includes('vbt') ||
        clean.toLowerCase().includes('bunker') ||
        clean.toLowerCase().includes('microcycle') ||
        clean.toLowerCase().includes('gps') ||
        clean.toLowerCase().includes('video') ||
        clean.toLowerCase().includes('medical')
      ) {
        candidates.push({
          id: item.id,
          type: item.type,
          x: item.position?.x,
          y: item.position?.y,
          width: item.geometry?.width,
          height: item.geometry?.height,
          text: clean.slice(0, 120)
        });
      }
    }

    console.log(`Matching items count: ${candidates.length}`);
    candidates.forEach((c, idx) => {
      console.log(`[${idx + 1}] (${c.x}, ${c.y}) [${c.type}]: ${c.text}`);
    });
  } catch (err) {
    console.error('Scan error:', err);
  }
}

run();
