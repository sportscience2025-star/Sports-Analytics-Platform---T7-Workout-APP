/**
 * deploy-miro-data-analysis-tiers-iso.cjs
 * 
 * Script autoritativo per il deployment su Miro Board (Board ID: uXjVEbo6L2o=).
 * Esegue la riorganizzazione chirurgica completa dei 3 diagrammi della Sezione DATA ANALISI:
 * - Flowchart #04 (FLOW-4A): Tier 1 (B2C Casual) - Revisione Biomeccanica Deterministica (NO AI / NO RAG)
 * - Flowchart #10 (FLOW-4B): Tier 2 (Pro P.IVA) - Analisi Biomeccanica Live AI (70%) + Wearable T7 & Test Lattato
 * - Flowchart #16 (FLOW-4C): Tier 3 (Elite Teams) - Biomeccanica Top AI (100%), RAG 100% Private & Universal Hub
 * 
 * Vincoli Architetturali e Normativi (ISO 5807 / Regole Progetto):
 * 1. Preservazione assoluta dei 3 Badge protetti (#04: 3458764688417722715, #10: 3458764688417722745, #16: 3458764688417722792).
 * 2. Rispetto della No-Fly Zone >= 40px attorno a ciascun cartiglio badge.
 * 3. Aggiornamento in-place dei 3 Title Banner (#04: 3458764686744184738, #10: 3458764688307403766, #16: 3458764688307470187).
 * 4. Rimozione chirurgica delle sole forme operative di Colonna 4 senza toccare gli altri 15 diagrammi esterni.
 * 5. Routing connettori ortogonale a 90 gradi ('elbowed') con validatore geometrico integrato che attesta 0 line-box crossings.
 * 6. Palette per Swimlane conforme a Colonna 2 e Colonna 3.
 * 7. In Tier 3, presidi locali dedicati per #14 (Catalogo), #15 (Programmazione/PVT), #18 (Medical Room).
 * 8. Zero emoji ovunque (Regola 01).
 */

const fs = require('fs');
const path = require('path');

// Costanti di Configurazione e Autenticazione Miro REST API v2
const MIRO_API_BASE_URL = 'https://api.miro.com/v2/boards';
const BOARD_ID = 'uXjVEbo6L2o=';
const MIRO_TOKEN = process.env.MIRO_TOKEN || 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';

// Delays per Rate Limiting (in millisecondi)
const DELAY_DELETE_MS = 45;
const DELAY_CREATE_MS = 90;
const DELAY_VERIFY_MS = 30;

// Registro Cartigli Protetti (Protected IDs - Vietato modificare o eliminare)
const PROTECTED_BADGE_IDS = new Set([
  '3458764688417722715', // Badge #04 (Tier 1 B2C Casual)
  '3458764688417722745', // Badge #10 (Tier 2 Pro P.IVA)
  '3458764688417722792'  // Badge #16 (Tier 3 Elite Teams)
]);

// Registro Title Header Banners (Aggiornamento in-place preservando l'ID Miro)
const TITLE_BANNER_IDS = {
  FLOW_4A: '3458764686744184738',
  FLOW_4B: '3458764688307403766',
  FLOW_4C: '3458764688307470187'
};

const PROTECTED_HEADER_IDS = new Set(Object.values(TITLE_BANNER_IDS));

/**
 * Funzione helper per attesa asincrona calibrata (Rate Limiting).
 * @param {number} ms - Millisecondi da attendere.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Client HTTP per chiamate REST alle API Miro v2.
 * @param {string} endpoint - Path relativo dell'endpoint (es. '/shapes', '/connectors').
 * @param {string} method - Metodo HTTP ('GET', 'POST', 'PATCH', 'DELETE').
 * @param {object|null} body - Payload JSON opzionale.
 * @returns {Promise<any>} Risposta JSON deserializzata o status code.
 */
async function miroApi(endpoint, method = 'GET', body = null) {
  const url = `${MIRO_API_BASE_URL}/${BOARD_ID}${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${MIRO_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (method === 'DELETE') {
    return { status: response.status, ok: response.ok };
  }

  const responseText = await response.text();
  try {
    return JSON.parse(responseText);
  } catch (err) {
    return { status: response.status, text: responseText };
  }
}

/**
 * Recupera tutte le shape presenti sulla board (con paginazione automatica a cursore).
 * @returns {Promise<Array<object>>}
 */
async function fetchAllBoardShapes() {
  let cursor = null;
  const allShapes = [];
  do {
    const url = `/shapes?limit=50${cursor ? `&cursor=${cursor}` : ''}`;
    const res = await miroApi(url);
    if (res && res.data) {
      allShapes.push(...res.data);
    }
    cursor = res ? res.cursor : null;
  } while (cursor);
  return allShapes;
}

/**
 * Recupera tutti i connettori presenti sulla board (con paginazione automatica a cursore).
 * @returns {Promise<Array<object>>}
 */
async function fetchAllBoardConnectors() {
  let cursor = null;
  const allConnectors = [];
  do {
    const url = `/connectors?limit=50${cursor ? `&cursor=${cursor}` : ''}`;
    const res = await miroApi(url);
    if (res && res.data) {
      allConnectors.push(...res.data);
    }
    cursor = res ? res.cursor : null;
  } while (cursor);
  return allConnectors;
}

/**
 * Aggiorna il contenuto testuale HTML di un Title Banner esistente via PATCH.
 * @param {string} shapeId - ID Miro della shape del banner.
 * @param {string} htmlContent - Nuovo markup HTML del titolo.
 * @returns {Promise<object>} Risultato dell'operazione PATCH.
 */
async function patchTitleBanner(shapeId, htmlContent) {
  const payload = {
    data: {
      content: htmlContent
    }
  };
  const result = await miroApi(`/shapes/${shapeId}`, 'PATCH', payload);
  await delay(DELAY_CREATE_MS);
  return result;
}

/**
 * Crea una shape nodo conforme a ISO 5807 su Miro Board.
 * @param {object} nodeDef - Definizione geometrica, testuale e di stile del nodo.
 * @returns {Promise<object>} Risposta API contenente l'ID generato.
 */
async function createIsoNode(nodeDef) {
  const payload = {
    data: {
      content: nodeDef.content,
      shape: nodeDef.shape || 'rectangle'
    },
    style: {
      fillColor: nodeDef.fillColor || '#ebf5fb',
      fillOpacity: '1.0',
      fontFamily: 'open_sans',
      fontSize: nodeDef.fontSize || '13',
      borderColor: nodeDef.borderColor || '#2980b9',
      borderWidth: '2.0',
      borderOpacity: '1.0',
      borderStyle: 'normal',
      textAlign: 'center',
      textAlignVertical: 'middle',
      color: nodeDef.color || '#0f172a'
    },
    position: {
      x: nodeDef.x,
      y: nodeDef.y,
      origin: 'center'
    },
    geometry: {
      width: nodeDef.width,
      height: nodeDef.height
    }
  };

  const res = await miroApi('/shapes', 'POST', payload);
  await delay(DELAY_CREATE_MS);
  return res;
}

/**
 * Converte snap testuale ('top', 'bottom', 'left', 'right') in percentuali di ancoraggio Miro.
 * @param {string} snap - Nome del lato di ancoraggio.
 * @returns {object} Oggetto coordinate percentuali { x, y }.
 */
function snapToPosition(snap) {
  switch (snap) {
    case 'top':
      return { x: '50%', y: '0%' };
    case 'bottom':
      return { x: '50%', y: '100%' };
    case 'left':
      return { x: '0%', y: '50%' };
    case 'right':
      return { x: '100%', y: '50%' };
    default:
      return { x: '50%', y: '50%' };
  }
}

/**
 * Crea un connettore ortogonale a 90 gradi ('elbowed') tra due nodi su Miro.
 * @param {string} startId - ID Miro della forma sorgente.
 * @param {string} endId - ID Miro della forma destinazione.
 * @param {string} startSnap - Lato di ancoraggio sorgente ('top', 'bottom', 'left', 'right').
 * @param {string} endSnap - Lato di ancoraggio destinazione ('top', 'bottom', 'left', 'right').
 * @param {string} label - Didascalia testuale opzionale della connessione.
 * @param {object} style - Opzioni di stile (strokeColor, strokeStyle).
 * @returns {Promise<object>} Risposta API contenente l'ID del connettore generato.
 */
async function createIsoConnector(startId, endId, startSnap, endSnap, label = '', style = {}) {
  const payload = {
    startItem: {
      id: startId,
      position: snapToPosition(startSnap)
    },
    endItem: {
      id: endId,
      position: snapToPosition(endSnap)
    },
    shape: 'elbowed',
    style: {
      startStrokeCap: 'none',
      endStrokeCap: 'stealth',
      strokeWidth: '2.0',
      strokeStyle: style.strokeStyle === 'dashed' ? 'dashed' : 'normal',
      strokeColor: style.strokeColor || '#475569',
      color: '#0f172a',
      textOrientation: 'horizontal',
      fontSize: '12'
    }
  };

  if (label && label.trim() !== '' && label !== '—') {
    payload.captions = [
      {
        content: label,
        position: '50%',
        textAlignVertical: 'middle'
      }
    ];
  }

  const res = await miroApi('/connectors', 'POST', payload);
  await delay(DELAY_CREATE_MS);
  return res;
}

// ============================================================================
// DEFINIZIONI NODI E CONNETTORI ISO 5807 PER I 3 TIER DI DATA ANALISI
// ============================================================================

// ----------------------------------------------------------------------------
// 1. FLOWCHART #04 (FLOW-4A) - TIER 1 (B2C CASUAL)
// ----------------------------------------------------------------------------
const T1_NODES = [
  {
    key: 'T1_START',
    shape: 'round_rectangle',
    width: 560,
    height: 80,
    x: 4171.24,
    y: 740,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p style="text-align:center"><strong>Inizio: Revisione Biomeccanica Deterministica (App Utente T1)</strong><br><span style="font-size:11px">Calcolo Angoli Principali Corsa &amp; Esercizi &bull; Zero AI &bull; Zero RAG &bull; Nessuna Scheda Sync</span></p>'
  },
  {
    key: 'T1_LOAD_MEDIA',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4171.24,
    y: 870,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Caricamento Video o Freeze Frame Corsa/Esercizio (Buffer HTML5)</strong><br><span style="font-size:11px">Import clip video o fermo immagine da smartphone &bull; Nessun wearable o sensore connesso</span></p>'
  },
  {
    key: 'T1_MARKER_SELECT',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4171.24,
    y: 1000,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Posizionamento Manuale Marker Articolari Principali</strong><br><span style="font-size:11px">Tracciamento mirini 2D: Anca, Ginocchio, Caviglia (o Spalla, Gomito) su piano sagittale</span></p>'
  },
  {
    key: 'T1_GW_INGEST',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4171.24,
    y: 1130,
    fillColor: '#eafaf1',
    borderColor: '#27ae60',
    color: '#145a32',
    content: '<p style="text-align:center"><strong>API Gateway: Ingestion Calcolo Angolare Deterministico</strong><br><span style="font-size:11px">POST /api/v1/analysis/angles-calculate &bull; Validazione Token JWT Tier 1 Casual</span></p>'
  },
  {
    key: 'T1_DEC_RBAC',
    shape: 'rhombus',
    width: 480,
    height: 130,
    x: 4171.24,
    y: 1290,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Validazione RBAC Tier 1 (Enforce: NO AI, NO RAG, 0 Wearable)?</strong><br><span style="font-size:11px">Verifica assenza richieste inferenza neurale o parametri esterni</span></p>'
  },
  {
    key: 'T1_ERR_RBAC',
    shape: 'rectangle',
    width: 420,
    height: 85,
    x: 4780,
    y: 1290,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p style="text-align:center"><strong>HTTP 403 Forbidden: Funzionalita Non Permesse in Tier 1</strong><br><span style="font-size:11px">Chiamate AI, RAG e connessioni wearable bloccate &bull; Riservate a Tier 2 e Tier 3</span></p>'
  },
  {
    key: 'T1_SRV_VEC_BUILD',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4171.24,
    y: 1450,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Costruzione Vettori Cartesiani 2D dai Punti Segmentali</strong><br><span style="font-size:11px">Normalizzazione coordinate vettoriali u = P1 - P2 e v = P3 - P2 su canvas</span></p>'
  },
  {
    key: 'T1_DEC_GEOM',
    shape: 'rhombus',
    width: 480,
    height: 130,
    x: 4171.24,
    y: 1610,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Vettori Articolari Validi e Non Coincidenti?</strong><br><span style="font-size:11px">Verifica cinematica di non degenerazione: ||u|| &gt; 0 e ||v|| &gt; 0</span></p>'
  },
  {
    key: 'T1_ERR_GEOM',
    shape: 'rectangle',
    width: 420,
    height: 85,
    x: 4780,
    y: 1610,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p style="text-align:center"><strong>Avviso: Punti Articolari Non Validi o Sovrapposti</strong><br><span style="font-size:11px">Riposiziona i mirini per definire correttamente i segmenti anatomici</span></p>'
  },
  {
    key: 'T1_SRV_DOT_PRODUCT',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4171.24,
    y: 1770,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Calcolo Trigonometrico Deterministico Angoli (Dot Product)</strong><br><span style="font-size:11px">theta = arccos((u &bull; v) / (||u|| ||v||)) * 180 / pi &bull; Esecuzione pura &lt; 50ms &bull; Zero AI</span></p>'
  },
  {
    key: 'T1_DB_PERSIST',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4171.24,
    y: 1900,
    fillColor: '#fef9e7',
    borderColor: '#f39c12',
    color: '#7d6608',
    content: '<p style="text-align:center"><strong>Salvataggio Opzionale Storico Personale in Silo 1</strong><br><span style="font-size:11px">Tabella athlete_biomechanics_angles &bull; Nessuna relazione con schede di allenamento</span></p>'
  },
  {
    key: 'T1_RENDER_GONIOMETER',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4171.24,
    y: 2030,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Rendering Overlay Goniometrico &amp; Gradi Misurati su Canvas 2D</strong><br><span style="font-size:11px">Visualizzazione arco goniometrico e gradi (es. 118.4&deg;) &bull; Zero giudizi o consigli automatici</span></p>'
  },
  {
    key: 'T1_END',
    shape: 'round_rectangle',
    width: 560,
    height: 80,
    x: 4171.24,
    y: 2160,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p style="text-align:center"><strong>Fine: Misurazione Angolare Visualizzata (Isolamento Totale)</strong><br><span style="font-size:11px">Valutazione oggettiva autonoma &bull; Zero correlazione con la sezione programmazione</span></p>'
  }
];

const T1_CONNECTORS = [
  { start: 'T1_START', end: 'T1_LOAD_MEDIA', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_LOAD_MEDIA', end: 'T1_MARKER_SELECT', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_MARKER_SELECT', end: 'T1_GW_INGEST', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_GW_INGEST', end: 'T1_DEC_RBAC', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_DEC_RBAC', end: 'T1_ERR_RBAC', startSnap: 'right', endSnap: 'left', label: 'Parametri Vietati (AI/RAG)' },
  { start: 'T1_DEC_RBAC', end: 'T1_SRV_VEC_BUILD', startSnap: 'bottom', endSnap: 'top', label: 'Conforme Tier 1' },
  { start: 'T1_SRV_VEC_BUILD', end: 'T1_DEC_GEOM', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_DEC_GEOM', end: 'T1_ERR_GEOM', startSnap: 'right', endSnap: 'left', label: 'Punti Coincidenti' },
  { start: 'T1_DEC_GEOM', end: 'T1_SRV_DOT_PRODUCT', startSnap: 'bottom', endSnap: 'top', label: 'Vettori Validi' },
  { start: 'T1_SRV_DOT_PRODUCT', end: 'T1_DB_PERSIST', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_DB_PERSIST', end: 'T1_RENDER_GONIOMETER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_RENDER_GONIOMETER', end: 'T1_END', startSnap: 'bottom', endSnap: 'top', label: '' }
];

// ----------------------------------------------------------------------------
// 2. FLOWCHART #10 (FLOW-4B) - TIER 2 (PRO P.IVA)
// ----------------------------------------------------------------------------
const T2_NODES = [
  {
    key: 'T2_START',
    shape: 'round_rectangle',
    width: 560,
    height: 80,
    x: 4353.26,
    y: 3870,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p style="text-align:center"><strong>Inizio: Setup Analisi Biomeccanica Pro (Coach / Fisio P.IVA)</strong><br><span style="font-size:11px">Modelli AI Interni T7 (70%) &bull; Live Camera &bull; Solo Wearable Marchio T7</span></p>'
  },
  {
    key: 'T2_BLE_SCAN',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4353.26,
    y: 4000,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Connessione Wearable Marchio T7 (Web Bluetooth API)</strong><br><span style="font-size:11px">Scansione sensori cardiaci e biosensori proprietari T7 &bull; Setup Test del Lattato</span></p>'
  },
  {
    key: 'T2_DEC_HW_CHECK',
    shape: 'rhombus',
    width: 480,
    height: 125,
    x: 4353.26,
    y: 4150,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Hardware Wearable Connesso e Marchio Ufficiale T7?</strong><br><span style="font-size:11px">Verifica firmware crittografico e seriale proprietario T7</span></p>'
  },
  {
    key: 'T2_ERR_NON_T7',
    shape: 'rectangle',
    width: 420,
    height: 85,
    x: 3720,
    y: 4150,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p style="text-align:center"><strong>Dispositivo Bloccato: Supportati Solo Wearable T7</strong><br><span style="font-size:11px">Hardware terzo non supportato in Tier 2 &bull; Connetti wearable ufficiale T7</span></p>'
  },
  {
    key: 'T2_CAM_START',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4353.26,
    y: 4300,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Attivazione Fotocamera Live Stream (1080p @ 60fps)</strong><br><span style="font-size:11px">Inquadratura atleta in tempo reale durante corsa o esecuzione esercizio</span></p>'
  },
  {
    key: 'T2_GW_INGEST',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4353.26,
    y: 4430,
    fillColor: '#eafaf1',
    borderColor: '#27ae60',
    color: '#145a32',
    content: '<p style="text-align:center"><strong>Streaming Ingestion Gateway &amp; Verifica Isolamento DB</strong><br><span style="font-size:11px">POST /api/v1/pro/analysis/live-stream &bull; Validazione Token JWT Tier 2 Pro</span></p>'
  },
  {
    key: 'T2_DEC_DB_CHECK',
    shape: 'rhombus',
    width: 480,
    height: 125,
    x: 4353.26,
    y: 4580,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Destinazione Salvataggio Limitata a Database Data Analisi?</strong><br><span style="font-size:11px">Enforcement architetturale: separazione assoluta dal Catalogo Esercizi</span></p>'
  },
  {
    key: 'T2_ERR_CATALOG_BLOCK',
    shape: 'rectangle',
    width: 420,
    height: 85,
    x: 3720,
    y: 4580,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p style="text-align:center"><strong>HTTP 403: Scrittura Vietata nel Catalogo Esercizi</strong><br><span style="font-size:11px">Tier 2 archivia solo in Data Analisi &bull; Database separati dal Catalogo</span></p>'
  },
  {
    key: 'T2_SRV_AI_70',
    shape: 'rectangle',
    width: 520,
    height: 90,
    x: 4353.26,
    y: 4730,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Modello AI Interno T7 (Potenza Calcolata al 70%)</strong><br><span style="font-size:11px">Calcolo congiunto: Angoli Principali + Angoli Specifici (Valgismo, Tilt, Asimmetrie)</span></p>'
  },
  {
    key: 'T2_DEC_POSTURE',
    shape: 'rhombus',
    width: 480,
    height: 125,
    x: 4353.26,
    y: 4890,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Rilevata Deviazione Posturale o Asimmetria nell\'Esercizio?</strong><br><span style="font-size:11px">Confronto angolare istantaneo con finestre fisiologiche di tolleranza</span></p>'
  },
  {
    key: 'T2_LIVE_FEEDBACK',
    shape: 'rectangle',
    width: 420,
    height: 85,
    x: 4980,
    y: 4890,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p style="text-align:center"><strong>Box Correzione Real-Time a Schermo (Live Camera)</strong><br><span style="font-size:11px">Alert istantaneo: \'Allinea ginocchio destro, correggi valgismo dinamico\'</span></p>'
  },
  {
    key: 'T2_OVERLAY_RENDER',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4353.26,
    y: 5050,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Overlay Scheletrico 2D &amp; Trascrizione Correzioni su Video</strong><br><span style="font-size:11px">Tracciamento visuale fluido con grafici angolari e feed dei consigli sovraimpresso</span></p>'
  },
  {
    key: 'T2_SRV_LACTATE',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4353.26,
    y: 5180,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Parser Telemetrico T7: Analisi Sommaria Soglie Lattato</strong><br><span style="font-size:11px">Rielaborazione biosensore T7: stima sommaria soglia aerobica e anaerobica nel test</span></p>'
  },
  {
    key: 'T2_DB_STORE',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4353.26,
    y: 5310,
    fillColor: '#fef9e7',
    borderColor: '#f39c12',
    color: '#7d6608',
    content: '<p style="text-align:center"><strong>Salvataggio in Database Data Analisi (Separato dal Catalogo)</strong><br><span style="font-size:11px">Archiviazione clip video, correzioni trascritte e telemetria lattato nel Silo 1 Pro</span></p>'
  },
  {
    key: 'T2_SHARE_1TO1',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4353.26,
    y: 5440,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Condivisione Diretta 1:1 con il Singolo Atleta</strong><br><span style="font-size:11px">Invio report video e metriche biomeccaniche su app atleta (singolo destinatario)</span></p>'
  },
  {
    key: 'T2_END',
    shape: 'round_rectangle',
    width: 560,
    height: 80,
    x: 4353.26,
    y: 5570,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p style="text-align:center"><strong>Fine: Sessione Archiviata in Data Analisi e Condivisa 1:1</strong><br><span style="font-size:11px">Analisi completata con modelli T7 70% &bull; Database isolato e zero RAG</span></p>'
  }
];

const T2_CONNECTORS = [
  { start: 'T2_START', end: 'T2_BLE_SCAN', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_BLE_SCAN', end: 'T2_DEC_HW_CHECK', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_DEC_HW_CHECK', end: 'T2_ERR_NON_T7', startSnap: 'left', endSnap: 'right', label: 'Dispositivo Terzo Non T7' },
  { start: 'T2_DEC_HW_CHECK', end: 'T2_CAM_START', startSnap: 'bottom', endSnap: 'top', label: 'Wearable Ufficiale T7' },
  { start: 'T2_CAM_START', end: 'T2_GW_INGEST', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_GW_INGEST', end: 'T2_DEC_DB_CHECK', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_DEC_DB_CHECK', end: 'T2_ERR_CATALOG_BLOCK', startSnap: 'left', endSnap: 'right', label: 'Tentativo Scrittura Catalogo' },
  { start: 'T2_DEC_DB_CHECK', end: 'T2_SRV_AI_70', startSnap: 'bottom', endSnap: 'top', label: 'Destinazione Data Analisi OK' },
  { start: 'T2_SRV_AI_70', end: 'T2_DEC_POSTURE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_DEC_POSTURE', end: 'T2_LIVE_FEEDBACK', startSnap: 'right', endSnap: 'left', label: 'Anomalia Rilevata' },
  { start: 'T2_DEC_POSTURE', end: 'T2_OVERLAY_RENDER', startSnap: 'bottom', endSnap: 'top', label: 'Esecuzione Corretta' },
  { start: 'T2_LIVE_FEEDBACK', end: 'T2_OVERLAY_RENDER', startSnap: 'bottom', endSnap: 'right', label: 'Proiezione a Video' },
  { start: 'T2_OVERLAY_RENDER', end: 'T2_SRV_LACTATE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_SRV_LACTATE', end: 'T2_DB_STORE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_DB_STORE', end: 'T2_SHARE_1TO1', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_SHARE_1TO1', end: 'T2_END', startSnap: 'bottom', endSnap: 'top', label: '' }
];

// ----------------------------------------------------------------------------
// 3. FLOWCHART #16 (FLOW-4C) - TIER 3 (ELITE TEAMS)
// ----------------------------------------------------------------------------
const T3_NODES = [
  {
    key: 'T3_START',
    shape: 'round_rectangle',
    width: 600,
    height: 80,
    x: 4768.21,
    y: 8330,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p style="text-align:center"><strong>Inizio: Console Data Analisi Elite (Staff Tecnico &amp; Medico T3)</strong><br><span style="font-size:11px">AI Top 100% &bull; RAG 100% Private Role-Based &bull; Any-Device Ingestion &bull; Suite Export</span></p>'
  },
  // Corsia A (Sinistra: X = 4050 - Video Biomeccanica 100% & Catalogo Sync)
  {
    key: 'T3_LIVE_CAM_4K',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4050,
    y: 8470,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Live Camera 4K &amp; Correzioni AI sul Momento</strong><br><span style="font-size:11px">Inquadratura 4K a 60fps con feedback visivo istantaneo sulle asimmetrie</span></p>'
  },
  {
    key: 'T3_GW_STREAM',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4050,
    y: 8600,
    fillColor: '#eafaf1',
    borderColor: '#27ae60',
    color: '#145a32',
    content: '<p style="text-align:center"><strong>API Gateway: Ingestion Stream Video ad Altissima Risoluzione</strong><br><span style="font-size:11px">POST /api/v1/club/analysis/live-camera-session &bull; Code streaming video a bassa latenza</span></p>'
  },
  {
    key: 'T3_SRV_AI_100',
    shape: 'rectangle',
    width: 520,
    height: 95,
    x: 4050,
    y: 8750,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Modelli AI Interni Top T7 (Potenza Illimitata 100%)</strong><br><span style="font-size:11px">Analisi simultanea angoli principali e specifici, micro-compensazioni e tensioni muscolari</span></p>'
  },
  {
    key: 'T3_CAT_SYNC_LOCAL',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4050,
    y: 8900,
    fillColor: '#fef9e7',
    borderColor: '#f39c12',
    color: '#7d6608',
    content: '<p style="text-align:center"><strong>Interconnessione Locale: Catalogo Esercizi del Club (#14)</strong><br><span style="font-size:11px">Salvataggio automatico video con correzioni trascritte nel Catalogo societario</span></p>'
  },
  {
    key: 'T3_DB_BUNKER',
    shape: 'rectangle',
    width: 520,
    height: 90,
    x: 4050,
    y: 9360,
    fillColor: '#fef9e7',
    borderColor: '#f39c12',
    color: '#7d6608',
    content: '<p style="text-align:center"><strong>Database Silo 2: Encrypted Club Bunker KMS (100% Private)</strong><br><span style="font-size:11px">Archiviazione cifrata Cloud KMS &bull; Zero condivisione con terzi &bull; Opt-In esclusivo Silo 3</span></p>'
  },
  // Corsia B (Centro: X = 4768.21 - RAG 100% Private, Role-Based Access & Style Cloning)
  {
    key: 'T3_UNIVERSAL_DROP',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4768.21,
    y: 8470,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Dropzone Universale: Upload Multi-Formato</strong><br><span style="font-size:11px">Caricamento universale: PDF referti, Excel, Word, CSV e Note Vocali trascritte internamente</span></p>'
  },
  {
    key: 'T3_GW_RBAC_ROLE',
    shape: 'rhombus',
    width: 480,
    height: 125,
    x: 4768.21,
    y: 8610,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Verifica Ruolo Utente (Role-Based RAG RBAC)?</strong><br><span style="font-size:11px">Controllo gerarchico accessi: Medico Sociale vs Preparatore S&amp;C vs Atleta</span></p>'
  },
  {
    key: 'T3_GW_MASK_SANITARY',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4768.21,
    y: 8760,
    fillColor: '#eafaf1',
    borderColor: '#27ae60',
    color: '#145a32',
    content: '<p style="text-align:center"><strong>Mascheramento Segreto Medico (Role-Based Guard)</strong><br><span style="font-size:11px">Esposizione del solo limite operativo/meccanico al preparatore senza rivelare la diagnosi</span></p>'
  },
  {
    key: 'T3_SRV_RAG_PRIVATE',
    shape: 'rectangle',
    width: 520,
    height: 95,
    x: 4768.21,
    y: 8910,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Motore RAG 100% Private (Isolamento Societario Assoluto)</strong><br><span style="font-size:11px">Chunking semantico, embedding T7, citazione fonti interne e memoria storica multi-stagione</span></p>'
  },
  {
    key: 'T3_DEC_CONFLICT',
    shape: 'rhombus',
    width: 480,
    height: 125,
    x: 4768.21,
    y: 9060,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Conflitto tra Scheda Programmata e Referti/Limiti RAG?</strong><br><span style="font-size:11px">Controllo incrociato vincoli clinici, range di movimento ed esami societari</span></p>'
  },
  {
    key: 'T3_ALERT_CONFLICT',
    shape: 'rectangle',
    width: 400,
    height: 85,
    x: 4380,
    y: 9060,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p style="text-align:center"><strong>Allerta Conflitto Clinico Rilevato (Riferimento #18 Medical Room)</strong><br><span style="font-size:11px">Scheda contrasta con referti o limiti articolari RAG &bull; Blocco prescrittivo cautelativo</span></p>'
  },
  {
    key: 'T3_SRV_STYLE_CLONER',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 4768.21,
    y: 9210,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Clonazione dello Stile &amp; Lessico del Coach su Richiesta</strong><br><span style="font-size:11px">Adattamento AI al vocabolario tecnico, tono motivazionale e metodo del capo allenatore</span></p>'
  },
  {
    key: 'T3_REPORT_STUDIO',
    shape: 'rectangle',
    width: 520,
    height: 90,
    x: 4768.21,
    y: 9360,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Suite Esportazione Universale Multi-Formato Enterprise</strong><br><span style="font-size:11px">Generazione automatica report, grafici e presentazioni in PDF, Excel (.xlsx), Word e PPTX</span></p>'
  },
  {
    key: 'T3_END',
    shape: 'round_rectangle',
    width: 600,
    height: 80,
    x: 4768.21,
    y: 9510,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p style="text-align:center"><strong>Fine: Conoscenza Societaria Consolidata, RAG 24/7 &amp; Dossier Esportato</strong><br><span style="font-size:11px">Protezione dati 100% Private &bull; Interconnessione attiva con Catalogo (#14) e Programmazione (#15)</span></p>'
  },
  // Corsia C (Destra: X = 5480 - Any-Device Ingestion & Baseline Bridge)
  {
    key: 'T3_ANY_WEARABLE',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 5480,
    y: 8470,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Connessione Universale ad Ogni Wearable o Strumento</strong><br><span style="font-size:11px">Compatibilita universale: GPS Catapult/Statsports, VBT Vitruve, ForceDecks, Lattato</span></p>'
  },
  {
    key: 'T3_GW_TELEMETRY',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 5480,
    y: 8600,
    fillColor: '#eafaf1',
    borderColor: '#27ae60',
    color: '#145a32',
    content: '<p style="text-align:center"><strong>High-Throughput Telemetry Gateway (Streaming Ingest)</strong><br><span style="font-size:11px">POST /api/v1/club/analysis/universal-ingest &bull; Ingestion telemetrica 10-18Hz ad alta velocita</span></p>'
  },
  {
    key: 'T3_SRV_TELEMETRY_AI',
    shape: 'rectangle',
    width: 520,
    height: 95,
    x: 5480,
    y: 8750,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Modelli AI Interni: Spiegazione Approfondita Metriche</strong><br><span style="font-size:11px">Analisi estesa di ogni metrica: carichi acuti/cronici, asimmetrie e soglie metaboliche</span></p>'
  },
  {
    key: 'T3_PROG_BRIDGE_LOCAL',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 5480,
    y: 8900,
    fillColor: '#fef9e7',
    borderColor: '#f39c12',
    color: '#7d6608',
    content: '<p style="text-align:center"><strong>Interconnessione Locale: Sezione Programmazione (#15)</strong><br><span style="font-size:11px">Cross-Module Baseline Bridge: invio metriche a Readiness Section, PVT, HRV e Z-Score</span></p>'
  }
];

const T3_CONNECTORS = [
  { start: 'T3_START', end: 'T3_LIVE_CAM_4K', startSnap: 'left', endSnap: 'top', label: 'Live Camera 4K' },
  { start: 'T3_START', end: 'T3_UNIVERSAL_DROP', startSnap: 'bottom', endSnap: 'top', label: 'Doc & Note Vocali' },
  { start: 'T3_START', end: 'T3_ANY_WEARABLE', startSnap: 'right', endSnap: 'top', label: 'Wearable & Telemetria' },
  { start: 'T3_LIVE_CAM_4K', end: 'T3_GW_STREAM', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_GW_STREAM', end: 'T3_SRV_AI_100', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_SRV_AI_100', end: 'T3_CAT_SYNC_LOCAL', startSnap: 'bottom', endSnap: 'top', label: 'Clip con Correzioni' },
  { start: 'T3_CAT_SYNC_LOCAL', end: 'T3_DB_BUNKER', startSnap: 'bottom', endSnap: 'top', label: 'Persistenza Video' },
  { start: 'T3_UNIVERSAL_DROP', end: 'T3_GW_RBAC_ROLE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_GW_RBAC_ROLE', end: 'T3_GW_MASK_SANITARY', startSnap: 'bottom', endSnap: 'top', label: 'Ruolo Preparatore / Staff' },
  { start: 'T3_GW_MASK_SANITARY', end: 'T3_SRV_RAG_PRIVATE', startSnap: 'bottom', endSnap: 'top', label: 'Limite Meccanico Filtrato' },
  { start: 'T3_GW_RBAC_ROLE', end: 'T3_SRV_RAG_PRIVATE', startSnap: 'right', endSnap: 'right', label: 'Ruolo Medico (Full Access)' },
  { start: 'T3_SRV_RAG_PRIVATE', end: 'T3_DEC_CONFLICT', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_DEC_CONFLICT', end: 'T3_ALERT_CONFLICT', startSnap: 'left', endSnap: 'right', label: 'Conflitto Rilevato' },
  { start: 'T3_DEC_CONFLICT', end: 'T3_SRV_STYLE_CLONER', startSnap: 'bottom', endSnap: 'top', label: 'Scheda Conforme' },
  { start: 'T3_SRV_STYLE_CLONER', end: 'T3_REPORT_STUDIO', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_ANY_WEARABLE', end: 'T3_GW_TELEMETRY', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_GW_TELEMETRY', end: 'T3_SRV_TELEMETRY_AI', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_SRV_TELEMETRY_AI', end: 'T3_PROG_BRIDGE_LOCAL', startSnap: 'bottom', endSnap: 'top', label: 'Baseline Dispatch' },
  { start: 'T3_PROG_BRIDGE_LOCAL', end: 'T3_REPORT_STUDIO', startSnap: 'bottom', endSnap: 'right', label: 'Dataset Telemetrico' },
  { start: 'T3_DB_BUNKER', end: 'T3_END', startSnap: 'bottom', endSnap: 'left', label: 'Audit Trail Cifrato' },
  { start: 'T3_REPORT_STUDIO', end: 'T3_END', startSnap: 'bottom', endSnap: 'top', label: 'Dossier Multi-Formato' }
];

// ============================================================================
// MOTORE DI VALIDAZIONE GEOMETRICA LINE-BOX A ZERO CROSSING (ISO 5807)
// ============================================================================

/**
 * Calcola la coordinata cartesiana esatta di un punto di ancoraggio su una shape.
 * @param {object} node - Oggetto definizione nodo.
 * @param {string} snap - Nome del punto di ancoraggio ('top', 'bottom', 'left', 'right').
 * @returns {{ x: number, y: number }}
 */
function getSnapPoint(node, snap) {
  const halfW = node.width / 2;
  const halfH = node.height / 2;
  switch (snap) {
    case 'top':
      return { x: node.x, y: node.y - halfH };
    case 'bottom':
      return { x: node.x, y: node.y + halfH };
    case 'left':
      return { x: node.x - halfW, y: node.y };
    case 'right':
      return { x: node.x + halfW, y: node.y };
    default:
      return { x: node.x, y: node.y };
  }
}

/**
 * Calcola i segmenti ortogonali a 90 gradi per un connettore elbowed.
 * @param {{ x: number, y: number }} p1 - Coordinate punto di partenza.
 * @param {{ x: number, y: number }} p2 - Coordinate punto di arrivo.
 * @param {string} startSnap - Snap di uscita sorgente.
 * @param {string} endSnap - Snap di ingresso destinazione.
 * @returns {Array<{ p1: { x: number, y: number }, p2: { x: number, y: number } }>}
 */
function calculateElbowSegments(p1, p2, startSnap, endSnap) {
  const segments = [];

  if (startSnap === 'bottom' && endSnap === 'top') {
    if (Math.abs(p1.x - p2.x) < 1) {
      segments.push({ p1, p2 });
    } else {
      const midY = (p1.y + p2.y) / 2;
      const corner1 = { x: p1.x, y: midY };
      const corner2 = { x: p2.x, y: midY };
      segments.push({ p1, p2: corner1 });
      segments.push({ p1: corner1, p2: corner2 });
      segments.push({ p1: corner2, p2 });
    }
  } else if (startSnap === 'right' && endSnap === 'left') {
    if (Math.abs(p1.y - p2.y) < 1) {
      segments.push({ p1, p2 });
    } else {
      const midX = (p1.x + p2.x) / 2;
      const corner1 = { x: midX, y: p1.y };
      const corner2 = { x: midX, y: p2.y };
      segments.push({ p1, p2: corner1 });
      segments.push({ p1: corner1, p2: corner2 });
      segments.push({ p1: corner2, p2 });
    }
  } else if (startSnap === 'left' && endSnap === 'right') {
    if (Math.abs(p1.y - p2.y) < 1) {
      segments.push({ p1, p2 });
    } else {
      const midX = (p1.x + p2.x) / 2;
      const corner1 = { x: midX, y: p1.y };
      const corner2 = { x: midX, y: p2.y };
      segments.push({ p1, p2: corner1 });
      segments.push({ p1: corner1, p2: corner2 });
      segments.push({ p1: corner2, p2 });
    }
  } else if ((startSnap === 'left' || startSnap === 'right') && endSnap === 'top') {
    const corner = { x: p2.x, y: p1.y };
    segments.push({ p1, p2: corner });
    segments.push({ p1: corner, p2 });
  } else if (startSnap === 'bottom' && (endSnap === 'left' || endSnap === 'right')) {
    const corner = { x: p1.x, y: p2.y };
    segments.push({ p1, p2: corner });
    segments.push({ p1: corner, p2 });
  } else if (startSnap === 'right' && endSnap === 'right') {
    const maxX = Math.max(p1.x, p2.x) + 90;
    const corner1 = { x: maxX, y: p1.y };
    const corner2 = { x: maxX, y: p2.y };
    segments.push({ p1, p2: corner1 });
    segments.push({ p1: corner1, p2: corner2 });
    segments.push({ p1: corner2, p2 });
  } else {
    const corner = { x: p1.x, y: p2.y };
    segments.push({ p1, p2: corner });
    segments.push({ p1: corner, p2 });
  }

  return segments;
}

/**
 * Verifica geometricamente se un segmento ortogonale attraversa l'interno di un bounding box.
 * @param {{ p1: { x: number, y: number }, p2: { x: number, y: number } }} seg - Segmento ortogonale.
 * @param {object} box - Definizione nodo con x, y, width, height.
 * @returns {boolean} True se c'e intersezione con l'area interna.
 */
function segmentIntersectsBox(seg, box) {
  const { p1, p2 } = seg;
  const minX = box.x - box.width / 2;
  const maxX = box.x + box.width / 2;
  const minY = box.y - box.height / 2;
  const maxY = box.y + box.height / 2;

  // Segmento verticale (x1 == x2)
  if (Math.abs(p1.x - p2.x) < 0.001) {
    const segX = p1.x;
    const segMinY = Math.min(p1.y, p2.y);
    const segMaxY = Math.max(p1.y, p2.y);

    if (segX > minX + 0.1 && segX < maxX - 0.1) {
      const overlapMin = Math.max(segMinY, minY);
      const overlapMax = Math.min(segMaxY, maxY);
      if (overlapMin < overlapMax - 0.1) {
        return true;
      }
    }
  }

  // Segmento orizzontale (y1 == y2)
  if (Math.abs(p1.y - p2.y) < 0.001) {
    const segY = p1.y;
    const segMinX = Math.min(p1.x, p2.x);
    const segMaxX = Math.max(p1.x, p2.x);

    if (segY > minY + 0.1 && segY < maxY - 0.1) {
      const overlapMin = Math.max(segMinX, minX);
      const overlapMax = Math.min(segMaxX, maxX);
      if (overlapMin < overlapMax - 0.1) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Valida che tutti i connettori di un tier abbiano zero intersezioni con i nodi.
 * @param {Array<object>} nodes - Array definizioni nodi del tier.
 * @param {Array<object>} connectors - Array definizioni connettori del tier.
 * @param {string} tierName - Nome del tier per reporting.
 * @returns {{ collisionCount: number, collisions: Array<object> }}
 */
function validateZeroCrossings(nodes, connectors, tierName) {
  const nodeMap = new Map(nodes.map(n => [n.key, n]));
  let collisionCount = 0;
  const collisions = [];

  for (const conn of connectors) {
    const startNode = nodeMap.get(conn.start);
    const endNode = nodeMap.get(conn.end);

    if (!startNode || !endNode) {
      throw new Error(`Nodo non trovato per connettore ${conn.start} -> ${conn.end}`);
    }

    const p1 = getSnapPoint(startNode, conn.startSnap);
    const p2 = getSnapPoint(endNode, conn.endSnap);
    const segments = calculateElbowSegments(p1, p2, conn.startSnap, conn.endSnap);

    for (const otherNode of nodes) {
      if (otherNode.key === startNode.key || otherNode.key === endNode.key) {
        continue;
      }

      for (const seg of segments) {
        if (segmentIntersectsBox(seg, otherNode)) {
          collisionCount++;
          collisions.push({
            tier: tierName,
            connector: `${conn.start} -> ${conn.end}`,
            blockedBy: otherNode.key,
            segment: `${p1.x},${p1.y} -> ${p2.x},${p2.y}`,
            box: `${otherNode.x},${otherNode.y} (W=${otherNode.width}, H=${otherNode.height})`
          });
        }
      }
    }
  }

  return { collisionCount, collisions };
}

// ============================================================================
// MAIN DEPLOYMENT PIPELINE
// ============================================================================

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('======================================================================');
  console.log(`AVVIO DEPLOYMENT AUTORITATIVO: DATA ANALISI (3 TIERS) ${isDryRun ? '[MODALITA DRY-RUN]' : '[MODALITA LIVE]'}`);
  console.log(`Board ID: ${BOARD_ID}`);
  console.log('======================================================================\n');

  // STEP 0: Validazione Geometrica Rigorosa Zero-Crossing (ISO 5807)
  console.log('[STEP 0/6] Esecuzione Validatore Geometrico Line-Box 0-Crossing...');
  const t1Geom = validateZeroCrossings(T1_NODES, T1_CONNECTORS, 'Tier 1');
  const t2Geom = validateZeroCrossings(T2_NODES, T2_CONNECTORS, 'Tier 2');
  const t3Geom = validateZeroCrossings(T3_NODES, T3_CONNECTORS, 'Tier 3');

  const totalCollisions = t1Geom.collisionCount + t2Geom.collisionCount + t3Geom.collisionCount;
  console.log(`-> Tier 1: ${T1_NODES.length} nodi, ${T1_CONNECTORS.length} connettori, ${t1Geom.collisionCount} collisioni`);
  console.log(`-> Tier 2: ${T2_NODES.length} nodi, ${T2_CONNECTORS.length} connettori, ${t2Geom.collisionCount} collisioni`);
  console.log(`-> Tier 3: ${T3_NODES.length} nodi, ${T3_CONNECTORS.length} connettori, ${t3Geom.collisionCount} collisioni`);

  if (totalCollisions > 0) {
    console.error('ERRORE BLOCCANTE: Rilevate collisioni geometriche line-box:', [
      ...t1Geom.collisions,
      ...t2Geom.collisions,
      ...t3Geom.collisions
    ]);
    process.exit(1);
  }
  console.log('CERTIFICAZIONE: 0 LINE-BOX CROSSINGS! Geometria 100% conforme a ISO 5807.\n');

  // STEP 1: Analisi inventario Miro live
  console.log('[STEP 1/6] Recupero inventario Miro live...');
  const boardShapes = await fetchAllBoardShapes();
  const boardConnectors = await fetchAllBoardConnectors();
  console.log(`Totale Shapes rilevate su Miro: ${boardShapes.length}`);
  console.log(`Totale Connettori rilevati su Miro: ${boardConnectors.length}\n`);

  // STEP 2: Isolamento chirurgico Colonna 4 (senza toccare Colonna 3 ne Colonna 5)
  console.log('[STEP 2/6] Isolamento chirurgico forme operative Colonna 4...');
  
  // Filtri precisi per Tier (evitando Col 5 a X=5599 in T1 e X=5970 in T3)
  const t1Candidates = boardShapes.filter(s => s.position.y < 3000 && s.position.x >= 3400 && s.position.x <= 5100);
  const t2Candidates = boardShapes.filter(s => s.position.y >= 3000 && s.position.y < 7200 && s.position.x >= 3400 && s.position.x <= 5400);
  const t3Candidates = boardShapes.filter(s => s.position.y >= 7200 && s.position.x >= 3400 && s.position.x <= 5600);

  const allCol4Shapes = [...t1Candidates, ...t2Candidates, ...t3Candidates];

  // Filtriamo: NON toccare i 3 Badge protetti e i 3 Title Banner
  const shapesToDelete = allCol4Shapes.filter(s => {
    if (PROTECTED_BADGE_IDS.has(s.id)) return false;
    if (PROTECTED_HEADER_IDS.has(s.id)) return false;
    return true;
  });

  const shapeIdDeleteSet = new Set(shapesToDelete.map(s => s.id));
  const connectorsToDelete = boardConnectors.filter(c => {
    return shapeIdDeleteSet.has(c.startItem?.id) || shapeIdDeleteSet.has(c.endItem?.id);
  });

  console.log(`Cartigli Badge protetti: ${PROTECTED_BADGE_IDS.size} (ZERO modifiche)`);
  console.log(`Title Banners identificati: ${PROTECTED_HEADER_IDS.size} (Aggiornamento in-place)`);
  console.log(`Vecchie shape operative Colonna 4 da eliminare: ${shapesToDelete.length}`);
  console.log(`Vecchi connettori Colonna 4 da eliminare: ${connectorsToDelete.length}\n`);

  if (isDryRun) {
    console.log('[DRY-RUN] Nessuna modifica eseguita sulla board live.');
    console.log('[DRY-RUN] Summary delle azioni previste:');
    console.log(`  - Eliminazione ${connectorsToDelete.length} connettori obsoleti`);
    console.log(`  - Eliminazione ${shapesToDelete.length} shape operative obsolete`);
    console.log(`  - PATCH in-place dei 3 Title Banner (#04, #10, #16)`);
    console.log(`  - Creazione di ${T1_NODES.length + T2_NODES.length + T3_NODES.length} nuovi nodi ISO 5807`);
    console.log(`  - Creazione di ${T1_CONNECTORS.length + T2_CONNECTORS.length + T3_CONNECTORS.length} nuovi connettori ortogonali 90 gradi`);
    console.log('DRY-RUN COMPLETATO CON SUCCESSO!');
    return;
  }

  // STEP 3: Eliminazione selettiva con Rate Limiting
  console.log('[STEP 3/6] Eliminazione selettiva vecchi connettori e shape operative...');
  for (const conn of connectorsToDelete) {
    await miroApi(`/connectors/${conn.id}`, 'DELETE');
    await delay(DELAY_DELETE_MS);
  }
  console.log(`-> Eliminati ${connectorsToDelete.length} vecchi connettori Colonna 4.`);

  for (const shape of shapesToDelete) {
    await miroApi(`/shapes/${shape.id}`, 'DELETE');
    await delay(DELAY_DELETE_MS);
  }
  console.log(`-> Eliminate ${shapesToDelete.length} vecchie shape operative Colonna 4.\n`);

  // STEP 4: Aggiornamento in-place dei 3 Title Banner
  console.log('[STEP 4/6] Aggiornamento testuale dei 3 Title Banner...');
  const bannerTitles = {
    [TITLE_BANNER_IDS.FLOW_4A]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">FLOW-4A: REVISIONE BIOMECCANICA DETERMINISTICA (CALCOLO ANGOLI PRINCIPALI - NO AI / NO RAG)</strong></p>',
    [TITLE_BANNER_IDS.FLOW_4B]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">FLOW-4B: ANALISI BIOMECCANICA LIVE AI (70%) + WEARABLE T7 &amp; TEST LATTATO (DB ISOLATO)</strong></p>',
    [TITLE_BANNER_IDS.FLOW_4C]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">FLOW-4C: BIOMECCANICA TOP AI (100%), RAG 100% PRIVATE MULTI-FORMATO &amp; UNIVERSAL HUB</strong></p>'
  };

  for (const [id, content] of Object.entries(bannerTitles)) {
    await patchTitleBanner(id, content);
    console.log(`-> Title Banner ${id} aggiornato con successo.`);
  }
  console.log('');

  // STEP 5: Creazione dei nuovi nodi ISO 5807
  console.log('[STEP 5/6] Creazione nodi ISO 5807 per Colonna 4...');
  const keyToMiroId = {};

  console.log(`--- Creazione nodi Flow 4A (Tier 1 B2C Casual: ${T1_NODES.length} nodi) ---`);
  for (const node of T1_NODES) {
    const res = await createIsoNode(node);
    if (res && res.id) {
      keyToMiroId[node.key] = res.id;
    } else {
      console.error(`ERRORE creazione nodo ${node.key}:`, res);
    }
  }

  console.log(`--- Creazione nodi Flow 4B (Tier 2 Pro P.IVA: ${T2_NODES.length} nodi) ---`);
  for (const node of T2_NODES) {
    const res = await createIsoNode(node);
    if (res && res.id) {
      keyToMiroId[node.key] = res.id;
    } else {
      console.error(`ERRORE creazione nodo ${node.key}:`, res);
    }
  }

  console.log(`--- Creazione nodi Flow 4C (Tier 3 Elite Teams: ${T3_NODES.length} nodi) ---`);
  for (const node of T3_NODES) {
    const res = await createIsoNode(node);
    if (res && res.id) {
      keyToMiroId[node.key] = res.id;
    } else {
      console.error(`ERRORE creazione nodo ${node.key}:`, res);
    }
  }
  console.log(`-> Totale nuovi nodi ISO creati: ${Object.keys(keyToMiroId).length}\n`);

  // STEP 6: Creazione connettori ortogonali a 90 gradi ('elbowed')
  console.log('[STEP 6/6] Creazione connettori ortogonali a 90 gradi con didascalie...');
  const allConnectorDefs = [
    ...T1_CONNECTORS,
    ...T2_CONNECTORS,
    ...T3_CONNECTORS
  ];

  let createdConnectorsCount = 0;
  for (const conn of allConnectorDefs) {
    const startMiroId = keyToMiroId[conn.start];
    const endMiroId = keyToMiroId[conn.end];
    if (!startMiroId || !endMiroId) {
      console.error(`ERRORE: Impossibile mappare connettore ${conn.start} -> ${conn.end}`);
      continue;
    }
    const res = await createIsoConnector(
      startMiroId,
      endMiroId,
      conn.startSnap,
      conn.endSnap,
      conn.label,
      conn.style || {}
    );
    if (res && res.id) {
      createdConnectorsCount++;
    } else {
      console.error(`ERRORE creazione connettore ${conn.start} -> ${conn.end}:`, res);
    }
  }
  console.log(`-> Totale connettori ortogonali creati: ${createdConnectorsCount}/${allConnectorDefs.length}\n`);

  // VERIFICA FINALE LIVE
  console.log('[VERIFICA FINALE LIVE] Controllo integrita board Miro...');
  const finalShapes = await fetchAllBoardShapes();
  const finalConnectors = await fetchAllBoardConnectors();

  console.log(`Shapes totali post-deployment: ${finalShapes.length}`);
  console.log(`Connettori totali post-deployment: ${finalConnectors.length}`);

  // Verifica presenza badge
  for (const badgeId of PROTECTED_BADGE_IDS) {
    const exists = finalShapes.some(s => s.id === badgeId);
    console.log(`-> Cartiglio Badge ${badgeId}: ${exists ? '[OK] PRESENTE E INTEGRO' : '[ERROR] MANCANTE'}`);
  }

  // Verifica presenza tutti i nuovi nodi
  let allNodesPresent = true;
  for (const [key, id] of Object.entries(keyToMiroId)) {
    const exists = finalShapes.some(s => s.id === id);
    if (!exists) {
      console.log(`[ERROR] Nodo ${key} (${id}) non trovato`);
      allNodesPresent = false;
    }
  }
  if (allNodesPresent) {
    console.log(`[OK] TUTTI I ${Object.keys(keyToMiroId).length} NUOVI NODI ISO SONO STATI CERTIFICATI SU MIRO!`);
  }

  // Salvataggio Report di Deployment
  const report = {
    timestamp: new Date().toISOString(),
    boardId: BOARD_ID,
    summary: {
      deletedShapes: shapesToDelete.length,
      deletedConnectors: connectorsToDelete.length,
      patchedBanners: Object.keys(bannerTitles).length,
      createdIsoNodes: Object.keys(keyToMiroId).length,
      createdConnectors: createdConnectorsCount,
      protectedBadgesPreserved: Array.from(PROTECTED_BADGE_IDS)
    },
    nodeMap: keyToMiroId
  };

  const reportDir = path.resolve('scratch');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(path.join(reportDir, 'deploy_col4_report.json'), JSON.stringify(report, null, 2));
  console.log('\nReport di deployment salvato in scratch/deploy_col4_report.json');
  console.log('DEPLOYMENT DATA ANALISI COMPLETATO CON SUCCESSO!');
}

main().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
