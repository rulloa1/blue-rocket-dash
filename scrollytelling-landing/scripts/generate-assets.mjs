import fs from 'fs';
import path from 'path';

const SEQUENCE_DIR = path.join(process.cwd(), 'public', 'sequence');
const FRAME_COUNT = 120;

if (!fs.existsSync(SEQUENCE_DIR)) {
  fs.mkdirSync(SEQUENCE_DIR, { recursive: true });
}

for (let i = 0; i < FRAME_COUNT; i++) {
  const svgContent = `
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#050505"/>
  <circle cx="50%" cy="50%" r="${(i + 1) * 3}" fill="none" stroke="white" stroke-width="2"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="80">FRAME ${i}</text>
  <rect x="${(i / FRAME_COUNT) * 100}%" y="90%" width="20" height="20" fill="cyan"/>
</svg>`;

  // Saving as .svg instead of .webp for placeholder simplicity without external deps
  // The code will need to be adjusted to load .svg for now, or we can just name them .webp (browsers might reject valid svg content with webp extension?? No, they sniff content type usually, but safer to use .svg)
  // Let's name them .svg for correctness.
  fs.writeFileSync(path.join(SEQUENCE_DIR, `frame_${i}.svg`), svgContent);
}

console.log(`Generated ${FRAME_COUNT} placeholder frames in ${SEQUENCE_DIR}`);
