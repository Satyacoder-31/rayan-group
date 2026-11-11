const fs = require('fs');
const content = fs.readFileSync('src/scripts/finance.js', 'utf8');
const lines = content.split('\n');
for (let i = 9185; i < 9500; i++) {
  if (lines[i].startsWith('  ') && !lines[i].startsWith('    ') && lines[i].includes('(') && lines[i].includes(')')) {
    console.log(i + 1, lines[i].trim());
  }
}
