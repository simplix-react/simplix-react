import { describe, it, expect, vi, beforeEach } from "vitest";
import { I18nextAdapter } from "../i18next-adapter.js";

describe("I18nextAdapter", () => {
  let adapter: I18nextAdapter;

  beforeEach(() => {
    adapter = new I18nextAdapter({
      defaultLocale: "en",
      fallbackLocale: "en",
      resources: {
        en: {
          translation: {
            greeting: "Hello",
            greeting_with_name: "Hello, {{name}}!",
            item_one: "{{count}} item",
            item_other: "{{count}} items",
          },
          common: {
            title: "My App",
            welcome: "Welcome, {{user}}!",
          },
        },
        ko: {
          translation: {
            greeting: "안녕하세요",
            greeting_with_name: "안녕하세요, {{name}}!",
            item_one: "{{count}}개 항목",
            item_other: "{{count}}개 항목",
          },
          common: {
            title: "내 앱",
            welcome: "환영합니다, {{user}}!",
          },
        },
      },
    });
  });

  describe("constructor defaults", () => {
    it("uses 'en' as default locale when no options provided", () => {
      const a = new I18nextAdapter();
      expect(a.fallbackLocale).toBe("en");
    });

    it("uses provided defaultLocale and fallbackLocale", () => {
      expect(adapter.fallbackLocale).toBe("en");
    });
  });

  describe("initialize", () => {
    it("initializes the i18next instance", async () => {
      await adapter.initialize();
      expect(adapter.locale).toBe("en");
    });

    it("initializes with a custom default locale", async () => {
      await adapter.initialize("ko");
      expect(adapter.locale).toBe("ko");
    });

    it("is idempotent (calling twice does not throw)", async () => {
      await adapter.initialize();
      await adapter.initialize();
      expect(adapter.locale).toBe("en");
    });
  });

  describe("id and name", () => {
    it("returns correct adapter id", () => {
      expect(adapter.id).toBe("i18next");
    });

    it("returns correct adapter name", () => {
      expect(adapter.name).toBe("i18next Adapter");
    });
  });

  describe("availableLocales", () => {
    it("returns configured locale codes", () => {
      const locales = adapter.availableLocales;
      expect(locales).toContain("en");
      expect(locales).toContain("ko");
      expect(locales).toContain("ja");
    });
  });

  describe("setLocale", () => {
    it("changes the active locale", async () => {
      await adapter.initialize();
      await adapter.setLocale("ko");
      expect(adapter.locale).toBe("ko");
    });

    it("throws for unsupported locale", async () => {
      await adapter.initialize();
      await expect(adapter.setLocale("xx")).rejects.toThrow(
        "Unsupported locale: xx",
      );
    });
  });

  describe("t (translation)", () => {
    it("translates a simple key", async () => {
      await adapter.initialize();
      expect(adapter.t("greeting")).toBe("Hello");
    });

    it("translates with interpolation values", async () => {
      await adapter.initialize();
      expect(adapter.t("greeting_with_name", { name: "Alice" })).toBe(
        "Hello, Alice!",
      );
    });

    it("returns the translated text in the current locale", async () => {
      await adapter.initialize("ko");
      expect(adapter.t("greeting")).toBe("안녕하세요");
    });
  });

  describe("tn (namespaced translation)", () => {
    it("translates a namespaced key", async () => {
      await adapter.initialize();
      expect(adapter.tn("common", "title")).toBe("My App");
    });

    it("translates a namespaced key with values", async () => {
      await adapter.initialize();
      expect(adapter.tn("common", "welcome", { user: "Bob" })).toBe(
        "Welcome, Bob!",
      );
    });
  });

  describe("tp (plural translation)", () => {
    it("translates singular form", async () => {
      await adapter.initialize();
      expect(adapter.tp("item", 1)).toBe("1 item");
    });

    it("translates plural form", async () => {
      await adapter.initialize();
      expect(adapter.tp("item", 5)).toBe("5 items");
    });
  });

  describe("exists", () => {
    it("returns true for existing key", async () => {
      await adapter.initialize();
      expect(adapter.exists("greeting")).toBe(true);
    });

    it("returns false for non-existing key", async () => {
      await adapter.initialize();
      expect(adapter.exists("nonexistent")).toBe(false);
    });

    it("checks key in specific namespace", async () => {
      await adapter.initialize();
      expect(adapter.exists("title", "common")).toBe(true);
      expect(adapter.exists("nonexistent", "common")).toBe(false);
    });
  });

  describe("getLocaleInfo", () => {
    it("returns locale info for supported locale", () => {
      const info = adapter.getLocaleInfo("en");
      expect(info).not.toBeNull();
      expect(info!.code).toBe("en");
      expect(info!.englishName).toBe("English");
      expect(info!.direction).toBe("ltr");
      expect(info!.currency).toBe("USD");
    });

    it("returns locale info for Korean", () => {
      const info = adapter.getLocaleInfo("ko");
      expect(info).not.toBeNull();
      expect(info!.name).toBe("한국어");
      expect(info!.currency).toBe("KRW");
    });

    it("returns null for unsupported locale", () => {
      expect(adapter.getLocaleInfo("xx")).toBeNull();
    });
  });

  describe("formatNumber", () => {
    it("formats a number with default options", async () => {
      await adapter.initialize();
      const result = adapter.formatNumber(1234.5);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("formats a number with currency style", async () => {
      await adapter.initialize();
      const result = adapter.formatNumber(1234.5, {
        style: "currency",
        currency: "USD",
      });
      expect(result).toContain("1,234.50");
    });

    it("formats a number with fraction digits", async () => {
      await adapter.initialize();
      const result = adapter.formatNumber(1234, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(result).toContain("1,234.00");
    });
  });

  describe("formatCurrency", () => {
    it("formats currency using locale default", async () => {
      await adapter.initialize();
      const result = adapter.formatCurrency(100);
      expect(result).toBeTruthy();
      expect(result).toContain("100");
    });

    it("formats currency with explicit currency code", async () => {
      await adapter.initialize();
      const result = adapter.formatCurrency(100, "EUR");
      expect(result).toBeTruthy();
    });
  });

  describe("formatDate", () => {
    it("formats a date with default options", async () => {
      await adapter.initialize();
      const date = new Date(2025, 0, 15);
      const result = adapter.formatDate(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("formats a date with dateStyle option", async () => {
      await adapter.initialize();
      const date = new Date(2025, 0, 15);
      const result = adapter.formatDate(date, { dateStyle: "long" });
      expect(result).toBeTruthy();
      expect(result).toContain("2025");
    });
  });

  describe("formatTime", () => {
    it("formats time with default options", async () => {
      await adapter.initialize();
      const date = new Date(2025, 0, 15, 14, 30, 0);
      const result = adapter.formatTime(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("formats time with hour12 option", async () => {
      await adapter.initialize();
      const date = new Date(2025, 0, 15, 14, 30, 0);
      const result = adapter.formatTime(date, { hour12: true });
      expect(result).toBeTruthy();
    });

    it("formats time with timeStyle option", async () => {
      await adapter.initialize();
      const date = new Date(2025, 0, 15, 14, 30, 0);
      const result = adapter.formatTime(date, { timeStyle: "short" });
      expect(result).toBeTruthy();
    });
  });

  describe("formatDateTime", () => {
    it("formats date and time with default options", async () => {
      await adapter.initialize();
      const date = new Date(2025, 0, 15, 14, 30, 0);
      const result = adapter.formatDateTime(date);
      expect(result).toBeTruthy();
      expect(result).toContain("2025");
    });

    it("formats with explicit dateStyle and timeStyle", async () => {
      await adapter.initialize();
      const date = new Date(2025, 0, 15, 14, 30, 0);
      const result = adapter.formatDateTime(date, {
        dateStyle: "short",
        timeStyle: "short",
      });
      expect(result).toBeTruthy();
    });
  });

  describe("formatRelativeTime", () => {
    it("formats a recent past date", async () => {
      await adapter.initialize();
      const date = new Date(Date.now() - 30_000); // 30 seconds ago
      const result = adapter.formatRelativeTime(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("formats a date minutes ago", async () => {
      await adapter.initialize();
      const date = new Date(Date.now() - 5 * 60_000); // 5 minutes ago
      const result = adapter.formatRelativeTime(date);
      expect(result).toBeTruthy();
    });

    it("formats a date hours ago", async () => {
      await adapter.initialize();
      const date = new Date(Date.now() - 3 * 60 * 60_000); // 3 hours ago
      const result = adapter.formatRelativeTime(date);
      expect(result).toBeTruthy();
    });

    it("formats a date days ago", async () => {
      await adapter.initialize();
      const date = new Date(Date.now() - 3 * 24 * 60 * 60_000); // 3 days ago
      const result = adapter.formatRelativeTime(date);
      expect(result).toBeTruthy();
    });
  });

  describe("loadTranslations", () => {
    it("loads additional translations at runtime", async () => {
      await adapter.initialize();
      adapter.loadTranslations("en", "custom", { hello: "Hi there" });
      expect(adapter.tn("custom", "hello")).toBe("Hi there");
    });
  });

  describe("getLoadState", () => {
    it("returns 'idle' before initialization", () => {
      expect(adapter.getLoadState("en")).toBe("idle");
    });

    it("returns 'loaded' for loaded bundle", async () => {
      await adapter.initialize();
      expect(adapter.getLoadState("en", "translation")).toBe("loaded");
    });

    it("returns 'idle' for unloaded namespace", async () => {
      await adapter.initialize();
      expect(adapter.getLoadState("en", "nonexistent")).toBe("idle");
    });
  });

  describe("onLocaleChange", () => {
    it("notifies handlers on locale change", async () => {
      await adapter.initialize();
      const handler = vi.fn();
      adapter.onLocaleChange(handler);
      await adapter.setLocale("ko");
      expect(handler).toHaveBeenCalledWith("ko");
    });

    it("returns unsubscribe function", async () => {
      await adapter.initialize();
      const handler = vi.fn();
      const unsubscribe = adapter.onLocaleChange(handler);
      unsubscribe();
      await adapter.setLocale("ko");
      expect(handler).not.toHaveBeenCalled();
    });

    it("handles errors in locale change handlers gracefully", async () => {
      await adapter.initialize();
      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const errorHandler = () => {
        throw new Error("handler error");
      };
      adapter.onLocaleChange(errorHandler);
      await adapter.setLocale("ko");
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe("dispose", () => {
    it("clears handlers and resets initialized state", async () => {
      await adapter.initialize();
      const handler = vi.fn();
      adapter.onLocaleChange(handler);
      await adapter.dispose();
      // After dispose, getLoadState should return "idle"
      expect(adapter.getLoadState("en")).toBe("idle");
    });
  });

  describe("addResources", () => {
    it("adds resources that are then translatable", async () => {
      await adapter.initialize();
      adapter.addResources("en", "extra", { msg: "Extra message" });
      expect(adapter.tn("extra", "msg")).toBe("Extra message");
    });
  });

  describe("getI18nextInstance", () => {
    it("returns the underlying i18next instance", () => {
      const instance = adapter.getI18nextInstance();
      expect(instance).toBeDefined();
      expect(typeof instance.t).toBe("function");
    });
  });

  describe("custom i18next instance", () => {
    it("accepts an external i18next instance", async () => {
      const i18next = await import("i18next");
      const customInstance = i18next.default.createInstance();
      const customAdapter = new I18nextAdapter({
        i18nextInstance: customInstance,
        resources: {
          en: { translation: { test: "test value" } },
        },
      });
      await customAdapter.initialize();
      expect(customAdapter.t("test")).toBe("test value");
    });
  });
});
