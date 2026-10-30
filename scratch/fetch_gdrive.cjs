const https = require('https');
const fs = require('fs');

const url = 'https://drive.google.com/drive/folders/15zW_PuyrUor8Dj93_H20Zcr3MqWCSZPg?usp=sharing';

function fetchUrl(targetUrl) {
  https.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
    console.log('Status:', res.statusCode);
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      return fetchUrl(res.headers.location);
    }
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Body length:', body.length);
      fs.writeFileSync('scratch/gdrive_page.html', body, 'utf8');
      
      // Look for data embedded in the page
      // Google Drive folders often embed file list in _initData or WIZ_global_data
      const matches = body.match(/\["([^"]+\.(pdf|xlsx|xls|csv|json|docx|png|jpg|jpeg))"/gi);
      console.log('File matches:', matches);

      // Search for any JSON arrays containing filenames or IDs
      const re = /\["([a-zA-Z0-9_-]{25,})","([^"]+)"/g;
      let m;
      const found = [];
      while ((m = re.exec(body)) !== null) {
        found.push({ id: m[1], name: m[2] });
      }
      console.log('Found items:', found.slice(0, 30));
    });
  }).on('error', err => console.error(err));
}

fetchUrl(url);
