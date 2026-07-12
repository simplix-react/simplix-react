import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

/**
 * i18next namespace all calendar-core components translate against.
 *
 * The framework composes the effective namespace as `<module>/<component>`, so
 * the module registers under `"simplix-calendar"` while components read the flat
 * `"simplix-calendar/calendar"` bundle via {@link useTranslation}.
 */
export const PACKAGE_NAMESPACE = "simplix-calendar/calendar";

const translations = buildModuleTranslations({
  namespace: "simplix-calendar",
  locales: ["en", "ko", "ja"],
  components: {
    calendar: {
      en: () => import("./en.json"),
      ko: () => import("./ko.json"),
      ja: () => import("./ja.json"),
    },
  },
});

registerModuleTranslations(translations);
