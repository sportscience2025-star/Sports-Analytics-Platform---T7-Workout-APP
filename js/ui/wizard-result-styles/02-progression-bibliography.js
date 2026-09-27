/**
 * js/ui/wizard-result-styles/02-progression-bibliography.js
 * ═══════════════════════════════════════════════════════════════════
 * Stili CSS Report Risultato: Progressione, Sessioni e Bibliografia.
 * Registra il frammento CSS in window.App.ResultStyles.chunks.
 *
 * Sezioni contenute:
 *   - .progression-section (Timeline 12 settimane responsive)
 *   - .bibliography-section (Bibliografia e citazioni accordion)
 *   - .phase-selector-section (Selettore fasi a tab)
 *   - .phase-objective-card (Card obiettivi fase attiva)
 *   - .phase-clinical-specs-banner (Specifiche cliniche e deload)
 *   - .schedule-grid-v3 & .day-card (Struttura sessioni giornaliere)
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};
    window.App.ResultStyles = window.App.ResultStyles || {};
    window.App.ResultStyles.chunks = window.App.ResultStyles.chunks || {};

    const CHUNK_KEY = 'progressionBibliography';

    window.App.ResultStyles.chunks[CHUNK_KEY] = 
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

    ;
})();
