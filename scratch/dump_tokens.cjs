const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function dump(file) {
  const buf = fs.readFileSync(file);
  const parser = new PDFParse({ data: buf });
  const t = await parser.getText();
  await parser.destroy();
  console.log(`=== FULL DUMP ${file} ===`);
  const lines = t.text.split('\n');
  lines.forEach((l, i) => console.log(`${i+1}: ${l}`));
}

dump('scratch/pdfs/2026/106LogTM4-pAUSDcuehAsGpbthfeTkgx3_REC-INV-44023-PROFORMA INVOICE_AYAT TECHNICAL SERVICES EST.pdf');
