/**
 * T7 Workout — Sports Analytics Platform
 * Surgical In-Place Enhancer for Original 6 Miro Columns
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

function patchShape(shapeId, newContent) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.miro.com/v2/boards/${encodeURIComponent(BOARD_ID)}/shapes/${shapeId}`);
    const req = https.request(url, { method: 'PATCH', headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', err => reject(err));
    req.write(JSON.stringify({ data: { content: newContent } }));
    req.end();
  });
}

const updates = [
  // --- COLONNA 1: ACCESSO & ONBOARDING ---
  {
    id: '3458764686744184914',
    content: '<p><strong>Step 2: Credenziali, Tier & GDPR</strong><br/>- Password sicura (bcrypt) & consenso dati sanitari<br/>- <strong>Scelta Tier Commerciale:</strong> Tier 1 Base | Tier 2 Pro | Tier 3 Elite Club</p>'
  },
  {
    id: '3458764686744184917',
    content: '<p><strong>Step 3: Anamnesi Clinico-Sportiva</strong><br/>- Dati antropometrici & screening su 119 patologie (rachide, arti, sistemiche)<br/>- Mappatura ROM articolare & 32 protocolli clinici ginocchio (cli_01..cli_32)</p>'
  },
  {
    id: '3458764686744184919',
    content: '<p><strong>Step 4: Profilo & Token JWT con Claims</strong><br/>- Generazione cartella clinica & rilascio token JWT con claims Ruolo (R1..R8) e Tier<br/>- Persistenza isolata (Silo 1 per Tier 1, Silo 2 Bunker KMS per Tier 3)</p>'
  },

  // --- COLONNA 2: HUB CENTRALE COCKPIT & NAVIGAZIONE ---
  {
    id: '3458764686744238472',
    content: '<p><strong>Home Dashboard Cockpit (Hub Centrale)</strong><br/>- Layout Dark Cockpit in stile Apple con <strong>Selettore Permanente Atleta/Squadra</strong> in alto<br/>- Regola aurea dei 2 click: accesso istantaneo a qualsiasi modulo senza ricaricamento</p>'
  },
  {
    id: '3458764686744238474',
    content: '<p><strong>Navigation Router, Event Bus & Tier Gating</strong><br/>- Router reattivo + sincronizzazione eventi real-time cross-modulo (Event Storming)<br/>- Filtro visibilita automatica: Tier 1 (Base/Social), Tier 2 (Pro/VBT/RAG), Tier 3 (Squadra/Video/Ricerca)</p>'
  },

  // --- COLONNA 3: ARCHITETTURA DI SISTEMA & REPOSITORY ---
  {
    id: '3458764686744238659',
    content: '<p><strong>Thin Client: React 18 + Vite SPA (ADR-01)</strong><br/>- TypeScript strict: interfaccia di pura visualizzazione (zero formule matematiche nel bundle)<br/>- Dark Cockpit Theme con componenti modulari Feature-Driven</p>'
  },
  {
    id: '3458764686744238664',
    content: '<p><strong>Service Worker, Cache & 3 Silos DB (ADR-02)</strong><br/>- SW v14 offline-first + IndexedDB per cache ottimistica<br/>- Database centrale a 3 Silos: Silo 1 (Social), Silo 2 (Bunkers KMS), Silo 3 (Research Warehouse)</p>'
  },
  {
    id: '3458764686744238669',
    content: '<p><strong>Server Scatola Nera: Physics Engine VBT</strong><br/>- Microservizio Cloud Run protetto: OLS lineare, quadratica, residui IQR, stima 1RM a MVT<br/>- Validazione runtime rigorosa unita SI (Forza in N, Potenza in W, Velocita in m/s)</p>'
  },
  {
    id: '3458764686744238675',
    content: '<p><strong>Risk Analyzer & ImpactCalculator</strong><br/>- Screening su 119 patologie con cutoff binario: ESCLUSO (assiale vietato), ADATTATO (ROM 45-90 deg), DISPONIBILE<br/>- Pre-attivazione automatica con i 32 protocolli clinici ginocchio</p>'
  },

  // --- COLONNA 4: WORKFLOW 1 - GENERATORE SCHEDA & CLINICA ---
  {
    id: '3458764686744238835',
    content: '<p><strong>3. ImpactCalculator Triage & Blacklist</strong><br/>- Cutoff binario immediato: ESCLUSO (carico assiale bloccato), ADATTATO (ROM guidato), DISPONIBILE<br/>- Iniezione automatica routine pre-attivazione con link video CDN</p>'
  },
  {
    id: '3458764686744238837',
    content: '<p><strong>4. Periodizzazione Macrociclo (12-16 Settimane)</strong><br/>- Modelli: DUP, a Blocchi, Lineare, Coniugata su 12-16 settimane<br/>- Calcolo automatico settimane di scarico con riduzione volume (-40/50%)</p>'
  },
  {
    id: '3458764686744238843',
    content: '<p><strong>6. Esportazione Fogli Excel Sbloccati & PDF</strong><br/>- File Excel (.xlsx) totalmente sbloccati (protected: false) con colonne feedback campo per il coach<br/>- Report PDF vettoriali con QR Code video per esecuzione esercizi</p>'
  },

  // --- COLONNA 5: WORKFLOW 2 - PIPELINE BIOMECCANICA VBT ---
  {
    id: '3458764686744238845',
    content: '<p><strong>1. Raccolta Dati VBT & Parser BLE</strong><br/>- Streaming live da encoder BLE (Vitruve, GymAware, Beast) o import file CSV/Excel<br/>- Parser con auto-mapping euristico intestazioni disomogenee</p>'
  },
  {
    id: '3458764686744269937',
    content: '<p><strong>4. Calcolo Parametri F-V & Bryan Mann (ADR-03)</strong><br/>- V0 (m/s), F0 (Newton), Pmax (Watt) con rigore dimensionale SI (zero NaN)<br/>- Classificazione Zone Bryan Mann (Absolute Strength, Strength-Speed, Speed-Strength)</p>'
  },

  // --- COLONNA 6: WORKFLOW 3 - ANALISI PAP & SALTI ---
  {
    id: '3458764686744269948',
    content: '<p><strong>4. PAP Stats & Microciclo Z-Score Squadra</strong><br/>- Reactive Strength Index (RSI), t-Student appaiato, Cohen d, Hedges g, soglia MDC 95%<br/>- Z-Score adattivo squadra: incrocio carico interno HRV RMSSD e carico esterno GPS (HSR)</p>'
  },
  {
    id: '3458764686744417308',
    content: '<p><strong>6. Profilo PAP & Gestione Casi Limite</strong><br/>- Identificazione picco neuromuscolare individuale<br/>- Ponderazione frazionaria atleti con doppio ruolo tattico<br/>- Algoritmo fallback nuovi acquisti senza baseline (<6 mesi) su mediana di ruolo</p>'
  }
];

async function run() {
  console.log(`Starting surgical in-place update of ${updates.length} items across the 6 original columns...`);
  for (const up of updates) {
    try {
      await patchShape(up.id, up.content);
      console.log(`Updated shape [${up.id}]`);
      await sleep(150);
    } catch (err) {
      console.error(`Failed to update [${up.id}]:`, err.message);
    }
  }
  console.log('All 6 columns successfully enhanced in-place on Miro!');
}

run();
