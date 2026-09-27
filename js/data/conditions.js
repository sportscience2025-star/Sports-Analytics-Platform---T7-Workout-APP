/**
 * Clinical Conditions Database Module
 * Database delle condizioni cliniche, adattamenti ed esclusioni per la programmazione clinica
 */
(function () {
    'use strict';

    window.App = window.App || {};

    // Funzione getter posizionata in testa al file (prima della struttura dati)
    window.App.getConditions = function () {
        return window.App.clinicalConditions;
    };

    // Struttura Dati Condizioni Cliniche (Unificate e Raggruppate per Categoria)
    window.App.clinicalConditions = [
        // ==========================================
        // --- A) COLONNA VERTEBRALE (colonna) ---
        // ==========================================
        {
          "id": "cervical_pain",
          "name": "Cervicalgia",
          "nameEn": "Cervical Pain",
          "category": "colonna",
          "description": "Dolore, rigidità o tensione muscolare localizzata nel tratto cervicale.",
          "icon": "neck",
          "riskLevel": "low",
          "exclusions": [
                    "Overhead Press",
                    "Military Press",
                    "Pull-up",
                    "Behind Neck",
                    "Heavy Carry"
          ],
          "adaptations": [
                    {
                              "pattern": "Military Press",
                              "modification": "Dumbbell Press seduto con schienale, ROM controllato, carico -20%"
                    },
                    {
                              "pattern": "Lat Machine",
                              "modification": "Presa neutra o inversa avanti al petto, arresto al mento"
                    }
          ]
},
        {
          "id": "spondylosis_cervical",
          "name": "Spondilosi Cervicale",
          "nameEn": "Cervical Spondylosis",
          "category": "colonna",
          "description": "Degenerazione cronica delle vertebre e dei dischi cervicali con riduzione del canale.",
          "icon": "neck",
          "riskLevel": "medium",
          "exclusions": [
                    "Barbell Curl",
                    "Overhead Press",
                    "Estensione Collo",
                    "Panca Piana Heavy"
          ],
          "adaptations": [
                    {
                              "pattern": "Military Press",
                              "modification": "Spinte con manubri con ROM ridotto al parallelo, -30% carico"
                    },
                    {
                              "pattern": "Lat Machine",
                              "modification": "Presa supina o neutra avanti, fase eccentrica controllata"
                    }
          ]
},
        {
          "id": "thoracic_outlet",
          "name": "Sindrome dello Stretto Toracico",
          "nameEn": "Thoracic Outlet Syndrome",
          "category": "colonna",
          "description": "Compressione neurovascolare nel passaggio tra collo e torace.",
          "icon": "neck",
          "riskLevel": "medium",
          "exclusions": [
                    "Overhead",
                    "Upright Row",
                    "Forward Head",
                    "Heavy Farmer Carry"
          ],
          "adaptations": [
                    {
                              "pattern": "Military Press",
                              "modification": "Dumbbell Press Arnold con rotazione neutra, ROM max 90-100°"
                    },
                    {
                              "pattern": "Lateral Raise",
                              "modification": "Alzate laterali ai cavi con ROM entro i 90°, carico moderato"
                    },
                    {
                              "pattern": "Face Pull",
                              "modification": "Presa neutra su corda, scapole addotte attivamente"
                    }
          ]
},
        {
          "id": "dorsal_pain",
          "name": "Dorsalgia",
          "nameEn": "Thoracic Back Pain",
          "category": "colonna",
          "description": "Dolore localizzato nel tratto toracico (dorso superiore) spesso posturale.",
          "icon": "spine",
          "riskLevel": "low",
          "exclusions": [
                    "Push Press",
                    "Overhead Throw",
                    "Face Pull Heavy"
          ],
          "adaptations": [
                    {
                              "pattern": "Shoulder Press",
                              "modification": "Spinte alle macchine guidate, schienale inclinato 75°"
                    },
                    {
                              "pattern": "Row",
                              "modification": "Chest Supported Row, focus su estensione toracica controllata"
                    }
          ]
},
        {
          "id": "lumbar_pain",
          "name": "Lombalgia Cronica",
          "nameEn": "Chronic Low Back Pain",
          "category": "colonna",
          "description": "Dolore lombare persistente con rigidità mattutina o da postura prolungata.",
          "icon": "spine",
          "riskLevel": "medium",
          "exclusions": [
                    "Deadlift",
                    "Barbell Row",
                    "Sit-up",
                    "Decline Sit-up",
                    "Back Squat Heavy"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Press",
                              "modification": "ROM 90° max con piedi alti sulla pedana per evitare retroversione"
                    },
                    {
                              "pattern": "Row",
                              "modification": "Dumbbell Row in appoggio su panca o Chest Supported Row"
                    },
                    {
                              "pattern": "Romanian Deadlift",
                              "modification": "Stacco rumeno con manubri, ROM limitato a metà tibia"
                    }
          ]
},
        {
          "id": "hernia_disk",
          "name": "Ernia Discale Lombale",
          "nameEn": "Lumbar Disc Herniation",
          "category": "colonna",
          "description": "Fuoriuscita o protrusione del nucleo polposo discale (tipico L4-L5/L5-S1) con compressione radicolare.",
          "icon": "disc",
          "riskLevel": "high",
          "exclusions": [
                    "Squat",
                    "Deadlift",
                    "Clean",
                    "Snatch",
                    "Crunch",
                    "Leg Press Deep"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Press",
                              "modification": "Piedi alti e stance larga, inclinazione pedana ridotta, ROM max 70°"
                    },
                    {
                              "pattern": "Hip Thrust",
                              "modification": "Carico moderato su glutei, bloccando la schiena in neutro"
                    },
                    {
                              "pattern": "Cable Crunch",
                              "modification": "Sostituire con Plank o pallof press per stabilità in neutro"
                    }
          ]
},
        {
          "id": "spinal_stenosis",
          "name": "Stenosi Spinale Lombale",
          "nameEn": "Lumbar Spinal Stenosis",
          "category": "colonna",
          "description": "Restringimento del canale vertebrale con claudicatio neurogena durante l'estensione.",
          "icon": "spine",
          "riskLevel": "high",
          "exclusions": [
                    "Back Extension",
                    "Deadlift",
                    "Squat Profondo",
                    "Arch Back",
                    "Overhead Press Standing"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Press",
                              "modification": "Postura leggermente flessa (schiacciando il bacino), ROM 80°"
                    },
                    {
                              "pattern": "Back Extension",
                              "modification": "Limitare il movimento a 30-40° senza mai superare la linea neutra"
                    },
                    {
                              "pattern": "Romanian Deadlift",
                              "modification": "ROM ridotto a 40-50° ginocchio sbloccato"
                    }
          ]
},
        {
          "id": "sensitive_back",
          "name": "Schiena Sensibile",
          "nameEn": "Sensitive Back",
          "category": "colonna",
          "description": "Soggetti con episodi recidivanti di lombalgia non specificata.",
          "icon": "body",
          "riskLevel": "low",
          "exclusions": [
                    "Deadlift Heavy",
                    "Row Heavy",
                    "Squat Profondo",
                    "Good Morning"
          ],
          "adaptations": [
                    {
                              "pattern": "Back Squat",
                              "modification": "Sostituire con Goblet Squat o Front Squat (ROM 90°, -20% carico)"
                    },
                    {
                              "pattern": "Deadlift",
                              "modification": "RDL controllato con manubri o Hex Bar Deadlift"
                    },
                    {
                              "pattern": "Row",
                              "modification": "Chest Supported Row o rematore con manubri su panca inclinata"
                    }
          ]
},
        {
          "id": "spondylolysis",
          "name": "Spondilolisi",
          "nameEn": "Spondylolysis",
          "category": "colonna",
          "description": "Difetto o frattura della pars interarticularis (tipicamente L5) con potenziale instabilità.",
          "icon": "spine",
          "riskLevel": "high",
          "exclusions": [
                    "Deadlift",
                    "Squat Profondo",
                    "Iperestensione",
                    "Barbell Row",
                    "Kettlebell Swing"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Press",
                              "modification": "ROM limitato a 80°, spalliera ben reclinata"
                    },
                    {
                              "pattern": "Row",
                              "modification": "Rematore Chest Supported con petto adeso"
                    },
                    {
                              "pattern": "Back Extension",
                              "modification": "Sostituire con Plank isometrico neutro"
                    }
          ]
},
        {
          "id": "posture_chronic",
          "name": "Problemi Posturali",
          "nameEn": "Postural Issues",
          "category": "colonna",
          "description": "Rounded shoulders, anterior pelvic tilt o ipercifosi toracica disfunzionale.",
          "icon": "body",
          "riskLevel": "low",
          "exclusions": [
                    "Panca Pesante",
                    "Lat Pulldown Dietro",
                    "Military Press Standing"
          ],
          "adaptations": [
                    {
                              "pattern": "Bench Press",
                              "modification": "ROM leggermente ridotto, scapole sempre addotte al massimo"
                    },
                    {
                              "pattern": "Military Press",
                              "modification": "Arnold press seduto o dumbbell press presa neutra"
                    },
                    {
                              "pattern": "Lat Pulldown",
                              "modification": "Sbarra tirata al petto alto mantenendo l'estensione dorsale"
                    }
          ]
},
        {
          "id": "scoliosi_idiopatica",
          "name": "Scoliosi Idiopatica",
          "nameEn": "Idiopathic Scoliosis",
          "category": "colonna",
          "description": "Deviazione laterale e rotatoria tridimensionale della colonna superiore a 10 gradi cobb.",
          "icon": "spine",
          "riskLevel": "low",
          "exclusions": [
                    "Heavy Back Squat",
                    "Overhead Press Standing Heavy",
                    "Rematore Unilaterale sbilanciato"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Privilegiare Goblet Squat o Leg Press bilaterale per bilanciare il carico assiale"
                    },
                    {
                              "pattern": "Row",
                              "modification": "Rematore bilaterale supportato da panca o cavi per evitare torsioni asimmetriche"
                    },
                    {
                              "pattern": "General",
                              "modification": "Focus su allineamento e stabilità del core con Plank e Bird-dog"
                    }
          ]
},
        {
          "id": "spondilite_anchilosante",
          "name": "Spondilite Anchilosante",
          "nameEn": "Ankylosing Spondylitis",
          "category": "colonna",
          "description": "Artrite infiammatoria cronica che colpisce la colonna e le articolazioni sacroiliache, portando a rigidità.",
          "icon": "spine",
          "riskLevel": "medium",
          "exclusions": [
                    "Esercizi balistici",
                    "Jump Squat",
                    "Plyometrics",
                    "Carico assiale estremo"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Focus su esercizi di mobilità, estensione toracica e respirazione diaframmatica"
                    },
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat controllato con ROM ridotto al parallelo"
                    },
                    {
                              "pattern": "Lat Pulldown",
                              "modification": "ROM completo controllato per allungamento fasciale"
                    }
          ]
},
        {
          "id": "faccette_articolari",
          "name": "Sindrome Faccette Articolari",
          "nameEn": "Facet Joint Syndrome",
          "category": "colonna",
          "description": "Infiammazione o artrosi delle articolazioni intervertebrali posteriori, aggravata dall'estensione.",
          "icon": "spine",
          "riskLevel": "medium",
          "exclusions": [
                    "Back Extension",
                    "Good Morning",
                    "Deadlift Heavy",
                    "Military Press Standing"
          ],
          "adaptations": [
                    {
                              "pattern": "Back Extension",
                              "modification": "Sostituire con Plank o esercizi di stabilità lombare in flessione"
                    },
                    {
                              "pattern": "Squat",
                              "modification": "Goblet Squat (ROM 90°) per mantenere un busto eretto ed evitare iperestensioni"
                    }
          ]
},
        {
          "id": "mielopatia_cervicale",
          "name": "Mielopatia Cervicale",
          "nameEn": "Cervical Myelopathy",
          "category": "colonna",
          "description": "Sindrome clinica da compressione del midollo spinale cervicale con deficit neurologici potenziali.",
          "icon": "neck",
          "riskLevel": "high",
          "exclusions": [
                    "Overhead Press",
                    "Pull-up",
                    "Behind Neck",
                    "Plank",
                    "Push-up",
                    "Jump Squat",
                    "Plyometrics",
                    "Valsalva"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Solo esercizi seduti con supporto, nessun carico assiale, contrazioni controllate"
                    },
                    {
                              "pattern": "Lat Machine",
                              "modification": "Presa neutra stretta davanti, ROM parziale, -40% carico"
                    }
          ]
},
        {
          "id": "frattura_compressione",
          "name": "Frattura da Compressione",
          "nameEn": "Vertebral Compression Fracture",
          "category": "colonna",
          "description": "Cedimento vertebrale da osteoporosi o trauma. Richiede rigorosa prevenzione della flessione anteriore.",
          "icon": "spine",
          "riskLevel": "high",
          "exclusions": [
                    "Crunch",
                    "Sit-up",
                    "Romanian Deadlift",
                    "Barbell Row",
                    "Leg Press",
                    "Back Squat",
                    "Kettlebell Swing"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Esercizi di estensione isometrica, stabilità del core in piedi, no flessione"
                    },
                    {
                              "pattern": "Squat",
                              "modification": "Wall Slide (squat a muro) isometrico o controllato senza peso"
                    }
          ]
},
        {
          "id": "thoracolumbar_junction",
          "name": "Sindrome della Giunzione Toraco-Lombare",
          "nameEn": "Thoracolumbar Junction Syndrome",
          "category": "colonna",
          "description": "Disfunzione della cerniera T12-L1 con dolore riferito a inguine, anca o addome basso, frequente in sportivi.",
          "icon": "spine",
          "riskLevel": "low",
          "exclusions": [
                    "Rotazioni con carico",
                    "Good Morning pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Mobilizzazione toracica, rinforzo core anti-rotazione, evitare iperlordosi sotto carico"
                    }
          ]
},

        // ==========================================
        // --- B) ARTI INFERIORI - ANCA, GINOCCHIO, CAVIGLIA (arti_inferiori) ---
        // ==========================================
        {
          "id": "hip_problem",
          "name": "Anca Problematica",
          "nameEn": "Hip Pain",
          "category": "arti_inferiori",
          "description": "Dolore, rigidità o limitazione del movimento coxofemorale generica.",
          "icon": "hip",
          "riskLevel": "low",
          "exclusions": [
                    "Squat Profondo",
                    "Split Squat Deep",
                    "Leg Curl Deep"
          ],
          "adaptations": [
                    {
                              "pattern": "Back Squat",
                              "modification": "ROM limitato a 80-90°, stance leggermente allargata"
                    },
                    {
                              "pattern": "Hip Thrust",
                              "modification": "ROM controllato nei gradi intermedi (non forzare lockout)"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Piedi alti e larghi, ROM controllato, carico moderato"
                    }
          ]
},
        {
          "id": "coxarthrosis",
          "name": "Artrosi dell'Anca / Coxartrosi",
          "nameEn": "Hip Osteoarthritis",
          "category": "arti_inferiori",
          "description": "Degenerazione progressiva della cartilagine dell'articolazione dell'anca.",
          "icon": "hip",
          "riskLevel": "medium",
          "exclusions": [
                    "Squat Ass to Grass",
                    "Box Jump",
                    "Plyometrics",
                    "Lunge Deep"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Press",
                              "modification": "ROM 90° max, stance comoda, -30% carico per evitare pinch"
                    },
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat su box alta, enfasi su catena posteriore"
                    }
          ]
},
        {
          "id": "fai",
          "name": "Conflitto Femoro-Acetabolare",
          "nameEn": "Femoroacetabular Impingement (FAI)",
          "category": "arti_inferiori",
          "description": "Anomalia morfologica dell'anca che provoca attrito tra testa femorale e acetabolo in flessione interna.",
          "icon": "hip",
          "riskLevel": "medium",
          "exclusions": [
                    "Deep Squat",
                    "Leg Press Deep",
                    "Affondi in avanti",
                    "High Step Up"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Stance più larga, punte dei piedi ruotate in fuori (30°), ROM 90°"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Piedi larghi, non superare i 90° di flessione dell'anca"
                    }
          ]
},
        {
          "id": "hamstring_strain",
          "name": "Ischio-Crurali Tesi",
          "nameEn": "Tight Hamstrings",
          "category": "arti_inferiori",
          "description": "Accorciamento o sovraccarico cronico dei muscoli posteriori della coscia.",
          "icon": "muscle",
          "riskLevel": "low",
          "exclusions": [
                    "Deficit Deadlift",
                    "Romanian Deadlift Full",
                    "Leg Curl Heavy"
          ],
          "adaptations": [
                    {
                              "pattern": "Deadlift",
                              "modification": "RDL parziale o stacco da terra rialzato (block pull), ROM ridotto"
                    },
                    {
                              "pattern": "Leg Curl",
                              "modification": "ROM ridotto a 60° max, carichi medio-leggeri"
                    },
                    {
                              "pattern": "Hip Thrust",
                              "modification": "ROM 90°, focus su contrazione dei glutei, no crampo posteriore"
                    }
          ]
},
        {
          "id": "knee_generic",
          "name": "Ginocchio Problematico",
          "nameEn": "Knee Pain",
          "category": "arti_inferiori",
          "description": "Stati algici non specifici dell'articolazione del ginocchio.",
          "icon": "knee",
          "riskLevel": "low",
          "exclusions": [
                    "Squat Profondo",
                    "Jump Squat",
                    "Pogo Jump",
                    "Leg Extension Heavy"
          ],
          "adaptations": [
                    {
                              "pattern": "Back Squat",
                              "modification": "Box Squat controllato al parallelo o Goblet Squat ROM 90°"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "ROM limitato a 90° mantenendo la spinta sul tallone"
                    },
                    {
                              "pattern": "Leg Extension",
                              "modification": "ROM 60-90° isometrica o carico leggero"
                    }
          ]
},
        {
          "id": "itbs",
          "name": "Sindrome Banda Ileotibiale",
          "nameEn": "Iliotibial Band Syndrome",
          "category": "arti_inferiori",
          "description": "Infiammazione da frizione della bandelletta ileotibiale sul condilo femorale esterno.",
          "icon": "ligament",
          "riskLevel": "low",
          "exclusions": [
                    "Running",
                    "Lateral Leg Raise",
                    "Split Squat Deep",
                    "High Volume Biking"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Press",
                              "modification": "Piedi saldi, no intrarotazione ginocchio, ROM 90° controllato"
                    },
                    {
                              "pattern": "Hip Thrust",
                              "modification": "Uso di elastico moderato sopra le ginocchia per stabilità"
                    },
                    {
                              "pattern": "Squat",
                              "modification": "ROM ridotto al parallelo, enfasi eccentrica 4 secondi"
                    }
          ]
},
        {
          "id": "gonarthrosis",
          "name": "Artrosi Ginocchio / Gonartrosi",
          "nameEn": "Knee Osteoarthritis",
          "category": "arti_inferiori",
          "description": "Patologia degenerativa della cartilagine del ginocchio con rigidità e dolore da carico.",
          "icon": "knee",
          "riskLevel": "medium",
          "exclusions": [
                    "Jump",
                    "Depth Jump",
                    "Squat Profondo",
                    "Leg Extension Heavy"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Press",
                              "modification": "ROM 90° max, piedi comodi, carico ridotto del 30%"
                    },
                    {
                              "pattern": "Leg Extension",
                              "modification": "Esegui ROM parziale 60-90° a basso carico per pompaggio"
                    },
                    {
                              "pattern": "Hip Thrust",
                              "modification": "ROM controllato bilaterale, ottimo per scaricare il ginocchio"
                    }
          ]
},
        {
          "id": "meniscus",
          "name": "Lesione Meniscale",
          "nameEn": "Meniscus Tear",
          "category": "arti_inferiori",
          "description": "Lacerazione o trauma a carico dei menischi (interno/esterno) con potenziale blocco articolare.",
          "icon": "knee",
          "riskLevel": "medium",
          "exclusions": [
                    "Twist",
                    "Rotazione ginocchio",
                    "Split Squat",
                    "Affondi esplosivi"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Press",
                              "modification": "Piedi paralleli e fissi, ROM max 80°, controllo eccentrico"
                    },
                    {
                              "pattern": "Romanian Deadlift",
                              "modification": "Perfetto per allungamento catena posteriore senza piegare le ginocchia"
                    },
                    {
                              "pattern": "Leg Curl",
                              "modification": "ROM max 60°, carichi bassi"
                    }
          ]
},
        {
          "id": "patellar_tendonitis",
          "name": "Tendinopatia Rotulea",
          "nameEn": "Patellar Tendonitis",
          "category": "arti_inferiori",
          "description": "Infiammazione o tendinosi del tendine rotuleo, comune nei saltatori (Jumper's Knee).",
          "icon": "knee",
          "riskLevel": "low",
          "exclusions": [
                    "Jump Squat",
                    "Leg Extension Heavy",
                    "Plyometrics",
                    "Sprinting"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat lento con salita e discesa controllata, no rimbalzo in basso"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Enfasi sulla fase eccentrica (4s discesa), spinta dal tallone"
                    }
          ]
},
        {
          "id": "weak_ankle",
          "name": "Caviglia Debole/Instabile",
          "nameEn": "Weak Ankle",
          "category": "arti_inferiori",
          "description": "Instabilità cronica e deficit propriocettivo dopo distorsioni ricorrenti.",
          "icon": "foot",
          "riskLevel": "low",
          "exclusions": [
                    "Jump Rope",
                    "Single Leg Jump",
                    "Plyometrics High"
          ],
          "adaptations": [
                    {
                              "pattern": "Back Squat",
                              "modification": "Bilanciere posteriore ma con focus su allineamento ginocchio-caviglia"
                    },
                    {
                              "pattern": "Jump Squat",
                              "modification": "Sostituire con saltelli controllati a terra, scarpe ben supportive"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Posizione stabile del piede, no flessione laterale"
                    }
          ]
},
        {
          "id": "plantar_fasciitis",
          "name": "Fasciite Plantare",
          "nameEn": "Plantar Fasciitis",
          "category": "arti_inferiori",
          "description": "Infiammazione dolorosa dell'aponeurosi plantare che unisce il tallone alle dita.",
          "icon": "foot",
          "riskLevel": "low",
          "exclusions": [
                    "Jump Rope",
                    "Pogo Jump",
                    "Running",
                    "Barefoot Lifting"
          ],
          "adaptations": [
                    {
                              "pattern": "Jump Squat",
                              "modification": "Sostituire con Squat isometrico a muro o saltelli leggeri ammortizzati"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Spinta dal mesopiede, evitare di puntare solo le dita"
                    },
                    {
                              "pattern": "Romanian Deadlift",
                              "modification": "Piedi appoggiati su superficie piana rigida con scarpe ortopediche"
                    }
          ]
},
        {
          "id": "achilles_tendonitis",
          "name": "Tendinopatia Achillea",
          "nameEn": "Achilles Tendonitis",
          "category": "arti_inferiori",
          "description": "Dolore e infiammazione del tendine d'Achille associato a sovraccarico ciclico.",
          "icon": "foot",
          "riskLevel": "low",
          "exclusions": [
                    "Calf Raise Explosive",
                    "Sprinting",
                    "Plyometrics"
          ],
          "adaptations": [
                    {
                              "pattern": "Calf Raise",
                              "modification": "Calf Raise controllati, salita 2s, tenuta 2s, discesa 3s, no esplosività"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Evitare allungamento estremo della caviglia a fine corsa"
                    }
          ]
},
        {
          "id": "lesione_lca",
          "name": "Lesione LCA non operata",
          "nameEn": "ACL Tear (Conservative)",
          "category": "arti_inferiori",
          "description": "Instabilità articolare da rottura completa o parziale del Legamento Crociato Anteriore gestita senza chirurgia.",
          "icon": "knee",
          "riskLevel": "medium",
          "exclusions": [
                    "Rotazioni repentine",
                    "Pistol Squat",
                    "Lunges con affondo lungo",
                    "Pogo Jump",
                    "Plyometrics"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat controllato con ROM a 90° e tibia il più possibile verticale"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "ROM parziale 80° con spinta tallone costante, no lockout"
                    }
          ]
},
        {
          "id": "lesione_lcp",
          "name": "Lesione LCP",
          "nameEn": "PCL Tear",
          "category": "arti_inferiori",
          "description": "Lesione del Legamento Crociato Posteriore che limita la stabilità alla traslazione posteriore della tibia.",
          "icon": "knee",
          "riskLevel": "medium",
          "exclusions": [
                    "Leg Curl Heavy",
                    "Flessione profonda ginocchio >100°",
                    "Split Squat Deep"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Curl",
                              "modification": "Sostituire con stacco rumeno (lavoro eccentrico femorali a ginocchio semiteso)"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "ROM limitato a 75° posizionando i piedi alti sulla pedana"
                    }
          ]
},
        {
          "id": "condromalacia_rotulea",
          "name": "Condromalacia Rotulea",
          "nameEn": "Chondromalacia Patellae",
          "category": "arti_inferiori",
          "description": "Rammollimento e usura della cartilagine rotulea, aggravata dal carico in flessione profonda.",
          "icon": "knee",
          "riskLevel": "low",
          "exclusions": [
                    "Squat Profondo",
                    "Leg Extension",
                    "Lunges Deep",
                    "Step Up alti"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Goblet Squat o Box Squat a 90° per ridurre la pressione retro-rotulea"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Piedi alti e larghi, spinta sui talloni, ROM controllato a 80-90°"
                    }
          ]
},
        {
          "id": "periostite_tibiale",
          "name": "Periostite Tibiale",
          "nameEn": "Shin Splints",
          "category": "arti_inferiori",
          "description": "Infiammazione del periostio lungo la tibia, comune in corridori e saltatori.",
          "icon": "leg",
          "riskLevel": "low",
          "exclusions": [
                    "Running",
                    "Jump Rope",
                    "Pogo Jump",
                    "Plyometrics"
          ],
          "adaptations": [
                    {
                              "pattern": "Jump Squat",
                              "modification": "Sostituire con Squat statici o spinte su pressa controllate"
                    },
                    {
                              "pattern": "Calf Raise",
                              "modification": "Focus su fase eccentrica lenta a basso carico, no balzi"
                    }
          ]
},
        {
          "id": "frattura_stress_tibiale",
          "name": "Frattura da Stress Tibiale",
          "nameEn": "Tibial Stress Fracture",
          "category": "arti_inferiori",
          "description": "Microfrattura dell'osso tibiale causata da microtraumi ripetuti e scarso riposo.",
          "icon": "leg",
          "riskLevel": "high",
          "exclusions": [
                    "Running",
                    "Jumping",
                    "Squat pesante",
                    "Deadlift pesante",
                    "Plyometrics",
                    "Pogo Jump"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Solo esercizi senza carico d'impatto (nuoto, cyclette leggera, macchine guidate)"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Carico ridotto al 50%, no impatto, solo spinta fluida"
                    }
          ]
},
        {
          "id": "pubalgia_sportiva",
          "name": "Pubalgia Sportiva",
          "nameEn": "Athletic Pubalgia",
          "category": "arti_inferiori",
          "description": "Sindrome dolorosa dell'inguine e del pube che coinvolge adduttori e muscoli addominali.",
          "icon": "hip",
          "riskLevel": "medium",
          "exclusions": [
                    "Squat largo",
                    "Affondi laterali",
                    "Leg Press largo",
                    "Crunch obliqui rotatori"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Stance molto stretta, punte quasi dritte, ROM 90° controllato"
                    },
                    {
                              "pattern": "Hip Thrust",
                              "modification": "Inserire pallone tra le ginocchia da stringere isometricamente"
                    }
          ]
},
        {
          "id": "borsite_trocanterica",
          "name": "Borsite Trocanterica",
          "nameEn": "Trochanteric Bursitis",
          "category": "arti_inferiori",
          "description": "Infiammazione della borsa sierosa sopra il grande trocantere del femore.",
          "icon": "hip",
          "riskLevel": "low",
          "exclusions": [
                    "Abductor Machine Heavy",
                    "Affondi incrociati",
                    "Dormire/caricare sul fianco colpito"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat con stance parallela stretta, evitare allargamento anca"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "ROM controllato bilaterale, posizionamento comodo senza pinch"
                    }
          ]
},
        {
          "id": "distorsione_caviglia_cronica",
          "name": "Distorsione Caviglia Cronica",
          "nameEn": "Chronic Ankle Sprain",
          "category": "arti_inferiori",
          "description": "Instabilità da lesioni ripetute dei legamenti della caviglia con lasso articolare.",
          "icon": "foot",
          "riskLevel": "low",
          "exclusions": [
                    "Jump Rope",
                    "Balance Board estreme",
                    "Pistol Squat a corpo libero"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Eseguiti con scarpe rigide supportive o supporto talloni (tacco)"
                    },
                    {
                              "pattern": "Jump Squat",
                              "modification": "Sostituire con salti controllati atterrando su tappeto morbido"
                    }
          ]
},
        {
          "id": "lesione_collaterale",
          "name": "Lesione Legamento Collaterale",
          "nameEn": "MCL/LCL Knee Sprain",
          "category": "arti_inferiori",
          "description": "Distorsione o rottura parziale dei legamenti collaterali (mediale o laterale) del ginocchio.",
          "icon": "knee",
          "riskLevel": "medium",
          "exclusions": [
                    "Squat con stance larga",
                    "Lateral Lunges",
                    "Valgismo ginocchio indotto"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Squat guidato al multipower o stance stretta parallela, ginocchia in linea"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Uso di fascia di stabilità, spinta parallela controllata"
                    }
          ]
},
        {
          "id": "sindrome_patellofemorale",
          "name": "Sindrome Patellofemorale",
          "nameEn": "Patellofemoral Pain Syndrome (PFPS)",
          "category": "arti_inferiori",
          "description": "Sindrome da mal-allineamento rotuleo con dolore retro o peri-rotuleo.",
          "icon": "knee",
          "riskLevel": "low",
          "exclusions": [
                    "Leg Extension",
                    "Lunges Deep",
                    "Squat profondo bilaterale pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat controllato con discesa controllata di 3s"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Piedi posizionati alti sulla pedana per preservare l'angolo rotula"
                    }
          ]
},
        {
          "id": "quadriceps_strain",
          "name": "Stiramento/Strappo Quadricipite",
          "nameEn": "Quadriceps Strain",
          "category": "arti_inferiori",
          "description": "Lesione muscolare del quadricipite (retto femorale) da contrazione eccentrica violenta o sprint.",
          "icon": "leg",
          "riskLevel": "medium",
          "exclusions": [
                    "Sprint",
                    "Leg Extension pesante",
                    "Jump Squat",
                    "Box Jump",
                    "Calci"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Squat isometrico a parete (wall sit) a 60° di flessione, progressione graduale"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Leg Press con ROM ridotto (0-60°), carico leggero, fase eccentrica lenta (4s)"
                    }
          ]
},
        {
          "id": "groin_strain",
          "name": "Stiramento Adduttori / Inguine",
          "nameEn": "Groin/Adductor Strain",
          "category": "arti_inferiori",
          "description": "Lesione muscolare degli adduttori dell'anca, comune in sport con cambi di direzione e calci.",
          "icon": "leg",
          "riskLevel": "medium",
          "exclusions": [
                    "Adductor Machine pesante",
                    "Affondi laterali profondi",
                    "Sprint laterale",
                    "Calci"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Squat con stance stretta (shoulder-width), evitare sumo squat"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Piedi paralleli, stance media, evitare adduzione forzata"
                    }
          ]
},
        {
          "id": "compartment_syndrome_chronic",
          "name": "Sindrome Compartimentale Cronica",
          "nameEn": "Chronic Exertional Compartment Syndrome",
          "category": "arti_inferiori",
          "description": "Aumento della pressione nei compartimenti muscolari della gamba durante l'esercizio, con dolore e parestesie.",
          "icon": "leg",
          "riskLevel": "medium",
          "exclusions": [
                    "Corsa prolungata",
                    "Sprint ripetuti",
                    "Calf Raise ad alto volume"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Esercizio a basso impatto (bici, nuoto), ridurre volume corsa, stretching post-esercizio"
                    }
          ]
},
        {
          "id": "piriformis_syndrome",
          "name": "Sindrome del Piriforme",
          "nameEn": "Piriformis Syndrome",
          "category": "arti_inferiori",
          "description": "Compressione del nervo sciatico da parte del muscolo piriforme ipertrofico o contratto, con dolore gluteo irradiato alla gamba.",
          "icon": "hip",
          "riskLevel": "low",
          "exclusions": [
                    "Seduta prolungata su macchine",
                    "Squat profondo con extrarotazione forzata"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Squat parallelo con stance neutra, evitare extrarotazione forzata"
                    },
                    {
                              "pattern": "General",
                              "modification": "Stretching piriforme e rotatori esterni prima e dopo ogni sessione"
                    }
          ]
},
        {
          "id": "frattura_stress_metatarsale",
          "name": "Frattura da Stress Metatarsale",
          "nameEn": "Metatarsal Stress Fracture",
          "category": "arti_inferiori",
          "description": "Frattura da sovraccarico ripetitivo delle ossa metatarsali, frequente nei runner e in attività ad alto impatto.",
          "icon": "foot",
          "riskLevel": "high",
          "exclusions": [
                    "Corsa",
                    "Salti",
                    "Box Jump",
                    "Esercizi in piedi ad alto impatto"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Solo esercizi seduti o sdraiati (upper body, core), zero carico sull'avampiede fino a guarigione"
                    }
          ]
},
        {
          "id": "frattura_stress_collo_femore",
          "name": "Frattura da Stress del Collo del Femore",
          "nameEn": "Femoral Neck Stress Fracture",
          "category": "arti_inferiori",
          "description": "Frattura da sovraccarico della regione prossimale del femore, grave e frequente nei runner di fondo e nella triade dell'atleta.",
          "icon": "hip",
          "riskLevel": "high",
          "exclusions": [
                    "Qualsiasi attività in carico su arto inferiore",
                    "Corsa",
                    "Salti",
                    "Squat"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Riposo assoluto dall'impatto, solo upper body e core supino, consulenza ortopedica urgente"
                    }
          ]
},
        {
          "id": "morton_neuroma",
          "name": "Neuroma di Morton",
          "nameEn": "Morton's Neuroma",
          "category": "arti_inferiori",
          "description": "Ispessimento del nervo interdigitale (tipicamente 3°-4° spazio) con dolore bruciante all'avampiede sotto carico.",
          "icon": "foot",
          "riskLevel": "low",
          "exclusions": [
                    "Esercizi in punta di piedi prolungati",
                    "Scarpe strette durante allenamento"
          ],
          "adaptations": [
                    {
                              "pattern": "Calf Raise",
                              "modification": "Calf raise a piede piatto o con supporto metatarsale, evitare flessione plantare forzata"
                    },
                    {
                              "pattern": "General",
                              "modification": "Scarpe larghe in avampiede, plantare con pad metatarsale"
                    }
          ]
},
        {
          "id": "alluce_valgo",
          "name": "Alluce Valgo (Bunion)",
          "nameEn": "Hallux Valgus / Bunion",
          "category": "arti_inferiori",
          "description": "Deviazione laterale dell'alluce con prominenza mediale dolorosa, aggravata da calzature strette e carico sull'avampiede.",
          "icon": "foot",
          "riskLevel": "low",
          "exclusions": [
                    "Esercizi in punta stretta",
                    "Corsa su terreni irregolari"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Calzature a pianta larga, toe spacer durante allenamento, evitare flessione plantare estrema"
                    }
          ]
},

        // ==========================================
        // --- C) ARTI SUPERIORI - SPALLA, GOMITO, POLSO (arti_superiori) ---
        // ==========================================
        {
          "id": "shoulder_generic",
          "name": "Spalla Problematica",
          "nameEn": "Shoulder Pain",
          "category": "arti_superiori",
          "description": "Fastidi articolari diffusi alla spalla senza diagnosi patologica specifica.",
          "icon": "shoulder",
          "riskLevel": "low",
          "exclusions": [
                    "Military Press Full",
                    "Overhead Throw",
                    "Upright Row",
                    "Pull-up Behind Neck"
          ],
          "adaptations": [
                    {
                              "pattern": "Military Press",
                              "modification": "Spinte manubri presa neutra (martello) a ROM ridotto (100°)"
                    },
                    {
                              "pattern": "Lat Machine",
                              "modification": "Tirata al petto con presa neutra stretta, ROM controllato"
                    },
                    {
                              "pattern": "Shoulder Press",
                              "modification": "Usa macchina guidata seduto con spalliera leggermente inclinata"
                    }
          ]
},
        {
          "id": "impingement",
          "name": "Sindrome Impingement",
          "nameEn": "Subacromial Impingement",
          "category": "arti_superiori",
          "description": "Compressione dei tendini della cuffia nello spazio sottoacromiale durante l'abduzione.",
          "icon": "shoulder",
          "riskLevel": "medium",
          "exclusions": [
                    "Overhead Press",
                    "Pull-up",
                    "Upright Row",
                    "Lateral Raise Heavy",
                    "Dips"
          ],
          "adaptations": [
                    {
                              "pattern": "Lat Pulldown",
                              "modification": "Presa neutra stretta avanti, arresto a 90° gomiti"
                    },
                    {
                              "pattern": "Military Press",
                              "modification": "Sostituire con spinte manubri sul piano scapolare (presa neutra a 30°)"
                    },
                    {
                              "pattern": "Lateral Raise",
                              "modification": "Alzate laterali con pollice verso l'alto (extrarotazione) max 90°"
                    }
          ]
},
        {
          "id": "instability_shoulder",
          "name": "Instabilità Gleno-Omerale",
          "nameEn": "Glenohumeral Instability",
          "category": "arti_superiori",
          "description": "Lassità capsulo-legamentosa con tendenza alla sublussazione o lussazione della spalla.",
          "icon": "shoulder",
          "riskLevel": "medium",
          "exclusions": [
                    "Dip Full",
                    "Panca Piana con gomiti larghi",
                    "Lat Machine Dietro",
                    "Snatch"
          ],
          "adaptations": [
                    {
                              "pattern": "Bench Press",
                              "modification": "Panca piana con manubri, presa neutra/semi-prona, ROM limitato a 2cm dal petto"
                    },
                    {
                              "pattern": "Lat Pulldown",
                              "modification": "ROM controllato evitando il completo allungamento passivo a fine eccentrica"
                    }
          ]
},
        {
          "id": "supraspinatus",
          "name": "Tendinopatia del Sovraspinato",
          "nameEn": "Supraspinatus Tendinitis",
          "category": "arti_superiori",
          "description": "Infiammazione o degenerazione del tendine del muscolo sovraspinato.",
          "icon": "shoulder",
          "riskLevel": "low",
          "exclusions": [
                    "Overhead Press",
                    "Lateral Raise Heavy",
                    "Pull-up completi",
                    "Upright Row"
          ],
          "adaptations": [
                    {
                              "pattern": "Military Press",
                              "modification": "Arnold press seduto o dumbbell press parziale (ROM 90° max)"
                    },
                    {
                              "pattern": "Lateral Raise",
                              "modification": "Alzate sul piano scapolare (30° avanti) con carichi terapeutici 1-4kg"
                    },
                    {
                              "pattern": "Face Pull",
                              "modification": "Cavo alto con corda, focus su rotazione esterna pura controllata"
                    }
          ]
},
        {
          "id": "frozen_shoulder",
          "name": "Spalla Congelata",
          "nameEn": "Frozen Shoulder",
          "category": "arti_superiori",
          "description": "Capsulite adesiva caratterizzata da forte dolore iniziale e progressiva perdita quasi totale del ROM.",
          "icon": "shoulder",
          "riskLevel": "medium",
          "exclusions": [
                    "Qualsiasi sollevamento pesante",
                    "Snatch",
                    "Dips",
                    "Trazioni esplosive"
          ],
          "adaptations": [
                    {
                              "pattern": "Lateral Raise",
                              "modification": "Movimento attivo-assistito o senza peso per preservare la mobilità residua"
                    },
                    {
                              "pattern": "Military Press",
                              "modification": "Evitare spinte. Sostituire con esercizi di mobilità passiva al muro"
                    }
          ]
},
        {
          "id": "bursitis_shoulder",
          "name": "Borsite Sottoacromiale",
          "nameEn": "Subacromial Bursitis",
          "category": "arti_superiori",
          "description": "Infiammazione acuta o cronica della borsa sottoacromiale con forte dolore alla spalla.",
          "icon": "shoulder",
          "riskLevel": "medium",
          "exclusions": [
                    "Overhead",
                    "Lateral Raise Heavy",
                    "Pull-ups",
                    "Spinte su inclinata"
          ],
          "adaptations": [
                    {
                              "pattern": "Military Press",
                              "modification": "Presa neutra parziale, spinta lenta a carico terapeutico"
                    },
                    {
                              "pattern": "Lateral Raise",
                              "modification": "Alzate parziali fino a 70° con pollice in su"
                    }
          ]
},
        {
          "id": "cuffia_rotatori_parziale",
          "name": "Lesione Parziale della Cuffia",
          "nameEn": "Partial Rotator Cuff Tear",
          "category": "arti_superiori",
          "description": "Fessurazione o lacerazione incompleta di uno o più tendini della cuffia dei rotatori.",
          "icon": "shoulder",
          "riskLevel": "medium",
          "exclusions": [
                    "Military Press",
                    "Dips pesanti",
                    "Lat Machine dietro nuca",
                    "Panca Piana Heavy"
          ],
          "adaptations": [
                    {
                              "pattern": "Bench Press",
                              "modification": "Dumbbell Floor Press (panca a terra) per bloccare gomiti a 90°"
                    },
                    {
                              "pattern": "Lat Pulldown",
                              "modification": "Presa inversa (supina) stretta per scaricare la spalla anteriore"
                    }
          ]
},
        {
          "id": "tendinite_bicipite_lungo",
          "name": "Tendinopatia Capo Lungo Bicipite",
          "nameEn": "Long Head Biceps Tendinitis",
          "category": "arti_superiori",
          "description": "Infiammazione del tendine del capo lungo del bicipite brachiale nel solco bicipitale dell'omero.",
          "icon": "arm",
          "riskLevel": "low",
          "exclusions": [
                    "Barbell Curl pesante",
                    "Bench Press con gomiti spinti indietro",
                    "Chin-up"
          ],
          "adaptations": [
                    {
                              "pattern": "Barbell Curl",
                              "modification": "Curl con manubri in inclinazione inclinata a 45° presa hammer (neutra)"
                    },
                    {
                              "pattern": "Pull-up",
                              "modification": "Trazioni a presa prona larga (meno enfasi su bicipite, più su dorsale)"
                    }
          ]
},
        {
          "id": "slap_lesion",
          "name": "Lesione SLAP",
          "nameEn": "SLAP Tear",
          "category": "arti_superiori",
          "description": "Lesione del labbro glenoideo superiore da anteriore a posteriore, comune nei lanciatori.",
          "icon": "shoulder",
          "riskLevel": "high",
          "exclusions": [
                    "Trazioni verticali appesi",
                    "Overhead Press pesante",
                    "Dips",
                    "Handstand Pushups"
          ],
          "adaptations": [
                    {
                              "pattern": "Pull-up",
                              "modification": "Sostituire con Rematore orizzontale o Lat Machine presa neutra chiusa"
                    },
                    {
                              "pattern": "Bench Press",
                              "modification": "Bench press con presa stretta, gomiti stretti al busto"
                    }
          ]
},
        {
          "id": "lesione_acromioclaveare",
          "name": "Distorsione Acromioclaveare",
          "nameEn": "AC Joint Sprain",
          "category": "arti_superiori",
          "description": "Trauma o instabilità dell'articolazione acromioclaveare dovuto a cadute o impatti.",
          "icon": "shoulder",
          "riskLevel": "medium",
          "exclusions": [
                    "Dips",
                    "Bench Press bilaterale",
                    "Upright Row",
                    "Farmer Carry"
          ],
          "adaptations": [
                    {
                              "pattern": "Bench Press",
                              "modification": "Push-up facilitati o Floor Press con manubri, limitando abduzione"
                    },
                    {
                              "pattern": "Military Press",
                              "modification": "Arnold press seduto con traiettoria controllata spalla"
                    }
          ]
},
        {
          "id": "instabilita_polso",
          "name": "Instabilità di Polso",
          "nameEn": "Wrist Instability",
          "category": "arti_superiori",
          "description": "Lassità legamentosa carpale con dolore sotto carico in flessione/estensione.",
          "icon": "hand",
          "riskLevel": "low",
          "exclusions": [
                    "Clean",
                    "Push-up a palmo piatto",
                    "Barbell Curl pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "Push-up",
                              "modification": "Uso di maniglie push-up o eseguiti su pugni per mantenere polso dritto"
                    },
                    {
                              "pattern": "Barbell Curl",
                              "modification": "Usa EZ-bar o manubri presa neutra"
                    }
          ]
},
        {
          "id": "de_quervain",
          "name": "Sindrome di De Quervain",
          "nameEn": "De Quervain's Tenosynovitis",
          "category": "arti_superiori",
          "description": "Tenosinite stenosante del pollice (abduttore lungo ed estensore breve).",
          "icon": "hand",
          "riskLevel": "low",
          "exclusions": [
                    "Barbell Row con presa prona forte",
                    "Farmer Carry pesante",
                    "Chin-up presa forte"
          ],
          "adaptations": [
                    {
                              "pattern": "Barbell Curl",
                              "modification": "Curl con manubri evitando la deviazione ulnare del polso"
                    },
                    {
                              "pattern": "Row",
                              "modification": "Rematore al cavo con cinghie o presa neutra morbida"
                    }
          ]
},
        {
          "id": "epicondilite_mediale",
          "name": "Epitrocleite / Epicondilite Mediale",
          "nameEn": "Medial Epicondylitis",
          "category": "arti_superiori",
          "description": "Infiammazione dei tendini flessori dell'avambraccio inseriti sull'epitroclea (Gomito del Golfista).",
          "icon": "arm",
          "riskLevel": "low",
          "exclusions": [
                    "Pull-up supini (Chin-up)",
                    "Wrist Curl carichi pesanti",
                    "Barbell Curl supino pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "Barbell Curl",
                              "modification": "Curl con EZ-bar presa semi-prona o Hammer Curl neutro"
                    },
                    {
                              "pattern": "Lat Pulldown",
                              "modification": "Presa neutra o prona, no supinazione estrema"
                    }
          ]
},
        {
          "id": "neuropatia_ulnare",
          "name": "Compressione Nervo Ulnare",
          "nameEn": "Cubital Tunnel Syndrome",
          "category": "arti_superiori",
          "description": "Sofferenza o compressione del nervo ulnare nel canale cubitale del gomito.",
          "icon": "arm",
          "riskLevel": "medium",
          "exclusions": [
                    "Skullcrushers pesanti",
                    "Flessione gomito prolungata oltre 100°",
                    "Dips"
          ],
          "adaptations": [
                    {
                              "pattern": "Skull Crusher",
                              "modification": "Sostituire con Spinte in basso al cavo (Pushdown) parziali, gomiti in linea"
                    },
                    {
                              "pattern": "Bench Press",
                              "modification": "Evitare blocco articolare serrato (no lockout gomito)"
                    }
          ]
},
        {
          "id": "shoulder_dislocation_recurrent",
          "name": "Lussazione Spalla Recidivante",
          "nameEn": "Recurrent Shoulder Dislocation",
          "category": "arti_superiori",
          "description": "Instabilità gleno-omerale con episodi ripetuti di lussazione, tipica in sport di contatto e overhead.",
          "icon": "shoulder",
          "riskLevel": "high",
          "exclusions": [
                    "Behind Neck Press",
                    "Dips profondi",
                    "Panca Piana con ROM eccessivo",
                    "Pullover pesante",
                    "Lanci"
          ],
          "adaptations": [
                    {
                              "pattern": "Bench Press",
                              "modification": "Panca con manubri, ROM limitato (gomiti a 90°), mai sotto il piano delle spalle"
                    },
                    {
                              "pattern": "Shoulder Press",
                              "modification": "Spinte seduto con manubri, ROM controllato, evitare abduzione > 90° con extrarotazione"
                    }
          ]
},
        {
          "id": "labral_tear_shoulder",
          "name": "Lesione del Labbro Glenoideo",
          "nameEn": "Glenoid Labral Tear",
          "category": "arti_superiori",
          "description": "Lesione del labbro cartilagineo della glena (SLAP, Bankart) con instabilità, click e dolore in overhead.",
          "icon": "shoulder",
          "riskLevel": "medium",
          "exclusions": [
                    "Overhead pesante",
                    "Behind Neck",
                    "Pullover",
                    "Dips profondi",
                    "Kipping Pull-up"
          ],
          "adaptations": [
                    {
                              "pattern": "Pull-up",
                              "modification": "Lat pulldown a presa neutra avanti al petto, evitare trazione dietro"
                    },
                    {
                              "pattern": "Shoulder Press",
                              "modification": "Landmine Press o Cable Press a ROM controllato"
                    }
          ]
},

        // ==========================================
        // --- D) ALTRI DISTRETTI MUSCOLO-SCHELETRICI (altri_distretti) ---
        // ==========================================
        {
          "id": "tennis_elbow",
          "name": "Epicondilite (Gomito)",
          "nameEn": "Lateral Epicondylitis",
          "category": "altri_distretti",
          "description": "Tennis Elbow. Tendinopatia degli estensori del polso all'inserzione sull'epicondilo laterale.",
          "icon": "arm",
          "riskLevel": "low",
          "exclusions": [
                    "Barbell Curl Heavy",
                    "Dip Full",
                    "Skull Crusher Heavy",
                    "Trazioni pronazione pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "Barbell Curl",
                              "modification": "EZ-bar con presa neutra o curl con manubri presa hammer, -30% carico"
                    },
                    {
                              "pattern": "Skull Crusher",
                              "modification": "Pushdown con corda ai cavi tenendo i polsi rigidi e dritti"
                    },
                    {
                              "pattern": "Row",
                              "modification": "Rematore con presa neutra ed enfasi eccentrica lenta"
                    }
          ]
},
        {
          "id": "golfer_elbow",
          "name": "Epitrocleite (Gomito)",
          "nameEn": "Medial Epicondylitis",
          "category": "altri_distretti",
          "description": "Golfer Elbow. Tendinopatia dei flessori del polso all'inserzione sull'epitroclea mediale.",
          "icon": "arm",
          "riskLevel": "low",
          "exclusions": [
                    "Chin-up",
                    "Barbell Curl supino pesante",
                    "Flessione polso pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "Row",
                              "modification": "Presa neutra orizzontale, carichi ridotti del 20%, focus su trazione dorsale"
                    },
                    {
                              "pattern": "Curl",
                              "modification": "Hammer Curl (presa neutra) con manubri"
                    }
          ]
},
        {
          "id": "weak_wrist",
          "name": "Polso Debole",
          "nameEn": "Weak Wrist",
          "category": "altri_distretti",
          "description": "Deficit di stabilità e dolore generico del compartimento carpale.",
          "icon": "hand",
          "riskLevel": "low",
          "exclusions": [
                    "Barbell Curl pesante",
                    "Farmer Carry",
                    "Wrist Flexion caricata",
                    "Clean"
          ],
          "adaptations": [
                    {
                              "pattern": "Barbell Curl",
                              "modification": "EZ-bar o Dumbbell Hammer Curl bilaterale seduto"
                    },
                    {
                              "pattern": "Bench Press",
                              "modification": "Mantenere i polsi dritti bloccati in linea con l'avambraccio, eventualmente fasciati"
                    }
          ]
},
        {
          "id": "carpal_tunnel",
          "name": "Sindrome Tunnel Carpale",
          "nameEn": "Carpal Tunnel Syndrome",
          "category": "altri_distretti",
          "description": "Neuropatia compressiva del nervo mediano nel canale del carpo.",
          "icon": "hand",
          "riskLevel": "low",
          "exclusions": [
                    "Front Squat presa rack classica",
                    "Push-up a palmo piatto",
                    "Bench Press con presa strettissima"
          ],
          "adaptations": [
                    {
                              "pattern": "Push-up",
                              "modification": "Eseguiti sui pugni o con maniglie dedicate"
                    },
                    {
                              "pattern": "Front Squat",
                              "modification": "Presa a braccia incrociate (Cross-arm front squat) o cinghie"
                    }
          ]
},
        {
          "id": "de_quervain_altri",
          "name": "Sindrome di De Quervain (Polso)",
          "nameEn": "De Quervain Syndrome",
          "category": "altri_distretti",
          "description": "Tenosinite infiammatoria della guaina del pollice.",
          "icon": "hand",
          "riskLevel": "low",
          "exclusions": [
                    "Presa massimale bilanciere",
                    "Stacco da terra senza fascette",
                    "Farmer Carry"
          ],
          "adaptations": [
                    {
                              "pattern": "Deadlift",
                              "modification": "Hex bar stacco usando fascette protettive (lifting straps)"
                    },
                    {
                              "pattern": "Curl",
                              "modification": "Dumbbell Curl con presa neutra, carichi moderati"
                    }
          ]
},
        {
          "id": "costocondrite",
          "name": "Costocondrite",
          "nameEn": "Costochondritis",
          "category": "altri_distretti",
          "description": "Infiammazione della giunzione costo-condrale con dolore toracico anteriore, spesso confusa con dolore cardiaco.",
          "icon": "chest",
          "riskLevel": "low",
          "exclusions": [
                    "Panca Piana pesante",
                    "Dips",
                    "Push-up in fase acuta"
          ],
          "adaptations": [
                    {
                              "pattern": "Bench Press",
                              "modification": "Panca con manubri leggeri, ROM ridotto, evitare stretching eccessivo del torace"
                    },
                    {
                              "pattern": "General",
                              "modification": "Ridurre volume di push e chest exercises fino a risoluzione del dolore"
                    }
          ]
},
        {
          "id": "dupuytren",
          "name": "Morbo di Dupuytren",
          "nameEn": "Dupuytren's Contracture",
          "category": "altri_distretti",
          "description": "Fibrosi progressiva della fascia palmare con retrazione delle dita (tipicamente anulare e mignolo), limitando la presa.",
          "icon": "hand",
          "riskLevel": "low",
          "exclusions": [
                    "Prese forzate prolungate",
                    "Farmer Walk pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Utilizzare guanti imbottiti, prese aperte (straps), evitare prese estreme con flessione forzata delle dita"
                    }
          ]
},

        // ==========================================
        // --- E) PATOLOGIE SISTEMICHE, CARDIOVASCOLARI & METABOLICHE (sistemiche) ---
        // ==========================================
        {
          "id": "hypertension",
          "name": "Ipertensione Arteriosa",
          "nameEn": "Hypertension",
          "category": "sistemiche",
          "description": "Pressione arteriosa sistolica e diastolica cronicamente elevata (>140/90 mmHg).",
          "icon": "heart",
          "riskLevel": "medium",
          "exclusions": [
                    "Manovra di Valsalva",
                    "Isometria prolungata oltre 6-8 secondi",
                    "1RM massimali",
                    "Decline Bench"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Intensità max 70% 1RM, respirazione continua controllata, recupero di 90s"
                    },
                    {
                              "pattern": "Deadlift",
                              "modification": "Intensità controllata, mai andare in apnea, espirazione attiva nella fase concentrica"
                    },
                    {
                              "pattern": "General",
                              "modification": "Monitorare la pressione prima e dopo gli allenamenti, evitare sbalzi repentini testa-piedi"
                    }
          ]
},
        {
          "id": "ischemic_heart",
          "name": "Cardiopatia Ischemica Stabile",
          "nameEn": "Ischemic Heart Disease",
          "category": "sistemiche",
          "description": "Riduzione cronica del flusso ematico al miocardio controllata farmacologicamente.",
          "icon": "heart",
          "riskLevel": "high",
          "exclusions": [
                    "HIIT estremo",
                    "Valsalva estremo",
                    "1RM massimali",
                    "Supersets pesanti senza recupero"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Intensità controllata (50-70% RM), scala di Borg (RPE 6-7 max), riposi lunghi 2 minuti"
                    }
          ]
},
        {
          "id": "diabetes",
          "name": "Diabete Mellito Tipo 2",
          "nameEn": "Type 2 Diabetes",
          "category": "sistemiche",
          "description": "Insulino-resistenza cronica con iperglicemia sistemica.",
          "icon": "drop",
          "riskLevel": "low",
          "exclusions": [
                    "Sessioni a digiuno senza controllo",
                    "Volume estremo senza idratazione"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Lavoro con medio volume (65-80% 1RM), idratazione accurata, monitorare glicemia periferica"
                    }
          ]
},
        {
          "id": "asthma",
          "name": "Asma Bronchiale",
          "nameEn": "Bronchial Asthma",
          "category": "sistemiche",
          "description": "Broncocostrizione e infiammazione delle vie aeree indotta anche da sforzo fisico intenso.",
          "icon": "lungs",
          "riskLevel": "low",
          "exclusions": [
                    "High Intensity Cardio prolungato",
                    "Burpees esplosivi ad alto volume",
                    "Allenamento in climi freddi/secchi"
          ],
          "adaptations": [
                    {
                              "pattern": "Plyometrics",
                              "modification": "Massimo 5 ripetizioni consecutive, recupero completo di 2 minuti"
                    },
                    {
                              "pattern": "General",
                              "modification": "Riscaldamento lungo e progressivo (15 minuti), uso di broncodilatatore al bisogno"
                    }
          ]
},
        {
          "id": "obesity",
          "name": "Obesità di Grado I/II",
          "nameEn": "Obesity",
          "category": "sistemiche",
          "description": "Elevato indice di massa corporea (BMI > 30) con forte sovraccarico su colonna, anche e ginocchia.",
          "icon": "body",
          "riskLevel": "low",
          "exclusions": [
                    "Jump Squat profondo",
                    "Pogo Jump",
                    "Running su asfalto",
                    "Box Jump"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Press",
                              "modification": "ROM parziale 90° bilaterale, carico progressivo"
                    },
                    {
                              "pattern": "General",
                              "modification": "Privilegiare macchine guidate o esercizi stabili seduti, inserire camminata in salita"
                    }
          ]
},
        {
          "id": "osteoporosi",
          "name": "Osteoporosi",
          "nameEn": "Osteoporosis",
          "category": "sistemiche",
          "description": "Forte riduzione della densità minerale ossea con elevato rischio fratturativo vertebrale e femorale.",
          "icon": "spine",
          "riskLevel": "high",
          "exclusions": [
                    "Flessione colonna anteriore",
                    "Torsione colonna sotto carico",
                    "Good Morning",
                    "Sit-up",
                    "Box Jump",
                    "High Impact"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Wall Slide o Goblet Squat leggero con colonna rigidamente neutra"
                    },
                    {
                              "pattern": "General",
                              "modification": "Lavoro contro gravità a medio carico (stimolo meccanico osteogenetico) controllato"
                    }
          ]
},
        {
          "id": "fibromialgia",
          "name": "Sindrome Fibromialgica",
          "nameEn": "Fibromyalgia",
          "category": "sistemiche",
          "description": "Dolore muscoloscheletrico diffuso associato ad affaticabilità estrema e disturbi del sonno.",
          "icon": "body",
          "riskLevel": "medium",
          "exclusions": [
                    "Cedimento muscolare",
                    "Esercizi eccentrici estremi",
                    "Allenamento ad altissima intensità"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Volume d'allenamento basso, frequenza costante, RPE max 5-6, riscaldamento prolungato"
                    }
          ]
},
        {
          "id": "diabete_tipo_1",
          "name": "Diabete Mellito Tipo 1",
          "nameEn": "Type 1 Diabetes",
          "category": "sistemiche",
          "description": "Carenza assoluta di insulina endogena con forte rischio di ipoglicemia improvvisa da sforzo.",
          "icon": "drop",
          "riskLevel": "medium",
          "exclusions": [
                    "Cardio prolungato senza carboidrati",
                    "Allenamento ad altissimo volume solitario"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Tenere carboidrati a rapido assorbimento a portata di mano, evitare sforzi estremi nel picco dell'insulina"
                    }
          ]
},
        {
          "id": "sindrome_metabolica",
          "name": "Sindrome Metabolica",
          "nameEn": "Metabolic Syndrome",
          "category": "sistemiche",
          "description": "Coesistenza di obesità viscerale, dislipidemia, ipertensione e alterata glicemia con alto rischio cardiovascolare.",
          "icon": "heart",
          "riskLevel": "medium",
          "exclusions": [
                    "Valsalva prolungato",
                    "1RM massimali",
                    "HIIT estremo iniziale"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Attività mista forza-resistenza a medio-alta intensità (65-75% VO2max), monitoraggio"
                    }
          ]
},
        {
          "id": "aritmia_cardiaca",
          "name": "Aritmia Cardiaca Controllata",
          "nameEn": "Cardiac Arrhythmia",
          "category": "sistemiche",
          "description": "Anomalia stabile del ritmo cardiaco controllata farmacologicamente e da cardioversore/pacemaker.",
          "icon": "heart",
          "riskLevel": "medium",
          "exclusions": [
                    "Frequenza cardiaca > 85% massimale teorica",
                    "Cardio hiit estremo",
                    "Valsalva pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Cardiofrequenzimetro obbligatorio, intensità fissa moderata, pause complete da 90s"
                    }
          ]
},
        {
          "id": "scompenso_cardiaco_lieve",
          "name": "Scompenso Cardiaco Lieve",
          "nameEn": "Mild Heart Failure",
          "category": "sistemiche",
          "description": "Inefficienza lieve della pompa cardiaca (NYHA Classe I/II), tolleranza allo sforzo ridotta.",
          "icon": "heart",
          "riskLevel": "high",
          "exclusions": [
                    "1RM massimali",
                    "Isometria pura pesante",
                    "Superamento soglia anaerobica",
                    "Push Press pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Lavoro a circuito leggero, RPE 4-5 max, focus su muscoli periferici con carichi bassi"
                    }
          ]
},
        {
          "id": "ipotiroidismo_grave",
          "name": "Ipotiroidismo Clinico",
          "nameEn": "Hypothyroidism",
          "category": "sistemiche",
          "description": "Deficit di ormoni tiroidei con metabolismo basale fortemente ridotto, letargia e bradicardia.",
          "icon": "body",
          "riskLevel": "low",
          "exclusions": [
                    "Cardio ad altissima intensità prolungato",
                    "Sessioni doppie nello stesso giorno"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Intensità medio-bassa, recuperi generosi, focus su stabilità e rinforzo generale progressivo"
                    }
          ]
},
        {
          "id": "anemia",
          "name": "Anemia Moderata",
          "nameEn": "Anemia",
          "category": "sistemiche",
          "description": "Bassi livelli di emoglobina circolante con ridotto trasporto di ossigeno e frequente tachicardia.",
          "icon": "drop",
          "riskLevel": "medium",
          "exclusions": [
                    "Cardio prolungato ad alta intensità",
                    "Circuito senza pause",
                    "Sollevamenti olimpici ad alta densità"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Rallentare il ritmo, recuperi raddoppiati a 2 minuti, RPE max 6, idratazione massima"
                    }
          ]
},
        {
          "id": "copd",
          "name": "BPCO (Broncopneumopatia Cronica Ostruttiva)",
          "nameEn": "Chronic Obstructive Pulmonary Disease",
          "category": "sistemiche",
          "description": "Patologia polmonare cronica con limitazione del flusso aereo, dispnea da sforzo e ridotta tolleranza all'esercizio.",
          "icon": "lung",
          "riskLevel": "high",
          "exclusions": [
                    "Valsalva prolungata",
                    "HIIT non supervisionato",
                    "Esercizi in apnea"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Esercizio aerobico a bassa intensità (RPE 3-4), pause frequenti, monitoraggio SpO2 se disponibile"
                    }
          ]
},
        {
          "id": "chronic_kidney_disease",
          "name": "Insufficienza Renale Cronica",
          "nameEn": "Chronic Kidney Disease",
          "category": "sistemiche",
          "description": "Riduzione progressiva della funzione renale con impatto su resistenza muscolare, equilibrio elettrolitico e capacità aerobica.",
          "icon": "kidney",
          "riskLevel": "high",
          "exclusions": [
                    "Esercizio ad altissima intensità",
                    "Carichi isometrici prolungati",
                    "Valsalva estremo"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Volume e intensità ridotti del 30-40%, idratazione controllata, evitare sessioni nei giorni di dialisi"
                    }
          ]
},
        {
          "id": "angina_pectoris",
          "name": "Angina Pectoris Stabile",
          "nameEn": "Stable Angina Pectoris",
          "category": "sistemiche",
          "description": "Dolore toracico da sforzo causato da ischemia miocardica transitoria. Richiede clearance cardiologica per l'esercizio.",
          "icon": "heart",
          "riskLevel": "high",
          "exclusions": [
                    "Esercizio > 80% FCmax senza supervisione",
                    "Sprint",
                    "Sollevamenti pesanti con Valsalva",
                    "Esercizio al freddo intenso"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Aerobico continuo a intensità moderata (40-60% FCmax), monitoraggio FC costante, nitroglicerina disponibile"
                    }
          ]
},
        {
          "id": "ipertiroidismo",
          "name": "Ipertiroidismo",
          "nameEn": "Hyperthyroidism",
          "category": "sistemiche",
          "description": "Eccesso di ormoni tiroidei con tachicardia, perdita di peso, tremori e intolleranza al calore. Aumenta il rischio di aritmie da sforzo.",
          "icon": "thyroid",
          "riskLevel": "medium",
          "exclusions": [
                    "HIIT in fase acuta",
                    "Esercizio ad alta intensità con FC non controllata"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Intensità moderata (RPE 4-5), monitoraggio FC, evitare ambienti caldi, idratazione abbondante"
                    }
          ]
},
        {
          "id": "valvulopatia_moderata",
          "name": "Valvulopatia Cardiaca Moderata",
          "nameEn": "Moderate Valvular Heart Disease",
          "category": "sistemiche",
          "description": "Disfunzione valvolare (mitrale, aortica) di grado moderato che limita la risposta cardiaca allo sforzo.",
          "icon": "heart",
          "riskLevel": "high",
          "exclusions": [
                    "Valsalva",
                    "Carichi isometrici massimali",
                    "Sprint",
                    "Sollevamenti pesanti"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Esercizio aerobico leggero-moderato, evitare sforzi massimali, clearance cardiologica obbligatoria"
                    }
          ]
},

        // ==========================================
        // --- F) PATOLOGIE REUMATOLOGICHE ED AUTOIMMUNI (reumatologiche) ---
        // ==========================================
        {
          "id": "artrite_reumatoide",
          "name": "Artrite Reumatoide",
          "nameEn": "Rheumatoid Arthritis",
          "category": "reumatologiche",
          "description": "Patologia infiammatoria autoimmune cronica sistemica che distrugge le membrane sinoviali articolari.",
          "icon": "joint",
          "riskLevel": "medium",
          "exclusions": [
                    "Carico elevato in fase di acuzie (flare)",
                    "Esercizi balistici",
                    "Overhead Press pesante",
                    "Dips"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Isometria sottomassimale durante i flares, mobilità articolare dolce senza sovraccarico nei giorni migliori"
                    }
          ]
},
        {
          "id": "lupus_les",
          "name": "Lupus Eritematoso Sistemico",
          "nameEn": "Systemic Lupus (SLE)",
          "category": "reumatologiche",
          "description": "Malattia connettivale autoimmune sistemica che causa dolori articolari (artralgie) e forte astenia.",
          "icon": "joint",
          "riskLevel": "medium",
          "exclusions": [
                    "Allenamento intensivo sotto il sole diretto",
                    "Carichi d'impatto esplosivi",
                    "Cedimento muscolare"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Intensità moderata RPE 5-6, focus su rinforzo muscolare posturale e allungamento fasciale"
                    }
          ]
},
        {
          "id": "artrosi_generalizzata",
          "name": "Artrosi Generalizzata",
          "nameEn": "Generalized Osteoarthritis",
          "category": "reumatologiche",
          "description": "Invecchiamento articolare diffuso con usura della cartilagine e formazione di osteofiti in più distretti.",
          "icon": "joint",
          "riskLevel": "medium",
          "exclusions": [
                    "Plyometrics",
                    "Squat profondi liberi pesanti",
                    "Lifting ad alta percentuale 1RM"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat controllato con ROM ridotto a 90° con manubri"
                    },
                    {
                              "pattern": "General",
                              "modification": "Lavoro con alte ripetizioni (15-20) a carico basso per lubrificare l'articolazione"
                    }
          ]
},
        {
          "id": "artrite_psoriasica",
          "name": "Artrite Psoriasica",
          "nameEn": "Psoriatic Arthritis",
          "category": "reumatologiche",
          "description": "Associazione di psoriasi cutanea e artrite infiammatoria con frequente coinvolgimento di tendini e dita.",
          "icon": "joint",
          "riskLevel": "medium",
          "exclusions": [
                    "Presa ad altissimo carico (grip estremo)",
                    "Balzi",
                    "Esercizi ad alta eccentricità su tendini doloranti"
          ],
          "adaptations": [
                    {
                              "pattern": "Row",
                              "modification": "Utilizzo di impugnature morbide ergonomiche o cinghie di sollevamento"
                    },
                    {
                              "pattern": "General",
                              "modification": "Lavoro cardiovascolare a basso impatto unito a tonificazione parziale guidata"
                    }
          ]
},
        {
          "id": "raynaud_phenomenon",
          "name": "Fenomeno di Raynaud",
          "nameEn": "Raynaud's Phenomenon",
          "category": "reumatologiche",
          "description": "Vasospasmo delle dita (mani/piedi) scatenato dal freddo o stress, con pallore, cianosi e dolore.",
          "icon": "hand",
          "riskLevel": "low",
          "exclusions": [
                    "Allenamento all'aperto al freddo senza protezione",
                    "Prese metalliche fredde"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Guanti termici per prese, ambiente riscaldato, riscaldamento prolungato (10-15 min), evitare impugnature fredde"
                    }
          ]
},

        // ==========================================
        // --- G) CONDIZIONI NEUROLOGICHE & NEUROMUSCOLARI (neurologiche) ---
        // ==========================================
        {
          "id": "sciatalgia",
          "name": "Sciatalgia / Radicolopatia",
          "nameEn": "Sciatica / Lumbar Radiculopathy",
          "category": "neurologiche",
          "description": "Dolore urente, formicolio o intorpidimento lungo il decorso del nervo sciatico (da compressione L4-S1).",
          "icon": "brain",
          "riskLevel": "medium",
          "exclusions": [
                    "Deadlift",
                    "Stacco Rumeno pesante",
                    "Squat profondo",
                    "Crunch",
                    "Rematore bilanciere libero"
          ],
          "adaptations": [
                    {
                              "pattern": "Romanian Deadlift",
                              "modification": "Evitare. Sostituire con ponte glutei a corpo libero o estensioni anca monolaterali guidate"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Esegui a ROM molto controllato (max 60°) con spalla inclinata"
                    }
          ]
},
        {
          "id": "neuropatia_diabetica",
          "name": "Neuropatia Diabetica",
          "nameEn": "Diabetic Neuropathy",
          "category": "neurologiche",
          "description": "Danno ai nervi periferici indotto dal diabete, con frequente perdita di sensibilità plantare e deficit di equilibrio.",
          "icon": "brain",
          "riskLevel": "medium",
          "exclusions": [
                    "Corsa su tapis roulant",
                    "Jumping",
                    "Lifting scalzo",
                    "Salti su box"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Uso di calzature protettive specifiche, ispezionare i piedi dopo ogni seduta, focus su macchine stabili"
                    }
          ]
},
        {
          "id": "parkinson_lieve",
          "name": "Morbo di Parkinson Stabile",
          "nameEn": "Mild Parkinson's Disease",
          "category": "neurologiche",
          "description": "Disordine neurodegenerativo del movimento che provoca tremore a riposo, rigidità e instabilità posturale.",
          "icon": "brain",
          "riskLevel": "medium",
          "exclusions": [
                    "Sollevamenti olimpici complessi",
                    "Esercizi su superfici instabili",
                    "Esercizi di coordinazione rapida"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Focus su mobilità articolare, stabilità della marcia, esercizi su macchine guidate (Leg Press, Lat Machine)"
                    }
          ]
},
        {
          "id": "sclerosi_multipla_lieve",
          "name": "Sclerosi Multipla Stabile",
          "nameEn": "Stable Multiple Sclerosis",
          "category": "neurologiche",
          "description": "Malattia demielinizzante autoimmune. Caratterizzata da fatica, debolezza muscolare e potenziale intolleranza al calore.",
          "icon": "brain",
          "riskLevel": "medium",
          "exclusions": [
                    "Allenamento a temperature calde",
                    "Cedimento muscolare totale",
                    "Esercizi esplosivi"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Allenarsi in ambiente fresco, riposi prolungati (90-120s), RPE max 6-7, ventilazione attiva"
                    }
          ]
},
        {
          "id": "post_ictus_stabilizzato",
          "name": "Emiparesi Post-Ictus",
          "nameEn": "Post-Stroke Emiparesis",
          "category": "neurologiche",
          "description": "Deficit motorio e spasticità monolaterale residua dopo ictus cerebrale stabilizzato da almeno 12 mesi.",
          "icon": "brain",
          "riskLevel": "high",
          "exclusions": [
                    "Trazioni verticali appesi liberi",
                    "Deadlift bilanciere libero",
                    "Barbell Squat libero",
                    "Valsalva forte"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Esercizi unilaterali per il lato sano, mobilizzazione assistita per il lato plegico, uso di macchine stabili"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Lavoro monolaterale o assistito con ROM ridotto al parallelo"
                    }
          ]
},
        {
          "id": "cervicobrachialgia",
          "name": "Cervicobrachialgia",
          "nameEn": "Cervicobrachial Neuralgia",
          "category": "neurologiche",
          "description": "Dolore che si irradia dal tratto cervicale al braccio lungo il decorso del plesso brachiale.",
          "icon": "brain",
          "riskLevel": "medium",
          "exclusions": [
                    "Trazioni verticali",
                    "Overhead Press pesante",
                    "Tirate al mento",
                    "Farmer Carry pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "Lat Machine",
                              "modification": "Sostituire con Pulley orizzontale a presa neutra stretta a gomiti bassi"
                    },
                    {
                              "pattern": "Military Press",
                              "modification": "Spinte con manubri parziali o alzate laterali leggere entro i 80°"
                    }
          ]
},
        {
          "id": "epilessia_controllata",
          "name": "Epilessia Controllata",
          "nameEn": "Controlled Epilepsy",
          "category": "neurologiche",
          "description": "Disturbo convulsivo in terapia farmacologica stabile. L'esercizio è generalmente sicuro ma richiede precauzioni ambientali.",
          "icon": "brain",
          "riskLevel": "medium",
          "exclusions": [
                    "Nuoto solitario",
                    "Arrampicata senza sicura",
                    "Esercizi ad altezza senza protezione"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Allenamento con partner, evitare esaurimento totale e iperventilazione, idratazione costante"
                    }
          ]
},
        {
          "id": "vertigine_bppv",
          "name": "Vertigine Posizionale (VPPB)",
          "nameEn": "Benign Paroxysmal Positional Vertigo",
          "category": "neurologiche",
          "description": "Vertigini brevi e intense scatenate da cambiamenti di posizione della testa, comuni negli adulti.",
          "icon": "brain",
          "riskLevel": "medium",
          "exclusions": [
                    "Inversioni (headstand)",
                    "Burpees",
                    "Movimenti rapidi testa-giù",
                    "Turkish Get-up"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Evitare cambi posturali rapidi (da supino a in piedi), preferire esercizi seduti o in piedi stazionari"
                    }
          ]
},
        {
          "id": "post_concussione",
          "name": "Sindrome Post-Concussiva",
          "nameEn": "Post-Concussion Syndrome",
          "category": "neurologiche",
          "description": "Sintomi persistenti (cefalea, vertigini, difficoltà di concentrazione) dopo trauma cranico, comuni in sport di contatto.",
          "icon": "brain",
          "riskLevel": "high",
          "exclusions": [
                    "Sport di contatto",
                    "HIIT",
                    "Esercizi con rischio caduta",
                    "Sollevamenti pesanti"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Protocollo graduale di ritorno allo sport (6 fasi), iniziare con cammino leggero, incremento solo se asintomatico"
                    }
          ]
},
        {
          "id": "chronic_fatigue_syndrome",
          "name": "Sindrome da Fatica Cronica (CFS/ME)",
          "nameEn": "Chronic Fatigue Syndrome / ME",
          "category": "neurologiche",
          "description": "Affaticamento invalidante persistente con malessere post-sforzo (PEM), richiede gestione energetica attenta.",
          "icon": "brain",
          "riskLevel": "high",
          "exclusions": [
                    "Allenamento ad alta intensità",
                    "Sessioni lunghe",
                    "HIIT",
                    "Crossfit"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Approccio 'pacing': sessioni brevi (10-15 min), intensità molto bassa (RPE 2-3), monitorare PEM nelle 24-48h successive"
                    }
          ]
},

        // ==========================================
        // --- H) CONDIZIONI POST-CHIRURGICHE & RIABILITATIVE (post_chirurgiche) ---
        // ==========================================
        {
          "id": "post_op_lca",
          "name": "Ricostruzione LCA Post-Op",
          "nameEn": "Post-ACL Reconstruction (>6m)",
          "category": "post_chirurgiche",
          "description": "Esiti di ricostruzione chirurgica del Legamento Crociato Anteriore (da oltre 6 mesi) stabilizzata.",
          "icon": "surgery",
          "riskLevel": "medium",
          "exclusions": [
                    "Pistol Squat",
                    "Leg Extension pesante nel ROM terminale (30-0°)",
                    "Cambi di direzione repentini"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat controllato o multipower, spingendo le anche indietro per attivare i femorali"
                    },
                    {
                              "pattern": "Leg Extension",
                              "modification": "Sostituire con Leg Press a piedi alti spingendo dal tallone"
                    }
          ]
},
        {
          "id": "post_op_protesi_anca",
          "name": "Protesi Totale Anca Post-Op",
          "nameEn": "Post-Total Hip Replacement (>6m)",
          "category": "post_chirurgiche",
          "description": "Presenza di protesi d'anca stabilizzata da oltre 6-12 mesi. Rischio di lussazione articolare in determinati angoli.",
          "icon": "surgery",
          "riskLevel": "high",
          "exclusions": [
                    "Flessione anca oltre 90°",
                    "Intrarotazione dell'anca",
                    "Adduzione dell'anca oltre la linea media",
                    "Corsa"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat su box alto (ROM limitato a 85° di flessione anca), punte extra-ruotate"
                    },
                    {
                              "pattern": "Leg Press",
                              "modification": "Sconsigliata. In alternativa, ponte glutei statico o contrazione quadricipiti"
                    }
          ]
},
        {
          "id": "post_op_protesi_ginocchio",
          "name": "Protesi Totale Ginocchio Post-Op",
          "nameEn": "Post-Total Knee Replacement (>6m)",
          "category": "post_chirurgiche",
          "description": "Presenza di artroprotesi totale di ginocchio da oltre 6 mesi con limitazioni biomeccaniche di ROM residuo.",
          "icon": "surgery",
          "riskLevel": "high",
          "exclusions": [
                    "Squat profondo bilaterale",
                    "Jump Squat",
                    "Plyometrics",
                    "Carico d'impatto esplosivo"
          ],
          "adaptations": [
                    {
                              "pattern": "Leg Press",
                              "modification": "ROM limitato a 90° max, carico progressivo, spinta controllata"
                    },
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat su sedia/panca controllato"
                    }
          ]
},
        {
          "id": "post_op_cuffia_rotatori",
          "name": "Riparazione Cuffia Spalla Post-Op",
          "nameEn": "Post-Rotator Cuff Repair (>6m)",
          "category": "post_chirurgiche",
          "description": "Esiti di sutura/riparazione della cuffia dei rotatori da oltre 6-9 mesi, con iniziale recupero del ROM attivo.",
          "icon": "surgery",
          "riskLevel": "medium",
          "exclusions": [
                    "Military Press pesante",
                    "Dips",
                    "Trazioni verticali libere pesanti",
                    "Lanci sopra la testa"
          ],
          "adaptations": [
                    {
                              "pattern": "Military Press",
                              "modification": "Evitare bilanciere. Esegui Arnold press con manubri leggeri (2-6kg) sul piano scapolare"
                    },
                    {
                              "pattern": "Lat Pulldown",
                              "modification": "Lat Machine al petto a presa inversa stretta per stabilità scapolare"
                    }
          ]
},
        {
          "id": "post_op_colonna",
          "name": "Chirurgia Vertebrale Post-Op",
          "nameEn": "Post-Spine Surgery (>6m)",
          "category": "post_chirurgiche",
          "description": "Esiti di discectomia o artrodesi spinale stabilizzata da oltre 6-12 mesi. Colonna vulnerabile a carichi rotatori e compressione.",
          "icon": "surgery",
          "riskLevel": "high",
          "exclusions": [
                    "Deadlift con bilanciere",
                    "Back Squat pesante",
                    "Good Morning",
                    "Torsione del busto sotto carico",
                    "Valsalva"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Sostituire con Leg Press o Goblet Squat leggero con colonna rigidamente bloccata"
                    },
                    {
                              "pattern": "Row",
                              "modification": "Dumbbell Chest Supported Row su panca a 45° per azzerare il carico lombare"
                    }
          ]
},
        {
          "id": "post_op_mastectomia",
          "name": "Mastectomia Post-Op",
          "nameEn": "Post-Mastectomy (>6m)",
          "category": "post_chirurgiche",
          "description": "Esiti di asportazione chirurgica della ghiandola mammaria con potenziale alterazione linfatica del braccio.",
          "icon": "surgery",
          "riskLevel": "medium",
          "exclusions": [
                    "Panca Piana pesante",
                    "Trazioni verticali appesi",
                    "Push-up esplosivi",
                    "Carico monolaterale estremo"
          ],
          "adaptations": [
                    {
                              "pattern": "Bench Press",
                              "modification": "Pulsazioni o dumbbell chest press a carichi controllati, ROM ridotto senza allungamento estremo"
                    },
                    {
                              "pattern": "Lat Pulldown",
                              "modification": "Presa neutra stretta davanti, carichi molto moderati per evitare linfedema"
                    }
          ]
},
        {
          "id": "post_op_meniscectomia",
          "name": "Post Meniscectomia Artroscopica",
          "nameEn": "Post Arthroscopic Meniscectomy",
          "category": "post_chirurgiche",
          "description": "Fase post-operatoria dopo rimozione parziale del menisco, con necessità di recupero graduale della funzione articolare.",
          "icon": "knee",
          "riskLevel": "medium",
          "exclusions": [
                    "Squat profondo (prime 8 settimane)",
                    "Corsa (prime 6 settimane)",
                    "Sport con impatto (prime 12 settimane)"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Quarter squat o leg press con ROM 0-70° nelle prime fasi, progressione graduale"
                    },
                    {
                              "pattern": "General",
                              "modification": "Rinforzo quadricipite isometrico e concentrico, propriocezione, cyclette senza resistenza"
                    }
          ]
},
        {
          "id": "post_op_fusione_spinale",
          "name": "Post Fusione Vertebrale (Artrodesi)",
          "nameEn": "Post Spinal Fusion",
          "category": "post_chirurgiche",
          "description": "Fase post-operatoria dopo artrodesi vertebrale. Richiede evitare flessione, rotazione e carico assiale per mesi.",
          "icon": "spine",
          "riskLevel": "high",
          "exclusions": [
                    "Deadlift",
                    "Squat con bilanciere",
                    "Rotazioni del tronco",
                    "Flessioni della colonna",
                    "Sit-up",
                    "Corsa (prime 12 settimane)"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Solo esercizi approvati dal chirurgo, core isometrico in posizione neutra, nessun carico assiale fino a consolidamento confermato"
                    }
          ]
},
        {
          "id": "post_op_protesi_spalla",
          "name": "Post Protesi di Spalla",
          "nameEn": "Post Shoulder Arthroplasty",
          "category": "post_chirurgiche",
          "description": "Fase post-operatoria dopo sostituzione protesica della spalla (anatomica o inversa). Limitazioni permanenti su overhead pesante.",
          "icon": "shoulder",
          "riskLevel": "high",
          "exclusions": [
                    "Overhead Press pesante",
                    "Pull-up",
                    "Dips",
                    "Sport di contatto con arto superiore",
                    "Panca con bilanciere pesante"
          ],
          "adaptations": [
                    {
                              "pattern": "Shoulder Press",
                              "modification": "Spinte leggere con manubri entro ROM consentito dal chirurgo, mai > 90° abduzione inizialmente"
                    },
                    {
                              "pattern": "General",
                              "modification": "Seguire protocollo riabilitativo, rinforzo cuffia rotatori con elastici, progressione solo su autorizzazione medica"
                    }
          ]
},

        // ==========================================
        // --- I) POPOLAZIONI & CONDIZIONI SPECIALI (speciali) ---
        // ==========================================
        {
          "id": "gravidanza_secondo_trimestre",
          "name": "Gravidanza (II Trimestre)",
          "nameEn": "Pregnancy (2nd Trimester)",
          "category": "speciali",
          "description": "Stato di gravidanza controllato. Presenza di lassità legamentosa indotta da relaxina e aumento peso anteriore.",
          "icon": "sport",
          "riskLevel": "medium",
          "exclusions": [
                    "Esercizi supini (Sindrome da compressione aortica)",
                    "Heavy 1RM",
                    "Valsalva",
                    "Salti e Plyometrics",
                    "Crunch"
          ],
          "adaptations": [
                    {
                              "pattern": "Squat",
                              "modification": "Box Squat bilaterale con appoggio per stabilità (ROM 90°), stance comoda"
                    },
                    {
                              "pattern": "Bench Press",
                              "modification": "Sostituire con Incline Bench Press (30-45°) per evitare la posizione supina piatta"
                    },
                    {
                              "pattern": "General",
                              "modification": "Lavoro aerobico in fascia moderata (Borg 5-6), focus su allineamento e respirazione costale"
                    }
          ]
},
        {
          "id": "triade_atleta",
          "name": "Triade dell'Atleta / RED-S",
          "nameEn": "Relative Energy Deficiency (RED-S)",
          "category": "speciali",
          "description": "Deficit energetico relativo nello sport con compromissione metabolica, amenorrea e bassa densità ossea.",
          "icon": "sport",
          "riskLevel": "high",
          "exclusions": [
                    "Cardio prolungato",
                    "Alta intensità estenuante",
                    "Cedimento muscolare",
                    "Allenamento ad altissimo volume"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Carichi bassi-moderati per mantenimento osteogenico, riposo forzato tra i set, nutrizione++"
                    }
          ]
},
        {
          "id": "overtraining_syndrome",
          "name": "Sindrome da Overtraining",
          "nameEn": "Overtraining Syndrome",
          "category": "speciali",
          "description": "Accumulo di stress da allenamento accoppiato a scarso recupero, con calo prestazionale e alterazione neuroendocrina.",
          "icon": "sport",
          "riskLevel": "medium",
          "exclusions": [
                    "Sessioni intense",
                    "Carico >80% RM",
                    "Sessioni doppie",
                    "HIIT"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Allenamento ridotto del 50% in volume e intensità (scarico attivo RPE 4-5) per 2-4 settimane"
                    }
          ]
},
        {
          "id": "spondilolisi_sportiva",
          "name": "Spondilolisi Sportiva Attiva",
          "nameEn": "Active Athletic Spondylolysis",
          "category": "speciali",
          "description": "Lesione da stress attiva dell'arco vertebrale frequente in ginnasti, sollevatori e calciatori dovuta a ipereccentrici ripetuti.",
          "icon": "sport",
          "riskLevel": "high",
          "exclusions": [
                    "Tutti i sollevamenti liberi colonna",
                    "Estensione colonna forzata",
                    "Spinte in alto verticali",
                    "Kettlebell Swing",
                    "Jump Squat"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Rinforzo isometrico puro del core in posizione rigidamente neutra, riposo da impatto"
                    }
          ]
},
        {
          "id": "red_s",
          "name": "RED-S (Deficit Energetico Relativo nello Sport)",
          "nameEn": "Relative Energy Deficiency in Sport",
          "category": "speciali",
          "description": "Squilibrio tra apporto energetico e dispendio da allenamento, con impatto su ossa, metabolismo, ciclo mestruale e performance.",
          "icon": "sport",
          "riskLevel": "high",
          "exclusions": [
                    "Allenamento ad alto volume",
                    "Restrizione calorica durante allenamento",
                    "Doppie sessioni"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Riduzione volume del 40-50%, aumento apporto calorico, screening DEXA per densità ossea, supporto nutrizionale"
                    }
          ]
},
        {
          "id": "ehlers_danlos_ipermobilita",
          "name": "Sindrome di Ehlers-Danlos (Ipermobilità)",
          "nameEn": "Ehlers-Danlos Syndrome - Hypermobility Type",
          "category": "speciali",
          "description": "Iperlassità legamentosa congenita con instabilità articolare, sublussazioni frequenti e dolore cronico.",
          "icon": "joint",
          "riskLevel": "medium",
          "exclusions": [
                    "Stretching estremo",
                    "Iperestensioni",
                    "Esercizi balistici",
                    "Pesi pesanti senza controllo"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Rinforzo muscolare isometrico e concentrico per stabilizzazione articolare, ROM controllato (mai a fine corsa), evitare iperestensioni"
                    }
          ]
},
        {
          "id": "sarcopenia",
          "name": "Sarcopenia (Perdita Muscolare Età-Correlata)",
          "nameEn": "Sarcopenia",
          "category": "speciali",
          "description": "Perdita progressiva di massa e forza muscolare legata all'invecchiamento, con rischio aumentato di cadute e fragilità.",
          "icon": "muscle",
          "riskLevel": "low",
          "exclusions": [],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Programma di resistenza 2-3x/settimana con progressione lenta, focus su movimenti funzionali, proteine adeguate (1.2-1.6 g/kg)"
                    }
          ]
},
        {
          "id": "diastasi_retti_postpartum",
          "name": "Diastasi dei Retti Addominali (Post-Partum)",
          "nameEn": "Post-Partum Diastasis Recti",
          "category": "speciali",
          "description": "Separazione dei muscoli retti dell'addome lungo la linea alba dopo la gravidanza, con debolezza del core e possibile protrusione.",
          "icon": "core",
          "riskLevel": "medium",
          "exclusions": [
                    "Crunch",
                    "Sit-up",
                    "Plank frontale pesante (inizialmente)",
                    "V-up",
                    "Toes to Bar"
          ],
          "adaptations": [
                    {
                              "pattern": "General",
                              "modification": "Attivazione trasverso addominale, respirazione diaframmatica, esercizi ipopressivi, progressione graduale verso plank modificato"
                    }
          ]
}
    ];

})();
