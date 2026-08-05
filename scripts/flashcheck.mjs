/**
 * Detects the navigation flash.
 *
 * The symptom is that an incoming page paints its sections fully visible, then
 * the motion module hides them and animates them back in. So: navigate, and
 * sample the opacity of a reveal target on every animation frame from the swap
 * onward. If any early frame reads ~1 before the animation starts, the content
 * was painted before being hidden and the flash is real.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let file = join('dist', p);
    let body;
    try { body = await readFile(file); } catch { file = join('dist', p, 'index.html'); body = await readFile(file); }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(4592, r));

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:4592/contact/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// Arm the sampler before navigating back to the home page.
await page.evaluate(() => {
  window.__samples = [];
  document.addEventListener(
    'astro:after-swap',
    () => {
      let frames = 0;
      const tick = () => {
        const el = document.querySelector('[data-reveal="rise"] > *');
        if (el) window.__samples.push(+getComputedStyle(el).opacity);
        if (++frames < 24) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    { once: true },
  );
});

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await page.click('header nav a[href="/#about"]');
await page.waitForTimeout(2500);

const samples = await page.evaluate(() => window.__samples ?? []);
console.log('opacity over the first frames after swap:');
console.log('  ' + samples.map((n) => n.toFixed(2)).join(' '));

const first = samples[0];
if (samples.length === 0) {
  console.log('\ninconclusive — no reveal target sampled');
} else if (first > 0.9) {
  console.log(`\nFLASH: content painted at opacity ${first.toFixed(2)} before being hidden`);
} else {
  console.log(`\nNO FLASH: first painted frame is already at opacity ${first.toFixed(2)}`);
}

await browser.close();
server.close();
