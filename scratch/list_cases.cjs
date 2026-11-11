const fs = require('fs');
const content = fs.readFileSync('public/api/finance.php', 'utf8');
const lines = content.split('\n');
for (let i = 6490; i < lines.length; i++) {
  if (lines[i].trim().startsWith('case ')) {
    console.log(i + 1, lines[i].trim());
  }
}
