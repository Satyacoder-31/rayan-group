const fs = require('fs');

async function pushSync() {
  const db = JSON.parse(fs.readFileSync('scratch/updated_db.json', 'utf8'));

  console.log('Sending sync_full to https://rayan-group.com/api/finance.php ...');
  const res = await fetch('https://rayan-group.com/api/finance.php?action=sync_full', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_db: db,
      user_name: 'Arshad Alam Shaikh',
      user_role: 'super_admin',
      user_email: 'superadmin@rayangroup.com'
    })
  });

  const text = await res.text();
  console.log('HTTP Status:', res.status);
  try {
    const json = JSON.parse(text);
    console.log('Response success:', json.success, 'storage:', json.storage);
  } catch (e) {
    console.log('Raw response:', text.substring(0, 500));
  }
}

pushSync();

