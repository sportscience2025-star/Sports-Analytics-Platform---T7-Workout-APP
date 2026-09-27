# Scientific Sources Inventory & Schema Analysis

**File Analyzed**: `js/knowledge-base.js` (175.7 KB, 3407 lines)  
**Analysis Date**: 2026-09-14T12:56:00.652Z  
**Investigator**: Explorer 1 (Sources Inventory)  
**Total Sources Cataloged**: **161**  
**Total Thematic Areas**: **7**  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Schema Specification & Taxonomy](#2-schema-specification--taxonomy)
3. [Distribution Across 7 Thematic Areas & Expansion Targets](#3-distribution-across-7-thematic-areas--expansion-targets)
4. [Critical Findings, Anomalies & Collision Analysis](#4-critical-findings-anomalies--collision-analysis)
5. [Complete Catalog of Existing 161 Sources (By Area)](#5-complete-catalog-of-existing-161-sources-by-area)
   - [5.1 Atletica Leggera (21 sources)](#51-atletica-leggera-21-sources)
   - [5.2 Sollevamento Pesi (17 sources)](#52-sollevamento-pesi-17-sources)
   - [5.3 Fisiologia (33 sources)](#53-fisiologia-33-sources)
   - [5.4 VBT (Velocity Based Training) (13 sources)](#54-vbt-velocity-based-training-13-sources)
   - [5.5 Biomeccanica (26 sources)](#55-biomeccanica-26-sources)
   - [5.6 Clinico (26 sources)](#56-clinico-26-sources)
   - [5.7 Sport di Squadra (25 sources)](#57-sport-di-squadra-25-sources)
6. [Master Deduplication Reference Index](#6-master-deduplication-reference-index)
   - [6.1 Alphabetical Title & ID Index](#61-alphabetical-title--id-index)
   - [6.2 Master PMID Index (160 PubMed IDs)](#62-master-pmid-index-160-pubmed-ids)
7. [Architectural Recommendations for Modularization & Ingestion](#7-architectural-recommendations-for-modularization--ingestion)

---

## 1. Executive Summary

The baseline database in `js/knowledge-base.js` comprises **161 peer-reviewed scientific studies and textbooks**, published between **1972 and 2023**.
All entries are stored as a flat array of JavaScript objects assigned to `window.App.scientificSources` and aliased to `window.ScientificKnowledgeBase`.

### Area Breakdown Overview

| Thematic Area | Count | Share (%) | Year Range | Primary Journals / Sources |
| :--- | :---: | :---: | :---: | :--- |
| **Atletica Leggera** | 21 | 13.0% | 1996 - 2020 | Journal of Strength and Conditioning Research (4), Sports Medicine (4) |
| **Sollevamento Pesi** | 17 | 10.6% | 1993 - 2018 | Sports Medicine (5), Journal of Strength and Conditioning Research (5) |
| **Fisiologia** | 33 | 20.5% | 1972 - 2018 | Sports Medicine (10), Medicine & Science in Sports & Exercise (4) |
| **VBT** | 13 | 8.1% | 2010 - 2023 | International Journal of Sports Medicine (2), Medicine & Science in Sports & Exercise (2) |
| **Biomeccanica** | 26 | 16.1% | 1979 - 2019 | Journal of Strength and Conditioning Research (4), Sports Medicine (3) |
| **Clinico** | 26 | 16.1% | 1996 - 2019 | British Journal of Sports Medicine (8), Sports Medicine (5) |
| **Sport di Squadra** | 25 | 15.5% | 2006 - 2020 | British Journal of Sports Medicine (9), Sports Medicine (4) |
| **TOTAL** | **161** | **100.0%** | **1972 - 2023** | **Sports Med (28), JSCR (19), BJSM (17)** |

### Key Highlights & Strategic Takeaways
1. **High Academic Tier**: The existing collection adheres strictly to Tier 1 and Tier 2 evidence (systematic reviews, meta-analyses, landmark RCTs, and foundational position stands from ACSM, NSCA, and FIFA).
2. **Digital Identifiers**: 160 of 161 sources (99.4%) link to official NCBI PubMed IDs. Exactly 1 source links to a premier weightlifting coaching portal (*Catalyst Athletics*).
3. **Expansion Gap**: To achieve the target of **250+ sources** (as set in `prompt_draft.md` Task 1), the team needs to ingest **at least 89 new sources** (+55.3% increase). The primary deficit areas are **VBT** (only 13 sources) and **Sollevamento Pesi** (only 17 sources).
4. **Two Pre-existing Collisions Discovered**: During automated cross-field deduplication analysis, two subtle anomalies were uncovered in `js/knowledge-base.js`:
   - A duplicate title between `sci_power_cormie_2011` and `sci_biomech_cormie_2011` (where Cormie 2011 Part 2 was given the title of Part 1).
   - A shared PubMed URL (`15064696`) between `sci_resistance_kraemer_2004` (the ACSM position stand) and `sci_physiol_fleck_2004` (the Fleck & Kraemer textbook).
   Details and fixes are documented in Section 4.

---

## 2. Schema Specification & Taxonomy

Every source object in `js/knowledge-base.js` complies with a uniform schema. All 9 top-level properties are present in 100% of the 161 records.

### Top-Level Schema (All 161 records)

```typescript
interface ScientificSource {
    id: string;          // Unique string key (e.g. "sci_sprint_morin_2011")
    title: string;       // Full study title in original English
    authors: string;     // Authors list in standard citation format (e.g. "Morin, J. B., ...")
    journal: string;     // Journal name or publisher (e.g. "Sports Medicine")
    year: number;        // 4-digit publication year (1972-2023)
    area: string;         // One of the 7 exact thematic areas
    abstract: string;    // In-depth synthesis of findings and practical impact in Italian
    url: string;         // HTTPS link to PubMed or publisher
    rules: SourceRules;  // Dynamic matching rules for AI workout generator
}
```

### Rules Sub-Schema (`rules` property)

The `rules` object is actively consumed by `js/logic/rationale-generator.js` to select scientific citations for generated training routines and by `js/ui/scientific-hub.js` for display.

```typescript
interface SourceRules {
    patientTypes: Array<"Atleta" | "Clinico">;  // Required (161/161 sources)
    sports?: Array<string>;                    // Optional (96/161 sources)
    goals?: Array<string>;                     // Optional (113/161 sources)
    injuries?: Array<string>;                  // Optional (35/161 sources, mainly Clinico & Biomeccanica)
}
```

### Controlled Vocabulary Taxonomy

To ensure seamless integration with `rationale-generator.js`, research agents adding new sources MUST strictly pick values from the existing controlled vocabularies below:

#### 1. Thematic Areas (`area`) — Exactly 7 values:
- `Atletica Leggera`
- `Sollevamento Pesi`
- `Fisiologia`
- `VBT`
- `Biomeccanica`
- `Clinico`
- `Sport di Squadra`

#### 2. Patient Types (`rules.patientTypes`):
- `Atleta`: Healthy sportspersons, competitive athletes, fitness clients.
- `Clinico`: Post-rehab patients, chronic pathology subjects, individuals requiring orthopedic or metabolic adaptations.
*(Note: A source can contain both, e.g. `["Atleta", "Clinico"]` if findings apply to both).*

#### 3. Sports (`rules.sports`) — 6 unique tags in use:
- `Atletica Leggera` (Track & Field, sprinting, jumping, throwing)
- `Sport di Squadra` (Team sports general)
- `Calcio` (Soccer / Football)
- `Basketball` (Basketball)
- `Endurance` (Running, cycling, triathlon, aerobic endurance)
- `Bodybuilding` (Hypertrophy, physique, aesthetic resistance training)

#### 4. Training Goals (`rules.goals`) — 6 unique tags in use:
- `Power`: Maximal neuromuscular power, RFD, ballistic output, velocity.
- `Strength`: Maximal strength (1RM), heavy resistance training, neural drive.
- `Hypertrophy`: Muscle hypertrophy, volume accumulation, mechanical tension.
- `Resistenza`: Aerobic/anaerobic endurance, fatigue resistance, work capacity.
- `Rehab`: Return to play, injury prevention, rehabilitation, joint stability.
- `Definition`: Metabolic conditioning, substrate oxidation, body composition.

#### 5. Injury / Pathology Tags (`rules.injuries`) — 28 unique tags in use:
These correspond directly to the injury IDs recognized by `logic/risk-analyzer.js`:
- Knee: `lesione_lca`, `post_op_lca`, `knee_generic`, `patellar_tendonitis`, `tendinopatia_rotulea`, `patellofemoral`
- Spine / Back: `lumbar_pain`, `hernia_disk`, `spinal_stenosis`, `sensitive_back`, `spondylolysis`, `low_back_pain`, `spine_generic`
- Shoulder: `shoulder_impingement`, `rotator_cuff`, `scapular_dyskinesis`, `shoulder_instability`
- Tendon / Lower Limb: `achilles_tendonitis`, `tendinopatia`, `tendon_generic`, `ankle_sprain`, `ankle_instability`
- Muscle / Groin: `hamstring_strain`, `lesione_muscolare`, `thigh_strain`, `groin_pain`, `adductor_tendinopathy`, `pubalgia`

---

## 3. Distribution Across 7 Thematic Areas & Expansion Targets

To elevate the knowledge base from **161** to **250+ sources**, a net addition of at least **89 sources** (+90 recommended) is needed.
The table below presents the current state and the recommended allocation for incoming research agents to produce a balanced, comprehensive database:

| Thematic Area | Current Count | Recommended Additions | Proposed Target | Key Focus Topics for New Research |
| :--- | :---: | :---: | :---: | :--- |
| **Atletica Leggera** | 21 | **+14** | **35** | Resisted sprint profiling, hurdles kinematics, horizontal vs vertical jumps, curved sprinting, plyometrics SSC. |
| **Sollevamento Pesi** | 17 | **+13** | **30** | Olympic lifting derivative regressions, cluster sets, accommodating resistance (bands/chains), PAP kinetics. |
| **Fisiologia** | 33 | **+12** | **45** | Mitochondrial biogenesis, occlusion training (BFR), concurrent training molecular interference, heat acclimation, sleep & HRV. |
| **VBT (Velocity Based)** | 13 | **+17** | **30** | Individualized velocity loss thresholds (10% vs 20% vs 40%), minimal velocity thresholds (MVT), IMU vs linear transducer accuracy, autoregulation. |
| **Biomeccanica** | 26 | **+14** | **40** | Pelvo-lumbar rhythm in squats/deadlifts, muscle-tendon unit stiffness, hip thrust vs squat vector transfer, shear stress in overhead press. |
| **Clinico** | 26 | **+14** | **40** | Chronic tendinopathy heavy slow resistance (HSR), kinetic chain shoulder dyskinesis, knee osteoarthritis, lumbar motor control, hamstring fascicle length. |
| **Sport di Squadra** | 25 | **+15** | **40** | Change of Direction (COD) asymmetry deficits, microdosing sprint/strength in-season, acute-to-chronic workload ratio (ACWR), collision fatigue. |
| **TOTAL** | **161** | **+99** | **260** | **Comprehensive, world-class athletic & clinical coverage** |

---

## 4. Critical Findings, Anomalies & Collision Analysis

A rigorous programmatic scan of `js/knowledge-base.js` revealed 3 critical findings that all downstream agents must be aware of:

### 4.1 Title Duplicate Collision (Part 1 vs Part 2)
- **Source 1 (`id: "sci_power_cormie_2011"`, Area: Sollevamento Pesi, Line 273)**:
  - Title: *"Developing maximal neuromuscular power: Part 1 - Biological basis of maximal power production"*
  - URL: `https://pubmed.ncbi.nlm.nih.gov/21198303/`
  - Status: Accurate.
- **Source 2 (`id: "sci_biomech_cormie_2011"`, Area: Biomeccanica, Line 1167)**:
  - Title: *"Developing maximal neuromuscular power: Part 1 - Biological basis of maximal power production"* (Typo in KB!)
  - URL: `https://pubmed.ncbi.nlm.nih.gov/21198305/`
  - Status: **Title anomaly!** PubMed ID `21198305` is actually Part 2 (*"Developing maximal neuromuscular power: Part 2 - Training considerations for improving maximal power production"*). The title was erroneously copy-pasted as Part 1 in the existing file.
  - **Action**: When modularizing, update the title of `sci_biomech_cormie_2011` to reflect Part 2.

### 4.2 Shared PubMed ID Collision
- **Source 1 (`id: "sci_resistance_kraemer_2004"`, Area: Sollevamento Pesi, Line 378)**:
  - Title: *"Fundamentals of resistance training: progression and exercise prescription"*
  - URL: `https://pubmed.ncbi.nlm.nih.gov/15064696/`
  - Authors: Kraemer, W. J., & Ratamess, N. A. (ACSM Position Stand, 2004).
- **Source 2 (`id: "sci_physiol_fleck_2004"`, Area: Fisiologia, Line 616)**:
  - Title: *"Designing Resistance Training Programs (4th Edition)"*
  - Authors: Fleck, S. J., & Kraemer, W. J. (Human Kinetics textbook).
  - URL: `https://pubmed.ncbi.nlm.nih.gov/15064696/` (Re-used Kraemer 2004 PMID)
  - Status: Fleck & Kraemer is a textbook (ISBN: 9780736081702) not indexed on PubMed with an abstract. The URL previously reused Kraemer's 2004 ACSM paper URL.
  - **Action**: Both entries can be retained; subsequent deduplication scripts must match by ID and normalized title, not just PMID.

### 4.3 Non-PubMed External URL
- **Source (`id: "sci_weightlifting_takano_2012"`, Area: Sollevamento Pesi, Line 477)**:
  - Title: *"Weightlifting programming: a winning coach's guide"*
  - URL: `https://www.catalystathletics.com/`
  - Status: Legitimate coaching textbook by Bob Takano. Non-PubMed URLs are permitted when referencing foundational textbooks, but PubMed URLs or DOIs are preferred for peer-reviewed studies.

---

## 5. Complete Catalog of Existing 161 Sources (By Area)

Below is the complete, exhaustive catalog of all 161 sources currently in `js/knowledge-base.js`, categorized by the 7 thematic areas.

### 5.1 Atletica Leggera (21 sources)

| # | ID | Title | Authors | Journal (Year) | URL / PMID | Rules Profile |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `sci_sprint_morin_2011` | Technical ability of elite sprinters: ground force application orientation | Morin, J. B., Bourdin, M., Edouard, P., Peyrot, N., Samozino, P., & Lacour, J. R. | Medicine & Science in Sports & Exercise (2011) | [21317862](https://pubmed.ncbi.nlm.nih.gov/21317862/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 2 | `sci_sprint_weyand_2000` | Faster top speeds of human sprinters are achieved with greater ground forces, not rapid leg movements | Weyand, P. G., Sternlight, D. N., Bellizzi, M. J., & Wright, S. T. | Journal of Applied Physiology (2000) | [11056116](https://pubmed.ncbi.nlm.nih.gov/11056116/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 3 | `sci_sprint_clark_2014` | General force-velocity trajectories describe maximal running accelerations in humans | Clark, K. P., Ryan, L. J., & Weyand, P. G. | Journal of Experimental Biology (2014) | [24737762](https://pubmed.ncbi.nlm.nih.gov/24737762/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 4 | `sci_sprint_cross_2017` | Training at maximal power output in sprint acceleration: Horizontal force-velocity-power profiling | Cross, M. R., Brughelli, M., Samozino, P., & Morin, J. B. | International Journal of Sports Physiology and Performance (2017) | [28488884](https://pubmed.ncbi.nlm.nih.gov/28488884/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 5 | `sci_sprint_lockie_2003` | The effects of resisted sled towing on sprint kinematics in field-sport athletes | Lockie, R. G., Murphy, A. J., & Spinks, C. D. | Journal of Strength and Conditioning Research (2003) | [14636093](https://pubmed.ncbi.nlm.nih.gov/14636093/) | PT: Atleta; Sp: Atletica Leggera, Sport di Squadra; G: Power, Strength |
| 6 | `sci_sprint_buchheit_2013` | High-intensity interval training, solutions to the programming puzzle: Part II: anaerobic energy, neuromuscular load and practical applications | Buchheit, M., & Laursen, P. B. | Sports Medicine (2013) | [23832851](https://pubmed.ncbi.nlm.nih.gov/23832851/) | PT: Atleta; Sp: Atletica Leggera, Endurance; G: Power, Resistenza |
| 7 | `sci_sprint_haugen_2014` | Sprint running performance: a compilation of data with analysis of sprint training practices | Haugen, T. A., Tønnessen, E., Hisdal, J., & Seiler, S. | International Journal of Sports Physiology and Performance (2014) | [24509711](https://pubmed.ncbi.nlm.nih.gov/24509711/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 8 | `sci_jump_markovic_2007` | Does plyometric training improve vertical jump height? A meta-analytical review | Markovic, G. | British Journal of Sports Medicine (2007) | [17347316](https://pubmed.ncbi.nlm.nih.gov/17347316/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 9 | `sci_jump_komi_2000` | Stretch-shortening cycle: a powerful model to study normal and fatigued muscle | Komi, P. V. | Journal of Biomechanics (2000) | [10978496](https://pubmed.ncbi.nlm.nih.gov/10978496/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 10 | `sci_jump_bobbert_1996` | Why is countermovement jump height greater than squat jump height? | Bobbert, M. F., Gerritsen, K. G., Litjens, G. J., & Van Soest, A. J. | Medicine & Science in Sports & Exercise (1996) | [8887768](https://pubmed.ncbi.nlm.nih.gov/8887768/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 11 | `sci_jump_ramirez_2014` | Effects of drop jump training on physical fitness of youth soccer players | Ramirez-Campillo, R., Meylan, C., Alvarez, C., Henriquez-Olguin, C., Martinez, C., Cañas-Jamett, R., Andrade, D. C., & Izquierdo, M. | Journal of Strength and Conditioning Research (2014) | [24077376](https://pubmed.ncbi.nlm.nih.gov/24077376/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 15 | `sci_throws_terzis_2008` | Muscle fiber type composition and squatted jump performance in shot putters | Terzis, G., Georgiadis, G., Vassiliadou, E., & Manta, P. | Journal of Strength and Conditioning Research (2008) | [18515989](https://pubmed.ncbi.nlm.nih.gov/18515989/) | PT: Atleta; Sp: Atletica Leggera, Bodybuilding; G: Power, Strength |
| 19 | `sci_endurance_blagrove_2018` | Effects of Strength Training on the Physiological Determinants of Middle- and Long-Distance Running Performance: A Systematic Review | Blagrove, R. C., Howatson, G., & Hayes, P. R. | Sports Medicine (2018) | [29249083](https://pubmed.ncbi.nlm.nih.gov/29249083/) | PT: Atleta; Sp: Atletica Leggera, Endurance; G: Resistenza, Strength |
| 122 | `sci_sprint_morin_2016` | A simple method for computing sprint acceleration kinetics from running velocity data | Samozino, P., Rabita, G., Dorel, S., Slawinski, J., Peyrot, N., Saez de Villarreal, E., & Morin, J. B. | Journal of Biomechanics (2016) | [26997718](https://pubmed.ncbi.nlm.nih.gov/26997718/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 123 | `sci_sprint_jimenez_2018` | Effectiveness of an individualized training based on force-velocity profiling during jumping | Jimenez-Reyes, P., Samozino, P., Brughelli, M., & Morin, J. B. | Frontiers in Physiology (2017) | [28326043](https://pubmed.ncbi.nlm.nih.gov/28326043/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 124 | `sci_sprint_rabita_2015` | Sprint mechanics in world-class athletes: a new insight into the limits of human locomotion | Rabita, G., Dorel, S., Slawinski, J., Saez-de-Villarreal, E., Couturier, A., Samozino, P., & Morin, J. B. | Scandinavian Journal of Medicine & Science in Sports (2015) | [25640466](https://pubmed.ncbi.nlm.nih.gov/25640466/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 125 | `sci_sprint_haugen_2019` | Sprint running performance monitoring: methodological and practical considerations | Haugen, T. A., Breitschadel, F., & Seiler, S. | Sports Medicine (2020) | [31782009](https://pubmed.ncbi.nlm.nih.gov/31782009/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 126 | `sci_jump_markstrom_2019` | Plyometric training for youth athletes: a narrative review | Ramirez-Campillo, R., Alvarez, C., Garcia-Hermoso, A., Ramirez-Velez, R., & Gentil, P. | Strength and Conditioning Journal (2018) | [30100827](https://pubmed.ncbi.nlm.nih.gov/30100827/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 127 | `sci_sprint_petrakos_2016` | Resisted sled sprint training to improve sprint performance: a systematic review | Petrakos, G., Morin, J. B., & Egan, B. | Sports Medicine (2016) | [26694507](https://pubmed.ncbi.nlm.nih.gov/26694507/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 128 | `sci_jump_mcmahon_2017` | Understanding the key phases of the countermovement jump force-time curve | McMahon, J. J., Suchomel, T. J., Lake, J. P., & Comfort, P. | Strength and Conditioning Journal (2018) | [29503474](https://pubmed.ncbi.nlm.nih.gov/29503474/) | PT: Atleta; Sp: Atletica Leggera; G: Power |
| 129 | `sci_sprint_alcaraz_2018` | Effects of a resisted sprint training program on sprint kinematics in competitive youth athletes | Alcaraz, P. E., Carlos-Vivas, J., Oponjuru, B. O., & Martinez-Rodriguez, A. | Journal of Strength and Conditioning Research (2018) | [28957942](https://pubmed.ncbi.nlm.nih.gov/28957942/) | PT: Atleta; Sp: Atletica Leggera; G: Power |

### 5.2 Sollevamento Pesi (17 sources)

| # | ID | Title | Authors | Journal (Year) | URL / PMID | Rules Profile |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 12 | `sci_strength_suchomel_2016` | The Importance of Muscular Strength in Athletic Performance | Suchomel, T. J., Nimphius, S., & Stone, M. H. | Sports Medicine (2016) | [26791930](https://pubmed.ncbi.nlm.nih.gov/26791930/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Strength, Power |
| 13 | `sci_power_cormie_2011` | Developing maximal neuromuscular power: Part 1 - Biological basis of maximal power production | Cormie, P., McGuigan, M. R., & Newton, R. U. | Sports Medicine (2011) | [21198303](https://pubmed.ncbi.nlm.nih.gov/21198303/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Power, Strength |
| 14 | `sci_ballistic_newton_1996` | Kinematics, kinetics, and muscle activation during explosive upper body movements | Newton, R. U., Kraemer, W. J., Häkkinen, K., Triplett, N. T., & Arys, A. C. | Journal of Applied Biomechanics (1996) | [9414013](https://pubmed.ncbi.nlm.nih.gov/9414013/) | PT: Atleta; Sp: Atletica Leggera, Bodybuilding, Sport di Squadra; G: Power |
| 21 | `sci_weightlifting_haff_2001` | Force-time curve characteristics of dynamic and isometric muscle actions of elite women Olympic weightlifters | Haff, G. G., Whitley, A., & Potteiger, J. A. | Journal of Strength and Conditioning Research (2001) | [11708871](https://pubmed.ncbi.nlm.nih.gov/11708871/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra; G: Strength, Power |
| 22 | `sci_weightlifting_stone_2006` | Maximum strength and weightlifting performance: Relationship to vertical jump and sprint speed | Stone, M. H., Stone, M. E., & Sands, W. A. | Sports Biomechanics (2006) | [16553066](https://pubmed.ncbi.nlm.nih.gov/16553066/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Strength, Power |
| 23 | `sci_weightlifting_suchomel_2017` | Weightlifting Derivatives: Barbell Position and Catch Phase Modifications | Suchomel, T. J., Comfort, P., & Lake, J. P. | Sports Medicine (2017) | [28247103](https://pubmed.ncbi.nlm.nih.gov/28247103/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Power |
| 24 | `sci_resistance_kraemer_2004` | Fundamentals of resistance training: progression and exercise prescription | Kraemer, W. J., & Ratamess, N. A. | Medicine & Science in Sports & Exercise (2004) | [15064696](https://pubmed.ncbi.nlm.nih.gov/15064696/) | PT: Atleta, Clinico; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Strength, Hypertrophy |
| 25 | `sci_weightlifting_storey_2012` | Unique aspects of competitive weightlifting performance: structural, neuromuscular and metabolic adaptations | Storey, A., & Smith, H. K. | Sports Medicine (2012) | [22897427](https://pubmed.ncbi.nlm.nih.gov/22897427/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra; G: Strength, Power |
| 26 | `sci_pap_chiu_2003` | Postactivation potentiation response in athletic and recreationally trained individuals | Chiu, L. Z., Fry, A. C., Weiss, L. W., Schilling, B. K., Brown, L. E., & Smith, S. L. | Journal of Strength and Conditioning Research (2003) | [14636098](https://pubmed.ncbi.nlm.nih.gov/14636098/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Power |
| 114 | `sci_weightlifting_garhammer_1993` | A review of power output studies of Olympic and powerlifting: methodology, performance prediction, and evaluation tests | Garhammer, J. | Journal of Strength and Conditioning Research (1993) | [8437146](https://pubmed.ncbi.nlm.nih.gov/8437146/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra; G: Power, Strength |
| 115 | `sci_weightlifting_comfort_2012` | Comparisons of peak ground reaction force and rate of force development during variations of the power clean | Comfort, P., Allen, M., & Graham-Smith, P. | Journal of Strength and Conditioning Research (2012) | [21993027](https://pubmed.ncbi.nlm.nih.gov/21993027/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra; G: Power, Strength |
| 116 | `sci_weightlifting_takano_2012` | Weightlifting programming: a winning coach's guide | Takano, B. | Catalyst Athletics (2012) | [Link](https://www.catalystathletics.com/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra; G: Strength, Power |
| 117 | `sci_weightlifting_james_2018` | Effect of Olympic weightlifting-based training on reactive strength and sprint performance in adolescent athletes | James, L. P., Haff, G. G., Kelly, V. G., & Beckman, E. M. | Strength and Conditioning Journal (2018) | [29503625](https://pubmed.ncbi.nlm.nih.gov/29503625/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra; G: Power |
| 118 | `sci_weightlifting_kipp_2012` | Mechanical demand of the hang power clean and jump shrug in collegiate athletes | Kipp, K., Malloy, P. J., Smith, J., & Comfort, P. | Journal of Strength and Conditioning Research (2018) | [29698322](https://pubmed.ncbi.nlm.nih.gov/29698322/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra; G: Power |
| 119 | `sci_weightlifting_suchomel_2015` | The importance of muscular strength: training considerations | Suchomel, T. J., Nimphius, S., & Stone, M. H. | Sports Medicine (2016) | [26838985](https://pubmed.ncbi.nlm.nih.gov/26838985/) | PT: Atleta; G: Strength, Power |
| 120 | `sci_weightlifting_haff_2015` | Training load and monitoring an athlete's tolerance for endurance, strength, and power activities | Haff, G. G. | Strength and Conditioning Journal (2015) | [26199192](https://pubmed.ncbi.nlm.nih.gov/26199192/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra; G: Strength, Power |
| 121 | `sci_weightlifting_stone_2005` | Maximum strength and strength training: a relationship to endurance? | Stone, M. H., Stone, M., & Sands, W. A. | Strength and Conditioning Journal (2005) | [16287367](https://pubmed.ncbi.nlm.nih.gov/16287367/) | PT: Atleta; G: Strength, Resistenza |

### 5.3 Fisiologia (33 sources)

| # | ID | Title | Authors | Journal (Year) | URL / PMID | Rules Profile |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 16 | `sci_endurance_ronnestad_2014` | Optimizing strength training for running and cycling performance: A review | Rønnestad, B. R., & Mujika, I. | Scandinavian Journal of Medicine & Science in Sports (2014) | [23914664](https://pubmed.ncbi.nlm.nih.gov/23914664/) | PT: Atleta; Sp: Atletica Leggera, Endurance; G: Resistenza, Strength |
| 17 | `sci_endurance_midgley_2007` | Training to enhance maximal oxygen uptake: how to maximize time at or near VO2max | Midgley, A. W., McNaughton, L. R., & Jones, A. M. | Sports Medicine (2007) | [17196020](https://pubmed.ncbi.nlm.nih.gov/17196020/) | PT: Atleta; Sp: Atletica Leggera, Endurance; G: Resistenza |
| 18 | `sci_endurance_jones_2006` | The physiology of the world record holder for the women's marathon: a case study | Jones, A. M. | International Journal of Sports Science & Coaching (2006) | [16931758](https://pubmed.ncbi.nlm.nih.gov/16931758/) | PT: Atleta; Sp: Atletica Leggera, Endurance; G: Resistenza |
| 20 | `sci_detraining_mujika_2000` | Detraining: loss of training-induced physiological and performance adaptations. Part I: short-term insufficient training stimulus | Mujika, I., & Padilla, S. | Sports Medicine (2000) | [10999422](https://pubmed.ncbi.nlm.nih.gov/10999422/) | PT: Atleta, Clinico; Sp: Atletica Leggera, Bodybuilding, Sport di Squadra, Endurance; G: Definition, Rehab |
| 31 | `sci_physiol_fleck_2004` | Designing Resistance Training Programs (4th Edition) | Fleck, S. J., & Kraemer, W. J. | Human Kinetics (2014) | [15064696](https://pubmed.ncbi.nlm.nih.gov/15064696/) | PT: Atleta, Clinico; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Strength, Hypertrophy |
| 32 | `sci_physiol_ahtiainen_2003` | Muscle hypertrophy, hormonal adaptation and strength development during strength training in strength-trained and untrained men | Ahtiainen, J. P., Pakarinen, A., Alen, M., Kraemer, W. J., & Häkkinen, K. | European Journal of Applied Physiology (2003) | [12629688](https://pubmed.ncbi.nlm.nih.gov/12629688/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra; G: Strength, Hypertrophy |
| 33 | `sci_physiol_crewther_2006` | Two emerging concepts in physical training: Neuromuscular fatigue and postactivation potentiation from fatigue to potentiation | Crewther, B., Keogh, J., Cronin, J., & Cook, C. | Sports Medicine (2006) | [17052063](https://pubmed.ncbi.nlm.nih.gov/17052063/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Power |
| 35 | `sci_monitoring_mcguigan_2012` | Monitoring training load and fatigue in resistance training | McGuigan, M. R., Al-Curry, M., & Foster, C. | International Journal of Sports Physiology and Performance (2012) | [23136270](https://pubmed.ncbi.nlm.nih.gov/23136270/) | PT: Atleta, Clinico; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Strength, Definition |
| 54 | `sci_physiol_tabata_1996` | Effects of moderate-intensity endurance and high-intensity intermittent training on anaerobic capacity and VO2max | Tabata, I., et al. | Medicine & Science in Sports & Exercise (1996) | [8897392](https://pubmed.ncbi.nlm.nih.gov/8897392/) | PT: Atleta; Sp: Sport di Squadra, Endurance; G: Power, Resistenza |
| 55 | `sci_physiol_bangsbo_1994` | Physiological response to intermittent exercise | Bangsbo, J. | International Journal of Sports Medicine (1994) | [7851956](https://pubmed.ncbi.nlm.nih.gov/7851956/) | PT: Atleta; Sp: Sport di Squadra |
| 56 | `sci_physiol_buchheit_2013` | High-intensity interval training, solutions to the programming puzzle: Part I: cardiopulmonary / neuromuscular responses | Buchheit, M., & Laursen, P. B. | Sports Medicine (2013) | [23539308](https://pubmed.ncbi.nlm.nih.gov/23539308/) | PT: Atleta; Sp: Sport di Squadra, Endurance |
| 57 | `sci_physiol_izquierdo_2006` | Differential effects of strength training leading to failure versus not to failure on hormonal responses, strength, and muscle power | Izquierdo, M., et al. | Journal of Applied Physiology (2006) | [16672361](https://pubmed.ncbi.nlm.nih.gov/16672361/) | PT: Atleta; Sp: Sport di Squadra, Bodybuilding; G: Power, Strength |
| 58 | `sci_physiol_wasserman_1973` | Anaerobic threshold and respiratory gas exchange during exercise | Wasserman, K., et al. | Journal of Applied Physiology (1973) | [4761272](https://pubmed.ncbi.nlm.nih.gov/4761272/) | PT: Atleta, Clinico; Sp: Endurance |
| 59 | `sci_physiol_brooks_1986` | The lactate shuttle: carbohydrate metabolism during exercise | Brooks, G. A. | Medicine & Science in Sports & Exercise (1986) | [3523107](https://pubmed.ncbi.nlm.nih.gov/3523107/) | PT: Atleta; Sp: Endurance |
| 60 | `sci_physiol_seiler_2006` | Autonomic recovery after exercise in trained athletes: intensity and duration effects | Seiler, S., Haugen, O., & Kuffel, E. | Medicine & Science in Sports & Exercise (2006) | [16888457](https://pubmed.ncbi.nlm.nih.gov/16888457/) | PT: Atleta; Sp: Endurance; G: Resistenza, Strength |
| 61 | `sci_physiol_gibala_2006` | Short-term sprint interval training increases human skeletal muscle oxidative capacity and endurance performance | Gibala, M. J., et al. | Journal of Physiology (2006) | [16973704](https://pubmed.ncbi.nlm.nih.gov/16973704/) | PT: Atleta; G: Resistenza, Definition |
| 62 | `sci_physiol_gollnick_1972` | Enzyme activity and fiber composition in skeletal muscle of untrained and trained men | Gollnick, P. D., et al. | Journal of Applied Physiology (1972) | [5075868](https://pubmed.ncbi.nlm.nih.gov/5075868/) | PT: Atleta; Sp: Endurance |
| 63 | `sci_physiol_hawley_2014` | Integrative biology of exercise | Hawley, J. A., Hargreaves, M., Joyner, M. J., & Zierath, J. R. | Cell (2014) | [25417157](https://pubmed.ncbi.nlm.nih.gov/25417157/) | PT: Atleta |
| 64 | `sci_physiol_millet_2011` | Neuromuscular fatigue in ultra-endurance exercise | Millet, G. Y. | Sports Medicine (2011) | [22082073](https://pubmed.ncbi.nlm.nih.gov/22082073/) | PT: Atleta; Sp: Endurance; G: Resistenza |
| 65 | `sci_physiol_fry_1997` | Overtraining in athletes: an update | Fry, A. C., & Kraemer, W. J. | Sports Medicine (1997) | [9068094](https://pubmed.ncbi.nlm.nih.gov/9068094/) | PT: Atleta; G: Strength, Resistenza |
| 66 | `sci_physiol_schoenfeld_2016` | Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis | Schoenfeld, B. J., Ogborn, D., & Krieger, J. W. | Journal of Sports Sciences (2016) | [27433960](https://pubmed.ncbi.nlm.nih.gov/27433960/) | PT: Atleta; Sp: Bodybuilding; G: Hypertrophy |
| 67 | `sci_physiol_morton_2018` | A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults | Morton, R. W., et al. | British Journal of Sports Medicine (2018) | [28698222](https://pubmed.ncbi.nlm.nih.gov/28698222/) | PT: Atleta; G: Hypertrophy, Strength |
| 68 | `sci_physiol_gundersen_2016` | Muscle memory and a new cellular model for sarcopenia and atrophy | Gundersen, K. | Journal of Experimental Biology (2016) | [26792335](https://pubmed.ncbi.nlm.nih.gov/26792335/) | PT: Atleta, Clinico; G: Hypertrophy, Rehab |
| 69 | `sci_physiol_tesch_1986` | Muscle metabolism during intense resistance exercise | Tesch, P. A., et al. | European Journal of Applied Physiology and Occupational Physiology (1986) | [3770020](https://pubmed.ncbi.nlm.nih.gov/3770020/) | PT: Atleta; Sp: Bodybuilding; G: Hypertrophy, Strength |
| 70 | `sci_physiol_joyner_2008` | Endurance exercise performance: the physiology of champions | Joyner, M. J., & Coyle, E. F. | Journal of Physiology (2008) | [17991697](https://pubmed.ncbi.nlm.nih.gov/17991697/) | PT: Atleta; Sp: Endurance; G: Resistenza |
| 138 | `sci_physiol_schoenfeld_freq_2016` | Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis | Schoenfeld, B. J., Ogborn, D., & Krieger, J. W. | Sports Medicine (2016) | [27102424](https://pubmed.ncbi.nlm.nih.gov/27102424/) | PT: Atleta; G: Hypertrophy |
| 139 | `sci_physiol_schoenfeld_2015` | Effects of low- versus high-load resistance training on muscle strength and hypertrophy in well-trained men | Schoenfeld, B. J., Peterson, M. D., Ogborn, D., Contreras, B., & Sonmez, G. T. | Journal of Strength and Conditioning Research (2015) | [25853914](https://pubmed.ncbi.nlm.nih.gov/25853914/) | PT: Atleta; G: Hypertrophy, Strength |
| 140 | `sci_physiol_damas_2015` | A review of resistance training-induced changes in skeletal muscle protein synthesis and their contribution to hypertrophy | Damas, F., Phillips, S., Vechin, F. C., & Ugrinowitsch, C. | Sports Medicine (2015) | [25702468](https://pubmed.ncbi.nlm.nih.gov/25702468/) | PT: Atleta; G: Hypertrophy |
| 141 | `sci_physiol_folland_2007` | The adaptations to strength training: morphological and neurological contributions to increased strength | Folland, J. P., & Williams, A. G. | Sports Medicine (2007) | [17241104](https://pubmed.ncbi.nlm.nih.gov/17241104/) | PT: Atleta; G: Strength, Hypertrophy |
| 142 | `sci_physiol_kraemer_2002` | Hormonal responses and adaptations to resistance exercise and training | Kraemer, W. J., & Ratamess, N. A. | Sports Medicine (2005) | [15831061](https://pubmed.ncbi.nlm.nih.gov/15831061/) | PT: Atleta; G: Hypertrophy, Strength |
| 143 | `sci_physiol_hoppeler_2011` | Molecular mechanisms of muscle plasticity with exercise | Hoppeler, H., Baum, O., Lurman, G., & Mueller, M. | Comprehensive Physiology (2011) | [23728984](https://pubmed.ncbi.nlm.nih.gov/23728984/) | PT: Atleta; G: Hypertrophy, Resistenza |
| 144 | `sci_physiol_behm_2010` | Effect of acute static stretching on force, balance, reaction time, and movement time | Behm, D. G., Bambury, A., Cahill, F., & Power, K. | Medicine & Science in Sports & Exercise (2004) | [15292746](https://pubmed.ncbi.nlm.nih.gov/15292746/) | PT: Atleta; G: Rehab, Resistenza, Power |
| 145 | `sci_physiol_wilson_2012` | Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises | Wilson, J. M., Marin, P. J., Rhea, M. R., Wilson, S. M., Loenneke, J. P., & Anderson, J. C. | Journal of Strength and Conditioning Research (2012) | [22002517](https://pubmed.ncbi.nlm.nih.gov/22002517/) | PT: Atleta; G: Strength, Resistenza, Hypertrophy |

### 5.4 VBT (13 sources)

| # | ID | Title | Authors | Journal (Year) | URL / PMID | Rules Profile |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 27 | `sci_vbt_badillo_2010` | Movement velocity as a measure of loading intensity in resistance training | González-Badillo, J. J., & Sánchez-Medina, L. | International Journal of Sports Medicine (2010) | [20146162](https://pubmed.ncbi.nlm.nih.gov/20146162/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera, Endurance, Calcio, Basketball; G: Strength, Power |
| 28 | `sci_vbt_sanchez_2011` | Velocity loss as an indicator of neuromuscular fatigue during resistance training | Sánchez-Medina, L., & González-Badillo, J. J. | Medicine & Science in Sports & Exercise (2011) | [20689453](https://pubmed.ncbi.nlm.nih.gov/20689453/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera, Endurance, Calcio, Basketball; G: Strength, Power |
| 29 | `sci_vbt_pareja_2017` | Effects of velocity loss during resistance training on athletic performance, strength, and muscle hypertrophy | Pareja-Blanco, F., Rodríguez-Rosell, D., Sánchez-Medina, L., Sanchis-Moysi, J., Dorado, C., Mora-Custodio, R., Yáñez-García, J. M., Morales-Alamo, D., Calbet, J. A. L., & González-Badillo, J. J. | Medicine & Science in Sports & Exercise (2017) | [27845943](https://pubmed.ncbi.nlm.nih.gov/27845943/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Strength, Power, Hypertrophy |
| 30 | `sci_vbt_weakley_2021` | Velocity-Based Training: From Theory to Application | Weakley, J., Mann, B., Banyard, H., McLaren, S., Scott, T., & Garcia-Ramos, A. | Sports Medicine (2021) | [33433845](https://pubmed.ncbi.nlm.nih.gov/33433845/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Strength, Power |
| 34 | `sci_vbt_garcia_2018` | The Force-Velocity Relationship in Resistance Exercises: Technical Aspects and Methodology | García-Ramos, A., & Jaric, S. | Sports Biomechanics (2018) | [29092658](https://pubmed.ncbi.nlm.nih.gov/29092658/) | PT: Atleta; Sp: Bodybuilding, Sport di Squadra, Atletica Leggera; G: Power, Strength |
| 106 | `sci_vbt_dorrell_2020` | Comparison of velocity-based and traditional percentage-based loading methods on maximal strength and power adaptations | Dorrell, H. F., Smith, M. F., & Sheridan, G. J. | Journal of Strength and Conditioning Research (2020) | [31009432](https://pubmed.ncbi.nlm.nih.gov/31009432/) | PT: Atleta; G: Strength, Power |
| 107 | `sci_vbt_jovanovic_2014` | The load-velocity relationship in the back squat: individualized vs. generalized load-velocity profiles | Jovanovic, M., & Flanagan, E. P. | International Journal of Sports Physiology and Performance (2014) | [24809472](https://pubmed.ncbi.nlm.nih.gov/24809472/) | PT: Atleta; G: Strength, Power |
| 108 | `sci_vbt_gonzalez_2017` | Predictive accuracy of the load-velocity relationship for bench press | Gonzalez-Badillo, J. J., & Sanchez-Medina, L. | International Journal of Sports Medicine (2010) | [20024937](https://pubmed.ncbi.nlm.nih.gov/20024937/) | PT: Atleta; G: Strength |
| 109 | `sci_vbt_banyard_2017` | The reliability of individualized load-velocity profiles in the free-weight back squat | Banyard, H. G., Nosaka, K., & Haff, G. G. | International Journal of Sports Physiology and Performance (2017) | [27633948](https://pubmed.ncbi.nlm.nih.gov/27633948/) | PT: Atleta; G: Strength, Power |
| 110 | `sci_vbt_perez_2020` | Effects of different velocity loss thresholds on passive recovery time | Perez-Castilla, A., Piepoli, A., Delgado-Garcia, G., Garrido-Blanca, G., & Garcia-Ramos, A. | Journal of Strength and Conditioning Research (2020) | [30946269](https://pubmed.ncbi.nlm.nih.gov/30946269/) | PT: Atleta; G: Strength, Power, Hypertrophy |
| 111 | `sci_vbt_mann_2015` | Velocity-based training in football | Mann, J. B., Ivey, P. A., & Sayers, S. P. | Strength and Conditioning Journal (2015) | [26197614](https://pubmed.ncbi.nlm.nih.gov/26197614/) | PT: Atleta; Sp: Sport di Squadra, Calcio; G: Strength, Power |
| 112 | `sci_vbt_conceicao_2016` | Movement velocity as a measure of exercise intensity in three lower limb exercises | Conceicao, F., Fernandes, J., Lewis, M., Gonzalez-Badillo, J. J., & Jimenez-Reyes, P. | Journal of Sports Sciences (2016) | [26732397](https://pubmed.ncbi.nlm.nih.gov/26732397/) | PT: Atleta; G: Strength, Power |
| 113 | `sci_vbt_thompson_2023` | Velocity-based training: a systematic review and meta-analysis | Thompson, S. W., Rogerson, D., Dorrell, H. F., Ruddock, A., & Barnes, A. | Sports Medicine (2023) | [36399261](https://pubmed.ncbi.nlm.nih.gov/36399261/) | PT: Atleta; G: Strength, Power |

### 5.5 Biomeccanica (26 sources)

| # | ID | Title | Authors | Journal (Year) | URL / PMID | Rules Profile |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 36 | `sci_biomech_komi_2000` | Stretch-shortening cycle: a powerful model to study normal and fatigued muscle structure and function | Komi, P. V. | Journal of Biomechanics (2000) | [10917766](https://pubmed.ncbi.nlm.nih.gov/10917766/) | PT: Atleta; Sp: Sport di Squadra, Atletica Leggera; G: Power, Strength |
| 37 | `sci_biomech_nigg_2001` | The role of impact forces and foot pronation: a new paradigm | Nigg, B. M. | Clinical Journal of Sport Medicine (2001) | [11176141](https://pubmed.ncbi.nlm.nih.gov/11176141/) | PT: Atleta; Sp: Endurance |
| 38 | `sci_biomech_enoka_1988` | Muscle strength and its development: new perspectives | Enoka, R. M. | Sports Medicine (1988) | [3057316](https://pubmed.ncbi.nlm.nih.gov/3057316/) | PT: Atleta; G: Strength, Power |
| 39 | `sci_biomech_herzog_2004` | History-dependent properties of skeletal muscle: rheological properties and residual force enhancement | Herzog, W. | Journal of Electromyography and Kinesiology (2004) | [15094144](https://pubmed.ncbi.nlm.nih.gov/15094144/) | PT: Atleta, Clinico; G: Strength, Hypertrophy |
| 40 | `sci_biomech_zatsiorsky_2002` | Kinetics of Human Motion | Zatsiorsky, V. M. | Human Kinetics (2002) | [11932598](https://pubmed.ncbi.nlm.nih.gov/11932598/) | PT: Atleta; Sp: Bodybuilding; G: Strength |
| 41 | `sci_biomech_cavanagh_1980` | Ground reaction forces in distance running | Cavanagh, P. R., & Lafortune, M. A. | Journal of Biomechanics (1980) | [7400379](https://pubmed.ncbi.nlm.nih.gov/7400379/) | PT: Atleta, Clinico; Sp: Endurance |
| 42 | `sci_biomech_arampatzis_2006` | Influence of the muscle-tendon unit mechanical properties on mechanical efficiency in bouncing gait | Arampatzis, A., et al. | Journal of Experimental Biology (2006) | [16731809](https://pubmed.ncbi.nlm.nih.gov/16731809/) | PT: Atleta; Sp: Atletica Leggera, Endurance; G: Power |
| 43 | `sci_biomech_ishikawa_2005` | Interaction between fascicle and tendinous tissue in short-contact stretch-shortening cycle exercise | Ishikawa, M., Niemelä, E., & Komi, P. V. | Journal of Applied Physiology (2005) | [15890807](https://pubmed.ncbi.nlm.nih.gov/15890807/) | PT: Atleta; Sp: Sport di Squadra, Atletica Leggera |
| 44 | `sci_biomech_deluca_2006` | Filtering the surface EMG signal: Movement artifact and baseline noise removal | De Luca, C. J., et al. | Journal of Electromyography and Kinesiology (2006) | [16679036](https://pubmed.ncbi.nlm.nih.gov/16679036/) | PT: Atleta, Clinico; G: Strength, Rehab |
| 45 | `sci_biomech_moritani_1979` | Neural factors versus hypertrophy in time course of muscle strength gain | Moritani, T., & deVries, H. A. | American Journal of Physical Medicine (1979) | [443443](https://pubmed.ncbi.nlm.nih.gov/443443/) | PT: Atleta; G: Strength |
| 46 | `sci_biomech_escamilla_2000` | Knee biomechanics during the squat exercise | Escamilla, R. F. | Medicine & Science in Sports & Exercise (2000) | [10776897](https://pubmed.ncbi.nlm.nih.gov/10776897/) | PT: Atleta, Clinico; Inj: post_op_lca, knee_generic, patellar_tendonitis |
| 47 | `sci_biomech_lieber_2004` | Skeletal muscle design to meet functional demands | Lieber, R. L., & Fridén, J. | Philosophical Transactions of the Royal Society B: Biological Sciences (2004) | [15519971](https://pubmed.ncbi.nlm.nih.gov/15519971/) | PT: Atleta, Clinico; G: Hypertrophy, Rehab |
| 48 | `sci_biomech_gregersen_2006` | Biomechanics of cycling: loads on the spine, knee, and ankle | Gregersen, C. S., & Hull, M. L. | Journal of Biomechanical Engineering (2006) | [16706012](https://pubmed.ncbi.nlm.nih.gov/16706012/) | PT: Atleta; Sp: Endurance; Inj: lumbar_pain, knee_generic |
| 49 | `sci_biomech_samozino_2016` | Optimal Force-Velocity Profile in Ballistic Movements: Altius, Citius, Fortius | Samozino, P., et al. | Medicine & Science in Sports & Exercise (2016) | [26741119](https://pubmed.ncbi.nlm.nih.gov/26741119/) | PT: Atleta; Sp: Sport di Squadra, Atletica Leggera; G: Power, Strength |
| 50 | `sci_biomech_mcgill_2001` | Low back stability: mechanics, injury mechanisms, and rehabilitation | McGill, S. M. | Journal of Electromyography and Kinesiology (2001) | [11738952](https://pubmed.ncbi.nlm.nih.gov/11738952/) | PT: Clinico, Atleta; Inj: lumbar_pain, hernia_disk, sensitive_back |
| 51 | `sci_biomech_winter_1990` | Biomechanics and Motor Control of Human Movement | Winter, D. A. | John Wiley & Sons (1990) | [2275521](https://pubmed.ncbi.nlm.nih.gov/2275521/) | PT: Atleta, Clinico |
| 52 | `sci_biomech_cronin_2005` | Strength and power predictors of sports speed: deterministic modeling | Cronin, J., & Hansen, K. T. | Sports Medicine (2005) | [15799745](https://pubmed.ncbi.nlm.nih.gov/15799745/) | PT: Atleta; Sp: Sport di Squadra, Atletica Leggera; G: Power |
| 53 | `sci_biomech_cormie_2011` | Developing maximal neuromuscular power: Part 1 - Biological basis of maximal power production | Cormie, P., McGuigan, M. R., & Newton, R. U. | Sports Medicine (2011) | [21198305](https://pubmed.ncbi.nlm.nih.gov/21198305/) | PT: Atleta; G: Power, Strength |
| 146 | `sci_biomech_schoenfeld_2010` | Squatting kinematics and kinetics and their application to exercise performance | Schoenfeld, B. J. | Journal of Strength and Conditioning Research (2010) | [20182386](https://pubmed.ncbi.nlm.nih.gov/20182386/) | PT: Atleta; G: Strength, Hypertrophy |
| 147 | `sci_biomech_contreras_2011` | A comparison of gluteus maximus, biceps femoris, and vastus lateralis EMG activity in the back squat and barbell hip thrust exercises | Contreras, B., Vigotsky, A. D., Schoenfeld, B. J., Beardsley, C., & Cronin, J. | Journal of Applied Biomechanics (2015) | [26214739](https://pubmed.ncbi.nlm.nih.gov/26214739/) | PT: Atleta; G: Strength, Hypertrophy |
| 148 | `sci_biomech_bryanton_2012` | Effect of squat depth on muscle activation | Bryanton, M. A., Kennedy, M. D., Carey, J. P., & Chiu, L. Z. | Journal of Strength and Conditioning Research (2012) | [22344055](https://pubmed.ncbi.nlm.nih.gov/22344055/) | PT: Atleta; G: Strength, Hypertrophy |
| 149 | `sci_biomech_kubo_2001` | Effects of resistance and stretching training programmes on the viscoelastic properties of human tendon structures in vivo | Kubo, K., Kanehisa, H., & Fukunaga, T. | Journal of Physiology (2002) | [11796676](https://pubmed.ncbi.nlm.nih.gov/11796676/) | PT: Atleta; G: Strength, Rehab, Resistenza |
| 150 | `sci_biomech_wulf_2013` | Attentional focus and motor learning: a review of 15 years | Wulf, G. | International Review of Sport and Exercise Psychology (2013) | [23745671](https://pubmed.ncbi.nlm.nih.gov/23745671/) | PT: Atleta; G: Strength, Power |
| 151 | `sci_biomech_flanagan_2012` | Muscle activation patterns and knee mechanics during isometric and dynamic squats | Flanagan, S. P., & Salem, G. J. | Journal of Strength and Conditioning Research (2007) | [17685679](https://pubmed.ncbi.nlm.nih.gov/17685679/) | PT: Atleta, Clinico; G: Strength, Rehab; Inj: knee_generic |
| 152 | `sci_biomech_mcgill_2009` | Comparison of different strongman events: trunk muscle activation and lumbar spine motion, load, and stiffness | McGill, S. M., McDermott, A., & Fenwick, C. M. | Journal of Strength and Conditioning Research (2009) | [19077735](https://pubmed.ncbi.nlm.nih.gov/19077735/) | PT: Atleta; G: Strength, Power |
| 153 | `sci_biomech_vigotsky_2018` | The role of internal and external forces on the biomechanics of the squat exercise | Vigotsky, A. D., Bryanton, M. A., Nuckols, G., & Beardsley, C. | International Journal of Sports Physical Therapy (2019) | [30746294](https://pubmed.ncbi.nlm.nih.gov/30746294/) | PT: Atleta, Clinico; G: Strength; Inj: knee_generic |

### 5.6 Clinico (26 sources)

| # | ID | Title | Authors | Journal (Year) | URL / PMID | Rules Profile |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 71 | `sci_lca_myer_2006` | Targeted neuromuscular training improves performance and neuromuscular biomechanics in female athletes | Myer, G. D., Ford, K. R., Palumbo, J. P., & Hewett, T. E. | Journal of Strength and Conditioning Research (2006) | [16503678](https://pubmed.ncbi.nlm.nih.gov/16503678/) | PT: Clinico; Inj: lesione_lca, post_op_lca, knee_generic |
| 72 | `sci_lca_grindem_2016` | Simple decision rules reduce reinjury risk after anterior cruciate ligament reconstruction: the Delaware-Oslo ACL cohort study | Grindem, H., Snyder-Mackler, L., Moksnes, H., Engebretsen, L., & Risberg, M. A. | British Journal of Sports Medicine (2016) | [27162233](https://pubmed.ncbi.nlm.nih.gov/27162233/) | PT: Clinico; Inj: post_op_lca, lesione_lca |
| 73 | `sci_lca_buckthorpe_2019` | Optimising the early-stage rehabilitation process after anterior cruciate ligament reconstruction | Buckthorpe, M., Della Villa, F., Della Villa, S., & Roi, G. S. | Sports Medicine (2019) | [31168817](https://pubmed.ncbi.nlm.nih.gov/31168817/) | PT: Clinico; Inj: post_op_lca, lesione_lca |
| 74 | `sci_lca_hewett_2005` | Biomechanical measures of neuromuscular control and valgus loading of the knee predict anterior cruciate ligament injury risk in female athletes | Hewett, T. E., Myer, G. D., Ford, K. R., et al. | The American Journal of Sports Medicine (2005) | [15722363](https://pubmed.ncbi.nlm.nih.gov/15722363/) | PT: Clinico; Inj: lesione_lca, post_op_lca, knee_generic |
| 75 | `sci_tendon_malliaras_2013` | Achilles and patellar tendinopathy loading programmes : a systematic review comparing clinical outcomes and identifying potential mechanisms for effectiveness | Malliaras, P., Barton, C. J., Reeves, N. D., & Langberg, H. | Sports Medicine (2013) | [23625465](https://pubmed.ncbi.nlm.nih.gov/23625465/) | PT: Clinico; Inj: patellar_tendonitis, achilles_tendonitis, tendinopatia |
| 76 | `sci_tendon_cook_2009` | Is tendon pathology a continuum? A clinical model to explain the clinical presentation of load-induced tendinopathy | Cook, J. L., & Purdam, C. R. | British Journal of Sports Medicine (2009) | [19776044](https://pubmed.ncbi.nlm.nih.gov/19776044/) | PT: Clinico; Inj: patellar_tendonitis, achilles_tendonitis, tendinopatia |
| 77 | `sci_tendon_bohm_2015` | Human tendon adaptation to mechanical loading: a systematic review and meta-analysis of physiological determinants in vivo | Bohm, S., Mersmann, F., & Arampatzis, A. | Sports Medicine - Open (2015) | [27747846](https://pubmed.ncbi.nlm.nih.gov/27747846/) | PT: Clinico; Inj: patellar_tendonitis, achilles_tendonitis, tendinopatia |
| 78 | `sci_hamstring_ekstrand_2012` | Hamstring muscle strain recurrence and time loss in professional football | Ekstrand, J., Hägglund, M., & Waldén, M. | British Journal of Sports Medicine (2012) | [22219258](https://pubmed.ncbi.nlm.nih.gov/22219258/) | PT: Clinico; Inj: hamstring_strain, lesione_muscolare, thigh_strain |
| 79 | `sci_hamstring_vandyk_2019` | Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries: a systematic review and meta-analysis of 8459 athletes | van Dyk, N., Behan, F. P., & Whiteley, R. | British Journal of Sports Medicine (2019) | [30819786](https://pubmed.ncbi.nlm.nih.gov/30819786/) | PT: Clinico; Inj: hamstring_strain, lesione_muscolare, thigh_strain |
| 80 | `sci_hamstring_petersen_2011` | Preventing hamstring strains in football players: a randomized controlled trial | Petersen, J., Thorborg, K., Nielsen, M. B., Budtz-Jørgensen, E., & Holmich, P. | The American Journal of Sports Medicine (2011) | [21803979](https://pubmed.ncbi.nlm.nih.gov/21803979/) | PT: Clinico; Inj: hamstring_strain, lesione_muscolare |
| 81 | `sci_hamstring_bourne_2018` | Impact of exercise selection on hamstring muscle activation and architectural adaptations: a systematic review | Bourne, M. N., Timmins, R. G., Opar, D. A., et al. | Sports Medicine (2018) | [29450822](https://pubmed.ncbi.nlm.nih.gov/29450822/) | PT: Clinico; Inj: hamstring_strain, lesione_muscolare |
| 82 | `sci_shoulder_cools_2007` | Rehabilitation of scapular dyskinesis: from the office to the field | Cools, A. M., Struyf, F., De Mey, K., Danneels, L., & Cambier, D. | Journal of Sport Rehabilitation (2007) | [17923728](https://pubmed.ncbi.nlm.nih.gov/17923728/) | PT: Clinico; Inj: shoulder_impingement, rotator_cuff, scapular_dyskinesis, shoulder_instability |
| 83 | `sci_shoulder_kibler_2010` | Current concepts: scapular dyskinesis | Kibler, W. B., & Sciascia, A. | British Journal of Sports Medicine (2010) | [20371559](https://pubmed.ncbi.nlm.nih.gov/20371559/) | PT: Clinico; Inj: shoulder_impingement, rotator_cuff, shoulder_instability |
| 84 | `sci_shoulder_wilk_2009` | The shoulder in baseball: rehabilitation principles | Wilk, K. E., Reinold, M. M., & Dugas, J. R. | Journal of Orthopaedic & Sports Physical Therapy (2009) | [19182317](https://pubmed.ncbi.nlm.nih.gov/19182317/) | PT: Clinico; Inj: rotator_cuff, shoulder_instability, shoulder_impingement |
| 85 | `sci_spine_mcgill_2001` | Low back stability: from formal description to issues for performance and rehabilitation | McGill, S. M. | Exercise and Sport Sciences Reviews (2001) | [11265986](https://pubmed.ncbi.nlm.nih.gov/11265986/) | PT: Clinico; Inj: lumbar_pain, hernia_disk, spinal_stenosis, sensitive_back |
| 86 | `sci_spine_cholewicki_1996` | Mechanical stability of the in vivo lumbar spine: implications for injury and chronic low back pain | Cholewicki, J., & McGill, S. M. | Journal of Biomechanics (1996) | [8827400](https://pubmed.ncbi.nlm.nih.gov/8827400/) | PT: Clinico; Inj: lumbar_pain, hernia_disk, spondylolysis |
| 87 | `sci_spine_hodges_1996` | Inefficient muscular stabilization of the lumbar spine associated with low back pain: a motor control evaluation of transversus abdominis | Hodges, P. W., & Richardson, C. A. | Spine (1996) | [8923631](https://pubmed.ncbi.nlm.nih.gov/8923631/) | PT: Clinico; Inj: lumbar_pain, sensitive_back, hernia_disk |
| 88 | `sci_spine_hides_1996` | Multifidus muscle recovery is not automatic after resolution of acute, first-episode low back pain | Hides, J. A., Richardson, C. A., & Jull, G. A. | Spine (1996) | [8961451](https://pubmed.ncbi.nlm.nih.gov/8961451/) | PT: Clinico; Inj: lumbar_pain, sensitive_back, hernia_disk |
| 130 | `sci_lca_ardern_2016` | 2016 Consensus statement on return to sport from the first world congress in sports physical therapy | Ardern, C. L., Glasgow, P., Schneiders, A., Witvrouw, E., Clarsen, B., Cools, A., & Bizzini, M. | British Journal of Sports Medicine (2016) | [26888237](https://pubmed.ncbi.nlm.nih.gov/26888237/) | PT: Clinico, Atleta; G: Rehab; Inj: lesione_lca, knee_generic |
| 131 | `sci_tendon_rio_2015` | Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy | Rio, E., Kidgell, D., Purdam, C., Gaida, J., Moseley, G. L., Pearce, A. J., & Cook, J. | British Journal of Sports Medicine (2015) | [25979840](https://pubmed.ncbi.nlm.nih.gov/25979840/) | PT: Clinico, Atleta; G: Rehab; Inj: tendinopatia_rotulea, tendon_generic |
| 132 | `sci_spine_hicks_2005` | Preliminary development of a clinical prediction rule for determining which patients with low back pain will respond to a stabilization exercise program | Hicks, G. E., Fritz, J. M., Delitto, A., & McGill, S. M. | Archives of Physical Medicine and Rehabilitation (2005) | [16084801](https://pubmed.ncbi.nlm.nih.gov/16084801/) | PT: Clinico; G: Rehab; Inj: low_back_pain, spine_generic |
| 133 | `sci_ankle_hertel_2002` | Functional anatomy, pathomechanics, and pathophysiology of lateral ankle instability | Hertel, J. | Journal of Athletic Training (2002) | [12937557](https://pubmed.ncbi.nlm.nih.gov/12937557/) | PT: Clinico; G: Rehab; Inj: ankle_sprain, ankle_instability |
| 134 | `sci_shoulder_escamilla_2009` | Shoulder muscle recruitment patterns and related biomechanics during upper extremity sports | Escamilla, R. F., & Andrews, J. R. | Sports Medicine (2009) | [19453205](https://pubmed.ncbi.nlm.nih.gov/19453205/) | PT: Clinico, Atleta; G: Rehab; Inj: shoulder_impingement, rotator_cuff |
| 135 | `sci_knee_powers_2010` | The influence of abnormal hip mechanics on knee injury: a biomechanical perspective | Powers, C. M. | Journal of Orthopaedic & Sports Physical Therapy (2010) | [20710093](https://pubmed.ncbi.nlm.nih.gov/20710093/) | PT: Clinico, Atleta; G: Rehab; Inj: lesione_lca, knee_generic, patellofemoral |
| 136 | `sci_muscle_opar_2012` | Hamstring strain injuries: factors that lead to injury and re-injury | Opar, D. A., Williams, M. D., & Shield, A. J. | Sports Medicine (2012) | [22356851](https://pubmed.ncbi.nlm.nih.gov/22356851/) | PT: Clinico, Atleta; G: Rehab; Inj: hamstring_strain, lesione_muscolare |
| 137 | `sci_rehab_blanchard_2000` | The effects of cold water immersion on recovery from exercise-induced muscle damage | Bleakley, C. M., & Davison, G. W. | British Journal of Sports Medicine (2010) | [19945969](https://pubmed.ncbi.nlm.nih.gov/19945969/) | PT: Clinico, Atleta; G: Rehab |

### 5.7 Sport di Squadra (25 sources)

| # | ID | Title | Authors | Journal (Year) | URL / PMID | Rules Profile |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 89 | `sci_fifa_soligard_2008` | Comprehensive warm-up programme to prevent injuries in female football players: cluster randomised controlled trial | Soligard, T., Myklebust, G., Steffen, K., et al. | BMJ (2008) | [19066253](https://pubmed.ncbi.nlm.nih.gov/19066253/) | PT: Atleta; Sp: Sport di Squadra, Calcio |
| 90 | `sci_fifa_alattar_2017` | How effective are F-MARC injury prevention programmes for teamsports? A systematic review and meta-analysis | Al Attar, W. S. A., Soomro, N., Pappas, E., Sinclair, P. J., & Sanders, R. H. | British Journal of Sports Medicine (2017) | [28122797](https://pubmed.ncbi.nlm.nih.gov/28122797/) | PT: Atleta; Sp: Sport di Squadra, Calcio, Basketball |
| 91 | `sci_fifa_bahr_2015` | Why screening tests to predict injury do not work-and probably never will...: a story of 3500 medical examinations | Bahr, R. | British Journal of Sports Medicine (2015) | [26002938](https://pubmed.ncbi.nlm.nih.gov/26002938/) | PT: Atleta; Sp: Sport di Squadra, Calcio, Basketball |
| 92 | `sci_workload_gabbett_2016` | The training-injury prevention paradox: should athletes be training smarter and harder? | Gabbett, T. J. | British Journal of Sports Medicine (2016) | [26758673](https://pubmed.ncbi.nlm.nih.gov/26758673/) | PT: Atleta; Sp: Sport di Squadra, Calcio, Basketball, Endurance |
| 93 | `sci_workload_windt_2017` | How do training and competition workloads relate to injury? The workload-injury etiology model | Windt, J., & Gabbett, T. J. | British Journal of Sports Medicine (2017) | [27405944](https://pubmed.ncbi.nlm.nih.gov/27405944/) | PT: Atleta; Sp: Sport di Squadra, Calcio, Basketball |
| 94 | `sci_rsa_rampinini_2007` | Factors influencing repeated-sprint ability in football players | Rampinini, E., Sassi, A., Morelli, A., Mazzoni, S., Fanchini, M., & Coutts, A. J. | International Journal of Sports Medicine (2007) | [17497576](https://pubmed.ncbi.nlm.nih.gov/17497576/) | PT: Atleta; Sp: Sport di Squadra, Calcio |
| 95 | `sci_rsa_buchheit_2013` | High-intensity interval training, solutions to the programming puzzle: Part I: cardiopulmonary engines | Buchheit, M., & Laursen, P. B. | Sports Medicine (2013) | [23539301](https://pubmed.ncbi.nlm.nih.gov/23539301/) | PT: Atleta; Sp: Sport di Squadra, Calcio, Basketball |
| 96 | `sci_rsa_girard_2011` | Repeated-sprint ability - part 1: factors contributing to fatigue | Girard, O., Mendez-Villanueva, A., & Bishop, D. | Sports Medicine (2011) | [21688903](https://pubmed.ncbi.nlm.nih.gov/21688903/) | PT: Atleta; Sp: Sport di Squadra, Calcio, Basketball |
| 97 | `sci_cod_sheppard_2006` | Agility literature review: classifications in movement and sport-specific decision-making components | Sheppard, J. M., & Young, W. B. | Journal of Sports Sciences (2006) | [16935793](https://pubmed.ncbi.nlm.nih.gov/16935793/) | PT: Atleta; Sp: Sport di Squadra, Calcio, Basketball |
| 98 | `sci_cod_spiteri_2014` | Mechanical determinants of faster change of direction and agility performance in female basketball players | Spiteri, T., Nimphius, S., Hart, N. H., Specos, C., Sheppard, J. M., & Newton, R. U. | Journal of Strength and Conditioning Research (2014) | [24149526](https://pubmed.ncbi.nlm.nih.gov/24149526/) | PT: Atleta; Sp: Sport di Squadra, Basketball, Calcio |
| 99 | `sci_cod_nimphius_2016` | Change of direction deficit: a more isolated measure of change of direction performance | Nimphius, S., Callaghan, S. J., Spiteri, T., & Lockie, R. G. | Journal of Strength and Conditioning Research (2016) | [26982400](https://pubmed.ncbi.nlm.nih.gov/26982400/) | PT: Atleta; Sp: Sport di Squadra, Calcio, Basketball |
| 100 | `sci_team_impellizzeri_2006` | Physiological and performance effects of generic versus specific high-intensity interval training in football players | Impellizzeri, F. M., Marcora, S. M., Castagna, C., Reilly, T., Sassi, A., & Rampinini, E. | International Journal of Sports Medicine (2006) | [16802251](https://pubmed.ncbi.nlm.nih.gov/16802251/) | PT: Atleta; Sp: Sport di Squadra, Calcio |
| 101 | `sci_team_taylor_2017` | Physical demands of elite basketball: a systematic review | Taylor, J. B., Wright, A. A., Dischiavi, S. L., Townsend, M. A., & Marmon, A. R. | Journal of Sports Sciences (2017) | [28362127](https://pubmed.ncbi.nlm.nih.gov/28362127/) | PT: Atleta; Sp: Sport di Squadra, Basketball |
| 102 | `sci_team_ekstrand_2011` | Injury incidence and injury patterns in professional football: the UEFA injury study | Ekstrand, J., Hägglund, M., & Waldén, M. | British Journal of Sports Medicine (2011) | [21586354](https://pubmed.ncbi.nlm.nih.gov/21586354/) | PT: Atleta; Sp: Sport di Squadra, Calcio |
| 103 | `sci_groin_thorborg_2018` | Effect of the Copenhagen Adduction exercise on groin injury risk in male football players: a cluster-randomised controlled trial | Harøy, J., Clarsen, B., Wiger, E. G., Øyen, M. G., Serner, A., Thorborg, K., Hölmich, P., Andersen, T. E., & Bahr, R. | British Journal of Sports Medicine (2019) | [30413448](https://pubmed.ncbi.nlm.nih.gov/30413448/) | PT: Clinico, Atleta; Sp: Sport di Squadra, Calcio; Inj: groin_pain, adductor_tendinopathy, pubalgia |
| 104 | `sci_cod_donelon_2020` | Biomechanical determinants of knee joint loads during cutting manoeuvres in sporting populations: a systematic review | Donelon, T. A., Dos'Santos, T., Thomas, C., Comfort, P., & Jones, P. A. | Physical Therapy in Sport (2020) | [32417711](https://pubmed.ncbi.nlm.nih.gov/32417711/) | PT: Clinico, Atleta; Sp: Sport di Squadra, Calcio, Basketball; Inj: lesione_lca, knee_generic |
| 105 | `sci_hamstring_timmins_2016` | Short biceps femoris long head fascicle length and eccentric knee flexor weakness increase the risk of hamstring injury in elite football players | Timmins, R. G., Bourne, M. N., Shield, A. J., Williams, M. D., Lorenzen, C., & Opar, D. A. | British Journal of Sports Medicine (2016) | [26672828](https://pubmed.ncbi.nlm.nih.gov/26672828/) | PT: Clinico, Atleta; Sp: Sport di Squadra, Calcio; Inj: hamstring_strain, lesione_muscolare |
| 154 | `sci_team_longo_2012` | Prevention of injuries in football: a systematic review of interventions | Longo, U. G., Loppini, M., Berton, A., Marinozzi, A., Maffulli, N., & Denaro, V. | British Journal of Sports Medicine (2012) | [22442232](https://pubmed.ncbi.nlm.nih.gov/22442232/) | PT: Atleta; Sp: Sport di Squadra, Calcio; G: Rehab |
| 155 | `sci_team_mccall_2014` | Injury prevention strategies in professional football (soccer): the FIFA 11+ programme and other emerging approaches | McCall, A., Davison, M., Andersen, T. E., Beasley, I., Bizzini, M., & Dupont, G. | British Journal of Sports Medicine (2015) | [25452613](https://pubmed.ncbi.nlm.nih.gov/25452613/) | PT: Atleta; Sp: Sport di Squadra, Calcio; G: Rehab |
| 156 | `sci_team_bourdon_2017` | Monitoring athlete training loads: consensus statement | Bourdon, P. C., Cardinale, M., Murray, A., Gastin, P., Kellmann, M., Varley, M. C., & Cable, N. T. | International Journal of Sports Physiology and Performance (2017) | [28463642](https://pubmed.ncbi.nlm.nih.gov/28463642/) | PT: Atleta; Sp: Sport di Squadra; G: Resistenza, Power |
| 157 | `sci_team_malone_2017` | High chronic training loads and exposure to bouts of maximal velocity running reduce injury risk in elite Gaelic football | Malone, S., Roe, M., Doran, D. A., Gabbett, T. J., & Collins, K. | Journal of Science and Medicine in Sport (2017) | [27554923](https://pubmed.ncbi.nlm.nih.gov/27554923/) | PT: Atleta; Sp: Sport di Squadra; G: Power, Resistenza |
| 158 | `sci_team_akenhead_2016` | Diminutions of acceleration and deceleration output during professional football match play | Akenhead, R., Hayes, P. R., Thompson, K. G., & French, D. | Journal of Science and Medicine in Sport (2013) | [22884568](https://pubmed.ncbi.nlm.nih.gov/22884568/) | PT: Atleta; Sp: Sport di Squadra, Calcio; G: Power, Resistenza |
| 159 | `sci_team_dello_2016` | Match-related physical performance in professional basketball: a systematic review | Stojanovic, E., Stojiljkovic, N., Scanlan, A. T., Dalbo, V. J., Berkelmans, D. M., & Milanovic, Z. | Sports Medicine (2018) | [29282680](https://pubmed.ncbi.nlm.nih.gov/29282680/) | PT: Atleta; Sp: Sport di Squadra, Basketball; G: Power, Resistenza |
| 160 | `sci_team_tierney_2016` | An assessment of hamstring injury prevention programs in sport: a review of practices in professional rugby union | Tierney, G. J., Elliott-Sale, K. J., & Mayeux, S. | Sports Medicine (2020) | [31512147](https://pubmed.ncbi.nlm.nih.gov/31512147/) | PT: Atleta; Sp: Sport di Squadra; G: Rehab; Inj: hamstring_strain |
| 161 | `sci_team_harper_2019` | Relationships between eccentric hamstring strength and match-play sprinting in professional football | Harper, D. J., & Kiely, J. | Journal of Sports Sciences (2018) | [29281917](https://pubmed.ncbi.nlm.nih.gov/29281917/) | PT: Atleta; Sp: Sport di Squadra, Calcio; G: Power, Strength; Inj: hamstring_strain |

---

## 6. Master Deduplication Reference Index

Research agents must use this index to perform pre-insertion collision checks. Any new source whose title or PMID matches an entry in this section MUST be rejected as a duplicate.

### 6.1 Alphabetical Title & ID Index

| Title | ID | Area | Year | PMID |
| :--- | :--- | :--- | :---: | :---: |
| 2016 Consensus statement on return to sport from the first world congress in sports physical therapy | `sci_lca_ardern_2016` | Clinico | 2016 | 26888237 |
| A comparison of gluteus maximus, biceps femoris, and vastus lateralis EMG activity in the back squat and barbell hip thrust exercises | `sci_biomech_contreras_2011` | Biomeccanica | 2015 | 26214739 |
| A review of power output studies of Olympic and powerlifting: methodology, performance prediction, and evaluation tests | `sci_weightlifting_garhammer_1993` | Sollevamento Pesi | 1993 | 8437146 |
| A review of resistance training-induced changes in skeletal muscle protein synthesis and their contribution to hypertrophy | `sci_physiol_damas_2015` | Fisiologia | 2015 | 25702468 |
| A simple method for computing sprint acceleration kinetics from running velocity data | `sci_sprint_morin_2016` | Atletica Leggera | 2016 | 26997718 |
| A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults | `sci_physiol_morton_2018` | Fisiologia | 2018 | 28698222 |
| Achilles and patellar tendinopathy loading programmes : a systematic review comparing clinical outcomes and identifying potential mechanisms for effectiveness | `sci_tendon_malliaras_2013` | Clinico | 2013 | 23625465 |
| Agility literature review: classifications in movement and sport-specific decision-making components | `sci_cod_sheppard_2006` | Sport di Squadra | 2006 | 16935793 |
| An assessment of hamstring injury prevention programs in sport: a review of practices in professional rugby union | `sci_team_tierney_2016` | Sport di Squadra | 2020 | 31512147 |
| Anaerobic threshold and respiratory gas exchange during exercise | `sci_physiol_wasserman_1973` | Fisiologia | 1973 | 4761272 |
| Attentional focus and motor learning: a review of 15 years | `sci_biomech_wulf_2013` | Biomeccanica | 2013 | 23745671 |
| Autonomic recovery after exercise in trained athletes: intensity and duration effects | `sci_physiol_seiler_2006` | Fisiologia | 2006 | 16888457 |
| Biomechanical determinants of knee joint loads during cutting manoeuvres in sporting populations: a systematic review | `sci_cod_donelon_2020` | Sport di Squadra | 2020 | 32417711 |
| Biomechanical measures of neuromuscular control and valgus loading of the knee predict anterior cruciate ligament injury risk in female athletes | `sci_lca_hewett_2005` | Clinico | 2005 | 15722363 |
| Biomechanics and Motor Control of Human Movement | `sci_biomech_winter_1990` | Biomeccanica | 1990 | 2275521 |
| Biomechanics of cycling: loads on the spine, knee, and ankle | `sci_biomech_gregersen_2006` | Biomeccanica | 2006 | 16706012 |
| Change of direction deficit: a more isolated measure of change of direction performance | `sci_cod_nimphius_2016` | Sport di Squadra | 2016 | 26982400 |
| Comparison of different strongman events: trunk muscle activation and lumbar spine motion, load, and stiffness | `sci_biomech_mcgill_2009` | Biomeccanica | 2009 | 19077735 |
| Comparison of velocity-based and traditional percentage-based loading methods on maximal strength and power adaptations | `sci_vbt_dorrell_2020` | VBT | 2020 | 31009432 |
| Comparisons of peak ground reaction force and rate of force development during variations of the power clean | `sci_weightlifting_comfort_2012` | Sollevamento Pesi | 2012 | 21993027 |
| Comprehensive warm-up programme to prevent injuries in female football players: cluster randomised controlled trial | `sci_fifa_soligard_2008` | Sport di Squadra | 2008 | 19066253 |
| Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises | `sci_physiol_wilson_2012` | Fisiologia | 2012 | 22002517 |
| Current concepts: scapular dyskinesis | `sci_shoulder_kibler_2010` | Clinico | 2010 | 20371559 |
| Designing Resistance Training Programs (4th Edition) | `sci_physiol_fleck_2004` | Fisiologia | 2014 | 15064696 |
| Detraining: loss of training-induced physiological and performance adaptations. Part I: short-term insufficient training stimulus | `sci_detraining_mujika_2000` | Fisiologia | 2000 | 10999422 |
| Developing maximal neuromuscular power: Part 1 - Biological basis of maximal power production | `sci_power_cormie_2011` | Sollevamento Pesi | 2011 | 21198303 |
| Developing maximal neuromuscular power: Part 1 - Biological basis of maximal power production | `sci_biomech_cormie_2011` | Biomeccanica | 2011 | 21198305 |
| Differential effects of strength training leading to failure versus not to failure on hormonal responses, strength, and muscle power | `sci_physiol_izquierdo_2006` | Fisiologia | 2006 | 16672361 |
| Diminutions of acceleration and deceleration output during professional football match play | `sci_team_akenhead_2016` | Sport di Squadra | 2013 | 22884568 |
| Does plyometric training improve vertical jump height? A meta-analytical review | `sci_jump_markovic_2007` | Atletica Leggera | 2007 | 17347316 |
| Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis | `sci_physiol_schoenfeld_2016` | Fisiologia | 2016 | 27433960 |
| Effect of acute static stretching on force, balance, reaction time, and movement time | `sci_physiol_behm_2010` | Fisiologia | 2004 | 15292746 |
| Effect of Olympic weightlifting-based training on reactive strength and sprint performance in adolescent athletes | `sci_weightlifting_james_2018` | Sollevamento Pesi | 2018 | 29503625 |
| Effect of squat depth on muscle activation | `sci_biomech_bryanton_2012` | Biomeccanica | 2012 | 22344055 |
| Effect of the Copenhagen Adduction exercise on groin injury risk in male football players: a cluster-randomised controlled trial | `sci_groin_thorborg_2018` | Sport di Squadra | 2019 | 30413448 |
| Effectiveness of an individualized training based on force-velocity profiling during jumping | `sci_sprint_jimenez_2018` | Atletica Leggera | 2017 | 28326043 |
| Effects of a resisted sprint training program on sprint kinematics in competitive youth athletes | `sci_sprint_alcaraz_2018` | Atletica Leggera | 2018 | 28957942 |
| Effects of different velocity loss thresholds on passive recovery time | `sci_vbt_perez_2020` | VBT | 2020 | 30946269 |
| Effects of drop jump training on physical fitness of youth soccer players | `sci_jump_ramirez_2014` | Atletica Leggera | 2014 | 24077376 |
| Effects of low- versus high-load resistance training on muscle strength and hypertrophy in well-trained men | `sci_physiol_schoenfeld_2015` | Fisiologia | 2015 | 25853914 |
| Effects of moderate-intensity endurance and high-intensity intermittent training on anaerobic capacity and VO2max | `sci_physiol_tabata_1996` | Fisiologia | 1996 | 8897392 |
| Effects of resistance and stretching training programmes on the viscoelastic properties of human tendon structures in vivo | `sci_biomech_kubo_2001` | Biomeccanica | 2002 | 11796676 |
| Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis | `sci_physiol_schoenfeld_freq_2016` | Fisiologia | 2016 | 27102424 |
| Effects of Strength Training on the Physiological Determinants of Middle- and Long-Distance Running Performance: A Systematic Review | `sci_endurance_blagrove_2018` | Atletica Leggera | 2018 | 29249083 |
| Effects of velocity loss during resistance training on athletic performance, strength, and muscle hypertrophy | `sci_vbt_pareja_2017` | VBT | 2017 | 27845943 |
| Endurance exercise performance: the physiology of champions | `sci_physiol_joyner_2008` | Fisiologia | 2008 | 17991697 |
| Enzyme activity and fiber composition in skeletal muscle of untrained and trained men | `sci_physiol_gollnick_1972` | Fisiologia | 1972 | 5075868 |
| Factors influencing repeated-sprint ability in football players | `sci_rsa_rampinini_2007` | Sport di Squadra | 2007 | 17497576 |
| Faster top speeds of human sprinters are achieved with greater ground forces, not rapid leg movements | `sci_sprint_weyand_2000` | Atletica Leggera | 2000 | 11056116 |
| Filtering the surface EMG signal: Movement artifact and baseline noise removal | `sci_biomech_deluca_2006` | Biomeccanica | 2006 | 16679036 |
| Force-time curve characteristics of dynamic and isometric muscle actions of elite women Olympic weightlifters | `sci_weightlifting_haff_2001` | Sollevamento Pesi | 2001 | 11708871 |
| Functional anatomy, pathomechanics, and pathophysiology of lateral ankle instability | `sci_ankle_hertel_2002` | Clinico | 2002 | 12937557 |
| Fundamentals of resistance training: progression and exercise prescription | `sci_resistance_kraemer_2004` | Sollevamento Pesi | 2004 | 15064696 |
| General force-velocity trajectories describe maximal running accelerations in humans | `sci_sprint_clark_2014` | Atletica Leggera | 2014 | 24737762 |
| Ground reaction forces in distance running | `sci_biomech_cavanagh_1980` | Biomeccanica | 1980 | 7400379 |
| Hamstring muscle strain recurrence and time loss in professional football | `sci_hamstring_ekstrand_2012` | Clinico | 2012 | 22219258 |
| Hamstring strain injuries: factors that lead to injury and re-injury | `sci_muscle_opar_2012` | Clinico | 2012 | 22356851 |
| High chronic training loads and exposure to bouts of maximal velocity running reduce injury risk in elite Gaelic football | `sci_team_malone_2017` | Sport di Squadra | 2017 | 27554923 |
| High-intensity interval training, solutions to the programming puzzle: Part I: cardiopulmonary / neuromuscular responses | `sci_physiol_buchheit_2013` | Fisiologia | 2013 | 23539308 |
| High-intensity interval training, solutions to the programming puzzle: Part I: cardiopulmonary engines | `sci_rsa_buchheit_2013` | Sport di Squadra | 2013 | 23539301 |
| High-intensity interval training, solutions to the programming puzzle: Part II: anaerobic energy, neuromuscular load and practical applications | `sci_sprint_buchheit_2013` | Atletica Leggera | 2013 | 23832851 |
| History-dependent properties of skeletal muscle: rheological properties and residual force enhancement | `sci_biomech_herzog_2004` | Biomeccanica | 2004 | 15094144 |
| Hormonal responses and adaptations to resistance exercise and training | `sci_physiol_kraemer_2002` | Fisiologia | 2005 | 15831061 |
| How do training and competition workloads relate to injury? The workload-injury etiology model | `sci_workload_windt_2017` | Sport di Squadra | 2017 | 27405944 |
| How effective are F-MARC injury prevention programmes for teamsports? A systematic review and meta-analysis | `sci_fifa_alattar_2017` | Sport di Squadra | 2017 | 28122797 |
| Human tendon adaptation to mechanical loading: a systematic review and meta-analysis of physiological determinants in vivo | `sci_tendon_bohm_2015` | Clinico | 2015 | 27747846 |
| Impact of exercise selection on hamstring muscle activation and architectural adaptations: a systematic review | `sci_hamstring_bourne_2018` | Clinico | 2018 | 29450822 |
| Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries: a systematic review and meta-analysis of 8459 athletes | `sci_hamstring_vandyk_2019` | Clinico | 2019 | 30819786 |
| Inefficient muscular stabilization of the lumbar spine associated with low back pain: a motor control evaluation of transversus abdominis | `sci_spine_hodges_1996` | Clinico | 1996 | 8923631 |
| Influence of the muscle-tendon unit mechanical properties on mechanical efficiency in bouncing gait | `sci_biomech_arampatzis_2006` | Biomeccanica | 2006 | 16731809 |
| Injury incidence and injury patterns in professional football: the UEFA injury study | `sci_team_ekstrand_2011` | Sport di Squadra | 2011 | 21586354 |
| Injury prevention strategies in professional football (soccer): the FIFA 11+ programme and other emerging approaches | `sci_team_mccall_2014` | Sport di Squadra | 2015 | 25452613 |
| Integrative biology of exercise | `sci_physiol_hawley_2014` | Fisiologia | 2014 | 25417157 |
| Interaction between fascicle and tendinous tissue in short-contact stretch-shortening cycle exercise | `sci_biomech_ishikawa_2005` | Biomeccanica | 2005 | 15890807 |
| Is tendon pathology a continuum? A clinical model to explain the clinical presentation of load-induced tendinopathy | `sci_tendon_cook_2009` | Clinico | 2009 | 19776044 |
| Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy | `sci_tendon_rio_2015` | Clinico | 2015 | 25979840 |
| Kinematics, kinetics, and muscle activation during explosive upper body movements | `sci_ballistic_newton_1996` | Sollevamento Pesi | 1996 | 9414013 |
| Kinetics of Human Motion | `sci_biomech_zatsiorsky_2002` | Biomeccanica | 2002 | 11932598 |
| Knee biomechanics during the squat exercise | `sci_biomech_escamilla_2000` | Biomeccanica | 2000 | 10776897 |
| Low back stability: from formal description to issues for performance and rehabilitation | `sci_spine_mcgill_2001` | Clinico | 2001 | 11265986 |
| Low back stability: mechanics, injury mechanisms, and rehabilitation | `sci_biomech_mcgill_2001` | Biomeccanica | 2001 | 11738952 |
| Match-related physical performance in professional basketball: a systematic review | `sci_team_dello_2016` | Sport di Squadra | 2018 | 29282680 |
| Maximum strength and strength training: a relationship to endurance? | `sci_weightlifting_stone_2005` | Sollevamento Pesi | 2005 | 16287367 |
| Maximum strength and weightlifting performance: Relationship to vertical jump and sprint speed | `sci_weightlifting_stone_2006` | Sollevamento Pesi | 2006 | 16553066 |
| Mechanical demand of the hang power clean and jump shrug in collegiate athletes | `sci_weightlifting_kipp_2012` | Sollevamento Pesi | 2018 | 29698322 |
| Mechanical determinants of faster change of direction and agility performance in female basketball players | `sci_cod_spiteri_2014` | Sport di Squadra | 2014 | 24149526 |
| Mechanical stability of the in vivo lumbar spine: implications for injury and chronic low back pain | `sci_spine_cholewicki_1996` | Clinico | 1996 | 8827400 |
| Molecular mechanisms of muscle plasticity with exercise | `sci_physiol_hoppeler_2011` | Fisiologia | 2011 | 23728984 |
| Monitoring athlete training loads: consensus statement | `sci_team_bourdon_2017` | Sport di Squadra | 2017 | 28463642 |
| Monitoring training load and fatigue in resistance training | `sci_monitoring_mcguigan_2012` | Fisiologia | 2012 | 23136270 |
| Movement velocity as a measure of exercise intensity in three lower limb exercises | `sci_vbt_conceicao_2016` | VBT | 2016 | 26732397 |
| Movement velocity as a measure of loading intensity in resistance training | `sci_vbt_badillo_2010` | VBT | 2010 | 20146162 |
| Multifidus muscle recovery is not automatic after resolution of acute, first-episode low back pain | `sci_spine_hides_1996` | Clinico | 1996 | 8961451 |
| Muscle activation patterns and knee mechanics during isometric and dynamic squats | `sci_biomech_flanagan_2012` | Biomeccanica | 2007 | 17685679 |
| Muscle fiber type composition and squatted jump performance in shot putters | `sci_throws_terzis_2008` | Atletica Leggera | 2008 | 18515989 |
| Muscle hypertrophy, hormonal adaptation and strength development during strength training in strength-trained and untrained men | `sci_physiol_ahtiainen_2003` | Fisiologia | 2003 | 12629688 |
| Muscle memory and a new cellular model for sarcopenia and atrophy | `sci_physiol_gundersen_2016` | Fisiologia | 2016 | 26792335 |
| Muscle metabolism during intense resistance exercise | `sci_physiol_tesch_1986` | Fisiologia | 1986 | 3770020 |
| Muscle strength and its development: new perspectives | `sci_biomech_enoka_1988` | Biomeccanica | 1988 | 3057316 |
| Neural factors versus hypertrophy in time course of muscle strength gain | `sci_biomech_moritani_1979` | Biomeccanica | 1979 | 443443 |
| Neuromuscular fatigue in ultra-endurance exercise | `sci_physiol_millet_2011` | Fisiologia | 2011 | 22082073 |
| Optimal Force-Velocity Profile in Ballistic Movements: Altius, Citius, Fortius | `sci_biomech_samozino_2016` | Biomeccanica | 2016 | 26741119 |
| Optimising the early-stage rehabilitation process after anterior cruciate ligament reconstruction | `sci_lca_buckthorpe_2019` | Clinico | 2019 | 31168817 |
| Optimizing strength training for running and cycling performance: A review | `sci_endurance_ronnestad_2014` | Fisiologia | 2014 | 23914664 |
| Overtraining in athletes: an update | `sci_physiol_fry_1997` | Fisiologia | 1997 | 9068094 |
| Physical demands of elite basketball: a systematic review | `sci_team_taylor_2017` | Sport di Squadra | 2017 | 28362127 |
| Physiological and performance effects of generic versus specific high-intensity interval training in football players | `sci_team_impellizzeri_2006` | Sport di Squadra | 2006 | 16802251 |
| Physiological response to intermittent exercise | `sci_physiol_bangsbo_1994` | Fisiologia | 1994 | 7851956 |
| Plyometric training for youth athletes: a narrative review | `sci_jump_markstrom_2019` | Atletica Leggera | 2018 | 30100827 |
| Postactivation potentiation response in athletic and recreationally trained individuals | `sci_pap_chiu_2003` | Sollevamento Pesi | 2003 | 14636098 |
| Predictive accuracy of the load-velocity relationship for bench press | `sci_vbt_gonzalez_2017` | VBT | 2010 | 20024937 |
| Preliminary development of a clinical prediction rule for determining which patients with low back pain will respond to a stabilization exercise program | `sci_spine_hicks_2005` | Clinico | 2005 | 16084801 |
| Preventing hamstring strains in football players: a randomized controlled trial | `sci_hamstring_petersen_2011` | Clinico | 2011 | 21803979 |
| Prevention of injuries in football: a systematic review of interventions | `sci_team_longo_2012` | Sport di Squadra | 2012 | 22442232 |
| Rehabilitation of scapular dyskinesis: from the office to the field | `sci_shoulder_cools_2007` | Clinico | 2007 | 17923728 |
| Relationships between eccentric hamstring strength and match-play sprinting in professional football | `sci_team_harper_2019` | Sport di Squadra | 2018 | 29281917 |
| Repeated-sprint ability - part 1: factors contributing to fatigue | `sci_rsa_girard_2011` | Sport di Squadra | 2011 | 21688903 |
| Resisted sled sprint training to improve sprint performance: a systematic review | `sci_sprint_petrakos_2016` | Atletica Leggera | 2016 | 26694507 |
| Short biceps femoris long head fascicle length and eccentric knee flexor weakness increase the risk of hamstring injury in elite football players | `sci_hamstring_timmins_2016` | Sport di Squadra | 2016 | 26672828 |
| Short-term sprint interval training increases human skeletal muscle oxidative capacity and endurance performance | `sci_physiol_gibala_2006` | Fisiologia | 2006 | 16973704 |
| Shoulder muscle recruitment patterns and related biomechanics during upper extremity sports | `sci_shoulder_escamilla_2009` | Clinico | 2009 | 19453205 |
| Simple decision rules reduce reinjury risk after anterior cruciate ligament reconstruction: the Delaware-Oslo ACL cohort study | `sci_lca_grindem_2016` | Clinico | 2016 | 27162233 |
| Skeletal muscle design to meet functional demands | `sci_biomech_lieber_2004` | Biomeccanica | 2004 | 15519971 |
| Sprint mechanics in world-class athletes: a new insight into the limits of human locomotion | `sci_sprint_rabita_2015` | Atletica Leggera | 2015 | 25640466 |
| Sprint running performance monitoring: methodological and practical considerations | `sci_sprint_haugen_2019` | Atletica Leggera | 2020 | 31782009 |
| Sprint running performance: a compilation of data with analysis of sprint training practices | `sci_sprint_haugen_2014` | Atletica Leggera | 2014 | 24509711 |
| Squatting kinematics and kinetics and their application to exercise performance | `sci_biomech_schoenfeld_2010` | Biomeccanica | 2010 | 20182386 |
| Strength and power predictors of sports speed: deterministic modeling | `sci_biomech_cronin_2005` | Biomeccanica | 2005 | 15799745 |
| Stretch-shortening cycle: a powerful model to study normal and fatigued muscle | `sci_jump_komi_2000` | Atletica Leggera | 2000 | 10978496 |
| Stretch-shortening cycle: a powerful model to study normal and fatigued muscle structure and function | `sci_biomech_komi_2000` | Biomeccanica | 2000 | 10917766 |
| Targeted neuromuscular training improves performance and neuromuscular biomechanics in female athletes | `sci_lca_myer_2006` | Clinico | 2006 | 16503678 |
| Technical ability of elite sprinters: ground force application orientation | `sci_sprint_morin_2011` | Atletica Leggera | 2011 | 21317862 |
| The adaptations to strength training: morphological and neurological contributions to increased strength | `sci_physiol_folland_2007` | Fisiologia | 2007 | 17241104 |
| The effects of cold water immersion on recovery from exercise-induced muscle damage | `sci_rehab_blanchard_2000` | Clinico | 2010 | 19945969 |
| The effects of resisted sled towing on sprint kinematics in field-sport athletes | `sci_sprint_lockie_2003` | Atletica Leggera | 2003 | 14636093 |
| The Force-Velocity Relationship in Resistance Exercises: Technical Aspects and Methodology | `sci_vbt_garcia_2018` | VBT | 2018 | 29092658 |
| The Importance of Muscular Strength in Athletic Performance | `sci_strength_suchomel_2016` | Sollevamento Pesi | 2016 | 26791930 |
| The importance of muscular strength: training considerations | `sci_weightlifting_suchomel_2015` | Sollevamento Pesi | 2016 | 26838985 |
| The influence of abnormal hip mechanics on knee injury: a biomechanical perspective | `sci_knee_powers_2010` | Clinico | 2010 | 20710093 |
| The lactate shuttle: carbohydrate metabolism during exercise | `sci_physiol_brooks_1986` | Fisiologia | 1986 | 3523107 |
| The load-velocity relationship in the back squat: individualized vs. generalized load-velocity profiles | `sci_vbt_jovanovic_2014` | VBT | 2014 | 24809472 |
| The physiology of the world record holder for the women's marathon: a case study | `sci_endurance_jones_2006` | Fisiologia | 2006 | 16931758 |
| The reliability of individualized load-velocity profiles in the free-weight back squat | `sci_vbt_banyard_2017` | VBT | 2017 | 27633948 |
| The role of impact forces and foot pronation: a new paradigm | `sci_biomech_nigg_2001` | Biomeccanica | 2001 | 11176141 |
| The role of internal and external forces on the biomechanics of the squat exercise | `sci_biomech_vigotsky_2018` | Biomeccanica | 2019 | 30746294 |
| The shoulder in baseball: rehabilitation principles | `sci_shoulder_wilk_2009` | Clinico | 2009 | 19182317 |
| The training-injury prevention paradox: should athletes be training smarter and harder? | `sci_workload_gabbett_2016` | Sport di Squadra | 2016 | 26758673 |
| Training at maximal power output in sprint acceleration: Horizontal force-velocity-power profiling | `sci_sprint_cross_2017` | Atletica Leggera | 2017 | 28488884 |
| Training load and monitoring an athlete's tolerance for endurance, strength, and power activities | `sci_weightlifting_haff_2015` | Sollevamento Pesi | 2015 | 26199192 |
| Training to enhance maximal oxygen uptake: how to maximize time at or near VO2max | `sci_endurance_midgley_2007` | Fisiologia | 2007 | 17196020 |
| Two emerging concepts in physical training: Neuromuscular fatigue and postactivation potentiation from fatigue to potentiation | `sci_physiol_crewther_2006` | Fisiologia | 2006 | 17052063 |
| Understanding the key phases of the countermovement jump force-time curve | `sci_jump_mcmahon_2017` | Atletica Leggera | 2018 | 29503474 |
| Unique aspects of competitive weightlifting performance: structural, neuromuscular and metabolic adaptations | `sci_weightlifting_storey_2012` | Sollevamento Pesi | 2012 | 22897427 |
| Velocity loss as an indicator of neuromuscular fatigue during resistance training | `sci_vbt_sanchez_2011` | VBT | 2011 | 20689453 |
| Velocity-based training in football | `sci_vbt_mann_2015` | VBT | 2015 | 26197614 |
| Velocity-based training: a systematic review and meta-analysis | `sci_vbt_thompson_2023` | VBT | 2023 | 36399261 |
| Velocity-Based Training: From Theory to Application | `sci_vbt_weakley_2021` | VBT | 2021 | 33433845 |
| Weightlifting Derivatives: Barbell Position and Catch Phase Modifications | `sci_weightlifting_suchomel_2017` | Sollevamento Pesi | 2017 | 28247103 |
| Weightlifting programming: a winning coach's guide | `sci_weightlifting_takano_2012` | Sollevamento Pesi | 2012 | - |
| Why is countermovement jump height greater than squat jump height? | `sci_jump_bobbert_1996` | Atletica Leggera | 1996 | 8887768 |
| Why screening tests to predict injury do not work-and probably never will...: a story of 3500 medical examinations | `sci_fifa_bahr_2015` | Sport di Squadra | 2015 | 26002938 |

### 6.2 Master PMID Index (160 PubMed IDs)

The following is a fast-lookup comma-separated list of all 160 active PubMed IDs:

```text
443443, 2275521, 3057316, 3523107, 3770020, 4761272, 5075868, 7400379, 7851956, 8437146, 8827400, 8887768, 8897392, 8923631, 8961451, 9068094, 9414013, 10776897, 10917766, 10978496, 10999422, 11056116, 11176141, 11265986, 11708871, 11738952, 11796676, 11932598, 12629688, 12937557, 14636093, 14636098, 15064696, 15094144, 15292746, 15519971, 15722363, 15799745, 15831061, 15890807, 16084801, 16287367, 16503678, 16553066, 16672361, 16679036, 16706012, 16731809, 16802251, 16888457, 16931758, 16935793, 16973704, 17052063, 17196020, 17241104, 17347316, 17497576, 17685679, 17923728, 17991697, 18515989, 19066253, 19077735, 19182317, 19453205, 19776044, 19945969, 20024937, 20146162, 20182386, 20371559, 20689453, 20710093, 21198303, 21198305, 21317862, 21586354, 21688903, 21803979, 21993027, 22002517, 22082073, 22219258, 22344055, 22356851, 22442232, 22884568, 22897427, 23136270, 23539301, 23539308, 23625465, 23728984, 23745671, 23832851, 23914664, 24077376, 24149526, 24509711, 24737762, 24809472, 25417157, 25452613, 25640466, 25702468, 25853914, 25979840, 26002938, 26197614, 26199192, 26214739, 26672828, 26694507, 26732397, 26741119, 26758673, 26791930, 26792335, 26838985, 26888237, 26982400, 26997718, 27102424, 27162233, 27405944, 27433960, 27554923, 27633948, 27747846, 27845943, 28122797, 28247103, 28326043, 28362127, 28463642, 28488884, 28698222, 28957942, 29092658, 29249083, 29281917, 29282680, 29450822, 29503474, 29503625, 29698322, 30100827, 30413448, 30746294, 30819786, 30946269, 31009432, 31168817, 31512147, 31782009, 32417711, 33433845, 36399261
```

## 7. Architectural Recommendations for Modularization & Ingestion

### 7.1 Target Modular File Structure (`js/data/sources/`)
In accordance with the Single Responsibility Principle and project modularity rules, the monolithic `js/knowledge-base.js` should be divided into 7 area files and 1 aggregator:

```
js/data/sources/
├── atletica-leggera.js     // window.App.Sources.atleticaLeggera = [...] (21 + 14 = ~35 items)
├── sollevamento-pesi.js    // window.App.Sources.sollevamentoPesi = [...] (17 + 13 = ~30 items)
├── fisiologia.js           // window.App.Sources.fisiologia = [...] (33 + 12 = ~45 items)
├── vbt.js                  // window.App.Sources.vbt = [...] (13 + 17 = ~30 items)
├── biomeccanica.js         // window.App.Sources.biomeccanica = [...] (26 + 14 = ~40 items)
├── clinico.js              // window.App.Sources.clinico = [...] (26 + 14 = ~40 items)
├── sport-di-squadra.js     // window.App.Sources.sportDiSquadra = [...] (25 + 15 = ~40 items)
└── index.js                // Aggregator: concatenates all 7 arrays -> window.App.scientificSources
```

### 7.2 Backward Compatibility & Test Runner Preservation
1. **Compatibility Alias**: `index.js` must set:
   ```javascript
   window.App.scientificSources = [ ... ];
   window.ScientificKnowledgeBase = window.App.scientificSources;
   ```
2. **Node Test Harness (`loadModule` / `eval`)**: Existing tests (`tests/test_adversarial_scientific_hub.js`, `tests/test_adversarial_challenger.js`, `tests/test_new_profiles.js`) explicitly load `js/knowledge-base.js`.
   Therefore, `js/knowledge-base.js` can either be retained as a lightweight loader/orchestrator (similar to `js/logic.js` and `js/parser.js`) or updated in sync with tests.

### 7.3 ID Naming Standard for Ingesting Agents
All research subagents generating new entries must strictly adhere to the formula:
`sci_<topic_prefix>_<firstAuthorSurname>_<year>`
- Examples:
  - Atletica Leggera: `sci_sprint_kugler_2023`, `sci_jump_van_hooren_2022`
  - Sollevamento Pesi: `sci_olympic_suchomel_2021`, `sci_power_soriano_2020`
  - Fisiologia: `sci_physiol_peake_2022`, `sci_bfr_patterson_2019`
  - VBT: `sci_vbt_weakley_2021`, `sci_vbt_dorrell_2020`
  - Biomeccanica: `sci_biomech_vigotsky_2022`, `sci_biomech_schoenfeld_2021`
  - Clinico: `sci_rehab_blanch_2020`, `sci_tendon_malliaras_2022`
  - Sport di Squadra: `sci_team_buchheit_2021`, `sci_cod_dos_santos_2022`
