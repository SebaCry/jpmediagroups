/**
 * Drives the real contact form in a real browser against a stubbed Web3Forms.
 *
 * The network call is intercepted so nothing is actually sent, but everything
 * up to and including the request body is the real code path: validation,
 * the lock on the button, the payload, and both result states.
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
await new Promise((r) => server.listen(4601, r));

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

let captured = null;
let mode = 'success';

await page.route('https://api.web3forms.com/submit', async (route) => {
  const req = route.request();
  captured = req.postData();
  if (mode === 'success') {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Email sent successfully' }),
    });
  } else if (mode === 'reject') {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'Invalid access key' }),
    });
  } else {
    await route.abort('failed');
  }
});

const status = () => page.locator('[data-contact-status]');
const go = async () => {
  await page.goto('http://localhost:4601/contact/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
};

const check = (label, pass, detail = '') =>
  console.log(`  ${pass ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${label}${detail ? ` — ${detail}` : ''}`);

let failed = 0;
const expect = (label, pass, detail) => {
  if (!pass) failed++;
  check(label, pass, detail);
};

/* --- 1. empty submit is blocked ---------------------------------------- */
console.log('\nvalidación');
await go();
await page.click('[data-submit]');
await page.waitForTimeout(400);
expect('envío vacío bloqueado', captured === null, captured ? 'se envió igual' : 'no salió request');
expect(
  'mensaje de error visible',
  (await status().textContent())?.includes('fix the highlighted'),
  await status().textContent(),
);
expect('estado = error', (await status().getAttribute('data-state')) === 'error');
expect(
  'campos marcados inválidos',
  (await page.locator('.field[data-invalid]').count()) === 3,
  `${await page.locator('.field[data-invalid]').count()} campos`,
);

/* --- 2. bad email is blocked ------------------------------------------- */
await page.fill('#name', 'Ana Gómez');
await page.fill('#email', 'no-es-un-email');
await page.fill('#message', 'Necesito fotos de producto.');
await page.click('[data-submit]');
await page.waitForTimeout(400);
expect('email inválido bloqueado', captured === null);

/* --- 3. valid submit --------------------------------------------------- */
console.log('\nenvío correcto');
await page.fill('#email', 'ana@ejemplo.com');
await page.selectOption('#discipline', { index: 1 });
await page.click('[data-submit]');
await page.waitForTimeout(900);

expect('request enviado', captured !== null);
const body = captured ?? '';
expect('lleva access_key', body.includes('access_key'));
expect('lleva el nombre', body.includes('Ana G'));
expect('lleva el email', body.includes('ana@ejemplo.com'));
expect('lleva el mensaje', body.includes('Necesito fotos'));
expect('lleva la disciplina', body.includes('discipline'));
// An unticked checkbox is not submitted — that IS the honeypot. Its absence
// is what marks the sender as human; a bot that fills every field sends
// `botcheck=on` and Web3Forms drops the submission.
expect('honeypot ausente en envío humano', !body.includes('botcheck'));
expect(
  'subject incluye el nombre',
  /New project brief — Ana G/.test(body),
  (body.match(/New project brief[^\r\n-]*/) ?? [''])[0].trim(),
);

expect('estado = ok', (await status().getAttribute('data-state')) === 'ok');
expect(
  'confirmación visible',
  (await status().textContent())?.includes('on its way'),
  await status().textContent(),
);
expect('formulario reseteado', (await page.inputValue('#name')) === '');
expect('sin campos marcados', (await page.locator('.field[data-invalid]').count()) === 0);
expect('botón reactivado', !(await page.locator('[data-submit]').isDisabled()));
expect('label restaurado', (await page.locator('[data-submit-label]').textContent()) === 'Send brief');

/* --- 4. server rejects ------------------------------------------------- */
console.log('\nrespuesta de error');
mode = 'reject';
captured = null;
await go();
await page.fill('#name', 'Ana');
await page.fill('#email', 'ana@ejemplo.com');
await page.fill('#message', 'Hola');
await page.click('[data-submit]');
await page.waitForTimeout(900);
expect(
  'muestra el mensaje del servidor',
  (await status().textContent())?.includes('Invalid access key'),
  await status().textContent(),
);
expect('estado = error', (await status().getAttribute('data-state')) === 'error');
expect('botón reactivado tras fallo', !(await page.locator('[data-submit]').isDisabled()));

/* --- 5. network down --------------------------------------------------- */
console.log('\nsin conexión');
mode = 'abort';
await go();
await page.fill('#name', 'Ana');
await page.fill('#email', 'ana@ejemplo.com');
await page.fill('#message', 'Hola');
await page.click('[data-submit]');
await page.waitForTimeout(900);
expect(
  'mensaje de red caída',
  (await status().textContent())?.includes('No connection'),
  await status().textContent(),
);
expect('botón reactivado tras caída', !(await page.locator('[data-submit]').isDisabled()));

/* --- 6. no-JS fallback ------------------------------------------------- */
console.log('\nsin javascript');
const nojs = await browser.newContext({ javaScriptEnabled: false });
const p2 = await nojs.newPage();
await p2.goto('http://localhost:4601/contact/');
expect(
  'action apunta a Web3Forms',
  (await p2.getAttribute('form[data-contact]', 'action')) === 'https://api.web3forms.com/submit',
);
expect('method POST', (await p2.getAttribute('form[data-contact]', 'method'))?.toUpperCase() === 'POST');
expect('honeypot oculto', !(await p2.locator('input[name="botcheck"]').isVisible()));
expect('honeypot fuera del tab order', (await p2.getAttribute('input[name="botcheck"]', 'tabindex')) === '-1');
await nojs.close();

/* --- 7. a bot that fills everything ------------------------------------ */
console.log('\nbot');
mode = 'success';
captured = null;
await go();
await page.fill('#name', 'Bot');
await page.fill('#email', 'bot@spam.com');
await page.fill('#message', 'buy cheap');
await page.evaluate(() => {
  const el = document.querySelector('input[name="botcheck"]');
  el.checked = true;
});
await page.click('[data-submit]');
await page.waitForTimeout(700);
expect(
  'honeypot marcado sí viaja (Web3Forms lo descarta)',
  (captured ?? '').includes('botcheck'),
);

// The stubbed 400 and the aborted request are this script's own doing.
const real = errors.filter(
  (e) => !/400 \(Bad Request\)|net::ERR_FAILED|Failed to load resource/.test(e),
);
console.log(real.length ? `\nERRORES DE CONSOLA:\n  ${real.join('\n  ')}` : '\nsin errores de consola propios');
console.log(`\n${failed ? '\x1b[31m' : '\x1b[32m'}${failed} fallos\x1b[0m\n`);

await browser.close();
server.close();
process.exit(failed ? 1 : 0);
