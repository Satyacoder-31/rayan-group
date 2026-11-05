const fs = require('fs');

const DEFAULT_CUSTOMER_SERIAL_MAP = {
  'cust-morganti': 'CUST-REC-1001',
  'cust-buildara': 'CUST-REC-1002',
  'cust-hln': 'CUST-REC-1003',
  'cust-ironbeam': 'CUST-REC-1004',
  'cust-sadeco': 'CUST-REC-1005',
  'cust-ayat': 'CUST-REC-1006',
  'cust-hiprofile': 'CUST-REC-1007',
  'cust-luminar': 'CUST-REC-1008',
  'cust-alex': 'CUST-REC-1009',
  'cust-magma': 'CUST-REC-1010',
  'cust-toprock': 'CUST-REC-1011',
  'cust-mapout': 'CUST-REC-1012',
  'cust-pggc': 'CUST-REC-1013',
  'cust-hayat': 'CUST-REC-1014',
  'cust-focustech': 'CUST-REC-1015',
  'cust-alisons': 'CUST-REC-1016',
  'cust-almuluki': 'CUST-REC-1017',
  'cust-remaya': 'CUST-REC-1018',
  'cust-whitecrescent': 'CUST-REC-1019',
  'cust-zorawar': 'CUST-REC-1020',
  'cust-brook': 'CUST-REC-1021',
  'cust-solidmarble': 'CUST-REC-1022',
  'cust-specon': 'CUST-REC-1023'
};

['data/finance-data.json', 'public/data/finance-data.json'].forEach(filepath => {
  if (fs.existsSync(filepath)) {
    const raw = fs.readFileSync(filepath, 'utf8');
    const db = JSON.parse(raw);
    let changed = 0;
    (db.customers || []).forEach(c => {
      if (DEFAULT_CUSTOMER_SERIAL_MAP[c.id]) {
        const target = DEFAULT_CUSTOMER_SERIAL_MAP[c.id];
        if (c.code !== target) {
          c.code = target;
          changed++;
        }
      }
    });
    fs.writeFileSync(filepath, JSON.stringify(db, null, 2), 'utf8');
    console.log(filepath, 'updated customer codes:', changed);
  }
});
