/**
 * Generates the social-share card and the icon set.
 *
 * These are SEO assets, not decoration. The card is what Google, WhatsApp,
 * iMessage, LinkedIn, Slack and X render when the URL is pasted anywhere, and
 * a link with no card gets a fraction of the clicks of one with a card. The
 * icons are what a phone shows when the site is added to a home screen and
 * what the manifest points at.
 *
 * Everything is drawn from scratch from the logo gradient, exactly like the
 * plates in generate-assets.mjs, so nothing here carries a third-party licence.
 *
 * Run with:  npm run og
 */
import sharp from 'sharp';
import { mkdirSync, statSync, readFileSync } from 'node:fs';

const OUT = 'public/og';
const ICONS = 'public/icons';
mkdirSync(OUT, { recursive: true });
mkdirSync(ICONS, { recursive: true });

/* ---------------------------------------------------------------- palette */

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const INK = hex('#12232B');
const ABYSS = hex('#2C6FC6');
const SIGNAL = hex('#2092E1');
const CYAN = hex('#34B4D7');
const VERDE = hex('#A0E36B');

/* ------------------------------------------------------------------ noise */

let seed = 20260806;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const lattice = (n) => Float32Array.from({ length: n * n }, rand);
const smooth = (t) => t * t * (3 - 2 * t);

function valueNoise(grid, g, x, y) {
  const fx = x * (g - 1);
  const fy = y * (g - 1);
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, g - 1);
  const y1 = Math.min(y0 + 1, g - 1);
  const tx = smooth(fx - x0);
  const ty = smooth(fy - y0);
  const a = grid[y0 * g + x0] * (1 - tx) + grid[y0 * g + x1] * tx;
  const b = grid[y1 * g + x0] * (1 - tx) + grid[y1 * g + x1] * tx;
  return a * (1 - ty) + b * ty;
}

function ramp(stops, t) {
  t = Math.min(1, Math.max(0, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (t >= p0 && t <= p1) {
      const k = smooth((t - p0) / (p1 - p0 || 1));
      return [0, 1, 2].map((j) => c0[j] + (c1[j] - c0[j]) * k);
    }
  }
  return stops.at(-1)[1];
}

/**
 * The card ground: ink with a warped gradient stroke laid along the bottom,
 * the same gesture the hero uses. Drawn per pixel rather than as an SVG
 * gradient so it carries the film grain the rest of the site has.
 */
function ground(w, h) {
  const coarse = lattice(9);
  const mid = lattice(23);
  const buf = Buffer.alloc(w * h * 3);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / (w - 1);
      const v = y / (h - 1);

      // Band position: 0 at the top, 1 at the very bottom edge.
      // Warp is kept low. At the plate's 0.14 the band climbed high enough on
      // one side to sit under the bottom caption.
      let t = v + (valueNoise(coarse, 9, u, v) - 0.5) * 0.035;
      t += (valueNoise(mid, 23, u, v) - 0.5) * 0.015;

      // The colour is a stroke along the bottom edge, not a wash: it stays out
      // of the type area entirely, which is what keeps the headline legible in
      // the small preview thumbnails most clients render.
      const [r, g, b] = ramp(
        [
          [0, INK],
          [0.88, INK],
          [0.93, ABYSS],
          [0.96, SIGNAL],
          [0.98, CYAN],
          [1, VERDE],
        ],
        t,
      );

      const n = (rand() - 0.5) * 7;
      const i = (y * w + x) * 3;
      buf[i] = Math.min(255, Math.max(0, r + n));
      buf[i + 1] = Math.min(255, Math.max(0, g + n));
      buf[i + 2] = Math.min(255, Math.max(0, b + n));
    }
  }
  return sharp(buf, { raw: { width: w, height: h, channels: 3 } });
}

/* ------------------------------------------------------------------- card */

/**
 * `family` is a system stack on purpose. The site's Syne/Archivo webfonts are
 * .woff2, which the SVG rasteriser cannot load — it resolves families through
 * the OS font list. The card's brand identity is carried by the logo lockup
 * and the gradient, not by the headline face.
 */
const FAMILY = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

/**
 * Type is bottom-anchored: the last headline line always sits the same
 * distance above the colour stroke, so a two-line card and a three-line card
 * read as the same design rather than as two different ones.
 */
function cardText({ lines, accentFrom, kicker, tag }) {
  const size = 86;
  const lead = 98;
  const last = 500; // baseline of the final headline line
  const top = last - (lines.length - 1) * lead;

  const body = lines
    .map((line, i) => {
      const accent = i >= accentFrom;
      return `<text x="80" y="${top + i * lead}" font-family="${FAMILY}" font-size="${size}" font-weight="800" letter-spacing="-3" fill="${accent ? 'url(#brand)' : '#FAFBF9'}">${line}</text>`;
    })
    .join('');

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="brand" x1="80" y1="${top - 60}" x2="880" y2="${last + 20}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#2092E1"/>
      <stop offset="0.45" stop-color="#34B4D7"/>
      <stop offset="1" stop-color="#A0E36B"/>
    </linearGradient>
  </defs>
  <text x="1120" y="128" text-anchor="end" font-family="${FAMILY}" font-size="24" font-weight="600" letter-spacing="5" fill="#8BA3A8">${kicker}</text>
  ${body}
  <text x="80" y="574" font-family="${FAMILY}" font-size="22" font-weight="600" letter-spacing="4" fill="#A9BEC2">${tag}</text>
</svg>`);
}

async function card({ name, lines, accentFrom, kicker, tag }) {
  const W = 1200;
  const H = 630;

  const logo = await sharp('src/assets/images/logo-lockup-inverse.png')
    .resize({ width: 272 })
    .toBuffer();

  const file = `${OUT}/${name}.jpg`;
  await ground(W, H)
    .composite([
      { input: cardText({ lines, accentFrom, kicker, tag }), top: 0, left: 0 },
      { input: logo, top: 62, left: 80 },
    ])
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toFile(file);

  console.log(`  ${name}.jpg  ${W}×${H}  ${(statSync(file).size / 1024).toFixed(0)}KB`);
}

/* ------------------------------------------------------------------ icons */

async function icons() {
  const svg = readFileSync('public/favicon.svg');

  // Standard (transparent-corner) icons, rasterised from the same mark the
  // browser tab uses so every surface shows one identity.
  const sizes = [
    [`${ICONS}/icon-192.png`, 192],
    [`${ICONS}/icon-512.png`, 512],
    [`${ICONS}/apple-touch-icon.png`, 180],
  ];

  for (const [file, size] of sizes) {
    await sharp(svg, { density: 384 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(file);
    console.log(`  ${file.split('/').pop()}  ${size}×${size}`);
  }

  // Maskable: Android crops icons to whatever shape the launcher uses, so the
  // mark is inset into the safe zone and the corners are filled with ink.
  // Without this the rounded square gets its own corners chopped off.
  const inner = Math.round(512 * 0.62);
  const mark = await sharp(svg, { density: 512 }).resize(inner, inner).png().toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: '#12232B' },
  })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(`${ICONS}/icon-maskable-512.png`);
  console.log('  icon-maskable-512.png  512×512');

  // A raster fallback for the handful of crawlers and clients that still will
  // not read an SVG favicon.
  await sharp(svg, { density: 256 }).resize(96, 96).png().toFile('public/favicon-96.png');
  console.log('  favicon-96.png  96×96');
}

/* ------------------------------------------------------------------- run */

console.log('social cards:');

await card({
  name: 'jp-media-groups',
  kicker: 'CREATIVE AGENCY · EST. 2016',
  lines: ['Video production,', 'photography', '+ marketing'],
  accentFrom: 2,
  tag: 'UTAH · MIAMI · NEW YORK · LOS ANGELES · COLOMBIA',
});

await card({
  name: 'contact',
  kicker: 'START A PROJECT',
  lines: ['Tell us about', 'the project'],
  accentFrom: 1,
  tag: 'JPMEDIAGROUPS.COM · CONTACT@JPMEDIAGROUPS.COM',
});

console.log('icons:');
await icons();
