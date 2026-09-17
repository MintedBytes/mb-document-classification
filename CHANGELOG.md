# Änderungen

## 1.0.1

- Das Plugin liegt jetzt im Wurzelverzeichnis des Repositorys statt unter
  `plugins/<name>/`: Ein Repository ist ein Plugin. Am Code ändert sich nichts;
  die Plugin-Datei enthält die zusammengeführte README und hat deshalb einen
  neuen Fingerabdruck.

## 1.0.0

- Erste Fassung als Sandbox-Plugin, abgelöst vom Workflow-Plugin
  `mintedbytes.document-classification` 2.0.0.
- `documents.classify` und `document-types.suggest` nehmen neben Text auch eine
  Textdatei des Aufrufs (TXT, XML wie XRechnung, CSV, JSON).
- Die Antwort der KI ist auf die gepflegten Belegarten beschränkt; ohne Treffer
  ist `confidence` 0.
- `document-types.suggest` nennt eine vorhandene Belegart, die schon passt
  (`existingType`), und liefert eine Kennung (`slug`) zum Vorschlag.
- Lange Belege werden innerhalb der Grenze der KI-Anfrage gekürzt (`truncated`).
