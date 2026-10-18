/**
 * T7 Workout — Sports Analytics Platform
 * Board Inspection Script for Miro Flowchart
 */

const https = require('https');

const BOARD_ID = 'uXjVEbo6L2o=';
const TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';
const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Accept': 'application/json'
};

function get(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.miro.com/v2/boards/${encodeURIComponent(BOARD_ID)}${endpoint}`, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function getAllItems() {
  let allItems = [];
  let cursor = null;
  do {
    const url = `/items?limit=50${cursor ? `&cursor=${cursor}` : ''}`;
    const res = await get(url);
    if (res.data) allItems.push(...res.data);
    cursor = res.cursor;
  } while (cursor);
  return allItems;
}

async function getAllConnectors() {
  let allConnectors = [];
  let cursor = null;
  do {
    const url = `/connectors?limit=50${cursor ? `&cursor=${cursor}` : ''}`;
    const res = await get(url);
    if (res.data) allConnectors.push(...res.data);
    cursor = res.cursor;
  } while (cursor);
  return allConnectors;
}

async function run() {
  const items = await getAllItems();
  console.log(`Total items on board: ${items.length}`);
  const connectors = await getAllConnectors();
  console.log(`Total connectors on board: ${connectors.length}`);

  // Sort items by X, then Y
  const sorted = items.sort((a,b) => (a.position?.x || 0) - (b.position?.x || 0) || (a.position?.y || 0) - (b.position?.y || 0));

  console.log('\n--- ITEMS LIST ---');
  sorted.forEach(it => {
    const rawTxt = (it.data?.content || it.data?.title || '');
    const cleanTxt = rawTxt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
    console.log(`[${it.type}] ID: ${it.id} | Pos: (${Math.round(it.position?.x || 0)}, ${Math.round(it.position?.y || 0)}) | Parent: ${it.parent?.id || 'none'} | "${cleanTxt}"`);
  });

  console.log('\n--- CONNECTORS LIST ---');
  connectors.forEach(c => {
    console.log(`Connector [${c.id}]: ${c.startItem?.id} -> ${c.endItem?.id} | style: ${JSON.stringify(c.style)} | shape: ${c.shape}`);
  });
}

run().catch(console.error);
