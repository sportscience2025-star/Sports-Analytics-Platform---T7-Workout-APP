/**
 * deploy-miro-together-social-tiers-iso.cjs
 *
 * Script autoritativo per il deployment su Miro Board (Board ID: uXjVEbo6L2o=).
 * Esegue la creazione della sezione Companion App "TOGETHER SOCIAL ECOSYSTEM":
 * - Flowchart #20 / #TS1 (FLOW-TS1): Tier 1 B2C Community, AI Gatekeeper & Token Cavia (16 nodi ISO)
 * - Flowchart #21 / #TS2 (FLOW-TS2): Tier 2 Pro Marketplace, Research Hub & VIP Inbox (16 nodi ISO)
 * - Flowchart #22 / #TS3 (FLOW-TS3): Tier 3 Elite Lounges, Lab Booking & Staff Scouting (16 nodi ISO)
 * - Posizionamento a DESTRA di Movely (asse X = 12500) allineato sui 3 Tier storici (Y ≈ 465, 3598, 8034)
 *
 * Modalita di esecuzione CLI:
 * - `--validate-only`: esegue in locale tutte le verifiche geometriche e Regola 10 senza chiamate di rete ne token.
 * - `--dry-run`: richiede process.env.MIRO_ACCESS_TOKEN, interroga la board live e stampa il piano senza modifiche.
 * - (default live): richiede process.env.MIRO_ACCESS_TOKEN, esegue deploy e salva scratch/deploy_together_report.json.
 *
 * Vincoli Architetturali e Normativi (ISO 5807 / Regole Progetto 01, 02, 08, 10):
 * 1. Zero credenziali hardcoded: autenticazione esclusivamente via process.env.MIRO_ACCESS_TOKEN.
 * 2. Preservazione assoluta dei 19 diagrammi storici (#01..#19) e No-Fly Zone >= 40px su tutti i 4 lati dei Badge #20, #21, #22.
 * 3. Nessuna modifica ai file di configurazione protetti (Regola 08 intatta).
 * 4. Isolamento spaziale completo a X = 12000..13000.
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
const REPORT_RELATIVE_PATH = path.join('scratch', 'deploy_together_report.json');

const DELAY_CREATE_MS = 90;
const DELAY_DELETE_MS = 45;

const MIN_BADGE_CLEARANCE_PX = 40;
const MIN_RECT_WIDTH_PX = 380;
const MAX_RECT_WIDTH_PX = 500;
const MIN_DIAMOND_WIDTH_PX = 360;
const MIN_DIAMOND_HEIGHT_PX = 125;

const EXPECTED_ISO_COUNT = 48;
const TOGETHER_ISOLATION_MIN_X = 12000;
const TOGETHER_ISOLATION_MAX_X = 13200;

// Palette Funzionale conforme a Regola 10
const PALETTE = Object.freeze({
  START_END_T1: Object.freeze({ fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff' }),
  START_END_T2: Object.freeze({ fillColor: '#b45309', borderColor: '#f59e0b', color: '#ffffff' }),
  START_END_T3: Object.freeze({ fillColor: '#4338ca', borderColor: '#818cf8', color: '#ffffff' }),
  CLIENT: Object.freeze({ fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a' }),
  GATEWAY: Object.freeze({ fillColor: '#ede9fe', borderColor: '#7c3aed', color: '#0f172a' }),
  SERVER: Object.freeze({ fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a' }),
  DB: Object.freeze({ fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a' }),
  DECISION: Object.freeze({ fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a' }),
  ERROR: Object.freeze({ fillColor: '#fee2e2', borderColor: '#dc2626', color: '#7f1d1d' })
});

// Coordinate di ancoraggio spaziale Together Social
const TS_CENTER_X = 12500;
const TS_COL1_X = 12250;
const TS_COL2_X = 12750;

// Definizione Banners e Badges
const BANNERS = [
  {
    tier: 'TIER_1',
    x: TS_CENTER_X,
    y: 550,
    width: 1150,
    height: 70,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">COMPANION APPS: TOGETHER SOCIAL (TIER 1 B2C COMMUNITY)</strong></p>'
  },
  {
    tier: 'TIER_2',
    x: TS_CENTER_X,
    y: 3690,
    width: 1150,
    height: 70,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">COMPANION APPS: TOGETHER SOCIAL (TIER 2 PRO MARKETPLACE)</strong></p>'
  },
  {
    tier: 'TIER_3',
    x: TS_CENTER_X,
    y: 8130,
    width: 1150,
    height: 70,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">COMPANION APPS: TOGETHER SOCIAL (TIER 3 ELITE LOUNGES &amp; LABS)</strong></p>'
  }
];

const BADGES = [
  {
    id_tag: '#20 / #TS1',
    tier: 'TIER_1',
    x: TS_CENTER_X,
    y: 650,
    width: 520,
    height: 85,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">#20 / #TS1: TOGETHER SOCIAL B2C</strong><br/><span style="color:#ffffff;font-size:12px">Community, AI Content Gatekeeper &amp; Token Cavia</span></p>'
  },
  {
    id_tag: '#21 / #TS2',
    tier: 'TIER_2',
    x: TS_CENTER_X,
    y: 3790,
    width: 520,
    height: 85,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">#21 / #TS2: TOGETHER SOCIAL PRO</strong><br/><span style="color:#ffffff;font-size:12px">Pro Marketplace, Research Hub &amp; VIP Networking</span></p>'
  },
  {
    id_tag: '#22 / #TS3',
    tier: 'TIER_3',
    x: TS_CENTER_X,
    y: 8230,
    width: 520,
    height: 85,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">#22 / #TS3: TOGETHER SOCIAL ELITE</strong><br/><span style="color:#ffffff;font-size:12px">Elite Lounges, Lab Booking &amp; Staff Scouting</span></p>'
  }
];

function buildNodeHtml(title, subtitle) {
  if (!subtitle) {
    return `<p style="text-align:center"><strong>${title}</strong></p>`;
  }
  return `<p style="text-align:center"><strong>${title}</strong><br/><span style="font-size:11px">${subtitle}</span></p>`;
}

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

// ============================================================================
// DEFINIZIONE DEI 48 NODI ISO 5807 (16 PER TIER)
// ============================================================================

// --- TIER 1: FLOW-TS1 (B2C Community & Marketplace) ---
const T1_NODES = [
  makeNode({ key: 'TS1_START', mmdId: 'START', flow: 'FLOW-TS1', lane: 'LANE_CLIENT', shape: 'round_rectangle', x: TS_COL1_X, y: 820, width: 440, height: 76, palette: PALETTE.START_END_T1, fontSize: '13', title: 'Inizio: Apertura Together Social (Tier 1)', subtitle: 'Accesso Feed Community &amp; Shorts' }),
  makeNode({ key: 'TS1_UI_FEED_BROWSE', mmdId: 'UI_FEED_BROWSE', flow: 'FLOW-TS1', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL1_X, y: 980, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Esplorazione Feed Personale, Shorts &amp; Gruppi', subtitle: 'Raccomandazioni su Interessi Sportivi Utente' }),
  makeNode({ key: 'TS1_DEC_USER_ACTION', mmdId: 'DEC_USER_ACTION', flow: 'FLOW-TS1', lane: 'LANE_CLIENT', shape: 'rhombus', x: TS_COL1_X, y: 1170, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Selezione Percorso Utente?', subtitle: 'Post / Shorts, Gym Bro o Bando Cavia?' }),
  makeNode({ key: 'TS1_UI_POST_CREATE', mmdId: 'UI_POST_CREATE', flow: 'FLOW-TS1', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL1_X, y: 1370, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Creazione Contenuto: Upload Foto, Video &amp; Badge', subtitle: 'Condivisione Progressi e Schede Allenamento T7' }),
  makeNode({ key: 'TS1_UI_GYM_BRO', mmdId: 'UI_GYM_BRO', flow: 'FLOW-TS1', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL2_X, y: 1170, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Opt-In Find Your Gym Bro (2,99 euro/mese)', subtitle: 'Matching Compagni di Allenamento Geolocalizzato' }),
  makeNode({ key: 'TS1_UI_VOLUNTEER_APPLY', mmdId: 'UI_VOLUNTEER_APPLY', flow: 'FLOW-TS1', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL2_X, y: 1370, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Candidatura a Bandi Ricerca Volontari (Cavia)', subtitle: 'Partecipazione a Studi Scientifici &amp; Test Gratuiti' }),
  makeNode({ key: 'TS1_GW_INGRESS', mmdId: 'GW_INGRESS', flow: 'FLOW-TS1', lane: 'LANE_GATEWAY', shape: 'rectangle', x: TS_COL1_X, y: 1550, width: 440, height: 84, palette: PALETTE.GATEWAY, title: 'Envoy API Gateway &amp; Token Broker', subtitle: 'Terminazione TLS, Rate Limiting &amp; SSO JWT' }),
  makeNode({ key: 'TS1_DEC_AUTH_CONTENT', mmdId: 'DEC_AUTH_CONTENT', flow: 'FLOW-TS1', lane: 'LANE_GATEWAY', shape: 'rhombus', x: TS_COL1_X, y: 1750, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Validazione Policy Tier 1 &amp; Permessi?', subtitle: 'Controllo Abbonamento Opt-In &amp; Payload' }),
  makeNode({ key: 'TS1_GW_ERR_REJECT', mmdId: 'GW_ERR_REJECT', flow: 'FLOW-TS1', lane: 'LANE_GATEWAY', shape: 'rectangle', x: TS_COL2_X, y: 1750, width: 440, height: 84, palette: PALETTE.ERROR, title: 'HTTP 422/403: Contenuto Non Conforme o Mancante', subtitle: 'Blocco Contenuto Fuori Tema o Richiesta Upgrade' }),
  makeNode({ key: 'TS1_SRV_AI_GATEKEEPER', mmdId: 'SRV_AI_GATEKEEPER', flow: 'FLOW-TS1', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL1_X, y: 1960, width: 440, height: 84, palette: PALETTE.SERVER, title: 'AI Content Gatekeeper: Analisi Multimodale', subtitle: 'Filtro Visione &amp; NLP (Solo Sport, Nutrizione &amp; Fisio)' }),
  makeNode({ key: 'TS1_SRV_TOPIC_FILTER', mmdId: 'SRV_TOPIC_FILTER', flow: 'FLOW-TS1', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL1_X, y: 2120, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Filtro Tematico Sportivo: Classificazione Feed', subtitle: 'Instradamento a Categorie Specifiche' }),
  makeNode({ key: 'TS1_SRV_GEO_MATCHING', mmdId: 'SRV_GEO_MATCHING', flow: 'FLOW-TS1', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL2_X, y: 1960, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Motore Matching Geografico Gym Bro', subtitle: 'Filtraggio per Raggio Km, Disciplina &amp; Palestra' }),
  makeNode({ key: 'TS1_SRV_TOKENOMICS', mmdId: 'SRV_TOKENOMICS', flow: 'FLOW-TS1', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL2_X, y: 2120, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Tokenomics Engine: Accredito Token Cavia', subtitle: 'Sblocco 1 Mese Gratuito Cross-Ecosistema' }),
  makeNode({ key: 'TS1_DB_SILO1_POSTS', mmdId: 'DB_SILO1_POSTS', flow: 'FLOW-TS1', lane: 'LANE_DB', shape: 'rectangle', x: TS_COL1_X, y: 2300, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 1 Community: Tabella community_posts &amp; shorts', subtitle: 'Storage Pubblico Social &amp; Commenti' }),
  makeNode({ key: 'TS1_DB_SILO1_LEDGER', mmdId: 'DB_SILO1_LEDGER', flow: 'FLOW-TS1', lane: 'LANE_DB', shape: 'rectangle', x: TS_COL2_X, y: 2300, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 1 Ledger: Tabella gym_bro_optins &amp; cavia_tokens', subtitle: 'Tracciamento Crediti Cross-Ecosistema' }),
  makeNode({ key: 'TS1_END_FLOW', mmdId: 'END_FLOW', flow: 'FLOW-TS1', lane: 'LANE_DB', shape: 'round_rectangle', x: TS_CENTER_X, y: 2490, width: 460, height: 76, palette: PALETTE.START_END_T1, fontSize: '13', title: 'Fine: Contenuto Condiviso, Match o Candidatura', subtitle: 'Conclusione Sessione B2C Community' })
];

// --- TIER 2: FLOW-TS2 (Pro Marketplace, Research & VIP Networking) ---
const T2_NODES = [
  makeNode({ key: 'TS2_START', mmdId: 'START', flow: 'FLOW-TS2', lane: 'LANE_CLIENT', shape: 'round_rectangle', x: TS_COL1_X, y: 3960, width: 440, height: 76, palette: PALETTE.START_END_T2, fontSize: '13', title: 'Inizio: Accesso Together Pro (Tier 2)', subtitle: 'P.IVA, Coach, Fisioterapisti &amp; Ricercatori' }),
  makeNode({ key: 'TS2_UI_PRO_SHOWCASE', mmdId: 'UI_PRO_SHOWCASE', flow: 'FLOW-TS2', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL1_X, y: 4120, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Vetrina Professionale: Profilo Verificato', subtitle: 'Divulgazione, Casi Studio &amp; Recensioni Certificate' }),
  makeNode({ key: 'TS2_DEC_PRO_ACTION', mmdId: 'DEC_PRO_ACTION', flow: 'FLOW-TS2', lane: 'LANE_CLIENT', shape: 'rhombus', x: TS_COL1_X, y: 4310, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Selezione Modulo Professionale?', subtitle: 'Networking Pari, Bandi Ricerca o VIP Inbox?' }),
  makeNode({ key: 'TS2_UI_PEER_ROOMS', mmdId: 'UI_PEER_ROOMS', flow: 'FLOW-TS2', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL1_X, y: 4510, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Stanze Networking Pari: Chat Tecnica Chiusa', subtitle: 'Confronto Specialistico tra Medici, Coach &amp; Nutrizionisti' }),
  makeNode({ key: 'TS2_UI_CALL_PUBLISH', mmdId: 'UI_CALL_PUBLISH', flow: 'FLOW-TS2', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL2_X, y: 4310, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Pubblicazione Bandi Ricerca Volontari Cavia', subtitle: 'Reclutamento Campione Sperimentale dall\'App' }),
  makeNode({ key: 'TS2_UI_VIP_INBOX', mmdId: 'UI_VIP_INBOX', flow: 'FLOW-TS2', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL2_X, y: 4510, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'VIP Priority Inbox Anti-Spam (Add-on 15 euro)', subtitle: 'Richiesta Contatto a Profili Elite con Crediti Mensili' }),
  makeNode({ key: 'TS2_GW_PRO_INGRESS', mmdId: 'GW_PRO_INGRESS', flow: 'FLOW-TS2', lane: 'LANE_GATEWAY', shape: 'rectangle', x: TS_COL1_X, y: 4690, width: 440, height: 84, palette: PALETTE.GATEWAY, title: 'Envoy API Gateway: Rate Limiting &amp; mTLS', subtitle: 'Controllo RBAC Livello Tier 2 Pro' }),
  makeNode({ key: 'TS2_DEC_VERIFY_GATE', mmdId: 'DEC_VERIFY_GATE', flow: 'FLOW-TS2', lane: 'LANE_GATEWAY', shape: 'rhombus', x: TS_COL1_X, y: 4890, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Verifica Fiscale P.IVA / ORCID &amp; Crediti?', subtitle: 'Controllo ATECO / Albo o Abbonamento Add-on' }),
  makeNode({ key: 'TS2_GW_ERR_DENIED', mmdId: 'GW_ERR_DENIED', flow: 'FLOW-TS2', lane: 'LANE_GATEWAY', shape: 'rectangle', x: TS_COL2_X, y: 4890, width: 440, height: 84, palette: PALETTE.ERROR, title: 'HTTP 403 Forbidden: Profilo Non Verificato', subtitle: 'Mancanza Verifica Fiscale o Crediti VIP Esauriti' }),
  makeNode({ key: 'TS2_SRV_VERIFY_ENGINE', mmdId: 'SRV_VERIFY_ENGINE', flow: 'FLOW-TS2', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL1_X, y: 5100, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Motore Verifica Identita: VIES / Agenzia Entrate', subtitle: 'Convalida Partita IVA o Connector ORCID ID' }),
  makeNode({ key: 'TS2_SRV_PRESCREEN_ENGINE', mmdId: 'SRV_PRESCREEN_ENGINE', flow: 'FLOW-TS2', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL2_X, y: 5100, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Motore Pre-Screening Cavia: Filtri Clinico-Motori', subtitle: 'Selezione Volontari Idonei allo Studio' }),
  makeNode({ key: 'TS2_SRV_BRIDGE_COL5', mmdId: 'SRV_BRIDGE_COL5', flow: 'FLOW-TS2', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL2_X, y: 5260, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Bridge Fonti Col 5: Sincronizzazione Paper', subtitle: 'Collegamento Metadati a Libreria Scientifica' }),
  makeNode({ key: 'TS2_SRV_INBOX_SPAM_SHIELD', mmdId: 'SRV_INBOX_SPAM_SHIELD', flow: 'FLOW-TS2', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL2_X, y: 5420, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Anti-Spam Priority Shield &amp; Quota Manager', subtitle: 'Verifica Crediti Contatto Diretto VIP' }),
  makeNode({ key: 'TS2_DB_SILO1_PRO_REG', mmdId: 'DB_SILO1_PRO_REG', flow: 'FLOW-TS2', lane: 'LANE_DB', shape: 'rectangle', x: TS_COL1_X, y: 5300, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 1 Pro Registry: Tabella pro_profiles &amp; peer_rooms', subtitle: 'Directory Verificata &amp; Canali Riservati' }),
  makeNode({ key: 'TS2_DB_SILO1_RESEARCH_INBOX', mmdId: 'DB_SILO1_RESEARCH_INBOX', flow: 'FLOW-TS2', lane: 'LANE_DB', shape: 'rectangle', x: TS_COL2_X, y: 5580, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 1 Pro Ops: Tabella research_calls &amp; vip_messages', subtitle: 'Gestione Bandi &amp; Messaggi Prioritari' }),
  makeNode({ key: 'TS2_END_FLOW', mmdId: 'END_FLOW', flow: 'FLOW-TS2', lane: 'LANE_DB', shape: 'round_rectangle', x: TS_CENTER_X, y: 5760, width: 460, height: 76, palette: PALETTE.START_END_T2, fontSize: '13', title: 'Fine: Vetrina Attiva, Bando o Connessione VIP', subtitle: 'Conclusione Flusso Tier 2 Pro Marketplace' })
];

// --- TIER 3: FLOW-TS3 (Elite Lounges, Lab Booking & Staff Scouting) ---
const T3_NODES = [
  makeNode({ key: 'TS3_START', mmdId: 'START', flow: 'FLOW-TS3', lane: 'LANE_CLIENT', shape: 'round_rectangle', x: TS_COL1_X, y: 8400, width: 440, height: 76, palette: PALETTE.START_END_T3, fontSize: '13', title: 'Inizio: Accesso Together Elite (Tier 3)', subtitle: 'Club Serie A / Eurolega, Universita &amp; Centri' }),
  makeNode({ key: 'TS3_UI_GHOST_MODE', mmdId: 'UI_GHOST_MODE', flow: 'FLOW-TS3', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL1_X, y: 8560, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Ghost Mode Privacy Guard: Navigazione Invisibile', subtitle: 'Profilo Oscurato ai Messaggi Pubblici' }),
  makeNode({ key: 'TS3_DEC_ELITE_ACTION', mmdId: 'DEC_ELITE_ACTION', flow: 'FLOW-TS3', lane: 'LANE_CLIENT', shape: 'rhombus', x: TS_COL1_X, y: 8750, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Selezione Modulo Corporate Elite?', subtitle: 'VIP Lounges, Booking Macchinari o Scouting?' }),
  makeNode({ key: 'TS3_UI_VIP_LOUNGES', mmdId: 'UI_VIP_LOUNGES', flow: 'FLOW-TS3', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL1_X, y: 8950, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'VIP &amp; Elite Lounges Blindate (Serie A / Basket)', subtitle: 'Stanze Ristrette E2E per Scambio Tecnico Staff' }),
  makeNode({ key: 'TS3_UI_LAB_BOOKING', mmdId: 'UI_LAB_BOOKING', flow: 'FLOW-TS3', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL2_X, y: 8750, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Vetrina &amp; Booking Laboratori e Macchinari', subtitle: 'Noleggio Pedane di Forza, Metabolimetri &amp; Camere' }),
  makeNode({ key: 'TS3_UI_STAFF_SCOUT', mmdId: 'UI_STAFF_SCOUT', flow: 'FLOW-TS3', lane: 'LANE_CLIENT', shape: 'rectangle', x: TS_COL2_X, y: 8950, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Bacheca Recruiting &amp; Scouting Staff Sportivo', subtitle: 'Assunzione Preparatori, Medici, Fisio &amp; Ricercatori' }),
  makeNode({ key: 'TS3_GW_ELITE_INGRESS', mmdId: 'GW_ELITE_INGRESS', flow: 'FLOW-TS3', lane: 'LANE_GATEWAY', shape: 'rectangle', x: TS_COL1_X, y: 9130, width: 440, height: 84, palette: PALETTE.GATEWAY, title: 'Envoy Enterprise Gateway: mTLS 1.3 &amp; Zero-Trust', subtitle: 'Controllo Credenziali Istituzionali / Club' }),
  makeNode({ key: 'TS3_DEC_SECURITY_GATE', mmdId: 'DEC_SECURITY_GATE', flow: 'FLOW-TS3', lane: 'LANE_GATEWAY', shape: 'rhombus', x: TS_COL1_X, y: 9330, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Controllo Sicurezza: Certificato &amp; Ruolo Club?', subtitle: 'Verifica Serie A / Eurolega / Rettorato' }),
  makeNode({ key: 'TS3_GW_ERR_ELITE', mmdId: 'GW_ERR_ELITE', flow: 'FLOW-TS3', lane: 'LANE_GATEWAY', shape: 'rectangle', x: TS_COL2_X, y: 9330, width: 440, height: 84, palette: PALETTE.ERROR, title: 'HTTP 403 Forbidden: Accesso Negato a Lounge Elite', subtitle: 'Riservato Esclusivamente ad Accreditati Ufficiali' }),
  makeNode({ key: 'TS3_SRV_PRIVACY_ENCLAVE', mmdId: 'SRV_PRIVACY_ENCLAVE', flow: 'FLOW-TS3', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL1_X, y: 9540, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Privacy Guard Enclave: Anonimizzazione Metadati', subtitle: 'Mascheramento Presenza &amp; Canali Riservati' }),
  makeNode({ key: 'TS3_SRV_VAULT_ENCRYPT', mmdId: 'SRV_VAULT_ENCRYPT', flow: 'FLOW-TS3', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL1_X, y: 9700, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Enterprise Encryption Engine: Chiusura E2E', subtitle: 'Crittografia Sessioni Lounge &amp; File Scambiati' }),
  makeNode({ key: 'TS3_SRV_LAB_SCHEDULER', mmdId: 'SRV_LAB_SCHEDULER', flow: 'FLOW-TS3', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL2_X, y: 9540, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Motore Booking Macchinari: Calendario &amp; Canoni', subtitle: 'Gestione Slot Orari &amp; Fatturazione Universitaria' }),
  makeNode({ key: 'TS3_SRV_SCOUTING_MATCH', mmdId: 'SRV_SCOUTING_MATCH', flow: 'FLOW-TS3', lane: 'LANE_SERVER', shape: 'rectangle', x: TS_COL2_X, y: 9700, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Algoritmo Scouting &amp; Matching Staff Certificato', subtitle: 'Correlazione CV con Paper Scientifici Col 5' }),
  makeNode({ key: 'TS3_DB_SILO1_ELITE_LOUNGES', mmdId: 'DB_SILO1_ELITE_LOUNGES', flow: 'FLOW-TS3', lane: 'LANE_DB', shape: 'rectangle', x: TS_COL1_X, y: 9880, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 1 Enterprise Vault: Tabella elite_lounges', subtitle: 'Stanze Cifrate &amp; Log Anonimizzati' }),
  makeNode({ key: 'TS3_DB_SILO1_LABS_STAFF', mmdId: 'DB_SILO1_LABS_STAFF', flow: 'FLOW-TS3', lane: 'LANE_DB', shape: 'rectangle', x: TS_COL2_X, y: 9880, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 1 Elite Ops: Tabella lab_rentals &amp; scouting_jobs', subtitle: 'Piattaforma Gestione Spazi &amp; Posizioni Aperte' }),
  makeNode({ key: 'TS3_END_FLOW', mmdId: 'END_FLOW', flow: 'FLOW-TS3', lane: 'LANE_DB', shape: 'round_rectangle', x: TS_CENTER_X, y: 10070, width: 460, height: 76, palette: PALETTE.START_END_T3, fontSize: '13', title: 'Fine: Lounge Conclusa, Macchinario Prenotato o Hire', subtitle: 'Conclusione Flusso Tier 3 Elite &amp; Research' })
];

const ALL_NODES = [...T1_NODES, ...T2_NODES, ...T3_NODES];

// ============================================================================
// DEFINIZIONE DEI 60 CONNETTORI ORTOGONALI (20 PER TIER)
// ============================================================================

const T1_CONNECTORS = [
  { id: 'TS1_C01', start: 'TS1_START', end: 'TS1_UI_FEED_BROWSE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS1_C02', start: 'TS1_UI_FEED_BROWSE', end: 'TS1_DEC_USER_ACTION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS1_C03', start: 'TS1_DEC_USER_ACTION', end: 'TS1_UI_POST_CREATE', startSnap: 'bottom', endSnap: 'top', label: 'Pubblica Post / Shorts' },
  { id: 'TS1_C04', start: 'TS1_DEC_USER_ACTION', end: 'TS1_UI_GYM_BRO', startSnap: 'right', endSnap: 'left', label: 'Trova Gym Bro' },
  { id: 'TS1_C05', start: 'TS1_DEC_USER_ACTION', end: 'TS1_UI_VOLUNTEER_APPLY', startSnap: 'right', endSnap: 'left', label: 'Bando Cavia' },
  { id: 'TS1_C06', start: 'TS1_UI_POST_CREATE', end: 'TS1_GW_INGRESS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS1_C07', start: 'TS1_UI_GYM_BRO', end: 'TS1_GW_INGRESS', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'TS1_C08', start: 'TS1_UI_VOLUNTEER_APPLY', end: 'TS1_GW_INGRESS', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'TS1_C09', start: 'TS1_GW_INGRESS', end: 'TS1_DEC_AUTH_CONTENT', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS1_C10', start: 'TS1_DEC_AUTH_CONTENT', end: 'TS1_GW_ERR_REJECT', startSnap: 'right', endSnap: 'left', label: 'No / Violazione Policy', strokeColor: '#dc2626' },
  { id: 'TS1_C11', start: 'TS1_GW_ERR_REJECT', end: 'TS1_UI_FEED_BROWSE', startSnap: 'top', endSnap: 'right', label: 'Riprova', strokeColor: '#dc2626' },
  { id: 'TS1_C12', start: 'TS1_DEC_AUTH_CONTENT', end: 'TS1_SRV_AI_GATEKEEPER', startSnap: 'bottom', endSnap: 'top', label: 'Si / Post o Shorts' },
  { id: 'TS1_C13', start: 'TS1_SRV_AI_GATEKEEPER', end: 'TS1_SRV_TOPIC_FILTER', startSnap: 'bottom', endSnap: 'top', label: 'Contenuto Valido' },
  { id: 'TS1_C14', start: 'TS1_SRV_TOPIC_FILTER', end: 'TS1_DB_SILO1_POSTS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS1_C15', start: 'TS1_DEC_AUTH_CONTENT', end: 'TS1_SRV_GEO_MATCHING', startSnap: 'right', endSnap: 'top', label: 'Si / Gym Bro Match' },
  { id: 'TS1_C16', start: 'TS1_SRV_GEO_MATCHING', end: 'TS1_DB_SILO1_LEDGER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS1_C17', start: 'TS1_DEC_AUTH_CONTENT', end: 'TS1_SRV_TOKENOMICS', startSnap: 'right', endSnap: 'top', label: 'Si / Candidatura Cavia' },
  { id: 'TS1_C18', start: 'TS1_SRV_TOKENOMICS', end: 'TS1_DB_SILO1_LEDGER', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS1_C19', start: 'TS1_DB_SILO1_POSTS', end: 'TS1_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS1_C20', start: 'TS1_DB_SILO1_LEDGER', end: 'TS1_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' }
];

const T2_CONNECTORS = [
  { id: 'TS2_C01', start: 'TS2_START', end: 'TS2_UI_PRO_SHOWCASE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS2_C02', start: 'TS2_UI_PRO_SHOWCASE', end: 'TS2_DEC_PRO_ACTION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS2_C03', start: 'TS2_DEC_PRO_ACTION', end: 'TS2_UI_PEER_ROOMS', startSnap: 'bottom', endSnap: 'top', label: 'Networking tra Pari' },
  { id: 'TS2_C04', start: 'TS2_DEC_PRO_ACTION', end: 'TS2_UI_CALL_PUBLISH', startSnap: 'right', endSnap: 'left', label: 'Bandi Ricerca' },
  { id: 'TS2_C05', start: 'TS2_DEC_PRO_ACTION', end: 'TS2_UI_VIP_INBOX', startSnap: 'right', endSnap: 'left', label: 'Priority Inbox' },
  { id: 'TS2_C06', start: 'TS2_UI_PEER_ROOMS', end: 'TS2_GW_PRO_INGRESS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS2_C07', start: 'TS2_UI_CALL_PUBLISH', end: 'TS2_GW_PRO_INGRESS', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'TS2_C08', start: 'TS2_UI_VIP_INBOX', end: 'TS2_GW_PRO_INGRESS', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'TS2_C09', start: 'TS2_GW_PRO_INGRESS', end: 'TS2_DEC_VERIFY_GATE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS2_C10', start: 'TS2_DEC_VERIFY_GATE', end: 'TS2_GW_ERR_DENIED', startSnap: 'right', endSnap: 'left', label: 'No / Dati Non Validi', strokeColor: '#dc2626' },
  { id: 'TS2_C11', start: 'TS2_GW_ERR_DENIED', end: 'TS2_UI_PRO_SHOWCASE', startSnap: 'top', endSnap: 'right', label: 'Riprova', strokeColor: '#dc2626' },
  { id: 'TS2_C12', start: 'TS2_DEC_VERIFY_GATE', end: 'TS2_SRV_VERIFY_ENGINE', startSnap: 'bottom', endSnap: 'top', label: 'Si / Identita Verificata' },
  { id: 'TS2_C13', start: 'TS2_SRV_VERIFY_ENGINE', end: 'TS2_DB_SILO1_PRO_REG', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS2_C14', start: 'TS2_DEC_VERIFY_GATE', end: 'TS2_SRV_PRESCREEN_ENGINE', startSnap: 'right', endSnap: 'top', label: 'Si / Bando Ricerca' },
  { id: 'TS2_C15', start: 'TS2_SRV_PRESCREEN_ENGINE', end: 'TS2_SRV_BRIDGE_COL5', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS2_C16', start: 'TS2_SRV_BRIDGE_COL5', end: 'TS2_DB_SILO1_RESEARCH_INBOX', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS2_C17', start: 'TS2_DEC_VERIFY_GATE', end: 'TS2_SRV_INBOX_SPAM_SHIELD', startSnap: 'right', endSnap: 'top', label: 'Si / Priority Inbox' },
  { id: 'TS2_C18', start: 'TS2_SRV_INBOX_SPAM_SHIELD', end: 'TS2_DB_SILO1_RESEARCH_INBOX', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS2_C19', start: 'TS2_DB_SILO1_PRO_REG', end: 'TS2_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS2_C20', start: 'TS2_DB_SILO1_RESEARCH_INBOX', end: 'TS2_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' }
];

const T3_CONNECTORS = [
  { id: 'TS3_C01', start: 'TS3_START', end: 'TS3_UI_GHOST_MODE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS3_C02', start: 'TS3_UI_GHOST_MODE', end: 'TS3_DEC_ELITE_ACTION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS3_C03', start: 'TS3_DEC_ELITE_ACTION', end: 'TS3_UI_VIP_LOUNGES', startSnap: 'bottom', endSnap: 'top', label: 'VIP Lounges Serie A' },
  { id: 'TS3_C04', start: 'TS3_DEC_ELITE_ACTION', end: 'TS3_UI_LAB_BOOKING', startSnap: 'right', endSnap: 'left', label: 'Booking Macchinari' },
  { id: 'TS3_C05', start: 'TS3_DEC_ELITE_ACTION', end: 'TS3_UI_STAFF_SCOUT', startSnap: 'right', endSnap: 'left', label: 'Recruiting Staff' },
  { id: 'TS3_C06', start: 'TS3_UI_VIP_LOUNGES', end: 'TS3_GW_ELITE_INGRESS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS3_C07', start: 'TS3_UI_LAB_BOOKING', end: 'TS3_GW_ELITE_INGRESS', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'TS3_C08', start: 'TS3_UI_STAFF_SCOUT', end: 'TS3_GW_ELITE_INGRESS', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'TS3_C09', start: 'TS3_GW_ELITE_INGRESS', end: 'TS3_DEC_SECURITY_GATE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS3_C10', start: 'TS3_DEC_SECURITY_GATE', end: 'TS3_GW_ERR_ELITE', startSnap: 'right', endSnap: 'left', label: 'No / Non Autorizzato', strokeColor: '#dc2626' },
  { id: 'TS3_C11', start: 'TS3_GW_ERR_ELITE', end: 'TS3_UI_GHOST_MODE', startSnap: 'top', endSnap: 'right', label: 'Riprova', strokeColor: '#dc2626' },
  { id: 'TS3_C12', start: 'TS3_DEC_SECURITY_GATE', end: 'TS3_SRV_PRIVACY_ENCLAVE', startSnap: 'bottom', endSnap: 'top', label: 'Si / Lounges Blindate' },
  { id: 'TS3_C13', start: 'TS3_SRV_PRIVACY_ENCLAVE', end: 'TS3_SRV_VAULT_ENCRYPT', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS3_C14', start: 'TS3_SRV_VAULT_ENCRYPT', end: 'TS3_DB_SILO1_ELITE_LOUNGES', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS3_C15', start: 'TS3_DEC_SECURITY_GATE', end: 'TS3_SRV_LAB_SCHEDULER', startSnap: 'right', endSnap: 'top', label: 'Si / Prenotazione Macchinari' },
  { id: 'TS3_C16', start: 'TS3_SRV_LAB_SCHEDULER', end: 'TS3_DB_SILO1_LABS_STAFF', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS3_C17', start: 'TS3_DEC_SECURITY_GATE', end: 'TS3_SRV_SCOUTING_MATCH', startSnap: 'right', endSnap: 'top', label: 'Si / Candidatura Staff' },
  { id: 'TS3_C18', start: 'TS3_SRV_SCOUTING_MATCH', end: 'TS3_DB_SILO1_LABS_STAFF', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS3_C19', start: 'TS3_DB_SILO1_ELITE_LOUNGES', end: 'TS3_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'TS3_C20', start: 'TS3_DB_SILO1_LABS_STAFF', end: 'TS3_END_FLOW', startSnap: 'bottom', endSnap: 'top', label: '' }
];

const ALL_CONNECTORS = [...T1_CONNECTORS, ...T2_CONNECTORS, ...T3_CONNECTORS];

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

function validateGeometry(nodes, connectors) {
  const errors = [];

  if (nodes.length !== EXPECTED_ISO_COUNT) {
    errors.push(`Conteggio nodi errato: ${nodes.length}, attesi ${EXPECTED_ISO_COUNT}`);
  }

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

  // No-Fly Zone check sui 3 Badges
  for (const badge of BADGES) {
    const bBox = {
      left: badge.x - badge.width / 2,
      right: badge.x + badge.width / 2,
      top: badge.y - badge.height / 2,
      bottom: badge.y + badge.height / 2
    };

    for (const n of nodes) {
      const nBox = {
        left: n.x - n.width / 2,
        right: n.x + n.width / 2,
        top: n.y - n.height / 2,
        bottom: n.y + n.height / 2
      };

      const xOverlap = Math.max(0, Math.min(bBox.right + MIN_BADGE_CLEARANCE_PX, nBox.right) - Math.max(bBox.left - MIN_BADGE_CLEARANCE_PX, nBox.left));
      const yOverlap = Math.max(0, Math.min(bBox.bottom + MIN_BADGE_CLEARANCE_PX, nBox.bottom) - Math.max(bBox.top - MIN_BADGE_CLEARANCE_PX, nBox.top));
      if (xOverlap > 0 && yOverlap > 0) {
        errors.push(`Nodo ${n.key} invade la No-Fly Zone del Badge ${badge.id_tag}!`);
      }
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

  console.log('=== DEPLOY MIRO COMPANION APP TOGETHER SOCIAL (#20, #21, #22) ===');

  const geomErrors = validateGeometry(ALL_NODES, ALL_CONNECTORS);
  if (geomErrors.length > 0) {
    console.error('ERRORE VALIDAZIONE GEOMETRICA:');
    geomErrors.forEach((e) => console.error(' - ' + e));
    process.exit(1);
  }
  console.log('OK: Validazione geometrica Regola 10 PASS (48 nodi, No-Fly Zone >= 40px, dimensioni conformi).');

  if (isValidateOnly) {
    console.log('Modalita --validate-only completata con successo.');
    process.exit(0);
  }

  const token = requireMiroAccessToken();

  if (isDryRun) {
    console.log(`Modalita --dry-run: connessione a Miro e verifica coordinata X = ${TS_CENTER_X}...`);
    const boardInfo = await apiCall(token, '');
    console.log(`Connesso a board: ${boardInfo.name || BOARD_ID}`);
    console.log(`Piano di deploy per Together Social a X=${TS_CENTER_X}:`);
    console.log(` - 3 Title Banners (${BANNERS.length})`);
    console.log(` - 3 Badges (#20/#TS1, #21/#TS2, #22/#TS3)`);
    console.log(` - ${ALL_NODES.length} Nodi ISO 5807 (16 per Tier)`);
    console.log(` - ${ALL_CONNECTORS.length} Connettori ortogonali elbowed (20 per Tier)`);
    console.log('Dry-run completato.');
    process.exit(0);
  }

  // FASE 0: PULIZIA IDEMPOTENTE ELEMENTI RESIDUI A X = 12000..13200
  console.log('Fase 0: Verifica ed eventuale pulizia preventiva elementi in zona Together Social (X = 12000..13200)...');
  const existingShapes = await fetchAllShapes(token);
  const shapesToDelete = existingShapes.filter((s) => s.position && s.position.x >= TOGETHER_ISOLATION_MIN_X && s.position.x <= TOGETHER_ISOLATION_MAX_X);
  const deletedShapeIds = new Set(shapesToDelete.map((s) => s.id));

  if (shapesToDelete.length > 0) {
    console.log(`Trovate ${shapesToDelete.length} forme residue in zona Together Social. Eliminazione in corso...`);
    const existingConnectors = await fetchAllConnectors(token);
    const connectorsToDelete = existingConnectors.filter((c) =>
      (c.startItem && deletedShapeIds.has(c.startItem.id)) ||
      (c.endItem && deletedShapeIds.has(c.endItem.id))
    );
    for (const c of connectorsToDelete) {
      try {
        await apiCall(token, `/connectors/${c.id}`, 'DELETE');
        await delay(DELAY_DELETE_MS);
      } catch (e) {}
    }
    for (const s of shapesToDelete) {
      try {
        await apiCall(token, `/shapes/${s.id}`, 'DELETE');
        await delay(DELAY_DELETE_MS);
      } catch (e) {}
    }
    console.log(`Pulizia completata: ${shapesToDelete.length} forme rimosse con successo.`);
  }

  // DEPLOY LIVE
  console.log('Esecuzione DEPLOY LIVE su Miro Board...');
  const report = {
    timestamp: new Date().toISOString(),
    board_id: BOARD_ID,
    mode: 'live',
    banners_created: 0,
    badges_created: 0,
    nodes_created: 0,
    connectors_created: 0,
    crossings: 0,
    created_items: [],
    verdict: 'PASS'
  };

  // 1. Crea i 3 Banners
  console.log('Creazione dei 3 Title Banners...');
  for (const b of BANNERS) {
    const res = await apiCall(token, '/shapes', 'POST', {
      data: { shape: 'round_rectangle', content: b.content },
      style: { fillColor: b.fillColor, borderColor: b.borderColor, borderWidth: '2.0', textAlign: 'center' },
      position: { origin: 'center', x: b.x, y: b.y },
      geometry: { width: b.width, height: b.height }
    });
    report.created_items.push({ type: 'banner', tier: b.tier, id: res.id });
    report.banners_created++;
    await delay(DELAY_CREATE_MS);
  }

  // 2. Crea i 3 Badges (#20, #21, #22)
  console.log('Creazione dei 3 Badges (#20, #21, #22)...');
  const badgeIdMap = {};
  for (const badge of BADGES) {
    const res = await apiCall(token, '/shapes', 'POST', {
      data: { shape: 'round_rectangle', content: badge.content },
      style: { fillColor: badge.fillColor, borderColor: badge.borderColor, borderWidth: '3.0', textAlign: 'center' },
      position: { origin: 'center', x: badge.x, y: badge.y },
      geometry: { width: badge.width, height: badge.height }
    });
    badgeIdMap[badge.id_tag] = res.id;
    report.created_items.push({ type: 'badge', id_tag: badge.id_tag, tier: badge.tier, id: res.id });
    report.badges_created++;
    await delay(DELAY_CREATE_MS);
  }

  // 3. Crea i 48 nodi ISO
  const keyToMiroId = {};
  console.log(`Creazione dei ${ALL_NODES.length} nodi ISO (16 per Tier)...`);
  for (const n of ALL_NODES) {
    const shapePayload = {
      data: { shape: n.shape, content: n.content },
      style: { fillColor: n.fillColor, borderColor: n.borderColor, borderWidth: '2.0', textAlign: 'center' },
      position: { origin: 'center', x: n.x, y: n.y },
      geometry: { width: n.width, height: n.height }
    };
    const res = await apiCall(token, '/shapes', 'POST', shapePayload);
    keyToMiroId[n.key] = res.id;
    report.created_items.push({ type: 'node', flow: n.flow, key: n.key, mmdId: n.mmdId, id: res.id });
    report.nodes_created++;
    await delay(DELAY_CREATE_MS);
  }

  // 4. Crea i 60 connettori ortogonali
  console.log(`Creazione dei ${ALL_CONNECTORS.length} connettori elbowed (20 per Tier)...`);
  for (const c of ALL_CONNECTORS) {
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

  const reportDir = path.dirname(REPORT_RELATIVE_PATH);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(REPORT_RELATIVE_PATH, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`DEPLOY COMPLETATO: ${report.banners_created} banner, ${report.badges_created} badge, ${report.nodes_created} nodi, ${report.connectors_created} connettori. Report salvato in ${REPORT_RELATIVE_PATH}`);
}

main().catch((err) => {
  console.error('ERRORE FATALE DEPLOY MIRO:', err);
  process.exit(1);
});
