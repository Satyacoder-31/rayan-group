const fs = require('fs');
const path = require('path');

async function main() {
  const { DOMMatrix, Path2D, createCanvas } = await import('@napi-rs/canvas');
  globalThis.DOMMatrix = DOMMatrix;
  globalThis.Path2D = Path2D;
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');

  const standardFontDataUrl = path.resolve(__dirname, 'node_modules/pdfjs-dist/standard_fonts/') + '/';

  async function renderBrand(pdfName, scale = 4.0) {
    const filePath = path.join('c:/Users/krish/Downloads/', pdfName);
    const buf = fs.readFileSync(filePath);
    const doc = await pdfjs.getDocument({
      data: new Uint8Array(buf),
      standardFontDataUrl
    }).promise;
    const page = await doc.getPage(1);
    const vp = page.getViewport({ scale });
    const canvas = createCanvas(Math.round(vp.width), Math.round(vp.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    return canvas;
  }

  function processLogo(canvas, isAshaz = false) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // 1. Find bounding box of actual graphics
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        if (r < 248 || g < 248 || b < 248) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const pad = 24;
    minX = Math.max(0, minX - pad);
    maxX = Math.min(width - 1, maxX + pad);
    minY = Math.max(0, minY - pad);
    maxY = Math.min(height - 1, maxY + pad);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    const stdCanvas = createCanvas(cropW, cropH);
    const stdCtx = stdCanvas.getContext('2d');
    const stdData = stdCtx.createImageData(cropW, cropH);

    const whiteCanvas = createCanvas(cropW, cropH);
    const whiteCtx = whiteCanvas.getContext('2d');
    const whiteData = whiteCtx.createImageData(cropW, cropH);

    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        const srcIdx = ((y + minY) * width + (x + minX)) * 4;
        const destIdx = (y * cropW + x) * 4;

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];

        // Background check: pure or near white background
        if (r >= 253 && g >= 253 && b >= 253) {
          stdData.data[destIdx + 3] = 0;
          whiteData.data[destIdx + 3] = 0;
          continue;
        }

        // Anti-aliased feathering at the outer edge
        const minVal = Math.min(r, g, b);
        let alpha = 1.0;
        if (minVal > 240) {
          alpha = (255 - minVal) / 15.0;
        }
        alpha = Math.max(0, Math.min(1, alpha));
        const aByte = Math.round(alpha * 255);

        if (aByte === 0) {
          stdData.data[destIdx + 3] = 0;
          whiteData.data[destIdx + 3] = 0;
          continue;
        }

        // Un-premultiply color from white background for edge pixels
        const fgR = Math.max(0, Math.min(255, Math.round(255 - (255 - r) / Math.max(alpha, 0.1))));
        const fgG = Math.max(0, Math.min(255, Math.round(255 - (255 - g) / Math.max(alpha, 0.1))));
        const fgB = Math.max(0, Math.min(255, Math.round(255 - (255 - b) / Math.max(alpha, 0.1))));

        // 1. Standard variant (exact original colors from PDF)
        stdData.data[destIdx]     = fgR;
        stdData.data[destIdx + 1] = fgG;
        stdData.data[destIdx + 2] = fgB;
        stdData.data[destIdx + 3] = aByte;

        // 2. White variant (for dark cards)
        if (isAshaz) {
          const inIconRegion = x < cropW * 0.30;
          const isTeal = (fgG > 95 && fgB > 95 && fgR < 75);
          const isDarkText = (!inIconRegion && fgR < 115 && fgG < 115 && fgB < 115 && !isTeal);

          if (isDarkText) {
            // "RAYAN Group" becomes pure crisp white
            whiteData.data[destIdx]     = 255;
            whiteData.data[destIdx + 1] = 255;
            whiteData.data[destIdx + 2] = 255;
          } else if (isTeal) {
            whiteData.data[destIdx]     = fgR;
            whiteData.data[destIdx + 1] = fgG;
            whiteData.data[destIdx + 2] = fgB;
          } else {
            // Metallic gear & silver waves
            whiteData.data[destIdx]     = fgR;
            whiteData.data[destIdx + 1] = fgG;
            whiteData.data[destIdx + 2] = fgB;
          }
        } else {
          // Rayan Engineering / Energy / Properties
          const isColoredWing = (fgG > 90 && (fgG > fgR + 30 || fgB > fgR + 30));

          if (isColoredWing) {
            whiteData.data[destIdx]     = fgR;
            whiteData.data[destIdx + 1] = fgG;
            whiteData.data[destIdx + 2] = fgB;
          } else {
            // Turn dark navy "RAYAN" and charcoal wordmarks ("ENGINEERING", "ENERGY", "PROPERTIES") into pure white!
            whiteData.data[destIdx]     = 255;
            whiteData.data[destIdx + 1] = 255;
            whiteData.data[destIdx + 2] = 255;
          }
        }
        whiteData.data[destIdx + 3] = aByte;
      }
    }

    stdCtx.putImageData(stdData, 0, 0);
    whiteCtx.putImageData(whiteData, 0, 0);

    return { stdCanvas, whiteCanvas, cropW, cropH };
  }

  function makeSvg(pngBuffer, width, height) {
    const b64 = pngBuffer.toString('base64');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <image width="${width}" height="${height}" href="data:image/png;base64,${b64}" />
</svg>`;
  }

  const brands = [
    { id: 'rayan-energy', file: 'Logo-1.pdf', ashaz: false, themeColor: '#10b981' },
    { id: 'rayan-engineering', file: 'Logo-2 (1).pdf', ashaz: false, themeColor: '#00c7b3' },
    { id: 'rayan-properties', file: 'Logo-1 (1).pdf', ashaz: false, themeColor: '#248c91' },
    { id: 'ashaz-engineering', file: 'Logo-4.pdf', ashaz: true, themeColor: '#14949b' }
  ];

  const targetDirs = [
    path.join(__dirname, 'public/assets/logos'),
    path.join(__dirname, 'assets/logos'),
    path.join(__dirname, 'dist/assets/logos')
  ];

  targetDirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  for (const b of brands) {
    console.log(`Processing ${b.id} from ${b.file}...`);
    const raw = await renderBrand(b.file);
    const { stdCanvas, whiteCanvas, cropW, cropH } = processLogo(raw, b.ashaz);

    const stdBuffer = stdCanvas.toBuffer('image/png');
    const whiteBuffer = whiteCanvas.toBuffer('image/png');

    const stdSvg = makeSvg(stdBuffer, cropW, cropH);
    const whiteSvg = makeSvg(whiteBuffer, cropW, cropH);

    for (const d of targetDirs) {
      fs.writeFileSync(path.join(d, `${b.id}.png`), stdBuffer);
      fs.writeFileSync(path.join(d, `${b.id}-white.png`), whiteBuffer);
      fs.writeFileSync(path.join(d, `${b.id}.svg`), stdSvg);
      fs.writeFileSync(path.join(d, `${b.id}-white.svg`), whiteSvg);
    }

    console.log(`✓ Saved ${b.id}.png, .svg & white variants (${cropW}x${cropH})`);
  }

  // Generate brand symbols
  const symbolUpper = "M 20.75 19.67 L 28.79 29.09 C 32.19 32.89 33.42 35.32 41.25 34.39 C 39.74 32.28 33.28 25.46 32.49 24.15 L 33.00 23.66 C 33.27 23.44 33.27 23.48 33.55 23.28 C 33.92 23.02 34.25 22.74 34.56 22.46 C 40.31 17.23 39.38 8.61 33.70 4.23 C 30.05 1.42 26.15 1.83 20.88 1.83 C 15.73 1.83 10.55 1.89 5.41 1.82 C 5.77 2.60 7.93 5.11 8.59 5.70 C 13.11 9.73 19.92 6.70 27.52 7.86 C 31.11 8.41 33.89 12.38 31.80 16.49 C 29.73 20.56 25.76 19.20 20.75 19.67";
  const symbolLower = "M 29.40 34.44 L 14.32 16.69 L 25.76 16.67 C 25.27 15.68 22.88 13.08 22.20 12.51 C 20.64 11.22 19.06 10.72 16.53 10.72 C 11.91 10.72 5.72 10.38 1.29 10.77 C 1.47 11.32 6.32 16.69 7.04 17.59 L 19.17 31.60 C 21.84 34.60 24.52 34.55 29.40 34.44";

  function generateSymbolSvg({ upperColor, lowerColor }) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.0 37.0" width="44" height="44">
  <path d="${symbolUpper}" fill="${upperColor}" fill-rule="evenodd"/>
  <path d="${symbolLower}" fill="${lowerColor}" fill-rule="evenodd"/>
</svg>`;
  }

  const symDirs = [path.join(__dirname, 'assets'), path.join(__dirname, 'public/assets')];
  symDirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'rayan-symbol-energy.svg'), generateSymbolSvg({ upperColor: '#ffffff', lowerColor: '#10b981' }));
    fs.writeFileSync(path.join(d, 'rayan-symbol-engineering.svg'), generateSymbolSvg({ upperColor: '#ffffff', lowerColor: '#00c7b3' }));
    fs.writeFileSync(path.join(d, 'rayan-symbol-properties.svg'), generateSymbolSvg({ upperColor: '#ffffff', lowerColor: '#248c91' }));
  });

  console.log('All original subsidiary logos and symbols generated successfully!');
}

main().catch(console.error);
