/**
 * T7 Workout — Sports Analytics Platform
 * Miro Board Synchronizer Script
 * Populates the 5 Architectural Zones on Miro Board 'uXjVEbo6L2o='
 */

const https = require('https');

const BOARD_ID = 'uXjVEbo6L2o=';
const TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function apiRequest(method, endpoint, payload = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.miro.com/v2/boards/${encodeURIComponent(BOARD_ID)}${endpoint}`);
    const options = {
      method,
      headers
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', err => reject(err));
    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
}

async function createFrame(title, x, y, width, height) {
  console.log(`Creating Frame: ${title}...`);
  const payload = {
    data: { title },
    style: { fillColor: '#0f172a' },
    position: { origin: 'center', x, y },
    geometry: { width, height }
  };
  const res = await apiRequest('POST', '/frames', payload);
  await sleep(150);
  return res;
}

async function createShape(content, shape, x, y, width, height, fillColor = '#1e293b', borderColor = '#38bdf8', borderWidth = '2', textColor = '#f8fafc') {
  const payload = {
    data: {
      shape,
      content: `<p>${content}</p>`
    },
    style: {
      fillColor,
      borderColor,
      borderWidth,
      color: textColor,
      textAlign: 'left'
    },
    position: { origin: 'center', x, y },
    geometry: { width, height }
  };
  const res = await apiRequest('POST', '/shapes', payload);
  await sleep(120);
  return res;
}

async function createConnector(startItemId, endItemId, caption = '') {
  try {
    const payload = {
      startItem: { id: startItemId },
      endItem: { id: endItemId },
      style: {
        strokeColor: '#38bdf8',
        strokeWidth: '2'
      }
    };
    if (caption) {
      payload.captions = [{ content: caption }];
    }
    const res = await apiRequest('POST', '/connectors', payload);
    await sleep(100);
    return res;
  } catch (err) {
    console.warn(`Connector warning: ${err.message}`);
    return null;
  }
}

async function buildZone1() {
  console.log('\n--- Building ZONA 1 (Contesto, Tiers & ADR) ---');
  // Frame center: X = 0, Y = 4000, W = 3600, H = 2600
  // Note: Test frame created earlier at Y=3500, we update or build clean layout
  const frame = await createFrame('ZONA 1: CONTESTO, MODELLO A 3 TIER & SCHEDE ADR', 0, 4200, 3600, 2400);

  // 1. Glossario Ubiquitous Language (Colonna Sinistra)
  const gTitle = await createShape('<strong>1. GLOSSARIO UBIQUITOUS LANGUAGE</strong>', 'round_rectangle', -1200, 3300, 750, 80, '#0f172a', '#38bdf8', '2');
  await createShape('<strong>VBT (Velocity Based Training)</strong><br/>Misura velocita barra via encoder BLE. Parametri: Velocita Media Propulsiva (m/s), 1RM a MVT, Curva F-v, Zone Bryan Mann.', 'rectangle', -1200, 3500, 750, 160, '#1e293b', '#64748b', '1');
  await createShape('<strong>PAP (Post-Activation Potentiation)</strong><br/>Incremento prestazione esplosiva post alto carico. Statistica: t-Student, Cohen d, Hedges g, soglia MDC 95%.', 'rectangle', -1200, 3750, 750, 160, '#1e293b', '#64748b', '1');
  await createShape('<strong>READINESS & Z-SCORE COMPOSITO</strong><br/>Stato neuromuscolare: z = (x - mu)/sigma. Incrocio HRV RMSSD, PVT e GPS (distanza e sprint HSR).', 'rectangle', -1200, 4000, 750, 160, '#1e293b', '#64748b', '1');
  await createShape('<strong>TRIAGE CLINICO & IMPACT CALCULATOR</strong><br/>Cutoff binari (ESCLUSO, ADATTATO con limiti ROM, DISPONIBILE) su 119 patologie e 32 protocolli ginocchio.', 'rectangle', -1200, 4250, 750, 160, '#1e293b', '#64748b', '1');
  await createShape('<strong>3 SILOS DATABASE ISOLATI</strong><br/>Silo 1 (Social Movely B2B/B2C), Silo 2 (Bunkers Club KMS Multi-Tenant), Silo 3 (Research Warehouse anonimo).', 'rectangle', -1200, 4500, 750, 160, '#1e293b', '#64748b', '1');

  // 2. Modello a 3 Tier Commerciali (Colonna Centrale)
  const tTitle = await createShape('<strong>2. MODELLO A 3 TIER COMMERCIALI</strong>', 'round_rectangle', -350, 3300, 800, 80, '#0f172a', '#818cf8', '2');
  const t1 = await createShape('<strong>TIER 1: BASE / AMATORIALE (B2C Free)</strong><br/>Target: Atleti singoli, utenti fitness.<br/>Funzioni: Diario personale, workout player, feed social Movely, consultazione catalogo standard.', 'round_rectangle', -350, 3550, 800, 180, '#1e1b4b', '#818cf8', '2');
  const t2 = await createShape('<strong>TIER 2: PRO COACH & CLINIC (B2B Freelance)</strong><br/>Target: Personal Trainer, Fisioterapisti, Centri riabilitativi.<br/>Funzioni: Macrocicli DUP 12-16 sett., triage 119 patologie, VBT OLS 1RM, export Excel sbloccato, RAG su 322 paper.', 'round_rectangle', -350, 3900, 800, 200, '#2e1065', '#a855f7', '2');
  const t3 = await createShape('<strong>TIER 3: ELITE CLUB & RICERCA (B2B Enterprise)</strong><br/>Target: Club professionisti, staff multi-ruolo, universita.<br/>Funzioni: Bunkers crittografati Cloud KMS, Microciclo Z-Score con doppio ruolo, Video Analisi biomeccanica, Research Hub.', 'round_rectangle', -350, 4300, 800, 220, '#4a044e', '#f43f5e', '2');

  // 3. Schede ADR & Matrice Permessi (Colonna Destra)
  const adrTitle = await createShape('<strong>3. SCHEDE ARCHITECTURAL DECISION RECORD (ADR)</strong>', 'round_rectangle', 550, 3300, 850, 80, '#0f172a', '#f97316', '2');
  await createShape('<strong>ADR-01: TUTELA PROPRIETA INTELLETTUALE (IP)</strong><br/>Decisione: Thin Client di sola visualizzazione + Server Scatola Nera.<br/>Contesto: Proteggere algoritmi VBT OLS, euristica DUP e RAG.<br/>Vincolo: Zero formule proprietarie nel bundle JavaScript client scaricato.', 'rectangle', 550, 3570, 850, 190, '#431407', '#ea580c', '2');
  await createShape('<strong>ADR-02: ISOLAMENTO MULTI-TENANT A 3 SILOS</strong><br/>Decisione: Separazione stagna del database in Silo 1 (Social), Silo 2 (Bunkers KMS), Silo 3 (Research).<br/>Contesto: Riservatezza dati sanitari e tattici delle societa professionistiche.<br/>Vincolo: Chiavi crittografiche distinte per club, nessun leak cross-tenant.', 'rectangle', 550, 3950, 850, 210, '#431407', '#ea580c', '2');
  await createShape('<strong>ADR-03: RIGORE DIMENSIONALE UNITA FISICHE SI</strong><br/>Decisione: Validazione runtime rigorosa delle unita del Sistema Internazionale.<br/>Contesto: Evitare errori nei grafici di forza, potenza e velocita.<br/>Vincolo: Forza in N, Potenza in W, Carico in kg, Velocita in m/s. Zero NaN o undefined.', 'rectangle', 550, 4350, 850, 200, '#431407', '#ea580c', '2');

  await createConnector(tTitle.id, t1.id);
  await createConnector(t1.id, t2.id);
  await createConnector(t2.id, t3.id);
}

async function buildZone2() {
  console.log('\n--- Building ZONA 2 (Architettura C4 & 3 Silos DB) ---');
  const frame = await createFrame('ZONA 2: ARCHITETTURA C4 & ISOLAMENTO IP (THIN CLIENT vs SERVER SCATOLA NERA)', 4400, 4200, 3800, 2400);

  // Livello 1: Thin Client
  const cTitle = await createShape('<strong>1. THIN CLIENT PRESENTATION LAYER (React 18 PWA & Mobile App)</strong><br/>Zero Formule Matematiche / Zero Euristica Proprietà Intellettuale', 'round_rectangle', 4400, 3300, 3400, 80, '#0f172a', '#38bdf8', '2');
  const c1 = await createShape('<strong>UI Dark Cockpit & Design System</strong><br/>Rendering visuale, tabelle responsive, grafici Chart.js neon', 'rectangle', 3200, 3500, 680, 140, '#0369a1', '#7dd3fc', '1');
  const c2 = await createShape('<strong>Global Navigation Shell</strong><br/>Selettore Permanente Atleta/Squadra fisso a memoria persistente', 'rectangle', 4000, 3500, 680, 140, '#0369a1', '#7dd3fc', '1');
  const c3 = await createShape('<strong>BLE Hardware Client</strong><br/>Acquisizione streaming encoder lineari e fasce cardio Polar/Garmin', 'rectangle', 4800, 3500, 680, 140, '#0369a1', '#7dd3fc', '1');
  const c4 = await createShape('<strong>Cache Ottimistica Locale</strong><br/>IndexedDB & Service Worker v14 per fruizione offline senza crash', 'rectangle', 5600, 3500, 680, 140, '#0369a1', '#7dd3fc', '1');

  // Livello 2: Security Gateway
  const gw = await createShape('<strong>2. PERIMETRO DI SICUREZZA & API GATEWAY</strong><br/>Cloud Armor WAF (Anti-DDoS, IP Reputation) + Envoy Gateway + Auth0/JWT Validator + Tier Gatekeeper (1, 2, 3)', 'round_rectangle', 4400, 3800, 3400, 120, '#334155', '#94a3b8', '2');

  // Livello 3: Server Scatola Nera (I 5 Microservizi Cloud Run)
  const sTitle = await createShape('<strong>3. SERVER CENTRALE SCATOLA NERA (Microservizi Google Cloud Run)</strong>', 'round_rectangle', 4400, 4100, 3400, 70, '#0f172a', '#818cf8', '2');
  const e1 = await createShape('<strong>ENGINE 1: Biomechanics & VBT OLS</strong><br/>Regressione OLS/quadratica, filtro residui IQR, stima 1RM a MVT, Zone Bryan Mann, t-Student, Cohen d, MDC 95%', 'rectangle', 3100, 4350, 600, 200, '#1e1b4b', '#818cf8', '2');
  const e2 = await createShape('<strong>ENGINE 2: Periodization & ImpactCalculator</strong><br/>Wizard DUP/Blocchi 12-16 sett., scarico -40%, triage 119 patologie (ESCLUSO/ADATTATO/DISPONIBILE), 32 ginocchio', 'rectangle', 3750, 4350, 600, 200, '#1e1b4b', '#818cf8', '2');
  const e3 = await createShape('<strong>ENGINE 3: Team Microcycle & Z-Score</strong><br/>Z-Score composito, pesatura frazionaria doppio ruolo tattico, fallback nuovi acquisti senza baseline (<6 mesi)', 'rectangle', 4400, 4350, 600, 200, '#1e1b4b', '#818cf8', '2');
  const e4 = await createShape('<strong>ENGINE 4: RAG & Evidence Hierarchy</strong><br/>Ingestione lessico coach, vector search su 322 paper PubMed, moltiplicatori (Meta-analisi x1.3, RCT x1.1)', 'rectangle', 5050, 4350, 600, 200, '#1e1b4b', '#818cf8', '2');
  const e5 = await createShape('<strong>ENGINE 5: Document I/O & Exporter</strong><br/>Generazione fogli Excel sbloccati (protected: false) con colonne feedback campo e PDF con QR video', 'rectangle', 5700, 4350, 600, 200, '#1e1b4b', '#818cf8', '2');

  // Livello 4: 3 Silos Database
  const dbTitle = await createShape('<strong>4. DATABASE CENTRALE A 3 SILOS ISOLATI (PostgreSQL / Neon)</strong>', 'round_rectangle', 4400, 4750, 3400, 70, '#0f172a', '#10b981', '2');
  const s1 = await createShape('<strong>SILO 1: Public, Social & Movely DB</strong><br/>Profili atleti Tier 1, feed social, contratti B2B/B2C, pagamenti Stripe', 'can', 3300, 5000, 700, 180, '#064e3b', '#34d399', '2');
  const s2 = await createShape('<strong>SILO 2: Encrypted Club Bunkers (Tier 3)</strong><br/>Partizioni multi-tenant isolate, crittografia Cloud KMS, cartelle cliniche, VBT, GPS, video', 'can', 4400, 5000, 700, 180, '#4c0519', '#f43f5e', '2');
  const s3 = await createShape('<strong>SILO 3: De-identified Research Warehouse</strong><br/>Serie temporali de-identificate (zero PII, synthetic hash) per universita e ricercatori', 'can', 5500, 5000, 700, 180, '#3b0764', '#c084fc', '2');

  await createConnector(cTitle.id, gw.id, 'Payload JSON grezzi (loadKg, times)');
  await createConnector(gw.id, sTitle.id, 'Route API autorizzate');
  await createConnector(e1.id, s2.id);
  await createConnector(e2.id, s2.id);
  await createConnector(e3.id, s2.id);
  await createConnector(e5.id, s1.id);
}

async function buildZone3() {
  console.log('\n--- Building ZONA 3 (Navigazione Stile Apple & Event Storming) ---');
  const frame = await createFrame('ZONA 3: NAVIGAZIONE STILE APPLE & EVENT STORMING CROSS-MODULO', 8800, 4200, 3800, 2400);

  // Global Navigation Shell (Apple Style)
  const navHeader = await createShape('<strong>TOP FIXED HEADER: SELETTORE PERMANENTE CONTESTO ATLETA / SQUADRA</strong><br/>T7 Cockpit | Badge Tier | Dropdown Reattivo [Squadra Intera / Singolo Atleta con status clinico] | Stato BLE | Profilo', 'round_rectangle', 8800, 3300, 3400, 110, '#0f172a', '#38bdf8', '2');

  // Event Storming: Le 6 Catene di Eventi
  const esTitle = await createShape('<strong>MATRICE DI EVENT STORMING: LE 6 CATENE DI EVENTI IN TEMPO REALE</strong>', 'round_rectangle', 8800, 3600, 3400, 70, '#0f172a', '#f59e0b', '2');
  const c1 = await createShape('<strong>CATENA 1: Triage Clinico -> Programmazione</strong><br/>Diagnosi medica -> ATHLETE_PATHOLOGY_UPDATED -> ImpactCalculator esclude Squat assiale e limita ROM Leg Ext a 45-90 deg', 'rectangle', 7500, 3850, 750, 160, '#78350f', '#f59e0b', '1');
  const c2 = await createShape('<strong>CATENA 2: VBT Test -> Calcolo Dinamico %1RM</strong><br/>Fine serie encoder BLE -> VBT_1RM_RECALCULATED -> Ricalcolo carichi in kg per le prossime 4 settimane di scheda', 'rectangle', 8800, 3850, 750, 160, '#78350f', '#f59e0b', '1');
  const c3 = await createShape('<strong>CATENA 3: Wearable & GPS -> Z-Score & Scarico</strong><br/>HRV drop -28% + Distanza GPS -> COMPOSITE_FATIGUE_OVERLOAD -> Riduzione automatica -30% sprint e carichi eccentrici', 'rectangle', 10100, 3850, 750, 160, '#78350f', '#f59e0b', '1');
  const c4 = await createShape('<strong>CATENA 4: Video Biomeccanica -> Allarme Infortuni</strong><br/>Pose estimation -> KNEE_VALGUS_DEFICIT_DETECTED (valgismo 18.5 deg) -> Assegnazione protocollo preventivo cli_12', 'rectangle', 7500, 4150, 750, 160, '#78350f', '#f59e0b', '1');
  const c5 = await createShape('<strong>CATENA 5: Knowledge RAG -> Razionale Scheda</strong><br/>Upload PDF coach -> COACH_LEXICON_INGESTED -> Generazione razionale evidence-based con citazioni PubMed PMID dirette', 'rectangle', 8800, 4150, 750, 160, '#78350f', '#f59e0b', '1');
  const c6 = await createShape('<strong>CATENA 6: Marketplace Movely -> Diario Cliente</strong><br/>Acquisto pacchetto coaching -> COACHING_PACKAGE_PURCHASED -> Iniezione scheda macrociclo nel diario cliente Tier 1', 'rectangle', 10100, 4150, 750, 160, '#78350f', '#f59e0b', '1');

  // I 4 Stati UI & Edge Cases
  const statesTitle = await createShape('<strong>MATRICE DEI 4 STATI UI & GESTIONE CASI LIMITE SUL CAMPO</strong>', 'round_rectangle', 8800, 4500, 3400, 70, '#0f172a', '#a855f7', '2');
  await createShape('<strong>1. EMPTY STATE</strong><br/>Onboarding guidato, checklist interattiva, CTA visibili, zero schermate grigie o mute.', 'rectangle', 7500, 4800, 500, 180, '#1e293b', '#64748b', '1');
  await createShape('<strong>2. LOADING STATE</strong><br/>Skeleton shimmer pulsanti al neon, barra avanzamento percentuale OLS, pulsanti bloccati.', 'rectangle', 8200, 4800, 500, 180, '#1e1b4b', '#818cf8', '1');
  await createShape('<strong>3. POPULATED STATE</strong><br/>Cockpit a regime con grafici interattivi neon Chart.js, filtri e tooltip immediati.', 'rectangle', 8900, 4800, 500, 180, '#064e3b', '#10b981', '1');
  await createShape('<strong>4. ERROR & FALLBACK</strong><br/>Banner esplicativi, tasto Riprova, modalita offline automatica Service Worker.', 'rectangle', 9600, 4800, 500, 180, '#450a0a', '#ef4444', '1');
  await createShape('<strong>EDGE CASES GESTITI</strong><br/>- Nuovo acquisto (<6m baseline): Mediana di ruolo<br/>- Doppio ruolo: Ponderazione frazionaria minuti<br/>- File Excel malformato: Auto-mapping intestazioni<br/>- Zero NaN, Infinity o undefined a runtime.', 'rectangle', 10300, 4800, 600, 180, '#7c2d12', '#f97316', '2');
}

async function buildZone4() {
  console.log('\n--- Building ZONA 4 (Flowchart Operativi a 4 Swimlanes) ---');
  const frame = await createFrame('ZONA 4: FLOWCHART OPERATIVI A 4 SWIMLANES (CLIENT -> GATEWAY -> SERVER -> DB)', 13600, 4200, 4400, 2400);

  // Le 4 Corsie Orizzontali (Intestazioni Swimlane)
  const l1 = await createShape('<strong>CORSIA 1: APP UTENTE (THIN CLIENT UI/UX)</strong>', 'round_rectangle', 13600, 3250, 4000, 60, '#0369a1', '#38bdf8', '2');
  const l2 = await createShape('<strong>CORSIA 2: API GATEWAY & CONTROLLO TIER / PERMESSI RBAC</strong>', 'round_rectangle', 13600, 3700, 4000, 60, '#334155', '#94a3b8', '2');
  const l3 = await createShape('<strong>CORSIA 3: SERVER CENTRALE SCATOLA NERA (MOTORI DI CALCOLO)</strong>', 'round_rectangle', 13600, 4200, 4000, 60, '#1e1b4b', '#818cf8', '2');
  const l4 = await createShape('<strong>CORSIA 4: DATABASE CENTRALE A 3 SILOS (POSTGRESQL / NEON)</strong>', 'round_rectangle', 13600, 4800, 4000, 60, '#064e3b', '#10b981', '2');

  // I 5 Processi Flusso Esecutivo
  // Flusso A: Onboarding
  const fa1 = await createShape('Registrazione utente + Anamnesi 119 patologie', 'round_rectangle', 12000, 3450, 450, 100, '#0f172a', '#38bdf8', '1');
  const fa2 = await createShape('Verifica formale CF & Validazione Tier 1/2/3', 'rhombus', 12000, 3900, 450, 110, '#78350f', '#f59e0b', '2');
  const fa3 = await createShape('Hashing password & Configurazione permessi RBAC', 'rectangle', 12000, 4450, 450, 100, '#1e1b4b', '#818cf8', '1');
  const fa4 = await createShape('Salvataggio utente in Silo 1 (Social) o Silo 2 (Bunker)', 'can', 12000, 5050, 450, 110, '#4c0519', '#f43f5e', '2');

  // Flusso B: Programmazione & Triage
  const fb1 = await createShape('Selezione atleta + Target Macrociclo DUP 12-16 sett.', 'round_rectangle', 12800, 3450, 450, 100, '#0f172a', '#38bdf8', '1');
  const fb2 = await createShape('Controllo abbonamento Tier 2 o 3 attivo?', 'rhombus', 12800, 3900, 450, 110, '#78350f', '#f59e0b', '2');
  const fb3 = await createShape('ImpactCalculator (ESCLUSO/ADATTATO) + Deload -40% + RAG', 'rectangle', 12800, 4450, 450, 120, '#1e1b4b', '#818cf8', '1');
  const fb4 = await createShape('Archiviazione scheda + Export Excel sbloccato (.xlsx)', 'can', 12800, 5050, 450, 110, '#4c0519', '#f43f5e', '2');

  // Flusso C: VBT & Z-Score
  const fc1 = await createShape('Streaming serie encoder BLE + Dati GPS partita', 'round_rectangle', 13600, 3450, 450, 100, '#0f172a', '#38bdf8', '1');
  const fc2 = await createShape('Validazione rigida unita SI (N, W, m/s, kg)?', 'rhombus', 13600, 3900, 450, 110, '#78350f', '#f59e0b', '2');
  const fc3 = await createShape('Regressione OLS + IQR outlier + Fallback baseline + Doppio ruolo', 'rectangle', 13600, 4450, 450, 120, '#1e1b4b', '#818cf8', '1');
  const fc4 = await createShape('Salvataggio curve F-v e Z-Scores in Silo 2 (Bunker KMS)', 'can', 13600, 5050, 450, 110, '#4c0519', '#f43f5e', '2');

  // Flusso D: Video Biomeccanica
  const fd1 = await createShape('Upload video MP4/MOV a 60/120 fps', 'round_rectangle', 14400, 3450, 450, 100, '#0f172a', '#38bdf8', '1');
  const fd2 = await createShape('Verifica licenza Tier 3 Elite Club attiva?', 'rhombus', 14400, 3900, 450, 110, '#78350f', '#f59e0b', '2');
  const fd3 = await createShape('Pose Estimation GPU: Angolo valgismo ginocchio e asimmetria', 'rectangle', 14400, 4450, 450, 120, '#1e1b4b', '#818cf8', '1');
  const fd4 = await createShape('Archiviazione tracking cinematico in Silo 2', 'can', 14400, 5050, 450, 110, '#4c0519', '#f43f5e', '2');

  // Flusso E: Social & Research ETL
  const fe1 = await createShape('Ingaggio professionista Movely / Query Ricercatore', 'round_rectangle', 15200, 3450, 450, 100, '#0f172a', '#38bdf8', '1');
  const fe2 = await createShape('Inoltro Stripe o Verifica Ruolo Ricercatore R7?', 'rhombus', 15200, 3900, 450, 110, '#78350f', '#f59e0b', '2');
  const fe3 = await createShape('Iniezione scheda nel diario + Batch notturno rimozione PII', 'rectangle', 15200, 4450, 450, 120, '#1e1b4b', '#818cf8', '1');
  const fe4 = await createShape('Scrittura serie de-identificate in Silo 3 (Warehouse)', 'can', 15200, 5050, 450, 110, '#3b0764', '#c084fc', '2');

  await createConnector(fa1.id, fa2.id); await createConnector(fa2.id, fa3.id); await createConnector(fa3.id, fa4.id);
  await createConnector(fb1.id, fb2.id); await createConnector(fb2.id, fb3.id); await createConnector(fb3.id, fb4.id);
  await createConnector(fc1.id, fc2.id); await createConnector(fc2.id, fc3.id); await createConnector(fc3.id, fc4.id);
  await createConnector(fd1.id, fd2.id); await createConnector(fd2.id, fd3.id); await createConnector(fd3.id, fd4.id);
  await createConnector(fe1.id, fe2.id); await createConnector(fe2.id, fe3.id); await createConnector(fe3.id, fe4.id);
}

async function buildZone5() {
  console.log('\n--- Building ZONA 5 (Database ERD & Gap Analysis Software House) ---');
  const frame = await createFrame('ZONA 5: DATABASE ERD A 3 SILOS & GAP ANALYSIS SOFTWARE HOUSE', 18800, 4200, 4200, 2400);

  // Database ERD (Prisma Schemas)
  const erdTitle = await createShape('<strong>DATABASE ERD: I 3 SILOS DATI (SCHEMI PRISMA DOCUMENTATI)</strong>', 'round_rectangle', 18800, 3300, 3800, 70, '#0f172a', '#10b981', '2');
  const erd1 = await createShape('<strong>SILO 1 (Social & Movely B2B/B2C)</strong><br/>- User (auth, role, tier)<br/>- Profile (P.IVA, bio, rate)<br/>- SocialPost & PostComment<br/>- MarketplaceBooking (Stripe)<br/>- ClientMacrocycle', 'rectangle', 17400, 3650, 750, 260, '#064e3b', '#34d399', '2');
  const erd2 = await createShape('<strong>SILO 2 (Encrypted Club Bunkers Tier 3)</strong><br/>- ClubTenant (KMS Key Reference)<br/>- ClubStaff (Head, Doctor, S&C, Match)<br/>- ClubAthlete (dualRole, baselineFlag)<br/>- MedicalRecord & KneeProtocols (cli_01..32)<br/>- VbtTestRecord & PapTestRecord<br/>- MicrocycleZScore & VideoAnalysis', 'rectangle', 18800, 3650, 850, 260, '#4c0519', '#f43f5e', '2');
  const erd3 = await createShape('<strong>SILO 3 (De-identified Research Warehouse)</strong><br/>- ResearchCohort (discipline, tier)<br/>- AnonymizedAthleteSeries (syntheticHash, F-v vectors, normalized Z-scores)<br/>- ResearchPublicationReference (PMID, DOI)<br/>- AcademicAccessLog (audit GDPR)', 'rectangle', 20200, 3650, 800, 260, '#3b0764', '#c084fc', '2');

  // Matrice Gap Analysis Quadricromia
  const gapTitle = await createShape('<strong>MATRICE DI GAP ANALYSIS & RACCORDO SOFTWARE HOUSE (CAPITOLATO)</strong>', 'round_rectangle', 18800, 4150, 3800, 70, '#0f172a', '#f59e0b', '2');

  const gGreen = await createShape('<strong>VERDE: AS-IS PRONTO (Collaudato nella Beta)</strong><br/>- 296 Esercizi codificati + 32 Protocolli ginocchio (cli_01..32)<br/>- 119 Condizioni patologiche categorizzate<br/>- 322 Fonti PubMed con metadati e PMID<br/>- Motore VBT OLS regressione & filtro residui IQR<br/>- Motore PAP Stats (t-Student, Cohen d, MDC 95%)<br/>- UI Dark Cockpit reattiva con Chart.js neon.', 'rectangle', 17400, 4650, 750, 320, '#064e3b', '#10b981', '2');
  const gYellow = await createShape('<strong>GIALLO: DA REFACTORIZZARE / COMPLETARE</strong><br/>- ImpactCalculator: Integrare cutoff assiale dal vecchio commit JS<br/>- Periodization Wizard: Estendere da 4 a 12-16 settimane con scarico -40%<br/>- Export Excel: Spostare generazione lato server sbloccata (protected: false)<br/>- Parser Encoder: Recuperare auto-mapping colonne disomogenee (Vitruve, Beast).', 'rectangle', 18350, 4650, 750, 320, '#78350f', '#f59e0b', '2');
  const gOrange = await createShape('<strong>ARANCIONE: TO-BE NUOVO (Da Sviluppare Ex Novo)</strong><br/>- Global Navigation Shell con Selettore Permanente Atleta/Squadra<br/>- Motore Microciclo Z-Score con fusione GPS e HRV<br/>- Ponderazione frazionaria doppio ruolo tattico<br/>- Algoritmo fallback nuovi acquisti senza baseline storica (<6m)<br/>- Video Analisi biomeccanica su nodi GPU Cloud Run<br/>- Marketplace Movely & Pipeline ETL De-identification.', 'rectangle', 19300, 4650, 750, 320, '#7c2d12', '#ea580c', '2');
  const gRed = await createShape('<strong>ROSSO: VINCOLI CRITICI NON NEGOZIABILI (ADR)</strong><br/>- ADR-01: Thin Client di sola visualizzazione, zero formule sul browser<br/>- ADR-02: Isolamento multi-tenant con chiavi Cloud KMS e 3 Silos stagni<br/>- ADR-03: Rigore dimensionale unita SI (Forza N, Potenza W, Carico kg, Velocita m/s). Zero NaN o undefined.', 'rectangle', 20250, 4650, 750, 320, '#450a0a', '#f43f5e', '2');
}

async function main() {
  console.log('=== STARTING FULL MIRO BOARD SYNCHRONIZATION ===');
  console.log(`Target Board ID: ${BOARD_ID}`);

  try {
    await buildZone1();
    await buildZone2();
    await buildZone3();
    await buildZone4();
    await buildZone5();
    console.log('\nSUCCESS: All 5 Architectural Zones have been completely drawn and synchronized on Miro!');
  } catch (err) {
    console.error('Fatal error during Miro synchronization:', err);
    process.exit(1);
  }
}

main();
