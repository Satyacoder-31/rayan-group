const fs = require('fs');
const content = fs.readFileSync('public/api/finance.php', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes("action === '") || l.includes("action == '") || l.includes("case '")) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
