const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function inspectScope(filePath) {
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buf });
  const t = await parser.getText();
  await parser.destroy();
  console.log('=== FILE:', path.basename(filePath), '===');
  const lines = t.text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find lines around Description or Project
  lines.forEach((l, idx) => {
    if (l.includes('Project') || l.includes('Description') || l.includes('Work') || l.includes('Fitting') || l.includes('Gypsum') || l.includes('Supply') || l.includes('Maintenance')) {
      console.log(`L${idx+1}: ${l}`);
    }
  });
}

async function main() {
  const files = [
    'scratch/pdfs/2024/15tSNChOHRdQ0l8AHKy8aQ1aROuIaRuoc_REC-INVOICE-1014_Al Muluki Décor _u0026 General Mentanance.pdf',
    'scratch/pdfs/2024/18kny6lYALF1khTtgxupezPrqc4kSZmxB_REC-INVOICE-1024_Al Muluki Décor _u0026 General Maintenance LLC. (1).pdf',
    'scratch/pdfs/2025/10GtoCPwhK768HFcfN4kiiyahNivWY8Pz_REC-INV-44006_HLN TECHNICAL SERVICES LLC.pdf',
    'scratch/pdfs/2026/10_0_I97EXpZoHlWGyAUuOkrdjxhPhwOl_REC-INV-44024-PROFORMA INVOICE_ZORAWAR INTERIOR.pdf',
    'scratch/pdfs/2026/16l_NzzgCCCq63u0V5JLdrlaZu4RLzvRI_REC-INV-44043-TAX INVOICE_TOP ROCK INTERIORS LLC_R1.pdf'
  ];

  for (const f of files) {
    if (fs.existsSync(f)) await inspectScope(f);
  }
}

main();
