import { writeFileSync, mkdirSync } from "fs";
import path from "path";

// Inline SVG approximating Tailwind styles: text-xl font-bold text-blue-700 mr-6 lg:mr-8
// We cannot use Tailwind directly in SVG, so we map to CSS:
// - text-xl ≈ 1.25rem font-size, 1.75rem line-height
// - font-bold ≈ 700
// - text-blue-700 ≈ #1d4ed8 (Tailwind blue-700)
// Margins are irrelevant for a standalone asset

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200">
  <rect width="100%" height="100%" fill="none"/>
  <text x="400" y="100" text-anchor="middle" dominant-baseline="middle" fill="#1d4ed8" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="48">HelvetiForma</text>
</svg>`;

async function main() {
  // Lazy import to avoid requiring dependency at type time if not installed
  const { Resvg } = await import("@resvg/resvg-js");
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 800 },
    background: 'transparent'
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // Trim transparent margins to remove any extra spacing around the text
  const sharpModule = await import('sharp');
  const sharp = (sharpModule as any).default ?? sharpModule;
  const trimmedBuffer: Buffer = await sharp(pngBuffer).trim().toBuffer();

  const outDir = path.resolve(process.cwd(), "public");
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "helvetiforma.png");
  writeFileSync(outPath, trimmedBuffer);
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


