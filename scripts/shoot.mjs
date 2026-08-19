/**
 * Screenshots the built site so the design can actually be looked at.
 *
 * Uses the Chrome already installed on the machine (`channel: 'chrome'`), so
 * nothing large is downloaded. Serves `dist/` over a tiny static server rather
 * than file:// so absolute asset paths resolve.
 *
 *   node scripts/shoot.mjs [--mobile] [--reduced] [--out DIR]
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i === -1 ? d : args[i + 1];
};

const OUT = opt('--out', 'shots');
const MOBILE = flag('--mobile');
const REDUCED = flag('--reduced');
await mkdir(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.wasm': 'application/wasm', '.pf_meta': 'application/octet-stream',
  '.pf_index': 'application/octet-stream', '.pf_fragment': 'application/octet-stream',
};

const server = createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    if (p.endsWith('/')) p += 'index.html';
    let file = join('dist', p);
    let body;
    try {
      body = await readFile(file);
    } catch {
      file = join('dist', p, 'index.html');
      body = await readFile(file);
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

await new Promise((r) => server.listen(4599, r));

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: MOBILE ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: REDUCED ? 'reduce' : 'no-preference',
});

const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

const suffix = `${MOBILE ? '-mobile' : ''}${REDUCED ? '-reduced' : ''}`;

for (const [name, path] of [
  ['home', '/'],
  ['contact', '/contact/'],
  // One market page stands in for the five: they share a template, so a break
  // shows up on any of them.
  ['california', '/california/'],
  ['work', '/work/'],
  ['work-bodas', '/work/bodas/'],
  ['work-websites', '/work/websites/'],
]) {
  await page.goto(`http://localhost:4599${path}`, { waitUntil: 'networkidle' });
  // Let the entrance timeline settle before capturing.
  await page.waitForTimeout(3600);

  await page.screenshot({ path: `${OUT}/${name}${suffix}-top.png` });

  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log(`${name}: ${height}px tall`);

  // Walk the page in viewport-sized steps so each band can be inspected.
  const vh = MOBILE ? 844 : 900;
  const steps = Math.min(9, Math.ceil(height / vh));
  for (let i = 1; i < steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * vh);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${name}${suffix}-${String(i).padStart(2, '0')}.png` });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

console.log(errors.length ? `\nCONSOLE ERRORS:\n  ${errors.join('\n  ')}` : '\nno console errors');

await browser.close();
server.close();

