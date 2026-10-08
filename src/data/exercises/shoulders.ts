/**
 * src/data/exercises/shoulders.ts
 * Catalogo modulare degli esercizi per il gruppo muscolare Spalle / Deltoidi.
 * Singola responsabilità per la tassonomia del cingolo scapolo-omerale e spinte verticali.
 * Rispetta la Regola R1 (Zero any) e Regola R2 (Interfacce da src/types).
 */

import type { Exercise } from '../../types/exercise';

export const shouldersExercises: Exercise[] = [
  {
    id: 'sh_01',
    name: 'Military Press con Bilanciere (Overhead Press)',
    nameEn: 'Standing Barbell Overhead Press',
    primaryMuscle: 'Deltoide Anteriore',
    secondaryMuscles: ['Deltoide Laterale', 'Tricipiti Brachiali', 'Trapezio Superiore', 'Core'],
    muscles: ['Deltoide Anteriore', 'Spalle', 'Deltoide Laterale', 'Tricipiti Brachiali', 'Core'],
    type: 'Multiarticolare',
    level: 'Intermedio',
    equipment: 'Bilanciere',
    variants: ['Seated Overhead Press', 'Push Press', 'Dumbbell Shoulder Press'],
    quality: 'Forza',
    execution: {
      context: 'Spinta verticale in piedi per eccellenza. Costruisce forza bruta nel cingolo scapolo-omerale, stabilità del core e coordinazione della catena cinetica aperta.',
      setup: [
        'Stazione eretta con bilanciere appoggiato sulle clavicole anteriori (Front Rack).',
        'Piedi ad ampiezza spalle con glutei e addome serrati per evitare iperestensioni lombari.',
        'Presa con i pollici opponibili appena all esterno delle spalle, avambracci rigorosamente verticali sotto la barra.',
      ],
      steps: [
        'Ritrai leggermente il mento per liberare la traiettoria verticale del bilanciere.',
        'Spingi con decisione verso l alto spingendo la barra lungo una linea retta perpendicolare al suolo.',
        'Una volta superata la sommità della testa, spingi la testa in avanti (head through) allineando la barra sopra la corona del capo.',
        'Raggiungi il blocco articolare serrato con le scapole in elevazione attiva (shrug al top).',
        'Riscendi controllando la traiettoria fino a riappoggiare alle clavicole.',
      ],
      cues: [
        'Stringi i glutei forte come pietre prima di premere',
        'Avambracci perfettamente verticali sotto la barra',
        'Infila la testa nella finestra formata dalle braccia al vertice',
      ],
      criteria: [
        'Traiettoria della barra perfettamente verticale',
        'Nessun aiuto delle gambe (dip) nella versione strict press',
      ],
    },
    errors: [
      {
        error: 'Inarcamento lombare eccessivo per trasformare il gesto in panca inclinata',
        why: 'Comprime violentemente le faccette articolari lombari e indica un deficit di mobilità toracica o carico eccessivo.',
        fix: 'Retroverti il bacino, contrai addome e glutei e mantieni la gabbia toracica chiusa.',
      },
      {
        error: 'Avambracci inclinati in fuori o indietro prima della spinta',
        why: 'Disperde i vettori di forza e sovraccarica i polsi.',
        fix: 'Regola la larghezza della presa fino a far combaciare polsi e gomiti sullo stesso asse verticale.',
      },
    ],
    description: 'Distensione sopra la testa in piedi con bilanciere per deltoidi, tricipiti e stabilità globale.',
    tags: ['spalle', 'overhead-press', 'military-press', 'bilanciere', 'forza', 'fondamentale'],
  },
  {
    id: 'sh_02',
    name: 'Lento Avanti con Manubri da Seduto',
    nameEn: 'Seated Dumbbell Shoulder Press',
    primaryMuscle: 'Deltoide Anteriore',
    secondaryMuscles: ['Deltoide Laterale', 'Tricipiti Brachiali', 'Trapezio'],
    muscles: ['Deltoide Anteriore', 'Spalle', 'Deltoide Laterale', 'Tricipiti Brachiali'],
    type: 'Multiarticolare',
    level: 'Principiante',
    equipment: 'Manubri',
    variants: ['Standing Dumbbell Press', 'Arnold Press'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Spinta verticale da seduto su panca a 75-80 gradi con manubri. Fornisce supporto alla schiena e consente libertà di rotazione articolare.',
      setup: [
        'Regola lo schienale a 75-80 gradi (evita i 90 gradi per non comprimere l articolazione subacromiale).',
        'Porta i manubri all altezza delle spalle con i gomiti posizionati sul piano scapolare (circa 30-45 gradi in avanti).',
        'Piedi ben piantati a terra, dorso aderente allo schienale.',
      ],
      steps: [
        'Spingi i manubri verso l alto seguendo una traiettoria leggermente convergente naturale.',
        'Fermati prima del contatto tra i manubri mantenendo la tensione sui deltoidi.',
        'Abbassa i manubri controllando la fase eccentrica fino a portare le impugnature all altezza delle orecchie/spalle.',
        'Espira durante la salita, inspira durante la discesa.',
      ],
      cues: [
        'Gomiti orientati leggermente in avanti, mai spalancati a croce a 90 gradi',
        'Polsi stabili sopra i gomiti',
      ],
      criteria: [
        'Discesa fino alle orecchie su ogni ripetizione',
        'Simmetria tra il braccio destro e sinistro',
      ],
    },
    errors: [
      {
        error: 'Gomiti aperti sul piano frontale a 90 gradi',
        why: 'Espone la cuffia dei rotatori a conflitto subacromiale sotto carico.',
        fix: 'Lavora nel piano scapolare portando i gomiti 30 gradi più avanti.',
      },
    ],
    description: 'Distensioni con manubri su panca quasi verticale per deltoidi anteriori e laterali con supporto lombare.',
    tags: ['spalle', 'manubri', 'lento-avanti', 'ipertrofia'],
  },
  {
    id: 'sh_03',
    name: 'Arnold Press con Manubri',
    nameEn: 'Arnold Dumbbell Press',
    primaryMuscle: 'Deltoide Anteriore',
    secondaryMuscles: ['Deltoide Laterale', 'Tricipiti Brachiali', 'Cuffia dei Rotatori'],
    muscles: ['Deltoide Anteriore', 'Spalle', 'Deltoide Laterale', 'Tricipiti Brachiali'],
    type: 'Multiarticolare',
    level: 'Intermedio',
    equipment: 'Manubri',
    variants: ['Seated Dumbbell Press'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Variante ideata da Arnold Schwarzenegger con rotazione continua da presa supina a prona. Stimola tutti e tre i capi del deltoide lungo un arco di movimento ampio.',
      setup: [
        'Siediti con la schiena appoggiata alla panca inclinata a 80 gradi.',
        'Tieni i manubri davanti al petto con i palmi rivolti verso di te (presa supina) e gomiti chiusi.',
      ],
      steps: [
        'Inizia la spinta aprendo i gomiti verso l esterno e ruotando gradualmente i polsi.',
        'A metà traiettoria i palmi guardano a 45 gradi; in cima al movimento i palmi sono orientati in avanti (presa prona).',
        'Raggiungi la distensione quasi completa sopra la testa.',
        'Inverti il movimento ri-ruotando i gomiti verso l interno fino a riportare i manubri davanti al petto.',
      ],
      cues: [
        'Movimento fluido e sincronizzato: la rotazione avviene durante la spinta, non prima né dopo',
        'Non far toccare i manubri in cima',
      ],
      criteria: [
        'Rotazione continua e coordinata senza scatti',
        'Controllo rigoroso del tempo esecutivo',
      ],
    },
    errors: [
      {
        error: 'Rotazione troppo anticipata a inizio spinta',
        why: 'Annulla il beneficio dell arco motorio progressivo.',
        fix: 'Sincronizza l apertura dei gomiti con l elevazione verticale.',
      },
    ],
    description: 'Distensione sopra la testa con rotazione omerale per un reclutamento completo dei capi deltoidei.',
    tags: ['spalle', 'arnold-press', 'manubri', 'rotazione', 'ipertrofia'],
  },
  {
    id: 'sh_04',
    name: 'Alzate Laterali con Manubri',
    nameEn: 'Dumbbell Lateral Raise',
    primaryMuscle: 'Deltoide Laterale',
    secondaryMuscles: ['Deltoide Anteriore', 'Trapezio Superiore', 'Sovraspinato'],
    muscles: ['Deltoide Laterale', 'Spalle', 'Trapezio Superiore'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Manubri',
    variants: ['Alzate Laterali ai Cavi', 'Alzate Laterali da Seduto'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Esercizio monoarticolare cardine per isolare il capo laterale del deltoide, conferendo ampiezza e rotondità tridimensionale alle spalle.',
      setup: [
        'In piedi o seduto con due manubri leggeri ai lati dei fianchi.',
        'Busto leggermente inclinato in avanti di 10-15 gradi per allineare il deltoide laterale contro gravità.',
        'Gomiti con una lieve flessione fissa (10-15 gradi), scapole depresse.',
      ],
      steps: [
        'Solleva i manubri verso l esterno muovendoti nel piano scapolare (circa 20 gradi in avanti rispetto alla linea laterale).',
        'Sali fino a quando i gomiti sono allineati all altezza delle spalle (paralleli al pavimento).',
        'Pausa di mezzo secondo sentendo la contrazione del deltoide laterale.',
        'Ritorna lentamente in 3 secondi senza lasciare che i manubri urtino le cosce.',
      ],
      cues: [
        'Guida il movimento sollevando i gomiti, non le mani',
        'Pensa a spingere i manubri verso le pareti laterali allargandoti, non verso l alto',
        'Spalle basse lontano dalle orecchie per inibire il trapezio',
      ],
      criteria: [
        'Gomito sempre leggermente più alto del polso o sullo stesso piano',
        'Assenza di slancio d anca o oscillazioni del busto',
      ],
    },
    errors: [
      {
        error: 'Uso dello slancio con rimbalzo lombare',
        why: 'Sottrae tensione al deltoide laterale caricando i dischi vertebrali.',
        fix: 'Esegui l esercizio da seduto o riduci il peso del 30%.',
      },
      {
        error: 'Polso più alto del gomito (extrarotazione con mani a brocca dritta)',
        why: 'Sposta il lavoro sul deltoide anteriore riducendo l attivazione del capo laterale.',
        fix: 'Mantieni il mignolo e il gomito leggermente più alti del pollice.',
      },
    ],
    description: 'Abduzione delle braccia con manubri per la larghezza e lo spessore del deltoide laterale.',
    tags: ['spalle', 'deltoide-laterale', 'alzate-laterali', 'manubri', 'isolamento', 'ipertrofia'],
  },
  {
    id: 'sh_05',
    name: 'Alzate Laterali ai Cavi',
    nameEn: 'Cable Lateral Raise',
    primaryMuscle: 'Deltoide Laterale',
    secondaryMuscles: ['Sovraspinato', 'Trapezio'],
    muscles: ['Deltoide Laterale', 'Spalle'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Cavi',
    variants: ['Behind-the-Back Cable Lateral Raise', 'Alzate Laterali Manubri'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Alzate laterali con carrucola bassa che garantisce tensione costante lungo tutto il ROM, compresa la prima parte della traiettoria dove i manubri sono inefficaci.',
      setup: [
        'Posiziona la carrucola alla quota più bassa della colonna cavi.',
        'Afferra la maniglia con la mano opposta facendola passare davanti o dietro al corpo.',
        'Inclinati leggermente verso l esterno afferrando la colonna con la mano libera per stabilità.',
      ],
      steps: [
        'Solleva il braccio lateralmente fino all altezza della spalla seguendo il piano scapolare.',
        'Trattieni la contrazione al culmine.',
        'Controlla la discesa eccentrica sentendo la trazione continua del cavo.',
      ],
      cues: [
        'Tensione fin dal primo centimetro di movimento',
        'Gomito conduce la salita',
      ],
      criteria: [
        'Velocità costante e controllo di discesa',
      ],
    },
    errors: [
      {
        error: 'Scatto iniziale per staccare il peso',
        why: 'Innesca il sovraspinato con potenziale sovraccarico tendineo.',
        fix: 'Avvia l abduzione con progressione graduale e fluida.',
      },
    ],
    description: 'Abduzione omerale al cavo basso per tensione meccanica continua sul deltoide laterale.',
    tags: ['spalle', 'cavi', 'alzate-laterali', 'tensione-continua', 'ipertrofia'],
  },
  {
    id: 'sh_06',
    name: 'Face Pull al Cavo con Corda',
    nameEn: 'Cable Face Pull',
    primaryMuscle: 'Deltoide Posteriore',
    secondaryMuscles: ['Extrarotatori (Sottospinato, Piccolo Rotondo)', 'Romboidi', 'Trapezio Medio'],
    muscles: ['Deltoide Posteriore', 'Spalle', 'Extrarotatori', 'Trapezio Medio'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Cavi',
    variants: ['Face Pull con Elastico', 'Rear Delt Fly'],
    quality: 'Stabilità',
    execution: {
      context: 'Esercizio fondamentale di salute articolare per la spalla. Combina tirata orizzontale ed extrarotazione omerale bilanciando il sovraccarico delle spinte anteriori.',
      setup: [
        'Fissa una corda doppia alla carrucola alta (all altezza della fronte o degli occhi).',
        'Impugna le estremità con i pollici rivolti verso di te (presa neutra/prona con nocche all esterno).',
        'Fai due passi indietro impostando una solida split stance, busto leggermente reclinato.',
      ],
      steps: [
        'Tira la corda verso il viso aprendo i gomiti all altezza delle spalle.',
        'Mentre la corda si avvicina agli occhi, extraruota le spalle aprendo le mani verso le orecchie in assetto a doppio bicipite.',
        'Stringi le scapole e gli extrarotatori per 1-2 secondi al culmine concentrico.',
        'Ritorna lentamente alla posizione di partenza allungando le braccia.',
      ],
      cues: [
        'Pensa a tirare la corda separando le due estremità ai lati delle orecchie',
        'Gomiti alti e indietro',
        'Senti lavorare la parte posteriore delle spalle e le scapole',
      ],
      criteria: [
        'Extrarotazione nitida in chiusura (nocche allineate alle orecchie)',
        'Tronco immobile senza dondolio all indietro',
      ],
    },
    errors: [
      {
        error: 'Tirare verso il mento con gomiti bassi senza extrarotazione',
        why: 'Trasforma l esercizio in una tirata al mento che favorisce l intrarotazione e l impingement.',
        fix: 'Tira verso la fronte mantenendo le mani più alte dei gomiti al termine della corsa.',
      },
    ],
    description: 'Trazione al cavo verso il volto con extrarotazione per deltoidi posteriori e stabilità della cuffia.',
    tags: ['spalle', 'cavi', 'face-pull', 'salute-spalla', 'postura', 'stabilità'],
  },
  {
    id: 'sh_07',
    name: 'Tirate al Mento con Bilanciere o Cavo',
    nameEn: 'Upright Row',
    primaryMuscle: 'Deltoide Laterale',
    secondaryMuscles: ['Trapezio Superiore', 'Bicipiti'],
    muscles: ['Deltoide Laterale', 'Spalle', 'Trapezio Superiore'],
    type: 'Multiarticolare',
    level: 'Intermedio',
    equipment: 'Bilanciere',
    variants: ['Dumbbell Upright Row', 'Cable Upright Row'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Trazione verticale lungo il corpo per stimolare deltoidi laterali e trapezi superiori con presa allargata.',
      setup: [
        'Stazione eretta con bilanciere sagomato o dritto tenuto a braccia tese davanti alle cosce.',
        'Presa a larghezza spalle o leggermente superiore (la presa stretta è controindicata per la spalla).',
        'Petto aperto e scapole attive.',
      ],
      steps: [
        'Tira il bilanciere verso l alto facendolo scivolare vicino al corpo.',
        'Guida il movimento con i gomiti portandoli verso l esterno e l alto.',
        'Fermati quando il bilanciere raggiunge lo sterno medio (non superare la linea delle clavicole).',
        'Riscendi lentamente controllando la fase eccentrica.',
      ],
      cues: [
        'Gomiti sempre più alti del bilanciere',
        'Barra vicina al corpo',
        'Presa ampia a larghezza spalle per salvaguardare i tendini',
      ],
      criteria: [
        'Altezza massima allo sterno medio',
        'Assenza di compensi lombari',
      ],
    },
    errors: [
      {
        error: 'Presa strettissima con mani a contatto e gomiti altissimi oltre le orecchie',
        why: 'Forza la spalla in massima intrarotazione con flessione elevata provocando impingement doloroso.',
        fix: 'Allarga la presa almeno alla larghezza delle spalle e fermati allo sterno.',
      },
    ],
    description: 'Tirata verticale con bilanciere a presa larga per deltoidi laterali e trapezi.',
    tags: ['spalle', 'tirate-al-mento', 'bilanciere', 'deltoide-laterale', 'ipertrofia'],
  },
  {
    id: 'sh_08',
    name: 'Alzate Posteriori con Manubri a 90 Gradi',
    nameEn: 'Bent-Over Dumbbell Rear Delt Fly',
    primaryMuscle: 'Deltoide Posteriore',
    secondaryMuscles: ['Romboidi', 'Trapezio Medio'],
    muscles: ['Deltoide Posteriore', 'Spalle', 'Romboidi'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Manubri',
    variants: ['Incline Bench Rear Delt Fly', 'Rear Delt Cable Cross'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Abduzione orizzontale a busto flesso a 90 gradi per isolare il capo posteriore del deltoide.',
      setup: [
        'In piedi a busto flesso orizzontale parallelo al suolo (o prono su panca inclinata a 30 gradi).',
        'Manubri sotto le spalle con gomiti leggermente flessi.',
        'Colonna neutra, sguardo verso il suolo.',
      ],
      steps: [
        'Solleva i manubri lateralmente aprendo le braccia fino all altezza delle spalle.',
        'Concentrati sullo spingere i gomiti verso l esterno e il soffitto.',
        'Spremi la parte posteriore della spalla al vertice.',
        'Riscendi controllando la gravità senza oscillare.',
      ],
      cues: [
        'Pensa di allungare le braccia verso i lati della stanza',
        'Gomiti orientati al soffitto',
      ],
      criteria: [
        'Tronco perfettamente fermo per tutta la serie',
      ],
    },
    errors: [
      {
        error: 'Adduzione eccessiva delle scapole trasformando il gesto in un rematore',
        why: 'Sposta il carico sui romboidi togliendolo al deltoide posteriore.',
        fix: 'Mantieni le scapole protette e muovi solo l articolazione della spalla.',
      },
    ],
    description: 'Aperture a busto flesso con manubri per isolare il deltoide posteriore.',
    tags: ['spalle', 'deltoide-posteriore', 'manubri', 'isolamento', 'ipertrofia'],
  },
  {
    id: 'sh_09',
    name: 'Push Press con Bilanciere',
    nameEn: 'Barbell Push Press',
    primaryMuscle: 'Deltoide Anteriore',
    secondaryMuscles: ['Tricipiti Brachiali', 'Quadricipiti', 'Glutei', 'Core'],
    muscles: ['Deltoide Anteriore', 'Spalle', 'Tricipiti Brachiali', 'Quadricipiti', 'Gambe'],
    type: 'Multiarticolare',
    level: 'Intermedio',
    equipment: 'Bilanciere',
    variants: ['Push Press con Manubri', 'Military Press'],
    quality: 'Potenza',
    execution: {
      context: 'Spinta balistica sopra la testa derivata dal sollevamento pesi olimpico. Sfrutta un caricamento degli arti inferiori (dip-drive) per accelerare carichi elevati.',
      setup: [
        'Bilanciere in appoggio front rack clavicolare, piedi ad ampiezza bacino.',
        'Core solido, gomiti proiettati in avanti.',
      ],
      steps: [
        'Esegui un rapido dip flettendo le ginocchia di 8-10 cm mantenendo il busto rigorosamente verticale.',
        'Estendi violentemente le gambe (drive) trasmettendo l energia cinetica dal suolo al bilanciere.',
        'Continua la traiettoria con le braccia fino a serrare il bilanciere sopra la testa.',
        'Stabilizza il carico per un secondo, quindi riabbassa con controllo al petto ammortizzando con le ginocchia.',
      ],
      cues: [
        'Dip verticale: non chinarti in avanti',
        'Spinta esplosiva dalle gambe',
        'Incastro rapido a braccia tese',
      ],
      criteria: [
        'Lockout saldo al vertice',
        'Sincronia fluida tra spinta di gambe e braccia',
      ],
    },
    errors: [
      {
        error: 'Inclinazione anteriore del tronco durante il dip',
        why: 'Sposta il bilanciere in avanti facendolo uscire dalla traiettoria verticale.',
        fix: 'Scendi con la schiena perpendicolare come se scivolassi lungo una parete.',
      },
    ],
    description: 'Distensione sopra la testa esplosiva con ausilio della spinta delle gambe per potenza e forza dinamica.',
    tags: ['spalle', 'push-press', 'potenza', 'bilanciere', 'esplosivo'],
  },
  {
    id: 'sh_10',
    name: 'Alzate Frontali con Manubri',
    nameEn: 'Front Dumbbell Raise',
    primaryMuscle: 'Deltoide Anteriore',
    secondaryMuscles: ['Pettorale Clavicolare', 'Trapezio'],
    muscles: ['Deltoide Anteriore', 'Spalle'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Manubri',
    variants: ['Front Cable Raise', 'Plate Front Raise'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Flessione anteriore dell omero per isolare il capo clavicolare/anteriore del deltoide.',
      setup: [
        'In piedi con due manubri appoggiati davanti alle cosce.',
        'Gomiti con microflessione fissa, schiena dritta e addome attivo.',
      ],
      steps: [
        'Solleva un manubrio (o entrambi) in avanti fino all altezza degli occhi.',
        'Pausa di mezzo secondo in contrazione.',
        'Ritorna lentamente alla posizione iniziale.',
      ],
      cues: [
        'Non dondolare con il bacino',
        'Altezza occhi come target',
      ],
      criteria: [
        'Controllo eccentrico continuo senza caduta passiva',
      ],
    },
    errors: [
      {
        error: 'Iperestensione del tronco all indietro per lanciare il manubrio',
        why: 'Sovraccarica il tratto lombare togliendo tensione al deltoide.',
        fix: 'Riduci il peso ed esegui la variante da seduto.',
      },
    ],
    description: 'Sollevamento frontale alternato con manubri per isolamento del deltoide anteriore.',
    tags: ['spalle', 'deltoide-anteriore', 'manubri', 'isolamento', 'ipertrofia'],
  },
  {
    id: 'sh_11',
    name: 'Reverse Pec Deck alla Macchina',
    nameEn: 'Reverse Machine Flyes',
    primaryMuscle: 'Deltoide Posteriore',
    secondaryMuscles: ['Romboidi', 'Trapezio'],
    muscles: ['Deltoide Posteriore', 'Spalle', 'Romboidi'],
    type: 'Isolamento',
    level: 'Principiante',
    equipment: 'Macchine',
    variants: ['Bent-Over Dumbbell Fly', 'Cable Face Pull'],
    quality: 'Ipertrofia',
    execution: {
      context: 'Abduzione orizzontale guidata su macchinario con supporto sternale. Ideale per isolare il deltoide posteriore senza fatica posturale.',
      setup: [
        'Siediti frontalmente verso lo schienale con il torace a contatto con il cuscinetto.',
        'Regola l altezza del sellino affinché le impugnature siano ad altezza spalle.',
        'Impugna le maniglie con presa neutra o prona.',
      ],
      steps: [
        'Spingi le maniglie indietro e all esterno con i gomiti leggermente flessi.',
        'Spremi i deltoidi posteriori fino a raggiungere la linea delle spalle.',
        'Ritorna lentamente accompagnando il carico.',
      ],
      cues: [
        'Petto sempre premuto contro il supporto',
        'Muovi solo le braccia indietro',
      ],
      criteria: [
        'Isolamento puro senza staccare il busto',
      ],
    },
    errors: [
      {
        error: 'Stacco del petto dal cuscinetto in apertura',
        why: 'Compensa con i muscoli paravertebrali.',
        fix: 'Mantieni il contatto del torace costante.',
      },
    ],
    description: 'Aperture posteriori guidate su macchinario per l isolamento del deltoide posteriore.',
    tags: ['spalle', 'macchine', 'deltoide-posteriore', 'isolamento', 'ipertrofia'],
  },
  {
    id: 'sh_12',
    name: 'Handstand Push-Up a Muro (Piegamenti in Verticale)',
    nameEn: 'Wall Handstand Push-Up (HSPU)',
    primaryMuscle: 'Deltoide Anteriore',
    secondaryMuscles: ['Deltoide Laterale', 'Tricipiti Brachiali', 'Trapezio', 'Core'],
    muscles: ['Deltoide Anteriore', 'Spalle', 'Tricipiti Brachiali', 'Core'],
    type: 'Multiarticolare',
    level: 'Avanzato',
    equipment: 'Corpo Libero',
    variants: ['Pike Push-Up', 'Deficit HSPU'],
    quality: 'Forza',
    execution: {
      context: 'Spinta verticale capovolta a corpo libero contro il muro. Espressione massima di forza relativa per spalle e tricipiti nel calisthenics.',
      setup: [
        'Lanciati in verticale contro una parete solida a braccia tese.',
        'Mani a terra ad una distanza di circa 20-30 cm dal muro, dita ben aperte.',
        'Corpo compatto in linea retta con addome e glutei serrati.',
      ],
      steps: [
        'Scendi flettendo i gomiti in avanti a circa 45 gradi fino a toccare il pavimento con la testa formando un treppiede.',
        'Spingi con tutta la forza delle spalle estendendo i gomiti per risalire in verticale.',
        'Ritorna alla completa estensione a braccia bloccate contro il muro.',
      ],
      cues: [
        'Testa avanti alle mani creando un triangolo di appoggio',
        'Gomiti vicini al corpo, non svasati a 90 gradi',
      ],
      criteria: [
        'Contatto delicato della testa al suolo ad ogni rep',
        'Assenza di iperlordosi a banana con schiena piatta',
      ],
    },
    errors: [
      {
        error: 'Svasamento dei gomiti larghi verso la parete',
        why: 'Stressa pericolosamente le articolazioni delle spalle e dei gomiti.',
        fix: 'Indirizza i gomiti in avanti verso lo spazio davanti al viso.',
      },
    ],
    description: 'Piegamenti sulle braccia in verticale contro il muro per forza avanzata a corpo libero.',
    tags: ['spalle', 'calisthenics', 'corpo-libero', 'hspu', 'forza', 'avanzato'],
  },
];
