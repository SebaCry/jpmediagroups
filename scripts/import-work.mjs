/**
 * Prepares camera originals for the portfolio.
 *
 * The originals that came off the shoots are 2.7 GB across 466 files — 3600 to
 * 6000 pixels wide, some over 10 MB each. Three separate reasons that cannot go
 * into the repository as-is:
 *
 *   1. Git. GitHub refuses single files over 100 MB and struggles well before a
 *      gigabyte in total. Vercel clones the repo on every build.
 *   2. Build time. Astro generates four responsive widths per image; 466
 *      originals is ~1,900 transforms and minutes of build on every deploy.
 *   3. EXIF. A camera JPEG carries the GPS coordinates of where it was taken
 *      and the timestamp. For a wedding that is the venue and the hour — not
 *      something to publish, and not something to leave in a public repo.
 *
 * So this copies a CURATED, RESIZED, STRIPPED set into src/assets/work/, and
 * the originals stay on disk, gitignored. 2400px is the working size: the
 * largest variant the site ever serves is 1600px (the lightbox), so 2400 leaves
 * retina headroom and nothing more.
 *
 *   node scripts/import-work.mjs bodas                 # plan, no toca nada
 *   node scripts/import-work.mjs bodas --apply
 *   node scripts/import-work.mjs bodas --apply --limit 30
 *   node scripts/import-work.mjs all --apply
 *   node scripts/import-work.mjs bodas --apply --first   # sin repartir
 *
 * Files land as 01.jpg, 02.jpg … in the order the source folder sorts. The
 * selection is spread evenly across the folder rather than taken off the front,
 * so every session in it is represented and consecutive near-identical frames
 * are skipped. Pass `--first` for a folder that is already curated in order.
 *
 * ⚠️  Renaming discards the original filename. If a file credits a
 *     photographer in its name, that credit is lost here — record it in
 *     content/site.ts before importing.
 */
import sharp from 'sharp';
import { readdirSync, existsSync, mkdirSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src/assets/images';
const DEST = 'src/assets/work';

/** Longest edge the repo keeps. The site never serves more than 1600. */
const MAX = 2400;
/** mozjpeg at 82 is visually clean and roughly a tenth of the original. */
const QUALITY = 82;
/** How many photographs a category page shows before "see the rest on Drive". */
const DEFAULT_LIMIT = 24;

const EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i;
const CATEGORIES = ['bodas', 'food', 'photos', 'music-videos', 'social-media', 'websites'];

const args = process.argv.slice(2);
const target = args[0];
const apply = args.includes('--apply');
const first = args.includes('--first');
const limitArg = args.indexOf('--limit');
const LIMIT = limitArg === -1 ? DEFAULT_LIMIT : Number(args[limitArg + 1]);

if (!target) {
  console.error('Uso: node scripts/import-work.mjs <categoría|all> [--apply] [--limit N]');
  console.error(`Categorías: ${CATEGORIES.join(' · ')}`);
  process.exit(1);
}

const todo = target === 'all' ? CATEGORIES : [target];
const mb = (b) => (b / 1048576).toFixed(1);

let totalIn = 0;
let totalOut = 0;
let totalFiles = 0;

for (const cat of todo) {
  const from = join(SRC, cat);
  const to = join(DEST, cat);

  if (!existsSync(from)) {
    if (target !== 'all') console.error(`No existe ${from}`);
    continue;
  }

  const files = readdirSync(from)
    .filter((f) => EXT.test(f))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  if (!files.length) continue;

  // Sampled across the whole folder, not sliced off the front.
  //
  // Taking the first N looks reasonable and is almost always wrong: camera
  // filenames sort chronologically, so the first 24 of a wedding folder are 24
  // consecutive frames of the same embrace, and a second wedding filed under a
  // later letter never appears at all. That is exactly what the first import
  // produced. Spreading the pick covers every session in the folder and drops
  // the near-duplicates.
  //
  // `--first` restores the old behaviour for a folder that is already curated
  // and in a deliberate order.
  const picked = first
    ? files.slice(0, LIMIT)
    : files.length <= LIMIT
      ? files
      : Array.from({ length: LIMIT }, (_, i) =>
          files[Math.round((i * (files.length - 1)) / (LIMIT - 1))],
        );
  const inBytes = picked.reduce((n, f) => n + statSync(join(from, f)).size, 0);

  console.log(`\n${cat}`);
  console.log(`  origen    ${files.length} archivos`);
  console.log(
    `  se copian ${picked.length}  (${mb(inBytes)} MB sin procesar)${first ? '' : '  — repartidas'}`,
  );
  if (files.length > picked.length) {
    console.log(`  se omiten ${files.length - picked.length} — quedan en ${from}`);
  }

  if (!apply) {
    totalIn += inBytes;
    totalFiles += picked.length;
    continue;
  }

  mkdirSync(to, { recursive: true });

  // Wipe previous output so a re-run with a smaller --limit does not leave
  // orphans behind, which would silently show old photographs on the page.
  for (const old of readdirSync(to).filter((f) => EXT.test(f))) {
    rmSync(join(to, old));
  }

  const pad = String(picked.length).length < 2 ? 2 : String(picked.length).length;
  let outBytes = 0;

  for (let i = 0; i < picked.length; i++) {
    const out = join(to, `${String(i + 1).padStart(pad, '0')}.jpg`);
    await sharp(join(from, picked[i]))
      // `withoutEnlargement` so a source already smaller than 2400 is copied at
      // its own size instead of being upscaled into softness.
      .rotate() // applies the EXIF orientation before the tag is dropped
      .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(out);
    outBytes += statSync(out).size;
    process.stdout.write(`\r  procesando ${i + 1}/${picked.length}`);
  }

  console.log(
    `\r  listo      ${picked.length} archivos  ${mb(inBytes)} MB → ${mb(outBytes)} MB  (−${Math.round((1 - outBytes / inBytes) * 100)}%)`,
  );

  totalIn += inBytes;
  totalOut += outBytes;
  totalFiles += picked.length;
}

console.log(
  apply
    ? `\nTOTAL  ${totalFiles} archivos  ${mb(totalIn)} MB → ${mb(totalOut)} MB\n`
    : `\nTOTAL  ${totalFiles} archivos, ${mb(totalIn)} MB sin procesar.\nNada copiado. Repetí con --apply.\n`,
);
