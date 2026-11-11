const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/live_db_clean.json', 'utf8'));

console.log("Searching for PHUB564873075:");
const r1 = (data.customer_receipts || []).find(x => JSON.stringify(x).includes("PHUB564873075") || x.id === "rec-mvxemwxo");
console.log("Receipt found?:", r1);

console.log("\nSearching for all bank transfers with type inward:");
const inwardTransfers = (data.bank_transfers || []).filter(t => t.type === 'inward');
inwardTransfers.forEach(t => {
  const matchRcp = (data.customer_receipts || []).find(r => r.id === t.receipt_id || r.receipt_no === t.reference_no || (r.reference_no && r.reference_no === t.reference_no));
  console.log(`[Inward Transfer] Date: ${t.date} | Ref: ${t.reference_no} | Counterparty: ${t.counterparty} | Amount: ${t.amount} | Purpose: ${t.purpose} | Matched Receipt: ${matchRcp ? matchRcp.receipt_no : 'MISSING'}`);
});
