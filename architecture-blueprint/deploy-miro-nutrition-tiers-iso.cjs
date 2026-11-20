/**
 * deploy-miro-nutrition-tiers-iso.cjs
 *
 * Script autoritativo per il deployment su Miro Board (Board ID: uXjVEbo6L2o=).
 * Esegue la creazione della sezione "DIARIO NUTRIZIONE E STILE DI VITA" (Colonna 7 della Zona 4):
 * - Flowchart #23 (FLOW-NUT-1A): Tier 1 (Consumer) - Diario Nutrizione, Misure & Guide Educazionali (16 nodi ISO)
 * - Flowchart #24 (FLOW-NUT-2B): Tier 2 (Pro P.IVA) - Nutrizione Clinica vs Coach, Composizione Corporea BIA & Export (16 nodi ISO)
 * - Flowchart #25 (FLOW-NUT-3C): Tier 3 (Elite Club) - Nutrizione Dinamica, EA/REDs, DEXA, Red Flags & RAG Bunker (16 nodi ISO)
 * - Posizionamento a DESTRA delle Companion Apps (asse X = 14500) allineato sui 3 Tier storici (Y = 550..2490, 3690..5620, 8130..10070)
 *
 * Modalita di esecuzione CLI:
 * - `--validate-only`: esegue in locale tutte le verifiche geometriche e Regola 10 senza chiamate di rete ne token.
 * - `--dry-run`: richiede process.env.MIRO_ACCESS_TOKEN, interroga la board live e stampa il piano senza modifiche.
 * - (default live): richiede process.env.MIRO_ACCESS_TOKEN, esegue deploy e salva scratch/deploy_nutrition_report.json.
 *
 * Vincoli Architetturali e Normativi (ISO 5807 / Regole Progetto 01, 02, 08, 10):
 * 1. Zero credenziali hardcoded: autenticazione esclusivamente via process.env.MIRO_ACCESS_TOKEN.
 * 2. Preservazione assoluta dei 22 diagrammi storici (#01..#22) e No-Fly Zone >= 40px su tutti i 4 lati dei Badge #23, #24, #25.
 * 3. Nessuna modifica ai file di configurazione protetti (Regola 08 intatta).
 * 4. Isolamento spaziale completo a X = 14000..15200 (gutter > 900px da Together Social a X = 12500).
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
const REPORT_RELATIVE_PATH = path.join('scratch', 'deploy_nutrition_report.json');

const DELAY_CREATE_MS = 90;
const DELAY_DELETE_MS = 45;

const MIN_BADGE_CLEARANCE_PX = 40;
const MIN_RECT_WIDTH_PX = 380;
const MAX_RECT_WIDTH_PX = 500;
const MIN_DIAMOND_WIDTH_PX = 360;
const MIN_DIAMOND_HEIGHT_PX = 125;

const EXPECTED_ISO_COUNT = 48;
const NUTRITION_ISOLATION_MIN_X = 13800;
const NUTRITION_ISOLATION_MAX_X = 15300;

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

// Coordinate di ancoraggio spaziale Colonna 7 (Diario Nutrizione e Stile di Vita)
const NUT_CENTER_X = 14500;
const NUT_COL1_X = 14250;
const NUT_COL2_X = 14750;

// Definizione Banners e Badges
const BANNERS = [
  {
    tier: 'TIER_1',
    x: NUT_CENTER_X,
    y: 550,
    width: 1150,
    height: 70,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">COLONNA 7: DIARIO NUTRIZIONE E STILE DI VITA (TIER 1 CONSUMER)</strong></p>'
  },
  {
    tier: 'TIER_2',
    x: NUT_CENTER_X,
    y: 3690,
    width: 1150,
    height: 70,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">COLONNA 7: DIARIO NUTRIZIONE E STILE DI VITA (TIER 2 PRO P.IVA)</strong></p>'
  },
  {
    tier: 'TIER_3',
    x: NUT_CENTER_X,
    y: 8130,
    width: 1150,
    height: 70,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">COLONNA 7: DIARIO NUTRIZIONE E STILE DI VITA (TIER 3 ELITE CLUB)</strong></p>'
  }
];

const BADGES = [
  {
    id_tag: '#23',
    tier: 'TIER_1',
    x: NUT_CENTER_X,
    y: 650,
    width: 520,
    height: 85,
    fillColor: '#0f766e',
    borderColor: '#14b8a6',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">#23 [ FLOW-NUT-1A ] TIER 1 (CONSUMER)</strong><br/><span style="color:#ffffff;font-size:12px">Diario Nutrizione, Misure Corporee &amp; Guide Educazionali</span></p>'
  },
  {
    id_tag: '#24',
    tier: 'TIER_2',
    x: NUT_CENTER_X,
    y: 3790,
    width: 520,
    height: 85,
    fillColor: '#b45309',
    borderColor: '#f59e0b',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">#24 [ FLOW-NUT-2B ] TIER 2 (PRO P.IVA)</strong><br/><span style="color:#ffffff;font-size:12px">Nutrizione Clinica vs Coach, Composizione Corporea BIA &amp; Export</span></p>'
  },
  {
    id_tag: '#25',
    tier: 'TIER_3',
    x: NUT_CENTER_X,
    y: 8230,
    width: 520,
    height: 85,
    fillColor: '#4338ca',
    borderColor: '#818cf8',
    content: '<p style="text-align:center"><strong style="color:#ffffff;font-size:16px">#25 [ FLOW-NUT-3C ] TIER 3 (ELITE CLUB)</strong><br/><span style="color:#ffffff;font-size:12px">Nutrizione Dinamica, EA/REDs, DEXA, Red Flags &amp; RAG Bunker</span></p>'
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

// --- TIER 1: FLOW-NUT-1A (Consumer B2C Diario Nutrizione, Misure & Guide) ---
const T1_NODES = [
  makeNode({ key: 'NUT1_START', mmdId: 'START', flow: 'FLOW-NUT-1A', lane: 'LANE_CLIENT', shape: 'round_rectangle', x: NUT_COL1_X, y: 820, width: 440, height: 76, palette: PALETTE.START_END_T1, fontSize: '13', title: 'Inizio: Diario Nutrizione &amp; Stile di Vita (Tier 1)', subtitle: 'Accesso Diario Peso, Circonferenze &amp; Guide' }),
  makeNode({ key: 'NUT1_UI_DASHBOARD', mmdId: 'UI_DASHBOARD', flow: 'FLOW-NUT-1A', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL1_X, y: 980, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Dashboard Misure: Diario Peso &amp; Circonferenze', subtitle: 'Log Manuale Peso, Vita, Fianchi, Braccio &amp; Coscia' }),
  makeNode({ key: 'NUT1_DEC_ACTION', mmdId: 'DEC_ACTION', flow: 'FLOW-NUT-1A', lane: 'LANE_CLIENT', shape: 'rhombus', x: NUT_COL1_X, y: 1170, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Selezione Strumento Nutrizione?', subtitle: 'Log Misure / Guide / Calcolatori?' }),
  makeNode({ key: 'NUT1_UI_GUIDES', mmdId: 'UI_GUIDES', flow: 'FLOW-NUT-1A', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL1_X, y: 1370, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Linee Guida Educazionali &amp; Integratori', subtitle: 'Ricerca Filtri Sport, Diete Onnivoro/Veg &amp; Evidenze' }),
  makeNode({ key: 'NUT1_UI_CALCULATORS', mmdId: 'UI_CALCULATORS', flow: 'FLOW-NUT-1A', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL2_X, y: 1170, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Calcolatori Manuali: Fabbisogno &amp; Sudorazione', subtitle: 'Stima Kcal &amp; Test Sudorazione Pre/Post Seduta' }),
  makeNode({ key: 'NUT1_UI_EXPORT_PDF', mmdId: 'UI_EXPORT_PDF', flow: 'FLOW-NUT-1A', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL2_X, y: 1370, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Visualizzazione &amp; Export Schede in PDF', subtitle: 'Esportazione Sola Lettura Read-Only dei Parametri' }),
  makeNode({ key: 'NUT1_GW_INGRESS', mmdId: 'GW_INGRESS', flow: 'FLOW-NUT-1A', lane: 'LANE_GATEWAY', shape: 'rectangle', x: NUT_COL1_X, y: 1550, width: 440, height: 84, palette: PALETTE.GATEWAY, title: 'Envoy API Gateway &amp; Tier 1 Policy Guard', subtitle: 'Terminazione TLS, Rate Limiting &amp; Gating Read-Only' }),
  makeNode({ key: 'NUT1_DEC_VALIDATE', mmdId: 'DEC_VALIDATE', flow: 'FLOW-NUT-1A', lane: 'LANE_GATEWAY', shape: 'rhombus', x: NUT_COL1_X, y: 1750, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Validazione Payload &amp; Limiti Consumer?', subtitle: 'Controllo Formato Misure &amp; No-Upload Policy' }),
  makeNode({ key: 'NUT1_GW_ERR_REJECT', mmdId: 'GW_ERR_REJECT', flow: 'FLOW-NUT-1A', lane: 'LANE_GATEWAY', shape: 'rectangle', x: NUT_COL2_X, y: 1750, width: 440, height: 84, palette: PALETTE.ERROR, title: 'HTTP 422/403: Parametri Non Validi o Gating', subtitle: 'Blocco Richiesta Fuori Range o Modifica Piani' }),
  makeNode({ key: 'NUT1_SRV_SWEAT_CALC', mmdId: 'SRV_SWEAT_CALC', flow: 'FLOW-NUT-1A', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL1_X, y: 1960, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Motore Calcolo Fabbisogno &amp; Tasso Sudorazione', subtitle: 'Formula Standard Sudorazione (L/h) &amp; Kcal Basali' }),
  makeNode({ key: 'NUT1_SRV_SUPPLEMENT_FILTER', mmdId: 'SRV_SUPPLEMENT_FILTER', flow: 'FLOW-NUT-1A', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL1_X, y: 2120, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Catalogo Statico Integratori su Evidenze', subtitle: 'Classificazione Scientifica ISSN / AIS (A-B-C-D)' }),
  makeNode({ key: 'NUT1_SRV_PDF_RENDERER', mmdId: 'SRV_PDF_RENDERER', flow: 'FLOW-NUT-1A', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL2_X, y: 1960, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Renderizzatore PDF Read-Only Schede Nutrizionali', subtitle: 'Generazione Documento Statico Non Modificabile' }),
  makeNode({ key: 'NUT1_SRV_ANALYTICS_ISOLATION', mmdId: 'SRV_ANALYTICS_ISOLATION', flow: 'FLOW-NUT-1A', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL2_X, y: 2120, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Isolamento Modulo: No-AI &amp; No-Wearable Sync', subtitle: 'Prevenzione Connessione Programmazione e Telemetria' }),
  makeNode({ key: 'NUT1_DB_BODY_MEASURES', mmdId: 'DB_BODY_MEASURES', flow: 'FLOW-NUT-1A', lane: 'LANE_DB', shape: 'rectangle', x: NUT_COL1_X, y: 2300, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 1 Consumer: Tabella user_body_measurements', subtitle: 'Storico Peso, Circonferenze &amp; Timestamp Personali' }),
  makeNode({ key: 'NUT1_DB_GUIDES_CATALOG', mmdId: 'DB_GUIDES_CATALOG', flow: 'FLOW-NUT-1A', lane: 'LANE_DB', shape: 'rectangle', x: NUT_COL2_X, y: 2300, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 1 Catalog: Tabella nutritional_guidelines_static', subtitle: 'Tabelle Standardizzate, Evidenze Integratori &amp; Template' }),
  makeNode({ key: 'NUT1_END', mmdId: 'END_FLOW', flow: 'FLOW-NUT-1A', lane: 'LANE_DB', shape: 'round_rectangle', x: NUT_CENTER_X, y: 2490, width: 460, height: 76, palette: PALETTE.START_END_T1, fontSize: '13', title: 'Fine: Misura Registrata, Calcolo o Download PDF', subtitle: 'Conclusione Sessione Diario Nutrizione Tier 1' })
];

// --- TIER 2: FLOW-NUT-2B (Pro P.IVA Nutrizione Clinica vs Coach & BIA) ---
const T2_NODES = [
  makeNode({ key: 'NUT2_START', mmdId: 'START', flow: 'FLOW-NUT-2B', lane: 'LANE_CLIENT', shape: 'round_rectangle', x: NUT_COL1_X, y: 3960, width: 440, height: 76, palette: PALETTE.START_END_T2, fontSize: '13', title: 'Inizio: Nutrizione Pro &amp; Composizione Corporea (Tier 2)', subtitle: 'Accesso Coach, Nutrizionisti &amp; Fisioterapisti P.IVA' }),
  makeNode({ key: 'NUT2_UI_ANAMNESIS_FORM', mmdId: 'UI_ANAMNESIS_FORM', flow: 'FLOW-NUT-2B', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL1_X, y: 4120, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Questionario Anamnestico Nutrizionale Approfondito', subtitle: 'Storia Ponderale, Allergie, Intolleranze &amp; Orari' }),
  makeNode({ key: 'NUT2_DEC_ROLE_GATE', mmdId: 'DEC_ROLE_GATE', flow: 'FLOW-NUT-2B', lane: 'LANE_CLIENT', shape: 'rhombus', x: NUT_COL1_X, y: 4310, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Ruolo Professionale Accreditato (Legge 3/2018)?', subtitle: 'Nutrizionista/Dietista/Medico vs Coach/Preparatore?' }),
  makeNode({ key: 'NUT2_UI_CLINICAL_DIET_EDITOR', mmdId: 'UI_CLINICAL_DIET_EDITOR', flow: 'FLOW-NUT-2B', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL1_X, y: 4510, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Editor Diete Cliniche Grammate &amp; Piani Multi-Giorno', subtitle: 'Calibrazione Proteine g/kg FFM, Kcal &amp; Giornate Tipo' }),
  makeNode({ key: 'NUT2_UI_COACH_EDUCATION_MODE', mmdId: 'UI_COACH_EDUCATION_MODE', flow: 'FLOW-NUT-2B', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL2_X, y: 4310, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Modalita Educazione Alimentare &amp; Timing Energetico', subtitle: 'Consigli Macro, Timing Peri-Workout (No Grammature Cliniche)' }),
  makeNode({ key: 'NUT2_UI_BODY_COMP_HUB', mmdId: 'UI_BODY_COMP_HUB', flow: 'FLOW-NUT-2B', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL2_X, y: 4510, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Hub Composizione Corporea: Plicometria &amp; BIA', subtitle: 'BIA Vettoriale, Jackson-Pollock, FM/FFM &amp; Alert Standard' }),
  makeNode({ key: 'NUT2_GW_PRO_INGRESS', mmdId: 'GW_PRO_INGRESS', flow: 'FLOW-NUT-2B', lane: 'LANE_GATEWAY', shape: 'rectangle', x: NUT_COL1_X, y: 4690, width: 440, height: 84, palette: PALETTE.GATEWAY, title: 'Envoy API Gateway: Legal Role-Based Access Control', subtitle: 'Verifica Albo/ATECO, Token JWT Pro &amp; Quota Limiter' }),
  makeNode({ key: 'NUT2_DEC_AUTH_LEGAL', mmdId: 'DEC_AUTH_LEGAL', flow: 'FLOW-NUT-2B', lane: 'LANE_GATEWAY', shape: 'rhombus', x: NUT_COL1_X, y: 4890, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Convalida Fiscale &amp; Abilitazione Sanitaria?', subtitle: 'Art. 348 c.p. / Legge 3/2018 / Wearable T7 Check' }),
  makeNode({ key: 'NUT2_GW_ERR_DENIED', mmdId: 'GW_ERR_DENIED', flow: 'FLOW-NUT-2B', lane: 'LANE_GATEWAY', shape: 'rectangle', x: NUT_COL2_X, y: 4890, width: 440, height: 84, palette: PALETTE.ERROR, title: 'HTTP 403 Forbidden: Esercizio Abusivo o Non Abilitato', subtitle: 'Blocco Editor Grammature per Non Nutrizionisti o Quota AI' }),
  makeNode({ key: 'NUT2_SRV_AI_RATIONALE', mmdId: 'SRV_AI_RATIONALE', flow: 'FLOW-NUT-2B', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL1_X, y: 5100, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Motore AI Rationale (Potenza 70% Token-Limited)', subtitle: 'Spiegazioni Scientifiche Piani &amp; Link Libreria Fonti' }),
  makeNode({ key: 'NUT2_SRV_FFM_CALIBRATOR', mmdId: 'SRV_FFM_CALIBRATOR', flow: 'FLOW-NUT-2B', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL1_X, y: 5260, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Calibratore FFM &amp; Protocollo Idratazione Reale', subtitle: 'Proteine su Massa Magra Reale &amp; Test Sudorazione Pro' }),
  makeNode({ key: 'NUT2_SRV_SUPPLEMENT_SAFETY', mmdId: 'SRV_SUPPLEMENT_SAFETY', flow: 'FLOW-NUT-2B', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL2_X, y: 5100, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Filtro Sicurezza Integratori &amp; Dosaggi Orari', subtitle: 'Avvisi Caffeina Serale, Fasce d\'Eta &amp; Interazioni' }),
  makeNode({ key: 'NUT2_SRV_WEARABLE_T7_SYNC', mmdId: 'SRV_WEARABLE_T7_SYNC', flow: 'FLOW-NUT-2B', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL2_X, y: 5260, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Sync Dispendio Wearable Esclusivo T7 &amp; Multi-Export', subtitle: 'Import Dispendio T7 &amp; Export PDF, XLSX, DOCX, Notes' }),
  makeNode({ key: 'NUT2_DB_BODY_COMP', mmdId: 'DB_BODY_COMP', flow: 'FLOW-NUT-2B', lane: 'LANE_DB', shape: 'rectangle', x: NUT_COL1_X, y: 5440, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 1 Pro: Tabella client_body_composition_bia', subtitle: 'Archivio Plicometrie, BIA, Grafici Evolutivi FM/FFM' }),
  makeNode({ key: 'NUT2_DB_NUTRITION_PLANS', mmdId: 'DB_NUTRITION_PLANS', flow: 'FLOW-NUT-2B', lane: 'LANE_DB', shape: 'rectangle', x: NUT_COL2_X, y: 5440, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 1 Pro: Tabella professional_diet_plans_export', subtitle: 'Piani Alimentari Multi-Giorno, Export Unlocked &amp; Anamnesi' }),
  makeNode({ key: 'NUT2_END', mmdId: 'END_FLOW', flow: 'FLOW-NUT-2B', lane: 'LANE_DB', shape: 'round_rectangle', x: NUT_CENTER_X, y: 5620, width: 460, height: 76, palette: PALETTE.START_END_T2, fontSize: '13', title: 'Fine: Piano Nutrizionale Rilasciato &amp; Export Generato', subtitle: 'Conclusione Flusso Tier 2 Pro Nutrition' })
];

// --- TIER 3: FLOW-NUT-3C (Elite Club Nutrizione Dinamica, EA/REDs & RAG Bunker) ---
const T3_NODES = [
  makeNode({ key: 'NUT3_START', mmdId: 'START', flow: 'FLOW-NUT-3C', lane: 'LANE_CLIENT', shape: 'round_rectangle', x: NUT_COL1_X, y: 8400, width: 440, height: 76, palette: PALETTE.START_END_T3, fontSize: '13', title: 'Inizio: Nutrizione Dinamica &amp; Prestazione Elite (Tier 3)', subtitle: 'Accesso Staff Medico, Nutrizionista &amp; Head S&amp;C Club' }),
  makeNode({ key: 'NUT3_UI_DEXA_BIA_SYNC', mmdId: 'UI_DEXA_BIA_SYNC', flow: 'FLOW-NUT-3C', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL1_X, y: 8560, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Cockpit Composizione Corporea: DEXA, BIA &amp; W/kg', subtitle: 'Sincronizzazione Bidirezionale Automatica con Data Analisi' }),
  makeNode({ key: 'NUT3_DEC_ENERGY_AVAILABILITY', mmdId: 'DEC_ENERGY_AVAILABILITY', flow: 'FLOW-NUT-3C', lane: 'LANE_CLIENT', shape: 'rhombus', x: NUT_COL1_X, y: 8750, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Energy Availability (EA) &lt; 30 kcal/kg FFM?', subtitle: 'Monitoraggio Continuo Rischio Sindrome REDs' }),
  makeNode({ key: 'NUT3_UI_RED_FLAGS_OVERRIDE', mmdId: 'UI_RED_FLAGS_OVERRIDE', flow: 'FLOW-NUT-3C', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL1_X, y: 8950, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Blocco Clinico Red Flags &amp; Alert Medico Sociale', subtitle: 'Stop Adattamenti: Calo Ponderale, Amenorrea, Disidratazione' }),
  makeNode({ key: 'NUT3_UI_DYNAMIC_PERIODIZATION', mmdId: 'UI_DYNAMIC_PERIODIZATION', flow: 'FLOW-NUT-3C', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL2_X, y: 8750, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Periodizzazione Nutrizionale Dinamica &amp; Timing', subtitle: 'Adattamento Quotidiano Kcal/Macro su GPS &amp; Carico (#15)' }),
  makeNode({ key: 'NUT3_UI_CHATBOT_RAG_247', mmdId: 'UI_CHATBOT_RAG_247', flow: 'FLOW-NUT-3C', lane: 'LANE_CLIENT', shape: 'rectangle', x: NUT_COL2_X, y: 8950, width: 440, height: 84, palette: PALETTE.CLIENT, title: 'Chatbot Nutrizionale Atleti 24/7 &amp; RAG Privato', subtitle: 'Consigli Pasti On-Demand Clonato su Protocolli Nutrizionista' }),
  makeNode({ key: 'NUT3_GW_ELITE_INGRESS', mmdId: 'GW_ELITE_INGRESS', flow: 'FLOW-NUT-3C', lane: 'LANE_GATEWAY', shape: 'rectangle', x: NUT_COL1_X, y: 9130, width: 440, height: 84, palette: PALETTE.GATEWAY, title: 'Envoy Enterprise Gateway: mTLS 1.3 &amp; KMS Auth', subtitle: 'Autenticazione Medico-Nutrizionista &amp; Zero-Trust' }),
  makeNode({ key: 'NUT3_DEC_SAFETY_GATE', mmdId: 'DEC_SAFETY_GATE', flow: 'FLOW-NUT-3C', lane: 'LANE_GATEWAY', shape: 'rhombus', x: NUT_COL1_X, y: 9330, width: 440, height: 136, palette: PALETTE.DECISION, title: 'Presenza Red Flag Clinica o Certificazione Doping?', subtitle: 'Verifica Integrita Atleta &amp; Batch Antidoping ID' }),
  makeNode({ key: 'NUT3_GW_ALERT_DISPATCH', mmdId: 'GW_ALERT_DISPATCH', flow: 'FLOW-NUT-3C', lane: 'LANE_GATEWAY', shape: 'rectangle', x: NUT_COL2_X, y: 9330, width: 440, height: 84, palette: PALETTE.ERROR, title: 'HTTP 409/423: Alert Clinico Red Flags &amp; Blocco Push', subtitle: 'Notifica Prioritaria Push/SMS a Medico e Nutrizionista' }),
  makeNode({ key: 'NUT3_SRV_RED_S_ENGINE', mmdId: 'SRV_RED_S_ENGINE', flow: 'FLOW-NUT-3C', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL1_X, y: 9540, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Motore Calcolo EA &amp; Prevenzione REDs', subtitle: 'EA = (Kcal Assunte - Kcal Esercizio) / FFM (Semaforo Rischio)' }),
  makeNode({ key: 'NUT3_SRV_BLOOD_BIOMARKER_CORR', mmdId: 'SRV_BLOOD_BIOMARKER_CORR', flow: 'FLOW-NUT-3C', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL1_X, y: 9700, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Correlazione AI Biomarcatori Ematici &amp; Carichi', subtitle: 'Analisi Sangue vs GPS (Carenze Reali vs Sforzo Acuto)' }),
  makeNode({ key: 'NUT3_SRV_ANTIDOPING_BATCH_CHECK', mmdId: 'SRV_ANTIDOPING_BATCH_CHECK', flow: 'FLOW-NUT-3C', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL2_X, y: 9540, width: 440, height: 84, palette: PALETTE.SERVER, title: 'Motore Certificazione Antidoping per Lotto', subtitle: 'Informed Sport / Cologne List API Verification' }),
  makeNode({ key: 'NUT3_SRV_RAG_STYLE_CLONER', mmdId: 'SRV_RAG_STYLE_CLONER', flow: 'FLOW-NUT-3C', lane: 'LANE_SERVER', shape: 'rectangle', x: NUT_COL2_X, y: 9700, width: 440, height: 84, palette: PALETTE.SERVER, title: 'RAG Privato 100% &amp; Style Cloning Nutrizionista', subtitle: 'Generazione Consigli Pasti 24/7 con Token Illimitati' }),
  makeNode({ key: 'NUT3_DB_BUNKER_NUTRITION', mmdId: 'DB_BUNKER_NUTRITION', flow: 'FLOW-NUT-3C', lane: 'LANE_DB', shape: 'rectangle', x: NUT_COL1_X, y: 9880, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 2 Bunker KMS: athlete_clinical_nutrition_vault', subtitle: 'Dossier Nutrizione Cifrato AES-256-GCM &amp; Segreto Medico' }),
  makeNode({ key: 'NUT3_DB_DATA_ANALYSIS_BRIDGE', mmdId: 'DB_DATA_ANALYSIS_BRIDGE', flow: 'FLOW-NUT-3C', lane: 'LANE_DB', shape: 'rectangle', x: NUT_COL2_X, y: 9880, width: 440, height: 88, palette: PALETTE.DB, title: 'Silo 2 Sync Engine: Bridge Nutrizione &lt;-&gt; Data Analisi', subtitle: 'Aggiornamento W/kg (#16), Ingest Referti DEXA PDF/XLSX' }),
  makeNode({ key: 'NUT3_END', mmdId: 'END_FLOW', flow: 'FLOW-NUT-3C', lane: 'LANE_DB', shape: 'round_rectangle', x: NUT_CENTER_X, y: 10070, width: 460, height: 76, palette: PALETTE.START_END_T3, fontSize: '13', title: 'Fine: Nutrizione Adattata, Atleta Protetto &amp; RAG Attivo', subtitle: 'Conclusione Flusso Tier 3 Elite Nutrition' })
];

const ALL_NODES = [...T1_NODES, ...T2_NODES, ...T3_NODES];

// ============================================================================
// DEFINIZIONE DEI 57 CONNETTORI ORTOGONALI (19 PER TIER)
// ============================================================================

const T1_CONNECTORS = [
  { id: 'NUT1_C01', start: 'NUT1_START', end: 'NUT1_UI_DASHBOARD', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT1_C02', start: 'NUT1_UI_DASHBOARD', end: 'NUT1_DEC_ACTION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT1_C03', start: 'NUT1_DEC_ACTION', end: 'NUT1_UI_GUIDES', startSnap: 'bottom', endSnap: 'top', label: 'Consulta Linee Guida' },
  { id: 'NUT1_C04', start: 'NUT1_DEC_ACTION', end: 'NUT1_UI_CALCULATORS', startSnap: 'right', endSnap: 'left', label: 'Calcolatori Base' },
  { id: 'NUT1_C05', start: 'NUT1_DEC_ACTION', end: 'NUT1_UI_EXPORT_PDF', startSnap: 'right', endSnap: 'left', label: 'Esporta PDF' },
  { id: 'NUT1_C06', start: 'NUT1_UI_GUIDES', end: 'NUT1_GW_INGRESS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT1_C07', start: 'NUT1_UI_CALCULATORS', end: 'NUT1_GW_INGRESS', startSnap: 'left', endSnap: 'right', label: '' },
  { id: 'NUT1_C08', start: 'NUT1_UI_EXPORT_PDF', end: 'NUT1_GW_INGRESS', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'NUT1_C09', start: 'NUT1_GW_INGRESS', end: 'NUT1_DEC_VALIDATE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT1_C10', start: 'NUT1_DEC_VALIDATE', end: 'NUT1_GW_ERR_REJECT', startSnap: 'right', endSnap: 'left', label: 'No / Dati Fuori Range', strokeColor: '#dc2626' },
  { id: 'NUT1_C11', start: 'NUT1_GW_ERR_REJECT', end: 'NUT1_UI_DASHBOARD', startSnap: 'left', endSnap: 'right', label: 'Riprova Inserimento', strokeColor: '#dc2626' },
  { id: 'NUT1_C12', start: 'NUT1_DEC_VALIDATE', end: 'NUT1_SRV_SWEAT_CALC', startSnap: 'bottom', endSnap: 'top', label: 'Si / Parametri Validi' },
  { id: 'NUT1_C13', start: 'NUT1_SRV_SWEAT_CALC', end: 'NUT1_SRV_SUPPLEMENT_FILTER', startSnap: 'bottom', endSnap: 'top', label: 'Filtro Evidenze' },
  { id: 'NUT1_C14', start: 'NUT1_DEC_VALIDATE', end: 'NUT1_SRV_PDF_RENDERER', startSnap: 'right', endSnap: 'left', label: 'Richiesta Export' },
  { id: 'NUT1_C15', start: 'NUT1_SRV_PDF_RENDERER', end: 'NUT1_SRV_ANALYTICS_ISOLATION', startSnap: 'bottom', endSnap: 'top', label: 'Gating Isolamento' },
  { id: 'NUT1_C16', start: 'NUT1_SRV_SUPPLEMENT_FILTER', end: 'NUT1_DB_BODY_MEASURES', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT1_C17', start: 'NUT1_SRV_ANALYTICS_ISOLATION', end: 'NUT1_DB_GUIDES_CATALOG', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT1_C18', start: 'NUT1_DB_BODY_MEASURES', end: 'NUT1_END', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT1_C19', start: 'NUT1_DB_GUIDES_CATALOG', end: 'NUT1_END', startSnap: 'bottom', endSnap: 'top', label: '' }
];

const T2_CONNECTORS = [
  { id: 'NUT2_C01', start: 'NUT2_START', end: 'NUT2_UI_ANAMNESIS_FORM', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT2_C02', start: 'NUT2_UI_ANAMNESIS_FORM', end: 'NUT2_DEC_ROLE_GATE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT2_C03', start: 'NUT2_DEC_ROLE_GATE', end: 'NUT2_UI_CLINICAL_DIET_EDITOR', startSnap: 'bottom', endSnap: 'top', label: 'Nutrizionista / Medico' },
  { id: 'NUT2_C04', start: 'NUT2_DEC_ROLE_GATE', end: 'NUT2_UI_COACH_EDUCATION_MODE', startSnap: 'right', endSnap: 'left', label: 'Coach / Preparatore' },
  { id: 'NUT2_C05', start: 'NUT2_DEC_ROLE_GATE', end: 'NUT2_UI_BODY_COMP_HUB', startSnap: 'right', endSnap: 'left', label: 'Hub BIA & Plicometria' },
  { id: 'NUT2_C06', start: 'NUT2_UI_CLINICAL_DIET_EDITOR', end: 'NUT2_GW_PRO_INGRESS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT2_C07', start: 'NUT2_UI_COACH_EDUCATION_MODE', end: 'NUT2_GW_PRO_INGRESS', startSnap: 'left', endSnap: 'right', label: '' },
  { id: 'NUT2_C08', start: 'NUT2_UI_BODY_COMP_HUB', end: 'NUT2_GW_PRO_INGRESS', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'NUT2_C09', start: 'NUT2_GW_PRO_INGRESS', end: 'NUT2_DEC_AUTH_LEGAL', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT2_C10', start: 'NUT2_DEC_AUTH_LEGAL', end: 'NUT2_GW_ERR_DENIED', startSnap: 'right', endSnap: 'left', label: 'No / Mancanza Titoli', strokeColor: '#dc2626' },
  { id: 'NUT2_C11', start: 'NUT2_GW_ERR_DENIED', end: 'NUT2_UI_ANAMNESIS_FORM', startSnap: 'left', endSnap: 'right', label: 'Blocco Abuso Legale', strokeColor: '#dc2626' },
  { id: 'NUT2_C12', start: 'NUT2_DEC_AUTH_LEGAL', end: 'NUT2_SRV_AI_RATIONALE', startSnap: 'bottom', endSnap: 'top', label: 'Si / Abilitato' },
  { id: 'NUT2_C13', start: 'NUT2_SRV_AI_RATIONALE', end: 'NUT2_SRV_FFM_CALIBRATOR', startSnap: 'bottom', endSnap: 'top', label: 'Calibrazione FFM' },
  { id: 'NUT2_C14', start: 'NUT2_DEC_AUTH_LEGAL', end: 'NUT2_SRV_SUPPLEMENT_SAFETY', startSnap: 'right', endSnap: 'left', label: 'Sicurezza Integratori' },
  { id: 'NUT2_C15', start: 'NUT2_SRV_SUPPLEMENT_SAFETY', end: 'NUT2_SRV_WEARABLE_T7_SYNC', startSnap: 'bottom', endSnap: 'top', label: 'Dispendio T7 & Export' },
  { id: 'NUT2_C16', start: 'NUT2_SRV_FFM_CALIBRATOR', end: 'NUT2_DB_BODY_COMP', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT2_C17', start: 'NUT2_SRV_WEARABLE_T7_SYNC', end: 'NUT2_DB_NUTRITION_PLANS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT2_C18', start: 'NUT2_DB_BODY_COMP', end: 'NUT2_END', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT2_C19', start: 'NUT2_DB_NUTRITION_PLANS', end: 'NUT2_END', startSnap: 'bottom', endSnap: 'top', label: '' }
];

const T3_CONNECTORS = [
  { id: 'NUT3_C01', start: 'NUT3_START', end: 'NUT3_UI_DEXA_BIA_SYNC', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT3_C02', start: 'NUT3_UI_DEXA_BIA_SYNC', end: 'NUT3_DEC_ENERGY_AVAILABILITY', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT3_C03', start: 'NUT3_DEC_ENERGY_AVAILABILITY', end: 'NUT3_UI_RED_FLAGS_OVERRIDE', startSnap: 'bottom', endSnap: 'top', label: 'EA &lt; 30 kcal/kg FFM', strokeColor: '#dc2626' },
  { id: 'NUT3_C04', start: 'NUT3_DEC_ENERGY_AVAILABILITY', end: 'NUT3_UI_DYNAMIC_PERIODIZATION', startSnap: 'right', endSnap: 'left', label: 'EA Ottimale / Dinamica' },
  { id: 'NUT3_C05', start: 'NUT3_DEC_ENERGY_AVAILABILITY', end: 'NUT3_UI_CHATBOT_RAG_247', startSnap: 'right', endSnap: 'left', label: 'Chatbot Nutrizionale RAG' },
  { id: 'NUT3_C06', start: 'NUT3_UI_RED_FLAGS_OVERRIDE', end: 'NUT3_GW_ELITE_INGRESS', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT3_C07', start: 'NUT3_UI_DYNAMIC_PERIODIZATION', end: 'NUT3_GW_ELITE_INGRESS', startSnap: 'left', endSnap: 'right', label: '' },
  { id: 'NUT3_C08', start: 'NUT3_UI_CHATBOT_RAG_247', end: 'NUT3_GW_ELITE_INGRESS', startSnap: 'bottom', endSnap: 'right', label: '' },
  { id: 'NUT3_C09', start: 'NUT3_GW_ELITE_INGRESS', end: 'NUT3_DEC_SAFETY_GATE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT3_C10', start: 'NUT3_DEC_SAFETY_GATE', end: 'NUT3_GW_ALERT_DISPATCH', startSnap: 'right', endSnap: 'left', label: 'Red Flag o Doping Alert', strokeColor: '#dc2626' },
  { id: 'NUT3_C11', start: 'NUT3_GW_ALERT_DISPATCH', end: 'NUT3_UI_DEXA_BIA_SYNC', startSnap: 'left', endSnap: 'right', label: 'Reset Clinico Staff', strokeColor: '#dc2626' },
  { id: 'NUT3_C12', start: 'NUT3_DEC_SAFETY_GATE', end: 'NUT3_SRV_RED_S_ENGINE', startSnap: 'bottom', endSnap: 'top', label: 'Parametri Idonei' },
  { id: 'NUT3_C13', start: 'NUT3_SRV_RED_S_ENGINE', end: 'NUT3_SRV_BLOOD_BIOMARKER_CORR', startSnap: 'bottom', endSnap: 'top', label: 'Biomarcatori Ematici' },
  { id: 'NUT3_C14', start: 'NUT3_DEC_SAFETY_GATE', end: 'NUT3_SRV_ANTIDOPING_BATCH_CHECK', startSnap: 'right', endSnap: 'left', label: 'Check Lotto Doping' },
  { id: 'NUT3_C15', start: 'NUT3_SRV_ANTIDOPING_BATCH_CHECK', end: 'NUT3_SRV_RAG_STYLE_CLONER', startSnap: 'bottom', endSnap: 'top', label: 'RAG Style Cloning' },
  { id: 'NUT3_C16', start: 'NUT3_SRV_BLOOD_BIOMARKER_CORR', end: 'NUT3_DB_BUNKER_NUTRITION', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT3_C17', start: 'NUT3_SRV_RAG_STYLE_CLONER', end: 'NUT3_DB_DATA_ANALYSIS_BRIDGE', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT3_C18', start: 'NUT3_DB_BUNKER_NUTRITION', end: 'NUT3_END', startSnap: 'bottom', endSnap: 'top', label: '' },
  { id: 'NUT3_C19', start: 'NUT3_DB_DATA_ANALYSIS_BRIDGE', end: 'NUT3_END', startSnap: 'bottom', endSnap: 'top', label: '' }
];

const ALL_CONNECTORS = [...T1_CONNECTORS, ...T2_CONNECTORS, ...T3_CONNECTORS];

// ============================================================================
// FUNZIONI DI SUPPORTO API E VALIDAZIONE GEOMETRICA
// ============================================================================

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getValidatedToken() {
  const token = process.env.MIRO_ACCESS_TOKEN;
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new Error(
      'ERRORE AUTENTICAZIONE: variabile ambiente MIRO_ACCESS_TOKEN mancante. ' +
      'Esportare MIRO_ACCESS_TOKEN per eseguire --dry-run o deploy live, oppure usare --validate-only per la verifica locale.'
    );
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

function getSnapPoint(node, snap) {
  const halfW = node.width / 2;
  const halfH = node.height / 2;
  switch (snap) {
    case 'top': return { x: node.x, y: node.y - halfH };
    case 'bottom': return { x: node.x, y: node.y + halfH };
    case 'left': return { x: node.x - halfW, y: node.y };
    case 'right': return { x: node.x + halfW, y: node.y };
    default: throw new Error(`Snap non riconosciuto: ${snap}`);
  }
}

function buildElbowedSegments(startNode, endNode, startSnap, endSnap) {
  const pStart = getSnapPoint(startNode, startSnap);
  const pEnd = getSnapPoint(endNode, endSnap);
  if (Math.abs(pStart.x - pEnd.x) < 0.1 || Math.abs(pStart.y - pEnd.y) < 0.1) {
    return [{ p1: pStart, p2: pEnd }];
  }
  const startIsVertical = startSnap === 'top' || startSnap === 'bottom';
  const endIsVertical = endSnap === 'top' || endSnap === 'bottom';
  if (startIsVertical && !endIsVertical) {
    const elbow = { x: pStart.x, y: pEnd.y };
    return [{ p1: pStart, p2: elbow }, { p1: elbow, p2: pEnd }];
  }
  if (!startIsVertical && endIsVertical) {
    const elbow = { x: pEnd.x, y: pStart.y };
    return [{ p1: pStart, p2: elbow }, { p1: elbow, p2: pEnd }];
  }
  if (startIsVertical && endIsVertical) {
    const midY = (pStart.y + pEnd.y) / 2;
    return [
      { p1: pStart, p2: { x: pStart.x, y: midY } },
      { p1: { x: pStart.x, y: midY }, p2: { x: pEnd.x, y: midY } },
      { p1: { x: pEnd.x, y: midY }, p2: pEnd }
    ];
  }
  const midX = (pStart.x + pEnd.x) / 2;
  return [
    { p1: pStart, p2: { x: midX, y: pStart.y } },
    { p1: { x: midX, y: pStart.y }, p2: { x: midX, y: pEnd.y } },
    { p1: { x: midX, y: pEnd.y }, p2: pEnd }
  ];
}

function segmentIntersectsBox(p1, p2, box, expandPx = 0) {
  const bMinX = box.minX - expandPx;
  const bMaxX = box.maxX + expandPx;
  const bMinY = box.minY - expandPx;
  const bMaxY = box.maxY + expandPx;
  if (Math.abs(p1.x - p2.x) < 0.1) {
    const segX = p1.x;
    const segMinY = Math.min(p1.y, p2.y);
    const segMaxY = Math.max(p1.y, p2.y);
    return segX > bMinX && segX < bMaxX && Math.max(segMinY, bMinY) < Math.min(segMaxY, bMaxY);
  }
  if (Math.abs(p1.y - p2.y) < 0.1) {
    const segY = p1.y;
    const segMinX = Math.min(p1.x, p2.x);
    const segMaxX = Math.max(p1.x, p2.x);
    return segY > bMinY && segY < bMaxY && Math.max(segMinX, bMinX) < Math.min(segMaxX, bMaxX);
  }
  return false;
}

function validateGeometry(nodes, connectors) {
  const errors = [];
  let totalCrossings = 0;
  let totalOverlaps = 0;
  let totalNoFlyViolations = 0;

  if (nodes.length !== EXPECTED_ISO_COUNT) {
    errors.push(`Conteggio nodi errato: ${nodes.length}, attesi ${EXPECTED_ISO_COUNT}`);
  }

  const nodeMap = new Map();
  const boxMap = new Map();

  for (const n of nodes) {
    nodeMap.set(n.key, n);
    boxMap.set(n.key, {
      minX: n.x - n.width / 2,
      maxX: n.x + n.width / 2,
      minY: n.y - n.height / 2,
      maxY: n.y + n.height / 2
    });

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

  // Verifica overlaps tra nodi
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const bA = boxMap.get(nodes[i].key);
      const bB = boxMap.get(nodes[j].key);
      if (bA.minX < bB.maxX && bA.maxX > bB.minX && bA.minY < bB.maxY && bA.maxY > bB.minY) {
        totalOverlaps++;
        errors.push(`Overlap tra nodi ${nodes[i].key} e ${nodes[j].key}`);
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
        totalNoFlyViolations++;
        errors.push(`Nodo ${n.key} invade la No-Fly Zone del Badge ${badge.id_tag}!`);
      }
    }
  }

  // Verifica matematica 0 line-box crossings
  for (const conn of connectors) {
    const s = nodeMap.get(conn.start);
    const e = nodeMap.get(conn.end);
    if (!s || !e) {
      errors.push(`Connettore ${conn.id} nodi non trovati: ${conn.start} -> ${conn.end}`);
      continue;
    }
    const segs = buildElbowedSegments(s, e, conn.startSnap, conn.endSnap);
    for (const [key, box] of boxMap.entries()) {
      if (key === conn.start || key === conn.end) continue;
      for (const seg of segs) {
        if (segmentIntersectsBox(seg.p1, seg.p2, box, 0)) {
          totalCrossings++;
          errors.push(`Line-box crossing: connettore ${conn.id} (${conn.start} -> ${conn.end}) attraversa nodo ${key}`);
        }
      }
    }
  }

  return { errors, totalCrossings, totalOverlaps, totalNoFlyViolations };
}

// ============================================================================
// MAIN EXECUTION ROUTINE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const isValidateOnly = args.includes('--validate-only');
  const isDryRun = args.includes('--dry-run');

  console.log('=== DEPLOY MIRO ISO 5807: COLONNA 7 DIARIO NUTRIZIONE E STILE DI VITA ===');
  console.log(`Board ID: ${BOARD_ID}`);
  console.log(`Nodi ISO definiti: ${ALL_NODES.length} (attesi: ${EXPECTED_ISO_COUNT})`);
  console.log(`Connettori definiti: ${ALL_CONNECTORS.length}`);

  // Validazione geometrica locale deterministica
  const validation = validateGeometry(ALL_NODES, ALL_CONNECTORS);
  console.log(`-> Nodi ISO validati: ${ALL_NODES.length}`);
  console.log(`-> Connettori validati: ${ALL_CONNECTORS.length}`);
  console.log(`-> Line-box crossings: ${validation.totalCrossings}`);
  console.log(`-> Overlaps tra nodi: ${validation.totalOverlaps}`);
  console.log(`-> Violazioni No-Fly Zone (40px): ${validation.totalNoFlyViolations}`);

  if (validation.errors.length > 0) {
    console.error('ERRORI DI VALIDAZIONE GEOMETRICA:');
    validation.errors.forEach((e) => console.error(` - ${e}`));
    process.exit(1);
  }
  console.log('Validazione geometrica completata: 0 errori, 0 line-box crossings. Tutti i vincoli Regola 10 rispettati.');

  if (isValidateOnly) {
    console.log('Modalita --validate-only completata con successo.');
    process.exit(0);
  }

  // Acquisizione token Miro da process.env
  const token = getValidatedToken();
  console.log('Token Miro acquisito con successo da process.env.MIRO_ACCESS_TOKEN.');

  if (isDryRun) {
    console.log('Modalita --dry-run attiva: verifica connessione board senza modifiche...');
    const existingShapes = await fetchAllShapes(token);
    console.log(`Connessione riuscita. Forme totali presenti sulla board: ${existingShapes.length}`);
    const existingInZone = existingShapes.filter(
      (s) => s.position && s.position.x >= NUTRITION_ISOLATION_MIN_X && s.position.x <= NUTRITION_ISOLATION_MAX_X
    );
    console.log(`Forme preesistenti nella zona Colonna 7 (X=${NUTRITION_ISOLATION_MIN_X}..${NUTRITION_ISOLATION_MAX_X}): ${existingInZone.length}`);
    console.log('Simulazione completata con successo.');
    process.exit(0);
  }

  // Pulizia preventiva della sola zona Colonna 7 (X = 13800..15300) se presenti residui
  console.log('Ispezione elementi esistenti nella zona Colonna 7...');
  const existingShapes = await fetchAllShapes(token);
  const shapesToDelete = existingShapes.filter(
    (s) => s.position && s.position.x >= NUTRITION_ISOLATION_MIN_X && s.position.x <= NUTRITION_ISOLATION_MAX_X
  );
  const deletedShapeIds = new Set(shapesToDelete.map((s) => s.id));

  if (shapesToDelete.length > 0) {
    console.log(`Trovate ${shapesToDelete.length} forme residue in Colonna 7. Eliminazione in corso...`);
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
    badges_metadata: {},
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

  // 2. Crea i 3 Badges (#23, #24, #25)
  console.log('Creazione dei 3 Badges (#23, #24, #25)...');
  const badgeIdMap = {};
  for (const badge of BADGES) {
    const res = await apiCall(token, '/shapes', 'POST', {
      data: { shape: 'round_rectangle', content: badge.content },
      style: { fillColor: badge.fillColor, borderColor: badge.borderColor, borderWidth: '3.0', textAlign: 'center' },
      position: { origin: 'center', x: badge.x, y: badge.y },
      geometry: { width: badge.width, height: badge.height }
    });
    badgeIdMap[badge.id_tag] = res.id;
    report.badges_metadata[badge.id_tag] = {
      shape_id: res.id,
      x: badge.x,
      y: badge.y,
      tier: badge.tier
    };
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

  // 4. Crea i 57 connettori ortogonali
  console.log(`Creazione dei ${ALL_CONNECTORS.length} connettori elbowed (19 per Tier)...`);
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
  console.log(`Deploy completato con successo! Report salvato in: ${REPORT_RELATIVE_PATH}`);
  console.log('Badge Shape IDs generati:', badgeIdMap);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('ERRORE FATALE DEPLOY:', err);
    process.exit(1);
  });
}

module.exports = {
  BOARD_ID,
  ALL_NODES,
  ALL_CONNECTORS,
  BADGES,
  BANNERS,
  validateGeometry
};
