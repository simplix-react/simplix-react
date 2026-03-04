import { registerDomainTranslations } from "@simplix-react/i18n";

registerDomainTranslations({
  domain: "auth",
  locales: {
    en: () => import("./locales/en.json"),
    ko: () => import("./locales/ko.json"),
    ja: () => import("./locales/ja.json"),
  },
});
