const fs = require('fs');
const html = fs.readFileSync('scratch/gdrive_page.html', 'utf8');

const match = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'([^']+)'/);
if (match) {
  const jsonStr = match[1].replace(/\\x([0-9a-fA-F]{2})/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
  fs.writeFileSync('scratch/drive_ivd.json', jsonStr, 'utf8');
  console.log('Decoded _DRIVE_ivd, length:', jsonStr.length);
  try {
    const data = JSON.parse(jsonStr);
    console.log('Parsed JSON root type:', Array.isArray(data) ? `Array[${data.length}]` : typeof data);
    // Find all items in this data structure
    function walk(obj) {
      if (!obj) return;
      if (Array.isArray(obj)) {
        // check if this looks like a file item
        // e.g. [id, [parent], name, mimeType]
        if (typeof obj[0] === 'string' && typeof obj[2] === 'string' && typeof obj[3] === 'string') {
          console.log('Item:', { id: obj[0], name: obj[2], mime: obj[3] });
        }
        for (const it of obj) walk(it);
      }
    }
    walk(data);
  } catch (e) {
    console.log('JSON parse error:', e.message);
  }
} else {
  console.log('window._DRIVE_ivd not found');
}
