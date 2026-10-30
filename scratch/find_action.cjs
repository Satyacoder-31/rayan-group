const fs = require('fs');
const lines = fs.readFileSync('public/api/finance.php', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes("action === 'load'") || l.includes("action == 'load'") || l.includes("$action === 'load'") || l.includes("action == 'load_all'")) {
    console.log('L' + (i + 1) + ': ' + l.trim());
  }
});
