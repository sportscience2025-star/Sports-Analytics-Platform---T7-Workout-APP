/**
 * src/physics/pap-benchmark-data.ts
 * Ingestion e Parsing Dati del Protocollo PAP e Misure di Salto Verticale (Optojump / Microgate).
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

export interface JumpRecord {
  athleteName?: string;
  jumpType: string;
  condition: 'pre' | 'post' | string;
  heightCm: number;
  contactTimeMs?: number;
  flightTimeMs?: number;
  rsi?: number;
  powerW?: number;
  trialIndex?: number;
}

export interface PAPDatasetParseResult {
  isPAP: boolean;
  athleteName: string;
  preJumps: JumpRecord[];
  postJumps: JumpRecord[];
  allJumps: JumpRecord[];
  warnings: string[];
}

/**
 * Verifica euristica se un insieme di intestazioni o record appartiene a un protocollo PAP.
 *
 * @param headers - Array di intestazioni delle colonne del file
 * @returns true se il dataset è compatibile con una sperimentazione PAP
 */
export function isPAPDataset(headers: string[]): boolean {
  const hStr = (headers || []).join(' ').toLowerCase();
  if (
    hStr.includes('pap') ||
    hStr.includes('post activation potentiation') ||
    hStr.includes('post-activation') ||
    hStr.includes('potentiation')
  ) {
    return true;
  }

  if (
    hStr.includes('pre') &&
    hStr.includes('post') &&
    (hStr.includes('rsi') || hStr.includes('cmj') || hStr.includes('sj') || hStr.includes('stiffness'))
  ) {
    return true;
  }

  return false;
}

/**
 * Parsing di righe CSV multi-sezione o tabulari di misure di salto.
 *
 * @param csvContent - Testo CSV
 * @returns Struttura tipizzata PAPDatasetParseResult
 */
export function parseJumpCSV(csvContent: string): PAPDatasetParseResult {
  const lines = (csvContent || '').split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const preJumps: JumpRecord[] = [];
  const postJumps: JumpRecord[] = [];
  const allJumps: JumpRecord[] = [];
  const warnings: string[] = [];
  let athleteName = 'Atleta';

  if (lines.length < 2) {
    return { isPAP: false, athleteName, preJumps, postJumps, allJumps, warnings: ['File vuoto o privo di righe'] };
  }

  const headerLine = lines[0];
  const headers = headerLine.split(/[,;\t]/).map((h) => h.trim().toLowerCase());
  const isPAP = isPAPDataset(headers);

  // Mappatura colonne
  const colIdx = {
    athlete: headers.findIndex((h) => h.includes('atleta') || h.includes('name') || h.includes('athlete')),
    jumpType: headers.findIndex((h) => h.includes('tipo') || h.includes('test') || h.includes('jump')),
    condition: headers.findIndex((h) => h.includes('condiz') || h.includes('timing') || h.includes('stato') || h.includes('fase')),
    height: headers.findIndex((h) => h.includes('height') || h.includes('altezza') || h.includes('h(cm)') || h.includes('h [cm]')),
    contactTime: headers.findIndex((h) => h.includes('contact') || h.includes('contatto') || h.includes('tc') || h.includes('t_cont')),
    flightTime: headers.findIndex((h) => h.includes('flight') || h.includes('volo') || h.includes('tv') || h.includes('t_volo')),
    rsi: headers.findIndex((h) => h.includes('rsi') || h.includes('reactive')),
  };

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/[,;\t]/).map((p) => p.trim());
    if (parts.length < 2) continue;

    if (colIdx.athlete >= 0 && parts[colIdx.athlete]) {
      athleteName = parts[colIdx.athlete];
    }

    const typeStr = colIdx.jumpType >= 0 ? parts[colIdx.jumpType] : 'CMJ';
    const condRaw = colIdx.condition >= 0 ? parts[colIdx.condition].toLowerCase() : (i % 2 === 0 ? 'post' : 'pre');
    const condition = condRaw.includes('post') ? 'post' : 'pre';

    const heightVal = colIdx.height >= 0 ? parseFloat(parts[colIdx.height].replace(',', '.')) : NaN;
    const tcVal = colIdx.contactTime >= 0 ? parseFloat(parts[colIdx.contactTime].replace(',', '.')) : undefined;
    const tfVal = colIdx.flightTime >= 0 ? parseFloat(parts[colIdx.flightTime].replace(',', '.')) : undefined;
    const rsiVal = colIdx.rsi >= 0 ? parseFloat(parts[colIdx.rsi].replace(',', '.')) : undefined;

    if (!isNaN(heightVal) && heightVal > 0) {
      const rec: JumpRecord = {
        athleteName,
        jumpType: typeStr || 'CMJ',
        condition,
        heightCm: heightVal,
        contactTimeMs: tcVal && !isNaN(tcVal) ? tcVal : undefined,
        flightTimeMs: tfVal && !isNaN(tfVal) ? tfVal : undefined,
        rsi: rsiVal && !isNaN(rsiVal) ? rsiVal : (tcVal && tcVal > 0 && tfVal ? tfVal / tcVal : undefined),
        trialIndex: i,
      };

      allJumps.push(rec);
      if (condition === 'pre') {
        preJumps.push(rec);
      } else {
        postJumps.push(rec);
      }
    }
  }

  return {
    isPAP: isPAP || (preJumps.length > 0 && postJumps.length > 0),
    athleteName,
    preJumps,
    postJumps,
    allJumps,
    warnings,
  };
}
