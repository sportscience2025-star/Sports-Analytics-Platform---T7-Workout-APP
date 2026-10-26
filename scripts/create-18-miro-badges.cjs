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
  if (method === 'DELETE') return res.status;
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

const diagrams = [
  // --- TIER 1 (Casual B2C) ---
  {
    num: 1,
    code: 'FLOW-1A',
    file: '01-software-1-flow-1a-consumer-onboarding.md',
    title: 'Accesso, Onboarding & Anamnesi Anti-Frode',
    x: -2570, y: 260,
    fillColor: '#0f766e', borderColor: '#14b8a6', tier: 'TIER 1 (B2C CASUAL)'
  },
  {
    num: 2,
    code: 'FLOW-2A',
    file: '02-software-1-flow-2a-personal-cockpit.md',
    title: 'Catalogo Esercizi & Avatar Biomeccanico 3D',
    x: -256, y: 330,
    fillColor: '#0f766e', borderColor: '#14b8a6', tier: 'TIER 1 (B2C CASUAL)'
  },
  {
    num: 3,
    code: 'FLOW-3A',
    file: '03-software-1-flow-3a-workout-player.md',
    title: 'Architettura Thin Client & Workout Player Logging',
    x: 2459, y: 465,
    fillColor: '#0f766e', borderColor: '#14b8a6', tier: 'TIER 1 (B2C CASUAL)'
  },
  {
    num: 4,
    code: 'FLOW-4A',
    file: '04-software-1-flow-4a-wearable-sync.md',
    title: 'Workflow Algoritmici & Wearable Health Sync',
    x: 4171, y: 465,
    fillColor: '#0f766e', borderColor: '#14b8a6', tier: 'TIER 1 (B2C CASUAL)'
  },
  {
    num: 5,
    code: 'FLOW-5A',
    file: '05-software-1-flow-5a-together-social-b2c.md',
    title: 'Together Social Community & Coach Marketplace',
    x: 6048, y: 465,
    fillColor: '#0f766e', borderColor: '#14b8a6', tier: 'TIER 1 (B2C CASUAL)'
  },
  {
    num: 6,
    code: 'FLOW-6A',
    file: '06-software-1-flow-6a-movely-desk-care.md',
    title: 'Movely Desk-Care & Pause Attive Ergonomiche',
    x: 7937, y: 465,
    fillColor: '#0f766e', borderColor: '#14b8a6', tier: 'TIER 1 (B2C CASUAL)'
  },

  // --- TIER 2 (Pro P.IVA Coach & Fisio) ---
  {
    num: 7,
    code: 'FLOW-1B',
    file: '07-software-2-flow-1b-pro-onboarding.md',
    title: 'Onboarding & Setup Fiscale P.IVA Anti-Frode',
    x: -2448, y: 3090,
    fillColor: '#b45309', borderColor: '#f59e0b', tier: 'TIER 2 (PRO P.IVA)'
  },
  {
    num: 8,
    code: 'FLOW-2B',
    file: '08-software-2-flow-2b-coach-hub.md',
    title: 'Catalogo 3D, Video In-App & Revisione AI',
    x: -181, y: 2960,
    fillColor: '#b45309', borderColor: '#f59e0b', tier: 'TIER 2 (PRO P.IVA)'
  },
  {
    num: 9,
    code: 'FLOW-3B',
    file: '09-software-2-flow-3b-macrocycle-ai-triage119.md',
    title: 'Architettura Pro B2B & Macrocicli DUP Triage 119',
    x: 2459, y: 2940,
    fillColor: '#b45309', borderColor: '#f59e0b', tier: 'TIER 2 (PRO P.IVA)'
  },
  {
    num: 10,
    code: 'FLOW-4B',
    file: '10-software-2-flow-4b-vbt-pap-biomechanics.md',
    title: 'Biomeccanica VBT BLE OLS & Salti PAP Reattività',
    x: 4171, y: 2940,
    fillColor: '#b45309', borderColor: '#f59e0b', tier: 'TIER 2 (PRO P.IVA)'
  },
  {
    num: 11,
    code: 'FLOW-5B',
    file: '11-software-2-flow-5b-together-pro-business.md',
    title: 'Together Pro Vetrina Business & Video Review Atleti',
    x: 6048, y: 2940,
    fillColor: '#b45309', borderColor: '#f59e0b', tier: 'TIER 2 (PRO P.IVA)'
  },
  {
    num: 12,
    code: 'FLOW-6B',
    file: '12-software-2-flow-6b-physio-rehab-rom.md',
    title: 'Physio Rehab Goniometro ROM & Monitoraggio VAS',
    x: 7937, y: 2940,
    fillColor: '#b45309', borderColor: '#f59e0b', tier: 'TIER 2 (PRO P.IVA)'
  },

  // --- TIER 3 (Elite Pro Teams & Enterprise) ---
  {
    num: 13,
    code: 'FLOW-1C',
    file: '13-software-3-flow-1c-bunker-onboarding-kms.md',
    title: 'Onboarding Enterprise & Accesso Bunker Club KMS',
    x: -2925, y: 6580,
    fillColor: '#4338ca', borderColor: '#818cf8', tier: 'TIER 3 (ELITE TEAMS)'
  },
  {
    num: 14,
    code: 'FLOW-2C',
    file: '14-software-3-flow-2c-multi-staff-cockpit.md',
    title: 'Catalogo 3D, Video Pro & Libreria Club Segreta',
    x: -108, y: 6245,
    fillColor: '#4338ca', borderColor: '#818cf8', tier: 'TIER 3 (ELITE TEAMS)'
  },
  {
    num: 15,
    code: 'FLOW-3C',
    file: '15-software-3-flow-3c-team-microcycle-mdx.md',
    title: 'Architettura Bunker Silo 2 & Microciclo Squadra MD-X',
    x: 2875, y: 6580,
    fillColor: '#4338ca', borderColor: '#818cf8', tier: 'TIER 3 (ELITE TEAMS)'
  },
  {
    num: 16,
    code: 'FLOW-4C',
    file: '16-software-3-flow-4c-gps-adaptive-zscore.md',
    title: 'Telemetria GPS 10-18Hz & Z-Score Adattivo 28gg',
    x: 4587, y: 6580,
    fillColor: '#4338ca', borderColor: '#818cf8', tier: 'TIER 3 (ELITE TEAMS)'
  },
  {
    num: 17,
    code: 'FLOW-5C',
    file: '17-software-3-flow-5c-tactical-video-cv.md',
    title: 'Tactical Vision Computer Vision & Voronoi Campo',
    x: 6464, y: 6580,
    fillColor: '#4338ca', borderColor: '#818cf8', tier: 'TIER 3 (ELITE TEAMS)'
  },
  {
    num: 18,
    code: 'FLOW-6C',
    file: '18-software-3-flow-6c-medical-room-research-silo3.md',
    title: 'Medical Room EMR, Return-to-Play 6 Fasi & Silo 3 Lake',
    x: 8353, y: 6580,
    fillColor: '#4338ca', borderColor: '#818cf8', tier: 'TIER 3 (ELITE TEAMS)'
  }
];

async function run() {
  console.log('=== CREATING 18 NUMERICAL BADGES ON MIRO BOARD ===');

  for (const d of diagrams) {
    const numStr = d.num.toString().padStart(2, '0');
    const content = `
      <p style="text-align: center;"><strong style="font-size: 24px; color: #ffffff;">#${numStr}</strong> &nbsp; <span style="font-size: 15px; font-weight: bold; color: #ffffff;">[ ${d.code} ]</span></p>
      <p style="text-align: center; font-size: 11px; color: #f1f5f9; margin-top: 4px;"><strong>${d.tier}</strong> &bull; <code>${d.file}</code></p>
    `.trim();

    console.log(`Creating Badge #${numStr} at (${d.x}, ${d.y}) for ${d.file}...`);

    const res = await api('/shapes', 'POST', {
      data: {
        content: content,
        shape: 'round_rectangle'
      },
      style: {
        fillColor: d.fillColor,
        borderColor: d.borderColor,
        borderWidth: '3',
        textAlign: 'center',
        textAlignVertical: 'middle',
        color: '#ffffff'
      },
      position: {
        x: d.x,
        y: d.y,
        origin: 'center'
      },
      geometry: {
        width: 520,
        height: 75
      }
    });

    if (res.id) {
      console.log(`  -> OK! Created shape ID: ${res.id}`);
    } else {
      console.error(`  -> FAILED:`, res);
    }
    await delay(120);
  }

  console.log('=== ALL 18 BADGES SUCCESSFULLY CREATED ON MIRO! ===');
}

run();
