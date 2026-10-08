/**
 * src/data/conditions/arti-superiori.ts
 * Condizioni cliniche e muscolo-scheletriche per Arti Superiori (Spalla, Gomito, Polso e Mano).
 * Conforme a Regola R1 (Zero any) e Regola R2 (Single Source of Truth).
 */

import type { ClinicalCondition } from '../../types/clinical';

export const upperLimbConditions: ClinicalCondition[] = [
  {
    id: 'shoulder_generic',
    name: 'Spalla Problematica',
    nameEn: 'Shoulder Pain',
    category: 'arti_superiori',
    description: 'Fastidi articolari diffusi alla spalla senza diagnosi patologica specifica.',
    icon: 'shoulder',
    riskLevel: 'low',
    exclusions: [
      'Military Press Full',
      'Overhead Throw',
      'Upright Row',
      'Pull-up Behind Neck',
    ],
    adaptations: [
      {
        pattern: 'Military Press',
        modification: 'Spinte manubri presa neutra (martello) a ROM ridotto (100°)',
      },
      {
        pattern: 'Lat Machine',
        modification: 'Tirata al petto con presa neutra stretta, ROM controllato',
      },
      {
        pattern: 'Shoulder Press',
        modification: 'Usa macchina guidata seduto con spalliera leggermente inclinata',
      },
    ],
  },
  {
    id: 'impingement',
    name: 'Sindrome Impingement',
    nameEn: 'Subacromial Impingement',
    category: 'arti_superiori',
    description: 'Compressione dei tendini della cuffia nello spazio sottoacromiale durante l\'abduzione.',
    icon: 'shoulder',
    riskLevel: 'medium',
    exclusions: [
      'Overhead Press',
      'Pull-up',
      'Upright Row',
      'Lateral Raise Heavy',
      'Dips',
    ],
    adaptations: [
      {
        pattern: 'Lat Pulldown',
        modification: 'Presa neutra stretta avanti, arresto a 90° gomiti',
      },
      {
        pattern: 'Military Press',
        modification: 'Sostituire con spinte manubri sul piano scapolare (presa neutra a 30°)',
      },
      {
        pattern: 'Lateral Raise',
        modification: 'Alzate laterali con pollice verso l\'alto (extrarotazione) max 90°',
      },
    ],
  },
  {
    id: 'instability_shoulder',
    name: 'Instabilità Gleno-Omerale',
    nameEn: 'Glenohumeral Instability',
    category: 'arti_superiori',
    description: 'Lassità capsulo-legamentosa con tendenza alla sublussazione o lussazione della spalla.',
    icon: 'shoulder',
    riskLevel: 'medium',
    exclusions: [
      'Dip Full',
      'Panca Piana con gomiti larghi',
      'Lat Machine Dietro',
      'Snatch',
    ],
    adaptations: [
      {
        pattern: 'Bench Press',
        modification: 'Panca piana con manubri, presa neutra/semi-prona, ROM limitato a 2cm dal petto',
      },
      {
        pattern: 'Lat Pulldown',
        modification: 'ROM controllato evitando il completo allungamento passivo a fine eccentrica',
      },
    ],
  },
  {
    id: 'supraspinatus',
    name: 'Tendinopatia del Sovraspinato',
    nameEn: 'Supraspinatus Tendinitis',
    category: 'arti_superiori',
    description: 'Infiammazione o degenerazione del tendine del muscolo sovraspinato.',
    icon: 'shoulder',
    riskLevel: 'low',
    exclusions: [
      'Overhead Press',
      'Lateral Raise Heavy',
      'Pull-up completi',
      'Upright Row',
    ],
    adaptations: [
      {
        pattern: 'Military Press',
        modification: 'Arnold press seduto o dumbbell press parziale (ROM 90° max)',
      },
      {
        pattern: 'Lateral Raise',
        modification: 'Alzate sul piano scapolare (30° avanti) con carichi terapeutici 1-4kg',
      },
      {
        pattern: 'Face Pull',
        modification: 'Cavo alto con corda, focus su rotazione esterna pura controllata',
      },
    ],
  },
  {
    id: 'frozen_shoulder',
    name: 'Spalla Congelata',
    nameEn: 'Frozen Shoulder',
    category: 'arti_superiori',
    description: 'Capsulite adesiva caratterizzata da forte dolore iniziale e progressiva perdita quasi totale del ROM.',
    icon: 'shoulder',
    riskLevel: 'medium',
    exclusions: [
      'Qualsiasi sollevamento pesante',
      'Snatch',
      'Dips',
      'Trazioni esplosive',
    ],
    adaptations: [
      {
        pattern: 'Lateral Raise',
        modification: 'Movimento attivo-assistito o senza peso per preservare la mobilità residua',
      },
      {
        pattern: 'Military Press',
        modification: 'Evitare spinte. Sostituire con esercizi di mobilità passiva al muro',
      },
    ],
  },
  {
    id: 'bursitis_shoulder',
    name: 'Borsite Sottoacromiale',
    nameEn: 'Subacromial Bursitis',
    category: 'arti_superiori',
    description: 'Infiammazione acuta o cronica della borsa sottoacromiale con forte dolore alla spalla.',
    icon: 'shoulder',
    riskLevel: 'medium',
    exclusions: [
      'Overhead',
      'Lateral Raise Heavy',
      'Pull-ups',
      'Spinte su inclinata',
    ],
    adaptations: [
      {
        pattern: 'Military Press',
        modification: 'Presa neutra parziale, spinta lenta a carico terapeutico',
      },
      {
        pattern: 'Lateral Raise',
        modification: 'Alzate parziali fino a 70° con pollice in su',
      },
    ],
  },
  {
    id: 'cuffia_rotatori_parziale',
    name: 'Lesione Parziale della Cuffia',
    nameEn: 'Partial Rotator Cuff Tear',
    category: 'arti_superiori',
    description: 'Fessurazione o lacerazione incompleta di uno o più tendini della cuffia dei rotatori.',
    icon: 'shoulder',
    riskLevel: 'medium',
    exclusions: [
      'Military Press',
      'Dips pesanti',
      'Lat Machine dietro nuca',
      'Panca Piana Heavy',
    ],
    adaptations: [
      {
        pattern: 'Bench Press',
        modification: 'Dumbbell Floor Press (panca a terra) per bloccare gomiti a 90°',
      },
      {
        pattern: 'Lat Pulldown',
        modification: 'Presa inversa (supina) stretta per scaricare la spalla anteriore',
      },
    ],
  },
  {
    id: 'tendinite_bicipite_lungo',
    name: 'Tendinopatia Capo Lungo Bicipite',
    nameEn: 'Long Head Biceps Tendinitis',
    category: 'arti_superiori',
    description: 'Infiammazione del tendine del capo lungo del bicipite brachiale nel solco bicipitale dell\'omero.',
    icon: 'arm',
    riskLevel: 'low',
    exclusions: [
      'Barbell Curl pesante',
      'Bench Press con gomiti spinti indietro',
      'Chin-up',
    ],
    adaptations: [
      {
        pattern: 'Barbell Curl',
        modification: 'Curl con manubri in inclinazione inclinata a 45° presa hammer (neutra)',
      },
      {
        pattern: 'Pull-up',
        modification: 'Trazioni a presa prona larga (meno enfasi su bicipite, più su dorsale)',
      },
    ],
  },
  {
    id: 'slap_lesion',
    name: 'Lesione SLAP',
    nameEn: 'SLAP Tear',
    category: 'arti_superiori',
    description: 'Lesione del labbro glenoideo superiore da anteriore a posteriore, comune nei lanciatori.',
    icon: 'shoulder',
    riskLevel: 'high',
    exclusions: [
      'Trazioni verticali appesi',
      'Overhead Press pesante',
      'Dips',
      'Handstand Pushups',
    ],
    adaptations: [
      {
        pattern: 'Pull-up',
        modification: 'Sostituire con Rematore orizzontale o Lat Machine presa neutra chiusa',
      },
      {
        pattern: 'Bench Press',
        modification: 'Bench press con presa stretta, gomiti stretti al busto',
      },
    ],
  },
  {
    id: 'lesione_acromioclaveare',
    name: 'Distorsione Acromioclaveare',
    nameEn: 'AC Joint Sprain',
    category: 'arti_superiori',
    description: 'Trauma o instabilità dell\'articolazione acromioclaveare dovuto a cadute o impatti.',
    icon: 'shoulder',
    riskLevel: 'medium',
    exclusions: [
      'Dips',
      'Bench Press bilaterale',
      'Upright Row',
      'Farmer Carry',
    ],
    adaptations: [
      {
        pattern: 'Bench Press',
        modification: 'Push-up facilitati o Floor Press con manubri, limitando abduzione',
      },
      {
        pattern: 'Military Press',
        modification: 'Arnold press seduto con traiettoria controllata spalla',
      },
    ],
  },
  {
    id: 'instabilita_polso',
    name: 'Instabilità di Polso',
    nameEn: 'Wrist Instability',
    category: 'arti_superiori',
    description: 'Lassità legamentosa carpale con dolore sotto carico in flessione/estensione.',
    icon: 'hand',
    riskLevel: 'low',
    exclusions: [
      'Clean',
      'Push-up a palmo piatto',
      'Barbell Curl pesante',
    ],
    adaptations: [
      {
        pattern: 'Push-up',
        modification: 'Uso di maniglie push-up o eseguiti su pugni per mantenere polso dritto',
      },
      {
        pattern: 'Barbell Curl',
        modification: 'Usa EZ-bar o manubri presa neutra',
      },
    ],
  },
  {
    id: 'de_quervain',
    name: 'Sindrome di De Quervain',
    nameEn: 'De Quervain\'s Tenosynovitis',
    category: 'arti_superiori',
    description: 'Tenosinite stenosante del pollice (abduttore lungo ed estensore breve).',
    icon: 'hand',
    riskLevel: 'low',
    exclusions: [
      'Barbell Row con presa prona forte',
      'Farmer Carry pesante',
      'Chin-up presa forte',
    ],
    adaptations: [
      {
        pattern: 'Barbell Curl',
        modification: 'Curl con manubri evitando la deviazione ulnare del polso',
      },
      {
        pattern: 'Row',
        modification: 'Rematore al cavo con cinghie o presa neutra morbida',
      },
    ],
  },
  {
    id: 'epicondilite_mediale',
    name: 'Epitrocleite / Epicondilite Mediale',
    nameEn: 'Medial Epicondylitis',
    category: 'arti_superiori',
    description: 'Infiammazione dei tendini flessori dell\'avambraccio inseriti sull\'epitroclea (Gomito del Golfista).',
    icon: 'arm',
    riskLevel: 'low',
    exclusions: [
      'Pull-up supini (Chin-up)',
      'Wrist Curl carichi pesanti',
      'Barbell Curl supino pesante',
    ],
    adaptations: [
      {
        pattern: 'Barbell Curl',
        modification: 'Curl con EZ-bar presa semi-prona o Hammer Curl neutro',
      },
      {
        pattern: 'Lat Pulldown',
        modification: 'Presa neutra o prona, no supinazione estrema',
      },
    ],
  },
  {
    id: 'neuropatia_ulnare',
    name: 'Compressione Nervo Ulnare',
    nameEn: 'Cubital Tunnel Syndrome',
    category: 'arti_superiori',
    description: 'Sofferenza o compressione del nervo ulnare nel canale cubitale del gomito.',
    icon: 'arm',
    riskLevel: 'medium',
    exclusions: [
      'Skullcrushers pesanti',
      'Flessione gomito prolungata oltre 100°',
      'Dips',
    ],
    adaptations: [
      {
        pattern: 'Skull Crusher',
        modification: 'Sostituire con Spinte in basso al cavo (Pushdown) parziali, gomiti in linea',
      },
      {
        pattern: 'Bench Press',
        modification: 'Evitare blocco articolare serrato (no lockout gomito)',
      },
    ],
  },
  {
    id: 'shoulder_dislocation_recurrent',
    name: 'Lussazione Spalla Recidivante',
    nameEn: 'Recurrent Shoulder Dislocation',
    category: 'arti_superiori',
    description: 'Instabilità gleno-omerale con episodi ripetuti di lussazione, tipica in sport di contatto e overhead.',
    icon: 'shoulder',
    riskLevel: 'high',
    exclusions: [
      'Behind Neck Press',
      'Dips profondi',
      'Panca Piana con ROM eccessivo',
      'Pullover pesante',
      'Lanci',
    ],
    adaptations: [
      {
        pattern: 'Bench Press',
        modification: 'Panca con manubri, ROM limitato (gomiti a 90°), mai sotto il piano delle spalle',
      },
      {
        pattern: 'Shoulder Press',
        modification: 'Spinte seduto con manubri, ROM controllato, evitare abduzione > 90° con extrarotazione',
      },
    ],
  },
  {
    id: 'labral_tear_shoulder',
    name: 'Lesione del Labbro Glenoideo',
    nameEn: 'Glenoid Labral Tear',
    category: 'arti_superiori',
    description: 'Lesione del labbro cartilagineo della glena (SLAP, Bankart) con instabilità, click e dolore in overhead.',
    icon: 'shoulder',
    riskLevel: 'medium',
    exclusions: [
      'Overhead pesante',
      'Behind Neck',
      'Pullover',
      'Dips profondi',
      'Kipping Pull-up',
    ],
    adaptations: [
      {
        pattern: 'Pull-up',
        modification: 'Lat pulldown a presa neutra avanti al petto, evitare trazione dietro',
      },
      {
        pattern: 'Shoulder Press',
        modification: 'Landmine Press o Cable Press a ROM controllato',
      },
    ],
  },
  {
    id: 'tennis_elbow',
    name: 'Epicondilite (Gomito)',
    nameEn: 'Lateral Epicondylitis',
    category: 'altri_distretti',
    description: 'Tennis Elbow. Tendinopatia degli estensori del polso all\'inserzione sull\'epicondilo laterale.',
    icon: 'arm',
    riskLevel: 'low',
    exclusions: [
      'Barbell Curl Heavy',
      'Dip Full',
      'Skull Crusher Heavy',
      'Trazioni pronazione pesante',
    ],
    adaptations: [
      {
        pattern: 'Barbell Curl',
        modification: 'EZ-bar con presa neutra o curl con manubri presa hammer, -30% carico',
      },
      {
        pattern: 'Skull Crusher',
        modification: 'Pushdown con corda ai cavi tenendo i polsi rigidi e dritti',
      },
      {
        pattern: 'Row',
        modification: 'Rematore con presa neutra ed enfasi eccentrica lenta',
      },
    ],
  },
  {
    id: 'golfer_elbow',
    name: 'Epitrocleite (Gomito)',
    nameEn: 'Medial Epicondylitis',
    category: 'altri_distretti',
    description: 'Golfer Elbow. Tendinopatia dei flessori del polso all\'inserzione sull\'epitroclea mediale.',
    icon: 'arm',
    riskLevel: 'low',
    exclusions: [
      'Chin-up',
      'Barbell Curl supino pesante',
      'Flessione polso pesante',
    ],
    adaptations: [
      {
        pattern: 'Row',
        modification: 'Presa neutra orizzontale, carichi ridotti del 20%, focus su trazione dorsale',
      },
      {
        pattern: 'Curl',
        modification: 'Hammer Curl (presa neutra) con manubri',
      },
    ],
  },
  {
    id: 'weak_wrist',
    name: 'Polso Debole',
    nameEn: 'Weak Wrist',
    category: 'altri_distretti',
    description: 'Deficit di stabilità e dolore generico del compartimento carpale.',
    icon: 'hand',
    riskLevel: 'low',
    exclusions: [
      'Barbell Curl pesante',
      'Farmer Carry',
      'Wrist Flexion caricata',
      'Clean',
    ],
    adaptations: [
      {
        pattern: 'Barbell Curl',
        modification: 'EZ-bar o Dumbbell Hammer Curl bilaterale seduto',
      },
      {
        pattern: 'Bench Press',
        modification: 'Mantenere i polsi dritti bloccati in linea con l\'avambraccio, eventualmente fasciati',
      },
    ],
  },
  {
    id: 'carpal_tunnel',
    name: 'Sindrome Tunnel Carpale',
    nameEn: 'Carpal Tunnel Syndrome',
    category: 'altri_distretti',
    description: 'Neuropatia compressiva del nervo mediano nel canale del carpo.',
    icon: 'hand',
    riskLevel: 'low',
    exclusions: [
      'Front Squat presa rack classica',
      'Push-up a palmo piatto',
      'Bench Press con presa strettissima',
    ],
    adaptations: [
      {
        pattern: 'Push-up',
        modification: 'Eseguiti sui pugni o con maniglie dedicate',
      },
      {
        pattern: 'Front Squat',
        modification: 'Presa a braccia incrociate (Cross-arm front squat) o cinghie',
      },
    ],
  },
  {
    id: 'de_quervain_altri',
    name: 'Sindrome di De Quervain (Polso)',
    nameEn: 'De Quervain Syndrome',
    category: 'altri_distretti',
    description: 'Tenosinite infiammatoria della guaina del pollice.',
    icon: 'hand',
    riskLevel: 'low',
    exclusions: [
      'Presa massimale bilanciere',
      'Stacco da terra senza fascette',
      'Farmer Carry',
    ],
    adaptations: [
      {
        pattern: 'Deadlift',
        modification: 'Hex bar stacco usando fascette protettive (lifting straps)',
      },
      {
        pattern: 'Curl',
        modification: 'Dumbbell Curl con presa neutra, carichi moderati',
      },
    ],
  },
  {
    id: 'costocondrite',
    name: 'Costocondrite',
    nameEn: 'Costochondritis',
    category: 'altri_distretti',
    description: 'Infiammazione della giunzione costo-condrale con dolore toracico anteriore, spesso confusa con dolore cardiaco.',
    icon: 'chest',
    riskLevel: 'low',
    exclusions: [
      'Panca Piana pesante',
      'Dips',
      'Push-up in fase acuta',
    ],
    adaptations: [
      {
        pattern: 'Bench Press',
        modification: 'Panca con manubri leggeri, ROM ridotto, evitare stretching eccessivo del torace',
      },
      {
        pattern: 'General',
        modification: 'Ridurre volume di push e chest exercises fino a risoluzione del dolore',
      },
    ],
  },
  {
    id: 'dupuytren',
    name: 'Morbo di Dupuytren',
    nameEn: 'Dupuytren\'s Contracture',
    category: 'altri_distretti',
    description: 'Fibrosi progressiva della fascia palmare con retrazione delle dita (tipicamente anulare e mignolo), limitando la presa.',
    icon: 'hand',
    riskLevel: 'low',
    exclusions: [
      'Prese forzate prolungate',
      'Farmer Walk pesante',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Utilizzare guanti imbottiti, prese aperte (straps), evitare prese estreme con flessione forzata delle dita',
      },
    ],
  },
];

export const artiSuperioriConditions = upperLimbConditions;
