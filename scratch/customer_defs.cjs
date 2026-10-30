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

const customerDb = {
  'PROFESSIONAL GULF GENERAL CONTRACTING': {
    id: 'cust-pggc',
    code: 'CUST-PGGC',
    name: 'PROFESSIONAL GULF GENERAL CONTRACTING L.L.C',
    trn: '100511370700003',
    email: 'info@professionalgulf.com',
    phone: '+971 50 587 2866',
    billing_address: 'Mussafah M-36, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Mr. Arshad Alam Shaikh'
  },
  'HI PROFILE GENERAL MAINTENANCE': {
    id: 'cust-hiprofile',
    code: 'CUST-HIPROFILE',
    name: 'HI PROFILE GENERAL MAINTENANCE LLC',
    trn: '100532333000003',
    email: 'info@hiprofile.ae',
    phone: '+971 2 676 6755',
    billing_address: 'Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Operations Manager'
  },
  'MORGANTI GCC': {
    id: 'cust-morganti',
    code: 'CUST-MORGANTI',
    name: 'MORGANTI GCC l UAE',
    trn: '100355882000003',
    email: 'sdas@morganti.ae',
    phone: '+971 54 583 1836',
    billing_address: 'Al Reem Island, Abu Dhabi, UAE-53839',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Mr. Sanjeeb Das'
  },
  'HAYAT COMMUNICATIONS': {
    id: 'cust-hayat',
    code: 'CUST-HAYAT',
    name: 'HAYAT COMMUNICATIONS LLC',
    trn: '100462243500003',
    email: 'info@hayatcommunications.com',
    phone: '+971 4 368 8122',
    billing_address: 'Dubai Internet City, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Procurement Dept'
  },
  'FOCUS TECH': {
    id: 'cust-focustech',
    code: 'CUST-FOCUSTECH',
    name: 'FOCUS TECH LLC',
    trn: '100356041200003',
    email: 'projects@focustech.ae',
    phone: '+971 4 295 5660',
    billing_address: 'Al Garhoud, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Commercial Manager'
  },
  'ALI & SONS': {
    id: 'cust-alisons',
    code: 'CUST-ALISONS',
    name: 'ALI & SONS CO. LLC',
    trn: '100244272900003',
    email: 'contracting@ali-sons.com',
    phone: '+971 2 672 3900',
    billing_address: 'Ali & Sons Bldg, Zayed 2nd St, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Projects Division'
  },
  'AL MULUKI': {
    id: 'cust-almuluki',
    code: 'CUST-ALMULUKI',
    name: 'AL MULUKI DECOR & GENERAL MAINTENANCE LLC',
    trn: '100246275000003',
    email: 'almulukidecor@gmail.com',
    phone: '+971 50 123 4567',
    billing_address: 'Mussafah, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Mr. Tariq'
  },
  'HLN TECHNICAL SERVICES': {
    id: 'cust-hln',
    code: 'CUST-HLN',
    name: 'M/S HLN TECHNICAL SERVICES LLC',
    trn: '100579896000003',
    email: 'info@hlnaue.com',
    phone: '+971 4 220 0000',
    billing_address: 'Business Bay, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Mr. Shahzad'
  },
  'TOP ROCK INTERIORS': {
    id: 'cust-toprock',
    code: 'CUST-TOPROCK',
    name: 'M/S TOP ROCK INTERIORS LLC',
    trn: '100360644700003',
    email: 'procurementofficer@toprockinteriors.com',
    phone: '+971 50 213 1834',
    billing_address: 'TRI Office No.1, Al Qusais Ind Area 1, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Mr. Shahil'
  },
  'ALEX': {
    id: 'cust-alex',
    code: 'CUST-ALEX',
    name: 'MR. ALEX (PRIVATE RESIDENCE / VILLA)',
    trn: '',
    email: 'alex.villa@gmail.com',
    phone: '+971 50 987 6543',
    billing_address: 'Saadiyat Beach Villas, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Mr. Alex'
  },
  'MAP OUT DECOR': {
    id: 'cust-mapout',
    code: 'CUST-MAPOUT',
    name: 'M/S MAP OUT DECOR TECHNICAL SERVICES LLC',
    trn: '105029403000003',
    email: 'info@mapoutdecor.com',
    phone: '+971 4 888 1234',
    billing_address: 'Plot # 1480-0, Wavez Residence, Wadi Al Safa 2, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Mr. Sujith Surendran'
  },
  'REMAYA INTERNATIONAL': {
    id: 'cust-remaya',
    code: 'CUST-REMAYA',
    name: 'M/S REMAYA INTERNATIONAL COMPANY L.L.C',
    trn: '100567890100003',
    email: 'naushad.alam@remaya.ae',
    phone: '+971 2 600 0000',
    billing_address: 'Tawazun Industrial Park, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Mr. Naushad Alam'
  },
  'AYAT TECHNICAL SERVICES': {
    id: 'cust-ayat',
    code: 'CUST-AYAT',
    name: 'M/S AYAT TECHNICAL SERVICES EST.',
    trn: '104023339500003',
    email: 'engromer27@gmail.com',
    phone: '+971 55 123 4567',
    billing_address: 'Office No. 43-44, Bur Dubai, Al Fahidi, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Mr. Syed Omer Quadri'
  },
  'WHITE CRESCENT GROUP': {
    id: 'cust-whitecrescent',
    code: 'CUST-WHITECRESCENT',
    name: 'WHITE CRESCENT GROUP L.L.C',
    trn: '100456789000003',
    email: 'info@whitecrescent.ae',
    phone: '+971 2 444 5555',
    billing_address: 'Al Danah, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Procurement Officer'
  },
  'ZORAWAR INTERIOR': {
    id: 'cust-zorawar',
    code: 'CUST-ZORAWAR',
    name: 'ZORAWAR INTERIOR DECORATION LLC',
    trn: '100345678900003',
    email: 'info@zorawarinterior.com',
    phone: '+971 4 333 4444',
    billing_address: 'Al Quoz Industrial Area 3, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Mr. Zorawar Singh'
  },
  'BROOK AND RIPPLES': {
    id: 'cust-brook',
    code: 'CUST-BROOK',
    name: 'BROOK AND RIPPLES SWIMMING POOLS LLC',
    trn: '100234567800003',
    email: 'info@brookandripples.com',
    phone: '+971 4 288 7766',
    billing_address: 'Dubai Investments Park 1, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Operations Head'
  },
  'IRON BEAM': {
    id: 'cust-ironbeam',
    code: 'CUST-IRONBEAM',
    name: 'M/S IRON BEAM GENERAL CONTRACTING LLC',
    trn: '100589123400003',
    email: 'info@ironbeam.ae',
    phone: '+971 2 555 6677',
    billing_address: 'Mussafah M-14, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Engr. Tariq Mahmoud'
  },
  'SOLID MARBLE': {
    id: 'cust-solidmarble',
    code: 'CUST-SOLIDMARBLE',
    name: 'SOLID MARBLE INDUSTRIES LLC',
    trn: '100489123400003',
    email: 'sales@solidmarble.ae',
    phone: '+971 6 543 2100',
    billing_address: 'Industrial Area 13, Sharjah, UAE',
    place_of_supply: 'Sharjah, UAE',
    contact_person: 'Sales Manager'
  },
  'SPECON DESIGN': {
    id: 'cust-specon',
    code: 'CUST-SPECON',
    name: 'SPECON DESIGN INTERIOR & EVENTS LLC',
    trn: '100678901200003',
    email: 'info@specondesign.com',
    phone: '+971 4 345 6789',
    billing_address: 'Al Barsha 1, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Creative Director'
  },
  'MAGMA WASTE': {
    id: 'cust-magma',
    code: 'CUST-MAGMA',
    name: 'MAGMA WASTE TREATMENT SERVICES SOLE PROPRIETORSHIP LLC',
    trn: '100789012300003',
    email: 'operations@magmawaste.ae',
    phone: '+971 2 666 7788',
    billing_address: 'ICAD 1, Mussafah, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Mr. Faisal'
  },
  'LUMINAR ENGINEERING': {
    id: 'cust-luminar',
    code: 'CUST-LUMINAR',
    name: 'LUMINAR ENGINEERING AND DECOR LLC OPC',
    trn: '100890123400003',
    email: 'info@luminardecor.com',
    phone: '+971 4 456 7890',
    billing_address: 'Business Bay, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Managing Director'
  },
  'BUILDARA': {
    id: 'cust-buildara',
    code: 'CUST-BUILDARA',
    name: 'M/S BUILDARA GENERAL CONTRACTING LLC',
    trn: '105405525400003',
    email: 'buildaradevelopers@gmail.com',
    phone: '+971 2 555 0199',
    billing_address: 'Al Khalidiya, Abu Dhabi, UAE',
    place_of_supply: 'Abu Dhabi',
    contact_person: 'Engr. Hamad Al Mansoori'
  },
  'SADECO DECOR': {
    id: 'cust-sadeco',
    code: 'CUST-SADECO',
    name: 'SADECO DECOR LLC',
    trn: '100901234500003',
    email: 'info@sadecodecor.ae',
    phone: '+971 4 388 9900',
    billing_address: 'Al Quoz 4, Dubai, UAE',
    place_of_supply: 'Dubai, UAE',
    contact_person: 'Operations Manager'
  }
};

function resolveCustomer(fileName, custNameText) {
  let s = (fileName + ' ' + custNameText).replace(/_u0026/g, '&').toUpperCase();
  for (const [key, cust] of Object.entries(customerDb)) {
    if (s.includes(key)) return cust;
  }
  if (s.includes('MURGANTI')) return customerDb['MORGANTI GCC'];
  if (s.includes('IROM BEAM')) return customerDb['IRON BEAM'];
  if (s.includes('SPECON')) return customerDb['SPECON DESIGN'];
  if (s.includes('YATEEM')) return customerDb['BUILDARA'];
  if (s.includes('CHIPOTLE')) return customerDb['TOP ROCK INTERIORS'];
  if (s.includes('WHITE CRESCENT')) return customerDb['WHITE CRESCENT GROUP'];
  return null;
}

console.log('Customer definitions ready.');

