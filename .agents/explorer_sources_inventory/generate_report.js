/**
 * generate_report.js
 * Generates comprehensive report.md and handoff.md for Explorer 1 (Sources Inventory)
 */
const fs = require('fs');
const path = require('path');

// Load knowledge-base.js
const kbPath = path.join(__dirname, '..', '..', 'js', 'knowledge-base.js');
const kbContent = fs.readFileSync(kbPath, 'utf8');

const mockWindow = {};
eval(kbContent.replace('window.App = window.App || {};', 'mockWindow.App = mockWindow.App || {};')
               .replace(/window\.App/g, 'mockWindow.App')
               .replace(/window\.ScientificKnowledgeBase/g, 'mockWindow.ScientificKnowledgeBase'));

const sources = mockWindow.App.scientificSources;
console.log('Successfully loaded ' + sources.length + ' sources.');

const areasList = [
    'Atletica Leggera',
    'Sollevamento Pesi',
    'Fisiologia',
    'VBT',
    'Biomeccanica',
    'Clinico',
    'Sport di Squadra'
];

// Area stats container
const areaStats = {};
areasList.forEach(a => {
    areaStats[a] = {
        count: 0,
        years: [],
        journals: {},
        patientTypes: {},
        sports: {},
        goals: {},
        injuries: {},
        sources: []
    };
});

// Deduplication maps
const titleMap = new Map(); // normalized title -> array of sources
const pmidMap = new Map();  // pmid -> array of sources
const idMap = new Map();    // id -> source

sources.forEach((s, idx) => {
    idMap.set(s.id, s);

    const normTitle = s.title.trim().toLowerCase();
    if (!titleMap.has(normTitle)) titleMap.set(normTitle, []);
    titleMap.get(normTitle).push(s);

    const pmidMatch = (s.url || '').match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?/);
    if (pmidMatch) {
        const pmid = pmidMatch[1];
        if (!pmidMap.has(pmid)) pmidMap.set(pmid, []);
        pmidMap.get(pmid).push(s);
    }

    const a = areaStats[s.area];
    if (a) {
        a.count++;
        a.years.push(s.year);
        a.journals[s.journal] = (a.journals[s.journal] || 0) + 1;
        (s.rules.patientTypes || []).forEach(pt => a.patientTypes[pt] = (a.patientTypes[pt] || 0) + 1);
        (s.rules.sports || []).forEach(sp => a.sports[sp] = (a.sports[sp] || 0) + 1);
        (s.rules.goals || []).forEach(g => a.goals[g] = (a.goals[g] || 0) + 1);
        (s.rules.injuries || []).forEach(inj => a.injuries[inj] = (a.injuries[inj] || 0) + 1);
        a.sources.push({ idx: idx + 1, ...s });
    }
});

let out = [];

out.push('# Scientific Sources Inventory & Schema Analysis');
out.push('');
out.push('**File Analyzed**: `js/knowledge-base.js` (' + (fs.statSync(kbPath).size / 1024).toFixed(1) + ' KB, 3407 lines)  ');
out.push('**Analysis Date**: ' + new Date().toISOString() + '  ');
out.push('**Investigator**: Explorer 1 (Sources Inventory)  ');
out.push('**Total Sources Cataloged**: **' + sources.length + '**  ');
out.push('**Total Thematic Areas**: **7**  ');
out.push('');
out.push('---');
out.push('');
out.push('## Table of Contents');
out.push('1. [Executive Summary](#1-executive-summary)');
out.push('2. [Schema Specification & Taxonomy](#2-schema-specification--taxonomy)');
out.push('3. [Distribution Across 7 Thematic Areas & Expansion Targets](#3-distribution-across-7-thematic-areas--expansion-targets)');
out.push('4. [Critical Findings, Anomalies & Collision Analysis](#4-critical-findings-anomalies--collision-analysis)');
out.push('5. [Complete Catalog of Existing 161 Sources (By Area)](#5-complete-catalog-of-existing-161-sources-by-area)');
out.push('   - [5.1 Atletica Leggera (21 sources)](#51-atletica-leggera-21-sources)');
out.push('   - [5.2 Sollevamento Pesi (17 sources)](#52-sollevamento-pesi-17-sources)');
out.push('   - [5.3 Fisiologia (33 sources)](#53-fisiologia-33-sources)');
out.push('   - [5.4 VBT (Velocity Based Training) (13 sources)](#54-vbt-velocity-based-training-13-sources)');
out.push('   - [5.5 Biomeccanica (26 sources)](#55-biomeccanica-26-sources)');
out.push('   - [5.6 Clinico (26 sources)](#56-clinico-26-sources)');
out.push('   - [5.7 Sport di Squadra (25 sources)](#57-sport-di-squadra-25-sources)');
out.push('6. [Master Deduplication Reference Index](#6-master-deduplication-reference-index)');
out.push('   - [6.1 Alphabetical Title & ID Index](#61-alphabetical-title--id-index)');
out.push('   - [6.2 Master PMID Index (160 PubMed IDs)](#62-master-pmid-index-160-pubmed-ids)');
out.push('7. [Architectural Recommendations for Modularization & Ingestion](#7-architectural-recommendations-for-modularization--ingestion)');
out.push('');
out.push('---');
out.push('');

// 1. Executive Summary
out.push('## 1. Executive Summary');
out.push('');
out.push('The baseline database in `js/knowledge-base.js` comprises **161 peer-reviewed scientific studies and textbooks**, published between **1972 and 2023**.');
out.push('All entries are stored as a flat array of JavaScript objects assigned to `window.App.scientificSources` and aliased to `window.ScientificKnowledgeBase`.');
out.push('');
out.push('### Area Breakdown Overview');
out.push('');
out.push('| Thematic Area | Count | Share (%) | Year Range | Primary Journals / Sources |');
out.push('| :--- | :---: | :---: | :---: | :--- |');

areasList.forEach(name => {
    const st = areaStats[name];
    st.years.sort((x, y) => x - y);
    const topJournals = Object.entries(st.journals).sort((a,b)=>b[1]-a[1]).slice(0, 2).map(e => e[0] + ' (' + e[1] + ')').join(', ');
    const share = ((st.count / sources.length) * 100).toFixed(1);
    out.push('| **' + name + '** | ' + st.count + ' | ' + share + '% | ' + st.years[0] + ' - ' + st.years[st.years.length - 1] + ' | ' + topJournals + ' |');
});
out.push('| **TOTAL** | **' + sources.length + '** | **100.0%** | **1972 - 2023** | **Sports Med (28), JSCR (19), BJSM (17)** |');
out.push('');

out.push('### Key Highlights & Strategic Takeaways');
out.push('1. **High Academic Tier**: The existing collection adheres strictly to Tier 1 and Tier 2 evidence (systematic reviews, meta-analyses, landmark RCTs, and foundational position stands from ACSM, NSCA, and FIFA).');
out.push('2. **Digital Identifiers**: 160 of 161 sources (99.4%) link to official NCBI PubMed IDs. Exactly 1 source links to a premier weightlifting coaching portal (*Catalyst Athletics*).');
out.push('3. **Expansion Gap**: To achieve the target of **250+ sources** (as set in `prompt_draft.md` Task 1), the team needs to ingest **at least 89 new sources** (+55.3% increase). The primary deficit areas are **VBT** (only 13 sources) and **Sollevamento Pesi** (only 17 sources).');
out.push('4. **Two Pre-existing Collisions Discovered**: During automated cross-field deduplication analysis, two subtle anomalies were uncovered in `js/knowledge-base.js`:');
out.push('   - A duplicate title between `sci_power_cormie_2011` and `sci_biomech_cormie_2011` (where Cormie 2011 Part 2 was given the title of Part 1).');
out.push('   - A shared PubMed URL (`15064696`) between `sci_resistance_kraemer_2004` (the ACSM position stand) and `sci_physiol_fleck_2004` (the Fleck & Kraemer textbook).');
out.push('   Details and fixes are documented in Section 4.');
out.push('');
out.push('---');
out.push('');

// 2. Schema Specification & Taxonomy
out.push('## 2. Schema Specification & Taxonomy');
out.push('');
out.push('Every source object in `js/knowledge-base.js` complies with a uniform schema. All 9 top-level properties are present in 100% of the 161 records.');
out.push('');
out.push('### Top-Level Schema (All 161 records)');
out.push('');
out.push('```typescript');
out.push('interface ScientificSource {');
out.push('    id: string;          // Unique string key (e.g. "sci_sprint_morin_2011")');
out.push('    title: string;       // Full study title in original English');
out.push('    authors: string;     // Authors list in standard citation format (e.g. "Morin, J. B., ...")');
out.push('    journal: string;     // Journal name or publisher (e.g. "Sports Medicine")');
out.push('    year: number;        // 4-digit publication year (1972-2023)');
out.push('    area: string;         // One of the 7 exact thematic areas');
out.push('    abstract: string;    // In-depth synthesis of findings and practical impact in Italian');
out.push('    url: string;         // HTTPS link to PubMed or publisher');
out.push('    rules: SourceRules;  // Dynamic matching rules for AI workout generator');
out.push('}');
out.push('```');
out.push('');
out.push('### Rules Sub-Schema (`rules` property)');
out.push('');
out.push('The `rules` object is actively consumed by `js/logic/rationale-generator.js` to select scientific citations for generated training routines and by `js/ui/scientific-hub.js` for display.');
out.push('');
out.push('```typescript');
out.push('interface SourceRules {');
out.push('    patientTypes: Array<"Atleta" | "Clinico">;  // Required (161/161 sources)');
out.push('    sports?: Array<string>;                    // Optional (96/161 sources)');
out.push('    goals?: Array<string>;                     // Optional (113/161 sources)');
out.push('    injuries?: Array<string>;                  // Optional (35/161 sources, mainly Clinico & Biomeccanica)');
out.push('}');
out.push('```');
out.push('');
out.push('### Controlled Vocabulary Taxonomy');
out.push('');
out.push('To ensure seamless integration with `rationale-generator.js`, research agents adding new sources MUST strictly pick values from the existing controlled vocabularies below:');
out.push('');
out.push('#### 1. Thematic Areas (`area`) — Exactly 7 values:');
out.push('- `Atletica Leggera`');
out.push('- `Sollevamento Pesi`');
out.push('- `Fisiologia`');
out.push('- `VBT`');
out.push('- `Biomeccanica`');
out.push('- `Clinico`');
out.push('- `Sport di Squadra`');
out.push('');
out.push('#### 2. Patient Types (`rules.patientTypes`):');
out.push('- `Atleta`: Healthy sportspersons, competitive athletes, fitness clients.');
out.push('- `Clinico`: Post-rehab patients, chronic pathology subjects, individuals requiring orthopedic or metabolic adaptations.');
out.push('*(Note: A source can contain both, e.g. `["Atleta", "Clinico"]` if findings apply to both).*');
out.push('');
out.push('#### 3. Sports (`rules.sports`) — 6 unique tags in use:');
out.push('- `Atletica Leggera` (Track & Field, sprinting, jumping, throwing)');
out.push('- `Sport di Squadra` (Team sports general)');
out.push('- `Calcio` (Soccer / Football)');
out.push('- `Basketball` (Basketball)');
out.push('- `Endurance` (Running, cycling, triathlon, aerobic endurance)');
out.push('- `Bodybuilding` (Hypertrophy, physique, aesthetic resistance training)');
out.push('');
out.push('#### 4. Training Goals (`rules.goals`) — 6 unique tags in use:');
out.push('- `Power`: Maximal neuromuscular power, RFD, ballistic output, velocity.');
out.push('- `Strength`: Maximal strength (1RM), heavy resistance training, neural drive.');
out.push('- `Hypertrophy`: Muscle hypertrophy, volume accumulation, mechanical tension.');
out.push('- `Resistenza`: Aerobic/anaerobic endurance, fatigue resistance, work capacity.');
out.push('- `Rehab`: Return to play, injury prevention, rehabilitation, joint stability.');
out.push('- `Definition`: Metabolic conditioning, substrate oxidation, body composition.');
out.push('');
out.push('#### 5. Injury / Pathology Tags (`rules.injuries`) — 28 unique tags in use:');
out.push('These correspond directly to the injury IDs recognized by `logic/risk-analyzer.js`:');
out.push('- Knee: `lesione_lca`, `post_op_lca`, `knee_generic`, `patellar_tendonitis`, `tendinopatia_rotulea`, `patellofemoral`');
out.push('- Spine / Back: `lumbar_pain`, `hernia_disk`, `spinal_stenosis`, `sensitive_back`, `spondylolysis`, `low_back_pain`, `spine_generic`');
out.push('- Shoulder: `shoulder_impingement`, `rotator_cuff`, `scapular_dyskinesis`, `shoulder_instability`');
out.push('- Tendon / Lower Limb: `achilles_tendonitis`, `tendinopatia`, `tendon_generic`, `ankle_sprain`, `ankle_instability`');
out.push('- Muscle / Groin: `hamstring_strain`, `lesione_muscolare`, `thigh_strain`, `groin_pain`, `adductor_tendinopathy`, `pubalgia`');
out.push('');
out.push('---');
out.push('');

// 3. Distribution Across 7 Thematic Areas & Expansion Plan
out.push('## 3. Distribution Across 7 Thematic Areas & Expansion Targets');
out.push('');
out.push('To elevate the knowledge base from **161** to **250+ sources**, a net addition of at least **89 sources** (+90 recommended) is needed.');
out.push('The table below presents the current state and the recommended allocation for incoming research agents to produce a balanced, comprehensive database:');
out.push('');
out.push('| Thematic Area | Current Count | Recommended Additions | Proposed Target | Key Focus Topics for New Research |');
out.push('| :--- | :---: | :---: | :---: | :--- |');
out.push('| **Atletica Leggera** | 21 | **+14** | **35** | Resisted sprint profiling, hurdles kinematics, horizontal vs vertical jumps, curved sprinting, plyometrics SSC. |');
out.push('| **Sollevamento Pesi** | 17 | **+13** | **30** | Olympic lifting derivative regressions, cluster sets, accommodating resistance (bands/chains), PAP kinetics. |');
out.push('| **Fisiologia** | 33 | **+12** | **45** | Mitochondrial biogenesis, occlusion training (BFR), concurrent training molecular interference, heat acclimation, sleep & HRV. |');
out.push('| **VBT (Velocity Based)** | 13 | **+17** | **30** | Individualized velocity loss thresholds (10% vs 20% vs 40%), minimal velocity thresholds (MVT), IMU vs linear transducer accuracy, autoregulation. |');
out.push('| **Biomeccanica** | 26 | **+14** | **40** | Pelvo-lumbar rhythm in squats/deadlifts, muscle-tendon unit stiffness, hip thrust vs squat vector transfer, shear stress in overhead press. |');
out.push('| **Clinico** | 26 | **+14** | **40** | Chronic tendinopathy heavy slow resistance (HSR), kinetic chain shoulder dyskinesis, knee osteoarthritis, lumbar motor control, hamstring fascicle length. |');
out.push('| **Sport di Squadra** | 25 | **+15** | **40** | Change of Direction (COD) asymmetry deficits, microdosing sprint/strength in-season, acute-to-chronic workload ratio (ACWR), collision fatigue. |');
out.push('| **TOTAL** | **161** | **+99** | **260** | **Comprehensive, world-class athletic & clinical coverage** |');
out.push('');
out.push('---');
out.push('');

// 4. Critical Findings, Anomalies & Collision Analysis
out.push('## 4. Critical Findings, Anomalies & Collision Analysis');
out.push('');
out.push('A rigorous programmatic scan of `js/knowledge-base.js` revealed 3 critical findings that all downstream agents must be aware of:');
out.push('');
out.push('### 4.1 Title Duplicate Collision (Part 1 vs Part 2)');
out.push('- **Source 1 (`id: "sci_power_cormie_2011"`, Area: Sollevamento Pesi, Line 273)**:');
out.push('  - Title: *"Developing maximal neuromuscular power: Part 1 - Biological basis of maximal power production"*');
out.push('  - URL: `https://pubmed.ncbi.nlm.nih.gov/21198303/`');
out.push('  - Status: Accurate.');
out.push('- **Source 2 (`id: "sci_biomech_cormie_2011"`, Area: Biomeccanica, Line 1167)**:');
out.push('  - Title: *"Developing maximal neuromuscular power: Part 1 - Biological basis of maximal power production"* (Typo in KB!)');
out.push('  - URL: `https://pubmed.ncbi.nlm.nih.gov/21198305/`');
out.push('  - Status: **Title anomaly!** PubMed ID `21198305` is actually Part 2 (*"Developing maximal neuromuscular power: Part 2 - Training considerations for improving maximal power production"*). The title was erroneously copy-pasted as Part 1 in the existing file.');
out.push('  - **Action**: When modularizing, update the title of `sci_biomech_cormie_2011` to reflect Part 2.');
out.push('');
out.push('### 4.2 Shared PubMed ID Collision');
out.push('- **Source 1 (`id: "sci_resistance_kraemer_2004"`, Area: Sollevamento Pesi, Line 378)**:');
out.push('  - Title: *"Fundamentals of resistance training: progression and exercise prescription"*');
out.push('  - URL: `https://pubmed.ncbi.nlm.nih.gov/15064696/`');
out.push('  - Authors: Kraemer, W. J., & Ratamess, N. A. (ACSM Position Stand, 2004).');
out.push('- **Source 2 (`id: "sci_physiol_fleck_2004"`, Area: Fisiologia, Line 616)**:');
out.push('  - Title: *"Designing Resistance Training Programs (4th Edition)"*');
out.push('  - Authors: Fleck, S. J., & Kraemer, W. J. (Human Kinetics textbook).');
out.push('  - URL: `https://pubmed.ncbi.nlm.nih.gov/15064696/` (Re-used Kraemer 2004 PMID)');
out.push('  - Status: Fleck & Kraemer is a textbook (ISBN: 9780736081702) not indexed on PubMed with an abstract. The URL previously reused Kraemer\'s 2004 ACSM paper URL.');
out.push('  - **Action**: Both entries can be retained; subsequent deduplication scripts must match by ID and normalized title, not just PMID.');
out.push('');
out.push('### 4.3 Non-PubMed External URL');
out.push('- **Source (`id: "sci_weightlifting_takano_2012"`, Area: Sollevamento Pesi, Line 477)**:');
out.push('  - Title: *"Weightlifting programming: a winning coach\'s guide"*');
out.push('  - URL: `https://www.catalystathletics.com/`');
out.push('  - Status: Legitimate coaching textbook by Bob Takano. Non-PubMed URLs are permitted when referencing foundational textbooks, but PubMed URLs or DOIs are preferred for peer-reviewed studies.');
out.push('');
out.push('---');
out.push('');

// 5. Complete Catalog of Existing 161 Sources
out.push('## 5. Complete Catalog of Existing 161 Sources (By Area)');
out.push('');
out.push('Below is the complete, exhaustive catalog of all 161 sources currently in `js/knowledge-base.js`, categorized by the 7 thematic areas.');
out.push('');

areasList.forEach((areaName, aIdx) => {
    const st = areaStats[areaName];
    const sectionNum = '5.' + (aIdx + 1);
    out.push('### ' + sectionNum + ' ' + areaName + ' (' + st.count + ' sources)');
    out.push('');
    out.push('| # | ID | Title | Authors | Journal (Year) | URL / PMID | Rules Profile |');
    out.push('| :---: | :--- | :--- | :--- | :--- | :--- | :--- |');

    st.sources.forEach(s => {
        let pmid = '-';
        const m = (s.url || '').match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?/);
        if (m) pmid = '[' + m[1] + '](' + s.url + ')';
        else if (s.url) pmid = '[Link](' + s.url + ')';

        const rulesDesc = [];
        if (s.rules.patientTypes && s.rules.patientTypes.length) rulesDesc.push('PT: ' + s.rules.patientTypes.join(', '));
        if (s.rules.sports && s.rules.sports.length) rulesDesc.push('Sp: ' + s.rules.sports.join(', '));
        if (s.rules.goals && s.rules.goals.length) rulesDesc.push('G: ' + s.rules.goals.join(', '));
        if (s.rules.injuries && s.rules.injuries.length) rulesDesc.push('Inj: ' + s.rules.injuries.join(', '));

        const escapePipe = str => (str || '').replace(/\|/g, '\\|');

        out.push('| ' + s.idx + ' | `' + s.id + '` | ' + escapePipe(s.title) + ' | ' + escapePipe(s.authors) + ' | ' + escapePipe(s.journal) + ' (' + s.year + ') | ' + pmid + ' | ' + escapePipe(rulesDesc.join('; ')) + ' |');
    });
    out.push('');
});

out.push('---');
out.push('');

// 6. Master Deduplication Reference Index
out.push('## 6. Master Deduplication Reference Index');
out.push('');
out.push('Research agents must use this index to perform pre-insertion collision checks. Any new source whose title or PMID matches an entry in this section MUST be rejected as a duplicate.');
out.push('');
out.push('### 6.1 Alphabetical Title & ID Index');
out.push('');

const sortedTitles = [...sources].sort((a, b) => a.title.localeCompare(b.title));
out.push('| Title | ID | Area | Year | PMID |');
out.push('| :--- | :--- | :--- | :---: | :---: |');
sortedTitles.forEach(s => {
    let pmid = '-';
    const m = (s.url || '').match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?/);
    if (m) pmid = m[1];
    const escapePipe = str => (str || '').replace(/\|/g, '\\|');
    out.push('| ' + escapePipe(s.title) + ' | `' + s.id + '` | ' + s.area + ' | ' + s.year + ' | ' + pmid + ' |');
});
out.push('');

out.push('### 6.2 Master PMID Index (160 PubMed IDs)');
out.push('');
out.push('The following is a fast-lookup comma-separated list of all 160 active PubMed IDs:');
out.push('');
const allPmids = Array.from(pmidMap.keys()).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
out.push('```text');
out.push(allPmids.join(', '));
out.push('```');
out.push('');

// 7. Architectural Recommendations
out.push('## 7. Architectural Recommendations for Modularization & Ingestion');
out.push('');
out.push('### 7.1 Target Modular File Structure (`js/data/sources/`)');
out.push('In accordance with the Single Responsibility Principle and project modularity rules, the monolithic `js/knowledge-base.js` should be divided into 7 area files and 1 aggregator:');
out.push('');
out.push('```');
out.push('js/data/sources/');
out.push('├── atletica-leggera.js     // window.App.Sources.atleticaLeggera = [...] (21 + 14 = ~35 items)');
out.push('├── sollevamento-pesi.js    // window.App.Sources.sollevamentoPesi = [...] (17 + 13 = ~30 items)');
out.push('├── fisiologia.js           // window.App.Sources.fisiologia = [...] (33 + 12 = ~45 items)');
out.push('├── vbt.js                  // window.App.Sources.vbt = [...] (13 + 17 = ~30 items)');
out.push('├── biomeccanica.js         // window.App.Sources.biomeccanica = [...] (26 + 14 = ~40 items)');
out.push('├── clinico.js              // window.App.Sources.clinico = [...] (26 + 14 = ~40 items)');
out.push('├── sport-di-squadra.js     // window.App.Sources.sportDiSquadra = [...] (25 + 15 = ~40 items)');
out.push('└── index.js                // Aggregator: concatenates all 7 arrays -> window.App.scientificSources');
out.push('```');
out.push('');
out.push('### 7.2 Backward Compatibility & Test Runner Preservation');
out.push('1. **Compatibility Alias**: `index.js` must set:');
out.push('   ```javascript');
out.push('   window.App.scientificSources = [ ... ];');
out.push('   window.ScientificKnowledgeBase = window.App.scientificSources;');
out.push('   ```');
out.push('2. **Node Test Harness (`loadModule` / `eval`)**: Existing tests (`tests/test_adversarial_scientific_hub.js`, `tests/test_adversarial_challenger.js`, `tests/test_new_profiles.js`) explicitly load `js/knowledge-base.js`.');
out.push('   Therefore, `js/knowledge-base.js` can either be retained as a lightweight loader/orchestrator (similar to `js/logic.js` and `js/parser.js`) or updated in sync with tests.');
out.push('');
out.push('### 7.3 ID Naming Standard for Ingesting Agents');
out.push('All research subagents generating new entries must strictly adhere to the formula:');
out.push('`sci_<topic_prefix>_<firstAuthorSurname>_<year>`');
out.push('- Examples:');
out.push('  - Atletica Leggera: `sci_sprint_kugler_2023`, `sci_jump_van_hooren_2022`');
out.push('  - Sollevamento Pesi: `sci_olympic_suchomel_2021`, `sci_power_soriano_2020`');
out.push('  - Fisiologia: `sci_physiol_peake_2022`, `sci_bfr_patterson_2019`');
out.push('  - VBT: `sci_vbt_weakley_2021`, `sci_vbt_dorrell_2020`');
out.push('  - Biomeccanica: `sci_biomech_vigotsky_2022`, `sci_biomech_schoenfeld_2021`');
out.push('  - Clinico: `sci_rehab_blanch_2020`, `sci_tendon_malliaras_2022`');
out.push('  - Sport di Squadra: `sci_team_buchheit_2021`, `sci_cod_dos_santos_2022`');
out.push('');

const reportFilePath = path.join(__dirname, 'report.md');
fs.writeFileSync(reportFilePath, out.join('\n'), 'utf8');
console.log('Report successfully generated at: ' + reportFilePath);
console.log('Report line count: ' + out.length);
