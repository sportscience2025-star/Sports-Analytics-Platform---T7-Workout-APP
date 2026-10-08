/**
 * src/data/conditions/neurologiche-speciali.ts
 * Condizioni cliniche Neurologiche, Post-Chirurgiche, Reumatologiche e Popolazioni Speciali.
 * Conforme a Regola R1 (Zero any) e Regola R2 (Single Source of Truth).
 */

import type { ClinicalCondition } from '../../types/clinical';

export const neurologicalAndSpecialConditions: ClinicalCondition[] = [
  // ==========================================
  // --- PATOLOGIE REUMATOLOGICHE ED AUTOIMMUNI ---
  // ==========================================
  {
    id: 'artrite_reumatoide',
    name: 'Artrite Reumatoide',
    nameEn: 'Rheumatoid Arthritis',
    category: 'reumatologiche',
    description: 'Patologia infiammatoria autoimmune cronica sistemica che distrugge le membrane sinoviali articolari.',
    icon: 'joint',
    riskLevel: 'medium',
    exclusions: [
      'Carico elevato in fase di acuzie (flare)',
      'Esercizi balistici',
      'Overhead Press pesante',
      'Dips',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Isometria sottomassimale durante i flares, mobilità articolare dolce senza sovraccarico nei giorni migliori',
      },
    ],
  },
  {
    id: 'lupus_les',
    name: 'Lupus Eritematoso Sistemico',
    nameEn: 'Systemic Lupus (SLE)',
    category: 'reumatologiche',
    description: 'Malattia connettivale autoimmune sistemica che causa dolori articolari (artralgie) e forte astenia.',
    icon: 'joint',
    riskLevel: 'medium',
    exclusions: [
      'Allenamento intensivo sotto il sole diretto',
      'Carichi d\'impatto esplosivi',
      'Cedimento muscolare',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Intensità moderata RPE 5-6, focus su rinforzo muscolare posturale e allungamento fasciale',
      },
    ],
  },
  {
    id: 'artrosi_generalizzata',
    name: 'Artrosi Generalizzata',
    nameEn: 'Generalized Osteoarthritis',
    category: 'reumatologiche',
    description: 'Invecchiamento articolare diffuso con usura della cartilagine e formazione di osteofiti in più distretti.',
    icon: 'joint',
    riskLevel: 'medium',
    exclusions: [
      'Plyometrics',
      'Squat profondi liberi pesanti',
      'Lifting ad alta percentuale 1RM',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Box Squat controllato con ROM ridotto a 90° con manubri',
      },
      {
        pattern: 'General',
        modification: 'Lavoro con alte ripetizioni (15-20) a carico basso per lubrificare l\'articolazione',
      },
    ],
  },
  {
    id: 'artrite_psoriasica',
    name: 'Artrite Psoriasica',
    nameEn: 'Psoriatic Arthritis',
    category: 'reumatologiche',
    description: 'Associazione di psoriasi cutanea e artrite infiammatoria con frequente coinvolgimento di tendini e dita.',
    icon: 'joint',
    riskLevel: 'medium',
    exclusions: [
      'Presa ad altissimo carico (grip estremo)',
      'Balzi',
      'Esercizi ad alta eccentricità su tendini doloranti',
    ],
    adaptations: [
      {
        pattern: 'Row',
        modification: 'Utilizzo di impugnature morbide ergonomiche o cinghie di sollevamento',
      },
      {
        pattern: 'General',
        modification: 'Lavoro cardiovascolare a basso impatto unito a tonificazione parziale guidata',
      },
    ],
  },
  {
    id: 'raynaud_phenomenon',
    name: 'Fenomeno di Raynaud',
    nameEn: 'Raynaud\'s Phenomenon',
    category: 'reumatologiche',
    description: 'Vasospasmo delle dita (mani/piedi) scatenato dal freddo o stress, con pallore, cianosi e dolore.',
    icon: 'hand',
    riskLevel: 'low',
    exclusions: [
      'Allenamento all\'aperto al freddo senza protezione',
      'Prese metalliche fredde',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Guanti termici per prese, ambiente riscaldato, riscaldamento prolungato (10-15 min), evitare impugnature fredde',
      },
    ],
  },

  // ==========================================
  // --- CONDIZIONI NEUROLOGICHE & NEUROMUSCOLARI ---
  // ==========================================
  {
    id: 'sciatalgia',
    name: 'Sciatalgia / Radicolopatia',
    nameEn: 'Sciatica / Lumbar Radiculopathy',
    category: 'neurologiche',
    description: 'Dolore urente, formicolio o intorpidimento lungo il decorso del nervo sciatico (da compressione L4-S1).',
    icon: 'brain',
    riskLevel: 'medium',
    exclusions: [
      'Deadlift',
      'Stacco Rumeno pesante',
      'Squat profondo',
      'Crunch',
      'Rematore bilanciere libero',
    ],
    adaptations: [
      {
        pattern: 'Romanian Deadlift',
        modification: 'Evitare. Sostituire con ponte glutei a corpo libero o estensioni anca monolaterali guidate',
      },
      {
        pattern: 'Leg Press',
        modification: 'Esegui a ROM molto controllato (max 60°) con spalla inclinata',
      },
    ],
  },
  {
    id: 'neuropatia_diabetica',
    name: 'Neuropatia Diabetica',
    nameEn: 'Diabetic Neuropathy',
    category: 'neurologiche',
    description: 'Danno ai nervi periferici indotto dal diabete, con frequente perdita di sensibilità plantare e deficit di equilibrio.',
    icon: 'brain',
    riskLevel: 'medium',
    exclusions: [
      'Corsa su tapis roulant',
      'Jumping',
      'Lifting scalzo',
      'Salti su box',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Uso di calzature protettive specifiche, ispezionare i piedi dopo ogni seduta, focus su macchine stabili',
      },
    ],
  },
  {
    id: 'parkinson_lieve',
    name: 'Morbo di Parkinson Stabile',
    nameEn: 'Mild Parkinson\'s Disease',
    category: 'neurologiche',
    description: 'Disordine neurodegenerativo del movimento che provoca tremore a riposo, rigidità e instabilità posturale.',
    icon: 'brain',
    riskLevel: 'medium',
    exclusions: [
      'Sollevamenti olimpici complessi',
      'Esercizi su superfici instabili',
      'Esercizi di coordinazione rapida',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Focus su mobilità articolare, stabilità della marcia, esercizi su macchine guidate (Leg Press, Lat Machine)',
      },
    ],
  },
  {
    id: 'sclerosi_multipla_lieve',
    name: 'Sclerosi Multipla Stabile',
    nameEn: 'Stable Multiple Sclerosis',
    category: 'neurologiche',
    description: 'Malattia demielinizzante autoimmune. Caratterizzata da fatica, debolezza muscolare e potenziale intolleranza al calore.',
    icon: 'brain',
    riskLevel: 'medium',
    exclusions: [
      'Allenamento a temperature calde',
      'Cedimento muscolare totale',
      'Esercizi esplosivi',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Allenarsi in ambiente fresco, riposi prolungati (90-120s), RPE max 6-7, ventilazione attiva',
      },
    ],
  },
  {
    id: 'post_ictus_stabilizzato',
    name: 'Emiparesi Post-Ictus',
    nameEn: 'Post-Stroke Emiparesis',
    category: 'neurologiche',
    description: 'Deficit motorio e spasticità monolaterale residua dopo ictus cerebrale stabilizzato da almeno 12 mesi.',
    icon: 'brain',
    riskLevel: 'high',
    exclusions: [
      'Trazioni verticali appesi liberi',
      'Deadlift bilanciere libero',
      'Barbell Squat libero',
      'Valsalva forte',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Esercizi unilaterali per il lato sano, mobilizzazione assistita per il lato plegico, uso di macchine stabili',
      },
      {
        pattern: 'Leg Press',
        modification: 'Lavoro monolaterale o assistito con ROM ridotto al parallelo',
      },
    ],
  },
  {
    id: 'cervicobrachialgia',
    name: 'Cervicobrachialgia',
    nameEn: 'Cervicobrachial Neuralgia',
    category: 'neurologiche',
    description: 'Dolore che si irradia dal tratto cervicale al braccio lungo il decorso del plesso brachiale.',
    icon: 'brain',
    riskLevel: 'medium',
    exclusions: [
      'Trazioni verticali',
      'Overhead Press pesante',
      'Tirate al mento',
      'Farmer Carry pesante',
    ],
    adaptations: [
      {
        pattern: 'Lat Machine',
        modification: 'Sostituire con Pulley orizzontale a presa neutra stretta a gomiti bassi',
      },
      {
        pattern: 'Military Press',
        modification: 'Spinte con manubri parziali o alzate laterali leggere entro i 80°',
      },
    ],
  },
  {
    id: 'epilessia_controllata',
    name: 'Epilessia Controllata',
    nameEn: 'Controlled Epilepsy',
    category: 'neurologiche',
    description: 'Disturbo convulsivo in terapia farmacologica stabile. L\'esercizio è generalmente sicuro ma richiede precauzioni ambientali.',
    icon: 'brain',
    riskLevel: 'medium',
    exclusions: [
      'Nuoto solitario',
      'Arrampicata senza sicura',
      'Esercizi ad altezza senza protezione',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Allenamento con partner, evitare esaurimento totale e iperventilazione, idratazione costante',
      },
    ],
  },
  {
    id: 'vertigine_bppv',
    name: 'Vertigine Posizionale (VPPB)',
    nameEn: 'Benign Paroxysmal Positional Vertigo',
    category: 'neurologiche',
    description: 'Vertigini brevi e intense scatenate da cambiamenti di posizione della testa, comuni negli adulti.',
    icon: 'brain',
    riskLevel: 'medium',
    exclusions: [
      'Inversioni (headstand)',
      'Burpees',
      'Movimenti rapidi testa-giù',
      'Turkish Get-up',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Evitare cambi posturali rapidi (da supino a in piedi), preferire esercizi seduti o in piedi stazionari',
      },
    ],
  },
  {
    id: 'post_concussione',
    name: 'Sindrome Post-Concussiva',
    nameEn: 'Post-Concussion Syndrome',
    category: 'neurologiche',
    description: 'Sintomi persistenti (cefalea, vertigini, difficoltà di concentrazione) dopo trauma cranico, comuni in sport di contatto.',
    icon: 'brain',
    riskLevel: 'high',
    exclusions: [
      'Sport di contatto',
      'HIIT',
      'Esercizi con rischio caduta',
      'Sollevamenti pesanti',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Protocollo graduale di ritorno allo sport (6 fasi), iniziare con cammino leggero, incremento solo se asintomatico',
      },
    ],
  },
  {
    id: 'chronic_fatigue_syndrome',
    name: 'Sindrome da Fatica Cronica (CFS/ME)',
    nameEn: 'Chronic Fatigue Syndrome / ME',
    category: 'neurologiche',
    description: 'Affaticamento invalidante persistente con malessere post-sforzo (PEM), richiede gestione energetica attenta.',
    icon: 'brain',
    riskLevel: 'high',
    exclusions: [
      'Allenamento ad alta intensità',
      'Sessioni lunghe',
      'HIIT',
      'Crossfit',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Approccio \'pacing\': sessioni brevi (10-15 min), intensità molto bassa (RPE 2-3), monitorare PEM nelle 24-48h successive',
      },
    ],
  },

  // ==========================================
  // --- CONDIZIONI POST-CHIRURGICHE & RIABILITATIVE ---
  // ==========================================
  {
    id: 'post_op_lca',
    name: 'Ricostruzione LCA Post-Op',
    nameEn: 'Post-ACL Reconstruction (>6m)',
    category: 'post_chirurgiche',
    description: 'Esiti di ricostruzione chirurgica del Legamento Crociato Anteriore (da oltre 6 mesi) stabilizzata.',
    icon: 'surgery',
    riskLevel: 'medium',
    exclusions: [
      'Pistol Squat',
      'Leg Extension pesante nel ROM terminale (30-0°)',
      'Cambi di direzione repentini',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Box Squat controllato o multipower, spingendo le anche indietro per attivare i femorali',
      },
      {
        pattern: 'Leg Extension',
        modification: 'Sostituire con Leg Press a piedi alti spingendo dal tallone',
      },
    ],
  },
  {
    id: 'post_op_protesi_anca',
    name: 'Protesi Totale Anca Post-Op',
    nameEn: 'Post-Total Hip Replacement (>6m)',
    category: 'post_chirurgiche',
    description: 'Presenza di protesi d\'anca stabilizzata da oltre 6-12 mesi. Rischio di lussazione articolare in determinati angoli.',
    icon: 'surgery',
    riskLevel: 'high',
    exclusions: [
      'Flessione anca oltre 90°',
      'Intrarotazione dell\'anca',
      'Adduzione dell\'anca oltre la linea media',
      'Corsa',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Box Squat su box alto (ROM limitato a 85° di flessione anca), punte extra-ruotate',
      },
      {
        pattern: 'Leg Press',
        modification: 'Sconsigliata. In alternativa, ponte glutei statico o contrazione quadricipiti',
      },
    ],
  },
  {
    id: 'post_op_protesi_ginocchio',
    name: 'Protesi Totale Ginocchio Post-Op',
    nameEn: 'Post-Total Knee Replacement (>6m)',
    category: 'post_chirurgiche',
    description: 'Presenza di artroprotesi totale di ginocchio da oltre 6 mesi con limitazioni biomeccaniche di ROM residuo.',
    icon: 'surgery',
    riskLevel: 'high',
    exclusions: [
      'Squat profondo bilaterale',
      'Jump Squat',
      'Plyometrics',
      'Carico d\'impatto esplosivo',
    ],
    adaptations: [
      {
        pattern: 'Leg Press',
        modification: 'ROM limitato a 90° max, carico progressivo, spinta controllata',
      },
      {
        pattern: 'Squat',
        modification: 'Box Squat su sedia/panca controllato',
      },
    ],
  },
  {
    id: 'post_op_cuffia_rotatori',
    name: 'Riparazione Cuffia Spalla Post-Op',
    nameEn: 'Post-Rotator Cuff Repair (>6m)',
    category: 'post_chirurgiche',
    description: 'Esiti di sutura/riparazione della cuffia dei rotatori da oltre 6-9 mesi, con iniziale recupero del ROM attivo.',
    icon: 'surgery',
    riskLevel: 'medium',
    exclusions: [
      'Military Press pesante',
      'Dips',
      'Trazioni verticali libere pesanti',
      'Lanci sopra la testa',
    ],
    adaptations: [
      {
        pattern: 'Military Press',
        modification: 'Evitare bilanciere. Esegui Arnold press con manubri leggeri (2-6kg) sul piano scapolare',
      },
      {
        pattern: 'Lat Pulldown',
        modification: 'Lat Machine al petto a presa inversa stretta per stabilità scapolare',
      },
    ],
  },
  {
    id: 'post_op_colonna',
    name: 'Chirurgia Vertebrale Post-Op',
    nameEn: 'Post-Spine Surgery (>6m)',
    category: 'post_chirurgiche',
    description: 'Esiti di discectomia o artrodesi spinale stabilizzata da oltre 6-12 mesi. Colonna vulnerabile a carichi rotatori e compressione.',
    icon: 'surgery',
    riskLevel: 'high',
    exclusions: [
      'Deadlift con bilanciere',
      'Back Squat pesante',
      'Good Morning',
      'Torsione del busto sotto carico',
      'Valsalva',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Sostituire con Leg Press o Goblet Squat leggero con colonna rigidamente bloccata',
      },
      {
        pattern: 'Row',
        modification: 'Dumbbell Chest Supported Row su panca a 45° per azzerare il carico lombare',
      },
    ],
  },
  {
    id: 'post_op_mastectomia',
    name: 'Mastectomia Post-Op',
    nameEn: 'Post-Mastectomy (>6m)',
    category: 'post_chirurgiche',
    description: 'Esiti di asportazione chirurgica della ghiandola mammaria con potenziale alterazione linfatica del braccio.',
    icon: 'surgery',
    riskLevel: 'medium',
    exclusions: [
      'Panca Piana pesante',
      'Trazioni verticali appesi',
      'Push-up esplosivi',
      'Carico monolaterale estremo',
    ],
    adaptations: [
      {
        pattern: 'Bench Press',
        modification: 'Pulsazioni o dumbbell chest press a carichi controllati, ROM ridotto senza allungamento estremo',
      },
      {
        pattern: 'Lat Pulldown',
        modification: 'Presa neutra stretta davanti, carichi molto moderati per evitare linfedema',
      },
    ],
  },
  {
    id: 'post_op_meniscectomia',
    name: 'Post Meniscectomia Artroscopica',
    nameEn: 'Post Arthroscopic Meniscectomy',
    category: 'post_chirurgiche',
    description: 'Fase post-operatoria dopo rimozione parziale del menisco, con necessità di recupero graduale della funzione articolare.',
    icon: 'knee',
    riskLevel: 'medium',
    exclusions: [
      'Squat profondo (prime 8 settimane)',
      'Corsa (prime 6 settimane)',
      'Sport con impatto (prime 12 settimane)',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Quarter squat o leg press con ROM 0-70° nelle prime fasi, progressione graduale',
      },
      {
        pattern: 'General',
        modification: 'Rinforzo quadricipite isometrico e concentrico, propriocezione, cyclette senza resistenza',
      },
    ],
  },
  {
    id: 'post_op_fusione_spinale',
    name: 'Post Fusione Vertebrale (Artrodesi)',
    nameEn: 'Post Spinal Fusion',
    category: 'post_chirurgiche',
    description: 'Fase post-operatoria dopo artrodesi vertebrale. Richiede evitare flessione, rotazione e carico assiale per mesi.',
    icon: 'spine',
    riskLevel: 'high',
    exclusions: [
      'Deadlift',
      'Squat con bilanciere',
      'Rotazioni del tronco',
      'Flessioni della colonna',
      'Sit-up',
      'Corsa (prime 12 settimane)',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Solo esercizi approvati dal chirurgo, core isometrico in posizione neutra, nessun carico assiale fino a consolidamento confermato',
      },
    ],
  },
  {
    id: 'post_op_protesi_spalla',
    name: 'Post Protesi di Spalla',
    nameEn: 'Post Shoulder Arthroplasty',
    category: 'post_chirurgiche',
    description: 'Fase post-operatoria dopo sostituzione protesica della spalla (anatomica o inversa). Limitazioni permanenti su overhead pesante.',
    icon: 'shoulder',
    riskLevel: 'high',
    exclusions: [
      'Overhead Press pesante',
      'Pull-up',
      'Dips',
      'Sport di contatto con arto superiore',
      'Panca con bilanciere pesante',
    ],
    adaptations: [
      {
        pattern: 'Shoulder Press',
        modification: 'Spinte leggere con manubri entro ROM consentito dal chirurgo, mai > 90° abduzione inizialmente',
      },
      {
        pattern: 'General',
        modification: 'Seguire protocollo riabilitativo, rinforzo cuffia rotatori con elastici, progressione solo su autorizzazione medica',
      },
    ],
  },

  // ==========================================
  // --- POPOLAZIONI & CONDIZIONI SPECIALI ---
  // ==========================================
  {
    id: 'gravidanza_secondo_trimestre',
    name: 'Gravidanza (II Trimestre)',
    nameEn: 'Pregnancy (2nd Trimester)',
    category: 'speciali',
    description: 'Stato di gravidanza controllato. Presenza di lassità legamentosa indotta da relaxina e aumento peso anteriore.',
    icon: 'sport',
    riskLevel: 'medium',
    exclusions: [
      'Esercizi supini (Sindrome da compressione aortica)',
      'Heavy 1RM',
      'Valsalva',
      'Salti e Plyometrics',
      'Crunch',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Box Squat bilaterale con appoggio per stabilità (ROM 90°), stance comoda',
      },
      {
        pattern: 'Bench Press',
        modification: 'Sostituire con Incline Bench Press (30-45°) per evitare la posizione supina piatta',
      },
      {
        pattern: 'General',
        modification: 'Lavoro aerobico in fascia moderata (Borg 5-6), focus su allineamento e respirazione costale',
      },
    ],
  },
  {
    id: 'triade_atleta',
    name: 'Triade dell\'Atleta / RED-S',
    nameEn: 'Relative Energy Deficiency (RED-S)',
    category: 'speciali',
    description: 'Deficit energetico relativo nello sport con compromissione metabolica, amenorrea e bassa densità ossea.',
    icon: 'sport',
    riskLevel: 'high',
    exclusions: [
      'Cardio prolungato',
      'Alta intensità estenuante',
      'Cedimento muscolare',
      'Allenamento ad altissimo volume',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Carichi bassi-moderati per mantenimento osteogenico, riposo forzato tra i set, nutrizione++',
      },
    ],
  },
  {
    id: 'overtraining_syndrome',
    name: 'Sindrome da Overtraining',
    nameEn: 'Overtraining Syndrome',
    category: 'speciali',
    description: 'Accumulo di stress da allenamento accoppiato a scarso recupero, con calo prestazionale e alterazione neuroendocrina.',
    icon: 'sport',
    riskLevel: 'medium',
    exclusions: [
      'Sessioni intense',
      'Carico >80% RM',
      'Sessioni doppie',
      'HIIT',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Allenamento ridotto del 50% in volume e intensità (scarico attivo RPE 4-5) per 2-4 settimane',
      },
    ],
  },
  {
    id: 'spondilolisi_sportiva',
    name: 'Spondilolisi Sportiva Attiva',
    nameEn: 'Active Athletic Spondylolysis',
    category: 'speciali',
    description: 'Lesione da stress attiva dell\'arco vertebrale frequente in ginnasti, sollevatori e calciatori dovuta a ipereccentrici ripetuti.',
    icon: 'sport',
    riskLevel: 'high',
    exclusions: [
      'Tutti i sollevamenti liberi colonna',
      'Estensione colonna forzata',
      'Spinte in alto verticali',
      'Kettlebell Swing',
      'Jump Squat',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Rinforzo isometrico puro del core in posizione rigidamente neutra, riposo da impatto',
      },
    ],
  },
  {
    id: 'red_s',
    name: 'RED-S (Deficit Energetico Relativo nello Sport)',
    nameEn: 'Relative Energy Deficiency in Sport',
    category: 'speciali',
    description: 'Squilibrio tra apporto energetico e dispendio da allenamento, con impatto su ossa, metabolismo, ciclo mestruale e performance.',
    icon: 'sport',
    riskLevel: 'high',
    exclusions: [
      'Allenamento ad alto volume',
      'Restrizione calorica durante allenamento',
      'Doppie sessioni',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Riduzione volume del 40-50%, aumento apporto calorico, screening DEXA per densità ossea, supporto nutrizionale',
      },
    ],
  },
  {
    id: 'ehlers_danlos_ipermobilita',
    name: 'Sindrome di Ehlers-Danlos (Ipermobilità)',
    nameEn: 'Ehlers-Danlos Syndrome - Hypermobility Type',
    category: 'speciali',
    description: 'Iperlassità legamentosa congenita con instabilità articolare, sublussazioni frequenti e dolore cronico.',
    icon: 'joint',
    riskLevel: 'medium',
    exclusions: [
      'Stretching estremo',
      'Iperestensioni',
      'Esercizi balistici',
      'Pesi pesanti senza controllo',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Rinforzo muscolare isometrico e concentrico per stabilizzazione articolare, ROM controllato (mai a fine corsa), evitare iperestensioni',
      },
    ],
  },
  {
    id: 'sarcopenia',
    name: 'Sarcopenia (Perdita Muscolare Età-Correlata)',
    nameEn: 'Sarcopenia',
    category: 'speciali',
    description: 'Perdita progressiva di massa e forza muscolare legata all\'invecchiamento, con rischio aumentato di cadute e fragilità.',
    icon: 'muscle',
    riskLevel: 'low',
    exclusions: [],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Programma di resistenza 2-3x/settimana con progressione lenta, focus su movimenti funzionali, proteine adeguate (1.2-1.6 g/kg)',
      },
    ],
  },
  {
    id: 'diastasi_retti_postpartum',
    name: 'Diastasi dei Retti Addominali (Post-Partum)',
    nameEn: 'Post-Partum Diastasis Recti',
    category: 'speciali',
    description: 'Separazione dei muscoli retti dell\'addome lungo la linea alba dopo la gravidanza, con debolezza del core e possibile protrusione.',
    icon: 'core',
    riskLevel: 'medium',
    exclusions: [
      'Crunch',
      'Sit-up',
      'Plank frontale pesante (inizialmente)',
      'V-up',
      'Toes to Bar',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Attivazione trasverso addominale, respirazione diaframmatica, esercizi ipopressivi, progressione graduale verso plank modificato',
      },
    ],
  },
];

export const neurologicheSpecialiConditions = neurologicalAndSpecialConditions;
