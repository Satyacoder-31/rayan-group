const fs = require('fs');

const builtReceipts = JSON.parse(fs.readFileSync('scratch/built_receipts.json', 'utf8'));
console.log('Total in built_receipts.json:', builtReceipts.length);

// Sort chronologically ascending
const sorted = [...builtReceipts].sort((a, b) => {
  const dA = a.receipt_date || a.date || '';
  const dB = b.receipt_date || b.date || '';
  if (dA !== dB) return dA.localeCompare(dB);
  return String(a.id || '').localeCompare(String(b.id || ''));
});

let seq = 44001;
sorted.forEach((r, i) => {
  const newNo = `REC-RV-${seq++}`;
  if (i < 10 || i > sorted.length - 5) {
    console.log(`${i + 1}. Old: ${r.receipt_no.padEnd(25)} -> New: ${newNo} | Date: ${r.receipt_date} | ${r.customer_name}`);
  }
});
console.log(`Total renumbered: ${sorted.length}, Final sequence: REC-RV-${seq - 1}`);
