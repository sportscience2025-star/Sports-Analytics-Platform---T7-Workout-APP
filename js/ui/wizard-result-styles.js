/**
 * wizard-result-styles.js
 * ═══════════════════════════════════════════════════════════════════
 * Stili CSS del report risultato programmazione.
 * Iniettati dinamicamente nel <head> con id="result-view-styles" (idempotente).
 * Separati dall'HTML per facilitare la manutenzione e le correzioni grafiche.
 *
 * SEZIONI CSS CONTENUTE:
 *   - .program-result-v3       - Contenitore principale report
 *   - .report-header-v3        - Header titolo + badge + rischio
 *   - .rationale-card-v4       - Card rationale scientifico (4 blocchi)
 *   - .periodization-card-v3   - Card metodo periodizzazione
 *   - .clinical-alerts-v2      - Prescrizioni sicurezza (collapsible)
 *   - .progression-section     - Tabella timeline (responsive mobile)
 *   - .bibliography-section    - Riferimenti scientifici (lista compatta + accordion)
 *   - .phase-selector-section  - Tab selettori fasi
 *   - .phase-objective-card    - Card obiettivo fase
 *   - .phase-clinical-specs    - Banner RPE/ROM/Stato (clinico)
 *   - .ex-interactive-table    - Tabella interattiva esercizi (desktop + mobile card view)
 *   - .ex-context-menu         - Menu contestuale esercizio (Modifica/Elimina/Swap)
 *   - .swap-panel-overlay      - Pannello Swap/Sostituzione con AI suggestions
 *   - .edit-modal-overlay      - Modal di modifica rapida delle specifiche
 *   - .undo-toast              - Toast "Annulla" per rollback azioni
 *   - .report-actions-v3       - Bottoni export
 *   - @media print             - Override per stampa
 *   - @media (max-width: 768px)- Override responsive mobile
 *
 * FUNZIONE ESPOSTA:
 *   - window.App.injectResultStyles() -> Inietta CSS nel DOM (una sola volta)
 *
 * DIPENDENZE: Nessuna
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};

    const STYLES_ELEMENT_ID = 'result-view-styles';

    /**
     * Inietta gli stili CSS del report di programmazione nel DOM se non gia presenti.
     * Garantisce idempotenza tramite verifica dell'ID 'result-view-styles'.
     * @returns {void}
     */
    window.App.injectResultStyles = function () {
        if (document.getElementById(STYLES_ELEMENT_ID)) return;

        const style = document.createElement('style');
        style.id = STYLES_ELEMENT_ID;
        style.textContent = `
            /* ── Contenitore Generale Report ── */
            .program-result-v3 {
                background: #0f172a;
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                border-radius: 16px;
                padding: 2.5rem;
                max-width: 1050px;
                margin: 2rem auto;
                box-shadow: var(--shadow-lg, 0 10px 25px -5px rgba(0,0,0,0.5));
            }

            /* ── Header Report ── */
            .report-header-v3 {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding-bottom: 2rem;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
                margin-bottom: 2rem;
                flex-wrap: wrap;
                gap: 1.5rem;
            }
            .rh-kicker {
                font-size: 0.75rem;
                text-transform: uppercase;
                color: var(--accent, #10b981);
                letter-spacing: 0.1em;
                font-weight: 700;
                display: block;
                margin-bottom: 0.5rem;
            }
            .report-header-v3 h2 {
                font-size: 1.8rem;
                font-weight: 800;
                color: var(--text-primary, #f8fafc);
                margin: 0 0 1rem;
            }
            .rh-meta {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            .rh-meta .tag {
                background: rgba(255, 255, 255, 0.05);
                color: var(--text-secondary, #94a3b8);
                border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 600;
                text-transform: capitalize;
            }
            .rh-meta .tag.patient-type {
                background: rgba(59, 130, 246, 0.1);
                border-color: rgba(59, 130, 246, 0.2);
                color: #60a5fa;
            }
            .risk-indicator {
                border-left: 4px solid var(--risk-color, #10b981);
                padding-left: 1rem;
            }
            .risk-indicator .risk-lbl {
                font-size: 0.75rem;
                text-transform: uppercase;
                color: var(--text-secondary, #94a3b8);
                letter-spacing: 0.05em;
            }
            .risk-indicator .risk-val {
                font-size: 1.6rem;
                font-weight: 800;
                color: var(--risk-color, #10b981);
                margin-top: 0.25rem;
            }

            /* ── Miglioramento 2: Rationale Card Strutturata (4 Blocchi) ── */
            .rationale-card-v4 {
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.85));
                border: 1px solid rgba(99, 102, 241, 0.25);
                border-radius: 14px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            }
            .rc-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 1.25rem;
            }
            .rc-badge {
                background: rgba(99, 102, 241, 0.15);
                color: #818cf8;
                font-size: 0.8rem;
                font-weight: 700;
                padding: 0.3rem 0.75rem;
                border-radius: 6px;
                border: 1px solid rgba(99, 102, 241, 0.3);
                letter-spacing: 0.05em;
                text-transform: uppercase;
            }
            .rc-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1.25rem;
            }
            .rc-block {
                background: rgba(15, 23, 42, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 1.15rem;
                display: flex;
                flex-direction: column;
                gap: 0.4rem;
                border-left: 3px solid var(--primary, #6366f1);
            }
            .rc-block.block-goal { border-left-color: #38bdf8; }
            .rc-block.block-arch { border-left-color: #818cf8; }
            .rc-block.block-biomech { border-left-color: #f59e0b; }
            .rc-block.block-load { border-left-color: #10b981; }
            .rc-block-label {
                font-size: 0.76rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: var(--text-secondary, #94a3b8);
            }
            .rc-block-text {
                font-size: 0.92rem;
                line-height: 1.6;
                color: var(--text-primary, #f1f5f9);
                margin: 0;
            }
            .summary-rationale-fallback {
                color: #e2e8f0;
                font-size: 0.95rem;
                line-height: 1.6;
                margin: 0;
            }

            /* ── Periodizzazione Info Card ── */
            .periodization-card-v3 {
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%);
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                border-left: 4px solid var(--primary, #6366f1);
                padding: 1.5rem;
                border-radius: 12px;
                margin-bottom: 2rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            .p-card-header { display: flex; flex-direction: column; margin-bottom: 0.75rem; }
            .p-card-badge { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary, #6366f1); margin-bottom: 0.25rem; }
            .p-card-title { font-size: 1.3rem; font-weight: 800; color: var(--text-primary, #f8fafc); margin: 0; }
            .p-rationale { font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary, #94a3b8); margin: 0 0 1rem; }
            .p-pattern-box { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.9rem; color: var(--text-primary, #f8fafc); margin-bottom: 1rem; }
            .p-researchers { font-size: 0.8rem; color: var(--text-muted, #64748b); border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 0.5rem; }

            /* ── Miglioramento 3: Prescrizioni di Sicurezza Clinica (Collapsibili) ── */
            .clinical-alerts-v2 {
                background: rgba(239, 68, 68, 0.05);
                border: 1px solid rgba(239, 68, 68, 0.2);
                border-left: 4px solid #ef4444;
                border-radius: 8px 12px 12px 8px;
                margin-bottom: 2rem;
                overflow: hidden;
            }
            .ca-toggle {
                width: 100%;
                background: transparent;
                border: none;
                padding: 1.1rem 1.4rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                text-align: left;
                color: #ef4444;
                font-family: inherit;
            }
            .ca-toggle:hover {
                background: rgba(239, 68, 68, 0.04);
            }
            .ca-title {
                font-size: 1rem;
                font-weight: 700;
                flex: 1;
            }
            .ca-count {
                background: rgba(239, 68, 68, 0.15);
                color: #fca5a5;
                font-size: 0.75rem;
                font-weight: 700;
                padding: 3px 8px;
                border-radius: 12px;
                white-space: nowrap;
            }
            .ca-chevron {
                display: flex;
                align-items: center;
                transition: transform 0.25s ease;
                color: #ef4444;
            }
            .ca-toggle[aria-expanded="true"] .ca-chevron {
                transform: rotate(180deg);
            }
            .ca-body {
                padding: 0 1.4rem 1.25rem 1.4rem;
            }
            .ca-body[hidden] {
                display: none;
            }
            .ca-list {
                margin: 0;
                padding-left: 1.25rem;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .ca-list li {
                color: var(--text-secondary, #94a3b8);
                font-size: 0.9rem;
                line-height: 1.55;
            }
            .ca-list li::marker {
                color: #ef4444;
            }

            /* ── Miglioramento 4: Timeline 12 Settimane Responsive ── */
            .progression-section {
                margin-bottom: 2.5rem;
            }
            .progression-section h3 {
                font-size: 1.3rem;
                margin-bottom: 1rem;
                color: var(--text-primary, #f8fafc);
            }
            .table-responsive {
                overflow-x: auto;
                width: 100%;
                border-radius: 12px;
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                background: rgba(0, 0, 0, 0.15);
            }
            .prog-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
                font-size: 0.92rem;
            }
            .prog-table th {
                padding: 1rem 1.25rem;
                background: rgba(255, 255, 255, 0.02);
                color: var(--text-secondary, #94a3b8);
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
                font-weight: 600;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .prog-table td {
                padding: 1rem 1.25rem;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
                color: var(--text-primary, #f8fafc);
                line-height: 1.5;
            }
            .prog-table tr:last-child td {
                border-bottom: none;
            }
            .badge-week {
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
                padding: 4px 8px;
                border-radius: 6px;
                font-weight: 700;
                font-size: 0.8rem;
                border: 1px solid rgba(16, 185, 129, 0.2);
                white-space: nowrap;
                display: inline-block;
            }

            /* ── Miglioramento 1: Bibliografia e Citazioni Accordion ── */
            .bibliography-section {
                margin-top: 2.5rem;
                margin-bottom: 2.5rem;
                border-top: 1px solid var(--border, rgba(255,255,255,0.1));
                padding-top: 1.75rem;
            }
            .bibliography-section h3 {
                font-size: 1.3rem;
                margin-bottom: 1rem;
                color: var(--text-primary, #f8fafc);
            }
            .bib-list {
                display: flex;
                flex-direction: column;
                gap: 0;
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                border-radius: 12px;
                background: rgba(15, 23, 42, 0.4);
                overflow: hidden;
            }
            .bib-item {
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.06));
            }
            .bib-item:last-child {
                border-bottom: none;
            }
            .bib-summary {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.85rem 1rem;
                cursor: pointer;
                transition: background 0.15s ease;
                outline: none;
            }
            .bib-summary:hover, .bib-summary:focus-visible {
                background: rgba(255, 255, 255, 0.04);
            }
            .bib-badge {
                background: rgba(16, 185, 129, 0.12);
                color: #34d399;
                font-size: 0.7rem;
                font-weight: 700;
                padding: 2px 7px;
                border-radius: 4px;
                text-transform: uppercase;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .bib-year {
                color: var(--text-secondary, #94a3b8);
                font-size: 0.82rem;
                font-weight: 600;
                flex-shrink: 0;
                min-width: 40px;
            }
            .bib-title {
                flex: 1;
                font-size: 0.92rem;
                color: var(--text-primary, #f8fafc);
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .bib-chevron {
                flex-shrink: 0;
                color: var(--text-muted, #64748b);
                display: flex;
                align-items: center;
                transition: transform 0.2s ease;
            }
            .bib-summary[aria-expanded="true"] .bib-chevron {
                transform: rotate(180deg);
                color: var(--primary, #6366f1);
            }
            .bib-detail {
                padding: 0.6rem 1rem 1rem 1rem;
                background: rgba(0, 0, 0, 0.15);
                border-top: 1px solid rgba(255, 255, 255, 0.03);
            }
            .bib-detail[hidden] {
                display: none;
            }
            .bib-authors {
                color: var(--text-secondary, #94a3b8);
                font-size: 0.85rem;
                margin: 0 0 0.5rem 0;
                line-height: 1.5;
            }
            .bib-doi-link {
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
                color: var(--primary, #6366f1);
                font-size: 0.82rem;
                font-weight: 600;
                text-decoration: none;
            }
            .bib-doi-link:hover {
                text-decoration: underline;
            }

            /* ── Selettore Fasi ── */
            .phase-selector-section {
                margin-bottom: 2rem;
                border-top: 1px solid var(--border, rgba(255,255,255,0.1));
                padding-top: 2rem;
            }
            .phase-selector-section h3 {
                font-size: 1.3rem;
                margin-bottom: 1.25rem;
                color: var(--text-primary, #f8fafc);
            }
            .phase-tabs-v3 {
                display: flex;
                gap: 0.5rem;
                overflow-x: auto;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
            }
            .phase-tab-btn {
                flex: 1;
                min-width: 140px;
                background: transparent;
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                border-bottom: none;
                padding: 0.75rem 1rem;
                border-radius: 8px 8px 0 0;
                text-align: left;
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                cursor: pointer;
                transition: all 0.2s ease;
                color: var(--text-muted, #64748b);
                position: relative;
                top: 1px;
                font-family: inherit;
            }
            .phase-tab-btn:hover {
                color: var(--text-primary, #f8fafc);
                background: rgba(255, 255, 255, 0.05);
            }
            .phase-tab-btn.active {
                color: #fff;
                background: linear-gradient(135deg, var(--primary, #6366f1) 0%, var(--accent, #10b981) 100%);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
            }
            .phase-tab-btn.is-deload-tab.active {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
            }
            .phase-tab-btn .tab-weeks {
                font-size: 0.75rem;
                opacity: 0.85;
                text-transform: uppercase;
                font-weight: 500;
                letter-spacing: 0.05em;
            }
            .phase-tab-btn .tab-name {
                font-size: 0.95rem;
                font-weight: 600;
            }

            /* ── Contenuto Fase Attiva ── */
            .active-phase-schedule-container {
                min-height: 300px;
                margin-bottom: 2.5rem;
            }
            .phase-objective-card {
                background: rgba(30, 41, 59, 0.4);
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                border-left: 4px solid var(--primary, #6366f1);
                padding: 1.5rem;
                border-radius: 4px 12px 12px 4px;
                margin-bottom: 1.5rem;
            }
            .phase-objective-card h4 {
                margin: 0 0 0.5rem;
                font-size: 1.2rem;
                color: var(--text-primary, #f8fafc);
            }
            .phase-objective-card p {
                color: var(--text-secondary, #94a3b8);
                font-size: 0.95rem;
                line-height: 1.6;
                margin: 0 0 1rem;
            }
            .phase-meta-info {
                display: flex;
                flex-wrap: wrap;
                gap: 1.5rem;
                font-size: 0.85rem;
                color: var(--text-secondary, #94a3b8);
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                padding-top: 0.75rem;
            }
            .phase-clinical-specs-banner {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            .spec-bubble {
                background: rgba(15, 23, 42, 0.4);
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                padding: 1rem;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            .spec-bubble .lbl {
                font-size: 0.75rem;
                text-transform: uppercase;
                color: var(--text-secondary, #94a3b8);
                margin-bottom: 0.25rem;
                letter-spacing: 0.05em;
            }
            .spec-bubble .val {
                font-size: 1.1rem;
                font-weight: 700;
                color: var(--text-primary, #f8fafc);
            }
            .spec-bubble.deload-status .val { color: #10b981; }
            .spec-bubble.work-status .val { color: var(--primary, #6366f1); }

            .schedule-grid-v3 {
                display: grid;
                gap: 2rem;
            }
            .day-card {
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                border-radius: 12px;
                background: rgba(15, 23, 42, 0.4);
                overflow: hidden;
                box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.3));
            }
            .day-card.rest-day {
                border-color: rgba(16, 185, 129, 0.2);
                background: rgba(16, 185, 129, 0.02);
            }
            .day-card.rest-day .day-header {
                border-bottom-color: rgba(16, 185, 129, 0.1);
            }
            .day-card.rest-day .day-body {
                padding: 1.5rem;
                color: var(--text-secondary, #94a3b8);
                font-size: 0.95rem;
            }
            .day-header {
                background: rgba(255, 255, 255, 0.02);
                padding: 1.25rem 1.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
            }
            .day-header h4 {
                font-size: 1.15rem;
                margin: 0;
            }
            .day-focus {
                font-size: 0.8rem;
                color: var(--primary, #6366f1);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                display: block;
                margin-top: 0.25rem;
                font-weight: 600;
            }
            .day-card.rest-day .day-focus {
                color: #10b981;
            }
            .badge.rest {
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 700;
                border: 1px solid rgba(16, 185, 129, 0.2);
            }
            .time-badge {
                font-size: 0.85rem;
                color: var(--text-secondary, #94a3b8);
                background: rgba(255, 255, 255, 0.05);
                padding: 4px 8px;
                border-radius: 6px;
            }
            .day-content {
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }
            .section-block h5 {
                font-size: 0.75rem;
                text-transform: uppercase;
                color: var(--text-secondary, #94a3b8);
                margin: 0 0 0.75rem 0;
                letter-spacing: 0.1em;
                font-weight: 700;
                border-left: 2px solid var(--primary, #6366f1);
                padding-left: 0.5rem;
            }
            .warmup-block h5 { border-left-color: #f59e0b; }
            .cardio-block h5 { border-left-color: #10b981; }

            .warmup-row, .cardio-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.6rem 0.85rem;
                font-size: 0.95rem;
                color: var(--text-secondary, #94a3b8);
                background: rgba(255, 255, 255, 0.02);
                border-radius: 8px;
                margin-bottom: 0.4rem;
                border: 1px solid rgba(255, 255, 255, 0.04);
            }
            .warmup-row .ex-name, .cardio-row .c-name {
                font-weight: 500;
                color: var(--text-primary, #f8fafc);
            }
            .warmup-row .ex-specs, .cardio-row .c-specs {
                font-weight: 600;
                color: var(--text-secondary, #94a3b8);
                font-size: 0.9rem;
            }

            /* ── Miglioramento 5: Tabella Interattiva Esercizi Principali ── */
            .ex-table-wrapper {
                width: 100%;
                overflow-x: auto;
                border-radius: 10px;
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                background: rgba(0, 0, 0, 0.2);
            }
            .ex-interactive-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
                font-size: 0.9rem;
            }
            .ex-interactive-table th {
                padding: 0.85rem 1rem;
                background: rgba(255, 255, 255, 0.03);
                color: var(--text-secondary, #94a3b8);
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
                font-size: 0.78rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                white-space: nowrap;
            }
            .ex-interactive-table th.col-actions {
                width: 44px;
                text-align: center;
                padding-right: 0.75rem;
            }
            .ex-row-interactive {
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                transition: background 0.15s ease;
            }
            .ex-row-interactive:last-child {
                border-bottom: none;
            }
            .ex-row-interactive:hover {
                background: rgba(255, 255, 255, 0.03);
            }
            .ex-row-interactive.is-adapted {
                background: rgba(245, 158, 11, 0.04);
            }
            .ex-row-interactive.is-adapted:hover {
                background: rgba(245, 158, 11, 0.07);
            }
            .ex-interactive-table td {
                padding: 0.85rem 1rem;
                color: var(--text-primary, #f8fafc);
                vertical-align: middle;
            }
            .ex-cell-name {
                min-width: 180px;
            }
            .ex-name-btn {
                background: transparent;
                border: none;
                color: var(--text-primary, #f8fafc);
                font-family: inherit;
                font-size: 0.92rem;
                font-weight: 600;
                cursor: pointer;
                padding: 0;
                text-align: left;
                transition: color 0.15s ease;
            }
            .ex-name-btn:hover {
                color: var(--primary, #6366f1);
                text-decoration: underline;
            }
            .adapted-badge {
                display: inline-block;
                background: rgba(245, 158, 11, 0.15);
                color: #fbbf24;
                font-size: 0.65rem;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 4px;
                margin-left: 0.5rem;
                letter-spacing: 0.04em;
                vertical-align: middle;
            }
            .cell-highlight {
                color: var(--accent, #10b981);
                font-weight: 700;
            }
            .ex-inline-note {
                font-size: 0.76rem;
                color: #f59e0b;
                margin-top: 0.25rem;
                line-height: 1.35;
            }
            .ex-action-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                color: var(--text-secondary, #94a3b8);
                width: 30px;
                height: 30px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .ex-action-btn:hover {
                color: #fff;
                background: var(--primary, #6366f1);
                border-color: var(--primary, #6366f1);
            }

            /* ── Miglioramento 6: Menu Contestuale Esercizio ── */
            .ex-context-menu {
                position: fixed;
                z-index: 1050;
                background: #1e293b;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 10px;
                padding: 0.4rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
                display: flex;
                flex-direction: column;
                min-width: 170px;
                animation: fadeInMenu 0.15s ease;
            }
            .ex-context-menu.hidden {
                display: none;
            }
            @keyframes fadeInMenu {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .ecm-item {
                background: transparent;
                border: none;
                color: var(--text-primary, #f8fafc);
                padding: 0.6rem 0.85rem;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.6rem;
                cursor: pointer;
                transition: background 0.15s ease;
                text-align: left;
                width: 100%;
                font-family: inherit;
            }
            .ecm-item:hover {
                background: rgba(255, 255, 255, 0.08);
            }
            .ecm-item.ecm-swap {
                color: #38bdf8;
            }
            .ecm-item.ecm-swap:hover {
                background: rgba(56, 189, 248, 0.12);
            }
            .ecm-item.ecm-danger {
                color: #f87171;
            }
            .ecm-item.ecm-danger:hover {
                background: rgba(239, 68, 68, 0.15);
            }
            .ecm-divider {
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 0.3rem 0;
            }

            /* ── Miglioramento 7 & 8: Pannello Swap Modale ── */
            .swap-panel-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                z-index: 1100;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }
            .swap-panel-overlay.hidden {
                display: none;
            }
            .swap-panel-box {
                background: #1e293b;
                border: 1px solid var(--border, rgba(255,255,255,0.15));
                border-radius: 16px;
                width: 100%;
                max-width: 580px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
                overflow: hidden;
            }
            .sp-header {
                padding: 1.25rem 1.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
            }
            .sp-header h3 {
                font-size: 1.2rem;
                font-weight: 700;
                color: var(--text-primary, #f8fafc);
                margin: 0;
            }
            .sp-close {
                background: transparent;
                border: none;
                color: var(--text-muted, #64748b);
                font-size: 1.6rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                transition: color 0.15s ease;
            }
            .sp-close:hover {
                color: #fff;
            }
            .sp-current {
                padding: 0.85rem 1.5rem;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }
            .sp-label {
                color: var(--text-secondary, #94a3b8);
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .sp-body-scroll {
                padding: 1.25rem 1.5rem;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }
            .sp-ai-section {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .sp-ai-badge {
                background: rgba(99, 102, 241, 0.15);
                color: #818cf8;
                font-size: 0.75rem;
                font-weight: 700;
                padding: 3px 8px;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                display: inline-block;
            }
            .sp-ai-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .sp-ai-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(99, 102, 241, 0.2);
                padding: 0.75rem 1rem;
                border-radius: 10px;
                transition: border-color 0.15s ease;
            }
            .sp-ai-item:hover {
                border-color: rgba(99, 102, 241, 0.4);
                background: rgba(99, 102, 241, 0.05);
            }
            .sp-ai-item-name {
                font-size: 0.92rem;
                font-weight: 600;
                color: var(--text-primary, #f8fafc);
            }
            .sp-ai-item-reason {
                font-size: 0.78rem;
                color: var(--text-secondary, #94a3b8);
                margin-top: 0.2rem;
            }
            .sp-select-btn {
                background: var(--primary, #6366f1);
                color: #fff;
                border: none;
                border-radius: 6px;
                padding: 0.45rem 0.9rem;
                font-size: 0.82rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s ease;
                white-space: nowrap;
            }
            .sp-select-btn:hover {
                background: #4f46e5;
            }
            .sp-search-section {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                border-top: 1px solid var(--border, rgba(255,255,255,0.1));
                padding-top: 1.25rem;
            }
            .sp-search-input {
                width: 100%;
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid var(--border, rgba(255,255,255,0.15));
                border-radius: 8px;
                padding: 0.75rem 1rem;
                color: var(--text-primary, #f8fafc);
                font-size: 0.9rem;
                font-family: inherit;
                box-sizing: border-box;
            }
            .sp-search-input:focus {
                border-color: var(--primary, #6366f1);
                outline: none;
            }
            .sp-search-results {
                display: flex;
                flex-direction: column;
                gap: 0.4rem;
                max-height: 180px;
                overflow-y: auto;
            }
            .sp-search-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.04);
                padding: 0.6rem 0.85rem;
                border-radius: 8px;
                transition: background 0.15s ease;
            }
            .sp-search-item:hover {
                background: rgba(255, 255, 255, 0.06);
            }
            .sp-search-item-info {
                display: flex;
                flex-direction: column;
            }
            .sp-search-item-name {
                font-size: 0.88rem;
                font-weight: 500;
                color: var(--text-primary, #f8fafc);
            }
            .sp-search-item-sub {
                font-size: 0.75rem;
                color: var(--text-muted, #64748b);
            }

            /* ── Modal Modifica Specifiche Esercizio ── */
            .edit-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                z-index: 1100;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }
            .edit-modal-overlay.hidden {
                display: none;
            }
            .edit-modal-box {
                background: #1e293b;
                border: 1px solid var(--border, rgba(255,255,255,0.15));
                border-radius: 16px;
                width: 100%;
                max-width: 480px;
                padding: 1.75rem;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
            }
            .edit-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            .edit-modal-header h3 {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--text-primary, #f8fafc);
                margin: 0;
            }
            .edit-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            .edit-field {
                display: flex;
                flex-direction: column;
                gap: 0.35rem;
            }
            .edit-field label {
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--text-secondary, #94a3b8);
            }
            .edit-field input {
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid var(--border, rgba(255,255,255,0.15));
                border-radius: 8px;
                padding: 0.6rem 0.8rem;
                color: var(--text-primary, #f8fafc);
                font-size: 0.9rem;
                font-family: inherit;
            }
            .edit-field input:focus {
                border-color: var(--primary, #6366f1);
                outline: none;
            }
            .edit-modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 0.75rem;
            }
            .btn-cancel-edit {
                background: transparent;
                border: 1px solid var(--border, rgba(255,255,255,0.15));
                color: var(--text-secondary, #94a3b8);
                border-radius: 8px;
                padding: 0.6rem 1.2rem;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
            }
            .btn-save-edit {
                background: var(--primary, #6366f1);
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 0.6rem 1.4rem;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
            }

            /* ── Toast Undo ── */
            .undo-toast {
                position: fixed;
                bottom: 24px;
                left: 24px;
                background: #1e293b;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 10px;
                padding: 0.75rem 1.25rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                z-index: 1200;
                animation: slideInToast 0.25s ease;
            }
            .undo-toast.hidden {
                display: none;
            }
            @keyframes slideInToast {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .undo-toast-msg {
                font-size: 0.88rem;
                color: var(--text-primary, #f8fafc);
            }
            .undo-toast-btn {
                background: var(--accent, #10b981);
                color: #fff;
                border: none;
                border-radius: 6px;
                padding: 0.4rem 0.8rem;
                font-weight: 600;
                cursor: pointer;
                font-size: 0.82rem;
            }
            .undo-toast-btn:hover {
                background: #059669;
            }

            /* ── Bottoni Azioni Export ── */
            .report-actions-v3 {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1.5rem;
                margin-top: 2.5rem;
                padding: 1.5rem 2rem;
                border-radius: 16px;
                background: rgba(255, 255, 255, 0.02);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            .report-actions-v3.report-actions-top {
                margin-top: 1.25rem;
                margin-bottom: 2rem;
            }
            .export-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .export-label {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: var(--text-secondary, #94a3b8);
                font-weight: 700;
                margin-left: 0.25rem;
            }
            .export-btns {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            .btn-pdf-export, .btn-excel-export, .btn-close-report {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.8rem 1.6rem;
                border-radius: 10px;
                font-weight: 600;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid transparent;
            }
            .btn-pdf-export {
                background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
                color: #fff;
                box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            .btn-pdf-export:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
            .btn-excel-export {
                background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                color: #fff;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            .btn-excel-export:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
            .btn-close-report {
                background: rgba(255, 255, 255, 0.03);
                color: var(--text-secondary, #94a3b8);
                border: 1px solid rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
            }
            .btn-close-report:hover {
                background: rgba(255, 255, 255, 0.08);
                color: var(--text-primary, #f8fafc);
                border-color: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .btn-pdf-export svg, .btn-excel-export svg, .btn-close-report svg {
                transition: transform 0.3s ease;
            }
            .btn-pdf-export:hover svg { transform: translateY(2px); }
            .btn-excel-export:hover svg { transform: scale(1.1); }
            .btn-close-report:hover svg { transform: translateX(-3px); }

            /* ── Media Queries Responsive (Mobile) ── */
            @media (max-width: 768px) {
                .program-result-v3 {
                    padding: 1.25rem;
                    margin: 1rem 0;
                    border-radius: 12px;
                }
                .report-header-v3 {
                    flex-direction: column;
                    gap: 1rem;
                }
                .rc-grid {
                    grid-template-columns: 1fr;
                    gap: 0.75rem;
                }
                .prog-table thead {
                    display: none;
                }
                .prog-table tbody {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .prog-table tr {
                    display: flex;
                    flex-direction: column;
                    border: 1px solid var(--border, rgba(255,255,255,0.1));
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    background: rgba(15, 23, 42, 0.4);
                }
                .prog-table td {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: none;
                    padding: 0.3rem 0;
                    font-size: 0.88rem;
                }
                .prog-table td::before {
                    content: attr(data-label);
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    color: var(--text-secondary, #94a3b8);
                    font-weight: 600;
                    margin-right: 1rem;
                    flex-shrink: 0;
                }

                /* Mobile Card view per tabella interattiva esercizi */
                .ex-interactive-table thead {
                    display: none;
                }
                .ex-interactive-table tbody {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .ex-row-interactive {
                    display: flex;
                    flex-direction: column;
                    border: 1px solid var(--border, rgba(255,255,255,0.1));
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    background: rgba(15, 23, 42, 0.4);
                }
                .ex-interactive-table td {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: none;
                    padding: 0.25rem 0;
                    font-size: 0.88rem;
                }
                .ex-interactive-table td[data-label="#"] {
                    display: none;
                }
                .ex-interactive-table td.ex-cell-name {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.35rem;
                }
                .ex-interactive-table td.ex-cell-name::before {
                    margin-bottom: 0.15rem;
                }
                .ex-interactive-table td::before {
                    content: attr(data-label);
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    color: var(--text-secondary, #94a3b8);
                    font-weight: 600;
                    margin-right: 1rem;
                    flex-shrink: 0;
                }
                .ex-interactive-table td.col-actions {
                    justify-content: flex-end;
                    padding-top: 0.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    margin-top: 0.25rem;
                }
                .ex-interactive-table td.col-actions::before {
                    display: none;
                }
                .report-actions-v3 {
                    flex-direction: column;
                    align-items: stretch;
                    padding: 1.25rem;
                }
                .btn-close-report {
                    justify-content: center;
                }
                .export-btns {
                    flex-direction: column;
                }
                .export-btns button {
                    justify-content: center;
                }
            }

            /* ── Elementi Print-Only nascosti a video ── */
            .col-print-log,
            .print-all-phases-container {
                display: none !important;
            }

            /* ── Print Media Overrides & A4 Layout ── */
            @page {
                size: A4 portrait;
                margin: 12mm 15mm 15mm 15mm;
            }

            @media print {
                *, *::before, *::after {
                    box-sizing: border-box !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    text-shadow: none !important;
                }

                body, html {
                    background: #ffffff !important;
                    color: #0f172a !important;
                    font-size: 10pt !important;
                    line-height: 1.4 !important;
                }

                /* Soppressione totale di navbar mobile, controlli interattivi e layout a video */
                #bottom-nav,
                .bottom-nav,
                .main-nav,
                .app-header,
                .programming-container,
                .phase-selector-section,
                .screen-only-phase-container,
                .report-actions-v3,
                #generator-form,
                .ex-action-btn,
                .ex-context-menu,
                .swap-panel-overlay,
                .undo-toast,
                .btn-ex-detail,
                .ca-chevron,
                .bib-chevron,
                .bib-doi-link,
                .col-actions,
                .btn-close-report,
                .export-group,
                .phase-tab-btn {
                    display: none !important;
                    visibility: hidden !important;
                }

                .app-container,
                .programming-container,
                .program-result-v3 {
                    margin: 0 !important;
                    padding: 0 !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    animation: none !important;
                }

                /* Header del report */
                .report-header-v3 {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: flex-start !important;
                    border-bottom: 2pt solid #0f172a !important;
                    padding-bottom: 8pt !important;
                    margin-bottom: 12pt !important;
                    break-inside: avoid !important;
                    break-after: avoid !important;
                }
                .rh-kicker {
                    font-size: 8pt !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.1em !important;
                    color: #64748b !important;
                    display: block !important;
                    margin-bottom: 2pt !important;
                }
                .report-header-v3 h2 {
                    font-size: 15pt !important;
                    font-weight: 800 !important;
                    color: #0f172a !important;
                    margin: 0 0 6pt 0 !important;
                }
                .rh-meta {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 4pt !important;
                }
                .rh-meta .tag {
                    background: #f1f5f9 !important;
                    border: 1pt solid #cbd5e1 !important;
                    color: #1e293b !important;
                    font-size: 7.5pt !important;
                    font-weight: 600 !important;
                    padding: 2pt 5pt !important;
                    border-radius: 3pt !important;
                }
                .risk-indicator {
                    border: 1.5pt solid #cbd5e1 !important;
                    background: #f8fafc !important;
                    padding: 4pt 8pt !important;
                    border-radius: 4pt !important;
                    text-align: right !important;
                }
                .risk-lbl {
                    font-size: 7pt !important;
                    color: #64748b !important;
                    text-transform: uppercase !important;
                    font-weight: 700 !important;
                }
                .risk-val {
                    font-size: 10pt !important;
                    font-weight: 800 !important;
                    color: #0f172a !important;
                }

                /* Timeline delle settimane: pura tabella orizzontale compatta */
                .progression-section {
                    margin-bottom: 14pt !important;
                    break-inside: avoid !important;
                }
                .progression-section h3 {
                    font-size: 11pt !important;
                    font-weight: 700 !important;
                    margin: 0 0 4pt 0 !important;
                    color: #0f172a !important;
                    border-bottom: 1pt solid #e2e8f0 !important;
                    padding-bottom: 2pt !important;
                }
                .table-responsive {
                    overflow: visible !important;
                }
                .prog-table {
                    display: table !important;
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin: 0 0 8pt 0 !important;
                    font-size: 8pt !important;
                }
                .prog-table thead {
                    display: table-header-group !important;
                }
                .prog-table tbody {
                    display: table-row-group !important;
                }
                .prog-table tr {
                    display: table-row !important;
                    break-inside: avoid !important;
                }
                .prog-table th {
                    display: table-cell !important;
                    background: #f1f5f9 !important;
                    color: #0f172a !important;
                    font-weight: 700 !important;
                    text-align: left !important;
                    padding: 3pt 5pt !important;
                    border: 1pt solid #cbd5e1 !important;
                    font-size: 7.5pt !important;
                    text-transform: uppercase !important;
                }
                .prog-table td {
                    display: table-cell !important;
                    padding: 3pt 5pt !important;
                    border: 1pt solid #cbd5e1 !important;
                    color: #1e293b !important;
                }
                .prog-table td::before {
                    content: none !important;
                    display: none !important;
                }
                .badge-week {
                    background: none !important;
                    font-weight: 700 !important;
                    color: #0f172a !important;
                }

                /* Visualizzazione completa di tutte le fasi in stampa */
                .print-all-phases-container {
                    display: block !important;
                }
                .print-phase-block {
                    margin-bottom: 16pt !important;
                    break-inside: auto !important;
                }
                .print-phase-header {
                    background: #f1f5f9 !important;
                    border-left: 3.5pt solid #0f172a !important;
                    padding: 5pt 8pt !important;
                    margin-bottom: 8pt !important;
                    border-radius: 3pt !important;
                    break-inside: avoid !important;
                    break-after: avoid !important;
                }
                .print-phase-kicker {
                    font-size: 7pt !important;
                    font-weight: 700 !important;
                    color: #64748b !important;
                    letter-spacing: 0.05em !important;
                    display: block !important;
                }
                .print-phase-header h3 {
                    margin: 1pt 0 3pt 0 !important;
                    font-size: 11pt !important;
                    font-weight: 800 !important;
                    color: #0f172a !important;
                }
                .print-phase-meta {
                    font-size: 8pt !important;
                    color: #475569 !important;
                    display: flex !important;
                    gap: 10pt !important;
                    flex-wrap: wrap !important;
                }

                /* Obiettivo fase compatto */
                .phase-objective-card {
                    background: #ffffff !important;
                    border: 1pt solid #cbd5e1 !important;
                    border-left: 3pt solid #6366f1 !important;
                    border-radius: 4pt !important;
                    padding: 5pt 8pt !important;
                    margin-bottom: 8pt !important;
                    break-inside: avoid !important;
                }
                .phase-objective-card h4 {
                    font-size: 9pt !important;
                    margin: 0 0 2pt 0 !important;
                    color: #0f172a !important;
                }
                .phase-objective-card p {
                    font-size: 8pt !important;
                    margin: 0 0 3pt 0 !important;
                    color: #334155 !important;
                }
                .phase-meta-info {
                    font-size: 7.5pt !important;
                    color: #64748b !important;
                }

                /* Schede sedute di allenamento giornaliere (Antifragmentation) */
                .schedule-grid-v3 {
                    display: block !important;
                }
                .day-card {
                    display: block !important;
                    background: #ffffff !important;
                    border: 1pt solid #cbd5e1 !important;
                    border-radius: 5pt !important;
                    padding: 7pt 9pt !important;
                    margin-bottom: 10pt !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                    box-shadow: none !important;
                }
                .day-header {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    border-bottom: 1pt solid #e2e8f0 !important;
                    padding-bottom: 3pt !important;
                    margin-bottom: 5pt !important;
                    background: transparent !important;
                }
                .day-header h4 {
                    margin: 0 !important;
                    font-size: 10.5pt !important;
                    font-weight: 800 !important;
                    color: #0f172a !important;
                }
                .day-focus {
                    font-size: 8pt !important;
                    font-weight: 600 !important;
                    color: #475569 !important;
                    margin-left: 6pt !important;
                }
                .time-badge {
                    font-size: 7.5pt !important;
                    font-weight: 600 !important;
                    color: #64748b !important;
                    background: #f1f5f9 !important;
                    padding: 1pt 4pt !important;
                    border-radius: 3pt !important;
                    border: 1pt solid #e2e8f0 !important;
                }

                /* Sezioni Warm-up e Cooldown compatte */
                .section-block {
                    margin-bottom: 5pt !important;
                }
                .section-block h5 {
                    font-size: 8pt !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.04em !important;
                    color: #334155 !important;
                    margin: 3pt 0 2pt 0 !important;
                    border-left: 2.5pt solid #6366f1 !important;
                    padding-left: 3pt !important;
                }
                .warmup-block, .cardio-block {
                    background: #f8fafc !important;
                    border: 1pt solid #e2e8f0 !important;
                    border-radius: 3pt !important;
                    padding: 3pt 6pt !important;
                }
                .warmup-row, .cardio-row {
                    display: inline-flex !important;
                    align-items: center !important;
                    margin-right: 10pt !important;
                    margin-bottom: 2pt !important;
                    padding: 0 !important;
                    background: transparent !important;
                    border: none !important;
                    font-size: 7.5pt !important;
                }
                .warmup-row .ex-name, .cardio-row .c-name {
                    font-weight: 600 !important;
                    color: #0f172a !important;
                }
                .warmup-row .ex-specs, .cardio-row .c-specs {
                    font-size: 7pt !important;
                    color: #475569 !important;
                }

                /* Tabella Esercizi ad Alta Densità in Stampa */
                .ex-table-wrapper {
                    border: none !important;
                    background: transparent !important;
                    padding: 0 !important;
                    margin-top: 3pt !important;
                    overflow: visible !important;
                }
                .ex-interactive-table {
                    display: table !important;
                    width: 100% !important;
                    border-collapse: collapse !important;
                    font-size: 8pt !important;
                    margin: 0 !important;
                }
                .ex-interactive-table thead {
                    display: table-header-group !important;
                }
                .ex-interactive-table tbody {
                    display: table-row-group !important;
                }
                .ex-row-interactive {
                    display: table-row !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                    border: none !important;
                    background: transparent !important;
                    padding: 0 !important;
                }
                .ex-interactive-table th {
                    display: table-cell !important;
                    background: #f1f5f9 !important;
                    color: #0f172a !important;
                    font-weight: 700 !important;
                    text-align: left !important;
                    padding: 3pt 4pt !important;
                    border: 1pt solid #cbd5e1 !important;
                    font-size: 7pt !important;
                    text-transform: uppercase !important;
                }
                .ex-interactive-table td {
                    display: table-cell !important;
                    padding: 3pt 4pt !important;
                    border: 1pt solid #cbd5e1 !important;
                    color: #1e293b !important;
                    font-size: 7.5pt !important;
                    vertical-align: middle !important;
                }
                .ex-interactive-table td[data-label="#"] {
                    display: table-cell !important;
                    width: 18pt !important;
                    text-align: center !important;
                    font-weight: 700 !important;
                    color: #64748b !important;
                }
                .ex-interactive-table td.ex-cell-name {
                    font-weight: 600 !important;
                    color: #0f172a !important;
                }
                .ex-name-btn {
                    background: none !important;
                    border: none !important;
                    padding: 0 !important;
                    font-weight: 700 !important;
                    color: #0f172a !important;
                    text-align: left !important;
                    font-size: 8pt !important;
                }
                .adapted-badge {
                    display: inline-block !important;
                    font-size: 6pt !important;
                    padding: 1pt 3pt !important;
                    border: 1pt solid #f59e0b !important;
                    background: #fffbeb !important;
                    color: #b45309 !important;
                    border-radius: 2pt !important;
                    margin-left: 2pt !important;
                }
                .ex-inline-note {
                    font-size: 6.5pt !important;
                    color: #64748b !important;
                    margin-top: 1pt !important;
                    font-style: italic !important;
                }
                .ex-interactive-table td::before {
                    content: none !important;
                    display: none !important;
                }

                /* Colonna di Logging Pratico per l'Atleta sul Campo */
                .col-print-log {
                    display: table-cell !important;
                    width: 58pt !important;
                    text-align: center !important;
                }
                .print-log-box {
                    display: inline-block !important;
                    border: 1pt dashed #94a3b8 !important;
                    border-radius: 2pt !important;
                    padding: 1pt 3pt !important;
                    font-size: 6.5pt !important;
                    color: #64748b !important;
                    background: #f8fafc !important;
                    min-width: 50pt !important;
                }

                /* Rationale scientifico compatto a 4 box */
                .rationale-card-v4 {
                    background: #ffffff !important;
                    border: 1pt solid #cbd5e1 !important;
                    border-radius: 5pt !important;
                    padding: 7pt 9pt !important;
                    margin-top: 12pt !important;
                    margin-bottom: 10pt !important;
                    break-inside: avoid !important;
                }
                .rc-header .rc-badge {
                    font-size: 8.5pt !important;
                    font-weight: 800 !important;
                    color: #0f172a !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.04em !important;
                    display: block !important;
                    margin-bottom: 4pt !important;
                    border-bottom: 1pt solid #e2e8f0 !important;
                    padding-bottom: 2pt !important;
                }
                .rc-grid {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    gap: 6pt !important;
                }
                .rc-block {
                    background: #f8fafc !important;
                    border: 1pt solid #e2e8f0 !important;
                    border-radius: 3pt !important;
                    padding: 5pt 7pt !important;
                    break-inside: avoid !important;
                }
                .rc-block-label {
                    font-size: 7pt !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    color: #475569 !important;
                    margin-bottom: 1pt !important;
                }
                .rc-block-text {
                    font-size: 7.5pt !important;
                    color: #1e293b !important;
                    line-height: 1.3 !important;
                    margin: 0 !important;
                }

                /* Periodizzazione e prescrizioni cliniche */
                .periodization-card-v3 {
                    background: #ffffff !important;
                    border: 1pt solid #cbd5e1 !important;
                    border-left: 3.5pt solid #0f172a !important;
                    border-radius: 4pt !important;
                    padding: 6pt 8pt !important;
                    margin-bottom: 10pt !important;
                    break-inside: avoid !important;
                }
                .p-card-header .p-card-badge {
                    font-size: 7pt !important;
                    font-weight: 700 !important;
                    color: #64748b !important;
                    text-transform: uppercase !important;
                }
                .p-card-title {
                    font-size: 10pt !important;
                    font-weight: 800 !important;
                    color: #0f172a !important;
                    margin: 1pt 0 3pt 0 !important;
                }
                .p-rationale, .p-pattern-box, .p-researchers {
                    font-size: 7.5pt !important;
                    color: #1e293b !important;
                    line-height: 1.3 !important;
                    margin-bottom: 3pt !important;
                }
                .clinical-alerts-v2 {
                    background: #fffbeb !important;
                    border: 1pt solid #f59e0b !important;
                    border-radius: 4pt !important;
                    padding: 6pt 8pt !important;
                    margin-bottom: 10pt !important;
                    break-inside: avoid !important;
                }
                .ca-body {
                    display: block !important;
                }
                .ca-list {
                    margin: 3pt 0 0 12pt !important;
                    padding: 0 !important;
                    font-size: 7.5pt !important;
                    color: #78350f !important;
                }

                /* Bibliografia scientifica a griglia 2 colonne compatta */
                .bibliography-section {
                    margin-top: 12pt !important;
                    break-inside: avoid !important;
                }
                .bibliography-section h3 {
                    font-size: 10pt !important;
                    font-weight: 700 !important;
                    color: #0f172a !important;
                    margin: 0 0 4pt 0 !important;
                    border-bottom: 1pt solid #cbd5e1 !important;
                    padding-bottom: 2pt !important;
                }
                .bib-list {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    gap: 5pt !important;
                }
                .bib-item {
                    background: #f8fafc !important;
                    border: 1pt solid #e2e8f0 !important;
                    border-radius: 3pt !important;
                    padding: 3pt 5pt !important;
                    break-inside: avoid !important;
                }
                .bib-summary {
                    display: flex !important;
                    align-items: baseline !important;
                    gap: 3pt !important;
                    font-size: 7pt !important;
                }
                .bib-badge {
                    background: #e2e8f0 !important;
                    color: #334155 !important;
                    font-size: 6pt !important;
                    font-weight: 700 !important;
                    padding: 1pt 3pt !important;
                    border-radius: 2pt !important;
                    flex-shrink: 0 !important;
                }
                .bib-year {
                    font-weight: 700 !important;
                    color: #475569 !important;
                    font-size: 7pt !important;
                    flex-shrink: 0 !important;
                }
                .bib-title {
                    font-weight: 600 !important;
                    color: #0f172a !important;
                    font-size: 7pt !important;
                    line-height: 1.25 !important;
                }
                .bib-detail {
                    display: block !important;
                    padding-top: 2pt !important;
                    font-size: 6.5pt !important;
                    color: #64748b !important;
                }
                .bib-authors {
                    margin: 0 !important;
                    font-style: italic !important;
                }
            }
        `;
        document.head.appendChild(style);
    };

})();
