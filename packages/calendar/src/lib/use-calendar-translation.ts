import { useTranslation } from "@simplix-react/i18n/react";

import { PACKAGE_NAMESPACE } from "../locales";
import { getDateLocale } from "./date-locale";

/**
 * Calendar-scoped translation hook: resolves the active language and its
 * matching date-fns `Locale` in one call so components stay terse.
 */
export function useCalendarTranslation() {
  const { t, locale: language } = useTranslation(PACKAGE_NAMESPACE);
  const locale = getDateLocale(language);
  return { t, language, locale };
}
