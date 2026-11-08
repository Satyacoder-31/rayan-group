import https from 'https';

https.get('https://rayan-group.com/api/finance.php?action=get_state', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const d = JSON.parse(data).data;
    console.log('Sample BT:', JSON.stringify(d.bank_transfers[0], null, 2));
    console.log('Sample Cheque:', JSON.stringify(d.cheques[0], null, 2));
    console.log('Sample Cash Voucher:', JSON.stringify(d.cash_vouchers[0], null, 2));
  });
}).on('error', console.error);
