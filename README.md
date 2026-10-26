# AidKit – Handbuch der Spektron-Suite

Wie wir im Büro arbeiten: Abläufe über mehrere Apps und gemeinsame Regeln. Wie eine einzelne App bedient wird, steht in ihrer eigenen Hilfe.

**Adresse:** https://kaspersebastian83-dot.github.io/aidkit/ · Kapitel direkt verlinkbar, z. B. `…/aidkit/#bohrkern`

## Inhalt

| Kapitel | Anker |
|---|---|
| Start, Übersicht der Apps, „Gilt in allen Apps“ | `#start` |
| Brandschaden von A bis Z – der normale Weg durch alle Apps in neun Schritten, mit Übungen zu Pflichtangaben und Bewertungsskala, Überblick „welche App speichert wohin“ und „Wo liegt was?“ | `#brandschaden` |
| Bohrkerne: Schritt für Schritt – sechs Schritte mit Abhakliste, zwei Übungen, Spickzettel zum Drucken | `#bohrkern-ablauf` |
| Apps Schritt für Schritt – je App ein Kapitel mit Schrittleiste, Abhakliste, Übungen und Tastenkürzeln: Projektzentrale, LabelKit, FotoKit, PlanKit, BelegKit, SpesenKit | `#app-projektzentrale`, `#app-labelkit`, `#app-fotokit`, `#app-plankit`, `#app-belegkit`, `#app-spesenkit` |
| Probenbezeichnung Bohrkerne – mit ID-Baukasten und ID-Prüfung | `#bohrkern` |
| Raumkürzel | `#raumkuerzel` |

## Aufbau

- `index.html` – das Handbuch, eine Datei, offline lauffähig, keine externen Abhängigkeiten
- `konventionen.js` – **eine Quelle** für Regeln, die auch Apps brauchen: Raumkürzel, Geschosse, Flächen, Aufbau und Prüfung der Bohrkern-ID. Andere Spektron-Apps laden diese Datei später unter `../aidkit/konventionen.js`, damit Handbuch und Apps nie auseinanderlaufen.
- `tests/` – `konventionen.cjs` (Node) und `aidkit-browser.cjs` (Chromium)

Neues Raumkürzel: in `konventionen.js` unter `RAEUME` ergänzen – Handbuch, Baukasten und Prüfung übernehmen es automatisch.

## Versionen

- **0.8.2** – Durchsicht vor dem Einsatz: Wischproben mit Leerzeichen statt „ · “, wie bisher in LabelKit („EG Küche Brandraum Decke“); Beispiele in A–Z, LabelKit und Datenarchiv nach dieser Regel, 1OG statt OG; Bohrkerne Boden/Decke eindeutig „wie im Grundriss, Wand A oben“ (Decke nicht von unten), Tür-Merksatz B links, C gegenüber, D rechts; Baukasten kopiert nur den Teil für „Raum / Ort“; „P7 + Enter“ nur mit Vorschlägen; Freimessung wird nur bei Bohrkern-IDs gepaart; Hilfe-Hinweis 📘/?/F1; EOL erklärt; „Endung“ erklärt; Freimessung in `W_ZUSAETZE`; SpesenKit Schritt 6 genauer („Abrechnung fortsetzen“, „Abrechnung drucken“ erst nach dem Abschließen, „Jetzt sichern“ mit verbundenem Ordner) und Schritt 3 „nach Mitternacht zurück“ (ab SpesenKit 1.8.2); Rollen-Prüfung im Datenarchiv-Kapitel verspricht die automatische Paarung nur noch bei Bohrkern-IDs mit „F-“.
- **0.8.1** – Feste Kapiteladressen für die Hilfe-Knöpfe der Apps (`hilfe-anker.json`, z. B. `../aidkit/#wischprobe`) mit Prüfung `tests/hilfe-anker.cjs`: Kapitel nicht umbenennen, sonst schlägt die Prüfung an.
- **0.8.0** – Neue Konvention „Probenbezeichnung Wischproben“: lesbarer Text von groß nach klein (Gebäude · Geschoss · Raum · Zusatz zum Raum, z. B. Brandraum · Bauteil · Beaufschlagung · Oberflächenart – Reihenfolge der LabelKit-Übergabe an Eurofins, nicht ändern) mit Baukasten, Aufteilung für LabelKit und Übung; Regeln in `konventionen.js` (`wischBezeichnung`, `wischLabelKit`), Listen geprüft gleich wie in LabelKit.
- **0.7.1** – FotoKit-Kapitel: Vorschlag beim Tippen und „P7 + Enter“ (FotoKit 1.16) mit Ausprobier-Feld, Übung und Tastenkürzeln.
- **0.7.0** – Neues Kapitel „Datenarchiv“ (Gruppe „Auswerten“): worum es geht (Erfahrungsschatz aus den eigenen Laborwerten, Muster im Fall, Sanierungsnachweis, eigene Referenzmuster), sechs Schritte, Proben benennen für die Rollen (Brandraum/Brandbereich, Referenz/REF, Kleber/Teer/Bitumen, F- für Freimessung) mit Live-Prüfung wie im Archiv, Übungen zu Rollen und zum richtigen Lesen (Median „< BG“, Ähnlichkeit stützt nur, Literaturquotienten).
- **0.6.0** – Apps Schritt für Schritt: je App ein eigenes Kapitel im Stil der Abläufe (Schritte, Haken je Kapitel, Spickzettel, Übungen mit Rückmeldung, Tastenkürzel); gemeinsamer Übungsbaustein (`QUIZ` / `initQuiz`); Bezeichnungen in den Abläufen aktualisiert („Proben übernehmen …“, „Fotos & Dokumentation“).
- **0.5.0** – Stand zum Start im Büro: „Gilt in allen Apps“ auf der Startseite (Gelb = Pflicht, einmal eintragen, nichts geht verloren, Hilfe); Brandschaden-Ablauf mit Pflichtangaben in allen Apps, „Ich bin …“, Projektstand, Bewertungsregel VdS / eigene Skala des Büros, vorläufiger Prüfbericht, Abrechnung je Parameter, Bezeichnung der Anlage; zwei neue Übungen („Was ist Pflicht?“, „Welche Skala gilt?“); „Wo liegt was?“ mit den gemeinsamen Dateien im Archivordner; Bohrkerne: Anteil C10–C22.
- **0.4.0** – Bohrkerne Schritt 6: Wandansichten in PlanKit (1.26.0) statt „in Arbeit“.
- **0.3.1** – Bohrkern-Fotos: Kern-ID in FotoKit unter „Probe-Nr.“ (FotoKit 1.11.0, PlanKit 1.25.0 ordnen über LabelKit zu).
- **0.3.0** – Ablauf „Brandschaden von A bis Z“ (Einrichten, Projekt, Vor Ort, Proben erfassen, Fotos, Plan, Laborbericht, Gutachten und Büro, Abrechnung); Ablauf-Kapitel nutzen einen gemeinsamen Baustein (Haken je Kapitel getrennt).
- **0.2.0** – Ablauf „Bohrkerne: Schritt für Schritt“ (Vorbereiten, Begehung, Bohren und beschriften, Übertragen, Ans Labor, Ergebnisse und Bericht).
- **0.1.0** – Erste Version: Start, Probenbezeichnung Bohrkerne (ID-Baukasten, Prüfung), Raumkürzel.
