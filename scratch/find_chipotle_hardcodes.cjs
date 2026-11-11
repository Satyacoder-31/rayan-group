const fs = require('fs');
const content = fs.readFileSync('src/scripts/finance.js', 'utf8');
const lines = content.split('\n');

console.log('Searching finance.js for chipotle / 44010 / 44014 / 44015 / 107872 / 90088 / 17784 ...');
lines.forEach((l, i) => {
  const s = l.toLowerCase();
  if (s.includes('107872') || s.includes('90088') || s.includes('17784') || s.includes('44010') || s.includes('44014') || s.includes('44015') || s.includes('17370') || s.includes('17373')) {
    console.log(i + 1, l.trim());
  }
});

