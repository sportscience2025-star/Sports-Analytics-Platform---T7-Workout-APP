/**
 * scripts/generate_master_report_html.js
 * Genera il Master Report HTML Definitivo della Sessione Sperimentale PAP del 28 Luglio 2026.
 * Sintesi perfetta tra l'Audit Metrologico e il Report Tecnico Prescrittivo per i Coach.
 *
 * Conforme alle regole di progetto:
 * - Nessuna emoji spontanea (01-core-project).
 * - Rigore metrologico scientifico di massimo livello (04-sports-science-research).
 * - Design moderno, dark glassmorphism, responsive, elegante e completo.
 */

const fs = require('fs');
const path = require('path');

function generateHtmlReport() {
    const html = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Sperimentale PAP & Biomeccanica dei Salti — Sessione 28 Luglio 2026</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --bg-base: #080c16;
            --bg-surface: #0f172a;
            --bg-card: rgba(15, 23, 42, 0.75);
            --bg-card-hover: rgba(30, 41, 59, 0.85);
            --border-color: rgba(255, 255, 255, 0.08);
            --border-focus: rgba(0, 240, 255, 0.4);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-dim: #64748b;
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.35);
            --cyan: #00f0ff;
            --cyan-glow: rgba(0, 240, 255, 0.3);
            --emerald: #10b981;
            --emerald-bg: rgba(16, 185, 129, 0.12);
            --emerald-border: rgba(16, 185, 129, 0.3);
            --amber: #f59e0b;
            --amber-bg: rgba(245, 158, 11, 0.12);
            --amber-border: rgba(245, 158, 11, 0.3);
            --rose: #f43f5e;
            --rose-bg: rgba(244, 63, 94, 0.12);
            --rose-border: rgba(244, 63, 94, 0.3);
            --radius-sm: 6px;
            --radius-md: 10px;
            --radius-lg: 16px;
            --radius-xl: 22px;
            --shadow-card: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: var(--bg-base);
            color: var(--text-main);
            line-height: 1.6;
            padding: 2rem 1rem;
            -webkit-font-smoothing: antialiased;
        }

        .container {
            max-width: 1280px;
            margin: 0 auto;
        }

        /* Header e Top Banner */
        .report-header {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-xl);
            padding: 2.5rem 2rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(16px);
            box-shadow: var(--shadow-card);
            position: relative;
            overflow: hidden;
        }

        .report-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, var(--cyan-glow) 0%, transparent 70%);
            pointer-events: none;
        }

        .badge-institution {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(99, 102, 241, 0.15);
            border: 1px solid rgba(99, 102, 241, 0.35);
            color: #c7d2fe;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 0.35rem 0.85rem;
            border-radius: 9999px;
            margin-bottom: 1rem;
        }

        .report-title {
            font-family: 'Outfit', sans-serif;
            font-size: 2.25rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            line-height: 1.2;
            margin-bottom: 0.75rem;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .report-subtitle {
            font-size: 1.1rem;
            color: var(--text-muted);
            max-width: 900px;
            margin-bottom: 1.5rem;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border-color);
        }

        .meta-item {
            display: flex;
            flex-direction: column;
        }

        .meta-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-dim);
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .meta-value {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-main);
        }

        /* Card Generica Glass */
        .glass-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 1.75rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(12px);
            box-shadow: var(--shadow-card);
            transition: border-color 0.2s;
        }

        .glass-card:hover {
            border-color: rgba(255, 255, 255, 0.15);
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.25rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.75rem;
        }

        .section-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.4rem;
            font-weight: 700;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .section-tag {
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .tag-metrology {
            background: rgba(0, 240, 255, 0.12);
            color: var(--cyan);
            border: 1px solid rgba(0, 240, 255, 0.3);
        }

        .tag-coaching {
            background: rgba(99, 102, 241, 0.15);
            color: #a5b4fc;
            border: 1px solid rgba(99, 102, 241, 0.35);
        }

        /* Callout Box */
        .callout {
            border-radius: var(--radius-md);
            padding: 1.25rem;
            margin: 1.25rem 0;
            border-left: 4px solid;
            font-size: 0.92rem;
        }

        .callout-info {
            background: rgba(14, 165, 233, 0.08);
            border-left-color: #0284c7;
            color: #e0f2fe;
        }

        .callout-warning {
            background: rgba(245, 158, 11, 0.08);
            border-left-color: #d97706;
            color: #fef3c7;
        }

        .callout-success {
            background: rgba(16, 185, 129, 0.08);
            border-left-color: #059669;
            color: #d1fae5;
        }

        .callout-title {
            font-weight: 700;
            margin-bottom: 0.35rem;
            display: block;
        }

        /* Tabelle Responsive */
        .table-wrap {
            overflow-x: auto;
            margin: 1rem 0;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.88rem;
            text-align: left;
        }

        th {
            background: #1e293b;
            color: #ffffff;
            font-weight: 700;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border-color);
            white-space: nowrap;
        }

        td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #cbd5e1;
        }

        tr:nth-child(even) {
            background: rgba(255, 255, 255, 0.02);
        }

        tr:hover {
            background: rgba(255, 255, 255, 0.04);
        }

        .num {
            text-align: right;
            font-variant-numeric: tabular-nums;
        }

        .center {
            text-align: center;
        }

        /* Badge Stati */
        .pill {
            display: inline-block;
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-align: center;
            white-space: nowrap;
        }

        .pill-reale {
            background: var(--emerald-bg);
            color: #34d399;
            border: 1px solid var(--emerald-border);
        }

        .pill-rumore {
            background: rgba(100, 116, 139, 0.15);
            color: #94a3b8;
            border: 1px solid rgba(100, 116, 139, 0.3);
        }

        .pill-neutro {
            background: rgba(148, 163, 184, 0.12);
            color: #cbd5e1;
            border: 1px solid rgba(148, 163, 184, 0.25);
        }

        .pill-fatica {
            background: var(--rose-bg);
            color: #fb7185;
            border: 1px solid var(--rose-border);
        }

        .val-pos {
            color: #34d399;
            font-weight: 600;
        }

        .val-neg {
            color: #fb7185;
            font-weight: 600;
        }

        /* Schede Atleti */
        .athlete-dossier {
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: all 0.2s;
        }

        .athlete-dossier:hover {
            border-color: rgba(99, 102, 241, 0.4);
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.4);
        }

        .athlete-header {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1.25rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
        }

        .athlete-name {
            font-family: 'Outfit', sans-serif;
            font-size: 1.35rem;
            font-weight: 700;
            color: #ffffff;
        }

        .athlete-sub {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .athlete-protocol {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.25);
            padding: 0.4rem 0.85rem;
            border-radius: 8px;
            font-size: 0.85rem;
            color: #c7d2fe;
            font-weight: 600;
        }

        .athlete-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.25rem;
            margin-bottom: 1.25rem;
        }

        .metric-box {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: var(--radius-md);
            padding: 1rem;
        }

        .metric-box-title {
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-dim);
            margin-bottom: 0.5rem;
            display: flex;
            justify-content: space-between;
        }

        .swot-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.25rem;
        }

        @media (max-width: 768px) {
            .swot-grid {
                grid-template-columns: 1fr;
            }
        }

        .swot-col {
            background: rgba(30, 41, 59, 0.35);
            border-radius: var(--radius-md);
            padding: 1rem;
            border-top: 3px solid;
        }

        .swot-strengths {
            border-top-color: var(--emerald);
        }

        .swot-weaknesses {
            border-top-color: var(--rose);
        }

        .swot-heading {
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .swot-strengths .swot-heading {
            color: #34d399;
        }

        .swot-weaknesses .swot-heading {
            color: #fb7185;
        }

        .prescription-box {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: var(--radius-md);
            padding: 1.25rem;
        }

        .prescription-title {
            font-family: 'Outfit', sans-serif;
            font-size: 0.95rem;
            font-weight: 700;
            color: #a5b4fc;
            margin-bottom: 0.6rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        ul.styled-list {
            padding-left: 1.2rem;
            font-size: 0.88rem;
            color: #cbd5e1;
        }

        ul.styled-list li {
            margin-bottom: 0.4rem;
        }

        /* Charts Container */
        .chart-container {
            position: relative;
            width: 100%;
            height: 380px;
            margin: 1.5rem 0;
        }

        /* Action Buttons */
        .btn-group {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-top: 1.5rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            font-weight: 700;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
            border: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
            color: #ffffff;
            box-shadow: 0 4px 14px 0 var(--primary-glow);
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px 0 var(--primary-glow);
        }

        .btn-outline {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            color: var(--text-main);
        }

        .btn-outline:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
        }
    </style>
</head>
<body>

<div class="container">

    <!-- Header Istituzionale -->
    <header class="report-header">
        <div class="badge-institution">T7 Workout • High Performance & Biomechanics Unit</div>
        <h1 class="report-title">Studio Sperimentale Post-Activation Potentiation (PAP)</h1>
        <p class="report-subtitle">Valutazione acuta neuromuscolare, audit metrologico dei tempi reali e linee guida prescrittive individualizzate per la sessione del 28 Luglio 2026.</p>
        
        <div class="meta-grid">
            <div class="meta-item">
                <span class="meta-label">Data Sessione</span>
                <span class="meta-value">28 Luglio 2026</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Strumentazione</span>
                <span class="meta-value">Optojump Next (1000 Hz)</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Campione Esaminato</span>
                <span class="meta-value">8 Atleti Agonisti</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Recupero Reale Rilevato</span>
                <span class="meta-value">18.1 – 25.5 minuti (Timestamp)</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Soglia MDC 95%</span>
                <span class="meta-value">SJ 5.38% | CMJ 7.31% | ABK 7.90%</span>
            </div>
        </div>
    </header>

    <!-- Sezione 1: Sintesi Metodologica & Audit dei Dati Reali -->
    <section class="glass-card">
        <div class="section-header">
            <div class="section-title">
                1. Quadro Metodologico, Strumentazione & Verifiche dell'Audit
            </div>
            <span class="section-tag tag-metrology">Metrologia Scientifica</span>
        </div>

        <p>L'indagine sperimentale si è posta l'obiettivo di determinare la capacità di otto diversi protocolli di condizionamento neuromuscolare (attivazione post-attivazione / PAPE) di modulare in acuto le componenti di forza concentrica pura e di reattività elastica riflessa (Fast-SSC e Slow-SSC). Tutti gli atleti hanno sostenuto una batteria identica di test standardizzati prima (PRE) e dopo (POST) la somministrazione del rispettivo carico condizionante.</p>

        <div class="callout callout-warning">
            <span class="callout-title">Rettifiche Metrologiche Cruciali (Audit Documentale):</span>
            <ul class="styled-list">
                <li><b>Rettifica Volumetrica dei Protocolli:</b> Sei atleti su otto hanno eseguito <b>due serie</b> anziché una singola serie come riportato nel primo documento di bozza. Il volume effettivo (12-20 contatti o 6 reps massimali) raddoppia il costo metabolico e spiega la predominanza di fatica accumulata.</li>
                <li><b>La Verità sui Tempi di Recupero Effettivi:</b> La finestra teorica di 7–8 minuti è stata confutata dall'analisi millimetrica dei timestamp strumentali del software Optojump. Il recupero reale è oscillato tra <b>18.08 e 25.50 minuti</b>. L'eventuale calo prestativo non è dunque ascrivibile a un recupero troppo breve, bensì alla dissipazione temporale dell'innesco neurale e all'eccessivo volume.</li>
                <li><b>Soglie di Rilevabilità Empiriche (MDC 95%):</b> La soglia arbitraria del ±2–3% è stata sostituita dal calcolo rigoroso della Minima Differenza Rilevabile derivata dal Coefficiente di Variazione entro-soggetto delle 47 coppie di salti (SJ 5.38%, CMJ 7.31%, ABK 7.90%). Sotto tale soglia, ogni variazione rappresenta naturale variabilità biologica (rumore).</li>
                <li><b>Pulizia del Record Corrotto:</b> Rimozione tassativa dell'atleta non testato (Angelo Righetto) e neutralizzazione del dato falsato manualmente sul salto ID 2680 (CMJ Michieletto).</li>
            </ul>
        </div>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Tipologia di Salto</th>
                        <th>Meccanismo Fisiologico Valutato</th>
                        <th>CV Entro-Soggetto</th>
                        <th>CV Best-of-2</th>
                        <th>Soglia MDC 95% (Reale)</th>
                        <th>Soglia Arbitraria Bozza</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b>Squat Jump (SJ)</b></td>
                        <td>Forza esplosivo-concentrica pura da fermo (90° ginocchio, no contro-movimento)</td>
                        <td class="num">2.35%</td>
                        <td class="num">1.94%</td>
                        <td class="num val-pos">± 5.38%</td>
                        <td class="num val-neg">± 3.00%</td>
                    </tr>
                    <tr>
                        <td><b>Countermovement Jump (CMJ)</b></td>
                        <td>Ciclo allungamento-accorciamento lento (Slow-SSC, accumulo elastico)</td>
                        <td class="num">3.19%</td>
                        <td class="num">2.64%</td>
                        <td class="num val-pos">± 7.31%</td>
                        <td class="num val-neg">± 3.00%</td>
                    </tr>
                    <tr>
                        <td><b>Abalakov Jump (ABK)</b></td>
                        <td>Coordinazione intersegmentaria e trasferimento d'inerzia arti superiori</td>
                        <td class="num">3.45%</td>
                        <td class="num">2.85%</td>
                        <td class="num val-pos">± 7.90%</td>
                        <td class="num val-neg">± 3.00%</td>
                    </tr>
                    <tr>
                        <td><b>Stiffness Test (10 Salti)</b></td>
                        <td>Forza reattiva rapida (Fast-SSC &lt; 200 ms), RSI e stiffness caviglia-piede</td>
                        <td class="num">Inferenza t-test</td>
                        <td class="num">Hedges' g</td>
                        <td class="num val-pos">p &lt; 0.05</td>
                        <td class="num val-neg">Trend descrittivo</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- Sezione 2: Tavola Sinottica Risultati Master -->
    <section class="glass-card">
        <div class="section-header">
            <div class="section-title">
                2. Matrice di Sintesi Master: Forza Concentrica vs Reattività
            </div>
            <span class="section-tag tag-coaching">Quadro Esecutivo</span>
        </div>

        <p>Confronto sinottico dei cambiamenti acuti registrati per ciascun atleta. La risposta della forza concentrica pura (Squat Jump) è disaccoppiata dalla risposta di reattività elastica (Reactive Strength Index):</p>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Atleta</th>
                        <th>Età</th>
                        <th>Massa</th>
                        <th>Protocollo Effettivo Svolto</th>
                        <th class="center">Contatti</th>
                        <th class="num">Rec. Reale</th>
                        <th class="num">Δ SJ %</th>
                        <th class="center">Esito Forza</th>
                        <th class="num">Δ RSI %</th>
                        <th class="num">p-value</th>
                        <th class="num">Hedges g</th>
                        <th class="center">Esito Reattività</th>
                        <th>Quadro Globale</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b>F. Azzolina</b></td>
                        <td>20</td>
                        <td>64 kg</td>
                        <td>Depth Jump 2×6 (3' rec)</td>
                        <td class="center">12</td>
                        <td class="num">18.1 min</td>
                        <td class="num val-pos">+3.83%</td>
                        <td class="center"><span class="pill pill-rumore">rumore</span></td>
                        <td class="num val-pos">+11.16%</td>
                        <td class="num">0.0480</td>
                        <td class="num">+1.08</td>
                        <td class="center"><span class="pill pill-reale">reale</span></td>
                        <td><span class="val-pos">Potenziamento Reattivo Puro</span></td>
                    </tr>
                    <tr>
                        <td><b>G. Masut</b></td>
                        <td>20</td>
                        <td>69 kg</td>
                        <td>60 m dash all-out con blocchi</td>
                        <td class="center">1</td>
                        <td class="num">21.6 min</td>
                        <td class="num val-neg">-0.59%</td>
                        <td class="center"><span class="pill pill-rumore">rumore</span></td>
                        <td class="num val-neg">-1.77%</td>
                        <td class="num">0.5659</td>
                        <td class="num">-0.26</td>
                        <td class="center"><span class="pill pill-rumore">rumore</span></td>
                        <td><span class="pill pill-neutro">Risposta Neutra</span></td>
                    </tr>
                    <tr>
                        <td><b>L. Marin</b></td>
                        <td>15</td>
                        <td>78 kg</td>
                        <td>Overcoming Isometrics 2×5 da 5″ (3' rec)</td>
                        <td class="center">10</td>
                        <td class="num">22.5 min</td>
                        <td class="num val-neg">-2.19%</td>
                        <td class="center"><span class="pill pill-rumore">rumore</span></td>
                        <td class="num val-neg">-0.83%</td>
                        <td class="num">0.7711</td>
                        <td class="num">-0.13</td>
                        <td class="center"><span class="pill pill-rumore">rumore</span></td>
                        <td><span class="pill pill-neutro">Risposta Neutra</span></td>
                    </tr>
                    <tr>
                        <td><b>L. Balai</b></td>
                        <td>15</td>
                        <td>74 kg</td>
                        <td>Squat parallelo 2×3 @80-85% RM (4' rec)</td>
                        <td class="center">6</td>
                        <td class="num">20.4 min</td>
                        <td class="num val-neg">-7.30%</td>
                        <td class="center"><span class="pill pill-fatica">calo reale</span></td>
                        <td class="num val-neg">-0.91%</td>
                        <td class="num">0.8804</td>
                        <td class="num">-0.07</td>
                        <td class="center"><span class="pill pill-rumore">rumore</span></td>
                        <td><span class="val-neg">Fatica Concentrica Isolatas</span></td>
                    </tr>
                    <tr>
                        <td><b>L. Ferrari</b></td>
                        <td>16</td>
                        <td>83 kg</td>
                        <td>Stacchi Trap Bar 2×3 @80-85% RM (4' rec)</td>
                        <td class="center">6</td>
                        <td class="num">21.6 min</td>
                        <td class="num val-neg">-4.57%</td>
                        <td class="center"><span class="pill pill-rumore">rumore</span></td>
                        <td class="num val-pos">+0.15%</td>
                        <td class="num">0.9760</td>
                        <td class="num">+0.01</td>
                        <td class="center"><span class="pill pill-rumore">rumore</span></td>
                        <td><span class="pill pill-neutro">Fatica Moderata / Neutro</span></td>
                    </tr>
                    <tr>
                        <td><b>M. Bettin</b></td>
                        <td>15</td>
                        <td>72 kg</td>
                        <td>Yielding Isometrics 2×15″ (4' rec)</td>
                        <td class="center">2</td>
                        <td class="num">20.1 min</td>
                        <td class="num val-pos">+5.80%</td>
                        <td class="center"><span class="pill pill-reale">guadagno reale</span></td>
                        <td class="num val-neg">-8.49%</td>
                        <td class="num">0.0062</td>
                        <td class="num">-1.48</td>
                        <td class="center"><span class="pill pill-fatica">calo reale</span></td>
                        <td><span class="val-pos">Forza ↑</span> / <span class="val-neg">Reattività ↓</span></td>
                    </tr>
                    <tr>
                        <td><b>I. Michieletto</b></td>
                        <td>18</td>
                        <td>61 kg</td>
                        <td>Drop Jump 2×5 + Depth Jump 2×5 (1' rec)</td>
                        <td class="center">20</td>
                        <td class="num">25.5 min</td>
                        <td class="num val-neg">-2.92%</td>
                        <td class="center"><span class="pill pill-rumore">rumore</span></td>
                        <td class="num val-neg">-9.54%</td>
                        <td class="num">0.0012</td>
                        <td class="num">-1.87</td>
                        <td class="center"><span class="pill pill-fatica">calo reale</span></td>
                        <td><span class="val-neg">Sovradosaggio Pliometrico</span></td>
                    </tr>
                    <tr>
                        <td><b>T. Pagan</b></td>
                        <td>23</td>
                        <td>85 kg</td>
                        <td>Power Clean 2×3 @80% RM (4' rec)</td>
                        <td class="center">6</td>
                        <td class="num">25.2 min</td>
                        <td class="num val-neg">-9.12%</td>
                        <td class="center"><span class="pill pill-fatica">calo reale</span></td>
                        <td class="num val-neg">-1.35%</td>
                        <td class="num">0.6588</td>
                        <td class="num">-0.21</td>
                        <td class="center"><span class="pill pill-rumore">rumore</span></td>
                        <td><span class="val-neg">Fatica Esplosiva Elevata</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="chart-container">
            <canvas id="chart-pap-matrix"></canvas>
        </div>
    </section>

    <!-- Sezione 3: Determinanti Biomeccanici e Approfondimenti Metrologici -->
    <section class="glass-card">
        <div class="section-header">
            <div class="section-title">
                3. Determinanti Biomeccanici dell'RSI & Analisi delle Strategie Motorie
            </div>
            <span class="section-tag tag-metrology">Analisi Statistica Avanzata</span>
        </div>

        <div class="swot-grid">
            <div class="metric-box">
                <div class="metric-box-title">
                    <span>Massa Corporea: Il Vero Predittore dell'RSI</span>
                    <span class="pill pill-reale">p = 0.0268</span>
                </div>
                <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 0.75rem;">
                    La regressione multivariata certifica che la <b>massa corporea</b> è l'unico determinante statisticamente significativo della reattività dell'atleta: 
                    <b>r = -0.7657 (IC 95%: [-0.955, -0.133], R² = 58.6%)</b>.
                </p>
                <p style="font-size: 0.84rem; color: var(--text-muted);">
                    Nel rimbalzo a terra (Fast-SSC &lt; 200 ms), ogni chilogrammo aggiuntivo funge da carico inerziale che sovraccarica la fase eccentrica di frenata. Gli atleti pesanti (&gt; 75 kg: Ferrari, Balai, Pagan) mostrano fisiologicamente indici RSI inferiori a prescindere dal loro livello di forza massimale.
                </p>
            </div>

            <div class="metric-box">
                <div class="metric-box-title">
                    <span>Potenza Concentrica vs Reattività</span>
                    <span class="pill pill-rumore">Non Significativa</span>
                </div>
                <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 0.75rem;">
                    La correlazione tra Potenza SJ e RSI di base risulta <b>r = +0.5288 (p = 0.178, IC 95%: [-0.280, +0.899])</b>. 
                    L'intervallo attraversa lo zero: il legame è statistico ma incerto.
                </p>
                <p style="font-size: 0.84rem; color: var(--text-muted);">
                    Un atleta con elevata potenza concentrica (es. Pagan 14.28 W/kg, Ferrari 13.75 W/kg) non è automaticamente reattivo nei rimbalzi tendinei brevi. I meccanismi miotatici ed elastici operano su vie neurofisiologiche del tutto slegate dalla capacità concentrica a catena aperta.
                </p>
            </div>
        </div>

        <div class="chart-container">
            <canvas id="chart-mass-rsi"></canvas>
        </div>

        <div class="callout callout-info">
            <span class="callout-title">Strategia nei Saltelli: Chi rimbalza e chi "spinge"?</span>
            <p>Dall'analisi della correlazione tra Tempo di Contatto (TC) e Altezza del salto all'interno della serie di 10 rimbalzi POST:</p>
            <ul class="styled-list" style="margin-top: 0.5rem;">
                <li><b>F. Azzolina (r = 0.704, p = 0.034) e T. Pagan (r = 0.682, p = 0.043):</b> Mostrano una correlazione positiva significativa. Sotto fatica, prolungano il tempo di appoggio a terra per produrre altezza con lavoro muscolare concentrico, sacrificando la rigidezza elastica (stiffness).</li>
                <li><b>L. Ferrari e L. Balai:</b> Mostrano una pendenza positiva dell'RSI durante la serie (p = 0.018 pre). Hanno bisogno di 3–4 contatti per "accendersi" (fenomeno di warm-up intra-serie), caratteristica tipica dei lanciatori con elevata massa muscolare.</li>
            </ul>
        </div>
    </section>

    <!-- Sezione 4: Schede Monografiche Individuali dei Singoli Atleti -->
    <section class="glass-card">
        <div class="section-header">
            <div class="section-title">
                4. Schede Tecniche Monografiche & Prescrizioni di Allenamento
            </div>
            <span class="section-tag tag-coaching">Dossier Atleti</span>
        </div>

        <!-- 1. Azzolina -->
        <div class="athlete-dossier">
            <div class="athlete-header">
                <div>
                    <h3 class="athlete-name">Federico Azzolina</h3>
                    <div class="athlete-sub">20 anni • 64 kg • Sprinter 400m • Morfologia: Magro, compatto, elastico, ottima stiffness della caviglia e tolleranza al lattato</div>
                </div>
                <div class="athlete-protocol">Protocollo: Depth Jump 2×6 da box 40 cm (3' rec) • Rec. Reale: 18.08 min</div>
            </div>

            <div class="athlete-grid">
                <div class="metric-box">
                    <div class="metric-box-title">Salti Singoli PRE vs POST</div>
                    <p style="font-size: 0.88rem;">SJ: 42.56 → 44.19 cm (<span class="val-pos">+3.83%</span>, rumore MDC)</p>
                    <p style="font-size: 0.88rem;">CMJ: 47.11 → 49.40 cm (<span class="val-pos">+4.86%</span>, rumore MDC)</p>
                    <p style="font-size: 0.88rem;">ABK: 52.00 → 55.34 cm (<span class="val-pos">+6.42%</span>, rumore MDC)</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Reattività Reale (Stiffness Test)</div>
                    <p style="font-size: 0.88rem;">RSI: 2.292 → 2.547 (<span class="val-pos">+11.16%</span>)</p>
                    <p style="font-size: 0.88rem;">Inferenza: <b>p = 0.0480</b> | Hedges g = <b>+1.08</b></p>
                    <p style="font-size: 0.88rem; color: #34d399; font-weight: 700;">Potenziamento Reattivo Certificato</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Dinamica dell'Appoggio</div>
                    <p style="font-size: 0.88rem;">TC medio: 0.143 s → 0.142 s</p>
                    <p style="font-size: 0.88rem;">TF medio: 0.518 s → 0.543 s</p>
                    <p style="font-size: 0.85rem; color: var(--text-dim);">Tendenza POST: spinta (r = 0.704)</p>
                </div>
            </div>

            <div class="swot-grid">
                <div class="swot-col swot-strengths">
                    <div class="swot-heading">Punti di Forza</div>
                    <ul class="styled-list">
                        <li>Eccezionale reattività neuromuscolare pura: unico vero responder positivo della sessione.</li>
                        <li>Ottimo rapporto potenza/peso (14.15 W/kg) e capacità di rimbalzo rapido senza cedere con la caviglia.</li>
                        <li>Eccellente rigidezza elastica muscolo-tendinea tibio-tarsica ideale per il giro di pista.</li>
                    </ul>
                </div>
                <div class="swot-col swot-weaknesses">
                    <div class="swot-heading">Punti di Debolezza</div>
                    <ul class="styled-list">
                        <li>Tendenza ad allungare il tempo di contatto quando cerca la massima altezza (r = 0.704).</li>
                        <li>Forza concentrica massimale assoluta migliorabile per consolidare la fase di accelerazione iniziale.</li>
                    </ul>
                </div>
            </div>

            <div class="prescription-box">
                <div class="prescription-title">Programmazione Tecnica & Qualità da Allenare</div>
                <p style="font-size: 0.88rem; margin-bottom: 0.5rem;"><b>Qualità Target:</b> Fast-SSC ad altissima frequenza con TC rigido &lt; 135 ms; riserva di forza concentrica massimale.</p>
                <ul class="styled-list">
                    <li><b>Esercizio Chiave:</b> Drop Jump da altezze variabili (30-45 cm) con cue vincolante "tempo a terra minimo", 3 serie x 4 ripetizioni, recupero 2.5'.</li>
                    <li><b>Forza Massima Complementare:</b> Trap Bar Deadlift o Half Squat: 4x4 reps @82.5% RM, 3' di recupero, per elevare la riserva di forza concentrica.</li>
                    <li><b>Priming PAP Pre-Gara (400m):</b> Depth Jump da 35 cm, <b>1 serie da 4 ripetizioni</b> (non 2x6!), con finestra di recupero pre-chiamata di 8–12 minuti.</li>
                </ul>
            </div>
        </div>

        <!-- 2. Masut -->
        <div class="athlete-dossier">
            <div class="athlete-header">
                <div>
                    <h3 class="athlete-name">Giacomo Masut</h3>
                    <div class="athlete-sub">20 anni • 69 kg • Sprinter 60m-100m • Morfologia: Magro, velocissimo, balzatore naturale, partenza esplosiva</div>
                </div>
                <div class="athlete-protocol">Protocollo: 60m Sprint All-out con blocchi • Rec. Reale: 21.55 min</div>
            </div>

            <div class="athlete-grid">
                <div class="metric-box">
                    <div class="metric-box-title">Salti Singoli PRE vs POST</div>
                    <p style="font-size: 0.88rem;">SJ: 47.18 → 46.90 cm (<span class="val-neg">-0.59%</span>, rumore)</p>
                    <p style="font-size: 0.88rem;">CMJ: 47.88 → 49.93 cm (<span class="val-pos">+4.28%</span>, rumore)</p>
                    <p style="font-size: 0.88rem;">ABK: 59.64 → 60.59 cm (<span class="val-pos">+1.59%</span>, rumore)</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Reattività (Stiffness Test)</div>
                    <p style="font-size: 0.88rem;">RSI: 2.313 → 2.272 (<span class="val-neg">-1.77%</span>)</p>
                    <p style="font-size: 0.88rem;">Inferenza: p = 0.5659 | Hedges g = -0.26</p>
                    <p style="font-size: 0.88rem; color: #cbd5e1; font-weight: 700;">Risposta Neutra / Invariata</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Parametri Meccanici</div>
                    <p style="font-size: 0.88rem;">Potenza Relativa: <b>14.90 W/kg</b> (massima del gruppo)</p>
                    <p style="font-size: 0.88rem;">Contributo Braccia (ABK-CMJ): <b>11.76 cm</b></p>
                    <p style="font-size: 0.85rem; color: var(--text-dim);">EUR PRE: 1.49% (deficit riutilizzo elastico)</p>
                </div>
            </div>

            <div class="swot-grid">
                <div class="swot-col swot-strengths">
                    <div class="swot-heading">Punti di Forza</div>
                    <ul class="styled-list">
                        <li>Potenza concentrica assoluta straordinaria (14.90 W/kg, salti oltre 60 cm con braccia).</li>
                        <li>Coordinazione intersegmentaria degli arti superiori di livello élite (+11.76 cm nel salto Abalakov).</li>
                        <li>Rimbalzo pulito e costante senza vizi di spinta concentrica a terra (r = 0.157).</li>
                    </ul>
                </div>
                <div class="swot-col swot-weaknesses">
                    <div class="swot-heading">Punti di Debolezza</div>
                    <ul class="styled-list">
                        <li>Basso EUR di base (1.49%): il CMJ è quasi uguale allo Squat Jump, disperde energia elastica nel contro-movimento.</li>
                        <li>Il 60m all-out ha causato lieve fatica metabolica/lattacida che ha neutralizzato il potenziamento a 21'.</li>
                    </ul>
                </div>
            </div>

            <div class="prescription-box">
                <div class="prescription-title">Programmazione Tecnica & Qualità da Allenare</div>
                <p style="font-size: 0.88rem; margin-bottom: 0.5rem;"><b>Qualità Target:</b> Efficienza di transizione Slow-SSC; tasso di sviluppo della forza eccentrica (eccentric RFD).</p>
                <ul class="styled-list">
                    <li><b>Esercizio Chiave:</b> Hurdle Jumps continui (4-5 ostacoli a 60-76 cm) con focus sulla rapidità di inversione eccentrico-concentrica, 4 serie, recupero 2.5'.</li>
                    <li><b>Forza con Frenata Eccentrica:</b> Squat con fase eccentrica controllata (3 secondi) e risalita esplosiva (CAT): 4x3 reps @75-80% RM.</li>
                    <li><b>Priming PAP Pre-Gara (60m/100m):</b> 2 accelerazioni da 20-25 metri dai blocchi (non un 60m intero all-out!), con 8–10 minuti di recupero prima della partenza.</li>
                </ul>
            </div>
        </div>

        <!-- 3. Marin -->
        <div class="athlete-dossier">
            <div class="athlete-header">
                <div>
                    <h3 class="athlete-name">Leonardo Marin</h3>
                    <div class="athlete-sub">15 anni • 78 kg • Sprinter • Morfologia: Alto, possente, molto muscoloso per l'età, potente ma lento nell'inversione</div>
                </div>
                <div class="athlete-protocol">Protocollo: Overcoming Isometrics 2×5 da 5″ al multipower (3' rec) • Rec. Reale: 22.47 min</div>
            </div>

            <div class="athlete-grid">
                <div class="metric-box">
                    <div class="metric-box-title">Salti Singoli PRE vs POST</div>
                    <p style="font-size: 0.88rem;">SJ: 42.84 → 41.90 cm (<span class="val-neg">-2.19%</span>, rumore)</p>
                    <p style="font-size: 0.88rem;">CMJ: 43.15 → 44.21 cm (<span class="val-pos">+2.46%</span>, rumore)</p>
                    <p style="font-size: 0.88rem;">ABK: 46.80 → 47.58 cm (<span class="val-pos">+1.67%</span>, rumore)</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Reattività (Stiffness Test)</div>
                    <p style="font-size: 0.88rem;">RSI: 1.923 → 1.907 (<span class="val-neg">-0.83%</span>)</p>
                    <p style="font-size: 0.88rem;">Inferenza: p = 0.7711 | Hedges g = -0.13</p>
                    <p style="font-size: 0.88rem; color: #cbd5e1; font-weight: 700;">Risposta Neutra</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Parametri Meccanici</div>
                    <p style="font-size: 0.88rem;">Massa: 78 kg • Potenza: 14.20 W/kg</p>
                    <p style="font-size: 0.88rem;">Contributo Braccia (ABK-CMJ): 3.65 cm</p>
                    <p style="font-size: 0.85rem; color: var(--text-dim);">EUR PRE: 0.72% (deficit elastico acuto)</p>
                </div>
            </div>

            <div class="swot-grid">
                <div class="swot-col swot-strengths">
                    <div class="swot-heading">Punti di Forza</div>
                    <ul class="styled-list">
                        <li>Fisico imponente e grande potenziale di forza muscolare concentrica per un quindicenne (78 kg, 14.2 W/kg).</li>
                        <li>Stabilità del tronco e del bacino eccellente sotto sforzo isometrico.</li>
                    </ul>
                </div>
                <div class="swot-col swot-weaknesses">
                    <div class="swot-heading">Punti di Debolezza</div>
                    <ul class="styled-list">
                        <li>RSI modesto (&lt; 2.0) e riutilizzo elastico quasi nullo (EUR 0.72%): appoggio pesante e ammortizzazione lenta.</li>
                        <li>Uso delle braccia inefficiente nel salto (ABK guadagna solo 3.6 cm sul CMJ).</li>
                    </ul>
                </div>
            </div>

            <div class="prescription-box">
                <div class="prescription-title">Programmazione Tecnica & Qualità da Allenare</div>
                <p style="font-size: 0.88rem; margin-bottom: 0.5rem;"><b>Qualità Target:</b> Stiffness del tendine d'Achille; reattività del piede; coordinazione della catena cinetica superiore.</p>
                <ul class="styled-list">
                    <li><b>Esercizio Chiave:</b> Pogo Jumps e rimbalzi elastici su terreno rigido: 4 serie x 15 rimbalzi ad alta frequenza, recupero 1.5'.</li>
                    <li><b>Educativi Braccia-Corsa:</b> Esercizi coordinativi per la frustata degli arti superiori abbinati a balzi orizzontali.</li>
                    <li><b>Priming PAP Pre-Gara:</b> Overcoming Isometrics ridotto: <b>1 serie x 3 ripetizioni da 3 secondi</b> (non 2x5 da 5"!), con 10 minuti di recupero.</li>
                </ul>
            </div>
        </div>

        <!-- 4. Balai -->
        <div class="athlete-dossier">
            <div class="athlete-header">
                <div>
                    <h3 class="athlete-name">Leonis Balai</h3>
                    <div class="athlete-sub">15 anni • 74 kg • Lanciatore (Peso e Disco) • Morfologia: Grosso, compatto, muscoloso, media altezza, lento nelle accelerazioni</div>
                </div>
                <div class="athlete-protocol">Protocollo: Squat parallelo bilanciere 2×3 @80-85% RM (4' rec) • Rec. Reale: 20.35 min</div>
            </div>

            <div class="athlete-grid">
                <div class="metric-box">
                    <div class="metric-box-title">Salti Singoli PRE vs POST</div>
                    <p style="font-size: 0.88rem;">SJ: 37.03 → 34.33 cm (<span class="val-neg">-7.30%</span>, <b>calo reale MDC</b>)</p>
                    <p style="font-size: 0.88rem;">CMJ: 37.70 → 37.18 cm (<span class="val-neg">-1.38%</span>, rumore)</p>
                    <p style="font-size: 0.88rem;">ABK: 42.91 → 42.32 cm (<span class="val-neg">-1.39%</span>, rumore)</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Reattività (Stiffness Test)</div>
                    <p style="font-size: 0.88rem;">RSI: 1.696 → 1.680 (<span class="val-neg">-0.91%</span>)</p>
                    <p style="font-size: 0.88rem;">Inferenza: p = 0.8804 | Hedges g = -0.07</p>
                    <p style="font-size: 0.88rem; color: #cbd5e1; font-weight: 700;">Reattività Invariata</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Dinamica di Serie</div>
                    <p style="font-size: 0.88rem;">Accensione intra-serie nel PRE: <b>p = 0.016</b></p>
                    <p style="font-size: 0.88rem;">RSI base: <b>1.696</b> (tra i più bassi)</p>
                    <p style="font-size: 0.85rem; color: var(--text-dim);">Fatica concentrica netta su Squat Jump</p>
                </div>
            </div>

            <div class="swot-grid">
                <div class="swot-col swot-strengths">
                    <div class="swot-heading">Punti di Forza</div>
                    <ul class="styled-list">
                        <li>Forte stabilità del cingolo pelvico e compattezza strutturale nel gesto di spinta a terra.</li>
                        <li>Capacità di incremento della performance durante la serie (warm-up effect progressivo).</li>
                    </ul>
                </div>
                <div class="swot-col swot-weaknesses">
                    <div class="swot-heading">Punti di Debolezza</div>
                    <ul class="styled-list">
                        <li>Grave suscettibilità alla fatica concentrica: lo squat all'85% RM a 15 anni ha abbattuto lo Squat Jump (-7.30%).</li>
                        <li>Lentezza strutturale: velocità esecutiva e reattività del piede molto ridotte (RSI 1.70).</li>
                    </ul>
                </div>
            </div>

            <div class="prescription-box">
                <div class="prescription-title">Programmazione Tecnica & Qualità da Allenare</div>
                <p style="font-size: 0.88rem; margin-bottom: 0.5rem;"><b>Qualità Target:</b> Rate of Force Development (RFD) concentrico con carichi moderati; velocità di estensione anca-ginocchio.</p>
                <ul class="styled-list">
                    <li><b>Esercizio Chiave:</b> Jump Squat con trappola esagonale o manubri a basso carico (20-30% RM) focalizzati sulla massima accelerazione concentrica: 4x4 reps, rec 2.5'.</li>
                    <li><b>Balistica per Lanciatori:</b> Lanci con palla medica pesante (4-5 kg) contro il muro o verso l'alto: 5 serie x 4 lanci massimali.</li>
                    <li><b>Priming PAP Pre-Gara:</b> Jump Squat leggero con giubbotto zavorrato (10% peso corporeo), 2 serie da 3 ripetizioni, con 12–15 minuti di recupero prima della pedana di lancio.</li>
                </ul>
            </div>
        </div>

        <!-- 5. Ferrari -->
        <div class="athlete-dossier">
            <div class="athlete-header">
                <div>
                    <h3 class="athlete-name">Lorenzo Ferrari</h3>
                    <div class="athlete-sub">16 anni • 83 kg • Lanciatore • Morfologia: Molto alto, massiccio, compatto, muscolatura densa, lento nelle accelerazioni brevi</div>
                </div>
                <div class="athlete-protocol">Protocollo: Stacchi Trap Bar 2×3 @80-85% RM (4' rec) • Rec. Reale: 21.58 min</div>
            </div>

            <div class="athlete-grid">
                <div class="metric-box">
                    <div class="metric-box-title">Salti Singoli PRE vs POST</div>
                    <p style="font-size: 0.88rem;">SJ: 40.16 → 38.33 cm (<span class="val-neg">-4.57%</span>, rumore)</p>
                    <p style="font-size: 0.88rem;">CMJ: 43.94 → 41.81 cm (<span class="val-neg">-4.84%</span>, rumore)</p>
                    <p style="font-size: 0.88rem;">ABK: 49.31 → 47.39 cm (<span class="val-neg">-3.89%</span>, rumore)</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Reattività (Stiffness Test)</div>
                    <p style="font-size: 0.88rem;">RSI: 1.991 → 1.994 (<span class="val-pos">+0.15%</span>)</p>
                    <p style="font-size: 0.88rem;">Inferenza: p = 0.9760 | Hedges g = +0.01</p>
                    <p style="font-size: 0.88rem; color: #cbd5e1; font-weight: 700;">Reattività Invariata</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Accensione Intra-Serie</div>
                    <p style="font-size: 0.88rem;">Pendenza RSI serie PRE: <b>p = 0.018</b></p>
                    <p style="font-size: 0.88rem;">Pendenza RSI serie POST: <b>p = 0.059</b></p>
                    <p style="font-size: 0.85rem; color: var(--text-dim);">Forte necessità di riscaldamento neurale</p>
                </div>
            </div>

            <div class="swot-grid">
                <div class="swot-col swot-strengths">
                    <div class="swot-heading">Punti di Forza</div>
                    <ul class="styled-list">
                        <li>Forza massimale assoluta elevata e notevole capacità di trazione a terra con Trap Bar.</li>
                        <li>Fenomeno di "accensione" molto evidente: i suoi rimbalzi migliorano drasticamente dal 4° al 10° salto.</li>
                    </ul>
                </div>
                <div class="swot-col swot-weaknesses">
                    <div class="swot-heading">Punti di Debolezza</div>
                    <ul class="styled-list">
                        <li>Elevata inerzia corporea (83 kg) che penalizza il rimbalzo reattivo rapido.</li>
                        <li>Fatica residua diffusa su tutti i salti singoli indotta dallo stacco pesante a 16 anni.</li>
                    </ul>
                </div>
            </div>

            <div class="prescription-box">
                <div class="prescription-title">Programmazione Tecnica & Qualità da Allenare</div>
                <p style="font-size: 0.88rem; margin-bottom: 0.5rem;"><b>Qualità Target:</b> Velocizzazione del reclutamento neurale iniziale; potenza esplosiva della catena posteriore.</p>
                <ul class="styled-list">
                    <li><b>Esercizio Chiave:</b> Clean Pulls (tirate esplosive al petto dai blocchi al ginocchio): 4 serie x 3 reps @75% RM, rec 2.5'.</li>
                    <li><b>Protocollo di Warm-up Esteso:</b> Integrare obbligatoriamente 3-4 serie di saltelli progressivi prima di qualsiasi prova esplosiva per favorire l'innesco neurale.</li>
                    <li><b>Priming PAP Pre-Gara:</b> Trap Bar Deadlift a volume dimezzato: <b>1 sola serie da 2 ripetizioni @80% RM</b>, con finestra di recupero di 12–16 minuti.</li>
                </ul>
            </div>
        </div>

        <!-- 6. Bettin -->
        <div class="athlete-dossier">
            <div class="athlete-header">
                <div>
                    <h3 class="athlete-name">Matteo Bettin</h3>
                    <div class="athlete-sub">15 anni • 72 kg • Lanciatore • Morfologia: Medio-basso, compatto, muscoloso, buoni piedi ma bassa potenza concentrica</div>
                </div>
                <div class="athlete-protocol">Protocollo: Yielding Isometrics 2×15″ in accosciata (4' rec) • Rec. Reale: 20.15 min</div>
            </div>

            <div class="athlete-grid">
                <div class="metric-box">
                    <div class="metric-box-title">Salti Singoli PRE vs POST</div>
                    <p style="font-size: 0.88rem;">SJ: 32.59 → 34.48 cm (<span class="val-pos">+5.80%</span>, <b>guadagno reale MDC</b>)</p>
                    <p style="font-size: 0.88rem;">CMJ: 37.26 → 36.90 cm (<span class="val-neg">-0.97%</span>, rumore)</p>
                    <p style="font-size: 0.88rem;">ABK: 41.60 → 41.04 cm (<span class="val-neg">-1.35%</span>, rumore)</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Reattività (Stiffness Test)</div>
                    <p style="font-size: 0.88rem;">RSI: 1.841 → 1.685 (<span class="val-neg">-8.49%</span>)</p>
                    <p style="font-size: 0.88rem;">Inferenza: <b>p = 0.0062</b> | Hedges g = <b>-1.48</b></p>
                    <p style="font-size: 0.88rem; color: #fb7185; font-weight: 700;">Crollo Reattivo Significativo</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Quadro di Dissociazione</div>
                    <p style="font-size: 0.88rem;">Forza Concentrica (SJ): <span class="val-pos">Potenziata (+5.8%)</span></p>
                    <p style="font-size: 0.88rem;">Reattività Tendinea (RSI): <span class="val-neg">Compromessa (-8.5%)</span></p>
                    <p style="font-size: 0.85rem; color: var(--text-dim);">L'isometria lunga inibisce il riflesso elastico</p>
                </div>
            </div>

            <div class="swot-grid">
                <div class="swot-col swot-strengths">
                    <div class="swot-heading">Punti di Forza</div>
                    <ul class="styled-list">
                        <li>Unico atleta della sessione con un incremento reale e dimostrabile nello Squat Jump (+5.80%).</li>
                        <li>Eccellente tolleranza al lavoro isometrico e capacità di generare tensione statica massimale.</li>
                    </ul>
                </div>
                <div class="swot-col swot-weaknesses">
                    <div class="swot-heading">Punti di Debolezza</div>
                    <ul class="styled-list">
                        <li>Crollo drammatico dell'RSI (-8.49%, p = 0.006): l'isometria prolungata (2x15") distrugge la reattività tendinea.</li>
                        <li>Altezza di salto assoluta più bassa del gruppo (SJ base 32.59 cm), marcato deficit di potenza esplosiva.</li>
                    </ul>
                </div>
            </div>

            <div class="prescription-box">
                <div class="prescription-title">Programmazione Tecnica & Qualità da Allenare</div>
                <p style="font-size: 0.88rem; margin-bottom: 0.5rem;"><b>Qualità Target:</b> Potenza esplosiva concentrica e balistica; de-inibizione del riflesso di stiramento dopo contrazioni statiche.</p>
                <ul class="styled-list">
                    <li><b>Esercizio Chiave:</b> Squat Jump concentrici dai pin (partenza completamente statica da fermo su fermi a 90°): 4 serie x 3 reps al 30% RM, rec 2.5'.</li>
                    <li><b>Reattività Tendinea:</b> Drop Jump da plinto basso (20-25 cm) per riattivare il riflesso miotatico senza carico articolare: 3 serie x 5 ripetizioni.</li>
                    <li><b>Priming PAP Pre-Gara (Lancio del Peso):</b> Isometria yielding a volume dimezzato: <b>1 serie da 8–10 secondi</b> (mai superare i 10"!), 10–12 minuti prima della prova. Vietata prima di corse o salti!</li>
                </ul>
            </div>
        </div>

        <!-- 7. Michieletto -->
        <div class="athlete-dossier">
            <div class="athlete-header">
                <div>
                    <h3 class="athlete-name">Ivan Michieletto</h3>
                    <div class="athlete-sub">18 anni • 61 kg • Multiplista (Decathlon, Salti, Ostacoli) • Morfologia: Magro, coordinatissimo, piedi d'élite, doti elastiche innate straordinarie</div>
                </div>
                <div class="athlete-protocol">Protocollo: Drop Jump 2×5 + Depth Jump 2×5 (1' rec) • Rec. Reale: 25.50 min</div>
            </div>

            <div class="athlete-grid">
                <div class="metric-box">
                    <div class="metric-box-title">Salti Singoli PRE vs POST</div>
                    <p style="font-size: 0.88rem;">SJ: 43.73 → 42.46 cm (<span class="val-neg">-2.92%</span>, rumore)</p>
                    <p style="font-size: 0.88rem;">CMJ: 48.42 → 44.02 cm (<span class="val-neg">-9.09%</span>, <b>calo reale MDC</b>)</p>
                    <p style="font-size: 0.88rem;">ABK: 57.00 → 53.85 cm (<span class="val-neg">-5.54%</span>, rumore)</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Reattività (Stiffness Test)</div>
                    <p style="font-size: 0.88rem;">RSI: 2.869 → 2.595 (<span class="val-neg">-9.54%</span>)</p>
                    <p style="font-size: 0.88rem;">Inferenza: <b>p = 0.0012</b> | Hedges g = <b>-1.87</b></p>
                    <p style="font-size: 0.88rem; color: #fb7185; font-weight: 700;">Grave Crollo da Sovradosaggio</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Profilo Biomeccanico</div>
                    <p style="font-size: 0.88rem;">RSI PRE: <b>2.869</b> (il più reattivo in assoluto)</p>
                    <p style="font-size: 0.88rem;">Contatti Eseguiti: <b>20 impatti massimali</b></p>
                    <p style="font-size: 0.85rem; color: var(--text-dim);">Gli atleti elastici sono i più fragili al volume</p>
                </div>
            </div>

            <div class="swot-grid">
                <div class="swot-col swot-strengths">
                    <div class="swot-heading">Punti di Forza</div>
                    <ul class="styled-list">
                        <li>Reattività del piede e stiffness tendinea di livello élite assoluto (RSI 2.87, il migliore del roster).</li>
                        <li>Coordinazione multilaterale straordinaria e altissima capacità di rimbalzo con scarso dispendio energetico.</li>
                    </ul>
                </div>
                <div class="swot-col swot-weaknesses">
                    <div class="swot-heading">Punti di Debolezza</div>
                    <ul class="styled-list">
                        <li>Altissima vulnerabilità al sovradosaggio pliometrico: 20 contatti da box alto hanno saturato il sistema tendineo.</li>
                        <li>Crollo congiunto di CMJ (-9.09%) e RSI (-9.54%): inibizione autogena protettiva degli organi tendinei del Golgi.</li>
                    </ul>
                </div>
            </div>

            <div class="prescription-box">
                <div class="prescription-title">Programmazione Tecnica & Qualità da Allenare</div>
                <p style="font-size: 0.88rem; margin-bottom: 0.5rem;"><b>Qualità Target:</b> Riserva di forza concentrica ed eccentrica per blindare i tendini; gestione a bassissimo volume della pliometria.</p>
                <ul class="styled-list">
                    <li><b>Esercizio Chiave:</b> Pliometria a micro-dosaggio: Drop Jump da 35 cm, massimo <b>2 serie x 3 ripetizioni</b>, recupero completo 3 minuti. Mai accumulare contatti stancanti.</li>
                    <li><b>Rinforzo Eccentrico Protettivo:</b> Nordic Hamstring Curl e Calf raise su gradino con fase eccentrica lenta (4 secondi) e sovraccarico.</li>
                    <li><b>Priming PAP Pre-Gara (Lungo, Alto, Ostacoli):</b> MAI eseguire 20 salti! Protocollo ideale: <b>1 serie da 3 balzi orizzontali alternati massimali</b>, con recupero di 8–10 minuti.</li>
                </ul>
            </div>
        </div>

        <!-- 8. Pagan -->
        <div class="athlete-dossier">
            <div class="athlete-header">
                <div>
                    <h3 class="athlete-name">Tommaso Pagan</h3>
                    <div class="athlete-sub">23 anni • 85 kg • Sprinter • Morfologia: Alto, possente, muscoloso, il più anziano e pesante, coordinato ma con appoggi prolungati</div>
                </div>
                <div class="athlete-protocol">Protocollo: Power Clean 2×3 @80% RM con bilanciere (4' rec) • Rec. Reale: 25.20 min</div>
            </div>

            <div class="athlete-grid">
                <div class="metric-box">
                    <div class="metric-box-title">Salti Singoli PRE vs POST</div>
                    <p style="font-size: 0.88rem;">SJ: 43.33 → 39.38 cm (<span class="val-neg">-9.12%</span>, <b>calo reale MDC</b>)</p>
                    <p style="font-size: 0.88rem;">CMJ: 46.68 → 42.20 cm (<span class="val-neg">-9.58%</span>, <b>calo reale MDC</b>)</p>
                    <p style="font-size: 0.88rem;">ABK: 53.80 → 50.57 cm (<span class="val-neg">-6.00%</span>, rumore)</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Reattività (Stiffness Test)</div>
                    <p style="font-size: 0.88rem;">RSI: 1.782 → 1.758 (<span class="val-neg">-1.35%</span>)</p>
                    <p style="font-size: 0.88rem;">Inferenza: p = 0.6588 | Hedges g = -0.21</p>
                    <p style="font-size: 0.88rem; color: #cbd5e1; font-weight: 700;">Reattività Invariata</p>
                </div>
                <div class="metric-box">
                    <div class="metric-box-title">Strategia di Spinta a Terra</div>
                    <p style="font-size: 0.88rem;">Correlazione TC ↔ Altezza: <b>r = 0.682 (p = 0.043)</b></p>
                    <p style="font-size: 0.88rem;">Strategia: <b>Spinta concentrica prolungata</b></p>
                    <p style="font-size: 0.85rem; color: var(--text-dim);">Confutata la presunta strategia riflessa</p>
                </div>
            </div>

            <div class="swot-grid">
                <div class="swot-col swot-strengths">
                    <div class="swot-heading">Punti di Forza</div>
                    <ul class="styled-list">
                        <li>Alta padronanza tecnica nelle alzate olimpiche e grande forza dinamica assoluta a catena estensoria tripla.</li>
                        <li>Notevole robustezza scheletrico-articolare e coordinazione generale.</li>
                    </ul>
                </div>
                <div class="swot-col swot-weaknesses">
                    <div class="swot-heading">Punti di Debolezza</div>
                    <ul class="styled-list">
                        <li>Crollo massivo su tutti i salti verticali: SJ -9.12% e CMJ -9.58% (entrambi cali reali e marcati da sovradosaggio di girata).</li>
                        <li>Tendenza marcata a "barare" nei saltelli: per saltare in alto prolunga il tempo di contatto a terra (r = 0.68, p = 0.043).</li>
                    </ul>
                </div>
            </div>

            <div class="prescription-box">
                <div class="prescription-title">Programmazione Tecnica & Qualità da Allenare</div>
                <p style="font-size: 0.88rem; margin-bottom: 0.5rem;"><b>Qualità Target:</b> Rate of Force Development precoce (0-100 ms); rigidità tibio-tarsica; riduzione del tempo di frenata.</p>
                <ul class="styled-list">
                    <li><b>Esercizio Chiave:</b> Hang High Pulls o Tirate alte al petto dal blocco con carichi medi (50-60% RM) focalizzate sul picco di velocità: 4 serie x 3 reps, rec 2.5'.</li>
                    <li><b>Reattività Piede:</b> Pogo Jumps con vincolo temporale rigido su pedana Optojump (&lt; 160 ms): 4 serie x 8 rimbalzi.</li>
                    <li><b>Priming PAP Pre-Gara (Sprint):</b> Power Clean a carico e volume ridotti: <b>1 serie x 2 ripetizioni al 70% RM</b>, con finestra di recupero di 12–15 minuti.</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Sezione 5: Raccomandazioni per la Direzione Tecnica -->
    <section class="glass-card">
        <div class="section-header">
            <div class="section-title">
                5. Raccomandazioni Operative per la Direzione Tecnica
            </div>
            <span class="section-tag tag-metrology">Linee Guida Future</span>
        </div>

        <div class="callout callout-success">
            <span class="callout-title">Standard Operativi Obbligatori per la Prossima Sessione:</span>
            <ul class="styled-list">
                <li><b>Tre Prove per Salto Singolo (Non Due):</b> L'esecuzione di 3 tentativi per salto riduce l'errore tipico della misura di circa il 18%, abbassando la soglia MDC del CMJ da 7.31% a circa 5.9%. Questo permetterà di rilevare miglioramenti oggi oscurati dal rumore.</li>
                <li><b>Sessione di Calibrazione Senza Carico (Control Baseline):</b> Eseguire una sessione dedicata con doppia batteria a distanza di 20 minuti a riposo per calcolare il vero errore biologico circadiano specifico di questo gruppo.</li>
                <li><b>Personalizzazione delle Finestre di Recupero Pre-Gara:</b>
                    <ul style="padding-left: 1rem; margin-top: 0.25rem;">
                        <li>Atleti leggeri ed elastici (Azzolina, Masut, Michieletto): <b>6–10 minuti</b> dopo stimoli brevissimi a basso volume.</li>
                        <li>Atleti muscolari e pesanti (Pagan, Ferrari, Balai): <b>12–16 minuti</b> per consentire il completo smaltimento della fatica concentrica.</li>
                    </ul>
                </li>
                <li><b>Pliometria Massimale:</b> Non superare mai <b>4–6 contatti totali</b> per gli stimoli di potenziamento acuto nei saltatori e velocisti reattivi.</li>
            </ul>
        </div>
    </section>

    <!-- Footer -->
    <footer style="text-align: center; padding: 2rem 0; color: var(--text-dim); font-size: 0.85rem; border-top: 1px solid var(--border-color);">
        <p>T7 Workout Suite • Modulo Data Analisi & Studio Sperimentale PAP</p>
        <p>Documento redatto in conformità con la letteratura scientifica internazionale (Tier 1 & Tier 2: JSCR, Sports Medicine, IJSPP).</p>
    </footer>

</div>

<script>
    // Inizializzazione Grafici Chart.js
    window.addEventListener('DOMContentLoaded', () => {
        // Grafico 1: Matrice Risposta PAP (Δ SJ % vs Δ RSI %)
        const ctxMatrix = document.getElementById('chart-pap-matrix');
        if (ctxMatrix) {
            new Chart(ctxMatrix, {
                type: 'bar',
                data: {
                    labels: ['F. Azzolina', 'G. Masut', 'L. Marin', 'L. Balai', 'L. Ferrari', 'M. Bettin', 'I. Michieletto', 'T. Pagan'],
                    datasets: [
                        {
                            label: 'Risposta di FORZA (Δ SJ %)',
                            data: [3.83, -0.59, -2.19, -7.30, -4.57, 5.80, -2.92, -9.12],
                            backgroundColor: 'rgba(99, 102, 241, 0.75)',
                            borderColor: '#6366f1',
                            borderWidth: 1.5,
                            borderRadius: 6
                        },
                        {
                            label: 'Risposta di REATTIVITÀ (Δ RSI %)',
                            data: [11.16, -1.77, -0.83, -0.91, 0.15, -8.49, -9.54, -1.35],
                            backgroundColor: 'rgba(0, 240, 255, 0.75)',
                            borderColor: '#00f0ff',
                            borderWidth: 1.5,
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#cbd5e1', font: { family: 'Inter', size: 12 } }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => \` \${ctx.dataset.label}: \${ctx.raw > 0 ? '+' : ''}\${ctx.raw}%\`
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.06)' },
                            ticks: { color: '#94a3b8', callback: (v) => v + '%' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#cbd5e1', font: { weight: '600' } }
                        }
                    }
                }
            });
        }

        // Grafico 2: Regressione Massa Corporea vs RSI di Base
        const ctxMass = document.getElementById('chart-mass-rsi');
        if (ctxMass) {
            new Chart(ctxMass, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: 'Atleti Sperimentali (r = -0.766, p = 0.0268)',
                            data: [
                                { x: 61, y: 2.869, name: 'I. Michieletto' },
                                { x: 64, y: 2.292, name: 'F. Azzolina' },
                                { x: 69, y: 2.313, name: 'G. Masut' },
                                { x: 72, y: 1.841, name: 'M. Bettin' },
                                { x: 74, y: 1.696, name: 'L. Balai' },
                                { x: 78, y: 1.923, name: 'L. Marin' },
                                { x: 83, y: 1.991, name: 'L. Ferrari' },
                                { x: 85, y: 1.782, name: 'T. Pagan' }
                            ],
                            backgroundColor: '#00f0ff',
                            borderColor: '#ffffff',
                            borderWidth: 1.5,
                            pointRadius: 7,
                            pointHoverRadius: 9
                        },
                        {
                            type: 'line',
                            label: 'Trendline Lineare (R² = 58.6%)',
                            data: [
                                { x: 60, y: 2.75 },
                                { x: 86, y: 1.65 }
                            ],
                            borderColor: 'rgba(244, 63, 94, 0.8)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            pointRadius: 0,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#cbd5e1', font: { family: 'Inter', size: 12 } }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    if (ctx.raw.name) {
                                        return \` \${ctx.raw.name}: \${ctx.raw.x} kg → RSI \${ctx.raw.y}\`;
                                    }
                                    return \` Linea di regressione\`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Massa Corporea (kg)', color: '#94a3b8' },
                            grid: { color: 'rgba(255, 255, 255, 0.06)' },
                            ticks: { color: '#cbd5e1' }
                        },
                        y: {
                            title: { display: true, text: 'Reactive Strength Index (RSI)', color: '#94a3b8' },
                            grid: { color: 'rgba(255, 255, 255, 0.06)' },
                            ticks: { color: '#cbd5e1' }
                        }
                    }
                }
            });
        }
    });
</script>

</body>
</html>
`;

    const target1 = path.join(__dirname, '..', 'Cartella Temporanea', 'REPORT_DEFINITIVO_PAP_28_07_2026.html');
    const target2 = path.join(__dirname, '..', 'REPORT_DEFINITIVO_PAP_28_07_2026.html');

    fs.writeFileSync(target1, html, 'utf-8');
    fs.writeFileSync(target2, html, 'utf-8');

    console.log('Report HTML definitivo generato con successo in:');
    console.log(' - ' + target1);
    console.log(' - ' + target2);
}

generateHtmlReport();
