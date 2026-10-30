const fs = require('fs');

let js = fs.readFileSync('src/scripts/finance.js', 'utf8');

// 1. Bump version to v2026_clean_v17
js = js.replace("const CURRENT_DB_VERSION = 'v2026_clean_v16';", "const CURRENT_DB_VERSION = 'v2026_clean_v17';");

// 2. Fix scope of 44035 override so it only applies to 44035, not all Top Rock invoices
js = js.replace(
  "if (inv && ((inv.customer_name || '').includes('TOP ROCK') || (inv.customer_trn === '100360644700003') || (inv.invoice_no || '').includes('44035') || (inv.id || '').includes('44035')))",
  "if (inv && ((inv.invoice_no || '').includes('44035') || (inv.id || '').includes('44035')))"
);

js = js.replace(
  "if (r && ((r.customer_name || '').includes('TOP ROCK') || (r.receipt_no || '').includes('44025') || (r.receipt_no || '').includes('44035') || (r.ref_invoice_no || '').includes('44015') || (r.ref_invoice_no || '').includes('44035') || (r.id || '').includes('44025') || (r.id || '').includes('44035')))",
  "if (r && ((r.receipt_no || '').includes('44035') || (r.ref_invoice_no || '').includes('44035') || (r.id || '').includes('44035')))"
);

// 3. Fix isTopRock in renderInvoicePrint so other Top Rock invoices print their own invoice number
js = js.replace(
  "const isTopRock = custClean.includes('top rock') || (inv.customer_trn === '100360644700003') || (inv.trn === '100360644700003') || (inv.tax_number === '100360644700003') || (inv.invoice_no === 'REC-RG-INV-44035') || (inv.id === 'inv-rec-rg-inv-44035');",
  "const isTopRock = (inv.invoice_no === 'REC-RG-INV-44035') || (inv.id === 'inv-rec-rg-inv-44035') || (inv.invoice_no === 'REC-INV-44035');"
);

fs.writeFileSync('src/scripts/finance.js', js, 'utf8');
console.log('src/scripts/finance.js successfully updated!');
