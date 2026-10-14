const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\krish\\.gemini\\antigravity-ide\\brain\\a91bb553-81ce-414c-b98e-2580193f3d78';
const publicDir = 'c:\\Users\\krish\\Downloads\\rayan group\\public\\assets\\images\\projects';

// Find the latest generated images by prefix
function getLatestImage(prefix) {
  const files = fs.readdirSync(brainDir).filter(f => f.startsWith(prefix) && f.endsWith('.jpg'));
  files.sort((a, b) => {
    const statA = fs.statSync(path.join(brainDir, a));
    const statB = fs.statSync(path.join(brainDir, b));
    return statB.mtime - statA.mtime;
  });
  return files[0] ? path.join(brainDir, files[0]) : null;
}

const copyPlan = [
  // Arab Bank
  { src: getLatestImage('arab_bank_hero'), hero: 'arab-bank-abu-dhabi.jpg', gallery: 'arab-bank-abu-dhabi/img_1.jpg' },
  { src: getLatestImage('arab_bank_office'), gallery: 'arab-bank-abu-dhabi/img_2.jpg' },

  // Saadiyat Mamsha
  { src: getLatestImage('saadiyat_mamsha_hero'), hero: 'saadiyat-mamsha-residence.jpg', gallery: 'saadiyat-mamsha-residence/img_1.jpg' },
  { src: getLatestImage('saadiyat_washroom'), gallery: 'saadiyat-mamsha-residence/img_2.jpg' },

  // Cafe Bateel
  { src: getLatestImage('bateel_yas_hero'), hero: 'cafe-bateel-yas-mall.jpg', gallery: 'cafe-bateel-yas-mall/img_1.jpg' },
  { src: getLatestImage('bateel_lounge'), gallery: 'cafe-bateel-yas-mall/img_2.jpg' },

  // Monoprix
  { src: getLatestImage('monoprix_yas_hero'), hero: 'monoprix-yas-island.jpg', gallery: 'monoprix-yas-island/img_1.jpg' },

  // Abu Dhabi Art
  { src: getLatestImage('abudhabi_art_hero'), hero: 'abu-dhabi-art-manarat-saadiyat.jpg', gallery: 'abu-dhabi-art-manarat-saadiyat/img_1.jpg' },

  // Porsche Service Centre
  { src: getLatestImage('porsche_service_hero'), hero: 'porsche-service-centre-mussafah.jpg', gallery: 'porsche-service-centre-mussafah/img_1.jpg' }
];

for (const item of copyPlan) {
  if (!item.src || !fs.existsSync(item.src)) {
    console.error('Source not found:', item);
    continue;
  }
  if (item.hero) {
    const dest = path.join(publicDir, item.hero);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(item.src, dest);
    console.log('Copied hero:', dest);
  }
  if (item.gallery) {
    const dest = path.join(publicDir, item.gallery);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(item.src, dest);
    console.log('Copied gallery:', dest);
  }
}
console.log('Image organization completed!');
