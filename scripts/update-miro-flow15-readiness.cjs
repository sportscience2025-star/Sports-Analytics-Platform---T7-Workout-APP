/**
 * update-miro-flow15-readiness.cjs
 * 
 * Aggiornamento chirurgico in-place su Miro Board (Board ID: uXjVEbo6L2o=)
 * delle 6 shape della Readiness Section e PVT-B in Flowchart #15 (FLOW-3C).
 * 
 * Integra le 6 specifiche metodologiche:
 * 1. Protocollo PVT-B 3 minuti (Median RT, Velocità 1/RT, False Starts, Lapsus calibrati)
 * 2. Segregazione contestuale (Mattutino a Digiuno vs Pre-Sessione Acuta)
 * 3. Robust Z-Score MAD (Z = (x - median) / (1.4826 * MAD))
 * 4. Decoupled Readiness Sub-Scores (4 Domini Indipendenti)
 * 5. Architettura Rischio Infortuni a Due Fasi (Two-Phase Model: Red Flag Deterministico -> ML)
 * 6. Modulazione del carico mirata per dominio (Taglio selettivo HSR/Sprint, Volume, Pliometria)
 */

const https = require('https');

const MIRO_API_BASE_URL = 'api.miro.com';
const BOARD_ID = 'uXjVEbo6L2o=';
const MIRO_TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';

const UPDATES = [
  {
    id: '3458764689470586812',
    name: 'T3_UI_READINESS_HEADER',
    height: 90,
    content: '<p><strong>TIER 3 ONLY &mdash; READINESS SECTION: 4 DOMINI DISACCOPPIATI</strong></p><p>Acquisizione multi-parametrica indipendente (Fisiologico, Neurocognitivo, Neuromuscolare, Tolleranza Carico) &bull; Prevenzione del masking di cali acuti</p>'
  },
  {
    id: '3458764689470586826',
    name: 'T3_UI_PVT_TEST',
    height: 120,
    content: '<p><strong>Protocollo PVT-B (3 Minuti) &amp; Segregazione Contestuale</strong></p><p>Vigilanza comportamentale &amp; attenzione sostenuta &bull; Dual Testing: Mattutino a Digiuno (CNS Baseline/Recovery) vs Pre-Sessione (Arousal Acuto) &bull; Median RT, Velocit&agrave; 1/RT, False Starts &amp; Lapsus calibrati su 3 min</p>'
  },
  {
    id: '3458764689470586834',
    name: 'T3_UI_HRV_TEST',
    height: 120,
    content: '<p><strong>Metriche Fisiologiche HRV/RMSSD, RHR &amp; Neuromuscolari</strong></p><p>Dominio Tempo (RMSSD, SDNN), Frequenza (LF/HF) e RHR &bull; Sub-Score Neuromuscolare: Salto CMJ (Altezza, RSI-mod, Tasso Forza Eccentrica) e Tolleranza Carico (sRPE, EWMA ACWR)</p>'
  },
  {
    id: '3458764689470586846',
    name: 'T3_SRV_INJURY_ALGO',
    height: 110,
    content: '<p><strong>Architettura Rischio Infortuni a Due Fasi (Two-Phase Model)</strong></p><p>Fase 1: Matrice Deterministica Red Flag (Hard stop su asimmetrie e spike carichi) &rarr; Fase 2: Regressione Logistica Calibrata / ML su serie storiche longitudinali di squadra</p>'
  },
  {
    id: '3458764689470586853',
    name: 'T3_SRV_ZSCORE',
    height: 110,
    content: '<p><strong>Normalizzazione Statistica Robust Z-Score (MAD)</strong></p><p>Z_robust = (x - mediana) / (1.4826 &times; MAD) su rolling window 28gg &bull; Immunit&agrave; da asimmetrie ed outlier &bull; Reportistica dei 4 Sub-Scores Disaccoppiati prima del composito</p>'
  },
  {
    id: '3458764689470586858',
    name: 'T3_UI_AI_PREVENTION',
    height: 110,
    content: '<p><strong>Supporto Preventivo AI: Modulazione del Carico Mirata per Dominio</strong></p><p>Prescrizione stimoli selettiva: calo PVT &rarr; taglio HSR, sprint max e decision-making; calo HRV &rarr; taglio volume e densit&agrave;; calo CMJ &rarr; stop pliometria ed eccentrici pesanti</p>'
  }
];

function patchShape(item) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      data: {
        content: item.content
      },
      geometry: {
        height: item.height
      }
    });

    const options = {
      hostname: MIRO_API_BASE_URL,
      path: `/v2/boards/${BOARD_ID}/shapes/${item.id}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${MIRO_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[OK] Shape ${item.name} (${item.id}) aggiornata con successo (HTTP ${res.statusCode})`);
          resolve(JSON.parse(body));
        } else {
          console.error(`[ERR] Shape ${item.name} (${item.id}) fallita: HTTP ${res.statusCode}: ${body}`);
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('=== AGGIORNAMENTO SHAPE READINESS & PVT FLOWCHART #15 SU MIRO BOARD ===');
  for (const item of UPDATES) {
    await patchShape(item);
    await new Promise(r => setTimeout(r, 120)); // rate limiting
  }
  console.log('=== AGGIORNAMENTO LIVE COMPLETATO CON SUCCESSO! ===');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
