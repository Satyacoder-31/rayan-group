async function checkRcp() {
  const res = await fetch('https://rayan-group.com/api/finance.php?action=get_state');
  const json = await res.json();
  const db = json.data || {};
  const r0 = (db.customer_receipts || [])[0];
  console.log(JSON.stringify(r0, null, 2));
}
checkRcp();
