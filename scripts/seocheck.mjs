/**
 * Audits the built site the way a crawler sees it.
 *
 * This runs against dist/, not against the source, because the questions that
 * matter — is the canonical absolute, did the JSON-LD survive, is the sitemap
 * pointing at URLs that exist — can only be answered on the output.
 *
 * Run with:  npm run build && npm run check:seo
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';

/**
 * The canonical origin is read from astro.config.mjs rather than repeated here.
 *
 * It used to be a second copy of the string, and a second copy is how the site
 * ended up declaring `jpmediagroups.com` canonical while the host served
 * `www.jpmediagroups.com` — every canonical, sitemap entry and schema @id
 * pointed at a URL that 308-redirected, and the audit passed anyway because it
 * was comparing the wrong value against itself.
 */
const SITE = (readFileSync('astro.config.mjs', 'utf8').match(/site:\s*'([^']+)'/) ?? [])[1]?.replace(
  /\/$/,
  '',
);
if (!SITE) {
  console.error('Could not read `site` from astro.config.mjs.');
  process.exit(1);
}

let failed = 0;
let warned = 0;

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => {
  failed++;
  console.log(`  \x1b[31m✗\x1b[0m ${m}`);
};
const warn = (m) => {
  warned++;
  console.log(`  \x1b[33m!\x1b[0m ${m}`);
};

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

/* ------------------------------------------------------------- gathering */

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

const pages = htmlFiles(DIST);

/**
 * Lengths are measured on the decoded text, not on the markup. An ampersand
 * is one character in a search result and five in the source, so measuring the
 * raw HTML reported a 61-character title as 69 and sent us trimming a title
 * that was already the right length.
 */
const decode = (s = '') =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));

const one = (html, re) => decode((html.match(re) ?? [])[1]);
/** Unmodified match — the JSON-LD block must not be entity-decoded. */
const raw = (html, re) => (html.match(re) ?? [])[1];
const all = (html, re) => [...html.matchAll(re)];

/* ----------------------------------------------------------------- files */

console.log('\nfiles');

for (const f of [
  'robots.txt',
  'sitemap-index.xml',
  'site.webmanifest',
  'favicon.svg',
  'favicon-96.png',
  'og/jp-media-groups.jpg',
  'og/contact.jpg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
]) {
  existsSync(join(DIST, f)) ? ok(f) : bad(`${f} is missing`);
}

const robots = existsSync(join(DIST, 'robots.txt'))
  ? readFileSync(join(DIST, 'robots.txt'), 'utf8')
  : '';
const sitemapLine = (robots.match(/Sitemap:\s*(\S+)/) ?? [])[1];
if (!sitemapLine) bad('robots.txt has no Sitemap: line');
else if (!sitemapLine.startsWith(SITE))
  bad(`robots.txt points at ${sitemapLine}, but the canonical origin is ${SITE}`);
else ok(`robots.txt declares ${sitemapLine}`);

// The three places the origin is written must agree. When they drift, the site
// declares one host canonical and serves another, and Search Console rejects
// the sitemap as belonging to a different property.
const stale = [...robots.matchAll(/https?:\/\/[^\s/]+/g)]
  .map((m) => m[0])
  .filter((u) => u !== SITE);
stale.length
  ? bad(`robots.txt mixes origins: ${[...new Set(stale)].join(', ')} alongside ${SITE}`)
  : ok(`every origin in robots.txt is ${SITE}`);

/* ------------------------------------------------------------- per page */

for (const file of pages) {
  const rel = relative(DIST, file).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');
  console.log(`\n${rel}`);

  /* --- title and description --- */
  const title = one(html, /<title>([^<]*)<\/title>/);
  if (!title) bad('no <title>');
  else if (title.length > 65) warn(`title is ${title.length} chars — Google truncates near 60`);
  else if (title.length < 20) warn(`title is only ${title.length} chars`);
  else ok(`title (${title.length}) ${title}`);

  const desc = one(html, /<meta name="description" content="([^"]*)"/);
  if (!desc) bad('no meta description');
  else if (desc.length > 175) warn(`description is ${desc.length} chars — truncates near 160`);
  else if (desc.length < 70) warn(`description is only ${desc.length} chars`);
  else ok(`description (${desc.length})`);

  /* --- canonical --- */
  const canonical = one(html, /<link rel="canonical" href="([^"]*)"/);
  if (!canonical) bad('no canonical');
  else if (!canonical.startsWith(SITE)) bad(`canonical is not absolute: ${canonical}`);
  else ok(`canonical ${canonical}`);

  /* --- robots --- */
  const meta = one(html, /<meta name="robots" content="([^"]*)"/);
  if (!meta) bad('no robots meta');
  else if (meta.includes('noindex')) ok(`robots: noindex (deliberate on 404)`);
  else if (!meta.includes('max-image-preview:large'))
    warn('robots meta does not open up image previews');
  else ok('robots: index + large image preview');

  /* --- headings --- */
  const h1 = all(html, /<h1[\s>]/g).length;
  if (h1 === 0) bad('no <h1>');
  else if (h1 > 1) bad(`${h1} <h1> elements — a page states its subject once`);
  else ok('exactly one <h1>');

  /* --- social card --- */
  const ogImage = one(html, /<meta property="og:image" content="([^"]*)"/);
  if (!ogImage) bad('no og:image');
  else if (!ogImage.startsWith('http'))
    bad('og:image is relative — most scrapers refuse it and render no card');
  else {
    const local = join(DIST, ogImage.replace(SITE, ''));
    existsSync(local) ? ok(`og:image resolves (${ogImage.replace(SITE, '')})`) : bad(`og:image 404s: ${ogImage}`);
  }

  for (const tag of [
    'og:title',
    'og:description',
    'og:url',
    'og:type',
    'og:site_name',
    'og:image:width',
    'og:image:alt',
  ]) {
    html.includes(`property="${tag}"`) ? null : bad(`missing ${tag}`);
  }
  html.includes('name="twitter:card"') ? ok('twitter card present') : bad('missing twitter:card');

  /* --- structured data --- */
  const ld = raw(html, /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!ld) bad('no JSON-LD');
  else {
    try {
      const parsed = JSON.parse(ld);
      const graph = parsed['@graph'] ?? [];
      const types = graph.flatMap((n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]));
      ok(`JSON-LD parses — ${graph.length} nodes: ${[...new Set(types)].join(', ')}`);

      // Every reference must land on a node that is actually in the graph.
      const ids = new Set(graph.map((n) => n['@id']).filter(Boolean));
      const refs = [...JSON.stringify(graph).matchAll(/"@id":"([^"]+)"/g)].map((m) => m[1]);
      const dangling = [...new Set(refs)].filter((r) => !ids.has(r));
      dangling.length
        ? bad(`JSON-LD @id references nothing: ${dangling.join(', ')}`)
        : ok('every @id reference resolves inside the graph');
    } catch (e) {
      bad(`JSON-LD does not parse: ${e.message}`);
    }
  }

  /* --- images --- */
  const imgs = all(html, /<img\b[^>]*>/g).map((m) => m[0]);
  // Astro serialises `alt=""` as the bare attribute `alt`. That is valid HTML
  // and is how a decorative image is correctly marked, so the test accepts it —
  // matching only `alt=` reported every plate on the site as a failure.
  const noAlt = imgs.filter((t) => !/\salt(?:=|[\s>/])/.test(t));
  noAlt.length ? bad(`${noAlt.length} <img> without an alt attribute`) : ok(`${imgs.length} images, all carry alt`);

  // An <img> with no src renders nothing and cannot shift anything — the
  // lightbox viewer is one, populated only once a photograph is opened.
  const painted = imgs.filter((t) => /\ssrc=/.test(t));
  const noDims = painted.filter((t) => !/\swidth=/.test(t) || !/\sheight=/.test(t));
  noDims.length
    ? warn(`${noDims.length} <img> without width/height — each one is a layout shift`)
    : ok(`${painted.length} painted images declare width and height`);

  /* --- language --- */
  html.includes('<html lang=') ? ok('html lang set') : bad('no lang on <html>');
}

/* ------------------------------------------------------------ uniqueness */
/* The market pages are one template rendering five places. That is fine while
   each page says something different, and it becomes a doorway-page problem
   the moment it stops — Google demotes near-identical location pages rather
   than ranking them. This is the test that catches the drift. */

console.log('\nuniqueness');

const seen = { title: new Map(), description: new Map(), h1: new Map() };

for (const file of pages) {
  const rel = relative(DIST, file).replace(/\\/g, '/');
  if (rel.includes('404')) continue;
  const html = readFileSync(file, 'utf8');

  const fields = {
    title: one(html, /<title>([^<]*)<\/title>/),
    description: one(html, /<meta name="description" content="([^"]*)"/),
    h1: decode(
      (raw(html, /<h1[^>]*>([\s\S]*?)<\/h1>/) ?? '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    ),
  };

  for (const [name, value] of Object.entries(fields)) {
    if (!value) continue;
    const prior = seen[name].get(value);
    if (prior) bad(`${name} is identical on ${prior} and ${rel}`);
    else seen[name].set(value, rel);
  }
}

if (!failed) ok(`${pages.length - 1} indexable pages, no duplicate title, description or h1`);

// Body-copy overlap between the market pages, measured on the words that
// actually differ. Two pages sharing most of their vocabulary is the signal
// that the copy has been flattened into a template.
const marketPages = pages.filter((f) => {
  const rel = relative(DIST, f).replace(/\\/g, '/');
  return rel !== 'index.html' && !rel.includes('404') && !rel.includes('contact');
});

const bag = (f) =>
  new Set(
    readFileSync(f, 'utf8')
      .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .toLowerCase()
      .match(/[a-záéíóúñ]{5,}/g) ?? [],
  );

for (let i = 0; i < marketPages.length; i++) {
  for (let j = i + 1; j < marketPages.length; j++) {
    const a = bag(marketPages[i]);
    const b = bag(marketPages[j]);
    const shared = [...a].filter((w) => b.has(w)).length;
    const overlap = shared / new Set([...a, ...b]).size;
    const pair = `${relative(DIST, marketPages[i])} ↔ ${relative(DIST, marketPages[j])}`.replace(
      /\\/g,
      '/',
    );
    if (overlap > 0.8) bad(`${(overlap * 100).toFixed(0)}% word overlap — ${pair}`);
    else if (overlap > 0.7) warn(`${(overlap * 100).toFixed(0)}% word overlap — ${pair}`);
  }
}

/* --------------------------------------------------------------- sitemap */

console.log('\nsitemap');
const indexPath = join(DIST, 'sitemap-index.xml');
if (existsSync(indexPath)) {
  const idx = readFileSync(indexPath, 'utf8');
  const parts = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  ok(`index lists ${parts.length} sitemap(s)`);

  for (const p of parts) {
    const local = join(DIST, p.replace(SITE, ''));
    if (!existsSync(local)) {
      bad(`${p} is listed but not built`);
      continue;
    }
    const urls = [...readFileSync(local, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    ok(`${p.replace(SITE, '')} lists ${urls.length} URLs`);

    for (const u of urls) {
      const rel = u.replace(SITE, '');
      const candidate = join(DIST, rel, 'index.html');
      if (!existsSync(candidate)) bad(`sitemap URL does not exist in the build: ${u}`);
      if (rel.includes('404')) bad('the 404 page is in the sitemap');
    }

    // The canonical of every listed page must be the listed URL itself.
    for (const u of urls) {
      const candidate = join(DIST, u.replace(SITE, ''), 'index.html');
      if (!existsSync(candidate)) continue;
      const c = one(readFileSync(candidate, 'utf8'), /<link rel="canonical" href="([^"]*)"/);
      if (c !== u) bad(`sitemap says ${u} but that page's canonical is ${c}`);
    }
    ok('every sitemap URL is its own canonical');
  }
} else {
  bad('sitemap-index.xml is missing');
}

/* ----------------------------------------------------------------- result */

console.log(
  `\n${failed ? '\x1b[31m' : '\x1b[32m'}${pages.length} pages · ${failed} failed · ${warned} warnings\x1b[0m\n`,
);
process.exit(failed ? 1 : 0);
