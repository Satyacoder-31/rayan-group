const https = require('https');
const fs = require('fs');

const folders = [
  { year: '2024', id: '1x8NF-VPE5Ulz9HD-FGwvdE6u3xvfnKlA' },
  { year: '2025', id: '1h43hEZmfSPCBB2gNUsk0PMe4Zar3uni-' },
  { year: '2026', id: '1VeZ7-92pkPIarXV0CdDqcnfPIcVqYTsn' }
];

function fetchFolder(folder) {
  return new Promise((resolve, reject) => {
    const url = `https://drive.google.com/drive/folders/${folder.id}?usp=sharing`;
    function get(u) {
      https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location);
        }
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          fs.writeFileSync(`scratch/gdrive_${folder.year}.html`, body, 'utf8');
          const match = body.match(/window\['_DRIVE_ivd'\]\s*=\s*'([^']+)'/);
          if (match) {
            const jsonStr = match[1].replace(/\\x([0-9a-fA-F]{2})/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
            fs.writeFileSync(`scratch/ivd_${folder.year}.json`, jsonStr, 'utf8');
            try {
              const data = JSON.parse(jsonStr);
              const items = [];
              function walk(obj) {
                if (!obj) return;
                if (Array.isArray(obj)) {
                  if (typeof obj[0] === 'string' && typeof obj[2] === 'string' && typeof obj[3] === 'string') {
                    items.push({ id: obj[0], name: obj[2], mime: obj[3] });
                  }
                  for (const it of obj) walk(it);
                }
              }
              walk(data);
              console.log(`Folder ${folder.year} (${folder.id}) has ${items.length} items:`);
              console.log(items);
              resolve({ folder, items });
            } catch (err) {
              console.error(`Error parsing JSON for ${folder.year}:`, err.message);
              resolve({ folder, items: [] });
            }
          } else {
            console.log(`window._DRIVE_ivd not found for ${folder.year}`);
            resolve({ folder, items: [] });
          }
        });
      }).on('error', reject);
    }
    get(url);
  });
}

async function run() {
  for (const f of folders) {
    await fetchFolder(f);
  }
}

run();

