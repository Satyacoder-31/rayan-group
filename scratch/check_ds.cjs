const fs = require('fs');
const html = fs.readFileSync('scratch/gdrive_page.html', 'utf8');

for (const ds of ['ds:2', 'ds:3', 'ds:4', 'ds:5', 'ds:6', 'ds:7']) {
  const p = html.indexOf(`key: '${ds}'`);
  if (p !== -1) {
    console.log(`=== Found ${ds} at pos ${p} ===`);
    console.log(html.slice(p, p + 2000));
  } else {
    console.log(`Not found: ${ds}`);
  }
}

