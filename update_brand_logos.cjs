const fs = require('fs');
const path = require('path');
const { createCanvas, Path2D } = require('@napi-rs/canvas');

const upperPath = "M 30.76 29.23 L 43.46 44.11 C 48.84 50.12 50.78 53.96 63.15 52.49 C 60.77 49.15 50.55 38.37 49.32 36.31 L 50.12 35.53 C 50.55 35.19 50.55 35.24 50.98 34.93 C 51.57 34.52 52.10 34.08 52.58 33.64 C 61.67 25.36 60.20 11.75 51.22 4.82 C 45.46 0.38 39.29 1.03 30.96 1.03 C 22.83 1.03 14.63 1.12 6.51 1.01 C 7.09 2.24 10.50 6.22 11.54 7.15 C 18.68 13.51 29.45 8.74 41.46 10.56 C 47.14 11.42 51.52 17.71 48.22 24.20 C 44.94 30.64 38.68 28.48 30.76 29.23";
const lowerPath = "M 44.42 52.58 L 20.60 24.52 L 38.68 24.48 C 37.90 22.92 34.13 18.81 33.04 17.91 C 30.58 15.87 28.09 15.09 24.09 15.09 C 16.78 15.09 7.00 14.54 0.00 15.16 C 0.29 16.03 7.95 24.51 9.08 25.93 L 28.26 48.08 C 32.48 52.83 36.71 52.74 44.42 52.58";
const ayanPath  = "M 96.73 43.50 L 84.18 43.50 L 82.17 52.39 L 66.54 52.39 L 79.81 2.18 L 100.82 2.18 L 115.09 52.39 L 99.03 52.39 Z Z M 90.35 12.30 L 86.48 32.31 L 94.22 32.31 Z Z M 145.07 32.81 L 145.07 52.39 L 129.22 52.39 L 129.22 32.95 L 113.59 2.18 L 130.30 2.18 L 137.40 21.84 L 144.50 2.18 L 160.56 2.18 Z Z M 189.25 43.50 L 176.70 43.50 L 174.69 52.39 L 159.06 52.39 L 172.33 2.18 L 193.34 2.18 L 207.61 52.39 L 191.55 52.39 Z Z M 182.87 12.30 L 179.00 32.31 L 186.74 32.31 Z Z M 254.80 2.18 L 254.80 52.39 L 238.31 52.39 L 225.18 22.41 L 225.18 52.39 L 211.84 52.39 L 211.84 2.18 L 230.35 2.18 L 241.54 26.64 L 241.54 2.18 Z";

const symbolUpper = "M 20.75 19.67 L 28.79 29.09 C 32.19 32.89 33.42 35.32 41.25 34.39 C 39.74 32.28 33.28 25.46 32.49 24.15 L 33.00 23.66 C 33.27 23.44 33.27 23.48 33.55 23.28 C 33.92 23.02 34.25 22.74 34.56 22.46 C 40.31 17.23 39.38 8.61 33.70 4.23 C 30.05 1.42 26.15 1.83 20.88 1.83 C 15.73 1.83 10.55 1.89 5.41 1.82 C 5.77 2.60 7.93 5.11 8.59 5.70 C 13.11 9.73 19.92 6.70 27.52 7.86 C 31.11 8.41 33.89 12.38 31.80 16.49 C 29.73 20.56 25.76 19.20 20.75 19.67";
const symbolLower = "M 29.40 34.44 L 14.32 16.69 L 25.76 16.67 C 25.27 15.68 22.88 13.08 22.20 12.51 C 20.64 11.22 19.06 10.72 16.53 10.72 C 11.91 10.72 5.72 10.38 1.29 10.77 C 1.47 11.32 6.32 16.69 7.04 17.59 L 19.17 31.60 C 21.84 34.60 24.52 34.55 29.40 34.44";

const brands = [
  {
    id: 'rayan-energy',
    label: 'ENERGY',
    fontSpacing: '0.22em',
    textX: 140,
    // Symbol colors:
    upperLight: '#0d5c2c', // deep green
    lowerLight: '#10b981', // bright vibrant green
    upperDark: '#10b981',  // vibrant green or #ffffff
    lowerDark: '#22c55e',  // high-contrast bright emerald green
    themeColor: '#10b981'
  },
  {
    id: 'rayan-engineering',
    label: 'ENGINEERING',
    fontSpacing: '0.20em',
    textX: 108,
    // Symbol colors:
    upperLight: '#c2410c', // deep orange
    lowerLight: '#f97316', // bright vibrant orange
    upperDark: '#ea580c',  // deep bright orange
    lowerDark: '#f97316',  // bright electric orange
    themeColor: '#f97316'
  },
  {
    id: 'rayan-construction',
    label: 'CONSTRUCTION',
    fontSpacing: '0.18em',
    textX: 110,
    // Symbol colors:
    upperLight: '#b45309', // deep golden amber
    lowerLight: '#ffc000', // bright sunshine yellow
    upperDark: '#d97706',  // golden amber
    lowerDark: '#facc15',  // bright vivid yellow
    themeColor: '#facc15'
  }
];

function generateSvg({ upperColor, lowerColor, textColor, subColor, label, textX, fontSpacing }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80" width="100%" height="100%">
  <!-- Symbol: Division Styled Mark -->
  <g id="rayan-mark">
    <path d="${upperPath}" fill="${upperColor}" fill-rule="evenodd" />
    <path d="${lowerPath}" fill="${lowerColor}" fill-rule="evenodd" />
    <path d="${ayanPath}" fill="${textColor}" fill-rule="nonzero" />
  </g>
  <!-- Division Wordmark -->
  <text x="${textX}" y="77" font-family="'Outfit', 'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="20" letter-spacing="${fontSpacing}" fill="${subColor}">${label}</text>
</svg>`;
}

function generateSymbolSvg({ upperColor, lowerColor }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.0 37.0" width="44" height="44">
  <path d="${symbolUpper}" fill="${upperColor}" fill-rule="evenodd"/>
  <path d="${symbolLower}" fill="${lowerColor}" fill-rule="evenodd"/>
</svg>`;
}

// Generate PNG using Canvas
function renderPng(svgStr, width, height) {
  const scale = 4;
  const canvas = createCanvas(width * scale, height * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Parse paths and draw
  // Regex to extract paths:
  const pathRegex = /<path d="([^"]+)" fill="([^"]+)"/g;
  let match;
  while ((match = pathRegex.exec(svgStr)) !== null) {
    const d = match[1];
    const fill = match[2];
    ctx.fillStyle = fill;
    ctx.fill(new Path2D(d));
  }

  // Regex to extract text:
  const textMatch = /<text x="([^"]+)" y="([^"]+)" [^>]*fill="([^"]+)">([^<]+)<\/text>/.exec(svgStr);
  if (textMatch) {
    const x = parseFloat(textMatch[1]);
    const y = parseFloat(textMatch[2]);
    const fill = textMatch[3];
    const text = textMatch[4];
    ctx.fillStyle = fill;
    ctx.font = "bold 20px 'Outfit', 'Segoe UI', Arial, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText(text, x, y);
  }

  return canvas.toBuffer('image/png');
}

const dirs = [
  path.join(__dirname, 'assets/logos'),
  path.join(__dirname, 'public/assets/logos'),
  path.join(__dirname, 'assets'),
  path.join(__dirname, 'public/assets')
];
dirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

for (const b of brands) {
  // 1. Light variant (for white backgrounds)
  const lightSvg = generateSvg({
    upperColor: b.upperLight,
    lowerColor: b.lowerLight,
    textColor: '#002136',
    subColor: b.themeColor,
    label: b.label,
    textX: b.textX,
    fontSpacing: b.fontSpacing
  });

  // 2. Dark/White variant (for dark cards)
  const darkSvg = generateSvg({
    upperColor: b.upperDark,
    lowerColor: b.lowerDark,
    textColor: '#ffffff',
    subColor: b.themeColor,
    label: b.label,
    textX: b.textX,
    fontSpacing: b.fontSpacing
  });

  // Write SVGs to assets/logos and public/assets/logos
  fs.writeFileSync(path.join(__dirname, `assets/logos/${b.id}.svg`), lightSvg);
  fs.writeFileSync(path.join(__dirname, `public/assets/logos/${b.id}.svg`), lightSvg);
  fs.writeFileSync(path.join(__dirname, `assets/logos/${b.id}-white.svg`), darkSvg);
  fs.writeFileSync(path.join(__dirname, `public/assets/logos/${b.id}-white.svg`), darkSvg);

  // Render high-res PNGs
  const lightPng = renderPng(lightSvg, 260, 80);
  const darkPng = renderPng(darkSvg, 260, 80);
  fs.writeFileSync(path.join(__dirname, `assets/logos/${b.id}.png`), lightPng);
  fs.writeFileSync(path.join(__dirname, `public/assets/logos/${b.id}.png`), lightPng);
  fs.writeFileSync(path.join(__dirname, `assets/logos/${b.id}-white.png`), darkPng);
  fs.writeFileSync(path.join(__dirname, `public/assets/logos/${b.id}-white.png`), darkPng);

  // Generate standalone symbol SVG & PNG
  const symSvg = generateSymbolSvg({ upperColor: b.upperDark, lowerColor: b.lowerDark });
  const symName = b.id.replace('rayan-', 'rayan-symbol-');
  fs.writeFileSync(path.join(__dirname, `assets/${symName}.svg`), symSvg);
  fs.writeFileSync(path.join(__dirname, `public/assets/${symName}.svg`), symSvg);

  console.log(`✓ Processed ${b.id}: green/orange/yellow symbols generated!`);
}

console.log('All brand symbols and logos successfully updated.');
