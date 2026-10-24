// Probenbezeichnung Bohrkerne: Aufbau, Prüfung, gesprochene Form. Ohne Browser.
const assert = require('node:assert/strict');
const K = require('../konventionen.js');
let n = 0; const ok = (name, fn) => { fn(); n++; console.log('OK Konventionen: ' + name); };

ok('ID aus Teilen', () => {
  assert.equal(K.bohrkernId({ geschoss: 'EG', raum: 'WZ', flaeche: 'B', punkt: '7', tiefe: '2' }), 'EG-WZ-B-7-T2');
  assert.equal(K.bohrkernId({ geschoss: 'EG', raum: 'WZ', flaeche: 'B', punkt: '7' }), 'EG-WZ-B-7', 'ohne Tiefe = ganzer Kern');
  assert.equal(K.bohrkernId({ geschoss: '1OG', raum: 'KZ', raumNr: '2', flaeche: 'B', punkt: '7', zusatz: 'a', tiefe: '2' }), '1OG-KZ2-B-7a-T2');
  assert.equal(K.bohrkernId({ referenz: true, refNr: '1', tiefe: '2' }), 'REF-1-T2');
  assert.equal(K.bohrkernId({ freimessung: true, geschoss: 'EG', raum: 'WZ', flaeche: 'B', punkt: '7', tiefe: '1' }), 'F-EG-WZ-B-7-T1');
  assert.equal(K.bohrkernId({ geschoss: 'EG', raum: 'WZ', flaeche: 'B' }), '', 'unvollständig');
});
ok('jede übliche ID aus dem Baukasten besteht die Prüfung (höchstens 20 Zeichen)', () => {
  for (const [g] of K.GESCHOSSE) for (const [r] of K.RAEUME) for (const [f] of K.FLAECHEN) {
    const id = K.bohrkernId({ freimessung: true, geschoss: g, raum: r, raumNr: '4', flaeche: f, punkt: '9', zusatz: 'a', tiefe: '5' });
    const p = K.pruefeId(id); assert.ok(p.ok, `${id}: ${p.fehler.join(' ')}`);
  }
  const lang = K.pruefeId('F-1OG-HWR4-BO-12a-T5');
  assert.equal(lang.ok, true, 'längste mögliche ID (20 Zeichen) passt'); assert.equal('F-1OG-HWR4-BO-12a-T5'.length, K.MAX_LAENGE);
});
ok('Prüfung erklärt Fehler verständlich', () => {
  assert.match(K.pruefeId('eg-wz-b-7-t2').fehler.join(), /Großbuchstaben/);
  assert.match(K.pruefeId('EG-KÜ-B-7-T2').fehler.join(), /Umlaute/);
  assert.match(K.pruefeId('EG WZ B 7').fehler.join(), /Leerzeichen/);
  assert.match(K.pruefeId('EG-WZ-B-7a-T2-XYZ').fehler.join(), /Zeichen|Aufbau/);
  assert.match(K.pruefeId('EG-WZ-X-7-T2').fehler.join(), /Aufbau/);
  assert.match(K.pruefeId('EG-WZ-B-0-T2').fehler.join(), /Aufbau/, 'Punkt 0 gibt es nicht');
  assert.equal(K.pruefeId('').ok, false);
});
ok('Hinweise: unbekanntes Raumkürzel, ganzer Kern', () => {
  const p = K.pruefeId('EG-XY-B-7-T1'); assert.equal(p.ok, true); assert.match(p.hinweise.join(), /nicht in der Liste/);
  assert.match(K.pruefeId('EG-WZ-B-7').hinweise.join(), /ganzen Bohrkern/);
});
ok('gesprochene Form', () => {
  assert.equal(K.pruefeId('EG-WZ-B-7-T2').gesprochen, 'Erdgeschoss, Wohnzimmer, Wand B, Punkt 7 (bodennah links), Tiefe 2');
  assert.equal(K.pruefeId('EG-KUE-BO-1-T1').gesprochen, 'Erdgeschoss, Küche, Boden, Punkt 1 (Ecke A/D), Tiefe 1');
  assert.equal(K.pruefeId('F-REF-2').gesprochen, 'Freimessung, Referenzkern 2, ganzer Bohrkern');
  assert.match(K.pruefeId('EG-WZ-B-12-T1').gesprochen, /außerhalb des Rasters/);
});
ok('Raumkürzel eindeutig, ohne Umlaute, passend zum Muster', () => {
  const k = K.RAEUME.map(r => r[0]); assert.equal(new Set(k).size, k.length);
  for (const x of k) assert.match(x, /^[A-Z]{2,3}$/);
});
console.log(`OK Konventionen: ${n} Fälle`);
