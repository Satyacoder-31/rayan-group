const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/extracted_invoices.json', 'utf8'));

const missing = data.filter(d => !d.grandTotal);
console.log(`Found ${missing.length} missing grand total.`);

// Inspect 5 of them
missing.slice(0, 5).forEach((m, idx) => {
  console.log(`\n--- Example ${idx + 1}: ${m.rawFileName} ---`);
  console.log(m.rawTextSnippet);
});

