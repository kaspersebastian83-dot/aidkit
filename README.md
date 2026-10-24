# AidKit – Handbuch der Spektron-Suite

Wie wir im Büro arbeiten: Abläufe über mehrere Apps und gemeinsame Regeln. Wie eine einzelne App bedient wird, steht in ihrer eigenen Hilfe.

**Adresse:** https://kaspersebastian83-dot.github.io/aidkit/ · Kapitel direkt verlinkbar, z. B. `…/aidkit/#bohrkern`

## Inhalt

| Kapitel | Anker |
|---|---|
| Start, Übersicht der Apps | `#start` |
| Probenbezeichnung Bohrkerne – mit ID-Baukasten und ID-Prüfung | `#bohrkern` |
| Raumkürzel | `#raumkuerzel` |

## Aufbau

- `index.html` – das Handbuch, eine Datei, offline lauffähig, keine externen Abhängigkeiten
- `konventionen.js` – **eine Quelle** für Regeln, die auch Apps brauchen: Raumkürzel, Geschosse, Flächen, Aufbau und Prüfung der Bohrkern-ID. Andere Spektron-Apps laden diese Datei später unter `../aidkit/konventionen.js`, damit Handbuch und Apps nie auseinanderlaufen.
- `tests/` – `konventionen.cjs` (Node) und `aidkit-browser.cjs` (Chromium)

Neues Raumkürzel: in `konventionen.js` unter `RAEUME` ergänzen – Handbuch, Baukasten und Prüfung übernehmen es automatisch.

## Versionen

- **0.1.0** – Erste Version: Start, Probenbezeichnung Bohrkerne (ID-Baukasten, Prüfung), Raumkürzel.
