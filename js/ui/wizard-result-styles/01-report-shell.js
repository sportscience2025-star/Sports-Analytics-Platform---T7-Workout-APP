/**
 * js/ui/wizard-result-styles/01-report-shell.js
 * ═══════════════════════════════════════════════════════════════════
 * Stili CSS Report Risultato: Struttura Base e Card Informative.
 * Registra il frammento CSS in window.App.ResultStyles.chunks.
 *
 * Sezioni contenute:
 *   - .program-result-v3 (Contenitore generale)
 *   - .report-header-v3 (Header report e indicatori di rischio)
 *   - .rationale-card-v4 (Card scientifica a 4 blocchi)
 *   - .periodization-card-v3 (Card modello di periodizzazione)
 *   - .clinical-alerts-v2 (Box presidi clinici collassabili)
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};
    window.App.ResultStyles = window.App.ResultStyles || {};
    window.App.ResultStyles.chunks = window.App.ResultStyles.chunks || {};

    const CHUNK_KEY = 'reportShell';

    window.App.ResultStyles.chunks[CHUNK_KEY] = 
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

    ;
})();
