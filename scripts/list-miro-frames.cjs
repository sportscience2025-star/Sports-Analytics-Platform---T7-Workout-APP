const TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';
const BOARD_ID = 'uXjVEbo6L2o=';

async function run() {
  try {
    const url = `https://api.miro.com/v2/boards/${BOARD_ID}/items?type=frame&limit=50`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json'
      }
    });
    const d = await res.json();
    console.log('Frames retrieved:', d.data ? d.data.length : 0);
    if (d.data) {
      d.data.forEach((f, i) => {
        console.log(`[${i+1}] ID: ${f.id} | Title: "${f.data?.title}" | Pos: (${f.position?.x}, ${f.position?.y}) | Dim: ${f.geometry?.width}x${f.geometry?.height}`);
      });
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
