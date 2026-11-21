// Kopie gegen die Projektzentrale (Audit 2026-11 Lauf 5, E4 #12): rolleAuto in index.html („Rolle prüfen“) ist eine Kopie von
// Projektzentrale archiv/auswertung.js. AidKit liest nur einen Text und gibt [Rolle, Erklärung] zurück, die Projektzentrale
// liest Probenbezeichnung + Beschreibung und gibt einen Code zurück. Gleiche Eingabe → gleiche Rolle, als Bezeichnung und als Beschreibung.
// Projektzentrale daneben (../projektzentrale); in der CI Pflicht (ROLLE_PFLICHT=1), sonst SKIP. Ohne Browser.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const datei = path.join(__dirname, '..', '..', 'projektzentrale', 'archiv', 'auswertung.js');
if (!fs.existsSync(datei)){
  assert.ok(process.env.ROLLE_PFLICHT !== '1', `Projektzentrale fehlt: ${datei} (ROLLE_PFLICHT=1)`);
  console.log(`SKIP Kopie rolleAuto: ${datei} nicht gefunden`); process.exit(0);
}
const PZ = require(datei);
assert.equal(typeof PZ.rolleAuto, 'function', 'Projektzentrale exportiert rolleAuto');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const a = html.indexOf('function rolleAuto(ref){'), b = html.indexOf('\n}\n', a);
assert.ok(a > 0 && b > a, 'rolleAuto in index.html gefunden');
const ctx = {}; vm.runInNewContext(html.slice(a, b + 2) + '\nthis.rolleAuto = rolleAuto;', ctx);

// Anzeige in AidKit → Code der Projektzentrale
const CODE = { 'Freimessung nach Sanierung': 'frei', 'Referenz (unbelastet)': 'referenz', 'Verdachtsquelle': 'quelle', 'Brandbereich': 'brand', 'ohne Rolle': '' };
const aid = t => { const r = ctx.rolleAuto(t); assert.ok(r[0] in CODE, `unbekannte Rolle „${r[0]}“`); return CODE[r[0]]; };

const texte = ['P1', 'F-EG-WZ-B-7-T1', 'f_OG-K-2', 'F EG', 'F-', 'Fenster EG', 'REF-1', 'Ref', 'ref.', 'Prefix', 'EG-REF', 'KREF', 'Referenz', 'referenzprobe',
  'EG-WZ-B-7', '', '  ', 'EG Küche verrußt Wand', 'Freimessung nach Sanierung', 'Sanierungskontrolle OG', 'nach der Sanierung', 'nach Sanierung', 'Referenz aus unbelasteter Stelle',
  'Nullprobe Garten', 'Hintergrundwert', 'Fliesenkleber Bad', 'Teerpappe Dach', 'Bitumen Anstrich', 'Dachpappe alt', 'Schwarzanstrich Keller', 'EG Wohnen Brandraum Decke',
  'Brandbereich Flur', 'Brandherd', 'Brandstelle Küche', 'Brandausbruch', 'Prefabrikat', 'Kleberrest im Brandraum', 'ÖG Bad', 'Freimessung Brandraum Referenz', 'Treppenhaus REF',
  'Hintergrund, Kleber', 'BRANDRAUM', 'Brand raum', 'Brändraum', 'Rückstellprobe', 'Ref.-Stelle Garten', 'Unbelastet'];
let n = 0;
for (const t of texte){
  assert.equal(aid(t), PZ.rolleAuto(t, ''), `als Bezeichnung: rolleAuto(${JSON.stringify(t)})`);
  assert.equal(aid(t), PZ.rolleAuto('', t), `als Beschreibung: rolleAuto(${JSON.stringify(t)})`);
  n += 2;
}
for (const x of [null, undefined]){ assert.equal(aid(x), PZ.rolleAuto(x, x)); n++; }
console.log(`OK Kopie Projektzentrale: rolleAuto gleich (${n} Fälle, ${path.dirname(path.dirname(datei))})`);
