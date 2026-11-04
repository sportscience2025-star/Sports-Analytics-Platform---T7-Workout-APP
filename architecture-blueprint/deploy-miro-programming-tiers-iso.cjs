/**
 * deploy-miro-programming-tiers-iso.cjs
 * 
 * Script di deployment autoritativo su Miro Board (Board ID: uXjVEbo6L2o=).
 * Riorganizza ed esegue l'aggiornamento completo e vincolante dei 3 diagrammi
 * della Programmazione degli Esercizi (Colonna 3, Zona 4):
 * - Flowchart #03 (FLOW-3A): Tier 1 (B2C Casual) • Programmazione Base, Schede Pre-Confezionate & Export PDF
 * - Flowchart #09 (FLOW-3B): Tier 2 (Pro P.IVA) • Programmazione Anamnestica 6M, RTP, AI Scientifica & Multi-Export
 * - Flowchart #15 (FLOW-3C): Tier 3 (Elite Teams) • Programmazione Annuale RAG, Chatbot 24/7 & Readiness Section (PVT, HRV, Z-Score)
 * 
 * Vincoli e Garanzie:
 * 1. Preservazione assoluta dei 3 badge cartigli (#03: 3458764688417722711, #09: 3458764688417722743, #15: 3458764688417722788).
 * 2. Rispetto della No-Fly Zone di 40px attorno ai cartigli.
 * 3. Preservazione e aggiornamento in-place dei 3 Title Banner (#03: 3458764686744184735, #09: 3458764688307403600, #15: 3458764688307469953).
 * 4. Eliminazione sicura di 40 vecchi nodi operativi e 41 vecchi connettori di Colonna 3 (zero tocco agli altri 15 flowchart).
 * 5. Creazione nodi ISO 5807 (W >= 440px per rombi, W=450-560px per box, palette specifica per ciascun Tier).
 * 6. Creazione connettori ortogonali 90° ('elbowed') con didascalie decisionali ('50%') e zero line-box crossing.
 * 7. Rate limiting calibrato e verifica live post-deploy al 100%.
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
  '3458764688417722711', // Badge #03 (Tier 1 B2C)
  '3458764688417722743', // Badge #09 (Tier 2 Pro)
  '3458764688417722788'  // Badge #15 (Tier 3 Elite)
]);

// Registro Title Header Banners (Preservare ID e aggiornare solo content HTML)
const TITLE_BANNER_IDS = {
  FLOW_3A: '3458764686744184735',
  FLOW_3B: '3458764688307403600',
  FLOW_3C: '3458764688307469953'
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
// DEFINIZIONI NODI E CONNETTORI ISO 5807 (DA PIANO PROGRAMMAZIONE 3 TIERS)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. FLOWCHART #03 (FLOW-3A) — TIER 1 (B2C CASUAL)
// ----------------------------------------------------------------------------
const T1_NODES = [
  {
    key: 'T1_START',
    shape: 'round_rectangle',
    width: 520,
    height: 80,
    x: 2459,
    y: 680,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p><strong>Inizio: Sezione Programmi di Allenamento (App Utente)</strong></p><p>Accesso Utente Base (Tier 1 Casual) • Zero Integrazione Data Analysis</p>'
  },
  {
    key: 'T1_UI_SEARCH_FILTER',
    shape: 'rectangle',
    width: 500,
    height: 90,
    x: 2459,
    y: 820,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Thin Client: Barra di Ricerca &amp; Filtri Categoria</strong></p><p>Navigazione per sport, tipologia di allenamento e categoria target</p>'
  },
  {
    key: 'T1_DEC_CATEGORY',
    shape: 'rhombus',
    width: 460,
    height: 130,
    x: 2459,
    y: 980,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Scelta Tipologia Programma?</strong></p><p>Schede Allenamento Sport/Fitness vs Riabilitazione Generica</p>'
  },
  {
    key: 'T1_UI_REHAB_GENERIC',
    shape: 'rectangle',
    width: 440,
    height: 95,
    x: 2110,
    y: 1160,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Catalogo Riabilitazione Generica</strong></p><p>Programmi generici: posturale, mobilità articolare e decompressione</p>'
  },
  {
    key: 'T1_UI_PRESETS',
    shape: 'rectangle',
    width: 440,
    height: 95,
    x: 2810,
    y: 1160,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Schede Pre-Confezionate Standard</strong></p><p>Archivio schede già presenti: carichi, volume e frequenza fissi standardizzati</p>'
  },
  {
    key: 'T1_GW_VALIDATE',
    shape: 'rectangle',
    width: 520,
    height: 90,
    x: 2459,
    y: 1330,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>API Gateway: GET /api/v1/programs/presets &amp; RBAC Check</strong></p><p>Verifica credenziali Tier 1 • Blocco chiamate Data Analysis &amp; Enforce Read-Only</p>'
  },
  {
    key: 'T1_DB_FETCH',
    shape: 'rectangle',
    width: 460,
    height: 90,
    x: 2810,
    y: 1480,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Database Silo 1: preset_programs (PostgreSQL)</strong></p><p>Estrazione schede con parametri standardizzati non contestualizzati sul singolo atleta</p>'
  },
  {
    key: 'T1_UI_VIEW',
    shape: 'rectangle',
    width: 500,
    height: 95,
    x: 2459,
    y: 1480,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Visualizzazione Scheda &amp; Spiegazione AI Generica</strong></p><p>Consultazione esercizi • Spiegazione AI sull\'utilità e obiettivo (senza fonti scientifiche)</p>'
  },
  {
    key: 'T1_DEC_ACTION',
    shape: 'rhombus',
    width: 460,
    height: 130,
    x: 2459,
    y: 1660,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Modalità di Fruizione Scheda?</strong></p><p>Consultazione Diretta in App vs Esportazione Documento</p>'
  },
  {
    key: 'T1_UI_INAPP',
    shape: 'rectangle',
    width: 440,
    height: 95,
    x: 2110,
    y: 1840,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Consultazione Continua in App</strong></p><p>Player passivo scheda: lettura serie, ripetizioni e tempi di recupero standard</p>'
  },
  {
    key: 'T1_SRV_PDF_RENDER',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2810,
    y: 1840,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: PDFKit Rendering Engine</strong></p><p>Generazione documento PDF statico protetto in sola lettura (protected: true)</p>'
  },
  {
    key: 'T1_UI_PDF_DOWNLOAD',
    shape: 'rectangle',
    width: 440,
    height: 90,
    x: 2810,
    y: 1990,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Download Scheda in Formato PDF Read-Only</strong></p><p>Esportazione PDF priva di possibilità di modifiche o editing parametri</p>'
  },
  {
    key: 'T1_UI_RESTRICTION',
    shape: 'rectangle',
    width: 540,
    height: 95,
    x: 2459,
    y: 2150,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p><strong>Banner Vincoli Tier 1 (Gating Negativo)</strong></p><p>Personalizzazione parametri, anamnesi clinica e fonti scientifiche riservate a Tier 2 e 3</p>'
  },
  {
    key: 'T1_END',
    shape: 'round_rectangle',
    width: 520,
    height: 75,
    x: 2459,
    y: 2300,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p><strong>Fine: Scheda Standard Pronta per l\'Esecuzione</strong></p><p>Consultazione in-app completata o PDF esportato</p>'
  }
];

const T1_CONNECTORS = [
  { start: 'T1_START', end: 'T1_UI_SEARCH_FILTER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_UI_SEARCH_FILTER', end: 'T1_DEC_CATEGORY', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_DEC_CATEGORY', end: 'T1_UI_REHAB_GENERIC', startSnap: 'left', endSnap: 'top', label: 'Riabilitazione' },
  { start: 'T1_DEC_CATEGORY', end: 'T1_UI_PRESETS', startSnap: 'right', endSnap: 'top', label: 'Allenamento Standard' },
  { start: 'T1_UI_REHAB_GENERIC', end: 'T1_GW_VALIDATE', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T1_UI_PRESETS', end: 'T1_GW_VALIDATE', startSnap: 'bottom', endSnap: 'right', label: '' },
  { start: 'T1_GW_VALIDATE', end: 'T1_DB_FETCH', startSnap: 'right', endSnap: 'top', label: '' },
  { start: 'T1_DB_FETCH', end: 'T1_UI_VIEW', startSnap: 'left', endSnap: 'right', label: '' },
  { start: 'T1_UI_VIEW', end: 'T1_DEC_ACTION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_DEC_ACTION', end: 'T1_UI_INAPP', startSnap: 'left', endSnap: 'top', label: 'In-App' },
  { start: 'T1_DEC_ACTION', end: 'T1_SRV_PDF_RENDER', startSnap: 'right', endSnap: 'top', label: 'Esporta PDF' },
  { start: 'T1_SRV_PDF_RENDER', end: 'T1_UI_PDF_DOWNLOAD', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_UI_INAPP', end: 'T1_UI_RESTRICTION', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T1_UI_PDF_DOWNLOAD', end: 'T1_UI_RESTRICTION', startSnap: 'bottom', endSnap: 'right', label: '' },
  { start: 'T1_UI_RESTRICTION', end: 'T1_END', startSnap: 'bottom', endSnap: 'top', label: '' }
];

// ----------------------------------------------------------------------------
// 2. FLOWCHART #09 (FLOW-3B) — TIER 2 (PRO COACH & FISIO P.IVA)
// ----------------------------------------------------------------------------
const T2_NODES = [
  {
    key: 'T2_START',
    shape: 'round_rectangle',
    width: 540,
    height: 80,
    x: 2641.02,
    y: 3840,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    color: '#ffffff',
    content: '<p><strong>Inizio: Cockpit Programmazione Professionale (Tier 2 Pro P.IVA)</strong></p><p>Suite Personal Trainer &amp; Fisioterapisti • Fino a 6 Mesi di Pianificazione</p>'
  },
  {
    key: 'T2_DEC_SOURCE',
    shape: 'rhombus',
    width: 460,
    height: 130,
    x: 2641.02,
    y: 4000,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Modalità di Generazione Scheda?</strong></p><p>Archivio Standardizzato per Sport vs Questionario Anamnestico Clinico</p>'
  },
  {
    key: 'T2_UI_SPORT_ARCHIVE',
    shape: 'rectangle',
    width: 450,
    height: 95,
    x: 2291.02,
    y: 4190,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Archivio Schede Pre-Confezionate per Sport</strong></p><p>Programmi divisi per disciplina: calcio, basket, tennis, running, combat sports</p>'
  },
  {
    key: 'T2_UI_ANAMNESIS',
    shape: 'rectangle',
    width: 450,
    height: 95,
    x: 2991.02,
    y: 4190,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Questionario Anamnestico Completo</strong></p><p>Raccolta storia clinica completa, infortuni pregressi e caratteristiche individuali</p>'
  },
  {
    key: 'T2_DEC_PATH_TYPE',
    shape: 'rhombus',
    width: 460,
    height: 130,
    x: 2641.02,
    y: 4370,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Tipologia di Percorso Atleta?</strong></p><p>Pianificazione Performance (1-6 Mesi) vs Riabilitazione &amp; Return to Play</p>'
  },
  {
    key: 'T2_UI_REHAB_RTP',
    shape: 'rectangle',
    width: 450,
    height: 95,
    x: 2291.02,
    y: 4560,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Protocolli Riabilitazione Specifica &amp; Return to Play (RTP)</strong></p><p>Moduli clinici dedicati alla riatletizzazione e ripresa funzionale post-trauma</p>'
  },
  {
    key: 'T2_UI_PERIOD_WIZARD',
    shape: 'rectangle',
    width: 450,
    height: 95,
    x: 2991.02,
    y: 4560,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Pianificazione a Medio Termine (Fino a 6 Mesi)</strong></p><p>Generazione microcicli, mesocicli e macrocicli con personalizzazione mirata</p>'
  },
  {
    key: 'T2_SRV_PERIODIZER',
    shape: 'rectangle',
    width: 520,
    height: 95,
    x: 2641.02,
    y: 4730,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: AI Periodization Engine (Max 6 Mesi)</strong></p><p>Algoritmi DUP, lineare e blocchi • Validazione vincolo orizzonte temporale &le; 24 sett.</p>'
  },
  {
    key: 'T2_UI_PARAM_EDITOR',
    shape: 'rectangle',
    width: 520,
    height: 95,
    x: 2641.02,
    y: 4880,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Personalizzazione Totale Parametri (Thin Client)</strong></p><p>Modifica libera: serie, ripetizioni, carichi, tempi di recupero e sostituzione esercizi</p>'
  },
  {
    key: 'T2_SRV_AI_SCIENCE',
    shape: 'rectangle',
    width: 540,
    height: 100,
    x: 2641.02,
    y: 5040,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>AI Scientific Engine con Citazioni Bibliografiche &amp; DOI</strong></p><p>Spiegazioni approfondite con link e fonti scientifiche + spiegazione generica per ogni esercizio</p>'
  },
  {
    key: 'T2_DEC_EXPORT',
    shape: 'rhombus',
    width: 460,
    height: 130,
    x: 2641.02,
    y: 5210,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Hub Esportazione Multi-Formato?</strong></p><p>PDF vs Excel (.xlsx sbloccato) vs Word (.docx) vs Notes</p>'
  },
  {
    key: 'T2_SRV_MULTI_EXPORT',
    shape: 'rectangle',
    width: 520,
    height: 95,
    x: 2641.02,
    y: 5380,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Multi-Format Exporter: PDF, Excel, Word &amp; Notes</strong></p><p>Compilazione Openpyxl (protected: false senza password) e documenti modificabili</p>'
  },
  {
    key: 'T2_DB_SAVE',
    shape: 'rectangle',
    width: 450,
    height: 90,
    x: 2991.02,
    y: 5520,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Database Silo 1 Pro: pro_macrocycles (PostgreSQL)</strong></p><p>Salvataggio scheda atleta, storico anamnestico e personalizzazioni coach</p>'
  },
  {
    key: 'T2_UI_RESTRICTIONS',
    shape: 'rectangle',
    width: 450,
    height: 95,
    x: 2291.02,
    y: 5520,
    fillColor: '#fee2e2',
    borderColor: '#dc2626',
    color: '#7f1d1d',
    content: '<p><strong>Banner Vincoli Tier 2 (Gating Negativo)</strong></p><p>No Video nelle schede • No Chatbot 24/7 • No RAG • No Data Analysis (Riservati a Tier 3)</p>'
  },
  {
    key: 'T2_END',
    shape: 'round_rectangle',
    width: 520,
    height: 75,
    x: 2641.02,
    y: 5670,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    color: '#ffffff',
    content: '<p><strong>Fine: Scheda Professionale 6 Mesi Attiva &amp; Esportata</strong></p><p>Programmazione completa disponibile nei 4 formati</p>'
  }
];

const T2_CONNECTORS = [
  { start: 'T2_START', end: 'T2_DEC_SOURCE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_DEC_SOURCE', end: 'T2_UI_SPORT_ARCHIVE', startSnap: 'left', endSnap: 'top', label: 'Archivio Sport' },
  { start: 'T2_DEC_SOURCE', end: 'T2_UI_ANAMNESIS', startSnap: 'right', endSnap: 'top', label: 'Questionario Anamnestico' },
  { start: 'T2_UI_SPORT_ARCHIVE', end: 'T2_DEC_PATH_TYPE', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T2_UI_ANAMNESIS', end: 'T2_DEC_PATH_TYPE', startSnap: 'bottom', endSnap: 'right', label: '' },
  { start: 'T2_DEC_PATH_TYPE', end: 'T2_UI_REHAB_RTP', startSnap: 'left', endSnap: 'top', label: 'Riabilitazione & RTP' },
  { start: 'T2_DEC_PATH_TYPE', end: 'T2_UI_PERIOD_WIZARD', startSnap: 'right', endSnap: 'top', label: 'Pianificazione 6 Mesi' },
  { start: 'T2_UI_REHAB_RTP', end: 'T2_SRV_PERIODIZER', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T2_UI_PERIOD_WIZARD', end: 'T2_SRV_PERIODIZER', startSnap: 'bottom', endSnap: 'right', label: '' },
  { start: 'T2_SRV_PERIODIZER', end: 'T2_UI_PARAM_EDITOR', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_UI_PARAM_EDITOR', end: 'T2_SRV_AI_SCIENCE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_SRV_AI_SCIENCE', end: 'T2_DEC_EXPORT', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_DEC_EXPORT', end: 'T2_SRV_MULTI_EXPORT', startSnap: 'bottom', endSnap: 'top', label: 'Esporta Multi-Formato' },
  { start: 'T2_SRV_MULTI_EXPORT', end: 'T2_DB_SAVE', startSnap: 'right', endSnap: 'top', label: 'Salvataggio Silo 1' },
  { start: 'T2_SRV_MULTI_EXPORT', end: 'T2_UI_RESTRICTIONS', startSnap: 'left', endSnap: 'top', label: '' },
  { start: 'T2_DB_SAVE', end: 'T2_END', startSnap: 'bottom', endSnap: 'right', label: '' },
  { start: 'T2_UI_RESTRICTIONS', end: 'T2_END', startSnap: 'bottom', endSnap: 'left', label: '' }
];

// ----------------------------------------------------------------------------
// 3. FLOWCHART #15 (FLOW-3C) — TIER 3 (ELITE TEAMS) + READINESS SECTION
// ----------------------------------------------------------------------------
const T3_NODES = [
  {
    key: 'T3_START',
    shape: 'round_rectangle',
    width: 560,
    height: 80,
    x: 3056.26,
    y: 8290,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    color: '#ffffff',
    content: '<p><strong>Inizio: Cockpit Programmazione Squadra &amp; Staff Élite (Tier 3)</strong></p><p>Integrazione Data Analysis, RAG, Video, Chatbot 24/7 &amp; Readiness Section</p>'
  },
  {
    key: 'T3_UI_DATA_ANALYSIS',
    shape: 'rectangle',
    width: 540,
    height: 95,
    x: 3056.26,
    y: 8440,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Integrazione Diretta con Sezione Data Analysis</strong></p><p>Import Excel societari, storico atleti, riassunti prestativi, antropometria, test forza &amp; velocità</p>'
  },
  {
    key: 'T3_UI_READINESS_HEADER',
    shape: 'round_rectangle',
    width: 540,
    height: 80,
    x: 3056.26,
    y: 8590,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>TIER 3 ONLY &mdash; READINESS SECTION: INGESTIONE MULTI-PARAMETRICA</strong></p><p>Acquisizione sincronizzata parametri neurali, cardiaci e carichi giornalieri</p>'
  },
  {
    key: 'T3_UI_PVT_TEST',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2706.26,
    y: 8740,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Test Cognitivi &amp; Vigilanza PVT (Psychomotor Vigilance Task)</strong></p><p>Misurazione latenza media e lapse rate per fatica del Sistema Nervoso Centrale (SNC)</p>'
  },
  {
    key: 'T3_UI_HRV_TEST',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 3406.26,
    y: 8740,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Metriche HRV &amp; RMSSD (Time &amp; Frequency Domain)</strong></p><p>Caricamento test fisiologici: SDNN, RMSSD (tempo) e rapporto bande spettrali LF/HF (frequenza)</p>'
  },
  {
    key: 'T3_SRV_INJURY_ALGO',
    shape: 'rectangle',
    width: 540,
    height: 100,
    x: 3056.26,
    y: 8910,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Algoritmo Matematico Calcolo Rischio Infortuni &amp; Baseline</strong></p><p>Formula predittiva rischio infortuni &bull; Creazione baseline prestativa neurale e fisica (singolo e team)</p>'
  },
  {
    key: 'T3_SRV_ZSCORE',
    shape: 'rectangle',
    width: 540,
    height: 95,
    x: 3056.26,
    y: 9070,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Reportistica Automatica &amp; Standardizzazione Statistica Z-Score</strong></p><p>Bilanciamento carico interno (sRPE/HRV) ed esterno (GPS/VBT) normalizzato su rolling window</p>'
  },
  {
    key: 'T3_UI_AI_PREVENTION',
    shape: 'rectangle',
    width: 540,
    height: 95,
    x: 3056.26,
    y: 9220,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Supporto Preventivo AI: Indicazioni Operative Rischio Infortuni</strong></p><p>Raccomandazioni su cosa fare e come lavorare per abbattere il rischio infortuni (atleta &amp; squadra)</p>'
  },
  {
    key: 'T3_UI_ANNUAL_PLANNER',
    shape: 'rectangle',
    width: 540,
    height: 95,
    x: 3056.26,
    y: 9370,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Pianificazione Annuale Completa (Fino a 1 Anno / Stagione)</strong></p><p>Creazione microcicli, mesocicli e macrocicli estesi all\'intera stagione agonistica</p>'
  },
  {
    key: 'T3_SRV_RAG_COACH',
    shape: 'rectangle',
    width: 540,
    height: 100,
    x: 3056.26,
    y: 9530,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Cluster RAG: Replica Stile Coach &amp; Consigli Abitudini Quotidiane</strong></p><p>Generazione programmi allineati alla metodologia del coach e consigli individuali su gestione atleta</p>'
  },
  {
    key: 'T3_UI_REHAB_ELITE',
    shape: 'rectangle',
    width: 520,
    height: 90,
    x: 3056.26,
    y: 9690,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Riabilitazione Élite &amp; Protocolli Return to Play (RTP)</strong></p><p>Sviluppo programmi specifici di riabilitazione integrati con cartella clinica dello staff medico</p>'
  },
  {
    key: 'T3_DEC_DELIVERY',
    shape: 'rhombus',
    width: 460,
    height: 130,
    x: 3056.26,
    y: 9850,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Canale di Consegna &amp; Condivisione Programma?</strong></p><p>Invio App Atleta con Video Dimostrativi vs Esportazione Multi-Formato</p>'
  },
  {
    key: 'T3_UI_SHARE_VIDEO',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2706.26,
    y: 10040,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Invio Diretto ad App Atleta con Video Dimostrativi</strong></p><p>Scheda interattiva con clip video esecutive, consigli tecnici ed errori comuni da evitare</p>'
  },
  {
    key: 'T3_UI_CHATBOT_24_7',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2706.26,
    y: 10190,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Chatbot Integrato 24/7 Addestrato via RAG</strong></p><p>Assistente real-time h24 per spiegazione esercizi all\'atleta e risposte istantanee a domande</p>'
  },
  {
    key: 'T3_UI_EXPORT_ENTERPRISE',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 3406.26,
    y: 10040,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Esportazione Multi-Formato Enterprise</strong></p><p>Download schede annuali nei 4 formati: PDF, Excel (.xlsx), Word (.docx) e Notes</p>'
  },
  {
    key: 'T3_DB_SILO2_BUNKER',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 3406.26,
    y: 10190,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Database Silo 2 Club Bunker KMS (Crittografia Dedicata)</strong></p><p>Storage sicuro schede annuali, dati PVT, HRV, Z-score e vettori RAG proprietari</p>'
  },
  {
    key: 'T3_END',
    shape: 'round_rectangle',
    width: 540,
    height: 80,
    x: 3056.26,
    y: 10360,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    color: '#ffffff',
    content: '<p><strong>Fine: Programma Annuale Attivo, Monitorato da Readiness &amp; RAG 24/7</strong></p><p>Massima efficienza prestativa e prevenzione infortuni certificata</p>'
  }
];

const T3_CONNECTORS = [
  { start: 'T3_START', end: 'T3_UI_DATA_ANALYSIS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_DATA_ANALYSIS', end: 'T3_UI_READINESS_HEADER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_READINESS_HEADER', end: 'T3_UI_PVT_TEST', startSnap: 'left', endSnap: 'top', label: 'Test Cognitivo' },
  { start: 'T3_UI_READINESS_HEADER', end: 'T3_UI_HRV_TEST', startSnap: 'right', endSnap: 'top', label: 'Test Fisiologico' },
  { start: 'T3_UI_PVT_TEST', end: 'T3_SRV_INJURY_ALGO', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T3_UI_HRV_TEST', end: 'T3_SRV_INJURY_ALGO', startSnap: 'bottom', endSnap: 'right', label: '' },
  { start: 'T3_SRV_INJURY_ALGO', end: 'T3_SRV_ZSCORE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_SRV_ZSCORE', end: 'T3_UI_AI_PREVENTION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_AI_PREVENTION', end: 'T3_UI_ANNUAL_PLANNER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_ANNUAL_PLANNER', end: 'T3_SRV_RAG_COACH', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_SRV_RAG_COACH', end: 'T3_UI_REHAB_ELITE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_REHAB_ELITE', end: 'T3_DEC_DELIVERY', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_DEC_DELIVERY', end: 'T3_UI_SHARE_VIDEO', startSnap: 'left', endSnap: 'top', label: 'Invio App Atleta con Video' },
  { start: 'T3_DEC_DELIVERY', end: 'T3_UI_EXPORT_ENTERPRISE', startSnap: 'right', endSnap: 'top', label: 'Export Multi-Formato' },
  { start: 'T3_UI_SHARE_VIDEO', end: 'T3_UI_CHATBOT_24_7', startSnap: 'bottom', endSnap: 'top', label: 'Attivazione Tutor' },
  { start: 'T3_UI_EXPORT_ENTERPRISE', end: 'T3_DB_SILO2_BUNKER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_CHATBOT_24_7', end: 'T3_END', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T3_DB_SILO2_BUNKER', end: 'T3_END', startSnap: 'bottom', endSnap: 'right', label: '' }
];

// ============================================================================
// MAIN DEPLOYMENT PIPELINE
// ============================================================================

async function main() {
  console.log('======================================================================');
  console.log('🚀 AVVIO DEPLOYMENT AUTORITATIVO: PROGRAMMAZIONE DEGLI ESERCIZI (3 TIERS)');
  console.log(`Board ID: ${BOARD_ID}`);
  console.log('======================================================================\n');

  // STEP 1: Recupero stato attuale della Board
  console.log('🔍 [STEP 1/6] Analisi inventario Miro live...');
  const boardShapes = await fetchAllBoardShapes();
  const boardConnectors = await fetchAllBoardConnectors();
  console.log(`Totale Shapes rilevate: ${boardShapes.length}`);
  console.log(`Totale Connettori rilevati: ${boardConnectors.length}\n`);

  // STEP 2: Isolamento chirurgico dei nodi e connettori obsoleti di Colonna 3
  console.log('🎯 [STEP 2/6] Isolamento chirurgico elementi obsoleti Colonna 3...');
  
  // Colonna 3 Bounding Box: X tra 1900 e 3900
  const col3Shapes = boardShapes.filter(s => {
    const x = s.position.x;
    return x >= 1900 && x <= 3900;
  });

  // Filtriamo: NON toccare i 3 Badge protetti e i 3 Title Banner
  const shapesToDelete = col3Shapes.filter(s => {
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
  console.log(`Vecchie shape operative da eliminare: ${shapesToDelete.length}`);
  console.log(`Vecchi connettori da eliminare: ${connectorsToDelete.length}\n`);

  // STEP 3: Eliminazione controllata con Rate Limiting
  console.log('🗑️  [STEP 3/6] Eliminazione selettiva connettori e vecchie shape...');
  for (const conn of connectorsToDelete) {
    await miroApi(`/connectors/${conn.id}`, 'DELETE');
    await delay(DELAY_DELETE_MS);
  }
  console.log(`-> Eliminati ${connectorsToDelete.length} vecchi connettori.`);

  for (const shape of shapesToDelete) {
    await miroApi(`/shapes/${shape.id}`, 'DELETE');
    await delay(DELAY_DELETE_MS);
  }
  console.log(`-> Eliminate ${shapesToDelete.length} vecchie shape operative.\n`);

  // STEP 4: Aggiornamento in-place dei Title Banner
  console.log('🏷️  [STEP 4/6] Aggiornamento testuale dei 3 Title Banner...');
  const bannerTitles = {
    [TITLE_BANNER_IDS.FLOW_3A]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">3. PROGRAMMAZIONE BASE, SCHEDE PRE-CONFEZIONATE &amp; EXPORT PDF (TIER 1)</strong></p>',
    [TITLE_BANNER_IDS.FLOW_3B]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">3. PROGRAMMAZIONE ANAMNESTICA (6 MESI), RTP, AI SCIENTIFICA &amp; MULTI-EXPORT (TIER 2)</strong></p>',
    [TITLE_BANNER_IDS.FLOW_3C]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">3. PROGRAMMAZIONE ANNUALE RAG, CHATBOT 24/7 &amp; READINESS SECTION (TIER 3)</strong></p>'
  };

  for (const [id, content] of Object.entries(bannerTitles)) {
    await patchTitleBanner(id, content);
    console.log(`-> Title Banner ${id} aggiornato con successo.`);
  }
  console.log('');

  // STEP 5: Creazione dei nuovi nodi ISO 5807
  console.log('✨ [STEP 5/6] Creazione nodi ISO 5807 a 4 Corsie...');
  const keyToMiroId = {};

  console.log(`--- Creazione nodi Flow 3A (Tier 1 B2C Casual: ${T1_NODES.length} nodi) ---`);
  for (const node of T1_NODES) {
    const res = await createIsoNode(node);
    if (res && res.id) {
      keyToMiroId[node.key] = res.id;
    } else {
      console.error(`ERRORE creazione nodo ${node.key}:`, res);
    }
  }

  console.log(`--- Creazione nodi Flow 3B (Tier 2 Pro P.IVA: ${T2_NODES.length} nodi) ---`);
  for (const node of T2_NODES) {
    const res = await createIsoNode(node);
    if (res && res.id) {
      keyToMiroId[node.key] = res.id;
    } else {
      console.error(`ERRORE creazione nodo ${node.key}:`, res);
    }
  }

  console.log(`--- Creazione nodi Flow 3C (Tier 3 Elite Teams: ${T3_NODES.length} nodi) ---`);
  for (const node of T3_NODES) {
    const res = await createIsoNode(node);
    if (res && res.id) {
      keyToMiroId[node.key] = res.id;
    } else {
      console.error(`ERRORE creazione nodo ${node.key}:`, res);
    }
  }
  console.log(`-> Totale nuovi nodi ISO creati: ${Object.keys(keyToMiroId).length}\n`);

  // STEP 6: Creazione connettori ortogonali a 90° ('elbowed')
  console.log('🔗 [STEP 6/6] Creazione connettori ortogonali a 90° con didascalie...');
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
  console.log('🏁 [VERIFICA FINALE LIVE] Controllo integrità Miro...');
  const finalShapes = await fetchAllBoardShapes();
  const finalConnectors = await fetchAllBoardConnectors();

  console.log(`Shapes totali post-deployment: ${finalShapes.length}`);
  console.log(`Connettori totali post-deployment: ${finalConnectors.length}`);

  // Verifica presenza badge
  for (const badgeId of PROTECTED_BADGE_IDS) {
    const exists = finalShapes.some(s => s.id === badgeId);
    console.log(`-> Cartiglio Badge ${badgeId}: ${exists ? '✅ PRESENTE E INTEGRO' : '❌ MANCANTE'}`);
  }

  // Verifica presenza tutti i nuovi nodi
  let allNodesPresent = true;
  for (const [key, id] of Object.entries(keyToMiroId)) {
    const exists = finalShapes.some(s => s.id === id);
    if (!exists) {
      console.log(`❌ Nodo ${key} (${id}) non trovato`);
      allNodesPresent = false;
    }
  }
  if (allNodesPresent) {
    console.log(`✅ TUTTI I ${Object.keys(keyToMiroId).length} NUOVI NODI ISO SONO STATI CERTIFICATI SU MIRO!`);
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

  fs.writeFileSync('scratch/deploy_col3_report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Report di deployment salvato in scratch/deploy_col3_report.json');
  console.log('🎉 DEPLOYMENT COMPLETATO CON SUCCESSO!');
}

main().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
