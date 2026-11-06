async function printCusts() {
  const res = await fetch('https://rayan-group.com/api/finance.php?action=get_state');
  const json = await res.json();
  const custs = json.data.customers || [];
  custs.forEach((c, i) => {
    console.log(`${i+1}. id: ${c.id.padEnd(20)} | current_code: ${(c.code || '').padEnd(15)} | ${c.name}`);
  });
}
printCusts();

