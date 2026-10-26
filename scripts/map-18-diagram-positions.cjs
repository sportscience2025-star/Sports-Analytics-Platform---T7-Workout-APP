const fs = require('fs');

// We have 18 diagrams on the Miro board organized in 3 rows (Tiers) x 6 columns:
// Row 1: TIER 1 (y ≈ 350 - 555)
// Row 2: TIER 2 (y ≈ 3039 - 3198)
// Row 3: TIER 3 (y ≈ 6355 - 6687)

// Let's identify the 18 headers and their exact bounding coordinates on Miro:
const diagrams = [
  // --- TIER 1 (General User / Casual Consumer B2C) ---
  {
    num: 1,
    code: 'FLOW-1A',
    file: '01-software-1-flow-1a-consumer-onboarding.md',
    title: '1. FLUSSO ACCESSO, ONBOARDING E ANAMNESI UTENTE CASUAL (T7 CONSUMER B2C)',
    tier: 'Tier 1',
    headerX: -2570,
    headerY: 350,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 2,
    code: 'FLOW-2A',
    file: '02-software-1-flow-2a-personal-cockpit.md',
    title: '2. FLUSSO CATALOGO ESERCIZI & AVATAR BIOMECCANICO 3D (TIER 1 CASUAL)',
    tier: 'Tier 1',
    headerX: -256,
    headerY: 420,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 3,
    code: 'FLOW-3A',
    file: '03-software-1-flow-3a-workout-player.md',
    title: '3. ARCHITETTURA DI SISTEMA E DATA REPOSITORY SCIENTIFICO',
    tier: 'Tier 1',
    headerX: 2459,
    headerY: 555,
    headerW: 1150,
    headerH: 70
  },
  {
    num: 4,
    code: 'FLOW-4A',
    file: '04-software-1-flow-4a-wearable-sync.md',
    title: '4. WORKFLOW FUNZIONALI ALGORITMICI (VBT, PAP, WORKOUT BUILDER)',
    tier: 'Tier 1',
    headerX: 4171,
    headerY: 555,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 5,
    code: 'FLOW-5A',
    file: '05-software-1-flow-5a-together-social-b2c.md',
    title: 'Together app - funzione di social network per B2B e B2C',
    tier: 'Tier 1',
    headerX: 6048,
    headerY: 555,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 6,
    code: 'FLOW-6A',
    file: '06-software-1-flow-6a-movely-desk-care.md',
    title: 'Movely - iniziativa per i corsi agli impiegati aziendali (Desk-Worker Care)',
    tier: 'Tier 1',
    headerX: 7937,
    headerY: 555,
    headerW: 1350,
    headerH: 70
  },

  // --- TIER 2 (Partita IVA / Coach & Fisioterapisti) ---
  {
    num: 7,
    code: 'FLOW-1B',
    file: '07-software-2-flow-1b-pro-onboarding.md',
    title: '1. ONBOARDING PROFESSIONALE & SETUP FISCALE P.IVA (T7 PRO)',
    tier: 'Tier 2',
    headerX: -2448,
    headerY: 3198,
    headerW: 1250,
    headerH: 80
  },
  {
    num: 8,
    code: 'FLOW-2B',
    file: '08-software-2-flow-2b-coach-hub.md',
    title: '2. FLUSSO CATALOGO 3D & PRESCRIZIONE CLINICA ATLETI (TIER 2 P.IVA)',
    tier: 'Tier 2',
    headerX: -181,
    headerY: 3066,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 9,
    code: 'FLOW-3B',
    file: '09-software-2-flow-3b-macrocycle-ai-triage119.md',
    title: '3. ARCHITETTURA DI SISTEMA B2B & DATA REPOSITORY PRO',
    tier: 'Tier 2',
    headerX: 2459,
    headerY: 3039,
    headerW: 1150,
    headerH: 70
  },
  {
    num: 10,
    code: 'FLOW-4B',
    file: '10-software-2-flow-4b-vbt-pap-biomechanics.md',
    title: '4. WORKFLOW FUNZIONALI SPECIALISTICI (TRIAGE 119, VBT OLS, PAP)',
    tier: 'Tier 2',
    headerX: 4171,
    headerY: 3039,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 11,
    code: 'FLOW-5B',
    file: '11-software-2-flow-5b-together-pro-business.md',
    title: 'Together Pro - Vetrina Professionale, Lead Generation & Video Review',
    tier: 'Tier 2',
    headerX: 6048,
    headerY: 3039,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 12,
    code: 'FLOW-6B',
    file: '12-software-2-flow-6b-physio-rehab-rom.md',
    title: 'Physio Rehab - Protocolli Riabilitativi, Misurazione ROM & Scala VAS',
    tier: 'Tier 2',
    headerX: 7937,
    headerY: 3039,
    headerW: 1350,
    headerH: 70
  },

  // --- TIER 3 (High-Level Pro Teams & Enterprise) ---
  {
    num: 13,
    code: 'FLOW-1C',
    file: '13-software-3-flow-1c-bunker-onboarding-kms.md',
    title: '1. ONBOARDING ENTERPRISE & ACCESSO BLINDATO BUNKER CLUB (PRO TEAMS & FEDERAZIONI)',
    tier: 'Tier 3',
    headerX: -2925,
    headerY: 6687,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 14,
    code: 'FLOW-2C',
    file: '14-software-3-flow-2c-multi-staff-cockpit.md',
    title: '2. FLUSSO CATALOGO 3D & PRESCRIZIONE CLINICA ATLETI (TIER 3 PRO TEAM)',
    tier: 'Tier 3',
    headerX: -108,
    headerY: 6355,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 15,
    code: 'FLOW-3C',
    file: '15-software-3-flow-3c-team-microcycle-mdx.md',
    title: '3. ARCHITETTURA BUNKER ISOLATA (KMS SILO 2) & RESEARCH LAKE (SILO 3)',
    tier: 'Tier 3',
    headerX: 2875,
    headerY: 6685,
    headerW: 1150,
    headerH: 70
  },
  {
    num: 16,
    code: 'FLOW-4C',
    file: '16-software-3-flow-4c-gps-adaptive-zscore.md',
    title: '4. WORKFLOW TATTICI & TELEMETRICI SQUADRA (MD-X, GPS, VIDEO CV)',
    tier: 'Tier 3',
    headerX: 4587,
    headerY: 6685,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 17,
    code: 'FLOW-5C',
    file: '17-software-3-flow-5c-tactical-video-cv.md',
    title: 'Tactical Vision - Computer Vision Campo, Densità & Voronoi (Zero Social)',
    tier: 'Tier 3',
    headerX: 6464,
    headerY: 6685,
    headerW: 1350,
    headerH: 70
  },
  {
    num: 18,
    code: 'FLOW-6C',
    file: '18-software-3-flow-6c-medical-room-research-silo3.md',
    title: 'Medical Room - Cartella Clinica EMR, Return to Play & Research Silo 3',
    tier: 'Tier 3',
    headerX: 8353,
    headerY: 6685,
    headerW: 1350,
    headerH: 70
  }
];

console.log(JSON.stringify(diagrams, null, 2));
