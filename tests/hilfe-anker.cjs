// Feste Kapiteladressen für die Hilfe-Knöpfe der Apps: jede Adresse aus hilfe-anker.json ist ein Kapitel (<section id>) im Handbuch.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const root = path.join(__dirname, '..');
const liste = JSON.parse(fs.readFileSync(path.join(root, 'hilfe-anker.json'), 'utf8'));
assert.equal(liste.format, 'spektron-hilfe-anker'); assert.equal(liste.version, 1);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const kapitel = new Set([...html.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]));
for (const [id, titel] of Object.entries(liste.anker)){
  assert.ok(kapitel.has(id), `Hilfe-Adresse #${id} („${titel}“) fehlt als Kapitel – Apps verlinken darauf`);
  assert.match(id, /^[a-z0-9-]+$/, 'nur Kleinbuchstaben, Ziffern, Bindestrich');
}
// IDs im Handbuch eindeutig – sonst schaltet ein Label den falschen Haken und zwei Haken teilen sich den Speicher (Codex, PR #42)
{ const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]), doppelt = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
  assert.deepEqual(doppelt, [], 'doppelte id im Handbuch: ' + doppelt.join(', ')); }
console.log(`OK Hilfe-Adressen: ${Object.keys(liste.anker).length} Kapitel vorhanden`);
