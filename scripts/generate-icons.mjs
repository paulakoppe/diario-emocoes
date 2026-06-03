// Gera os ícones PWA do app a partir de um SVG inline.
// Rode com: node scripts/generate-icons.mjs
// Requer: npm i -D sharp

import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// SVG do ícone — coração branco em gradiente blush
// ViewBox 512x512; heart preenche ~70% (safe zone para maskable)
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F4B6C2"/>
      <stop offset="100%" stop-color="#DC6E85"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <!-- Bolhas decorativas atras -->
  <circle cx="120" cy="100" r="50" fill="white" fill-opacity="0.08"/>
  <circle cx="420" cy="420" r="80" fill="white" fill-opacity="0.06"/>
  <!-- Coracao centralizado -->
  <path
    transform="translate(56, 90) scale(0.78)"
    d="M256 448l-30.164-27.211C118.718 322.442 48 258.61 48 179.095 48 114.221 97.918 64 162.4 64c36.399 0 70.717 16.742 93.6 43.947C278.882 80.742 313.199 64 349.6 64 414.082 64 464 114.221 464 179.095c0 79.516-70.719 143.348-177.836 241.694L256 448z"
    fill="white"
  />
</svg>
`;

const outDir = "public/icons";
mkdirSync(outDir, { recursive: true });

const sizes = [
  { size: 192, file: join(outDir, "icon-192.png") },
  { size: 512, file: join(outDir, "icon-512.png") },
  { size: 180, file: "public/apple-touch-icon.png" },
  { size: 32, file: "public/favicon-32.png" },
  { size: 16, file: "public/favicon-16.png" },
];

for (const { size, file } of sizes) {
  await sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toFile(file);
  console.log(`✓ ${file} (${size}x${size})`);
}

console.log("\n🌸 Ícones gerados!");
