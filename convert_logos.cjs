const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function getStream(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  const s = buf.toString('latin1');
  const start = s.indexOf('stream\r\n') + 8;
  const end = s.indexOf('endstream', start);
  return zlib.inflateSync(buf.subarray(start, end)).toString('utf8');
}

function parsePaths(streamContent, height) {
  const lines = streamContent.split(/\r?\n/);
  let currentFill = '#002136';
  let pathCommands = [];
  const paths = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('scn') || line.includes('rg')) {
      const parts = line.split(/\s+/);
      const idx = parts.indexOf('scn') !== -1 ? parts.indexOf('scn') : parts.indexOf('rg');
      if (idx >= 3) {
        const r = Math.round(parseFloat(parts[idx - 3]) * 255);
        const g = Math.round(parseFloat(parts[idx - 2]) * 255);
        const b = Math.round(parseFloat(parts[idx - 1]) * 255);
        currentFill = `rgb(${r},${g},${b})`;
      }
    } else if (line.endsWith(' m')) {
      const p = line.split(/\s+/);
      pathCommands.push(`M ${parseFloat(p[0]).toFixed(2)} ${(height - parseFloat(p[1])).toFixed(2)}`);
    } else if (line.endsWith(' l')) {
      const p = line.split(/\s+/);
      pathCommands.push(`L ${parseFloat(p[0]).toFixed(2)} ${(height - parseFloat(p[1])).toFixed(2)}`);
    } else if (line.endsWith(' c')) {
      const p = line.split(/\s+/);
      pathCommands.push(`C ${parseFloat(p[0]).toFixed(2)} ${(height - parseFloat(p[1])).toFixed(2)} ${parseFloat(p[2]).toFixed(2)} ${(height - parseFloat(p[3])).toFixed(2)} ${parseFloat(p[4]).toFixed(2)} ${(height - parseFloat(p[5])).toFixed(2)}`);
    } else if (line === 'h') {
      pathCommands.push('Z');
    } else if (line === 'f' || line === 'f*' || line === 'W*' || line === 'W') {
      if (pathCommands.length > 0) {
        paths.push({
          d: pathCommands.join(' '),
          fill: currentFill,
          rule: line === 'f*' || line === 'W*' ? 'evenodd' : 'nonzero'
        });
        pathCommands = [];
      }
    }
  }
  return paths;
}

const outDir = path.join(__dirname, 'public/assets/logos');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1. RAYAN ENERGY
const energyStream = getStream('c:/Users/krish/Downloads/Logo-1.pdf');
const energyPaths = parsePaths(energyStream, 96.29);
const energySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 304 96" width="100%" height="100%">
  <!-- Rayan Energy Vector Logo -->
  <g id="rayan-mark">
    ${energyPaths.map(p => `<path d="${p.d}" fill="${p.fill}" fill-rule="${p.rule}" />`).join('\n    ')}
  </g>
  <!-- Sub-brand Wordmark -->
  <text x="178" y="93" font-family="'Outfit', 'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="28" letter-spacing="0.18em" fill="#2b3945">ENERGY</text>
</svg>`;
fs.writeFileSync(path.join(outDir, 'rayan-energy.svg'), energySvg);

// 2. RAYAN ENGINEERING
const engStream = getStream('c:/Users/krish/Downloads/Logo-2 (1).pdf');
const engPaths = parsePaths(engStream, 79.42);
const engSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 258 80" width="100%" height="100%">
  <!-- Rayan Engineering Vector Logo -->
  <g id="rayan-mark">
    ${engPaths.map(p => `<path d="${p.d}" fill="${p.fill}" fill-rule="${p.rule}" />`).join('\n    ')}
  </g>
  <!-- Sub-brand Wordmark -->
  <text x="108" y="77" font-family="'Outfit', 'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="20" letter-spacing="0.22em" fill="#2b3945">ENGINEERING</text>
</svg>`;
fs.writeFileSync(path.join(outDir, 'rayan-engineering.svg'), engSvg);

// 3. RAYAN PROPERTIES (Upcoming)
const propStream = getStream('c:/Users/krish/Downloads/Logo-1 (1).pdf');
const propPaths = parsePaths(propStream, 76.73);
const propSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 258 77" width="100%" height="100%">
  <!-- Rayan Properties Vector Logo -->
  <g id="rayan-mark">
    ${propPaths.map(p => `<path d="${p.d}" fill="${p.fill}" fill-rule="${p.rule}" />`).join('\n    ')}
  </g>
  <!-- Sub-brand Wordmark -->
  <text x="122" y="74.5" font-family="'Outfit', 'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="20" letter-spacing="0.25em" fill="#2b3945">PROPERTIES</text>
</svg>`;
fs.writeFileSync(path.join(outDir, 'rayan-properties.svg'), propSvg);

// 4. ASHAZ ENGINEERING (India)
const ashazStream = getStream('c:/Users/krish/Downloads/Logo-2 (2).pdf');
const ashazPaths = parsePaths(ashazStream, 184);

// Ashaz has gradient gear & teal waves + text
const ashazSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 184" width="100%" height="100%">
  <defs>
    <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0" />
      <stop offset="50%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#14949b" />
      <stop offset="100%" stop-color="#248c91" />
    </linearGradient>
    <linearGradient id="lightWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f1f5f9" />
      <stop offset="50%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
  </defs>

  <!-- Gear & Wave Vector Geometry -->
  <g id="ashaz-icon">
    ${ashazPaths.map((p, idx) => {
      let fill = p.fill;
      if (idx === 0 || idx === 1 || p.d.length > 500) {
        fill = 'url(#gearGrad)';
      }
      return `<path d="${p.d}" fill="${fill}" fill-rule="${p.rule}" opacity="0.95" />`;
    }).join('\n    ')}
  </g>

  <!-- Typography: Ashaz Engineering + Rayan Group -->
  <text x="120" y="160" text-anchor="middle" font-family="'Outfit', 'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="21" letter-spacing="0.08em" fill="#002136">ASHAZ ENGINEERING</text>
  <text x="195" y="179" text-anchor="end" font-family="'Outfit', 'Times New Roman', Georgia, serif" font-weight="500" font-size="13" letter-spacing="0.06em" fill="#14949b">RAYAN Group</text>
</svg>`;
fs.writeFileSync(path.join(outDir, 'ashaz-engineering.svg'), ashazSvg);

// 5. Also copy/create dark-mode/white variants for high-contrast viewing on dark backgrounds!
function makeWhiteVariant(svg, fileName) {
  // Replace dark fills with white / bright colors for dark backgrounds
  const darkVar = svg
    .replace(/fill="#2b3945"/g, 'fill="#ffffff"')
    .replace(/fill="#002136"/g, 'fill="#ffffff"')
    .replace(/fill="rgb\(0,33,54\)"/g, 'fill="#ffffff"')
    .replace(/fill="rgb\(0,36,56\)"/g, 'fill="#ffffff"')
    .replace(/fill="rgb\(5,36,56\)"/g, 'fill="#ffffff"');
  fs.writeFileSync(path.join(outDir, fileName), darkVar);
}

makeWhiteVariant(energySvg, 'rayan-energy-white.svg');
makeWhiteVariant(engSvg, 'rayan-engineering-white.svg');
makeWhiteVariant(propSvg, 'rayan-properties-white.svg');
makeWhiteVariant(ashazSvg, 'ashaz-engineering-white.svg');

console.log('Successfully generated all 4 subsidiary logos in SVG (standard & white variants)!');
