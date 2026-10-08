/**
 * src/data/conditions/arti-inferiori.ts
 * Condizioni cliniche e muscolo-scheletriche per Arti Inferiori (Anca, Ginocchio, Caviglia e Piede).
 * Conforme a Regola R1 (Zero any) e Regola R2 (Single Source of Truth).
 */

import type { ClinicalCondition } from '../../types/clinical';

export const lowerLimbConditions: ClinicalCondition[] = [
  {
    id: 'hip_problem',
    name: 'Anca Problematica',
    nameEn: 'Hip Pain',
    category: 'arti_inferiori',
    description: 'Dolore, rigidità o limitazione del movimento coxofemorale generica.',
    icon: 'hip',
    riskLevel: 'low',
    exclusions: [
      'Squat Profondo',
      'Split Squat Deep',
      'Leg Curl Deep',
    ],
    adaptations: [
      {
        pattern: 'Back Squat',
        modification: 'ROM limitato a 80-90°, stance leggermente allargata',
      },
      {
        pattern: 'Hip Thrust',
        modification: 'ROM controllato nei gradi intermedi (non forzare lockout)',
      },
      {
        pattern: 'Leg Press',
        modification: 'Piedi alti e larghi, ROM controllato, carico moderato',
      },
    ],
  },
  {
    id: 'coxarthrosis',
    name: 'Artrosi dell\'Anca / Coxartrosi',
    nameEn: 'Hip Osteoarthritis',
    category: 'arti_inferiori',
    description: 'Degenerazione progressiva della cartilagine dell\'articolazione dell\'anca.',
    icon: 'hip',
    riskLevel: 'medium',
    exclusions: [
      'Squat Ass to Grass',
      'Box Jump',
      'Plyometrics',
      'Lunge Deep',
    ],
    adaptations: [
      {
        pattern: 'Leg Press',
        modification: 'ROM 90° max, stance comoda, -30% carico per evitare pinch',
      },
      {
        pattern: 'Squat',
        modification: 'Box Squat su box alta, enfasi su catena posteriore',
      },
    ],
  },
  {
    id: 'fai',
    name: 'Conflitto Femoro-Acetabolare',
    nameEn: 'Femoroacetabular Impingement (FAI)',
    category: 'arti_inferiori',
    description: 'Anomalia morfologica dell\'anca che provoca attrito tra testa femorale e acetabolo in flessione interna.',
    icon: 'hip',
    riskLevel: 'medium',
    exclusions: [
      'Deep Squat',
      'Leg Press Deep',
      'Affondi in avanti',
      'High Step Up',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Stance più larga, punte dei piedi ruotate in fuori (30°), ROM 90°',
      },
      {
        pattern: 'Leg Press',
        modification: 'Piedi larghi, non superare i 90° di flessione dell\'anca',
      },
    ],
  },
  {
    id: 'hamstring_strain',
    name: 'Ischio-Crurali Tesi',
    nameEn: 'Tight Hamstrings',
    category: 'arti_inferiori',
    description: 'Accorciamento o sovraccarico cronico dei muscoli posteriori della coscia.',
    icon: 'muscle',
    riskLevel: 'low',
    exclusions: [
      'Deficit Deadlift',
      'Romanian Deadlift Full',
      'Leg Curl Heavy',
    ],
    adaptations: [
      {
        pattern: 'Deadlift',
        modification: 'RDL parziale o stacco da terra rialzato (block pull), ROM ridotto',
      },
      {
        pattern: 'Leg Curl',
        modification: 'ROM ridotto a 60° max, carichi medio-leggeri',
      },
      {
        pattern: 'Hip Thrust',
        modification: 'ROM 90°, focus su contrazione dei glutei, no crampo posteriore',
      },
    ],
  },
  {
    id: 'knee_generic',
    name: 'Ginocchio Problematico',
    nameEn: 'Knee Pain',
    category: 'arti_inferiori',
    description: 'Stati algici non specifici dell\'articolazione del ginocchio.',
    icon: 'knee',
    riskLevel: 'low',
    exclusions: [
      'Squat Profondo',
      'Jump Squat',
      'Pogo Jump',
      'Leg Extension Heavy',
    ],
    adaptations: [
      {
        pattern: 'Back Squat',
        modification: 'Box Squat controllato al parallelo o Goblet Squat ROM 90°',
      },
      {
        pattern: 'Leg Press',
        modification: 'ROM limitato a 90° mantenendo la spinta sul tallone',
      },
      {
        pattern: 'Leg Extension',
        modification: 'ROM 60-90° isometrica o carico leggero',
      },
    ],
  },
  {
    id: 'itbs',
    name: 'Sindrome Banda Ileotibiale',
    nameEn: 'Iliotibial Band Syndrome',
    category: 'arti_inferiori',
    description: 'Infiammazione da frizione della bandelletta ileotibiale sul condilo femorale esterno.',
    icon: 'ligament',
    riskLevel: 'low',
    exclusions: [
      'Running',
      'Lateral Leg Raise',
      'Split Squat Deep',
      'High Volume Biking',
    ],
    adaptations: [
      {
        pattern: 'Leg Press',
        modification: 'Piedi saldi, no intrarotazione ginocchio, ROM 90° controllato',
      },
      {
        pattern: 'Hip Thrust',
        modification: 'Uso di elastico moderato sopra le ginocchia per stabilità',
      },
      {
        pattern: 'Squat',
        modification: 'ROM ridotto al parallelo, enfasi eccentrica 4 secondi',
      },
    ],
  },
  {
    id: 'gonarthrosis',
    name: 'Artrosi Ginocchio / Gonartrosi',
    nameEn: 'Knee Osteoarthritis',
    category: 'arti_inferiori',
    description: 'Patologia degenerativa della cartilagine del ginocchio con rigidità e dolore da carico.',
    icon: 'knee',
    riskLevel: 'medium',
    exclusions: [
      'Jump',
      'Depth Jump',
      'Squat Profondo',
      'Leg Extension Heavy',
    ],
    adaptations: [
      {
        pattern: 'Leg Press',
        modification: 'ROM 90° max, piedi comodi, carico ridotto del 30%',
      },
      {
        pattern: 'Leg Extension',
        modification: 'Esegui ROM parziale 60-90° a basso carico per pompaggio',
      },
      {
        pattern: 'Hip Thrust',
        modification: 'ROM controllato bilaterale, ottimo per scaricare il ginocchio',
      },
    ],
  },
  {
    id: 'meniscus',
    name: 'Lesione Meniscale',
    nameEn: 'Meniscus Tear',
    category: 'arti_inferiori',
    description: 'Lacerazione o trauma a carico dei menischi (interno/esterno) con potenziale blocco articolare.',
    icon: 'knee',
    riskLevel: 'medium',
    exclusions: [
      'Twist',
      'Rotazione ginocchio',
      'Split Squat',
      'Affondi esplosivi',
    ],
    adaptations: [
      {
        pattern: 'Leg Press',
        modification: 'Piedi paralleli e fissi, ROM max 80°, controllo eccentrico',
      },
      {
        pattern: 'Romanian Deadlift',
        modification: 'Perfetto per allungamento catena posteriore senza piegare le ginocchia',
      },
      {
        pattern: 'Leg Curl',
        modification: 'ROM max 60°, carichi bassi',
      },
    ],
  },
  {
    id: 'patellar_tendonitis',
    name: 'Tendinopatia Rotulea',
    nameEn: 'Patellar Tendonitis',
    category: 'arti_inferiori',
    description: 'Infiammazione o tendinosi del tendine rotuleo, comune nei saltatori (Jumper\'s Knee).',
    icon: 'knee',
    riskLevel: 'low',
    exclusions: [
      'Jump Squat',
      'Leg Extension Heavy',
      'Plyometrics',
      'Sprinting',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Box Squat lento con salita e discesa controllata, no rimbalzo in basso',
      },
      {
        pattern: 'Leg Press',
        modification: 'Enfasi sulla fase eccentrica (4s discesa), spinta dal tallone',
      },
    ],
  },
  {
    id: 'weak_ankle',
    name: 'Caviglia Debole/Instabile',
    nameEn: 'Weak Ankle',
    category: 'arti_inferiori',
    description: 'Instabilità cronica e deficit propriocettivo dopo distorsioni ricorrenti.',
    icon: 'foot',
    riskLevel: 'low',
    exclusions: [
      'Jump Rope',
      'Single Leg Jump',
      'Plyometrics High',
    ],
    adaptations: [
      {
        pattern: 'Back Squat',
        modification: 'Bilanciere posteriore ma con focus su allineamento ginocchio-caviglia',
      },
      {
        pattern: 'Jump Squat',
        modification: 'Sostituire con saltelli controllati a terra, scarpe ben supportive',
      },
      {
        pattern: 'Leg Press',
        modification: 'Posizione stabile del piede, no flessione laterale',
      },
    ],
  },
  {
    id: 'plantar_fasciitis',
    name: 'Fasciite Plantare',
    nameEn: 'Plantar Fasciitis',
    category: 'arti_inferiori',
    description: 'Infiammazione dolorosa dell\'aponeurosi plantare che unisce il tallone alle dita.',
    icon: 'foot',
    riskLevel: 'low',
    exclusions: [
      'Jump Rope',
      'Pogo Jump',
      'Running',
      'Barefoot Lifting',
    ],
    adaptations: [
      {
        pattern: 'Jump Squat',
        modification: 'Sostituire con Squat isometrico a muro o saltelli leggeri ammortizzati',
      },
      {
        pattern: 'Leg Press',
        modification: 'Spinta dal mesopiede, evitare di puntare solo le dita',
      },
      {
        pattern: 'Romanian Deadlift',
        modification: 'Piedi appoggiati su superficie piana rigida con scarpe ortopediche',
      },
    ],
  },
  {
    id: 'achilles_tendonitis',
    name: 'Tendinopatia Achillea',
    nameEn: 'Achilles Tendonitis',
    category: 'arti_inferiori',
    description: 'Dolore e infiammazione del tendine d\'Achille associato a sovraccarico ciclico.',
    icon: 'foot',
    riskLevel: 'low',
    exclusions: [
      'Calf Raise Explosive',
      'Sprinting',
      'Plyometrics',
    ],
    adaptations: [
      {
        pattern: 'Calf Raise',
        modification: 'Calf Raise controllati, salita 2s, tenuta 2s, discesa 3s, no esplosività',
      },
      {
        pattern: 'Leg Press',
        modification: 'Evitare allungamento estremo della caviglia a fine corsa',
      },
    ],
  },
  {
    id: 'lesione_lca',
    name: 'Lesione LCA non operata',
    nameEn: 'ACL Tear (Conservative)',
    category: 'arti_inferiori',
    description: 'Instabilità articolare da rottura completa o parziale del Legamento Crociato Anteriore gestita senza chirurgia.',
    icon: 'knee',
    riskLevel: 'medium',
    exclusions: [
      'Rotazioni repentine',
      'Pistol Squat',
      'Lunges con affondo lungo',
      'Pogo Jump',
      'Plyometrics',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Box Squat controllato con ROM a 90° e tibia il più possibile verticale',
      },
      {
        pattern: 'Leg Press',
        modification: 'ROM parziale 80° con spinta tallone costante, no lockout',
      },
    ],
  },
  {
    id: 'lesione_lcp',
    name: 'Lesione LCP',
    nameEn: 'PCL Tear',
    category: 'arti_inferiori',
    description: 'Lesione del Legamento Crociato Posteriore che limita la stabilità alla traslazione posteriore della tibia.',
    icon: 'knee',
    riskLevel: 'medium',
    exclusions: [
      'Leg Curl Heavy',
      'Flessione profonda ginocchio >100°',
      'Split Squat Deep',
    ],
    adaptations: [
      {
        pattern: 'Leg Curl',
        modification: 'Sostituire con stacco rumeno (lavoro eccentrico femorali a ginocchio semiteso)',
      },
      {
        pattern: 'Leg Press',
        modification: 'ROM limitato a 75° posizionando i piedi alti sulla pedana',
      },
    ],
  },
  {
    id: 'condromalacia_rotulea',
    name: 'Condromalacia Rotulea',
    nameEn: 'Chondromalacia Patellae',
    category: 'arti_inferiori',
    description: 'Rammollimento e usura della cartilagine rotulea, aggravata dal carico in flessione profonda.',
    icon: 'knee',
    riskLevel: 'low',
    exclusions: [
      'Squat Profondo',
      'Leg Extension',
      'Lunges Deep',
      'Step Up alti',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Goblet Squat o Box Squat a 90° per ridurre la pressione retro-rotulea',
      },
      {
        pattern: 'Leg Press',
        modification: 'Piedi alti e larghi, spinta sui talloni, ROM controllato a 80-90°',
      },
    ],
  },
  {
    id: 'periostite_tibiale',
    name: 'Periostite Tibiale',
    nameEn: 'Shin Splints',
    category: 'arti_inferiori',
    description: 'Infiammazione del periostio lungo la tibia, comune in corridori e saltatori.',
    icon: 'leg',
    riskLevel: 'low',
    exclusions: [
      'Running',
      'Jump Rope',
      'Pogo Jump',
      'Plyometrics',
    ],
    adaptations: [
      {
        pattern: 'Jump Squat',
        modification: 'Sostituire con Squat statici o spinte su pressa controllate',
      },
      {
        pattern: 'Calf Raise',
        modification: 'Focus su fase eccentrica lenta a basso carico, no balzi',
      },
    ],
  },
  {
    id: 'frattura_stress_tibiale',
    name: 'Frattura da Stress Tibiale',
    nameEn: 'Tibial Stress Fracture',
    category: 'arti_inferiori',
    description: 'Microfrattura dell\'osso tibiale causata da microtraumi ripetuti e scarso riposo.',
    icon: 'leg',
    riskLevel: 'high',
    exclusions: [
      'Running',
      'Jumping',
      'Squat pesante',
      'Deadlift pesante',
      'Plyometrics',
      'Pogo Jump',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Solo esercizi senza carico d\'impatto (nuoto, cyclette leggera, macchine guidate)',
      },
      {
        pattern: 'Leg Press',
        modification: 'Carico ridotto al 50%, no impatto, solo spinta fluida',
      },
    ],
  },
  {
    id: 'pubalgia_sportiva',
    name: 'Pubalgia Sportiva',
    nameEn: 'Athletic Pubalgia',
    category: 'arti_inferiori',
    description: 'Sindrome dolorosa dell\'inguine e del pube che coinvolge adduttori e muscoli addominali.',
    icon: 'hip',
    riskLevel: 'medium',
    exclusions: [
      'Squat largo',
      'Affondi laterali',
      'Leg Press largo',
      'Crunch obliqui rotatori',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Stance molto stretta, punte quasi dritte, ROM 90° controllato',
      },
      {
        pattern: 'Hip Thrust',
        modification: 'Inserire pallone tra le ginocchia da stringere isometricamente',
      },
    ],
  },
  {
    id: 'borsite_trocanterica',
    name: 'Borsite Trocanterica',
    nameEn: 'Trochanteric Bursitis',
    category: 'arti_inferiori',
    description: 'Infiammazione della borsa sierosa sopra il grande trocantere del femore.',
    icon: 'hip',
    riskLevel: 'low',
    exclusions: [
      'Abductor Machine Heavy',
      'Affondi incrociati',
      'Dormire/caricare sul fianco colpito',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Box Squat con stance parallela stretta, evitare allargamento anca',
      },
      {
        pattern: 'Leg Press',
        modification: 'ROM controllato bilaterale, posizionamento comodo senza pinch',
      },
    ],
  },
  {
    id: 'distorsione_caviglia_cronica',
    name: 'Distorsione Caviglia Cronica',
    nameEn: 'Chronic Ankle Sprain',
    category: 'arti_inferiori',
    description: 'Instabilità da lesioni ripetute dei legamenti della caviglia con lasso articolare.',
    icon: 'foot',
    riskLevel: 'low',
    exclusions: [
      'Jump Rope',
      'Balance Board estreme',
      'Pistol Squat a corpo libero',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Eseguiti con scarpe rigide supportive o supporto talloni (tacco)',
      },
      {
        pattern: 'Jump Squat',
        modification: 'Sostituire con salti controllati atterrando su tappeto morbido',
      },
    ],
  },
  {
    id: 'lesione_collaterale',
    name: 'Lesione Legamento Collaterale',
    nameEn: 'MCL/LCL Knee Sprain',
    category: 'arti_inferiori',
    description: 'Distorsione o rottura parziale dei legamenti collaterali (mediale o laterale) del ginocchio.',
    icon: 'knee',
    riskLevel: 'medium',
    exclusions: [
      'Squat con stance larga',
      'Lateral Lunges',
      'Valgismo ginocchio indotto',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Squat guidato al multipower o stance stretta parallela, ginocchia in linea',
      },
      {
        pattern: 'Leg Press',
        modification: 'Uso di fascia di stabilità, spinta parallela controllata',
      },
    ],
  },
  {
    id: 'sindrome_patellofemorale',
    name: 'Sindrome Patellofemorale',
    nameEn: 'Patellofemoral Pain Syndrome (PFPS)',
    category: 'arti_inferiori',
    description: 'Sindrome da mal-allineamento rotuleo con dolore retro o peri-rotuleo.',
    icon: 'knee',
    riskLevel: 'low',
    exclusions: [
      'Leg Extension',
      'Lunges Deep',
      'Squat profondo bilaterale pesante',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Box Squat controllato con discesa controllata di 3s',
      },
      {
        pattern: 'Leg Press',
        modification: 'Piedi posizionati alti sulla pedana per preservare l\'angolo rotula',
      },
    ],
  },
  {
    id: 'quadriceps_strain',
    name: 'Stiramento/Strappo Quadricipite',
    nameEn: 'Quadriceps Strain',
    category: 'arti_inferiori',
    description: 'Lesione muscolare del quadricipite (retto femorale) da contrazione eccentrica violenta o sprint.',
    icon: 'leg',
    riskLevel: 'medium',
    exclusions: [
      'Sprint',
      'Leg Extension pesante',
      'Jump Squat',
      'Box Jump',
      'Calci',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Squat isometrico a parete (wall sit) a 60° di flessione, progressione graduale',
      },
      {
        pattern: 'Leg Press',
        modification: 'Leg Press con ROM ridotto (0-60°), carico leggero, fase eccentrica lenta (4s)',
      },
    ],
  },
  {
    id: 'groin_strain',
    name: 'Stiramento Adduttori / Inguine',
    nameEn: 'Groin/Adductor Strain',
    category: 'arti_inferiori',
    description: 'Lesione muscolare degli adduttori dell\'anca, comune in sport con cambi di direzione e calci.',
    icon: 'leg',
    riskLevel: 'medium',
    exclusions: [
      'Adductor Machine pesante',
      'Affondi laterali profondi',
      'Sprint laterale',
      'Calci',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Squat con stance stretta (shoulder-width), evitare sumo squat',
      },
      {
        pattern: 'Leg Press',
        modification: 'Piedi paralleli, stance media, evitare adduzione forzata',
      },
    ],
  },
  {
    id: 'compartment_syndrome_chronic',
    name: 'Sindrome Compartimentale Cronica',
    nameEn: 'Chronic Exertional Compartment Syndrome',
    category: 'arti_inferiori',
    description: 'Aumento della pressione nei compartimenti muscolari della gamba durante l\'esercizio, con dolore e parestesie.',
    icon: 'leg',
    riskLevel: 'medium',
    exclusions: [
      'Corsa prolungata',
      'Sprint ripetuti',
      'Calf Raise ad alto volume',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Esercizio a basso impatto (bici, nuoto), ridurre volume corsa, stretching post-esercizio',
      },
    ],
  },
  {
    id: 'piriformis_syndrome',
    name: 'Sindrome del Piriforme',
    nameEn: 'Piriformis Syndrome',
    category: 'arti_inferiori',
    description: 'Compressione del nervo sciatico da parte del muscolo piriforme ipertrofico o contratto, con dolore gluteo irradiato alla gamba.',
    icon: 'hip',
    riskLevel: 'low',
    exclusions: [
      'Seduta prolungata su macchine',
      'Squat profondo con extrarotazione forzata',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Squat parallelo con stance neutra, evitare extrarotazione forzata',
      },
      {
        pattern: 'General',
        modification: 'Stretching piriforme e rotatori esterni prima e dopo ogni sessione',
      },
    ],
  },
  {
    id: 'frattura_stress_metatarsale',
    name: 'Frattura da Stress Metatarsale',
    nameEn: 'Metatarsal Stress Fracture',
    category: 'arti_inferiori',
    description: 'Frattura da sovraccarico ripetitivo delle ossa metatarsali, frequente nei runner e in attività ad alto impatto.',
    icon: 'foot',
    riskLevel: 'high',
    exclusions: [
      'Corsa',
      'Salti',
      'Box Jump',
      'Esercizi in piedi ad alto impatto',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Solo esercizi seduti o sdraiati (upper body, core), zero carico sull\'avampiede fino a guarigione',
      },
    ],
  },
  {
    id: 'frattura_stress_collo_femore',
    name: 'Frattura da Stress del Collo del Femore',
    nameEn: 'Femoral Neck Stress Fracture',
    category: 'arti_inferiori',
    description: 'Frattura da sovraccarico della regione prossimale del femore, grave e frequente nei runner di fondo e nella triade dell\'atleta.',
    icon: 'hip',
    riskLevel: 'high',
    exclusions: [
      'Qualsiasi attività in carico su arto inferiore',
      'Corsa',
      'Salti',
      'Squat',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Riposo assoluto dall\'impatto, solo upper body e core supino, consulenza ortopedica urgente',
      },
    ],
  },
  {
    id: 'morton_neuroma',
    name: 'Neuroma di Morton',
    nameEn: 'Morton\'s Neuroma',
    category: 'arti_inferiori',
    description: 'Ispessimento del nervo interdigitale (tipicamente 3°-4° spazio) con dolore bruciante all\'avampiede sotto carico.',
    icon: 'foot',
    riskLevel: 'low',
    exclusions: [
      'Esercizi in punta di piedi prolungati',
      'Scarpe strette durante allenamento',
    ],
    adaptations: [
      {
        pattern: 'Calf Raise',
        modification: 'Calf raise a piede piatto o con supporto metatarsale, evitare flessione plantare forzata',
      },
      {
        pattern: 'General',
        modification: 'Scarpe larghe in avampiede, plantare con pad metatarsale',
      },
    ],
  },
  {
    id: 'alluce_valgo',
    name: 'Alluce Valgo (Bunion)',
    nameEn: 'Hallux Valgus / Bunion',
    category: 'arti_inferiori',
    description: 'Deviazione laterale dell\'alluce con prominenza mediale dolorosa, aggravata da calzature strette e carico sull\'avampiede.',
    icon: 'foot',
    riskLevel: 'low',
    exclusions: [
      'Esercizi in punta stretta',
      'Corsa su terreni irregolari',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Calzature a pianta larga, toe spacer durante allenamento, evitare flessione plantare estrema',
      },
    ],
  },
];

export const artiInferioriConditions = lowerLimbConditions;
