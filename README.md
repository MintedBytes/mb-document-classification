# Belegklassifikation

Ordnet Belege den Belegarten zu, die Sie je Umgebung pflegen, und schlägt neue
Belegarten vor. Die Zuordnung übernimmt die KI-Anbindung der Umgebung; das
Plugin selbst erreicht kein anderes System.

## Werkzeuge

| Werkzeug | Wirkung | Was es tut |
|---|---|---|
| `document-types.read` | lesend | Liefert die aktiven Belegarten mit Beschreibung und Erkennungshinweis. |
| `documents.classify` | lesend | Ordnet einen Belegtext oder eine Textdatei genau einer Belegart zu. Passt keine, ist `documentType` leer und `confidence` 0. |
| `document-types.suggest` | lesend | Schlägt eine Belegart vor oder nennt eine vorhandene, die schon passt. Speichert nichts. |

Kein Werkzeug schreibt. Belegarten legt nur ein Mensch in der Konfiguration an.

## Einrichtung

1. Plugin installieren und in der Umgebung aktivieren.
2. Eine KI-Anbindung der Umgebung auswählen (Pflicht).
3. Unter „Konfigurieren“ Belegarten pflegen: Bezeichnung, Beschreibung und vor
   allem einen **Erkennungshinweis** – typische Begriffe, Pflichtangaben,
   Absender. Je genauer der Hinweis, desto sicherer die Zuordnung.

## Eingaben

`documents.classify` und `document-types.suggest` nehmen **genau eines**:

- `documentText` – der Text des Belegs, oder
- `documentFile` – eine Datei des Aufrufs als Text: TXT, XML (z. B. XRechnung,
  ZUGFeRD-XML), CSV oder JSON in UTF-8.

PDF und Bilder brauchen eine vorgelagerte Texterkennung; deren Text geht dann
in `documentText`. Sehr lange Belege werden gekürzt übergeben (`truncated`), damit
die Anfrage an die KI in ihrer Grenze bleibt.

## In Automationen

Das Plugin stellt die Kategorie `documents.classification` (Vertrag `1.0`) bereit:

```ts
const classifier = requirePlugin("documents.classification");
const result = await classifier.documentsClassify({ body: { documentText: "Rechnung Nr. 2026-0815 …" } });
if (result.documentType === "" || result.confidence < 0.7) {
  // zur manuellen Prüfung
}
```

## Fehlercodes

| Code | Bedeutung |
|---|---|
| `document.input_required` | Weder oder sowohl Text als auch Datei angegeben. |
| `document.unsupported_file` | Die Datei ist keine Textdatei (z. B. PDF, Bild). |
| `document.not_utf8` | Die Textdatei ist nicht UTF-8-kodiert. |
| `document.empty` | Die Datei enthält keinen Text. |
| `document_types.empty` | In der Umgebung ist keine aktive Belegart gepflegt. |
| `document_types.too_large` | Die Belegarten sind zusammen zu umfangreich für eine Anfrage. |

## Datenschutz

Der Belegtext und die gepflegten Belegarten gehen an die KI-Anbindung, die Sie
für die Umgebung auswählen – und nur dorthin. Belegtexte und Beschreibungen
werden der KI ausdrücklich als Daten übergeben, nicht als Anweisungen.

## In MintedBytes installieren

Als Administrator der Organisation: **Plugins → Aus GitHub**, dann als
Repository `https://github.com/MintedBytes/mb-document-classification`
eintragen — mehr nicht. Ein Repository ist ein Plugin; die `plugin.json` liegt
hier im Wurzelverzeichnis.

Der Assistent liest das Repository, prüft die Plugin-Datei und den Code, fragt
nach dem Vertrauen und richtet die Installation ein. Das Repository muss
öffentlich sein.

## Entwickeln

Voraussetzungen: Go (für `mbplugin` aus dem Backend) und Deno.

```bash
mbplugin check -dir .   # Manifest, Dateien und Typen gegen das SDK
mbplugin test -dir .    # Fälle aus test/cases.json mit aufgezeichneten KI-Antworten
mbplugin pack -dir . -out mb-document-classification.mbplugin
```

`mbplugin` kommt aus dem Backend: `go build -o mbplugin ./cmd/mbplugin`.

In die Plugin-Datei kommen nur `plugin.json`, `README.md`, `CHANGELOG.md`,
`icon.svg` und `src/*.ts`. Die Tests unter `test/` bleiben im Repository.

## Eine neue Version veröffentlichen

1. `version` in `plugin.json` erhöhen und `CHANGELOG.md` ergänzen. Eine Version
   bezeichnet genau eine Datei: Wer den Inhalt ändert, erhöht die Version.
2. `mbplugin check` und `mbplugin test` laufen lassen, committen, pushen.
3. In MintedBytes erneut **Aus GitHub** – der Assistent zeigt die Änderungen
   gegenüber der vertrauten Version. Die Umstellung je Umgebung geschieht in der
   Installation mit Vergleich vor dem Umschalten.
