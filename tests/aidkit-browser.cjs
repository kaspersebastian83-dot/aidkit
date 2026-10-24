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
    // Bohrkerne Schritt für Schritt: Schrittleiste, Haken, Übung Wand, Übung Gefäß
    await page.goto(base + '#bohrkern-ablauf');
    assert.equal(await page.locator('#bohrkern-ablauf .schritte button').count(), 6);
    assert.match(await page.locator('#bohrkern-ablauf .schritt.aktiv h2').innerText(), /1 · Vorbereiten/);
    for (const cb of await page.locator('#bohrkern-ablauf .schritt.aktiv .check input').all()) await cb.check();
    assert.match(await page.locator('#bohrkern-ablauf .schritte button').first().innerText(), /✓/, 'erledigter Schritt bekommt einen Haken');
    await page.locator('#bohrkern-ablauf .schritt-weiter').click();
    assert.match(await page.locator('#bohrkern-ablauf .schritt.aktiv h2').innerText(), /2 · Begehung/);
    await page.locator('#uebung-wand .wand[data-wand="B"] rect').click();
    assert.match(await page.locator('#wand-antwort').innerText(), /Das ist Wand B/);
    await page.locator('#uebung-wand .wand[data-wand="C"] rect').click();
    assert.match(await page.locator('#wand-antwort').innerText(), /Richtig – das ist Wand C/);
    await page.locator('#bohrkern-ablauf .schritte [data-geh="3"]').click(); await page.locator('[data-bp="3"]').click(); await page.locator('[data-bt="1"]').click();
    assert.equal(await page.locator('#beutel-id').innerText(), 'EG-WZ-B-3-T1');
    await page.reload(); await page.locator('#bohrkern-ablauf .schritte button').first().waitFor();
    assert.match(await page.locator('#bohrkern-ablauf .schritte button').first().innerText(), /✓/, 'Haken bleiben im Browser erhalten');
    await page.locator('#bohrkern-ablauf .ablauf-zuruecksetzen').click();
    assert.doesNotMatch(await page.locator('#bohrkern-ablauf .schritte button').first().innerText(), /✓/);
    // Brandschaden von A bis Z: eigene Haken, Überblick springt zum Schritt, App-Knöpfe zeigen auf die Apps
    await page.goto(base + '#brandschaden');
    assert.equal(await page.locator('#brandschaden .schritte button').count(), 9);
    // Übung „Was ist Pflicht?“ (Schritt 2) – gleiche Liste wie PJ_PFLICHT in der Projektzentrale
    await page.locator('#brandschaden .schritte [data-geh="2"]').click();
    for (const n of ['Objekt / Adresse', 'Nutzung', 'Auftraggeber / Versicherung', 'Schadenereignis', 'Schadendatum', 'Ortstermin']) await page.locator('#pflicht-chips button', { hasText: n }).click();
    await page.locator('#pflicht-chips button', { hasText: 'Notizen' }).click();
    await page.locator('#pflicht-pruefen').click();
    assert.match(await page.locator('#pflicht-antwort').innerText(), /1 Pflichtangabe fehlt, 1 ist keine Pflicht/);
    await page.locator('#pflicht-chips button', { hasText: 'Notizen' }).click(); await page.locator('#pflicht-chips button', { hasText: 'Sachverständiger' }).click();
    await page.locator('#pflicht-pruefen').click();
    assert.match(await page.locator('#pflicht-antwort').innerText(), /Richtig – sieben Pflichtangaben/);
    // Übung „Welche Skala gilt?“ (Schritt 7)
    await page.locator('#brandschaden .schritte [data-geh="7"]').click();
    assert.match(await page.locator('#skala-fall').innerText(), /Fall 1 von 4/);
    await page.locator('[data-skala="eigen"]').click(); assert.match(await page.locator('#skala-antwort').innerText(), /Nicht ganz/);
    await page.locator('[data-skala="vds"]').click(); assert.match(await page.locator('#skala-antwort').innerText(), /Richtig/);
    await page.waitForFunction(() => /Fall 2 von 4/.test(document.getElementById('skala-fall').textContent));
    await page.locator('[data-skala="eigen"]').click(); assert.match(await page.locator('#skala-antwort').innerText(), /keine VdS-Referenz/);
    await page.locator('#brandschaden .fluss [data-geh="5"]').click();
    assert.match(await page.locator('#brandschaden .schritt.aktiv h2').innerText(), /5 · Fotos/);
    assert.equal(await page.locator('#brandschaden .schritt.aktiv a.app-oeffnen').getAttribute('href'), '../Bildumbenenner/');
    for (const cb of await page.locator('#brandschaden .schritt.aktiv .check input').all()) await cb.check();
    assert.match(await page.locator('#brandschaden .schritte button').nth(4).innerText(), /✓/);
    assert.doesNotMatch(await page.locator('#bohrkern-ablauf .schritte button').nth(4).innerText(), /✓/, 'Haken je Kapitel getrennt');
    const hrefs = await page.locator('#brandschaden a.app-oeffnen').evaluateAll(as => [...new Set(as.map(a => a.getAttribute('href')))].sort());
    assert.deepEqual(hrefs, ['../Bildumbenenner/', '../Probenplan/', '../Projektzentrale/', '../aufwandkit/', '../labelkit/']);
    await page.locator('#brandschaden h1').click(); await page.keyboard.press('ArrowRight');
    assert.match(await page.locator('#brandschaden .schritt.aktiv h2').innerText(), /6 · Probenplan/, 'Pfeiltasten blättern');
    await page.setViewportSize({ width: 390, height: 800 }); await page.goto(base + '#bohrkern');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'kein waagerechtes Scrollen bei 390 px');
    await page.goto(base + '#brandschaden'); await page.waitForTimeout(100);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Brandschaden: kein waagerechtes Scrollen bei 390 px');
    assert.deepEqual(errors, []);
    console.log(`OK ${name}: Kapitel, ID-Baukasten, Prüfung, Raumsuche, Bohrkern-Ablauf, Brandschaden, 390 px`);
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
