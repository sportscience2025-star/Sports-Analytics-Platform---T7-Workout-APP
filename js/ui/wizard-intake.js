/**
 * wizard-intake.js
 * ═══════════════════════════════════════════════════════════════════
 * Wizard guidato a 5 step per la creazione del profilo atleta/paziente.
 *
 * STEP COPERTI:
 *   Step 1 - "Chi sei?" (tipo soggetto: Atleta/Clinico/Senior/Junior/Sedentario, esperienza)
 *   Step 2 - "Struttura" (giorni/sett, attrezzatura, profilo forza, condizionamento cardio)
 *   Step 3 - "Salute" (patologie via ClinicalManager, scala dolore VAS 0-10)
 *   Step 4 - "Obiettivi" (goal primario, descrizione libera, durata in settimane)
 *   Step 5 - "Stile di Vita" (sonno, stress, alimentazione, attività extra)
 *
 * FUNZIONI ESPOSTE:
 *   - window.App.renderWizard(containerId, onSubmit?)
 *
 * FUNZIONI INTERNE:
 *   - collectData()     -> raccoglie tutti i valori dal form in un oggetto parametri
 *   - renderSummary()   -> popola il riepilogo nello Step 5
 *   - updateUI()        -> aggiorna barra progresso, step attivo, pulsanti nav
 *   - generateProgram() -> chiama window.AI.generateFullProgram() e gestisce overlay/errori
 *
 * DIPENDENZE:
 *   - window.ClinicalManager (da clinical.js) per Step 3
 *   - window.AI.generateFullProgram() (da logic.js) per la generazione
 *   - window.App.saveProgramState() (da wizard-state.js) per il salvataggio
 *   - window.App.renderProgramResult() (da wizard.js) per mostrare il risultato
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};

    const TOTAL_STEPS = 5;
    const STATUS_MESSAGE_INTERVAL_MS = 900;
    const SIMULATED_DELAY_MS = 1500;

    /**
     * Inietta gli stili scoped del wizard intake nel DOM se non già presenti
     */
    function injectIntakeStyles() {
        if (document.getElementById('intake-wizard-styles')) return;

        const s = document.createElement('style');
        s.id = 'intake-wizard-styles';
        s.textContent = `
            .intake-wrapper{display:flex;min-height:calc(100vh - 80px);}
            .intake-sidebar{width:260px;flex-shrink:0;background:linear-gradient(160deg,#0f172a 0%,#1e293b 100%);border-right:1px solid var(--border);padding:2.5rem 1.75rem;display:flex;flex-direction:column;}
            .intake-logo{font-size:2.5rem;margin-bottom:1rem;}
            .intake-sidebar-title{font-size:1.1rem;font-weight:700;color:var(--text-primary);line-height:1.3;margin-bottom:.75rem;}
            .intake-sidebar-sub{font-size:.8rem;color:var(--text-muted);line-height:1.5;margin-bottom:2rem;}
            .intake-steps-nav{display:flex;flex-direction:column;gap:.25rem;}
            .step-nav-item{display:flex;align-items:center;gap:.75rem;padding:.6rem .75rem;border-radius:8px;transition:background .2s;}
            .step-nav-item.active{background:rgba(16,185,129,.12);}
            .step-nav-item.done{background:rgba(16,185,129,.06);}
            .step-nav-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;flex-shrink:0;background:var(--border);color:var(--text-muted);transition:all .3s;}
            .step-nav-item.active .step-nav-dot{background:var(--accent);color:#fff;}
            .step-nav-item.done .step-nav-dot{background:#10b981;color:#fff;}
            .step-nav-item span{font-size:.85rem;color:var(--text-muted);}
            .step-nav-item.active span,.step-nav-item.done span{color:var(--text-primary);font-weight:500;}
            .intake-main{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--bg-dark);}
            .intake-progress-bar-wrap{height:4px;background:var(--border);flex-shrink:0;}
            .intake-progress-bar{height:100%;background:linear-gradient(90deg,#10b981,#06d6a0);transition:width .4s ease;}
            .intake-step-panel{display:none;flex:1;overflow-y:auto;padding:2.5rem;animation:fadeIn .3s ease;}
            .intake-step-panel.active{display:flex;flex-direction:column;gap:1.75rem;}
            .intake-step-header{display:flex;flex-direction:column;align-items:flex-start;padding-bottom:1.25rem;border-bottom:1px solid var(--border);}
            .intake-step-header h3{font-size:1.4rem;font-weight:700;color:var(--text-primary);margin:0 0 .3rem;}
            .intake-step-header p{font-size:.9rem;color:var(--text-muted);margin:0;}
            .intake-field-group{display:flex;flex-direction:column;gap:.75rem;}
            .intake-label{font-size:.9rem;font-weight:600;color:var(--text-primary);}
            .label-opt{font-weight:400;color:var(--text-muted);font-size:.82rem;margin-left:.35rem;}
            .intake-cards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.75rem;}
            .intake-cards-grid.cols-3{grid-template-columns:repeat(3,1fr);}
            .intake-cards-grid.cols-4{grid-template-columns:repeat(4,1fr);}
            .intake-cards-grid.cols-5{grid-template-columns:repeat(5,1fr);}
            .intake-option-card{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:.4rem;padding:1.25rem 1rem;border:1.5px solid var(--border);border-radius:12px;cursor:pointer;transition:all .25s ease;background:rgba(255,255,255,.02);position:relative;min-height:84px;box-sizing:border-box;}
            .intake-option-card input{position:absolute;opacity:0;pointer-events:none;}
            .intake-option-card:hover{border-color:rgba(6,214,160,.4);background:rgba(6,214,160,.04);transform:translateY(-2px);}
            .intake-option-card.selected{border-color:var(--accent);background:rgba(6,214,160,.08);box-shadow:0 0 0 1px var(--accent),0 4px 16px -2px rgba(6,214,160,.15);}
            .intake-option-card.compact{padding:.85rem .65rem;gap:.25rem;min-height:64px;}
            .intake-option-card strong{font-size:.92rem;font-weight:600;color:var(--text-primary);line-height:1.3;}
            .intake-option-card small{font-size:.78rem;color:var(--text-muted);line-height:1.35;}
            .day-num{font-size:1.6rem;font-weight:800;color:var(--accent);}
            .intake-row-2{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;}
            .intake-health-notice{display:flex;align-items:center;gap:.6rem;padding:.75rem 1rem;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.25);border-radius:8px;font-size:.83rem;color:#f59e0b;}
            .pain-scale-wrap{display:flex;flex-direction:column;gap:.5rem;}
            .pain-slider{width:100%;accent-color:var(--accent);height:6px;}
            .pain-labels{display:flex;justify-content:space-between;font-size:.8rem;color:var(--text-muted);}
            .intake-textarea{width:100%;padding:1rem;border-radius:10px;border:1px solid var(--border);background:rgba(0,0,0,.2);color:var(--text-primary);font-family:inherit;font-size:.9rem;line-height:1.6;resize:vertical;transition:border-color .2s;box-sizing:border-box;}
            .intake-textarea:focus{border-color:var(--accent);outline:none;}
            .intake-hint{font-size:.8rem;color:var(--text-muted);}
            .intake-summary-box{background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);border-radius:12px;padding:1.25rem;margin-top:.5rem;}
            .intake-summary-box h4{font-size:.9rem;color:var(--accent);margin:0 0 .75rem;}
            .summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.6rem;}
            .summary-item{display:flex;flex-direction:column;gap:.2rem;}
            .summary-item .s-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);}
            .summary-item .s-value{font-size:.88rem;font-weight:600;color:var(--text-primary);}
            .intake-nav-footer{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 2.5rem;border-top:1px solid var(--border);background:rgba(0,0,0,.1);flex-shrink:0;}
            .intake-btn-back{padding:.65rem 1.5rem;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text-muted);font-size:.9rem;cursor:pointer;transition:all .2s;}
            .intake-btn-back:hover{background:rgba(255,255,255,.05);color:var(--text-primary);}
            .step-counter{font-size:.82rem;color:var(--text-muted);}
            .intake-btn-next{padding:.7rem 2rem;border:none;border-radius:8px;background:var(--accent);color:#fff;font-size:.95rem;font-weight:600;cursor:pointer;transition:all .2s;}
            .intake-btn-next:hover{background:#059669;transform:translateY(-1px);}
            .intake-btn-next.generate{background:linear-gradient(135deg,#10b981,#6366f1);}
            .gen-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:999;backdrop-filter:blur(6px);}
            .gen-overlay.hidden{display:none;}
            .gen-spinner-box{text-align:center;background:var(--surface);padding:3rem;border-radius:16px;border:1px solid var(--border);max-width:320px;}
            .gen-spinner{width:56px;height:56px;border:4px solid rgba(255,255,255,.1);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 1.25rem;}
            .gen-spinner-box p{font-weight:600;color:var(--text-primary);margin:0 0 .5rem;}
            .gen-spinner-box small{color:var(--text-muted);font-size:.82rem;}
            @keyframes spin{to{transform:rotate(360deg);}}
            @media(max-width:768px){
                .intake-wrapper{flex-direction:column;}
                .intake-sidebar{width:100%;padding:1.25rem 1.5rem;}
                .intake-steps-nav{flex-direction:row;flex-wrap:wrap;gap:.5rem;}
                .intake-step-panel{padding:1.25rem;}
                .intake-row-2{grid-template-columns:1fr;}
                .intake-cards-grid.cols-4,.intake-cards-grid.cols-5{grid-template-columns:repeat(2,1fr);}
                .intake-nav-footer{padding:1rem 1.25rem;}
            }
            @media(max-width:540px){
                .intake-cards-grid.cols-3{grid-template-columns:repeat(2,1fr);}
                .intake-cards-grid.cols-3 label:last-child:nth-child(odd){grid-column:span 2;}
            }
            @media(max-width:380px){
                .intake-cards-grid.cols-3,.intake-cards-grid.cols-4,.intake-cards-grid.cols-5{grid-template-columns:1fr;}
                .intake-cards-grid.cols-3 label:last-child:nth-child(odd){grid-column:auto;}
            }
        `;
        document.head.appendChild(s);
    }

    /**
     * Renderizza il wizard guidato a 5 step per la creazione del programma di allenamento
     * @param {string} containerId - ID dell'elemento DOM contenitore del wizard
     * @param {Function} [onSubmit] - Callback opzionale invocata al completamento della generazione
     * @returns {void}
     */
    window.App.renderWizard = function (containerId, onSubmit) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Ripristino eventuali patologie caricate dalla vista clinica
        let preloadedInjuries = [];
        try {
            const temp = localStorage.getItem('t7_temp_pathologies');
            if (temp) {
                preloadedInjuries = JSON.parse(temp);
                localStorage.removeItem('t7_temp_pathologies');
            }
        } catch (_) {}

        // Ripristino parametri precedentemente salvati
        let saved = {};
        try {
            const raw = localStorage.getItem('t7_prog_params');
            if (raw) saved = JSON.parse(raw);
            if (preloadedInjuries.length) saved.injuries = preloadedInjuries;
        } catch (_) {}

        let currentStep = 1;

        // Render template HTML
        container.innerHTML = `
            <div class="intake-wrapper">
                <aside class="intake-sidebar">
                    <div class="intake-logo"><span class="logo-accent">T7</span></div>
                    <h2 class="intake-sidebar-title">Programmazione<br>Intelligente</h2>
                    <p class="intake-sidebar-sub">Rispondi a 5 domande guidate. L'IA costruirà la scheda perfetta per te.</p>
                    <nav class="intake-steps-nav" id="steps-nav">
                        ${['Chi sei?', 'Struttura', 'Salute', 'Obiettivi', 'Stile'].map((label, i) => `
                            <div class="step-nav-item ${i === 0 ? 'active' : ''}" data-step="${i+1}">
                                <div class="step-nav-dot">${i+1}</div>
                                <span>${label}</span>
                            </div>`).join('')}
                    </nav>
                </aside>

                <main class="intake-main">
                    <div class="intake-progress-bar-wrap">
                        <div class="intake-progress-bar" id="intake-pbar" style="width:20%"></div>
                    </div>

                    <!-- STEP 1: Chi sei? -->
                    <section class="intake-step-panel active" id="step-1">
                        <div class="intake-step-header">
                            <div><h3>Chi sei?</h3><p>Dimmi chi usa questo programma così posso adattare tutto al tuo profilo.</p></div>
                        </div>
                        <div class="intake-field-group">
                            <label class="intake-label">Tipo di Soggetto</label>
                            <div class="intake-cards-grid">
                                <label class="intake-option-card ${(saved.patientType||'Atleta')==='Atleta'?'selected':''}">
                                    <input type="radio" name="patientType" value="Atleta" ${(saved.patientType||'Atleta')==='Atleta'?'checked':''}><strong>Atleta / Fitness</strong><small>Cerco performance, massa o forza</small></label>
                                <label class="intake-option-card ${saved.patientType==='Clinico'?'selected':''}">
                                    <input type="radio" name="patientType" value="Clinico" ${saved.patientType==='Clinico'?'checked':''}><strong>Paziente Clinico</strong><small>Ho patologie o necessito riabilitazione</small></label>
                                <label class="intake-option-card ${saved.patientType==='Anziano'?'selected':''}">
                                    <input type="radio" name="patientType" value="Anziano" ${saved.patientType==='Anziano'?'checked':''}><strong>Senior (60+)</strong><small>Mantenimento e mobilità</small></label>
                                <label class="intake-option-card ${saved.patientType==='Junior'?'selected':''}">
                                    <input type="radio" name="patientType" value="Junior" ${saved.patientType==='Junior'?'checked':''}><strong>Junior (&lt; 18 anni)</strong><small>Programma età evolutiva</small></label>
                                <label class="intake-option-card ${saved.patientType==='Sedentario'?'selected':''}">
                                    <input type="radio" name="patientType" value="Sedentario" ${saved.patientType==='Sedentario'?'checked':''}><strong>Runner Amatoriale/Sedentario</strong><small>Corsa leggera o sedentarietà</small></label>
                                <label class="intake-option-card ${saved.patientType==='Clinico_Anziano'?'selected':''}">
                                    <input type="radio" name="patientType" value="Clinico_Anziano" ${saved.patientType==='Clinico_Anziano'?'checked':''}><strong>Pazienti Clinici / Anziani</strong><small>Riabilitazione e terza età avanzata</small></label>
                            </div>
                        </div>
                        <div class="intake-field-group" id="sport-praticato-group" style="display: none;">
                            <label class="intake-label">Sport Praticato</label>
                            <div class="intake-cards-grid cols-3">
                                <label class="intake-option-card compact ${(saved.sportPraticato||'Bodybuilding')==='Bodybuilding'?'selected':''}">
                                    <input type="radio" name="sportPraticato" value="Bodybuilding" ${(saved.sportPraticato||'Bodybuilding')==='Bodybuilding'?'checked':''}><strong>Bodybuilding</strong><small>Ipertrofia e isolamento</small>
                                </label>
                                <label class="intake-option-card compact ${saved.sportPraticato==='Endurance'?'selected':''}">
                                    <input type="radio" name="sportPraticato" value="Endurance" ${saved.sportPraticato==='Endurance'?'checked':''}><strong>Endurance</strong><small>Resistenza e multiarticolari</small>
                                </label>
                                <label class="intake-option-card compact ${saved.sportPraticato==='Sport di Squadra'?'selected':''}">
                                    <input type="radio" name="sportPraticato" value="Sport di Squadra" ${saved.sportPraticato==='Sport di Squadra'?'checked':''}><strong>Sport di Squadra</strong><small>Esplosività e pliometria</small>
                                </label>
                                <label class="intake-option-card compact ${saved.sportPraticato==='Calcio'?'selected':''}">
                                    <input type="radio" name="sportPraticato" value="Calcio" ${saved.sportPraticato==='Calcio'?'checked':''}><strong>Calcio</strong><small>Agilità e scatti</small>
                                </label>
                                <label class="intake-option-card compact ${saved.sportPraticato==='Basketball'?'selected':''}">
                                    <input type="radio" name="sportPraticato" value="Basketball" ${saved.sportPraticato==='Basketball'?'checked':''}><strong>Basket</strong><small>Elevazione e cambi direzione</small>
                                </label>
                                <label class="intake-option-card compact ${saved.sportPraticato==='Atletica Leggera'?'selected':''}">
                                    <input type="radio" name="sportPraticato" value="Atletica Leggera" ${saved.sportPraticato==='Atletica Leggera'?'checked':''}><strong>Atletica Sprint</strong><small>Velocità e accelerazione</small>
                                </label>
                            </div>
                        </div>
                        <div class="intake-field-group">
                            <label class="intake-label">Esperienza di Allenamento</label>
                            <div class="intake-cards-grid cols-4">
                                <label class="intake-option-card ${saved.level==='Beginner'?'selected':''}"><input type="radio" name="level" value="Beginner" ${saved.level==='Beginner'?'checked':''}><strong>Principiante</strong><small>0 – 6 mesi</small></label>
                                <label class="intake-option-card ${(saved.level==='Intermediate'||!saved.level)?'selected':''}"><input type="radio" name="level" value="Intermediate" ${(saved.level==='Intermediate'||!saved.level)?'checked':''}><strong>Intermedio</strong><small>6 – 24 mesi</small></label>
                                <label class="intake-option-card ${saved.level==='Advanced'?'selected':''}"><input type="radio" name="level" value="Advanced" ${saved.level==='Advanced'?'checked':''}><strong>Avanzato</strong><small>&gt; 2 anni</small></label>
                                <label class="intake-option-card ${saved.level==='Elite'?'selected':''}"><input type="radio" name="level" value="Elite" ${saved.level==='Elite'?'checked':''}><strong>Elite</strong><small>Competitivo</small></label>
                            </div>
                        </div>
                    </section>

                    <!-- STEP 2: Struttura -->
                    <section class="intake-step-panel" id="step-2">
                        <div class="intake-step-header">
                            <div><h3>Come vuoi allenarti?</h3><p>Definiamo la struttura settimanale, l'attrezzatura e il profilo di forza.</p></div>
                        </div>
                        <div class="intake-field-group">
                            <label class="intake-label">Giorni disponibili a settimana</label>
                            <div class="intake-cards-grid cols-5">
                                ${[2,3,4,5,6].map(d=>`<label class="intake-option-card compact ${(saved.days||3)==d?'selected':''}"><input type="radio" name="days" value="${d}" ${(saved.days||3)==d?'checked':''}><strong class="day-num">${d}</strong><small>${{2:'Full Body',3:'PPL',4:'Upper/Lower',5:'Hybrid',6:'PPL×2'}[d]}</small></label>`).join('')}
                            </div>
                        </div>
                        <div class="intake-field-group">
                            <label class="intake-label">Attrezzatura disponibile</label>
                            <div class="intake-cards-grid cols-4">
                                <label class="intake-option-card ${(saved.equipment||'Full')==='Full'?'selected':''}"><input type="radio" name="equipment" value="Full" ${(saved.equipment||'Full')==='Full'?'checked':''}><strong>Palestra Completa</strong><small>Tutto disponibile</small></label>
                                <label class="intake-option-card ${saved.equipment==='Minimal'?'selected':''}"><input type="radio" name="equipment" value="Minimal" ${saved.equipment==='Minimal'?'checked':''}><strong>Minimal</strong><small>Bilanciere + Manubri</small></label>
                                <label class="intake-option-card ${saved.equipment==='Calisthenics'?'selected':''}"><input type="radio" name="equipment" value="Calisthenics" ${saved.equipment==='Calisthenics'?'checked':''}><strong>Corpo Libero</strong><small>Calisthenics</small></label>
                                <label class="intake-option-card ${saved.equipment==='Home'?'selected':''}"><input type="radio" name="equipment" value="Home" ${saved.equipment==='Home'?'checked':''}><strong>Home Gym</strong><small>Attrezzatura casa</small></label>
                            </div>
                        </div>
                        <div class="intake-row-2">
                            <div class="intake-field-group">
                                <label class="intake-label">Profilo Forza Stimato</label>
                                <div class="intake-cards-grid cols-3">
                                    <label class="intake-option-card compact ${saved.strengthProfile==='Low'?'selected':''}"><input type="radio" name="strength_profile" value="Low" ${saved.strengthProfile==='Low'?'checked':''}><strong>Bassa</strong><small>Focus tecnica</small></label>
                                    <label class="intake-option-card compact ${(saved.strengthProfile==='Medium'||!saved.strengthProfile)?'selected':''}"><input type="radio" name="strength_profile" value="Medium" ${(saved.strengthProfile==='Medium'||!saved.strengthProfile)?'checked':''}><strong>Media</strong><small>Bilanciata</small></label>
                                    <label class="intake-option-card compact ${saved.strengthProfile==='High'?'selected':''}"><input type="radio" name="strength_profile" value="High" ${saved.strengthProfile==='High'?'checked':''}><strong>Alta</strong><small>&gt; 80% 1RM</small></label>
                                </div>
                            </div>
                            <div class="intake-field-group">
                                <label class="intake-label">Condizionamento Cardio</label>
                                <div class="intake-cards-grid cols-4">
                                    ${[['None','Nessuno'],['Low','Leggero'],['Moderate','Moderato'],['High','HIIT']].map(([v,la])=>`<label class="intake-option-card compact ${(saved.conditioning||'Moderate')===v?'selected':''}"><input type="radio" name="conditioning" value="${v}" ${(saved.conditioning||'Moderate')===v?'checked':''}><strong>${la}</strong></label>`).join('')}
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- STEP 3: Salute -->
                    <section class="intake-step-panel" id="step-3">
                        <div class="intake-step-header">
                            <div><h3>Stato di Salute</h3><p>Seleziona eventuali limitazioni fisiche. L'IA adatterà automaticamente esercizi e fasi.</p></div>
                        </div>
                        <div class="intake-health-notice">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <span>Queste informazioni sono usate solo per adattare il programma. Se hai dubbi, consulta il tuo medico.</span>
                        </div>
                        <div class="intake-field-group">
                            <label class="intake-label">Limitazioni fisiche o patologie <span class="label-opt">(opzionale — seleziona quelle che ti riguardano)</span></label>
                            
                            <!-- IMPACT SUMMARY WIDGET -->
                            <div id="impact-widget" class="impact-summary section" style="margin-top: 1rem; border: 1px solid var(--border); border-radius: 12px; background: rgba(15, 23, 42, 0.4); padding: 1.5rem;">
                                <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
                                    <div class="impact-card">
                                        <div class="stat-value" id="stat-excluded">0</div>
                                        <div class="stat-label">Esercizi Esclusi</div>
                                    </div>
                                    <div class="impact-card">
                                        <div class="stat-value" id="stat-adapted">0</div>
                                        <div class="stat-label">Esercizi Adattati</div>
                                    </div>
                                    <div class="impact-card">
                                        <div class="stat-value" id="stat-risk">-</div>
                                        <div class="stat-label">Livello Rischio</div>
                                    </div>
                                </div>
                            </div>

                            <!-- CLINICAL GRID -->
                            <div id="clinical-grid-container" style="margin-top: 1.5rem;"></div>
                        </div>
                        <div class="intake-field-group" style="margin-top:1.5rem">
                            <label class="intake-label">Intensità del dolore attuale</label>
                            <div class="pain-scale-wrap">
                                <input type="range" id="pain-scale" name="painScale" min="0" max="10" value="${saved.painScale||0}" class="pain-slider">
                                <div class="pain-labels"><span>0 – Nessun dolore</span><span id="pain-val">${saved.painScale||0}/10</span><span>10 – Dolore severo</span></div>
                            </div>
                        </div>
                    </section>

                    <!-- STEP 4: Obiettivi -->
                    <section class="intake-step-panel" id="step-4">
                        <div class="intake-step-header">
                            <div><h3>Qual è il tuo obiettivo?</h3><p>Scegli l'obiettivo principale e descrivilo con le tue parole per una scheda su misura.</p></div>
                        </div>
                        <div class="intake-field-group">
                            <label class="intake-label">Obiettivo Primario</label>
                            <div class="intake-cards-grid">
                                ${[['Hypertrophy','Ipertrofia','Aumentare massa muscolare'],['Strength','Forza','Alzare carichi massimali'],['Resistenza','Resistenza','Resistenza muscolare'],['Power','Potenza','Esplosività e sport'],['Definition','Definizione','Tonicità e composizione'],['Rehab','Recupero','Guarire e tornare normale']].map(([v,la,desc])=>`<label class="intake-option-card ${(saved.goal||'Hypertrophy')===v?'selected':''}"><input type="radio" name="goal" value="${v}" ${(saved.goal||'Hypertrophy')===v?'checked':''}><strong>${la}</strong><small>${desc}</small></label>`).join('')}
                            </div>
                        </div>
                        <div class="intake-field-group">
                            <label class="intake-label" for="p-objective">Descrivi il tuo obiettivo con parole tue <span class="label-opt">(opzionale ma consigliato)</span></label>
                            <textarea id="p-objective" name="patientObjective" rows="4" class="intake-textarea" placeholder="Es. &quot;Ho 45 anni, ho un'ernia al disco L4-L5 e voglio tornare a correre senza dolore.&quot;">${saved.patientObjective||''}</textarea>
                            <small class="intake-hint">L'IA legge questo testo per adattare le fasi e la progressione.</small>
                        </div>
                        <div class="intake-field-group">
                            <label class="intake-label">Orizzonte temporale del programma</label>
                            <div class="intake-cards-grid cols-4">
                                ${[['4','4 settimane','Sprint rapido'],['8','8 settimane','Ciclo standard'],['12','12 settimane','Pianificazione completa'],['16','16 settimane','Prep. avanzata']].map(([v,la,desc])=>`<label class="intake-option-card compact ${(saved.weeks||'12')===v?'selected':''}"><input type="radio" name="weeks" value="${v}" ${(saved.weeks||'12')===v?'checked':''}><strong>${la}</strong><small>${desc}</small></label>`).join('')}
                            </div>
                        </div>
                    </section>

                    <!-- STEP 5: Stile di Vita -->
                    <section class="intake-step-panel" id="step-5">
                        <div class="intake-step-header">
                            <div><h3>Stile di Vita</h3><p>Questi fattori influenzano il recupero e il volume ottimale settimanale.</p></div>
                        </div>
                        <div class="intake-row-2">
                            <div class="intake-field-group">
                                <label class="intake-label">Qualità del sonno</label>
                                <div class="intake-cards-grid cols-3">
                                    ${[['poor','Scarso (<6h)'],['ok','Buono (6-7h)'],['great','Ottimo (7-9h)']].map(([v,la])=>`<label class="intake-option-card compact ${(saved.sleep||'ok')===v?'selected':''}"><input type="radio" name="sleep" value="${v}" ${(saved.sleep||'ok')===v?'checked':''}><strong>${la}</strong></label>`).join('')}
                                </div>
                            </div>
                            <div class="intake-field-group">
                                <label class="intake-label">Livello di Stress</label>
                                <div class="intake-cards-grid cols-3">
                                    ${[['low','Basso'],['moderate','Moderato'],['high','Alto']].map(([v,la])=>`<label class="intake-option-card compact ${(saved.stress||'moderate')===v?'selected':''}"><input type="radio" name="stress" value="${v}" ${(saved.stress||'moderate')===v?'checked':''}><strong>${la}</strong></label>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="intake-row-2">
                            <div class="intake-field-group">
                                <label class="intake-label">Regime alimentare</label>
                                <div class="intake-cards-grid cols-3">
                                    ${[['deficit','Ipocalorica'],['maintenance','Mantenimento'],['surplus','Ipercalorica']].map(([v,la])=>`<label class="intake-option-card compact ${(saved.nutrition||'maintenance')===v?'selected':''}"><input type="radio" name="nutrition" value="${v}" ${(saved.nutrition||'maintenance')===v?'checked':''}><strong>${la}</strong></label>`).join('')}
                                </div>
                            </div>
                            <div class="intake-field-group">
                                <label class="intake-label">Attività extra-palestra</label>
                                <div class="intake-cards-grid cols-3">
                                    ${[['sedentary','Sedentario'],['active','Attivo'],['very_active','Molto attivo']].map(([v,la])=>`<label class="intake-option-card compact ${(saved.activity||'active')===v?'selected':''}"><input type="radio" name="activity" value="${v}" ${(saved.activity||'active')===v?'checked':''}><strong>${la}</strong></label>`).join('')}
                                </div>
                            </div>
                        </div>
                        <!-- RIEPILOGO -->
                        <div class="intake-summary-box">
                            <h4>Riepilogo del tuo profilo</h4>
                            <div id="summary-content" class="summary-grid"></div>
                        </div>
                    </section>

                    <!-- FOOTER NAV -->
                    <div class="intake-nav-footer">
                        <button type="button" id="btn-back" class="intake-btn-back" style="visibility:hidden">← Indietro</button>
                        <span class="step-counter" id="step-counter">Step 1 di ${TOTAL_STEPS}</span>
                        <button type="button" id="btn-next" class="intake-btn-next">Avanti →</button>
                    </div>
                </main>
            </div>

            <!-- GENERATION OVERLAY -->
            <div id="gen-overlay" class="gen-overlay hidden">
                <div class="gen-spinner-box">
                    <div class="gen-spinner"></div>
                    <p>L'IA sta costruendo il tuo programma...</p>
                    <small id="gen-status-msg">Analisi del profilo clinico in corso...</small>
                </div>
            </div>

            <!-- RESULT CONTAINER -->
            <div id="prog-result" class="prog-result hidden"></div>
        `;

        // Inietta CSS
        injectIntakeStyles();

        // ── Funzione interna: Raccolta dati form ──
        function collectData() {
            const get = name => {
                const el = container.querySelector(`[name="${name}"]:checked`);
                return el ? el.value : null;
            };
            return {
                patientType: get('patientType') || 'Atleta',
                sportPraticato: get('sportPraticato') || 'Bodybuilding',
                level: get('level') || 'Intermediate',
                days: parseInt(get('days') || 3, 10),
                equipment: get('equipment') || 'Full',
                strength_profile: get('strength_profile') || 'Medium',
                conditioning: get('conditioning') || 'Moderate',
                injuries: window.ClinicalManager ? window.ClinicalManager.selectedConditions : [],
                painScale: parseInt(container.querySelector('#pain-scale')?.value || 0, 10),
                goal: get('goal') || 'Hypertrophy',
                weeks: get('weeks') || '12',
                patientObjective: container.querySelector('[name="patientObjective"]')?.value || '',
                sleep: get('sleep') || 'ok',
                stress: get('stress') || 'moderate',
                nutrition: get('nutrition') || 'maintenance',
                activity: get('activity') || 'active'
            };
        }

        // ── Funzione interna: Popola riepilogo step 5 ──
        function renderSummary() {
            const d = collectData();
            const el = container.querySelector('#summary-content');
            if (!el) return;
            const items = [
                ['Profilo', d.patientType],
                ['Esperienza', d.level],
                ['Giorni/sett.', d.days],
                ['Attrezzatura', d.equipment],
                ['Obiettivo', d.goal],
                ['Settimane', d.weeks],
                ['Patologie', d.injuries.length ? `${d.injuries.length} selezionate` : 'Nessuna'],
                ['Sonno', d.sleep],
                ['Stress', d.stress],
                ['Cardio', d.conditioning]
            ];
            el.innerHTML = items.map(([l, v]) => `
                <div class="summary-item">
                    <span class="s-label">${l}</span>
                    <span class="s-value">${v}</span>
                </div>
            `).join('');
        }

        // ── Funzione interna: Aggiorna UI dello step ──
        function updateUI() {
            container.querySelector('#intake-pbar').style.width = (currentStep / TOTAL_STEPS * 100) + '%';
            container.querySelector('#step-counter').textContent = `Step ${currentStep} di ${TOTAL_STEPS}`;
            container.querySelectorAll('.intake-step-panel').forEach((p, i) => p.classList.toggle('active', i + 1 === currentStep));
            container.querySelectorAll('.step-nav-item').forEach((item, i) => {
                item.classList.remove('active', 'done');
                if (i + 1 === currentStep) item.classList.add('active');
                else if (i + 1 < currentStep) item.classList.add('done');
            });
            const btnBack = container.querySelector('#btn-back');
            btnBack.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
            const btnNext = container.querySelector('#btn-next');
            if (currentStep === TOTAL_STEPS) {
                btnNext.textContent = 'Genera Programma';
                btnNext.classList.add('generate');
            } else {
                btnNext.textContent = 'Avanti →';
                btnNext.classList.remove('generate');
            }
            if (currentStep === TOTAL_STEPS) renderSummary();
        }

        // ── Inizializzazione ClinicalManager ──
        if (window.ClinicalManager) {
            try {
                window.ClinicalManager.init('clinical-grid-container', saved.injuries || []);
                const conditions = window.App.getConditions ? window.App.getConditions() : [];
                const categories = [...new Set(conditions.map(c => c.category))];
                categories.forEach(cat => window.ClinicalManager.updateCategoryCounter(cat));
            } catch (clinicalErr) {
                console.error('[T7] Errore inizializzazione ClinicalManager:', clinicalErr);
                const gridEl = document.getElementById('clinical-grid-container');
                if (gridEl) {
                    gridEl.innerHTML = `
                        <div style="padding: 1.5rem; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; background: rgba(239, 68, 68, 0.08); text-align: center;">
                            <p style="color: #f87171; font-weight: 600; margin-bottom: 0.5rem;">Impossibile caricare la sezione patologie</p>
                            <p style="color: var(--text-secondary); font-size: 0.85rem;">Prova a ricaricare la pagina (Ctrl + F5).</p>
                        </div>
                    `;
                }
            }
        }

        function toggleSportPraticato(patientType) {
            const sportGroup = container.querySelector('#sport-praticato-group');
            if (sportGroup) {
                sportGroup.style.display = (patientType === 'Atleta') ? 'block' : 'none';
            }
        }

        // ── Listener click cards radio ──
        container.querySelectorAll('.intake-option-card').forEach(card => {
            card.addEventListener('click', () => {
                const input = card.querySelector('input[type="radio"]');
                if (input) {
                    container.querySelectorAll(`[name="${input.name}"]`).forEach(el => el.closest('.intake-option-card')?.classList.remove('selected'));
                    input.checked = true;
                    card.classList.add('selected');

                    if (input.name === 'patientType') {
                        toggleSportPraticato(input.value);
                    }
                }
            });
        });

        // Imposta visualizzazione iniziale Sport Praticato
        toggleSportPraticato(saved.patientType || 'Atleta');

        // Slider del dolore
        const painSlider = container.querySelector('#pain-scale');
        const painVal = container.querySelector('#pain-val');
        if (painSlider && painVal) {
            painSlider.addEventListener('input', () => {
                painVal.textContent = painSlider.value + '/10';
            });
        }

        // Navigazione tra gli step
        container.querySelector('#btn-back').addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateUI();
            }
        });

        container.querySelector('#btn-next').addEventListener('click', async () => {
            if (currentStep < TOTAL_STEPS) {
                currentStep++;
                updateUI();
            } else {
                await generateProgram();
            }
        });

        // ── Invocazione Generatore AI ──
        async function generateProgram() {
            const d = collectData();
            const isRehab = d.goal === 'Rehab';
            const params = {
                days: d.days,
                goal: isRehab ? 'Resistenza' : d.goal,
                level: d.level,
                equipment: d.equipment,
                conditioning: d.conditioning,
                strengthProfile: d.strength_profile,
                injuries: d.injuries,
                patientObjective: d.patientObjective + (isRehab ? ' recupero guarire riabilitazione' : ''),
                patientType: d.patientType,
                sportPraticato: d.sportPraticato,
                weeks: d.weeks,
                sleep: d.sleep,
                stress: d.stress,
                nutrition: d.nutrition,
                activity: d.activity,
                painScale: d.painScale
            };

            try {
                localStorage.setItem('t7_prog_params', JSON.stringify({
                    patientType: d.patientType,
                    sportPraticato: d.sportPraticato,
                    level: d.level,
                    days: d.days,
                    equipment: d.equipment,
                    conditioning: d.conditioning,
                    strengthProfile: d.strength_profile,
                    goal: d.goal,
                    weeks: d.weeks,
                    patientObjective: d.patientObjective,
                    sleep: d.sleep,
                    stress: d.stress,
                    nutrition: d.nutrition,
                    activity: d.activity,
                    injuries: d.injuries
                }));
            } catch (e) {
                console.warn('[T7] Impossibile salvare i parametri in localStorage', e);
            }

            const overlay = container.querySelector('#gen-overlay');
            overlay.classList.remove('hidden');
            const msgs = [
                'Analisi del profilo clinico...',
                'Selezione esercizi in base alle patologie...',
                'Costruzione della progressione...',
                'Applicazione vincoli di sicurezza...',
                'Finalizzazione del programma...'
            ];
            let mi = 0;
            const msgEl = container.querySelector('#gen-status-msg');
            const msgInt = setInterval(() => {
                mi = (mi + 1) % msgs.length;
                if (msgEl && msgEl.isConnected) msgEl.textContent = msgs[mi];
                else clearInterval(msgInt);
            }, STATUS_MESSAGE_INTERVAL_MS);

            try {
                await new Promise(r => setTimeout(r, SIMULATED_DELAY_MS));
                if (!window.AI || !window.AI.generateFullProgram) {
                    throw new Error('Modulo AI non caricato. Ricarica la pagina.');
                }
                const program = await window.AI.generateFullProgram(params);

                if (window.App.saveProgramState) {
                    window.App.saveProgramState(program);
                } else {
                    if (window.App.state) window.App.state.currentProgram = program;
                    window.App.currentProgram = program;
                    try { localStorage.setItem('t7_current_program', JSON.stringify(program)); } catch (_) {}
                }

                clearInterval(msgInt);
                overlay.classList.add('hidden');

                const resultEl = container.querySelector('#prog-result');
                const intakeWrapper = container.querySelector('.intake-wrapper');
                if (intakeWrapper) intakeWrapper.style.display = 'none';

                if (resultEl && window.App.renderProgramResult) {
                    resultEl.classList.remove('hidden');
                    window.App.renderProgramResult('prog-result', program);
                    resultEl.scrollIntoView({ behavior: 'smooth' });
                }

                if (typeof onSubmit === 'function') {
                    try { onSubmit(params, program); } catch (_) {}
                }
            } catch (err) {
                clearInterval(msgInt);
                overlay.classList.add('hidden');
                console.error('Gen Error:', err);
                const resultEl = container.querySelector('#prog-result');
                if (resultEl) {
                    resultEl.innerHTML = `
                        <div style="max-width:600px;margin:2rem auto;padding:1.5rem;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:12px;">
                            <h4 style="color:#ef4444;margin:0 0 .5rem">Errore generazione</h4>
                            <p style="color:var(--text-secondary);margin:0 0 1rem">${err.message}</p>
                            <button onclick="location.reload()" style="padding:.5rem 1.25rem;background:var(--accent);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600">Riprova</button>
                        </div>
                    `;
                    resultEl.classList.remove('hidden');
                }
            }
        }

        // Init primo step
        updateUI();
    };

})();
