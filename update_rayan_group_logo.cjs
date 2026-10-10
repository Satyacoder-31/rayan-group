const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

async function main() {
  const userUploadPath = 'C:\\Users\\krish\\.gemini\\antigravity-ide\\brain\\8da0ccaa-b6fd-434c-ac89-0a4f38455667\\.user_uploaded\\media_1791660681632.png';
  if (!fs.existsSync(userUploadPath)) {
    throw new Error('User uploaded master logo not found: ' + userUploadPath);
  }

  const rawImg = await loadImage(userUploadPath);
  const rawW = rawImg.width;
  const rawH = rawImg.height;

  // Draw raw image into offscreen canvas
  const rawCanvas = createCanvas(rawW, rawH);
  const rawCtx = rawCanvas.getContext('2d');
  rawCtx.drawImage(rawImg, 0, 0);
  const rawData = rawCtx.getImageData(0, 0, rawW, rawH).data;

  // 1. Precise bounding box of logo graphics
  let minX = rawW, maxX = 0, minY = rawH, maxY = 0;
  for (let y = 3; y < rawH - 3; y++) {
    for (let x = 3; x < rawW - 3; x++) {
      const idx = (y * rawW + x) * 4;
      const r = rawData[idx], g = rawData[idx + 1], b = rawData[idx + 2];
      // non-white detection
      if (r < 245 || g < 245 || b < 245) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log('Bounding Box of Logo:', { minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 });

  const padX = 20;
  const padY = 12;
  const cropW = (maxX - minX + 1);
  const cropH = (maxY - minY + 1);

  const outW = cropW + padX * 2;
  const outH = cropH + padY * 2;

  // 2. Prepare canvas for Light Logo (rayan-group.png)
  const lightCanvas = createCanvas(outW, outH);
  const lightCtx = lightCanvas.getContext('2d');
  const lightImgData = lightCtx.createImageData(outW, outH);
  const ld = lightImgData.data;

  // 3. Prepare canvas for Dark Logo (rayan-group-white.png)
  const darkCanvas = createCanvas(outW, outH);
  const darkCtx = darkCanvas.getContext('2d');
  const darkImgData = darkCtx.createImageData(outW, outH);
  const dd = darkImgData.data;

  for (let cy = 0; cy < cropH; cy++) {
    const srcY = minY + cy;
    const destY = padY + cy;

    for (let cx = 0; cx < cropW; cx++) {
      const srcX = minX + cx;
      const destX = padX + cx;

      const srcIdx = (srcY * rawW + srcX) * 4;
      const destIdx = (destY * outW + destX) * 4;

      const r = rawData[srcIdx];
      const g = rawData[srcIdx + 1];
      const b = rawData[srcIdx + 2];

      // Pure background check
      if (r >= 252 && g >= 252 && b >= 252) {
        // Transparent
        continue;
      }

      // Check if pixel is part of the cyan leg
      // In original logo, cyan leg is at x < 200, y between 60 and 212
      // Characteristic: blue > red + 30 and green > red + 15
      const isCyan = (b > r + 30 && g > r + 15 && srcX < minX + 220 && srcY < minY + 215);

      // Compute Alpha by de-matting from white (255)
      // Minimum channel gives darkness from 255
      const darkness = 255 - Math.min(r, g, b);
      let alpha = darkness / 255;
      // Slight contrast curve to eliminate faint grey fringing while preserving anti-aliasing
      alpha = Math.min(1, Math.pow(alpha, 0.82) * 1.06);

      const aByte = Math.round(alpha * 255);
      if (aByte <= 2) continue;

      // --- LIGHT THEME (rayan-group.png) ---
      // De-multiply from white background:
      const fgR = Math.max(0, Math.min(255, Math.round(255 - (255 - r) / Math.max(alpha, 0.1))));
      const fgG = Math.max(0, Math.min(255, Math.round(255 - (255 - g) / Math.max(alpha, 0.1))));
      const fgB = Math.max(0, Math.min(255, Math.round(255 - (255 - b) / Math.max(alpha, 0.1))));

      ld[destIdx]     = fgR;
      ld[destIdx + 1] = fgG;
      ld[destIdx + 2] = fgB;
      ld[destIdx + 3] = aByte;

      // --- DARK THEME (rayan-group-white.png) ---
      if (isCyan) {
        // Keep the authentic vivid cyan / cerulean blue: #008ac3 -> vibrant #009ae8
        dd[destIdx]     = 0;
        dd[destIdx + 1] = Math.min(255, Math.round(fgG * 1.06));
        dd[destIdx + 2] = Math.min(255, Math.round(fgB * 1.12));
        dd[destIdx + 3] = aByte;
      } else {
        // Navy 'RAYAN' & charcoal 'GROUP' -> crisp pure WHITE on dark theme!
        dd[destIdx]     = 255;
        dd[destIdx + 1] = 255;
        dd[destIdx + 2] = 255;
        dd[destIdx + 3] = aByte;
      }
    }
  }

  lightCtx.putImageData(lightImgData, 0, 0);
  darkCtx.putImageData(darkImgData, 0, 0);

  const lightBuffer = lightCanvas.toBuffer('image/png');
  const darkBuffer = darkCanvas.toBuffer('image/png');

  // Destination directories
  const targetDirs = [
    path.join(__dirname, 'assets/logos'),
    path.join(__dirname, 'public/assets/logos'),
    path.join(__dirname, 'dist/assets/logos')
  ];

  targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'rayan-group.png'), lightBuffer);
    fs.writeFileSync(path.join(dir, 'rayan-group-white.png'), darkBuffer);
    console.log(`Saved logos to ${dir}`);
  });

  // Also update rayan-symbol.svg with official cyan: #008ac3
  const symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.0 37.0" width="44" height="44">
  <path d="M 20.75 19.67 L 28.79 29.09 C 32.19 32.89 33.42 35.32 41.25 34.39 C 39.74 32.28 33.28 25.46 32.49 24.15 L 33.00 23.66 C 33.27 23.44 33.27 23.48 33.55 23.28 C 33.92 23.02 34.25 22.74 34.56 22.46 C 40.31 17.23 39.38 8.61 33.70 4.23 C 30.05 1.42 26.15 1.83 20.88 1.83 C 15.73 1.83 10.55 1.89 5.41 1.82 C 5.77 2.60 7.93 5.11 8.59 5.70 C 13.11 9.73 19.92 6.70 27.52 7.86 C 31.11 8.41 33.89 12.38 31.80 16.49 C 29.73 20.56 25.76 19.20 20.75 19.67" fill="#ffffff" fill-rule="evenodd"/>
  <path d="M 29.40 34.44 L 14.32 16.69 L 25.76 16.67 C 25.27 15.68 22.88 13.08 22.20 12.51 C 20.64 11.22 19.06 10.72 16.53 10.72 C 11.91 10.72 5.72 10.38 1.29 10.77 C 1.47 11.32 6.32 16.69 7.04 17.59 L 19.17 31.60 C 21.84 34.60 24.52 34.55 29.40 34.44" fill="#008ac3" fill-rule="evenodd"/>
</svg>`;

  fs.writeFileSync(path.join(__dirname, 'assets/rayan-symbol.svg'), symbolSvg);
  fs.writeFileSync(path.join(__dirname, 'public/assets/rayan-symbol.svg'), symbolSvg);
  if (fs.existsSync(path.join(__dirname, 'dist/assets'))) {
    fs.writeFileSync(path.join(__dirname, 'dist/assets/rayan-symbol.svg'), symbolSvg);
  }
  console.log('Updated rayan-symbol.svg');

  console.log('✓ Successfully processed and updated original Rayan Group logos!');
}

main().catch(console.error);
