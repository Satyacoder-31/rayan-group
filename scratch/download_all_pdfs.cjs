const https = require('https');
const fs = require('fs');
const path = require('path');

const folders = ['2024', '2025', '2026'];

function downloadFile(id, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      return resolve({ success: true, cached: true });
    }
    const url = `https://drive.usercontent.google.com/download?id=${id}&export=download&authuser=0`;

    function get(u, redirects = 0) {
      if (redirects > 5) return resolve({ success: false, error: 'Too many redirects' });
      https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location, redirects + 1);
        }
        if (res.statusCode === 200) {
          const stream = fs.createWriteStream(destPath);
          res.pipe(stream);
          stream.on('finish', () => {
            stream.close();
            const sz = fs.statSync(destPath).size;
            if (sz > 500) {
              resolve({ success: true, size: sz });
            } else {
              resolve({ success: false, error: 'File too small' });
            }
          });
          stream.on('error', err => resolve({ success: false, error: err.message }));
        } else {
          resolve({ success: false, statusCode: res.statusCode });
        }
      }).on('error', err => resolve({ success: false, error: err.message }));
    }

    get(url);
  });
}

async function main() {
  for (const yr of folders) {
    const dir = path.join('scratch', 'pdfs', yr);
    fs.mkdirSync(dir, { recursive: true });
    const ivdData = JSON.parse(fs.readFileSync(`scratch/ivd_${yr}.json`, 'utf8'));

    const items = [];
    function walk(obj) {
      if (!obj) return;
      if (Array.isArray(obj)) {
        if (typeof obj[0] === 'string' && typeof obj[2] === 'string' && typeof obj[3] === 'string') {
          if (obj[3] === 'application/pdf') {
            items.push({ id: obj[0], name: obj[2] });
          }
        }
        for (const it of obj) walk(it);
      }
    }
    walk(ivdData);

    console.log(`Starting download for ${yr}: ${items.length} PDFs...`);
    let downloaded = 0;
    let failed = 0;

    // Concurrency pool of 5
    const queue = [...items];
    const workers = Array(5).fill(0).map(async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        const cleanName = item.name.replace(/[/\\?%*:|"<>]/g, '_');
        const dest = path.join(dir, `${item.id}_${cleanName}`);
        const res = await downloadFile(item.id, dest);
        if (res.success) {
          downloaded++;
        } else {
          failed++;
          console.error(`Failed ${item.name}:`, res);
        }
      }
    });

    await Promise.all(workers);
    console.log(`Year ${yr} finished: ${downloaded} downloaded/cached, ${failed} failed.`);
  }
}

main();

