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
    assert.match(await page.locator('[data-punkt="1"]').getAttribute('aria-label'), /Ecke A\/D/, 'Boden: Raster wie im Grundriss');
    assert.match(await page.locator('#punkt-bezug').innerText(), /wie im Grundriss, Wand A oben/);
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
    // Apps Schritt für Schritt: jedes Kapitel per Adresse, Schrittleiste, eigene Haken, Übung und App-Knopf
    for (const [id, n, href] of [['app-projektzentrale', 8, '../Projektzentrale/'], ['app-labelkit', 8, '../labelkit/'], ['app-fotokit', 8, '../Bildumbenenner/'], ['app-resultkit', 6, '../resultkit/'], ['app-plankit', 9, '../Probenplan/'], ['app-berichtkit', 6, '../berichtkit/'], ['app-belegkit', 7, '../aufwandkit/'], ['app-spesenkit', 6, '../reisekosten-pro/'], ['app-datenarchiv', 6, '../Projektzentrale/archiv/']]) {
      await page.goto(base + '#' + id);
      assert.equal(await page.locator(`#${id}`).isVisible(), true, id + ' sichtbar');
      assert.equal(await page.locator(`#${id} .schritte button`).count(), n, id + ': Schritte');
      assert.equal(await page.locator(`#${id} .app-kopf a.app-oeffnen`).getAttribute('href'), href);
      assert.ok(await page.locator(`#${id} .quiz`).count() >= 1, id + ': mindestens eine Übung');
      for (const q of await page.locator(`#${id} .quiz`).all()) assert.ok(await q.locator('[data-a]').count() >= 2, id + ': Übung hat Antworten');
    }
    // Wischproben: Baukasten von groß nach klein, Aufteilung für LabelKit
    await page.goto(base + '#wischprobe');
    assert.equal(await page.locator('nav a[href="#wischprobe"]').count(), 1);
    const wp = page.locator('#wischprobe');
    await page.locator('#wp-gebaeude').fill('Haus A');
    await wp.locator('[data-wpgeschoss="EG"]').click(); await page.locator('#wp-raum').selectOption('Küche');
    await wp.locator('[data-wpbauteil="Decke"]').click(); await wp.locator('[data-wpoberflaeche="Untersicht"]').click();
    await wp.locator('[data-wpbeaufschlagung="verrußt"]').click(); await wp.locator('[data-wpzusatz="Brandraum"]').click();
    assert.equal(await page.locator('#wp-ergebnis').innerText(), 'Haus A EG Küche Brandraum Decke verrußt Untersicht');
    assert.equal(await page.locator('#wp-lk-raum').innerText(), 'Haus A EG Küche Brandraum Decke');
    assert.equal(await page.locator('#wp-lk-ober').innerText(), 'Untersicht'); assert.equal(await page.locator('#wp-lk-beauf').innerText(), 'verrußt');
    assert.equal(await page.locator('#wp-hinweis').innerText(), 'Vollständig.');
    assert.equal(await page.locator('#wp-kopieren').innerText(), 'Für LabelKit „Raum / Ort“ kopieren');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.locator('#wp-kopieren').click();
    await page.waitForFunction(() => /Kopiert|nicht möglich/.test(document.getElementById('wp-hinweis').textContent), null, { timeout: 5000 });
    assert.match(await page.locator('#wp-hinweis').innerText(), /Kopiert: „Haus A EG Küche Brandraum Decke“|Kopieren nicht möglich/, 'nur der Teil für Raum / Ort');
    assert.equal(await wp.locator('[data-wpzusatz="Freimessung"]').count(), 1, 'Freimessung aus konventionen.js');
    await wp.locator('[data-wpzusatz="Brandraum"]').click();   // erneut = abwählen
    await page.locator('#wp-bauteil-frei').fill('Schrank oben');
    assert.equal(await page.locator('#wp-ergebnis').innerText(), 'Haus A EG Küche Schrank oben verrußt Untersicht');
    assert.equal(await wp.locator('[data-wpbauteil="Decke"]').getAttribute('aria-pressed'), 'false', 'eigenes Bauteil ersetzt die Auswahl');
    const wq = page.locator('[data-quiz="wp-regel"]'); await wq.locator('[data-a="0"]').click(); assert.match(await wq.locator('.antwort').innerText(), /Richtig\./);
    // FotoKit: Vorschlag beim Tippen zum Ausprobieren (gleiche Bedienung wie FotoKit 1.16)
    await page.goto(base + '#app-fotokit'); await page.locator('#app-fotokit .schritte [data-geh="3"]').click();
    const sim = page.locator('#fk-sim'), simWert = () => sim.evaluate(e => ({ wert: e.value, markiert: e.value.slice(e.selectionStart, e.selectionEnd) }));
    await sim.click(); await page.keyboard.type('P'); await page.keyboard.type('7');
    assert.deepEqual(await simWert(), { wert: 'P7 Küche verrußt Untersicht', markiert: ' Küche verrußt Untersicht' });
    await page.keyboard.press('Enter');
    assert.match(await page.locator('#fk-sim-liste li').last().innerText(), /Probe-Nr\. P7 · „Küche verrußt Untersicht“/);
    for (const ch of 'Kü') await page.keyboard.type(ch);
    assert.equal((await simWert()).wert, 'Küche verrußt Untersicht', 'zuletzt verwendete Beschreibung zuerst');
    await page.keyboard.press('Escape'); assert.deepEqual(await simWert(), { wert: 'Kü', markiert: '' });
    for (const ch of 'che D') await page.keyboard.type(ch);
    assert.equal((await simWert()).wert, 'Küche Decke');
    await page.keyboard.press('Tab'); await page.keyboard.type(' Detail'); await page.keyboard.press('Enter');
    assert.match(await page.locator('#fk-sim-liste li').last().innerText(), /^Bild 2: „Küche Decke Detail“$/);
    const fq = page.locator('[data-quiz="fk-vorschlag"]'); await fq.locator('[data-a="0"]').click(); assert.match(await fq.locator('.antwort').innerText(), /Richtig\./);
    // ResultKit: Menü zwischen FotoKit und PlanKit, Übung zum Stand je Probe
    assert.deepEqual(await page.locator('nav a[href^="#app-"]').evaluateAll(as => as.slice(2, 5).map(a => a.getAttribute('href'))), ['#app-fotokit', '#app-resultkit', '#app-plankit']);
    await page.goto(base + '#app-resultkit'); await page.locator('#app-resultkit .schritte [data-geh="2"]').click();
    const rq = page.locator('[data-quiz="rk-stand"]');
    await rq.locator('[data-a="1"]').click(); assert.match(await rq.locator('.antwort').innerText(), /Nicht ganz/);
    await rq.locator('[data-a="0"]').click(); assert.match(await rq.locator('.antwort').innerText(), /Richtig\. Beauftragt, aber noch kein Ergebnis/);
    // Datenarchiv: Ziel sichtbar, Rollentester wie im Archiv, Übung zur Rolle
    await page.goto(base + '#app-datenarchiv');
    assert.match(await page.locator('#app-datenarchiv .karte.ziel').innerText(), /Worum es geht[\s\S]*Erfahrungsschatz[\s\S]*bewertet nicht/);
    const rt = async v => { await page.locator('#rolle-pruefen').fill(v); return page.locator('#rolle-ergebnis b').innerText(); };
    assert.equal(await rt('Brandraum Küche Decke'), 'Brandbereich');
    assert.equal(await rt('REF-1-T2'), 'Referenz (unbelastet)');
    assert.equal(await rt('Parkettkleber Flur'), 'Verdachtsquelle');
    assert.equal(await rt('F-EG-WZ-B-7-T1'), 'Freimessung nach Sanierung');
    assert.equal(await rt('Freimessung Brandraum'), 'Freimessung nach Sanierung');
    assert.match(await page.locator('#rolle-ergebnis').innerText(), /nur Bohrkerne mit „F-“/, 'Wischprobe: Rolle ja, Paarung nur mit F-');
    await rt('F-EG-WZ-B-7-T1'); assert.match(await page.locator('#rolle-ergebnis').innerText(), /gepaart \(vorher \/ nachher\)/);
    assert.equal(await rt('Prefab-Wand Flur'), 'ohne Rolle');
    const dq = page.locator('[data-quiz="da-rolle"]');
    await dq.locator('[data-a="0"]').click(); assert.match(await dq.locator('.antwort').innerText(), /Richtig\./);
    assert.equal(await page.locator('nav a[href="#app-datenarchiv"]').count(), 1);
    // Übung BelegKit: einzelne Antwort, richtig → nächste Frage
    await page.goto(base + '#app-belegkit'); await page.locator('#app-belegkit .schritte [data-geh="5"]').click();
    const q = page.locator('[data-quiz="bk-proben"]');
    await q.locator('[data-a="0"]').click(); assert.match(await q.locator('.antwort').innerText(), /Nicht ganz/);
    await q.locator('[data-a="1"]').click(); assert.match(await q.locator('.antwort').innerText(), /Richtig\. Je Parameter/);
    await q.locator('.quiz-weiter').click(); assert.match(await q.locator('.zaehler').innerText(), /Frage 2 von 4/);
    // Übung LabelKit: mehrere Antworten mit „Prüfen“
    await page.goto(base + '#app-labelkit'); await page.locator('#app-labelkit .schritte [data-geh="4"]').click();
    const l = page.locator('[data-quiz="lk-pflicht"]');
    for (const i of [0, 1]) await l.locator(`[data-a="${i}"]`).click();
    await l.locator('.quiz-knopf button').click(); assert.match(await l.locator('.antwort').innerText(), /Nicht ganz/);
    await l.locator('[data-a="2"]').click(); await l.locator('.quiz-knopf button').click(); assert.match(await l.locator('.antwort').innerText(), /Richtig/);
    // Übergabe ans Büro & Rechnung: fünf Schritte, Fluss springt, Übungen
    await page.goto(base + '#buero-uebergabe');
    assert.equal(await page.locator('#buero-uebergabe .schritte button').count(), 5);
    await page.locator('#buero-uebergabe .fluss [data-geh="4"]').click();
    assert.match(await page.locator('#buero-uebergabe .schritt.aktiv h2').innerText(), /4 · Rechnung schreiben/);
    const ur = page.locator('#buero-uebergabe [data-quiz="ub-rechnung"]');
    await ur.locator('[data-a="1"]').click(); assert.match(await ur.locator('.antwort').innerText(), /Nicht ganz/);
    await ur.locator('[data-a="0"]').click(); assert.match(await ur.locator('.antwort').innerText(), /Richtig/);
    await page.locator('#buero-uebergabe .fluss [data-geh="2"]').click();
    const ua = page.locator('#buero-uebergabe [data-quiz="ub-anlagen"]');
    await ua.locator('[data-a="0"]').click(); await ua.locator('[data-a="1"]').click(); await ua.locator('.quiz-knopf button').click();
    assert.match(await ua.locator('.antwort').innerText(), /Richtig/);
    assert.equal(await page.locator('nav a[href="#buero-uebergabe"]').count(), 1);
    await page.goto(base + '#app-buerokit');
    assert.deepEqual(await page.locator('#app-buerokit .schritte button').allInnerTexts().then(t => t.map(x => x.replace(/^\D*\d+\s*·?\s*/, '').replace(/\s*✓$/, '').trim())), ['Einrichten', 'Liste lesen', 'Abhaken', 'Rechnung', 'Eigene Aufgaben']);
    // Haken je Kapitel getrennt
    await page.goto(base + '#app-fotokit'); for (const cb of await page.locator('#app-fotokit .schritt.aktiv .check input').all()) await cb.check();
    await page.goto(base + '#app-plankit'); assert.doesNotMatch(await page.locator('#app-plankit .schritte button').first().innerText(), /✓/, 'Haken nur im eigenen Kapitel');
    await page.goto(base + '#brandschaden');
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
    assert.match(await page.locator('#skala-fall').innerText(), /Fall 1 von 5/);
    await page.locator('[data-skala="eigen"]').click(); assert.match(await page.locator('#skala-antwort').innerText(), /Nicht ganz/);
    await page.locator('[data-skala="vds"]').click(); assert.match(await page.locator('#skala-antwort').innerText(), /Richtig/);
    await page.waitForFunction(() => /Fall 2 von 5/.test(document.getElementById('skala-fall').textContent));
    await page.locator('[data-skala="eigen"]').click(); assert.match(await page.locator('#skala-antwort').innerText(), /keine VdS-Referenz/);
    await page.locator('#brandschaden .fluss [data-geh="5"]').click();
    assert.match(await page.locator('#brandschaden .schritt.aktiv h2').innerText(), /5 · Fotos/);
    assert.equal(await page.locator('#brandschaden .schritt.aktiv a.app-oeffnen').getAttribute('href'), '../Bildumbenenner/');
    for (const cb of await page.locator('#brandschaden .schritt.aktiv .check input').all()) await cb.check();
    assert.match(await page.locator('#brandschaden .schritte button').nth(4).innerText(), /✓/);
    assert.doesNotMatch(await page.locator('#bohrkern-ablauf .schritte button').nth(4).innerText(), /✓/, 'Haken je Kapitel getrennt');
    const hrefs = await page.locator('#brandschaden a.app-oeffnen').evaluateAll(as => [...new Set(as.map(a => a.getAttribute('href')))].sort());
    assert.deepEqual(hrefs, ['../Bildumbenenner/', '../Probenplan/', '../Projektzentrale/', '../aufwandkit/', '../labelkit/', '../resultkit/']);
    await page.locator('#brandschaden h1').click(); await page.keyboard.press('ArrowRight');
    assert.match(await page.locator('#brandschaden .schritt.aktiv h2').innerText(), /6 · Probenplan/, 'Pfeiltasten blättern');
    await page.setViewportSize({ width: 390, height: 800 }); await page.goto(base + '#bohrkern');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'kein waagerechtes Scrollen bei 390 px');
    await page.goto(base + '#brandschaden'); await page.waitForTimeout(100);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Brandschaden: kein waagerechtes Scrollen bei 390 px');
    // Rückmeldung: Links auf der Startseite und im Brandschaden-Ablauf, Programm + Version vorbelegt, eigenes Fenster
    await page.goto(base + '#start');
    const rm = await page.locator('a.rueckmeldung').evaluateAll(as => as.map(a => [a.getAttribute('href'), a.target, a.rel]));
    const ver = (await page.locator('#version').innerText()).replace(/^v/, '');
    assert.equal(rm.length, 2);
    for (const [href, target, rel] of rm) { assert.equal(href, `../rueckmeldung/?app=handbuch&version=${ver}`); assert.equal(target, 'rueckmeldung'); assert.equal(rel, 'noopener'); }

    assert.deepEqual(errors, []);
    console.log(`OK ${name}: Kapitel, ID-Baukasten, Prüfung, Raumsuche, Bohrkern-Ablauf, Brandschaden, 390 px`);
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
