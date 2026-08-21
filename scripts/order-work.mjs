/**
 * Renames a portfolio folder to the 01, 02, 03… convention.
 *
 * Photographs arrive named the way the camera named them — `_MG_0328.jpg`,
 * `DSC_4471.jpg` — which sorts chronologically. That is a fine default for a
 * wedding and a bad one for everything else: the first file in the folder
 * becomes the category's cover on /work/ and on the home page, and the best
 * frame is rarely the first one shot.
 *
 * Renaming is optional. The gallery reads whatever is in the folder either way.
 * This exists so that curating an order does not mean renaming ninety files by
 * hand.
 *
 *   node scripts/order-work.mjs bodas           # muestra el plan, no toca nada
 *   node scripts/order-work.mjs bodas --apply   # renombra
 *
 * To put a specific photograph first, rename that one to `00.jpg` before
 * running with --apply; it sorts ahead of everything and becomes 01.
 */
import { readdirSync, renameSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const EXT = /\.(jpe?g|png|webp|avif)$/i;

const [slug, ...flags] = process.argv.slice(2);
const apply = flags.includes('--apply');

if (!slug) {
  console.error('Usage: node scripts/order-work.mjs <categoría> [--apply]');
  console.error('Categorías: bodas · food · photos · music-videos · social-media · websites');
  process.exit(1);
}

const dir = join('src/assets/work', slug);
if (!existsSync(dir)) {
  console.error(`No existe ${dir}`);
  process.exit(1);
}

// Same sort the gallery uses, so the plan shown here is the order the page
// renders today — not a different one invented by this script.
const files = readdirSync(dir)
  .filter((f) => EXT.test(f))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

if (!files.length) {
  console.log(`${dir} está vacía. Copiá las fotos ahí primero.`);
  process.exit(0);
}

const pad = String(files.length).length < 2 ? 2 : String(files.length).length;
const plan = files.map((from, i) => ({
  from,
  to: `${String(i + 1).padStart(pad, '0')}${extname(from).toLowerCase()}`,
}));

console.log(`\n${dir} — ${files.length} archivos\n`);
for (const { from, to } of plan) {
  console.log(`  ${from === to ? '·' : '→'} ${from.padEnd(28)} ${from === to ? '(ya está)' : to}`);
}

if (!apply) {
  console.log('\nNada renombrado. Repetí con --apply para aplicarlo.\n');
  process.exit(0);
}

// Two passes through a temporary name. A direct rename can collide when the
// target already exists under a different photograph — renaming 02→01 while a
// real 01 is still there would destroy it.
const stamp = `.tmp-${files.length}-`;
plan.forEach(({ from }, i) => renameSync(join(dir, from), join(dir, stamp + i)));
plan.forEach(({ to }, i) => renameSync(join(dir, stamp + i), join(dir, to)));

console.log(`\n${plan.length} archivos renombrados.\n`);
