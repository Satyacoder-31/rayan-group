const fs = require('fs');
const content = fs.readFileSync('src/scripts/finance.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('CURRENT_DB_VERSION') || l.includes('v2026_clean_')) {
    console.log(i + 1, l.trim());
  }
});

