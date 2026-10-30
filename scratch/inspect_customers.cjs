const fs = require('fs');
const invs = JSON.parse(fs.readFileSync('scratch/extracted_invoices_v2.json', 'utf8'));

const custMap = new Map();
for (const inv of invs) {
  let name = inv.customerName.trim();
  // Normalize naming variations:
  // e.g. "Focus Tech LLC." -> "Focus Tech LLC"
  // "Top Rock Interiors LLC." -> "Top Rock Interiors LLC"
  // "Hayat Communication" -> "Hayat Communications"
  let normName = name.replace(/\.+$/, '').trim();
  if (/^HAYAT COMMUNICATION/i.test(normName)) normName = 'HAYAT COMMUNICATIONS LLC';
  if (/^FOCUS TECH/i.test(normName)) normName = 'FOCUS TECH LLC';
  if (/^TOP ROCK INTERIORS/i.test(normName)) normName = 'TOP ROCK INTERIORS LLC';
  if (/^MURGANTI|MORGANTI/i.test(normName)) normName = 'MORGANTI GCC l UAE';
  if (/^AL MULUKI/i.test(normName)) normName = 'AL MULUKI DECOR & GENERAL MAINTENANCE LLC';
  if (/^BUILDARA/i.test(normName)) normName = 'BUILDARA GENERAL CONTRACTING LLC';
  if (/^IROM BEAM/i.test(normName)) normName = 'IRON BEAM GENERAL CONTRACTING LLC';
  if (/^LUMINAR ENGINEERING/i.test(normName)) normName = 'LUMINAR ENGINEERING AND DECOR LLC OPC';
  if (/^SPECON DESIN|SPECON DESIGN/i.test(normName)) normName = 'SPECON DESIGN INTERIOR & EVENTS';
  if (/^MAGMA WASTE/i.test(normName)) normName = 'MAGMA WASTE TREATMENT SERVICES';
  if (/^WHITE CRESCENT/i.test(normName)) normName = 'WHITE CRESCENT GROUP';
  if (/^AYAT TECHNICAL/i.test(normName)) normName = 'AYAT TECHNICAL SERVICES EST';
  if (/^MAP OUT DECOR/i.test(normName)) normName = 'MAP OUT DECOR LLC';
  if (/^HLN TECHNICAL/i.test(normName)) normName = 'HLN TECHNICAL SERVICES LLC';
  if (/^PROFESSIONAL GULF/i.test(normName)) normName = 'PROFESSIONAL GULF GENERAL CONTRACTING';
  if (/^REMAYA/i.test(normName)) normName = 'REMAYA INTERNATIONAL COMPANY LLC';
  if (/^SOLID MARBLE/i.test(normName)) normName = 'SOLID MARBLE INDUSTRIES LLC';
  if (/^BROOK AND RIPPLES/i.test(normName)) normName = 'BROOK AND RIPPLES LLC';
  if (/^SADECO/i.test(normName)) normName = 'SADECO DECOR LLC';
  if (/^ZORAWAR/i.test(normName)) normName = 'ZORAWAR INTERIOR';

  const key = normName.toUpperCase();
  if (!custMap.has(key)) {
    custMap.set(key, {
      name: normName,
      trn: inv.customerTrn || '',
      email: inv.email || '',
      phone: inv.phone || '',
      address: inv.address || 'Abu Dhabi, UAE',
      invoiceCount: 0,
      totalInvoiced: 0
    });
  }
  const c = custMap.get(key);
  c.invoiceCount++;
  c.totalInvoiced += inv.grandTotal;
  if (!c.trn && inv.customerTrn) c.trn = inv.customerTrn;
  if (!c.email && inv.email) c.email = inv.email;
  if (!c.phone && inv.phone) c.phone = inv.phone;
  if (!c.address && inv.address) c.address = inv.address;
}

console.log('Total unique normalized customers:', custMap.size);
const sorted = [...custMap.values()].sort((a, b) => b.totalInvoiced - a.totalInvoiced);
sorted.forEach((v, idx) => {
  console.log(`${idx + 1}. ${v.name} | TRN: ${v.trn || 'N/A'} | Invoices: ${v.invoiceCount} | Total: AED ${v.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
});

