const fs = require('fs');

let js = fs.readFileSync('src/scripts/finance.js', 'utf8');

// 1. Version bump
js = js.replace("const CURRENT_DB_VERSION = 'v2026_clean_v68';", "const CURRENT_DB_VERSION = 'v2026_clean_v80';");

// 2. normalizeAllBalances addition for Top Rock TRN
const targetNorm = `    (this.db.credit_notes || []).forEach(cn => {
      if (CUST_ALIAS_MAP[cn.customer_id]) {
        cn.customer_id = CUST_ALIAS_MAP[cn.customer_id];
      }
      if (cn.credit_note_no && cn.credit_note_no.startsWith('CN-RG-')) {
        cn.credit_note_no = cn.credit_note_no.replace('CN-RG-', 'CN-REC-');
      }
    });`;

const replacementNorm = `    (this.db.credit_notes || []).forEach(cn => {
      if (CUST_ALIAS_MAP[cn.customer_id]) {
        cn.customer_id = CUST_ALIAS_MAP[cn.customer_id];
      }
      if (cn.credit_note_no && cn.credit_note_no.startsWith('CN-RG-')) {
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
    });`;

if (js.includes(targetNorm)) {
  js = js.replace(targetNorm, replacementNorm);
  console.log('normalizeAllBalances updated successfully');
} else {
  console.log('targetNorm not found');
}

// 3. Line 2935
const target2935 = `const trn = isTopRock ? '100360644700003' : (localInfo?.trn || cust?.trn || latestInv?.customer_trn || (isBuildara ? '105405525400003' : ''));`;
const replacement2935 = `const trn = localInfo?.trn || cust?.trn || latestInv?.customer_trn || (isTopRock ? '104571196000003' : (isBuildara ? '105405525400003' : ''));`;

if (js.includes(target2935)) {
  js = js.replace(target2935, replacement2935);
  console.log('Line 2935 replaced successfully');
} else {
  console.log('target2935 not found');
}

// 4. Line 5360 search filter
const targetFilter = `      const filtered = rawInvoices.filter(inv => {
        const matchQ = (inv.invoice_no || '').toLowerCase().includes(q) || (inv.customer_name || '').toLowerCase().includes(q);
        const matchSt = st === 'all' || inv.status === st;
        return matchQ && matchSt;
      });`;

const replacementFilter = `      const filtered = rawInvoices.filter(inv => {
        const trnText = (inv.customer_trn || inv.trn || inv.tax_number || '').toLowerCase();
        const matchQ = (inv.invoice_no || '').toLowerCase().includes(q) || 
                       (inv.customer_name || '').toLowerCase().includes(q) ||
                       trnText.includes(q);
        const matchSt = st === 'all' || inv.status === st;
        return matchQ && matchSt;
      });`;

if (js.includes(targetFilter)) {
  js = js.replace(targetFilter, replacementFilter);
  console.log('Search filter replaced successfully');
} else {
  console.log('targetFilter not found');
}

// 5. renderInvoiceRows TRN display
const targetRows = `        <td style="white-space:nowrap; min-width:200px;">
          <span class="fin-customer-cell">\${inv.customer_name || 'Valued Client'}</span>
          \${inv.customer_trn ? \`<div style="font-size:0.68rem; color:#38bdf8; font-weight:600;">TRN: \${inv.customer_trn}</div>\` : (inv.customer_gstin ? \`<div style="font-size:0.68rem; color:#94a3b8;">GSTIN: \${inv.customer_gstin}</div>\` : '')}
        </td>`;

const replacementRows = `        <td style="white-space:nowrap; min-width:200px;">
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

if (js.includes(targetRows)) {
  js = js.replace(targetRows, replacementRows);
  console.log('renderInvoiceRows replaced successfully');
} else {
  console.log('targetRows not found');
}

// 6. Line 12149
js = js.replace("clientTrn === '100360644700003'", "clientTrn === '104571196000003' || clientTrn === '100360644700003'");

// 7. Placeholders
js = js.replace('placeholder="100360644700003"', 'placeholder="104571196000003"');
js = js.replace('placeholder="e.g. 100360644700003"', 'placeholder="e.g. 104571196000003"');

// 8. Line 22464 and 22477
const targetTopRockPrint = `    const isTopRock = (inv.invoice_no === 'REC-RG-INV-44035') || (inv.id === 'inv-rec-rg-inv-44035') || (inv.invoice_no === 'REC-INV-44035');`;
const replacementTopRockPrint = `    const isTopRock = custClean.includes('top rock') || (inv.customer_id === 'cust-toprock') || (inv.invoice_no === 'REC-RG-INV-44035') || (inv.id === 'inv-rec-rg-inv-44035') || (inv.invoice_no === 'REC-INV-44035');`;

if (js.includes(targetTopRockPrint)) {
  js = js.replace(targetTopRockPrint, replacementTopRockPrint);
  console.log('TopRock print check replaced successfully');
} else {
  console.log('targetTopRockPrint not found');
}

const targetCustTrn = `const custTrn = inv.customer_trn || inv.trn || customer.trn || (isTopRock ? '100360644700003' : '');`;
const replacementCustTrn = `const custTrn = inv.customer_trn || inv.trn || customer.trn || (isTopRock ? '104571196000003' : '');`;

if (js.includes(targetCustTrn)) {
  js = js.replace(targetCustTrn, replacementCustTrn);
  console.log('custTrn print replaced successfully');
} else {
  console.log('targetCustTrn not found');
}

// 9. openEditInvoiceModal save logic
const targetEditSave = `      if (isIndia) {
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

const replacementEditSave = `      if (isIndia) {
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

if (js.includes(targetEditSave)) {
  js = js.replace(targetEditSave, replacementEditSave);
  console.log('Edit invoice save updated successfully');
} else {
  console.log('targetEditSave not found');
}

fs.writeFileSync('src/scripts/finance.js', js, 'utf8');
console.log('Saved to src/scripts/finance.js');
