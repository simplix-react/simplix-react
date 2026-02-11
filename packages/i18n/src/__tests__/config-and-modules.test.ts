import { describe, it, expect } from "vitest";
import { createI18nConfig } from "../create-i18n-config.js";
import { buildModuleTranslations } from "../module-translations.js";
import { DEFAULT_LOCALES, SUPPORTED_LOCALES } from "../utils/locale-config.js";

describe("createI18nConfig", () => {
  it("returns adapter and i18nReady promise", () => {
    const result = createI18nConfig({});
    expect(result.adapter).toBeDefined();
    expect(result.i18nReady).toBeInstanceOf(Promise);
  });

  it("initializes adapter with defaultLocale", async () => {
    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "ko",
    });
    await i18nReady;
    expect(adapter.locale).toBe("ko");
  });

  it("uses 'en' as default when no locale specified", async () => {
    const { adapter, i18nReady } = createI18nConfig({});
    await i18nReady;
    expect(adapter.locale).toBe("en");
  });

  it("loads app translations from Vite glob pattern", async () => {
    const appTranslations = {
      "/locales/common/en.json": { default: { greeting: "Hello" } },
      "/locales/common/ko.json": { default: { greeting: "안녕하세요" } },
    };

    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "en",
      appTranslations,
    });

    await i18nReady;
    expect(adapter.tn("common", "greeting")).toBe("Hello");
  });

  it("handles app translations without default export wrapper", async () => {
    const appTranslations = {
      "/locales/common/en.json": { greeting: "Hi" },
    };

    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "en",
      appTranslations,
    });

    await i18nReady;
    expect(adapter.tn("common", "greeting")).toBe("Hi");
  });

  it("skips files that don't match the locale path pattern", async () => {
    const appTranslations = {
      "/locales/common/en.json": { default: { greeting: "Hello" } },
      "/some/random/path.json": { default: { nope: "ignored" } },
    };

    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "en",
      appTranslations,
    });

    await i18nReady;
    expect(adapter.tn("common", "greeting")).toBe("Hello");
  });

  it("loads module translations", async () => {
    const moduleTranslations = buildModuleTranslations({
      namespace: "dashboard",
      locales: ["en"],
      components: {
        header: {
          en: () =>
            Promise.resolve({ default: { title: "Dashboard Header" } }),
        },
      },
    });

    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "en",
      moduleTranslations: [moduleTranslations],
    });

    await i18nReady;
    expect(adapter.tn("dashboard/header", "title")).toBe("Dashboard Header");
  });

  it("accepts custom supportedLocales", async () => {
    const customLocales = [
      {
        code: "fr",
        name: "Français",
        englishName: "French",
        direction: "ltr" as const,
        currency: "EUR",
      },
    ];

    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "fr",
      supportedLocales: customLocales,
    });

    await i18nReady;
    expect(adapter.availableLocales).toEqual(["fr"]);
  });
});

describe("buildModuleTranslations", () => {
  it("returns namespace, locales, and load function", () => {
    const result = buildModuleTranslations({
      namespace: "orders",
      locales: ["en", "ko"],
      components: {},
    });

    expect(result.namespace).toBe("orders");
    expect(result.locales).toEqual(["en", "ko"]);
    expect(typeof result.load).toBe("function");
  });

  it("loads translations for a given locale", async () => {
    const result = buildModuleTranslations({
      namespace: "orders",
      locales: ["en"],
      components: {
        list: {
          en: () =>
            Promise.resolve({ default: { title: "Order List" } }),
        },
        detail: {
          en: () =>
            Promise.resolve({ default: { title: "Order Detail" } }),
        },
      },
    });

    const translations = await result.load("en");
    expect(translations.list).toEqual({ title: "Order List" });
    expect(translations.detail).toEqual({ title: "Order Detail" });
  });

  it("handles missing locale loader gracefully", async () => {
    const result = buildModuleTranslations({
      namespace: "orders",
      locales: ["en", "ko"],
      components: {
        list: {
          en: () =>
            Promise.resolve({ default: { title: "Order List" } }),
          // ko loader missing
        },
      },
    });

    const translations = await result.load("ko");
    // No "list" key since ko loader is missing
    expect(translations.list).toBeUndefined();
  });

  it("handles module without default export", async () => {
    const result = buildModuleTranslations({
      namespace: "orders",
      locales: ["en"],
      components: {
        list: {
          en: () =>
            Promise.resolve({ title: "Direct Export" } as unknown as {
              default: Record<string, unknown>;
            }),
        },
      },
    });

    const translations = await result.load("en");
    expect(translations.list).toBeDefined();
  });
});

describe("DEFAULT_LOCALES", () => {
  it("contains ko, en, and ja", () => {
    const codes = DEFAULT_LOCALES.map((l) => l.code);
    expect(codes).toEqual(["ko", "en", "ja"]);
  });

  it("has correct structure for each locale", () => {
    for (const locale of DEFAULT_LOCALES) {
      expect(locale.code).toBeTruthy();
      expect(locale.name).toBeTruthy();
      expect(locale.englishName).toBeTruthy();
      expect(locale.direction).toBe("ltr");
      expect(locale.currency).toBeTruthy();
    }
  });
});

describe("SUPPORTED_LOCALES", () => {
  it("lists locale codes from DEFAULT_LOCALES", () => {
    expect(SUPPORTED_LOCALES).toEqual(["ko", "en", "ja"]);
  });
});
