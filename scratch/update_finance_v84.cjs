const fs = require('fs');

let js = fs.readFileSync('src/scripts/finance.js', 'utf8');
const isCRLF = js.includes('\r\n');
if (isCRLF) {
  js = js.replace(/\r\n/g, '\n');
}

// 1. Bump version
js = js.replace("const CURRENT_DB_VERSION = 'v2026_clean_v83';", "const CURRENT_DB_VERSION = 'v2026_clean_v84';");

// 2. Add healing logic in normalizeAllBalances
const target = `    (this.db.projects || []).forEach(p => {
      if (p.id === 'prj-mvr35qo2' || p.code === 'PRJ-RG-MAX-2026' || (p.name || '').includes('Max - Al Wahda')) {
        p.contract_value = 388098.68;
        p.approved_budget = 388098.68;
      }
      if (p.id === 'prj-rec-3-hp-2024' || (p.name || '').toLowerCase().includes('hm villa')) {
        p.contract_value = 38990.00;
        p.approved_budget = 38990.00;
        if (p.code && p.code.toLowerCase().includes('hp')) {
          p.code = 'PRJ-REC-7-HMV-2024';
        }
      }
    });`;

const replacement = `    (this.db.projects || []).forEach(p => {
      if (p.id === 'prj-mvr35qo2' || p.code === 'PRJ-RG-MAX-2026' || (p.name || '').includes('Max - Al Wahda')) {
        p.contract_value = 388098.68;
        p.approved_budget = 388098.68;
      }
      if (p.id === 'prj-rec-3-hp-2024' || (p.name || '').toLowerCase().includes('hm villa')) {
        p.contract_value = 38990.00;
        p.approved_budget = 38990.00;
        if (p.code && p.code.toLowerCase().includes('hp')) {
          p.code = 'PRJ-REC-7-HMV-2024';
        }
      }
    });

    // Ensure accurate paid status for invoices REC-RG-INV-44006, 44008, 44009, 44003, and 1005
    const inv44006 = (this.db.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-44006');
    if (inv44006) {
      inv44006.amount_paid = 185597.36;
      inv44006.balance_due = 0.00;
      inv44006.status = 'paid';
    }
    const inv44008 = (this.db.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-44008');
    if (inv44008) {
      inv44008.amount_paid = 5000.00;
      inv44008.balance_due = 0.00;
      inv44008.status = 'paid';
    }
    const inv44009 = (this.db.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-44009');
    if (inv44009) {
      inv44009.amount_paid = 19668.60;
      inv44009.balance_due = 0.00;
      inv44009.status = 'paid';
    }
    const inv44003 = (this.db.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-44003');
    if (inv44003) {
      inv44003.amount_paid = 9000.00;
      inv44003.balance_due = 0.00;
      inv44003.status = 'paid';
      inv44003.project_id = 'prj-mw4m1wc8';
      inv44003.project_name = 'Project # Al Lisaili Villa Dubai';
    }
    const inv1005 = (this.db.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-1005');
    if (inv1005) {
      inv1005.amount_paid = 48300.00;
      inv1005.balance_due = 0.00;
      inv1005.status = 'paid';
    }

    // Ensure clean receipt vouchers exist in customer_receipts
    if (Array.isArray(this.db.customer_receipts)) {
      if (!this.db.customer_receipts.some(r => r.id === 'rec-mvxemwxo' || (r.reference_no === 'PHUB564873075'))) {
        this.db.customer_receipts.push({
          id: 'rec-mvxemwxo',
          receipt_no: 'REC-RV-44027',
          customer_id: 'cust-mapout',
          customer_name: 'M/S MAP OUT DECOR TECHNICAL SERVICES LLC',
          contact_person: 'Mr. Sujith Surendran',
          email: 'info@mapoutdecor.com',
          company_id: 'rayan-corp-uae',
          receipt_date: '2025-11-08',
          receipt_time: '10:00 AM',
          currency: 'AED',
          payment_mode: 'Online',
          payment_type: 'Online Bank Transfer',
          reference_no: 'PHUB564873075',
          bank_name: 'Abu Dhabi Commercial Bank (ADCB)',
          amount_received: '19668.60',
          allocated_amount: 19668.60,
          allocations: [{ invoice_id: 'inv-rec-rg-inv-44009', invoice_no: 'REC-RG-INV-44009', amount_allocated: 19668.60 }],
          ref_invoice_no: 'REC-RG-INV-44009',
          project_name: 'Project # Gateway Abu Dhabi Art, Manarat Al Saadiyat.',
          status: 'Cleared'
        });
      }
      if (!this.db.customer_receipts.some(r => r.id === 'rec-hln-44008-scrap' || (r.reference_no === 'CASH-SCRAP-44008'))) {
        this.db.customer_receipts.push({
          id: 'rec-hln-44008-scrap',
          receipt_no: 'REC-RV-44030',
          customer_id: 'cust-hln',
          customer_name: 'M/S HLN TECHNICAL SERVICES LLC',
          contact_person: 'Mr. Linto Linto',
          email: 'info@hlnaue.com',
          company_id: 'rayan-corp-uae',
          receipt_date: '2025-11-26',
          receipt_time: '11:00 AM',
          currency: 'AED',
          payment_mode: 'Cash',
          payment_type: 'Cash / Direct Settlement',
          reference_no: 'CASH-SCRAP-44008',
          bank_name: 'Corporate Treasury / Cash in Hand',
          amount_received: '5000.00',
          allocated_amount: 5000,
          allocations: [{ invoice_id: 'inv-rec-rg-inv-44008', invoice_no: 'REC-RG-INV-44008', amount_allocated: 5000 }],
          ref_invoice_no: 'REC-RG-INV-44008',
          project_name: 'Project # Max - Al Wahda Mall, Civil Works , Abu Dhabi',
          status: 'Cleared'
        });
      }
      if (!this.db.customer_receipts.some(r => r.id === 'rec-mobin-villa-44003' || (r.reference_no === 'PHUB604192801'))) {
        this.db.customer_receipts.push({
          id: 'rec-mobin-villa-44003',
          receipt_no: 'REC-RV-44032',
          customer_id: 'cust-mw5ab6by',
          customer_name: 'MS MOBIN AL LISAILI VILLA DUBAI',
          contact_person: 'Mr. Mohammad Mobin',
          email: 'mobin@gmail.com',
          company_id: 'rayan-corp-uae',
          receipt_date: '2026-01-14',
          receipt_time: '11:00 AM',
          currency: 'AED',
          payment_mode: 'Online',
          payment_type: 'Online Bank Transfer',
          reference_no: 'PHUB604192801',
          bank_name: 'Abu Dhabi Commercial Bank (ADCB)',
          amount_received: '9000.00',
          allocated_amount: 9000,
          allocations: [{ invoice_id: 'inv-rec-rg-inv-44003', invoice_no: 'REC-RG-INV-44003', amount_allocated: 9000 }],
          ref_invoice_no: 'REC-RG-INV-44003',
          project_name: 'Project # Al Lisaili Villa Dubai',
          status: 'Cleared'
        });
      }
      const r867 = this.db.customer_receipts.find(r => r.id === 'rec-mvxegfg5' || r.cheque_no === '000867');
      if (r867) {
        r867.customer_id = 'cust-hln';
        r867.customer_name = 'M/S HLN TECHNICAL SERVICES LLC';
        r867.allocations = [{ invoice_id: 'inv-rec-rg-inv-44006', invoice_no: 'REC-RG-INV-44006', amount_allocated: 35597.36 }];
        r867.ref_invoice_no = 'REC-RG-INV-44006';
      }
    }`;

if (!js.includes(target)) {
  console.error('Target not found in src/scripts/finance.js!');
  process.exit(1);
}

js = js.replace(target, replacement);
if (isCRLF) {
  js = js.replace(/\n/g, '\r\n');
}
fs.writeFileSync('src/scripts/finance.js', js, 'utf8');
console.log('Successfully updated src/scripts/finance.js to v84!');
