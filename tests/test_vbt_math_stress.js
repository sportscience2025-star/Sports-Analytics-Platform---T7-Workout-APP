const fs = require('fs');
const path = require('path');

// 1. Mock browser APIs
global.window = {};

// Load physics-engine.js
const physicsPath = path.join(__dirname, '..', 'js', 'physics-engine.js');
if (!fs.existsSync(physicsPath)) {
    console.error(`❌ physics-engine.js not found at ${physicsPath}`);
    process.exit(1);
}