async function check() {
  const res = await fetch('https://rayan-group.com/billing/');
  const html = await res.text();
  const m = html.match(/billing-[^"']+\.js/);
  console.log('Live billing bundle:', m ? m[0] : 'not found');
}
check();
