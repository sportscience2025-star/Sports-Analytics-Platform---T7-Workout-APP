const { createShape, createConnector, cleanTiers } = require('./update-miro-catalog-full.cjs');

async function buildFullBoard() {
  console.log('=== STARTING COMPLETE MIRO CATALOG TIERS GENERATION ===');
  await cleanTiers();

  // ==========================================
  // SOFTWARE 2 (TIER 2 - PRO P.IVA)
  // ==========================================
  console.log('--- Generating Software 2 (Tier 2 P.IVA) Complete Flowchart ---');
  const t2 = {};

  // Entry Point
  t2.START = await createShape({
    x: -800, y: 2930, width: 680, height: 85, shape: 'round_rectangle',
    fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff',
    content: '<p><strong>Coach Cockpit: Accesso Catalogo Esercizi (React 18 PWA Pro)</strong></p><p>&bull; Accesso da Navigation Shell &bull; Query catalogo 328 esercizi &bull; Inizializzazione Thin Client</p>'
  });

  t2.DEC_MODE = await createShape({
    x: -800, y: 3085, width: 480, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Modalità Operativa nel Catalogo?</strong></p><p>1. Consulta &amp; Triage &bull; 2. Registra Video Atleta &bull; 3. Solo-Testo</p>'
  });

  // ------------------------------------------
  // RAMO 1: CONSULTAZIONE COMPLETA & PRESCRIZIONE CLINICA (Left: x = -1350)
  // ------------------------------------------
  t2.DEC_SEARCH = await createShape({
    x: -1350, y: 3260, width: 440, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Modalità di Ricerca Coach?</strong></p><p>Filtro Tassonomico &amp; Triage | Ricerca Full-Text Istantanea</p>'
  });

  t2.UI_FILTERS = await createShape({
    x: -1580, y: 3410, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Filtri Dinamici &amp; Triage 119 Patologie</strong></p><p>&bull; Muscoli, pattern motorio, attrezzo &bull; Triage ImpactCalculator con blocco articolazioni lese</p>'
  });

  t2.UI_SEARCH = await createShape({
    x: -1120, y: 3410, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Ricerca Full-Text Istantanea (Debounce 250ms)</strong></p><p>&bull; Ricerca per nome esercizio o codice clinico &bull; Algoritmo fuzzy matching per refusi</p>'
  });

  t2.GW_FETCH = await createShape({
    x: -1350, y: 3550, width: 560, height: 90, shape: 'rectangle',
    fillColor: '#ede9fe', borderColor: '#7c3aed', color: '#0f172a',
    content: '<p><strong>API Gateway Pro: GET /api/v1/pro/catalog/exercises</strong></p><p>&bull; Token JWT Tier 2 &bull; Caching Edge Cloudflare (TTL 3600s) &bull; Query Postgres Silo 2</p>'
  });

  t2.DEC_RESULTS = await createShape({
    x: -1350, y: 3690, width: 440, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Esito Risultati Ricerca?</strong></p><p>Esercizi Idonei / Adattati | Nessun Risultato (Empty State)</p>'
  });

  t2.GRID_POPULATED = await createShape({
    x: -1580, y: 3835, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Rendering Griglia ExerciseCard Pro</strong></p><p>&bull; Miniature 3D dinamiche &bull; Badge semaforico idoneità clinica &bull; Limitatore ROM touch</p>'
  });

  t2.GRID_EMPTY = await createShape({
    x: -1120, y: 3835, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#fee2e2', borderColor: '#dc2626', color: '#7f1d1d',
    content: '<p><strong>Gestione Empty State &amp; Offline Fallback Pro</strong></p><p>&bull; Proposta 3 alternative sicure &bull; Offline cache IndexedDB ultimi 50 esercizi</p>'
  });

  t2.DEC_WEBGL = await createShape({
    x: -1350, y: 3975, width: 440, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Supporto WebGL &amp; Accelerazione GPU?</strong></p><p>SÌ (Studio 3D Pro) | NO (Hardware datato / GPU disabled)</p>'
  });

  t2.SRV_MESH = await createShape({
    x: -1580, y: 4120, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Mesh 3D Draco + ROM</strong></p><p>&bull; Compressione geometrica Draco fino all\'80% &bull; Iniezione vincoli goniometrici ROM</p>'
  });

  t2.FALLBACK_2D = await createShape({
    x: -1120, y: 4120, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#fee2e2', borderColor: '#dc2626', color: '#7f1d1d',
    content: '<p><strong>Graceful Degradation: Video 2D Pre-renderizzato</strong></p><p>&bull; Streaming video MP4 60fps su 3 prospettive fisse &bull; Scheda goniometrica sintetica</p>'
  });

  t2.VIEWER_3D = await createShape({
    x: -1350, y: 4270, width: 640, height: 110, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Visualizzatore Biomeccanico 3D Pro: Orbit 360°, Fasce Muscolari &amp; Limitatore ROM Touch</strong></p><p>&bull; Controlli orbitali Touch/Mouse 360° &bull; Agonisti (Rosso glowing), Sinergisti (Giallo), Stabilizzatori (Ciano)<br/>&bull; Animazione Fasi (Concentrica/Eccentrica) con TUT &bull; Stop visivo all\'angolo articolare prescritto</p>'
  });

  t2.UI_PROTOCOL = await createShape({
    x: -1350, y: 4420, width: 640, height: 100, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Protocollo di Esecuzione Tecnica, Errori Comuni (Why &amp; Fix) &amp; Note Cliniche del Coach</strong></p><p>&bull; Setup posturale iniziale &bull; Spunti tecnici e cues mentali propriocettivi<br/>&bull; Criteri oggettivi di validità &bull; Evidenziazione visiva errori biomeccanici (frecce rosse)</p>'
  });

  // ------------------------------------------
  // RAMO 2: IN-APP CAMERA, POSE 3D & REVISIONE AI (Center: x = -800)
  // ------------------------------------------
  t2.UI_CAM_RECORD = await createShape({
    x: -800, y: 3260, width: 500, height: 90, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>In-App Camera: Registrazione Video Atleta</strong></p><p>&bull; Ripresa live atleta su esercizio personalizzato non codificato</p>'
  });

  t2.UI_EDGE_POSE = await createShape({
    x: -800, y: 3385, width: 500, height: 90, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Edge Computer Vision: Estrazione Keypoints 3D</strong></p><p>&bull; MediaPipe 33 landmark scheletrici &bull; Angoli articolari e ROM in tempo reale</p>'
  });

  t2.UI_DRAFT_FORM = await createShape({
    x: -800, y: 3510, width: 500, height: 90, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Compilazione Bozza Coach: Note, Errori &amp; Cues</strong></p><p>&bull; Setup iniziale, punti di forza/deboli, errori critici da evitare (tassonomia T7)</p>'
  });

  t2.DEC_AI_AUDIT = await createShape({
    x: -800, y: 3655, width: 440, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Richiedere Revisione Coerente AI?</strong></p><p>SÌ (Multimodal RAG Audit) | NO (Mantieni Bozza Coach)</p>'
  });

  t2.SRV_RAG_AUDIT = await createShape({
    x: -800, y: 3800, width: 500, height: 90, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server: Multimodal RAG &amp; Web Biomechanical Audit</strong></p><p>&bull; Query 322 Paper, PubMed, Web &amp; Video Benchmark &bull; Analisi coerenza video-testo</p>'
  });

  t2.UI_DIFF_MODAL = await createShape({
    x: -800, y: 3925, width: 500, height: 100, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Modale Revisione Diff Sezione per Sezione</strong></p><p>&bull; Diff affiancata testo coach vs integrazioni AI &bull; Pulsanti Approva / Modifica / Scarta</p>'
  });

  t2.DEC_KEEP_VIDEO = await createShape({
    x: -800, y: 4075, width: 440, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Conservare Video Grezzo o Solo Avatar 3D?</strong></p><p>Cloud Criptato Silo 2 vs Solo 3D (Tutela Privacy GDPR)</p>'
  });

  t2.SRV_3D_SYNTH = await createShape({
    x: -800, y: 4220, width: 500, height: 90, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Sintesi Avatar 3D Draco GLB</strong></p><p>&bull; Generazione gesto tecnico pulito &bull; Mappatura fasce attive, TUT e timeline</p>'
  });

  t2.VIEWER_TOGGLE = await createShape({
    x: -800, y: 4345, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Scheda Esercizio Custom: Toggle "Video Reale vs Avatar 3D"</strong></p><p>&bull; Switch istantaneo tra clip registrata atleta e omino 3D stilizzato pulito</p>'
  });

  // ------------------------------------------
  // RAMO 3: CREAZIONE MANUALE SOLO-TESTO (Right: x = -280)
  // ------------------------------------------
  t2.UI_TEXT_CREATE = await createShape({
    x: -280, y: 3260, width: 440, height: 90, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Creazione Manuale Solo-Testo (No Video)</strong></p><p>&bull; Form descrittivo: Target muscolare, setup, dinamica e cues mentali</p>'
  });

  t2.DEC_GATING = await createShape({
    x: -280, y: 3410, width: 420, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Controllo Feature Gating Tier?</strong></p><p>Tier 2/3 Abilitato | Tier 1 Precluso (Solo Consultazione)</p>'
  });

  t2.SRV_TEXT_SYNTH = await createShape({
    x: -280, y: 3560, width: 440, height: 90, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Generatore Cinematico AI</strong></p><p>&bull; Inferenza biomeccanica Text-to-Kinematics &bull; Sintesi automatica mesh 3D Draco</p>'
  });

  // ------------------------------------------
  // CONVERGENZA & SALVATAGGIO
  // ------------------------------------------
  t2.DEC_DEST = await createShape({
    x: -800, y: 4575, width: 480, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Destinazione Prescrizione &amp; Salvataggio Coach?</strong></p><p>Assegna a Scheda Cliente (Silo 2) | Export PDF/Excel con QR 3D</p>'
  });

  t2.SAVE_CLIENT = await createShape({
    x: -1080, y: 4740, width: 440, height: 90, shape: 'rectangle',
    fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a',
    content: '<p><strong>Assegnazione a Scheda Cliente (Database Silo 2 Pro)</strong></p><p>&bull; Chiamata POST /api/v1/pro/client-workouts &bull; Esercizio attivo su app atleta</p>'
  });

  t2.SAVE_EXPORT = await createShape({
    x: -520, y: 4740, width: 440, height: 90, shape: 'rectangle',
    fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a',
    content: '<p><strong>Export Scheda PDF Interattivo / Excel .xlsx con QR 3D</strong></p><p>&bull; Generazione report tecnico &bull; QR Code per consultazione 3D mobile atleta</p>'
  });

  t2.END_READY = await createShape({
    x: -800, y: 4890, width: 680, height: 85, shape: 'round_rectangle',
    fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff',
    content: '<p><strong>Fine: Esercizio Custom Operativo nel Catalogo Coach</strong></p><p>➔ NAVIGA A FLOW 3B: COACH WORKOUT BUILDER</p>'
  });

  console.log('Connecting Tier 2 nodes with orthogonal arrows and labels...');
  // Start to Decision
  await createConnector(t2.START.id, t2.DEC_MODE.id);

  // Decision 3 branches
  await createConnector(t2.DEC_MODE.id, t2.DEC_SEARCH.id, '1. Consulta & Triage', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t2.DEC_MODE.id, t2.UI_CAM_RECORD.id, '2. Registra Video Atleta', { x: '50%', y: '100%' }, { x: '50%', y: '0%' });
  await createConnector(t2.DEC_MODE.id, t2.UI_TEXT_CREATE.id, '3. Nuovo Solo-Testo', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });

  // Branch 1: Search, Triage, Grid, WebGL, 3D, Protocol
  await createConnector(t2.DEC_SEARCH.id, t2.UI_FILTERS.id, 'Filtro Parametrico', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t2.DEC_SEARCH.id, t2.UI_SEARCH.id, 'Ricerca Full-Text', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t2.UI_FILTERS.id, t2.GW_FETCH.id, '', { x: '50%', y: '100%' }, { x: '25%', y: '0%' });
  await createConnector(t2.UI_SEARCH.id, t2.GW_FETCH.id, '', { x: '50%', y: '100%' }, { x: '75%', y: '0%' });
  await createConnector(t2.GW_FETCH.id, t2.DEC_RESULTS.id);

  await createConnector(t2.DEC_RESULTS.id, t2.GRID_POPULATED.id, 'Esercizi Idonei', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t2.DEC_RESULTS.id, t2.GRID_EMPTY.id, 'Nessun Risultato', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t2.GRID_EMPTY.id, t2.GRID_POPULATED.id, 'Reset Filtri / Alternative', { x: '0%', y: '50%' }, { x: '100%', y: '50%' });

  await createConnector(t2.GRID_POPULATED.id, t2.DEC_WEBGL.id, '', { x: '50%', y: '100%' }, { x: '0%', y: '50%' });
  await createConnector(t2.DEC_WEBGL.id, t2.SRV_MESH.id, 'SÌ: WebGL 3D', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t2.DEC_WEBGL.id, t2.FALLBACK_2D.id, 'NO: Fallback 2D', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t2.SRV_MESH.id, t2.VIEWER_3D.id, '', { x: '50%', y: '100%' }, { x: '25%', y: '0%' });
  await createConnector(t2.FALLBACK_2D.id, t2.VIEWER_3D.id, '', { x: '50%', y: '100%' }, { x: '75%', y: '0%' });

  await createConnector(t2.VIEWER_3D.id, t2.UI_PROTOCOL.id);
  await createConnector(t2.UI_PROTOCOL.id, t2.DEC_DEST.id, '', { x: '50%', y: '100%' }, { x: '0%', y: '50%' });

  // Branch 2: Video, Pose, Bozza, AI Audit, Diff Modal, Synthesis, Toggle
  await createConnector(t2.UI_CAM_RECORD.id, t2.UI_EDGE_POSE.id);
  await createConnector(t2.UI_EDGE_POSE.id, t2.UI_DRAFT_FORM.id);
  await createConnector(t2.UI_DRAFT_FORM.id, t2.DEC_AI_AUDIT.id);

  await createConnector(t2.DEC_AI_AUDIT.id, t2.SRV_RAG_AUDIT.id, 'SÌ: Revisione AI', { x: '50%', y: '100%' }, { x: '50%', y: '0%' });
  await createConnector(t2.SRV_RAG_AUDIT.id, t2.UI_DIFF_MODAL.id);
  await createConnector(t2.UI_DIFF_MODAL.id, t2.DEC_KEEP_VIDEO.id);
  await createConnector(t2.DEC_AI_AUDIT.id, t2.DEC_KEEP_VIDEO.id, 'NO: Mantieni Bozza', { x: '100%', y: '50%' }, { x: '100%', y: '50%' });

  await createConnector(t2.DEC_KEEP_VIDEO.id, t2.SRV_3D_SYNTH.id, 'Genera Avatar 3D');
  await createConnector(t2.SRV_3D_SYNTH.id, t2.VIEWER_TOGGLE.id);
  await createConnector(t2.VIEWER_TOGGLE.id, t2.DEC_DEST.id);

  // Branch 3: Solo-Testo
  await createConnector(t2.UI_TEXT_CREATE.id, t2.DEC_GATING.id);
  await createConnector(t2.DEC_GATING.id, t2.SRV_TEXT_SYNTH.id, 'Tier 2 Autorizzato');
  await createConnector(t2.SRV_TEXT_SYNTH.id, t2.VIEWER_TOGGLE.id, 'Sintesi Completata', { x: '50%', y: '100%' }, { x: '100%', y: '50%' });

  // Convergence & Exit
  await createConnector(t2.DEC_DEST.id, t2.SAVE_CLIENT.id, 'Scheda Cliente', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t2.DEC_DEST.id, t2.SAVE_EXPORT.id, 'Export Esterno', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t2.SAVE_CLIENT.id, t2.END_READY.id, '', { x: '50%', y: '100%' }, { x: '25%', y: '0%' });
  await createConnector(t2.SAVE_EXPORT.id, t2.END_READY.id, '', { x: '50%', y: '100%' }, { x: '75%', y: '0%' });

  console.log('Tier 2 Complete Flowchart created successfully!');

  // ==========================================
  // SOFTWARE 3 (TIER 3 - ENTERPRISE PRO TEAMS)
  // ==========================================
  console.log('--- Generating Software 3 (Tier 3 Pro Teams) Complete Flowchart ---');
  const t3 = {};

  t3.START = await createShape({
    x: -800, y: 5310, width: 680, height: 85, shape: 'round_rectangle',
    fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff',
    content: '<p><strong>Team Squad Cockpit: Accesso Catalogo Esercizi &amp; Telemetria (Elite Club)</strong></p><p>&bull; Autenticazione mTLS + FIDO2 Hardware Staff &bull; Accesso Bunker Societario Silo 2 KMS</p>'
  });

  t3.DEC_MODE = await createShape({
    x: -800, y: 5465, width: 480, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Modalità Operativa Staff Societario?</strong></p><p>1. Rosa &amp; Telemetria RTP &bull; 2. Video Pro &bull; 3. Solo-Testo Pro</p>'
  });

  // ------------------------------------------
  // RAMO 1: CONSULTAZIONE ROSA, ACWR & DIGITAL TWIN (Left: x = -1350)
  // ------------------------------------------
  t3.DEC_SEARCH = await createShape({
    x: -1350, y: 5640, width: 440, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Modalità Ricerca Staff?</strong></p><p>Filtro Tattico &amp; Z-Score Rosa | Ricerca Markerless Pose 3D</p>'
  });

  t3.UI_FILTERS = await createShape({
    x: -1580, y: 5790, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Filtri Tattici, Ruolo &amp; Z-Score ACWR</strong></p><p>&bull; Ruolo tattico &bull; Z-Score personalizzato &bull; Carico acuto:cronico 28 giorni (ACWR &gt; 1.5)</p>'
  });

  t3.UI_SEARCH = await createShape({
    x: -1120, y: 5790, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Ricerca Markerless Pose &amp; Modelli 3D</strong></p><p>&bull; Ricerca modello cinematico &bull; Database test biomeccanici squadra</p>'
  });

  t3.GW_FETCH = await createShape({
    x: -1350, y: 5930, width: 560, height: 90, shape: 'rectangle',
    fillColor: '#ede9fe', borderColor: '#7c3aed', color: '#0f172a',
    content: '<p><strong>API Gateway mTLS: GET /api/v1/club/catalog/exercises</strong></p><p>&bull; Autenticazione mTLS Staff &bull; Cache protetta Silo 2 &bull; Crittografia Cloud KMS</p>'
  });

  t3.DEC_RESULTS = await createShape({
    x: -1350, y: 6070, width: 440, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Stato Readiness &amp; Rischio Sovraccarico?</strong></p><p>Giocatori Idonei | Rischio Lesione (&gt;1.5) / Protocollo RTP</p>'
  });

  t3.GRID_POPULATED = await createShape({
    x: -1580, y: 6215, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Griglia Catalogo Elite: Mapping Telemetria &amp; 3D</strong></p><p>&bull; Miniature Digital Twin dinamiche &bull; Integrazione dati GPS/Kistler &bull; Forze di taglio (N)</p>'
  });

  t3.GRID_EMPTY = await createShape({
    x: -1120, y: 6215, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#fee2e2', borderColor: '#dc2626', color: '#7f1d1d',
    content: '<p><strong>Gestione Alert Sovraccarico &amp; Protocollo RTP</strong></p><p>&bull; Notifica staff medico &bull; Proposta esercizi adattati RTP 6 fasi</p>'
  });

  t3.DEC_WEBGL = await createShape({
    x: -1350, y: 6355, width: 440, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Rendering 3D Multi-Stream Digital Twin?</strong></p><p>SÌ (Digital Twin 60fps) | NO (Backup Multi-Angolo 4K 120fps)</p>'
  });

  t3.SRV_MESH = await createShape({
    x: -1580, y: 6500, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Streaming Digital Twin 3D</strong></p><p>&bull; Mesh Draco glTF/GLB personalizzata su misure corporee &bull; Forze vertebrali e torsioni</p>'
  });

  t3.FALLBACK_2D = await createShape({
    x: -1120, y: 6500, width: 420, height: 95, shape: 'rectangle',
    fillColor: '#fee2e2', borderColor: '#dc2626', color: '#7f1d1d',
    content: '<p><strong>Backup Multi-Angolo 4K &amp; Clip Tattiche</strong></p><p>&bull; Video multi-camera sincronizzato a 120fps &bull; Overlay telemetrico da campo</p>'
  });

  t3.VIEWER_3D = await createShape({
    x: -1350, y: 6650, width: 640, height: 110, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Visualizzatore Biomeccanico 3D Elite: Orbit 360°, Telemetria &amp; Digital Twin</strong></p><p>&bull; Replica 3D esatta dell\'atleta &bull; Vettori di forza articolare in tempo reale (N)<br/>&bull; Calcolo carichi vertebrali &bull; Cues specialistici di riatletizzazione</p>'
  });

  t3.UI_PROTOCOL = await createShape({
    x: -1350, y: 6800, width: 640, height: 100, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Validazione Congiunta Staff Tecnico-Sanitario &amp; Criteri RTP 6 Fasi</strong></p><p>&bull; Protocollo validato da Medico Sociale e Head S&amp;C &bull; Criteri oggettivi di superamento fase</p>'
  });

  // ------------------------------------------
  // RAMO 2: IN-APP CAMERA PRO, MARKERLESS & LIBRERIA CLUB (Center: x = -800)
  // ------------------------------------------
  t3.UI_CAM_CAPTURE = await createShape({
    x: -800, y: 5640, width: 500, height: 90, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>In-App Camera Pro: Ripresa Giocatore su Gesto Tecnico / RTP</strong></p><p>&bull; Registrazione video ad alta frequenza &bull; Acquisizione campo o palestra societaria</p>'
  });

  t3.UI_MARKERLESS = await createShape({
    x: -800, y: 5765, width: 500, height: 90, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Edge Computer Vision 3D: Markerless Pose Tracking</strong></p><p>&bull; Tracciamento cinematico 3D multi-articolare senza tute o marker invasivi</p>'
  });

  t3.UI_STAFF_DRAFT = await createShape({
    x: -800, y: 5890, width: 500, height: 90, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Compilazione Bozza Staff: Note Tecniche &amp; Biomeccanica</strong></p><p>&bull; Setup iniziale, punti di forza/deboli, asimmetrie L/R ed errori critici (Why &amp; Fix)</p>'
  });

  t3.DEC_AI_AUDIT_PRO = await createShape({
    x: -800, y: 6035, width: 440, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Attivazione Revisione Coerente AI Multimodale?</strong></p><p>SÌ (RAG Accademico + EMR Silo 2) | NO (Bozza Staff)</p>'
  });

  t3.SRV_RAG_PRO = await createShape({
    x: -800, y: 6180, width: 500, height: 90, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server: Multimodal RAG Accademico &amp; Cross-Check EMR</strong></p><p>&bull; Incrocio 322 Paper + PubMed + Storico infortuni del calciatore (Cartella EMR)</p>'
  });

  t3.UI_DIFF_PRO = await createShape({
    x: -800, y: 6305, width: 500, height: 100, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Modale Revisione Diff Sezione per Sezione (Staff Review)</strong></p><p>&bull; Accetta / Modifica / Scarta integrazioni scientifiche e biomeccaniche proposte dall\'AI</p>'
  });

  t3.DEC_LIBRARY_TIER = await createShape({
    x: -800, y: 6455, width: 440, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Destinazione Salvataggio nel Club (Due Livelli)?</strong></p><p>Livello 1 (Bozza Atleta) vs Livello 2 (Libreria Ufficiale Club)</p>'
  });

  t3.UI_LEVEL_ATHLETE = await createShape({
    x: -950, y: 6595, width: 380, height: 85, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Salvataggio Livello 1: Bozza Individuale Atleta</strong></p><p>&bull; Esercizio custom vincolato al singolo calciatore (Silo 2)</p>'
  });

  t3.UI_LEVEL_CLUB = await createShape({
    x: -650, y: 6595, width: 380, height: 85, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Salvataggio Livello 2: Libreria Ufficiale Club</strong></p><p>&bull; Promozione a catalogo di squadra condiviso con tutto lo staff</p>'
  });

  t3.VIEWER_TOGGLE_PRO = await createShape({
    x: -800, y: 6730, width: 520, height: 95, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Scheda Esercizio Custom: Toggle "Video Reale vs Digital Twin 3D"</strong></p><p>&bull; Switch istantaneo tra video registrato e replica 3D con vettori di forza</p>'
  });

  // ------------------------------------------
  // RAMO 3: CREAZIONE MANUALE SOLO-TESTO PRO (Right: x = -280)
  // ------------------------------------------
  t3.UI_TEXT_CREATE_PRO = await createShape({
    x: -280, y: 5640, width: 440, height: 90, shape: 'rectangle',
    fillColor: '#e0f2fe', borderColor: '#0284c7', color: '#0f172a',
    content: '<p><strong>Creazione Manuale Solo-Testo Pro</strong></p><p>&bull; Parametri tassonomici, setup, intensità &bull; Vincoli RTP 6 fasi</p>'
  });

  t3.DEC_GATING_PRO = await createShape({
    x: -280, y: 5790, width: 420, height: 130, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Validazione mTLS e Permessi Staff Societario?</strong></p><p>Chiave FIDO2 hardware &bull; Ruolo Head S&amp;C o Medico Sociale</p>'
  });

  t3.SRV_TWIN_SYNTH = await createShape({
    x: -280, y: 5940, width: 440, height: 90, shape: 'rectangle',
    fillColor: '#d1fae5', borderColor: '#059669', color: '#0f172a',
    content: '<p><strong>Server Scatola Nera: Sintesi Digital Twin su Misura</strong></p><p>&bull; Calcolo carichi vertebrali e articolari su misure antropometriche reali</p>'
  });

  // ------------------------------------------
  // CONVERGENZA & VALIDAZIONE CONGIUNTA
  // ------------------------------------------
  t3.DEC_ACTION = await createShape({
    x: -800, y: 6955, width: 480, height: 135, shape: 'rhombus',
    fillColor: '#fef3c7', borderColor: '#d97706', color: '#0f172a',
    content: '<p><strong>Validazione Congiunta Staff Tecnico-Sanitario?</strong></p><p>Doppia firma digitale: Medico Sociale + Head S&amp;C</p>'
  });

  t3.SAVE_EMR = await createShape({
    x: -1080, y: 7120, width: 440, height: 90, shape: 'rectangle',
    fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a',
    content: '<p><strong>Archiviazione Cartella EMR (Database Silo 2 KMS)</strong></p><p>&bull; Crittografia Cloud KMS hardware &bull; Audit trail immutabile societario</p>'
  });

  t3.SAVE_SQUAD = await createShape({
    x: -520, y: 7120, width: 440, height: 90, shape: 'rectangle',
    fillColor: '#ffe4e6', borderColor: '#e11d48', color: '#0f172a',
    content: '<p><strong>Assegnazione a Microciclo Gara Squadra (MD-X)</strong></p><p>&bull; Integrazione nel piano settimanale di allenamento prima squadra</p>'
  });

  t3.END_READY_PRO = await createShape({
    x: -800, y: 7270, width: 680, height: 85, shape: 'round_rectangle',
    fillColor: '#0f766e', borderColor: '#14b8a6', color: '#ffffff',
    content: '<p><strong>Fine: Telemetria Esercizio Sincronizzata nel Sistema Societario</strong></p><p>➔ NAVIGA A FLOW 3C: TEAM MICROCICLE ENGINE</p>'
  });

  console.log('Connecting Tier 3 nodes with orthogonal arrows and labels...');
  await createConnector(t3.START.id, t3.DEC_MODE.id);

  // Decision branches
  await createConnector(t3.DEC_MODE.id, t3.DEC_SEARCH.id, '1. Rosa & Telemetria', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t3.DEC_MODE.id, t3.UI_CAM_CAPTURE.id, '2. Registra Video Pro', { x: '50%', y: '100%' }, { x: '50%', y: '0%' });
  await createConnector(t3.DEC_MODE.id, t3.UI_TEXT_CREATE_PRO.id, '3. Solo-Testo Pro', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });

  // Branch 1
  await createConnector(t3.DEC_SEARCH.id, t3.UI_FILTERS.id, 'Filtro Tattico', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t3.DEC_SEARCH.id, t3.UI_SEARCH.id, 'Ricerca Markerless', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t3.UI_FILTERS.id, t3.GW_FETCH.id, '', { x: '50%', y: '100%' }, { x: '25%', y: '0%' });
  await createConnector(t3.UI_SEARCH.id, t3.GW_FETCH.id, '', { x: '50%', y: '100%' }, { x: '75%', y: '0%' });
  await createConnector(t3.GW_FETCH.id, t3.DEC_RESULTS.id);

  await createConnector(t3.DEC_RESULTS.id, t3.GRID_POPULATED.id, 'Giocatori Idonei', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t3.DEC_RESULTS.id, t3.GRID_EMPTY.id, 'Rischio ACWR / RTP', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t3.GRID_EMPTY.id, t3.GRID_POPULATED.id, 'Protocollo Adattato', { x: '0%', y: '50%' }, { x: '100%', y: '50%' });

  await createConnector(t3.GRID_POPULATED.id, t3.DEC_WEBGL.id, '', { x: '50%', y: '100%' }, { x: '0%', y: '50%' });
  await createConnector(t3.DEC_WEBGL.id, t3.SRV_MESH.id, 'SÌ: Digital Twin 3D', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t3.DEC_WEBGL.id, t3.FALLBACK_2D.id, 'NO: Multi-Angolo 4K', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t3.SRV_MESH.id, t3.VIEWER_3D.id, '', { x: '50%', y: '100%' }, { x: '25%', y: '0%' });
  await createConnector(t3.FALLBACK_2D.id, t3.VIEWER_3D.id, '', { x: '50%', y: '100%' }, { x: '75%', y: '0%' });

  await createConnector(t3.VIEWER_3D.id, t3.UI_PROTOCOL.id);
  await createConnector(t3.UI_PROTOCOL.id, t3.DEC_ACTION.id, '', { x: '50%', y: '100%' }, { x: '0%', y: '50%' });

  // Branch 2
  await createConnector(t3.UI_CAM_CAPTURE.id, t3.UI_MARKERLESS.id);
  await createConnector(t3.UI_MARKERLESS.id, t3.UI_STAFF_DRAFT.id);
  await createConnector(t3.UI_STAFF_DRAFT.id, t3.DEC_AI_AUDIT_PRO.id);

  await createConnector(t3.DEC_AI_AUDIT_PRO.id, t3.SRV_RAG_PRO.id, 'SÌ: Revisione AI', { x: '50%', y: '100%' }, { x: '50%', y: '0%' });
  await createConnector(t3.SRV_RAG_PRO.id, t3.UI_DIFF_PRO.id);
  await createConnector(t3.UI_DIFF_PRO.id, t3.DEC_LIBRARY_TIER.id);
  await createConnector(t3.DEC_AI_AUDIT_PRO.id, t3.DEC_LIBRARY_TIER.id, 'NO: Procedi con Bozza', { x: '100%', y: '50%' }, { x: '100%', y: '50%' });

  await createConnector(t3.DEC_LIBRARY_TIER.id, t3.UI_LEVEL_ATHLETE.id, 'Livello 1: Atleta', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t3.DEC_LIBRARY_TIER.id, t3.UI_LEVEL_CLUB.id, 'Livello 2: Club', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });

  await createConnector(t3.UI_LEVEL_ATHLETE.id, t3.VIEWER_TOGGLE_PRO.id, '', { x: '50%', y: '100%' }, { x: '25%', y: '0%' });
  await createConnector(t3.UI_LEVEL_CLUB.id, t3.VIEWER_TOGGLE_PRO.id, '', { x: '50%', y: '100%' }, { x: '75%', y: '0%' });
  await createConnector(t3.VIEWER_TOGGLE_PRO.id, t3.DEC_ACTION.id);

  // Branch 3
  await createConnector(t3.UI_TEXT_CREATE_PRO.id, t3.DEC_GATING_PRO.id);
  await createConnector(t3.DEC_GATING_PRO.id, t3.SRV_TWIN_SYNTH.id, 'Staff Autorizzato');
  await createConnector(t3.SRV_TWIN_SYNTH.id, t3.VIEWER_TOGGLE_PRO.id, 'Sintesi Digital Twin', { x: '50%', y: '100%' }, { x: '100%', y: '50%' });

  // Convergence
  await createConnector(t3.DEC_ACTION.id, t3.SAVE_EMR.id, 'Cartella EMR', { x: '0%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t3.DEC_ACTION.id, t3.SAVE_SQUAD.id, 'Microciclo Gara', { x: '100%', y: '50%' }, { x: '50%', y: '0%' });
  await createConnector(t3.SAVE_EMR.id, t3.END_READY_PRO.id, '', { x: '50%', y: '100%' }, { x: '25%', y: '0%' });
  await createConnector(t3.SAVE_SQUAD.id, t3.END_READY_PRO.id, '', { x: '50%', y: '100%' }, { x: '75%', y: '0%' });

  console.log('Tier 3 Complete Flowchart created successfully!');
  console.log('=== ALL WORK ON MIRO BOARD FINISHED WITH 100% COMPLETE PIPELINE & FULL CONNECTORS ===');
}

buildFullBoard().catch(console.error);
