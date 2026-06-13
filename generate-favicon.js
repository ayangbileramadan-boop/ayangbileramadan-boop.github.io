const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'images');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const ACCENT = '#00ffcc';
const BG = '#0a0a0a';

function svgM(size, hasBg = true) {
  const s = size;
  const p = Math.round(s * 0.125);       // 12.5% padding
  const sw = Math.max(2, Math.round(s * 0.09)); // stroke width ~9%
  const inner = s - p * 2;
  const lx = p + Math.round(inner * 0.22);   // left vertical x
  const rx = s - p - Math.round(inner * 0.22); // right vertical x
  const topY = p + Math.round(inner * 0.08);
  const botY = s - p - Math.round(inner * 0.08);
  const ctrY = p + Math.round(inner * 0.58);  // center apex y
  const hookLen = Math.max(2, Math.round(sw * 1.1));

  // Bracket hooks at bottom
  const lHook = lx - hookLen;
  const rHook = rx + hookLen;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">
  ${hasBg ? `<rect width="${s}" height="${s}" rx="${Math.round(s * 0.22)}" fill="${BG}"/>` : ''}
  <g fill="none" stroke="${ACCENT}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
    <line x1="${lx}" y1="${topY}" x2="${lx}" y2="${botY}"/>
    <line x1="${lx}" y1="${topY}" x2="${Math.round(s / 2)}" y2="${ctrY}"/>
    <line x1="${rx}" y1="${topY}" x2="${Math.round(s / 2)}" y2="${ctrY}"/>
    <line x1="${rx}" y1="${topY}" x2="${rx}" y2="${botY}"/>
    <line x1="${lx}" y1="${botY}" x2="${lHook}" y2="${botY}"/>
    <line x1="${rx}" y1="${botY}" x2="${rHook}" y2="${botY}"/>
    <line x1="${lx}" y1="${topY}" x2="${lx + Math.round(hookLen * 0.7)}" y2="${topY}"/>
    <line x1="${rx}" y1="${topY}" x2="${rx - Math.round(hookLen * 0.7)}" y2="${topY}"/>
  </g>
</svg>`;
}

// Generate SVGs
const svgDark = svgM(512, true);
const svgTransparent = svgM(512, false);
fs.writeFileSync(path.join(OUT, 'favicon.svg'), svgDark);
fs.writeFileSync(path.join(OUT, 'favicon-transparent.svg'), svgTransparent);

// Generate PNG favicons
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-512x512.png', size: 512 },
];

async function generate() {
  for (const { name, size } of sizes) {
    const svg = svgM(size, true);
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, name));
    console.log(`  ✓ ${name} (${size}x${size})`);
  }
  // Also copy favicon.ico-compatible as 32x32 named favicon.ico
  const svg32 = svgM(32, true);
  await sharp(Buffer.from(svg32)).png().toFile(path.join(OUT, 'favicon.ico'));
  console.log('  ✓ favicon.ico (32x32 png)');
}

console.log('Generating favicon assets...');
generate().then(() => console.log('\nDone!')).catch(console.error);
