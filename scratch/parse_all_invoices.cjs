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
  // e.g. 17/Nov/2025 or 17/11/2025 or 26/02/2023 or 2026-03-19
  const months = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  // Check DD/MMM/YYYY or DD-MMM-YYYY
  let m = str.match(/(\d{1,2})[\/\-]([A-Za-z]{3})[\/\-](\d{4})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const mon = months[m[2].toLowerCase()] || '01';
    return `${m[3]}-${mon}-${day}`;
  }

  // Check DD/MM/YYYY or DD-MM-YYYY
  m = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const mon = m[2].padStart(2, '0');
    return `${m[3]}-${mon}-${day}`;
  }

  // Check YYYY-MM-DD
  m = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  }

  return str;
}

async function parseSinglePdf(filePath, yr) {
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buf });
  const doc = await parser.getText();
  await parser.destroy();
  const text = doc.text;

  // Extract from filename
  const baseName = path.basename(filePath);
  // remove file ID prefix if present: e.g. 1Ph5Py..._REC-INVOICE-1001_PROFESSIONAL GULF...
  const nameParts = baseName.replace(/^[a-zA-Z0-9_-]{25,}_/, '');

  let invoiceNo = '';
  const invNoMatch = text.match(/Invoice No\s*(?:\/\s*رﻗﻢ اﻟﻔﺎﺗﻮرة\s*)?[:\s]+(REC-[A-Z0-9_-]+)/i) ||
                     text.match(/Invoice No\s*[:\s]+([A-Z0-9_-]+)/i) ||
                     nameParts.match(/(REC-(?:INVOICE|INV)-[A-Z0-9_-]+)/i);
  if (invNoMatch) {
    invoiceNo = invNoMatch[1].trim();
  }

  // If invoiceNo begins with RECC-IN-, standardise or keep
  if (!invoiceNo) {
    const m = text.match(/(REC-INV-[0-9A-Z_-]+|RECC-IN-[0-9A-Z_-]+|REC-INVOICE-[0-9A-Z_-]+)/i);
    if (m) invoiceNo = m[1];
  }

  // Customer / Client Name
  let customerName = '';
  const clientMatch = text.match(/(?:Clint|Client)\s*[:\.]?\s*\n+([^\n]+)/i) ||
                      text.match(/COMPANY\s+([^\n]+)\n+([^\n]+Al Reem|[^\n]+Abu Dhabi|[^\n]+Dubai)/i) ||
                      nameParts.match(/REC-(?:INVOICE|INV)-[0-9A-Za-z_-]+[-_](?:TAX INVOICE_|PROFORMA INVOICE_|CANCELLED PROFORMA_)?([^\.]+)/i);

  if (text.includes('Clint:') || text.includes('Client:') || text.includes('Clint.')) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      if (/^(?:Clint|Client)[:\.]?$/i.test(lines[i])) {
        // Next non-empty line is likely customer
        if (lines[i+1]) {
          customerName = lines[i+1];
          break;
        }
      }
    }
  }

  if (!customerName && clientMatch) {
    customerName = clientMatch[1].trim();
  }

  // Fallback customer name from filename
  if (!customerName) {
    const fnMatch = nameParts.match(/(?:TAX INVOICE_|PROFORMA INVOICE_)?([A-Za-z0-9\s&.,'-]+)\.pdf$/i);
    if (fnMatch) customerName = fnMatch[1].trim();
  }

  // Clean customer name
  customerName = customerName.replace(/^(?:M\/S|M\/s\.|M\/s)\s*/i, '').trim();
  customerName = customerName.replace(/[-_]YATEEM OPTICIAN.*$/i, '').trim();
  customerName = customerName.replace(/[-_]Manpower Supply.*$/i, '').trim();
  customerName = customerName.replace(/[-_]Screed Work.*$/i, '').trim();
  customerName = customerName.replace(/[-_]Scrred work.*$/i, '').trim();
  customerName = customerName.replace(/\s+/g, ' ').trim();

  // TRN
  let customerTrn = '';
  // Customer TRN is usually after Clint or before email
  const trnMatches = [...text.matchAll(/(?:TRN|Tax ID)[:\s]*([0-9]{15})/gi)];
  // Rayan's own TRN is 103296633300003 or 104937380400003
  for (const tm of trnMatches) {
    if (tm[1] !== '103296633300003' && tm[1] !== '104937380400003') {
      customerTrn = tm[1];
      break;
    }
  }

  // Email
  let email = '';
  const emailMatches = [...text.matchAll(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6})/g)];
  for (const em of emailMatches) {
    if (!em[1].includes('rayan') && !em[1].includes('rayangroup')) {
      email = em[1];
      break;
    }
  }

  // Phone
  let phone = '';
  const phoneMatch = text.match(/(?:Phone|Mobile|Tel)[:\s]*([0-9\s/+-]{8,25})/i);
  if (phoneMatch) {
    phone = phoneMatch[1].trim();
  }

  // Contact Person
  let contactPerson = '';
  const cpMatch = text.match(/(?:Atten\.|Contact Person|Mr\.|Ms\.)[:\s]*([^\n]+)/i);
  if (cpMatch) {
    const val = cpMatch[1].trim();
    if (!val.includes('Arshad Alam') && val.length < 50) {
      contactPerson = val;
    }
  }
  if (!contactPerson) {
    const mrMatch = text.match(/(Mr\.\s*[A-Za-z\s]+|Engr?\.\s*[A-Za-z\s]+)/);
    if (mrMatch && !mrMatch[1].includes('Arshad Alam')) {
      contactPerson = mrMatch[1].trim();
    }
  }

  // Invoice Date
  let invoiceDate = '';
  const dateMatch = text.match(/Invoice Date\s*(?:\/\s*ﺗﺎرﯾﺦ اﻟﻔﺎﺗﻮرة\s*)?[:\s]*([0-9A-Za-z\/\-]+)/i) ||
                    text.match(/Date\s*(?:\/\s*ﺗﺎرﯾﺦ\s*)?[:\s]*([0-9A-Za-z\/\-]+)/i);
  if (dateMatch) {
    invoiceDate = parseDate(dateMatch[1]);
  }
  if (!invoiceDate) {
    // Default to year
    invoiceDate = `${yr}-01-15`;
  }

  // PO Reference
  let poRef = '';
  const poMatch = text.match(/PO NO\s*(?:\/\s*اﻣﺮ ﺷﺮاء)?[:\s]*([A-Za-z0-9\/\.\-_,\s]+)/i);
  if (poMatch) {
    poRef = poMatch[1].split('\n')[0].trim();
  }

  // Project Name / Scope
  let projectName = '';
  const projMatch = text.match(/Project[-:\s]*([^\n]+)/i) ||
                    text.match(/FOR PO NO[^\n]*\n+([^\n]+)/i);
  if (projMatch) {
    projectName = projMatch[1].trim();
  }

  // Subtotal, VAT, Grand Total, Received Amount
  let taxableSubtotal = 0;
  let vatTotal = 0;
  let grandTotal = 0;
  let amountPaid = 0;

  // Let's look for Subtotal / Vat / Grand Total / Total Amount in text
  const subMatch = text.match(/Sub-?Total[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i);
  if (subMatch) taxableSubtotal = cleanNumber(subMatch[1]);

  const vatMatch = text.match(/Vat\s*5%[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i) ||
                   text.match(/Vat5%[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i);
  if (vatMatch) vatTotal = cleanNumber(vatMatch[1]);

  const grandMatch = text.match(/Grand Total[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i) ||
                     text.match(/Gross Total[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i) ||
                     text.match(/Total\s*\(AED\)[:\s]*([0-9,]+\.[0-9]{2})/i);
  if (grandMatch) grandTotal = cleanNumber(grandMatch[1]);

  // Payment Received
  const recMatch = text.match(/(?:Payment Received|Recevied\s*Amount)[:\s]*(?:AED)?\s*([0-9,]+\.[0-9]{2})/i);
  if (recMatch) amountPaid = cleanNumber(recMatch[1]);

  // If subtotal is 0 or grand total is 0, let's search for numbers near TOTAL
  if (!grandTotal) {
    const starMatch = text.match(/\*([0-9,.]+)\*/);
    if (starMatch) grandTotal = cleanNumber(starMatch[1]);
  }

  if (!taxableSubtotal && grandTotal) {
    if (vatTotal) taxableSubtotal = grandTotal - vatTotal;
    else taxableSubtotal = Math.round((grandTotal / 1.05) * 100) / 100;
  }
  if (!vatTotal && grandTotal && taxableSubtotal) {
    vatTotal = Math.round((grandTotal - taxableSubtotal) * 100) / 100;
  }

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
    email,
    phone,
    contactPerson,
    invoiceDate,
    poRef,
    projectName,
    taxableSubtotal,
    vatTotal,
    grandTotal,
    amountPaid,
    balanceDue: Math.max(0, grandTotal - amountPaid),
    status,
    rawTextSnippet: text.slice(0, 500)
  };
}

async function runAll() {
  const allResults = [];
  for (const yr of ['2024', '2025', '2026']) {
    const dir = path.join('scratch', 'pdfs', yr);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
    for (const f of files) {
      try {
        const res = await parseSinglePdf(path.join(dir, f), yr);
        allResults.push(res);
      } catch (err) {
        console.error(`Error parsing ${f}:`, err.message);
      }
    }
  }

  fs.writeFileSync('scratch/extracted_invoices.json', JSON.stringify(allResults, null, 2), 'utf8');
  console.log(`Parsed total of ${allResults.length} invoices.`);
  
  // Quick summary
  const summary = {
    total: allResults.length,
    missingInvoiceNo: allResults.filter(r => !r.invoiceNo).length,
    missingCustomerName: allResults.filter(r => !r.customerName).length,
    missingGrandTotal: allResults.filter(r => !r.grandTotal).length,
    totalGrandTotal: allResults.reduce((sum, r) => sum + r.grandTotal, 0),
    totalPaid: allResults.reduce((sum, r) => sum + r.amountPaid, 0)
  };
  console.log('Summary:', summary);
}

runAll();
