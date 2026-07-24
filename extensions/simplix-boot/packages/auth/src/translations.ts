import { registerDomainTranslations } from "@simplix-react/i18n";
import en from "./locales/en.json";
import ko from "./locales/ko.json";
import ja from "./locales/ja.json";

registerDomainTranslations({
  domain: "auth",
  locales: {
    // Static imports: this package ships from dist and is linked outside the app
    // project root, where Metro cannot resolve a lazy import() async chunk.
    en: () => Promise.resolve({ default: en }),
    ko: () => Promise.resolve({ default: ko }),
    ja: () => Promise.resolve({ default: ja }),
  },
});
