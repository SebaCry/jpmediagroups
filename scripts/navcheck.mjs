/**
 * Exercises the navigation the way a person does: home → section, contact →
 * section, and a shared deep link. Reports the URL and where the page actually
 * ended up scrolled to, so a link that "works" but lands nowhere is still caught.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.json': 'application/json',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let file = join('dist', p);
    let body;
    try { body = await readFile(file); } catch { file = join('dist', p, 'index.html'); body = await readFile(file); }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise((r) => server.listen(4593, r));
const BASE = 'http://localhost:4593';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

/* Every click below is a single click from wherever the page happens to be —
   the header is permanently fixed, so there is no scrolling-up-first. This is
   the exact scenario that used to need two clicks. */

/** Where is a given section relative to the current scroll position? */
const report = async (label) => {
  const info = await page.evaluate(() => {
    const hash = location.hash;
    const el = hash && hash !== '#' ? document.querySelector(hash) : null;
    return {
      url: location.pathname + location.hash,
      scrollY: Math.round(window.scrollY),
      targetExists: !!el,
      targetTop: el ? Math.round(el.getBoundingClientRect().top) : null,
    };
  });
  const ok = !info.url.includes('#') || (info.targetExists && Math.abs(info.targetTop) < 160);
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${label.padEnd(34)} url=${info.url.padEnd(18)} ` +
      `exists=${info.targetExists} targetTop=${info.targetTop} scrollY=${info.scrollY}`,
  );
  return ok;
};

let pass = true;

// 1. From home, click a nav section link.
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3400);
await page.click('header nav a[href="/#about"]');
await page.waitForTimeout(1800);
pass = (await report('home → Studio')) && pass;

// 2. Go to contact, then click a section link. This is the reported bug.
await page.click('header nav a[href="/contact/"]');
await page.waitForTimeout(2400);
console.log(`     (on contact: ${await page.evaluate(() => location.pathname)})`);
await page.click('header nav a[href="/#services"]');
await page.waitForTimeout(2800);
pass = (await report('contact → Services')) && pass;

// 3. Same again for Team, to be sure it is not a one-off.
await page.click('header nav a[href="/contact/"]');
await page.waitForTimeout(2400);
await page.click('header nav a[href="/#team"]');
await page.waitForTimeout(2800);
pass = (await report('contact → Team')) && pass;

// 4. A deep link pasted cold.
await page.goto(`${BASE}/#team`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3400);
pass = (await report('cold load /#team')) && pass;

// 5. Home → Team. This is the link that misbehaved: Team is the pinned
//    section, and the old long scroll dragged through the pin mid-flight.
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3400);
await page.click('header nav a[href="/#team"]');
await page.waitForTimeout(1800);
pass = (await report('home → Team (pinned)')) && pass;

// 6. And the pin must still work after landing there: scrolling on should
//    translate the track sideways rather than leave it stuck.
const trackX = () =>
  page.evaluate(() => {
    // Scoped to #team. The Work teaser is also a pinned row now, and it comes
    // first in the document - an unscoped query returned that track, which has
    // already finished its scrub by the time the page is sitting on Team, so
    // it never moves again and the check read that as a broken pin.
    const t = document.querySelector('#team [data-pin-track]');
    if (!t) return null;
    const m = new DOMMatrixReadOnly(getComputedStyle(t).transform);
    return Math.round(m.m41);
  });

const before = await trackX();
await page.evaluate(() => window.scrollBy(0, 900));
await page.waitForTimeout(1400);
const after = await trackX();
const pinWorks = before !== null && after !== null && after < before - 40;
console.log(
  `${pinWorks ? 'OK  ' : 'FAIL'} ${'pin still scrubs after jump'.padEnd(34)} trackX ${before} → ${after}`,
);
pass = pinWorks && pass;

console.log(errors.length ? `\nERRORS: ${errors.join(' | ')}` : '\nno runtime errors');
console.log(pass ? '\nALL NAV CHECKS PASSED' : '\nNAV CHECKS FAILED');

await browser.close();
server.close();
