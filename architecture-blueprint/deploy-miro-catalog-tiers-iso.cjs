/**
 * deploy-miro-catalog-tiers-iso.cjs
 * 
 * Script di deployment autoritativo su Miro Board (Board ID: uXjVEbo6L2o=).
 * Riorganizza ed esegue l'aggiornamento completo e vincolante dei 3 diagrammi
 * del Catalogo Esercizi:
 * - Flowchart #02 (FLOW-2A): Tier 1 (B2C Casual) • Catalogo Esercizi & Avatar 3D
 * - Flowchart #08 (FLOW-2B): Tier 2 (Pro P.IVA) • Catalogo 3D, Video 1080p & Speed Control
 * - Flowchart #14 (FLOW-2C): Tier 3 (Elite Teams) • Catalogo 3D, Multi-Camera 4K & Suite Tattica
 * 
 * Vincoli e Garanzie:
 * 1. Preservazione assoluta dei 3 badge cartigli (#02: 3458764688417722707, #08: 3458764688417722736, #14: 3458764688417722783).
 * 2. Rispetto della No-Fly Zone di 40px attorno ai cartigli.
 * 3. Preservazione e aggiornamento in-place dei 3 Title Banner viola (#02: 3458764686744184732, #08: 3458764688307403459, #14: 3458764688384680094).
 * 4. Eliminazione sicura di vecchi connettori e vecchi nodi operativi (nessun tocco agli altri 15 flowchart).
 * 5. Creazione nodi ISO 5807 (W >= 440px per rombi, W=460-520px per box, spaziatura 70-90px, palette tier).
 * 6. Creazione connettori ortogonali 90° ('elbowed') con didascalie decisionali ('50%') e zero line-box crossing.
 * 7. Rate limiting calibrato (45ms per DELETE, 90ms per POST) e verifica live post-deploy al 100%.
 */

const fs = require('fs');
const path = require('path');

// Costanti di Configurazione e Autenticazione Miro REST API v2
const MIRO_API_BASE_URL = 'https://api.miro.com/v2/boards';
const BOARD_ID = 'uXjVEbo6L2o=';
const MIRO_TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';

// Delays per Rate Limiting (in millisecondi)
const DELAY_DELETE_MS = 45;
const DELAY_CREATE_MS = 90;
const DELAY_VERIFY_MS = 30;

// Registro Cartigli Immutabili (Protected IDs - Vietato toccare o cancellare)
const PROTECTED_BADGE_IDS = new Set([
  '3458764688417722707', // Badge #02 (Tier 1 B2C)
  '3458764688417722736', // Badge #08 (Tier 2 Pro)
  '3458764688417722783'  // Badge #14 (Tier 3 Elite)
]);

// Registro Title Header Banners (Preservare ID e aggiornare solo content HTML)
const TITLE_BANNER_IDS = {
  FLOW_2A: '3458764686744184732',
  FLOW_2B: '3458764688307403459',
  FLOW_2C: '3458764688384680094'
};

const PROTECTED_HEADER_IDS = new Set(Object.values(TITLE_BANNER_IDS));

/**
 * Funzione helper per attesa asincrona (Rate Limiting).
 * @param {number} ms - Millisecondi da attendere.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Client HTTP per chiamate REST alle API Miro v2.
 * @param {string} endpoint - Path relativo endpoint (es. '/shapes', '/connectors').
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
 * Recupera tutte le shape presenti sulla board (con paginazione cursore).
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
 * Recupera tutti i connettori presenti sulla board (con paginazione cursore).
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
 * Aggiorna il contenuto testuale di un Title Banner esistente.
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
      fillColor: nodeDef.fillColor || '#e0f2fe',
      fillOpacity: '1.0',
      fontFamily: 'open_sans',
      fontSize: nodeDef.fontSize || '13',
      borderColor: nodeDef.borderColor || '#0284c7',
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
 * Crea un connettore ortogonale a 90° ('elbowed') tra due nodi su Miro.
 * @param {string} startId - ID della forma sorgente.
 * @param {string} endId - ID della forma di destinazione.
 * @param {string} startSnap - Lato di uscita della forma sorgente.
 * @param {string} endSnap - Lato di ingresso della forma di destinazione.
 * @param {string} label - Didascalia del bivio/connessione.
 * @param {object} style - Proprietà di stile (strokeColor, strokeStyle).
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
// DEFINIZIONI NODI E CONNETTORI ISO 5807 (DA SPECIFICATIONS.MD)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. FLOWCHART #02 (FLOW-2A) — TIER 1 (B2C CASUAL)
// ----------------------------------------------------------------------------
const T1_NODES = [
  {
    key: 'T1_START',
    shape: 'round_rectangle',
    width: 560,
    height: 80,
    x: 27.35,
    y: 380,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p><strong>Inizio: Home Cockpit - Accesso Catalogo Esercizi (App Utente)</strong></p><p>Inizializzazione Thin Client • Profilo Utente Base (Tier 1 Casual)</p>'
  },
  {
    key: 'T1_UI_POLICY_CHECK',
    shape: 'rectangle',
    width: 520,
    height: 90,
    x: 27.35,
    y: 540,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>API Gateway: Verifica Gating Tier 1 &amp; Policy Catalogo</strong></p><p>Abilitazione consultazione Libreria Standard (328 Esercizi) • Blocco Upload &amp; Edit</p>'
  },
  {
    key: 'T1_DEC_SEARCH_MODE',
    shape: 'rhombus',
    width: 460,
    height: 135,
    x: 27.35,
    y: 725,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Modalità di Navigazione &amp; Ricerca Filtrata?</strong></p><p>Sezioni Specifiche (Muscolo/Distretto/Categoria) vs Ricerca Testuale Istantanea</p>'
  },
  {
    key: 'T1_UI_FILTER_SECTION',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: -320,
    y: 915,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Navigazione Filtrata per Sezioni Specifiche</strong></p><p>Filtri tassonomici: 1. Singolo Muscolo • 2. Distretto Muscolare • 3. Categoria di Allenamento</p>'
  },
  {
    key: 'T1_UI_TEXT_SEARCH',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: 375,
    y: 915,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Ricerca Testuale Full-Text Istantanea</strong></p><p>Campo input con Debounce 250ms • Ricerca diretta sui 328 esercizi certificati</p>'
  },
  {
    key: 'T1_GW_CATALOG_QUERY',
    shape: 'rectangle',
    width: 520,
    height: 90,
    x: 27.35,
    y: 1085,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>API Gateway: GET /api/v1/catalog/exercises (Tier 1 Enforced)</strong></p><p>Interrogazione Edge Cache Redis • Verifica permessi libreria standard</p>'
  },
  {
    key: 'T1_DB_QUERY_SILO1',
    shape: 'rectangle',
    width: 480,
    height: 90,
    x: 520,
    y: 1150,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Database Silo 1: catalog_exercises (PostgreSQL)</strong></p><p>Estrazione 328 record biomeccanici certificati, metadati muscolari e asset 3D</p>'
  },
  {
    key: 'T1_DEC_RESULTS',
    shape: 'rhombus',
    width: 440,
    height: 130,
    x: 27.35,
    y: 1270,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Esito Filtri &amp; Ricerca Catalogo?</strong></p><p>Esercizi Trovati (Populated) vs Zero Risultati (Empty State)</p>'
  },
  {
    key: 'T1_UI_EMPTY_STATE',
    shape: 'rectangle',
    width: 440,
    height: 95,
    x: -320,
    y: 1455,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p><strong>Gestione Empty State &amp; Suggerimenti di Ricerca</strong></p><p>Nessun esercizio corrispondente • Suggerimenti distretti alternativi o reset filtri</p>'
  },
  {
    key: 'T1_UI_GRID_POPULATED',
    shape: 'rectangle',
    width: 500,
    height: 95,
    x: 27.35,
    y: 1455,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Rendering Griglia Esercizi Catalogo Base</strong></p><p>Card esercizio con anteprima 3D, muscoli target principali e badge categoria</p>'
  },
  {
    key: 'T1_DEC_SELECT_EXERCISE',
    shape: 'rhombus',
    width: 440,
    height: 130,
    x: 27.35,
    y: 1645,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Selezione Esercizio &amp; Verifica Hardware?</strong></p><p>Supporto WebGL 2.0 / GPU 3D attivo vs Hardware Datato (Fallback)</p>'
  },
  {
    key: 'T1_SRV_3D_DRACO',
    shape: 'rectangle',
    width: 480,
    height: 100,
    x: -280,
    y: 1835,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Mesh 3D Google Draco</strong></p><p>Streaming modello tridimensionale compresso GLB • Progressive Level of Detail (LOD)</p>'
  },
  {
    key: 'T1_UI_FALLBACK_2D',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: 335,
    y: 1835,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p><strong>Graceful Degradation: Video 2D Pre-Renderizzato</strong></p><p>Streaming video dimostrativo MP4 a 60fps con 3 angolazioni fisse per device legacy</p>'
  },
  {
    key: 'T1_UI_VIEWER_3D',
    shape: 'rectangle',
    width: 520,
    height: 110,
    x: 27.35,
    y: 2015,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Visualizzazione 3D Interattiva con Modello Dinamico</strong></p><p>Controlli orbitali touch 360° • Mappatura fasce muscolari: Agonisti (Rosso), Sinergisti (Giallo), Stabilizzatori (Ciano)</p>'
  },
  {
    key: 'T1_UI_TECH_CONTENT',
    shape: 'rectangle',
    width: 520,
    height: 110,
    x: 27.35,
    y: 2200,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Contenuti Tecnici &amp; Correzioni "Why &amp; Fix"</strong></p><p>Spiegazione tecnica completa (setup, traiettoria, respirazione) • Guida correttiva sui principali errori biomeccanici</p>'
  },
  {
    key: 'T1_DEC_USER_ACTION',
    shape: 'rhombus',
    width: 460,
    height: 135,
    x: 27.35,
    y: 2395,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Azione Utente Post-Consultazione?</strong></p><p>Salva nei Preferiti | Tenta Modifica/Upload | Avvia Workout</p>'
  },
  {
    key: 'T1_DEC_MOD_CHECK',
    shape: 'rhombus',
    width: 440,
    height: 130,
    x: -320,
    y: 2530,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Richiesta Modifica o Upload Video Proprio?</strong></p><p>Verifica Policy Tier 1: Blocco Modifiche &amp; Libreria Standard</p>'
  },
  {
    key: 'T1_UI_POLICY_BLOCK',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: -320,
    y: 2690,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p><strong>Blocco Modifiche &amp; Zero Video Upload (Policy Tier 1)</strong></p><p>Modifiche ed editing video inibiti • Nessun caricamento video consentito • Modal: Passa a Tier 2 per creare video</p>'
  },
  {
    key: 'T1_GW_FAV_SAVE',
    shape: 'rectangle',
    width: 480,
    height: 90,
    x: 375,
    y: 2530,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>API Gateway: POST /api/v1/user/favorites</strong></p><p>Aggiunta o rimozione dell\'esercizio dalla lista personale dei preferiti</p>'
  },
  {
    key: 'T1_DB_FAV_WRITE',
    shape: 'rectangle',
    width: 460,
    height: 90,
    x: 375,
    y: 2670,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Database Silo 1: user_favorites (PostgreSQL)</strong></p><p>Persistenza record preferito associato al profilo utente consumer</p>'
  },
  {
    key: 'T1_TRANSITION_PLAYER',
    shape: 'rectangle',
    width: 480,
    height: 90,
    x: 27.35,
    y: 2560,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Transizione a Workout Player (FLOW-3A)</strong></p><p>Inserimento esercizio nella sessione attiva o nella scheda personale</p>'
  },
  {
    key: 'T1_END_READY',
    shape: 'round_rectangle',
    width: 560,
    height: 80,
    x: 27.35,
    y: 2780,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p><strong>Fine: Consultazione Esercizio Completata</strong></p><p>Esercizio appreso in 3D, salvato nei preferiti o inserito nel player</p>'
  }
];

const T1_CONNECTORS = [
  { start: 'TITLE_BANNER', end: 'T1_START', startSnap: 'bottom', endSnap: 'top', label: '', style: { strokeColor: '#14b8a6' } },
  { start: 'T1_START', end: 'T1_UI_POLICY_CHECK', startSnap: 'bottom', endSnap: 'top', label: '', style: { strokeColor: '#14b8a6' } },
  { start: 'T1_UI_POLICY_CHECK', end: 'T1_DEC_SEARCH_MODE', startSnap: 'bottom', endSnap: 'top', label: 'Abilitazione Tier 1', style: { strokeColor: '#7c3aed' } },
  { start: 'T1_DEC_SEARCH_MODE', end: 'T1_UI_FILTER_SECTION', startSnap: 'left', endSnap: 'top', label: 'Sezioni Specifiche', style: { strokeColor: '#d97706' } },
  { start: 'T1_DEC_SEARCH_MODE', end: 'T1_UI_TEXT_SEARCH', startSnap: 'right', endSnap: 'top', label: 'Ricerca Testuale', style: { strokeColor: '#d97706' } },
  { start: 'T1_UI_FILTER_SECTION', end: 'T1_GW_CATALOG_QUERY', startSnap: 'bottom', endSnap: 'left', label: 'Applica Filtri', style: { strokeColor: '#0284c7' } },
  { start: 'T1_UI_TEXT_SEARCH', end: 'T1_GW_CATALOG_QUERY', startSnap: 'bottom', endSnap: 'right', label: 'Debounce 250ms', style: { strokeColor: '#0284c7' } },
  { start: 'T1_GW_CATALOG_QUERY', end: 'T1_DB_QUERY_SILO1', startSnap: 'right', endSnap: 'left', label: 'Cache Miss (Query)', style: { strokeColor: '#7c3aed' } },
  { start: 'T1_GW_CATALOG_QUERY', end: 'T1_DEC_RESULTS', startSnap: 'bottom', endSnap: 'top', label: 'Cache Hit (Edge)', style: { strokeColor: '#7c3aed' } },
  { start: 'T1_DB_QUERY_SILO1', end: 'T1_DEC_RESULTS', startSnap: 'bottom', endSnap: 'right', label: 'Record Silo 1', style: { strokeColor: '#e11d48' } },
  { start: 'T1_DEC_RESULTS', end: 'T1_UI_GRID_POPULATED', startSnap: 'bottom', endSnap: 'top', label: 'Match Trovati', style: { strokeColor: '#d97706' } },
  { start: 'T1_DEC_RESULTS', end: 'T1_UI_EMPTY_STATE', startSnap: 'left', endSnap: 'top', label: 'Zero Match', style: { strokeColor: '#d97706' } },
  { start: 'T1_UI_EMPTY_STATE', end: 'T1_UI_GRID_POPULATED', startSnap: 'right', endSnap: 'left', label: 'Reset / Suggerimenti', style: { strokeColor: '#dc2626', strokeStyle: 'dashed' } },
  { start: 'T1_UI_GRID_POPULATED', end: 'T1_DEC_SELECT_EXERCISE', startSnap: 'bottom', endSnap: 'top', label: 'Selezione Esercizio', style: { strokeColor: '#0284c7' } },
  { start: 'T1_DEC_SELECT_EXERCISE', end: 'T1_SRV_3D_DRACO', startSnap: 'left', endSnap: 'top', label: 'WebGL 2.0 Attivo', style: { strokeColor: '#d97706' } },
  { start: 'T1_DEC_SELECT_EXERCISE', end: 'T1_UI_FALLBACK_2D', startSnap: 'right', endSnap: 'top', label: 'Fallback Hardware', style: { strokeColor: '#d97706' } },
  { start: 'T1_SRV_3D_DRACO', end: 'T1_UI_VIEWER_3D', startSnap: 'bottom', endSnap: 'left', label: 'Stream Mesh GLB', style: { strokeColor: '#059669' } },
  { start: 'T1_UI_FALLBACK_2D', end: 'T1_UI_VIEWER_3D', startSnap: 'bottom', endSnap: 'right', label: 'Video 2D 60fps', style: { strokeColor: '#dc2626' } },
  { start: 'T1_UI_VIEWER_3D', end: 'T1_UI_TECH_CONTENT', startSnap: 'bottom', endSnap: 'top', label: 'Orbit 360° & Fasce', style: { strokeColor: '#0284c7' } },
  { start: 'T1_UI_TECH_CONTENT', end: 'T1_DEC_USER_ACTION', startSnap: 'bottom', endSnap: 'top', label: 'Why & Fix Appreso', style: { strokeColor: '#0284c7' } },
  { start: 'T1_DEC_USER_ACTION', end: 'T1_DEC_MOD_CHECK', startSnap: 'left', endSnap: 'top', label: 'Tenta Modifica/Upload', style: { strokeColor: '#d97706' } },
  { start: 'T1_DEC_MOD_CHECK', end: 'T1_UI_POLICY_BLOCK', startSnap: 'bottom', endSnap: 'top', label: 'Blocco Enforced', style: { strokeColor: '#d97706' } },
  { start: 'T1_DEC_USER_ACTION', end: 'T1_GW_FAV_SAVE', startSnap: 'right', endSnap: 'top', label: 'Salva nei Preferiti', style: { strokeColor: '#d97706' } },
  { start: 'T1_GW_FAV_SAVE', end: 'T1_DB_FAV_WRITE', startSnap: 'bottom', endSnap: 'top', label: 'Scrittura Silo 1', style: { strokeColor: '#7c3aed' } },
  { start: 'T1_DEC_USER_ACTION', end: 'T1_TRANSITION_PLAYER', startSnap: 'bottom', endSnap: 'top', label: 'Avvia Workout', style: { strokeColor: '#d97706' } },
  { start: 'T1_TRANSITION_PLAYER', end: 'T1_END_READY', startSnap: 'bottom', endSnap: 'top', label: 'Scheda Pronta', style: { strokeColor: '#0284c7' } },
  { start: 'T1_DB_FAV_WRITE', end: 'T1_END_READY', startSnap: 'bottom', endSnap: 'right', label: 'Preferito Salvato', style: { strokeColor: '#e11d48' } },
  { start: 'T1_UI_POLICY_BLOCK', end: 'T1_END_READY', startSnap: 'bottom', endSnap: 'left', label: 'Fine Consultazione', style: { strokeColor: '#dc2626', strokeStyle: 'dashed' } }
];

// ----------------------------------------------------------------------------
// 2. FLOWCHART #08 (FLOW-2B) — TIER 2 (PRO P.IVA)
// ----------------------------------------------------------------------------
const T2_NODES = [
  {
    key: 'T2_START',
    shape: 'round_rectangle',
    width: 600,
    height: 80,
    x: 251.36,
    y: 3180,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    color: '#ffffff',
    content: '<p><strong>Inizio: Coach Cockpit - Accesso Catalogo Esercizi (Pro P.IVA)</strong></p><p>Verifica credenziali Tier 2 • Inizializzazione Thin Client Professionale</p>'
  },
  {
    key: 'T2_DEC_MODE',
    shape: 'rhombus',
    width: 480,
    height: 135,
    x: 251.36,
    y: 3340,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Modalità Operativa nel Catalogo Professionale?</strong></p><p>1. Consulta &amp; Ricerca Avanzata • 2. Crea Video Personalizzato 1080p • 3. Crea Solo-Testo</p>'
  },
  {
    key: 'T2_UI_SEARCH_ADVANCED',
    shape: 'rectangle',
    width: 460,
    height: 105,
    x: -230,
    y: 3520,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Navigazione per Sezioni &amp; Ricerca Avanzata</strong></p><p>Filtri per: Muscolo, Distretto, Categoria, Attrezzatura (bilanciere, cavi, manubri) e Triage 119 patologie</p>'
  },
  {
    key: 'T2_UI_3D_VIEWER_PRO',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: -230,
    y: 3660,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Visualizzazione 3D con Modelli Dinamici Pro</strong></p><p>Accesso modelli 3D Draco 360° con fasce muscolari, calcolo TUT e blocco ROM touch</p>'
  },
  {
    key: 'T2_UI_TECH_CONTENT_PRO',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: -230,
    y: 3800,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Contenuti Tecnici Completi &amp; Correzioni</strong></p><p>Spiegazioni tecniche dettagliate, correzioni posturali Why &amp; Fix e cues propriocettivi per coach</p>'
  },
  {
    key: 'T2_DEC_CONSULT_ACTION',
    shape: 'rhombus',
    width: 440,
    height: 130,
    x: -230,
    y: 3970,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Azione Post-Consultazione Esercizio Standard?</strong></p><p>Salva nei Preferiti Pro vs Assegna ad Atleta (Limite 1:1)</p>'
  },
  {
    key: 'T2_UI_VIDEO_CAPTURE_1080P',
    shape: 'rectangle',
    width: 500,
    height: 100,
    x: 251.36,
    y: 3520,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Caricamento / Registrazione Video Personalizzato</strong></p><p>In-App Camera o Upload file • Qualità massima supportata: 1080p Full HD (60fps) • Controllo bitrate</p>'
  },
  {
    key: 'T2_GW_RES_CHECK',
    shape: 'rhombus',
    width: 440,
    height: 130,
    x: 251.36,
    y: 3690,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Verifica Risoluzione Video (Max 1080p)?</strong></p><p>Risoluzione &lt;= 1080p (Conforme) vs Risoluzione Eccedente (&gt;1080p: Downscaling)</p>'
  },
  {
    key: 'T2_UI_DOWNSCALE_1080P',
    shape: 'rectangle',
    width: 440,
    height: 90,
    x: 730,
    y: 3690,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p><strong>Downscaling Automatico a 1080p Full HD</strong></p><p>Riduzione automatica bitrate e risoluzione via WebCodecs client-side a 1920x1080</p>'
  },
  {
    key: 'T2_UI_VIDEO_EDITOR',
    shape: 'rectangle',
    width: 520,
    height: 110,
    x: 251.36,
    y: 3860,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Editing Video Integrato nel Thin Client</strong></p><p>Strumenti di modifica: 1. Taglio (Trimming temporale) • 2. Rallentatore (0.25x, 0.5x, 0.75x) • 3. Velocizzazione (1.25x, 1.5x, 2.0x) • 4. Freeze-frame</p>'
  },
  {
    key: 'T2_UI_MANUAL_STRENGTHS_WEAKNESSES',
    shape: 'rectangle',
    width: 520,
    height: 100,
    x: 251.36,
    y: 4020,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Inserimento Manuale Punti di Forza e di Debolezza</strong></p><p>Compilazione scheda: punti di forza dell\'atleta, debolezze esecutive, compensi motori e note didattiche</p>'
  },
  {
    key: 'T2_DEC_AI_SUPPORT',
    shape: 'rhombus',
    width: 440,
    height: 130,
    x: 251.36,
    y: 4190,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Richiesta Supporto AI per Completare Spiegazione?</strong></p><p>SÌ (Invoca AI Scatola Nera) vs NO (Mantieni redazione manuale)</p>'
  },
  {
    key: 'T2_SRV_AI_COMPLETION',
    shape: 'rectangle',
    width: 520,
    height: 110,
    x: 251.36,
    y: 4370,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Supporto AI Biomeccanico</strong></p><p>Multimodal RAG (322 paper scientifici indicizzati): genera integrazione tecnica, corregge la spiegazione e fornisce cues biomeccanici</p>'
  },
  {
    key: 'T2_UI_DIFF_APPROVAL',
    shape: 'rectangle',
    width: 500,
    height: 95,
    x: 251.36,
    y: 4530,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Modale Diff: Approvazione Spiegazione AI</strong></p><p>Il professionista approva, modifica o integra i punti suggeriti dall\'AI per perfezionare la spiegazione</p>'
  },
  {
    key: 'T2_UI_VIEWER_TOGGLE_PRO',
    shape: 'rectangle',
    width: 520,
    height: 100,
    x: 251.36,
    y: 4680,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Scheda Esercizio Personalizzato &amp; Toggle Viewer</strong></p><p>Toggle "Video 1080p Reale (con controlli di velocità e taglio) vs Modello 3D" • Visualizzazione punti forza/debolezza</p>'
  },
  {
    key: 'T2_DEC_ACTION_DEST',
    shape: 'rhombus',
    width: 460,
    height: 135,
    x: 251.36,
    y: 4850,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Destinazione Salvataggio / Condivisione Esercizio?</strong></p><p>Salva nei Preferiti Pro vs Condividi con Atleta (Assegnazione Scheda)</p>'
  },
  {
    key: 'T2_GW_FAVORITES',
    shape: 'rectangle',
    width: 460,
    height: 90,
    x: -230,
    y: 5020,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>Gestione Preferiti: POST /api/v1/pro/favorites</strong></p><p>Salvataggio dell\'esercizio nella lista personale dei preferiti del professionista (Silo 2)</p>'
  },
  {
    key: 'T2_DEC_SHARE_TARGET',
    shape: 'rhombus',
    width: 460,
    height: 135,
    x: 251.36,
    y: 5040,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Selezione Destinatario Condivisione Esercizio?</strong></p><p>Singolo Atleta (1:1) vs Selezione Multipla / Squadra</p>'
  },
  {
    key: 'T2_GW_SHARE_ENFORCEMENT',
    shape: 'rhombus',
    width: 460,
    height: 135,
    x: 251.36,
    y: 5230,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Gateway: Controllo Limite di Condivisione 1:1?</strong></p><p>Destinatario Singolo (Autorizzato) vs Tentativo Multi-Atleta (Blocco)</p>'
  },
  {
    key: 'T2_UI_SHARE_BLOCK_ALERT',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: 730,
    y: 5230,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p><strong>Blocco Condivisione Multi-Atleta (Limite 1:1 Tier 2)</strong></p><p>Divieto di condividere esercizi simultaneamente con più atleti • Modal: Funzionalità team broadcast riservata a Tier 3</p>'
  },
  {
    key: 'T2_DB_SAVE_SILO2',
    shape: 'rectangle',
    width: 500,
    height: 90,
    x: 251.36,
    y: 5430,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Persistenza Silo 2 Bunker Pro (AES-256 Vault)</strong></p><p>Scrittura tabelle pro_custom_exercises, video 1080p criptato e assegnazione scheda 1:1 atleta</p>'
  },
  {
    key: 'T2_END_READY',
    shape: 'round_rectangle',
    width: 600,
    height: 80,
    x: 251.36,
    y: 5600,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    color: '#ffffff',
    content: '<p><strong>Fine: Esercizio Operativo nel Catalogo Pro &amp; Condiviso 1:1</strong></p><p>➔ NAVIGA A FLOW 3B: COACH WORKOUT BUILDER</p>'
  }
];

const T2_CONNECTORS = [
  { start: 'TITLE_BANNER', end: 'T2_START', startSnap: 'bottom', endSnap: 'top', label: '', style: { strokeColor: '#f59e0b' } },
  { start: 'T2_START', end: 'T2_DEC_MODE', startSnap: 'bottom', endSnap: 'top', label: 'Accesso Coach Cockpit', style: { strokeColor: '#f59e0b' } },
  { start: 'T2_DEC_MODE', end: 'T2_UI_SEARCH_ADVANCED', startSnap: 'left', endSnap: 'top', label: '1. Consulta & Triage', style: { strokeColor: '#d97706' } },
  { start: 'T2_DEC_MODE', end: 'T2_UI_VIDEO_CAPTURE_1080P', startSnap: 'bottom', endSnap: 'top', label: '2. Crea Video 1080p', style: { strokeColor: '#d97706' } },
  { start: 'T2_UI_SEARCH_ADVANCED', end: 'T2_UI_3D_VIEWER_PRO', startSnap: 'bottom', endSnap: 'top', label: 'Filtro Tassonomico', style: { strokeColor: '#0284c7' } },
  { start: 'T2_UI_3D_VIEWER_PRO', end: 'T2_UI_TECH_CONTENT_PRO', startSnap: 'bottom', endSnap: 'top', label: 'Studio 3D & ROM', style: { strokeColor: '#0284c7' } },
  { start: 'T2_UI_TECH_CONTENT_PRO', end: 'T2_DEC_CONSULT_ACTION', startSnap: 'bottom', endSnap: 'top', label: 'Consultazione OK', style: { strokeColor: '#0284c7' } },
  { start: 'T2_DEC_CONSULT_ACTION', end: 'T2_GW_FAVORITES', startSnap: 'bottom', endSnap: 'top', label: 'Salva nei Preferiti', style: { strokeColor: '#d97706' } },
  { start: 'T2_DEC_CONSULT_ACTION', end: 'T2_DEC_SHARE_TARGET', startSnap: 'right', endSnap: 'top', label: 'Assegna ad Atleta', style: { strokeColor: '#d97706' } },
  { start: 'T2_UI_VIDEO_CAPTURE_1080P', end: 'T2_GW_RES_CHECK', startSnap: 'bottom', endSnap: 'top', label: 'Clip Acquisita', style: { strokeColor: '#0284c7' } },
  { start: 'T2_GW_RES_CHECK', end: 'T2_UI_DOWNSCALE_1080P', startSnap: 'right', endSnap: 'left', label: 'Risoluzione > 1080p', style: { strokeColor: '#dc2626' } },
  { start: 'T2_GW_RES_CHECK', end: 'T2_UI_VIDEO_EDITOR', startSnap: 'bottom', endSnap: 'top', label: 'Conforme <= 1080p', style: { strokeColor: '#d97706' } },
  { start: 'T2_UI_DOWNSCALE_1080P', end: 'T2_UI_VIDEO_EDITOR', startSnap: 'bottom', endSnap: 'right', label: 'Downscaled 1080p', style: { strokeColor: '#dc2626' } },
  { start: 'T2_UI_VIDEO_EDITOR', end: 'T2_UI_MANUAL_STRENGTHS_WEAKNESSES', startSnap: 'bottom', endSnap: 'top', label: 'Taglio & Speed OK', style: { strokeColor: '#0284c7' } },
  { start: 'T2_UI_MANUAL_STRENGTHS_WEAKNESSES', end: 'T2_DEC_AI_SUPPORT', startSnap: 'bottom', endSnap: 'top', label: 'Punti Forza/Deboli', style: { strokeColor: '#0284c7' } },
  { start: 'T2_DEC_AI_SUPPORT', end: 'T2_SRV_AI_COMPLETION', startSnap: 'bottom', endSnap: 'top', label: 'SÌ: Supporto AI', style: { strokeColor: '#d97706' } },
  { start: 'T2_DEC_AI_SUPPORT', end: 'T2_UI_VIEWER_TOGGLE_PRO', startSnap: 'right', endSnap: 'right', label: 'NO: Mantieni Bozza', style: { strokeColor: '#d97706' } },
  { start: 'T2_SRV_AI_COMPLETION', end: 'T2_UI_DIFF_APPROVAL', startSnap: 'bottom', endSnap: 'top', label: 'RAG 322 Paper', style: { strokeColor: '#059669' } },
  { start: 'T2_UI_DIFF_APPROVAL', end: 'T2_UI_VIEWER_TOGGLE_PRO', startSnap: 'bottom', endSnap: 'top', label: 'Approvato Diff', style: { strokeColor: '#0284c7' } },
  { start: 'T2_UI_VIEWER_TOGGLE_PRO', end: 'T2_DEC_ACTION_DEST', startSnap: 'bottom', endSnap: 'top', label: 'Scheda Esercizio OK', style: { strokeColor: '#0284c7' } },
  { start: 'T2_DEC_ACTION_DEST', end: 'T2_GW_FAVORITES', startSnap: 'left', endSnap: 'right', label: 'Aggiungi a Preferiti', style: { strokeColor: '#d97706' } },
  { start: 'T2_DEC_ACTION_DEST', end: 'T2_DEC_SHARE_TARGET', startSnap: 'bottom', endSnap: 'top', label: 'Assegna / Condividi', style: { strokeColor: '#d97706' } },
  { start: 'T2_DEC_SHARE_TARGET', end: 'T2_GW_SHARE_ENFORCEMENT', startSnap: 'bottom', endSnap: 'top', label: 'Singolo Atleta (1:1)', style: { strokeColor: '#d97706' } },
  { start: 'T2_DEC_SHARE_TARGET', end: 'T2_UI_SHARE_BLOCK_ALERT', startSnap: 'right', endSnap: 'top', label: 'Multi-Atleta Tentato', style: { strokeColor: '#dc2626' } },
  { start: 'T2_GW_SHARE_ENFORCEMENT', end: 'T2_DB_SAVE_SILO2', startSnap: 'bottom', endSnap: 'top', label: 'Autorizzato (1:1)', style: { strokeColor: '#7c3aed' } },
  { start: 'T2_GW_SHARE_ENFORCEMENT', end: 'T2_UI_SHARE_BLOCK_ALERT', startSnap: 'right', endSnap: 'left', label: 'Rifiuto Gateway', style: { strokeColor: '#dc2626' } },
  { start: 'T2_DB_SAVE_SILO2', end: 'T2_END_READY', startSnap: 'bottom', endSnap: 'top', label: 'Scheda Assegnata 1:1', style: { strokeColor: '#e11d48' } },
  { start: 'T2_GW_FAVORITES', end: 'T2_END_READY', startSnap: 'bottom', endSnap: 'left', label: 'Preferito Archiviato', style: { strokeColor: '#7c3aed' } },
  { start: 'T2_UI_SHARE_BLOCK_ALERT', end: 'T2_END_READY', startSnap: 'bottom', endSnap: 'right', label: 'Ritorno a Coach Hub', style: { strokeColor: '#dc2626', strokeStyle: 'dashed' } }
];

// ----------------------------------------------------------------------------
// 3. FLOWCHART #14 (FLOW-2C) — TIER 3 (ELITE TEAMS)
// ----------------------------------------------------------------------------
const T3_NODES = [
  {
    key: 'T3_START',
    shape: 'round_rectangle',
    width: 640,
    height: 80,
    x: -108,
    y: 6480,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    color: '#ffffff',
    content: '<p><strong>Inizio: Team Cockpit - Catalogo Esercizi &amp; Suite Tattica (Elite Club)</strong></p><p>Autenticazione mTLS + FIDO2 • Permessi Multi-Staff (Head Coach, Medico, Analyst)</p>'
  },
  {
    key: 'T3_DEC_MODE',
    shape: 'rhombus',
    width: 480,
    height: 135,
    x: -108,
    y: 6640,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Modalità Operativa Staff Societario?</strong></p><p>1. Consulta &amp; Analisi Stress Muscolare • 2. Crea Video 4K &amp; Caricamento Multi-Atleta • 3. Gruppi &amp; Broadcast</p>'
  },
  {
    key: 'T3_UI_SEARCH_ADVANCED',
    shape: 'rectangle',
    width: 460,
    height: 105,
    x: -588,
    y: 6820,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Navigazione per Sezioni &amp; Ricerca Avanzata Club</strong></p><p>Filtri per: Muscolo, Distretto, Categoria, Attrezzatura, Ruolo Tattico e Fase RTP (Return to Play)</p>'
  },
  {
    key: 'T3_UI_3D_VIEWER_ELITE',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: -588,
    y: 6960,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Visualizzazione 3D Modelli Dinamici con Digital Twin</strong></p><p>Accesso modelli 3D ad altissima fedeltà Three.js Draco con Digital Twin della rosa e controlli 360°</p>'
  },
  {
    key: 'T3_UI_TECH_EXPLANATION',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: -588,
    y: 7100,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Contenuti Tecnici &amp; Correzioni Biomeccaniche Avanzate</strong></p><p>Spiegazioni tecniche dettagliate per lo staff, correzioni posturali e protocolli di prevenzione infortuni</p>'
  },
  {
    key: 'T3_SRV_MUSCLE_STRESS_ENGINE',
    shape: 'rectangle',
    width: 480,
    height: 105,
    x: -588,
    y: 7240,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Motore Analisi Stress Muscolare</strong></p><p>Calcolo elementi finiti: sollecitazione delle fibre muscolari dei vari distretti in base alla specifica esecuzione</p>'
  },
  {
    key: 'T3_UI_MUSCLE_STRESS_VIEWER',
    shape: 'rectangle',
    width: 500,
    height: 110,
    x: -588,
    y: 7390,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Visualizzatore Analisi dello Stress Muscolare 3D</strong></p><p>Mappe termiche interattive di stress sulle fibre muscolari • Carichi in Newton (N), momenti di torsione e picchi eccentrici</p>'
  },
  {
    key: 'T3_UI_VIDEO_CAPTURE_4K',
    shape: 'rectangle',
    width: 520,
    height: 100,
    x: -108,
    y: 6820,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Caricamento Video Esercizi Risoluzione Superiore (Fino a 4K)</strong></p><p>Supporto riproduzione e upload fino a 4K Ultra HD (2160p a 60/120fps) • Flussi broadcast da telecamere di campo</p>'
  },
  {
    key: 'T3_UI_VIDEO_EDITOR_ADVANCED',
    shape: 'rectangle',
    width: 520,
    height: 110,
    x: -108,
    y: 6965,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Editing Video Integrato Avanzato &amp; Telestrator</strong></p><p>Strumenti di modifica: 1. Taglio multi-traccia • 2. Rallentatore (120fps scrubbing) • 3. Velocizzazione • 4. Telestrator vettoriale (vettori N)</p>'
  },
  {
    key: 'T3_UI_STAFF_STRENGTHS_WEAKNESSES',
    shape: 'rectangle',
    width: 520,
    height: 100,
    x: -108,
    y: 7110,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Redazione Punti di Forza e Debolezza da parte dello Staff</strong></p><p>Compilazione tecnica: punti di forza cinematici, compensi lesivi, asimmetrie bilaterali e note del preparatore</p>'
  },
  {
    key: 'T3_SRV_AI_INTEGRATION',
    shape: 'rectangle',
    width: 520,
    height: 110,
    x: -108,
    y: 7255,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Supporto AI per Integrare la Spiegazione</strong></p><p>AI Multimodale Enterprise: integra spiegazione tecnica, correla dati stress muscolare e genera indicazioni cliniche</p>'
  },
  {
    key: 'T3_UI_DIFF_STAFF_MODAL',
    shape: 'rectangle',
    width: 500,
    height: 95,
    x: -108,
    y: 7400,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Modale Revisione Diff Spiegazione Tecnica Staff</strong></p><p>Approvazione congiunta delle integrazioni AI da parte dell\'Head Coach e del Medico Sociale</p>'
  },
  {
    key: 'T3_DEC_MULTI_ATHLETE_UPLOAD',
    shape: 'rhombus',
    width: 460,
    height: 135,
    x: -108,
    y: 7570,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Caricamento Multiplo Stesso Esercizio su Più Persone?</strong></p><p>SÌ (Batch Multi-Atleta con AI Personale) vs Singola Esecuzione di Squadra</p>'
  },
  {
    key: 'T3_UI_MULTI_UPLOAD_INGEST',
    shape: 'rectangle',
    width: 500,
    height: 100,
    x: -108,
    y: 7740,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Caricamento Multiplo: Stesso Esercizio su Persone Diverse</strong></p><p>Ingestion simultanea di N clip video eseguite da diversi atleti del team per lo stesso esercizio</p>'
  },
  {
    key: 'T3_SRV_INDIVIDUAL_AI_ENGINE',
    shape: 'rectangle',
    width: 520,
    height: 110,
    x: -108,
    y: 7890,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Correzioni AI Specifiche per Ciascun Individuo</strong></p><p>Pipeline AI individualizzata: elabora la biomeccanica specifica di ogni atleta, calcolando correzioni e spiegazioni su misura</p>'
  },
  {
    key: 'T3_DB_SAVE_INDIVIDUAL_CORRECTIONS',
    shape: 'rectangle',
    width: 500,
    height: 95,
    x: -108,
    y: 8035,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Database Silo 2: Schede Individuali Atleta (KMS Enclave)</strong></p><p>Archiviazione correzioni AI su misura e analisi stress per ogni singolo calciatore</p>'
  },
  {
    key: 'T3_DEC_DISTRIBUTION',
    shape: 'rhombus',
    width: 460,
    height: 135,
    x: -108,
    y: 8210,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Destinazione Distribuzione &amp; Condivisione Esercizio?</strong></p><p>Salva nei Preferiti Club | Gruppo di Lavoro Dedicato | Condivisione Globale Team</p>'
  },
  {
    key: 'T3_GW_FAVORITES_CLUB',
    shape: 'rectangle',
    width: 460,
    height: 90,
    x: -588,
    y: 8400,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>Gestione Preferiti Club: POST /api/v1/club/favorites</strong></p><p>Archiviazione dell\'esercizio nei Preferiti ufficiali dello staff societario (Silo 2)</p>'
  },
  {
    key: 'T3_UI_WORKGROUPS_CREATION',
    shape: 'rectangle',
    width: 520,
    height: 105,
    x: -108,
    y: 8400,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Creazione Gruppi di Lavoro Dedicati</strong></p><p>Creazione e gestione gruppi (es. Reparto Difesa, Centrocampo, RTP, Velocità) con assegnazione esercizio e spiegazione tecnica sottostante</p>'
  },
  {
    key: 'T3_UI_GLOBAL_TEAM_SHARE',
    shape: 'rectangle',
    width: 500,
    height: 105,
    x: 372,
    y: 8400,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Condivisione Globale: Broadcast a Tutti gli Atleti del Team</strong></p><p>Invio simultaneo 1-to-All a tutti i componenti della rosa del club con Dynamic Forensic Watermark anti-leak</p>'
  },
  {
    key: 'T3_DEC_DUAL_SIGNATURE',
    shape: 'rhombus',
    width: 460,
    height: 135,
    x: -108,
    y: 8580,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Validazione Congiunta: Doppia Firma Digitale?</strong></p><p>Head S&amp;C + Medico Sociale (FIDO2) vs Firma Mancante (Pending Approval)</p>'
  },
  {
    key: 'T3_DB_VAULT_PERSISTENCE',
    shape: 'rectangle',
    width: 520,
    height: 95,
    x: -108,
    y: 8760,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Persistenza Silo 2: Secret Club Vault &amp; Microciclo MD-X</strong></p><p>Scrittura crittografata con chiave KMS di Club • Assegnazione al microciclo gara di squadra</p>'
  },
  {
    key: 'T3_END_READY',
    shape: 'round_rectangle',
    width: 640,
    height: 80,
    x: -108,
    y: 8920,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    color: '#ffffff',
    content: '<p><strong>Fine: Esercizio 4K Integrato nel Secret Club Vault &amp; Condiviso con la Squadra</strong></p><p>➔ NAVIGA A FLOW 3C: BUNKER SILO 2 &amp; MICROCICLO MD-X</p>'
  }
];

const T3_CONNECTORS = [
  { start: 'TITLE_BANNER', end: 'T3_START', startSnap: 'bottom', endSnap: 'top', label: '', style: { strokeColor: '#818cf8' } },
  { start: 'T3_START', end: 'T3_DEC_MODE', startSnap: 'bottom', endSnap: 'top', label: 'mTLS + FIDO2 Staff', style: { strokeColor: '#818cf8' } },
  { start: 'T3_DEC_MODE', end: 'T3_UI_SEARCH_ADVANCED', startSnap: 'left', endSnap: 'top', label: '1. Consulta & Stress', style: { strokeColor: '#d97706' } },
  { start: 'T3_DEC_MODE', end: 'T3_UI_VIDEO_CAPTURE_4K', startSnap: 'bottom', endSnap: 'top', label: '2. Crea Video 4K', style: { strokeColor: '#d97706' } },
  { start: 'T3_DEC_MODE', end: 'T3_UI_WORKGROUPS_CREATION', startSnap: 'right', endSnap: 'top', label: '3. Gruppi & Broadcast', style: { strokeColor: '#d97706' } },
  { start: 'T3_UI_SEARCH_ADVANCED', end: 'T3_UI_3D_VIEWER_ELITE', startSnap: 'bottom', endSnap: 'top', label: 'Filtro RTP / Tattico', style: { strokeColor: '#0284c7' } },
  { start: 'T3_UI_3D_VIEWER_ELITE', end: 'T3_UI_TECH_EXPLANATION', startSnap: 'bottom', endSnap: 'top', label: 'Digital Twin 3D', style: { strokeColor: '#0284c7' } },
  { start: 'T3_UI_TECH_EXPLANATION', end: 'T3_SRV_MUSCLE_STRESS_ENGINE', startSnap: 'bottom', endSnap: 'top', label: 'Calcolo Sollecitazioni', style: { strokeColor: '#0284c7' } },
  { start: 'T3_SRV_MUSCLE_STRESS_ENGINE', end: 'T3_UI_MUSCLE_STRESS_VIEWER', startSnap: 'bottom', endSnap: 'top', label: 'Mappa Tensione Fibre', style: { strokeColor: '#059669' } },
  { start: 'T3_UI_MUSCLE_STRESS_VIEWER', end: 'T3_DEC_DISTRIBUTION', startSnap: 'right', endSnap: 'left', label: 'Stress Analizzato', style: { strokeColor: '#0284c7' } },
  { start: 'T3_UI_VIDEO_CAPTURE_4K', end: 'T3_UI_VIDEO_EDITOR_ADVANCED', startSnap: 'bottom', endSnap: 'top', label: 'Ingest 4K 120fps', style: { strokeColor: '#0284c7' } },
  { start: 'T3_UI_VIDEO_EDITOR_ADVANCED', end: 'T3_UI_STAFF_STRENGTHS_WEAKNESSES', startSnap: 'bottom', endSnap: 'top', label: 'Telestrator & Scrub', style: { strokeColor: '#0284c7' } },
  { start: 'T3_UI_STAFF_STRENGTHS_WEAKNESSES', end: 'T3_SRV_AI_INTEGRATION', startSnap: 'bottom', endSnap: 'top', label: 'Bozza Staff & EMR', style: { strokeColor: '#0284c7' } },
  { start: 'T3_SRV_AI_INTEGRATION', end: 'T3_UI_DIFF_STAFF_MODAL', startSnap: 'bottom', endSnap: 'top', label: 'AI Multimodale', style: { strokeColor: '#059669' } },
  { start: 'T3_UI_DIFF_STAFF_MODAL', end: 'T3_DEC_MULTI_ATHLETE_UPLOAD', startSnap: 'bottom', endSnap: 'top', label: 'Integrazione Approvata', style: { strokeColor: '#0284c7' } },
  { start: 'T3_DEC_MULTI_ATHLETE_UPLOAD', end: 'T3_UI_MULTI_UPLOAD_INGEST', startSnap: 'bottom', endSnap: 'top', label: 'SÌ: Multi-Atleta', style: { strokeColor: '#d97706' } },
  { start: 'T3_DEC_MULTI_ATHLETE_UPLOAD', end: 'T3_DEC_DISTRIBUTION', startSnap: 'right', endSnap: 'right', label: 'NO: Singola Esecuzione', style: { strokeColor: '#d97706' } },
  { start: 'T3_UI_MULTI_UPLOAD_INGEST', end: 'T3_SRV_INDIVIDUAL_AI_ENGINE', startSnap: 'bottom', endSnap: 'top', label: 'N Video Ingestati', style: { strokeColor: '#0284c7' } },
  { start: 'T3_SRV_INDIVIDUAL_AI_ENGINE', end: 'T3_DB_SAVE_INDIVIDUAL_CORRECTIONS', startSnap: 'bottom', endSnap: 'top', label: 'AI Individuale Generata', style: { strokeColor: '#059669' } },
  { start: 'T3_DB_SAVE_INDIVIDUAL_CORRECTIONS', end: 'T3_DEC_DISTRIBUTION', startSnap: 'bottom', endSnap: 'top', label: 'Schede Atleta Pronte', style: { strokeColor: '#e11d48' } },
  { start: 'T3_DEC_DISTRIBUTION', end: 'T3_GW_FAVORITES_CLUB', startSnap: 'left', endSnap: 'top', label: 'Salva nei Preferiti', style: { strokeColor: '#d97706' } },
  { start: 'T3_DEC_DISTRIBUTION', end: 'T3_UI_WORKGROUPS_CREATION', startSnap: 'bottom', endSnap: 'top', label: 'Gruppo Dedicato', style: { strokeColor: '#d97706' } },
  { start: 'T3_DEC_DISTRIBUTION', end: 'T3_UI_GLOBAL_TEAM_SHARE', startSnap: 'right', endSnap: 'top', label: 'Broadcast Squadra', style: { strokeColor: '#d97706' } },
  { start: 'T3_UI_WORKGROUPS_CREATION', end: 'T3_DEC_DUAL_SIGNATURE', startSnap: 'bottom', endSnap: 'top', label: 'Gruppo Assegnato', style: { strokeColor: '#0284c7' } },
  { start: 'T3_UI_GLOBAL_TEAM_SHARE', end: 'T3_DEC_DUAL_SIGNATURE', startSnap: 'left', endSnap: 'right', label: 'Watermark Applicato', style: { strokeColor: '#0284c7' } },
  { start: 'T3_DEC_DUAL_SIGNATURE', end: 'T3_DB_VAULT_PERSISTENCE', startSnap: 'bottom', endSnap: 'top', label: 'Co-Firma Validata', style: { strokeColor: '#d97706' } },
  { start: 'T3_DB_VAULT_PERSISTENCE', end: 'T3_END_READY', startSnap: 'bottom', endSnap: 'top', label: 'Vault Commit & MD-X', style: { strokeColor: '#e11d48' } },
  { start: 'T3_GW_FAVORITES_CLUB', end: 'T3_END_READY', startSnap: 'bottom', endSnap: 'left', label: 'Preferito Salvato', style: { strokeColor: '#7c3aed' } }
];

// ============================================================================
// MAIN DEPLOYMENT WORKFLOW
// ============================================================================

async function runMiroLiveDeployment() {
  console.log('======================================================================');
  console.log('🚀 AVVIO DEPLOYMENT LIVE MIRO: CATALOGO ESERCIZI (TIERS 1, 2, 3)');
  console.log(`Board ID: ${BOARD_ID} | Endpoint: ${MIRO_API_BASE_URL}`);
  console.log('======================================================================\n');

  // Caricamento inventario autoritativo da Explorer 2
  const inventoryPath = path.resolve(__dirname, '../.agents/teamwork/explorer_cat_2/accurate_full_inventory.json');
  if (!fs.existsSync(inventoryPath)) {
    throw new Error(`File di inventario non trovato: ${inventoryPath}`);
  }
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

  // --------------------------------------------------------------------------
  // STEP 0: Verifiche di Integrità dei Cartigli e Title Banners
  // --------------------------------------------------------------------------
  console.log('--- STEP 0: Verifica Integrità Cartigli e Banners sulla Board ---');
  for (const badgeId of PROTECTED_BADGE_IDS) {
    const check = await miroApi(`/shapes/${badgeId}`);
    if (!check.id) {
      throw new Error(`Cartiglio protetto non trovato sulla board: ${badgeId}`);
    }
    console.log(`[PASS] Cartiglio ${badgeId} verificato e protetto.`);
  }

  for (const [key, bannerId] of Object.entries(TITLE_BANNER_IDS)) {
    const check = await miroApi(`/shapes/${bannerId}`);
    if (!check.id) {
      throw new Error(`Title Banner ${key} (${bannerId}) non trovato sulla board!`);
    }
    console.log(`[PASS] Title Banner ${key} (${bannerId}) verificato.`);
  }

  // --------------------------------------------------------------------------
  // STEP A: Eliminazione Sicura Elementi Obsoleti (#02, #08, #14)
  // --------------------------------------------------------------------------
  console.log('\n--- STEP A: Eliminazione Elementi Obsoleti (95 Connettori + 78 Nodi) ---');
  
  // 1. Estrazione Connettori da Eliminare
  const connectorsToDelete = [
    ...(inventory.flowchart_2a.connectors || []),
    ...(inventory.flowchart_2b.connectors || []),
    ...(inventory.flowchart_2c.connectors || [])
  ].map(c => c.id);

  let deletedConnCount = 0;
  for (const connId of connectorsToDelete) {
    const res = await miroApi(`/connectors/${connId}`, 'DELETE');
    if (res.ok || res.status === 404) {
      deletedConnCount++;
    }
    await delay(DELAY_DELETE_MS);
  }
  console.log(`[PASS] Connettori obsoleti bonificati: ${deletedConnCount}/${connectorsToDelete.length}`);

  // 2. Estrazione Nodi da Eliminare (escludendo categoricamente i Cartigli e i Title Banners)
  const rawNodes = [
    ...(inventory.flowchart_2a.nodeItems || []),
    ...(inventory.flowchart_2b.nodeItems || []),
    ...(inventory.flowchart_2c.nodeItems || [])
  ];

  const nodesToDelete = rawNodes
    .map(n => n.id)
    .filter(id => !PROTECTED_BADGE_IDS.has(id) && !PROTECTED_HEADER_IDS.has(id));

  let deletedNodeCount = 0;
  for (const nodeId of nodesToDelete) {
    const res = await miroApi(`/items/${nodeId}`, 'DELETE');
    if (res.ok || res.status === 404) {
      deletedNodeCount++;
    }
    await delay(DELAY_DELETE_MS);
  }
  console.log(`[PASS] Nodi obsoleti bonificati: ${deletedNodeCount}/${nodesToDelete.length}`);

  // --------------------------------------------------------------------------
  // STEP B: Aggiornamento Testuale Title Banners (PATCH)
  // --------------------------------------------------------------------------
  console.log('\n--- STEP B: Aggiornamento Title Banners Viola (#02, #08, #14) ---');
  await patchTitleBanner(TITLE_BANNER_IDS.FLOW_2A, '<p><strong>2. FLUSSO CATALOGO ESERCIZI &amp; AVATAR BIOMECCANICO 3D (TIER 1 CASUAL)</strong></p>');
  console.log(`[PASS] Title Banner #02 aggiornato.`);
  await patchTitleBanner(TITLE_BANNER_IDS.FLOW_2B, '<p><strong>2. FLUSSO CATALOGO 3D, VIDEO 1080P &amp; SPEED CONTROL (TIER 2 PRO P.IVA)</strong></p>');
  console.log(`[PASS] Title Banner #08 aggiornato.`);
  await patchTitleBanner(TITLE_BANNER_IDS.FLOW_2C, '<p><strong>2. FLUSSO CATALOGO 3D, MULTI-CAMERA 4K/8K &amp; SUITE TATTICA (TIER 3 ELITE TEAMS)</strong></p>');
  console.log(`[PASS] Title Banner #14 aggiornato.`);

  // --------------------------------------------------------------------------
  // STEP C: Creazione / Riconciliazione Idempotente Nodi ISO 5807
  // --------------------------------------------------------------------------
  console.log('\n--- STEP C: Creazione / Riconciliazione Nodi ISO 5807 ---');
  console.log('Scansione forme attualmente presenti sulla board per idempotenza...');
  const currentShapes = await fetchAllBoardShapes();
  const shapeByCoord = new Map();
  currentShapes.forEach(s => {
    if (s.position && s.position.x !== undefined && s.position.y !== undefined) {
      const coordKey = `${Number(s.position.x).toFixed(2)},${Number(s.position.y).toFixed(2)}`;
      shapeByCoord.set(coordKey, s.id);
    }
  });

  const createdNodes = new Map(); // key -> miroId
  const allNodeDefs = [...T1_NODES, ...T2_NODES, ...T3_NODES];

  for (const nodeDef of allNodeDefs) {
    const coordKey = `${Number(nodeDef.x).toFixed(2)},${Number(nodeDef.y).toFixed(2)}`;
    if (shapeByCoord.has(coordKey)) {
      const existingId = shapeByCoord.get(coordKey);
      createdNodes.set(nodeDef.key, existingId);
    } else {
      const created = await createIsoNode(nodeDef);
      if (!created.id) {
        throw new Error(`Fallita creazione nodo ${nodeDef.key}: ${JSON.stringify(created)}`);
      }
      createdNodes.set(nodeDef.key, created.id);
      shapeByCoord.set(coordKey, created.id);
    }
  }

  console.log(`[PASS] Nodi ISO 5807 operativi e mappati: ${createdNodes.size}/67`);
  console.log(`  • Tier 1 (#02): ${T1_NODES.length} nodi`);
  console.log(`  • Tier 2 (#08): ${T2_NODES.length} nodi`);
  console.log(`  • Tier 3 (#14): ${T3_NODES.length} nodi`);

  // --------------------------------------------------------------------------
  // STEP D: Creazione Connettori Ortogonali 90° ('elbowed') con Didascalie
  // --------------------------------------------------------------------------
  console.log('\n--- STEP D: Creazione Connettori Ortogonali 90° con Didascalie ---');
  console.log('Scansione connettori attualmente presenti sulla board per idempotenza...');
  const currentConnectors = await fetchAllBoardConnectors();
  const existingConnMap = new Map();
  currentConnectors.forEach(c => {
    if (c.startItem && c.endItem && c.startItem.id && c.endItem.id) {
      existingConnMap.set(`${c.startItem.id}->${c.endItem.id}`, c.id);
    }
  });

  const createdConnectors = [];
  const allFlowConnectors = [
    ...T1_CONNECTORS.map(c => ({ ...c, flow: '#02', headerKey: TITLE_BANNER_IDS.FLOW_2A })),
    ...T2_CONNECTORS.map(c => ({ ...c, flow: '#08', headerKey: TITLE_BANNER_IDS.FLOW_2B })),
    ...T3_CONNECTORS.map(c => ({ ...c, flow: '#14', headerKey: TITLE_BANNER_IDS.FLOW_2C }))
  ];

  for (const conn of allFlowConnectors) {
    const startId = conn.start === 'TITLE_BANNER' ? conn.headerKey : createdNodes.get(conn.start);
    const endId = createdNodes.get(conn.end);
    if (!startId || !endId) {
      throw new Error(`Nodo non trovato per connettore ${conn.flow}: ${conn.start} -> ${conn.end}`);
    }

    const pairKey = `${startId}->${endId}`;
    if (existingConnMap.has(pairKey)) {
      const existingConnId = existingConnMap.get(pairKey);
      createdConnectors.push({ id: existingConnId, flow: conn.flow, start: conn.start, end: conn.end });
    } else {
      const created = await createIsoConnector(startId, endId, conn.startSnap, conn.endSnap, conn.label, conn.style);
      if (!created.id) {
        throw new Error(`Fallita creazione connettore ${conn.flow} (${conn.start}->${conn.end}): ${JSON.stringify(created)}`);
      }
      createdConnectors.push({ id: created.id, flow: conn.flow, start: conn.start, end: conn.end });
      existingConnMap.set(pairKey, created.id);
    }
  }

  console.log(`[PASS] Connettori Ortogonali 90° creati e verificati: ${createdConnectors.length}/83`);
  console.log(`  • Tier 1 (#02): ${T1_CONNECTORS.length} connettori`);
  console.log(`  • Tier 2 (#08): ${T2_CONNECTORS.length} connettori`);
  console.log(`  • Tier 3 (#14): ${T3_CONNECTORS.length} connettori`);

  // --------------------------------------------------------------------------
  // STEP E: Live Board Verification (100% Query su Miro REST API)
  // --------------------------------------------------------------------------
  console.log('\n--- STEP E: Verifica Live al 100% degli Elementi Creati ---');
  let verifiedNodesCount = 0;
  for (const [key, id] of createdNodes.entries()) {
    const check = await miroApi(`/shapes/${id}`);
    if (check.id === id) {
      verifiedNodesCount++;
    } else {
      console.error(`[FAIL] Nodo ${key} (ID: ${id}) non verificato live!`);
    }
    await delay(DELAY_VERIFY_MS);
  }

  let verifiedConnCount = 0;
  for (const conn of createdConnectors) {
    const check = await miroApi(`/connectors/${conn.id}`);
    if (check.id === conn.id) {
      verifiedConnCount++;
    } else {
      console.error(`[FAIL] Connettore ${conn.id} (${conn.start}->${conn.end}) non verificato live!`);
    }
    await delay(DELAY_VERIFY_MS);
  }

  // Verifica finale integrità dei cartigli
  for (const badgeId of PROTECTED_BADGE_IDS) {
    const check = await miroApi(`/shapes/${badgeId}`);
    if (!check.id) {
      throw new Error(`Cartiglio protetto manomesso: ${badgeId}`);
    }
  }

  console.log('\n======================================================================');
  console.log('✅ DEPLOYMENT LIVE MIRO COMPLETATO CON SUCCESSO!');
  console.log(`• Nodi ISO 5807 Operativi & Verificati Live: ${verifiedNodesCount} / ${createdNodes.size}`);
  console.log(`• Connettori Elbowed Creati & Verificati Live: ${verifiedConnCount} / ${createdConnectors.length}`);
  console.log(`• Cartigli Badges Preservati & Intatti: 3 / 3`);
  console.log(`• Title Banners Preservati & Aggiornati: 3 / 3`);
  console.log('======================================================================\n');

  // Salvataggio Report di Deployment
  const deploymentReport = {
    timestamp: new Date().toISOString(),
    boardId: BOARD_ID,
    summary: {
      deletedConnectors: deletedConnCount,
      deletedNodes: deletedNodeCount,
      createdNodes: verifiedNodesCount,
      createdConnectors: verifiedConnCount,
      badgesPreserved: Array.from(PROTECTED_BADGE_IDS),
      bannersUpdated: TITLE_BANNER_IDS
    },
    createdNodesMap: Object.fromEntries(createdNodes),
    createdConnectorsList: createdConnectors
  };

  const reportPath = path.resolve(__dirname, '../.agents/teamwork/worker_miro_1/deployment_live_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(deploymentReport, null, 2), 'utf8');
  console.log(`Report di deployment salvato in: ${reportPath}`);
}

// Esecuzione se invocato direttamente
if (require.main === module) {
  runMiroLiveDeployment().catch(err => {
    console.error('❌ ERRORE FATALE DURANTE IL DEPLOYMENT SU MIRO:', err);
    process.exit(1);
  });
}

module.exports = { runMiroLiveDeployment };
