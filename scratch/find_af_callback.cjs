const fs = require('fs');
const html = fs.readFileSync('scratch/gdrive_page.html', 'utf8');

let pos = 0;
while ((pos = html.indexOf('AF_initDataCallback', pos)) !== -1) {
  console.log('Found AF_initDataCallback at pos:', pos);
  console.log(html.slice(pos, pos + 300));
  pos += 1;
  if (pos > 10) break; // just see first one
}

// Also check for "RGC" in html
pos = 0;
while ((pos = html.indexOf('RGC', pos)) !== -1) {
  console.log('Found RGC at pos:', pos);
  console.log(html.slice(Math.max(0, pos - 100), Math.min(html.length, pos + 200)));
  pos += 3;
}

