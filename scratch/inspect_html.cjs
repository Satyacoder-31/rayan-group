const fs = require('fs');
const html = fs.readFileSync('scratch/gdrive_page.html', 'utf8');

// Look for occurrences of "data" or "init" or any script variable
const matches = [];
for (const line of html.split('\n')) {
  if (line.includes('initData') || line.includes('WIZ_global_data') || line.includes('window[\'') || line.includes('window["') || line.includes('AF_dataServiceRequests')) {
    matches.push(line.slice(0, 200));
  }
}
console.log('Matches found:', matches.slice(0, 20));

// Also search for the folder ID '15zW_PuyrUor8Dj93_H20Zcr3MqWCSZPg' in html
let idx = 0;
let pos = 0;
while ((pos = html.indexOf('15zW_PuyrUor8Dj93_H20Zcr3MqWCSZPg', idx)) !== -1) {
  console.log('Folder ID found at pos:', pos, html.slice(Math.max(0, pos - 100), Math.min(html.length, pos + 200)));
  idx = pos + 1;
  if (idx > 100000) break;
}

