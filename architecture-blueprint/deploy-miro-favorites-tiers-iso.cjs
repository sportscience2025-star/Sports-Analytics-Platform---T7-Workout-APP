/**
 * deploy-miro-favorites-tiers-iso.cjs
 *
 * Script autoritativo per il deployment su Miro Board (Board ID: uXjVEbo6L2o=).
 * Esegue la riorganizzazione chirurgica completa dei 3 diagrammi della Colonna 6 (PREFERITI):
 * - Flowchart #06 (FLOW-6A): Tier 1 (B2C Consumer) - Esercizi 3D, Programmi Base & Lista Lineare (14 nodi ISO)
 * - Flowchart #12 (FLOW-6B): Tier 2 (Pro P.IVA) - Cartelle Tematiche, Tag, Video 1080p, Template & Fonti (16 nodi ISO)
 * - Flowchart #18 (FLOW-6C): Tier 3 (Elite Teams) - Hub All-in-One, Team Pinning, Ricerca Ibrida AI & Segreto Medico RLS (18 nodi ISO)
 *
 * Modalita di esecuzione CLI:
 * - `--validate-only`: esegue in locale tutte le verifiche geometriche e Regola 10 senza chiamate di rete ne token.
 * - `--dry-run`: richiede process.env.MIRO_ACCESS_TOKEN, interroga la board live e stampa il piano senza modifiche.
 * - (default live): richiede process.env.MIRO_ACCESS_TOKEN, esegue deploy chirurgico e salva scratch/deploy_col6_report.json.
 *
 * Vincoli Architetturali e Normativi (ISO 5807 / Regole Progetto 01, 02, 08, 10):
 * 1. Zero credenziali hardcoded: autenticazione esclusivamente via process.env.MIRO_ACCESS_TOKEN.
 * 2. Preservazione assoluta dei 3 Badge protetti (#06, #12, #18) e No-Fly Zone >= 40px su tutti i 4 lati.
 * 3. Aggiornamento in-place (PATCH) dei 3 Title Banner senza mai eliminarli (#18 rilevato dinamicamente).
 * 4. Isolamento chirurgico della sola Colonna 6 (x >= 8100), senza toccare Colonne 1-5 o Zona 5.
 * 5. Routing connettori esclusivamente 'elbowed' a 90 gradi con textOrientation 'horizontal' e 0 line-box crossings.
 * 6. Zero emoji ovunque (Regola 01).
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================================
// COSTANTI DI CONFIGURAZIONE, LIMITI REGOLA 10 E COORDINATE LIVE VERIFICATE
// ============================================================================

const MIRO_API_BASE_URL = 'https://api.miro.com/v2/boards';
const BOARD_ID = 'uXjVEbo6L2o=';
const REPORT_RELATIVE_PATH = path.join('scratch', 'deploy_col6_report.json');

// Rate limiting chiamate REST Miro v2 (millisecondi)
const DELAY_DELETE_MS = 45;
const DELAY_CREATE_MS = 90;
const DELAY_PATCH_MS = 90;

// Soglie geometriche Regola 10 (pixel)
const MIN_BADGE_CLEARANCE_PX = 40;
const MIN_RECT_WIDTH_PX = 380;
const MAX_RECT_WIDTH_PX = 500;
const MIN_DIAMOND_WIDTH_PX = 360;
const MIN_DIAMOND_HEIGHT_PX = 125;
const MIN_CONSECUTIVE_GAP_PX = 70;
const OBSTACLE_SAFETY_MARGIN_PX = 2;
const AXIS_EPSILON_PX = 0.5;
const COL_1_5_SAFETY_X_LIMIT = 8000;

// Conteggi ISO 1:1 allineati ai 3 file Mermaid (.mmd) di Colonna 6
const EXPECTED_ISO_COUNTS = Object.freeze({
  'FLOW-6A': 14,
  'FLOW-6B': 16,
  'FLOW-6C': 18,
  TOTAL: 48
});

// Cartigli Badge protetti con coordinate live verificate (VIETATO modificare o eliminare)
const PROTECTED_BADGES = Object.freeze({
  'FLOW-6A': Object.freeze({
    badge: '#06',
    id: '3458764688417722722',
    x: 8960.19,
    y: 602.88,
    width: 528.55,
    height: 74.78
  }),
  'FLOW-6B': Object.freeze({
    badge: '#12',
    id: '3458764688417722770',
    x: 9108.26,
    y: 3815.00,
    width: 520,
    height: 75
  }),
  'FLOW-6C': Object.freeze({
    badge: '#18',
    id: '3458764688417722810',
    x: 9225.38,
    y: 8230.99,
    width: 520,
    height: 88.12
  })
});

const PROTECTED_BADGE_IDS = new Set(
  Object.values(PROTECTED_BADGES).map((b) => b.id)
);

// Title Banner statici (#06, #12) e parametri di rilevazione dinamica per #18
const KNOWN_TITLE_BANNERS = Object.freeze({
  'FLOW-6A': Object.freeze({
    badge: '#06',
    id: '3458764686767707716',
    x: 8960.4,
    y: 692.6,
    width: 1372,
    height: 70,
    titleText: '6. PREFERITI: ESERCIZI 3D, PROGRAMMI BASE & LISTA LINEARE (TIER 1)',
    htmlContent:
      '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">6. PREFERITI: ESERCIZI 3D, PROGRAMMI BASE &amp; LISTA LINEARE (TIER 1)</strong></p>'
  }),
  'FLOW-6B': Object.freeze({
    badge: '#12',
    id: '3458764688307440340',
    x: 9108.5,
    y: 3913.5,
    width: 1350,
    height: 70,
    titleText: '6. PREFERITI: CARTELLE TEMATICHE, TAG, VIDEO 1080P, TEMPLATE & FONTI (TIER 2)',
    htmlContent:
      '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">6. PREFERITI: CARTELLE TEMATICHE, TAG, VIDEO 1080P, TEMPLATE &amp; FONTI (TIER 2)</strong></p>'
  }),
  'FLOW-6C': Object.freeze({
    badge: '#18',
    id: null,
    titleText: '6. PREFERITI: HUB ALL-IN-ONE, TEAM PINNING, RICERCA IBRIDA AI & SEGRETO MEDICO RLS (TIER 3)',
    htmlContent:
      '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">6. PREFERITI: HUB ALL-IN-ONE, TEAM PINNING, RICERCA IBRIDA AI &amp; SEGRETO MEDICO RLS (TIER 3)</strong></p>'
  })
});

const BANNER_18_SEARCH_BOUNDS = Object.freeze({
  minWidth: 1200,
  maxHeight: 100,
  centerX: 9225.38,
  maxDeltaX: 250,
  minY: 8270,
  maxY: 8450
});

// Perimetri chirurgici di rimozione vecchie forme operative Colonna 6
const DELETION_ZONES = Object.freeze({
  'FLOW-6A': Object.freeze({ minX: 8100, maxX: 10100, minY: 730, maxY: 2600 }),
  'FLOW-6B': Object.freeze({ minX: 8100, maxX: 10200, minY: 3950, maxY: 6200 }),
  'FLOW-6C': Object.freeze({ minX: 8100, maxX: 10500, minY: 8380, maxY: 11500 })
});

// Palette Funzionale per Corsia (Regola 10)
const PALETTE = Object.freeze({
  CLIENT: Object.freeze({ fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a' }),
  GATEWAY: Object.freeze({ fillColor: '#ede9fe', borderColor: '#7c3aed', color: '#0f172a' }),
  SERVER: Object.freeze({ fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a' }),
  DB: Object.freeze({ fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a' }),
  DECISION: Object.freeze({ fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a' }),
  ERROR: Object.freeze({ fillColor: '#fee2e2', borderColor: '#dc2626', color: '#7f1d1d' }),
  START_END_T1: Object.freeze({ fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff' }),
  START_END_T2: Object.freeze({ fillColor: '#b45309', borderColor: '#f59e0b', color: '#ffffff' }),
  START_END_T3: Object.freeze({ fillColor: '#4338ca', borderColor: '#818cf8', color: '#ffffff' })
});

// ============================================================================
// HELPER COSTRUZIONE NODI HTML & CLIENT REST MIRO V2
// ============================================================================

/**
 * Genera markup HTML centrato e leggibile senza troncamenti per una shape Miro.
 * @param {string} title - Intestazione principale in grassetto.
 * @param {string} subtitle - Dettaglio operativo sintetico su seconda riga.
 * @returns {string} Frammento HTML conforme a Miro REST API v2.
 */
function buildNodeHtml(title, subtitle) {
  if (!subtitle) {
    return `<p style="text-align:center"><strong>${title}</strong></p>`;
  }
  return `<p style="text-align:center"><strong>${title}</strong><br><span style="font-size:11px">${subtitle}</span></p>`;
}

/**
 * Costruisce una definizione nodo ISO completa combinando geometria e palette Regola 10.
 * @param {object} spec - Parametri specifici del nodo (key, mmdId, flow, lane, shape, x, y, width, height, palette, title, subtitle, fontSize).
 * @returns {object} Definizione nodo normalizzata pronta per validazione e deploy.
 */
function makeNode(spec) {
  return {
    key: spec.key,
    mmdId: spec.mmdId,
    flow: spec.flow,
    lane: spec.lane,
    shape: spec.shape,
    x: spec.x,
    y: spec.y,
    width: spec.width,
    height: spec.height,
    fillColor: spec.palette.fillColor,
    borderColor: spec.palette.borderColor,
    color: spec.palette.color,
    fontSize: spec.fontSize || '12',
    content: buildNodeHtml(spec.title, spec.subtitle)
  };
}

/**
 * Attesa asincrona calibrata per il rispetto dei rate limit API Miro.
 * @param {number} ms - Durata dell'attesa in millisecondi.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Legge e valida il token Miro esclusivamente da process.env.MIRO_ACCESS_TOKEN.
 * @returns {string} Valore del token di accesso Miro.
 */
function requireMiroAccessToken() {
  const token = process.env.MIRO_ACCESS_TOKEN;
  if (!token || token.trim() === '') {
    console.error(
      'ERRORE AUTENTICAZIONE: variabile ambiente MIRO_ACCESS_TOKEN mancante. ' +
      'Esportare MIRO_ACCESS_TOKEN per eseguire --dry-run o deploy live, oppure usare --validate-only per la verifica locale.'
    );
    process.exit(1);
  }
  return token.trim();
}

/**
 * Esegue una chiamata HTTP verso le API REST Miro v2.
 * @param {string} accessToken - Token Bearer letto da process.env.MIRO_ACCESS_TOKEN.
 * @param {string} endpoint - Percorso relativo della risorsa sulla board (es. '/shapes').
 * @param {string} method - Metodo HTTP ('GET', 'POST', 'PATCH', 'DELETE').
 * @param {object|null} body - Payload JSON opzionale.
 * @returns {Promise<object>} Risposta JSON deserializzata o oggetto esito.
 */
async function miroApi(accessToken, endpoint, method = 'GET', body = null) {
  const url = `${MIRO_API_BASE_URL}/${BOARD_ID}${endpoint}`;
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (method === 'DELETE') {
    if (!response.ok && response.status !== 404) {
      const errText = await response.text();
      throw new Error(`Miro DELETE ${endpoint} fallita (HTTP ${response.status}): ${errText}`);
    }
    return { status: response.status, ok: response.ok };
  }

  const responseText = await response.text();
  let parsed = null;
  try {
    parsed = responseText ? JSON.parse(responseText) : {};
  } catch (err) {
    parsed = { status: response.status, text: responseText };
  }

  if (!response.ok) {
    throw new Error(
      `Miro ${method} ${endpoint} fallita (HTTP ${response.status}): ${responseText.slice(0, 300)}`
    );
  }
  return parsed;
}

/**
 * Recupera tutte le shape della board Miro con paginazione automatica a cursore.
 * @param {string} accessToken - Token Bearer Miro.
 * @returns {Promise<Array<object>>} Elenco completo delle shape sulla board.
 */
async function fetchAllBoardShapes(accessToken) {
  let cursor = null;
  const allShapes = [];
  do {
    const query = `/shapes?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const res = await miroApi(accessToken, query, 'GET');
    if (res && Array.isArray(res.data)) {
      allShapes.push(...res.data);
    }
    cursor = res && res.cursor ? res.cursor : null;
  } while (cursor);
  return allShapes;
}

/**
 * Recupera tutti i connettori della board Miro con paginazione automatica a cursore.
 * @param {string} accessToken - Token Bearer Miro.
 * @returns {Promise<Array<object>>} Elenco completo dei connettori sulla board.
 */
async function fetchAllBoardConnectors(accessToken) {
  let cursor = null;
  const allConnectors = [];
  do {
    const query = `/connectors?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const res = await miroApi(accessToken, query, 'GET');
    if (res && Array.isArray(res.data)) {
      allConnectors.push(...res.data);
    }
    cursor = res && res.cursor ? res.cursor : null;
  } while (cursor);
  return allConnectors;
}

/**
 * Aggiorna in-place il contenuto HTML di un Title Banner tramite PATCH.
 * @param {string} accessToken - Token Bearer Miro.
 * @param {string} shapeId - ID Miro del banner da aggiornare.
 * @param {string} htmlContent - Nuovo titolo formattato in HTML.
 * @returns {Promise<object>} Oggetto shape aggiornato.
 */
async function patchTitleBanner(accessToken, shapeId, htmlContent) {
  const result = await miroApi(accessToken, `/shapes/${shapeId}`, 'PATCH', {
    data: { content: htmlContent }
  });
  await delay(DELAY_PATCH_MS);
  return result;
}

/**
 * Crea una nuova shape ISO 5807 sulla board Miro.
 * @param {string} accessToken - Token Bearer Miro.
 * @param {object} nodeDef - Definizione del nodo ISO.
 * @returns {Promise<object>} Shape creata comprensiva di ID Miro.
 */
async function createIsoNode(accessToken, nodeDef) {
  const payload = {
    data: {
      content: nodeDef.content,
      shape: nodeDef.shape
    },
    style: {
      fillColor: nodeDef.fillColor,
      fillOpacity: '1.0',
      fontFamily: 'open_sans',
      fontSize: nodeDef.fontSize,
      borderColor: nodeDef.borderColor,
      borderWidth: '2.0',
      borderOpacity: '1.0',
      borderStyle: 'normal',
      textAlign: 'center',
      textAlignVertical: 'middle',
      color: nodeDef.color
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

  const res = await miroApi(accessToken, '/shapes', 'POST', payload);
  await delay(DELAY_CREATE_MS);
  return res;
}

/**
 * Converte il lato di aggancio ('top', 'bottom', 'left', 'right') in coordinate percentuali Miro.
 * @param {string} snap - Nome del punto di ancoraggio.
 * @returns {{x: string, y: string}} Coordinate percentuali Miro.
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
      throw new Error(`Valore snap non valido: ${snap}`);
  }
}

/**
 * Crea un connettore ortogonale a 90 gradi ('elbowed') con etichetta orizzontale su Miro.
 * @param {string} accessToken - Token Bearer Miro.
 * @param {string} startId - ID Miro del nodo sorgente.
 * @param {string} endId - ID Miro del nodo destinazione.
 * @param {object} connDef - Definizione connettore (startSnap, endSnap, label, strokeColor, strokeStyle).
 * @returns {Promise<object>} Connettore creato comprensivo di ID Miro.
 */
async function createIsoConnector(accessToken, startId, endId, connDef) {
  const payload = {
    startItem: {
      id: startId,
      position: snapToPosition(connDef.startSnap)
    },
    endItem: {
      id: endId,
      position: snapToPosition(connDef.endSnap)
    },
    shape: 'elbowed',
    style: {
      startStrokeCap: 'none',
      endStrokeCap: 'stealth',
      strokeWidth: '2.0',
      strokeStyle: connDef.strokeStyle === 'dashed' ? 'dashed' : 'normal',
      strokeColor: connDef.strokeColor || '#475569',
      color: '#0f172a',
      textOrientation: 'horizontal',
      fontSize: '12'
    }
  };

  if (connDef.label && connDef.label.trim() !== '') {
    payload.captions = [
      {
        content: connDef.label,
        position: '50%',
        textAlignVertical: 'middle'
      }
    ];
  }

  const res = await miroApi(accessToken, '/connectors', 'POST', payload);
  await delay(DELAY_CREATE_MS);
  return res;
}

// ============================================================================
// DEFINIZIONE NODI ISO 5807: FLOW-6A (TIER 1 B2C - 14 NODI)
// ============================================================================

const F6A_X_MAIN = 8860;
const F6A_X_RIGHT = 9500;

const T1_NODES = [
  makeNode({
    key: 'F6A_START',
    mmdId: 'START',
    flow: 'FLOW-6A',
    lane: 'LANE_CLIENT',
    shape: 'round_rectangle',
    x: F6A_X_MAIN,
    y: 820,
    width: 460,
    height: 76,
    palette: PALETTE.START_END_T1,
    fontSize: '13',
    title: 'Inizio: Accesso Sezione Preferiti Base (Tier 1)',
    subtitle: 'Software 1 Consumer B2C | Lista Lineare'
  }),
  makeNode({
    key: 'F6A_LINEAR_LIST',
    mmdId: 'LINEAR_LIST',
    flow: 'FLOW-6A',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6A_X_MAIN,
    y: 980,
    width: 460,
    height: 88,
    palette: PALETTE.CLIENT,
    title: 'Vista Lista Semplice e Lineare',
    subtitle: 'Solo Esercizi 3D &amp; Programmi Base - NO Cartelle/Tag'
  }),
  makeNode({
    key: 'F6A_DEC_FAV_ACTION',
    mmdId: 'DEC_FAV_ACTION',
    flow: 'FLOW-6A',
    lane: 'LANE_CLIENT',
    shape: 'rhombus',
    x: F6A_X_MAIN,
    y: 1170,
    width: 460,
    height: 136,
    palette: PALETTE.DECISION,
    title: 'Azione Utente Preferiti?',
    subtitle: 'Apri Sorgente o Salva/Rimuovi Preferito?'
  }),
  makeNode({
    key: 'F6A_NAV_CARD_SRC',
    mmdId: 'NAV_CARD_SRC',
    flow: 'FLOW-6A',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6A_X_RIGHT,
    y: 1170,
    width: 440,
    height: 90,
    palette: PALETTE.CLIENT,
    title: 'Card Passaggio Locale: Apri Sorgente',
    subtitle: 'Catalogo 3D (#02) o Programmi Base (#03)'
  }),
  makeNode({
    key: 'F6A_ACTION_REQ',
    mmdId: 'ACTION_REQ',
    flow: 'FLOW-6A',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6A_X_MAIN,
    y: 1360,
    width: 460,
    height: 88,
    palette: PALETTE.CLIENT,
    title: 'Richiesta Salva, Rimuovi o Apri Puntatore',
    subtitle: 'Operazione su bookmark_id nella lista piatta'
  }),
  makeNode({
    key: 'F6A_GW_ENDPOINT',
    mmdId: 'GW_ENDPOINT',
    flow: 'FLOW-6A',
    lane: 'LANE_GATEWAY',
    shape: 'rectangle',
    x: F6A_X_MAIN,
    y: 1525,
    width: 460,
    height: 88,
    palette: PALETTE.GATEWAY,
    title: 'API Gateway: Ricezione Richiesta Preferiti',
    subtitle: 'GET / POST / DELETE /api/v1/favorites'
  }),
  makeNode({
    key: 'F6A_GW_RBAC_DEC',
    mmdId: 'GW_RBAC_DEC',
    flow: 'FLOW-6A',
    lane: 'LANE_GATEWAY',
    shape: 'rhombus',
    x: F6A_X_MAIN,
    y: 1715,
    width: 460,
    height: 136,
    palette: PALETTE.DECISION,
    title: 'Policy Tier 1: Solo #02 o #03?',
    subtitle: 'NO Cartelle/Tag/Fonti/Video Custom/AI'
  }),
  makeNode({
    key: 'F6A_GW_HTTP_403',
    mmdId: 'GW_HTTP_403',
    flow: 'FLOW-6A',
    lane: 'LANE_GATEWAY',
    shape: 'rectangle',
    x: F6A_X_RIGHT,
    y: 1715,
    width: 440,
    height: 90,
    palette: PALETTE.ERROR,
    title: 'HTTP 403 Forbidden: Blocco Upgrade Tier 1',
    subtitle: 'Funzione o Tipo Asset Non Consentito'
  }),
  makeNode({
    key: 'F6A_ALERT_UPGRADE',
    mmdId: 'ALERT_UPGRADE',
    flow: 'FLOW-6A',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6A_X_RIGHT,
    y: 1885,
    width: 440,
    height: 96,
    palette: PALETTE.ERROR,
    title: 'Avviso Blocco Tier 1',
    subtitle: 'Sottocartelle, Tag, Fonti, Video Custom e AI Riservati a Tier 2/3'
  }),
  makeNode({
    key: 'F6A_SRV_VALIDATE_PTR',
    mmdId: 'SRV_VALIDATE_PTR',
    flow: 'FLOW-6A',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: F6A_X_MAIN,
    y: 1905,
    width: 460,
    height: 88,
    palette: PALETTE.SERVER,
    title: 'Validatore Puntatore Relazionale Deterministico',
    subtitle: 'NO AI, NO RAG, Zero Duplicazione Media'
  }),
  makeNode({
    key: 'F6A_SRV_LINEAR_SORT',
    mmdId: 'SRV_LINEAR_SORT',
    flow: 'FLOW-6A',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: F6A_X_MAIN,
    y: 2070,
    width: 460,
    height: 88,
    palette: PALETTE.SERVER,
    title: 'Ordinatore Lista Lineare',
    subtitle: 'Ordine Cronologico / A-Z, Struttura Piatta Senza Sottocartelle'
  }),
  makeNode({
    key: 'F6A_DB_USER_FAV',
    mmdId: 'DB_USER_FAV',
    flow: 'FLOW-6A',
    lane: 'LANE_DB',
    shape: 'rectangle',
    x: F6A_X_MAIN,
    y: 2235,
    width: 460,
    height: 88,
    palette: PALETTE.DB,
    title: 'Database Silo 1: Tabella user_favorites',
    subtitle: 'Lettura/Scrittura Solo Puntatori bookmark_id'
  }),
  makeNode({
    key: 'F6A_RENDER_UI_STATES',
    mmdId: 'RENDER_UI_STATES',
    flow: 'FLOW-6A',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6A_X_MAIN,
    y: 2400,
    width: 460,
    height: 88,
    palette: PALETTE.CLIENT,
    title: 'Rendering Lista Lineare con 4 Stati UI',
    subtitle: 'Empty, Loading, Populated, Error/Fallback'
  }),
  makeNode({
    key: 'F6A_END_FLOW',
    mmdId: 'END_FLOW',
    flow: 'FLOW-6A',
    lane: 'LANE_DB',
    shape: 'round_rectangle',
    x: F6A_X_MAIN,
    y: 2555,
    width: 460,
    height: 76,
    palette: PALETTE.START_END_T1,
    fontSize: '13',
    title: 'Fine: Preferito Salvato o Aperto in Lista Lineare',
    subtitle: 'Zero Duplicazione Media | NO AI | NO RAG'
  })
];

const T1_CONNECTORS = [
  { id: 'F6A_C01', flow: 'FLOW-6A', start: 'F6A_START', end: 'F6A_LINEAR_LIST', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6A_C02', flow: 'FLOW-6A', start: 'F6A_LINEAR_LIST', end: 'F6A_DEC_FAV_ACTION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6A_C03', flow: 'FLOW-6A', start: 'F6A_DEC_FAV_ACTION', end: 'F6A_NAV_CARD_SRC', startSnap: 'right', endSnap: 'left', label: 'Apri Sorgente (#02/#03)' },
  { id: 'F6A_C04', flow: 'FLOW-6A', start: 'F6A_NAV_CARD_SRC', end: 'F6A_ACTION_REQ', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'F6A_C05', flow: 'FLOW-6A', start: 'F6A_DEC_FAV_ACTION', end: 'F6A_ACTION_REQ', startSnap: 'bottom', endSnap: 'top', label: 'Salva / Rimuovi / Apri' },
  { id: 'F6A_C06', flow: 'FLOW-6A', start: 'F6A_ACTION_REQ', end: 'F6A_GW_ENDPOINT', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6A_C07', flow: 'FLOW-6A', start: 'F6A_GW_ENDPOINT', end: 'F6A_GW_RBAC_DEC', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6A_C08', flow: 'FLOW-6A', start: 'F6A_GW_RBAC_DEC', end: 'F6A_GW_HTTP_403', startSnap: 'right', endSnap: 'left', label: 'No (Tier 2/3)', strokeColor: '#dc2626' },
  { id: 'F6A_C09', flow: 'FLOW-6A', start: 'F6A_GW_HTTP_403', end: 'F6A_ALERT_UPGRADE', startSnap: 'bottom', endSnap: 'top', label: '', strokeColor: '#dc2626' },
  { id: 'F6A_C10', flow: 'FLOW-6A', start: 'F6A_GW_RBAC_DEC', end: 'F6A_SRV_VALIDATE_PTR', startSnap: 'bottom', endSnap: 'top', label: 'Si (#02 o #03)', strokeColor: '#059669' },
  { id: 'F6A_C11', flow: 'FLOW-6A', start: 'F6A_SRV_VALIDATE_PTR', end: 'F6A_SRV_LINEAR_SORT', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6A_C12', flow: 'FLOW-6A', start: 'F6A_SRV_LINEAR_SORT', end: 'F6A_DB_USER_FAV', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6A_C13', flow: 'FLOW-6A', start: 'F6A_DB_USER_FAV', end: 'F6A_RENDER_UI_STATES', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6A_C14', flow: 'FLOW-6A', start: 'F6A_RENDER_UI_STATES', end: 'F6A_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' }
];

// ============================================================================
// DEFINIZIONE NODI ISO 5807: FLOW-6B (TIER 2 PRO P.IVA - 16 NODI)
// ============================================================================

const F6B_X_MID = 9115;
const F6B_X_TOP_LEFT = 8500;
const F6B_X_TOP_RIGHT = 9730;
const F6B_X_COL1 = 8380;
const F6B_X_COL2 = 8870;
const F6B_X_COL3 = 9360;
const F6B_X_COL4 = 9850;

const T2_NODES = [
  makeNode({
    key: 'F6B_START',
    mmdId: 'START',
    flow: 'FLOW-6B',
    lane: 'LANE_CLIENT',
    shape: 'round_rectangle',
    x: F6B_X_MID,
    y: 4050,
    width: 460,
    height: 76,
    palette: PALETTE.START_END_T2,
    fontSize: '13',
    title: 'Inizio: Accesso Hub Preferiti Pro (Tier 2 P.IVA)',
    subtitle: 'Software 2 B2B Pro | Cartelle Tematiche &amp; Tag'
  }),
  makeNode({
    key: 'F6B_PRO_HUB_VIEW',
    mmdId: 'PRO_HUB_VIEW',
    flow: 'FLOW-6B',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6B_X_MID,
    y: 4215,
    width: 480,
    height: 90,
    palette: PALETTE.CLIENT,
    title: 'Workspace Preferiti Pro: Cartelle &amp; Tag',
    subtitle: 'Cartelle Tematiche, Tag Personalizzati &amp; Filtri Deterministici'
  }),
  makeNode({
    key: 'F6B_DEC_PRO_ACTION',
    mmdId: 'DEC_PRO_ACTION',
    flow: 'FLOW-6B',
    lane: 'LANE_CLIENT',
    shape: 'rhombus',
    x: F6B_X_MID,
    y: 4410,
    width: 460,
    height: 136,
    palette: PALETTE.DECISION,
    title: 'Scelta Operativa del Professionista?',
    subtitle: 'Salva Puntatore vs Cartelle/Tag/Clona Template'
  }),
  makeNode({
    key: 'F6B_NAV_CARD_PRO_SRC',
    mmdId: 'NAV_CARD_PRO_SRC',
    flow: 'FLOW-6B',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6B_X_TOP_LEFT,
    y: 4410,
    width: 440,
    height: 104,
    palette: PALETTE.CLIENT,
    title: 'Card Passaggio Locale: Sorgenti Pro',
    subtitle: 'Video 1080p (#08), Programmi &amp; Template (#09), Fonti &amp; Appunti (#11)'
  }),
  makeNode({
    key: 'F6B_UI_FOLDER_TAG_MGR',
    mmdId: 'UI_FOLDER_TAG_MGR',
    flow: 'FLOW-6B',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6B_X_TOP_RIGHT,
    y: 4410,
    width: 440,
    height: 104,
    palette: PALETTE.CLIENT,
    title: 'Gestione Cartelle Tematiche &amp; Tag',
    subtitle: 'Protocolli Ipertrofia, Articoli Nutrizione o Clona Template Cliente'
  }),
  makeNode({
    key: 'F6B_GW_PRO_API',
    mmdId: 'GW_PRO_API',
    flow: 'FLOW-6B',
    lane: 'LANE_GATEWAY',
    shape: 'rectangle',
    x: F6B_X_MID,
    y: 4630,
    width: 480,
    height: 90,
    palette: PALETTE.GATEWAY,
    title: 'API Gateway: Richiesta Autenticata P.IVA',
    subtitle: '/api/v1/pro/favorites (Folders, Tags, Pointers, Clone)'
  }),
  makeNode({
    key: 'F6B_GW_PRO_RBAC',
    mmdId: 'GW_PRO_RBAC',
    flow: 'FLOW-6B',
    lane: 'LANE_GATEWAY',
    shape: 'rhombus',
    x: F6B_X_MID,
    y: 4830,
    width: 460,
    height: 140,
    palette: PALETTE.DECISION,
    title: 'Policy Tier 2: Tipo Consentito?',
    subtitle: 'Blocco Data Analisi, AI, RAG, Condivisione Team'
  }),
  makeNode({
    key: 'F6B_GW_PRO_403',
    mmdId: 'GW_PRO_403',
    flow: 'FLOW-6B',
    lane: 'LANE_GATEWAY',
    shape: 'rectangle',
    x: F6B_X_COL4,
    y: 4830,
    width: 400,
    height: 92,
    palette: PALETTE.ERROR,
    title: 'HTTP 403 Forbidden: Blocco Tier 2',
    subtitle: 'Separazione DB Tier 2 o Funzione Riservata a Tier 3'
  }),
  makeNode({
    key: 'F6B_ALERT_PRO_BLOCK',
    mmdId: 'ALERT_PRO_BLOCK',
    flow: 'FLOW-6B',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6B_X_COL4,
    y: 5015,
    width: 400,
    height: 104,
    palette: PALETTE.ERROR,
    title: 'Avviso Separazione DB &amp; Tier 2',
    subtitle: 'Data Analisi, AI, RAG e Condivisione Team Non Ammessi in Tier 2'
  }),
  makeNode({
    key: 'F6B_SRV_FOLDER_FILTER',
    mmdId: 'SRV_FOLDER_FILTER',
    flow: 'FLOW-6B',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: F6B_X_COL1,
    y: 5210,
    width: 400,
    height: 96,
    palette: PALETTE.SERVER,
    title: 'Motore Filtro Cartelle &amp; Tag',
    subtitle: 'Query Relazionale Deterministica su Cartelle e Tag'
  }),
  makeNode({
    key: 'F6B_SRV_PRO_POINTERS',
    mmdId: 'SRV_PRO_POINTERS',
    flow: 'FLOW-6B',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: F6B_X_COL2,
    y: 5210,
    width: 400,
    height: 96,
    palette: PALETTE.SERVER,
    title: 'Gestore Puntatori Relazionali Pro',
    subtitle: '100% Deterministico, NO AI, NO RAG, Zero Duplicazione'
  }),
  makeNode({
    key: 'F6B_SRV_TEMPLATE_CLONE',
    mmdId: 'SRV_TEMPLATE_CLONE',
    flow: 'FLOW-6B',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: F6B_X_COL3,
    y: 5210,
    width: 400,
    height: 96,
    palette: PALETTE.SERVER,
    title: 'Clonatore Template Programma',
    subtitle: 'Genera Copia Modello Base per Altro Cliente su #09'
  }),
  makeNode({
    key: 'F6B_DB_PRO_FOLDERS_TAGS',
    mmdId: 'DB_PRO_FOLDERS_TAGS',
    flow: 'FLOW-6B',
    lane: 'LANE_DB',
    shape: 'rectangle',
    x: F6B_X_COL1,
    y: 5415,
    width: 400,
    height: 98,
    palette: PALETTE.DB,
    title: 'Silo 1 Pro: Folders &amp; Tags',
    subtitle: 'pro_favorite_folders &amp; pro_favorite_tags (Solo P.IVA)'
  }),
  makeNode({
    key: 'F6B_DB_PRO_POINTERS',
    mmdId: 'DB_PRO_POINTERS',
    flow: 'FLOW-6B',
    lane: 'LANE_DB',
    shape: 'rectangle',
    x: F6B_X_MID,
    y: 5415,
    width: 460,
    height: 98,
    palette: PALETTE.DB,
    title: 'Silo 1 Pro: pro_favorite_pointers',
    subtitle: 'Ref #08/#09/#11, Separato da DB Data Analisi'
  }),
  makeNode({
    key: 'F6B_RENDER_PRO_VIEW',
    mmdId: 'RENDER_PRO_VIEW',
    flow: 'FLOW-6B',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6B_X_MID,
    y: 5625,
    width: 480,
    height: 96,
    palette: PALETTE.CLIENT,
    title: 'Rendering Vista Pro Filtrata (4 Stati UI)',
    subtitle: 'Cartelle/Tag | Empty, Loading, Populated, Error/Fallback'
  }),
  makeNode({
    key: 'F6B_END_FLOW',
    mmdId: 'END_FLOW',
    flow: 'FLOW-6B',
    lane: 'LANE_DB',
    shape: 'round_rectangle',
    x: F6B_X_MID,
    y: 5795,
    width: 480,
    height: 76,
    palette: PALETTE.START_END_T2,
    fontSize: '13',
    title: 'Fine: Preferiti Pro Organizzati o Template Clonato',
    subtitle: 'Separazione DB Data Analisi | NO AI | NO RAG | Solo P.IVA'
  })
];

const T2_CONNECTORS = [
  { id: 'F6B_C01', flow: 'FLOW-6B', start: 'F6B_START', end: 'F6B_PRO_HUB_VIEW', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6B_C02', flow: 'FLOW-6B', start: 'F6B_PRO_HUB_VIEW', end: 'F6B_DEC_PRO_ACTION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6B_C03', flow: 'FLOW-6B', start: 'F6B_DEC_PRO_ACTION', end: 'F6B_NAV_CARD_PRO_SRC', startSnap: 'left', endSnap: 'right', label: 'Salva (#08/#09/#11)' },
  { id: 'F6B_C04', flow: 'FLOW-6B', start: 'F6B_NAV_CARD_PRO_SRC', end: 'F6B_GW_PRO_API', startSnap: 'bottom', endSnap: 'left', label: '' },
  { id: 'F6B_C05', flow: 'FLOW-6B', start: 'F6B_DEC_PRO_ACTION', end: 'F6B_UI_FOLDER_TAG_MGR', startSnap: 'right', endSnap: 'left', label: 'Cartelle/Tag/Clona' },
  { id: 'F6B_C06', flow: 'FLOW-6B', start: 'F6B_UI_FOLDER_TAG_MGR', end: 'F6B_GW_PRO_API', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'F6B_C07', flow: 'FLOW-6B', start: 'F6B_GW_PRO_API', end: 'F6B_GW_PRO_RBAC', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6B_C08', flow: 'FLOW-6B', start: 'F6B_GW_PRO_RBAC', end: 'F6B_GW_PRO_403', startSnap: 'right', endSnap: 'left', label: 'No (DA/AI/RAG/Team)', strokeColor: '#dc2626' },
  { id: 'F6B_C09', flow: 'FLOW-6B', start: 'F6B_GW_PRO_403', end: 'F6B_ALERT_PRO_BLOCK', startSnap: 'bottom', endSnap: 'top', label: '', strokeColor: '#dc2626' },
  { id: 'F6B_C10', flow: 'FLOW-6B', start: 'F6B_GW_PRO_RBAC', end: 'F6B_SRV_FOLDER_FILTER', startSnap: 'left', endSnap: 'top', label: 'Si: Filtra Cartelle/Tag', strokeColor: '#059669' },
  { id: 'F6B_C11', flow: 'FLOW-6B', start: 'F6B_GW_PRO_RBAC', end: 'F6B_SRV_PRO_POINTERS', startSnap: 'bottom', endSnap: 'top', label: 'Si: Puntatore', strokeColor: '#059669' },
  { id: 'F6B_C12', flow: 'FLOW-6B', start: 'F6B_GW_PRO_RBAC', end: 'F6B_SRV_TEMPLATE_CLONE', startSnap: 'bottom', endSnap: 'top', label: 'Si: Clona Template', strokeColor: '#059669' },
  { id: 'F6B_C13', flow: 'FLOW-6B', start: 'F6B_SRV_FOLDER_FILTER', end: 'F6B_DB_PRO_FOLDERS_TAGS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6B_C14', flow: 'FLOW-6B', start: 'F6B_SRV_PRO_POINTERS', end: 'F6B_DB_PRO_POINTERS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6B_C15', flow: 'FLOW-6B', start: 'F6B_SRV_TEMPLATE_CLONE', end: 'F6B_DB_PRO_POINTERS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6B_C16', flow: 'FLOW-6B', start: 'F6B_DB_PRO_FOLDERS_TAGS', end: 'F6B_RENDER_PRO_VIEW', startSnap: 'bottom', endSnap: 'left', label: '' },
  { id: 'F6B_C17', flow: 'FLOW-6B', start: 'F6B_DB_PRO_POINTERS', end: 'F6B_RENDER_PRO_VIEW', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6B_C18', flow: 'FLOW-6B', start: 'F6B_RENDER_PRO_VIEW', end: 'F6B_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' }
];

// ============================================================================
// DEFINIZIONE NODI ISO 5807: FLOW-6C (TIER 3 ELITE TEAMS - 18 NODI)
// ============================================================================

const F6C_X_LEFT = 8600;
const F6C_X_MID = 9225;
const F6C_X_RIGHT = 9850;

const T3_NODES = [
  makeNode({
    key: 'F6C_START',
    mmdId: 'START',
    flow: 'FLOW-6C',
    lane: 'LANE_CLIENT',
    shape: 'round_rectangle',
    x: F6C_X_MID,
    y: 8520,
    width: 480,
    height: 76,
    palette: PALETTE.START_END_T3,
    fontSize: '13',
    title: 'Inizio: Hub Preferiti Enterprise All-in-One (Tier 3)',
    subtitle: 'Software 3 Elite Teams | Team Pinning, AI Ibrida &amp; RLS'
  }),
  makeNode({
    key: 'F6C_DEC_SCOPE',
    mmdId: 'DEC_SCOPE',
    flow: 'FLOW-6C',
    lane: 'LANE_CLIENT',
    shape: 'rhombus',
    x: F6C_X_MID,
    y: 8710,
    width: 460,
    height: 140,
    palette: PALETTE.DECISION,
    title: 'Scelta Scope Preferiti?',
    subtitle: 'Personali vs Team/Staff con Pinning?'
  }),
  makeNode({
    key: 'F6C_UI_TREE_SEARCH',
    mmdId: 'UI_TREE_SEARCH',
    flow: 'FLOW-6C',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6C_X_LEFT,
    y: 8710,
    width: 460,
    height: 96,
    palette: PALETTE.CLIENT,
    title: 'Albero Cartelle Complesse (ltree)',
    subtitle: 'Barra Ricerca Ibrida (Full-Text + AI Semantica)'
  }),
  makeNode({
    key: 'F6C_UI_TEAM_PIN',
    mmdId: 'UI_TEAM_PIN',
    flow: 'FLOW-6C',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6C_X_RIGHT,
    y: 8710,
    width: 460,
    height: 96,
    palette: PALETTE.CLIENT,
    title: 'Vista Preferiti Team/Staff &amp; Pinning',
    subtitle: 'Pinning in Alto Documenti e Routine Cruciali di Squadra'
  }),
  makeNode({
    key: 'F6C_NAV_CARD_ALLINONE',
    mmdId: 'NAV_CARD_ALLINONE',
    flow: 'FLOW-6C',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6C_X_MID,
    y: 8935,
    width: 480,
    height: 106,
    palette: PALETTE.CLIENT,
    title: 'Card Passaggio Locale All-in-One',
    subtitle: '4K (#14), Prog. (#15), Data Analisi (#16), Fonti (#17), RAG/Match/Referti'
  }),
  makeNode({
    key: 'F6C_GW_MTLS_API',
    mmdId: 'GW_MTLS_API',
    flow: 'FLOW-6C',
    lane: 'LANE_GATEWAY',
    shape: 'rectangle',
    x: F6C_X_MID,
    y: 9120,
    width: 480,
    height: 90,
    palette: PALETTE.GATEWAY,
    title: 'API Gateway mTLS + JWT Ruolo Club',
    subtitle: 'Ricezione Chiamata: /api/v1/enterprise/favorites/*'
  }),
  makeNode({
    key: 'F6C_DEC_GDPR_MED',
    mmdId: 'DEC_GDPR_MED',
    flow: 'FLOW-6C',
    lane: 'LANE_GATEWAY',
    shape: 'rhombus',
    x: F6C_X_MID,
    y: 9325,
    width: 460,
    height: 140,
    palette: PALETTE.DECISION,
    title: 'RBAC + GDPR Art. 9 (Segreto Medico)?',
    subtitle: 'Asset Clinico in Team/Staff &amp; Richiedente = Staff Medico?'
  }),
  makeNode({
    key: 'F6C_GW_SILENT_MASK',
    mmdId: 'GW_SILENT_MASK',
    flow: 'FLOW-6C',
    lane: 'LANE_GATEWAY',
    shape: 'rectangle',
    x: F6C_X_RIGHT,
    y: 9325,
    width: 460,
    height: 100,
    palette: PALETTE.ERROR,
    title: 'Filtro Silenzioso Mascheramento Clinico',
    subtitle: 'Oscura Referti a Coach/Preparatori: Zero Leakage &amp; Zero Hint'
  }),
  makeNode({
    key: 'F6C_GW_ROUTE_SECURE',
    mmdId: 'GW_ROUTE_SECURE',
    flow: 'FLOW-6C',
    lane: 'LANE_GATEWAY',
    shape: 'rectangle',
    x: F6C_X_MID,
    y: 9535,
    width: 480,
    height: 96,
    palette: PALETTE.GATEWAY,
    title: 'Inoltro Sicuro con Contesto Ruolo Sanitizzato',
    subtitle: 'role_claim + tenant_kms_id verso Enclave T7'
  }),
  makeNode({
    key: 'F6C_SRV_TREE_PIN',
    mmdId: 'SRV_TREE_PIN',
    flow: 'FLOW-6C',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: F6C_X_LEFT,
    y: 9770,
    width: 460,
    height: 98,
    palette: PALETTE.SERVER,
    title: 'Resolver Albero Gerarchico (ltree)',
    subtitle: 'Motore Pinning Prioritario Team/Staff'
  }),
  makeNode({
    key: 'F6C_SRV_FULLTEXT',
    mmdId: 'SRV_FULLTEXT',
    flow: 'FLOW-6C',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: F6C_X_MID,
    y: 9770,
    width: 460,
    height: 98,
    palette: PALETTE.SERVER,
    title: 'Motore Ricerca Full-Text PostgreSQL',
    subtitle: 'tsvector / tsquery su Metadati &amp; Indici Club'
  }),
  makeNode({
    key: 'F6C_SRV_SEMANTIC_EMBED',
    mmdId: 'SRV_SEMANTIC_EMBED',
    flow: 'FLOW-6C',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: F6C_X_RIGHT,
    y: 9770,
    width: 460,
    height: 98,
    palette: PALETTE.SERVER,
    title: 'AI Semantica Enclave T7 (@google/genai)',
    subtitle: 'ai.models.embedContent (gemini-embedding-2)'
  }),
  makeNode({
    key: 'F6C_DB_FAV_TREES',
    mmdId: 'DB_FAV_TREES',
    flow: 'FLOW-6C',
    lane: 'LANE_DB',
    shape: 'rectangle',
    x: F6C_X_LEFT,
    y: 9995,
    width: 460,
    height: 104,
    palette: PALETTE.DB,
    title: 'Bunker Silo 2 KMS + RLS: club_favorite_trees',
    subtitle: 'Alberi ltree Personali &amp; Team con sensitivity_class'
  }),
  makeNode({
    key: 'F6C_DB_FAV_ITEMS',
    mmdId: 'DB_FAV_ITEMS',
    flow: 'FLOW-6C',
    lane: 'LANE_DB',
    shape: 'rectangle',
    x: F6C_X_MID,
    y: 9995,
    width: 480,
    height: 104,
    palette: PALETTE.DB,
    title: 'Bunker Silo 2 KMS + RLS: club_favorite_items',
    subtitle: 'Puntatori #14-#17, RAG, Match, Referti &amp; Pinning'
  }),
  makeNode({
    key: 'F6C_DB_FAV_EMBED',
    mmdId: 'DB_FAV_EMBED',
    flow: 'FLOW-6C',
    lane: 'LANE_DB',
    shape: 'rectangle',
    x: F6C_X_RIGHT,
    y: 9995,
    width: 460,
    height: 104,
    palette: PALETTE.DB,
    title: 'Bunker Silo 2 KMS + RLS: club_favorite_embeddings',
    subtitle: 'Indici pgvector con PostgreSQL RLS Obbligatoria'
  }),
  makeNode({
    key: 'F6C_SRV_RERANK_GUARD',
    mmdId: 'SRV_RERANK_GUARD',
    flow: 'FLOW-6C',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: F6C_X_MID,
    y: 10205,
    width: 480,
    height: 104,
    palette: PALETTE.SERVER,
    title: 'Reranking Ibrido (ai.interactions.create)',
    subtitle: 'gemini-2.5-flash-lite, store: false + BudgetConfig/SafetyPolicy'
  }),
  makeNode({
    key: 'F6C_RENDER_ROLE_RESULTS',
    mmdId: 'RENDER_ROLE_RESULTS',
    flow: 'FLOW-6C',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: F6C_X_MID,
    y: 10400,
    width: 480,
    height: 96,
    palette: PALETTE.CLIENT,
    title: 'Rendering Risultati Filtrati per Ruolo (4 Stati UI)',
    subtitle: 'Empty, Loading, Populated, Error/Fallback'
  }),
  makeNode({
    key: 'F6C_END_FLOW',
    mmdId: 'END_FLOW',
    flow: 'FLOW-6C',
    lane: 'LANE_DB',
    shape: 'round_rectangle',
    x: F6C_X_MID,
    y: 10570,
    width: 480,
    height: 76,
    palette: PALETTE.START_END_T3,
    fontSize: '13',
    title: 'Fine: Hub Preferiti Enterprise Sincronizzato',
    subtitle: 'Segreto Medico Garantito (GDPR Art. 9) | Bunker Silo 2 KMS + RLS'
  })
];

const T3_CONNECTORS = [
  { id: 'F6C_C01', flow: 'FLOW-6C', start: 'F6C_START', end: 'F6C_DEC_SCOPE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6C_C02', flow: 'FLOW-6C', start: 'F6C_DEC_SCOPE', end: 'F6C_UI_TREE_SEARCH', startSnap: 'left', endSnap: 'right', label: 'Personali & Ricerca Ibrida' },
  { id: 'F6C_C03', flow: 'FLOW-6C', start: 'F6C_UI_TREE_SEARCH', end: 'F6C_NAV_CARD_ALLINONE', startSnap: 'bottom', endSnap: 'left', label: '' },
  { id: 'F6C_C04', flow: 'FLOW-6C', start: 'F6C_DEC_SCOPE', end: 'F6C_UI_TEAM_PIN', startSnap: 'right', endSnap: 'left', label: 'Team/Staff & Pinning' },
  { id: 'F6C_C05', flow: 'FLOW-6C', start: 'F6C_UI_TEAM_PIN', end: 'F6C_NAV_CARD_ALLINONE', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'F6C_C06', flow: 'FLOW-6C', start: 'F6C_NAV_CARD_ALLINONE', end: 'F6C_GW_MTLS_API', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6C_C07', flow: 'FLOW-6C', start: 'F6C_GW_MTLS_API', end: 'F6C_DEC_GDPR_MED', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6C_C08', flow: 'FLOW-6C', start: 'F6C_DEC_GDPR_MED', end: 'F6C_GW_SILENT_MASK', startSnap: 'right', endSnap: 'left', label: 'No (Non Medico)', strokeColor: '#dc2626' },
  { id: 'F6C_C09', flow: 'FLOW-6C', start: 'F6C_GW_SILENT_MASK', end: 'F6C_GW_ROUTE_SECURE', startSnap: 'bottom', endSnap: 'right', label: '', strokeColor: '#dc2626' },
  { id: 'F6C_C10', flow: 'FLOW-6C', start: 'F6C_DEC_GDPR_MED', end: 'F6C_GW_ROUTE_SECURE', startSnap: 'bottom', endSnap: 'top', label: 'Si (Medico o Non Clinico)', strokeColor: '#059669' },
  { id: 'F6C_C11', flow: 'FLOW-6C', start: 'F6C_GW_ROUTE_SECURE', end: 'F6C_SRV_TREE_PIN', startSnap: 'left', endSnap: 'top', label: 'Albero & Pin' },
  { id: 'F6C_C12', flow: 'FLOW-6C', start: 'F6C_GW_ROUTE_SECURE', end: 'F6C_SRV_FULLTEXT', startSnap: 'bottom', endSnap: 'top', label: 'Full-Text' },
  { id: 'F6C_C13', flow: 'FLOW-6C', start: 'F6C_GW_ROUTE_SECURE', end: 'F6C_SRV_SEMANTIC_EMBED', startSnap: 'bottom', endSnap: 'top', label: 'AI Semantica' },
  { id: 'F6C_C14', flow: 'FLOW-6C', start: 'F6C_SRV_TREE_PIN', end: 'F6C_DB_FAV_TREES', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6C_C15', flow: 'FLOW-6C', start: 'F6C_SRV_TREE_PIN', end: 'F6C_DB_FAV_ITEMS', startSnap: 'right', endSnap: 'left', label: 'Pin Items' },
  { id: 'F6C_C16', flow: 'FLOW-6C', start: 'F6C_SRV_FULLTEXT', end: 'F6C_DB_FAV_ITEMS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6C_C17', flow: 'FLOW-6C', start: 'F6C_SRV_SEMANTIC_EMBED', end: 'F6C_DB_FAV_EMBED', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6C_C18', flow: 'FLOW-6C', start: 'F6C_DB_FAV_ITEMS', end: 'F6C_SRV_RERANK_GUARD', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6C_C19', flow: 'FLOW-6C', start: 'F6C_DB_FAV_EMBED', end: 'F6C_SRV_RERANK_GUARD', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'F6C_C20', flow: 'FLOW-6C', start: 'F6C_DB_FAV_TREES', end: 'F6C_RENDER_ROLE_RESULTS', startSnap: 'bottom', endSnap: 'left', label: '' },
  { id: 'F6C_C21', flow: 'FLOW-6C', start: 'F6C_SRV_RERANK_GUARD', end: 'F6C_RENDER_ROLE_RESULTS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'F6C_C22', flow: 'FLOW-6C', start: 'F6C_RENDER_ROLE_RESULTS', end: 'F6C_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' }
];

const FLOW_DEFINITIONS = Object.freeze([
  { flow: 'FLOW-6A', badge: PROTECTED_BADGES['FLOW-6A'], nodes: T1_NODES, connectors: T1_CONNECTORS },
  { flow: 'FLOW-6B', badge: PROTECTED_BADGES['FLOW-6B'], nodes: T2_NODES, connectors: T2_CONNECTORS },
  { flow: 'FLOW-6C', badge: PROTECTED_BADGES['FLOW-6C'], nodes: T3_NODES, connectors: T3_CONNECTORS }
]);

// ============================================================================
// VALIDATORE GEOMETRICO E REGOLA 10 INTEGRATO
// ============================================================================

/**
 * Converte un rettangolo centrato in bounding box axis-aligned {minX, maxX, minY, maxY}.
 * @param {{x: number, y: number, width: number, height: number}} item - Shape centrata.
 * @param {number} expandPx - Espansione opzionale su tutti i 4 lati (es. 40px per No-Fly Zone).
 * @returns {{minX: number, maxX: number, minY: number, maxY: number}} Bounding box.
 */
function toBoundingBox(item, expandPx = 0) {
  const halfW = item.width / 2 + expandPx;
  const halfH = item.height / 2 + expandPx;
  return {
    minX: item.x - halfW,
    maxX: item.x + halfW,
    minY: item.y - halfH,
    maxY: item.y + halfH
  };
}

/**
 * Calcola le coordinate assolute del punto di ancoraggio su una shape dato lo snap.
 * @param {object} node - Definizione nodo con x, y, width, height.
 * @param {string} snap - Lato di aggancio ('top', 'bottom', 'left', 'right').
 * @returns {{x: number, y: number}} Coordinate assolute del punto di aggancio.
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
      throw new Error(`Snap non riconosciuto: ${snap}`);
  }
}

/**
 * Scompone un connettore ortogonale 'elbowed' nei segmenti a 90 gradi effettivi (retta, L-bend o Z-bend).
 * @param {object} startNode - Nodo sorgente.
 * @param {object} endNode - Nodo destinazione.
 * @param {string} startSnap - Lato di uscita ('top'|'bottom'|'left'|'right').
 * @param {string} endSnap - Lato di ingresso ('top'|'bottom'|'left'|'right').
 * @returns {Array<{p1: {x: number, y: number}, p2: {x: number, y: number}}>} Segmenti ortogonali.
 */
function buildElbowedSegments(startNode, endNode, startSnap, endSnap) {
  const pStart = getSnapPoint(startNode, startSnap);
  const pEnd = getSnapPoint(endNode, endSnap);

  if (Math.abs(pStart.x - pEnd.x) < AXIS_EPSILON_PX || Math.abs(pStart.y - pEnd.y) < AXIS_EPSILON_PX) {
    return [{ p1: pStart, p2: pEnd }];
  }

  const startIsVertical = startSnap === 'top' || startSnap === 'bottom';
  const endIsVertical = endSnap === 'top' || endSnap === 'bottom';

  // Connettore a L a 90 gradi (uno snap verticale e uno orizzontale)
  if (startIsVertical && !endIsVertical) {
    const elbow = { x: pStart.x, y: pEnd.y };
    return [
      { p1: pStart, p2: elbow },
      { p1: elbow, p2: pEnd }
    ];
  }
  if (!startIsVertical && endIsVertical) {
    const elbow = { x: pEnd.x, y: pStart.y };
    return [
      { p1: pStart, p2: elbow },
      { p1: elbow, p2: pEnd }
    ];
  }

  // Connettore a Z ortogonale (entrambi verticali o entrambi orizzontali)
  if (startIsVertical && endIsVertical) {
    const midY = (pStart.y + pEnd.y) / 2;
    const m1 = { x: pStart.x, y: midY };
    const m2 = { x: pEnd.x, y: midY };
    return [
      { p1: pStart, p2: m1 },
      { p1: m1, p2: m2 },
      { p1: m2, p2: pEnd }
    ];
  }

  const midX = (pStart.x + pEnd.x) / 2;
  const m1 = { x: midX, y: pStart.y };
  const m2 = { x: midX, y: pEnd.y };
  return [
    { p1: pStart, p2: m1 },
    { p1: m1, p2: m2 },
    { p1: m2, p2: pEnd }
  ];
}

/**
 * Verifica se due bounding box si sovrappongono con margine opzionale.
 * @param {object} boxA - Prima bounding box.
 * @param {object} boxB - Seconda bounding box.
 * @returns {boolean} True se esiste sovrapposizione non nulla.
 */
function boxesOverlap(boxA, boxB) {
  return (
    boxA.minX < boxB.maxX &&
    boxA.maxX > boxB.minX &&
    boxA.minY < boxB.maxY &&
    boxA.maxY > boxB.minY
  );
}

/**
 * Calcola la distanza perimetrale Chebyshev (minimo margine di rispetto su tutti e 4 i lati) tra due box.
 * @param {object} boxA - Prima bounding box.
 * @param {object} boxB - Seconda bounding box.
 * @returns {number} Clearance in pixel (<= 0 indica sovrapposizione).
 */
function computeBoxClearance(boxA, boxB) {
  const dx = Math.max(0, boxA.minX - boxB.maxX, boxB.minX - boxA.maxX);
  const dy = Math.max(0, boxA.minY - boxB.maxY, boxB.minY - boxA.maxY);
  if (dx === 0 && dy === 0) {
    return 0;
  }
  return Math.max(dx, dy);
}

/**
 * Verifica se un segmento ortogonale interseca una bounding box (con margine conservativo).
 * @param {{x: number, y: number}} p1 - Primo estremo segmento.
 * @param {{x: number, y: number}} p2 - Secondo estremo segmento.
 * @param {object} box - Bounding box ostacolo.
 * @param {number} expandPx - Espansione conservativa dell'ostacolo in pixel.
 * @returns {boolean} True se il segmento attraversa o sfiora l'ostacolo.
 */
function segmentIntersectsBox(p1, p2, box, expandPx = OBSTACLE_SAFETY_MARGIN_PX) {
  const bMinX = box.minX - expandPx;
  const bMaxX = box.maxX + expandPx;
  const bMinY = box.minY - expandPx;
  const bMaxY = box.maxY + expandPx;

  if (Math.abs(p1.x - p2.x) < AXIS_EPSILON_PX) {
    const segX = p1.x;
    const segMinY = Math.min(p1.y, p2.y);
    const segMaxY = Math.max(p1.y, p2.y);
    return segX > bMinX && segX < bMaxX && Math.max(segMinY, bMinY) < Math.min(segMaxY, bMaxY);
  }

  if (Math.abs(p1.y - p2.y) < AXIS_EPSILON_PX) {
    const segY = p1.y;
    const segMinX = Math.min(p1.x, p2.x);
    const segMaxX = Math.max(p1.x, p2.x);
    return segY > bMinY && segY < bMaxY && Math.max(segMinX, bMinX) < Math.min(segMaxX, bMaxX);
  }

  // Fallback conservativo per qualsiasi segmento non perfettamente assiale
  const segBox = {
    minX: Math.min(p1.x, p2.x),
    maxX: Math.max(p1.x, p2.x),
    minY: Math.min(p1.y, p2.y),
    maxY: Math.max(p1.y, p2.y)
  };
  return boxesOverlap(segBox, { minX: bMinX, maxX: bMaxX, minY: bMinY, maxY: bMaxY });
}

/**
 * Esegue la validazione geometrica e normativa Regola 10 su tutti e 3 i diagrammi Colonna 6.
 * Verifica: conteggi ISO (14/16/18=48), dimensioni rettangoli e rombi, 0 overlap tra nodi,
 * 0 line-box crossings (inclusi i Badge + No-Fly Zone 40px), spaziature e confini di Colonna 6.
 * @returns {object} Riepilogo completo della validazione con metriche e lista errori.
 */
function runFullLocalValidation() {
  const errors = [];
  const badgeClearances = {};
  const nodeCounts = {};
  let totalCrossings = 0;
  let totalOverlaps = 0;
  let totalNoFlyViolations = 0;

  const allBadges = Object.values(PROTECTED_BADGES);

  for (const def of FLOW_DEFINITIONS) {
    const { flow, badge, nodes, connectors } = def;
    const expectedCount = EXPECTED_ISO_COUNTS[flow];
    const zone = DELETION_ZONES[flow];

    nodeCounts[flow] = nodes.length;
    nodeCounts[badge.badge] = nodes.length;

    if (nodes.length !== expectedCount) {
      errors.push(`[${flow}] Conteggio nodi ISO errato: ${nodes.length} (atteso ${expectedCount})`);
    }

    const nodeMap = new Map();
    const boxMap = new Map();

    // 1. Verifica dimensioni Regola 10, assenza emoji e confini Colonna 6
    for (const node of nodes) {
      nodeMap.set(node.key, node);
      const box = toBoundingBox(node, 0);
      boxMap.set(node.key, box);

      if (node.shape === 'rhombus') {
        if (node.width < MIN_DIAMOND_WIDTH_PX || node.height < MIN_DIAMOND_HEIGHT_PX) {
          errors.push(
            `[${flow}] Rombo ${node.key} fuori soglia Regola 10: ${node.width}x${node.height}px (min ${MIN_DIAMOND_WIDTH_PX}x${MIN_DIAMOND_HEIGHT_PX}px)`
          );
        }
      } else if (node.shape === 'rectangle' || node.shape === 'round_rectangle') {
        if (node.width < MIN_RECT_WIDTH_PX || node.width > MAX_RECT_WIDTH_PX) {
          errors.push(
            `[${flow}] Rettangolo ${node.key} fuori larghezza Regola 10: W=${node.width}px (atteso ${MIN_RECT_WIDTH_PX}..${MAX_RECT_WIDTH_PX}px)`
          );
        }
      }

      if (box.minX < zone.minX || box.maxX > zone.maxX || box.minY < zone.minY || box.maxY > zone.maxY) {
        errors.push(
          `[${flow}] Nodo ${node.key} fuori perimetro Colonna 6 (${zone.minX}..${zone.maxX}, ${zone.minY}..${zone.maxY})`
        );
      }
    }

    // 2. Verifica 0 sovrapposizioni tra nodi
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const boxA = boxMap.get(nodes[i].key);
        const boxB = boxMap.get(nodes[j].key);
        if (boxesOverlap(boxA, boxB)) {
          totalOverlaps++;
          errors.push(`[${flow}] Overlap tra nodi ${nodes[i].key} e ${nodes[j].key}`);
        }
      }
    }

    // 3. Verifica No-Fly Zone >= 40px intorno ai Badge (nodi + connettori)
    const ownBadgeBox = toBoundingBox(badge, 0);
    let minClearancePx = Infinity;

    for (const node of nodes) {
      const nodeBox = boxMap.get(node.key);
      const clearance = computeBoxClearance(nodeBox, ownBadgeBox);
      if (clearance < minClearancePx) {
        minClearancePx = clearance;
      }
      for (const anyBadge of allBadges) {
        const nfBox = toBoundingBox(anyBadge, MIN_BADGE_CLEARANCE_PX);
        if (boxesOverlap(nodeBox, nfBox)) {
          totalNoFlyViolations++;
          errors.push(`[${flow}] Nodo ${node.key} invade la No-Fly Zone (40px) del Badge ${anyBadge.badge}`);
        }
      }
    }

    // 4. Verifica connettori: elbowed, horizontal, spaziatura consecutiva, 0 line-box crossings e 0 No-Fly crossings
    for (const conn of connectors) {
      const startNode = nodeMap.get(conn.start);
      const endNode = nodeMap.get(conn.end);
      if (!startNode || !endNode) {
        errors.push(`[${flow}] Connettore ${conn.id} punta a nodo inesistente (${conn.start} -> ${conn.end})`);
        continue;
      }

      // Spaziatura consecutiva minima tra blocchi collegati
      const pairGap = computeBoxClearance(boxMap.get(conn.start), boxMap.get(conn.end));
      if (pairGap < MIN_CONSECUTIVE_GAP_PX) {
        errors.push(
          `[${flow}] Spaziatura insufficiente tra ${conn.start} e ${conn.end}: ${pairGap.toFixed(1)}px (min ${MIN_CONSECUTIVE_GAP_PX}px)`
        );
      }

      const segments = buildElbowedSegments(startNode, endNode, conn.startSnap, conn.endSnap);

      // Controllo incroci con tutti gli altri nodi
      for (const [otherKey, otherBox] of boxMap.entries()) {
        if (otherKey === conn.start || otherKey === conn.end) continue;
        for (const seg of segments) {
          if (segmentIntersectsBox(seg.p1, seg.p2, otherBox, OBSTACLE_SAFETY_MARGIN_PX)) {
            totalCrossings++;
            errors.push(`[${flow}] Line-box crossing: ${conn.start} -> ${conn.end} attraversa nodo ${otherKey}`);
          }
        }
      }

      // Controllo incroci e clearance con i Badge (+ No-Fly Zone 40px)
      for (const seg of segments) {
        const segBox = {
          minX: Math.min(seg.p1.x, seg.p2.x),
          maxX: Math.max(seg.p1.x, seg.p2.x),
          minY: Math.min(seg.p1.y, seg.p2.y),
          maxY: Math.max(seg.p1.y, seg.p2.y)
        };
        const segClearance = computeBoxClearance(segBox, ownBadgeBox);
        if (segClearance < minClearancePx) {
          minClearancePx = segClearance;
        }
        for (const anyBadge of allBadges) {
          const badgeBox = toBoundingBox(anyBadge, 0);
          if (segmentIntersectsBox(seg.p1, seg.p2, badgeBox, MIN_BADGE_CLEARANCE_PX)) {
            totalCrossings++;
            totalNoFlyViolations++;
            errors.push(
              `[${flow}] Connettore ${conn.start} -> ${conn.end} viola la No-Fly Zone (40px) del Badge ${anyBadge.badge}`
            );
          }
        }
      }
    }

    const roundedClearance = Number(minClearancePx.toFixed(2));
    badgeClearances[badge.badge] = roundedClearance;
    badgeClearances[flow] = roundedClearance;

    if (roundedClearance < MIN_BADGE_CLEARANCE_PX) {
      errors.push(
        `[${flow}] Clearance minima Badge ${badge.badge} = ${roundedClearance}px (< ${MIN_BADGE_CLEARANCE_PX}px)`
      );
    }
  }

  const totalNodes = T1_NODES.length + T2_NODES.length + T3_NODES.length;
  if (totalNodes !== EXPECTED_ISO_COUNTS.TOTAL) {
    errors.push(`Conteggio totale nodi ISO errato: ${totalNodes} (atteso ${EXPECTED_ISO_COUNTS.TOTAL})`);
  }

  return {
    passed: errors.length === 0,
    crossings: totalCrossings,
    overlaps: totalOverlaps,
    noFlyViolations: totalNoFlyViolations,
    totalNodes,
    totalConnectors: T1_CONNECTORS.length + T2_CONNECTORS.length + T3_CONNECTORS.length,
    nodeCounts,
    badgeClearances,
    errors
  };
}

/**
 * Individua dinamicamente sulla board live il Title Banner del Flowchart #18.
 * @param {Array<object>} boardShapes - Tutte le shape restituite da Miro REST v2.
 * @returns {object|null} Shape del Title Banner #18 oppure null se non trovato.
 */
function detectBanner18(boardShapes) {
  return (
    boardShapes.find((s) => {
      if (!s || !s.position || !s.geometry) return false;
      if (PROTECTED_BADGE_IDS.has(s.id)) return false;
      return (
        s.geometry.width >= BANNER_18_SEARCH_BOUNDS.minWidth &&
        s.geometry.height <= BANNER_18_SEARCH_BOUNDS.maxHeight &&
        Math.abs(s.position.x - BANNER_18_SEARCH_BOUNDS.centerX) < BANNER_18_SEARCH_BOUNDS.maxDeltaX &&
        s.position.y > BANNER_18_SEARCH_BOUNDS.minY &&
        s.position.y < BANNER_18_SEARCH_BOUNDS.maxY
      );
    }) || null
  );
}

/**
 * Verifica se una shape appartiene ai perimetri operativi di Colonna 6 candidati a sostituzione.
 * @param {object} shape - Shape Miro con position {x, y}.
 * @returns {boolean} True se la shape ricade in uno dei 3 perimetri operativi Colonna 6.
 */
function isInCol6OperationalZone(shape) {
  if (!shape || !shape.position) return false;
  const { x, y } = shape.position;
  // Protezione assoluta di Colonne 1-5 (maxX <= 7550)
  if (x <= COL_1_5_SAFETY_X_LIMIT) return false;

  return Object.values(DELETION_ZONES).some(
    (z) => x >= z.minX && x <= z.maxX && y >= z.minY && y <= z.maxY
  );
}

/**
 * Costruisce il payload JSON completo per scratch/deploy_col6_report.json conforme a Gate 4 Red-Team (Check 6).
 * @param {object} validation - Risultato del validatore geometrico locale.
 * @param {object} deployStats - Metriche e mappe ID del deployment live.
 * @returns {object} Oggetto report pronto per serializzazione JSON.
 */
function buildPostDeployReport(validation, deployStats) {
  const allNodes = [...T1_NODES, ...T2_NODES, ...T3_NODES];
  const allConnectors = [...T1_CONNECTORS, ...T2_CONNECTORS, ...T3_CONNECTORS];

  const shapesSnapshot = allNodes.map((n) => ({
    id: deployStats.keyToMiroId[n.key] || n.key,
    key: n.key,
    mmdId: n.mmdId,
    flow: n.flow,
    lane: n.lane,
    // Normalizzato a 'diamond' per i rombi decisionali come atteso da Check 6 (redteam_favorites_verify.py)
    shape: n.shape === 'rhombus' ? 'diamond' : n.shape,
    miroShape: n.shape,
    x: n.x,
    y: n.y,
    width: n.width,
    height: n.height
  }));

  const connectorsSnapshot = allConnectors.map((c) => ({
    id: deployStats.connKeyToMiroId[c.id] || c.id,
    key: c.id,
    flow: c.flow,
    start: deployStats.keyToMiroId[c.start] || c.start,
    end: deployStats.keyToMiroId[c.end] || c.end,
    startKey: c.start,
    endKey: c.end,
    startSnap: c.startSnap,
    endSnap: c.endSnap,
    shape: 'elbowed',
    textOrientation: 'horizontal',
    label: c.label
  }));

  return {
    timestamp: new Date().toISOString(),
    boardId: BOARD_ID,
    column: 'COL-6-PREFERITI',
    mode: deployStats.mode,
    crossings: validation.crossings,
    line_box_crossings: validation.crossings,
    overlaps: validation.overlaps,
    no_fly_zone_violations: validation.noFlyViolations,
    badge_clearances: validation.badgeClearances,
    node_counts: validation.nodeCounts,
    shapes: shapesSnapshot,
    connectors: connectorsSnapshot,
    protected_badges: deployStats.protectedBadgesStatus,
    title_banners_patched: deployStats.patchedBanners,
    summary: {
      deletedShapes: deployStats.deletedShapes,
      deletedConnectors: deployStats.deletedConnectors,
      patchedBanners: Object.keys(deployStats.patchedBanners).length,
      createdIsoNodes: Object.keys(deployStats.keyToMiroId).length,
      createdConnectors: Object.keys(deployStats.connKeyToMiroId).length,
      protectedBadgesPreserved: Array.from(PROTECTED_BADGE_IDS)
    },
    nodeMap: deployStats.keyToMiroId
  };
}

// ============================================================================
// PIPELINE PRINCIPALE DI VALIDAZIONE E DEPLOYMENT
// ============================================================================

/**
 * Entrypoint CLI: esegue validazione locale Regola 10 e, se richiesto, --dry-run o deploy live su Miro.
 * @returns {Promise<void>}
 */
async function main() {
  const isValidateOnly = process.argv.includes('--validate-only');
  const isDryRun = process.argv.includes('--dry-run');
  const modeLabel = isValidateOnly ? 'VALIDATE-ONLY' : isDryRun ? 'DRY-RUN' : 'LIVE';

  console.log('======================================================================');
  console.log(`DEPLOY COLONNA 6 - PREFERITI (3 TIERS ISO 5807) [MODALITA: ${modeLabel}]`);
  console.log(`Board ID: ${BOARD_ID}`);
  console.log('======================================================================\n');

  // STEP 0: Validazione Geometrica & Regola 10 locale (eseguita sempre in ogni modalita)
  console.log('[STEP 0/6] Validazione geometrica Regola 10 (Zero-Crossing, No-Fly Zone 40px, Dimensioni)...');
  const validation = runFullLocalValidation();

  console.log(
    `-> Nodi ISO: FLOW-6A=${validation.nodeCounts['FLOW-6A']}, FLOW-6B=${validation.nodeCounts['FLOW-6B']}, FLOW-6C=${validation.nodeCounts['FLOW-6C']} (Totale=${validation.totalNodes})`
  );
  console.log(`-> Connettori ortogonali ('elbowed' + 'horizontal'): ${validation.totalConnectors}`);
  console.log(`-> Line-box crossings: ${validation.crossings}`);
  console.log(`-> Node overlaps: ${validation.overlaps}`);
  console.log(`-> No-Fly Zone (40px) violations: ${validation.noFlyViolations}`);
  console.log(
    `-> Badge clearances: #06=${validation.badgeClearances['#06']}px, #12=${validation.badgeClearances['#12']}px, #18=${validation.badgeClearances['#18']}px`
  );

  if (!validation.passed) {
    console.error('\nERRORE BLOCCANTE VALIDAZIONE GEOMETRICA REGOLA 10:');
    for (const err of validation.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }
  console.log('CERTIFICAZIONE LOCALE PASS: 0 crossings, 0 overlaps, 0 No-Fly violations, 48 nodi ISO.\n');

  if (isValidateOnly) {
    console.log('[VALIDATE-ONLY] Tutte le verifiche locali Regola 10 superate con successo.');
    return;
  }

  // Autenticazione obbligatoria esclusivamente via process.env.MIRO_ACCESS_TOKEN
  const accessToken = requireMiroAccessToken();

  // STEP 1: Lettura inventario live Miro
  console.log('[STEP 1/6] Recupero inventario live da Miro REST API v2...');
  const boardShapes = await fetchAllBoardShapes(accessToken);
  const boardConnectors = await fetchAllBoardConnectors(accessToken);
  console.log(`-> Shapes totali rilevate: ${boardShapes.length}`);
  console.log(`-> Connettori totali rilevati: ${boardConnectors.length}\n`);

  // STEP 2: Rilevamento Banner #18 e isolamento chirurgico Colonna 6
  console.log('[STEP 2/6] Rilevamento Title Banner #18 e isolamento chirurgico Colonna 6...');
  const banner18Shape = detectBanner18(boardShapes);
  if (!banner18Shape) {
    console.error(
      'ERRORE BLOCCANTE: Title Banner #18 non rilevato nei confini attesi (W>=1200, H<=100, |x-9225.38|<250, 8270<y<8450).'
    );
    process.exit(1);
  }
  console.log(
    `-> Title Banner #18 rilevato dinamicamente: ID=${banner18Shape.id} (X=${banner18Shape.position.x.toFixed(2)}, Y=${banner18Shape.position.y.toFixed(2)})`
  );

  const bannerTargets = {
    'FLOW-6A': { id: KNOWN_TITLE_BANNERS['FLOW-6A'].id, html: KNOWN_TITLE_BANNERS['FLOW-6A'].htmlContent },
    'FLOW-6B': { id: KNOWN_TITLE_BANNERS['FLOW-6B'].id, html: KNOWN_TITLE_BANNERS['FLOW-6B'].htmlContent },
    'FLOW-6C': { id: banner18Shape.id, html: KNOWN_TITLE_BANNERS['FLOW-6C'].htmlContent }
  };

  const protectedHeaderIds = new Set(Object.values(bannerTargets).map((b) => b.id));

  // Controllo integrita preventiva dei 3 Badge protetti
  for (const badge of Object.values(PROTECTED_BADGES)) {
    const found = boardShapes.some((s) => s.id === badge.id);
    if (!found) {
      console.error(`ERRORE BLOCCANTE: Badge protetto ${badge.badge} (${badge.id}) non trovato sulla board live.`);
      process.exit(1);
    }
  }

  const col6Shapes = boardShapes.filter((s) => isInCol6OperationalZone(s));
  const shapesToDelete = col6Shapes.filter((s) => {
    if (PROTECTED_BADGE_IDS.has(s.id)) return false;
    if (protectedHeaderIds.has(s.id)) return false;
    return true;
  });

  const deleteShapeIds = new Set(shapesToDelete.map((s) => s.id));
  const connectorsToDelete = boardConnectors.filter(
    (c) => deleteShapeIds.has(c.startItem?.id) || deleteShapeIds.has(c.endItem?.id)
  );

  console.log(`-> Badge protetti confermati integri: ${PROTECTED_BADGE_IDS.size} (ZERO modifiche)`);
  console.log(`-> Title Banners protetti per PATCH in-place: ${protectedHeaderIds.size}`);
  console.log(`-> Vecchie shape operative Colonna 6 da rimuovere: ${shapesToDelete.length}`);
  console.log(`-> Vecchi connettori Colonna 6 da rimuovere: ${connectorsToDelete.length}\n`);

  if (isDryRun) {
    console.log('[DRY-RUN] Nessuna scrittura eseguita sulla board live.');
    console.log(`[DRY-RUN] Rimozione prevista: ${connectorsToDelete.length} connettori, ${shapesToDelete.length} shape.`);
    console.log('[DRY-RUN] PATCH prevista sui 3 Title Banner (#06, #12, #18).');
    console.log(`[DRY-RUN] Creazione prevista: ${validation.totalNodes} nodi ISO, ${validation.totalConnectors} connettori elbowed.`);
    console.log('DRY-RUN COMPLETATO CON SUCCESSO.');
    return;
  }

  // STEP 3: Eliminazione selettiva connettori e shape operative Colonna 6
  console.log('[STEP 3/6] Eliminazione chirurgica vecchi connettori e shape operative Colonna 6...');
  for (const conn of connectorsToDelete) {
    await miroApi(accessToken, `/connectors/${conn.id}`, 'DELETE');
    await delay(DELAY_DELETE_MS);
  }
  console.log(`-> Eliminati ${connectorsToDelete.length} vecchi connettori Colonna 6.`);

  for (const shape of shapesToDelete) {
    await miroApi(accessToken, `/shapes/${shape.id}`, 'DELETE');
    await delay(DELAY_DELETE_MS);
  }
  console.log(`-> Eliminate ${shapesToDelete.length} vecchie shape operative Colonna 6.\n`);

  // STEP 4: PATCH in-place dei 3 Title Banner
  console.log('[STEP 4/6] Aggiornamento in-place (PATCH) dei 3 Title Banner...');
  const patchedBanners = {};
  for (const [flowCode, target] of Object.entries(bannerTargets)) {
    await patchTitleBanner(accessToken, target.id, target.html);
    patchedBanners[flowCode] = target.id;
    console.log(`-> Banner ${flowCode} (${target.id}) aggiornato in-place.`);
  }
  console.log('');

  // STEP 5: Creazione dei 48 nodi ISO 5807
  console.log('[STEP 5/6] Creazione dei 48 nuovi nodi ISO 5807 su Colonna 6...');
  const keyToMiroId = {};
  for (const def of FLOW_DEFINITIONS) {
    console.log(`--- Creazione ${def.flow} (${def.nodes.length} nodi ISO) ---`);
    for (const node of def.nodes) {
      const res = await createIsoNode(accessToken, node);
      if (!res || !res.id) {
        throw new Error(`Creazione nodo fallita per ${node.key}`);
      }
      keyToMiroId[node.key] = res.id;
    }
  }
  console.log(`-> Totale nuovi nodi ISO creati: ${Object.keys(keyToMiroId).length}/${validation.totalNodes}\n`);

  // STEP 6: Creazione connettori ortogonali ('elbowed', 'horizontal')
  console.log('[STEP 6/6] Creazione connettori ortogonali a 90 gradi...');
  const connKeyToMiroId = {};
  const allConnectors = [...T1_CONNECTORS, ...T2_CONNECTORS, ...T3_CONNECTORS];
  for (const conn of allConnectors) {
    const startMiroId = keyToMiroId[conn.start];
    const endMiroId = keyToMiroId[conn.end];
    if (!startMiroId || !endMiroId) {
      throw new Error(`Impossibile risolvere gli ID Miro per il connettore ${conn.id}`);
    }
    const res = await createIsoConnector(accessToken, startMiroId, endMiroId, conn);
    if (!res || !res.id) {
      throw new Error(`Creazione connettore fallita per ${conn.id}`);
    }
    connKeyToMiroId[conn.id] = res.id;
  }
  console.log(`-> Totale connettori creati: ${Object.keys(connKeyToMiroId).length}/${allConnectors.length}\n`);

  // VERIFICA FINALE LIVE SU BOARD MIRO
  console.log('[VERIFICA FINALE LIVE] Controllo integrita post-deploy su board Miro...');
  const finalShapes = await fetchAllBoardShapes(accessToken);
  const finalShapeIds = new Set(finalShapes.map((s) => s.id));

  const protectedBadgesStatus = {};
  for (const [flowCode, badge] of Object.entries(PROTECTED_BADGES)) {
    const present = finalShapeIds.has(badge.id);
    protectedBadgesStatus[badge.badge] = { id: badge.id, flow: flowCode, preserved: present };
    console.log(`-> Badge ${badge.badge} (${badge.id}): ${present ? 'OK PRESENTE' : 'ERRORE MANCANTE'}`);
    if (!present) {
      throw new Error(`Badge protetto ${badge.badge} (${badge.id}) mancante dopo il deploy.`);
    }
  }

  for (const [key, id] of Object.entries(keyToMiroId)) {
    if (!finalShapeIds.has(id)) {
      throw new Error(`Nodo ISO appena creato ${key} (${id}) non trovato nella verifica finale.`);
    }
  }
  console.log(`[OK] Tutti i ${Object.keys(keyToMiroId).length} nodi ISO certificati sulla board live.`);

  // Salvataggio report completo per Gate 4 Red-Team (tools/redteam_favorites_verify.py Check 6)
  const report = buildPostDeployReport(validation, {
    mode: 'live',
    deletedShapes: shapesToDelete.length,
    deletedConnectors: connectorsToDelete.length,
    patchedBanners,
    protectedBadgesStatus,
    keyToMiroId,
    connKeyToMiroId
  });

  const reportFullPath = path.resolve(REPORT_RELATIVE_PATH);
  const reportDir = path.dirname(reportFullPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportFullPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nReport post-deploy salvato in ${REPORT_RELATIVE_PATH}`);
  console.log('DEPLOYMENT COLONNA 6 (PREFERITI) COMPLETATO CON SUCCESSO.');
}

main().catch((err) => {
  console.error('FATAL ERROR:', err.message || err);
  process.exit(1);
});
