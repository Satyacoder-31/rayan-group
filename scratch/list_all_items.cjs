const fs = require('fs');

for (const yr of ['2024', '2025', '2026']) {
  const data = JSON.parse(fs.readFileSync(`scratch/ivd_${yr}.json`, 'utf8'));
  const items = [];
  function walk(obj) {
    if (!obj) return;
    if (Array.isArray(obj)) {
      if (typeof obj[0] === 'string' && typeof obj[2] === 'string' && typeof obj[3] === 'string') {
        items.push({ id: obj[0], name: obj[2], mime: obj[3] });
      }
      for (const it of obj) walk(it);
    }
  }
  walk(data);
  console.log(`\n=== Year ${yr}: ${items.length} items ===`);
  items.forEach((it, idx) => {
    console.log(`${idx + 1}. [${it.mime}] ${it.name} (id: ${it.id})`);
  });
}
