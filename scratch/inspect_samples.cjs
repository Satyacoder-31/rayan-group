const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function testSample(dir, filename) {
  const filePath = path.join(dir, filename);
  const buf = fs.readFileSync(filePath);
  const p = new PDFParse({ data: buf });
  const text = await p.getText();
  await p.destroy();
  console.log(`\n================= ${filename} =================`);
  console.log(text.text.slice(0, 1500));
}

async function main() {
  const f2024 = fs.readdirSync('scratch/pdfs/2024')[0];
  const f2025 = fs.readdirSync('scratch/pdfs/2025')[0];
  const f2026 = fs.readdirSync('scratch/pdfs/2026')[0];

  await testSample('scratch/pdfs/2024', f2024);
  await testSample('scratch/pdfs/2025', f2025);
  await testSample('scratch/pdfs/2026', f2026);
}

main();

