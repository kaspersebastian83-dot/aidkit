// AidKit im Browser: Kapitel per Adresse, ID-Baukasten, ID-Prüfung, Raumsuche, keine Fehler. Aufruf: node tests/aidkit-browser.cjs chromium
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const playwright = require('playwright');
const name = process.argv[2] || 'chromium';
const root = path.join(__dirname, '..');
(async () => {
  const server = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' }); res.end(fs.readFileSync(file));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await playwright[name].launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } }), errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const base = `http://127.0.0.1:${server.address().port}/index.html`;
    await page.goto(base + '#bohrkern');
    assert.equal(await page.locator('#bohrkern').isVisible(), true, 'Kapitel direkt über die Adresse');
    assert.equal(await page.locator('#ergebnis-id').textContent(), 'EG-WZ-B-7-T2');
    await page.locator('[data-geschoss="1OG"]').click(); await page.locator('#raum').selectOption('KZ'); await page.locator('#raumnr').selectOption('2');
    await page.locator('[data-punkt="3"]').click(); await page.locator('[data-tiefe="1"]').click();
    assert.equal(await page.locator('#ergebnis-id').textContent(), '1OG-KZ2-B-3-T1');
    assert.match(await page.locator('#ergebnis-text').textContent(), /Kinderzimmer 2, Wand B, Punkt 3 \(deckennah rechts\), Tiefe 1/);
    await page.locator('[data-flaeche="BO"]').click();
    assert.match(await page.locator('[data-punkt="1"]').getAttribute('aria-label'), /Ecke A\/D/, 'Boden: Raster von Wand A aus');
    await page.locator('[data-art="referenz"]').click(); await page.locator('#freimessung').check();
    assert.equal(await page.locator('#ergebnis-id').textContent(), 'F-REF-1-T1');
    await page.locator('#pruefen').fill('EG-KÜ-B-7-T2');
    assert.match(await page.locator('#pruef-ergebnis').textContent(), /Umlaute/);
    await page.locator('#pruefen').fill('EG-WZ-B-7-T2');
    assert.match(await page.locator('#pruef-ergebnis').textContent(), /Erdgeschoss, Wohnzimmer/);
    await page.locator('nav a[href="#raumkuerzel"]').click();
    await page.locator('#raum-suche').fill('heiz');
    assert.deepEqual(await page.locator('#raum-tabelle code').allTextContents(), ['HK']);
    await page.setViewportSize({ width: 390, height: 800 }); await page.goto(base + '#bohrkern');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'kein waagerechtes Scrollen bei 390 px');
    assert.deepEqual(errors, []);
    console.log(`OK ${name}: Kapitel, ID-Baukasten, Prüfung, Raumsuche, 390 px`);
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
