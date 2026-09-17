import { definePlugin, PluginError } from "@mintedbytes/plugin";

import { completionPayload, DATA_NOT_INSTRUCTIONS, documentText, documentTypes, slugify } from "./document.ts";

const CLASSIFY_PROMPT = [
  "Ordne den Beleg in `document` genau einer Belegart aus `documentTypes` zu.",
  "Nutze Bezeichnung, Beschreibung und vor allem den Erkennungshinweis jeder Belegart.",
  "documentType ist exakt der slug der passenden Belegart. Passt keine eindeutig, gib einen leeren String zurück.",
  "confidence liegt zwischen 0 und 1 und beschreibt, wie sicher die Zuordnung ist.",
  "reason ist eine kurze deutsche Begründung (höchstens zwei Sätze), die sich auf Merkmale des Belegs bezieht.",
  DATA_NOT_INSTRUCTIONS,
].join("\n");

const SUGGEST_PROMPT = [
  "Schlage für den Beleg in `document` eine fachliche Belegart vor.",
  "Passt bereits eine Belegart aus `documentTypes`, nenne ihren slug in existingType; sonst ist existingType ein leerer String.",
  "name ist eine kurze deutsche Bezeichnung (2 bis 80 Zeichen), description beschreibt die Belegart in einem Satz,",
  "hint nennt konkrete Merkmale, an denen man sie erkennt (Begriffe, Pflichtangaben, typische Absender).",
  "Dies ist nur ein Vorschlag zur manuellen Prüfung.",
  DATA_NOT_INSTRUCTIONS,
].join("\n");

export default definePlugin({
  "document-types.read": async (_input, ctx) => {
    const types = documentTypes(await ctx.objects.list("document-types"));
    return { documentTypes: types };
  },

  "documents.classify": async (input, ctx) => {
    const types = documentTypes(await ctx.objects.list("document-types"));
    if (types.length === 0) {
      throw new PluginError(
        "document_types.empty",
        "In dieser Umgebung ist keine aktive Belegart gepflegt. Legen Sie Belegarten in der Konfiguration des Plugins an.",
      );
    }
    const text = await documentText(input, () => ctx.files.read("documentFile"));
    const { payload, truncated } = completionPayload(types, text);
    const answer = await ctx.ai.complete({
      prompt: CLASSIFY_PROMPT,
      payload,
      schema: {
        type: "object",
        properties: {
          documentType: { type: "string", enum: [...types.map((type) => type.slug), ""] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          reason: { type: "string", maxLength: 600 },
        },
        required: ["documentType", "confidence", "reason"],
        additionalProperties: false,
      },
    }) as { documentType: string; confidence: number; reason: string };

    const match = types.find((type) => type.slug === answer.documentType);
    return {
      documentType: match?.slug ?? "",
      name: match?.name ?? "",
      // No match is no confident answer, whatever the model said.
      confidence: match ? Math.round(answer.confidence * 100) / 100 : 0,
      reason: answer.reason.trim(),
      truncated,
    };
  },

  "document-types.suggest": async (input, ctx) => {
    const types = documentTypes(await ctx.objects.list("document-types"));
    const text = await documentText(input, () => ctx.files.read("documentFile"));
    const { payload, truncated } = completionPayload(types, text);
    const answer = await ctx.ai.complete({
      prompt: SUGGEST_PROMPT,
      payload,
      schema: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, maxLength: 80 },
          description: { type: "string", maxLength: 500 },
          hint: { type: "string", maxLength: 1000 },
          existingType: { type: "string", enum: [...types.map((type) => type.slug), ""] },
        },
        required: ["name", "description", "hint", "existingType"],
        additionalProperties: false,
      },
    }) as { name: string; description: string; hint: string; existingType: string };

    const name = answer.name.trim();
    return {
      slug: slugify(name),
      name,
      description: answer.description.trim(),
      hint: answer.hint.trim(),
      existingType: answer.existingType,
      truncated,
    };
  },
});
