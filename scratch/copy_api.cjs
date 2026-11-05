const fs = require('fs');

fs.copyFileSync('public/api/finance.php', 'dist/api/finance.php');
console.log('Successfully copied public/api/finance.php to dist/api/finance.php');
