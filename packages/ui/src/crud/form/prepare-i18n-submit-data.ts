/**
 * Populate plain fields from their i18n counterparts before form submission.
 *
 * For each entry in `i18nFields`, extracts the `defaultLang` value from the i18n map
 * and sets it on the corresponding plain field.
 */
export function prepareI18nSubmitData<T>(
  formData: Record<string, unknown>,
  options: {
    i18nFields: Record<string, string>;  // { i18nFieldName: plainFieldName }
    defaultLang: string;                  // e.g., "ko"
  },
): T {
  const result = { ...formData };

  for (const [i18nField, plainField] of Object.entries(options.i18nFields)) {
    const i18nValue = result[i18nField];
    if (i18nValue && typeof i18nValue === "object" && !Array.isArray(i18nValue)) {
      const map = i18nValue as Record<string, string>;
      const defaultValue = map[options.defaultLang];
      if (defaultValue && defaultValue.trim() !== "") {
        result[plainField] = defaultValue;
      } else {
        // Fallback: first non-empty value, then empty string
        const firstNonEmpty = Object.values(map).find((v) => v && v.trim() !== "");
        result[plainField] = firstNonEmpty ?? "";
      }
    }
  }

  return result as T;
}
