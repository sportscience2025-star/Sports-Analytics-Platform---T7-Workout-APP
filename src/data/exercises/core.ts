/**
 * src/data/exercises/core.ts
 * Catalogo modulare degli esercizi per il gruppo muscolare Core / Addome.
 * Singola responsabilità per la tassonomia del torchio addominale, anti-rotazione e stabilità lombo-pelvica.
 * Rispetta la Regola R1 (Zero any) e Regola R2 (Interfacce da src/types).
 */

import type { Exercise } from '../../types/exercise';

export const coreExercises: Exercise[] = [
  {
    id: 'cr_01',
    name: 'Standard Plank sui Gomiti',
    nameEn: 'Elbow Plank',
    primaryMuscle: 'Trasverso dell Addome',
    secondaryMuscles: ['Retto dell Addome', 'Obliqui', 'Glutei', 'Dentato Anteriore'],
    muscles: ['Trasverso dell Addome', 'Core', 'Retto dell Addome', 'Glutei'],
    type: 'Isometrico',
    level: 'Principiante',
    equipment: 'Corpo Libero',
    variants: ['High Plank sulle Mani', 'Plank con Piedi Rialzati', 'RKC Plank'],
    quality: 'Stabilità',
    execution: {
      context: 'Esercizio isometrico fondamentale di anti-estensione per il complesso lombo-pelvico-femorale. Allena la tenuta del core preservando la salute dei dischi intervertebrali.',
      setup: [
        'Posizionati prono al suolo con gomiti appoggiati a 90 gradi direttamente sotto le articolazioni delle spalle.',
        'Avampiedi a terra ad ampiezza bacino, sguardo rivolto al pavimento tra le mani.',
        'Allinea collo, colonna vertebrale e bacino in un asse rettilineo perfetto.',
      ],
      steps: [
        'Solleva il corpo da terra sostenendoti esclusivamente su gomiti e punte dei piedi.',
        'Attiva contemporaneamente glutei e addome eseguendo una leggera retroversione del bacino (posterior pelvic tilt).',
        'Spingi i gomiti contro il pavimento allontanando le scapole (leggera protrazione scapolare).',
        'Mantieni la posizione respirando regolarmente con respirazione diaframmatica senza andare in apnea.',
      ],
      cues: [
        'Corpo come una tavola d acciaio: non cedere al centro',
        'Stringi i glutei con forza come a trattenere una moneta',
        'Tira idealmente i gomiti verso le punte dei piedi per aumentare la tensione attiva (RKC style)',
      ],
      criteria: [
        'Linea retta inalterata da orecchie, spalle, anche, ginocchia e caviglie',
        'Assenza di cedimento lombare per l intera durata prescritta',
      ],
    },
    errors: [
      {
        error: 'Cedimento del bacino verso il pavimento con iperlordosi lombare',
        why: 'Incapacità o esaurimento del trasverso che scarica il peso sulle faccette articolari lombari.',
        fix: 'Interrompi la serie non appena il bacino scende sotto la linea neutra.',
      },
      {
        error: 'Sollevamento del bacino a piramide verso l alto',
        why: 'Compensa la fatica flettendo l anca e scaricando la tensione dall addome.',
        fix: 'Riallinea il bacino all altezza del torace mantenendo i glutei serrati.',
      },
    ],
    description: 'Tenuta isometrica prona sui gomiti per stabilità del core e anti-estensione spinale.',
    tags: ['core', 'plank', 'isometrico', 'anti-estensione', 'stabilità', 'corpo-libero'],
  },
  {
    id: 'cr_02',
    name: 'Crunch a Terra',
    nameEn: 'Floor Abdominal Crunch',
    primaryMuscle: 'Retto dell Addome',
    secondaryMuscles: ['Obliqui'],
    muscles: ['Retto dell Addome', 'Core'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Corpo Libero',
    variants: ['Crunch su Fitball', 'Cable Crunch in Ginocchio'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Flessione pura della colonna toraco-lombare che avvicina lo sterno al pube senza coinvolgere i flessori dell anca (ileopsoas).',
      setup: [
        'Sdraiati supino sul pavimento con ginocchia flesse a 90 gradi e piante dei piedi ben piantate al suolo.',
        'Mani dietro la nuca a sostenere delicatamente il capo senza tirare il collo (o incrociate sul petto).',
        'Zona lombare spianata a terra.',
      ],
      steps: [
        'Espira completamente contraendo l addome per sollevare le scapole e la parte superiore della schiena dal pavimento.',
        'Arrotonda la colonna avvicinando le costole verso il bacino per circa 30 gradi di elevazione.',
        'Trattieni la massima contrazione per 1 secondo al vertice espellendo tutta l aria residua.',
        'Ritorna lentamente sfiorando il suolo con le scapole prima della ripetizione successiva.',
      ],
      cues: [
        'Pensa ad accorciare la distanza tra sterno e ombelico',
        'Non tirare la testa con le mani: immagina di tenere una mela sotto il mento',
        'La parte bassa della schiena rimane sempre premuta a terra',
      ],
      criteria: [
        'Sollevamento delle sole scapole senza stacco della zona lombare',
        'Zero trazione sul rachide cervicale',
      ],
    },
    errors: [
      {
        error: 'Trazione forzata sul collo con le mani',
        why: 'Provoca dolorose contratture al tratto cervicale senza alcun beneficio addominale.',
        fix: 'Tieni le mani alle tempie o sul torace, mantenendo lo sguardo a 45 gradi verso il soffitto.',
      },
    ],
    description: 'Flessione del tronco da supino per l isolamento del retto dell addome.',
    tags: ['core', 'addome', 'crunch', 'corpo-libero', 'isolamento', 'ipertrofia'],
  },
  {
    id: 'cr_03',
    name: 'Hanging Leg Raise alla Sbarra',
    nameEn: 'Hanging Leg Raise',
    primaryMuscle: 'Retto dell Addome',
    secondaryMuscles: ['Flessori dell Anca (Iliopsoas)', 'Obliqui', 'Avambracci (Presa)'],
    muscles: ['Retto dell Addome', 'Core', 'Flessori dell Anca'],
    type: 'Multiarticolare',
    level: 'Avanzato',
    equipment: 'Sbarra Trazioni',
    variants: ['Hanging Knee Raise', 'Captain s Chair Leg Raise', 'Toes to Bar'],
    quality: 'Forza',
    execution: {
      context: 'Esercizio avanzato in sospensione. Combina flessione d anca e attiva retroversione del bacino per stimolare con intensità massimale tutta la parete addominale anteriore.',
      setup: [
        'Sospenditi a una sbarra da trazioni a presa prona alla larghezza delle spalle.',
        'Scapole attive in depressione, gambe perfettamente tese a piedi uniti.',
      ],
      steps: [
        'Inizia sollevando le gambe tese in avanti contraendo gli addominali.',
        'Superati i 90 gradi con le anche, arriccia attivamente il bacino verso l alto portando i piedi verso la sbarra (o almeno orizzontali).',
        'Pausa di controllo nel punto più alto.',
        'Abbassa le gambe lentamente in 3 secondi senza lasciarle cadere né dondolare all indietro.',
      ],
      cues: [
        'Arriccia il bacino verso il torace per attivare davvero l addome e non solo i flessori dell anca',
        'Zero dondolio: il corpo non deve trasformarsi in un pendolo',
      ],
      criteria: [
        'Salita controllata e discesa eccentrica lenta senza inerzia',
        'Coinvolgimento attivo della retroversione pelvica',
      ],
    },
    errors: [
      {
        error: 'Sfruttare l oscillazione del corpo a mo di altalena',
        why: 'Usa il moto pendolare eliminando lo stimolo muscolare contrattile.',
        fix: 'Ferma completamente il corpo in basso prima di ogni ripetizione.',
      },
    ],
    description: 'Sollevamento delle gambe in sospensione alla sbarra per forza e sviluppo della parete addominale.',
    tags: ['core', 'addome', 'sbarra', 'hanging-leg-raise', 'forza', 'avanzato'],
  },
  {
    id: 'cr_04',
    name: 'Ab Rollout con Ruota',
    nameEn: 'Ab Wheel Rollout',
    primaryMuscle: 'Retto dell Addome',
    secondaryMuscles: ['Trasverso dell Addome', 'Gran Dorsale', 'Dentato Anteriore'],
    muscles: ['Retto dell Addome', 'Core', 'Trasverso dell Addome', 'Gran Dorsale'],
    type: 'Multiarticolare',
    level: 'Avanzato',
    equipment: 'Attrezzi',
    variants: ['Standing Ab Wheel Rollout', 'Barbell Ab Rollout'],
    quality: 'Forza',
    execution: {
      context: 'Esercizio ad altissima tensione meccanica di anti-estensione. Allunga la leva corporea richiedendo forza eccentrica estrema al torchio addominale.',
      setup: [
        'In ginocchio su un tappetino impugnando le maniglie della ruota addominale direttamente sotto le spalle.',
        'Dorso leggermente curvo (hollow position), bacino in retroversione, glutei contratti.',
      ],
      steps: [
        'Fai rotolare la ruota in avanti estendendo il corpo verso il pavimento.',
        'Scendi fino al massimo allungamento controllabile prima che il bacino ceda o tocchi terra.',
        'Inverti il movimento contraendo con violenza gli addominali e i dorsali per tirare la ruota indietro verso le ginocchia.',
        'Mantieni il bacino bloccato senza sederti sui talloni a fine corsa.',
      ],
      cues: [
        'Blocca il bacino in retroversione e non perderla mai',
        'Pensa ad allungarti come una molla e poi richiuderti tirando con l addome',
      ],
      criteria: [
        'Zero cedimento lombare nella massima estensione',
        'Ritorno guidato dal core senza spostare le anche sui talloni',
      ],
    },
    errors: [
      {
        error: 'Inarcamento lombare nella fase di massimo allungamento',
        why: 'Pericolo critico di ipersollecitazione discale lombare.',
        fix: 'Riduci l ampiezza della rullata fermandoti prima di una parete come blocco meccanico.',
      },
    ],
    description: 'Rullata in avanti con ruota per forza estrema del core in allungamento eccentrico.',
    tags: ['core', 'ab-wheel', 'rollout', 'anti-estensione', 'forza', 'avanzato'],
  },
  {
    id: 'cr_05',
    name: 'Pallof Press in Piedi ai Cavi',
    nameEn: 'Standing Cable Pallof Press',
    primaryMuscle: 'Obliqui (Interno ed Esterno)',
    secondaryMuscles: ['Trasverso dell Addome', 'Gluteo Medio'],
    muscles: ['Obliqui', 'Core', 'Trasverso dell Addome', 'Gluteo Medio'],
    type: 'Isometrico',
    level: 'Principiante',
    equipment: 'Cavi',
    variants: ['Kneeling Pallof Press', 'Pallof Press con Elastico'],
    quality: 'Stabilità',
    execution: {
      context: 'L esercizio gold standard per l anti-rotazione del tronco. Insegna al core a resistere a perturbazioni rotazionali trasversali, proteggendo il rachide da torsioni anomale.',
      setup: [
        'Posiziona la carrucola all altezza del torace.',
        'Impugna la maniglia con entrambe le mani tenendola aderente allo sterno.',
        'Fai due passi lateralmente allontanandoti dalla colonna cavi: piedi a larghezza spalle, ginocchia sbloccate.',
      ],
      steps: [
        'Distendi lentamente le braccia in avanti espirando, allontanando le mani dal petto.',
        'Resisti alla forza del cavo che tenta di ruotare il tuo tronco verso la carrucola.',
        'Trattieni la posizione a braccia distese per 2-3 secondi mantenendo il busto perfettamente frontale.',
        'Ritorna con le mani al petto e ripeti.',
      ],
      cues: [
        'Spalle e bacino perpendicolari al cavo e rivolti rigorosamente in avanti',
        'Resisti alla rotazione con gli addominali laterali e i glutei',
      ],
      criteria: [
        'Zero torsione del busto quando le braccia si estendono',
        'Piedi saldi al suolo senza compensi di compenso',
      ],
    },
    errors: [
      {
        error: 'Ruotare il busto o le spalle verso la macchina',
        why: 'Cede al momento torcente azzerando il lavoro di anti-rotazione.',
        fix: 'Riduci il carico e mantieni il logo della maglietta dritto davanti a te.',
      },
    ],
    description: 'Esercizio isometrico di anti-rotazione ai cavi per la stabilità lombo-pelvica.',
    tags: ['core', 'pallof-press', 'anti-rotazione', 'cavi', 'stabilità', 'salute-lombare'],
  },
  {
    id: 'cr_06',
    name: 'Russian Twist con Sovraccarico',
    nameEn: 'Weighted Russian Twist',
    primaryMuscle: 'Obliqui',
    secondaryMuscles: ['Retto dell Addome', 'Flessori dell Anca'],
    muscles: ['Obliqui', 'Core', 'Retto dell Addome'],
    type: 'Multiarticolare',
    level: 'Intermedio',
    equipment: 'Attrezzi',
    variants: ['Bodyweight Russian Twist'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Rotazione del tronco con busto inclinato a 45 gradi da terra. Allena la capacità di rotazione controllata e tenuta isometrica del retto addominale.',
      setup: [
        'Siediti a terra con ginocchia flesse, piedi sollevati (o appoggiati a terra per i principianti).',
        'Inclina il busto all indietro a 45 gradi creando una V tra cosce e tronco.',
        'Sostieni un disco o kettlebell con entrambe le mani davanti al petto.',
      ],
      steps: [
        'Ruota il busto verso destra portando il peso verso il pavimento a lato del fianco.',
        'Ruota poi fluidamente verso sinistra controllando la traiettoria.',
        'Mantieni le gambe stabili al centro senza farle oscillare ad ogni torsione.',
      ],
      cues: [
        'Ruota con le spalle e la cassa toracica, non muovere solo le braccia',
        'Addome compresso e petto alto',
      ],
      criteria: [
        'Rotazione controllata e continua senza scatti bruschi',
      ],
    },
    errors: [
      {
        error: 'Muovere solo le braccia a destra e sinistra a busto fermo',
        why: 'Inutile per gli obliqui che necessitano della rotazione toracica.',
        fix: 'Fai ruotare l intero tronco insieme al peso.',
      },
    ],
    description: 'Rotazione dinamica del tronco da seduti con carico per obliqui e coordinazione.',
    tags: ['core', 'obliqui', 'russian-twist', 'rotazione', 'ipertrofia'],
  },
  {
    id: 'cr_07',
    name: 'Side Plank sui Gomiti',
    nameEn: 'Elbow Side Plank',
    primaryMuscle: 'Quadrato dei Lombi',
    secondaryMuscles: ['Obliqui', 'Gluteo Medio', 'Trasverso dell Addome'],
    muscles: ['Quadrato dei Lombi', 'Obliqui', 'Core', 'Gluteo Medio'],
    type: 'Isometrico',
    level: 'Principiante',
    equipment: 'Corpo Libero',
    variants: ['Side Plank Dinamico', 'Side Plank con Elevazione Gamba'],
    quality: 'Stabilità',
    execution: {
      context: 'Esercizio isometrico cardine del Big 3 di McGill per l anti-flessione laterale. Rinforza il quadrato dei lombi e gli obliqui proteggendo la colonna da carichi asimmetrici.',
      setup: [
        'Sdraiati sul fianco appoggiando l avambraccio a terra con gomito direttamente sotto la spalla.',
        'Gambe distese con piedi sovrapposti o sfalsati per maggiore equilibrio.',
      ],
      steps: [
        'Solleva il bacino dal pavimento estendendo il corpo in una linea retta obliqua dalla testa ai piedi.',
        'Braccio superiore lungo il fianco o puntato verso il soffitto.',
        'Trattieni la posizione mantenendo il bacino alto e le anche aperte in avanti.',
      ],
      cues: [
        'Non lasciare che il bacino cada verso il pavimento',
        'Spalle aperte, non collassare in avanti col torace',
      ],
      criteria: [
        'Allineamento perfetto sul piano frontale per tutta la durata',
      ],
    },
    errors: [
      {
        error: 'Caduta del bacino verso il pavimento',
        why: 'Causa flessione laterale che comprime i dischi.',
        fix: 'Spingi attivamente il fianco verso il soffitto contraendo il gluteo medio e l obliquo inferiore.',
      },
    ],
    description: 'Plank laterale per rinforzo del quadrato dei lombi, obliqui e stabilità laterale.',
    tags: ['core', 'side-plank', 'isometrico', 'anti-flessione-laterale', 'mcgill', 'stabilità'],
  },
  {
    id: 'cr_08',
    name: 'Hollow Body Hold (Tenuta a Barchetta)',
    nameEn: 'Hollow Body Hold',
    primaryMuscle: 'Retto dell Addome',
    secondaryMuscles: ['Trasverso dell Addome', 'Flessori dell Anca', 'Quadricipiti'],
    muscles: ['Retto dell Addome', 'Core', 'Trasverso dell Addome'],
    type: 'Isometrico',
    level: 'Intermedio',
    equipment: 'Corpo Libero',
    variants: ['Tuck Hollow Hold', 'Hollow Rocks'],
    quality: 'Stabilità',
    execution: {
      context: 'Posizione fondamentale della ginnastica artistica e del calisthenics. Insegna a compattare l intera catena anteriore con totale appiattimento della lordosi lombare a terra.',
      setup: [
        'Sdraiati supino con gambe distese e braccia allungate oltre la testa.',
        'Appiattisci completamente la zona lombare contro il suolo contraendo gli addominali.',
      ],
      steps: [
        'Solleva simultaneamente le gambe (a circa 15-20 cm da terra) e la parte superiore delle spalle mantenendo le braccia accanto alle orecchie.',
        'Il corpo assume la forma di una barchetta con il solo bacino e lombari che toccano terra.',
        'Mantieni la contrazione respirando a piccoli respiri diaframmatici controllati.',
      ],
      cues: [
        'Incolla la parte bassa della schiena al pavimento: non deve passare nemmeno un foglio di carta sotto',
        'Punte dei piedi tirate in avanti, braccia lunghe',
      ],
      criteria: [
        'Adesione lombare totale al suolo ininterrotta',
      ],
    },
    errors: [
      {
        error: 'Inarcamento della colonna con spazio tra schiena e pavimento',
        why: 'Leva troppo pesante per la forza addominale attuale.',
        fix: 'Riduci la leva flettendo le ginocchia (tuck hollow) finché la schiena non tocca di nuovo.',
      },
    ],
    description: 'Tenuta isometrica a barchetta della ginnastica artistica per controllo e compattezza del core.',
    tags: ['core', 'calisthenics', 'hollow-body', 'ginnastica', 'stabilità', 'isometrico'],
  },
  {
    id: 'cr_09',
    name: 'Bird-Dog Controllato',
    nameEn: 'Controlled Bird-Dog',
    primaryMuscle: 'Erettori Spinali',
    secondaryMuscles: ['Grande Gluteo', 'Deltoide Posteriore', 'Core'],
    muscles: ['Erettori Spinali', 'Core', 'Grande Gluteo'],
    type: 'Isometrico',
    level: 'Principiante',
    equipment: 'Corpo Libero',
    variants: ['Bird-Dog con Disegno di Quadrati', 'Bird-Dog con Elastico'],
    quality: 'Stabilità',
    execution: {
      context: 'Altro pilastro del Big 3 di McGill per la catena crociata posteriore. Rinforza gli estensori spinali senza generare carichi compressivi sulla colonna lombare.',
      setup: [
        'Posizione quadrupedica: mani sotto le spalle e ginocchia sotto le anche a 90 gradi.',
        'Colonna vertebrale rigorosamente in posizione neutra, sguardo verso il suolo.',
      ],
      steps: [
        'Estendi contemporaneamente il braccio destro in avanti e la gamba sinistra all indietro.',
        'Raggiungi l allineamento orizzontale senza inarcare la schiena né ruotare il bacino.',
        'Trattieni la contrazione statica per 4-5 secondi spingendo via la parete col tallone.',
        'Ritorna lentamente in quadrupedia e ripeti con gli arti opposti.',
      ],
      cues: [
        'Pensa ad allungarti verso le pareti opposte, non a salire verso l alto',
        'Immagina di avere un bicchiere d acqua appoggiato sulla parte bassa della schiena',
      ],
      criteria: [
        'Bacino perfettamente orizzontale senza inclinazioni laterali',
      ],
    },
    errors: [
      {
        error: 'Iperestensione lombare sollevando la gamba troppo in alto',
        why: 'Inarca la schiena sovraccaricando le articolazioni vertebrali.',
        fix: 'Solleva la gamba solo fino all altezza del bacino allungando il tallone indietro.',
      },
    ],
    description: 'Estensione crociata braccio-gamba in quadrupedia per stabilità rotazionale e della catena posteriore.',
    tags: ['core', 'bird-dog', 'mcgill', 'stabilità', 'salute-schiena', 'postura'],
  },
  {
    id: 'cr_10',
    name: 'Woodchopper ai Cavi',
    nameEn: 'Cable Woodchopper',
    primaryMuscle: 'Obliqui',
    secondaryMuscles: ['Retto dell Addome', 'Deltoidi', 'Glutei'],
    muscles: ['Obliqui', 'Core', 'Spalle'],
    type: 'Multiarticolare',
    level: 'Intermedio',
    equipment: 'Cavi',
    variants: ['Kneeling Cable Woodchopper', 'Med Ball Woodchopper'],
    quality: 'Potenza',
    execution: {
      context: 'Movimento dinamico diagonale su piano trasverso che allena la potenza e la trasmissione di forza rotazionale dal treno inferiore alle braccia.',
      setup: [
        'Regola la carrucola alta (o bassa) della stazione cavi.',
        'Afferra la maniglia a due mani posizionandoti di fianco al cavo a braccia distese.',
        'Piedi ad ampiezza spalle, ginocchia sbloccate.',
      ],
      steps: [
        'Traziona la maniglia diagonalmente verso il basso e oltre il ginocchio opposto in un unico gesto fluido.',
        'Ruota il busto e perno sul piede posteriore assecondando la traiettoria di spinta.',
        'Ritorna lentamente lungo la stessa linea diagonale resistendo al cavo.',
      ],
      cues: [
        'Il movimento parte dall anca e dal core, le braccia accompagnano',
        'Ruota il piede posteriore per proteggere il ginocchio',
      ],
      criteria: [
        'Gesto fluido e controllato senza strappi',
      ],
    },
    errors: [
      {
        error: 'Piedi incollati a terra senza sbloccare l anca posteriore',
        why: 'Crea forze di torsione pericolose sul ginocchio e sulla caviglia.',
        fix: 'Pivota sul piede posteriore sollevando il tallone durante la rotazione.',
      },
    ],
    description: 'Trazione diagonale ai cavi per potenza rotazionale degli obliqui e coordinazione.',
    tags: ['core', 'obliqui', 'woodchopper', 'cavi', 'rotazione', 'potenza'],
  },
  {
    id: 'cr_11',
    name: 'Dragon Flag a Terra',
    nameEn: 'Dragon Flag',
    primaryMuscle: 'Retto dell Addome',
    secondaryMuscles: ['Obliqui', 'Gran Dorsale', 'Glutei'],
    muscles: ['Retto dell Addome', 'Core', 'Gran Dorsale', 'Glutei'],
    type: 'Multiarticolare',
    level: 'Avanzato',
    equipment: 'Corpo Libero',
    variants: ['Tuck Dragon Flag', 'Negative Only Dragon Flag'],
    quality: 'Forza',
    execution: {
      context: 'Esercizio calistenico reso celebre da Bruce Lee. Sospende l intero corpo su un solo punto di appoggio scapolare creando una leva estrema per l addome.',
      setup: [
        'Disteso supino su panca afferrando i bordi della panca dietro la testa con le mani ben salde.',
        'Compatta il corpo unendo gambe e piedi in una linea retta rigida.',
      ],
      steps: [
        'Solleva l intero corpo fino alla verticale sostenendoti solo sull upper back e scapole.',
        'Mantieni il corpo come una colonna retta senza flettere le anche.',
        'Scendi con una discesa eccentrica lentissima e controllata fino a sfiorare la panca con il bacino.',
        'Risali con forza addominale o risolleva a gambe raggruppate per ripetere l eccentrica.',
      ],
      cues: [
        'Tutto il corpo è una lancia rigida: le anche non si piegano mai',
        'Contrai fortissimo addome e glutei',
      ],
      criteria: [
        'Zero flessione delle anche durante la discesa',
      ],
    },
    errors: [
      {
        error: 'Piegare le anche spezzando la linea del corpo',
        why: 'Accorcia la leva quando il core cede.',
        fix: 'Esegui la versione con una gamba flessa (one leg) per consolidare la forza.',
      },
    ],
    description: 'Esercizio avanzato calistenico a leva totale per forza massimale del retto addominale.',
    tags: ['core', 'dragon-flag', 'calisthenics', 'forza', 'avanzato'],
  },
  {
    id: 'cr_12',
    name: 'Dead Bug con Respirazione Diaframmatica',
    nameEn: 'Dead Bug with Diaphragmatic Breathing',
    primaryMuscle: 'Trasverso dell Addome',
    secondaryMuscles: ['Retto dell Addome', 'Obliqui', 'Flessori dell Anca'],
    muscles: ['Trasverso dell Addome', 'Core', 'Retto dell Addome'],
    type: 'Multiarticolare',
    level: 'Principiante',
    equipment: 'Corpo Libero',
    variants: ['Dead Bug con Palla Medica', 'Dead Bug con Elastico'],
    quality: 'Stabilità',
    execution: {
      context: 'Esercizio supino di coordinazione controlaterale e dissociazione degli arti. Allena la stabilità del core mentre braccia e gambe si muovono liberamente.',
      setup: [
        'Disteso supino con braccia distese verso il soffitto e ginocchia flesse a 90 gradi direttamente sopra le anche.',
        'Zona lombare spianata e saldamente aderente al pavimento.',
      ],
      steps: [
        'Inspira a fondo gonfiando il diaframma.',
        'Espirando lentamente, abbassa contemporaneamente il braccio destro all indietro e la gamba sinistra in avanti verso il suolo.',
        'Fermati a pochi centimetri dal pavimento senza staccare la parte bassa della schiena da terra.',
        'Ritorna alla posizione di partenza e alterna con braccio sinistro e gamba destra.',
      ],
      cues: [
        'Schiena incollata al suolo: se la schiena si inarca, fermati prima con la gamba',
        'Movimento lento e cadenzato con il respiro',
      ],
      criteria: [
        'Zero distacco lombare dal pavimento durante l estensione',
      ],
    },
    errors: [
      {
        error: 'La schiena si solleva quando la gamba si allunga',
        why: 'I flessori dell anca trascinano la pelvi in antiversione.',
        fix: 'Non allungare la gamba fino a terra: fermati all angolo in cui riesci a mantenere l appoggio.',
      },
    ],
    description: 'Esercizio di controllo motorio e coordinazione controlaterale a terra per stabilità del core.',
    tags: ['core', 'dead-bug', 'stabilità', 'coordinazione', 'postura', 'principiante'],
  },
];
