const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

function cleanNumber(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseDate(str) {
  if (!str) return null;
  str = str.trim();
  const months = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  let m = str.match(/(\d{1,2})[\/\-]([A-Za-z]{3})[\/\-](\d{4})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const mon = months[m[2].toLowerCase()] || '01';
    return `${m[3]}-${mon}-${day}`;
  }

  m = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const mon = m[2].padStart(2, '0');
    return `${m[3]}-${mon}-${day}`;
  }

  m = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  }

  return str;
}

async function parsePdf(filePath, yr) {
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buf });
  const doc = await parser.getText();
  await parser.destroy();
  const text = doc.text;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const baseName = path.basename(filePath);
  const nameParts = baseName.replace(/^[a-zA-Z0-9_-]{25,}_/, '');

  // 1. Invoice Number
  let invoiceNo = '';
  // Check filename first for official numbering like REC-INV-44023 or REC-INVOICE-1001
  const fnInvMatch = nameParts.match(/(REC-(?:INVOICE|INV)-[0-9A-Za-z_-]+)/i);
  if (fnInvMatch) {
    invoiceNo = fnInvMatch[1].replace(/[-_](?:TAX|PROFORMA|CANCELLED).*$/i, '').trim();
  }
  if (!invoiceNo) {
    const invNoMatch = text.match(/Invoice No\s*(?:\/\s*رﻗﻢ اﻟﻔﺎﺗﻮرة\s*)?[:\s]+(REC-[A-Z0-9_-]+)/i) ||
                       text.match(/Invoice No\s*[:\s]+([A-Z0-9_-]+)/i);
    if (invNoMatch) invoiceNo = invNoMatch[1].trim();
  }

  // 2. Customer Name
  let customerName = '';
  for (let i = 0; i < lines.length; i++) {
    if (/^(?:Clint|Client)[:\.]?$/i.test(lines[i])) {
      if (lines[i+1] && !lines[i+1].includes('Contact Person') && !lines[i+1].includes('TRN')) {
        customerName = lines[i+1];
        break;
      }
    }
  }

  if (!customerName) {
    // Check 2024 format: RAYAN ENGINEERING AND CONTRACTING COMPANY <CUSTOMER NAME>
    const compMatch = text.match(/RAYAN ENGINEERING AND CONTRACTING\s*(?:COMPANY)?\s+([A-Z0-9\s&.,'-]+?)\n/i);
    if (compMatch && compMatch[1] && compMatch[1].length > 3 && !compMatch[1].includes('Mussafah')) {
      customerName = compMatch[1].trim();
    }
  }

  // Fallback from filename
  if (!customerName) {
    let fnClient = nameParts.replace(/^REC-(?:INVOICE|INV)-[0-9A-Za-z_-]+[-_]/i, '')
                            .replace(/^(?:TAX INVOICE_|PROFORMA INVOICE_|CANCELLED PROFORMA_|TAX INVOICE-)/i, '')
                            .replace(/\.xlsx\.pdf$/i, '')
                            .replace(/\.pdf$/i, '');
    customerName = fnClient.trim();
  }

  // Clean customer name
  customerName = customerName.replace(/^(?:M\/S|M\/s\.|M\/s|M\/s:)\s*/i, '').trim();
  customerName = customerName.replace(/[-_]YATEEM OPTICIAN.*$/i, '').trim();
  customerName = customerName.replace(/[-_]Manpower Supply.*$/i, '').trim();
  customerName = customerName.replace(/[-_]Screed Work.*$/i, '').trim();
  customerName = customerName.replace(/[-_]Scrred work.*$/i, '').trim();
  customerName = customerName.replace(/[-_]Dalma Mall.*$/i, '').trim();
  customerName = customerName.replace(/[-_]Alain.*$/i, '').trim();
  customerName = customerName.replace(/\(1\)$/i, '').trim();
  customerName = customerName.replace(/\s+/g, ' ').trim();

  // 3. Customer Address
  let address = '';
  const addrMatch = text.match(/(?:Plot #|OFFICE NO\.|Al Reem Island|TRI Office|Mussafah|Dubai|Abu Dhabi)[^\n]+/i);
  if (addrMatch) {
    address = addrMatch[0].trim();
  }

  // 4. TRN
  let customerTrn = '';
  const trnMatches = [...text.matchAll(/(?:TRN|Tax ID)[:\s]*([0-9]{15})/gi)];
  for (const tm of trnMatches) {
    if (tm[1] !== '103296633300003' && tm[1] !== '104937380400003') {
      customerTrn = tm[1];
      break;
    }
  }

  // 5. Email
  let email = '';
  const emailMatches = [...text.matchAll(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6})/g)];
  for (const em of emailMatches) {
    if (!em[1].includes('rayan') && !em[1].includes('rayangroup')) {
      email = em[1];
      break;
    }
  }

  // 6. Phone
  let phone = '';
  const phoneMatch = text.match(/(?:Phone|Mobile|Tel)[:\s]*([0-9\s/+-]{8,30})/i);
  if (phoneMatch) {
    phone = phoneMatch[1].trim();
  }

  // 7. Contact Person
  let contactPerson = '';
  const cpMatch = text.match(/(?:Atten\.|Contact Person)[:\s]*([^\n]+)/i);
  if (cpMatch) {
    const val = cpMatch[1].trim();
    if (!val.includes('Arshad Alam') && val.length < 50) {
      contactPerson = val;
    }
  }
  if (!contactPerson) {
    const mrMatch = text.match(/(?:Mr\.|Ms\.|Engr?\.)\s*[A-Za-z\s]+/);
    if (mrMatch && !mrMatch[0].includes('Arshad Alam')) {
      contactPerson = mrMatch[0].trim();
    }
  }

  // 8. Invoice Date
  let invoiceDate = '';
  const dateMatch = text.match(/Invoice Date\s*(?:\/\s*ﺗﺎرﯾﺦ اﻟﻔﺎﺗﻮرة\s*)?[:\s]*([0-9A-Za-z\/\-]+)/i) ||
                    text.match(/Date\s*(?:\/\s*ﺗﺎرﯾﺦ\s*)?[:\s]*([0-9A-Za-z\/\-]+)/i);
  if (dateMatch) {
    invoiceDate = parseDate(dateMatch[1]);
  }
  if (!invoiceDate || invoiceDate.length < 8) {
    invoiceDate = `${yr}-06-15`;
  }

  // 9. PO Reference
  let poRef = '';
  const poMatch = text.match(/PO NO\s*(?:\/\s*اﻣﺮ ﺷﺮاء)?[:\s]*([A-Za-z0-9\/\.\-_,\s]+)/i);
  if (poMatch) {
    poRef = poMatch[1].split('\n')[0].trim();
  }

  // 10. Financial amounts: Subtotal, VAT, Grand Total, Received
  let taxableSubtotal = 0;
  let vatTotal = 0;
  let grandTotal = 0;
  let amountPaid = 0;

  // Let's check for explicit labeled lines
  const subMatch = text.match(/Sub-?Total[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i);
  if (subMatch) taxableSubtotal = cleanNumber(subMatch[1]);

  const vatMatch = text.match(/Vat\s*5%[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i) ||
                   text.match(/Vat5%[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i);
  if (vatMatch) vatTotal = cleanNumber(vatMatch[1]);

  const grandMatch = text.match(/Grand Total[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i) ||
                     text.match(/Gross Total[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i) ||
                     text.match(/Total\s*\(AED\)[:\s]*([0-9,]+\.[0-9]{2})/i);
  if (grandMatch) grandTotal = cleanNumber(grandMatch[1]);

  const recMatch = text.match(/(?:Payment Received|Recevied\s*Amount)[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i);
  if (recMatch) amountPaid = cleanNumber(recMatch[1]);

  // If grandTotal is still 0, look for line item row or 4-number cluster:
  // e.g. "1 % 0 0.00 46,797.14 2,339.86 AED 49,137.00"
  // e.g. "1 0.00 0.00 0.00 18,732.00 936.60 AED 19,668.60"
  if (!grandTotal) {
    const aedRowMatch = text.match(/AED\s*([0-9,]+\.[0-9]{2})/i);
    if (aedRowMatch) {
      grandTotal = cleanNumber(aedRowMatch[1]);
    }
  }

  if (!grandTotal) {
    const starMatch = text.match(/\*([0-9,.]+)\*/);
    if (starMatch) grandTotal = cleanNumber(starMatch[1]);
  }

  // Look for 4-line cluster after line item
  // e.g.
  // 15000 (payment received)
  // 46,797.14 (subtotal)
  // 2,339.86 (vat)
  // 34,137.00 (payable balance)
  for (let i = 0; i < lines.length - 4; i++) {
    if (lines[i].includes('AED ') && /^[0-9,.-]+$/.test(lines[i+1]) && /^[0-9,.-]+$/.test(lines[i+2]) && /^[0-9,.-]+$/.test(lines[i+3])) {
      const v0 = cleanNumber(lines[i+1]); // adjustment or payment
      const v1 = cleanNumber(lines[i+2]); // subtotal
      const v2 = cleanNumber(lines[i+3]); // vat
      const v3 = cleanNumber(lines[i+4]); // grand total or balance
      if (v1 > 0 && v2 > 0 && Math.abs((v1 * 0.05) - v2) < 2) {
        if (!taxableSubtotal) taxableSubtotal = v1;
        if (!vatTotal) vatTotal = v2;
        if (!grandTotal) grandTotal = Math.round((v1 + v2) * 100) / 100;
        if (v0 > 0 && !amountPaid) amountPaid = v0;
        break;
      }
    }
  }

  // If we have line with 24,190.48 12,095.24 604.76 0.00 12,700.00
  if (!grandTotal) {
    const numsInText = text.match(/([0-9,]+\.[0-9]{2})/g) || [];
    // If last number is grand total
    for (let i = 0; i < numsInText.length - 1; i++) {
      const sub = cleanNumber(numsInText[i]);
      const vat = cleanNumber(numsInText[i+1]);
      if (sub > 100 && vat > 0 && Math.abs((sub * 0.05) - vat) < 2) {
        taxableSubtotal = sub;
        vatTotal = vat;
        grandTotal = Math.round((sub + vat) * 100) / 100;
        break;
      }
    }
  }

  if (!taxableSubtotal && grandTotal) {
    if (vatTotal) taxableSubtotal = Math.round((grandTotal - vatTotal) * 100) / 100;
    else taxableSubtotal = Math.round((grandTotal / 1.05) * 100) / 100;
  }
  if (!vatTotal && grandTotal && taxableSubtotal) {
    vatTotal = Math.round((grandTotal - taxableSubtotal) * 100) / 100;
  }

  // Check if invoice text says "Payment Received" or "Payment is due" or "50% ADVANCE PAYMENT"
  if (text.includes('50% ADVANCE PAYMENT') && amountPaid === 0) {
    // Check if received column had 0.00 or amount
    const recZeroMatch = text.match(/Recevied\s*Amount[^\n]*\n+[^\n]*\n+[^\n]*\n+[^\n]*\n+[^\n]*\n+[^\n]*0\.00/i);
    if (!recZeroMatch && text.includes('Recevied\nAmount')) {
      // Check next few numbers
    }
  }

  // Description / Project Scope
  let scope = '';
  const projMatch = text.match(/Project[-:\s]*([^\n]+)/i);
  if (projMatch) scope = projMatch[1].trim();
  if (!scope) {
    const gypMatch = text.match(/([^\n]*(?:Gypsum|Ceiling|Painting|Fitout|HVAC|Maintenance|Demolition|Electrical|Plumbing|Marble|Masonry|Screed)[^\n]*)/i);
    if (gypMatch) scope = gypMatch[1].trim();
  }
  if (!scope) scope = 'General Contracting & Fitout Works';

  // Status
  let status = 'unpaid';
  if (amountPaid >= grandTotal && grandTotal > 0) status = 'paid';
  else if (amountPaid > 0 && amountPaid < grandTotal) status = 'partially_paid';

  return {
    rawFileName: baseName,
    year: yr,
    invoiceNo,
    customerName,
    customerTrn,
    address,
    email,
    phone,
    contactPerson,
    invoiceDate,
    poRef,
    scope,
    taxableSubtotal,
    vatTotal,
    grandTotal,
    amountPaid,
    balanceDue: Math.max(0, Math.round((grandTotal - amountPaid) * 100) / 100),
    status
  };
}

async function runAll() {
  const allResults = [];
  for (const yr of ['2024', '2025', '2026']) {
    const dir = path.join('scratch', 'pdfs', yr);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
    for (const f of files) {
      try {
        const res = await parsePdf(path.join(dir, f), yr);
        allResults.push(res);
      } catch (err) {
        console.error(`Error parsing ${f}:`, err.message);
      }
    }
  }

  fs.writeFileSync('scratch/extracted_invoices_v2.json', JSON.stringify(allResults, null, 2), 'utf8');
  console.log(`Parsed total of ${allResults.length} invoices.`);
  
  const missingGrandTotal = allResults.filter(r => !r.grandTotal);
  console.log(`Missing grand total count: ${missingGrandTotal.length}`);
  if (missingGrandTotal.length > 0) {
    console.log('First 5 missing:');
    missingGrandTotal.slice(0, 5).forEach(m => console.log(m.rawFileName));
  } else {
    console.log('ALL INVOICES HAVE VALID GRAND TOTALS!');
    console.log('Total Grand Total AED:', allResults.reduce((s, r) => s + r.grandTotal, 0).toLocaleString());
  }
}

runAll();

