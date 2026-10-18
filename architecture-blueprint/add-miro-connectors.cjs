/**
 * T7 Workout — Sports Analytics Platform
 * Connectors Generator for Miro Flowchart
 * 
 * Injects connecting arrows (connectors) between boxes across all columns
 * with a primary focus on Column 3 (System Architecture & Scientific Data Repository)
 * and missing links in Columns 1, 2, and 4.
 */

const https = require('https');

const BOARD_ID = 'uXjVEbo6L2o=';
const TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';

const HTTP_DELAY_MS = 200;
const STROKE_WIDTH_PX = '2.0';
const DEFAULT_SHAPE = 'elbowed';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * Utility delay function to respect Miro API rate limits
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch all existing connectors on the board to avoid creating duplicates
 * @returns {Promise<Array>} List of existing connectors
 */
async function getExistingConnectors() {
  return new Promise((resolve, reject) => {
    https.get(`https://api.miro.com/v2/boards/${encodeURIComponent(BOARD_ID)}/connectors?limit=100`, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.data || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Create a connector between two shapes on Miro
 * @param {Object} conn - Connector definition object { startId, endId, color, label }
 * @returns {Promise<Object>} Created connector data
 */
function createConnector(conn) {
  return new Promise((resolve, reject) => {
    const payload = {
      startItem: { id: conn.startId },
      endItem: { id: conn.endId },
      shape: DEFAULT_SHAPE,
      style: {
        strokeColor: conn.color,
        strokeWidth: STROKE_WIDTH_PX,
        strokeStyle: conn.style || 'normal',
        endStrokeCap: 'stealth'
      }
    };

    if (conn.caption) {
      payload.captions = [
        {
          content: conn.caption,
          position: 0.5
        }
      ];
    }

    const body = JSON.stringify(payload);
    const url = new URL(`https://api.miro.com/v2/boards/${encodeURIComponent(BOARD_ID)}/connectors`);
    const req = https.request(url, { method: 'POST', headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', err => reject(err));
    req.write(body);
    req.end();
  });
}

/**
 * Connector definitions to inject
 */
const connectorsToCreate = [
  // =========================================================================
  // COLONNA 3: ARCHITETTURA DI SISTEMA E DATA REPOSITORY SCIENTIFICO (Verde)
  // =========================================================================
  {
    startId: '3458764686744184735', // Header Colonna 3
    endId: '3458764686744238659',   // Thin Client React 18
    color: '#10b981',
    description: 'Col 3 Header -> Thin Client'
  },
  {
    startId: '3458764686744184735', // Header Colonna 3
    endId: '3458764686744238664',   // Service Worker & 3 Silos DB
    color: '#10b981',
    description: 'Col 3 Header -> Service Worker & 3 Silos DB'
  },
  {
    startId: '3458764686744238659', // Thin Client React 18
    endId: '3458764686744238667',   // Architettura Feature-Driven
    color: '#10b981',
    description: 'Thin Client -> Architettura Feature-Driven'
  },
  {
    startId: '3458764686744238664', // Service Worker & 3 Silos DB
    endId: '3458764686744238667',   // Architettura Feature-Driven
    color: '#10b981',
    description: 'Service Worker & DB -> Architettura Feature-Driven'
  },
  {
    startId: '3458764686744238667', // Architettura Feature-Driven
    endId: '3458764686744238669',   // Server Scatola Nera: Physics Engine VBT
    color: '#10b981',
    description: 'Feature-Driven -> Physics Engine VBT'
  },
  {
    startId: '3458764686744238667', // Architettura Feature-Driven
    endId: '3458764686744238673',   // PAP Stats Engine
    color: '#10b981',
    description: 'Feature-Driven -> PAP Stats Engine'
  },
  {
    startId: '3458764686744238669', // Physics Engine VBT
    endId: '3458764686744238675',   // Risk Analyzer & ImpactCalculator
    color: '#10b981',
    description: 'Physics Engine VBT -> Risk Analyzer & ImpactCalculator'
  },
  {
    startId: '3458764686744238673', // PAP Stats Engine
    endId: '3458764686744238677',   // Periodization & Session Builder
    color: '#10b981',
    description: 'PAP Stats Engine -> Periodization & Session Builder'
  },
  {
    startId: '3458764686744238675', // Risk Analyzer & ImpactCalculator
    endId: '3458764686744238680',   // Catalogo 296 Esercizi
    color: '#10b981',
    description: 'Risk Analyzer -> Catalogo 296 Esercizi'
  },
  {
    startId: '3458764686744238675', // Risk Analyzer & ImpactCalculator
    endId: '3458764686744238682',   // Dataset 119 Condizioni Cliniche
    color: '#10b981',
    description: 'Risk Analyzer -> Dataset 119 Condizioni Cliniche'
  },
  {
    startId: '3458764686744238677', // Periodization & Session Builder
    endId: '3458764686744238680',   // Catalogo 296 Esercizi
    color: '#10b981',
    description: 'Periodization Builder -> Catalogo 296 Esercizi'
  },
  {
    startId: '3458764686744238680', // Catalogo 296 Esercizi
    endId: '3458764686744238686',   // Archivio 322 Fonti Peer-Reviewed
    color: '#10b981',
    description: 'Catalogo 296 Esercizi -> Archivio 322 Fonti'
  },
  {
    startId: '3458764686744238682', // Dataset 119 Condizioni Cliniche
    endId: '3458764686744238686',   // Archivio 322 Fonti Peer-Reviewed
    color: '#10b981',
    description: 'Dataset 119 Condizioni Cliniche -> Archivio 322 Fonti'
  },

  // =========================================================================
  // COLONNA 1: FLUSSO ACCESSO & ONBOARDING (Blu)
  // =========================================================================
  {
    startId: '3458764686744184730', // Header Colonna 1
    endId: '3458764686744184901',   // Welcome Screen
    color: '#3b82f6',
    description: 'Col 1 Header -> Welcome Screen'
  },
  {
    startId: '3458764687272039876', // VAI ALL'HUB CENTRALE
    endId: '3458764686744238472',   // Home Dashboard Cockpit
    color: '#3b82f6',
    style: 'dashed',
    description: 'Col 1 Vai all Hub -> Col 2 Dashboard Cockpit'
  },

  // =========================================================================
  // COLONNA 2: HUB CENTRALE & COCKPIT (Viola)
  // =========================================================================
  {
    startId: '3458764686744184732', // Header Colonna 2
    endId: '3458764686744238472',   // Home Dashboard Cockpit
    color: '#8b5cf6',
    description: 'Col 2 Header -> Home Dashboard Cockpit'
  },
  {
    startId: '3458764686744238474', // Navigation Router
    endId: '3458764686744238505',   // Componenti Trasversali & UI Feedback
    color: '#8b5cf6',
    description: 'Router -> Componenti Trasversali & UI Feedback'
  },

  // =========================================================================
  // COLONNA 4: WORKFLOW FUNZIONALI ALGORITMICI (Arancione/Ambra)
  // =========================================================================
  {
    startId: '3458764686744184738', // Macro-header Colonna 4
    endId: '3458764686744238820',   // Workflow 1: Generatore Scheda
    color: '#ea580c',
    description: 'Col 4 Header -> Workflow 1'
  },
  {
    startId: '3458764686744184738', // Macro-header Colonna 4
    endId: '3458764686744238822',   // Workflow 2: Pipeline VBT
    color: '#ea580c',
    description: 'Col 4 Header -> Workflow 2'
  },
  {
    startId: '3458764686744184738', // Macro-header Colonna 4
    endId: '3458764686744238825',   // Workflow 3: Analisi PAP
    color: '#ea580c',
    description: 'Col 4 Header -> Workflow 3'
  },
  {
    startId: '3458764686744238820', // Workflow 1 Header
    endId: '3458764686744238828',   // Step 1: Input Atleta & Anamnesi
    color: '#ea580c',
    description: 'Workflow 1 Header -> Step 1'
  },
  {
    startId: '3458764686744238822', // Workflow 2 Header
    endId: '3458764686744238845',   // Step 1: Raccolta Dati VBT & Parser BLE
    color: '#ea580c',
    description: 'Workflow 2 Header -> Step 1'
  },
  {
    startId: '3458764686744238825', // Workflow 3 Header
    endId: '3458764686744269942',   // Step 1: Baseline Jump Test
    color: '#ea580c',
    description: 'Workflow 3 Header -> Step 1'
  }
];

/**
 * Main execution function
 */
async function main() {
  console.log('Fetching existing connectors on board to prevent duplicates...');
  const existing = await getExistingConnectors();
  const existingSet = new Set(existing.map(c => `${c.startItem?.id}->${c.endItem?.id}`));
  console.log(`Found ${existing.length} existing connectors.`);

  console.log(`\nStarting injection of ${connectorsToCreate.length} connectors...`);
  let createdCount = 0;
  let skippedCount = 0;

  for (const conn of connectorsToCreate) {
    const key = `${conn.startId}->${conn.endId}`;
    if (existingSet.has(key)) {
      console.log(`Skipping already existing connector: ${conn.description} (${key})`);
      skippedCount++;
      continue;
    }

    try {
      const created = await createConnector(conn);
      console.log(`Created connector [${created.id}]: ${conn.description}`);
      createdCount++;
      await sleep(HTTP_DELAY_MS);
    } catch (err) {
      console.error(`Failed to create connector [${conn.description}]:`, err.message);
    }
  }

  console.log(`\nFinished! Created: ${createdCount}, Skipped: ${skippedCount}, Total target: ${connectorsToCreate.length}`);
}

main().catch(console.error);
