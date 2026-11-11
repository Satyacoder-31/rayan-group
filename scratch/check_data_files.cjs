const fs = require('fs');
['data/finance-data.json', 'src/data/finance-data.json', 'dist/data/finance-data.json', 'public/data/finance-data.json'].forEach(f => {
  if (fs.existsSync(f)) {
    const stat = fs.statSync(f);
    console.log(f, 'exists! size:', stat.size, 'modified:', stat.mtime);
  } else {
    console.log(f, 'does NOT exist.');
  }
});

