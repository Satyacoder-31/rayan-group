const fs = require('fs');
const path = require('path');
const https = require('https');

const baseDir = path.join(__dirname, 'public', 'assets', 'images');
const categories = ['hero', 'business', 'projects', 'about', 'sustainability', 'investors', 'careers', 'news', 'media', 'team'];

for (const cat of categories) {
  fs.mkdirSync(path.join(baseDir, cat), { recursive: true });
}

// 1. Copy local high-res assets to organized folders
const copyMap = [
  // Hero
  ['public/assets/hero/hero-architectural-dubai.jpg', 'hero/hero-1-skyline.jpg'],
  ['public/assets/hero/acoustic-geometry.jpg', 'hero/hero-2-marine-engineering.jpg'],
  ['public/assets/hero/oil-gas-refinery.jpg', 'hero/hero-3-energy-refinery.jpg'],
  ['public/assets/hero/cta-construction-dusk.jpg', 'hero/hero-4-civil-construction.jpg'],
  ['public/assets/hero/india-heritage.jpg', 'hero/hero-5-india-hub.jpg'],
  ['public/assets/hero/uae-abu-dhabi.jpg', 'hero/hero-6-abu-dhabi.jpg'],

  // Business
  ['public/assets/services/01-building-construction.jpg', 'business/01-engineering.jpg'],
  ['public/assets/all/extracted_img_2.jpg', 'business/02-marine.jpg'],
  ['public/assets/services/03-civil-engineering.jpg', 'business/03-infrastructure.jpg'],
  ['public/assets/services/12-oil-and-gas.jpg', 'business/04-energy.jpg'],
  ['public/assets/services/09-mechanical-contracting.jpg', 'business/05-logistics.jpg'],
  ['public/assets/services/05-mep-services.jpg', 'business/06-mep.jpg'],
  ['public/assets/services/13-interior-design.jpg', 'business/07-interiors.jpg'],
  ['public/assets/services/14-car-parking-shades.jpg', 'business/08-tensile-shades.jpg'],

  // Projects
  ['public/assets/projects/al-wahda-mall.jpg', 'projects/al-wahda-mall.jpg'],
  ['public/assets/projects/ghantoot-palace.jpg', 'projects/ghantoot-palace.jpg'],
  ['public/assets/projects/yas-mall.jpg', 'projects/yas-mall.jpg'],
  ['public/assets/projects/porsche-service-center.jpg', 'projects/porsche-service-center.jpg'],
  ['public/assets/projects/jimi-mall.jpg', 'projects/jimi-mall.jpg'],
  ['public/assets/projects/serinia-tower.jpg', 'projects/serinia-tower.jpg'],
  ['public/assets/projects/al-quoz-office.jpg', 'projects/al-quoz-office.jpg'],
  ['public/assets/projects/mbz-villa.jpg', 'projects/mbz-villa.jpg'],

  // About
  ['public/assets/hero/engineers-inspection.jpg', 'about/overview.jpg'],
  ['public/assets/all/extracted_img_8.jpg', 'about/history.jpg'],
  ['public/assets/all/extracted_img_7.jpg', 'about/india-hub.jpg'],
  ['public/assets/hero/hero-architectural-dubai.jpg', 'about/vision.jpg'],

  // Sustainability
  ['public/assets/certificates/iso-14001-environmental.jpg', 'sustainability/iso-14001.jpg'],
  ['public/assets/certificates/iso-45001-health-safety.jpg', 'sustainability/iso-45001.jpg'],
  ['public/assets/certificates/iso-9001-quality.jpg', 'sustainability/iso-9001.jpg'],
  ['public/assets/all/extracted_img_43.jpg', 'sustainability/safety-site.jpg'],

  // Investors
  ['public/assets/hero/uae-abu-dhabi.jpg', 'investors/investor-hero.jpg'],
  ['public/assets/all/extracted_img_1.jpg', 'investors/governance.jpg'],

  // Careers & News
  ['public/assets/hero/engineers-inspection.jpg', 'careers/careers-hero.jpg'],
  ['public/assets/hero/cta-construction-dusk.jpg', 'news/news-hero.jpg']
];

for (const [src, destRel] of copyMap) {
  const fullSrc = path.join(__dirname, src);
  const fullDest = path.join(baseDir, destRel);
  if (fs.existsSync(fullSrc)) {
    fs.copyFileSync(fullSrc, fullDest);
  }
}

console.log('Copied local assets successfully.');

// 2. Download supplementary verified high-res imagery for NMDC-level corporate visual quality
const downloads = [
  { url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80', dest: 'business/marine-offshore-port.jpg' },
  { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80', dest: 'business/energy-refinery-complex.jpg' },
  { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80', dest: 'hero/hero-infrastructure-cranes.jpg' },
  { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80', dest: 'investors/corporate-financial-tower.jpg' },
  { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', dest: 'investors/boardroom-governance.jpg' },
  { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=80', dest: 'sustainability/renewable-energy.jpg' },
  { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80', dest: 'careers/engineering-team.jpg' },
  { url: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1600&q=80', dest: 'about/global-presence.jpg' }
];

function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const fullPath = path.join(baseDir, destPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 1000) {
      return resolve();
    }
    const file = fs.createWriteStream(fullPath);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        fs.unlink(fullPath, () => {});
        return resolve();
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', () => {
      fs.unlink(fullPath, () => {});
      resolve();
    });
  });
}

Promise.all(downloads.map(d => downloadFile(d.url, d.dest))).then(() => {
  console.log('All images organized and downloaded into public/assets/images/');
});
