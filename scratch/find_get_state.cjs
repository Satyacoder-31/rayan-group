const fs = require('fs');
const content = fs.readFileSync('public/api/finance.php', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes("case 'get_state'") || l.includes('function loadFinanceDb') || l.includes('normalizePurchaseBills') || l.includes('sync_full')) {
    console.log(i + 1, l.trim());
  }
});

