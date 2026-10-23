import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="20" fill="#0868B0"/>
  <circle cx="86" cy="34" r="10" fill="#F09000"/>
  <text x="56" y="96" font-family="'Source Sans 3', Arial, Helvetica, sans-serif" font-weight="900" font-size="88" fill="#FFFFFF" text-anchor="middle">J</text>
</svg>`;

const outDir = path.join(process.cwd(), 'public', 'hr');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const buffer = Buffer.from(svg);

await sharp(buffer)
  .resize(32, 32)
  .png()
  .toFile(path.join(outDir, 'favicon-32x32.png'));

await sharp(buffer)
  .resize(192, 192)
  .png()
  .toFile(path.join(outDir, 'icon-192.png'));

await sharp(buffer)
  .resize(128, 128)
  .png()
  .toFile(path.join(outDir, 'favicon.png'));

// Also copy as src/app/(hr)/icon.png which Next.js App Router uses natively
await sharp(buffer)
  .resize(32, 32)
  .png()
  .toFile(path.join(process.cwd(), 'src', 'app', '(hr)', 'icon.png'));

console.log('J.Matos favicon generated successfully.');
