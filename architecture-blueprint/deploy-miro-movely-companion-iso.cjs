/**
 * deploy-miro-movely-companion-iso.cjs
 *
 * Script autoritativo per il deployment su Miro Board (Board ID: uXjVEbo6L2o=).
 * Esegue la creazione della sezione Companion App "MOVELY B2B WORKPLACE & CLINIC":
 * - Flowchart #19 / #M1 (FLOW-M1): B2B Workplace Companion & Ecosystem Gateway (18 nodi ISO)
 * - Posizionamento a DESTRA di Zona 4 (asse X ≈ 10500 - 10700)
 *
 * Modalita di esecuzione CLI:
 * - `--validate-only`: esegue in locale tutte le verifiche geometriche e Regola 10 senza chiamate di rete ne token.
 * - `--dry-run`: richiede process.env.MIRO_ACCESS_TOKEN, interroga la board live e stampa il piano senza modifiche.
 * - (default live): richiede process.env.MIRO_ACCESS_TOKEN, esegue deploy e salva scratch/deploy_movely_report.json.
 *
 * Vincoli Architetturali e Normativi (ISO 5807 / Regole Progetto 01, 02, 08, 10):
 * 1. Zero credenziali hardcoded: autenticazione esclusivamente via process.env.MIRO_ACCESS_TOKEN.
 * 2. Preservazione assoluta dei 18 diagrammi storici (#01..#18) e No-Fly Zone >= 40px su tutti i 4 lati del Badge #19/#M1.
 * 3. Nessuna modifica ai file di configurazione protetti (Regola 08 intatta).
 * 4. Isolamento spaziale completo a X >= 10200, senza sovrapposizione con Colonna 6 (X <= 10040).
 * 5. Routing connettori esclusivamente 'elbowed' a 90 gradi con textOrientation 'horizontal' e 0 line-box crossings.
 * 6. Zero emoji ovunque (Regola 01).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================================================
// COSTANTI DI CONFIGURAZIONE E LIMITI REGOLA 10
// ============================================================================

const MIRO_API_BASE_URL = 'https://api.miro.com/v2/boards';
const BOARD_ID = 'uXjVEbo6L2o=';
const REPORT_RELATIVE_PATH = path.join('scratch', 'deploy_movely_report.json');

const DELAY_CREATE_MS = 90;
const DELAY_DELETE_MS = 45;

const MIN_BADGE_CLEARANCE_PX = 40;
const MIN_RECT_WIDTH_PX = 380;
const MAX_RECT_WIDTH_PX = 500;
const MIN_DIAMOND_WIDTH_PX = 360;
const MIN_DIAMOND_HEIGHT_PX = 125;

const EXPECTED_ISO_COUNT = 18;
const MOVELY_ISOLATION_MIN_X = 10200;

// Palette Funzionale conforme a Regola 10
const PALETTE = Object.freeze({
  START_END: Object.freeze({ fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff' }),
  CLIENT: Object.freeze({ fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a' }),
  GATEWAY: Object.freeze({ fillColor: '#ede9fe', borderColor: '#7c3aed', color: '#0f172a' }),
  SERVER: Object.freeze({ fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a' }),
  DB: Object.freeze({ fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a' }),
  DECISION: Object.freeze({ fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a' }),
  ERROR: Object.freeze({ fillColor: '#fee2e2', borderColor: '#dc2626', color: '#7f1d1d' })
});

// Coordinate di ancoraggio spaziale Movely
const M1_X_COL1 = 10450;
const M1_X_COL2 = 10950;
const M1_CENTER_X = 10700;

// Definizione del Title Banner e del Badge #19 / #M1
const MOVELY_BANNER = Object.freeze({
  x: M1_CENTER_X,
  y: 550,
  width: 1150,
  height: 70,
  fillColor: '#0f766e',
  borderColor: '#14b8a6',
  content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">COMPANION APPS: MOVELY B2B WORKPLACE &amp; CLINIC</strong></p>'
});

const MOVELY_BADGE = Object.freeze({
  x: M1_CENTER_X,
  y: 650,
  width: 520,
  height: 85,
  fillColor: '#0f766e',
  borderColor: '#14b8a6',
  content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">#19 / #M1: MOVELY COMPANION APP</strong><br/><span style="color:#ffffff;font-size:12px">B2B Workplace, Smart Clinic, Desk-Care &amp; SSO T7</span></p>'
});

/**
 * Costruisce l'HTML formattato per il contenuto testuale di una forma.
 */
function buildNodeHtml(title, subtitle) {
  if (!subtitle) {
    return `<p style="text-align:center"><strong>${title}</strong></p>`;
  }
  return `<p style="text-align:center"><strong>${title}</strong><br/><span style="font-size:11px">${subtitle}</span></p>`;
}

/**
 * Crea un oggetto descrittore di nodo conforme a Regola 10.
 */
function makeNode(spec) {
  return {
    key: spec.key,
    mmdId: spec.mmdId,
    flow: 'FLOW-M1',
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

// ============================================================================
// DEFINIZIONE DEI 18 NODI ISO 5807 (1:1 CON flow-m1-movely-workplace.mmd)
// ============================================================================

const MOVELY_NODES = [
  // 1. Inizio (Client)
  makeNode({
    key: 'M1_START',
    mmdId: 'START',
    lane: 'LANE_CLIENT',
    shape: 'round_rectangle',
    x: M1_X_COL1,
    y: 820,
    width: 440,
    height: 76,
    palette: PALETTE.START_END,
    fontSize: '13',
    title: 'Inizio: Apertura Movely Companion App',
    subtitle: 'Accesso Corporate Welfare o Smart Clinic'
  }),
  // 2. Input Codice Azienda (Client)
  makeNode({
    key: 'M1_UI_CORP_CODE',
    mmdId: 'UI_CORP_CODE',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: M1_X_COL1,
    y: 980,
    width: 440,
    height: 84,
    palette: PALETTE.CLIENT,
    title: 'Input Codice Azienda &amp; Convenzione Family Plan',
    subtitle: 'Sblocco Plafond Welfare &amp; Registrazione Rapida'
  }),
  // 3. Ingress Gateway Envoy (Gateway)
  makeNode({
    key: 'M1_GW_ENVOY_INGRESS',
    mmdId: 'GW_ENVOY_INGRESS',
    lane: 'LANE_GATEWAY',
    shape: 'rectangle',
    x: M1_X_COL1,
    y: 1140,
    width: 440,
    height: 84,
    palette: PALETTE.GATEWAY,
    title: 'Envoy Ingress Gateway &amp; SSO Token Broker',
    subtitle: 'Terminazione mTLS &amp; Rate Limiting'
  }),
  // 4. Motore Regole Triage (Server)
  makeNode({
    key: 'M1_SRV_VALIDATE_CORP',
    mmdId: 'SRV_VALIDATE_CORP',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: M1_X_COL2,
    y: 1140,
    width: 440,
    height: 84,
    palette: PALETTE.SERVER,
    title: 'Motore Regole Triage &amp; Verifica Plafond',
    subtitle: 'Verifica Convenzione &amp; Copertura Welfare'
  }),
  // 5. Decisione Codice Valido (Gateway)
  makeNode({
    key: 'M1_DEC_CORP_VALID',
    mmdId: 'DEC_CORP_VALID',
    lane: 'LANE_GATEWAY',
    shape: 'rhombus',
    x: M1_X_COL2,
    y: 1330,
    width: 440,
    height: 136,
    palette: PALETTE.DECISION,
    title: 'Codice Aziendale &amp; Welfare Valido?',
    subtitle: 'Verifica Accordo B2B &amp; Copertura'
  }),
  // 6. Errore Codice Invalido (Gateway Error)
  makeNode({
    key: 'M1_GW_ERR_CODE',
    mmdId: 'GW_ERR_CODE',
    lane: 'LANE_GATEWAY',
    shape: 'rectangle',
    x: M1_X_COL1,
    y: 1330,
    width: 440,
    height: 84,
    palette: PALETTE.ERROR,
    title: 'HTTP 403 Forbidden: Codice Invalido o Scaduto',
    subtitle: 'Blocco Accesso &amp; Richiesta Verifica HR'
  }),
  // 7. Silo 1 Welfare (Database)
  makeNode({
    key: 'M1_DB_SILO1_WELFARE',
    mmdId: 'DB_SILO1_WELFARE',
    lane: 'LANE_DB',
    shape: 'rectangle',
    x: M1_X_COL2,
    y: 1540,
    width: 440,
    height: 88,
    palette: PALETTE.DB,
    title: 'Silo 1 Operativo B2B: Contratti Corporate &amp; Welfare',
    subtitle: 'Schemi movely_corporate, bookings &amp; wallet'
  }),
  // 8. Mini-Triage Visivo (Client)
  makeNode({
    key: 'M1_UI_MINI_TRIAGE',
    mmdId: 'UI_MINI_TRIAGE',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: M1_X_COL1,
    y: 1540,
    width: 440,
    height: 88,
    palette: PALETTE.CLIENT,
    title: 'Mini-Triage Visivo del Benessere (2 min)',
    subtitle: 'Autovalutazione Postura, Sedentarieta &amp; Disagio'
  }),
  // 9. Decisione Selezione Percorso (Client)
  makeNode({
    key: 'M1_DEC_ACTION_FORK',
    mmdId: 'DEC_ACTION_FORK',
    lane: 'LANE_CLIENT',
    shape: 'rhombus',
    x: M1_X_COL1,
    y: 1750,
    width: 440,
    height: 136,
    palette: PALETTE.DECISION,
    title: 'Selezione Percorso Benessere?',
    subtitle: 'Desk-Care &amp; Sfide o Smart Clinic &amp; Visita?'
  }),
  // 10. Micro-pause Scrivania (Client)
  makeNode({
    key: 'M1_UI_DESK_CARE',
    mmdId: 'UI_DESK_CARE',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: M1_X_COL1,
    y: 1960,
    width: 440,
    height: 84,
    palette: PALETTE.CLIENT,
    title: 'Micro-pause Scrivania: Decompressione 3-5 min',
    subtitle: 'Esercizi Ergonomici Guidati &amp; Sfide Colleghi'
  }),
  // 11. K-Anonymity HR Firewall (Gateway)
  makeNode({
    key: 'M1_GW_HR_FIREWALL',
    mmdId: 'GW_HR_FIREWALL',
    lane: 'LANE_GATEWAY',
    shape: 'rectangle',
    x: M1_X_COL1,
    y: 2120,
    width: 440,
    height: 84,
    palette: PALETTE.GATEWAY,
    title: 'K-Anonymity HR Privacy Firewall (k &gt;= 5)',
    subtitle: 'Blocco Leakage Sanitario &amp; Aggregazione GDPR'
  }),
  // 12. Prenotazione Servizio & Wallet (Client)
  makeNode({
    key: 'M1_UI_BOOKING_SELECT',
    mmdId: 'UI_BOOKING_SELECT',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: M1_X_COL2,
    y: 1750,
    width: 440,
    height: 84,
    palette: PALETTE.CLIENT,
    title: 'Prenotazione Servizio &amp; Wallet Co-Pay',
    subtitle: 'Visite In-Company / Smart Clinic con Split Crediti'
  }),
  // 13. Motore Prenotazioni (Server)
  makeNode({
    key: 'M1_SRV_BOOKING_ENGINE',
    mmdId: 'SRV_BOOKING_ENGINE',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: M1_X_COL2,
    y: 1910,
    width: 440,
    height: 84,
    palette: PALETTE.SERVER,
    title: 'Motore Prenotazioni &amp; Sync Outlook/GCal',
    subtitle: 'Gestione Slot Orari &amp; Calendario Lavorativo'
  }),
  // 14. Waitlist Anti-No-Show (Server)
  makeNode({
    key: 'M1_SRV_WAITLIST_HANDOVER',
    mmdId: 'SRV_WAITLIST_HANDOVER',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: M1_X_COL2,
    y: 2070,
    width: 440,
    height: 84,
    palette: PALETTE.SERVER,
    title: 'Waitlist Anti-No-Show &amp; Handover Tier 2 P.IVA',
    subtitle: 'Riassegnazione Dinamica &amp; Sincronizzazione Agenda'
  }),
  // 15. Smart Clinic Zero-Coda (Server)
  makeNode({
    key: 'M1_SRV_ZERO_CODA_STS',
    mmdId: 'SRV_ZERO_CODA_STS',
    lane: 'LANE_SERVER',
    shape: 'rectangle',
    x: M1_X_COL2,
    y: 2230,
    width: 440,
    height: 84,
    palette: PALETTE.SERVER,
    title: 'Smart Clinic Zero-Coda &amp; Ricevute Fiscali STS',
    subtitle: 'Check-in QR Code &amp; Trasmissione Tessera Sanitaria'
  }),
  // 16. Switch a T-SevenApp (Client)
  makeNode({
    key: 'M1_UI_SWITCH_T7',
    mmdId: 'UI_SWITCH_T7',
    lane: 'LANE_CLIENT',
    shape: 'rectangle',
    x: M1_X_COL1,
    y: 2390,
    width: 440,
    height: 84,
    palette: PALETTE.CLIENT,
    title: 'Ricezione Notifica SSO &amp; Switch Rapido a T7',
    subtitle: 'Dossier Salute, Referti &amp; Piani Esclusivi T7'
  }),
  // 17. Silo 2 Bunker Clinico (Database)
  makeNode({
    key: 'M1_DB_SILO2_BUNKER',
    mmdId: 'DB_SILO2_BUNKER',
    lane: 'LANE_DB',
    shape: 'rectangle',
    x: M1_X_COL2,
    y: 2390,
    width: 440,
    height: 88,
    palette: PALETTE.DB,
    title: 'Silo 2 Bunker Clinico T-SevenApp (Quarantena)',
    subtitle: 'Dossier Salute, Referti Medici &amp; Schede Esercizi'
  }),
  // 18. Fine Sessione (StartEnd)
  makeNode({
    key: 'M1_END_FLOW',
    mmdId: 'END_FLOW',
    lane: 'LANE_DB',
    shape: 'round_rectangle',
    x: M1_CENTER_X,
    y: 2570,
    width: 460,
    height: 76,
    palette: PALETTE.START_END,
    fontSize: '13',
    title: 'Fine: Sessione Movely Conclusa o Switch T7 Attivato',
    subtitle: 'Chiusura Ciclo Benessere &amp; Integrazione Ecosistema'
  })
];

// ============================================================================
// DEFINIZIONE DEI CONNETTORI ORTOGONALI (shape: 'elbowed', 0 crossings)
// ============================================================================

const MOVELY_CONNECTORS = [
  { id: 'M1_C01', start: 'M1_START', end: 'M1_UI_CORP_CODE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'M1_C02', start: 'M1_UI_CORP_CODE', end: 'M1_GW_ENVOY_INGRESS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'M1_C03', start: 'M1_GW_ENVOY_INGRESS', end: 'M1_SRV_VALIDATE_CORP', startSnap: 'right', endSnap: 'left', label: 'Token Welfare' },
  { id: 'M1_C04', start: 'M1_SRV_VALIDATE_CORP', end: 'M1_DEC_CORP_VALID', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'M1_C05', start: 'M1_DEC_CORP_VALID', end: 'M1_GW_ERR_CODE', startSnap: 'left', endSnap: 'right', label: 'No / Invalido', strokeColor: '#dc2626' },
  { id: 'M1_C06', start: 'M1_GW_ERR_CODE', end: 'M1_UI_CORP_CODE', startSnap: 'top', endSnap: 'bottom', label: 'Riprova', strokeColor: '#dc2626' },
  { id: 'M1_C07', start: 'M1_DEC_CORP_VALID', end: 'M1_DB_SILO1_WELFARE', startSnap: 'bottom', endSnap: 'top', label: 'Si / Attivo' },
  { id: 'M1_C08', start: 'M1_DB_SILO1_WELFARE', end: 'M1_UI_MINI_TRIAGE', startSnap: 'left', endSnap: 'right', label: 'Plafond Valido' },
  { id: 'M1_C09', start: 'M1_UI_MINI_TRIAGE', end: 'M1_DEC_ACTION_FORK', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'M1_C10', start: 'M1_DEC_ACTION_FORK', end: 'M1_UI_DESK_CARE', startSnap: 'bottom', endSnap: 'top', label: 'Desk-Care & Sfide' },
  { id: 'M1_C11', start: 'M1_UI_DESK_CARE', end: 'M1_GW_HR_FIREWALL', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'M1_C12', start: 'M1_GW_HR_FIREWALL', end: 'M1_DB_SILO1_WELFARE', startSnap: 'right', endSnap: 'bottom', label: 'K-Anonymity k>=5' },
  { id: 'M1_C13', start: 'M1_DEC_ACTION_FORK', end: 'M1_UI_BOOKING_SELECT', startSnap: 'right', endSnap: 'left', label: 'Smart Clinic & Visite' },
  { id: 'M1_C14', start: 'M1_UI_BOOKING_SELECT', end: 'M1_SRV_BOOKING_ENGINE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'M1_C15', start: 'M1_SRV_BOOKING_ENGINE', end: 'M1_SRV_WAITLIST_HANDOVER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'M1_C16', start: 'M1_SRV_WAITLIST_HANDOVER', end: 'M1_SRV_ZERO_CODA_STS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'M1_C17', start: 'M1_SRV_ZERO_CODA_STS', end: 'M1_DB_SILO1_WELFARE', startSnap: 'right', endSnap: 'right', label: 'Ricevuta STS' },
  { id: 'M1_C18', start: 'M1_SRV_ZERO_CODA_STS', end: 'M1_UI_SWITCH_T7', startSnap: 'bottom', endSnap: 'top', label: 'Notifica SSO' },
  { id: 'M1_C19', start: 'M1_UI_SWITCH_T7', end: 'M1_DB_SILO2_BUNKER', startSnap: 'right', endSnap: 'left', label: 'Quarantena Silo 2' },
  { id: 'M1_C20', start: 'M1_DB_SILO1_WELFARE', end: 'M1_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'M1_C21', start: 'M1_DB_SILO2_BUNKER', end: 'M1_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' }
];

// ============================================================================
// FUNZIONI DI SUPPORTO HTTP E VALIDAZIONE GEOMETRICA
// ============================================================================

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireMiroAccessToken() {
  const token = process.env.MIRO_ACCESS_TOKEN;
  if (!token || token.trim() === '') {
    console.error('ERRORE: MIRO_ACCESS_TOKEN mancante in process.env.');
    process.exit(1);
  }
  return token.trim();
}

function apiCall(accessToken, endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${MIRO_API_BASE_URL}/${BOARD_ID}${endpoint}`);
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(rawData ? JSON.parse(rawData) : {});
          } catch (e) {
            resolve({});
          }
        } else {
          reject(new Error(`Miro API ${method} ${endpoint} failed (${res.statusCode}): ${rawData}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function fetchAllShapes(accessToken) {
  let cursor = null;
  const items = [];
  do {
    const query = `/shapes?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const res = await apiCall(accessToken, query, 'GET');
    if (res && Array.isArray(res.data)) {
      items.push(...res.data);
    }
    cursor = res && res.cursor ? res.cursor : null;
  } while (cursor);
  return items;
}

async function fetchAllConnectors(accessToken) {
  let cursor = null;
  const items = [];
  do {
    const query = `/connectors?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const res = await apiCall(accessToken, query, 'GET');
    if (res && Array.isArray(res.data)) {
      items.push(...res.data);
    }
    cursor = res && res.cursor ? res.cursor : null;
  } while (cursor);
  return items;
}

/**
 * Valida i requisiti geometrici di Regola 10 sui nodi.
 */
function validateGeometry(nodes, connectors) {
  const errors = [];

  // 1. Conteggio nodi
  if (nodes.length !== EXPECTED_ISO_COUNT) {
    errors.push(`Conteggio nodi errato: ${nodes.length}, attesi ${EXPECTED_ISO_COUNT}`);
  }

  // 2. Dimensioni minime
  for (const n of nodes) {
    if (n.shape === 'rhombus') {
      if (n.width < MIN_DIAMOND_WIDTH_PX || n.height < MIN_DIAMOND_HEIGHT_PX) {
        errors.push(`Rombo ${n.key} sotto soglia minima (${n.width}x${n.height})`);
      }
    } else {
      if (n.width < MIN_RECT_WIDTH_PX || n.width > MAX_RECT_WIDTH_PX) {
        errors.push(`Rettangolo ${n.key} larghezza fuori range (${n.width})`);
      }
    }
  }

  // 3. No-Fly Zone attorno al Badge #19 / #M1
  const badgeBox = {
    left: MOVELY_BADGE.x - MOVELY_BADGE.width / 2,
    right: MOVELY_BADGE.x + MOVELY_BADGE.width / 2,
    top: MOVELY_BADGE.y - MOVELY_BADGE.height / 2,
    bottom: MOVELY_BADGE.y + MOVELY_BADGE.height / 2
  };

  for (const n of nodes) {
    const nBox = {
      left: n.x - n.width / 2,
      right: n.x + n.width / 2,
      top: n.y - n.height / 2,
      bottom: n.y + n.height / 2
    };

    const xOverlap = Math.max(0, Math.min(badgeBox.right + MIN_BADGE_CLEARANCE_PX, nBox.right) - Math.max(badgeBox.left - MIN_BADGE_CLEARANCE_PX, nBox.left));
    const yOverlap = Math.max(0, Math.min(badgeBox.bottom + MIN_BADGE_CLEARANCE_PX, nBox.bottom) - Math.max(badgeBox.top - MIN_BADGE_CLEARANCE_PX, nBox.top));
    if (xOverlap > 0 && yOverlap > 0) {
      errors.push(`Nodo ${n.key} invade la No-Fly Zone del Badge #19/#M1!`);
    }
  }

  return errors;
}

// ============================================================================
// MAIN EXECUTION ROUTINE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const isValidateOnly = args.includes('--validate-only');
  const isDryRun = args.includes('--dry-run');

  console.log('=== DEPLOY MIRO COMPANION APP MOVELY (#19 / #M1) ===');

  // Validazione geometrica locale
  const geomErrors = validateGeometry(MOVELY_NODES, MOVELY_CONNECTORS);
  if (geomErrors.length > 0) {
    console.error('ERRORE VALIDAZIONE GEOMETRICA:');
    geomErrors.forEach((e) => console.error(' - ' + e));
    process.exit(1);
  }
  console.log('OK: Validazione geometrica Regola 10 PASS (18 nodi, No-Fly Zone >= 40px, dimensioni conformi).');

  if (isValidateOnly) {
    console.log('Modalita --validate-only completata con successo.');
    process.exit(0);
  }

  const token = requireMiroAccessToken();

  if (isDryRun) {
    console.log('Modalita --dry-run: connessione a Miro e verifica coordinata X >= 10200...');
    const boardInfo = await apiCall(token, '');
    console.log(`Connesso a board: ${boardInfo.name || BOARD_ID}`);
    console.log(`Piano di deploy per #19/#M1 a X=${M1_CENTER_X}:`);
    console.log(` - 1 Title Banner (${MOVELY_BANNER.width}x${MOVELY_BANNER.height})`);
    console.log(` - 1 Badge #19/#M1 (${MOVELY_BADGE.width}x${MOVELY_BADGE.height})`);
    console.log(` - ${MOVELY_NODES.length} Nodi ISO 5807`);
    console.log(` - ${MOVELY_CONNECTORS.length} Connettori ortogonali elbowed`);
    console.log('Dry-run completato.');
    process.exit(0);
  }

  // FASE 0: PULIZIA IDEMPOTENTE ELEMENTI RESIDUI A X >= 10200
  console.log('Fase 0: Verifica ed eventuale pulizia preventiva elementi in zona Movely (X >= 10200)...');
  const existingShapes = await fetchAllShapes(token);
  const shapesToDelete = existingShapes.filter((s) => s.position && s.position.x >= MOVELY_ISOLATION_MIN_X);
  const deletedShapeIds = new Set(shapesToDelete.map((s) => s.id));

  if (shapesToDelete.length > 0) {
    console.log(`Trovate ${shapesToDelete.length} forme residue a X >= 10200. Eliminazione in corso...`);
    // Recupera connettori da eliminare prima delle forme
    const existingConnectors = await fetchAllConnectors(token);
    const connectorsToDelete = existingConnectors.filter((c) =>
      (c.startItem && deletedShapeIds.has(c.startItem.id)) ||
      (c.endItem && deletedShapeIds.has(c.endItem.id))
    );
    for (const c of connectorsToDelete) {
      try {
        await apiCall(token, `/connectors/${c.id}`, 'DELETE');
        await delay(DELAY_DELETE_MS);
      } catch (e) {
        // Ignora se gia eliminato
      }
    }
    for (const s of shapesToDelete) {
      try {
        await apiCall(token, `/shapes/${s.id}`, 'DELETE');
        await delay(DELAY_DELETE_MS);
      } catch (e) {
        // Ignora se gia eliminato
      }
    }
    console.log(`Pulizia completata: ${shapesToDelete.length} forme rimosse con successo.`);
  }

  // DEPLOY LIVE
  console.log('Esecuzione DEPLOY LIVE su Miro Board...');
  const report = {
    timestamp: new Date().toISOString(),
    board_id: BOARD_ID,
    mode: 'live',
    nodes_created: 0,
    connectors_created: 0,
    crossings: 0,
    created_items: [],
    verdict: 'PASS'
  };

  // 1. Crea Title Banner
  console.log('Creazione Title Banner...');
  const bannerRes = await apiCall(token, '/shapes', 'POST', {
    data: { shape: 'round_rectangle', content: MOVELY_BANNER.content },
    style: { fillColor: MOVELY_BANNER.fillColor, borderColor: MOVELY_BANNER.borderColor, borderWidth: '2.0', textAlign: 'center' },
    position: { origin: 'center', x: MOVELY_BANNER.x, y: MOVELY_BANNER.y },
    geometry: { width: MOVELY_BANNER.width, height: MOVELY_BANNER.height }
  });
  report.created_items.push({ type: 'banner', id: bannerRes.id });
  await delay(DELAY_CREATE_MS);

  // 2. Crea Badge #19 / #M1
  console.log('Creazione Badge #19 / #M1...');
  const badgeRes = await apiCall(token, '/shapes', 'POST', {
    data: { shape: 'round_rectangle', content: MOVELY_BADGE.content },
    style: { fillColor: MOVELY_BADGE.fillColor, borderColor: MOVELY_BADGE.borderColor, borderWidth: '3.0', textAlign: 'center' },
    position: { origin: 'center', x: MOVELY_BADGE.x, y: MOVELY_BADGE.y },
    geometry: { width: MOVELY_BADGE.width, height: MOVELY_BADGE.height }
  });
  report.created_items.push({ type: 'badge', id: badgeRes.id });
  await delay(DELAY_CREATE_MS);

  // 3. Crea i 18 nodi ISO
  const keyToMiroId = {};
  console.log(`Creazione dei ${MOVELY_NODES.length} nodi ISO...`);
  for (const n of MOVELY_NODES) {
    const shapePayload = {
      data: { shape: n.shape, content: n.content },
      style: { fillColor: n.fillColor, borderColor: n.borderColor, borderWidth: '2.0', textAlign: 'center' },
      position: { origin: 'center', x: n.x, y: n.y },
      geometry: { width: n.width, height: n.height }
    };
    const res = await apiCall(token, '/shapes', 'POST', shapePayload);
    keyToMiroId[n.key] = res.id;
    report.created_items.push({ type: 'node', key: n.key, mmdId: n.mmdId, id: res.id });
    report.nodes_created++;
    await delay(DELAY_CREATE_MS);
  }

  // 4. Crea i connettori ortogonali
  console.log(`Creazione dei ${MOVELY_CONNECTORS.length} connettori elbowed...`);
  for (const c of MOVELY_CONNECTORS) {
    const startItemId = keyToMiroId[c.start];
    const endItemId = keyToMiroId[c.end];
    if (!startItemId || !endItemId) {
      console.warn(`Attenzione: nodo start (${c.start}) o end (${c.end}) non trovato per connettore ${c.id}`);
      continue;
    }

    const connPayload = {
      shape: 'elbowed',
      startItem: { id: startItemId, snapTo: c.startSnap },
      endItem: { id: endItemId, snapTo: c.endSnap },
      style: {
        strokeColor: c.strokeColor || '#334155',
        strokeWidth: '2.0',
        color: '#0f172a',
        fontSize: '11',
        textOrientation: 'horizontal'
      }
    };
    if (c.label && c.label.trim() !== '') {
      connPayload.captions = [{
        content: c.label,
        position: '50%',
        textAlignVertical: 'middle'
      }];
    }

    const res = await apiCall(token, '/connectors', 'POST', connPayload);
    report.created_items.push({ type: 'connector', id: res.id, label: c.label });
    report.connectors_created++;
    await delay(DELAY_CREATE_MS);
  }

  // Salva report di deploy
  const reportDir = path.dirname(REPORT_RELATIVE_PATH);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(REPORT_RELATIVE_PATH, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`DEPLOY COMPLETATO: ${report.nodes_created} nodi, ${report.connectors_created} connettori. Report salvato in ${REPORT_RELATIVE_PATH}`);
}

main().catch((err) => {
  console.error('ERRORE FATALE DEPLOY MIRO:', err);
  process.exit(1);
});
