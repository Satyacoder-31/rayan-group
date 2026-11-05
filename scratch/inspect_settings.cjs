const fs = require('fs');
const content = fs.readFileSync('public/api/finance.php', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('finance_settings') || l.includes('Migration v')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 100));
  }
});

