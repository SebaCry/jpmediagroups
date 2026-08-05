/**
 * Generates the site's abstract "plates" from scratch, so nothing we ship
 * carries a third-party licence.
 *
 * Each plate is a colour field: soft bands warped by two octaves of value
 * noise and finished with film grain. They read as abstract colour, not as
 * fake photography, and they hold the layout until the client's real work
 * lands. Every colour below is sampled from the JP Media Groups logo gradient
 * (#2C6FC6 → #2092E1 → #34B4D7 → #A0E36B) or from the salt-flat neutrals.
 *
 * Run with:  npm run assets
 */
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';

const PLATES = 'src/assets/plates';
mkdirSync(PLATES, { recursive: true });

/* ---------------------------------------------------------------- palette */

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

// Neutrals from the salt flats; accents sampled from the logo gradient.
const SALT = hex('#EDEFEC');
const CHALK = hex('#FAFBF9');
const INK = hex('#12232B');
const ABYSS = hex('#2C6FC6'); // logo — deep blue
const SIGNAL = hex('#2092E1'); // logo — azure
const CYAN = hex('#34B4D7'); // logo — cyan
const VERDE = hex('#A0E36B'); // logo — green
const MINERAL = hex('#5C6B66');
const BRINE = hex('#D9576B'); // rare counter-accent

/* ------------------------------------------------------------------ noise */

let seed = 20260804;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const lattice = (n) => Float32Array.from({ length: n * n }, rand);
const smooth = (t) => t * t * (3 - 2 * t);

/** Bilinear value noise sampled from a coarse square lattice. */
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

/** Samples a ramp of [position, rgb] stops. */
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

async function plate({ name, w, h, stops, warp = 0.14, grain = 9, angle = 0 }) {
  const coarse = lattice(9);
  const mid = lattice(23);
  const buf = Buffer.alloc(w * h * 3);
  const a = (angle * Math.PI) / 180;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / (w - 1);
      const v = y / (h - 1);

      // Rotating the gradient axis keeps the plates from all reading as bands.
      let t = v * Math.cos(a) + u * Math.sin(a);
      t += (valueNoise(coarse, 9, u, v) - 0.5) * warp;
      t += (valueNoise(mid, 23, u, v) - 0.5) * warp * 0.35;

      const [r, g, b] = ramp(stops, t);
      const n = (rand() - 0.5) * grain;
      const i = (y * w + x) * 3;
      buf[i] = Math.min(255, Math.max(0, r + n));
      buf[i + 1] = Math.min(255, Math.max(0, g + n));
      buf[i + 2] = Math.min(255, Math.max(0, b + n));
    }
  }

  const file = `${PLATES}/${name}.webp`;
  await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
    .webp({ quality: 82, effort: 5 })
    .toFile(file);
  console.log(`  ${name}.webp  ${w}×${h}  ${(statSync(file).size / 1024).toFixed(0)}KB`);
}

/* ----------------------------------------------------------------- plates */

console.log('plates:');

// Hero: the logo gradient laid down as a horizon, ink at the far edge.
await plate({
  name: 'plate-horizon',
  w: 2400,
  h: 1350,
  warp: 0.1,
  stops: [
    [0, CHALK],
    [0.3, SALT],
    [0.48, VERDE],
    [0.66, CYAN],
    [0.84, ABYSS],
    [1, INK],
  ],
});

// Portrait plate for the about band — the gradient stood on end.
await plate({
  name: 'plate-signal',
  w: 1400,
  h: 1750,
  angle: 18,
  warp: 0.2,
  stops: [
    [0, VERDE],
    [0.32, CYAN],
    [0.64, SIGNAL],
    [1, INK],
  ],
});

// Cool mineral — the quiet plate, for sections that must not shout.
await plate({
  name: 'plate-mineral',
  w: 1600,
  h: 1200,
  angle: -12,
  warp: 0.22,
  stops: [
    [0, SALT],
    [0.4, hex('#B9C6C0')],
    [0.75, MINERAL],
    [1, INK],
  ],
});

// The one warm plate. Rose is the counter-accent to a blue-green identity,
// so it appears exactly once on the page and nowhere else.
await plate({
  name: 'plate-counter',
  w: 1600,
  h: 1200,
  angle: 30,
  warp: 0.24,
  stops: [
    [0, CHALK],
    [0.34, hex('#F0CBD2')],
    [0.68, BRINE],
    [1, hex('#5B2C3A')],
  ],
});

// Deep plate — for inverted bands.
await plate({
  name: 'plate-deep',
  w: 1600,
  h: 1200,
  angle: -24,
  warp: 0.26,
  stops: [
    [0, hex('#1B4356')],
    [0.42, hex('#173341')],
    [0.78, INK],
    [1, hex('#0A1519')],
  ],
});
