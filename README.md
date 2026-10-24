# AidKit – Handbuch der Spektron-Suite

Wie wir im Büro arbeiten: Abläufe über mehrere Apps und gemeinsame Regeln. Wie eine einzelne App bedient wird, steht in ihrer eigenen Hilfe.

**Adresse:** https://kaspersebastian83-dot.github.io/aidkit/ · Kapitel direkt verlinkbar, z. B. `…/aidkit/#bohrkern`

## Inhalt

| Kapitel | Anker |
|---|---|
| Start, Übersicht der Apps, „Gilt in allen Apps“ | `#start` |
| Brandschaden von A bis Z – der normale Weg durch alle Apps in neun Schritten, mit Übungen zu Pflichtangaben und Bewertungsskala, Überblick „welche App speichert wohin“ und „Wo liegt was?“ | `#brandschaden` |
| Bohrkerne: Schritt für Schritt – sechs Schritte mit Abhakliste, zwei Übungen, Spickzettel zum Drucken | `#bohrkern-ablauf` |
| Probenbezeichnung Bohrkerne – mit ID-Baukasten und ID-Prüfung | `#bohrkern` |
| Raumkürzel | `#raumkuerzel` |

## Aufbau

- `index.html` – das Handbuch, eine Datei, offline lauffähig, keine externen Abhängigkeiten
- `konventionen.js` – **eine Quelle** für Regeln, die auch Apps brauchen: Raumkürzel, Geschosse, Flächen, Aufbau und Prüfung der Bohrkern-ID. Andere Spektron-Apps laden diese Datei später unter `../aidkit/konventionen.js`, damit Handbuch und Apps nie auseinanderlaufen.
- `tests/` – `konventionen.cjs` (Node) und `aidkit-browser.cjs` (Chromium)

Neues Raumkürzel: in `konventionen.js` unter `RAEUME` ergänzen – Handbuch, Baukasten und Prüfung übernehmen es automatisch.

## Versionen

- **0.5.0** – Stand zum Start im Büro: „Gilt in allen Apps“ auf der Startseite (Gelb = Pflicht, einmal eintragen, nichts geht verloren, Hilfe); Brandschaden-Ablauf mit Pflichtangaben in allen Apps, „Ich bin …“, Projektstand, Bewertungsregel VdS / eigene Skala des Büros, vorläufiger Prüfbericht, Abrechnung je Parameter, Bezeichnung der Anlage; zwei neue Übungen („Was ist Pflicht?“, „Welche Skala gilt?“); „Wo liegt was?“ mit den gemeinsamen Dateien im Archivordner; Bohrkerne: Anteil C10–C22.
- **0.4.0** – Bohrkerne Schritt 6: Wandansichten in PlanKit (1.26.0) statt „in Arbeit“.
- **0.3.1** – Bohrkern-Fotos: Kern-ID in FotoKit unter „Probe-Nr.“ (FotoKit 1.11.0, PlanKit 1.25.0 ordnen über LabelKit zu).
- **0.3.0** – Ablauf „Brandschaden von A bis Z“ (Einrichten, Projekt, Vor Ort, Proben erfassen, Fotos, Plan, Laborbericht, Gutachten und Büro, Abrechnung); Ablauf-Kapitel nutzen einen gemeinsamen Baustein (Haken je Kapitel getrennt).
- **0.2.0** – Ablauf „Bohrkerne: Schritt für Schritt“ (Vorbereiten, Begehung, Bohren und beschriften, Übertragen, Ans Labor, Ergebnisse und Bericht).
- **0.1.0** – Erste Version: Start, Probenbezeichnung Bohrkerne (ID-Baukasten, Prüfung), Raumkürzel.
