import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

const translations = buildModuleTranslations({
  namespace: "simplix",
  locales: ["en", "ko", "ja"],
  components: {
    ui: {
      en: () => import("./en.json"),
      ko: () => import("./ko.json"),
      ja: () => import("./ja.json"),
    },
  },
});

registerModuleTranslations(translations);
