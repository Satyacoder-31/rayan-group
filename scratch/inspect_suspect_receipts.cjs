const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/live_db_clean.json', 'utf8'));

console.log("=== INSPECTING rec-rv-44026 ===");
const r26 = (data.customer_receipts || []).find(r => r.id === 'rec-rv-44026');
console.log(JSON.stringify(r26, null, 2));

console.log("\n=== INSPECTING wire-rcp-rec-mvxemwxo ===");
const wMap = (data.bank_transfers || []).find(w => w.id === 'wire-rcp-rec-mvxemwxo');
console.log(JSON.stringify(wMap, null, 2));

console.log("\n=== INSPECTING ALL RECEIPTS WITH 44026 or 44027 or 44028 ===");
const nearReceipts = (data.customer_receipts || []).filter(r => ['REC-RV-44025', 'REC-RV-44026', 'REC-RV-44027', 'REC-RV-44028', 'REC-RV-44029'].includes(r.receipt_no));
nearReceipts.forEach(r => console.log(JSON.stringify(r, null, 2)));
