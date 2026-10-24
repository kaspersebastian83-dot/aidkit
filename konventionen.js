/* Spektron – gemeinsame Konventionen (eine Quelle für AidKit und später LabelKit/PlanKit).
   Probenbezeichnung Bohrkerne: Geschoss-Raum-Fläche-Punkt-Tiefe, z. B. EG-WZ-B-7-T2.
   Reine Funktionen, keine Abhängigkeiten; im Browser als window.SpektronKonventionen, in Node über require(). */
(function(root){
  'use strict';
  const MAX_LAENGE = 20;   // reicht für alle üblichen IDs; PlanKit-Kennungen (heute 16) werden mit den Bohrkernen auf 20 erweitert

  const GESCHOSSE = [
    ['KG', 'Kellergeschoss'], ['UG', 'Untergeschoss'], ['EG', 'Erdgeschoss'],
    ['1OG', '1. Obergeschoss'], ['2OG', '2. Obergeschoss'], ['3OG', '3. Obergeschoss'], ['DG', 'Dachgeschoss'],
  ];

  /** Raumkürzel: hier ergänzen, dann gelten sie überall. */
  const RAEUME = [
    ['WZ', 'Wohnzimmer'], ['SZ', 'Schlafzimmer'], ['KZ', 'Kinderzimmer'], ['AZ', 'Arbeitszimmer'],
    ['GZ', 'Gästezimmer'], ['EZ', 'Esszimmer'], ['KUE', 'Küche'], ['BA', 'Bad'], ['WC', 'Gäste-WC'],
    ['FL', 'Flur, Diele'], ['TH', 'Treppenhaus'], ['HWR', 'Hauswirtschaftsraum'], ['HK', 'Heizungskeller, Heizraum'],
    ['TR', 'Tankraum'], ['KE', 'Kellerraum'], ['AR', 'Abstellraum'], ['GA', 'Garage'], ['BU', 'Büro'],
    ['LA', 'Lager'], ['WS', 'Werkstatt'],
  ];

  const FLAECHEN = [
    ['A', 'Wand A (Wand mit der Zugangstür)'], ['B', 'Wand B'], ['C', 'Wand C'], ['D', 'Wand D'],
    ['E', 'Wand E'], ['F', 'Wand F'], ['G', 'Wand G'], ['H', 'Wand H'], ['BO', 'Boden'], ['DE', 'Decke'],
  ];

  /** Raster 3 × 3 wie eine Telefontastatur, von vorn auf die Fläche gesehen. */
  const RASTER = { 1: 'deckennah links', 2: 'deckennah Mitte', 3: 'deckennah rechts',
    4: 'Mitte links', 5: 'Mitte', 6: 'Mitte rechts', 7: 'bodennah links', 8: 'bodennah Mitte', 9: 'bodennah rechts' };
  const RASTER_BODEN = { 1: 'Ecke A/D', 2: 'an Wand A, Mitte', 3: 'Ecke A/B', 4: 'an Wand D, Mitte', 5: 'Raummitte',
    6: 'an Wand B, Mitte', 7: 'Ecke C/D', 8: 'an Wand C, Mitte', 9: 'Ecke B/C' };

  const MUSTER = /^(F-)?(?:(REF)-(\d{1,2})|(KG|UG|EG|[1-9]OG|DG)-([A-Z]{2,3})([1-9]?)-([A-H]|BO|DE)-([1-9]\d?)([a-z]?))(?:-T([1-9]))?$/;
  const geschossName = k => (GESCHOSSE.find(g => g[0] === k) || [k, k])[1];
  const raumName = k => (RAEUME.find(r => r[0] === k) || [])[1];
  const lage = (flaeche, punkt) => { const n = Number(punkt); if (n >= 10) return 'außerhalb des Rasters'; return (flaeche === 'BO' || flaeche === 'DE' ? RASTER_BODEN : RASTER)[n] || ''; };

  /**
   * Baut eine ID aus ihren Teilen. Leere oder fehlende Pflichtteile ergeben ''.
   * {freimessung, referenz, refNr, geschoss, raum, raumNr, flaeche, punkt, zusatz, tiefe}
   */
  function bohrkernId(t = {}){
    const f = t.freimessung ? 'F-' : '', tiefe = t.tiefe ? `-T${t.tiefe}` : '';
    if (t.referenz){ if (!t.refNr) return ''; return `${f}REF-${t.refNr}${tiefe}`; }
    if (!t.geschoss || !t.raum || !t.flaeche || !t.punkt) return '';
    return `${f}${t.geschoss}-${t.raum}${t.raumNr || ''}-${t.flaeche}-${t.punkt}${t.zusatz || ''}${tiefe}`;
  }

  /** Prüft eine ID; liefert {ok, fehler[], hinweise[], teile, gesprochen}. */
  function pruefeId(roh){
    const id = String(roh || '').trim(), fehler = [], hinweise = [];
    if (!id) return { ok: false, fehler: ['Keine ID eingegeben.'], hinweise, teile: null, gesprochen: '' };
    if (/[a-z]/.test(id.replace(/-\d+[a-z](?=-T|$)/, ''))) fehler.push('Großbuchstaben verwenden (nur der Zusatz am Punkt, z. B. 7a, ist klein).');
    if (/[ÄÖÜäöüß]/.test(id)) fehler.push('Keine Umlaute: z. B. KUE statt KÜ.');
    if (/\s/.test(id)) fehler.push('Keine Leerzeichen, Teile mit Bindestrich trennen.');
    if (id.length > MAX_LAENGE) fehler.push(`${id.length} Zeichen – höchstens ${MAX_LAENGE} – Raum- oder Punktangabe kürzen.`);
    const m = MUSTER.exec(id);
    if (!m){
      if (!fehler.length) fehler.push('Aufbau passt nicht: Geschoss-Raum-Fläche-Punkt-Tiefe, z. B. EG-WZ-B-7-T2.');
      return { ok: false, fehler, hinweise, teile: null, gesprochen: '' };
    }
    const [, frei, ref, refNr, geschoss, raum, raumNr, flaeche, punkt, zusatz, tiefe] = m;
    const teile = { freimessung: !!frei, referenz: !!ref, refNr: refNr || '', geschoss: geschoss || '', raum: raum || '', raumNr: raumNr || '',
      flaeche: flaeche || '', punkt: punkt || '', zusatz: zusatz || '', tiefe: tiefe || '' };
    if (raum && !raumName(raum)) hinweise.push(`Raumkürzel „${raum}“ steht nicht in der Liste – bitte dort ergänzen, damit alle dasselbe benutzen.`);
    if (!tiefe) hinweise.push('Ohne Tiefe bezeichnet die ID den ganzen Bohrkern, nicht ein Segment.');
    return { ok: !fehler.length, fehler, hinweise, teile, gesprochen: gesprochen(teile) };
  }

  /** „EG Wohnzimmer, Wand B, Punkt 7 (bodennah links), Tiefe 2“ */
  function gesprochen(t){
    const out = [];
    if (t.freimessung) out.push('Freimessung');
    if (t.referenz) out.push(`Referenzkern ${t.refNr}`);
    else {
      out.push(`${geschossName(t.geschoss)}, ${raumName(t.raum) || t.raum}${t.raumNr ? ' ' + t.raumNr : ''}`);
      out.push(t.flaeche === 'BO' ? 'Boden' : t.flaeche === 'DE' ? 'Decke' : `Wand ${t.flaeche}`);
      const l = lage(t.flaeche, t.punkt);
      out.push(`Punkt ${t.punkt}${t.zusatz}${l ? ` (${l})` : ''}`);
    }
    out.push(t.tiefe ? `Tiefe ${t.tiefe}` : 'ganzer Bohrkern');
    return out.join(', ');
  }

  const api = Object.freeze({ MAX_LAENGE, GESCHOSSE, RAEUME, FLAECHEN, RASTER, RASTER_BODEN, bohrkernId, pruefeId, gesprochen, lage, raumName });
  root.SpektronKonventionen = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
