const fs = require('fs');

async function main() {
  console.log("Fetching live database...");
  const res = await fetch('https://rayan-group.com/api/finance.php?action=get_state');
  const json = await res.json();
  const db = json.data;

  console.log("Current live receipts:", db.customer_receipts.length);

  // 1. Filter out the corrupted/conflicted rec-rv-44026
  db.customer_receipts = db.customer_receipts.filter(r => r.id !== 'rec-rv-44026' && r.id !== 'rec-mvvdpkym');

  // 2. Define the clean receipts
  const hiProfileReceipt = {
    id: 'rec-mvvdpkym',
    receipt_no: 'REC-RV-44001',
    customer_id: 'cust-hiprofile',
    customer_name: 'M/S HI PROFILE GENERAL MAINTENANCE LLC',
    contact_person: 'Operations Manager',
    email: 'info@hiprofile.ae',
    company_id: 'rayan-corp-uae',
    receipt_date: '2023-05-13',
    receipt_time: '09:38 AM',
    currency: 'AED',
    payment_mode: 'Cheque',
    payment_type: 'Corporate Account Payee Cheque',
    reference_no: '000025',
    cheque_no: '000025',
    cheque_date: '2023-05-13',
    bank_name: 'Abu Dhabi Commercial Bank (ADCB)',
    bank_branch: 'Dubai',
    cheque_status: 'Cleared & Verified',
    amount_received: '48300.00',
    allocated_amount: 48300,
    allocations: [
      {
        invoice_id: 'inv-rec-rg-inv-1005',
        invoice_no: 'REC-RG-INV-1005',
        amount_allocated: 48300,
        total_amount: 48300
      }
    ],
    ref_invoice_no: 'REC-RG-INV-1005',
    project_name: 'Mina Palace Laundry Refurbishment Work',
    received_by: 'RAYAN ENGINEERING & CONTRACTING L.L.C - S.P.C',
    receiver_sign: 'Arshad Alam Shaikh',
    notes: 'Full settlement towards Tax Invoice #REC-RG-1005 for PO No. 701102 Mina Palace Laundry Refurbishment Work',
    amount_in_words: 'Forty Eight Thousand Three Hundred AED Only.',
    customer_trn: '100532333000003',
    customer_address: 'Mussafah, Abu Dhabi, UAE',
    status: 'Cleared'
  };

  const hln867Receipt = {
    id: 'rec-mvxegfg5',
    receipt_no: 'REC-RV-44026',
    customer_id: 'cust-hln',
    customer_name: 'M/S HLN TECHNICAL SERVICES LLC',
    contact_person: 'Mr. Linto Linto',
    email: 'info@hlnaue.com',
    company_id: 'rayan-corp-uae',
    receipt_date: '2025-10-18',
    receipt_time: '10:00 AM',
    currency: 'AED',
    payment_mode: 'Cheque',
    payment_type: 'Corporate Account Payee Cheque',
    reference_no: '000867',
    cheque_no: '000867',
    cheque_date: '2025-10-18',
    bank_name: 'Abu Dhabi Commercial Bank (ADCB)',
    bank_branch: 'Dubai',
    cheque_status: 'Cleared & Verified',
    amount_received: '50000.00',
    allocated_amount: 35597.36,
    allocations: [
      {
        invoice_id: 'inv-rec-rg-inv-44006',
        invoice_no: 'REC-RG-INV-44006',
        amount_allocated: 35597.36
      }
    ],
    ref_invoice_no: 'REC-RG-INV-44006',
    project_name: 'Project # Max - Al Wahda Mall, Civil Works , Abu Dhabi',
    received_by: 'RAYAN ENGINEERING & CONTRACTING L.L.C - S.P.C',
    receiver_sign: 'Arshad Alam Shaikh',
    notes: 'Cheque #000867 final settlement balance towards REC-RG-INV-44006',
    amount_in_words: 'Fifty Thousand AED Only.',
    customer_trn: '100579896000003',
    customer_address: 'W/H 125, AL Habtoor ware house Al Qusais , Dubai',
    status: 'Cleared'
  };

  const mapoutReceipt = {
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
    allocations: [
      {
        invoice_id: 'inv-rec-rg-inv-44009',
        invoice_no: 'REC-RG-INV-44009',
        amount_allocated: 19668.60
      }
    ],
    ref_invoice_no: 'REC-RG-INV-44009',
    project_name: 'Project # Gateway Abu Dhabi Art, Manarat Al Saadiyat.',
    received_by: 'RAYAN ENGINEERING & CONTRACTING L.L.C - S.P.C',
    receiver_sign: 'Arshad Alam Shaikh',
    notes: 'Client Wire Settlement PHUB564873075 against REC-RG-INV-44009',
    amount_in_words: 'Nineteen Thousand Six Hundred Sixty Eight and Sixty Fils AED Only.',
    status: 'Cleared'
  };

  const hlnScrapReceipt = {
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
    allocations: [
      {
        invoice_id: 'inv-rec-rg-inv-44008',
        invoice_no: 'REC-RG-INV-44008',
        amount_allocated: 5000
      }
    ],
    ref_invoice_no: 'REC-RG-INV-44008',
    project_name: 'Project # Max - Al Wahda Mall, Civil Works , Abu Dhabi',
    received_by: 'RAYAN ENGINEERING & CONTRACTING L.L.C - S.P.C',
    receiver_sign: 'Arshad Alam Shaikh',
    notes: 'Scrap materials sold and payment received by the company against REC-RG-INV-44008',
    amount_in_words: 'Five Thousand AED Only.',
    customer_trn: '100579896000003',
    status: 'Cleared'
  };

  const mobinReceipt = {
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
    allocations: [
      {
        invoice_id: 'inv-rec-rg-inv-44003',
        invoice_no: 'REC-RG-INV-44003',
        amount_allocated: 9000
      }
    ],
    ref_invoice_no: 'REC-RG-INV-44003',
    project_name: 'Project # Al Lisaili Villa Dubai',
    received_by: 'RAYAN ENGINEERING & CONTRACTING L.L.C - S.P.C',
    receiver_sign: 'Arshad Alam Shaikh',
    notes: 'Payment via ADCB / Direct Wire against 50% Advance for Al Lisaili Villa Dubai (REC-RG-INV-44003)',
    amount_in_words: 'Nine Thousand AED Only.',
    status: 'Cleared'
  };

  db.customer_receipts.push(hiProfileReceipt, hln867Receipt, mapoutReceipt, hlnScrapReceipt, mobinReceipt);

  // Chronologically sort and sequentially renumber receipts
  db.customer_receipts.sort((a, b) => {
    const dA = a.receipt_date || a.date || '';
    const dB = b.receipt_date || b.date || '';
    if (dA !== dB) return dA.localeCompare(dB);
    return String(a.id || '').localeCompare(String(b.id || ''));
  });

  let seq = 44001;
  db.customer_receipts.forEach(rcp => {
    rcp.receipt_no = 'REC-RV-' + (seq++);
  });

  console.log("Updated customer receipts count:", db.customer_receipts.length);

  // 3. Ensure matching bank transfer for Mobin Villa
  if (!db.bank_transfers) db.bank_transfers = [];
  const hasMobinBt = db.bank_transfers.some(t => t.id === 'wire-rcp-mobin-villa-44003' || (t.reference_no === 'PHUB604192801'));
  if (!hasMobinBt) {
    db.bank_transfers.push({
      id: 'wire-rcp-mobin-villa-44003',
      receipt_id: 'rec-mobin-villa-44003',
      company_id: 'rayan-corp-uae',
      reference_no: 'PHUB604192801',
      date: '2026-01-14',
      source_bank: 'Abu Dhabi Commercial Bank (ADCB)',
      source_account_id: 'bank-adcb-uae',
      destination_bank: 'Abu Dhabi Commercial Bank (ADCB)',
      destination_account_id: 'bank-adcb-uae',
      counterparty: 'MS MOBIN AL LISAILI VILLA DUBAI',
      amount: '9000.00',
      currency: 'AED',
      type: 'inward',
      type_label: 'Inward Client Wire',
      purpose: 'Client Wire Settlement against REC-RG-INV-44003',
      status: 'Cleared',
      created_at: '2026-11-11 12:00:00',
      transfer_date: '2026-01-14',
      updated_at: '2026-11-11 12:00:00'
    });
  }

  // 4. Ensure matching cash voucher for scrap materials sold
  if (!db.cash_vouchers) db.cash_vouchers = [];
  const hasScrapCv = db.cash_vouchers.some(v => v.id === 'cv-rcp-hln-scrap-44008' || v.voucher_no === 'CV-RCP-44008');
  if (!hasScrapCv) {
    db.cash_vouchers.push({
      id: 'cv-rcp-hln-scrap-44008',
      receipt_id: 'rec-hln-44008-scrap',
      company_id: 'rayan-corp-uae',
      voucher_no: 'CV-RCP-44008',
      register_id: 'cash-mw5esv3w',
      register_name: 'RAYAN E-Wallets',
      custodian: 'Arshad Alam Shaikh',
      date: '2025-11-26',
      voucher_date: '2025-11-26',
      type: 'inflow',
      category: 'Customer Cash Collection',
      purpose: 'Customer collection against REC-RG-INV-44008 (Scrap materials sold)',
      payee: 'M/S HLN TECHNICAL SERVICES LLC',
      amount: '5000.00',
      currency: 'AED',
      status: 'Cleared',
      created_at: '2026-11-11 12:00:00',
      updated_at: '2026-11-11 12:00:00'
    });
  }

  // 5. Recalculate invoice balances
  function matchInv(inv, tNo, tId) {
    if (!inv) return false;
    const invNo = String(inv.invoice_no || '').trim().toUpperCase();
    const invId = String(inv.id || '').trim().toLowerCase();
    const targetNo = String(tNo || '').trim().toUpperCase();
    const targetId = String(tId || '').trim().toLowerCase();
    if (targetNo && (invNo === targetNo || invId === targetNo.toLowerCase())) return true;
    if (targetId && (invId === targetId || invNo.toLowerCase() === targetId)) return true;
    return false;
  }

  (db.invoices || []).forEach(inv => {
    const grand = Math.round((Number(inv.grand_total) || 0) * 100) / 100;
    let paid = 0;
    db.customer_receipts.forEach(rcp => {
      if (rcp.status === 'void') return;
      (rcp.allocations || []).forEach(alloc => {
        if (matchInv(inv, alloc.invoice_no, alloc.invoice_id) || (rcp.ref_invoice_no && matchInv(inv, rcp.ref_invoice_no))) {
          paid += Number(alloc.amount_allocated) || 0;
        }
      });
    });
    paid = Math.round(paid * 100) / 100;
    let credited = 0;
    (db.credit_notes || []).forEach(cn => {
      if (cn.status === 'void') return;
      if (matchInv(inv, cn.invoice_no || cn.ref_invoice_no, cn.invoice_id)) {
        credited += Number(cn.total_credit_amount) || 0;
      }
    });
    credited = Math.round(credited * 100) / 100;
    let bal = Math.max(0, Math.round((grand - paid - credited) * 100) / 100);
    if (bal <= 0.02) bal = 0;
    inv.amount_paid = paid;
    inv.amount_credited = credited;
    inv.balance_due = bal;
    inv.status = bal === 0 ? (credited > 0 && paid === 0 ? 'credited' : (paid > 0 ? 'paid' : 'unpaid')) : (paid > 0 ? 'partially_paid' : 'unpaid');

    if (inv.invoice_no === 'REC-RG-INV-44003') {
      inv.project_id = 'prj-mw4m1wc8';
      inv.project_name = 'Project # Al Lisaili Villa Dubai';
    }
  });

  // Verify target invoices
  const targetNos = ['REC-RG-INV-44006', 'REC-RG-INV-44008', 'REC-RG-INV-44009', 'REC-RG-INV-44003', 'REC-RG-INV-44011', 'REC-RG-INV-1005'];
  db.invoices.filter(i => targetNos.includes(i.invoice_no)).forEach(i => {
    console.log(i.invoice_no, 'Grand:', i.grand_total, 'Paid:', i.amount_paid, 'Due:', i.balance_due, 'Status:', i.status);
  });

  fs.writeFileSync('scratch/updated_db.json', JSON.stringify(db, null, 2), 'utf8');
  console.log("Wrote updated_db.json successfully!");
}

main();
