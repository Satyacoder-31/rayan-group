const fs = require('fs');
const lines = fs.readFileSync('public/api/finance.php', 'utf8').split('\n');
lines.forEach((l, idx) => {
  if (l.includes("action === '") || l.includes('case \'') || l.includes('create_') || l.includes('record_') || l.includes('delete_')) {
    if (l.includes('action') || l.includes('case')) {
      console.log((idx + 1) + ': ' + l.trim());
    }
  }
});
