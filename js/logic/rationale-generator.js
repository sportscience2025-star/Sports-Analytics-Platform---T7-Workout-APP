/**
 * js/logic/rationale-generator.js
 * AI Workout Generator - 4-Pillar Summary Rationale, Scientific Explanations & Citations
 */

(function () {
    'use strict';

    window.WorkoutGeneratorAI = window.WorkoutGeneratorAI || class {
        constructor() {
            this.riskLevels = {
                LOW: { color: '#10b981', label: 'Basso Rischio' },
                MEDIUM: { color: '#f59e0b', label: 'Rischio Moderato' },
                HIGH: { color: '#ef4444', label: 'Alto Rischio' }
            };
            this.thresholds = { HIGH: 4, MEDIUM: 2 };
        }
    };

    /**
     * Genera la motivazione discorsiva strutturata sui 4 Pilastri Scientifici:
     * 1. Contesto del Profilo & Obiettivo
     * 2. Architettura di Periodizzazione & Durata Macrociclo
     * 3. Prescrizioni Biomeccaniche e Cliniche (es. Escamilla)
     * 4. Strategia Velocity-Based Training (VBT) & Velocity Loss (González-Badillo, Samozino)
     */
    window.WorkoutGeneratorAI.prototype._generateSummaryRationale = function (params, method, riskProfile) {
        const isClinical = params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano';
        const sport = params.sportPraticato || params.sport;
        const goal = params.goal || 'Forza';
        const level = params.level || 'Intermedio';
        const weeks = parseInt(params.weeks) || 12;
        const isEndurance = !isClinical && sport === 'Endurance';
        const daysCount = isEndurance ? Math.min(2, parseInt(params.days) || 2) : parseInt(params.days) || 3;
        const injuries = params.injuries || [];

        // Pillar 1: Profile & Goal Context
        let p1 = '';
        if (isClinical) {
            const pathNames = (riskProfile?.pathologies || []).map(p => p.name || p.id).filter(Boolean).join(', ');
            p1 = `Il programma per il paziente clinico${pathNames ? ' (' + pathNames + ')' : ''} è stato strutturato con la massima attenzione alla tutela articolare, al controllo del carico biomeccanico e al ripristino funzionale progressivo.`;
        } else if (sport === 'Endurance') {
            p1 = `La programmazione per l'atleta di Endurance (focus ${goal}) integra l'allenamento contro resistenza ad alta intensità per ottimizzare l'economia del gesto atletico e la stiffness muscolo-tendinea senza indurre ipertrofia indesiderata (Seiler et al. 2010).`;
        } else if (sport === 'Bodybuilding') {
            p1 = `La scheda per l'atleta di Bodybuilding (livello ${level}) è orientata alla massimizzazione della tensione meccanica e dello stress metabolico controllato, ottimizzando il reclutamento delle unità motorie ad alta soglia (Pareja-Blanco et al. 2017).`;
        } else if (sport === 'Sport di Squadra' || sport === 'Calcio') {
            p1 = `Per l'atleta di Sport di Squadra, la programmazione privilegia il tasso di sviluppo della forza (RFD), la stabilità monolaterale e l'esplosività neuromuscolare funzionale alle accelerazioni e ai cambi di direzione.`;
        } else {
            p1 = `La programmazione di preparazione atletica (obiettivo ${goal}, livello ${level}) è formulata per ottimizzare la risposta neuromuscolare e la capacità prestazionale sistemica.`;
        }

        // Pillar 2: Periodization Architecture & Duration
        const methodNameMap = {
            CLINICAL: 'Periodizzazione Clinica Riabilitativa',
            LINEAR: 'Periodizzazione Lineare',
            BLOCK: 'Periodizzazione a Blocchi',
            DUP: 'Periodizzazione Ondulante Giornaliera (DUP)',
            CONJUGATE: 'Periodizzazione Coniugata',
            POLARIZED: 'Periodizzazione Polarizzata'
        };
        const methodName = methodNameMap[method] || 'Periodizzazione Strutturata';
        const p2 = ` È stato adottato un modello di ${methodName} distribuito su un macrociclo di ${weeks} settimane (${daysCount} sedute settimanali), organizzato in blocchi di carico progressivo alternati a microcicli di scarico attivo per favorire la supercompensazione neuromuscolare.`;

        // Pillar 3: Clinical & Biomechanical Prescriptions
        let p3 = '';
        const hasKneeInjury = injuries.some(id => id.includes('lca') || id.includes('rotulea') || id.includes('ginocchio') || id.includes('patellar') || id.includes('knee'));
        if (isClinical || hasKneeInjury) {
            p3 = ` In ottemperanza alle linee guida biomeccaniche per la tutela articolare (Escamilla et al.), nelle prime fasi del percorso la flessione del ginocchio è rigorosamente limitata a 60° max, privilegiando contrazioni isometriche ed eccentriche controllate per azzerare le forze di taglio nocive.`;
        }

        // Pillar 4: VBT & Velocity Loss Strategy
        let p4 = '';
        if (goal === 'Hypertrophy' || sport === 'Bodybuilding') {
            p4 = ` La gestione dell'intensità sfrutta i principi del Velocity-Based Training (VBT, González-Badillo & Sánchez-Medina 2010) con una perdita di velocità nei set contenuta (VL 20-30%), stimolando la massima risposta anabolica ed evitando l'affaticamento centrale eccessivo.`;
        } else if (goal === 'Strength' || goal === 'Power' || method === 'POLARIZED' || method === 'DUP') {
            p4 = ` Il controllo del carico utilizza i principi del Velocity-Based Training (VBT, González-Badillo 2010; Samozino 2011), monitorando la velocità di esecuzione e l'arresto della serie a basse perdite di velocità (VL 15-20%) per preservare la qualità neuromuscolare e le fibre veloci IIx.`;
        } else {
            p4 = ` Il dosaggio del carico monitora l'RPE e la velocità d'esecuzione per garantire una progressione sicura e sostenibile nel tempo.`;
        }

        return {
            fullText: `${p1}${p2}${p3}${p4}`,
            structured: {
                obiettivo: p1.trim(),
                architettura: p2.trim(),
                biomeccanica: p3.trim(),
                carico: p4.trim()
            }
        };
    };

    /**
     * Interroga la banca dati scientifica dinamica (window.App.scientificSources) e seleziona le evidenze rilevanti.
     */
    window.WorkoutGeneratorAI.prototype._generateTechnicalExplanations = function (params) {
        const explanations = [];
        const isClinical = params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano';
        const sport = params.sportPraticato || params.sport;
        const goal = params.goal;
        const injuries = params.injuries || [];

        // Fallback static data in case the dynamic database is not loaded
        if (!window.App || !window.App.scientificSources) {
            console.warn("[WorkoutGeneratorAI] Scientific sources database not found. Falling back to static explanations.");
            return this._getStaticExplanationsFallback(params);
        }

        // Filter and map scientific sources dynamically based on rules
        window.App.scientificSources.forEach(source => {
            let matches = true;

            if (source.rules) {
                // 1. Filter by Patient Type (Atleta vs Clinico)
                if (source.rules.patientTypes && source.rules.patientTypes.length > 0) {
                    const currentType = isClinical ? 'Clinico' : 'Atleta';
                    if (!source.rules.patientTypes.includes(currentType)) {
                        matches = false;
                    }
                }

                // 2. Filter by Sport
                if (matches && source.rules.sports && source.rules.sports.length > 0) {
                    if (!source.rules.sports.includes(sport)) {
                        matches = false;
                    }
                }

                // 3. Filter by Goal
                if (matches && source.rules.goals && source.rules.goals.length > 0) {
                    if (!source.rules.goals.includes(goal)) {
                        matches = false;
                    }
                }

                // 4. Filter by Injuries/Pathologies (Matches if at least one active injury matches rules)
                if (matches && source.rules.injuries && source.rules.injuries.length > 0) {
                    const hasMatchingInjury = injuries.some(id => source.rules.injuries.includes(id));
                    if (!hasMatchingInjury) {
                        matches = false;
                    }
                }
            }

            if (matches) {
                const referenceText = `${source.authors} (${source.year}). ${source.journal}.`;
                explanations.push({
                    category: source.area,
                    title: source.title,
                    text: `${source.abstract}\n\nRiferimento: ${referenceText} (${source.url})`,
                    citations: [
                        {
                            title: `${source.authors} (${source.year}) - ${source.title}`,
                            url: source.url
                        }
                    ],
                    sourceMetadata: {
                        id: source.id,
                        title: source.title,
                        authors: source.authors,
                        journal: source.journal,
                        year: source.year,
                    }
                });
            }
        });

        // Arricchimento semantico delle evidenze scientifiche tramite RAG Rationale Adapter (preservando tutti i calcoli)
        if (window.App && window.App.RAGRationaleAdapter && typeof window.App.RAGRationaleAdapter.enrichExplanations === 'function') {
            return window.App.RAGRationaleAdapter.enrichExplanations(explanations, params);
        }

        return explanations;
    };

    /**
     * Spiegazioni statiche di riserva con solida evidenza di letteratura scientifica.
     */
    window.WorkoutGeneratorAI.prototype._getStaticExplanationsFallback = function (params) {
        const explanations = [];
        const isClinical = params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano';
        const sport = params.sportPraticato || params.sport;
        const injuries = params.injuries || [];

        explanations.push({
            category: 'Periodizzazione',
            title: 'Struttura Mesocicli 3+1 (Carico & Scarico)',
            text: 'Il programma segue un modello di periodizzazione ondulata con blocchi di 4 settimane (3 di carico progressivo e 1 di scarico). Lo scarico sistematico permette il ripristino delle riserve di glicogeno, la rigenerazione del sistema nervoso centrale (SNC) e il rimodellamento dei tessuti connettivi, prevenendo il sovrallenamento e promuovendo la supercompensazione.'
        });

        if (!isClinical && sport === 'Endurance') {
            explanations.push({
                category: 'Sport: Endurance',
                title: 'Allenamento della Forza Submassimale ad Alta Intensità',
                text: 'Per gli atleti di endurance, l\'uso di carichi submassimali (>85% 1RM) con basse ripetizioni (3-6) e recuperi completi (2-3 min) migliora l\'economia del gesto atletico (running/cycling economy) e la rigidità tendinea (tendon stiffness) senza indurre ipertrofia sarcoplasmatica disfunzionale. La scelta di soli esercizi multiarticolari massimizza il transfer motorio.'
            });
        }

        if (!isClinical && sport === 'Sport di Squadra') {
            explanations.push({
                category: 'Sport: Sport di Squadra',
                title: 'Rate of Force Development (RFD) & Lavoro Unilaterale',
                text: 'Nei giochi di squadra, la priorità è lo sviluppo del Rate of Force Development (tasso di sviluppo della forza) tramite tempi esplosivi (es. X-0-1). Il focus su esercizi pliometrici e monolaterali rispecchia le richieste bio-meccaniche dello sport (accelerazioni, decelerazioni, cambi di direzione) e riduce i deficit di forza bilaterali.'
            });
        }

        if (!isClinical && sport === 'Bodybuilding') {
            explanations.push({
                category: 'Sport: Bodybuilding',
                title: 'Tensione Meccanica & Stress Metabolico',
                text: 'Il protocollo per il bodybuilding si focalizza sul range ipertrofico classico (8-12 rep, 70-80% 1RM) con tempi sotto tensione controllati (2-0-2) e pause ridotte (60-90s). Questo approccio ottimizza i due stimoli primari dell\'ipertrofia muscolare: la tensione meccanica sulle fibre e lo stress metabolico locale (accumulo di idrogenioni e lattato).'
            });
        }

        const hasKneePathology = injuries.some(id => 
            ['post_op_lca', 'lesione_lca', 'knee_generic', 'gonarthrosis', 'patellar_tendonitis', 'condromalacia_rotulea', 'meniscus'].includes(id)
        );
        if (isClinical && hasKneePathology) {
            explanations.push({
                category: 'Clinico: Ginocchio',
                title: 'Isometria ad Angolo Specifico per Tendinopatie e Post-Chirurgia',
                text: 'Nelle prime fasi cliniche del ginocchio, l\'uso di contrazioni isometriche (es. Wall Sit a 60°) ha un documentato effetto analgesico sul tendine rotuleo e attiva il quadricipite (in particolare il vasto mediale obliquo) senza indurre stress da taglio articolare o compressione femoro-rotulea eccessiva.'
            });
            explanations.push({
                category: 'Clinico: Ginocchio',
                title: 'Lavoro Eccentrico Controllato e Rimodellamento del Collagene',
                text: 'La transizione al lavoro eccentrico controllato (Fase 3, tempo 4-0-1) promuove il allineamento corretto delle fibre di collagene nel tendine/legamento in via di guarigione, aumenta la lunghezza dei fascicoli muscolari (prevenendo recidive) e migliora la capacità di decelerazione dell\'arto.'
            });
        }

        return explanations;
    };

})();
