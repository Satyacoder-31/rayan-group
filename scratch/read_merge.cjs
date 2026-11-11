const fs = require('fs');
const content = fs.readFileSync('src/scripts/finance.js', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('mergeWithSeedData'));
console.log('mergeWithSeedData at line', idx + 1);
console.log(lines.slice(idx, idx + 60).join('\n'));
