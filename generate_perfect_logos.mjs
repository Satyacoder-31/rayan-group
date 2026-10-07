import { DOMMatrix, Path2D, createCanvas } from '@napi-rs/canvas';
globalThis.DOMMatrix = DOMMatrix;
globalThis.Path2D = Path2D;
const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
import fs from 'fs';
import path from 'path';

const outDir = 'public/assets/logos';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const pdfList = [
  {
    id: 'rayan-engineering',
    path: 'c:/Users/krish/Downloads/Logo-2 (1).pdf',
    brandName: 'Rayan Engineering'
  },
  {
    id: 'rayan-energy',
    path: 'c:/Users/krish/Downloads/Logo-1.pdf',
    brandName: 'Rayan Energy'
  },
  {
    id: 'rayan-properties',
    path: 'c:/Users/krish/Downloads/Logo-1 (1).pdf',
    brandName: 'Rayan Properties'
  },
  {
    id: 'ashaz-engineering',
    path: 'c:/Users/krish/Downloads/Logo-2 (2).pdf',
    brandName: 'Ashaz Engineering (India)'
  }
];

function processImage(ctx, width, height, isAshaz = false) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Find bounding box of actual graphics (non-white)
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r < 242 || g < 242 || b < 242) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const pad = 16;
  minX = Math.max(0, minX - pad);
  maxX = Math.min(width, maxX + pad);
  minY = Math.max(0, minY - pad);
  maxY = Math.min(height, maxY + pad);

  const cropW = maxX - minX;
  const cropH = maxY - minY;

  // 2. Create Original Transparent Canvas
  const origCanvas = createCanvas(cropW, cropH);
  const origCtx = origCanvas.getContext('2d');
  const origData = origCtx.createImageData(cropW, cropH);

  // 3. Create White Contrast Variant Canvas (for dark cards)
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

      // Measure distance from pure white (255, 255, 255)
      const diff = 255 - Math.min(r, g, b);

      if (diff <= 8) {
        // Pure or near pure white -> fully transparent
        origData.data[destIdx + 3] = 0;
        whiteData.data[destIdx + 3] = 0;
      } else {
        const alpha = Math.min(255, Math.round((diff / 25) * 255));

        // Original variant
        origData.data[destIdx] = r;
        origData.data[destIdx + 1] = g;
        origData.data[destIdx + 2] = b;
        origData.data[destIdx + 3] = alpha;

        // White contrast variant:
        // Distinguish dark navy/gray text from vibrant colored elements:
        // Vibrant colors have high saturation or dominant green/blue (g > 110 or b > 110 while r < 80)
        const isVibrantColor = (g > 110 && g > r + 30) || (b > 130 && b > r + 30) || (g > 140 && r < 50);

        if (isAshaz) {
          // In Ashaz: gear is silver/gray (r ~ g ~ b between 130 and 230), wave is teal (g > 110, r < 50), text is navy
          const isWave = (g > 110 && r < 60);
          const isGear = (!isWave && Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > 110);
          const isText = (r < 70 && g < 70 && b < 80);

          if (isWave) {
            whiteData.data[destIdx] = r;
            whiteData.data[destIdx + 1] = g;
            whiteData.data[destIdx + 2] = b;
          } else if (isGear) {
            // Keep gear light metallic silver
            whiteData.data[destIdx] = Math.min(255, r + 40);
            whiteData.data[destIdx + 1] = Math.min(255, g + 40);
            whiteData.data[destIdx + 2] = Math.min(255, b + 40);
          } else if (isText) {
            // Dark navy "ASHAZ ENGINEERING" becomes crisp pure white
            whiteData.data[destIdx] = 255;
            whiteData.data[destIdx + 1] = 255;
            whiteData.data[destIdx + 2] = 255;
          } else {
            whiteData.data[destIdx] = r;
            whiteData.data[destIdx + 1] = g;
            whiteData.data[destIdx + 2] = b;
          }
        } else {
          // Rayan Engineering / Energy / Properties
          if (isVibrantColor) {
            // Preserve the signature teal / emerald / aquamarine wing!
            whiteData.data[destIdx] = r;
            whiteData.data[destIdx + 1] = g;
            whiteData.data[destIdx + 2] = b;
          } else {
            // Turn the dark navy "RAYAN" and wordmark ("ENGINEERING", "ENERGY", "PROPERTIES") into crisp pure white!
            whiteData.data[destIdx] = 255;
            whiteData.data[destIdx + 1] = 255;
            whiteData.data[destIdx + 2] = 255;
          }
        }
        whiteData.data[destIdx + 3] = alpha;
      }
    }
  }

  origCtx.putImageData(origData, 0, 0);
  whiteCtx.putImageData(whiteData, 0, 0);

  return { origCanvas, whiteCanvas, cropW, cropH };
}

for (const item of pdfList) {
  console.log(`Rendering ${item.brandName}...`);
  const buf = fs.readFileSync(item.path);
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 4.0 });

  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;

  const isAshaz = item.id === 'ashaz-engineering';
  const { origCanvas, whiteCanvas, cropW, cropH } = processImage(ctx, canvas.width, canvas.height, isAshaz);

  // Write PNGs
  const origPngPath = path.join(outDir, `${item.id}.png`);
  const whitePngPath = path.join(outDir, `${item.id}-white.png`);
  fs.writeFileSync(origPngPath, origCanvas.toBuffer('image/png'));
  fs.writeFileSync(whitePngPath, whiteCanvas.toBuffer('image/png'));

  console.log(`✓ Saved ${origPngPath} (${cropW}x${cropH})`);
  console.log(`✓ Saved ${whitePngPath} (${cropW}x${cropH})`);
}

// Also render Rayan Group Parent Holding logo to high-res PNG
const holdingSvgPath = path.join('public/assets/rayan-logo-white.svg');
console.log('Finished rendering subsidiary logos.');
