const fs = require('fs');
const path = require('path');

// 1. Mock browser environment globals
global.window = {};

// 2. Load physics-engine.js inside global/window context
const physicsPath = path.join(__dirname, '..', 'js', 'physics-engine.js');
if (!fs.existsSync(physicsPath)) {
    console.error("Error: physics-engine.js not found at", physicsPath);
    process.exit(1);
}