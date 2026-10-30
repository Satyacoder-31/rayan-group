const https = require('https');
const fs = require('fs');

const testFileId = '1Ph5PyJ6RAQ3rSo0iqEiF-zG06J7rdmap';
const url = `https://drive.usercontent.google.com/download?id=${testFileId}&export=download&authuser=0`;

function download(u, dest) {
  return new Promise((resolve, reject) => {
    https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      console.log('Status:', res.statusCode, 'Headers:', res.headers.location || res.headers['content-type']);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(dest);
          console.log('Downloaded size:', stats.size);
          resolve(true);
        });
      } else {
        let errBody = '';
        res.on('data', c => errBody += c);
        res.on('end', () => {
          console.log('Failed:', res.statusCode, errBody.slice(0, 300));
          resolve(false);
        });
      }
    }).on('error', reject);
  });
}

download(url, 'scratch/test_download.pdf');
