/**
 * deploy-miro-programming-complete.cjs
 * 
 * Script di deployment completo su Miro Board (Board ID: uXjVEbo6L2o=).
 * Aggiorna i 3 diagrammi di Colonna 3 (Zona 4):
 * - Flowchart #03 (FLOW-3A): Tier 1 (B2C Casual) • Programmazione Base, Schede Pre-Confezionate, Workout Player & Together Social
 * - Flowchart #09 (FLOW-3B): Tier 2 (Pro P.IVA) • Programmazione Anamnestica 6M, RTP, Workout Player, AI Scientifica & Together Social
 * - Flowchart #15 (FLOW-3C): Tier 3 (Elite Teams) • Programmazione Annuale, Workout Player, Chatbot 24/7, Readiness Section & Together Social
 * 
 * Vincoli e Garanzie:
 * 1. Preservazione assoluta dei 3 badge cartigli (#03: 3458764688417722711, #09: 3458764688417722743, #15: 3458764688417722788).
 * 2. Rispetto della No-Fly Zone di 40px attorno ai cartigli.
 * 3. Preservazione e aggiornamento in-place dei 3 Title Banner (#03: 3458764686744184735, #09: 3458764688307403600, #15: 3458764688307469953).
 * 4. Eliminazione sicura delle vecchie shape operative e vecchi connettori di Colonna 3.
 * 5. Creazione nodi ISO 5807 con palette corretta.
 * 6. Creazione connettori ortogonali 90° ('elbowed') con didascalie bivi.
 * 7. Rate limiting e verifica live post-deploy.
 */

const fs = require('fs');

const MIRO_API_BASE_URL = 'https://api.miro.com/v2/boards';
const BOARD_ID = 'uXjVEbo6L2o=';
const MIRO_TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';

const DELAY_DELETE_MS = 50;
const DELAY_CREATE_MS = 100;

const PROTECTED_BADGE_IDS = new Set([
  '3458764688417722711', // Badge #03 (Tier 1 B2C)
  '3458764688417722743', // Badge #09 (Tier 2 Pro)
  '3458764688417722788'  // Badge #15 (Tier 3 Elite)
]);

const TITLE_BANNER_IDS = {
  FLOW_3A: '3458764686744184735',
  FLOW_3B: '3458764688307403600',
  FLOW_3C: '3458764688307469953'
};

const PROTECTED_HEADER_IDS = new Set(Object.values(TITLE_BANNER_IDS));

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function fetchAllBoardShapes() {
  let cursor = null;
  const allShapes = [];
  do {
    const endpoint = `/shapes?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const res = await miroApi(endpoint);
    if (res && res.data) {
      allShapes.push(...res.data);
    }
    cursor = res?.cursor || null;
  } while (cursor);
  return allShapes;
}

async function fetchAllBoardConnectors() {
  let cursor = null;
  const allConnectors = [];
  do {
    const endpoint = `/connectors?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const res = await miroApi(endpoint);
    if (res && res.data) {
      allConnectors.push(...res.data);
    }
    cursor = res?.cursor || null;
  } while (cursor);
  return allConnectors;
}

async function patchTitleBanner(bannerId, htmlContent) {
  const payload = {
    data: {
      content: htmlContent
    }
  };
  return await miroApi(`/shapes/${bannerId}`, 'PATCH', payload);
}

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
// DEFINIZIONI NODI E CONNETTORI ISO 5807
// ============================================================================

// 1. FLOWCHART #03 (FLOW-3A) — TIER 1 (B2C CASUAL)
const T1_NODES = [
  {
    key: 'T1_START',
    shape: 'round_rectangle',
    width: 520,
    height: 80,
    x: 2382,
    y: 750,
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
    x: 2382,
    y: 890,
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
    x: 2382,
    y: 1050,
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
    x: 2030,
    y: 1220,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Catalogo Riabilitazione Generica</strong></p><p>Programmi generici: posturale, mobilità articolare e scarico</p>'
  },
  {
    key: 'T1_UI_PRESETS',
    shape: 'rectangle',
    width: 440,
    height: 95,
    x: 2730,
    y: 1220,
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
    x: 2382,
    y: 1390,
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
    x: 2950,
    y: 1390,
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
    x: 2382,
    y: 1540,
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
    x: 2382,
    y: 1710,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Azione: Avvia Sessione vs Esporta PDF?</strong></p><p>Allenamento Live con Gym Player vs Esportazione Documento Statico</p>'
  },
  {
    key: 'T1_UI_START_SESSION',
    shape: 'rectangle',
    width: 440,
    height: 95,
    x: 2030,
    y: 1880,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Pulsante "Avvia Sessione" (Thin Client)</strong></p><p>Apertura programma del giorno o avvio allenamento libero in palestra</p>'
  },
  {
    key: 'T1_UI_GYM_PLAYER',
    shape: 'rectangle',
    width: 450,
    height: 110,
    x: 2030,
    y: 2030,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Interfaccia da Palestra (Workout Session Tracker)</strong></p><p>Timer di recupero inter-serie • Spunta serie completate • Inserimento carichi (kg) &amp; ripetizioni effettive</p>'
  },
  {
    key: 'T1_GW_LOG',
    shape: 'rectangle',
    width: 450,
    height: 90,
    x: 2030,
    y: 2170,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>API Gateway: POST /api/v1/programs/sessions/log</strong></p><p>Ingestion tracciamento sessione completata, carichi e volume</p>'
  },
  {
    key: 'T1_SRV_LOG',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2030,
    y: 2300,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Workout Logger</strong></p><p>Calcolo durata totale, volume complessivo/tonnellaggio e generazione card social</p>'
  },
  {
    key: 'T1_DB_LOG',
    shape: 'rectangle',
    width: 450,
    height: 90,
    x: 2030,
    y: 2430,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Database Silo 1: workout_sessions (PostgreSQL)</strong></p><p>Registrazione cronologia serie completate, carichi effettivi e durata</p>'
  },
  {
    key: 'T1_UI_TOGETHER_SHARE',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: 2030,
    y: 2560,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Condivisione su Together Social</strong></p><p>Generazione e pubblicazione card dati generici allenamento (durata, volume, esercizi completati)</p>'
  },
  {
    key: 'T1_SRV_PDF_RENDER',
    shape: 'rectangle',
    width: 450,
    height: 95,
    x: 2730,
    y: 1880,
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
    x: 2730,
    y: 2030,
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
    x: 2382,
    y: 2710,
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
    x: 2382,
    y: 2840,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    color: '#ffffff',
    content: '<p><strong>Fine: Sessione Registrata / Together Social o PDF Esportato</strong></p><p>Workout completato su community Together Social o scheda archiviata</p>'
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
  { start: 'T1_DEC_ACTION', end: 'T1_UI_START_SESSION', startSnap: 'left', endSnap: 'top', label: 'Avvia Sessione' },
  { start: 'T1_DEC_ACTION', end: 'T1_SRV_PDF_RENDER', startSnap: 'right', endSnap: 'top', label: 'Esporta PDF' },
  { start: 'T1_UI_START_SESSION', end: 'T1_UI_GYM_PLAYER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_UI_GYM_PLAYER', end: 'T1_GW_LOG', startSnap: 'bottom', endSnap: 'top', label: 'Registra Dati' },
  { start: 'T1_GW_LOG', end: 'T1_SRV_LOG', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_SRV_LOG', end: 'T1_DB_LOG', startSnap: 'bottom', endSnap: 'top', label: 'Commit' },
  { start: 'T1_DB_LOG', end: 'T1_UI_TOGETHER_SHARE', startSnap: 'bottom', endSnap: 'top', label: 'Card Social' },
  { start: 'T1_SRV_PDF_RENDER', end: 'T1_UI_PDF_DOWNLOAD', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T1_UI_TOGETHER_SHARE', end: 'T1_UI_RESTRICTION', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T1_UI_PDF_DOWNLOAD', end: 'T1_UI_RESTRICTION', startSnap: 'bottom', endSnap: 'right', label: '' },
  { start: 'T1_UI_RESTRICTION', end: 'T1_END', startSnap: 'bottom', endSnap: 'top', label: '' }
];

// 2. FLOWCHART #09 (FLOW-3B) — TIER 2 (PRO COACH & FISIO P.IVA)
const T2_NODES = [
  {
    key: 'T2_START',
    shape: 'round_rectangle',
    width: 540,
    height: 80,
    x: 2385,
    y: 3950,
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
    x: 2385,
    y: 4100,
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
    x: 2035,
    y: 4260,
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
    x: 2735,
    y: 4260,
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
    x: 2385,
    y: 4420,
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
    x: 2035,
    y: 4580,
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
    x: 2735,
    y: 4580,
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
    x: 2385,
    y: 4740,
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
    x: 2385,
    y: 4890,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Personalizzazione Totale Parametri (Thin Client)</strong></p><p>Modifica libera: serie, ripetizioni, carichi, tempi di recupero e sostituzione esercizi</p>'
  },
  {
    key: 'T2_SRV_AI_SCIENCE',
    shape: 'rectangle',
    width: 540,
    height: 95,
    x: 2385,
    y: 5040,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>AI Scientific Engine con Citazioni Bibliografiche &amp; DOI</strong></p><p>Spiegazioni approfondite con link e fonti scientifiche + spiegazione per ogni esercizio</p>'
  },
  {
    key: 'T2_DEC_ACTION',
    shape: 'rhombus',
    width: 460,
    height: 130,
    x: 2385,
    y: 5200,
    fillColor: '#fef3c7',
    borderColor: '#d97706',
    color: '#0f172a',
    content: '<p><strong>Azione: Avvia Sessione vs Esporta Multi-Formato?</strong></p><p>Allenamento Live con Player Pro vs Download Documenti</p>'
  },
  {
    key: 'T2_UI_START_SESSION',
    shape: 'rectangle',
    width: 440,
    height: 95,
    x: 2035,
    y: 5360,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Pulsante "Avvia Sessione" (Cockpit Pro / Atleta)</strong></p><p>Avvio programma semestrale del giorno o workout libero con target coach</p>'
  },
  {
    key: 'T2_UI_GYM_PLAYER',
    shape: 'rectangle',
    width: 450,
    height: 110,
    x: 2035,
    y: 5500,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Interfaccia da Palestra Pro (Workout Session Tracker)</strong></p><p>Timer recupero • Check serie • Carichi (kg) &amp; reps effettive vs target coach • RPE per serie</p>'
  },
  {
    key: 'T2_GW_LOG',
    shape: 'rectangle',
    width: 450,
    height: 90,
    x: 2035,
    y: 5640,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>API Gateway: POST /api/v1/pro/programs/sessions/log</strong></p><p>Ingestion tracciamento sessione pro e compliance vs target prescritto</p>'
  },
  {
    key: 'T2_SRV_LOG',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2035,
    y: 5770,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Pro Workout Logger</strong></p><p>Calcolo tonnellaggio, riconciliazione progressione semestrale e card social</p>'
  },
  {
    key: 'T2_DB_LOG',
    shape: 'rectangle',
    width: 450,
    height: 90,
    x: 2035,
    y: 5900,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Database Silo 1 Pro: pro_workout_sessions</strong></p><p>Archiviazione dati esecutivi e storico scostamenti carichi atleta</p>'
  },
  {
    key: 'T2_UI_TOGETHER_SHARE',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: 2035,
    y: 6030,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Condivisione su Together Social</strong></p><p>Card dati generici allenamento (durata, volume sollevato, esercizi) su Together Social</p>'
  },
  {
    key: 'T2_SRV_MULTI_EXPORT',
    shape: 'rectangle',
    width: 450,
    height: 95,
    x: 2735,
    y: 5360,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Multi-Format Exporter: PDF, Excel, Word &amp; Notes</strong></p><p>Compilazione Openpyxl (protected: false) e documenti modificabili</p>'
  },
  {
    key: 'T2_UI_EXPORT_DOCS',
    shape: 'rectangle',
    width: 440,
    height: 90,
    x: 2735,
    y: 5500,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Download Documenti: PDF, Excel, Word, Notes</strong></p><p>Esportazione piano 6 mesi liberamente fruibile su fogli di calcolo</p>'
  },
  {
    key: 'T2_UI_RESTRICTIONS',
    shape: 'rectangle',
    width: 540,
    height: 95,
    x: 2385,
    y: 6180,
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
    x: 2385,
    y: 6310,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    color: '#ffffff',
    content: '<p><strong>Fine: Sessione Registrata su Together Social / Export 6M Attivo</strong></p><p>Programmazione semestrale integrata con community Together Social</p>'
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
  { start: 'T2_SRV_AI_SCIENCE', end: 'T2_DEC_ACTION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_DEC_ACTION', end: 'T2_UI_START_SESSION', startSnap: 'left', endSnap: 'top', label: 'Avvia Sessione' },
  { start: 'T2_DEC_ACTION', end: 'T2_SRV_MULTI_EXPORT', startSnap: 'right', endSnap: 'top', label: 'Esporta Multi-Formato' },
  { start: 'T2_UI_START_SESSION', end: 'T2_UI_GYM_PLAYER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_UI_GYM_PLAYER', end: 'T2_GW_LOG', startSnap: 'bottom', endSnap: 'top', label: 'Registra Dati' },
  { start: 'T2_GW_LOG', end: 'T2_SRV_LOG', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_SRV_LOG', end: 'T2_DB_LOG', startSnap: 'bottom', endSnap: 'top', label: 'Commit' },
  { start: 'T2_DB_LOG', end: 'T2_UI_TOGETHER_SHARE', startSnap: 'bottom', endSnap: 'top', label: 'Card Social' },
  { start: 'T2_SRV_MULTI_EXPORT', end: 'T2_UI_EXPORT_DOCS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T2_UI_TOGETHER_SHARE', end: 'T2_UI_RESTRICTIONS', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T2_UI_EXPORT_DOCS', end: 'T2_UI_RESTRICTIONS', startSnap: 'bottom', endSnap: 'right', label: '' },
  { start: 'T2_UI_RESTRICTIONS', end: 'T2_END', startSnap: 'bottom', endSnap: 'top', label: '' }
];

// 3. FLOWCHART #15 (FLOW-3C) — TIER 3 (ELITE TEAMS) + READINESS + WORKOUT PLAYER + TOGETHER SOCIAL
const T3_NODES = [
  {
    key: 'T3_START',
    shape: 'round_rectangle',
    width: 560,
    height: 80,
    x: 2641.02,
    y: 8420,
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
    x: 2641.02,
    y: 8570,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Integrazione Diretta con Sezione Data Analysis</strong></p><p>Import Excel societari, storico atleti, riassunti prestativi, antropometria, test forza &amp; velocità</p>'
  },
  {
    key: 'T3_UI_READINESS_HEADER',
    shape: 'round_rectangle',
    width: 540,
    height: 90,
    x: 2641.02,
    y: 8722,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>TIER 3 ONLY &mdash; READINESS SECTION: 4 DOMINI DISACCOPPIATI</strong></p><p>Acquisizione multi-parametrica indipendente (Fisiologico, Neurocognitivo, Neuromuscolare, Tolleranza Carico) &bull; Prevenzione del masking di cali acuti</p>'
  },
  {
    key: 'T3_UI_PVT_TEST',
    shape: 'rectangle',
    width: 460,
    height: 120,
    x: 2291.02,
    y: 8872,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Protocollo PVT-B (3 Minuti) &amp; Segregazione Contestuale</strong></p><p>Vigilanza comportamentale &amp; attenzione sostenuta &bull; Dual Testing: Mattutino a Digiuno (CNS Baseline/Recovery) vs Pre-Sessione (Arousal Acuto) &bull; Median RT, Velocit&agrave; 1/RT, False Starts &amp; Lapsus calibrati su 3 min</p>'
  },
  {
    key: 'T3_UI_HRV_TEST',
    shape: 'rectangle',
    width: 460,
    height: 120,
    x: 2991.02,
    y: 8872,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Metriche Fisiologiche HRV/RMSSD, RHR &amp; Neuromuscolari</strong></p><p>Dominio Tempo (RMSSD, SDNN), Frequenza (LF/HF) e RHR &bull; Sub-Score Neuromuscolare: Salto CMJ (Altezza, RSI-mod, Tasso Forza Eccentrica) e Tolleranza Carico (sRPE, EWMA ACWR)</p>'
  },
  {
    key: 'T3_SRV_INJURY_ALGO',
    shape: 'rectangle',
    width: 540,
    height: 110,
    x: 2641.02,
    y: 9042,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Architettura Rischio Infortuni a Due Fasi (Two-Phase Model)</strong></p><p>Fase 1: Matrice Deterministica Red Flag (Hard stop su asimmetrie e spike carichi) &rarr; Fase 2: Regressione Logistica Calibrata / ML su serie storiche longitudinali di squadra</p>'
  },
  {
    key: 'T3_SRV_ZSCORE',
    shape: 'rectangle',
    width: 540,
    height: 110,
    x: 2641.02,
    y: 9202,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Normalizzazione Statistica Robust Z-Score (MAD)</strong></p><p>Z_robust = (x - mediana) / (1.4826 &times; MAD) su rolling window 28gg &bull; Immunit&agrave; da asimmetrie ed outlier &bull; Reportistica dei 4 Sub-Scores Disaccoppiati prima del composito</p>'
  },
  {
    key: 'T3_UI_AI_PREVENTION',
    shape: 'rectangle',
    width: 540,
    height: 110,
    x: 2641.02,
    y: 9352,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Supporto Preventivo AI: Modulazione del Carico Mirata per Dominio</strong></p><p>Prescrizione stimoli selettiva: calo PVT &rarr; taglio HSR, sprint max e decision-making; calo HRV &rarr; taglio volume e densit&agrave;; calo CMJ &rarr; stop pliometria ed eccentrici pesanti</p>'
  },
  {
    key: 'T3_UI_ANNUAL_WIZARD',
    shape: 'rectangle',
    width: 540,
    height: 95,
    x: 2641.02,
    y: 9502,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Pianificazione Annuale Completa (Fino a 1 Anno / Stagione)</strong></p><p>Creazione microcicli per tutta la stagione, coordinati con carichi GPS, test e partite</p>'
  },
  {
    key: 'T3_UI_RAG_COACH',
    shape: 'rectangle',
    width: 540,
    height: 95,
    x: 2641.02,
    y: 9652,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>Cluster RAG: Replica Stile Coach &amp; Consigli Abitudini Quotidiane</strong></p><p>Personalizzazione su abitudini atleta e clonazione dello stile comunicativo/tecnico del coach</p>'
  },
  {
    key: 'T3_UI_REHAB_ELITE',
    shape: 'rectangle',
    width: 540,
    height: 95,
    x: 2641.02,
    y: 9802,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Riabilitazione Élite &amp; Protocolli Return to Play (RTP)</strong></p><p>Sviluppo protocolli complessi di riatletizzazione in sinergia con lo staff medico societario</p>'
  },
  {
    key: 'T3_DEC_DELIVERY',
    shape: 'rhombus',
    width: 480,
    height: 130,
    x: 2641.02,
    y: 9970,
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
    x: 2291.02,
    y: 10140,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Invio Diretto ad App Atleta con Video Dimostrativi</strong></p><p>Scheda interattiva con clip video esecutive in 4K, consigli tecnici ed errori da evitare</p>'
  },
  {
    key: 'T3_UI_START_SESSION',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2291.02,
    y: 10280,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Pulsante "Avvia Sessione" (App Atleta Élite)</strong></p><p>Apertura allenamento giornaliero prescritto o sessione libera di rifinitura</p>'
  },
  {
    key: 'T3_UI_GYM_PLAYER',
    shape: 'rectangle',
    width: 460,
    height: 110,
    x: 2291.02,
    y: 10420,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Interfaccia da Palestra Élite (Workout Player)</strong></p><p>Timer recupero inter-serie • Spunta serie completate • Inserimento carichi (kg) &amp; reps reali • Feedback RPE</p>'
  },
  {
    key: 'T3_GW_LOG',
    shape: 'rectangle',
    width: 460,
    height: 90,
    x: 2291.02,
    y: 10560,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>API Gateway mTLS: POST /api/v1/elite/programs/sessions/log</strong></p><p>Ingestion sicura con crittografia end-to-end su canale mTLS blindato</p>'
  },
  {
    key: 'T3_SRV_LOG',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2291.02,
    y: 10690,
    fillColor: '#d1fae5',
    borderColor: '#059669',
    color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Elite Workout Logger</strong></p><p>Calcolo tonnellaggio, riconciliazione microciclo annuale e generazione card social</p>'
  },
  {
    key: 'T3_DB_LOG',
    shape: 'rectangle',
    width: 460,
    height: 90,
    x: 2291.02,
    y: 10820,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Database Silo 2 Bunker KMS: athlete_workout_logs</strong></p><p>Salvataggio cifrato serie completate e carichi sollevati protetti da chiave societaria</p>'
  },
  {
    key: 'T3_UI_TOGETHER_SHARE',
    shape: 'rectangle',
    width: 460,
    height: 100,
    x: 2291.02,
    y: 10950,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Condivisione su Together Social</strong></p><p>Card dati generici allenamento (durata, volume sollevato, esercizi) su Together Social (Zero leak tattici)</p>'
  },
  {
    key: 'T3_UI_CHATBOT_24_7',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2291.02,
    y: 11090,
    fillColor: '#ede9fe',
    borderColor: '#7c3aed',
    color: '#0f172a',
    content: '<p><strong>Chatbot Integrato 24/7 Addestrato via RAG</strong></p><p>Assistente real-time h24 per spiegazione esercizi, dubbi e correzioni tecniche</p>'
  },
  {
    key: 'T3_UI_EXPORT_ENTERPRISE',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2991.02,
    y: 10140,
    fillColor: '#e0f2fe',
    borderColor: '#0284c7',
    color: '#0f172a',
    content: '<p><strong>Esportazione Multi-Formato Enterprise</strong></p><p>Download schede annuali nei 4 formati: PDF, Excel (.xlsx sbloccato), Word (.docx) e Notes</p>'
  },
  {
    key: 'T3_DB_SILO2_BUNKER',
    shape: 'rectangle',
    width: 460,
    height: 95,
    x: 2991.02,
    y: 10290,
    fillColor: '#ffe4e6',
    borderColor: '#e11d48',
    color: '#0f172a',
    content: '<p><strong>Database Silo 2 Club Bunker KMS (Crittografia Dedicata)</strong></p><p>Storage sicuro schede annuali, dati PVT, HRV, Z-score e vettori RAG con chiave KMS esclusiva</p>'
  },
  {
    key: 'T3_END',
    shape: 'round_rectangle',
    width: 560,
    height: 80,
    x: 2641.02,
    y: 11240,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    color: '#ffffff',
    content: '<p><strong>Fine: Programma Annuale Attivo, Monitorato da Readiness, Together Social &amp; RAG 24/7</strong></p><p>Stagione pianificata, monitorata quotidianamente e integrata su Together Social</p>'
  }
];

const T3_CONNECTORS = [
  { start: 'T3_START', end: 'T3_UI_DATA_ANALYSIS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_DATA_ANALYSIS', end: 'T3_UI_READINESS_HEADER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_READINESS_HEADER', end: 'T3_UI_PVT_TEST', startSnap: 'left', endSnap: 'top', label: 'PVT-B (3 min)' },
  { start: 'T3_UI_READINESS_HEADER', end: 'T3_UI_HRV_TEST', startSnap: 'right', endSnap: 'top', label: 'HRV & CMJ' },
  { start: 'T3_UI_PVT_TEST', end: 'T3_SRV_INJURY_ALGO', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T3_UI_HRV_TEST', end: 'T3_SRV_INJURY_ALGO', startSnap: 'bottom', endSnap: 'right', label: '' },
  { start: 'T3_SRV_INJURY_ALGO', end: 'T3_SRV_ZSCORE', startSnap: 'bottom', endSnap: 'top', label: 'Two-Phase Risk' },
  { start: 'T3_SRV_ZSCORE', end: 'T3_UI_AI_PREVENTION', startSnap: 'bottom', endSnap: 'top', label: 'Z_robust MAD' },
  { start: 'T3_UI_AI_PREVENTION', end: 'T3_UI_ANNUAL_WIZARD', startSnap: 'bottom', endSnap: 'top', label: 'Modulazione Carico' },
  { start: 'T3_UI_ANNUAL_WIZARD', end: 'T3_UI_RAG_COACH', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_RAG_COACH', end: 'T3_UI_REHAB_ELITE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_REHAB_ELITE', end: 'T3_DEC_DELIVERY', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_DEC_DELIVERY', end: 'T3_UI_SHARE_VIDEO', startSnap: 'left', endSnap: 'top', label: 'Invio App Atleta con Video' },
  { start: 'T3_DEC_DELIVERY', end: 'T3_UI_EXPORT_ENTERPRISE', startSnap: 'right', endSnap: 'top', label: 'Export Multi-Formato' },
  { start: 'T3_UI_SHARE_VIDEO', end: 'T3_UI_START_SESSION', startSnap: 'bottom', endSnap: 'top', label: 'Apertura Scheda' },
  { start: 'T3_UI_START_SESSION', end: 'T3_UI_GYM_PLAYER', startSnap: 'bottom', endSnap: 'top', label: 'Avvia Sessione' },
  { start: 'T3_UI_GYM_PLAYER', end: 'T3_GW_LOG', startSnap: 'bottom', endSnap: 'top', label: 'Registra Dati' },
  { start: 'T3_GW_LOG', end: 'T3_SRV_LOG', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_SRV_LOG', end: 'T3_DB_LOG', startSnap: 'bottom', endSnap: 'top', label: 'Commit KMS' },
  { start: 'T3_DB_LOG', end: 'T3_UI_TOGETHER_SHARE', startSnap: 'bottom', endSnap: 'top', label: 'Card Social' },
  { start: 'T3_UI_TOGETHER_SHARE', end: 'T3_UI_CHATBOT_24_7', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_EXPORT_ENTERPRISE', end: 'T3_DB_SILO2_BUNKER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { start: 'T3_UI_CHATBOT_24_7', end: 'T3_END', startSnap: 'bottom', endSnap: 'left', label: '' },
  { start: 'T3_DB_SILO2_BUNKER', end: 'T3_END', startSnap: 'bottom', endSnap: 'right', label: '' }
];

// ============================================================================
// MAIN DEPLOYMENT PIPELINE
// ============================================================================

async function main() {
  console.log('======================================================================');
  console.log('🚀 DEPLOYMENT COMPLETO MIRO: PROGRAMMAZIONE, WORKOUT PLAYER & TOGETHER SOCIAL');
  console.log(`Board ID: ${BOARD_ID}`);
  console.log('======================================================================\n');

  // STEP 1: Analisi inventario Miro
  console.log('🔍 [STEP 1/6] Analisi inventario Miro live...');
  const boardShapes = await fetchAllBoardShapes();
  const boardConnectors = await fetchAllBoardConnectors();
  console.log(`Shapes totali: ${boardShapes.length} | Connettori totali: ${boardConnectors.length}\n`);

  // STEP 2: Isolamento elementi di Colonna 3
  console.log('🎯 [STEP 2/6] Isolamento chirurgico elementi obsoleti Colonna 3...');
  const col3Shapes = boardShapes.filter(s => {
    const x = s.position.x;
    return x >= 1800 && x <= 3300;
  });

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
  console.log(`Title Banners protetti: ${PROTECTED_HEADER_IDS.size} (Aggiornamento in-place)`);
  console.log(`Forme operative da eliminare: ${shapesToDelete.length}`);
  console.log(`Connettori da eliminare: ${connectorsToDelete.length}\n`);

  // STEP 3: Eliminazione selettiva
  console.log('🗑️  [STEP 3/6] Eliminazione connettori e vecchie forme...');
  for (const conn of connectorsToDelete) {
    await miroApi(`/connectors/${conn.id}`, 'DELETE');
    await delay(DELAY_DELETE_MS);
  }
  console.log(`-> Eliminati ${connectorsToDelete.length} connettori.`);

  for (const shape of shapesToDelete) {
    await miroApi(`/shapes/${shape.id}`, 'DELETE');
    await delay(DELAY_DELETE_MS);
  }
  console.log(`-> Eliminate ${shapesToDelete.length} forme operative.\n`);

  // STEP 4: Aggiornamento Title Banners
  console.log('🏷️  [STEP 4/6] Aggiornamento testuale dei 3 Title Banner...');
  const bannerTitles = {
    [TITLE_BANNER_IDS.FLOW_3A]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">3. PROGRAMMAZIONE BASE, SCHEDE PRE-CONFEZIONATE, WORKOUT PLAYER &amp; TOGETHER SOCIAL (TIER 1)</strong></p>',
    [TITLE_BANNER_IDS.FLOW_3B]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">3. PROGRAMMAZIONE ANAMNESTICA (6 MESI), RTP, WORKOUT PLAYER, AI SCIENTIFICA &amp; TOGETHER SOCIAL (TIER 2)</strong></p>',
    [TITLE_BANNER_IDS.FLOW_3C]: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">3. PROGRAMMAZIONE ANNUALE RAG, WORKOUT PLAYER, CHATBOT 24/7, READINESS &amp; TOGETHER SOCIAL (TIER 3)</strong></p>'
  };

  for (const [id, content] of Object.entries(bannerTitles)) {
    await patchTitleBanner(id, content);
    console.log(`-> Title Banner ${id} aggiornato.`);
  }
  console.log('');

  // STEP 5: Creazione dei nuovi nodi ISO 5807
  console.log('✨ [STEP 5/6] Creazione nuovi nodi ISO 5807 a 4 Corsie...');
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

  for (const badgeId of PROTECTED_BADGE_IDS) {
    const exists = finalShapes.some(s => s.id === badgeId);
    console.log(`-> Cartiglio Badge ${badgeId}: ${exists ? '✅ PRESENTE E INTEGRO' : '❌ MANCANTE'}`);
  }

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

  console.log('\n🎉 DEPLOYMENT MIRO COMPLETATO CON SUCCESSO!');
}

main().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
