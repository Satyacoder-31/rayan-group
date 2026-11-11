const fs = require('fs');
const d = JSON.parse(fs.readFileSync('data/finance-data.json', 'utf8'));
console.log('Invoices count:', (d.invoices || []).length);
console.log('Customer receipts count:', (d.customer_receipts || []).length);
console.log('Bank transfers count:', (d.bank_transfers || []).length);
