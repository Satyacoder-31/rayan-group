const https = require('https');

const postData = JSON.stringify({
  action: 'create_bill',
  bill: {
    id: 'bill-test-' + Date.now(),
    bill_no: 'BILL-TEST-999',
    company_id: 'rayan-corp-uae',
    currency: 'AED',
    vendor_id: 'vend-8334',
    vendor_name: 'PINK CITY CERAMIC AND SANITARY TRADING LLC SPC',
    vendor_tax_regime: 'trn',
    vendor_trn: '100394857200003',
    vendor_invoice_no: 'INV-TEST-001',
    bill_date: '2026-10-27',
    due_date: '2026-11-26',
    payment_terms: 30,
    taxable_subtotal: 5000,
    tax_total: 250,
    grand_total: 5250,
    amount_paid: 0,
    balance_due: 5250,
    approval_status: 'approved',
    status: 'unpaid',
    line_items: [
      { name: 'Ceramic Tiles 60x60', qty: 100, uom: 'Sqm', unit_price: 50, taxable_amount: 5000, vat_rate: 5, tax_amount: 250, total_amount: 5250 }
    ],
    notes: 'Test purchase bill'
  }
});

const req = https.request('https://rayan-group.com/api/finance.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('Success:', parsed.success);
      console.log('Storage:', parsed.storage);
      console.log('Returned Bill:', parsed.bill?.bill_no);
      console.log('Total purchase_bills in returned data:', parsed.data?.purchase_bills?.length);
      console.log('First 3 purchase_bills:', parsed.data?.purchase_bills?.slice(0, 3)?.map(b => b.bill_no));
    } catch(e) {
      console.log('Raw output:', data.slice(0, 500));
    }
  });
});

req.on('error', (err) => console.error('Req error:', err.message));
req.write(postData);
req.end();
