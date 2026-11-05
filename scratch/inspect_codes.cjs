const fs = require('fs');
const content = fs.readFileSync('public/api/finance.php', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes("['code'] =") || l.includes("code = 'CUST") || l.includes('CUST-IRONBEAM') || l.includes('CUST-LUMINAR') || l.includes('CUST-MAGMA')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 100));
  }
});
