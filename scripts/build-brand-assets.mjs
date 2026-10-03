/**
 * Generates transparent brand assets from the original hylogo.jpeg.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * Outputs:
 *   public/brand/logo.png        full logo, transparent background
 *   public/brand/logo-white.png  full logo, solid white (for dark surfaces)
 *   public/brand/mark.png        square symbol only
 *   src/app/icon.png             favicon (512x512)
 *   src/app/apple-icon.png       apple touch icon (180x180, white bg)
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "hylogo.jpeg";
const FULL = { left: 215, top: 40, width: 1300, height: 520 };
const MARK = { left: 215, top: 40, width: 440, height: 520 };

async function toTransparent(region, { white = false } = {}) {
  const { data, info } = await sharp(SRC)
    .extract(region)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const m = Math.min(r, g, b);
    const a = Math.min(1, Math.max(0, (255 - m) / (255 - 60)));
    if (a < 0.02) {
      out[j + 3] = 0;
      continue;
    }
    const un = (c) => Math.max(0, Math.min(255, Math.round((c - 255 * (1 - a)) / a)));
    out[j] = white ? 255 : un(r);
    out[j + 1] = white ? 255 : un(g);
    out[j + 2] = white ? 255 : un(b);
    out[j + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function squareMark(size, background) {
  const base = (await toTransparent(MARK)).png();
  return sharp(await base.toBuffer())
    .resize(size, size, {
      fit: "contain",
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png();
}

await mkdir("public/brand", { recursive: true });

await (await toTransparent(FULL)).png().toFile("public/brand/logo.png");
await (await toTransparent(FULL, { white: true })).png().toFile("public/brand/logo-white.png");
await (await squareMark(512)).toFile("public/brand/mark.png");
await (await squareMark(512)).toFile("src/app/icon.png");
await (await squareMark(180, { r: 255, g: 255, b: 255, alpha: 1 })).toFile("src/app/apple-icon.png");

console.log("Brand assets generated.");
