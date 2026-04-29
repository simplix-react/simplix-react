// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { I18nProvider } from "../react/i18n-provider.js";
import { useLocalizedText } from "../react/use-localized-text.js";
import type { II18nAdapter } from "../adapter.js";

function createMockAdapter(locale: string): II18nAdapter {
  const listeners = new Set<(locale: string) => void>();
  return {
    id: "mock",
    name: "Mock",
    get locale() { return locale; },
    fallbackLocale: "en",
    availableLocales: ["en", "ko", "ja"],
    initialize: async () => {},
    dispose: async () => {},
    setLocale: async () => {},
    getLocaleInfo: () => null,
    t: (key: string) => key,
    tn: (ns: string, key: string) => `${ns}:${key}`,
    tp: (key: string, count: number) => `${key}:${count}`,
    exists: () => false,
    onLocaleChange: (handler: (locale: string) => void) => {
      listeners.add(handler);
      return () => { listeners.delete(handler); };
    },
  };
}

function makeWrapper(locale: string) {
  return ({ children }: { children: ReactNode }) =>
    createElement(I18nProvider, { adapter: createMockAdapter(locale) }, children);
}

describe("useLocalizedText", () => {
  it("returns current locale value when present", () => {
    const { result } = renderHook(() => useLocalizedText(), {
      wrapper: makeWrapper("ko"),
    });
    const localized = result.current;
    expect(localized({ en: "Hello", ko: "안녕" })).toBe("안녕");
  });

  it("returns first non-empty value when current locale misses", () => {
    const { result } = renderHook(() => useLocalizedText(), {
      wrapper: makeWrapper("ja"),
    });
    const localized = result.current;
    expect(localized({ en: "Hello", ko: "안녕" })).toBe("Hello");
  });

  it("returns fallback when all values are empty", () => {
    const { result } = renderHook(() => useLocalizedText(), {
      wrapper: makeWrapper("ko"),
    });
    const localized = result.current;
    expect(localized({ en: "", ko: "" }, "—")).toBe("—");
  });

  it("returns fallback when map is null", () => {
    const { result } = renderHook(() => useLocalizedText(), {
      wrapper: makeWrapper("ko"),
    });
    const localized = result.current;
    expect(localized(null, "—")).toBe("—");
  });

  it("treats whitespace-only value as empty", () => {
    const { result } = renderHook(() => useLocalizedText(), {
      wrapper: makeWrapper("ko"),
    });
    const localized = result.current;
    expect(localized({ en: "Hello", ko: "   " })).toBe("Hello");
  });
});
