/**
 * Drives the portfolio in a real browser: navigation, the gallery lightbox and
 * the keyboard path through it.
 *
 * The lightbox is the one piece of this feature with real state — an index, a
 * body-scroll lock and a focus return — and every one of those is a thing that
 * breaks silently. This is what catches it.
 *
 *   npm run build && npm run check:work
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain', '.wasm': 'application/wasm',
  '.avif': 'image/avif',
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
await new Promise((r) => server.listen(4602, r));

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

let failed = 0;
const expect = (label, pass, detail = '') => {
  if (!pass) failed++;
  console.log(`  ${pass ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${label}${detail ? ` — ${detail}` : ''}`);
};

const settle = (ms = 900) => page.waitForTimeout(ms);

/* --- navigation --------------------------------------------------------- */
console.log('\nnavegación');

await page.goto('http://localhost:4602/', { waitUntil: 'networkidle' });
await settle(3600);

const navLabels = await page.locator('header nav[aria-label="Main"] a').allTextContents();
expect('Work está en la nav', navLabels.some((t) => t.trim() === 'Work'), navLabels.join(' · '));
expect('Markets renombrado', navLabels.some((t) => t.trim() === 'Markets'));
expect(
  'no hay dos entradas de "work"',
  navLabels.filter((t) => /work/i.test(t)).length === 1,
);

await page.click('header nav[aria-label="Main"] a[href="/work/"]');
await page.waitForURL('**/work/');
await settle(1200);
expect('la nav lleva a /work/', page.url().endsWith('/work/'));
expect('h1 correcto', (await page.locator('h1').count()) === 1);

const cards = await page.locator('.cat-grid .cat').count();
expect('seis categorías en el índice', cards === 6, `${cards}`);

// Every category card must reach a page that exists.
const hrefs = await page.locator('.cat-grid .cat__link').evaluateAll((els) =>
  els.map((e) => e.getAttribute('href')),
);
for (const h of hrefs) {
  const r = await page.request.get(`http://localhost:4602${h}`);
  expect(`${h} responde 200`, r.status() === 200, String(r.status()));
}

/* --- gallery + lightbox ------------------------------------------------- */
console.log('\ngalería y lightbox');

await page.goto('http://localhost:4602/work/bodas/', { waitUntil: 'networkidle' });
await settle(1500);

const thumbs = await page.locator('[data-lightbox]').count();
expect('miniaturas renderizadas', thumbs === 5, `${thumbs}`);
expect('lightbox oculto al cargar', await page.locator('[data-lightbox-root]').isHidden());

await page.locator('[data-lightbox]').nth(1).click();
await settle(500);
expect('lightbox abre', await page.locator('[data-lightbox-root]').isVisible());
expect('contador correcto', (await page.locator('[data-lightbox-count]').textContent()) === '2 / 5');

const srcOf = () => page.locator('[data-lightbox-img]').getAttribute('src');
const first = await srcOf();
expect('carga una imagen', Boolean(first) && first.length > 0, first ?? '(vacío)');

// The viewer must serve a bigger file than the thumbnail, or opening it is
// pointless — that is the whole reason it reads the largest srcset candidate.
const thumbSrc = await page.locator('[data-lightbox] img').nth(1).getAttribute('src');
expect('usa una variante distinta a la miniatura', first !== thumbSrc);

expect('body bloqueado', (await page.evaluate(() => document.body.style.overflow)) === 'hidden');

await page.locator('[data-lightbox-next]').click();
await settle(300);
expect('siguiente avanza', (await page.locator('[data-lightbox-count]').textContent()) === '3 / 5');
expect('cambia la imagen', (await srcOf()) !== first);

await page.locator('[data-lightbox-prev]').click();
await page.locator('[data-lightbox-prev]').click();
await settle(300);
expect('anterior retrocede', (await page.locator('[data-lightbox-count]').textContent()) === '1 / 5');

await page.locator('[data-lightbox-prev]').click();
await settle(300);
expect('da la vuelta al principio', (await page.locator('[data-lightbox-count]').textContent()) === '5 / 5');

await page.keyboard.press('ArrowRight');
await settle(250);
expect('flecha derecha avanza', (await page.locator('[data-lightbox-count]').textContent()) === '1 / 5');

await page.keyboard.press('Escape');
await settle(400);
expect('Escape cierra', await page.locator('[data-lightbox-root]').isHidden());
expect('body desbloqueado', (await page.evaluate(() => document.body.style.overflow)) === '');
expect(
  'el foco vuelve a la miniatura',
  await page.evaluate(() => document.activeElement?.hasAttribute('data-lightbox') ?? false),
);

/* --- the scroll lock must not survive a page change --------------------- */
// Browser Back, not a link: with the viewer open the overlay covers the page,
// so a link is unreachable for the test and for a real visitor alike. Back is
// the one navigation that CAN happen with the lightbox open, and under View
// Transitions it swaps the DOM without a reload — which is exactly the case
// where a lock left on <body> would freeze the next page.
await page.goto('http://localhost:4602/work/', { waitUntil: 'networkidle' });
await settle(1200);
await page.click('.cat-grid a[href="/work/bodas/"]');
await page.waitForURL('**/work/bodas/');
await settle(1400);
await page.locator('[data-lightbox]').first().click();
await settle(400);
expect('bloqueado con el visor abierto', (await page.evaluate(() => document.body.style.overflow)) === 'hidden');

await page.goBack();
await page.waitForURL('**/work/');
await settle(1200);
expect(
  'el bloqueo no sobrevive a la navegación',
  (await page.evaluate(() => document.body.style.overflow)) === '',
);
expect('la página siguiente scrollea', await page.evaluate(() => {
  window.scrollTo(0, 400);
  return window.scrollY > 0;
}));

/* --- websites ----------------------------------------------------------- */
console.log('\nwebsites');

await page.goto('http://localhost:4602/work/websites/', { waitUntil: 'networkidle' });
await settle(1200);
const sites = await page.locator('.sites .site').count();
expect('tarjetas de sitios', sites === 3, `${sites}`);
expect('sin lightbox en websites', (await page.locator('[data-lightbox-root]').count()) === 0);
expect(
  'una tarjeta sin URL no es un enlace',
  (await page.locator('.sites div.site__link').count()) > 0,
);

/* --- empty category ----------------------------------------------------- */
console.log('\ncategoría vacía');
await page.goto('http://localhost:4602/work/photos/', { waitUntil: 'networkidle' });
await settle(900);
expect('página vacía sigue teniendo h1', (await page.locator('h1').count()) === 1);

console.log(errors.length ? `\nERRORES DE CONSOLA:\n  ${errors.join('\n  ')}` : '\nsin errores de consola');
console.log(`\n${failed ? '\x1b[31m' : '\x1b[32m'}${failed} fallos\x1b[0m\n`);

await browser.close();
server.close();
process.exit(failed ? 1 : 0);
