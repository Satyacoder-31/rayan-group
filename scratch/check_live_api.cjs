async function checkApi() {
  const res = await fetch('https://rayan-group.com/api/finance.php?action=get_state');
  const json = await res.json();
  const db = json.data || {};
  const rcps = db.customer_receipts || [];
  const custs = db.customers || [];
  console.log('Live Receipts Count:', rcps.length);
  if (rcps.length > 0) {
    console.log('First 5 receipts:');
    rcps.slice(0, 5).forEach((r, i) => console.log(`  ${i + 1}. ${r.receipt_no.padEnd(14)} | ${r.receipt_date} | ${r.customer_name}`));
    console.log('Last 5 receipts:');
    rcps.slice(-5).forEach((r, i) => console.log(`  ${rcps.length - 5 + i + 1}. ${r.receipt_no.padEnd(14)} | ${r.receipt_date} | ${r.customer_name}`));
  }
  console.log('\nLive Customers Count:', custs.length);
  custs.forEach((c, i) => console.log(`  ${(i + 1).toString().padStart(2)}. ${(c.code || '').padEnd(14)} | ${c.name}`));
}
checkApi();