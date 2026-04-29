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
    const jsonStr = i18nJson?.[lang];
    if (jsonStr && jsonStr.trim() !== "") {
      try {
        result[lang] = JSON.parse(jsonStr) as Value;
      } catch {
        console.warn(`[parsePlateI18nFromJson] Invalid JSON for lang "${lang}", using empty value`);
        result[lang] = emptyEditorValue;
      }
    } else {
      result[lang] = emptyEditorValue;
    }
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
