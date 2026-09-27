const fs = require('fs');
const path = require('path');

// --- Helper assertion library ---
function assert(condition, message) {
    if (!condition) {
        console.error("❌ Assertion Failed:", message);
        throw new Error("Assertion Failed: " + message);
    }
}

function assertClose(actual, expected, margin = 1e-3, name = "") {
    const diff = Math.abs(actual - expected);
    if (diff > margin) {
        console.error(`❌ Assertion Failed for ${name}: Expected ${expected} (margin ${margin}), got ${actual}`);
        throw new Error(`Assertion Failed for ${name}`);
    }
}

// --- DOM and Environment Mock Harness ---
class MockDOMElement {
    constructor(tagName, id = '') {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.className = '';
        this.style = {};
        this.children = [];
        this.parentElement = null;
        this.listeners = {};
        this.attributes = {};
        this._innerHTML = '';
    }

    get innerHTML() {
        return this._innerHTML;
    }

    set innerHTML(val) {
        this._innerHTML = val;
        // Parse basic tags in innerHTML to maintain mock child references if needed
        this.children = [];
        if (typeof val === 'string' && val.includes('id=')) {
            const matches = val.matchAll(/id=["']([^"']+)["']/g);
            for (const match of matches) {
                const child = new MockDOMElement('div', match[1]);
                child.parentElement = this;
                this.children.push(child);
            }
        }
    }

    appendChild(child) {
        child.parentElement = this;
        this.children.push(child);
        return child;
    }

    remove() {
        if (this.parentElement) {
            const idx = this.parentElement.children.indexOf(this);
            if (idx >= 0) this.parentElement.children.splice(idx, 1);
        }
    }

    getContext(type) {
        if (type === '2d') {
            return {
                canvas: this,
                save: () => {},
                restore: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                stroke: () => {},
                createLinearGradient: () => ({ addColorStop: () => {} }),
                shadowColor: '',
                shadowBlur: 0,
                shadowOffsetX: 0,
                shadowOffsetY: 0
            };
        }
        return null;
    }

    getBoundingClientRect() {
        return { left: 100, top: 100, width: 600, height: 400 };
    }

    addEventListener(event, handler) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(handler);
    }

    querySelector(selector) {
        return null;
    }

    querySelectorAll(selector) {
        return [];
    }
}

class MockDocument {
    constructor() {
        this.body = new MockDOMElement('body');
        this.documentElement = { scrollTop: 0, scrollLeft: 0 };
        this.elementsById = {};
    }

    createElement(tag) {
        return new MockDOMElement(tag);
    }

    getElementById(id) {
        // First check body and its tree
        const findInTree = (el) => {
            if (el.id === id) return el;
            for (const child of el.children) {
                const res = findInTree(child);
                if (res) return res;
            }
            return null;
        };
        const found = findInTree(this.body);
        if (found) return found;
        return this.elementsById[id] || null;
    }

    registerElement(el) {
        if (el.id) this.elementsById[el.id] = el;
    }
}

// --- Chart.js Mock Trackers ---
let activeChartInstances = [];
let chartCreationLogs = [];

class MockChart {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.canvas = ctx.canvas || ctx;
        this.config = config;
        this.type = config.type;
        this.data = config.data;
        this.options = config.options;
        this.destroyed = false;

        activeChartInstances.push(this);
        chartCreationLogs.push({
            type: this.type,
            canvasId: this.canvas.id,
            datasets: this.data ? this.data.datasets.length : 0
        });
    }

    destroy() {
        this.destroyed = true;
        const idx = activeChartInstances.indexOf(this);
        if (idx >= 0) {
            activeChartInstances.splice(idx, 1);
        }
    }

    update() {
        this.updated = true;
    }
}

// Global window setup
global.window = global.window || {};
global.document = new MockDocument();
global.window.pageYOffset = 0;
global.window.pageXOffset = 0;
global.window.Chart = MockChart;
global.Chart = MockChart;

// Setup containers in mock DOM body
const dashboardContainer = new MockDOMElement('div', 'dashboard-container');
global.document.body.appendChild(dashboardContainer);

const vbtMvtInput = new MockDOMElement('input', 'vbt-mvt-input');
vbtMvtInput.value = '0.30';
global.document.body.appendChild(vbtMvtInput);

// Load physics-engine.js and data-analysis.js
const physicsPath = path.join(__dirname, '..', 'js', 'physics-engine.js');
const analysisPath = path.join(__dirname, '..', 'js', 'data-analysis.js');

const physicsCode = fs.readFileSync(physicsPath, 'utf8');
eval(physicsCode);

const analysisCode = fs.readFileSync(analysisPath, 'utf8');
eval(analysisCode);

const DataAnalysisUI = global.window.DataAnalysisUI;

function runEmpiricalTests() {
    console.log("=================================================");
    console.log("🔬 EMPIRICAL CHART.JS & MEMORY VERIFICATION SUITE");
    console.log("=================================================\n");

    const ui = new DataAnalysisUI('dashboard-container');

    // Sample datasets for testing
    const sampleVBTData = [
        { load: 40, velocity: 1.05, athlete: 'Athlete A', exercise: 'Panca Piana' },
        { load: 60, velocity: 0.85, athlete: 'Athlete A', exercise: 'Panca Piana' },
        { load: 80, velocity: 0.62, athlete: 'Athlete A', exercise: 'Panca Piana' },
        { load: 100, velocity: 0.41, athlete: 'Athlete A', exercise: 'Panca Piana' }
    ];

    const sampleJumpData = [
        { exercise: 'SJ', jumpHeight: 32.5, athlete: 'Athlete B' },
        { exercise: 'CMJ', jumpHeight: 36.0, athlete: 'Athlete B' },
        { exercise: 'DJ', jumpHeight: 34.0, contactTime: 0.19, athlete: 'Athlete B' },
        { exercise: 'DJ', jumpHeight: 35.5, contactTime: 0.18, athlete: 'Athlete B' }
    ];

    // --------------------------------------------------
    // TEST 1: VBT Charts Rendering (#vbt-chart & #power-curve-chart)
    // --------------------------------------------------
    console.log("--- TEST 1: Empirical Verification of VBT Canvas Rendering ---");
    activeChartInstances = [];
    chartCreationLogs = [];
    
    ui.renderVBTDashboard(sampleVBTData, 'Athlete A', 'Panca Piana');

    assert(activeChartInstances.length === 2, "Expected 2 active Chart instances for VBT dashboard");
    assert(ui.chartInstance !== null, "ui.chartInstance should be initialized");
    assert(ui.powerCurveChart !== null, "ui.powerCurveChart should be initialized");
    
    assert(ui.chartInstance.type === 'scatter', "vbt-chart should be type scatter");
    assert(ui.chartInstance.data.datasets.length === 4, "vbt-chart should have 4 datasets (1RM point, scatter, regression line, MVT)");
    assert(ui.powerCurveChart.type === 'line', "power-curve-chart should be type line");
    assert(ui.powerCurveChart.data.datasets.length === 3, "power-curve-chart should have 3 datasets (Pmax vertex, experimental points, power curve line)");

    console.log("✅ TEST 1 PASSED: VBT canvas rendering and dataset structures verified.\n");

    // --------------------------------------------------
    // TEST 2: Jump Charts Rendering (#jump-heights-chart & #rsi-trials-chart)
    // --------------------------------------------------
    console.log("--- TEST 2: Empirical Verification of Jump Canvas Rendering ---");
    
    ui.renderJumpDashboard(sampleJumpData, 'Athlete B');

    assert(ui.jumpHeightChart !== null, "ui.jumpHeightChart should be initialized");
    assert(ui.rsiChart !== null, "ui.rsiChart should be initialized");
    assert(ui.jumpHeightChart.type === 'bar', "jump-heights-chart should be type bar");
    assert(ui.rsiChart.type === 'line', "rsi-trials-chart should be type line");
    assert(ui.rsiChart.data.datasets[0].data.length === 2, "rsi-trials-chart should have 2 RSI trial points");

    console.log("✅ TEST 2 PASSED: Jump canvas rendering and dataset structures verified.\n");

    // --------------------------------------------------
    // TEST 3: Edge Case Verification — Empty Drop Jump Data for #rsi-trials-chart
    // --------------------------------------------------
    console.log("--- TEST 3: Edge Case — Empty Drop Jump Data in Jump Dashboard ---");
    
    const jumpDataNoDJ = [
        { exercise: 'SJ', jumpHeight: 30.0, athlete: 'Athlete C' },
        { exercise: 'CMJ', jumpHeight: 33.0, athlete: 'Athlete C' }
    ];

    ui.renderJumpDashboard(jumpDataNoDJ, 'Athlete C');
    assert(ui.rsiChart === null, "ui.rsiChart should be null when no DJ data is present");
    
    // Check DOM mutation flaw on line 1390
    const rsiCanvasContainer = global.document.getElementById('rsi-trials-chart');
    if (!rsiCanvasContainer) {
        console.log("⚠️ DOM DISCOVERY: Canvas #rsi-trials-chart was destroyed and replaced by HTML string when no DJ data was present.");
    }

    console.log("✅ TEST 3 PASSED: Handled empty Drop Jump edge case.\n");

    // --------------------------------------------------
    // TEST 4: Stress Testing Memory Leaks & Destruction Cycles
    // --------------------------------------------------
    console.log("--- TEST 4: Memory Leak & Destruction Cycle Stress Harness (500 cycles) ---");
    
    const cycles = 500;
    for (let i = 0; i < cycles; i++) {
        if (i % 2 === 0) {
            ui.renderVBTDashboard(sampleVBTData, 'Athlete A', 'Panca Piana');
        } else {
            ui.renderJumpDashboard(sampleJumpData, 'Athlete B');
        }
    }

    console.log(`Active Chart instances after ${cycles} switch cycles: ${activeChartInstances.length}`);
    assert(activeChartInstances.length <= 2, "Memory leak detected! Chart instances were not destroyed properly.");
    
    ui.cleanup();
    assert(activeChartInstances.length === 0, "Active chart instances should be 0 after cleanup()");
    console.log("✅ TEST 4 PASSED: No Chart instance memory leaks detected after 500 cycles.\n");

    // --------------------------------------------------
    // TEST 5: Inspection of Tooltip Handler & DOM Leaks
    // --------------------------------------------------
    console.log("--- TEST 5: Empirical Inspection of DOM Tooltip Leaks ---");
    
    // Trigger tooltip handler
    const mockContext = {
        chart: { canvas: new MockDOMElement('canvas') },
        tooltip: { opacity: 1, caretX: 50, caretY: 50, title: ['Test'], body: [{ lines: ['Val: 10'] }], labelColors: [{ borderColor: '#fff' }] }
    };

    // Access glassTooltipHandler through options of active chart or evaluate
    ui.renderVBTDashboard(sampleVBTData, 'Athlete A', 'Panca Piana');
    const tooltipHandler = ui.chartInstance.options.plugins.tooltip.external;
    
    assert(typeof tooltipHandler === 'function', "glassTooltipHandler should be defined");
    
    tooltipHandler(mockContext);
    let tooltipEl = global.document.getElementById('chartjs-glass-tooltip');
    assert(tooltipEl !== null, "#chartjs-glass-tooltip should be created in document.body");

    // Perform cleanup and check if tooltip is removed from DOM
    ui.cleanup();
    tooltipEl = global.document.getElementById('chartjs-glass-tooltip');
    assert(tooltipEl === null, "Tooltip should be removed from DOM after cleanup");

    console.log("✅ DOM TOOLTIP VERIFICATION: #chartjs-glass-tooltip is successfully removed from document.body upon cleanup/destruction.\n");

    console.log("=================================================");
    console.log("🎉 ALL EMPIRICAL VERIFICATIONS COMPLETED");
    console.log("=================================================");
}

try {
    runEmpiricalTests();
    if (global.process) global.process.exit(0);
} catch (err) {
    console.error("❌ Empirical verification failed:", err.stack || err.message);
    if (global.process) global.process.exit(1);
}
