/**
 * Boots `astro dev` and reports every console error / page error, so runtime
 * problems that only appear in dev (HMR, double module evaluation) get caught
 * instead of being reported by hand.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const PORT = 4321;

const dev = spawn(
  process.execPath,
  ['node_modules/astro/astro.js', 'dev', '--port', String(PORT)],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);

let ready = false;
const seen = [];
dev.stdout.on('data', (d) => {
  const s = d.toString();
  if (s.includes('localhost')) ready = true;
});
dev.stderr.on('data', (d) => seen.push('[server] ' + d.toString().trim()));

const deadline = Date.now() + 40000;
while (!ready && Date.now() < deadline) await new Promise((r) => setTimeout(r, 400));

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(`${e.name}: ${e.message}\n    ${(e.stack || '').split('\n').slice(1, 6).join('\n    ')}`));

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// Scroll the whole page: many ScrollTrigger faults only fire on refresh.
const h = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 700) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(120);
}
await page.waitForTimeout(600);

// Client-side navigation exercises the View Transitions teardown/rebuild path.
await page.evaluate(() => window.scrollTo(0, 0));
await page.click('a[href="/contact/"]').catch(() => {});
await page.waitForTimeout(2000);
await page.goBack().catch(() => {});
await page.waitForTimeout(2000);

console.log(errors.length ? `${errors.length} ERROR(S):\n\n${errors.join('\n\n')}` : 'no runtime errors');
for (const s of seen.slice(0, 5)) console.log(s);

await browser.close();
dev.kill();
process.exit(0);
