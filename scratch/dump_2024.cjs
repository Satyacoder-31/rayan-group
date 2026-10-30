const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function dump(file) {
  const buf = fs.readFileSync(file);
  const parser = new PDFParse({ data: buf });
  const t = await parser.getText();
  await parser.destroy();
  console.log('=== FULL DUMP ' + file + ' ===');
  const lines = t.text.split('\n');
  lines.forEach((l, i) => console.log((i+1) + ': ' + l));
}

const f2024 = 'scratch/pdfs/2024/' + fs.readdirSync('scratch/pdfs/2024')[0];
dump(f2024);
