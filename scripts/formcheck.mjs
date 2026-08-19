/**
 * Drives the real contact form in a real browser against a stubbed EmailJS.
 *
 * The network call is intercepted so nothing is actually sent, but everything
 * up to and including the request body is the real code path — the EmailJS SDK
 * included. That matters most for the payload: the form's field names are the
 * contract with the dashboard template, and asserting them on the real
 * multipart body is the only way to catch a rename that would ship blank
 * emails while still reporting success.
 *
 * Covers: validation, the button lock, the payload, a 403, a 429, an
 * unreachable endpoint, a genuinely offline visitor, no JavaScript at all, and
 * a bot tripping the honeypot.
 *
 * Needs a build with the three identifiers baked in, since the form refuses to
 * send without them. The values below are what the assertions expect — nothing
 * leaves the browser, so they need not be real.
 *
 *   PUBLIC_EMAILJS_SERVICE_ID=service_test123 \
 *   PUBLIC_EMAILJS_TEMPLATE_ID=template_test456 \
 *   PUBLIC_EMAILJS_PUBLIC_KEY=pk_test_abcdef \
 *   npm run build
 *   npm run check:form
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

// EmailJS's SDK posts the assembled form to this endpoint. Intercepting it
// rather than the SDK call means the payload asserted below is the real one
// EmailJS would have sent — field mapping included — not a stub of our own.
await page.route('**/api.emailjs.com/**', async (route) => {
  captured = route.request().postData();
  if (mode === 'success') {
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' });
  } else if (mode === 'reject') {
    // EmailJS answers with a plain-text reason and a status the SDK surfaces.
    await route.fulfill({ status: 403, contentType: 'text/plain', body: 'Forbidden' });
  } else if (mode === 'throttle') {
    await route.fulfill({ status: 429, contentType: 'text/plain', body: 'Too Many Requests' });
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
// `sendForm` posts multipart/form-data, not JSON — that is `send()`. So the
// body is parsed as multipart parts rather than with JSON.parse, which is what
// the first version of this test got wrong.
//
// The field names are the contract with the dashboard template, so each one is
// asserted by name: renaming a field here without renaming `{{it}}` there
// ships blank emails that still report success.
const parts = Object.fromEntries(
  [...body.matchAll(/name="([^"]+)"\r?\n\r?\n([\s\S]*?)\r?\n--/g)].map((m) => [m[1], m[2]]),
);

expect('el cuerpo es multipart', Object.keys(parts).length > 0, `${Object.keys(parts).length} campos`);
expect('lleva service_id', parts.service_id === 'service_test123', parts.service_id ?? '(falta)');
expect('lleva template_id', parts.template_id === 'template_test456', parts.template_id ?? '(falta)');
expect('lleva la public key', parts.user_id === 'pk_test_abcdef', parts.user_id ?? '(falta)');

expect('campo name', parts.name === 'Ana Gómez', parts.name ?? '(falta)');
expect('campo email', parts.email === 'ana@ejemplo.com', parts.email ?? '(falta)');
expect('campo message', String(parts.message ?? '').includes('Necesito fotos'));
expect('campo discipline', Boolean(parts.discipline), parts.discipline ?? '(falta)');
expect(
  'subject incluye el nombre',
  parts.subject === 'New project brief — Ana Gómez',
  parts.subject ?? '(falta)',
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

/* --- 4. server rejects (403) -------------------------------------------- */
console.log('\nrespuesta de error');
mode = 'reject';
captured = null;
await go();
await page.fill('#name', 'Ana');
await page.fill('#email', 'ana@ejemplo.com');
await page.fill('#message', 'Hola');
await page.click('[data-submit]');
await page.waitForTimeout(1200);
// Never the raw EmailJS text: the visitor is pointed at the address printed
// beside the form instead of at a status code.
expect(
  'ofrece el email como alternativa',
  (await status().textContent())?.includes('contact@jpmediagroups.com'),
  await status().textContent(),
);
expect('estado = error', (await status().getAttribute('data-state')) === 'error');
expect('botón reactivado tras fallo', !(await page.locator('[data-submit]').isDisabled()));

/* --- 4b. rate limited (429) --------------------------------------------- */
mode = 'throttle';
await go();
await page.fill('#name', 'Ana');
await page.fill('#email', 'ana@ejemplo.com');
await page.fill('#message', 'Hola');
await page.click('[data-submit]');
await page.waitForTimeout(1200);
expect(
  '429 se explica como reenvío',
  (await status().textContent())?.includes('a moment ago'),
  await status().textContent(),
);

/* --- 5. the request itself fails ---------------------------------------- */
// The visitor's network is fine; EmailJS is simply unreachable. Telling them
// to "check your connection" would be wrong and would send them looking in the
// wrong place, so this case gets the generic fallback with the address.
console.log('\nel request falla');
mode = 'abort';
await go();
await page.fill('#name', 'Ana');
await page.fill('#email', 'ana@ejemplo.com');
await page.fill('#message', 'Hola');
await page.click('[data-submit]');
await page.waitForTimeout(1200);
expect(
  'no culpa a la red del visitante',
  !(await status().textContent())?.includes('No connection'),
  await status().textContent(),
);
expect(
  'ofrece el email',
  (await status().textContent())?.includes('contact@jpmediagroups.com'),
);
expect('botón reactivado tras caída', !(await page.locator('[data-submit]').isDisabled()));

/* --- 5b. genuinely offline ---------------------------------------------- */
// Here the visitor really is offline, and "check your network" is the useful
// thing to say rather than an email address they cannot reach either.
console.log('\nsin conexión de verdad');
await go();
await page.fill('#name', 'Ana');
await page.fill('#email', 'ana@ejemplo.com');
await page.fill('#message', 'Hola');
await page.context().setOffline(true);
await page.click('[data-submit]');
await page.waitForTimeout(1500);
expect(
  'mensaje de red caída',
  (await status().textContent())?.includes('No connection'),
  await status().textContent(),
);
await page.context().setOffline(false);

/* --- 6. no JavaScript --------------------------------------------------- */
// EmailJS cannot send without JavaScript — there is no endpoint to post to.
// So the requirement is not that the form works, it is that the visitor is
// never left with a button that silently does nothing.
console.log('\nsin javascript');
const nojs = await browser.newContext({ javaScriptEnabled: false });
const p2 = await nojs.newPage();
await p2.goto('http://localhost:4601/contact/');
expect(
  'no hay action que no pueda funcionar',
  (await p2.getAttribute('form[data-contact]', 'action')) === null,
);
const ns = await p2.locator('noscript').innerHTML();
expect('el aviso noscript existe', ns.length > 0);
expect('ofrece el email', ns.includes('contact@jpmediagroups.com'), '');
expect('ofrece el teléfono', /tel:\+?\d/.test(ns));
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
await page.waitForTimeout(900);
// EmailJS has no server-side honeypot, so the abort has to happen here — the
// request must never leave the browser, or the studio pays for the spam in
// quota either way.
expect('el bot no genera ningún request', captured === null, captured ? 'salió igual' : 'nada salió');
// Reported as success on purpose: telling a bot it was blocked teaches
// whoever wrote it which field to skip next time.
expect('al bot se le responde éxito', (await status().getAttribute('data-state')) === 'ok');

// The stubbed 400 and the aborted request are this script's own doing.
const real = errors.filter(
  (e) => !/400 \(Bad Request\)|net::ERR_FAILED|Failed to load resource/.test(e),
);
console.log(real.length ? `\nERRORES DE CONSOLA:\n  ${real.join('\n  ')}` : '\nsin errores de consola propios');
console.log(`\n${failed ? '\x1b[31m' : '\x1b[32m'}${failed} fallos\x1b[0m\n`);

await browser.close();
server.close();
process.exit(failed ? 1 : 0);
