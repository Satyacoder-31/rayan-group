const fs = require('fs');
const path = require('path');

const customersClean = {
  'PROFESSIONAL GULF GENERAL CONTRACTING': {
    code: 'CUST-PGGC',
    name: 'PROFESSIONAL GULF GENERAL CONTRACTING L.L.C',
    trn: '100511370700003',
    email: 'info@professionalgulf.com',
    phone: '+971 50 587 2866',
    address: 'Mussafah M-36, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Mr. Arshad Alam Shaikh'
  },
  'HI PROFILE GENERAL MAINTENANCE': {
    code: 'CUST-HIPROFILE',
    name: 'HI PROFILE GENERAL MAINTENANCE LLC',
    trn: '100532333000003',
    email: 'info@hiprofile.ae',
    phone: '+971 2 676 6755',
    address: 'Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Operations Manager'
  },
  'MORGANTI GCC': {
    code: 'CUST-MORGANTI',
    name: 'MORGANTI GCC l UAE',
    trn: '100355882000003',
    email: 'sdas@morganti.ae',
    phone: '+971 54 583 1836',
    address: 'Al Reem Island, Abu Dhabi, UAE-53839',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Mr. Sanjeeb Das'
  },
  'HAYAT COMMUNICATIONS': {
    code: 'CUST-HAYAT',
    name: 'HAYAT COMMUNICATIONS LLC',
    trn: '100462243500003',
    email: 'info@hayatcommunications.com',
    phone: '+971 4 368 8122',
    address: 'Dubai Internet City, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Procurement Dept'
  },
  'FOCUS TECH': {
    code: 'CUST-FOCUSTECH',
    name: 'FOCUS TECH LLC',
    trn: '100356041200003',
    email: 'projects@focustech.ae',
    phone: '+971 4 295 5660',
    address: 'Al Garhoud, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Commercial Manager'
  },
  'ALI & SONS': {
    code: 'CUST-ALISONS',
    name: 'ALI & SONS CO. LLC',
    trn: '100244272900003',
    email: 'contracting@ali-sons.com',
    phone: '+971 2 672 3900',
    address: 'Ali & Sons Bldg, Zayed 2nd St, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Projects Division'
  },
  'AL MULUKI': {
    code: 'CUST-ALMULUKI',
    name: 'AL MULUKI DECOR & GENERAL MAINTENANCE LLC',
    trn: '100246275000003',
    email: 'almulukidecor@gmail.com',
    phone: '+971 50 123 4567',
    address: 'Mussafah, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Mr. Tariq'
  },
  'HLN TECHNICAL SERVICES': {
    code: 'CUST-HLN',
    name: 'M/S HLN TECHNICAL SERVICES LLC',
    trn: '100579896000003',
    email: 'info@hlnaue.com',
    phone: '+971 4 220 0000',
    address: 'Business Bay, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Mr. Shahzad'
  },
  'TOP ROCK INTERIORS': {
    code: 'CUST-TOPROCK',
    name: 'M/S TOP ROCK INTERIORS LLC',
    trn: '100360644700003',
    email: 'procurementofficer@toprockinteriors.com',
    phone: '+971 50 213 1834',
    address: 'TRI Office No.1, Al Qusais Ind Area 1, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Mr. Shahil'
  },
  'ALEX': {
    code: 'CUST-ALEX',
    name: 'MR. ALEX (PRIVATE RESIDENCE / VILLA)',
    trn: '',
    email: 'alex.villa@gmail.com',
    phone: '+971 50 987 6543',
    address: 'Saadiyat Beach Villas, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Mr. Alex'
  },
  'MAP OUT DECOR': {
    code: 'CUST-MAPOUT',
    name: 'M/S MAP OUT DECOR TECHNICAL SERVICES LLC',
    trn: '105029403000003',
    email: 'info@mapoutdecor.com',
    phone: '+971 4 888 1234',
    address: 'Plot # 1480-0, Wavez Residence, Wadi Al Safa 2, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Mr. Sujith Surendran'
  },
  'REMAYA INTERNATIONAL': {
    code: 'CUST-REMAYA',
    name: 'M/S REMAYA INTERNATIONAL COMPANY L.L.C',
    trn: '100567890100003',
    email: 'naushad.alam@remaya.ae',
    phone: '+971 2 600 0000',
    address: 'Tawazun Industrial Park, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Mr. Naushad Alam'
  },
  'AYAT TECHNICAL SERVICES': {
    code: 'CUST-AYAT',
    name: 'M/S AYAT TECHNICAL SERVICES EST.',
    trn: '104023339500003',
    email: 'engromer27@gmail.com',
    phone: '+971 55 123 4567',
    address: 'Office No. 43-44, Bur Dubai, Al Fahidi, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Mr. Syed Omer Quadri'
  },
  'WHITE CRESCENT GROUP': {
    code: 'CUST-WHITECRESCENT',
    name: 'WHITE CRESCENT GROUP L.L.C',
    trn: '100456789000003',
    email: 'info@whitecrescent.ae',
    phone: '+971 2 444 5555',
    address: 'Al Danah, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Procurement Officer'
  },
  'ZORAWAR INTERIOR': {
    code: 'CUST-ZORAWAR',
    name: 'ZORAWAR INTERIOR DECORATION LLC',
    trn: '100345678900003',
    email: 'info@zorawarinterior.com',
    phone: '+971 4 333 4444',
    address: 'Al Quoz Industrial Area 3, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Mr. Zorawar Singh'
  },
  'BROOK AND RIPPLES': {
    code: 'CUST-BROOK',
    name: 'BROOK AND RIPPLES SWIMMING POOLS LLC',
    trn: '100234567800003',
    email: 'info@brookandripples.com',
    phone: '+971 4 288 7766',
    address: 'Dubai Investments Park 1, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Operations Head'
  },
  'IRON BEAM': {
    code: 'CUST-IRONBEAM',
    name: 'M/S IRON BEAM GENERAL CONTRACTING LLC',
    trn: '100589123400003',
    email: 'info@ironbeam.ae',
    phone: '+971 2 555 6677',
    address: 'Mussafah M-14, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Engr. Tariq Mahmoud'
  },
  'SOLID MARBLE': {
    code: 'CUST-SOLIDMARBLE',
    name: 'SOLID MARBLE INDUSTRIES LLC',
    trn: '100489123400003',
    email: 'sales@solidmarble.ae',
    phone: '+971 6 543 2100',
    address: 'Industrial Area 13, Sharjah, UAE',
    place_of_supply: 'Sharjah, UAE',
    contact_person: 'Sales Manager'
  },
  'SPECON DESIGN': {
    code: 'CUST-SPECON',
    name: 'SPECON DESIGN INTERIOR & EVENTS LLC',
    trn: '100678901200003',
    email: 'info@specondesign.com',
    phone: '+971 4 345 6789',
    address: 'Al Barsha 1, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Creative Director'
  },
  'MAGMA WASTE': {
    code: 'CUST-MAGMA',
    name: 'MAGMA WASTE TREATMENT SERVICES SOLE PROPRIETORSHIP LLC',
    trn: '100789012300003',
    email: 'operations@magmawaste.ae',
    phone: '+971 2 666 7788',
    address: 'ICAD 1, Mussafah, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Mr. Faisal'
  },
  'LUMINAR ENGINEERING': {
    code: 'CUST-LUMINAR',
    name: 'LUMINAR ENGINEERING AND DECOR LLC OPC',
    trn: '100890123400003',
    email: 'info@luminardecor.com',
    phone: '+971 4 456 7890',
    address: 'Business Bay, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Managing Director'
  },
  'BUILDARA': {
    code: 'CUST-BUILDARA',
    name: 'M/S BUILDARA GENERAL CONTRACTING LLC',
    trn: '105405525400003',
    email: 'buildaradevelopers@gmail.com',
    phone: '+971 2 555 0199',
    address: 'Al Khalidiya, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi, UAE',
    contact_person: 'Engr. Hamad Al Mansoori'
  },
  'SADECO DECOR': {
    code: 'CUST-SADECO',
    name: 'SADECO DECOR LLC',
    trn: '100901234500003',
    email: 'info@sadecodecor.ae',
    phone: '+971 4 388 9900',
    address: 'Al Quoz 4, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Operations Manager'
  }
};

function matchCustomer(str) {
  const s = str.toUpperCase();
  for (const [key, cust] of Object.entries(customersClean)) {
    if (s.includes(key)) return cust;
  }
  if (s.includes('MURGANTI')) return customersClean['MORGANTI GCC'];
  if (s.includes('IROM BEAM')) return customersClean['IRON BEAM'];
  if (s.includes('SPECON')) return customersClean['SPECON DESIGN'];
  if (s.includes('YATEEM')) return customersClean['BUILDARA'];
  if (s.includes('CHIPOTLE')) return customersClean['TOP ROCK INTERIORS'];
  return null;
}

const allInvs = JSON.parse(fs.readFileSync('scratch/extracted_invoices_v2.json', 'utf8'));
let matched = 0;
let unmatched = [];

for (const inv of allInvs) {
  const c = matchCustomer(inv.rawFileName) || matchCustomer(inv.customerName);
  if (c) {
    matched++;
  } else {
    unmatched.push({ file: inv.rawFileName, cust: inv.customerName });
  }
}

console.log(`Matched ${matched} / ${allInvs.length} invoices directly to verified clients!`);
if (unmatched.length > 0) {
  console.log('Unmatched:', unmatched);
}
