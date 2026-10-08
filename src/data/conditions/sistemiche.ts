/**
 * src/data/conditions/sistemiche.ts
 * Condizioni cliniche sistemiche, cardiovascolari, polmonari e metaboliche.
 * Conforme a Regola R1 (Zero any) e Regola R2 (Single Source of Truth).
 */

import type { ClinicalCondition } from '../../types/clinical';

export const systemicConditions: ClinicalCondition[] = [
  {
    id: 'hypertension',
    name: 'Ipertensione Arteriosa',
    nameEn: 'Hypertension',
    category: 'sistemiche',
    description: 'Pressione arteriosa sistolica e diastolica cronicamente elevata (>140/90 mmHg).',
    icon: 'heart',
    riskLevel: 'medium',
    exclusions: [
      'Manovra di Valsalva',
      'Isometria prolungata oltre 6-8 secondi',
      '1RM massimali',
      'Decline Bench',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Intensità max 70% 1RM, respirazione continua controllata, recupero di 90s',
      },
      {
        pattern: 'Deadlift',
        modification: 'Intensità controllata, mai andare in apnea, espirazione attiva nella fase concentrica',
      },
      {
        pattern: 'General',
        modification: 'Monitorare la pressione prima e dopo gli allenamenti, evitare sbalzi repentini testa-piedi',
      },
    ],
  },
  {
    id: 'ischemic_heart',
    name: 'Cardiopatia Ischemica Stabile',
    nameEn: 'Ischemic Heart Disease',
    category: 'sistemiche',
    description: 'Riduzione cronica del flusso ematico al miocardio controllata farmacologicamente.',
    icon: 'heart',
    riskLevel: 'high',
    exclusions: [
      'HIIT estremo',
      'Valsalva estremo',
      '1RM massimali',
      'Supersets pesanti senza recupero',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Intensità controllata (50-70% RM), scala di Borg (RPE 6-7 max), riposi lunghi 2 minuti',
      },
    ],
  },
  {
    id: 'diabetes',
    name: 'Diabete Mellito Tipo 2',
    nameEn: 'Type 2 Diabetes',
    category: 'sistemiche',
    description: 'Insulino-resistenza cronica con iperglicemia sistemica.',
    icon: 'drop',
    riskLevel: 'low',
    exclusions: [
      'Sessioni a digiuno senza controllo',
      'Volume estremo senza idratazione',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Lavoro con medio volume (65-80% 1RM), idratazione accurata, monitorare glicemia periferica',
      },
    ],
  },
  {
    id: 'asthma',
    name: 'Asma Bronchiale',
    nameEn: 'Bronchial Asthma',
    category: 'sistemiche',
    description: 'Broncocostrizione e infiammazione delle vie aeree indotta anche da sforzo fisico intenso.',
    icon: 'lungs',
    riskLevel: 'low',
    exclusions: [
      'High Intensity Cardio prolungato',
      'Burpees esplosivi ad alto volume',
      'Allenamento in climi freddi/secchi',
    ],
    adaptations: [
      {
        pattern: 'Plyometrics',
        modification: 'Massimo 5 ripetizioni consecutive, recupero completo di 2 minuti',
      },
      {
        pattern: 'General',
        modification: 'Riscaldamento lungo e progressivo (15 minuti), uso di broncodilatatore al bisogno',
      },
    ],
  },
  {
    id: 'obesity',
    name: 'Obesità di Grado I/II',
    nameEn: 'Obesity',
    category: 'sistemiche',
    description: 'Elevato indice di massa corporea (BMI > 30) con forte sovraccarico su colonna, anche e ginocchia.',
    icon: 'body',
    riskLevel: 'low',
    exclusions: [
      'Jump Squat profondo',
      'Pogo Jump',
      'Running su asfalto',
      'Box Jump',
    ],
    adaptations: [
      {
        pattern: 'Leg Press',
        modification: 'ROM parziale 90° bilaterale, carico progressivo',
      },
      {
        pattern: 'General',
        modification: 'Privilegiare macchine guidate o esercizi stabili seduti, inserire camminata in salita',
      },
    ],
  },
  {
    id: 'osteoporosi',
    name: 'Osteoporosi',
    nameEn: 'Osteoporosis',
    category: 'sistemiche',
    description: 'Forte riduzione della densità minerale ossea con elevato rischio fratturativo vertebrale e femorale.',
    icon: 'spine',
    riskLevel: 'high',
    exclusions: [
      'Flessione colonna anteriore',
      'Torsione colonna sotto carico',
      'Good Morning',
      'Sit-up',
      'Box Jump',
      'High Impact',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Wall Slide o Goblet Squat leggero con colonna rigidamente neutra',
      },
      {
        pattern: 'General',
        modification: 'Lavoro contro gravità a medio carico (stimolo meccanico osteogenetico) controllato',
      },
    ],
  },
  {
    id: 'fibromialgia',
    name: 'Sindrome Fibromialgica',
    nameEn: 'Fibromyalgia',
    category: 'sistemiche',
    description: 'Dolore muscoloscheletrico diffuso associato ad affaticabilità estrema e disturbi del sonno.',
    icon: 'body',
    riskLevel: 'medium',
    exclusions: [
      'Cedimento muscolare',
      'Esercizi eccentrici estremi',
      'Allenamento ad altissima intensità',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Volume d\'allenamento basso, frequenza costante, RPE max 5-6, riscaldamento prolungato',
      },
    ],
  },
  {
    id: 'diabete_tipo_1',
    name: 'Diabete Mellito Tipo 1',
    nameEn: 'Type 1 Diabetes',
    category: 'sistemiche',
    description: 'Carenza assoluta di insulina endogena con forte rischio di ipoglicemia improvvisa da sforzo.',
    icon: 'drop',
    riskLevel: 'medium',
    exclusions: [
      'Cardio prolungato senza carboidrati',
      'Allenamento ad altissimo volume solitario',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Tenere carboidrati a rapido assorbimento a portata di mano, evitare sforzi estremi nel picco dell\'insulina',
      },
    ],
  },
  {
    id: 'sindrome_metabolica',
    name: 'Sindrome Metabolica',
    nameEn: 'Metabolic Syndrome',
    category: 'sistemiche',
    description: 'Coesistenza di obesità viscerale, dislipidemia, ipertensione e alterata glicemia con alto rischio cardiovascolare.',
    icon: 'heart',
    riskLevel: 'medium',
    exclusions: [
      'Valsalva prolungato',
      '1RM massimali',
      'HIIT estremo iniziale',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Attività mista forza-resistenza a medio-alta intensità (65-75% VO2max), monitoraggio',
      },
    ],
  },
  {
    id: 'aritmia_cardiaca',
    name: 'Aritmia Cardiaca Controllata',
    nameEn: 'Cardiac Arrhythmia',
    category: 'sistemiche',
    description: 'Anomalia stabile del ritmo cardiaco controllata farmacologicamente e da cardioversore/pacemaker.',
    icon: 'heart',
    riskLevel: 'medium',
    exclusions: [
      'Frequenza cardiaca > 85% massimale teorica',
      'Cardio hiit estremo',
      'Valsalva pesante',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Cardiofrequenzimetro obbligatorio, intensità fissa moderata, pause complete da 90s',
      },
    ],
  },
  {
    id: 'scompenso_cardiaco_lieve',
    name: 'Scompenso Cardiaco Lieve',
    nameEn: 'Mild Heart Failure',
    category: 'sistemiche',
    description: 'Inefficienza lieve della pompa cardiaca (NYHA Classe I/II), tolleranza allo sforzo ridotta.',
    icon: 'heart',
    riskLevel: 'high',
    exclusions: [
      '1RM massimali',
      'Isometria pura pesante',
      'Superamento soglia anaerobica',
      'Push Press pesante',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Lavoro a circuito leggero, RPE 4-5 max, focus su muscoli periferici con carichi bassi',
      },
    ],
  },
  {
    id: 'ipotiroidismo_grave',
    name: 'Ipotiroidismo Clinico',
    nameEn: 'Hypothyroidism',
    category: 'sistemiche',
    description: 'Deficit di ormoni tiroidei con metabolismo basale fortemente ridotto, letargia e bradicardia.',
    icon: 'body',
    riskLevel: 'low',
    exclusions: [
      'Cardio ad altissima intensità prolungato',
      'Sessioni doppie nello stesso giorno',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Intensità medio-bassa, recuperi generosi, focus su stabilità e rinforzo generale progressivo',
      },
    ],
  },
  {
    id: 'anemia',
    name: 'Anemia Moderata',
    nameEn: 'Anemia',
    category: 'sistemiche',
    description: 'Bassi livelli di emoglobina circolante con ridotto trasporto di ossigeno e frequente tachicardia.',
    icon: 'drop',
    riskLevel: 'medium',
    exclusions: [
      'Cardio prolungato ad alta intensità',
      'Circuito senza pause',
      'Sollevamenti olimpici ad alta densità',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Rallentare il ritmo, recuperi raddoppiati a 2 minuti, RPE max 6, idratazione massima',
      },
    ],
  },
  {
    id: 'copd',
    name: 'BPCO (Broncopneumopatia Cronica Ostruttiva)',
    nameEn: 'Chronic Obstructive Pulmonary Disease',
    category: 'sistemiche',
    description: 'Patologia polmonare cronica con limitazione del flusso aereo, dispnea da sforzo e ridotta tolleranza all\'esercizio.',
    icon: 'lung',
    riskLevel: 'high',
    exclusions: [
      'Valsalva prolungata',
      'HIIT non supervisionato',
      'Esercizi in apnea',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Esercizio aerobico a bassa intensità (RPE 3-4), pause frequenti, monitoraggio SpO2 se disponibile',
      },
    ],
  },
  {
    id: 'chronic_kidney_disease',
    name: 'Insufficienza Renale Cronica',
    nameEn: 'Chronic Kidney Disease',
    category: 'sistemiche',
    description: 'Riduzione progressiva della funzione renale con impatto su resistenza muscolare, equilibrio elettrolitico e capacità aerobica.',
    icon: 'kidney',
    riskLevel: 'high',
    exclusions: [
      'Esercizio ad altissima intensità',
      'Carichi isometrici prolungati',
      'Valsalva estremo',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Volume e intensità ridotti del 30-40%, idratazione controllata, evitare sessioni nei giorni di dialisi',
      },
    ],
  },
  {
    id: 'angina_pectoris',
    name: 'Angina Pectoris Stabile',
    nameEn: 'Stable Angina Pectoris',
    category: 'sistemiche',
    description: 'Dolore toracico da sforzo causato da ischemia miocardica transitoria. Richiede clearance cardiologica per l\'esercizio.',
    icon: 'heart',
    riskLevel: 'high',
    exclusions: [
      'Esercizio > 80% FCmax senza supervisione',
      'Sprint',
      'Sollevamenti pesanti con Valsalva',
      'Esercizio al freddo intenso',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Aerobico continuo a intensità moderata (40-60% FCmax), monitoraggio FC costante, nitroglicerina disponibile',
      },
    ],
  },
  {
    id: 'ipertiroidismo',
    name: 'Ipertiroidismo',
    nameEn: 'Hyperthyroidism',
    category: 'sistemiche',
    description: 'Eccesso di ormoni tiroidei con tachicardia, perdita di peso, tremori e intolleranza al calore. Aumenta il rischio di aritmie da sforzo.',
    icon: 'thyroid',
    riskLevel: 'medium',
    exclusions: [
      'HIIT in fase acuta',
      'Esercizio ad alta intensità con FC non controllata',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Intensità moderata (RPE 4-5), monitoraggio FC, evitare ambienti caldi, idratazione abbondante',
      },
    ],
  },
  {
    id: 'valvulopatia_moderata',
    name: 'Valvulopatia Cardiaca Moderata',
    nameEn: 'Moderate Valvular Heart Disease',
    category: 'sistemiche',
    description: 'Disfunzione valvolare (mitrale, aortica) di grado moderato che limita la risposta cardiaca allo sforzo.',
    icon: 'heart',
    riskLevel: 'high',
    exclusions: [
      'Valsalva',
      'Carichi isometrici massimali',
      'Sprint',
      'Sollevamenti pesanti',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Esercizio aerobico leggero-moderato, evitare sforzi massimali, clearance cardiologica obbligatoria',
      },
    ],
  },
];

export const sistemicheConditions = systemicConditions;
