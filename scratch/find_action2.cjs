const fs = require('fs');
const lines = fs.readFileSync('public/api/finance.php', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes("$action") || l.includes("action") && l.includes("switch")) {
    console.log('L' + (i + 1) + ': ' + l.trim());
  }
});

