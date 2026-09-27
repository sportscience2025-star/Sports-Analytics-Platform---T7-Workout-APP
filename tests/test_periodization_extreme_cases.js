const fs = require('fs');
const path = require('path');

console.log("=== WorkoutGeneratorAI Extreme Edge Cases & Pathology Stress Test ===\n");

// 1. Mock browser globals
global.localStorage = {
    getItem: (key) => null,
    setItem: (key, val) => {}
};
global.window = {
    App: {}
};

// 2. Load data.js
const dataPath = path.join(__dirname, '..', 'js', 'data.js');
if (!fs.existsSync(dataPath)) {
    console.error("Error: data.js not found at", dataPath);
    process.exit(1);
}