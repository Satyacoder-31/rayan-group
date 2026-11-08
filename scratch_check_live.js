const https = require('https');

https.get('https://rayan-group.com/api/finance.php?action=get_state', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const vps = json.data?.vendor_payments || [];
      console.log('Total vendor payments in state:', vps.length);
      vps.forEach(v => console.log(v.id, v.voucher_no, v.amount_paid, v.vendor_name, JSON.stringify(v.allocations)));
      const pbs = json.data?.purchase_bills || [];
      console.log('Total purchase bills in state:', pbs.length);
      pbs.slice(0, 7).forEach(b => console.log(b.id, b.bill_no, b.amount_paid, b.balance_due, b.status));
    } catch(e) {
      console.error(e.message);
    }
  });
}).on('error', (e) => console.error(e.message));

