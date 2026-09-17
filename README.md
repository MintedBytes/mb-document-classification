# MintedBytes Belegklassifikation

Plugin-Repository für MintedBytes. Jedes Plugin liegt in einem eigenen Ordner
unter `plugins/`.

| Plugin | Kennung | Laufzeit |
|---|---|---|
| [Belegklassifikation](plugins/mb-document-classification/README.md) | `organisation.document-classification` | Sandbox (TypeScript) |

## In MintedBytes installieren

Als Administrator der Organisation: **Plugins → Aus GitHub**, dann

- **GitHub-Adresse:** `https://github.com/MintedBytes/mb-document-classification`
- **Ordner:** `plugins/` `mb-document-classification`

oder direkt die Ordneradresse einfügen:
`https://github.com/MintedBytes/mb-document-classification/tree/main/plugins/mb-document-classification`.

Der Assistent liest das Repository, prüft die Plugin-Datei und den Code, fragt
nach dem Vertrauen und richtet die Installation ein. Das Repository muss
öffentlich sein.

## Entwickeln

Voraussetzungen: Go (für `mbplugin` aus dem Backend) und Deno.

```bash
cd plugins/mb-document-classification
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
