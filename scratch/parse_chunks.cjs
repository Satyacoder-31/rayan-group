const fs = require('fs');
const html = fs.readFileSync('scratch/gdrive_page.html', 'utf8');

const regex = /AF_initDataChunkQueue\.push\(\{key:\s*['"]([^'"]+)['"],\s*(?:hash:\s*['"][^'"]*['"],\s*)?data:([\s\S]*?)(?:,\s*sideChannel:[\s\S]*?)?\}\);/g;
let m;
let count = 0;
while ((m = regex.exec(html)) !== null) {
  count++;
  console.log('Chunk key:', m[1], 'Length:', m[2].length);
  fs.writeFileSync(`scratch/chunk_${m[1]}.txt`, m[2], 'utf8');
}
console.log('Total chunks found:', count);
