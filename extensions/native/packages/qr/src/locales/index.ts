import {
  buildModuleTranslations,
  registerModuleTranslations,
} from "@simplix-react/i18n";
import en from "./en.json";
import ko from "./ko.json";
import ja from "./ja.json";

const translations = buildModuleTranslations({
  namespace: "simplix",
  locales: ["en", "ko", "ja"],
  components: {
    "native-qr": {
      // Static imports keep locale JSON in the main bundle; a lazy import() from
      // this out-of-root linked package breaks Metro dev async-chunk resolution.
      en: () => Promise.resolve({ default: en }),
      ko: () => Promise.resolve({ default: ko }),
      ja: () => Promise.resolve({ default: ja }),
    },
  },
});

registerModuleTranslations(translations);
