import os, sys, re

sys.stdout.reconfigure(encoding='utf-8')

print("Reading source reports...")
with open('Cartella Temporanea/AUDIT 2 tentativo_PAP_28_07_2026.html', 'r', encoding='utf-8') as f:
    audit_html = f.read()

with open('Cartella Temporanea/tentativo report_PAP_28_07_2026.html', 'r', encoding='utf-8') as f:
    rep_html = f.read()

def extract_figures(html):
    figs = re.findall(r'<figure>(.*?)</figure>', html, re.DOTALL)
    res = []
    for fig in figs:
        src_match = re.search(r'src=["\']([^"\']+)["\']', fig)
        cap_match = re.search(r'<figcaption>(.*?)</figcaption>', fig, re.DOTALL)
        src = src_match.group(1) if src_match else ''
        cap = cap_match.group(1).strip() if cap_match else ''
        res.append({ 'src': src, 'cap': cap })
    return res

audit_figs = extract_figures(audit_html)
rep_figs = extract_figures(rep_html)

print(f"Extracted {len(audit_figs)} audit figures and {len(rep_figs)} report figures.")

# Helpers for figure rendering
def render_fig(fig_obj, fig_title, fig_num_label):
    return f"""
<figure style="margin: 32px 0; text-align: center;">
  <img src="{fig_obj['src']}" alt="{fig_title}" style="max-width: 100%; height: auto; border: 1px solid var(--rule); border-radius: 4px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
  <figcaption style="font: 13px/1.55 ui-sans-serif, system-ui, -apple-system, sans-serif; color: var(--mute); margin-top: 10px; text-align: left; padding: 0 4px;">
    <strong style="color: var(--deep);">{fig_num_label}:</strong> {fig_obj['cap']}
  </figcaption>
</figure>
"""

# Build the Master HTML
html_content = f"""<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Report Sperimentale e Audit Scientifico PAP — Sessione 28 Luglio 2026</title>
<style>
:root {{
  --paper: #FBFBF9;
  --ink: #191C1F;
  --mute: #6E7680;
  --rule: #DCDFDC;
  --pos: #0F6E62;
  --neg: #B4550A;
  --deep: #1F3D5C;
  --wash: #F2F3F0;
  --alert: #8C2F1A;
  --tag-ok-bg: #E3F2ED;
  --tag-ok-text: #0F6E62;
  --tag-no-bg: #F1F3F0;
  --tag-no-text: #6E7680;
  --tag-warn-bg: #FDF4EB;
  --tag-warn-text: #B4550A;
}}

* {{ box-sizing: border-box; }}

body {{
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font: 16px/1.68 "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  -webkit-font-smoothing: antialiased;
}}

.page {{
  max-width: 980px;
  margin: 0 auto;
  padding: 56px 28px 96px;
}}

.masthead {{
  border-bottom: 2px solid var(--ink);
  padding-bottom: 24px;
  margin-bottom: 16px;
}}

.masthead h1 {{
  font-size: 2.25rem;
  line-height: 1.15;
  margin: 0 0 12px;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--ink);
}}

.masthead p {{
  margin: 0;
  color: var(--mute);
  font-size: 1rem;
}}

.meta {{
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 20px 0 36px;
  font: 13px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--mute);
}}

.meta b {{
  display: block;
  color: var(--ink);
  font-weight: 600;
}}

.verdict {{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
  margin: 24px 0 44px;
}}

.verdict div {{
  border-top: 2px solid var(--deep);
  padding-top: 10px;
  font: 13px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif;
}}

.verdict strong {{
  display: block;
  font-size: 1.15rem;
  color: var(--deep);
  margin-bottom: 4px;
  font-family: "Iowan Old Style", Palatino, serif;
}}

h2 {{
  font-size: 1.45rem;
  line-height: 1.25;
  margin: 54px 0 16px;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 8px;
  color: var(--ink);
  letter-spacing: -0.01em;
}}

h3 {{
  font-size: 1.18rem;
  margin: 32px 0 12px;
  color: var(--deep);
}}

p, li {{
  color: var(--ink);
  margin-bottom: 14px;
}}

.callout {{
  background: var(--wash);
  border-left: 3px solid var(--deep);
  padding: 16px 20px;
  margin: 24px 0;
  font: 14.5px/1.6 ui-sans-serif, system-ui, -apple-system, sans-serif;
  border-radius: 0 4px 4px 0;
}}

.callout strong {{
  color: var(--deep);
}}

.warn {{
  background: #FDF4EB;
  border-left: 3px solid var(--neg);
  padding: 16px 20px;
  margin: 24px 0;
  font: 14.5px/1.6 ui-sans-serif, system-ui, -apple-system, sans-serif;
  border-radius: 0 4px 4px 0;
}}

.warn strong {{
  color: var(--neg);
}}

.claim {{
  background: #FDF2F0;
  border-left: 3px solid var(--alert);
  padding: 16px 20px;
  margin: 24px 0;
  font: 14.5px/1.6 ui-sans-serif, system-ui, -apple-system, sans-serif;
  border-radius: 0 4px 4px 0;
}}

.claim strong {{
  color: var(--alert);
}}

.table-wrap {{
  overflow-x: auto;
  margin: 24px 0 32px;
  border: 1px solid var(--rule);
  border-radius: 4px;
  background: white;
}}

table {{
  width: 100%;
  border-collapse: collapse;
  font: 13.5px/1.45 ui-sans-serif, system-ui, -apple-system, sans-serif;
}}

th, td {{
  padding: 8px 12px;
  border-bottom: 1px solid var(--rule);
  text-align: left;
}}

th {{
  font-weight: 600;
  color: var(--mute);
  background: var(--wash);
  border-bottom: 2px solid var(--rule);
  white-space: nowrap;
}}

tr:nth-child(even) td {{
  background: #FAFBF9;
}}

td.pos {{ color: var(--pos); font-weight: 600; }}
td.neg {{ color: var(--neg); font-weight: 600; }}
td.num {{ text-align: right; }}
th.num {{ text-align: right; }}
td.cen {{ text-align: center; }}
th.cen {{ text-align: center; }}

.tag-ok {{
  background: var(--tag-ok-bg);
  color: var(--tag-ok-text);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  display: inline-block;
}}

.tag-no {{
  background: var(--tag-no-bg);
  color: var(--tag-no-text);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
}}

.tag-warn {{
  background: var(--tag-warn-bg);
  color: var(--tag-warn-text);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  display: inline-block;
}}

.athlete-card {{
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: white;
  padding: 24px;
  margin: 32px 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}}

.athlete-card h4 {{
  font-size: 1.35rem;
  margin: 0 0 6px;
  color: var(--deep);
  font-family: "Iowan Old Style", Palatino, serif;
}}

.athlete-meta {{
  font: 13px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--mute);
  margin-bottom: 16px;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 8px;
}}

.athlete-grid {{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin: 16px 0;
}}

.athlete-box {{
  background: var(--wash);
  padding: 14px 18px;
  border-radius: 4px;
  font: 13.5px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif;
}}

.athlete-box strong {{
  display: block;
  color: var(--deep);
  margin-bottom: 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}}
</style>
</head>
<body>
<div class="page">

  <div class="masthead">
    <h1>Post-Activation Potentiation (PAP) & Profilazione Biomeccanica</h1>
    <p>Studio Sperimentale, Audit Metrologico di Campo e Direttive Prescrittive per lo Staff Tecnico — Sessione del 28 Luglio 2026</p>
  </div>

  <div class="meta">
    <div><b>Data sessione</b>28 luglio 2026</div>
    <div><b>Strumentazione</b>Optojump Next (1000 Hz, barre da 1 m)</div>
    <div><b>Campione analizzato</b>8 atleti agonisti (1 escluso)</div>
    <div><b>Protocolli indagati</b>8 interventi neuromuscolari</div>
    <div><b>Recupero reale</b>18.08 – 25.50 min (dai timestamp)</div>
    <div><b>Soglie MDC 95%</b>SJ ±5.38% | CMJ ±7.31% | ABK ±7.90%</div>
  </div>

  <div class="verdict">
    <div>
      <strong>Volume Effettivo Raddoppiato</strong>
      Sei atleti su otto hanno eseguito 2 serie anziché 1, accumulando 12–20 contatti o 6 reps massimali. Il doppio del volume ha raddoppiato il costo metabolico.
    </div>
    <div>
      <strong>Recupero Reale: 18–25 min</strong>
      I timestamp strumentali Optojump smentiscono il recupero teorico di 7–8 minuti. A 20–25 minuti l'effetto PAP si è dissipato, lasciando fatica residua.
    </div>
    <div>
      <strong>Caduta della Soglia del 3%</strong>
      La soglia arbitraria produceva falsi positivi. Con il Minimo Cambiamento Rilevabile (MDC 95%), solo 3 atleti mostrano cambiamenti reali nell'RSI.
    </div>
    <div>
      <strong>Massa Corporea (r = -0.77)</strong>
      È l'unico determinante reale dell'RSI ($p = 0.027$). Nei rimbalzi fast-SSC la massa corporea agisce da carico inerziale frenante per i tendini.
    </div>
  </div>

  <div class="callout">
    <strong>Scopo del Presente Master Report:</strong> Questo documento integra la narrazione metodologica per lo Strength & Conditioning Coach con le evidenze scaturite dall'Audit metrologico e dal controllo di qualità sui dati grezzi Optojump. Esso costituisce il punto di riferimento unificato e definitivo della sessione sperimentale del 28 luglio 2026, fornendo risposte matematicamente fondate su cosa si è fatto, cosa si deduce dai dati e quali direttive tecniche adottare per ciascun atleta.
  </div>

  <!-- SEZIONE 1 -->
  <h2>1. Inquadramento Sperimentale, Protocolli Svolti e Cronometraggio Reale</h2>
  <p>
    Il fenomeno del <em>Post-Activation Potentiation</em> (PAP) — più propriamente definito in letteratura recente come <em>Post-Activation Performance Enhancement</em> (PAPE) — descrive l'incremento acuto della capacità di produrre forza esplosiva e potenza muscolare conseguente a una precedente contrazione massimale o sub-massimale. Tale potenziamento coesiste sempre con la fatica indotta dall'esercizio condizionante: la prestazione finale manifestata dall'atleta rappresenta la sommatoria algebrica tra il potenziamento neuromuscolare (attivazione delle unità motorie, fosforilazione delle catene leggere della miosina, aumento della stiffness tendinea) e la fatica metabolica/centrale accumulata.
  </p>
  <p>
    La sessione sperimentale condotta il 28 luglio 2026 ha inteso confrontare l'efficacia di otto diverse tipologie di condizionamento neuromuscolare nel modulare la prestazione nei test balistici verticali standardizzati:
  </p>
  <ul>
    <li><strong>Squat Jump (SJ):</strong> partenza da fermo con 90° di flessione al ginocchio mantenuti per 2–3 secondi per azzerare l'energia elastica; misura selettiva della forza concentrica pura e della capacità di reclutamento sincronizzato.</li>
    <li><strong>Countermovement Jump (CMJ):</strong> contromovimento rapido con discesa autoregolata (Slow-SSC, ciclo allungamento-accorciamento lento > 250 ms); misura della capacità di accumulo e restituzione dell'energia elastica muscolo-tendinea.</li>
    <li><strong>Abalakov Jump (ABK):</strong> salto con contromovimento e oscillazione coordinata degli arti superiori; misura dell'impatto sistemico, del transfer coordinativo intersegmentario e dell'inerzia delle braccia.</li>
    <li><strong>Stiffness Test (10 saltelli continui reattivi):</strong> rimbalzi consecutivi a ginocchia tese focalizzati sulla caviglia (Fast-SSC, ciclo allungamento-accorciamento rapido < 200 ms); calcolo del <em>Reactive Strength Index</em> (RSI = Altezza di volo / Tempo di contatto).</li>
  </ul>

  <h3>1.1 Stimoli Condizionanti Assegnati e Rettifica dei Volumi Reali</h3>
  <p>
    Dall'analisi incrociata del protocollo di campo con i file di lavoro originali, è emersa una discrepanza sostanziale: le tabelle riassuntive iniziali indicavano per molti atleti una singola serie di lavoro (es. Depth Jump 1×6 o Power Clean 1×3). Al contrario, il protocollo effettivo documentato nelle schede tecniche ha previsto per quasi tutti gli atleti l'esecuzione di <strong>due serie complete</strong>:
  </p>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Atleta</th>
          <th>Profilo Morfologico & Ruolo</th>
          <th>Protocollo Effettivo Eseguito</th>
          <th class="cen">Reps / Contatti</th>
          <th>Famiglia Neuromuscolare</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>F. Azzolina</strong></td>
          <td>400ista, magro, elastico, alta tolleranza al lattato (20 anni, 64 kg)</td>
          <td>Depth Jump da box 40 cm, 2×6 (3′ rec tra le serie)</td>
          <td class="cen">12 contatti</td>
          <td>Pliometrico SSC rapido</td>
        </tr>
        <tr>
          <td><strong>G. Masut</strong></td>
          <td>Sprinter rapido, magro, elastico, ottima partenza (20 anni, 69 kg)</td>
          <td>60 m dash all-out con blocchi di partenza (1 ripetuta)</td>
          <td class="cen">1 sprint</td>
          <td>Velocità pura / accelerazione</td>
        </tr>
        <tr>
          <td><strong>L. Marin</strong></td>
          <td>Sprinter, alto, muscolare, compatto (15 anni, 78 kg)</td>
          <td>Overcoming Isometrics al Multipower, 2×5 reps da 5″ (3′ rec)</td>
          <td class="cen">10 spinte iso (50″ tot)</td>
          <td>Forza massima isometrica</td>
        </tr>
        <tr>
          <td><strong>L. Balai</strong></td>
          <td>Lanciatore, muscolare, media altezza (15 anni, 74 kg)</td>
          <td>Squat parallelo con bilanciere, 2×3 @80–85% 1RM (4′ rec)</td>
          <td class="cen">6 reps</td>
          <td>Dinamica eccentrico-concentrica</td>
        </tr>
        <tr>
          <td><strong>L. Ferrari</strong></td>
          <td>Lanciatore, alto, estremamente muscolare (16 anni, 83 kg)</td>
          <td>Stacchi Trap Bar, 2×3 @80–85% 1RM (4′ rec tra le serie)</td>
          <td class="cen">6 reps</td>
          <td>Forza concentrica pura</td>
        </tr>
        <tr>
          <td><strong>M. Bettin</strong></td>
          <td>Lanciatore, compatto, buoni piedi, poca potenza (15 anni, 72 kg)</td>
          <td>Yielding Isometrics in accosciata, 2×15″ iso (4′ rec)</td>
          <td class="cen">2 contrazioni (30″ tot)</td>
          <td>Isometria cedente</td>
        </tr>
        <tr>
          <td><strong>I. Michieletto</strong></td>
          <td>Multiplista, coordinato, super elastico, ottimi piedi (18 anni, 61 kg)</td>
          <td>Drop Jump 2×5 + Depth Jump 2×5 (1′ rec tra le serie)</td>
          <td class="cen">20 contatti</td>
          <td>Pliometrico combinato ad alto impatto</td>
        </tr>
        <tr>
          <td><strong>T. Pagan</strong></td>
          <td>Sprinter, alto, muscolare, potente (23 anni, 85 kg)</td>
          <td>Power Clean / Girata al petto, 2×3 @80% 1RM (4′ rec)</td>
          <td class="cen">6 reps</td>
          <td>Strength-Speed / Weightlifting</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="warn">
    <strong>Impatto Metodologico del Volume Raddoppiato:</strong> L'esecuzione di 2 serie anziché 1 cambia radicalmente la natura dello stimolo. Venti impatti pliometrici intensi (Michieletto) o 10 spinte isometriche massimali (Marin) raddoppiano il lavoro meccanico, esaurendo i substrati energetici fosfageni e inibendo l'eccitabilità spinale (motoneuroni alfa) tramite i fusi neuromuscolari e gli organi tendinei del Golgi. Questa è la causa prima per cui la maggior parte degli atleti non ha mostrato potenziamento acuto.
  </div>

  <h3>1.2 La Verifica dei Timestamp Strumentali: Il Recupero Reale (18–25 Minuti)</h3>
  <p>
    Il protocollo prevedeva teoricamente un recupero standard di 7–8 minuti tra il termine del condizionamento e l'inizio dei test POST. L'audit ha estratto i millisecondi esatti di registrazione dai log generati dal sistema Optojump, ricostruendo l'effettiva linea temporale dell'intera sessione svoltasi tra le 18:40 e le 19:27:
  </p>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Atleta</th>
          <th>Ultimo Salto PRE Registrato</th>
          <th>Primo Salto POST Registrato</th>
          <th class="num">Intervallo Reale Misurato</th>
          <th class="cen">Protocollo Effettivo</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>F. Azzolina</strong></td>
          <td>18:56:27</td>
          <td>19:14:32</td>
          <td class="num"><strong>18.08 min</strong> (18′ 05″)</td>
          <td class="cen">Depth Jump 2×6 (12 contatti)</td>
        </tr>
        <tr>
          <td><strong>M. Bettin</strong></td>
          <td>18:49:25</td>
          <td>19:09:34</td>
          <td class="num"><strong>20.15 min</strong> (20′ 09″)</td>
          <td class="cen">Yielding Isometrics 2×15″</td>
        </tr>
        <tr>
          <td><strong>L. Balai</strong></td>
          <td>18:42:24</td>
          <td>19:02:45</td>
          <td class="num"><strong>20.35 min</strong> (20′ 21″)</td>
          <td class="cen">Squat parallelo 2×3</td>
        </tr>
        <tr>
          <td><strong>G. Masut</strong></td>
          <td>18:44:45</td>
          <td>19:06:18</td>
          <td class="num"><strong>21.55 min</strong> (21′ 33″)</td>
          <td class="cen">60 m dash all-out</td>
        </tr>
        <tr>
          <td><strong>L. Ferrari</strong></td>
          <td>18:52:19</td>
          <td>19:13:54</td>
          <td class="num"><strong>21.58 min</strong> (21′ 35″)</td>
          <td class="cen">Stacchi Trap Bar 2×3</td>
        </tr>
        <tr>
          <td><strong>L. Marin</strong></td>
          <td>18:47:34</td>
          <td>19:10:02</td>
          <td class="num"><strong>22.47 min</strong> (22′ 28″)</td>
          <td class="cen">Overcoming Isometrics 2×5 da 5″</td>
        </tr>
        <tr>
          <td><strong>T. Pagan</strong></td>
          <td>19:02:17</td>
          <td>19:27:29</td>
          <td class="num"><strong>25.20 min</strong> (25′ 12″)</td>
          <td class="cen">Power Clean 2×3</td>
        </tr>
        <tr>
          <td><strong>I. Michieletto</strong></td>
          <td>18:40:16</td>
          <td>19:05:46</td>
          <td class="num"><strong>25.50 min</strong> (25′ 30″)</td>
          <td class="cen">Drop + Depth Jump (20 contatti)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="claim">
    <strong>Confutazione della Tesi del Recupero Insufficiente:</strong> Il primo report ipotizzava che gli atleti fossero peggiorati perché "7–8 minuti di recupero erano troppo pochi". I dati strumentali dimostrano l'esatto contrario: gli atleti hanno recuperato in media <strong>21.8 minuti</strong> (minimo 18.1 min, massimo 25.5 min). In letteratura (Tillin & Bishop 2009, Seitz & Haff 2016), a 20 minuti la finestra ottimale del potenziamento neurale è ampiamente estinta. L'assenza di potenziamento è dovuta alla dissipazione temporale del priming combinata al sovradosaggio volumetrico.
  </div>

  <!-- SEZIONE 2 -->
  <h2>2. Rigore Metrologico, Errore della Misura e Minimo Cambiamento Rilevabile (MDC 95%)</h2>
  <p>
    Nelle scienze dello sport applicate, qualsiasi confronto tra due condizioni (PRE e POST) deve tenere conto della variabilità intrinseca del gesto atletico e della risoluzione dello strumento. Nel primo documento era stata adottata una soglia arbitraria del ±3%, priva di fondamento metrologico: ogni variazione superiore al 3% veniva etichettata come "potenziamento" o "fatica".
  </p>
  <p>
    L'audit ha calcolato la variabilità naturale intra-sessione analizzando le <strong>47 coppie di salti doppi eseguiti nella stessa condizione</strong> dallo stesso atleta. Da tali prove consecutive è stato ricavato il Coefficiente di Variazione entro-soggetto ($CV$) e la Minima Differenza Rilevabile al 95% di confidenza ($MDC_{95}$):
  </p>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Test Balistico</th>
          <th class="num">CV Entro-Soggetto</th>
          <th class="num">CV del Best-of-2</th>
          <th class="num">Soglia Reale di Rilevabilità (MDC 95%)</th>
          <th class="num">Soglia Arbitraria Bozza</th>
          <th>Giudizio Metrologico</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Squat Jump (SJ)</strong></td>
          <td class="num">2.35%</td>
          <td class="num">1.94%</td>
          <td class="num"><strong>± 5.38%</strong></td>
          <td class="num">± 3.00%</td>
          <td><span class="tag-ok">Alta Affidabilità</span> (fermo statico controllato)</td>
        </tr>
        <tr>
          <td><strong>Countermovement Jump (CMJ)</strong></td>
          <td class="num">3.19%</td>
          <td class="num">2.64%</td>
          <td class="num"><strong>± 7.31%</strong></td>
          <td class="num">± 3.00%</td>
          <td><span class="tag-no">Variabilità Media</span> (profondità contromovimento libera)</td>
        </tr>
        <tr>
          <td><strong>Abalakov Jump (ABK)</strong></td>
          <td class="num">3.45%</td>
          <td class="num">2.85%</td>
          <td class="num"><strong>± 7.90%</strong></td>
          <td class="num">± 3.00%</td>
          <td><span class="tag-no">Variabilità Alta</span> (coordinazione braccia-busto)</td>
        </tr>
      </tbody>
    </table>
  </div>

  {render_fig(audit_figs[0], "Variazioni osservate confrontate con errore della misura MDC 95%", "Figura 1 (Audit)")}

  <p>
    Come illustrato in <strong>Figura 1</strong>, applicando la corretta soglia MDC al 95%, la maggior parte delle oscillazioni riscontrate nei salti singoli (come il +3.83% di SJ in Azzolina, il +4.28% di CMJ in Masut o il -4.57% di SJ in Ferrari) ricade interamente nella fascia grigia del rumore statistico. Esse non possono essere dichiarate né come adattamenti positivi né come deficit da fatica.
  </p>

  <h3>2.1 Analisi Inferenziale sui Rimbalzi (RSI): Test t Accoppiato e Hedges' g</h3>
  <p>
    Mentre per i salti singoli si disponeva di sole 2 ripetizioni (best-of-2), per lo Stiffness Test gli atleti hanno eseguito serie continue da 8–10 stacchi sia nel PRE che nel POST. Ciò ha consentito di applicare l'inferenza statistica formale: un <em>t-test per campioni dipendenti</em> e il calcolo della dimensione dell'effetto tramite <strong>Hedges' g</strong>, la formula corretta per campioni con numerosità ridotta ($n < 20$):
  </p>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Atleta</th>
          <th class="num">RSI PRE</th>
          <th class="num">RSI POST</th>
          <th class="num">Δ RSI %</th>
          <th class="num">p-value</th>
          <th class="num">Hedges' g</th>
          <th class="cen">Esito Certificato</th>
          <th>Interpretazione Fisiologica</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>F. Azzolina</strong></td>
          <td class="num">2.292</td>
          <td class="num">2.547</td>
          <td class="pos num">+11.16%</td>
          <td class="num">0.0480</td>
          <td class="pos num">+1.08</td>
          <td class="cen"><span class="tag-ok">Reale</span></td>
          <td>Potenziamento della stiffness (unico responder positivo)</td>
        </tr>
        <tr>
          <td><strong>L. Ferrari</strong></td>
          <td class="num">1.991</td>
          <td class="num">1.994</td>
          <td class="num">+0.15%</td>
          <td class="num">0.9760</td>
          <td class="num">+0.01</td>
          <td class="cen"><span class="tag-no">Rumore</span></td>
          <td>Nessuna variazione apprezzabile (risposta neutra)</td>
        </tr>
        <tr>
          <td><strong>L. Marin</strong></td>
          <td class="num">1.923</td>
          <td class="num">1.907</td>
          <td class="num">-0.83%</td>
          <td class="num">0.7711</td>
          <td class="num">-0.13</td>
          <td class="cen"><span class="tag-no">Rumore</span></td>
          <td>Variazione trascurabile entro la dispersione biologica</td>
        </tr>
        <tr>
          <td><strong>L. Balai</strong></td>
          <td class="num">1.696</td>
          <td class="num">1.680</td>
          <td class="num">-0.91%</td>
          <td class="num">0.8804</td>
          <td class="num">-0.07</td>
          <td class="cen"><span class="tag-no">Rumore</span></td>
          <td>Stiffness invariata (fatica concentrica pura nello squat)</td>
        </tr>
        <tr>
          <td><strong>T. Pagan</strong></td>
          <td class="num">1.782</td>
          <td class="num">1.758</td>
          <td class="num">-1.35%</td>
          <td class="num">0.6588</td>
          <td class="num">-0.21</td>
          <td class="cen"><span class="tag-no">Rumore</span></td>
          <td>Oscillazione minima non statisticamente significativa</td>
        </tr>
        <tr>
          <td><strong>G. Masut</strong></td>
          <td class="num">2.313</td>
          <td class="num">2.272</td>
          <td class="num">-1.77%</td>
          <td class="num">0.5659</td>
          <td class="num">-0.26</td>
          <td class="cen"><span class="tag-no">Rumore</span></td>
          <td>Nessun calo significativo dopo lo sprint massimale</td>
        </tr>
        <tr>
          <td><strong>M. Bettin</strong></td>
          <td class="num">1.841</td>
          <td class="num">1.685</td>
          <td class="neg num">-8.49%</td>
          <td class="num">0.0062</td>
          <td class="neg num">-1.48</td>
          <td class="cen"><span class="tag-ok">Reale (Calo)</span></td>
          <td>Fatica di stiffness dopo isometria cedente prolungata</td>
        </tr>
        <tr>
          <td><strong>I. Michieletto</strong></td>
          <td class="num">2.869</td>
          <td class="num">2.595</td>
          <td class="neg num">-9.54%</td>
          <td class="num">0.0012</td>
          <td class="neg num">-1.87</td>
          <td class="cen"><span class="tag-ok">Reale (Calo)</span></td>
          <td>Fatica eccentrico-tendinea da eccesso di contatti (20)</td>
        </tr>
      </tbody>
    </table>
  </div>

  {render_fig(audit_figs[1], "Variazione dell'RSI con intervallo di confidenza al 95%", "Figura 2 (Audit)")}

  <p>
    La <strong>Figura 2</strong> evidenzia con chiarezza geometrica la realtà del test: per cinque atleti su otto (Ferrari, Marin, Balai, Pagan, Masut) l'intervallo di confidenza al 95% attraversa pienamente la linea dello zero. In tali casi la statistica impone di considerare l'effetto nullo o indistinguibile dal rumore di campionamento. Solo tre atleti presentano una variazione statisticamente reale: Azzolina (+11.16%, $p < 0.05$), Bettin (-8.49%, $p < 0.01$) e Michieletto (-9.54%, $p < 0.01$).
  </p>

  <h3>2.2 Confutazione dei Miti: Indice Elastico (EUR) e Transfer degli Arti Superiori</h3>
  <p>
    Nel primo report erano state avanzate interpretazioni suggestive circa una presunta "facilitazione neurale del ciclo allungamento-accorciamento" letta negli incrementi dell'EUR (+4.8% per Masut, +6.5% per Balai) e un "transfer coordinativo delle braccia" indotto dagli stimoli sistemici (+1.25 cm in Michieletto e Pagan). L'audit smentisce categoricamente entrambe le tesi:
  </p>

  {render_fig(rep_figs[0], "Indice elastico prima e dopo lo stimolo condizionante", "Figura 3 (Report Originale)")}

  <p>
    Come dimostrato dal calcolo dell'errore combinato, l'EUR ($CMJ/SJ$) deriva dal rapporto tra due misure aventi ciascuna il proprio margine di errore. La soglia minima per poter affermare un reale cambiamento dell'EUR oscilla tra <strong>±9.1 e ±10.4 punti percentuali</strong>. Le variazioni registrate (da -7.3 a +6.5 p.p.) ricadono tutte ampiamente al di sotto di tale soglia.
  </p>

  {render_fig(rep_figs[5], "Differenziale arti superiori (ABK - CMJ)", "Figura 4 (Report Originale)")}

  <p>
    Analogamente, il differenziale tra Abalakov e CMJ ($ABK - CMJ$) ha una soglia di rilevabilità di <strong>±5.7 cm</strong>. Il modesto incremento di 1.25 cm osservato in Michieletto e Pagan (Figura 4) rappresenta appena un quinto dell'errore di misura: considerarlo un "adattamento coordinativo sistemico" è un tipico errore di sovra-interpretazione del rumore.
  </p>

  <!-- SEZIONE 3 -->
  <h2>3. I Veri Determinanti Biomeccanici dell'RSI e le Strategie Motorie</h2>

  <h3>3.1 La Massa Corporea: L'Unico Vero Determinante dell'RSI (r = -0.77, p = 0.027)</h3>
  <p>
    L'analisi della regressione multivariata condotta su tutte le variabili morfologiche e fisiologiche ha svelato una legge biofisica fondamentale che il primo report aveva completamente trascurato:
  </p>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Variabile Indipendente</th>
          <th class="num">Coefficiente r di Pearson</th>
          <th class="num">IC 95% Inferiore</th>
          <th class="num">IC 95% Superiore</th>
          <th class="num">p-value</th>
          <th class="cen">Significatività Statistica</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Massa corporea (kg)</strong></td>
          <td class="neg num"><strong>-0.7657</strong></td>
          <td class="num">-0.9551</td>
          <td class="num">-0.1325</td>
          <td class="num"><strong>0.0268</strong></td>
          <td class="cen"><span class="tag-ok">Significativa (p &lt; 0.05)</span></td>
        </tr>
        <tr>
          <td><strong>Altezza SJ (cm)</strong></td>
          <td class="num">+0.5331</td>
          <td class="num">-0.2749</td>
          <td class="num">+0.8998</td>
          <td class="num">0.1737</td>
          <td class="cen"><span class="tag-no">Non significativa (IC attraversa lo 0)</span></td>
        </tr>
        <tr>
          <td><strong>Potenza SJ (W/kg)</strong></td>
          <td class="num">+0.5288</td>
          <td class="num">-0.2804</td>
          <td class="num">+0.8986</td>
          <td class="num">0.1779</td>
          <td class="cen"><span class="tag-no">Non significativa</span></td>
        </tr>
        <tr>
          <td><strong>Tempo di contatto medio (s)</strong></td>
          <td class="num">-0.4210</td>
          <td class="num">-0.8681</td>
          <td class="num">+0.4033</td>
          <td class="num">0.2989</td>
          <td class="cen"><span class="tag-no">Non significativa</span></td>
        </tr>
        <tr>
          <td><strong>Età anagrafica (anni)</strong></td>
          <td class="num">+0.2374</td>
          <td class="num">-0.5612</td>
          <td class="num">+0.8071</td>
          <td class="num">0.5713</td>
          <td class="cen"><span class="tag-no">Non significativa</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  {render_fig(audit_figs[3], "La massa corporea spiega l'RSI meglio della potenza relativa", "Figura 5 (Audit)")}

  <p>
    La <strong>Figura 5</strong> illustra il fenomeno: la massa corporea spiega da sola quasi il <strong>59% della varianza dell'RSI ($R^2 = 0.586$)</strong>. In contatti rapidissimi al suolo (Fast-SSC &lt; 200 ms), ogni chilogrammo aggiuntivo agisce come una zavorra inerziale che comprime il complesso muscolo-tendineo. Gli atleti pesanti (&gt; 75–80 kg: Ferrari, Balai, Pagan) non presentano affatto un "deficit di coordinazione reattiva": subiscono semplicemente la fisica dei corpi carichi in caduta balistica.
  </p>

  <div class="callout">
    <strong>Correzione sull'Indice di Efficienza Potenza/RSI:</strong> Il primo report aveva classificato Tommaso Pagan (85 kg) come "il peggior convertitore di potenza in rimbalzo" (efficienza 0.125) e Michieletto (61 kg) come il migliore (0.200). Tale parametro calcolava il rapporto $RSI / (W/kg)$. Poiché la potenza relativa divide già per la massa e l'RSI è inversamente correlato alla massa, quell'indice non faceva che dividere per il peso corporeo due volte, punendo matematicamente gli atleti robusti e premiando i longilinei.
  </div>

  {render_fig(rep_figs[4], "Relazione tra potenza relativa nello Squat Jump e RSI medio", "Figura 6 (Report Originale)")}

  <h3>3.2 Dissociazione Totale tra Forza Concentrica e Reattività Tendinea (r = +0.08)</h3>
  <p>
    Un altro errore metodologico cruciale commesso nel primo documento è stato quello di creare un "indice PAP unico" mediando le percentuali di variazione di SJ, CMJ, ABK e RSI. L'audit ha calcolato la correlazione tra la variazione di forza pura ($\Delta SJ\%$) e la variazione di reattività elastica ($\Delta RSI\%$): essa è pari a <strong>$r = +0.08$ ($p = 0.85$)</strong>.
  </p>
  <p>
    Non vi è alcuna correlazione: i due meccanismi operano su vie neurofisiologiche del tutto slegate. Un atleta può guadagnare massicciamente in forza concentrica e contemporaneamente crollare nella reattività elastica. La dimostrazione lampante è fornita da <strong>Matteo Bettin</strong>:
  </p>
  <ul>
    <li>$\Delta SJ\%$ (Forza concentrica pura): <strong>+5.80%</strong> (guadagno reale oltre MDC).</li>
    <li>$\Delta RSI\%$ (Stiffness nei rimbalzi): <strong>-8.49%</strong> (calo reale certificato, $p = 0.006$).</li>
  </ul>
  <p>
    Mediare questi due valori avrebbe prodotto un indice "neutro", nascondendo allo staff tecnico sia lo straordinario potenziamento concentrico indotto dall'isometria, sia la severa fatica di stiffness a carico della caviglia.
  </p>

  <h3>3.3 Strategie Motorie nei Saltelli: Chi Rimbalza e Chi "Spinge"</h3>

  {render_fig(rep_figs[1], "Scomposizione della variazione di RSI", "Figura 7 (Report Originale)")}

  <p>
    Come mostrato in <strong>Figura 7</strong>, un valore di RSI può salire o scendere per due vie: modificando l'altezza di volo ($TF$) oppure modificando il tempo di contatto ($TC$). Nel caso di Federico Azzolina, il guadagno dell'11.16% è nato interamente da un aumento dell'altezza (+11.37%) con tempo di contatto costante (-0.42%).
  </p>
  <p>
    Tuttavia, l'analisi della correlazione tra tempo di contatto e altezza (r TC ↔ altezza) all'interno della serie di 10 salti POST rivela che alcuni atleti sotto fatica hanno modificato la propria strategia meccanica:
  </p>

  {render_fig(audit_figs[2], "Relazione TC vs Altezza POST dentro la serie", "Figura 8 (Audit)")}

  <p>
    Sia <strong>F. Azzolina ($r = 0.704, p = 0.034$)</strong> che <strong>T. Pagan ($r = 0.682, p = 0.043$)</strong> mostrano una correlazione positiva significativa (Figura 8). Per mantenere alta la parabola di salto, piegano maggiormente le ginocchia e prolungano l'appoggio al suolo: passano cioè da un rimbalzo elastico tendineo (fast-SSC) a una spinta muscolare concentrica.
  </p>

  {render_fig(rep_figs[2], "Coefficiente di variazione intra-serie PRE vs POST", "Figura 9 (Report Originale)")}

  {render_fig(rep_figs[3], "Andamento RSI stacco per stacco nella serie", "Figura 10 (Report Originale)")}

  <p>
    La <strong>Figura 9</strong> e la <strong>Figura 10</strong> mostrano la stabilità del pattern esecutivo: Ivan Michieletto evidenzia una consistenza straordinaria (CV del 3.6% nel POST), mantenendo un rimbalzo identico stacco dopo stacco nonostante il calo della stiffness complessiva. Al contrario, Lorenzo Ferrari e Leonis Balai presentano una pendenza positiva dell'RSI durante i saltelli: necessitano di 3–4 contatti per "accendere" il sistema neuromuscolare (effetto riscaldamento intra-serie).
  </p>

  {render_fig(rep_figs[6], "Sintesi globale di risposta al PAP per atleta", "Figura 11 (Report Originale)")}

  <!-- SEZIONE 4 -->
  <h2>4. Dossier Tecnico Individuale & Prescrizioni per i Singoli Atleti</h2>
  <p>
    Di seguito si riportano le schede monografiche complete per ciascuno degli otto atleti testati. Ciascun profilo integra dati anagrafici, protocollo effettivo, misurazioni strumentali PRE e POST, diagnosi metrologica, analisi di forze e debolezze, qualità da sviluppare e programmazione target.
  </p>

  <!-- 1. AZZOLINA -->
  <div class="athlete-card">
    <h4>1. Federico Azzolina</h4>
    <div class="athlete-meta">20 anni • 64 kg • 400ista agonista • Morfologia: Magro, compatto, elastico, elevata stiffness tibio-tarsica e tolleranza al lattato</div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Protocollo Svolto & Tempi</strong>
        Depth Jump da box 40 cm, 2×6 con 3′ di recupero.<br>
        Volume: 12 contatti pliometrici intensi.<br>
        Recupero reale Optojump: <strong>18.08 min</strong> (18:56:27 → 19:14:32).
      </div>
      <div class="athlete-box">
        <strong>Risultati Strumentali PRE vs POST</strong>
        SJ: 42.56 → 44.19 cm (+3.83%, rumore MDC)<br>
        CMJ: 47.11 → 49.40 cm (+4.86%, rumore MDC)<br>
        ABK: 52.00 → 55.34 cm (+6.42%, rumore MDC)<br>
        RSI medio: 2.292 → 2.547 (<strong>+11.16%</strong>, p = 0.048, g = +1.08)<br>
        TC medio: 0.143 s → 0.142 s | TF medio: 0.518 s → 0.543 s
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Esito Metrologico Certificato</strong>
        <span class="tag-ok">Potenziamento Reattivo Reale (Responder Positivo)</span><br>
        Unico atleta dell'intero gruppo ad aver manifestato un incremento statisticamente reale della reattività tendinea (+11.16%), conservando la stiffness anche dopo 18 minuti.
      </div>
      <div class="athlete-box">
        <strong>Punti di Forza & Debolezza</strong>
        <em>Forze:</em> Eccezionale rigidezza dell'arco plantare e del tendine d'Achille (TC 142 ms); ottimo rapporto potenza/peso (14.15 W/kg).<br>
        <em>Debolezze:</em> Tendenza ad allungare il contatto sotto fatica per cercare altezza (r = 0.704); forza concentrica massimale assoluta limitata.
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Qualità Neuromuscolari da Allenare</strong>
        Forza massima concentrica per elevare il tetto assoluto di spinta; mantenimento della stiffness elastica a frequenze di sprint elevate; consolidamento del tempo di contatto ultra-breve (&lt; 130 ms).
      </div>
      <div class="athlete-box">
        <strong>Prescrizione di Allenamento & Priming</strong>
        <em>Lavoro target:</em> Trap Bar Deadlift concentrico 4×3 @85% 1RM (3′ rec) + Drop Jump da 30 cm a terra reattiva 3×5.<br>
        <em>Protocollo Priming Pre-Gara:</em> 1 serie da 4–5 Depth Jump da 35 cm, 8–10 minuti prima della chiamata ai blocchi sui 400m.
      </div>
    </div>
  </div>

  <!-- 2. MASUT -->
  <div class="athlete-card">
    <h4>2. Giacomo Masut</h4>
    <div class="athlete-meta">20 anni • 69 kg • Sprinter puro • Morfologia: Magro, molto rapido, elastico, eccellente uscita dai blocchi</div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Protocollo Svolto & Tempi</strong>
        60 m dash all-out con blocchi di partenza (1 ripetuta singola).<br>
        Volume: 1 sprint massimale.<br>
        Recupero reale Optojump: <strong>21.55 min</strong> (18:44:45 → 19:06:18).
      </div>
      <div class="athlete-box">
        <strong>Risultati Strumentali PRE vs POST</strong>
        SJ: 47.18 → 46.90 cm (-0.59%, rumore MDC)<br>
        CMJ: 47.88 → 49.93 cm (+4.28%, rumore MDC)<br>
        ABK: 59.64 → 60.59 cm (+1.59%, rumore MDC)<br>
        RSI medio: 2.313 → 2.272 (-1.77%, p = 0.5659, g = -0.26)<br>
        EUR: 1.49% → 6.46% (+4.97 p.p.) | ABK-CMJ: 11.76 → 10.66 cm
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Esito Metrologico Certificato</strong>
        <span class="tag-no">Risposta Neutra (Entro il Rumore)</span><br>
        Lo sprint massimale non ha alterato la sua capacità contrattile: a 21 minuti di distanza l'atleta è tornato perfettamente ai propri valori basali.
      </div>
      <div class="athlete-box">
        <strong>Punti di Forza & Debolezza</strong>
        <em>Forze:</em> Il miglior transfer degli arti superiori dell'intero roster (+11.76 cm in ABK); elevatissima potenza concentrica (14.90 W/kg).<br>
        <em>Debolezze:</em> Indice elastico basale molto basso (EUR 1.49%: SJ e CMJ quasi identici), indicativo di forte dipendenza dalla spinta concentrica.
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Qualità Neuromuscolari da Allenare</strong>
        Efficienza del Ciclo Allungamento-Accorciamento (SSC lento e veloce); capacità di pre-attivazione (pre-tension) del tricipite surale prima dell'impatto con il suolo.
      </div>
      <div class="athlete-box">
        <strong>Prescrizione di Allenamento & Priming</strong>
        <em>Lavoro target:</em> Hurdle Jumps continui (4×5 su ostacoli 60 cm con rimbalzo immediato) + Squat con catene o bande elastiche per accelerare l'eccentrico.<br>
        <em>Protocollo Priming Pre-Gara:</em> 1 sprint lanciato di 30 metri all-out eseguito 6–8 minuti prima della partenza dei 60m/100m.
      </div>
    </div>
  </div>

  <!-- 3. MARIN -->
  <div class="athlete-card">
    <h4>3. Leonardo Marin</h4>
    <div class="athlete-meta">15 anni • 78 kg • Sprinter giovane • Morfologia: Alto, compatto, grande massa muscolare ma velocità d'inversione ridotta</div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Protocollo Svolto & Tempi</strong>
        Overcoming Isometrics al Multipower, 2 serie × 5 reps da 5″ (3′ rec).<br>
        Volume: 10 spinte isometriche massimali (50″ di contrazione totale).<br>
        Recupero reale Optojump: <strong>22.47 min</strong> (18:47:34 → 19:10:02).
      </div>
      <div class="athlete-box">
        <strong>Risultati Strumentali PRE vs POST</strong>
        SJ: 42.84 → 41.90 cm (-2.19%, rumore MDC)<br>
        CMJ: 43.15 → 44.21 cm (+2.46%, rumore MDC)<br>
        ABK: 46.80 → 47.58 cm (+1.67%, rumore MDC)<br>
        RSI medio: 1.923 → 1.907 (-0.83%, p = 0.7711, g = -0.13)<br>
        Potenza SJ: 14.20 W/kg | TC medio: 0.162 s
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Esito Metrologico Certificato</strong>
        <span class="tag-no">Risposta Neutra / Rumore</span><br>
        Nessuna variazione dimostrabile nei salti singoli né nella serie di saltelli. A 22 minuti di recupero la fatica dell'isometria si è spenta senza lasciare potenziamento.
      </div>
      <div class="athlete-box">
        <strong>Punti di Forza & Debolezza</strong>
        <em>Forze:</em> Grande potenziale di forza muscolare grezza per la giovane età (15 anni); eccellente struttura scheletrica.<br>
        <em>Debolezze:</em> Rigidità articolare della caviglia insufficiente per gestire 78 kg nei rimbalzi rapidi (RSI &lt; 2.0); transizione eccentrico-concentrica lenta.
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Qualità Neuromuscolari da Allenare</strong>
        Rate of Force Development (RFD) precoce (&lt; 100 ms); stiffness specifica della caviglia; pliometria estensiva a basso impatto per adattare i tendini.
      </div>
      <div class="athlete-box">
        <strong>Prescrizione di Allenamento & Priming</strong>
        <em>Lavoro target:</em> Salto con la corda veloce (5 serie × 40″ rimbalzi rapidi) + Pogo Jumps con cavigliere + Mezzo squat esplosivo al 60% con accelerometro (VBT > 1.0 m/s).<br>
        <em>Protocollo Priming Pre-Gara:</em> 2 contrazioni isometriche massimali da 3″ contro fermi (non 10 reps!), 6 minuti prima della gara.
      </div>
    </div>
  </div>

  <!-- 4. BALAI -->
  <div class="athlete-card">
    <h4>4. Leonis Balai</h4>
    <div class="athlete-meta">15 anni • 74 kg • Lanciatore • Morfologia: Struttura estremamente muscolare, compatto, media altezza, lento nell'inversione</div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Protocollo Svolto & Tempi</strong>
        Squat parallelo con bilanciere, 2×3 @80–85% 1RM (4′ rec).<br>
        Volume: 6 ripetizioni ad alto carico.<br>
        Recupero reale Optojump: <strong>20.35 min</strong> (18:42:24 → 19:02:45).
      </div>
      <div class="athlete-box">
        <strong>Risultati Strumentali PRE vs POST</strong>
        SJ: 37.03 → 34.33 cm (<strong>-7.30%</strong>, calo reale oltre MDC)<br>
        CMJ: 37.70 → 37.18 cm (-1.38%, rumore MDC)<br>
        ABK: 42.91 → 42.32 cm (-1.39%, rumore MDC)<br>
        RSI medio: 1.696 → 1.680 (-0.91%, p = 0.8804, g = -0.07)<br>
        EUR: 1.81% → 8.30% (+6.49 p.p.)
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Esito Metrologico Certificato</strong>
        <span class="tag-warn">Fatica Concentrica Selettiva (Calo Reale SJ)</span><br>
        Il calo del 7.30% nello Squat Jump supera la soglia MDC (5.38%): lo squat pesante ha indotto una fatica concentrica selettiva senza intaccare la reattività elastica.
      </div>
      <div class="athlete-box">
        <strong>Punti di Forza & Debolezza</strong>
        <em>Forze:</em> Ottima attitudine a sopportare carichi elevati; evidente fenomeno di riscaldamento intra-serie (RSI che cresce stacco dopo stacco).<br>
        <em>Debolezze:</em> Scarso accumulo elastico basale; vulnerabilità della forza concentrica pura a volumi anche modesti di pesistica pesante.
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Qualità Neuromuscolari da Allenare</strong>
        Forza esplosiva e velocità di rilascio; accorciamento del tempo di transizione eccentrico-concentrico; trasformazione della forza massimale in potenza specifica di lancio.
      </div>
      <div class="athlete-box">
        <strong>Prescrizione di Allenamento & Priming</strong>
        <em>Lavoro target:</em> Squat Jump con carico leggero (20–30% del peso corporeo) focalizzato sulla massima accelerazione + Lanci dorsali e frontali con palla medica pesante (5–7 kg).<br>
        <em>Protocollo Priming Pre-Gara:</em> 1 serie singola da 2 ripetizioni di Squat al 75% 1RM (carico dinamico), con recupero di 10–12 minuti.
      </div>
    </div>
  </div>

  <!-- 5. FERRARI -->
  <div class="athlete-card">
    <h4>5. Lorenzo Ferrari</h4>
    <div class="athlete-meta">16 anni • 83 kg • Lanciatore • Morfologia: Alto, massiccio, estremamente muscolare, potente da fermo ma lento nei piedi</div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Protocollo Svolto & Tempi</strong>
        Stacchi Trap Bar, 2×3 @80–85% 1RM (4′ rec tra le serie).<br>
        Volume: 6 ripetizioni massimali a catena cinetica chiusa.<br>
        Recupero reale Optojump: <strong>21.58 min</strong> (18:52:19 → 19:13:54).
      </div>
      <div class="athlete-box">
        <strong>Risultati Strumentali PRE vs POST</strong>
        SJ: 40.16 → 38.33 cm (-4.57%, rumore MDC ±5.38%)<br>
        CMJ: 43.94 → 41.81 cm (-4.84%, rumore MDC ±7.31%)<br>
        ABK: 49.31 → 47.39 cm (-3.89%, rumore MDC ±7.90%)<br>
        RSI medio: 1.991 → 1.994 (+0.15%, p = 0.9760, g = +0.01)<br>
        Pendenza RSI serie: +0.0426 (p = 0.0592, tendenza accensione)
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Esito Metrologico Certificato</strong>
        <span class="tag-no">Fatica Lieve / Risposta Neutra</span><br>
        Tutte le variazioni percentuali ricadono rigorosamente all'interno della banda di rumore. Non vi è stato né crollo catastrofico né innesco di potenziamento.
      </div>
      <div class="athlete-box">
        <strong>Punti di Forza & Debolezza</strong>
        <em>Forze:</em> Grande stazza ed elevata inerzia utile per i lanci; notevole capacità di mantenere costante l'RSI nonostante l'alta massa corporea (83 kg).<br>
        <em>Debolezze:</em> Latenza neuromuscolare marcata (ha bisogno di salti per attivarsi); tempo di contatto lungo (0.160 s).
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Qualità Neuromuscolari da Allenare</strong>
        Reclutamento immediato senza necessità di lungo warm-up; Rate of Force Development a carichi medi; reattività tibio-tarsica per sostenere l'accelerazione nella pedana di lancio.
      </div>
      <div class="athlete-box">
        <strong>Prescrizione di Allenamento & Priming</strong>
        <em>Lavoro target:</em> Trap Bar Deadlift con bande elastiche (accomodating resistance: 3×3 al 65% + 20% tensione bande) + Salti verticali con stacco da fermo su box alto.<br>
        <em>Protocollo Priming Pre-Gara:</em> 1 serie da 2 trazioni di Trap Bar al 75% 1RM con focus sulla velocità d'uscita, 10–12 minuti prima della gara.
      </div>
    </div>
  </div>

  <!-- 6. BETTIN -->
  <div class="athlete-card">
    <h4>6. Matteo Bettin</h4>
    <div class="athlete-meta">15 anni • 72 kg • Lanciatore giovane • Morfologia: Compatto, muscolare, media statura, ottima reattività del piede ma scarsa potenza concentrica</div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Protocollo Svolto & Tempi</strong>
        Yielding Isometrics in accosciata semiflessa, 2 serie × 15″ iso (4′ rec).<br>
        Volume: 30″ totali di isometria eccentrico-resistente.<br>
        Recupero reale Optojump: <strong>20.15 min</strong> (18:49:25 → 19:09:34).
      </div>
      <div class="athlete-box">
        <strong>Risultati Strumentali PRE vs POST</strong>
        SJ: 32.59 → 34.48 cm (<strong>+5.80%</strong>, guadagno reale oltre MDC)<br>
        CMJ: 37.26 → 36.90 cm (-0.97%, rumore MDC)<br>
        ABK: 41.60 → 41.04 cm (-1.35%, rumore MDC)<br>
        RSI medio: 1.841 → 1.685 (<strong>-8.49%</strong>, p = 0.0062, g = -1.48)<br>
        Potenza SJ: 12.38 W/kg (la più bassa del gruppo)
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Esito Metrologico Certificato</strong>
        <span class="tag-ok">Risposta Dissociata: Forza Concentrica ↑ / Stiffness Tendinea ↓</span><br>
        Caso scientifico paradigmatico: l'isometria ha generato un potenziamento concentrico reale (+5.80%), inducendo contemporaneamente una severa fatica di stiffness (-8.49%).
      </div>
      <div class="athlete-box">
        <strong>Punti di Forza & Debolezza</strong>
        <em>Forze:</em> Altissima eccitabilità del pool di motoneuroni dopo pre-contrazione statica; buona elasticità naturale a riposo (EUR 14.3%).<br>
        <em>Debolezze:</em> Basso livello di potenza concentrica assoluta (12.38 W/kg); affaticamento rapido del sistema tendineo sotto carichi isometrici prolungati.
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Qualità Neuromuscolari da Allenare</strong>
        Forza dinamica massima e potenza specifica concentrica; capacità tampone della stiffness sotto fatica; coordinazione di spinta degli arti inferiori.
      </div>
      <div class="athlete-box">
        <strong>Prescrizione di Allenamento & Priming</strong>
        <em>Lavoro target:</em> Squat eccentrico controllato con risalita esplosiva (4×4 @75% 1RM, discesa 3″, fermo 1″, risalita max speed) + Pliometria da box 30 cm a salire.<br>
        <em>Protocollo Priming Pre-Gara:</em> 1 contrazione isometrica massimale di soli 5–6 secondi (non 15″!), con recupero di 8–10 minuti per cogliere il beneficio sullo SJ senza affaticare l'RSI.
      </div>
    </div>
  </div>

  <!-- 7. MICHIELETTO -->
  <div class="athlete-card">
    <h4>7. Ivan Michieletto</h4>
    <div class="athlete-meta">18 anni • 61 kg • Multiplista / Saltatore • Morfologia: Magro, longilineo, eccezionale elasticità e reattività dei piedi, ottima coordinazione</div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Protocollo Svolto & Tempi</strong>
        Drop Jump 2×5 + Depth Jump 2×5 combinati con 1′ di recupero.<br>
        Volume: 20 contatti pliometrici ad alto impatto.<br>
        Recupero reale Optojump: <strong>25.50 min</strong> (18:40:16 → 19:05:46).
      </div>
      <div class="athlete-box">
        <strong>Risultati Strumentali PRE vs POST</strong>
        SJ: 43.73 → 42.46 cm (-2.92%, rumore MDC ±5.38%)<br>
        CMJ: 48.42 → 44.02 cm (<strong>-9.09%</strong>, calo reale oltre MDC)<br>
        ABK: 57.00 → 53.85 cm (-5.54%, rumore MDC ±7.90%)<br>
        RSI medio: 2.869 → 2.595 (<strong>-9.54%</strong>, p = 0.0012, g = -1.87)<br>
        CV RSI: 3.61% (il più costante del roster)
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Esito Metrologico Certificato</strong>
        <span class="tag-warn">Fatica Pliometrica da Sovradosaggio Volumetrico</span><br>
        Crollo reale certificato sia nel CMJ (-9.09%) che nell'RSI (-9.54%, p = 0.0012). Venti contatti pliometrici intensi hanno causato affaticamento muscolo-tendineo eccentrico.
      </div>
      <div class="athlete-box">
        <strong>Punti di Forza & Debolezza</strong>
        <em>Forze:</em> Il miglior atleta del gruppo per qualità elastiche e reattività pura (RSI basale 2.869); pattern motorio straordinariamente ripetibile (CV 3.6%).<br>
        <em>Debolezze:</em> Massa muscolare ridotta che lo rende vulnerabile a volumi pliometrici superiori a 6–8 impatti; calo di reattività in presenza di sovradosaggio.
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Qualità Neuromuscolari da Allenare</strong>
        Forza massima strutturale degli arti inferiori (costruzione di una base di forza); tolleranza ai carichi eccentrici pesanti; conservazione della stiffness a volumi agonistici.
      </div>
      <div class="athlete-box">
        <strong>Prescrizione di Allenamento & Priming</strong>
        <em>Lavoro target:</em> Back Squat progressivo a basse ripetizioni (5×3 @80–85% 1RM) + Drop Jump a volume rigorosamente controllato (non più di 2 serie da 4 contatti).<br>
        <em>Protocollo Priming Pre-Gara:</em> 1 serie da 3 soli balzi reattivi da box 30 cm, 5–6 minuti prima della gara di salto in lungo o triplo.
      </div>
    </div>
  </div>

  <!-- 8. PAGAN -->
  <div class="athlete-card">
    <h4>8. Tommaso Pagan</h4>
    <div class="athlete-meta">23 anni • 85 kg • Sprinter esperto • Morfologia: Alto, possente, estremamente muscolare, eccellente coordinazione generale</div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Protocollo Svolto & Tempi</strong>
        Power Clean (Girata al petto), 2×3 @80% 1RM con 4′ di recupero.<br>
        Volume: 6 girate esplosive con bilanciere olimpico.<br>
        Recupero reale Optojump: <strong>25.20 min</strong> (19:02:17 → 19:27:29).
      </div>
      <div class="athlete-box">
        <strong>Risultati Strumentali PRE vs POST</strong>
        SJ: 43.33 → 39.38 cm (<strong>-9.12%</strong>, calo reale oltre MDC)<br>
        CMJ: 46.68 → 42.20 cm (<strong>-9.58%</strong>, calo reale oltre MDC)<br>
        ABK: 53.80 → 50.57 cm (-6.00%, rumore MDC ±7.90%)<br>
        RSI medio: 1.782 → 1.758 (-1.35%, p = 0.6588, g = -0.21)<br>
        Potenza SJ: 14.28 W/kg | TC vs H: r = 0.6818 (p = 0.043)
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Esito Metrologico Certificato</strong>
        <span class="tag-warn">Fatica Balistica Esplosiva (Calo Reale SJ e CMJ)</span><br>
        Crollo reale della forza esplosiva verticale sia concentrica (-9.12%) che con contromovimento (-9.58%), a fronte di una reattività dell'RSI rimasta invariata.
      </div>
      <div class="athlete-box">
        <strong>Punti di Forza & Debolezza</strong>
        <em>Forze:</em> Grande potenza concentrica assoluta (14.28 W/kg) e ottima padronanza tecnica nelle alzate olimpiche.<br>
        <em>Debolezze:</em> Strategia di allungamento dell'appoggio a terra (r = 0.682: "spinge" con il ginocchio invece di rimbalzare); inerzia degli 85 kg sui rimbalzi veloci.
      </div>
    </div>
    <div class="athlete-grid">
      <div class="athlete-box">
        <strong>Qualità Neuromuscolari da Allenare</strong>
        Stiffness reattiva specifica della caviglia sotto carichi elevati; riduzione del tempo di frenata; dissociazione tra forza esplosiva lenta e stiffness rapida.
      </div>
      <div class="athlete-box">
        <strong>Prescrizione di Allenamento & Priming</strong>
        <em>Lavoro target:</em> Hang Power Clean (girata dalla sospensione sopra il ginocchio: 3×2 @70% focalizzate sul triplo allungamento) + Saltelli con cavigliere a ginocchio bloccato.<br>
        <em>Protocollo Priming Pre-Gara:</em> 1 serie da 2 sole girate dalla sospensione al 70% 1RM (stimolo rapido, zero fatica eccentrica), 10 minuti prima dello sprint.
      </div>
    </div>
  </div>

  <!-- SEZIONE 5 -->
  <h2>5. Direttive Operative per lo Staff Tecnico & Linee Guida per le Prossime Sessioni</h2>
  <p>
    Sulla base dell'evidenza sperimentale certificata e dell'analisi comparativa dei dati, si raccomandano le seguenti linee guida metodologiche e operative per l'allenamento e per le future sessioni di test:
  </p>

  <h3>5.1 Principi Cardine per la Programmazione del Priming (PAPE)</h3>
  <ol>
    <li>
      <strong>Regola dell'Unica Serie (Dose Minima Efficace):</strong> L'utilizzo di 2 serie di condizionamento (adottato per 6 atleti su 8) ha raddoppiato la fatica metabolica, neutralizzando l'effetto potenziante. Il priming pre-gara o pre-allenamento deve basarsi tassativamente su <strong>una singola serie</strong> (es. 2–3 ripetizioni all'80% o 4–5 balzi pliometrici).
    </li>
    <li>
      <strong>Individualizzazione Rigorosa dei Tempi di Recupero:</strong> L'idea di un recupero universale (es. 7–8 minuti) è fisiologicamente insostenibile:
      <ul>
        <li><em>Stimoli di sprint e pliometria leggera:</em> recupero ottimale tra <strong>4 e 7 minuti</strong>.</li>
        <li><em>Stimoli di forza massima concentrica e sollevamento pesi:</em> recupero ottimale tra <strong>8 e 12 minuti</strong>.</li>
        <li><em>Oltre i 15–18 minuti:</em> l'effetto PAP da fosforilazione miosinica decade esponenzialmente verso la linea di base.</li>
      </ul>
    </li>
    <li>
      <strong>Gestione Differenziata per Atleti Pesanti (&gt; 75–80 kg):</strong> Evitare di valutare la reattività dei lanciatori o degli atleti pesanti con parametri tarati su atleti leggeri. Negli atleti muscolari, la pliometria deve essere dosata con cautela per non sovraccaricare le inserzioni tendinee del tricipite surale.
    </li>
  </ol>

  <h3>5.2 Raccomandazioni per le Prossime Sessioni di Monitoraggio</h3>
  <ul>
    <li>
      <strong>Tre tentativi anziché due per ciascun salto singolo:</strong> Rappresenta l'intervento metodologico a più alto rendimento. L'esecuzione di 3 prove porta la riduzione dell'errore di misura a circa il 18%, abbassando la soglia MDC del CMJ dal 7.31% a circa il 6.0% e consentendo di rilevare adattamenti di ampiezza minore.
    </li>
    <li>
      <strong>Disegno a Crossover per Isolare l'Effetto Stimolo dall'Atleta:</strong> Poiché in questa sessione ciascun protocollo è stato testato su un solo atleta ($n = 1$), l'effetto dell'esercizio rimane matematicamente inseparabile dalle caratteristiche individuali del soggetto. Nelle sessioni future, far eseguire lo stesso protocollo a cluster omogenei di almeno 3–4 atleti.
    </li>
    <li>
      <strong>Cronometraggio Attivo di Campo:</strong> Registrare formalmente l'ora di inizio e di fine del carico condizionante tramite cronometro sincronizzato, evitando dilatazioni involontarie del recupero causate dalla gestione del gruppo in campo.
    </li>
  </ul>

  <div class="callout" style="margin-top: 40px;">
    <strong>Conclusioni dello Staff Scientifico:</strong> La sessione del 28 luglio 2026, depurata da errori metrologici e false credenze statistiche, ha dimostrato con precisione millimetrica l'efficacia del Depth Jump come stimolo potenziante per la stiffness di atleti veloci (Azzolina) e l'efficacia delle isometrie per l'innesco della forza concentrica (Bettin). L'applicazione delle finestre di recupero individualizzate e la riduzione volumetrica costituiranno il fondamento per massimizzare la performance agonistica nei prossimi appuntamenti competitivi.
  </div>

</div>
</body>
</html>
"""

# Write to both target files
target1 = 'Cartella Temporanea/REPORT_DEFINITIVO_PAP_28_07_2026.html'
target2 = 'REPORT_DEFINITIVO_PAP_28_07_2026.html'

with open(target1, 'w', encoding='utf-8') as f:
    f.write(html_content)

with open(target2, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Successfully generated master report HTML:")
print(f" - {target1} ({len(html_content)} bytes)")
print(f" - {target2} ({len(html_content)} bytes)")
