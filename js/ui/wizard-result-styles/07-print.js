/**
 * js/ui/wizard-result-styles/07-print.js
 * ═══════════════════════════════════════════════════════════════════
 * Stili CSS Report Risultato: Layout di Stampa A4 e PDF.
 * Registra il frammento CSS in window.App.ResultStyles.chunks.
 *
 * Sezioni contenute:
 *   - .col-print-log, .print-all-phases-container (Visibilita print-only)
 *   - @page (Impostazioni pagina A4 portrait)
 *   - @media print (Soppressione elementi UI, tipografia cartacea, layout tabella esercizi, bibliografia a due colonne)
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};
    window.App.ResultStyles = window.App.ResultStyles || {};
    window.App.ResultStyles.chunks = window.App.ResultStyles.chunks || {};

    const CHUNK_KEY = 'print';

    window.App.ResultStyles.chunks[CHUNK_KEY] = 
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
    ;
})();
