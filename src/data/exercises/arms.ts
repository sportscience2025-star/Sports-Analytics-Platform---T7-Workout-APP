/**
 * src/data/exercises/arms.ts
 * Catalogo modulare degli esercizi per il gruppo muscolare Braccia (Bicipiti e Tricipiti).
 * Singola responsabilità per la tassonomia dei flessori ed estensori del gomito.
 * Rispetta la Regola R1 (Zero any) e Regola R2 (Interfacce da src/types).
 */

import type { Exercise } from '../../types/exercise';

export const armsExercises: Exercise[] = [
  {
    id: 'arm_01',
    name: 'Curl con Bilanciere Sagomato (EZ-Bar Curl)',
    nameEn: 'EZ-Bar Biceps Curl',
    primaryMuscle: 'Bicipite Brachiale',
    secondaryMuscles: ['Brachiale', 'Brachioradiale'],
    muscles: ['Bicipite Brachiale', 'Braccia', 'Brachiale', 'Brachioradiale'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Bilanciere',
    variants: ['Barbell Curl con Barra Dritta', 'Cable Curl'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Esercizio fondamentale per la massa dei bicipiti. L impugnatura sagomata EZ riduce la tensione sul polso e sull articolazione radio-ulnare rispetto alla barra dritta.',
      setup: [
        'Stazione eretta con piedi ad ampiezza spalle, ginocchia leggermente sbloccate.',
        'Impugna il bilanciere EZ sulle curvature interne con presa supina (pollici orientati verso l alto a circa 45 gradi).',
        'Gomiti aderenti ai fianchi, petto fiero e scapole leggermente addotte.',
      ],
      steps: [
        'Fletti i gomiti sollevando il bilanciere verso le spalle senza muovere il tronco.',
        'Spremi energicamente i bicipiti al culmine del movimento fermandoti a circa 20 cm dal petto per mantenere la tensione.',
        'Ritorna lentamente alla posizione iniziale in 3 secondi controllando l eccentrica.',
        'Estendi quasi completamente il gomito prima della ripetizione successiva.',
      ],
      cues: [
        'Gomiti incollati alla cassa toracica come se fossero imperniati su un asse fisso',
        'Non usare il dondolio della schiena per avviare il sollevamento',
        'Polsi rigidi e allineati con gli avambracci',
      ],
      criteria: [
        'Totale immobilità del tronco lungo l intera serie',
        'Discesa controllata senza rimbalzo al fondo corsa',
      ],
    },
    errors: [
      {
        error: 'Avanzamento marcato dei gomiti verso l alto a fine salita',
        why: 'Coinvolge il deltoide anteriore scaricando la tensione dal bicipite.',
        fix: 'Mantieni i gomiti bloccati perpendicolari ai fianchi.',
      },
      {
        error: 'Oscillazione del bacino indietro per sfruttare l inerzia',
        why: 'Rischia di provocare stiramenti lombari e vanifica il carico sui flessori.',
        fix: 'Poggia la schiena contro una parete per imparare la corretta stabilizzazione.',
      },
    ],
    description: 'Flessione dell avambraccio con bilanciere sagomato per lo sviluppo di massa del bicipite brachiale.',
    tags: ['braccia', 'bicipiti', 'bilanciere', 'ez-bar', 'isolamento', 'ipertrofia'],
  },
  {
    id: 'arm_02',
    name: 'Curl con Manubri Alternato con Supinazione',
    nameEn: 'Alternating Dumbbell Curl with Supination',
    primaryMuscle: 'Bicipite Brachiale',
    secondaryMuscles: ['Brachiale', 'Brachioradiale'],
    muscles: ['Bicipite Brachiale', 'Braccia', 'Brachiale'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Manubri',
    variants: ['Seated Dumbbell Curl', 'Incline Dumbbell Curl'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Flessione del gomito con manubri alternati che sfrutta entrambe le funzioni anatomiche primarie del bicipite: flessione e potente supinazione dell avambraccio.',
      setup: [
        'In piedi con due manubri lungo i fianchi, presa inizialmente neutra (palmi verso le cosce).',
        'Petto aperto, spalle depresse e core contratto.',
      ],
      steps: [
        'Inizia a flettere un braccio; superata la coscia, ruota attivamente il polso portando il palmo verso l alto (supinazione).',
        'A fine corsa ruota il mignolo leggermente verso l esterno per enfatizzare il picco di contrazione del bicipite.',
        'Abbassa il manubrio ri-ruotando il polso in posizione neutra durante la discesa controllata.',
        'Ripeti alternando con l altro braccio.',
      ],
      cues: [
        'Ruota il polso con forza: porta il mignolo più in alto del pollice al vertice',
        'Un braccio alla volta con ritmo costante e fluido',
      ],
      criteria: [
        'Supinazione completa prima di raggiungere i 90 gradi di flessione',
        'Spalle ferme senza sollevarsi verso le orecchie',
      ],
    },
    errors: [
      {
        error: 'Supinazione tardiva solo a fine salita',
        why: 'Perde gran parte del lavoro contrattile sulla supinazione attiva sotto carico.',
        fix: 'Inizia a ruotare il polso non appena il manubrio ha superato la coscia.',
      },
    ],
    description: 'Curl alternato con manubri e rotazione del polso per massimizzare il picco del bicipite.',
    tags: ['braccia', 'bicipiti', 'manubri', 'supinazione', 'monolaterale', 'ipertrofia'],
  },
  {
    id: 'arm_03',
    name: 'Hammer Curl con Manubri',
    nameEn: 'Dumbbell Hammer Curl',
    primaryMuscle: 'Brachioradiale',
    secondaryMuscles: ['Brachiale', 'Bicipite Brachiale'],
    muscles: ['Brachioradiale', 'Brachiale', 'Bicipite Brachiale', 'Braccia'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Manubri',
    variants: ['Rope Cable Hammer Curl', 'Cross-Body Hammer Curl'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Flessione del gomito con presa neutra (a martello). Pone il bicipite in svantaggio meccanico concentrando la tensione sul brachioradiale e sul brachiale profondo, aumentando lo spessore del braccio.',
      setup: [
        'In piedi con i manubri lungo i fianchi in presa neutra (palmi rivolti uno verso l altro).',
        'Polsi saldi e stabili, gomiti vicini al tronco.',
      ],
      steps: [
        'Solleva entrambi i manubri (o alternati) mantenendo la presa neutra lungo tutto l arco.',
        'Arriva fino alla massima flessione del gomito senza ruotare i polsi.',
        'Trattieni per un istante la contrazione sentendo l avambraccio e il braccio esterno.',
        'Riscendi lentamente in 3 secondi controllando l eccentrica.',
      ],
      cues: [
        'Impugnatura a martello salda: i pollici guidano la salita',
        'Gomiti fermi e ancorati ai fianchi',
      ],
      criteria: [
        'Presa rigorosamente neutra dall inizio alla fine',
        'Assenza di compensi con il tronco',
      ],
    },
    errors: [
      {
        error: 'Intraruotare i polsi o oscillare i pesi lateralmente',
        why: 'Scarica il brachioradiale e disperde la traiettoria di carico.',
        fix: 'Mantieni i manubri dritti lungo una traiettoria puramente sagittale.',
      },
    ],
    description: 'Curl a martello con manubri per lo sviluppo dell avambraccio, brachiale e spessore del braccio.',
    tags: ['braccia', 'bicipiti', 'avambracci', 'hammer-curl', 'manubri', 'ipertrofia'],
  },
  {
    id: 'arm_04',
    name: 'Preacher Curl su Panca Scott',
    nameEn: 'Scott Preacher Curl',
    primaryMuscle: 'Bicipite Brachiale (Capo Breve)',
    secondaryMuscles: ['Brachiale'],
    muscles: ['Bicipite Brachiale (Capo Breve)', 'Braccia', 'Brachiale'],
    type: 'Isolamento',
    level: 'Intermedio',
    equipment: 'Bilanciere',
    variants: ['One-Arm Dumbbell Preacher Curl', 'Cable Preacher Curl'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Flessione isolata con omeri bloccati a 45 gradi sul leggio della panca Scott. Elimina ogni compenso corporeo e massimizza la tensione nella prima metà del ROM.',
      setup: [
        'Regola l altezza del sedile affinché le ascelle poggino comodamente sul bordo superiore del leggio imbottito.',
        'Braccia parallele appoggiate per intero sulla superficie inclinata.',
        'Impugna il bilanciere EZ con presa supina a braccia distese.',
      ],
      steps: [
        'Fletti i gomiti sollevando il bilanciere fino a circa 90-100 gradi di flessione.',
        'Non superare la perpendicolare per non perdere la tensione gravitazionale sul bicipite.',
        'Riscendi lentamente controllando la fase eccentrica fino a quasi estendere il gomito.',
        'Evita assolutamente l iperestensione passiva a scatto al punto morto inferiore.',
      ],
      cues: [
        'Tricipiti incollati al cuscino per tutta la serie',
        'Fermati prima della verticale in cima per non scaricare il peso sulle ossa',
        'Controlla millimetro per millimetro la discesa',
      ],
      criteria: [
        'Discesa controllata senza rimbalzi sul fondo',
        'Zero distacco del busto o delle ascelle dal leggio',
      ],
    },
    errors: [
      {
        error: 'Iperestensione a scatto del gomito sul fondo corsa',
        why: 'Pone una tensione da strappo enorme sul tendine distale del bicipite con elevatissimo rischio di rottura tendinea.',
        fix: 'Fermati con una micro-flessione attiva di sicurezza di circa 5 gradi.',
      },
    ],
    description: 'Curl su panca inclinata con braccia bloccate per isolamento assoluto del bicipite brachiale.',
    tags: ['braccia', 'bicipiti', 'panca-scott', 'preacher-curl', 'bilanciere', 'ipertrofia'],
  },
  {
    id: 'arm_05',
    name: 'Curl con Manubri su Panca Inclinata a 45 Gradi',
    nameEn: 'Incline Dumbbell Curl',
    primaryMuscle: 'Bicipite Brachiale (Capo Lungo)',
    secondaryMuscles: ['Brachiale'],
    muscles: ['Bicipite Brachiale (Capo Lungo)', 'Braccia'],
    type: 'Isolamento',
    level: 'Intermedio',
    equipment: 'Manubri',
    variants: ['Seated Dumbbell Curl'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Flessione del gomito con schienale inclinato a 45-60 gradi. Pone l omero in estensione posteriore rispetto al tronco, allungando al massimo il capo lungo del bicipite per stimolare l ipertrofia da stiramento.',
      setup: [
        'Panca regolata a 45-60 gradi.',
        'Siediti appoggiando completamente la schiena e la nuca allo schienale.',
        'Lascia pendere i manubri verso il pavimento perpendicolari al suolo con le braccia distese dietro il busto.',
      ],
      steps: [
        'Fletti i gomiti sollevando i manubri e supinando i polsi man mano che sali.',
        'Mantieni gli omeri immobili perpendicolari al pavimento, senza farli avanzare.',
        'Contrai con forza il capo lungo del bicipite in cima.',
        'Riscendi lentamente in 3-4 secondi sentendo lo stiramento profondo sul bicipite al fondo corsa.',
      ],
      cues: [
        'Gomiti piombati verso il pavimento: non farli oscillare in avanti',
        'Senti lo stiramento estremo nella parte iniziale di ogni ripetizione',
      ],
      criteria: [
        'Omeri fermi nello spazio per tutta l esecuzione',
        'Fase eccentrica lenta e cadenzata',
      ],
    },
    errors: [
      {
        error: 'Portare i gomiti avanti trasformando il movimento in un curl standard',
        why: 'Annulla l estensione omerale e toglie il pre-stiramento dal capo lungo del bicipite.',
        fix: 'Fissa visivamente i gomiti e mantienili orientati al pavimento.',
      },
    ],
    description: 'Curl con manubri su panca a 45 gradi per allungamento e picco del capo lungo del bicipite.',
    tags: ['braccia', 'bicipiti', 'inclinata', 'allungamento', 'manubri', 'ipertrofia'],
  },
  {
    id: 'arm_06',
    name: 'French Press con Bilanciere Sagomato (Skull Crusher)',
    nameEn: 'Lying EZ-Bar Skull Crusher',
    primaryMuscle: 'Tricipite Brachiale (Capo Mediale e Laterale)',
    secondaryMuscles: ['Tricipite Brachiale (Capo Lungo)', 'Anconeo'],
    muscles: ['Tricipite Brachiale', 'Braccia'],
    type: 'Isolamento',
    level: 'Intermedio',
    equipment: 'Bilanciere',
    variants: ['Dumbbell Skull Crusher', 'Cable French Press'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Estensione del gomito da supino con bilanciere EZ. Esercizio di riferimento per l ipertrofia e la forza dei tricipiti lungo una traiettoria semi-fissa.',
      setup: [
        'Disteso supino su panca piana con i piedi ben saldi a terra.',
        'Impugna il bilanciere EZ sulle prese interne con presa prona stretta.',
        'Distendi le braccia sopra il petto e inclina gli omeri all indietro di circa 15-20 gradi verso la testa (non verticali a 90 gradi) per conservare tensione costante.',
      ],
      steps: [
        'Fletti solo i gomiti abbassando il bilanciere verso la fronte o appena oltre la sommità della testa.',
        'Mantieni gli omeri fermi all angolo di inclinazione prescelto senza allargare i gomiti.',
        'Arriva al massimo allungamento confortevole del tricipite.',
        'Estendi con decisione i gomiti tornando alla posizione iniziale a braccia tese.',
      ],
      cues: [
        'Gomiti stretti: immagina di stringere una palla tra i gomiti',
        'Muovi solo gli avambracci, gli omeri sono due pilastri congelati',
        'Discesa lenta e controllata verso la nuca',
      ],
      criteria: [
        'Gomiti che non si aprono all esterno durante la spinta',
        'Traiettoria fluida verso la parte alta del capo',
      ],
    },
    errors: [
      {
        error: 'Svasamento dei gomiti verso l esterno durante la distensione',
        why: 'Scarica i tricipiti coinvolgendo il petto e crea forze di torsione sul gomito.',
        fix: 'Mantieni i gomiti rigorosamente paralleli e rivolti al soffitto.',
      },
      {
        error: 'Omeri perfettamente verticali a 90 gradi',
        why: 'Azzera la tensione muscolare sul tricipite al lockout concentrico.',
        fix: 'Inclina gli omeri di 15-20 gradi indietro verso la testa.',
      },
    ],
    description: 'Estensioni su panca piana con bilanciere sagomato per la massa globale dei tricipiti brachiali.',
    tags: ['braccia', 'tricipiti', 'bilanciere', 'french-press', 'skull-crusher', 'ipertrofia'],
  },
  {
    id: 'arm_07',
    name: 'Pushdown ai Cavi con Corda',
    nameEn: 'Cable Rope Triceps Pushdown',
    primaryMuscle: 'Tricipite Brachiale (Capo Laterale)',
    secondaryMuscles: ['Tricipite Brachiale (Capo Mediale e Lungo)'],
    muscles: ['Tricipite Brachiale', 'Braccia'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Cavi',
    variants: ['Pushdown con Barra Dritta', 'Single Arm Cable Pushdown'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Estensione del gomito al cavo alto con corda. La flessibilità della corda consente di aprire le mani al vertice inferiore per il massimo picco di accorciamento del capo laterale.',
      setup: [
        'Collega la corda doppia alla carrucola alta della stazione cavi.',
        'Impugna le estremità con presa neutra, un passo indietro con tronco leggermente inclinato in avanti.',
        'Gomiti serrati lungo i fianchi ad altezza costole.',
      ],
      steps: [
        'Spingi la corda verso il basso estendendo i gomiti fino a braccia completamente dritte.',
        'All apice inferiore, allarga le estremità della corda verso l esterno ruotando leggermente i polsi in pronazione.',
        'Spremi con forza i tricipiti per 1 secondo al blocco.',
        'Ritorna lentamente piegando i gomiti fino a un angolo di circa 90 gradi senza muovere gli omeri.',
      ],
      cues: [
        'Gomiti incollati ai fianchi come incollati con adesivo',
        'Separa le estremità della corda in fondo',
        'Tronco immobile, non usare il peso del corpo per spingere',
      ],
      criteria: [
        'Completa apertura e distensione in basso a ogni ripetizione',
        'Zero oscillazioni degli omeri avanti e indietro',
      ],
    },
    errors: [
      {
        error: 'Oscillare gli omeri avanti e indietro per aiutarsi con i dorsali',
        why: 'Trasforma l esercizio in un pulldown dorsale togliendo lavoro ai tricipiti.',
        fix: 'Blocca i gomiti sui fianchi e muovi esclusivamente l avambraccio.',
      },
    ],
    description: 'Estensione per tricipiti al cavo alto con corda per enfasi sul capo laterale e picco di contrazione.',
    tags: ['braccia', 'tricipiti', 'cavi', 'pushdown', 'corda', 'ipertrofia'],
  },
  {
    id: 'arm_08',
    name: 'Pushdown ai Cavi con Barra Dritta',
    nameEn: 'Straight-Bar Cable Pushdown',
    primaryMuscle: 'Tricipite Brachiale (Capo Mediale e Laterale)',
    secondaryMuscles: ['Tricipite Brachiale (Capo Lungo)'],
    muscles: ['Tricipite Brachiale', 'Braccia'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Cavi',
    variants: ['V-Bar Pushdown', 'Rope Pushdown'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Estensione del gomito con barra rigida. Consente un sovraccarico progressivo superiore rispetto alla corda per sviluppare forza e spessore nei tricipiti.',
      setup: [
        'Fissa una barra dritta o angolata a V alla carrucola alta.',
        'Impugna con presa prona a larghezza pari alla larghezza delle spalle.',
        'Gomiti serrati ai fianchi, busto leggermente flesso in avanti.',
      ],
      steps: [
        'Spingi la sbarra verso il basso fino a estendere completamente i gomiti.',
        'Trattieni la contrazione al blocco per un istante.',
        'Rilascia il carico tornando a formare un angolo retto di 90 gradi ai gomiti.',
      ],
      cues: [
        'Polsi rigidi sopra la barra',
        'Distendi a fondo fino a serrare i gomiti',
      ],
      criteria: [
        'Controllo assoluto della risalita senza far sbattere i pesi',
      ],
    },
    errors: [
      {
        error: 'Sollevare i gomiti verso l alto a fine risalita',
        why: 'Provoca perdita di tensione continua sui tricipiti.',
        fix: 'Fermati a 90 gradi di flessione prima che i gomiti si stacchino dai fianchi.',
      },
    ],
    description: 'Spinta verso il basso con barra al cavo alto per carico pesante sui tricipiti.',
    tags: ['braccia', 'tricipiti', 'cavi', 'pushdown', 'barra', 'ipertrofia'],
  },
  {
    id: 'arm_09',
    name: 'Dip tra Due Panche per Tricipiti',
    nameEn: 'Bench Dips',
    primaryMuscle: 'Tricipite Brachiale',
    secondaryMuscles: ['Deltoide Anteriore', 'Pettorale'],
    muscles: ['Tricipiti Brachiali', 'Braccia', 'Deltoide Anteriore'],
    type: 'Multiarticolare',
    level: 'Principiante',
    equipment: 'Corpo Libero',
    variants: ['Dip alle Parallele', 'Dip su Panca con Sovraccarico'],
    quality: 'Resistenza',
    execution: {
      context: 'Spinta verso il basso a corpo libero con mani appoggiate sul bordo di una panca e talloni su un altra panca o a terra.',
      setup: [
        'Poggia i palmi sul bordo di una panca con dita in avanti aderenti al bacino.',
        'Piedi appoggiati a terra o su una seconda panca di fronte a te a gambe tese.',
        'Spalle depresse e busto vicino al bordo della panca.',
      ],
      steps: [
        'Scendi flettendo i gomiti all indietro fino a raggiungere un angolo di 90 gradi.',
        'Mantieni la schiena vicinissima alla panca per non sforzare le spalle.',
        'Spingi con i palmi estendendo i gomiti per risalire in cima.',
        'Espira durante la fase concentrica.',
      ],
      cues: [
        'Schiena che sfiora la panca in discesa',
        'Gomiti orientati indietro, non aperti all esterno',
      ],
      criteria: [
        'Arresto a 90 gradi al gomito per salvaguardare la cuffia anteriore',
      ],
    },
    errors: [
      {
        error: 'Allontanare il bacino dalla panca scendendo in avanti',
        why: 'Pone un gravoso braccio di leva da sforzo sulla capsula anteriore della spalla.',
        fix: 'Fai scorrere la schiena a filo della panca durante tutta l escursione.',
      },
    ],
    description: 'Piegamenti per tricipiti tra due panche a corpo libero per tricipiti ed estensori.',
    tags: ['braccia', 'tricipiti', 'dip-panche', 'corpo-libero', 'resistenza'],
  },
  {
    id: 'arm_10',
    name: 'Estensioni Tricipiti con Manubrio a Due Mani Dietro la Nuca',
    nameEn: 'Seated Overhead Dumbbell Triceps Extension',
    primaryMuscle: 'Tricipite Brachiale (Capo Lungo)',
    secondaryMuscles: ['Tricipite Brachiale (Capo Laterale e Mediale)'],
    muscles: ['Tricipite Brachiale (Capo Lungo)', 'Braccia'],
    type: 'Isolamento',
    level: 'Intermedio',
    equipment: 'Manubri',
    variants: ['Overhead Cable Extension', 'One-Arm Overhead Dumbbell Extension'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Estensione del gomito con omero completamente flesso sopra la testa. Posiziona il capo lungo del tricipite in massimo pre-allungamento per stimolarne l ipertrofia specifica.',
      setup: [
        'Siediti su una panca con schienale basso o verticale a supporto della zona lombare.',
        'Sostieni un manubrio pesante sopra la testa con entrambi i palmi incastrati a diamante sotto la piastra superiore.',
        'Gomiti orientati verso l alto e verso l interno vicino alle orecchie.',
      ],
      steps: [
        'Fletti i gomiti abbassando il manubrio lentamente dietro la nuca.',
        'Scendi fino a sentire un profondo stiramento nei tricipiti.',
        'Spingi verso l alto estendendo i gomiti fino a riportare il manubrio sopra la testa.',
        'Mantieni il core compatto senza inarcare la schiena.',
      ],
      cues: [
        'Gomiti puntati al soffitto come due frecce',
        'Controlla la discesa dietro la testa',
        'Addome rigido per non inarcare la zona lombare',
      ],
      criteria: [
        'Gomiti mantenuti vicini senza svasare aperti',
        'Piena escursione con stiramento marcato',
      ],
    },
    errors: [
      {
        error: 'Inarcare eccessivamente la zona lombare per completare la spinta',
        why: 'Compensa la rigidità delle spalle danneggiando la colonna vertebrale.',
        fix: 'Mantieni l addome compatto e la schiena aderente allo schienale.',
      },
    ],
    description: 'Estensione verticale dietro la testa con manubrio per allungamento e massa del capo lungo del tricipite.',
    tags: ['braccia', 'tricipiti', 'overhead', 'manubri', 'capo-lungo', 'ipertrofia'],
  },
  {
    id: 'arm_11',
    name: 'Kickback con Manubri',
    nameEn: 'Dumbbell Triceps Kickback',
    primaryMuscle: 'Tricipite Brachiale (Capo Laterale e Lungo)',
    secondaryMuscles: ['Anconeo'],
    muscles: ['Tricipite Brachiale', 'Braccia'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Manubri',
    variants: ['Cable Kickback'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Estensione orizzontale del gomito a busto flesso parallelo al suolo. Massimizza la contrazione di picco nel punto di massimo accorciamento articolare.',
      setup: [
        'Busto flesso a 90 gradi con appoggio a treppiede su una panca (ginocchio e mano sullo schienale).',
        'Impugna il manubrio portando il gomito in alto e indietro allineato parallelamente al tronco.',
      ],
      steps: [
        'Estendi il gomito all indietro fino a distendere completamente il braccio parallelamente al pavimento.',
        'Spremi il tricipite al picco per un secondo.',
        'Fletti il gomito tornando a 90 gradi mantenendo l omero sempre sollevato.',
      ],
      cues: [
        'Gomito alto e incollato al fianco',
        'Muovi solo l avambraccio all indietro',
      ],
      criteria: [
        'Completa estensione orizzontale',
      ],
    },
    errors: [
      {
        error: 'Lasciar cadere il gomito verso il pavimento a ogni ripetizione',
        why: 'Annulla la leva di gravità togliendo efficacia al gesto.',
        fix: 'Blocca il gomito più in alto della schiena per tutta la serie.',
      },
    ],
    description: 'Estensione posteriore del braccio con manubrio per contrazione di picco del tricipite.',
    tags: ['braccia', 'tricipiti', 'kickback', 'manubri', 'isolamento', 'ipertrofia'],
  },
  {
    id: 'arm_12',
    name: 'Concentration Curl con Manubrio (Curl di Concentrazione)',
    nameEn: 'Dumbbell Concentration Curl',
    primaryMuscle: 'Bicipite Brachiale',
    secondaryMuscles: ['Brachiale'],
    muscles: ['Bicipite Brachiale', 'Braccia'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Manubri',
    variants: ['Preacher Curl'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Curl da seduti con gomito incastrato contro l interno coscia. Elimina qualunque compenso corporeo isolando il picco di contrazione del bicipite.',
      setup: [
        'Siediti sul bordo di una panca a gambe divaricate.',
        'Impugna un manubrio e ancora il retro del gomito contro la parte interna della coscia omolaterale.',
        'Braccio completamente disteso verso il suolo.',
      ],
      steps: [
        'Fletti il gomito portando il manubrio verso la spalla/viso.',
        'Spremi al massimo il bicipite in cima.',
        'Riscendi lentamente fino alla completa estensione dell arto.',
      ],
      cues: [
        'Gomito fisso contro la coscia',
        'Non dondolare con il tronco',
      ],
      criteria: [
        'Isolamento puro e controllo eccentrico',
      ],
    },
    errors: [
      {
        error: 'Spallata in alto per far partire il peso',
        why: 'Incapacità di isolare il bicipite.',
        fix: 'Riduci il carico e mantieni il braccio ancorato.',
      },
    ],
    description: 'Curl da seduti con gomito bloccato all interno della coscia per massimo isolamento del bicipite.',
    tags: ['braccia', 'bicipiti', 'concentration-curl', 'manubri', 'isolamento', 'ipertrofia'],
  },
];
