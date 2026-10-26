const fs = require('fs');
const path = require('path');

const dir = 'E:/Nuove App Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/00-capitolato-tecnico-e-glossario';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== '00-GLOSSARIO-TERMINI-TECNICI.md');

console.log(`Analyzing ${files.length} markdown files...`);
files.forEach((file, idx) => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');
  const wordCount = content.split(/\s+/).length;
  const sections = lines.filter(l => l.startsWith('## ')).map(l => l.replace('## ', '').trim());
  const title = lines.find(l => l.startsWith('# '))?.replace('# ', '').trim() || '';
  const miroMatch = content.match(/Board Miro Online:\s*`([^`]+)`\s*\(([^)]+)\)/);
  const miroLoc = miroMatch ? miroMatch[2] : 'N/A';
  
  console.log(`\n[${idx + 1}] File: ${file}`);
  console.log(`   Title: ${title}`);
  console.log(`   Words: ${wordCount} | Lines: ${lines.length}`);
  console.log(`   Miro declared location: ${miroLoc}`);
  console.log(`   Sections (${sections.length}): ${sections.join(' | ')}`);
});
