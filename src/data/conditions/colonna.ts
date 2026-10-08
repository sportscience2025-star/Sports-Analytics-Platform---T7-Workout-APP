/**
 * src/data/conditions/colonna.ts
 * Condizioni cliniche e muscolo-scheletriche relative alla Colonna Vertebrale.
 * Include patologie cervicali, dorsali, lombari e instabilità vertebrali.
 * Conforme a Regola R1 (Zero any) e Regola R2 (Single Source of Truth).
 */

import type { ClinicalCondition } from '../../types/clinical';

export const spineConditions: ClinicalCondition[] = [
  {
    id: 'cervical_pain',
    name: 'Cervicalgia',
    nameEn: 'Cervical Pain',
    category: 'colonna',
    description: 'Dolore, rigidità o tensione muscolare localizzata nel tratto cervicale.',
    icon: 'neck',
    riskLevel: 'low',
    exclusions: [
      'Overhead Press',
      'Military Press',
      'Pull-up',
      'Behind Neck',
      'Heavy Carry',
    ],
    adaptations: [
      {
        pattern: 'Military Press',
        modification: 'Dumbbell Press seduto con schienale, ROM controllato, carico -20%',
      },
      {
        pattern: 'Lat Machine',
        modification: 'Presa neutra o inversa avanti al petto, arresto al mento',
      },
    ],
  },
  {
    id: 'spondylosis_cervical',
    name: 'Spondilosi Cervicale',
    nameEn: 'Cervical Spondylosis',
    category: 'colonna',
    description: 'Degenerazione cronica delle vertebre e dei dischi cervicali con riduzione del canale.',
    icon: 'neck',
    riskLevel: 'medium',
    exclusions: [
      'Barbell Curl',
      'Overhead Press',
      'Estensione Collo',
      'Panca Piana Heavy',
    ],
    adaptations: [
      {
        pattern: 'Military Press',
        modification: 'Spinte con manubri con ROM ridotto al parallelo, -30% carico',
      },
      {
        pattern: 'Lat Machine',
        modification: 'Presa supina o neutra avanti, fase eccentrica controllata',
      },
    ],
  },
  {
    id: 'thoracic_outlet',
    name: 'Sindrome dello Stretto Toracico',
    nameEn: 'Thoracic Outlet Syndrome',
    category: 'colonna',
    description: 'Compressione neurovascolare nel passaggio tra collo e torace.',
    icon: 'neck',
    riskLevel: 'medium',
    exclusions: [
      'Overhead',
      'Upright Row',
      'Forward Head',
      'Heavy Farmer Carry',
    ],
    adaptations: [
      {
        pattern: 'Military Press',
        modification: 'Dumbbell Press Arnold con rotazione neutra, ROM max 90-100°',
      },
      {
        pattern: 'Lateral Raise',
        modification: 'Alzate laterali ai cavi con ROM entro i 90°, carico moderato',
      },
      {
        pattern: 'Face Pull',
        modification: 'Presa neutra su corda, scapole addotte attivamente',
      },
    ],
  },
  {
    id: 'dorsal_pain',
    name: 'Dorsalgia',
    nameEn: 'Thoracic Back Pain',
    category: 'colonna',
    description: 'Dolore localizzato nel tratto toracico (dorso superiore) spesso posturale.',
    icon: 'spine',
    riskLevel: 'low',
    exclusions: [
      'Push Press',
      'Overhead Throw',
      'Face Pull Heavy',
    ],
    adaptations: [
      {
        pattern: 'Shoulder Press',
        modification: 'Spinte alle macchine guidate, schienale inclinato 75°',
      },
      {
        pattern: 'Row',
        modification: 'Chest Supported Row, focus su estensione toracica controllata',
      },
    ],
  },
  {
    id: 'lumbar_pain',
    name: 'Lombalgia Cronica',
    nameEn: 'Chronic Low Back Pain',
    category: 'colonna',
    description: 'Dolore lombare persistente con rigidità mattutina o da postura prolungata.',
    icon: 'spine',
    riskLevel: 'medium',
    exclusions: [
      'Deadlift',
      'Barbell Row',
      'Sit-up',
      'Decline Sit-up',
      'Back Squat Heavy',
    ],
    adaptations: [
      {
        pattern: 'Leg Press',
        modification: 'ROM 90° max con piedi alti sulla pedana per evitare retroversione',
      },
      {
        pattern: 'Row',
        modification: 'Dumbbell Row in appoggio su panca o Chest Supported Row',
      },
      {
        pattern: 'Romanian Deadlift',
        modification: 'Stacco rumeno con manubri, ROM limitato a metà tibia',
      },
    ],
  },
  {
    id: 'hernia_disk',
    name: 'Ernia Discale Lombale',
    nameEn: 'Lumbar Disc Herniation',
    category: 'colonna',
    description: 'Fuoriuscita o protrusione del nucleo polposo discale (tipico L4-L5/L5-S1) con compressione radicolare.',
    icon: 'disc',
    riskLevel: 'high',
    exclusions: [
      'Squat',
      'Deadlift',
      'Clean',
      'Snatch',
      'Crunch',
      'Leg Press Deep',
    ],
    adaptations: [
      {
        pattern: 'Leg Press',
        modification: 'Piedi alti e stance larga, inclinazione pedana ridotta, ROM max 70°',
      },
      {
        pattern: 'Hip Thrust',
        modification: 'Carico moderato su glutei, bloccando la schiena in neutro',
      },
      {
        pattern: 'Cable Crunch',
        modification: 'Sostituire con Plank o pallof press per stabilità in neutro',
      },
    ],
  },
  {
    id: 'spinal_stenosis',
    name: 'Stenosi Spinale Lombale',
    nameEn: 'Lumbar Spinal Stenosis',
    category: 'colonna',
    description: 'Restringimento del canale vertebrale con claudicatio neurogena durante l\'estensione.',
    icon: 'spine',
    riskLevel: 'high',
    exclusions: [
      'Back Extension',
      'Deadlift',
      'Squat Profondo',
      'Arch Back',
      'Overhead Press Standing',
    ],
    adaptations: [
      {
        pattern: 'Leg Press',
        modification: 'Postura leggermente flessa (schiacciando il bacino), ROM 80°',
      },
      {
        pattern: 'Back Extension',
        modification: 'Limitare il movimento a 30-40° senza mai superare la linea neutra',
      },
      {
        pattern: 'Romanian Deadlift',
        modification: 'ROM ridotto a 40-50° ginocchio sbloccato',
      },
    ],
  },
  {
    id: 'sensitive_back',
    name: 'Schiena Sensibile',
    nameEn: 'Sensitive Back',
    category: 'colonna',
    description: 'Soggetti con episodi recidivanti di lombalgia non specificata.',
    icon: 'body',
    riskLevel: 'low',
    exclusions: [
      'Deadlift Heavy',
      'Row Heavy',
      'Squat Profondo',
      'Good Morning',
    ],
    adaptations: [
      {
        pattern: 'Back Squat',
        modification: 'Sostituire con Goblet Squat o Front Squat (ROM 90°, -20% carico)',
      },
      {
        pattern: 'Deadlift',
        modification: 'RDL controllato con manubri o Hex Bar Deadlift',
      },
      {
        pattern: 'Row',
        modification: 'Chest Supported Row o rematore con manubri su panca inclinata',
      },
    ],
  },
  {
    id: 'spondylolysis',
    name: 'Spondilolisi',
    nameEn: 'Spondylolysis',
    category: 'colonna',
    description: 'Difetto o frattura della pars interarticularis (tipicamente L5) con potenziale instabilità.',
    icon: 'spine',
    riskLevel: 'high',
    exclusions: [
      'Deadlift',
      'Squat Profondo',
      'Iperestensione',
      'Barbell Row',
      'Kettlebell Swing',
    ],
    adaptations: [
      {
        pattern: 'Leg Press',
        modification: 'ROM limitato a 80°, spalliera ben reclinata',
      },
      {
        pattern: 'Row',
        modification: 'Rematore Chest Supported con petto adeso',
      },
      {
        pattern: 'Back Extension',
        modification: 'Sostituire con Plank isometrico neutro',
      },
    ],
  },
  {
    id: 'posture_chronic',
    name: 'Problemi Posturali',
    nameEn: 'Postural Issues',
    category: 'colonna',
    description: 'Rounded shoulders, anterior pelvic tilt o ipercifosi toracica disfunzionale.',
    icon: 'body',
    riskLevel: 'low',
    exclusions: [
      'Panca Pesante',
      'Lat Pulldown Dietro',
      'Military Press Standing',
    ],
    adaptations: [
      {
        pattern: 'Bench Press',
        modification: 'ROM leggermente ridotto, scapole sempre addotte al massimo',
      },
      {
        pattern: 'Military Press',
        modification: 'Arnold press seduto o dumbbell press presa neutra',
      },
      {
        pattern: 'Lat Pulldown',
        modification: 'Sbarra tirata al petto alto mantenendo l\'estensione dorsale',
      },
    ],
  },
  {
    id: 'scoliosi_idiopatica',
    name: 'Scoliosi Idiopatica',
    nameEn: 'Idiopathic Scoliosis',
    category: 'colonna',
    description: 'Deviazione laterale e rotatoria tridimensionale della colonna superiore a 10 gradi cobb.',
    icon: 'spine',
    riskLevel: 'low',
    exclusions: [
      'Heavy Back Squat',
      'Overhead Press Standing Heavy',
      'Rematore Unilaterale sbilanciato',
    ],
    adaptations: [
      {
        pattern: 'Squat',
        modification: 'Privilegiare Goblet Squat o Leg Press bilaterale per bilanciare il carico assiale',
      },
      {
        pattern: 'Row',
        modification: 'Rematore bilaterale supportato da panca o cavi per evitare torsioni asimmetriche',
      },
      {
        pattern: 'General',
        modification: 'Focus su allineamento e stabilità del core con Plank e Bird-dog',
      },
    ],
  },
  {
    id: 'spondilite_anchilosante',
    name: 'Spondilite Anchilosante',
    nameEn: 'Ankylosing Spondylitis',
    category: 'colonna',
    description: 'Artrite infiammatoria cronica che colpisce la colonna e le articolazioni sacroiliache, portando a rigidità.',
    icon: 'spine',
    riskLevel: 'medium',
    exclusions: [
      'Esercizi balistici',
      'Jump Squat',
      'Plyometrics',
      'Carico assiale estremo',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Focus su esercizi di mobilità, estensione toracica e respirazione diaframmatica',
      },
      {
        pattern: 'Squat',
        modification: 'Box Squat controllato con ROM ridotto al parallelo',
      },
      {
        pattern: 'Lat Pulldown',
        modification: 'ROM completo controllato per allungamento fasciale',
      },
    ],
  },
  {
    id: 'faccette_articolari',
    name: 'Sindrome Faccette Articolari',
    nameEn: 'Facet Joint Syndrome',
    category: 'colonna',
    description: 'Infiammazione o artrosi delle articolazioni intervertebrali posteriori, aggravata dall\'estensione.',
    icon: 'spine',
    riskLevel: 'medium',
    exclusions: [
      'Back Extension',
      'Good Morning',
      'Deadlift Heavy',
      'Military Press Standing',
    ],
    adaptations: [
      {
        pattern: 'Back Extension',
        modification: 'Sostituire con Plank o esercizi di stabilità lombare in flessione',
      },
      {
        pattern: 'Squat',
        modification: 'Goblet Squat (ROM 90°) per mantenere un busto eretto ed evitare iperestensioni',
      },
    ],
  },
  {
    id: 'mielopatia_cervicale',
    name: 'Mielopatia Cervicale',
    nameEn: 'Cervical Myelopathy',
    category: 'colonna',
    description: 'Sindrome clinica da compressione del midollo spinale cervicale con deficit neurologici potenziali.',
    icon: 'neck',
    riskLevel: 'high',
    exclusions: [
      'Overhead Press',
      'Pull-up',
      'Behind Neck',
      'Plank',
      'Push-up',
      'Jump Squat',
      'Plyometrics',
      'Valsalva',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Solo esercizi seduti con supporto, nessun carico assiale, contrazioni controllate',
      },
      {
        pattern: 'Lat Machine',
        modification: 'Presa neutra stretta davanti, ROM parziale, -40% carico',
      },
    ],
  },
  {
    id: 'frattura_compressione',
    name: 'Frattura da Compressione',
    nameEn: 'Vertebral Compression Fracture',
    category: 'colonna',
    description: 'Cedimento vertebrale da osteoporosi o trauma. Richiede rigorosa prevenzione della flessione anteriore.',
    icon: 'spine',
    riskLevel: 'high',
    exclusions: [
      'Crunch',
      'Sit-up',
      'Romanian Deadlift',
      'Barbell Row',
      'Leg Press',
      'Back Squat',
      'Kettlebell Swing',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Esercizi di estensione isometrica, stabilità del core in piedi, no flessione',
      },
      {
        pattern: 'Squat',
        modification: 'Wall Slide (squat a muro) isometrico o controllato senza peso',
      },
    ],
  },
  {
    id: 'thoracolumbar_junction',
    name: 'Sindrome della Giunzione Toraco-Lombare',
    nameEn: 'Thoracolumbar Junction Syndrome',
    category: 'colonna',
    description: 'Disfunzione della cerniera T12-L1 con dolore riferito a inguine, anca o addome basso, frequente in sportivi.',
    icon: 'spine',
    riskLevel: 'low',
    exclusions: [
      'Rotazioni con carico',
      'Good Morning pesante',
    ],
    adaptations: [
      {
        pattern: 'General',
        modification: 'Mobilizzazione toracica, rinforzo core anti-rotazione, evitare iperlordosi sotto carico',
      },
    ],
  },
];

export const colonnaConditions = spineConditions;
