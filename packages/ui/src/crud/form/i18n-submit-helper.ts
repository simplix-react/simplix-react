import type { LocaleOption } from "@simplix-react/i18n/react";

/**
 * Resolve a fallback value from an i18n map, honoring locale config order.
 *
 * Walks the supplied `locales` (typically `useLocalePicker().locales`) in order,
 * returning the first non-blank entry whose `value` exists in `i18nMap`. Falls back
 * to an empty string when no locale yields a non-blank value.
 *
 * NOT exported from `@simplix-react/ui` package public API (internal helper for
 * `useCrudFormSubmit`'s `i18nFields` option).
 */
export function applyI18nFallback(
  i18nMap: Record<string, string> | null | undefined,
  locales: ReadonlyArray<Pick<LocaleOption, "value">>,
): string {
  if (!i18nMap) return "";
  for (const { value } of locales) {
    const candidate = i18nMap[value];
    if (typeof candidate === "string" && candidate.trim() !== "") {
      return candidate;
    }
  }
  return "";
}
