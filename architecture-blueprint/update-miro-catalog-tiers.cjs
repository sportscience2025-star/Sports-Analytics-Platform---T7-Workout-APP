const TOKEN = 'eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U';
const BOARD_ID = 'uXjVEbo6L2o=';

async function api(endpoint, method = 'GET', body = null) {
  const url = `https://api.miro.com/v2/boards/${BOARD_ID}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : null
  });
  if (method === 'DELETE') {
    return res.status;
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

async function fetchAllItems() {
  let cursor = null;
  let allItems = [];
  do {
    let url = `/items?limit=50` + (cursor ? `&cursor=${cursor}` : '');
    const d = await api(url);
    allItems.push(...(d.data || []));
    cursor = d.cursor;
  } while (cursor);
  return allItems;
}

async function fetchAllConnectors() {
  let cursor = null;
  let allConnectors = [];
  do {
    let url = `/connectors?limit=50` + (cursor ? `&cursor=${cursor}` : '');
    const d = await api(url);
    allConnectors.push(...(d.data || []));
    cursor = d.cursor;
  } while (cursor);
  return allConnectors;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Node creation helpers
async function createShape(data) {
  const res = await api('/shapes', 'POST', {
    data: {
      content: data.content,
      shape: data.shape || 'rectangle'
    },
    style: {
      fillColor: data.fillColor || '#e0f2fe',
      borderColor: data.borderColor || '#0284c7',
      borderWidth: data.borderWidth || '2',
      textAlign: data.textAlign || 'center',
      textAlignVertical: 'middle',
      fontSize: data.fontSize || '13',
      color: data.color || '#0f172a'
    },
    position: {
      x: data.x,
      y: data.y,
      origin: 'center'
    },
    geometry: {
      width: data.width,
      height: data.height
    }
  });
  await delay(100);
  return res;
}

async function createConnector(startId, endId, label = '', style = {}) {
  const body = {
    startItem: { id: startId },
    endItem: { id: endId },
    shape: 'elbowed',
    style: {
      strokeColor: style.strokeColor || '#475569',
      strokeWidth: style.strokeWidth || '2',
      strokeStyle: style.strokeStyle || 'solid',
      endStrokeCap: 'arrow'
    }
  };
  if (label) {
    body.captions = [{
      content: label,
      position: 0.5,
      textAlignVertical: 'middle'
    }];
  }
  const res = await api('/connectors', 'POST', body);
  await delay(100);
  return res;
}

async function run() {
  console.log('--- Step 1: Clean old T2 & T3 items ---');
  const allItems = await fetchAllItems();
  const allConnectors = await fetchAllConnectors();

  const t2Old = allItems.filter(i => Math.abs(i.position.x - (-800)) < 650 && i.position.y > 2850 && i.position.y < 5000);
  const t3Old = allItems.filter(i => Math.abs(i.position.x - (-800)) < 650 && i.position.y > 5250 && i.position.y < 7200);

  const oldIds = new Set([...t2Old, ...t3Old].map(i => i.id));
  const oldConnectors = allConnectors.filter(c => oldIds.has(c.startItem?.id) || oldIds.has(c.endItem?.id));

  console.log(`Deleting ${oldConnectors.length} connectors...`);
  for (const c of oldConnectors) {
    await api(`/connectors/${c.id}`, 'DELETE');
    await delay(50);
  }

  console.log(`Deleting ${oldIds.size} old shapes...`);
  for (const id of oldIds) {
    await api(`/items/${id}`, 'DELETE');
    await delay(50);
  }

  console.log('--- Step 2: Create Software 2 (Tier 2 P.IVA) Flowchart ---');
  const t2Nodes = {};

  // Start & Mode selection
  t2Nodes.START = await createShape({
    x: -800, y: 2930, width: 640, height: 80, shape: 'round_rectangle',
    fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff',
    content: '<p><strong>Coach Cockpit: Accesso Catalogo Esercizi (Pro P.IVA)</strong></p><p>Apertura sezione catalogo &bull; Inizializzazione Thin Client</p>'
  });

  t2Nodes.DEC_MODE = await createShape({
    x: -800, y: 3080, width: 460, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Modalità Operativa nel Catalogo?</strong></p><p>1. Consulta &bull; 2. Video Atleta &bull; 3. Solo-Testo</p>'
  });

  // Branch 1: Consultazione (Left: x = -1320)
  t2Nodes.UI_SEARCH = await createShape({
    x: -1320, y: 3250, width: 460, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Filtri Tassonomici &amp; Triage 119 Patologie</strong></p><p>ImpactCalculator &bull; Filtri clinici distretto e ROM</p>'
  });

  t2Nodes.DEC_SAFETY = await createShape({
    x: -1320, y: 3410, width: 420, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Verifica Compatibilità Clinica Atleta?</strong></p><p>Esercizio Idoneo / Adattato vs Rischio</p>'
  });

  t2Nodes.GRID_PRO = await createShape({
    x: -1320, y: 3580, width: 460, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Griglia Catalogo Pro: Badge Idoneità &amp; Miniature 3D</strong></p><p>Badge semaforico verde/giallo &bull; Limitatore ROM</p>'
  });

  t2Nodes.VIEWER_3D = await createShape({
    x: -1320, y: 3750, width: 460, height: 105, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Visualizzatore 3D Pro: Orbit 360° &amp; Blocco ROM Touch</strong></p><p>Fasce muscolari attive &bull; Stop visivo all\'angolo prescritto</p>'
  });

  t2Nodes.UI_PRESCRIPTION = await createShape({
    x: -1320, y: 3910, width: 460, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Prescrizione Scheda Atleta &amp; Note Cliniche</strong></p><p>Associazione a cliente attivo &bull; Istruzioni correttive</p>'
  });

  // Branch 2: In-App Video & AI (Center: x = -800)
  t2Nodes.UI_CAM_RECORD = await createShape({
    x: -800, y: 3250, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>In-App Camera: Registrazione Video Atleta</strong></p><p>Ripresa live atleta su esercizio personalizzato o speciale</p>'
  });

  t2Nodes.UI_EDGE_POSE = await createShape({
    x: -800, y: 3390, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Edge Computer Vision: Estrazione Keypoints 3D</strong></p><p>MediaPipe 33 landmark scheletrici &bull; Angoli articolari e ROM</p>'
  });

  t2Nodes.UI_DRAFT_FORM = await createShape({
    x: -800, y: 3530, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Compilazione Bozza Coach: Note, Errori &amp; Cues</strong></p><p>Setup iniziale, punti di forza/deboli, errori critici da evitare</p>'
  });

  t2Nodes.DEC_AI_AUDIT = await createShape({
    x: -800, y: 3690, width: 460, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Richiedere Revisione Coerente AI?</strong></p><p>Pulsante on-demand: Cross-check RAG + Web + Video</p>'
  });

  t2Nodes.SRV_RAG_AUDIT = await createShape({
    x: -800, y: 3850, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server: Multimodal RAG &amp; Web Biomechanical Audit</strong></p><p>Query 322 Paper, PubMed, Web &amp; Video Benchmark &bull; Match coerenza</p>'
  });

  t2Nodes.UI_DIFF_MODAL = await createShape({
    x: -800, y: 3990, width: 520, height: 105, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Modale Revisione Diff Comparativa Sezione per Sezione</strong></p><p>Approva / Modifica / Scarta singole proposte migliorative AI</p>'
  });

  t2Nodes.DEC_KEEP_VIDEO = await createShape({
    x: -800, y: 4160, width: 460, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Conservare Video Grezzo o Solo Avatar 3D?</strong></p><p>Cloud Criptato Silo 2 vs Solo 3D (Tutela Privacy GDPR)</p>'
  });

  t2Nodes.SRV_3D_SYNTH = await createShape({
    x: -800, y: 4320, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Sintesi Avatar 3D Draco GLB</strong></p><p>Generazione gesto tecnico pulito &bull; Mappatura fasce e TUT</p>'
  });

  t2Nodes.VIEWER_TOGGLE = await createShape({
    x: -800, y: 4470, width: 540, height: 100, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Scheda Esercizio Custom: Toggle "Video Reale vs Avatar 3D"</strong></p><p>Switch istantaneo tra clip originale atleta e omino 3D stilizzato</p>'
  });

  // Branch 3: Solo-Testo (Right: x = -280)
  t2Nodes.UI_TEXT_CREATE = await createShape({
    x: -280, y: 3250, width: 460, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Creazione Manuale Solo-Testo (No Video)</strong></p><p>Form descrittivo: Target muscolare, setup, dinamica e cues</p>'
  });

  t2Nodes.DEC_GATING = await createShape({
    x: -280, y: 3410, width: 420, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Controllo Feature Gating Tier?</strong></p><p>Tier 2/3 Abilitato &bull; Tier 1 Precluso</p>'
  });

  t2Nodes.SRV_TEXT_SYNTH = await createShape({
    x: -280, y: 3580, width: 460, height: 95, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Generatore Cinematico AI</strong></p><p>Inferenza biomeccanica Text-to-Kinematics &bull; Mesh 3D</p>'
  });

  // Convergence & Exit
  t2Nodes.DEC_DEST = await createShape({
    x: -800, y: 4640, width: 460, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Destinazione Prescrizione &amp; Salvataggio?</strong></p><p>Scheda Cliente vs Export PDF/Excel</p>'
  });

  t2Nodes.SAVE_CLIENT = await createShape({
    x: -1080, y: 4800, width: 450, height: 85, shape: 'rectangle',
    fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a',
    content: '<p><strong>Assegnazione a Scheda Cliente (Database Silo 2)</strong></p><p>Persistenza tenant coach &bull; Esercizio custom attivo</p>'
  });

  t2Nodes.SAVE_EXPORT = await createShape({
    x: -520, y: 4800, width: 450, height: 85, shape: 'rectangle',
    fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a',
    content: '<p><strong>Export Scheda PDF Interattivo / Excel .xlsx con QR 3D</strong></p><p>Link protetto per consultazione 3D da parte dell\'atleta</p>'
  });

  t2Nodes.END_READY = await createShape({
    x: -800, y: 4950, width: 640, height: 85, shape: 'round_rectangle',
    fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff',
    content: '<p><strong>Fine: Esercizio Custom Operativo nel Catalogo Coach</strong></p><p>➔ NAVIGA A FLOW 3B: COACH WORKOUT BUILDER</p>'
  });

  console.log('Connecting Tier 2 nodes...');
  await createConnector(t2Nodes.START.id, t2Nodes.DEC_MODE.id);
  
  // Decision branches
  await createConnector(t2Nodes.DEC_MODE.id, t2Nodes.UI_SEARCH.id, '1. Consulta Catalogo');
  await createConnector(t2Nodes.DEC_MODE.id, t2Nodes.UI_CAM_RECORD.id, '2. Registra Video Atleta');
  await createConnector(t2Nodes.DEC_MODE.id, t2Nodes.UI_TEXT_CREATE.id, '3. Nuovo Solo-Testo');

  // Branch 1
  await createConnector(t2Nodes.UI_SEARCH.id, t2Nodes.DEC_SAFETY.id);
  await createConnector(t2Nodes.DEC_SAFETY.id, t2Nodes.GRID_PRO.id, 'Compatibilità OK');
  await createConnector(t2Nodes.GRID_PRO.id, t2Nodes.VIEWER_3D.id);
  await createConnector(t2Nodes.VIEWER_3D.id, t2Nodes.UI_PRESCRIPTION.id);
  await createConnector(t2Nodes.UI_PRESCRIPTION.id, t2Nodes.DEC_DEST.id);

  // Branch 2
  await createConnector(t2Nodes.UI_CAM_RECORD.id, t2Nodes.UI_EDGE_POSE.id);
  await createConnector(t2Nodes.UI_EDGE_POSE.id, t2Nodes.UI_DRAFT_FORM.id);
  await createConnector(t2Nodes.UI_DRAFT_FORM.id, t2Nodes.DEC_AI_AUDIT.id);
  await createConnector(t2Nodes.DEC_AI_AUDIT.id, t2Nodes.SRV_RAG_AUDIT.id, 'SÌ: Revisione AI');
  await createConnector(t2Nodes.SRV_RAG_AUDIT.id, t2Nodes.UI_DIFF_MODAL.id);
  await createConnector(t2Nodes.UI_DIFF_MODAL.id, t2Nodes.DEC_KEEP_VIDEO.id);
  await createConnector(t2Nodes.DEC_AI_AUDIT.id, t2Nodes.DEC_KEEP_VIDEO.id, 'NO: Mantieni Bozza');
  await createConnector(t2Nodes.DEC_KEEP_VIDEO.id, t2Nodes.SRV_3D_SYNTH.id, 'Genera Avatar 3D');
  await createConnector(t2Nodes.SRV_3D_SYNTH.id, t2Nodes.VIEWER_TOGGLE.id);
  await createConnector(t2Nodes.VIEWER_TOGGLE.id, t2Nodes.DEC_DEST.id);

  // Branch 3
  await createConnector(t2Nodes.UI_TEXT_CREATE.id, t2Nodes.DEC_GATING.id);
  await createConnector(t2Nodes.DEC_GATING.id, t2Nodes.SRV_TEXT_SYNTH.id, 'Tier 2 Autorizzato');
  await createConnector(t2Nodes.SRV_TEXT_SYNTH.id, t2Nodes.VIEWER_TOGGLE.id, 'Sintesi Completata');

  // Convergence
  await createConnector(t2Nodes.DEC_DEST.id, t2Nodes.SAVE_CLIENT.id, 'Scheda Cliente');
  await createConnector(t2Nodes.DEC_DEST.id, t2Nodes.SAVE_EXPORT.id, 'Export Esterno');
  await createConnector(t2Nodes.SAVE_CLIENT.id, t2Nodes.END_READY.id);
  await createConnector(t2Nodes.SAVE_EXPORT.id, t2Nodes.END_READY.id);

  console.log('Tier 2 created successfully.');

  console.log('--- Step 3: Create Software 3 (Tier 3 Pro Teams) Flowchart ---');
  const t3Nodes = {};

  t3Nodes.START = await createShape({
    x: -800, y: 5310, width: 640, height: 80, shape: 'round_rectangle',
    fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff',
    content: '<p><strong>Team Squad Cockpit: Accesso Catalogo Esercizi &amp; Telemetria (Elite Club)</strong></p><p>Autenticazione mTLS + FIDO2 &bull; Accesso Bunker Societario Silo 2</p>'
  });

  t3Nodes.DEC_MODE = await createShape({
    x: -800, y: 5460, width: 460, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Modalità Operativa Staff Societario?</strong></p><p>1. Rosa &amp; RTP &bull; 2. Video Pro &bull; 3. Solo-Testo Pro</p>'
  });

  // Branch 1: Consultazione Rosa & ACWR (Left: x = -1320)
  t3Nodes.UI_SEARCH_TEAM = await createShape({
    x: -1320, y: 5630, width: 460, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Consultazione Catalogo Club: Telemetria Z-Score &amp; ACWR</strong></p><p>Mapping carico acuto/cronico 28gg &bull; Rischio infortuni rosa</p>'
  });

  t3Nodes.DEC_RISK = await createShape({
    x: -1320, y: 5790, width: 420, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Verifica Idoneità Giocatore &amp; Rischio ACWR?</strong></p><p>Idoneità Convalidata vs Allerta Sovraccarico (&gt;1.5)</p>'
  });

  t3Nodes.GRID_ELITE = await createShape({
    x: -1320, y: 5960, width: 460, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Griglia Catalogo Elite: Miniature 3D &amp; Telemetria Live</strong></p><p>Integrazione dati GPS/Kistler &bull; Forze di taglio e ROM</p>'
  });

  t3Nodes.VIEWER_3D_ELITE = await createShape({
    x: -1320, y: 6130, width: 460, height: 105, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Visualizzatore 3D Elite: Orbit 360° &amp; Digital Twin Atleta</strong></p><p>Mappatura su biometria reale del calciatore &bull; Forze vertebrali</p>'
  });

  // Branch 2: Video Pro, Markerless & Due Livelli (Center: x = -800)
  t3Nodes.UI_CAM_CAPTURE = await createShape({
    x: -800, y: 5630, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>In-App Camera Pro: Ripresa Giocatore su Gesto Tecnico / RTP</strong></p><p>Video ad alta frequenza &bull; Acquisizione campo o palestra societaria</p>'
  });

  t3Nodes.UI_MARKERLESS = await createShape({
    x: -800, y: 5770, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Edge Computer Vision 3D: Markerless Pose Tracking</strong></p><p>Tracciamento cinematico multi-articolare senza tute o marker invasivi</p>'
  });

  t3Nodes.UI_STAFF_DRAFT = await createShape({
    x: -800, y: 5910, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Compilazione Bozza Staff: Note Tecniche &amp; Biomeccanica</strong></p><p>Setup iniziale, punti di forza/deboli, asimmetrie L/R ed errori critici</p>'
  });

  t3Nodes.DEC_AI_AUDIT_PRO = await createShape({
    x: -800, y: 6070, width: 460, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Attivazione Revisione Coerente AI Multimodale?</strong></p><p>RAG Accademico + PubMed + Cartella Clinica EMR Silo 2</p>'
  });

  t3Nodes.SRV_RAG_PRO = await createShape({
    x: -800, y: 6230, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server: Multimodal RAG Accademico &amp; Cross-Check EMR</strong></p><p>Incrocio con storico infortuni del calciatore &bull; Proposte migliorative</p>'
  });

  t3Nodes.UI_DIFF_PRO = await createShape({
    x: -800, y: 6370, width: 520, height: 105, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Modale Revisione Diff Sezione per Sezione (Staff Review)</strong></p><p>Accetta / Modifica / Scarta integrazioni scientifiche e biomeccaniche</p>'
  });

  t3Nodes.DEC_LIBRARY_TIER = await createShape({
    x: -800, y: 6540, width: 460, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Destinazione Salvataggio nel Club (Due Livelli)?</strong></p><p>Livello 1 (Bozza Atleta) vs Livello 2 (Libreria Ufficiale Club)</p>'
  });

  t3Nodes.UI_LEVEL_ATHLETE = await createShape({
    x: -1080, y: 6700, width: 450, height: 85, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Salvataggio Livello 1: Bozza Individuale Atleta</strong></p><p>Esercizio custom vincolato al singolo calciatore (Silo 2)</p>'
  });

  t3Nodes.UI_LEVEL_CLUB = await createShape({
    x: -520, y: 6700, width: 450, height: 85, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Salvataggio Livello 2: Libreria Ufficiale Club</strong></p><p>Promozione a catalogo di squadra condiviso con tutto lo staff</p>'
  });

  t3Nodes.VIEWER_TOGGLE_PRO = await createShape({
    x: -800, y: 6840, width: 540, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Scheda Esercizio Custom: Toggle "Video Reale vs Digital Twin 3D"</strong></p><p>Switch istantaneo tra video registrato e replica 3D con vettori di forza</p>'
  });

  // Branch 3: Solo-Testo Pro (Right: x = -280)
  t3Nodes.UI_TEXT_CREATE_PRO = await createShape({
    x: -280, y: 5630, width: 460, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Creazione Manuale Solo-Testo Pro</strong></p><p>Parametri tassonomici, setup, intensità &bull; Vincoli RTP 6 fasi</p>'
  });

  t3Nodes.DEC_GATING_PRO = await createShape({
    x: -280, y: 5790, width: 420, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Validazione mTLS e Permessi Staff Societario?</strong></p><p>Chiave FIDO2 hardware &bull; Ruolo Head S&amp;C o Medico Sociale</p>'
  });

  t3Nodes.SRV_TWIN_SYNTH = await createShape({
    x: -280, y: 5960, width: 460, height: 95, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Sintesi Digital Twin su Misura</strong></p><p>Calcolo carichi vertebrali e articolari su misure antropometriche</p>'
  });

  // Convergence & Exit
  t3Nodes.DEC_ACTION = await createShape({
    x: -800, y: 7010, width: 460, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Validazione Congiunta Staff Tecnico-Sanitario?</strong></p><p>Doppia firma digitale: Medico Sociale + Head S&amp;C</p>'
  });

  t3Nodes.SAVE_EMR = await createShape({
    x: -1080, y: 7170, width: 450, height: 85, shape: 'rectangle',
    fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a',
    content: '<p><strong>Archiviazione Cartella EMR (Database Silo 2 KMS)</strong></p><p>Crittografia Cloud KMS hardware &bull; Audit trail immutabile</p>'
  });

  t3Nodes.SAVE_SQUAD = await createShape({
    x: -520, y: 7170, width: 450, height: 85, shape: 'rectangle',
    fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a',
    content: '<p><strong>Assegnazione a Microciclo Gara Squadra (MD-X)</strong></p><p>Integrazione nel piano settimanale di allenamento prima squadra</p>'
  });

  t3Nodes.END_READY_PRO = await createShape({
    x: -800, y: 7320, width: 640, height: 85, shape: 'round_rectangle',
    fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff',
    content: '<p><strong>Fine: Telemetria Esercizio Sincronizzata nel Sistema Societario</strong></p><p>➔ NAVIGA A FLOW 3C: TEAM MICROCICLE ENGINE</p>'
  });

  console.log('Connecting Tier 3 nodes...');
  await createConnector(t3Nodes.START.id, t3Nodes.DEC_MODE.id);

  // Decision branches
  await createConnector(t3Nodes.DEC_MODE.id, t3Nodes.UI_SEARCH_TEAM.id, '1. Rosa & RTP');
  await createConnector(t3Nodes.DEC_MODE.id, t3Nodes.UI_CAM_CAPTURE.id, '2. Registra Video Pro');
  await createConnector(t3Nodes.DEC_MODE.id, t3Nodes.UI_TEXT_CREATE_PRO.id, '3. Solo-Testo Pro');

  // Branch 1
  await createConnector(t3Nodes.UI_SEARCH_TEAM.id, t3Nodes.DEC_RISK.id);
  await createConnector(t3Nodes.DEC_RISK.id, t3Nodes.GRID_ELITE.id, 'Idoneità OK');
  await createConnector(t3Nodes.GRID_ELITE.id, t3Nodes.VIEWER_3D_ELITE.id);
  await createConnector(t3Nodes.VIEWER_3D_ELITE.id, t3Nodes.DEC_ACTION.id);

  // Branch 2
  await createConnector(t3Nodes.UI_CAM_CAPTURE.id, t3Nodes.UI_MARKERLESS.id);
  await createConnector(t3Nodes.UI_MARKERLESS.id, t3Nodes.UI_STAFF_DRAFT.id);
  await createConnector(t3Nodes.UI_STAFF_DRAFT.id, t3Nodes.DEC_AI_AUDIT_PRO.id);
  await createConnector(t3Nodes.DEC_AI_AUDIT_PRO.id, t3Nodes.SRV_RAG_PRO.id, 'SÌ: Revisione AI');
  await createConnector(t3Nodes.SRV_RAG_PRO.id, t3Nodes.UI_DIFF_PRO.id);
  await createConnector(t3Nodes.UI_DIFF_PRO.id, t3Nodes.DEC_LIBRARY_TIER.id);
  await createConnector(t3Nodes.DEC_AI_AUDIT_PRO.id, t3Nodes.DEC_LIBRARY_TIER.id, 'NO: Procedi con Bozza');
  await createConnector(t3Nodes.DEC_LIBRARY_TIER.id, t3Nodes.UI_LEVEL_ATHLETE.id, 'Livello 1: Atleta');
  await createConnector(t3Nodes.DEC_LIBRARY_TIER.id, t3Nodes.UI_LEVEL_CLUB.id, 'Livello 2: Club');
  await createConnector(t3Nodes.UI_LEVEL_ATHLETE.id, t3Nodes.VIEWER_TOGGLE_PRO.id);
  await createConnector(t3Nodes.UI_LEVEL_CLUB.id, t3Nodes.VIEWER_TOGGLE_PRO.id);
  await createConnector(t3Nodes.VIEWER_TOGGLE_PRO.id, t3Nodes.DEC_ACTION.id);

  // Branch 3
  await createConnector(t3Nodes.UI_TEXT_CREATE_PRO.id, t3Nodes.DEC_GATING_PRO.id);
  await createConnector(t3Nodes.DEC_GATING_PRO.id, t3Nodes.SRV_TWIN_SYNTH.id, 'Staff Autorizzato');
  await createConnector(t3Nodes.SRV_TWIN_SYNTH.id, t3Nodes.VIEWER_TOGGLE_PRO.id, 'Sintesi Digital Twin');

  // Convergence
  await createConnector(t3Nodes.DEC_ACTION.id, t3Nodes.SAVE_EMR.id, 'Cartella EMR');
  await createConnector(t3Nodes.DEC_ACTION.id, t3Nodes.SAVE_SQUAD.id, 'Microciclo Gara');
  await createConnector(t3Nodes.SAVE_EMR.id, t3Nodes.END_READY_PRO.id);
  await createConnector(t3Nodes.SAVE_SQUAD.id, t3Nodes.END_READY_PRO.id);

  console.log('Tier 3 created successfully.');
  console.log('--- ALL WORK ON MIRO BOARD COMPLETED PERFECTLY! ---');
}

run().catch(console.error);
