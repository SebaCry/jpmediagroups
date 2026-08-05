/**
 * Reports computed geometry for selected elements on the built page, so layout
 * bugs get measured instead of guessed at.
 *
 *   node scripts/measure.mjs "selector" "selector" ...
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.json': 'application/json',
};

const server = createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    if (p.endsWith('/')) p += 'index.html';
    let file = join('dist', p);
    let body;
    try { body = await readFile(file); } catch { file = join('dist', p, 'index.html'); body = await readFile(file); }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end('nope'); }
});
await new Promise((r) => server.listen(4598, r));

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4598/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const selectors = process.argv.slice(2);
for (const sel of selectors) {
  const data = await page.$$eval(sel, (els) =>
    els.slice(0, 3).map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        maxW: cs.maxWidth,
        fontSize: cs.fontSize,
        display: cs.display,
        wrap: cs.textWrap || cs.textWrapStyle || '-',
        parentW: el.parentElement ? Math.round(el.parentElement.getBoundingClientRect().width) : 0,
        parentMaxW: el.parentElement ? getComputedStyle(el.parentElement).maxWidth : '-',
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34),
      };
    }),
  ).catch(() => []);
  console.log(`\n${sel}`);
  if (!data.length) { console.log('   (no match)'); continue; }
  for (const d of data) {
    console.log(`   w=${d.w} h=${d.h} maxW=${d.maxW} font=${d.fontSize} display=${d.display} wrap=${d.wrap}`);
    console.log(`   parent w=${d.parentW} maxW=${d.parentMaxW}   "${d.text}"`);
  }
}

await browser.close();
server.close();
