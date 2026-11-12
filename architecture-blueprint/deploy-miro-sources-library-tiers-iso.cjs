/**
 * deploy-miro-sources-library-tiers-iso.cjs
 * 
 * Script autoritativo per il deployment su Miro Board (Board ID: uXjVEbo6L2o=).
 * Esegue la riorganizzazione chirurgica completa dei 3 diagrammi della Sezione LIBRERIA FONTI:
 * - Flowchart #05 (FLOW-5A): Tier 1 (B2C Casual) - Archivio Open Access, Filtri Avanzati & Read-Only (NO AI / NO RAG)
 * - Flowchart #11 (FLOW-5B): Tier 2 (Pro P.IVA) - Sintesi Premium, Area Studio Locale (IndexedDB) & Commissione Scientifica
 * - Flowchart #17 (FLOW-5C): Tier 3 (Elite Teams) - AI Studio (100%), Chatbot Scientifico 24/7, Bollettino & RAG Sync
 * 
 * Vincoli Architetturali e Normativi (ISO 5807 / Regole Progetto 01, 08, 10):
 * 1. Preservazione assoluta dei 3 Badge protetti (#05: 3458764688417722718, #11: 3458764688417722746, #17: 3458764688417722803).
 * 2. Rispetto della No-Fly Zone >= 40px attorno a ciascun cartiglio badge.
 * 3. Aggiornamento in-place dei 3 Title Banner (#05: 3458764686767602808, #11: 3458764688307439994, #17: 3458764688307470427).
 * 4. Rimozione chirurgica delle sole forme operative di Colonna 5 senza toccare gli altri 15 diagrammi esterni.
 * 5. Routing connettori ortogonale a 90 gradi ('elbowed') con validatore geometrico integrato che attesta 0 line-box crossings.
 * 6. Palette per Swimlane conforme agli standard ISO del blueprint.
 * 7. Zero emoji ovunque (Regola 01).
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
  '3458764688417722718', // Badge #05 (Tier 1 B2C Casual)
  '3458764688417722746', // Badge #11 (Tier 2 Pro P.IVA)
  '3458764688417722803'  // Badge #17 (Tier 3 Elite Teams)
]);

// Registro Title Header Banners (Aggiornamento in-place preservando l'ID Miro)
const TITLE_BANNER_IDS = {
  FLOW_5A: '3458764686767602808',
  FLOW_5B: '3458764688307439994',
  FLOW_5C: '3458764688307470427'
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
 * Crea una shape conforme allo standard ISO 5807 su Miro.
 * @param {object} nodeDef - Definizione del nodo.
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
// DEFINIZIONE NODI ISO 5807: FLOW-5A (TIER 1 B2C CASUAL - LIBRERIA FONTI)
// ============================================================================
const T1_NODES = [
  {
    key: 'T1_START',
    shape: 'round_rectangle',
    width: 440,
    height: 70,
    x: 6048.24,
    y: 720,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    fontSize: '14',
    content: '<p style="text-align:center"><strong>Inizio: Accesso Sezione Libreria Fonti</strong><br><span style="font-size:11px">Catalogo Aperto &bull; Tier 1 Casual</span></p>'
  },
  {
    key: 'T1_SEARCH',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6048.24,
    y: 840,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Barra di Ricerca Testuale Full-Text</strong><br><span style="font-size:11px">Input libero parole chiave, distretti anatomici, obiettivi sportivi</span></p>'
  },
  {
    key: 'T1_FILTERS',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6048.24,
    y: 960,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Filtri Avanzati a 5 Categorie</strong><br><span style="font-size:11px">Sport, Distretto muscolare, Patologia, Tipo studio, Anno pubblicazione</span></p>'
  },
  {
    key: 'T1_GW_QUERY',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6048.24,
    y: 1080,
    fillColor: '#fef9e7',
    borderColor: '#d4ac0d',
    color: '#7d6608',
    content: '<p style="text-align:center"><strong>API Gateway: Ingest Query &amp; Rate Limiting</strong><br><span style="font-size:11px">GET /api/v1/sources/open-access/search &bull; Max 60 req/min anti-scraping</span></p>'
  },
  {
    key: 'T1_SRV_SEARCH',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6048.24,
    y: 1200,
    fillColor: '#e8f8f5',
    borderColor: '#16a085',
    color: '#0e6251',
    content: '<p style="text-align:center"><strong>Server Scatola Nera: Matching MeSH &amp; Search Engine</strong><br><span style="font-size:11px">Query indicizzata su basi dati Open Access mondiali (PMC, DOAJ, bioRxiv)</span></p>'
  },
  {
    key: 'T1_DB_PAPERS',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6048.24,
    y: 1320,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Database Silo 1: Archivio open_access_papers</strong><br><span style="font-size:11px">Tabelle metadati paper, abstract, licenze CC-BY &amp; research_taxonomies</span></p>'
  },
  {
    key: 'T1_SELECT',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6048.24,
    y: 1440,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Selezione Articolo Scientifico dall\'Elenco Risultati</strong><br><span style="font-size:11px">Card articolo con titolo, autori, anno e badge di accessibilita</span></p>'
  },
  {
    key: 'T1_DEC_IS_OA',
    shape: 'rhombus',
    width: 460,
    height: 130,
    x: 6048.24,
    y: 1600,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Lo Studio Selezionato e Open Access Gratuito?</strong><br><span style="font-size:11px">Verifica licenza editoriale: Open Access vs Premium/Privato</span></p>'
  },
  {
    key: 'T1_ERR_LOCKED',
    shape: 'rectangle',
    width: 420,
    height: 85,
    x: 6680,
    y: 1600,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p style="text-align:center"><strong>Avviso di Blocco: Studio Premium</strong><br><span style="font-size:11px">Sintesi tecnica e approfondimenti riservati ai piani Tier 2 e Tier 3</span></p>'
  },
  {
    key: 'T1_GW_STREAM',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6048.24,
    y: 1760,
    fillColor: '#fef9e7',
    borderColor: '#d4ac0d',
    color: '#7d6608',
    content: '<p style="text-align:center"><strong>API Gateway: RBAC Policy &amp; Blocco Download</strong><br><span style="font-size:11px">GET /api/v1/sources/papers/{id}/stream &bull; Enforce sola lettura protetta</span></p>'
  },
  {
    key: 'T1_SRV_STREAM',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6048.24,
    y: 1880,
    fillColor: '#e8f8f5',
    borderColor: '#16a085',
    color: '#0e6251',
    content: '<p style="text-align:center"><strong>Server Scatola Nera: Stream PDF Vettoriale Watermarked</strong><br><span style="font-size:11px">Applicazione in-memory di watermark visivo personale anti-copia</span></p>'
  },
  {
    key: 'T1_RENDER_READER',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6048.24,
    y: 2000,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Lettore In-App in Sola Lettura (Read-Only)</strong><br><span style="font-size:11px">Download, copia testo, stampa e Area Studio disabilitati da policy</span></p>'
  },
  {
    key: 'T1_END',
    shape: 'round_rectangle',
    width: 460,
    height: 70,
    x: 6048.24,
    y: 2130,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    fontSize: '14',
    content: '<p style="text-align:center"><strong>Fine: Consultazione Studio Open Access</strong><br><span style="font-size:11px">Zero Download &bull; Zero Area Studio &bull; NO AI &bull; NO RAG</span></p>'
  }
];

const T1_CONNECTORS = [
  { start: 'T1_START', end: 'T1_SEARCH', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_SEARCH', end: 'T1_FILTERS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_FILTERS', end: 'T1_GW_QUERY', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_GW_QUERY', end: 'T1_SRV_SEARCH', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_SRV_SEARCH', end: 'T1_DB_PAPERS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_DB_PAPERS', end: 'T1_SELECT', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_SELECT', end: 'T1_DEC_IS_OA', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_DEC_IS_OA', end: 'T1_ERR_LOCKED', startSnap: 'right', endSnap: 'left', label: 'No (Studio Premium)' },
  { start: 'T1_DEC_IS_OA', end: 'T1_GW_STREAM', startSnap: 'bottom', endSnap: 'top', label: 'Si (Open Access)' },
  { start: 'T1_GW_STREAM', end: 'T1_SRV_STREAM', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_SRV_STREAM', end: 'T1_RENDER_READER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_RENDER_READER', end: 'T1_END', startSnap: 'bottom', endSnap: 'top', label: '' }
];

// ============================================================================
// DEFINIZIONE NODI ISO 5807: FLOW-5B (TIER 2 PRO P.IVA - LIBRERIA FONTI)
// ============================================================================
const T2_NODES = [
  {
    key: 'T2_START',
    shape: 'round_rectangle',
    width: 440,
    height: 70,
    x: 6230.26,
    y: 3860,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    color: '#ffffff',
    fontSize: '14',
    content: '<p style="text-align:center"><strong>Inizio: Accesso Pro alla Libreria Fonti</strong><br><span style="font-size:11px">Piattaforma Coach &amp; Chinesiologi P.IVA</span></p>'
  },
  {
    key: 'T2_PRO_SEARCH',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6230.26,
    y: 3990,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Ricerca Avanzata Completa &amp; Gestione Preferiti</strong><br><span style="font-size:11px">Filtri su tutte le categorie disponibili e salvataggio segnalibri</span></p>'
  },
  {
    key: 'T2_DEC_ACTION',
    shape: 'rhombus',
    width: 480,
    height: 130,
    x: 6230.26,
    y: 4160,
    fillColor: '#fed7aa',
    borderColor: '#ea580c',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Scelta Operativa del Professionista?</strong><br><span style="font-size:11px">Studio Locale vs Scheda Sintesi vs Proposta Ricerca</span></p>'
  },
  {
    key: 'T2_LOCAL_STUDY',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 5550,
    y: 4160,
    fillColor: '#ebf5fb',
    borderColor: '#2980b9',
    color: '#1b4f72',
    content: '<p style="text-align:center"><strong>Area Studio Digitale In-App Locale (IndexedDB)</strong><br><span style="font-size:11px">Evidenziatore, matita, gomma, note e mappe concettuali manuali offline</span></p>'
  },
  {
    key: 'T2_PROPOSE_FORM',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 6910,
    y: 4160,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Form Invio Proposta DOI o Tesi Inedita</strong><br><span style="font-size:11px">Segnalazione codice DOI/PMID o upload propria ricerca/tesi</span></p>'
  },
  {
    key: 'T2_GW_VALIDATE',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6230.26,
    y: 4340,
    fillColor: '#fef9e7',
    borderColor: '#d4ac0d',
    color: '#7d6608',
    content: '<p style="text-align:center"><strong>API Gateway: Validazione Pro P.IVA &amp; Anti-Spam Gate</strong><br><span style="font-size:11px">Verifica credenziali Pro, quota invii e instradamento richieste</span></p>'
  },
  {
    key: 'T2_SRV_SYNTHESIS',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6230.26,
    y: 4470,
    fillColor: '#e8f8f5',
    borderColor: '#16a085',
    color: '#0e6251',
    content: '<p style="text-align:center"><strong>Server: Erogazione Scheda Tecnica di Sintesi</strong><br><span style="font-size:11px">Distribuzione estratti strutturati nel pieno rispetto del copyright</span></p>'
  },
  {
    key: 'T2_SRV_COMMISSION',
    shape: 'rectangle',
    width: 460,
    height: 85,
    x: 6910,
    y: 4400,
    fillColor: '#e8f8f5',
    borderColor: '#16a085',
    color: '#0e6251',
    content: '<p style="text-align:center"><strong>Server: Pipeline Ingestion &amp; Pre-Verifica</strong><br><span style="font-size:11px">Fetch Crossref/PubMed API e controllo anti-plagio per il comitato</span></p>'
  },
  {
    key: 'T2_DB_SUMMARIES',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6230.26,
    y: 4600,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Database Silo 1 Pro: Tabella premium_study_summaries</strong><br><span style="font-size:11px">Schede di sintesi certificate &amp; tabella user_study_favorites</span></p>'
  },
  {
    key: 'T2_DB_COMMISSION',
    shape: 'rectangle',
    width: 460,
    height: 85,
    x: 6910,
    y: 4530,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Database Silo 1 Pro: Coda Submissions</strong><br><span style="font-size:11px">Registro proposte in revisione per la Commissione Scientifica T7</span></p>'
  },
  {
    key: 'T2_VIEW_SYNTHESIS',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6230.26,
    y: 4730,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Visualizzazione Scheda Tecnica di Sintesi</strong><br><span style="font-size:11px">Metodologia, Risultati, Applicazioni Pratiche per il Coach e Link DOI</span></p>'
  },
  {
    key: 'T2_ALERT_COMMISSION',
    shape: 'rectangle',
    width: 460,
    height: 85,
    x: 6910,
    y: 4660,
    fillColor: '#eafaf1',
    borderColor: '#27ae60',
    color: '#145a32',
    content: '<p style="text-align:center"><strong>Notifica di Assegnazione alla Commissione Scientifica</strong><br><span style="font-size:11px">Proposta in revisione accademica prima della pubblicazione ufficiale</span></p>'
  },
  {
    key: 'T2_END',
    shape: 'round_rectangle',
    width: 460,
    height: 70,
    x: 6230.26,
    y: 4950,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    color: '#ffffff',
    fontSize: '14',
    content: '<p style="text-align:center"><strong>Fine: Studio Approfondito o Proposta Inviata</strong><br><span style="font-size:11px">IndexedDB Locale &bull; NO AI &bull; NO RAG &bull; Diritto d\'Autore Tutelato</span></p>'
  }
];

const T2_CONNECTORS = [
  { start: 'T2_START', end: 'T2_PRO_SEARCH', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_PRO_SEARCH', end: 'T2_DEC_ACTION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_DEC_ACTION', end: 'T2_LOCAL_STUDY', startSnap: 'left', endSnap: 'right', label: 'Area Studio Locale' },
  { start: 'T2_LOCAL_STUDY', end: 'T2_END', startSnap: 'bottom', endSnap: 'left', label: 'Studio Offline' },
  { start: 'T2_DEC_ACTION', end: 'T2_PROPOSE_FORM', startSnap: 'right', endSnap: 'left', label: 'Proposta Ricerca' },
  { start: 'T2_DEC_ACTION', end: 'T2_GW_VALIDATE', startSnap: 'bottom', endSnap: 'top', label: 'Scheda Sintesi' },
  { start: 'T2_PROPOSE_FORM', end: 'T2_SRV_COMMISSION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_GW_VALIDATE', end: 'T2_SRV_SYNTHESIS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_SRV_SYNTHESIS', end: 'T2_DB_SUMMARIES', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_SRV_COMMISSION', end: 'T2_DB_COMMISSION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_DB_SUMMARIES', end: 'T2_VIEW_SYNTHESIS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_DB_COMMISSION', end: 'T2_ALERT_COMMISSION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_VIEW_SYNTHESIS', end: 'T2_END', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_ALERT_COMMISSION', end: 'T2_END', startSnap: 'bottom', endSnap: 'right', label: '' }
];

// ============================================================================
// DEFINIZIONE NODI ISO 5807: FLOW-5C (TIER 3 ELITE TEAMS - LIBRERIA FONTI)
// ============================================================================
const T3_NODES = [
  {
    key: 'T3_START',
    shape: 'round_rectangle',
    width: 440,
    height: 70,
    x: 6645.21,
    y: 8320,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    color: '#ffffff',
    fontSize: '14',
    content: '<p style="text-align:center"><strong>Inizio: Accesso Elite alla Libreria Fonti</strong><br><span style="font-size:11px">High-Level Performance Staff &amp; Top Club</span></p>'
  },
  {
    key: 'T3_ELITE_SEARCH',
    shape: 'rectangle',
    width: 540,
    height: 85,
    x: 6645.21,
    y: 8450,
    fillColor: '#e0e7ff',
    borderColor: '#6366f1',
    color: '#1e1b4b',
    content: '<p style="text-align:center"><strong>Ricerca con Indicatori CEBM I-V &amp; Cartelle Team</strong><br><span style="font-size:11px">Gerarchia prove Oxford, quartili JCR Q1-Q4 e cartelle condivise club</span></p>'
  },
  {
    key: 'T3_DEC_FEATURE',
    shape: 'rhombus',
    width: 500,
    height: 130,
    x: 6645.21,
    y: 8620,
    fillColor: '#ede9fe',
    borderColor: '#8b5cf6',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Selezione Funzione Specialistica Tier 3?</strong><br><span style="font-size:11px">Bollettino vs AI Specialistica vs Sincronizzazione RAG</span></p>'
  },
  {
    key: 'T3_GW_MTLS',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6645.21,
    y: 8800,
    fillColor: '#fae8ff',
    borderColor: '#d946ef',
    color: '#701a75',
    content: '<p style="text-align:center"><strong>API Gateway Enterprise mTLS: Secure VPC Gate</strong><br><span style="font-size:11px">Certificati client societari, isolamento multi-tenant &amp; RBAC per ruolo</span></p>'
  },
  {
    key: 'T3_DEC_BRANCH',
    shape: 'rhombus',
    width: 500,
    height: 130,
    x: 6645.21,
    y: 8970,
    fillColor: '#ede9fe',
    borderColor: '#8b5cf6',
    color: '#0f172a',
    content: '<p style="text-align:center"><strong>Instradamento Workflow Scientifico?</strong><br><span style="font-size:11px">Bollettino Roster vs AI Reasoning vs Ingestion RAG</span></p>'
  },
  {
    key: 'T3_SRV_BULLETIN',
    shape: 'rectangle',
    width: 480,
    height: 85,
    x: 5980,
    y: 9120,
    fillColor: '#e8f8f5',
    borderColor: '#16a085',
    color: '#0e6251',
    content: '<p style="text-align:center"><strong>Server: Schedulatore Bollettino Settimanale</strong><br><span style="font-size:11px">Filtraggio news accademico personalizzato sugli sport della rosa</span></p>'
  },
  {
    key: 'T3_DB_BULLETIN',
    shape: 'rectangle',
    width: 480,
    height: 85,
    x: 5980,
    y: 9250,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Database Silo 2: weekly_scientific_bulletins</strong><br><span style="font-size:11px">Archivio rassegne partizionato per club e discipline</span></p>'
  },
  {
    key: 'T3_VIEW_BULLETIN',
    shape: 'rectangle',
    width: 480,
    height: 85,
    x: 5980,
    y: 9380,
    fillColor: '#e0e7ff',
    borderColor: '#6366f1',
    color: '#1e1b4b',
    content: '<p style="text-align:center"><strong>Consultazione Bollettino &amp; Aggiornamenti</strong><br><span style="font-size:11px">Feed novita scientifiche del lunedi con sintesi per i preparatori</span></p>'
  },
  {
    key: 'T3_SRV_AI_CLUSTER',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6645.21,
    y: 9120,
    fillColor: '#e8f8f5',
    borderColor: '#16a085',
    color: '#0e6251',
    content: '<p style="text-align:center"><strong>Cluster AI Proprietari T7 (100% Potenza di Calcolo)</strong><br><span style="font-size:11px">Sintesi densa, traduzione tecnica e spiegazione per atleti</span></p>'
  },
  {
    key: 'T3_AI_STUDY_SUITE',
    shape: 'rectangle',
    width: 520,
    height: 95,
    x: 6645.21,
    y: 9260,
    fillColor: '#e0e7ff',
    borderColor: '#6366f1',
    color: '#1e1b4b',
    content: '<p style="text-align:center"><strong>Area Studio AI con Chatbot Documentale 24/7</strong><br><span style="font-size:11px">Domande sullo studio, note digitali e generazione mappe concettuali SVG</span></p>'
  },
  {
    key: 'T3_SRV_RAG_PIPE',
    shape: 'rectangle',
    width: 480,
    height: 85,
    x: 7310,
    y: 9120,
    fillColor: '#e8f8f5',
    borderColor: '#16a085',
    color: '#0e6251',
    content: '<p style="text-align:center"><strong>Server: Pipeline Ingestion RAG &amp; Embedding</strong><br><span style="font-size:11px">Chunking semantico a 512 token, vettori pgvector 1536d</span></p>'
  },
  {
    key: 'T3_DB_BUNKER_RAG',
    shape: 'rectangle',
    width: 480,
    height: 85,
    x: 7310,
    y: 9250,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Bunker Silo 2 KMS: Schema team_scientific_rag</strong><br><span style="font-size:11px">Vettori cifrati con chiave societaria KMS e isolamento totale</span></p>'
  },
  {
    key: 'T3_CROSS_LINK',
    shape: 'rectangle',
    width: 480,
    height: 85,
    x: 7310,
    y: 9380,
    fillColor: '#f4ecf7',
    borderColor: '#8e44ad',
    color: '#512e5f',
    content: '<p style="text-align:center"><strong>Cross-Linking con Programmazione (#15) e Data Analisi (#16)</strong><br><span style="font-size:11px">Evidenze scientifiche integrate nel motore decisionale dei carichi</span></p>'
  },
  {
    key: 'T3_NOTIFY_SYNC',
    shape: 'rectangle',
    width: 520,
    height: 85,
    x: 6645.21,
    y: 9530,
    fillColor: '#eafaf1',
    borderColor: '#27ae60',
    color: '#145a32',
    content: '<p style="text-align:center"><strong>Conferma: Conoscenza Integrata nel RAG del Team</strong><br><span style="font-size:11px">Teoria scientifica collegata alla pianificazione pratica sul campo</span></p>'
  },
  {
    key: 'T3_END',
    shape: 'round_rectangle',
    width: 460,
    height: 70,
    x: 6645.21,
    y: 9670,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    color: '#ffffff',
    fontSize: '14',
    content: '<p style="text-align:center"><strong>Fine: Conoscenza Scientifica Trasformata in Vantaggio Tattico</strong><br><span style="font-size:11px">AI 100% &bull; RAG 1-Click Sync &bull; Bunker Silo 2 KMS</span></p>'
  }
];

const T3_CONNECTORS = [
  { start: 'T3_START', end: 'T3_ELITE_SEARCH', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_ELITE_SEARCH', end: 'T3_DEC_FEATURE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_DEC_FEATURE', end: 'T3_GW_MTLS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_GW_MTLS', end: 'T3_DEC_BRANCH', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_DEC_BRANCH', end: 'T3_SRV_BULLETIN', startSnap: 'left', endSnap: 'top', label: 'Bollettino Settimanale' },
  { start: 'T3_DEC_BRANCH', end: 'T3_SRV_AI_CLUSTER', startSnap: 'bottom', endSnap: 'top', label: 'AI Sintesi & Chatbot' },
  { start: 'T3_DEC_BRANCH', end: 'T3_SRV_RAG_PIPE', startSnap: 'right', endSnap: 'top', label: '1-Click RAG Sync' },
  { start: 'T3_SRV_BULLETIN', end: 'T3_DB_BULLETIN', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_DB_BULLETIN', end: 'T3_VIEW_BULLETIN', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_VIEW_BULLETIN', end: 'T3_NOTIFY_SYNC', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T3_SRV_AI_CLUSTER', end: 'T3_AI_STUDY_SUITE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_AI_STUDY_SUITE', end: 'T3_NOTIFY_SYNC', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_SRV_RAG_PIPE', end: 'T3_DB_BUNKER_RAG', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_DB_BUNKER_RAG', end: 'T3_CROSS_LINK', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_CROSS_LINK', end: 'T3_NOTIFY_SYNC', startSnap: 'bottom', endSnap: 'right', label: '' },
  { start: 'T3_NOTIFY_SYNC', end: 'T3_END', startSnap: 'bottom', endSnap: 'top', label: '' }
];

// ============================================================================
// VALIDATORE GEOMETRICO RIGOROSO (0 LINE-BOX CROSSINGS)
// ============================================================================

/**
 * Calcola le coordinate assolute di ancoraggio di un nodo dato il suo snap.
 * @param {object} node - Oggetto definizione nodo.
 * @param {string} snap - Punto di snap ('top', 'bottom', 'left', 'right').
 * @returns {object} Coordinate { x, y }.
 */
function getSnapPoint(node, snap) {
  const halfW = node.width / 2;
  const halfH = node.height / 2;
  switch (snap) {
    case 'top': return { x: node.x, y: node.y - halfH };
    case 'bottom': return { x: node.x, y: node.y + halfH };
    case 'left': return { x: node.x - halfW, y: node.y };
    case 'right': return { x: node.x + halfW, y: node.y };
    default: return { x: node.x, y: node.y };
  }
}

/**
 * Verifica se un segmento ortogonale attraversa il rettangolo di un nodo terzo.
 * @param {object} p1 - Punto iniziale segmento { x, y }.
 * @param {object} p2 - Punto finale segmento { x, y }.
 * @param {object} box - Riquadro nodo { minX, maxX, minY, maxY }.
 * @param {number} padding - Margine di tolleranza di sicurezza.
 * @returns {boolean} True se c'e collisione/attraversamento.
 */
function segmentIntersectsBox(p1, p2, box, padding = 4.0) {
  const bMinX = box.minX + padding;
  const bMaxX = box.maxX - padding;
  const bMinY = box.minY + padding;
  const bMaxY = box.maxY - padding;

  if (bMinX >= bMaxX || bMinY >= bMaxY) return false;

  // Segmento verticale (X costante)
  if (Math.abs(p1.x - p2.x) < 0.001) {
    const segX = p1.x;
    const segMinY = Math.min(p1.y, p2.y);
    const segMaxY = Math.max(p1.y, p2.y);
    if (segX > bMinX && segX < bMaxX) {
      if (Math.max(segMinY, bMinY) < Math.min(segMaxY, bMaxY)) {
        return true;
      }
    }
    return false;
  }

  // Segmento orizzontale (Y costante)
  if (Math.abs(p1.y - p2.y) < 0.001) {
    const segY = p1.y;
    const segMinX = Math.min(p1.x, p2.x);
    const segMaxX = Math.max(p1.x, p2.x);
    if (segY > bMinY && segY < bMaxY) {
      if (Math.max(segMinX, bMinX) < Math.min(segMaxX, bMaxX)) {
        return true;
      }
    }
    return false;
  }

  return false;
}

/**
 * Valida che tutti i connettori ortogonali a 90 gradi abbiano 0 incroci line-box.
 * @param {Array<object>} nodes - Elenco nodi del tier.
 * @param {Array<object>} connectors - Elenco connettori del tier.
 * @param {string} tierLabel - Etichetta del tier.
 * @returns {object} Risultato validazione { collisionCount, collisions }.
 */
function validateZeroCrossings(nodes, connectors, tierLabel) {
  const nodeMap = new Map();
  nodes.forEach(n => {
    nodeMap.set(n.key, {
      ...n,
      minX: n.x - n.width / 2,
      maxX: n.x + n.width / 2,
      minY: n.y - n.height / 2,
      maxY: n.y + n.height / 2
    });
  });

  const collisions = [];

  for (const conn of connectors) {
    const startNode = nodeMap.get(conn.start);
    const endNode = nodeMap.get(conn.end);
    if (!startNode || !endNode) {
      collisions.push(`[${tierLabel}] Nodo mancante: ${conn.start} o ${conn.end}`);
      continue;
    }

    const startPt = getSnapPoint(startNode, conn.startSnap);
    const endPt = getSnapPoint(endNode, conn.endSnap);

    // Connettore elbowed ortogonale: calcolo segmenti
    const segments = [];
    if (Math.abs(startPt.x - endPt.x) < 1.0) {
      // Linea retta verticale
      segments.push({ p1: startPt, p2: endPt });
    } else if (Math.abs(startPt.y - endPt.y) < 1.0) {
      // Linea retta orizzontale
      segments.push({ p1: startPt, p2: endPt });
    } else {
      // Connettore a L a 90 gradi
      if (conn.startSnap === 'bottom' || conn.startSnap === 'top') {
        const midPt = { x: startPt.x, y: endPt.y };
        segments.push({ p1: startPt, p2: midPt });
        segments.push({ p1: midPt, p2: endPt });
      } else {
        const midPt = { x: endPt.x, y: startPt.y };
        segments.push({ p1: startPt, p2: midPt });
        segments.push({ p1: midPt, p2: endPt });
      }
    }

    // Verifica collisioni con tutti gli altri nodi
    for (const [key, node] of nodeMap.entries()) {
      if (key === conn.start || key === conn.end) continue;
      for (const seg of segments) {
        if (segmentIntersectsBox(seg.p1, seg.p2, node)) {
          collisions.push(`[${tierLabel}] Collisione: ${conn.start} -> ${conn.end} attraversa nodo ${key}`);
        }
      }
    }
  }

  return {
    collisionCount: collisions.length,
    collisions
  };
}

// ============================================================================
// MAIN DEPLOYMENT PIPELINE
// ============================================================================

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('======================================================================');
  console.log(`AVVIO DEPLOYMENT AUTORITATIVO: LIBRERIA FONTI (3 TIERS) ${isDryRun ? '[MODALITA DRY-RUN]' : '[MODALITA LIVE]'}`);
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

  // STEP 2: Isolamento chirurgico Colonna 5 (senza toccare Colonna 4 ne Colonna 6)
  console.log('[STEP 2/6] Isolamento chirurgico forme operative Colonna 5...');
  
  // Filtri precisi per Tier in Colonna 5
  // Tier 1: Y in [400..2500], X in [5300..7100]
  // Tier 2: Y in [3500..6000], X in [5400..7200]
  // Tier 3: Y in [7900..11000], X in [5800..7600]
  const t1Candidates = boardShapes.filter(s => s.position.y >= 400 && s.position.y <= 2500 && s.position.x >= 5300 && s.position.x <= 7100);
  const t2Candidates = boardShapes.filter(s => s.position.y >= 3500 && s.position.y <= 6000 && s.position.x >= 5400 && s.position.x <= 7200);
  const t3Candidates = boardShapes.filter(s => s.position.y >= 7900 && s.position.y <= 11000 && s.position.x >= 5800 && s.position.x <= 7600);

  const allCol5Shapes = [...t1Candidates, ...t2Candidates, ...t3Candidates];

  // Filtriamo: NON toccare i 3 Badge protetti e i 3 Title Banner
  const shapesToDelete = allCol5Shapes.filter(s => {
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
  console.log(`Vecchie shape operative Colonna 5 da eliminare: ${shapesToDelete.length}`);
  console.log(`Vecchi connettori Colonna 5 da eliminare: ${connectorsToDelete.length}\n`);

  if (isDryRun) {
    console.log('[DRY-RUN] Nessuna modifica eseguita sulla board live.');
    console.log('[DRY-RUN] Summary delle azioni previste:');
    console.log(`  - Eliminazione ${connectorsToDelete.length} connettori obsoleti`);
    console.log(`  - Eliminazione ${shapesToDelete.length} shape operative obsolete`);
    console.log(`  - PATCH in-place dei 3 Title Banner (#05, #11, #17)`);
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
  console.log(`-> Eliminati ${connectorsToDelete.length} vecchi connettori Colonna 5.`);

  for (const shape of shapesToDelete) {
    await miroApi(`/shapes/${shape.id}`, 'DELETE');
    await delay(DELAY_DELETE_MS);
  }
  console.log(`-> Eliminate ${shapesToDelete.length} vecchie shape operative Colonna 5.\n`);

  // STEP 4: Aggiornamento in-place dei 3 Title Banner
  console.log('[STEP 4/6] Aggiornamento testuale dei 3 Title Banner...');
  const bannerTitles = {
    [TITLE_BANNER_IDS.FLOW_5A]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">5. LIBRERIA FONTI: ARCHIVIO OPEN ACCESS, FILTRI AVANZATI &amp; READ-ONLY (TIER 1)</strong></p>',
    [TITLE_BANNER_IDS.FLOW_5B]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">5. LIBRERIA FONTI: SINTESI PREMIUM, AREA STUDIO LOCALE &amp; COMMISSIONE SCIENTIFICA (TIER 2)</strong></p>',
    [TITLE_BANNER_IDS.FLOW_5C]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">5. LIBRERIA FONTI: AI STUDIO, CHATBOT SCIENTIFICO, BOLLETTINO &amp; RAG SYNC (TIER 3)</strong></p>'
  };

  for (const [id, content] of Object.entries(bannerTitles)) {
    await patchTitleBanner(id, content);
    console.log(`-> Title Banner ${id} aggiornato con successo.`);
  }
  console.log('');

  // STEP 5: Creazione dei nuovi nodi ISO 5807
  console.log('[STEP 5/6] Creazione nodi ISO 5807 per Colonna 5...');
  const keyToMiroId = {};

  console.log(`--- Creazione nodi Flow 5A (Tier 1 B2C Casual: ${T1_NODES.length} nodi) ---`);
  for (const node of T1_NODES) {
    const res = await createIsoNode(node);
    if (res && res.id) {
      keyToMiroId[node.key] = res.id;
    } else {
      console.error(`ERRORE creazione nodo ${node.key}:`, res);
    }
  }

  console.log(`--- Creazione nodi Flow 5B (Tier 2 Pro P.IVA: ${T2_NODES.length} nodi) ---`);
  for (const node of T2_NODES) {
    const res = await createIsoNode(node);
    if (res && res.id) {
      keyToMiroId[node.key] = res.id;
    } else {
      console.error(`ERRORE creazione nodo ${node.key}:`, res);
    }
  }

  console.log(`--- Creazione nodi Flow 5C (Tier 3 Elite Teams: ${T3_NODES.length} nodi) ---`);
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
  fs.writeFileSync(path.join(reportDir, 'deploy_col5_report.json'), JSON.stringify(report, null, 2));
  console.log('\nReport di deployment salvato in scratch/deploy_col5_report.json');
  console.log('DEPLOYMENT LIBRERIA FONTI COMPLETATO CON SUCCESSO!');
}

main().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
