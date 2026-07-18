import type { Value } from "platejs";

export function isPlateEditorEmpty(value: Value | null | undefined): boolean {
  if (!value || !Array.isArray(value)) return true;
  if (value.length === 0) return true;

  if (value.length === 1) {
    const node = value[0];
    if (
      node &&
      typeof node === "object" &&
      "type" in node &&
      node.type === "p" &&
      "children" in node &&
      Array.isArray(node.children) &&
      node.children.length === 1
    ) {
      const child = node.children[0];
      if (child && typeof child === "object" && "text" in child) {
        const text = (child as { text?: string }).text;
        return !text || text.trim() === "";
      }
    }
  }

  return false;
}

export function convertPlateI18nToJson(
  i18nValues: Record<string, Value> | null | undefined
): Record<string, string> {
  if (!i18nValues) return {};

  const result: Record<string, string> = {};
  for (const [lang, value] of Object.entries(i18nValues)) {
    if (isPlateEditorEmpty(value)) {
      result[lang] = "";
    } else if (value && Array.isArray(value)) {
      result[lang] = JSON.stringify(value);
    }
  }
  return result;
}

export function parsePlateI18nFromJson(
  i18nJson: Record<string, string> | null | undefined,
  languageCodes: string[],
  emptyEditorValue: Value
): Record<string, Value> {
  const result: Record<string, Value> = {};

  for (const lang of languageCodes) {
    result[lang] = parsePlateValue(i18nJson?.[lang], emptyEditorValue);
  }

  return result;
}

export function getFilledLanguagesFromPlateI18n(
  i18nValues: Record<string, Value> | null | undefined
): string[] {
  if (!i18nValues) return [];

  return Object.entries(i18nValues)
    .filter(([, value]) => !isPlateEditorEmpty(value))
    .map(([lang]) => lang);
}

/**
 * Convert plain text into a plate value, one paragraph per line.
 */
export function plainTextToPlateValue(text: string): Value {
  return text.split(/\r?\n/).map((line) => ({ type: "p", children: [{ text: line }] }));
}

/**
 * Parse a persisted editor string into a plate value. Accepts the JSON the
 * editor serializes; any non-JSON string is treated as plain text and becomes
 * one paragraph per line, so records that predate the editor keep their
 * content when opened for editing instead of resetting to empty.
 */
export function parsePlateValue(
  raw: string | null | undefined,
  emptyEditorValue: Value
): Value {
  if (!raw || raw.trim() === "") return emptyEditorValue;
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as Value;
    } catch {
      // Not the editor's JSON — fall through to the plain-text path.
    }
  }
  return plainTextToPlateValue(raw);
}

/**
 * Extract the plain text of a persisted editor value for excerpts (list
 * cells, tooltips, search snippets). Accepts the serialized JSON string, a
 * plain-text string, or a parsed value; block boundaries collapse to spaces.
 */
export function plateValueToText(value: string | Value | null | undefined): string {
  if (value == null) return "";
  let nodes: unknown = value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return "";
    if (!trimmed.startsWith("[")) return value;
    try {
      nodes = JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  if (!Array.isArray(nodes)) return typeof value === "string" ? value : "";
  const parts: string[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const text = (node as { text?: unknown }).text;
    if (typeof text === "string") {
      if (text) parts.push(text);
      return;
    }
    const children = (node as { children?: unknown }).children;
    if (Array.isArray(children)) children.forEach(walk);
  };
  nodes.forEach(walk);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
