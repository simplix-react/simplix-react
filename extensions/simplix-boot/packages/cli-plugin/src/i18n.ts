// --- Server response types ---

interface I18nFieldTranslations {
  translations: Record<string, string>;
}

interface I18nEntityMessages {
  fields: Record<string, I18nFieldTranslations>;
}

interface I18nEnumMessages {
  values: Record<string, I18nFieldTranslations>;
}

interface I18nMessagesResponse {
  entities: Record<string, I18nEntityMessages>;
  enums?: Record<string, I18nEnumMessages>;
}

// --- Download ---

export async function downloadI18nMessages(
  serverOrigin: string,
  endpoint: string,
): Promise<I18nMessagesResponse | undefined> {
  const url = `${serverOrigin}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`i18n download failed: ${res.status} ${res.statusText} (${url})`);
      return undefined;
    }

    return (await res.json()) as I18nMessagesResponse;
  } catch (err) {
    console.warn(`i18n download failed: ${err instanceof Error ? err.message : String(err)} (${url})`);
    return undefined;
  }
}

// --- Entity key mapping ---

interface EntityKeyInfo {
  pascalName: string;
  name: string;
}

/**
 * Map server entity keys (PascalCase) → domain entity keys (camelCase).
 */
export function buildEntityKeyMap(
  entities: EntityKeyInfo[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const entity of entities) {
    map.set(entity.pascalName, entity.name);
  }
  return map;
}

// --- Transform server data → domain locale format ---

/**
 * Convert server i18n response to per-locale domain JSON.
 * Returns Map<locale, Record<entityName, { fields: { ... } }>>
 */
export function transformToLocaleData(
  serverData: I18nMessagesResponse,
  entityKeyMap: Map<string, string>,
  locales: string[],
): Map<string, Record<string, unknown>> {
  const result = new Map<string, Record<string, unknown>>();

  for (const locale of locales) {
    const localeData: Record<string, unknown> = {};

    // Transform entity fields
    for (const [pascalKey, entityMessages] of Object.entries(serverData.entities)) {
      const entityName = entityKeyMap.get(pascalKey);
      if (!entityName) continue;

      const fields: Record<string, string> = {};
      for (const [fieldName, fieldData] of Object.entries(entityMessages.fields)) {
        const translated = fieldData.translations[locale];
        if (translated) {
          fields[fieldName] = translated;
        }
      }

      if (Object.keys(fields).length > 0) {
        localeData[entityName] = { fields };
      }
    }

    // Transform enums
    if (serverData.enums) {
      const enums: Record<string, Record<string, string>> = {};
      for (const [enumKey, enumMessages] of Object.entries(serverData.enums)) {
        const values: Record<string, string> = {};
        for (const [valueName, valueData] of Object.entries(enumMessages.values)) {
          const translated = valueData.translations[locale];
          if (translated) {
            values[valueName] = translated;
          }
        }
        if (Object.keys(values).length > 0) {
          enums[enumKey] = values;
        }
      }
      if (Object.keys(enums).length > 0) {
        localeData["enums"] = enums;
      }
    }

    if (Object.keys(localeData).length > 0) {
      result.set(locale, localeData);
    }
  }

  return result;
}

// --- Deep merge (overlay wins) ---

/**
 * Deep merge where overlay values take precedence over base.
 */
export function overlayLocaleJson(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };

  for (const [key, overlayValue] of Object.entries(overlay)) {
    const baseValue = result[key];

    if (
      baseValue && typeof baseValue === "object" && !Array.isArray(baseValue) &&
      overlayValue && typeof overlayValue === "object" && !Array.isArray(overlayValue)
    ) {
      result[key] = overlayLocaleJson(
        baseValue as Record<string, unknown>,
        overlayValue as Record<string, unknown>,
      );
    } else {
      result[key] = overlayValue;
    }
  }

  return result;
}
