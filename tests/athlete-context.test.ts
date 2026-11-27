/**
 * tests/athlete-context.test.ts
 * Suite di test unitari per il Global Athlete & Squad Context Provider (TASK-005).
 * Verifica sincronizzazione 2-click, Tier 1 enforcement, riconciliazione, persistenza, GDPR Art. 9 e React 18.
 */

import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot, Root } from 'react-dom/client';
import {
  AthleteProvider,
  useAthleteRawContext,
  AthleteContextValue,
  isValidContextMode,
  STORAGE_KEY_CONTEXT,
  DEFAULT_CONTEXT_MODE,
  CONTEXT_MODE_ATHLETE,
  CONTEXT_MODE_TEAM,
  DEMO_TEAMS,
  DEMO_ATHLETES
} from '../src/context/AthleteContext';
import { useAthleteContext, UseAthleteContextReturn } from '../src/hooks/useAthleteContext';
import {
  Athlete,
  Team,
  TACTICAL_ROLE_WEIGHT_SUM,
  AVAILABILITY_FIT,
  AVAILABILITY_CAUTION,
  AVAILABILITY_REHAB,
  AVAILABILITY_INJURED
} from '../src/types/athlete';
import { MAX_ATHLETES_TIER1, SILO1_CONSUMER, SENSITIVITY_STANDARD } from '../src/types/tier';
import { asKilograms } from '../src/types/physics';

// ============================================================================
// COSTANTI DI TEST E SHIM DOM HEADLESS PER REACT 18 CLIENT
// ============================================================================

const ELEMENT_NODE_TYPE = 1;
const TEXT_NODE_TYPE = 3;
const COMMENT_NODE_TYPE = 8;
const DOCUMENT_NODE_TYPE = 9;
const WEIGHT_TOLERANCE = 1e-9;

interface MockStorageData {
  store: Map<string, string>;
  storage: Storage;
}

/**
 * Crea un'istanza in-memory conforme all'interfaccia web Storage per test in Node.js.
 * @returns Struttura con mappa interna e oggetto Storage completo
 */
function createMockStorage(): MockStorageData {
  const store = new Map<string, string>();
  const storage: Storage = {
    get length(): number {
      return store.size;
    },
    clear(): void {
      store.clear();
    },
    getItem(key: string): string | null {
      const value = store.get(key);
      return value === undefined ? null : value;
    },
    key(index: number): string | null {
      const keys = Array.from(store.keys());
      return keys[index] ?? null;
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value));
    }
  };
  return { store, storage };
}

interface MinimalDomNode {
  nodeType: number;
  nodeName: string;
  tagName?: string;
  nodeValue: string | null;
  textContent: string | null;
  parentNode: MinimalDomNode | null;
  ownerDocument: MinimalDocument | null;
  childNodes: MinimalDomNode[];
  firstChild: MinimalDomNode | null;
  lastChild: MinimalDomNode | null;
  nextSibling: MinimalDomNode | null;
  previousSibling: MinimalDomNode | null;
  style: Record<string, string>;
  attributes: Map<string, string>;
  appendChild: (child: MinimalDomNode) => MinimalDomNode;
  removeChild: (child: MinimalDomNode) => MinimalDomNode;
  insertBefore: (newNode: MinimalDomNode, refNode: MinimalDomNode | null) => MinimalDomNode;
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
  addEventListener: () => void;
  removeEventListener: () => void;
}

interface MinimalDocument {
  nodeType: number;
  defaultView: unknown;
  activeElement: MinimalDomNode | null;
  body: MinimalDomNode;
  createElement: (tagName: string) => MinimalDomNode;
  createElementNS: (_ns: string, tagName: string) => MinimalDomNode;
  createTextNode: (text: string) => MinimalDomNode;
  createComment: (text: string) => MinimalDomNode;
  addEventListener: () => void;
  removeEventListener: () => void;
}

/**
 * Aggiorna i puntatori fratelli/figli di un nodo DOM minimale dopo una mutazione.
 * @param parent Nodo contenitore padre
 */
function syncParentPointers(parent: MinimalDomNode): void {
  const count = parent.childNodes.length;
  parent.firstChild = count > 0 ? parent.childNodes[0] : null;
  parent.lastChild = count > 0 ? parent.childNodes[count - 1] : null;
  for (let i = 0; i < count; i += 1) {
    const node = parent.childNodes[i];
    node.parentNode = parent;
    node.previousSibling = i > 0 ? parent.childNodes[i - 1] : null;
    node.nextSibling = i + 1 < count ? parent.childNodes[i + 1] : null;
  }
}

/**
 * Crea un nodo DOM minimale sufficiente per montare React 18 createRoot in Node.js senza jsdom.
 * @param nodeType Tipo numerico del nodo DOM
 * @param nodeName Nome nodo o tag
 * @param ownerDocument Riferimento al documento proprietario
 * @param initialValue Testo iniziale per nodi testo/commento
 * @returns Nodo DOM minimale
 */
function createMinimalNode(
  nodeType: number,
  nodeName: string,
  ownerDocument: MinimalDocument | null,
  initialValue: string | null = null
): MinimalDomNode {
  const attributes = new Map<string, string>();
  const node: MinimalDomNode = {
    nodeType,
    nodeName,
    tagName: nodeType === ELEMENT_NODE_TYPE ? nodeName.toUpperCase() : undefined,
    nodeValue: initialValue,
    textContent: initialValue,
    parentNode: null,
    ownerDocument,
    childNodes: [],
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
    style: {},
    attributes,
    appendChild(child: MinimalDomNode): MinimalDomNode {
      if (child.parentNode) {
        child.parentNode.removeChild(child);
      }
      node.childNodes.push(child);
      syncParentPointers(node);
      return child;
    },
    removeChild(child: MinimalDomNode): MinimalDomNode {
      const idx = node.childNodes.indexOf(child);
      if (idx >= 0) {
        node.childNodes.splice(idx, 1);
        child.parentNode = null;
        child.previousSibling = null;
        child.nextSibling = null;
        syncParentPointers(node);
      }
      return child;
    },
    insertBefore(newNode: MinimalDomNode, refNode: MinimalDomNode | null): MinimalDomNode {
      if (!refNode) {
        return node.appendChild(newNode);
      }
      if (newNode.parentNode) {
        newNode.parentNode.removeChild(newNode);
      }
      const idx = node.childNodes.indexOf(refNode);
      if (idx < 0) {
        return node.appendChild(newNode);
      }
      node.childNodes.splice(idx, 0, newNode);
      syncParentPointers(node);
      return newNode;
    },
    setAttribute(name: string, value: string): void {
      attributes.set(name, String(value));
    },
    removeAttribute(name: string): void {
      attributes.delete(name);
    },
    addEventListener(): void {
      // No-op in ambiente headless
    },
    removeEventListener(): void {
      // No-op in ambiente headless
    }
  };
  return node;
}

/**
 * Installa uno shim DOM e localStorage su globalThis per eseguire React.act + createRoot.
 * @returns Oggetto con storage mock e funzione di pulizia globale
 */
function installHeadlessDomEnvironment(): {
  mockStorage: MockStorageData;
  createContainer: () => HTMLElement;
  cleanup: () => void;
} {
  const mockStorage = createMockStorage();
  const doc: MinimalDocument = {
    nodeType: DOCUMENT_NODE_TYPE,
    defaultView: null,
    activeElement: null,
    body: null as unknown as MinimalDomNode,
    createElement(tagName: string): MinimalDomNode {
      return createMinimalNode(ELEMENT_NODE_TYPE, tagName, doc, null);
    },
    createElementNS(_ns: string, tagName: string): MinimalDomNode {
      return createMinimalNode(ELEMENT_NODE_TYPE, tagName, doc, null);
    },
    createTextNode(text: string): MinimalDomNode {
      return createMinimalNode(TEXT_NODE_TYPE, '#text', doc, String(text));
    },
    createComment(text: string): MinimalDomNode {
      return createMinimalNode(COMMENT_NODE_TYPE, '#comment', doc, String(text));
    },
    addEventListener(): void {
      // No-op in ambiente headless
    },
    removeEventListener(): void {
      // No-op in ambiente headless
    }
  };
  doc.body = doc.createElement('body');

  const globalObj = globalThis as unknown as Record<string, unknown>;
  const prevWindow = globalObj.window;
  const prevDocument = globalObj.document;
  const prevActFlag = globalObj.IS_REACT_ACT_ENVIRONMENT;

  const mockWindow = {
    localStorage: mockStorage.storage,
    document: doc,
    HTMLIFrameElement: function MockHTMLIFrameElement(): void {
      // Costruttore fittizio richiesto da ReactDOM getActiveElementDeep
    }
  };
  doc.defaultView = mockWindow;

  globalObj.window = mockWindow;
  globalObj.document = doc;
  globalObj.IS_REACT_ACT_ENVIRONMENT = true;

  return {
    mockStorage,
    createContainer: (): HTMLElement => doc.createElement('div') as unknown as HTMLElement,
    cleanup: (): void => {
      if (prevWindow === undefined) {
        delete globalObj.window;
      } else {
        globalObj.window = prevWindow;
      }
      if (prevDocument === undefined) {
        delete globalObj.document;
      } else {
        globalObj.document = prevDocument;
      }
      if (prevActFlag === undefined) {
        delete globalObj.IS_REACT_ACT_ENVIRONMENT;
      } else {
        globalObj.IS_REACT_ACT_ENVIRONMENT = prevActFlag;
      }
    }
  };
}

/**
 * Monta un albero React con AthleteProvider in un root dedicato ed espone gli hook correnti.
 */
async function runMountedTests(): Promise<void> {
  const env = installHeadlessDomEnvironment();

  try {
    // -------------------------------------------------------------
    // 8. Transizioni Imperative (selectAthlete, selectTeam, 2-click) e Hook Shortcuts
    // -------------------------------------------------------------
    console.log('[Test 8] Testing selectAthlete, selectTeam, selectAthleteAndMode, selectTeamAndMode and dualRole/RTP...');

    const extraTeams: readonly Team[] = [
      DEMO_TEAMS[0],
      {
        id: 'team_academy_02',
        name: 'T7 Academy U23',
        clubCode: 'T7-U23',
        tier: 'tier2',
        siloPartition: SILO1_CONSUMER,
        rosterAthleteIds: ['ath_05'],
        staffUserIds: ['staff_coach_02'],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-11-22T00:00:00.000Z'
      }
    ];
    const extraAthletes: readonly Athlete[] = [
      ...DEMO_ATHLETES,
      {
        id: 'ath_05',
        name: 'Davide',
        surname: 'Conti',
        dateOfBirth: '2004-02-18',
        tier: 'tier2',
        siloPartition: SILO1_CONSUMER,
        sensitivityClass: SENSITIVITY_STANDARD,
        tacticalRole: 'winger',
        availabilityStatus: AVAILABILITY_FIT,
        heightCm: 179,
        currentWeightKg: asKilograms(72.0),
        teamId: 'team_academy_02',
        optInResearchWarehouse: true
      },
      {
        id: 'ath_free_06',
        name: 'Simone',
        surname: 'Galli',
        dateOfBirth: '1999-07-09',
        tier: 'tier2',
        siloPartition: SILO1_CONSUMER,
        sensitivityClass: SENSITIVITY_STANDARD,
        tacticalRole: 'full_back',
        availabilityStatus: AVAILABILITY_FIT,
        heightCm: 181,
        currentWeightKg: asKilograms(76.5),
        teamId: 'missing_club_99',
        optInResearchWarehouse: false
      }
    ];

    const hookBox: { current: UseAthleteContextReturn | null } = { current: null };
    const getLatestHook = (): UseAthleteContextReturn => {
      if (!hookBox.current) {
        assert.fail('Expected latestHook to be populated');
      }
      return hookBox.current;
    };
    let previousHookRef: UseAthleteContextReturn | null = null;

    function ProbeConsumer(): React.ReactElement | null {
      const hook = useAthleteContext();
      hookBox.current = hook;
      return null;
    }

    const container = env.createContainer();
    const root: Root = createRoot(container);

    await React.act(async () => {
      root.render(
        React.createElement(
          AthleteProvider,
          { initialTeams: extraTeams, initialAthletes: extraAthletes, persistState: true },
          React.createElement(ProbeConsumer)
        )
      );
    });

    assert.strictEqual(getLatestHook().selectedAthleteId, 'ath_01');
    assert.strictEqual(getLatestHook().selectedTeamId, 'team_pro_01');
    assert.strictEqual(getLatestHook().contextMode, CONTEXT_MODE_ATHLETE);
    assert.strictEqual(getLatestHook().dualRole, undefined);
    assert.strictEqual(getLatestHook().currentRtpPhase, undefined);
    // Il solo mount non deve sovrascrivere localStorage con lo stato di default
    assert.strictEqual(env.mockStorage.storage.getItem(STORAGE_KEY_CONTEXT), null);

    // Verifica stabilita memoizzazione di useAthleteContext su re-render identico
    previousHookRef = getLatestHook();
    await React.act(async () => {
      root.render(
        React.createElement(
          AthleteProvider,
          { initialTeams: extraTeams, initialAthletes: extraAthletes, persistState: true },
          React.createElement(ProbeConsumer)
        )
      );
    });
    assert.strictEqual(getLatestHook(), previousHookRef);

    // selectAthlete su ath_02 (dualRole)
    await React.act(async () => {
      getLatestHook().selectAthlete('ath_02');
    });
    assert.strictEqual(getLatestHook().selectedAthleteId, 'ath_02');
    assert.strictEqual(getLatestHook().selectedTeamId, 'team_pro_01');
    assert.strictEqual(getLatestHook().dualRole?.primaryRole, 'central_midfielder');
    assert.strictEqual(getLatestHook().dualRole?.secondaryRole, 'attacking_midfielder');
    assert.strictEqual(getLatestHook().currentRtpPhase, undefined);

    // selectAthlete su ath_03 (rehab + currentRtpPhase)
    await React.act(async () => {
      getLatestHook().selectAthlete('ath_03');
    });
    assert.strictEqual(getLatestHook().selectedAthleteId, 'ath_03');
    assert.strictEqual(getLatestHook().currentRtpPhase, 'return_to_training');
    assert.strictEqual(getLatestHook().isInjuredOrRehab, true);

    // selectTeamAndMode su seconda squadra riconcilia atleta su roster U23
    await React.act(async () => {
      getLatestHook().selectTeamAndMode('team_academy_02');
    });
    assert.strictEqual(getLatestHook().contextMode, CONTEXT_MODE_TEAM);
    assert.strictEqual(getLatestHook().selectedTeamId, 'team_academy_02');
    assert.strictEqual(getLatestHook().selectedAthleteId, 'ath_05');

    // selectAthleteAndMode su ath_01 torna in modalita athlete e squadra team_pro_01
    await React.act(async () => {
      getLatestHook().selectAthleteAndMode('ath_01');
    });
    assert.strictEqual(getLatestHook().contextMode, CONTEXT_MODE_ATHLETE);
    assert.strictEqual(getLatestHook().selectedTeamId, 'team_pro_01');
    assert.strictEqual(getLatestHook().selectedAthleteId, 'ath_01');

    // selectAthlete su atleta con teamId assente da teamMap deve azzerare selectedTeamId
    await React.act(async () => {
      getLatestHook().selectAthlete('ath_free_06');
    });
    assert.strictEqual(getLatestHook().selectedAthleteId, 'ath_free_06');
    assert.strictEqual(getLatestHook().selectedTeamId, null);

    // Verifica persistenza reale prima del reset
    const persistedBeforeReset = env.mockStorage.storage.getItem(STORAGE_KEY_CONTEXT);
    if (!persistedBeforeReset) {
      assert.fail('Expected persistedBeforeReset to be non-null');
    }
    assert.ok(persistedBeforeReset.includes('ath_free_06'));

    // -------------------------------------------------------------
    // 9. resetContext() deve rimuovere localStorage senza riscrivere default
    // -------------------------------------------------------------
    console.log('[Test 9] Testing resetContext() clears localStorage without re-persisting defaults...');
    await React.act(async () => {
      getLatestHook().resetContext();
    });
    assert.strictEqual(getLatestHook().contextMode, DEFAULT_CONTEXT_MODE);
    assert.strictEqual(getLatestHook().selectedTeamId, 'team_pro_01');
    assert.strictEqual(getLatestHook().selectedAthleteId, 'ath_01');
    assert.strictEqual(env.mockStorage.storage.getItem(STORAGE_KEY_CONTEXT), null);

    // -------------------------------------------------------------
    // 10. Riconciliazione selectTeam con rosterAthleteIds[0] inesistente
    // -------------------------------------------------------------
    console.log('[Test 10] Testing selectTeam reconciliation fallback when rosterAthleteIds[0] is missing...');
    const teamWithStaleRoster: readonly Team[] = [
      DEMO_TEAMS[0],
      {
        id: 'team_broken_roster',
        name: 'Broken Roster FC',
        clubCode: 'BRK',
        tier: 'tier2',
        siloPartition: SILO1_CONSUMER,
        rosterAthleteIds: ['ghost_athlete_id'],
        staffUserIds: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-11-22T00:00:00.000Z'
      },
      {
        id: 'team_empty_roster',
        name: 'Empty Roster FC',
        clubCode: 'EMP',
        tier: 'tier2',
        siloPartition: SILO1_CONSUMER,
        rosterAthleteIds: ['ghost_only'],
        staffUserIds: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-11-22T00:00:00.000Z'
      }
    ];
    const athletesForBrokenTeam: readonly Athlete[] = [
      ...DEMO_ATHLETES,
      {
        id: 'ath_fallback_07',
        name: 'Paolo',
        surname: 'Verdi',
        tier: 'tier2',
        siloPartition: SILO1_CONSUMER,
        sensitivityClass: SENSITIVITY_STANDARD,
        tacticalRole: 'winger',
        availabilityStatus: AVAILABILITY_FIT,
        teamId: 'team_broken_roster',
        optInResearchWarehouse: true
      }
    ];

    await React.act(async () => {
      root.render(
        React.createElement(
          AthleteProvider,
          { initialTeams: teamWithStaleRoster, initialAthletes: athletesForBrokenTeam, persistState: false },
          React.createElement(ProbeConsumer)
        )
      );
    });

    await React.act(async () => {
      getLatestHook().selectTeam('team_broken_roster');
    });
    assert.strictEqual(getLatestHook().selectedTeamId, 'team_broken_roster');
    assert.strictEqual(getLatestHook().selectedAthleteId, 'ath_fallback_07');

    await React.act(async () => {
      getLatestHook().selectTeam('team_empty_roster');
    });
    assert.strictEqual(getLatestHook().selectedTeamId, 'team_empty_roster');
    assert.strictEqual(getLatestHook().selectedAthleteId, null);

    await React.act(async () => {
      root.unmount();
    });

    // -------------------------------------------------------------
    // 11. Ripristino da JSON malformato in localStorage
    // -------------------------------------------------------------
    console.log('[Test 11] Testing malformed JSON recovery from localStorage...');
    env.mockStorage.storage.setItem(STORAGE_KEY_CONTEXT, '{not-valid-json:::');
    const containerMalformed = env.createContainer();
    const rootMalformed = createRoot(containerMalformed);
    let malformedHook: AthleteContextValue | null = null;

    function RawProbe(): React.ReactElement | null {
      malformedHook = useAthleteRawContext();
      return null;
    }

    await React.act(async () => {
      rootMalformed.render(
        React.createElement(
          AthleteProvider,
          { persistState: true },
          React.createElement(RawProbe)
        )
      );
    });

    if (!malformedHook) {
      assert.fail('Expected malformedHook to be populated');
    }
    const resolvedMalformedHook: AthleteContextValue = malformedHook;
    assert.strictEqual(resolvedMalformedHook.contextMode, DEFAULT_CONTEXT_MODE);
    assert.strictEqual(resolvedMalformedHook.selectedTeamId, 'team_pro_01');
    assert.strictEqual(resolvedMalformedHook.selectedAthleteId, 'ath_01');

    await React.act(async () => {
      rootMalformed.unmount();
    });

    // -------------------------------------------------------------
    // 12. Tier 1 Lock (enforceSingleAthlete): clamp su mount, blocco azioni e toggle runtime
    // -------------------------------------------------------------
    console.log('[Test 12] Testing enforceSingleAthlete mount clamp, action blocking and runtime toggle...');
    env.mockStorage.storage.setItem(
      STORAGE_KEY_CONTEXT,
      JSON.stringify({ mode: CONTEXT_MODE_TEAM, selectedTeamId: 'team_pro_01', selectedAthleteId: 'ath_03' })
    );

    const containerLocked = env.createContainer();
    const rootLocked = createRoot(containerLocked);
    let lockedHook: AthleteContextValue | null = null;

    function LockedProbe(): React.ReactElement | null {
      lockedHook = useAthleteRawContext();
      return null;
    }

    // Mount con enforceSingleAthlete=true nonostante localStorage contenga ath_03 e team mode
    await React.act(async () => {
      rootLocked.render(
        React.createElement(
          AthleteProvider,
          { enforceSingleAthlete: true, persistState: true },
          React.createElement(LockedProbe)
        )
      );
    });

    if (!lockedHook) {
      assert.fail('Expected lockedHook to be populated');
    }
    const locked: AthleteContextValue = lockedHook;
    assert.strictEqual(locked.allAthletes.length, MAX_ATHLETES_TIER1);
    assert.strictEqual(locked.roster.length, MAX_ATHLETES_TIER1);
    assert.strictEqual(locked.selectedAthleteId, 'ath_01');
    assert.strictEqual(locked.selectedTeamId, null);
    assert.strictEqual(locked.contextMode, CONTEXT_MODE_ATHLETE);

    // Tentativi di bypass devono essere bloccati
    await React.act(async () => {
      locked.setContextMode('team');
      locked.selectTeam('team_pro_01');
      locked.selectTeamAndMode('team_pro_01');
      locked.selectAthlete('ath_02');
      locked.selectAthleteAndMode('ath_03');
    });

    if (!lockedHook) {
      assert.fail('Expected lockedHook to remain populated');
    }
    const lockedAfterActions: AthleteContextValue = lockedHook;
    assert.strictEqual(lockedAfterActions.contextMode, CONTEXT_MODE_ATHLETE);
    assert.strictEqual(lockedAfterActions.selectedTeamId, null);
    assert.strictEqual(lockedAfterActions.selectedAthleteId, 'ath_01');

    await React.act(async () => {
      rootLocked.unmount();
    });

    // Toggle runtime enforceSingleAthlete da false -> true
    env.mockStorage.storage.clear();
    const containerToggle = env.createContainer();
    const rootToggle = createRoot(containerToggle);
    let toggleHook: AthleteContextValue | null = null;

    function ToggleProbe(): React.ReactElement | null {
      toggleHook = useAthleteRawContext();
      return null;
    }

    await React.act(async () => {
      rootToggle.render(
        React.createElement(
          AthleteProvider,
          { enforceSingleAthlete: false, persistState: true },
          React.createElement(ToggleProbe)
        )
      );
    });

    await React.act(async () => {
      toggleHook?.selectTeamAndMode('team_pro_01');
      toggleHook?.selectAthlete('ath_03');
    });

    assert.strictEqual((toggleHook as unknown as AthleteContextValue).contextMode, CONTEXT_MODE_TEAM);
    assert.strictEqual((toggleHook as unknown as AthleteContextValue).selectedAthleteId, 'ath_03');

    await React.act(async () => {
      rootToggle.render(
        React.createElement(
          AthleteProvider,
          { enforceSingleAthlete: true, persistState: true },
          React.createElement(ToggleProbe)
        )
      );
    });

    const clampedAfterToggle = toggleHook as unknown as AthleteContextValue;
    assert.strictEqual(clampedAfterToggle.allAthletes.length, MAX_ATHLETES_TIER1);
    assert.strictEqual(clampedAfterToggle.contextMode, CONTEXT_MODE_ATHLETE);
    assert.strictEqual(clampedAfterToggle.selectedTeamId, null);
    assert.strictEqual(clampedAfterToggle.selectedAthleteId, 'ath_01');

    await React.act(async () => {
      rootToggle.unmount();
    });
  } finally {
    env.cleanup();
  }
}

// -------------------------------------------------------------
// 1. Validazione Runtime Type Guards e Costanti
// -------------------------------------------------------------
console.log('--- STARTING ATHLETE & SQUAD CONTEXT TEST SUITE ---');
console.log('[Test 1] Testing runtime type guards and uppercase constants...');
assert.strictEqual(isValidContextMode('athlete'), true);
assert.strictEqual(isValidContextMode('team'), true);
assert.strictEqual(isValidContextMode('squad'), false);
assert.strictEqual(isValidContextMode(''), false);
assert.strictEqual(isValidContextMode(null), false);
assert.strictEqual(isValidContextMode(undefined), false);
assert.strictEqual(isValidContextMode(123), false);

assert.strictEqual(STORAGE_KEY_CONTEXT, 't7_active_context');
assert.strictEqual(DEFAULT_CONTEXT_MODE, 'athlete');
assert.strictEqual(CONTEXT_MODE_ATHLETE, 'athlete');
assert.strictEqual(CONTEXT_MODE_TEAM, 'team');

// -------------------------------------------------------------
// 2. Integrita Roster Demo, Dual Role e Conformita GDPR Art. 9
// -------------------------------------------------------------
console.log('[Test 2] Testing DEMO_TEAMS and DEMO_ATHLETES integrity...');
assert.strictEqual(DEMO_TEAMS.length, 1);
assert.strictEqual(DEMO_TEAMS[0].id, 'team_pro_01');
assert.strictEqual(DEMO_TEAMS[0].clubCode, 'T7-PRO');
assert.strictEqual(DEMO_TEAMS[0].rosterAthleteIds.length, 4);

assert.strictEqual(DEMO_ATHLETES.length, 4);

const ath1 = DEMO_ATHLETES[0];
assert.strictEqual(ath1.id, 'ath_01');
assert.strictEqual(ath1.availabilityStatus, AVAILABILITY_FIT);
assert.strictEqual(ath1.tacticalRole, 'striker');
assert.strictEqual(Number(ath1.currentWeightKg), 78.5);

const ath2 = DEMO_ATHLETES[1];
assert.strictEqual(ath2.id, 'ath_02');
assert.strictEqual(ath2.availabilityStatus, AVAILABILITY_CAUTION);
assert.strictEqual(ath2.tacticalRole, 'central_midfielder');
if (!ath2.dualRole) {
  assert.fail('Expected ath2.dualRole to be defined');
}
const weightSum = ath2.dualRole.primaryWeight + (ath2.dualRole.secondaryWeight ?? 0);
assert.ok(Math.abs(weightSum - TACTICAL_ROLE_WEIGHT_SUM) < WEIGHT_TOLERANCE);

const ath3 = DEMO_ATHLETES[2];
assert.strictEqual(ath3.id, 'ath_03');
assert.strictEqual(ath3.availabilityStatus, AVAILABILITY_REHAB);
assert.strictEqual(ath3.tacticalRole, 'center_back');
assert.strictEqual(ath3.currentRtpPhase, 'return_to_training');

const ath4 = DEMO_ATHLETES[3];
assert.strictEqual(ath4.id, 'ath_04');
assert.strictEqual(ath4.availabilityStatus, AVAILABILITY_INJURED);
assert.strictEqual(ath4.tacticalRole, 'goalkeeper');
assert.strictEqual(ath4.currentRtpPhase, 'acute_protection');

// -------------------------------------------------------------
// 3. React 18 Static Rendering: Default Provider State
// -------------------------------------------------------------
console.log('[Test 3] Testing AthleteProvider default static rendering...');

function DefaultConsumer(): React.ReactElement {
  const ctx = useAthleteRawContext();
  return React.createElement(
    'div',
    { 'data-testid': 'context-summary' },
    `${ctx.contextMode}|${ctx.selectedTeamId}|${ctx.selectedAthleteId}|${ctx.roster.length}|${ctx.isAthleteMode}|${ctx.isTeamMode}|${ctx.isRosterEmpty}`
  );
}

const defaultHtml = renderToStaticMarkup(
  React.createElement(
    AthleteProvider,
    { persistState: false },
    React.createElement(DefaultConsumer)
  )
);
assert.strictEqual(
  defaultHtml,
  '<div data-testid="context-summary">athlete|team_pro_01|ath_01|4|true|false|false</div>'
);

// -------------------------------------------------------------
// 4. React 18 Static Rendering: Team Mode
// -------------------------------------------------------------
console.log('[Test 4] Testing AthleteProvider configured in team mode...');

const teamHtml = renderToStaticMarkup(
  React.createElement(
    AthleteProvider,
    { defaultMode: 'team', persistState: false },
    React.createElement(DefaultConsumer)
  )
);
assert.strictEqual(
  teamHtml,
  '<div data-testid="context-summary">team|team_pro_01|ath_01|4|false|true|false</div>'
);

// -------------------------------------------------------------
// 5. Tier 1 Consumer Enforcement (enforceSingleAthlete)
// -------------------------------------------------------------
console.log('[Test 5] Testing Tier 1 single athlete enforcement...');

function SingleAthleteConsumer(): React.ReactElement {
  const ctx = useAthleteRawContext();
  return React.createElement(
    'div',
    { 'data-testid': 'single-summary' },
    `${ctx.contextMode}|${ctx.selectedTeamId === null}|${ctx.teams.length}|${ctx.roster.length}|${ctx.allAthletes.length}|${ctx.selectedAthleteId}`
  );
}

const tier1Html = renderToStaticMarkup(
  React.createElement(
    AthleteProvider,
    { enforceSingleAthlete: true, persistState: false },
    React.createElement(SingleAthleteConsumer)
  )
);
assert.strictEqual(
  tier1Html,
  '<div data-testid="single-summary">athlete|true|0|1|1|ath_01</div>'
);

// -------------------------------------------------------------
// 6. Consumer Hook useAthleteContext Shortcuts (inclusi dualRole e currentRtpPhase)
// -------------------------------------------------------------
console.log('[Test 6] Testing useAthleteContext ergonomic shortcuts...');

function ShortcutConsumer(): React.ReactElement {
  const hook = useAthleteContext();
  return React.createElement(
    'div',
    { 'data-testid': 'shortcuts' },
    `${hook.athleteFullName}|${hook.teamName}|${hook.activeAvailabilityStatus}|${hook.activeTacticalRole}|${hook.dualRole?.secondaryRole ?? 'none'}|${hook.currentRtpPhase ?? 'none'}|${hook.isFit}|${hook.isInjuredOrRehab}`
  );
}

const shortcutHtml = renderToStaticMarkup(
  React.createElement(
    AthleteProvider,
    { persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(
  shortcutHtml,
  '<div data-testid="shortcuts">Marco Rossi|T7 Elite Performance Squad|fit|striker|none|none|true|false</div>'
);

const dualAndRtpHtml = renderToStaticMarkup(
  React.createElement(
    AthleteProvider,
    { defaultAthleteId: 'ath_02', persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(
  dualAndRtpHtml,
  '<div data-testid="shortcuts">Luca Bianchi|T7 Elite Performance Squad|caution|central_midfielder|attacking_midfielder|none|false|false</div>'
);

const rtpHtml = renderToStaticMarkup(
  React.createElement(
    AthleteProvider,
    { defaultAthleteId: 'ath_03', persistState: false },
    React.createElement(ShortcutConsumer)
  )
);
assert.strictEqual(
  rtpHtml,
  '<div data-testid="shortcuts">Alessandro Esposito|T7 Elite Performance Squad|rehab|center_back|none|return_to_training|false|true</div>'
);

// -------------------------------------------------------------
// 7. Test Invocazione Fuori da AthleteProvider
// -------------------------------------------------------------
console.log('[Test 7] Testing error throw when useAthleteRawContext is called outside provider...');
assert.throws(() => {
  renderToStaticMarkup(React.createElement(DefaultConsumer));
}, (err: Error) => {
  return err.message === 'useAthleteRawContext must be used within an AthleteProvider';
});

runMountedTests()
  .then(() => {
    console.log('--- ALL ATHLETE & SQUAD CONTEXT TESTS PASSED (100% OK) ---');
  })
  .catch((err: unknown) => {
    console.error('ATHLETE & SQUAD CONTEXT TEST SUITE FAILED:', err);
    process.exit(1);
  });
