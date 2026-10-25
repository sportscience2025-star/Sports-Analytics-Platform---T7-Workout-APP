const TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';
const BOARD_ID = 'uXjVEbo6L2o=';

async function api(endpoint, method = 'GET', body = null) {
  const url = `https://api.miro.com/v2/boards/${BOARD_ID}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : null
  });
  if (method === 'DELETE') {
    return res.status;
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function createShape(data) {
  const res = await api('/shapes', 'POST', {
    data: {
      content: data.content,
      shape: data.shape || 'rectangle'
    },
    style: {
      fillColor: data.fillColor || '#e0f2fe',
      borderColor: data.borderColor || '#0284c7',
      borderWidth: data.borderWidth || '2',
      textAlign: data.textAlign || 'center',
      textAlignVertical: 'middle',
      fontSize: data.fontSize || '12',
      color: data.color || '#0f172a'
    },
    position: {
      x: data.x,
      y: data.y,
      origin: 'center'
    },
    geometry: {
      width: data.width,
      height: data.height
    }
  });
  await delay(80);
  return res;
}

async function createConnector(startId, endId, label = '', startPos = { x: '50%', y: '100%' }, endPos = { x: '50%', y: '0%' }, strokeColor = '#0284c7') {
  const body = {
    startItem: { id: startId, position: startPos },
    endItem: { id: endId, position: endPos },
    shape: 'elbowed',
    style: {
      startStrokeCap: 'none',
      endStrokeCap: 'stealth',
      strokeWidth: '1.5',
      strokeStyle: 'normal',
      strokeColor: strokeColor,
      color: '#0f172a',
      textOrientation: 'horizontal',
      fontSize: '12'
    }
  };
  if (label) {
    body.captions = [{
      content: label,
      position: '50%',
      textAlignVertical: 'middle'
    }];
  }
  const res = await api('/connectors', 'POST', body);
  await delay(80);
  return res;
}

async function fetchAllItems() {
  let cursor = null;
  let allItems = [];
  do {
    let url = `/items?limit=50` + (cursor ? `&cursor=${cursor}` : '');
    const d = await api(url);
    allItems.push(...(d.data || []));
    cursor = d.cursor;
  } while (cursor);
  return allItems;
}

async function fetchAllConnectors() {
  let cursor = null;
  let allConnectors = [];
  do {
    let url = `/connectors?limit=50` + (cursor ? `&cursor=${cursor}` : '');
    const d = await api(url);
    allConnectors.push(...(d.data || []));
    cursor = d.cursor;
  } while (cursor);
  return allConnectors;
}

async function cleanTiers() {
  console.log('Cleaning old T2 and T3 items & connectors...');
  const allItems = await fetchAllItems();
  const allConnectors = await fetchAllConnectors();

  const t2Old = allItems.filter(i => Math.abs(i.position.x - (-800)) < 1200 && i.position.y > 2850 && i.position.y < 5150);
  const t3Old = allItems.filter(i => Math.abs(i.position.x - (-800)) < 1200 && i.position.y > 5250 && i.position.y < 7600);

  const oldIds = new Set([...t2Old, ...t3Old].map(i => i.id));
  const oldConnectors = allConnectors.filter(c => oldIds.has(c.startItem?.id) || oldIds.has(c.endItem?.id));

  console.log(`Deleting ${oldConnectors.length} connectors...`);
  for (const c of oldConnectors) {
    await api(`/connectors/${c.id}`, 'DELETE');
    await delay(40);
  }

  console.log(`Deleting ${oldIds.size} shapes...`);
  for (const id of oldIds) {
    await api(`/items/${id}`, 'DELETE');
    await delay(40);
  }
}

module.exports = {
  createShape,
  createConnector,
  cleanTiers,
  api
};
