const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function checkLineItems() {
  const allInvs = JSON.parse(fs.readFileSync('scratch/extracted_invoices_v2.json', 'utf8'));
  console.log(`Checking line items for ${allInvs.length} invoices...`);
  
  // Sample 5 invoices from each year
  for (const yr of ['2024', '2025', '2026']) {
    const yrInvs = allInvs.filter(i => i.year === yr).slice(0, 3);
    for (const inv of yrInvs) {
      console.log(`\n[${yr}] ${inv.invoiceNo} - ${inv.customerName}:`);
      console.log(`Scope: ${inv.scope}`);
      console.log(`Subtotal: ${inv.taxableSubtotal}, VAT: ${inv.vatTotal}, Total: ${inv.grandTotal}`);
    }
  }
}

checkLineItems();

