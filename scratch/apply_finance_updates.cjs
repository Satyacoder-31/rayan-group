const fs = require('fs');
let js = fs.readFileSync('src/scripts/finance.js', 'utf8');
const isCRLF = js.includes('\r\n');
if (isCRLF) {
  js = js.replace(/\r\n/g, '\n');
}

// 1. NORM
const target1 = `      if (cn.credit_note_no && cn.credit_note_no.startsWith('CN-RG-')) {
        cn.credit_note_no = cn.credit_note_no.replace('CN-RG-', 'CN-REC-');
      }
    });

    // 0b2. Normalize`;

const rep1 = `      if (cn.credit_note_no && cn.credit_note_no.startsWith('CN-RG-')) {
        cn.credit_note_no = cn.credit_note_no.replace('CN-RG-', 'CN-REC-');
      }
    });

    // 0b3. Ensure Top Rock Interiors customer and all linked invoices have canonical TRN 104571196000003
    (this.db.customers || []).forEach(c => {
      if (c && (c.id === 'cust-toprock' || (c.name || '').toLowerCase().includes('top rock'))) {
        if (!c.trn || c.trn === '100360644700003') {
          c.trn = '104571196000003';
        }
      }
    });
    (this.db.invoices || []).forEach(inv => {
      if (inv && (inv.customer_id === 'cust-toprock' || (inv.customer_name || '').toLowerCase().includes('top rock'))) {
        if (!inv.customer_trn || inv.customer_trn === '100360644700003') {
          inv.customer_trn = '104571196000003';
          inv.trn = '104571196000003';
          inv.tax_number = '104571196000003';
        }
      }
    });

    // 0b2. Normalize`;

if (js.includes(target1)) {
  js = js.replace(target1, rep1);
  console.log('NORM updated');
} else {
  console.log('target1 NOT found');
}

// 2. FILTER
const target2 = `      const filtered = rawInvoices.filter(inv => {
        const matchQ = (inv.invoice_no || '').toLowerCase().includes(q) || (inv.customer_name || '').toLowerCase().includes(q);
        const matchSt = st === 'all' || inv.status === st;
        return matchQ && matchSt;
      });`;

const rep2 = `      const filtered = rawInvoices.filter(inv => {
        const trnText = (inv.customer_trn || inv.trn || inv.tax_number || '').toLowerCase();
        const matchQ = (inv.invoice_no || '').toLowerCase().includes(q) || 
                       (inv.customer_name || '').toLowerCase().includes(q) ||
                       trnText.includes(q);
        const matchSt = st === 'all' || inv.status === st;
        return matchQ && matchSt;
      });`;

if (js.includes(target2)) {
  js = js.replace(target2, rep2);
  console.log('FILTER updated');
} else {
  console.log('target2 NOT found');
}

// 3. ROWS
const target3 = `        <td style="white-space:nowrap; min-width:200px;">
          <span class="fin-customer-cell">\${inv.customer_name || 'Valued Client'}</span>
          \${inv.customer_trn ? \`<div style="font-size:0.68rem; color:#38bdf8; font-weight:600;">TRN: \${inv.customer_trn}</div>\` : (inv.customer_gstin ? \`<div style="font-size:0.68rem; color:#94a3b8;">GSTIN: \${inv.customer_gstin}</div>\` : '')}
        </td>`;

const rep3 = `        <td style="white-space:nowrap; min-width:200px;">
          <span class="fin-customer-cell">\${inv.customer_name || 'Valued Client'}</span>
          \${(() => {
            const cust = (this.db?.customers || []).find(c => (inv.customer_id && c.id === inv.customer_id) || (c.name && inv.customer_name && c.name.toLowerCase() === inv.customer_name.toLowerCase()));
            const isTopRock = (inv.customer_name || '').toLowerCase().includes('top rock') || inv.customer_id === 'cust-toprock';
            const trn = inv.customer_trn || inv.trn || inv.tax_number || cust?.trn || (isTopRock ? '104571196000003' : '');
            const gstin = inv.customer_gstin || cust?.gstin || '';
            if (trn) {
              return \`<div style="font-size:0.68rem; color:#38bdf8; font-weight:600;">TRN: \${trn}</div>\`;
            } else if (gstin) {
              return \`<div style="font-size:0.68rem; color:#94a3b8;">GSTIN: \${gstin}</div>\`;
            }
            return '';
          })()}
        </td>`;

if (js.includes(target3)) {
  js = js.replace(target3, rep3);
  console.log('ROWS updated');
} else {
  console.log('target3 NOT found');
}

// 4. EDIT SAVE
const target4 = `      if (isIndia) {
        inv.customer_gstin = newCustTax;
      } else {
        inv.customer_trn = newCustTax;
      }

      // Sync customer_id with normalized name
      const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const newCustNorm = norm(newCustName);
      const custMatch = (this.db?.customers || []).find(c => {
        const cn = norm(c.name);
        return cn && newCustNorm && (cn === newCustNorm || cn.includes(newCustNorm) || newCustNorm.includes(cn));
      });
      if (custMatch) {
        inv.customer_id = custMatch.id;
        if (custMatch.trn && !inv.customer_trn) inv.customer_trn = custMatch.trn;
      }`;

const rep4 = `      if (isIndia) {
        inv.customer_gstin = newCustTax;
      } else {
        inv.customer_trn = newCustTax;
        inv.trn = newCustTax;
        inv.tax_number = newCustTax;
      }

      // Sync customer_id with normalized name
      const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const newCustNorm = norm(newCustName);
      const custMatch = (this.db?.customers || []).find(c => {
        const cn = norm(c.name);
        return cn && newCustNorm && (cn === newCustNorm || cn.includes(newCustNorm) || newCustNorm.includes(cn));
      });
      if (custMatch) {
        inv.customer_id = custMatch.id;
        if (!inv.customer_trn && custMatch.trn) {
          inv.customer_trn = custMatch.trn;
          inv.trn = custMatch.trn;
          inv.tax_number = custMatch.trn;
        }
        if (newCustTax && (!custMatch.trn || custMatch.trn !== newCustTax)) {
          custMatch.trn = newCustTax;
        }
      }`;

if (js.includes(target4)) {
  js = js.replace(target4, rep4);
  console.log('EDIT SAVE updated');
} else {
  console.log('target4 NOT found');
}

if (isCRLF) {
  js = js.replace(/\n/g, '\r\n');
}

fs.writeFileSync('src/scripts/finance.js', js, 'utf8');
console.log('All changes applied successfully to src/scripts/finance.js');
